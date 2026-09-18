/**
 * CareerPilot — Analysis Loading Screen
 *
 * Shows animated step-by-step agent activity while the orchestrator
 * processes the user's inputs. Each step fades in sequentially to
 * give meaningful feedback about what's happening behind the scenes.
 *
 * The actual API call happens on mount. When it completes, we navigate
 * to the Dashboard. On error, the user can retry or go back.
 */

import { useRef, useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { useCareer } from "../context/CareerContext";
import { analyzeCareerUnified, OrchestrateInput } from "../api/orchestrateApi";
import { colors, spacing, radii } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Analysis">;

interface AgentStep {
  id: string;
  label: string;
  relevant: boolean;
}

export default function AnalysisScreen({ navigation }: Props) {
  const career = useCareer();
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnims = useRef<Animated.Value[]>([]);

  // Determine which agent steps are relevant based on inputs
  const profileText = career.buildProfileText();
  const steps: AgentStep[] = [
    { id: "profile", label: "Analyzing career profile", relevant: profileText.trim().length > 0 },
    { id: "resume", label: "Reviewing resume", relevant: career.resumeText.trim().length > 0 },
    { id: "github", label: "Analyzing GitHub portfolio", relevant: career.githubUsername.trim().length > 0 },
    { id: "job", label: "Matching job requirements", relevant: career.jobDescription.trim().length > 0 },
    { id: "synthesize", label: "Synthesizing career plan", relevant: true },
  ];

  const relevantSteps = steps.filter((s) => s.relevant);

  // Initialize animation values
  if (fadeAnims.current.length === 0) {
    fadeAnims.current = relevantSteps.map(() => new Animated.Value(0));
  }

  useEffect(() => {
    startAnalysis();
  }, []);

  // Animate steps sequentially
  useEffect(() => {
    if (currentStep < relevantSteps.length) {
      Animated.timing(fadeAnims.current[currentStep], {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep]);

  async function startAnalysis() {
    setError(null);
    setCurrentStep(0);

    // Build the payload
    const payload: OrchestrateInput = {};
    if (profileText.trim()) payload.profile = profileText;
    if (career.resumeText.trim()) payload.resume_text = career.resumeText;
    if (career.githubUsername.trim()) payload.github_username = career.githubUsername;
    if (career.jobDescription.trim()) payload.job_description = career.jobDescription;

    // Animate through steps with delays
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < relevantSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    try {
      const result = await analyzeCareerUnified(payload);
      clearInterval(stepInterval);
      // Show all steps as complete
      setCurrentStep(relevantSteps.length);
      fadeAnims.current.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });

      career.setResult(result);

      // Brief pause to show completion before navigating
      setTimeout(() => {
        navigation.replace("Results");
      }, 800);
    } catch (err) {
      clearInterval(stepInterval);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Analyzing your career</Text>
        <Text style={styles.subheading}>
          Our AI agents are working together to build your career assessment.
        </Text>

        <View style={styles.stepsContainer}>
          {relevantSteps.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep && !error;

            return (
              <Animated.View
                key={step.id}
                style={[
                  styles.stepRow,
                  { opacity: fadeAnims.current[index] || new Animated.Value(index === 0 ? 1 : 0) },
                ]}
              >
                <View style={styles.stepIndicator}>
                  {isComplete ? (
                    <View style={styles.stepDone}>
                      <Text style={styles.stepCheckText}>✓</Text>
                    </View>
                  ) : isCurrent ? (
                    <View style={styles.stepActive}>
                      <View style={styles.stepPulse} />
                    </View>
                  ) : (
                    <View style={styles.stepPending} />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isComplete && styles.stepLabelDone,
                    isCurrent && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                  {isComplete ? " ✓" : isCurrent ? "..." : ""}
                </Text>
              </Animated.View>
            );
          })}
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <View style={styles.errorButtons}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={startAnalysis}
                activeOpacity={0.7}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.backText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    padding: spacing.screenPadding,
  },
  content: {
    alignItems: "center",
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subheading: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xxxl + 8,
    paddingHorizontal: spacing.lg,
  },
  stepsContainer: {
    alignSelf: "stretch",
    paddingHorizontal: spacing.lg,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.xl + 4,
  },
  stepIndicator: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCheckText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  stepActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  stepPending: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepLabel: {
    fontSize: 16,
    color: colors.textDim,
    fontWeight: "500",
    flex: 1,
  },
  stepLabelDone: {
    color: colors.success,
  },
  stepLabelActive: {
    color: colors.textPrimary,
  },
  errorCard: {
    backgroundColor: colors.bgCard,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    borderRadius: radii.sm,
    padding: spacing.lg,
    marginTop: spacing.xxxl,
    alignSelf: "stretch",
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  errorButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
  },
  retryText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  backButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
  },
  backText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
});
