/**
 * CareerPilot — Shared career data context
 *
 * React Context that holds all user inputs (profile, resume text,
 * GitHub username, job description) and the orchestrator analysis
 * result. Screens read and write through this instead of prop-drilling
 * through the navigation stack.
 *
 * Deliberately simple: no reducers, no middleware — just useState at
 * the provider level. The app has a small, well-understood state shape,
 * so useState is clearer than useReducer here.
 */

import React, { createContext, useContext, useState, ReactNode } from "react";
import { OrchestratorOutput } from "../api/orchestrateApi";

// ─── State shape ─────────────────────────────────────────────────

export interface CareerProfile {
  name: string;
  currentRole: string;
  experienceLevel: string;
  skills: string;
  careerGoal: string;
}

export const EMPTY_PROFILE: CareerProfile = {
  name: "",
  currentRole: "",
  experienceLevel: "",
  skills: "",
  careerGoal: "",
};

export interface CareerState {
  // User inputs
  profile: CareerProfile;
  resumeText: string;
  resumeFileName: string;
  githubUsername: string;
  jobDescription: string;

  // Analysis result (null until the orchestrator returns)
  result: OrchestratorOutput | null;

  // Chat messages
  chatMessages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

// ─── Context value ───────────────────────────────────────────────

interface CareerContextValue extends CareerState {
  setProfile: (profile: CareerProfile) => void;
  setResumeText: (text: string) => void;
  setResumeFileName: (name: string) => void;
  setGithubUsername: (username: string) => void;
  setJobDescription: (description: string) => void;
  setResult: (result: OrchestratorOutput | null) => void;
  addChatMessage: (message: ChatMessage) => void;
  resetAll: () => void;

  /** Builds a plain-text summary of the profile for the /orchestrate payload. */
  buildProfileText: () => string;
}

const CareerContext = createContext<CareerContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────

export function CareerProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CareerProfile>(EMPTY_PROFILE);
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<OrchestratorOutput | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  function addChatMessage(message: ChatMessage) {
    setChatMessages((prev) => [...prev, message]);
  }

  function resetAll() {
    setProfile(EMPTY_PROFILE);
    setResumeText("");
    setResumeFileName("");
    setGithubUsername("");
    setJobDescription("");
    setResult(null);
    setChatMessages([]);
  }

  function buildProfileText(): string {
    const parts: string[] = [];
    if (profile.name) parts.push(`Name: ${profile.name}`);
    if (profile.currentRole) parts.push(`Current Role: ${profile.currentRole}`);
    if (profile.experienceLevel) parts.push(`Experience Level: ${profile.experienceLevel}`);
    if (profile.skills) parts.push(`Skills: ${profile.skills}`);
    if (profile.careerGoal) parts.push(`Career Goal: ${profile.careerGoal}`);
    return parts.join("\n");
  }

  const value: CareerContextValue = {
    profile,
    resumeText,
    resumeFileName,
    githubUsername,
    jobDescription,
    result,
    chatMessages,
    setProfile,
    setResumeText,
    setResumeFileName,
    setGithubUsername,
    setJobDescription,
    setResult,
    addChatMessage,
    resetAll,
    buildProfileText,
  };

  return (
    <CareerContext.Provider value={value}>{children}</CareerContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────

export function useCareer(): CareerContextValue {
  const ctx = useContext(CareerContext);
  if (!ctx) {
    throw new Error("useCareer must be used within a <CareerProvider>");
  }
  return ctx;
}
