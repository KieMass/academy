"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RetentionMode = "ASSIGNMENT_COUNT" | "DAYS";

const MODE_OPTIONS: { value: RetentionMode; label: string }[] = [
  { value: "ASSIGNMENT_COUNT", label: "Most recent assignments per child" },
  { value: "DAYS", label: "Days since assigned" },
];

export function RetentionSettingsForm({ initialMode, initialValue }: { initialMode: RetentionMode; initialValue: number }) {
  const router = useRouter();
  const [mode, setMode] = useState<RetentionMode>(initialMode);
  const [value, setValue] = useState(String(initialValue));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
      toast.error("Enter a whole number of 1 or more.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/retention", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, value: parsed }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Couldn't save the retention policy.");
      return;
    }
    toast.success("Retention policy saved — older results have been purged.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assignment results retention</CardTitle>
        <CardDescription>
          Controls how long parents can review a child&apos;s past assignment results. Older results (and the answers behind them) are
          permanently deleted once they fall outside this policy — mastery, XP and streaks are unaffected.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label>Keep results based on</Label>
            <Select items={MODE_OPTIONS} value={mode} onValueChange={(v) => v && setMode(v as RetentionMode)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MODE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="retentionValue">{mode === "DAYS" ? "Number of days" : "Number of assignments"}</Label>
            <Input
              id="retentionValue"
              type="number"
              min={1}
              max={3650}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save policy"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
