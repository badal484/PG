"use client";

import { useState } from "react";
import {
  ArrowUpDown, CheckCircle, ChevronLeft, ChevronRight,
  Download, Filter, Search, X,
} from "lucide-react";
import { Badge, Button, Dialog, Select } from "@/components/ui";
import { formatInr } from "@/lib/utils";

type BookingStatus = "ACTIVE" | "PENDING_PAYMENT" | "KYC_PENDING" | "CANCELLED" | "COMPLETED" | "DISPUTED";

interface Booking {
  id: string;
  tenant: string;
  tenantPhone: string;
  property: string;
  city: string;
  bed: string;
  status: BookingStatus;
  moveIn: string;
  amount: number;
  stayType: string;
  kycStatus: "VERIFIED" | "PENDING" | "FAILED";
  agreementStatus: "SIGNED" | "PENDING" | "NA";
  deposit: number;
  commission: number;
  created: string;
}

const BOOKINGS: Booking[] = [
  { id: "BK-4421", tenant: "Rahul Mehta", tenantPhone: "9876543210", property: "Sunrise Boys PG", city: "Bangalore", bed: "Rm 301 · Bed A", status: "ACTIVE", moveIn: "01 May 2025", amount: 14000, stayType: "MONTHLY", kycStatus: "VERIFIED", agreementStatus: "SIGNED", deposit: 28000, commission: 1400, created: "28 Apr 2025" },
  { id: "BK-4422", tenant: "Priya Kumar", tenantPhone: "9123456789", property: "Green Valley PG", city: "Bangalore", bed: "Rm 102 · Bed B", status: "ACTIVE", moveIn: "01 May 2025", amount: 9500, stayType: "MONTHLY", kycStatus: "VERIFIED", agreementStatus: "SIGNED", deposit: 19000, commission: 950, created: "29 Apr 2025" },
  { id: "BK-4423", tenant: "Amit Shah", tenantPhone: "9988776655", property: "Urban Nest PG", city: "Pune", bed: "Rm 203 · Bed C", status: "KYC_PENDING", moveIn: "01 Jun 2025", amount: 8500, stayType: "MONTHLY", kycStatus: "PENDING", agreementStatus: "PENDING", deposit: 17000, commission: 850, created: "30 May 2025" },
  { id: "BK-4424", tenant: "Sneha Reddy", tenantPhone: "9111222333", property: "Sunshine PG", city: "Hyderabad", bed: "Rm 101 · Bed A", status: "PENDING_PAYMENT", moveIn: "05 Jun 2025", amount: 7500, stayType: "MONTHLY", kycStatus: "VERIFIED", agreementStatus: "PENDING", deposit: 15000, commission: 750, created: "31 May 2025" },
  { id: "BK-4398", tenant: "Vikram Nair", tenantPhone: "9444555666", property: "City Nest", city: "Mumbai", bed: "Rm 302 · Bed A", status: "DISPUTED", moveIn: "01 Apr 2025", amount: 12000, stayType: "MONTHLY", kycStatus: "VERIFIED", agreementStatus: "SIGNED", deposit: 24000, commission: 1200, created: "28 Mar 2025" },
  { id: "BK-4401", tenant: "Deepa Rao", tenantPhone: "9777888999", property: "Bloom Stay", city: "Chennai", bed: "Rm 204 · Bed B", status: "COMPLETED", moveIn: "01 Mar 2025", amount: 8000, stayType: "MONTHLY", kycStatus: "VERIFIED", agreementStatus: "SIGNED", deposit: 16000, commission: 800, created: "26 Feb 2025" },
  { id: "BK-4399", tenant: "Kiran Joshi", tenantPhone: "9000111222", property: "Sunrise Boys PG", city: "Bangalore", bed: "Rm 202 · Bed B", status: "CANCELLED", moveIn: "15 Apr 2025", amount: 9500, stayType: "MONTHLY", kycStatus: "FAILED", agreementStatus: "NA", deposit: 0, commission: 0, created: "10 Apr 2025" },
  { id: "BK-4410", tenant: "Ravi Teja", tenantPhone: "9333444555", property: "Urban Nest PG", city: "Pune", bed: "Rm 105 · Bed A", status: "ACTIVE", moveIn: "01 May 2025", amount: 8500, stayType: "MONTHLY", kycStatus: "VERIFIED", agreementStatus: "SIGNED", deposit: 17000, commission: 850, created: "28 Apr 2025" },
];

const STATUS_STYLES: Record<BookingStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PENDING_PAYMENT: "bg-amber-100 text-amber-700",
  KYC_PENDING: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  COMPLETED: "bg-purple-100 text-purple-700",
  DISPUTED: "bg-red-100 text-red-700",
};

