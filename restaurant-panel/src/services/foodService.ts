import { apiClient } from './apiClient';
import { getMyRestaurantId } from './restaurantService';
import type {
  ApiResponse,
  FoodItem,
  FoodListParams,
  FoodPayload,
  FoodVariant,
  FoodAddOn,
  PaginatedResponse,
} from '@/types';

type BackendImage = { url: string; publicId?: string };

type BackendVariant = { _id?: string; id?: string; name: string; price: number };
type BackendAddon = { _id?: string; id?: string; name: string; price: number };

type BackendFood = {
  _id?: string;
  id?: string;
  category?: { _id?: string; id?: string; name?: string } | string;
  name?: string;
  description?: string;
  price?: number;
  discountPrice?: number | null;
  effectivePrice?: number;
  images?: BackendImage[];
  isVeg?: boolean;
  isAvailable?: boolean;
  variants?: BackendVariant[];
  addons?: BackendAddon[];
  tags?: string[];
  ratingsAverage?: number;
  createdAt?: string;
  updatedAt?: string;
};

function categoryId(category: BackendFood['category']): string {
  if (!category) return '';
  return typeof category === 'string' ? category : String(category.id ?? category._id ?? '');
}

function categoryName(category: BackendFood['category']): string | undefined {
  if (category && typeof category === 'object') return category.name;
  return undefined;
}

function mapVariant(v: BackendVariant): FoodVariant {
  return { id: String(v.id ?? v._id ?? ''), name: v.name, price: v.price };
}

function mapAddon(a: BackendAddon): FoodAddOn {
  return { id: String(a.id ?? a._id ?? ''), name: a.name, price: a.price };
}

