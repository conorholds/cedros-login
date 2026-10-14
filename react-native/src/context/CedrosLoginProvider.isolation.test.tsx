import React, { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "test-renderer";
import { useEmailAuth, type UseEmailAuthReturn } from "../hooks/useEmailAuth";
import type { TokenPair, TokenStorageAdapter } from "../types";
import { providerTokenStorageKey } from "../utils/tokenScope";
import {
  CedrosLoginProvider,
  type CedrosLoginContextValue,
  type CedrosLoginProviderConfig,
  useCedrosLogin,
} from "./CedrosLoginProvider";

vi.mock("react-native", () => ({
  Platform: { OS: "ios", Version: "test" },
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const roots: Root[] = [];

type TestStorage = TokenStorageAdapter & {
  setItem: ReturnType<typeof vi.fn<TokenStorageAdapter["setItem"]>>;
  removeItem: ReturnType<typeof vi.fn<TokenStorageAdapter["removeItem"]>>;
};

interface ProbeValue {
  session: CedrosLoginContextValue;
  email: UseEmailAuthReturn;
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

function storedTokens(label: string): string {
  const tokens: TokenPair = {
    accessToken: `${label}-access`,
    refreshToken: `${label}-refresh`,
    expiresIn: 3_600,
  };
  return JSON.stringify({ tokens, expiresAt: Date.now() + 3_600_000 });
}

function storageWith(value: string | null): TestStorage {
  return {
    securityLevel: "secure",
    getItem: vi.fn(async () => value),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  };
}

function delayedStorage(value: Promise<string | null>): TestStorage {
  return {
    securityLevel: "secure",
    getItem: vi.fn(() => value),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  };
}

function sharedStorage(store: Map<string, string>): TestStorage {
  return {
    securityLevel: "secure",
    getItem: vi.fn(async (key) => store.get(key) ?? null),
    setItem: vi.fn(async (key, value) => {
      store.set(key, value);
    }),
    removeItem: vi.fn(async (key) => {
      store.delete(key);
    }),
  };
}

function config(
  label: string,
  storage: TokenStorageAdapter,
  onLogout = vi.fn(),
): CedrosLoginProviderConfig {
  return {
    serverUrl: `https://${label}.example.com`,
    features: { email: true },
    secureStorage: { adapter: storage },
    compliance: { mode: "off" },
    callbacks: { onLogout },
  };
}

function Probe({ id }: { id: string }): React.ReactElement {
  const session = useCedrosLogin();
  const email = useEmailAuth();
  return React.createElement("provider-probe", {
    id,
    value: { session, email },
  });
}

function Providers({
  first,
  second,
}: {
  first?: CedrosLoginProviderConfig;
  second: CedrosLoginProviderConfig;
}): React.ReactElement {
  return (
    <>
      {first ? (
        <CedrosLoginProvider config={first}>
          <Probe id="first" />
        </CedrosLoginProvider>
      ) : null}
      <CedrosLoginProvider config={second}>
        <Probe id="second" />
      </CedrosLoginProvider>
    </>
  );
}

function probe(root: Root, id: string): ProbeValue {
  const found = root.container.queryAll(
    (instance) =>
      instance.type === "provider-probe" && instance.props.id === id,
  );
  if (found.length !== 1) throw new Error(`Expected provider probe ${id}`);
  return found[0].props.value as ProbeValue;
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function settle(): Promise<void> {
  await act(async () => {
    for (let index = 0; index < 5; index += 1) await Promise.resolve();
  });
}

async function renderProviders(
  first: CedrosLoginProviderConfig,
  second: CedrosLoginProviderConfig,
): Promise<Root> {
  const root = createRoot();
  roots.push(root);
  await act(async () => {
    root.render(<Providers first={first} second={second} />);
    await Promise.resolve();
  });
  await settle();
  return root;
}

afterEach(async () => {
  while (roots.length > 0) {
    const root = roots.pop();
    if (root) await act(async () => root.unmount());
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("CedrosLoginProvider client isolation", () => {
  it("keeps refresh requests and session state scoped to each provider", async () => {
    const firstStorage = storageWith(storedTokens("first"));
    const secondStorage = storageWith(storedTokens("second"));
    const requests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request) => {
        const target = String(url);
        requests.push(target);
        const label = target.includes("first.example.com") ? "first" : "second";
        return jsonResponse(200, {
          user: { id: `${label}-user`, email: `${label}@example.com` },
        });
      }),
    );

    const root = await renderProviders(
      config("first", firstStorage),
      config("second", secondStorage),
    );
    requests.length = 0;

    await act(async () => probe(root, "first").session.refreshUser());
    await act(async () => probe(root, "second").session.refreshUser());

    expect(requests).toEqual([
      "https://first.example.com/auth/user",
      "https://second.example.com/auth/user",
    ]);
    expect(probe(root, "first").session.user?.id).toBe("first-user");
    expect(probe(root, "second").session.user?.id).toBe("second-user");
  });

  it("keeps sign-in, token persistence, logout, and callbacks scoped", async () => {
    const store = new Map<string, string>();
    const firstStorage = sharedStorage(store);
    const secondStorage = sharedStorage(store);
    const firstLogout = vi.fn();
    const secondLogout = vi.fn();
    const requests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request) => {
        const target = String(url);
        requests.push(target);
        if (target.endsWith("/auth/login")) {
          return jsonResponse(200, {
            user: { id: "first-login", email: "login@example.com" },
            tokens: {
              accessToken: "login-access",
              refreshToken: "login-refresh",
              expiresIn: 3_600,
            },
          });
        }
        return jsonResponse(200, {});
      }),
    );
    const firstConfig = config("first", firstStorage, firstLogout);
    const secondConfig = config("second", secondStorage, secondLogout);
    const firstKey = providerTokenStorageKey(firstConfig);
    const secondKey = providerTokenStorageKey(secondConfig);
    const root = await renderProviders(firstConfig, secondConfig);

    await act(async () => {
      await probe(root, "first").email.login("login@example.com", "password");
    });
    expect(store.get(firstKey)).toContain('"accessToken":"login-access"');
    expect(store.has(secondKey)).toBe(false);
    await act(async () => probe(root, "first").session.logout());

    expect(requests).toEqual([
      "https://first.example.com/auth/login",
      "https://first.example.com/auth/logout",
    ]);
    expect(firstStorage.setItem).toHaveBeenCalledWith(
      firstKey,
      expect.stringContaining('"accessToken":"login-access"'),
    );
    expect(firstStorage.removeItem).toHaveBeenCalledWith(firstKey);
    expect(secondStorage.setItem).not.toHaveBeenCalled();
    expect(secondStorage.removeItem).not.toHaveBeenCalled();
    expect(firstLogout).toHaveBeenCalledTimes(1);
    expect(secondLogout).not.toHaveBeenCalled();
  });

  it("does not let an unmounted provider redirect or clear its sibling", async () => {
    const firstStorage = storageWith(storedTokens("first"));
    const secondStorage = storageWith(storedTokens("second"));
    const secondLogout = vi.fn();
    const requests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request) => {
        const target = String(url);
        requests.push(target);
        const label = target.includes("first.example.com") ? "first" : "second";
        return jsonResponse(200, {
          user: { id: `${label}-user`, email: `${label}@example.com` },
        });
      }),
    );
    const secondConfig = config("second", secondStorage, secondLogout);
    const secondKey = providerTokenStorageKey(secondConfig);
    const root = await renderProviders(
      config("first", firstStorage),
      secondConfig,
    );

    await act(async () => root.render(<Providers second={secondConfig} />));
    requests.length = 0;
    await act(async () => probe(root, "second").session.refreshUser());
    await act(async () => probe(root, "second").session.logout());

    expect(requests).toEqual([
      "https://second.example.com/auth/user",
      "https://second.example.com/auth/logout",
    ]);
    expect(firstStorage.removeItem).not.toHaveBeenCalled();
    expect(secondStorage.removeItem).toHaveBeenCalledWith(secondKey);
    expect(secondLogout).toHaveBeenCalledTimes(1);
  });

  it("ignores stale hydration after one provider is reconfigured", async () => {
    const staleRead = deferred<string | null>();
    const staleStorage = delayedStorage(staleRead.promise);
    const replacementStorage = storageWith(storedTokens("replacement"));
    const secondStorage = storageWith(storedTokens("second"));
    const secondConfig = config("second", secondStorage);
    const requests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request) => {
        const target = String(url);
        requests.push(target);
        const label = target.includes("replacement.example.com")
          ? "replacement"
          : "second";
        return jsonResponse(200, {
          user: { id: `${label}-user`, email: `${label}@example.com` },
        });
      }),
    );
    const root = await renderProviders(
      config("stale", staleStorage),
      secondConfig,
    );

    await act(async () => {
      root.render(
        <Providers
          first={config("replacement", replacementStorage)}
          second={secondConfig}
        />,
      );
      await Promise.resolve();
    });
    await settle();
    staleRead.resolve(storedTokens("stale"));
    await settle();

    expect(requests).toEqual([
      "https://second.example.com/auth/user",
      "https://replacement.example.com/auth/user",
    ]);
    expect(probe(root, "first").session.user?.id).toBe("replacement-user");
    expect(probe(root, "second").session.user?.id).toBe("second-user");
    expect(staleStorage.setItem).not.toHaveBeenCalled();
    expect(staleStorage.removeItem).not.toHaveBeenCalled();
  });
});
