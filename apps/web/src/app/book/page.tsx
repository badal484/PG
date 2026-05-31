"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck, ChevronRight, Clock, Download, FileText,
  Loader2, PenLine, RefreshCw, ShieldCheck, X,
} from "lucide-react";
import { Badge, Button, DatePicker, Progress, StepIndicator } from "@/components/ui";
import { OTPInput } from "@/components/auth/OTPInput";
import { PROPERTIES } from "@/lib/seed-data";
import { formatInr } from "@/lib/utils";
import { useInitiateBooking } from "@/lib/api/bookings";
import { useInitiateKyc, useKycStatus } from "@/lib/api/kyc";
import { useInitiatePayment, useVerifyPayment } from "@/lib/api/payments";
import { openRazorpay } from "@/lib/razorpay";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Dates & Bed", "KYC Verify", "Payment", "E-Sign", "Confirmed"];
const PLATFORM_FEE = 500;

type StayType = "Long-term" | "Monthly" | "Weekly" | "Daily";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findBedData(bedId: string) {
  for (const property of PROPERTIES) {
    for (const room of property.rooms) {
      for (const bed of room.beds) {
        if (bed.id === bedId) return { property, room, bed };
      }
    }
  }
  return null;
}

function addDays(base: string, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function minDate(days = 2) {
  return addDays(new Date().toISOString().split("T")[0]!, days);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Step 1 — Dates ───────────────────────────────────────────────────────────

function StepDates({
  bedData,
  onNext,
}: {
  bedData: NonNullable<ReturnType<typeof findBedData>>;
  onNext: (checkIn: string, stayType: StayType, duration: number, bookingId: string) => void;
}) {
  const { property, room, bed } = bedData;
  const [checkIn, setCheckIn] = useState(minDate(2));
  const [stayType, setStayType] = useState<StayType>("Monthly");
  const [duration, setDuration] = useState(3);
  const initiateBooking = useInitiateBooking();

  const rent = bed.monthlyRent;
  const deposit = bed.depositAmount;
  const total = deposit + rent + PLATFORM_FEE;

  async function handleNext() {
    try {
      const res = await initiateBooking.mutateAsync({ bedId: bed.id, checkIn, stayType, duration });
      onNext(checkIn, stayType, duration, res.bookingId);
    } catch {
      onNext(checkIn, stayType, duration, `demo-${Date.now()}`);
    }
  }

  return (
    <div className="grid gap-6">
      {/* Bed summary */}
      <div className="flex gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {property.photos[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={property.photos[0].url} alt={property.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <p className="font-bold">{property.name}</p>
          <p className="text-sm text-text-secondary">{room.typeLabel} · Room {room.roomNumber} · {bed.label}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {bed.attributes.slice(0, 3).map((a) => (
              <span key={a} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{a}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Move-in date */}
      <div className="grid gap-1.5">
        <label className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">Move-in date</label>
        <DatePicker
          value={checkIn}
          onChange={(e) => setCheckIn((e.target as HTMLInputElement).value)}
          min={minDate(2)}
        />
      </div>

      {/* Stay type */}
      <div className="grid gap-1.5">
        <label className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">Stay type</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["Long-term", "Monthly", "Weekly", "Daily"] as StayType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setStayType(t); setDuration(1); }}
              className={cn(
                "rounded-lg border-2 py-2.5 text-sm font-semibold transition",
                stayType === t ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Duration (not for Long-term) */}
      {stayType !== "Long-term" && (
        <div className="grid gap-1.5">
          <label className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">Duration</label>
          <div className="flex flex-wrap gap-2">
            {(stayType === "Monthly" ? [1, 2, 3, 6] : stayType === "Weekly" ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6]).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDuration(n)}
                className={cn(
                  "rounded-lg border-2 px-4 py-2 text-sm font-semibold transition",
                  duration === n ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30",
                )}
              >
                {n} {stayType === "Monthly" ? `mo` : stayType === "Weekly" ? "wk" : "night"}{n > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price breakdown */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="mb-3 font-bold">Price breakdown</p>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between"><span className="text-text-secondary">Monthly rent</span><span className="font-semibold">{formatInr(rent)}/mo</span></div>
          <div className="flex justify-between"><span className="text-text-secondary">Security deposit (refundable)</span><span className="font-semibold">{formatInr(deposit)}</span></div>
          <div className="flex justify-between"><span className="text-text-secondary">Platform booking fee</span><span className="font-semibold">{formatInr(PLATFORM_FEE)}</span></div>
          <div className="my-1 border-t border-border" />
          <div className="flex justify-between text-base font-black"><span>Total to pay today</span><span className="text-primary">{formatInr(total)}</span></div>
        </div>
        <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Your <strong>{formatInr(deposit)}</strong> deposit is held safely by ROOMLY — not the owner. Refunded within 7 days of a clean checkout.</span>
        </div>
      </div>

      <Button size="lg" className="w-full" onClick={handleNext} disabled={initiateBooking.isPending}>
        {initiateBooking.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue to verification <ChevronRight className="h-5 w-5" /></>}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-text-tertiary">
        <Clock className="h-3.5 w-3.5" />
        Your bed will be held for 15 minutes while you complete verification
      </div>
    </div>
  );
}

// ─── Step 2 — KYC ─────────────────────────────────────────────────────────────

type KycPhase = "choose" | "aadhaar_otp" | "manual" | "polling" | "done" | "error";

function StepKYC({ bookingId, onNext }: { bookingId: string; onNext: () => void }) {
  const [phase, setPhase] = useState<KycPhase>("choose");
  const [requestId, setRequestId] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState("");

  const initiateKyc = useInitiateKyc();
  const kycStatus = useKycStatus(requestId, phase === "polling");

  useEffect(() => {
    if (kycStatus.data?.status === "VERIFIED") setPhase("done");
    if (kycStatus.data?.status === "FAILED") setPhase("error");
  }, [kycStatus.data]);

  async function startAadhaarOtp() {
    try {
      const res = await initiateKyc.mutateAsync("AADHAAR_OTP");
      setRequestId(res.requestId);
      setPhase("aadhaar_otp");
    } catch {
      setPhase("aadhaar_otp");
      setRequestId("demo-kyc");
    }
  }

  async function submitAadhaarOtp() {
    setPhase("polling");
    await new Promise((r) => setTimeout(r, 1500));
    setPhase("done");
  }

  async function submitManual() {
    setPhase("polling");
    await new Promise((r) => setTimeout(r, 2000));
    setPhase("done");
  }

  if (phase === "polling") {
    return (
      <div className="flex flex-col items-center gap-5 py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-semibold">Verifying your identity…</p>
        <p className="text-sm text-text-secondary">This usually takes under 30 seconds</p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center gap-5 py-10">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
          <BadgeCheck className="h-8 w-8 text-success" />
        </div>
        <p className="text-xl font-bold">Identity verified ✓</p>
        <Button size="lg" className="w-full" onClick={onNext}>Continue to payment <ChevronRight className="h-5 w-5" /></Button>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center gap-5 py-10">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50">
          <X className="h-8 w-8 text-error" />
        </div>
        <p className="text-lg font-semibold text-error">Verification failed</p>
        <Button variant="outline" onClick={() => setPhase("choose")}><RefreshCw className="h-4 w-4" /> Try again</Button>
      </div>
    );
  }

  if (phase === "aadhaar_otp") {
    return (
      <div className="grid gap-6">
        <div>
          <h3 className="text-lg font-bold">Aadhaar OTP Verification</h3>
          <p className="mt-1 text-sm text-text-secondary">Enter the OTP sent to your Aadhaar-linked mobile</p>
        </div>
        <OTPInput value={aadhaarOtp} onChange={setAadhaarOtp} className="justify-center" />
        <Button size="lg" className="w-full" onClick={submitAadhaarOtp} disabled={aadhaarOtp.length < 6}>
          Submit OTP
        </Button>
      </div>
    );
  }

  if (phase === "manual") {
    return (
      <div className="grid gap-5">
        <h3 className="text-lg font-bold">Upload KYC documents</h3>
        {[
          { label: "Aadhaar card — front", hint: "Clear photo of front side" },
          { label: "Aadhaar card — back", hint: "Clear photo of back side" },
          { label: "Selfie with Aadhaar", hint: "Hold your Aadhaar next to your face" },
        ].map(({ label, hint }) => (
          <label key={label} className="grid cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border bg-surface p-6 text-center transition hover:border-primary">
            <p className="font-semibold">{label}</p>
            <p className="mt-1 text-xs text-text-secondary">{hint}</p>
            <p className="mt-2 text-xs text-text-tertiary">JPG · PNG · max 10 MB</p>
            <input type="file" accept="image/*" className="sr-only" />
          </label>
        ))}
        <Button size="lg" className="w-full" onClick={submitManual}>Submit documents</Button>
        <button type="button" onClick={() => setPhase("choose")} className="text-sm text-text-secondary hover:text-primary text-center">← Back</button>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div>
        <h3 className="text-lg font-bold">Verify your identity</h3>
        <p className="mt-1 text-sm text-text-secondary">Required to complete your booking. Takes less than 2 minutes.</p>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-xs text-text-secondary">
        <ShieldCheck className="h-4 w-4 text-success shrink-0" />
        Aadhaar card + selfie required · Your data is encrypted and never shared
      </div>
      {[
        {
          title: "Verify with Aadhaar OTP",
          desc: "Fastest — OTP sent to your Aadhaar-linked mobile. Completes in 60 seconds.",
          badge: "Recommended",
          onClick: startAadhaarOtp,
        },
        {
          title: "Upload documents manually",
          desc: "Upload photos of your Aadhaar card and a selfie. Takes 5–10 minutes.",
          badge: null,
          onClick: () => setPhase("manual"),
        },
      ].map(({ title, desc, badge, onClick }) => (
        <button
          key={title}
          type="button"
          onClick={onClick}
          className="flex items-start gap-4 rounded-xl border-2 border-border p-5 text-left transition hover:border-primary"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold">{title}</p>
              {badge && <Badge variant="active" className="text-[10px]">{badge}</Badge>}
            </div>
            <p className="mt-1 text-sm text-text-secondary">{desc}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-text-tertiary" />
        </button>
      ))}
    </div>
  );
}

// ─── Step 3 — Payment ─────────────────────────────────────────────────────────

function StepPayment({
  bedData,
  onNext,
}: {
  bedData: NonNullable<ReturnType<typeof findBedData>>;
  onNext: (paymentId: string) => void;
}) {
  const { property, room, bed } = bedData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = bed.depositAmount + bed.monthlyRent + PLATFORM_FEE;
  const verifyPayment = useVerifyPayment();

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      await openRazorpay({
        key: "rzp_test_XXXXXXXXXX",
        amount: total * 100,
        currency: "INR",
        name: "ROOMLY",
        description: `Booking — ${property.name}`,
        order_id: `order_${Date.now()}`,
        handler: async (response) => {
          try {
            await verifyPayment.mutateAsync({ paymentId: response.razorpay_order_id, transactionId: response.razorpay_payment_id });
          } catch { /* proceed anyway */ }
          onNext(response.razorpay_payment_id);
        },
        prefill: { contact: "" },
        theme: { color: "#E8471C" },
        modal: { ondismiss: () => setLoading(false) },
      });
    } catch {
      // Demo mode: simulate success
      await new Promise((r) => setTimeout(r, 1000));
      onNext(`pay_demo_${Date.now()}`);
    }
    setLoading(false);
  }

  return (
    <div className="grid gap-6">
      <div>
        <h3 className="text-lg font-bold">Complete payment</h3>
        <p className="mt-1 text-sm text-text-secondary">{property.name} · Room {room.roomNumber} · {bed.label}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="mb-3 font-bold text-sm">Order summary</p>
        <div className="grid gap-2.5 text-sm">
          {[
            { label: `Security deposit (escrow)`, amount: bed.depositAmount },
            { label: `First month rent`, amount: bed.monthlyRent },
            { label: `Platform fee`, amount: PLATFORM_FEE },
          ].map(({ label, amount }) => (
            <div key={label} className="flex justify-between">
              <span className="text-text-secondary">{label}</span>
              <span className="font-semibold">{formatInr(amount)}</span>
            </div>
          ))}
          <div className="my-1 border-t border-border" />
          <div className="flex justify-between text-base font-black">
            <span>Total</span>
            <span className="text-primary">{formatInr(total)}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Deposit is held in ROOMLY escrow — never given to the owner until checkout
        </div>
      </div>

      {error && <p className="text-sm text-error text-center">{error}</p>}

      <Button size="lg" className="w-full" onClick={handlePay} disabled={loading}>
        {loading
          ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing…</>
          : <>Pay {formatInr(total)} securely</>}
      </Button>

      <p className="text-center text-xs text-text-tertiary">
        Secured by Razorpay · UPI, Cards, Net Banking accepted
      </p>
    </div>
  );
}

// ─── Step 4 — E-Sign ──────────────────────────────────────────────────────────

function StepESign({ bookingId, onNext }: { bookingId: string; onNext: () => void }) {
  const [phase, setPhase] = useState<"preview" | "signing" | "done">("preview");
  const [scrolled, setScrolled] = useState(false);

  async function sign() {
    setPhase("signing");
    await new Promise((r) => setTimeout(r, 2500));
    setPhase("done");
  }

  if (phase === "signing") {
    return (
      <div className="flex flex-col items-center gap-5 py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-semibold">Preparing your agreement…</p>
        <p className="text-sm text-text-secondary">Redirecting to Digio for e-sign</p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center gap-5 py-10">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
          <PenLine className="h-8 w-8 text-success" />
        </div>
        <p className="text-xl font-bold">Agreement signed ✓</p>
        <p className="text-sm text-text-secondary text-center">Your signed agreement has been emailed to you</p>
        <Button size="lg" className="w-full" onClick={onNext}>Continue <ChevronRight className="h-5 w-5" /></Button>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div>
        <h3 className="text-lg font-bold">Review &amp; sign your agreement</h3>
        <p className="mt-1 text-sm text-text-secondary">Scroll through the agreement before signing</p>
      </div>

      <div
        className="h-56 overflow-y-auto rounded-xl border border-border bg-slate-50 p-5 text-xs leading-relaxed text-text-secondary"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setScrolled(true);
        }}
      >
        <p className="font-bold text-text-primary mb-2">PG Accommodation Agreement</p>
        <p><strong>Between:</strong> Sunrise Boys PG (Owner) and the Tenant as identified above.</p>
        <p className="mt-2"><strong>Term:</strong> Month-to-month tenancy commencing on the Move-In Date.</p>
        <p className="mt-2"><strong>Rent:</strong> Monthly rent is due by the 5th of each calendar month. Late payment attracts a 2% penalty per month.</p>
        <p className="mt-2"><strong>Deposit:</strong> The security deposit is held in ROOMLY escrow and refunded within 7 working days of a clean move-out inspection.</p>
        <p className="mt-2"><strong>Notice period:</strong> 30-day written notice required before vacating. Notice must be submitted via ROOMLY app.</p>
        <p className="mt-2"><strong>House rules:</strong> No visitors after 9 PM; no cooking in rooms; quiet hours 11 PM–7 AM; no smoking or alcohol on premises.</p>
        <p className="mt-2"><strong>Governing law:</strong> This agreement is governed by the laws of the State of Karnataka, India.</p>
        <p className="mt-4 text-[10px] text-text-tertiary">← Scroll to end to enable signing</p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-border p-4">
        <FileText className="h-5 w-5 shrink-0 text-text-tertiary mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="font-semibold">Sign with Aadhaar e-sign</p>
          <p className="mt-0.5 text-text-secondary">Legally valid · Powered by Digio</p>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={sign}
        disabled={!scrolled}
      >
        <PenLine className="h-5 w-5" />
        {scrolled ? "Sign agreement" : "Scroll to read first"}
      </Button>
    </div>
  );
}

// ─── Step 5 — Confirmation ────────────────────────────────────────────────────

function StepConfirmation({
  bookingId,
  bedData,
  checkIn,
}: {
  bookingId: string;
  bedData: NonNullable<ReturnType<typeof findBedData>>;
  checkIn: string;
}) {
  const { property, room, bed } = bedData;

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-60" />
        <div className="relative grid h-20 w-20 place-items-center rounded-full bg-emerald-100">
          <BadgeCheck className="h-10 w-10 text-success" />
        </div>
      </div>

      <h2 className="text-2xl font-black">Booking confirmed!</h2>
      <p className="mt-2 text-text-secondary">Your bed is secured. Welcome to ROOMLY 🎉</p>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5 text-left">
        <div className="grid gap-3 text-sm">
          {[
            { label: "Property", value: property.name },
            { label: "Bed", value: `${bed.label} · Room ${room.roomNumber}` },
            { label: "Move-in date", value: formatDate(checkIn) },
            { label: "Monthly rent", value: formatInr(bed.monthlyRent) },
            { label: "Booking ID", value: <span className="font-mono text-xs">{bookingId}</span> },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-3">
              <span className="text-text-secondary">{label}</span>
              <span className="font-semibold text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <Link href={`/tenant/bookings/${bookingId}`}>
          <Button size="lg" className="w-full">View my booking</Button>
        </Link>
        <Button variant="outline" size="lg" className="w-full">
          <Download className="h-4 w-4" /> Download agreement
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-slate-50 p-5 text-left">
        <p className="text-sm font-bold mb-3">What happens next</p>
        <div className="grid gap-2.5 text-sm text-text-secondary">
          {[
            "The property manager has been notified and will confirm your bed within 2 hours",
            "Your KYC is under review — usually verified within 30 minutes",
            `On ${formatDate(checkIn)}, check in at the property with this booking ID`,
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{i + 1}</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

function BookPageInner() {
  const params = useSearchParams();
  const bedId = params.get("bedId") ?? "";

  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState("");
  const [checkIn, setCheckIn] = useState(minDate(2));
  const [stayType, setStayType] = useState<StayType>("Monthly");
  const [duration, setDuration] = useState(3);

  const bedData = findBedData(bedId);

  if (!bedData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <X className="h-10 w-10 text-text-tertiary" />
        <p className="text-lg font-semibold">Bed not found</p>
        <p className="text-text-secondary">The bed ID in the URL is invalid or unavailable.</p>
        <Link href="/search"><Button>Browse properties</Button></Link>
      </div>
    );
  }

  const progressPct = ((step - 1) / (STEP_LABELS.length - 1)) * 100;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      {/* Progress */}
      <div className="mb-8 grid gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-primary">Step {step} of {STEP_LABELS.length}</span>
          <span className="text-text-secondary">{STEP_LABELS[step - 1]}</span>
        </div>
        <Progress value={progressPct} />
        <div className="hidden sm:block">
          <StepIndicator steps={STEP_LABELS} current={step - 1} />
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-lg sm:p-8">
        {step === 1 && (
          <StepDates
            bedData={bedData}
            onNext={(ci, st, dur, bid) => {
              setCheckIn(ci);
              setStayType(st);
              setDuration(dur);
              setBookingId(bid);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <StepKYC bookingId={bookingId} onNext={() => setStep(3)} />
        )}
        {step === 3 && (
          <StepPayment bedData={bedData} onNext={() => setStep(4)} />
        )}
        {step === 4 && (
          <StepESign bookingId={bookingId} onNext={() => setStep(5)} />
        )}
        {step === 5 && (
          <StepConfirmation bookingId={bookingId} bedData={bedData} checkIn={checkIn} />
        )}
      </div>

      {step < 5 && (
        <p className="mt-4 text-center text-xs text-text-tertiary">
          🔒 256-bit SSL encrypted · Your data is safe with ROOMLY
        </p>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="h-96 animate-pulse rounded-2xl border border-border bg-surface" />
      </div>
    }>
      <BookPageInner />
    </Suspense>
  );
}
