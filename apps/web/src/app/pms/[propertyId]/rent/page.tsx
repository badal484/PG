"use client";

import { use, useState } from "react";
import { Bell, ChevronDown, MessageCircle, Phone, Search } from "lucide-react";
import { Badge, Button, Dialog, FilterChips } from "@/components/ui";
import { formatInr } from "@/lib/utils";

type RentStatus = "PAID" | "DUE" | "OVERDUE";

interface TenantRent {
  id: string;
  name: string;
  phone: string;
  room: string;
  bed: string;
  amount: number;
  status: RentStatus;
  paidDate?: string;
  dueDate: string;
  daysOverdue?: number;
  paymentMode?: "UPI" | "CASH" | "BANK";
}

const RENT_DATA: TenantRent[] = [
  { id: "t1", name: "Raj Kumar", phone: "9876543210", room: "101", bed: "A", amount: 7500, status: "PAID", paidDate: "02 May", dueDate: "01 May", paymentMode: "UPI" },
  { id: "t2", name: "Arjun Nair", phone: "9123456789", room: "101", bed: "B", amount: 7500, status: "OVERDUE", dueDate: "01 May", daysOverdue: 12 },
  { id: "t3", name: "Vinod S.", phone: "9988776655", room: "102", bed: "A", amount: 9500, status: "PAID", paidDate: "01 May", dueDate: "01 May", paymentMode: "CASH" },
  { id: "t4", name: "Saurabh T.", phone: "9111222333", room: "201", bed: "A", amount: 6500, status: "DUE", dueDate: "01 May" },
  { id: "t5", name: "Deepak R.", phone: "9444555666", room: "201", bed: "B", amount: 6500, status: "PAID", paidDate: "30 Apr", dueDate: "01 May", paymentMode: "UPI" },
  { id: "t6", name: "Karan S.", phone: "9777888999", room: "202", bed: "A", amount: 9500, status: "PAID", paidDate: "01 May", dueDate: "01 May", paymentMode: "UPI" },
  { id: "t7", name: "Nitin M.", phone: "9000111222", room: "202", bed: "B", amount: 9500, status: "OVERDUE", dueDate: "01 May", daysOverdue: 5 },
  { id: "t8", name: "Rahul M.", phone: "9555666777", room: "301", bed: "A", amount: 14000, status: "PAID", paidDate: "01 May", dueDate: "01 May", paymentMode: "BANK" },
  { id: "t9", name: "Amit V.", phone: "9333444555", room: "303", bed: "A", amount: 11000, status: "PAID", paidDate: "03 May", dueDate: "01 May", paymentMode: "UPI" },
  { id: "t10", name: "Suresh P.", phone: "9222333444", room: "303", bed: "B", amount: 11000, status: "DUE", dueDate: "01 May" },
];

const MONTHS = ["May 2025", "Apr 2025", "Mar 2025", "Feb 2025", "Jan 2025"];
const TABS = ["All", "Paid", "Due", "Overdue"];

