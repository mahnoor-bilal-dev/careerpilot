/**
 * CareerPilot Mobile — Milestone 8 (simplified)
 *
 * App.tsx now only mounts UnifiedAssessment — the single "Analyze My
 * Career" flow that sends whatever the user provides to /orchestrate.
 *
 * The four individual sections/handlers from Milestones 3-6 (separate
 * Career/Resume/GitHub/Job Match flows calling /analyze, /analyze-resume,
 * /analyze-github, /analyze-job directly) were removed from this screen
 * at the user's request, since having both the unified flow AND four
 * near-identical individual sections on one screen looked like
 * duplicated input fields in practice.
 *
 * NOTE: the individual backend endpoints (/analyze, /analyze-resume,
 * /analyze-github, /analyze-job) and their mobile API clients
 * (api/careerApi.ts, api/githubApi.ts, api/jobApi.ts, and the
 * analyzeResume() function in api/resumeApi.ts) are untouched and still
 * fully working — they're just no longer wired into this screen's UI.
 */

import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import UnifiedAssessment from "./components/UnifiedAssessment";

export default function App() {
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
          <UnifiedAssessment />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  flex: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },
});