-- Create record_streaks table to track daily mood logging streaks
CREATE TABLE IF NOT EXISTS public.record_streaks (
  user_id UUID NOT NULL PRIMARY KEY,
  last_record_date DATE NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 1,
  record_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.record_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own record streak"
  ON public.record_streaks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own record streak"
  ON public.record_streaks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own record streak"
  ON public.record_streaks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update record streak when user logs mood
CREATE OR REPLACE FUNCTION public.update_record_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_record_date DATE;
  v_current_streak INTEGER;
  v_record_history JSONB;
  v_today DATE := CURRENT_DATE;
  v_streak_day INTEGER;
BEGIN
  -- Get existing streak data
  SELECT last_record_date, current_streak, record_history
  INTO v_last_record_date, v_current_streak, v_record_history
  FROM record_streaks
  WHERE user_id = NEW.user_id;

  -- If no record exists, create initial streak
  IF v_last_record_date IS NULL THEN
    INSERT INTO record_streaks (user_id, last_record_date, current_streak, record_history)
    VALUES (
      NEW.user_id,
      v_today,
      1,
      jsonb_build_array(jsonb_build_object('date', v_today, 'day', 1))
    );
  ELSE
    -- Check if this is a new day
    IF v_last_record_date < v_today THEN
      -- Check if consecutive (yesterday)
      IF v_last_record_date = v_today - INTERVAL '1 day' THEN
        v_current_streak := v_current_streak + 1;
      ELSE
        -- Streak broken, reset to 1
        v_current_streak := 1;
      END IF;

      -- Calculate streak day (1-7 cycle)
      v_streak_day := ((v_current_streak - 1) % 7) + 1;

      -- Update record history
      v_record_history := v_record_history || jsonb_build_array(
        jsonb_build_object('date', v_today, 'day', v_streak_day)
      );

      -- Keep only last 30 days
      IF jsonb_array_length(v_record_history) > 30 THEN
        v_record_history := v_record_history - 0;
      END IF;

      -- Update streak
      UPDATE record_streaks
      SET 
        last_record_date = v_today,
        current_streak = v_current_streak,
        record_history = v_record_history,
        updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to update record streak after insert
DROP TRIGGER IF EXISTS update_record_streak_trigger ON symptom_records;
CREATE TRIGGER update_record_streak_trigger
  AFTER INSERT ON symptom_records
  FOR EACH ROW
  EXECUTE FUNCTION update_record_streak();