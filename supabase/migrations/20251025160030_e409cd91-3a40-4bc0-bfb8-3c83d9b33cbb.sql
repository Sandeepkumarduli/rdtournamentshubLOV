-- Add phone_number column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create index for faster phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number 
ON public.profiles(phone_number);