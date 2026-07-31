"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import hljs from "highlight.js/lib/common";
import localFont from "next/font/local";

const demine3d = localFont({
  src: "./fonts/Demine-ExtrudeRight.otf",
});

type Severity = "critical" | "high" | "medium" | "low";

interface Analysis {
  summary: string;
  architecture?: {
    pattern?: string;
    structure?: string;
    strengths?: string[];
    weaknesses?: string[];
  };
  dataflow?: string;
  timeComplexity?: {
    overall?: string;
    breakdown?: string | Record<string, string>;
    concerns?: string[];
  };
  missing?: Array<{
    item: string;
    impact: string;
    severity: Severity;
  }>;
  securityIssues?: Array<{
    severity: Severity;
    issue: string;
    where: string;
    description: string;
    fix: string;
  }>;
  vibeScore?: {
    score: number;
    label: string;
    evidence: string[];
    verdict: string;
  };
  suggestions?: Array<{
    priority: Severity;
    suggestion: string;
  }>;
}

const EXT_BY_LANG: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "cs",
  go: "go",
  rust: "rs",
  php: "php",
  ruby: "rb",
  swift: "swift",
  kotlin: "kt",
  sql: "sql",
  xml: "html",
  css: "css",
};

function langLabel(lang: string | undefined) {
  if (!lang) return "Plain text";
  const map: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    cpp: "C++",
    csharp: "C#",
    xml: "HTML",
  };
  return map[lang] ?? lang.charAt(0).toUpperCase() + lang.slice(1);
}

const EXAMPLE_CODE = `// A simple task manager - analyze me!
const tasks = [];

function addTask(title) {
  const task = { id: Date.now(), title, done: false };
  tasks.push(task);
  return task;
}

function listTasks() {
  for (let i = 0; i < tasks.length; i++) {
    console.log(tasks[i].title);
  }
}

function findTask(id) {
  for (let task of tasks) {
    if (task.id === id) return task;
  }
  return null;
}

function deleteTask(id) {
  const task = findTask(id);
  const index = tasks.indexOf(task);
  tasks.splice(index, 1);
}

const db = require("mysql").createConnection({
  host: "localhost",
  user: "root",
  password: "password123",
  database: "tasks"
});
db.connect();

function saveToDb() {
  db.query("INSERT INTO tasks (title) VALUES ('" + tasks[0].title + "')");
}

addTask("Buy groceries");
listTasks();`;

const severityColor: Record<Severity, string> = {
  critical: "bg-red-50 text-red-700 border-red-600",
  high: "bg-orange-50 text-orange-700 border-orange-600",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-600",
  low: "bg-sky-50 text-sky-700 border-sky-600",
};

function vibeColor(score: number) {
  if (score <= 20) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (score <= 40) return { bar: "bg-green-500", text: "text-green-600" };
  if (score <= 60) return { bar: "bg-yellow-500", text: "text-yellow-600" };
  if (score <= 80) return { bar: "bg-orange-500", text: "text-orange-600" };
  return { bar: "bg-red-600", text: "text-red-600" };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function BigHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        <span className="text-slate-900">
          {title}
        </span>
      </h2>
      {children}
    </div>
  );
}

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <section className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0_0_#0f172a] sm:p-8">
        <BigHeading title={title} />
        <div className="space-y-4 text-[15px] leading-relaxed text-slate-600">
          {children}
        </div>
      </section>
    </Reveal>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs text-slate-700">
      {label}
    </span>
  );
}

const TAGLINES = [
  "Architecture. Dataflow. Complexity.",
  "Security holes. Missing pieces. Honest verdicts.",
  "Every line tells a story. Let's read it.",
  "Vibe coded? The score knows.",
];

