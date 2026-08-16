import { requireStudent } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default async function BadgesPage() {
  const { studentProfile } = await requireStudent();
  const [allBadges, earned] = await Promise.all([
    db.badge.findMany(),
    db.studentBadge.findMany({ where: { studentId: studentProfile.id } }),
  ]);
  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Badges</h1>
        <p className="text-muted-foreground">
          {earned.length} of {allBadges.length} unlocked
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {allBadges.map((badge) => {
          const isEarned = earnedMap.has(badge.id);
          const Icon = (Icons[badge.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Award;
          return (
            <Card key={badge.id} className={cn("transition", !isEarned && "opacity-50 grayscale")}>
              <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
                <div className={cn("flex size-14 items-center justify-center rounded-2xl", isEarned ? "bg-accent/20" : "bg-muted")}>
                  <Icon className={cn("size-7", isEarned ? "text-accent" : "text-muted-foreground")} />
                </div>
                <p className="font-heading text-sm font-semibold">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
