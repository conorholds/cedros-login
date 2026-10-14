import { describe, expect, it, vi } from "vitest";
import type { CedrosLoginConfig, TokenStorageAdapter } from "../../types";
import { TokenManager } from "../../utils/tokenManager";
import { providerTokenStorageKey } from "../../utils/tokenScope";
import {
  createApiServices,
  getAuthApi,
  getOrgsApi,
  initializeApiServices,
} from ".";

vi.mock("react-native", () => ({}));

const config = {
  serverUrl: "https://singleton.example.com",
  features: { email: true },
} as CedrosLoginConfig;

function tokenManager(): TokenManager {
  const storage: TokenStorageAdapter = {
    securityLevel: "secure",
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  };
  return TokenManager.providerScoped(storage, providerTokenStorageKey(config));
}

describe("API service construction", () => {
  it("preserves explicit singleton initialization for legacy consumers", () => {
    const singleton = initializeApiServices({
      config,
      tokenManager: tokenManager(),
    });

    expect(getAuthApi()).toBe(singleton.auth);
    expect(getOrgsApi()).toBe(singleton.orgs);
  });

  it("does not replace the singleton when creating an isolated bundle", () => {
    const singleton = initializeApiServices({
      config,
      tokenManager: tokenManager(),
    });
    const isolated = createApiServices({
      config: { ...config, serverUrl: "https://isolated.example.com" },
      tokenManager: tokenManager(),
    });

    expect(isolated.auth).not.toBe(singleton.auth);
    expect(isolated.orgs).not.toBe(singleton.orgs);
    expect(getAuthApi()).toBe(singleton.auth);
    expect(getOrgsApi()).toBe(singleton.orgs);
  });
});
