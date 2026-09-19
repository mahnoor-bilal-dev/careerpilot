/**
 * CareerPilot Mobile — Task Generator Utility
 * Converts user target roles and AI recommendations into concrete, checkable tasks.
 */

import { CareerTask, TargetRole, UserProfile, RoadmapStageId } from "../types/career";
import { OrchestratorOutput } from "../api/orchestrateApi";

export function generateDefaultTasks(profile: UserProfile): CareerTask[] {
  const role = profile.targetRole.toLowerCase();
  const tasks: CareerTask[] = [
    // Foundation
    {
      id: "foundation_git",
      title: "Set up professional GitHub profile",
      description: "Add profile bio, avatar, and pin top 2 repositories.",
      estimatedTime: "15 min",
      category: "github",
      priority: "high",
      completed: false,
      roadmapStage: "foundation",
      createdAt: new Date().toISOString(),
    },
    {
      id: "foundation_resume",
      title: "Upload & review resume in CareerPilot",
      description: "Get AI feedback on resume structure and key achievements.",
      estimatedTime: "10 min",
      category: "resume",
      priority: "high",
      completed: false,
      roadmapStage: "foundation",
      createdAt: new Date().toISOString(),
    },
  ];

  // Development stage tasks based on role
  if (role.includes("mobile") || role.includes("react native")) {
    tasks.push(
      {
        id: "dev_mobile_1",
        title: "Build external API integration in React Native",
        description: "Fetch and display live data using REST API and loading states.",
        estimatedTime: "45 min",
        category: "skills",
        priority: "high",
        completed: false,
        roadmapStage: "development",
        createdAt: new Date().toISOString(),
      },
      {
        id: "dev_mobile_2",
        title: "Implement local state management (Redux/Zustand)",
        description: "Add persistent offline state to your mobile app project.",
        estimatedTime: "30 min",
        category: "skills",
        priority: "medium",
        completed: false,
        roadmapStage: "development",
        createdAt: new Date().toISOString(),
      }
    );
  } else if (role.includes("ui") || role.includes("ux") || role.includes("designer")) {
    tasks.push(
      {
        id: "dev_ui_1",
        title: "Create interactive Figma design system",
        description: "Define color tokens, typography scales, and core UI components.",
        estimatedTime: "45 min",
        category: "portfolio",
        priority: "high",
        completed: false,
        roadmapStage: "development",
        createdAt: new Date().toISOString(),
      },
      {
        id: "dev_ui_2",
        title: "Build mobile prototype with micro-interactions",
        description: "Create component transition states for mobile onboarding.",
        estimatedTime: "30 min",
        category: "portfolio",
        priority: "medium",
        completed: false,
        roadmapStage: "development",
        createdAt: new Date().toISOString(),
      }
    );
  } else {
    // General Frontend / Fullstack / Software Engineer
    tasks.push(
      {
        id: "dev_general_1",
        title: "Master TypeScript core concepts & interfaces",
        description: "Convert key components to strictly typed interfaces.",
        estimatedTime: "30 min",
        category: "skills",
        priority: "high",
        completed: false,
        roadmapStage: "development",
        createdAt: new Date().toISOString(),
      },
      {
        id: "dev_general_2",
        title: "Write unit tests for core API utilities",
        description: "Add test cases covering success, empty, and error responses.",
        estimatedTime: "25 min",
        category: "skills",
        priority: "medium",
        completed: false,
        roadmapStage: "development",
        createdAt: new Date().toISOString(),
      }
    );
  }

  // Portfolio stage
  tasks.push(
    {
      id: "port_readme",
      title: "Improve GitHub repository README documentation",
      description: "Add project screenshots, setup steps, and tech stack badges.",
      estimatedTime: "20 min",
      category: "github",
      priority: "high",
      completed: false,
      roadmapStage: "portfolio",
      createdAt: new Date().toISOString(),
    },
    {
      id: "port_case_study",
      title: "Write project architecture overview",
      description: "Document technical trade-offs and design decisions.",
      estimatedTime: "30 min",
      category: "portfolio",
      priority: "medium",
      completed: false,
      roadmapStage: "portfolio",
      createdAt: new Date().toISOString(),
    }
  );

  // Job Ready stage
  tasks.push(
    {
      id: "job_match_test",
      title: "Run CareerPilot Job Match analysis",
      description: "Paste target job description to evaluate skill gaps.",
      estimatedTime: "10 min",
      category: "job",
      priority: "high",
      completed: false,
      roadmapStage: "job_ready",
      createdAt: new Date().toISOString(),
    },
    {
      id: "job_prep_questions",
      title: "Practice 3 core technical interview questions",
      description: "Review system architecture and common framework questions.",
      estimatedTime: "20 min",
      category: "job",
      priority: "medium",
      completed: false,
      roadmapStage: "job_ready",
      createdAt: new Date().toISOString(),
    }
  );

  return tasks;
}

/**
 * Converts raw AI recommendation strings into structured actionable CareerTasks.
 */
export function convertAiRecommendationsToTasks(
  result: OrchestratorOutput,
  existingTasks: CareerTask[]
): CareerTask[] {
  const newTasks: CareerTask[] = [];
  const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase()));

  // Process recommendations
  (result.recommendations || []).forEach((rec, idx) => {
    // Truncate/clean title
    const title = rec.length > 55 ? rec.substring(0, 52) + "..." : rec;
    if (existingTitles.has(title.toLowerCase())) return;

    let category: CareerTask["category"] = "skills";
    let stage: RoadmapStageId = "development";

    const recLower = rec.toLowerCase();
    if (recLower.includes("github") || recLower.includes("readme") || recLower.includes("repo")) {
      category = "github";
      stage = "portfolio";
    } else if (recLower.includes("resume") || recLower.includes("cv")) {
      category = "resume";
      stage = "job_ready";
    } else if (recLower.includes("job") || recLower.includes("interview") || recLower.includes("apply")) {
      category = "job";
      stage = "job_ready";
    } else if (recLower.includes("project") || recLower.includes("portfolio")) {
      category = "portfolio";
      stage = "portfolio";
    }

    newTasks.push({
      id: `ai_rec_${Date.now()}_${idx}`,
      title,
      description: rec,
      estimatedTime: "25 min",
      category,
      priority: idx === 0 ? "high" : "medium",
      completed: false,
      roadmapStage: stage,
      createdAt: new Date().toISOString(),
    });
  });

  // Process skill gaps
  (result.skill_gaps || []).slice(0, 3).forEach((gap, idx) => {
    const title = `Bridge Gap: ${gap.length > 45 ? gap.substring(0, 42) + "..." : gap}`;
    if (existingTitles.has(title.toLowerCase())) return;

    newTasks.push({
      id: `ai_gap_${Date.now()}_${idx}`,
      title,
      description: `Targeted improvement for identified gap: ${gap}`,
      estimatedTime: "30 min",
      category: "skills",
      priority: "high",
      completed: false,
      roadmapStage: "development",
      createdAt: new Date().toISOString(),
    });
  });

  return [...newTasks, ...existingTasks];
}
