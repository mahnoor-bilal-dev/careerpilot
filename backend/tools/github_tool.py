"""
CareerPilot — GitHub tool (Milestone 5)

A plain async Python function. ADK automatically wraps any function
assigned to an agent's `tools` list as a FunctionTool — we don't
construct anything special here. The function's docstring and type
hints are what the LLM reads to decide when and how to call this.

Uses GitHub's public REST API, unauthenticated. No token required for
this milestone since we're only reading public data, and unauthenticated
requests get 60/hour from a single IP — plenty for local development.
"""

import httpx

GITHUB_API_BASE = "https://api.github.com"

# GitHub's unauthenticated API requires a User-Agent header, or it
# rejects the request outright.
_HEADERS = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "CareerPilot-App",
}


async def get_github_profile(username: str) -> dict:
    """
    Retrieves a public GitHub user's profile and their public
    repositories, including each repo's description, primary language,
    stars, forks, topics, and URL.

    Use this tool whenever you need real information about a specific
    GitHub user's profile or repositories — do not guess or make up
    GitHub data.

    Args:
        username: The GitHub username to look up (not a URL, just the
            username, e.g. "octocat").

    Returns:
        A dictionary with a "status" key ("success" or "error").
        On success, includes "profile" (bio, followers, public repo
        count, etc.) and "repositories" (a list of repo details).
        On error, includes an "error_message" explaining what went
        wrong (user not found, rate limited, network issue, etc).
    """
    username = username.strip().lstrip("@")

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            profile_response = await client.get(
                f"{GITHUB_API_BASE}/users/{username}", headers=_HEADERS
            )
        except httpx.RequestError as error:
            return {
                "status": "error",
                "error_message": f"Could not reach GitHub: {error}",
            }

        if profile_response.status_code == 404:
            return {
                "status": "error",
                "error_message": f"No GitHub user found with username '{username}'.",
            }

        if profile_response.status_code == 403:
            if profile_response.headers.get("X-RateLimit-Remaining") == "0":
                return {
                    "status": "error",
                    "error_message": (
                        "GitHub API rate limit exceeded for unauthenticated "
                        "requests. Please try again later."
                    ),
                }
            return {
                "status": "error",
                "error_message": "GitHub API access was forbidden.",
            }

        if profile_response.status_code != 200:
            return {
                "status": "error",
                "error_message": (
                    f"GitHub API returned an unexpected status: "
                    f"{profile_response.status_code}"
                ),
            }

        profile_data = profile_response.json()

        try:
            repos_response = await client.get(
                f"{GITHUB_API_BASE}/users/{username}/repos",
                headers=_HEADERS,
                params={"sort": "updated", "per_page": 20},
            )
        except httpx.RequestError as error:
            return {
                "status": "error",
                "error_message": f"Could not reach GitHub for repositories: {error}",
            }

        repos_data = repos_response.json() if repos_response.status_code == 200 else []

    repositories = [
        {
            "name": repo.get("name"),
            "description": repo.get("description"),
            "language": repo.get("language"),
            "stars": repo.get("stargazers_count", 0),
            "forks": repo.get("forks_count", 0),
            "url": repo.get("html_url"),
            "topics": repo.get("topics", []),
            "is_fork": repo.get("fork", False),
        }
        for repo in repos_data
    ]

    return {
        "status": "success",
        "profile": {
            "username": profile_data.get("login"),
            "name": profile_data.get("name"),
            "bio": profile_data.get("bio"),
            "public_repos": profile_data.get("public_repos", 0),
            "followers": profile_data.get("followers", 0),
            "following": profile_data.get("following", 0),
            "profile_url": profile_data.get("html_url"),
        },
        "repositories": repositories,
    }