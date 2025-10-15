-- Add email and phone verification status columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Create index for faster filtering on verification status
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(email_verified, phone_verified) WHERE email_verified = true AND phone_verified = true;