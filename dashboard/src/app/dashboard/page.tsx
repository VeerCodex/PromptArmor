"use client";

import { useApp } from "@/context/AppContext";
import Metrics from "@/components/Metrics";
import LogsTable from "@/components/LogsTable";
import { RefreshCw, Terminal, ArrowRight, ShieldCheck, Zap, Lock, Code2 } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const StatsChart = dynamic(() => import("@/components/StatsChart"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full animate-pulse bg-gray-900/40 border border-gray-800 rounded-xl p-6 flex items-center justify-center text-gray-500 text-sm">
      Loading analytics engine...
    </div>
  ),
});

export default function DashboardOverview() {
  const { fetchDashboardData, subscriptionPlan } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2">
            Security Overview
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time LLM prompt injection telemetry, PII sanitization logs, and output leak defense.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-800 hover:border-gray-700 bg-gray-900/50 hover:bg-gray-800/50 text-xs text-gray-300 font-semibold rounded-xl transition-all duration-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* Quick Launch Playground Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-gray-900/40 p-6 shadow-xl backdrop-blur-md">
        <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-3xs font-extrabold uppercase tracking-widest text-indigo-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Active Shield Engine · Sub-15ms Inspection
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Test Prompt Injections & DAN Jailbreaks in Real Time
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Use our live Security Playground to evaluate attack payloads, inspect sanitized text previews, and check risk score distributions before deploying your agent.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/dashboard/playground"
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              <Terminal className="w-4 h-4" />
              Open Playground
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard/quickstart"
              className="flex items-center gap-2 px-4 py-3 border border-gray-800 hover:border-gray-700 bg-gray-900/60 text-xs font-semibold text-gray-300 hover:text-white rounded-xl transition-all"
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              SDK Setup
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <Metrics />

      {/* Analytics Chart */}
      <StatsChart />

      {/* Live Threat Logs Table */}
      <LogsTable />
    </>
  );
}
