"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm({ defaultTab }: { defaultTab: "student" | "parent" }) {
  const router = useRouter();
  const [tab, setTab] = useState<"student" | "parent">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, role: "PARENT" | "STUDENT") {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        identifier: form.get("identifier"),
        password: form.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    router.push(role === "PARENT" ? "/parent/dashboard" : "/student/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
        <CardDescription>Log in to continue your learning journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "student" | "parent")}>
          <TabsList className="w-full">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="parent">Parent</TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="pt-2">
            <form className="space-y-4" onSubmit={(e) => handleSubmit(e, "STUDENT")}>
              <div className="space-y-1.5">
                <Label htmlFor="student-username">Username</Label>
                <Input id="student-username" name="identifier" placeholder="e.g. alex" autoComplete="username" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="student-password">Password</Label>
                <Input id="student-password" name="password" type="password" autoComplete="current-password" required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Start learning"}
              </Button>
              <p className="text-xs text-muted-foreground">Demo account — username: alex · password: student123</p>
            </form>
          </TabsContent>

          <TabsContent value="parent" className="pt-2">
            <form className="space-y-4" onSubmit={(e) => handleSubmit(e, "PARENT")}>
              <div className="space-y-1.5">
                <Label htmlFor="parent-email">Email</Label>
                <Input id="parent-email" name="identifier" type="email" autoComplete="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parent-password">Password</Label>
                <Input id="parent-password" name="password" type="password" autoComplete="current-password" required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Demo account — parent@kaelex.demo · Parent123! &nbsp;•&nbsp; No account?{" "}
                <Link href="/register" className="text-primary underline underline-offset-2">
                  Create one
                </Link>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
