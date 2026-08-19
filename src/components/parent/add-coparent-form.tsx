"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Copy, Check } from "lucide-react";

export function AddCoParentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/parent/family/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: form.get("fullName"), email: form.get("email") }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    const data = await res.json();
    setResult(data);
    setCopied(false);
    router.refresh();
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.password);
    setCopied(true);
    toast.success("Password copied to clipboard.");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setResult(null);
      setError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="size-4" /> Add co-parent
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a co-parent</DialogTitle>
          <DialogDescription>
            They&apos;ll get full access to the same students as you — assigning work, viewing progress, printing
            worksheets, everything.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Account created for <strong>{result.email}</strong>. Share this password with them securely — it won&apos;t
              be shown again.
            </p>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2.5">
              <code className="flex-1 font-mono text-sm break-all">{result.password}</code>
              <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy password">
                {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <Button className="w-full" onClick={() => handleOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Their name</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Their email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Adding..." : "Add co-parent"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
