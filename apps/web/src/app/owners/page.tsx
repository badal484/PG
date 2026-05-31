import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, IndianRupee, LayoutDashboard, ShieldCheck, TrendingUp, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "For Property Owners",
  description: "List your PG on ROOMLY and get verified tenants, automated rent collection, and full property management tools.",
};

const BENEFITS = [
  { icon: Users, title: "Verified tenants only", desc: "KYC-verified tenants with Aadhaar + PAN. Fraud protection built in." },
  { icon: IndianRupee, title: "Automated rent collection", desc: "Razorpay-powered UPI/card payments. Escrow-protected deposits." },
  { icon: LayoutDashboard, title: "Full PMS dashboard", desc: "Bed map, complaints, expenses, food menu, staff — all in one place." },
  { icon: BadgeCheck, title: "ROOMLY verified badge", desc: "Get inspected and earn the verified badge. Appear at the top of search." },
  { icon: TrendingUp, title: "Analytics & P&L", desc: "Revenue trends, occupancy rates, and monthly P&L statements." },
  { icon: ShieldCheck, title: "Dispute protection", desc: "Escrow-held deposits protect both parties. Admin mediation for disputes." },
];

const PLANS = [
  { name: "Starter", price: "Free", beds: "Up to 10 beds", features: ["Basic listing", "Rent reminders", "Complaint tracking"] },
  { name: "Pro", price: "₹2,990/mo", beds: "Up to 50 beds", features: ["Everything in Starter", "Algolia search boost", "P&L reports", "Staff management", "100 WhatsApp reminders/mo"], highlight: true },
  { name: "Enterprise", price: "₹7,990/mo", beds: "Unlimited beds", features: ["Everything in Pro", "Dedicated account manager", "Custom branding", "API access", "Priority support"] },
];

export default function OwnersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-black leading-tight md:text-5xl">
            Manage your PG like a pro.<br />
            <span className="text-accent">List free, earn more.</span>
          </h1>
          <p className="mt-6 text-lg text-white/70">
            Join 500+ property owners using ROOMLY to fill beds faster, collect rent automatically, and reduce disputes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/owners/onboarding" className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white hover:bg-accent-light">
              List your property free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/auth/login?redirect=/owner/dashboard" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10">
              Owner login
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-black text-center mb-12">Everything you need to run a great PG</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border p-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-black text-center mb-3">Simple, transparent pricing</h2>
          <p className="text-center text-text-secondary mb-12">10% commission on rent collected. No hidden fees.</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border p-6 ${plan.highlight ? "border-accent bg-white shadow-lg ring-2 ring-accent/20" : "border-border bg-white"}`}>
                {plan.highlight && <div className="text-xs font-bold text-accent uppercase tracking-wide mb-2">Most popular</div>}
                <h3 className="text-xl font-black">{plan.name}</h3>
                <div className="mt-1 text-3xl font-black">{plan.price}</div>
                <div className="text-xs text-text-secondary mb-4">{plan.beds}</div>
                <ul className="grid gap-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <BadgeCheck className="h-4 w-4 text-success shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/owners/onboarding" className={`mt-6 block rounded-xl px-4 py-3 text-center text-sm font-bold transition ${plan.highlight ? "bg-accent text-white hover:bg-accent-light" : "border border-border hover:bg-slate-50"}`}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
