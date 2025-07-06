-- Allow users to read their own freeze status
CREATE POLICY "Users can view their own freeze status" 
ON public.user_freeze_status 
FOR SELECT 
USING (auth.uid() = user_id);