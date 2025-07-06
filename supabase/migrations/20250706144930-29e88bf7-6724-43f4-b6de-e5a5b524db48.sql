-- Fix the RLS policy for team_members to allow users to join teams
-- Drop the conflicting policies
DROP POLICY IF EXISTS "Frozen users cannot manage team members" ON team_members;
DROP POLICY IF EXISTS "Team leaders can manage members" ON team_members;

-- Create separate policies for different operations
CREATE POLICY "Users can join teams (INSERT)" ON team_members
FOR INSERT 
WITH CHECK (
  -- Allow users to join teams if they're not frozen
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role != 'frozen'
  )
);

CREATE POLICY "Team leaders can manage members (INSERT)" ON team_members
FOR INSERT 
WITH CHECK (
  -- Team leaders can add members to their teams
  EXISTS (
    SELECT 1 FROM teams t
    JOIN profiles p ON t.leader_id = p.user_id
    WHERE t.id = team_members.team_id 
    AND t.leader_id = auth.uid()
    AND p.role != 'frozen'
  )
);

CREATE POLICY "Team leaders can remove members (DELETE)" ON team_members
FOR DELETE 
USING (
  -- Team leaders can remove members from their teams
  EXISTS (
    SELECT 1 FROM teams t
    JOIN profiles p ON t.leader_id = p.user_id
    WHERE t.id = team_members.team_id 
    AND t.leader_id = auth.uid()
    AND p.role != 'frozen'
  )
  OR
  -- Users can leave teams themselves
  auth.uid() = user_id
);

CREATE POLICY "Team leaders can update member roles (UPDATE)" ON team_members
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM teams t
    JOIN profiles p ON t.leader_id = p.user_id
    WHERE t.id = team_members.team_id 
    AND t.leader_id = auth.uid()
    AND p.role != 'frozen'
  )
);