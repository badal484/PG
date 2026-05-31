"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Download, Search, X } from "lucide-react";
import { Dialog } from "@/components/ui";

type ActionType =
  | "PROPERTY_APPROVED" | "PROPERTY_REJECTED" | "PROPERTY_SUSPENDED"
  | "BOOKING_CANCELLED" | "BOOKING_FORCE_COMPLETED" | "BOOKING_OVERRIDDEN"
  | "REFUND_ISSUED" | "ESCROW_RELEASED" | "PAYMENT_RETRIED"
  | "USER_SUSPENDED" | "USER_UNSUSPENDED" | "USER_VERIFIED"
  | "DISPUTE_RESOLVED" | "BROADCAST_SENT" | "FLAG_ADDED" | "FLAG_REMOVED"
  | "TIER_CHANGED" | "CONFIG_UPDATED" | "FEATURE_FLAG_TOGGLED";

interface AuditEntry {
  id: string;
  adminName: string;
  adminEmail: string;
  action: ActionType;
  entityType: "PROPERTY" | "BOOKING" | "USER" | "PAYMENT" | "DISPUTE" | "CONFIG";
  entityId: string;
  entityLabel: string;
  timestamp: string;
  ip: string;
  diff: { before: Record<string, unknown>; after: Record<string, unknown> };
}

