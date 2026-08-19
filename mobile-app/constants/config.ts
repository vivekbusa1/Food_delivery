// Central runtime configuration, sourced from EXPO_PUBLIC_* environment variables
// so the same binary can point at different backends without a rebuild of native code.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000/api/v1";

export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export const DEBUG = process.env.EXPO_PUBLIC_DEBUG === "true";

export const DEFAULT_PAGE_SIZE = 10;

export const SECURE_STORE_KEYS = {
  accessToken: "fd_access_token",
  refreshToken: "fd_refresh_token",
  userRole: "fd_user_role",
} as const;

export const ASYNC_STORAGE_KEYS = {
  hasOnboarded: "fd_has_onboarded",
  themePreference: "fd_theme_preference",
  language: "fd_language",
  recentSearches: "fd_recent_searches",
} as const;

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
] as const;

export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80";
