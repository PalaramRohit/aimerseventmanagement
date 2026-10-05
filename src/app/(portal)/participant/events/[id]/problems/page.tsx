import { requireParticipant } from '@/lib/auth/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, Target } from 'lucide-react'
import Link from 'next/link'
import { ProblemList } from './ProblemList'

export default async function ParticipantProblemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await requireParticipant()

  // 1. Verify the user is registered for this event
  const { data: registration, error: regError } = await supabase
    .from('event_participants')
    .select(`
      id,
      team_id,
      team_role,
      events (
        name
      )
    `)
    .eq('event_id', id)
    .eq('participant_id', user.id)
    .single()

  if (regError || !registration || !registration.events) {
    notFound()
  }

  const eventName = Array.isArray(registration.events) ? registration.events[0].name : registration.events.name

  // 2. Fetch Team Data if applicable
  let initialSelectionId = null
  const teamId = registration.team_id
  let isLeader = false

  if (teamId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: team } = await (supabase as any)
      .from('event_teams')
      .select('problem_statement_id')
      .eq('id', teamId)
      .single()
      
    if (team) {
      initialSelectionId = team.problem_statement_id
    }
    
    isLeader = registration.team_role === 'leader'
  }

  // 3. Fetch published problem statements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: problemStatements, error: probError } = await (supabase as any)
    .from('event_problem_statements')
    .select('id, title, description')
    .eq('event_id', id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (probError) {
    console.error('Error fetching problem statements:', probError)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-6">
          <Link 
            href={`/participant/events/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-cyan-900/20 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Event
          </Link>
          
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Target size={24} />
              </div>
              Problem Statements
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
              Review and select the challenge your team will solve for <strong className="text-slate-700 dark:text-slate-300">{eventName}</strong>.
            </p>
          </div>
        </div>

        {/* Content */}
        {!teamId ? (
          <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-3xl text-center">
            <h2 className="text-amber-800 dark:text-amber-300 font-bold text-lg mb-2">Team Required</h2>
            <p className="text-amber-600 dark:text-amber-400/80">You must be part of a team to view and select problem statements. Return to the event dashboard to manage your team.</p>
          </div>
        ) : (
          <ProblemList 
            eventId={id}
            teamId={teamId}
            problemStatements={problemStatements || []}
            initialSelectionId={initialSelectionId}
            isLeader={isLeader}
          />
        )}
      </div>
    </div>
  )
}
