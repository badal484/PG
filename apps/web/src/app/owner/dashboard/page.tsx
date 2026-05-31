"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BedDouble, Bell, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { Badge, Button, Skeleton } from "@/components/ui";
import { LineChart, BarChart } from "@/components/charts/SparkChart";
import { formatInr } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────

const METRICS = [
  {
    label: "This month's profit",
    value: formatInr(94500),
    change: "+12%",
    up: true,
    sub: "vs ₹84,300 last month",
    color: "text-success",
    bg: "bg-emerald-50",
  },
  {
    label: "Occupancy",
    value: "83%",
    change: "+5%",
    up: true,
    sub: "32 / 40 beds occupied",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Rent pending",
    value: formatInr(28400),
    change: "8 tenants",
    up: false,
    sub: "Due this month",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Open complaints",
    value: "4",
    change: "-2",
    up: true,
    sub: "vs 6 last week",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

const REVENUE_DATA = [
  { label: "Dec", value: 185000 },
  { label: "Jan", value: 192000 },
  { label: "Feb", value: 178000 },
  { label: "Mar", value: 205000 },
  { label: "Apr", value: 198000 },
  { label: "May", value: 213500 },
];

const PROPERTIES = [
  { id: "prop-sunrise", name: "Sunrise Boys PG", locality: "Koramangala", beds: 24, occupied: 20, rentCollected: formatInr(163200), complaints: 2, occupancy: 83 },
  { id: "prop-green", name: "Green Valley PG", locality: "HSR Layout", beds: 16, occupied: 12, rentCollected: formatInr(102000), complaints: 2, occupancy: 75 },
];

const ACTIVITY = [
  { id: "a1", type: "booking", icon: BedDouble, text: "Karan S. booked Bed A · Room 301 at Sunrise PG", time: "2h ago", color: "text-blue-600 bg-blue-50" },
  { id: "a2", type: "payment", icon: TrendingUp, text: "Rahul M. paid ₹10,200 rent for May 2025", time: "4h ago", color: "text-success bg-emerald-50" },
  { id: "a3", type: "complaint", icon: Bell, text: "New complaint: WiFi down · Room 201 · Sunrise PG", time: "6h ago", color: "text-amber-600 bg-amber-50" },
  { id: "a4", type: "moveout", icon: TrendingDown, text: "Priya K. initiated move-out notice · Green Valley PG", time: "1d ago", color: "text-rose-600 bg-rose-50" },
  { id: "a5", type: "expense", icon: BadgeCheck, text: "₹4,500 plumbing expense logged · Sunrise PG", time: "1d ago", color: "text-purple-600 bg-purple-50" },
];

// ─── Components ───────────────────────────────────────────────────────────────

function MetricCard({ label, value, change, up, sub, color, bg }: typeof METRICS[0]) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${bg} ${color}`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {change}
        </span>
        <span className="text-xs text-text-tertiary">{sub}</span>
      </div>
    </div>
  );
}

export default function OwnerDashboardPage() {
  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Good morning, Mr. Sharma.</h1>
          <p className="mt-1 text-text-secondary">Here&apos;s your portfolio overview across 2 properties.</p>
        </div>
        <Link href="/owner/properties/new">
          <Button size="sm">+ Add property</Button>
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Main two-column */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Revenue chart */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <p className="font-bold">Revenue trend</p>
            <span className="text-xs text-text-tertiary">Last 6 months</span>
          </div>
          <p className="mb-4 text-2xl font-black text-primary">{formatInr(213500)}<span className="text-sm font-medium text-text-secondary">/mo current</span></p>
          <LineChart data={REVENUE_DATA} height={140} showLabels showDots={false} />
        </div>

        {/* Property performance */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-bold">Property performance</p>
            <Link href="/owner/properties" className="text-xs font-semibold text-accent">View all</Link>
          </div>
          <div className="grid gap-3">
            {PROPERTIES.map((p) => (
              <Link key={p.id} href={`/pms/${p.id}`} className="block rounded-xl border border-border p-3 hover:border-primary transition">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-bold line-clamp-1">{p.name}</p>
                  <Badge variant={p.occupancy >= 80 ? "active" : "due"} className="text-xs shrink-0">{p.occupancy}%</Badge>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 mb-2">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.occupancy}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{p.occupied}/{p.beds} beds</span>
                  <span className="font-semibold text-text-primary">{p.rentCollected}</span>
                </div>
                {p.complaints > 0 && (
                  <p className="mt-1.5 text-xs text-amber-600">{p.complaints} open complaint{p.complaints > 1 ? "s" : ""}</p>
                )}
              </Link>
            ))}
          </div>
          <Link href="/owner/properties/new">
            <Button variant="outline" size="sm" className="mt-4 w-full">+ Add property</Button>
          </Link>
        </div>
      </div>

      {/* Monthly revenue bar */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="mb-4 font-bold">Revenue by property</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PROPERTIES.map((p) => (
            <div key={p.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium truncate">{p.name}</span>
                <span className="font-bold text-primary shrink-0 ml-2">{p.rentCollected}</span>
              </div>
              <BarChart
                data={[
                  { label: "Jan", value: p.id === "prop-sunrise" ? 158000 : 92000 },
                  { label: "Feb", value: p.id === "prop-sunrise" ? 145000 : 88000 },
                  { label: "Mar", value: p.id === "prop-sunrise" ? 172000 : 95000 },
                  { label: "Apr", value: p.id === "prop-sunrise" ? 168000 : 100000 },
                  { label: "May", value: p.id === "prop-sunrise" ? 163200 : 102000 },
                ]}
                height={60}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-bold">Recent activity</p>
          <button className="text-xs font-semibold text-accent">View all</button>
        </div>
        <div className="grid gap-3">
          {ACTIVITY.map(({ id, icon: Icon, text, time, color }) => (
            <div key={id} className="flex items-start gap-3">
              <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${color.split(" ")[1]}`}>
                <Icon className={`h-4 w-4 ${color.split(" ")[0]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{text}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">{time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
