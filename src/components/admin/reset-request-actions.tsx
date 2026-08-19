"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { KeyRound, Copy, Check, X } from "lucide-react";

export function ResetRequestActions({ requestId, hasAccount, userLabel }: { requestId: string; hasAccount: boolean; userLabel: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleFulfil() {
    if (!confirm(`Generate a new password for ${userLabel}? They'll be logged out everywhere.`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reset-requests/${requestId}/fulfil`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Couldn't fulfil this request.");
        return;
      }
      const data = await res.json();
      setNewPassword(data.password);
      setCopied(false);
      setOpen(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDismiss() {
    if (!confirm("Dismiss this request without resetting a password?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reset-requests/${requestId}/dismiss`, { method: "POST" });
      if (!res.ok) {
        toast.error("Couldn't dismiss this request.");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!newPassword) return;
    await navigator.clipboard.writeText(newPassword);
    setCopied(true);
    toast.success("Password copied to clipboard.");
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        {hasAccount && (
          <Button variant="outline" size="sm" className="gap-2" onClick={handleFulfil} disabled={submitting}>
            <KeyRound className="size-3.5" />
            Generate new password
          </Button>
        )}
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleDismiss} disabled={submitting}>
          <X className="size-3.5" />
          Dismiss
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password reset</DialogTitle>
            <DialogDescription>
              New password for <strong>{userLabel}</strong> — shown once. Share it with them securely; it won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2.5">
            <code className="flex-1 font-mono text-sm break-all">{newPassword}</code>
            <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy password">
              {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
