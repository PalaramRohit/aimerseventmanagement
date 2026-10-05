import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function verify() {
  const email = 'rohit.test.import@example.com';
  
  console.log("=== B. VERIFY event_registrations ===");
  const { data: reg, error: regErr } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('email', email)
    .single();
    
  if (regErr || !reg) {
    console.log("FAIL: Registration not found.", regErr);
  } else {
    console.log("PASS: Found registration.");
    console.log("Record:", JSON.stringify(reg, null, 2));
  }

  console.log("\n=== AUTHENTICATING / SYNCING PARTICIPANT ===");
  // Check if Auth user exists
  const { data: users, error: authErr } = await supabase.auth.admin.listUsers();
  let user = users?.users.find(u => u.email === email);
  
  if (!user) {
    console.log("User not found in auth. Creating test auth user...");
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: email,
      password: 'TestPassword123!',
      email_confirm: true
    });
    if (createErr || !newUser.user) {
      console.log("Failed to create auth user:", createErr);
      return;
    }
    user = newUser.user;
    
    // Create profile since triggers might not be set up in tests exactly
    const { error: profErr } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      role: 'participant',
      full_name: null,
      phone: null
    });
    if (profErr) {
       console.log("Profile insert error (might already exist by trigger):", profErr.message);
    }
  }

  // Generate JWT for the user to call sync RPC
  // Wait, I can just call it via RPC if it uses auth.uid()? 
  // No, Supabase JS client with service role uses no auth.uid() context.
  // I must sign in to get a user session.
  const { data: authData, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password: 'TestPassword123!'
  });
  
  if (signInErr || !authData.session) {
    console.log("SignIn error:", signInErr);
  } else {
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`
        }
      }
    });

    // Run Sync
    console.log("Running sync_participant_registrations...");
    const { error: syncErr } = await userClient.rpc('sync_participant_registrations');
    if (syncErr) console.log("Sync error:", syncErr);
    
    // Run Sync Again (Idempotency test)
    console.log("Running sync_participant_registrations AGAIN (Idempotency)...");
    const { error: syncErr2 } = await userClient.rpc('sync_participant_registrations');
    if (syncErr2) console.log("Sync2 error:", syncErr2);
  }
  
  console.log("\n=== C. VERIFY profiles ===");
  const { data: prof, error: profErr2 } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();
    
  if (profErr2 || !prof) {
    console.log("FAIL: Profile not found.");
  } else {
    console.log("Record:", JSON.stringify(prof, null, 2));
  }

  console.log("\n=== D. VERIFY event_participants ===");
  const { data: ep, error: epErr } = await supabase
    .from('event_participants')
    .select('*')
    .eq('participant_id', user?.id);
    
  if (epErr || !ep || ep.length === 0) {
    console.log("FAIL: Event participant not found.");
  } else {
    console.log(`Found ${ep.length} participant records.`);
    console.log("Record:", JSON.stringify(ep[0], null, 2));
  }

  // Cleanup auth user to keep state clean (Optional, but user said not to modify unnecessarily. I'll leave it).
  console.log("\nDone verifying.");
}

verify().catch(console.error);
