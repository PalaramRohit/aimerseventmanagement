
'use server'

import { requireAdmin } from '@/lib/auth/server'
import { revalidatePath } from 'next/cache'

export async function createProblemStatement(eventId: string, formData: FormData) {
  const { supabase } = await requireAdmin()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const is_published = formData.get('is_published') === 'true'
  
  if (!title || !description) {
    return { error: 'Title and description are required' }
  }

  const { error } = await supabase
    .from('event_problem_statements')
    .insert([{ event_id: eventId, title, description, is_published }])

  if (error) {
    if (error.code === '23505') {
      return { error: 'A problem statement with this title already exists' }
    }
    return { error: 'Failed to create problem statement' }
  }

  revalidatePath(`/admin/events/${eventId}/problems`)
  return { success: true }
}

export async function updateProblemStatement(eventId: string, problemId: string, formData: FormData) {
  const { supabase } = await requireAdmin()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const is_published = formData.get('is_published') === 'true'
  
  if (!title || !description) {
    return { error: 'Title and description are required' }
  }

  const { error } = await supabase
    .from('event_problem_statements')
    .update({ title, description, is_published })
    .eq('id', problemId)
    .eq('event_id', eventId)

  if (error) {
    return { error: 'Failed to update problem statement' }
  }

  revalidatePath(`/admin/events/${eventId}/problems`)
  return { success: true }
}

export async function deleteProblemStatement(eventId: string, problemId: string) {
  const { supabase } = await requireAdmin()
  
  const { error } = await supabase
    .from('event_problem_statements')
    .delete()
    .eq('id', problemId)
    .eq('event_id', eventId)

  if (error) {
    return { error: 'Failed to delete problem statement' }
  }

  revalidatePath(`/admin/events/${eventId}/problems`)
  return { success: true }
}

export async function toggleProblemStatementStatus(eventId: string, problemId: string, is_published: boolean) {
  const { supabase } = await requireAdmin()
  
  const { error } = await supabase
    .from('event_problem_statements')
    .update({ is_published })
    .eq('id', problemId)
    .eq('event_id', eventId)

  if (error) {
    return { error: 'Failed to update status' }
  }

  revalidatePath(`/admin/events/${eventId}/problems`)
  return { success: true }
}

export async function getProblemStatements(eventId: string) {
  const { supabase } = await requireAdmin()
  
  const { data: problems, error: pError } = await supabase
    .from('event_problem_statements')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (pError) {
    return { error: 'Failed to fetch problem statements' }
  }

  const { data: teams, error: tError } = await supabase
    .from('event_teams')
    .select('id, name, problem_statement_id')
    .eq('event_id', eventId)
    
  if (tError) {
    return { error: 'Failed to fetch teams' }
  }

  return { data: { problems, teams } }
}
