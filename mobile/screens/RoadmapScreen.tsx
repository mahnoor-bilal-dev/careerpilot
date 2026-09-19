/**
 * CareerPilot Mobile — Career Roadmap & Task Manager
 * Concrete 4-stage roadmap (Foundation, Development, Portfolio, Job Ready) with checkable tasks.
 */

import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCareer } from "../context/CareerContext";
import { RoadmapStageId, TaskCategory } from "../types/career";
import { colors, spacing, radii } from "../theme";

const STAGES: { id: RoadmapStageId; title: string; subtitle: string; icon: string }[] = [
  { id: "foundation", title: "1. Foundation", subtitle: "Git, Basics & Profiles", icon: "🌱" },
  { id: "development", title: "2. Development", subtitle: "Frameworks, APIs & State", icon: "🚀" },
  { id: "portfolio", title: "3. Portfolio", subtitle: "Projects, READMEs & Case Studies", icon: "📦" },
  { id: "job_ready", title: "4. Job Ready", subtitle: "Resume, Job Match & Interviews", icon: "🎯" },
];

export default function RoadmapScreen() {
  const { tasks, toggleTaskCompletion, addTask, userProfile } = useCareer();
  const [activeStage, setActiveStage] = useState<RoadmapStageId>("foundation");

  // Add Task Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<TaskCategory>("skills");
  const [newTime, setNewTime] = useState("20 min");

  async function handleAddTask() {
    if (!newTitle.trim()) return;
    await addTask({
      title: newTitle.trim(),
      description: newDesc.trim() || "User added custom career goal.",
      estimatedTime: newTime.trim() || "20 min",
      category: newCategory,
      priority: "medium",
      completed: false,
      roadmapStage: activeStage,
    });
    setNewTitle("");
    setNewDesc("");
    setShowAddModal(false);
  }

  const stageTasks = tasks.filter((t) => t.roadmapStage === activeStage);
  const completedCount = stageTasks.filter((t) => t.completed).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Career Roadmap</Text>
        <Text style={styles.subtitle}>
          Step-by-step path tailored for {userProfile.targetRole || "your career goal"}.
        </Text>
      </View>

      {/* Stage Selector Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageTabs}>
        {STAGES.map((stg) => {
          const stgTasks = tasks.filter((t) => t.roadmapStage === stg.id);
          const stgDone = stgTasks.filter((t) => t.completed).length;
          const isSelected = activeStage === stg.id;

          return (
            <TouchableOpacity
              key={stg.id}
              style={[styles.stageTab, isSelected && styles.stageTabSelected]}
              onPress={() => setActiveStage(stg.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.stageIcon}>{stg.icon}</Text>
              <Text style={[styles.stageTabTitle, isSelected && styles.stageTabTitleSelected]}>
                {stg.title}
              </Text>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {stgDone}/{stgTasks.length}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Active Stage Header */}
      <View style={styles.activeHeader}>
        <View>
          <Text style={styles.activeTitle}>
            {STAGES.find((s) => s.id === activeStage)?.title}
          </Text>
          <Text style={styles.activeSub}>
            {STAGES.find((s) => s.id === activeStage)?.subtitle}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(!showAddModal)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Add Task Form */}
      {showAddModal && (
        <View style={styles.addCard}>
          <Text style={styles.addCardTitle}>Add Task to {activeStage.toUpperCase()}</Text>

          <TextInput
            style={styles.input}
            placeholder="Task Title (e.g., Practice 2 React Native questions)"
            placeholderTextColor={colors.textDim}
            value={newTitle}
            onChangeText={setNewTitle}
          />

          <TextInput
            style={styles.input}
            placeholder="Description / Details"
            placeholderTextColor={colors.textDim}
            value={newDesc}
            onChangeText={setNewDesc}
          />

          <View style={styles.addBtnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleAddTask}
            >
              <Text style={styles.saveBtnText}>Save Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tasks List */}
      <View style={styles.tasksList}>
        {stageTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tasks in this stage</Text>
            <Text style={styles.emptyText}>Tap "+ Add Task" to add your first milestone action.</Text>
          </View>
        ) : (
          stageTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskRow, task.completed && styles.taskRowDone]}
              onPress={() => toggleTaskCompletion(task.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
                {task.completed && <Text style={styles.checkIcon}>✓</Text>}
              </View>

              <View style={styles.taskBody}>
                <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
                  {task.title}
                </Text>
                <Text style={styles.taskDesc}>{task.description}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.timeTag}>⏱ {task.estimatedTime}</Text>
                  <Text style={styles.categoryTag}>{task.category.toUpperCase()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.screenPadding, paddingBottom: 48 },
  header: { marginBottom: spacing.lg, marginTop: spacing.sm },
  title: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted },
  stageTabs: { flexDirection: "row", marginBottom: spacing.xl },
  stageTab: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: spacing.sm,
    alignItems: "center",
    gap: 4,
  },
  stageTabSelected: { borderColor: colors.primary, backgroundColor: "rgba(59, 130, 246, 0.1)" },
  stageIcon: { fontSize: 18 },
  stageTabTitle: { fontSize: 12, fontWeight: "700", color: colors.textMuted },
  stageTabTitleSelected: { color: colors.primary },
  countBadge: { backgroundColor: colors.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.full },
  countBadgeText: { fontSize: 10, fontWeight: "800", color: colors.textDim },
  activeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  activeTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  activeSub: { fontSize: 13, color: colors.textMuted },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
  },
  addButtonText: { color: colors.textOnPrimary, fontSize: 13, fontWeight: "700" },
  addCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addCardTitle: { fontSize: 14, fontWeight: "700", color: colors.primary, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: 10,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  addBtnRow: { flexDirection: "row", gap: spacing.md, justifyContent: "flex-end" },
  cancelBtn: { padding: 8 },
  cancelBtnText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.sm },
  saveBtnText: { color: colors.textOnPrimary, fontSize: 13, fontWeight: "700" },
  tasksList: { gap: spacing.sm },
  taskRow: {
    flexDirection: "row",
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    alignItems: "flex-start",
  },
  taskRowDone: { opacity: 0.6 },
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
  taskBody: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 2 },
  taskTitleDone: { textDecorationLine: "line-through", color: colors.textMuted },
  taskDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: spacing.xs },
  metaRow: { flexDirection: "row", gap: spacing.sm },
  timeTag: { fontSize: 11, color: colors.textSecondary, fontWeight: "600" },
  categoryTag: { fontSize: 11, color: colors.primary, fontWeight: "700" },
  emptyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: "center" },
});
