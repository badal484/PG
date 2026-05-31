"use client";

import { useState } from "react";
import { BadgeCheck, Camera, Loader2, Phone, ShieldAlert } from "lucide-react";
import { Badge, Button, Input, Select, Switch } from "@/components/ui";

const FOOD_OPTIONS = ["Veg", "Non-Veg", "Eggetarian", "Vegan", "No preference"];
const SLEEP_OPTIONS = ["Early bird (before 10 PM)", "Night owl (after midnight)", "Flexible"];

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("Arjun");
  const [lastName, setLastName] = useState("Sharma");
  const [email, setEmail] = useState("arjun@example.com");
  const [profession, setProfession] = useState("Software Engineer");
  const [food, setFood] = useState("Veg");
  const [sleep, setSleep] = useState("Flexible");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [emergencyName, setEmergencyName] = useState("Rajesh Sharma");
  const [emergencyPhone, setEmergencyPhone] = useState("9123456789");
  const [emergencyRelation, setEmergencyRelation] = useState("Father");

  const [parentName, setParentName] = useState("Rajesh Sharma");
  const [parentPhone, setParentPhone] = useState("9123456789");

  const [twoFaEnabled, setTwoFaEnabled] = useState(true);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="grid gap-6 pb-24 lg:pb-6">
      <h1 className="text-2xl font-black">Profile</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-3xl font-black text-white">
            A
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-white border border-border shadow-sm hover:bg-slate-50"
          >
            <Camera className="h-3.5 w-3.5 text-text-secondary" />
          </button>
        </div>
        <div>
          <p className="font-bold text-lg">{firstName} {lastName}</p>
          <p className="text-sm text-text-secondary flex items-center gap-1.5 mt-0.5">
            <Phone className="h-3.5 w-3.5" /> +91 9876543210
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant="active" className="text-xs"><BadgeCheck className="mr-1 h-3 w-3" />KYC Verified</Badge>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="grid gap-6">
        {/* Personal details */}
        <section className="rounded-xl border border-border bg-white p-5">
          <p className="mb-4 font-bold">Personal details</p>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Profession</label>
              <Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Your profession" />
            </div>
          </div>
        </section>

        {/* Lifestyle */}
        <section className="rounded-xl border border-border bg-white p-5">
          <p className="mb-4 font-bold">Lifestyle preferences</p>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Food preference</label>
              <div className="flex flex-wrap gap-2">
                {FOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFood(opt)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${food === opt ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Sleep schedule</label>
              <Select value={sleep} onChange={(e) => setSleep(e.target.value)}>
                {SLEEP_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </Select>
            </div>
          </div>
        </section>

        {/* Emergency contact */}
        <section className="rounded-xl border border-border bg-white p-5">
          <p className="mb-4 font-bold">Emergency contact</p>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
              <Input label="Relation" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} />
            </div>
            <Input label="Phone number" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
          </div>
        </section>

        {/* Parent contact (for student PGs) */}
        <section className="rounded-xl border border-border bg-white p-5">
          <p className="mb-1 font-bold">Parent contact</p>
          <p className="mb-4 text-xs text-text-secondary">Required for ladies and student PGs</p>
          <div className="grid gap-3">
            <Input label="Parent name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
            <Input label="Parent phone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
          </div>
        </section>

        {/* Security */}
        <section className="rounded-xl border border-border bg-white p-5">
          <p className="mb-4 font-bold">Security</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-factor authentication</p>
              <p className="text-xs text-text-secondary">OTP on every login</p>
            </div>
            <Switch checked={twoFaEnabled} onChange={setTwoFaEnabled} />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-3">
            <ShieldAlert className="h-4 w-4 text-text-tertiary shrink-0" />
            <p className="text-xs text-text-secondary">Your KYC documents are encrypted and never shared with third parties.</p>
          </div>
        </section>

        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : saved ? "Saved ✓" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
