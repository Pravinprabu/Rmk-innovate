import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { callApi, mobileApi } from '../api/client';
import { Button, ErrorBanner, Heading, LoadingBlock, Text } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';

function isoDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(offsetDays) {
  if (offsetDays === 0) return 'Today';
  if (offsetDays === 1) return 'Tomorrow';
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Book-appointment branch, screen 3 -- pick a date (today/tomorrow/day
// after) and a 30-minute slot, scoped to the department chosen on the
// previous screen. Already-booked slots are shown, visibly disabled, not
// just omitted, so it's obvious why they're unavailable rather than
// looking like a gap. Tapping an available slot books it immediately (the
// patient was already identified back at LoginScreen, so there's no
// separate "who is this for" step here anymore) -- `submitting`/`error`
// reflect that in-flight booking call, not this screen's own slot fetch.
export default function PickSlotScreen({ hospital, department, onBack, onSlotSelected, submitting, error: submitError }) {
  const [dayOffset, setDayOffset] = useState(0);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const date = isoDate(dayOffset);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const result = await callApi(() => mobileApi.slots(hospital.id, department.id, date));
      setLoading(false);
      if (result.ok) setSlots(result.data.slots);
      else setError(result.error);
    })();
  }, [date]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>← Change department</Text>
        </TouchableOpacity>
        <Heading style={styles.title}>{hospital.name} · {department.name}</Heading>
        <Text style={styles.subtitle}>Pick a 30-minute arrival slot</Text>
      </View>

      <View style={styles.dayRow}>
        {[0, 1, 2].map((offset) => (
          <TouchableOpacity
            key={offset}
            style={[styles.dayChip, dayOffset === offset && styles.dayChipActive]}
            onPress={() => setDayOffset(offset)}
          >
            <Text style={[styles.dayChipText, dayOffset === offset && styles.dayChipTextActive]}>
              {formatDateLabel(offset)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ErrorBanner message={error || submitError} />
      {loading ? (
        <LoadingBlock label="Loading slots..." />
      ) : (
        <ScrollView contentContainerStyle={styles.slotGrid}>
          {slots.map((slot) => (
            <TouchableOpacity
              key={slot.time}
              disabled={!slot.available || submitting}
              style={[styles.slotButton, (!slot.available || submitting) && styles.slotButtonDisabled]}
              onPress={() => onSlotSelected({ date, time: slot.time })}
              activeOpacity={0.8}
            >
              <Text style={[styles.slotText, (!slot.available || submitting) && styles.slotTextDisabled]}>
                {submitting ? '...' : slot.time}
              </Text>
              {!slot.available && <Text style={styles.slotTakenText}>Taken</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md },
  backLink: { color: colors.emeraldDark, fontWeight: '700', marginBottom: spacing.md },
  title: { fontSize: 24, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary },
  dayRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  dayChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  dayChipActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  dayChipText: { fontWeight: '700', color: colors.textSecondary },
  dayChipTextActive: { color: colors.surfaceWhite },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  slotButton: {
    width: '30%',
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1.5,
    borderColor: colors.emerald,
    alignItems: 'center',
  },
  slotButtonDisabled: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderLight,
  },
  slotText: { fontWeight: '800', color: colors.emeraldDark },
  slotTextDisabled: { color: colors.textMuted },
  slotTakenText: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
});
