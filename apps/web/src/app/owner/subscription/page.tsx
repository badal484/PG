"use client";

import { useState } from "react";
import { BadgeCheck, ChevronRight, CreditCard, Zap } from "lucide-react";
import { Badge, Button, Dialog } from "@/components/ui";
import { formatInr } from "@/lib/utils";

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    price: 0,
    period: "Free forever",
    color: "bg-slate-50 border-slate-200",
    headerColor: "bg-slate-100",
    features: [
      "1 property",
      "Up to 20 beds",
      "Basic rent tracking",
      "Tenant management",
      "Email support",
    ],
    missing: ["Finance reports", "Analytics", "Team access", "Bulk reminders", "API access"],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 2990,
    period: "per month",
    color: "bg-white border-primary ring-2 ring-primary/20",
    headerColor: "bg-primary text-white",
    features: [
      "Up to 5 properties",
      "Unlimited beds",
      "Full rent management",
      "Finance P&L reports",
      "Analytics dashboard",
      "Team access (5 staff)",
      "Bulk WhatsApp reminders",
      "Priority support",
    ],
    missing: ["API access", "White-label"],
    badge: "CURRENT PLAN",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 7990,
    period: "per month",
    color: "bg-white border-amber-200",
    headerColor: "bg-amber-50",
    features: [
      "Unlimited properties",
      "Unlimited beds",
      "All Pro features",
      "API access",
      "White-label branding",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    missing: [],
  },
];

const USAGE = [
  { label: "Properties", used: 2, limit: 5 },
  { label: "Beds managed", used: 40, limit: Infinity },
  { label: "Staff members", used: 4, limit: 5 },
  { label: "Monthly reminders sent", used: 28, limit: 100 },
];

const INVOICES = [
  { date: "01 May 2025", amount: 2990, status: "PAID", id: "INV-2025-005" },
  { date: "01 Apr 2025", amount: 2990, status: "PAID", id: "INV-2025-004" },
  { date: "01 Mar 2025", amount: 2990, status: "PAID", id: "INV-2025-003" },
  { date: "01 Feb 2025", amount: 2990, status: "PAID", id: "INV-2025-002" },
];

export default function SubscriptionPage() {
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("ENTERPRISE");

  return (
    <div className="grid gap-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black">Subscription</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage your plan, usage, and billing</p>
      </div>

      {/* Current plan banner */}
      <div className="rounded-2xl border border-primary bg-primary/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <p className="font-bold text-primary">Pro Plan — Active</p>
            </div>
            <p className="mt-1 text-sm text-text-secondary">₹2,990/month · Next billing: 01 Jun 2025</p>
            <p className="mt-0.5 text-xs text-text-tertiary">Subscribed since 01 Jan 2025 · Auto-renews monthly</p>
          </div>
          <Button size="sm" onClick={() => setUpgradeDialog(true)}>
            <Zap className="h-4 w-4" /> Upgrade
          </Button>
        </div>
      </div>

      {/* Usage */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="font-bold mb-4">Usage this month</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {USAGE.map((u) => {
            const pct = u.limit === Infinity ? 30 : Math.round((u.used / u.limit) * 100);
            const isNearLimit = pct >= 80;
            return (
              <div key={u.label}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="font-medium">{u.label}</span>
                  <span className={`font-bold ${isNearLimit ? "text-amber-600" : "text-text-primary"}`}>
                    {u.used}{u.limit !== Infinity ? ` / ${u.limit}` : " used"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${isNearLimit ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                {u.limit !== Infinity && (
                  <p className="mt-1 text-xs text-text-tertiary">{u.limit - u.used} remaining</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Plans comparison */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`rounded-2xl border overflow-hidden ${plan.color}`}>
            <div className={`px-5 py-4 ${plan.headerColor}`}>
              <div className="flex items-center justify-between">
                <p className="font-bold">{plan.name}</p>
                {plan.badge && <Badge variant="premium" className="text-xs">{plan.badge}</Badge>}
              </div>
              <p className="mt-1">
                <span className="text-2xl font-black">{plan.price === 0 ? "Free" : formatInr(plan.price)}</span>
                {plan.price > 0 && <span className="ml-1 text-xs opacity-75">{plan.period}</span>}
              </p>
            </div>
            <div className="p-5">
              <ul className="grid gap-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
                {plan.missing?.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-tertiary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.id !== "PRO" && (
                <Button
                  variant={plan.id === "ENTERPRISE" ? "primary" : "outline"}
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => { setSelectedPlan(plan.id); setUpgradeDialog(true); }}
                >
                  {plan.id === "STARTER" ? "Downgrade" : "Upgrade"} <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              {plan.id === "PRO" && (
                <button className="mt-4 w-full text-sm text-text-tertiary hover:text-text-secondary">Current plan</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Billing history */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="font-bold">Billing history</p>
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4" /> Update payment method
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Invoice</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Date</th>
              <th className="px-4 py-3 text-right font-semibold text-text-secondary">Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv) => (
              <tr key={inv.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">{inv.id}</td>
                <td className="px-4 py-3">{inv.date}</td>
                <td className="px-4 py-3 text-right font-bold">{formatInr(inv.amount)}</td>
                <td className="px-4 py-3"><Badge variant="active">Paid</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-accent hover:underline">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upgrade dialog */}
      <Dialog open={upgradeDialog} title={`Upgrade to ${selectedPlan}`} onClose={() => setUpgradeDialog(false)}>
        <div className="grid gap-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-semibold">
              {PLANS.find((p) => p.id === selectedPlan)?.name} Plan —{" "}
              {formatInr(PLANS.find((p) => p.id === selectedPlan)?.price ?? 0)}/month
            </p>
            <p className="mt-1 text-sm text-text-secondary">Billed monthly. Cancel anytime. Prorated for current month.</p>
          </div>
          <p className="text-sm text-text-secondary">
            Your credit card on file (•••• •••• •••• 4242) will be charged immediately.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setUpgradeDialog(false)}>Cancel</Button>
            <Button onClick={() => setUpgradeDialog(false)}>
              <Zap className="h-4 w-4" /> Confirm upgrade
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
