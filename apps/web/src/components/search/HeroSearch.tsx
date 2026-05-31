"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { CITIES } from "@/lib/seed-data";

interface HeroSearchProps {
  defaultCity?: string;
  compact?: boolean;
}

const STAY_TYPES = [
  { value: "monthly", label: "Monthly" },
  { value: "long-term", label: "Long-term (11 mo+)" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];

export function HeroSearch({ defaultCity = "", compact = false }: HeroSearchProps) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity);
  const [cityQuery, setCityQuery] = useState(defaultCity ? (CITIES.find((c) => c.slug === defaultCity)?.name ?? "") : "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [moveInDate, setMoveInDate] = useState("");
  const [stayType, setStayType] = useState("monthly");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCities = cityQuery
    ? CITIES.filter((c) => c.name.toLowerCase().startsWith(cityQuery.toLowerCase()))
    : CITIES;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (moveInDate) params.set("moveIn", moveInDate);
    if (stayType) params.set("stayType", stayType);
    router.push(`/search?${params.toString()}`);
  }

  function selectCity(c: (typeof CITIES)[number]) {
    setCity(c.slug);
    setCityQuery(c.name);
    setShowDropdown(false);
  }

  const wrapperCls = compact
    ? "flex flex-col gap-2 sm:flex-row sm:items-center sm:rounded-full sm:bg-white sm:p-2 sm:shadow-lg"
    : "flex flex-col gap-3 rounded-xl bg-white p-4 shadow-xl lg:flex-row lg:items-center lg:rounded-full lg:p-2";

  const inputCls = compact
    ? "flex-1 flex items-center gap-2 rounded-full bg-slate-100 px-4 h-11 cursor-text"
    : "flex-1 flex items-center gap-2 rounded-lg lg:rounded-full px-4 h-12 bg-slate-50 lg:bg-transparent cursor-text border border-border lg:border-0 lg:border-r lg:border-border lg:rounded-none first:lg:rounded-l-full";

  return (
    <div className={wrapperCls}>
      {/* City */}
      <div className="relative flex-1" ref={dropdownRef}>
        <div
          className={cn(inputCls, "focus-within:ring-2 focus-within:ring-accent/30")}
          onClick={() => setShowDropdown(true)}
        >
          <MapPin className="h-5 w-5 shrink-0 text-accent" />
          <input
            className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-text-tertiary"
            placeholder="City or locality"
            value={cityQuery}
            onChange={(e) => { setCityQuery(e.target.value); setShowDropdown(true); setCity(""); }}
            onFocus={() => setShowDropdown(true)}
            aria-label="Search city"
          />
        </div>
        {showDropdown && (
          <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-white shadow-xl">
            <div className="max-h-64 overflow-y-auto py-1">
              {filteredCities.length === 0 ? (
                <p className="px-4 py-3 text-sm text-text-tertiary">No cities found</p>
              ) : (
                filteredCities.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                    onClick={() => selectCity(c)}
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-text-tertiary" />
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-text-tertiary">{c.state} · {c.pgCount.toLocaleString()}+ PGs</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Date */}
      <div className={cn(inputCls, "relative")}>
        <Calendar className="h-5 w-5 shrink-0 text-text-tertiary" />
        <input
          type="date"
          className="flex-1 bg-transparent text-sm font-medium outline-none"
          min={new Date().toISOString().split("T")[0]}
          value={moveInDate}
          onChange={(e) => setMoveInDate(e.target.value)}
          aria-label="Move-in date"
        />
      </div>

      {/* Stay type */}
      <div className={cn(inputCls, "relative")}>
        <select
          className="flex-1 appearance-none bg-transparent text-sm font-medium outline-none"
          value={stayType}
          onChange={(e) => setStayType(e.target.value)}
          aria-label="Stay type"
        >
          {STAY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <ChevronDown className="h-4 w-4 shrink-0 text-text-tertiary" />
      </div>

      <Button size={compact ? "md" : "lg"} onClick={handleSearch} className={compact ? "rounded-full px-6" : "w-full lg:w-auto lg:rounded-full px-8"}>
        <Search className="h-4 w-4" />
        Search PGs
      </Button>
    </div>
  );
}
