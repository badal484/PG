import { Dumbbell, IndianRupee, Soup, Star, Wifi, Wind, BriefcaseBusiness, Droplets, Car } from "lucide-react";
import { cn, formatInr } from "@/lib/utils";

const amenityIcons = {
  gym: Dumbbell,
  wifi: Wifi,
  food: Soup,
  ac: Wind,
  workspace: BriefcaseBusiness,
  hotWater: Droplets,
  parking: Car,
};

export function AmenityIcon({ type, label }: { type: keyof typeof amenityIcons; label: string }) {
  const Icon = amenityIcons[type] ?? Star;
  return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary"><Icon className="h-4 w-4 text-primary" />{label}</span>;
}

export function StarRatingDisplay({ rating, count }: { rating?: number; count?: number }) {
  return <span className="inline-flex items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{rating?.toFixed(1) ?? "New"}{count ? <span className="font-normal text-text-secondary">({count})</span> : null}</span>;
}

export function PriceDisplay({ amount, suffix = "/mo", className }: { amount: number; suffix?: string; className?: string }) {
  return <span className={cn("inline-flex items-baseline gap-1 font-bold text-primary", className)}><IndianRupee className="h-4 w-4" />{formatInr(amount).replace("₹", "")}<span className="text-sm font-medium text-text-secondary">{suffix}</span></span>;
}
