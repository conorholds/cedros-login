export interface BiometricsAvailability {
  available: boolean;
  biometryType?: string;
  error?: string;
}

export interface BiometricsPromptOptions {
  reason?: string;
  fallbackPromptMessage?: string;
  cancelButtonText?: string;
}

interface NativeBiometricsPromptResult {
  success: boolean;
  error?: string;
}

interface NativeBiometricsClient {
  isSensorAvailable(): Promise<BiometricsAvailability>;
  simplePrompt(options: {
    promptMessage: string;
    fallbackPromptMessage?: string;
    cancelButtonText?: string;
  }): Promise<NativeBiometricsPromptResult>;
}

type NativeBiometricsConstructor = new () => NativeBiometricsClient;

let injectedClient: NativeBiometricsClient | null | undefined;
let cachedClient: NativeBiometricsClient | null | undefined;

function resolveNativeBiometrics(): NativeBiometricsClient | null {
  if (injectedClient !== undefined) return injectedClient;
  if (cachedClient !== undefined) return cachedClient;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("react-native-biometrics") as {
      default?: NativeBiometricsConstructor;
    } & NativeBiometricsConstructor;
    const Client = mod.default ?? mod;
    cachedClient = typeof Client === "function" ? new Client() : null;
  } catch {
    cachedClient = null;
  }

  return cachedClient;
}

export function _setBiometricsClientForTests(
  client: NativeBiometricsClient | null,
): void {
  injectedClient = client;
  cachedClient = undefined;
}

export function _resetBiometricsClientForTests(): void {
  injectedClient = undefined;
  cachedClient = undefined;
}

export const biometrics = {
  async getAvailability(): Promise<BiometricsAvailability> {
    const client = resolveNativeBiometrics();
    if (!client) {
      return {
        available: false,
        error: "react-native-biometrics is not installed or linked",
      };
    }

    try {
      return await client.isSensorAvailable();
    } catch (error) {
      return {
        available: false,
        error:
          error instanceof Error
            ? error.message
            : "Biometric availability check failed",
      };
    }
  },

  async isAvailable(): Promise<boolean> {
    const availability = await this.getAvailability();
    return availability.available;
  },

  async authenticate(
    options: BiometricsPromptOptions | string = {},
  ): Promise<boolean> {
    const client = resolveNativeBiometrics();
    if (!client) return false;

    const promptOptions =
      typeof options === "string" ? { reason: options } : options;

    try {
      const result = await client.simplePrompt({
        promptMessage: promptOptions.reason ?? "Confirm your identity",
        fallbackPromptMessage: promptOptions.fallbackPromptMessage,
        cancelButtonText: promptOptions.cancelButtonText ?? "Cancel",
      });
      return result.success;
    } catch {
      return false;
    }
  },
};
