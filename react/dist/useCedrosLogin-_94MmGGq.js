import { useContext as h } from "react";
import { C as w, A as b, a as C } from "./LoadingSpinner-6vml-zwr.js";
const g = 32;
function v() {
  if (typeof document > "u") return null;
  const t = document.querySelector('meta[name="csrf-token"]');
  if (t) {
    const r = t.getAttribute("content");
    if (r && r.length >= g)
      return r;
  }
  const e = document.cookie.split(";");
  for (const r of e) {
    const [n, ...i] = r.trim().split("="), u = i.join("="), l = n.toLowerCase();
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
const S = 1e4, k = 2;
function x(t, e) {
  return {
    code: t.code || "SERVER_ERROR",
    message: t.message || e,
    details: t.details
  };
}
function L() {
  return {
    code: "NETWORK_ERROR",
    message: "Unable to connect to server"
  };
}
async function U(t, e, r) {
  const n = new AbortController(), i = setTimeout(() => n.abort(), r);
  try {
    return await fetch(t, {
      ...e,
      signal: n.signal
    });
  } finally {
    clearTimeout(i);
  }
}
function O(t) {
  if (t instanceof Error) {
    if (t.retryable) return !0;
    if (t.name === "AbortError") return !1;
    if (t.message.includes("fetch")) return !0;
  }
  return !1;
}
function I(t) {
  return new Promise((e) => setTimeout(e, t));
}
class $ {
  baseUrl;
  timeoutMs;
  retryAttempts;
  getAccessToken;
  constructor(e) {
    this.baseUrl = e.baseUrl, this.timeoutMs = e.timeoutMs ?? S, this.retryAttempts = e.retryAttempts ?? k, this.getAccessToken = e.getAccessToken;
  }
  /**
   * Make an API request with timeout and optional retry
   */
  async request(e) {
    const { method: r, path: n, body: i, credentials: u = "include", skipRetry: l = !1, validator: a } = e, R = `${this.baseUrl}${n}`, p = l || !(r === "GET" || r === "HEAD" || r === "PUT") ? 1 : this.retryAttempts + 1, f = {};
    i !== void 0 && (f["Content-Type"] = "application/json");
    const E = this.getAccessToken?.();
    E && (f.Authorization = `Bearer ${E}`);
    const A = v();
    A && (f["X-CSRF-Token"] = A);
    let T;
    for (let d = 1; d <= p; d++)
      try {
        const s = await U(
          R,
          {
            method: r,
            headers: f,
            credentials: u,
            body: i !== void 0 ? JSON.stringify(i) : void 0
          },
          this.timeoutMs
        ), y = s.headers.get("content-type") || "";
        let c = {};
        if (y.includes("application/json")) {
          if (s.status !== 204)
            try {
              c = await s.json();
            } catch (o) {
              const m = o instanceof Error ? o.message : "parse failed";
              throw new Error(`Invalid JSON response: ${m}`);
            }
        } else {
          const o = await s.text();
          if (o) {
            const m = o.length > 200 ? o.slice(0, 200) + "..." : o;
            c = {
              message: y.includes("text/html") || o.trimStart().startsWith("<") ? `Unexpected HTML response (${s.status}). The server may be unavailable.` : m
            };
          }
        }
        if (!s.ok) {
          if (s.status >= 400 && s.status < 500)
            throw { isApiError: !0, data: c, status: s.status };
          const o = new Error(`Server error: ${s.status}`);
          throw o.retryable = !0, o;
        }
        if (a)
          try {
            return a(c);
          } catch (o) {
            throw new Error(
              `Response validation failed: ${o instanceof Error ? o.message : "Invalid response shape"}`
            );
          }
        return c;
      } catch (s) {
        if (T = s, typeof s == "object" && s !== null && "isApiError" in s)
          throw s;
        if (d < p && O(s)) {
          await I(100 * Math.pow(2, d - 1));
          continue;
        }
        throw s;
      }
    throw T;
  }
  /**
   * POST request helper
   */
  async post(e, r, n) {
    return this.request({ method: "POST", path: e, body: r, ...n });
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
  async patch(e, r, n) {
    return this.request({ method: "PATCH", path: e, body: r, ...n });
  }
  /**
   * DELETE request helper
   */
  async delete(e, r) {
    return this.request({ method: "DELETE", path: e, ...r });
  }
}
function _(t) {
  return typeof t == "object" && t !== null && "isApiError" in t;
}
function M(t) {
  return typeof t == "object" && t !== null && "code" in t && "message" in t;
}
function H(t, e) {
  if (M(t))
    return t;
  if (_(t))
    return x(t.data, e);
  if (t instanceof Error) {
    if (t.name === "AbortError")
      return {
        code: "NETWORK_ERROR",
        message: "Request timed out"
      };
    if (t.message.startsWith("Server error:") || t.message.startsWith("Invalid JSON response"))
      return {
        code: "SERVER_ERROR",
        message: e
      };
  }
  return L();
}
function W() {
  const t = h(w);
  if (!t)
    throw new Error("useCedrosLogin must be used within a CedrosLoginProvider");
  return t;
}
function D() {
  return h(w);
}
function F() {
  const t = h(b);
  if (!t)
    throw new Error("useAuthState must be used within a CedrosLoginProvider");
  return t;
}
function G() {
  const t = h(C);
  if (!t)
    throw new Error("useAuthUI must be used within a CedrosLoginProvider");
  return t;
}
export {
  $ as A,
  D as a,
  F as b,
  G as c,
  v as g,
  H as h,
  W as u
};
