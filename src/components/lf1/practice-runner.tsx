"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Lf1PublicQuestion } from "@/lib/lf1/bank";
import { OptionList } from "./option-list";
import { CheckCircle2, XCircle } from "lucide-react";

export interface PracticeFeedback {
  correct: boolean;
  selectedIndex: number;
  correctIndex: number;
  explanation: string;
}

/** One question at a time with immediate marking and an explanation — the
 * LF1 counterpart of KaeLex's student practice runner. */
export function PracticeRunner({
  testId,
  title,
  questions,
  initialFeedback,
}: {
  testId: string;
  title: string;
  questions: Lf1PublicQuestion[];
  initialFeedback: Record<string, PracticeFeedback>;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState(initialFeedback);
  const [index, setIndex] = useState(() => {
    const firstUnanswered = questions.findIndex((q) => !initialFeedback[q.id]);
    return firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const question = questions[index];
  const current = feedback[question.id];
  const answeredCount = Object.keys(feedback).length;
  const correctCount = Object.values(feedback).filter((f) => f.correct).length;
  const isLast = index === questions.length - 1;

  async function check() {
    if (selected === null) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/lf1/tests/${testId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, selectedIndex: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedback((prev) => ({ ...prev, [question.id]: data }));
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Couldn't save that answer — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    const res = await fetch(`/api/lf1/tests/${testId}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    if (!res.ok) {
      toast.error("Couldn't finish the test — try again.");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  function next() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{title}</span>
        <span>
          Question {index + 1} of {questions.length} · {correctCount}/{answeredCount} correct
        </span>
      </div>
      <Progress value={(answeredCount / questions.length) * 100} className="h-2" />

      <Card>
        <CardContent className="space-y-5 py-6">
          <div className="space-y-2">
            <Badge variant="secondary" className="rounded-full">
              Syllabus {question.objective}
            </Badge>
            <p className="text-lg font-medium">{question.question}</p>
          </div>

          <OptionList
            options={question.options}
            selected={current ? current.selectedIndex : selected}
            onSelect={setSelected}
            disabled={!!current || busy}
            correctIndex={current?.correctIndex}
          />

          {current && (
            <div
              className={`flex items-start gap-2 rounded-xl border-2 p-4 ${current.correct ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950" : "border-amber-400 bg-amber-50 dark:bg-amber-950"}`}
            >
              {current.correct ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />}
              <div className="text-sm">
                <p className="font-semibold">{current.correct ? "Correct" : "Not quite"}</p>
                <p className="mt-1 text-muted-foreground">{current.explanation}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={finish} disabled={busy}>
              Finish now
            </Button>
            {!current ? (
              <Button onClick={check} disabled={selected === null || busy}>
                {busy ? "Checking..." : "Check answer"}
              </Button>
            ) : isLast ? (
              <Button onClick={finish} disabled={busy}>
                See results
              </Button>
            ) : (
              <Button onClick={next}>Next question</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
