import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="fixed top-[-300px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.08)_0%,transparent_70%)]" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[rgba(2,6,23,0.8)] backdrop-blur-xl border-b border-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-2.5 font-extrabold text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center text-sm">
            <Zap size={16} className="text-white" />
          </div>
          PromptForge
        </div>
        <Link href="/dashboard" className="px-5 py-2.5 rounded-lg bg-teal-500 text-slate-900 font-bold text-sm hover:bg-teal-400 transition-colors">
          Open App
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold mb-7">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          Now in Beta — Try It Free
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] max-w-3xl mb-6">
          Turn AI Tips Into{" "}
          <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
            One-Click Tools
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed">
          Stop saving AI tutorials you&apos;ll never use. PromptForge converts social media tips into
          ready-to-install prompts, workflows, and tools.
        </p>

        <Link
          href="/dashboard"
          className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900 font-bold text-lg hover:shadow-xl hover:shadow-teal-500/20 hover:-translate-y-1 transition-all"
        >
          Start Forging — It&apos;s Free
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        <p className="text-sm text-slate-500 mt-4">No sign-up required for your first 5 conversions</p>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-extrabold text-center mb-12">
          Three steps. <span className="text-teal-400">Zero coding.</span>
        </h2>

        <div className="space-y-6">
          {[
            {
              num: "1",
              title: "Paste your AI tip",
              desc: "Found an AI workflow on Instagram, TikTok, YouTube, or X? Paste the text, caption, or transcript into PromptForge.",
              color: "from-teal-500 to-teal-600",
            },
            {
              num: "2",
              title: "We forge your tools",
              desc: "Our AI engine identifies every prompt, workflow step, and tool reference — then packages them into clean, standardized formats.",
              color: "from-orange-500 to-orange-600",
            },
            {
              num: "3",
              title: "Copy, download, install",
              desc: "Get a prompt template, a Claude Cowork skill file, and a step-by-step workflow guide. Use them anywhere.",
              color: "from-purple-500 to-purple-600",
            },
          ].map((step) => (
            <div key={step.num} className="flex gap-5 items-start p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-xl font-black`}>
                {step.num}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-500 text-slate-900 font-bold hover:bg-teal-400 transition-colors"
          >
            <Zap size={16} /> Try It Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        &copy; 2026 PromptForge. Built with ambition.
      </footer>
    </div>
  );
}
