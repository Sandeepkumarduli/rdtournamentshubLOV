-- Add organization field to tournaments
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS organization TEXT;

-- Update existing tournaments to have an organization (set a default)
UPDATE public.tournaments 
SET organization = 'Default Org'
WHERE organization IS NULL;

-- Create CHECK constraint for report types
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_type_check;
ALTER TABLE public.reports 
ADD CONSTRAINT reports_type_check 
CHECK (type IN ('tournament_issue', 'player_misconduct', 'payment_issue', 'technical_issue', 'general_inquiry', 'bug_report', 'feature_request', 'account_issue', 'other'));

-- Create function to get current admin organization
CREATE OR REPLACE FUNCTION public.get_admin_organization(admin_user_id UUID)
RETURNS TEXT AS $$
  SELECT organization FROM public.profiles WHERE user_id = admin_user_id AND role = 'admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update tournament RLS policy to include organization filtering
DROP POLICY IF EXISTS "Admins can manage tournaments" ON public.tournaments;
CREATE POLICY "Admins can manage tournaments" 
ON public.tournaments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'systemadmin')
    AND (profiles.role = 'systemadmin' OR profiles.organization = tournaments.organization)
  )
);

-- Create index for better performance on organization queries
CREATE INDEX IF NOT EXISTS idx_tournaments_organization ON public.tournaments(organization);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_role ON public.profiles(organization, role);