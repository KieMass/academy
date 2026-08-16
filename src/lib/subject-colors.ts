/**
 * Maps the `color` token in each curriculum map JSON file to Tailwind
 * classes. Written as full literal class strings (not template-interpolated)
 * so Tailwind's compiler can see and generate them.
 */
export const SUBJECT_COLOR_CLASSES: Record<string, { bg: string; text: string; ring: string }> = {
  blue: { bg: "bg-sky-100 dark:bg-sky-950", text: "text-sky-600 dark:text-sky-400", ring: "ring-sky-500/20" },
  amber: { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" },
  violet: { bg: "bg-violet-100 dark:bg-violet-950", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-500/20" },
  rose: { bg: "bg-rose-100 dark:bg-rose-950", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/20" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20" },
  orange: { bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-600 dark:text-orange-400", ring: "ring-orange-500/20" },
  teal: { bg: "bg-teal-100 dark:bg-teal-950", text: "text-teal-600 dark:text-teal-400", ring: "ring-teal-500/20" },
  cyan: { bg: "bg-cyan-100 dark:bg-cyan-950", text: "text-cyan-600 dark:text-cyan-400", ring: "ring-cyan-500/20" },
};

export function subjectColorClasses(color: string) {
  return SUBJECT_COLOR_CLASSES[color] ?? SUBJECT_COLOR_CLASSES.blue;
}
