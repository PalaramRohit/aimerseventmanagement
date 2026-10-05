'use client'

import { useState } from 'react'
import { claimCoordinatorEventAction } from '@/lib/actions/claim'
import { Check } from 'lucide-react'

export default function ClaimCoordinatorEventButton({ eventId }: { eventId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClaim() {
    setIsLoading(true)
    setError(null)

    const res = await claimCoordinatorEventAction(eventId)
    
    if (res.error) {
      setError(res.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
          <div className="text-red-500 w-4 h-4 shrink-0 flex items-center justify-center rounded-full border-2 border-red-500 font-bold text-[10px]">!</div>
          <div className="text-red-700 text-xs font-medium pt-0.5">{error}</div>
        </div>
      )}
      <button 
        onClick={handleClaim}
        disabled={isLoading}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white transition-all py-3 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-slate-900/10 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing...</span>
        ) : (
          <>
            <Check size={16} />
            Accept Assignment
          </>
        )}
      </button>
    </div>
  )
}
