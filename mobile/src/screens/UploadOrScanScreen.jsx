import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  { key: 'Other Report', label: 'Other Report' },
];

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

export default function UploadOrScanScreen({ mode = 'upload', patientId, hospital, onDone, onBack }) {
  const [encounterId, setEncounterId] = useState(null);
  const [resolving, setResolving] = useState(true);
  const [category, setCategory] = useState('Prescription');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedName, setUploadedName] = useState(null);

  useEffect(() => {
    (async () => {
      setResolving(true);
      const result = await callApi(() =>
        mobileApi.resolveUploadEncounter(patientId, hospital?.id || 'sanjeevi')
      );
      setResolving(false);
      if (result.ok) setEncounterId(result.data.encounter_id);
      else setError(result.error);
    })();
  }, [hospital?.id, patientId]);

  const submitAsset = async (asset) => {
    setUploading(true);
    setError(null);
    const uploadResult = await callApi(() =>
      mobileApi.uploadDocument(encounterId || 'enc-001', category, asset.file)
    );
    setUploading(false);
    if (!uploadResult.ok) {
      setError(uploadResult.error);
      return;
    }
    setUploadedName(asset.name || 'document.jpg');
  };

  // ACTION 1: OPEN FILE MANAGER
  const handleUploadFile = async () => {
    setError(null);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,application/pdf,.doc,.docx';
        input.onchange = async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            await submitAsset({ name: file.name, file });
          }
        };
        input.click();
        return;
      } catch (_) {}
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_MIME_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.length) return;
      await submitAsset(result.assets[0]);
    } catch (e) {
      setError('Could not open the file manager.');
    }
  };

  // ACTION 2: OPEN CAMERA TO CAPTURE
  const handleScan = async () => {
    setError(null);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        // HTML5 capture="environment" instructs mobile & desktop browsers to invoke the camera
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.setAttribute('capture', 'environment');
        input.onchange = async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            await submitAsset({ name: file.name || `camera-scan-${Date.now()}.jpg`, file });
          }
        };
        input.click();
        return;
      } catch (err) {
        // Continue to native fallback
      }
    }

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError('Camera permission is required to scan a document.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await submitAsset({ name: file.name, file });
    } catch (e) {
      setError('Could not open camera on this device.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {onBack && (
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backLink}>← Back</Text>
          </TouchableOpacity>
        )}

        <Heading style={styles.title}>
          {mode === 'scan' ? '📷 Scan Document' : mode === 'both' ? '📄 Scan / Upload Document' : '📁 Upload Document'}
        </Heading>
        <Text style={styles.subtitle}>
          Files uploaded here are saved directly to your centralized hospital record and immediately available to consulting doctors at {hospital?.name || 'Sanjeevi Hospital'}.
        </Text>

        {resolving ? (
          <LoadingBlock label="Connecting to central database..." />
        ) : (
          <>
            <Text style={styles.label}>Select Document Type</Text>
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
                <Text style={styles.successText}>✓ "{uploadedName}" saved to Central Database!</Text>
                <Text style={styles.successSubtext}>Visible to doctors under your queue token.</Text>
              </View>
            )}

            {/* ACTION BUTTONS: PRIMARY + ALTERNATIVE */}
            <View style={styles.actionSection}>
              {mode === 'both' ? (
                <>
                  <Button
                    title={uploading ? 'Capturing Document...' : '📷 Scan via Camera (Live)'}
                    onPress={handleScan}
                    disabled={uploading}
                  />
                  <Button
                    title={uploading ? 'Uploading File...' : '📁 Upload from File Manager (PDF/Images)'}
                    variant="secondary"
                    onPress={handleUploadFile}
                    disabled={uploading}
                    style={styles.altButton}
                  />
                </>
              ) : mode === 'scan' ? (
                <>
                  <Button
                    title={uploading ? 'Uploading Scan...' : '📷 Open Camera & Capture'}
                    onPress={handleScan}
                    disabled={uploading}
                  />
                  <Button
                    title="📁 Or Pick from File Manager"
                    variant="secondary"
                    onPress={handleUploadFile}
                    disabled={uploading}
                    style={styles.altButton}
                  />
                </>
              ) : (
                <>
                  <Button
                    title={uploading ? 'Uploading File...' : '📁 Open File Manager'}
                    onPress={handleUploadFile}
                    disabled={uploading}
                  />
                  <Button
                    title="📷 Or Open Camera to Scan"
                    variant="secondary"
                    onPress={handleScan}
                    disabled={uploading}
                    style={styles.altButton}
                  />
                </>
              )}
            </View>

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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  chipActive: { backgroundColor: colors.emeraldSoft, borderColor: colors.emerald },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  chipTextActive: { color: colors.emeraldDark },
  successBanner: {
    backgroundColor: colors.successLight,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successText: { color: colors.success, fontWeight: '700', textAlign: 'center' },
  successSubtext: { color: colors.emeraldDark, fontSize: 12, textAlign: 'center', marginTop: 2 },
  actionSection: { gap: spacing.sm, marginTop: spacing.sm },
  altButton: { marginTop: spacing.xs },
  doneButton: { marginTop: spacing.md },
});
