"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { COLOR_SCHEMES } from "@/lib/theme/color-schemes";
import { Check } from "lucide-react";

export function ColorSchemePicker({ initialScheme }: { initialScheme: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialScheme);
  const [saving, setSaving] = useState<string | null>(null);

  async function handleSelect(id: string) {
    if (id === selected || saving) return;
    const previous = selected;
    setSelected(id);
    setSaving(id);
    // Apply immediately rather than waiting on the request round-trip —
    // the whole point is an instant preview of the new look.
    document.documentElement.setAttribute("data-theme-color", id);

    try {
      const res = await fetch("/api/auth/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colorScheme: id }),
      });
      if (!res.ok) {
        setSelected(previous);
        document.documentElement.setAttribute("data-theme-color", previous);
        toast.error("Couldn't save your colour scheme.");
        return;
      }
      router.refresh();
    } finally {
      setSaving(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Colour scheme</CardTitle>
        <CardDescription>Pick a look for your account. Applies everywhere you&apos;re signed in.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {COLOR_SCHEMES.map((scheme) => {
            const active = selected === scheme.id;
            return (
              <button
                key={scheme.id}
                type="button"
                onClick={() => handleSelect(scheme.id)}
                disabled={saving !== null}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition disabled:cursor-not-allowed",
                  active ? "border-primary shadow-sm" : "border-transparent hover:border-border"
                )}
                aria-pressed={active}
              >
                <span
                  className="relative flex size-10 items-center justify-center rounded-full"
                  style={{ background: `linear-gradient(135deg, ${scheme.swatchPrimary}, ${scheme.swatchAccent})` }}
                >
                  {active && <Check className="size-4 text-white drop-shadow" />}
                </span>
                <span className="text-xs font-medium">{scheme.label}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
