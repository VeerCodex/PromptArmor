"use client";

import { useApp } from "@/context/AppContext";
import Metrics from "@/components/Metrics";
import LogsTable from "@/components/LogsTable";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";

const StatsChart = dynamic(() => import("@/components/StatsChart"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full animate-pulse bg-gray-900/40 border border-gray-800 rounded-xl p-6 flex items-center justify-center text-gray-500 text-sm">
      Loading chart data...
    </div>
  ),
});

export default function DashboardOverview() {
  const { fetchDashboardData } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    // Simulate delay for smooth UI transition
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
          <p className="text-sm text-gray-405 mt-1">
            Monitor prompt safety, injection logs, and data leakages in real-time
          </p>
        </div>

        <div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-800 hover:border-gray-700 bg-gray-900/50 hover:bg-gray-800/50 text-xs text-gray-300 font-semibold rounded-lg transition-all duration-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            Refresh Metrics
          </button>
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
