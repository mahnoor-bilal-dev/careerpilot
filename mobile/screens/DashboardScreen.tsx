/**
 * CareerPilot — Dashboard Screen
 *
 * The main results screen. Shows the orchestrator's analysis in a
 * polished card-based layout: match score, career direction, strengths,
 * skill gaps, GitHub/resume summaries, and the final verdict.
 *
 * Part of the bottom tab navigator (Results).
 */

import { useRef, useEffect } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCareer } from "../context/CareerContext";
import { colors, spacing, radii, getScoreColor } from "../theme";

export default function DashboardScreen() {
  const { result } = useCareer();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Analysis Yet</Text>
        <Text style={styles.emptyText}>
          Complete the career assessment flow to see your results here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.heading}>Career Dashboard</Text>

        {/* Match Score */}
        {result.job_match_score !== null && result.job_match_score !== undefined && (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Job Match Score</Text>
            <View style={styles.scoreCircle}>
              <Text
                style={[
                  styles.scoreValue,
                  { color: getScoreColor(result.job_match_score) },
                ]}
              >
                {result.job_match_score}
              </Text>
              <Text style={styles.scorePercent}>%</Text>
            </View>
            {result.job_match_summary && (
              <Text style={styles.scoreSummary}>{result.job_match_summary}</Text>
            )}
          </View>
        )}

        {/* Career Direction */}
        {result.career_direction && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧭 Career Direction</Text>
            <Text style={styles.cardBody}>{result.career_direction}</Text>
          </View>
        )}

        {/* Strengths */}
        {result.strengths.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💪 Strengths</Text>
            {result.strengths.map((item, i) => (
              <View key={i} style={styles.listRow}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skill Gaps */}
        {result.skill_gaps.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚠️ Skill Gaps</Text>
            {result.skill_gaps.map((item, i) => (
              <View key={i} style={styles.listRow}>
                <View style={[styles.dot, { backgroundColor: colors.warning }]} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* GitHub Summary */}
        {result.github_summary && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🐙 GitHub Portfolio</Text>
            <Text style={styles.cardBody}>{result.github_summary}</Text>
          </View>
        )}

        {/* Resume Summary */}
        {result.resume_summary && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📄 Resume Analysis</Text>
            <Text style={styles.cardBody}>{result.resume_summary}</Text>
          </View>
        )}

        {/* Final Verdict */}
        <View style={styles.verdictCard}>
          <Text style={styles.cardTitle}>🏆 Final Verdict</Text>
          <Text style={styles.cardBody}>{result.final_verdict}</Text>
        </View>
      </Animated.View>
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
    marginBottom: spacing.xl,
  },

  // Score
  scoreCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  scoreCircle: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: spacing.md,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: "800",
    lineHeight: 80,
  },
  scorePercent: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textDim,
    marginBottom: 10,
    marginLeft: 2,
  },
  scoreSummary: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },

  // Cards
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: 18,
    marginBottom: spacing.md,
  },
  verdictCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: 18,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  cardBody: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Lists
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.sm + 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  listText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    flex: 1,
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
