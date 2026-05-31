"use client";

import { useState } from "react";
import Link from "next/link";
import { use } from "react";
import {
  AlertTriangle, ChevronRight, CreditCard, Download,
  FileText, MessageSquare, Pencil,
} from "lucide-react";
import { Badge, Button, Dialog, DatePicker, Select } from "@/components/ui";
import { formatInr } from "@/lib/utils";
import { useGiveNotice } from "@/lib/api/bookings";

const MOCK_BOOKING = {
  id: "bk-001",
  propertyName: "Sunrise Boys PG",
  propertySlug: "sunrise-boys-pg-koramangala",
  bedLabel: "Bed A",
  roomNumber: "201",
  floor: "2nd Floor",
  checkIn: "2024-12-01",
  monthlyRent: 10200,
  depositAmount: 20400,
  status: "ACTIVE" as const,
  agreementUrl: "#",
  photoUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
};

const RENT_RECORDS = [
  { month: "May 2025", amount: 10200, status: "PENDING" as const, dueDate: "5 Jun 2025" },
  { month: "Apr 2025", amount: 10200, status: "PAID" as const, paidOn: "3 Apr 2025", receiptUrl: "#" },
  { month: "Mar 2025", amount: 10200, status: "PAID" as const, paidOn: "2 Mar 2025", receiptUrl: "#" },
  { month: "Feb 2025", amount: 10200, status: "PAID" as const, paidOn: "4 Feb 2025", receiptUrl: "#" },
  { month: "Jan 2025", amount: 10200, status: "PAID" as const, paidOn: "5 Jan 2025", receiptUrl: "#" },
  { month: "Dec 2024", amount: 10200, status: "PAID" as const, paidOn: "1 Dec 2024", receiptUrl: "#" },
];

const COMPLAINTS = [
  { id: "c1", title: "WiFi speed very slow in room 201", category: "WiFi", status: "OPEN", created: "2 Jun 2025" },
];

const STATUS_BADGE: Record<string, { label: string; variant: "active" | "due" | "overdue" | "paid" }> = {
  PAID: { label: "Paid", variant: "paid" },
  PENDING: { label: "Due", variant: "due" },
  OVERDUE: { label: "Overdue", variant: "overdue" },
};

const NOTICE_REASONS = ["Found another accommodation", "Job relocation", "Personal reasons", "Property issues", "Other"];

