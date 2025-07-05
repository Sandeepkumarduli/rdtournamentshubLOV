-- Fix the reports priority constraint
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_priority_check;

-- Add proper priority constraint that matches our app values
ALTER TABLE public.reports ADD CONSTRAINT reports_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));