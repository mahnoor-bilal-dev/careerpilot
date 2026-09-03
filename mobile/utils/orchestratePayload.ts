/**
 * CareerPilot Mobile — Unified assessment payload logic (Milestone 8)
 *
 * Pure functions, no React/React Native imports. Kept separate from
 * the UI component specifically so this logic can be unit tested
 * directly with plain Node, without needing a full RN test renderer.
 */

import { OrchestrateInput } from "../api/orchestrateApi";

export interface UnifiedAssessmentInputs {
  profileText: string;
  resumeText: string;
  githubUsername: string;
  jobDescription: string;
}

/**
 * Returns true if at least one input has real (non-whitespace) content.
 * Used to enable/disable the primary "Analyze My Career" CTA.
 */
export function hasAnyInput(inputs: UnifiedAssessmentInputs): boolean {
  return (
    inputs.profileText.trim().length > 0 ||
    inputs.resumeText.trim().length > 0 ||
    inputs.githubUsername.trim().length > 0 ||
    inputs.jobDescription.trim().length > 0
  );
}

/**
 * Builds the exact JSON body to send to POST /orchestrate: only fields
 * with real content are included at all (omitted, not sent as empty
 * strings), so the backend's "at least one provided" validation and
 * the orchestrator's own specialist-selection logic both see a clean,
 * minimal payload.
 *
 * This function deliberately contains NO logic about which AI agents
 * should run — it only decides which fields have content worth
 * sending. Which specialists actually get invoked is entirely the
 * backend orchestrator's decision.
 */
export function buildOrchestratePayload(
  inputs: UnifiedAssessmentInputs
): OrchestrateInput {
  const payload: OrchestrateInput = {};

  const profile = inputs.profileText.trim();
  const resumeText = inputs.resumeText.trim();
  const githubUsername = inputs.githubUsername.trim();
  const jobDescription = inputs.jobDescription.trim();

  if (profile) payload.profile = profile;
  if (resumeText) payload.resume_text = resumeText;
  if (githubUsername) payload.github_username = githubUsername;
  if (jobDescription) payload.job_description = jobDescription;

  return payload;
}