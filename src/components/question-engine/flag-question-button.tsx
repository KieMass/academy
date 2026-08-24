"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { QuestionResponse } from "@/lib/question-engine/types";
import { Flag } from "lucide-react";

const REASONS = [
  { value: "confusing", label: "The question doesn't make sense" },
  { value: "wrong_answer", label: "There's a mistake in the question or answer" },
  { value: "broken", label: "A word or option is missing or broken" },
  { value: "other", label: "Something else" },
];

/** A small, always-visible "report a problem" affordance on every question —
 * a question can be broken before it's even been answered (a typo, a
 * missing option), so this isn't gated behind submitting first. Feeds the
 * flag -> parent review -> admin removal pipeline; see
 * /api/question-flags and the parent/admin review pages. */
export function FlagQuestionButton({ questionId, response }: { questionId: string; response: QuestionResponse | null }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/question-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          reason: REASONS.find((r) => r.value === reason)?.label ?? reason,
          note: note.trim() || undefined,
          response: response ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to report");
      const data = await res.json();
      setSubmitted(true);
      toast.success(data.alreadyReported ? "You've already reported this one — a parent will take a look." : "Thanks — a parent will take a look.");
      setTimeout(() => setOpen(false), 900);
    } catch {
      toast.error("Couldn't send that report — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <Flag className="size-3.5" /> Report a problem with this question
      </button>

      <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) { setReason(""); setNote(""); setSubmitted(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report a problem</DialogTitle>
            <DialogDescription>Let us know what&apos;s wrong — a parent will look at it before it&apos;s removed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select items={REASONS} value={reason || null} onValueChange={(v) => setReason(v ?? "")}>
              <SelectTrigger className="w-full"><SelectValue placeholder="What's the problem?" /></SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything else to add? (optional)" maxLength={1000} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!reason || submitting || submitted}>
              {submitted ? "Sent" : submitting ? "Sending..." : "Send report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
