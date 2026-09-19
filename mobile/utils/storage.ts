/**
 * CareerPilot Mobile — Local Persistence Utility
 * Uses AsyncStorage for persistent offline-first state management.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile, CareerTask, ProjectItem } from "../types/career";
import { OrchestratorOutput } from "../api/orchestrateApi";

const KEYS = {
  PROFILE: "@careerpilot_profile",
  TASKS: "@careerpilot_tasks",
  PROJECTS: "@careerpilot_projects",
  ANALYSIS_CACHE: "@careerpilot_analysis_cache",
  RESUME_TEXT: "@careerpilot_resume_text",
  RESUME_FILENAME: "@careerpilot_resume_filename",
  GITHUB_USERNAME: "@careerpilot_github_username",
  JOB_DESCRIPTION: "@careerpilot_job_description",
};

export const storage = {
  // ── Profile ───────────────────────────────────────────
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  },

  async loadProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load profile:", e);
      return null;
    }
  },

  // ── Tasks ─────────────────────────────────────────────
  async saveTasks(tasks: CareerTask[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error("Failed to save tasks:", e);
    }
  },

  async loadTasks(): Promise<CareerTask[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load tasks:", e);
      return [];
    }
  },

  // ── Projects ──────────────────────────────────────────
  async saveProjects(projects: ProjectItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error("Failed to save projects:", e);
    }
  },

  async loadProjects(): Promise<ProjectItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load projects:", e);
      return [];
    }
  },

  // ── Analysis Cache ─────────────────────────────────────
  async saveAnalysisResult(result: OrchestratorOutput | null): Promise<void> {
    try {
      if (!result) {
        await AsyncStorage.removeItem(KEYS.ANALYSIS_CACHE);
      } else {
        await AsyncStorage.setItem(KEYS.ANALYSIS_CACHE, JSON.stringify(result));
      }
    } catch (e) {
      console.error("Failed to save analysis result:", e);
    }
  },

  async loadAnalysisResult(): Promise<OrchestratorOutput | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.ANALYSIS_CACHE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load analysis result:", e);
      return null;
    }
  },

  // ── Input Fields ───────────────────────────────────────
  async saveInputs(inputs: {
    resumeText?: string;
    resumeFileName?: string;
    githubUsername?: string;
    jobDescription?: string;
  }): Promise<void> {
    try {
      if (inputs.resumeText !== undefined) {
        await AsyncStorage.setItem(KEYS.RESUME_TEXT, inputs.resumeText);
      }
      if (inputs.resumeFileName !== undefined) {
        await AsyncStorage.setItem(KEYS.RESUME_FILENAME, inputs.resumeFileName);
      }
      if (inputs.githubUsername !== undefined) {
        await AsyncStorage.setItem(KEYS.GITHUB_USERNAME, inputs.githubUsername);
      }
      if (inputs.jobDescription !== undefined) {
        await AsyncStorage.setItem(KEYS.JOB_DESCRIPTION, inputs.jobDescription);
      }
    } catch (e) {
      console.error("Failed to save inputs:", e);
    }
  },

  async loadInputs() {
    try {
      const [resumeText, resumeFileName, githubUsername, jobDescription] = await Promise.all([
        AsyncStorage.getItem(KEYS.RESUME_TEXT),
        AsyncStorage.getItem(KEYS.RESUME_FILENAME),
        AsyncStorage.getItem(KEYS.GITHUB_USERNAME),
        AsyncStorage.getItem(KEYS.JOB_DESCRIPTION),
      ]);
      return {
        resumeText: resumeText || "",
        resumeFileName: resumeFileName || "",
        githubUsername: githubUsername || "",
        jobDescription: jobDescription || "",
      };
    } catch (e) {
      console.error("Failed to load inputs:", e);
      return { resumeText: "", resumeFileName: "", githubUsername: "", jobDescription: "" };
    }
  },

  // ── Reset ─────────────────────────────────────────────
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error("Failed to clear storage:", e);
    }
  },
};
