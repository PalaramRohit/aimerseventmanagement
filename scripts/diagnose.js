const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Using service role just for diagnostic SELECTs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
  console.log('--- LOCAL DIAGNOSTIC ---');
  
  // 1. Check if participant exists
  const { data: users } = await supabase.auth.admin.listUsers();
  console.log(`Found ${users.users.length} auth users.`);

  // 2. Check event_participants
  const { data: eps, error: epError } = await supabase.from('event_participants').select('id, participant_id, event_id');
  console.log(`Found ${eps ? eps.length : 0} event_participants.`);
  
  if (eps && eps.length > 0) {
    const ep = eps[0];
    console.log(`First EP ID: ${ep.id}`);
    
    // 3. Check tokens for this EP
    const { data: tokens, error: tokensError } = await supabase.from('participant_matrix_tokens').select('*').eq('event_participant_id', ep.id);
    console.log(`Found ${tokens ? tokens.length : 0} tokens for this EP.`);
    if (tokens && tokens.length > 0) {
        console.log('Token Types:', tokens.map(t => t.token_type).join(', '));
    } else {
        console.log('Tokens missing! The participant likely existed BEFORE the trigger was installed.');
    }
  }
}

diagnose();
