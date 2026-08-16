"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Accessibility preferences: dyslexia-friendly font, font scale, contrast
 * mode and read-aloud. Persisted client-side (localStorage) for instant
 * apply-on-load, and mirrored to StudentProfile.accessibilityPrefs server
 * side so preferences follow the student across devices.
 */
export type ContrastMode = "default" | "high-contrast";

interface AccessibilityState {
  dyslexiaFont: boolean;
  fontScale: number; // 1 = 100%, up to 1.5
  contrastMode: ContrastMode;
  readAloudEnabled: boolean;
  setDyslexiaFont: (v: boolean) => void;
  setFontScale: (v: number) => void;
  setContrastMode: (v: ContrastMode) => void;
  setReadAloudEnabled: (v: boolean) => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      dyslexiaFont: false,
      fontScale: 1,
      contrastMode: "default",
      readAloudEnabled: false,
      setDyslexiaFont: (v) => set({ dyslexiaFont: v }),
      setFontScale: (v) => set({ fontScale: v }),
      setContrastMode: (v) => set({ contrastMode: v }),
      setReadAloudEnabled: (v) => set({ readAloudEnabled: v }),
    }),
    { name: "rba-accessibility" }
  )
);

/** Speaks text aloud using the Web Speech API when read-aloud is enabled.
 * This is the seam future TTS providers (e.g. higher-quality cloud voices)
 * plug into — swap the implementation, keep the call sites. */
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
