"""
CareerPilot Backend — Milestone 1

This is the entrypoint for the FastAPI server. Right now it does one thing:
expose a /health endpoint so the mobile app has something real to call.

Later milestones will add:
- /career-profile   (Milestone 3)
- /resume/analyze    (Milestone 4)
- /github/analyze    (Milestone 5)
- /job-match         (Milestone 6)
- /orchestrate       (Milestone 7)
- /coach/chat        (Milestone 9)
"""
import logging
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from agent_runner import run_career_agent

logging.basicConfig(level=logging.INFO)
logger=logging.getLogger("careerpilot")

# FastAPI application instance / creates server obj
# Everything we build (routes, middleware) attaches to this "app" object.
app = FastAPI(title="CareerPilot API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Basic root route, useful for a quick sanity check in a browser."""
    return {"message": "CareerPilot API is running"}

@app.get("/health")
def health_check():
    """
    The mobile app calls this on the Analysis Loading / Welcome screen
    later to confirm the backend is reachable before doing anything else.
    """
    return {"status": "ok", "service": "careerpilot-backend"}

class AnalyzeRequest(BaseModel):
    """Shape of the JSON body the mobile app sends to POST /analyze."""
    profile: str = Field(
        ...,
        description="The user's career profile text to analyze",
        examples=[
            "I'm a Computer Science student with experience in "
            "React Native, JavaScript, Python and Figma."
        ],
    )

class AnalyzeResponse(BaseModel):
    """Shape of the JSON we send back to the mobile app."""
    analysis: str

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_career(request: AnalyzeRequest):
    """
    Runs the user's career profile through the existing career_agent
    and returns its analysis.
    """
    profile = request.profile.strip()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile text is required")

    try:
        analysis = await run_career_agent(profile)
    except RuntimeError as error:
        logger.error("career_agent returned no response: %s", error)
        raise HTTPException(
            status_code=502,
            detail="The career agent did not return a response. Please try again.",
        )
    except Exception as error:
        # Catches anything from the ADK/Gemini layer: bad API key, rate
        # limits, network errors, etc. We log the real error for
        # ourselves but never leak it (or the API key) to the client.
        logger.exception("Unexpected error while running career_agent")
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while analyzing your profile. Please try again.",
        )

    return AnalyzeResponse(analysis=analysis)   