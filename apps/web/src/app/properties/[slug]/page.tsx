import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PropertyDetailClient } from "@/components/property/PropertyDetailClient";
import { getPropertyBySlug, PROPERTIES } from "@/lib/seed-data";

interface Params { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) return { title: "Property not found" };

  const title = `${property.name} — PG in ${property.address.locality}, ${property.address.city} | ROOMLY`;
  const description = `${property.description.slice(0, 155)}…`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: property.photos[0] ? [{ url: property.photos[0].url, width: 1200, height: 630 }] : undefined,
    },
    alternates: {
      canonical: `/properties/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  return PROPERTIES.map((p) => ({ slug: p.slug }));
}

export default async function PropertyDetailPage({ params }: Params) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const citySlug = property.address.city.toLowerCase().replace(/\s+/g, "-");
  const localitySlug = property.address.locality.toLowerCase().replace(/\s+/g, "-");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    description: property.description,
    url: `https://roomly.in/properties/${slug}`,
    image: property.photos.map((p) => p.url),
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address.street,
      addressLocality: property.address.locality,
      addressRegion: property.address.state,
      postalCode: property.address.pinCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.address.coordinates.lat,
      longitude: property.address.coordinates.lng,
    },
    aggregateRating: property.reviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: property.rating,
          reviewCount: property.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    priceRange: `₹${property.startingRent.toLocaleString("en-IN")}/month`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="border-b border-border bg-surface" aria-label="Breadcrumb">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-2.5 text-xs text-text-tertiary sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-text-primary">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/cities/${citySlug}`} className="hover:text-text-primary capitalize">{property.address.city}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/cities/${citySlug}/${localitySlug}`} className="hover:text-text-primary">{property.address.locality}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-text-primary">{property.name}</span>
        </div>
      </nav>

      <PropertyDetailClient property={property} />
    </>
  );
}
