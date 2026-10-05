'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export function StatisticsRefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 dark:bg-cyan-950/20 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      <RefreshCw size={16} className={isPending ? 'animate-spin' : ''} />
      {isPending ? 'Refreshing...' : 'Refresh Data'}
    </button>
  )
}
