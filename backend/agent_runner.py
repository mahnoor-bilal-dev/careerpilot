"""
CareerPilot — Agent Runner (Milestone 3, extended in Milestone 4)

This wraps the same Runner/SessionService pattern proven in test_agent.py
into reusable async functions. FastAPI calls these functions instead of
re-implementing the Runner setup inline inside main.py.

Milestone 4 adds run_resume_agent alongside the existing run_career_agent,
sharing one internal helper so the ADK execution logic isn't duplicated.
Neither career_agent.py nor resume_agent.py change as a result.
"""

import uuid

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from agents.career_agent import root_agent as career_root_agent
from agents.resume_agent import root_agent as resume_root_agent
from agents.github_agent import root_agent as github_root_agent

APP_NAME = "careerpilot_api"

_session_service = InMemorySessionService()


async def _run_agent(agent: Agent, input_text: str, agent_label: str) -> str:
    """
    Shared execution logic: create a fresh session, run `agent` against
    `input_text`, and return its final text response. `agent_label` is
    only used to make error messages identify which agent failed.
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


async def run_career_agent(profile: str) -> str:
    return await _run_agent(career_root_agent, profile, "career_agent")


async def run_resume_agent(resume_text: str) -> str:
    return await _run_agent(resume_root_agent, resume_text, "resume_agent")

async def run_github_agent(username: str) -> str:
    """
    Sends a GitHub username to github_agent and returns its final text
    response. Unlike the other two agents, github_agent will actually
    call its get_github_profile tool internally before Gemini produces
    the final analysis — that happens automatically inside run_async,
    the same execution loop used by every other agent here.
    """
    return await _run_agent(github_root_agent, username, "github_agent")