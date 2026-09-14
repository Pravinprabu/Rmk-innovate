import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Heading, Text } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

const LANGUAGES = [
  { code: 'en', name: 'English', subtitle: 'Continue in English', script: 'Aあ' },
  { code: 'hi', name: 'Hindi', subtitle: 'हिंदी में जारी रखें', script: 'ह' },
  { code: 'bn', name: 'Bengali', subtitle: 'বাংলায় চালিয়ে যান', script: 'অ' },
  { code: 'te', name: 'Telugu', subtitle: 'తెలుగులో కొనసాగించండి', script: 'అ' },
  { code: 'mr', name: 'Marathi', subtitle: 'मराठीत सुरू ठेवा', script: 'अ' },
  { code: 'ta', name: 'Tamil', subtitle: 'தமிழில் தொடரவும்', script: 'அ' },
  { code: 'gu', name: 'Gujarati', subtitle: 'ગુજરાતીમાં ચાલુ રાખો', script: 'ગ' },
  { code: 'kn', name: 'Kannada', subtitle: 'ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ', script: 'ಕ' },
  { code: 'ml', name: 'Malayalam', subtitle: 'മലയാളത്തിൽ തുടരുക', script: 'മ' },
  { code: 'pa', name: 'Punjabi', subtitle: 'ਪੰਜਾਬੀ ਵਿੱਚ ਜਾਰੀ ਰੱਖੋ', script: 'ਪ' },
];

export default function LanguageScreen({ onNext }) {
  const [selected, setSelected] = useState('en');

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

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.crossIconContainer}>
            <Text style={styles.crossIcon}>┼</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>MediKiosk</Text>
            <Text style={styles.brandSubtitle}>Care in your language</Text>
          </View>
        </View>

        <View style={styles.taglineContainer}>
          <Text style={styles.taglineText}>HEALTHIER</Text>
          <Text style={styles.taglineText}>PEOPLE</Text>
          <Text style={styles.taglineText}>BRIGHTER</Text>
          <Text style={styles.taglineText}>TOMORROWS</Text>
        </View>
      </View>

      {/* Screen Title & Subtitle */}
      <View style={styles.titleSection}>
        <Heading style={styles.title}>Select your language</Heading>
        <Text style={styles.subtitle}>Choose your preferred language to continue</Text>
      </View>

      {/* Language Options List */}
      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selected === item.code;
          return (
            <TouchableOpacity
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => setSelected(item.code)}
              activeOpacity={0.85}
            >
              <View style={styles.leftSection}>
                <View style={[styles.scriptBadge, isSelected && styles.scriptBadgeSelected]}>
                  <Text style={[styles.scriptText, isSelected && styles.scriptTextSelected]}>
                    {item.script}
                  </Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.langName}>{item.name}</Text>
                  <Text style={styles.langSubtitle}>{item.subtitle}</Text>
                </View>
              </View>

              {isSelected ? (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              ) : (
                <Text style={styles.chevronIcon}>›</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Footer & Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => onNext(selected)}
          activeOpacity={0.88}
        >
          <Text style={styles.continueButtonText}>Continue  →</Text>
        </TouchableOpacity>

        <Text style={styles.footerTagline}>—   Better care. For everyone.   —</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
    position: 'relative',
  },
  // Top right watermark leaves
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
  // Bottom left watermark leaves
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
  // Header section
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  crossIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E1ECE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossIcon: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.emerald,
    marginTop: -2,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
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
  // Title & Subtitle section
  titleSection: {
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // List styling
  list: {
    paddingHorizontal: spacing.lg + 2,
    gap: 10,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  rowSelected: {
    backgroundColor: '#F2F7F4',
    borderColor: colors.emerald,
    borderWidth: 1.5,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  scriptBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scriptBadgeSelected: {
    backgroundColor: colors.emeraldLight,
  },
  scriptText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scriptTextSelected: {
    color: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  langName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  langSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.surfaceWhite,
  },
  chevronIcon: {
    fontSize: 22,
    color: colors.textSecondary,
    fontWeight: '400',
    marginRight: 4,
  },
  // Footer styling
  footer: {
    paddingHorizontal: spacing.lg + 2,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  continueButton: {
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
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.surfaceWhite,
  },
  footerTagline: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '500',
  },
});
