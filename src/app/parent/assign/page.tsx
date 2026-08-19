import { requireParent } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { loadCurriculumMaps } from "@/lib/curriculum/loader";
import { AssignForm } from "@/components/parent/assign-form";
import { CancelAssignmentButton } from "@/components/parent/cancel-assignment-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const CANCELLABLE_STATUSES = new Set(["ASSIGNED", "IN_PROGRESS", "OVERDUE"]);

export default async function AssignWorkPage() {
  const { parentProfile } = await requireParent();
  const students = await db.studentProfile.findMany({ where: { parent: { familyId: parentProfile.familyId } }, orderBy: { createdAt: "asc" } });
  const assignments = await db.assignment.findMany({
    where: { student: { parent: { familyId: parentProfile.familyId } } },
    include: { student: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Per-assignment attempt progress, so a parent can see whether their
  // child has actually started the work before deciding to cancel it.
  const attempts = assignments.length
    ? await db.questionAttempt.findMany({
        where: { assignmentId: { in: assignments.map((a) => a.id) } },
        select: { assignmentId: true, isCorrect: true },
      })
    : [];
  const progressByAssignment = new Map<string, { attempted: number; correct: number }>();
  for (const a of attempts) {
    if (!a.assignmentId) continue;
    const entry = progressByAssignment.get(a.assignmentId) ?? { attempted: 0, correct: 0 };
    entry.attempted++;
    if (a.isCorrect) entry.correct++;
    progressByAssignment.set(a.assignmentId, entry);
  }

  const curriculum = loadCurriculumMaps().map((m) => ({
    subjectSlug: m.subjectSlug,
    subjectName: m.subjectName,
    strands: m.strands.map((s) => ({
      slug: s.slug,
      name: s.name,
      yearGroups: s.years.map((y) => y.yearGroup),
    })),
  }));

  if (students.length === 0) {
    return <p className="text-muted-foreground">Add a student in Settings before assigning work.</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-bold">Assign Work</h1>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <AssignForm
          students={students.map((s) => ({ id: s.id, displayName: s.displayName, yearGroup: s.yearGroup }))}
          curriculum={curriculum}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.length === 0 && <p className="text-sm text-muted-foreground">No assignments yet.</p>}
            {assignments.map((a) => {
              const progress = progressByAssignment.get(a.id);
              return (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      For {a.student.displayName} · {formatDistanceToNow(a.createdAt, { addSuffix: true })}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {progress
                        ? `${progress.attempted} question${progress.attempted === 1 ? "" : "s"} attempted · ${Math.round((progress.correct / progress.attempted) * 100)}% correct so far`
                        : "Not started yet"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="capitalize">{a.status.toLowerCase().replace("_", " ")}</Badge>
                    {CANCELLABLE_STATUSES.has(a.status) && (
                      <CancelAssignmentButton assignmentId={a.id} title={a.title} studentName={a.student.displayName} />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
