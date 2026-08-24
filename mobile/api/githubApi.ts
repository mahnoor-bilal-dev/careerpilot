/**
 * CareerPilot Mobile — GitHub API client (Milestone 5)
 *
 * Wraps the POST /analyze-github call. Same pattern as careerApi.ts —
 * this is plain JSON, not a file upload, so no FormData needed here.
 */

import { API_BASE_URL } from "../config";

interface AnalyzeGitHubSuccessBody {
  analysis: string;
}

interface AnalyzeGitHubErrorBody {
  detail?: string | { msg?: string }[];
}

export async function analyzeGitHub(username: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/analyze-github`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const errorBody: AnalyzeGitHubErrorBody | null = await response
      .json()
      .catch(() => null);

    let message = `Request failed with status ${response.status}`;
    if (typeof errorBody?.detail === "string") {
      message = errorBody.detail;
    } else if (Array.isArray(errorBody?.detail) && errorBody.detail[0]?.msg) {
      message = errorBody.detail[0].msg as string;
    }
    throw new Error(message);
  }

  const data: AnalyzeGitHubSuccessBody = await response.json();
  return data.analysis;
}