/**
 * CareerPilot Mobile — Career API client (Milestone 3)
 *
 * Wraps the POST /analyze call so App.tsx doesn't need to know about
 * fetch(), JSON shapes, or error-body parsing directly.
 */

import {API_BASE_URL} from '../config';

interface AnalyzeSuccessBody{
    analysis: string;
}

interface AnalyzeErrorBody{
    detail?: string;
}

/**
 * Sends a career profile to the backend and returns the AI-generated
 * analysis text. Throws an Error with a readable message on failure —
 * the caller (App.tsx) is responsible for catching it and updating the UI.
 */

export async function analyzeCareer(profile: string): Promise<string>{
    const response= await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile })
    });

    if(!response.ok){
        const errorBody: AnalyzeErrorBody | null = await response
      .json()
      .catch(() => null);
    const message =
      errorBody?.detail ?? `Request failed with status ${response.status}`;
    throw new Error(message);
    }

    const data: AnalyzeSuccessBody = await response.json();
    return data.analysis;
}   