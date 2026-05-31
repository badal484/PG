"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Download, TrendingDown, TrendingUp } from "lucide-react";
import { Badge, Button, FilterChips } from "@/components/ui";
import { BarChart, LineChart } from "@/components/charts/SparkChart";
import { formatInr } from "@/lib/utils";

const PERIODS = ["May 2025", "Apr 2025", "Mar 2025", "Feb 2025", "Jan 2025", "Dec 2024"];

const INCOME_ITEMS = [
  { label: "Rent collected", amount: 265200, category: "RENT" },
  { label: "Security deposits received", amount: 24000, category: "DEPOSIT" },
  { label: "Late fee charges", amount: 3200, category: "MISC" },
  { label: "Food subscription", amount: 18000, category: "FOOD" },
];

const EXPENSE_ITEMS = [
  { label: "Maintenance & repairs", amount: 12500, category: "MAINTENANCE" },
  { label: "Staff salaries", amount: 45000, category: "STAFF" },
  { label: "Electricity", amount: 28400, category: "UTILITY" },
  { label: "Water & sewage", amount: 4200, category: "UTILITY" },
  { label: "Internet (leased line)", amount: 5000, category: "UTILITY" },
  { label: "Housekeeping supplies", amount: 3800, category: "MISC" },
  { label: "Platform subscription fee", amount: 2990, category: "PLATFORM" },
];

const MONTHLY_PL = [
  { label: "Dec", value: 82000 },
  { label: "Jan", value: 89000 },
  { label: "Feb", value: 76000 },
  { label: "Mar", value: 95000 },
  { label: "Apr", value: 91000 },
  { label: "May", value: 94500 },
];

const CATEGORY_COLORS: Record<string, string> = {
  RENT: "bg-emerald-100 text-emerald-700",
  DEPOSIT: "bg-blue-100 text-blue-700",
  FOOD: "bg-amber-100 text-amber-700",
  MISC: "bg-slate-100 text-slate-700",
  MAINTENANCE: "bg-orange-100 text-orange-700",
  STAFF: "bg-purple-100 text-purple-700",
  UTILITY: "bg-cyan-100 text-cyan-700",
  PLATFORM: "bg-pink-100 text-pink-700",
};

export default function FinancePage() {
  const [period, setPeriod] = useState("May 2025");
  const [view, setView] = useState<"overview" | "transactions">("overview");

  const totalIncome = INCOME_ITEMS.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = EXPENSE_ITEMS.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const margin = Math.round((netProfit / totalIncome) * 100);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Finance</h1>
          <p className="mt-1 text-sm text-text-secondary">Profit & Loss across all properties</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Period selector */}
      <FilterChips items={PERIODS} active={period} onSelect={setPeriod} />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Total Income</p>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{formatInr(totalIncome)}</p>
          <p className="mt-1 text-xs text-text-tertiary">Rent + deposits + misc</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Total Expenses</p>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-red-50">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-red-600">{formatInr(totalExpenses)}</p>
          <p className="mt-1 text-xs text-text-tertiary">Staff + utilities + misc</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Net Profit</p>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-black text-primary">{formatInr(netProfit)}</p>
          <p className="mt-1 text-xs text-text-tertiary">{margin}% profit margin</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="font-bold mb-1">Monthly P&L trend</p>
          <p className="text-xs text-text-tertiary mb-4">Net profit — last 6 months</p>
          <LineChart data={MONTHLY_PL} height={120} showLabels showDots={false} />
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="font-bold mb-1">Income vs Expenses</p>
          <p className="text-xs text-text-tertiary mb-4">By month — last 6 months</p>
          <BarChart
            data={[
              { label: "Dec", value: 240000 },
              { label: "Jan", value: 255000 },
              { label: "Feb", value: 238000 },
              { label: "Mar", value: 268000 },
              { label: "Apr", value: 260000 },
              { label: "May", value: 265200 },
            ]}
            height={100}
          />
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-2 border-b border-border">
        {(["overview", "transactions"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 -mb-px ${
              view === v ? "border-primary text-primary" : "border-transparent text-text-secondary"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "overview" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Income breakdown */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold">Income breakdown</p>
              <p className="text-sm font-bold text-emerald-600">{formatInr(totalIncome)}</p>
            </div>
            <div className="grid gap-3">
              {INCOME_ITEMS.map((item) => {
                const pct = Math.round((item.amount / totalIncome) * 100);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${CATEGORY_COLORS[item.category]}`}>{item.category}</span>
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold">{formatInr(item.amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expense breakdown */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold">Expense breakdown</p>
              <p className="text-sm font-bold text-red-600">{formatInr(totalExpenses)}</p>
            </div>
            <div className="grid gap-3">
              {EXPENSE_ITEMS.map((item) => {
                const pct = Math.round((item.amount / totalExpenses) * 100);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${CATEGORY_COLORS[item.category]}`}>{item.category}</span>
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold">{formatInr(item.amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-red-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {view === "transactions" && (
        <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Description</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Category</th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Type</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "31 May", desc: "Rahul M. — May rent", cat: "RENT", amount: 10200, type: "INCOME" },
                { date: "30 May", desc: "Karan S. — May rent", cat: "RENT", amount: 11500, type: "INCOME" },
                { date: "28 May", desc: "Plumbing repair — Rm 201", cat: "MAINTENANCE", amount: 4500, type: "EXPENSE" },
                { date: "25 May", desc: "Priya K. — May rent", cat: "RENT", amount: 9800, type: "INCOME" },
                { date: "20 May", desc: "Electricity bill — Sunrise PG", cat: "UTILITY", amount: 16200, type: "EXPENSE" },
                { date: "15 May", desc: "Warden salary — May", cat: "STAFF", amount: 22000, type: "EXPENSE" },
                { date: "10 May", desc: "Security deposit — new tenant", cat: "DEPOSIT", amount: 12000, type: "INCOME" },
                { date: "05 May", desc: "Internet leased line", cat: "UTILITY", amount: 5000, type: "EXPENSE" },
              ].map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-3 text-text-tertiary">{row.date}</td>
                  <td className="px-4 py-3">{row.desc}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${CATEGORY_COLORS[row.cat]}`}>{row.cat}</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${row.type === "INCOME" ? "text-emerald-600" : "text-red-600"}`}>
                    {row.type === "INCOME" ? "+" : "-"}{formatInr(row.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={row.type === "INCOME" ? "active" : "overdue"} className="text-xs">{row.type}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
