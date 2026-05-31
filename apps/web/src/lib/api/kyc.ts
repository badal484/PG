import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./api-client";

export type KycStatusValue = "PENDING" | "IN_PROGRESS" | "VERIFIED" | "FAILED";

export interface KycStatusResponse {
  status: KycStatusValue;
  requestId: string;
  completedAt?: string;
  failureReason?: string;
}

export function useInitiateKyc() {
  return useMutation({
    mutationFn: (type: "AADHAAR_OTP" | "MANUAL") =>
      apiClient.post<{ requestId: string; redirectUrl?: string }>("/kyc/initiate", { type }),
  });
}

export function useKycStatus(requestId: string, enabled = false) {
  return useQuery({
    queryKey: ["kyc", "status", requestId],
    queryFn: () => apiClient.get<KycStatusResponse>(`/kyc/status/${requestId}`),
    enabled: enabled && Boolean(requestId),
    refetchInterval: (query) =>
      query.state.data?.status === "IN_PROGRESS" ? 3000 : false,
  });
}

export function useManualKyc() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.post<{ requestId: string }>("/kyc/manual", formData as unknown as Record<string, unknown>),
  });
}

export function useCompleteBookingKyc() {
  return useMutation({
    mutationFn: ({ bookingId, requestId }: { bookingId: string; requestId: string }) =>
      apiClient.post<void>(`/bookings/${bookingId}/kyc-complete`, { requestId }),
  });
}
