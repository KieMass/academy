import { requireStudent } from "@/lib/auth/guards";
import { formatYearGroup } from "@/lib/curriculum/label";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

const navItems: NavItem[] = [
  { href: "/student/dashboard", label: "Today's Tasks", icon: "Home" },
  { href: "/student/badges", label: "Badges", icon: "Trophy" },
  { href: "/student/progress", label: "My Progress", icon: "LineChart" },
  { href: "/student/settings", label: "Settings", icon: "Settings" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { studentProfile, yearGroupLabel } = await requireStudent();

  return (
    <DashboardShell
      navItems={navItems}
      userLabel={`Hi, ${studentProfile.displayName} ${studentProfile.avatarEmoji}`}
      userSubLabel={`${formatYearGroup(studentProfile.yearGroup, yearGroupLabel)} · Level ${studentProfile.levelNumber}`}
      headerAccessory={
        <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
          <Flame className="size-3.5 text-accent" />
          {studentProfile.streakDays} day streak
        </Badge>
      }
    >
      {children}
    </DashboardShell>
  );
}
