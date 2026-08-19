"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function DismissContentGapButton({ alertId, topicLabel }: { alertId: string; topicLabel: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleDismiss() {
    if (!confirm(`Dismiss the content-gap alert for ${topicLabel}? It won't reappear until usage grows further.`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/content-gaps/${alertId}/dismiss`, { method: "POST" });
      if (!res.ok) {
        toast.error("Couldn't dismiss this alert.");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleDismiss} disabled={submitting}>
      <Check className="size-3.5" />
      Dismiss
    </Button>
  );
}
