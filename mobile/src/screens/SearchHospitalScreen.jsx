import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { callApi, mobileApi } from '../api/client';
import { ErrorBanner, Heading, LoadingBlock, Text } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

const POPULAR_HOSPITALS = [
  { id: 'sanjeevi', name: 'Sanjeevi Hospital', location: 'Anna Nagar, Chennai' },
  { id: 'apollo', name: 'Apollo Hospitals', location: 'Greams Road, Chennai' },
  { id: 'mm', name: 'MM Hospital', location: 'T. Nagar, Chennai' },
  { id: 'fortis', name: 'Fortis Malar Hospital', location: 'Adyar, Chennai' },
  { id: 'kauvery', name: 'Kauvery Hospital', location: 'Alwarpet, Chennai' },
];

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

  const displayList = query.trim() ? hospitals : POPULAR_HOSPITALS;

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

      {/* Header Bar */}
      <View style={styles.headerRow}>
        {onBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        <View style={styles.taglineContainer}>
          <Text style={styles.taglineText}>BETTER</Text>
          <Text style={styles.taglineText}>CARE</Text>
          <Text style={styles.taglineText}>CLOSER</Text>
          <Text style={styles.taglineText}>TO YOU</Text>
          <Text style={styles.taglineText}>—</Text>
        </View>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.brandTitle}>MediKiosk</Text>
        <Heading style={styles.title}>Book a Time Slot</Heading>
        <Text style={styles.subtitle}>
          Search for your hospital, pick a slot, and arrive 10 minutes early to complete registration at the kiosk.
        </Text>
      </View>

      {/* Search Input Section */}
      <View style={styles.searchSection}>
        <Text style={styles.inputLabel}>Hospital name</Text>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#7C8881" style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. Sanjeevi, City Care..."
            placeholderTextColor="#7C8881"
            style={styles.searchInputText}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#9EABA2" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="close-circle" size={18} color="#C4CCC6" />
          )}
        </View>
      </View>

      <ErrorBanner message={error} />

      {loading && <LoadingBlock label="Searching hospitals..." />}

      {/* List Container */}
      <View style={styles.body}>
        <Text style={styles.sectionHeader}>
          {query.trim() ? 'Search results' : 'Popular hospitals near you'}
        </Text>

        {!loading && searched && hospitals.length === 0 && !error && (
          <Text style={styles.emptyText}>No hospitals matched "{query}".</Text>
        )}

        {(!searched || hospitals.length > 0) && (
          <View style={styles.cardWrapper}>
            <FlatList
              data={displayList}
              keyExtractor={(item, index) => item.id || item.code || String(index)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                const isLast = index === displayList.length - 1;
                return (
                  <TouchableOpacity
                    style={[styles.hospitalRow, isLast && styles.hospitalRowLast]}
                    onPress={() => onSelectHospital(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.hospitalInfo}>
                      <Text style={styles.hospitalName}>{item.name}</Text>
                      <Text style={styles.hospitalLocation}>
                        {item.location || item.city || item.address || 'Central Branch, Chennai'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={18} color="#8B968F" />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* Bottom Banner */}
        <View style={styles.helpBanner}>
          <View style={styles.pinIconBadge}>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          <View style={styles.helpTextContainer}>
            <Text style={styles.helpTitle}>Can't find your hospital?</Text>
            <Text style={styles.helpSubtitle}>Try searching with the hospital name or area.</Text>
          </View>
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
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
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  searchSection: {
    paddingHorizontal: spacing.lg + 2,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: '#3F6A52',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#7C8881',
  },
  clearButton: {
    padding: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.sm,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  cardWrapper: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  hospitalRowLast: {
    borderBottomWidth: 0,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  hospitalLocation: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  helpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF4EE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5E4D8',
    padding: 14,
    marginTop: 18,
    gap: 12,
  },
  pinIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCE9DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 12,
    color: '#5F7367',
  },
});

