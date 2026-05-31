import type { MetadataRoute } from "next";
import { CITIES, LOCALITIES, PROPERTIES } from "@/lib/seed-data";

const BASE_URL = "https://roomly.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/compare`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/owners`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/owners/onboarding`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${BASE_URL}/cities/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const localityRoutes: MetadataRoute.Sitemap = CITIES.flatMap((city) => {
    const localities = LOCALITIES[city.slug] ?? [];
    return localities.map((loc) => ({
      url: `${BASE_URL}/cities/${city.slug}/${loc.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    }));
  });

  const propertyRoutes: MetadataRoute.Sitemap = PROPERTIES.map((p) => ({
    url: `${BASE_URL}/properties/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
    images: p.photos.slice(0, 3).map((photo) => photo.url),
  }));

  return [...staticRoutes, ...cityRoutes, ...localityRoutes, ...propertyRoutes];
}
