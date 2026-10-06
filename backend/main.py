import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from models import (
    AnalyzeRepoRequest,
    RepoAnalysisResult,
    FileContentRequest,
    FileContentResponse,
    ExplainFileRequest,
    ExplainFileResponse,
    AskAIRequest,
    AskAIResponse,
)
from github_service import parse_github_url, github_service, GitHubException
from repository_analyzer import repo_analyzer, build_nested_file_tree
from gemma_service import gemma_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("github_project_explainer")

# In-memory cache for analysis results and file contents (keyed by "owner/repo")
analysis_cache: Dict[str, RepoAnalysisResult] = {}
context_cache: Dict[str, Dict[str, Any]] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("GitHub Project Explainer backend starting up...")
    logger.info(f"Gemma model: {settings.GEMMA_MODEL}")
    logger.info(f"Gemini API Key configured: {'Yes' if settings.GEMINI_API_KEY else 'No (running in Demo/Grounded Fallback Mode)'}")
    logger.info(f"GitHub Token configured: {'Yes' if settings.GITHUB_TOKEN else 'No (subject to public rate limit)'}")
    yield
    logger.info("Shutting down backend...")


app = FastAPI(
    title="GitHub Project Explainer API",
    description="AI-powered engine explaining open-source GitHub repositories to beginners using Google Gemma 4.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": "GitHub Project Explainer",
        "model": settings.GEMMA_MODEL,
        "has_gemini_api_key": bool(settings.GEMINI_API_KEY),
        "has_github_token": bool(settings.GITHUB_TOKEN),
        "cached_analyses_count": len(analysis_cache),
    }


@app.get("/api/demo-repos")
async def get_demo_repos():
    """Returns curated repositories suitable for beginner walkthroughs and testing."""
    return [
        {
            "name": "Redux Todo List",
            "url": "https://github.com/reduxjs/redux-essentials-counter-example",
            "description": "Essential React & Redux state management walkthrough",
            "language": "JavaScript",
            "category": "Frontend",
        },
        {
            "name": "FastAPI Full-Stack Example",
            "url": "https://github.com/tiangolo/fastapi",
            "description": "High performance Python web framework repository",
            "language": "Python",
            "category": "Backend",
        },
        {
            "name": "Express.js Hello World",
            "url": "https://github.com/expressjs/express",
            "description": "Fast, unopinionated, minimalist web framework for Node.js",
            "language": "JavaScript",
            "category": "Backend",
        },
        {
            "name": "Chalk (Popular Terminal Styling)",
            "url": "https://github.com/chalk/chalk",
            "description": "Terminal string styling done right with clean modular code",
            "language": "JavaScript",
            "category": "Libraries",
        }
    ]


@app.post("/api/analyze", response_model=RepoAnalysisResult)
async def analyze_repository(req: AnalyzeRepoRequest):
    owner, repo = parse_github_url(req.github_url)
    cache_key = f"{owner.lower()}/{repo.lower()}"

    # Return cached analysis if available
    if cache_key in analysis_cache:
        logger.info(f"Serving cached analysis for {cache_key}")
        return analysis_cache[cache_key]

    logger.info(f"Starting analysis for {owner}/{repo}...")

    # 1. Fetch Repository Metadata
    repo_info = await github_service.get_repository_details(owner, repo)

    # 2. Fetch Git Tree
    tree_items = await github_service.get_repository_tree(owner, repo, repo_info["default_branch"])
    if not tree_items:
        raise HTTPException(
            status_code=400,
            detail="The repository appears to be empty or has no accessible files."
        )

    # 3. Filter, prioritize, and extract key file contents
    tree_str, files_content_str, prioritized_files, valid_tree_items = await repo_analyzer.prepare_repo_context(
        owner=owner,
        repo=repo,
        default_branch=repo_info["default_branch"],
        tree_items=tree_items,
    )

    # 4. Build hierarchical FileTree for the UI Explorer
    important_file_paths = {p for p, _, _ in prioritized_files}
    file_tree = build_nested_file_tree(tree_items, important_file_paths)

    # 5. Invoke Gemma Service
    result = await gemma_service.analyze_repository(
        repo_info=repo_info,
        tree_str=tree_str,
        files_content_str=files_content_str,
        file_tree=file_tree,
        prioritized_files=prioritized_files,
    )

    # Store in memory cache
    analysis_cache[cache_key] = result
    context_cache[cache_key] = {
        "prioritized_files": prioritized_files,
        "files_content_str": files_content_str,
        "default_branch": repo_info["default_branch"],
    }

    return result


@app.post("/api/file-content", response_model=FileContentResponse)
async def get_file_content(req: FileContentRequest):
    owner, repo = parse_github_url(req.github_url)
    cache_key = f"{owner.lower()}/{repo.lower()}"

    default_branch = "main"
    if cache_key in context_cache:
        default_branch = context_cache[cache_key]["default_branch"]
    else:
        repo_info = await github_service.get_repository_details(owner, repo)
        default_branch = repo_info["default_branch"]

    content, is_truncated, original_size = await github_service.get_raw_file_content(
        owner=owner,
        repo=repo,
        branch=default_branch,
        path=req.file_path,
    )

    ext = req.file_path.split(".")[-1].lower() if "." in req.file_path else "txt"
    return FileContentResponse(
        file_path=req.file_path,
        content=content,
        size=original_size,
        is_truncated=is_truncated,
        language=ext,
    )


@app.post("/api/explain-file", response_model=ExplainFileResponse)
async def explain_file(req: ExplainFileRequest):
    owner, repo = parse_github_url(req.github_url)
    cache_key = f"{owner.lower()}/{repo.lower()}"

    # Get file content if not provided
    content = req.file_content
    if not content:
        default_branch = "main"
        if cache_key in context_cache:
            default_branch = context_cache[cache_key]["default_branch"]
        else:
            repo_info = await github_service.get_repository_details(owner, repo)
            default_branch = repo_info["default_branch"]

        raw_content, _, _ = await github_service.get_raw_file_content(
            owner=owner,
            repo=repo,
            branch=default_branch,
            path=req.file_path,
        )
        content = raw_content

    repo_summary = ""
    if cache_key in analysis_cache:
        repo_summary = analysis_cache[cache_key].overview.quick_summary

    return await gemma_service.explain_file(
        repo_summary=repo_summary,
        file_path=req.file_path,
        file_content=content,
    )


@app.post("/api/ask-ai", response_model=AskAIResponse)
async def ask_ai(req: AskAIRequest):
    owner, repo = parse_github_url(req.github_url)
    cache_key = f"{owner.lower()}/{repo.lower()}"

    if cache_key not in analysis_cache:
        # Run analysis first if not cached
        await analyze_repository(AnalyzeRepoRequest(github_url=req.github_url))

    cached_analysis = analysis_cache[cache_key]
    cached_ctx = context_cache.get(cache_key, {})

    important_files = [f.path for f in cached_analysis.important_files]
    codebase_snippets = cached_ctx.get("files_content_str", "")

    return await gemma_service.ask_ai(
        repo_info=cached_analysis.repo_info.model_dump(),
        overview_text=cached_analysis.overview.description,
        important_files=important_files,
        codebase_snippets=codebase_snippets,
        question=req.question,
        selected_file=req.selected_file,
        conversation_history=req.conversation_history,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
