"use client";

import { BarChart, LineChart } from "@/components/charts/SparkChart";
import { formatInr } from "@/lib/utils";

const FUNNEL = [
  { label: "Search", count: 48200, dropoff: null },
  { label: "View property", count: 18900, dropoff: 61 },
  { label: "View beds", count: 9200, dropoff: 51 },
  { label: "Start booking", count: 3100, dropoff: 66 },
  { label: "KYC submitted", count: 2280, dropoff: 26 },
  { label: "Payment done", count: 1890, dropoff: 17 },
  { label: "Move-in confirmed", count: 1720, dropoff: 9 },
];

const COHORT = [
  { month: "Jan 2025", started: 280, m1: 91, m2: 83, m3: 78 },
  { month: "Feb 2025", started: 310, m1: 88, m2: 81, m3: null },
  { month: "Mar 2025", started: 342, m1: 90, m2: null, m3: null },
  { month: "Apr 2025", started: 390, m1: 92, m2: null, m3: null },
];

const CITY_DATA = [
  { city: "Bangalore", properties: 98, tenants: 1520, gmv: 18_200_000, occ: 83 },
  { city: "Mumbai", properties: 62, tenants: 890, gmv: 9_800_000, occ: 79 },
  { city: "Hyderabad", properties: 44, tenants: 680, gmv: 5_400_000, occ: 81 },
  { city: "Pune", properties: 28, tenants: 420, gmv: 3_200_000, occ: 77 },
  { city: "Chennai", properties: 16, tenants: 331, gmv: 1_800_000, occ: 74 },
];

const TIER_REVENUE = [
  { label: "Premium", value: 18_400_000 },
  { label: "Standard", value: 14_200_000 },
  { label: "Budget", value: 5_800_000 },
];

const STAY_TYPE_REVENUE = [
  { label: "Monthly", value: 29_000_000 },
  { label: "Long-term", value: 6_200_000 },
  { label: "Weekly", value: 2_100_000 },
  { label: "Daily", value: 1_100_000 },
];

const GMV_TREND = [
  { label: "Dec", value: 28_000_000 },
  { label: "Jan", value: 31_000_000 },
  { label: "Feb", value: 29_500_000 },
  { label: "Mar", value: 34_200_000 },
  { label: "Apr", value: 36_800_000 },
  { label: "May", value: 38_400_000 },
];

export default function AnalyticsPage() {
  const maxCount = FUNNEL[0]?.count ?? 1;

  return (
    <div className="grid gap-6">
      <h1 className="text-base font-black text-slate-900">Platform Analytics</h1>

      {/* ── Booking funnel ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <p className="font-bold text-slate-800">Booking funnel</p>
          <span className="text-xs text-slate-400">May 2025 · Overall conversion: {((FUNNEL.at(-1)?.count ?? 0) / (FUNNEL[0]?.count ?? 1) * 100).toFixed(1)}%</span>
        </div>
        <div className="grid gap-2">
          {FUNNEL.map((step, i) => {
            const pct = (step.count / maxCount) * 100;
            return (
              <div key={step.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs font-medium text-slate-600 text-right">{step.label}</span>
                <div className="flex-1 h-7 rounded-lg bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-accent to-accent-light transition-all flex items-center px-2"
                    style={{ width: `${pct}%` }}
                  >
                    <span className="text-xs font-bold text-white">{step.count.toLocaleString()}</span>
                  </div>
                </div>
                {step.dropoff !== null && (
                  <span className="w-16 shrink-0 text-xs text-red-500 font-semibold">−{step.dropoff}%</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── GMV trend + revenue split ── */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-bold text-slate-800 mb-1">GMV trend</p>
          <p className="text-xs text-slate-400 mb-4">Last 6 months</p>
          <LineChart data={GMV_TREND} height={100} showLabels showDots={false} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-bold text-slate-800 mb-1">Revenue by tier</p>
          <p className="text-xs text-slate-400 mb-4">May 2025</p>
          <BarChart data={TIER_REVENUE} height={80} />
          <div className="mt-3 grid gap-1.5">
            {TIER_REVENUE.map((t) => (
              <div key={t.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{t.label}</span>
                <span className="font-semibold">{formatInr(t.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cohort retention ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-slate-800">Cohort retention</p>
          <span className="text-xs text-slate-400">% of tenants still active after N months</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Cohort</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Started</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">M+1</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">M+2</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">M+3</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {COHORT.map((row) => (
              <tr key={row.month}>
                <td className="px-4 py-2.5 font-medium text-slate-700">{row.month}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">{row.started}</td>
                {[row.m1, row.m2, row.m3].map((val, i) => (
                  <td key={i} className="px-4 py-2.5 text-right">
                    {val !== null ? (
                      <span className={`inline-block min-w-[3rem] rounded-lg px-2 py-1 text-center text-xs font-bold ${val >= 85 ? "bg-emerald-100 text-emerald-700" : val >= 75 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {val}%
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── City heatmap + stay type ── */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* City table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <p className="font-bold text-slate-800">City performance</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["City", "Properties", "Tenants", "GMV", "Occ %"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {CITY_DATA.map((c) => (
                <tr key={c.city}>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">{c.city}</td>
                  <td className="px-4 py-2.5 text-slate-600">{c.properties}</td>
                  <td className="px-4 py-2.5 text-slate-600">{c.tenants.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-800">{formatInr(c.gmv)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${c.occ}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${c.occ >= 80 ? "text-emerald-600" : "text-amber-600"}`}>{c.occ}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stay type revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-bold text-slate-800 mb-4">Revenue by stay type</p>
          <BarChart data={STAY_TYPE_REVENUE} height={100} />
          <div className="mt-4 grid gap-2">
            {STAY_TYPE_REVENUE.map((s) => {
              const pct = Math.round((s.value / STAY_TYPE_REVENUE.reduce((t, x) => t + x.value, 0)) * 100);
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-slate-500">{s.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold">{pct}%</span>
                  <span className="w-24 text-right text-xs font-bold text-slate-700">{formatInr(s.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
