"use client";

import { use, useState } from "react";
import { Calculator, Plus, Zap } from "lucide-react";
import { Button, Dialog, FormField } from "@/components/ui";
import { formatInr } from "@/lib/utils";

interface MeterReading {
  id: string;
  location: string;
  type: "ELECTRICITY" | "WATER" | "GAS";
  meterNo: string;
  previousReading: number;
  currentReading: number;
  date: string;
  units: number;
  ratePerUnit: number;
  amount: number;
  previousDate: string;
}

const METERS: MeterReading[] = [
  {
    id: "m1",
    location: "Main building",
    type: "ELECTRICITY",
    meterNo: "KAR-001-2345",
    previousReading: 12450,
    currentReading: 12908,
    date: "31 May 2025",
    previousDate: "30 Apr 2025",
    units: 458,
    ratePerUnit: 8.5,
    amount: 3893,
  },
  {
    id: "m2",
    location: "Floor 1",
    type: "ELECTRICITY",
    meterNo: "KAR-001-2346",
    previousReading: 3240,
    currentReading: 3390,
    date: "31 May 2025",
    previousDate: "30 Apr 2025",
    units: 150,
    ratePerUnit: 8.5,
    amount: 1275,
  },
  {
    id: "m3",
    location: "Floor 2",
    type: "ELECTRICITY",
    meterNo: "KAR-001-2347",
    previousReading: 4120,
    currentReading: 4298,
    date: "31 May 2025",
    previousDate: "30 Apr 2025",
    units: 178,
    ratePerUnit: 8.5,
    amount: 1513,
  },
  {
    id: "m4",
    location: "Floor 3",
    type: "ELECTRICITY",
    meterNo: "KAR-001-2348",
    previousReading: 2800,
    currentReading: 2930,
    date: "31 May 2025",
    previousDate: "30 Apr 2025",
    units: 130,
    ratePerUnit: 8.5,
    amount: 1105,
  },
  {
    id: "m5",
    location: "Main building",
    type: "WATER",
    meterNo: "BWSSB-001-789",
    previousReading: 850,
    currentReading: 912,
    date: "31 May 2025",
    previousDate: "30 Apr 2025",
    units: 62,
    ratePerUnit: 18,
    amount: 1116,
  },
];

const TYPE_COLORS = {
  ELECTRICITY: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
  WATER: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  GAS: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", badge: "bg-orange-100 text-orange-700" },
};

