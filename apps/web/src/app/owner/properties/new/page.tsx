"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, BadgeCheck, BedDouble, Building2, ChevronLeft,
  ChevronRight, Home, Info, Loader2, MapPin, Plus, Trash2, Wifi,
} from "lucide-react";
import { Button, Input, Progress, Select, StepIndicator, Switch, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Floor { id: string; name: string; genderOverride?: string; rooms: Room[] }
interface Room { id: string; number: string; sharingType: string; hasAC: boolean; hasBath: boolean; balcony: string; beds: Bed[] }
interface Bed { id: string; label: string; rent: string; deposit: string }

// ─── Step 1 — Basics ──────────────────────────────────────────────────────────

const CITIES_LIST = ["Bangalore", "Hyderabad", "Pune", "Chennai", "Mumbai", "Delhi-NCR", "Kolkata", "Ahmedabad"];
const PROPERTY_STYLES = [
  { value: "PG", label: "Traditional PG", icon: Home, desc: "Furnished rooms, meals included" },
  { value: "COLIVING", label: "Co-living", icon: Building2, desc: "Modern shared spaces, amenities" },
  { value: "HOSTEL", label: "Hostel / Dorm", icon: BedDouble, desc: "Budget dormitory-style beds" },
];

function Step1({ data, setData }: { data: Record<string, string>; setData: (k: string, v: string) => void }) {
  return (
    <div className="grid gap-5">
      <h2 className="text-xl font-bold">Property basics</h2>

      <Input label="Property name *" placeholder="e.g. Sunrise Boys PG" value={data.name ?? ""} onChange={(e) => setData("name", e.target.value)} />

      <Input label="Street address *" placeholder="No. 45, 5th Block" value={data.street ?? ""} onChange={(e) => setData("street", e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">City *</label>
          <Select value={data.city ?? ""} onChange={(e) => setData("city", e.target.value)}>
            <option value="">Select city</option>
            {CITIES_LIST.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <Input label="Pincode *" placeholder="560095" value={data.pincode ?? ""} onChange={(e) => setData("pincode", e.target.value)} />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Property type *</label>
        <div className="grid gap-2 sm:grid-cols-3">
          {PROPERTY_STYLES.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setData("style", value)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition",
                data.style === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
              )}
            >
              <div className={cn("grid h-9 w-9 place-items-center rounded-lg", data.style === value ? "bg-primary text-white" : "bg-slate-100 text-text-secondary")}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-text-secondary">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-slate-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-text-tertiary" />
          <p className="text-sm font-medium">Map location</p>
        </div>
        <div className="relative h-32 overflow-hidden rounded-lg border border-border bg-[linear-gradient(135deg,#e2e8f0_25%,#f8fafc_25%,#f8fafc_50%,#e2e8f0_50%,#e2e8f0_75%,#f8fafc_75%)] bg-[length:20px_20px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-primary shadow-lg ring-4 ring-primary/20">
              <MapPin className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-text-tertiary">Map pin placement will be enabled after address entry in production</p>
      </div>
    </div>
  );
}

// ─── Step 2 — Who can stay ────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { value: "GENTS", label: "Gents only", emoji: "👨" },
  { value: "LADIES", label: "Ladies only", emoji: "👩" },
  { value: "UNISEX", label: "Unisex", emoji: "🤝" },
  { value: "COUPLE", label: "Couple-friendly", emoji: "💑" },
];

const AUDIENCE_OPTIONS = [
  { value: "STUDENTS", label: "Students", desc: "College / university going" },
  { value: "PROFESSIONALS", label: "Working professionals", desc: "Employed, 9-to-5" },
  { value: "BOTH", label: "Both", desc: "Open to all" },
];

function Step2({ data, setData }: { data: Record<string, string>; setData: (k: string, v: string) => void }) {
  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-bold">Who can stay</h2>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Gender policy *</label>
        <div className="grid grid-cols-2 gap-3">
          {GENDER_OPTIONS.map(({ value, label, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => setData("gender", value)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 transition",
                data.gender === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
              )}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Target residents *</label>
        <div className="grid gap-2">
          {AUDIENCE_OPTIONS.map(({ value, label, desc }) => (
            <label key={value} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition", data.audience === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
              <input type="radio" name="audience" value={value} checked={data.audience === value} onChange={() => setData("audience", value)} className="accent-primary" />
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-text-secondary">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {data.gender === "UNISEX" && (
        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <div>
            <p className="font-medium text-sm">Per-floor gender override</p>
            <p className="text-xs text-text-secondary">Assign different genders to different floors</p>
          </div>
          <Switch checked={data.perFloorGender === "true"} onChange={(v) => setData("perFloorGender", String(v))} />
        </div>
      )}
    </div>
  );
}

// ─── Step 3 — Layout ──────────────────────────────────────────────────────────

const SHARING_TYPES = ["Single", "Double", "Triple", "Dormitory"];
const BALCONY_TYPES = ["None", "Open balcony", "Enclosed balcony", "Juliet balcony"];

function Step3({ floors, setFloors }: { floors: Floor[]; setFloors: (f: Floor[]) => void }) {
  const totalBeds = floors.reduce((sum, f) => sum + f.rooms.reduce((s, r) => s + r.beds.length, 0), 0);

  function addFloor() {
    const id = `floor-${Date.now()}`;
    setFloors([...floors, { id, name: `Floor ${floors.length + 1}`, rooms: [] }]);
  }

  function removeFloor(fid: string) {
    setFloors(floors.filter((f) => f.id !== fid));
  }

  function addRoom(fid: string) {
    const rid = `room-${Date.now()}`;
    setFloors(floors.map((f) =>
      f.id === fid ? { ...f, rooms: [...f.rooms, { id: rid, number: `${floors.indexOf(f) + 1}0${f.rooms.length + 1}`, sharingType: "Double", hasAC: false, hasBath: false, balcony: "None", beds: [] }] } : f
    ));
  }

  function removeRoom(fid: string, rid: string) {
    setFloors(floors.map((f) => f.id === fid ? { ...f, rooms: f.rooms.filter((r) => r.id !== rid) } : f));
  }

  function addBed(fid: string, rid: string) {
    const bid = `bed-${Date.now()}`;
    setFloors(floors.map((f) =>
      f.id === fid ? {
        ...f, rooms: f.rooms.map((r) =>
          r.id === rid ? { ...r, beds: [...r.beds, { id: bid, label: `Bed ${String.fromCharCode(65 + r.beds.length)}`, rent: "", deposit: "" }] } : r
        )
      } : f
    ));
  }

  function removeBed(fid: string, rid: string, bid: string) {
    setFloors(floors.map((f) =>
      f.id === fid ? { ...f, rooms: f.rooms.map((r) => r.id === rid ? { ...r, beds: r.beds.filter((b) => b.id !== bid) } : r) } : f
    ));
  }

  function updateRoom(fid: string, rid: string, key: keyof Room, val: unknown) {
    setFloors(floors.map((f) =>
      f.id === fid ? { ...f, rooms: f.rooms.map((r) => r.id === rid ? { ...r, [key]: val } : r) } : f
    ));
  }

  function updateBed(fid: string, rid: string, bid: string, key: keyof Bed, val: string) {
    setFloors(floors.map((f) =>
      f.id === fid ? {
        ...f, rooms: f.rooms.map((r) =>
          r.id === rid ? { ...r, beds: r.beds.map((b) => b.id === bid ? { ...b, [key]: val } : b) } : r
        )
      } : f
    ));
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Property layout</h2>
          <p className="text-sm text-text-secondary mt-1">{totalBeds} bed{totalBeds !== 1 ? "s" : ""} configured</p>
        </div>
        <Button type="button" size="sm" onClick={addFloor}><Plus className="h-4 w-4" /> Add floor</Button>
      </div>

      {floors.length === 0 && (
        <button type="button" onClick={addFloor} className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border py-10 text-center hover:border-primary">
          <Plus className="h-8 w-8 text-text-tertiary" />
          <p className="font-semibold text-text-secondary">Click to add your first floor</p>
        </button>
      )}

      {floors.map((floor) => (
        <div key={floor.id} className="rounded-xl border border-border bg-white">
          {/* Floor header */}
          <div className="flex items-center justify-between rounded-t-xl bg-slate-50 px-4 py-3">
            <input
              className="bg-transparent font-bold text-sm outline-none focus:text-primary"
              value={floor.name}
              onChange={(e) => setFloors(floors.map((f) => f.id === floor.id ? { ...f, name: e.target.value } : f))}
            />
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => addRoom(floor.id)}><Plus className="h-3.5 w-3.5" /> Room</Button>
              <button type="button" onClick={() => removeFloor(floor.id)} className="text-text-tertiary hover:text-error"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Rooms */}
          <div className="divide-y divide-border px-4">
            {floor.rooms.map((room) => (
              <div key={room.id} className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input className="w-16 rounded-lg border border-border bg-surface px-2 py-1 text-xs font-bold outline-none focus:border-primary" value={room.number} onChange={(e) => updateRoom(floor.id, room.id, "number", e.target.value)} placeholder="101" />
                    <Select className="w-32 h-8 text-xs" value={room.sharingType} onChange={(e) => updateRoom(floor.id, room.id, "sharingType", e.target.value)}>
                      {SHARING_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </Select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs"><Switch checked={room.hasAC} onChange={(v) => updateRoom(floor.id, room.id, "hasAC", v)} /> AC</label>
                    <label className="flex items-center gap-1.5 text-xs"><Switch checked={room.hasBath} onChange={(v) => updateRoom(floor.id, room.id, "hasBath", v)} /> Bath</label>
                    <button type="button" onClick={() => removeRoom(floor.id, room.id)} className="text-text-tertiary hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                {/* Beds */}
                <div className="ml-4 grid gap-2">
                  {room.beds.map((bed) => (
                    <div key={bed.id} className="flex items-center gap-2">
                      <input className="w-14 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold outline-none focus:border-primary" value={bed.label} onChange={(e) => updateBed(floor.id, room.id, bed.id, "label", e.target.value)} />
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-text-tertiary text-xs">₹</span>
                        <input className="h-8 flex-1 rounded-lg border border-border px-2 text-xs outline-none focus:border-primary" placeholder="Rent/mo" value={bed.rent} onChange={(e) => updateBed(floor.id, room.id, bed.id, "rent", e.target.value)} inputMode="numeric" />
                      </div>
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-text-tertiary text-xs">₹</span>
                        <input className="h-8 flex-1 rounded-lg border border-border px-2 text-xs outline-none focus:border-primary" placeholder="Deposit" value={bed.deposit} onChange={(e) => updateBed(floor.id, room.id, bed.id, "deposit", e.target.value)} inputMode="numeric" />
                      </div>
                      <button type="button" onClick={() => removeBed(floor.id, room.id, bed.id)} className="text-text-tertiary hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => addBed(floor.id, room.id)}><Plus className="h-3 w-3" /> Add bed</Button>
                </div>
              </div>
            ))}
            {floor.rooms.length === 0 && (
              <p className="py-3 text-center text-xs text-text-tertiary">No rooms yet — click &ldquo;+ Room&rdquo; above</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Step 4 — Amenities ───────────────────────────────────────────────────────

const AMENITY_GROUPS = [
  { group: "Comfort", items: [{ key: "gym", label: "Gym" }, { key: "workspace", label: "Workspace" }, { key: "gaming", label: "Gaming area" }, { key: "washing", label: "Washing machine" }, { key: "bikeParking", label: "Bike parking" }, { key: "carParking", label: "Car parking" }] },
  { group: "Food", items: [{ key: "food", label: "Food provided" }, { key: "kitchen", label: "Kitchen access" }] },
  { group: "Connectivity", items: [{ key: "wifi", label: "WiFi" }, { key: "tv", label: "Cable TV" }] },
  { group: "Utilities", items: [{ key: "ac", label: "AC" }, { key: "cleaning", label: "Daily cleaning" }, { key: "hotWater", label: "Hot water 24/7" }, { key: "powerBackup", label: "Power backup" }] },
  { group: "Safety", items: [{ key: "cctv", label: "CCTV" }, { key: "security", label: "Security guard" }, { key: "intercom", label: "Intercom" }] },
];

function Step4({ amenities, setAmenities, rules, setRules }: {
  amenities: Record<string, boolean>;
  setAmenities: (k: string, v: boolean) => void;
  rules: Record<string, string>;
  setRules: (k: string, v: string) => void;
}) {
  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-bold">Amenities &amp; house rules</h2>
      {AMENITY_GROUPS.map(({ group, items }) => (
        <div key={group}>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-tertiary">{group}</p>
          <div className="flex flex-wrap gap-2">
            {items.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setAmenities(key, !amenities[key])}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                  amenities[key] ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40",
                )}
              >
                {amenities[key] && <span>✓</span>}
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
      {amenities.wifi && (
        <Input label="WiFi speed (Mbps)" placeholder="100" />
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { key: "visitorPolicy", label: "Visitor policy", placeholder: "Visitors allowed until 9 PM in common areas" },
          { key: "foodTimings", label: "Food timings", placeholder: "Breakfast 8-9 AM, Lunch 12-1 PM, Dinner 8-9 PM" },
          { key: "curfew", label: "Curfew", placeholder: "11 PM on weekdays, 12 AM on weekends" },
          { key: "houseRules", label: "Additional house rules", placeholder: "No smoking, no pets, no cooking in rooms..." },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="grid gap-1.5">
            <label className="text-sm font-medium">{label}</label>
            <Textarea placeholder={placeholder} value={rules[key] ?? ""} onChange={(e) => setRules(key, e.target.value)} rows={2} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 5 — Preferences ─────────────────────────────────────────────────────

function Step5({ data, setData }: { data: Record<string, string | boolean>; setData: (k: string, v: string | boolean) => void }) {
  const stayTypes = ["Daily", "Weekly", "Monthly", "Long-term"];
  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-bold">Preferences</h2>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Default rent collection method</label>
        <div className="flex gap-2">
          {["Online", "Cash", "Both"].map((opt) => (
            <button key={opt} type="button" onClick={() => setData("rentCollection", opt)}
              className={cn("flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition",
                data.rentCollection === opt ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30")}>
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Stay types allowed</label>
        <div className="flex gap-2 flex-wrap">
          {stayTypes.map((t) => {
            const key = `stay_${t.toLowerCase()}`;
            return (
              <button key={t} type="button" onClick={() => setData(key, !data[key])}
                className={cn("rounded-full border px-4 py-2 text-sm font-medium transition",
                  data[key] ? "border-primary bg-primary text-white" : "border-border")}>
                {data[key] ? "✓ " : ""}{t}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Walkthrough video (optional)</label>
        <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-8 hover:border-primary">
          <span className="text-3xl">🎬</span>
          <div>
            <p className="font-semibold">Upload walkthrough video</p>
            <p className="text-xs text-text-secondary">Helps verification team. MP4, max 100 MB.</p>
          </div>
          <input type="file" accept="video/*" className="sr-only" />
        </label>
      </div>
    </div>
  );
}

// ─── Step 6 — Review ──────────────────────────────────────────────────────────

function Step6({ basicData, floors }: { basicData: Record<string, string>; floors: Floor[] }) {
  const totalBeds = floors.reduce((s, f) => s + f.rooms.reduce((rs, r) => rs + r.beds.length, 0), 0);
  const totalRooms = floors.reduce((s, f) => s + f.rooms.length, 0);
  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-bold">Review &amp; submit</h2>
      <div className="grid gap-3">
        {[
          { label: "Property name", value: basicData.name || "—" },
          { label: "Location", value: `${basicData.street || "—"}, ${basicData.city || "—"} ${basicData.pincode || ""}` },
          { label: "Type", value: basicData.style || "—" },
          { label: "Gender policy", value: basicData.gender || "—" },
          { label: "Total floors", value: String(floors.length) },
          { label: "Total rooms", value: String(totalRooms) },
          { label: "Total beds", value: String(totalBeds) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between rounded-lg bg-slate-50 px-4 py-3">
            <span className="text-sm text-text-secondary">{label}</span>
            <span className="text-sm font-semibold">{value}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-800">Verification process</p>
            <p className="mt-1 text-sm text-blue-700">
              Our field team will visit within <strong>5–7 business days</strong> to verify and photograph your property.
              Once verified, your listing will go live on the ROOMLY marketplace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STEP_LABELS = ["Basics", "Who can stay", "Layout", "Amenities", "Preferences", "Review"];

export default function AddPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [basicData, setBasicData] = useState<Record<string, string>>({});
  const [floors, setFloors] = useState<Floor[]>([]);
  const [amenities, setAmenitiesState] = useState<Record<string, boolean>>({});
  const [rules, setRulesState] = useState<Record<string, string>>({});
  const [prefData, setPrefData] = useState<Record<string, string | boolean>>({ rentCollection: "Both", stay_Monthly: true, stay_long: true });

  function setBd(k: string, v: string) { setBasicData((d) => ({ ...d, [k]: v })); }
  function setAmenities(k: string, v: boolean) { setAmenitiesState((d) => ({ ...d, [k]: v })); }
  function setRules(k: string, v: string) { setRulesState((d) => ({ ...d, [k]: v })); }
  function setPref(k: string, v: string | boolean) { setPrefData((d) => ({ ...d, [k]: v })); }

  async function submit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    router.push("/owner/properties");
  }

  const progressPct = ((step - 1) / (STEP_LABELS.length - 1)) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep((s) => s - 1) : router.back()} className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-text-tertiary font-semibold">Step {step} of {STEP_LABELS.length}</p>
          <Progress value={progressPct} />
        </div>
      </div>

      <div className="mb-6 hidden sm:block">
        <StepIndicator steps={STEP_LABELS} current={step - 1} />
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        {step === 1 && <Step1 data={basicData} setData={setBd} />}
        {step === 2 && <Step2 data={basicData} setData={setBd} />}
        {step === 3 && <Step3 floors={floors} setFloors={setFloors} />}
        {step === 4 && <Step4 amenities={amenities} setAmenities={setAmenities} rules={rules} setRules={setRules} />}
        {step === 5 && <Step5 data={prefData} setData={setPref} />}
        {step === 6 && <Step6 basicData={basicData} floors={floors} />}
      </div>

      {/* Navigation */}
      <div className="mt-5 flex gap-3">
        {step > 1 && (
          <Button variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        )}
        {step < STEP_LABELS.length ? (
          <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="flex-1" onClick={submit} disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <>
              <BadgeCheck className="h-4 w-4" /> Submit for verification
            </>}
          </Button>
        )}
      </div>
    </div>
  );
}
