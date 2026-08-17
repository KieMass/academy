import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { YEAR_GROUPS } from "@/lib/curriculum/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, GraduationCap, BookOpen, FileQuestion, BookText } from "lucide-react";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    parentCount,
    studentCount,
    adminCount,
    subjects,
    topics,
    totalQuestions,
    totalPassages,
    totalAttempts,
  ] = await Promise.all([
    db.user.count({ where: { role: "PARENT" } }),
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.subject.findMany({ orderBy: { name: "asc" } }),
    db.topic.findMany({ include: { subject: true, _count: { select: { questions: true } } } }),
    db.contentQuestion.count(),
    db.readingPassage.count(),
    db.questionAttempt.count(),
  ]);

  // subjectName -> yearGroup -> question count
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
    { label: "Subjects", value: subjects.length, icon: BookOpen },
    { label: "Total questions", value: totalQuestions, icon: FileQuestion },
    { label: "Reading passages", value: totalPassages, icon: BookText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Admin dashboard</h1>
        <p className="text-muted-foreground">An overview of accounts and content across the platform.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Questions by subject &amp; year group</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Subject</th>
                {YEAR_GROUPS.map((y) => (
                  <th key={y} className="pb-2 pl-4 font-medium">Year {y.replace("Y", "")}</th>
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
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{totalAttempts.toLocaleString("en-GB")} question attempts recorded across all students.</p>
    </div>
  );
}
