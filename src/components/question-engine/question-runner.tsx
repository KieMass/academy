"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { DifficultyBand } from "@/lib/curriculum/types";
import type { PublicQuestion, QuestionResponse } from "@/lib/question-engine/types";
import {
  MultipleChoiceRenderer,
  ShortAnswerRenderer,
  FillInBoxRenderer,
  MultiStepRenderer,
  MatchingRenderer,
  DragDropRenderer,
} from "./renderers";
import { CheckCircle2, XCircle, Trophy, RotateCcw, ArrowLeft, Volume2 } from "lucide-react";
import { speak, useAccessibilityStore } from "@/store/accessibility-store";

const DIFFICULTIES: { value: DifficultyBand; label: string; className: string }[] = [
  { value: "bronze", label: "Bronze", className: "bg-amber-700/10 text-amber-800 border-amber-700/30 dark:text-amber-500" },
  { value: "silver", label: "Silver", className: "bg-slate-400/10 text-slate-600 border-slate-400/30 dark:text-slate-300" },
  { value: "gold", label: "Gold", className: "bg-yellow-400/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400" },
  { value: "challenge", label: "Challenge", className: "bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/30 dark:text-fuchsia-400" },
];

interface AttemptFeedback {
  correct: boolean;
  explanation: string | null;
  correctAnswer: string;
  xpAwarded: number;
  newBadges: string[];
}

export function QuestionRunner({
  subjectSlug,
  strandSlug,
  yearGroup,
  strandName,
}: {
  subjectSlug: string;
  strandSlug: string;
  yearGroup: string;
  strandName: string;
}) {
  const router = useRouter();
  const readAloudEnabled = useAccessibilityStore((s) => s.readAloudEnabled);
  const [difficulty, setDifficulty] = useState<DifficultyBand | null>(null);
  const [index, setIndex] = useState(0);
  const [response, setResponse] = useState<QuestionResponse | null>(null);
  const [feedback, setFeedback] = useState<AttemptFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionResults, setSessionResults] = useState<boolean[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  // A ref (not state) because it's a timing side-channel for handleSubmit,
  // not something that should trigger a re-render — and setting it inside
  // an effect (rather than as a useState initializer) keeps the Date.now()
  // call out of the render path.
  const startedAtRef = useRef<number>(0);

  const { data, isLoading } = useQuery({
    queryKey: ["questions", subjectSlug, strandSlug, yearGroup, difficulty],
    queryFn: async () => {
      const params = new URLSearchParams({ subject: subjectSlug, strand: strandSlug, yearGroup, limit: "8" });
      if (difficulty) params.set("difficulty", difficulty);
      const res = await fetch(`/api/questions?${params}`);
      if (!res.ok) throw new Error("Failed to load questions");
      return (await res.json()) as { questions: PublicQuestion[]; passages: Record<string, { title: string; bodyText: string }> };
    },
    enabled: !!difficulty,
  });

  const questions = data?.questions ?? [];
  const question = questions[index];
  const passage = question?.passageId ? data?.passages?.[question.passageId] : undefined;

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, [index, difficulty]);

  useEffect(() => {
    if (readAloudEnabled && question) speak(question.promptText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id, readAloudEnabled]);

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
      setFeedback({
        correct: result.correct,
        explanation: result.explanation,
        correctAnswer: result.correctAnswer,
        xpAwarded: result.xpAwarded,
        newBadges: result.newBadges ?? [],
      });
      setSessionResults((prev) => [...prev, result.correct]);
      setTotalXp((prev) => prev + result.xpAwarded);
      if (result.newBadges?.length) {
        setEarnedBadges((prev) => [...prev, ...result.newBadges]);
        for (const slug of result.newBadges) {
          toast.success(`New badge unlocked: ${slug.replace(/-/g, " ")}! 🏆`);
        }
      }
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

  const isComplete = questions.length > 0 && index >= questions.length;
  const scorePct = sessionResults.length > 0 ? Math.round((sessionResults.filter(Boolean).length / sessionResults.length) * 100) : 0;

  if (!difficulty) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <h2 className="font-heading text-xl font-bold">{strandName}</h2>
          <p className="text-muted-foreground">Choose a level to start practising.</p>
          <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
            {DIFFICULTIES.map((d) => (
              <Button key={d.value} variant="outline" className={`h-16 rounded-xl border-2 text-base font-semibold ${d.className}`} onClick={() => setDifficulty(d.value)}>
                {d.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <Card><CardContent className="py-16 text-center text-muted-foreground">Loading questions...</CardContent></Card>;
  }

  if (!isLoading && questions.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-3 py-10 text-center">
          <p className="text-muted-foreground">No {difficulty} questions available for this topic yet.</p>
          <Button variant="outline" onClick={() => setDifficulty(null)}>Try a different level</Button>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <Card className="border-primary/30">
        <CardContent className="space-y-5 py-10 text-center">
          <Trophy className="mx-auto size-12 text-accent" />
          <h2 className="font-heading text-2xl font-bold">Session complete!</h2>
          <p className="text-muted-foreground">
            You scored <strong className="text-foreground">{sessionResults.filter(Boolean).length} / {sessionResults.length}</strong> ({scorePct}%)
          </p>
          <div className="flex items-center justify-center gap-3">
            <Badge variant="secondary" className="rounded-full px-3 py-1">+{totalXp} XP</Badge>
            {earnedBadges.length > 0 && <Badge className="rounded-full px-3 py-1">{earnedBadges.length} new badge{earnedBadges.length > 1 ? "s" : ""}!</Badge>}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => {
                setIndex(0);
                setSessionResults([]);
                setTotalXp(0);
                setEarnedBadges([]);
                setDifficulty(null);
              }}
              className="gap-2"
            >
              <RotateCcw className="size-4" /> Practise again
            </Button>
            <Button variant="outline" onClick={() => router.push(`/student/${subjectSlug}`)} className="gap-2">
              <ArrowLeft className="size-4" /> Back to {subjectSlug}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {index + 1} of {questions.length}</span>
        <Badge variant="outline" className="capitalize">{difficulty}</Badge>
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
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-medium">{question.promptText}</p>
            <Button variant="ghost" size="icon" onClick={() => speak(question.promptText)} aria-label="Read question aloud">
              <Volume2 className="size-4" />
            </Button>
          </div>

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

          <div className="flex justify-end gap-2">
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

function QuestionBody({
  question,
  response,
  onChange,
  disabled,
  feedback,
}: {
  question: PublicQuestion;
  response: QuestionResponse | null;
  onChange: (r: QuestionResponse) => void;
  disabled: boolean;
  feedback: { correct: boolean; correctAnswer: string } | null;
}) {
  switch (question.type) {
    case "multiple_choice":
      return <MultipleChoiceRenderer question={question} response={response as never} onChange={onChange as never} disabled={disabled} feedback={feedback} />;
    case "short_answer":
      return <ShortAnswerRenderer question={question} response={response as never} onChange={onChange as never} disabled={disabled} feedback={feedback} />;
    case "fill_in_box":
      return <FillInBoxRenderer question={question} response={response as never} onChange={onChange as never} disabled={disabled} feedback={feedback} />;
    case "multi_step":
      return <MultiStepRenderer question={question} response={response as never} onChange={onChange as never} disabled={disabled} feedback={feedback} />;
    case "matching":
      return <MatchingRenderer question={question} response={response as never} onChange={onChange as never} disabled={disabled} feedback={feedback} />;
    case "drag_drop":
      return <DragDropRenderer question={question} response={response as never} onChange={onChange as never} disabled={disabled} feedback={feedback} />;
  }
}
