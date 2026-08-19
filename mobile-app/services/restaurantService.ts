import { api } from "./api";
import { DEFAULT_PAGE_SIZE } from "../constants/config";
import type { PaginatedResponse, Restaurant } from "../types";

export interface RestaurantListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  cuisines?: string[];
  minRating?: number;
  maxPrice?: number;
  sortBy?: "rating" | "deliveryTime" | "distance";
  latitude?: number;
  longitude?: number;
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
  meta?: BackendMeta;
};

type RawRestaurant = Record<string, unknown> & {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  logo?: { url?: string };
  coverImage?: { url?: string };
  imageUrl?: string;
  coverImageUrl?: string;
  cuisines?: string[];
  ratingsAverage?: number;
  ratingsCount?: number;
  rating?: number;
  ratingCount?: number;
  avgDeliveryTime?: number;
  deliveryTimeMinutes?: number;
  deliveryFee?: number;
  minOrderAmount?: number;
  isOpen?: boolean;
  isFavorite?: boolean;
  address?: string | { street?: string; city?: string; state?: string; zipCode?: string };
  location?: { coordinates?: [number, number] };
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  promoted?: boolean;
  discountLabel?: string | null;
};

function formatAddress(address: RawRestaurant["address"]): string {
  if (!address) return "";
  if (typeof address === "string") return address;
  return [address.street, address.city, address.state, address.zipCode].filter(Boolean).join(", ");
}

export function mapRestaurant(raw: unknown): Restaurant {
  const restaurant = (raw ?? {}) as RawRestaurant;
  const coords = restaurant.location?.coordinates;
  const latitude =
    restaurant.latitude != null
      ? Number(restaurant.latitude)
      : Array.isArray(coords)
        ? Number(coords[1] ?? 0)
        : 0;
  const longitude =
    restaurant.longitude != null
      ? Number(restaurant.longitude)
      : Array.isArray(coords)
        ? Number(coords[0] ?? 0)
        : 0;

  return {
    id: String(restaurant.id ?? restaurant._id ?? ""),
    name: String(restaurant.name ?? ""),
    description: restaurant.description ? String(restaurant.description) : undefined,
    imageUrl: String(restaurant.imageUrl ?? restaurant.logo?.url ?? ""),
    coverImageUrl: String(restaurant.coverImageUrl ?? restaurant.coverImage?.url ?? "") || undefined,
    cuisines: Array.isArray(restaurant.cuisines) ? restaurant.cuisines.map(String) : [],
    rating: Number(restaurant.rating ?? restaurant.ratingsAverage ?? 0),
    ratingCount: Number(restaurant.ratingCount ?? restaurant.ratingsCount ?? 0),
    priceRange: 2,
    deliveryTimeMinutes: Number(restaurant.deliveryTimeMinutes ?? restaurant.avgDeliveryTime ?? 30),
    deliveryFee: Number(restaurant.deliveryFee ?? 0),
    minOrderAmount: Number(restaurant.minOrderAmount ?? 0),
    distanceKm: restaurant.distanceKm != null ? Number(restaurant.distanceKm) : undefined,
    isOpen: restaurant.isOpen !== false,
    isFavorite: Boolean(restaurant.isFavorite),
    address: formatAddress(restaurant.address),
    latitude,
    longitude,
    promoted: Boolean(restaurant.promoted),
    discountLabel: restaurant.discountLabel ?? null,
  };
}

function toPaginatedResponse(body: BackendListEnvelope): PaginatedResponse<Restaurant> {
  const items = (body.data ?? []).map(mapRestaurant);
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

function unwrapList(body: unknown): PaginatedResponse<Restaurant> {
  if (body && typeof body === "object" && "data" in body) {
    const envelope = body as BackendListEnvelope & { items?: unknown[] };
    if (Array.isArray(envelope.data)) return toPaginatedResponse(envelope);
    if (Array.isArray(envelope.items)) {
      return {
        items: envelope.items.map(mapRestaurant),
        page: 1,
        pageSize: envelope.items.length,
        totalItems: envelope.items.length,
        totalPages: 1,
        hasMore: false,
      };
    }
  }
  if (Array.isArray(body)) {
    return {
      items: body.map(mapRestaurant),
      page: 1,
      pageSize: body.length,
      totalItems: body.length,
      totalPages: 1,
      hasMore: false,
    };
  }
  return { items: [], page: 1, pageSize: 0, totalItems: 0, totalPages: 0, hasMore: false };
}

export const restaurantService = {
  list: (params: RestaurantListParams = {}) =>
    api
      .get("/restaurants", {
        params: {
          page: params.page ?? 1,
          limit: params.pageSize ?? DEFAULT_PAGE_SIZE,
          pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
          search: params.search,
          category: params.categoryId,
          categoryId: params.categoryId,
          // Backend only filters on a single `cuisine` value (not a comma list), so pass the first one.
          cuisine: params.cuisines?.[0],
          minRating: params.minRating,
          maxPrice: params.maxPrice,
          sortBy: params.sortBy,
          latitude: params.latitude,
          longitude: params.longitude,
        },
      })
      .then((res) => unwrapList(res.data)),

  detail: (id: string) =>
    api.get(`/restaurants/${id}`).then((res) => {
      const payload = res.data?.data ?? res.data;
      const restaurant =
        payload && typeof payload === "object" && "restaurant" in payload
          ? (payload as { restaurant: unknown }).restaurant
          : payload;
      return mapRestaurant(restaurant);
    }),

  // Favorite restaurants live under the top-level /favorites resource, not /restaurants.
  // Response is `{ data: { favorites: [{ restaurant, ... }] } }` — a list of favorite-link
  // records with a populated `restaurant`, not restaurants directly.
  favorites: () =>
    api.get("/favorites").then((res) => {
      const payload = res.data?.data ?? res.data;
      const list: unknown[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.favorites)
          ? payload.favorites
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
      return list.map((item) => {
        const record = item as { restaurant?: unknown };
        return mapRestaurant(record && typeof record === "object" && "restaurant" in record ? record.restaurant : item);
      });
    }),

  addFavorite: (id: string) =>
    api.post<{ success: boolean }>("/favorites", { restaurantId: id }).then((res) => res.data),

  removeFavorite: (id: string) =>
    api.delete<{ success: boolean }>(`/favorites/${id}`).then((res) => res.data),
};
