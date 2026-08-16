import Link from "next/link";
import { Sparkles } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const as = params.as === "parent" ? "parent" : "student";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
        <Sparkles className="size-6" />
        KaeLex Academy
      </Link>
      <LoginForm defaultTab={as} />
    </div>
  );
}
