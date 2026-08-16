import { requireParent } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddStudentForm } from "@/components/parent/add-student-form";
import { AccessibilityControls } from "@/components/accessibility/accessibility-controls";

export default async function ParentSettingsPage() {
  const { user, parentProfile } = await requireParent();
  const students = await db.studentProfile.findMany({ where: { parentId: parentProfile.id }, orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{parentProfile.fullName}</p>
          <p>{user.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Student accounts</CardTitle>
          <AddStudentForm />
        </CardHeader>
        <CardContent className="space-y-2">
          {students.length === 0 && <p className="text-sm text-muted-foreground">No students added yet.</p>}
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.avatarEmoji}</span>
                <div>
                  <p className="font-medium">{s.displayName}</p>
                  <p className="text-xs text-muted-foreground">Year {s.yearGroup.replace("Y", "")} · Level {s.levelNumber}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <AccessibilityControls />
    </div>
  );
}
