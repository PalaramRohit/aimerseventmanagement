import { requireParticipant } from '@/lib/auth/server'
import { getParticipantDashboardData } from '@/lib/actions/claim'
import Link from 'next/link'
import { MapPin, Calendar, User } from 'lucide-react'

export default async function ParticipantDashboard() {
  const { user } = await requireParticipant()
  const { claimed, imported } = await getParticipantDashboardData()

  // For the profile, we can show the most recently imported data or aggregate it.
  const primaryImport = imported.length > 0 ? imported[0] : null;

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-[#080d1a]/5 skew-x-[-20deg] translate-x-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Participant Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white drop-shadow-md">Welcome, {primaryImport?.full_name?.split(' ')[0] || 'Participant'}</h1>
            <p className="text-blue-100/80 text-lg max-w-xl">View your event registrations, access your Data Matrix tokens, and manage your profile.</p>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
        <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <User size={16} />
          </div>
          Profile Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div>
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1 block">Account Email</span>
            <span className="font-medium text-slate-700 dark:text-slate-200 text-base">{user.email}</span>
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1 block">Registered Name</span>
            <span className="font-medium text-slate-700 dark:text-slate-200 text-base">{primaryImport?.full_name || 'N/A'}</span>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">My Events</h2>
          <span className="px-3 py-1 bg-slate-100 dark:bg-cyan-900/20 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">{claimed.length} {claimed.length === 1 ? 'Event' : 'Events'}</span>
        </div>
        
        {claimed.length === 0 ? (
          <div className="bg-slate-50 dark:bg-cyan-950/20 border border-dashed border-slate-200 dark:border-cyan-900/30 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white dark:bg-[#080d1a] rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
              <Calendar size={24} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg mb-1">No Events Found</h3>
            <p className="text-slate-500 dark:text-slate-400">You are not registered for any upcoming events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {claimed.map((event: any) => (
              <Link key={event.id} href={`/participant/events/${event.id}`} prefetch={true} className="group h-full block">
                <div className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all hover:border-blue-300 h-full flex flex-col cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent -mr-4 -mt-4 rounded-bl-full z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="px-2.5 py-1 bg-green-100/50 text-green-700 border border-green-200/50 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Registered
                    </div>
                  </div>
                  
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-4 group-hover:text-blue-700 transition-colors relative z-10">{event.name}</h3>
                  
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
                    
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-cyan-900/20 flex gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">Access Active</span>
                      {Object.values(event.meals).some(Boolean) && (
                         <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] font-bold uppercase tracking-wider">Meals Included</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
