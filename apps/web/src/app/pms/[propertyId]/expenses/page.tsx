"use client";

import { use, useState } from "react";
import { Camera, Plus, TrendingDown, X } from "lucide-react";
import { Badge, Button, FormField, Select } from "@/components/ui";
import { formatInr } from "@/lib/utils";

type ExpenseCategory = "MAINTENANCE" | "UTILITIES" | "STAFF" | "FOOD" | "SUPPLIES" | "INTERNET" | "MISC";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paidTo: string;
  mode: "CASH" | "UPI" | "BANK";
  receipt: boolean;
  notes?: string;
}

const EXPENSES: Expense[] = [
  { id: "e1", title: "Plumbing repair — Room 201", amount: 4500, category: "MAINTENANCE", date: "28 May", paidTo: "Ravi Plumber", mode: "CASH", receipt: true, notes: "Fixed burst pipe in bathroom" },
  { id: "e2", title: "Electricity bill — May", amount: 16200, category: "UTILITIES", date: "25 May", paidTo: "BESCOM", mode: "BANK", receipt: true },
  { id: "e3", title: "Warden salary — May", amount: 22000, category: "STAFF", date: "01 May", paidTo: "Ramesh Kumar", mode: "BANK", receipt: false },
  { id: "e4", title: "Rice & dal stock replenish", amount: 3800, category: "FOOD", date: "20 May", paidTo: "Suresh Grocery", mode: "CASH", receipt: true },
  { id: "e5", title: "Cleaning supplies — Q2", amount: 2200, category: "SUPPLIES", date: "15 May", paidTo: "DMart", mode: "UPI", receipt: true },
  { id: "e6", title: "Internet leased line", amount: 5000, category: "INTERNET", date: "10 May", paidTo: "ACT Broadband", mode: "BANK", receipt: true },
  { id: "e7", title: "Light bulb replacements", amount: 850, category: "MAINTENANCE", date: "08 May", paidTo: "Shiva Electricals", mode: "CASH", receipt: false },
];

const CATEGORY_META: Record<ExpenseCategory, { color: string; label: string }> = {
  MAINTENANCE: { color: "bg-orange-100 text-orange-700", label: "Maintenance" },
  UTILITIES: { color: "bg-cyan-100 text-cyan-700", label: "Utilities" },
  STAFF: { color: "bg-purple-100 text-purple-700", label: "Staff" },
  FOOD: { color: "bg-amber-100 text-amber-700", label: "Food" },
  SUPPLIES: { color: "bg-emerald-100 text-emerald-700", label: "Supplies" },
  INTERNET: { color: "bg-blue-100 text-blue-700", label: "Internet" },
  MISC: { color: "bg-slate-100 text-slate-600", label: "Misc" },
};

const CATEGORIES = Object.keys(CATEGORY_META) as ExpenseCategory[];

export default function ExpensesPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [expenses, setExpenses] = useState(EXPENSES);
  const [sheet, setSheet] = useState(false);
  const [filter, setFilter] = useState<ExpenseCategory | "ALL">("ALL");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "MAINTENANCE" as ExpenseCategory,
    date: "",
    paidTo: "",
    mode: "CASH" as "CASH" | "UPI" | "BANK",
    notes: "",
  });

  const filtered = filter === "ALL" ? expenses : expenses.filter((e) => e.category === filter);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  function handleAdd() {
    if (!form.title || !form.amount) return;
    setExpenses((prev) => [
      {
        id: `e${prev.length + 1}`,
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        date: form.date || "31 May",
        paidTo: form.paidTo,
        mode: form.mode,
        receipt: false,
        notes: form.notes,
      },
      ...prev,
    ]);
    setSheet(false);
    setForm({ title: "", amount: "", category: "MAINTENANCE", date: "", paidTo: "", mode: "CASH", notes: "" });
  }

  return (
    <div className="relative grid gap-5 min-h-full">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black">Expenses</h1>
        <p className="text-sm text-text-secondary mt-0.5">All operational expenses this month</p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl bg-red-50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="h-5 w-5 text-red-600" />
          <p className="font-bold text-red-700">Total expenses</p>
        </div>
        <p className="text-3xl font-black text-red-700">{formatInr(expenses.reduce((s, e) => s + e.amount, 0))}</p>
        <p className="text-xs text-red-600 mt-0.5">May 2025 · {expenses.length} entries</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["ALL", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              filter === cat ? "bg-primary text-white" : "border border-border bg-white text-text-secondary"
            }`}
          >
            {cat === "ALL" ? "All" : CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      {/* Category totals */}
      {filter === "ALL" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const catTotal = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
            if (catTotal === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-xl p-3 text-left transition hover:ring-2 hover:ring-primary ${CATEGORY_META[cat].color}`}
              >
                <p className="text-xs font-bold">{CATEGORY_META[cat].label}</p>
                <p className="text-lg font-black">{formatInr(catTotal)}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Expense list */}
      <div className="grid gap-3">
        {filtered.map((expense) => (
          <div key={expense.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${CATEGORY_META[expense.category].color}`}>
                    {CATEGORY_META[expense.category].label}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-text-secondary">{expense.mode}</span>
                  {expense.receipt && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Receipt</span>
                  )}
                </div>
                <p className="font-semibold">{expense.title}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {expense.date} · Paid to: {expense.paidTo || "—"}
                </p>
                {expense.notes && <p className="mt-1 text-xs text-text-secondary">{expense.notes}</p>}
              </div>
              <p className="font-black text-red-600 shrink-0">{formatInr(expense.amount)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setSheet(true)}
        className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition hover:bg-primary/90 active:scale-95 lg:bottom-8"
        aria-label="Add expense"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add expense bottom sheet */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheet(false)} />
          <div className="relative rounded-t-2xl bg-white px-4 pb-8 pt-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <p className="text-lg font-bold">Log expense</p>
              <button onClick={() => setSheet(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4">
              <FormField>
                <label className="text-sm font-semibold">Title *</label>
                <input
                  className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                  placeholder="e.g. Plumbing repair Room 201"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField>
                  <label className="text-sm font-semibold">Amount (₹) *</label>
                  <input
                    type="number"
                    className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </FormField>
                <FormField>
                  <label className="text-sm font-semibold">Date</label>
                  <input
                    type="date"
                    className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField>
                  <label className="text-sm font-semibold">Category</label>
                  <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
                  </Select>
                </FormField>
                <FormField>
                  <label className="text-sm font-semibold">Payment mode</label>
                  <Select value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value as typeof form.mode }))}>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK">Bank transfer</option>
                  </Select>
                </FormField>
              </div>

              <FormField>
                <label className="text-sm font-semibold">Paid to</label>
                <input
                  className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                  placeholder="Vendor / person name"
                  value={form.paidTo}
                  onChange={(e) => setForm((f) => ({ ...f, paidTo: e.target.value }))}
                />
              </FormField>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border p-3 hover:border-primary">
                <Camera className="h-5 w-5 text-text-tertiary" />
                <span className="text-sm text-text-secondary">Attach receipt (optional)</span>
                <input type="file" accept="image/*,.pdf" className="sr-only" />
              </label>

              <Button onClick={handleAdd} disabled={!form.title || !form.amount}>
                Add expense
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
