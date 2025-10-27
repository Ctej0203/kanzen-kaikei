-- Add AI score and comment columns to symptom_records table
ALTER TABLE public.symptom_records 
ADD COLUMN IF NOT EXISTS ai_score integer CHECK (ai_score >= 0 AND ai_score <= 100),
ADD COLUMN IF NOT EXISTS ai_comment text;