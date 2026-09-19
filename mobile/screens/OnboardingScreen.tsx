/**
 * CareerPilot — Lightweight Onboarding / Profile Setup
 * Collects target role, career objective, skills, experience level, and goal.
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
import { UserProfile, TargetRole, CareerObjective } from "../types/career";
import { colors, spacing, radii } from "../theme";

const TARGET_ROLES: TargetRole[] = [
  "Frontend Developer",
  "Mobile Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Graphic Designer",
  "Data Analyst",
  "AI/ML Engineer",
  "Software Engineer",
];

const CAREER_OBJECTIVES: CareerObjective[] = [
  "Get an internship",
  "Get my first job",
  "Improve my portfolio",
  "Switch career",
  "Prepare for master's",
  "Become job-ready",
];

const EXPERIENCE_LEVELS = ["Student", "Beginner", "Intermediate", "Career Switcher"];

interface Props {
  onComplete?: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const { completeOnboarding } = useCareer();
  const [step, setStep] = useState(1);

  // Form states
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("Mobile Developer");
  const [customRole, setCustomRole] = useState("");
  const [selectedObjective, setSelectedObjective] = useState<string>("Get my first job");
  const [experienceLevel, setExperienceLevel] = useState("Student");
  const [skills, setSkills] = useState("");
  const [careerGoal, setCareerGoal] = useState("");

  const effectiveRole = selectedRole === "Custom" ? customRole.trim() || "Developer" : selectedRole;

  async function handleFinish() {
    const profile: UserProfile = {
      name: name.trim() || "Developer",
      targetRole: effectiveRole,
      careerObjective: selectedObjective,
      experienceLevel,
      skills: skills.trim() || "JavaScript, React, Python",
      careerGoal: careerGoal.trim() || `Land a role as a ${effectiveRole}.`,
      onboardingCompleted: true,
    };

    await completeOnboarding(profile);
    if (onComplete) onComplete();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.logo}>CAREERPILOT ✈️</Text>
        <Text style={styles.title}>Welcome to CareerPilot</Text>
        <Text style={styles.subtitle}>
          Your AI-powered career companion. Let's set up your personal career goal.
        </Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepContainer}>
        <View style={[styles.stepDot, step >= 1 && styles.stepActive]} />
        <View style={[styles.stepLine, step >= 2 && styles.lineActive]} />
        <View style={[styles.stepDot, step >= 2 && styles.stepActive]} />
        <View style={[styles.stepLine, step >= 3 && styles.lineActive]} />
        <View style={[styles.stepDot, step >= 3 && styles.stepActive]} />
      </View>

      {/* Step 1: Target Role */}
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. What is your target role?</Text>
          <Text style={styles.cardDesc}>Select the role you're actively preparing for.</Text>

          <View style={styles.chipContainer}>
            {TARGET_ROLES.map((role) => {
              const isSelected = selectedRole === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedRole(role)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.chip, selectedRole === "Custom" && styles.chipSelected]}
              onPress={() => setSelectedRole("Custom")}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedRole === "Custom" && styles.chipTextSelected]}>
                + Custom Role
              </Text>
            </TouchableOpacity>
          </View>

          {selectedRole === "Custom" && (
            <TextInput
              style={styles.input}
              placeholder="e.g. Cloud Engineer, Game Developer"
              placeholderTextColor={colors.textDim}
              value={customRole}
              onChangeText={setCustomRole}
            />
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep(2)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Next: Career Objective →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: Career Objective */}
      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. What is your primary objective?</Text>
          <Text style={styles.cardDesc}>This helps tailor your daily action recommendations.</Text>

          <View style={styles.listOptions}>
            {CAREER_OBJECTIVES.map((obj) => {
              const isSelected = selectedObjective === obj;
              return (
                <TouchableOpacity
                  key={obj}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setSelectedObjective(obj)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {obj}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setStep(1)}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, { flex: 1 }]}
              onPress={() => setStep(3)}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Next: Skills & Profile →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 3: Name & Skills */}
      {step === 3 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Tell us about yourself</Text>
          <Text style={styles.cardDesc}>Personalize your dashboard experience.</Text>

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alex"
            placeholderTextColor={colors.textDim}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Current Experience Level</Text>
          <View style={styles.chipContainer}>
            {EXPERIENCE_LEVELS.map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[styles.chip, experienceLevel === lvl && styles.chipSelected]}
                onPress={() => setExperienceLevel(lvl)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.chipText, experienceLevel === lvl && styles.chipTextSelected]}
                >
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Key Skills (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. React Native, JavaScript, Figma, Python"
            placeholderTextColor={colors.textDim}
            value={skills}
            onChangeText={setSkills}
          />

          <Text style={styles.label}>Primary Goal / Target</Text>
          <TextInput
            style={[styles.input, { height: 70 }]}
            placeholder="e.g. Build a solid mobile portfolio and land a junior developer role in 3 months."
            placeholderTextColor={colors.textDim}
            value={careerGoal}
            onChangeText={setCareerGoal}
            multiline
          />

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setStep(2)}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, { flex: 1 }]}
              onPress={handleFinish}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Launch CareerPilot 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.screenPadding, paddingBottom: 48 },
  header: { alignItems: "center", marginBottom: spacing.xl, marginTop: spacing.lg },
  logo: { fontSize: 14, fontWeight: "800", color: colors.primary, letterSpacing: 2, marginBottom: spacing.xs },
  title: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, marginBottom: spacing.xs, textAlign: "center" },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
  stepContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: spacing.xl },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  stepActive: { backgroundColor: colors.primary },
  stepLine: { width: 40, height: 2, backgroundColor: colors.border, marginHorizontal: 4 },
  lineActive: { backgroundColor: colors.primary },
  card: { backgroundColor: colors.bgCard, borderRadius: radii.lg, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.xs },
  cardDesc: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  chip: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.full, paddingVertical: 8, paddingHorizontal: 14 },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: "600" },
  chipTextSelected: { color: colors.textOnPrimary, fontWeight: "700" },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, color: colors.textPrimary, fontSize: 15, marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: "700", color: colors.textDim, marginBottom: spacing.xs, textTransform: "uppercase", letterSpacing: 0.5 },
  listOptions: { gap: spacing.md, marginBottom: spacing.xl },
  optionRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, gap: spacing.md },
  optionRowSelected: { borderColor: colors.primary, backgroundColor: "rgba(59, 130, 246, 0.08)" },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  radioCircleSelected: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optionText: { fontSize: 15, color: colors.textSecondary, fontWeight: "500" },
  optionTextSelected: { color: colors.textPrimary, fontWeight: "700" },
  btnRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  primaryButton: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: colors.textOnPrimary, fontSize: 15, fontWeight: "700" },
  secondaryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: 14, paddingHorizontal: spacing.lg, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: colors.textMuted, fontSize: 14, fontWeight: "600" },
});
