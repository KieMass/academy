"use client";

import { useAccessibilityStore } from "@/store/accessibility-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Type, Contrast, Volume2, SpellCheck } from "lucide-react";

export function AccessibilityControls() {
  const { dyslexiaFont, fontScale, contrastMode, readAloudEnabled, setDyslexiaFont, setFontScale, setContrastMode, setReadAloudEnabled } =
    useAccessibilityStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Accessibility</CardTitle>
        <CardDescription>These preferences are saved on this device and apply across the whole app.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SpellCheck className="size-5 text-muted-foreground" />
            <div>
              <Label>Dyslexia-friendly font</Label>
              <p className="text-xs text-muted-foreground">Switches to a font with wider letter spacing.</p>
            </div>
          </div>
          <Button variant={dyslexiaFont ? "default" : "outline"} size="sm" onClick={() => setDyslexiaFont(!dyslexiaFont)}>
            {dyslexiaFont ? "On" : "Off"}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Type className="size-5 text-muted-foreground" />
            <div>
              <Label>Text size</Label>
              <p className="text-xs text-muted-foreground">Make text bigger across the app.</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 1.15, 1.3].map((scale) => (
              <Button key={scale} variant={fontScale === scale ? "default" : "outline"} size="sm" onClick={() => setFontScale(scale)}>
                {scale === 1 ? "A" : scale === 1.15 ? "A+" : "A++"}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Contrast className="size-5 text-muted-foreground" />
            <div>
              <Label>High contrast</Label>
              <p className="text-xs text-muted-foreground">Increases colour contrast for easier reading.</p>
            </div>
          </div>
          <Button
            variant={contrastMode === "high-contrast" ? "default" : "outline"}
            size="sm"
            onClick={() => setContrastMode(contrastMode === "high-contrast" ? "default" : "high-contrast")}
          >
            {contrastMode === "high-contrast" ? "On" : "Off"}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className={cn("size-5 text-muted-foreground")} />
            <div>
              <Label>Read questions aloud</Label>
              <p className="text-xs text-muted-foreground">Automatically reads each question using your device&apos;s voice.</p>
            </div>
          </div>
          <Button variant={readAloudEnabled ? "default" : "outline"} size="sm" onClick={() => setReadAloudEnabled(!readAloudEnabled)}>
            {readAloudEnabled ? "On" : "Off"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
