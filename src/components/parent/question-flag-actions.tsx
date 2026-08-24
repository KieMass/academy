"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, TriangleAlert } from "lucide-react";

export function QuestionFlagActions({ flagId }: { flagId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [notes, setNotes] = useState("");

  async function handleDismiss() {
    if (!confirm("Dismiss this report? The question stays in the bank as-is.")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/parent/question-flags/${flagId}/dismiss`, { method: "POST" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Couldn't dismiss this report.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEscalate() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/parent/question-flags/${flagId}/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      toast.success("Sent to admin for review.");
      router.refresh();
    } catch {
      toast.error("Couldn't send this to admin.");
    } finally {
      setSubmitting(false);
    }
  }

  if (escalating) {
    return (
      <div className="space-y-2">
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything admin should know? (optional)"
          maxLength={1000}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setEscalating(false)} disabled={submitting}>Back</Button>
          <Button size="sm" className="gap-2" onClick={handleEscalate} disabled={submitting}>
            <TriangleAlert className="size-3.5" /> Send to admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" size="sm" className="gap-2" onClick={handleDismiss} disabled={submitting}>
        <ThumbsUp className="size-3.5" /> Looks fine
      </Button>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setEscalating(true)} disabled={submitting}>
        <TriangleAlert className="size-3.5" /> This is a real problem
      </Button>
    </div>
  );
}
