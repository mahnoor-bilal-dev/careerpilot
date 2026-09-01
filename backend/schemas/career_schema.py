"""
CareerPilot — Career output schema (Milestone 7A)

Defines the exact shape career_agent must return. Passed to the agent
as `output_schema=CareerOutput` — ADK enforces this, we don't parse
free-form text ourselves.
"""

from pydantic import BaseModel, Field


class CareerOutput(BaseModel):
    strengths: list[str] = Field(
        description="Specific strengths evident from the user's stated background and goal."
    )
    skill_gaps: list[str] = Field(
        description="Specific skills that would help the user reach their stated goal."
    )
    career_direction: str = Field(
        description="1-2 sentences on what role or path best fits this person and why."
    )
    recommendations: list[str] = Field(
        description="Specific, actionable recommendations for the user."
    )

    def to_display_text(self) -> str:
        """
        Renders this structured object back into the same style of
        readable report the mobile app already displays, so existing
        endpoints/UI don't need to change in this milestone.
        """
        lines = ["STRENGTHS:"]
        lines += [f"- {item}" for item in self.strengths]
        lines += ["", "SKILL GAPS:"]
        lines += [f"- {item}" for item in self.skill_gaps]
        lines += ["", "CAREER DIRECTION:", self.career_direction]
        lines += ["", "RECOMMENDATIONS:"]
        lines += [f"{i}. {item}" for i, item in enumerate(self.recommendations, 1)]
        return "\n".join(lines)