export default function MetersPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [meters, setMeters] = useState(METERS);
  const [addDialog, setAddDialog] = useState(false);
  const [calcDialog, setCalcDialog] = useState<MeterReading | null>(null);
  const [form, setForm] = useState({ location: "", type: "ELECTRICITY" as MeterReading["type"], meterNo: "", prevReading: "", currReading: "", ratePerUnit: "8.5" });

  const totalElectricity = meters.filter((m) => m.type === "ELECTRICITY").reduce((s, m) => s + m.amount, 0);
  const totalWater = meters.filter((m) => m.type === "WATER").reduce((s, m) => s + m.amount, 0);

  const newUnits = calcDialog ? calcDialog.currentReading - calcDialog.previousReading : 0;
  const newAmount = calcDialog ? newUnits * calcDialog.ratePerUnit : 0;

  function handleAdd() {
    if (!form.location || !form.prevReading || !form.currReading) return;
    const units = Number(form.currReading) - Number(form.prevReading);
    const rate = Number(form.ratePerUnit);
    setMeters((prev) => [
      ...prev,
      {
        id: `m${prev.length + 1}`,
        location: form.location,
        type: form.type,
        meterNo: form.meterNo,
        previousReading: Number(form.prevReading),
        currentReading: Number(form.currReading),
        date: "31 May 2025",
        previousDate: "30 Apr 2025",
        units,
        ratePerUnit: rate,
        amount: Math.round(units * rate),
      },
    ]);
    setAddDialog(false);
  }

  return (
    <div className="grid gap-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black">Meters</h1>
          <p className="text-sm text-text-secondary mt-0.5">Utility meter readings — May 2025</p>
        </div>
        <Button size="sm" onClick={() => setAddDialog(true)}>
          <Plus className="h-4 w-4" /> Add reading
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-amber-600" />
            <p className="text-xs font-bold text-amber-700">Electricity</p>
          </div>
          <p className="text-2xl font-black text-amber-700">{formatInr(totalElectricity)}</p>
          <p className="text-xs text-amber-600 mt-0.5">{meters.filter((m) => m.type === "ELECTRICITY").reduce((s, m) => s + m.units, 0)} units total</p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-bold text-blue-700">Water</p>
          </div>
          <p className="text-2xl font-black text-blue-700">{formatInr(totalWater)}</p>
          <p className="text-xs text-blue-600 mt-0.5">{meters.filter((m) => m.type === "WATER").reduce((s, m) => s + m.units, 0)} units total</p>
        </div>
      </div>

      {/* Meter cards */}
      <div className="grid gap-4">
        {meters.map((meter) => {
          const colors = TYPE_COLORS[meter.type];
          return (
            <div key={meter.id} className={`rounded-2xl border p-4 shadow-sm ${colors.bg} ${colors.border}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${colors.badge}`}>
                      {meter.type}
                    </span>
                    <span className="text-xs text-text-tertiary font-mono">{meter.meterNo}</span>
                  </div>
                  <p className="font-bold">{meter.location}</p>
                  <p className="text-xs text-text-tertiary">{meter.previousDate} → {meter.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black">{formatInr(meter.amount)}</p>
                  <p className="text-xs text-text-tertiary">{meter.units} units × ₹{meter.ratePerUnit}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-white/70 py-2">
                  <p className="font-bold">{meter.previousReading.toLocaleString()}</p>
                  <p className="text-text-tertiary">Previous</p>
                </div>
                <div className="rounded-xl bg-white/70 py-2">
                  <p className="font-bold">{meter.currentReading.toLocaleString()}</p>
                  <p className="text-text-tertiary">Current</p>
                </div>
                <div className="rounded-xl bg-white py-2">
                  <p className="font-black text-primary">{meter.units}</p>
                  <p className="text-text-tertiary">Units</p>
                </div>
              </div>

              <button
                onClick={() => setCalcDialog(meter)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/60 py-2 text-xs font-semibold hover:bg-white/80 transition"
              >
                <Calculator className="h-3.5 w-3.5" /> Calculate per-tenant share
              </button>
            </div>
          );
        })}
      </div>

      {/* Add reading dialog */}
      <Dialog open={addDialog} title="Add meter reading" onClose={() => setAddDialog(false)}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField>
              <label className="text-sm font-semibold">Location *</label>
              <input
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                placeholder="e.g. Floor 1"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Type</label>
              <select
                className="h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as MeterReading["type"] }))}
              >
                <option value="ELECTRICITY">Electricity</option>
                <option value="WATER">Water</option>
                <option value="GAS">Gas</option>
              </select>
            </FormField>
          </div>
          <FormField>
            <label className="text-sm font-semibold">Meter number</label>
            <input
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
              placeholder="e.g. KAR-001-2345"
              value={form.meterNo}
              onChange={(e) => setForm((f) => ({ ...f, meterNo: e.target.value }))}
            />
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField>
              <label className="text-sm font-semibold">Prev reading</label>
              <input type="number" className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" value={form.prevReading} onChange={(e) => setForm((f) => ({ ...f, prevReading: e.target.value }))} />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Curr reading</label>
              <input type="number" className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" value={form.currReading} onChange={(e) => setForm((f) => ({ ...f, currReading: e.target.value }))} />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Rate/unit (₹)</label>
              <input type="number" step="0.1" className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" value={form.ratePerUnit} onChange={(e) => setForm((f) => ({ ...f, ratePerUnit: e.target.value }))} />
            </FormField>
          </div>
          {form.prevReading && form.currReading && (
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <p><strong>Units:</strong> {Number(form.currReading) - Number(form.prevReading)}</p>
              <p><strong>Amount:</strong> {formatInr((Number(form.currReading) - Number(form.prevReading)) * Number(form.ratePerUnit))}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save reading</Button>
          </div>
        </div>
      </Dialog>

      {/* Calculate share dialog */}
      <Dialog open={!!calcDialog} title="Per-tenant electricity share" onClose={() => setCalcDialog(null)}>
        {calcDialog && (
          <div className="grid gap-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-semibold">{calcDialog.location}</p>
              <p className="text-sm text-text-secondary">{calcDialog.units} units · {formatInr(calcDialog.amount)} total</p>
            </div>
            <p className="text-sm text-text-secondary">Divide equally among {12} beds on this floor:</p>
            <div className="rounded-xl border border-border bg-white p-4 text-center">
              <p className="text-3xl font-black text-primary">{formatInr(Math.round(calcDialog.amount / 12))}</p>
              <p className="text-sm text-text-secondary mt-1">per tenant this month</p>
            </div>
            <p className="text-xs text-text-tertiary">* You can add this as an additional charge on top of base rent in the rent section.</p>
            <Button onClick={() => setCalcDialog(null)}>Done</Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
