#!/usr/bin/env node
import { pathToFileURL } from "node:url";

function positive(env, key, fallback, max = 1_000_000) {
  const raw = env[key] ?? String(fallback);
  const value = Number(raw);
  if (
    !/^\d+$/.test(raw) ||
    !Number.isSafeInteger(value) ||
    value < 1 ||
    value > max
  ) {
    throw new Error(`${key} must be an integer between 1 and ${max}`);
  }
  return value;
}

export function readConfig(env = process.env) {
  const url = new URL(env.PERF_BASE_URL || "http://127.0.0.1:8080");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "PERF_BASE_URL must be an HTTP origin/path without credentials, query or fragment",
    );
  }
  const scenarios = (
    env.PERF_SCENARIOS || "public,generated,authenticated"
  ).split(",");
  if (
    !scenarios.length ||
    new Set(scenarios).size !== scenarios.length ||
    scenarios.some((s) => !["public", "generated", "authenticated"].includes(s))
  ) {
    throw new Error(
      "PERF_SCENARIOS must select public,generated,authenticated without duplicates",
    );
  }
  const authBasePath = env.PERF_AUTH_BASE_PATH || "/auth";
  if (!authBasePath.startsWith("/") || /[?#]/.test(authBasePath))
    throw new Error("Invalid PERF_AUTH_BASE_PATH");
  if (env.PERF_SETUP_ADMIN && env.PERF_SETUP_ADMIN !== "1")
    throw new Error("PERF_SETUP_ADMIN must be 1 or omitted");
  return {
    baseUrl: url.toString().replace(/\/$/, ""),
    authBasePath,
    scenarios,
    iterations: positive(env, "PERF_ITERATIONS", 20, 10_000),
    concurrency: positive(env, "PERF_CONCURRENCY", 4, 128),
    timeoutMs: positive(env, "PERF_TIMEOUT_MS", 3000),
    p95BudgetMs: positive(env, "PERF_P95_BUDGET_MS", 500),
    responseBudgetBytes: positive(
      env,
      "PERF_RESPONSE_BUDGET_BYTES",
      262144,
      16_777_216,
    ),
    generatedResponseBudgetBytes: positive(
      env,
      "PERF_GENERATED_RESPONSE_BUDGET_BYTES",
      1048576,
      16_777_216,
    ),
    warmup: positive(env, "PERF_WARMUP", 2, 100),
    setupAdmin: env.PERF_SETUP_ADMIN === "1",
    email: env.PERF_ADMIN_EMAIL,
    password: env.PERF_ADMIN_PASSWORD,
  };
}

export function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length
    ? sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)]
    : 0;
}

export function summarize(name, rows, budgetMs) {
  const latencies = rows.map((row) => row.latencyMs);
  const errors = rows.filter(
    (row) =>
      row.error ||
      row.status !== 200 ||
      row.responseBytes > row.responseBudgetBytes,
  ).length;
  const p95 = percentile(latencies, 95);
  return {
    name,
    count: rows.length,
    errors,
    p50_ms: percentile(latencies, 50),
    p95_ms: p95,
    p99_ms: percentile(latencies, 99),
    error_rate: rows.length ? errors / rows.length : 1,
    max_response_bytes: Math.max(0, ...rows.map((row) => row.responseBytes)),
    budget_ms: budgetMs,
    pass: rows.length > 0 && errors === 0 && p95 <= budgetMs,
  };
}

