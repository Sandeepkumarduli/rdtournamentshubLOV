-- Add RLS policy to allow organization admins to view reports about their organization
CREATE POLICY "Org admins can view reports about their organization" 
ON public.reports 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin' 
    AND profiles.organization = reports.reported_entity
  )
);