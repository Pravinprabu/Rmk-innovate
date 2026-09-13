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

// Consistent everywhere -- no mixing radii across components.
export const radius = {
  card: 20,
  pill: 9999,
};

// One soft shadow for every elevated surface -- don't hand-tune per component.
export const shadow = {
  shadowColor: colors.purple900,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 4,
};

// Minimum touch target sizes -- docs/UI_MASTER_PROMPT.md section 2.
export const touchTarget = {
  kiosk: 72,
  mobile: 44,
};
