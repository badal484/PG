"use client";

import Link from "next/link";
import { BedDouble, ChevronRight, Clock } from "lucide-react";
import { Badge, Button, EmptyState } from "@/components/ui";
import { formatInr } from "@/lib/utils";
import type { BookingStatus } from "@/lib/api/bookings";

const MOCK_BOOKINGS = [
  {
    id: "bk-001",
    propertyName: "Sunrise Boys PG",
    propertySlug: "sunrise-boys-pg-koramangala",
    locality: "Koramangala, Bangalore",
    bedLabel: "Bed A",
    roomNumber: "201",
    checkIn: "2024-12-01",
    checkOut: undefined as string | undefined,
    monthlyRent: 10200,
    status: "ACTIVE" as BookingStatus,
    photoUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80",
  },
  {
    id: "bk-000",
    propertyName: "Green Valley PG",
    propertySlug: "green-valley-pg-hsr-layout",
    locality: "HSR Layout, Bangalore",
    bedLabel: "Bed B",
    roomNumber: "102",
    checkIn: "2024-06-01",
    checkOut: "2024-11-28",
    monthlyRent: 8500,
    status: "COMPLETED" as BookingStatus,
    photoUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80",
  },
];

const STATUS_BADGE: Record<BookingStatus, { label: string; variant: "active" | "due" | "overdue" | "neutral" | "paid" }> = {
  ACTIVE: { label: "Active", variant: "active" },
  CONFIRMED: { label: "Confirmed", variant: "active" },
  PENDING: { label: "Pending", variant: "due" },
  COMPLETED: { label: "Completed", variant: "neutral" },
  CANCELLED: { label: "Cancelled", variant: "overdue" },
};

const STATUS_ACTIONS: Record<BookingStatus, Array<{ label: string; href: (id: string) => string; variant?: "outline" }>> = {
  ACTIVE: [
    { label: "Pay rent", href: (id) => `/tenant/bookings/${id}/pay` },
    { label: "Raise complaint", href: () => `/tenant/complaints`, variant: "outline" },
  ],
  CONFIRMED: [{ label: "View details", href: (id) => `/tenant/bookings/${id}` }],
  PENDING: [{ label: "Complete verification", href: (id) => `/book?bookingId=${id}` }],
  COMPLETED: [
    { label: "Write review", href: (id) => `/tenant/review/${id}` },
    { label: "View settlement", href: (id) => `/tenant/bookings/${id}`, variant: "outline" },
  ],
  CANCELLED: [{ label: "Browse properties", href: () => `/search` }],
};

function BookingCard({ booking }: { booking: typeof MOCK_BOOKINGS[0] }) {
  const { label, variant } = STATUS_BADGE[booking.status];
  const actions = STATUS_ACTIONS[booking.status];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex gap-4 p-4">
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={booking.photoUrl} alt={booking.propertyName} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/tenant/bookings/${booking.id}`} className="font-bold hover:text-primary line-clamp-1">
              {booking.propertyName}
            </Link>
            <Badge variant={variant} className="shrink-0 text-xs">{label}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-text-secondary">{booking.locality}</p>
          <p className="mt-1 text-xs text-text-tertiary">
            Room {booking.roomNumber} · {booking.bedLabel}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(booking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
              {booking.checkOut ? ` → ${new Date(booking.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}` : " · ongoing"}
            </span>
            <span className="font-semibold text-primary">{formatInr(booking.monthlyRent)}/mo</span>
          </div>
        </div>
      </div>
      {actions.length > 0 && (
        <div className="flex gap-2 border-t border-border px-4 py-3">
          {actions.map(({ label, href, variant }) => (
            <Link key={label} href={href(booking.id)} className="flex-1">
              <Button size="sm" variant={variant ?? undefined} className="w-full">{label}</Button>
            </Link>
          ))}
          <Link href={`/tenant/bookings/${booking.id}`}>
            <Button size="sm" variant="ghost" className="px-2"><ChevronRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  const current = MOCK_BOOKINGS.filter((b) => b.status === "ACTIVE" || b.status === "CONFIRMED" || b.status === "PENDING");
  const past = MOCK_BOOKINGS.filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED");

  return (
    <div className="grid gap-6 pb-24 lg:pb-6">
      <h1 className="text-2xl font-black">My Bookings</h1>

      {current.length > 0 && (
        <section>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-text-tertiary">Current</p>
          <div className="grid gap-4">
            {current.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-text-tertiary">Past</p>
          <div className="grid gap-4">
            {past.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        </section>
      )}

      {MOCK_BOOKINGS.length === 0 && (
        <EmptyState
          icon={<BedDouble className="h-10 w-10 text-text-tertiary" />}
          title="No bookings yet"
          description="Find your perfect PG and book a bed in minutes."
          action={<Link href="/search"><Button>Browse properties</Button></Link>}
        />
      )}
    </div>
  );
}
