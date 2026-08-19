"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ROLES = [
  { value: "PARENT", label: "Parent" },
  { value: "STUDENT", label: "Student" },
  { value: "ADMIN", label: "Admin" },
] as const;

export default function ForgotPasswordPage() {
  const [role, setRole] = useState<(typeof ROLES)[number]["value"]>("PARENT");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, identifier: form.get("identifier") }),
    }).catch(() => {});
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-gradient-brand">
        <Sparkles className="size-6 text-primary" />
        KaeLex Academy
      </Link>
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-xl">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Forgot your password?</CardTitle>
          <CardDescription>
            There&apos;s no automatic email reset yet — submitting this sends a request your site admin can see and
            action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="size-10 text-primary" />
              <p className="font-medium">Request sent</p>
              <p className="text-sm text-muted-foreground">
                If that account exists, your admin has been notified and will be in touch with a new password.
              </p>
              <Link href="/login" className="text-sm text-primary underline underline-offset-2">
                Back to login
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="role">I am a</Label>
                <Select
                  items={ROLES.map((r) => ({ value: r.value, label: r.label }))}
                  value={role}
                  onValueChange={(v) => v && setRole(v as typeof role)}
                >
                  <SelectTrigger className="w-full" id="role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="identifier">{role === "STUDENT" ? "Username" : "Email"}</Label>
                <Input id="identifier" name="identifier" required autoComplete={role === "STUDENT" ? "username" : "email"} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send request"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                <Link href="/login" className="underline underline-offset-2">Back to login</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
