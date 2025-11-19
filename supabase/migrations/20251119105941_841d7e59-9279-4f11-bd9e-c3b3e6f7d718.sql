-- Add field to track last chat affection date
ALTER TABLE public.profiles 
ADD COLUMN last_chat_affection_date DATE;

-- Update the claim_daily_login_bonus function to increase affection for selected character
CREATE OR REPLACE FUNCTION public.claim_daily_login_bonus(p_user_id uuid)
RETURNS TABLE(coins_earned integer, current_streak integer, is_new_day boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_last_login DATE;
  v_current_streak INTEGER;
  v_today DATE := CURRENT_DATE;
  v_coins_to_award INTEGER;
  v_login_history JSONB;
  v_is_new_day BOOLEAN := false;
  v_selected_character TEXT;
BEGIN
  -- 既存のストリーク情報取得
  SELECT last_login_date, login_streaks.current_streak, login_history
  INTO v_last_login, v_current_streak, v_login_history
  FROM public.login_streaks
  WHERE user_id = p_user_id;

  -- 初回ログインの場合
  IF NOT FOUND THEN
    v_current_streak := 1;
    v_coins_to_award := 10;
    v_is_new_day := true;
    v_login_history := jsonb_build_array(jsonb_build_object('date', v_today, 'day', 1));
    
    INSERT INTO public.login_streaks (user_id, last_login_date, current_streak, login_history)
    VALUES (p_user_id, v_today, v_current_streak, v_login_history);
  
  -- 今日既にログインしている場合
  ELSIF v_last_login = v_today THEN
    RETURN QUERY SELECT 0, v_current_streak, false;
    RETURN;
  
  -- 昨日ログインしていた場合（連続ログイン）
  ELSIF v_last_login = v_today - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
    IF v_current_streak > 7 THEN
      v_current_streak := 1;
    END IF;
    v_is_new_day := true;
    
  -- ログインが途切れた場合
  ELSE
    v_current_streak := 1;
    v_is_new_day := true;
  END IF;

  -- ストリーク日数に応じてコインを計算
  IF v_is_new_day THEN
    CASE v_current_streak
      WHEN 1 THEN v_coins_to_award := 10;
      WHEN 2 THEN v_coins_to_award := 15;
      WHEN 3 THEN v_coins_to_award := 30;
      WHEN 4 THEN v_coins_to_award := 15;
      WHEN 5 THEN v_coins_to_award := 20;
      WHEN 6 THEN v_coins_to_award := 20;
      WHEN 7 THEN v_coins_to_award := 40;
      ELSE v_coins_to_award := 10;
    END CASE;

    -- コイン付与
    PERFORM public.add_coins(p_user_id, v_coins_to_award, 'daily_login');

    -- ログイン履歴更新（直近30日分のみ保持）
    v_login_history := (
      SELECT jsonb_agg(item)
      FROM (
        SELECT jsonb_array_elements(COALESCE(v_login_history, '[]'::jsonb)) AS item
        UNION ALL
        SELECT jsonb_build_object('date', v_today, 'day', v_current_streak)
        ORDER BY (item->>'date')::date DESC
        LIMIT 30
      ) subq
    );

    -- ストリーク情報更新
    UPDATE public.login_streaks
    SET last_login_date = v_today,
        current_streak = v_current_streak,
        login_history = v_login_history,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- 選択中のキャラクターの好感度を+1
    SELECT selected_character INTO v_selected_character
    FROM public.profiles
    WHERE user_id = p_user_id;

    IF v_selected_character IS NOT NULL THEN
      PERFORM public.increase_character_affection(p_user_id, v_selected_character, 1);
    END IF;
  END IF;

  RETURN QUERY SELECT v_coins_to_award, v_current_streak, v_is_new_day;
END;
$function$;