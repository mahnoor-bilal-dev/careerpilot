"""
CareerPilot — orchestrator_agent (Milestone 7B)

Coordinates the four specialist agents using ADK's native single-turn
sub-agent mechanism (the current recommended replacement for AgentTool,
per this installed ADK version's own source comments).

IMPORTANT DESIGN NOTE:
We do NOT add career_agent.root_agent / resume_agent.root_agent / etc.
directly as sub_agents here. Doing so would set their .mode and
.parent_agent fields, mutating the exact same singleton objects that
agent_runner.py already uses directly for the existing standalone
endpoints (/analyze, /analyze-resume, /analyze-github, /analyze-job).
ADK raises an error if an agent that already has a parent is attached
to a second parent, and even without that, silently mutating shared
state used elsewhere is fragile.

Instead, we build separate "single_turn wrapper" Agent instances here,
one per specialist, that reuse (not retype) each specialist's real
model/instruction/output_schema/tools. This satisfies two rules from
the milestone at once: the existing specialist agent files are never
modified, and their instructions are never duplicated/copy-pasted —
we reference the same instruction string object directly from the
already-defined agent.
"""

from google.adk.agents import Agent

from agents.career_agent import root_agent as career_specialist
from agents.resume_agent import root_agent as resume_specialist
from agents.github_agent import root_agent as github_specialist
from agents.job_agent import root_agent as job_specialist


def _make_single_turn_wrapper(specialist: Agent, wrapper_name: str) -> Agent:
    """
    Builds a fresh Agent instance for orchestration, copying the real
    specialist's model/instruction/output_schema/tools by reference.
    This is intentionally a NEW object — see the module docstring for
    why we can't just reuse the specialist's own root_agent instance.
    """
    return Agent(
        name=wrapper_name,
        model=specialist.model,
        description=specialist.description,
        instruction=specialist.instruction,
        tools=list(specialist.tools),
        output_schema=specialist.output_schema,
        mode="single_turn",
    )


_career_tool_agent = _make_single_turn_wrapper(career_specialist, "career_specialist")
_resume_tool_agent = _make_single_turn_wrapper(resume_specialist, "resume_specialist")
_github_tool_agent = _make_single_turn_wrapper(github_specialist, "github_specialist")
_job_tool_agent = _make_single_turn_wrapper(job_specialist, "job_specialist")


root_agent = Agent(
    name="orchestrator_agent",
    model="gemini-3.6-flash",
    description=(
        "Coordinates CareerPilot's specialist agents (career, resume, "
        "GitHub, job matching) to answer a user's career-related request, "
        "calling only the specialists relevant to what was asked."
    ),
    instruction=(
        "You are the CareerPilot Orchestrator. You do not analyze "
        "anything yourself — that is each specialist's job, and you "
        "must not restate or duplicate their reasoning. Your job is to:\n\n"
        "1. Understand what the user is asking for.\n"
        "2. Decide which of your available specialist tools are "
        "actually relevant to that request. Do not call a specialist "
        "whose input isn't available or whose domain isn't relevant.\n"
        "3. Call each relevant specialist tool with the right input:\n"
        "   - career_specialist: pass the user's career profile text.\n"
        "   - resume_specialist: pass the extracted resume text, if provided.\n"
        "   - github_specialist: pass just the GitHub username, if provided.\n"
        "   - job_specialist: pass a single combined string formatted "
        "exactly as 'CAREER PROFILE:\\n<profile>\\n\\nJOB DESCRIPTION:\\n"
        "<job description>', only if both a profile and a job description "
        "are available.\n"
        "4. Wait for each specialist's structured result.\n"
        "5. Synthesize their results into one clear, well-organized final "
        "answer for the user. Reference specific findings from each "
        "specialist you called (e.g. cite the actual match score, actual "
        "skill gaps, actual repo names) rather than vague generalities.\n\n"
        "If the user's message doesn't give you enough information for a "
        "specialist you'd otherwise want to call (e.g. no GitHub username "
        "was mentioned), simply skip that specialist and say so briefly "
        "in your final answer rather than guessing or inventing input for it.\n\n"
        "Never fabricate a specialist's findings yourself — every claim "
        "in your final answer about skills, repos, or match scores must "
        "come from an actual specialist result you received this turn."
    ),
    sub_agents=[_career_tool_agent, _resume_tool_agent, _github_tool_agent, _job_tool_agent],
)