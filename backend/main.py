"""
CareerPilot Backend — Milestone 4

Adds POST /analyze-resume, which accepts a PDF upload, extracts its text,
and runs it through resume_agent. GET /, GET /health, and POST /analyze
are unchanged from Milestones 1 and 3.
"""

import logging
import re

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agent_runner import run_career_agent, run_resume_agent, run_github_agent
from pdf_utils import extract_text_from_pdf

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("careerpilot")

app = FastAPI(title="CareerPilot API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "CareerPilot API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "careerpilot-backend"}


class AnalyzeRequest(BaseModel):
    profile: str = Field(..., description="The user's career profile text to analyze.")


class AnalyzeResponse(BaseModel):
    analysis: str


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_career(request: AnalyzeRequest):
    profile = request.profile.strip()

    if not profile:
        raise HTTPException(status_code=400, detail="Profile text cannot be empty.")

    try:
        analysis = await run_career_agent(profile)
    except RuntimeError as error:
        logger.error("career_agent returned no response: %s", error)
        raise HTTPException(status_code=502, detail="The career agent did not return a response. Please try again.")
    except Exception:
        logger.exception("Unexpected error while running career_agent")
        raise HTTPException(status_code=500, detail="Something went wrong while analyzing your profile. Please try again.")

    return AnalyzeResponse(analysis=analysis)


class ResumeAnalyzeResponse(BaseModel):
    analysis: str


MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@app.post("/analyze-resume", response_model=ResumeAnalyzeResponse)
async def analyze_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported. Please upload a PDF resume.")

    pdf_bytes = await file.read()

    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if len(pdf_bytes) > MAX_RESUME_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="The uploaded file is too large. Please upload a PDF under 5MB.")

    try:
        resume_text = extract_text_from_pdf(pdf_bytes)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    try:
        analysis = await run_resume_agent(resume_text)
    except RuntimeError as error:
        logger.error("resume_agent returned no response: %s", error)
        raise HTTPException(status_code=502, detail="The resume agent did not return a response. Please try again.")
    except Exception:
        logger.exception("Unexpected error while running resume_agent")
        raise HTTPException(status_code=500, detail="Something went wrong while analyzing your resume. Please try again.")

    return ResumeAnalyzeResponse(analysis=analysis)

class GitHubAnalyzeRequest(BaseModel):
    """Shape of the JSON body the mobile app sends to POST /analyze-github."""

    username: str = Field(
        ...,
        min_length=1,
        max_length=39,  # GitHub's own max username length
        description="A public GitHub username (not a URL).",
        examples=["octocat"],
    )


class GitHubAnalyzeResponse(BaseModel):
    """Shape of the JSON we send back from POST /analyze-github."""

    analysis: str


# GitHub usernames may only contain alphanumeric characters and single
# hyphens, and can't start/end with a hyphen. This rejects obviously
# invalid input (e.g. a pasted URL or an empty-ish string) before we
# ever spend an agent/API call on it.
_GITHUB_USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$")


@app.post("/analyze-github", response_model=GitHubAnalyzeResponse)
async def analyze_github(request: GitHubAnalyzeRequest):
    """
    Runs a GitHub username through github_agent, which uses its
    get_github_profile tool to retrieve real data before analyzing it.
    Mirrors the same validate -> run agent -> handle errors pattern as
    the other two analyze endpoints.
    """
    username = request.username.strip().lstrip("@")

    if not username:
        raise HTTPException(status_code=400, detail="GitHub username cannot be empty.")

    if not _GITHUB_USERNAME_PATTERN.match(username):
        raise HTTPException(
            status_code=400,
            detail="That doesn't look like a valid GitHub username. "
            "Please enter just the username, not a URL.",
        )

    try:
        analysis = await run_github_agent(username)
    except RuntimeError as error:
        logger.error("github_agent returned no response: %s", error)
        raise HTTPException(
            status_code=502,
            detail="The GitHub agent did not return a response. Please try again.",
        )
    except Exception:
        # Covers ADK/Gemini-layer failures. Note: GitHub-specific issues
        # (user not found, rate limited) are NOT exceptions — the tool
        # returns those as a normal {"status": "error", ...} dict, and
        # github_agent's instruction tells it to explain them in its
        # own response rather than raising. This except only catches
        # genuine backend failures.
        logger.exception("Unexpected error while running github_agent")
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while analyzing this GitHub profile. Please try again.",
        )

    return GitHubAnalyzeResponse(analysis=analysis)