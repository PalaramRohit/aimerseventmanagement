export default function TeamsLoading() {
  return (
    <div className="h-full min-h-[600px] mt-8 space-y-6 animate-pulse">
      {/* Search Bar Skeleton */}
      <div className="bg-white dark:bg-[#080d1a] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-cyan-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="stage-actionable w-full sm:w-80 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        <div className="stage-actionable w-36 h-10 bg-blue-500/20 dark:bg-cyan-600/30 rounded-xl"></div>
      </div>

      {/* Teams Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 h-52 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="stage-non-actionable w-36 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="stage-non-actionable w-16 h-5 bg-blue-500/15 dark:bg-cyan-500/20 rounded-full"></div>
              </div>
              <div className="stage-non-actionable w-48 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
              <div className="stage-non-actionable w-32 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
            </div>
            <div className="stage-actionable w-full h-9 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
