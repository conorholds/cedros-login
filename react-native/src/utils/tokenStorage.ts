import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  SecureStorageConfig,
  TokenStorageAdapter,
} from "../types";

const TOKEN_STORAGE_PREFIX = "cedros_secure_";
const DEFAULT_SERVICE = "cedros.login";

type KeychainModule = {
  ACCESSIBLE?: {
    WHEN_UNLOCKED?: string;
    WHEN_UNLOCKED_THIS_DEVICE_ONLY?: string;
  };
  getGenericPassword: (options: { service: string }) => Promise<
    | false
    | {
        username: string;
        password: string;
      }
  >;
  setGenericPassword: (
    username: string,
    password: string,
    options: { service: string; accessible?: string },
  ) => Promise<unknown>;
  resetGenericPassword: (options: { service: string }) => Promise<boolean>;
};

function isDevelopment(): boolean {
  return typeof __DEV__ !== "undefined" ? __DEV__ : false;
}

function getServiceName(baseService: string, key: string): string {
  return `${baseService}.${key}`;
}

function getKeychainModule(): KeychainModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("react-native-keychain") as KeychainModule;
  } catch {
    return null;
  }
}

export function createAsyncStorageTokenStorage(): TokenStorageAdapter {
  return {
    securityLevel: "insecure",
    async getItem(key: string): Promise<string | null> {
      return AsyncStorage.getItem(`${TOKEN_STORAGE_PREFIX}${key}`);
    },
    async setItem(key: string, value: string): Promise<void> {
      await AsyncStorage.setItem(`${TOKEN_STORAGE_PREFIX}${key}`, value);
    },
    async removeItem(key: string): Promise<void> {
      await AsyncStorage.removeItem(`${TOKEN_STORAGE_PREFIX}${key}`);
    },
  };
}

export function createKeychainTokenStorage(
  service = DEFAULT_SERVICE,
): TokenStorageAdapter | null {
  const keychain = getKeychainModule();
  if (!keychain) {
    return null;
  }

  const accessible =
    keychain.ACCESSIBLE?.WHEN_UNLOCKED_THIS_DEVICE_ONLY ??
    keychain.ACCESSIBLE?.WHEN_UNLOCKED;

  return {
    securityLevel: "secure",
    async getItem(key: string): Promise<string | null> {
      const credentials = await keychain.getGenericPassword({
        service: getServiceName(service, key),
      });
      return credentials ? credentials.password : null;
    },
    async setItem(key: string, value: string): Promise<void> {
      await keychain.setGenericPassword("cedros", value, {
        service: getServiceName(service, key),
        accessible,
      });
    },
    async removeItem(key: string): Promise<void> {
      await keychain.resetGenericPassword({
        service: getServiceName(service, key),
      });
    },
  };
}

export function resolveTokenStorageAdapter(
  config?: SecureStorageConfig,
): TokenStorageAdapter {
  if (config?.adapter) {
    return config.adapter;
  }

  const secureAdapter = createKeychainTokenStorage(config?.service);
  if (secureAdapter) {
    return secureAdapter;
  }

  if (config?.allowInsecureStorage || isDevelopment()) {
    console.warn(
      "[Cedros Login] Secure token storage is unavailable. Falling back to AsyncStorage. Install react-native-keychain or provide config.secureStorage.adapter before publishing.",
    );
    return createAsyncStorageTokenStorage();
  }

  throw new Error(
    "Secure token storage is required. Install react-native-keychain or provide config.secureStorage.adapter.",
  );
}
