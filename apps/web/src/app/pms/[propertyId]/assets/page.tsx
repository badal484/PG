"use client";

import { use, useState } from "react";
import { AlertTriangle, CheckCircle, Plus, Search, Wrench } from "lucide-react";
import { Badge, Button, Dialog, FormField, Select } from "@/components/ui";
import { formatInr } from "@/lib/utils";

type AssetCondition = "GOOD" | "FAIR" | "NEEDS_REPAIR" | "REPLACED";
type AssetCategory = "FURNITURE" | "APPLIANCE" | "ELECTRICAL" | "PLUMBING" | "IT" | "OTHER";

interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  location: string;
  condition: AssetCondition;
  quantity: number;
  purchaseDate: string;
  purchaseValue: number;
  lastServiceDate?: string;
  notes?: string;
}

const ASSETS: Asset[] = [
  { id: "a1", name: "Single bed + mattress", category: "FURNITURE", location: "All rooms", condition: "GOOD", quantity: 24, purchaseDate: "Jan 2023", purchaseValue: 8000 },
  { id: "a2", name: "Study table + chair", category: "FURNITURE", location: "All rooms", condition: "FAIR", quantity: 24, purchaseDate: "Jan 2023", purchaseValue: 4500, notes: "3 chairs need replacement" },
  { id: "a3", name: "1.5 ton AC (Daikin)", category: "APPLIANCE", location: "Rooms 102, 202, 301, 302, 303", condition: "GOOD", quantity: 5, purchaseDate: "Mar 2023", purchaseValue: 38000, lastServiceDate: "Mar 2025" },
  { id: "a4", name: "Water purifier (Kent)", category: "APPLIANCE", location: "Common kitchen", condition: "GOOD", quantity: 1, purchaseDate: "Jan 2023", purchaseValue: 15000, lastServiceDate: "Feb 2025" },
  { id: "a5", name: "CCTV cameras", category: "ELECTRICAL", location: "Lobby, corridors, entrance", condition: "GOOD", quantity: 8, purchaseDate: "Jan 2023", purchaseValue: 4500 },
  { id: "a6", name: "WiFi router (TP-Link)", category: "IT", location: "Each floor + common area", condition: "FAIR", quantity: 4, purchaseDate: "Jun 2023", purchaseValue: 3500, notes: "Floor 2 router needs replacement" },
  { id: "a7", name: "Washing machine (LG)", category: "APPLIANCE", location: "Common laundry room", condition: "NEEDS_REPAIR", quantity: 2, purchaseDate: "Jan 2023", purchaseValue: 28000, lastServiceDate: "Jan 2025", notes: "Drum making noise in machine #2" },
  { id: "a8", name: "Geyser (Racold)", category: "APPLIANCE", location: "All bathrooms", condition: "GOOD", quantity: 6, purchaseDate: "Jan 2023", purchaseValue: 8500 },
  { id: "a9", name: "Locker / storage unit", category: "FURNITURE", location: "All rooms", condition: "GOOD", quantity: 24, purchaseDate: "Jan 2023", purchaseValue: 3500 },
  { id: "a10", name: "LED TV 42\"", category: "APPLIANCE", location: "Common room", condition: "GOOD", quantity: 1, purchaseDate: "Jan 2023", purchaseValue: 32000 },
];

