import { requireAdmin } from '@/lib/auth/server'
import { getProfiles, getPendingAdmins } from './actions'
import { AdminManager } from './AdminManager'
import { Shield } from 'lucide-react'

export const metadata = {
  title: 'Admin Management | AIMERS'
}

export default async function AdminsPage() {
  const { user } = await requireAdmin()
  const { data: profiles } = await getProfiles()
  const { data: pending } = await getPendingAdmins()

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="text-cyan-600" />
            Administrator Access
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage who has administrative access to the platform.
          </p>
        </div>
      </div>
      
      <AdminManager initialProfiles={profiles || []} initialPending={pending || []} currentUserId={user.id} />
    </div>
  )
}
