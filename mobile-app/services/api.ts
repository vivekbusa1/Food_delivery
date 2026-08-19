import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL, DEBUG, SECURE_STORE_KEYS } from "../constants/config";
import type { ApiError } from "../types";
import { deleteSecureItem, getSecureItem, setSecureItem } from "../utils/secureStorage";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Called by AuthContext once a user is authenticated so the whole app can clear
// state on a 401 without every service having to know about the auth store.
let onUnauthorized: (() => void) | null = null;
export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getSecureItem(SECURE_STORE_KEYS.refreshToken);
  if (!refreshToken) return null;

  try {
    // Backend route is /auth/refresh-token; tokens are flat on `data`, not `data.tokens`.
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh-token`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    const payload = response.data?.data ?? response.data;
    const accessToken: string | undefined = payload?.accessToken ?? payload?.tokens?.accessToken;
    const newRefreshToken: string | undefined =
      payload?.refreshToken ?? payload?.tokens?.refreshToken ?? refreshToken;
    if (!accessToken) return null;
    await setSecureItem(SECURE_STORE_KEYS.accessToken, accessToken);
    await setSecureItem(SECURE_STORE_KEYS.refreshToken, newRefreshToken);
    return accessToken;
  } catch {
    return null;
  }
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getSecureItem(SECURE_STORE_KEYS.accessToken);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;

      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api.request(originalRequest);
      }

      await deleteSecureItem(SECURE_STORE_KEYS.accessToken);
      await deleteSecureItem(SECURE_STORE_KEYS.refreshToken);
      onUnauthorized?.();
    }

    const apiError: ApiError = {
      message:
        error.response?.data?.message ??
        error.message ??
        "Something went wrong. Please try again.",
      statusCode: error.response?.status,
      errors: error.response?.data?.errors,
    };
    return Promise.reject(apiError);
  },
);

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as ApiError).message);
  }
  return "Something went wrong. Please try again.";
}
