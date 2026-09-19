/**
 * CareerPilot Mobile — AI Career Coach Chat API Client
 * Contextual career Q&A using the orchestrator endpoint.
 */

import { API_BASE_URL } from "../config";
import { OrchestratorOutput } from "./orchestrateApi";

export interface ChatMessagePayload {
  message: string;
  context?: OrchestratorOutput | null;
  profileText?: string;
}

export async function sendChatMessage(payload: ChatMessagePayload): Promise<string> {
  const userRequest = payload.profileText
    ? `CAREER PROFILE:\n${payload.profileText}\n\nUSER QUESTION:\n${payload.message}`
    : `USER QUESTION:\n${payload.message}`;

  const response = await fetch(`${API_BASE_URL}/orchestrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile: userRequest }),
  });

  if (!response.ok) {
    throw new Error("Could not reach AI Career Coach. Please try again.");
  }

  const data: OrchestratorOutput = await response.json();
  return (
    data.final_verdict ||
    data.career_direction ||
    "I have analyzed your request. Focus on building strong portfolio projects and mastering core fundamentals."
  );
}
