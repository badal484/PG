import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://roomly.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/cities/", "/properties/"],
        disallow: [
          "/admin/",
          "/owner/",
          "/pms/",
          "/tenant/",
          "/api/",
          "/_next/",
          "/auth/",
          "/book",
          "/compare",  // no indexing of compare tool
        ],
      },
      // Block AI scrapers from high-value content
      {
        userAgent: ["GPTBot", "CCBot", "anthropic-ai", "Claude-Web"],
        disallow: ["/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
