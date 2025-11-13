-- Add character_affection column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS character_affection JSONB DEFAULT '{
  "cura": 0,
  "suu": 0,
  "luno": 0
}'::jsonb;

-- Function to increase character affection and award coins at thresholds
CREATE OR REPLACE FUNCTION public.increase_character_affection(
  p_user_id UUID,
  p_character_id TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS TABLE(
  new_affection INTEGER,
  coins_awarded INTEGER,
  threshold_reached INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_current_affection INTEGER;
  v_new_affection INTEGER;
  v_old_threshold INTEGER;
  v_new_threshold INTEGER;
  v_coins_to_award INTEGER := 0;
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
    -- Award coins for each threshold crossed
    v_coins_to_award := (v_new_threshold - v_old_threshold) * 50;
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
$$;