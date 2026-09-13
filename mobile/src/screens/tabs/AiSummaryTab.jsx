import React, { useEffect, useState } from 'react';
import { ScrollView, SafeAreaView, StyleSheet, View } from 'react-native';
import { callApi, mobileApi } from '../../api/client';
import { Card, ErrorBanner, Heading, LoadingBlock, Text } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/tokens';

export default function AiSummaryTab({ patientId }) {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => mobileApi.listAiSummaries(patientId));
      setLoading(false);
      if (result.ok) setSummaries(result.data);
      else setError(result.error);
    })();
  }, [patientId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Heading style={styles.title}>AI Summaries</Heading>
        <Text style={styles.subtitle}>Clinical summaries generated from your past visits.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <ErrorBanner message={error} />
        {loading ? (
          <LoadingBlock label="Loading summaries..." />
        ) : summaries.length === 0 ? (
          <Text style={styles.emptyText}>No AI summaries generated yet.</Text>
        ) : (
          summaries.map((s) => (
            <Card key={s.id} style={styles.summaryCard}>
              {s.is_placeholder && <Text style={styles.placeholderTag}>PLACEHOLDER -- not a real AI model yet</Text>}
              <Text style={styles.summaryText}>{s.summary_text}</Text>
              <Text style={styles.summaryDate}>
                {new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
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
  title: { fontSize: 24, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary },
  list: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.xl },
  emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  summaryCard: { gap: spacing.xs },
  placeholderTag: { fontSize: 11, fontWeight: '800', color: colors.warning },
  summaryText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  summaryDate: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
});
