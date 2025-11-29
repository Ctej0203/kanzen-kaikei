-- Update AI quota system to daily reset (10 messages per day)
CREATE OR REPLACE FUNCTION public.increment_ai_quota(
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reset_at TIMESTAMP WITH TIME ZONE;
  v_messages_used INTEGER;
BEGIN
  -- Get current quota record
  SELECT reset_at, free_messages_used INTO v_reset_at, v_messages_used
  FROM public.ai_quota
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- First time: create record with daily reset
    INSERT INTO public.ai_quota (user_id, free_messages_used, reset_at)
    VALUES (p_user_id, 1, (CURRENT_DATE + INTERVAL '1 day'));
  ELSIF v_reset_at < NOW() THEN
    -- Reset period has passed: reset counter for new day
    UPDATE public.ai_quota
    SET free_messages_used = 1,
        reset_at = (CURRENT_DATE + INTERVAL '1 day')
    WHERE user_id = p_user_id;
  ELSE
    -- Normal increment within same day
    UPDATE public.ai_quota
    SET free_messages_used = free_messages_used + 1
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Add function to check if user has quota remaining
CREATE OR REPLACE FUNCTION public.check_ai_quota(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reset_at TIMESTAMP WITH TIME ZONE;
  v_messages_used INTEGER;
BEGIN
  -- Get current quota
  SELECT reset_at, free_messages_used INTO v_reset_at, v_messages_used
  FROM public.ai_quota
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- First time user: has quota
    RETURN TRUE;
  ELSIF v_reset_at < NOW() THEN
    -- Reset period passed: has quota
    RETURN TRUE;
  ELSIF v_messages_used >= 10 THEN
    -- Used all 10 messages today
    RETURN FALSE;
  ELSE
    -- Still has quota remaining
    RETURN TRUE;
  END IF;
END;
$$;