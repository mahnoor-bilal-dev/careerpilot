"""
CareerPilot — Milestone 7A schema tests

Verifies the four Pydantic schemas and the controlled JSON parsing in
agent_runner._parse_structured, WITHOUT requiring a live Gemini call.
We construct realistic JSON strings by hand (the same shape Gemini
would actually produce, since output_schema forces exactly this
shape) and validate the parsing/rejection logic against them.

Run with: python test_schemas.py
"""

import json

from pydantic import ValidationError

from schemas.career_schema import CareerOutput
from schemas.resume_schema import ResumeOutput
from schemas.github_schema import GitHubOutput
from schemas.job_schema import JobOutput
from agent_runner import _parse_structured


def check(label, condition):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}")
    if not condition:
        raise SystemExit(1)


# --- 1. Valid Career output conforms to schema ---
career_json = json.dumps({
    "strengths": ["Strong React Native experience", "Good UI/UX sense"],
    "skill_gaps": ["TypeScript", "Testing"],
    "career_direction": "Well suited for a junior mobile developer role.",
    "recommendations": ["Build a TypeScript project", "Add unit tests to an existing repo"],
})
career_result = _parse_structured(career_json, CareerOutput, "career_agent")
check("Career output parses into CareerOutput", isinstance(career_result, CareerOutput))
check("Career strengths preserved", career_result.strengths == ["Strong React Native experience", "Good UI/UX sense"])
check("Career to_display_text() produces text", "STRENGTHS:" in career_result.to_display_text())

# --- 2. Valid Resume output conforms to schema ---
resume_json = json.dumps({
    "professional_summary": "A junior developer with mobile app experience.",
    "technical_skills": ["React Native", "Python"],
    "soft_skills": ["Teamwork"],
    "education": ["BS Computer Science, State University"],
    "experience": ["2 years building mobile apps"],
    "projects": ["CareerPilot"],
    "strengths": ["Diverse tech stack"],
    "weaknesses": ["No quantified achievements"],
    "recommendations": ["Add metrics to experience bullets"],
})
resume_result = _parse_structured(resume_json, ResumeOutput, "resume_agent")
check("Resume output parses into ResumeOutput", isinstance(resume_result, ResumeOutput))
check("Resume to_display_text() produces text", "PROFESSIONAL SUMMARY:" in resume_result.to_display_text())

# --- 3. Valid GitHub output conforms to schema ---
github_json = json.dumps({
    "profile": {
        "username": "octocat",
        "name": "The Octocat",
        "bio": "GitHub mascot",
        "public_repos": 8,
        "followers": 100,
    },
    "repositories": [
        {
            "name": "Hello-World",
            "description": "My first repo",
            "language": "Python",
            "stars": 42,
            "forks": 5,
            "url": "https://github.com/octocat/Hello-World",
        }
    ],
    "technologies": ["Python"],
    "strengths": ["Consistent activity"],
    "weaknesses": ["Few original projects"],
    "documentation_issues": [],
    "recommendations": ["Add topics to repositories"],
})
github_result = _parse_structured(github_json, GitHubOutput, "github_agent")
check("GitHub output parses into GitHubOutput", isinstance(github_result, GitHubOutput))
check("GitHub nested profile parses correctly", github_result.profile.username == "octocat")
check("GitHub nested repositories parse correctly", github_result.repositories[0].stars == 42)
check("GitHub to_display_text() produces text", "PROFILE OVERVIEW:" in github_result.to_display_text())

# --- 4. Valid Job output conforms to schema ---
job_json = json.dumps({
    "match_score": 72,
    "strong_matches": ["React"],
    "partial_matches": ["Vue experience related to React requirement"],
    "skill_gaps": ["Docker experience is not demonstrated in the provided profile."],
    "experience_match": "2 years of relevant frontend experience.",
    "missing_requirements": ["5+ years experience"],
    "recommendations": ["Learn Docker basics", "Build a project using CI/CD", "Contribute to an open source React project"],
    "final_verdict": "A reasonable but not perfect fit for this role.",
})
job_result = _parse_structured(job_json, JobOutput, "job_agent")
check("Job output parses into JobOutput", isinstance(job_result, JobOutput))
check("Job match_score preserved", job_result.match_score == 72)
check("Job to_display_text() produces text", "JOB MATCH SCORE:" in job_result.to_display_text())

# --- 5. Job match score cannot fall outside 0-100 ---
score_too_high = json.dumps({**json.loads(job_json), "match_score": 150})
try:
    _parse_structured(score_too_high, JobOutput, "job_agent")
    check("match_score=150 correctly rejected", False)
except ValueError as error:
    check("match_score=150 correctly rejected", "didn't match the expected structure" in str(error))

score_negative = json.dumps({**json.loads(job_json), "match_score": -5})
try:
    _parse_structured(score_negative, JobOutput, "job_agent")
    check("match_score=-5 correctly rejected", False)
except ValueError:
    check("match_score=-5 correctly rejected", True)

# Also confirm this holds true when constructing the model directly,
# not just through our parsing wrapper — proves the constraint lives on
# the schema itself (Field(ge=0, le=100)), not something we bolted on
# only in _parse_structured.
try:
    JobOutput(**{**json.loads(job_json), "match_score": 101})
    check("Direct construction with match_score=101 rejected", False)
except ValidationError:
    check("Direct construction with match_score=101 rejected", True)

# --- 6. Invalid structured output is rejected cleanly ---
malformed_json = "{ this is not valid json"
try:
    _parse_structured(malformed_json, CareerOutput, "career_agent")
    check("Malformed JSON correctly rejected", False)
except ValueError:
    check("Malformed JSON correctly rejected", True)

missing_required_field = json.dumps({
    "strengths": ["React"],
    # skill_gaps intentionally missing
    "career_direction": "Frontend development.",
    "recommendations": ["Learn TypeScript"],
})
try:
    _parse_structured(missing_required_field, CareerOutput, "career_agent")
    check("Missing required field correctly rejected", False)
except ValueError:
    check("Missing required field correctly rejected", True)

wrong_type = json.dumps({
    "strengths": "this should be a list, not a string",
    "skill_gaps": [],
    "career_direction": "Frontend development.",
    "recommendations": [],
})
try:
    _parse_structured(wrong_type, CareerOutput, "career_agent")
    check("Wrong field type correctly rejected", False)
except ValueError:
    check("Wrong field type correctly rejected", True)

print("\nALL SCHEMA TESTS PASSED")