import { requireLearner } from "@/lib/auth/guards";
import { LF1_SYLLABUS } from "@/lib/lf1/bank";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const NAV_ITEMS: NavItem[] = [
  { href: "/lf1/dashboard", label: "Dashboard", icon: "Home" },
  { href: "/lf1/practice", label: "Practice", icon: "BookOpen" },
  { href: "/lf1/mock", label: "Mock exam", icon: "FileText" },
  { href: "/lf1/history", label: "History", icon: "ListChecks" },
];

export const metadata = { title: "LF1 Study" };

export default async function Lf1Layout({ children }: { children: React.ReactNode }) {
  const { learnerProfile } = await requireLearner();

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      brandLabel="LF1 Study"
      logoutHref="/lf1/login"
      userLabel={`Hi, ${learnerProfile.displayName}`}
      userSubLabel={`CII ${LF1_SYLLABUS.code} · ${LF1_SYLLABUS.title}`}
    >
      {children}
    </DashboardShell>
  );
}
