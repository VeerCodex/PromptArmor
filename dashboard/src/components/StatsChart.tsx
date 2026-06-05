"use client";

import { useApp } from "@/context/AppContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShieldAlert, Zap } from "lucide-react";

export default function StatsChart() {
  const { stats } = useApp();

  const formattedData = stats.chartData.map((item) => {
    // Format date string from YYYY-MM-DD to "MMM DD"
    try {
      const parts = item.date.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return {
          ...item,
          displayDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        };
      }
    } catch (e) {
       // fallback
    }
    return { ...item, displayDate: item.date };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 border border-gray-800 p-4 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-gray-400 mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-indigo-400">
              <Zap className="w-3.5 h-3.5 fill-indigo-400/20" />
              <span>Scans: <strong>{payload[0].value}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5 fill-rose-400/20" />
              <span>Threats: <strong>{payload[1].value}</strong></span>
            </div>
            <div className="text-xs text-gray-500 pt-1 border-t border-gray-800">
              Avg Threat Score: {payload[0].payload.avg_score}%
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 shadow-lg backdrop-blur-md glow-indigo">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Threat Activity Log</h2>
          <p className="text-sm text-gray-400">Security event frequency over the last 7 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Total API Scans
          </div>
          <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Blocked Threats
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
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
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Insufficient log history to build chart data.
          </div>
        )}
      </div>
    </div>
  );
}
