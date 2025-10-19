-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'systemadmin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "System admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'))
WITH CHECK (public.has_role(auth.uid(), 'systemadmin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Migrate existing data from profiles.role to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::public.app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Update existing RLS policies to use has_role function

-- admin_requests policies
DROP POLICY IF EXISTS "System admins can update admin requests" ON public.admin_requests;
CREATE POLICY "System admins can update admin requests"
ON public.admin_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'));

DROP POLICY IF EXISTS "System admins can view all admin requests" ON public.admin_requests;
CREATE POLICY "System admins can view all admin requests"
ON public.admin_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'));

-- chat_messages policies
DROP POLICY IF EXISTS "System admins can view all messages" ON public.chat_messages;
CREATE POLICY "System admins can view all messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'));

-- org_user_registrations policies
DROP POLICY IF EXISTS "Org admins can view their org registrations" ON public.org_user_registrations;
CREATE POLICY "Org admins can view their org registrations"
ON public.org_user_registrations
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization = org_user_registrations.org_name
  )
);

DROP POLICY IF EXISTS "System admins can view all org registrations" ON public.org_user_registrations;
CREATE POLICY "System admins can view all org registrations"
ON public.org_user_registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'));

DROP POLICY IF EXISTS "Admins can delete org user registrations for their org" ON public.org_user_registrations;
CREATE POLICY "Admins can delete org user registrations for their org"
ON public.org_user_registrations
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') AND
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.organization = org_user_registrations.org_name
  )
);

DROP POLICY IF EXISTS "System admins can delete org user registrations" ON public.org_user_registrations;
CREATE POLICY "System admins can delete org user registrations"
ON public.org_user_registrations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'));

-- organization_bans policies
DROP POLICY IF EXISTS "Admins can manage organization bans" ON public.organization_bans;
CREATE POLICY "Admins can manage organization bans"
ON public.organization_bans
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization = organization_bans.organization
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization = organization_bans.organization
  )
);

DROP POLICY IF EXISTS "System admins can view all organization bans" ON public.organization_bans;
CREATE POLICY "System admins can view all organization bans"
ON public.organization_bans
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'));

-- reports policies
DROP POLICY IF EXISTS "Org admins can view reports about their organization" ON public.reports;
CREATE POLICY "Org admins can view reports about their organization"
ON public.reports
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.organization = reports.reported_entity
  )
);

DROP POLICY IF EXISTS "System admins can view all reports" ON public.reports;
CREATE POLICY "System admins can view all reports"
ON public.reports
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'));

DROP POLICY IF EXISTS "System admins can update reports" ON public.reports;
CREATE POLICY "System admins can update reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'));

DROP POLICY IF EXISTS "System admins can delete reports" ON public.reports;
CREATE POLICY "System admins can delete reports"
ON public.reports
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'));

-- user_freeze_status policies
DROP POLICY IF EXISTS "System admins can manage freeze status" ON public.user_freeze_status;
CREATE POLICY "System admins can manage freeze status"
ON public.user_freeze_status
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'))
WITH CHECK (public.has_role(auth.uid(), 'systemadmin'));

DROP POLICY IF EXISTS "System admins can view all freeze status" ON public.user_freeze_status;
CREATE POLICY "System admins can view all freeze status"
ON public.user_freeze_status
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'systemadmin'));

-- tournaments policies
DROP POLICY IF EXISTS "Admins can manage tournaments" ON public.tournaments;
CREATE POLICY "Admins can manage tournaments"
ON public.tournaments
FOR ALL
TO authenticated
USING (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'systemadmin')) AND
  (
    public.has_role(auth.uid(), 'systemadmin') OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.organization = tournaments.organization
    )
  )
)
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'systemadmin')) AND
  (
    public.has_role(auth.uid(), 'systemadmin') OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.organization = tournaments.organization
    )
  )
);