"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { ShieldAlert, Zap, PieChart as PieIcon, TrendingUp, ShieldCheck, Activity } from "lucide-react";
import clsx from "clsx";

export default function StatsChart() {
  const { stats, threatLogs } = useApp();
  const [chartView, setChartView] = useState<"trend" | "distribution">("trend");

  // Format 7-Day Trend data
  const formattedData = stats.chartData.map((item) => {
    try {
      const parts = item.date.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return {
          ...item,
          displayDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        };
      }
    } catch (e) {}
    return { ...item, displayDate: item.date };
  });

  // Calculate Threat Vector Distribution
  const vectorCounts: Record<string, number> = {
    "Jailbreaks": 0,
    "Prompt Injections": 0,
    "PII Leaks": 0,
    "Data Leakage": 0,
    "Clean Scans": 0,
  };

  if (threatLogs.length > 0) {
    threatLogs.forEach((log) => {
      if (log.threat_type === "Jailbreak") vectorCounts["Jailbreaks"]++;
      else if (log.threat_type === "Prompt Injection") vectorCounts["Prompt Injections"]++;
      else if (log.threat_type === "PII" || log.threat_type === "PII Leakage") vectorCounts["PII Leaks"]++;
      else if (log.threat_type === "Data Leakage") vectorCounts["Data Leakage"]++;
      else vectorCounts["Clean Scans"]++;
    });
  } else {
    // Default fallback baseline distribution
    vectorCounts["Jailbreaks"] = 12;
    vectorCounts["Prompt Injections"] = 8;
    vectorCounts["PII Leaks"] = 15;
    vectorCounts["Data Leakage"] = 6;
    vectorCounts["Clean Scans"] = 65;
  }

  const distributionData = [
    { name: "Clean Scans", value: vectorCounts["Clean Scans"], color: "#10b981" },
    { name: "Jailbreaks", value: vectorCounts["Jailbreaks"], color: "#f43f5e" },
    { name: "Prompt Injections", value: vectorCounts["Prompt Injections"], color: "#f59e0b" },
    { name: "PII Leaks", value: vectorCounts["PII Leaks"], color: "#eab308" },
    { name: "Data Leakage", value: vectorCounts["Data Leakage"], color: "#a855f7" },
  ].filter((item) => item.value > 0);

  const CustomTrendTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 border border-gray-800 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-xs font-semibold text-gray-400 mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center gap-2 text-xs text-indigo-400">
              <Zap className="w-3.5 h-3.5 fill-indigo-400/20" />
              <span>Total API Scans: <strong>{payload[0].value}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5 fill-rose-400/20" />
              <span>Blocked Threats: <strong>{payload[1].value}</strong></span>
            </div>
            <div className="text-3xs text-gray-500 pt-1 border-t border-gray-800">
              Avg Threat Score: {payload[0].payload.avg_score}%
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 border border-gray-800 px-3.5 py-2.5 rounded-xl shadow-xl backdrop-blur-md text-xs">
          <div className="flex items-center gap-2 font-medium" style={{ color: payload[0].payload.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
            <span>{payload[0].name}: <strong>{payload[0].value} events</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-md glow-indigo space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Security Intelligence & Threat Trends
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time payload inspection frequencies and attack vector distributions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setChartView("trend")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              chartView === "trend"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            7-Day Activity
          </button>
          <button
            onClick={() => setChartView("distribution")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              chartView === "distribution"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Vector Breakdown
          </button>
        </div>
      </div>

      {/* Chart Visualization Body */}
      <div className="h-80 w-full">
        {chartView === "trend" ? (
          formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorScans)"
                />
                <Area
                  type="monotone"
                  dataKey="threats"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorThreats)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs">
              No trend history available.
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 h-full items-center">
            <div className="md:col-span-7 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0b0f19" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Distribution Legend List */}
            <div className="md:col-span-5 space-y-2.5 pl-4 border-l border-gray-800">
              <h3 className="text-3xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Attack Category Split
              </h3>
              {distributionData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-300 font-medium">{entry.name}</span>
                  </div>
                  <span className="font-mono font-bold text-gray-200">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
