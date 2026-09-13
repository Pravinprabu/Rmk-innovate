// MediKiosk color tokens.
//
// Source of truth: docs/theme/colors.js (and colors.md) at the repo root. This
// file wires the decided palette into the app under the SAME token names
// every screen already uses (colors.primary, colors.emerald, colors.textPrimary,
// ...) so the whole app re-themes from this one file, with no per-screen edits
// needed for color.
//
// RE-THEMED: blue + white, replacing the earlier pastel-purple palette (the
// key NAMES below are unchanged on purpose -- e.g. `emerald` still means "the
// main interactive accent," it just now holds a blue hex instead of a purple
// one -- renaming every call site across ~20 screens would be a much larger,
// riskier change for zero visual benefit).
//
// Main interactive color is blue600 (#2563EB, WCAG contrast for white bold
// button text = 5.17:1) and blue500 (#3B82F6, 3.68:1) -- both clear the 3:1
// minimum for bold/large button text, and blue600 clears full AA (4.5:1) too.
// Headings use a separate, darker navy (`primary`) rather than the bright
// accent blue, matching the reference design's "Complete Your History" text.
// Status colors (success green / danger red / warning amber) are deliberately
// NOT part of this family -- they stay semantic, unrelated to brand color.

export const colors = {
  // ---- Legacy "primary" (heading/brand text) family ----
  // Dark navy, not the bright accent blue -- headings read as a calmer, more
  // authoritative tone than a button.
  primary: '#1E3A5F',
  primaryDark: '#152A47',
  primaryLight: '#3B82F6',
  textHeading: '#1E3A5F',   // same value, explicit name for new code

  // ---- Legacy "emerald" family -> the MAIN blue accent ----
  // #3B82F6 (blue500) is the button/highlight color; #2563EB (blue600) is one
  // shade darker, used directly by a few components (KioskFrame's Continue
  // button, the sidebar's logo/avatar) for a touch more depth against white.
  emerald: '#3B82F6',       // MAIN interactive color (buttons, active state, progress fill)
  emeraldDark: '#1D4ED8',   // pressed state / badge text needing contrast
  emeraldLight: '#DBEAFE',  // pastel badge fill
  emeraldSoft: '#EFF6FF',   // very soft selected-card fill

  // ---- Legacy "teal" family -> soft secondary accent ----
  teal: '#60A5FA',
  tealLight: '#EFF6FF',
  tealDark: '#1D4ED8',

  // ---- Doctor dashboard sidebar (separate dark-chrome context; kept for any
  // future doctor-facing build reusing these tokens) ----
  sidebarBg: '#1E3A8A',
  sidebarActiveBg: '#2563EB',
  sidebarActiveText: '#FFFFFF',
  sidebarText: '#BFDBFE',

  // ---- Status -- kept OUT of the blue family on purpose ----
  success: '#16A34A',
  successLight: '#DCFCE7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  emergency: '#DC2626',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  warningDark: '#B45309',

  neutral: '#64748B',
  neutralLight: '#F5F8FE',

  // ---- Surfaces ----
  // White-dominant with a faint cool-blue tint, not a full color wash.
  bgCanvas: '#F5F8FE',
  surfaceWhite: '#FFFFFF',
  surfaceCard: '#FFFFFF',
  surfaceMuted: '#EFF3FA',
  surfaceActive: '#DBEAFE',

  // ---- Text ----
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#9CA3AF',
  textLight: '#94A3B8',
  textWhite: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textAccent: '#1D4ED8',   // blue700 -- blue500 fails AA contrast as small text

  // ---- Borders ----
  borderLight: '#E2E8F0',
  borderFocus: '#3B82F6',
  borderSelected: '#3B82F6',

  // ---- Explicit "purple" scale name, blue values (see the RE-THEMED note
  // above for why the key names stayed put) ----
  purple50: '#EFF6FF',
  purple100: '#DBEAFE',
  purple200: '#BFDBFE',
  purple300: '#93C5FD',
  purple400: '#60A5FA',
  purple500: '#3B82F6',
  purple600: '#2563EB',
  purple700: '#1D4ED8',
  purple800: '#1E40AF',
  purple900: '#1E3A8A',

  // Decorative gradient / glow pair.
  gradientBandStart: '#60A5FA',
  gradientBandEnd: '#2563EB',
  blobTint: '#DBEAFE',
  blobTintRose: '#EFF6FF',

  // ---- High-contrast accessibility mode ----
  hcBg: '#000000',
  hcCard: '#1A1A1A',
  hcText: '#FFFFFF',
  hcBorder: '#FFFFFF',
  hcPrimary: '#93C5FD',
};
