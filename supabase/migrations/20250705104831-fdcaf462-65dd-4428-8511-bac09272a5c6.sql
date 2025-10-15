-- Create demo admin users
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    encrypted_password,
    role,
    aud,
    instance_id
) VALUES (
    gen_random_uuid(),
    'admin@example.com',
    now(),
    now(),
    now(),
    crypt('password123', gen_salt('bf')),
    'authenticated',
    'authenticated',
    '00000000-0000-0000-0000-000000000000'
), (
    gen_random_uuid(),
    'systemadmin@example.com',
    now(),
    now(),
    now(),
    crypt('password123', gen_salt('bf')),
    'authenticated',
    'authenticated',
    '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (email) DO NOTHING;

-- Create profiles for the admin users
INSERT INTO public.profiles (user_id, email, display_name, role, organization)
SELECT 
    id,
    email,
    CASE 
        WHEN email = 'admin@example.com' THEN 'Admin User'
        WHEN email = 'systemadmin@example.com' THEN 'System Administrator'
    END,
    CASE 
        WHEN email = 'admin@example.com' THEN 'admin'
        WHEN email = 'systemadmin@example.com' THEN 'systemadmin'
    END,
    CASE 
        WHEN email = 'admin@example.com' THEN 'FireStorm'
        ELSE NULL
    END
FROM auth.users 
WHERE email IN ('admin@example.com', 'systemadmin@example.com')
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    organization = EXCLUDED.organization;