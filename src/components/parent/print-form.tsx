"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatYearGroup } from "@/lib/curriculum/label";

const MAX_TOPICS = 4;

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

export function PrintForm({ students, curriculum, yearGroupLabel }: { students: Student[]; curriculum: CurriculumSubject[]; yearGroupLabel: string }) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [subjectSlug, setSubjectSlug] = useState(curriculum[0]?.subjectSlug ?? "");
  const [strandSlugs, setStrandSlugs] = useState<string[]>([]);
  const [kind, setKind] = useState<(typeof KINDS)[number]["value"]>("TEN_QUESTION");
  const [generating, setGenerating] = useState(false);

  const student = students.find((s) => s.id === studentId);
  const subject = curriculum.find((s) => s.subjectSlug === subjectSlug);
  const availableStrands = useMemo(
    () => subject?.strands.filter((s) => !student || s.yearGroups.includes(student.yearGroup)) ?? [],
    [subject, student]
  );
  const kindConfig = KINDS.find((k) => k.value === kind)!;

  // Keep the selection valid (and default to the first topic) whenever the
  // available list changes — e.g. the parent switched subject or student.
  // Adjusted during render rather than in an Effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
  const [prevAvailableStrands, setPrevAvailableStrands] = useState(availableStrands);
  if (availableStrands !== prevAvailableStrands) {
    setPrevAvailableStrands(availableStrands);
    const stillValid = strandSlugs.filter((slug) => availableStrands.some((s) => s.slug === slug));
    setStrandSlugs(stillValid.length > 0 ? stillValid : availableStrands[0] ? [availableStrands[0].slug] : []);
  }

  function toggleStrand(slug: string) {
    setStrandSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_TOPICS) return prev;
      return [...prev, slug];
    });
  }

  async function handleGenerate() {
    if (!student) return;
    setGenerating(true);
    // Open the tab synchronously, inside the click gesture — opening it after
    // the `await`s below would happen outside the trusted user-gesture
    // window and most browsers silently block the popup.
    const pdfWindow = window.open("", "_blank");
    try {
      const res = await fetch("/api/worksheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug,
          strandSlugs: kindConfig.needsStrand ? strandSlugs : undefined,
          yearGroup: student.yearGroup,
          kind,
          studentId: student.id,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        pdfWindow?.close();
        toast.error(data.error ?? "Couldn't generate the worksheet.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (pdfWindow) {
        pdfWindow.location.href = url;
      } else {
        // Popup was blocked even for the synchronous open (e.g. strict
        // blocker settings) — fall back to a same-tab navigation link.
        window.open(url, "_blank");
      }
      toast.success("Worksheet ready — opened in a new tab for printing.");
    } catch {
      pdfWindow?.close();
      toast.error("Couldn't generate the worksheet.");
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
          <Select
            items={students.map((s) => ({ value: s.id, label: `${s.displayName} (${formatYearGroup(s.yearGroup, yearGroupLabel)})` }))}
            value={studentId}
            onValueChange={(v) => v && setStudentId(v)}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.displayName} ({formatYearGroup(s.yearGroup, yearGroupLabel)})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Subject</Label>
          <Select
            items={curriculum.map((s) => ({ value: s.subjectSlug, label: s.subjectName }))}
            value={subjectSlug}
            onValueChange={(v) => { if (v) { setSubjectSlug(v); setStrandSlugs([]); } }}
          >
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
          <Select
            items={KINDS.map((k) => ({ value: k.value, label: k.label }))}
            value={kind}
            onValueChange={(v) => v && setKind(v as typeof kind)}
          >
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
            <div className="flex items-baseline justify-between">
              <Label>Topics</Label>
              <span className="text-xs text-muted-foreground">
                {strandSlugs.length}/{MAX_TOPICS} selected — questions are split across them
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableStrands.map((s) => {
                const selected = strandSlugs.includes(s.slug);
                const disabled = !selected && strandSlugs.length >= MAX_TOPICS;
                return (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => toggleStrand(s.slug)}
                    disabled={disabled}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {selected && <Check className="size-3.5" />}
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          className="w-full gap-2"
          disabled={generating || !student || (kindConfig.needsStrand && strandSlugs.length === 0)}
        >
          <Printer className="size-4" />
          {generating ? "Generating..." : "Generate PDF"}
        </Button>
      </CardContent>
    </Card>
  );
}
