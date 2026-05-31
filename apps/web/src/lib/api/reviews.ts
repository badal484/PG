import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api-client";

export interface ReviewPayload {
  bookingId: string;
  overallRating: number;
  foodRating?: number;
  cleanlinessRating?: number;
  safetyRating?: number;
  wifiRating?: number;
  staffRating?: number;
  text?: string;
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewPayload) =>
      apiClient.post<{ id: string }>("/reviews", payload),
    onSuccess: (_, { bookingId }) => {
      void queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
    },
  });
}
