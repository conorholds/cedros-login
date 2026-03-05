import { useContext as E } from "react";
import { C as R, A as I, a as S } from "./LoadingSpinner-6vml-zwr.js";
const g = 32;
function C() {
  if (typeof document > "u") return null;
  const t = document.querySelector('meta[name="csrf-token"]');
  if (t) {
    const r = t.getAttribute("content");
    if (r && r.length >= g)
      return r;
  }
  const e = document.cookie.split(";");
  for (const r of e) {
    const [o, ...i] = r.trim().split("="), u = i.join("="), l = o.toLowerCase();
    if (l === "xsrf-token" || l === "csrf-token")
      try {
        const a = decodeURIComponent(u.trim());
        if (a.length >= g)
          return a;
      } catch {
        continue;
      }
  }
  return null;
}
const L = 1e4, b = 2, _ = {
  INVALID_CREDENTIALS: "Incorrect email or password. Please check your details and try again.",
  EMAIL_EXISTS: "An account with this email already exists. Try signing in instead.",
  WALLET_EXISTS: "This wallet is already linked to an account.",
  INVALID_TOKEN: "Your session has expired. Please try again.",
  TOKEN_EXPIRED: "This link has expired. Please request a new one.",
  INVALID_SIGNATURE: "Wallet verification failed. Please try signing again.",
  CHALLENGE_EXPIRED: "This verification has expired. Please try again.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  STEP_UP_REQUIRED: "Please verify your identity to continue.",
  SERVER_ERROR: "Something went wrong. Please try again later."
};
function k(t, e) {
  const r = t.code || "SERVER_ERROR";
  return {
    code: r,
    message: _[r] ?? t.message ?? e,
    details: t.details
  };
}
function v() {
  return {
    code: "NETWORK_ERROR",
    message: "Unable to reach the server. Check your connection and try again."
  };
}
async function P(t, e, r) {
  const o = new AbortController(), i = setTimeout(() => o.abort(), r);
  try {
    return await fetch(t, {
      ...e,
      signal: o.signal
    });
  } finally {
    clearTimeout(i);
  }
}
function x(t) {
  if (t instanceof Error) {
    if (t.retryable) return !0;
    if (t.name === "AbortError") return !1;
    if (t.message.includes("fetch")) return !0;
  }
  return !1;
}
function N(t) {
  return new Promise((e) => setTimeout(e, t));
}
class j {
  baseUrl;
  timeoutMs;
  retryAttempts;
  getAccessToken;
  constructor(e) {
    this.baseUrl = e.baseUrl, this.timeoutMs = e.timeoutMs ?? L, this.retryAttempts = e.retryAttempts ?? b, this.getAccessToken = e.getAccessToken;
  }
  /**
   * Make an API request with timeout and optional retry
   */
  async request(e) {
    const { method: r, path: o, body: i, credentials: u = "include", skipRetry: l = !1, validator: a } = e, w = `${this.baseUrl}${o}`, m = l || !(r === "GET" || r === "HEAD" || r === "PUT") ? 1 : this.retryAttempts + 1, d = {};
    i !== void 0 && (d["Content-Type"] = "application/json");
    const p = this.getAccessToken?.();
    p && (d.Authorization = `Bearer ${p}`);
    const y = C();
    y && (d["X-CSRF-Token"] = y);
    let T;
    for (let h = 1; h <= m; h++)
      try {
        const n = await P(
          w,
          {
            method: r,
            headers: d,
            credentials: u,
            body: i !== void 0 ? JSON.stringify(i) : void 0
          },
          this.timeoutMs
        ), A = n.headers.get("content-type") || "";
        let c = {};
        if (A.includes("application/json")) {
          if (n.status !== 204)
            try {
              c = await n.json();
            } catch (s) {
              const f = s instanceof Error ? s.message : "parse failed";
              throw new Error(`Invalid JSON response: ${f}`);
            }
        } else {
          const s = await n.text();
          if (s) {
            const f = s.length > 200 ? s.slice(0, 200) + "..." : s;
            c = {
              message: A.includes("text/html") || s.trimStart().startsWith("<") ? `Unexpected HTML response (${n.status}). The server may be unavailable.` : f
            };
          }
        }
        if (!n.ok) {
          if (n.status >= 400 && n.status < 500)
            throw { isApiError: !0, data: c, status: n.status };
          const s = new Error(`Server error: ${n.status}`);
          throw s.retryable = !0, s;
        }
        if (a)
          try {
            return a(c);
          } catch (s) {
            throw new Error(
              `Response validation failed: ${s instanceof Error ? s.message : "Invalid response shape"}`
            );
          }
        return c;
      } catch (n) {
        if (T = n, typeof n == "object" && n !== null && "isApiError" in n)
          throw n;
        if (h < m && x(n)) {
          await N(100 * Math.pow(2, h - 1));
          continue;
        }
        throw n;
      }
    throw T;
  }
  /**
   * POST request helper
   */
  async post(e, r, o) {
    return this.request({ method: "POST", path: e, body: r, ...o });
  }
  /**
   * GET request helper
   */
  async get(e, r) {
    return this.request({ method: "GET", path: e, ...r });
  }
  /**
   * PATCH request helper
   */
  async patch(e, r, o) {
    return this.request({ method: "PATCH", path: e, body: r, ...o });
  }
  /**
   * DELETE request helper
   */
  async delete(e, r) {
    return this.request({ method: "DELETE", path: e, ...r });
  }
}
function U(t) {
  return typeof t == "object" && t !== null && "isApiError" in t;
}
function O(t) {
  return typeof t == "object" && t !== null && "code" in t && "message" in t;
}
function H(t, e) {
  if (O(t))
    return t;
  if (U(t))
    return k(t.data, e);
  if (t instanceof Error) {
    if (t.name === "AbortError")
      return {
        code: "NETWORK_ERROR",
        message: "The request timed out. Check your connection and try again."
      };
    if (t.message.startsWith("Server error:") || t.message.startsWith("Invalid JSON response"))
      return {
        code: "SERVER_ERROR",
        message: e
      };
  }
  return v();
}
function $() {
  const t = E(R);
  if (!t)
    throw new Error("useCedrosLogin must be used within a CedrosLoginProvider");
  return t;
}
function G() {
  return E(R);
}
function V() {
  const t = E(I);
  if (!t)
    throw new Error("useAuthState must be used within a CedrosLoginProvider");
  return t;
}
function F() {
  const t = E(S);
  if (!t)
    throw new Error("useAuthUI must be used within a CedrosLoginProvider");
  return t;
}
export {
  j as A,
  G as a,
  V as b,
  F as c,
  C as g,
  H as h,
  $ as u
};
