import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { YEAR_GROUPS } from "@/lib/curriculum/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/** Compact table-header form of a year group — "Y5" for Cayman, "G5" for
 *  Guyana (Grade) — vs. the full formatYearGroup() used in body text. */
function yearGroupAbbrev(yearGroup: string, yearGroupLabel: string = "Year") {
  return `${yearGroupLabel[0]}${yearGroup.replace("Y", "")}`;
}

export default async function AdminSubjectsPage({ searchParams }: PageProps<"/admin/subjects">) {
  await requireAdmin();
  const params = await searchParams;

  const curricula = await db.curriculum.findMany({ orderBy: { name: "asc" } });
  const curriculumSlug = typeof params.curriculum === "string" ? params.curriculum : curricula[0]?.slug;
  const curriculum = curricula.find((c) => c.slug === curriculumSlug) ?? curricula[0];

  // Subject is shared across curricula (see prisma/schema.prisma) — Topic is
  // the curriculum-scoped piece, so every count here is filtered to the
  // selected curriculum. Without this, Cayman and Guyana question counts for
  // the same subject/strand/year cell would silently merge together.
  const subjects = await db.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      topics: {
        where: curriculum ? { curriculumId: curriculum.id } : undefined,
        include: { _count: { select: { questions: true } } },
        orderBy: [{ strandName: "asc" }, { yearGroup: "asc" }],
      },
    },
  });
  const visibleSubjects = subjects.filter((s) => s.topics.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Subjects</h1>
        <p className="text-muted-foreground">
          {visibleSubjects.length} subjects, sourced from <code className="rounded bg-muted px-1 py-0.5 text-xs">content/curriculum/&lt;curriculum&gt;/*.json</code> —
          content is managed by editing those files and re-running the seed script, not from this page.
        </p>
      </div>

      {curricula.length > 1 && (
        <div className="flex gap-2">
          {curricula.map((c) => (
            <Link key={c.slug} href={`/admin/subjects?curriculum=${c.slug}`}>
              <Badge variant={c.slug === curriculum?.slug ? "default" : "outline"} className="cursor-pointer rounded-full px-3 py-1.5">
                {c.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {visibleSubjects.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No content seeded yet for {curriculum?.name ?? "this curriculum"}.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {visibleSubjects.map((subject) => {
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
                      <Badge key={y} variant="outline">{yearGroupAbbrev(y, curriculum?.yearGroupLabel)}</Badge>
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
                        <th key={y} className="pb-2 pl-3 font-medium">{yearGroupAbbrev(y, curriculum?.yearGroupLabel)}</th>
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
