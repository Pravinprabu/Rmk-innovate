import React, { useEffect, useState } from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { callApi, mobileApi } from '../../api/client';
import { ErrorBanner, Heading, LoadingBlock, Text } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/tokens';

const SAMPLE_DOCUMENTS = [
  {
    id: 'sample-1',
    title: 'Blood Test & CBC Report',
    category: 'Lab Report',
    hospital_name: 'No hospital on file',
    created_at: '2026-09-13T10:00:00Z',
    file_type: 'PDF',
    icon: 'flask-outline',
  },
  {
    id: 'sample-2',
    title: 'Previous Prescription',
    category: 'Prescription',
    hospital_name: 'No hospital on file',
    created_at: '2026-09-12T10:00:00Z',
    file_type: 'PDF',
    icon: 'document-text-outline',
  },
  {
    id: 'sample-3',
    title: 'Chest X-Ray',
    category: 'Radiology',
    hospital_name: 'Sanjeevi Hospital',
    created_at: '2026-09-05T10:00:00Z',
    file_type: 'JPG',
    icon: 'image-outline',
  },
  {
    id: 'sample-4',
    title: 'Discharge Summary',
    category: 'Hospital Document',
    hospital_name: 'Sanjeevi Hospital',
    created_at: '2026-08-28T10:00:00Z',
    file_type: 'PDF',
    icon: 'receipt-outline',
  },
  {
    id: 'sample-5',
    title: 'ECG Report',
    category: 'Lab Report',
    hospital_name: 'Sanjeevi Hospital',
    created_at: '2026-08-14T10:00:00Z',
    file_type: 'PDF',
    icon: 'pulse-outline',
  },
  {
    id: 'sample-6',
    title: 'Allergy Test Report',
    category: 'Lab Report',
    hospital_name: 'No hospital on file',
    created_at: '2026-08-02T10:00:00Z',
    file_type: 'PDF',
    icon: 'document-outline',
  },
];

const FILTER_CHIPS = ['All', 'Lab Reports', 'Prescriptions', 'Others'];

function getDocIcon(category, title) {
  const t = (title || '').toLowerCase();
  const c = (category || '').toLowerCase();
  if (t.includes('blood') || t.includes('test') || c.includes('lab')) return 'flask-outline';
  if (t.includes('prescription') || c.includes('prescription')) return 'document-text-outline';
  if (t.includes('x-ray') || t.includes('scan') || c.includes('radiology')) return 'image-outline';
  if (t.includes('ecg') || t.includes('heart')) return 'pulse-outline';
  if (t.includes('discharge') || c.includes('hospital')) return 'receipt-outline';
  return 'document-outline';
}

function formatDateStr(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReportsTab({ patientId, onUpload, onScan }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const load = async () => {
    setLoading(true);
    const result = await callApi(() => mobileApi.listDocuments(patientId));
    setLoading(false);
    if (result.ok) {
      setDocuments(result.data);
    } else {
      setError(result.error);
    }
  };

  useEffect(() => {
    load();
  }, [patientId]);

  const openDocument = (url) => {
    if (url) Linking.openURL(url);
  };

  const listToDisplay = documents.length > 0 ? documents : SAMPLE_DOCUMENTS;

  const filteredDocuments = listToDisplay.filter((item) => {
    if (activeFilter === 'All') return true;
    const cat = (item.category || '').toLowerCase();
    if (activeFilter === 'Lab Reports') return cat.includes('lab');
    if (activeFilter === 'Prescriptions') return cat.includes('prescription');
    if (activeFilter === 'Others') return !cat.includes('lab') && !cat.includes('prescription');
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Right Leaf Watermark */}
      <View style={styles.topRightLeafContainer} pointerEvents="none">
        <View style={styles.leafMain} />
        <View style={styles.leafSecondary} />
      </View>

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Heading style={styles.title}>Reports</Heading>
          <TouchableOpacity style={styles.searchIconButton} activeOpacity={0.8}>
            <Ionicons name="search-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Every prescription, lab report, and document on file.</Text>

        {/* Filter Chips Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterContainer}
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip;
            return (
              <TouchableOpacity
                key={chip}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(chip)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{chip}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Reports List */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <ErrorBanner message={error} />
        {loading ? (
          <LoadingBlock label="Loading reports..." />
        ) : filteredDocuments.length === 0 ? (
          <Text style={styles.emptyText}>No reports matched "{activeFilter}".</Text>
        ) : (
          filteredDocuments.map((d) => {
            const iconName = d.icon || getDocIcon(d.category, d.title);
            const fileType = d.file_type || (d.file_url?.toLowerCase().endsWith('.jpg') ? 'JPG' : 'PDF');

            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => openDocument(d.file_url)}
                activeOpacity={0.85}
                style={styles.docCard}
              >
                <View style={styles.docIconBadge}>
                  <Ionicons name={iconName} size={24} color={colors.primary} />
                </View>

                <View style={styles.docInfo}>
                  <Text style={styles.docTitle} numberOfLines={1}>
                    {d.title}
                  </Text>
                  <Text style={styles.docMeta} numberOfLines={1}>
                    {d.category} · {d.hospital_name || 'No hospital on file'}
                  </Text>
                  <Text style={styles.docDate}>{formatDateStr(d.created_at)}</Text>
                </View>

                <View style={styles.docRightCol}>
                  <TouchableOpacity style={styles.dotsButton} activeOpacity={0.7}>
                    <Ionicons name="ellipsis-vertical" size={16} color="#6B756E" />
                  </TouchableOpacity>
                  <View style={styles.fileTypeBadge}>
                    <Text style={styles.fileTypeText}>{fileType}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Action Bar (Upload & Scan) */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.uploadButton} onPress={onUpload} activeOpacity={0.88}>
          <Ionicons name="arrow-up-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.uploadBtnTitle}>Upload Document</Text>
            <Text style={styles.uploadBtnSub}>PDF, JPG, PNG</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scanButton} onPress={onScan} activeOpacity={0.88}>
          <Ionicons name="camera-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.scanBtnTitle}>Scan Document</Text>
            <Text style={styles.scanBtnSub}>Use your camera</Text>
          </View>
        </TouchableOpacity>
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
  header: {
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  searchIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  filterContainer: {
    marginHorizontal: -(spacing.lg + 2),
  },
  filterScroll: {
    paddingHorizontal: spacing.lg + 2,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5F7367',
  },
  filterChipTextActive: {
    color: colors.surfaceWhite,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.sm,
    gap: 12,
    paddingBottom: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
  },
  docIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#DCE9DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  docMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  docDate: {
    fontSize: 12,
    color: '#8B968F',
  },
  docRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 48,
  },
  dotsButton: {
    padding: 2,
  },
  fileTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#EAF2EC',
  },
  fileTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F7360',
  },
  actionBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: spacing.lg + 2,
    paddingVertical: 12,
    backgroundColor: colors.bgCanvas,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    borderRadius: 24,
    height: 52,
    paddingHorizontal: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.surfaceWhite,
  },
  uploadBtnSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scanButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: colors.emerald,
    borderRadius: 24,
    height: 52,
    paddingHorizontal: 12,
  },
  scanBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  scanBtnSub: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});

