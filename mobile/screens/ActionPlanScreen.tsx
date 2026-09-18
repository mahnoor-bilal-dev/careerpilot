/**
 * CareerPilot — Action Plan Screen
 *
 * Shows the orchestrator's recommendations as a numbered, prioritized
 * action plan. Part of the bottom tab navigator.
 */

import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCareer } from "../context/CareerContext";
import { colors, spacing, radii } from "../theme";

export default function ActionPlanScreen() {
  const { result } = useCareer();

  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎯</Text>
        <Text style={styles.emptyTitle}>No Action Plan Yet</Text>
        <Text style={styles.emptyText}>
          Complete the career assessment to get personalized recommendations.
        </Text>
      </View>
    );
  }

  if (result.recommendations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✅</Text>
        <Text style={styles.emptyTitle}>No Gaps Found</Text>
        <Text style={styles.emptyText}>
          Your profile looks great! No specific recommendations were generated
          this time.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.heading}>Action Plan</Text>
      <Text style={styles.subheading}>Your next 30 days</Text>

      {result.recommendations.map((item, index) => (
        <View key={index} style={styles.actionCard}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{String(index + 1).padStart(2, "0")}</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionText}>{item}</Text>
          </View>
        </View>
      ))}

      {/* Skill gaps quick reference */}
      {result.skill_gaps.length > 0 && (
        <View style={styles.gapsCard}>
          <Text style={styles.gapsTitle}>Skills to Focus On</Text>
          <View style={styles.tagRow}>
            {result.skill_gaps.map((gap, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{gap}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subheading: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.xxl,
    fontWeight: "500",
  },

  // Action items
  actionCard: {
    flexDirection: "row",
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: 18,
    marginBottom: spacing.md,
    gap: spacing.lg,
    alignItems: "flex-start",
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textOnPrimary,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Skill gaps
  gapsCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: 18,
    marginTop: spacing.lg,
  },
  gapsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.warning,
    marginBottom: spacing.md,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  tagText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.screenPadding,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
});
