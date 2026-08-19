"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function CancelAssignmentButton({ assignmentId, title, studentName }: { assignmentId: string; title: string; studentName: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleCancel() {
    if (!confirm(`Cancel "${title}" for ${studentName}? It will be removed from their assigned work.`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/cancel`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Couldn't cancel this assignment.");
        return;
      }
      toast.success("Assignment cancelled.");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-destructive" onClick={handleCancel} disabled={submitting}>
      <X className="size-3.5" />
      Cancel
    </Button>
  );
}
