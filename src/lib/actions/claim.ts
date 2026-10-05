'use server'

import { requireAuth } from '@/lib/auth/server'
import { revalidatePath } from 'next/cache'

export async function getParticipantDashboardData() {
  const { supabase, user } = await requireAuth()

  // 1. Sync participant registrations automatically
  const { error: syncError } = await supabase.rpc('sync_participant_registrations')
  if (syncError) {
    console.error("Failed to sync participant registrations:", syncError)
    // We can still try to fetch data even if sync fails
  }

  // 2. Get already claimed events (event_participants)
  const { data: claimedRaw, error: claimedError } = await supabase
    .from('event_participants')
    .select(`
      event_id,
      registered_at,
      breakfast_opted,
      lunch_opted,
      dinner_opted,
      events (
        id,
        name,
        venue,
        start_date,
        end_date
      )
    `)
    .eq('participant_id', user.id)

  if (claimedError) throw new Error("Failed to fetch claimed events")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const claimed = claimedRaw.map((row: any) => ({
    ...row.events,
    registered_at: row.registered_at,
    meals: {
      breakfast: row.breakfast_opted,
      lunch: row.lunch_opted,
      dinner: row.dinner_opted
    }
  }))

  // 3. Get imported registration data securely
  const { data: importedData, error: importedError } = await supabase.rpc('get_my_event_registrations')
  
  if (importedError) {
    console.error("Failed to fetch imported registration data:", importedError)
  }

  return { claimed, imported: importedData || [] }
}

export async function getCoordinatorDashboardData() {
  const { supabase, user } = await requireAuth()

  // 1. Get already assigned events (event_coordinators)
  const { data: assignedRaw, error: assignedError } = await supabase
    .from('event_coordinators')
    .select(`
      event_id,
      events (
        id,
        name,
        venue,
        start_date,
        end_date
      )
    `)
    .eq('coordinator_id', user.id)

  if (assignedError) throw new Error("Failed to fetch assigned events")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assigned = assignedRaw.map((row: any) => row.events)

  // 2. Get eligible events via hardened RPC
  const { data: eligible, error: eligibleError } = await supabase.rpc('get_eligible_coordinator_events')
  
  if (eligibleError) throw new Error("Failed to fetch eligible events")

  return { assigned, eligible }
}

export async function claimCoordinatorEventAction(eventId: string) {
  try {
    const { supabase } = await requireAuth()

    const { error } = await supabase.rpc('claim_coordinator_event', {
      p_event_id: eventId
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/coordinator')
    return { success: true }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message || "Failed to claim coordinator event" }
    }
    return { error: "Failed to claim coordinator event" }
  }
}
