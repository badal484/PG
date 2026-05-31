"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui";
import Link from "next/link";

const STEPS = ["Account", "Property details", "Done"];

export default function OwnerOnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="grid h-9 w-9 place-items-center rounded-sm bg-primary text-white">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="text-xl font-black text-primary">ROOMLY</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold ${i <= step ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? "text-primary" : "text-text-tertiary"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="h-px w-8 bg-slate-200" />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {step === 0 && (
            <div className="grid gap-5">
              <div>
                <h1 className="text-2xl font-black">Create your owner account</h1>
                <p className="mt-1 text-sm text-text-secondary">Already have an account? <Link href="/auth/login?redirect=/owner/dashboard" className="text-accent font-semibold">Sign in</Link></p>
              </div>
              <Button size="lg" className="w-full" onClick={() => router.push("/auth/login?redirect=/owner/dashboard")}>
                Continue with phone <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-xs text-center text-text-tertiary">
                By continuing you agree to ROOMLY&apos;s{" "}
                <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
                <Link href="/privacy" className="underline">Privacy Policy</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
