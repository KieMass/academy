"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { PublicQuestion, QuestionResponse } from "@/lib/question-engine/types";
import { QuestionBody } from "@/components/question-engine/question-runner";
import { CheckCircle2, XCircle, Trophy, RotateCcw, ArrowLeft, AlertTriangle } from "lucide-react";

interface AttemptFeedback {
  correct: boolean;
  explanation: string | null;
  correctAnswer: string;
  xpAwarded: number;
}

/** Simulated NGSA-style practice exam, built from the app's own Guyana Y6
 *  question bank (see GET /api/ngsa/exam) — explicitly NOT a transcription
 *  of any real past paper. Reuses the same per-question renderers and
 *  grading endpoint (/api/attempts) as ordinary topic practice, so a
 *  student's usual XP/streak/mastery progress is credited the same way. */
export function NgsaExamRunner({ subjectKey, subjectLabel }: { subjectKey: string; subjectLabel: string }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState<QuestionResponse | null>(null);
  const [feedback, setFeedback] = useState<AttemptFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const startedAtRef = useRef<number>(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ngsa-exam", subjectKey],
    queryFn: async () => {
      const res = await fetch(`/api/ngsa/exam?subject=${subjectKey}`);
      if (!res.ok) throw new Error("Failed to load exam");
      return (await res.json()) as { subjectLabel: string; questions: PublicQuestion[]; passages: Record<string, { title: string; bodyText: string }> };
    },
  });

  const questions = data?.questions ?? [];
  const question = questions[index];
  const passage = question?.passageId ? data?.passages?.[question.passageId] : undefined;

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, [index]);

  async function handleSubmit() {
    if (!question || !response) return;
    setSubmitting(true);
    const timeSpentSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, response, timeSpentSeconds }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      const result = await res.json();
      setFeedback({ correct: result.correct, explanation: result.explanation, correctAnswer: result.correctAnswer, xpAwarded: result.xpAwarded });
      setResults((prev) => [...prev, result.correct]);
      setTotalXp((prev) => prev + result.xpAwarded);
    } catch {
      toast.error("Couldn't save that answer — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    setResponse(null);
    setFeedback(null);
    setIndex((i) => i + 1);
  }

  if (isLoading) {
    return <Card><CardContent className="py-16 text-center text-muted-foreground">Preparing your practice exam...</CardContent></Card>;
  }
  if (isError || (!isLoading && questions.length === 0)) {
    return (
      <Card>
        <CardContent className="space-y-3 py-10 text-center">
          <p className="text-muted-foreground">No {subjectLabel} practice questions available yet.</p>
          <Button variant="outline" onClick={() => router.push("/student/ngsa")}>Back to NGSA Prep</Button>
        </CardContent>
      </Card>
    );
  }

  const isComplete = questions.length > 0 && index >= questions.length;
  const scorePct = results.length > 0 ? Math.round((results.filter(Boolean).length / results.length) * 100) : 0;

  if (isComplete) {
    return (
      <Card className="border-primary/30">
        <CardContent className="space-y-5 py-10 text-center">
          <Trophy className="mx-auto size-12 text-accent" />
          <h2 className="font-heading text-2xl font-bold">Practice exam complete!</h2>
          <p className="text-muted-foreground">
            You scored <strong className="text-foreground">{results.filter(Boolean).length} / {results.length}</strong> ({scorePct}%)
          </p>
          <Badge variant="secondary" className="rounded-full px-3 py-1">+{totalXp} XP</Badge>
          <p className="mx-auto max-w-md text-xs text-muted-foreground">
            Remember: this was a KaeLex-generated practice paper, not an official NGSA past paper — see the real past papers on the NGSA Prep page for genuine exam questions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              className="gap-2"
              onClick={() => {
                setIndex(0);
                setResults([]);
                setTotalXp(0);
              }}
            >
              <RotateCcw className="size-4" /> Try again
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => router.push("/student/ngsa")}>
              <ArrowLeft className="size-4" /> Back to NGSA Prep
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
        <CardContent className="flex items-start gap-2.5 py-3 text-xs">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p>Practice exam created by KaeLex Academy — not an official NGSA past paper.</p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{subjectLabel} — Question {index + 1} of {questions.length}</span>
      </div>
      <Progress value={((index + (feedback ? 1 : 0)) / questions.length) * 100} className="h-2" />

      {passage && (
        <Card className="bg-muted/40">
          <CardContent className="max-h-56 overflow-y-auto py-4 text-sm leading-relaxed whitespace-pre-line">
            <p className="mb-2 font-heading font-semibold">{passage.title}</p>
            {passage.bodyText}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-5 py-6">
          <p className="text-lg font-medium">{question.promptText}</p>

          <QuestionBody question={question} response={response} onChange={setResponse} disabled={!!feedback} feedback={feedback ? { correct: feedback.correct, correctAnswer: feedback.correctAnswer } : null} />

          {feedback && (
            <div className={`flex items-start gap-2 rounded-xl border-2 p-4 ${feedback.correct ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950" : "border-amber-400 bg-amber-50 dark:bg-amber-950"}`}>
              {feedback.correct ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />}
              <div className="text-sm">
                <p className="font-semibold">{feedback.correct ? `Correct! +${feedback.xpAwarded} XP` : "Not quite — here's why:"}</p>
                {feedback.explanation && <p className="mt-1 text-muted-foreground">{feedback.explanation}</p>}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            {!feedback ? (
              <Button onClick={handleSubmit} disabled={!response || submitting}>
                {submitting ? "Checking..." : "Check answer"}
              </Button>
            ) : (
              <Button onClick={handleNext}>{index + 1 < questions.length ? "Next question" : "See results"}</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
