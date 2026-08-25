import { requireParent } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { loadCurriculumMaps } from "@/lib/curriculum/loader";
import { PrintForm } from "@/components/parent/print-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function PrintResourcesPage() {
  const { parentProfile, curriculumSlug, yearGroupLabel } = await requireParent();
  const students = await db.studentProfile.findMany({ where: { parent: { familyId: parentProfile.familyId } }, orderBy: { createdAt: "asc" } });
  const curriculum = loadCurriculumMaps(curriculumSlug).map((m) => ({
    subjectSlug: m.subjectSlug,
    subjectName: m.subjectName,
    strands: m.strands.map((s) => ({ slug: s.slug, name: s.name, yearGroups: s.years.map((y) => y.yearGroup) })),
  }));

  if (students.length === 0) {
    return <p className="text-muted-foreground">Add a student in Settings before generating worksheets.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Print Resources</h1>
        <p className="text-muted-foreground">Generate offline practice — great for screen-free time or extra revision.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <PrintForm students={students.map((s) => ({ id: s.id, displayName: s.displayName, yearGroup: s.yearGroup }))} curriculum={curriculum} yearGroupLabel={yearGroupLabel} />
        <Card>
          <CardContent className="space-y-3 py-6 text-sm text-muted-foreground">
            <p><strong className="text-foreground">10 / 20-Question Worksheet</strong> — targeted practice on a single topic, mixed difficulty.</p>
            <p><strong className="text-foreground">Assessment Paper</strong> — a broader 20-question paper spanning every topic in a subject, PUMA/GAPS/PIRA style.</p>
            <p><strong className="text-foreground">Targeted Intervention Paper</strong> — automatically pulls from the student&apos;s current weak areas.</p>
            <p>Every worksheet includes a name/date header and a separate answer sheet on the final page.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
