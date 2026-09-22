import { cn } from "@/lib/utils";
import type { Lf1OutcomeProgress } from "@/lib/lf1/progress";
import { LF1_READINESS_TARGET_PCT } from "@/lib/lf1/tests";

/** One row per learning outcome: exam weighting and the learner's accuracy
 * so far, coloured against the readiness target. */
export function OutcomeProgressList({ progress, action }: { progress: Lf1OutcomeProgress[]; action?: (outcome: number) => React.ReactNode }) {
  return (
    <ul className="divide-y">
      {progress.map((p) => (
        <li key={p.outcome} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              <span className="mr-1.5 text-muted-foreground">{p.outcome}.</span>
              {p.title}
            </p>
            <p className="text-xs text-muted-foreground">
              ~{p.examQuestions} exam questions · {p.answered === 0 ? "not practised yet" : `${p.correct}/${p.answered} correct`}
            </p>
          </div>
          <div className="flex items-center gap-3 sm:w-64">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${p.accuracyPct}% accuracy`}>
              <div
                className={cn(
                  "h-full rounded-full",
                  p.answered === 0 ? "bg-transparent" : p.accuracyPct >= LF1_READINESS_TARGET_PCT ? "bg-emerald-500" : p.accuracyPct >= 50 ? "bg-amber-500" : "bg-destructive"
                )}
                style={{ width: `${p.answered === 0 ? 0 : Math.max(p.accuracyPct, 4)}%` }}
              />
            </div>
            <span className="w-10 text-right text-sm tabular-nums">{p.answered === 0 ? "—" : `${p.accuracyPct}%`}</span>
            {action?.(p.outcome)}
          </div>
        </li>
      ))}
    </ul>
  );
}
