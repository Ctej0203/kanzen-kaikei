-- Create mental health records table
CREATE TABLE IF NOT EXISTS public.mental_health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diagnosis_name TEXT,
  symptom_severity TEXT,
  medication_morning TEXT,
  medication_noon TEXT,
  medication_evening TEXT,
  medication_notes TEXT,
  doctor_appointment TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mental_health_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own mental health records"
  ON public.mental_health_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mental health records"
  ON public.mental_health_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mental health records"
  ON public.mental_health_records
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mental health records"
  ON public.mental_health_records
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_mental_health_records_updated_at
  BEFORE UPDATE ON public.mental_health_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();