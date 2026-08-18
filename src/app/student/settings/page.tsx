import { AccessibilityControls } from "@/components/accessibility/accessibility-controls";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default function StudentSettingsPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>
      <ChangePasswordForm />
      <AccessibilityControls />
    </div>
  );
}
