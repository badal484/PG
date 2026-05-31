"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, FileText, IndianRupee, ShieldCheck } from "lucide-react";
import {
  Button,
  DatePicker,
  FileUpload,
  Input,
  OTPInput,
  PhoneInput,
  Progress,
  Select,
  StepIndicator,
  Switch,
} from "@/components/ui";
import { formatInr } from "@/lib/utils";

// ─── Step schemas ─────────────────────────────────────────────────────────────

const datesSchema = z.object({
  checkIn: z.string().min(1, "Move-in date is required"),
  stayDuration: z.string().min(1, "Select a stay duration"),
});

const kycSchema = z.object({
  kycType: z.enum(["AADHAAR", "PAN", "PASSPORT", "DL"]),
  kycNumber: z.string().min(5, "Enter a valid ID number"),
  emergencyContactName: z.string().min(2, "Name is required"),
  emergencyContactPhone: z.string().length(10, "Enter a valid 10-digit number"),
  emergencyContactRelation: z.string().min(2, "Relation is required"),
});

const paymentSchema = z.object({
  paymentMethod: z.enum(["UPI", "NEFT", "CARD", "CASH"]),
  upiId: z.string().optional(),
});

type DatesData = z.infer<typeof datesSchema>;
type KycData = z.infer<typeof kycSchema>;
type PaymentData = z.infer<typeof paymentSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface BookingFormProps {
  bedId: string;
  bedLabel: string;
  propertyName: string;
  monthlyRent: number;
  depositAmount: number;
  onSuccess?: (bookingId: string) => void;
  onClose?: () => void;
}

const STEPS = ["Select dates", "KYC & contacts", "Payment", "Agreement"];

// ─── Step: Dates ──────────────────────────────────────────────────────────────