const STATUS_STYLE: Record<RentStatus, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  DUE: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default function RentPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [month, setMonth] = useState("May 2025");
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [cashModal, setCashModal] = useState<TenantRent | null>(null);
  const [reminderSent, setReminderSent] = useState<string[]>([]);
  const [linkSent, setLinkSent] = useState<string[]>([]);

  const filtered = RENT_DATA.filter((t) => {
    const matchTab = tab === "All" || t.status === tab.toUpperCase();
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.room.includes(search);
    return matchTab && matchSearch;
  });

  const totalCollected = RENT_DATA.filter((t) => t.status === "PAID").reduce((s, t) => s + t.amount, 0);
  const totalPending = RENT_DATA.filter((t) => t.status !== "PAID").reduce((s, t) => s + t.amount, 0);
  const pendingCount = RENT_DATA.filter((t) => t.status !== "PAID").length;

  function sendReminder(id: string) {
    setReminderSent((prev) => [...prev, id]);
  }

  function sendLink(id: string) {
    setLinkSent((prev) => [...prev, id]);
  }

  function sendBulkReminder() {
    const pending = RENT_DATA.filter((t) => t.status !== "PAID").map((t) => t.id);
    setReminderSent((prev) => [...new Set([...prev, ...pending])]);
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-black">Rent Collection</h1>
        {pendingCount > 0 && (
          <Button size="sm" variant="outline" onClick={sendBulkReminder}>
            <Bell className="h-4 w-4" /> Remind all ({pendingCount})
          </Button>
        )}
      </div>

      {/* Month selector */}
      <div className="relative">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-border bg-white px-4 pr-10 font-semibold text-sm outline-none focus:border-primary"
        >
          {MONTHS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs font-semibold text-emerald-700">Collected</p>
          <p className="text-2xl font-black text-emerald-700">{formatInr(totalCollected)}</p>
          <p className="text-xs text-emerald-600">{RENT_DATA.filter((t) => t.status === "PAID").length} tenants</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-700">Pending</p>
          <p className="text-2xl font-black text-amber-700">{formatInr(totalPending)}</p>
          <p className="text-xs text-amber-600">{pendingCount} tenants</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-sm">
          <span className="font-medium">Collection progress</span>
          <span className="font-bold">{Math.round((totalCollected / (totalCollected + totalPending)) * 100)}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.round((totalCollected / (totalCollected + totalPending)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          className="h-11 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-primary"
          placeholder="Search by name or room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const count = t === "All" ? RENT_DATA.length : RENT_DATA.filter((r) => r.status === t.toUpperCase()).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t ? "bg-primary text-white" : "border border-border bg-white text-text-secondary"
              }`}
            >
              {t} <span className="ml-1 opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Tenant list */}
      <div className="grid gap-3">
        {filtered.map((tenant) => (
          <div key={tenant.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold">{tenant.name}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[tenant.status]}`}>
                    {tenant.status}
                    {tenant.daysOverdue ? ` · ${tenant.daysOverdue}d` : ""}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-tertiary">Room {tenant.room} · Bed {tenant.bed}</p>
                {tenant.status === "PAID" && (
                  <p className="mt-0.5 text-xs text-emerald-600">Paid on {tenant.paidDate} via {tenant.paymentMode}</p>
                )}
              </div>
              <p className="font-black text-primary">{formatInr(tenant.amount)}</p>
            </div>

            {tenant.status !== "PAID" && (
              <div className="mt-3 flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCashModal(tenant)}
                  className="text-xs"
                >
                  Mark cash
                </Button>
                <Button
                  size="sm"
                  onClick={() => sendLink(tenant.id)}
                  disabled={linkSent.includes(tenant.id)}
                  className="text-xs"
                >
                  {linkSent.includes(tenant.id) ? "Link sent ✓" : "Send link"}
                </Button>
                <button
                  onClick={() => sendReminder(tenant.id)}
                  disabled={reminderSent.includes(tenant.id)}
                  className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                >
                  <Bell className="h-3 w-3" />
                  {reminderSent.includes(tenant.id) ? "Reminded ✓" : "Remind"}
                </button>
                <a href={`https://wa.me/91${tenant.phone}`} target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium">
                    <MessageCircle className="h-3 w-3" /> WhatsApp
                  </button>
                </a>
                <a href={`tel:${tenant.phone}`}>
                  <button className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium">
                    <Phone className="h-3 w-3" /> Call
                  </button>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cash payment modal */}
      <Dialog
        open={!!cashModal}
        title="Mark as cash paid"
        onClose={() => setCashModal(null)}
      >
        {cashModal && (
          <div className="grid gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-semibold">{cashModal.name}</p>
              <p className="text-sm text-text-secondary">Room {cashModal.room} · {formatInr(cashModal.amount)}</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Cash received date</label>
              <input type="date" defaultValue="2025-05-31" className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Amount received</label>
              <input type="number" defaultValue={cashModal.amount} className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Note (optional)</label>
              <input className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" placeholder="e.g. Paid in person at reception" />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setCashModal(null)}>Cancel</Button>
              <Button onClick={() => setCashModal(null)}>Confirm cash payment</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
