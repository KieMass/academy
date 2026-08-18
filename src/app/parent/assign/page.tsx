import { requireParent } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { loadCurriculumMaps } from "@/lib/curriculum/loader";
import { AssignForm } from "@/components/parent/assign-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default async function AssignWorkPage() {
  const { parentProfile } = await requireParent();
  const students = await db.studentProfile.findMany({ where: { parent: { familyId: parentProfile.familyId } }, orderBy: { createdAt: "asc" } });
  const assignments = await db.assignment.findMany({
    where: { student: { parent: { familyId: parentProfile.familyId } } },
    include: { student: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
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
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    For {a.student.displayName} · {formatDistanceToNow(a.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">{a.status.toLowerCase().replace("_", " ")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
