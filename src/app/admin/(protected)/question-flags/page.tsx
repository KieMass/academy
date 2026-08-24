import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { fromContentQuestion } from "@/lib/question-engine/mapper";
import { revealAnswer } from "@/lib/question-engine/reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionFlagAdminActions } from "@/components/admin/question-flag-admin-actions";

const STATUS_LABEL: Record<string, string> = {
  PENDING_PARENT_REVIEW: "With parent",
  PENDING_ADMIN_REVIEW: "Needs your review",
  DISMISSED_BY_PARENT: "Parent dismissed",
  DISMISSED_BY_ADMIN: "Kept",
  REMOVED: "Removed",
};

export default async function AdminQuestionFlagsPage() {
  await requireAdmin();

  const flags = await db.questionFlag.findMany({
    where: { status: { not: "PENDING_PARENT_REVIEW" } }, // not admin's turn yet
    include: {
      student: { include: { parent: true } },
      question: { include: { topic: { include: { subject: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 150,
  });

  const pendingCount = flags.filter((f) => f.status === "PENDING_ADMIN_REVIEW").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Flagged questions</h1>
        <p className="text-muted-foreground">
          {pendingCount} question{pendingCount === 1 ? "" : "s"} escalated by a parent, waiting on a removal decision.
        </p>
      </div>

      {flags.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No questions have been escalated by a parent yet.</CardContent>
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
                    {flag.question.topic.subject.name} — {flag.question.topic.strandName} (Year {flag.question.topic.yearGroup.replace("Y", "")})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Reported by {flag.student.displayName}, reviewed by {flag.student.parent.fullName} · {(flag.parentReviewedAt ?? flag.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Badge variant={flag.status === "PENDING_ADMIN_REVIEW" ? "default" : "outline"}>{STATUS_LABEL[flag.status]}</Badge>
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

                <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
                  <p><span className="font-semibold">Student&apos;s reason:</span> {flag.reason}</p>
                  {flag.note && <p><span className="font-semibold">Student&apos;s note:</span> {flag.note}</p>}
                  {flag.parentNotes && <p><span className="font-semibold">Parent&apos;s note:</span> {flag.parentNotes}</p>}
                </div>

                {flag.status === "PENDING_ADMIN_REVIEW" && <QuestionFlagAdminActions flagId={flag.id} />}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
