import { CometSpinner } from "@/components/loading-ui/comet-spinner"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#03060a]/50 backdrop-blur-sm transition-all">
      <div className="flex flex-col items-center gap-4 bg-white dark:bg-[#080d1a] p-8 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-cyan-900/10 border border-slate-100 dark:border-cyan-900/30">
        <CometSpinner className="size-12" />
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider animate-pulse">
          LOADING...
        </p>
      </div>
    </div>
  )
}
