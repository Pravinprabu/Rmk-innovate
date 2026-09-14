import React from 'react';
import { Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './ui';
import { colors } from '../theme/colors';

export const STATUS_BAR_OFFSET = Platform.select({
  ios: 48,
  android: (StatusBar.currentHeight || 24) + 10,
  default: 16,
});

export default function TopNavbar({ title = 'MediKiosk', onBack, showBack = false }) {
  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.navbar}>
        <View style={styles.leftContainer}>
          {showBack && onBack ? (
            <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.brandBadge}>
              <Text style={styles.crossIcon}>┼</Text>
            </View>
          )}
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.brandTitle} numberOfLines={1}>{title}</Text>
        </View>

        <View style={styles.rightContainer}>
          <View style={styles.statusDot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: STATUS_BAR_OFFSET,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  navbar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  leftContainer: {
    minWidth: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingRight: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    marginTop: -1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  rightContainer: {
    minWidth: 70,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.emerald,
  },
});

