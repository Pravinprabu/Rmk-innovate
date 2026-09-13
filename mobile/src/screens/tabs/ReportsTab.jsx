import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { callApi, mobileApi } from '../../api/client';
import { Button, Card, ErrorBanner, Heading, LoadingBlock, Text } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/tokens';

// Reports tab -- every document on file for this patient, across every
// hospital (an ABHA record follows the patient, not one hospital's DB).
// Upload/Scan sit at the bottom, not the top -- they're actions on this
// list, so they read as "add to this" rather than a separate destination.
export default function ReportsTab({ patientId, onUpload, onScan }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    const result = await callApi(() => mobileApi.listDocuments(patientId));
    setLoading(false);
    if (result.ok) setDocuments(result.data);
    else setError(result.error);
  };

  useEffect(() => { load(); }, [patientId]);

  const openDocument = (url) => {
    if (url) Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Heading style={styles.title}>Reports</Heading>
        <Text style={styles.subtitle}>Every prescription, lab report, and document on file.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <ErrorBanner message={error} />
        {loading ? (
          <LoadingBlock label="Loading reports..." />
        ) : documents.length === 0 ? (
          <Text style={styles.emptyText}>No reports yet -- upload or scan one below.</Text>
        ) : (
          documents.map((d) => (
            <TouchableOpacity key={d.id} onPress={() => openDocument(d.file_url)} activeOpacity={0.8}>
              <Card style={styles.docCard}>
                <Text style={styles.docTitle}>{d.title}</Text>
                <Text style={styles.docMeta}>
                  {d.category} · {d.hospital_name || 'No hospital on file'}
                </Text>
                <Text style={styles.docDate}>
                  {new Date(d.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.actionBar}>
        <Button title="⬆  Upload Document" onPress={onUpload} style={styles.actionBtn} />
        <Button title="📷  Scan Document" onPress={onScan} variant="secondary" style={styles.actionBtn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md },
  title: { fontSize: 24, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary },
  list: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.lg },
  emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  docCard: { gap: 2 },
  docTitle: { fontSize: 15, fontWeight: '800', color: colors.primary },
  docMeta: { fontSize: 13, color: colors.textSecondary },
  docDate: { fontSize: 12, color: colors.textMuted },
  actionBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceWhite,
  },
  actionBtn: { flex: 1 },
});
