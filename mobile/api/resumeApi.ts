/**
 * CareerPilot Mobile — Resume API client (Milestone 4, extended Milestone 8)
 *
 * Wraps the POST /analyze-resume and POST /extract-resume-text multipart
 * uploads so callers don't need to know about FormData shapes or
 * error-body parsing directly.
 *
 * IMPORTANT (fixed after the Expo SDK 57 upgrade): newer React Native
 * versions changed how fetch/FormData validate file parts. The old
 * shorthand object { uri, name, type } appended directly to FormData
 * (which worked fine on RN 0.74 / Expo SDK 51) now throws "Unsupported
 * FormDataPart implementation" on RN's newer networking stack. The fix
 * is to fetch the local file:// URI ourselves first to get a real Blob,
 * then append that Blob — this is the current recommended approach and
 * works across RN versions, old and new.
 */

import { API_BASE_URL } from "../config";

export interface PickedResumeFile {
  uri: string;
  name: string;
  mimeType?: string;
}

/**
 * Converts a picked file's local URI into a real Blob by fetching it
 * (file:// URIs are readable via fetch on both iOS and Android). This
 * Blob is what actually gets appended to FormData — not the old
 * { uri, name, type } shorthand object, which newer RN versions reject.
 */
async function pickedFileToBlob(file: PickedResumeFile): Promise<Blob> {
  const response = await fetch(file.uri);
  const blob = await response.blob();

  // If blob type is generic or missing, set explicit mimeType if specified or inferred from .pdf extension
  const fallbackType =
    file.mimeType ||
    (file.name.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : "application/octet-stream");

  if (
    !blob.type ||
    blob.type === "application/octet-stream" ||
    blob.type === "content/unknown"
  ) {
    return new Blob([blob], { type: fallbackType });
  }

  return blob;
}

interface AnalyzeResumeSuccessBody {
  analysis: string;
}

interface AnalyzeResumeErrorBody {
  detail?: string | { msg?: string }[];
}

export async function analyzeResume(file: PickedResumeFile): Promise<string> {
  const blob = await pickedFileToBlob(file);
  const formData = new FormData();
  formData.append("file", blob, file.name);

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

export async function extractResumeText(file: PickedResumeFile): Promise<string> {
  const blob = await pickedFileToBlob(file);
  const formData = new FormData();
  formData.append("file", blob, file.name);

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