import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/login/actions'
import { 
  LayoutDashboard, 
  CalendarDays, 
  LogOut,
  Bell,
  Menu
} from 'lucide-react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = profile?.role?.trim().toLowerCase()
  if (role !== 'admin') {
    redirect('/login')
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Events', href: '/admin/events', icon: CalendarDays },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#060a12] font-sans selection:bg-blue-500/30">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a1122] dark:bg-[#03060a] border-r border-slate-800/0 dark:border-cyan-900/30 text-white flex-shrink-0 z-20 shadow-2xl relative">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white p-1.5 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.2)] dark:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <Image src="/aimers-logo.jpeg" alt="AIMERS Logo" width={32} height={32} className="rounded-full" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight text-white leading-none">AIMERS</h1>
              <div className="text-[9px] font-bold text-cyan-400 tracking-widest uppercase mt-0.5">Admin Portal</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">MVSR ENGINEERING COLLEGE</p>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.name} href={item.href} prefetch={true}>
                <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors group">
                  <Icon size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <form action={logout}>
            <button type="submit" className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors group">
              <LogOut size={18} className="text-slate-500 group-hover:text-red-400 transition-colors" />
              Sign Out
            </button>
          </form>
          <div className="mt-4 text-center text-[10px] text-slate-600">
            &copy; 2026 AIMERS. All rights reserved.
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER & DRAWER (To be fully implemented via client component if needed, for now standard responsive) */}
      
      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* TOP HEADER */}
        <header className="h-16 bg-white dark:bg-[#080d1a] border-b border-slate-200 dark:border-cyan-900/30 flex items-center justify-between px-4 sm:px-8 z-10 flex-shrink-0 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 dark:text-slate-400 p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
              <Menu size={20} />
            </button>
            <div>
              <h2 className="hidden sm:block text-base font-bold text-slate-800 dark:text-white">AIMERS Admin Portal</h2>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-cyan-200/60">Manage events, participants and coordinators</p>
              <h2 className="sm:hidden text-base font-bold text-slate-800 dark:text-white">AIMERS Admin</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-cyan-400 relative p-2 transition-colors">
              <Bell size={18} />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{profile?.full_name || 'Admin User'}</p>
                <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">{role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-cyan-950 flex items-center justify-center text-indigo-700 dark:text-cyan-400 font-bold border border-indigo-200 dark:border-cyan-800 shrink-0">
                {(profile?.full_name || 'A')[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 relative">
          {/* Centered Logo Watermark for Dark Mode (lazy loaded to prevent blocking actionable UI) */}
          <div className="hidden dark:flex fixed inset-0 pointer-events-none items-center justify-center opacity-[0.08] z-0 mix-blend-screen">
            <div className="relative w-[800px] h-[800px] motion-safe:animate-[spin_20s_linear_infinite]">
              <Image 
                src="/aimers-logo.jpeg" 
                alt="" 
                fill 
                className="object-contain rounded-full"
                loading="lazy"
                sizes="800px"
              />
            </div>
          </div>
          
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
