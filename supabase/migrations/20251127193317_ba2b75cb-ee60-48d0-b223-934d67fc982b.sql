-- Add mood_expression column to symptom_records table
ALTER TABLE public.symptom_records 
ADD COLUMN mood_expression text;

COMMENT ON COLUMN public.symptom_records.mood_expression IS 'Selected mood expression: sad, normal, or happy';
