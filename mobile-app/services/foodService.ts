import { api } from "./api";
import { DEFAULT_PAGE_SIZE } from "../constants/config";
import type { Food, PaginatedResponse } from "../types";

export interface FoodListParams {
  page?: number;
  pageSize?: number;
  restaurantId?: string;
  categoryId?: string;
  search?: string;
  isVeg?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: "price_asc" | "price_desc" | "rating";
}

type BackendMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
};

type BackendListEnvelope = {
  success?: boolean;
  message?: string;
  data: unknown[];
  meta: BackendMeta;
};

type RawFood = Record<string, unknown> & {
  _id?: string;
  id?: string;
  restaurant?: string | { _id?: string; id?: string; name?: string };
  name?: string;
  description?: string;
  images?: Array<{ url?: string } | string>;
  imageUrl?: string;
  price?: number;
  discountPrice?: number | null;
  discountedPrice?: number | null;
  ratingsAverage?: number;
  ratingsCount?: number;
  rating?: number;
  ratingCount?: number;
  isVeg?: boolean;
  isFeatured?: boolean;
  isWishlisted?: boolean;
  category?: string | { _id?: string; id?: string };
};

function firstImageUrl(raw: RawFood): string {
  if (typeof raw.imageUrl === "string" && raw.imageUrl) return raw.imageUrl;
  const images = raw.images;
  if (!Array.isArray(images) || images.length === 0) return "";
  const first = images[0];
  if (typeof first === "string") return first;
  return first?.url ?? "";
}

export function mapFood(raw: unknown): Food {
  const food = (raw ?? {}) as RawFood;
  const restaurant = food.restaurant;
  const restaurantId =
    typeof restaurant === "string"
      ? restaurant
      : String(restaurant?._id ?? restaurant?.id ?? food.restaurantId ?? "");
  const restaurantName =
    typeof restaurant === "object" && restaurant ? String(restaurant.name ?? "") : food.restaurantName;

  return {
    id: String(food.id ?? food._id ?? ""),
    restaurantId,
    restaurantName: restaurantName ? String(restaurantName) : undefined,
    name: String(food.name ?? ""),
    description: food.description ? String(food.description) : undefined,
    imageUrl: firstImageUrl(food),
    price: Number(food.price ?? 0),
    discountedPrice:
      food.discountedPrice != null
        ? Number(food.discountedPrice)
        : food.discountPrice != null
          ? Number(food.discountPrice)
          : null,
    rating: Number(food.rating ?? food.ratingsAverage ?? 0),
    ratingCount: Number(food.ratingCount ?? food.ratingsCount ?? 0),
    isVeg: Boolean(food.isVeg),
    isPopular: Boolean(food.isFeatured ?? food.isPopular),
    isRecommended: Boolean(food.isRecommended),
    categoryId:
      typeof food.category === "string"
        ? food.category
        : food.category
          ? String(food.category._id ?? food.category.id ?? "")
          : food.categoryId
            ? String(food.categoryId)
            : undefined,
    isWishlisted: Boolean(food.isWishlisted),
  };
}

/** Backend responds with `{ data: Food[], meta }`; map that into the app's `PaginatedResponse` shape. */
function toPaginatedResponse(body: BackendListEnvelope): PaginatedResponse<Food> {
  const items = (body.data ?? []).map(mapFood);
  const meta = body.meta ?? {
    total: items.length,
    page: 1,
    limit: items.length || 1,
    totalPages: 1,
    hasNextPage: false,
  };
  return {
    items,
    page: meta.page,
    pageSize: meta.limit,
    totalItems: meta.total,
    totalPages: meta.totalPages,
    hasMore: meta.hasNextPage,
  };
}

export const foodService = {
  // Backend's query params are `restaurant`/`category` (not `restaurantId`/`categoryId`)
  // and `limit` (not `pageSize`); the response body is `{ data: Food[], meta }`, not `PaginatedResponse`.
  list: (params: FoodListParams = {}) => {
    const { restaurantId, categoryId, pageSize, ...rest } = params;
    return api
      .get<BackendListEnvelope>("/foods", {
        params: {
          page: params.page ?? 1,
          limit: pageSize ?? DEFAULT_PAGE_SIZE,
          restaurant: restaurantId,
          category: categoryId,
          ...rest,
        },
      })
      .then((res) => toPaginatedResponse(res.data));
  },

  detail: (id: string) =>
    api.get<{ data: { food: unknown } | unknown }>(`/foods/${id}`).then((res) => {
      const payload = res.data?.data as { food?: unknown } | unknown;
      const food =
        payload && typeof payload === "object" && "food" in (payload as object)
          ? (payload as { food: unknown }).food
          : payload;
      return mapFood(food);
    }),

  // There is no dedicated /foods/popular or /foods/recommended route; the backend only
  // supports filtering the main /foods list, so these use the closest matching filters.
  popular: () =>
    api
      .get<BackendListEnvelope>("/foods", { params: { isFeatured: true, limit: 20 } })
      .then((res) => toPaginatedResponse(res.data).items),

  recommended: () =>
    api
      .get<BackendListEnvelope>("/foods", { params: { limit: 20 } })
      .then((res) => toPaginatedResponse(res.data).items),

  // There is no dedicated /foods/search route; the backend's /foods list accepts a `search` param.
  search: (query: string) =>
    api
      .get<BackendListEnvelope>("/foods", { params: { search: query } })
      .then((res) => toPaginatedResponse(res.data).items),
};
