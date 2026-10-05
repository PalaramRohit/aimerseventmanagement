'use server'

import { requireCoordinator } from '@/lib/auth/server'

export async function validateScan(eventId: string, operation: string, token: string) {
  try {
    const { supabase } = await requireCoordinator()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('record_matrix_operation', {
      p_event_id: eventId,
      p_operation: operation,
      p_token: token
    })

    if (error) {
      console.error('Scan validation error:', error)
      return { success: false, message: 'Server error during validation.' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data as any

  } catch (error) {
    console.error('Scan validation error:', error)
    return { success: false, message: 'Server error during validation.' }
  }
}
