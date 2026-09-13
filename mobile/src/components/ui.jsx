import React from 'react';
import { ActivityIndicator, StyleSheet, Text as RNText, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radius, shadow } from '../theme/tokens';

// Small shared primitives for the mobile app -- phone-scaled (not the
// kiosk's touch-target sizing), same blue/white palette as
// frontend/src/theme/colors.js so this reads as the same product.

export function Text({ style, ...props }) {
  return <RNText {...props} style={[styles.text, style]} />;
}

export function Heading({ style, ...props }) {
  return <RNText {...props} style={[styles.heading, style]} />;
}

export function Card({ style, children }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ title, onPress, disabled, variant = 'primary', style }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <RNText style={[styles.buttonText, variant === 'secondary' && styles.buttonTextSecondary]}>{title}</RNText>
    </TouchableOpacity>
  );
}

export function TextField({ label, ...props }) {
  return (
    <View style={styles.fieldGroup}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
    </View>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function LoadingBlock({ label = 'Loading...' }) {
  return (
    <View style={styles.loadingBlock}>
      <ActivityIndicator size="large" color={colors.emerald} />
      <Text style={styles.loadingLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  heading: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    ...shadow,
  },
  button: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.surfaceWhite,
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceWhite,
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingLabel: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
});
