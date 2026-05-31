"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className="bg-surface border-t border-border py-14">
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
        <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-black">Get new PG alerts</h2>
        <p className="mt-2 text-text-secondary">
          We&apos;ll email you when new verified PGs are listed in your city. No spam, ever.
        </p>
        {submitted ? (
          <div className="mt-6 rounded-lg bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-700">
            You&apos;re subscribed! We&apos;ll notify you of new PGs.
          </div>
        ) : (
          <form className="mt-6 flex gap-2" onSubmit={handleSubmit} aria-label="Newsletter signup">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 flex-1 rounded-lg border border-border bg-white px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
              aria-label="Email address"
            />
            <Button type="submit" className="shrink-0">Subscribe</Button>
          </form>
        )}
        <p className="mt-3 text-xs text-text-tertiary">Join 12,000+ people already subscribed.</p>
      </div>
    </section>
  );
}
