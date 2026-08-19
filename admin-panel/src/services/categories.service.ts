import api, { unwrap, unwrapEntity, unwrapPaginated } from './api';
import type { Cuisine, FoodCategory, Paginated, QueryParams } from '@/types';

const mapCategory = (c: Record<string, unknown>): FoodCategory => ({
  id: String(c.id ?? ''),
  name: String(c.name ?? ''),
  image:
    typeof c.image === 'object' && c.image
      ? String((c.image as { url?: string }).url ?? '')
      : c.image
        ? String(c.image)
        : undefined,
  description: c.description ? String(c.description) : undefined,
  isActive: c.isActive !== false,
  sortOrder: Number(c.order ?? c.sortOrder ?? 0),
  itemCount: Number(c.itemCount ?? 0),
  createdAt: String(c.createdAt ?? ''),
});

export const categoriesService = {
  list: async (params: QueryParams = {}): Promise<Paginated<FoodCategory>> => {
    const res = await api.get('/categories/food', { params });
    const page = unwrapPaginated<Record<string, unknown>>(res, 'categories');
    return { ...page, items: page.items.map(mapCategory) };
  },
  create: async (payload: FormData | Partial<FoodCategory>): Promise<FoodCategory> => {
    const res = await api.post('/categories/food', payload, {
      headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return mapCategory(unwrapEntity(res, 'category'));
  },
  update: async (id: string, payload: FormData | Partial<FoodCategory>): Promise<FoodCategory> => {
    const res = await api.patch(`/categories/food/${id}`, payload, {
      headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return mapCategory(unwrapEntity(res, 'category'));
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/categories/food/${id}`);
  },
  toggleActive: async (id: string, isActive: boolean): Promise<FoodCategory> => {
    const res = await api.patch(`/categories/food/${id}`, { isActive });
    return mapCategory(unwrapEntity(res, 'category'));
  },
};

export const cuisinesService = {
  list: async (_params: QueryParams = {}): Promise<Paginated<Cuisine>> => {
    const res = await api.get('/categories/cuisines');
    const data = unwrap<{ cuisines?: string[] }>(res);
    const items = (data.cuisines ?? []).map((name, index) => ({
      id: String(index + 1),
      name,
      isActive: true,
      createdAt: new Date().toISOString(),
    }));
    return { items, total: items.length, page: 1, limit: items.length || 10, totalPages: 1 };
  },
  create: async (_payload: FormData | Partial<Cuisine>): Promise<Cuisine> => {
    throw new Error('Cuisine CRUD is not supported by the API (cuisines are derived from restaurants)');
  },
  update: async (_id: string, _payload: FormData | Partial<Cuisine>): Promise<Cuisine> => {
    throw new Error('Cuisine CRUD is not supported by the API (cuisines are derived from restaurants)');
  },
  remove: async (_id: string): Promise<void> => {
    throw new Error('Cuisine CRUD is not supported by the API (cuisines are derived from restaurants)');
  },
  toggleActive: async (_id: string, _isActive: boolean): Promise<Cuisine> => {
    throw new Error('Cuisine CRUD is not supported by the API (cuisines are derived from restaurants)');
  },
};
