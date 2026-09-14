import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { callApi, mobileApi } from '../api/client';
import { ErrorBanner, Heading, LoadingBlock, Text } from '../components/ui';
import DocumentScannerModal from '../components/DocumentScannerModal';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

const CATEGORIES = [
  { key: 'Prescription', label: 'Prescription', icon: 'document-text-outline' },
  { key: 'Lab Report', label: 'Lab Report', icon: 'flask-outline' },
  { key: 'Discharge Summary', label: 'Discharge Summary', icon: 'receipt-outline' },
  { key: 'Other Report', label: 'Other Report', icon: 'ellipsis-horizontal-outline' },
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
  const [scannerOpen, setScannerOpen] = useState(false);
  const [initialScanFile, setInitialScanFile] = useState(null);

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

  // ACTION 2: OPEN DOCUMENT SCANNER & CAMERA
  const handleScan = async () => {
    setError(null);
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
    const hasGetUserMedia = typeof navigator !== 'undefined' && !!(navigator?.mediaDevices?.getUserMedia);

    // On mobile devices or browsers without getUserMedia over HTTP, launch native camera directly
    if (Platform.OS === 'web' && (isMobile || !hasGetUserMedia)) {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
          const file = e.target.files?.[0];
          if (file) {
            setInitialScanFile(file);
            setScannerOpen(true);
          }
        };
        input.click();
        return;
      } catch (_) {}
    } else if (Platform.OS !== 'web') {
      try {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.granted) {
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.95,
          });
          if (!result.canceled && result.assets?.[0]) {
            setInitialScanFile(result.assets[0]);
            setScannerOpen(true);
            return;
          }
        }
      } catch (_) {}
    }

    // Default fallback: open scanner modal (which also has the native camera trigger)
    setScannerOpen(true);
  };

  const handleSaveFromScanner = async (asset) => {
    await submitAsset(asset);
  };

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
        {/* Top Header Bar */}
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
            <Text style={styles.taglineText}>YOUR</Text>
            <Text style={styles.taglineText}>HEALTH</Text>
            <Text style={styles.taglineText}>OUR</Text>
            <Text style={styles.taglineText}>PRIORITY</Text>
            <Text style={styles.taglineText}>—</Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.brandTitle}>MediKiosk</Text>
          <Heading style={styles.title}>Scan / Upload Document</Heading>
          <Text style={styles.subtitle}>
            Files uploaded here are saved directly to your centralized hospital record and immediately available to consulting doctors at {hospital?.name || 'Sanjeevi Hospital'}.
          </Text>
        </View>

        {resolving ? (
          <LoadingBlock label="Connecting to central database..." />
        ) : (
          <>
            {/* Category Chips */}
            <View style={styles.categorySection}>
              <Text style={styles.label}>Select Document Type</Text>
              <View style={styles.chipsRow}>
                {CATEGORIES.map((c) => {
                  const isActive = category === c.key;
                  return (
                    <TouchableOpacity
                      key={c.key}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setCategory(c.key)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={c.icon}
                        size={15}
                        color={isActive ? colors.primary : colors.textSecondary}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{c.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <ErrorBanner message={error} />

            {uploadedName && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>✓ "{uploadedName}" saved to Central Database!</Text>
                <Text style={styles.successSubtext}>Visible to doctors under your queue token.</Text>
              </View>
            )}

            {/* Live Camera Box */}
            <View style={styles.cameraBoxContainer}>
              <View style={styles.cameraIconBadge}>
                <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                <View style={styles.plusBadge}>
                  <Ionicons name="add-circle" size={16} color={colors.primary} />
                </View>
              </View>
              <Text style={styles.cameraBoxTitle}>Scan via Camera (Live)</Text>
              <Text style={styles.cameraBoxSubtitle}>Open your camera to scan documents instantly.</Text>

              <TouchableOpacity
                style={[styles.openCameraButton, uploading && styles.disabledButton]}
                onPress={handleScan}
                disabled={uploading}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.openCameraText}>
                  {uploading ? 'Capturing...' : 'Open Camera'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* OR Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* File Manager Upload Card */}
            <TouchableOpacity
              style={[styles.fileCard, uploading && styles.disabledButton]}
              onPress={handleUploadFile}
              disabled={uploading}
              activeOpacity={0.85}
            >
              <View style={styles.folderIconBadge}>
                <Ionicons name="folder-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.fileCardInfo}>
                <Text style={styles.fileCardTitle}>Upload from File Manager</Text>
                <Text style={styles.fileCardSubtitle}>Select PDF, JPG or PNG files from your device.</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#8B968F" />
            </TouchableOpacity>

            {/* Done Action Button */}
            <TouchableOpacity style={styles.doneButton} onPress={onDone} activeOpacity={0.88}>
              <Text style={styles.doneButtonText}>Done</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            {/* Bottom Security Note */}
            <View style={styles.securityRow}>
              <View style={styles.securityLine} />
              <View style={styles.securityContent}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#6B756E" style={{ marginRight: 4 }} />
                <Text style={styles.securityText}>Your documents are secure with us</Text>
              </View>
              <View style={styles.securityLine} />
            </View>
          </>
        )}
      </ScrollView>

      <DocumentScannerModal
        visible={scannerOpen}
        category={category}
        initialFile={initialScanFile}
        onClose={() => {
          setScannerOpen(false);
          setInitialScanFile(null);
        }}
        onSaveScan={handleSaveFromScanner}
      />
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
  scroll: {
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  categorySection: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipActive: {
    backgroundColor: '#DCE9DF',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  successBanner: {
    backgroundColor: colors.successLight,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successText: {
    color: colors.success,
    fontWeight: '700',
    textAlign: 'center',
  },
  successSubtext: {
    color: colors.emeraldDark,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  cameraBoxContainer: {
    borderWidth: 1.5,
    borderColor: '#C5D4C9',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  cameraIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DCE9DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  plusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.surfaceWhite,
    borderRadius: 8,
  },
  cameraBoxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cameraBoxSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  openCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    height: 46,
    paddingHorizontal: 28,
    borderRadius: 23,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  openCameraText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.surfaceWhite,
  },
  disabledButton: {
    opacity: 0.6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#8B968F',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
  },
  folderIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCE9DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileCardInfo: {
    flex: 1,
  },
  fileCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  fileCardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    height: 50,
    borderRadius: 25,
    marginTop: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.surfaceWhite,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  securityLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E6E2',
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  securityText: {
    fontSize: 12,
    color: '#6B756E',
    fontWeight: '500',
  },
});

