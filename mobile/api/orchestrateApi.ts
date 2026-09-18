/**
 * CareerPilot Mobile — Orchestrator API client (Milestone 8, structured Milestone 9)
 *
 * Wraps the POST /orchestrate call. As of Milestone 9, the backend
 * returns a structured JSON object matching OrchestratorOutput directly
 * (no more {"analysis": "..."} wrapper) — this file defines the exact
 * matching TypeScript shape and returns it as-is. We do NOT parse any
 * AI-generated text on the frontend — every field here comes straight
 * from the backend's already-validated Pydantic model.
 *
 * IMPORTANT: /orchestrate can genuinely take much longer than the other
 * endpoints — the orchestrator may call several specialist agents in
 * sequence (each its own real Gemini round trip, plus a GitHub API call
 * if github_specialist runs), so a single request can legitimately take
 * 20-60+ seconds when multiple fields are filled in. This is normal,
 * not a bug. We set a generous client-side timeout via AbortController
 * so the app fails cleanly with a clear message instead of appearing to
 * hang forever if something genuinely does get stuck.
 */

import { API_BASE_URL } from "../config";

export interface OrchestrateInput {
  profile?: string;
  resume_text?: string;
  github_username?: string;
  job_description?: string;
}

/**
 * Matches backend/schemas/orchestrator_schema.py's OrchestratorOutput
 * exactly, field for field. Every field except final_verdict is
 * genuinely optional — null/undefined means that specialist didn't run
 * for this request, not "the AI forgot to fill it in".
 */
export interface OrchestratorOutput {
  career_direction: string | null;
  strengths: string[];
  skill_gaps: string[];
  job_match_score: number | null;
  job_match_summary: string | null;
  github_summary: string | null;
  resume_summary: string | null;
  recommendations: string[];
  final_verdict: string;
}

interface OrchestrateErrorBody {
  detail?: string | { msg?: string }[];
}

const ORCHESTRATE_TIMEOUT_MS = 120_000; // 120 seconds (2 minutes)

export async function analyzeCareerUnified(
  input: OrchestrateInput
): Promise<OrchestratorOutput> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ORCHESTRATE_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/orchestrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
  } catch (error) {
    const errStr = String(error);
    if (
      (error instanceof Error && error.name === "AbortError") ||
      errStr.includes("CanceledException") ||
      errStr.includes("canceled")
    ) {
      throw new Error(
        "The analysis took longer than expected. Please try again."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

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

  const data: OrchestratorOutput = await response.json();
  return data;
}