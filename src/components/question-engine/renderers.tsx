"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { PublicQuestion, QuestionResponse } from "@/lib/question-engine/types";
import { Check, X } from "lucide-react";
import { createRng, shuffle } from "@/lib/content-generators/rng";

/** Cheap deterministic string hash — used to seed the matching-question
 * shuffle from `question.id` so the order is stable across re-renders
 * without calling `Math.random()` during render (React purity rule). */
function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return h;
}

/** Shared props every per-type renderer implements. `feedback` is only set
 * after the question has been submitted and graded — renderers use it to
 * highlight right/wrong choices instead of re-deriving correctness (which
 * they cannot do, since the client never receives the answer key). */
interface RendererProps<Q extends PublicQuestion, R extends QuestionResponse> {
  question: Q;
  response: R | null;
  onChange: (response: R) => void;
  disabled: boolean;
  feedback: { correct: boolean; correctAnswer: string } | null;
}

function optionStateClasses(selected: boolean, disabled: boolean, feedback: RendererProps<never, never>["feedback"], isThisCorrectText: boolean) {
  if (!disabled) return selected ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border hover:border-primary/50";
  if (!feedback) return "border-border";
  if (isThisCorrectText) return "border-emerald-500 bg-emerald-50 dark:bg-emerald-950";
  if (selected) return "border-destructive bg-destructive/5";
  return "border-border opacity-60";
}

export function MultipleChoiceRenderer({ question, response, onChange, disabled, feedback }: RendererProps<Extract<PublicQuestion, { type: "multiple_choice" }>, Extract<QuestionResponse, { type: "multiple_choice" }>>) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {question.options.map((opt) => {
        const selected = response?.optionId === opt.id;
        const isCorrectText = !!feedback && feedback.correctAnswer === opt.text;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ type: "multiple_choice", optionId: opt.id })}
            className={cn(
              "flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition disabled:cursor-not-allowed",
              optionStateClasses(selected, disabled, feedback, isCorrectText)
            )}
          >
            {opt.text}
            {disabled && isCorrectText && <Check className="size-4 text-emerald-600" />}
            {disabled && selected && !isCorrectText && <X className="size-4 text-destructive" />}
          </button>
        );
      })}
    </div>
  );
}

export function ShortAnswerRenderer({ response, onChange, disabled, feedback }: RendererProps<Extract<PublicQuestion, { type: "short_answer" }>, Extract<QuestionResponse, { type: "short_answer" }>>) {
  return (
    <div className="space-y-2">
      <Input
        value={response?.value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange({ type: "short_answer", value: e.target.value })}
        placeholder="Type your answer..."
        className="max-w-sm text-base"
      />
      {feedback && !feedback.correct && (
        <p className="text-sm text-muted-foreground">
          Correct answer: <span className="font-semibold text-foreground">{feedback.correctAnswer}</span>
        </p>
      )}
    </div>
  );
}

export function FillInBoxRenderer({ question, response, onChange, disabled, feedback }: RendererProps<Extract<PublicQuestion, { type: "fill_in_box" }>, Extract<QuestionResponse, { type: "fill_in_box" }>>) {
  const values = response?.values ?? {};
  return (
    <div className="space-y-3">
      {question.blanks.map((blank, i) => (
        <div key={blank.id} className="flex items-center gap-2">
          {blank.label && <span className="text-sm text-muted-foreground">{blank.label}</span>}
          <Input
            value={values[blank.id] ?? ""}
            disabled={disabled}
            onChange={(e) => onChange({ type: "fill_in_box", values: { ...values, [blank.id]: e.target.value } })}
            placeholder={question.blanks.length > 1 ? `Answer ${i + 1}` : "Your answer"}
            className="max-w-[10rem] text-base"
          />
        </div>
      ))}
      {feedback && !feedback.correct && (
        <p className="text-sm text-muted-foreground">
          Correct answer: <span className="font-semibold text-foreground">{feedback.correctAnswer}</span>
        </p>
      )}
    </div>
  );
}

