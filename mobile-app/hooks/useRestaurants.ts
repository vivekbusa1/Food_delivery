import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../constants/queryKeys";
import { restaurantService, type RestaurantListParams } from "../services/restaurantService";
import type { PaginatedResponse, Restaurant } from "../types";

export function useRestaurantsInfinite(params: Omit<RestaurantListParams, "page"> = {}) {
  return useInfiniteQuery<PaginatedResponse<Restaurant>>({
    queryKey: queryKeys.restaurants.list(params),
    queryFn: ({ pageParam }) => restaurantService.list({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.restaurants.detail(id ?? ""),
    queryFn: () => restaurantService.detail(id as string),
    enabled: !!id,
  });
}

export function useFavoriteRestaurants() {
  return useQuery({
    queryKey: queryKeys.restaurants.favorites,
    queryFn: restaurantService.favorites,
  });
}

export function useToggleFavoriteRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      isFavorite ? restaurantService.removeFavorite(id) : restaurantService.addFavorite(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.favorites });
      void queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
    },
  });
}