export async function runSmoke(config) {
  const samples = [],
    setup = [],
    failures = [];
  const cookies = new Map();
  let token;
  async function request(name, path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
    const started = performance.now();
    const budget = options.generated
      ? config.generatedResponseBudgetBytes
      : config.responseBudgetBytes;
    const row = {
      name,
      status: 0,
      latencyMs: 0,
      responseBytes: 0,
      responseBudgetBytes: budget,
      error: null,
    };
    let json,
      text = "";
    try {
      const headers = {};
      if (options.auth && token) headers.authorization = `Bearer ${token}`;
      if (options.auth || options.session) {
        if (cookies.size)
          headers.cookie = [...cookies]
            .map(([key, value]) => `${key}=${value}`)
            .join("; ");
        const csrf = cookies.get("XSRF-TOKEN");
        if (csrf) headers["X-CSRF-Token"] = decodeURIComponent(csrf);
      }
      if (options.json) headers["content-type"] = "application/json";
      const response = await fetch(`${config.baseUrl}${path}`, {
        method: options.json ? "POST" : "GET",
        headers,
        body: options.json ? JSON.stringify(options.json) : undefined,
        signal: controller.signal,
        redirect: "error",
      });
      row.status = response.status;
      if (options.session) {
        for (const cookie of response.headers.getSetCookie()) {
          const pair = cookie.split(";", 1)[0];
          const at = pair.indexOf("=");
          if (at > 0) {
            const key = pair.slice(0, at),
              value = pair.slice(at + 1);
            if (!value || /max-age=0(?:;|$)/i.test(cookie)) cookies.delete(key);
            else cookies.set(key, value);
          }
        }
      }
      const reader = response.body?.getReader();
      const chunks = [];
      if (reader) {
        try {
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            row.responseBytes += chunk.value.byteLength;
            if (row.responseBytes > budget) {
              controller.abort();
              row.error = "response_size";
              break;
            }
            chunks.push(chunk.value);
          }
        } finally {
          reader.releaseLock();
        }
      }
      text = Buffer.concat(chunks).toString("utf8");
      try {
        json = JSON.parse(text);
      } catch {
        /* Text scenarios validate text below. */
      }
      if (!row.error && !(options.expected ?? [200]).includes(row.status))
        row.error = "unexpected_status";
      if (!row.error && options.validate && !options.validate(json, text))
        row.error = "response_shape";
    } catch (error) {
      row.error = error?.name === "AbortError" ? "timeout" : "network_error";
    } finally {
      clearTimeout(timeout);
      row.latencyMs = performance.now() - started;
    }
    return { row, json };
  }

  async function measure(name, path, count, options) {
    for (let i = 0; i < config.warmup; i++) {
      const { row } = await request(name, path, options);
      if (row.error) {
        failures.push({ name, phase: "warmup", cause: row.error });
        return;
      }
    }
    let next = 0;
    await Promise.all(
      Array.from({ length: Math.min(config.concurrency, count) }, async () => {
        while (next++ < count)
          samples.push((await request(name, path, options)).row);
      }),
    );
  }
  const base = config.authBasePath;
  if (config.scenarios.includes("public")) {
    for (const path of ["/health", "/ready"])
      await measure(`GET ${path}`, path, config.iterations, {
        validate: (j) => j?.status === "healthy",
      });
    await measure("GET /setup/status", "/setup/status", config.iterations, {
      validate: (j) => typeof j?.needsSetup === "boolean",
    });
  }
  if (config.scenarios.includes("generated")) {
    const checks = [
      ["discovery", (j) => Array.isArray(j?.authMethods)],
      [
        "openapi.json",
        (j) => typeof j?.openapi === "string" && typeof j?.paths === "object",
      ],
      [
        "ai.txt",
        (_j, text) => text.length > 20 && !text.trimStart().startsWith("<"),
      ],
      [
        "llms.txt",
        (_j, text) => text.length > 20 && !text.trimStart().startsWith("<"),
      ],
      [
        "skill.json",
        (j) => j !== null && typeof j === "object" && Object.keys(j).length > 0,
      ],
    ];
    for (const [path, validate] of checks)
      await measure(`GET ${base}/${path}`, `${base}/${path}`, 1, {
        generated: true,
        validate,
      });
  }
  if (config.scenarios.includes("authenticated")) {
    let reason;
    if (!config.email || !config.password)
      reason = "PERF_ADMIN_EMAIL and PERF_ADMIN_PASSWORD are required";
    if (!reason && config.setupAdmin) {
      const probe = await request("setup probe", "/setup/status", {
        validate: (j) => typeof j?.needsSetup === "boolean",
        session: true,
      });
      setup.push(probe.row);
      if (probe.row.error) reason = "setup probe failed";
      else if (probe.json.needsSetup) {
        const result = await request("setup admin", "/setup/admin", {
          session: true,
          expected: [200, 201],
          json: {
            email: config.email,
            password: config.password,
            name: "Performance Admin",
            orgName: "Performance Smoke Org",
          },
        });
        setup.push(result.row);
        if (result.row.error) reason = "admin fixture setup failed";
      }
    }
    if (!reason) {
      const login = await request("login", `${base}/login`, {
        session: true,
        json: { email: config.email, password: config.password },
        validate: (j) => typeof j?.user?.id === "string" && !j?.mfaRequired,
      });
      setup.push(login.row);
      token = login.json?.tokens?.accessToken;
      if (login.row.error || (!token && !cookies.size))
        reason = "login did not establish a session";
    }
    if (reason)
      failures.push({ name: "authenticated", phase: "setup", cause: reason });
    else {
      const count = Math.max(5, Math.ceil(config.iterations / 2));
      const checks = [
        ["user", (j) => typeof j?.user?.id === "string"],
        ["orgs", (j) => Array.isArray(j?.orgs) && Number.isFinite(j?.total)],
        ["admin/users/stats", (j) => Number.isFinite(j?.total)],
        [
          "admin/users?limit=20&offset=0",
          (j) => Array.isArray(j?.users) && Number.isFinite(j?.total),
        ],
      ];
      for (const [path, validate] of checks)
        await measure(`GET ${base}/${path}`, `${base}/${path}`, count, {
          auth: true,
          validate,
        });
    }
  }
  const names = [...new Set(samples.map((row) => row.name))];
  const summaries = names.map((name) =>
    summarize(
      name,
      samples.filter((row) => row.name === name),
      config.p95BudgetMs,
    ),
  );
  return {
    kind: "performance-smoke",
    runtime: process.version,
    capacity_test: false,
    selected_scenarios: config.scenarios,
    omitted_scenarios: ["public", "generated", "authenticated"].filter(
      (s) => !config.scenarios.includes(s),
    ),
    iterations: config.iterations,
    concurrency: config.concurrency,
    warmup_per_endpoint: config.warmup,
    setup,
    failures,
    summaries,
    samples,
    pass:
      failures.length === 0 &&
      summaries.length > 0 &&
      summaries.every((row) => row.pass),
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const result = await runSmoke(readConfig());
    console.log(JSON.stringify(result, null, 2));
    if (!result.pass) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
