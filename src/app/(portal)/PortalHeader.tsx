'use client'

import Link from 'next/link'
import { LogOut, User, ShieldAlert, BadgeCheck, LayoutDashboard } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function PortalHeader({ userEmail, isCoordinator, isAdmin }: { userEmail: string, isCoordinator: boolean, isAdmin: boolean }) {
  const pathname = usePathname()
  
  let portalName = 'Portal'
  let Icon = LayoutDashboard
  let headerStyle = 'bg-white dark:bg-[#080d1a]/90 border-slate-200 dark:border-cyan-900/30'
  
  if (pathname.startsWith('/admin')) {
    portalName = 'Admin Dashboard'
    Icon = ShieldAlert
    headerStyle = 'bg-slate-900/95 border-slate-800 text-white dark-mode-nav'
  } else if (pathname.startsWith('/coordinator')) {
    portalName = 'Coordinator Portal'
    Icon = BadgeCheck
  } else if (pathname.startsWith('/participant')) {
    portalName = 'Participant Portal'
    Icon = User
  }

  return (
    <header className={`border-b backdrop-blur-md sticky top-0 z-50 transition-colors ${headerStyle}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Branding & Role */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${pathname.startsWith('/admin') ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-white'}`}>
              <Icon size={16} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-widest uppercase leading-none">AIMERS</span>
              <span className={`text-[11px] font-bold tracking-wide mt-0.5 ${pathname.startsWith('/admin') ? 'text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>{portalName}</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className={`hidden md:flex gap-1 ml-4 pl-4 border-l ${pathname.startsWith('/admin') ? 'border-slate-700' : 'border-slate-200 dark:border-cyan-900/30'}`}>
            <Link 
              href="/participant" 
              prefetch={true}
              className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${pathname.startsWith('/participant') ? 'bg-slate-100 dark:bg-cyan-900/20 text-slate-900 dark:text-white' : pathname.startsWith('/admin') ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-cyan-950/40'}`}
            >
              Participant
            </Link>
            {isCoordinator && (
              <Link 
                href="/coordinator" 
                prefetch={true}
                className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${pathname.startsWith('/coordinator') ? 'bg-slate-100 dark:bg-cyan-900/20 text-slate-900 dark:text-white' : pathname.startsWith('/admin') ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-cyan-950/40'}`}
              >
                Coordinator
              </Link>
            )}
            {isAdmin && (
              <Link 
                href="/admin" 
                prefetch={true}
                className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${pathname.startsWith('/admin') ? 'bg-indigo-500/20 text-indigo-300' : 'text-indigo-600 hover:bg-indigo-50'}`}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        
        {/* Right: User & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${pathname.startsWith('/admin') ? 'text-slate-400' : 'text-slate-400'}`}>Logged in as</span>
            <span className={`text-xs font-semibold ${pathname.startsWith('/admin') ? 'text-slate-200' : 'text-slate-700 dark:text-slate-200'}`}>{userEmail}</span>
          </div>
          
          <div className={`h-8 w-px ${pathname.startsWith('/admin') ? 'bg-slate-700' : 'bg-slate-200'} hidden sm:block`}></div>
          <ThemeToggle />
          <form action="/auth/signout" method="post">
            <button 
              className={`p-2 rounded-full transition-colors flex items-center justify-center ${pathname.startsWith('/admin') ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
