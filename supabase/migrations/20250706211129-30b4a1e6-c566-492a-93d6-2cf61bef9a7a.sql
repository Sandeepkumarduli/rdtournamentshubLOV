-- Enable real-time for user_freeze_status table
ALTER TABLE public.user_freeze_status REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_freeze_status;