/** Backend stores an absolute `discountPrice`, while the UI edits a `discountPercent`. */
function discountPriceToPercent(price: number, discountPrice: number | null | undefined): number {
  if (!discountPrice || !price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

function percentToDiscountPrice(price: number | undefined, discountPercent: number | undefined): number | null {
  if (price === undefined || !discountPercent) return null;
  return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}

function mapFood(food: BackendFood): FoodItem {
  const price = Number(food.price ?? 0);
  return {
    id: String(food.id ?? food._id ?? ''),
    categoryId: categoryId(food.category),
    categoryName: categoryName(food.category),
    name: String(food.name ?? ''),
    description: food.description ?? '',
    price,
    discountPercent: discountPriceToPercent(price, food.discountPrice),
    effectivePrice: Number(food.effectivePrice ?? food.discountPrice ?? food.price ?? 0),
    images: (food.images ?? []).map((img) => img.url),
    isVeg: Boolean(food.isVeg),
    isAvailable: Boolean(food.isAvailable),
    variants: (food.variants ?? []).map(mapVariant),
    addOns: (food.addons ?? []).map(mapAddon),
    tags: food.tags ?? [],
    avgRating: food.ratingsAverage,
    createdAt: String(food.createdAt ?? ''),
    updatedAt: String(food.updatedAt ?? food.createdAt ?? ''),
  };
}

function toBackendBody(payload: Partial<FoodPayload>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.price !== undefined) body.price = payload.price;
  if (payload.categoryId !== undefined) body.category = payload.categoryId;
  if (payload.discountPercent !== undefined) {
    body.discountPrice = percentToDiscountPrice(payload.price, payload.discountPercent);
  }
  if (payload.isVeg !== undefined) body.isVeg = payload.isVeg;
  if (payload.isAvailable !== undefined) body.isAvailable = payload.isAvailable;
  if (payload.tags !== undefined) body.tags = payload.tags;
  return body;
}

/** Reconciles the variants/addons the form wants against what already exists on the food,
 * since the backend manages them as separate sub-resources (`POST/PATCH/DELETE /foods/:id/variants[/:id]`)
 * rather than accepting them inline on the food document. */
async function syncSubResources(
  foodId: string,
  desiredVariants: FoodVariant[],
  desiredAddOns: FoodAddOn[],
  existingVariants: FoodVariant[],
  existingAddOns: FoodAddOn[]
): Promise<void> {
  const desiredVariantIds = new Set(desiredVariants.map((v) => v.id).filter(Boolean));
  const desiredAddOnIds = new Set(desiredAddOns.map((a) => a.id).filter(Boolean));

  const ops: Promise<unknown>[] = [];

  desiredVariants.forEach((variant) => {
    if (variant.id) {
      ops.push(
        apiClient.patch(`/foods/${foodId}/variants/${variant.id}`, { name: variant.name, price: variant.price })
      );
    } else {
      ops.push(apiClient.post(`/foods/${foodId}/variants`, { name: variant.name, price: variant.price }));
    }
  });
  existingVariants.forEach((variant) => {
    if (variant.id && !desiredVariantIds.has(variant.id)) {
      ops.push(apiClient.delete(`/foods/${foodId}/variants/${variant.id}`));
    }
  });

  desiredAddOns.forEach((addOn) => {
    if (addOn.id) {
      ops.push(apiClient.patch(`/foods/${foodId}/addons/${addOn.id}`, { name: addOn.name, price: addOn.price }));
    } else {
      ops.push(apiClient.post(`/foods/${foodId}/addons`, { name: addOn.name, price: addOn.price }));
    }
  });
  existingAddOns.forEach((addOn) => {
    if (addOn.id && !desiredAddOnIds.has(addOn.id)) {
      ops.push(apiClient.delete(`/foods/${foodId}/addons/${addOn.id}`));
    }
  });

  await Promise.all(ops);
}

async function fetchRawFood(id: string): Promise<BackendFood> {
  const { data } = await apiClient.get<ApiResponse<{ food: BackendFood }>>(`/foods/${id}`);
  return data.data.food;
}

export const foodService = {
  async list(params: FoodListParams): Promise<PaginatedResponse<FoodItem>> {
    const restaurantId = await getMyRestaurantId();
    const { data } = await apiClient.get<ApiResponse<BackendFood[]> & { meta: PaginatedResponse<FoodItem>['meta'] }>(
      '/foods',
      {
        params: {
          restaurant: restaurantId,
          page: params.page,
          limit: params.limit,
          search: params.search,
          category: params.categoryId,
          isAvailable: params.isAvailable,
        },
      }
    );
    return {
      success: data.success,
      message: data.message,
      data: (data.data ?? []).map(mapFood),
      meta: data.meta,
    };
  },

  async getById(id: string): Promise<FoodItem> {
    return mapFood(await fetchRawFood(id));
  },

  async create(payload: FoodPayload): Promise<FoodItem> {
    const restaurantId = await getMyRestaurantId();
    const { data } = await apiClient.post<ApiResponse<{ food: BackendFood }>>('/foods', {
      ...toBackendBody(payload),
      restaurant: restaurantId,
    });
    const created = data.data.food;
    const foodId = String(created.id ?? created._id ?? '');

    await syncSubResources(foodId, payload.variants ?? [], payload.addOns ?? [], [], []);

    return foodService.getById(foodId);
  },

  async update(id: string, payload: Partial<FoodPayload>): Promise<FoodItem> {
    const { data } = await apiClient.patch<ApiResponse<{ food: BackendFood }>>(
      `/foods/${id}`,
      toBackendBody(payload)
    );

    if (payload.variants !== undefined || payload.addOns !== undefined) {
      const current = mapFood(data.data.food);
      await syncSubResources(
        id,
        payload.variants ?? current.variants,
        payload.addOns ?? current.addOns,
        current.variants,
        current.addOns
      );
      return foodService.getById(id);
    }

    return mapFood(data.data.food);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/foods/${id}`);
  },

  async setAvailability(id: string, isAvailable: boolean): Promise<FoodItem> {
    const { data } = await apiClient.patch<ApiResponse<{ food: BackendFood }>>(`/foods/${id}`, {
      isAvailable,
    });
    return mapFood(data.data.food);
  },

  async uploadImages(id: string, files: File[]): Promise<FoodItem> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const { data } = await apiClient.patch<ApiResponse<{ food: BackendFood }>>(`/foods/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapFood(data.data.food);
  },

  async removeImage(id: string, imageUrl: string): Promise<FoodItem> {
    const raw = await fetchRawFood(id);
    const remainingImages = (raw.images ?? []).filter((img) => img.url !== imageUrl);
    const { data } = await apiClient.patch<ApiResponse<{ food: BackendFood }>>(`/foods/${id}`, {
      images: remainingImages,
    });
    return mapFood(data.data.food);
  },
};
