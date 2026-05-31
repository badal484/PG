"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Camera, ChevronRight, Loader2, Star } from "lucide-react";
import { Button, Textarea } from "@/components/ui";
import { useCreateReview } from "@/lib/api/reviews";
import { cn } from "@/lib/utils";

const RATING_CATEGORIES = [
  { key: "overallRating", label: "Overall experience", required: true },
  { key: "foodRating", label: "Food quality" },
  { key: "cleanlinessRating", label: "Cleanliness" },
  { key: "safetyRating", label: "Safety & security" },
  { key: "wifiRating", label: "WiFi & connectivity" },
  { key: "staffRating", label: "Staff & management" },
] as const;

type RatingKey = (typeof RATING_CATEGORIES)[number]["key"];

const RATING_LABELS: Record<number, string> = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very good", 5: "Excellent" };

function StarRow({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  required?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </p>
        {display > 0 && (
          <p className="text-xs text-text-tertiary">{RATING_LABELS[display]}</p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            aria-label={`${star} stars for ${label}`}
          >
            <Star
              className={cn(
                "h-7 w-7 transition",
                star <= display ? "fill-amber-400 text-amber-400" : "text-slate-200 hover:text-amber-300",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const createReview = useCreateReview();

  const [ratings, setRatings] = useState<Partial<Record<RatingKey, number>>>({});
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function setRating(key: RatingKey, value: number) {
    setRatings((r) => ({ ...r, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ratings.overallRating) return;
    try {
      await createReview.mutateAsync({
        bookingId,
        overallRating: ratings.overallRating!,
        foodRating: ratings.foodRating,
        cleanlinessRating: ratings.cleanlinessRating,
        safetyRating: ratings.safetyRating,
        wifiRating: ratings.wifiRating,
        staffRating: ratings.staffRating,
        text: text || undefined,
      });
    } catch { /* demo */ }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center pb-24 lg:pb-0">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-amber-100">
          <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
        </div>
        <h2 className="text-2xl font-black">Thank you for your review!</h2>
        <p className="max-w-sm text-text-secondary">
          Your feedback helps other tenants make better decisions and motivates great property owners.
        </p>
        <div className="mt-2 rounded-xl border border-border bg-surface p-5 text-left max-w-sm w-full">
          <p className="text-sm font-semibold mb-1">Did you know?</p>
          <p className="text-sm text-text-secondary">Your manager also rates tenants after checkout. Mutual reviews help build a trusted ROOMLY community.</p>
        </div>
        <Link href="/tenant/bookings"><Button>View my bookings <ChevronRight className="h-4 w-4" /></Button></Link>
      </div>
    );
  }

  const canSubmit = !!ratings.overallRating;

  return (
    <div className="pb-24 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Rate your stay</h1>
        <p className="mt-1 text-text-secondary">Share your experience to help other tenants</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Star ratings */}
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="mb-5 font-bold">Your ratings</p>
          <div className="grid gap-5">
            {RATING_CATEGORIES.map((cat) => (
              <StarRow
                key={cat.key}
                label={cat.label}
                value={ratings[cat.key] ?? 0}
                onChange={(v) => setRating(cat.key, v)}
                required={"required" in cat ? cat.required : undefined}
              />
            ))}
          </div>
        </div>

        {/* Written review */}
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="mb-3 font-bold">Write a review <span className="text-text-tertiary font-normal">(optional)</span></p>
          <Textarea
            placeholder="Tell others about your experience — the food, the community, the management…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
          />
          <div className="mt-1 flex justify-end">
            <span className={cn("text-xs", text.length > 500 ? "text-error" : "text-text-tertiary")}>
              {text.length}/500
            </span>
          </div>
        </div>

        {/* Photos */}
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="mb-3 font-bold">Add photos <span className="text-text-tertiary font-normal">(optional)</span></p>
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <label key={i} className="grid h-24 w-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border bg-slate-50 transition hover:border-primary">
                <Camera className="h-6 w-6 text-text-tertiary" />
                <input type="file" accept="image/*" className="sr-only" />
              </label>
            ))}
          </div>
        </div>

        {/* Mutual review notice */}
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">Two-way reviews</p>
          <p className="mt-1 text-xs text-amber-700">
            Your manager will also rate you as a tenant after checkout. This builds trust across the ROOMLY community.
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!canSubmit || createReview.isPending}
        >
          {createReview.isPending
            ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting…</>
            : "Submit review"}
        </Button>
      </form>
    </div>
  );
}
