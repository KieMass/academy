import { Calculator, BookOpen, PenTool, SpellCheck, FlaskConical, Landmark, Globe2, Laptop, type LucideIcon, GraduationCap } from "lucide-react";

/** Maps the `icon` string stored in each curriculum map JSON file to an
 * actual component. Add new subjects' icons here — nothing else needs to
 * change since the curriculum JSON already carries the icon name. */
const ICONS: Record<string, LucideIcon> = {
  Calculator,
  BookOpen,
  PenTool,
  SpellCheck,
  FlaskConical,
  Landmark,
  Globe2,
  Laptop,
};

export function SubjectIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? GraduationCap;
  return <Icon className={className} />;
}
