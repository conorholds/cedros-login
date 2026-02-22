/**
 * AsyncStorage wrapper for React Native
 *
 * Replaces localStorage/sessionStorage for mobile environments.
 * Provides a consistent API for persistent storage.
 *
 * Error contract:
 *   - getItem returns null only when the key is absent; throws on storage error.
 *   - setItem / removeItem / clearAll throw on storage error.
 *   Callers must not treat a thrown error as "not found".
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_PREFIX = "cedros_";

/**
 * Get item from AsyncStorage.
 * Returns null when the key does not exist.
 * Throws if the underlying storage operation fails.
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
  } catch (err) {
    console.warn(`[Cedros Storage] getItem failed for key "${key}":`, err);
    throw err;
  }
}

/**
 * Set item in AsyncStorage.
 * Throws if the underlying storage operation fails.
 */
export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
  } catch (err) {
    console.warn(`[Cedros Storage] setItem failed for key "${key}":`, err);
    throw err;
  }
}

/**
 * Remove item from AsyncStorage.
 * Throws if the underlying storage operation fails.
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (err) {
    console.warn(`[Cedros Storage] removeItem failed for key "${key}":`, err);
    throw err;
  }
}

/**
 * Clear all cedros-related items from AsyncStorage.
 * Throws if the underlying storage operation fails.
 */
export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cedrosKeys = keys.filter((key: string) =>
      key.startsWith(STORAGE_PREFIX),
    );
    if (cedrosKeys.length > 0) {
      await AsyncStorage.multiRemove(cedrosKeys);
    }
  } catch (err) {
    console.warn("[Cedros Storage] clearAll failed:", err);
    throw err;
  }
}

/**
 * Safe wrapper that handles private browsing mode and quota errors
 */
export const storage = {
  getItem,
  setItem,
  removeItem,
  clearAll,
};

export default storage;
