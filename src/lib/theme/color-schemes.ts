/**
 * Named colour schemes a user can pick for their account. Each scheme is
 * just a primary/accent hue pair — every other derived colour (secondary,
 * sidebar, focus ring, etc.) follows the same formula as the default
 * "ocean" palette in globals.css, just rotated to these hues, so contrast
 * and legibility stay consistent across every choice.
 *
 * `swatchPrimary`/`swatchAccent` are plain hex values used only for the
 * picker UI itself (rendering swatches server-side without needing the
 * scheme's CSS block to be active) — the real in-app colours come from the
 * oklch CSS variables in globals.css, keyed by `html[data-theme-color]`.
 *
 * Persisted on User.colorScheme (a plain string, not a DB enum) — add a new
 * entry here plus its CSS block in globals.css to introduce another scheme,
 * no migration required.
 */
export interface ColorScheme {
  id: string;
  label: string;
  swatchPrimary: string;
  swatchAccent: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  { id: "ocean", label: "Ocean", swatchPrimary: "#1f8a8c", swatchAccent: "#e8a15c" },
  { id: "sunset", label: "Sunset", swatchPrimary: "#d97a3f", swatchAccent: "#e37a9a" },
  { id: "forest", label: "Forest", swatchPrimary: "#3f8f5c", swatchAccent: "#c9a63e" },
  { id: "berry", label: "Berry", swatchPrimary: "#c94f8a", swatchAccent: "#9b6fd9" },
  { id: "sky", label: "Sky", swatchPrimary: "#3f7fd9", swatchAccent: "#3fb5c9" },
  { id: "grape", label: "Grape", swatchPrimary: "#7c5fc9", swatchAccent: "#d95fa8" },
];

export const DEFAULT_COLOR_SCHEME = "ocean";

export function isValidColorScheme(id: string): boolean {
  return COLOR_SCHEMES.some((s) => s.id === id);
}
