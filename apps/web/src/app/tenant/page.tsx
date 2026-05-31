"use client";

import Link from "next/link";
import {
  Bell, BedDouble, CalendarDays, ChevronRight, CreditCard,
  MessageSquare, Share2, Utensils,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { formatInr } from "@/lib/utils";

// ─── Mock data ───────────────────────────────────────────────────────────────

const ACTIVE_BOOKING = {
  id: "bk-001",
  propertyName: "Sunrise Boys PG",
  propertySlug: "sunrise-boys-pg-koramangala",
  bedLabel: "Bed A",
  roomNumber: "201",
  checkIn: "2024-12-01",
  monthlyRent: 10200,
  daysRemaining: 14,
  photoUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
};

const RENT_DUE = {
  amount: 10200,
  dueDate: "5 Jun 2025",
  status: "DUE" as const,
  bookingId: "bk-001",
};

const NOTIFICATIONS = [
  { id: "n1", icon: CreditCard, text: "Rent of ₹10,200 is due on 5 Jun 2025", time: "2h ago", read: false },
  { id: "n2", icon: MessageSquare, text: "Your complaint #3 has been resolved", time: "1d ago", read: true },
  { id: "n3", icon: Bell, text: "Your KYC has been verified ✓", time: "3d ago", read: true },
];

const QUICK_ACTIONS = [
  { icon: CreditCard, label: "Pay rent", href: "/tenant/bookings/bk-001/pay", color: "bg-blue-50 text-blue-600" },
  { icon: MessageSquare, label: "Raise complaint", href: "/tenant/complaints", color: "bg-orange-50 text-orange-600" },
  { icon: Utensils, label: "Food menu", href: `/properties/${ACTIVE_BOOKING.propertySlug}#food`, color: "bg-green-50 text-green-600" },
  { icon: Share2, label: "Refer a friend", href: "/tenant/refer", color: "bg-purple-50 text-purple-600" },
];

export default function TenantOverviewPage() {
  return (
    <div className="grid gap-6 pb-24 lg:pb-6">
      <div>
        <h1 className="text-2xl font-black">Welcome back</h1>
        <p className="mt-1 text-text-secondary">Here&apos;s what&apos;s happening with your stay</p>
      </div>

      {/* Active booking card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="relative h-28 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ACTIVE_BOOKING.photoUrl} alt={ACTIVE_BOOKING.propertyName} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 text-white">
            <p className="font-bold">{ACTIVE_BOOKING.propertyName}</p>
            <p className="text-sm opacity-80">Room {ACTIVE_BOOKING.roomNumber} · {ACTIVE_BOOKING.bedLabel}</p>
          </div>
          <Badge variant="active" className="absolute right-3 top-3">Active</Badge>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
          {[
            { label: "Move-in", value: new Date(ACTIVE_BOOKING.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) },
            { label: "Monthly rent", value: formatInr(ACTIVE_BOOKING.monthlyRent) },
            { label: "Days left", value: ACTIVE_BOOKING.daysRemaining.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className="text-xs text-text-tertiary">{label}</p>
              <p className="mt-0.5 font-bold">{value}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border px-4 py-3">
          <Link href={`/tenant/bookings/${ACTIVE_BOOKING.id}`} className="flex items-center justify-between text-sm font-semibold text-accent">
            View booking details <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Rent due card */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-50">
            <CreditCard className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Rent due</p>
            <p className="text-2xl font-black">{formatInr(RENT_DUE.amount)}</p>
            <p className="text-xs text-text-secondary">Due on {RENT_DUE.dueDate}</p>
          </div>
        </div>
        <Link href={`/tenant/bookings/${RENT_DUE.bookingId}/pay`}>
          <Button size="sm" className="shrink-0">Pay now</Button>
        </Link>
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-sm font-bold text-text-secondary uppercase tracking-wide">Quick actions</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ icon: Icon, label, href, color }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-white p-4 transition hover:shadow-md"
            >
              <span className={`grid h-11 w-11 place-items-center rounded-full ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <p className="mb-3 text-sm font-bold text-text-secondary uppercase tracking-wide">Recent notifications</p>
        <div className="grid gap-2">
          {NOTIFICATIONS.map(({ id, icon: Icon, text, time, read }) => (
            <div key={id} className={`flex items-start gap-3 rounded-xl border border-border p-4 ${!read ? "bg-primary/5" : "bg-white"}`}>
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${!read ? "text-primary" : "text-text-tertiary"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!read ? "font-semibold" : ""}`}>{text}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">{time}</p>
              </div>
              {!read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
