import Link from "next/link";
import { ArrowRight, BadgeCheck, BedDouble, Building2, IndianRupee, MapPin, Search, Shield, Star, TrendingUp, Users } from "lucide-react";
import { Badge, Button, FilterChips, SectionHeader } from "@/components/ui";
import { PropertyCard, PropertyCardProps } from "@/components/property/PropertyCard";
import { AnimatedCounter } from "@/components/homepage/AnimatedCounter";
import { NewsletterForm } from "@/components/homepage/NewsletterForm";
import { cn } from "@/lib/utils";

// ─── Static data (will come from API) ─────────────────────────────────────────

const CITIES = [
  { name: "Bengaluru", slug: "bengaluru", count: "3,400+", color: "from-purple-600 to-indigo-700" },
  { name: "Pune", slug: "pune", count: "2,100+", color: "from-blue-600 to-cyan-600" },
  { name: "Hyderabad", slug: "hyderabad", count: "1,800+", color: "from-teal-600 to-emerald-600" },
  { name: "Mumbai", slug: "mumbai", count: "1,500+", color: "from-orange-600 to-rose-600" },
  { name: "Delhi", slug: "delhi", count: "2,300+", color: "from-red-600 to-pink-600" },
  { name: "Chennai", slug: "chennai", count: "900+", color: "from-amber-600 to-orange-600" },
  { name: "Gurugram", slug: "gurugram", count: "700+", color: "from-violet-600 to-purple-700" },
  { name: "Noida", slug: "noida", count: "600+", color: "from-sky-600 to-blue-700" },
];

const FEATURED_PROPERTIES: PropertyCardProps[] = [
  {
    slug: "sunrise-boys-pg-koramangala",
    name: "Sunrise Boys PG",
    locality: "Koramangala",
    city: "Bengaluru",
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    ],
    tier: "PREMIUM",
    rating: 4.8,
    reviewCount: 124,
    startingRent: 9800,
    availableBeds: 4,
    amenities: [
      { type: "wifi", label: "WiFi" },
      { type: "food", label: "Meals" },
      { type: "ac", label: "AC" },
      { type: "gym", label: "Gym" },
      { type: "workspace", label: "Study room" },
    ],
    distance: "0.8 km from metro",
  },
  {
    slug: "green-valley-pg-hsr-layout",
    name: "Green Valley PG",
    locality: "HSR Layout",
    city: "Bengaluru",
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80",
    ],
    tier: "STANDARD",
    rating: 4.5,
    reviewCount: 89,
    startingRent: 7500,
    availableBeds: 2,
    amenities: [
      { type: "wifi", label: "WiFi" },
      { type: "ac", label: "AC" },
      { type: "hotWater", label: "Hot water" },
      { type: "parking", label: "Parking" },
    ],
    distance: "1.2 km from offices",
  },
  {
    slug: "urban-nest-pg-baner",
    name: "Urban Nest PG",
    locality: "Baner",
    city: "Pune",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80",
    ],
    tier: "PREMIUM",
    rating: 4.9,
    reviewCount: 203,
    startingRent: 11000,
    availableBeds: 1,
    amenities: [
      { type: "wifi", label: "WiFi" },
      { type: "food", label: "Meals" },
      { type: "ac", label: "AC" },
      { type: "gym", label: "Gym" },
      { type: "workspace", label: "Co-work space" },
    ],
    distance: "Near IT Park",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Search,
    title: "Browse verified properties",
    description: "Filter by city, budget, and amenities. Every property is physically verified by our team.",
  },
  {
    step: "02",
    icon: BadgeCheck,
    title: "Book in minutes",
    description: "Upload KYC, select your bed, sign the digital agreement — all in one seamless flow.",
  },
  {
    step: "03",
    icon: BedDouble,
    title: "Move in stress-free",
    description: "Get your move-in confirmation on WhatsApp. Pay rent online every month. Raise complaints instantly.",
  },
];

const TRUST_STATS = [
  { value: "50,000+", label: "Happy tenants", icon: Users },
  { value: "10,000+", label: "Verified properties", icon: BadgeCheck },
  { value: "₹0", label: "Broker fee", icon: IndianRupee },
  { value: "4.8★", label: "Average rating", icon: Star },
];

const OWNER_FEATURES = [
  { icon: TrendingUp, title: "Smart PMS dashboard", description: "Bed map, rent tracker, complaints — all in one place. Save 3+ hours per week." },
  { icon: Users, title: "Tenant management", description: "Add tenants online or manually. Digital agreements, auto-reminders, KYC storage." },
  { icon: Shield, title: "Verified badge", description: "Get your property ROOMLY-verified to appear at the top of search results." },
];

