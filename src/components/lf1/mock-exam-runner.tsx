"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lf1PublicQuestion } from "@/lib/lf1/bank";
import { OptionList } from "./option-list";
import { ArrowLeft, ArrowRight, Clock, Flag } from "lucide-react";

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Timed LF1 mock exam: free navigation, flag-for-review, answers autosaved
 * to the server (so a refresh or dropped connection resumes where it left
 * off) and marked only on submit. Submits itself when the clock runs out.
 */
export function MockExamRunner({
  testId,
  questions,
  initialAnswers,
  deadline,
}: {
  testId: string;
  questions: Lf1PublicQuestion[];
  initialAnswers: Record<string, number>;
  deadline: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState(initialAnswers);
  const [index, setIndex] = useState(0);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const saveErrorShownRef = useRef(false);

  const question = questions[index];
  const remaining = deadline - now;
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const unanswered = questions.length - answeredCount;

  const submit = useCallback(
    async (finalAnswers: Record<string, number>) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        const res = await fetch(`/api/lf1/tests/${testId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: finalAnswers }),
        });
        if (!res.ok) throw new Error();
        router.refresh();
      } catch {
        submittedRef.current = false;
        setSubmitting(false);
        toast.error("Couldn't submit your exam — check your connection and try again.");
      }
    },
    [router, testId]
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keep the latest answers reachable from the timeout below without
  // re-arming it on every click.
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      toast.info("Time's up — submitting your exam.");
      void submit(answersRef.current);
    }, Math.max(0, deadline - Date.now()));
    return () => clearTimeout(timeout);
  }, [deadline, submit]);

  function choose(selectedIndex: number) {
    const questionId = question.id;
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
    setConfirming(false);
    fetch(`/api/lf1/tests/${testId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, selectedIndex }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
      })
      .catch(() => {
        // Not fatal — the full answer sheet is sent again on submit.
        if (!saveErrorShownRef.current) {
          saveErrorShownRef.current = true;
          toast.warning("Autosave is having trouble — your answers are kept on this page and will be sent when you submit.");
        }
      });
  }

  function toggleFlag() {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-2.5 shadow-sm">
        <span className="text-sm font-medium">
          Mock exam · {answeredCount}/{questions.length} answered
        </span>
        <span
          className={cn("flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums", remaining < 5 * 60 * 1000 && "text-destructive")}
          aria-live="polite"
        >
          <Clock className="size-4" /> {formatRemaining(remaining)}
        </span>
      </div>

      <Card>
        <CardContent className="space-y-5 py-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Question {index + 1} of {questions.length}
            </p>
            <Button variant={flagged.has(question.id) ? "secondary" : "ghost"} size="sm" className="gap-1.5" onClick={toggleFlag} aria-pressed={flagged.has(question.id)}>
              <Flag className="size-3.5" /> {flagged.has(question.id) ? "Flagged" : "Flag for review"}
            </Button>
          </div>
          <p className="text-lg font-medium">{question.question}</p>
          <OptionList options={question.options} selected={answers[question.id] ?? null} onSelect={choose} disabled={submitting} />

          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" className="gap-1.5" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
              <ArrowLeft className="size-4" /> Previous
            </Button>
            {index < questions.length - 1 ? (
              <Button className="gap-1.5" onClick={() => setIndex((i) => i + 1)}>
                Next <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={() => setConfirming(true)} disabled={submitting}>
                Finish exam
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-4">
          <p className="text-xs text-muted-foreground">Jump to a question. Filled = answered, orange ring = flagged.</p>
          <div className="grid grid-cols-10 gap-1.5">
            {questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Question ${i + 1}${answers[q.id] !== undefined ? ", answered" : ""}${flagged.has(q.id) ? ", flagged" : ""}`}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-md border text-xs tabular-nums transition-colors",
                  answers[q.id] !== undefined ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50",
                  flagged.has(q.id) && "ring-2 ring-amber-500 ring-offset-1 ring-offset-background",
                  i === index && "outline-2 outline-offset-1 outline-foreground"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            {confirming ? (
              <>
                <p className="mr-auto text-sm">
                  {unanswered > 0 ? `${unanswered} question${unanswered === 1 ? " is" : "s are"} unanswered and will be marked wrong. ` : ""}
                  {flagged.size > 0 ? `${flagged.size} flagged. ` : ""}Submit now?
                </p>
                <Button variant="ghost" onClick={() => setConfirming(false)} disabled={submitting}>
                  Keep going
                </Button>
                <Button onClick={() => submit(answers)} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit exam"}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setConfirming(true)} disabled={submitting}>
                Submit exam
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
