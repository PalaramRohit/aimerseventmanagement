'use client'

import { useState, useEffect, useCallback } from 'react'
import { getEventCoordinators, assignCoordinatorByEmail, updateCoordinatorAssignment, removeCoordinatorAssignment, addCoordinatorManual, CoordinatorData } from './actions'
import { ShieldCheck, RefreshCw, XCircle, Plus, Edit3, Trash2, MapPin, X as CloseIcon, UserPlus, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ALLOWED_CUSTOM_TASKS } from '@/lib/constants'

export default function CoordinatorManager({ eventId, eventData }: { eventId: string, eventData: Record<string, unknown> | null }) {
  const [data, setData] = useState<CoordinatorData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Unified Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<'assign' | 'edit'>('assign')
  const [selectedCoord, setSelectedCoord] = useState<CoordinatorData | null>(null)

  // Manual Add Modal
  const [addOpen, setAddOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getEventCoordinators(eventId)
    if (res.error) {
      setError(res.error)
    } else if (res.data) {
      setData(res.data)
    }
    setLoading(false)
  }, [eventId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const openAssign = () => {
    setModalMode('assign')
    setSelectedCoord(null)
    setModalError(null)
    setModalOpen(true)
  }

  const openEdit = (coord: CoordinatorData) => {
    setModalMode('edit')
    setSelectedCoord(coord)
    setModalError(null)
    setModalOpen(true)
  }

  const handleModalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setModalLoading(true)
    setModalError(null)
    
    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    
    const custom_tasks = ALLOWED_CUSTOM_TASKS.filter(task => fd.get(`task_custom_${task}`) === 'true')

    const assignmentData = {
      task_attendance: fd.get('task_attendance') === 'true',
      task_breakfast: fd.get('task_breakfast') === 'true',
      task_lunch: fd.get('task_lunch') === 'true',
      task_dinner: fd.get('task_dinner') === 'true',
      custom_tasks,
      station: fd.get('station') ? String(fd.get('station')) : null
    }
    
    let result;
    if (modalMode === 'assign') {
      // Upsert handles both new assignments and updating existing if user re-assigns
      result = await assignCoordinatorByEmail(eventId, email, assignmentData)
    } else {
      if (!selectedCoord) return
      result = await updateCoordinatorAssignment(eventId, selectedCoord.coordinator_id, assignmentData)
    }

    if (result.error) {
      setModalError(result.error)
    } else {
      setModalOpen(false)
      fetchData()
    }
    setModalLoading(false)
  }

  const handleManualAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)
    
    const result = await addCoordinatorManual(eventId, new FormData(e.currentTarget))
    
    if (result.error) {
      setAddError(result.error)
    } else {
      setAddOpen(false)
      fetchData()
      alert('Coordinator successfully added to the registry! They must now log in to the portal.')
    }
    setAddLoading(false)
  }

  const handleRemove = async (coordId: string) => {
    if (!confirm("Are you sure you want to remove this coordinator from the event?")) return
    const result = await removeCoordinatorAssignment(eventId, coordId)
    if (result.success) {
      fetchData()
    } else {
      alert(result.error || "Failed to remove coordinator")
    }
  }

  return (
    <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-100 dark:border-cyan-900/20 shadow-sm overflow-hidden flex flex-col relative">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck size={18} className="text-slate-400" />
          Event Coordinators
          <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold ml-2">
            {data.length}
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          
          <Link href={`/admin/events/${eventId}/import`}>
            <Button variant="outline" size="sm" className="gap-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-[#080d1a]">
              <FileSpreadsheet size={16} />
              Import CSV
            </Button>
          </Link>

          <Button onClick={() => { setAddError(null); setAddOpen(true) }} className="bg-blue-600 hover:bg-blue-700 text-white gap-2" size="sm">
            <UserPlus size={16} />
            Add Manual
          </Button>
          
          <Button onClick={openAssign} className="bg-slate-900 hover:bg-slate-800 text-white gap-2" size="sm">
            <Plus size={16} />
            Assign (Existing)
          </Button>
        </div>
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="p-10 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw size={24} className="animate-spin mb-2" />
          <p className="text-sm">Loading coordinators...</p>
        </div>
      ) : error ? (
        <div className="p-10 flex flex-col items-center justify-center text-red-500">
          <XCircle size={32} className="mb-2" />
          <p className="text-sm font-bold">Failed to load data</p>
          <p className="text-xs">{error}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-cyan-950/20 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100 dark:border-cyan-900/20">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-slate-800 dark:text-slate-100 font-bold mb-1">No coordinators assigned to this event yet.</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">Assign an authenticated user to help manage this event.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-cyan-950/20 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-cyan-900/20">
                <th className="px-6 py-4">Coordinator</th>
                <th className="px-6 py-4">Responsibilities</th>
                <th className="px-6 py-4">Station</th>
                <th className="px-6 py-4">Operational Progress</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.map(c => (
                <tr key={c.coordinator_id} className="hover:bg-slate-50 dark:hover:bg-cyan-950/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{c.full_name || 'Unknown Name'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{c.email}</div>
                    {c.phone && <div className="text-xs text-slate-400 mt-1">{c.phone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'Pending Login' ? (
                      <span className="text-slate-400 italic text-xs">Waiting for user to sign up</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {c.task_attendance && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">Attendance</span>}
                        {c.task_breakfast && !!eventData?.breakfast_enabled && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">Breakfast</span>}
                        {c.task_lunch && !!eventData?.lunch_enabled && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">Lunch</span>}
                        {c.task_dinner && !!eventData?.dinner_enabled && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Dinner</span>}
                        
                        {c.custom_tasks?.map(task => (
                           <span key={task} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-cyan-900/20 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-cyan-900/30">
                             {task}
                           </span>
                        ))}

                        {!c.task_attendance && !c.task_breakfast && !c.task_lunch && !c.task_dinner && (!c.custom_tasks || c.custom_tasks.length === 0) && (
                          <span className="text-slate-400 italic text-xs">No assignment</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'Pending Login' ? (
                       <span className="text-slate-400 italic text-xs">-</span>
                    ) : c.station ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-cyan-900/20 px-2.5 py-1 rounded-md w-max">
                        <MapPin size={12} className="text-slate-400" />
                        {c.station}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'Pending Login' ? (
                      <span className="text-slate-400 italic text-xs">-</span>
                    ) : (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between w-32"><span className="text-slate-500 dark:text-slate-400">Attendance:</span> <span className="font-mono font-semibold">{c.attendance_scans}</span></div>
                        {(c.breakfast_scans > 0 || c.lunch_scans > 0 || c.dinner_scans > 0) && (
                          <div className="flex justify-between w-32 border-t border-slate-100 dark:border-cyan-900/20 pt-1 mt-1">
                            <span className="text-slate-500 dark:text-slate-400">Meals:</span> 
                            <span className="font-mono font-semibold">{c.breakfast_scans + c.lunch_scans + c.dinner_scans}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'Pending Login' ? (
                      <div className="text-xs font-bold text-amber-500">Pending Login</div>
                    ) : (
                      <>
                        <div className={`text-xs font-bold ${
                          c.active_status === 'Active' ? 'text-emerald-600' :
                          c.active_status === 'No recent activity' ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {c.active_status}
                        </div>
                        {c.last_scan_time && (
                          <div className="text-[10px] text-slate-400 mt-0.5">Last: {new Date(c.last_scan_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {c.status === 'Active' && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(c)}>
                          <Edit3 size={16} className="text-blue-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleRemove(c.coordinator_id)}>
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Unified Assign/Edit Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#080d1a] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-cyan-900/20 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                {modalMode === 'assign' ? 'Assign Existing User' : 'Edit Responsibilities'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300">
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleModalSubmit} className="space-y-6">
                {modalError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {modalError}
                  </div>
                )}
                
                {modalMode === 'assign' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Coordinator Email</label>
                    <input name="email" type="email" required placeholder="user@example.com" className="w-full mt-1 h-10 px-3 border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">The user must already have an account in the system.</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-cyan-950/20 p-3 rounded-lg border border-slate-100 dark:border-cyan-900/20">
                    <div className="font-bold text-sm">{selectedCoord?.full_name || selectedCoord?.email}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{selectedCoord?.email}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Core System Tasks */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block">Scanner Access (Core)</label>
                    
                    <label className="flex items-center gap-3 p-3 border border-slate-100 dark:border-cyan-900/20 rounded-lg hover:bg-slate-50 dark:hover:bg-cyan-950/40 cursor-pointer transition-colors shadow-sm">
                      <input type="checkbox" name="task_attendance" value="true" defaultChecked={selectedCoord?.task_attendance ?? false} className="rounded border-slate-300 w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Attendance</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Can scan attendance QR codes</div>
                      </div>
                    </label>
                    
                    {!!eventData?.breakfast_enabled && (
                      <label className="flex items-center gap-3 p-3 border border-slate-100 dark:border-cyan-900/20 rounded-lg hover:bg-slate-50 dark:hover:bg-cyan-950/40 cursor-pointer transition-colors shadow-sm">
                        <input type="checkbox" name="task_breakfast" value="true" defaultChecked={selectedCoord?.task_breakfast ?? false} className="rounded border-slate-300 w-4 h-4 text-amber-600" />
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Breakfast</div>
                      </label>
                    )}
                    {!!eventData?.lunch_enabled && (
                      <label className="flex items-center gap-3 p-3 border border-slate-100 dark:border-cyan-900/20 rounded-lg hover:bg-slate-50 dark:hover:bg-cyan-950/40 cursor-pointer transition-colors shadow-sm">
                        <input type="checkbox" name="task_lunch" value="true" defaultChecked={selectedCoord?.task_lunch ?? false} className="rounded border-slate-300 w-4 h-4 text-orange-600" />
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Lunch</div>
                      </label>
                    )}
                    {!!eventData?.dinner_enabled && (
                      <label className="flex items-center gap-3 p-3 border border-slate-100 dark:border-cyan-900/20 rounded-lg hover:bg-slate-50 dark:hover:bg-cyan-950/40 cursor-pointer transition-colors shadow-sm">
                        <input type="checkbox" name="task_dinner" value="true" defaultChecked={selectedCoord?.task_dinner ?? false} className="rounded border-slate-300 w-4 h-4 text-indigo-600" />
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Dinner</div>
                      </label>
                    )}
                  </div>

                  {/* Organizational Custom Tasks */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block flex justify-between">
                      <span>Organizational Tasks</span>
                    </label>
                    
                    <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2 pb-2">
                      {ALLOWED_CUSTOM_TASKS.map(task => (
                        <label key={task} className="flex items-center gap-3 p-2.5 border border-slate-100 dark:border-cyan-900/20 rounded-lg hover:bg-slate-50 dark:hover:bg-cyan-950/40 cursor-pointer transition-colors shadow-sm">
                          <input 
                            type="checkbox" 
                            name={`task_custom_${task}`} 
                            value="true" 
                            defaultChecked={selectedCoord?.custom_tasks?.includes(task) ?? false} 
                            className="rounded border-slate-300 w-4 h-4 text-slate-600 dark:text-slate-300" 
                          />
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{task}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-cyan-900/20">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Assigned Station (Optional)</label>
                  <input name="station" defaultValue={selectedCoord?.station || ''} placeholder="e.g. Main Gate, Food Counter 1" className="w-full mt-1 h-10 px-3 border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={modalLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6">
                    {modalLoading ? 'Saving...' : (modalMode === 'assign' ? 'Assign to Event' : 'Save Changes')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal Overlay */}
      {addOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#080d1a] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-cyan-900/20 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Add Coordinator Manually</h3>
              <button onClick={() => setAddOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300">
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[70vh]">
              <form onSubmit={handleManualAdd} className="space-y-4">
                {addError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {addError}
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email (Required)</label>
                  <input name="email" type="email" required placeholder="coordinator@example.com" className="w-full mt-1 h-9 px-3 border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name</label>
                  <input name="full_name" type="text" placeholder="John Doe" className="w-full mt-1 h-9 px-3 border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Phone Number</label>
                  <input name="phone" type="tel" placeholder="+1234567890" className="w-full mt-1 h-9 px-3 border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div className="pt-2 flex justify-end">
                  <Button type="submit" disabled={addLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {addLoading ? 'Adding...' : 'Add Coordinator'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
