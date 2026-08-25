"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { suggestCurriculumFromCoords } from "@/lib/curriculum/geo-suggest";

interface CurriculumOption {
  slug: string;
  name: string;
}

type GeoStatus = "detecting" | "detected" | "ask";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [curricula, setCurricula] = useState<CurriculumOption[]>([]);
  const [curriculumSlug, setCurriculumSlug] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>(() =>
    typeof navigator !== "undefined" && "geolocation" in navigator ? "detecting" : "ask"
  );

  // Load the list of supported curricula (country + display name) up front
  // — the registration form has no session yet, so this comes from the
  // public /api/curricula endpoint rather than a server component prop.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/curricula")
      .then((res) => res.json())
      .then((data: { curricula: CurriculumOption[] }) => {
        if (!cancelled) setCurricula(data.curricula ?? []);
      })
      .catch(() => {
        // Leave curricula empty — the select will just have no options and
        // submission stays blocked until a retry/refresh succeeds.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Try to geotag the browser's location and suggest a default curriculum
  // from it (Guyana vs Cayman Islands, via a coarse bounding-box match —
  // see lib/curriculum/geo-suggest.ts). Any failure — no geolocation
  // support, denied permission, timeout, or a coordinate outside every
  // known curriculum's bounds — falls back to asking the parent to choose
  // explicitly instead of guessing.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const suggestion = suggestCurriculumFromCoords(position.coords.latitude, position.coords.longitude);
        if (suggestion) {
          setCurriculumSlug(suggestion);
          setGeoStatus("detected");
        } else {
          setGeoStatus("ask");
        }
      },
      () => setGeoStatus("ask"),
      { timeout: 8000, maximumAge: 0 }
    );
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!curriculumSlug) {
      setError("Please choose your country.");
      return;
    }
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register-parent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.get("fullName"),
        email: form.get("email"),
        password: form.get("password"),
        curriculumSlug,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    router.push("/parent/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-gradient-brand">
        <Sparkles className="size-6 text-primary" />
        KaeLex Academy
      </Link>
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-xl">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Create a parent account</CardTitle>
          <CardDescription>You&apos;ll be able to add your child&apos;s student profile next.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Your name</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="curriculumSlug">Country / curriculum</Label>
              <Select
                items={curricula.map((c) => ({ value: c.slug, label: c.name }))}
                value={curriculumSlug ?? undefined}
                onValueChange={(v) => v && setCurriculumSlug(v)}
              >
                <SelectTrigger className="w-full" id="curriculumSlug">
                  <SelectValue placeholder={geoStatus === "detecting" ? "Detecting your location…" : "Choose your country"} />
                </SelectTrigger>
                <SelectContent>
                  {curricula.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {geoStatus === "detected" && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> Detected from your location — change it above if this isn&apos;t right.
                </p>
              )}
              {geoStatus === "ask" && (
                <p className="text-xs text-muted-foreground">
                  We couldn&apos;t detect your location automatically — please choose your country.
                </p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !curriculumSlug}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login?as=parent" className="text-primary underline underline-offset-2">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
