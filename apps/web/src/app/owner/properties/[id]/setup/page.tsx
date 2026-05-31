"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, Home, Save, Trash2 } from "lucide-react";
import { Badge, Button, Dialog, FileUpload, FormField, Select, Switch, Textarea } from "@/components/ui";

const AMENITIES = [
  "WiFi", "AC", "Geyser", "Laundry", "Meals", "Parking", "TV", "Fridge",
  "CCTV", "Biometric", "Power Backup", "Housekeeping", "Water Purifier", "Gym",
];

const CITIES = ["Bangalore", "Mumbai", "Hyderabad", "Pune", "Chennai", "Delhi NCR"];

export default function PropertySetupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [tab, setTab] = useState<"basics" | "amenities" | "rules" | "photos" | "danger">("basics");
  const [saved, setSaved] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const [name, setName] = useState("Sunrise Boys PG");
  const [address, setAddress] = useState("14, 5th Cross, Koramangala 4th Block");
  const [city, setCity] = useState("Bangalore");
  const [pincode, setPincode] = useState("560034");
  const [description, setDescription] = useState("A premium PG for working professionals and students in the heart of Koramangala.");
  const [genderPolicy, setGenderPolicy] = useState("BOYS_ONLY");
  const [amenities, setAmenities] = useState<string[]>(["WiFi", "AC", "Meals", "CCTV", "Laundry"]);
  const [rules, setRules] = useState("No smoking inside rooms.\nVisitors allowed till 9 PM.\nNo loud music after 11 PM.\nMaintain common area cleanliness.");
  const [wifiSpeed, setWifiSpeed] = useState("100");
  const [status, setStatus] = useState("ACTIVE");

  function toggleAmenity(a: string) {
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TABS = [
    { key: "basics", label: "Basics" },
    { key: "amenities", label: "Amenities" },
    { key: "rules", label: "Rules" },
    { key: "photos", label: "Photos" },
    { key: "danger", label: "Danger Zone" },
  ] as const;

  return (
    <div className="grid gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/owner/properties">
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black">Property Settings</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{name} · ID: {id}</p>
        </div>
        <Badge variant={status === "ACTIVE" ? "active" : "neutral"}>{status}</Badge>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            } ${t.key === "danger" ? "text-red-500 hover:text-red-600" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Basics */}
      {tab === "basics" && (
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField>
              <label className="text-sm font-semibold">Property Name</label>
              <input
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">City</label>
              <Select value={city} onChange={(e) => setCity(e.target.value)}>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </FormField>
          </div>

          <FormField>
            <label className="text-sm font-semibold">Street Address</label>
            <input
              className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField>
              <label className="text-sm font-semibold">Pincode</label>
              <input
                className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </FormField>
            <FormField>
              <label className="text-sm font-semibold">Gender Policy</label>
              <Select value={genderPolicy} onChange={(e) => setGenderPolicy(e.target.value)}>
                <option value="BOYS_ONLY">Boys Only</option>
                <option value="GIRLS_ONLY">Girls Only</option>
                <option value="UNISEX">Unisex (Co-ed)</option>
                <option value="UNISEX_FLOORS">Unisex (Floor-wise)</option>
              </Select>
            </FormField>
          </div>

          <FormField>
            <label className="text-sm font-semibold">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </FormField>

          <FormField>
            <label className="text-sm font-semibold">Listing Status</label>
            <div className="flex items-center gap-4">
              {["ACTIVE", "PAUSED", "DRAFT"].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} className="accent-primary" />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-text-tertiary">PAUSED hides from search results. DRAFT is only visible to you.</p>
          </FormField>
        </div>
      )}

      {/* Amenities */}
      {tab === "amenities" && (
        <div className="grid gap-5">
          <div>
            <p className="text-sm font-semibold mb-3">Select all amenities available</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    amenities.includes(a)
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white hover:border-primary/50"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {amenities.includes("WiFi") && (
            <FormField>
              <label className="text-sm font-semibold">WiFi Speed (Mbps)</label>
              <input
                type="number"
                className="h-11 w-48 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={wifiSpeed}
                onChange={(e) => setWifiSpeed(e.target.value)}
              />
            </FormField>
          )}

          <div className="rounded-xl border border-border bg-slate-50 p-4">
            <p className="text-xs text-text-secondary">
              <strong>Currently enabled ({amenities.length}):</strong>{" "}
              {amenities.length === 0 ? "None selected" : amenities.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Rules */}
      {tab === "rules" && (
        <div className="grid gap-5">
          <FormField>
            <label className="text-sm font-semibold">House Rules</label>
            <p className="text-xs text-text-tertiary">One rule per line. Shown to prospective tenants during booking.</p>
            <Textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </FormField>
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-xs font-semibold text-text-secondary mb-2">Preview</p>
            <ul className="grid gap-1">
              {rules.split("\n").filter(Boolean).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Photos */}
      {tab === "photos" && (
        <div className="grid gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80",
              "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
              "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=80",
            ].map((src, i) => (
              <div key={i} className="relative group aspect-[4/3] overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Property photo" className="h-full w-full object-cover" />
                <div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-2 bg-black/40">
                  <button className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-red-500 hover:bg-white">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">Cover</span>
                )}
              </div>
            ))}
            <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition">
              <Camera className="h-6 w-6 text-text-tertiary" />
              <span className="text-xs font-medium text-text-secondary">Add photo</span>
              <input type="file" accept="image/*" className="sr-only" multiple />
            </label>
          </div>
          <p className="text-xs text-text-tertiary">Drag to reorder. First photo is used as cover. Max 15 photos. JPEG/PNG/WEBP only.</p>
        </div>
      )}

      {/* Danger Zone */}
      {tab === "danger" && (
        <div className="grid gap-5">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-bold text-red-700">Danger Zone</h3>
            <p className="mt-1 text-sm text-red-600">These actions are irreversible. Please proceed with caution.</p>
          </div>

          <div className="rounded-xl border border-border bg-white p-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">Pause listing</p>
              <p className="mt-1 text-sm text-text-secondary">Hide this property from search results. Existing tenants are unaffected.</p>
            </div>
            <Button variant="outline" onClick={() => setStatus("PAUSED")}>Pause</Button>
          </div>

          <div className="rounded-xl border border-red-200 bg-white p-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-red-700">Delete property</p>
              <p className="mt-1 text-sm text-text-secondary">Permanently remove this property and all associated data including tenant records and financials.</p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Save bar */}
      {tab !== "danger" && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white px-5 py-4">
          <p className="text-sm text-text-secondary">Changes saved automatically when you click Save.</p>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            {saved ? "Saved!" : "Save changes"}
          </Button>
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={deleteDialog} title="Delete property?" onClose={() => setDeleteDialog(false)}>
        <p className="text-sm text-text-secondary mb-5">
          This will permanently delete <strong>{name}</strong> and all associated data including tenant records, rent history, complaints, and financial data. This action cannot be undone.
        </p>
        <p className="text-sm font-semibold mb-2">Type the property name to confirm:</p>
        <input
          className="mb-5 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-red-500"
          placeholder={name}
        />
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button variant="destructive"><Trash2 className="h-4 w-4" /> Delete permanently</Button>
        </div>
      </Dialog>
    </div>
  );
}
