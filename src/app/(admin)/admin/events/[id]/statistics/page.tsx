import { getEventOperationsData } from '../operations/actions'
import { StatisticsRefreshButton } from './StatisticsRefreshButton'
import { requireAdmin } from '@/lib/auth/server'
import {
  Users,
  CheckCircle,
  XCircle,
  Coffee,
  Utensils,
  UtensilsCrossed,
  Activity,
  Briefcase,
  GraduationCap,
  Building,
  ShieldCheck,
  UserX
} from 'lucide-react'

// Render a single stat block
function StatBlock({ title, value, subValue, icon: Icon, colorClass }: { title: string, value: string | number, subValue?: string, icon: React.ElementType, colorClass: string }) {
  return (
    <div className="bg-slate-50 dark:bg-cyan-950/20 rounded-xl p-4 border border-slate-100 dark:border-cyan-900/20 flex flex-col items-center text-center">
      <div className={`p-2 rounded-lg mb-3 ${colorClass}`}>
        <Icon size={20} />
      </div>
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</h3>
      <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{value}</div>
      {subValue && <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{subValue}</div>}
    </div>
  )
}

function ProgressCircle({ percentage, label, colorClass, ringColorClass }: { percentage: number, label: string, colorClass: string, ringColorClass: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          {/* Background Circle */}
          <path
            className="text-slate-100"
            strokeDasharray="100, 100"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            stroke="currentColor"
            strokeWidth="3.5"
            fill="none"
          />
          {/* Progress Circle */}
          <path
            className={ringColorClass}
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div className={`absolute text-lg font-black ${colorClass}`}>{percentage}%</div>
      </div>
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function BreakdownList({ data, title, icon: Icon }: { data: Record<string, number>, title: string, icon: React.ElementType }) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1])
  
  return (
    <div className="bg-slate-50 dark:bg-cyan-950/20 rounded-xl p-5 border border-slate-100 dark:border-cyan-900/20 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-cyan-900/30">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Icon size={18} />
        </div>
        <h3 className="font-bold text-slate-700 dark:text-slate-200">{title}</h3>
      </div>
      <div className="flex-1 overflow-y-auto max-h-64 space-y-3 pr-2">
        {sorted.length === 0 ? (
          <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No data available</div>
        ) : (
          sorted.map(([key, count]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate pr-4">{key}</span>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md shrink-0">{count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function EventStatisticsPage({ params }: Props) {
  await requireAdmin()
  const { id: eventId } = await params

  const { data, error } = await getEventOperationsData(eventId)

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-[#080d1a] rounded-3xl p-8 border border-slate-200 dark:border-cyan-900/30 text-center shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Failed to load statistics</h2>
        <p className="text-slate-500 dark:text-slate-400">{error || 'Unknown error occurred'}</p>
      </div>
    )
  }

  const { attendance, meals, participants, coordinatorStats, breakdowns } = data
  const totalCoordinators = coordinatorStats.length
  const activeCoordinators = coordinatorStats.filter(c => c.activityStatus === 'Active').length
  const idleCoordinators = coordinatorStats.filter(c => c.activityStatus === 'No recent activity').length
  const unstartedCoordinators = coordinatorStats.filter(c => c.activityStatus === 'Not started').length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#080d1a] p-5 rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Event Statistics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Real-time breakdown of event data and operations</p>
        </div>
        <StatisticsRefreshButton />
      </div>

      {/* 1. ATTENDANCE */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
        <div className="bg-slate-50 dark:bg-cyan-950/20 border-b border-slate-200 dark:border-cyan-900/30 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity size={18} /></div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Attendance Overview</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatBlock title="Total Registered" value={attendance.totalRegistered} icon={Users} colorClass="bg-slate-100 dark:bg-cyan-900/20 text-slate-600 dark:text-slate-300" />
            <StatBlock title="Attended" value={attendance.attended} icon={CheckCircle} colorClass="bg-emerald-100 text-emerald-600" />
            <StatBlock title="Not Attended" value={attendance.notAttended} icon={UserX} colorClass="bg-amber-100 text-amber-600" />
          </div>
          <div className="md:col-span-1 flex justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-cyan-900/20 pt-6 md:pt-0 md:pl-6">
            <ProgressCircle percentage={attendance.percentage} label="Attendance Rate" colorClass="text-blue-600" ringColorClass="text-blue-500" />
          </div>
        </div>
      </div>

      {/* 2. REGISTRATION */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
        <div className="bg-slate-50 dark:bg-cyan-950/20 border-b border-slate-200 dark:border-cyan-900/30 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Briefcase size={18} /></div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Registration Status</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatBlock title="Total Registered" value={participants.totalRegistered} icon={Users} colorClass="bg-slate-100 dark:bg-cyan-900/20 text-slate-600 dark:text-slate-300" />
          <StatBlock title="Active / Synced" value={participants.activeSynchronized} subValue="Submitted & Logged In" icon={ShieldCheck} colorClass="bg-emerald-100 text-emerald-600" />
          <StatBlock title="Pending Login" value={participants.pendingLogin} subValue="Not Submitted / Pending" icon={Activity} colorClass="bg-amber-100 text-amber-600" />
        </div>
      </div>

      {/* 3. MEALS */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
        <div className="bg-slate-50 dark:bg-cyan-950/20 border-b border-slate-200 dark:border-cyan-900/30 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Utensils size={18} /></div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Meals & Catering</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Breakfast */}
          <div className="bg-slate-50 dark:bg-cyan-950/20 rounded-xl p-5 border border-slate-100 dark:border-cyan-900/20 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 w-full justify-center">
              <Coffee size={18} className="text-orange-500" />
              <h3 className="font-bold text-slate-700 dark:text-slate-200">Breakfast</h3>
            </div>
            <ProgressCircle percentage={meals.breakfast.percentage} label="Consumed" colorClass="text-orange-600" ringColorClass="text-orange-500" />
            <div className="w-full grid grid-cols-3 gap-2 mt-4 text-center">
              <div><div className="text-xs text-slate-500 dark:text-slate-400 font-bold">Eligible</div><div className="font-black text-slate-800 dark:text-slate-100">{meals.breakfast.eligible}</div></div>
              <div><div className="text-xs text-emerald-600 font-bold">Done</div><div className="font-black text-emerald-700">{meals.breakfast.consumed}</div></div>
              <div><div className="text-xs text-amber-600 font-bold">Left</div><div className="font-black text-amber-700">{meals.breakfast.remaining}</div></div>
            </div>
          </div>

          {/* Lunch */}
          <div className="bg-slate-50 dark:bg-cyan-950/20 rounded-xl p-5 border border-slate-100 dark:border-cyan-900/20 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 w-full justify-center">
              <Utensils size={18} className="text-red-500" />
              <h3 className="font-bold text-slate-700 dark:text-slate-200">Lunch</h3>
            </div>
            <ProgressCircle percentage={meals.lunch.percentage} label="Consumed" colorClass="text-red-600" ringColorClass="text-red-500" />
            <div className="w-full grid grid-cols-3 gap-2 mt-4 text-center">
              <div><div className="text-xs text-slate-500 dark:text-slate-400 font-bold">Eligible</div><div className="font-black text-slate-800 dark:text-slate-100">{meals.lunch.eligible}</div></div>
              <div><div className="text-xs text-emerald-600 font-bold">Done</div><div className="font-black text-emerald-700">{meals.lunch.consumed}</div></div>
              <div><div className="text-xs text-amber-600 font-bold">Left</div><div className="font-black text-amber-700">{meals.lunch.remaining}</div></div>
            </div>
          </div>

          {/* Dinner */}
          <div className="bg-slate-50 dark:bg-cyan-950/20 rounded-xl p-5 border border-slate-100 dark:border-cyan-900/20 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 w-full justify-center">
              <UtensilsCrossed size={18} className="text-indigo-500" />
              <h3 className="font-bold text-slate-700 dark:text-slate-200">Dinner</h3>
            </div>
            <ProgressCircle percentage={meals.dinner.percentage} label="Consumed" colorClass="text-indigo-600" ringColorClass="text-indigo-500" />
            <div className="w-full grid grid-cols-3 gap-2 mt-4 text-center">
              <div><div className="text-xs text-slate-500 dark:text-slate-400 font-bold">Eligible</div><div className="font-black text-slate-800 dark:text-slate-100">{meals.dinner.eligible}</div></div>
              <div><div className="text-xs text-emerald-600 font-bold">Done</div><div className="font-black text-emerald-700">{meals.dinner.consumed}</div></div>
              <div><div className="text-xs text-amber-600 font-bold">Left</div><div className="font-black text-amber-700">{meals.dinner.remaining}</div></div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. PARTICIPANT BREAKDOWN */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
        <div className="bg-slate-50 dark:bg-cyan-950/20 border-b border-slate-200 dark:border-cyan-900/30 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Users size={18} /></div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Participant Breakdown</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <BreakdownList data={breakdowns?.college || {}} title="Colleges" icon={Building} />
          <BreakdownList data={breakdowns?.branch || {}} title="Branches" icon={Briefcase} />
          <BreakdownList data={breakdowns?.academicYear || {}} title="Academic Years" icon={GraduationCap} />
        </div>
      </div>

      {/* 5. COORDINATOR STATISTICS */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-cyan-900/30 shadow-sm overflow-hidden">
        <div className="bg-slate-50 dark:bg-cyan-950/20 border-b border-slate-200 dark:border-cyan-900/30 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><ShieldCheck size={18} /></div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Coordinator Activity</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatBlock title="Total Coordinators" value={totalCoordinators} icon={Users} colorClass="bg-slate-100 dark:bg-cyan-900/20 text-slate-600 dark:text-slate-300" />
          <StatBlock title="Active / Scanning" value={activeCoordinators} icon={Activity} colorClass="bg-emerald-100 text-emerald-600" />
          <StatBlock title="Idle (>15m)" value={idleCoordinators} icon={Coffee} colorClass="bg-amber-100 text-amber-600" />
          <StatBlock title="Not Started" value={unstartedCoordinators} icon={UserX} colorClass="bg-red-100 text-red-600" />
        </div>
      </div>

    </div>
  )
}
