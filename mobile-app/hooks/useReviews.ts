import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { queryKeys } from "../constants/queryKeys";
import { reviewService, type CreateReviewPayload } from "../services/reviewService";
import { getErrorMessage } from "../services/api";

export function useRestaurantReviews(restaurantId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.forRestaurant(restaurantId ?? ""),
    queryFn: () => reviewService.forRestaurant(restaurantId as string),
    enabled: !!restaurantId,
  });
}

export function useFoodReviews(foodId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.forFood(foodId ?? ""),
    queryFn: () => reviewService.forFood(foodId as string),
    enabled: !!foodId,
  });
}

export function useOrderReviews(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.forOrder(orderId ?? ""),
    queryFn: () => reviewService.forOrder(orderId as string),
    enabled: !!orderId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewService.create(payload),
    onSuccess: (_review, variables) => {
      if (variables.restaurantId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.forRestaurant(variables.restaurantId) });
      }
      if (variables.foodId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.forFood(variables.foodId) });
      }
      if (variables.orderId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.forOrder(variables.orderId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      }
      Toast.show({ type: "success", text1: "Thanks for your review!" });
    },
    onError: (error) => Toast.show({ type: "error", text1: "Could not submit review", text2: getErrorMessage(error) }),
  });
}
