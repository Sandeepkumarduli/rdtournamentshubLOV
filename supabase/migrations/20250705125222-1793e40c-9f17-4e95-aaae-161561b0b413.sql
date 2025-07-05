-- Add organization-specific ban tracking
CREATE TABLE IF NOT EXISTS public.organization_bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization TEXT NOT NULL,
  banned_user_id UUID REFERENCES public.profiles(user_id),
  banned_team_id UUID REFERENCES public.teams(id),
  banned_by UUID NOT NULL REFERENCES public.profiles(user_id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_org_user_ban UNIQUE(organization, banned_user_id),
  CONSTRAINT unique_org_team_ban UNIQUE(organization, banned_team_id),
  CONSTRAINT ban_user_or_team CHECK (
    (banned_user_id IS NOT NULL AND banned_team_id IS NULL) OR 
    (banned_user_id IS NULL AND banned_team_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.organization_bans ENABLE ROW LEVEL SECURITY;

-- Create policies for organization bans
CREATE POLICY "Admins can manage organization bans"
ON public.organization_bans
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND organization = organization_bans.organization
  )
);

CREATE POLICY "System admins can view all organization bans"
ON public.organization_bans
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'systemadmin'
  )
);

-- Add function to check if user is banned by organization
CREATE OR REPLACE FUNCTION public.is_user_banned_by_org(
  user_id_param UUID,
  org_name TEXT
) 
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_bans 
    WHERE organization = org_name 
    AND banned_user_id = user_id_param
  );
$$;

-- Add function to check if team is banned by organization  
CREATE OR REPLACE FUNCTION public.is_team_banned_by_org(
  team_id_param UUID,
  org_name TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_bans 
    WHERE organization = org_name 
    AND banned_team_id = team_id_param
  );
$$;