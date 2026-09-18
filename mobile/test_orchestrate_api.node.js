// Milestone 8 (updated Milestone 9) — tests for orchestrateApi.ts's
// structured response parsing, using a mocked global.fetch (no real
// network call, no fake Gemini content — mocked responses use
// obviously-fake placeholder values, never realistic-looking output).
global.fetch = async (url, options) => {
  const scenario = global.__TEST_SCENARIO__;

  if (scenario === "full-structured-success") {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        career_direction: "UI/UX + Frontend Development",
        strengths: ["UI design", "React"],
        skill_gaps: ["Advanced React"],
        job_match_score: 78,
        job_match_summary: "Strong alignment with the role.",
        github_summary: "Active contributor with well-documented repos.",
        resume_summary: "Solid resume with quantified achievements.",
        recommendations: ["Build a TypeScript project", "Add unit tests"],
        final_verdict: "A strong candidate for this role overall.",
      }),
    };
  }

  if (scenario === "github-only-conditional-fields") {
    // Matches what the backend actually returns for a GitHub-only
    // request: only github_summary is set, everything else is
    // null/empty per OrchestratorOutput's defaults.
    return {
      ok: true,
      status: 200,
      json: async () => ({
        career_direction: null,
        strengths: ["Consistent activity"],
        skill_gaps: [],
        job_match_score: null,
        job_match_summary: null,
        github_summary: "Active contributor with 12 public repos.",
        resume_summary: null,
        recommendations: ["Add topics to repos missing them"],
        final_verdict: "Solid GitHub presence; no other information was provided.",
      }),
    };
  }

  if (scenario === "error-string-detail") {
    return {
      ok: false,
      status: 400,
      json: async () => ({ detail: "Please provide at least one field." }),
    };
  }

  if (scenario === "error-array-detail") {
    return {
      ok: false,
      status: 422,
      json: async () => ({ detail: [{ msg: "Field required" }] }),
    };
  }

  if (scenario === "network-failure") {
    throw new Error("Network request failed");
  }

  throw new Error("Unknown test scenario: " + scenario);
};

const { analyzeCareerUnified } = require("./dist/api/orchestrateApi.js");

let failures = 0;
function check(label, condition) {
  console.log(`[${condition ? "PASS" : "FAIL"}] ${label}`);
  if (!condition) failures++;
}

async function main() {
  // --- Structured API response parsing (full assessment) ---
  global.__TEST_SCENARIO__ = "full-structured-success";
  const fullResult = await analyzeCareerUnified({ profile: "test", job_description: "test" });
  check("Full response is a structured object, not a string", typeof fullResult === "object");
  check("Full response has correct career_direction", fullResult.career_direction === "UI/UX + Frontend Development");

  // --- Job score preserved correctly ---
  check("Job match score preserved correctly", fullResult.job_match_score === 78);

  // --- Recommendations list preserved correctly ---
  check(
    "Recommendations list preserved correctly",
    Array.isArray(fullResult.recommendations) &&
      fullResult.recommendations.length === 2 &&
      fullResult.recommendations[0] === "Build a TypeScript project"
  );

  // --- Conditional fields (GitHub-only scenario) ---
  global.__TEST_SCENARIO__ = "github-only-conditional-fields";
  const githubOnlyResult = await analyzeCareerUnified({ github_username: "octocat" });
  check("GitHub-only response has career_direction=null", githubOnlyResult.career_direction === null);
  check("GitHub-only response has job_match_score=null", githubOnlyResult.job_match_score === null);
  check("GitHub-only response has job_match_summary=null", githubOnlyResult.job_match_summary === null);
  check("GitHub-only response has resume_summary=null", githubOnlyResult.resume_summary === null);
  check("GitHub-only response has real github_summary", githubOnlyResult.github_summary === "Active contributor with 12 public repos.");
  check("GitHub-only response has empty skill_gaps array", Array.isArray(githubOnlyResult.skill_gaps) && githubOnlyResult.skill_gaps.length === 0);
  check("GitHub-only response always has final_verdict", typeof githubOnlyResult.final_verdict === "string" && githubOnlyResult.final_verdict.length > 0);

  // --- API error with string detail ---
  global.__TEST_SCENARIO__ = "error-string-detail";
  try {
    await analyzeCareerUnified({});
    check("String-detail error throws", false);
  } catch (error) {
    check("String-detail error throws with correct message", error.message === "Please provide at least one field.");
  }

  // --- API error with array detail (FastAPI validation error shape) ---
  global.__TEST_SCENARIO__ = "error-array-detail";
  try {
    await analyzeCareerUnified({});
    check("Array-detail error throws", false);
  } catch (error) {
    check("Array-detail error throws with correct message", error.message === "Field required");
  }

  // --- Network failure ---
  global.__TEST_SCENARIO__ = "network-failure";
  try {
    await analyzeCareerUnified({ profile: "test" });
    check("Network failure throws", false);
  } catch (error) {
    check("Network failure throws an Error", error instanceof Error);
  }

  if (failures > 0) {
    console.log(`\n${failures} TEST(S) FAILED`);
    process.exit(1);
  }
  console.log("\nALL ORCHESTRATE API TESTS PASSED");
}

main();