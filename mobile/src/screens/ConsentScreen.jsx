import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Heading, Text } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';

const POINTS = [
  { tag: '01', title: 'Your Identity', body: 'We use your ABHA ID to find or create your patient record.' },
  { tag: '02', title: 'Documents You Upload', body: 'Prescriptions, lab reports, and summaries you attach here are saved to your record.' },
  { tag: '03', title: 'Hospital Sharing', body: "Bookings and documents are visible to the hospital's staff when you visit." },
];

// Screen 2 -- same idea as the kiosk's ConsentScreen, condensed for a
// phone. Comes before "login" (ABHA identify) since the patient should
// know what they're agreeing to before handing over their ID.
export default function ConsentScreen({ onNext, onBack }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>

        <Heading style={styles.title}>Before we begin</Heading>
        <Text style={styles.subtitle}>Please review how your information will be used.</Text>

        <View style={styles.cards}>
          {POINTS.map((p) => (
            <Card key={p.tag} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{p.tag}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{p.title}</Text>
                  <Text style={styles.cardText}>{p.body}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <TouchableOpacity style={[styles.checkRow, agreed && styles.checkRowAgreed]} onPress={() => setAgreed(!agreed)} activeOpacity={0.85}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>I understand and agree</Text>
        </TouchableOpacity>

        <Button title="Continue" onPress={onNext} disabled={!agreed} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  backLink: { color: colors.emeraldDark, fontWeight: '700', marginBottom: spacing.md },
  title: { fontSize: 24, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.lg },
  cards: { gap: spacing.sm + 2, marginBottom: spacing.lg },
  card: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  tagBadge: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: colors.emeraldLight, alignItems: 'center', justifyContent: 'center',
  },
  tagText: { fontSize: 12, fontWeight: '900', color: colors.emeraldDark },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: 2 },
  cardText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surfaceWhite, borderRadius: radius.pill,
    borderWidth: 1.5, borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginBottom: spacing.lg,
  },
  checkRowAgreed: { backgroundColor: colors.emeraldSoft, borderColor: colors.emerald },
  checkbox: {
    width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.textLight,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceWhite,
  },
  checkboxChecked: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  checkmark: { color: colors.surfaceWhite, fontSize: 15, fontWeight: '900' },
  checkLabel: { fontSize: 15, fontWeight: '700', color: colors.primary },
});
