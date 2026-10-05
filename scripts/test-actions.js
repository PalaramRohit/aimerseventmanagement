const { getEventParticipants } = require('./src/app/(admin)/admin/events/[id]/participants/actions.ts')
const { getEventCoordinators } = require('./src/app/(admin)/admin/events/[id]/coordinators/actions.ts')

// We can't require Next.js actions directly in a plain Node script.
// Instead, let's just make the Supabase queries directly to see what fails.
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Let's emulate the 'requireAdmin' by using an authenticated client.
// To do this, we need a valid JWT for an admin, or we can just use the service role key and set the role to authenticated and impersonate an admin.
// BUT since we just want to see the error for 'authenticated', we can create a client and set the auth header.

async function runTest() {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  
  // Get an admin user
  const { data: profiles } = await supabaseAdmin.from('profiles').select('*').eq('role', 'admin').limit(1)
  if (!profiles || profiles.length === 0) {
    console.error("No admin found")
    return
  }
  const adminId = profiles[0].id
  console.log("Found admin:", adminId)

  // We need to impersonate this admin. 
  // We can do this by executing queries as postgres with set_config, but easiest is to just use the Rest API with the anon key and a custom JWT, OR use the service role and we can't test RLS easily.
  // Wait, we can test RLS by creating a signed JWT.
  const jwt = require('jsonwebtoken')
  const token = jwt.sign({
    role: 'authenticated',
    aud: 'authenticated',
    sub: adminId,
    email: profiles[0].email
  }, process.env.SUPABASE_SERVICE_ROLE_KEY + "fake", { expiresIn: '1h' }) // Wait, we don't have the JWT secret. The service role key is NOT the JWT secret. The JWT secret is unknown.

  console.log("Cannot easily impersonate without JWT secret. Let's try anonymous to see if we get permission denied, or just check the RLS policies in the DB.")
}
runTest().catch(console.error)
