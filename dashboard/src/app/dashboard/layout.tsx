"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // will redirect in useEffect
  }

  return (
    <div className="flex bg-gray-950 min-h-screen">
      {/* Side Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-gray-900/10 backdrop-blur-md">
          <h1 className="text-sm font-semibold text-gray-300">Developer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">FastAPI Endpoint Connected</span>
          </div>
        </header>

        {/* Dashboard Pages */}
        <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
