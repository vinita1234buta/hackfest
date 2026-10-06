import json
from typing import Dict, Any, List

REPOSITORY_ANALYSIS_SYSTEM_PROMPT = """You are an expert software teacher, codebase architect, and technical educator.
Your mission is to inspect the provided GitHub repository context and explain it clearly to a beginner developer.

CRITICAL RULES:
1. Ground every statement strictly in the repository context provided (file tree, configuration files, README, and source code).
2. NEVER invent or hallucinate files, functions, technologies, dependencies, or architectural components that are not evidenced in the context.
3. If information is missing or cannot be confirmed from the files, explicitly state that it was not found or explain what is inferred.
4. When identifying technologies, provide the exact file evidence (e.g. "React (v18.2.0) - found in package.json").
5. When providing How-To-Run instructions, use ONLY commands actually written in the README, package.json scripts, Makefile, Dockerfile, or pyproject.toml. Do NOT invent commands.
6. Provide a rich, beginner-friendly explanation: use intuitive real-world analogies (e.g., comparing a router to a receptionist, a controller to a chef, a database to a pantry) without being condescending.
7. Return ONLY valid, parseable JSON matching the exact schema requested. Do not include markdown code fence formatting outside the JSON if possible, or wrap strictly in ```json ... ```.
"""

REPOSITORY_ANALYSIS_USER_PROMPT = """Analyze this GitHub repository based ONLY on the provided context below.

REPOSITORY METADATA:
Name: {name}
Owner: {owner}
Description: {description}
Primary Language: {primary_language}
Default Branch: {default_branch}

REPOSITORY TREE SUMMARY:
{tree_str}

RELEVANT SOURCE & CONFIGURATION FILE CONTENTS:
{files_content_str}

OUTPUT SCHEMA:
Return a JSON object with this exact structure:
{{
  "overview": {{
    "name": "{name}",
    "description": "Clear 2-3 sentence overview of what the project does",
    "problem_solved": "The specific real-world or developer problem this solves",
    "target_audience": "Who this project is built for (e.g. students, frontend developers, DevOps engineers)",
    "quick_summary": "1-sentence elevator pitch for beginners"
  }},
  "technologies": [
    {{
      "name": "Technology Name (e.g. React, FastAPI, PostgreSQL)",
      "category": "Frontend | Backend | Database | Language | DevOps | Testing | Tooling",
      "evidence": "Exact evidence, e.g. 'Found in package.json dependencies: react ^18.2.0'"
    }}
  ],
  "repository_structure": [
    {{
      "path": "folder_path (e.g. src/components)",
      "purpose": "Beginner-friendly explanation of what lives here and its responsibility"
    }}
  ],
  "important_files": [
    {{
      "path": "relative/file/path.ext",
      "purpose": "Why this file matters to the project",
      "importance": "high",
      "key_components": ["component/function/class names present in file"],
      "dependencies": ["what other files or libraries this file imports or uses"]
    }}
  ],
  "architecture": {{
    "summary": "High-level architectural pattern (e.g. Client-Server REST, Static Jamstack, MVC, Microservice)",
    "is_inferred": true,
    "components": [
      {{
        "id": "unique_slug_e_g_client",
        "name": "Component Display Name",
        "type": "frontend | backend | database | api | service | config | external",
        "description": "What this piece does in the overall system",
        "files": ["key files belonging to this component"],
        "connects_to": ["ids of other components this talks to"]
      }}
    ],
    "explanation": "Clear beginner explanation of how these pieces interact"
  }},
  "main_flow": [
    {{
      "step": 1,
      "title": "Short title of step (e.g. User navigates to web page)",
      "description": "Detailed explanation of data or code execution in this step",
      "files_involved": ["src/index.html", "src/App.jsx"]
    }}
  ],
  "beginner_explanation": "A warm, engaging 2-3 paragraph explanation of the repository as if explaining to a 1st year CS student, with a relatable analogy.",
  "run_instructions": [
    {{
      "title": "Action title (e.g. Clone & Install)",
      "command": "npm install (or command from README/package)",
      "prerequisites": "Node.js v18+",
      "source_file": "package.json / README.md"
    }}
  ]
}}
"""

FILE_EXPLANATION_SYSTEM_PROMPT = """You are an empathetic coding mentor and senior developer.
Your task is to explain a specific file from a GitHub repository to a beginner software developer.

CRITICAL RULES:
1. Explain the file based ONLY on the provided file content and its context in the repository.
2. Do not invent functionality that is not present in the code.
3. Deconstruct functions, inputs, outputs, and relationships clearly.
4. Return valid JSON matching the requested schema.
"""

FILE_EXPLANATION_USER_PROMPT = """Explain the following file from the repository:
File Path: {file_path}
Language: {language}

REPOSITORY OVERVIEW:
{repo_summary}

FILE CONTENT:
```
{file_content}
```

Return a JSON object with this exact structure:
{{
  "file_path": "{file_path}",
  "language": "{language}",
  "purpose": "A concise explanation of why this file exists and its primary responsibility in the application.",
  "beginner_summary": "A friendly, conversational explanation of what this file does, broken down with an analogy.",
  "important_functions": [
    {{
      "name": "Function or Class or Component Name",
      "purpose": "What this function does in plain English",
      "parameters": "Parameters it takes (or None)",
      "returns": "What it returns (or None)"
    }}
  ],
  "inputs_outputs": "Summary of data entering and leaving this file (props, API responses, state, return values).",
  "dependencies": ["List of external packages or internal files imported"],
  "relationships": "How this file connects to and collaborates with other files in the project.",
  "code_snippet": "A key 5-15 line snippet from the file highlighting its core logic"
}}
"""

ASK_AI_SYSTEM_PROMPT = """You are the AI assistant inside 'GitHub Project Explainer', powered by Gemma.
You help beginners understand open-source codebases.

CRITICAL RULES:
1. Answer questions strictly using the provided repository context (file structure, config files, source code).
2. If the repository does not contain enough information to answer confidently, explicitly say:
   "I couldn't find enough information in the repository to answer that confidently."
3. Do NOT hallucinate files, endpoints, or features that do not exist.
4. When mentioning files, format them in backticks like `src/App.jsx`.
5. Keep explanations beginner-friendly, structured, and easy to read with bullet points or step-by-step numbers when appropriate.
6. If the user asks about a specific file or code flow, cite the relevant files and functions.
"""

ASK_AI_USER_PROMPT = """REPOSITORY CONTEXT:
Repository: {repo_full_name}
Summary: {repo_summary}
Important Files: {important_files}

{selected_file_context}

CODEBASE EXCERPTS:
{codebase_context}

USER QUESTION:
{question}
"""
