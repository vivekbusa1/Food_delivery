import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ACCESS_TOKEN_KEY, API_URL, REFRESH_TOKEN_KEY, ADMIN_USER_KEY } from '@/utils/constants';
import type { Paginated } from '@/types';

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let refreshQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  refreshQueue = [];
};

export const AUTH_LOGOUT_EVENT = 'admin:auth:logout';
const emitLogout = () => window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/logout')
    ) {
      if (!originalRequest.url?.includes('/auth/logout')) {
        clearAuthTokens();
        emitLogout();
      }
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      emitLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
      const payload = data?.data ?? data;
      const newAccessToken: string = payload.accessToken;
      const newRefreshToken: string = payload.refreshToken ?? refreshToken;

      setAuthTokens(newAccessToken, newRefreshToken);
      processQueue(null, newAccessToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthTokens();
      emitLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export interface ApiErrorShape {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || error.message || 'Something went wrong';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
};

type Envelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

/** Normalize Mongo `_id` (and nested objects) into `id`. */
export const normalizeId = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeId(item)) as T;
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    Object.entries(input).forEach(([key, val]) => {
      if (key === '_id') {
        output.id = typeof val === 'object' && val !== null && 'toString' in val
          ? String(val)
          : val;
        return;
      }
      if (key === '__v') return;
      output[key] = normalizeId(val);
    });
    if (output.id == null && input.id != null) output.id = input.id;
    return output as T;
  }
  return value;
};

/** Return `data` from a standard API envelope (or the raw body). */
export const unwrap = <T>(response: AxiosResponse<Envelope<T> | T>): T => {
  const body = response.data as Envelope<T>;
  if (body && typeof body === 'object' && 'data' in body) {
    return normalizeId(body.data as T);
  }
  return normalizeId(response.data as T);
};

/**
 * Merge envelope `data` + `meta` into the admin panel's Paginated shape.
 * Also accepts already-shaped `{ items }` payloads and `{ [key]: T[] }` wrappers.
 */
export const unwrapPaginated = <T>(
  response: AxiosResponse<Envelope<T[] | { items?: T[] } | Record<string, unknown>>>,
  listKey?: string
): Paginated<T> => {
  const body = response.data as Envelope<T[] | Record<string, unknown>>;
  const raw = body?.data;
  const meta = body?.meta;

  let items: T[] = [];
  if (Array.isArray(raw)) {
    items = raw;
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.items)) items = obj.items as T[];
    else if (listKey && Array.isArray(obj[listKey])) items = obj[listKey] as T[];
    else {
      const firstArray = Object.values(obj).find((v) => Array.isArray(v));
      if (Array.isArray(firstArray)) items = firstArray as T[];
    }
  }

  const normalized = normalizeId(items);
  const total = meta?.total ?? normalized.length;
  const page = meta?.page ?? 1;
  const limit = meta?.limit ?? (normalized.length || 10);
  const totalPages = meta?.totalPages ?? Math.max(Math.ceil(total / (limit || 1)), 1);

  return { items: normalized, total, page, limit, totalPages };
};

/** Pull a nested entity key out of `data` (e.g. `{ user }`, `{ order }`). */
export const unwrapEntity = <T>(
  response: AxiosResponse<Envelope<Record<string, unknown> | T>>,
  key: string
): T => {
  const data = unwrap<Record<string, unknown> | T>(response);
  if (data && typeof data === 'object' && key in (data as object)) {
    return normalizeId((data as Record<string, unknown>)[key] as T);
  }
  return normalizeId(data as T);
};

export type { AxiosRequestConfig };
export default api;
