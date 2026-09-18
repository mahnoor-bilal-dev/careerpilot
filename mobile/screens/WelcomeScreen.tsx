/**
 * CareerPilot — Welcome / Onboarding Screen
 *
 * First screen the user sees. Professional branding with a clear CTA
 * to begin the career analysis flow. No inputs — just sets the tone.
 */

import { useRef, useEffect } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { colors, spacing, radii } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Animated.View
          style={[
            styles.heroContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Logo / Icon area */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🚀</Text>
          </View>

          <Text style={styles.appName}>CareerPilot</Text>
          <Text style={styles.tagline}>Your career, analyzed by AI.</Text>

          <View style={styles.featureList}>
            <FeatureItem emoji="📄" text="Resume analysis" />
            <FeatureItem emoji="🐙" text="GitHub portfolio review" />
            <FeatureItem emoji="💼" text="Job match scoring" />
            <FeatureItem emoji="🎯" text="Personalized action plan" />
            <FeatureItem emoji="💬" text="AI career coaching" />
          </View>
        </Animated.View>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Powered by Google Gemini & ADK
        </Text>
      </View>
    </View>
  );
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "space-between",
    padding: spacing.screenPadding,
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
  },
  heroContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxl,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  icon: {
    fontSize: 36,
  },
  appName: {
    fontSize: 40,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: spacing.xxxl + 8,
    fontWeight: "500",
  },
  featureList: {
    alignSelf: "stretch",
    paddingHorizontal: spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  featureEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  featureText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  bottomSection: {
    paddingBottom: spacing.lg,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  ctaText: {
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: colors.textDim,
  },
});
