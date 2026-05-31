"use client";

import { useState } from "react";
import {
  AlertTriangle, CheckCircle, Clock, FileText, Gavel, Image, MessageSquare, X,
} from "lucide-react";
import { Button, Dialog, Textarea } from "@/components/ui";
import { formatInr } from "@/lib/utils";

type DisputePriority = "HIGH" | "MEDIUM" | "LOW";
type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED";

interface Dispute {
  id: string;
  bookingId: string;
  tenantName: string;
  tenantPhone: string;
  property: string;
  city: string;
  disputedAmount: number;
  daysOpen: number;
  priority: DisputePriority;
  status: DisputeStatus;
  evidenceCount: number;
  category: string;

  // Detail
  managerSplit: { tenant: number; owner: number };
  managerNotes: string;
  tenantClaim: string;
  tenantEvidenceUrls: string[];
  managerPhotos: string[];
  timeline: { time: string; actor: string; message: string }[];
}

const DISPUTES: Dispute[] = [
  {
    id: "D-2204",
    bookingId: "BK-4398",
    tenantName: "Vikram Nair",
    tenantPhone: "9444555666",
    property: "City Nest Co-living",
    city: "Mumbai",
    disputedAmount: 24000,
    daysOpen: 8,
    priority: "HIGH",
    status: "UNDER_REVIEW",
    evidenceCount: 6,
    category: "Deposit refund",
    managerSplit: { tenant: 18000, owner: 6000 },
    managerNotes: "Bed frame was damaged by tenant. Repainting and new mattress required. Cost estimated ₹6,000.",
    tenantClaim: "The damages were pre-existing before I moved in. I have photos from my move-in day showing the cracks. Manager is incorrectly blaming me.",
    tenantEvidenceUrls: ["move-in-photo-1.jpg", "move-in-photo-2.jpg"],
    managerPhotos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=200&q=80",
    ],
    timeline: [
      { time: "23 May, 4:00 PM", actor: "Tenant", message: "Dispute opened: deposit not refunded within 7 days" },
      { time: "24 May, 9:00 AM", actor: "Manager", message: "Responded: damage costs deducted, photo evidence uploaded" },
      { time: "25 May, 11:00 AM", actor: "Tenant", message: "Counter-claim: damages were pre-existing, attached move-in photos" },
      { time: "26 May, 2:00 PM", actor: "Admin (Ananya)", message: "Under review — requested additional documentation from both parties" },
    ],
  },
  {
    id: "D-2198",
    bookingId: "BK-4210",
    tenantName: "Sunita Rao",
    tenantPhone: "9777888999",
    property: "Sunrise Boys PG",
    city: "Bangalore",
    disputedAmount: 7500,
    daysOpen: 3,
    priority: "HIGH",
    status: "OPEN",
    evidenceCount: 2,
    category: "Service quality",
    managerSplit: { tenant: 0, owner: 7500 },
    managerNotes: "Rent collected. Services provided as listed.",
    tenantClaim: "No AC in room for 15 days. Complained multiple times but no action taken. Requesting partial refund.",
    tenantEvidenceUrls: ["complaint-screenshots.pdf"],
    managerPhotos: [],
    timeline: [
      { time: "28 May, 6:00 PM", actor: "Tenant", message: "Raised dispute: AC non-functional for 15 days" },
      { time: "29 May, 10:00 AM", actor: "Manager", message: "Denied claim: AC was repaired within 3 days" },
    ],
  },
  {
    id: "D-2195",
    bookingId: "BK-4180",
    tenantName: "Mohan Pillai",
    tenantPhone: "9333444555",
    property: "Green Valley PG",
    city: "Bangalore",
    disputedAmount: 19000,
    daysOpen: 15,
    priority: "MEDIUM",
    status: "RESOLVED",
    evidenceCount: 4,
    category: "Deposit refund",
    managerSplit: { tenant: 16000, owner: 3000 },
    managerNotes: "Minor cleaning charges.",
    tenantClaim: "Full refund expected.",
    tenantEvidenceUrls: [],
    managerPhotos: [],
    timeline: [
      { time: "15 May", actor: "Tenant", message: "Dispute opened" },
      { time: "20 May", actor: "Admin (Vikram)", message: "Resolved: ₹16,000 to tenant, ₹3,000 to owner" },
    ],
  },
];

const PRIORITY_STYLES: Record<DisputePriority, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

const STATUS_STYLES: Record<DisputeStatus, string> = {
  OPEN: "bg-red-50 border-red-300",
  UNDER_REVIEW: "bg-amber-50 border-amber-300",
  RESOLVED: "bg-emerald-50 border-emerald-300",
};

