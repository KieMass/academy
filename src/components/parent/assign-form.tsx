"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export function AssignForm({ students, curriculum }: { students: Student[]; curriculum: CurriculumSubject[] }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [subjectSlug, setSubjectSlug] = useState(curriculum[0]?.subjectSlug ?? "");
  const [strandSlug, setStrandSlug] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const student = students.find((s) => s.id === studentId);
  const subject = curriculum.find((s) => s.subjectSlug === subjectSlug);
  const availableStrands = useMemo(
    () => subject?.strands.filter((s) => !student || s.yearGroups.includes(student.yearGroup)) ?? [],
    [subject, student]
  );
  const strand = availableStrands.find((s) => s.slug === strandSlug) ?? availableStrands[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!student || !subject || !strand) return;
    setSubmitting(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: student.id,
        subjectSlug: subject.subjectSlug,
        strandSlug: strand.slug,
        yearGroup: student.yearGroup,
        title: `${subject.subjectName}: ${strand.name}`,
        dueDate: dueDate || undefined,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error("Couldn't create the assignment. Please try again.");
      return;
    }
    toast.success(`Assigned "${strand.name}" to ${student.displayName}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">New assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Due date (optional)</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" disabled={submitting || !strand}>
            {submitting ? "Assigning..." : "Assign practice"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
