import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { YEAR_GROUPS } from "@/lib/curriculum/types";
import { formatYearGroup } from "@/lib/curriculum/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCog, GraduationCap, BookOpen, FileQuestion, BookText, Layers } from "lucide-react";

export default async function AdminDashboardPage({ searchParams }: PageProps<"/admin/dashboard">) {
  await requireAdmin();
  const params = await searchParams;

  const curricula = await db.curriculum.findMany({ orderBy: { name: "asc" } });
  const curriculumSlug = typeof params.curriculum === "string" ? params.curriculum : curricula[0]?.slug;
  const curriculum = curricula.find((c) => c.slug === curriculumSlug) ?? curricula[0];

  const [parentCount, studentCount, adminCount, familyCount] = await Promise.all([
    db.user.count({ where: { role: "PARENT" } }),
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.family.count({ where: curriculum ? { curriculumId: curriculum.id } : undefined }),
  ]);

  // Subject is a shared/global catalogue (see prisma/schema.prisma) — Topic
  // is the curriculum-scoped piece. Every count below is filtered to the
  // selected curriculum, otherwise Cayman and Guyana question counts for
  // the same subject/year cell would silently merge together and this page
  // would never show that Guyana content exists at all.
  const topics = await db.topic.findMany({
    where: curriculum ? { curriculumId: curriculum.id } : undefined,
    include: { subject: true, _count: { select: { questions: true } } },
  });
  const subjectIds = [...new Set(topics.map((t) => t.subjectId))];
  const subjects = await db.subject.findMany({ where: { id: { in: subjectIds } }, orderBy: { name: "asc" } });

  const totalQuestions = topics.reduce((sum, t) => sum + t._count.questions, 0);
  const studentsOnCurriculum = curriculum
    ? await db.studentProfile.count({ where: { parent: { family: { curriculumId: curriculum.id } } } })
    : 0;
  const totalPassages = curriculum
    ? (
        await db.contentQuestion.findMany({
          where: { topic: { curriculumId: curriculum.id }, passageId: { not: null } },
          select: { passageId: true },
          distinct: ["passageId"],
        })
      ).length
    : 0;
  const totalAttempts = curriculum
    ? await db.questionAttempt.count({ where: { question: { topic: { curriculumId: curriculum.id } } } })
    : 0;

  // subjectName -> yearGroup -> question count (within the selected curriculum only)
  const matrix = new Map<string, Map<string, number>>();
  for (const t of topics) {
    const row = matrix.get(t.subject.name) ?? new Map<string, number>();
    row.set(t.yearGroup, (row.get(t.yearGroup) ?? 0) + t._count.questions);
    matrix.set(t.subject.name, row);
  }

  const statTiles = [
    { label: "Registered users", value: parentCount + studentCount + adminCount, icon: Users },
    { label: "Parents", value: parentCount, icon: UserCog },
    { label: "Students", value: studentCount, icon: GraduationCap },
    { label: `Families on ${curriculum?.name ?? "—"}`, value: familyCount, icon: Layers },
    { label: `Subjects (${curriculum?.name ?? "—"})`, value: subjects.length, icon: BookOpen },
    { label: `Questions (${curriculum?.name ?? "—"})`, value: totalQuestions, icon: FileQuestion },
    { label: `Reading passages (${curriculum?.name ?? "—"})`, value: totalPassages, icon: BookText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Admin dashboard</h1>
        <p className="text-muted-foreground">An overview of accounts and content across the platform.</p>
      </div>

      {curricula.length > 1 && (
        <div className="flex gap-2">
          {curricula.map((c) => (
            <Link key={c.slug} href={`/admin/dashboard?curriculum=${c.slug}`}>
              <Badge variant={c.slug === curriculum?.slug ? "default" : "outline"} className="cursor-pointer rounded-full px-3 py-1.5">
                {c.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">
        {statTiles.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex flex-col gap-1 py-5">
              <Icon className="size-5 text-primary" />
              <span className="font-heading text-2xl font-bold">{value.toLocaleString("en-GB")}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {studentsOnCurriculum === 0 && curriculum && (
        <p className="text-xs text-muted-foreground">
          No students are on the {curriculum.name} curriculum yet — content below is seeded and ready, but unexercised by a real family.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Questions by subject &amp; {(curriculum?.yearGroupLabel ?? "year").toLowerCase()} group ({curriculum?.name ?? "—"})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {subjects.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No content seeded yet for {curriculum?.name ?? "this curriculum"}.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Subject</th>
                  {YEAR_GROUPS.map((y) => (
                    <th key={y} className="pb-2 pl-4 font-medium">{formatYearGroup(y, curriculum?.yearGroupLabel)}</th>
                  ))}
                  <th className="pb-2 pl-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => {
                  const row = matrix.get(s.name) ?? new Map<string, number>();
                  const rowTotal = YEAR_GROUPS.reduce((sum, y) => sum + (row.get(y) ?? 0), 0);
                  return (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{s.name}</td>
                      {YEAR_GROUPS.map((y) => {
                        const count = row.get(y) ?? 0;
                        return (
                          <td key={y} className={count === 0 ? "py-2 pl-4 text-muted-foreground/50" : "py-2 pl-4"}>
                            {count || "—"}
                          </td>
                        );
                      })}
                      <td className="py-2 pl-4 font-semibold">{rowTotal}</td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 font-semibold">
                  <td className="py-2">Total</td>
                  {YEAR_GROUPS.map((y) => {
                    const yearTotal = subjects.reduce((sum, s) => sum + (matrix.get(s.name)?.get(y) ?? 0), 0);
                    return <td key={y} className="py-2 pl-4">{yearTotal}</td>;
                  })}
                  <td className="py-2 pl-4">{totalQuestions}</td>
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{totalAttempts.toLocaleString("en-GB")} question attempts recorded on {curriculum?.name ?? "this curriculum"}.</p>
    </div>
  );
}
