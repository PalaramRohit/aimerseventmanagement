import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: profiles } = await supabase.from('profiles').select('*').limit(50);
  const { data: event_registrations } = await supabase.from('event_registrations').select('*').limit(50);
  const { data: event_participants } = await supabase.from('event_participants').select('*').limit(50);

  return NextResponse.json({ profiles, event_registrations, event_participants });
}
