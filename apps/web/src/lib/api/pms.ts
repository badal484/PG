import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BedStatus = "vacant" | "occupied" | "reserved" | "maintenance";
export type RentStatus = "Paid" | "Due" | "Overdue";
export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED";

export interface PMSBed {
  id: string;
  label: string;
  status: BedStatus;
  tenant?: string;
}

export interface PMSRoom {
  roomNumber: string;
  beds: PMSBed[];
}

export interface PMSFloor {
  name: string;
  rooms: PMSRoom[];
}

export interface RentRecord {
  id: string;
  tenantName: string;
  tenantPhoto?: string;
  bedNumber: string;
  status: RentStatus;
  amount: number;
  dueDate: string;
  paidDate?: string;
  daysOverdue?: number;
}

export interface Complaint {
  id: string;
  category: string;
  roomNumber: string;
  tenantName: string;
  description: string;
  timeAgo: string;
  status: ComplaintStatus;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description?: string;
  receiptUrl?: string;
  date: string;
  createdAt: string;
}

export interface PMSDashboardStats {
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  reservedBeds: number;
  maintenanceBeds: number;
  occupancyRate: number;
  totalRentDue: number;
  totalRentCollected: number;
  overdueCount: number;
  openComplaints: number;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function usePMSBedMap(propertyId: string) {
  return useQuery({
    queryKey: ["pms", "bedmap", propertyId],
    queryFn: () => apiClient.get<PMSFloor[]>(`/pms/${propertyId}/bed-map`),
    enabled: Boolean(propertyId),
    refetchInterval: 30_000,
  });
}

export function useRentRecords(propertyId: string, status?: RentStatus) {
  const query = status ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["pms", "rent", propertyId, status],
    queryFn: () => apiClient.get<RentRecord[]>(`/pms/${propertyId}/rent${query}`),
    enabled: Boolean(propertyId),
  });
}

export function useMarkRentPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, rentId }: { propertyId: string; rentId: string }) =>
      apiClient.patch<RentRecord>(`/pms/${propertyId}/rent/${rentId}/mark-paid`, {}),
    onSuccess: (_, { propertyId }) => {
      void queryClient.invalidateQueries({ queryKey: ["pms", "rent", propertyId] });
      void queryClient.invalidateQueries({ queryKey: ["pms", "stats", propertyId] });
    },
  });
}

export function useSendRentReminder() {
  return useMutation({
    mutationFn: ({ propertyId, rentId }: { propertyId: string; rentId: string }) =>
      apiClient.post<{ message: string }>(`/pms/${propertyId}/rent/${rentId}/remind`, {}),
  });
}

export function useComplaints(propertyId: string, status?: ComplaintStatus) {
  const query = status ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["pms", "complaints", propertyId, status],
    queryFn: () => apiClient.get<Complaint[]>(`/pms/${propertyId}/complaints${query}`),
    enabled: Boolean(propertyId),
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      complaintId,
      status,
    }: {
      propertyId: string;
      complaintId: string;
      status: ComplaintStatus;
    }) =>
      apiClient.patch<Complaint>(
        `/pms/${propertyId}/complaints/${complaintId}/status`,
        { status },
      ),
    onSuccess: (_, { propertyId }) => {
      void queryClient.invalidateQueries({ queryKey: ["pms", "complaints", propertyId] });
    },
  });
}

export function useExpenses(propertyId: string) {
  return useQuery({
    queryKey: ["pms", "expenses", propertyId],
    queryFn: () => apiClient.get<Expense[]>(`/pms/${propertyId}/expenses`),
    enabled: Boolean(propertyId),
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      data,
    }: {
      propertyId: string;
      data: Omit<Expense, "id" | "createdAt">;
    }) => apiClient.post<Expense>(`/pms/${propertyId}/expenses`, data),
    onSuccess: (_, { propertyId }) => {
      void queryClient.invalidateQueries({ queryKey: ["pms", "expenses", propertyId] });
    },
  });
}

export function usePMSDashboardStats(propertyId: string) {
  return useQuery({
    queryKey: ["pms", "stats", propertyId],
    queryFn: () => apiClient.get<PMSDashboardStats>(`/pms/${propertyId}/stats`),
    enabled: Boolean(propertyId),
    refetchInterval: 60_000,
  });
}
