import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './ui';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

const TABS = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'reports', label: 'Reports', icon: '📄' },
  { key: 'aiSummary', label: 'AI Summary', icon: '✦' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

// Mobile-app convention -- a fixed bottom bar, not a sidebar (that's the
// desktop admin apps' pattern). Persistent across Home/Reports/AI Summary/
// Profile; the booking and upload sub-flows temporarily replace the whole
// screen (including this bar) since they're focused tasks, then return here.
export default function BottomTabBar({ active, onChange }) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onChange(tab.key)} activeOpacity={0.7}>
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceWhite,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  icon: { fontSize: 20, opacity: 0.5 },
  iconActive: { opacity: 1 },
  label: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  labelActive: { color: colors.emeraldDark, fontWeight: '800' },
});
