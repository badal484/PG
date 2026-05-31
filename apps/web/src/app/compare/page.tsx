"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, MapPin, Star, X } from "lucide-react";
import { Button, TierBadge } from "@/components/ui";
import { useCompareStore } from "@/lib/store/compare-store";
import { formatInr } from "@/lib/utils";
import { ALL_PROPERTY_CARDS, PROPERTIES } from "@/lib/seed-data";

const AMENITY_LABELS = ["WiFi", "AC", "Meals", "Gym", "Study room", "Hot water", "Parking", "CCTV"];

function hasAmenity(amenities: Array<{ type: string; label: string }>, keyword: string): boolean {
  return amenities.some((a) => a.label.toLowerCase().includes(keyword.toLowerCase()));
}

function Cell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`border-b border-border p-4 align-top text-sm ${className ?? ""}`}>
      {children}
    </td>
  );
}

function LabelCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-b border-border bg-surface p-4 align-middle text-xs font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
      {children}
    </td>
  );
}

export default function ComparePage() {
  const { properties, remove, clear } = useCompareStore();

  if (properties.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10">
          <ArrowLeft className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Nothing to compare yet</h1>
        <p className="max-w-md text-text-secondary">
          Add up to 3 properties to compare them side-by-side. Look for the "Compare" button on any property card.
        </p>
        <Link href="/search">
          <Button size="lg">Browse properties</Button>
        </Link>
      </div>
    );
  }

  const detailMap = Object.fromEntries(
    PROPERTIES.map((p) => [p.slug, p]),
  );

  const cols = properties;
  const colWidth = cols.length === 1 ? "w-full max-w-sm" : cols.length === 2 ? "w-1/2" : "w-1/3";

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/search" className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-base font-bold">Comparing {cols.length} propert{cols.length === 1 ? "y" : "ies"}</h1>
          </div>
          <button onClick={clear} className="text-sm font-semibold text-accent hover:underline">
            Clear all
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-36" />
              {cols.map((p) => <col key={p.slug} />)}
            </colgroup>

            <tbody>
              {/* Photos + name */}
              <tr>
                <LabelCell>Property</LabelCell>
                {cols.map((p) => (
                  <Cell key={p.slug}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                      {p.photos[0] && (
                        <Image src={p.photos[0]} alt={p.name} fill className="object-cover" sizes="320px" />
                      )}
                      <button
                        onClick={() => remove(p.slug)}
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
                        aria-label={`Remove ${p.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute left-2 top-2">
                        <TierBadge tier={p.tier} />
                      </div>
                    </div>
                    <Link href={`/properties/${p.slug}`} className="mt-3 block font-bold hover:text-primary line-clamp-2">
                      {p.name}
                    </Link>
                    <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {p.locality}, {p.city}
                    </p>
                  </Cell>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <LabelCell>Rating</LabelCell>
                {cols.map((p) => (
                  <Cell key={p.slug}>
                    {p.rating ? (
                      <span className="flex items-center gap-1.5 font-bold">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {p.rating}
                        <span className="font-normal text-text-tertiary">({p.reviewCount} reviews)</span>
                      </span>
                    ) : (
                      <span className="text-text-tertiary">No reviews yet</span>
                    )}
                  </Cell>
                ))}
              </tr>

              {/* Price */}
              <tr>
                <LabelCell>Starting rent</LabelCell>
                {cols.map((p) => (
                  <Cell key={p.slug}>
                    <span className="text-lg font-black text-primary">{formatInr(p.startingRent)}</span>
                    <span className="text-xs text-text-secondary">/mo</span>
                  </Cell>
                ))}
              </tr>

              {/* Deposit */}
              <tr>
                <LabelCell>Deposit</LabelCell>
                {cols.map((p) => {
                  const detail = detailMap[p.slug];
                  return (
                    <Cell key={p.slug}>
                      {detail ? `${detail.depositMonths} month${detail.depositMonths > 1 ? "s" : ""}` : "—"}
                    </Cell>
                  );
                })}
              </tr>

              {/* Available beds */}
              <tr>
                <LabelCell>Available beds</LabelCell>
                {cols.map((p) => (
                  <Cell key={p.slug}>
                    <span className={p.availableBeds === 0 ? "text-red-600 font-semibold" : p.availableBeds <= 2 ? "text-amber-600 font-semibold" : "text-success font-semibold"}>
                      {p.availableBeds === 0 ? "Fully occupied" : `${p.availableBeds} bed${p.availableBeds > 1 ? "s" : ""}`}
                    </span>
                  </Cell>
                ))}
              </tr>

              {/* Gender policy */}
              <tr>
                <LabelCell>For</LabelCell>
                {cols.map((p) => {
                  const detail = detailMap[p.slug];
                  return (
                    <Cell key={p.slug}>
                      {detail ? detail.genderPolicy.charAt(0) + detail.genderPolicy.slice(1).toLowerCase() : "—"}
                    </Cell>
                  );
                })}
              </tr>

              {/* Distance */}
              <tr>
                <LabelCell>Location note</LabelCell>
                {cols.map((p) => (
                  <Cell key={p.slug}>{p.distance ?? "—"}</Cell>
                ))}
              </tr>

              {/* Amenities */}
              {AMENITY_LABELS.map((amenity) => (
                <tr key={amenity}>
                  <LabelCell>{amenity}</LabelCell>
                  {cols.map((p) => (
                    <Cell key={p.slug}>
                      {hasAmenity(p.amenities, amenity) ? (
                        <span className="flex items-center gap-1.5 text-success font-semibold">
                          <Check className="h-4 w-4" /> Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-text-tertiary">
                          <X className="h-4 w-4" /> No
                        </span>
                      )}
                    </Cell>
                  ))}
                </tr>
              ))}

              {/* CTA row */}
              <tr>
                <td className="p-4" />
                {cols.map((p) => (
                  <Cell key={p.slug}>
                    <Link href={`/properties/${p.slug}`}>
                      <Button className="w-full" disabled={p.availableBeds === 0}>
                        {p.availableBeds === 0 ? "Fully occupied" : "View property"}
                      </Button>
                    </Link>
                  </Cell>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
