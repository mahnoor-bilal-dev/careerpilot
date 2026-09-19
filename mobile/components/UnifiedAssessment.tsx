/**
 * CareerPilot Mobile — Unified Career Assessment Engine
 * Multi-source diagnostic tool (Profile, Resume, GitHub, Job Description).
 * Connects directly to CareerContext & storage to generate actionable tasks.
 */

import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

import { analyzeCareerUnified, OrchestratorOutput } from "../api/orchestrateApi";
import { extractResumeText, PickedResumeFile } from "../api/resumeApi";
import { useCareer } from "../context/CareerContext";
import {
  buildOrchestratePayload,
  hasAnyInput,
  UnifiedAssessmentInputs,
} from "../utils/orchestratePayload";
import { colors, spacing, radii } from "../theme";

type AssessmentState = "idle" | "loading" | "success" | "error";
type ResumeExtractState = "idle" | "extracting" | "ready" | "error";

interface Props {
  onAssessmentCompleted?: () => void;
}

export default function UnifiedAssessment({ onAssessmentCompleted }: Props) {
  const {
    userProfile,
    resumeText,
    setResumeText,
    githubUsername,
    setGithubUsername,
    jobDescription,
    setJobDescription,
    result,
    processAiResult,
    buildProfileText,
  } = useCareer();

  const [profileText, setProfileText] = useState(buildProfileText());
  const [selectedFile, setSelectedFile] = useState<PickedResumeFile | null>(null);
  const [resumeExtractState, setResumeExtractState] = useState<ResumeExtractState>("idle");
  const [resumeExtractError, setResumeExtractError] = useState("");

  const [assessmentState, setAssessmentState] = useState<AssessmentState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const currentInputs: UnifiedAssessmentInputs = {
    profileText,
    resumeText,
    githubUsername,
    jobDescription,
  };

  async function handleSelectResumePress() {
    const docResult = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (docResult.canceled) return;

    const picked = docResult.assets[0];
    const file: PickedResumeFile = {
      uri: picked.uri,
      name: picked.name,
      mimeType: picked.mimeType,
    };
    setSelectedFile(file);
    setResumeExtractError("");
    setResumeExtractState("extracting");

    try {
      const text = await extractResumeText(file);
      setResumeText(text);
      setResumeExtractState("ready");
    } catch (error) {
      setResumeExtractState("error");
      setResumeExtractError(
        error instanceof Error
          ? error.message
          : "Could not read that resume. Please try a different PDF."
      );
    }
  }

  async function handleAnalyzePress() {
    if (!hasAnyInput(currentInputs)) {
      setAssessmentState("error");
      setErrorMessage(
        "Please fill in at least one field — your profile, resume, GitHub username, or a job description."
      );
      return;
    }

    setAssessmentState("loading");
    setErrorMessage("");

    try {
      const payload = buildOrchestratePayload(currentInputs);
      const orchestratorResult = await analyzeCareerUnified(payload);

      // Process and save result + generate roadmap tasks
      await processAiResult(orchestratorResult);
      setAssessmentState("success");

      if (onAssessmentCompleted) {
        onAssessmentCompleted();
      }
    } catch (error) {
      setAssessmentState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  const ctaDisabled = assessmentState === "loading" || !hasAnyInput(currentInputs);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Unified AI Assessment</Text>
      <Text style={styles.subtitle}>
        Run deep evaluation across your profile, resume, GitHub, and target job description.
      </Text>

      <Text style={styles.hint}>
        Fill in any subset of fields below — the AI Orchestrator will automatically select the right specialist agents.
      </Text>

      {/* Inputs Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Career Profile & Goals</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Tell us about your background, skills, and goals..."
          placeholderTextColor={colors.textDim}
          multiline
          numberOfLines={4}
          value={profileText}
          onChangeText={setProfileText}
          editable={assessmentState !== "loading"}
        />

        <Text style={styles.label}>Resume PDF</Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSelectResumePress}
          disabled={assessmentState === "loading" || resumeExtractState === "extracting"}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            {selectedFile ? `📄 ${selectedFile.name}` : "Upload Resume (PDF)"}
          </Text>
        </TouchableOpacity>

        {selectedFile && (
          <View style={styles.resumeStatusRow}>
            {resumeExtractState === "extracting" && (
              <>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.resumeStatusText}>Reading PDF content...</Text>
              </>
            )}
            {resumeExtractState === "ready" && (
              <Text style={styles.resumeStatusTextSuccess}>✓ Resume text extracted</Text>
            )}
            {resumeExtractState === "error" && (
              <Text style={styles.resumeStatusTextError}>{resumeExtractError}</Text>
            )}
          </View>
        )}

        <Text style={styles.label}>GitHub Username</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. octocat"
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          autoCorrect={false}
          value={githubUsername}
          onChangeText={setGithubUsername}
          editable={assessmentState !== "loading"}
        />

        <Text style={styles.label}>Target Job Description</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Paste target job requirements here..."
          placeholderTextColor={colors.textDim}
          multiline
          numberOfLines={4}
          value={jobDescription}
          onChangeText={setJobDescription}
          editable={assessmentState !== "loading"}
        />

        <TouchableOpacity
          style={[styles.primaryButton, ctaDisabled && styles.buttonDisabled]}
          onPress={handleAnalyzePress}
          disabled={ctaDisabled}
          activeOpacity={0.8}
        >
          {assessmentState === "loading" ? (
            <>
              <ActivityIndicator color={colors.textOnPrimary} />
              <Text style={styles.primaryButtonText}>Running AI Agents...</Text>
            </>
          ) : (
            <Text style={styles.primaryButtonText}>✨ Analyze My Career</Text>
          )}
        </TouchableOpacity>
      </View>

      {assessmentState === "error" && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={handleAnalyzePress} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results View */}
      {result && (
        <View style={styles.resultsContainer}>
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>
              ✓ Assessment complete! Actionable tasks have been added to your Career Roadmap.
            </Text>
          </View>

          <Text style={styles.resultsHeading}>ASSESSMENT RESULTS</Text>

          {result.career_direction && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🧭 Career Direction</Text>
              <Text style={styles.cardBody}>{result.career_direction}</Text>
            </View>
          )}

          {result.strengths.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💪 Identified Strengths</Text>
              {result.strengths.map((item, index) => (
                <Text key={index} style={styles.cardListItem}>
                  • {item}
                </Text>
              ))}
            </View>
          )}

          {result.skill_gaps.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>⚠️ Skill Gaps to Bridge</Text>
              {result.skill_gaps.map((item, index) => (
                <Text key={index} style={styles.cardListItem}>
                  • {item}
                </Text>
              ))}
            </View>
          )}

          {result.job_match_score !== null && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎯 Job Match Assessment</Text>
              <Text style={styles.scoreText}>{result.job_match_score}%</Text>
              {result.job_match_summary && (
                <Text style={styles.cardBody}>{result.job_match_summary}</Text>
              )}
            </View>
          )}

          {result.github_summary && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🐙 GitHub Portfolio Insights</Text>
              <Text style={styles.cardBody}>{result.github_summary}</Text>
            </View>
          )}

          {result.resume_summary && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📄 Resume Analysis</Text>
              <Text style={styles.cardBody}>{result.resume_summary}</Text>
            </View>
          )}

          {result.recommendations.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🚀 Key Action Items</Text>
              {result.recommendations.map((item, index) => (
                <Text key={index} style={styles.cardListItem}>
                  {index + 1}. {item}
                </Text>
              ))}
            </View>
          )}

          <View style={[styles.card, styles.verdictCard]}>
            <Text style={styles.cardTitle}>🏆 Final Verdict</Text>
            <Text style={styles.cardBody}>{result.final_verdict}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.screenPadding, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, marginBottom: 4, marginTop: spacing.sm },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.sm },
  hint: { fontSize: 13, color: colors.textDim, marginBottom: spacing.lg, lineHeight: 18 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 12, fontWeight: "700", color: colors.textDim, textTransform: "uppercase", marginBottom: spacing.xs, marginTop: spacing.sm },
  textInput: {
    backgroundColor: colors.bg,
    borderRadius: radii.sm,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radii.sm,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  secondaryButtonText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  resumeStatusRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
  resumeStatusText: { color: colors.textMuted, fontSize: 12 },
  resumeStatusTextSuccess: { color: colors.success, fontSize: 12, fontWeight: "600" },
  resumeStatusTextError: { color: colors.error, fontSize: 12 },
  primaryButton: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: colors.textOnPrimary, fontSize: 15, fontWeight: "700" },
  errorCard: {
    backgroundColor: colors.bgCard,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  errorText: { color: colors.error, fontSize: 13, marginBottom: spacing.sm },
  retryButton: { alignSelf: "flex-start", backgroundColor: colors.bg, borderRadius: radii.sm, paddingVertical: 6, paddingHorizontal: 12 },
  retryButtonText: { color: colors.textPrimary, fontSize: 12, fontWeight: "600" },
  resultsContainer: { marginTop: spacing.lg },
  successBanner: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderWidth: 1,
    borderColor: colors.success,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  successBannerText: { color: colors.success, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  resultsHeading: { fontSize: 12, fontWeight: "800", color: colors.textDim, letterSpacing: 1, marginBottom: spacing.md },
  verdictCard: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.primary, marginBottom: spacing.sm },
  cardBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  cardListItem: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 4 },
  scoreText: { fontSize: 36, fontWeight: "800", color: colors.textPrimary, marginBottom: spacing.xs },
});