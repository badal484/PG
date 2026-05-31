"use client";

import { useState } from "react";
import { Check, Copy, IndianRupee, MessageCircle, Share2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { formatInr } from "@/lib/utils";

const REFERRAL_CODE = "ARJUN500";
const REFERRAL_LINK = `https://roomly.in/join?ref=${REFERRAL_CODE}`;
const WALLET_BALANCE = 500;

const REFERRAL_HISTORY = [
  { id: "r1", name: "Priya M.", joinedOn: "15 May 2025", status: "EARNED" as const, amount: 500 },
  { id: "r2", name: "Karan S.", joinedOn: "Pending move-in", status: "PENDING" as const, amount: 500 },
];

export default function ReferPage() {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(REFERRAL_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`Hey! I found my PG through ROOMLY and it's been great. Use my referral code ${REFERRAL_CODE} to get ₹500 off your first booking: ${REFERRAL_LINK}`)}`;

  return (
    <div className="grid gap-6 pb-24 lg:pb-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
        <Share2 className="h-8 w-8 mb-3 opacity-80" />
        <h1 className="text-2xl font-black">Refer a friend</h1>
        <p className="mt-2 text-white/80">
          Both you and your friend get <strong className="text-white">₹500</strong> when they move into any ROOMLY-verified PG.
        </p>
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3">
          <span className="flex-1 font-mono text-lg font-bold tracking-widest">{REFERRAL_CODE}</span>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-white/90"
          >
            {copied ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy</>}
          </button>
        </div>
      </div>

      {/* Wallet balance */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50">
            <IndianRupee className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Referral wallet</p>
            <p className="text-2xl font-black text-primary">{formatInr(WALLET_BALANCE)}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" disabled>Redeem</Button>
      </div>

      {/* Share options */}
      <div className="grid gap-3 sm:grid-cols-2">
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="lg" className="w-full gap-2 text-[#25D366] border-[#25D366] hover:bg-[#25D366]/5">
            <MessageCircle className="h-5 w-5" />
            Share on WhatsApp
          </Button>
        </a>
        <Button variant="outline" size="lg" className="w-full gap-2" onClick={copy}>
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          {copied ? "Link copied!" : "Copy referral link"}
        </Button>
      </div>

      {/* How it works */}
      <section className="rounded-xl border border-border bg-white p-5">
        <p className="mb-4 font-bold">How it works</p>
        <div className="grid gap-4">
          {[
            { step: "1", title: "Share your link", desc: "Send your referral link or code to a friend looking for a PG." },
            { step: "2", title: "They book a bed", desc: "Your friend signs up and completes their first move-in via ROOMLY." },
            { step: "3", title: "Both get ₹500", desc: "₹500 is credited to both your wallets within 7 days of move-in." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{step}</span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-0.5 text-sm text-text-secondary">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Referral history */}
      {REFERRAL_HISTORY.length > 0 && (
        <section>
          <p className="mb-3 font-bold">Your referrals</p>
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            {REFERRAL_HISTORY.map((ref, i) => (
              <div key={ref.id} className={`flex items-center justify-between gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
                <div>
                  <p className="font-semibold text-sm">{ref.name}</p>
                  <p className="text-xs text-text-tertiary">{ref.joinedOn}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">{formatInr(ref.amount)}</span>
                  <Badge variant={ref.status === "EARNED" ? "paid" : "due"} className="text-xs">
                    {ref.status === "EARNED" ? "Earned" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
