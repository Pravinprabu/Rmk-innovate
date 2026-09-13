import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { callApi, mobileApi } from '../api/client';
import { Button, ErrorBanner, Heading, Text, TextField } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';

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

  const canSubmitLogin = loginPhone.trim().length === 10 && loginOtp.trim().length >= 4;
  const canSubmitSignup = fullName.trim().length > 1 && signupPhone.trim().length === 10;

  const handleFillDemo = () => {
    setLoginPhone('9876543210');
    setLoginOtp('123456');
    setError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const payload =
      tab === 'login'
        ? {
            mobile_number: loginPhone.trim(),
            otp: loginOtp.trim(),
            language,
          }
        : {
            full_name: fullName.trim(),
            mobile_number: signupPhone.trim(),
            age_years: parseInt(age, 10) || 25,
            gender: gender,
            language,
          };

    const result = await callApi(() => mobileApi.identify(payload));
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onNext({
      patientId: result.data.patient_id,
      encounterId: result.data.encounter_id,
      fullName: result.data.full_name,
      mobileNumber: result.data.mobile_number,
      tokenNo: result.data.token_no,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {onBack && (
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backLink}>← Back</Text>
          </TouchableOpacity>
        )}

        <Heading style={styles.title}>Patient Portal</Heading>
        <Text style={styles.subtitle}>Log in or register directly to access your medical records.</Text>

        {/* Tab Switcher: Login vs Sign Up */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'login' && styles.tabButtonActive]}
            onPress={() => {
              setTab('login');
              setError(null);
            }}
          >
            <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'signup' && styles.tabButtonActive]}
            onPress={() => {
              setTab('signup');
              setError(null);
            }}
          >
            <Text style={[styles.tabText, tab === 'signup' && styles.tabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {tab === 'login' ? (
          <View style={styles.form}>
            <TextField
              label="Phone Number"
              placeholder="10-digit mobile number"
              value={loginPhone}
              onChangeText={(v) => setLoginPhone(v.replace(/\D/g, '').slice(0, 10))}
              keyboardType="number-pad"
            />
            <TextField
              label="OTP Code"
              placeholder="Enter 6-digit OTP"
              value={loginOtp}
              onChangeText={(v) => setLoginOtp(v.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.demoFillBtn} onPress={handleFillDemo}>
              <Text style={styles.demoFillText}>⚡ Quick Fill Demo (9876543210 / 123456)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <TextField
              label="Full Name"
              placeholder="e.g. Pravin Prabu"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextField
              label="Phone Number"
              placeholder="10-digit mobile number"
              value={signupPhone}
              onChangeText={(v) => setSignupPhone(v.replace(/\D/g, '').slice(0, 10))}
              keyboardType="number-pad"
            />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <TextField
                  label="Age"
                  placeholder="e.g. 24"
                  value={age}
                  onChangeText={(v) => setAge(v.replace(/\D/g, '').slice(0, 3))}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {['Male', 'Female'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                      onPress={() => setGender(g)}
                    >
                      <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        <ErrorBanner message={error} />

        <Button
          title={submitting ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create Account'}
          onPress={handleSubmit}
          disabled={tab === 'login' ? !canSubmitLogin || submitting : !canSubmitSignup || submitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  backLink: { color: colors.emeraldDark, fontWeight: '700', marginBottom: spacing.md },
  title: { fontSize: 26, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.lg, fontSize: 14 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceWhite,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  tabButtonActive: {
    backgroundColor: colors.emerald,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.surfaceWhite,
  },
  form: { marginBottom: spacing.md },
  demoFillBtn: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  demoFillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.emeraldDark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    height: 48,
    alignItems: 'center',
  },
  genderBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderBtnActive: {
    borderColor: colors.emerald,
    backgroundColor: colors.emeraldSoft,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  genderTextActive: {
    color: colors.emeraldDark,
  },
});