function Typewriter() {
  const [text, setText] = useState("");
  const [phrase, setPhrase] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = TAGLINES[phrase];
    let timeout: number;
    if (!deleting) {
      if (text.length < current.length) {
        timeout = window.setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          45
        );
      } else {
        timeout = window.setTimeout(() => setDeleting(true), 2000);
      }
    } else {
      if (text.length > 0) {
        timeout = window.setTimeout(
          () => setText(current.slice(0, text.length - 1)),
          22
        );
      } else {
        timeout = window.setTimeout(() => {
          setDeleting(false);
          setPhrase((p) => (p + 1) % TAGLINES.length);
        }, 400);
      }
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, phrase]);

  return (
    <p className="mt-4 min-h-[1.5em] font-mono text-sm text-slate-600 sm:text-base">
      <span>{text}</span>
      <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-slate-900 align-middle" />
    </p>
  );
}

export default function Home() {
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  const scrollRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const lineCount = Math.max(1, code.split("\n").length);
  const codeHeight = Math.max(480, lineCount * 23.1 + 32);

  const detected = useMemo(() => {
    if (!code.trim()) return { language: undefined as string | undefined, html: "" };
    try {
      const out = hljs.highlightAuto(code);
      return { language: out.language, html: out.value };
    } catch {
      return { language: undefined, html: code };
    }
  }, [code]);

  const tabName =
    fileName ?? `code.${EXT_BY_LANG[detected.language ?? ""] ?? "txt"}`;

  useEffect(() => {
    if (analysis) {
      setTimeout(() => {
        explanationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [analysis]);

  function syncGutter() {
    if (scrollRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = scrollRef.current.scrollTop;
    }
  }

  function updateCursor() {
    const ta = scrollRef.current?.querySelector("textarea");
    if (!ta) return;
    const upTo = (ta as HTMLTextAreaElement).value.slice(
      0,
      (ta as HTMLTextAreaElement).selectionStart
    );
    const lines = upTo.split("\n");
    setCursor({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  }

  async function openFile(file: File | null | undefined) {
    if (!file) return;
    const text = await file.text();
    setFileName(file.name);
    setCode(text);
  }

  async function analyze() {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: langLabel(detected.language) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const vibe = analysis?.vibeScore;
  const vibeStyle = vibe ? vibeColor(vibe.score) : null;

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* header */}
        <header className="mb-10 text-center">
          <h1
            className={`${demine3d.className} text-4xl tracking-wide text-slate-900 uppercase sm:text-6xl`}
          >
            Explain My Code
          </h1>
          <Typewriter />
        </header>

        {/* VS Code editor */}
        <Reveal>
          <div className="overflow-hidden border-2 border-slate-900 shadow-[8px_8px_0_0_#0f172a]">
            {/* title bar */}
            <div className="flex items-center gap-3 bg-slate-200 px-4 py-2.5">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="ml-2 truncate text-xs text-slate-600">
                {tabName} — Explain My Code
              </span>
              <span className="ml-auto rounded-md border border-slate-400 bg-slate-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700">
                {langLabel(detected.language)}
              </span>
            </div>

            {/* editor body */}
            <div className="flex h-[480px] bg-slate-100 sm:h-[540px]">
              {/* gutter */}
              <div
                ref={gutterRef}
                className="editor-text select-none overflow-hidden border-r border-slate-300 bg-slate-100 py-4 text-right text-slate-400"
                style={{ width: 56 }}
                aria-hidden
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} className="pr-4">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* code area */}
              <div
                ref={scrollRef}
                onScroll={syncGutter}
                className="editor-scroll relative min-w-0 flex-1 overflow-auto bg-slate-100"
              >
                <pre
                  className="editor-text pointer-events-none m-0 whitespace-pre p-4"
                  style={{ height: codeHeight }}
                  dangerouslySetInnerHTML={{ __html: detected.html }}
                />
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyUp={updateCursor}
                  onClick={updateCursor}
                  onSelect={updateCursor}
                  onScroll={syncGutter}
                  placeholder="Paste your code here..."
                  spellCheck={false}
                  wrap="off"
                  style={{ height: codeHeight }}
                  className="editor-text absolute left-0 top-0 w-full resize-none overflow-hidden whitespace-pre bg-transparent p-4 text-transparent caret-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* status bar */}
            <div className="flex items-center gap-4 bg-slate-700 px-4 py-1.5 text-[11px] text-white">
              <span className="font-medium">
                Ln {cursor.line}, Col {cursor.col}
              </span>
              <span className="hidden sm:inline">Spaces: 2</span>
              <span className="hidden sm:inline">UTF-8</span>
              <span className="ml-auto">{langLabel(detected.language)}</span>
              <span>{code.length.toLocaleString()} chars</span>
            </div>
          </div>
        </Reveal>

        {/* controls */}
        <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => openFile(e.target.files?.[0])}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-none border-2 border-slate-900 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-[4px_4px_0_0_#0f172a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0f172a] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            Open file
          </button>
          <button
            onClick={() => {
              setCode(EXAMPLE_CODE);
              setFileName(null);
            }}
            className="rounded-none border-2 border-slate-900 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-[4px_4px_0_0_#0f172a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0f172a] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            Load example
          </button>
          <button
            onClick={() => setCode("")}
            className="rounded-none border-2 border-slate-900 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-[4px_4px_0_0_#0f172a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0f172a] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            Clear
          </button>
          <button
            onClick={analyze}
            disabled={loading || !code.trim()}
            className="ml-auto rounded-none border-2 border-slate-900 bg-slate-900 px-6 py-2.5 text-base font-bold text-white shadow-[4px_4px_0_0_#0f172a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-slate-800 hover:shadow-[2px_2px_0_0_#0f172a] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analyzing...
              </span>
            ) : (
              "Analyze this code"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 border-2 border-red-600 bg-red-50 p-4 text-sm text-red-700 shadow-[3px_3px_0_0_#0f172a]">
            {error}
          </div>
        )}

        {/* explanation */}
        <div ref={explanationRef} className="mt-14 scroll-mt-6">
          {loading && (
            <Reveal>
              <div className="border-2 border-dashed border-slate-400 bg-white p-12 text-center shadow-[6px_6px_0_0_#0f172a]">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-fuchsia-500/20 border-t-fuchsia-500" />
                <p className="text-slate-600">Reading your code…</p>
              </div>
            </Reveal>
          )}

          {analysis && !loading && (
            <div className="space-y-10">
              <Reveal>
                <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                  Detailed Analysis
                </h2>
              </Reveal>

              <Section title="Summary">
                <p className="text-lg leading-relaxed text-slate-700">
                  {analysis.summary}
                </p>
              </Section>

              {analysis.architecture && (
                <Section title="Architecture" delay={80}>
                  <div className="flex flex-wrap gap-2">
                    <Chip label={analysis.architecture.pattern ?? "No clear pattern"} />
                  </div>
                  {analysis.architecture.structure && (
                    <p>{analysis.architecture.structure}</p>
                  )}
                  {(analysis.architecture.strengths?.length ?? 0) > 0 && (
                    <div className="border-2 border-emerald-700 bg-emerald-50 p-4 shadow-[3px_3px_0_0_#047857]">
                      <p className="mb-2 font-bold text-emerald-800">Strengths</p>
                      <ul className="list-inside list-disc space-y-1.5">
                        {analysis.architecture.strengths?.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(analysis.architecture.weaknesses?.length ?? 0) > 0 && (
                    <div className="border-2 border-red-700 bg-red-50 p-4 shadow-[3px_3px_0_0_#b91c1c]">
                      <p className="mb-2 font-bold text-red-700">Weaknesses</p>
                      <ul className="list-inside list-disc space-y-1.5">
                        {analysis.architecture.weaknesses?.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Section>
              )}

              {analysis.dataflow && (
                <Section title="Dataflow" delay={120}>
                  <p className="text-lg leading-relaxed text-slate-700">
                    {analysis.dataflow}
                  </p>
                </Section>
              )}

              {analysis.timeComplexity && (
                <Section title="Time Complexity" delay={120}>
                  {analysis.timeComplexity.overall && (
                    <div className="inline-block border-2 border-slate-900 bg-slate-100 px-4 py-2 font-mono text-lg text-slate-900 shadow-[3px_3px_0_0_#0f172a]">
                      {/^[a-zA-Z]/.test(analysis.timeComplexity.overall) &&
                      !analysis.timeComplexity.overall.startsWith("O(") ? (
                        analysis.timeComplexity.overall
                      ) : (
                        <span>
                          O(
                          {analysis.timeComplexity.overall.replace(
                            /^O?\(?\)?$/g,
                            ""
                          )}
                          )
                        </span>
                      )}
                    </div>
                  )}
                  {analysis.timeComplexity.breakdown &&
                    (typeof analysis.timeComplexity.breakdown === "string" ? (
                      <p>{analysis.timeComplexity.breakdown}</p>
                    ) : (
                      <ul className="list-inside list-disc space-y-1.5">
                        {Object.entries(
                          analysis.timeComplexity.breakdown
                        ).map(([fn, complexity]) => (
                          <li key={fn}>
                            <span className="font-mono text-slate-500">
                              {fn}:
                            </span>{" "}
                            {complexity}
                          </li>
                        ))}
                      </ul>
                    ))}
                  {(analysis.timeComplexity.concerns?.length ?? 0) > 0 && (
                    <ul className="list-inside list-disc space-y-1.5 text-slate-600">
                      {analysis.timeComplexity.concerns?.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  )}
                </Section>
              )}

              {analysis.missing && analysis.missing.length > 0 && (
                <Section title="What's Missing" delay={160}>
                  {analysis.missing.map((m, i) => (
                    <div
                      key={i}
                      className="border-2 border-slate-900 bg-slate-50 p-4 shadow-[3px_3px_0_0_#0f172a]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{m.item}</p>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${severityColor[m.severity]}`}
                        >
                          {m.severity}
                        </span>
                      </div>
                      {m.impact && (
                        <p className="mt-1 text-sm text-slate-500">{m.impact}</p>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {analysis.securityIssues && analysis.securityIssues.length > 0 && (
                <Section title="Security Issues" delay={160}>
                  {analysis.securityIssues.map((s, i) => (
                    <div
                      key={i}
                      className={`border-2 p-4 shadow-[3px_3px_0_0_#0f172a] ${severityColor[s.severity]}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">{s.issue}</p>
                        <span className="text-[10px] font-bold uppercase">
                          {s.severity}
                        </span>
                      </div>
                      {s.where && (
                        <p className="mt-1.5 font-mono text-xs opacity-80">
                          {s.where}
                        </p>
                      )}
                      {s.description && (
                        <p className="mt-1.5 text-sm opacity-80">
                          {s.description}
                        </p>
                      )}
                      {s.fix && (
                        <p className="mt-2.5 text-sm">
                          <span className="font-bold">Fix:</span> {s.fix}
                        </p>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {analysis.securityIssues && analysis.securityIssues.length === 0 && (
                <Section title="Security Issues" delay={160}>
                  <p className="text-lg text-slate-700">
                    No obvious security issues found.
                  </p>
                </Section>
              )}

              {vibe && (
                <Reveal delay={200}>
                  <section className="border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0_0_#0f172a] sm:p-8">
                    <BigHeading title="Vibe-Coded Check">
                      <span className={`text-lg font-bold ${vibeStyle?.text}`}>
                        {vibe.label}
                      </span>
                    </BigHeading>
                    <div className="mb-2 flex items-baseline gap-3">
                      <span
                        className={`text-6xl font-black tracking-tight ${vibeStyle?.text}`}
                      >
                        {vibe.score}
                      </span>
                      <span className="text-sm text-slate-500">/ 100</span>
                    </div>
                    <div className="mb-5 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${vibeStyle?.bar}`}
                        style={{ width: `${Math.min(100, vibe.score)}%` }}
                      />
                    </div>
                    <p className="mb-4 text-lg italic text-slate-700">
                      “{vibe.verdict}”
                    </p>
                    {vibe.evidence?.length > 0 && (
                      <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-500">
                        {vibe.evidence.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                </Reveal>
              )}

              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <Section title="Suggestions" delay={240}>
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${severityColor[s.priority]}`}
                      >
                        {s.priority}
                      </span>
                      <p className="text-slate-700">{s.suggestion}</p>
                    </div>
                  ))}
                </Section>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
