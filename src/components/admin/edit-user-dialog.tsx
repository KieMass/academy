"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { YEAR_GROUPS } from "@/lib/curriculum/types";

type EditableUser =
  | { id: string; role: "PARENT"; fullName: string; email: string }
  | { id: string; role: "STUDENT"; displayName: string; username: string; yearGroup: string; avatarEmoji: string }
  | { id: string; role: "ADMIN"; email: string };

export function EditUserDialog({ user }: { user: EditableUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const body: Record<string, string> =
      user.role === "PARENT" ? { fullName: String(form.get("fullName")), email: String(form.get("email")) } :
      user.role === "STUDENT" ? {
        displayName: String(form.get("displayName")),
        username: String(form.get("username")),
        yearGroup: String(form.get("yearGroup")),
        avatarEmoji: String(form.get("avatarEmoji")),
      } :
      { email: String(form.get("email")) };

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    toast.success("Account updated.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="size-3.5" />
            Edit
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit account</DialogTitle>
          <DialogDescription>Update this account&apos;s profile details.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {user.role === "PARENT" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" defaultValue={user.fullName} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={user.email} required />
              </div>
            </>
          )}
          {user.role === "STUDENT" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" name="displayName" defaultValue={user.displayName} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" defaultValue={user.username} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="yearGroup">Year group</Label>
                  <Select items={YEAR_GROUPS.map((y) => ({ value: y, label: `Year ${y.replace("Y", "")}` }))} name="yearGroup" defaultValue={user.yearGroup}>
                    <SelectTrigger className="w-full" id="yearGroup"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {YEAR_GROUPS.map((y) => (
                        <SelectItem key={y} value={y}>Year {y.replace("Y", "")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avatarEmoji">Avatar emoji</Label>
                <Input id="avatarEmoji" name="avatarEmoji" defaultValue={user.avatarEmoji} maxLength={4} required />
              </div>
            </>
          )}
          {user.role === "ADMIN" && (
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={user.email} required />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
