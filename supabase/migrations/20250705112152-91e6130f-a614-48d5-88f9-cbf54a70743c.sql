-- First, let's check and fix the reports priority constraint
-- The error suggests there's a check constraint that's failing
-- Let's update the reports table to allow the correct priority values

-- Check current constraint and update if needed
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_priority_check;

-- Add proper priority constraint that matches our app values
ALTER TABLE public.reports ADD CONSTRAINT reports_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Security Note: Demo credentials have been removed for security reasons.
-- System admin accounts should be created through the proper signup process
-- or using environment variables for development purposes only.

-- The constraint fix below is kept as it's necessary for the application to function