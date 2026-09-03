/**
 * CareerPilot Mobile — Unified Career Assessment (Milestone 8)
 *
 * One primary flow: the user fills in any combination of profile,
 * resume, GitHub username, and job description, then taps a single
 * "Analyze My Career" CTA. Everything available gets sent to
 * POST /orchestrate — the backend orchestrator alone decides which
 * specialist agents are relevant. This component contains NO logic
 * like "if resume, call resume agent" — see buildOrchestratePayload
 * in utils/orchestratePayload.ts for the one place that decides what
 * to include in the request, which is just "does this field have
 * content", not "which AI agent should run".
 *
 * Colors below intentionally match the existing palette already used
 * throughout App.tsx (#0F172A background, #1E293B cards, #38BDF8
 * accent, etc.) so this reads as one consistent app, not a bolted-on
 * screen with different styling.
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

import { analyzeCareerUnified } from "../api/orchestrateApi";
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
  const [analysis, setAnalysis] = useState("");
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
      const result = await analyzeCareerUnified(payload);
      setAnalysis(result);
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

      {assessmentState === "success" && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>AI Career Analysis</Text>
          <Text style={styles.resultText}>{analysis}</Text>
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
  textInput: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#F8FAFC",
    minHeight: 100,
    textAlignVertical: "top",
  },
  usernameInput: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#F8FAFC",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { color: "#E2E8F0", fontSize: 15, fontWeight: "600" },
  resumeStatusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  resumeStatusText: { color: "#94A3B8", fontSize: 13 },
  resumeStatusTextSuccess: { color: "#4ADE80", fontSize: 13 },
  resumeStatusTextError: { color: "#F87171", fontSize: 13 },
  primaryButton: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#38BDF8",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: "#0F172A", fontSize: 16, fontWeight: "700" },
  errorCard: {
    backgroundColor: "#1E293B",
    borderLeftWidth: 4,
    borderLeftColor: "#F87171",
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  errorText: { color: "#F87171", fontSize: 14, marginBottom: 12 },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#334155",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: { color: "#F8FAFC", fontSize: 13, fontWeight: "600" },
  resultCard: { backgroundColor: "#1E293B", borderRadius: 12, padding: 20, marginTop: 20 },
  resultLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#38BDF8",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultText: { fontSize: 15, color: "#E2E8F0", lineHeight: 22 },
});