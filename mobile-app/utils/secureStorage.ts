import * as SecureStore from "expo-secure-store";

/** Native (iOS/Android): store auth tokens in the device keychain/keystore. */
export async function setSecureItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function getSecureItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function deleteSecureItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // no-op: item may not exist
  }
}
