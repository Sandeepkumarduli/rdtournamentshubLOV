-- Add DELETE policy for tournament_registrations for admins
CREATE POLICY "Admins can delete tournament registrations for their org tournaments"
ON public.tournament_registrations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments t
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE t.id = tournament_registrations.tournament_id
    AND p.role = 'admin'
    AND p.organization = t.organization
  )
);

-- Add DELETE policy for org_user_registrations for admins
CREATE POLICY "Admins can delete org user registrations for their org"
ON public.org_user_registrations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.role = 'admin'
    AND p.organization = org_user_registrations.org_name
  )
);

-- Add DELETE policy for org_user_registrations for system admins
CREATE POLICY "System admins can delete org user registrations"
ON public.org_user_registrations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.role = 'systemadmin'
  )
);