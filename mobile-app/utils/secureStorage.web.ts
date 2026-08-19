/** Web token storage — localStorage (expo-secure-store is unavailable in browsers). */

function read(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  globalThis.localStorage?.setItem(key, value);
}

function remove(key: string): void {
  globalThis.localStorage?.removeItem(key);
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  write(key, value);
}

export async function getSecureItem(key: string): Promise<string | null> {
  return read(key);
}

export async function deleteSecureItem(key: string): Promise<void> {
  remove(key);
}
