import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'


export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role?.trim().toLowerCase()
  if (role !== 'admin') {
    // Basic authorization guard
    redirect('/login')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-cyan-900/30 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-slate-50 dark:bg-[#0a1122] skew-x-[-20deg] translate-x-32 z-0"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            System Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
            Welcome back, {user.email}. You are currently authenticated as an administrator.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/events" prefetch={true} className="group">
          <div className="bg-white dark:bg-[#080d1a] p-6 rounded-2xl border border-slate-100 dark:border-cyan-900/30 hover:border-blue-200 dark:hover:border-cyan-500 hover:shadow-lg hover:shadow-blue-900/5 dark:hover:shadow-cyan-900/20 transition-all duration-300 h-full flex flex-col items-start justify-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-cyan-950/50 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:bg-blue-600 dark:group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-1">Event Management</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Create new events, manage existing ones, configure settings, and handle batch imports.</p>
            <div className="mt-4 text-blue-600 dark:text-cyan-400 font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
              Go to Events
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        </Link>
        <Link href="/admin/settings/admins" prefetch={true} className="group">
          <div className="bg-white dark:bg-[#080d1a] p-6 rounded-2xl border border-slate-100 dark:border-cyan-900/30 hover:border-emerald-200 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/5 dark:hover:shadow-emerald-900/20 transition-all duration-300 h-full flex flex-col items-start justify-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-1">Admin Management</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage who has administrative access to the platform and promote/demote users.</p>
            <div className="mt-4 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
              Manage Admins
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
