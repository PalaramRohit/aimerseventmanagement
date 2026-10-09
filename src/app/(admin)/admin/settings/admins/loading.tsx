export default function AdminsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="stage-non-actionable w-48 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2"></div>
          <div className="stage-non-actionable w-72 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="stage-actionable w-32 h-10 bg-emerald-500/20 dark:bg-emerald-600/30 rounded-xl"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-[#080d1a] rounded-3xl border border-slate-200 dark:border-cyan-900/30 overflow-hidden">
        <div className="h-12 bg-slate-50 dark:bg-[#0c1427] border-b border-slate-200 dark:border-cyan-900/30 flex items-center px-6 gap-6">
          <div className="stage-non-actionable w-48 h-4 bg-slate-200 dark:bg-slate-700/60 rounded"></div>
          <div className="stage-non-actionable w-32 h-4 bg-slate-200 dark:bg-slate-700/60 rounded"></div>
          <div className="stage-non-actionable w-24 h-4 bg-slate-200 dark:bg-slate-700/60 rounded ml-auto"></div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 flex items-center px-6 gap-6">
              <div className="flex items-center gap-3 w-48">
                <div className="stage-icon w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                <div className="space-y-1.5">
                  <div className="stage-non-actionable w-28 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="stage-non-actionable w-36 h-3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="stage-non-actionable w-24 h-6 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full"></div>
              <div className="stage-actionable w-20 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
