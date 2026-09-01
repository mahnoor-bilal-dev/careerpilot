"""
CareerPilot Backend — through Milestone 7A

GET /              (Milestone 1)
GET /health        (Milestone 1)
POST /analyze          (Milestone 3, structured internally since 7A)
POST /analyze-resume   (Milestone 4, structured internally since 7A)
POST /analyze-github   (Milestone 5, structured internally since 7A)
POST /analyze-job      (Milestone 6, structured internally since 7A)
"""

import logging
import re

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agent_runner import run_career_agent, run_resume_agent, run_github_agent, run_job_agent
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
        result = await run_career_agent(profile)
    except RuntimeError as error:
        logger.error("career_agent returned no response: %s", error)
        raise HTTPException(status_code=502, detail="The career agent did not return a response. Please try again.")
    except ValueError as error:
        logger.error("career_agent returned invalid structured output: %s", error)
        raise HTTPException(status_code=502, detail="The career agent returned an unexpected response. Please try again.")
    except Exception:
        logger.exception("Unexpected error while running career_agent")
        raise HTTPException(status_code=500, detail="Something went wrong while analyzing your profile. Please try again.")

    return AnalyzeResponse(analysis=result.to_display_text())


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
        result = await run_resume_agent(resume_text)
    except RuntimeError as error:
        logger.error("resume_agent returned no response: %s", error)
        raise HTTPException(status_code=502, detail="The resume agent did not return a response. Please try again.")
    except ValueError as error:
        logger.error("resume_agent returned invalid structured output: %s", error)
        raise HTTPException(status_code=502, detail="The resume agent returned an unexpected response. Please try again.")
    except Exception:
        logger.exception("Unexpected error while running resume_agent")
        raise HTTPException(status_code=500, detail="Something went wrong while analyzing your resume. Please try again.")

    return ResumeAnalyzeResponse(analysis=result.to_display_text())


class GitHubAnalyzeRequest(BaseModel):
    username: str = Field(
        ...,
        min_length=1,
        max_length=39,
        description="A public GitHub username (not a URL).",
        examples=["octocat"],
    )


class GitHubAnalyzeResponse(BaseModel):
    analysis: str


_GITHUB_USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$")


@app.post("/analyze-github", response_model=GitHubAnalyzeResponse)
async def analyze_github(request: GitHubAnalyzeRequest):
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
        result = await run_github_agent(username)
    except RuntimeError as error:
        logger.error("github_agent returned no response: %s", error)
        raise HTTPException(status_code=502, detail="The GitHub agent did not return a response. Please try again.")
    except ValueError as error:
        logger.error("github_agent returned invalid structured output: %s", error)
        raise HTTPException(status_code=502, detail="The GitHub agent returned an unexpected response. Please try again.")
    except Exception:
        logger.exception("Unexpected error while running github_agent")
        raise HTTPException(status_code=500, detail="Something went wrong while analyzing this GitHub profile. Please try again.")

    return GitHubAnalyzeResponse(analysis=result.to_display_text())


class JobAnalyzeRequest(BaseModel):
    profile: str = Field(..., min_length=1, max_length=5000, description="The user's career profile text.")
    job_description: str = Field(..., min_length=1, max_length=10000, description="The full text of the target job description.")


class JobAnalyzeResponse(BaseModel):
    analysis: str


@app.post("/analyze-job", response_model=JobAnalyzeResponse)
async def analyze_job(request: JobAnalyzeRequest):
    profile = request.profile.strip()
    job_description = request.job_description.strip()

    if not profile:
        raise HTTPException(status_code=400, detail="Career profile cannot be empty.")

    if not job_description:
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    try:
        result = await run_job_agent(profile, job_description)
    except RuntimeError as error:
        logger.error("job_agent returned no response: %s", error)
        raise HTTPException(status_code=502, detail="The job matching agent did not return a response. Please try again.")
    except ValueError as error:
        logger.error("job_agent returned invalid structured output: %s", error)
        raise HTTPException(status_code=502, detail="The job matching agent returned an unexpected response. Please try again.")
    except Exception:
        logger.exception("Unexpected error while running job_agent")
        raise HTTPException(status_code=500, detail="Something went wrong while analyzing this job match. Please try again.")

    return JobAnalyzeResponse(analysis=result.to_display_text())