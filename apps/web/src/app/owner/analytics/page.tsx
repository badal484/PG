"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp, Users } from "lucide-react";
import { Badge, FilterChips } from "@/components/ui";
import { BarChart, LineChart } from "@/components/charts/SparkChart";
import { formatInr } from "@/lib/utils";

const PERIODS = ["Last 3 months", "Last 6 months", "Last 12 months"];

const OCCUPANCY_TREND = [
  { label: "Dec", value: 78 },
  { label: "Jan", value: 80 },
  { label: "Feb", value: 75 },
  { label: "Mar", value: 82 },
  { label: "Apr", value: 84 },
  { label: "May", value: 83 },
];

const REVENUE_BY_PROPERTY = [
  { label: "Jan", value: 250000 },
  { label: "Feb", value: 233000 },
  { label: "Mar", value: 267000 },
  { label: "Apr", value: 268000 },
  { label: "May", value: 265200 },
];

const RETENTION_DATA = [
  { month: "Dec 2024", renewals: 8, moveouts: 2, newJoins: 3 },
  { month: "Jan 2025", renewals: 7, moveouts: 3, newJoins: 4 },
  { month: "Feb 2025", renewals: 9, moveouts: 1, newJoins: 2 },
  { month: "Mar 2025", renewals: 6, moveouts: 4, newJoins: 5 },
  { month: "Apr 2025", renewals: 8, moveouts: 2, newJoins: 3 },
  { month: "May 2025", renewals: 9, moveouts: 2, newJoins: 4 },
];

const COMPLAINT_TREND = [
  { label: "Dec", value: 8 },
  { label: "Jan", value: 6 },
  { label: "Feb", value: 9 },
  { label: "Mar", value: 5 },
  { label: "Apr", value: 6 },
  { label: "May", value: 4 },
];

const PROPERTY_COMPARISON = [
  {
    id: "prop-sunrise",
    name: "Sunrise Boys PG",
    locality: "Koramangala",
    occupancy: 83,
    avgRent: 6800,
    revenue: formatInr(163200),
    retention: "88%",
    complaints: 2,
    trend: "up",
  },
  {
    id: "prop-green",
    name: "Green Valley PG",
    locality: "HSR Layout",
    occupancy: 75,
    avgRent: 8500,
    revenue: formatInr(102000),
    retention: "82%",
    complaints: 2,
    trend: "stable",
  },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("Last 6 months");

  const avgOccupancy = Math.round(OCCUPANCY_TREND.reduce((s, d) => s + d.value, 0) / OCCUPANCY_TREND.length);
  const avgComplaint = (COMPLAINT_TREND.reduce((s, d) => s + d.value, 0) / COMPLAINT_TREND.length).toFixed(1);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black">Analytics</h1>
        <p className="mt-1 text-sm text-text-secondary">Performance insights across your portfolio</p>
      </div>

      <FilterChips items={PERIODS} active={period} onSelect={setPeriod} />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Avg occupancy", value: `${avgOccupancy}%`, change: "+5%", up: true, sub: "vs prev period" },
          { label: "Total revenue", value: formatInr(1213700), change: "+8%", up: true, sub: "last 6 months" },
          { label: "Avg complaints/mo", value: avgComplaint, change: "-33%", up: true, sub: "improvement" },
          { label: "Tenant retention", value: "85%", change: "+3%", up: true, sub: "renewal rate" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{kpi.label}</p>
            <p className="mt-2 text-3xl font-black">{kpi.value}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${kpi.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {kpi.change}
              </span>
              <span className="text-xs text-text-tertiary">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="font-bold mb-1">Occupancy trend</p>
          <p className="text-xs text-text-tertiary mb-4">% of beds occupied by month</p>
          <LineChart data={OCCUPANCY_TREND} height={130} showLabels color="var(--color-primary, #E8471C)" />
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="font-bold mb-1">Monthly revenue</p>
          <p className="text-xs text-text-tertiary mb-4">Total across all properties</p>
          <BarChart data={REVENUE_BY_PROPERTY} height={110} />
        </div>
      </div>

      {/* Retention & complaints */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="font-bold mb-4">Retention overview</p>
          <div className="grid gap-3">
            {RETENTION_DATA.slice(-4).map((row) => (
              <div key={row.month} className="grid grid-cols-4 items-center gap-2 text-sm">
                <span className="text-text-secondary col-span-1">{row.month.split(" ")[0]}</span>
                <div className="col-span-3 flex gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    <TrendingUp className="h-3 w-3" /> {row.renewals} renewed
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                    <Users className="h-3 w-3" /> {row.newJoins} new
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                    <TrendingDown className="h-3 w-3" /> {row.moveouts} out
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="font-bold mb-1">Complaints trend</p>
          <p className="text-xs text-text-tertiary mb-4">Open complaints filed per month</p>
          <BarChart data={COMPLAINT_TREND} height={110} color="#f59e0b" />
        </div>
      </div>

      {/* Property comparison */}
      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="font-bold">Property comparison</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Property</th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Occupancy</th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Avg rent</th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Revenue</th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Retention</th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Complaints</th>
              </tr>
            </thead>
            <tbody>
              {PROPERTY_COMPARISON.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-4">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-text-tertiary">{p.locality}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex flex-col items-end gap-1">
                      <span className="font-bold">{p.occupancy}%</span>
                      <div className="h-1 w-16 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${p.occupancy}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold">{formatInr(p.avgRent)}</td>
                  <td className="px-4 py-4 text-right font-bold text-primary">{p.revenue}</td>
                  <td className="px-4 py-4 text-right">
                    <Badge variant="active">{p.retention}</Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Badge variant={p.complaints > 3 ? "overdue" : "due"}>{p.complaints} open</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking source breakdown */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="font-bold mb-4">Booking source breakdown</p>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { source: "ROOMLY organic search", pct: 52, color: "bg-primary" },
            { source: "Direct / referral", pct: 28, color: "bg-blue-500" },
            { source: "Google My Business", pct: 14, color: "bg-amber-500" },
            { source: "Other platforms", pct: 6, color: "bg-slate-400" },
          ].map((s) => (
            <div key={s.source} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{s.source}</span>
                <span className="font-bold">{s.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
