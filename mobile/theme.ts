/**
 * CareerPilot — Design System
 *
 * Single source of truth for colors, typography, spacing, and reusable
 * style constants. Every screen/component should import from here
 * rather than hardcoding values.
 */

import { StyleSheet } from "react-native";

// ─── Colors ──────────────────────────────────────────────────────
export const colors = {
  // Backgrounds
  bg: "#0F172A",
  bgCard: "#1E293B",
  bgCardAlt: "#162032",
  bgInput: "#1E293B",
  bgElevated: "#334155",

  // Brand / Accent
  primary: "#38BDF8",       // Cyan-400
  primaryMuted: "#0EA5E9",  // Cyan-500
  primaryDark: "#0284C7",   // Cyan-600
  accent: "#818CF8",        // Indigo-400
  accentMuted: "#6366F1",   // Indigo-500

  // Semantic
  success: "#4ADE80",       // Green-400
  warning: "#FBBF24",       // Amber-400
  error: "#F87171",         // Red-400
  errorBg: "#2D1B1B",

  // Text
  textPrimary: "#F8FAFC",   // Slate-50
  textSecondary: "#CBD5E1",  // Slate-300
  textMuted: "#94A3B8",     // Slate-400
  textDim: "#64748B",       // Slate-500
  textOnPrimary: "#0F172A",

  // Borders
  border: "#334155",        // Slate-700
  borderLight: "#475569",   // Slate-600

  // Score colors (used for the match score ring)
  scoreHigh: "#4ADE80",     // ≥ 75
  scoreMedium: "#FBBF24",   // 50-74
  scoreLow: "#F87171",      // < 50
} as const;

// ─── Spacing ─────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screenPadding: 24,
} as const;

// ─── Border Radius ───────────────────────────────────────────────
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// ─── Typography ──────────────────────────────────────────────────
export const typography = {
  hero: { fontSize: 36, fontWeight: "800" as const, color: colors.textPrimary },
  h1: { fontSize: 28, fontWeight: "700" as const, color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: "700" as const, color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: "600" as const, color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: "400" as const, color: colors.textSecondary, lineHeight: 22 },
  bodyLarge: { fontSize: 17, fontWeight: "400" as const, color: colors.textSecondary, lineHeight: 26 },
  caption: { fontSize: 13, fontWeight: "400" as const, color: colors.textMuted },
  label: { fontSize: 14, fontWeight: "600" as const, color: colors.textSecondary },
  overline: { fontSize: 12, fontWeight: "700" as const, color: colors.textDim, textTransform: "uppercase" as const, letterSpacing: 1 },
  button: { fontSize: 16, fontWeight: "700" as const },
} as const;

// ─── Shared Styles ───────────────────────────────────────────────
export const shared = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.screenPadding,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: 18,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  cardListItem: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 26,
    paddingLeft: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
    gap: 10,
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: colors.bgInput,
    borderRadius: radii.md,
    padding: spacing.lg,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: "top" as const,
  },
  singleLineInput: {
    backgroundColor: colors.bgInput,
    borderRadius: radii.md,
    padding: spacing.lg,
    fontSize: 15,
    color: colors.textPrimary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorCard: {
    backgroundColor: colors.bgCard,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    borderRadius: radii.sm,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  sectionSpacing: {
    marginTop: spacing.lg,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────

/** Returns the right color for a match score (0–100). */
export function getScoreColor(score: number): string {
  if (score >= 75) return colors.scoreHigh;
  if (score >= 50) return colors.scoreMedium;
  return colors.scoreLow;
}
