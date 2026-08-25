import Link from "next/link";
import { requireStudent } from "@/lib/auth/guards";
import { formatYearGroup } from "@/lib/curriculum/label";
import { listSubjects, resolveTopics } from "@/lib/curriculum/loader";
import { getStudentOverview } from "@/lib/student-stats";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SubjectIcon } from "@/components/subject-icon";
import { subjectColorClasses } from "@/lib/subject-colors";
import { xpProgressWithinLevel } from "@/lib/gamification/xp";
import { ArrowRight, Target, ClipboardList, Flame } from "lucide-react";

export default async function StudentDashboardPage() {
  const { studentProfile, curriculumSlug, yearGroupLabel } = await requireStudent();
  const subjects = listSubjects(curriculumSlug);
  const topicCounts = new Map<string, number>();
  for (const t of resolveTopics(curriculumSlug, { yearGroup: studentProfile.yearGroup })) {
    topicCounts.set(t.subjectSlug, (topicCounts.get(t.subjectSlug) ?? 0) + 1);
  }
  const overview = await getStudentOverview(studentProfile.id, curriculumSlug, studentProfile.yearGroup, 4);
  const masteredPct = overview.totalTopics > 0 ? Math.round(((overview.counts.mastered + overview.counts.secure) / overview.totalTopics) * 100) : 0;

  const activeAssignments = await db.assignment.findMany({
    where: { studentId: studentProfile.id, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const assignedTopicIds = [...new Set(activeAssignments.flatMap((a) => JSON.parse(a.topicIds) as string[]))];
  const assignedTopics = assignedTopicIds.length
    ? await db.topic.findMany({ where: { id: { in: assignedTopicIds } }, include: { subject: true } })
    : [];
  const assignedTopicById = new Map(assignedTopics.map((t) => [t.id, t]));

  const { level, xpIntoLevel, xpForLevel } = xpProgressWithinLevel(studentProfile.xpTotal);
  const levelPct = Math.round((xpIntoLevel / xpForLevel) * 100);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl bg-gradient-brand p-6 text-primary-foreground shadow-lg md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="font-heading text-2xl font-bold md:text-3xl">Today&apos;s Tasks</h1>
            <p className="text-primary-foreground/85">Pick a subject, or jump into your recommended practice below.</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-black/10 px-4 py-3 backdrop-blur-sm">
            <div className="flex size-11 items-center justify-center rounded-full bg-white/20 font-heading text-lg font-bold">
              {level}
            </div>
            <div className="w-40">
              <div className="flex items-center justify-between text-xs font-medium text-primary-foreground/85">
                <span>Level {level}</span>
                <span>{xpIntoLevel}/{xpForLevel} XP</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/15">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${levelPct}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 border-l border-white/25 pl-4 text-sm font-semibold">
              <Flame className="size-4.5 text-orange-200" />
              {studentProfile.streakDays}
            </div>
          </div>
        </div>
      </div>

      {activeAssignments.length > 0 && (
        <Card className="border-accent/40 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="size-5 text-accent" />
              Set by your parent
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {activeAssignments.map((a) => {
              const topicId = (JSON.parse(a.topicIds) as string[])[0];
              const topic = assignedTopicById.get(topicId);
              if (!topic) return null;
              return (
                <Link
                  key={a.id}
                  href={`/student/${topic.subject.slug}/${topic.strandSlug}?assignmentId=${a.id}`}
                  className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 transition hover:shadow-md"
                >
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{topic.subject.name}</p>
                    <p className="font-semibold">{a.title}</p>
                    {a.dueDate && <p className="text-xs text-muted-foreground">Due {new Date(a.dueDate).toLocaleDateString("en-GB")}</p>}
                  </div>
                  <ArrowRight className="size-4 text-accent" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {overview.recommended.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="size-5 text-primary" />
              Recommended for you
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {overview.recommended.map((topic) => (
              <Link
                key={`${topic.subjectSlug}:${topic.strandSlug}`}
                href={`/student/${topic.subjectSlug}/${topic.strandSlug}`}
                className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 transition hover:shadow-md"
              >
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{topic.subjectName}</p>
                  <p className="font-semibold">{topic.strandName}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic.reason === "weak-area" ? `Keep practising — ${Math.round((topic.accuracy ?? 0) * 100)}% so far` : "New topic to try"}
                  </p>
                </div>
                <ArrowRight className="size-4 text-primary" />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Your subjects</h2>
          <span className="text-sm text-muted-foreground">{masteredPct}% of {formatYearGroup(studentProfile.yearGroup, yearGroupLabel)} secure or mastered</span>
        </div>
        <Progress value={masteredPct} className="mb-5 h-2" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {subjects.map((subject) => {
            const colors = subjectColorClasses(subject.color);
            return (
              <Link key={subject.subjectSlug} href={`/student/${subject.subjectSlug}`}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className={`flex size-14 items-center justify-center rounded-2xl ring-4 ${colors.bg} ${colors.ring}`}>
                      <SubjectIcon name={subject.icon} className={`size-7 ${colors.text}`} />
                    </div>
                    <div>
                      <p className="font-heading font-semibold">{subject.subjectName}</p>
                      <p className="text-xs text-muted-foreground">{topicCounts.get(subject.subjectSlug) ?? 0} topics</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
