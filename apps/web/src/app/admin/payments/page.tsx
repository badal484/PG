"use client";

import { useState } from "react";
import { ArrowUpDown, Download, RefreshCw, Search } from "lucide-react";
import { formatInr } from "@/lib/utils";

type TxnType = "RENT" | "DEPOSIT" | "REFUND" | "COMMISSION" | "PAYOUT";
type TxnStatus = "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";

interface Transaction {
  id: string;
  type: TxnType;
  tenant: string;
  property: string;
  amount: number;
  status: TxnStatus;
  mode: string;
  date: string;
  razorpayId: string;
  failReason?: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: "TXN-8810", type: "RENT", tenant: "Rahul Mehta", property: "Sunrise Boys PG", amount: 14000, status: "SUCCESS", mode: "UPI", date: "01 May 2025", razorpayId: "pay_Px001" },
  { id: "TXN-8811", type: "DEPOSIT", tenant: "Priya Kumar", property: "Green Valley PG", amount: 19000, status: "SUCCESS", mode: "NET_BANKING", date: "01 May 2025", razorpayId: "pay_Px002" },
  { id: "TXN-8812", type: "RENT", tenant: "Kiran Joshi", property: "Sunrise Boys PG", amount: 9500, status: "FAILED", mode: "UPI", date: "02 May 2025", razorpayId: "pay_Px003", failReason: "Bank timeout — retry eligible" },
  { id: "TXN-8813", type: "REFUND", tenant: "Mohan Pillai", property: "Green Valley PG", amount: 16000, status: "SUCCESS", mode: "REFUND_TO_SOURCE", date: "20 May 2025", razorpayId: "rfnd_Px004" },
  { id: "TXN-8814", type: "COMMISSION", tenant: "—", property: "Sunrise Boys PG", amount: 1400, status: "SUCCESS", mode: "INTERNAL", date: "01 May 2025", razorpayId: "trns_Px005" },
  { id: "TXN-8815", type: "PAYOUT", tenant: "Ramesh Jain (Owner)", property: "Sunrise Boys PG", amount: 12600, status: "SUCCESS", mode: "NEFT", date: "05 May 2025", razorpayId: "pout_Px006" },
  { id: "TXN-8816", type: "RENT", tenant: "Sneha Reddy", property: "Sunshine PG", amount: 7500, status: "FAILED", mode: "CARD", date: "01 May 2025", razorpayId: "pay_Px007", failReason: "Card declined — insufficient funds" },
  { id: "TXN-8817", type: "RENT", tenant: "Amit Shah", property: "Urban Nest PG", amount: 8500, status: "PENDING", mode: "UPI", date: "31 May 2025", razorpayId: "pay_Px008" },
  { id: "TXN-8818", type: "DEPOSIT", tenant: "Ravi Teja", property: "Urban Nest PG", amount: 17000, status: "SUCCESS", mode: "UPI", date: "01 May 2025", razorpayId: "pay_Px009" },
  { id: "TXN-8819", type: "COMMISSION", tenant: "—", property: "Green Valley PG", amount: 950, status: "SUCCESS", mode: "INTERNAL", date: "01 May 2025", razorpayId: "trns_Px010" },
];

const COMMISSION_LEDGER = [
  { owner: "Ramesh Jain", property: "Sunrise Boys PG", grossRent: 163200, commission: 16320, gst: 2937, net: 144880 },
  { owner: "Priya Hegde", property: "Green Valley PG", grossRent: 102000, commission: 10200, gst: 1836, net: 89964 },
  { owner: "Arun Kumar", property: "Urban Nest PG", grossRent: 85000, commission: 8500, gst: 1530, net: 74970 },
];

const STATUS_STYLE: Record<TxnStatus, string> = {
  SUCCESS: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  PENDING: "bg-amber-100 text-amber-700",
  REFUNDED: "bg-purple-100 text-purple-700",
};

const TYPE_STYLE: Record<TxnType, string> = {
  RENT: "bg-blue-100 text-blue-700",
  DEPOSIT: "bg-purple-100 text-purple-700",
  REFUND: "bg-amber-100 text-amber-700",
  COMMISSION: "bg-slate-100 text-slate-600",
  PAYOUT: "bg-emerald-100 text-emerald-700",
};

