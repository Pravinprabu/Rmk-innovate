import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Card, Heading, Text } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';

// Screen 4 -- booking confirmed. The "arrive 10 minutes early" line is the
// entire point of this feature (booking only reserves a place in line, it
// does not replace the kiosk registration), so it gets its own bold banner
// rather than being folded into a paragraph of fine print. Full details
// (name, mobile, date, time) are shown together since there's no download/
// share option here -- a screenshot is the practical way to keep a copy.
export default function ConfirmScreen({ hospital, booking, patient, onDone }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>

        <Heading style={styles.title}>Slot Booked</Heading>
        <Text style={styles.subtitle}>{hospital.name}</Text>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{booking.full_name || patient?.fullName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mobile</Text>
            <Text style={styles.detailValue}>{patient?.mobileNumber || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{booking.slot_date}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{booking.slot_time}</Text>
          </View>
        </Card>

        <View style={styles.noticeBanner}>
          <Text style={styles.noticeIcon}>🎫</Text>
          <Text style={styles.noticeText}>
            Queue Token: <Text style={styles.noticeTextBold}>{booking.token_no || patient?.tokenNo || 'SAN-101'}</Text>
            {'\n'}Your slot is directly registered in the doctor's queue.
          </Text>
        </View>

        <View style={styles.screenshotBanner}>
          <Text style={styles.screenshotIcon}>📸</Text>
          <Text style={styles.screenshotText}>
            Save or screenshot this confirmation token to show when you arrive at the consultation room.
          </Text>
        </View>

        <Text style={styles.helperText}>
          Your medical records and documents are stored in the central hospital database and available to your consulting doctor.
        </Text>

        <Button title="Done" onPress={onDone} style={styles.doneButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, alignItems: 'center' },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  checkMark: { fontSize: 36, color: colors.success, fontWeight: '900' },
  title: { fontSize: 26, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.xl },
  detailsCard: { width: '100%', marginBottom: spacing.xl },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '700' },
  detailValue: { fontSize: 15, fontWeight: '800', color: colors.emeraldDark },
  screenshotBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.emeraldSoft,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.emerald,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  screenshotIcon: { fontSize: 28 },
  screenshotText: { flex: 1, fontSize: 13, color: colors.emeraldDark, lineHeight: 19, fontWeight: '600' },
  noticeBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.warningLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.warning,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  noticeIcon: { fontSize: 32 },
  noticeText: { flex: 1, fontSize: 15, color: colors.warningDark, lineHeight: 21 },
  noticeTextBold: { fontWeight: '900', fontSize: 16 },
  helperText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.xl,
  },
  doneButton: { width: '100%' },
});
