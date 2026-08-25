/**
 * Formats a YearGroup enum value ("Y1"-"Y6") for display, using whichever
 * label a curriculum uses for it — "Year 5" for Cayman (UK-derived), "Grade
 * 5" for Guyana. Pure and dependency-free so it's safe to import from both
 * server components and "use client" components alike.
 *
 * Falls back to "Year" when no label is supplied (e.g. an admin view
 * spanning multiple curricula that hasn't resolved one yet), matching the
 * pre-multi-curriculum default.
 */
export function formatYearGroup(yearGroup: string, yearGroupLabel: string = "Year"): string {
  return `${yearGroupLabel} ${yearGroup.replace("Y", "")}`;
}
