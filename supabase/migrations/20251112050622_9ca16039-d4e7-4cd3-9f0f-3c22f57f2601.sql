-- Add selected_character column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_character TEXT DEFAULT 'cura' CHECK (selected_character IN ('cura', 'suu', 'luno'));