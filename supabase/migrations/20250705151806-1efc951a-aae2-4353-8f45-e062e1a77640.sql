-- Fix profiles role constraint to allow 'frozen' status
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'admin', 'systemadmin', 'frozen', 'banned'));

-- Fix reports status constraint to allow 'Resolved' status  
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_status_check;
ALTER TABLE public.reports ADD CONSTRAINT reports_status_check 
  CHECK (status IN ('pending', 'Pending', 'resolved', 'Resolved'));

-- Also allow system admins to delete reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Add delete policy for system admins
CREATE POLICY "System admins can delete reports" 
ON public.reports 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'systemadmin'::text))));