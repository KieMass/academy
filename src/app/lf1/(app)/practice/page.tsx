import { requireLearner } from "@/lib/auth/guards";
import { LF1_SYLLABUS } from "@/lib/lf1/bank";
import { getLf1OutcomeProgress } from "@/lib/lf1/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StartTestButton } from "@/components/lf1/start-test-button";

export default async function Lf1PracticePage() {
  const { learnerProfile } = await requireLearner();
  const progress = new Map((await getLf1OutcomeProgress(learnerProfile.id)).map((p) => [p.outcome, p]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Practice by learning outcome</h1>
        <p className="text-sm text-muted-foreground">
          Practice sets show the answer and an explanation straight after each question. Questions you haven&apos;t seen come first.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mixed practice</CardTitle>
          <CardDescription>Questions drawn from the whole syllabus.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <StartTestButton request={{ mode: "PRACTICE", outcome: null, count: 10 }}>10 questions</StartTestButton>
          <StartTestButton request={{ mode: "PRACTICE", outcome: null, count: 20 }} variant="outline">
            20 questions
          </StartTestButton>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {LF1_SYLLABUS.outcomes.map((o) => {
          const p = progress.get(o.number);
          return (
            <Card key={o.number}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">
                    {o.number}. {o.title}
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0 rounded-full">
                    ~{o.examQuestions} in exam
                  </Badge>
                </div>
                <CardDescription>
                  {p && p.answered > 0 ? `${p.correct}/${p.answered} correct so far (${p.accuracyPct}%)` : "Not practised yet"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {o.objectives.map((ob) => (
                    <li key={ob.code}>
                      <span className="mr-1.5 font-medium text-foreground">{ob.code}</span>
                      {ob.text}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <StartTestButton request={{ mode: "PRACTICE", outcome: o.number, count: 5 }} size="sm">
                    5 questions
                  </StartTestButton>
                  <StartTestButton request={{ mode: "PRACTICE", outcome: o.number, count: 10 }} size="sm" variant="outline">
                    10 questions
                  </StartTestButton>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
