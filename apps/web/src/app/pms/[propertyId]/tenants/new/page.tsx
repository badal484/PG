"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, UserCheck, Users } from "lucide-react";
import { Button, FormField, Select, StepIndicator, Textarea } from "@/components/ui";
import { formatInr } from "@/lib/utils";

type PathType = "WALKIN" | "ONLINE" | null;

const WALKIN_STEPS = ["Basic info", "Stay details", "Documents", "Agreement", "Confirmation"];

const AVAILABLE_BEDS = [
  { id: "b101c", label: "Room 101 · Bed C · 3-sharing", rent: 7500 },
  { id: "b201c", label: "Room 201 · Bed C · 4-sharing", rent: 6500 },
  { id: "b201d", label: "Room 201 · Bed D · 4-sharing (reserved)", rent: 6500 },
  { id: "b301a", label: "Room 302 · Bed A · Single", rent: 14000 },
  { id: "b303c", label: "Room 303 · Bed C · 3-sharing", rent: 11000 },
];

const ONLINE_BOOKINGS = [
  { id: "ob1", tenantName: "Pradeep Sharma", phone: "9812345678", bedLabel: "Room 303 · Bed C", checkIn: "01 Jun 2025", rent: 11000 },
  { id: "ob2", tenantName: "Meena Rao", phone: "9700012345", bedLabel: "Room 201 · Bed D", checkIn: "03 Jun 2025", rent: 6500 },
];

