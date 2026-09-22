"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/** Lettered A-D answer options. Once `correctIndex` is known (practice
 * feedback) the right option turns green and a wrong pick turns red. */
export function OptionList({
  options,
  selected,
  onSelect,
  disabled,
  correctIndex,
}: {
  options: string[];
  selected: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
  correctIndex?: number | null;
}) {
  const revealed = correctIndex !== undefined && correctIndex !== null;
  return (
    <div className="space-y-2" role="radiogroup">
      {options.map((opt, i) => {
        const isSelected = selected === i;
        const isCorrect = revealed && i === correctIndex;
        const isWrongPick = revealed && isSelected && i !== correctIndex;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(i)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors",
              !revealed && (isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border hover:border-primary/50"),
              isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950",
              isWrongPick && "border-destructive bg-destructive/5",
              revealed && !isCorrect && !isWrongPick && "border-border opacity-60",
              disabled && !revealed && "cursor-not-allowed opacity-70"
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                isSelected && !revealed && "border-primary bg-primary text-primary-foreground"
              )}
            >
              {LETTERS[i]}
            </span>
            <span className="flex-1 pt-0.5">{opt}</span>
            {isCorrect && <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-600" />}
            {isWrongPick && <XCircle className="mt-0.5 size-4.5 shrink-0 text-destructive" />}
          </button>
        );
      })}
    </div>
  );
}

export function optionLetter(index: number | null): string {
  return index === null ? "—" : LETTERS[index];
}
