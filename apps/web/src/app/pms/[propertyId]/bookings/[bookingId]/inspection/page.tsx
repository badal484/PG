"use client";

import { use, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Camera, CheckCircle, Plus, Send, Trash2 } from "lucide-react";
import { Badge, Button, Dialog, FormField, Select, Textarea } from "@/components/ui";
import { formatInr } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: "OK" | "DAMAGED" | "MISSING" | "NOT_CHECKED";
  notes?: string;
  photos?: string[];
}

interface DamageCharge {
  id: string;
  item: string;
  description: string;
  amount: number;
  deductFromDeposit: boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Room
  { id: "c1", category: "Room", item: "Bed & mattress", status: "NOT_CHECKED" },
  { id: "c2", category: "Room", item: "Study table & chair", status: "NOT_CHECKED" },
  { id: "c3", category: "Room", item: "Locker/wardrobe", status: "NOT_CHECKED" },
  { id: "c4", category: "Room", item: "Curtains", status: "NOT_CHECKED" },
  { id: "c5", category: "Room", item: "Lights & switches", status: "NOT_CHECKED" },
  { id: "c6", category: "Room", item: "Ceiling fan", status: "NOT_CHECKED" },
  // AC (if applicable)
  { id: "c7", category: "AC", item: "AC unit (exterior)", status: "NOT_CHECKED" },
  { id: "c8", category: "AC", item: "AC remote", status: "NOT_CHECKED" },
  // Bathroom
  { id: "c9", category: "Bathroom", item: "Geyser", status: "NOT_CHECKED" },
  { id: "c10", category: "Bathroom", item: "Tap & fittings", status: "NOT_CHECKED" },
  { id: "c11", category: "Bathroom", item: "Flush & commode", status: "NOT_CHECKED" },
  { id: "c12", category: "Bathroom", item: "Bathroom mirror", status: "NOT_CHECKED" },
  { id: "c13", category: "Bathroom", item: "Door & lock", status: "NOT_CHECKED" },
  // General
  { id: "c14", category: "General", item: "Room door & lock", status: "NOT_CHECKED" },
  { id: "c15", category: "General", item: "Window & grills", status: "NOT_CHECKED" },
  { id: "c16", category: "General", item: "Walls (no major damage)", status: "NOT_CHECKED" },
  { id: "c17", category: "General", item: "Floor (no damage)", status: "NOT_CHECKED" },
];

const STATUS_STYLES = {
  OK: "bg-emerald-50 border-emerald-300 text-emerald-700",
  DAMAGED: "bg-red-50 border-red-300 text-red-700",
  MISSING: "bg-amber-50 border-amber-300 text-amber-700",
  NOT_CHECKED: "bg-slate-50 border-slate-200 text-slate-500",
};