const ALL_STATUSES: BookingStatus[] = ["ACTIVE", "PENDING_PAYMENT", "KYC_PENDING", "CANCELLED", "COMPLETED", "DISPUTED"];

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [page, setPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<"refund" | "cancel" | "force-complete" | "override" | null>(null);

  const filtered = BOOKINGS.filter((b) => {
    const matchSearch =
      !search ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.tenant.toLowerCase().includes(search.toLowerCase()) ||
      b.property.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchCity = cityFilter === "ALL" || b.city === cityFilter;
    return matchSearch && matchStatus && matchCity;
  });

  const cities = [...new Set(BOOKINGS.map((b) => b.city))];
  const PER_PAGE = 10;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-base font-black text-slate-900">Bookings</h1>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm outline-none focus:border-accent"
            placeholder="Search ID, tenant, property..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          className="h-8 w-44 text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as BookingStatus | "ALL"); setPage(1); }}
        >
          <option value="ALL">All statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </Select>
        <Select
          className="h-8 w-36 text-sm"
          value={cityFilter}
          onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
        >
          <option value="ALL">All cities</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Booking ID", "Tenant", "Property", "Bed", "Status", "Move-in", "Amount", "Created"].map((col) => (
                <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                  <button className="flex items-center gap-1 hover:text-slate-700">
                    {col} <ArrowUpDown className="h-3 w-3 opacity-40" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((b) => (
              <tr
                key={b.id}
                onClick={() => setSelected(b)}
                className={`cursor-pointer hover:bg-slate-50 transition ${selected?.id === b.id ? "bg-accent/5" : ""}`}
              >
                <td className="px-4 py-2.5 font-mono text-xs text-accent font-semibold">{b.id}</td>
                <td className="px-4 py-2.5">
                  <p className="font-medium text-slate-800">{b.tenant}</p>
                  <p className="text-xs text-slate-400">{b.tenantPhone}</p>
                </td>
                <td className="px-4 py-2.5">
                  <p className="text-slate-700">{b.property}</p>
                  <p className="text-xs text-slate-400">{b.city}</p>
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{b.bed}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[b.status]}`}>
                    {b.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{b.moveIn}</td>
                <td className="px-4 py-2.5 font-bold text-slate-800">{formatInr(b.amount)}</td>
                <td className="px-4 py-2.5 text-xs text-slate-400">{b.created}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
          <p className="text-xs text-slate-400">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Booking detail panel */}
      {selected && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h2 className="font-bold text-slate-800">Booking detail — {selected.id}</h2>
            <button onClick={() => setSelected(null)}><X className="h-4 w-4 text-slate-400" /></button>
          </div>

          <div className="p-5 grid gap-5">
            {/* Info grid */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Tenant", value: selected.tenant },
                { label: "Phone", value: selected.tenantPhone },
                { label: "Property", value: selected.property },
                { label: "Bed", value: selected.bed },
                { label: "Move-in", value: selected.moveIn },
                { label: "Stay type", value: selected.stayType },
                { label: "KYC status", value: selected.kycStatus },
                { label: "Agreement", value: selected.agreementStatus },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-slate-400">{f.label}</p>
                  <p className="text-sm font-semibold mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>

            {/* Payment flow */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-3">Payment flow</p>
              <div className="flex items-center gap-2 overflow-x-auto">
                {[
                  { label: "Deposit", amount: selected.deposit, status: "Held in escrow", color: "bg-blue-50 border-blue-200" },
                  { label: "Rent", amount: selected.amount, status: "→ Owner (monthly)", color: "bg-emerald-50 border-emerald-200" },
                  { label: "Commission", amount: selected.commission, status: "→ Platform (10%)", color: "bg-purple-50 border-purple-200" },
                ].map((pf) => (
                  <div key={pf.label} className={`shrink-0 rounded-xl border p-3 text-center min-w-[120px] ${pf.color}`}>
                    <p className="text-xs text-slate-500">{pf.label}</p>
                    <p className="font-black text-slate-800">{formatInr(pf.amount)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{pf.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 mr-2">Manual actions:</p>
              <button onClick={() => setActionDialog("refund")} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100">Refund</button>
              <button onClick={() => setActionDialog("cancel")} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">Cancel</button>
              <button onClick={() => setActionDialog("force-complete")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Force complete</button>
              <button onClick={() => setActionDialog("override")} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Override status</button>
            </div>
          </div>
        </div>
      )}

      {/* Action dialogs */}
      <Dialog
        open={!!actionDialog}
        title={
          actionDialog === "refund" ? "Issue refund" :
          actionDialog === "cancel" ? "Cancel booking" :
          actionDialog === "force-complete" ? "Force complete booking" :
          "Override booking status"
        }
        onClose={() => setActionDialog(null)}
      >
        <div className="grid gap-4">
          {actionDialog === "refund" && (
            <>
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <p>Refund for booking <strong>{selected?.id}</strong></p>
                <p className="text-slate-500 mt-0.5">Tenant: {selected?.tenant}</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Refund amount (₹)</label>
                <input type="number" defaultValue={selected?.amount} className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-accent" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Reason</label>
                <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-accent" placeholder="Reason for refund..." />
              </div>
            </>
          )}
          {actionDialog === "override" && (
            <>
              <div className="grid gap-2">
                <label className="text-sm font-semibold">New status</label>
                <Select>
                  {ALL_STATUSES.map((s) => <option key={s}>{s.replace(/_/g, " ")}</option>)}
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Reason (required)</label>
                <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-accent" placeholder="Document reason for override..." />
              </div>
            </>
          )}
          {(actionDialog === "cancel" || actionDialog === "force-complete") && (
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Admin notes</label>
              <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-accent" placeholder="Document reason..." />
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button onClick={() => setActionDialog(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={() => setActionDialog(null)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light">
              Confirm
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
