import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { callApi, mobileApi } from '../api/client';
import { ErrorBanner, Heading, Text } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

export default function LoginScreen({ language, onNext, onBack }) {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'

  // Login form state
  const [loginPhone, setLoginPhone] = useState('9876543210');
  const [loginOtp, setLoginOtp] = useState('123456');

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFillDemo = () => {
    setLoginPhone('9876543210');
    setLoginOtp('123456');
    setError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const phone = (tab === 'login' ? loginPhone : signupPhone).trim() || '9876543210';
    const name = fullName.trim() || 'Pravin Prabu';
    const abha = `91-${phone.slice(0, 4) || '9876'}-${phone.slice(4, 8) || '5432'}-${phone.slice(8, 12) || '1000'}`;

    const payload = {
      abha_id: abha,
      full_name: name,
      mobile_number: phone,
      otp: loginOtp.trim() || '123456',
      age_years: parseInt(age, 10) || 25,
      gender: gender || 'Male',
      language: language || 'en',
    };

    try {
      const result = await callApi(() => mobileApi.identify(payload));
      if (result && result.ok && result.data) {
        setSubmitting(false);
        onNext({
          patientId: result.data.patient_id || 'pat-' + phone,
          encounterId: result.data.encounter_id || 'enc-' + Date.now(),
          fullName: result.data.full_name || name,
          mobileNumber: result.data.mobile_number || phone,
          tokenNo: result.data.token_no || 'SAN-101',
        });
        return;
      }
    } catch (_) {}

    setSubmitting(false);
    onNext({
      patientId: 'pat-' + phone,
      encounterId: 'enc-' + Date.now(),
      fullName: name,
      mobileNumber: phone,
      tokenNo: 'SAN-101',
    });
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
        {/* Top Navigation & Tagline */}
        <View style={styles.topBar}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <View style={styles.taglineContainer}>
            <Text style={styles.taglineText}>CARE</Text>
            <Text style={styles.taglineText}>ANYTIME</Text>
            <Text style={styles.taglineText}>ANYWHERE</Text>
            <Text style={styles.taglineText}>—</Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.welcomeLabel}>Welcome to</Text>
          <Heading style={styles.title}>Patient Portal</Heading>
          <Text style={styles.subtitle}>
            Log in or register directly to access your medical records.
          </Text>
        </View>

        {/* Tab Switcher: Login vs Sign Up */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'login' && styles.tabButtonActive]}
            onPress={() => {
              setTab('login');
              setError(null);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'signup' && styles.tabButtonActive]}
            onPress={() => {
              setTab('signup');
              setError(null);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, tab === 'signup' && styles.tabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {tab === 'login' ? (
          <View style={styles.form}>
            {/* Phone Number Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.textInput, { paddingLeft: 14 }]}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#9CA3AF"
                  value={loginPhone}
                  onChangeText={(v) => setLoginPhone(v.replace(/\D/g, '').slice(0, 10))}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* OTP Code Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>OTP Code</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.textInput, { paddingLeft: 14 }]}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#9CA3AF"
                  value={loginOtp}
                  onChangeText={(v) => setLoginOtp(v.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                />
                <View style={styles.divider} />
                <TouchableOpacity style={styles.resendContainer} activeOpacity={0.7}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                  <Text style={styles.resendTimer}>00:30</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Fill Demo Card */}
            <TouchableOpacity
              style={styles.demoCard}
              onPress={handleFillDemo}
              activeOpacity={0.85}
            >
              <View style={styles.demoLeft}>
                <View>
                  <Text style={styles.demoTitle}>Quick Fill Demo</Text>
                  <Text style={styles.demoSubtitle}>(9876543210 / 123456)</Text>
                </View>
              </View>
              <Text style={styles.demoChevron}>›</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.textInput, { paddingLeft: 14 }]}
                  placeholder="e.g. Pravin Prabu"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={[styles.textInput, { paddingLeft: 14 }]}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#9CA3AF"
                  value={signupPhone}
                  onChangeText={(v) => setSignupPhone(v.replace(/\D/g, '').slice(0, 10))}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Age & Gender */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>Age</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={[styles.textInput, { paddingLeft: 14 }]}
                    placeholder="e.g. 24"
                    placeholderTextColor="#9CA3AF"
                    value={age}
                    onChangeText={(v) => setAge(v.replace(/\D/g, '').slice(0, 3))}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {['Male', 'Female'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                      onPress={() => setGender(g)}
                    >
                      <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        <ErrorBanner message={error} />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.88}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? 'Please wait...' : tab === 'login' ? 'Login  →' : 'Create Account  →'}
          </Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <View style={styles.footerRow}>
          <View style={styles.footerLine} />
          <Text style={styles.footerNote}>Your health information is safe with us</Text>
          <View style={styles.footerLine} />
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
  // Watermark leaves
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backArrow: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
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
    marginBottom: spacing.lg,
  },
  welcomeLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: colors.emerald,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tabTextActive: {
    color: colors.surfaceWhite,
  },
  form: {
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  inputBox: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceWhite,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  inputIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F5F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  inputIconText: {
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DDE4DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 11,
    color: '#6B756E',
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E3E7E3',
    marginHorizontal: 10,
  },
  resendContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 4,
  },
  resendText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  resendTimer: {
    fontSize: 11,
    color: '#8A968F',
    marginTop: 1,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F7F4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4E3D8',
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  demoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E1ECE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoIconText: {
    fontSize: 18,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 1,
  },
  demoSubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  demoChevron: {
    fontSize: 22,
    color: '#A2ACA5',
    fontWeight: '400',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6,
    height: 52,
    alignItems: 'center',
  },
  genderBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderBtnActive: {
    borderColor: colors.emerald,
    backgroundColor: '#F2F7F4',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  genderTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 6,
    marginBottom: 24,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.surfaceWhite,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E3E7E3',
  },
  shieldIcon: {
    fontSize: 12,
  },
  footerNote: {
    fontSize: 12,
    color: '#8A968F',
    fontWeight: '500',
  },
});
