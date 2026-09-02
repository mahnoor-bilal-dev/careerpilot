"""
CareerPilot — orchestrator test script (Milestone 7B)

Standalone script to exercise orchestrator_agent directly, the same way
test_agent.py did for career_agent back in Milestone 2. Run with:

    python test_orchestrator.py
"""

import asyncio
from dotenv import load_dotenv

load_dotenv()

from agent_runner import run_orchestrator_agent

TEST_REQUEST = (
    "Here is my career profile: I'm a Computer Science student with "
    "experience in React Native, JavaScript, Python and Figma. I want "
    "to become a mobile application developer.\n\n"
    "Here is a job description I'm considering:\n"
    "We are looking for a Junior Frontend Developer with React, "
    "TypeScript, and REST API experience. Testing experience is a plus.\n\n"
    "Can you tell me how I match this job, and give me overall career advice?"
)


async def main():
    print("Sending request to orchestrator_agent...\n")
    print(f"REQUEST:\n{TEST_REQUEST}\n")
    print("-" * 60)

    result = await run_orchestrator_agent(TEST_REQUEST)

    print("ORCHESTRATOR FINAL ANSWER:\n")
    print(result)


if __name__ == "__main__":
    asyncio.run(main())