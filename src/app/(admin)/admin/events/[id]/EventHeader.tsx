'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, MapPin, Users, Edit3, ArrowLeft } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EventHeader({ event }: { event: any }) {
  const pathname = usePathname()
  
  // Do not render the dashboard header/tabs on edit or import pages
  if (pathname.includes('/edit') || pathname.includes('/import')) {
    return null
  }

  const tabs = [
    { name: 'Overview / Operations', path: `/admin/events/${event.id}` },
    { name: 'Participants', path: `/admin/events/${event.id}/participants` },
    { name: 'Coordinators', path: `/admin/events/${event.id}/coordinators` },
    { name: 'Statistics', path: `/admin/events/${event.id}/statistics` },
    { name: 'Teams', path: `/admin/events/${event.id}/teams` },
    { name: 'Problems', path: `/admin/events/${event.id}/problems` },
  ]

  return (
    <div className="space-y-8 mb-8">
      <div>
        <Link href="/admin/events" prefetch={true} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300 mb-4 transition-colors">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Events
        </Link>
        
        <div className="bg-white dark:bg-[#080d1a] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-cyan-900/30 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className={`px-3 py-1 text-[11px] font-bold tracking-widest uppercase rounded-full flex items-center gap-1.5 ${event.registration_open ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'}`}>
                {event.registration_open ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Registration Open</>
                ) : (
                  <><span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"></span> Registration Closed</>
                )}
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{event.name}</h1>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-slate-600 dark:text-slate-300 font-medium">
              {event.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" />
                  <span>
                    {new Date(event.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {event.end_date && ` — ${new Date(event.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                  </span>
                </div>
              )}
              {event.venue && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500" />
                  <span>{event.venue}</span>
                </div>
              )}
            </div>
            
            {event.description && (
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-3xl leading-relaxed pt-2">
                {event.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto shrink-0 gap-3">
            <Link 
              href={`/admin/events/${event.id}/import`}
              prefetch={true}
              className="bg-white dark:bg-[#0c1427] hover:bg-slate-50 dark:hover:bg-[#131e3b] text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl text-sm font-bold shadow-sm border border-slate-200 dark:border-cyan-900/30 transition-all flex items-center justify-center gap-2"
            >
              <Users size={16} />
              Import Data
            </Link>
            <Link 
              href={`/admin/events/${event.id}/edit`}
              prefetch={true}
              className="bg-[#0a1122] dark:bg-cyan-600 hover:bg-[#152345] dark:hover:bg-cyan-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 dark:shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 group"
            >
              <Edit3 size={16} className="group-hover:scale-110 transition-transform" />
              Edit Event
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-cyan-900/30">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path
            return (
              <Link
                key={tab.name}
                href={tab.path}
                prefetch={true}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-blue-600 dark:border-cyan-400 text-blue-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
