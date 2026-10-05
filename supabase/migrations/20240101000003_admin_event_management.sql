-- Migration: 20240101000003_admin_event_management.sql
-- Description: RLS policies and triggers for Admin Event Management

-- 1. INSERT Policy for events
-- Only admins can create events. The WITH CHECK enforces created_by is their own ID.
CREATE POLICY "events_insert" ON events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() = 'admin' 
    AND created_by = auth.uid()
  );

-- 2. UPDATE Policy for events
-- Only admins can update events. 
CREATE POLICY "events_update" ON events
  FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'admin');

-- 3. Trigger to completely protect created_by from being updated
CREATE OR REPLACE FUNCTION public.protect_event_created_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'Cannot modify event creator (created_by is immutable)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_events_created_by_trigger ON events;

CREATE TRIGGER protect_events_created_by_trigger
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE PROCEDURE public.protect_event_created_by();
