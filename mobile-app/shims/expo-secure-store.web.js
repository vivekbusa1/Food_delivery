/**
 * Web shim for expo-secure-store.
 * The real package exports an empty native module on web, which crashes
 * when setItemAsync / getItemAsync are called after login.
 */
const memory = new Map();

function storageKey(key) {
  return `expo-secure-store:${key}`;
}

export async function isAvailableAsync() {
  return true;
}

export async function setItemAsync(key, value) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(storageKey(key), value);
  } else {
    memory.set(key, value);
  }
}

export async function getItemAsync(key) {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem(storageKey(key));
  }
  return memory.has(key) ? memory.get(key) : null;
}

export async function deleteItemAsync(key) {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(storageKey(key));
  } else {
    memory.delete(key);
  }
}

export const AFTER_FIRST_UNLOCK = 0;
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 1;
export const ALWAYS = 2;
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 3;
export const ALWAYS_THIS_DEVICE_ONLY = 4;
export const WHEN_UNLOCKED = 5;
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 6;

export default {
  isAvailableAsync,
  setItemAsync,
  getItemAsync,
  deleteItemAsync,
};
