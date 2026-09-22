import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { rankByCurriculum, type RankedEntry } from "@/lib/leaderboards";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Activity, Trophy } from "lucide-react";

const TOP_N = 5;

function LeaderboardList({ rows, unit, emptyText }: { rows: RankedEntry[]; unit: string; emptyText: string }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-xs text-muted-foreground">{emptyText}</p>;
  }
  return (
    <ol className="space-y-1.5">
      {rows.slice(0, TOP_N).map((row, i) => (
        <li key={row.id} className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{row.label}</p>
            {row.sublabel && <p className="truncate text-xs text-muted-foreground">{row.sublabel}</p>}
          </div>
          <span className="shrink-0 font-semibold tabular-nums">{row.value.toLocaleString("en-GB")} <span className="font-normal text-muted-foreground">{unit}</span></span>
        </li>
      ))}
    </ol>
  );
}

export default async function AdminLeaderboardsPage() {
  await requireAdmin();

  const curricula = await db.curriculum.findMany({ orderBy: { name: "asc" } });

  // --- Top downloaders: parents ranked by worksheets generated ---
  // createdByParentId is nullable — only present on worksheets generated
  // since this field was added, so this starts sparse and fills in over
  // time rather than backfilling from history that was never captured.
  const worksheetCounts = await db.worksheet.groupBy({
    by: ["createdByParentId"],
    where: { createdByParentId: { not: null } },
    _count: { _all: true },
  });
  const downloaderParentIds = worksheetCounts.map((w) => w.createdByParentId!);
  const downloaderParents = downloaderParentIds.length
    ? await db.parentProfile.findMany({
        where: { id: { in: downloaderParentIds } },
        select: { id: true, fullName: true, family: { select: { curriculumId: true } } },
      })
    : [];
  const downloaderParentById = new Map(downloaderParents.map((p) => [p.id, p]));
  const downloadersByCurriculum = rankByCurriculum(
    worksheetCounts
      .map((w) => {
        const parent = downloaderParentById.get(w.createdByParentId!);
        if (!parent) return null;
        return { curriculumId: parent.family.curriculumId, id: parent.id, label: parent.fullName, value: w._count._all };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
  );

  // --- Top users: parents ranked by total practice attempts across all their students ---
  const attemptCounts = await db.questionAttempt.groupBy({ by: ["studentId"], _count: { _all: true } });
  const attemptStudentIds = attemptCounts.map((a) => a.studentId);
  const attemptStudents = attemptStudentIds.length
    ? await db.studentProfile.findMany({ where: { id: { in: attemptStudentIds } }, select: { id: true, parentId: true } })
    : [];
  const parentIdByStudentId = new Map(attemptStudents.map((s) => [s.id, s.parentId]));
  const attemptsByParentId = new Map<string, number>();
  for (const a of attemptCounts) {
    const parentId = parentIdByStudentId.get(a.studentId);
    if (!parentId) continue;
    attemptsByParentId.set(parentId, (attemptsByParentId.get(parentId) ?? 0) + a._count._all);
  }
  const userParentIds = [...attemptsByParentId.keys()];
  const userParents = userParentIds.length
    ? await db.parentProfile.findMany({
        where: { id: { in: userParentIds } },
        select: { id: true, fullName: true, family: { select: { curriculumId: true } } },
      })
    : [];
  const userParentById = new Map(userParents.map((p) => [p.id, p]));
  const usersByCurriculum = rankByCurriculum(
    [...attemptsByParentId.entries()]
      .map(([parentId, count]) => {
        const parent = userParentById.get(parentId);
        if (!parent) return null;
        return { curriculumId: parent.family.curriculumId, id: parentId, label: parent.fullName, value: count };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
  );

  // --- Top children: students ranked by XP, within their family's curriculum ---
  const students = await db.studentProfile.findMany({
    where: { xpTotal: { gt: 0 } },
    select: { id: true, displayName: true, avatarEmoji: true, xpTotal: true, levelNumber: true, parent: { select: { family: { select: { curriculumId: true } } } } },
    orderBy: { xpTotal: "desc" },
  });
  const childrenByCurriculum = rankByCurriculum(
    students.map((s) => ({
      curriculumId: s.parent.family.curriculumId,
      id: s.id,
      label: `${s.avatarEmoji} ${s.displayName}`,
      sublabel: `Level ${s.levelNumber}`,
      value: s.xpTotal,
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Leaderboards</h1>
        <p className="text-muted-foreground">Top {TOP_N} per country, by downloads, activity, and student XP.</p>
      </div>

      {curricula.map((c) => (
        <Card key={c.id}>
          <CardHeader>
            <CardTitle className="text-lg">{c.name}</CardTitle>
            <CardDescription>Top {TOP_N} in each category for this curriculum.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold"><Download className="size-4 text-primary" /> Top downloaders</h3>
              <LeaderboardList
                rows={downloadersByCurriculum.get(c.id) ?? []}
                unit="sheets"
                emptyText="No worksheet downloads recorded yet."
              />
            </div>
            <div className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold"><Activity className="size-4 text-primary" /> Top users</h3>
              <LeaderboardList
                rows={usersByCurriculum.get(c.id) ?? []}
                unit="attempts"
                emptyText="No practice activity recorded yet."
              />
            </div>
            <div className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold"><Trophy className="size-4 text-accent" /> Top children</h3>
              <LeaderboardList
                rows={childrenByCurriculum.get(c.id) ?? []}
                unit="XP"
                emptyText="No students have earned XP yet."
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <p className="text-xs text-muted-foreground">
        Downloads are tracked from the point this feature was introduced — worksheets generated before then aren&apos;t attributed to a parent.
      </p>
    </div>
  );
}
