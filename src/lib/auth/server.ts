import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
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

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return { user, supabase }
}
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return { user, supabase }
}

export async function requireParticipant() {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role?.trim().toLowerCase()
  if (role === 'admin') {
    redirect('/admin')
  }

  // A coordinator could technically be a participant, but the instructions say:
  // "The Coordinator must NOT be rendered as a Participant by default."
  // So we redirect coordinators to /coordinator from the root participant page?
  // Actually, if we do that they can NEVER access the participant portal.
  // The instruction says "If the authenticated user is neither admin nor an assigned coordinator then -> /participant"
  // Let's redirect coordinators to /coordinator as well if they hit /participant, since they should land there.
  // Wait, if they are directed to /coordinator, they can't see their own participation!
  // I will just enforce Admin -> /admin for now, and see if I need to redirect coordinators.
  // The prompt says "Coordinator attempting: /admin must be denied unless the user is actually an admin. ... Participant attempting: /coordinator must be denied. Admin must be able to access Admin Portal... "
  // Let's just block Admin from Participant portal.
  // Wait! "If the authenticated user is neither: admin nor an assigned coordinator then: -> /participant and render the Participant Portal."
  // This implies if they ARE a coordinator, they should go to /coordinator! Let's enforce that.

  const { count: coordinatorCount } = await supabase
    .from('event_coordinators')
    .select('*', { count: 'exact', head: true })
    .eq('coordinator_id', user.id)

  let isCoordinator = false
  if (coordinatorCount && coordinatorCount > 0) {
    isCoordinator = true
  } else {
    // Check if they are a pending coordinator
    const { count: pendingCount } = await supabase
      .from('registration_allowlist')
      .select('*', { count: 'exact', head: true })
      .ilike('email', user.email || '')
      .eq('invited_role', 'coordinator')
      
    if (pendingCount && pendingCount > 0) {
      isCoordinator = true
    }
  }

  if (isCoordinator) {
    // If they have coordinator assignments or invitations, their portal is /coordinator.
    redirect('/coordinator')
  }

  return { user, supabase }
}

export async function requireCoordinator() {
  const { user, supabase } = await requireAuth()

  // Find user global role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    return { user, supabase }
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
    const { count: pendingCount } = await supabase
      .from('registration_allowlist')
      .select('*', { count: 'exact', head: true })
      .ilike('email', user.email || '')
      .eq('invited_role', 'coordinator')
      
    if (pendingCount && pendingCount > 0) {
      isCoordinator = true
    }
  }
    
  if (!isCoordinator) {
    redirect('/participant') // Redirect to their default portal if unauthorized
  }

  return { user, supabase }
}
