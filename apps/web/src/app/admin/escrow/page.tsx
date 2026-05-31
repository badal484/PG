"use client";

import { useState } from "react";
import {
  AlertTriangle, ArrowUpRight, CheckCircle, Download,
  Flag, Lock, RefreshCw, Search,
} from "lucide-react";
import { Dialog } from "@/components/ui";
import { formatInr } from "@/lib/utils";

interface EscrowTxn {
  id: string;
  bookingId: string;
  tenant: string;
  property: string;
  city: string;
  depositAmount: number;
  heldSince: string;
  expectedRelease: string;
  status: "HELD" | "PENDING_RELEASE" | "RELEASED" | "DISPUTED";
  razorpayId: string;
}

const ESCROW_TXN: EscrowTxn[] = [
  { id: "ESC-001", bookingId: "BK-4421", tenant: "Rahul Mehta", property: "Sunrise Boys PG", city: "Bangalore", depositAmount: 28000, heldSince: "01 May 2025", expectedRelease: "On checkout", status: "HELD", razorpayId: "pay_Oxxxxxx1" },
  { id: "ESC-002", bookingId: "BK-4422", tenant: "Priya Kumar", property: "Green Valley PG", city: "Bangalore", depositAmount: 19000, heldSince: "01 May 2025", expectedRelease: "On checkout", status: "HELD", razorpayId: "pay_Oxxxxxx2" },
  { id: "ESC-003", bookingId: "BK-4398", tenant: "Vikram Nair", property: "City Nest", city: "Mumbai", depositAmount: 24000, heldSince: "01 Apr 2025", expectedRelease: "05 Jun 2025", status: "DISPUTED", razorpayId: "pay_Oxxxxxx3" },
  { id: "ESC-004", bookingId: "BK-4401", tenant: "Deepa Rao", property: "Bloom Stay", city: "Chennai", depositAmount: 16000, heldSince: "01 Mar 2025", expectedRelease: "31 May 2025", status: "PENDING_RELEASE", razorpayId: "pay_Oxxxxxx4" },
  { id: "ESC-005", bookingId: "BK-4410", tenant: "Ravi Teja", property: "Urban Nest PG", city: "Pune", depositAmount: 17000, heldSince: "01 May 2025", expectedRelease: "On checkout", status: "HELD", razorpayId: "pay_Oxxxxxx5" },
  { id: "ESC-006", bookingId: "BK-4223", tenant: "Arun S.", property: "Sunrise Boys PG", city: "Bangalore", depositAmount: 15000, heldSince: "01 Apr 2025", expectedRelease: "01 Jun 2025", status: "PENDING_RELEASE", razorpayId: "pay_Oxxxxxx6" },
  { id: "ESC-007", bookingId: "BK-4189", tenant: "Meena R.", property: "Green Valley PG", city: "Bangalore", depositAmount: 19000, heldSince: "01 Mar 2025", expectedRelease: "Released", status: "RELEASED", razorpayId: "pay_Oxxxxxx7" },
];

const STATUS_STYLE: Record<EscrowTxn["status"], string> = {
  HELD: "bg-blue-100 text-blue-700",
  PENDING_RELEASE: "bg-amber-100 text-amber-700",
  RELEASED: "bg-emerald-100 text-emerald-700",
  DISPUTED: "bg-red-100 text-red-700",
};

const RECONCILIATION = [
  { label: "Razorpay Route balance", value: 4_210_000, source: "razorpay" },
  { label: "Internal escrow ledger", value: 4_195_000, source: "internal" },
  { label: "Discrepancy", value: 15_000, source: "diff" },
];

