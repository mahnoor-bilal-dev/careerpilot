/**
 * CareerPilot Mobile — Job Matching API client (Milestone 6)
 *
 * Wraps the POST /analyze-job call. Same pattern as the other API
 * clients — plain JSON, no file upload involved.
 */

import { API_BASE_URL } from "../config";

interface AnalyzeJobSuccessBody {
  analysis: string;
}

interface AnalyzeJobErrorBody {
  detail?: string | { msg?: string }[];
}

export async function analyzeJob(
  profile: string,
  jobDescription: string
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/analyze-job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, job_description: jobDescription }),
  });

  if (!response.ok) {
    const errorBody: AnalyzeJobErrorBody | null = await response
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

  const data: AnalyzeJobSuccessBody = await response.json();
  return data.analysis;
}