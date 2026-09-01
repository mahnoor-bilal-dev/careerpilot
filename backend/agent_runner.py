"""
CareerPilot — Agent Runner (Milestone 3, extended through Milestone 7A)

This wraps the same Runner/SessionService pattern proven in test_agent.py
into reusable async functions. FastAPI calls these functions instead of
re-implementing the Runner setup inline inside main.py.

Milestone 7A change: each agent now has an output_schema, so the final
event's text is a JSON string conforming to that schema rather than free
prose. _run_agent itself is UNCHANGED — it still just returns that raw
text. The new _parse_structured() step, added on top, is where we
convert that JSON text into a validated Pydantic object, using Pydantic's
own model_validate_json rather than any manual/regex parsing.
"""

import uuid

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel, ValidationError

from agents.career_agent import root_agent as career_root_agent
from agents.resume_agent import root_agent as resume_root_agent
from agents.github_agent import root_agent as github_root_agent
from agents.job_agent import root_agent as job_root_agent

from schemas.career_schema import CareerOutput
from schemas.resume_schema import ResumeOutput
from schemas.github_schema import GitHubOutput
from schemas.job_schema import JobOutput

APP_NAME = "careerpilot_api"

_session_service = InMemorySessionService()


async def _run_agent(agent: Agent, input_text: str, agent_label: str) -> str:
    """
    Shared execution logic: create a fresh session, run `agent` against
    `input_text`, and return its final text response.

    UNCHANGED from Milestone 6 — this function has no idea whether the
    agent has a schema or not. It just returns whatever text the model's
    final event contains. Structured parsing happens one layer up, in
    _parse_structured().
    """
    user_id = "api_user"
    session_id = str(uuid.uuid4())

    await _session_service.create_session(
        app_name=APP_NAME, user_id=user_id, session_id=session_id
    )

    runner = Runner(
        agent=agent,
        app_name=APP_NAME,
        session_service=_session_service,
    )

    user_message = types.Content(role="user", parts=[types.Part(text=input_text)])

    final_response = None
    async for event in runner.run_async(
        user_id=user_id, session_id=session_id, new_message=user_message
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_response = event.content.parts[0].text

    if not final_response:
        raise RuntimeError(f"{agent_label} completed but returned no text response")

    return final_response


def _parse_structured(
    raw_text: str, schema_cls: type[BaseModel], agent_label: str
) -> BaseModel:
    """
    Validates and parses `raw_text` (expected to be JSON matching
    `schema_cls`) into a real Pydantic object.

    This is the "controlled parsing" the milestone calls for: we rely on
    Pydantic's own model_validate_json, which either returns a fully
    validated object or raises — we never manually scan/regex the text
    ourselves.
    """
    try:
        return schema_cls.model_validate_json(raw_text)
    except ValidationError as error:
        raise ValueError(
            f"{agent_label} returned output that didn't match the expected "
            f"structure: {error}"
        ) from error


async def run_career_agent(profile: str) -> CareerOutput:
    raw_text = await _run_agent(career_root_agent, profile, "career_agent")
    return _parse_structured(raw_text, CareerOutput, "career_agent")


async def run_resume_agent(resume_text: str) -> ResumeOutput:
    raw_text = await _run_agent(resume_root_agent, resume_text, "resume_agent")
    return _parse_structured(raw_text, ResumeOutput, "resume_agent")


async def run_github_agent(username: str) -> GitHubOutput:
    raw_text = await _run_agent(github_root_agent, username, "github_agent")
    return _parse_structured(raw_text, GitHubOutput, "github_agent")


async def run_job_agent(profile: str, job_description: str) -> JobOutput:
    combined_input = (
        f"CAREER PROFILE:\n{profile}\n\n"
        f"JOB DESCRIPTION:\n{job_description}"
    )
    raw_text = await _run_agent(job_root_agent, combined_input, "job_agent")
    return _parse_structured(raw_text, JobOutput, "job_agent")