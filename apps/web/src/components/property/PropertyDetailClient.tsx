"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  Bus, Building2, Car, ChevronRight, Clock, GraduationCap, Hospital, MapPin,
  MessageSquare, Play, Star, Train, Utensils, Video, Wifi, Wind, X,
  Dumbbell, BriefcaseBusiness, Droplets, Shield, Zap, Check, Soup, Wrench,
} from "lucide-react";
import { Badge, Button, Dialog, Sheet, Skeleton, TierBadge } from "@/components/ui";
import { BedCard } from "@/components/property/BedCard";
import { BookingCard, MobileBookingBar } from "@/components/property/BookingCard";
import { PropertyDetailGallery } from "@/components/property/PropertyDetailGallery";
import { BookingForm } from "@/components/forms/BookingForm";
import type { PropertyDetailData } from "@/lib/seed-data";
import { cn, formatInr } from "@/lib/utils";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "rooms", label: "Rooms & Beds" },
  { id: "food", label: "Food" },
  { id: "amenities", label: "Amenities" },
  { id: "rules", label: "Rules" },
  { id: "reviews", label: "Reviews" },
  { id: "location", label: "Location" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Amenity Icons ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  wifi: Wifi, food: Utensils, ac: Wind, gym: Dumbbell,
  workspace: BriefcaseBusiness, hotWater: Droplets, parking: Car,
  laundry: Wrench, cctv: Shield, security: Shield,
  powerBackup: Zap, rooftop: Building2, biometric: Shield,
};

