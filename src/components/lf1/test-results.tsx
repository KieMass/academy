import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLf1Outcome, type Lf1Question } from "@/lib/lf1/bank";
import { LF1_READINESS_TARGET_PCT, pct, scoreByOutcome } from "@/lib/lf1/tests";
import { StartTestButton } from "./start-test-button";
import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export interface ReviewItem {
  question: Lf1Question;
  selectedIndex: number | null;
  isCorrect: boolean;
  answered: boolean; // false = practice question skipped (not marked)
}

/** Score summary, per-outcome breakdown and a full answer review for a
 * finished LF1 test. */
export function TestResults({
  title,
  mode,
  outcome,
  items,
}: {
  title: string;
  mode: "PRACTICE" | "MOCK";
  outcome: number | null;
  items: ReviewItem[];
}) {
  const marked = items.filter((i) => i.answered);
  const correct = marked.filter((i) => i.isCorrect).length;
  const score = pct(correct, marked.length);
  const byOutcome = scoreByOutcome(marked.map((i) => ({ outcome: i.question.outcome, isCorrect: i.isCorrect })));
  const onTarget = score >= LF1_READINESS_TARGET_PCT;

  return (
    <div className="space-y-6">
      <Card className={cn("border-t-4", onTarget ? "border-t-emerald-500" : "border-t-amber-500")}>
        <CardContent className="space-y-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-heading text-4xl font-bold tabular-nums">
            {correct} / {marked.length}
            <span className="ml-2 text-2xl text-muted-foreground">({score}%)</span>
          </p>
          <p className="text-sm">
            {onTarget
              ? `At or above the ${LF1_READINESS_TARGET_PCT}% readiness target — nice work.`
              : `Below the ${LF1_READINESS_TARGET_PCT}% readiness target — review the explanations below and practise your weaker outcomes.`}
          </p>
          {mode === "PRACTICE" && items.length > marked.length && (
            <p className="text-xs text-muted-foreground">{items.length - marked.length} question(s) skipped and not marked.</p>
          )}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {mode === "MOCK" ? (
              <StartTestButton request={{ mode: "MOCK" }}>Take another mock</StartTestButton>
            ) : (
              <StartTestButton request={{ mode: "PRACTICE", outcome, count: 10 }}>Practise again</StartTestButton>
            )}
          </div>
        </CardContent>
      </Card>

      {byOutcome.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By learning outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {byOutcome.map((o) => {
                  const p = pct(o.correct, o.total);
                  return (
                    <tr key={o.outcome} className="border-b last:border-0">
                      <td className="py-2 pr-2">
                        <span className="mr-1.5 text-muted-foreground">{o.outcome}.</span>
                        {getLf1Outcome(o.outcome)?.title}
                      </td>
                      <td className="py-2 pl-2 text-right whitespace-nowrap tabular-nums">
                        {o.correct}/{o.total}{" "}
                        <span className={p >= LF1_READINESS_TARGET_PCT ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>({p}%)</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review your answers</CardTitle>
          <CardDescription>The correct option is shown in green, with an explanation for every question.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, n) => {
            const { question: q } = item;
            return (
              <div key={q.id} className="space-y-2 rounded-xl border p-4">
                <div className="flex items-start gap-2">
                  {!item.answered ? (
                    <MinusCircle className="mt-0.5 size-4.5 shrink-0 text-muted-foreground" />
                  ) : item.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 size-4.5 shrink-0 text-destructive" />
                  )}
                  <p className="flex-1 text-sm font-medium">
                    {n + 1}. {q.question}
                  </p>
                  <Badge variant="outline" className="shrink-0 rounded-full">
                    {q.objective}
                  </Badge>
                </div>
                <ul className="space-y-1 pl-6 text-sm">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={cn(
                        "rounded-md px-2 py-1",
                        i === q.answer && "bg-emerald-50 font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
                        i === item.selectedIndex && i !== q.answer && "bg-destructive/10 text-destructive"
                      )}
                    >
                      <span className={cn(i === item.selectedIndex && i !== q.answer && "line-through")}>
                        {LETTERS[i]}. {opt}
                      </span>
                      {i === item.selectedIndex && <span className="ml-1.5 text-xs">(your answer)</span>}
                    </li>
                  ))}
                </ul>
                {item.answered && item.selectedIndex === null && <p className="pl-6 text-xs text-destructive">Not answered.</p>}
                <p className="pl-6 text-sm text-muted-foreground">{q.explanation}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
