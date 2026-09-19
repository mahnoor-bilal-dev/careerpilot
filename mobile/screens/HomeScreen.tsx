/**
 * CareerPilot Mobile — Home Dashboard
 * Primary landing hub answering: "What am I working toward?", "What should I do next?", and "How am I progressing?"
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCareer } from "../context/CareerContext";
import { colors, spacing, radii, getScoreColor } from "../theme";

interface Props {
  onNavigateToRoadmap?: () => void;
  onNavigateToAssessment?: () => void;
  onNavigateToProjects?: () => void;
}

export default function HomeScreen({
  onNavigateToRoadmap,
  onNavigateToAssessment,
  onNavigateToProjects,
}: Props) {
  const {
    userProfile,
    tasks,
    toggleTaskCompletion,
    progressPercentage,
    result,
    projects,
  } = useCareer();

  const pendingTasks = tasks.filter((t) => !t.completed);
  const todaysActions = pendingTasks.slice(0, 3);
  const completedTasks = tasks.filter((t) => t.completed).slice(0, 3);

  // Determine current stage
  const hasFoundation = tasks.some((t) => t.roadmapStage === "foundation" && t.completed);
  const hasDev = tasks.some((t) => t.roadmapStage === "development" && t.completed);
  const currentStageName = !hasFoundation
    ? "Foundation"
    : !hasDev
    ? "Development"
    : "Portfolio & Job Ready";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day 👋</Text>
          <Text style={styles.userName}>{userProfile.name || "Developer"}</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{userProfile.targetRole || "Mobile Developer"}</Text>
        </View>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Career Readiness</Text>
          <Text style={[styles.progressPercent, { color: getScoreColor(progressPercentage) }]}>
            {progressPercentage}%
          </Text>
        </View>

        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: getScoreColor(progressPercentage),
              },
            ]}
          />
        </View>

        <View style={styles.stageRow}>
          <Text style={styles.stageLabel}>Current Stage:</Text>
          <Text style={styles.stageValue}>{currentStageName}</Text>
        </View>
      </View>

      {/* Today's Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY'S RECOMMENDED ACTIONS</Text>
          <TouchableOpacity onPress={onNavigateToRoadmap}>
            <Text style={styles.linkText}>View All ({pendingTasks.length}) →</Text>
          </TouchableOpacity>
        </View>

        {todaysActions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>
              You've completed your top actions for today. Run an AI Assessment to discover new priorities.
            </Text>
          </View>
        ) : (
          todaysActions.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => toggleTaskCompletion(task.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
                {task.completed && <Text style={styles.checkIcon}>✓</Text>}
              </View>

              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDesc} numberOfLines={2}>
                  {task.description}
                </Text>
                <View style={styles.taskMetaRow}>
                  <View style={styles.badgeTime}>
                    <Text style={styles.badgeTimeText}>⏱ {task.estimatedTime}</Text>
                  </View>
                  <View style={styles.badgeCategory}>
                    <Text style={styles.badgeCategoryText}>{task.category.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* AI Assessment Snapshot (if available) */}
      {result && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LATEST AI INSIGHTS</Text>
          <View style={styles.aiCard}>
            {result.career_direction && (
              <View style={styles.aiBlock}>
                <Text style={styles.aiBlockTitle}>🧭 Direction</Text>
                <Text style={styles.aiBlockText} numberOfLines={3}>
                  {result.career_direction}
                </Text>
              </View>
            )}

            {result.final_verdict && (
              <View style={styles.aiBlock}>
                <Text style={styles.aiBlockTitle}>🏆 Overall Verdict</Text>
                <Text style={styles.aiBlockText} numberOfLines={3}>
                  {result.final_verdict}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={onNavigateToAssessment}
            activeOpacity={0.8}
          >
            <Text style={styles.quickIcon}>⚡</Text>
            <Text style={styles.quickTitle}>Full AI Assessment</Text>
            <Text style={styles.quickSub}>Unified multi-agent evaluation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={onNavigateToProjects}
            activeOpacity={0.8}
          >
            <Text style={styles.quickIcon}>📁</Text>
            <Text style={styles.quickTitle}>Manage Projects</Text>
            <Text style={styles.quickSub}>{projects.length} projects tracked</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      {completedTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT ACHIEVEMENTS</Text>
          {completedTasks.map((t) => (
            <View key={t.id} style={styles.achievementRow}>
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementCheck}>✓</Text>
              </View>
              <Text style={styles.achievementText}>{t.title}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.screenPadding, paddingBottom: 48 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  greeting: { fontSize: 14, color: colors.textMuted, fontWeight: "600" },
  userName: { fontSize: 24, fontWeight: "800", color: colors.textPrimary },
  roleBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  roleBadgeText: { fontSize: 13, color: colors.primary, fontWeight: "700" },
  progressCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  progressPercent: { fontSize: 24, fontWeight: "800" },
  progressBarTrack: {
    height: 10,
    backgroundColor: colors.bg,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  progressBarFill: { height: "100%", borderRadius: 5 },
  stageRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  stageLabel: { fontSize: 13, color: colors.textMuted },
  stageValue: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },

  section: { marginBottom: spacing.xl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textDim,
    letterSpacing: 1,
  },
  linkText: { fontSize: 13, color: colors.primary, fontWeight: "700" },

  taskCard: {
    flexDirection: "row",
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-start",
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkIcon: { color: "#fff", fontSize: 12, fontWeight: "800" },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 2 },
  taskDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: spacing.sm },
  taskMetaRow: { flexDirection: "row", gap: spacing.sm },
  badgeTime: {
    backgroundColor: colors.bg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  badgeTimeText: { fontSize: 11, color: colors.textSecondary, fontWeight: "600" },
  badgeCategory: {
    backgroundColor: colors.bg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  badgeCategoryText: { fontSize: 11, color: colors.primary, fontWeight: "700" },

  emptyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: { fontSize: 32, marginBottom: spacing.xs },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: "center" },

  aiCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  aiBlock: { gap: 4 },
  aiBlockTitle: { fontSize: 13, fontWeight: "700", color: colors.primary },
  aiBlockText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },

  quickGrid: { flexDirection: "row", gap: spacing.md },
  quickCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: { fontSize: 24, marginBottom: spacing.xs },
  quickTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 2 },
  quickSub: { fontSize: 12, color: colors.textMuted },

  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  achievementBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementCheck: { color: "#fff", fontSize: 11, fontWeight: "800" },
  achievementText: { fontSize: 14, color: colors.textMuted, textDecorationLine: "line-through" },
});
