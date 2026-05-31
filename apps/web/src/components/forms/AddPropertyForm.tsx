"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  MultiSelect,
  Progress,
  Select,
  StepIndicator,
  Switch,
  Textarea,
} from "@/components/ui";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const basicSchema = z.object({
  name: z.string().min(3, "Property name must be at least 3 characters"),
  description: z.string().min(20, "Please add a brief description (min 20 chars)"),
  street: z.string().min(3, "Street address required"),
  locality: z.string().min(2, "Locality required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  pinCode: z.string().length(6, "PIN code must be 6 digits"),
  tier: z.enum(["PREMIUM", "STANDARD", "BUDGET"]),
});

type BasicData = z.infer<typeof basicSchema>;

const AMENITY_OPTIONS = [
  "WiFi", "AC", "Meals included", "Gym", "Workspace / Study room",
  "Hot water", "Parking", "Laundry", "CCTV", "24x7 Security",
  "Power backup", "Rooftop terrace", "Biometric entry",
];

const ATTRIBUTE_OPTIONS = ["AC", "Open balcony", "Attached bath", "1st floor", "2nd floor", "3rd floor", "Window view", "Quiet room"];

const STEPS = ["Basic info", "Layout", "Amenities", "Pricing", "Review & submit"];

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

function StepBasic({ onNext, defaultValues }: { onNext: (data: BasicData) => void; defaultValues?: Partial<BasicData> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<BasicData>({
    resolver: zodResolver(basicSchema),
    defaultValues: { tier: "STANDARD", ...defaultValues },
  });
  return (
    <form onSubmit={handleSubmit(onNext)} className="grid gap-5">
      <Input label="Property name" {...register("name")} placeholder="e.g. Sunrise Boys PG" error={errors.name?.message} />
      <label className="grid gap-2 text-sm font-medium">
        Description
        <Textarea {...register("description")} placeholder="Describe your property — location benefits, room quality, neighbourhood..." />
        {errors.description && <span className="text-xs text-error">{errors.description.message}</span>}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Street / Building" {...register("street")} error={errors.street?.message} className="sm:col-span-2" />
        <Input label="Locality / Area" {...register("locality")} error={errors.locality?.message} />
        <Input label="City" {...register("city")} error={errors.city?.message} />
        <Input label="State" {...register("state")} error={errors.state?.message} />
        <Input label="PIN code" {...register("pinCode")} inputMode="numeric" maxLength={6} error={errors.pinCode?.message} />
      </div>
      <label className="grid gap-2 text-sm font-medium">
        Property tier
        <Select {...register("tier")}>
          <option value="PREMIUM">Verified Premium — ₹₹₹</option>
          <option value="STANDARD">Verified Standard — ₹₹</option>
          <option value="BUDGET">Verified Budget — ₹</option>
        </Select>
      </label>
      <Button type="submit" className="w-full">Continue</Button>
    </form>
  );
}

// ─── Step 2: Layout ───────────────────────────────────────────────────────────

interface BedEntry { label: string; attributes: string[]; monthlyRent: string }
interface RoomEntry { roomNumber: string; beds: BedEntry[] }
interface FloorEntry { name: string; rooms: RoomEntry[] }

function StepLayout({
  onNext,
  onBack,
  floors: defaultFloors,
}: {
  onNext: (floors: FloorEntry[]) => void;
  onBack: () => void;
  floors: FloorEntry[];
}) {
  const [floors, setFloors] = useState<FloorEntry[]>(
    defaultFloors.length > 0 ? defaultFloors : [{ name: "Ground Floor", rooms: [{ roomNumber: "101", beds: [{ label: "A", attributes: [], monthlyRent: "" }] }] }],
  );

  const addFloor = () => setFloors((prev) => [...prev, { name: `Floor ${prev.length}`, rooms: [] }]);
  const addRoom = (fi: number) =>
    setFloors((prev) =>
      prev.map((f, i) =>
        i === fi ? { ...f, rooms: [...f.rooms, { roomNumber: `${fi + 1}0${f.rooms.length + 1}`, beds: [] }] } : f,
      ),
    );
  const addBed = (fi: number, ri: number) =>
    setFloors((prev) =>
      prev.map((f, i) =>
        i === fi
          ? { ...f, rooms: f.rooms.map((r, j) => j === ri ? { ...r, beds: [...r.beds, { label: String.fromCharCode(65 + r.beds.length), attributes: [], monthlyRent: "" }] } : r) }
          : f,
      ),
    );
  const removeRoom = (fi: number, ri: number) =>
    setFloors((prev) => prev.map((f, i) => i === fi ? { ...f, rooms: f.rooms.filter((_, j) => j !== ri) } : f));
  const removeBed = (fi: number, ri: number, bi: number) =>
    setFloors((prev) => prev.map((f, i) => i === fi ? { ...f, rooms: f.rooms.map((r, j) => j === ri ? { ...r, beds: r.beds.filter((_, k) => k !== bi) } : r) } : f));
  const updateFloorName = (fi: number, name: string) =>
    setFloors((prev) => prev.map((f, i) => i === fi ? { ...f, name } : f));
  const updateRoomNumber = (fi: number, ri: number, roomNumber: string) =>
    setFloors((prev) => prev.map((f, i) => i === fi ? { ...f, rooms: f.rooms.map((r, j) => j === ri ? { ...r, roomNumber } : r) } : f));
  const updateBed = (fi: number, ri: number, bi: number, updates: Partial<BedEntry>) =>
    setFloors((prev) =>
      prev.map((f, i) =>
        i === fi ? { ...f, rooms: f.rooms.map((r, j) => j === ri ? { ...r, beds: r.beds.map((b, k) => k === bi ? { ...b, ...updates } : b) } : r) } : f,
      ),
    );

  function handleSubmit() {
    const valid = floors.every((f) => f.rooms.every((r) => r.beds.every((b) => b.monthlyRent.trim())));
    if (!valid) { alert("Please fill in the monthly rent for all beds."); return; }
    onNext(floors);
  }

  return (
    <div className="grid gap-5">
      {floors.map((floor, fi) => (
        <div key={fi} className="rounded-sm border border-border p-4">
          <Input label="Floor name" value={floor.name} onChange={(e) => updateFloorName(fi, e.target.value)} className="mb-4" />
          {floor.rooms.map((room, ri) => (
            <div key={ri} className="mb-4 rounded-sm border border-border bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Input label="Room number" value={room.roomNumber} onChange={(e) => updateRoomNumber(fi, ri, e.target.value)} />
                <button type="button" onClick={() => removeRoom(fi, ri)} className="mt-5 text-error"><Trash2 className="h-4 w-4" /></button>
              </div>
              {room.beds.map((bed, bi) => (
                <div key={bi} className="mb-2 grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                  <Input label={`Bed ${bed.label}`} value={bed.label} onChange={(e) => updateBed(fi, ri, bi, { label: e.target.value })} />
                  <Input label="Monthly rent (₹)" value={bed.monthlyRent} onChange={(e) => updateBed(fi, ri, bi, { monthlyRent: e.target.value })} inputMode="numeric" />
                  <button type="button" onClick={() => removeBed(fi, ri, bi)} className="mb-1 text-error"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addBed(fi, ri)}><Plus className="h-4 w-4" />Add bed</Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addRoom(fi)}><Plus className="h-4 w-4" />Add room</Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addFloor}><Plus className="h-4 w-4" />Add floor</Button>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button type="button" onClick={handleSubmit} className="flex-1">Continue</Button>
      </div>
    </div>
  );
}

// ─── Step 3: Amenities ────────────────────────────────────────────────────────

function StepAmenities({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (amenities: string[]) => void;
  onBack: () => void;
  defaultValues: string[];
}) {
  const [selected, setSelected] = useState<string[]>(defaultValues);
  return (
    <div className="grid gap-6">
      <p className="text-sm text-text-secondary">Select all amenities available at your property. Be accurate — inaccurate listings may affect your verification.</p>
      <MultiSelect options={AMENITY_OPTIONS} value={selected} onChange={setSelected} />
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button type="button" onClick={() => onNext(selected)} className="flex-1">Continue</Button>
      </div>
    </div>
  );
}

// ─── Step 4: Pricing ──────────────────────────────────────────────────────────

const pricingSchema = z.object({
  depositMonths: z.string().min(1),
  hasFoodIncluded: z.boolean().optional(),
  foodChargePerMonth: z.string().optional(),
});
type PricingData = z.infer<typeof pricingSchema>;

function StepPricing({
  onNext,
  onBack,
}: {
  onNext: (data: PricingData) => void;
  onBack: () => void;
}) {
  const { register, handleSubmit, watch } = useForm<PricingData>({
    defaultValues: { depositMonths: "2" },
  });
  const hasFoodIncluded = watch("hasFoodIncluded");
  return (
    <form onSubmit={handleSubmit(onNext)} className="grid gap-5">
      <label className="grid gap-2 text-sm font-medium">
        Security deposit (number of months)
        <Select {...register("depositMonths")}>
          <option value="1">1 month</option>
          <option value="2">2 months (standard)</option>
          <option value="3">3 months</option>
        </Select>
      </label>
      <Switch
        label="Food / meals included in rent"
        checked={hasFoodIncluded}
        onChange={(checked) => void register("hasFoodIncluded").onChange({ target: { value: checked } })}
      />
      {hasFoodIncluded && (
        <Input label="Monthly food charge (₹)" {...register("foodChargePerMonth")} inputMode="numeric" placeholder="e.g. 3000" />
      )}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button type="submit" className="flex-1">Review & submit</Button>
      </div>
    </form>
  );
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────

function StepReview({
  basicData,
  amenities,
  floors,
  onSubmit,
  onBack,
  isLoading,
}: {
  basicData: BasicData;
  amenities: string[];
  floors: FloorEntry[];
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const totalBeds = floors.reduce((acc, f) => acc + f.rooms.reduce((a, r) => a + r.beds.length, 0), 0);
  return (
    <div className="grid gap-5">
      <div className="rounded-sm border border-border p-4 text-sm">
        <p className="font-semibold">{basicData.name}</p>
        <p className="mt-1 text-text-secondary">{basicData.locality}, {basicData.city} — {basicData.pinCode}</p>
        <p className="mt-2">{totalBeds} beds across {floors.length} floor(s)</p>
        <div className="mt-3 flex flex-wrap gap-2">{amenities.map((a) => <Badge key={a}>{a}</Badge>)}</div>
      </div>
      <div className="rounded-sm bg-amber-50 p-3 text-sm text-amber-800">
        Our team will verify your property within 2–3 business days. You'll receive a call on your registered number.
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onSubmit} disabled={isLoading} className="flex-1">{isLoading ? "Submitting…" : "Submit for verification"}</Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AddPropertyForm({ onSuccess }: { onSuccess?: (propertyId: string) => void }) {
  const [step, setStep] = useState(0);
  const [basicData, setBasicData] = useState<BasicData | null>(null);
  const [floors, setFloors] = useState<FloorEntry[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  void ATTRIBUTE_OPTIONS;

  async function handleSubmit() {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    onSuccess?.(`PROP${Date.now()}`);
  }

  return (
    <div className="grid gap-6">
      <StepIndicator steps={STEPS} current={step} />
      <Progress value={(step / STEPS.length) * 100} />

      {step === 0 && (
        <StepBasic
          onNext={(data) => { setBasicData(data); setStep(1); }}
          defaultValues={basicData ?? undefined}
        />
      )}
      {step === 1 && (
        <StepLayout
          onNext={(data) => { setFloors(data); setStep(2); }}
          onBack={() => setStep(0)}
          floors={floors}
        />
      )}
      {step === 2 && (
        <StepAmenities
          onNext={(data) => { setAmenities(data); setStep(3); }}
          onBack={() => setStep(1)}
          defaultValues={amenities}
        />
      )}
      {step === 3 && (
        <StepPricing
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && basicData && (
        <StepReview
          basicData={basicData}
          amenities={amenities}
          floors={floors}
          onSubmit={handleSubmit}
          onBack={() => setStep(3)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
