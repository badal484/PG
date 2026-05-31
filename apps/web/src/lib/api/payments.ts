import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api-client";

export type PaymentMethod = "UPI" | "NEFT" | "CARD" | "CASH" | "AUTO_DEBIT";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  rentRecordId: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayOrderId?: string;
  upiLink?: string;
  createdAt: string;
}

export interface InitiatePaymentPayload {
  rentRecordId: string;
  amount: number;
  method: PaymentMethod;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string;
  transactionId?: string;
  createdAt: string;
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InitiatePaymentPayload) =>
      apiClient.post<Payment>("/payments/initiate", payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["pms", "rent"] });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      transactionId,
    }: {
      paymentId: string;
      transactionId: string;
    }) =>
      apiClient.post<Payment>(`/payments/${paymentId}/verify`, { transactionId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["pms", "rent"] });
    },
  });
}

export function usePaymentHistory() {
  return useQuery({
    queryKey: ["payments", "history"],
    queryFn: () => apiClient.get<PaymentHistory[]>("/payments/history"),
  });
}

export function usePaymentDetails(paymentId: string) {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => apiClient.get<Payment>(`/payments/${paymentId}`),
    enabled: Boolean(paymentId),
  });
}

export function useSetupAutoPay() {
  return useMutation({
    mutationFn: ({ bookingId, upiId }: { bookingId: string; upiId: string }) =>
      apiClient.post<{ success: boolean; mandateId: string }>(
        `/payments/autopay/setup`,
        { bookingId, upiId },
      ),
  });
}
