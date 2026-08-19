import { apiClient } from './apiClient';
import { normalizeId, resolveRestaurantId } from '@/utils/restaurantSession';
import { restaurantService } from './restaurantService';
import type {
  ApiResponse,
  PaginatedResponse,
  ReplyReviewPayload,
  Review,
  ReviewListParams,
  ReviewSummary,
} from '@/types';

function mapReview(raw: Record<string, unknown>): Review {
  const r = normalizeId(raw) as Record<string, unknown>;
  const user = (r.user || r.customer || {}) as Record<string, unknown>;
  const reply = r.restaurantReply || r.reply;
  return {
    id: String(r.id ?? ''),
    orderId: String(r.order ?? r.orderId ?? ''),
    customerName: String(user.name ?? r.customerName ?? 'Customer'),
    customerAvatarUrl:
      typeof user.avatar === 'object' && user.avatar
        ? String((user.avatar as { url?: string }).url ?? '')
        : null,
    rating: Number(r.rating ?? 0),
    comment: r.comment ? String(r.comment) : r.review ? String(r.review) : undefined,
    reply:
      typeof reply === 'object' && reply
        ? String((reply as { text?: string }).text ?? '')
        : reply
          ? String(reply)
          : null,
    repliedAt:
      typeof reply === 'object' && reply && (reply as { repliedAt?: string }).repliedAt
        ? String((reply as { repliedAt?: string }).repliedAt)
        : null,
    createdAt: String(r.createdAt ?? ''),
  };
}

export const reviewService = {
  async list(params: ReviewListParams): Promise<PaginatedResponse<Review>> {
    const restaurantId = await resolveRestaurantId();
    const { data } = await apiClient.get(`/reviews/restaurant/${restaurantId}`, { params });
    const items = Array.isArray(data.data) ? data.data : [];
    return {
      success: data.success !== false,
      message: data.message,
      data: items.map((item: Record<string, unknown>) => mapReview(item)),
      meta: {
        page: data.meta?.page ?? 1,
        limit: data.meta?.limit ?? (items.length || 10),
        total: data.meta?.total ?? items.length,
        totalPages: data.meta?.totalPages ?? 1,
      },
    };
  },

  async getSummary(): Promise<ReviewSummary> {
    const [profile, reviews] = await Promise.all([
      restaurantService.getProfile().catch(() => null),
      reviewService.list({ page: 1, limit: 100 }),
    ]);
    const breakdown: ReviewSummary['ratingBreakdown'] = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    reviews.data.forEach((review) => {
      const key = String(Math.min(5, Math.max(1, Math.round(review.rating)))) as keyof typeof breakdown;
      breakdown[key] += 1;
    });
    return {
      avgRating: profile?.avgRating ?? 0,
      totalReviews: profile?.totalRatings ?? reviews.meta.total,
      ratingBreakdown: breakdown,
    };
  },

  async reply(id: string, payload: ReplyReviewPayload): Promise<Review> {
    const { data } = await apiClient.patch<ApiResponse<{ review?: Record<string, unknown> }>>(
      `/reviews/${id}/reply`,
      { text: payload.reply }
    );
    return mapReview(data.data?.review || {});
  },
};
