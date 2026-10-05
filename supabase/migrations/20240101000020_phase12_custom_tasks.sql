-- Add custom_tasks JSONB column to event_coordinators

ALTER TABLE public.event_coordinators 
ADD COLUMN IF NOT EXISTS custom_tasks JSONB DEFAULT '[]'::jsonb NOT NULL;
