import Link from "next/link";
import { requireLearner } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { LF1_SYLLABUS } from "@/lib/lf1/bank";
import { getLf1OutcomeProgress } from "@/lib/lf1/progress";
import { LF1_READINESS_TARGET_PCT, pct } from "@/lib/lf1/tests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutcomeProgressList } from "@/components/lf1/outcome-progress-list";
import { StartTestButton } from "@/components/lf1/start-test-button";
import { TestHistoryTable } from "@/components/lf1/test-history-table";

export default async function Lf1DashboardPage() {
  const { learnerProfile } = await requireLearner();

  const [progress, recent, mocks] = await Promise.all([
    getLf1OutcomeProgress(learnerProfile.id),
    db.lf1TestSession.findMany({ where: { learnerId: learnerProfile.id }, orderBy: { startedAt: "desc" }, take: 5 }),
    db.lf1TestSession.findMany({
      where: { learnerId: learnerProfile.id, mode: "MOCK", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      select: { correctCount: true, totalQuestions: true },
    }),
  ]);

  const totalAnswered = progress.reduce((s, p) => s + p.answered, 0);
  const totalCorrect = progress.reduce((s, p) => s + p.correct, 0);
  const mockScores = mocks.map((m) => pct(m.correctCount ?? 0, m.totalQuestions));
  const weakest = progress.filter((p) => p.answered > 0).sort((a, b) => a.accuracyPct - b.accuracyPct)[0];

  const stats = [
    { label: "Questions answered", value: totalAnswered.toString() },
    { label: "Overall accuracy", value: totalAnswered ? `${pct(totalCorrect, totalAnswered)}%` : "—" },
    { label: "Mock exams taken", value: mocks.length.toString() },
    { label: "Latest / best mock", value: mockScores.length ? `${mockScores[0]}% / ${Math.max(...mockScores)}%` : "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Your LF1 progress</h1>
        <p className="text-sm text-muted-foreground">
          CII {LF1_SYLLABUS.code} · {LF1_SYLLABUS.title} · examined {formatDate(LF1_SYLLABUS.examinedFrom)} to {formatDate(LF1_SYLLABUS.examinedTo)} (tax year {LF1_SYLLABUS.taxYear})
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-heading text-2xl font-bold tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick practice</CardTitle>
            <CardDescription>
              {weakest
                ? `Your weakest area so far is outcome ${weakest.outcome} (${weakest.accuracyPct}%).`
                : "Answer a few questions from across the syllabus to find your weak spots."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {weakest && (
              <StartTestButton request={{ mode: "PRACTICE", outcome: weakest.outcome, count: 10 }}>Practise outcome {weakest.outcome}</StartTestButton>
            )}
            <StartTestButton request={{ mode: "PRACTICE", outcome: null, count: 20 }} variant={weakest ? "outline" : "default"}>
              20 mixed questions
            </StartTestButton>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mock exam</CardTitle>
            <CardDescription>
              {LF1_SYLLABUS.exam.questionCount} questions in {LF1_SYLLABUS.exam.durationMinutes} minutes, weighted like the real exam. Aim for {LF1_READINESS_TARGET_PCT}%+.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StartTestButton request={{ mode: "MOCK" }}>Start a mock exam</StartTestButton>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By learning outcome</CardTitle>
          <CardDescription>Accuracy across all your practice and mock answers. Green is at or above {LF1_READINESS_TARGET_PCT}%.</CardDescription>
        </CardHeader>
        <CardContent>
          <OutcomeProgressList progress={progress} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent tests</CardTitle>
          <Link href="/lf1/history" className="text-sm text-primary underline-offset-2 hover:underline">
            See all
          </Link>
        </CardHeader>
        <CardContent>
          <TestHistoryTable rows={recent} />
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
