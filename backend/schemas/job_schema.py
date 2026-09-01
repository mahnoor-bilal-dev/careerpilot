"""
CareerPilot — Job match output schema (Milestone 7A)

Defines the exact shape job_agent must return. match_score is
constrained to 0-100 at the schema level via Field(ge=0, le=100) —
Pydantic itself rejects anything outside that range when validating,
regardless of what the model tries to produce.
"""

from pydantic import BaseModel, Field


class JobOutput(BaseModel):
    match_score: int = Field(
        ge=0,
        le=100,
        description=(
            "Approximate estimated match percentage (0-100), based only "
            "on evidence in the supplied profile. Not a precise measurement."
        ),
    )
    strong_matches: list[str] = Field(
        description="Requirements the profile clearly and explicitly satisfies."
    )
    partial_matches: list[str] = Field(
        description="Requirements where the profile shows related but incomplete experience."
    )
    skill_gaps: list[str] = Field(
        description=(
            "Important requirements not demonstrated in the profile. Phrase each as "
            "'not demonstrated', never as a confirmed lack of the skill."
        )
    )
    experience_match: str = Field(
        description="How the candidate's overall experience relates to what this role needs."
    )
    missing_requirements: list[str] = Field(
        description="Specific must-have requirements not shown anywhere in the profile."
    )
    recommendations: list[str] = Field(
        description="3-5 specific, actionable steps to improve fit for this role."
    )
    final_verdict: str = Field(
        description="2-3 sentence honest, concise overall assessment of fit for this job."
    )

    def to_display_text(self) -> str:
        lines = ["JOB MATCH SCORE:", f"{self.match_score}%"]
        lines += ["", "STRONG MATCHES:"]
        lines += [f"- {item}" for item in self.strong_matches]
        lines += ["", "PARTIAL MATCHES:"]
        lines += [f"- {item}" for item in self.partial_matches]
        lines += ["", "SKILL GAPS:"]
        lines += [f"- {item}" for item in self.skill_gaps]
        lines += ["", "EXPERIENCE MATCH:", self.experience_match]
        lines += ["", "MISSING REQUIREMENTS:"]
        lines += [f"- {item}" for item in self.missing_requirements]
        lines += ["", "RECOMMENDATIONS:"]
        lines += [f"{i}. {item}" for i, item in enumerate(self.recommendations, 1)]
        lines += ["", "FINAL VERDICT:", self.final_verdict]
        return "\n".join(lines)