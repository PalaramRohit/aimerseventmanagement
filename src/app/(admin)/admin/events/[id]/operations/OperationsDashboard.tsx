'use client'

import { useState, useEffect, useCallback } from 'react'
import { getEventOperationsData, OperationsData } from './actions'
import { RefreshCw, Users, CheckCircle2, Coffee, Utensils, ShieldCheck, Activity, AlertCircle, Clock, X } from 'lucide-react'
import { CoordinatorScanHistory } from './CoordinatorScanHistory'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function OperationsDashboard({ eventId, eventData }: { eventId: string; eventData: any }) {
  const [data, setData] = useState<OperationsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getEventOperationsData(eventId)
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setData(result.data)
      setLastRefreshed(new Date())
    }
    setIsLoading(false)
  }, [eventId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const [selectedList, setSelectedList] = useState<'registered' | 'pending' | 'active' | null>(null)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <div className="text-red-500 mb-2 font-bold flex items-center justify-center gap-2">
          <Activity size={20} />
          Failed to load operations data
        </div>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
          Retry
        </button>
      </div>
    )
  }

  if (isLoading && !data) {
    return (
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <span className="text-slate-500 dark:text-slate-400 font-medium">Loading operations dashboard...</span>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="text-blue-400" size={24} />
            Live Operations & Statistics
          </h2>
          {lastRefreshed && (
            <p className="text-slate-400 text-sm mt-1">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* SECTION 1: KEY STATISTICS (Participant Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setSelectedList('registered')}
          className="text-left bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 p-6 shadow-sm hover:border-blue-400 hover:shadow-md hover:ring-2 hover:ring-blue-100 transition-all cursor-pointer group"
        >
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 group-hover:text-blue-600 transition-colors">Total Registered</div>
          <div className="text-4xl font-black text-slate-900 dark:text-white">{data.participants.totalRegistered}</div>
        </button>
        <button
          onClick={() => setSelectedList('pending')}
          className="text-left bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 p-6 shadow-sm hover:border-amber-400 hover:shadow-md hover:ring-2 hover:ring-amber-100 transition-all cursor-pointer group"
        >
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 group-hover:text-amber-600 transition-colors">Pending Login</div>
          <div className="text-4xl font-black text-amber-600">{data.participants.pendingLogin}</div>
        </button>
        <button
          onClick={() => setSelectedList('active')}
          className="text-left bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 p-6 shadow-sm hover:border-emerald-400 hover:shadow-md hover:ring-2 hover:ring-emerald-100 transition-all cursor-pointer group"
        >
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 group-hover:text-emerald-600 transition-colors">Active / Synced</div>
          <div className="text-4xl font-black text-emerald-600">{data.participants.activeSynchronized}</div>
        </button>
      </div>

      {/* SECTION 2: ATTENDANCE */}
      {eventData.attendance_enabled && (
        <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Attendance</h3>
          </div>
          <div className="p-6">
            {data.attendance.totalRegistered === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 italic">No participants registered yet.</p>
            ) : (
              <div>
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-blue-600 leading-none">{data.attendance.attended}</span>
                    <span className="text-sm font-bold text-slate-400">/ {data.attendance.totalRegistered} Attended</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">{data.attendance.percentage}%</div>
                </div>

                {/* Attendance Visualization */}
                <div className="w-full bg-slate-100 dark:bg-cyan-900/20 rounded-full h-4 mb-4 overflow-hidden flex">
                  <div className="bg-blue-500 h-4 transition-all duration-500" style={{ width: `${data.attendance.percentage}%` }}></div>
                  <div className="bg-slate-200 h-4 transition-all duration-500" style={{ width: `${100 - data.attendance.percentage}%` }}></div>
                </div>

                <div className="flex justify-between text-sm font-medium">
                  <span className="text-blue-700 font-bold">{data.attendance.attended} Attended</span>
                  <span className="text-slate-500 dark:text-slate-400">{data.attendance.notAttended} Not Attended</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: MEALS */}
      {(eventData.breakfast_enabled || eventData.lunch_enabled || eventData.dinner_enabled) && (
        <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 flex items-center gap-2">
            <Utensils size={18} className="text-orange-600" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Meals</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

            {eventData.breakfast_enabled ? (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Coffee size={16} /> Breakfast</h4>
                {data.meals.breakfast.eligible === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">No eligible participants.</p>
                ) : (
                  <>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-orange-600">{Number(data.meals.breakfast.consumed)} Consumed</span>
                      <span className="text-slate-400">{Number(data.meals.breakfast.eligible)} Eligible</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-cyan-900/20 rounded-full h-3 overflow-hidden">
                      <div className="bg-orange-400 h-3" style={{ width: `${Number(data.meals.breakfast.percentage)}%` }}></div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{Number(data.meals.breakfast.remaining)} remaining ({Number(data.meals.breakfast.percentage)}%)</div>
                  </>
                )}
              </div>
            ) : null}

            {eventData.lunch_enabled ? (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Utensils size={16} /> Lunch</h4>
                {data.meals.lunch.eligible === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">No eligible participants.</p>
                ) : (
                  <>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-orange-600">{Number(data.meals.lunch.consumed)} Consumed</span>
                      <span className="text-slate-400">{Number(data.meals.lunch.eligible)} Eligible</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-cyan-900/20 rounded-full h-3 overflow-hidden">
                      <div className="bg-orange-500 h-3" style={{ width: `${Number(data.meals.lunch.percentage)}%` }}></div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{Number(data.meals.lunch.remaining)} remaining ({Number(data.meals.lunch.percentage)}%)</div>
                  </>
                )}
              </div>
            ) : null}

            {eventData.dinner_enabled ? (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Utensils size={16} /> Dinner</h4>
                {data.meals.dinner.eligible === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">No eligible participants.</p>
                ) : (
                  <>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-orange-600">{Number(data.meals.dinner.consumed)} Consumed</span>
                      <span className="text-slate-400">{Number(data.meals.dinner.eligible)} Eligible</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-cyan-900/20 rounded-full h-3 overflow-hidden">
                      <div className="bg-orange-600 h-3" style={{ width: `${Number(data.meals.dinner.percentage)}%` }}></div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{Number(data.meals.dinner.remaining)} remaining ({Number(data.meals.dinner.percentage)}%)</div>
                  </>
                )}
              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* SECTION 4: COORDINATOR OPERATIONS */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 flex items-center gap-2">
          <ShieldCheck size={18} className="text-slate-600 dark:text-slate-300" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Coordinator Operations</h3>
        </div>
        <div className="overflow-x-auto">
          {data.coordinatorStats.length === 0 ? (
            <div className="p-6 text-slate-500 dark:text-slate-400 italic">No coordinators assigned yet.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-[#080d1a] text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20">Coordinator</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20">Tasks & Station</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 text-right">Relevant Scans</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-cyan-900/20">
                {data.coordinatorStats.map(stat => (
                  <tr key={stat.coordinatorId} className="hover:bg-slate-50 dark:hover:bg-cyan-950/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{stat.name}</div>
                      {stat.lastScanTime && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                          <Clock size={10} /> Last scan: {new Date(stat.lastScanTime).toLocaleTimeString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {stat.tasks.attendance && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md">Attendance</span>}
                        {stat.tasks.breakfast && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase rounded-md">Breakfast</span>}
                        {stat.tasks.lunch && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase rounded-md">Lunch</span>}
                        {stat.tasks.dinner && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase rounded-md">Dinner</span>}
                        {!stat.tasks.attendance && !stat.tasks.breakfast && !stat.tasks.lunch && !stat.tasks.dinner && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-cyan-900/20 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase rounded-md">No Tasks</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Station: {stat.station || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex min-w-[2.5rem] items-center justify-center font-black bg-slate-100 dark:bg-cyan-900/20 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-lg text-sm">
                        {stat.relevantScans}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${stat.activityStatus === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                          stat.activityStatus === 'No recent activity' ? 'bg-amber-50 text-amber-600' :
                            'bg-slate-100 dark:bg-cyan-900/20 text-slate-500 dark:text-slate-400'
                        }`}>
                        {stat.activityStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SECTION 5: OPERATIONAL INSIGHTS */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 flex items-center gap-2">
          <AlertCircle size={18} className="text-purple-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Operational Insights</h3>
        </div>
        <div className="p-6">
          {data.insights.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 italic">No specific operational insights available at this time.</p>
          ) : (
            <ul className="space-y-3">
              {data.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200 font-medium bg-slate-50 dark:bg-cyan-950/20 px-4 py-3 rounded-xl border border-slate-100 dark:border-cyan-900/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                  {insight}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* SECTION 6: COORDINATOR SCAN HISTORY */}
      <CoordinatorScanHistory eventId={eventId} />

      {/* PARTICIPANT LIST MODAL */}
      {selectedList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#080d1a] rounded-2xl shadow-xl border border-slate-200 dark:border-cyan-900/30 w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">

            <div className="px-6 py-4 border-b border-slate-100 dark:border-cyan-900/20 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <Users className={
                  selectedList === 'registered' ? 'text-blue-500' :
                    selectedList === 'pending' ? 'text-amber-500' :
                      'text-emerald-500'
                } size={20} />
                {selectedList === 'registered' ? 'Total Registered Participants' :
                  selectedList === 'pending' ? 'Pending Login Participants' :
                    'Active / Synced Participants'}
              </h3>
              <button
                onClick={() => setSelectedList(null)}
                className="text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-cyan-900/40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <ul className="divide-y divide-slate-100">
                {(
                  selectedList === 'registered' ? data.participants.registeredList :
                    selectedList === 'pending' ? data.participants.pendingList :
                      data.participants.activeList
                ).map((participant, idx) => (
                  <li key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{participant.name || 'No Name Provided'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{participant.email}</div>
                    </div>
                    {(participant as { phone?: string }).phone && (
                      <div className="text-xs font-medium text-slate-400 bg-slate-50 dark:bg-cyan-950/20 px-2 py-1 rounded-md border border-slate-100 dark:border-cyan-900/20 whitespace-nowrap">
                        {(participant as { phone?: string }).phone}
                      </div>
                    )}
                  </li>
                ))}

                {(
                  selectedList === 'registered' ? data.participants.registeredList :
                    selectedList === 'pending' ? data.participants.pendingList :
                      data.participants.activeList
                ).length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 italic text-sm">
                      No participants found in this list.
                    </div>
                  )}
              </ul>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 flex justify-end">
              <button
                onClick={() => setSelectedList(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
