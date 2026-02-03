/**
 * AsyncStorage wrapper for React Native
 *
 * Replaces localStorage/sessionStorage for mobile environments.
 * Provides a consistent API for persistent storage.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_PREFIX = "cedros_";

/**
 * Get item from AsyncStorage
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    return null;
  }
}

/**
 * Set item in AsyncStorage
 */
export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
  } catch {
    // Silently fail - storage errors shouldn't break auth flow
  }
}

/**
 * Remove item from AsyncStorage
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // Silently fail
  }
}

/**
 * Clear all cedros-related items from AsyncStorage
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
  } catch {
    // Silently fail
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
