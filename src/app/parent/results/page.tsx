import Link from "next/link";
import { requireParent } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { fromContentQuestion } from "@/lib/question-engine/mapper";
import { revealAnswer, formatResponse } from "@/lib/question-engine/reveal";
import type { QuestionResponse } from "@/lib/question-engine/types";
import { getRetentionSetting, describeRetentionSetting } from "@/lib/retention";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { CheckCircle2, XCircle, Clock, ChevronDown } from "lucide-react";
import { format } from "date-fns";

const COUNTS = [5, 10, 20] as const;

export default async function ParentResultsPage({ searchParams }: PageProps<"/parent/results">) {
  const { parentProfile } = await requireParent();
  const params = await searchParams;
  const students = await db.studentProfile.findMany({ where: { parent: { familyId: parentProfile.familyId } }, orderBy: { createdAt: "asc" } });
  if (students.length === 0) {
    return <p className="text-muted-foreground">Add a student in Settings to see assignment results.</p>;
  }

  const studentId = typeof params.student === "string" ? params.student : students[0].id;
  const student = students.find((s) => s.id === studentId) ?? students[0];
  const requestedCount = Number(typeof params.count === "string" ? params.count : "5");
  const count = COUNTS.includes(requestedCount as (typeof COUNTS)[number]) ? requestedCount : 5;

  const [assignments, retentionSetting] = await Promise.all([
    db.assignment.findMany({
      where: { studentId: student.id, attempts: { some: {} } },
      orderBy: { createdAt: "desc" },
      take: count,
      include: {
        attempts: {
          orderBy: { attemptedAt: "asc" },
          include: { question: { include: { topic: { include: { subject: true } } } } },
        },
      },
    }),
    getRetentionSetting(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">Assignment Results</h1>
        {students.length > 1 && (
          <div className="flex gap-1">
            {students.map((s) => (
              <Link key={s.id} href={`/parent/results?student=${s.id}&count=${count}`}>
                <Badge variant={s.id === student.id ? "default" : "outline"} className="cursor-pointer rounded-full px-3 py-1.5">
                  {s.avatarEmoji} {s.displayName}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show last</span>
          {COUNTS.map((c) => (
            <Link key={c} href={`/parent/results?student=${student.id}&count=${c}`}>
              <Badge variant={c === count ? "default" : "outline"} className="cursor-pointer rounded-full px-3 py-1.5">
                {c}
              </Badge>
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{describeRetentionSetting(retentionSetting)}</p>
      </div>

      {assignments.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {student.displayName} hasn&apos;t started any assigned work yet — results will appear here once they do.
        </p>
      )}

      <div className="space-y-4">
        {assignments.map((assignment) => {
          const total = assignment.attempts.length;
          const correct = assignment.attempts.filter((a) => a.isCorrect).length;
          const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;
          return (
            <Card key={assignment.id} className="overflow-hidden py-0">
              <Collapsible>
                <CollapsibleTrigger
                  className="group cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  render={<div role="button" tabIndex={0} />}
                >
                  <CardHeader className="py-4 hover:bg-muted/40">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-180" />
                        <div>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Assigned {format(assignment.createdAt, "d MMM yyyy")}
                            {assignment.dueDate && ` · Due ${format(assignment.dueDate, "d MMM yyyy")}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{assignment.status.toLowerCase().replace("_", " ")}</Badge>
                        <Badge variant={scorePct >= 75 ? "default" : "outline"}>
                          {correct}/{total} correct · {scorePct}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="divide-y border-t">
                    {assignment.attempts.map((attempt) => {
                      const question = fromContentQuestion(attempt.question);
                      const response = JSON.parse(attempt.response) as QuestionResponse;
                      const theirAnswer = formatResponse(question, response);
                      return (
                        <div key={attempt.id} className="flex items-start gap-3 py-3 text-sm">
                          {attempt.isCorrect ? (
                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                          ) : (
                            <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                          )}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="font-medium">{question.promptText}</p>
                            <p className="text-xs text-muted-foreground">
                              {attempt.question.topic.subject.name} · {attempt.question.topic.strandName}
                            </p>
                            <p className="text-xs">
                              <span className="text-muted-foreground">Their answer: </span>
                              <span className={attempt.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>{theirAnswer}</span>
                            </p>
                            {!attempt.isCorrect && (
                              <p className="text-xs">
                                <span className="text-muted-foreground">Correct answer: </span>
                                <span className="text-emerald-600 dark:text-emerald-400">{revealAnswer(question)}</span>
                              </p>
                            )}
                          </div>
                          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {attempt.timeSpentSeconds}s
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
