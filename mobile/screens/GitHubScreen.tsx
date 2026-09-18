/**
 * CareerPilot — GitHub Username Screen
 *
 * Simple input screen for the user's GitHub username. Saved to shared
 * context for the orchestrator to pass to github_specialist.
 */

import { useState } from "react";
import {
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

type Props = NativeStackScreenProps<RootStackParamList, "GitHub">;

export default function GitHubScreen({ navigation }: Props) {
  const career = useCareer();
  const [username, setUsername] = useState(career.githubUsername);

  function handleContinue() {
    career.setGithubUsername(username.trim());
    navigation.navigate("Job");
  }

  function handleSkip() {
    navigation.navigate("Job");
  }

  return (
    <View style={shared.screen}>
      <View style={[shared.scrollContent, { flex: 1, justifyContent: "space-between" }]}>
        <View>
          <Text style={styles.heading}>GitHub Profile</Text>
          <Text style={styles.description}>
            Enter your GitHub username so CareerPilot can review your
            public repositories, tech stack, and portfolio quality.
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.prefix}>github.com/</Text>
            <TextInput
              style={styles.usernameInput}
              placeholder="username"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What we analyze</Text>
            <Text style={styles.infoItem}>• Public repository count & activity</Text>
            <Text style={styles.infoItem}>• Languages & technologies used</Text>
            <Text style={styles.infoItem}>• Project descriptions & documentation</Text>
            <Text style={styles.infoItem}>• Stars, forks, and engagement</Text>
            <Text style={styles.infoNote}>
              Only public data is accessed — no authentication required.
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[shared.primaryButton, { flex: 2 }]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={shared.primaryButtonText}>Continue →</Text>
          </TouchableOpacity>
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgInput,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  prefix: {
    fontSize: 15,
    color: colors.textDim,
    paddingLeft: spacing.lg,
    fontWeight: "500",
  },
  usernameInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    padding: spacing.lg,
    paddingLeft: spacing.xs,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: 18,
    marginTop: spacing.xxl,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  infoItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoNote: {
    fontSize: 12,
    color: colors.textDim,
    marginTop: spacing.md,
    fontStyle: "italic",
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
