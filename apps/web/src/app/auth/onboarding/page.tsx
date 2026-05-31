"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronLeft, ChevronRight, Loader2, User } from "lucide-react";
import { Button, Input, Select, StepIndicator } from "@/components/ui";
import { useUpdateProfile } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

type Role = "TENANT" | "OWNER";
type Step = 1 | 2 | 3;

const PROFESSION_OPTIONS = ["Software Engineer", "Data Analyst", "Student", "Doctor", "Lawyer", "Entrepreneur", "Other"];
const FOOD_OPTIONS = ["Veg", "Non-Veg", "Eggetarian", "Vegan", "No preference"];
const SLEEP_OPTIONS = ["Early bird (before 10 PM)", "Night owl (after midnight)", "Flexible"];
const TIER_OPTIONS = [
  { value: "STANDARD", label: "Standard — Free", desc: "List up to 3 properties, basic analytics" },
  { value: "PREMIUM", label: "Premium — ₹999/mo", desc: "Unlimited listings, priority support, advanced analytics" },
  { value: "ENTERPRISE", label: "Enterprise — ₹2,999/mo", desc: "Multi-city, team accounts, API access" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const updateProfile = useUpdateProfile();

  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role>("TENANT");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [profession, setProfession] = useState("");
  const [food, setFood] = useState("No preference");
  const [sleep, setSleep] = useState("Flexible");

  const [company, setCompany] = useState("");
  const [gst, setGst] = useState("");
  const [tier, setTier] = useState("STANDARD");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ["Basic info", "Your role", role === "TENANT" ? "Preferences" : "Business"];

  function validate() {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!firstName.trim()) errs.firstName = "Required";
      if (!lastName.trim()) errs.lastName = "Required";
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (!validate()) return;
    setStep((s) => Math.min(s + 1, 3) as Step);
  }

  async function submit() {
    try {
      await updateProfile.mutateAsync({
        name: `${firstName} ${lastName}`.trim(),
        email: email || undefined,
      });
      router.replace(role === "TENANT" ? "/" : "/owner/dashboard");
    } catch {
      // swallow — redirect anyway for demo
      router.replace(role === "TENANT" ? "/" : "/owner/dashboard");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-xl">
      <div className="mb-6">
        <StepIndicator steps={steps} current={step - 1} />
      </div>

      {/* Step 1 — Basic info */}
      {step === 1 && (
        <div className="grid gap-5">
          <h2 className="text-xl font-bold">Tell us about yourself</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              placeholder="Arjun"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
              autoFocus
            />
            <Input
              label="Last name"
              placeholder="Sharma"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
            />
          </div>
          <Input
            label="Email (optional)"
            type="email"
            placeholder="arjun@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            hint="We'll send rent receipts and agreements here"
          />
        </div>
      )}

      {/* Step 2 — Role */}
      {step === 2 && (
        <div className="grid gap-5">
          <h2 className="text-xl font-bold">How will you use ROOMLY?</h2>
          <div className="grid gap-3">
            {[
              { value: "TENANT" as Role, icon: User, label: "I'm looking for a PG", desc: "Browse, book, and manage your stay" },
              { value: "OWNER" as Role, icon: Building2, label: "I own / manage PGs", desc: "List properties, manage tenants, track rent" },
            ].map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={cn(
                  "flex items-center gap-4 rounded-xl border-2 p-5 text-left transition",
                  role === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                )}
              >
                <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full", role === value ? "bg-primary text-white" : "bg-slate-100 text-text-secondary")}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">{label}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3a — Tenant preferences */}
      {step === 3 && role === "TENANT" && (
        <div className="grid gap-5">
          <h2 className="text-xl font-bold">Your lifestyle preferences</h2>
          <p className="text-sm text-text-secondary">This helps us match you with compatible roommates</p>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Profession</label>
            <Select value={profession} onChange={(e) => setProfession(e.target.value)}>
              <option value="">Select…</option>
              {PROFESSION_OPTIONS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Food preference</label>
            <div className="flex flex-wrap gap-2">
              {FOOD_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFood(opt)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    food === opt ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Sleep schedule</label>
            <div className="grid gap-2">
              {SLEEP_OPTIONS.map((opt) => (
                <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition hover:border-primary/30">
                  <input
                    type="radio"
                    name="sleep"
                    value={opt}
                    checked={sleep === opt}
                    onChange={() => setSleep(opt)}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3b — Owner business */}
      {step === 3 && role === "OWNER" && (
        <div className="grid gap-5">
          <h2 className="text-xl font-bold">Set up your account</h2>

          <Input
            label="Company / Business name"
            placeholder="My PG Ventures Pvt Ltd"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <Input
            label="GST number (optional)"
            placeholder="29AAABM0000M1Z5"
            value={gst}
            onChange={(e) => setGst(e.target.value)}
            hint="Add later from Settings if you don't have it handy"
          />

          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Choose a plan</label>
            <div className="grid gap-3">
              {TIER_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTier(t.value)}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition",
                    tier === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                  )}
                >
                  <p className="font-bold">{t.label}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep((s) => Math.max(s - 1, 1) as Step)}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        )}
        {step < 3 ? (
          <Button className="flex-1" onClick={next}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="flex-1"
            onClick={submit}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              : "Finish setup"}
          </Button>
        )}
      </div>
    </div>
  );
}
