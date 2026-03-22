"use client";

import { useState } from "react";
import { Check, Crown, Rocket, Users, Zap } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    icon: Zap,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Get started with AI-powered workflow tools",
    features: [
      "5 forges per day",
      "Gemini Flash model",
      "Prompt templates",
      "Skill file generation",
      "Basic tool recommendations",
    ],
    cta: "Start Free",
    ctaLink: "/dashboard",
    highlighted: false,
    gradient: "from-slate-800 to-slate-900",
    badge: null,
  },
  {
    name: "Pro",
    icon: Rocket,
    monthlyPrice: 20,
    yearlyPrice: 192,
    description: "Unlock all AI models and unlimited forging",
    features: [
      "Unlimited forges",
      "All 3 AI providers (Claude, GPT-4o, Gemini)",
      "Choose your AI model",
      "Auto AI tool recommendations",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    plan: "pro",
    highlighted: true,
    gradient: "from-teal-600 to-teal-700",
    badge: "Most Popular",
  },
  {
    name: "Power",
    icon: Crown,
    monthlyPrice: 35,
    yearlyPrice: 336,
    description: "For teams and power users who need it all",
    features: [
      "Everything in Pro",
      "Priority processing (fastest)",
      "Saved workflows library",
      "Team sharing & collaboration",
      "Custom branding (coming soon)",
    ],
    cta: "Go Power",
    plan: "power",
    highlighted: false,
    gradient: "from-purple-600 to-purple-700",
    badge: null,
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(plan: string) {
    setLoading(plan);
    try {
      const suffix = yearly ? "_yearly" : "";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan + suffix }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

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
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-teal-400 font-semibold"
            >
              Pricing
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          Turn any AI tip into ready-to-use tools. Pick the plan that fits your
          workflow.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-semibold ${!yearly ? "text-white" : "text-slate-500"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            className={`relative w-14 h-7 rounded-full transition-colors ${yearly ? "bg-teal-500" : "bg-slate-700"}`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${yearly ? "left-8" : "left-1"}`}
            />
          </button>
          <span
            className={`text-sm font-semibold ${yearly ? "text-white" : "text-slate-500"}`}
          >
            Yearly
          </span>
          {yearly && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-500/15 text-teal-400">
              Save 20%
            </span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const period = yearly ? "/year" : "/month";
          const isLoading = loading === plan.plan;

          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.highlighted
                  ? "border-teal-500/40 bg-slate-900/80 shadow-lg shadow-teal-500/5"
                  : "border-slate-800 bg-slate-900/40"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-teal-500 text-slate-900 text-xs font-bold">
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}
                >
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              </div>

              <p className="text-sm text-slate-400 mb-6">{plan.description}</p>

              <div className="mb-6">
                {price === 0 ? (
                  <div className="text-3xl font-extrabold text-white">Free</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      ${yearly ? Math.round(price / 12) : price}
                    </span>
                    <span className="text-slate-500 text-sm">/month</span>
                    {yearly && (
                      <span className="text-xs text-slate-500 ml-1">
                        (${price}{period})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <Check
                      size={16}
                      className={`flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-teal-400" : "text-slate-500"}`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.plan ? (
                <button
                  onClick={() => handleCheckout(plan.plan!)}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900 hover:shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5"
                      : "bg-slate-800 text-white hover:bg-slate-700"
                  } disabled:opacity-50`}
                >
                  {isLoading ? "Redirecting..." : plan.cta}
                </button>
              ) : (
                <Link
                  href={plan.ctaLink || "/dashboard"}
                  className="w-full py-3 rounded-lg font-bold text-sm bg-slate-800 text-white hover:bg-slate-700 transition-colors text-center block"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ / Features grid */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="border-t border-slate-800 pt-12">
          <h2 className="text-xl font-bold text-white text-center mb-8">
            All plans include
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Prompt templates",
              "Skill file generation",
              "Workflow guides",
              "URL content extraction",
              "AI tool recommendations",
              "One-click copy & download",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 text-sm text-slate-400"
              >
                <Check size={14} className="text-teal-500" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
