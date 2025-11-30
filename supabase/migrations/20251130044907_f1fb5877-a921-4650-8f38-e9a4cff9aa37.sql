-- Update ai_quota table to reset daily instead of monthly
ALTER TABLE public.ai_quota 
ALTER COLUMN reset_at SET DEFAULT (CURRENT_DATE + INTERVAL '1 day');

-- Reset all existing records to tomorrow
UPDATE public.ai_quota
SET reset_at = (CURRENT_DATE + INTERVAL '1 day'),
    free_messages_used = 0
WHERE reset_at > (CURRENT_DATE + INTERVAL '2 days');