import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { getSubjectMap } from "@/lib/curriculum/loader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubjectIcon } from "@/components/subject-icon";
import { subjectColorClasses } from "@/lib/subject-colors";
import { ChevronRight } from "lucide-react";

const MASTERY_LABEL: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: "Not started", className: "bg-muted text-muted-foreground" },
  DEVELOPING: { label: "Developing", className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  SECURE: { label: "Secure", className: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400" },
  MASTERED: { label: "Mastered", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
};

export default async function SubjectTopicsPage({ params }: PageProps<"/student/[subject]">) {
  const { subject: subjectSlug } = await params;
  const { studentProfile } = await requireStudent();
  const map = getSubjectMap(subjectSlug);
  if (!map) notFound();

  const topics = await db.topic.findMany({
    where: { subject: { slug: subjectSlug }, yearGroup: studentProfile.yearGroup },
    include: { masteries: { where: { studentId: studentProfile.id } }, _count: { select: { questions: true } } },
    orderBy: { order: "asc" },
  });

  const colors = subjectColorClasses(map.color);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`flex size-12 items-center justify-center rounded-2xl ${colors.bg}`}>
          <SubjectIcon name={map.icon} className={`size-6 ${colors.text}`} />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold">{map.subjectName}</h1>
          <p className="text-sm text-muted-foreground">{map.frameworks.join(" · ")}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => {
          const mastery = topic.masteries[0];
          const status = MASTERY_LABEL[mastery?.masteryLevel ?? "NOT_STARTED"];
          return (
            <Link key={topic.id} href={`/student/${subjectSlug}/${topic.strandSlug}`}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg">
                <CardContent className="flex items-center justify-between gap-3 py-5">
                  <div className="min-w-0">
                    <p className="truncate font-heading font-semibold">{topic.strandName}</p>
                    <p className="text-xs text-muted-foreground">{topic._count.questions} questions available</p>
                    <Badge className={`mt-2 ${status.className}`} variant="outline">
                      {status.label}
                    </Badge>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {topics.length === 0 && (
        <p className="text-sm text-muted-foreground">No topics are available for {map.subjectName} at your year group yet.</p>
      )}
    </div>
  );
}
