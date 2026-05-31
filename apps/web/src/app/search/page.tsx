"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Map, SlidersHorizontal } from "lucide-react";
import { Button, Sheet, Skeleton } from "@/components/ui";
import { PropertyCard, PropertyCardSkeleton } from "@/components/property/PropertyCard";
import { FilterPanel, SearchFilters, DEFAULT_FILTERS } from "@/components/search/FilterPanel";
import { ALL_PROPERTY_CARDS, PROPERTIES } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rent_asc", label: "Price: Low to High" },
  { value: "rent_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "beds", label: "Most Beds Available" },
];

function useSearchState() {
  const router = useRouter();
  const params = useSearchParams();

  const filters: SearchFilters = {
    minRent: Number(params.get("minRent")) || DEFAULT_FILTERS.minRent,
    maxRent: Number(params.get("maxRent")) || DEFAULT_FILTERS.maxRent,
    gender: params.get("gender") || DEFAULT_FILTERS.gender,
    stayType: params.get("stayType") ? params.get("stayType")!.split(",") : [],
    sharing: params.get("sharing") ? params.get("sharing")!.split(",") : [],
    amenities: params.get("amenities") ? params.get("amenities")!.split(",") : [],
    tier: params.get("tier") ? params.get("tier")!.split(",") : [],
  };

  const city = params.get("city") || "";
  const locality = params.get("locality") || "";
  const sort = params.get("sort") || "relevance";
  const q = params.get("q") || "";

  const setFilters = useCallback((next: SearchFilters) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("minRent", String(next.minRent));
    sp.set("maxRent", String(next.maxRent));
    sp.set("gender", next.gender);
    if (next.stayType.length) sp.set("stayType", next.stayType.join(",")); else sp.delete("stayType");
    if (next.sharing.length) sp.set("sharing", next.sharing.join(",")); else sp.delete("sharing");
    if (next.amenities.length) sp.set("amenities", next.amenities.join(",")); else sp.delete("amenities");
    if (next.tier.length) sp.set("tier", next.tier.join(",")); else sp.delete("tier");
    router.push(`/search?${sp.toString()}`);
  }, [params, router]);

  const setSort = useCallback((val: string) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("sort", val);
    router.push(`/search?${sp.toString()}`);
  }, [params, router]);

  return { filters, city, locality, sort, q, setFilters, setSort };
}

function filterAndSort(filters: SearchFilters, city: string, locality: string, sort: string, q: string) {
  let results = ALL_PROPERTY_CARDS;

  if (city) results = results.filter((p) => p.city.toLowerCase().replace(/\s+/g, "-") === city);
  if (locality) results = results.filter((p) => p.locality.toLowerCase().replace(/\s+/g, "-") === locality);
  if (q) {
    const lq = q.toLowerCase();
    results = results.filter((p) => p.name.toLowerCase().includes(lq) || p.locality.toLowerCase().includes(lq) || p.city.toLowerCase().includes(lq));
  }

  results = results.filter((p) => p.startingRent >= filters.minRent && p.startingRent <= filters.maxRent);
  if (filters.gender !== "any") {
    const genderMap: Record<string, string[]> = { gents: ["GENTS"], ladies: ["LADIES"], unisex: ["UNISEX"], couple: ["UNISEX", "COUPLE"] };
    const allowed = genderMap[filters.gender] ?? [];
    const props = PROPERTIES;
    results = results.filter((p) => {
      const detail = props.find((d) => d.slug === p.slug);
      return !detail || allowed.includes(detail.genderPolicy as string);
    });
  }
  if (filters.tier.length) results = results.filter((p) => p.tier != null && filters.tier.includes(p.tier));
  if (filters.amenities.length) {
    results = results.filter((p) =>
      filters.amenities.every((a) => p.amenities.some((pa) => pa.label.toLowerCase().includes(a.toLowerCase()))),
    );
  }

  switch (sort) {
    case "rent_asc": return [...results].sort((a, b) => a.startingRent - b.startingRent);
    case "rent_desc": return [...results].sort((a, b) => b.startingRent - a.startingRent);
    case "rating": return [...results].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "beds": return [...results].sort((a, b) => b.availableBeds - a.availableBeds);
    default: return results;
  }
}

function SearchInner() {
  const { filters, city, locality, sort, q, setFilters, setSort } = useSearchState();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const results = filterAndSort(filters, city, locality, sort, q);

  const heading = locality
    ? `PGs in ${locality.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`
    : city
      ? `PGs in ${city.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`
      : q
        ? `Search results for "${q}"`
        : "All verified PGs";

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <div className="sticky top-16 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex-1">
            <p className="text-sm text-text-secondary">
              <span className="font-bold text-text-primary">{results.length}</span> properties found
              {city && <> · <span className="capitalize">{city.replace(/-/g, " ")}</span></>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="hidden h-9 rounded-lg border border-border bg-white px-3 text-sm font-medium outline-none focus:border-primary sm:block"
              aria-label="Sort results"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* View toggle */}
            <div className="hidden items-center gap-1 rounded-lg border border-border p-1 sm:flex">
              <button
                onClick={() => setView("grid")}
                className={cn("rounded p-1.5 transition", view === "grid" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary")}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn("rounded p-1.5 transition", view === "list" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary")}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile filter button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar — desktop only */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-32">
              <FilterPanel filters={filters} onChange={setFilters} />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            <h1 className="mb-5 text-xl font-bold">{heading}</h1>

            {results.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <Map className="h-12 w-12 text-text-tertiary" />
                <p className="text-lg font-semibold">No properties match your filters</p>
                <p className="text-text-secondary">Try adjusting your budget or removing some filters.</p>
                <Button onClick={() => setFilters(DEFAULT_FILTERS)} variant="outline">
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className={cn(
                "grid gap-5",
                view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
              )}>
                {results.map((p) => (
                  <PropertyCard key={p.slug} {...p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} title="Filters">
        <div className="overflow-y-auto p-4">
          <FilterPanel
            filters={filters}
            onChange={(f) => { setFilters(f); }}
            onClose={() => setMobileFilterOpen(false)}
          />
        </div>
      </Sheet>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <div className="hidden w-72 shrink-0 lg:block">
              <Skeleton className="h-96 rounded-xl" />
            </div>
            <div className="flex-1 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchInner />
    </Suspense>
  );
}
