"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Sparkles, Home, Trophy, LineChart, Settings, ClipboardList, Printer, Menu, X, Users, BookOpen, KeyRound, FileText, AlertTriangle, Flag, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Server Components can't pass component references (functions) as props to
// Client Components — only serialisable data crosses that boundary. Nav
// items therefore carry an icon *name*, resolved to a component here.
const NAV_ICONS: Record<string, LucideIcon> = { Home, Trophy, LineChart, Settings, ClipboardList, Printer, Users, BookOpen, KeyRound, FileText, AlertTriangle, Flag };

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof NAV_ICONS;
}

// Declared outside DashboardShell — a component defined inside another
// component's body is recreated (and remounted) every render, which resets
// its internal state and defeats reconciliation for no benefit here.
function NavLinks({ navItems, pathname }: { navItems: NavItem[]; pathname: string | null }) {
  return (
    <nav className="flex-1 space-y-1 px-3">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        const Icon = NAV_ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/30"
                : "text-sidebar-foreground/80 hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  navItems,
  userLabel,
  userSubLabel,
  headerAccessory,
  children,
}: {
  navItems: NavItem[];
  userLabel: string;
  userSubLabel?: string;
  headerAccessory?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes (e.g. a nav link was
  // tapped) — adjusted during render rather than in an Effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileNavOpen(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <Link href="/" className="flex items-center gap-2 px-5 py-5 font-heading text-lg font-bold">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-sm">
            <Sparkles className="size-4.5" />
          </span>
          <span className="text-gradient-brand">KaeLex Academy</span>
        </Link>
        <NavLinks navItems={navItems} pathname={pathname} />
        <div className="p-3">
          <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground/80" onClick={handleLogout}>
            <LogOut className="size-4.5" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
          <aside className="relative flex w-64 max-w-[80vw] flex-col border-r bg-sidebar text-sidebar-foreground">
            <div className="flex items-center justify-between px-5 py-5">
              <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
                <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-sm">
                  <Sparkles className="size-4.5" />
                </span>
                <span className="text-gradient-brand">KaeLex Academy</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
                <X className="size-5" />
              </Button>
            </div>
            <NavLinks navItems={navItems} pathname={pathname} />
            <div className="p-3">
              <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground/80" onClick={handleLogout}>
                <LogOut className="size-4.5" />
                Log out
              </Button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:px-8">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
            <div>
              <p className="font-heading text-sm font-semibold">{userLabel}</p>
              {userSubLabel && <p className="text-xs text-muted-foreground">{userSubLabel}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {headerAccessory}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={handleLogout} aria-label="Log out">
              <LogOut className="size-4.5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
