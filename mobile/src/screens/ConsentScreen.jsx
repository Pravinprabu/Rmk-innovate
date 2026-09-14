import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Heading, Text } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

const POINTS = [
  {
    tag: '01',
    icon: '👤',
    title: 'Your Identity',
    body: 'We use your mobile number to securely find or create your patient profile.',
  },
  {
    tag: '02',
    icon: '📄',
    title: 'Documents You Upload',
    body: 'Prescriptions, lab reports, and summaries you attach here are saved to your record.',
  },
  {
    tag: '03',
    icon: '🏥',
    title: 'Hospital Sharing',
    body: "Bookings and documents are visible to the hospital's doctors when you consult.",
  },
];

export default function ConsentScreen({ onNext, onBack }) {
  const [agreed, setAgreed] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Right Leaf Watermark */}
      <View style={styles.topRightLeafContainer} pointerEvents="none">
        <View style={styles.leafMain} />
        <View style={styles.leafSecondary} />
      </View>

      {/* Bottom Left Leaf Watermark */}
      <View style={styles.bottomLeftLeafContainer} pointerEvents="none">
        <View style={styles.leafBottom1} />
        <View style={styles.leafBottom2} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Navigation & Tagline */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.taglineContainer}>
            <Text style={styles.taglineText}>YOUR</Text>
            <Text style={styles.taglineText}>HEALTH</Text>
            <Text style={styles.taglineText}>OUR</Text>
            <Text style={styles.taglineText}>PRIORITY</Text>
            <Text style={styles.taglineText}>—</Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Heading style={styles.title}>Before we begin</Heading>
          <Text style={styles.subtitle}>Please review how your information will be used.</Text>
        </View>

        {/* Points Cards */}
        <View style={styles.cards}>
          {POINTS.map((p) => (
            <View key={p.tag} style={styles.card}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{p.tag}</Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.cardText}>{p.body}</Text>
              </View>

              <Text style={styles.chevron}>›</Text>
            </View>
          ))}
        </View>

        {/* Agreement Checkbox Box */}
        <TouchableOpacity
          style={[styles.checkRow, agreed && styles.checkRowAgreed]}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.85}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.checkTextContainer}>
            <Text style={styles.checkTitle}>I understand and agree</Text>
            <Text style={styles.checkSubtitle}>
              I have read and understood how my information will be used.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueBtn} onPress={onNext} activeOpacity={0.88}>
          <Text style={styles.continueBtnText}>Continue  →</Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <View style={styles.footerRow}>
          <View style={styles.footerLine} />
          <Text style={styles.shieldIcon}>🛡️</Text>
          <Text style={styles.footerNote}>Your information is safe with us</Text>
          <View style={styles.footerLine} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
    position: 'relative',
  },
  // Watermark leaves
  topRightLeafContainer: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 160,
    height: 160,
    overflow: 'hidden',
  },
  leafMain: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 90,
    height: 90,
    borderTopLeftRadius: 90,
    borderBottomRightRadius: 90,
    backgroundColor: 'rgba(220, 233, 223, 0.45)',
    transform: [{ rotate: '-15deg' }],
  },
  leafSecondary: {
    position: 'absolute',
    top: 40,
    right: 70,
    width: 60,
    height: 60,
    borderTopLeftRadius: 60,
    borderBottomRightRadius: 60,
    backgroundColor: 'rgba(220, 233, 223, 0.3)',
    transform: [{ rotate: '25deg' }],
  },
  bottomLeftLeafContainer: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 140,
    height: 140,
    overflow: 'hidden',
  },
  leafBottom1: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 80,
    height: 80,
    borderTopLeftRadius: 80,
    borderBottomRightRadius: 80,
    backgroundColor: 'rgba(220, 233, 223, 0.4)',
    transform: [{ rotate: '45deg' }],
  },
  leafBottom2: {
    position: 'absolute',
    bottom: 45,
    left: 45,
    width: 50,
    height: 50,
    borderTopLeftRadius: 50,
    borderBottomRightRadius: 50,
    backgroundColor: 'rgba(220, 233, 223, 0.25)',
    transform: [{ rotate: '15deg' }],
  },
  scroll: {
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backArrow: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
  taglineContainer: {
    alignItems: 'flex-end',
  },
  taglineText: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#8A968F',
    letterSpacing: 1.2,
    lineHeight: 11,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cards: {
    gap: 12,
    marginBottom: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    gap: 12,
  },
  numberCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E1ECE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    color: '#A2ACA5',
    fontWeight: '400',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F2F7F4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4E3D8',
    padding: 14,
    marginBottom: 20,
  },
  checkRowAgreed: {
    backgroundColor: '#F2F7F4',
    borderColor: colors.emerald,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderFocus,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceWhite,
  },
  checkboxChecked: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  checkmark: {
    color: colors.surfaceWhite,
    fontSize: 13,
    fontWeight: '900',
  },
  checkTextContainer: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  checkSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  continueBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.surfaceWhite,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  shieldIcon: {
    fontSize: 12,
  },
  footerNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
