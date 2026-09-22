import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { LearnerLoginForm } from "@/components/lf1/learner-login-form";

export const metadata = { title: "LF1 Study — Log in" };

export default async function Lf1LoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "LEARNER") redirect("/lf1/dashboard");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex items-center gap-2 font-heading text-xl font-bold text-gradient-brand">
        <GraduationCap className="size-6 text-primary" />
        LF1 Study
      </div>
      <LearnerLoginForm />
    </div>
  );
}
