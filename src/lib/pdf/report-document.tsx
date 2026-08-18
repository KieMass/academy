import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 11, color: "#555", marginBottom: 14 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", borderBottom: "1 solid #ccc", paddingBottom: 8, marginBottom: 16 },
  metaLabel: { fontSize: 9, color: "#777" },
  metaValue: { fontSize: 11, fontWeight: 700 },
  statRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
  statBox: { flex: 1, padding: 10, backgroundColor: "#f6f6f4", borderRadius: 4, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: 700, color: "#1d4ed8" },
  statLabel: { fontSize: 8, color: "#666", marginTop: 2, textAlign: "center" },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  tableHeader: { flexDirection: "row", borderBottom: "1 solid #999", paddingBottom: 4, marginBottom: 4 },
  tableHeaderCell: { fontSize: 9, color: "#777", fontWeight: 700 },
  tableRow: { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 4 },
  tableCell: { fontSize: 10 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badgePill: { fontSize: 9, backgroundColor: "#fef3c7", color: "#92400e", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  footer: { position: "absolute", bottom: 20, left: 36, right: 36, fontSize: 8, color: "#999", textAlign: "center" },
  emptyText: { fontSize: 10, color: "#888", fontStyle: "italic" },
});

export interface ReportSubjectRow {
  subjectName: string;
  attempted: number;
  correct: number;
  accuracyPct: number;
}

export interface ReportTopicRow {
  subjectName: string;
  strandName: string;
  attempted: number;
  accuracyPct: number;
  masteryLevel: string;
}

export interface ReportData {
  studentName: string;
  yearGroup: string;
  periodLabel: string; // "Weekly", "Fortnightly", "Monthly"
  startDate: string;
  endDate: string;
  generatedOn: string;
  totals: {
    questionsAttempted: number;
    accuracyPct: number;
    xpEarned: number;
    streakDays: number;
    currentLevel: number;
  };
  bySubject: ReportSubjectRow[];
  topicRows: ReportTopicRow[];
  badgesEarned: string[];
}

export function ReportDocument({ data }: { data: ReportData }) {
  return (
    <Document title={`${data.studentName} — ${data.periodLabel} Progress Report`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>KaeLex Academy</Text>
        <Text style={styles.subtitle}>{data.periodLabel} Progress Report</Text>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Student</Text>
            <Text style={styles.metaValue}>{data.studentName}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Year Group</Text>
            <Text style={styles.metaValue}>Year {data.yearGroup.replace("Y", "")}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Period</Text>
            <Text style={styles.metaValue}>{data.startDate} – {data.endDate}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Generated</Text>
            <Text style={styles.metaValue}>{data.generatedOn}</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.totals.questionsAttempted}</Text>
            <Text style={styles.statLabel}>Questions answered</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.totals.accuracyPct}%</Text>
            <Text style={styles.statLabel}>Overall accuracy</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>+{data.totals.xpEarned}</Text>
            <Text style={styles.statLabel}>XP earned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.totals.streakDays}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.totals.currentLevel}</Text>
            <Text style={styles.statLabel}>Current level</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Accuracy by subject</Text>
        {data.bySubject.length === 0 ? (
          <Text style={styles.emptyText}>No practice recorded in this period.</Text>
        ) : (
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Subject</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Answered</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Correct</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Accuracy</Text>
            </View>
            {data.bySubject.map((r) => (
              <View key={r.subjectName} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{r.subjectName}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{r.attempted}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{r.correct}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{r.accuracyPct}%</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Badges earned this period</Text>
        {data.badgesEarned.length === 0 ? (
          <Text style={styles.emptyText}>No new badges this period.</Text>
        ) : (
          <View style={styles.badgeRow}>
            {data.badgesEarned.map((b) => (
              // No emoji here — react-pdf's built-in Helvetica has no emoji
              // glyphs, so it would render as a missing-character box.
              <Text key={b} style={styles.badgePill}>{b}</Text>
            ))}
          </View>
        )}

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} — KaeLex Academy`} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Topic Breakdown</Text>
        <Text style={styles.subtitle}>{data.studentName} — {data.periodLabel} Progress Report</Text>

        {data.topicRows.length === 0 ? (
          <Text style={styles.emptyText}>No topics practised yet.</Text>
        ) : (
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Topic</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Subject</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Answered</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Accuracy</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Mastery</Text>
            </View>
            {data.topicRows.map((r) => (
              <View key={`${r.subjectName}-${r.strandName}`} style={styles.tableRow} wrap={false}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{r.strandName}</Text>
                <Text style={[styles.tableCell, { flex: 2, color: "#666" }]}>{r.subjectName}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{r.attempted}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{r.accuracyPct}%</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{r.masteryLevel}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} — KaeLex Academy`} fixed />
      </Page>
    </Document>
  );
}