export function MultiStepRenderer({ question, response, onChange, disabled, feedback }: RendererProps<Extract<PublicQuestion, { type: "multi_step" }>, Extract<QuestionResponse, { type: "multi_step" }>>) {
  const values = response?.values ?? {};
  return (
    <div className="space-y-4">
      {question.steps.map((step, i) => (
        <div key={step.id} className="space-y-1.5">
          <p className="text-sm font-medium">
            Step {i + 1}: {step.prompt}
          </p>
          <Input
            value={values[step.id] ?? ""}
            disabled={disabled}
            onChange={(e) => onChange({ type: "multi_step", values: { ...values, [step.id]: e.target.value } })}
            className="max-w-[12rem] text-base"
          />
        </div>
      ))}
      {feedback && !feedback.correct && (
        <p className="text-sm text-muted-foreground">
          Model answer: <span className="font-semibold text-foreground">{feedback.correctAnswer}</span>
        </p>
      )}
    </div>
  );
}

/** Click-to-assign matching: tap a left card, then tap the right card it
 * matches. Chosen over native HTML5 drag-and-drop for touch reliability. */
export function MatchingRenderer({ question, response, onChange, disabled, feedback }: RendererProps<Extract<PublicQuestion, { type: "matching" }>, Extract<QuestionResponse, { type: "matching" }>>) {
  const shuffledRight = useMemo(() => shuffle(createRng(hashSeed(question.id)), question.pairs), [question]);
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const pairs = response?.pairs ?? {};
  const assignedRightIds = new Set(Object.values(pairs));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Tap to select</p>
        {question.pairs.map((p) => {
          const isAssigned = pairs[p.id] !== undefined;
          const isCorrect = feedback && pairs[p.id] === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => setActiveLeft(p.id)}
              className={cn(
                "w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition disabled:cursor-not-allowed",
                activeLeft === p.id && !disabled ? "border-primary bg-primary/5" : "border-border",
                isAssigned && !disabled && "border-emerald-400",
                disabled && feedback && (isCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-destructive/60")
              )}
            >
              {p.left}
              {isAssigned && !disabled && <span className="ml-2 text-xs text-emerald-600">matched</span>}
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase">then tap the match</p>
        {shuffledRight.map((p) => {
          const used = assignedRightIds.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled || (used && pairs[activeLeft ?? ""] !== p.id)}
              onClick={() => {
                if (!activeLeft) return;
                onChange({ type: "matching", pairs: { ...pairs, [activeLeft]: p.id } });
                setActiveLeft(null);
              }}
              className={cn(
                "w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                "border-border hover:border-primary/50"
              )}
            >
              {p.right}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Click-to-assign drag & drop: tap an item chip, then tap the target bucket
 * it belongs in. Functions as "drag and drop" while staying touch-friendly. */
export function DragDropRenderer({ question, response, onChange, disabled, feedback }: RendererProps<Extract<PublicQuestion, { type: "drag_drop" }>, Extract<QuestionResponse, { type: "drag_drop" }>>) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const mapping = response?.mapping ?? {};

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {question.items.map((item) => {
          const placed = mapping[item.id] !== undefined;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => setActiveItem(item.id)}
              className={cn(
                "rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed",
                activeItem === item.id ? "border-primary bg-primary/10" : placed ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950" : "border-border"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {question.targets.map((target) => {
          const itemsHere = Object.entries(mapping)
            .filter(([, t]) => t === target.id)
            .map(([itemId]) => question.items.find((i) => i.id === itemId)?.label);
          return (
            <button
              key={target.id}
              type="button"
              disabled={disabled || !activeItem}
              onClick={() => {
                if (!activeItem) return;
                onChange({ type: "drag_drop", mapping: { ...mapping, [activeItem]: target.id } });
                setActiveItem(null);
              }}
              className="min-h-20 rounded-xl border-2 border-dashed border-border p-2 text-center transition hover:border-primary/50 disabled:cursor-not-allowed"
            >
              <p className="text-xs font-semibold text-muted-foreground">{target.label}</p>
              <p className="mt-1 text-sm font-medium">{itemsHere.filter(Boolean).join(", ")}</p>
            </button>
          );
        })}
      </div>
      {feedback && !feedback.correct && (
        <p className="text-sm text-muted-foreground">
          Correct groupings: <span className="font-semibold text-foreground">{feedback.correctAnswer}</span>
        </p>
      )}
    </div>
  );
}
