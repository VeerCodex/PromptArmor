"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Shield, LayoutDashboard, Key, CreditCard, Settings, LogOut, User } from "lucide-react";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();
  const { userEmail, logout, subscriptionPlan } = useApp();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "API Keys", href: "/dashboard/keys", icon: Key },
    { name: "Pricing & Plans", href: "/dashboard/pricing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-900/40 backdrop-blur-md flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800 gap-2">
        <Shield className="w-6 h-6 text-indigo-500 fill-indigo-500/20" />
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
          PromptArmor
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/40">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-9 h-9 rounded-full bg-indigo-900/50 border border-indigo-700/30 flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-200 truncate">{userEmail || "Developer"}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
              {subscriptionPlan} Plan
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 mt-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
