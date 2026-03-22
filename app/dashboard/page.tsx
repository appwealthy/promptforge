"use client";

import { useState } from "react";
import ConvertForm from "@/components/ConvertForm";
import Link from "next/link";
import { Zap, Crown } from "lucide-react";

const MODELS = [
  { id: "gemini-flash", label: "Gemini Flash", badge: "Free", color: "text-emerald-400" },
  { id: "claude-haiku", label: "Claude Haiku", badge: "Pro", color: "text-orange-400" },
  { id: "gpt-4o", label: "GPT-4o", badge: "Pro", color: "text-blue-400" },
  { id: "gemini-pro", label: "Gemini Pro", badge: "Pro", color: "text-purple-400" },
];

export default function DashboardPage() {
  const [selectedModel, setSelectedModel] = useState("gemini-flash");

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <Zap size={16} className="text-slate-900" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              PromptForge
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-teal-400 font-semibold"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Model Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Crown size={16} className="text-teal-400" />
            <span className="text-sm font-semibold text-white">AI Model</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedModel === model.id
                    ? "bg-teal-500/20 border border-teal-500/40 text-white"
                    : "bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                }`}
              >
                <span className={model.color}>{model.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  model.badge === "Free"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-orange-500/15 text-orange-400"
                }`}>
                  {model.badge}
                </span>
              </button>
            ))}
          </div>
          {selectedModel !== "gemini-flash" && (
            <p className="text-xs text-slate-500 mt-2">
              Pro models require a Pro or Power plan.{" "}
              <Link href="/pricing" className="text-teal-400 hover:underline">
                Upgrade
              </Link>
            </p>
          )}
        </div>

        <ConvertForm model={selectedModel} />
      </main>
    </div>
  );
}
