import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { callApi, mobileApi } from '../api/client';
import { Card, ErrorBanner, Heading, LoadingBlock, Text, TextField } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';

// Book-appointment branch, screen 1 -- search for the hospital by name.
// Debounced so it doesn't fire a request on every keystroke.
export default function SearchHospitalScreen({ onSelectHospital, onBack }) {
  const [query, setQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setHospitals([]);
      setSearched(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      const result = await callApi(() => mobileApi.searchHospitals(query.trim()));
      setLoading(false);
      setSearched(true);
      if (result.ok) setHospitals(result.data);
      else setError(result.error);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backLink}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.brand}>MediKiosk</Text>
        <Heading style={styles.title}>Book a Time Slot</Heading>
        <Text style={styles.subtitle}>
          Search for your hospital, pick a slot, and arrive 10 minutes early to complete
          registration at the kiosk.
        </Text>
      </View>

      <View style={styles.body}>
        <TextField
          label="Hospital name"
          placeholder="e.g. Sanjeevi, City Care..."
          value={query}
          onChangeText={setQuery}
          autoFocus
        />

        <ErrorBanner message={error} />

        {loading && <LoadingBlock label="Searching..." />}

        {!loading && searched && hospitals.length === 0 && !error && (
          <Text style={styles.emptyText}>No hospitals matched "{query}".</Text>
        )}

        <FlatList
          data={hospitals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelectHospital(item)} activeOpacity={0.85}>
              <Card style={styles.hospitalCard}>
                <View style={styles.hospitalTag}>
                  <Text style={styles.hospitalTagText}>{item.code}</Text>
                </View>
                <Text style={styles.hospitalName}>{item.name}</Text>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  backLink: {
    color: colors.emeraldDark,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  brand: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.emeraldDark,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hospitalTag: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.purple50,
  },
  hospitalTagText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary,
  },
  hospitalName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
});
