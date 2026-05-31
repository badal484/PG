"use client";

import { useState } from "react";
import { Camera, CheckCircle } from "lucide-react";
import { Badge, Button, FileUpload, Input, Switch, Textarea } from "@/components/ui";
import { cn, formatInr } from "@/lib/utils";

type Condition = "GOOD" | "MINOR_DAMAGE" | "MAJOR_DAMAGE" | "MISSING";

interface InspectionItem {
  id: string;
  label: string;
  category: string;
  condition: Condition;
  damageAmount: string;
  hasPhoto: boolean;
  notes: string;
}

interface MoveOutInspectionFormProps {
  bookingId: string;
  tenantName: string;
  bedLabel: string;
  roomNumber: string;
  depositAmount: number;
  onSuccess?: () => void;
}

const DEFAULT_ITEMS: Omit<InspectionItem, "condition" | "damageAmount" | "hasPhoto" | "notes">[] = [
  { id: "bed_frame", label: "Bed frame", category: "FURNITURE" },
  { id: "mattress", label: "Mattress", category: "FURNITURE" },
  { id: "wardrobe", label: "Wardrobe", category: "FURNITURE" },
  { id: "study_table", label: "Study table & chair", category: "FURNITURE" },
  { id: "fan", label: "Ceiling fan", category: "APPLIANCE" },
  { id: "ac", label: "Air conditioner", category: "APPLIANCE" },
  { id: "light", label: "Lights / switches", category: "FIXTURE" },
  { id: "window", label: "Window & grills", category: "FIXTURE" },
  { id: "door_lock", label: "Door & lock", category: "FIXTURE" },
  { id: "walls", label: "Walls & paint", category: "WALL" },
  { id: "flooring", label: "Flooring", category: "FLOOR" },
  { id: "bathroom", label: "Bathroom fixtures", category: "FIXTURE" },
];

const conditionConfig: Record<Condition, { label: string; badge: string; color: string }> = {
  GOOD: { label: "Good", badge: "active", color: "border-success bg-emerald-50 text-success" },
  MINOR_DAMAGE: { label: "Minor damage", badge: "due", color: "border-warning bg-amber-50 text-warning" },
  MAJOR_DAMAGE: { label: "Major damage", badge: "overdue", color: "border-error bg-red-50 text-error" },
  MISSING: { label: "Missing", badge: "overdue", color: "border-error bg-red-50 text-error" },
};

function ConditionPicker({
  value,
  onChange,
}: {
  value: Condition;
  onChange: (c: Condition) => void;
}) {
  const conditions: Condition[] = ["GOOD", "MINOR_DAMAGE", "MAJOR_DAMAGE", "MISSING"];
  return (
    <div className="flex flex-wrap gap-2">
      {conditions.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold transition",
            value === c
              ? conditionConfig[c].color
              : "border-border bg-surface text-text-secondary",
          )}
        >
          {conditionConfig[c].label}
        </button>
      ))}
    </div>
  );
}

function ItemRow({
  item,
  onChange,
}: {
  item: InspectionItem;
  onChange: (updates: Partial<InspectionItem>) => void;
}) {
  const isDamaged = item.condition === "MINOR_DAMAGE" || item.condition === "MAJOR_DAMAGE" || item.condition === "MISSING";
  return (
    <div className={cn("rounded-sm border p-4 transition", isDamaged ? "border-amber-200 bg-amber-50" : "border-border bg-surface")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{item.label}</p>
          <p className="text-xs text-text-tertiary">{item.category}</p>
        </div>
        <Badge variant={conditionConfig[item.condition].badge as "active" | "due" | "overdue"}>{conditionConfig[item.condition].label}</Badge>
      </div>

      <ConditionPicker value={item.condition} onChange={(c) => onChange({ condition: c })} />

      {isDamaged && (
        <div className="mt-4 grid gap-3">
          <Input
            label="Damage / replacement cost (₹)"
            value={item.damageAmount}
            onChange={(e) => onChange({ damageAmount: e.target.value })}
            inputMode="numeric"
            placeholder="0"
          />
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Camera className="h-4 w-4" />
              Damage photos
            </label>
            {!item.hasPhoto ? (
              <FileUpload label="Add damage photo" />
            ) : (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle className="h-4 w-4" /> Photo added
              </div>
            )}
          </div>
          <Textarea
            placeholder="Notes about the damage…"
            value={item.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="min-h-16"
          />
        </div>
      )}
    </div>
  );
}

export function MoveOutInspectionForm({
  bookingId,
  tenantName,
  bedLabel,
  roomNumber,
  depositAmount,
  onSuccess,
}: MoveOutInspectionFormProps) {
  const [items, setItems] = useState<InspectionItem[]>(
    DEFAULT_ITEMS.map((item) => ({
      ...item,
      condition: "GOOD",
      damageAmount: "",
      hasPhoto: false,
      notes: "",
    })),
  );
  const [tenantSigned, setTenantSigned] = useState(false);
  const [globalNotes, setGlobalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  void bookingId;

  const totalDamage = items.reduce((acc, item) => {
    const val = parseFloat(item.damageAmount) || 0;
    return acc + val;
  }, 0);
  const refundAmount = Math.max(0, depositAmount - totalDamage);
  const damagedItems = items.filter(
    (i) => i.condition !== "GOOD",
  );

  function updateItem(id: string, updates: Partial<InspectionItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setDone(true);
    onSuccess?.();
  }

  if (done) {
    return (
      <div className="grid place-items-center gap-4 py-10 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-xl font-bold">Inspection complete</h3>
        <p className="text-text-secondary">Deposit refund: <strong className="text-success">{formatInr(refundAmount)}</strong></p>
        {totalDamage > 0 && (
          <p className="text-sm text-text-secondary">Deductions: {formatInr(totalDamage)} for {damagedItems.length} item(s)</p>
        )}
        <Button onClick={onSuccess}>Close</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between rounded-sm border border-border p-4">
        <div>
          <p className="font-semibold">{tenantName}</p>
          <p className="text-sm text-text-secondary">Bed {bedLabel} — Room {roomNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-tertiary">Security deposit</p>
          <p className="font-bold">{formatInr(depositAmount)}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onChange={(updates) => updateItem(item.id, updates)}
          />
        ))}
      </div>

      <div className="rounded-sm border border-border bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-text-secondary">Total damage deductions</span>
          <span className="font-bold text-error">{formatInr(totalDamage)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-semibold">Deposit refund</span>
          <span className={cn("text-lg font-bold", refundAmount > 0 ? "text-success" : "text-error")}>{formatInr(refundAmount)}</span>
        </div>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Inspector notes (optional)
        <Textarea
          value={globalNotes}
          onChange={(e) => setGlobalNotes(e.target.value)}
          placeholder="Overall property condition, special observations…"
        />
      </label>

      <Switch
        label={`Tenant ${tenantName} has reviewed and agreed to this inspection`}
        checked={tenantSigned}
        onChange={setTenantSigned}
      />

      <Button
        disabled={!tenantSigned || isSubmitting}
        onClick={handleSubmit}
        className="w-full"
      >
        {isSubmitting ? "Saving inspection…" : "Complete move-out inspection"}
      </Button>
    </div>
  );
}
