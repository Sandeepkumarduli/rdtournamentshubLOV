-- Function to populate org_user_registrations when team registers for tournament
CREATE OR REPLACE FUNCTION public.populate_org_user_registrations()
RETURNS TRIGGER AS $$
DECLARE
  team_member RECORD;
  tournament_org TEXT;
BEGIN
  -- Get the tournament organization
  SELECT organization INTO tournament_org
  FROM public.tournaments 
  WHERE id = NEW.tournament_id;
  
  -- Skip if no organization found
  IF tournament_org IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Insert registration records for each team member
  FOR team_member IN 
    SELECT tm.user_id, p.display_name as username
    FROM public.team_members tm
    JOIN public.profiles p ON tm.user_id = p.user_id
    WHERE tm.team_id = NEW.team_id
  LOOP
    INSERT INTO public.org_user_registrations (
      user_id,
      username,
      team_id,
      tournament_id,
      org_name,
      registration_type
    ) VALUES (
      team_member.user_id,
      team_member.username,
      NEW.team_id,
      NEW.tournament_id,
      tournament_org,
      'team'
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on tournament_registrations
DROP TRIGGER IF EXISTS trigger_populate_org_registrations ON public.tournament_registrations;
CREATE TRIGGER trigger_populate_org_registrations
  AFTER INSERT ON public.tournament_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.populate_org_user_registrations();

-- Add RLS policies to prevent banned users/teams from registering
CREATE POLICY "Banned users cannot register for org tournaments" ON public.tournament_registrations
FOR INSERT 
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.organization_bans ob
    JOIN public.tournaments t ON t.id = tournament_registrations.tournament_id
    JOIN public.team_members tm ON tm.team_id = tournament_registrations.team_id
    WHERE ob.organization = t.organization 
    AND ob.banned_user_id = tm.user_id
    AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Banned teams cannot register for org tournaments" ON public.tournament_registrations
FOR INSERT 
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.organization_bans ob
    JOIN public.tournaments t ON t.id = tournament_registrations.tournament_id
    WHERE ob.organization = t.organization 
    AND ob.banned_team_id = tournament_registrations.team_id
  )
);