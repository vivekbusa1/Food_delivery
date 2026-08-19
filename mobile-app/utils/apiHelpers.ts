/** Shared helpers for normalizing backend `{ success, message, data, meta }` responses. */

export type ApiEnvelope<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: unknown;
};

/** Unwrap `body.data` when present; otherwise return body as-is. */
export function unwrapData<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    return ((body as ApiEnvelope<T>).data ?? body) as T;
  }
  return body as T;
}

/** Prefer a named collection key, then a bare array, then []. */
export function unwrapCollection<T>(body: unknown, key: string): T[] {
  const data = unwrapData<unknown>(body);
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const nested = (data as Record<string, unknown>)[key];
    if (Array.isArray(nested)) return nested as T[];
    if (Array.isArray((data as { items?: unknown[] }).items)) {
      return (data as { items: T[] }).items;
    }
  }
  return [];
}

export function pickId(raw: Record<string, unknown> | null | undefined): string {
  if (!raw) return "";
  return String(raw.id ?? raw._id ?? "");
}

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
