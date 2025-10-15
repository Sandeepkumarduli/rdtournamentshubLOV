-- First, let's check and fix the reports priority constraint
-- The error suggests there's a check constraint that's failing
-- Let's update the reports table to allow the correct priority values

-- Check current constraint and update if needed
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_priority_check;

-- Add proper priority constraint that matches our app values
ALTER TABLE public.reports ADD CONSTRAINT reports_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- SECURITY NOTE: System admin credentials have been removed for security reasons.
-- Create system admin accounts through proper signup process with secure passwords.
-- The constraint fix above is the only necessary change for this migration.