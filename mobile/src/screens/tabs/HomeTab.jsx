import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Heading, Text } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/tokens';

// Home tab -- the app's one primary action (book a slot). Uploading/
// scanning documents moved to the Reports tab, where they belong next to
// the list of documents they add to.
export default function HomeTab({
  fullName,
  onStartExamine,
  onBookAppointment,
  onScanOrUploadDocument,
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>MediKiosk</Text>
        <Heading style={styles.title}>Hi, {fullName || 'there'}</Heading>
        <Text style={styles.subtitle}>Choose one of the 3 health options below:</Text>
      </View>

      <View style={styles.options}>
        {/* OPTION 1: START EXAMINE (15 ADAPTIVE CLINICAL QUESTIONS + AI SUMMARY) */}
        <TouchableOpacity onPress={onStartExamine} activeOpacity={0.85}>
          <Card style={[styles.optionCard, styles.optionCardAccent]}>
            <View style={styles.cardHeader}>
              <Text style={styles.optionIcon}>🩺</Text>
              <View style={[styles.badge, styles.badgeAccent]}>
                <Text style={[styles.badgeText, styles.badgeTextAccent]}>AI Assessment</Text>
              </View>
            </View>
            <Text style={[styles.optionTitle, styles.optionTitleAccent]}>1. Start Examine</Text>
            <Text style={styles.optionBody}>
              Answer 15 adaptive clinical questions as an allopathic doctor to generate an automated medical summary for Dr. Raj.
            </Text>
          </Card>
        </TouchableOpacity>

        {/* OPTION 2: BOOK APPOINTMENT */}
        <TouchableOpacity onPress={onBookAppointment} activeOpacity={0.85}>
          <Card style={styles.optionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.optionIcon}>📅</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Instant Queue</Text>
              </View>
            </View>
            <Text style={styles.optionTitle}>2. Book Appointment</Text>
            <Text style={styles.optionBody}>
              Search Sanjeevi Hospital, pick a department, and book your 30-minute priority consultation token slot.
            </Text>
          </Card>
        </TouchableOpacity>

        {/* OPTION 3: SCAN / UPLOAD DOCUMENT */}
        <TouchableOpacity onPress={onScanOrUploadDocument} activeOpacity={0.85}>
          <Card style={styles.optionCard}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.optionIcon}>📷</Text>
                <Text style={styles.optionIcon}>📁</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Camera & Files</Text>
              </View>
            </View>
            <Text style={styles.optionTitle}>3. Scan / Upload Document</Text>
            <Text style={styles.optionBody}>
              Open device camera to live-scan prescriptions, or open file manager to attach existing PDF lab reports.
            </Text>
          </Card>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  brand: { fontSize: 14, fontWeight: '900', color: colors.emeraldDark, letterSpacing: 1, marginBottom: spacing.xs },
  title: { fontSize: 26, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary },
  options: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  optionCard: { alignItems: 'flex-start', width: '100%' },
  optionCardAccent: { borderColor: colors.emerald, backgroundColor: colors.surfaceWhite },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: spacing.xs },
  badge: { backgroundColor: colors.blueLight || '#E0F2FE', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  badgeAccent: { backgroundColor: colors.emeraldLight },
  badgeTextAccent: { color: colors.emeraldDark },
  optionIcon: { fontSize: 28, marginBottom: spacing.xs },
  optionTitle: { fontSize: 18, fontWeight: '800', color: colors.primary, marginBottom: spacing.xs },
  optionTitleAccent: { color: colors.emeraldDark },
  optionBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
});
