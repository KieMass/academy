import Link from "next/link";
import { requireParent } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { resolveTopics } from "@/lib/curriculum/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SubjectAccuracyChart } from "@/components/parent/subject-accuracy-chart";
import { subDays } from "date-fns";

const PERIODS = [
  { key: "week", label: "This Week", days: 7 },
  { key: "month", label: "This Month", days: 30 },
  { key: "term", label: "This Term", days: 90 },
] as const;

export default async function ParentProgressPage({ searchParams }: PageProps<"/parent/progress">) {
  const { parentProfile } = await requireParent();
  const params = await searchParams;
  const students = await db.studentProfile.findMany({ where: { parentId: parentProfile.id }, orderBy: { createdAt: "asc" } });
  if (students.length === 0) {
    return <p className="text-muted-foreground">Add a student in Settings to see progress reports.</p>;
  }

  const studentId = typeof params.student === "string" ? params.student : students[0].id;
  const student = students.find((s) => s.id === studentId) ?? students[0];
  const periodKey = (typeof params.period === "string" ? params.period : "month") as (typeof PERIODS)[number]["key"];
  const period = PERIODS.find((p) => p.key === periodKey) ?? PERIODS[1];
  const since = subDays(new Date(), period.days);

  const [attempts, masteries] = await Promise.all([
    db.questionAttempt.findMany({
      where: { studentId: student.id, attemptedAt: { gte: since } },
      include: { question: { include: { topic: { include: { subject: true } } } } },
    }),
    db.topicMastery.findMany({ where: { studentId: student.id }, include: { topic: { include: { subject: true } } } }),
  ]);

  const bySubject = new Map<string, { name: string; attempted: number; correct: number }>();
  for (const a of attempts) {
    const key = a.question.topic.subject.slug;
    const entry = bySubject.get(key) ?? { name: a.question.topic.subject.name, attempted: 0, correct: 0 };
    entry.attempted++;
    if (a.isCorrect) entry.correct++;
    bySubject.set(key, entry);
  }
  const chartData = [...bySubject.values()].map((v) => ({ subject: v.name, accuracy: v.attempted > 0 ? Math.round((v.correct / v.attempted) * 100) : 0 }));

  const allTopics = resolveTopics({ yearGroup: student.yearGroup });
  const masteryByStrand = new Map(masteries.map((m) => [`${m.topic.subject.slug}:${m.topic.strandSlug}`, m]));
  const attainmentRows = allTopics
    .map((t) => {
      const m = masteryByStrand.get(`${t.subjectSlug}:${t.strandSlug}`);
      const accuracy = m && m.questionsAttempted > 0 ? Math.round((m.questionsCorrect / m.questionsAttempted) * 100) : null;
      return { ...t, accuracy, masteryLevel: m?.masteryLevel ?? "NOT_STARTED", attempted: m?.questionsAttempted ?? 0 };
    })
    .filter((r) => r.attempted > 0)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));

  const strengths = attainmentRows.filter((r) => (r.accuracy ?? 0) >= 80).slice(0, 5);
  const weaknesses = attainmentRows.filter((r) => (r.accuracy ?? 0) < 70).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">Progress &amp; Reports</h1>
        <div className="flex items-center gap-2">
          {students.length > 1 && (
            <div className="flex gap-1">
              {students.map((s) => (
                <Link key={s.id} href={`/parent/progress?student=${s.id}&period=${period.key}`}>
                  <Badge variant={s.id === student.id ? "default" : "outline"} className="cursor-pointer rounded-full px-3 py-1.5">
                    {s.avatarEmoji} {s.displayName}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <Link key={p.key} href={`/parent/progress?student=${student.id}&period=${p.key}`}>
            <Badge variant={p.key === period.key ? "default" : "outline"} className="cursor-pointer rounded-full px-3 py-1.5">
              {p.label}
            </Badge>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accuracy by subject ({period.label.toLowerCase()})</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? <SubjectAccuracyChart data={chartData} /> : <p className="text-sm text-muted-foreground">No activity recorded in this period yet.</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-emerald-600 dark:text-emerald-400">Strengths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {strengths.length === 0 && <p className="text-sm text-muted-foreground">Not enough data yet.</p>}
            {strengths.map((r) => (
              <div key={`${r.subjectSlug}:${r.strandSlug}`} className="flex justify-between text-sm">
                <span>{r.subjectName} · {r.strandName}</span>
                <span className="font-semibold">{r.accuracy}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-600 dark:text-amber-400">Needs support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weaknesses.length === 0 && <p className="text-sm text-muted-foreground">No weak areas identified yet — nice work!</p>}
            {weaknesses.map((r) => (
              <div key={`${r.subjectSlug}:${r.strandSlug}`} className="flex justify-between text-sm">
                <span>{r.subjectName} · {r.strandName}</span>
                <span className="font-semibold">{r.accuracy}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attainment by topic</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Topic</th>
                <th className="pb-2 font-medium">Subject</th>
                <th className="pb-2 font-medium">Accuracy</th>
                <th className="pb-2 font-medium">Mastery</th>
              </tr>
            </thead>
            <tbody>
              {attainmentRows.map((r) => (
                <tr key={`${r.subjectSlug}:${r.strandSlug}`} className="border-b last:border-0">
                  <td className="py-2">{r.strandName}</td>
                  <td className="py-2 text-muted-foreground">{r.subjectName}</td>
                  <td className={cn("py-2 font-medium", (r.accuracy ?? 0) < 70 && "text-amber-600 dark:text-amber-400")}>{r.accuracy}%</td>
                  <td className="py-2">
                    <Badge variant="outline" className="capitalize">{r.masteryLevel.toLowerCase().replace("_", " ")}</Badge>
                  </td>
                </tr>
              ))}
              {attainmentRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">No practice recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
