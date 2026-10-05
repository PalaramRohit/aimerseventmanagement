'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RefreshCw, History, Clock } from 'lucide-react'

export function MyScanHistory({ eventId }: { eventId: string }) {
  type ScanHistoryItem = {
    scan_id: string
    participant_name: string
    operation: string
    scanned_at: string
  }

  const [history, setHistory] = useState<ScanHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: res, error: err } = await supabase.rpc('get_coordinator_scan_history', { event_id_param: eventId })
    if (err) {
      setError(err.message)
    } else {
      setHistory((res as ScanHistoryItem[]) || [])
    }
    setLoading(false)
  }, [eventId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchHistory()
  }, [fetchHistory])

  return (
    <div className="bg-white dark:bg-[#080d1a] border border-slate-100 dark:border-cyan-900/20 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] mt-8">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 flex items-center justify-between bg-slate-50 dark:bg-cyan-950/20">
        <div className="flex items-center gap-2">
          <History size={18} className="text-indigo-600" />
          <h2 className="font-bold text-slate-800 dark:text-slate-100">My Scan History</h2>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-1 text-sm font-medium"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="p-0">
        {error ? (
          <div className="p-6 text-red-500 text-sm text-center">{error}</div>
        ) : loading && history.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex justify-center">
            <RefreshCw size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm italic">You haven&apos;t scanned anyone yet.</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <ul className="divide-y divide-slate-50 dark:divide-cyan-900/10">
              {history.map((scan) => (
                <li key={scan.scan_id} className="p-4 hover:bg-slate-50 dark:hover:bg-cyan-950/10 flex justify-between items-center transition-colors">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{scan.participant_name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md">
                        {scan.operation}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock size={12} />
                    {new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
