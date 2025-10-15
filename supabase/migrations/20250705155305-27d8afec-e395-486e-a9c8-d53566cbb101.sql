-- Create or update a system admin user
-- First, let's update one of the existing users to be system admin
UPDATE profiles 
SET role = 'systemadmin' 
WHERE email = 'sandeepkumarduli.ai@gmail.com';

-- If we want to create the demo user that the login page expects, we need to:
-- 1. First create the auth user (this would normally be done through Supabase Auth)
-- 2. Then create the profile
-- Since we can't directly insert into auth.users, let's update the login page to use an existing user

-- Alternatively, let's update another user to be systemadmin
INSERT INTO profiles (user_id, email, display_name, role) 
VALUES (
  gen_random_uuid(), 
  'systemadmin@example.com', 
  'System Administrator', 
  'systemadmin'
) ON CONFLICT (user_id) DO NOTHING;