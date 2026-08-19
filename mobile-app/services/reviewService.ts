import { api } from "./api";
import { asArray, pickId, unwrapData } from "../utils/apiHelpers";
import type { Review } from "../types";

export interface CreateReviewPayload {
  restaurantId?: string;
  foodId?: string;
  orderId?: string;
  rating: number;
  comment: string;
}

type RawReview = Record<string, unknown> & {
  _id?: string;
  id?: string;
  user?: string | { _id?: string; id?: string; name?: string; avatar?: { url?: string } | string };
  userId?: string;
  userName?: string;
  userAvatarUrl?: string | null;
  restaurant?: string | { _id?: string; id?: string };
  food?: string | { _id?: string; id?: string };
  order?: string | { _id?: string; id?: string };
  restaurantId?: string;
  foodId?: string;
  orderId?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  images?: Array<{ url?: string } | string>;
};

function refId(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const obj = value as { _id?: string; id?: string };
    const id = obj.id ?? obj._id;
    return id != null ? String(id) : undefined;
  }
  return undefined;
}

export function mapReview(raw: unknown): Review {
  const review = (raw ?? {}) as RawReview;
  const user = review.user;
  let userId = review.userId ? String(review.userId) : "";
  let userName = review.userName ? String(review.userName) : "User";
  let userAvatarUrl: string | null | undefined = review.userAvatarUrl;

  if (typeof user === "string") {
    userId = user;
  } else if (user && typeof user === "object") {
    userId = String(user.id ?? user._id ?? userId);
    userName = String(user.name ?? userName);
    if (typeof user.avatar === "string") userAvatarUrl = user.avatar;
    else if (user.avatar && typeof user.avatar === "object") {
      userAvatarUrl = user.avatar.url ?? null;
    }
  }

  const images = Array.isArray(review.images)
    ? review.images
        .map((image) => (typeof image === "string" ? image : String(image?.url ?? "")))
        .filter(Boolean)
    : undefined;

  return {
    id: pickId(review),
    userId,
    userName,
    userAvatarUrl: userAvatarUrl ?? null,
    restaurantId: review.restaurantId ? String(review.restaurantId) : refId(review.restaurant),
    foodId: review.foodId ? String(review.foodId) : refId(review.food),
    orderId: review.orderId ? String(review.orderId) : refId(review.order),
    rating: Number(review.rating ?? 0),
    comment: String(review.comment ?? ""),
    createdAt: String(review.createdAt ?? new Date().toISOString()),
    images,
  };
}

function unwrapReviewList(body: unknown): Review[] {
  const data = unwrapData<unknown>(body);
  return asArray(data).map(mapReview);
}

export const reviewService = {
  // Backend routes are /reviews/restaurant/:id and /reviews/food/:id (not nested under restaurants/foods).
  forRestaurant: (restaurantId: string) =>
    api.get(`/reviews/restaurant/${restaurantId}`).then((res) => unwrapReviewList(res.data)),

  forFood: (foodId: string) =>
    api.get(`/reviews/food/${foodId}`).then((res) => unwrapReviewList(res.data)),

  // No dedicated order-reviews list endpoint; return empty for callers that still expect it.
  forOrder: async (_orderId: string) => [] as Review[],

  create: (payload: CreateReviewPayload) =>
    api
      .post("/reviews", {
        orderId: payload.orderId,
        restaurantId: payload.restaurantId,
        foodId: payload.foodId,
        rating: payload.rating,
        comment: payload.comment,
      })
      .then((res) => {
        const data = unwrapData<{ review?: unknown }>(res.data);
        return mapReview(data && typeof data === "object" && "review" in data ? data.review : data);
      }),
};
