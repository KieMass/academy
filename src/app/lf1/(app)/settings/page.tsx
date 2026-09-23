import { requireLearner } from "@/lib/auth/guards";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { ColorSchemePicker } from "@/components/theme/color-scheme-picker";

export default async function Lf1SettingsPage() {
  const { user, learnerProfile } = await requireLearner();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          {learnerProfile.displayName} · username {user.username}
        </p>
      </div>
      <ColorSchemePicker initialScheme={user.colorScheme} />
      <ChangePasswordForm />
    </div>
  );
}
