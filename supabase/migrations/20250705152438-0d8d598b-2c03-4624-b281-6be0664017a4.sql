-- Add RLS policies to restrict frozen users from core functionality

-- Prevent frozen users from registering for tournaments
CREATE POLICY "Frozen users cannot register for tournaments" 
ON public.tournament_registrations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams t 
    JOIN profiles p ON t.leader_id = p.user_id 
    WHERE t.id = tournament_registrations.team_id 
    AND t.leader_id = auth.uid() 
    AND p.role != 'frozen'
  )
);

-- Prevent frozen users from creating teams
CREATE POLICY "Frozen users cannot create teams" 
ON public.teams 
FOR INSERT 
WITH CHECK (
  auth.uid() = leader_id AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role != 'frozen'
  )
);

-- Prevent frozen users from updating teams
CREATE POLICY "Frozen users cannot update teams" 
ON public.teams 
FOR UPDATE 
USING (
  auth.uid() = leader_id AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role != 'frozen'
  )
);

-- Prevent frozen users from managing team members
CREATE POLICY "Frozen users cannot manage team members" 
ON public.team_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM teams t 
    JOIN profiles p ON t.leader_id = p.user_id 
    WHERE t.id = team_members.team_id 
    AND t.leader_id = auth.uid() 
    AND p.role != 'frozen'
  )
);

-- Allow frozen users to only create reports (they can already do this)
-- No additional policy needed as existing policy allows all authenticated users to create reports