export default function CoordinatorLoading() {
  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 sm:p-12 h-56 flex flex-col justify-center space-y-3 shadow-xl">
        <div className="stage-non-actionable w-36 h-6 bg-indigo-500/20 rounded-full"></div>
        <div className="stage-non-actionable w-80 h-9 bg-slate-300/40 rounded-xl"></div>
        <div className="stage-non-actionable w-96 max-w-full h-4 bg-indigo-100/30 rounded-lg"></div>
      </div>

      {/* Assigned Events Section Skeleton */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="stage-non-actionable w-44 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="stage-non-actionable w-20 h-6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-cyan-900/30 rounded-3xl p-6 h-64 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="stage-non-actionable w-20 h-5 bg-indigo-500/20 rounded-full"></div>
                <div className="stage-non-actionable w-44 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="stage-non-actionable w-36 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="stage-actionable w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
