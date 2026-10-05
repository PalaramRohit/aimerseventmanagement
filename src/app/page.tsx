import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role?.trim().toLowerCase()
  if (role === 'admin') {
    redirect('/admin')
  }

  // Check if user has any coordinator assignments or pending invitations
  const { count: coordinatorCount } = await supabase
    .from('event_coordinators')
    .select('*', { count: 'exact', head: true })
    .eq('coordinator_id', user.id)

  let isCoordinator = false
  if (coordinatorCount && coordinatorCount > 0) {
    isCoordinator = true
  } else {
    let adminClient = supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      ) as typeof supabase
    }

    const { count: pendingCount } = await adminClient
      .from('registration_allowlist')
      .select('*', { count: 'exact', head: true })
      .ilike('email', user.email || '')
      .eq('invited_role', 'coordinator')
      
    if (pendingCount && pendingCount > 0) {
      isCoordinator = true
    }
  }

  if (isCoordinator) {
    redirect('/coordinator')
  } else {
    redirect('/participant')
  }
}
