"use client";

import { useApp } from "@/context/AppContext";
import { ShieldAlert, ShieldCheck, Zap, Activity } from "lucide-react";

export default function Metrics() {
  const { stats } = useApp();

  const cards = [
    {
      title: "Total Scans (Today)",
      value: stats.totalScansToday.toLocaleString(),
      description: "API requests parsed & validated",
      icon: Zap,
      iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Threats Blocked (Today)",
      value: stats.threatsBlockedToday.toLocaleString(),
      description: "Critical safety overrides triggered",
      icon: ShieldAlert,
      iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Average Threat Score",
      value: `${stats.avgThreatScoreToday}%`,
      description: "Mean evaluation security rating",
      icon: ShieldCheck,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      progress: stats.avgThreatScoreToday,
    },
    {
      title: "API Gateway Status",
      value: "Operational",
      description: "Latency: ~12ms · Uptime: 99.99%",
      icon: Activity,
      iconColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        return (
          <div
            key={card.title}
            className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 flex flex-col justify-between hover:border-gray-700/50 transition-all duration-200 shadow-lg backdrop-blur-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{card.title}</p>
                <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-lg border ${card.iconColor}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              {card.progress !== undefined ? (
                <div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{card.description}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">{card.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
