"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, UserCheck, UserPlus } from "lucide-react";
import {
  Badge,
  Button,
  DatePicker,
  FileUpload,
  Input,
  PhoneInput,
  Select,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type Path = "online" | "walkin";

const walkInSchema = z.object({
  tenantName: z.string().min(2, "Full name required"),
  tenantPhone: z.string().length(10, "Enter valid 10-digit number"),
  tenantEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  occupation: z.string().optional(),
  organization: z.string().optional(),
  bedId: z.string().min(1, "Select a bed"),
  checkIn: z.string().min(1, "Move-in date required"),
  emergencyContactName: z.string().min(2, "Required"),
  emergencyContactPhone: z.string().length(10, "Enter valid 10-digit number"),
  emergencyContactRelation: z.string().min(2, "Required"),
  kycType: z.enum(["AADHAAR", "PAN", "PASSPORT", "DL"]),
  kycNumber: z.string().min(5, "Enter valid ID number"),
});

type WalkInData = z.infer<typeof walkInSchema>;

interface AddTenantFormProps {
  availableBeds: Array<{ id: string; label: string; roomNumber: string; floor: string; monthlyRent: number }>;
  onSuccess?: (bookingId: string) => void;
  onClose?: () => void;
}

// ─── Path Selector ────────────────────────────────────────────────────────────

function PathSelector({ value, onChange }: { value: Path; onChange: (v: Path) => void }) {
  const options: Array<{ value: Path; icon: React.ReactNode; title: string; description: string }> = [
    {
      value: "online",
      icon: <UserCheck className="h-6 w-6" />,
      title: "Online confirmation",
      description: "Tenant has the ROOMLY app. Send them a booking link — they complete KYC and payment themselves.",
    },
    {
      value: "walkin",
      icon: <UserPlus className="h-6 w-6" />,
      title: "Walk-in / Manual entry",
      description: "Tenant is physically present or you're adding them manually. Fill in all details now.",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-sm border-2 p-4 text-left transition",
            value === opt.value
              ? "border-primary bg-primary/5"
              : "border-border bg-surface hover:border-primary/40",
          )}
        >
          <span className={cn("mb-2 block", value === opt.value ? "text-primary" : "text-text-secondary")}>
            {opt.icon}
          </span>
          <p className="font-semibold">{opt.title}</p>
          <p className="mt-1 text-xs text-text-secondary">{opt.description}</p>
        </button>
      ))}
    </div>
  );
}

// ─── Online Path ──────────────────────────────────────────────────────────────

