/**
 * CareerPilot — Career Profile & Settings Screen
 * Edit target role, skills, goal, objective, and manage local storage cache.
 */

import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCareer } from "../context/CareerContext";
import { colors, spacing, radii } from "../theme";

export default function ProfileScreen() {
  const { userProfile, updateUserProfile, resetAll } = useCareer();

  const [name, setName] = useState(userProfile.name);
  const [targetRole, setTargetRole] = useState(userProfile.targetRole);
  const [careerObjective, setCareerObjective] = useState(userProfile.careerObjective);
  const [experienceLevel, setExperienceLevel] = useState(userProfile.experienceLevel);
  const [skills, setSkills] = useState(userProfile.skills);
  const [careerGoal, setCareerGoal] = useState(userProfile.careerGoal);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  async function handleSave() {
    await updateUserProfile({
      name: name.trim(),
      targetRole: targetRole.trim(),
      careerObjective: careerObjective.trim(),
      experienceLevel,
      skills: skills.trim(),
      careerGoal: careerGoal.trim(),
    });
    setSavedMessage("Profile updated successfully!");
    setTimeout(() => setSavedMessage(null), 3000);
  }

  async function handleReset() {
    Alert.alert(
      "Reset App Data",
      "Are you sure you want to clear your local tasks, projects, and analysis cache?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            await resetAll();
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>Profile & Settings</Text>
      <Text style={styles.description}>Manage your target career goals and offline storage.</Text>

      {savedMessage && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ {savedMessage}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your Name"
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Target Role</Text>
        <TextInput
          style={styles.input}
          value={targetRole}
          onChangeText={setTargetRole}
          placeholder="e.g. Mobile Developer"
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Career Objective</Text>
        <TextInput
          style={styles.input}
          value={careerObjective}
          onChangeText={setCareerObjective}
          placeholder="e.g. Get my first job"
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Experience Level</Text>
        <TextInput
          style={styles.input}
          value={experienceLevel}
          onChangeText={setExperienceLevel}
          placeholder="e.g. Student / Junior"
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Key Skills</Text>
        <TextInput
          style={styles.input}
          value={skills}
          onChangeText={setSkills}
          placeholder="React Native, JavaScript, Python"
          placeholderTextColor={colors.textDim}
        />

        <Text style={styles.label}>Primary Goal</Text>
        <TextInput
          style={[styles.input, { height: 70 }]}
          value={careerGoal}
          onChangeText={setCareerGoal}
          multiline
          placeholder="Describe what you want to achieve..."
          placeholderTextColor={colors.textDim}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save Profile Changes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dangerCard}>
        <Text style={styles.dangerTitle}>Storage & Cache Management</Text>
        <Text style={styles.dangerText}>
          CareerPilot stores all your tasks, projects, and analysis results locally on device using AsyncStorage.
        </Text>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetButtonText}>Clear Storage & Reset App</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.screenPadding, paddingBottom: 48 },
  heading: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, marginBottom: 4, marginTop: spacing.sm },
  description: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.xl },
  successBanner: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderWidth: 1,
    borderColor: colors.success,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  successText: { color: colors.success, fontSize: 14, fontWeight: "700" },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  label: { fontSize: 12, fontWeight: "700", color: colors.textDim, textTransform: "uppercase", marginBottom: spacing.xs, marginTop: spacing.sm },
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
  saveButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 12, alignItems: "center", marginTop: spacing.md },
  saveButtonText: { color: colors.textOnPrimary, fontSize: 14, fontWeight: "700" },
  dangerCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  dangerTitle: { fontSize: 15, fontWeight: "700", color: colors.error, marginBottom: spacing.xs },
  dangerText: { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: spacing.md },
  resetButton: { borderWidth: 1, borderColor: colors.error, borderRadius: radii.md, paddingVertical: 12, alignItems: "center" },
  resetButtonText: { color: colors.error, fontSize: 14, fontWeight: "700" },
});
