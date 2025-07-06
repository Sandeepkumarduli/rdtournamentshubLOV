-- Populate existing registrations in org_user_registrations
INSERT INTO public.org_user_registrations (
  user_id,
  username,
  team_id,
  tournament_id,
  org_name,
  registration_type
)
SELECT DISTINCT
  tm.user_id,
  COALESCE(p.display_name, p.email, 'Unknown User') as username,
  tr.team_id,
  tr.tournament_id,
  t.organization as org_name,
  'team' as registration_type
FROM public.tournament_registrations tr
JOIN public.tournaments t ON tr.tournament_id = t.id
JOIN public.team_members tm ON tr.team_id = tm.team_id
JOIN public.profiles p ON tm.user_id = p.user_id
WHERE t.organization IS NOT NULL
ON CONFLICT DO NOTHING;