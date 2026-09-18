/**
 * CareerPilot — Resume Upload Screen
 *
 * Allows the user to pick a PDF resume from their device. On selection,
 * it calls /extract-resume-text to pull out the text content, which is
 * then stored in the shared context for the orchestrator to use later.
 */

import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { useCareer } from "../context/CareerContext";
import { extractResumeText, PickedResumeFile } from "../api/resumeApi";
import { colors, spacing, radii, shared } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Resume">;
type ExtractState = "idle" | "extracting" | "ready" | "error";

export default function ResumeScreen({ navigation }: Props) {
  const career = useCareer();
  const [selectedFile, setSelectedFile] = useState<PickedResumeFile | null>(
    career.resumeFileName
      ? { uri: "", name: career.resumeFileName, mimeType: "application/pdf" }
      : null
  );
  const [extractState, setExtractState] = useState<ExtractState>(
    career.resumeText ? "ready" : "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handlePickResume() {
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
    setExtractState("extracting");
    setErrorMsg("");

    try {
      const text = await extractResumeText(file);
      career.setResumeText(text);
      career.setResumeFileName(picked.name);
      setExtractState("ready");
    } catch (err) {
      setExtractState("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Could not read that resume. Please try a different PDF."
      );
    }
  }

  function handleContinue() {
    navigation.navigate("GitHub");
  }

  return (
    <View style={shared.screen}>
      <View style={[shared.scrollContent, { flex: 1, justifyContent: "space-between" }]}>
        <View>
          <Text style={styles.heading}>Resume</Text>
          <Text style={styles.description}>
            Upload your PDF resume for a detailed analysis. CareerPilot will
            extract the text and use it alongside your other inputs.
          </Text>

          {/* Upload area */}
          <TouchableOpacity
            style={styles.uploadArea}
            onPress={handlePickResume}
            disabled={extractState === "extracting"}
            activeOpacity={0.7}
          >
            <Text style={styles.uploadIcon}>
              {extractState === "ready" ? "✅" : "📄"}
            </Text>
            <Text style={styles.uploadTitle}>
              {selectedFile ? selectedFile.name : "Tap to select a PDF resume"}
            </Text>
            <Text style={styles.uploadHint}>
              {selectedFile ? "Tap to choose a different file" : "PDF files up to 5 MB"}
            </Text>
          </TouchableOpacity>

          {/* Status indicators */}
          {extractState === "extracting" && (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.statusText}>Reading resume...</Text>
            </View>
          )}

          {extractState === "ready" && (
            <View style={styles.statusRow}>
              <Text style={styles.statusSuccess}>
                ✓ Resume ready — {career.resumeText.split(/\s+/).length} words extracted
              </Text>
            </View>
          )}

          {extractState === "error" && (
            <View style={shared.errorCard}>
              <Text style={shared.errorText}>{errorMsg}</Text>
            </View>
          )}
        </View>

        {/* Navigation buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>
              {career.resumeText ? "Continue" : "Skip"}
            </Text>
          </TouchableOpacity>

          {extractState === "ready" && (
            <TouchableOpacity
              style={[shared.primaryButton, { flex: 2 }]}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={shared.primaryButtonText}>Continue →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  uploadArea: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  uploadHint: {
    fontSize: 13,
    color: colors.textDim,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  statusSuccess: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "500",
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
