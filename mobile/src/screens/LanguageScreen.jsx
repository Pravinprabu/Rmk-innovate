import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Heading, Text } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';

// A shorter list than the kiosk's full 30 -- this app's own UI text stays
// English regardless of what's picked here (same as the kiosk: language
// selection doesn't retranslate the app chrome, see frontend/src/theme/
// typography.js's getUIFontFamily comment), so this is mainly for
// consistency with the overall patient flow and to record a preference on
// the patient record. No Indic-script fonts are loaded in this app, so
// names are shown in English only, not native script.
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
];

// Screen 1 -- pick a language before anything else, matching the kiosk's
// own first step.
export default function LanguageScreen({ onNext }) {
  const [selected, setSelected] = useState('en');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>MediKiosk</Text>
        <Heading style={styles.title}>Select your language</Heading>
      </View>

      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, selected === item.code && styles.rowActive]}
            onPress={() => setSelected(item.code)}
            activeOpacity={0.85}
          >
            <Text style={[styles.rowText, selected === item.code && styles.rowTextActive]}>{item.name}</Text>
            {selected === item.code && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <Button title="Continue" onPress={() => onNext(selected)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  brand: { fontSize: 14, fontWeight: '900', color: colors.emeraldDark, letterSpacing: 1, marginBottom: spacing.xs },
  title: { fontSize: 26 },
  list: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  rowActive: { backgroundColor: colors.emeraldSoft, borderColor: colors.emerald },
  rowText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  rowTextActive: { color: colors.emeraldDark },
  check: { fontSize: 18, fontWeight: '900', color: colors.emerald },
  footer: { padding: spacing.xl },
});
