const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function runFixes() {
  const sql = `
    -- Fix 1: Add missing SELECT policy on event_registrations for admins
    DROP POLICY IF EXISTS "er_admin_select" ON event_registrations;
    CREATE POLICY "er_admin_select" ON event_registrations
      FOR SELECT TO authenticated
      USING (public.get_my_role() = 'admin');

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
  `
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })

  if (error) {
    console.error("Error executing SQL:", error)
  } else {
    console.log("Fixes executed successfully!")
  }
}

runFixes().catch(console.error)
