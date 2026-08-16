"use client";

import { useEffect } from "react";
import { useAccessibilityStore } from "@/store/accessibility-store";

/** Applies the persisted accessibility preferences to the <html> element on
 * every render. Mounted once near the root of the app. */
export function AccessibilityShell({ children }: { children: React.ReactNode }) {
  const { dyslexiaFont, fontScale, contrastMode } = useAccessibilityStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dyslexia-font", dyslexiaFont);
    root.classList.toggle("contrast-high", contrastMode === "high-contrast");
    root.style.setProperty("--a11y-font-scale", String(fontScale));
  }, [dyslexiaFont, fontScale, contrastMode]);

  return <>{children}</>;
}
