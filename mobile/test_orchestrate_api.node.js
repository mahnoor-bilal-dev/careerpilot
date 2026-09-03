// Milestone 8 — tests for orchestrateApi.ts's success/error parsing,
// using a mocked global.fetch (no real network call, no fake Gemini
// content — the mock only ever returns an obviously-fake placeholder).
global.fetch = async (url, options) => {
  const scenario = global.__TEST_SCENARIO__;
  if (scenario === "success") {
    return {
      ok: true,
      status: 200,
      json: async () => ({ analysis: "MOCKED-ANALYSIS-NOT-REAL-GEMINI-OUTPUT" }),
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
  // --- Successful response ---
  global.__TEST_SCENARIO__ = "success";
  const result = await analyzeCareerUnified({ profile: "test" });
  check("Successful response returns analysis text", result === "MOCKED-ANALYSIS-NOT-REAL-GEMINI-OUTPUT");

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