import Link from "next/link";
import { Shield, Zap, Lock, BarChart3, ChevronRight, Play, Eye } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-gray-950 text-gray-100 min-h-screen relative overflow-hidden flex flex-col justify-between">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="h-20 border-b border-gray-900/60 flex items-center justify-between px-8 max-w-7xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-indigo-500 fill-indigo-500/20" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            PromptArmor
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-gray-400 hover:text-gray-200 transition-colors">
            Sign In
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white rounded-lg transition-all shadow-md shadow-indigo-600/15"
          >
            Get Started
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl w-full mx-auto px-8 py-20 lg:py-28 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-3xs font-extrabold uppercase tracking-widest text-indigo-400">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          PromptArmor v1.0.0 Released
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Secure your LLMs against <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            Prompt Injection & Leakage
          </span>
        </h1>

        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Production-grade SDKs and real-time dashboard monitoring to parse prompt injection attacks, scrub PII leaks, and block jailbreak overrides in milliseconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white rounded-xl transition-all shadow-lg shadow-indigo-600/15"
          >
            <Play className="w-4 h-4 fill-white" />
            Start Scanning Free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border border-gray-800 hover:border-gray-700 bg-gray-900/40 hover:bg-gray-800/40 text-sm font-bold text-gray-300 rounded-xl transition-all"
          >
            <Eye className="w-4 h-4" />
            Access Dashboard
          </Link>
        </div>

        {/* Integration Preview snippet block */}
        <div className="max-w-3xl w-full mx-auto bg-gray-900/60 border border-gray-850 rounded-2xl p-6 font-mono text-left text-xs shadow-2xl glass-panel relative mt-16 group">
          <div className="absolute -inset-px bg-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-center gap-1.5 mb-4 border-b border-gray-800 pb-3">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-3xs font-semibold text-gray-500 ml-2">python-sdk-quickstart.py</span>
          </div>
          <pre className="text-gray-300 space-y-1 overflow-x-auto">
            <code>
              <span className="text-indigo-400 font-medium">from</span> promptarmor <span className="text-indigo-400 font-medium">import</span> Shield <br />
              <br />
              shield = Shield(api_key=<span className="text-emerald-400">&quot;pa_live_d81a9f...&quot;</span>) <br />
              <br />
              <span className="text-gray-500"># Evaluate incoming user chat prompts</span><br />
              scan = shield.scan_input(user_message) <br />
              <span className="text-indigo-400 font-medium">if</span> scan[<span className="text-emerald-400">&quot;threat_score&quot;</span>] &gt;= <span className="text-amber-400">75</span>: <br />
              &nbsp;&nbsp;&nbsp;&nbsp;raise SecurityException(<span className="text-emerald-400">&quot;Prompt injection blocked!&quot;</span>) <br />
            </code>
          </pre>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-gray-900 max-w-7xl w-full mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-4 gap-8 z-10 relative bg-gray-950/20">
        <div className="space-y-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-200 text-sm">Ultra-Low Latency</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            FastAPI and Redis optimizations guarantee scans execute in under 15ms. Zero integration lag.
          </p>
        </div>

        <div className="space-y-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-200 text-sm">PII Leakage Shield</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Scans outputs and inputs for names, credit cards, emails, and AWS keys before they leave system scope.
          </p>
        </div>

        <div className="space-y-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-200 text-sm">Anti-Jailbreak</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Checks system overrides, instruction injections, DAN prompts, base64 hacks, and hidden markdown instructions.
          </p>
        </div>

        <div className="space-y-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-200 text-sm">Audited Analytics</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Trace log histories, query rates, threat charts, and manage API authorization credentials from one portal.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900/60 py-8 text-center text-xs text-gray-500 relative z-10 max-w-7xl w-full mx-auto">
        &copy; {new Date().getFullYear()} PromptArmor Security Technologies. All rights reserved.
      </footer>
    </div>
  );
}
