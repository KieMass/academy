import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { useQueryClient, type DefaultOptions } from "@tanstack/react-query";
import { QueryProvider } from "@/components/providers/query-provider";

// Regression test for a real bug: a student's in-progress question set
// (tracked as local state in QuestionRunner) was getting silently replaced
// mid-session whenever a screen turned off and back on. That triggers the
// same focus/visibility event React Query's default refetchOnWindowFocus
// listens for, and /api/questions re-randomises its selection on every
// call — so the refetch swapped in different questions while local
// progress (index, sessionResults, feedback) still pointed at the old set.
// See src/components/providers/query-provider.tsx for the fix.
function CapturedClient({ onDefaults }: { onDefaults: (opts: DefaultOptions) => void }) {
  const client = useQueryClient();
  onDefaults(client.getDefaultOptions());
  return null;
}

describe("QueryProvider", () => {
  it("disables refetchOnWindowFocus by default for every query", () => {
    let captured: DefaultOptions | undefined;

    render(
      <QueryProvider>
        <CapturedClient onDefaults={(defaults) => (captured = defaults)} />
      </QueryProvider>
    );

    expect(captured).toBeDefined();
    expect(captured!.queries?.refetchOnWindowFocus).toBe(false);
  });
});
