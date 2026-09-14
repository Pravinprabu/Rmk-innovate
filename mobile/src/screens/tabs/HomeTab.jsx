import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Text } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/tokens';

export default function HomeTab({
  fullName,
  onStartExamine,
  onBookAppointment,
  onScanOrUploadDocument,
}) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Right Leaf Watermark */}
      <View style={styles.topRightLeafContainer} pointerEvents="none">
        <View style={styles.leafMain} />
        <View style={styles.leafSecondary} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>MediKiosk</Text>
            <Text style={styles.brandSubtitle}>Care made simpler</Text>
          </View>

          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Greeting Section */}
        <View style={styles.titleSection}>
          <Heading style={styles.title}>Hi, {fullName || 'Pravin Prabu'}</Heading>
          <Text style={styles.subtitle}>Choose one of the 3 health options below:</Text>
        </View>

        {/* 3 Main Action Cards */}
        <View style={styles.options}>
          {/* OPTION 1: START EXAMINE */}
          <TouchableOpacity onPress={onStartExamine} activeOpacity={0.88}>
            <View style={[styles.card, styles.cardAccent]}>
              <View style={styles.cardTopRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>AI Assessment</Text>
                </View>
              </View>

              <View style={styles.cardContentRow}>
                <View style={styles.cardMainText}>
                  <Text style={styles.optionTitle}>1. Start Examine</Text>
                  <Text style={styles.optionBody}>
                    Answer 15 adaptive clinical questions as an allopathic doctor to generate an automated medical summary for Dr. Raj.
                  </Text>
                </View>

                <View style={styles.actionBtnAccent}>
                  <Ionicons name="chevron-forward" size={18} color={colors.surfaceWhite} />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* OPTION 2: BOOK APPOINTMENT */}
          <TouchableOpacity onPress={onBookAppointment} activeOpacity={0.88}>
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>Instant Queue</Text>
                </View>
              </View>

              <View style={styles.cardContentRow}>
                <View style={styles.cardMainText}>
                  <Text style={styles.optionTitle}>2. Book Appointment</Text>
                  <Text style={styles.optionBody}>
                    Search Sanjeevi Hospital, pick a department, and book your 30-minute priority consultation token slot.
                  </Text>
                </View>

                <View style={styles.actionBtn}>
                  <Ionicons name="chevron-forward" size={18} color="#6B756E" />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* OPTION 3: SCAN / UPLOAD DOCUMENT */}
          <TouchableOpacity onPress={onScanOrUploadDocument} activeOpacity={0.88}>
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="document-attach-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>Camera & Files</Text>
                </View>
              </View>

              <View style={styles.cardContentRow}>
                <View style={styles.cardMainText}>
                  <Text style={styles.optionTitle}>3. Scan / Upload Document</Text>
                  <Text style={styles.optionBody}>
                    Open device camera to live-scan prescriptions, or open file manager to attach existing PDF lab reports.
                  </Text>
                </View>

                <View style={styles.actionBtn}>
                  <Ionicons name="chevron-forward" size={18} color="#6B756E" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconBox}>
            <Ionicons name="leaf-outline" size={22} color={colors.emerald} />
          </View>
          <View style={styles.bannerDivider} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Your health, organised in one place</Text>
            <Text style={styles.bannerSubtitle}>Quick access. Faster care. Better you.</Text>
          </View>
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
  scroll: {
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 22,
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 16,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  options: {
    gap: 14,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
  },
  cardAccent: {
    borderColor: '#DCE9DF',
    backgroundColor: '#F8FAF8',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  tagBadge: {
    backgroundColor: '#E1ECE3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardMainText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  optionBody: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 20,
    color: '#6B756E',
    fontWeight: '600',
    marginTop: -2,
  },
  actionBtnAccent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTextAccent: {
    fontSize: 20,
    color: colors.surfaceWhite,
    fontWeight: '700',
    marginTop: -2,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3EE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4E3D8',
    padding: 14,
  },
  bannerIconBox: {
    paddingRight: 10,
  },
  bannerIcon: {
    fontSize: 22,
  },
  bannerDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#C5D8CC',
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
});