function OnlinePath({
  availableBeds,
  onSend,
  onBack,
  isLoading,
}: {
  availableBeds: AddTenantFormProps["availableBeds"];
  onSend: (phone: string, bedId: string) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [bedId, setBedId] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <div className="grid gap-5">
      <div className="flex gap-2">
        <div className="flex-1">
          <PhoneInput label="Tenant phone number" value={phone} onChange={(e) => setPhone((e.target as HTMLInputElement).value)} />
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setSearched(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {searched && (
        <div className="rounded-sm border border-border p-3 text-sm">
          <p className="font-semibold">No existing account found</p>
          <p className="text-text-secondary">A new account will be created for this phone number.</p>
        </div>
      )}

      <label className="grid gap-2 text-sm font-medium">
        Assign bed
        <Select value={bedId} onChange={(e) => setBedId(e.target.value)}>
          <option value="">Select a bed</option>
          {availableBeds.map((bed) => (
            <option key={bed.id} value={bed.id}>
              Bed {bed.label} — Room {bed.roomNumber}, {bed.floor} — ₹{bed.monthlyRent.toLocaleString("en-IN")}/mo
            </option>
          ))}
        </Select>
      </label>

      <DatePicker aria-label="Move-in date" min={new Date().toISOString().split("T")[0]} />

      <div className="rounded-sm bg-blue-50 p-3 text-sm text-blue-800">
        An SMS with a booking link will be sent to +91 {phone || "XXXXXXXXXX"}. The tenant completes the rest.
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button
          disabled={!phone || !bedId || isLoading}
          onClick={() => onSend(phone, bedId)}
          className="flex-1"
        >
          {isLoading ? "Sending…" : "Send booking link"}
        </Button>
      </div>
    </div>
  );
}

// ─── Walk-in Path ─────────────────────────────────────────────────────────────

function WalkInPath({
  availableBeds,
  onSubmit,
  onBack,
  isLoading,
}: {
  availableBeds: AddTenantFormProps["availableBeds"];
  onSubmit: (data: WalkInData) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WalkInData>({
    resolver: zodResolver(walkInSchema),
    defaultValues: { kycType: "AADHAAR" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" {...register("tenantName")} error={errors.tenantName?.message} className="sm:col-span-2" />
        <PhoneInput label="Phone number" {...register("tenantPhone")} error={errors.tenantPhone?.message} />
        <Input label="Email (optional)" type="email" {...register("tenantEmail")} error={errors.tenantEmail?.message} />
        <Input label="Occupation" {...register("occupation")} placeholder="Engineer / Student / etc." />
        <Input label="Organisation / College" {...register("organization")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
          Assign bed
          <Select {...register("bedId")}>
            <option value="">Select a bed</option>
            {availableBeds.map((bed) => (
              <option key={bed.id} value={bed.id}>
                Bed {bed.label} — Room {bed.roomNumber}, {bed.floor} — ₹{bed.monthlyRent.toLocaleString("en-IN")}/mo
              </option>
            ))}
          </Select>
          {errors.bedId && <span className="text-xs text-error">{errors.bedId.message}</span>}
        </label>
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
          Move-in date
          <DatePicker {...register("checkIn")} aria-label="Move-in date" min={new Date().toISOString().split("T")[0]} />
          {errors.checkIn && <span className="text-xs text-error">{errors.checkIn.message}</span>}
        </label>
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-4 text-sm font-semibold">Emergency contact</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" {...register("emergencyContactName")} error={errors.emergencyContactName?.message} />
          <PhoneInput label="Phone" {...register("emergencyContactPhone")} error={errors.emergencyContactPhone?.message} />
          <Input label="Relation" {...register("emergencyContactRelation")} placeholder="Parent / Sibling / Friend" error={errors.emergencyContactRelation?.message} className="sm:col-span-2" />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-4 text-sm font-semibold">KYC document</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            ID type
            <Select {...register("kycType")}>
              <option value="AADHAAR">Aadhaar Card</option>
              <option value="PAN">PAN Card</option>
              <option value="PASSPORT">Passport</option>
              <option value="DL">Driving Licence</option>
            </Select>
          </label>
          <Input label="ID number" {...register("kycNumber")} error={errors.kycNumber?.message} />
          <div className="sm:col-span-2"><FileUpload label="Upload ID (front side)" /></div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Adding tenant…" : "Add tenant"}
        </Button>
      </div>
    </form>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────

function SuccessState({
  bookingId,
  path,
  onClose,
}: {
  bookingId: string;
  path: Path;
  onClose?: () => void;
}) {
  return (
    <div className="grid place-items-center gap-4 py-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
        <UserCheck className="h-7 w-7 text-success" />
      </div>
      <h3 className="text-xl font-bold">Tenant {path === "online" ? "invitation sent" : "added"}!</h3>
      {path === "online" ? (
        <p className="max-w-xs text-text-secondary">A booking link has been sent via SMS. The tenant will appear in your dashboard once they complete the process.</p>
      ) : (
        <p className="max-w-xs text-text-secondary">Tenant has been added. Booking ID: <strong>{bookingId}</strong>. The bed is now marked occupied.</p>
      )}
      <Badge variant="active">Booking created</Badge>
      <Button onClick={onClose} className="mt-2">Done</Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AddTenantForm({ availableBeds, onSuccess, onClose }: AddTenantFormProps) {
  const [path, setPath] = useState<Path>("online");
  const [step, setStep] = useState<"select" | "form" | "done">("select");
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");

  async function handleSendOnline(phone: string, bedId: string) {
    void phone; void bedId;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const id = `BK${Date.now()}`;
    setBookingId(id);
    setIsLoading(false);
    setStep("done");
    onSuccess?.(id);
  }

  async function handleWalkIn(data: WalkInData) {
    void data;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const id = `BK${Date.now()}`;
    setBookingId(id);
    setIsLoading(false);
    setStep("done");
    onSuccess?.(id);
  }

  if (step === "done") {
    return <SuccessState bookingId={bookingId} path={path} onClose={onClose} />;
  }

  if (step === "select") {
    return (
      <div className="grid gap-5">
        <p className="text-sm text-text-secondary">Choose how to add this tenant.</p>
        <PathSelector value={path} onChange={setPath} />
        <Button onClick={() => setStep("form")} className="w-full">Continue with {path === "online" ? "online invite" : "manual entry"}</Button>
      </div>
    );
  }

  return path === "online" ? (
    <OnlinePath
      availableBeds={availableBeds}
      onSend={handleSendOnline}
      onBack={() => setStep("select")}
      isLoading={isLoading}
    />
  ) : (
    <WalkInPath
      availableBeds={availableBeds}
      onSubmit={handleWalkIn}
      onBack={() => setStep("select")}
      isLoading={isLoading}
    />
  );
}
