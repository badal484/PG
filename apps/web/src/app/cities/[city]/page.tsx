import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Badge, SectionHeader } from "@/components/ui";
import { PropertyCard } from "@/components/property/PropertyCard";
import { getCityBySlug, getCityLocalities, getPropertiesByCity, toPropertyCard } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

interface Params { params: Promise<{ city: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return { title: "City not found" };
  return {
    title: `PG Accommodations in ${city.name} | ROOMLY`,
    description: city.metaDesc,
    openGraph: {
      title: `PG Accommodations in ${city.name} | ROOMLY`,
      description: city.metaDesc,
    },
  };
}

export async function generateStaticParams() {
  const { CITIES } = await import("@/lib/seed-data");
  return CITIES.map((c) => ({ city: c.slug }));
}

export default async function CityPage({ params }: Params) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const localities = getCityLocalities(citySlug);
  const properties = getPropertiesByCity(citySlug).map(toPropertyCard);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className={cn("relative overflow-hidden bg-gradient-to-br pb-12 pt-16", city.color)}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <MapPin className="mr-1.5 h-3.5 w-3.5" />
              {city.state}
            </Badge>
            <h1 className="text-4xl font-black lg:text-5xl">{city.name}</h1>
            <p className="mt-3 text-lg text-white/80">{city.tagline}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-white">{city.pgCount.toLocaleString("en-IN")}+</span> verified PGs
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">4.7</span> avg rating
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-white">₹0</span> broker fee
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Locality chips */}
      {localities.length > 0 && (
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <p className="mb-3 text-sm font-semibold text-text-secondary">Popular localities</p>
            <div className="flex flex-wrap gap-2">
              {localities.map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/cities/${citySlug}/${loc.slug}`}
                  className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
                >
                  {loc.name}
                  <span className="text-xs text-text-tertiary">{loc.pgCount}+ PGs</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Properties */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {properties.length > 0 ? `${properties.length} verified PGs` : "Verified PGs"} in {city.name}
            </h2>
            <Link href={`/search?city=${citySlug}`} className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => <PropertyCard key={p.slug} {...p} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface py-16 text-center">
              <p className="font-semibold text-text-secondary">Properties coming soon for {city.name}</p>
              <Link href="/search" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
                Browse all cities <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Locality grid */}
      {localities.length > 0 && (
        <section className="bg-surface py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title={`Top localities in ${city.name}`}
              subtitle="Pick a neighbourhood that fits your commute"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {localities.map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/cities/${citySlug}/${loc.slug}`}
                  className="group rounded-xl border border-border bg-white p-5 transition hover:border-primary hover:shadow-md"
                >
                  <p className="font-bold group-hover:text-primary">{loc.name}</p>
                  <p className="mt-1 text-xs text-text-tertiary">{loc.pgCount}+ PGs · avg ₹{loc.avgRent.toLocaleString("en-IN")}/mo</p>
                  {loc.nearbyLandmarks.length > 0 && (
                    <p className="mt-2 text-xs text-text-secondary truncate">Near: {loc.nearbyLandmarks.slice(0, 2).join(", ")}</p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                    View PGs <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SEO content */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold mb-4">About PG accommodations in {city.name}</h2>
          <p className="leading-relaxed text-text-secondary">{city.metaDesc}</p>
          <p className="mt-4 leading-relaxed text-text-secondary">
            ROOMLY lists {city.pgCount.toLocaleString("en-IN")}+ verified PG accommodations across {city.name}. Every property
            is physically inspected by our team for cleanliness, safety, and accuracy of listing. Book online in
            minutes with zero broker fees and a 48-hour free cancellation policy.
          </p>
        </div>
      </section>
    </div>
  );
}
