"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            // /api/questions deliberately re-randomises its selection on
            // every call (see QuestionRunner's sessionSeed comment) — a
            // student's in-progress question set is tracked entirely by
            // local state (index, sessionResults, feedback), not by
            // anything re-derivable from a refetch. The default
            // refetchOnWindowFocus was silently swapping in a brand new
            // question set out from under an active session the moment
            // the screen turned back on (screen-off/on fires the same
            // focus/visibility event as tabbing away and back), leaving
            // local progress pointed at questions that no longer matched
            // what was on screen. Off by default for every query — no
            // query in this app wants "quietly replace what the user is
            // looking at" behaviour; a page that does want fresher data on
            // refocus should opt in explicitly per-query instead.
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
