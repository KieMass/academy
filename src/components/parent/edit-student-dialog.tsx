"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { YEAR_GROUPS, type YearGroup } from "@/lib/curriculum/types";
import { formatYearGroup } from "@/lib/curriculum/label";

interface Student {
  id: string;
  displayName: string;
  yearGroup: YearGroup;
  avatarEmoji: string;
}

/** Lets a parent update their child's name, year/grade and avatar — most
 * importantly the year group, which needs to move up as a child progresses
 * through school (e.g. Y3 -> Y4 each September). Mirrors admin's
 * EditUserDialog but scoped to the fields a parent (not an admin) should
 * be able to change. */
export function EditStudentDialog({ student, yearGroupLabel }: { student: Student; yearGroupLabel: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/parent/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.get("displayName"),
          yearGroup: form.get("yearGroup"),
          avatarEmoji: form.get("avatarEmoji"),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }
      toast.success(`${form.get("displayName")}'s details updated.`);
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setError(null); }}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${student.displayName}`}>
            <Pencil className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit student</DialogTitle>
          <DialogDescription>
            Update {student.displayName}&apos;s details — move them up a {yearGroupLabel.toLowerCase()} group as they progress through school.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor={`displayName-${student.id}`}>Child&apos;s name</Label>
            <Input id={`displayName-${student.id}`} name="displayName" defaultValue={student.displayName} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`yearGroup-${student.id}`}>{yearGroupLabel} group</Label>
            <Select
              items={YEAR_GROUPS.map((y) => ({ value: y, label: formatYearGroup(y, yearGroupLabel) }))}
              name="yearGroup"
              defaultValue={student.yearGroup}
            >
              <SelectTrigger className="w-full" id={`yearGroup-${student.id}`}><SelectValue /></SelectTrigger>
              <SelectContent>
                {YEAR_GROUPS.map((y) => (
                  <SelectItem key={y} value={y}>{formatYearGroup(y, yearGroupLabel)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`avatarEmoji-${student.id}`}>Avatar emoji</Label>
            <Input id={`avatarEmoji-${student.id}`} name="avatarEmoji" defaultValue={student.avatarEmoji} maxLength={4} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
