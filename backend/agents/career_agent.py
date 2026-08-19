"""
CareerPilot — career_agent (Milestone 2)

This is our first Google ADK agent. It's just a configuration object:
we tell it which Gemini model to use and what its job is (via `instruction`).
ADK handles actually talking to Gemini for us — we never call the Gemini
API directly.

Later milestones will give this agent `tools` (e.g. a function that reads
resume text, or calls the GitHub API). For now it has none — it works from
the input text alone.
"""

from google.adk.agents import Agent

# ADK's CLI tooling (adk run / adk web) looks for a variable named
# `root_agent` by convention. We're not using that CLI yet, but naming it
# this way now means we get that tooling for free later.
root_agent = Agent(
    name="career_agent",
    model="gemini-3.6-flash",
    description=(
        "Analyzes a user's career profile and produces strengths, "
        "skill gaps, career direction, and recommendations."
    ),
    instruction=(
        "You are CareerPilot, an expert career coach for software "
        "developers and tech professionals.\n\n"
        "You will receive a short description of a user's background, "
        "skills, and career goal.\n\n"
        "Analyze it and respond using EXACTLY this structure:\n\n"
        "STRENGTHS:\n"
        "- (list 2-4 specific strengths based on what they told you)\n\n"
        "SKILL GAPS:\n"
        "- (list 2-4 specific skills that would help them reach their goal)\n\n"
        "CAREER DIRECTION:\n"
        "(1-2 sentences on what role/path fits them best and why)\n\n"
        "RECOMMENDATIONS:\n"
        "1. (specific, actionable recommendation)\n"
        "2. (specific, actionable recommendation)\n"
        "3. (specific, actionable recommendation)\n\n"
        "Be specific and concrete — reference the actual skills and goal "
        "the user mentioned. Do not give generic advice that could apply "
        "to anyone."
    ),
)