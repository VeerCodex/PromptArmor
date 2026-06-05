"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Key, Copy, Check, Eye, EyeOff, Trash2, ShieldAlert, Plus } from "lucide-react";

export default function ApiKeysPage() {
  const { apiKeys, createApiKey, revokeApiKey } = useApp();
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<number, boolean>>({});
  const [generating, setGenerating] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      setGenerating(true);
      await createApiKey(newKeyName.trim());
      setNewKeyName("");
    } catch (err) {
      alert("Failed to generate API Key");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (id: number, keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleReveal = (id: number) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRevoke = async (id: number) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using it will immediately lose access.")) {
      return;
    }
    try {
      setRevokingId(id);
      await revokeApiKey(id);
    } catch (err) {
      alert("Failed to revoke API key");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">API Keys</h1>
        <p className="text-sm text-gray-400 mt-1">
          Generate and manage secure credentials to connect your Python and Node.js SDK integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* API Key Generation Form */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 shadow-lg backdrop-blur-md">
          <h2 className="text-md font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            Generate New Key
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="key-name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Key Identifier Name
              </label>
              <input
                id="key-name"
                type="text"
                placeholder="e.g. Production Server Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-gray-200 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={generating}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-all duration-200 shadow-md shadow-indigo-600/10"
            >
              {generating ? "Generating..." : "Generate API Key"}
            </button>
          </form>
        </div>

        {/* Existing Keys Table */}
        <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-md font-bold text-white">Active Credentials</h2>
            <p className="text-xs text-gray-400 mt-1">
              Active security tokens authorized to query security scanning endpoints.
            </p>
          </div>

          <div className="divide-y divide-gray-800/60">
            {apiKeys.length > 0 ? (
              apiKeys.map((apiKey) => {
                const isRevealed = !!revealedKeys[apiKey.id];
                const isCopied = copiedKeyId === apiKey.id;
                const isRevoking = revokingId === apiKey.id;

                return (
                  <div key={apiKey.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-800/5 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-200">{apiKey.name}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </div>

                      {/* Secret key viewer block */}
                      <div className="flex items-center gap-2 bg-gray-950 px-3 py-2 rounded-lg border border-gray-900 font-mono text-xs max-w-md w-full">
                        <Key className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="text-gray-300 select-all truncate flex-1">
                          {isRevealed ? apiKey.key : `${apiKey.key.slice(0, 6)}••••••••••••••••••••••••`}
                        </span>
                        
                        <button
                          onClick={() => toggleReveal(apiKey.id)}
                          className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                          title={isRevealed ? "Hide Key" : "Show Key"}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleCopy(apiKey.id, apiKey.key)}
                          className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                          title="Copy to Clipboard"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="text-3xs text-gray-500">
                        Generated on {new Date(apiKey.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => handleRevoke(apiKey.id)}
                        disabled={isRevoking}
                        className="flex items-center justify-center gap-2 px-3 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-semibold rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revoke Key
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <ShieldAlert className="w-8 h-8 text-gray-600" />
                <p>No API Keys found.</p>
                <p className="text-xs text-gray-600">Create a named token to begin integrating SDKs.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
