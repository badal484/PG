"use client";

import Link from "next/link";
import {
  AlertTriangle, ArrowUpRight, BadgeCheck, BookOpen, Building2,
  CheckCircle, Clock, CreditCard, Gavel, Shield, TrendingDown,
  TrendingUp, Users, Wallet, XCircle,
} from "lucide-react";
import { LineChart, BarChart } from "@/components/charts/SparkChart";
import { formatInr } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────

const METRICS = [
  { label: "Active Properties", value: "248", change: "+12", up: true, icon: Building2, color: "text-blue-600 bg-blue-50" },
  { label: "Active Tenants", value: "3,841", change: "+143", up: true, icon: Users, color: "text-emerald-600 bg-emerald-50" },
  { label: "Bookings (May)", value: "312", change: "+28", up: true, icon: BookOpen, color: "text-purple-600 bg-purple-50" },
  { label: "GMV (May)", value: formatInr(38_400_000), change: "+18%", up: true, icon: Wallet, color: "text-primary bg-primary/5" },
  { label: "Open Disputes", value: "7", change: "-3", up: true, icon: Gavel, color: "text-amber-600 bg-amber-50" },
  { label: "Pending Verifications", value: "14", change: "+5", up: false, icon: Shield, color: "text-red-600 bg-red-50" },
];

const PLATFORM_HEALTH = [
  { label: "Avg occupancy rate", value: "81%", target: "80%", status: "ok" },
  { label: "Booking conversion", value: "4.2%", target: "4.0%", status: "ok" },
  { label: "KYC completion rate", value: "94%", target: "90%", status: "ok" },
  { label: "Refund SLA (≤7 days)", value: "92%", target: "95%", status: "warn" },
  { label: "Payment success rate", value: "97.1%", target: "96%", status: "ok" },
  { label: "Dispute resolution SLA", value: "78%", target: "85%", status: "warn" },
  { label: "Verified property ratio", value: "89%", target: "90%", status: "warn" },
  { label: "Owner payout SLA", value: "99%", target: "98%", status: "ok" },
];

const ACTION_QUEUES = [
  { label: "Properties pending verification", count: 14, href: "/admin/verifications", color: "text-red-600 bg-red-50 border-red-200", urgency: "high" },
  { label: "Open disputes (unresolved)", count: 7, href: "/admin/disputes", color: "text-amber-600 bg-amber-50 border-amber-200", urgency: "high" },
  { label: "Flagged users (abuse/fraud)", count: 3, href: "/admin/users", color: "text-red-600 bg-red-50 border-red-200", urgency: "high" },
  { label: "Failed payments (retry needed)", count: 18, href: "/admin/payments", color: "text-amber-600 bg-amber-50 border-amber-200", urgency: "medium" },
  { label: "Commission pending payout", count: 24, href: "/admin/payments", color: "text-slate-600 bg-slate-50 border-slate-200", urgency: "low" },
];

const RECENT_ACTIVITY = [
  { id: "a1", admin: "Ananya R.", action: "Approved property", entity: "Sunrise Boys PG", time: "5m ago", type: "success" },
  { id: "a2", admin: "Vikram S.", action: "Resolved dispute", entity: "Dispute #D-2204", time: "18m ago", type: "success" },
  { id: "a3", admin: "Ananya R.", action: "Rejected verification", entity: "Greenfields PG", time: "42m ago", type: "error" },
  { id: "a4", admin: "System", action: "Escrow released", entity: "Booking #BK-4421", time: "1h ago", type: "info" },
  { id: "a5", admin: "Vikram S.", action: "Suspended user", entity: "User #9812345678", time: "2h ago", type: "warn" },
  { id: "a6", admin: "Priya M.", action: "Manual KYC verified", entity: "Tenant Rahul M.", time: "3h ago", type: "success" },
  { id: "a7", admin: "System", action: "Failed payment flagged", entity: "Booking #BK-4398", time: "4h ago", type: "error" },
];

