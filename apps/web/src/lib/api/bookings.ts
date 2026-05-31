import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api-client";

export type BookingStatus = "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  propertySlug: string;
  propertyPhoto?: string;
  bedId: string;
  bedLabel: string;
  roomNumber: string;
  floor: string;
  tenantId: string;
  tenantName: string;
  checkIn: string;
  checkOut?: string;
  status: BookingStatus;
  monthlyRent: number;
  depositAmount: number;
  agreementUrl?: string;
  paymentMethod?: "UPI" | "NEFT" | "CARD" | "CASH" | "AUTO_DEBIT";
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  bedId: string;
  checkIn: string;
  paymentMethod: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  kycType?: string;
  kycNumber?: string;
}

export function useBookings(status?: BookingStatus) {
  const query = status ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["bookings", status],
    queryFn: () => apiClient.get<Booking[]>(`/bookings${query}`),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => apiClient.get<Booking>(`/bookings/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      apiClient.post<Booking>("/bookings", payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch<Booking>(`/bookings/${id}/cancel`, {}),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["booking", id] });
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch<Booking>(`/bookings/${id}/confirm`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useBookingAgreement(bookingId: string) {
  return useQuery({
    queryKey: ["booking", bookingId, "agreement"],
    queryFn: () =>
      apiClient.get<{ url: string; htmlContent: string }>(
        `/bookings/${bookingId}/agreement`,
      ),
    enabled: Boolean(bookingId),
  });
}

export interface RentRecord {
  id: string;
  bookingId: string;
  month: string;
  dueDate: string;
  paidOn?: string;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  receiptUrl?: string;
  paymentId?: string;
}

export interface DepositSettlement {
  id: string;
  bookingId: string;
  depositAmount: number;
  deductions: Array<{ reason: string; amount: number }>;
  refundAmount: number;
  status: "PROPOSED" | "ACCEPTED" | "DISPUTED" | "PROCESSED";
  proposedAt: string;
  inspectionPhotos: string[];
}

export function useRentRecords(bookingId: string) {
  return useQuery({
    queryKey: ["booking", bookingId, "rent"],
    queryFn: () => apiClient.get<RentRecord[]>(`/bookings/${bookingId}/rent-records`),
    enabled: Boolean(bookingId),
  });
}

export function useInitiateBooking() {
  return useMutation({
    mutationFn: (payload: { bedId: string; checkIn: string; stayType: string; duration?: number }) =>
      apiClient.post<{ bookingId: string; lockExpiresAt: string }>("/bookings/initiate", payload),
  });
}

export function useGiveNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, moveOutDate, reason }: { bookingId: string; moveOutDate: string; reason?: string }) =>
      apiClient.post<void>(`/bookings/${bookingId}/give-notice`, { moveOutDate, reason }),
    onSuccess: (_, { bookingId }) => {
      void queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
    },
  });
}

export function useDepositSettlement(bookingId: string) {
  return useQuery({
    queryKey: ["booking", bookingId, "settlement"],
    queryFn: () => apiClient.get<DepositSettlement>(`/bookings/${bookingId}/settlement`),
    enabled: Boolean(bookingId),
  });
}

export function useAcceptSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      apiClient.post<void>(`/bookings/${bookingId}/accept-settlement`, {}),
    onSuccess: (_, bookingId) => {
      void queryClient.invalidateQueries({ queryKey: ["booking", bookingId, "settlement"] });
    },
  });
}

export function useDisputeSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      apiClient.post<void>(`/bookings/${bookingId}/dispute-settlement`, { reason }),
    onSuccess: (_, { bookingId }) => {
      void queryClient.invalidateQueries({ queryKey: ["booking", bookingId, "settlement"] });
    },
  });
}
