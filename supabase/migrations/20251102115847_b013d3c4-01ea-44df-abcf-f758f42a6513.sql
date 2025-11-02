-- ログインストリークテーブル作成
CREATE TABLE IF NOT EXISTS public.login_streaks (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_login_date DATE NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 1 CHECK (current_streak >= 1 AND current_streak <= 7),
  login_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE public.login_streaks ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view their own login streak"
  ON public.login_streaks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own login streak"
  ON public.login_streaks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own login streak"
  ON public.login_streaks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ログインボーナス付与関数
CREATE OR REPLACE FUNCTION public.claim_daily_login_bonus(p_user_id UUID)
RETURNS TABLE(
  coins_earned INTEGER,
  current_streak INTEGER,
  is_new_day BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_last_login DATE;
  v_current_streak INTEGER;
  v_today DATE := CURRENT_DATE;
  v_coins_to_award INTEGER;
  v_login_history JSONB;
  v_is_new_day BOOLEAN := false;
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
  END IF;

  RETURN QUERY SELECT v_coins_to_award, v_current_streak, v_is_new_day;
END;
$$;

-- 新規ユーザー登録時の処理にlogin_streaks初期化を追加
CREATE OR REPLACE FUNCTION public.handle_new_user_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- user_currencyレコード作成（初期100コイン）
  INSERT INTO public.user_currency (user_id, free_coins)
  VALUES (NEW.id, 100);

  -- デフォルトアイテムを全て付与
  INSERT INTO public.user_items (user_id, item_id, is_equipped)
  SELECT NEW.id, id, (category = 'outfit') -- 最初の衣装のみ装備
  FROM public.items
  WHERE is_default = true;

  -- gacha_pityレコード作成
  INSERT INTO public.gacha_pity (user_id, current_count)
  VALUES (NEW.id, 0);

  -- ai_quotaレコード作成
  INSERT INTO public.ai_quota (user_id, free_messages_used)
  VALUES (NEW.id, 0);

  -- login_streaksレコード作成（初回はログインボーナス別途処理）
  -- 作成しない（初回ログイン時にclaim_daily_login_bonusで作成）

  RETURN NEW;
END;
$$;