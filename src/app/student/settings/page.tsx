import { requireStudent } from "@/lib/auth/guards";
import { AccessibilityControls } from "@/components/accessibility/accessibility-controls";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { ColorSchemePicker } from "@/components/theme/color-scheme-picker";

export default async function StudentSettingsPage() {
  const { user } = await requireStudent();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>
      <ColorSchemePicker initialScheme={user.colorScheme} />
      <AccessibilityControls />
      <ChangePasswordForm />
    </div>
  );
}
