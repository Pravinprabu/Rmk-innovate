import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { callApi, mobileApi } from '../api/client';
import { Button, ErrorBanner, Heading, Text, TextField } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

// ABHA/hospital IDs display and are stored as "91-8472-9012-3419" (2-4-4-4
// digit groups) -- same format as frontend/src/screens/kiosk/PatientIdScreen.jsx.
function formatAbha(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 14);
  const groups = [digits.slice(0, 2), digits.slice(2, 6), digits.slice(6, 10), digits.slice(10, 14)];
  return groups.filter(Boolean).join('-');
}

// Screen 3 -- "Login". Identifies the patient by ABHA ID (finds or creates
// their record, same as the kiosk) up front, before choosing to book an
// appointment or upload a document -- both of those need to know who this
// is, so asking once here means neither branch has to ask again.
export default function LoginScreen({ language, onNext, onBack }) {
  const [abhaId, setAbhaId] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const abhaDigits = abhaId.replace(/\D/g, '');
  const canSubmit = abhaDigits.length === 14 && fullName.trim().length > 1 && mobileNumber.trim().length === 10;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const result = await callApi(() =>
      mobileApi.identify({ abha_id: abhaId, full_name: fullName.trim(), mobile_number: mobileNumber, language })
    );
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onNext({
      patientId: result.data.patient_id,
      encounterId: result.data.encounter_id,
      fullName: result.data.full_name,
      abhaId,
      mobileNumber,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>

        <Heading style={styles.title}>Identify yourself</Heading>
        <Text style={styles.subtitle}>Enter your ABHA ID to link your hospital record.</Text>

        <View style={styles.form}>
          <TextField
            label="ABHA / Hospital ID"
            placeholder="91-8472-9012-3419"
            value={abhaId}
            onChangeText={(v) => setAbhaId(formatAbha(v))}
            keyboardType="number-pad"
          />
          <TextField label="Full name" placeholder="As on your ID" value={fullName} onChangeText={setFullName} />
          <TextField
            label="Mobile number"
            placeholder="10-digit mobile number"
            value={mobileNumber}
            onChangeText={(v) => setMobileNumber(v.replace(/\D/g, '').slice(0, 10))}
            keyboardType="number-pad"
          />
        </View>

        <ErrorBanner message={error} />

        <Button title={submitting ? 'Checking...' : 'Continue'} onPress={handleSubmit} disabled={!canSubmit || submitting} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  backLink: { color: colors.emeraldDark, fontWeight: '700', marginBottom: spacing.md },
  title: { fontSize: 24, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.lg },
  form: { marginBottom: spacing.md },
});
