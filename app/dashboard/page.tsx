import ConvertForm from "@/components/ConvertForm";
import Link from "next/link";
import { Zap, Hammer } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-[rgba(2,6,23,0.9)] backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center text-sm">
              <Zap size={16} className="text-white" />
            </div>
            PromptForge
          </Link>

          <div className="flex items-center gap-2 text-sm">
            <Hammer size={14} className="text-teal-400" />
            <span className="text-slate-400">Forge a New Tool</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <ConvertForm />
      </main>
    </div>
  );
}
