import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../constants/queryKeys";
import { couponService } from "../services/couponService";

export function useCoupons() {
  return useQuery({ queryKey: queryKeys.coupons.all, queryFn: couponService.list });
}
