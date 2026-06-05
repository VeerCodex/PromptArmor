"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { User, ShieldAlert, Key, Globe, Check, AlertCircle } from "lucide-react";
import { getApiUrl } from "@/utils/api";

export default function SettingsPage() {
  const { userEmail } = useApp();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiUrlVal, setApiUrlVal] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [apiUrlSaved, setApiUrlSaved] = useState(false);

  // Load active API endpoint
  useEffect(() => {
    setApiUrlVal(getApiUrl());
  }, []);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setLoadingPass(true);
    // Simulate API request to backend auth update
    setTimeout(() => {
      setLoadingPass(false);
      setPassMessage({ type: "success", text: "Password updated successfully!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1200);
  };

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiUrlVal.trim()) return;
    localStorage.setItem("NEXT_PUBLIC_API_URL", apiUrlVal.trim());
    setApiUrlSaved(true);
    setTimeout(() => setApiUrlSaved(false), 2000);
  };

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Platform Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure security settings, adjust API integration endpoints, and edit your profile credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: General Profile / Security Preference */}
        <div className="space-y-8">
          {/* API Server Endpoint Settings */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 shadow-lg backdrop-blur-md">
            <h2 className="text-md font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-indigo-400" />
              API Gateway Target
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Configure the host URL for PromptArmor security API calls.
            </p>
            <form onSubmit={handleSaveApiUrl} className="space-y-4">
              <div>
                <label className="block text-3xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Server Endpoint Address
                </label>
                <input
                  type="url"
                  value={apiUrlVal}
                  onChange={(e) => setApiUrlVal(e.target.value)}
                  placeholder="http://localhost:8000"
                  required
                  className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2 text-xs font-mono text-gray-200 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold rounded-lg transition-all"
              >
                {apiUrlSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Saved Host Endpoint
                  </>
                ) : (
                  "Update Host URL"
                )}
              </button>
            </form>
          </div>

          {/* Webhook Notifications */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 shadow-lg backdrop-blur-md">
            <h2 className="text-md font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" />
              Real-time Alert Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800/40 pb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-200">Email Notifications</p>
                  <p className="text-3xs text-gray-500 mt-1">Receive alerts when critical jailbreak threat levels surpass 80%</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded bg-gray-950 border-gray-800 accent-indigo-500" />
              </div>
              <div className="flex items-center justify-between border-b border-gray-800/40 pb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-200">PII Leaks Prevention</p>
                  <p className="text-3xs text-gray-500 mt-1">Instantly redact PII (emails, cards) inside scan logs database</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded bg-gray-950 border-gray-800 accent-indigo-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-200">Automatic Webhook Payload Retry</p>
                  <p className="text-3xs text-gray-500 mt-1">Automatically retry sending logs to security dashboard on network loss</p>
                </div>
                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded bg-gray-950 border-gray-800 accent-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Security Credentials Update */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 shadow-lg backdrop-blur-md">
          <h2 className="text-md font-bold text-white mb-4 flex items-center gap-2">
            <Key className="w-4.5 h-4.5 text-indigo-400" />
            Security & Password
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Modify credentials to log in to the PromptArmor dashboard. Active user: <strong className="text-gray-300 font-semibold">{userEmail}</strong>
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-3xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2 text-xs text-gray-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-3xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2 text-xs text-gray-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-3xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2 text-xs text-gray-200 outline-none transition-all"
              />
            </div>

            {passMessage && (
              <div className={`p-3.5 rounded-lg flex items-start gap-2.5 text-xs ${
                passMessage.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}>
                {passMessage.type === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                <span>{passMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingPass}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold text-xs rounded-lg px-4 py-2.5 transition-all duration-200"
            >
              {loadingPass ? "Updating Password..." : "Change Account Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
