import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStudent } from "@/lib/auth/guards";
import { getSubjectMap } from "@/lib/curriculum/loader";
import { QuestionRunner } from "@/components/question-engine/question-runner";
import { ChevronLeft } from "lucide-react";

export default async function PracticePage({ params, searchParams }: PageProps<"/student/[subject]/[strand]">) {
  const { subject: subjectSlug, strand: strandSlug } = await params;
  const { assignmentId } = await searchParams;
  const { studentProfile, curriculumSlug } = await requireStudent();
  const map = getSubjectMap(curriculumSlug, subjectSlug);
  const strand = map?.strands.find((s) => s.slug === strandSlug);
  if (!map || !strand) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href={`/student/${subjectSlug}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> {map.subjectName}
      </Link>
      <QuestionRunner
        subjectSlug={subjectSlug}
        strandSlug={strandSlug}
        yearGroup={studentProfile.yearGroup}
        strandName={strand.name}
        assignmentId={typeof assignmentId === "string" ? assignmentId : undefined}
      />
    </div>
  );
}