// ─── Components ───────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary pb-24 pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(232,71,28,0.15),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="premium" className="mb-6 inline-flex">
            <BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
            India's most trusted PG platform
          </Badge>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find your perfect PG,{" "}
            <span className="text-accent">verified.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            Browse thousands of verified paying guest accommodations across India's top cities.
            Zero broker fees. Instant booking. Smart rent management.
          </p>

          <div className="mx-auto mt-10 flex w-full max-w-xl flex-col gap-3 rounded-md bg-white/10 p-2 backdrop-blur sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-sm bg-white px-4 py-3">
              <MapPin className="h-5 w-5 shrink-0 text-text-tertiary" />
              <select className="flex-1 bg-transparent text-sm font-medium text-text-primary outline-none">
                <option value="">Select a city</option>
                {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <Link href="/search">
              <Button size="lg" className="w-full sm:w-auto">
                <Search className="h-5 w-5" />
                Search PGs
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/60">
            <span>Popular:</span>
            {["Koramangala", "HSR Layout", "Baner", "Madhapur", "Noida Sector 62"].map((loc) => (
              <Link key={loc} href={`/search?locality=${loc}`} className="hover:text-white">{loc}</Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 divide-x divide-border px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
        {TRUST_STATS.map(({ value, label, icon: Icon }) => (
          <div key={label} className="flex flex-col items-center gap-1 py-5 sm:flex-row sm:gap-3 sm:py-6">
            <Icon className="h-5 w-5 shrink-0 text-accent" />
            <div className="text-center sm:text-left">
              <p className="text-lg font-black text-text-primary">{value}</p>
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CitiesSection() {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Browse by city"
          subtitle="Verified PGs in India's top urban centres"
          action={<Link href="/cities" className="text-sm font-semibold text-accent hover:text-accent-light">View all cities <ArrowRight className="inline h-4 w-4" /></Link>}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/search?city=${city.slug}`}
              className="group relative overflow-hidden rounded-md aspect-[4/3]"
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br", city.color)} />
              <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white">
                <p className="text-lg font-bold">{city.name}</p>
                <p className="text-xs opacity-80">{city.count} PGs</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProperties() {
  return (
    <section className="bg-surface py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Top verified properties"
          subtitle="Handpicked premium PGs — inspected, verified, loved by tenants"
          action={<Link href="/properties" className="text-sm font-semibold text-accent hover:text-accent-light">See all properties <ArrowRight className="inline h-4 w-4" /></Link>}
        />
        <div className="mb-6">
          <FilterChips
            items={["All", "Bengaluru", "Pune", "Hyderabad", "Mumbai", "Delhi"]}
            active="All"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_PROPERTIES.map((property) => (
            <PropertyCard key={property.slug} {...property} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeader
            title="Book a PG in under 10 minutes"
            subtitle="No broker, no hassle, no hidden charges."
          />
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
            <div key={step} className="relative">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                <Icon className="h-7 w-7 text-white" />
              </div>
              <span className="absolute left-10 top-1 text-5xl font-black text-primary/8 select-none">{step}</span>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 leading-relaxed text-text-secondary">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForOwnersSection() {
  return (
    <section className="bg-primary py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="premium" className="mb-5">For property owners</Badge>
            <h2 className="text-3xl font-black leading-tight text-white lg:text-4xl">
              Run your PG business{" "}
              <span className="text-accent">10× smarter</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/70">
              ROOMLY's free property management system helps you track rent, manage tenants, and resolve complaints — all from your phone.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/owners/onboarding">
                <Button size="lg" className="w-full sm:w-auto">List your property — free</Button>
              </Link>
              <Link href="/owners">
                <Button size="lg" variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 sm:w-auto">
                  Learn more <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            {OWNER_FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 rounded-sm bg-white/8 p-5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-accent">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm text-white/60">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewsTeaser() {
  const reviews = [
    { name: "Priya M.", city: "Bengaluru", rating: 5, text: "Found my PG in 20 minutes. The verification badge gave me confidence to book without visiting first.", initials: "PM" },
    { name: "Rohit S.", city: "Pune", rating: 5, text: "No broker fees saved me ₹12,000. The online agreement and rent payment are super smooth.", initials: "RS" },
    { name: "Anjali K.", city: "Hyderabad", rating: 5, text: "Raised a complaint on the app and it was resolved in 2 days. Never had this experience anywhere else.", initials: "AK" },
  ];

  return (
    <section className="bg-surface py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Loved by 50,000+ tenants" subtitle="Real reviews from real residents" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.name} className="rounded-sm border border-border bg-background p-6">
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
              </div>
              <p className="mt-3 leading-relaxed text-text-secondary">&ldquo;{review.text}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-bold text-white">{review.initials}</span>
                <div>
                  <p className="text-sm font-semibold">{review.name}</p>
                  <p className="text-xs text-text-tertiary">{review.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppDownloadTeaser() {
  return (
    <section className="bg-background py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 rounded-md border border-border bg-surface px-8 py-10 text-center shadow-sm">
          <Building2 className="h-10 w-10 text-primary" />
          <h3 className="text-2xl font-black">ROOMLY app — coming soon</h3>
          <p className="max-w-md text-text-secondary">Track your rent, raise complaints, and manage bookings on the go. Available on iOS and Android.</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-sm border border-border bg-slate-50 px-5 py-3 text-sm font-semibold opacity-60">
              <span>App Store</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-slate-50 px-5 py-3 text-sm font-semibold opacity-60">
              <span>Google Play</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="bg-primary py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-white/50">
          Trusted across India
        </p>
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            { end: 10000, suffix: "+", label: "Verified PGs" },
            { end: 50000, suffix: "+", label: "Happy tenants" },
            { end: 8, suffix: "", label: "Cities" },
            { end: 4.8, suffix: "★", label: "Average rating", decimals: 1 },
          ].map(({ end, suffix, label, decimals }) => (
            <div key={label}>
              <p className="text-4xl font-black text-white lg:text-5xl">
                <AnimatedCounter end={end} suffix={suffix} decimals={decimals} duration={2000} />
              </p>
              <p className="mt-1.5 text-sm text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <CitiesSection />
      <FeaturedProperties />
      <HowItWorksSection />
      <ReviewsTeaser />
      <ForOwnersSection />
      <StatsBar />
      <AppDownloadTeaser />
      <NewsletterForm />
    </>
  );
}
