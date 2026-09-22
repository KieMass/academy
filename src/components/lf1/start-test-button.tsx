"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type StartRequest = { mode: "PRACTICE"; outcome: number | null; count: number } | { mode: "MOCK" };

/** Creates an LF1 test session (POST /api/lf1/tests) and opens it. */
export function StartTestButton({
  request,
  children,
  variant = "default",
  size = "default",
  className,
}: {
  request: StartRequest;
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/lf1/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) throw new Error(data.error ?? "Couldn't start the test.");
      router.push(`/lf1/tests/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't start the test.");
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick} disabled={loading}>
      {loading ? "Starting..." : children}
    </Button>
  );
}
