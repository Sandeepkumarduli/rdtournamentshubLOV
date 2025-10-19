# System Admin Setup Guide

## Create Your First System Admin Account

Follow these steps to create your initial system admin account:

### Step 1: Create a User in Supabase Dashboard

1. Go to your Supabase Dashboard: [Authentication → Users](https://supabase.com/dashboard/project/rwhxtiiyfsjdqftwpsis/auth/users)
2. Click "Add User" (via email)
3. Enter your email: `sandeepkumarduli.ai@gmail.com` (or your preferred email)
4. Set a password
5. Toggle "Auto Confirm User" to ON (to skip email verification)
6. Click "Create User"
7. **Copy the user's UUID** from the Users table

### Step 2: Assign System Admin Role

Go to your Supabase [SQL Editor](https://supabase.com/dashboard/project/rwhxtiiyfsjdqftwpsis/sql/new) and run this SQL (replace `YOUR_USER_ID` with the UUID you copied):

```sql
-- Replace YOUR_USER_ID with your actual user UUID
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'systemadmin')
ON CONFLICT (user_id, role) DO NOTHING;
```

Example:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('b52334a2-311a-49da-a29e-e4b7a77210d2', 'systemadmin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 3: Verify the Setup

Run this query to verify your role was assigned:

```sql
SELECT * FROM public.user_roles WHERE user_id = 'YOUR_USER_ID';
```

You should see a row with `role = 'systemadmin'`.

### Step 4: Login

1. Go to `/system-admin-login` in your app
2. Login with the email and password you created
3. You should now have full system admin access!

## Managing Other Admin Roles

Once logged in as a system admin, you can:

1. Go to **System Admin Dashboard** → **User Management**
2. Click the **Shield icon** next to any user
3. Assign or remove roles:
   - `user` - Regular platform user (default)
   - `admin` - Organization administrator
   - `systemadmin` - Full system access

## Security Features

✅ **Roles stored in separate table** - Prevents privilege escalation  
✅ **Server-side validation** - Uses security definer functions  
✅ **Audit trail** - Tracks who assigned roles and when  
✅ **No self-modification** - System admins cannot remove their own systemadmin role  
✅ **RLS protection** - Only system admins can manage roles  

## Troubleshooting

**Can't login after creating user?**
- Make sure you selected "Auto Confirm User" when creating the account
- Verify the role was inserted correctly in the SQL editor
- Check the console logs for any authentication errors

**Role not showing in app?**
- Clear browser cache and refresh
- Logout and login again
- Verify the role exists in the database using the SQL query above
