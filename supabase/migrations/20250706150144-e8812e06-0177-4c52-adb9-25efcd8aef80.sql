-- Create team join requests table
CREATE TABLE public.team_join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  requested_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, requested_user_id)
);

-- Enable RLS
ALTER TABLE public.team_join_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for team join requests
CREATE POLICY "Users can view their own requests" ON public.team_join_requests
FOR SELECT 
USING (auth.uid() = requested_user_id OR auth.uid() = requester_id);

CREATE POLICY "Team leaders can create requests" ON public.team_join_requests
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_join_requests.team_id 
    AND t.leader_id = auth.uid()
  )
  AND auth.uid() = requester_id
);

CREATE POLICY "Requested users can update their requests" ON public.team_join_requests
FOR UPDATE 
USING (auth.uid() = requested_user_id);

CREATE POLICY "Team leaders and requested users can delete requests" ON public.team_join_requests
FOR DELETE 
USING (
  auth.uid() = requested_user_id OR 
  (auth.uid() = requester_id AND EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_join_requests.team_id 
    AND t.leader_id = auth.uid()
  ))
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_team_join_requests_updated_at
BEFORE UPDATE ON public.team_join_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();