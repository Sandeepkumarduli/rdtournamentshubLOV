-- First, let's check and fix the reports priority constraint
-- The error suggests there's a check constraint that's failing
-- Let's update the reports table to allow the correct priority values

-- Check current constraint and update if needed
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_priority_check;

-- Add proper priority constraint that matches our app values
ALTER TABLE public.reports ADD CONSTRAINT reports_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Create System Admin credentials
-- Insert the system admin user with specific credentials
INSERT INTO public.profiles (user_id, display_name, email, role, organization) 
VALUES (
  'system-admin-1234',
  'System Administrator', 
  'systemadmin@example.com',
  'systemadmin',
  'System'
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'systemadmin',
  display_name = 'System Administrator',
  email = 'systemadmin@example.com';

-- We need to also create the auth user, but we'll handle that through the signup process
-- For now, let's ensure the constraint is fixed