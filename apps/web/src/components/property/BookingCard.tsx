"use client";

import Link from "next/link";
import { BedDouble, ChevronDown, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { Badge, Button, DatePicker } from "@/components/ui";
import { formatInr } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  propertySlug: string;
  propertyName: string;
  startingRent: number;
  availableBeds: number;
  depositMonths: number;
  whatsappNumber?: string;
  onBookBed?: () => void;
  className?: string;
}

const STAY_TYPES = ["Monthly", "Long-term (11 mo+)", "Weekly"];

export function BookingCard({
  propertySlug,
  propertyName,
  startingRent,
  availableBeds,
  depositMonths,
  whatsappNumber,
  onBookBed,
  className,
}: BookingCardProps) {
  const [stayType, setStayType] = useState("Monthly");
  const [moveIn, setMoveIn] = useState("");

  const bedsColor =
    availableBeds === 0
      ? "overdue"
      : availableBeds <= 3
        ? "due"
        : "active";

  const whatsappHref = whatsappNumber
    ? `https://wa.me/91${whatsappNumber}?text=Hi%2C+I+found+${encodeURIComponent(propertyName)}+on+ROOMLY+and+would+like+to+know+more.`
    : "#";

  return (
    <aside className={cn("rounded-xl border border-border bg-surface p-5 shadow-lg", className)}>
      {/* Price header */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-text-tertiary">Beds from</p>
          <p className="text-3xl font-black text-primary">
            {formatInr(startingRent)}
            <span className="text-base font-medium text-text-secondary">/mo</span>
          </p>
        </div>
        <Badge variant={bedsColor as "active" | "due" | "overdue"} className="shrink-0">
          <BedDouble className="mr-1 h-3.5 w-3.5" />
          {availableBeds === 0 ? "Fully occupied" : `${availableBeds} bed${availableBeds > 1 ? "s" : ""} left`}
        </Badge>
      </div>

      <p className="mt-1 text-xs text-text-tertiary">
        + {depositMonths} month{depositMonths > 1 ? "s" : ""} deposit ({formatInr(startingRent * depositMonths)})
      </p>

      {/* Form */}
      <div className="mt-5 grid gap-3">
        {/* Stay type */}
        <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Stay type
          <div className="relative">
            <select
              value={stayType}
              onChange={(e) => setStayType(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-border bg-surface px-3 text-sm font-medium outline-none focus:border-primary"
              aria-label="Stay type"
            >
              {STAY_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          </div>
        </label>

        {/* Move-in date */}
        <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Move-in date
          <DatePicker
            value={moveIn}
            onChange={(e) => setMoveIn((e.target as HTMLInputElement).value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </label>
      </div>

      {/* CTAs */}
      <div className="mt-5 grid gap-3">
        <Button
          size="lg"
          className="w-full"
          disabled={availableBeds === 0}
          onClick={onBookBed}
        >
          View available beds
        </Button>
        {whatsappNumber && (
          <Link href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="w-full text-[#25D366] border-[#25D366] hover:bg-[#25D366]/5">
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </Button>
          </Link>
        )}
      </div>

      {/* Trust badges */}
      <div className="mt-5 grid gap-2.5 border-t border-border pt-4">
        {[
          { icon: ShieldCheck, text: "Deposit protected by ROOMLY escrow" },
          { icon: Zap, text: "Instant booking confirmation" },
          { icon: ShieldCheck, text: "ROOMLY-verified property" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-xs text-text-secondary">
            <Icon className="h-4 w-4 shrink-0 text-success" />
            {text}
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-4 text-center text-xs text-text-tertiary">
        You won&apos;t be charged yet · Free cancellation up to 48 hrs
      </p>
    </aside>
  );
}

// Sticky mobile bottom booking bar
export function MobileBookingBar({
  startingRent,
  availableBeds,
  onBook,
}: {
  startingRent: number;
  availableBeds: number;
  onBook: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 border-t border-border bg-white px-4 py-3 shadow-lg md:hidden">
      <div>
        <p className="text-lg font-black">{formatInr(startingRent)}<span className="text-sm font-medium text-text-secondary">/mo</span></p>
        <p className="text-xs text-text-tertiary">{availableBeds} bed{availableBeds !== 1 ? "s" : ""} available</p>
      </div>
      <Button size="lg" disabled={availableBeds === 0} onClick={onBook} className="shrink-0 px-8">
        Book a bed
      </Button>
    </div>
  );
}
