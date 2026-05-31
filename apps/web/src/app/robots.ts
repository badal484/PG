import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/owner/dashboard/", "/api/", "/tenant/", "/_next/"],
      },
    ],
    sitemap: "https://roomly.in/sitemap.xml",
  };
}
