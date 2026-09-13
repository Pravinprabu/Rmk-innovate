import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { callApi, mobileApi } from '../api/client';
import { Card, ErrorBanner, Heading, LoadingBlock, Text } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

// Book-appointment branch, screen 1b -- pick a department before a slot.
// Slot availability is scoped per department (see backend's SlotBooking
// docstring): the same hospital's 10am can be free for General while
// already booked for ENT, so the department has to be known before slots
// are even fetched, not just recorded alongside the booking.
export default function SelectDepartmentScreen({ hospital, onSelectDepartment, onBack }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => mobileApi.departments(hospital.id));
      setLoading(false);
      if (result.ok) setDepartments(result.data);
      else setError(result.error);
    })();
  }, [hospital.id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>← Change hospital</Text>
        </TouchableOpacity>
        <Heading style={styles.title}>{hospital.name}</Heading>
        <Text style={styles.subtitle}>Which department would you like to visit?</Text>
      </View>

      <ErrorBanner message={error} />
      {loading ? (
        <LoadingBlock label="Loading departments..." />
      ) : departments.length === 0 ? (
        <Text style={styles.emptyText}>No departments are configured for this hospital yet.</Text>
      ) : (
        <View style={styles.list}>
          {departments.map((dept) => (
            <TouchableOpacity key={dept.id} onPress={() => onSelectDepartment(dept)} activeOpacity={0.85}>
              <Card style={styles.deptCard}>
                <Text style={styles.deptName}>{dept.name}</Text>
                <Text style={styles.chevron}>→</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  backLink: { color: colors.emeraldDark, fontWeight: '700', marginBottom: spacing.md },
  title: { fontSize: 24, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary },
  list: { paddingHorizontal: spacing.xl, gap: spacing.md },
  deptCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deptName: { fontSize: 16, fontWeight: '800', color: colors.primary },
  chevron: { fontSize: 18, color: colors.emerald, fontWeight: '900' },
  emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl, paddingHorizontal: spacing.xl },
});
