export default function AdminEventsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="stage-non-actionable w-32 h-4 bg-blue-500/20 dark:bg-cyan-500/20 rounded mb-3"></div>
          <div className="stage-non-actionable w-56 h-8 bg-slate-200 dark:bg-slate-700/60 rounded-xl mb-2"></div>
          <div className="stage-non-actionable w-72 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="stage-actionable w-36 h-10 bg-slate-800/20 dark:bg-cyan-600/30 rounded-lg"></div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#080d1a] rounded-xl p-5 border border-slate-100 dark:border-cyan-900/30 flex flex-col justify-between h-28"
          >
            <div className="flex items-center gap-3">
              <div className="stage-icon w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-cyan-500/20"></div>
              <div className="stage-non-actionable w-24 h-4 bg-slate-200 dark:bg-slate-700/60 rounded"></div>
            </div>
            <div className="stage-non-actionable w-12 h-7 bg-slate-300 dark:bg-slate-700 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Events Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 h-64 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="stage-non-actionable w-24 h-5 bg-emerald-500/20 dark:bg-emerald-500/20 rounded-full"></div>
              <div className="stage-non-actionable w-48 h-6 bg-slate-200 dark:bg-slate-700/60 rounded-lg"></div>
              <div className="stage-non-actionable w-36 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
              <div className="stage-non-actionable w-32 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
            </div>
            <div className="stage-actionable w-full h-10 bg-slate-100 dark:bg-slate-800/80 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
