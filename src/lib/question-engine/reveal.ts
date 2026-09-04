import type { AnyQuestion, QuestionResponse } from "./types";

/** Produces a human-readable "correct answer" for immediate feedback and for
 * printed worksheet answer sheets — the two places a graded answer needs to
 * be displayed to a human rather than compared programmatically. */
export function revealAnswer(q: AnyQuestion): string {
  switch (q.type) {
    case "multiple_choice":
      return q.options.find((o) => o.id === q.correctOptionId)?.text ?? "";
    case "fill_in_box":
      return q.blanks.map((b) => b.acceptedAnswers[0]).join(", ");
    case "multi_step":
      return q.steps.map((s, i) => `${i + 1}. ${s.acceptedAnswers[0]}`).join("  ");
    case "drag_drop": {
      const itemLabel = (id: string) => q.items.find((i) => i.id === id)?.label ?? id;
      const targetLabel = (id: string) => q.targets.find((t) => t.id === id)?.label ?? id;
      return Object.entries(q.correctMapping)
        .map(([itemId, targetId]) => `${itemLabel(itemId)} → ${targetLabel(targetId)}`)
        .join("; ");
    }
    case "matching":
      return q.pairs.map((p) => `${p.left} → ${p.right}`).join("; ");
    case "short_answer":
      return q.acceptedAnswers[0];
  }
}

/** Produces a human-readable rendering of what a student actually submitted
 * — the counterpart to revealAnswer(), used on the parent results review
 * page (see app/parent/results) to show "their answer" next to "the correct
 * answer". Mirrors revealAnswer()'s shape per question type. A response
 * whose `type` doesn't match the question (shouldn't happen — /api/attempts
 * rejects that combination before grading) falls back to a placeholder
 * rather than throwing, since this only ever renders historical data. */
export function formatResponse(q: AnyQuestion, response: QuestionResponse | null): string {
  if (!response || response.type !== q.type) return "(no answer)";
  switch (q.type) {
    case "multiple_choice": {
      const r = response as Extract<QuestionResponse, { type: "multiple_choice" }>;
      return q.options.find((o) => o.id === r.optionId)?.text ?? "(no answer)";
    }
    case "fill_in_box": {
      const r = response as Extract<QuestionResponse, { type: "fill_in_box" }>;
      return q.blanks.map((b) => r.values[b.id] || "—").join(", ");
    }
    case "multi_step": {
      const r = response as Extract<QuestionResponse, { type: "multi_step" }>;
      return q.steps.map((s, i) => `${i + 1}. ${r.values[s.id] || "—"}`).join("  ");
    }
    case "drag_drop": {
      const r = response as Extract<QuestionResponse, { type: "drag_drop" }>;
      const itemLabel = (id: string) => q.items.find((i) => i.id === id)?.label ?? id;
      const targetLabel = (id: string) => q.targets.find((t) => t.id === id)?.label ?? id;
      const entries = Object.entries(r.mapping);
      return entries.length ? entries.map(([itemId, targetId]) => `${itemLabel(itemId)} → ${targetLabel(targetId)}`).join("; ") : "(no answer)";
    }
    case "matching": {
      const r = response as Extract<QuestionResponse, { type: "matching" }>;
      const entries = Object.entries(r.pairs);
      if (!entries.length) return "(no answer)";
      return entries
        .map(([leftId, rightId]) => {
          const left = q.pairs.find((p) => p.id === leftId)?.left ?? leftId;
          const right = q.pairs.find((p) => p.id === rightId)?.right ?? rightId;
          return `${left} → ${right}`;
        })
        .join("; ");
    }
    case "short_answer": {
      const r = response as Extract<QuestionResponse, { type: "short_answer" }>;
      return r.value || "(no answer)";
    }
  }
}