const AUDIT_LOG: AuditEntry[] = [
  {
    id: "AUD-2001",
    adminName: "Sneha Kapoor", adminEmail: "sneha@roomly.in",
    action: "PROPERTY_APPROVED", entityType: "PROPERTY", entityId: "PRP-1004", entityLabel: "Urban Nest PG",
    timestamp: "2025-05-31 11:42:18", ip: "10.0.0.4",
    diff: {
      before: { status: "PENDING_VERIFICATION", tier: "UNTIERED", inspectionScore: null },
      after: { status: "ACTIVE", tier: "PREMIUM", inspectionScore: 26 },
    },
  },
  {
    id: "AUD-2002",
    adminName: "Arjun Mehra", adminEmail: "arjun@roomly.in",
    action: "DISPUTE_RESOLVED", entityType: "DISPUTE", entityId: "D-2204", entityLabel: "Dispute D-2204 (Vikram Nair)",
    timestamp: "2025-05-31 10:15:03", ip: "10.0.0.7",
    diff: {
      before: { status: "OPEN", refundToTenant: 0, releasedToOwner: 24000 },
      after: { status: "RESOLVED", refundToTenant: 16000, releasedToOwner: 8000, adminNote: "Damage evidence insufficient. Partial refund." },
    },
  },
  {
    id: "AUD-2003",
    adminName: "Sneha Kapoor", adminEmail: "sneha@roomly.in",
    action: "REFUND_ISSUED", entityType: "PAYMENT", entityId: "TXN-8813", entityLabel: "₹16,000 refund — Mohan Pillai",
    timestamp: "2025-05-30 16:55:44", ip: "10.0.0.4",
    diff: {
      before: { status: "PENDING_REFUND", refundAmount: 0 },
      after: { status: "REFUNDED", refundAmount: 16000, razorpayRefId: "rfnd_Px004", processedAt: "2025-05-30T16:55:44Z" },
    },
  },
  {
    id: "AUD-2004",
    adminName: "Arjun Mehra", adminEmail: "arjun@roomly.in",
    action: "USER_SUSPENDED", entityType: "USER", entityId: "USR-1005", entityLabel: "Kiran Joshi",
    timestamp: "2025-05-30 14:20:11", ip: "10.0.0.7",
    diff: {
      before: { status: "ACTIVE", kycVerified: false },
      after: { status: "SUSPENDED", suspendedAt: "2025-05-30T14:20:11Z", reason: "KYC verification failed — suspicious documents." },
    },
  },
  {
    id: "AUD-2005",
    adminName: "Priya Nambiar", adminEmail: "priya.n@roomly.in",
    action: "FEATURE_FLAG_TOGGLED", entityType: "CONFIG", entityId: "flag:betaKycV2", entityLabel: "Feature flag: KYC v2 (beta)",
    timestamp: "2025-05-30 12:08:32", ip: "10.0.0.11",
    diff: {
      before: { enabled: false },
      after: { enabled: true, enabledBy: "priya.n@roomly.in", enabledAt: "2025-05-30T12:08:32Z" },
    },
  },
  {
    id: "AUD-2006",
    adminName: "Priya Nambiar", adminEmail: "priya.n@roomly.in",
    action: "CONFIG_UPDATED", entityType: "CONFIG", entityId: "commission:monthly", entityLabel: "Commission rate — Monthly",
    timestamp: "2025-05-30 11:45:00", ip: "10.0.0.11",
    diff: {
      before: { rate: 12, gstIncluded: true },
      after: { rate: 10, gstIncluded: true, updatedBy: "priya.n@roomly.in" },
    },
  },
  {
    id: "AUD-2007",
    adminName: "Sneha Kapoor", adminEmail: "sneha@roomly.in",
    action: "BOOKING_CANCELLED", entityType: "BOOKING", entityId: "BK-4399", entityLabel: "Booking BK-4399 — Kiran Joshi",
    timestamp: "2025-05-29 17:03:27", ip: "10.0.0.4",
    diff: {
      before: { status: "ACTIVE", cancelledAt: null },
      after: { status: "CANCELLED", cancelledAt: "2025-05-29T17:03:27Z", reason: "Tenant suspended — KYC failure", refundAmount: 0 },
    },
  },
  {
    id: "AUD-2008",
    adminName: "Arjun Mehra", adminEmail: "arjun@roomly.in",
    action: "ESCROW_RELEASED", entityType: "PAYMENT", entityId: "ESC-004", entityLabel: "Escrow ESC-004 — Deepa Rao",
    timestamp: "2025-05-29 15:30:50", ip: "10.0.0.7",
    diff: {
      before: { status: "PENDING_RELEASE", depositAmount: 16000 },
      after: { status: "RELEASED", releasedAt: "2025-05-29T15:30:50Z", releasedTo: "owner", adminNote: "Checkout verified clean." },
    },
  },
  {
    id: "AUD-2009",
    adminName: "Priya Nambiar", adminEmail: "priya.n@roomly.in",
    action: "BROADCAST_SENT", entityType: "CONFIG", entityId: "broadcast:20250528", entityLabel: "Broadcast to all tenants",
    timestamp: "2025-05-28 10:00:00", ip: "10.0.0.11",
    diff: {
      before: {},
      after: { target: "ALL_TENANTS", message: "Nestify maintenance window: 2 AM to 4 AM on 30 May.", channels: ["push", "sms", "in-app"], sentCount: 3841 },
    },
  },
  {
    id: "AUD-2010",
    adminName: "Sneha Kapoor", adminEmail: "sneha@roomly.in",
    action: "PROPERTY_REJECTED", entityType: "PROPERTY", entityId: "PRP-2009", entityLabel: "Sunrise Girls PG (new)",
    timestamp: "2025-05-27 14:22:39", ip: "10.0.0.4",
    diff: {
      before: { status: "PENDING_VERIFICATION" },
      after: { status: "REJECTED", rejectedAt: "2025-05-27T14:22:39Z", reason: "Inspection score below minimum (8/30). Multiple safety violations." },
    },
  },
  {
    id: "AUD-2011",
    adminName: "Arjun Mehra", adminEmail: "arjun@roomly.in",
    action: "TIER_CHANGED", entityType: "PROPERTY", entityId: "PRP-1006", entityLabel: "Bloom Stay",
    timestamp: "2025-05-26 16:44:12", ip: "10.0.0.7",
    diff: {
      before: { tier: "STANDARD", inspectionScore: 18 },
      after: { tier: "BUDGET", inspectionScore: 14, changedAt: "2025-05-26T16:44:12Z", reason: "Re-inspection resulted in lower score." },
    },
  },
  {
    id: "AUD-2012",
    adminName: "Priya Nambiar", adminEmail: "priya.n@roomly.in",
    action: "USER_VERIFIED", entityType: "USER", entityId: "USR-1003", entityLabel: "Vikram Nair",
    timestamp: "2025-05-26 11:10:05", ip: "10.0.0.11",
    diff: {
      before: { kycVerified: false, kycStatus: "PENDING_MANUAL" },
      after: { kycVerified: true, kycStatus: "VERIFIED_MANUAL", verifiedBy: "priya.n@roomly.in", verifiedAt: "2025-05-26T11:10:05Z" },
    },
  },
];

