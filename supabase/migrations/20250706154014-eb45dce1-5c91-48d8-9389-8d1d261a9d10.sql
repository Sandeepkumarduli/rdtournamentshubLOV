-- Add RLS policy for users to view their own reports
CREATE POLICY "Users can view their own reports" 
ON public.reports 
FOR SELECT 
USING (auth.uid() = reporter_id);