import { createContext as m, useContext as E } from "react";
const S = m(null), C = m(null), w = m(null), R = 32;
function L() {
  if (typeof document > "u") return null;
  const t = document.querySelector('meta[name="csrf-token"]');
  if (t) {
    const n = t.getAttribute("content");
    if (n && n.length >= R)
      return n;
  }
  const e = document.cookie.split(";");
  for (const n of e) {
    const [o, ...i] = n.trim().split("="), u = i.join("="), l = o.toLowerCase();
    if (l === "xsrf-token" || l === "csrf-token")
      try {
        const a = decodeURIComponent(u.trim());
        if (a.length >= R)
          return a;
      } catch {
        continue;
      }
  }
  return null;
}
const b = 1e4, _ = 2, k = {
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
function v(t, e) {
  const n = t.code || "SERVER_ERROR";
  return {
    code: n,
    message: k[n] ?? t.message ?? e,
    details: t.details
  };
}
function P() {
  return {
    code: "NETWORK_ERROR",
    message: "Unable to reach the server. Check your connection and try again."
  };
}
async function x(t, e, n) {
  const o = new AbortController(), i = setTimeout(() => o.abort(), n);
  try {
    return await fetch(t, {
      ...e,
      signal: o.signal
    });
  } finally {
    clearTimeout(i);
  }
}
function N(t) {
  if (t instanceof Error) {
    if (t.retryable) return !0;
    if (t.name === "AbortError") return !1;
    if (t.message.includes("fetch")) return !0;
  }
  return !1;
}
function U(t) {
  return new Promise((e) => setTimeout(e, t));
}
class j {
  baseUrl;
  timeoutMs;
  retryAttempts;
  getAccessToken;
  constructor(e) {
    this.baseUrl = e.baseUrl, this.timeoutMs = e.timeoutMs ?? b, this.retryAttempts = e.retryAttempts ?? _, this.getAccessToken = e.getAccessToken;
  }
  /**
   * Make an API request with timeout and optional retry
   */
  async request(e) {
    const { method: n, path: o, body: i, credentials: u = "include", skipRetry: l = !1, validator: a } = e, I = `${this.baseUrl}${o}`, p = l || !(n === "GET" || n === "HEAD" || n === "PUT") ? 1 : this.retryAttempts + 1, d = {};
    i !== void 0 && (d["Content-Type"] = "application/json");
    const y = this.getAccessToken?.();
    y && (d.Authorization = `Bearer ${y}`);
    const T = L();
    T && (d["X-CSRF-Token"] = T);
    let g;
    for (let h = 1; h <= p; h++)
      try {
        const r = await x(
          I,
          {
            method: n,
            headers: d,
            credentials: u,
            body: i !== void 0 ? JSON.stringify(i) : void 0
          },
          this.timeoutMs
        ), A = r.headers.get("content-type") || "";
        let c = {};
        if (A.includes("application/json")) {
          if (r.status !== 204)
            try {
              c = await r.json();
            } catch (s) {
              const f = s instanceof Error ? s.message : "parse failed";
              throw new Error(`Invalid JSON response: ${f}`);
            }
        } else {
          const s = await r.text();
          if (s) {
            const f = s.length > 200 ? s.slice(0, 200) + "..." : s;
            c = {
              message: A.includes("text/html") || s.trimStart().startsWith("<") ? `Unexpected HTML response (${r.status}). The server may be unavailable.` : f
            };
          }
        }
        if (!r.ok) {
          if (r.status >= 400 && r.status < 500)
            throw { isApiError: !0, data: c, status: r.status };
          const s = new Error(`Server error: ${r.status}`);
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
      } catch (r) {
        if (g = r, typeof r == "object" && r !== null && "isApiError" in r)
          throw r;
        if (h < p && N(r)) {
          await U(100 * Math.pow(2, h - 1));
          continue;
        }
        throw r;
      }
    throw g;
  }
  /**
   * POST request helper
   */
  async post(e, n, o) {
    return this.request({ method: "POST", path: e, body: n, ...o });
  }
  /**
   * GET request helper
   */
  async get(e, n) {
    return this.request({ method: "GET", path: e, ...n });
  }
  /**
   * PATCH request helper
   */
  async patch(e, n, o) {
    return this.request({ method: "PATCH", path: e, body: n, ...o });
  }
  /**
   * DELETE request helper
   */
  async delete(e, n) {
    return this.request({ method: "DELETE", path: e, ...n });
  }
}
function O(t) {
  return typeof t == "object" && t !== null && "isApiError" in t;
}
function D(t) {
  return typeof t == "object" && t !== null && "code" in t && "message" in t;
}
function H(t, e) {
  if (D(t))
    return t;
  if (O(t))
    return v(t.data, e);
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
  return P();
}
function $() {
  const t = E(w);
  if (!t)
    throw new Error("useCedrosLogin must be used within a CedrosLoginProvider");
  return t;
}
function G() {
  return E(w);
}
function V() {
  const t = E(S);
  if (!t)
    throw new Error("useAuthState must be used within a CedrosLoginProvider");
  return t;
}
function F() {
  const t = E(C);
  if (!t)
    throw new Error("useAuthUI must be used within a CedrosLoginProvider");
  return t;
}
export {
  j as A,
  w as C,
  G as a,
  S as b,
  C as c,
  V as d,
  F as e,
  L as g,
  H as h,
  $ as u
};
