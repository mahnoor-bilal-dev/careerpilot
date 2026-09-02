"""
CareerPilot — /orchestrate endpoint plumbing tests (Milestone 7B continued)

These tests verify FastAPI-level plumbing: validation, routing, and
that the correctly-labeled user_request string reaches the orchestrator
— NOT that Gemini produces a correct analysis (that requires a real
API key and network access, which test_orchestrator.py exercises
separately, live).

We mock agent_runner.run_orchestrator_agent at the exact boundary main.py
calls it, using unittest.mock. This is legitimate for testing our own
endpoint code (validation, request construction, routing, error
mapping) without needing network access — it is NOT used to fabricate
what looks like a genuine Gemini analysis. The mock always returns an
obviously-fake placeholder string, never realistic-looking output.

Run with: python test_orchestrate_endpoint.py
"""

import os
from unittest.mock import AsyncMock, patch

os.environ.setdefault("GEMINI_API_KEY", "fake-test-key-for-endpoint-tests")

from fastapi.testclient import TestClient

import main

client = TestClient(main.app)

FAKE_ANALYSIS = "MOCKED-ORCHESTRATOR-OUTPUT-NOT-REAL-GEMINI-CONTENT"


def check(label, condition):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}")
    if not condition:
        raise SystemExit(1)


# --- 1. Resume-only request reaches /orchestrate ---
with patch("main.run_orchestrator_agent", new=AsyncMock(return_value=FAKE_ANALYSIS)) as mock_run:
    response = client.post("/orchestrate", json={"resume_text": "Experienced Python developer."})
    check("Resume-only request returns 200", response.status_code == 200)
    check("Resume-only response contains analysis field", response.json().get("analysis") == FAKE_ANALYSIS)
    sent_request = mock_run.call_args.args[0]
    check("Resume-only user_request labeled correctly", "RESUME TEXT:" in sent_request)
    check("Resume-only user_request excludes other sections", "GITHUB USERNAME:" not in sent_request and "JOB DESCRIPTION:" not in sent_request)

# --- 2. GitHub-only request reaches /orchestrate ---
with patch("main.run_orchestrator_agent", new=AsyncMock(return_value=FAKE_ANALYSIS)) as mock_run:
    response = client.post("/orchestrate", json={"github_username": "octocat"})
    check("GitHub-only request returns 200", response.status_code == 200)
    sent_request = mock_run.call_args.args[0]
    check("GitHub-only user_request labeled correctly", "GITHUB USERNAME:\noctocat" in sent_request)
    check("GitHub-only user_request excludes other sections", "RESUME TEXT:" not in sent_request)

# --- 3. Job-matching request reaches /orchestrate ---
with patch("main.run_orchestrator_agent", new=AsyncMock(return_value=FAKE_ANALYSIS)) as mock_run:
    response = client.post(
        "/orchestrate",
        json={
            "profile": "I know React and Python.",
            "job_description": "Looking for a React developer.",
        },
    )
    check("Job-matching request returns 200", response.status_code == 200)
    sent_request = mock_run.call_args.args[0]
    check("Job-matching user_request includes CAREER PROFILE", "CAREER PROFILE:" in sent_request)
    check("Job-matching user_request includes JOB DESCRIPTION", "JOB DESCRIPTION:" in sent_request)
    check("Job-matching user_request excludes GitHub/resume", "GITHUB USERNAME:" not in sent_request and "RESUME TEXT:" not in sent_request)

# --- 4. Full assessment (profile + resume + GitHub + job) reaches /orchestrate ---
with patch("main.run_orchestrator_agent", new=AsyncMock(return_value=FAKE_ANALYSIS)) as mock_run:
    response = client.post(
        "/orchestrate",
        json={
            "profile": "I know React and Python.",
            "resume_text": "Built several mobile apps.",
            "github_username": "octocat",
            "job_description": "Looking for a React developer.",
        },
    )
    check("Full assessment request returns 200", response.status_code == 200)
    sent_request = mock_run.call_args.args[0]
    check("Full assessment includes all four labeled sections", all(
        label in sent_request
        for label in ["CAREER PROFILE:", "RESUME TEXT:", "GITHUB USERNAME:", "JOB DESCRIPTION:"]
    ))

# --- 5. Empty request is rejected ---
response = client.post("/orchestrate", json={})
check("Fully empty request returns 400", response.status_code == 400)

response = client.post("/orchestrate", json={"profile": "   ", "job_description": ""})
check("Whitespace-only fields correctly treated as empty (400)", response.status_code == 400)

response = client.post("/orchestrate", json={"github_username": "has spaces"})
check("Invalid GitHub username in /orchestrate rejected (400)", response.status_code == 400)

response = client.post("/orchestrate", json={"github_username": "https://github.com/octocat"})
check("Pasted GitHub URL in /orchestrate rejected (400)", response.status_code == 400)

# --- 6. Existing specialist endpoints still import and validate correctly ---
check("GET / still works", client.get("/").status_code == 200)
check("GET /health still works", client.get("/health").status_code == 200)

response = client.post("/analyze", json={"profile": ""})
check("POST /analyze still rejects empty profile (400)", response.status_code == 400)

response = client.post("/analyze-github", json={"username": "has spaces"})
check("POST /analyze-github still rejects invalid username (400)", response.status_code == 400)

response = client.post("/analyze-job", json={"profile": "", "job_description": ""})
check("POST /analyze-job still rejects empty fields (422)", response.status_code == 422)

route_paths = sorted(
    r.path for r in main.app.routes
    if hasattr(r, "path") and r.path.startswith(("/analyze", "/orchestrate", "/health")) or r.path == "/"
)
expected_paths = sorted([
    "/", "/health", "/analyze", "/analyze-resume", "/analyze-github", "/analyze-job", "/orchestrate"
])
check("Route list matches exactly what's expected", route_paths == expected_paths)

print("\nALL ORCHESTRATE ENDPOINT TESTS PASSED")