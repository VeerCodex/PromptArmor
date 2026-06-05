"use client";

import { useState } from "react";
import { useApp, ThreatLog } from "@/context/AppContext";
import { ArrowUpRight, ArrowDownLeft, Shield, Filter, Search } from "lucide-react";
import clsx from "clsx";

export default function LogsTable() {
  const { threatLogs } = useApp();
  const [filterType, setFilterType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Jailbreak", "Prompt Injection", "PII", "Data Leakage", "None"];

  const filteredLogs = threatLogs.filter((log) => {
    const matchesFilter = filterType === "All" || log.threat_type === filterType;
    const matchesSearch =
      log.text_preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.threat_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
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
    if (score >= 75) return "text-rose-500 font-bold";
    if (score >= 40) return "text-amber-500 font-semibold";
    return "text-emerald-500 font-medium";
  };

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
      {/* Filtering Header */}
      <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Live Threat Logs</h2>
          <p className="text-sm text-gray-400">Real-time scan logs and threat analytics</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-950 border border-gray-800 focus:border-indigo-500 text-xs rounded-lg pl-9 pr-4 py-2 w-48 text-gray-200 outline-none transition-all"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg">
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
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-2xs font-semibold text-gray-400 bg-gray-900/20 uppercase tracking-wider">
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Direction</th>
              <th className="px-6 py-4">Payload Preview</th>
              <th className="px-6 py-4">Threat Type</th>
              <th className="px-6 py-4 text-right">Risk Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
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
                  <tr key={log.id} className="hover:bg-gray-800/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-300 font-medium">{timeStr}</div>
                      <div className="text-3xs text-gray-500 mt-0.5">{dateStr}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.direction === "input" ? (
                        <span className="inline-flex items-center gap-1 text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 text-2xs font-medium px-2 py-0.5 rounded-md">
                          <ArrowDownLeft className="w-3 h-3" />
                          Input
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-teal-400 bg-teal-500/5 border border-teal-500/10 text-2xs font-medium px-2 py-0.5 rounded-md">
                          <ArrowUpRight className="w-3 h-3" />
                          Output
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs md:max-w-md">
                      <p className="text-xs text-gray-300 font-mono truncate bg-gray-950/40 px-2 py-1 rounded border border-gray-900">
                        {log.text_preview}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold", getThreatBadge(log.threat_type))}>
                        {log.threat_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className={clsx("text-xs font-semibold", getScoreColor(log.threat_score))}>
                        {log.threat_score}/100
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-12 text-sm text-gray-500">
                  No scan logs found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