function StepDates({
  onNext,
}: {
  onNext: (data: DatesData) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<DatesData>({
    resolver: zodResolver(datesSchema),
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="grid gap-6">
      <DatePicker
        {...register("checkIn")}
        placeholder="Select move-in date"
        min={new Date().toISOString().split("T")[0]}
        aria-label="Move-in date"
      />
      {errors.checkIn && <p className="text-xs text-error">{errors.checkIn.message}</p>}

      <label className="grid gap-2 text-sm font-medium text-text-primary">
        Stay duration
        <Select {...register("stayDuration")}>
          <option value="">Select duration</option>
          <option value="3">3 months</option>
          <option value="6">6 months</option>
          <option value="11">11 months (standard)</option>
          <option value="12">12 months</option>
          <option value="0">Open ended</option>
        </Select>
        {errors.stayDuration && <p className="text-xs text-error">{errors.stayDuration.message}</p>}
      </label>

      <Button type="submit" className="w-full">Continue</Button>
    </form>
  );
}

// ─── Step: KYC ────────────────────────────────────────────────────────────────

function StepKYC({
  onNext,
  onBack,
}: {
  onNext: (data: KycData) => void;
  onBack: () => void;
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<KycData>({
    resolver: zodResolver(kycSchema),
    defaultValues: { kycType: "AADHAAR" },
  });
  const kycType = watch("kycType");

  return (
    <form onSubmit={handleSubmit(onNext)} className="grid gap-6">
      <div className="rounded-sm bg-blue-50 p-4 text-sm text-blue-800">
        <ShieldCheck className="mb-1 inline h-4 w-4" /> Your KYC details are encrypted and only shared with the property owner after booking confirmation.
      </div>

      <label className="grid gap-2 text-sm font-medium">
        ID type
        <Select {...register("kycType")}>
          <option value="AADHAAR">Aadhaar Card</option>
          <option value="PAN">PAN Card</option>
          <option value="PASSPORT">Passport</option>
          <option value="DL">Driving Licence</option>
        </Select>
      </label>

      <Input
        label={`${kycType === "AADHAAR" ? "Aadhaar" : kycType === "PAN" ? "PAN" : kycType === "PASSPORT" ? "Passport" : "DL"} number`}
        {...register("kycNumber")}
        error={errors.kycNumber?.message}
        placeholder={kycType === "AADHAAR" ? "XXXX XXXX XXXX" : ""}
      />

      <div className="border-t border-border pt-4">
        <p className="mb-4 text-sm font-semibold">Emergency contact</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" {...register("emergencyContactName")} error={errors.emergencyContactName?.message} />
          <PhoneInput label="Phone number" {...register("emergencyContactPhone")} error={errors.emergencyContactPhone?.message} />
          <Input label="Relation" {...register("emergencyContactRelation")} placeholder="Parent / Sibling / Friend" error={errors.emergencyContactRelation?.message} className="sm:col-span-2" />
        </div>
      </div>

      <FileUpload label="Upload ID document (front)" />

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button type="submit" className="flex-1">Continue</Button>
      </div>
    </form>
  );
}

// ─── Step: Payment ────────────────────────────────────────────────────────────

function StepPayment({
  monthlyRent,
  depositAmount,
  onNext,
  onBack,
}: {
  monthlyRent: number;
  depositAmount: number;
  onNext: (data: PaymentData) => void;
  onBack: () => void;
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentMethod: "UPI" },
  });
  const method = watch("paymentMethod");
  const total = monthlyRent + depositAmount;

  return (
    <form onSubmit={handleSubmit(onNext)} className="grid gap-6">
      <div className="rounded-sm border border-border bg-surface p-4 text-sm">
        <div className="flex justify-between py-1"><span className="text-text-secondary">First month rent</span><span className="font-semibold">{formatInr(monthlyRent)}</span></div>
        <div className="flex justify-between py-1"><span className="text-text-secondary">Security deposit</span><span className="font-semibold">{formatInr(depositAmount)}</span></div>
        <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold"><span>Total due now</span><span className="text-accent">{formatInr(total)}</span></div>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Payment method
        <Select {...register("paymentMethod")}>
          <option value="UPI">UPI (Recommended)</option>
          <option value="NEFT">NEFT / Bank Transfer</option>
          <option value="CARD">Credit / Debit Card</option>
          <option value="CASH">Cash (Walk-in)</option>
        </Select>
        {errors.paymentMethod && <p className="text-xs text-error">{errors.paymentMethod.message}</p>}
      </label>

      {method === "UPI" && (
        <Input label="UPI ID" {...register("upiId")} placeholder="yourname@upi" hint="You'll receive a payment request on this UPI ID" />
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button type="submit" className="flex-1">Pay {formatInr(total)}</Button>
      </div>
    </form>
  );
}

// ─── Step: Agreement ──────────────────────────────────────────────────────────

function StepAgreement({
  propertyName,
  bedLabel,
  onConfirm,
  onBack,
  isLoading,
}: {
  propertyName: string;
  bedLabel: string;
  onConfirm: () => void;
  onBack: () => void;
  isLoading?: boolean;
}) {
  const [agreed, setAgreed] = useState(false);
  const [otp, setOtp] = useState("");

  return (
    <div className="grid gap-6">
      <div className="max-h-52 overflow-y-auto rounded-sm border border-border bg-slate-50 p-4 text-sm text-text-secondary leading-6">
        <p className="font-semibold text-text-primary">Rental Agreement Summary</p>
        <p className="mt-2">This agreement is between the tenant and the property owner of <strong>{propertyName}</strong> for Bed <strong>{bedLabel}</strong>. By signing, you agree to the house rules, payment schedule, and notice period as described in the full agreement.</p>
        <p className="mt-2">• 30-day notice period required before vacating.</p>
        <p className="mt-2">• Security deposit refundable after move-out inspection.</p>
        <p className="mt-2">• Rent due on the 1st of every month.</p>
      </div>

      <div className="flex items-start gap-3">
        <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 accent-accent" />
        <label htmlFor="agree" className="text-sm text-text-secondary">I have read and agree to the rental agreement terms and conditions.</label>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium">Enter OTP sent to your phone to sign digitally</p>
        <OTPInput value={otp} onChange={setOtp} />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button disabled={!agreed || otp.length < 6 || isLoading} onClick={onConfirm} className="flex-1">
          {isLoading ? "Confirming…" : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BookingForm({
  bedId,
  bedLabel,
  propertyName,
  monthlyRent,
  depositAmount,
  onSuccess,
  onClose,
}: BookingFormProps) {
  const [step, setStep] = useState(0);
  const [progress] = useState(0);
  const [datesData, setDatesData] = useState<DatesData | null>(null);
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  void progress; void bedId; void kycData; void paymentData;

  async function handleConfirm() {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const id = `BK${Date.now()}`;
    setBookingId(id);
    setStep(4);
    setIsSubmitting(false);
    onSuccess?.(id);
  }

  if (step === 4 && bookingId) {
    return (
      <div className="grid place-items-center gap-4 py-8 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-xl font-bold">Booking Confirmed!</h3>
        <p className="text-text-secondary">Your booking ID is <strong>{bookingId}</strong>. Check your phone for the agreement.</p>
        <Button onClick={onClose} className="mt-2">Done</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <StepIndicator steps={STEPS} current={step} />
      <Progress value={(step / STEPS.length) * 100} />

      {step === 0 && (
        <StepDates onNext={(data) => { setDatesData(data); setStep(1); }} />
      )}
      {step === 1 && datesData && (
        <StepKYC onNext={(data) => { setKycData(data); setStep(2); }} onBack={() => setStep(0)} />
      )}
      {step === 2 && (
        <StepPayment
          monthlyRent={monthlyRent}
          depositAmount={depositAmount}
          onNext={(data) => { setPaymentData(data); setStep(3); }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepAgreement
          propertyName={propertyName}
          bedLabel={bedLabel}
          onConfirm={handleConfirm}
          onBack={() => setStep(2)}
          isLoading={isSubmitting}
        />
      )}

      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <FileText className="h-4 w-4" />
        <span>Your data is encrypted and stored securely.</span>
        <IndianRupee className="ml-auto h-4 w-4" />
        <span>No hidden charges.</span>
      </div>
    </div>
  );
}
