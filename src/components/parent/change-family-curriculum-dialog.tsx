"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Globe } from "lucide-react";

interface CurriculumOption {
  slug: string;
  name: string;
}

/** Lets a parent switch which national curriculum the whole family follows
 * — e.g. relocating from the Cayman Islands to Guyana, or correcting a
 * wrong choice made at registration. Curriculum is a Family-level setting
 * (see the Curriculum model in schema.prisma), so this affects every
 * student in the family at once — the dialog copy makes that explicit
 * rather than letting it read like a per-child setting. */
export function ChangeFamilyCurriculumDialog({ currentSlug, currentName }: { currentSlug: string; currentName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [curricula, setCurricula] = useState<CurriculumOption[]>([]);
  const [selected, setSelected] = useState(currentSlug);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/curricula")
      .then((res) => res.json())
      .then((data: { curricula: CurriculumOption[] }) => {
        if (!cancelled) setCurricula(data.curricula ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selected === currentSlug) {
      setOpen(false);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/parent/family/curriculum", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculumSlug: selected }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }
      const newName = curricula.find((c) => c.slug === selected)?.name ?? selected;
      toast.success(`Your family now follows the ${newName} curriculum.`);
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) { setError(null); setSelected(currentSlug); } }}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2"><Globe className="size-4" /> Change curriculum</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change your family&apos;s curriculum</DialogTitle>
          <DialogDescription>
            You&apos;re currently following the <strong>{currentName}</strong> curriculum. This applies to <strong>every student in your family</strong> —
            useful if you&apos;ve relocated to a different country, or picked the wrong one when you signed up.
            Past progress and assignments stay exactly as they are; new questions, assignments and worksheets will follow the new curriculum from now on.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="curriculumSlug">Curriculum</Label>
            <Select
              items={curricula.map((c) => ({ value: c.slug, label: c.name }))}
              value={selected}
              onValueChange={(v) => v && setSelected(v)}
            >
              <SelectTrigger className="w-full" id="curriculumSlug"><SelectValue /></SelectTrigger>
              <SelectContent>
                {curricula.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || selected === currentSlug}>{submitting ? "Saving..." : "Change curriculum"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