const ACTION_STYLE: Partial<Record<ActionType, string>> = {
  PROPERTY_APPROVED: "bg-emerald-100 text-emerald-700",
  PROPERTY_REJECTED: "bg-red-100 text-red-700",
  PROPERTY_SUSPENDED: "bg-red-100 text-red-700",
  BOOKING_CANCELLED: "bg-red-100 text-red-700",
  BOOKING_FORCE_COMPLETED: "bg-blue-100 text-blue-700",
  BOOKING_OVERRIDDEN: "bg-amber-100 text-amber-700",
  REFUND_ISSUED: "bg-purple-100 text-purple-700",
  ESCROW_RELEASED: "bg-emerald-100 text-emerald-700",
  PAYMENT_RETRIED: "bg-blue-100 text-blue-700",
  USER_SUSPENDED: "bg-red-100 text-red-700",
  USER_UNSUSPENDED: "bg-emerald-100 text-emerald-700",
  USER_VERIFIED: "bg-blue-100 text-blue-700",
  DISPUTE_RESOLVED: "bg-teal-100 text-teal-700",
  BROADCAST_SENT: "bg-slate-100 text-slate-600",
  FLAG_ADDED: "bg-amber-100 text-amber-700",
  FLAG_REMOVED: "bg-slate-100 text-slate-600",
  TIER_CHANGED: "bg-amber-100 text-amber-700",
  CONFIG_UPDATED: "bg-blue-100 text-blue-700",
  FEATURE_FLAG_TOGGLED: "bg-purple-100 text-purple-700",
};

const ENTITY_STYLE: Record<AuditEntry["entityType"], string> = {
  PROPERTY: "bg-blue-100 text-blue-700",
  BOOKING: "bg-teal-100 text-teal-700",
  USER: "bg-purple-100 text-purple-700",
  PAYMENT: "bg-emerald-100 text-emerald-700",
  DISPUTE: "bg-red-100 text-red-700",
  CONFIG: "bg-slate-100 text-slate-600",
};

const ACTION_TYPES: Array<"" | ActionType> = [
  "",
  "PROPERTY_APPROVED", "PROPERTY_REJECTED", "PROPERTY_SUSPENDED",
  "BOOKING_CANCELLED", "REFUND_ISSUED", "ESCROW_RELEASED",
  "USER_SUSPENDED", "USER_UNSUSPENDED", "USER_VERIFIED",
  "DISPUTE_RESOLVED", "BROADCAST_SENT", "CONFIG_UPDATED", "FEATURE_FLAG_TOGGLED",
];

const ADMINS = ["All admins", "Sneha Kapoor", "Arjun Mehra", "Priya Nambiar"];

