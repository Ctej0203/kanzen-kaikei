-- Fix ambiguous column reference in perform_gacha function
CREATE OR REPLACE FUNCTION public.perform_gacha(p_user_id uuid, p_roll_count integer)
RETURNS TABLE(item_id uuid, rarity text, is_new boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cost INTEGER;
  v_current_pity INTEGER;
  v_selected_rarity TEXT;
  v_selected_item RECORD;
  v_is_new BOOLEAN;
  v_roll_index INTEGER;
BEGIN
  -- コスト計算
  IF p_roll_count = 1 THEN
    v_cost := 80;
  ELSIF p_roll_count = 11 THEN
    v_cost := 800;
  ELSE
    RAISE EXCEPTION 'Invalid roll count';
  END IF;

  -- コイン消費
  PERFORM public.spend_coins(p_user_id, v_cost, 'gacha');

  -- 現在の天井カウント取得
  SELECT current_count INTO v_current_pity
  FROM public.gacha_pity
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- 初回ガチャ時にレコード作成
    INSERT INTO public.gacha_pity (user_id, current_count)
    VALUES (p_user_id, 0);
    v_current_pity := 0;
  END IF;

  -- p_roll_count回分の抽選
  FOR v_roll_index IN 1..p_roll_count LOOP
    v_current_pity := v_current_pity + 1;

    -- 天井判定（50回でSSR確定）
    IF v_current_pity >= 50 THEN
      v_selected_rarity := 'SSR';
      v_current_pity := 0; -- 天井リセット
    ELSE
      -- 確率抽選
      DECLARE
        v_random FLOAT := random();
      BEGIN
        IF v_random < 0.03 THEN
          v_selected_rarity := 'SSR';
          v_current_pity := 0; -- SSR獲得時リセット
        ELSIF v_random < 0.15 THEN
          v_selected_rarity := 'SR';
        ELSE
          v_selected_rarity := 'R';
        END IF;
      END;
    END IF;

    -- レアリティに応じてアイテム選択
    SELECT * INTO v_selected_item
    FROM public.items
    WHERE items.rarity = v_selected_rarity
      AND items.is_default = false
    ORDER BY random()
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'No items found for rarity %', v_selected_rarity;
    END IF;

    -- 既所持チェック
    SELECT EXISTS(
      SELECT 1 FROM public.user_items
      WHERE user_items.user_id = p_user_id AND user_items.item_id = v_selected_item.id
    ) INTO v_is_new;

    v_is_new := NOT v_is_new;

    IF v_is_new THEN
      -- 新規アイテムを追加
      INSERT INTO public.user_items (user_id, item_id, obtained_at)
      VALUES (p_user_id, v_selected_item.id, NOW());
    ELSE
      -- 重複時は20コイン返却
      PERFORM public.add_coins(p_user_id, 20, 'gacha_duplicate');
    END IF;

    -- ガチャ履歴記録
    INSERT INTO public.gacha_history (user_id, item_id, cost, roll_number)
    VALUES (p_user_id, v_selected_item.id, v_cost / p_roll_count, v_current_pity);

    -- 結果を返す（明示的にカラム名を指定）
    RETURN QUERY SELECT v_selected_item.id::uuid, v_selected_item.rarity::text, v_is_new::boolean;
  END LOOP;

  -- 天井カウント更新
  UPDATE public.gacha_pity
  SET current_count = v_current_pity,
      last_ssr_at = CASE WHEN v_selected_rarity = 'SSR' THEN NOW() ELSE last_ssr_at END
  WHERE gacha_pity.user_id = p_user_id;
END;
$function$;