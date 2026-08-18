/**
 * CareerPilot Mobile — Milestone 1
 *
 * One screen. It calls the backend's /health endpoint on load and shows
 * whether the connection succeeded. That's it — this proves the phone
 * (or Expo Go) can actually reach the FastAPI server before we build
 * anything more interesting on top of it.
 */

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const API_BASE_URL = "http://localhost:8000";

type ConnectionState = "loading" | "success" | "error";

export default function App() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    checkBackendHealth();
  }, []);

  async function checkBackendHealth() {
    setConnectionState("loading");
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      setMessage(`Backend says: ${data.status}`);
      setConnectionState("success");
    } catch (error) {
      setMessage(
        "Could not reach the backend. Is it running? Is the IP correct?"
      );
      setConnectionState("error");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>CareerPilot</Text>
        <Text style={styles.subtitle}>Your career, analyzed by AI.</Text>

        <View style={styles.statusCard}>
          {connectionState === "loading" && (
            <>
              <ActivityIndicator color="#38BDF8" />
              <Text style={styles.statusText}>Checking backend...</Text>
            </>
          )}
          {connectionState === "success" && (
            <Text style={[styles.statusText, styles.successText]}>
              ✓ {message}
            </Text>
          )}
          {connectionState === "error" && (
            <Text style={[styles.statusText, styles.errorText]}>
              ✗ {message}
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#94A3B8",
    marginBottom: 40,
  },
  statusCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#CBD5E1",
    textAlign: "center",
  },
  successText: {
    color: "#4ADE80",
  },
  errorText: {
    color: "#F87171",
  },
});
