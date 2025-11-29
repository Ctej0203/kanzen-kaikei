-- Update character affection reward system to progressive rewards
CREATE OR REPLACE FUNCTION public.increase_character_affection(p_user_id uuid, p_character_id text, p_amount integer DEFAULT 1)
 RETURNS TABLE(new_affection integer, coins_awarded integer, threshold_reached integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_affection INTEGER;
  v_new_affection INTEGER;
  v_old_threshold INTEGER;
  v_new_threshold INTEGER;
  v_coins_to_award INTEGER := 0;
  i INTEGER;
BEGIN
  -- Get current affection level
  SELECT COALESCE((character_affection->>p_character_id)::INTEGER, 0)
  INTO v_current_affection
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- Calculate new affection
  v_new_affection := v_current_affection + p_amount;

  -- Calculate thresholds (every 10 levels)
  v_old_threshold := v_current_affection / 10;
  v_new_threshold := v_new_affection / 10;

  -- Check if threshold was crossed
  IF v_new_threshold > v_old_threshold THEN
    -- Award coins for each threshold crossed with progressive rewards
    -- Level 10: 80 coins, Level 20: 120 coins, Level 30: 160 coins (+40 each time)
    FOR i IN (v_old_threshold + 1)..v_new_threshold LOOP
      v_coins_to_award := v_coins_to_award + (40 * (i + 1));
    END LOOP;
    PERFORM public.add_coins(p_user_id, v_coins_to_award, 'affection_reward');
  END IF;

  -- Update affection in profile
  UPDATE public.profiles
  SET character_affection = jsonb_set(
    COALESCE(character_affection, '{}'::jsonb),
    ARRAY[p_character_id],
    to_jsonb(v_new_affection)
  )
  WHERE user_id = p_user_id;

  -- Return results
  RETURN QUERY SELECT 
    v_new_affection,
    v_coins_to_award,
    v_new_threshold * 10;
END;
$function$;