"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Download, Loader2, Repeat } from "lucide-react";
import { Badge, Button, Input } from "@/components/ui";
import { formatInr } from "@/lib/utils";
import { openRazorpay } from "@/lib/razorpay";

const CURRENT_RENT = { amount: 10200, month: "May 2025", dueDate: "5 Jun 2025", bookingId: "bk-001" };

const PAYMENT_HISTORY = [
  { month: "Apr 2025", amount: 10200, paidOn: "3 Apr 2025", method: "UPI", receiptUrl: "#" },
  { month: "Mar 2025", amount: 10200, paidOn: "2 Mar 2025", method: "UPI", receiptUrl: "#" },
  { month: "Feb 2025", amount: 10200, paidOn: "4 Feb 2025", method: "Auto-debit", receiptUrl: "#" },
  { month: "Jan 2025", amount: 10200, paidOn: "5 Jan 2025", method: "Auto-debit", receiptUrl: "#" },
  { month: "Dec 2024", amount: 10200, paidOn: "1 Dec 2024", method: "UPI", receiptUrl: "#" },
];

export default function PayRentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [autoPaySetup, setAutoPaySetup] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      await openRazorpay({
        key: "rzp_test_XXXXXXXXXX",
        amount: CURRENT_RENT.amount * 100,
        currency: "INR",
        name: "ROOMLY Rent",
        description: `Rent for ${CURRENT_RENT.month}`,
        order_id: `order_${Date.now()}`,
        handler: () => setPaid(true),
        theme: { color: "#E8471C" },
        modal: { ondismiss: () => setLoading(false) },
      });
    } catch {
      await new Promise((r) => setTimeout(r, 800));
      setPaid(true);
    }
    setLoading(false);
  }

  if (paid) {
    return (
      <div className="flex flex-col items-center gap-5 py-12 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
          <CreditCard className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-black">Payment successful!</h2>
        <p className="text-text-secondary">{formatInr(CURRENT_RENT.amount)} paid for {CURRENT_RENT.month}</p>
        <div className="flex gap-3">
          <Button><Download className="h-4 w-4" /> Download receipt</Button>
          <Link href={`/tenant/bookings/${id}`}><Button variant="outline">Back to booking</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 pb-24 lg:pb-6">
      <div className="flex items-center gap-3">
        <Link href={`/tenant/bookings/${id}`} className="text-text-secondary hover:text-primary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-black">Pay Rent</h1>
      </div>

      {/* Current month */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-tertiary">Amount due</p>
            <p className="text-3xl font-black text-primary">{formatInr(CURRENT_RENT.amount)}</p>
            <p className="mt-1 text-sm text-text-secondary">{CURRENT_RENT.month} · Due {CURRENT_RENT.dueDate}</p>
          </div>
          <Badge variant="due">Due</Badge>
        </div>
        <Button
          size="lg"
          className="mt-5 w-full"
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing…</> : <>Pay {formatInr(CURRENT_RENT.amount)} with UPI</>}
        </Button>
        <p className="mt-3 text-center text-xs text-text-tertiary">
          UPI · Cards · Net Banking · EMI accepted via Razorpay
        </p>
      </div>

      {/* AutoPay setup */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50">
            <Repeat className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-bold">Set up UPI AutoPay</p>
            <p className="mt-0.5 text-sm text-text-secondary">Auto-debit rent on the 1st of every month. Never pay late again.</p>
          </div>
        </div>
        {!autoPaySetup ? (
          <div className="mt-4 grid gap-3">
            <Input
              label="Your UPI ID"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            <Button variant="outline" onClick={() => setAutoPaySetup(true)} disabled={!upiId}>
              Set up AutoPay
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            AutoPay is active for <strong>{upiId}</strong>. Rent will be auto-debited on the 1st of each month.
          </div>
        )}
      </div>

      {/* Payment history */}
      <section>
        <p className="mb-3 font-bold">Payment history</p>
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          {PAYMENT_HISTORY.map((rec, i) => (
            <div key={rec.month} className={`flex items-center justify-between gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
              <div>
                <p className="text-sm font-semibold">{rec.month}</p>
                <p className="text-xs text-text-tertiary">Paid {rec.paidOn} · {rec.method}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">{formatInr(rec.amount)}</span>
                <Badge variant="paid" className="text-xs">Paid</Badge>
                <a href={rec.receiptUrl} className="text-text-tertiary hover:text-primary">
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
