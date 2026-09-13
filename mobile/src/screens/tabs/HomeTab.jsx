import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Heading, Text } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/tokens';

// Home tab -- the app's one primary action (book a slot). Uploading/
// scanning documents moved to the Reports tab, where they belong next to
// the list of documents they add to.
export default function HomeTab({ fullName, onBookAppointment }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>MediKiosk</Text>
        <Heading style={styles.title}>Hi, {fullName || 'there'}</Heading>
        <Text style={styles.subtitle}>What would you like to do?</Text>
      </View>

      <View style={styles.options}>
        <TouchableOpacity onPress={onBookAppointment} activeOpacity={0.85}>
          <Card style={styles.optionCard}>
            <Text style={styles.optionIcon}>📅</Text>
            <Text style={styles.optionTitle}>Book Appointment</Text>
            <Text style={styles.optionBody}>Search a hospital, pick a department, and choose a 30-minute arrival slot.</Text>
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
  optionCard: { alignItems: 'flex-start' },
  optionIcon: { fontSize: 28, marginBottom: spacing.sm },
  optionTitle: { fontSize: 18, fontWeight: '800', color: colors.primary, marginBottom: spacing.xs },
  optionBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
});
