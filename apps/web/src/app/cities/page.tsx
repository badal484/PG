import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { CITIES } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Browse PGs by City",
  description: "Find verified PGs and co-living spaces across Bangalore, Mumbai, Hyderabad, Pune, Chennai and more.",
};

export default function CitiesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black">Browse by City</h1>
        <p className="mt-2 text-text-secondary">Verified PGs and co-living spaces across India</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CITIES.map((city) => (
          <Link
            key={city.slug}
            href={`/cities/${city.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center shrink-0">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg group-hover:text-primary transition">{city.name}</h2>
              <p className="text-sm text-text-secondary mt-0.5">Explore PGs</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
