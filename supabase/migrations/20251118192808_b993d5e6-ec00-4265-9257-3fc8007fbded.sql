-- Add fields for inactive user email tracking to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_email_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS needs_followup boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_due_at timestamp with time zone;

-- Create function to update login tracking
CREATE OR REPLACE FUNCTION public.update_login_tracking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Increment login count
  NEW.login_count := COALESCE(NEW.login_count, 0) + 1;
  
  -- Update last login timestamp
  NEW.last_login_at := NOW();
  
  -- Reset follow-up flag if user logs in after email was sent
  IF NEW.needs_followup = true AND NEW.last_email_sent_at IS NOT NULL THEN
    IF NEW.last_login_at >= NEW.last_email_sent_at THEN
      NEW.needs_followup := false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to track logins
DROP TRIGGER IF EXISTS track_user_login ON public.profiles;
CREATE TRIGGER track_user_login
  BEFORE UPDATE OF last_login_at ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_login_tracking();