'use server'

import { requireParticipant } from '@/lib/auth/server'
import { revalidatePath } from 'next/cache'

export async function selectProblemStatement(eventId: string, teamId: string, problemStatementId: string) {
  const { supabase, user } = await requireParticipant()
  
  // 1. Verify the user is a member of this team for this event
  const { data: participation, error: pError } = await supabase
    .from('event_participants')
    .select('id')
    .eq('event_id', eventId)
    .eq('team_id', teamId)
    .eq('participant_id', user.id)
    .single()
    
  if (pError || !participation) {
    return { error: 'Unauthorized: You are not a member of this team.' }
  }

  // 2. Verify the team hasn't already selected a problem statement
  const { data: team, error: tError } = await supabase
    .from('event_teams')
    .select('problem_statement_id')
    .eq('id', teamId)
    .eq('event_id', eventId)
    .single()
    
  if (tError || !team) {
    return { error: 'Team not found.' }
  }
  
  if (team.problem_statement_id !== null) {
    return { error: 'Your team has already selected a problem statement.' }
  }
  
  // 3. Verify the problem statement belongs to this event and is published
  const { data: statement, error: sError } = await supabase
    .from('event_problem_statements')
    .select('id')
    .eq('id', problemStatementId)
    .eq('event_id', eventId)
    .eq('is_published', true)
    .single()
    
  if (sError || !statement) {
    return { error: 'Invalid or unpublished problem statement.' }
  }

  // 4. Perform the update securely using service_role client because
  // we do not want to give participants raw UPDATE access to event_teams.
  // We verified authorization above.
  
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { error: updateError } = await adminClient
    .from('event_teams')
    .update({ problem_statement_id: problemStatementId })
    .eq('id', teamId)
    .eq('event_id', eventId)
    .is('problem_statement_id', null) // Optimistic concurrency check
    
  if (updateError) {
    return { error: 'Failed to save selection. Someone else may have just selected.' }
  }
  
  revalidatePath(`/participant/events/${eventId}`)
  return { success: true }
}

export async function submitProject(eventId: string, githubUrl: string, deployedUrl: string) {
  const { supabase, user } = await requireParticipant()
  
  // 1. Verify the user is a member of a team for this event, and is the leader
  const { data: participation, error: pError } = await supabase
    .from('event_participants')
    .select('team_id, team_role')
    .eq('event_id', eventId)
    .eq('participant_id', user.id)
    .single()
    
  if (pError || !participation || !participation.team_id) {
    return { error: 'Unauthorized: You are not a member of a team.' }
  }
  
  if (participation.team_role !== 'leader') {
    return { error: 'Unauthorized: Only the team leader can submit the project.' }
  }
  
  const teamId = participation.team_id

  // 2. Validate URLs
  if (!githubUrl || !githubUrl.trim().toLowerCase().startsWith('https://github.com/')) {
    return { error: 'Invalid GitHub URL. Must start with https://github.com/' }
  }
  
  const cleanGithub = githubUrl.trim()
  let cleanDeployed = null
  
  if (deployedUrl && deployedUrl.trim()) {
    const url = deployedUrl.trim().toLowerCase()
    if (!url.startsWith('https://')) {
      return { error: 'Invalid Deployed Project URL. Must start with https://' }
    }
    cleanDeployed = deployedUrl.trim()
  }

  // 3. Verify the team hasn't already submitted
  const untypedSupabase = supabase as unknown as import('@supabase/supabase-js').SupabaseClient
  const { data: team, error: tError } = await untypedSupabase
    .from('event_teams')
    .select('submitted_at, problem_statement_id')
    .eq('id', teamId)
    .eq('event_id', eventId)
    .single()
    
  if (tError || !team) {
    return { error: 'Team not found.' }
  }
  
  if (team.submitted_at !== null) {
    return { error: 'Your team has already submitted a project.' }
  }
  
  if (team.problem_statement_id === null) {
    return { error: 'You must select a problem statement before submitting.' }
  }

  // 4. Perform the update securely using service_role client
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { error: updateError } = await adminClient
    .from('event_teams')
    .update({ 
      github_url: cleanGithub,
      deployed_url: cleanDeployed,
      submitted_at: new Date().toISOString()
    })
    .eq('id', teamId)
    .eq('event_id', eventId)
    .is('submitted_at', null) // Optimistic concurrency check
    
  if (updateError) {
    return { error: 'Failed to submit project. Another leader may have just submitted.' }
  }
  
  revalidatePath(`/participant/events/${eventId}`)
  return { success: true }
}
