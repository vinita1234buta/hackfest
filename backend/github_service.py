import re
import base64
import logging
from typing import Tuple, Dict, Any, List, Optional
import httpx
from fastapi import HTTPException
from config import settings

logger = logging.getLogger(__name__)


class GitHubException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


def parse_github_url(url: str) -> Tuple[str, str]:
    """
    Parses a GitHub URL or string (e.g. 'https://github.com/owner/repo' or 'owner/repo')
    into (owner, repo_name).
    """
    cleaned = url.strip().rstrip("/")
    if cleaned.endswith(".git"):
        cleaned = cleaned[:-4]

    pattern = r"(?:https?://github\.com/)?([a-zA-Z0-9_\-\.]+)/([a-zA-Z0-9_\-\.]+)"
    match = re.search(pattern, cleaned)
    if not match:
        raise GitHubException(
            status_code=400,
            detail=f"Invalid GitHub URL: '{url}'. Please provide a valid public repository URL (e.g. https://github.com/owner/repository)."
        )

    owner = match.group(1)
    repo = match.group(2)
    # Strip any subpath in case user pasted e.g. tree/main/xyz
    repo = repo.split("/")[0]
    return owner, repo


class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.raw_base_url = "https://raw.githubusercontent.com"

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "GitHub-Project-Explainer/1.0",
        }
        if settings.GITHUB_TOKEN and settings.GITHUB_TOKEN.strip():
            headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN.strip()}"
        return headers

    async def get_repository_details(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetches repository metadata from the GitHub API."""
        url = f"{self.base_url}/repos/{owner}/{repo}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers())
            except httpx.RequestError as exc:
                logger.error(f"Network error accessing GitHub API: {exc}")
                raise GitHubException(status_code=503, detail="Network error contacting GitHub API. Please check your connection.")

            if response.status_code == 404:
                raise GitHubException(
                    status_code=404,
                    detail=f"Repository '{owner}/{repo}' was not found. Please check that the URL is spelled correctly and that the repository is public."
                )
            elif response.status_code == 403:
                rate_limit_remaining = response.headers.get("X-RateLimit-Remaining", "unknown")
                if rate_limit_remaining == "0":
                    raise GitHubException(
                        status_code=429,
                        detail="GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to the environment variables to increase the limit, or try again later."
                    )
                raise GitHubException(status_code=403, detail="Access to this repository was forbidden by GitHub.")
            elif response.status_code != 200:
                raise GitHubException(status_code=response.status_code, detail=f"GitHub API returned unexpected status {response.status_code}.")

            data = response.json()
            return {
                "owner": data.get("owner", {}).get("login", owner),
                "name": data.get("name", repo),
                "full_name": data.get("full_name", f"{owner}/{repo}"),
                "url": data.get("html_url", f"https://github.com/owner/{repo}"),
                "default_branch": data.get("default_branch", "main"),
                "stars": data.get("stargazers_count", 0),
                "forks": data.get("forks_count", 0),
                "primary_language": data.get("language") or "Unknown",
                "license": data.get("license", {}).get("name") if data.get("license") else None,
                "open_issues": data.get("open_issues_count", 0),
                "description": data.get("description") or "No description provided.",
                "size": data.get("size", 0),
            }

    async def get_repository_tree(self, owner: str, repo: str, branch: str) -> List[Dict[str, Any]]:
        """
        Fetches the complete recursive Git tree of the repository.
        Returns a list of items with path, type ('blob' or 'tree'), size, and sha.
        """
        url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers())
            except httpx.RequestError as exc:
                logger.error(f"Error fetching repo tree: {exc}")
                raise GitHubException(status_code=503, detail="Failed to fetch repository tree from GitHub.")

            if response.status_code != 200:
                # If recursive tree failed (e.g. huge repository or empty repo), fallback to non-recursive
                url_fallback = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{branch}"
                fallback_res = await client.get(url_fallback, headers=self._get_headers())
                if fallback_res.status_code == 200:
                    data = fallback_res.json()
                    return data.get("tree", [])
                raise GitHubException(
                    status_code=response.status_code,
                    detail=f"Unable to retrieve repository file structure (status {response.status_code})."
                )

            data = response.json()
            if data.get("truncated", False):
                logger.warning(f"Repository tree for {owner}/{repo} was truncated by GitHub API due to size.")
            return data.get("tree", [])

    async def get_raw_file_content(self, owner: str, repo: str, branch: str, path: str) -> Tuple[str, bool, int]:
        """
        Fetches raw content of a file via raw.githubusercontent.com or GitHub contents API.
        Returns (content_string, is_truncated, original_size).
        """
        # Security check: never fetch secret files
        lowered_name = path.lower().split("/")[-1]
        if lowered_name.startswith(".env") or lowered_name.endswith((".pem", ".key", ".pfx")):
            return ("[Security Warning: Contents of environment / credential files are not inspected]", False, 0)

        raw_url = f"{self.raw_base_url}/{owner}/{repo}/{branch}/{path}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                # Try raw url first
                response = await client.get(raw_url, headers={"User-Agent": "GitHub-Project-Explainer/1.0"})
                if response.status_code == 200:
                    text = response.text
                    max_bytes = settings.MAX_FILE_SIZE_BYTES
                    if len(text.encode("utf-8")) > max_bytes:
                        truncated = text[:max_bytes] + "\n\n... [File content truncated due to size limit]"
                        return truncated, True, len(text.encode("utf-8"))
                    return text, False, len(text.encode("utf-8"))
            except Exception as e:
                logger.warning(f"Raw URL fetch failed for {path}: {e}")

            # Fallback to contents API
            api_url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}?ref={branch}"
            try:
                api_res = await client.get(api_url, headers=self._get_headers())
                if api_res.status_code == 200:
                    data = api_res.json()
                    encoding = data.get("encoding")
                    content_b64 = data.get("content", "")
                    if encoding == "base64" and content_b64:
                        decoded = base64.b64decode(content_b64).decode("utf-8", errors="replace")
                        max_bytes = settings.MAX_FILE_SIZE_BYTES
                        if len(decoded.encode("utf-8")) > max_bytes:
                            truncated = decoded[:max_bytes] + "\n\n... [File content truncated due to size limit]"
                            return truncated, True, len(decoded.encode("utf-8"))
                        return decoded, False, len(decoded.encode("utf-8"))
            except Exception as e:
                logger.error(f"GitHub contents API failed for {path}: {e}")

        return (f"[Unable to retrieve content for {path}]", False, 0)


github_service = GitHubService()
