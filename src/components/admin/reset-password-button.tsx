"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { KeyRound, Copy, Check } from "lucide-react";

export function ResetPasswordButton({ userId, userLabel }: { userId: string; userLabel: string }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleReset() {
    if (!confirm(`Reset the password for ${userLabel}? They'll be logged out everywhere and will need the new password to log back in.`)) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Couldn't reset the password.");
        return;
      }
      const data = await res.json();
      setNewPassword(data.password);
      setCopied(false);
      setOpen(true);
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
      <Button variant="outline" size="sm" className="gap-2" onClick={handleReset} disabled={submitting}>
        <KeyRound className="size-3.5" />
        {submitting ? "Resetting..." : "Reset password"}
      </Button>

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
