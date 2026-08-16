import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { AnyQuestion } from "@/lib/question-engine/types";
import { revealAnswer } from "@/lib/question-engine/reveal";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 11, color: "#555", marginBottom: 14 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", borderBottom: "1 solid #ccc", paddingBottom: 8, marginBottom: 16 },
  metaLabel: { fontSize: 9, color: "#777" },
  metaValue: { fontSize: 11, fontWeight: 700 },
  questionBlock: { marginBottom: 16 },
  questionRow: { flexDirection: "row", gap: 6 },
  questionNumber: { fontWeight: 700, width: 20 },
  questionText: { flex: 1 },
  optionRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, marginLeft: 20, gap: 12 },
  optionText: { fontSize: 10 },
  answerLine: { marginTop: 10, marginLeft: 20, borderBottom: "1 solid #999", width: 220, height: 14 },
  badge: { fontSize: 8, color: "#fff", backgroundColor: "#3b82f6", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  footer: { position: "absolute", bottom: 20, left: 36, right: 36, fontSize: 8, color: "#999", textAlign: "center" },
  answerSheetRow: { flexDirection: "row", marginBottom: 6, gap: 6 },
});

export interface WorksheetMeta {
  studentName: string;
  date: string;
  subjectName: string;
  topicLabel: string; // e.g. "Fractions" or "Mixed topics" for assessments
  kindLabel: string; // "10-Question Practice", "Assessment Paper", etc.
}

function QuestionPrompt({ q, index }: { q: AnyQuestion; index: number }) {
  return (
    <View style={styles.questionBlock} wrap={false}>
      <View style={styles.questionRow}>
        <Text style={styles.questionNumber}>{index + 1}.</Text>
        <Text style={styles.questionText}>{q.promptText}</Text>
      </View>

      {q.type === "multiple_choice" && (
        <View style={styles.optionRow}>
          {q.options.map((opt, i) => (
            <Text key={opt.id} style={styles.optionText}>
              {String.fromCharCode(65 + i)}) {opt.text}
            </Text>
          ))}
        </View>
      )}

      {q.type === "fill_in_box" &&
        q.blanks.map((b) => <View key={b.id} style={styles.answerLine} />)}

      {q.type === "short_answer" && <View style={styles.answerLine} />}

      {q.type === "multi_step" &&
        q.steps.map((s, i) => (
          <View key={s.id} style={{ marginLeft: 20, marginTop: 8 }}>
            <Text style={{ fontSize: 10 }}>{String.fromCharCode(97 + i)}) {s.prompt}</Text>
            <View style={styles.answerLine} />
          </View>
        ))}

      {q.type === "matching" && (
        <View style={{ marginLeft: 20, marginTop: 6 }}>
          {q.pairs.map((p) => (
            <Text key={p.id} style={{ fontSize: 10, marginBottom: 3 }}>
              {p.left}  ___________  (write the matching letter)
            </Text>
          ))}
          <Text style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
            Options: {q.pairs.map((p, i) => `${String.fromCharCode(65 + i)}) ${p.right}`).join("   ")}
          </Text>
        </View>
      )}

      {q.type === "drag_drop" && (
        <View style={{ marginLeft: 20, marginTop: 6 }}>
          <Text style={{ fontSize: 9, color: "#666" }}>Items: {q.items.map((i) => i.label).join(", ")}</Text>
          {q.targets.map((t) => (
            <Text key={t.id} style={{ fontSize: 10, marginTop: 4 }}>
              {t.label}: ___________________________
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

export function WorksheetDocument({ meta, questions }: { meta: WorksheetMeta; questions: AnyQuestion[] }) {
  return (
    <Document title={`${meta.subjectName} — ${meta.topicLabel} — ${meta.kindLabel}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>KaeLex Academy</Text>
        <Text style={styles.subtitle}>{meta.kindLabel}</Text>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Name</Text>
            <Text style={styles.metaValue}>{meta.studentName}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{meta.date}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Subject</Text>
            <Text style={styles.metaValue}>{meta.subjectName}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Topic</Text>
            <Text style={styles.metaValue}>{meta.topicLabel}</Text>
          </View>
        </View>

        {questions.map((q, i) => (
          <QuestionPrompt key={q.id} q={q} index={i} />
        ))}

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} — KaeLex Academy`} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Answer Sheet</Text>
        <Text style={styles.subtitle}>{meta.subjectName} — {meta.topicLabel} — {meta.kindLabel}</Text>
        {questions.map((q, i) => (
          <View key={q.id} style={styles.answerSheetRow}>
            <Text style={{ fontWeight: 700, width: 20 }}>{i + 1}.</Text>
            <Text style={{ flex: 1 }}>{revealAnswer(q)}</Text>
          </View>
        ))}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} — KaeLex Academy`} fixed />
      </Page>
    </Document>
  );
}
