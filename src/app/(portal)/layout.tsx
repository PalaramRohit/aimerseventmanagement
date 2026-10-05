import { ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PortalHeader from './PortalHeader'
import { User, BadgeCheck, ShieldAlert } from 'lucide-react'
import Image from 'next/image'

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Find user global role to show appropriate navigation
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role?.trim().toLowerCase() || 'participant'
  const isAdmin = role === 'admin'

  // Check if user has any coordinator assignments or pending invitations
  const { count: coordinatorCount } = await supabase
    .from('event_coordinators')
    .select('*', { count: 'exact', head: true })
    .eq('coordinator_id', user.id)
    
  let hasCoordinatorStatus = isAdmin || (coordinatorCount ? coordinatorCount > 0 : false)
  
  if (!hasCoordinatorStatus) {
    let adminClient = supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      ) as typeof supabase
    }

    const { count: pendingCount } = await adminClient
      .from('registration_allowlist')
      .select('*', { count: 'exact', head: true })
      .ilike('email', user.email || '')
      .eq('invited_role', 'coordinator')
      
    if (pendingCount && pendingCount > 0) {
      hasCoordinatorStatus = true
    }
  }

  const isCoordinator = hasCoordinatorStatus

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-cyan-950/20 text-slate-900 dark:text-white selection:bg-indigo-500/30 selection:text-indigo-900 flex flex-col font-sans">
      {/* AIMERS Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] dark:opacity-[0.08] z-0 mix-blend-multiply dark:mix-blend-screen">
        <div className="relative w-[800px] h-[800px] motion-safe:animate-[spin_20s_linear_infinite]">
          <Image 
            src="/aimers-logo.jpeg" 
            alt="" 
            fill 
            className="object-contain rounded-full"
            priority
          />
        </div>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        
        {/* Navigation Header */}
        <PortalHeader userEmail={user.email || ''} isCoordinator={isCoordinator} isAdmin={isAdmin} />

        {/* Main Content Area */}
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden border-t border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#080d1a]/95 backdrop-blur-xl sticky bottom-0 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around p-2">
            <Link href="/participant" className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors flex-1">
              <User size={20} strokeWidth={2.5} />
              <span className="text-[10px] font-bold tracking-wide">Participant</span>
            </Link>
            {isCoordinator && (
              <Link href="/coordinator" className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors flex-1">
                <BadgeCheck size={20} strokeWidth={2.5} />
                <span className="text-[10px] font-bold tracking-wide">Coordinator</span>
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex-1">
                <ShieldAlert size={20} strokeWidth={2.5} />
                <span className="text-[10px] font-bold tracking-wide">Admin</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}
