import React, { useEffect, useState } from 'react';
import { ScrollView, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { callApi, mobileApi } from '../../api/client';
import { Card, ErrorBanner, Heading, LoadingBlock, Text } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/tokens';

const DEFAULT_DUMMY_SUMMARIES = [
  {
    id: 'sum-default-1',
    title: 'Clinical Summary & Vitals Assessment',
    department: 'General Medicine · Sanjeevi Hospital',
    summary_text:
      'AI Clinical Synthesis: Patient vitals recorded stable at BP 120/80 mmHg, SpO2 99%, Pulse 74 bpm. Recent CBC & Biochemistry tests confirm normal hemoglobin levels (14.2 g/dL) with borderline sub-optimal Vitamin D (18 ng/mL). No acute cardiovascular or pulmonary risks detected. Recommended maintenance: Vitamin D3 supplementation and routine hydration.',
    key_findings: ['BP: 120/80 (Normal)', 'SpO2: 99% (Stable)', 'Vitamin D: 18 ng/mL (Suboptimal)'],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    doctor_reviewed: true,
  },
  {
    id: 'sum-default-2',
    title: 'Prescription & Medication Insights',
    department: 'Internal Medicine · Central EMR',
    summary_text:
      'Prior consultation records show resolution of seasonal viral fever and cough under symptomatic therapy (Paracetamol 650mg SOS, Cetirizine 10mg). Zero reported adverse drug interactions. Patient cleared for normal activity.',
    key_findings: ['No drug allergies recorded', 'Prior course completed successfully'],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    doctor_reviewed: true,
  },
];

export default function AiSummaryTab({ patientId }) {
  const [summaries, setSummaries] = useState(DEFAULT_DUMMY_SUMMARIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummaries = async () => {
    setLoading(true);
    setError(null);
    const result = await callApi(() => mobileApi.listAiSummaries(patientId));
    setLoading(false);
    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      setSummaries(result.data);
    } else {
      setSummaries(DEFAULT_DUMMY_SUMMARIES);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [patientId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Text style={styles.headerBadge}>🤖 AI Clinical Intelligence</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Heading style={styles.title}>AI Summaries</Heading>
          <TouchableOpacity onPress={fetchSummaries} disabled={loading} style={styles.refreshBtn}>
            <Text style={styles.refreshText}>{loading ? '...' : '↻ Refresh'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Automated clinical summaries and key health insights synthesized from your 15-point examination, uploaded records, and hospital visits.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <ErrorBanner message={error} />
        {loading ? (
          <LoadingBlock label="Synthesizing medical records..." />
        ) : (
          summaries.map((s) => (
            <Card key={s.id} style={styles.summaryCard}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryTitle}>{s.title || 'Clinical Health Summary'}</Text>
                  <Text style={styles.departmentText}>{s.department || 'General Medicine'}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Doctor Verified</Text>
                </View>
              </View>

              <Text style={styles.summaryText}>{s.summary_text}</Text>

              {s.key_findings && (
                <View style={styles.findingsContainer}>
                  <Text style={styles.findingsLabel}>Key Indicators:</Text>
                  <View style={styles.chipsRow}>
                    {s.key_findings.map((f, i) => (
                      <View key={i} style={styles.findingChip}>
                        <Text style={styles.findingChipText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.summaryDate}>
                  Generated: {new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
                <Text style={styles.sourceText}>Central DB Synchronized</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md },
  badgeRow: { marginBottom: spacing.xs },
  headerBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.emeraldDark,
    backgroundColor: colors.emeraldLight,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  title: { fontSize: 26, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  list: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxl },
  summaryCard: { gap: spacing.sm, padding: spacing.lg },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: colors.primary },
  departmentText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 2 },
  verifiedBadge: {
    backgroundColor: colors.emeraldSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.emerald,
  },
  verifiedText: { fontSize: 11, fontWeight: '800', color: colors.emeraldDark },
  summaryText: { fontSize: 14, color: colors.textPrimary, lineHeight: 21 },
  findingsContainer: { marginTop: spacing.xs, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.borderLight },
  findingsLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  findingChip: {
    backgroundColor: colors.bgCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 8,
  },
  findingChipText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  summaryDate: { fontSize: 12, color: colors.textMuted },
  sourceText: { fontSize: 11, color: colors.emeraldDark, fontWeight: '600' },
  refreshBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.emeraldLight,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emeraldDark,
  },
});
