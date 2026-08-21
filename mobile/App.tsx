/**
 * CareerPilot Mobile — Milestone 3
 *
 * One screen: enter a career profile, tap "Analyze My Career", and see
 * the AI-generated analysis.
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
import { analyzeCareer } from "./api/careerApi";

type ScreenState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [profileText, setProfileText] = useState("");
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [analysis, setAnalysis] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
            style={[
              styles.button,
              screenState === "loading" && styles.buttonDisabled,
            ]}
            onPress={handleAnalyzePress}
            disabled={screenState === "loading"}
          >
            {screenState === "loading" ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.buttonText}>Analyze My Career</Text>
            )}
          </TouchableOpacity>

          {screenState === "error" && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {screenState === "success" && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Career Analysis</Text>
              <Text style={styles.resultText}>{analysis}</Text>
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
  textInput: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#F8FAFC",
    minHeight: 140,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#38BDF8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#0F172A", fontSize: 16, fontWeight: "700" },
  errorCard: {
    backgroundColor: "#1E293B",
    borderLeftWidth: 4,
    borderLeftColor: "#F87171",
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  errorText: { color: "#F87171", fontSize: 14 },
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