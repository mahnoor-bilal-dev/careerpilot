"""
CareerPilot — orchestrator_agent (Milestone 7B, structured output added in Milestone 9)

Coordinates the four specialist agents using ADK's native single-turn
sub-agent mechanism (the current recommended replacement for AgentTool,
per this installed ADK version's own source comments).

MILESTONE 9 ADDITION: output_schema=OrchestratorOutput.
Verified via direct source inspection of google-adk==2.7.1 before adding
this: gemini-3.6-flash's declared capabilities report
output_schema_and_tools=False, so ADK's _OutputSchemaRequestProcessor
transparently injects a hidden set_model_response tool alongside our
four specialist tools and instructs the model to call it with the final
structured answer — the exact same mechanism already proven for
github_agent back in Milestone 7A (that agent also combines a real tool
with output_schema). This is generic: it operates on agent.tools at
request time, regardless of whether those tools came from an explicit
tools=[...] list or from sub_agents auto-conversion, so having
sub_agents here doesn't block output_schema at all.

Also verified: when a single-turn specialist sub-agent's own turn
finishes, ADK's node execution layer (BaseNode.run in
workflow/_base_node.py) validates that specialist's raw model output
against ITS OWN output_schema and converts it to a plain dict via
model_validate(data).model_dump() BEFORE returning it as the tool
result. This means orchestrator_agent's underlying model literally
receives already-structured, already-validated data from each
specialist call — never raw prose. We do not, and should not, do any
additional parsing of specialist results ourselves anywhere in this
file or in agent_runner.py.

IMPORTANT DESIGN NOTE (unchanged from Milestone 7B):
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
from schemas.orchestrator_schema import OrchestratorOutput


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
    model="gemini-3.5-flash",
    description=(
        "Coordinates CareerPilot's specialist agents (career, resume, "
        "GitHub, job matching) to answer a user's career-related request, "
        "calling only the specialists relevant to what was asked, and "
        "synthesizing their structured results into one combined result."
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
        "4. Wait for each specialist's structured result — you will "
        "receive real structured data back from each tool call, not "
        "prose. Use those actual values directly; never invent or "
        "guess at what a specialist would have said.\n"
        "5. Synthesize whatever specialists you actually called into "
        "your final structured output, following these rules for each field:\n"
        "   - career_direction: fill this in if career_specialist or "
        "resume_specialist ran. Leave it null if neither ran.\n"
        "   - strengths / skill_gaps: combine relevant points from "
        "whichever specialists ran. Leave empty if none ran.\n"
        "   - job_match_score / job_match_summary: fill these in ONLY "
        "if job_specialist ran, using its actual match_score and a "
        "brief summary of its findings. Leave both null if it didn't run.\n"
        "   - github_summary: fill this in ONLY if github_specialist "
        "ran, briefly summarizing its actual findings. Leave null if "
        "it didn't run.\n"
        "   - resume_summary: fill this in ONLY if resume_specialist "
        "ran, briefly summarizing its actual findings. Leave null if "
        "it didn't run.\n"
        "   - recommendations: combine and de-duplicate the actual "
        "recommendations from whichever specialists ran.\n"
        "   - final_verdict: ALWAYS fill this in — a concise overall "
        "synthesis of everything you actually found this turn. If "
        "only one specialist ran, this simply summarizes that one "
        "finding.\n\n"
        "If the user's message doesn't give you enough information for a "
        "specialist you'd otherwise want to call (e.g. no GitHub username "
        "was mentioned), simply skip that specialist and leave its "
        "corresponding output field(s) null/empty rather than guessing "
        "or inventing input for it.\n\n"
        "Never fabricate a specialist's findings yourself — every value "
        "you put in a field about skills, repos, or match scores must "
        "come from an actual specialist result you received this turn."
    ),
    sub_agents=[_career_tool_agent, _resume_tool_agent, _github_tool_agent, _job_tool_agent],
    output_schema=OrchestratorOutput,
)