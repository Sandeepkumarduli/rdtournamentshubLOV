-- Add phone field to profiles table for storing phone numbers
ALTER TABLE public.profiles ADD COLUMN phone TEXT;

-- Create index on phone field for better performance
CREATE INDEX idx_profiles_phone ON public.profiles(phone);