-- Create a table to track user registrations per organization
CREATE TABLE public.org_user_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  team_id UUID,
  org_name TEXT NOT NULL,
  tournament_id UUID NOT NULL,
  registration_type TEXT NOT NULL CHECK (registration_type IN ('solo', 'team')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.org_user_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for org admins to view their org's registrations
CREATE POLICY "Org admins can view their org registrations" 
ON public.org_user_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin' 
    AND profiles.organization = org_user_registrations.org_name
  )
);

-- System admins can view all
CREATE POLICY "System admins can view all org registrations" 
ON public.org_user_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'systemadmin'
  )
);

-- Allow system to insert registrations
CREATE POLICY "System can insert org registrations" 
ON public.org_user_registrations 
FOR INSERT 
WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.org_user_registrations 
ADD CONSTRAINT fk_org_user_registrations_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.org_user_registrations 
ADD CONSTRAINT fk_org_user_registrations_team_id 
FOREIGN KEY (team_id) REFERENCES public.teams(id);

ALTER TABLE public.org_user_registrations 
ADD CONSTRAINT fk_org_user_registrations_tournament_id 
FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id);

-- Create indexes for better performance
CREATE INDEX idx_org_user_registrations_org_name ON public.org_user_registrations(org_name);
CREATE INDEX idx_org_user_registrations_user_id ON public.org_user_registrations(user_id);
CREATE INDEX idx_org_user_registrations_team_id ON public.org_user_registrations(team_id);
CREATE INDEX idx_org_user_registrations_tournament_id ON public.org_user_registrations(tournament_id);