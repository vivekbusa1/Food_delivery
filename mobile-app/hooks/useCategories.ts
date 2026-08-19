import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../constants/queryKeys";
import { categoryService, offerService } from "../services/categoryService";

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories.all, queryFn: categoryService.list });
}

export function useOffers() {
  return useQuery({ queryKey: queryKeys.offers.all, queryFn: offerService.list });
}
