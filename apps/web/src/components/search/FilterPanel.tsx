"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { RangeSlider } from "./RangeSlider";
import { cn } from "@/lib/utils";

export interface SearchFilters {
  minRent: number;
  maxRent: number;
  gender: string;
  stayType: string[];
  sharing: string[];
  amenities: string[];
  tier: string[];
}

export const DEFAULT_FILTERS: SearchFilters = {
  minRent: 5000,
  maxRent: 30000,
  gender: "any",
  stayType: [],
  sharing: [],
  amenities: [],
  tier: [],
};

const GENDER_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "gents", label: "Gents" },
  { value: "ladies", label: "Ladies" },
  { value: "unisex", label: "Unisex" },
  { value: "couple", label: "Couple-friendly" },
];

const STAY_TYPE_OPTIONS = ["Daily", "Weekly", "Monthly", "Long-term (11 mo+)"];

const SHARING_OPTIONS = ["Single occupancy", "Double sharing", "Triple sharing"];

const AMENITY_OPTIONS = [
  "WiFi", "AC", "3 Meals/day", "Gym", "Workspace / Co-work", "Parking",
  "Hot water", "Laundry", "CCTV", "Power backup", "Rooftop", "Biometric entry",
];

const TIER_OPTIONS = [
  { value: "PREMIUM", label: "Verified Premium" },
  { value: "STANDARD", label: "Verified Standard" },
  { value: "BUDGET", label: "Verified Budget" },
];

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClose?: () => void;
  className?: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-5">
      <p className="mb-4 text-sm font-bold text-text-primary">{title}</p>
      {children}
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-accent"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function toggleArr(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

export function FilterPanel({ filters, onChange, onClose, className }: FilterPanelProps) {
  const active =
    filters.minRent !== DEFAULT_FILTERS.minRent ||
    filters.maxRent !== DEFAULT_FILTERS.maxRent ||
    filters.gender !== "any" ||
    filters.stayType.length > 0 ||
    filters.sharing.length > 0 ||
    filters.amenities.length > 0 ||
    filters.tier.length > 0;

  return (
    <aside className={cn("grid gap-5 rounded-sm border border-border bg-surface p-5", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Filters</h2>
        <div className="flex items-center gap-2">
          {active && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="text-xs font-semibold text-accent hover:underline"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} aria-label="Close filters" className="ml-1">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <Section title="Monthly budget">
        <RangeSlider
          min={5000}
          max={30000}
          value={[filters.minRent, filters.maxRent]}
          onChange={([lo, hi]) => onChange({ ...filters, minRent: lo, maxRent: hi })}
          step={500}
          formatLabel={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
      </Section>

      <Section title="Gender preference">
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...filters, gender: opt.value })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                filters.gender === opt.value
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface hover:border-primary",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Stay type">
        <div className="grid gap-1">
          {STAY_TYPE_OPTIONS.map((opt) => (
            <CheckRow
              key={opt}
              label={opt}
              checked={filters.stayType.includes(opt)}
              onChange={() => onChange({ ...filters, stayType: toggleArr(filters.stayType, opt) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Room sharing">
        <div className="grid gap-1">
          {SHARING_OPTIONS.map((opt) => (
            <CheckRow
              key={opt}
              label={opt}
              checked={filters.sharing.includes(opt)}
              onChange={() => onChange({ ...filters, sharing: toggleArr(filters.sharing, opt) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Amenities">
        <div className="grid gap-1">
          {AMENITY_OPTIONS.map((opt) => (
            <CheckRow
              key={opt}
              label={opt}
              checked={filters.amenities.includes(opt)}
              onChange={() => onChange({ ...filters, amenities: toggleArr(filters.amenities, opt) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Tier">
        <div className="grid gap-1">
          {TIER_OPTIONS.map((opt) => (
            <CheckRow
              key={opt.value}
              label={opt.label}
              checked={filters.tier.includes(opt.value)}
              onChange={() => onChange({ ...filters, tier: toggleArr(filters.tier, opt.value) })}
            />
          ))}
        </div>
      </Section>

      <Button className="w-full" onClick={onClose}>Show results</Button>
    </aside>
  );
}
