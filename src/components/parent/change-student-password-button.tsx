"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { KeyRound } from "lucide-react";

export function ChangeStudentPasswordButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const newPassword = String(data.get("newPassword"));
    const confirmPassword = String(data.get("confirmPassword"));

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/parent/students/${studentId}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) {
        const responseData = await res.json().catch(() => ({}));
        setError(responseData.error ?? "Something went wrong.");
        return;
      }
      toast.success(`Password updated for ${studentName}.`);
      form.reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Change password for ${studentName}`}
      >
        <KeyRound className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{studentName}</strong>. They&apos;ll be signed out everywhere and will need the new password next time they log in.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={6} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={6} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Updating..." : "Update password"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
