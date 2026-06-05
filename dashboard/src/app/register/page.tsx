"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/utils/api";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverOffline, setServerOffline] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setServerOffline(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const apiHost = getApiUrl();
      // 1. Call Register
      const registerRes = await fetch(`${apiHost}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!registerRes.ok) {
        let errDetail = "Registration failed";
        try {
          const errData = await registerRes.json();
          errDetail = errData.detail || errDetail;
        } catch {}
        throw new Error(errDetail);
      }

      // 2. Call Login to obtain token
      const loginRes = await fetch(`${apiHost}/auth/login-json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        throw new Error("Account created, but automatic sign-in failed. Please login manually.");
      }

      const loginData = await loginRes.json();
      login(loginData.access_token, email);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.message.includes("Failed to fetch")) {
        setServerOffline(true);
        setError("Unable to reach FastAPI backend server. Ensure it is active at " + getApiUrl());
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnterDemoMode = () => {
    login("mock_jwt_token_for_promptarmor_demo_mode", email || "demo@promptarmor.com");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-gray-900/40 border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-indigo-500 fill-indigo-500/20" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
          <p className="text-xs text-gray-500 mt-1">Get developer API credentials instantly</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-3xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-550 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-lg pl-10 pr-4 py-2.5 text-xs text-gray-200 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-3xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-550 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-lg pl-10 pr-4 py-2.5 text-xs text-gray-200 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-3xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-550 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-lg pl-10 pr-4 py-2.5 text-xs text-gray-200 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-rose-500/5 border border-rose-500/15 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold text-xs rounded-lg py-3 transition-all duration-200"
          >
            {loading ? "Registering account..." : "Sign Up"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Server Offline / Simulation block */}
        {serverOffline && (
          <div className="mt-6 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
              <Sparkles className="w-4 h-4" />
              Demo Mode Option Available
            </div>
            <p className="text-3xs text-gray-400 leading-relaxed">
              No backend running? You can bypass backend connection checks to test-drive the complete dashboard frontend with simulated visual data.
            </p>
            <button
              onClick={handleEnterDemoMode}
              className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-lg transition-all"
            >
              Enter Demo Mode
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
