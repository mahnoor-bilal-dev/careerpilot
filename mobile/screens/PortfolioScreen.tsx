/**
 * CareerPilot Mobile — Portfolio & Projects Tracker
 * Track active projects, status, technologies, and generate AI feedback to polish portfolio items.
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
import { ProjectStatus } from "../types/career";
import { colors, spacing, radii } from "../theme";

export default function PortfolioScreen() {
  const { projects, addProject, updateProject, deleteProject } = useCareer();

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [techStack, setTechStack] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("in_progress");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  async function handleAddProject() {
    if (!name.trim()) return;
    await addProject({
      name: name.trim(),
      description: desc.trim() || "Project preparing for career portfolio.",
      techStack: techStack.trim() || "React Native, TypeScript",
      status,
      githubUrl: githubUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
    });
    setName("");
    setDesc("");
    setTechStack("");
    setGithubUrl("");
    setDemoUrl("");
    setShowAddModal(false);
  }

  function handleAiImprove(projId: string) {
    const feedback =
      "AI Recommendation: Add a concise architecture diagram and live demonstration link to your README. Make sure to specify state management and REST API handling details in your project documentation.";
    updateProject(projId, { aiFeedback: feedback });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Projects & Portfolio</Text>
          <Text style={styles.subtitle}>
            Track and showcase your real-world development projects.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(!showAddModal)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ New Project</Text>
        </TouchableOpacity>
      </View>

      {/* Add Project Card */}
      {showAddModal && (
        <View style={styles.addCard}>
          <Text style={styles.addCardTitle}>Add Project to Portfolio</Text>

          <TextInput
            style={styles.input}
            placeholder="Project Name (e.g. CareerPilot Mobile)"
            placeholderTextColor={colors.textDim}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Short Description"
            placeholderTextColor={colors.textDim}
            value={desc}
            onChangeText={setDesc}
          />

          <TextInput
            style={styles.input}
            placeholder="Technologies (e.g. React Native, FastAPI, Python)"
            placeholderTextColor={colors.textDim}
            value={techStack}
            onChangeText={setTechStack}
          />

          <TextInput
            style={styles.input}
            placeholder="GitHub URL (optional)"
            placeholderTextColor={colors.textDim}
            value={githubUrl}
            onChangeText={setGithubUrl}
          />

          <View style={styles.statusRow}>
            <Text style={styles.label}>Status:</Text>
            {(["idea", "in_progress", "completed"] as ProjectStatus[]).map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.statusChip, status === st && styles.statusChipSelected]}
                onPress={() => setStatus(st)}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    status === st && styles.statusChipTextSelected,
                  ]}
                >
                  {st.replace("_", " ").toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.addBtnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddProject}>
              <Text style={styles.saveBtnText}>Save Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Projects List */}
      <View style={styles.projectsList}>
        {projects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyTitle}>No projects added yet</Text>
            <Text style={styles.emptyText}>
              Add your current or past projects to track progress and get AI recommendations.
            </Text>
          </View>
        ) : (
          projects.map((proj) => (
            <View key={proj.id} style={styles.projCard}>
              <View style={styles.projHeader}>
                <Text style={styles.projName}>{proj.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    proj.status === "completed"
                      ? styles.badgeCompleted
                      : proj.status === "in_progress"
                      ? styles.badgeInProgress
                      : styles.badgeIdea,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {proj.status.replace("_", " ").toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.projDesc}>{proj.description}</Text>

              <View style={styles.techTag}>
                <Text style={styles.techTagText}>⚡ {proj.techStack}</Text>
              </View>

              {proj.aiFeedback && (
                <View style={styles.aiFeedbackBox}>
                  <Text style={styles.aiFeedbackTitle}>💡 AI Recommendation</Text>
                  <Text style={styles.aiFeedbackText}>{proj.aiFeedback}</Text>
                </View>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.aiImproveBtn}
                  onPress={() => handleAiImprove(proj.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.aiImproveBtnText}>⚡ Improve with AI</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteProject(proj.id)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
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
  title: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, marginBottom: 2 },
  subtitle: { fontSize: 14, color: colors.textMuted },
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
  statusRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.md },
  label: { fontSize: 12, color: colors.textMuted, marginRight: 4 },
  statusChip: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  statusChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  statusChipText: { fontSize: 10, fontWeight: "700", color: colors.textMuted },
  statusChipTextSelected: { color: colors.textOnPrimary },

  addBtnRow: { flexDirection: "row", gap: spacing.md, justifyContent: "flex-end" },
  cancelBtn: { padding: 8 },
  cancelBtnText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.sm },
  saveBtnText: { color: colors.textOnPrimary, fontSize: 13, fontWeight: "700" },

  projectsList: { gap: spacing.md },
  projCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs },
  projName: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  statusBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: radii.full },
  badgeCompleted: { backgroundColor: "rgba(34, 197, 94, 0.15)" },
  badgeInProgress: { backgroundColor: "rgba(59, 130, 246, 0.15)" },
  badgeIdea: { backgroundColor: "rgba(148, 163, 184, 0.15)" },
  statusBadgeText: { fontSize: 10, fontWeight: "800", color: colors.textSecondary },
  projDesc: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.sm },
  techTag: { backgroundColor: colors.bg, padding: 6, borderRadius: radii.sm, alignSelf: "flex-start", marginBottom: spacing.md },
  techTagText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  aiFeedbackBox: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.md,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  aiFeedbackTitle: { fontSize: 12, fontWeight: "700", color: colors.primary, marginBottom: 2 },
  aiFeedbackText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },

  actionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  aiImproveBtn: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radii.sm },
  aiImproveBtnText: { color: colors.textOnPrimary, fontSize: 12, fontWeight: "700" },
  deleteBtn: { padding: 6 },
  deleteBtnText: { color: colors.error, fontSize: 12, fontWeight: "600" },

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
});
