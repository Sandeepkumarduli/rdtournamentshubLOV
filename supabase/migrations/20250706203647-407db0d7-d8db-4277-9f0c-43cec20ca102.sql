-- Create a separate table for user freeze status
CREATE TABLE public.user_freeze_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
  frozen_at TIMESTAMP WITH TIME ZONE,
  frozen_by UUID REFERENCES profiles(user_id),
  unfrozen_at TIMESTAMP WITH TIME ZONE,
  unfrozen_by UUID REFERENCES profiles(user_id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_freeze_status ENABLE ROW LEVEL SECURITY;

-- Create policies for freeze status
CREATE POLICY "System admins can view all freeze status" 
ON public.user_freeze_status 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'systemadmin'
));

CREATE POLICY "System admins can manage freeze status" 
ON public.user_freeze_status 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'systemadmin'
));

-- Create trigger for updating timestamps
CREATE TRIGGER update_user_freeze_status_updated_at
  BEFORE UPDATE ON public.user_freeze_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time for the table
ALTER TABLE public.user_freeze_status REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.user_freeze_status;