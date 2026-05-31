"use client";

import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { useState } from "react";
import { Badge, Button, TierBadge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { AmenityIcon, PriceDisplay, StarRatingDisplay } from "./shared";

export type PropertyCardProps = {
  slug: string;
  name: string;
  locality: string;
  city: string;
  photos: string[];
  tier?: string;
  rating?: number;
  reviewCount?: number;
  startingRent: number;
  availableBeds: number;
  amenities: Array<{ type: "gym" | "wifi" | "food" | "ac" | "workspace" | "hotWater" | "parking"; label: string }>;
  distance?: string;
};

export function PropertyCard({ slug, name, locality, city, photos, tier, rating, reviewCount, startingRent, availableBeds, amenities, distance }: PropertyCardProps) {
  const [active, setActive] = useState(0);
  const visibleAmenities = amenities.slice(0, 5);
  const extra = amenities.length - visibleAmenities.length;

  return (
    <article className="group overflow-hidden rounded-sm border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/properties/${slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100" onMouseEnter={() => photos.length > 1 && setActive(1)} onMouseLeave={() => setActive(0)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[active] ?? photos[0]} alt={name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute left-3 top-3"><TierBadge tier={tier} /></div>
        </div>
      </Link>
      <button className="absolute right-3 top-3 hidden" />
      <div className="relative p-4">
        <Button variant="ghost" size="icon" className="absolute -top-14 right-3 rounded-full bg-white/95 shadow-sm" aria-label="Save property"><Heart className="h-5 w-5" /></Button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/properties/${slug}`} className="font-bold text-primary hover:text-accent">{name}</Link>
            <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary"><MapPin className="h-4 w-4" />{locality}, {city}{distance ? ` • ${distance}` : ""}</p>
          </div>
          <StarRatingDisplay rating={rating} count={reviewCount} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {visibleAmenities.map((amenity) => <AmenityIcon key={amenity.label} {...amenity} />)}
          {extra > 0 ? <Badge>+{extra} more</Badge> : null}
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-text-secondary">Beds from</p>
            <PriceDisplay amount={startingRent} />
          </div>
          <Badge variant={availableBeds > 3 ? "active" : "due"}>{availableBeds} beds left</Badge>
        </div>
      </div>
    </article>
  );
}

export function PropertyCardSkeleton() {
  return <div className={cn("h-[420px] rounded-sm border border-border bg-slate-100")} />;
}
