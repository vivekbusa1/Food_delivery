export interface Review {
  id: string;
  orderId: string;
  customerName: string;
  customerAvatarUrl?: string | null;
  rating: number;
  comment?: string;
  reply?: string | null;
  repliedAt?: string | null;
  foodItems?: string[];
  createdAt: string;
}

export interface ReviewListParams {
  page?: number;
  limit?: number;
  rating?: number;
  hasReply?: boolean;
}

export interface ReplyReviewPayload {
  reply: string;
}

export interface ReviewSummary {
  avgRating: number;
  totalReviews: number;
  ratingBreakdown: Record<'1' | '2' | '3' | '4' | '5', number>;
}