// ─── Tab sticky hook ──────────────────────────────────────────────────────────

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ property }: { property: PropertyDetailData }) {
  const amenityCount = property.amenities.filter((a) => a.available).length;
  return (
    <div className="grid gap-8">
      <div>
        <h2 className="text-xl font-bold">About this PG</h2>
        <p className="mt-3 leading-relaxed text-text-secondary">{property.description}</p>
      </div>

      {property.highlights.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-bold">Why tenants love it</h3>
          <div className="grid gap-3">
            {property.highlights.map((h) => (
              <div key={h} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-success">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm leading-relaxed">{h}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Star, label: "Rating", value: `${property.rating} / 5` },
          { icon: BriefcaseBusiness, label: "Amenities", value: `${amenityCount}+` },
          { icon: Building2, label: "Est.", value: String(property.stats.establishedYear) },
          { icon: MapPin, label: "Metro", value: property.address.metroDistance },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-lg border border-border p-4 text-center">
            <Icon className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-2 text-xs text-text-tertiary">{label}</p>
            <p className="mt-0.5 font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">👥 {property.genderPolicy === "GENTS" ? "Boys only" : property.genderPolicy === "LADIES" ? "Girls only" : "Unisex"}</Badge>
        {property.targetAudience.map((t) => <Badge key={t} variant="neutral">{t}</Badge>)}
      </div>
    </div>
  );
}

// ─── Rooms & Beds tab ─────────────────────────────────────────────────────────

function RoomsTab({
  property,
  onBook,
}: {
  property: PropertyDetailData;
  onBook: (bedId: string) => void;
}) {
  const byType = property.rooms.reduce<Record<string, typeof property.rooms>>((acc, room) => {
    const key = room.typeLabel;
    acc[key] = [...(acc[key] ?? []), room];
    return acc;
  }, {});

  const vacantTotal = property.rooms.flatMap((r) => r.beds).filter((b) => b.status === "VACANT").length;

  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Rooms & beds</h2>
        <Badge variant={vacantTotal > 3 ? "active" : vacantTotal > 0 ? "due" : "overdue"}>
          {vacantTotal} bed{vacantTotal !== 1 ? "s" : ""} available
        </Badge>
      </div>

      <p className="text-sm text-text-secondary">
        Book the exact bed you want — each bed has its own price, floor, and availability date.
      </p>

      {Object.entries(byType).map(([type, rooms]) => {
        const vacantInType = rooms.flatMap((r) => r.beds).filter((b) => b.status === "VACANT").length;
        return (
          <div key={type}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold">{type}</h3>
              {rooms.some((r) => r.hasTour) && (
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                  360° tour
                </Button>
              )}
            </div>
            {vacantInType === 0 && (
              <p className="mb-4 rounded-lg border border-border bg-slate-50 p-3 text-sm text-text-secondary">
                All {type.toLowerCase()} beds are currently occupied.{" "}
                <button className="font-semibold text-accent hover:underline">Join waitlist</button>
              </p>
            )}
            <div className="grid gap-3">
              {rooms.flatMap((room) =>
                room.beds.map((bed) => (
                  <BedCard
                    key={bed.id}
                    bedLabel={`${type} · Bed ${bed.label}`}
                    roomNumber={room.roomNumber}
                    floor={room.floor}
                    attributes={bed.attributes}
                    monthlyRent={bed.monthlyRent}
                    availableFrom={bed.availableFrom}
                    hasTour={room.hasTour}
                  />
                )),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Food tab ─────────────────────────────────────────────────────────────────

function FoodTab({ property }: { property: PropertyDetailData }) {
  const [day, setDay] = useState(0);
  const days = property.foodDays;

  if (days.length === 0) {
    return (
      <div className="py-12 text-center text-text-secondary">
        <Utensils className="mx-auto mb-3 h-8 w-8 text-text-tertiary" />
        <p className="font-semibold">No meals provided</p>
        <p className="mt-1 text-sm">Tenants arrange their own food. Nearby tiffin services available.</p>
      </div>
    );
  }

  const current = days[day]!;
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Food menu</h2>
        <div className="flex items-center gap-1.5 text-sm text-success">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold">4.8 food rating</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setDay(i)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
              i === day ? "border-primary bg-primary text-white" : "border-border hover:border-primary",
            )}
          >
            {d.day}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "☀️ Breakfast", items: current.breakfast },
          { label: "🍛 Lunch", items: current.lunch },
          { label: "🌙 Dinner", items: current.dinner },
        ].map(({ label, items }) => (
          <div key={label} className="rounded-lg border border-border p-4">
            <p className="mb-3 font-semibold">{label}</p>
            <ul className="grid gap-1">
              {items.map((item) => (
                <li key={item} className="text-sm text-text-secondary">• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-tertiary">Menu is indicative and may vary. Chef maintains flexibility based on seasonal availability.</p>
    </div>
  );
}

// ─── Amenities tab ────────────────────────────────────────────────────────────

const AMENITY_CATEGORIES: Array<{ id: string; label: string }> = [
  { id: "COMFORT", label: "Comfort" },
  { id: "FOOD", label: "Food & Kitchen" },
  { id: "WORK", label: "Work & Leisure" },
  { id: "SAFETY", label: "Safety & Security" },
  { id: "UTILITIES", label: "Utilities" },
];

function AmenitiesTab({ property }: { property: PropertyDetailData }) {
  return (
    <div className="grid gap-8">
      <h2 className="text-xl font-bold">Amenities</h2>
      {AMENITY_CATEGORIES.map(({ id, label }) => {
        const items = property.amenities.filter((a) => a.category === id);
        if (items.length === 0) return null;
        return (
          <div key={id}>
            <h3 className="mb-3 text-sm font-bold text-text-secondary uppercase tracking-wide">{label}</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {items.map((a) => {
                const Icon = ICON_MAP[a.type] ?? Check;
                return (
                  <div
                    key={a.label}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 text-sm",
                      a.available ? "border-border" : "border-transparent bg-slate-50 opacity-50",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", a.available ? "text-success" : "text-text-tertiary")} />
                    <span className={a.available ? "" : "line-through text-text-tertiary"}>{a.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Rules tab ────────────────────────────────────────────────────────────────

function RulesTab({ property }: { property: PropertyDetailData }) {
  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-bold">House rules</h2>
      <ul className="grid gap-3">
        {property.rules.map((rule) => (
          <li key={rule} className="flex items-start gap-3 text-sm">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {rule}
          </li>
        ))}
      </ul>
      <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
        ⚠️ Please read all rules before booking. Violations may attract fines or early termination of stay.
      </div>
    </div>
  );
}

// ─── Reviews tab ─────────────────────────────────────────────────────────────

function ReviewsTab({ property }: { property: PropertyDetailData }) {
  const avg = (key: keyof typeof property.reviews[0]["ratings"]) => {
    const vals = property.reviews.map((r) => r.ratings[key] ?? 0).filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const ratingBreakdown = [
    { label: "Food", value: avg("food") },
    { label: "Cleanliness", value: avg("cleanliness") },
    { label: "Safety", value: avg("safety") },
    { label: "WiFi", value: avg("wifi") },
    { label: "Staff", value: avg("staff") },
  ];

  return (
    <div className="grid gap-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold">Reviews</h2>
          <div className="mt-1 flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="text-2xl font-black">{property.rating.toFixed(1)}</span>
            <span className="text-text-secondary">({property.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="grid gap-3 sm:grid-cols-2">
        {ratingBreakdown.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0 text-text-secondary">{label}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-amber-400 transition-all"
                style={{ width: `${(value / 5) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-semibold">{value.toFixed(1)}</span>
          </div>
        ))}
      </div>

      {/* Review cards */}
      <div className="grid gap-5">
        {property.reviews.map((review) => (
          <div key={review.id} className="border-b border-border pb-5 last:border-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                  {review.tenantFirstName[0]}
                </span>
                <div>
                  <p className="font-semibold">{review.tenantFirstName}</p>
                  <p className="text-xs text-text-tertiary">{review.stayDuration} stay · {new Date(review.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {review.rating}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{review.text}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-text-tertiary">Showing {property.reviews.length} of {property.reviewCount} reviews</p>
    </div>
  );
}

// ─── Location tab ─────────────────────────────────────────────────────────────

const PLACE_ICONS: Record<string, React.ElementType> = {
  metro: Train, hospital: Hospital, itpark: Building2,
  college: GraduationCap, restaurant: Soup, bus: Bus,
};

function LocationTab({ property }: { property: PropertyDetailData }) {
  const [office, setOffice] = useState("");

  return (
    <div className="grid gap-8">
      <div>
        <h2 className="text-xl font-bold">Location</h2>
        <p className="mt-1 text-text-secondary">
          <MapPin className="inline h-4 w-4 text-accent" /> {property.address.street}, {property.address.locality}, {property.address.city} – {property.address.pinCode}
        </p>
      </div>

      {/* Map placeholder */}
      <div className="relative h-56 overflow-hidden rounded-xl border border-border bg-[linear-gradient(135deg,#e8edf5_25%,#f0f4f8_25%,#f0f4f8_50%,#e8edf5_50%,#e8edf5_75%,#f0f4f8_75%)] bg-[length:24px_24px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-accent shadow-lg ring-8 ring-accent/20">
            <MapPin className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold shadow">
          {property.address.locality}, {property.address.city}
        </div>
        <div className="absolute right-3 top-3 rounded-lg bg-white px-3 py-1.5 text-xs shadow">
          Interactive map — coming soon
        </div>
      </div>

      {/* Nearby places */}
      <div>
        <h3 className="mb-4 font-bold">Nearby</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {property.nearbyPlaces.map((place) => {
            const Icon = PLACE_ICONS[place.type] ?? MapPin;
            return (
              <div key={place.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Icon className="h-5 w-5 shrink-0 text-accent" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{place.name}</p>
                  <p className="text-xs text-text-tertiary">
                    {place.distance}
                    {place.walkMinutes ? ` · ${place.walkMinutes} min walk` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commute calculator */}
      <div className="rounded-xl border border-border bg-slate-50 p-5">
        <h3 className="mb-3 font-bold">Commute calculator</h3>
        <p className="mb-3 text-sm text-text-secondary">Enter your office address to estimate travel time.</p>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="e.g. Salarpuria Softzone, Koramangala"
            value={office}
            onChange={(e) => setOffice(e.target.value)}
          />
          <Button size="sm" variant="secondary">Calculate</Button>
        </div>
        {office && (
          <p className="mt-3 text-sm text-text-secondary">
            <Clock className="inline h-4 w-4 text-text-tertiary" /> Estimated commute: ~15–25 min by auto/cab during peak hours.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

interface PropertyDetailClientProps {
  property: PropertyDetailData;
}

export function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const activeTab = useScrollSpy(TABS.map((t) => t.id));
  const tabNavRef = useRef<HTMLDivElement>(null);

  function scrollToTab(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = (tabNavRef.current?.offsetHeight ?? 48) + 72;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }

  const vacantBeds = property.rooms.flatMap((r) => r.beds).filter((b) => b.status === "VACANT").length;

  return (
    <>
      {/* Booking dialog */}
      <Dialog open={bookingOpen} title="Book a bed" onClose={() => setBookingOpen(false)}>
        <BookingForm
          bedId=""
          bedLabel="Selected bed"
          propertyName={property.name}
          monthlyRent={property.startingRent}
          depositAmount={property.startingRent * property.depositMonths}
          onSuccess={() => setBookingOpen(false)}
          onClose={() => setBookingOpen(false)}
        />
      </Dialog>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 md:pb-8">
        {/* Gallery */}
        <PropertyDetailGallery photos={property.photos} name={property.name} />

        {/* Two-column layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,380px]">
          {/* LEFT COLUMN */}
          <div className="min-w-0">
            {/* Property header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <TierBadge tier={property.tier} />
                <h1 className="mt-2 text-2xl font-black sm:text-3xl">{property.name}</h1>
                <p className="mt-1 flex items-center gap-1 text-text-secondary">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {property.address.locality}, {property.address.city} · {property.address.nearestMetro} ({property.address.metroDistance})
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{property.rating.toFixed(1)}</span>
                    <span className="text-sm text-text-secondary">({property.reviewCount} reviews)</span>
                  </div>
                  {property.hasThreeSixtyTour && (
                    <Badge variant="new">
                      <Play className="mr-1 h-3 w-3" />
                      360° tour
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Top amenity strip */}
            <div className="mt-5 flex flex-wrap gap-4 border-b border-border pb-5">
              {property.amenities.filter((a) => a.available).slice(0, 6).map((a) => {
                const Icon = ICON_MAP[a.type] ?? Check;
                return (
                  <span key={a.label} className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Icon className="h-4 w-4 text-primary" />
                    {a.label}
                  </span>
                );
              })}
            </div>

            {/* Sticky tab nav */}
            <div
              ref={tabNavRef}
              className="sticky top-16 z-30 -mx-4 overflow-x-auto bg-white/95 backdrop-blur sm:-mx-6 lg:-mx-0"
            >
              <div className="flex min-w-max border-b border-border">
                {TABS.map((tab) => {
                  // Hide food tab if no food
                  if (tab.id === "food" && property.foodDays.length === 0) return null;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => scrollToTab(tab.id)}
                      className={cn(
                        "shrink-0 px-4 py-3 text-sm font-semibold transition",
                        activeTab === tab.id
                          ? "border-b-2 border-accent text-accent"
                          : "text-text-secondary hover:text-text-primary",
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab sections — all in DOM for SEO */}
            <div className="mt-8 grid gap-16">
              <section id="overview"><OverviewTab property={property} /></section>
              <section id="rooms"><RoomsTab property={property} onBook={() => setBookingOpen(true)} /></section>
              {property.foodDays.length > 0 && <section id="food"><FoodTab property={property} /></section>}
              <section id="amenities"><AmenitiesTab property={property} /></section>
              <section id="rules"><RulesTab property={property} /></section>
              <section id="reviews"><ReviewsTab property={property} /></section>
              <section id="location"><LocationTab property={property} /></section>
            </div>
          </div>

          {/* RIGHT COLUMN — sticky booking card */}
          <div className="hidden lg:block">
            <BookingCard
              propertySlug={property.slug}
              propertyName={property.name}
              startingRent={property.startingRent}
              availableBeds={vacantBeds}
              depositMonths={property.depositMonths}
              whatsappNumber={property.whatsappNumber}
              onBookBed={() => setBookingOpen(true)}
              className="sticky top-20"
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <MobileBookingBar
        startingRent={property.startingRent}
        availableBeds={vacantBeds}
        onBook={() => setBookingOpen(true)}
      />
    </>
  );
}