export default function EscrowPage() {
  const [search, setSearch] = useState("");
  const [flagDialog, setFlagDialog] = useState(false);
  const [releaseDialog, setReleaseDialog] = useState<EscrowTxn | null>(null);
  const [tab, setTab] = useState<"all" | "pending" | "disputed">("all");

  const totalHeld = ESCROW_TXN.filter((t) => t.status !== "RELEASED").reduce((s, t) => s + t.depositAmount, 0);

  const filtered = ESCROW_TXN.filter((t) => {
    const matchSearch = !search || t.tenant.toLowerCase().includes(search.toLowerCase()) || t.bookingId.includes(search) || t.property.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "all" || (tab === "pending" && t.status === "PENDING_RELEASE") || (tab === "disputed" && t.status === "DISPUTED");
    return matchSearch && matchTab;
  });

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-black text-slate-900">Escrow</h1>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-bold text-blue-700">Total in escrow</p>
          </div>
          <p className="text-3xl font-black text-blue-700">{formatInr(totalHeld)}</p>
          <p className="text-xs text-blue-500 mt-0.5">{ESCROW_TXN.filter((t) => t.status !== "RELEASED").length} active accounts</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-bold text-amber-700 mb-2">Pending releases</p>
          <p className="text-3xl font-black text-amber-700">{ESCROW_TXN.filter((t) => t.status === "PENDING_RELEASE").length}</p>
          <p className="text-xs text-amber-500 mt-0.5">{formatInr(ESCROW_TXN.filter((t) => t.status === "PENDING_RELEASE").reduce((s, t) => s + t.depositAmount, 0))}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-xs font-bold text-red-700 mb-2">Disputed holds</p>
          <p className="text-3xl font-black text-red-700">{ESCROW_TXN.filter((t) => t.status === "DISPUTED").length}</p>
          <p className="text-xs text-red-500 mt-0.5">{formatInr(ESCROW_TXN.filter((t) => t.status === "DISPUTED").reduce((s, t) => s + t.depositAmount, 0))}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-bold text-emerald-700 mb-2">Released this month</p>
          <p className="text-3xl font-black text-emerald-700">{ESCROW_TXN.filter((t) => t.status === "RELEASED").length}</p>
          <p className="text-xs text-emerald-500 mt-0.5">{formatInr(ESCROW_TXN.filter((t) => t.status === "RELEASED").reduce((s, t) => s + t.depositAmount, 0))}</p>
        </div>
      </div>

      {/* Reconciliation card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-slate-800">Razorpay reconciliation</p>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <RefreshCw className="h-3.5 w-3.5" /> Sync now
            </button>
            <button
              onClick={() => setFlagDialog(true)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
            >
              <Flag className="h-3.5 w-3.5" /> Flag discrepancy
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {RECONCILIATION.map((r) => (
            <div key={r.label} className={`rounded-xl p-4 ${r.source === "diff" ? "bg-amber-50 border border-amber-200" : "bg-slate-50"}`}>
              <p className="text-xs text-slate-500">{r.label}</p>
              <p className={`text-2xl font-black mt-1 ${r.source === "diff" ? "text-amber-700" : "text-slate-800"}`}>
                {r.source === "diff" && r.value > 0 ? "+" : ""}{formatInr(r.value)}
              </p>
              {r.source === "diff" && r.value > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Discrepancy detected
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">Last synced: 31 May 2025, 11:45 AM</p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex gap-1">
            {(["all", "pending", "disputed"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${tab === t ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                {t === "all" ? `All (${ESCROW_TXN.length})` : t === "pending" ? `Pending (${ESCROW_TXN.filter((t) => t.status === "PENDING_RELEASE").length})` : `Disputed (${ESCROW_TXN.filter((t) => t.status === "DISPUTED").length})`}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              className="h-8 w-52 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm outline-none focus:border-accent"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["ID", "Booking", "Tenant", "Property", "Deposit", "Held Since", "Expected Release", "Status", "Actions"].map((col) => (
                <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{t.id}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-accent font-semibold">{t.bookingId}</td>
                <td className="px-4 py-2.5 text-sm text-slate-700">{t.tenant}</td>
                <td className="px-4 py-2.5">
                  <p className="text-sm text-slate-700">{t.property}</p>
                  <p className="text-xs text-slate-400">{t.city}</p>
                </td>
                <td className="px-4 py-2.5 font-bold text-slate-800">{formatInr(t.depositAmount)}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{t.heldSince}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{t.expectedRelease}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[t.status]}`}>
                    {t.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {t.status === "PENDING_RELEASE" && (
                    <button
                      onClick={() => setReleaseDialog(t)}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Release
                    </button>
                  )}
                  {t.status === "DISPUTED" && (
                    <span className="text-xs text-red-500 font-medium">Awaiting dispute resolution</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Release dialog */}
      <Dialog open={!!releaseDialog} title="Release escrow" onClose={() => setReleaseDialog(null)}>
        {releaseDialog && (
          <div className="grid gap-4">
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p><strong>Tenant:</strong> {releaseDialog.tenant}</p>
              <p><strong>Property:</strong> {releaseDialog.property}</p>
              <p><strong>Deposit amount:</strong> {formatInr(releaseDialog.depositAmount)}</p>
            </div>
            <p className="text-sm text-slate-600">Confirm release of <strong>{formatInr(releaseDialog.depositAmount)}</strong> to owner. This action is irreversible.</p>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Admin confirmation note</label>
              <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-accent" placeholder="Reason for manual release..." />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setReleaseDialog(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
              <button onClick={() => setReleaseDialog(null)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                <CheckCircle className="inline h-4 w-4 mr-1.5" />Confirm release
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Flag discrepancy dialog */}
      <Dialog open={flagDialog} title="Flag reconciliation discrepancy" onClose={() => setFlagDialog(false)}>
        <div className="grid gap-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-semibold text-amber-700">Discrepancy detected: +{formatInr(15000)}</p>
            <p className="text-xs text-amber-600 mt-1">Razorpay Route shows ₹15,000 more than internal ledger</p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Nature of discrepancy</label>
            <textarea className="min-h-20 rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-accent" placeholder="Describe the discrepancy and any investigation done..." />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setFlagDialog(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Cancel</button>
            <button onClick={() => setFlagDialog(false)} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white">Submit flag</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
