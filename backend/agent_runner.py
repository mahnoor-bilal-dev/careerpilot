"""
CareerPilot — Agent Runner (Milestone 3, extended through Milestone 9)

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

import asyncio
import logging
import re
import uuid

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel, ValidationError

logger = logging.getLogger("careerpilot")

from agents.career_agent import root_agent as career_root_agent
from agents.resume_agent import root_agent as resume_root_agent
from agents.github_agent import root_agent as github_root_agent
from agents.job_agent import root_agent as job_root_agent
from agents.orchestrator_agent import root_agent as orchestrator_root_agent

from schemas.career_schema import CareerOutput
from schemas.resume_schema import ResumeOutput
from schemas.github_schema import GitHubOutput
from schemas.job_schema import JobOutput
from schemas.orchestrator_schema import OrchestratorOutput

APP_NAME = "careerpilot_api"

_session_service = InMemorySessionService()


def _extract_retry_delay(exc_str: str) -> float | None:
    """Extracts requested retry delay from Gemini rate limit error messages."""
    m = re.search(r"retry in (\d+(?:\.\d+)?)s", exc_str, re.IGNORECASE)
    if m:
        return float(m.group(1)) + 1.0
    m2 = re.search(r"retryDelay': '(\d+)s'", exc_str, re.IGNORECASE)
    if m2:
        return float(m2.group(1)) + 1.0
    return None


async def _run_agent(agent: Agent, input_text: str, agent_label: str) -> str:
    """
    Shared execution logic: create a fresh session, run `agent` against
    `input_text`, and return its final text response. Includes retry logic
    with backoff and smart delay parsing for 429 rate limits & 503 spikes.
    """
    max_retries = 4
    last_exception = None

    for attempt in range(1, max_retries + 1):
        try:
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

        except Exception as exc:
            last_exception = exc
            exc_str = str(exc)
            exc_type = type(exc).__name__

            is_transient = any(
                k in exc_str or k in exc_type
                for k in [
                    "503",
                    "429",
                    "UNAVAILABLE",
                    "RESOURCE_EXHAUSTED",
                    "ResourceExhausted",
                    "overloaded",
                    "Quota",
                    "Rate limit",
                ]
            )

            if is_transient:
                extracted_delay = _extract_retry_delay(exc_str)
                sleep_sec = extracted_delay if extracted_delay is not None else (attempt * 5)
                logger.warning(
                    "%s hit rate-limit/transient Gemini error on attempt %d/%d (%s). Waiting %.1fs before retry...",
                    agent_label,
                    attempt,
                    max_retries,
                    exc_str,
                    sleep_sec,
                )
                if attempt < max_retries:
                    await asyncio.sleep(sleep_sec)
                    continue
            # For non-transient errors, re-raise immediately
            raise exc

    if last_exception:
        raise last_exception


def _parse_structured(
    raw_text: str, schema_cls: type[BaseModel], agent_label: str
) -> BaseModel:
    """
    Validates and parses `raw_text` (expected to be JSON matching
    `schema_cls`) into a real Pydantic object. Strips markdown fences
    if present.
    """
    cleaned_text = raw_text.strip()

    # Strip ```json ... ``` code blocks if the model wrapped its output
    if cleaned_text.startswith("```"):
        lines = cleaned_text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned_text = "\n".join(lines).strip()

    try:
        return schema_cls.model_validate_json(cleaned_text)
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


async def run_orchestrator_agent(user_request: str) -> OrchestratorOutput:
    """
    Sends a free-form request to orchestrator_agent, which decides for
    itself which specialist(s) to call (via its single-turn sub-agent
    tools), gathers their structured results, and synthesizes a final
    OrchestratorOutput.

    MILESTONE 9 CHANGE: this now returns a validated OrchestratorOutput
    object instead of plain text, using the exact same _parse_structured
    helper (and therefore the exact same Pydantic model_validate_json
    approach) already established in Milestone 7A for the four
    specialist functions above — no second/different parsing mechanism
    was introduced.

    `user_request` should include whatever context is actually available
    (profile text, resume text, GitHub username, job description) — the
    orchestrator's own instruction tells it how to route each piece to
    the right specialist tool, and to leave the corresponding output
    fields null/empty for specialists it lacks input for rather than
    guessing.
    """
    raw_text = await _run_agent(orchestrator_root_agent, user_request, "orchestrator_agent")
    return _parse_structured(raw_text, OrchestratorOutput, "orchestrator_agent")