# Explain My Code

Paste any code and get a structured review: architecture, dataflow, time complexity, what's missing, security issues, and a vibe-coded score (0-100) judging how AI-generated the code looks.

## How It's Made

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Groq API (Llama 3.3 70B) with a strict JSON response schema for the analysis
- highlight.js for syntax highlighting and language auto-detection
- VS Code-style editor (line gutter, status bar, custom scrollbar) built with a transparent textarea over a highlighted `<pre>`
- Heading font: Demine 3D (Craft Supply Co.) — free demo license, personal use only

## How It Works

1. You paste code (or open a file / load the sample) into the editor
2. The app detects the language and sends the code to the `/api/analyze` route
3. The route prompts Groq with a scoring rubric and returns strict JSON
4. The UI renders the analysis: summary, architecture, dataflow, time complexity, missing items, security issues, suggestions
5. The vibe-coded score is computed from concrete AI tells (redundant comments, placeholder values, boilerplate, hallucinated APIs)
