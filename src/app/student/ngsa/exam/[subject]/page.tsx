import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth/guards";
import { NgsaExamRunner } from "@/components/ngsa/ngsa-exam-runner";

const SUBJECT_LABELS: Record<string, string> = {
  maths: "Mathematics",
  english: "English Language",
  science: "Science",
  "social-studies": "Social Studies",
};

export default async function NgsaExamPage({ params }: PageProps<"/student/ngsa/exam/[subject]">) {
  const { subject } = await params;
  const { studentProfile, curriculumSlug } = await requireStudent();

  if (curriculumSlug !== "guyana" || studentProfile.yearGroup !== "Y6") notFound();

  const subjectLabel = SUBJECT_LABELS[subject];
  if (!subjectLabel) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <NgsaExamRunner subjectKey={subject} subjectLabel={subjectLabel} />
    </div>
  );
}