const CONDITION_META: Record<AssetCondition, { label: string; color: string; icon: React.ElementType }> = {
  GOOD: { label: "Good", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  FAIR: { label: "Fair", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  NEEDS_REPAIR: { label: "Needs repair", color: "bg-red-100 text-red-700", icon: Wrench },
  REPLACED: { label: "Replaced", color: "bg-slate-100 text-slate-600", icon: CheckCircle },
};

const CATEGORY_META: Record<AssetCategory, string> = {
  FURNITURE: "bg-amber-50 text-amber-700",
  APPLIANCE: "bg-blue-50 text-blue-700",
  ELECTRICAL: "bg-yellow-50 text-yellow-700",
  PLUMBING: "bg-cyan-50 text-cyan-700",
  IT: "bg-purple-50 text-purple-700",
  OTHER: "bg-slate-50 text-slate-600",
};

export default function AssetsPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [assets, setAssets] = useState(ASSETS);
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState<AssetCondition | "ALL">("ALL");
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm] = useState({ name: "", category: "FURNITURE" as AssetCategory, location: "", condition: "GOOD" as AssetCondition, quantity: "1", purchaseValue: "", notes: "" });

  const filtered = assets.filter((a) => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase());
    const matchCond = conditionFilter === "ALL" || a.condition === conditionFilter;
    return matchSearch && matchCond;
  });

  const needsRepair = assets.filter((a) => a.condition === "NEEDS_REPAIR").length;
  const totalValue = assets.reduce((s, a) => s + a.purchaseValue * a.quantity, 0);

  function handleAdd() {
    if (!form.name) return;
    setAssets((prev) => [
      ...prev,
      {
        id: `a${prev.length + 1}`,
        name: form.name,
        category: form.category,
        location: form.location,
        condition: form.condition,
        quantity: Number(form.quantity) || 1,
        purchaseDate: "May 2025",
        purchaseValue: Number(form.purchaseValue) || 0,
        notes: form.notes || undefined,
      },
    ]);
    setAddDialog(false);
    setForm({ name: "", category: "FURNITURE", location: "", condition: "GOOD", quantity: "1", purchaseValue: "", notes: "" });
  }

  return (
    <div className="grid gap-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black">Assets</h1>
          <p className="text-sm text-text-secondary mt-0.5">{assets.length} items · {formatInr(totalValue)} total value</p>
        </div>
        <Button size="sm" onClick={() => setAddDialog(true)}>
          <Plus className="h-4 w-4" /> Add asset
        </Button>
      </div>

      {/* Summary */}
      {needsRepair > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm font-semibold text-red-700">{needsRepair} asset{needsRepair > 1 ? "s" : ""} need repair</p>
          <button
            className="ml-auto text-xs font-bold text-red-600 underline"
            onClick={() => setConditionFilter("NEEDS_REPAIR")}
          >
            View
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {(["ALL", "GOOD", "FAIR", "NEEDS_REPAIR"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setConditionFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              conditionFilter === f ? "bg-primary text-white" : "border border-border bg-white text-text-secondary"
            }`}
          >
            {f === "ALL" ? "All" : CONDITION_META[f].label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm outline-none focus:border-primary"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Asset list */}
      <div className="grid gap-3">
        {filtered.map((asset) => {
          const cond = CONDITION_META[asset.condition];
          const CondIcon = cond.icon;
          return (
            <div key={asset.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${CATEGORY_META[asset.category]}`}>
                      {asset.category}
                    </span>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cond.color}`}>
                      <CondIcon className="h-3 w-3" /> {cond.label}
                    </span>
                  </div>
                  <p className="font-bold">{asset.name}</p>
                  <p className="mt-0.5 text-xs text-text-tertiary">{asset.location}</p>
                  {asset.notes && (
                    <p className="mt-1 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">{asset.notes}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-primary">×{asset.quantity}</p>
                  <p className="text-xs text-text-tertiary">{formatInr(asset.purchaseValue)} each</p>
                  {asset.lastServiceDate && (
                    <p className="text-xs text-text-tertiary mt-0.5">Serviced: {asset.lastServiceDate}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add asset dialog */}
      <Dialog open={addDialog} title="Add asset" onClose={() => setAddDialog(false)}>
        <div className="grid gap-4">
          <FormField>
            <label className="text-sm font-semibold">Asset name *</label>
            <input
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
              placeholder="e.g. Study table"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField>
              <label className="text-sm font-semibold">Category</label>
              <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AssetCategory }))}>
                {Object.keys(CATEGORY_META).map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Condition</label>
              <Select value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as AssetCondition }))}>
                {Object.entries(CONDITION_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField>
              <label className="text-sm font-semibold">Quantity</label>
              <input type="number" className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Value per unit (₹)</label>
              <input type="number" className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" value={form.purchaseValue} onChange={(e) => setForm((f) => ({ ...f, purchaseValue: e.target.value }))} />
            </FormField>
          </div>
          <FormField>
            <label className="text-sm font-semibold">Location</label>
            <input className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" placeholder="e.g. Room 101" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </FormField>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add asset</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
