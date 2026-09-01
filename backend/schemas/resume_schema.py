"""
CareerPilot — Resume output schema (Milestone 7A)

Defines the exact shape resume_agent must return.
"""

from pydantic import BaseModel, Field


class ResumeOutput(BaseModel):
    professional_summary: str = Field(
        description="2-3 sentences summarizing who this candidate is professionally."
    )
    technical_skills: list[str] = Field(
        description="Technical/hard skills actually found in the resume."
    )
    soft_skills: list[str] = Field(
        description="Soft skills explicitly stated or clearly evidenced in the resume."
    )
    education: list[str] = Field(
        description="Degrees, institutions, and dates found in the resume."
    )
    experience: list[str] = Field(
        description="Summary points of the candidate's work history and career progression."
    )
    projects: list[str] = Field(
        description="Notable projects mentioned in the resume. Empty list if none listed."
    )
    strengths: list[str] = Field(
        description="Specific strengths of this resume."
    )
    weaknesses: list[str] = Field(
        description="Specific gaps or missing information in this resume."
    )
    recommendations: list[str] = Field(
        description="Specific, actionable ways to improve this resume."
    )

    def to_display_text(self) -> str:
        lines = ["PROFESSIONAL SUMMARY:", self.professional_summary]
        lines += ["", "TECHNICAL SKILLS:"]
        lines += [f"- {item}" for item in self.technical_skills]
        lines += ["", "SOFT SKILLS:"]
        lines += [f"- {item}" for item in self.soft_skills]
        lines += ["", "EDUCATION:"]
        lines += [f"- {item}" for item in self.education] if self.education else ["None listed"]
        lines += ["", "EXPERIENCE SUMMARY:"]
        lines += [f"- {item}" for item in self.experience] if self.experience else ["None listed"]
        lines += ["", "PROJECTS:"]
        lines += [f"- {item}" for item in self.projects] if self.projects else ["None listed"]
        lines += ["", "STRENGTHS:"]
        lines += [f"- {item}" for item in self.strengths]
        lines += ["", "WEAKNESSES OR MISSING INFORMATION:"]
        lines += [f"- {item}" for item in self.weaknesses]
        lines += ["", "RECOMMENDATIONS:"]
        lines += [f"{i}. {item}" for i, item in enumerate(self.recommendations, 1)]
        return "\n".join(lines)