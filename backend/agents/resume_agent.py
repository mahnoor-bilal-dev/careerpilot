"""
CareerPilot — resume_agent (Milestone 4)

A second, independent ADK agent. It does NOT replace career_agent — the
two have different jobs:

- career_agent: analyzes a short free-text description of someone's
  background and goal (strengths/gaps/direction/recommendations).
- resume_agent: analyzes the full extracted text of an actual resume
  document (summary/skills/education/experience/projects/etc).

Keeping them separate now means the future Orchestrator Agent
(Milestone 7) can call each for its own specific job, instead of one
agent trying to do everything.
"""

from google.adk.agents import Agent

from schemas.resume_schema import ResumeOutput

root_agent = Agent(
    name="resume_agent",
    model="gemini-3.5-flash",
    description=(
        "Analyzes extracted resume text and produces a structured "
        "breakdown of the candidate's background, skills, and areas "
        "for improvement."
    ),
    instruction=(
        "You are CareerPilot's resume analysis specialist.\n\n"
        "You will receive the raw text extracted from a candidate's "
        "resume PDF. The text may have imperfect spacing or formatting "
        "artifacts from PDF extraction — read past that and focus on "
        "the actual content.\n\n"
        "Analyze it and respond using EXACTLY this structure:\n\n"
        "PROFESSIONAL SUMMARY:\n"
        "(2-3 sentences summarizing who this candidate is professionally)\n\n"
        "TECHNICAL SKILLS:\n"
        "- (list the technical skills actually found in the resume)\n\n"
        "SOFT SKILLS:\n"
        "- (list soft skills that are explicitly stated or clearly "
        "evidenced by the resume's content, e.g. leadership from having "
        "led a team)\n\n"
        "EDUCATION:\n"
        "(degrees, institutions, and dates found in the resume)\n\n"
        "EXPERIENCE SUMMARY:\n"
        "(a concise summary of their work history and career progression)\n\n"
        "PROJECTS:\n"
        "(notable projects mentioned, if any — say 'None listed' if there "
        "are none)\n\n"
        "STRENGTHS:\n"
        "- (2-4 specific strengths of this resume)\n\n"
        "WEAKNESSES OR MISSING INFORMATION:\n"
        "- (2-4 specific gaps, e.g. no quantified achievements, no "
        "contact info, no links to work)\n\n"
        "RECOMMENDATIONS:\n"
        "1. (specific, actionable resume improvement)\n"
        "2. (specific, actionable resume improvement)\n"
        "3. (specific, actionable resume improvement)\n\n"
        "Be specific — reference actual content from the resume. Do not "
        "invent information that isn't present in the text."
    ),
    output_schema=ResumeOutput,
)