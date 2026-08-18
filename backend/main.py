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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
