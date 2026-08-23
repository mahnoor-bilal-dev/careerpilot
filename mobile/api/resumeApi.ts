/**
 * CareerPilot Mobile — Resume API client (Milestone 4)
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