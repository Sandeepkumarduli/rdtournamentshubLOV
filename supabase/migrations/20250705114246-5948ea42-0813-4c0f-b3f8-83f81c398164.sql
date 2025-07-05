-- Add room_id and room_password to tournaments table
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS room_id TEXT,
ADD COLUMN IF NOT EXISTS room_password TEXT;

-- Add RLS policies for tournament_registrations table
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tournament registrations for their own teams
CREATE POLICY "Users can view their team registrations" 
ON public.tournament_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_members.team_id = tournament_registrations.team_id 
    AND team_members.user_id = auth.uid()
  )
);

-- Policy: Team leaders can register their teams for tournaments
CREATE POLICY "Team leaders can register for tournaments" 
ON public.tournament_registrations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.teams 
    WHERE teams.id = tournament_registrations.team_id 
    AND teams.leader_id = auth.uid()
  )
);

-- Policy: System admins can view all registrations
CREATE POLICY "System admins can view all registrations" 
ON public.tournament_registrations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'systemadmin'
  )
);