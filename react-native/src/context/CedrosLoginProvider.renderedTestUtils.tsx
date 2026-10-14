import React, { act } from "react";
import { vi } from "vitest";
import { createRoot, type Root } from "test-renderer";
import type { TokenPair, TokenStorageAdapter } from "../types";
import { providerTokenStorageKey } from "../utils/tokenScope";
import {
  CedrosLoginProvider,
  type CedrosLoginContextValue,
  type CedrosLoginProviderConfig,
  useCedrosLogin,
} from "./CedrosLoginProvider";

const roots: Root[] = [];

export type TestStorage = TokenStorageAdapter & {
  getItem: ReturnType<typeof vi.fn<TokenStorageAdapter["getItem"]>>;
  setItem: ReturnType<typeof vi.fn<TokenStorageAdapter["setItem"]>>;
  removeItem: ReturnType<typeof vi.fn<TokenStorageAdapter["removeItem"]>>;
};

export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

export function storedTokens(tokens: TokenPair, expiresAt: number): string {
  return JSON.stringify({ tokens, expiresAt });
}

export function storageWith(
  value: string | null | Promise<string | null>,
): TestStorage {
  return {
    securityLevel: "secure",
    getItem: vi.fn(async () => value),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  };
}

export function providerConfig(
  storage: TokenStorageAdapter,
  overrides: Partial<CedrosLoginProviderConfig> = {},
): CedrosLoginProviderConfig {
  return {
    serverUrl: "https://auth.example.com",
    features: {
      email: true,
      google: false,
      apple: false,
      solana: false,
      webauthn: false,
    },
    secureStorage: { adapter: storage },
    compliance: { mode: "off" },
    ...overrides,
  };
}

export function providerTokenKey(storage: TokenStorageAdapter): string {
  return providerTokenStorageKey(providerConfig(storage));
}

export function ContextProbe(): React.ReactElement {
  const value = useCedrosLogin();
  return React.createElement("context-probe", { value });
}

export async function renderProvider(
  config: CedrosLoginProviderConfig,
): Promise<Root> {
  const root = createRoot();
  roots.push(root);
  await act(async () => {
    root.render(
      <CedrosLoginProvider config={config}>
        <ContextProbe />
      </CedrosLoginProvider>,
    );
    await Promise.resolve();
  });
  return root;
}

export function contextValue(root: Root): CedrosLoginContextValue {
  const probes = root.container.queryAll(
    (instance) => instance.type === "context-probe",
  );
  if (probes.length !== 1) throw new Error("Expected one context probe");
  return probes[0].props.value as CedrosLoginContextValue;
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function settle(): Promise<void> {
  await act(async () => {
    for (let index = 0; index < 5; index += 1) await Promise.resolve();
  });
}

export async function cleanupRenderedProviders(): Promise<void> {
  while (roots.length > 0) {
    const root = roots.pop();
    if (!root) continue;
    await act(async () => root.unmount());
  }
}
