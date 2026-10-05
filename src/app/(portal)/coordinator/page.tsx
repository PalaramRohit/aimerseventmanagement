import { requireCoordinator } from '@/lib/auth/server'
import { getCoordinatorDashboardData } from '@/lib/actions/claim'
import Link from 'next/link'
import { MapPin, Calendar, CheckCircle } from 'lucide-react'
import ClaimCoordinatorEventButton from './ClaimCoordinatorEventButton'

export default async function CoordinatorDashboard() {
  await requireCoordinator()
  const { assigned, eligible } = await getCoordinatorDashboardData()

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-indigo-900/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-[#080d1a]/5 skew-x-[-20deg] translate-x-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-200 text-xs font-bold tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Coordinator Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white drop-shadow-md">Operations Dashboard</h1>
            <p className="text-indigo-100/80 text-lg max-w-xl">Manage your assigned events, scan participant tokens, and track operations.</p>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">Assigned Events</h2>
          <span className="px-3 py-1 bg-slate-100 dark:bg-cyan-900/20 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">{assigned.length} {assigned.length === 1 ? 'Event' : 'Events'}</span>
        </div>
        
        {assigned.length === 0 ? (
          <div className="bg-slate-50 dark:bg-cyan-950/20 border border-dashed border-slate-200 dark:border-cyan-900/30 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white dark:bg-[#080d1a] rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
              <Calendar size={24} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg mb-1">No Active Assignments</h3>
            <p className="text-slate-500 dark:text-slate-400">You do not have any active event coordinator assignments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assigned.map(event => (
              <Link key={event.id} href={`/coordinator/events/${event.id}`} className="group h-full block">
                <div className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all hover:border-indigo-300 h-full flex flex-col cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent -mr-4 -mt-4 rounded-bl-full z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Assigned
                    </div>
                  </div>
                  
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-4 group-hover:text-indigo-700 transition-colors relative z-10 line-clamp-2">{event.name}</h3>
                  
                  <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400 mt-auto relative z-10">
                    {event.venue && (
                      <div className="flex items-start gap-2.5">
                        <MapPin size={16} className="shrink-0 text-slate-400 mt-0.5" />
                        <span className="font-medium">{event.venue}</span>
                      </div>
                    )}
                    {event.start_date && (
                      <div className="flex items-start gap-2.5">
                        <Calendar size={16} className="shrink-0 text-slate-400 mt-0.5" />
                        <span className="font-medium">{new Date(event.start_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-cyan-900/20 flex items-center gap-1.5 text-indigo-600 font-bold text-sm relative z-10 group-hover:gap-2 transition-all">
                    Open Scanner
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {eligible.length > 0 && (
        <section className="mt-12 pt-12 border-t border-slate-200 dark:border-cyan-900/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">Pending Assignments</h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{eligible.length} Pending</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligible.map(event => (
              <div key={event.id} className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-50 to-transparent -mr-4 -mt-4 rounded-bl-full z-0 opacity-50"></div>
                
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <div className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Action Required
                  </div>
                </div>
                
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-4 relative z-10 line-clamp-2">{event.name}</h3>
                
                <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400 mb-6 relative z-10">
                  {event.venue && (
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="shrink-0 text-slate-400 mt-0.5" />
                      <span className="font-medium">{event.venue}</span>
                    </div>
                  )}
                  {event.start_date && (
                    <div className="flex items-start gap-2.5">
                      <Calendar size={16} className="shrink-0 text-slate-400 mt-0.5" />
                      <span className="font-medium">{new Date(event.start_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto relative z-10">
                  <ClaimCoordinatorEventButton eventId={event.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}


