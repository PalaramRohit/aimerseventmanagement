import { requireParticipant } from '@/lib/auth/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Calendar, QrCode, FileText, Users, Shield, User, Clock } from 'lucide-react'
import { DataMatrix } from '@/components/participant/DataMatrix'

import { ParticipantDirectory } from './ParticipantDirectory'
import { ParticipantGuide } from './ParticipantGuide'
import { ProjectSubmission } from './ProjectSubmission'


export default async function ParticipantEventDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await requireParticipant()

  // Verify the user is registered for this event
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: registration, error: regError } = await (supabase as any)
    .from('event_participants')
    .select(`
      id,
      team_id,
      team_role,
      breakfast_opted,
      lunch_opted,
      dinner_opted,
      registered_at,
      events (
        id,
        name,
        venue,
        start_date,
        end_date,
        registration_open,
        attendance_enabled,
        breakfast_enabled,
        lunch_enabled,
        dinner_enabled
      ),
      participant_matrix_tokens (
        token_type,
        token
      )
    `)
    .eq('event_id', id)
    .eq('participant_id', user.id)
    .single()

  if (regError || !registration || !registration.events) {
    notFound()
  }

  const event = Array.isArray(registration.events) ? registration.events[0] : registration.events
  const tokens = registration.participant_matrix_tokens || []

  const getToken = (type: string) => tokens.find((t: { token_type: string, token: string }) => t.token_type === type)?.token

  // Fetch Team Data if applicable
  let teamData = null
  type TeamMember = { email: string, full_name: string | null, team_role: string | null, isRegistered: boolean }
  let teamMembers: TeamMember[] = []
  
  const untypedSupabase = supabase as unknown as import('@supabase/supabase-js').SupabaseClient
  if (registration.team_id) {
    const { data: team } = await untypedSupabase
      .from('event_teams')
      .select('name, problem_statement_id, github_url, deployed_url, submitted_at')
      .eq('id', registration.team_id)
      .single()
      
    if (team) {
      teamData = team
      
      // Fetch registrations for this team
      // Fetch registrations for this team
      const { data: members } = await supabase
        .from('event_registrations')
        .select('email, full_name, team_role')
        .eq('event_id', id)
        .eq('team_id', registration.team_id)
        
      if (members) {
        // Fetch event_participants to check sync status
        // Fetch event_participants to check sync status
        const { data: participants } = await supabase
          .from('event_participants')
          .select('profiles!inner(email)')
          .eq('event_id', id)
          .eq('team_id', registration.team_id)
          
        type ParticipantProfile = { profiles: { email: string } }
        const syncedEmails = new Set((participants as ParticipantProfile[])?.map(p => p.profiles?.email?.toLowerCase()))
        
        teamMembers = members.map((m: { email: string, full_name: string | null, team_role: string | null }) => ({
          ...m,
          isRegistered: syncedEmails.has(m.email?.toLowerCase())
        })).sort((a: { team_role: string | null }, b: { team_role: string | null }) => a.team_role === 'leader' ? -1 : b.team_role === 'leader' ? 1 : 0)
      }
    }
  }

  // Problem statements are now fetched in the dedicated /problems subpage

  // Determine which tokens to show based on event settings AND participant opt-in
  const showAttendance = true // Always show attendance when participant exists
  const showBreakfast = event.breakfast_enabled && registration.breakfast_opted
  const showLunch = event.lunch_enabled && registration.lunch_opted
  const showDinner = event.dinner_enabled && registration.dinner_opted

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-[#080d1a]/5 skew-x-[-20deg] translate-x-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Registered Event
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 text-white drop-shadow-md">{event.name}</h1>
            <p className="text-blue-100/80 text-lg max-w-xl">You are officially registered for this AIMERS event. Present your Data Matrix tokens below for access.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Calendar size={16} />
              </div>
              Event Details
            </h2>
            <div className="space-y-6 text-slate-600 dark:text-slate-300">
              {event.venue && (
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-slate-50 dark:bg-cyan-950/20 rounded-lg text-slate-400"><MapPin size={18} /></div>
                  <div>
                    <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">Venue</div>
                    <div className="font-medium text-slate-700 dark:text-slate-200">{event.venue}</div>
                  </div>
                </div>
              )}
              {event.start_date && (
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-slate-50 dark:bg-cyan-950/20 rounded-lg text-slate-400"><Calendar size={18} /></div>
                  <div>
                    <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">Date & Time</div>
                    <div className="font-medium text-slate-700 dark:text-slate-200">
                      {new Date(event.start_date).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {event.end_date && ` - ${new Date(event.end_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col">
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              Meal Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-cyan-950/20 border border-slate-100 dark:border-cyan-900/20">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Breakfast</span>
                {registration.breakfast_opted ? (
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">OPTED IN</span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-md">OPTED OUT</span>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-cyan-950/20 border border-slate-100 dark:border-cyan-900/20">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Lunch</span>
                {registration.lunch_opted ? (
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">OPTED IN</span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-md">OPTED OUT</span>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-cyan-950/20 border border-slate-100 dark:border-cyan-900/20">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Dinner</span>
                {registration.dinner_opted ? (
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">OPTED IN</span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-md">OPTED OUT</span>
                )}
              </div>
            </div>
          </section>

          {teamData && (
            <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Users size={16} />
                    </div>
                    My Team
                  </h2>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-2">{teamData.name}</p>
                </div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-100 flex items-center gap-1.5">
                  <Shield size={12} />
                  {registration.team_role}
                </div>
              </div>
              
              <div className="space-y-3 mt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Members</h3>
                {teamMembers.map((member: TeamMember, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-cyan-900/20 bg-white dark:bg-[#080d1a] shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${member.team_role === 'leader' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 dark:bg-cyan-900/20 text-slate-400'}`}>
                        {member.team_role === 'leader' ? <Shield size={14} /> : <User size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate" title={member.full_name || 'No Name'}>
                          {member.full_name || 'No Name'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{member.team_role}</p>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      {member.isRegistered ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-100">
                          Registered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded border border-amber-100" title="Pending Login">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {teamData && (
            <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center sm:items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0 text-violet-600 dark:text-violet-400">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">Problem Statements</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 sm:line-clamp-1">View available challenges and your team&apos;s selection.</p>
                </div>
              </div>
              <Link 
                href={`/participant/events/${id}/problems`}
                className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors text-center shrink-0 shadow-sm whitespace-nowrap"
              >
                View Statements
              </Link>
            </section>
          )}

          {teamData && teamData.problem_statement_id && (
            <ProjectSubmission 
              eventId={id}
              isLeader={registration.team_role === 'leader'}
              githubUrl={teamData.github_url}
              deployedUrl={teamData.deployed_url}
              submittedAt={teamData.submitted_at}
            />
          )}
        </div>

        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] h-fit">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-cyan-900/20">
              <div>
                <h2 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <QrCode size={20} />
                  </div>
                  Access Tokens
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Present these Data Matrix codes to coordinators for scanning.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {showAttendance && (
                <div className="group flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-white border border-slate-200 dark:border-cyan-900/30 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                  <div className="w-full flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight text-lg">Attendance</h3>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                    </div>
                  </div>
                  {getToken('attendance') ? (
                    <div className="bg-white dark:bg-[#080d1a] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-cyan-900/30 group-hover:scale-105 transition-transform duration-300">
                      <DataMatrix value={getToken('attendance') || ''} />
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-sm text-slate-400 font-medium bg-slate-50 dark:bg-cyan-950/20 rounded-xl w-full border border-dashed border-slate-300">Pending generation</div>
                  )}
                </div>
              )}

              {showBreakfast && (
                <div className="group flex flex-col items-center justify-center p-8 bg-gradient-to-b from-orange-50/50 to-white border border-slate-200 dark:border-cyan-900/30 rounded-2xl hover:border-orange-300 hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-300">
                  <div className="w-full flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight text-lg">Breakfast</h3>
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
                    </div>
                  </div>
                  {getToken('breakfast') ? (
                    <div className="bg-white dark:bg-[#080d1a] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-cyan-900/30 group-hover:scale-105 transition-transform duration-300">
                      <DataMatrix value={getToken('breakfast') || ''} />
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-sm text-slate-400 font-medium bg-slate-50 dark:bg-cyan-950/20 rounded-xl w-full border border-dashed border-slate-300">Pending generation</div>
                  )}
                </div>
              )}

              {showLunch && (
                <div className="group flex flex-col items-center justify-center p-8 bg-gradient-to-b from-amber-50/50 to-white border border-slate-200 dark:border-cyan-900/30 rounded-2xl hover:border-amber-300 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300">
                  <div className="w-full flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight text-lg">Lunch</h3>
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                    </div>
                  </div>
                  {getToken('lunch') ? (
                    <div className="bg-white dark:bg-[#080d1a] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-cyan-900/30 group-hover:scale-105 transition-transform duration-300">
                      <DataMatrix value={getToken('lunch') || ''} />
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-sm text-slate-400 font-medium bg-slate-50 dark:bg-cyan-950/20 rounded-xl w-full border border-dashed border-slate-300">Pending generation</div>
                  )}
                </div>
              )}

              {showDinner && (
                <div className="group flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-50/50 to-white border border-slate-200 dark:border-cyan-900/30 rounded-2xl hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
                  <div className="w-full flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight text-lg">Dinner</h3>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/></svg>
                    </div>
                  </div>
                  {getToken('dinner') ? (
                    <div className="bg-white dark:bg-[#080d1a] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-cyan-900/30 group-hover:scale-105 transition-transform duration-300">
                      <DataMatrix value={getToken('dinner') || ''} />
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-sm text-slate-400 font-medium bg-slate-50 dark:bg-cyan-950/20 rounded-xl w-full border border-dashed border-slate-300">Pending generation</div>
                  )}
                </div>
              )}

              {!showAttendance && !showBreakfast && !showLunch && !showDinner && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-50 dark:bg-cyan-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-cyan-900/30">
                  <QrCode className="text-slate-300 w-12 h-12 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No scanning operations are available for you at this event.</p>
                </div>
              )}

            </div>
          </section>
          <ParticipantGuide />
        </div>
      </div>
      
      <ParticipantDirectory eventId={id} currentUserId={user.id} />
    </div>
  )
}


