import { requireParent } from "@/lib/auth/guards";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/parent/dashboard", label: "Dashboard", icon: "Home" },
  { href: "/parent/progress", label: "Progress & Reports", icon: "LineChart" },
  { href: "/parent/assign", label: "Assign Work", icon: "ClipboardList" },
  { href: "/parent/results", label: "Assignment Results", icon: "ListChecks" },
  { href: "/parent/print", label: "Print Resources", icon: "Printer" },
  { href: "/parent/flagged-questions", label: "Flagged Questions", icon: "Flag" },
  { href: "/parent/settings", label: "Settings", icon: "Settings" },
];

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const { parentProfile } = await requireParent();

  return (
    <DashboardShell navItems={navItems} userLabel={parentProfile.fullName} userSubLabel="Parent account">
      {children}
    </DashboardShell>
  );
}
