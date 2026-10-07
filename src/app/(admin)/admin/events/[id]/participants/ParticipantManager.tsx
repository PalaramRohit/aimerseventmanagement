'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, RefreshCw, UserPlus, CheckCircle2, XCircle, Info, MoreHorizontal, Check, X, ShieldAlert, X as CloseIcon, Download } from 'lucide-react'
import { getEventParticipants, addParticipantManual, ParticipantData } from './actions'
import { Button } from '@/components/ui/button'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ParticipantManager({ eventId, eventData }: { eventId: string, eventData: any }) {
  const [data, setData] = useState<ParticipantData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, registered, pending
  const [attendanceFilter, setAttendanceFilter] = useState('all') // all, attended, not
  
  // Selected Participant for details modal
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantData | null>(null)
  
  // Manual Add state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getEventParticipants(eventId)
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

  const handleManualAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await addParticipantManual(eventId, formData)
    
    if (result.error) {
      setAddError(result.error)
    } else {
      setAddModalOpen(false)
      fetchData() // Refresh data!
    }
    setAddLoading(false)
  }

  // Derived filtered data
  const filteredData = useMemo(() => {
    return data.filter(p => {
      // Text Search
      const search = searchTerm.toLowerCase()
      const matchesSearch = !search || 
        (p.full_name?.toLowerCase().includes(search)) || 
        (p.email.toLowerCase().includes(search)) || 
        (p.phone?.toLowerCase().includes(search)) ||
        (p.college?.toLowerCase().includes(search))

      // Status Filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'registered' && p.status === 'registered') ||
        (statusFilter === 'pending' && p.status === 'Pending Login')
        
      // Attendance Filter
      const matchesAttendance = attendanceFilter === 'all' ||
        (attendanceFilter === 'attended' && p.attendance_scanned_at !== null) ||
        (attendanceFilter === 'not' && p.attendance_scanned_at === null)

      return matchesSearch && matchesStatus && matchesAttendance
    })
  }, [data, searchTerm, statusFilter, attendanceFilter])

  const downloadCSV = () => {
    if (filteredData.length === 0) return
    const headers = ['Name', 'Email', 'Phone', 'College', 'Branch', 'Year', 'Status', 'Attendance', 'Breakfast', 'Lunch', 'Dinner']
    const rows = filteredData.map(p => [
      p.full_name || '',
      p.email || '',
      p.phone || '',
      p.college || '',
      p.branch || '',
      p.academic_year || '',
      p.status || '',
      p.attendance_scanned_at ? 'Yes' : 'No',
      p.breakfast_opted ? (p.breakfast_scanned_at ? 'Consumed' : 'Pending') : 'N/A',
      p.lunch_opted ? (p.lunch_scanned_at ? 'Consumed' : 'Pending') : 'N/A',
      p.dinner_opted ? (p.dinner_scanned_at ? 'Consumed' : 'Pending') : 'N/A'
    ])
    
    const csvContent = [headers.join(','), ...rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `participants_${eventId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-100 dark:border-cyan-900/20 shadow-sm overflow-hidden h-full flex flex-col relative">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 flex flex-col gap-4">
        
        {/* Header Row */}
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Participants Directory
            <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold ml-2">
              {filteredData.length}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchData} 
              disabled={loading}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            
            <Button onClick={downloadCSV} variant="outline" className="gap-2" size="sm">
              <Download size={16} />
              Export CSV
            </Button>
            <Button onClick={() => setAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2" size="sm">
              <UserPlus size={16} />
              Manual Add
            </Button>

          </div>
        </div>

        {/* Toolbar Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              placeholder="Search name, email, phone, college..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 h-9 border border-slate-200 dark:border-cyan-900/30 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#080d1a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 px-3 border border-slate-200 dark:border-cyan-900/30 rounded-md text-sm bg-white dark:bg-[#080d1a] text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="registered">Registered</option>
              <option value="pending">Pending Login</option>
            </select>
            {eventData?.attendance_enabled && (
              <select 
                value={attendanceFilter}
                onChange={e => setAttendanceFilter(e.target.value)}
                className="h-9 px-3 border border-slate-200 dark:border-cyan-900/30 rounded-md text-sm bg-white dark:bg-[#080d1a] text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Attendance</option>
                <option value="attended">Attended</option>
                <option value="not">Not Attended</option>
              </select>
            )}
          </div>
        </div>
      </div>
      
      {/* Table Content */}
      {loading ? (
        <div className="flex-1 p-10 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw size={24} className="animate-spin mb-2" />
          <p className="text-sm">Loading participants...</p>
        </div>
      ) : error ? (
        <div className="flex-1 p-10 flex flex-col items-center justify-center text-red-500">
          <XCircle size={32} className="mb-2" />
          <p className="text-sm font-bold">Failed to load data</p>
          <p className="text-xs">{error}</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex-1 p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-cyan-950/20 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100 dark:border-cyan-900/20">
            <Search size={24} />
          </div>
          <h3 className="text-slate-800 dark:text-slate-100 font-bold mb-1">No participants found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">No participants match your current filters or search terms.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-cyan-950/20 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-cyan-900/20">
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">College</th>
                <th className="px-4 py-3">Registration</th>
                {eventData?.attendance_enabled && <th className="px-4 py-3">Attendance</th>}
                {(eventData?.breakfast_enabled || eventData?.lunch_enabled || eventData?.dinner_enabled) && <th className="px-4 py-3">Meals</th>}
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredData.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:bg-cyan-950/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{p.full_name || 'Unknown Name'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{p.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700 dark:text-slate-200">{p.college || '-'}</div>
                    {p.branch && <div className="text-[10px] text-slate-400 uppercase tracking-wide">{p.branch} {p.academic_year}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      p.status === 'registered' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-100 dark:bg-cyan-900/20 text-slate-600 dark:text-slate-300'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  
                  {eventData?.attendance_enabled && (
                    <td className="px-4 py-3">
                      {p.attendance_scanned_at ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                          <CheckCircle2 size={14} /> Attended
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                          <XCircle size={14} /> Pending
                        </span>
                      )}
                    </td>
                  )}
                  
                  {(eventData?.breakfast_enabled || eventData?.lunch_enabled || eventData?.dinner_enabled) && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {eventData?.breakfast_enabled && (
                          <div title="Breakfast" className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${!p.breakfast_opted ? 'bg-slate-100 dark:bg-cyan-900/20 text-slate-300 opacity-50' : p.breakfast_scanned_at ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>B</div>
                        )}
                        {eventData?.lunch_enabled && (
                          <div title="Lunch" className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${!p.lunch_opted ? 'bg-slate-100 dark:bg-cyan-900/20 text-slate-300 opacity-50' : p.lunch_scanned_at ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>L</div>
                        )}
                        {eventData?.dinner_enabled && (
                          <div title="Dinner" className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${!p.dinner_opted ? 'bg-slate-100 dark:bg-cyan-900/20 text-slate-300 opacity-50' : p.dinner_scanned_at ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>D</div>
                        )}
                      </div>
                    </td>
                  )}
                  
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedParticipant(p)}>
                      <MoreHorizontal size={16} className="text-slate-500 dark:text-slate-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Add Modal Overlay */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#080d1a] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-cyan-900/20 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Add Participant Manually</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300">
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleManualAdd} className="space-y-4">
                {addError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                    <span>{addError}</span>
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name *</label>
                    <input name="full_name" required placeholder="Jane Doe" className="w-full h-9 px-3 border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email *</label>
                    <input name="email" type="email" required placeholder="jane@example.com" className="w-full h-9 px-3 border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Phone</label>
                    <input name="phone" placeholder="Optional" className="w-full h-9 px-3 border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">College</label>
                    <input name="college" placeholder="Optional" className="w-full h-9 px-3 border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Branch</label>
                      <input name="branch" placeholder="Optional" className="w-full h-9 px-3 border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Year</label>
                      <input name="academic_year" placeholder="Optional" className="w-full h-9 px-3 border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  
                  {/* Meal Preferences if enabled for event */}
                  {(eventData?.breakfast_enabled || eventData?.lunch_enabled || eventData?.dinner_enabled) && (
                    <div className="pt-2 border-t border-slate-100 dark:border-cyan-900/20 mt-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Meal Preferences</label>
                      <div className="flex gap-4">
                        {eventData?.breakfast_enabled && (
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="breakfast_opted" value="true" className="rounded border-slate-300" />
                            Breakfast
                          </label>
                        )}
                        {eventData?.lunch_enabled && (
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="lunch_opted" value="true" className="rounded border-slate-300" />
                            Lunch
                          </label>
                        )}
                        {eventData?.dinner_enabled && (
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="dinner_opted" value="true" className="rounded border-slate-300" />
                            Dinner
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={addLoading} className="w-full">
                    {addLoading ? 'Adding...' : 'Add Participant'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal Overlay */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#080d1a] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-cyan-900/20 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Participant Details</h3>
              <button onClick={() => setSelectedParticipant(null)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300">
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <div className="space-y-6">
                {/* Core Identity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Name</label>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{selectedParticipant.full_name || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Email</label>
                    <div className="text-sm text-slate-900 dark:text-white">{selectedParticipant.email}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Phone</label>
                    <div className="text-sm text-slate-900 dark:text-white">{selectedParticipant.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Status</label>
                    <div className="text-sm font-bold text-blue-600">{selectedParticipant.status}</div>
                  </div>
                </div>

                {/* Academics */}
                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-cyan-900/20 pt-4">
                  <div className="col-span-3">
                    <label className="text-[10px] uppercase font-bold text-slate-400">College</label>
                    <div className="text-sm text-slate-900 dark:text-white">{selectedParticipant.college || 'N/A'}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Branch</label>
                    <div className="text-sm text-slate-900 dark:text-white">{selectedParticipant.branch || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Year</label>
                    <div className="text-sm text-slate-900 dark:text-white">{selectedParticipant.academic_year || 'N/A'}</div>
                  </div>
                </div>

                {/* Operations */}
                <div className="border-t border-slate-100 dark:border-cyan-900/20 pt-4">
                  <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-100 mb-3">Operational Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-300">Registration</span>
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {selectedParticipant.imported_at ? new Date(selectedParticipant.imported_at).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    {eventData?.attendance_enabled && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Attendance</span>
                        {selectedParticipant.attendance_scanned_at ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1"><Check size={14} /> Scanned</span>
                        ) : (
                          <span className="text-slate-400 font-bold flex items-center gap-1"><X size={14} /> Not Scanned</span>
                        )}
                      </div>
                    )}
                    {/* Meals */}
                    {(eventData?.breakfast_enabled || eventData?.lunch_enabled || eventData?.dinner_enabled) && (
                      <div className="pt-2 flex flex-col gap-1 text-sm">
                        {eventData?.breakfast_enabled && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-300">Breakfast</span>
                            {!selectedParticipant.breakfast_opted ? <span className="text-slate-400 italic">Not Opted</span> : 
                              selectedParticipant.breakfast_scanned_at ? <span className="text-emerald-600 font-bold">Consumed</span> : 
                              <span className="text-blue-600 font-bold">Pending</span>}
                          </div>
                        )}
                        {eventData?.lunch_enabled && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-300">Lunch</span>
                            {!selectedParticipant.lunch_opted ? <span className="text-slate-400 italic">Not Opted</span> : 
                              selectedParticipant.lunch_scanned_at ? <span className="text-emerald-600 font-bold">Consumed</span> : 
                              <span className="text-blue-600 font-bold">Pending</span>}
                          </div>
                        )}
                        {eventData?.dinner_enabled && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-300">Dinner</span>
                            {!selectedParticipant.dinner_opted ? <span className="text-slate-400 italic">Not Opted</span> : 
                              selectedParticipant.dinner_scanned_at ? <span className="text-emerald-600 font-bold">Consumed</span> : 
                              <span className="text-blue-600 font-bold">Pending</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Data */}
                {selectedParticipant.registration_data && Object.keys(selectedParticipant.registration_data).length > 0 && (
                  <div className="border-t border-slate-100 dark:border-cyan-900/20 pt-4 bg-slate-50 dark:bg-cyan-950/20 -mx-5 px-5 -mb-5 pb-5 rounded-b-lg">
                    <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Info size={14} className="text-slate-400" />
                      Additional Custom Data
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(selectedParticipant.registration_data).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-[10px] uppercase font-bold text-slate-400">{key}</label>
                          <div className="text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#080d1a] p-2 border border-slate-100 dark:border-cyan-900/20 rounded mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
