"""
CareerPilot — local agent test script (Milestone 2)

Purpose: prove the career_agent actually works, without touching FastAPI
or the mobile app yet. Run this directly:

    python test_agent.py

This is temporary scaffolding for learning ADK. Milestone 3 will expose
this same agent through a real FastAPI endpoint instead.
"""

import asyncio

from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from agents.career_agent import root_agent

# Load GEMINI_API_KEY (and anything else) from backend/.env into the
# environment. ADK's Gemini integration reads the key from the environment
# automatically — we never pass it around in our own code.
load_dotenv()

APP_NAME = "careerpilot_test"
USER_ID = "local_test_user"
SESSION_ID = "local_test_session"

# A sample career profile to run through the agent. Swap this out to try
# different inputs.
TEST_INPUT = (
    "I'm a Computer Science student with experience in React Native, "
    "JavaScript, Python and Figma. I want to become a mobile application "
    "developer."
)


async def main():
    # The SessionService tracks conversation state. We're using the
    # in-memory version, which forgets everything when the script exits —
    # fine for this test, not fine for production.
    session_service = InMemorySessionService()
    await session_service.create_session(
        app_name=APP_NAME, user_id=USER_ID, session_id=SESSION_ID
    )

    # The Runner is the engine: it wires the agent to the session service
    # and handles the actual call(s) to Gemini.
    runner = Runner(
        agent=root_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )

    # ADK expects user input wrapped as a Content object (this is the
    # same shape the Gemini API itself uses under the hood).
    user_message = types.Content(
        role="user", parts=[types.Part(text=TEST_INPUT)]
    )

    print("Sending input to career_agent...\n")
    print(f"INPUT:\n{TEST_INPUT}\n")
    print("-" * 60)

    # run_async streams a sequence of Events as the agent works. For a
    # single agent with no tools, there's typically just one final event
    # containing the full text response.
    final_response = None
    async for event in runner.run_async(
        user_id=USER_ID, session_id=SESSION_ID, new_message=user_message
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_response = event.content.parts[0].text

    print("CAREER ANALYSIS:\n")
    print(final_response or "(no response received)")


if __name__ == "__main__":
    asyncio.run(main())