import type { AnyQuestion } from "./types";

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
