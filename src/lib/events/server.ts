import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getCachedEvent = cache(async (id: string) => {
  const supabase = await createClient()
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  return { event, error }
})
