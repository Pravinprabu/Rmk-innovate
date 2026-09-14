import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { callApi, mobileApi } from '../../api/client';
import { ErrorBanner, Heading, LoadingBlock, Text } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/tokens';

function getInitials(name) {
  if (!name) return 'PP';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ProfileTab({ patientId, onNavigateTab, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => mobileApi.getProfile(patientId));
      setLoading(false);
      if (result.ok) setProfile(result.data);
      else setError(result.error);
    })();
  }, [patientId]);

  const fullName = profile?.full_name || 'Pravin Prabu';
  const abhaId = profile?.abha_id || '—';
  const mobileNumber = profile?.mobile_number || '9876543210';
  const dateJoined = profile?.date_joined ? formatDate(profile.date_joined) : 'Invalid Date';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Right Leaf Watermark */}
      <View style={styles.topRightLeafContainer} pointerEvents="none">
        <View style={styles.leafMain} />
        <View style={styles.leafSecondary} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.headerRow}>
          <View style={styles.titleSection}>
            <Heading style={styles.title}>Profile</Heading>
            <Text style={styles.subtitle}>Manage your information and access your health records.</Text>
          </View>

          <View style={styles.taglineContainer}>
            <Text style={styles.taglineText}>HEALTHIER</Text>
            <Text style={styles.taglineText}>DAYS</Text>
            <Text style={styles.taglineText}>A BRIGHTER</Text>
            <Text style={styles.taglineText}>YOU</Text>
            <Text style={styles.taglineText}>—</Text>
          </View>
        </View>

        <ErrorBanner message={error} />

        {loading ? (
          <LoadingBlock label="Loading profile..." />
        ) : (
          <>
            {/* User Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{getInitials(fullName)}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{fullName}</Text>
                  <Text style={styles.profileRole}>Patient</Text>
                </View>
                <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
                  <Ionicons name="create-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardDivider} />

              {/* Detail Rows */}
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={styles.detailIconBadge}>
                    <Ionicons name="card-outline" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.detailLabel}>ABHA ID</Text>
                </View>
                <Text style={styles.detailValue}>{abhaId}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={styles.detailIconBadge}>
                    <Ionicons name="call-outline" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.detailLabel}>Mobile number</Text>
                </View>
                <Text style={styles.detailValue}>{mobileNumber}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <View style={styles.detailIconBadge}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.detailLabel}>Date joined</Text>
                </View>
                <Text style={styles.detailValue}>{dateJoined}</Text>
              </View>
            </View>

            {/* Quick Access Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <View style={styles.quickAccessRow}>
                <TouchableOpacity
                  style={styles.quickAccessCard}
                  onPress={() => onNavigateTab && onNavigateTab('aiSummary')}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickIconBadge}>
                    <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.quickCardText}>
                    <View style={styles.quickTitleRow}>
                      <Text style={styles.quickTitle}>AI Summaries</Text>
                      <Ionicons name="chevron-forward-outline" size={14} color={colors.primary} />
                    </View>
                    <Text style={styles.quickSubtitle} numberOfLines={2}>
                      View your consultation summaries
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAccessCard, styles.quickAccessCardTeal]}
                  onPress={() => onNavigateTab && onNavigateTab('reports')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickIconBadge, styles.quickIconBadgeTeal]}>
                    <Ionicons name="document-outline" size={18} color="#2A5A4E" />
                  </View>
                  <View style={styles.quickCardText}>
                    <View style={styles.quickTitleRow}>
                      <Text style={styles.quickTitle}>Reports</Text>
                      <Ionicons name="chevron-forward-outline" size={14} color="#2A5A4E" />
                    </View>
                    <Text style={styles.quickSubtitle} numberOfLines={2}>
                      View and manage your reports
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Account & Settings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account & Settings</Text>
              <View style={styles.settingsCard}>
                <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                  <View style={styles.settingIconBadge}>
                    <Ionicons name="person-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Personal Information</Text>
                    <Text style={styles.settingSubtitle}>View and update your details</Text>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={18} color="#8B968F" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                  <View style={styles.settingIconBadge}>
                    <Ionicons name="shield-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Privacy & Security</Text>
                    <Text style={styles.settingSubtitle}>Manage your data and preferences</Text>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={18} color="#8B968F" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.settingRow, styles.settingRowLast]} activeOpacity={0.7}>
                  <View style={styles.settingIconBadge}>
                    <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Help & Support</Text>
                    <Text style={styles.settingSubtitle}>Get help or contact us</Text>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={18} color="#8B968F" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Log Out Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            {/* Bottom Security Note */}
            <View style={styles.securityRow}>
              <Ionicons name="shield-checkmark-outline" size={15} color="#6B756E" style={{ marginRight: 6 }} />
              <Text style={styles.securityText}>Your health information is safe with us</Text>
            </View>
          </>
        )}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  taglineContainer: {
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  taglineText: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#8A968F',
    letterSpacing: 1.2,
    lineHeight: 11,
  },
  profileCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    marginBottom: 20,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DCE9DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF4F0',
    borderWidth: 1,
    borderColor: '#D5E2D8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAccessCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EBF3EE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5E4D8',
    padding: 12,
  },
  quickAccessCardTeal: {
    backgroundColor: '#E5F2EE',
    borderColor: '#D0E3DD',
  },
  quickIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCE9DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  quickIconBadgeTeal: {
    backgroundColor: '#CCE7E0',
  },
  quickCardText: {
    flex: 1,
  },
  quickTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quickSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  settingsCard: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: '#C8D8CC',
    height: 48,
    borderRadius: 24,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  securityText: {
    fontSize: 12,
    color: '#6B756E',
    fontWeight: '500',
  },
});

