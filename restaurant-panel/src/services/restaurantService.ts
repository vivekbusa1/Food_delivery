import { apiClient } from './apiClient';
import { clearCachedRestaurantId, setCachedRestaurantId } from '@/utils/restaurantSession';
import type {
  ApiResponse,
  RestaurantProfile,
  UpdateBusinessDetailsPayload,
  UpdateProfilePayload,
  WorkingHours,
} from '@/types';

type BackendAddress = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  landmark?: string;
};

type BackendRestaurant = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  logo?: { url?: string } | string | null;
  coverImage?: { url?: string } | string | null;
  cuisines?: string[];
  address?: BackendAddress;
  isOpen?: boolean;
  ratingsAverage?: number;
  ratingsCount?: number;
  minOrderAmount?: number;
  avgDeliveryTime?: number;
  createdAt?: string;
  updatedAt?: string;
};

type BackendTiming = {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

function imageUrl(value: { url?: string } | string | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.url || null;
}

/**
 * The backend's `Restaurant` model has no `gstNumber`/`fssaiLicense`/`panNumber`/`bankDetails`
 * fields, so those cannot be persisted server-side today. We still map them through so the
 * profile screen doesn't crash, but they will not round-trip until the backend adds support.
 */
function mapProfile(restaurant: BackendRestaurant): RestaurantProfile {
  const id = String(restaurant.id ?? restaurant._id ?? '');
  return {
    id,
    restaurantName: String(restaurant.name ?? ''),
    ownerName: '',
    email: String(restaurant.email ?? ''),
    phone: String(restaurant.phone ?? ''),
    description: restaurant.description ?? '',
    logoUrl: imageUrl(restaurant.logo),
    coverImageUrl: imageUrl(restaurant.coverImage),
    cuisineTypes: Array.isArray(restaurant.cuisines) ? restaurant.cuisines : [],
    address: {
      line1: restaurant.address?.street ?? '',
      city: restaurant.address?.city ?? '',
      state: restaurant.address?.state ?? '',
      pincode: restaurant.address?.zipCode ?? '',
      country: restaurant.address?.country ?? '',
    },
    isOpen: Boolean(restaurant.isOpen),
    avgRating: Number(restaurant.ratingsAverage ?? 0),
    totalRatings: Number(restaurant.ratingsCount ?? 0),
    minOrderValue: restaurant.minOrderAmount,
    avgPreparationTime: restaurant.avgDeliveryTime,
    createdAt: String(restaurant.createdAt ?? ''),
    updatedAt: String(restaurant.updatedAt ?? ''),
  };
}

function mapWorkingHours(timings: BackendTiming[]): WorkingHours {
  return timings.map((timing) => ({
    day: timing.day as WorkingHours[number]['day'],
    isOpen: timing.isOpen,
    slots: timing.openTime && timing.closeTime ? [{ openTime: timing.openTime, closeTime: timing.closeTime }] : [],
  }));
}

let cachedRestaurantId: string | null = null;
let pendingProfileFetch: Promise<RestaurantProfile> | null = null;

/** Clears the cached restaurant id; call this on logout. */
export function clearRestaurantIdCache(): void {
  cachedRestaurantId = null;
  pendingProfileFetch = null;
  clearCachedRestaurantId();
}

async function fetchProfile(): Promise<RestaurantProfile> {
  const { data } = await apiClient.get<ApiResponse<{ restaurant: BackendRestaurant }>>(
    '/restaurants/me/profile'
  );
  const profile = mapProfile(data.data.restaurant);
  cachedRestaurantId = profile.id;
  setCachedRestaurantId(profile.id);
  return profile;
}

/**
 * Every restaurant-scoped endpoint on the backend (`/restaurants/:id/...`, `/orders/restaurant/:id`,
 * `/foods?restaurant=:id`) needs the actual restaurant id, not "me". We resolve and cache it from
 * `GET /restaurants/me/profile` the first time it's needed.
 */
export async function getMyRestaurantId(): Promise<string> {
  if (cachedRestaurantId) return cachedRestaurantId;
  if (!pendingProfileFetch) {
    pendingProfileFetch = fetchProfile().finally(() => {
      pendingProfileFetch = null;
    });
  }
  const profile = await pendingProfileFetch;
  return profile.id;
}

export const restaurantService = {
  async getProfile(): Promise<RestaurantProfile> {
    return fetchProfile();
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<RestaurantProfile> {
    const id = await getMyRestaurantId();
    const { data } = await apiClient.patch<ApiResponse<{ restaurant: BackendRestaurant }>>(
      `/restaurants/${id}`,
      {
        name: payload.restaurantName,
        phone: payload.phone,
        description: payload.description,
        cuisines: payload.cuisineTypes,
        address: payload.address
          ? {
              street: payload.address.line1,
              city: payload.address.city,
              state: payload.address.state,
              zipCode: payload.address.pincode,
              country: payload.address.country,
            }
          : undefined,
        minOrderAmount: payload.minOrderValue,
        avgDeliveryTime: payload.avgPreparationTime,
      }
    );
    return mapProfile(data.data.restaurant);
  },

  /**
   * Backend gap: gstNumber/fssaiLicense/panNumber/bankDetails don't exist on the Restaurant
   * schema, so mongoose will silently drop them. Kept pointed at the real restaurant record so
   * it at least doesn't 404; needs a backend schema change to fully persist.
   */
  async updateBusinessDetails(
    payload: UpdateBusinessDetailsPayload
  ): Promise<RestaurantProfile> {
    const id = await getMyRestaurantId();
    const { data } = await apiClient.patch<ApiResponse<{ restaurant: BackendRestaurant }>>(
      `/restaurants/${id}`,
      payload
    );
    return mapProfile(data.data.restaurant);
  },

  async toggleOpenStatus(_isOpen: boolean): Promise<RestaurantProfile> {
    const id = await getMyRestaurantId();
    const { data } = await apiClient.patch<ApiResponse<{ restaurant: BackendRestaurant }>>(
      `/restaurants/${id}/toggle-open`
    );
    return mapProfile(data.data.restaurant);
  },

  async uploadLogo(file: File): Promise<RestaurantProfile> {
    const id = await getMyRestaurantId();
    const formData = new FormData();
    formData.append('logo', file);
    const { data } = await apiClient.patch<ApiResponse<{ restaurant: BackendRestaurant }>>(
      `/restaurants/${id}/logo`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return mapProfile(data.data.restaurant);
  },

  async uploadCoverImage(file: File): Promise<RestaurantProfile> {
    const id = await getMyRestaurantId();
    const formData = new FormData();
    formData.append('cover', file);
    const { data } = await apiClient.patch<ApiResponse<{ restaurant: BackendRestaurant }>>(
      `/restaurants/${id}/cover`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return mapProfile(data.data.restaurant);
  },

  async getWorkingHours(): Promise<WorkingHours> {
    const id = await getMyRestaurantId();
    const { data } = await apiClient.get<ApiResponse<{ timings: BackendTiming[] }>>(
      `/restaurants/${id}/timings`
    );
    return mapWorkingHours(data.data.timings ?? []);
  },

  /**
   * The backend only supports one open/close slot per day via `PUT /restaurants/:id/timings`
   * (one day at a time), so a full week is synced with one request per day.
   */
  async updateWorkingHours(payload: WorkingHours): Promise<WorkingHours> {
    const id = await getMyRestaurantId();
    await Promise.all(
      payload.map((day) =>
        apiClient.put(`/restaurants/${id}/timings`, {
          day: day.day,
          isOpen: day.isOpen,
          openTime: day.slots[0]?.openTime ?? '',
          closeTime: day.slots[0]?.closeTime ?? '',
        })
      )
    );
    return restaurantService.getWorkingHours();
  },
};
