/**
 * CareerPilot Mobile — Milestone 4
 *
 * Career profile section (Milestone 3) plus a new Resume section:
 * select a PDF, tap Analyze Resume, see the AI breakdown.
 */

import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as DocumentPicker from "expo-document-picker";
import { analyzeCareer } from "./api/careerApi";
import { analyzeResume, PickedResumeFile } from "./api/resumeApi";
import { analyzeGitHub } from "./api/githubApi";

type ScreenState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [profileText, setProfileText] = useState("");
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [analysis, setAnalysis] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedFile, setSelectedFile] = useState<PickedResumeFile | null>(null);
  const [resumeState, setResumeState] = useState<ScreenState>("idle");
  const [resumeAnalysis, setResumeAnalysis] = useState("");
  const [resumeErrorMessage, setResumeErrorMessage] = useState("");

  const [githubUsername, setGithubUsername] = useState("");
  const [githubState, setGithubState] = useState<ScreenState>("idle");
  const [githubAnalysis, setGithubAnalysis] = useState("");
  const [githubErrorMessage, setGithubErrorMessage] = useState("");

  async function handleAnalyzePress() {
    const trimmed = profileText.trim();
    if (!trimmed) {
      setScreenState("error");
      setErrorMessage("Please enter a career profile before analyzing.");
      return;
    }
    setScreenState("loading");
    setErrorMessage("");
    try {
      const result = await analyzeCareer(trimmed);
      setAnalysis(result);
      setScreenState("success");
    } catch (error) {
      setScreenState("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  async function handleSelectResumePress() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const picked = result.assets[0];
    setSelectedFile({ uri: picked.uri, name: picked.name, mimeType: picked.mimeType });
    setResumeState("idle");
    setResumeAnalysis("");
    setResumeErrorMessage("");
  }

  async function handleAnalyzeResumePress() {
    if (!selectedFile) {
      setResumeState("error");
      setResumeErrorMessage("Please select a PDF resume first.");
      return;
    }
    setResumeState("loading");
    setResumeErrorMessage("");
    try {
      const result = await analyzeResume(selectedFile);
      setResumeAnalysis(result);
      setResumeState("success");
    } catch (error) {
      setResumeState("error");
      setResumeErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  async function handleAnalyzeGitHubPress() {
    const trimmed = githubUsername.trim();

    if (!trimmed) {
      setGithubState("error");
      setGithubErrorMessage("Please enter a GitHub username first.");
      return;
    }

    setGithubState("loading");
    setGithubErrorMessage("");

    try {
      const result = await analyzeGitHub(trimmed);
      setGithubAnalysis(result);
      setGithubState("success");
    } catch (error) {
      setGithubState("error");
      setGithubErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>CareerPilot</Text>
          <Text style={styles.subtitle}>Your AI-powered career coach</Text>

          <Text style={styles.label}>Your career profile</Text>
          <TextInput
            style={styles.textInput}
            placeholder="I am a Computer Science student with experience in React Native, Python and UI/UX..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={6}
            value={profileText}
            onChangeText={setProfileText}
            editable={screenState !== "loading"}
          />

          <TouchableOpacity
            style={[styles.button, screenState === "loading" && styles.buttonDisabled]}
            onPress={handleAnalyzePress}
            disabled={screenState === "loading"}
          >
            {screenState === "loading" ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.buttonText}>Analyze My Career</Text>}
          </TouchableOpacity>

          {screenState === "error" && (
            <View style={styles.errorCard}><Text style={styles.errorText}>{errorMessage}</Text></View>
          )}

          {screenState === "success" && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Career Analysis</Text>
              <Text style={styles.resultText}>{analysis}</Text>
            </View>
          )}

          <View style={styles.sectionDivider} />

          <Text style={styles.title}>Resume</Text>
          <Text style={styles.subtitle}>Upload a PDF resume for a detailed AI breakdown</Text>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleSelectResumePress} disabled={resumeState === "loading"}>
            <Text style={styles.secondaryButtonText}>{selectedFile ? "Choose a Different Resume" : "Select Resume"}</Text>
          </TouchableOpacity>

          {selectedFile && <Text style={styles.fileName} numberOfLines={1}>📄 {selectedFile.name}</Text>}

          <TouchableOpacity
            style={[styles.button, styles.buttonSpaced, (resumeState === "loading" || !selectedFile) && styles.buttonDisabled]}
            onPress={handleAnalyzeResumePress}
            disabled={resumeState === "loading" || !selectedFile}
          >
            {resumeState === "loading" ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.buttonText}>Analyze Resume</Text>}
          </TouchableOpacity>

          {resumeState === "error" && (
            <View style={styles.errorCard}><Text style={styles.errorText}>{resumeErrorMessage}</Text></View>
          )}

          {resumeState === "success" && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Resume Analysis</Text>
              <Text style={styles.resultText}>{resumeAnalysis}</Text>
            </View>
          )}

          <View style={styles.sectionDivider} />

          <Text style={styles.title}>GitHub</Text>
          <Text style={styles.subtitle}>
            See how your public repos read to a recruiter
          </Text>

          <Text style={styles.label}>GitHub username</Text>
          <TextInput
            style={styles.usernameInput}
            placeholder="octocat"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            autoCorrect={false}
            value={githubUsername}
            onChangeText={setGithubUsername}
            editable={githubState !== "loading"}
          />

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonSpaced,
              githubState === "loading" && styles.buttonDisabled,
            ]}
            onPress={handleAnalyzeGitHubPress}
            disabled={githubState === "loading"}
          >
            {githubState === "loading" ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.buttonText}>Analyze GitHub</Text>
            )}
          </TouchableOpacity>

          {githubState === "error" && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{githubErrorMessage}</Text>
            </View>
          )}

          {githubState === "success" && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>GitHub Analysis</Text>
              <Text style={styles.resultText}>{githubAnalysis}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  flex: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 34, fontWeight: "700", color: "#F8FAFC", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#94A3B8", marginBottom: 32 },
  label: { fontSize: 14, fontWeight: "600", color: "#CBD5E1", marginBottom: 8 },
  textInput: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, fontSize: 15, color: "#F8FAFC", minHeight: 140, textAlignVertical: "top", marginBottom: 20 },
  usernameInput: {
  backgroundColor: "#1E293B",
  borderRadius: 12,
  padding: 16,
  fontSize: 15,
  color: "#F8FAFC",
},
  button: { backgroundColor: "#38BDF8", borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  buttonDisabled: { opacity: 0.7 },
  buttonSpaced: { marginTop: 16 },
  secondaryButton: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: "#E2E8F0", fontSize: 16, fontWeight: "600" },
  fileName: { color: "#94A3B8", fontSize: 13, marginTop: 10 },
  sectionDivider: { height: 1, backgroundColor: "#1E293B", marginVertical: 32 },
  buttonText: { color: "#0F172A", fontSize: 16, fontWeight: "700" },
  errorCard: { backgroundColor: "#1E293B", borderLeftWidth: 4, borderLeftColor: "#F87171", borderRadius: 8, padding: 16, marginTop: 20 },
  errorText: { color: "#F87171", fontSize: 14 },
  resultCard: { backgroundColor: "#1E293B", borderRadius: 12, padding: 20, marginTop: 20 },
  resultLabel: { fontSize: 14, fontWeight: "700", color: "#38BDF8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  resultText: { fontSize: 15, color: "#E2E8F0", lineHeight: 22 },
});