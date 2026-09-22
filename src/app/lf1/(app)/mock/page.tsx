import { requireLearner } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { LF1_SYLLABUS } from "@/lib/lf1/bank";
import { LF1_READINESS_TARGET_PCT } from "@/lib/lf1/tests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StartTestButton } from "@/components/lf1/start-test-button";
import { TestHistoryTable } from "@/components/lf1/test-history-table";
import { AlertTriangle, Clock, ListChecks } from "lucide-react";

export default async function Lf1MockPage() {
  const { learnerProfile } = await requireLearner();
  const mocks = await db.lf1TestSession.findMany({ where: { learnerId: learnerProfile.id, mode: "MOCK" }, orderBy: { startedAt: "desc" } });
  const { exam } = LF1_SYLLABUS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Mock exam</h1>
        <p className="text-sm text-muted-foreground">A full-length practice paper, timed and weighted like the real LF1 exam.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
          <CardDescription>Treat it like the real thing: find a quiet hour and don&apos;t look anything up.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <ListChecks className="mt-0.5 size-4 shrink-0 text-primary" />
              {exam.questionCount} multiple choice questions. Each learning outcome has about as many questions as the syllabus says, e.g.{" "}
              {LF1_SYLLABUS.outcomes.map((o) => `${o.number}: ${o.examQuestions}`).join(", ")}.
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              {exam.durationMinutes} minutes. You can move between questions and flag them to come back to. The paper is submitted automatically when time runs out.
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              Answers are marked at the end. Unanswered questions count as wrong. {LF1_READINESS_TARGET_PCT}% is this app&apos;s readiness target, not an official CII pass mark.
            </li>
          </ul>
          <StartTestButton request={{ mode: "MOCK" }} size="lg">
            Start mock exam
          </StartTestButton>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Previous mock exams</CardTitle>
        </CardHeader>
        <CardContent>
          <TestHistoryTable rows={mocks} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Practice questions were written for this app from the published LF1 syllabus. They are not official CII questions. Check the CII study text and qualification updates for the latest law and practice.
      </p>
    </div>
  );
}
