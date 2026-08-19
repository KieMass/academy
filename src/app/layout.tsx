import type { Metadata } from "next";
import { Geist, Geist_Mono, Baloo_2 } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { AccessibilityShell } from "@/components/providers/accessibility-shell";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser } from "@/lib/auth/session";
import { DEFAULT_COLOR_SCHEME, isValidColorScheme } from "@/lib/theme/color-schemes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KaeLex Academy",
  description: "A learning platform built around your child's curriculum — maths, reading, grammar, spelling and more.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Read the account's chosen colour scheme server-side so the very first
  // paint already has it — applying it client-side only (e.g. from a
  // zustand store like the accessibility prefs) would flash the default
  // palette first on every full page load.
  const user = await getCurrentUser();
  const colorScheme = user && isValidColorScheme(user.colorScheme) ? user.colorScheme : DEFAULT_COLOR_SCHEME;

  return (
    <html
      lang="en"
      data-theme-color={colorScheme}
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AccessibilityShell>
          <QueryProvider>{children}</QueryProvider>
        </AccessibilityShell>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
