import { requireAdmin } from "@/lib/auth/guards";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default async function AdminSettingsPage() {
  const { user } = await requireAdmin();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
