import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { callApi, mobileApi } from '../../api/client';
import { Card, ErrorBanner, Heading, LoadingBlock, Text } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/tokens';

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

export default function ProfileTab({ patientId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => mobileApi.getProfile(patientId));
      setLoading(false);
      if (result.ok) setProfile(result.data);
      else setError(result.error);
    })();
  }, [patientId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Heading style={styles.title}>Profile</Heading>
      </View>

      <View style={styles.body}>
        <ErrorBanner message={error} />
        {loading ? (
          <LoadingBlock label="Loading profile..." />
        ) : profile ? (
          <>
            <Card style={styles.card}>
              <Text style={styles.name}>{profile.full_name}</Text>
              <Row label="ABHA ID" value={profile.abha_id} />
              <Row label="Mobile number" value={profile.mobile_number} />
              <Row
                label="Date joined"
                value={new Date(profile.date_joined).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              />
            </Card>

            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{profile.total_ai_summaries}</Text>
                <Text style={styles.statLabel}>AI Summaries</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{profile.total_reports}</Text>
                <Text style={styles.statLabel}>Reports</Text>
              </Card>
            </View>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md },
  title: { fontSize: 24 },
  body: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  card: { gap: spacing.sm },
  name: { fontSize: 18, fontWeight: '800', color: colors.primary, marginBottom: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  rowLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '700' },
  rowValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '900', color: colors.emeraldDark },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs },
});
