"""
CareerPilot — Agent Runner (Milestone 3)

This wraps the same Runner/SessionService pattern proven in test_agent.py
into a single reusable async function. FastAPI calls this function instead
of re-implementing the Runner setup inline inside main.py.

Nothing about career_agent.py changes — this file only orchestrates it.
"""

import uuid

from google.adk.runners import Runner  
from google.adk.sessions import InMemorySessionService  
from google.genai import types

from agents.career_agent import root_agent

APP_NAME = "careerpilot_api"

# One shared session service for the life of the backend process.
# We're still in the "no database" phase (per Milestone 1's rules) —
# sessions live in memory and are forgotten on restart. That's fine here
# because each request below gets its own fresh, throwaway session anyway.
_session_service = InMemorySessionService()


async def run_career_agent(profile: str) -> str:
    """
    Sends `profile` text to the existing career_agent and returns its
    final text response.

    Raises:
        RuntimeError: if the agent completes but produces no usable text.
        Exception: whatever the ADK/Gemini layer itself raises (e.g. an
            API error) — we deliberately let this propagate so main.py's
            error handling can decide how to respond to the client.
    """
    user_id = "api_user"
    # A fresh session ID per request keeps requests from different users
    # (or different analyses from the same user) from bleeding into
    # each other's conversation history.
    session_id = str(uuid.uuid4())

    await _session_service.create_session(
        app_name=APP_NAME, user_id=user_id, session_id=session_id
    )

    runner = Runner(
        agent=root_agent,
        app_name=APP_NAME,
        session_service=_session_service,
    )

    user_message = types.Content(role="user", parts=[types.Part(text=profile)])

    final_response = None
    async for event in runner.run_async(
        user_id=user_id, session_id=session_id, new_message=user_message
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_response = event.content.parts[0].text

    if not final_response:
        raise RuntimeError("career_agent completed but returned no text response")

    return final_response