function MoveOutModal({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const tomorrow30 = new Date();
  tomorrow30.setDate(tomorrow30.getDate() + 30);
  const minDate = tomorrow30.toISOString().split("T")[0]!;

  const [moveOutDate, setMoveOutDate] = useState(minDate);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const giveNotice = useGiveNotice();

  async function handleSubmit() {
    try {
      await giveNotice.mutateAsync({ bookingId, moveOutDate, reason });
    } catch { /* demo */ }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mb-4 grid h-14 w-14 mx-auto place-items-center rounded-full bg-amber-50">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
        </div>
        <p className="text-lg font-bold">Notice submitted</p>
        <p className="mt-2 text-sm text-text-secondary">
          Your bed will be relisted from {new Date(moveOutDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
          You&apos;ll receive a confirmation shortly.
        </p>
        <Button className="mt-5 w-full" onClick={onClose}>Done</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">30-day notice required</p>
        <p className="mt-1">Per your agreement, you must give 30 days notice. The earliest you can move out is {new Date(minDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}.</p>
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Move-out date</label>
        <DatePicker value={moveOutDate} onChange={(e) => setMoveOutDate((e.target as HTMLInputElement).value)} min={minDate} />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Reason (optional)</label>
        <Select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">Select a reason…</option>
          {NOTICE_REASONS.map((r) => <option key={r}>{r}</option>)}
        </Select>
      </div>

      <Button className="w-full" onClick={handleSubmit} disabled={giveNotice.isPending}>
        Confirm move-out notice
      </Button>
    </div>
  );
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [noticeOpen, setNoticeOpen] = useState(false);

  const bk = MOCK_BOOKING;

  return (
    <div className="grid gap-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black">{bk.propertyName}</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Room {bk.roomNumber} · {bk.bedLabel} · {bk.floor}</p>
        </div>
        <Badge variant="active">Active</Badge>
      </div>

      {/* Photo + key info */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bk.photoUrl} alt={bk.propertyName} className="h-full w-full object-cover" />
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border border-t border-border sm:grid-cols-4">
          {[
            { label: "Move-in", value: new Date(bk.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
            { label: "Monthly rent", value: formatInr(bk.monthlyRent) },
            { label: "Security deposit", value: formatInr(bk.depositAmount) },
            { label: "Booking ID", value: <span className="font-mono text-xs">{bk.id}</span> },
          ].map(({ label, value }) => (
            <div key={label} className="p-3">
              <p className="text-xs text-text-tertiary">{label}</p>
              <p className="mt-0.5 font-semibold text-sm">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/tenant/bookings/${id}/pay`} className="flex-1">
          <Button className="w-full"><CreditCard className="h-4 w-4" /> Pay rent</Button>
        </Link>
        <Link href="/tenant/complaints" className="flex-1">
          <Button variant="outline" className="w-full"><MessageSquare className="h-4 w-4" /> Raise complaint</Button>
        </Link>
        <Button variant="outline" className="flex-1 text-amber-600 border-amber-300 hover:bg-amber-50" onClick={() => setNoticeOpen(true)}>
          <Pencil className="h-4 w-4" /> Give notice
        </Button>
      </div>

      {/* Rent records */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-bold">Rent history</p>
          <Link href={`/tenant/bookings/${id}/pay`} className="text-xs font-semibold text-accent">Pay pending →</Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          {RENT_RECORDS.map((rec, i) => {
            const { label, variant } = STATUS_BADGE[rec.status] ?? { label: rec.status, variant: "neutral" };
            return (
              <div key={rec.month} className={`flex items-center justify-between gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                <div>
                  <p className="text-sm font-semibold">{rec.month}</p>
                  <p className="text-xs text-text-tertiary">
                    {rec.status === "PAID" && rec.paidOn ? `Paid on ${rec.paidOn}` : `Due on ${rec.dueDate ?? "—"}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">{formatInr(rec.amount)}</span>
                  <Badge variant={variant} className="text-xs">{label}</Badge>
                  {rec.status === "PAID" && rec.receiptUrl && (
                    <a href={rec.receiptUrl} className="text-text-tertiary hover:text-primary">
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active complaints */}
      {COMPLAINTS.length > 0 && (
        <section>
          <p className="mb-3 font-bold">Active complaints</p>
          <div className="grid gap-2">
            {COMPLAINTS.map((c) => (
              <Link key={c.id} href="/tenant/complaints" className="flex items-center justify-between rounded-xl border border-border bg-white p-4 hover:border-primary">
                <div>
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="mt-0.5 text-xs text-text-tertiary">{c.category} · {c.created}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="due" className="text-xs">{c.status}</Badge>
                  <ChevronRight className="h-4 w-4 text-text-tertiary" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Documents */}
      <section>
        <p className="mb-3 font-bold">Documents</p>
        <div className="grid gap-2">
          {[
            { label: "Rent agreement", icon: FileText, href: bk.agreementUrl },
            { label: "Booking confirmation", icon: FileText, href: "#" },
          ].map(({ label, icon: Icon, href }) => (
            <a key={label} href={href} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary">
              <Icon className="h-5 w-5 text-text-tertiary" />
              <span className="flex-1 text-sm font-medium">{label}</span>
              <Download className="h-4 w-4 text-text-tertiary" />
            </a>
          ))}
        </div>
      </section>

      {/* Emergency exit */}
      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">Emergency exit</p>
        <p className="mt-1 text-xs text-red-600">For safety emergencies or urgent situations that require immediate vacating.</p>
        <Button size="sm" variant="outline" className="mt-3 border-red-300 text-red-700 hover:bg-red-100">
          Request emergency exit
        </Button>
      </div>

      <Dialog open={noticeOpen} title="Give move-out notice" onClose={() => setNoticeOpen(false)}>
        <MoveOutModal bookingId={id} onClose={() => setNoticeOpen(false)} />
      </Dialog>
    </div>
  );
}
