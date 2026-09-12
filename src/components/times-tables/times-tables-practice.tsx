"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  TABLES,
  ROUND_LENGTHS,
  ROUND_LENGTH_LABEL,
  summarizeAnswers,
  randomFact,
  type RoundSeconds,
  type TimesTableAnswer,
  type RoundSummary,
} from "@/lib/times-tables/types";
import { Zap, CheckCircle2, XCircle, Trophy, RotateCcw, Clock3 } from "lucide-react";

type Phase = "setup" | "round" | "results";

interface RecentSession {
  id: string;
  tables: number[];
  roundSeconds: number;
  endedEarly: boolean;
  questionsAnswered: number;
  correctCount: number;
  avgCorrectSpeedMs: number | null;
  createdAt: string;
}

function formatClock(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatSpeed(ms: number | null) {
  return ms == null ? "—" : `${(ms / 1000).toFixed(1)}s`;
}

export function TimesTablesPractice() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [roundSeconds, setRoundSeconds] = useState<RoundSeconds>(60);

  const [fact, setFact] = useState<{ table: number; multiplier: number } | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [answers, setAnswers] = useState<TimesTableAnswer[]>([]);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [summary, setSummary] = useState<RoundSummary | null>(null);

  // Mirrors `answers` for the countdown's interval callback and
  // finishRound() to read synchronously — those don't re-render on every
  // keystroke, so a `useState` value they closed over could be stale.
  const answersRef = useRef<TimesTableAnswer[]>([]);
  const endAtRef = useRef(0);
  const questionShownAtRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const finishedRef = useRef(false);

  const { data: history, refetch: refetchHistory } = useQuery({
    queryKey: ["times-tables-history"],
    queryFn: async () => {
      const res = await fetch("/api/times-tables/sessions?limit=5");
      if (!res.ok) throw new Error("Failed to load history");
      return (await res.json()) as { sessions: RecentSession[] };
    },
  });

  function toggleTable(n: number) {
    setSelectedTables((prev) => (prev.includes(n) ? prev.filter((t) => t !== n) : [...prev, n].sort((a, b) => a - b)));
  }

  function startRound() {
    if (selectedTables.length === 0) return;
    answersRef.current = [];
    finishedRef.current = false;
    setAnswers([]);
    setSummary(null);
    setLastFeedback(null);
    setAnswerText("");
    endAtRef.current = Date.now() + roundSeconds * 1000;
    setTimeLeftMs(roundSeconds * 1000);
    const first = randomFact(selectedTables);
    setFact(first);
    questionShownAtRef.current = Date.now();
    setPhase("round");
  }

  async function finishRound(endedEarly: boolean) {
    if (finishedRef.current) return; // guards against both the timer and "Finish now" firing
    finishedRef.current = true;
    setPhase("results");
    const finalAnswers = answersRef.current;
    setSummary(summarizeAnswers(finalAnswers));
    try {
      const res = await fetch("/api/times-tables/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables: selectedTables, roundSeconds, endedEarly, answers: finalAnswers }),
      });
      if (!res.ok) throw new Error("Failed to save");
      refetchHistory();
    } catch {
      toast.error("This round's result couldn't be saved — check your connection. The score above is still accurate.");
    }
  }

  // Countdown tick + auto-finish once time runs out.
  useEffect(() => {
    if (phase !== "round") return;
    const id = setInterval(() => {
      const remaining = endAtRef.current - Date.now();
      setTimeLeftMs(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(id);
        void finishRound(false);
      }
    }, 100);
    return () => clearInterval(id);
    // finishRound closes over state that doesn't change identity per tick;
    // re-running this effect on every render would restart the interval.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Keep the input focused between questions so a keyboard-using student
  // never has to click back into the field mid-round.
  useEffect(() => {
    if (phase === "round") inputRef.current?.focus();
  }, [phase, fact]);

  function handleSubmitAnswer(e: FormEvent) {
    e.preventDefault();
    if (!fact || answerText.trim() === "") return;
    const given = Number(answerText);
    const correct = given === fact.table * fact.multiplier;
    const speedMs = Date.now() - questionShownAtRef.current;
    answersRef.current = [...answersRef.current, { table: fact.table, multiplier: fact.multiplier, correct, speedMs }];
    setAnswers(answersRef.current);
    setLastFeedback(correct ? "correct" : "incorrect");
    setAnswerText("");
    const next = randomFact(selectedTables, fact);
    setFact(next);
    questionShownAtRef.current = Date.now();
  }

  function practiceAgain() {
    setPhase("setup");
  }

  if (phase === "round" && fact) {
    const correctSoFar = answers.filter((a) => a.correct).length;
    const pctRemaining = (timeLeftMs / (roundSeconds * 1000)) * 100;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold tabular-nums">
            <Clock3 className="size-5 text-primary" />
            {formatClock(timeLeftMs)}
          </div>
          <div className="text-sm text-muted-foreground">
            {correctSoFar}/{answers.length} correct
          </div>
        </div>
        <Progress value={pctRemaining} className="h-2" />

        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <p className="font-heading text-5xl font-bold tabular-nums">
              {fact.table} × {fact.multiplier}
            </p>
            <form onSubmit={handleSubmitAnswer} className="flex w-full max-w-xs items-center gap-2">
              <Input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="-?[0-9]*"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value.replace(/[^0-9-]/g, ""))}
                className="h-12 text-center text-2xl font-semibold"
                autoFocus
              />
              <Button type="submit" size="lg" disabled={answerText.trim() === ""}>Check</Button>
            </form>
            {lastFeedback && (
              <div className={cn("flex items-center gap-1.5 text-sm font-medium", lastFeedback === "correct" ? "text-emerald-600" : "text-amber-600")}>
                {lastFeedback === "correct" ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                {lastFeedback === "correct" ? "Correct!" : "Not quite — next one's up."}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => void finishRound(true)}>Finish now</Button>
        </div>
      </div>
    );
  }

  if (phase === "results" && summary) {
    const accuracyPct = summary.questionsAnswered > 0 ? Math.round((summary.correctCount / summary.questionsAnswered) * 100) : 0;
    const tableRows = Object.entries(summary.tableStats)
      .map(([table, stat]) => ({ table: Number(table), ...stat }))
      .sort((a, b) => a.table - b.table);

    return (
      <div className="space-y-6">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="space-y-4 py-8 text-center">
            <Trophy className="mx-auto size-10 text-accent" />
            <h2 className="font-heading text-2xl font-bold">Round complete!</h2>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
              <div>
                <p className="font-heading text-3xl font-bold">{summary.correctCount}/{summary.questionsAnswered}</p>
                <p className="text-xs text-muted-foreground">Correct ({accuracyPct}%)</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold">{formatSpeed(summary.avgCorrectSpeedMs)}</p>
                <p className="text-xs text-muted-foreground">Avg. speed per answer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {tableRows.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Table breakdown</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Table</th>
                    <th className="pb-2 pl-4 font-medium">Answered</th>
                    <th className="pb-2 pl-4 font-medium">Correct</th>
                    <th className="pb-2 pl-4 font-medium">Avg. speed</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.table} className="border-b last:border-0">
                      <td className="py-2 font-medium">×{row.table}</td>
                      <td className="py-2 pl-4">{row.answered}</td>
                      <td className="py-2 pl-4">{row.correct}</td>
                      <td className="py-2 pl-4">{formatSpeed(row.avgCorrectSpeedMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-3">
          <Button className="gap-2" onClick={practiceAgain}><RotateCcw className="size-4" /> Practice again</Button>
        </div>
      </div>
    );
  }

  // --- Setup ---
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Zap className="size-5 text-accent" /> Set up your round</CardTitle>
          <CardDescription>Pick the tables to be tested on and how long the round should run.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">Tables</p>
              <div className="flex gap-2 text-xs">
                <button type="button" className="text-primary hover:underline" onClick={() => setSelectedTables([...TABLES])}>Select all</button>
                <button type="button" className="text-muted-foreground hover:underline" onClick={() => setSelectedTables([])}>Clear</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {TABLES.map((n) => {
                const selected = selectedTables.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleTable(n)}
                    aria-pressed={selected}
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Round length</p>
            <div className="flex flex-wrap gap-2">
              {ROUND_LENGTHS.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => setRoundSeconds(seconds)}
                  aria-pressed={roundSeconds === seconds}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    roundSeconds === seconds
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {ROUND_LENGTH_LABEL[seconds]}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={startRound} disabled={selectedTables.length === 0} className="w-full gap-2">
            <Zap className="size-4" /> Start round
          </Button>
        </CardContent>
      </Card>

      {history && history.sessions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent rounds</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {history.sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">×{s.tables.join(", ×")}</p>
                  <p className="text-xs text-muted-foreground">
                    {ROUND_LENGTH_LABEL[s.roundSeconds as RoundSeconds] ?? `${s.roundSeconds}s`} · {new Date(s.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{s.correctCount}/{s.questionsAnswered}</p>
                  <p className="text-xs text-muted-foreground">{formatSpeed(s.avgCorrectSpeedMs)} avg</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
