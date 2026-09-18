"""
CareerPilot — Orchestrator output schema (Milestone 9)

Defines the exact shape orchestrator_agent must return: a single,
flat synthesis across whichever specialists actually ran, not a
container of the raw specialist schemas. Every "section" field is
genuinely optional (None when that specialist wasn't relevant/run) so
the mobile UI can render only the cards that apply — see
UnifiedAssessment.tsx's conditional rendering.

job_match_score keeps the exact same 0-100 constraint as JobOutput.
"""

from pydantic import BaseModel, Field


class OrchestratorOutput(BaseModel):
    career_direction: str | None = Field(
        default=None,
        description=(
            "Overall career direction/role fit, synthesized from career_specialist "
            "and/or resume_specialist if either ran. None if neither ran."
        ),
    )
    strengths: list[str] = Field(
        default_factory=list,
        description="Key strengths across whichever specialists actually ran. Empty if none did.",
    )
    skill_gaps: list[str] = Field(
        default_factory=list,
        description="Key skill gaps across whichever specialists actually ran. Empty if none did.",
    )
    job_match_score: int | None = Field(
        default=None,
        ge=0,
        le=100,
        description=(
            "job_specialist's match_score, unchanged. None if job_specialist did not run "
            "(e.g. no job description was provided)."
        ),
    )
    job_match_summary: str | None = Field(
        default=None,
        description="Brief summary of the job match finding. None if job_specialist did not run.",
    )
    github_summary: str | None = Field(
        default=None,
        description="Brief summary of the GitHub portfolio finding. None if github_specialist did not run.",
    )
    resume_summary: str | None = Field(
        default=None,
        description="Brief summary of the resume finding. None if resume_specialist did not run.",
    )
    recommendations: list[str] = Field(
        default_factory=list,
        description="Combined, de-duplicated actionable recommendations across all specialists that ran.",
    )
    final_verdict: str = Field(
        description=(
            "Always present. A concise overall synthesis of everything analyzed this turn. "
            "If only one specialist ran, this simply summarizes that one finding."
        )
    )