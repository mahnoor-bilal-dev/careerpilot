/**
 * CareerPilot Mobile — Resume API client (Milestone 4, extended Milestone 8)
 *
 * Wraps the POST /analyze-resume multipart upload so App.tsx doesn't
 * need to know about FormData shapes or error-body parsing directly.
 */

import { API_BASE_URL } from "../config";

export interface PickedResumeFile {
  uri: string;
  name: string;
  mimeType?: string;
}

interface AnalyzeResumeSuccessBody {
  analysis: string;
}

interface AnalyzeResumeErrorBody {
  detail?: string | { msg?: string }[];
}

/**
 * Uploads a picked PDF file to the backend and returns the AI-generated
 * resume analysis text. Throws an Error with a readable message on
 * failure — the caller (App.tsx) is responsible for catching it.
 */
export async function analyzeResume(file: PickedResumeFile): Promise<string> {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? "application/pdf",
  } as unknown as Blob);

  const response = await fetch(`${API_BASE_URL}/analyze-resume`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody: AnalyzeResumeErrorBody | null = await response
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

  const data: AnalyzeResumeSuccessBody = await response.json();
  return data.analysis;
}

interface ExtractResumeTextSuccessBody {
  resume_text: string;
}

interface ExtractResumeTextErrorBody {
  detail?: string | { msg?: string }[];
}

/**
 * Milestone 8: uploads a picked PDF and returns just the raw extracted
 * text, WITHOUT running resume_agent. This is what the unified
 * assessment flow uses to obtain resume_text for POST /orchestrate —
 * analyzeResume() above returns an analysis, not the raw text, so it
 * can't be reused for that purpose.
 */
export async function extractResumeText(file: PickedResumeFile): Promise<string> {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? "application/pdf",
  } as unknown as Blob);

  const response = await fetch(`${API_BASE_URL}/extract-resume-text`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody: ExtractResumeTextErrorBody | null = await response
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

  const data: ExtractResumeTextSuccessBody = await response.json();
  return data.resume_text;
}