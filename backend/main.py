"""
CareerPilot Backend — Milestone 4

Adds POST /analyze-resume, which accepts a PDF upload, extracts its text,
and runs it through resume_agent. GET /, GET /health, and POST /analyze
are unchanged from Milestones 1 and 3.
"""

import logging

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agent_runner import run_career_agent, run_resume_agent
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