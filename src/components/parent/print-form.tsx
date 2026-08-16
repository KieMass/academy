"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer } from "lucide-react";

interface Student {
  id: string;
  displayName: string;
  yearGroup: string;
}
interface CurriculumStrand {
  slug: string;
  name: string;
  yearGroups: string[];
}
interface CurriculumSubject {
  subjectSlug: string;
  subjectName: string;
  strands: CurriculumStrand[];
}

const KINDS = [
  { value: "TEN_QUESTION", label: "10-Question Worksheet", needsStrand: true },
  { value: "TWENTY_QUESTION", label: "20-Question Worksheet", needsStrand: true },
  { value: "ASSESSMENT", label: "Assessment Paper (whole subject)", needsStrand: false },
  { value: "INTERVENTION", label: "Targeted Intervention Paper (weak areas)", needsStrand: false },
] as const;

export function PrintForm({ students, curriculum }: { students: Student[]; curriculum: CurriculumSubject[] }) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [subjectSlug, setSubjectSlug] = useState(curriculum[0]?.subjectSlug ?? "");
  const [strandSlug, setStrandSlug] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]["value"]>("TEN_QUESTION");
  const [generating, setGenerating] = useState(false);

  const student = students.find((s) => s.id === studentId);
  const subject = curriculum.find((s) => s.subjectSlug === subjectSlug);
  const availableStrands = useMemo(
    () => subject?.strands.filter((s) => !student || s.yearGroups.includes(student.yearGroup)) ?? [],
    [subject, student]
  );
  const strand = availableStrands.find((s) => s.slug === strandSlug) ?? availableStrands[0];
  const kindConfig = KINDS.find((k) => k.value === kind)!;

  async function handleGenerate() {
    if (!student) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/worksheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug,
          strandSlug: kindConfig.needsStrand ? strand?.slug : undefined,
          yearGroup: student.yearGroup,
          kind,
          studentId: student.id,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Couldn't generate the worksheet.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.success("Worksheet ready — opened in a new tab for printing.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Generate a worksheet</CardTitle>
        <CardDescription>Produces a printable PDF with a name/date header and a separate answer sheet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Student</Label>
          <Select value={studentId} onValueChange={(v) => v && setStudentId(v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.displayName} (Year {s.yearGroup.replace("Y", "")})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Subject</Label>
          <Select value={subjectSlug} onValueChange={(v) => { if (v) { setSubjectSlug(v); setStrandSlug(""); } }}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {curriculum.map((s) => (
                <SelectItem key={s.subjectSlug} value={s.subjectSlug}>{s.subjectName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Worksheet type</Label>
          <Select value={kind} onValueChange={(v) => v && setKind(v as typeof kind)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {KINDS.map((k) => (
                <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {kindConfig.needsStrand && (
          <div className="space-y-1.5">
            <Label>Topic</Label>
            <Select value={strand?.slug ?? ""} onValueChange={(v) => v && setStrandSlug(v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableStrands.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={handleGenerate} className="w-full gap-2" disabled={generating || !student}>
          <Printer className="size-4" />
          {generating ? "Generating..." : "Generate PDF"}
        </Button>
      </CardContent>
    </Card>
  );
}
