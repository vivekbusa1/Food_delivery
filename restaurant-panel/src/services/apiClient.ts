import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { tokenStorage } from '@/utils/tokenStorage';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type Subscriber = (token: string | null) => void;

let isRefreshing = false;
let subscribers: Subscriber[] = [];

function onRefreshed(token: string | null) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

function subscribeTokenRefresh(cb: Subscriber) {
  subscribers.push(cb);
}

/** Fired when auth is unrecoverable, so the app can redirect to /login. */
export const authEvents = new EventTarget();
export const AUTH_LOGOUT_EVENT = 'auth:logout';

export function emitForceLogout() {
  authEvents.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken,
    });
    // Backend returns flat { accessToken, refreshToken } on data (not nested tokens).
    const payload = response.data?.data ?? response.data;
    const accessToken = payload?.accessToken ?? payload?.tokens?.accessToken;
    const refreshTokenValue = payload?.refreshToken ?? payload?.tokens?.refreshToken;
    if (accessToken && refreshTokenValue) {
      tokenStorage.setTokens({ accessToken, refreshToken: refreshTokenValue });
      return accessToken as string;
    }
    return null;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Do not attempt to refresh for the auth endpoints themselves.
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/logout')
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      tokenStorage.clear();
      emitForceLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (token) {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;
    onRefreshed(newToken);

    if (newToken) {
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    }

    tokenStorage.clear();
    emitForceLogout();
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    if (data?.message) return data.message;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (first?.[0]) return first[0];
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export type { AxiosRequestConfig };
