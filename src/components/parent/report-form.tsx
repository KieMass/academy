"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";

const PERIODS = [
  { value: "WEEK", label: "Weekly (last 7 days)" },
  { value: "FORTNIGHT", label: "Fortnightly (last 14 days)" },
  { value: "MONTH", label: "Monthly (last 30 days)" },
] as const;

export function ReportForm({ studentId }: { studentId: string }) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["value"]>("WEEK");
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    // Open the tab synchronously, within the click gesture — opening it
    // after the awaits below would fall outside the trusted user-gesture
    // window and most browsers silently block the popup.
    const pdfWindow = window.open("", "_blank");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, period }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        pdfWindow?.close();
        toast.error(data.error ?? "Couldn't generate the report.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (pdfWindow) {
        pdfWindow.location.href = url;
      } else {
        window.open(url, "_blank");
      }
      toast.success("Report ready — opened in a new tab.");
    } catch {
      pdfWindow?.close();
      toast.error("Couldn't generate the report.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select items={PERIODS.map((p) => ({ value: p.value, label: p.label }))} value={period} onValueChange={(v) => v && setPeriod(v as typeof period)}>
        <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
        <SelectContent>
          {PERIODS.map((p) => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" className="gap-2" onClick={handleGenerate} disabled={generating}>
        <FileText className="size-4" />
        {generating ? "Generating..." : "Print report"}
      </Button>
    </div>
  );
}
