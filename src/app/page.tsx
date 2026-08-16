import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { BookOpen, Calculator, PenTool, SpellCheck, Trophy, Sparkles } from "lucide-react";

export default async function Home() {
  const user = await getCurrentUser();
  if (user?.role === "PARENT") redirect("/parent/dashboard");
  if (user?.role === "STUDENT") redirect("/student/dashboard");

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
          <Sparkles className="size-6" />
          Red Bay Academy
        </div>
        <Button variant="outline" render={<Link href="/login">Log in</Link>} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
            Year 5 learning, built around{" "}
            <span className="text-primary">your child&apos;s curriculum</span>
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Maths, reading, grammar &amp; spelling practice aligned to the UK Key Stage 2 curriculum and Cayman
            Islands Year 5 expectations — with PUMA-style maths, PIRA-style reading and GAPS-style grammar practice,
            instant feedback, and real progress tracking for parents.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button size="lg" className="rounded-full px-8" render={<Link href="/login?as=student">I&apos;m a student</Link>} />
            <Button size="lg" variant="secondary" className="rounded-full px-8" render={<Link href="/login?as=parent">I&apos;m a parent</Link>} />
          </div>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Calculator, label: "Maths", color: "text-sky-500" },
            { icon: BookOpen, label: "Reading", color: "text-amber-500" },
            { icon: PenTool, label: "Grammar", color: "text-violet-500" },
            { icon: SpellCheck, label: "Spelling", color: "text-rose-500" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-6 shadow-sm">
              <Icon className={`size-8 ${color}`} />
              <span className="font-heading font-semibold">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="size-4 text-accent" />
          Badges, XP and streaks keep practice motivating — not just another worksheet.
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
        Built for Red Bay Primary School families. Content aligned to UK KS2 &amp; Cayman Islands Y5 expectations.
      </footer>
    </div>
  );
}
