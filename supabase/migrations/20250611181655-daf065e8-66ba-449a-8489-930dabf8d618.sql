
-- Add phone number and currency fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'USD';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on OTP table
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for OTP table (users can only access their own OTP records)
CREATE POLICY "Users can access their own OTP records" 
  ON public.otp_verifications 
  FOR ALL
  USING (phone_number IN (
    SELECT phone_number FROM public.profiles WHERE id = auth.uid()
  ));

-- Update the handle_new_user function to include phone number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, phone_number, currency_code, country_code)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone_number',
    CASE 
      WHEN new.raw_user_meta_data->>'phone_number' LIKE '+91%' THEN 'INR'
      WHEN new.raw_user_meta_data->>'phone_number' LIKE '+1%' THEN 'USD'
      WHEN new.raw_user_meta_data->>'phone_number' LIKE '+44%' THEN 'GBP'
      WHEN new.raw_user_meta_data->>'phone_number' LIKE '+33%' THEN 'EUR'
      ELSE 'USD'
    END,
    CASE 
      WHEN new.raw_user_meta_data->>'phone_number' LIKE '+91%' THEN 'IN'
      WHEN new.raw_user_meta_data->>'phone_number' LIKE '+1%' THEN 'US'
      WHEN new.raw_user_meta_data->>'phone_number' LIKE '+44%' THEN 'GB'
      WHEN new.raw_user_meta_data->>'phone_number' LIKE '+33%' THEN 'FR'
      ELSE 'US'
    END
  );
  RETURN NEW;
END;
$$;
