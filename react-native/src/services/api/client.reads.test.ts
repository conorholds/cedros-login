import { afterEach, describe, expect, it, vi } from "vitest";
import ApiClient from "./client";

vi.mock("react-native", () => ({
  Platform: { OS: "ios", Version: "test" },
}));

function clientFor(
  getAccessToken: () => string | null = () => null,
): ApiClient {
  return new ApiClient({
    config: { serverUrl: "https://auth.example.com" },
    tokenManager: {
      hydrate: vi.fn(async () => undefined),
      getAccessToken: vi.fn(getAccessToken),
      clear: vi.fn(),
    } as never,
  });
}

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("ApiClient shared reads", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("coalesces simultaneous GET requests and reuses the short-lived result", async () => {
    const client = clientFor();
    const fetchMock = vi.fn(async () => jsonResponse({ value: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    const [first, second] = await Promise.all([
      client.get<{ value: number }>("/auth/orgs"),
      client.get<{ value: number }>("/auth/orgs"),
    ]);
    const third = await client.get<{ value: number }>("/auth/orgs");

    expect([first.data.value, second.data.value, third.data.value]).toEqual([
      1, 1, 1,
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("invalidates cached reads only after a successful mutation", async () => {
    const client = clientFor();
    const fetchMock = vi.fn(
      async (_url: string | URL | Request, options?: RequestInit) =>
        jsonResponse({ method: options?.method }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await client.get("/auth/orgs");
    await client.get("/auth/orgs");
    await client.post("/auth/orgs", { name: "Example" });
    await client.get("/auth/orgs");

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not reuse a cached response after the access token changes", async () => {
    let token = "user-one";
    const client = clientFor(() => token);
    const fetchMock = vi.fn(async () => jsonResponse({ token }));
    vi.stubGlobal("fetch", fetchMock);

    await client.get("/auth/user");
    token = "user-two";
    const second = await client.get<{ token: string }>("/auth/user");

    expect(second.data.token).toBe("user-two");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("bypasses a reusable value for an explicit refresh", async () => {
    const client = clientFor();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ value: 1 }))
      .mockResolvedValueOnce(jsonResponse({ value: 2 }));
    vi.stubGlobal("fetch", fetchMock);

    await client.get("/auth/user");
    const refreshed = await client.get<{ value: number }>(
      "/auth/user",
      undefined,
      {
        forceRefresh: true,
      },
    );

    expect(refreshed.data.value).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("ApiClient cache capacity and deadlines", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("bounds settled reads and expires them while idle", async () => {
    vi.useFakeTimers();
    const client = clientFor();
    const fetchMock = vi.fn(async () => jsonResponse({ value: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    for (let i = 0; i <= 256; i++) await client.get(`/page/${i}`);
    await client.get("/page/256");
    expect(fetchMock).toHaveBeenCalledTimes(257);
    await client.get("/page/0");
    expect(fetchMock).toHaveBeenCalledTimes(258);
    await vi.advanceTimersByTimeAsync(251);
    expect(vi.getTimerCount()).toBe(0);
    await client.get("/page/256");
    expect(fetchMock).toHaveBeenCalledTimes(259);
  });

  it.each([200, 401, 500])(
    "settles stalled JSON bodies at the attempt deadline (%s)",
    async (status) => {
      vi.useFakeTimers();
      const client = clientFor();
      const fetchMock = vi.fn(async () => {
        const response = new Response("{}", {
          status,
          headers: { "content-type": "application/json" },
        });
        vi.spyOn(response, "json").mockImplementation(
          () => new Promise(() => {}),
        );
        return response;
      });
      vi.stubGlobal("fetch", fetchMock);
      const results = Promise.allSettled([
        client.get("/auth/user"),
        client.get("/auth/user"),
      ]);
      await vi.advanceTimersByTimeAsync(10_001);
      for (const result of await results) {
        expect(result.status).toBe("rejected");
        if (result.status === "rejected")
          expect(result.reason).toMatchObject({
            code: "NETWORK_ERROR",
            message: "Request timeout",
          });
      }
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
      fetchMock.mockImplementation(async () => jsonResponse({ value: 2 }));
      await expect(client.get("/auth/user")).resolves.toMatchObject({
        data: { value: 2 },
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    },
  );
});

describe("ApiClient complete response consumption", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("normalizes synchronous transport failures and allows a later read", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new TypeError("fetch unavailable");
      })
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const client = clientFor();
    await expect(client.get("/retry")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      status: 0,
    });
    await expect(client.get("/retry")).resolves.toMatchObject({
      data: { ok: true },
    });
  });

  it("accepts a JSON-labelled 204 without parsing an empty body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(null, {
            status: 204,
            headers: { "content-type": "application/json" },
          }),
      ),
    );
    await expect(clientFor().get("/empty")).resolves.toMatchObject({
      status: 204,
      data: null,
    });
  });

  it("bounds discarded non-JSON error bodies", async () => {
    vi.useFakeTimers();
    const response = new Response("error", {
      status: 502,
      headers: { "content-type": "text/html" },
    });
    vi.spyOn(response, "text").mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response),
    );
    const result = clientFor().get("/html");
    const settled = expect(result).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      message: "Request timeout",
    });
    await vi.advanceTimersByTimeAsync(10001);
    await settled;
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not retain a failed parse and allows a subsequent successful request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("{", { headers: { "content-type": "application/json" } }),
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const client = clientFor();
    await expect(client.get("/invalid")).rejects.toBeInstanceOf(SyntaxError);
    await expect(client.get("/invalid")).resolves.toMatchObject({
      data: { ok: true },
    });
  });
});
