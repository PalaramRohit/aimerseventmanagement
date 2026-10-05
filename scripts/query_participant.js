const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fmvngoriedvsnfmthzvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtdm5nb3JpZWR2c25mbXRoenZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg1MzMxOCwiZXhwIjoyMTA2NDI5MzE4fQ.3mWAfDhRDWeLt7W4p1fN9laUxP2ej1a3EJ3g_wxNFFY'
);

async function main() {
  const { data: profiles, error: err1 } = await supabase.from('profiles').select('*').eq('role', 'participant');
  console.log('--- PROFILES ---');
  console.log(JSON.stringify(profiles, null, 2));
  
  if (profiles && profiles.length > 0) {
    for (const p of profiles) {
      console.log(`\n--- EVENT REGISTRATIONS FOR ${p.email} ---`);
      const { data: er } = await supabase.from('event_registrations').select('*').eq('email', p.email);
      console.log(JSON.stringify(er, null, 2));

      console.log(`\n--- EVENT PARTICIPANTS FOR ${p.id} ---`);
      const { data: ep } = await supabase.from('event_participants').select('*').eq('participant_id', p.id);
      console.log(JSON.stringify(ep, null, 2));
    }
  }
}

main().catch(console.error);
