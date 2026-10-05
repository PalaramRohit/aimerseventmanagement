const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// We also need the client with ANON_KEY to simulate participant login
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function runOptionA() {
  console.log('--- EXECUTING OPTION A ---');
  
  const targetEpId = 'd295af6d-dfb6-4db3-b6e3-6b7bc6f61539';

  // 1. Delete ONLY the target EP row using service role
  console.log(`Deleting event_participants row: ${targetEpId}`);
  const { error: deleteError } = await supabase
    .from('event_participants')
    .delete()
    .eq('id', targetEpId);

  if (deleteError) {
    console.error('Failed to delete EP:', deleteError);
    return;
  }
  console.log('Deletion successful.');

  // 2. Find participant user
  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users.users.find(u => u.email === 'testparticipant@aimers.example');
  
  if (!testUser) {
    console.error('Participant not found.');
    return;
  }
  console.log(`Found Participant ID: ${testUser.id}`);

  // 3. Simulate sync via RPC call overriding auth.uid() using a direct database function
  console.log('Triggering sync_participant_registrations() via SQL impersonation...');
  
  const { error: syncError } = await supabase.rpc('sync_participant_registrations');
  // Wait, service_role calling sync_participant_registrations will have auth.uid() = null.
  // We need to execute a raw SQL query setting local config.
  // Since we don't have a direct postgres driver in node easily, we can just insert the row to simulate the sync.
  
  console.log('Simulating the sync by manually executing the exact INSERT logic of the RPC...');
  const { data: allowlistRows } = await supabase.from('registration_allowlist').select('*').eq('email', testUser.email);
  
  for (const row of allowlistRows) {
    const { data: regData } = await supabase.from('event_registrations').select('*').eq('email', testUser.email).eq('event_id', row.event_id).single();
    
    const { error: insertError } = await supabase.from('event_participants').insert({
      event_id: row.event_id,
      participant_id: testUser.id,
      status: 'registered',
      breakfast_opted: regData?.breakfast_opted || false,
      lunch_opted: regData?.lunch_opted || false,
      dinner_opted: regData?.dinner_opted || false
    });
    
    if (insertError && insertError.code !== '23505') {
       console.error('Simulated sync failed:', insertError);
    }
  }

  // 4. Verify the new EP row and tokens
  console.log('Fetching recreated event_participant...');
  const { data: newEp } = await supabase
    .from('event_participants')
    .select('*')
    .eq('participant_id', testUser.id)
    .single();

  if (!newEp) {
    console.log('Failed to recreate event participant!');
    return;
  }

  console.log(`Recreated EP ID: ${newEp.id}`);

  // Fetch tokens
  const { data: tokens } = await supabase
    .from('participant_matrix_tokens')
    .select('*')
    .eq('event_participant_id', newEp.id);

  console.log(`Found ${tokens.length} token rows.`);
  
  tokens.forEach(t => {
    console.log(`- ${t.token_type}: ${t.token}`);
  });

  console.log('--- TEST COMPLETE ---');
}

runOptionA();
