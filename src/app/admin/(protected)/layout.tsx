import { requireAdmin } from "@/lib/auth/guards";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "Home" },
  { href: "/admin/users", label: "Users", icon: "Users" },
  { href: "/admin/subjects", label: "Subjects", icon: "BookOpen" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <DashboardShell navItems={navItems} userLabel={user.email ?? "Admin"} userSubLabel="Admin account">
      {children}
    </DashboardShell>
  );
}
