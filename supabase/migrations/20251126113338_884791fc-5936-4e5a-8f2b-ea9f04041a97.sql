-- Add referral_code to profiles table
ALTER TABLE public.profiles
ADD COLUMN referral_code TEXT UNIQUE;

-- Create referrals tracking table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_given BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(referred_user_id)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_user_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_code;
    
    EXIT WHEN NOT exists_code;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Update existing profiles with referral codes
UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;

-- Function to handle referral on signup
CREATE OR REPLACE FUNCTION public.process_referral(p_referred_user_id UUID, p_referral_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_user_id UUID;
BEGIN
  -- Find referrer by code
  SELECT user_id INTO v_referrer_user_id
  FROM public.profiles
  WHERE referral_code = p_referral_code
  AND user_id != p_referred_user_id;
  
  IF v_referrer_user_id IS NOT NULL THEN
    -- Create referral record
    INSERT INTO public.referrals (referrer_user_id, referred_user_id, reward_given)
    VALUES (v_referrer_user_id, p_referred_user_id, true);
    
    -- Give reward to referrer (100 coins)
    PERFORM public.add_coins(v_referrer_user_id, 100, 'referral_bonus');
    
    -- Give bonus to new user (50 coins)
    PERFORM public.add_coins(p_referred_user_id, 50, 'referral_signup_bonus');
  END IF;
END;
$$;

-- Update handle_new_user_gamification to generate referral code
CREATE OR REPLACE FUNCTION public.handle_new_user_gamification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- user_currencyレコード作成（初期100コイン）
  INSERT INTO public.user_currency (user_id, free_coins)
  VALUES (NEW.id, 100);

  -- デフォルトアイテムを全て付与
  INSERT INTO public.user_items (user_id, item_id, is_equipped)
  SELECT NEW.id, id, (category = 'outfit')
  FROM public.items
  WHERE is_default = true;

  -- gacha_pityレコード作成
  INSERT INTO public.gacha_pity (user_id, current_count)
  VALUES (NEW.id, 0);

  -- ai_quotaレコード作成
  INSERT INTO public.ai_quota (user_id, free_messages_used)
  VALUES (NEW.id, 0);

  RETURN NEW;
END;
$function$;

-- Update handle_new_user to generate referral code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, referral_code)
  VALUES (new.id, public.generate_referral_code());
  RETURN new;
END;
$function$;