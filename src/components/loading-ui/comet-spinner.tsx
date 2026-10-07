import { cn } from "@/lib/utils"

interface CometSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CometSpinner({ className, ...props }: CometSpinnerProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center animate-spin",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 rounded-full border-[3px] border-t-blue-600 border-r-blue-600/50 border-b-blue-600/10 border-l-transparent dark:border-t-cyan-400 dark:border-r-cyan-400/50 dark:border-b-cyan-400/10" />
      <div className="absolute inset-[3px] rounded-full border-[2px] border-l-teal-500 border-b-teal-500/50 border-r-teal-500/10 border-t-transparent dark:border-l-blue-500 dark:border-b-blue-500/50 dark:border-r-blue-500/10 opacity-70" style={{ animationDirection: 'reverse' }} />
    </div>
  )
}
