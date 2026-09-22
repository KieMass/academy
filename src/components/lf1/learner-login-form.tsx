"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Login for the LF1 Study side app — same /api/auth/login endpoint and
 * session cookie as the rest of KaeLex, with the LEARNER role. */
export function LearnerLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "LEARNER", identifier: form.get("identifier"), password: form.get("password") }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    router.push("/lf1/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-t-4 border-t-primary shadow-xl">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">LF1 Study</CardTitle>
        <CardDescription>Log in to practise for CII LF1 — Life and pensions foundations.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="lf1-username">Username</Label>
            <Input id="lf1-username" name="identifier" autoComplete="username" autoCapitalize="none" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lf1-password">Password</Label>
            <Input id="lf1-password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
