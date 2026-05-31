import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api-client";

export interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalBeds: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  pendingVerifications: number;
  openComplaints: number;
}

export interface PendingProperty {
  id: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  city: string;
  tier: "PREMIUM" | "STANDARD" | "BUDGET";
  submittedAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "TENANT" | "OWNER" | "MANAGER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiClient.get<AdminStats>("/admin/stats"),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePendingProperties() {
  return useQuery({
    queryKey: ["admin", "properties", "pending"],
    queryFn: () => apiClient.get<PendingProperty[]>("/admin/properties/pending"),
  });
}

export function useApproveProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      tier,
    }: {
      id: string;
      tier: "PREMIUM" | "STANDARD" | "BUDGET";
    }) =>
      apiClient.patch<{ success: boolean }>(`/admin/properties/${id}/approve`, { tier }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useRejectProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.patch<{ success: boolean }>(`/admin/properties/${id}/reject`, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
    },
  });
}

export function useAdminUsers(page = 1, role?: string) {
  const query = `?page=${page}${role ? `&role=${role}` : ""}`;
  return useQuery({
    queryKey: ["admin", "users", page, role],
    queryFn: () =>
      apiClient.get<{
        data: UserSummary[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/admin/users${query}`),
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch<UserSummary>(`/admin/users/${id}/active`, { isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
