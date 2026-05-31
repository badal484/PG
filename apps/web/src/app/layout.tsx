import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://roomly.in";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    template: "%s | ROOMLY",
    default: "ROOMLY — Verified PG & Co-living in India",
  },
  description:
    "Find verified PGs, co-living spaces and managed beds across Bangalore, Mumbai, Hyderabad and more. Book instantly, pay securely.",
  keywords: ["PG", "paying guest", "co-living", "hostel", "room rental", "India"],
  authors: [{ name: "ROOMLY" }],
  creator: "ROOMLY",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: "ROOMLY",
    title: "ROOMLY — Verified PG & Co-living in India",
    description: "Find verified PGs and co-living spaces. Book instantly, pay securely.",
    images: [
      {
        url: `${APP_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "ROOMLY — Verified PG & Co-living",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ROOMLY — Verified PG & Co-living in India",
    description: "Find verified PGs and co-living spaces. Book instantly, pay securely.",
    images: [`${APP_URL}/og-default.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Organization JSON-LD for homepage
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ROOMLY",
  url: APP_URL,
  logo: `${APP_URL}/logo.png`,
  description: "Verified PG & Co-living booking platform for India",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@roomly.in",
  },
  sameAs: [
    "https://twitter.com/roomly_in",
    "https://www.instagram.com/roomly_in",
    "https://www.linkedin.com/company/roomly-in",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-full bg-background text-text-primary">
        {/* Accessibility: skip to main content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>

        <Providers>
          <Header />
          <main id="main-content" className="min-h-screen pb-20 md:pb-0" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <MobileNav />
        </Providers>

        {/* Accessibility: live region for announcements */}
        <div
          id="a11y-announcer"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </body>
    </html>
  );
}
