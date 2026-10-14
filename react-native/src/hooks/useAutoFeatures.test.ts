import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { clearAutoFeaturesCache, loadAutoFeatures } from "./useAutoFeatures";
import { parseSignupAvailability } from "../utils/signupAvailability";

vi.mock("react-native", () => ({
  AppState: {
    currentState: "active",
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
}));

describe("useAutoFeatures", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    clearAutoFeaturesCache();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("fetches /features and parses client IDs", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        email: true,
        google: true,
        apple: true,
        solana: false,
        webauthn: false,
        instantLink: false,
        googleClientId: "goog-123.apps.googleusercontent.com",
        appleClientId: "com.example.auth",
      }),
    });

    const data = await loadAutoFeatures("http://localhost:3000");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/features",
      expect.objectContaining({ method: "GET" }),
    );
    expect(data.googleClientId).toBe("goog-123.apps.googleusercontent.com");
    expect(data.appleClientId).toBe("com.example.auth");
    expect(data.email).toBe(true);
    expect(data.solana).toBe(false);
  });

  it("handles missing client IDs in server response", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        email: true,
        google: false,
        apple: false,
        solana: false,
        webauthn: false,
        instantLink: false,
      }),
    });

    const data = await loadAutoFeatures("http://localhost:3000");

    expect(data.googleClientId).toBeUndefined();
    expect(data.appleClientId).toBeUndefined();
  });

  it("validates signup availability from the public boundary", () => {
    expect(
      parseSignupAvailability({
        remaining: 12,
        limit: 100,
        period: "monthly",
        resetsAt: "2099-10-01T00:00:00Z",
      }),
    ).toEqual({
      remaining: 12,
      limit: 100,
      period: "monthly",
      resetsAt: "2099-10-01T00:00:00Z",
    });
    expect(
      parseSignupAvailability({
        remaining: 101,
        limit: 100,
        period: "monthly",
        resetsAt: "2099-10-01T00:00:00Z",
      }),
    ).toBeUndefined();
    expect(
      parseSignupAvailability({
        remaining: 12,
        limit: 100,
        period: "monthly",
        resetsAt: "2020-10-01T00:00:00Z",
      }),
    ).toBeUndefined();
  });

  it("coalesces simultaneous feature reads and reuses the short-lived cache", async () => {
    let resolve!: (value: unknown) => void;
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );

    const first = loadAutoFeatures("http://localhost:3000/");
    const second = loadAutoFeatures("http://localhost:3000");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    resolve({ ok: true, json: async () => ({ email: true }) });

    await expect(Promise.all([first, second])).resolves.toEqual([
      { email: true },
      { email: true },
    ]);
    await loadAutoFeatures("http://localhost:3000");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("bypasses a cached snapshot for an explicit refresh", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ email: true }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ email: false }),
      });

    await expect(loadAutoFeatures("http://localhost:3000")).resolves.toEqual({
      email: true,
    });
    await expect(
      loadAutoFeatures("http://localhost:3000", 5_000, true),
    ).resolves.toEqual({
      email: false,
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });
});
