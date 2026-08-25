import { requireParent } from "@/lib/auth/guards";
import { formatYearGroup } from "@/lib/curriculum/label";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AddStudentForm } from "@/components/parent/add-student-form";
import { AddCoParentForm } from "@/components/parent/add-coparent-form";
import { ChangeStudentPasswordButton } from "@/components/parent/change-student-password-button";
import { EditStudentDialog } from "@/components/parent/edit-student-dialog";
import { ChangeFamilyCurriculumDialog } from "@/components/parent/change-family-curriculum-dialog";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { AccessibilityControls } from "@/components/accessibility/accessibility-controls";
import { ColorSchemePicker } from "@/components/theme/color-scheme-picker";
import { DEFAULT_CURRICULUM_SLUG } from "@/lib/auth/session";

export default async function ParentSettingsPage() {
  const { user, parentProfile, yearGroupLabel } = await requireParent();
  const currentCurriculum = parentProfile.family.curriculum;
  const currentCurriculumSlug = currentCurriculum?.slug ?? DEFAULT_CURRICULUM_SLUG;
  const currentCurriculumName = currentCurriculum?.name ?? "Cayman Islands";
  const students = await db.studentProfile.findMany({ where: { parent: { familyId: parentProfile.familyId } }, orderBy: { createdAt: "asc" } });
  const familyParents = await db.parentProfile.findMany({ where: { familyId: parentProfile.familyId }, include: { user: true }, orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="account">
        <TabsList className="w-full">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{parentProfile.fullName}</p>
              <p>{user.email}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Family</CardTitle>
                <CardDescription>Every parent below has full access to all your students.</CardDescription>
              </div>
              <AddCoParentForm />
            </CardHeader>
            <CardContent className="space-y-2">
              {familyParents.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border px-4 py-3">
                  <div>
                    <p className="font-medium">
                      {p.fullName}
                      {p.id === parentProfile.id && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.user.email}</p>
                  </div>
                  {familyParents.length === 1 && <Badge variant="outline">Only parent</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Curriculum</CardTitle>
                <CardDescription>Applies to every student in your family — change it if you&apos;ve relocated to a different country.</CardDescription>
              </div>
              <ChangeFamilyCurriculumDialog currentSlug={currentCurriculumSlug} currentName={currentCurriculumName} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                <p className="font-medium">{currentCurriculumName}</p>
                <Badge variant="outline">Currently following</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="pt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Student accounts</CardTitle>
              <AddStudentForm yearGroupLabel={yearGroupLabel} />
            </CardHeader>
            <CardContent className="space-y-2">
              {students.length === 0 && <p className="text-sm text-muted-foreground">No students added yet.</p>}
              {students.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.avatarEmoji}</span>
                    <div>
                      <p className="font-medium">{s.displayName}</p>
                      <p className="text-xs text-muted-foreground">{formatYearGroup(s.yearGroup, yearGroupLabel)} · Level {s.levelNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <EditStudentDialog student={{ id: s.id, displayName: s.displayName, yearGroup: s.yearGroup, avatarEmoji: s.avatarEmoji }} yearGroupLabel={yearGroupLabel} />
                    <ChangeStudentPasswordButton studentId={s.id} studentName={s.displayName} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 pt-4">
          <ColorSchemePicker initialScheme={user.colorScheme} />
          <AccessibilityControls />
        </TabsContent>

        <TabsContent value="security" className="pt-4">
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
