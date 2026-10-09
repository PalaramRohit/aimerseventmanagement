export default function StatisticsLoading() {
  return (
    <div className="mt-8 space-y-8 animate-pulse">
      {/* Title & Refresh Button Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="stage-non-actionable w-48 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2"></div>
          <div className="stage-non-actionable w-64 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="stage-actionable w-28 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
      </div>

      {/* Stat Cards Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#080d1a] rounded-2xl p-5 border border-slate-200 dark:border-cyan-900/30 flex flex-col items-center justify-center text-center h-32 space-y-2"
          >
            <div className="stage-icon w-8 h-8 rounded-lg bg-blue-500/15 dark:bg-cyan-500/20"></div>
            <div className="stage-non-actionable w-20 h-3 bg-slate-200 dark:bg-slate-700/60 rounded"></div>
            <div className="stage-non-actionable w-12 h-6 bg-slate-300 dark:bg-slate-600 rounded"></div>
          </div>
        ))}
      </div>

      {/* Progress & Breakdown Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#080d1a] rounded-3xl p-6 border border-slate-200 dark:border-cyan-900/30 flex flex-col items-center justify-center h-64 space-y-4"
          >
            <div className="stage-non-actionable w-28 h-28 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <div className="stage-non-actionable w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="stage-non-actionable w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