export default function AddTenantPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [path, setPath] = useState<PathType>(null);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  // Walk-in form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    emergencyName: "",
    emergencyPhone: "",
    bedId: "",
    checkIn: "",
    duration: "MONTHLY",
    advance: "",
    deposit: "",
    mealPlan: false,
    idType: "AADHAR",
    idNumber: "",
    notes: "",
  });

  const selectedBed = AVAILABLE_BEDS.find((b) => b.id === form.bedId);

  function next() {
    if (step === WALKIN_STEPS.length - 2) {
      setDone(true);
    } else {
      setStep((s) => s + 1);
    }
  }

  if (!path) {
    return (
      <div className="grid gap-5 max-w-lg">
        <div className="flex items-center gap-3">
          <Link href={`/pms/${propertyId}/tenants`}>
            <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <h1 className="text-xl font-black">Add Tenant</h1>
        </div>

        <p className="text-sm text-text-secondary">Choose how this tenant is being added:</p>

        <div className="grid gap-4">
          <button
            onClick={() => setPath("WALKIN")}
            className="flex items-start gap-4 rounded-2xl border-2 border-border bg-white p-5 text-left hover:border-primary hover:bg-primary/5 transition"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold">Walk-in tenant</p>
              <p className="mt-1 text-sm text-text-secondary">
                Tenant came directly to the PG. Collect ID, assign bed, record agreement manually.
              </p>
            </div>
          </button>

          <button
            onClick={() => setPath("ONLINE")}
            className="flex items-start gap-4 rounded-2xl border-2 border-border bg-white p-5 text-left hover:border-primary hover:bg-primary/5 transition"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-bold">Confirm online booking</p>
              <p className="mt-1 text-sm text-text-secondary">
                Tenant booked via ROOMLY marketplace. Confirm details and check-in.
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (path === "ONLINE") {
    return (
      <div className="grid gap-5 max-w-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPath(null)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-black">Pending online bookings</h1>
        </div>

        <div className="grid gap-4">
          {ONLINE_BOOKINGS.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{b.tenantName}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{b.phone}</p>
                  <p className="text-xs text-text-tertiary mt-1">{b.bedLabel} · Check-in: {b.checkIn}</p>
                  <p className="mt-1 font-semibold text-primary text-sm">{formatInr(b.rent)}/month</p>
                </div>
                <Button size="sm" onClick={() => setDone(true)}>
                  <CheckCircle className="h-4 w-4" /> Confirm
                </Button>
              </div>
            </div>
          ))}
        </div>

        {done && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
            <p className="font-bold text-emerald-700">Booking confirmed!</p>
            <p className="text-sm text-emerald-600 mt-1">Tenant has been checked in.</p>
            <Link href={`/pms/${propertyId}/tenants`}>
              <Button size="sm" className="mt-4">Back to tenants</Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Walk-in flow
  if (done) {
    return (
      <div className="grid gap-4 max-w-lg">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
          <p className="text-xl font-black text-emerald-700">Tenant added!</p>
          <p className="text-sm text-emerald-600 mt-2">
            {form.name || "New tenant"} has been checked in to {selectedBed?.label ?? "selected bed"}.
          </p>
          <div className="mt-4 flex gap-3 justify-center">
            <Link href={`/pms/${propertyId}/tenants`}>
              <Button variant="outline" size="sm">View all tenants</Button>
            </Link>
            <Button size="sm" onClick={() => { setDone(false); setStep(0); setPath(null); setForm({ name: "", phone: "", email: "", emergencyName: "", emergencyPhone: "", bedId: "", checkIn: "", duration: "MONTHLY", advance: "", deposit: "", mealPlan: false, idType: "AADHAR", idNumber: "", notes: "" }); }}>
              Add another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => step === 0 ? setPath(null) : setStep((s) => s - 1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black">Walk-in tenant</h1>
          <p className="text-xs text-text-tertiary">{WALKIN_STEPS[step]}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="overflow-x-auto">
        <StepIndicator steps={WALKIN_STEPS} current={step} />
      </div>

      {/* Step 0: Basic info */}
      {step === 0 && (
        <div className="grid gap-4">
          <FormField>
            <label className="text-sm font-semibold">Full name *</label>
            <input
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Tenant's full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField>
              <label className="text-sm font-semibold">Phone *</label>
              <input
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Email</label>
              <input
                type="email"
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField>
              <label className="text-sm font-semibold">Emergency contact name</label>
              <input
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                value={form.emergencyName}
                onChange={(e) => setForm((f) => ({ ...f, emergencyName: e.target.value }))}
              />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Emergency contact phone</label>
              <input
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                value={form.emergencyPhone}
                onChange={(e) => setForm((f) => ({ ...f, emergencyPhone: e.target.value }))}
              />
            </FormField>
          </div>
        </div>
      )}

      {/* Step 1: Stay details */}
      {step === 1 && (
        <div className="grid gap-4">
          <FormField>
            <label className="text-sm font-semibold">Assign bed *</label>
            <Select value={form.bedId} onChange={(e) => setForm((f) => ({ ...f, bedId: e.target.value }))}>
              <option value="">Select available bed</option>
              {AVAILABLE_BEDS.map((b) => (
                <option key={b.id} value={b.id}>{b.label} — {formatInr(b.rent)}/mo</option>
              ))}
            </Select>
          </FormField>
          {selectedBed && (
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold">{selectedBed.label}</p>
              <p className="text-xs text-text-secondary">Rent: {formatInr(selectedBed.rent)}/month</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField>
              <label className="text-sm font-semibold">Check-in date *</label>
              <input
                type="date"
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                value={form.checkIn}
                onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))}
              />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Stay type</label>
              <Select value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="LONG_TERM">Long term</option>
              </Select>
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField>
              <label className="text-sm font-semibold">Security deposit (₹)</label>
              <input
                type="number"
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                placeholder="e.g. 15000"
                value={form.deposit}
                onChange={(e) => setForm((f) => ({ ...f, deposit: e.target.value }))}
              />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Advance payment (₹)</label>
              <input
                type="number"
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                placeholder="e.g. 7500"
                value={form.advance}
                onChange={(e) => setForm((f) => ({ ...f, advance: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="mealPlan"
              checked={form.mealPlan}
              onChange={(e) => setForm((f) => ({ ...f, mealPlan: e.target.checked }))}
              className="h-4 w-4 accent-primary"
            />
            <label htmlFor="mealPlan" className="text-sm font-medium">Include meal plan</label>
          </div>
        </div>
      )}

      {/* Step 2: Documents */}
      {step === 2 && (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField>
              <label className="text-sm font-semibold">ID type</label>
              <Select value={form.idType} onChange={(e) => setForm((f) => ({ ...f, idType: e.target.value }))}>
                <option value="AADHAR">Aadhar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVING">Driving License</option>
                <option value="VOTER">Voter ID</option>
              </Select>
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">ID number</label>
              <input
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                placeholder="Enter ID number"
                value={form.idNumber}
                onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))}
              />
            </FormField>
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-primary hover:bg-primary/5 transition">
            <span className="text-sm font-semibold text-text-secondary">Upload ID front & back</span>
            <span className="text-xs text-text-tertiary">JPG, PNG or PDF · Max 5MB each</span>
            <input type="file" accept="image/*,.pdf" multiple className="sr-only" />
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-primary hover:bg-primary/5 transition">
            <span className="text-sm font-semibold text-text-secondary">Upload passport-size photo</span>
            <input type="file" accept="image/*" className="sr-only" />
          </label>
        </div>
      )}

      {/* Step 3: Agreement */}
      {step === 3 && (
        <div className="grid gap-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="font-semibold mb-2">Rental Agreement Preview</p>
            <div className="text-xs text-text-secondary space-y-1.5">
              <p><strong>Tenant:</strong> {form.name || "—"}</p>
              <p><strong>Bed:</strong> {selectedBed?.label ?? "Not selected"}</p>
              <p><strong>Rent:</strong> {selectedBed ? formatInr(selectedBed.rent) + "/month" : "—"}</p>
              <p><strong>Deposit:</strong> {form.deposit ? formatInr(Number(form.deposit)) : "—"}</p>
              <p><strong>Check-in:</strong> {form.checkIn || "—"}</p>
              <p><strong>Duration:</strong> {form.duration}</p>
            </div>
          </div>
          <FormField>
            <label className="text-sm font-semibold">Additional notes</label>
            <Textarea
              rows={3}
              placeholder="Any special conditions or agreements..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </FormField>
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
            <input type="checkbox" id="agree" className="mt-0.5 h-4 w-4 accent-amber-600" />
            <label htmlFor="agree" className="text-sm text-amber-700">
              I confirm that physical agreement has been signed by both parties and original documents have been collected.
            </label>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>
        ) : <div />}
        <Button onClick={next}>
          {step === WALKIN_STEPS.length - 2 ? "Confirm & add tenant" : "Next"}
        </Button>
      </div>
    </div>
  );
}