const REVENUE_TREND = [
  { label: "Dec", value: 28_000_000 },
  { label: "Jan", value: 31_000_000 },
  { label: "Feb", value: 29_500_000 },
  { label: "Mar", value: 34_200_000 },
  { label: "Apr", value: 36_800_000 },
  { label: "May", value: 38_400_000 },
];

const CITY_GMV = [
  { label: "BLR", value: 18_000_000 },
  { label: "MUM", value: 9_200_000 },
  { label: "HYD", value: 5_800_000 },
  { label: "PUN", value: 3_400_000 },
  { label: "CHN", value: 2_000_000 },
];

const ACTIVITY_ICONS = {
  success: <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />,
  error: <XCircle className="h-3.5 w-3.5 text-red-600" />,
  warn: <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />,
  info: <BadgeCheck className="h-3.5 w-3.5 text-blue-600" />,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Sunday, 31 May 2025 · All figures are live</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4 xl:grid-cols-6">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 grid h-8 w-8 place-items-center rounded-lg ${m.color.split(" ")[1]}`}>
              <m.icon className={`h-4 w-4 ${m.color.split(" ")[0]}`} />
            </div>
            <p className="text-2xl font-black text-slate-900 tabular-nums">{m.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{m.label}</p>
            <div className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${m.up ? "text-emerald-600" : "text-red-600"}`}>
              {m.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {m.change} vs prev month
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-slate-800">GMV trend</p>
            <span className="text-xs text-slate-400">Last 6 months</span>
          </div>
          <p className="text-2xl font-black text-accent mb-4">{formatInr(38_400_000)}<span className="text-sm font-medium text-slate-400"> /mo current</span></p>
          <LineChart data={REVENUE_TREND} height={100} showLabels showDots={false} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-slate-800">GMV by city</p>
            <span className="text-xs text-slate-400">May 2025</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Top 5 cities</p>
          <BarChart data={CITY_GMV} height={100} />
        </div>
      </div>

      {/* Two-column: health + queues */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Platform health */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <p className="font-bold text-slate-800">Platform health</p>
            <span className="text-xs text-slate-400">vs targets</span>
          </div>
          <div className="divide-y divide-slate-50">
            {PLATFORM_HEALTH.map((h) => (
              <div key={h.label} className="flex items-center justify-between px-5 py-2.5">
                <span className="text-sm text-slate-600">{h.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">target: {h.target}</span>
                  <span className={`font-bold text-sm tabular-nums ${h.status === "ok" ? "text-emerald-600" : h.status === "warn" ? "text-amber-600" : "text-red-600"}`}>
                    {h.value}
                  </span>
                  {h.status === "ok"
                    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action queues */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3">
            <p className="font-bold text-slate-800">Action queues</p>
          </div>
          <div className="divide-y divide-slate-50">
            {ACTION_QUEUES.map((q) => (
              <Link
                key={q.label}
                href={q.href}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <span className={`min-w-[2rem] rounded-lg border px-2 py-1 text-center text-sm font-black ${q.color}`}>
                    {q.count}
                  </span>
                  <span className="text-sm text-slate-600">{q.label}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-accent transition" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="font-bold text-slate-800">Recent admin activity</p>
          <Link href="/admin/audit-log" className="text-xs font-semibold text-accent hover:underline">
            View audit log →
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {RECENT_ACTIVITY.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-2.5">
              <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                a.type === "success" ? "bg-emerald-50" :
                a.type === "error" ? "bg-red-50" :
                a.type === "warn" ? "bg-amber-50" : "bg-blue-50"
              }`}>
                {ACTIVITY_ICONS[a.type as keyof typeof ACTIVITY_ICONS]}
              </div>
              <span className="w-20 shrink-0 text-xs font-semibold text-slate-500">{a.admin}</span>
              <span className="text-sm text-slate-700">{a.action}</span>
              <span className="text-sm font-medium text-slate-500">— {a.entity}</span>
              <span className="ml-auto shrink-0 text-xs text-slate-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