const TABS = ["All transactions", "Failed", "Commission ledger", "Refunds"] as const;

export default function PaymentsPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("All transactions");
  const [search, setSearch] = useState("");
  const [retried, setRetried] = useState<string[]>([]);

  const failed = TRANSACTIONS.filter((t) => t.status === "FAILED");
  const refunds = TRANSACTIONS.filter((t) => t.type === "REFUND");

  const displayed = tab === "Failed" ? failed : tab === "Refunds" ? refunds : TRANSACTIONS.filter((t) => {
    if (!search) return true;
    return t.id.toLowerCase().includes(search.toLowerCase()) || t.tenant.toLowerCase().includes(search.toLowerCase()) || t.property.toLowerCase().includes(search.toLowerCase());
  });

  const totalGMV = TRANSACTIONS.filter((t) => t.status === "SUCCESS" && t.type === "RENT").reduce((s, t) => s + t.amount, 0);
  const totalFailed = failed.reduce((s, t) => s + t.amount, 0);
  const totalCommission = TRANSACTIONS.filter((t) => t.type === "COMMISSION").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-black text-slate-900">Payments</h1>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Rent collected (May)", value: formatInr(totalGMV), color: "text-emerald-600" },
          { label: "Failed payments", value: formatInr(totalFailed), color: "text-red-600", count: failed.length },
          { label: "Commission (May)", value: formatInr(totalCommission), color: "text-purple-600" },
          { label: "Pending payouts", value: formatInr(157580), color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            {s.count !== undefined && <p className="text-xs text-slate-400 mt-0.5">{s.count} transactions</p>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${tab === t ? "border-accent text-accent" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {t}
            {t === "Failed" && failed.length > 0 && (
              <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">{failed.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab !== "Commission ledger" && (
        <>
          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm outline-none focus:border-accent"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Transaction table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["ID", "Type", "Tenant", "Property", "Amount", "Mode", "Status", "Date", "Razorpay ID", ...(tab === "Failed" ? ["Actions"] : [])].map((col) => (
                    <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayed.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{t.id}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TYPE_STYLE[t.type]}`}>{t.type}</span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{t.tenant}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{t.property}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-800">{formatInr(t.amount)}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{t.mode}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-400">{t.date}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{t.razorpayId}</td>
                    {tab === "Failed" && (
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => setRetried((prev) => [...prev, t.id])}
                          disabled={retried.includes(t.id)}
                          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-light disabled:opacity-40"
                        >
                          <RefreshCw className="h-3 w-3" />
                          {retried.includes(t.id) ? "Retried" : "Retry"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {tab === "Failed" && displayed.some((t) => t.failReason) && (
              <div className="border-t border-slate-100 px-4 py-3">
                {displayed.filter((t) => t.failReason).map((t) => (
                  <p key={t.id} className="text-xs text-red-600"><strong>{t.id}:</strong> {t.failReason}</p>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "Commission ledger" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Owner", "Property", "Gross rent", "Commission (10%)", "GST (18%)", "Net to owner", "Status"].map((col) => (
                  <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {COMMISSION_LEDGER.map((row) => (
                <tr key={row.owner} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.owner}</td>
                  <td className="px-4 py-3 text-slate-600">{row.property}</td>
                  <td className="px-4 py-3 font-bold">{formatInr(row.grossRent)}</td>
                  <td className="px-4 py-3 font-bold text-purple-600">{formatInr(row.commission)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatInr(row.gst)}</td>
                  <td className="px-4 py-3 font-black text-emerald-600">{formatInr(row.net)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Settled</span>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold">
                <td className="px-4 py-3" colSpan={2}>Total</td>
                <td className="px-4 py-3">{formatInr(COMMISSION_LEDGER.reduce((s, r) => s + r.grossRent, 0))}</td>
                <td className="px-4 py-3 text-purple-600">{formatInr(COMMISSION_LEDGER.reduce((s, r) => s + r.commission, 0))}</td>
                <td className="px-4 py-3 text-slate-500">{formatInr(COMMISSION_LEDGER.reduce((s, r) => s + r.gst, 0))}</td>
                <td className="px-4 py-3 text-emerald-600">{formatInr(COMMISSION_LEDGER.reduce((s, r) => s + r.net, 0))}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
