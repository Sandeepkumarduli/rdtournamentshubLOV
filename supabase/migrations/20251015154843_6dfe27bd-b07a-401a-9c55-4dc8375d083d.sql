-- Add unique constraint to bgmi_id in profiles table to prevent duplicates
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_bgmi_id_unique UNIQUE (bgmi_id);