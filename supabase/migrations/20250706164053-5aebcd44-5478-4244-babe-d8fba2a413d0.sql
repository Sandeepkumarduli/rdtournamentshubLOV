-- Update RLS policy to allow any team member to register for tournaments
DROP POLICY "Team leaders can register for tournaments" ON public.tournament_registrations;

CREATE POLICY "Team members can register for tournaments" ON public.tournament_registrations
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_members.team_id = tournament_registrations.team_id 
    AND team_members.user_id = auth.uid()
  )
);

-- Also update the frozen user policy to work with team members
DROP POLICY "Frozen users cannot register for tournaments" ON public.tournament_registrations;

CREATE POLICY "Frozen users cannot register for tournaments" ON public.tournament_registrations
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.profiles p ON tm.user_id = p.user_id
    WHERE tm.team_id = tournament_registrations.team_id 
    AND tm.user_id = auth.uid()
    AND p.role <> 'frozen'
  )
);