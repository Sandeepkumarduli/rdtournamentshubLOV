-- Add unique constraints to profiles table to prevent duplicate emails and phone numbers
ALTER TABLE profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

ALTER TABLE profiles 
ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);