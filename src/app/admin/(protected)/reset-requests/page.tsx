import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResetRequestActions } from "@/components/admin/reset-request-actions";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  PENDING: "default",
  FULFILLED: "secondary",
  DISMISSED: "outline",
};

export default async function AdminResetRequestsPage() {
  await requireAdmin();

  const requests = await db.passwordResetRequest.findMany({
    include: { user: { include: { parentProfile: true, studentProfile: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Password reset requests</h1>
        <p className="text-muted-foreground">
          {pendingCount} pending request{pendingCount === 1 ? "" : "s"} — submitted from the &quot;Forgot password?&quot; link on login.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All requests</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Submitted as</th>
                <th className="pb-2 pl-4 font-medium">Account</th>
                <th className="pb-2 pl-4 font-medium">Status</th>
                <th className="pb-2 pl-4 font-medium">Requested</th>
                <th className="pb-2 pl-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const name =
                  r.user?.parentProfile?.fullName ??
                  r.user?.studentProfile?.displayName ??
                  (r.user?.role === "ADMIN" ? "Admin" : null);
                const userLabel = name ?? r.identifier;
                return (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{r.identifier}</td>
                    <td className="py-2.5 pl-4 text-muted-foreground">
                      {r.user ? `${name} (${r.user.role.toLowerCase()})` : <span className="text-destructive/80">No matching account</span>}
                    </td>
                    <td className="py-2.5 pl-4">
                      <Badge variant={STATUS_VARIANT[r.status]} className="capitalize">{r.status.toLowerCase()}</Badge>
                    </td>
                    <td className="py-2.5 pl-4 text-muted-foreground">
                      {r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-2.5 pl-4">
                      {r.status === "PENDING" && (
                        <ResetRequestActions requestId={r.id} hasAccount={!!r.user} userLabel={userLabel} />
                      )}
                    </td>
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">No requests yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
