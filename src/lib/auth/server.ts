import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export const requireAuth = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return { user, supabase }
})

export const requireAdmin = cache(async () => {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return { user, supabase }
})

export const requireParticipant = cache(async () => {
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
})

export const requireCoordinator = cache(async () => {
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
})

