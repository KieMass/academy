import { requireStudent } from "@/lib/auth/guards";
import { TimesTablesPractice } from "@/components/times-tables/times-tables-practice";

export default async function TimesTablesPage() {
  await requireStudent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Times Tables Speed Drill</h1>
        <p className="text-muted-foreground">Pick your tables and a round length, then see how many you can answer — and how fast.</p>
      </div>
      <TimesTablesPractice />
    </div>
  );
}
