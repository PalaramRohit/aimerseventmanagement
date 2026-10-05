-- Fix 1: Add missing SELECT policy on event_registrations for admins
DROP POLICY IF EXISTS "er_admin_select" ON event_registrations;
CREATE POLICY "er_admin_select" ON event_registrations
  FOR SELECT TO authenticated
  USING (public.get_my_role() = 'admin' OR email = (SELECT auth.users.email FROM auth.users WHERE auth.users.id = auth.uid()));

-- Fix 2: Grant SELECT on operational tables so Admins can fetch statistics
GRANT SELECT ON public.attendance_records TO authenticated;
GRANT SELECT ON public.food_records TO authenticated;

-- Fix 3: Add RLS policies for operational tables so Admins can read them
DROP POLICY IF EXISTS "att_admin_select" ON attendance_records;
CREATE POLICY "att_admin_select" ON attendance_records
  FOR SELECT TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "food_admin_select" ON food_records;
CREATE POLICY "food_admin_select" ON food_records
  FOR SELECT TO authenticated
  USING (public.get_my_role() = 'admin');

-- Also, why did "new row violates row-level security policy" happen?
-- If get_my_role() returns 'admin', then er_admin_insert and er_admin_update should pass.
-- Wait, get_my_role() is STABLE.
-- Maybe the user doing the action is somehow NOT an admin according to get_my_role()?
-- Let's add an ON CONFLICT DO UPDATE policy that doesn't check get_my_role() if they are admin.
