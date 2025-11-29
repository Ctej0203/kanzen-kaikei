-- Fix the claim_daily_login_bonus function to resolve SQL error
DROP FUNCTION IF EXISTS public.claim_daily_login_bonus(uuid);

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
  -- Get existing streak information
  SELECT last_login_date, login_streaks.current_streak, login_history
  INTO v_last_login, v_current_streak, v_login_history
  FROM public.login_streaks
  WHERE user_id = p_user_id;

  -- First time login
  IF NOT FOUND THEN
    v_current_streak := 1;
    v_coins_to_award := 10;
    v_is_new_day := true;
    v_login_history := jsonb_build_array(jsonb_build_object('date', v_today, 'day', 1));
    
    INSERT INTO public.login_streaks (user_id, last_login_date, current_streak, login_history)
    VALUES (p_user_id, v_today, v_current_streak, v_login_history);
  
  -- Already logged in today
  ELSIF v_last_login = v_today THEN
    coins_earned := 0;
    current_streak := v_current_streak;
    is_new_day := false;
    RETURN NEXT;
    RETURN;
  
  -- Consecutive login (yesterday)
  ELSIF v_last_login = v_today - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
    IF v_current_streak > 7 THEN
      v_current_streak := 1;
    END IF;
    v_is_new_day := true;
    
  -- Streak broken
  ELSE
    v_current_streak := 1;
    v_is_new_day := true;
  END IF;

  -- Calculate coins based on streak day
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

    -- Award coins
    PERFORM public.add_coins(p_user_id, v_coins_to_award, 'daily_login');

    -- Update login history (keep last 30 days)
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

    -- Update streak information
    UPDATE public.login_streaks
    SET last_login_date = v_today,
        login_streaks.current_streak = v_current_streak,
        login_history = v_login_history,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Increase affection for selected character
    SELECT selected_character INTO v_selected_character
    FROM public.profiles
    WHERE user_id = p_user_id;

    IF v_selected_character IS NOT NULL THEN
      PERFORM public.increase_character_affection(p_user_id, v_selected_character, 1);
    END IF;
  END IF;

  -- Return results explicitly
  coins_earned := v_coins_to_award;
  current_streak := v_current_streak;
  is_new_day := v_is_new_day;
  RETURN NEXT;
  RETURN;
END;
$function$;