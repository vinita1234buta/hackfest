import os
import re
from typing import List, Dict, Any, Set, Tuple
from config import settings
from models import FileTreeNode, ImportantFile
from github_service import github_service

# Directories to strictly ignore
IGNORED_DIRS: Set[str] = {
    ".git",
    "node_modules",
    "dist",
    "build",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".next",
    ".nuxt",
    ".turbo",
    ".cache",
    "vendor",
    "venv",
    ".venv",
    "env",
    ".env",
    ".idea",
    ".vscode",
    "coverage",
    ".gradle",
    "target",
    "bin",
    "obj",
}

# Binary and non-code file extensions to ignore
IGNORED_EXTENSIONS: Set[str] = {
    # Images & Media
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg", ".bmp", ".tiff",
    ".mp3", ".wav", ".ogg", ".mp4", ".mov", ".avi", ".mkv", ".webm",
    # Fonts
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    # Compiled & Binaries
    ".exe", ".dll", ".so", ".dylib", ".bin", ".o", ".a", ".pyc", ".pyo", ".pyd",
    ".class", ".jar", ".war", ".ear",
    # Archives
    ".zip", ".tar", ".gz", ".7z", ".rar", ".bz2", ".xz",
    # Documents & Data binaries
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".sqlite", ".sqlite3", ".db",
    # Giant Lockfiles (noisy for LLM)
    ".lock",
}

# Specific lockfiles
IGNORED_FILENAMES: Set[str] = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "poetry.lock",
    "Pipfile.lock",
    "composer.lock",
    "Cargo.lock",
    "go.sum",
    ".DS_Store",
    "Thumbs.db",
}

# High-priority configuration and meta files
TIER_1_CONFIG_FILES = [
    "readme.md",
    "package.json",
    "requirements.txt",
    "pyproject.toml",
    "dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    "go.mod",
    "cargo.toml",
    "pom.xml",
    "build.gradle",
    "tsconfig.json",
    "vite.config.js",
    "vite.config.ts",
    "next.config.js",
    "next.config.mjs",
]

# Entrypoint patterns
ENTRYPOINT_PATTERNS = [
    r"^main\.(py|js|ts|go|rs|jsx|tsx)$",
    r"^app\.(py|js|ts|jsx|tsx)$",
    r"^index\.(js|ts|html|jsx|tsx)$",
    r"^server\.(js|ts|py)$",
    r"^(src|app)/main\.(py|js|ts|jsx|tsx)$",
    r"^(src|app)/app\.(py|js|ts|jsx|tsx)$",
    r"^(src|app)/index\.(js|ts|jsx|tsx)$",
    r"^(src|app)/app\.(vue|svelte)$",
]

# Key architectural directories
KEY_DIR_PATTERNS = [
    "routes",
    "controllers",
    "models",
    "services",
    "components",
    "api",
    "views",
    "pages",
    "handlers",
    "middleware",
    "schemas",
]


def is_ignored_path(path: str) -> bool:
    """Checks if a path should be omitted from analysis."""
    parts = path.split("/")
    filename = parts[-1].lower()

    # Check directory names
    for part in parts[:-1]:
        if part.lower() in IGNORED_DIRS or part.startswith("."):
            return True

    # Check ignored filenames
    if filename in IGNORED_FILENAMES:
        return True

    # Check sensitive secret files
    if filename.startswith(".env") or filename.endswith((".pem", ".key", ".pfx", ".cert")):
        return True

    # Check extension
    _, ext = os.path.splitext(filename)
    if ext.lower() in IGNORED_EXTENSIONS:
        return True

    return False


def score_file_priority(path: str, size: int) -> int:
    """
    Computes a priority score (higher is more important).
    Prevents large auto-generated files from overwhelming the context.
    """
    score = 0
    filename = path.split("/")[-1].lower()
    lowered_path = path.lower()

    # Tier 1: Config and README
    if filename == "readme.md":
        score += 1000
    elif filename in TIER_1_CONFIG_FILES:
        score += 800

    # Tier 2: Entry points
    for pattern in ENTRYPOINT_PATTERNS:
        if re.search(pattern, lowered_path):
            score += 600
            break

    # Tier 3: Core architectural directories
    for key_dir in KEY_DIR_PATTERNS:
        if f"/{key_dir}/" in f"/{lowered_path}":
            score += 300
            break

    # Source directories priority
    if lowered_path.startswith(("src/", "app/", "lib/", "core/")):
        score += 150

    # Penalize files that are too deep in the hierarchy (> 4 levels)
    depth = len(path.split("/"))
    if depth > 4:
        score -= (depth - 4) * 20

    # Penalize very large files (> 30KB)
    if size > 30000:
        score -= 100

    return score


