import { requireAdmin } from "@/lib/auth/guards";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { ColorSchemePicker } from "@/components/theme/color-scheme-picker";
import { RetentionSettingsForm } from "@/components/admin/retention-settings-form";
import { getRetentionSetting } from "@/lib/retention";

export default async function AdminSettingsPage() {
  const { user } = await requireAdmin();
  const retentionSetting = await getRetentionSetting();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <ColorSchemePicker initialScheme={user.colorScheme} />
      <RetentionSettingsForm initialMode={retentionSetting.mode} initialValue={retentionSetting.value} />
      <ChangePasswordForm />
    </div>
  );
}
