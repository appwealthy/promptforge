"use client";
import { useState } from "react";
import { Zap, Clipboard, Download, Loader2, ArrowLeft, BookOpen, FileCode, ListChecks } from "lucide-react";

interface WorkflowStep {
  step: number;
  title: string;
  instruction: string;
}

interface ConversionResult {
  source_summary: string;
  detected_platform: string;
  detected_topic: string;
  prompt_template: {
    title: string;
    description: string;
    variables: string[];
    content: string;
  };
  skill_file: {
    title: string;
    description: string;
    trigger_keywords: string;
    content: string;
  };
  workflow_guide: {
    title: string;
    description: string;
    time_estimate: string;
    difficulty: string;
    steps: WorkflowStep[];
    pro_tips: string[];
  };
}

const PROGRESS_STEPS = [
  "Extracting content from source...",
  "Identifying prompts and workflow steps...",
  "Detecting platform and tools...",
  "Generating prompt template...",
  "Building skill package...",
  "Creating workflow guide...",
];

export default function ConvertForm() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("universal");
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"prompt" | "skill" | "workflow">("prompt");

  async function handleConvert() {
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setProgressStep(0);

    // Simulate progress while API call runs
    const interval = setInterval(() => {
      setProgressStep((prev) => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platform }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setProgressStep(PROGRESS_STEPS.length);
      setTimeout(() => {
        setResult(data.result);
        setLoading(false);
      }, 400);
    } catch {
      clearInterval(interval);
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadFile(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setResult(null);
    setContent("");
    setError("");
    setProgressStep(0);
  }

  // ── RESULTS VIEW ──
  if (result) {
    return (
      <div className="animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white">Forged Tools</h2>
            <p className="text-sm text-slate-400 mt-1">{result.source_summary}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold">
              ✓ Conversion Complete
            </span>
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors">
              <ArrowLeft size={14} /> New Conversion
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-slate-900/50 p-1 rounded-lg w-fit">
          <button onClick={() => setActiveTab("prompt")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === "prompt" ? "bg-orange-500/15 text-orange-400" : "text-slate-400 hover:text-slate-300"}`}>
            <BookOpen size={14} /> Prompt Template
          </button>
          <button onClick={() => setActiveTab("skill")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === "skill" ? "bg-purple-500/15 text-purple-400" : "text-slate-400 hover:text-slate-300"}`}>
            <FileCode size={14} /> Cowork Skill
          </button>
          <button onClick={() => setActiveTab("workflow")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === "workflow" ? "bg-teal-500/15 text-teal-400" : "text-slate-400 hover:text-slate-300"}`}>
            <ListChecks size={14} /> Workflow Guide
          </button>
        </div>

        {/* Prompt Template */}
        {activeTab === "prompt" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 animate-fadeIn">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-orange-500/15 text-orange-400 mb-2">PROMPT TEMPLATE</span>
                <h3 className="text-lg font-bold text-white">{result.prompt_template.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{result.prompt_template.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(result.prompt_template.content, "prompt")} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1.5">
                  <Clipboard size={12} /> {copied === "prompt" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            {result.prompt_template.variables.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {result.prompt_template.variables.map((v) => (
                  <span key={v} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono">[{v}]</span>
                ))}
              </div>
            )}
            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
              {result.prompt_template.content}
            </pre>
          </div>
        )}

        {/* Skill File */}
        {activeTab === "skill" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 animate-fadeIn">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-purple-500/15 text-purple-400 mb-2">CLAUDE COWORK SKILL</span>
                <h3 className="text-lg font-bold text-white">{result.skill_file.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{result.skill_file.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(result.skill_file.content, "skill")} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1.5">
                  <Clipboard size={12} /> {copied === "skill" ? "Copied!" : "Copy"}
                </button>
                <button onClick={() => downloadFile("SKILL.md", result.skill_file.content)} className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5">
                  <Download size={12} /> Download .skill
                </button>
              </div>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
              {result.skill_file.content}
            </pre>
          </div>
        )}

        {/* Workflow Guide */}
        {activeTab === "workflow" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 animate-fadeIn">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-teal-500/15 text-teal-400 mb-2">WORKFLOW GUIDE</span>
                <h3 className="text-lg font-bold text-white">{result.workflow_guide.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{result.workflow_guide.description}</p>
              </div>
              <div className="flex gap-3 text-xs text-slate-500">
                <span>⏱ {result.workflow_guide.time_estimate}</span>
                <span>📊 {result.workflow_guide.difficulty}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {result.workflow_guide.steps.map((step) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{step.title}</h4>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{step.instruction}</p>
                  </div>
                </div>
              ))}
            </div>

            {result.workflow_guide.pro_tips.length > 0 && (
              <div className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-4">
                <h4 className="text-sm font-bold text-teal-400 mb-2">💡 Pro Tips</h4>
                {result.workflow_guide.pro_tips.map((tip, i) => (
                  <p key={i} className="text-sm text-slate-400 mb-1">• {tip}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── LOADING VIEW ──
  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 animate-fadeIn">
        <div className="w-12 h-12 border-3 border-slate-700 border-t-teal-500 rounded-full animate-spin mb-6" />
        <h3 className="text-lg font-bold text-white mb-2">Forging your tools...</h3>
        <p className="text-sm text-slate-400 mb-8">This usually takes 15-30 seconds</p>
        <div className="w-full max-w-md space-y-3">
          {PROGRESS_STEPS.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300 ${i < progressStep ? "text-teal-400" : i === progressStep ? "text-white" : "text-slate-600"}`}>
              <span className="w-5 font-bold">{i < progressStep ? "✓" : i === progressStep ? "●" : "○"}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── INPUT VIEW ──
  return (
    <div>
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-4">
        <h2 className="text-lg font-bold text-white mb-4">Paste your AI tip</h2>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Paste the social media post, caption, transcript, or tip here...\n\nExample: "Turn Claude Code into your Professional Designer — Use these 3 systems to up-level the design of your next project:\n\n1. Create a design-system.md file with your brand colors, fonts, and spacing rules\n2. Use a screenshot of a design you love as reference\n3. Add a 'review' step where Claude critiques its own work..."`}
          className="w-full min-h-[180px] p-4 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono leading-relaxed resize-y outline-none focus:border-teal-500/50 transition-colors placeholder:text-slate-600"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400">Target platform:</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-teal-500/50"
            >
              <option value="universal">Universal (all platforms)</option>
              <option value="claude">Claude Cowork</option>
              <option value="chatgpt">ChatGPT</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>

          <button
            onClick={handleConvert}
            disabled={!content.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900 font-bold text-sm hover:shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Zap size={16} /> Forge It
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Example cards */}
      <div className="mt-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Try an example</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "AI Designer", text: "Turn Claude Code into your Professional Designer — Use these 3 systems to up-level the design of your next project: 1. Create a design-system.md file with your brand colors, fonts, and spacing rules. 2. Use a screenshot of a design you love as reference — Claude will match the style. 3. Add a review step where Claude critiques its own work against your design system and fixes issues automatically." },
            { label: "Content Engine", text: "Here's how I turned Claude into my content engine: First, I created a content-strategy.md with my brand voice, target audience, and content pillars. Then I set up a workflow where Claude generates 10 content ideas, I pick 3, and it drafts full posts optimized for each platform (LinkedIn, X, Instagram). Finally, Claude reviews each post against my brand voice guidelines and suggests improvements." },
            { label: "Email Outreach", text: "Stop writing cold emails from scratch. Here's my Claude workflow for personalized outreach: 1. Feed it the prospect's LinkedIn profile URL 2. Tell it your product and value prop 3. It generates 3 email variations with different hooks 4. Each email has a personalization line, clear value prop, and soft CTA 5. It also creates follow-up sequences for each variation." },
          ].map((ex) => (
            <button
              key={ex.label}
              onClick={() => setContent(ex.text)}
              className="text-left p-4 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-teal-500/30 transition-colors"
            >
              <span className="text-sm font-bold text-teal-400">{ex.label}</span>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ex.text.slice(0, 80)}...</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
