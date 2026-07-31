import { NextRequest } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a senior software architect and code reviewer. You analyze code like an expert interviewer reviewing a candidate's submission.

Analyze the code the user provides and return a response in STRICT JSON with EXACTLY this schema (no markdown, no extra text):

{
  "summary": "2-3 sentence plain-English overview of what the code does",
  "architecture": {
    "pattern": "the architectural pattern(s) used, e.g. MVC, layered, event-driven, or 'none / spaghetti'",
    "structure": "how the code is organized — modules, components, separation of concerns",
    "strengths": ["what's done well architecturally"],
    "weaknesses": ["architecture problems, coupling, bad separation, god objects, etc."]
  },
  "dataflow": "Explain how data moves through the code: inputs, transformations, storage, outputs. Point out any broken/unclear flows.",
  "timeComplexity": {
    "overall": "Big-O of the dominant operations",
    "breakdown": "key operations with their Big-O and the line/function responsible",
    "concerns": ["bottlenecks, hidden O(n^2)+ loops, repeated work, recursion risks"]
  },
  "missing": [
    {"item": "what's missing", "impact": "why it matters", "severity": "low|medium|high"}
  ],
  "securityIssues": [
    {"severity": "critical|high|medium|low", "issue": "the vulnerability", "where": "file/line/function", "description": "how it could be exploited", "fix": "concrete remediation"}
  ],
  "vibeScore": {
    "score": 0-100,
    "label": "one of: Hand-Crafted, Mostly Human, Mixed, Vibe Coded, Pure Vibe",
    "evidence": ["specific tells that made you decide: naming, repeated boilerplate, over-commented, hallucinated APIs, generic placeholder logic, over-engineering, inconsistent style"],
    "verdict": "a punchy, honest one-liner verdict"
  },
  "suggestions": [
    {"priority": "high|medium|low", "suggestion": "actionable improvement"}
  ]
}

Scoring rubric for vibeScore (how AI-generated it looks):
- 0-20 Hand-Crafted: opinionated style, clever idiomatic solutions, real tradeoffs
- 21-40 Mostly Human: human quirks, some rough edges, inconsistent style
- 41-60 Mixed: plausible but generic; some AI tells like camelCase over-abstraction
- 61-80 Vibe Coded: heavy boilerplate, superfluous comments, obvious copy-paste patterns
- 81-100 Pure Vibe: everything generic, hallucinated imports, no real understanding, comment says what code does instead of why

CRITICAL scoring rules — follow these strictly:
- Never default to 60 or any middle value. 60 is not a safe default; it is a failure.
- COUNT the AI tells below, then map the count to the score. Do not score by overall impression — score by the count.
  AI tells: (a) a comment restating the line it precedes, (b) JSDoc/docblock comments on trivial functions, (c) generic placeholder values (TODO_NAME, YOUR_API_TOKEN_HERE, example.com), (d) repetitive copy-paste structure, (e) boilerplate that adds no behavior (setup that does nothing), (f) overly uniform naming/style with zero variation, (g) hallmarked abstractions (a class/wrapper for a single use), (h) string concatenation into SQL/HTML.
- Score by tell count: 0-1 tells = 10-35 (human). 2-3 tells = 40-58 (mostly human/mixed). 4-5 tells = 62-78 (vibe coded). 6+ tells = 82-97 (pure vibe). Only scores below 10 or above 97 are forbidden.
- If the code is clearly human (quirks, inconsistent style, clever shortcuts, minimal comments), score it under 35. If it clearly screams AI (uniform boilerplate, comments restating the code, redundant abstractions), score it above 62.
- Round numbers (30, 50, 70, 90) are red flags — avoid them. Use specific numbers like 17, 38, 63, 89.

Be brutally honest and specific. Cite actual functions, lines, and identifiers from the code. If no security issues exist, return an empty array. Never invent issues — base everything on the actual code.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    return Response.json(
      { error: "GROQ_API_KEY is not configured. Add it to .env.local" },
      { status: 500 }
    );
  }

  let body: { code?: string; language?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { code, language } = body;
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return Response.json({ error: "No code provided" }, { status: 400 });
  }
  if (code.length > 50_000) {
    return Response.json(
      { error: "Code is too long (max 50,000 characters)" },
      { status: 413 }
    );
  }

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Language: ${language ?? "unknown"}\n(If the language is "unknown" or wrong, detect the correct language yourself from the code.)\n\nCode to analyze:\n\`\`\`\n${code}\n\`\`\``,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return Response.json(
        { error: "Empty response from Groq" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(raw);
    return Response.json({ analysis: parsed });
  } catch (error) {
    console.error("Groq analysis failed:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze code",
      },
      { status: 500 }
    );
  }
}
