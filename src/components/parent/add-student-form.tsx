"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { YEAR_GROUPS } from "@/lib/curriculum/types";
import { formatYearGroup } from "@/lib/curriculum/label";

const AVATARS = ["🦊", "🦎", "🐬", "🦉", "🐢", "🦜", "🐙", "🦁"];

export function AddStudentForm({ yearGroupLabel }: { yearGroupLabel: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(AVATARS[0]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/parent/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.get("displayName"),
        username: form.get("username"),
        password: form.get("password"),
        yearGroup: form.get("yearGroup"),
        avatarEmoji: avatar,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    toast.success("Student account created!");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <UserPlus className="size-4" /> Add student
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a student account</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Child&apos;s name</Label>
            <Input id="displayName" name="displayName" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="e.g. alex" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yearGroup">{yearGroupLabel} group</Label>
              <Select
                items={YEAR_GROUPS.map((y) => ({ value: y, label: formatYearGroup(y, yearGroupLabel) }))}
                name="yearGroup"
                defaultValue="Y5"
              >
                <SelectTrigger className="w-full" id="yearGroup"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEAR_GROUPS.map((y) => (
                    <SelectItem key={y} value={y}>{formatYearGroup(y, yearGroupLabel)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          <div className="space-y-1.5">
            <Label>Avatar</Label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`flex size-10 items-center justify-center rounded-full border-2 text-lg ${avatar === a ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create student account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
