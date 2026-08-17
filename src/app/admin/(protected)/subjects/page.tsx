import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { YEAR_GROUPS } from "@/lib/curriculum/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminSubjectsPage() {
  await requireAdmin();

  const subjects = await db.subject.findMany({
    orderBy: { name: "asc" },
    include: { topics: { include: { _count: { select: { questions: true } } }, orderBy: [{ strandName: "asc" }, { yearGroup: "asc" }] } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Subjects</h1>
        <p className="text-muted-foreground">
          {subjects.length} subjects, sourced from <code className="rounded bg-muted px-1 py-0.5 text-xs">content/curriculum/*.json</code> —
          content is managed by editing those files and re-running the seed script, not from this page.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {subjects.map((subject) => {
          const strandSlugs = [...new Set(subject.topics.map((t) => t.strandSlug))];
          const totalQuestions = subject.topics.reduce((sum, t) => sum + t._count.questions, 0);
          const byYear = new Map<string, number>();
          for (const t of subject.topics) byYear.set(t.yearGroup, (byYear.get(t.yearGroup) ?? 0) + t._count.questions);

          return (
            <Card key={subject.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <div className="flex gap-1">
                    {YEAR_GROUPS.filter((y) => (byYear.get(y) ?? 0) > 0).map((y) => (
                      <Badge key={y} variant="outline">Y{y.replace("Y", "")}</Badge>
                    ))}
                  </div>
                </div>
                <CardDescription>
                  {strandSlugs.length} strand{strandSlugs.length === 1 ? "" : "s"} · {totalQuestions} question{totalQuestions === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">Strand</th>
                      {YEAR_GROUPS.map((y) => (
                        <th key={y} className="pb-2 pl-3 font-medium">Y{y.replace("Y", "")}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {strandSlugs.map((slug) => {
                      const strandTopics = subject.topics.filter((t) => t.strandSlug === slug);
                      const strandName = strandTopics[0]?.strandName ?? slug;
                      return (
                        <tr key={slug} className="border-b last:border-0">
                          <td className="py-1.5">{strandName}</td>
                          {YEAR_GROUPS.map((y) => {
                            const t = strandTopics.find((t) => t.yearGroup === y);
                            const count = t?._count.questions ?? null;
                            return (
                              <td key={y} className={count ? "py-1.5 pl-3" : "py-1.5 pl-3 text-muted-foreground/40"}>
                                {count ?? (t ? 0 : "–")}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
