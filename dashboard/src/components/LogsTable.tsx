"use client";

import { useState } from "react";
import { useApp, ThreatLog } from "@/context/AppContext";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Search,
  Download,
  FileSpreadsheet,
  FileCode,
  X,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Eye,
  AlertTriangle
} from "lucide-react";
import clsx from "clsx";

export default function LogsTable() {
  const { threatLogs, exportLogs } = useApp();
  const [filterType, setFilterType] = useState<string>("All");
  const [directionFilter, setDirectionFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<ThreatLog | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const categories = ["All", "Jailbreak", "Prompt Injection", "PII", "Data Leakage", "None"];

  const filteredLogs = threatLogs.filter((log) => {
    const matchesFilter = filterType === "All" || log.threat_type === filterType;
    const matchesDirection = directionFilter === "All" || log.direction === directionFilter.toLowerCase();
    const matchesSearch =
      log.text_preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.threat_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesDirection && matchesSearch;
  });

  const getThreatBadge = (type: string) => {
    switch (type) {
      case "Jailbreak":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "Prompt Injection":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "PII":
      case "PII Leakage":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "Data Leakage":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-rose-400 font-bold";
    if (score >= 40) return "text-amber-400 font-semibold";
    return "text-emerald-400 font-medium";
  };

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <>
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        {/* Filtering & Export Header */}
        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              Live Threat Audit Logs
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Click any log row to open deep inspection diagnostics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search payloads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-950 border border-gray-800 focus:border-indigo-500 text-xs rounded-xl pl-8 pr-3 py-2 w-44 text-gray-200 outline-none transition-all"
              />
            </div>

            {/* Filter Direction */}
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="All">All Directions</option>
              <option value="Input">Input</option>
              <option value="Output">Output</option>
            </select>

            {/* Filter Category */}
            <div className="flex items-center gap-1.5 bg-gray-950 border border-gray-800 px-3 py-2 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-950 text-gray-300">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-1.5 border-l border-gray-800 pl-3">
              <button
                onClick={() => exportLogs("csv")}
                title="Export Logs as CSV"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-950 hover:bg-gray-850 border border-gray-800 text-xs text-gray-300 font-medium transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                CSV
              </button>
              <button
                onClick={() => exportLogs("json")}
                title="Export Logs as JSON"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-950 hover:bg-gray-850 border border-gray-800 text-xs text-gray-300 font-medium transition-all"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-3xs font-bold text-gray-400 bg-gray-900/30 uppercase tracking-wider">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Flow</th>
                <th className="px-6 py-4">Payload Preview</th>
                <th className="px-6 py-4">Threat Type</th>
                <th className="px-6 py-4 text-right">Risk Score</th>
                <th className="px-6 py-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const date = new Date(log.created_at);
                  const timeStr = date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  const dateStr = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-gray-800/20 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-200 font-medium">{timeStr}</div>
                        <div className="text-3xs text-gray-500 font-sans mt-0.5">{dateStr}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.direction === "input" ? (
                          <span className="inline-flex items-center gap-1 text-indigo-400 bg-indigo-500/5 border border-indigo-500/15 text-3xs font-bold px-2 py-0.5 rounded-md uppercase">
                            <ArrowDownLeft className="w-3 h-3" />
                            Input
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-teal-400 bg-teal-500/5 border border-teal-500/15 text-3xs font-bold px-2 py-0.5 rounded-md uppercase">
                            <ArrowUpRight className="w-3 h-3" />
                            Output
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs md:max-w-md">
                        <p className="text-xs text-gray-300 truncate bg-gray-950/60 px-2.5 py-1.5 rounded-lg border border-gray-900 group-hover:border-gray-800 transition-colors">
                          {log.text_preview}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-sans">
                        <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-3xs font-bold uppercase", getThreatBadge(log.threat_type))}>
                          {log.threat_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className={clsx("text-xs font-bold", getScoreColor(log.threat_score))}>
                          {log.threat_score}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="p-1.5 rounded-lg bg-gray-950 hover:bg-indigo-600/20 text-gray-400 hover:text-indigo-300 border border-gray-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-xs text-gray-500 font-sans">
                    No scan logs matching selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Threat Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-400" />
                  Threat Log Inspector
                </h3>
                <p className="text-3xs text-gray-400 font-mono mt-0.5">
                  ID: #{selectedLog.id} · Timestamp: {new Date(selectedLog.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score & Direction Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800">
                <span className="text-3xs font-bold text-gray-500 uppercase">Direction</span>
                <p className="text-xs font-bold text-white mt-1 uppercase">{selectedLog.direction}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800">
                <span className="text-3xs font-bold text-gray-500 uppercase">Threat Classification</span>
                <p className="text-xs font-bold text-indigo-400 mt-1">{selectedLog.threat_type}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 col-span-2 sm:col-span-1">
                <span className="text-3xs font-bold text-gray-500 uppercase">Threat Score</span>
                <p className={clsx("text-lg font-extrabold mt-0.5", getScoreColor(selectedLog.threat_score))}>
                  {selectedLog.threat_score}/100
                </p>
              </div>
            </div>

            {/* Full Payload Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-bold text-gray-400 uppercase tracking-wider">
                  Inspected Payload String:
                </span>
                <button
                  onClick={() => handleCopyPayload(selectedLog.text_preview)}
                  className="text-3xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedPayload ? "Copied" : "Copy Payload"}
                </button>
              </div>
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs text-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                {selectedLog.text_preview}
              </div>
            </div>

            {/* Findings Details */}
            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
              <div className="space-y-2">
                <span className="text-3xs font-bold text-gray-400 uppercase tracking-wider">
                  Engine Detection Findings:
                </span>
                <pre className="p-4 rounded-xl bg-gray-950 border border-gray-800 font-mono text-3xs text-gray-300 overflow-x-auto max-h-40">
                  <code>{JSON.stringify(selectedLog.details, null, 2)}</code>
                </pre>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
