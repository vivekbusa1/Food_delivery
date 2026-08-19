import { apiClient } from './apiClient';
import { normalizeId, resolveRestaurantId } from '@/utils/restaurantSession';
import type {
  ApiResponse,
  CreateCategoryPayload,
  FoodCategory,
  UpdateCategoryPayload,
} from '@/types';

function mapCategory(raw: Record<string, unknown>): FoodCategory {
  const c = normalizeId(raw) as Record<string, unknown>;
  const image = c.image as { url?: string } | string | undefined;
  return {
    id: String(c.id ?? ''),
    name: String(c.name ?? ''),
    description: c.description ? String(c.description) : undefined,
    imageUrl: typeof image === 'object' ? image?.url ?? null : image ? String(image) : null,
    isActive: c.isActive !== false,
    sortOrder: Number(c.order ?? c.sortOrder ?? 0),
    itemCount: Number(c.itemCount ?? 0),
    createdAt: String(c.createdAt ?? ''),
  };
}

export const categoryService = {
  async list(): Promise<FoodCategory[]> {
    const restaurantId = await resolveRestaurantId();
    const { data } = await apiClient.get<ApiResponse<{ categories?: Record<string, unknown>[] }>>(
      '/categories/food',
      { params: { restaurant: restaurantId } }
    );
    const categories = data.data?.categories ?? [];
    return categories.map((item) => mapCategory(item));
  },

  async create(payload: CreateCategoryPayload): Promise<FoodCategory> {
    const restaurantId = await resolveRestaurantId();
    const { data } = await apiClient.post<ApiResponse<{ category?: Record<string, unknown> }>>(
      '/categories/food',
      { ...payload, restaurant: restaurantId, order: payload.sortOrder }
    );
    return mapCategory(data.data?.category || {});
  },

  async update(id: string, payload: UpdateCategoryPayload): Promise<FoodCategory> {
    const { data } = await apiClient.patch<ApiResponse<{ category?: Record<string, unknown> }>>(
      `/categories/food/${id}`,
      { ...payload, order: payload.sortOrder }
    );
    return mapCategory(data.data?.category || {});
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/categories/food/${id}`);
  },

  async reorder(_orderedIds: string[]): Promise<void> {
    // Backend has no reorder endpoint yet.
  },
};
