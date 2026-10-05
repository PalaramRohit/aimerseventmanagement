-- Fix policy to avoid auth.users direct select
DROP POLICY IF EXISTS "er_admin_select" ON event_registrations;
CREATE POLICY "er_admin_select" ON event_registrations
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'admin' 
    OR 
    email = (auth.jwt() ->> 'email')::text
  );
