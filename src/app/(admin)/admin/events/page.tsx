import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/server'
import { Plus, Calendar, MapPin, Settings2, BarChart3, Radio } from 'lucide-react'

export default async function AdminEventsPage() {
  const { supabase } = await requireAdmin()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-900/50 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-3 text-red-500 dark:text-red-400 font-bold text-xl">!</div>
          <h2 className="text-lg font-bold">Failed to load events</h2>
          <p className="text-sm mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  const totalEvents = events.length
  const activeEvents = events.filter(e => e.registration_open).length

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300 mb-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Manage Events</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Create, view and manage all AIMERS events</p>
        </div>
        <Link 
          href="/admin/events/new" 
          className="w-full sm:w-auto bg-[#0a1122] dark:bg-cyan-600 hover:bg-[#152345] dark:hover:bg-cyan-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/10 dark:shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          Create Event
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#080d1a] rounded-xl p-5 border border-slate-100 dark:border-cyan-900/30 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-cyan-950/50 text-blue-600 dark:text-cyan-400 rounded-lg">
              <BarChart3 size={18} />
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-wide">Total Events</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalEvents}</div>
        </div>
        <div className="bg-white dark:bg-[#080d1a] rounded-xl p-5 border border-slate-100 dark:border-cyan-900/30 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Radio size={18} />
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-wide">Registration Open</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{activeEvents}</div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-white dark:bg-[#080d1a] border border-dashed border-slate-200 dark:border-cyan-900/30 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 dark:bg-cyan-950/30 rounded-full flex items-center justify-center text-slate-300 dark:text-cyan-600/50 mb-4 border border-slate-100 dark:border-cyan-900/20">
            <Calendar size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">No events found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">You haven&apos;t created any events yet. Click the button above to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/admin/events/${event.id}`} className="group block h-full">
              <div className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/30 rounded-2xl p-6 h-full flex flex-col hover:border-blue-200 dark:hover:border-cyan-500 hover:shadow-lg hover:shadow-blue-900/5 dark:hover:shadow-cyan-900/20 transition-all duration-300 relative overflow-hidden">
                
                {/* Subtle top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 dark:from-cyan-500/50 to-teal-400/20 dark:to-blue-500/50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>

                <div className="flex justify-between items-start mb-5">
                  <div className={`px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full flex items-center gap-1.5 ${event.registration_open ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'}`}>
                    {event.registration_open ? (
                      <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Registration Open</>
                    ) : (
                      <><span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"></span> Registration Closed</>
                    )}
                  </div>
                  <div className="text-slate-300 dark:text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    <Settings2 size={18} />
                  </div>
                </div>

                <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3 group-hover:text-blue-700 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-tight">{event.name}</h2>
                
                <div className="space-y-2.5 mt-auto pt-4">
                  {event.start_date && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar size={14} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 shrink-0" />
                      <span className="truncate">
                        {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        {event.end_date && ` — ${new Date(event.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </span>
                    </div>
                  )}
                  {event.venue && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                      <MapPin size={14} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
