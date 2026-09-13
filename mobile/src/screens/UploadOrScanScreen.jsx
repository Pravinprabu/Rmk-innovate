import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { callApi, mobileApi } from '../api/client';
import { Button, ErrorBanner, Heading, LoadingBlock, Text } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';

const CATEGORIES = [
  { key: 'Prescription', label: 'Prescription' },
  { key: 'Lab Report', label: 'Lab Report' },
  { key: 'Discharge Summary', label: 'Discharge Summary' },
  { key: 'Other Report', label: 'Other' },
];

const ALLOWED_MIME_TYPES = [
  'image/png', 'image/jpeg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword', 'application/vnd.ms-powerpoint',
];

// Reports tab's Upload/Scan action, once a hospital has been picked
// (SearchHospitalScreen, reused). `mode` picks which native picker runs --
// "upload" opens the file manager (any format), "scan" opens the phone's
// camera directly -- but both land on the same encounter-resolve + category
// + submit flow, so there's one screen instead of two near-duplicates.
export default function UploadOrScanScreen({ mode, patientId, hospital, onDone, onBack }) {
  const [encounterId, setEncounterId] = useState(null);
  const [resolving, setResolving] = useState(true);
  const [category, setCategory] = useState('Other Report');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedName, setUploadedName] = useState(null);

  useEffect(() => {
    (async () => {
      setResolving(true);
      const result = await callApi(() => mobileApi.resolveUploadEncounter(patientId, hospital.id));
      setResolving(false);
      if (result.ok) setEncounterId(result.data.encounter_id);
      else setError(result.error);
    })();
  }, [hospital.id]);

  const submitAsset = async (asset) => {
    setUploading(true);
    const uploadResult = await callApi(() => mobileApi.uploadDocument(encounterId, category, asset.file));
    setUploading(false);
    if (!uploadResult.ok) {
      setError(uploadResult.error);
      return;
    }
    setUploadedName(asset.name);
  };

  const handleUploadFile = async () => {
    setError(null);
    let result;
    try {
      result = await DocumentPicker.getDocumentAsync({ type: ALLOWED_MIME_TYPES, copyToCacheDirectory: true, multiple: false });
    } catch {
      setError('Could not open the file picker.');
      return;
    }
    if (result.canceled || !result.assets?.length) return;
    await submitAsset(result.assets[0]);
  };

  const handleScan = async () => {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Camera permission is required to scan a document.');
      return;
    }
    let result;
    try {
      result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    } catch {
      setError('Could not open the camera.');
      return;
    }
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    // ImagePicker assets don't carry a ready-made `file` (unlike
    // DocumentPicker's web File object) -- build one from the captured URI
    // so it goes through the exact same multipart upload path.
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
    await submitAsset({ name: file.name, file });
  };

  const actionLabel = mode === 'scan' ? '📷  Open Camera & Scan' : '⬆  Choose & Upload File';
  const handleAction = mode === 'scan' ? handleScan : handleUploadFile;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>← Change hospital</Text>
        </TouchableOpacity>

        <Heading style={styles.title}>{mode === 'scan' ? 'Scan a Document' : 'Upload a Document'}</Heading>
        <Text style={styles.subtitle}>
          For {hospital.name} -- saved to your record and visible to hospital staff when you visit
          any hospital.
        </Text>

        {resolving ? (
          <LoadingBlock label="Preparing..." />
        ) : (
          <>
            <Text style={styles.label}>Document type</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.chip, category === c.key && styles.chipActive]}
                  onPress={() => setCategory(c.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, category === c.key && styles.chipTextActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ErrorBanner message={error} />

            {uploadedName && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>✓ "{uploadedName}" saved successfully.</Text>
              </View>
            )}

            <Button title={uploading ? 'Uploading...' : actionLabel} onPress={handleAction} disabled={uploading || !encounterId} />
            <Button title="Done" variant="secondary" onPress={onDone} style={styles.doneButton} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  backLink: { color: colors.emeraldDark, fontWeight: '700', marginBottom: spacing.md },
  title: { fontSize: 24, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.pill, backgroundColor: colors.surfaceWhite,
    borderWidth: 1.5, borderColor: colors.borderLight,
  },
  chipActive: { backgroundColor: colors.emeraldSoft, borderColor: colors.emerald },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  chipTextActive: { color: colors.emeraldDark },
  successBanner: {
    backgroundColor: colors.successLight, borderRadius: radius.card,
    padding: spacing.md, marginBottom: spacing.md,
  },
  successText: { color: colors.success, fontWeight: '700', textAlign: 'center' },
  doneButton: { marginTop: spacing.md },
});
