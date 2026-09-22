import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getLf1Outcome } from "@/lib/lf1/bank";
import { LF1_READINESS_TARGET_PCT, pct } from "@/lib/lf1/tests";

export interface Lf1HistoryRow {
  id: string;
  mode: "PRACTICE" | "MOCK";
  outcome: number | null;
  totalQuestions: number;
  correctCount: number | null;
  startedAt: Date;
  completedAt: Date | null;
}

export function testLabel(row: Pick<Lf1HistoryRow, "mode" | "outcome">): string {
  if (row.mode === "MOCK") return "Mock exam";
  if (row.outcome === null) return "Mixed practice";
  return `Practice — Outcome ${row.outcome}: ${getLf1Outcome(row.outcome)?.title ?? ""}`;
}

export function TestHistoryTable({ rows }: { rows: Lf1HistoryRow[] }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No tests yet — start a practice set or a mock exam.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 font-medium">Test</th>
            <th className="pb-2 pl-4 font-medium">Date</th>
            <th className="pb-2 pl-4 font-medium text-right">Score</th>
            <th className="pb-2 pl-4" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const score = r.completedAt && r.correctCount !== null ? pct(r.correctCount, r.totalQuestions) : null;
            return (
              <tr key={r.id} className="border-b last:border-0">
                <td className="max-w-xs py-2.5 pr-2">
                  <span className="line-clamp-1">{testLabel(r)}</span>
                </td>
                <td className="py-2.5 pl-4 whitespace-nowrap text-muted-foreground">
                  {r.startedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="py-2.5 pl-4 text-right whitespace-nowrap">
                  {score === null ? (
                    <Badge variant="outline">In progress</Badge>
                  ) : (
                    <span className={score >= LF1_READINESS_TARGET_PCT ? "font-semibold text-emerald-600 dark:text-emerald-400" : "font-semibold"}>
                      {r.correctCount}/{r.totalQuestions} ({score}%)
                    </span>
                  )}
                </td>
                <td className="py-2.5 pl-4 text-right">
                  <Link href={`/lf1/tests/${r.id}`} className="text-primary underline-offset-2 hover:underline">
                    {r.completedAt ? "Review" : "Resume"}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
