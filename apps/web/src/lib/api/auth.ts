import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, clearTokens, setTokens } from "./api-client";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "TENANT" | "OWNER" | "MANAGER" | "ADMIN";
  avatarUrl?: string;
  unreadNotifications: number;
}

interface SendOtpResponse {
  message: string;
  expiresIn: number;
}

interface VerifyOtpResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (phone: string) =>
      apiClient.post<SendOtpResponse>("/auth/send-otp", { phone }),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      apiClient.post<VerifyOtpResponse>("/auth/verify-otp", { phone, otp }),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiClient.get<AuthUser>("/auth/me"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => apiClient.post<void>("/auth/logout", {}),
    onSettled: () => {
      clearTokens();
    },
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: Partial<Pick<AuthUser, "name" | "email">>) =>
      apiClient.patch<AuthUser>("/auth/profile", data),
  });
}
