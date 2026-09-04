import Link from "next/link";
import { requireStudent } from "@/lib/auth/guards";
import { formatYearGroup } from "@/lib/curriculum/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, Calculator, BookOpen, FlaskConical, Globe2, AlertTriangle } from "lucide-react";
import pastPapers from "../../../../content/ngsa-past-papers/guyana.json";

interface PastPaper {
  year: number;
  subjectSlug: string;
  subjectLabel: string;
  paperLabel: string;
  title: string;
  description: string;
  fileUrl: string;
  markingSchemeUrl: string | null;
  sourceUrl: string;
}

const SIMULATED_EXAMS: { key: string; label: string; icon: typeof Calculator }[] = [
  { key: "maths", label: "Mathematics", icon: Calculator },
  { key: "english", label: "English Language", icon: BookOpen },
  { key: "science", label: "Science", icon: FlaskConical },
  { key: "social-studies", label: "Social Studies", icon: Globe2 },
];

export default async function NgsaPrepPage() {
  const { studentProfile, curriculumSlug, yearGroupLabel } = await requireStudent();

  if (curriculumSlug !== "guyana") {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          NGSA Prep is specific to Guyana&apos;s National Grade Six Assessment, so it&apos;s only shown for students on the Guyana curriculum.
        </CardContent>
      </Card>
    );
  }

  if (studentProfile.yearGroup !== "Y6") {
    return (
      <Card>
        <CardContent className="space-y-2 py-10 text-center">
          <p className="font-medium">NGSA Prep unlocks in {formatYearGroup("Y6", yearGroupLabel)}</p>
          <p className="text-sm text-muted-foreground">
            The National Grade Six Assessment is sat in {formatYearGroup("Y6", yearGroupLabel)} — come back once you get there!
          </p>
        </CardContent>
      </Card>
    );
  }

  const papers = (pastPapers as PastPaper[]).slice().sort((a, b) => b.year - a.year || a.subjectLabel.localeCompare(b.subjectLabel));
  const bySubject = new Map<string, PastPaper[]>();
  for (const p of papers) {
    const list = bySubject.get(p.subjectLabel) ?? [];
    list.push(p);
    bySubject.set(p.subjectLabel, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">NGSA Prep</h1>
        <p className="text-sm text-muted-foreground">Real past papers to read and print, plus practice exams to try online.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Real past papers</h2>
        <p className="text-sm text-muted-foreground">
          Genuine National Grade Six Assessment papers, sourced directly from the Guyana Ministry of Education. Open them to read, or download to print.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[...bySubject.entries()].map(([subjectLabel, subjectPapers]) => (
            <Card key={subjectLabel}>
              <CardHeader>
                <CardTitle className="text-base">{subjectLabel}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjectPapers.map((p) => (
                  <div key={p.title} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{p.year} — {p.paperLabel}</p>
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                      </div>
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        render={
                          <a href={p.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="size-3.5" /> Open paper
                          </a>
                        }
                      />
                      {p.markingSchemeUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          render={
                            <a href={p.markingSchemeUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="size-3.5" /> Marking scheme
                            </a>
                          }
                        />
                      )}
                      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:underline">
                        Source <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Practice exams (simulated)</h2>
        <Card className="border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
          <CardContent className="flex items-start gap-2.5 py-4 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>
              <strong>These are practice exams created by KaeLex Academy for revision</strong> — built from questions in your usual practice bank,
              formatted like an NGSA paper. They are <strong>not</strong> official NGSA past papers. For the real thing, see the past papers section above.
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SIMULATED_EXAMS.map(({ key, label, icon: Icon }) => (
            <Card key={key}>
              <CardContent className="space-y-3 py-6 text-center">
                <Icon className="mx-auto size-8 text-primary" />
                <CardDescription className="font-medium text-foreground">{label}</CardDescription>
                <Button
                  className="w-full"
                  render={
                    <Link href={`/student/ngsa/exam/${key}`}>
                      <Badge variant="secondary" className="mr-1.5 rounded-full">25 Qs</Badge> Start
                    </Link>
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
