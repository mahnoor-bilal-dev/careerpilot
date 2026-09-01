"""
CareerPilot — GitHub output schema (Milestone 7A)

Defines the exact shape github_agent must return. GitHubProfileSummary
and GitHubRepositorySummary intentionally mirror the fields the
get_github_profile tool actually returns (see tools/github_tool.py) —
the agent should only echo back real metadata it retrieved, never
invented fields.
"""

from pydantic import BaseModel, Field


class GitHubProfileSummary(BaseModel):
    username: str = Field(description="The GitHub username.")
    name: str | None = Field(default=None, description="Display name, if set.")
    bio: str | None = Field(default=None, description="Profile bio, if set.")
    public_repos: int = Field(description="Number of public repositories.")
    followers: int = Field(description="Number of followers.")


class GitHubRepositorySummary(BaseModel):
    name: str = Field(description="Repository name.")
    description: str | None = Field(default=None, description="Repository description, if set.")
    language: str | None = Field(default=None, description="Primary language, if detected.")
    stars: int = Field(description="Star count.")
    forks: int = Field(description="Fork count.")
    url: str = Field(description="Repository URL.")


class GitHubOutput(BaseModel):
    profile: GitHubProfileSummary = Field(
        description="Summary of the user's public GitHub profile, from real tool data only."
    )
    repositories: list[GitHubRepositorySummary] = Field(
        description="Summaries of the user's public repositories, from real tool data only."
    )
    technologies: list[str] = Field(
        description="Languages/technologies actually observed across the repositories."
    )
    strengths: list[str] = Field(
        description="Specific portfolio strengths, e.g. consistent activity, varied stack."
    )
    weaknesses: list[str] = Field(
        description="Specific portfolio weaknesses, e.g. mostly forks, low engagement."
    )
    documentation_issues: list[str] = Field(
        description="Repositories missing a description or topics, called out by name."
    )
    recommendations: list[str] = Field(
        description="Specific, actionable recommendations for improving the portfolio."
    )

    def to_display_text(self) -> str:
        lines = ["PROFILE OVERVIEW:"]
        bio_part = f" — {self.profile.bio}" if self.profile.bio else ""
        lines.append(
            f"{self.profile.username}{bio_part} "
            f"({self.profile.public_repos} public repos, {self.profile.followers} followers)"
        )
        lines += ["", "REPOSITORY OVERVIEW:"]
        for repo in self.repositories:
            desc = f" — {repo.description}" if repo.description else ""
            lines.append(f"- {repo.name}{desc} ({repo.stars}★, {repo.forks} forks)")
        lines += ["", "TECHNOLOGIES / LANGUAGES OBSERVED:"]
        lines += [f"- {item}" for item in self.technologies]
        lines += ["", "PORTFOLIO STRENGTHS:"]
        lines += [f"- {item}" for item in self.strengths]
        lines += ["", "PORTFOLIO WEAKNESSES:"]
        lines += [f"- {item}" for item in self.weaknesses]
        lines += ["", "DOCUMENTATION ISSUES:"]
        lines += [f"- {item}" for item in self.documentation_issues]
        lines += ["", "RECOMMENDATIONS:"]
        lines += [f"{i}. {item}" for i, item in enumerate(self.recommendations, 1)]
        return "\n".join(lines)