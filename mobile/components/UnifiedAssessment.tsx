/**
 * CareerPilot Mobile — Unified Career Assessment (Milestone 8, structured result UI Milestone 9)
 *
 * MILESTONE 9 CHANGE: the success state now renders separate cards per
 * section (Career Direction, Strengths, Skill Gaps, Job Match, GitHub,
 * Resume, Recommendations, Final Verdict) instead of one text blob.
 * Every optional card is conditionally rendered based on whether the
 * corresponding OrchestratorOutput field is present — a null/empty
 * field means that specialist didn't run, so its card simply isn't
 * shown. We do NOT parse any AI text here — every value rendered comes
 * directly from the already-typed OrchestratorOutput object.
 */

import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

import { analyzeCareerUnified, OrchestratorOutput } from "../api/orchestrateApi";
import { extractResumeText, PickedResumeFile } from "../api/resumeApi";
import {
  buildOrchestratePayload,
  hasAnyInput,
  UnifiedAssessmentInputs,
} from "../utils/orchestratePayload";

type AssessmentState = "idle" | "loading" | "success" | "error";
type ResumeExtractState = "idle" | "extracting" | "ready" | "error";

export default function UnifiedAssessment() {
  const [profileText, setProfileText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [githubUsername, setGithubUsername] = useState("");

  const [selectedFile, setSelectedFile] = useState<PickedResumeFile | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeExtractState, setResumeExtractState] = useState<ResumeExtractState>("idle");
  const [resumeExtractError, setResumeExtractError] = useState("");

  const [assessmentState, setAssessmentState] = useState<AssessmentState>("idle");
  const [result, setResult] = useState<OrchestratorOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const currentInputs: UnifiedAssessmentInputs = {
    profileText,
    resumeText,
    githubUsername,
    jobDescription,
  };

  async function handleSelectResumePress() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const picked = result.assets[0];
    const file: PickedResumeFile = {
      uri: picked.uri,
      name: picked.name,
      mimeType: picked.mimeType,
    };
    setSelectedFile(file);
    setResumeText("");
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
      setResult(orchestratorResult);
      setAssessmentState("success");
    } catch (error) {
      setAssessmentState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  const ctaDisabled =
    assessmentState === "loading" || !hasAnyInput(currentInputs);

  return (
    <View>
      <Text style={styles.title}>CareerPilot</Text>
      <Text style={styles.subtitle}>Your AI Career Assistant</Text>

      <Text style={styles.hint}>
        Fill in as much or as little as you'd like — CareerPilot will
        figure out which analyses make sense.
      </Text>

      <Text style={styles.label}>Career Profile</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Tell us about yourself..."
        placeholderTextColor="#64748B"
        multiline
        numberOfLines={4}
        value={profileText}
        onChangeText={setProfileText}
        editable={assessmentState !== "loading"}
      />

      <Text style={styles.label}>Resume</Text>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleSelectResumePress}
        disabled={assessmentState === "loading" || resumeExtractState === "extracting"}
      >
        <Text style={styles.secondaryButtonText}>
          {selectedFile ? "Choose a Different Resume" : "Upload Resume"}
        </Text>
      </TouchableOpacity>

      {selectedFile && (
        <View style={styles.resumeStatusRow}>
          {resumeExtractState === "extracting" && (
            <>
              <ActivityIndicator size="small" color="#38BDF8" />
              <Text style={styles.resumeStatusText}>Reading {selectedFile.name}...</Text>
            </>
          )}
          {resumeExtractState === "ready" && (
            <Text style={styles.resumeStatusTextSuccess}>
              ✓ {selectedFile.name} ready
            </Text>
          )}
          {resumeExtractState === "error" && (
            <Text style={styles.resumeStatusTextError}>{resumeExtractError}</Text>
          )}
        </View>
      )}

      <Text style={styles.label}>GitHub</Text>
      <TextInput
        style={styles.usernameInput}
        placeholder="username"
        placeholderTextColor="#64748B"
        autoCapitalize="none"
        autoCorrect={false}
        value={githubUsername}
        onChangeText={setGithubUsername}
        editable={assessmentState !== "loading"}
      />

      <Text style={styles.label}>Target Job</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Paste job description here..."
        placeholderTextColor="#64748B"
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
      >
        {assessmentState === "loading" ? (
          <>
            <ActivityIndicator color="#0F172A" />
            <Text style={styles.primaryButtonText}>Analyzing your career...</Text>
          </>
        ) : (
          <Text style={styles.primaryButtonText}>✨ Analyze My Career</Text>
        )}
      </TouchableOpacity>

      {assessmentState === "error" && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={handleAnalyzePress} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {assessmentState === "success" && result && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeading}>Your Career Assessment</Text>

          {result.career_direction && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Career Direction</Text>
              <Text style={styles.cardBody}>{result.career_direction}</Text>
            </View>
          )}

          {result.strengths.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💪 Strengths</Text>
              {result.strengths.map((item, index) => (
                <Text key={index} style={styles.cardListItem}>• {item}</Text>
              ))}
            </View>
          )}

          {result.skill_gaps.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>⚠️ Skill Gaps</Text>
              {result.skill_gaps.map((item, index) => (
                <Text key={index} style={styles.cardListItem}>• {item}</Text>
              ))}
            </View>
          )}

          {result.job_match_score !== null && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💼 Job Match</Text>
              <Text style={styles.scoreText}>{result.job_match_score}%</Text>
              {result.job_match_summary && (
                <Text style={styles.cardBody}>{result.job_match_summary}</Text>
              )}
            </View>
          )}

          {result.github_summary && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🐙 GitHub</Text>
              <Text style={styles.cardBody}>{result.github_summary}</Text>
            </View>
          )}

          {result.resume_summary && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📄 Resume</Text>
              <Text style={styles.cardBody}>{result.resume_summary}</Text>
            </View>
          )}

          {result.recommendations.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🚀 Recommendations</Text>
              {result.recommendations.map((item, index) => (
                <Text key={index} style={styles.cardListItem}>{index + 1}. {item}</Text>
              ))}
            </View>
          )}

          <View style={[styles.card, styles.verdictCard]}>
            <Text style={styles.cardTitle}>Final Verdict</Text>
            <Text style={styles.cardBody}>{result.final_verdict}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 34, fontWeight: "700", color: "#F8FAFC", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#94A3B8", marginBottom: 16 },
  hint: { fontSize: 13, color: "#64748B", marginBottom: 24, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: "600", color: "#CBD5E1", marginBottom: 8, marginTop: 16 },
  textInput: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, fontSize: 15, color: "#F8FAFC", minHeight: 100, textAlignVertical: "top" },
  usernameInput: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, fontSize: 15, color: "#F8FAFC" },
  secondaryButton: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: "#E2E8F0", fontSize: 15, fontWeight: "600" },
  resumeStatusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  resumeStatusText: { color: "#94A3B8", fontSize: 13 },
  resumeStatusTextSuccess: { color: "#4ADE80", fontSize: 13 },
  resumeStatusTextError: { color: "#F87171", fontSize: 13 },
  primaryButton: { flexDirection: "row", gap: 10, backgroundColor: "#38BDF8", borderRadius: 12, paddingVertical: 18, alignItems: "center", justifyContent: "center", marginTop: 28 },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: "#0F172A", fontSize: 16, fontWeight: "700" },
  errorCard: { backgroundColor: "#1E293B", borderLeftWidth: 4, borderLeftColor: "#F87171", borderRadius: 8, padding: 16, marginTop: 20 },
  errorText: { color: "#F87171", fontSize: 14, marginBottom: 12 },
  retryButton: { alignSelf: "flex-start", backgroundColor: "#334155", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  retryButtonText: { color: "#F8FAFC", fontSize: 13, fontWeight: "600" },
  resultsContainer: { marginTop: 24 },
  resultsHeading: { fontSize: 13, fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  card: { backgroundColor: "#1E293B", borderRadius: 12, padding: 18, marginBottom: 12 },
  verdictCard: { borderLeftWidth: 4, borderLeftColor: "#38BDF8" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#38BDF8", marginBottom: 10 },
  cardBody: { fontSize: 15, color: "#E2E8F0", lineHeight: 22 },
  cardListItem: { fontSize: 15, color: "#E2E8F0", lineHeight: 24 },
  scoreText: { fontSize: 36, fontWeight: "800", color: "#F8FAFC", marginBottom: 6 },
});