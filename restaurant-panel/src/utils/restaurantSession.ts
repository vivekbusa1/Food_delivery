import { apiClient } from '../services/apiClient';

const RESTAURANT_ID_KEY = 'rp_restaurant_id';

type BackendRestaurant = {
  _id?: string;
  id?: string;
  name?: string;
  [key: string]: unknown;
};

let memoryId: string | null = null;

export function getCachedRestaurantId(): string | null {
  if (memoryId) return memoryId;
  memoryId = localStorage.getItem(RESTAURANT_ID_KEY);
  return memoryId;
}

export function setCachedRestaurantId(id: string): void {
  memoryId = id;
  localStorage.setItem(RESTAURANT_ID_KEY, id);
}

export function clearCachedRestaurantId(): void {
  memoryId = null;
  localStorage.removeItem(RESTAURANT_ID_KEY);
}

/** Resolve the logged-in owner's restaurant id (cached after first fetch). */
export async function resolveRestaurantId(): Promise<string> {
  const cached = getCachedRestaurantId();
  if (cached) return cached;

  const { data } = await apiClient.get<{
    success: boolean;
    data: { restaurant?: BackendRestaurant } | BackendRestaurant;
  }>('/restaurants/me/profile');

  const payload = data.data;
  const restaurant =
    payload && typeof payload === 'object' && 'restaurant' in payload
      ? (payload as { restaurant?: BackendRestaurant }).restaurant
      : (payload as BackendRestaurant);

  const id = String(restaurant?.id ?? restaurant?._id ?? '');
  if (!id) {
    throw new Error('No restaurant is linked to this account yet');
  }
  setCachedRestaurantId(id);
  return id;
}

export function normalizeId<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => normalizeId(item)) as T;
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    Object.entries(input).forEach(([key, val]) => {
      if (key === '_id') {
        output.id = val != null ? String(val) : val;
        return;
      }
      if (key === '__v') return;
      output[key] = normalizeId(val);
    });
    if (output.id == null && input.id != null) output.id = input.id;
    return output as T;
  }
  return value;
}
