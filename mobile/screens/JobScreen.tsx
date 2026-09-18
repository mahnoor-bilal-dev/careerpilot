/**
 * CareerPilot — Target Job Screen
 *
 * User pastes a job description here. This is the last input screen
 * before the analysis — the CTA triggers navigation to AnalysisScreen.
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
import { useCareer } from "../context/CareerContext";
import { colors, spacing, radii, shared } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Job">;

export default function JobScreen({ navigation }: Props) {
  const career = useCareer();
  const [jobText, setJobText] = useState(career.jobDescription);

  function handleAnalyze() {
    career.setJobDescription(jobText.trim());
    navigation.navigate("Analysis");
  }

  function handleSkip() {
    navigation.navigate("Analysis");
  }

  // Check if the user has provided ANY input across all screens
  const profileText = career.buildProfileText();
  const hasAnyInput =
    profileText.trim().length > 0 ||
    career.resumeText.trim().length > 0 ||
    career.githubUsername.trim().length > 0 ||
    jobText.trim().length > 0;

  return (
    <View style={shared.screen}>
      <ScrollView
        contentContainerStyle={[shared.scrollContent, { flexGrow: 1, justifyContent: "space-between" }]}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={styles.heading}>Target Job</Text>
          <Text style={styles.description}>
            Paste a job description you're interested in. CareerPilot will
            compare your profile against its requirements and give you a
            match score.
          </Text>

          <TextInput
            style={[shared.textInput, styles.largeInput]}
            placeholder="Paste the full job description here..."
            placeholderTextColor={colors.textDim}
            multiline
            numberOfLines={8}
            value={jobText}
            onChangeText={setJobText}
          />

          {/* Summary of what we have so far */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Ready to analyze</Text>
            <SummaryRow
              label="Career Profile"
              ready={profileText.trim().length > 0}
            />
            <SummaryRow
              label="Resume"
              ready={career.resumeText.trim().length > 0}
              detail={career.resumeFileName || undefined}
            />
            <SummaryRow
              label="GitHub"
              ready={career.githubUsername.trim().length > 0}
              detail={career.githubUsername || undefined}
            />
            <SummaryRow
              label="Job Description"
              ready={jobText.trim().length > 0}
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          {!hasAnyInput ? (
            <View style={[shared.errorCard, { flex: 1 }]}>
              <Text style={shared.errorText}>
                Please provide at least one input — go back and fill in your
                profile, upload a resume, enter a GitHub username, or paste
                a job description.
              </Text>
            </View>
          ) : (
            <>
              {!jobText.trim() && (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[shared.primaryButton, { flex: 2 }]}
                onPress={handleAnalyze}
                activeOpacity={0.8}
              >
                <Text style={shared.primaryButtonText}>
                  ✨ Analyze My Career
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryRow({
  label,
  ready,
  detail,
}: {
  label: string;
  ready: boolean;
  detail?: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryCheck}>{ready ? "✓" : "—"}</Text>
      <Text style={[styles.summaryLabel, ready && styles.summaryLabelReady]}>
        {label}
      </Text>
      {detail ? (
        <Text style={styles.summaryDetail} numberOfLines={1}>
          {detail}
        </Text>
      ) : null}
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
  largeInput: {
    minHeight: 160,
  },
  summaryCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: 18,
    marginTop: spacing.xl,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs + 2,
  },
  summaryCheck: {
    fontSize: 14,
    width: 18,
    color: colors.success,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textDim,
  },
  summaryLabelReady: {
    color: colors.textSecondary,
    fontWeight: "500",
  },
  summaryDetail: {
    fontSize: 12,
    color: colors.textDim,
    flex: 1,
    textAlign: "right",
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
});
