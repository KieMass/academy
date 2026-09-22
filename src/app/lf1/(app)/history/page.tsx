import { requireLearner } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { TestHistoryTable } from "@/components/lf1/test-history-table";

export default async function Lf1HistoryPage() {
  const { learnerProfile } = await requireLearner();
  const rows = await db.lf1TestSession.findMany({ where: { learnerId: learnerProfile.id }, orderBy: { startedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Test history</h1>
        <p className="text-sm text-muted-foreground">Every practice set and mock exam you&apos;ve started. Open one to review the answers.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <TestHistoryTable rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
