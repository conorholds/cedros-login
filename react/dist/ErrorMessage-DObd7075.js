import { createContext as y, useContext as E, memo as v, useRef as I, useEffect as S } from "react";
import { jsxs as m, jsx as c } from "react/jsx-runtime";
const x = y(null), b = y(null), C = y(null), k = 32;
function N() {
  if (typeof document > "u") return null;
  const e = document.querySelector('meta[name="csrf-token"]');
  if (e) {
    const r = e.getAttribute("content");
    if (r && r.length >= k)
      return r;
  }
  const t = document.cookie.split(";");
  for (const r of t) {
    const [n, ...o] = r.trim().split("="), a = o.join("="), u = n.toLowerCase();
    if (u === "xsrf-token" || u === "csrf-token")
      try {
        const l = decodeURIComponent(a.trim());
        if (l.length >= k)
          return l;
      } catch {
        continue;
      }
  }
  return null;
}
const _ = 1e4, P = 2, M = {
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
function O(e, t) {
  const r = e.code || "SERVER_ERROR";
  return {
    code: r,
    message: M[r] ?? e.message ?? t,
    details: e.details
  };
}
function U() {
  return {
    code: "NETWORK_ERROR",
    message: "Unable to reach the server. Check your connection and try again."
  };
}
async function D(e, t, r) {
  const n = new AbortController(), o = setTimeout(() => n.abort(), r);
  try {
    return await fetch(e, {
      ...t,
      signal: n.signal
    });
  } finally {
    clearTimeout(o);
  }
}
function W(e) {
  if (e instanceof Error) {
    if (e.retryable) return !0;
    if (e.name === "AbortError") return !1;
    if (e.message.includes("fetch")) return !0;
  }
  return !1;
}
function j(e) {
  return new Promise((t) => setTimeout(t, e));
}
class B {
  baseUrl;
  timeoutMs;
  retryAttempts;
  getAccessToken;
  constructor(t) {
    this.baseUrl = t.baseUrl, this.timeoutMs = t.timeoutMs ?? _, this.retryAttempts = t.retryAttempts ?? P, this.getAccessToken = t.getAccessToken;
  }
  /**
   * Make an API request with timeout and optional retry
   */
  async request(t) {
    const { method: r, path: n, body: o, credentials: a = "include", skipRetry: u = !1, validator: l } = t, L = `${this.baseUrl}${n}`, g = u || !(r === "GET" || r === "HEAD" || r === "PUT") ? 1 : this.retryAttempts + 1, h = {};
    o !== void 0 && (h["Content-Type"] = "application/json");
    const T = this.getAccessToken?.();
    T && (h.Authorization = `Bearer ${T}`);
    const A = N();
    A && (h["X-CSRF-Token"] = A);
    let w;
    for (let f = 1; f <= g; f++)
      try {
        const s = await D(
          L,
          {
            method: r,
            headers: h,
            credentials: a,
            body: o !== void 0 ? JSON.stringify(o) : void 0
          },
          this.timeoutMs
        ), R = s.headers.get("content-type") || "";
        let d = {};
        if (R.includes("application/json")) {
          if (s.status !== 204)
            try {
              d = await s.json();
            } catch (i) {
              const p = i instanceof Error ? i.message : "parse failed";
              throw new Error(`Invalid JSON response: ${p}`);
            }
        } else {
          const i = await s.text();
          if (i) {
            const p = i.length > 200 ? i.slice(0, 200) + "..." : i;
            d = {
              message: R.includes("text/html") || i.trimStart().startsWith("<") ? `Unexpected HTML response (${s.status}). The server may be unavailable.` : p
            };
          }
        }
        if (!s.ok) {
          if (s.status >= 400 && s.status < 500)
            throw { isApiError: !0, data: d, status: s.status };
          const i = new Error(`Server error: ${s.status}`);
          throw i.retryable = !0, i;
        }
        if (l)
          try {
            return l(d);
          } catch (i) {
            throw new Error(
              `Response validation failed: ${i instanceof Error ? i.message : "Invalid response shape"}`
            );
          }
        return d;
      } catch (s) {
        if (w = s, typeof s == "object" && s !== null && "isApiError" in s)
          throw s;
        if (f < g && W(s)) {
          await j(100 * Math.pow(2, f - 1));
          continue;
        }
        throw s;
      }
    throw w;
  }
  /**
   * POST request helper
   */
  async post(t, r, n) {
    return this.request({ method: "POST", path: t, body: r, ...n });
  }
  /**
   * GET request helper
   */
  async get(t, r) {
    return this.request({ method: "GET", path: t, ...r });
  }
  /**
   * PATCH request helper
   */
  async patch(t, r, n) {
    return this.request({ method: "PATCH", path: t, body: r, ...n });
  }
  /**
   * DELETE request helper
   */
  async delete(t, r) {
    return this.request({ method: "DELETE", path: t, ...r });
  }
}
function q(e) {
  return typeof e == "object" && e !== null && "isApiError" in e;
}
function $(e) {
  return typeof e == "object" && e !== null && "code" in e && "message" in e;
}
function F(e, t) {
  if ($(e))
    return e;
  if (q(e))
    return O(e.data, t);
  if (e instanceof Error) {
    if (e.name === "AbortError")
      return {
        code: "NETWORK_ERROR",
        message: "The request timed out. Check your connection and try again."
      };
    if (e.message.startsWith("Server error:") || e.message.startsWith("Invalid JSON response"))
      return {
        code: "SERVER_ERROR",
        message: t
      };
  }
  return U();
}
function J() {
  const e = E(C);
  if (!e)
    throw new Error("useCedrosLogin must be used within a CedrosLoginProvider");
  return e;
}
function Y() {
  return E(C);
}
function z() {
  const e = E(x);
  if (!e)
    throw new Error("useAuthState must be used within a CedrosLoginProvider");
  return e;
}
function Q() {
  const e = E(b);
  if (!e)
    throw new Error("useAuthUI must be used within a CedrosLoginProvider");
  return e;
}
const H = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48
  // H-04: Added for WalletUnlock component
}, Z = v(function({
  size: t = "md",
  className: r = "",
  style: n,
  label: o = "Loading",
  announce: a = !1
}) {
  const u = H[t], l = /* @__PURE__ */ m(
    "svg",
    {
      className: `cedros-spinner ${r}`,
      width: u,
      height: u,
      viewBox: "0 0 24 24",
      fill: "none",
      style: n,
      "aria-label": o,
      role: "status",
      "aria-hidden": a ? "true" : void 0,
      children: [
        /* @__PURE__ */ c(
          "circle",
          {
            className: "cedros-spinner-track",
            cx: "12",
            cy: "12",
            r: "10",
            stroke: "currentColor",
            strokeWidth: "3",
            strokeOpacity: "0.25"
          }
        ),
        /* @__PURE__ */ c(
          "circle",
          {
            className: "cedros-spinner-head",
            cx: "12",
            cy: "12",
            r: "10",
            stroke: "currentColor",
            strokeWidth: "3",
            strokeLinecap: "round",
            strokeDasharray: "31.4 31.4",
            transform: "rotate(-90 12 12)",
            children: /* @__PURE__ */ c(
              "animateTransform",
              {
                attributeName: "transform",
                type: "rotate",
                from: "0 12 12",
                to: "360 12 12",
                dur: "1s",
                repeatCount: "indefinite"
              }
            )
          }
        )
      ]
    }
  );
  return a ? /* @__PURE__ */ m("span", { "aria-live": "polite", "aria-busy": "true", children: [
    l,
    /* @__PURE__ */ c("span", { className: "cedros-sr-only", children: o })
  ] }) : l;
}), ee = v(function({
  error: t,
  className: r = "",
  onDismiss: n,
  autoFocus: o = !1
}) {
  const a = I(null);
  if (S(() => {
    t && o && a.current && a.current.focus();
  }, [t, o]), !t) return null;
  const u = typeof t == "string" ? t : t.message;
  return /* @__PURE__ */ m(
    "div",
    {
      ref: a,
      className: `cedros-error ${r}`,
      role: "alert",
      "aria-live": "assertive",
      tabIndex: o ? -1 : void 0,
      children: [
        /* @__PURE__ */ m(
          "svg",
          {
            className: "cedros-error-icon",
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ c("circle", { cx: "8", cy: "8", r: "7", stroke: "currentColor", strokeWidth: "1.5" }),
              /* @__PURE__ */ c("path", { d: "M8 4.5v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
              /* @__PURE__ */ c("circle", { cx: "8", cy: "11", r: "0.75", fill: "currentColor" })
            ]
          }
        ),
        /* @__PURE__ */ c("span", { className: "cedros-error-message", children: u }),
        n && /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            className: "cedros-error-dismiss",
            onClick: n,
            "aria-label": "Dismiss error",
            children: /* @__PURE__ */ c("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ c(
              "path",
              {
                d: "M10.5 3.5L3.5 10.5M3.5 3.5l7 7",
                stroke: "currentColor",
                strokeWidth: "1.5",
                strokeLinecap: "round"
              }
            ) })
          }
        )
      ]
    }
  );
});
export {
  B as A,
  C,
  ee as E,
  Z as L,
  Q as a,
  J as b,
  Y as c,
  x as d,
  b as e,
  N as g,
  F as h,
  z as u
};
