// Shared layout tokens -- see docs/UI_MASTER_PROMPT.md section 6. These exist
// so every screen pulls from the same numbers instead of inventing its own,
// which is the direct fix for inconsistent alignment across screens.
import { colors } from './colors';

// Use only these values for margins, padding, and gaps -- never an arbitrary number.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
  massive: 96,
};

// Consistent everywhere -- rounded cards 12-16px (14px), buttons 10-12px (10px).
export const radius = {
  card: 14,
  button: 10,
  pill: 9999,
};

// Very subtle shadows
export const shadow = {
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 2,
};

// Minimum touch target sizes -- docs/UI_MASTER_PROMPT.md section 2.
export const touchTarget = {
  kiosk: 72,
  mobile: 44,
};
