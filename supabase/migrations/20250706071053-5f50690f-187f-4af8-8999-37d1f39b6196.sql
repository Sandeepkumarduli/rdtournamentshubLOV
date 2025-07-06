-- Update an existing user to be system admin (unfreezing if needed)
UPDATE profiles 
SET role = 'systemadmin' 
WHERE email = 'sandeepkumarduli.ai@gmail.com';