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
        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
          <Sparkles className="size-6" />
          KaeLex Academy
        </Link>
        <Button variant="outline" render={<Link href="/login">Log in</Link>} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            Aligned to the UK Key Stage 2 curriculum
          </span>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
            Learning built around{" "}
            <span className="text-gradient-brand">your child&apos;s curriculum</span>
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Maths, reading, grammar and spelling practice aligned to the UK curriculum, featuring PUMA-style maths,
            PIRA-style reading and GAPS-style grammar activities, with instant feedback and real progress tracking
            for parents. Detailed progress insights help parents identify strengths, spot learning gaps early, and
            support their child&apos;s development with confidence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25" render={<Link href="/login?as=student">I&apos;m a student</Link>} />
            <Button size="lg" variant="secondary" className="rounded-full px-8" render={<Link href="/login?as=parent">I&apos;m a parent</Link>} />
          </div>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Calculator, label: "Maths", color: "text-sky-500", ring: "ring-sky-500/20", bg: "bg-sky-500/10" },
            { icon: BookOpen, label: "Reading", color: "text-amber-500", ring: "ring-amber-500/20", bg: "bg-amber-500/10" },
            { icon: PenTool, label: "Grammar", color: "text-violet-500", ring: "ring-violet-500/20", bg: "bg-violet-500/10" },
            { icon: SpellCheck, label: "Spelling", color: "text-rose-500", ring: "ring-rose-500/20", bg: "bg-rose-500/10" },
          ].map(({ icon: Icon, label, color, ring, bg }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`flex size-14 items-center justify-center rounded-2xl ring-4 ${bg} ${ring}`}>
                <Icon className={`size-7 ${color}`} />
              </div>
              <span className="font-heading font-semibold">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-full border bg-card/60 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
          <Trophy className="size-4 text-accent" />
          Badges, XP and streaks keep practice motivating — not just another worksheet.
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
        Content aligned to the UK Key Stage 2 curriculum.
      </footer>
    </div>
  );
}