def build_compact_tree_string(tree_items: List[Dict[str, Any]], max_items: int = 70) -> str:
    """
    Builds a clean, indented tree representation of non-ignored files for the LLM.
    """
    filtered_paths = [
        item["path"] for item in tree_items
        if not is_ignored_path(item["path"])
    ]
    if not filtered_paths:
        return "(Repository is empty or only contains ignored files)"

    lines = []
    for p in filtered_paths[:max_items]:
        parts = p.split("/")
        indent = "  " * (len(parts) - 1)
        name = parts[-1]
        lines.append(f"{indent}├── {name} ({p})")

    if len(filtered_paths) > max_items:
        lines.append(f"  ... and {len(filtered_paths) - max_items} more files")

    return "\n".join(lines)


def build_nested_file_tree(tree_items: List[Dict[str, Any]], important_paths: Set[str]) -> List[FileTreeNode]:
    """
    Converts flat git tree items into a nested FileTreeNode hierarchy for the frontend explorer.
    """
    root_nodes: Dict[str, Any] = {}

    for item in tree_items:
        path = item.get("path", "")
        if is_ignored_path(path):
            continue

        item_type = "dir" if item.get("type") == "tree" else "file"
        parts = path.split("/")
        current = root_nodes

        for i, part in enumerate(parts):
            is_last = (i == len(parts) - 1)
            current_path = "/".join(parts[: i + 1])

            if part not in current:
                current[part] = {
                    "name": part,
                    "path": current_path,
                    "type": item_type if is_last else "dir",
                    "size": item.get("size", 0) if is_last else None,
                    "is_important": current_path in important_paths,
                    "children": {} if (not is_last or item_type == "dir") else None,
                }
            if not is_last:
                current = current[part]["children"]

    def dict_to_tree_list(d: Dict[str, Any]) -> List[FileTreeNode]:
        result = []
        # Sort directories first, then files alphabetically
        sorted_keys = sorted(d.keys(), key=lambda k: (d[k]["type"] != "dir", k.lower()))
        for k in sorted_keys:
            node_data = d[k]
            children_nodes = None
            if node_data["children"] is not None:
                children_nodes = dict_to_tree_list(node_data["children"])
            result.append(
                FileTreeNode(
                    name=node_data["name"],
                    path=node_data["path"],
                    type=node_data["type"],
                    size=node_data["size"],
                    is_important=node_data["is_important"],
                    children=children_nodes,
                )
            )
        return result

    return dict_to_tree_list(root_nodes)


class RepositoryAnalyzer:
    async def prepare_repo_context(
        self,
        owner: str,
        repo: str,
        default_branch: str,
        tree_items: List[Dict[str, Any]]
    ) -> Tuple[str, str, List[Tuple[str, str, int]], List[Dict[str, Any]]]:
        """
        Filters, prioritizes, and fetches file contents for Gemma.
        Returns:
            - compact_tree_str: Formatted ASCII tree
            - files_content_str: Concatenated key file contents
            - prioritized_files: List of (path, content, size)
            - valid_tree_items: All non-ignored tree items
        """
        valid_items = [
            item for item in tree_items
            if item.get("type") == "blob" and not is_ignored_path(item.get("path", ""))
        ]

        # Score files
        scored_files = []
        for item in valid_items:
            path = item.get("path", "")
            size = item.get("size", 0)
            score = score_file_priority(path, size)
            scored_files.append((score, item))

        scored_files.sort(key=lambda x: x[0], reverse=True)

        # Select top files up to MAX_REPO_FILES limit
        max_files = settings.MAX_REPO_FILES
        selected_items = [item for _, item in scored_files[:max_files]]

        # Fetch contents asynchronously
        prioritized_files: List[Tuple[str, str, int]] = []
        files_content_blocks = []

        for item in selected_items:
            path = item.get("path", "")
            content, is_truncated, original_size = await github_service.get_raw_file_content(
                owner=owner,
                repo=repo,
                branch=default_branch,
                path=path,
            )
            prioritized_files.append((path, content, original_size))
            trunc_note = " (truncated)" if is_truncated else ""
            files_content_blocks.append(
                f"--- FILE: {path}{trunc_note} ---\n{content}\n"
            )

        compact_tree_str = build_compact_tree_string(tree_items)
        files_content_str = "\n".join(files_content_blocks)

        return compact_tree_str, files_content_str, prioritized_files, valid_items


repo_analyzer = RepositoryAnalyzer()
