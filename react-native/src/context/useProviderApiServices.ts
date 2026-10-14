import { useMemo } from "react";
import { createApiServices, type ApiServices } from "../services/api";
import type { CedrosLoginConfig } from "../types";
import {
  resolveTokenStorageAdapter,
  validatePublishableAuthCompliance,
} from "../utils";
import { TokenManager } from "../utils/tokenManager";
import { providerTokenStorageKey } from "../utils/tokenScope";

/** Create one render-safe API/token bundle for a provider configuration. */
export function useProviderApiServices(
  config: CedrosLoginConfig,
  ready: boolean,
): ApiServices | null {
  const secureStorage = config.secureStorage;
  const storage = useMemo(
    () =>
      resolveTokenStorageAdapter({
        adapter: secureStorage?.adapter,
        service: secureStorage?.service,
        allowInsecureStorage: secureStorage?.allowInsecureStorage,
      }),
    [
      secureStorage?.adapter,
      secureStorage?.allowInsecureStorage,
      secureStorage?.service,
    ],
  );
  if (ready) validatePublishableAuthCompliance(config, storage);

  return useMemo(
    () =>
      ready
        ? createApiServices({
            config,
            tokenManager: TokenManager.providerScoped(
              storage,
              providerTokenStorageKey(config),
              secureStorage?.importLegacyTokens === true,
            ),
          })
        : null,
    [config, ready, secureStorage?.importLegacyTokens, storage],
  );
}
