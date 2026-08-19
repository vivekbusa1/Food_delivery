import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../constants/queryKeys";
import { wishlistService } from "../services/wishlistService";

export function useWishlist() {
  return useQuery({ queryKey: queryKeys.wishlist.all, queryFn: wishlistService.list });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ foodId, isWishlisted }: { foodId: string; isWishlisted: boolean }) =>
      isWishlisted ? wishlistService.remove(foodId) : wishlistService.add(foodId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.foods.all });
    },
  });
}
