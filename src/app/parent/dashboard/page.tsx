import Link from "next/link";
import { requireParent } from "@/lib/auth/guards";
import { formatYearGroup } from "@/lib/curriculum/label";
import { db } from "@/lib/db";
import { getStudentOverview } from "@/lib/student-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserPlus, ArrowRight, Flame, Star } from "lucide-react";

export default async function ParentDashboardPage() {
  const { parentProfile, curriculumSlug, yearGroupLabel } = await requireParent();
  const students = await db.studentProfile.findMany({ where: { parent: { familyId: parentProfile.familyId } }, orderBy: { createdAt: "asc" } });

  const overviews = await Promise.all(students.map((s) => getStudentOverview(s.id, curriculumSlug, s.yearGroup, 3)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-3xl bg-gradient-brand p-6 text-primary-foreground shadow-lg md:p-8">
        <div>
          <h1 className="font-heading text-2xl font-bold md:text-3xl">Welcome back, {parentProfile.fullName.split(" ")[0]}</h1>
          <p className="text-primary-foreground/85">Here&apos;s how your family is getting on.</p>
        </div>
        <Button
          variant="secondary"
          className="gap-2 shadow-sm"
          render={
            <Link href="/parent/settings">
              <UserPlus className="size-4" /> Add student
            </Link>
          }
        />
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-10 text-center">
            <p className="text-muted-foreground">You haven&apos;t added a student account yet.</p>
            <Button render={<Link href="/parent/settings">Add your first student</Link>} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {students.map((student, i) => {
            const overview = overviews[i];
            const masteredPct = overview.totalTopics > 0 ? Math.round(((overview.counts.mastered + overview.counts.secure) / overview.totalTopics) * 100) : 0;
            return (
              <Card key={student.id} className="overflow-hidden transition hover:shadow-md">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xl">{student.avatarEmoji}</span>
                    {student.displayName}
                    <span className="text-sm font-normal text-muted-foreground">{formatYearGroup(student.yearGroup, yearGroupLabel)}</span>
                  </CardTitle>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Flame className="size-4 text-accent" />{student.streakDays}d</span>
                    <span className="flex items-center gap-1"><Star className="size-4 text-primary" />Lvl {student.levelNumber}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Curriculum coverage</span>
                      <span>{masteredPct}% secure or mastered</span>
                    </div>
                    <Progress value={masteredPct} className="h-2" />
                  </div>

                  {overview.recommended.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">Needs support</p>
                      <ul className="space-y-1 text-sm">
                        {overview.recommended.slice(0, 3).map((t) => (
                          <li key={`${t.subjectSlug}:${t.strandSlug}`} className="flex items-center justify-between">
                            <span>{t.subjectName} · {t.strandName}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-2"
                    render={
                      <Link href={`/parent/progress?student=${student.id}`}>
                        View full progress <ArrowRight className="size-4" />
                      </Link>
                    }
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
