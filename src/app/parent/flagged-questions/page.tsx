import { requireParent } from "@/lib/auth/guards";
import { formatYearGroup } from "@/lib/curriculum/label";
import { db } from "@/lib/db";
import { fromContentQuestion } from "@/lib/question-engine/mapper";
import { revealAnswer } from "@/lib/question-engine/reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionFlagActions } from "@/components/parent/question-flag-actions";

const STATUS_LABEL: Record<string, string> = {
  PENDING_PARENT_REVIEW: "Awaiting your review",
  PENDING_ADMIN_REVIEW: "Sent to admin",
  DISMISSED_BY_PARENT: "Dismissed",
  DISMISSED_BY_ADMIN: "Kept (admin reviewed)",
  REMOVED: "Removed from question bank",
};

export default async function ParentFlaggedQuestionsPage() {
  const { parentProfile, yearGroupLabel } = await requireParent();

  const flags = await db.questionFlag.findMany({
    where: { student: { parent: { familyId: parentProfile.familyId } } },
    include: {
      student: true,
      question: { include: { topic: { include: { subject: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const pending = flags.filter((f) => f.status === "PENDING_PARENT_REVIEW");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Flagged questions</h1>
        <p className="text-muted-foreground">
          {pending.length === 0
            ? "Nothing waiting on you right now."
            : `${pending.length} question${pending.length === 1 ? "" : "s"} your ${pending.length === 1 ? "child has" : "children have"} reported, waiting for your review.`}
        </p>
      </div>

      {flags.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No questions have been reported yet.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {flags.map((flag) => {
          const question = fromContentQuestion(flag.question);
          const options = question.type === "multiple_choice" ? question.options : null;
          const correctAnswer = revealAnswer(question);

          return (
            <Card key={flag.id}>
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">
                    {flag.question.topic.subject.name} — {flag.question.topic.strandName} ({formatYearGroup(flag.question.topic.yearGroup, yearGroupLabel)})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Reported by {flag.student.displayName} · {flag.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Badge variant={flag.status === "PENDING_PARENT_REVIEW" ? "default" : "outline"}>{STATUS_LABEL[flag.status]}</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="font-medium">{question.promptText}</p>
                {options && (
                  <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                    {options.map((o) => (
                      <li key={o.id} className={o.text === correctAnswer ? "font-semibold text-foreground" : undefined}>
                        {o.text} {o.text === correctAnswer && "(correct)"}
                      </li>
                    ))}
                  </ul>
                )}
                {!options && (
                  <p className="text-muted-foreground">
                    Correct answer: <span className="font-semibold text-foreground">{correctAnswer}</span>
                  </p>
                )}
                {question.explanation && <p className="text-muted-foreground italic">{question.explanation}</p>}

                <div className="rounded-lg border bg-muted/40 p-3">
                  <p><span className="font-semibold">Reason:</span> {flag.reason}</p>
                  {flag.note && <p className="mt-1"><span className="font-semibold">Note:</span> {flag.note}</p>}
                </div>

                {flag.status === "PENDING_PARENT_REVIEW" && <QuestionFlagActions flagId={flag.id} />}
                {flag.parentNotes && flag.status !== "PENDING_PARENT_REVIEW" && (
                  <p className="text-xs text-muted-foreground">Your note to admin: {flag.parentNotes}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
