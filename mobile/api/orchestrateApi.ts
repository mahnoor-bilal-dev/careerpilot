/**
 * CareerPilot Mobile — Orchestrator API client (Milestone 8)
 *
 * Wraps the POST /orchestrate call. Same JSON pattern as careerApi.ts/
 * githubApi.ts/jobApi.ts — plain JSON body, no file upload here (the
 * resume PDF is handled separately via extractResumeText, which turns
 * it into plain text BEFORE this function is ever called).
 */

import { API_BASE_URL } from "../config";

export interface OrchestrateInput {
  profile?: string;
  resume_text?: string;
  github_username?: string;
  job_description?: string;
}

interface OrchestrateSuccessBody {
  analysis: string;
}

interface OrchestrateErrorBody {
  detail?: string | { msg?: string }[];
}

/**
 * Sends whichever inputs are available to the backend orchestrator and
 * returns its synthesized final analysis. The orchestrator itself
 * decides which specialist agents are relevant — this function does
 * not add any if/else routing logic of its own; it only forwards
 * whatever was provided.
 *
 * Throws an Error with a readable message on failure — the caller is
 * responsible for catching it and updating UI state.
 */
export async function analyzeCareerUnified(
  input: OrchestrateInput
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/orchestrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorBody: OrchestrateErrorBody | null = await response
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

  const data: OrchestrateSuccessBody = await response.json();
  return data.analysis;
}