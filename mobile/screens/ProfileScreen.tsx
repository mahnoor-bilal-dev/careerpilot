/**
 * CareerPilot — Career Profile Screen
 *
 * Collects the user's basic career information: name, current role,
 * experience level, skills, and career goal. All fields are optional
 * (the user can skip and provide only a resume or GitHub instead).
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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { useCareer, CareerProfile, EMPTY_PROFILE } from "../context/CareerContext";
import { colors, spacing, radii, shared } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

const EXPERIENCE_LEVELS = [
  "Student",
  "Junior (0-2 years)",
  "Mid-Level (2-5 years)",
  "Senior (5-10 years)",
  "Lead / Staff (10+ years)",
];

export default function ProfileScreen({ navigation }: Props) {
  const career = useCareer();
  const [local, setLocal] = useState<CareerProfile>({...career.profile});

  function updateField(field: keyof CareerProfile, value: string) {
    setLocal((prev) => ({ ...prev, [field]: value }));
  }

  function handleContinue() {
    career.setProfile(local);
    navigation.navigate("Resume");
  }

  function handleSkip() {
    navigation.navigate("Resume");
  }

  const hasAnyInput = Object.values(local).some((v) => v.trim().length > 0);

  return (
    <View style={shared.screen}>
      <ScrollView
        contentContainerStyle={shared.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Career Profile</Text>
        <Text style={styles.description}>
          Tell us about yourself. All fields are optional — share as much
          or as little as you'd like.
        </Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={shared.singleLineInput}
          placeholder="Your name"
          placeholderTextColor={colors.textDim}
          value={local.name}
          onChangeText={(v) => updateField("name", v)}
        />

        <Text style={styles.label}>Current Role</Text>
        <TextInput
          style={shared.singleLineInput}
          placeholder="e.g. Frontend Developer"
          placeholderTextColor={colors.textDim}
          value={local.currentRole}
          onChangeText={(v) => updateField("currentRole", v)}
        />

        <Text style={styles.label}>Experience Level</Text>
        <View style={styles.chipRow}>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.chip,
                local.experienceLevel === level && styles.chipSelected,
              ]}
              onPress={() => updateField("experienceLevel", level)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  local.experienceLevel === level && styles.chipTextSelected,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Skills</Text>
        <TextInput
          style={shared.textInput}
          placeholder="e.g. React, TypeScript, Node.js, Python, UI/UX..."
          placeholderTextColor={colors.textDim}
          multiline
          numberOfLines={3}
          value={local.skills}
          onChangeText={(v) => updateField("skills", v)}
        />

        <Text style={styles.label}>Career Goal</Text>
        <TextInput
          style={shared.textInput}
          placeholder="e.g. I want to become a senior frontend developer at a product company..."
          placeholderTextColor={colors.textDim}
          multiline
          numberOfLines={3}
          value={local.careerGoal}
          onChangeText={(v) => updateField("careerGoal", v)}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[shared.primaryButton, styles.continueButton]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={shared.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: colors.textOnPrimary,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xxxl,
  },
  skipButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    flex: 2,
  },
});
