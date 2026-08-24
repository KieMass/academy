"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Check } from "lucide-react";

export function QuestionFlagAdminActions({ flagId }: { flagId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleRemove() {
    if (!confirm("Remove this question from the question bank? It will stop being served to students, but past attempts stay on record.")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/question-flags/${flagId}/remove`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Question removed from the bank.");
      router.refresh();
    } catch {
      toast.error("Couldn't remove that question.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDismiss() {
    if (!confirm("Keep this question in the bank?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/question-flags/${flagId}/dismiss`, { method: "POST" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Couldn't dismiss this report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" size="sm" className="gap-2" onClick={handleDismiss} disabled={submitting}>
        <Check className="size-3.5" /> Keep — dismiss
      </Button>
      <Button variant="destructive" size="sm" className="gap-2" onClick={handleRemove} disabled={submitting}>
        <Trash2 className="size-3.5" /> Remove from question bank
      </Button>
    </div>
  );
}
