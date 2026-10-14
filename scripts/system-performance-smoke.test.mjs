import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import {
  readConfig,
  runSmoke,
  summarize,
} from "./system-performance-smoke.mjs";

async function fixture(run, handler) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
const config = (url, extra = {}) =>
  readConfig({
    PERF_BASE_URL: url,
    PERF_ITERATIONS: "1",
    PERF_WARMUP: "1",
    PERF_P95_BUDGET_MS: "5000",
    ...extra,
  });
const json = (res, value, status = 200) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(value));
};

test("configuration rejects zero, fractional, malformed and excessive loads", () => {
  for (const value of ["0", "-1", "2tail", "1.5", "100000000"]) {
    assert.throws(() => readConfig({ PERF_ITERATIONS: value }));
    assert.throws(() => readConfig({ PERF_CONCURRENCY: value }));
  }
  assert.throws(() => readConfig({ PERF_SCENARIOS: "public,unknown" }));
  assert.throws(() =>
    readConfig({ PERF_BASE_URL: "http://secret@example.test" }),
  );
});

test("401 and empty measurements cannot pass", () => {
  assert.equal(
    summarize(
      "user",
      [
        {
          status: 401,
          responseBytes: 1,
          responseBudgetBytes: 100,
          latencyMs: 1,
        },
      ],
      500,
    ).pass,
    false,
  );
  assert.equal(summarize("user", [], 500).pass, false);
});

test("missing authenticated credentials fail without creating an admin", async () => {
  let calls = 0;
  await fixture(
    async (url) => {
      const result = await runSmoke(
        config(url, { PERF_SCENARIOS: "authenticated" }),
      );
      assert.equal(result.pass, false);
      assert.equal(result.failures[0].phase, "setup");
      assert.equal(calls, 0);
    },
    (_req, res) => {
      calls++;
      json(res, {});
    },
  );
});

for (const mode of ["cookie", "token"]) {
  test(`${mode} authentication measures all required endpoints and redacts session material`, async () => {
    let authenticated = 0;
    await fixture(
      async (url) => {
        const result = await runSmoke(
          config(url, {
            PERF_SCENARIOS: "authenticated",
            PERF_ADMIN_EMAIL: "fixture@example.test",
            PERF_ADMIN_PASSWORD: "fixture-password",
          }),
        );
        assert.equal(result.pass, true);
        assert.equal(result.summaries.length, 4);
        assert.equal(result.samples.length, 20);
        assert.equal(authenticated, 24);
        assert.equal(JSON.stringify(result).includes("private-session"), false);
        assert.equal(
          JSON.stringify(result).includes("fixture-password"),
          false,
        );
      },
      (req, res) => {
        if (req.url === "/auth/login") {
          if (mode === "cookie")
            res.setHeader("set-cookie", [
              "cedros_access=private-session; HttpOnly; Path=/auth",
              "XSRF-TOKEN=csrf-value; Path=/",
            ]);
          json(res, {
            user: { id: "fixture" },
            ...(mode === "token"
              ? { tokens: { accessToken: "private-session" } }
              : {}),
          });
          return;
        }
        assert.equal(
          mode === "cookie"
            ? req.headers.cookie.includes("cedros_access=private-session")
            : req.headers.authorization === "Bearer private-session",
          true,
        );
        authenticated++;
        if (req.url === "/auth/user") json(res, { user: { id: "fixture" } });
        else if (req.url === "/auth/orgs") json(res, { orgs: [], total: 0 });
        else if (req.url === "/auth/admin/users/stats") json(res, { total: 1 });
        else json(res, { users: [], total: 1 });
      },
    );
  });
}

test("MFA challenge is not mistaken for a login session", async () => {
  await fixture(
    async (url) => {
      const result = await runSmoke(
        config(url, {
          PERF_SCENARIOS: "authenticated",
          PERF_ADMIN_EMAIL: "fixture@example.test",
          PERF_ADMIN_PASSWORD: "fixture",
        }),
      );
      assert.equal(result.pass, false);
      assert.equal(result.samples.length, 0);
    },
    (_req, res) => json(res, { mfaRequired: true, challengeId: "challenge" }),
  );
});

test("headers-first stalled bodies time out and required endpoints fail", async () => {
  await fixture(
    async (url) => {
      const result = await runSmoke(
        config(url, { PERF_SCENARIOS: "public", PERF_TIMEOUT_MS: "20" }),
      );
      assert.equal(result.pass, false);
      assert.equal(result.failures.length, 3);
      assert.ok(
        result.failures.every((failure) => failure.cause === "timeout"),
      );
    },
    (_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.write("{");
    },
  );
});

test("explicit public mode reports omitted scenarios, separating warmup from samples", async () => {
  await fixture(
    async (url) => {
      const result = await runSmoke(config(url, { PERF_SCENARIOS: "public" }));
      assert.equal(result.pass, true);
      assert.deepEqual(result.omitted_scenarios, [
        "generated",
        "authenticated",
      ]);
      assert.equal(result.samples.length, 3);
      assert.equal(result.capacity_test, false);
    },
    (req, res) =>
      json(
        res,
        req.url === "/setup/status"
          ? { needsSetup: false }
          : { status: "healthy" },
      ),
  );
});
