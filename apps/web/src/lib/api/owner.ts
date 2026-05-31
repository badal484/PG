import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api-client";

export interface OwnerProperty {
  id: string;
  slug: string;
  name: string;
  city: string;
  locality: string;
  totalBeds: number;
  occupiedBeds: number;
  monthlyRevenue: number;
  pendingRent: number;
  openComplaints: number;
  tier: "PREMIUM" | "STANDARD" | "BUDGET";
  isActive: boolean;
  photoUrl?: string;
}

export interface OwnerStats {
  totalProperties: number;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  totalMonthlyRevenue: number;
  pendingRent: number;
  openComplaints: number;
  newBookingsThisMonth: number;
}

export interface AddPropertyPayload {
  name: string;
  description: string;
  address: {
    street: string;
    locality: string;
    city: string;
    state: string;
    pinCode: string;
    coordinates?: { lat: number; lng: number };
  };
  tier: "PREMIUM" | "STANDARD" | "BUDGET";
  amenities: string[];
  depositMonths: number;
  floors: Array<{
    name: string;
    rooms: Array<{
      roomNumber: string;
      beds: Array<{
        label: string;
        monthlyRent: number;
        attributes: string[];
        hasTour?: boolean;
      }>;
    }>;
  }>;
}

export interface AddTenantPayload {
  bedId: string;
  checkIn: string;
  tenantType: "ONLINE" | "WALK_IN";
  tenantId?: string;
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  kycType?: string;
  kycNumber?: string;
}

export function useOwnerProperties() {
  return useQuery({
    queryKey: ["owner", "properties"],
    queryFn: () => apiClient.get<OwnerProperty[]>("/owner/properties"),
  });
}

export function useOwnerStats() {
  return useQuery({
    queryKey: ["owner", "stats"],
    queryFn: () => apiClient.get<OwnerStats>("/owner/stats"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddPropertyPayload) =>
      apiClient.post<OwnerProperty>("/owner/properties", payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["owner", "properties"] });
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AddPropertyPayload>;
    }) => apiClient.patch<OwnerProperty>(`/owner/properties/${id}`, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["owner", "properties"] });
      void queryClient.invalidateQueries({ queryKey: ["property", id] });
    },
  });
}

export function useTogglePropertyActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch<OwnerProperty>(`/owner/properties/${id}/active`, { isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["owner", "properties"] });
    },
  });
}

export function useAddTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddTenantPayload) =>
      apiClient.post<{ bookingId: string }>("/owner/tenants", payload),
    onSuccess: (_, { bedId }) => {
      void queryClient.invalidateQueries({ queryKey: ["pms"] });
      void queryClient.invalidateQueries({ queryKey: ["bed", bedId] });
    },
  });
}

export function useUploadPropertyPhotos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, files }: { propertyId: string; files: File[] }) => {
      const form = new FormData();
      files.forEach((file) => form.append("photos", file));
      return apiClient.post<{ urls: string[] }>(
        `/owner/properties/${propertyId}/photos`,
        form,
      );
    },
    onSuccess: (_, { propertyId }) => {
      void queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
    },
  });
}