export default function DisputesPage() {
  const [selected, setSelected] = useState<Dispute | null>(DISPUTES[0] ?? null);
  const [refundToTenant, setRefundToTenant] = useState("");
  const [refundToOwner, setRefundToOwner] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [resolved, setResolved] = useState<string[]>([]);

  const activeDisputes = DISPUTES.filter((d) => !resolved.includes(d.id));
  const open = activeDisputes.filter((d) => d.status !== "RESOLVED");
  const sortedOpen = [...open].sort((a, b) =>
    a.priority === "HIGH" ? -1 : b.priority === "HIGH" ? 1 : 0,
  );

  function executeDecision() {
    if (!selected || !decisionNotes.trim()) return;
    setResolved((prev) => [...prev, selected.id]);
    setConfirmDialog(false);
    setSelected(null);
    setDecisionNotes("");
    setRefundToTenant("");
    setRefundToOwner("");
  }

  return (
    <div className="flex h-[calc(100vh-48px-48px)] gap-4">
      {/* ── Left: Queue ── */}
      <div className="flex w-80 shrink-0 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-black text-slate-900">Disputes</h1>
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">{sortedOpen.length} open</span>
        </div>

        <div className="flex-1 overflow-y-auto grid gap-2 content-start">
          {sortedOpen.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setSelected(d);
                setRefundToTenant(d.managerSplit.tenant.toString());
                setRefundToOwner(d.managerSplit.owner.toString());
              }}
              className={`w-full rounded-xl border-2 p-4 text-left transition ${
                selected?.id === d.id ? "border-accent" : STATUS_STYLES[d.status]
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{d.tenantName}</p>
                  <p className="text-xs text-slate-500">{d.property}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_STYLES[d.priority]}`}>
                  {d.priority}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-accent">{formatInr(d.disputedAmount)}</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {d.daysOpen}d open
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-slate-100 px-2 py-0.5">{d.category}</span>
                <span>{d.evidenceCount} evidence files</span>
              </div>
            </button>
          ))}

          {resolved.length > 0 && (
            <p className="text-center text-xs text-slate-400 py-2">{resolved.length} resolved this session</p>
          )}
        </div>
      </div>

      {/* ── Right: Detail ── */}
      {!selected ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
          <div className="text-center">
            <Gavel className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-400">Select a dispute to review</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900">Dispute {selected.id}</h2>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_STYLES[selected.priority]}`}>
                  {selected.priority} priority
                </span>
                <span className="text-xs font-mono text-slate-400">Booking {selected.bookingId}</span>
              </div>
              <p className="text-xs text-slate-400">{selected.property} · {selected.tenantName} · {selected.daysOpen} days open</p>
            </div>
            <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-slate-400" /></button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-5 grid gap-5">
              {/* Two-column context */}
              <div className="grid gap-4 xl:grid-cols-2">
                {/* Manager's position */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-bold text-blue-700 mb-2">MANAGER'S POSITION</p>
                  <p className="text-sm text-blue-800 mb-3">{selected.managerNotes}</p>
                  <div className="flex gap-3">
                    <div className="rounded-lg bg-white px-3 py-2 text-center text-xs">
                      <p className="font-black text-emerald-600">{formatInr(selected.managerSplit.tenant)}</p>
                      <p className="text-slate-400">to tenant</p>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 text-center text-xs">
                      <p className="font-black text-blue-600">{formatInr(selected.managerSplit.owner)}</p>
                      <p className="text-slate-400">to owner</p>
                    </div>
                  </div>
                  {selected.managerPhotos.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {selected.managerPhotos.map((src, i) => (
                        <div key={i} className="h-16 w-20 overflow-hidden rounded-lg border border-blue-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="Evidence" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tenant's counter-claim */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-bold text-amber-700 mb-2">TENANT'S COUNTER-CLAIM</p>
                  <p className="text-sm text-amber-800 mb-3">{selected.tenantClaim}</p>
                  {selected.tenantEvidenceUrls.length > 0 && (
                    <div className="grid gap-1">
                      {selected.tenantEvidenceUrls.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 text-xs">
                          <FileText className="h-3.5 w-3.5 text-amber-600" />
                          <span className="text-amber-700">{f}</span>
                          <button className="ml-auto font-semibold text-amber-700 hover:underline">View</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Communication timeline */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> Communication timeline
                </p>
                <div className="relative grid gap-3 pl-4">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />
                  {selected.timeline.map((t, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[17px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-300 ring-2 ring-white" />
                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700">{t.actor}</span>
                          <span className="text-slate-400">{t.time}</span>
                        </div>
                        <p className="text-sm text-slate-600">{t.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin decision form */}
              {selected.status !== "RESOLVED" && (
                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
                  <p className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-primary" /> Admin Decision
                  </p>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Refund to tenant (₹)</label>
                        <input
                          type="number"
                          className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-accent"
                          value={refundToTenant}
                          onChange={(e) => setRefundToTenant(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Release to owner (₹)</label>
                        <input
                          type="number"
                          className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-accent"
                          value={refundToOwner}
                          onChange={(e) => setRefundToOwner(e.target.value)}
                        />
                      </div>
                    </div>
                    {refundToTenant && refundToOwner && (
                      <div className="rounded-lg bg-white px-3 py-2 text-xs text-slate-500">
                        Total: {formatInr(Number(refundToTenant) + Number(refundToOwner))} of {formatInr(selected.disputedAmount)} disputed amount
                      </div>
                    )}
                    <div className="grid gap-1.5">
                      <label className="text-sm font-semibold text-slate-700">Decision notes (required)</label>
                      <Textarea
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        placeholder="Document reasoning for this decision. This will be sent to both parties..."
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={() => setConfirmDialog(true)}
                      disabled={!decisionNotes.trim() || !refundToTenant}
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-light disabled:opacity-40"
                    >
                      <Gavel className="h-4 w-4" /> Execute decision
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      <Dialog open={confirmDialog} title="Confirm dispute decision" onClose={() => setConfirmDialog(false)}>
        <div className="grid gap-4">
          <div className="rounded-xl bg-slate-50 p-4 grid gap-2 text-sm">
            <p><strong>Refund to tenant:</strong> {formatInr(Number(refundToTenant))}</p>
            <p><strong>Release to owner:</strong> {formatInr(Number(refundToOwner))}</p>
            <p className="text-slate-500 text-xs mt-1">This will trigger Razorpay refund and notify both parties.</p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDialog(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Go back
            </button>
            <button onClick={executeDecision} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-light">
              Confirm & execute
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
