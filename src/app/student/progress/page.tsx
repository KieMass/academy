import { requireStudent } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { listSubjects, resolveTopics } from "@/lib/curriculum/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function StudentProgressPage() {
  const { studentProfile, curriculumSlug } = await requireStudent();

  const [attempts, masteries, recent] = await Promise.all([
    db.questionAttempt.findMany({ where: { studentId: studentProfile.id }, select: { isCorrect: true, timeSpentSeconds: true } }),
    db.topicMastery.findMany({ where: { studentId: studentProfile.id }, include: { topic: { include: { subject: true } } } }),
    db.questionAttempt.findMany({
      where: { studentId: studentProfile.id },
      orderBy: { attemptedAt: "desc" },
      take: 8,
      include: { question: { include: { topic: { include: { subject: true } } } } },
    }),
  ]);

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const totalMinutes = Math.round(attempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0) / 60);

  const subjects = listSubjects(curriculumSlug);
  const topicCountBySubject = new Map<string, number>();
  for (const t of resolveTopics(curriculumSlug, { yearGroup: studentProfile.yearGroup })) {
    topicCountBySubject.set(t.subjectSlug, (topicCountBySubject.get(t.subjectSlug) ?? 0) + 1);
  }
  const secureCountBySubject = new Map<string, number>();
  for (const m of masteries) {
    if (m.masteryLevel === "SECURE" || m.masteryLevel === "MASTERED") {
      const slug = m.topic.subject.slug;
      secureCountBySubject.set(slug, (secureCountBySubject.get(slug) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-bold">My Progress</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Target} label="Accuracy" value={`${accuracy}%`} />
        <StatTile icon={CheckCircle2} label="Questions answered" value={String(totalAttempts)} />
        <StatTile icon={Clock} label="Time practising" value={`${totalMinutes} min`} />
        <StatTile icon={XCircle} label="Current streak" value={`${studentProfile.streakDays} days`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mastery by subject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjects.map((s) => {
            const total = topicCountBySubject.get(s.subjectSlug) ?? 0;
            const secure = secureCountBySubject.get(s.subjectSlug) ?? 0;
            const pct = total > 0 ? Math.round((secure / total) * 100) : 0;
            return (
              <div key={s.subjectSlug} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{s.subjectName}</span>
                  <span className="text-muted-foreground">
                    {secure}/{total} topics secure
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {recent.length === 0 && <p className="py-4 text-sm text-muted-foreground">No activity yet — head to a subject to get started!</p>}
          {recent.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">
                  {a.question.topic.subject.name} · {a.question.topic.strandName}
                </p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(a.attemptedAt, { addSuffix: true })}</p>
              </div>
              {a.isCorrect ? <CheckCircle2 className="size-5 text-emerald-500" /> : <XCircle className="size-5 text-destructive" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
