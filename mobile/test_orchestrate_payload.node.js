// Milestone 8 — logic tests for orchestratePayload.ts, run via plain
// Node against the compiled JS (no React Native rendering needed since
// these are pure functions with zero RN imports).
//
// IMPORTANT: this file requires the COMPILED JavaScript version of
// utils/orchestratePayload.ts and api/orchestrateApi.ts, not the .ts
// files directly — plain Node can't run TypeScript on its own. See the
// "How to run" note below.
const { hasAnyInput, buildOrchestratePayload } = require("./dist/utils/orchestratePayload.js");

let failures = 0;
function check(label, condition) {
  console.log(`[${condition ? "PASS" : "FAIL"}] ${label}`);
  if (!condition) failures++;
}

const empty = { profileText: "", resumeText: "", githubUsername: "", jobDescription: "" };
const whitespaceOnly = { profileText: "   ", resumeText: "\n", githubUsername: " ", jobDescription: "\t" };
const profileOnly = { ...empty, profileText: "I know React" };
const githubOnly = { ...empty, githubUsername: "octocat" };
const jobMatch = { ...empty, profileText: "I know React", jobDescription: "Need a React dev" };
const fullAssessment = {
  profileText: "I know React",
  resumeText: "Built mobile apps",
  githubUsername: "octocat",
  jobDescription: "Need a React dev",
};

// --- Empty submission ---
check("hasAnyInput(empty) is false", hasAnyInput(empty) === false);
check("hasAnyInput(whitespace-only) is false", hasAnyInput(whitespaceOnly) === false);
check("buildOrchestratePayload(empty) produces empty object", Object.keys(buildOrchestratePayload(empty)).length === 0);

// --- Profile only ---
check("hasAnyInput(profileOnly) is true", hasAnyInput(profileOnly) === true);
const p1 = buildOrchestratePayload(profileOnly);
check("Profile-only payload has ONLY profile field", Object.keys(p1).join(",") === "profile");
check("Profile-only payload value correct", p1.profile === "I know React");

// --- GitHub only ---
const p2 = buildOrchestratePayload(githubOnly);
check("GitHub-only payload has ONLY github_username field", Object.keys(p2).join(",") === "github_username");
check("GitHub-only payload value correct", p2.github_username === "octocat");

// --- Job matching (profile + job description) ---
const p3 = buildOrchestratePayload(jobMatch);
check("Job-match payload has exactly profile + job_description", Object.keys(p3).sort().join(",") === "job_description,profile");

// --- Full assessment (all four) ---
const p4 = buildOrchestratePayload(fullAssessment);
check("Full assessment payload has all four fields", Object.keys(p4).sort().join(",") === "github_username,job_description,profile,resume_text");
check("Full assessment field values are correct and trimmed", 
  p4.profile === "I know React" &&
  p4.resume_text === "Built mobile apps" &&
  p4.github_username === "octocat" &&
  p4.job_description === "Need a React dev"
);

// --- Whitespace trimming ---
const untrimmed = { ...empty, profileText: "  I know React  " };
check("Payload values are trimmed", buildOrchestratePayload(untrimmed).profile === "I know React");

if (failures > 0) {
  console.log(`\n${failures} TEST(S) FAILED`);
  process.exit(1);
}
console.log("\nALL PAYLOAD LOGIC TESTS PASSED");