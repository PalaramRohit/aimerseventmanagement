export default function AdminDashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Overview Banner Skeleton */}
      <div className="bg-white dark:bg-[#080d1a] rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-cyan-900/30 shadow-sm relative overflow-hidden">
        <div className="stage-non-actionable w-28 h-5 bg-emerald-500/20 dark:bg-emerald-500/20 rounded-full mb-4"></div>
        <div className="stage-non-actionable w-64 h-8 bg-slate-200 dark:bg-slate-700/60 rounded-xl mb-3"></div>
        <div className="stage-non-actionable w-96 max-w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
      </div>

      {/* Action Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#080d1a] p-6 rounded-2xl border border-slate-100 dark:border-cyan-900/30 h-48 flex flex-col justify-between"
          >
            <div>
              <div className="stage-icon w-10 h-10 rounded-xl bg-blue-500/15 dark:bg-cyan-500/20 mb-4"></div>
              <div className="stage-non-actionable w-48 h-5 bg-slate-200 dark:bg-slate-700/60 rounded-lg mb-2"></div>
              <div className="stage-non-actionable w-full max-w-xs h-3 bg-slate-100 dark:bg-slate-800 rounded"></div>
            </div>
            <div className="stage-actionable w-24 h-4 bg-blue-500/20 dark:bg-cyan-500/20 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
