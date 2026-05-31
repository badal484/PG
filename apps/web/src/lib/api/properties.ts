import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiClient } from "./api-client";

export interface PropertyListItem {
  id: string;
  slug: string;
  name: string;
  locality: string;
  city: string;
  photos: string[];
  tier: "PREMIUM" | "STANDARD" | "BUDGET";
  rating?: number;
  reviewCount: number;
  startingRent: number;
  availableBeds: number;
  amenities: Array<{
    type: "gym" | "wifi" | "food" | "ac" | "workspace" | "hotWater" | "parking";
    label: string;
  }>;
  distance?: string;
}

export interface PropertyDetail extends PropertyListItem {
  description: string;
  address: {
    street: string;
    locality: string;
    city: string;
    state: string;
    pinCode: string;
    coordinates?: { lat: number; lng: number };
  };
  rooms: Array<{
    id: string;
    roomNumber: string;
    floor: string;
    hasTour: boolean;
    beds: Array<{
      id: string;
      label: string;
      roomNumber: string;
      floor: string;
      attributes: string[];
      monthlyRent: number;
      depositAmount: number;
      status: "VACANT" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
      availableFrom?: string;
      hasTour: boolean;
    }>;
  }>;
  rules: Array<{ id: string; rule: string }>;
  depositMonths: number;
  totalBeds: number;
  vacantBeds: number;
  ownerId: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PropertySearchParams {
  city?: string;
  locality?: string;
  minRent?: number;
  maxRent?: number;
  tier?: string;
  amenities?: string[];
  availableFrom?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedProperties {
  data: PropertyListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function buildSearchQuery(params: PropertySearchParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, String(item)));
    } else {
      query.set(key, String(value));
    }
  });
  return query.toString() ? `?${query.toString()}` : "";
}

export function useProperties(params: PropertySearchParams = {}) {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: () =>
      apiClient.get<PaginatedProperties>(`/properties${buildSearchQuery(params)}`),
    staleTime: 2 * 60 * 1000,
  });
}

export function useInfiniteProperties(params: Omit<PropertySearchParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: ["properties", "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<PaginatedProperties>(
        `/properties${buildSearchQuery({ ...params, page: pageParam as number, pageSize: 12 })}`,
      ),
    initialPageParam: 1,
    getNextPageParam: (last: PaginatedProperties) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });
}

export function useProperty(slug: string) {
  return useQuery({
    queryKey: ["property", slug],
    queryFn: () => apiClient.get<PropertyDetail>(`/properties/${slug}`),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedProperties() {
  return useQuery({
    queryKey: ["properties", "featured"],
    queryFn: () => apiClient.get<PropertyListItem[]>("/properties/featured"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: () =>
      apiClient.get<
        Array<{
          id: string;
          name: string;
          slug: string;
          state: string;
          photoUrl: string;
          propertyCount: number;
        }>
      >("/cities"),
    staleTime: 30 * 60 * 1000,
  });
}

export function usePropertyReviews(propertyId: string) {
  return useQuery({
    queryKey: ["property", propertyId, "reviews"],
    queryFn: () =>
      apiClient.get<
        Array<{
          id: string;
          tenantName: string;
          tenantAvatar?: string;
          rating: number;
          title?: string;
          body: string;
          createdAt: string;
        }>
      >(`/properties/${propertyId}/reviews`),
    enabled: Boolean(propertyId),
  });
}
