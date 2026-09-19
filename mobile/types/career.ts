/**
 * CareerPilot Mobile — Core Data Types
 * Defines data shapes for user profile, onboarding, tasks, projects, roadmap stages, and local state.
 */

import { OrchestratorOutput } from "../api/orchestrateApi";

export type TargetRole =
  | "Frontend Developer"
  | "Mobile Developer"
  | "Full Stack Developer"
  | "UI/UX Designer"
  | "Graphic Designer"
  | "Data Analyst"
  | "AI/ML Engineer"
  | "Software Engineer"
  | string;

export type CareerObjective =
  | "Get an internship"
  | "Get my first job"
  | "Improve my portfolio"
  | "Switch career"
  | "Prepare for master's"
  | "Become job-ready"
  | string;

export interface UserProfile {
  name: string;
  targetRole: TargetRole;
  careerObjective: CareerObjective;
  experienceLevel: "Beginner" | "Intermediate" | "Student" | "Career Switcher" | string;
  skills: string;
  careerGoal: string;
  onboardingCompleted: boolean;
}

export type TaskCategory = "skills" | "github" | "resume" | "portfolio" | "job";
export type TaskPriority = "high" | "medium" | "low";
export type RoadmapStageId = "foundation" | "development" | "portfolio" | "job_ready";

export interface CareerTask {
  id: string;
  title: string;
  description: string;
  estimatedTime: string; // e.g. "20 min", "45 min"
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  roadmapStage: RoadmapStageId;
  createdAt: string;
}

export type ProjectStatus = "idea" | "in_progress" | "completed";

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  techStack: string;
  status: ProjectStatus;
  githubUrl?: string;
  demoUrl?: string;
  aiFeedback?: string;
  createdAt: string;
}

export interface RoadmapStage {
  id: RoadmapStageId;
  title: string;
  subtitle: string;
  icon: string;
  order: number;
}
