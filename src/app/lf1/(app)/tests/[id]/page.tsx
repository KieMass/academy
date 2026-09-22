import { notFound } from "next/navigation";
import { requireLearner } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { getLf1Question, toLf1PublicQuestion, type Lf1Question } from "@/lib/lf1/bank";
import { lf1Deadline, parseLf1Answers, parseLf1QuestionIds } from "@/lib/lf1/tests";
import { PracticeRunner, type PracticeFeedback } from "@/components/lf1/practice-runner";
import { MockExamRunner } from "@/components/lf1/mock-exam-runner";
import { TestResults, type ReviewItem } from "@/components/lf1/test-results";
import { testLabel } from "@/components/lf1/test-history-table";

export default async function Lf1TestPage({ params }: PageProps<"/lf1/tests/[id]">) {
  const { id } = await params;
  const { learnerProfile } = await requireLearner();

  const session = await db.lf1TestSession.findFirst({ where: { id, learnerId: learnerProfile.id }, include: { results: true } });
  if (!session) notFound();

  const questions = parseLf1QuestionIds(session.questionIds)
    .map(getLf1Question)
    .filter((q): q is Lf1Question => q !== undefined);
  if (questions.length === 0) notFound();
  const title = testLabel(session);
  const resultsById = new Map(session.results.map((r) => [r.questionId, r]));

  if (session.completedAt) {
    const items: ReviewItem[] = questions.map((q) => {
      const r = resultsById.get(q.id);
      return { question: q, selectedIndex: r?.selectedIndex ?? null, isCorrect: r?.isCorrect ?? false, answered: !!r };
    });
    return (
      <div className="mx-auto max-w-3xl">
        <TestResults title={title} mode={session.mode} outcome={session.outcome} items={items} />
      </div>
    );
  }

  if (session.mode === "MOCK") {
    return (
      <div className="mx-auto max-w-3xl">
        <MockExamRunner
          testId={session.id}
          questions={questions.map(toLf1PublicQuestion)}
          initialAnswers={parseLf1Answers(session.answers)}
          deadline={lf1Deadline(session)!}
        />
      </div>
    );
  }

  const initialFeedback: Record<string, PracticeFeedback> = {};
  for (const q of questions) {
    const r = resultsById.get(q.id);
    if (r && r.selectedIndex !== null) {
      initialFeedback[q.id] = { correct: r.isCorrect, selectedIndex: r.selectedIndex, correctIndex: q.answer, explanation: q.explanation };
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PracticeRunner testId={session.id} title={title} questions={questions.map(toLf1PublicQuestion)} initialFeedback={initialFeedback} />
    </div>
  );
}
