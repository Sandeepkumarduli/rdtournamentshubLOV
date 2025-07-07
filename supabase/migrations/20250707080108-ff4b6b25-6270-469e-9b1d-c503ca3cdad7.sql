-- Add policy to allow users to view organization bans that affect them or their teams
CREATE POLICY "Users can view bans that affect them or their teams"
ON public.organization_bans
FOR SELECT
TO authenticated
USING (
  -- User can see their own bans
  banned_user_id = auth.uid() 
  OR 
  -- User can see bans for teams they are members of
  banned_team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);