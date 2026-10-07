'use client'

import { useState, useMemo } from 'react'
import { Search, Users, RefreshCw, ChevronDown, ChevronUp, User, UserCheck, Shield, Phone, GraduationCap, GitBranch, Globe, FileText, ExternalLink, CheckCircle2, Download } from 'lucide-react'
import { TeamData, getEventTeams } from './actions'

export function TeamManager({ eventId, initialData }: { eventId: string, initialData: TeamData[] }) {
  const [data, setData] = useState<TeamData[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const result = await getEventTeams(eventId)
    if (result.data) {
      setData(result.data)
    }
    setLoading(false)
  }

  // Pre-calculate aggregates for rendering and filtering
  const enrichedTeams = useMemo(() => {
    return data.map(team => {
      const leader = team.members.find(m => m.team_role === 'leader')
      const totalMembers = team.members.length
      
      const fullyRegistered = totalMembers > 0 && team.members.every(m => m.status === 'Active' || m.participant_id)
      
      const attendanceEligible = totalMembers
      const attendanceComplete = team.members.filter(m => m.attendance_scanned_at).length
      
      const breakfastEligible = team.members.filter(m => m.breakfast_opted).length
      const breakfastComplete = team.members.filter(m => m.breakfast_scanned_at).length
      
      const lunchEligible = team.members.filter(m => m.lunch_opted).length
      const lunchComplete = team.members.filter(m => m.lunch_scanned_at).length
      
      const dinnerEligible = team.members.filter(m => m.dinner_opted).length
      const dinnerComplete = team.members.filter(m => m.dinner_scanned_at).length

      let status = 'Pending'
      if (fullyRegistered) {
        status = 'Complete'
      }

      return {
        ...team,
        leader,
        totalMembers,
        fullyRegistered,
        attendanceEligible,
        attendanceComplete,
        breakfastEligible,
        breakfastComplete,
        lunchEligible,
        lunchComplete,
        dinnerEligible,
        dinnerComplete,
        status
      }
    })
  }, [data])

  const filteredTeams = useMemo(() => {
    return enrichedTeams.filter(team => {
      const s = search.toLowerCase()
      const matchesSearch = 
        team.name.toLowerCase().includes(s) ||
        team.members.some(m => 
          m.email.toLowerCase().includes(s) ||
          (m.full_name && m.full_name.toLowerCase().includes(s)) ||
          (m.phone && m.phone.toLowerCase().includes(s)) ||
          (m.college && m.college.toLowerCase().includes(s))
        )

      if (!matchesSearch) return false

      if (filter === 'all') return true
      if (filter === 'fully_registered') return team.fullyRegistered
      if (filter === 'pending_members') return !team.fullyRegistered
      if (filter === 'attendance_complete') return team.attendanceEligible > 0 && team.attendanceComplete === team.attendanceEligible
      if (filter === 'attendance_pending') return team.attendanceComplete < team.attendanceEligible

      return true
    })
  }, [enrichedTeams, search, filter])

  const totalTeams = enrichedTeams.length
  const totalMembers = enrichedTeams.reduce((sum, t) => sum + t.totalMembers, 0)
  const fullyRegisteredTeams = enrichedTeams.filter(t => t.fullyRegistered).length
  const attendanceCompleteTeams = enrichedTeams.filter(t => t.attendanceEligible > 0 && t.attendanceComplete === t.attendanceEligible).length
  const pendingMembersTeams = enrichedTeams.filter(t => !t.fullyRegistered).length

  const downloadCSV = () => {
    if (filteredTeams.length === 0) return
    const headers = ['Team Name', 'Team Status', 'Problem Statement', 'Submitted At', 'GitHub URL', 'Deployed URL', 'Member Name', 'Member Email', 'Member Role', 'College', 'Phone', 'Login Status', 'Attendance', 'Breakfast', 'Lunch', 'Dinner']
    
    const rows: string[][] = []
    
    filteredTeams.forEach(team => {
      team.members.forEach(member => {
        rows.push([
          team.name || '',
          team.status || '',
          team.problem_statements?.title || '',
          team.submitted_at ? 'Yes' : 'No',
          team.github_url || '',
          team.deployed_url || '',
          member.full_name || '',
          member.email || '',
          member.team_role || '',
          member.college || '',
          member.phone || '',
          member.participant_id ? 'Registered' : 'Pending',
          member.attendance_scanned_at ? 'Yes' : 'No',
          member.breakfast_opted ? (member.breakfast_scanned_at ? 'Consumed' : 'Pending') : 'N/A',
          member.lunch_opted ? (member.lunch_scanned_at ? 'Consumed' : 'Pending') : 'N/A',
          member.dinner_opted ? (member.dinner_scanned_at ? 'Consumed' : 'Pending') : 'N/A'
        ])
      })
    })

    const csvContent = [headers.join(','), ...rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `teams_${eventId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 p-4 shadow-sm text-center">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Total Teams</p>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalTeams}</p>
        </div>
        <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 p-4 shadow-sm text-center">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Total Members</p>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalMembers}</p>
        </div>
        <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 p-4 shadow-sm text-center">
          <p className="text-sm font-bold text-emerald-600 mb-1">Fully Registered</p>
          <p className="text-2xl font-black text-emerald-700">{fullyRegisteredTeams}</p>
        </div>
        <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 p-4 shadow-sm text-center">
          <p className="text-sm font-bold text-amber-600 mb-1">Pending Sync</p>
          <p className="text-2xl font-black text-amber-700">{pendingMembersTeams}</p>
        </div>
        <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 p-4 shadow-sm text-center">
          <p className="text-sm font-bold text-indigo-600 mb-1">Attendance Complete</p>
          <p className="text-2xl font-black text-indigo-700">{attendanceCompleteTeams}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-cyan-900/30 bg-slate-50 dark:bg-cyan-950/20 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search teams, members, college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-cyan-900/30 bg-white dark:bg-[#03060a] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium"
            />
          </div>
          
          <div className="flex w-full md:w-auto gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer w-full md:w-auto"
            >
              <option value="all">All Teams</option>
              <option value="fully_registered">Fully Registered</option>
              <option value="pending_members">Pending Login/Sync</option>
              <option value="attendance_complete">Attendance Complete</option>
              <option value="attendance_pending">Attendance Pending</option>
            </select>
            
            <button 
              onClick={downloadCSV}
              className="bg-white dark:bg-[#080d1a] hover:bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center shrink-0 gap-2"
            >
              <Download size={16} /> Export
            </button>
            
            <button 
              onClick={fetchData}
              disabled={loading}
              className="bg-white dark:bg-[#080d1a] hover:bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center shrink-0"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin opacity-50' : ''} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTeams.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Users size={32} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold">No teams found matching criteria</p>
            </div>
          ) : (
            filteredTeams.map(team => (
              <div key={team.id} className="flex flex-col">
                <div 
                  className={`p-4 sm:px-6 hover:bg-slate-50 dark:bg-cyan-950/20 cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-colors ${expandedTeamId === team.id ? 'bg-blue-50/30' : ''}`}
                  onClick={() => setExpandedTeamId(expandedTeamId === team.id ? null : team.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">{team.name}</h3>
                      {team.fullyRegistered ? (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Complete</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Pending Sync</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5"><Users size={14} /> {team.totalMembers} Members</span>
                      <span className="flex items-center gap-1.5"><Shield size={14} /> Leader: {team.leader?.full_name || team.leader?.email || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 text-xs font-bold shrink-0">
                    <div className="flex flex-col gap-1 items-center bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-lg px-3 py-1.5">
                      <span className="text-slate-400 uppercase tracking-wider text-[10px]">Att.</span>
                      <span className={`${team.attendanceComplete === team.attendanceEligible && team.attendanceEligible > 0 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
                        {team.attendanceComplete}/{team.attendanceEligible}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 items-center bg-slate-50 dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-900/30 rounded-lg px-3 py-1.5">
                      <span className="text-slate-400 uppercase tracking-wider text-[10px]">Food</span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {team.breakfastComplete + team.lunchComplete + team.dinnerComplete}/{team.breakfastEligible + team.lunchEligible + team.dinnerEligible}
                      </span>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-[#080d1a] p-2 border border-slate-200 dark:border-cyan-900/30 rounded-lg shadow-sm ml-2 hidden sm:block">
                      {expandedTeamId === team.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {expandedTeamId === team.id && (
                  <div className="border-t border-slate-100 dark:border-cyan-900/20 bg-slate-50 dark:bg-cyan-950/20 p-4 sm:px-6">
                    
                    {team.problem_statement_id && (
                      <div className="mb-6 bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-2xl p-5 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-1">
                              <FileText size={14} /> Problem Statement
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{team.problem_statements?.title || 'Unknown Problem Statement'}</h4>
                          </div>
                          <div>
                            {team.submitted_at ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-emerald-100">
                                <CheckCircle2 size={12} /> Submitted Project
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-100">
                                Pending Submission
                              </div>
                            )}
                          </div>
                        </div>

                        {team.submitted_at && (
                          <div className="pt-4 border-t border-slate-100 dark:border-cyan-900/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-1.5">
                                <GitBranch size={14} /> GitHub Repository
                              </div>
                              <a href={team.github_url!} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-1.5 break-all">
                                {team.github_url} <ExternalLink size={12} />
                              </a>
                            </div>
                            {team.deployed_url && (
                              <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-1.5">
                                  <Globe size={14} /> Deployed Project
                                </div>
                                <a href={team.deployed_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-1.5 break-all">
                                  {team.deployed_url} <ExternalLink size={12} />
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {/* Sort leader first */}
                      {[...team.members].sort((a, b) => a.team_role === 'leader' ? -1 : b.team_role === 'leader' ? 1 : 0).map((member, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#080d1a] rounded-xl border border-slate-200 dark:border-cyan-900/30 shadow-sm p-4 text-sm relative overflow-hidden group">
                          {member.team_role === 'leader' && (
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">
                              Leader
                            </div>
                          )}
                          
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${member.participant_id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-cyan-900/20 text-slate-400'}`}>
                              {member.participant_id ? <UserCheck size={16} /> : <User size={16} />}
                            </div>
                            <div className="min-w-0 pr-6">
                              <p className="font-bold text-slate-900 dark:text-white truncate" title={member.full_name || 'No Name'}>{member.full_name || <span className="text-slate-400 italic">No Name</span>}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate" title={member.email}>{member.email}</p>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
                            {member.phone && <div className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {member.phone}</div>}
                            {member.college && <div className="flex items-center gap-2"><GraduationCap size={12} className="text-slate-400" /> <span className="truncate">{member.college}</span></div>}
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-cyan-900/20 flex flex-wrap gap-2">
                            {member.participant_id ? (
                              <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-100">Login OK</span>
                            ) : (
                              <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-100">Pending Login</span>
                            )}
                            
                            {member.attendance_scanned_at ? (
                              <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-100">Att. OK</span>
                            ) : (
                              <span className="bg-slate-50 dark:bg-cyan-950/20 text-slate-500 dark:text-slate-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-cyan-900/30">No Att.</span>
                            )}

                            {member.breakfast_opted && (
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${member.breakfast_scanned_at ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 dark:bg-cyan-950/20 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-cyan-900/30'}`}>
                                B
                              </span>
                            )}
                            {member.lunch_opted && (
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${member.lunch_scanned_at ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 dark:bg-cyan-950/20 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-cyan-900/30'}`}>
                                L
                              </span>
                            )}
                            {member.dinner_opted && (
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${member.dinner_scanned_at ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 dark:bg-cyan-950/20 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-cyan-900/30'}`}>
                                D
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
