from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AnalyzeRepoRequest(BaseModel):
    github_url: str = Field(..., description="Public GitHub repository URL (e.g. https://github.com/owner/repo)")


class TechnologyItem(BaseModel):
    name: str = Field(..., description="Technology, library, or framework name")
    category: str = Field(..., description="Category like Language, Frontend, Backend, Database, Build Tool, etc.")
    evidence: str = Field(..., description="Repository evidence verifying this tech (e.g. found in package.json or file extension)")


class FolderExplanation(BaseModel):
    path: str = Field(..., description="Directory path relative to repository root")
    purpose: str = Field(..., description="Clear beginner-friendly description of what this directory contains and does")


class ImportantFile(BaseModel):
    path: str = Field(..., description="File path relative to repository root")
    purpose: str = Field(..., description="Why this file is important and what it does")
    importance: str = Field(default="high", description="'high' or 'medium'")
    key_components: List[str] = Field(default_factory=list, description="Important functions, classes, or exports")
    dependencies: List[str] = Field(default_factory=list, description="Other files or libraries it depends on")


class ArchitectureComponent(BaseModel):
    id: str = Field(..., description="Unique slug ID (e.g. 'client', 'api_server', 'database')")
    name: str = Field(..., description="Component name (e.g. 'React Single Page App', 'FastAPI REST API')")
    type: str = Field(..., description="'frontend', 'backend', 'database', 'api', 'service', 'config', 'external'")
    description: str = Field(..., description="Role and duties of this component")
    files: List[str] = Field(default_factory=list, description="Primary files implementing this component")
    connects_to: List[str] = Field(default_factory=list, description="IDs of other components this connects to")


class ArchitectureData(BaseModel):
    summary: str = Field(..., description="Summary of the high-level architecture")
    is_inferred: bool = Field(default=False, description="True if inferred from structure rather than explicit documentation")
    components: List[ArchitectureComponent] = Field(default_factory=list, description="List of architecture nodes")
    explanation: str = Field(..., description="Beginner-friendly explanation of how the system pieces connect")


class CodeFlowStep(BaseModel):
    step: int = Field(..., description="Step sequence number")
    title: str = Field(..., description="Short title of the step (e.g. 'User submits form')")
    description: str = Field(..., description="Detailed beginner explanation of data or execution movement")
    files_involved: List[str] = Field(default_factory=list, description="Files participating in this step")


class RepoOverview(BaseModel):
    name: str = Field(..., description="Project name")
    description: str = Field(..., description="Short concise summary of what this project does")
    problem_solved: str = Field(..., description="What specific problem this software solves")
    target_audience: str = Field(..., description="Who uses this project (e.g. frontend devs, data analysts, end users)")
    quick_summary: str = Field(..., description="1-2 sentence elevator pitch for beginners")


class RunInstruction(BaseModel):
    title: str = Field(..., description="Step name (e.g. 'Install dependencies', 'Start dev server')")
    command: str = Field(..., description="Exact command found in repo evidence (README/package.json/Makefile)")
    prerequisites: Optional[str] = Field(None, description="Requirements like Node.js, Python, or Docker")
    source_file: Optional[str] = Field(None, description="File where this command was discovered (e.g. README.md or package.json)")


class FileTreeNode(BaseModel):
    name: str = Field(..., description="File or folder name")
    path: str = Field(..., description="Full path relative to repo root")
    type: str = Field(..., description="'file' or 'dir'")
    size: Optional[int] = Field(None, description="Size in bytes for files")
    is_important: bool = Field(default=False, description="Whether this file is marked as important")
    children: Optional[List['FileTreeNode']] = Field(None, description="Children nodes if directory")


class RepoInfo(BaseModel):
    owner: str
    name: str
    full_name: str
    url: str
    default_branch: str
    stars: int
    forks: int
    primary_language: Optional[str] = None
    license: Optional[str] = None
    open_issues: int = 0
    description: Optional[str] = None


class RepoAnalysisResult(BaseModel):
    repo_info: RepoInfo
    overview: RepoOverview
    technologies: List[TechnologyItem]
    repository_structure: List[FolderExplanation]
    file_tree: List[FileTreeNode]
    important_files: List[ImportantFile]
    architecture: ArchitectureData
    main_flow: List[CodeFlowStep]
    beginner_explanation: str
    run_instructions: List[RunInstruction]
    analysis_timestamp: str
    model_used: str


class FileContentRequest(BaseModel):
    github_url: str
    file_path: str


class FileContentResponse(BaseModel):
    file_path: str
    content: str
    size: int
    is_truncated: bool = False
    language: str


class ExplainFileRequest(BaseModel):
    github_url: str
    file_path: str
    file_content: Optional[str] = None


class FileFunctionInfo(BaseModel):
    name: str
    purpose: str
    parameters: Optional[str] = None
    returns: Optional[str] = None


class ExplainFileResponse(BaseModel):
    file_path: str
    language: str
    purpose: str
    beginner_summary: str
    important_functions: List[FileFunctionInfo] = Field(default_factory=list)
    inputs_outputs: str
    dependencies: List[str] = Field(default_factory=list)
    relationships: str
    code_snippet: Optional[str] = None


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str


class AskAIRequest(BaseModel):
    github_url: str
    question: str
    selected_file: Optional[str] = None
    conversation_history: Optional[List[ChatMessage]] = Field(default_factory=list)


class AskAIResponse(BaseModel):
    answer: str
    relevant_files: List[str] = Field(default_factory=list)
    confidence: str = Field(default="high", description="'high', 'medium', or 'insufficient_info'")
