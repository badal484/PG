// Central seed data for all marketplace pages.
// Swap individual exports for real API calls as the backend grows.

import type { PropertyCardProps } from "@/components/property/PropertyCard";

// ─── City ─────────────────────────────────────────────────────────────────────

export interface CityData {
  name: string;
  slug: string;
  state: string;
  pgCount: number;
  color: string; // tailwind gradient classes
  tagline: string;
  metaDesc: string;
}

export const CITIES: CityData[] = [
  { name: "Bangalore", slug: "bangalore", state: "Karnataka", pgCount: 3400, color: "from-violet-600 to-indigo-700", tagline: "IT capital · 3,400+ verified PGs", metaDesc: "Find verified PG accommodations in Bangalore near top IT parks, metro stations and colleges." },
  { name: "Hyderabad", slug: "hyderabad", state: "Telangana", pgCount: 1800, color: "from-teal-600 to-emerald-700", tagline: "City of pearls · 1,800+ verified PGs", metaDesc: "Verified PGs in Hyderabad near HITEC City, Gachibowli and Madhapur." },
  { name: "Pune", slug: "pune", state: "Maharashtra", pgCount: 2100, color: "from-blue-600 to-cyan-700", tagline: "Oxford of the East · 2,100+ verified PGs", metaDesc: "Premium PG accommodations in Pune near Hinjewadi, Baner and Kothrud." },
  { name: "Chennai", slug: "chennai", state: "Tamil Nadu", pgCount: 940, color: "from-amber-600 to-orange-700", tagline: "Gateway to the South · 940+ verified PGs", metaDesc: "Trusted PG accommodations in Chennai near OMR, Velachery and Adyar." },
  { name: "Delhi-NCR", slug: "delhi-ncr", state: "Delhi", pgCount: 2300, color: "from-red-600 to-rose-700", tagline: "Capital region · 2,300+ verified PGs", metaDesc: "PG accommodations across Delhi, Noida, Gurugram and Greater Noida." },
  { name: "Mumbai", slug: "mumbai", state: "Maharashtra", pgCount: 1560, color: "from-orange-600 to-yellow-700", tagline: "City of dreams · 1,560+ verified PGs", metaDesc: "Verified PGs in Mumbai near Andheri, BKC, Powai and Malad." },
  { name: "Kolkata", slug: "kolkata", state: "West Bengal", pgCount: 620, color: "from-pink-600 to-fuchsia-700", tagline: "City of joy · 620+ verified PGs", metaDesc: "PG accommodations in Kolkata near Salt Lake, New Town and Park Street." },
  { name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat", pgCount: 490, color: "from-lime-600 to-green-700", tagline: "Business hub · 490+ verified PGs", metaDesc: "PG accommodations in Ahmedabad near SG Highway, Satellite and Prahlad Nagar." },
];

export function getCityBySlug(slug: string): CityData | undefined {
  return CITIES.find((c) => c.slug === slug);
}

// ─── Localities ───────────────────────────────────────────────────────────────

export interface LocalityData {
  name: string;
  slug: string;
  city: string;
  pgCount: number;
  avgRent: number;
  nearbyLandmarks: string[];
  metroStation?: string;
  metroDistance?: string;
  aboutText: string;
}

export const LOCALITIES: Record<string, LocalityData[]> = {
  bangalore: [
    { name: "Koramangala", slug: "koramangala", city: "Bangalore", pgCount: 420, avgRent: 11200, nearbyLandmarks: ["Forum Mall", "Sony World Signal", "Jyoti Niwas College"], metroStation: "Koramangala (upcoming)", metroDistance: "1.5 km", aboutText: "Koramangala is Bangalore's most sought-after neighbourhood — home to hundreds of startups, top restaurants, and vibrant nightlife. PGs here are premium and well-managed." },
    { name: "HSR Layout", slug: "hsr-layout", city: "Bangalore", pgCount: 380, avgRent: 10400, nearbyLandmarks: ["HSR BDA Complex", "Agara Lake", "Decathlon HSR"], metroStation: "Agara Lake (upcoming)", metroDistance: "2 km", aboutText: "HSR Layout offers a balanced lifestyle with tree-lined roads, good connectivity to Electronic City and Koramangala, and a strong PG ecosystem." },
    { name: "Bellandur", slug: "bellandur", city: "Bangalore", pgCount: 290, avgRent: 9200, nearbyLandmarks: ["Ecospace", "RGA Tech Park", "Bellandur Lake"], metroStation: "Bellandur (upcoming)", metroDistance: "1.8 km", aboutText: "Bellandur is the gateway to Outer Ring Road's IT corridor. Budget-friendly PGs with great connectivity to major tech parks." },
    { name: "Whitefield", slug: "whitefield", city: "Bangalore", pgCount: 510, avgRent: 8800, nearbyLandmarks: ["ITPL", "Phoenix Marketcity", "Prestige Tech Park"], metroStation: "Whitefield", metroDistance: "0.5 km", aboutText: "Whitefield hosts dozens of IT parks including ITPL and is connected by the Purple metro line, making it one of Bangalore's fastest-growing PG hubs." },
    { name: "Marathahalli", slug: "marathahalli", city: "Bangalore", pgCount: 360, avgRent: 8400, nearbyLandmarks: ["Kundalahalli Gate", "Embassy Tech Village", "AECS Layout"], metroStation: "Kadugodi (Purple Line)", metroDistance: "3 km", aboutText: "Marathahalli bridges Whitefield and the city centre, making it popular with tech professionals. PGs here offer great value." },
    { name: "Indiranagar", slug: "indiranagar", city: "Bangalore", pgCount: 220, avgRent: 13500, nearbyLandmarks: ["100 Feet Road", "Indiranagar Metro", "CMH Road"], metroStation: "Indiranagar", metroDistance: "0 km", aboutText: "Indiranagar is Bangalore's trendy, upscale locality with metro connectivity. Premium PGs here attract young professionals and expats." },
  ],
  hyderabad: [
    { name: "Madhapur", slug: "madhapur", city: "Hyderabad", pgCount: 340, avgRent: 9800, nearbyLandmarks: ["HITEC City", "DLF Cyber City", "Inorbit Mall"], metroStation: "HITEC City", metroDistance: "1 km", aboutText: "Madhapur is the epicentre of Hyderabad's IT boom. Excellent metro connectivity to rest of the city." },
    { name: "Gachibowli", slug: "gachibowli", city: "Hyderabad", pgCount: 290, avgRent: 9200, nearbyLandmarks: ["Gachibowli Stadium", "Financial District", "ISB Hyderabad"], metroStation: "Raidurgam", metroDistance: "2 km", aboutText: "Gachibowli is home to the Financial District and major MNC campuses. PGs here cater to IT professionals." },
    { name: "Kondapur", slug: "kondapur", city: "Hyderabad", pgCount: 215, avgRent: 8600, nearbyLandmarks: ["Kondapur Metro", "DLF Cyber City", "Botanix Garden"], metroStation: "Kondapur", metroDistance: "0.5 km", aboutText: "Kondapur offers excellent metro connectivity and proximity to HITEC City at slightly lower rents than Madhapur." },
  ],
  pune: [
    { name: "Baner", slug: "baner", city: "Pune", pgCount: 380, avgRent: 11000, nearbyLandmarks: ["Baner-Balewadi Road", "Sus Road", "Aundh"], metroStation: "Baner (upcoming)", metroDistance: "2.5 km", aboutText: "Baner is Pune's premium residential and commercial hub, popular with IT professionals for its lifestyle and connectivity to Hinjewadi." },
    { name: "Viman Nagar", slug: "viman-nagar", city: "Pune", pgCount: 260, avgRent: 9400, nearbyLandmarks: ["Pune Airport", "Phoenix Marketcity", "Aga Khan Palace"], metroStation: "Ramwadi (upcoming)", metroDistance: "1 km", aboutText: "Viman Nagar is strategically located near Pune Airport and offers excellent connectivity to Kharadi and Yerwada." },
    { name: "Kothrud", slug: "kothrud", city: "Pune", pgCount: 310, avgRent: 8600, nearbyLandmarks: ["Paud Road", "Karve Road", "MIT College"], metroStation: "Kothrud (upcoming)", metroDistance: "1.5 km", aboutText: "Kothrud is a popular residential area with a large student population. Budget-friendly PGs with good bus connectivity." },
  ],
};

export function getLocalityBySlug(citySlug: string, localitySlug: string): LocalityData | undefined {
  return LOCALITIES[citySlug]?.find((l) => l.slug === localitySlug);
}

export function getCityLocalities(citySlug: string): LocalityData[] {
  return LOCALITIES[citySlug] ?? [];
}

// ─── Amenities ────────────────────────────────────────────────────────────────

export type AmenityType = "gym" | "wifi" | "food" | "ac" | "workspace" | "hotWater" | "parking" | "laundry" | "cctv" | "security" | "powerBackup" | "rooftop" | "biometric";

export interface AmenityItem {
  type: AmenityType | string;
  label: string;
  available: boolean;
  category: "COMFORT" | "FOOD" | "WORK" | "SAFETY" | "UTILITIES";
}

// ─── Property Detail ──────────────────────────────────────────────────────────

export interface BedDetail {
  id: string;
  label: string;
  attributes: string[];
  monthlyRent: number;
  depositAmount: number;
  status: "VACANT" | "OCCUPIED";
  availableFrom?: string;
}

export interface RoomDetail {
  id: string;
  type: "SINGLE" | "DOUBLE" | "TRIPLE";
  typeLabel: string;
  roomNumber: string;
  floor: string;
  hasTour: boolean;
  beds: BedDetail[];
}

export interface NearbyPlace {
  type: "metro" | "hospital" | "itpark" | "college" | "restaurant" | "bus";
  name: string;
  distance: string;
  walkMinutes?: number;
}

export interface ReviewItem {
  id: string;
  tenantFirstName: string;
  stayDuration: string;
  rating: number;
  text: string;
  date: string;
  ratings: { food?: number; cleanliness?: number; safety?: number; wifi?: number; staff?: number };
}

export interface PropertyDetailData {
  id: string;
  slug: string;
  name: string;
  description: string;
  tier: "PREMIUM" | "STANDARD" | "BUDGET";
  photos: Array<{ url: string; caption?: string }>;
  address: { street: string; locality: string; city: string; state: string; pinCode: string; nearestMetro: string; metroDistance: string; coordinates: { lat: number; lng: number } };
  rating: number;
  reviewCount: number;
  startingRent: number;
  depositMonths: number;
  genderPolicy: "GENTS" | "LADIES" | "UNISEX";
  targetAudience: string[];
  highlights: string[];
  amenities: AmenityItem[];
  rooms: RoomDetail[];
  foodDays: Array<{ day: string; breakfast: string[]; lunch: string[]; dinner: string[] }>;
  rules: string[];
  nearbyPlaces: NearbyPlace[];
  reviews: ReviewItem[];
  stats: { totalBeds: number; occupiedBeds: number; establishedYear: number };
  hasThreeSixtyTour: boolean;
  whatsappNumber?: string;
}

const AMENITIES_SUNRISE: AmenityItem[] = [
  { type: "wifi", label: "High-Speed WiFi (100 Mbps)", available: true, category: "UTILITIES" },
  { type: "food", label: "3 Meals/day (veg + non-veg)", available: true, category: "FOOD" },
  { type: "ac", label: "Air Conditioning", available: true, category: "COMFORT" },
  { type: "gym", label: "Fully-equipped Gym", available: true, category: "COMFORT" },
  { type: "workspace", label: "Dedicated Study Room", available: true, category: "WORK" },
  { type: "hotWater", label: "24hr Hot Water", available: true, category: "UTILITIES" },
  { type: "parking", label: "2-Wheeler Parking", available: true, category: "UTILITIES" },
  { type: "laundry", label: "Laundry Machine", available: true, category: "UTILITIES" },
  { type: "cctv", label: "24hr CCTV", available: true, category: "SAFETY" },
  { type: "security", label: "24hr Security Guard", available: true, category: "SAFETY" },
  { type: "powerBackup", label: "Power Backup (Inverter)", available: true, category: "UTILITIES" },
  { type: "rooftop", label: "Rooftop Terrace", available: true, category: "COMFORT" },
  { type: "biometric", label: "Biometric Entry", available: false, category: "SAFETY" },
];

const REVIEWS_SUNRISE: ReviewItem[] = [
  { id: "r1", tenantFirstName: "Arjun", stayDuration: "8 months", rating: 5, text: "Best PG I've stayed in Bangalore. The food quality is consistently good, the WiFi is fast, and the owner is super responsive. Gym is small but functional.", date: "2024-10-12", ratings: { food: 5, cleanliness: 5, safety: 5, wifi: 5, staff: 5 } },
  { id: "r2", tenantFirstName: "Karthik", stayDuration: "14 months", rating: 5, text: "Stayed for over a year. Rooms are clean, AC works great, and the cook is excellent. The study room saved me during exam season. Highly recommend.", date: "2024-09-03", ratings: { food: 5, cleanliness: 4, safety: 5, wifi: 4, staff: 5 } },
  { id: "r3", tenantFirstName: "Rahul", stayDuration: "6 months", rating: 4, text: "Great location in Koramangala. Food is good (though dinner can be late sometimes). Good WiFi, clean bathrooms. Value for money at this price point.", date: "2024-08-17", ratings: { food: 4, cleanliness: 4, safety: 4, wifi: 4, staff: 4 } },
  { id: "r4", tenantFirstName: "Siddharth", stayDuration: "11 months", rating: 5, text: "The owner actually listens to complaints and fixes things fast. This is rare in Bangalore PGs. ROOMLY verification gave me the confidence to book without visiting.", date: "2024-07-22", ratings: { food: 5, cleanliness: 5, safety: 5, wifi: 5, staff: 5 } },
  { id: "r5", tenantFirstName: "Dev", stayDuration: "4 months", rating: 4, text: "Good PG, decent food. The rooftop is nice in evenings. A bit pricey but you get what you pay for in Koramangala.", date: "2024-06-11", ratings: { food: 4, cleanliness: 4, safety: 5, wifi: 4, staff: 4 } },
];

const FOOD_SUNRISE = [
  { day: "Monday", breakfast: ["Idli Sambar", "Chutney", "Tea/Coffee"], lunch: ["Rice", "Dal Tadka", "Aloo Sabzi", "Roti", "Salad"], dinner: ["Chapati", "Paneer Butter Masala", "Rice", "Dal"] },
  { day: "Tuesday", breakfast: ["Poha", "Boiled Egg / Banana", "Tea/Coffee"], lunch: ["Rice", "Rajma", "Jeera Aloo", "Roti", "Salad"], dinner: ["Chapati", "Egg Curry / Tofu Curry", "Rice", "Dal"] },
  { day: "Wednesday", breakfast: ["Dosa", "Sambar", "Chutney", "Tea/Coffee"], lunch: ["Rice", "Chana Masala", "Bhindi Fry", "Roti", "Curd"], dinner: ["Chapati", "Mix Veg Curry", "Rice", "Raita"] },
  { day: "Thursday", breakfast: ["Upma", "Chutney", "Tea/Coffee"], lunch: ["Rice", "Dal Makhani", "Jeera Aloo", "Roti"], dinner: ["Chapati", "Palak Paneer", "Rice", "Dal"] },
  { day: "Friday", breakfast: ["Puri Bhaji", "Tea/Coffee"], lunch: ["Biryani / Veg Pulao", "Raita", "Salad", "Papad"], dinner: ["Chapati", "Butter Chicken / Mushroom Masala", "Rice", "Dal"] },
  { day: "Saturday", breakfast: ["Idli Sambar", "Chutney", "Tea/Coffee"], lunch: ["Rice", "Sambar", "Rasam", "Avial", "Papad"], dinner: ["Chapati", "Paneer Tikka Masala", "Rice", "Dal", "Ice Cream"] },
  { day: "Sunday", breakfast: ["Chole Bhature", "Tea/Coffee"], lunch: ["Special Thali — Biryani + Chicken Curry/Paneer + Salad + Papad + Dessert"], dinner: ["Chapati", "Dal Fry", "Aloo Gobhi", "Rice"] },
];

export const PROPERTIES: PropertyDetailData[] = [
  {
    id: "prop-1",
    slug: "sunrise-boys-pg-koramangala",
    name: "Sunrise Boys PG",
    description: "Sunrise Boys PG is one of Koramangala's most loved PGs — offering a clean, safe, and friendly environment for working professionals and students. With a fully-equipped gym, dedicated study room, and a cook who's been with us for 7 years, we take pride in making tenants feel at home.",
    tier: "PREMIUM",
    genderPolicy: "GENTS",
    targetAudience: ["Working professionals", "Postgraduate students", "Startup employees"],
    highlights: ["7-year tenured cook with consistent 4.8★ food rating", "Zero noise policy after 11 PM — ideal for early risers", "Owner lives in the building — fastest maintenance response in Koramangala"],
    photos: [
      { url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=85", caption: "Spacious double-sharing room" },
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85", caption: "Common living area" },
      { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=85", caption: "Single room with attached bath" },
      { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=85", caption: "Modern kitchen" },
      { url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=85", caption: "Study / work room" },
      { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=85", caption: "Rooftop terrace" },
    ],
    address: { street: "No. 45, 5th Block", locality: "Koramangala", city: "Bangalore", state: "Karnataka", pinCode: "560095", nearestMetro: "Koramangala (upcoming)", metroDistance: "1.5 km", coordinates: { lat: 12.9352, lng: 77.6245 } },
    rating: 4.8,
    reviewCount: 124,
    startingRent: 9800,
    depositMonths: 2,
    stats: { totalBeds: 24, occupiedBeds: 20, establishedYear: 2016 },
    hasThreeSixtyTour: true,
    whatsappNumber: "9876543210",
    amenities: AMENITIES_SUNRISE,
    rooms: [
      { id: "room-101", type: "DOUBLE", typeLabel: "Double Sharing", roomNumber: "101", floor: "1st Floor", hasTour: true, beds: [
        { id: "bed-101a", label: "Bed A", attributes: ["AC", "Open balcony", "Attached bath"], monthlyRent: 9800, depositAmount: 19600, status: "VACANT" },
        { id: "bed-101b", label: "Bed B", attributes: ["AC", "Open balcony", "Attached bath"], monthlyRent: 9800, depositAmount: 19600, status: "OCCUPIED" },
      ]},
      { id: "room-201", type: "DOUBLE", typeLabel: "Double Sharing", roomNumber: "201", floor: "2nd Floor", hasTour: false, beds: [
        { id: "bed-201a", label: "Bed A", attributes: ["AC", "Attached bath", "Window view"], monthlyRent: 10200, depositAmount: 20400, status: "VACANT" },
        { id: "bed-201b", label: "Bed B", attributes: ["AC", "Attached bath"], monthlyRent: 10200, depositAmount: 20400, status: "VACANT" },
      ]},
      { id: "room-301", type: "SINGLE", typeLabel: "Single Occupancy", roomNumber: "301", floor: "3rd Floor", hasTour: true, beds: [
        { id: "bed-301", label: "Single Room", attributes: ["AC", "Attached bath", "Balcony", "City view"], monthlyRent: 15500, depositAmount: 31000, status: "VACANT" },
      ]},
      { id: "room-102", type: "TRIPLE", typeLabel: "Triple Sharing", roomNumber: "102", floor: "1st Floor", hasTour: false, beds: [
        { id: "bed-102a", label: "Bed A", attributes: ["AC", "Common bath"], monthlyRent: 7200, depositAmount: 14400, status: "OCCUPIED" },
        { id: "bed-102b", label: "Bed B", attributes: ["AC", "Common bath"], monthlyRent: 7200, depositAmount: 14400, status: "VACANT", availableFrom: "Jan 15, 2025" },
        { id: "bed-102c", label: "Bed C", attributes: ["AC", "Common bath"], monthlyRent: 7200, depositAmount: 14400, status: "OCCUPIED" },
      ]},
    ],
    foodDays: FOOD_SUNRISE,
    rules: [
      "Visitors allowed until 9 PM only — in common areas",
      "No cooking in rooms",
      "Quiet hours: 11 PM – 7 AM",
      "No alcohol or smoking on premises",
      "Rent due by 5th of every month",
      "30-day notice required before vacating",
      "No pets",
      "Keep common areas clean — ₹200 fine per violation",
    ],
    nearbyPlaces: [
      { type: "itpark", name: "Salarpuria Softzone (Koramangala)", distance: "0.9 km", walkMinutes: 12 },
      { type: "restaurant", name: "Ibaco, Koramangala 5th Block", distance: "0.4 km", walkMinutes: 5 },
      { type: "metro", name: "Koramangala Metro (upcoming 2025)", distance: "1.5 km", walkMinutes: 19 },
      { type: "bus", name: "Bus Stop — 8th Block Junction", distance: "0.3 km", walkMinutes: 4 },
      { type: "hospital", name: "Manipal Hospital, HAL", distance: "3.5 km", walkMinutes: 45 },
      { type: "college", name: "Christ University", distance: "4.2 km", walkMinutes: 52 },
    ],
    reviews: REVIEWS_SUNRISE,
  },
  {
    id: "prop-2",
    slug: "green-valley-pg-hsr-layout",
    name: "Green Valley PG",
    description: "Green Valley PG offers premium single and double rooms in a quiet corner of HSR Layout, minutes from the AECS Layout bus terminus. Ideal for tech professionals seeking peace after a long day.",
    tier: "STANDARD",
    genderPolicy: "UNISEX",
    targetAudience: ["Working professionals", "Freelancers"],
    highlights: ["Quiet, tree-lined campus with no street noise", "CCTV on every floor with biometric entry", "Dedicated parking for 2-wheelers and bicycles"],
    photos: [
      { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=85", caption: "Comfortable single room" },
      { url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=85", caption: "Double sharing room" },
      { url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=85", caption: "Common lounge" },
      { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=85", caption: "Rooftop garden" },
    ],
    address: { street: "27/A, Sector 2", locality: "HSR Layout", city: "Bangalore", state: "Karnataka", pinCode: "560102", nearestMetro: "Agara (upcoming)", metroDistance: "1.9 km", coordinates: { lat: 12.9116, lng: 77.6389 } },
    rating: 4.5,
    reviewCount: 89,
    startingRent: 7500,
    depositMonths: 2,
    stats: { totalBeds: 18, occupiedBeds: 14, establishedYear: 2018 },
    hasThreeSixtyTour: false,
    whatsappNumber: "9876543211",
    amenities: [
      { type: "wifi", label: "High-Speed WiFi (50 Mbps)", available: true, category: "UTILITIES" },
      { type: "ac", label: "Air Conditioning", available: true, category: "COMFORT" },
      { type: "hotWater", label: "24hr Hot Water", available: true, category: "UTILITIES" },
      { type: "parking", label: "2-Wheeler Parking", available: true, category: "UTILITIES" },
      { type: "cctv", label: "24hr CCTV", available: true, category: "SAFETY" },
      { type: "security", label: "Security Guard (day)", available: true, category: "SAFETY" },
      { type: "powerBackup", label: "Power Backup", available: true, category: "UTILITIES" },
      { type: "biometric", label: "Biometric Entry", available: true, category: "SAFETY" },
      { type: "laundry", label: "Laundry Machine", available: false, category: "UTILITIES" },
      { type: "gym", label: "Gym", available: false, category: "COMFORT" },
      { type: "food", label: "Meals", available: false, category: "FOOD" },
      { type: "workspace", label: "Study Room", available: false, category: "WORK" },
    ],
    rooms: [
      { id: "room-g101", type: "SINGLE", typeLabel: "Single Occupancy", roomNumber: "G101", floor: "Ground Floor", hasTour: false, beds: [
        { id: "bed-g101", label: "Single Room", attributes: ["AC", "Attached bath", "Ground floor"], monthlyRent: 10500, depositAmount: 21000, status: "VACANT" },
      ]},
      { id: "room-g102", type: "DOUBLE", typeLabel: "Double Sharing", roomNumber: "G102", floor: "Ground Floor", hasTour: false, beds: [
        { id: "bed-g102a", label: "Bed A", attributes: ["AC", "Common bath"], monthlyRent: 7500, depositAmount: 15000, status: "VACANT" },
        { id: "bed-g102b", label: "Bed B", attributes: ["AC", "Common bath"], monthlyRent: 7500, depositAmount: 15000, status: "OCCUPIED" },
      ]},
    ],
    foodDays: [],
    rules: ["No visitors after 8 PM", "Maintain cleanliness", "30-day notice period", "No smoking or alcohol"],
    nearbyPlaces: [
      { type: "bus", name: "AECS Layout Bus Terminus", distance: "0.5 km", walkMinutes: 7 },
      { type: "itpark", name: "Aon Hewitt Building, HSR", distance: "1.2 km", walkMinutes: 15 },
      { type: "metro", name: "Agara Metro (upcoming)", distance: "1.9 km" },
    ],
    reviews: [
      { id: "rv1", tenantFirstName: "Priya", stayDuration: "9 months", rating: 5, text: "Super clean PG, great biometric security. WiFi is fast. No food but the owner helped me find a nearby tiffin service.", date: "2024-11-01", ratings: { cleanliness: 5, safety: 5, wifi: 5, staff: 4 } },
      { id: "rv2", tenantFirstName: "Nidhi", stayDuration: "6 months", rating: 4, text: "Quiet and safe. Best for people who cook or order food. AC works perfectly.", date: "2024-09-14", ratings: { cleanliness: 4, safety: 5, wifi: 4, staff: 4 } },
    ],
  },
  {
    id: "prop-3",
    slug: "urban-nest-pg-baner",
    name: "Urban Nest Co-living",
    description: "Urban Nest is Pune's highest-rated co-living space — thoughtfully designed for young professionals who value community, speed of WiFi, and quality of sleep equally. Our chef creates fresh meals daily with zero compromise on quality.",
    tier: "PREMIUM",
    genderPolicy: "UNISEX",
    targetAudience: ["Working professionals", "Entrepreneurs", "Remote workers"],
    highlights: ["250 Mbps dedicated fibre — tested and verified", "Community events every month — movie nights, treks, board games", "15-minute drive to Hinjewadi IT Park"],
    photos: [
      { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=85", caption: "Premium single room" },
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85", caption: "Co-working lounge" },
      { url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=85", caption: "Community dining area" },
      { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=85", caption: "Modern bathroom" },
      { url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=85", caption: "Terrace with city view" },
    ],
    address: { street: "Plot 12, Baner-Sus Road", locality: "Baner", city: "Pune", state: "Maharashtra", pinCode: "411045", nearestMetro: "Baner (upcoming)", metroDistance: "2 km", coordinates: { lat: 18.5590, lng: 73.7868 } },
    rating: 4.9,
    reviewCount: 203,
    startingRent: 11000,
    depositMonths: 2,
    stats: { totalBeds: 30, occupiedBeds: 27, establishedYear: 2019 },
    hasThreeSixtyTour: true,
    whatsappNumber: "9876543212",
    amenities: [
      { type: "wifi", label: "Dedicated 250 Mbps Fibre", available: true, category: "UTILITIES" },
      { type: "food", label: "3 Meals/day", available: true, category: "FOOD" },
      { type: "ac", label: "Air Conditioning", available: true, category: "COMFORT" },
      { type: "gym", label: "Gym", available: true, category: "COMFORT" },
      { type: "workspace", label: "Co-working Space", available: true, category: "WORK" },
      { type: "hotWater", label: "Solar Hot Water", available: true, category: "UTILITIES" },
      { type: "parking", label: "4-Wheeler + 2-Wheeler", available: true, category: "UTILITIES" },
      { type: "laundry", label: "Washing Machine (x2)", available: true, category: "UTILITIES" },
      { type: "cctv", label: "CCTV", available: true, category: "SAFETY" },
      { type: "security", label: "24hr Security", available: true, category: "SAFETY" },
      { type: "powerBackup", label: "Diesel Generator", available: true, category: "UTILITIES" },
      { type: "rooftop", label: "Terrace", available: true, category: "COMFORT" },
      { type: "biometric", label: "Biometric Entry", available: true, category: "SAFETY" },
    ],
    rooms: [
      { id: "room-un101", type: "SINGLE", typeLabel: "Private Room", roomNumber: "101", floor: "1st Floor", hasTour: true, beds: [
        { id: "bed-un101", label: "Private Room", attributes: ["AC", "Attached bath", "Work desk", "City view"], monthlyRent: 14500, depositAmount: 29000, status: "OCCUPIED" },
      ]},
      { id: "room-un201", type: "SINGLE", typeLabel: "Private Room", roomNumber: "201", floor: "2nd Floor", hasTour: true, beds: [
        { id: "bed-un201", label: "Private Room", attributes: ["AC", "Attached bath", "Work desk", "Balcony"], monthlyRent: 14500, depositAmount: 29000, status: "VACANT" },
      ]},
      { id: "room-un102", type: "DOUBLE", typeLabel: "Shared Room", roomNumber: "102", floor: "1st Floor", hasTour: false, beds: [
        { id: "bed-un102a", label: "Bed A", attributes: ["AC", "Attached bath", "Work desk"], monthlyRent: 11000, depositAmount: 22000, status: "VACANT" },
        { id: "bed-un102b", label: "Bed B", attributes: ["AC", "Attached bath", "Work desk"], monthlyRent: 11000, depositAmount: 22000, status: "OCCUPIED" },
      ]},
    ],
    foodDays: FOOD_SUNRISE,
    rules: ["Visitors allowed in common areas until 10 PM", "Quiet hours: 11 PM – 7 AM", "No cooking in rooms", "No smoking on premises"],
    nearbyPlaces: [
      { type: "itpark", name: "Hinjewadi IT Park Phase 1", distance: "4.5 km", walkMinutes: 60 },
      { type: "bus", name: "Baner Road Bus Stop", distance: "0.3 km", walkMinutes: 4 },
      { type: "restaurant", name: "Vaishali Restaurant", distance: "1.1 km", walkMinutes: 14 },
      { type: "hospital", name: "Ruby Hall Clinic (Baner)", distance: "2.3 km" },
    ],
    reviews: [
      { id: "rvun1", tenantFirstName: "Aditi", stayDuration: "1 year", rating: 5, text: "Honestly, Urban Nest changed my experience of living in Pune. The WiFi is insane — 250 Mbps actually delivered. Community is great, made 3 close friends here.", date: "2024-10-28", ratings: { food: 5, cleanliness: 5, safety: 5, wifi: 5, staff: 5 } },
      { id: "rvun2", tenantFirstName: "Vikas", stayDuration: "7 months", rating: 5, text: "Perfectly managed. Meals are fresh, rooms are always clean, AC is serviced quarterly. Worth every rupee.", date: "2024-09-19", ratings: { food: 5, cleanliness: 5, safety: 4, wifi: 5, staff: 5 } },
    ],
  },
  {
    id: "prop-4",
    slug: "elite-ladies-pg-karol-bagh",
    name: "Elite Ladies PG",
    description: "Elite Ladies PG is the most trusted women's PG in Karol Bagh, Delhi — offering a secure, comfortable, and empowering environment for working women and students.",
    tier: "PREMIUM",
    genderPolicy: "LADIES",
    targetAudience: ["Working women", "Female students", "Government employees"],
    highlights: ["Lady warden on premises 24/7", "All-women security staff on night shift", "Close to Karol Bagh Metro — 8 minutes walk"],
    photos: [
      { url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=85", caption: "Comfortable room" },
      { url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=85", caption: "Clean bathroom" },
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85", caption: "Common hall" },
    ],
    address: { street: "15, Pusa Road", locality: "Karol Bagh", city: "Delhi", state: "Delhi", pinCode: "110005", nearestMetro: "Karol Bagh", metroDistance: "0.6 km", coordinates: { lat: 28.6520, lng: 77.1902 } },
    rating: 4.7,
    reviewCount: 78,
    startingRent: 8500,
    depositMonths: 2,
    stats: { totalBeds: 20, occupiedBeds: 18, establishedYear: 2014 },
    hasThreeSixtyTour: false,
    amenities: [
      { type: "wifi", label: "WiFi", available: true, category: "UTILITIES" },
      { type: "food", label: "3 Meals/day", available: true, category: "FOOD" },
      { type: "ac", label: "AC", available: true, category: "COMFORT" },
      { type: "security", label: "24hr Security (all-women)", available: true, category: "SAFETY" },
      { type: "cctv", label: "CCTV", available: true, category: "SAFETY" },
      { type: "hotWater", label: "Hot Water", available: true, category: "UTILITIES" },
      { type: "laundry", label: "Laundry", available: true, category: "UTILITIES" },
      { type: "powerBackup", label: "Power Backup", available: true, category: "UTILITIES" },
      { type: "gym", label: "Gym", available: false, category: "COMFORT" },
      { type: "parking", label: "Parking", available: false, category: "UTILITIES" },
    ],
    rooms: [
      { id: "room-e101", type: "DOUBLE", typeLabel: "Double Sharing", roomNumber: "101", floor: "1st Floor", hasTour: false, beds: [
        { id: "bed-e101a", label: "Bed A", attributes: ["AC", "Common bath", "Wardrobe"], monthlyRent: 8500, depositAmount: 17000, status: "VACANT" },
        { id: "bed-e101b", label: "Bed B", attributes: ["AC", "Common bath", "Wardrobe"], monthlyRent: 8500, depositAmount: 17000, status: "OCCUPIED" },
      ]},
      { id: "room-e201", type: "SINGLE", typeLabel: "Single Room", roomNumber: "201", floor: "2nd Floor", hasTour: false, beds: [
        { id: "bed-e201", label: "Single Room", attributes: ["AC", "Attached bath", "Wardrobe", "Window view"], monthlyRent: 12000, depositAmount: 24000, status: "VACANT" },
      ]},
    ],
    foodDays: FOOD_SUNRISE.slice(0, 3),
    rules: ["Male visitors not allowed beyond reception", "Gate closes at 10:30 PM", "30-day notice required", "No cooking in rooms"],
    nearbyPlaces: [
      { type: "metro", name: "Karol Bagh Metro (Blue Line)", distance: "0.6 km", walkMinutes: 8 },
      { type: "hospital", name: "Batra Hospital", distance: "2.4 km" },
      { type: "restaurant", name: "Bengali Sweet House", distance: "0.3 km", walkMinutes: 4 },
    ],
    reviews: [
      { id: "rve1", tenantFirstName: "Simran", stayDuration: "11 months", rating: 5, text: "As a woman working late shifts, safety was paramount. Elite Ladies PG gave me that peace of mind. Metro is just 8 minutes walk.", date: "2024-11-10", ratings: { food: 4, cleanliness: 5, safety: 5, wifi: 4, staff: 5 } },
    ],
  },
  {
    id: "prop-5",
    slug: "budget-nest-viman-nagar",
    name: "Budget Nest PG",
    description: "Budget Nest offers clean, no-frills accommodation in Viman Nagar at Pune's most affordable rates. Perfect for freshers and those new to Pune.",
    tier: "BUDGET",
    genderPolicy: "UNISEX",
    targetAudience: ["Freshers", "Students", "Contract workers"],
    highlights: ["Lowest rents in Viman Nagar", "10 minutes from Pune Airport", "Tiffin service available at extra cost"],
    photos: [
      { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=85", caption: "Triple sharing room" },
      { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=85", caption: "Common area" },
    ],
    address: { street: "Plot 8, North Avenue", locality: "Viman Nagar", city: "Pune", state: "Maharashtra", pinCode: "411014", nearestMetro: "Ramwadi (upcoming)", metroDistance: "1.5 km", coordinates: { lat: 18.5679, lng: 73.9143 } },
    rating: 4.1,
    reviewCount: 44,
    startingRent: 5500,
    depositMonths: 1,
    stats: { totalBeds: 15, occupiedBeds: 9, establishedYear: 2020 },
    hasThreeSixtyTour: false,
    amenities: [
      { type: "wifi", label: "WiFi (30 Mbps)", available: true, category: "UTILITIES" },
      { type: "hotWater", label: "Hot Water (morning)", available: true, category: "UTILITIES" },
      { type: "cctv", label: "CCTV", available: true, category: "SAFETY" },
      { type: "ac", label: "AC", available: false, category: "COMFORT" },
      { type: "food", label: "Meals", available: false, category: "FOOD" },
      { type: "gym", label: "Gym", available: false, category: "COMFORT" },
    ],
    rooms: [
      { id: "room-b101", type: "TRIPLE", typeLabel: "Triple Sharing", roomNumber: "101", floor: "1st Floor", hasTour: false, beds: [
        { id: "bed-b101a", label: "Bed A", attributes: ["Fan", "Common bath"], monthlyRent: 5500, depositAmount: 5500, status: "VACANT" },
        { id: "bed-b101b", label: "Bed B", attributes: ["Fan", "Common bath"], monthlyRent: 5500, depositAmount: 5500, status: "OCCUPIED" },
        { id: "bed-b101c", label: "Bed C", attributes: ["Fan", "Common bath"], monthlyRent: 5500, depositAmount: 5500, status: "VACANT" },
      ]},
    ],
    foodDays: [],
    rules: ["Gate closes at 11 PM", "No smoking inside", "1-month deposit refundable on exit"],
    nearbyPlaces: [
      { type: "restaurant", name: "Viman Nagar Mess", distance: "0.2 km", walkMinutes: 3 },
      { type: "bus", name: "Viman Nagar Bus Stop", distance: "0.4 km", walkMinutes: 5 },
    ],
    reviews: [
      { id: "rvb1", tenantFirstName: "Rahul", stayDuration: "3 months", rating: 4, text: "Great for the price. Clean, WiFi works, owner is friendly. No AC but Pune weather is mostly OK.", date: "2024-08-03", ratings: { cleanliness: 4, safety: 4, wifi: 3, staff: 4 } },
    ],
  },
  {
    id: "prop-6",
    slug: "the-hive-coliving-hsr",
    name: "The Hive Co-living",
    description: "The Hive is HSR Layout's most Instagrammable co-living space — designed by an interior designer, curated community events, and a chef who actually cooks restaurant-quality food.",
    tier: "PREMIUM",
    genderPolicy: "UNISEX",
    targetAudience: ["Startup founders", "Digital nomads", "Product managers"],
    highlights: ["Interior designed by Studio Octane (Bangalore)", "Monthly community events and startup meetups", "Dedicated photography studio for content creators"],
    photos: [
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85", caption: "Designer living room" },
      { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=85", caption: "Premium single room" },
      { url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=85", caption: "Co-working area" },
      { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=85", caption: "Rooftop cafe" },
    ],
    address: { street: "12th Cross, Sector 6", locality: "HSR Layout", city: "Bangalore", state: "Karnataka", pinCode: "560102", nearestMetro: "Agara (upcoming)", metroDistance: "2.1 km", coordinates: { lat: 12.9184, lng: 77.6408 } },
    rating: 4.6,
    reviewCount: 156,
    startingRent: 13000,
    depositMonths: 2,
    stats: { totalBeds: 22, occupiedBeds: 20, establishedYear: 2021 },
    hasThreeSixtyTour: true,
    amenities: AMENITIES_SUNRISE,
    rooms: [
      { id: "room-h101", type: "SINGLE", typeLabel: "Private Studio", roomNumber: "101", floor: "1st Floor", hasTour: true, beds: [
        { id: "bed-h101", label: "Private Studio", attributes: ["AC", "Attached bath", "Work desk", "Smart TV", "Balcony"], monthlyRent: 18000, depositAmount: 36000, status: "VACANT" },
      ]},
      { id: "room-h201", type: "DOUBLE", typeLabel: "Shared Premium", roomNumber: "201", floor: "2nd Floor", hasTour: false, beds: [
        { id: "bed-h201a", label: "Bed A", attributes: ["AC", "Attached bath", "Work desk"], monthlyRent: 13000, depositAmount: 26000, status: "OCCUPIED" },
        { id: "bed-h201b", label: "Bed B", attributes: ["AC", "Attached bath", "Work desk"], monthlyRent: 13000, depositAmount: 26000, status: "VACANT" },
      ]},
    ],
    foodDays: FOOD_SUNRISE,
    rules: ["Guests welcome until 10 PM", "Community lounge open 24/7", "No external food delivery allowed in rooms (use common dining)"],
    nearbyPlaces: [
      { type: "bus", name: "HSR BDA Complex", distance: "0.6 km", walkMinutes: 8 },
      { type: "restaurant", name: "Truffles HSR", distance: "0.9 km", walkMinutes: 12 },
      { type: "itpark", name: "BHIVE Workspace", distance: "1.4 km" },
    ],
    reviews: [
      { id: "rvh1", tenantFirstName: "Neha", stayDuration: "10 months", rating: 5, text: "The Hive is not a PG — it's a community. Met my co-founder here. The events are genuinely fun. Instagram-worthy is right.", date: "2024-10-05", ratings: { food: 5, cleanliness: 5, safety: 4, wifi: 5, staff: 5 } },
    ],
  },
];

export function getPropertyBySlug(slug: string): PropertyDetailData | undefined {
  return PROPERTIES.find((p) => p.slug === slug);
}

export function getPropertiesByCity(city: string): PropertyDetailData[] {
  return PROPERTIES.filter((p) => p.address.city.toLowerCase() === city.toLowerCase() || p.address.locality.toLowerCase().replace(/\s+/g, "-") === city);
}

export function getPropertiesByLocality(city: string, locality: string): PropertyDetailData[] {
  return PROPERTIES.filter(
    (p) =>
      p.address.city.toLowerCase() === city.toLowerCase() &&
      p.address.locality.toLowerCase().replace(/\s+/g, "-") === locality,
  );
}

// ─── PropertyCard shape (for grids) ──────────────────────────────────────────

export function toPropertyCard(p: PropertyDetailData): PropertyCardProps {
  return {
    slug: p.slug,
    name: p.name,
    locality: p.address.locality,
    city: p.address.city,
    photos: p.photos.map((ph) => ph.url),
    tier: p.tier,
    rating: p.rating,
    reviewCount: p.reviewCount,
    startingRent: p.startingRent,
    availableBeds: p.rooms.reduce((acc, r) => acc + r.beds.filter((b) => b.status === "VACANT").length, 0),
    amenities: p.amenities
      .filter((a) => a.available)
      .slice(0, 5)
      .map((a) => ({ type: a.type as PropertyCardProps["amenities"][number]["type"], label: a.label })),
    distance: p.nearbyPlaces.find((n) => n.type === "metro")?.distance
      ? `${p.nearbyPlaces.find((n) => n.type === "metro")!.distance} from metro`
      : undefined,
  };
}

export const ALL_PROPERTY_CARDS: PropertyCardProps[] = PROPERTIES.map(toPropertyCard);

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const TESTIMONIALS = [
  { name: "Arjun Mehta", city: "Bangalore", pg: "Sunrise Boys PG, Koramangala", rating: 5, text: "Found my PG in 20 minutes — no broker, no hassle. The ROOMLY verification meant I could trust the listing before visiting. Deposit was protected end-to-end.", initials: "AM", stayDuration: "11 months" },
  { name: "Priya Sharma", city: "Pune", pg: "Urban Nest, Baner", rating: 5, text: "The comparison feature helped me decide between 3 PGs. I could see food menus, WiFi speeds, and room photos all in one place. Booked in 10 minutes.", initials: "PS", stayDuration: "8 months" },
  { name: "Rohit Kumar", city: "Hyderabad", pg: "Comfort Stay, Madhapur", rating: 5, text: "Rent payment on the app is seamless. Raise a complaint → resolved in 2 days. My PG owner uses ROOMLY PMS — makes everything transparent.", initials: "RK", stayDuration: "14 months" },
];
