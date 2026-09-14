import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './ui';
import { colors } from '../theme/colors';
import { spacing } from '../theme/tokens';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'reports', label: 'Reports', icon: 'document-text-outline', activeIcon: 'document-text' },
  { key: 'aiSummary', label: 'AI Summary', icon: 'sparkles-outline', activeIcon: 'sparkles' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export default function BottomTabBar({ active, onChange }) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const iconName = isActive ? tab.activeIcon : tab.icon;
        const iconColor = isActive ? colors.primary : colors.textSecondary;
        return (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onChange(tab.key)} activeOpacity={0.7}>
            <Ionicons name={iconName} size={21} color={iconColor} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            {isActive && <View style={styles.activeIndicator} />}
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
    paddingTop: 10,
    paddingBottom: 22,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  activeIndicator: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.emerald,
    marginTop: 2,
  },
});
