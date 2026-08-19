import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { queryKeys } from "../constants/queryKeys";
import { foodService, type FoodListParams } from "../services/foodService";
import type { Food, PaginatedResponse } from "../types";

export function useFoodsInfinite(params: Omit<FoodListParams, "page"> = {}) {
  return useInfiniteQuery<PaginatedResponse<Food>>({
    queryKey: queryKeys.foods.list(params),
    queryFn: ({ pageParam }) => foodService.list({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}

export function useFood(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.foods.detail(id ?? ""),
    queryFn: () => foodService.detail(id as string),
    enabled: !!id,
  });
}

export function usePopularFoods() {
  return useQuery({ queryKey: queryKeys.foods.popular, queryFn: foodService.popular });
}

export function useRecommendedFoods() {
  return useQuery({ queryKey: queryKeys.foods.recommended, queryFn: foodService.recommended });
}

export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.foods.search(query),
    queryFn: () => foodService.search(query),
    enabled: query.trim().length > 0,
  });
}
