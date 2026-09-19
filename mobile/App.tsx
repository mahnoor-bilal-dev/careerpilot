/**
 * CareerPilot Mobile App Root
 * Wraps CareerProvider and manages Onboarding + Bottom Tab Navigation.
 */

import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { CareerProvider, useCareer } from "./context/CareerContext";
import HomeScreen from "./screens/HomeScreen";
import RoadmapScreen from "./screens/RoadmapScreen";
import PortfolioScreen from "./screens/PortfolioScreen";
import ProfileScreen from "./screens/ProfileScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import UnifiedAssessment from "./components/UnifiedAssessment";
import { colors, spacing } from "./theme";
export type { RootStackParamList } from "./types/navigation";

type TabName = "home" | "roadmap" | "portfolio" | "assessment" | "profile";

function MainAppContent() {
  const { userProfile, isLoaded } = useCareer();
  const [activeTab, setActiveTab] = useState<TabName>("home");

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading CareerPilot...</Text>
      </View>
    );
  }

  // Show Onboarding if profile is not setup
  if (!userProfile.onboardingCompleted) {
    return <OnboardingScreen onComplete={() => setActiveTab("home")} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.contentArea}>
          {activeTab === "home" && (
            <HomeScreen
              onNavigateToRoadmap={() => setActiveTab("roadmap")}
              onNavigateToAssessment={() => setActiveTab("assessment")}
              onNavigateToProjects={() => setActiveTab("portfolio")}
            />
          )}
          {activeTab === "roadmap" && <RoadmapScreen />}
          {activeTab === "portfolio" && <PortfolioScreen />}
          {activeTab === "assessment" && (
            <UnifiedAssessment onAssessmentCompleted={() => setActiveTab("home")} />
          )}
          {activeTab === "profile" && <ProfileScreen />}
        </View>

        {/* Bottom Tab Navigator */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "home" && styles.tabItemActive]}
            onPress={() => setActiveTab("home")}
          >
            <Text style={styles.tabIcon}>🏠</Text>
            <Text style={[styles.tabLabel, activeTab === "home" && styles.tabLabelActive]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "roadmap" && styles.tabItemActive]}
            onPress={() => setActiveTab("roadmap")}
          >
            <Text style={styles.tabIcon}>🗺️</Text>
            <Text style={[styles.tabLabel, activeTab === "roadmap" && styles.tabLabelActive]}>
              Roadmap
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "portfolio" && styles.tabItemActive]}
            onPress={() => setActiveTab("portfolio")}
          >
            <Text style={styles.tabIcon}>📁</Text>
            <Text style={[styles.tabLabel, activeTab === "portfolio" && styles.tabLabelActive]}>
              Projects
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "assessment" && styles.tabItemActive]}
            onPress={() => setActiveTab("assessment")}
          >
            <Text style={styles.tabIcon}>⚡</Text>
            <Text style={[styles.tabLabel, activeTab === "assessment" && styles.tabLabelActive]}>
              Assess
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "profile" && styles.tabItemActive]}
            onPress={() => setActiveTab("profile")}
          >
            <Text style={styles.tabIcon}>👤</Text>
            <Text style={[styles.tabLabel, activeTab === "profile" && styles.tabLabelActive]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <CareerProvider>
      <MainAppContent />
    </CareerProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  contentArea: { flex: 1 },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { color: colors.textMuted, marginTop: spacing.md, fontSize: 14 },

  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 6,
    paddingBottom: Platform.OS === "ios" ? 20 : 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tabItemActive: {},
  tabIcon: { fontSize: 18, marginBottom: 2 },
  tabLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "500" },
  tabLabelActive: { color: colors.primary, fontWeight: "700" },
});