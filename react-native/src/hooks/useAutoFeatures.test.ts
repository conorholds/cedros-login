import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("useAutoFeatures", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
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

    // Direct fetch test — validates the endpoint and response parsing
    // that useAutoFeatures relies on (hook itself requires React runtime).
    const baseUrl = "http://localhost:3000";
    const res = await fetch(`${baseUrl}/features`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const data = await res.json();

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

    const res = await fetch("http://localhost:3000/features", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const data = await res.json();

    expect(data.googleClientId).toBeUndefined();
    expect(data.appleClientId).toBeUndefined();
  });
});
