"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Check, ShieldCheck, Zap, Server, CreditCard, Sparkles } from "lucide-react";
import { getApiUrl, getAuthToken } from "@/utils/api";

export default function PricingPage() {
  const { subscriptionPlan, changeSubscriptionPlan } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<"Free" | "Starter" | "Pro" | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

  const handleSelectPlan = async (planName: "Free" | "Starter" | "Pro") => {
    if (planName === subscriptionPlan) return;

    if (planName === "Free") {
      try {
        await changeSubscriptionPlan("Free");
      } catch (err) {
        console.error(err);
      }
      return;
    }

    setLoadingCheckout(true);
    setSelectedPlan(planName);

    try {
      const apiHost = getApiUrl();
      const token = getAuthToken();

      const res = await fetch(`${apiHost}/billing/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planName }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create payment order");
      }

      const orderData = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mockKey12345",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PromptArmor Security",
        description: `${planName} Subscription Upgrade`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            setLoadingCheckout(true);
            const verifyRes = await fetch(`${apiHost}/billing/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: planName
              }),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed.");
            }

            changeSubscriptionPlan(planName);
            alert(`Successfully upgraded to ${planName} Plan!`);
          } catch (err: any) {
            alert(err.message || "Payment verification failed.");
          } finally {
            setLoadingCheckout(false);
            setSelectedPlan(null);
          }
        },
        prefill: {
          email: localStorage.getItem("promptarmor_user_email") || "",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            setLoadingCheckout(false);
            setSelectedPlan(null);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Checkout failed to initialize.");
      setLoadingCheckout(false);
      setSelectedPlan(null);
    }
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

      {/* Razorpay Checkout completes natively without overlay simulation */}
    </>
  );
}