export default function InspectionPage({
  params,
}: {
  params: Promise<{ propertyId: string; bookingId: string }>;
}) {
  const { propertyId, bookingId } = use(params);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(CHECKLIST_ITEMS);
  const [damages, setDamages] = useState<DamageCharge[]>([]);
  const [step, setStep] = useState<"checklist" | "damages" | "settlement">("checklist");
  const [addDamageDialog, setAddDamageDialog] = useState(false);
  const [sentDialog, setSentDialog] = useState(false);

  const [damageForm, setDamageForm] = useState({ item: "", description: "", amount: "", deductFromDeposit: true });

  const depositAmount = 15000;
  const totalDamages = damages.reduce((s, d) => s + (d.deductFromDeposit ? d.amount : 0), 0);
  const refundAmount = Math.max(depositAmount - totalDamages, 0);

  const checkedCount = checklist.filter((c) => c.status !== "NOT_CHECKED").length;
  const damagedCount = checklist.filter((c) => c.status === "DAMAGED" || c.status === "MISSING").length;

  const categories = [...new Set(checklist.map((c) => c.category))];

  function updateItem(id: string, status: ChecklistItem["status"], notes?: string) {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, notes: notes ?? c.notes } : c)),
    );
  }

  function addDamage() {
    if (!damageForm.item || !damageForm.amount) return;
    setDamages((prev) => [
      ...prev,
      {
        id: `d${prev.length + 1}`,
        item: damageForm.item,
        description: damageForm.description,
        amount: Number(damageForm.amount),
        deductFromDeposit: damageForm.deductFromDeposit,
      },
    ]);
    setAddDamageDialog(false);
    setDamageForm({ item: "", description: "", amount: "", deductFromDeposit: true });
  }

  const tenantName = "Suresh P.";
  const checkoutDate = "31 May 2025";

  return (
    <div className="grid gap-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/pms/${propertyId}/tenants`}>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-black">Move-out Inspection</h1>
          <p className="text-xs text-text-tertiary">{tenantName} · Room 303 · Check-out: {checkoutDate}</p>
        </div>
      </div>

      {/* Step nav */}
      <div className="flex gap-2">
        {(["checklist", "damages", "settlement"] as const).map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              step === s ? "bg-primary text-white" : "border border-border bg-white text-text-secondary"
            }`}
          >
            <span className={`grid h-5 w-5 place-items-center rounded-full text-xs font-black ${
              step === s ? "bg-white/20" : "bg-slate-100"
            }`}>
              {i + 1}
            </span>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* ─── Checklist step ─── */}
      {step === "checklist" && (
        <div className="grid gap-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{checkedCount}/{checklist.length} items checked</span>
            {damagedCount > 0 && (
              <span className="font-bold text-red-600">{damagedCount} issues found</span>
            )}
          </div>

          {/* Progress */}
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(checkedCount / checklist.length) * 100}%` }}
            />
          </div>

          {categories.map((cat) => (
            <div key={cat}>
              <p className="font-bold mb-2">{cat}</p>
              <div className="grid gap-2">
                {checklist.filter((c) => c.category === cat).map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-white p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-medium">{item.item}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[item.status].split(" ").slice(0, 2).join(" ")}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(["OK", "DAMAGED", "MISSING"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateItem(item.id, s)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            item.status === s
                              ? s === "OK" ? "bg-emerald-500 text-white" : s === "DAMAGED" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                              : "border border-border bg-white text-text-secondary hover:border-primary"
                          }`}
                        >
                          {s === "OK" ? "✓ OK" : s === "DAMAGED" ? "✗ Damaged" : "! Missing"}
                        </button>
                      ))}
                      <label className="flex cursor-pointer items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs text-text-secondary hover:border-primary">
                        <Camera className="h-3 w-3" /> Photo
                        <input type="file" accept="image/*" className="sr-only" />
                      </label>
                    </div>
                    {(item.status === "DAMAGED" || item.status === "MISSING") && (
                      <input
                        className="mt-2 h-9 w-full rounded-lg border border-border px-3 text-xs outline-none focus:border-primary"
                        placeholder="Describe the damage..."
                        value={item.notes ?? ""}
                        onChange={(e) => updateItem(item.id, item.status, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button onClick={() => setStep("damages")}>
            Continue to damage charges
          </Button>
        </div>
      )}

      {/* ─── Damages step ─── */}
      {step === "damages" && (
        <div className="grid gap-5">
          <div className="flex items-center justify-between">
            <p className="font-bold">Damage charges</p>
            <Button size="sm" onClick={() => setAddDamageDialog(true)}>
              <Plus className="h-4 w-4" /> Add charge
            </Button>
          </div>

          {damagedCount > 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm font-semibold text-amber-700 mb-2">Items flagged in inspection:</p>
              <ul className="grid gap-1">
                {checklist.filter((c) => c.status === "DAMAGED" || c.status === "MISSING").map((c) => (
                  <li key={c.id} className="flex items-center gap-2 text-sm text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {c.item} — {c.status}{c.notes ? `: ${c.notes}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {damages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white py-10 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
              <p className="text-sm text-text-secondary">No damage charges added</p>
              <p className="text-xs text-text-tertiary mt-1">Full deposit will be refunded</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {damages.map((d) => (
                <div key={d.id} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{d.item}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{d.description}</p>
                      {d.deductFromDeposit && (
                        <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          Deduct from deposit
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-red-600">{formatInr(d.amount)}</p>
                      <button
                        onClick={() => setDamages((prev) => prev.filter((x) => x.id !== d.id))}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button onClick={() => setStep("settlement")}>
            Continue to settlement
          </Button>
        </div>
      )}

      {/* ─── Settlement step ─── */}
      {step === "settlement" && (
        <div className="grid gap-5">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="font-bold mb-4">Deposit settlement summary</p>

            <div className="grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Security deposit held</span>
                <span className="font-bold">{formatInr(depositAmount)}</span>
              </div>

              {damages.map((d) => (
                d.deductFromDeposit && (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <span className="text-red-600">− {d.item}</span>
                    <span className="font-bold text-red-600">− {formatInr(d.amount)}</span>
                  </div>
                )
              ))}

              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="font-bold">Refund to tenant</span>
                <span className={`text-2xl font-black ${refundAmount > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatInr(refundAmount)}
                </span>
              </div>
            </div>
          </div>

          {totalDamages > 0 && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-semibold text-red-700">Damage deductions: {formatInr(totalDamages)}</p>
              <p className="text-xs text-red-600 mt-0.5">Amounts deducted from security deposit before refund</p>
            </div>
          )}

          <div className="grid gap-2">
            <FormField>
              <label className="text-sm font-semibold">Refund via</label>
              <Select>
                <option>Bank transfer (NEFT)</option>
                <option>UPI</option>
                <option>Cash</option>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-2">
            <Button onClick={() => setSentDialog(true)}>
              <Send className="h-4 w-4" /> Send settlement to tenant
            </Button>
            <Button variant="outline">Download PDF report</Button>
          </div>
        </div>
      )}

      {/* Add damage dialog */}
      <Dialog open={addDamageDialog} title="Add damage charge" onClose={() => setAddDamageDialog(false)}>
        <div className="grid gap-4">
          <FormField>
            <label className="text-sm font-semibold">Item *</label>
            <input
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
              placeholder="e.g. Study chair"
              value={damageForm.item}
              onChange={(e) => setDamageForm((f) => ({ ...f, item: e.target.value }))}
            />
          </FormField>
          <FormField>
            <label className="text-sm font-semibold">Description</label>
            <input
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
              placeholder="Describe the damage..."
              value={damageForm.description}
              onChange={(e) => setDamageForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FormField>
          <FormField>
            <label className="text-sm font-semibold">Charge amount (₹) *</label>
            <input
              type="number"
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
              placeholder="0"
              value={damageForm.amount}
              onChange={(e) => setDamageForm((f) => ({ ...f, amount: e.target.value }))}
            />
          </FormField>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={damageForm.deductFromDeposit}
              onChange={(e) => setDamageForm((f) => ({ ...f, deductFromDeposit: e.target.checked }))}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm font-medium">Deduct from security deposit</span>
          </label>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setAddDamageDialog(false)}>Cancel</Button>
            <Button onClick={addDamage}>Add charge</Button>
          </div>
        </div>
      </Dialog>

      {/* Sent confirmation */}
      <Dialog open={sentDialog} title="Settlement sent!" onClose={() => setSentDialog(false)}>
        <div className="text-center py-2">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
          <p className="font-bold text-lg">Settlement proposal sent</p>
          <p className="text-sm text-text-secondary mt-1">
            {tenantName} will receive the settlement details via SMS and can accept or dispute within 48 hours.
          </p>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-left">
            <p className="text-sm"><strong>Refund amount:</strong> {formatInr(refundAmount)}</p>
            <p className="text-sm mt-1"><strong>To be processed within:</strong> 7 business days</p>
          </div>
          <Link href={`/pms/${propertyId}/tenants`}>
            <Button className="mt-4 w-full" onClick={() => setSentDialog(false)}>
              Back to tenants
            </Button>
          </Link>
        </div>
      </Dialog>
    </div>
  );
}