function JsonDiffView({ before, after }: { before: Record<string, unknown>; after: Record<string, unknown> }) {
  const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <p className="text-xs font-bold text-slate-500 mb-2">Before</p>
        <div className="rounded-lg bg-red-50 border border-red-100 p-3 font-mono text-xs">
          {"{"}
          {allKeys.map((key) => {
            const val = before[key];
            const changed = JSON.stringify(before[key]) !== JSON.stringify(after[key]);
            return (
              <div key={key} className={`pl-3 ${changed ? "text-red-600 bg-red-100 rounded" : "text-slate-500"}`}>
                <span className="text-slate-600">&quot;{key}&quot;</span>
                {": "}
                <span>{val === undefined ? <span className="text-slate-300 italic">—</span> : JSON.stringify(val)}</span>
              </div>
            );
          })}
          {"}"}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 mb-2">After</p>
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 font-mono text-xs">
          {"{"}
          {allKeys.map((key) => {
            const val = after[key];
            const changed = JSON.stringify(before[key]) !== JSON.stringify(after[key]);
            return (
              <div key={key} className={`pl-3 ${changed ? "text-emerald-700 bg-emerald-100 rounded font-bold" : "text-slate-500"}`}>
                <span className="text-slate-600">&quot;{key}&quot;</span>
                {": "}
                <span>{val === undefined ? <span className="text-slate-300 italic">—</span> : JSON.stringify(val)}</span>
              </div>
            );
          })}
          {"}"}
        </div>
      </div>
    </div>
  );
}

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [adminFilter, setAdminFilter] = useState("All admins");
  const [actionFilter, setActionFilter] = useState<"" | ActionType>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [diffDialog, setDiffDialog] = useState<AuditEntry | null>(null);

  const filtered = AUDIT_LOG.filter((entry) => {
    const matchSearch = !search
      || entry.adminName.toLowerCase().includes(search.toLowerCase())
      || entry.entityLabel.toLowerCase().includes(search.toLowerCase())
      || entry.entityId.includes(search)
      || entry.id.includes(search);
    const matchAdmin = adminFilter === "All admins" || entry.adminName === adminFilter;
    const matchAction = !actionFilter || entry.action === actionFilter;
    return matchSearch && matchAdmin && matchAction;
  });

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-black text-slate-900">Audit Log</h1>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total actions today", value: AUDIT_LOG.filter((e) => e.timestamp.startsWith("2025-05-31")).length.toString(), color: "text-primary" },
          { label: "Unique admins", value: [...new Set(AUDIT_LOG.map((e) => e.adminEmail))].length.toString(), color: "text-slate-700" },
          { label: "High-impact actions", value: AUDIT_LOG.filter((e) => ["PROPERTY_APPROVED", "DISPUTE_RESOLVED", "USER_SUSPENDED", "REFUND_ISSUED"].includes(e.action)).length.toString(), color: "text-amber-600" },
          { label: "Config changes", value: AUDIT_LOG.filter((e) => ["CONFIG_UPDATED", "FEATURE_FLAG_TOGGLED"].includes(e.action)).length.toString(), color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm outline-none focus:border-accent"
            placeholder="Search admin, entity, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-accent"
          value={adminFilter}
          onChange={(e) => setAdminFilter(e.target.value)}
        >
          {ADMINS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-accent"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as typeof actionFilter)}
        >
          <option value="">All actions</option>
          {ACTION_TYPES.filter(Boolean).map((a) => <option key={a} value={a}>{a?.replace(/_/g, " ")}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-accent"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-accent"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        {(search || adminFilter !== "All admins" || actionFilter || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearch(""); setAdminFilter("All admins"); setActionFilter(""); setDateFrom(""); setDateTo(""); }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Log table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["#", "Admin", "Action", "Entity", "Target", "Timestamp", "IP", ""].map((col) => (
                <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((entry) => (
              <>
                <tr
                  key={entry.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{entry.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-sm text-slate-800">{entry.adminName}</p>
                    <p className="text-xs text-slate-400">{entry.adminEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ACTION_STYLE[entry.action] ?? "bg-slate-100 text-slate-600"}`}>
                      {entry.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ENTITY_STYLE[entry.entityType]}`}>{entry.entityType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700">{entry.entityLabel}</p>
                    <p className="font-mono text-xs text-slate-400">{entry.entityId}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{entry.timestamp}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{entry.ip}</td>
                  <td className="px-4 py-3">
                    {expanded === entry.id
                      ? <ChevronDown className="h-4 w-4 text-slate-400" />
                      : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  </td>
                </tr>
                {expanded === entry.id && (
                  <tr key={`${entry.id}-exp`} className="bg-slate-50">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Change diff</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDiffDialog(entry); }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Expand diff
                          </button>
                        </div>
                        <JsonDiffView before={entry.diff.before} after={entry.diff.after} />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">No audit entries match your filters.</div>
        )}
        <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
          Showing {filtered.length} of {AUDIT_LOG.length} entries
        </div>
      </div>

      {/* Expanded diff dialog */}
      <Dialog open={!!diffDialog} title={`Diff — ${diffDialog?.action.replace(/_/g, " ")} · ${diffDialog?.id}`} onClose={() => setDiffDialog(null)}>
        {diffDialog && (
          <div className="grid gap-4">
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-400 text-xs">Admin</span><p className="font-semibold">{diffDialog.adminName}</p></div>
                <div><span className="text-slate-400 text-xs">Timestamp</span><p className="font-semibold font-mono text-xs">{diffDialog.timestamp}</p></div>
                <div><span className="text-slate-400 text-xs">Entity</span><p className="font-semibold">{diffDialog.entityLabel}</p></div>
                <div><span className="text-slate-400 text-xs">IP</span><p className="font-semibold font-mono text-xs">{diffDialog.ip}</p></div>
              </div>
            </div>
            <JsonDiffView before={diffDialog.diff.before} after={diffDialog.diff.after} />
            <div className="flex justify-end">
              <button onClick={() => setDiffDialog(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Close</button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
