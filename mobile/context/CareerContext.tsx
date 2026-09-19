/**
 * CareerPilot — Core Career Context & Local State Engine
 * Handles user onboarding profile, task items, portfolio projects, AI output cache,
 * and persistence using AsyncStorage.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { OrchestratorOutput } from "../api/orchestrateApi";
import { UserProfile, CareerTask, ProjectItem } from "../types/career";
import { storage } from "../utils/storage";
import { generateDefaultTasks, convertAiRecommendationsToTasks } from "../utils/taskGenerator";

export interface CareerProfile {
  name: string;
  currentRole: string;
  experienceLevel: string;
  skills: string;
  careerGoal: string;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Developer",
  targetRole: "Mobile Developer",
  careerObjective: "Get my first job",
  experienceLevel: "Student",
  skills: "React Native, JavaScript, Python",
  careerGoal: "Become a proficient mobile developer building production apps.",
  onboardingCompleted: false,
};

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface CareerContextValue {
  // Onboarding & Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (profile: UserProfile) => Promise<void>;

  // Input states (resume, github, job)
  profile: CareerProfile;
  setProfile: (profile: CareerProfile) => void;
  resumeText: string;
  setResumeText: (text: string) => void;
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  githubUsername: string;
  setGithubUsername: (username: string) => void;
  jobDescription: string;
  setJobDescription: (description: string) => void;

  // Tasks & Progress
  tasks: CareerTask[];
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  addTask: (task: Omit<CareerTask, "id" | "createdAt">) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  progressPercentage: number;

  // Portfolio / Projects
  projects: ProjectItem[];
  addProject: (project: Omit<ProjectItem, "id" | "createdAt">) => Promise<void>;
  updateProject: (id: string, project: Partial<ProjectItem>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // AI Analysis Cache & Execution
  result: OrchestratorOutput | null;
  setResult: (result: OrchestratorOutput | null) => Promise<void>;
  processAiResult: (result: OrchestratorOutput) => Promise<void>;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;

  // Utilities
  isLoaded: boolean;
  resetAll: () => Promise<void>;
  buildProfileText: () => string;
}

const CareerContext = createContext<CareerContextValue | null>(null);

export function CareerProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [resumeText, setResumeTextState] = useState("");
  const [resumeFileName, setResumeFileNameState] = useState("");
  const [githubUsername, setGithubUsernameState] = useState("");
  const [jobDescription, setJobDescriptionState] = useState("");
  const [result, setResultState] = useState<OrchestratorOutput | null>(null);
  const [tasks, setTasksState] = useState<CareerTask[]>([]);
  const [projects, setProjectsState] = useState<ProjectItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    async function loadSavedState() {
      const [savedProfile, savedTasks, savedProjects, savedResult, savedInputs] =
        await Promise.all([
          storage.loadProfile(),
          storage.loadTasks(),
          storage.loadProjects(),
          storage.loadAnalysisResult(),
          storage.loadInputs(),
        ]);

      if (savedProfile) {
        setUserProfileState(savedProfile);
      }

      if (savedTasks.length > 0) {
        setTasksState(savedTasks);
      } else if (savedProfile) {
        const defaultTasks = generateDefaultTasks(savedProfile);
        setTasksState(defaultTasks);
        await storage.saveTasks(defaultTasks);
      }

      if (savedProjects.length > 0) {
        setProjectsState(savedProjects);
      }

      if (savedResult) {
        setResultState(savedResult);
      }

      if (savedInputs) {
        setResumeTextState(savedInputs.resumeText);
        setResumeFileNameState(savedInputs.resumeFileName);
        setGithubUsernameState(savedInputs.githubUsername);
        setJobDescriptionState(savedInputs.jobDescription);
      }

      setIsLoaded(true);
    }

    loadSavedState();
  }, []);

  // Update profile
  async function updateUserProfile(updates: Partial<UserProfile>) {
    const updated = { ...userProfile, ...updates };
    setUserProfileState(updated);
    await storage.saveProfile(updated);
  }

  // Complete onboarding
  async function completeOnboarding(profile: UserProfile) {
    const fullProfile: UserProfile = { ...profile, onboardingCompleted: true };
    setUserProfileState(fullProfile);
    await storage.saveProfile(fullProfile);

    // Generate starter tasks
    const initialTasks = generateDefaultTasks(fullProfile);
    setTasksState(initialTasks);
    await storage.saveTasks(initialTasks);
  }

  // Set inputs with auto-save
  async function setResumeText(text: string) {
    setResumeTextState(text);
    await storage.saveInputs({ resumeText: text });
  }

  async function setResumeFileName(name: string) {
    setResumeFileNameState(name);
    await storage.saveInputs({ resumeFileName: name });
  }

  async function setGithubUsername(username: string) {
    setGithubUsernameState(username);
    await storage.saveInputs({ githubUsername: username });
  }

  async function setJobDescription(description: string) {
    setJobDescriptionState(description);
    await storage.saveInputs({ jobDescription: description });
  }

  // Task actions
  async function toggleTaskCompletion(taskId: string) {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTasksState(updated);
    await storage.saveTasks(updated);
  }

  async function addTask(taskData: Omit<CareerTask, "id" | "createdAt">) {
    const newTask: CareerTask = {
      ...taskData,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setTasksState(updated);
    await storage.saveTasks(updated);
  }

  async function deleteTask(taskId: string) {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasksState(updated);
    await storage.saveTasks(updated);
  }

  // Project actions
  async function addProject(projectData: Omit<ProjectItem, "id" | "createdAt">) {
    const newProj: ProjectItem = {
      ...projectData,
      id: `proj_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newProj, ...projects];
    setProjectsState(updated);
    await storage.saveProjects(updated);
  }

  async function updateProject(id: string, updates: Partial<ProjectItem>) {
    const updated = projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProjectsState(updated);
    await storage.saveProjects(updated);
  }

  async function deleteProject(id: string) {
    const updated = projects.filter((p) => p.id !== id);
    setProjectsState(updated);
    await storage.saveProjects(updated);
  }

  // AI Result Caching & Task Generation
  async function setResult(newResult: OrchestratorOutput | null) {
    setResultState(newResult);
    await storage.saveAnalysisResult(newResult);
  }

  async function processAiResult(aiResult: OrchestratorOutput) {
    await setResult(aiResult);
    // Extract new tasks from AI recommendation
    const mergedTasks = convertAiRecommendationsToTasks(aiResult, tasks);
    setTasksState(mergedTasks);
    await storage.saveTasks(mergedTasks);
  }

  function addChatMessage(message: ChatMessage) {
    setChatMessages((prev) => [...prev, message]);
  }

  async function resetAll() {
    setUserProfileState(DEFAULT_USER_PROFILE);
    setResumeTextState("");
    setResumeFileNameState("");
    setGithubUsernameState("");
    setJobDescriptionState("");
    setResultState(null);
    setTasksState([]);
    setProjectsState([]);
    setChatMessages([]);
    await storage.clearAll();
  }

  function buildProfileText(): string {
    const parts: string[] = [];
    if (userProfile.name) parts.push(`Name: ${userProfile.name}`);
    if (userProfile.targetRole) parts.push(`Target Role: ${userProfile.targetRole}`);
    if (userProfile.experienceLevel) parts.push(`Experience Level: ${userProfile.experienceLevel}`);
    if (userProfile.skills) parts.push(`Skills: ${userProfile.skills}`);
    if (userProfile.careerGoal) parts.push(`Career Goal: ${userProfile.careerGoal}`);
    if (userProfile.careerObjective) parts.push(`Career Objective: ${userProfile.careerObjective}`);
    return parts.join("\n");
  }

  // Calculate percentage
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercentage =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Backwards compatible profile object
  const profile: CareerProfile = {
    name: userProfile.name,
    currentRole: userProfile.targetRole,
    experienceLevel: userProfile.experienceLevel,
    skills: userProfile.skills,
    careerGoal: userProfile.careerGoal,
  };

  function setProfile(p: CareerProfile) {
    updateUserProfile({
      name: p.name,
      targetRole: p.currentRole,
      experienceLevel: p.experienceLevel,
      skills: p.skills,
      careerGoal: p.careerGoal,
    });
  }

  const value: CareerContextValue = {
    userProfile,
    updateUserProfile,
    completeOnboarding,
    profile,
    setProfile,
    resumeText,
    setResumeText,
    resumeFileName,
    setResumeFileName,
    githubUsername,
    setGithubUsername,
    jobDescription,
    setJobDescription,
    tasks,
    toggleTaskCompletion,
    addTask,
    deleteTask,
    progressPercentage,
    projects,
    addProject,
    updateProject,
    deleteProject,
    result,
    setResult,
    processAiResult,
    chatMessages,
    addChatMessage,
    isLoaded,
    resetAll,
    buildProfileText,
  };

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer(): CareerContextValue {
  const ctx = useContext(CareerContext);
  if (!ctx) {
    throw new Error("useCareer must be used within a <CareerProvider>");
  }
  return ctx;
}
