import { requireAdmin } from "@/lib/auth/guards";
import { DEFAULT_YEAR_GROUP_LABEL } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResetPasswordButton } from "@/components/admin/reset-password-button";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  PARENT: "secondary",
  STUDENT: "outline",
};

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await db.user.findMany({
    include: {
      parentProfile: { include: { family: { include: { parents: true, curriculum: true } } } },
      studentProfile: { include: { parent: { include: { family: { include: { parents: true, curriculum: true } } } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">{users.length} registered account{users.length === 1 ? "" : "s"}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All accounts</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 pl-4 font-medium">Role</th>
                <th className="pb-2 pl-4 font-medium">Curriculum</th>
                <th className="pb-2 pl-4 font-medium">Login</th>
                <th className="pb-2 pl-4 font-medium">Joined</th>
                <th className="pb-2 pl-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const name =
                  u.role === "PARENT" ? (u.parentProfile?.fullName ?? "—") :
                  u.role === "STUDENT" ? (u.studentProfile?.displayName ?? "—") :
                  "Admin";
                const login = u.email ?? u.username ?? "—";
                const familyParents = u.role === "STUDENT" ? u.studentProfile?.parent.family.parents : undefined;
                const curriculum =
                  u.role === "PARENT" ? u.parentProfile?.family.curriculum :
                  u.role === "STUDENT" ? u.studentProfile?.parent.family.curriculum :
                  undefined;
                const yearGroupLabel = curriculum?.yearGroupLabel ?? DEFAULT_YEAR_GROUP_LABEL;
                return (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">
                      {name}
                      {familyParents && familyParents.length > 0 && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          Parent{familyParents.length > 1 ? "s" : ""}: {familyParents.map((p) => p.fullName).join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pl-4">
                      <Badge variant={ROLE_VARIANT[u.role]} className="capitalize">{u.role.toLowerCase()}</Badge>
                    </td>
                    <td className="py-2.5 pl-4 text-muted-foreground">{curriculum?.name ?? "—"}</td>
                    <td className="py-2.5 pl-4 text-muted-foreground">{login}</td>
                    <td className="py-2.5 pl-4 text-muted-foreground">
                      {u.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-2.5 pl-4">
                      <div className="flex justify-end gap-2">
                        <EditUserDialog
                          user={
                            u.role === "PARENT" ? { id: u.id, role: "PARENT", fullName: u.parentProfile!.fullName, email: u.email! } :
                            u.role === "STUDENT" ? { id: u.id, role: "STUDENT", displayName: u.studentProfile!.displayName, username: u.username!, yearGroup: u.studentProfile!.yearGroup, avatarEmoji: u.studentProfile!.avatarEmoji, yearGroupLabel } :
                            { id: u.id, role: "ADMIN", email: u.email! }
                          }
                        />
                        <ResetPasswordButton userId={u.id} userLabel={name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">No users yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
