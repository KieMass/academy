import { requireAdmin } from "@/lib/auth/guards";
import { formatYearGroup } from "@/lib/curriculum/label";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DismissContentGapButton } from "@/components/admin/dismiss-content-gap-button";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  PENDING: "default",
  DISMISSED: "outline",
};

export default async function AdminContentGapsPage() {
  await requireAdmin();

  const alerts = await db.contentGapAlert.findMany({
    include: { topic: { include: { subject: true, curriculum: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const pendingCount = alerts.filter((a) => a.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Content gap alerts</h1>
        <p className="text-muted-foreground">
          {pendingCount} area{pendingCount === 1 ? "" : "s"} where students are cycling through the question pool
          heavily — a sign it&apos;s time to seed more questions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All alerts</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Subject</th>
                <th className="pb-2 pl-4 font-medium">Curriculum</th>
                <th className="pb-2 pl-4 font-medium">Strand</th>
                <th className="pb-2 pl-4 font-medium">Year</th>
                <th className="pb-2 pl-4 font-medium">Pool size</th>
                <th className="pb-2 pl-4 font-medium">Attempts</th>
                <th className="pb-2 pl-4 font-medium">Status</th>
                <th className="pb-2 pl-4 font-medium">Flagged</th>
                <th className="pb-2 pl-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium">{a.topic.subject.name}</td>
                  <td className="py-2.5 pl-4 text-muted-foreground">{a.topic.curriculum?.name ?? "—"}</td>
                  <td className="py-2.5 pl-4">{a.topic.strandName}</td>
                  <td className="py-2.5 pl-4 text-muted-foreground">{formatYearGroup(a.topic.yearGroup, a.topic.curriculum?.yearGroupLabel)}</td>
                  <td className="py-2.5 pl-4 text-muted-foreground">{a.questionCount} questions</td>
                  <td className="py-2.5 pl-4 text-muted-foreground">
                    {a.attemptCount} ({(a.attemptCount / a.questionCount).toFixed(1)}x per question)
                  </td>
                  <td className="py-2.5 pl-4">
                    <Badge variant={STATUS_VARIANT[a.status]} className="capitalize">{a.status.toLowerCase()}</Badge>
                  </td>
                  <td className="py-2.5 pl-4 text-muted-foreground">
                    {a.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-2.5 pl-4 text-right">
                    {a.status === "PENDING" && (
                      <DismissContentGapButton alertId={a.id} topicLabel={`${a.topic.subject.name} — ${a.topic.strandName} (${formatYearGroup(a.topic.yearGroup, a.topic.curriculum?.yearGroupLabel)})`} />
                    )}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-muted-foreground">No content gaps flagged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
