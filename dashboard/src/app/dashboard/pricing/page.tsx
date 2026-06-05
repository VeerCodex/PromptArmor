"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Check, ShieldCheck, Zap, Server, CreditCard, Sparkles } from "lucide-react";

export default function PricingPage() {
  const { subscriptionPlan, changeSubscriptionPlan } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<"Free" | "Starter" | "Pro" | null>(null);
  const [checkoutSimOpen, setCheckoutSimOpen] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const plans = [
    {
      name: "Free" as const,
      price: "$0",
      period: "forever",
      description: "Ideal for local testing and personal sandbox development.",
      scans: "10,000 scans / month",
      icon: Server,
      iconColor: "text-gray-400 bg-gray-500/10 border-gray-500/20",
      features: [
        "Jailbreak attempt scanning",
        "Prompt injection detection",
        "Standard PII scanning (Emails, Phones)",
        "Rate-limited to 10 requests / min",
        "Community forum support"
      ]
    },
    {
      name: "Starter" as const,
      price: "$49",
      period: "per month",
      description: "Perfect for early stage applications and small teams.",
      scans: "100,000 scans / month",
      icon: Zap,
      iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      popular: true,
      features: [
        "Everything in Free plan",
        "High-performance outputs scanning",
        "Advanced PII scanning (Credit Cards, Names)",
        "99.9% Uptime SLA guarantee",
        "Priority email support (under 12h)"
      ]
    },
    {
      name: "Pro" as const,
      price: "$199",
      period: "per month",
      description: "Built for scaling apps needing high-volume LLM monitoring.",
      scans: "1,000,000 scans / month",
      icon: Sparkles,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      features: [
        "Everything in Starter plan",
        "Custom Regex rules integration",
        "Dual-region failover endpoints",
        "Dedicated account security specialist",
        "24/7 Slack and phone support"
      ]
    }
  ];

  const handleSelectPlan = (planName: "Free" | "Starter" | "Pro") => {
    if (planName === subscriptionPlan) return;
    setSelectedPlan(planName);
    setCheckoutSimOpen(true);
  };

  const handleSimulatePayment = () => {
    if (!selectedPlan) return;
    setLoadingCheckout(true);
    setTimeout(() => {
      changeSubscriptionPlan(selectedPlan);
      setLoadingCheckout(false);
      setCheckoutSimOpen(false);
      setSelectedPlan(null);
    }, 1500); // 1.5s simulation delay
  };

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Pricing & Plans</h1>
        <p className="text-sm text-gray-400 mt-1">
          Scale your security inspection bounds. Switch, upgrade, or downgrade plans at any time.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = plan.name === subscriptionPlan;

          return (
            <div
              key={plan.name}
              className={`rounded-2xl border bg-gray-900/40 p-8 flex flex-col justify-between hover:border-gray-700/60 transition-all duration-200 relative shadow-xl backdrop-blur-md ${
                plan.popular ? "border-indigo-500/40 glow-indigo" : "border-gray-800"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-3xs font-extrabold uppercase px-3 py-1 rounded-full border border-indigo-400/30">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg border ${plan.iconColor}`}>
                    <plan.icon className="w-5 h-5" />
                  </div>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Active Plan
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mt-6">{plan.name}</h3>
                <p className="text-xs text-gray-400 mt-2 min-h-8">{plan.description}</p>

                <div className="flex items-baseline gap-1 mt-6 border-b border-gray-800 pb-6">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                  <span className="text-xs font-medium text-gray-500">/{plan.period}</span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Volume Capacity: <span className="text-indigo-400 font-semibold">{plan.scans}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-gray-400">
                        <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  disabled={isCurrent}
                  className={`w-full font-semibold text-xs rounded-xl py-3 px-4 transition-all duration-200 ${
                    isCurrent
                      ? "bg-gray-800 text-gray-500 border border-gray-700/30 cursor-default"
                      : plan.popular
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700/50"
                  }`}
                >
                  {isCurrent ? "Current Subscription" : `Select ${plan.name} Plan`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Payment Checkout Simulation Modal */}
      {checkoutSimOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-950/40">
              <div className="flex items-center gap-2 text-indigo-400">
                <CreditCard className="w-5 h-5" />
                <span className="font-bold text-sm text-white">Stripe Checkout Simulator</span>
              </div>
              <button
                onClick={() => setCheckoutSimOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-xs font-semibold px-2 py-1 bg-gray-800/40 hover:bg-gray-800 rounded border border-gray-800"
              >
                Cancel
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="text-center p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
                <p className="text-xs text-gray-400">Upgrading to Subscription</p>
                <h3 className="text-lg font-bold text-white mt-1">PromptArmor {selectedPlan} Tier</h3>
                <p className="text-xl font-extrabold text-indigo-400 mt-2">
                  {plans.find((p) => p.name === selectedPlan)?.price} <span className="text-2xs text-gray-500">/ mo</span>
                </p>
              </div>

              <div className="text-2xs text-gray-400 space-y-2">
                <p>
                  This modal simulates Stripe Checkout integration. In a full production build, this trigger calls Next.js API route `/api/checkout` to generate a Stripe Session, redirecting to standard Stripe pages:
                </p>
                <code className="block bg-gray-950 p-2.5 rounded border border-gray-800 font-mono text-3xs text-gray-300">
                  stripe.checkout.sessions.create(&#123; <br />
                  &nbsp;&nbsp;payment_method_types: [&apos;card&apos;], <br />
                  &nbsp;&nbsp;line_items: [&#123; price: &apos;price_id_{selectedPlan.toLowerCase()}&apos;, quantity: 1 &#125;], <br />
                  &nbsp;&nbsp;mode: &apos;subscription&apos;, <br />
                  &nbsp;&nbsp;success_url: &apos;success?session_id=...&apos;, <br />
                  &nbsp;&nbsp;cancel_url: &apos;cancel&apos; <br />
                  &#125;)
                </code>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-gray-950/40 border-t border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setCheckoutSimOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-medium rounded-lg transition-all"
              >
                Close
              </button>
              <button
                onClick={handleSimulatePayment}
                disabled={loadingCheckout}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-xs text-white font-semibold rounded-lg transition-all shadow-md shadow-emerald-600/10"
              >
                {loadingCheckout ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Simulate Payment Success</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
