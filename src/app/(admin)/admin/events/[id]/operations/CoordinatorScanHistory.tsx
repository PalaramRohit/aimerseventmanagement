'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, RefreshCw, Clock, History, ShieldCheck } from 'lucide-react'

export function CoordinatorScanHistory({ eventId }: { eventId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [coordinatorFilter, setCoordinatorFilter] = useState('All')
  const [operationFilter, setOperationFilter] = useState('All')

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const untypedSupabase = supabase as unknown as import('@supabase/supabase-js').SupabaseClient
    const { data: res, error: err } = await untypedSupabase.rpc('get_admin_scan_history', { event_id_param: eventId })
    if (err) {
      setError(err.message)
    } else {
      setData(res)
    }
    setLoading(false)
  }, [eventId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory()
  }, [fetchHistory])

  const filteredHistory = useMemo(() => {
    if (!data?.history) return []
    return data.history.filter((scan: { participant_name: string, participant_email: string, coordinator_id: string, operation: string }) => {
      const matchSearch = scan.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) || scan.participant_email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCoordinator = coordinatorFilter === 'All' || scan.coordinator_id === coordinatorFilter
      const matchOperation = operationFilter === 'All' || scan.operation === operationFilter
      return matchSearch && matchCoordinator && matchOperation
    })
  }, [data, searchTerm, coordinatorFilter, operationFilter])

  if (loading && !data) {
    return (
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <span className="text-slate-500 dark:text-slate-400 font-medium">Loading scan history...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center mt-6">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchHistory} className="px-4 py-2 bg-red-600 text-white rounded-xl">Retry</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="text-purple-400" size={24} />
            Coordinator Scan Activity
          </h2>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Coordinator Summary */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 flex items-center gap-2">
          <ShieldCheck size={18} className="text-slate-600 dark:text-slate-300" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Coordinator Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-[#080d1a] text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20">Coordinator</th>
                <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20">Tasks</th>
                <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 text-center">Total Scans</th>
                <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 text-center">Last Scan</th>
                <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 text-center">Att</th>
                <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 text-center">B / L / D</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.coordinators?.map((c: { coordinator_id: string, coordinator_name: string, task_attendance: boolean, task_breakfast: boolean, task_lunch: boolean, task_dinner: boolean, total_scans: number, last_scan: string, attendance_count: number, breakfast_count: number, lunch_count: number, dinner_count: number }) => (
                <tr key={c.coordinator_id} className="hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{c.coordinator_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {c.task_attendance && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md">Att</span>}
                      {c.task_breakfast && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase rounded-md">Bf</span>}
                      {c.task_lunch && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase rounded-md">Lu</span>}
                      {c.task_dinner && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase rounded-md">Dn</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-black">{c.total_scans}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-500">{c.last_scan ? new Date(c.last_scan).toLocaleTimeString() : '-'}</td>
                  <td className="px-6 py-4 text-center text-sm text-blue-600 font-bold">{c.attendance_count}</td>
                  <td className="px-6 py-4 text-center text-sm text-orange-600 font-bold">
                    {c.breakfast_count} / {c.lunch_count} / {c.dinner_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed History */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 space-y-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-slate-600 dark:text-slate-300" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Detailed Scan History</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search participant..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select 
              value={coordinatorFilter}
              onChange={(e) => setCoordinatorFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white text-sm font-medium"
            >
              <option value="All" className="bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white">All Coordinators</option>
              {data?.coordinators?.map((c: { coordinator_id: string, coordinator_name: string }) => (
                <option key={c.coordinator_id} value={c.coordinator_id} className="bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white">{c.coordinator_name}</option>
              ))}
            </select>
            <select 
              value={operationFilter}
              onChange={(e) => setOperationFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white text-sm font-medium"
            >
              <option value="All" className="bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white">All Operations</option>
              <option value="attendance" className="bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white">Attendance</option>
              <option value="breakfast" className="bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white">Breakfast</option>
              <option value="lunch" className="bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white">Lunch</option>
              <option value="dinner" className="bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white">Dinner</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-[#080d1a] z-10 shadow-sm">
              <tr className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20">Participant</th>
                <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20">Operation</th>
                <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20">Coordinator</th>
                <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.length > 0 ? filteredHistory.map((scan: { scan_id: string, participant_name: string, participant_email: string, operation: string, coordinator_name: string, scanned_at: string }) => (
                <tr key={scan.scan_id} className="hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{scan.participant_name}</div>
                    <div className="text-xs text-slate-500">{scan.participant_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                      {scan.operation}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{scan.coordinator_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-1.5">
                    <Clock size={12} />
                    {new Date(scan.scanned_at).toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">No scans match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
