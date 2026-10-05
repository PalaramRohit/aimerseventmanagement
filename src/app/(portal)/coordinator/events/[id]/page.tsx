import { requireCoordinator } from '@/lib/auth/server'
import { notFound } from 'next/navigation'
import { MapPin, Calendar } from 'lucide-react'
import { Scanner } from '@/components/coordinator/Scanner'
import { MyScanHistory } from './MyScanHistory'

export default async function CoordinatorEventDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await requireCoordinator()

  // Verify the user is assigned as coordinator for this event
  const { data: assignment, error: assignError } = await supabase
    .from('event_coordinators')
    .select(`
      events (
        id,
        name,
        venue,
        start_date,
        end_date,
        breakfast_enabled,
        lunch_enabled,
        dinner_enabled
      ),
      task_attendance,
      task_breakfast,
      task_lunch,
      task_dinner,
      station
    `)
    .eq('event_id', id)
    .eq('coordinator_id', user.id)
    .single()

  if (assignError || !assignment || !assignment.events) {
    notFound()
  }

  const event = assignment.events

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent"></div>
        <div className="absolute left-0 bottom-0 top-0 w-64 bg-white dark:bg-[#080d1a]/5 skew-x-[20deg] -translate-x-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-200 text-xs font-bold tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              Coordinator Dashboard
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 text-white drop-shadow-md">{event.name}</h1>
            <p className="text-indigo-100/80 text-lg max-w-xl">Manage check-ins and meal access securely using the Data Matrix scanner.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
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

          <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <MapPin size={16} />
              </div>
              My Responsibilities
            </h2>
            <div className="space-y-4">
              {assignment.station && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Station:</span>
                  <span className="font-bold text-indigo-900">{assignment.station}</span>
                </div>
              )}
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                {assignment.task_attendance && <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Attendance Scanning</div>}
                {assignment.task_breakfast && event.breakfast_enabled && <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Breakfast Scanning</div>}
                {assignment.task_lunch && event.lunch_enabled && <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Lunch Scanning</div>}
                {assignment.task_dinner && event.dinner_enabled && <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Dinner Scanning</div>}
                
                {!assignment.task_attendance && !assignment.task_breakfast && !assignment.task_lunch && !assignment.task_dinner && (
                  <div className="text-slate-400 italic">No scanning tasks assigned.</div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-8">
          <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-4 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] h-full min-h-[500px] flex flex-col">
            <Scanner 
              eventId={event.id} 
              operations={{
                attendance: !!assignment.task_attendance,
                breakfast: !!event.breakfast_enabled && !!assignment.task_breakfast,
                lunch: !!event.lunch_enabled && !!assignment.task_lunch,
                dinner: !!event.dinner_enabled && !!assignment.task_dinner
              }} 
            />
          </section>
          
          <MyScanHistory eventId={event.id} />
        </div>
      </div>
    </div>
  )
}

