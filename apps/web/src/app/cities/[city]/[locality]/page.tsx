import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Train } from "lucide-react";
import { Badge, SectionHeader } from "@/components/ui";
import { PropertyCard } from "@/components/property/PropertyCard";
import {
  getCityBySlug,
  getLocalityBySlug,
  getCityLocalities,
  getPropertiesByLocality,
  toPropertyCard,
} from "@/lib/seed-data";
import { formatInr } from "@/lib/utils";

interface Params { params: Promise<{ city: string; locality: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { city: citySlug, locality: localitySlug } = await params;
  const locality = getLocalityBySlug(citySlug, localitySlug);
  const city = getCityBySlug(citySlug);
  if (!locality || !city) return { title: "Locality not found" };
  const title = `PG Accommodations in ${locality.name}, ${city.name} | ROOMLY`;
  const description = `${locality.pgCount}+ verified PGs in ${locality.name}, ${city.name}. Average rent ₹${locality.avgRent.toLocaleString("en-IN")}/mo. Zero broker fee.`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export async function generateStaticParams() {
  const { CITIES, LOCALITIES } = await import("@/lib/seed-data");
  const params: { city: string; locality: string }[] = [];
  for (const city of CITIES) {
    const locs = LOCALITIES[city.slug] ?? [];
    for (const loc of locs) {
      params.push({ city: city.slug, locality: loc.slug });
    }
  }
  return params;
}

export default async function LocalityPage({ params }: Params) {
  const { city: citySlug, locality: localitySlug } = await params;
  const city = getCityBySlug(citySlug);
  const locality = getLocalityBySlug(citySlug, localitySlug);
  if (!city || !locality) notFound();

  const properties = getPropertiesByLocality(citySlug, localitySlug).map(toPropertyCard);
  const nearbyLocalities = getCityLocalities(citySlug).filter((l) => l.slug !== localitySlug).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm sm:px-6 lg:px-8">
          <Link href="/" className="text-text-tertiary hover:text-text-primary">Home</Link>
          <span className="text-text-tertiary">/</span>
          <Link href={`/cities/${citySlug}`} className="text-text-tertiary hover:text-text-primary">{city.name}</Link>
          <span className="text-text-tertiary">/</span>
          <span className="font-medium">{locality.name}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-r from-primary/5 to-primary/10 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href={`/cities/${citySlug}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to {city.name}
          </Link>
          <h1 className="mt-2 text-3xl font-black lg:text-4xl">
            PG Accommodations in {locality.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-4">
            <Badge className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {city.name}, {city.state}
            </Badge>
            <span className="text-sm text-text-secondary">{locality.pgCount}+ verified PGs</span>
            <span className="text-sm text-text-secondary">Avg rent: {formatInr(locality.avgRent)}/mo</span>
            {locality.metroStation && (
              <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Train className="h-4 w-4" />
                {locality.metroStation} · {locality.metroDistance}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-surface border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { label: "PGs listed", value: `${locality.pgCount}+` },
            { label: "Avg monthly rent", value: formatInr(locality.avgRent) },
            { label: "Broker fee", value: "₹0" },
            { label: "Avg rating", value: "4.7★" },
          ].map(({ label, value }) => (
            <div key={label} className="py-4 px-4 text-center">
              <p className="text-lg font-black text-primary">{value}</p>
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Properties */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {properties.length} verified PGs in {locality.name}
            </h2>
            <Link href={`/search?city=${citySlug}&locality=${localitySlug}`} className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => <PropertyCard key={p.slug} {...p} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface py-16 text-center">
              <p className="text-text-secondary font-semibold">No properties listed yet for {locality.name}</p>
              <Link href={`/cities/${citySlug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                Browse {city.name} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About locality */}
      <section className="bg-surface py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold mb-3">About {locality.name}</h2>
          <p className="leading-relaxed text-text-secondary">{locality.aboutText}</p>
          {locality.nearbyLandmarks.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Nearby landmarks</p>
              <div className="flex flex-wrap gap-2">
                {locality.nearbyLandmarks.map((lm) => (
                  <span key={lm} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-medium">
                    {lm}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Nearby localities */}
      {nearbyLocalities.length > 0 && (
        <section className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Nearby localities" subtitle={`Explore more areas in ${city.name}`} />
            <div className="flex flex-wrap gap-3">
              {nearbyLocalities.map((loc) => (
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
    </div>
  );
}
