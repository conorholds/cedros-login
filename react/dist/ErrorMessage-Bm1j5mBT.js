import { jsxs as R, jsx as m } from "react/jsx-runtime";
import { createContext as me, useEffect as K, useState as U, useRef as P, useCallback as k, useMemo as O, useContext as we, memo as Qe } from "react";
const ae = me(null);
function be({ theme: e, themeOverrides: t }) {
  K(() => {
    if (typeof document > "u" || typeof window > "u")
      return;
    const A = document.documentElement;
    let r = !1;
    e === "dark" ? (A.classList.add("cedros-dark"), r = !0) : e === "light" ? A.classList.remove("cedros-dark") : window.matchMedia("(prefers-color-scheme: dark)").matches ? (A.classList.add("cedros-dark"), r = !0) : A.classList.remove("cedros-dark");
    const n = /* @__PURE__ */ new Map();
    return t && Object.entries(t).forEach(([i, o]) => {
      if (o) {
        const I = A.style.getPropertyValue(i);
        n.set(i, I), A.style.setProperty(i, o);
      }
    }), () => {
      r && A.classList.remove("cedros-dark"), n.forEach((i, o) => {
        i ? A.style.setProperty(o, i) : A.style.removeProperty(o);
      });
    };
  }, [e, t]);
}
const Ge = "cedros_tokens", Ke = 6e4;
class He {
  storage;
  requestedStorage;
  storageKey;
  tokens = null;
  expiresAt = 0;
  refreshTimer = null;
  onRefreshNeeded = null;
  onSessionExpired = null;
  onRefreshError = null;
  // P-02: Track destruction to prevent timer callbacks from executing after cleanup
  isDestroyed = !1;
  allowWebStorage;
  constructor(t = "cookie", A = Ge, r = {}) {
    this.requestedStorage = t, this.storage = t, this.storageKey = A, this.allowWebStorage = r.allowWebStorage ?? !1, this.warnIfLocalStorage(), !this.allowWebStorage && (this.requestedStorage === "localStorage" || this.requestedStorage === "sessionStorage") && (this.storage = "memory"), this.loadFromStorage();
  }
  /**
   * S-18/UI-XSS: Warn about localStorage XSS vulnerability in all environments.
   * Security warnings should not be suppressed in production - operators need
   * to be aware of the security implications of their storage choices.
   */
  warnIfLocalStorage() {
    if ((this.requestedStorage === "localStorage" || this.requestedStorage === "sessionStorage") && typeof console < "u") {
      const t = this.allowWebStorage ? "" : " (web storage disabled by default; set allowWebStorage=true to enable)";
      console.warn(
        "[cedros-login] SECURITY: Using web storage for token storage. Tokens are vulnerable to XSS attacks." + t + " PRODUCTION RECOMMENDATIONS: (1) Use httpOnly cookie storage instead, (2) If web storage required: implement strict Content-Security-Policy, sanitize all input/output, audit third-party scripts. See https://owasp.org/www-community/attacks/xss/"
      );
    }
  }
  /**
   * Set the callback for when tokens need to be refreshed
   */
  setRefreshCallback(t) {
    this.onRefreshNeeded = t, this.scheduleRefresh();
  }
  /**
   * Set the callback for when session expires
   */
  setSessionExpiredCallback(t) {
    this.onSessionExpired = t;
  }
  /**
   * Set the callback for when token refresh fails
   * This allows the UI to show an error message to the user
   */
  setRefreshErrorCallback(t) {
    this.onRefreshError = t;
  }
  /**
   * Store tokens and schedule auto-refresh
   */
  setTokens(t) {
    this.tokens = t, this.expiresAt = Date.now() + t.expiresIn * 1e3, this.saveToStorage(), this.scheduleRefresh();
  }
  /**
   * Get the current access token
   * UI-4 FIX: Store token in local variable before expiry check to eliminate TOCTOU race.
   * UI-TOK-01 FIX: Check isDestroyed to prevent access after manager is cleaned up.
   */
  getAccessToken() {
    if (this.isDestroyed) return null;
    const t = this.tokens?.accessToken;
    return t ? Date.now() >= this.expiresAt ? (this.clear(), this.onSessionExpired?.(), null) : t : null;
  }
  /**
   * Get the current refresh token
   */
  getRefreshToken() {
    return this.tokens?.refreshToken ?? null;
  }
  /**
   * Clear stored tokens
   */
  clear() {
    this.tokens = null, this.expiresAt = 0, this.cancelRefresh(), this.clearStorage();
  }
  /**
   * Check if tokens are stored
   */
  hasTokens() {
    return this.tokens !== null && Date.now() < this.expiresAt;
  }
  /**
   * Destroy the token manager and clean up resources.
   * Call this when unmounting components or cleaning up to prevent memory leaks.
   * P-02: Also sets isDestroyed flag to prevent timer callbacks from executing.
   */
  destroy() {
    this.isDestroyed = !0, this.cancelRefresh(), this.onRefreshNeeded = null, this.onSessionExpired = null, this.onRefreshError = null, this.tokens = null;
  }
  /**
   * Get time until token expiry in ms
   */
  getTimeUntilExpiry() {
    return this.tokens ? Math.max(0, this.expiresAt - Date.now()) : 0;
  }
  scheduleRefresh() {
    if (this.cancelRefresh(), !this.tokens || !this.onRefreshNeeded) return;
    const t = this.getTimeUntilExpiry(), A = Math.max(0, t - Ke);
    if (A <= 0) {
      if (this.isDestroyed) return;
      this.onRefreshNeeded().catch((r) => {
        if (this.isDestroyed) return;
        const n = r instanceof Error ? r : new Error("Token refresh failed");
        this.onRefreshError?.(n), this.clear(), this.onSessionExpired?.();
      });
      return;
    }
    this.refreshTimer = setTimeout(() => {
      this.isDestroyed || this.onRefreshNeeded?.().catch((r) => {
        if (this.isDestroyed) return;
        const n = r instanceof Error ? r : new Error("Token refresh failed");
        this.onRefreshError?.(n), this.clear(), this.onSessionExpired?.();
      });
    }, A);
  }
  cancelRefresh() {
    this.refreshTimer && (clearTimeout(this.refreshTimer), this.refreshTimer = null);
  }
  loadFromStorage() {
    if (this.storage !== "memory" && !(typeof window > "u") && !(!this.allowWebStorage && (this.storage === "localStorage" || this.storage === "sessionStorage")))
      try {
        if (this.storage === "localStorage" || this.storage === "sessionStorage") {
          const t = this.storage === "localStorage" ? localStorage : sessionStorage, A = t.getItem(this.storageKey);
          if (A) {
            const r = JSON.parse(A);
            this.isValidStoredTokenData(r) ? r.expiresAt > Date.now() ? (this.tokens = r.tokens, this.expiresAt = r.expiresAt) : t.removeItem(this.storageKey) : t.removeItem(this.storageKey);
          }
        }
      } catch {
        if (this.storage === "localStorage" || this.storage === "sessionStorage") {
          const t = this.storage === "localStorage" ? localStorage : sessionStorage;
          try {
            t.removeItem(this.storageKey);
          } catch {
          }
        }
      }
  }
  /**
   * Validate that parsed data matches expected StoredTokenData structure
   */
  isValidStoredTokenData(t) {
    if (typeof t != "object" || t === null) return !1;
    const A = t;
    if (typeof A.expiresAt != "number" || typeof A.tokens != "object" || A.tokens === null) return !1;
    const r = A.tokens;
    return !(typeof r.accessToken != "string" || typeof r.refreshToken != "string" || typeof r.expiresIn != "number");
  }
  saveToStorage() {
    if (!(this.storage === "memory" || !this.tokens) && !(typeof window > "u") && !(!this.allowWebStorage && (this.storage === "localStorage" || this.storage === "sessionStorage")))
      try {
        if (this.storage === "localStorage" || this.storage === "sessionStorage") {
          const t = this.storage === "localStorage" ? localStorage : sessionStorage, A = {
            tokens: this.tokens,
            expiresAt: this.expiresAt
          };
          t.setItem(this.storageKey, JSON.stringify(A));
        }
      } catch {
      }
  }
  clearStorage() {
    if (this.storage !== "memory" && !(typeof window > "u") && !(!this.allowWebStorage && (this.storage === "localStorage" || this.storage === "sessionStorage")))
      try {
        (this.storage === "localStorage" || this.storage === "sessionStorage") && (this.storage === "localStorage" ? localStorage : sessionStorage).removeItem(this.storageKey);
      } catch {
      }
  }
}
const Je = "cedros_auth_sync";
class Me {
  channel = null;
  callback = null;
  boundHandler = null;
  constructor() {
    typeof window < "u" && "BroadcastChannel" in window && (this.channel = new BroadcastChannel(Je), this.boundHandler = this.handleMessage.bind(this), this.channel.addEventListener("message", this.boundHandler));
  }
  /**
   * Handle incoming sync messages
   */
  handleMessage(t) {
    this.callback?.(t.data);
  }
  /**
   * Set the callback for sync events from other tabs
   */
  setCallback(t) {
    this.callback = t;
  }
  /**
   * Broadcast login event to other tabs
   */
  broadcastLogin(t) {
    this.channel?.postMessage({ type: "login", user: t });
  }
  /**
   * Broadcast logout event to other tabs
   */
  broadcastLogout() {
    this.channel?.postMessage({ type: "logout" });
  }
  /**
   * Broadcast token refresh event to other tabs
   */
  broadcastRefresh() {
    this.channel?.postMessage({ type: "refresh" });
  }
  /**
   * Close the channel and clean up references
   * UI-6: Use removeEventListener for proper cleanup
   */
  close() {
    this.channel && (this.boundHandler && (this.channel.removeEventListener("message", this.boundHandler), this.boundHandler = null), this.channel.close(), this.channel = null), this.callback = null;
  }
}
const ce = 20;
function ne() {
  if (typeof document > "u") return null;
  const e = document.querySelector('meta[name="csrf-token"]');
  if (e) {
    const A = e.getAttribute("content");
    if (A && A.length >= ce)
      return A;
  }
  const t = document.cookie.split(";");
  for (const A of t) {
    const [r, ...n] = A.trim().split("="), i = n.join("="), o = r.toLowerCase();
    if (o === "xsrf-token" || o === "csrf-token")
      try {
        const I = decodeURIComponent(i.trim());
        if (I.length >= ce)
          return I;
      } catch {
        continue;
      }
  }
  return null;
}
function X(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = e;
  if (typeof t.user != "object" || t.user === null) return !1;
  const A = t.user;
  return typeof A.id == "string" && A.id.length > 0;
}
function Ne(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = e;
  return typeof t.accessToken == "string" && t.accessToken.length > 0 && typeof t.refreshToken == "string" && t.refreshToken.length > 0 && typeof t.expiresIn == "number" && t.expiresIn > 0;
}
function Ve({
  serverUrl: e,
  session: t,
  callbacks: A,
  requestTimeoutMs: r
}) {
  const [n, i] = U(null), [o, I] = U("idle"), c = P(null), w = P(null), B = P(A), p = P(!0), f = P(null);
  K(() => {
    B.current = A;
  }, [A]), K(() => (p.current = !0, () => {
    p.current = !1;
  }), []);
  const Q = k((s) => {
    p.current && i(s);
  }, []), u = k((s) => {
    p.current && I(s);
  }, []), h = O(
    () => ({
      storage: t?.storage ?? "cookie",
      autoRefresh: t?.autoRefresh ?? !0,
      syncTabs: t?.syncTabs ?? !0,
      persistKey: t?.persistKey,
      allowWebStorage: t?.allowWebStorage ?? !1
    }),
    [
      t?.storage,
      t?.autoRefresh,
      t?.syncTabs,
      t?.persistKey,
      t?.allowWebStorage
    ]
  );
  K(() => (c.current = new He(h.storage, h.persistKey, {
    allowWebStorage: h.allowWebStorage
  }), h.syncTabs && (w.current = new Me()), () => {
    c.current?.destroy(), c.current = null, w.current?.close();
  }), [
    h.storage,
    h.syncTabs,
    h.persistKey,
    h.allowWebStorage
  ]);
  const a = k(async () => {
    if (f.current)
      return f.current;
    const s = c.current?.getRefreshToken(), E = !!s, F = ne(), b = {};
    E && (b["Content-Type"] = "application/json"), F && (b["X-CSRF-Token"] = F);
    const N = (async () => {
      const V = new AbortController(), L = r ?? 1e4, Ue = window.setTimeout(() => V.abort(), L);
      try {
        const ge = await fetch(`${e}/refresh`, {
          method: "POST",
          headers: Object.keys(b).length > 0 ? b : void 0,
          credentials: "include",
          body: E ? JSON.stringify({ refreshToken: s }) : void 0,
          signal: V.signal
        });
        if (!ge.ok)
          throw new Error("Token refresh failed");
        const z = await ge.json();
        if (z.tokens) {
          if (!Ne(z.tokens))
            throw new Error("Invalid token response structure");
          c.current?.setTokens(z.tokens);
        } else if (h.storage !== "cookie")
          throw new Error("Token refresh failed");
        w.current?.broadcastRefresh();
      } finally {
        window.clearTimeout(Ue);
      }
    })();
    f.current = N;
    try {
      await N;
    } finally {
      f.current = null;
    }
  }, [e, h.storage, r]), g = k(() => {
    if (h.storage === "cookie") return;
    const s = c.current?.getAccessToken();
    if (s)
      return { Authorization: `Bearer ${s}` };
  }, [h.storage]), C = k(() => {
    c.current?.clear(), Q(null), u("unauthenticated"), B.current?.onSessionExpired?.();
  }, [u, Q]);
  K(() => {
    c.current && (h.autoRefresh && c.current.setRefreshCallback(a), c.current.setSessionExpiredCallback(C));
  }, [h.autoRefresh, a, C]);
  const d = k(async () => {
    try {
      const s = await fetch(`${e}/user`, {
        credentials: "include",
        headers: g()
      });
      if (s.ok) {
        const E = await s.json();
        if (X(E)) {
          Q(E.user), u("authenticated");
          return;
        }
      }
      if (s.status === 401 && h.autoRefresh) {
        try {
          await a();
        } catch {
          C();
          return;
        }
        const E = await fetch(`${e}/user`, {
          credentials: "include",
          headers: g()
        });
        if (E.ok) {
          const F = await E.json();
          if (X(F)) {
            Q(F.user), u("authenticated");
            return;
          }
        }
      }
      Q(null), u("unauthenticated");
    } catch {
    }
  }, [
    e,
    h.autoRefresh,
    a,
    g,
    C,
    u,
    Q
  ]);
  K(() => {
    !w.current || !h.syncTabs || w.current.setCallback((s) => {
      switch (s.type) {
        case "login":
          Q(s.user), u("authenticated");
          break;
        case "logout":
          Q(null), u("unauthenticated"), c.current?.clear();
          break;
        case "refresh":
          d();
          break;
        default:
          console.warn("[Cedros Login] Unhandled tab sync event:", s);
      }
    });
  }, [h.syncTabs, d, u, Q]), K(() => {
    const s = new AbortController(), E = r ?? 1e4, F = window.setTimeout(() => s.abort(), E);
    return (async () => {
      u("loading");
      try {
        const N = await fetch(`${e}/user`, {
          credentials: "include",
          headers: g(),
          signal: s.signal
        });
        if (N.ok) {
          const V = await N.json();
          if (X(V)) {
            Q(V.user), u("authenticated");
            return;
          }
        }
        if (N.status === 401 && h.autoRefresh) {
          try {
            await a();
          } catch {
            C();
            return;
          }
          const V = await fetch(`${e}/user`, {
            credentials: "include",
            headers: g(),
            signal: s.signal
          });
          if (V.ok) {
            const L = await V.json();
            if (X(L)) {
              Q(L.user), u("authenticated");
              return;
            }
          }
        }
        Q(null), u("unauthenticated");
      } catch {
        Q(null), u("unauthenticated");
      }
    })(), () => {
      window.clearTimeout(F), s.abort();
    };
  }, [
    e,
    h.autoRefresh,
    a,
    g,
    C,
    u,
    Q,
    r
  ]);
  const D = k(
    (s, E) => {
      Q(s), u("authenticated"), E && c.current?.setTokens(E), p.current && w.current?.broadcastLogin(s);
    },
    [Q, u]
  ), y = k(async () => {
    const s = ne();
    try {
      await fetch(`${e}/logout`, {
        method: "POST",
        headers: {
          ...s ? { "X-CSRF-Token": s } : {},
          ...g() ?? {}
        },
        credentials: "include"
      });
    } catch {
    } finally {
      Q(null), u("unauthenticated"), c.current?.clear(), w.current?.broadcastLogout(), B.current?.onLogout?.();
    }
  }, [e, g, Q, u]), l = k(() => c.current?.getAccessToken() ?? null, []);
  return {
    user: n,
    authState: o,
    handleLoginSuccess: D,
    logout: y,
    refreshUser: d,
    getAccessToken: l
  };
}
function Be() {
  const e = we(ae);
  if (!e)
    throw new Error("useCedrosLogin must be used within a CedrosLoginProvider");
  return e;
}
function de() {
  return we(ae);
}
const Oe = {
  mCost: 19456,
  // 19 MiB
  tCost: 2,
  pCost: 1
};
function Pe(e) {
  return e.length === 16;
}
function xe(e) {
  if (e.length === 16) return !0;
  if (e.length < 18) return !1;
  const t = e[0];
  return !(t !== 128 && t !== 8);
}
function Ye(e) {
  return e.length === 32;
}
function ve(e) {
  return e.length === 12;
}
function Te(e) {
  return e.length >= 16;
}
function Re(e) {
  return e.length === 32;
}
function Le(e) {
  if (!Pe(e))
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  return e;
}
function qt(e) {
  if (!xe(e))
    throw new Error(`Invalid share length: expected >=16, got ${e.length}`);
  return e;
}
function Ee(e) {
  if (!Ye(e))
    throw new Error(`Invalid key length: expected 32, got ${e.length}`);
  return e;
}
function Xe(e) {
  if (!ve(e))
    throw new Error(`Invalid nonce length: expected 12, got ${e.length}`);
  return e;
}
function We(e) {
  if (!Te(e))
    throw new Error(`Invalid salt length: expected >=16, got ${e.length}`);
  return e;
}
function je(e) {
  if (!Re(e))
    throw new Error(`Invalid PRF salt length: expected 32, got ${e.length}`);
  return e;
}
function x(e) {
  return new Uint8Array(e);
}
function q(e) {
  if (typeof crypto > "u" || !crypto.getRandomValues)
    throw new Error(
      "WebCrypto API not available. Secure random generation requires a modern browser."
    );
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), t;
}
function _t() {
  return Le(q(16));
}
function Ze() {
  return Xe(q(12));
}
function $t() {
  return We(q(16));
}
function qe() {
  return je(q(32));
}
function pe(e) {
  if (!(!e || e.length === 0)) {
    e.fill(0);
    for (let t = 0; t < e.length; t++)
      e[t] = t * 90 & 255;
    e.fill(0);
  }
}
function zt(...e) {
  for (const t of e)
    t && pe(t);
}
async function _e(e) {
  return crypto.subtle.importKey(
    "raw",
    x(e),
    { name: "AES-GCM", length: 256 },
    !1,
    // not extractable
    ["encrypt", "decrypt"]
  );
}
async function $e(e, t, A) {
  const r = A ?? Ze(), n = await _e(t), i = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: x(r) },
    n,
    x(e)
  );
  return {
    ciphertext: new Uint8Array(i),
    nonce: r
  };
}
async function eA(e, t) {
  const A = await $e(e, t);
  return {
    ciphertext: Z(A.ciphertext),
    nonce: Z(A.nonce)
  };
}
function Z(e) {
  const A = [];
  for (let r = 0; r < e.length; r += 32768) {
    const n = e.subarray(r, Math.min(r + 32768, e.length));
    A.push(String.fromCharCode(...n));
  }
  return btoa(A.join(""));
}
function ze(e) {
  let t;
  try {
    t = atob(e);
  } catch {
    throw new Error("Invalid base64 string: input is malformed or contains invalid characters");
  }
  const A = new Uint8Array(t.length);
  for (let r = 0; r < t.length; r++)
    A[r] = t.charCodeAt(r);
  return A;
}
async function et(e, t, A, r = 32) {
  const n = await crypto.subtle.importKey(
    "raw",
    x(e),
    "HKDF",
    !1,
    ["deriveBits"]
  ), i = new TextEncoder().encode(A), o = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: x(t ?? new Uint8Array(32)),
      // Zero salt if not provided
      info: x(i)
    },
    n,
    r * 8
    // bits
  );
  return new Uint8Array(o);
}
async function tA(e, t) {
  const A = await et(e, t, "cedros-wallet-share-b-encryption", 32);
  return Ee(A);
}
async function tt() {
  try {
    const e = await crypto.subtle.importKey("raw", new Uint8Array(32), "HKDF", !1, [
      "deriveBits"
    ]);
    return await crypto.subtle.deriveBits(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: new Uint8Array(32),
        info: new Uint8Array(0)
      },
      e,
      256
    ), !0;
  } catch {
    return !1;
  }
}
function Y(e, t, A, r) {
  function n(i) {
    return i instanceof A ? i : new A(function(o) {
      o(i);
    });
  }
  return new (A || (A = Promise))(function(i, o) {
    function I(B) {
      try {
        w(r.next(B));
      } catch (p) {
        o(p);
      }
    }
    function c(B) {
      try {
        w(r.throw(B));
      } catch (p) {
        o(p);
      }
    }
    function w(B) {
      B.done ? i(B.value) : n(B.value).then(I, c);
    }
    w((r = r.apply(e, [])).next());
  });
}
class S {
  constructor() {
    this.mutex = Promise.resolve();
  }
  lock() {
    let t = () => {
    };
    return this.mutex = this.mutex.then(() => new Promise(t)), new Promise((A) => {
      t = A;
    });
  }
  dispatch(t) {
    return Y(this, void 0, void 0, function* () {
      const A = yield this.lock();
      try {
        return yield Promise.resolve(t());
      } finally {
        A();
      }
    });
  }
}
var ee;
function At() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global;
}
const oe = At(), te = (ee = oe.Buffer) !== null && ee !== void 0 ? ee : null, rt = oe.TextEncoder ? new oe.TextEncoder() : null;
function ye(e, t) {
  return (e & 15) + (e >> 6 | e >> 3 & 8) << 4 | (t & 15) + (t >> 6 | t >> 3 & 8);
}
function ke(e, t) {
  const A = t.length >> 1;
  for (let r = 0; r < A; r++) {
    const n = r << 1;
    e[r] = ye(t.charCodeAt(n), t.charCodeAt(n + 1));
  }
}
function it(e, t) {
  if (e.length !== t.length * 2)
    return !1;
  for (let A = 0; A < t.length; A++) {
    const r = A << 1;
    if (t[A] !== ye(e.charCodeAt(r), e.charCodeAt(r + 1)))
      return !1;
  }
  return !0;
}
const le = 87, he = 48;
function se(e, t, A) {
  let r = 0;
  for (let n = 0; n < A; n++) {
    let i = t[n] >>> 4;
    e[r++] = i > 9 ? i + le : i + he, i = t[n] & 15, e[r++] = i > 9 ? i + le : i + he;
  }
  return String.fromCharCode.apply(null, e);
}
const M = te !== null ? (e) => {
  if (typeof e == "string") {
    const t = te.from(e, "utf8");
    return new Uint8Array(t.buffer, t.byteOffset, t.length);
  }
  if (te.isBuffer(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.length);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
} : (e) => {
  if (typeof e == "string")
    return rt.encode(e);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
}, G = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", T = new Uint8Array(256);
for (let e = 0; e < G.length; e++)
  T[G.charCodeAt(e)] = e;
function Ce(e, t = !0) {
  const A = e.length, r = A % 3, n = [], i = A - r;
  for (let o = 0; o < i; o += 3) {
    const I = (e[o] << 16 & 16711680) + (e[o + 1] << 8 & 65280) + (e[o + 2] & 255), c = G.charAt(I >> 18 & 63) + G.charAt(I >> 12 & 63) + G.charAt(I >> 6 & 63) + G.charAt(I & 63);
    n.push(c);
  }
  if (r === 1) {
    const o = e[A - 1], I = G.charAt(o >> 2), c = G.charAt(o << 4 & 63);
    n.push(`${I}${c}`), t && n.push("==");
  } else if (r === 2) {
    const o = (e[A - 2] << 8) + e[A - 1], I = G.charAt(o >> 10), c = G.charAt(o >> 4 & 63), w = G.charAt(o << 2 & 63);
    n.push(`${I}${c}${w}`), t && n.push("=");
  }
  return n.join("");
}
function nt(e) {
  let t = Math.floor(e.length * 0.75);
  const A = e.length;
  return e[A - 1] === "=" && (t -= 1, e[A - 2] === "=" && (t -= 1)), t;
}
function ot(e) {
  const t = nt(e), A = e.length, r = new Uint8Array(t);
  let n = 0;
  for (let i = 0; i < A; i += 4) {
    const o = T[e.charCodeAt(i)], I = T[e.charCodeAt(i + 1)], c = T[e.charCodeAt(i + 2)], w = T[e.charCodeAt(i + 3)];
    r[n] = o << 2 | I >> 4, n += 1, r[n] = (I & 15) << 4 | c >> 2, n += 1, r[n] = (c & 3) << 6 | w & 63, n += 1;
  }
  return r;
}
const W = 16 * 1024, v = 4, st = new S(), Ae = /* @__PURE__ */ new Map();
function Se(e, t) {
  return Y(this, void 0, void 0, function* () {
    let A = null, r = null, n = !1;
    if (typeof WebAssembly > "u")
      throw new Error("WebAssembly is not supported in this environment!");
    const i = (l, s = 0) => {
      r.set(l, s);
    }, o = () => r, I = () => A.exports, c = (l) => {
      A.exports.Hash_SetMemorySize(l);
      const s = A.exports.Hash_GetBuffer(), E = A.exports.memory.buffer;
      r = new Uint8Array(E, s, l);
    }, w = () => new DataView(A.exports.memory.buffer).getUint32(A.exports.STATE_SIZE, !0), B = st.dispatch(() => Y(this, void 0, void 0, function* () {
      if (!Ae.has(e.name)) {
        const s = ot(e.data), E = WebAssembly.compile(s);
        Ae.set(e.name, E);
      }
      const l = yield Ae.get(e.name);
      A = yield WebAssembly.instantiate(l, {
        // env: {
        //   emscripten_memcpy_big: (dest, src, num) => {
        //     const memoryBuffer = wasmInstance.exports.memory.buffer;
        //     const memView = new Uint8Array(memoryBuffer, 0);
        //     memView.set(memView.subarray(src, src + num), dest);
        //   },
        //   print_memory: (offset, len) => {
        //     const memoryBuffer = wasmInstance.exports.memory.buffer;
        //     const memView = new Uint8Array(memoryBuffer, 0);
        //     console.log('print_int32', memView.subarray(offset, offset + len));
        //   },
        // },
      });
    })), p = () => Y(this, void 0, void 0, function* () {
      A || (yield B);
      const l = A.exports.Hash_GetBuffer(), s = A.exports.memory.buffer;
      r = new Uint8Array(s, l, W);
    }), f = (l = null) => {
      n = !0, A.exports.Hash_Init(l);
    }, Q = (l) => {
      let s = 0;
      for (; s < l.length; ) {
        const E = l.subarray(s, s + W);
        s += E.length, r.set(E), A.exports.Hash_Update(E.length);
      }
    }, u = (l) => {
      if (!n)
        throw new Error("update() called before init()");
      const s = M(l);
      Q(s);
    }, h = new Uint8Array(t * 2), a = (l, s = null) => {
      if (!n)
        throw new Error("digest() called before init()");
      return n = !1, A.exports.Hash_Final(s), l === "binary" ? r.slice(0, t) : se(h, r, t);
    }, g = () => {
      if (!n)
        throw new Error("save() can only be called after init() and before digest()");
      const l = A.exports.Hash_GetState(), s = w(), E = A.exports.memory.buffer, F = new Uint8Array(E, l, s), b = new Uint8Array(v + s);
      return ke(b, e.hash), b.set(F, v), b;
    }, C = (l) => {
      if (!(l instanceof Uint8Array))
        throw new Error("load() expects an Uint8Array generated by save()");
      const s = A.exports.Hash_GetState(), E = w(), F = v + E, b = A.exports.memory.buffer;
      if (l.length !== F)
        throw new Error(`Bad state length (expected ${F} bytes, got ${l.length})`);
      if (!it(e.hash, l.subarray(0, v)))
        throw new Error("This state was written by an incompatible hash implementation");
      const N = l.subarray(v);
      new Uint8Array(b, s, E).set(N), n = !0;
    }, d = (l) => typeof l == "string" ? l.length < W / 4 : l.byteLength < W;
    let D = d;
    switch (e.name) {
      case "argon2":
      case "scrypt":
        D = () => !0;
        break;
      case "blake2b":
      case "blake2s":
        D = (l, s) => s <= 512 && d(l);
        break;
      case "blake3":
        D = (l, s) => s === 0 && d(l);
        break;
      case "xxhash64":
      // cannot simplify
      case "xxhash3":
      case "xxhash128":
      case "crc64":
        D = () => !1;
        break;
    }
    const y = (l, s = null, E = null) => {
      if (!D(l, s))
        return f(s), u(l), a("hex", E);
      const F = M(l);
      return r.set(F), A.exports.Hash_Calculate(F.length, s, E), se(h, r, t);
    };
    return yield p(), {
      getMemory: o,
      writeMemory: i,
      getExports: I,
      setMemorySize: c,
      init: f,
      update: u,
      digest: a,
      save: g,
      load: C,
      calculate: y,
      hashLength: t
    };
  });
}
new S();
var It = "argon2", at = "AGFzbQEAAAABKQVgAX8Bf2AAAX9gEH9/f39/f39/f39/f39/f38AYAR/f39/AGACf38AAwYFAAECAwQFBgEBAoCAAgYIAX8BQZCoBAsHQQQGbWVtb3J5AgASSGFzaF9TZXRNZW1vcnlTaXplAAAOSGFzaF9HZXRCdWZmZXIAAQ5IYXNoX0NhbGN1bGF0ZQAECvEyBVgBAn9BACEBAkAgAEEAKAKICCICRg0AAkAgACACayIAQRB2IABBgIB8cSAASWoiAEAAQX9HDQBB/wHADwtBACEBQQBBACkDiAggAEEQdK18NwOICAsgAcALcAECfwJAQQAoAoAIIgANAEEAPwBBEHQiADYCgAhBACgCiAgiAUGAgCBGDQACQEGAgCAgAWsiAEEQdiAAQYCAfHEgAElqIgBAAEF/Rw0AQQAPC0EAQQApA4gIIABBEHStfDcDiAhBACgCgAghAAsgAAvcDgECfiAAIAQpAwAiECAAKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAMIBAgDCkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgBCAQIAQpAwCFQiiJIhA3AwAgACAQIAApAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAwgECAMKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAEIBAgBCkDAIVCAYk3AwAgASAFKQMAIhAgASkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDSAQIA0pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAEgECABKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACANIBAgDSkDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAIgBikDACIQIAIpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIA4gECAOKQMAhUIgiSIQNwMAIAogECAKKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACACIBAgAikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDiAQIA4pAwCFQjCJIhA3AwAgCiAQIAopAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACADIAcpAwAiECADKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAPIBAgDykDAIVCIIkiEDcDACALIBAgCykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAyAQIAMpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA8gECAPKQMAhUIwiSIQNwMAIAsgECALKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgACAFKQMAIhAgACkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDyAQIA8pAwCFQiCJIhA3AwAgCiAQIAopAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAAgECAAKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAPIBAgDykDAIVCMIkiEDcDACAKIBAgCikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAEgBikDACIQIAEpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAwgECAMKQMAhUIgiSIQNwMAIAsgECALKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACABIBAgASkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDCAQIAwpAwCFQjCJIhA3AwAgCyAQIAspAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACACIAcpAwAiECACKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACANIBAgDSkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAiAQIAIpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA0gECANKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgAyAEKQMAIhAgAykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDiAQIA4pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAQgECAEKQMAhUIoiSIQNwMAIAMgECADKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAOIBAgDikDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBCAQIAQpAwCFQgGJNwMAC98aAQN/QQAhBEEAIAIpAwAgASkDAIU3A5AIQQAgAikDCCABKQMIhTcDmAhBACACKQMQIAEpAxCFNwOgCEEAIAIpAxggASkDGIU3A6gIQQAgAikDICABKQMghTcDsAhBACACKQMoIAEpAyiFNwO4CEEAIAIpAzAgASkDMIU3A8AIQQAgAikDOCABKQM4hTcDyAhBACACKQNAIAEpA0CFNwPQCEEAIAIpA0ggASkDSIU3A9gIQQAgAikDUCABKQNQhTcD4AhBACACKQNYIAEpA1iFNwPoCEEAIAIpA2AgASkDYIU3A/AIQQAgAikDaCABKQNohTcD+AhBACACKQNwIAEpA3CFNwOACUEAIAIpA3ggASkDeIU3A4gJQQAgAikDgAEgASkDgAGFNwOQCUEAIAIpA4gBIAEpA4gBhTcDmAlBACACKQOQASABKQOQAYU3A6AJQQAgAikDmAEgASkDmAGFNwOoCUEAIAIpA6ABIAEpA6ABhTcDsAlBACACKQOoASABKQOoAYU3A7gJQQAgAikDsAEgASkDsAGFNwPACUEAIAIpA7gBIAEpA7gBhTcDyAlBACACKQPAASABKQPAAYU3A9AJQQAgAikDyAEgASkD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", gt = "e4cdc523", ct = {
  name: It,
  data: at,
  hash: gt
}, lt = "blake2b", ht = "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", Ct = "c6f286e6", ut = {
  name: lt,
  data: ht,
  hash: Ct
};
new S();
function ue(e) {
  return !Number.isInteger(e) || e < 8 || e > 512 || e % 8 !== 0 ? new Error("Invalid variant! Valid values: 8, 16, ..., 512") : null;
}
function ft(e, t) {
  return e | t << 16;
}
function Ie(e = 512, t = null) {
  if (ue(e))
    return Promise.reject(ue(e));
  let A = null, r = e;
  if (t !== null) {
    if (A = M(t), A.length > 64)
      return Promise.reject(new Error("Max key length is 64 bytes"));
    r = ft(e, A.length);
  }
  const n = e / 8;
  return Se(ut, n).then((i) => {
    r > 512 && i.writeMemory(A), i.init(r);
    const o = {
      init: r > 512 ? () => (i.writeMemory(A), i.init(r), o) : () => (i.init(r), o),
      update: (I) => (i.update(I), o),
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (I) => i.digest(I),
      save: () => i.save(),
      load: (I) => (i.load(I), o),
      blockSize: 128,
      digestSize: n
    };
    return o;
  });
}
function wt(e, t, A) {
  const r = [
    `m=${t.memorySize}`,
    `t=${t.iterations}`,
    `p=${t.parallelism}`
  ].join(",");
  return `$argon2${t.hashType}$v=19$${r}$${Ce(e, !1)}$${Ce(A, !1)}`;
}
const fe = new DataView(new ArrayBuffer(4));
function J(e) {
  return fe.setInt32(0, e, !0), new Uint8Array(fe.buffer);
}
function re(e, t, A) {
  return Y(this, void 0, void 0, function* () {
    if (A <= 64) {
      const c = yield Ie(A * 8);
      return c.update(J(A)), c.update(t), c.digest("binary");
    }
    const r = Math.ceil(A / 32) - 2, n = new Uint8Array(A);
    e.init(), e.update(J(A)), e.update(t);
    let i = e.digest("binary");
    n.set(i.subarray(0, 32), 0);
    for (let c = 1; c < r; c++)
      e.init(), e.update(i), i = e.digest("binary"), n.set(i.subarray(0, 32), c * 32);
    const o = A - 32 * r;
    let I;
    return o === 64 ? (I = e, I.init()) : I = yield Ie(o * 8), I.update(i), i = I.digest("binary"), n.set(i.subarray(0, o), r * 32), n;
  });
}
function Qt(e) {
  switch (e) {
    case "d":
      return 0;
    case "i":
      return 1;
    default:
      return 2;
  }
}
function Bt(e) {
  return Y(this, void 0, void 0, function* () {
    var t;
    const { parallelism: A, iterations: r, hashLength: n } = e, i = M(e.password), o = M(e.salt), I = 19, c = Qt(e.hashType), { memorySize: w } = e, B = M((t = e.secret) !== null && t !== void 0 ? t : ""), [p, f] = yield Promise.all([
      Se(ct, 1024),
      Ie(512)
    ]);
    p.setMemorySize(w * 1024 + 1024);
    const Q = new Uint8Array(24), u = new DataView(Q.buffer);
    u.setInt32(0, A, !0), u.setInt32(4, n, !0), u.setInt32(8, w, !0), u.setInt32(12, r, !0), u.setInt32(16, I, !0), u.setInt32(20, c, !0), p.writeMemory(Q, w * 1024), f.init(), f.update(Q), f.update(J(i.length)), f.update(i), f.update(J(o.length)), f.update(o), f.update(J(B.length)), f.update(B), f.update(J(0));
    const a = Math.floor(w / (A * 4)) * 4, g = new Uint8Array(72), C = f.digest("binary");
    g.set(C);
    for (let y = 0; y < A; y++) {
      g.set(J(0), 64), g.set(J(y), 68);
      let l = y * a, s = yield re(f, g, 1024);
      p.writeMemory(s, l * 1024), l += 1, g.set(J(1), 64), s = yield re(f, g, 1024), p.writeMemory(s, l * 1024);
    }
    const d = new Uint8Array(1024);
    ke(d, p.calculate(new Uint8Array([]), w));
    const D = yield re(f, d, n);
    if (e.outputType === "hex") {
      const y = new Uint8Array(n * 2);
      return se(y, D, n);
    }
    return e.outputType === "encoded" ? wt(o, e, D) : D;
  });
}
const dt = (e) => {
  var t;
  if (!e || typeof e != "object")
    throw new Error("Invalid options parameter. It requires an object.");
  if (!e.password)
    throw new Error("Password must be specified");
  if (e.password = M(e.password), e.password.length < 1)
    throw new Error("Password must be specified");
  if (!e.salt)
    throw new Error("Salt must be specified");
  if (e.salt = M(e.salt), e.salt.length < 8)
    throw new Error("Salt should be at least 8 bytes long");
  if (e.secret = M((t = e.secret) !== null && t !== void 0 ? t : ""), !Number.isInteger(e.iterations) || e.iterations < 1)
    throw new Error("Iterations should be a positive number");
  if (!Number.isInteger(e.parallelism) || e.parallelism < 1)
    throw new Error("Parallelism should be a positive number");
  if (!Number.isInteger(e.hashLength) || e.hashLength < 4)
    throw new Error("Hash length should be at least 4 bytes.");
  if (!Number.isInteger(e.memorySize))
    throw new Error("Memory size should be specified.");
  if (e.memorySize < 8 * e.parallelism)
    throw new Error("Memory size should be at least 8 * parallelism.");
  if (e.outputType === void 0 && (e.outputType = "hex"), !["hex", "binary", "encoded"].includes(e.outputType))
    throw new Error(`Insupported output type ${e.outputType}. Valid values: ['hex', 'binary', 'encoded']`);
};
function De(e) {
  return Y(this, void 0, void 0, function* () {
    return dt(e), Bt(Object.assign(Object.assign({}, e), { hashType: "id" }));
  });
}
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
new S();
const Et = 32;
async function AA(e, t, A = Oe) {
  pt(A);
  try {
    const r = await De({
      password: e,
      salt: t,
      iterations: A.tCost,
      memorySize: A.mCost,
      parallelism: A.pCost,
      hashLength: Et,
      outputType: "binary"
    });
    return Ee(r);
  } catch {
    throw new Error("Key derivation failed");
  }
}
function pt(e) {
  if (e.mCost < 16384)
    throw new Error("KDF memory cost too low (minimum 16 MiB)");
  if (e.mCost > 1048576)
    throw new Error("KDF memory cost too high (maximum 1 GiB)");
  if (e.tCost < 1)
    throw new Error("KDF time cost must be at least 1");
  if (e.tCost > 10)
    throw new Error("KDF time cost too high (maximum 10)");
  if (e.pCost < 1)
    throw new Error("KDF parallelism must be at least 1");
  if (e.pCost > 4)
    throw new Error("KDF parallelism too high (maximum 4)");
}
async function yt() {
  try {
    const e = await De({
      password: "test",
      salt: new Uint8Array(16),
      iterations: 1,
      memorySize: 1024,
      // 1 MiB for quick test
      parallelism: 1,
      hashLength: 32,
      outputType: "binary"
    });
    return e.length !== 32 ? !1 : (pe(e), !0);
  } catch {
    return !1;
  }
}
function kt(e) {
  return e === "localhost" || e === "127.0.0.1" || e.endsWith(".localhost");
}
function Fe(e) {
  if (typeof window > "u")
    return;
  const t = window.location.hostname;
  if (!kt(t)) {
    console.warn(
      "[Cedros] SEC-004: WebAuthn RP domain validation not configured. In production, set wallet.allowedRpDomains to prevent passkey phishing."
    );
    return;
  }
}
function _() {
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator.credentials < "u";
}
async function St() {
  if (!_())
    return !1;
  try {
    if (!await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
      return !1;
    if ("getClientCapabilities" in PublicKeyCredential && typeof PublicKeyCredential.getClientCapabilities == "function") {
      const t = await PublicKeyCredential.getClientCapabilities();
      if (t && "prf" in t)
        return t.prf === !0;
    }
    return !0;
  } catch {
    return !1;
  }
}
async function rA(e, t, A, r, n) {
  if (!_())
    throw new Error("WebAuthn is not available in this browser");
  Fe();
  const i = r ?? qe(), o = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        name: "Cedros Wallet",
        id: window.location.hostname
      },
      user: {
        id: x(e),
        name: t,
        displayName: A
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        // ES256
        { type: "public-key", alg: -257 }
        // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "required"
      },
      timeout: 6e4,
      attestation: "none",
      extensions: {
        prf: {
          eval: {
            first: i
          }
        }
      }
    }
  });
  if (!o)
    throw new Error("Passkey registration was cancelled");
  const I = o.getClientExtensionResults();
  if (!I.prf?.enabled || !I.prf?.results?.first)
    throw new Error(
      "PRF extension is not supported by this authenticator. Please use a device with a compatible platform authenticator."
    );
  const c = I.prf?.results?.first;
  if (!c)
    throw new Error("PRF extension did not return a result");
  const w = new Uint8Array(c);
  if (w.length !== 32)
    throw new Error(
      `Unexpected PRF output length: expected 32 bytes, got ${w.length}. The authenticator may not be compatible.`
    );
  return {
    credentialId: Z(new Uint8Array(o.rawId)),
    prfSalt: Z(i),
    prfOutput: w
  };
}
async function iA(e, t) {
  if (!_())
    throw new Error("WebAuthn is not available in this browser");
  Fe();
  const A = ze(e), r = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId: window.location.hostname,
      // Empty allowCredentials lets browser show all discoverable credentials
      allowCredentials: [],
      userVerification: "required",
      timeout: 6e4,
      extensions: {
        prf: {
          eval: {
            first: A
          }
        }
      }
    }
  });
  if (!r)
    throw new Error("Passkey authentication was cancelled");
  const i = r.getClientExtensionResults().prf?.results?.first;
  if (!i)
    throw new Error("PRF extension did not return a result during authentication");
  return {
    prfOutput: new Uint8Array(i)
  };
}
async function Dt() {
  const [e, t, A, r, n, i, o] = await Promise.all([
    Ft(),
    Ut(),
    tt(),
    mt(),
    Promise.resolve(_()),
    St(),
    yt()
  ]);
  return {
    webCrypto: e,
    aesGcm: t,
    hkdf: A,
    ed25519: r,
    webAuthn: n,
    webAuthnPrf: i,
    argon2: o,
    allSupported: e && t && A && n && i && o
  };
}
async function Ft() {
  try {
    return typeof crypto < "u" && typeof crypto.subtle < "u" && typeof crypto.getRandomValues == "function";
  } catch {
    return !1;
  }
}
async function Ut() {
  try {
    const e = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, !1, [
      "encrypt",
      "decrypt"
    ]), t = new Uint8Array([1, 2, 3, 4]), A = crypto.getRandomValues(new Uint8Array(12)), r = await crypto.subtle.encrypt({ name: "AES-GCM", iv: A }, e, t), n = await crypto.subtle.decrypt({ name: "AES-GCM", iv: A }, e, r), i = new Uint8Array(n);
    return i.length === t.length && i.every((o, I) => o === t[I]);
  } catch {
    return !1;
  }
}
async function mt() {
  try {
    return await crypto.subtle.generateKey("Ed25519", !1, ["sign", "verify"]), !0;
  } catch {
    return !1;
  }
}
function nA(e) {
  if (e.allSupported)
    return null;
  const t = [];
  return e.webCrypto || t.push("Web Crypto API"), e.aesGcm || t.push("AES-GCM encryption"), e.hkdf || t.push("HKDF key derivation"), e.webAuthn || t.push("WebAuthn/Passkeys"), e.webAuthnPrf || t.push("WebAuthn PRF extension (requires platform authenticator)"), e.argon2 || t.push("Argon2 password hashing"), t.length === 0 ? null : `Your browser or device is missing required features: ${t.join(", ")}. Please use a modern browser with a platform authenticator (e.g., Touch ID, Face ID, Windows Hello).`;
}
function oA() {
  const e = typeof navigator < "u" ? navigator.userAgent : "", t = e.match(/Chrome\/(\d+)/);
  if (t) {
    const i = parseInt(t[1], 10);
    return {
      browser: "Chrome",
      version: t[1],
      likelySupported: i >= 116
    };
  }
  const A = e.match(/Version\/(\d+)/);
  if (A && e.includes("Safari") && !e.includes("Chrome")) {
    const i = parseInt(A[1], 10);
    return {
      browser: "Safari",
      version: A[1],
      likelySupported: i >= 17
    };
  }
  const r = e.match(/Firefox\/(\d+)/);
  if (r)
    return {
      browser: "Firefox",
      version: r[1],
      likelySupported: !1
      // Firefox PRF support is limited
    };
  const n = e.match(/Edg\/(\d+)/);
  if (n) {
    const i = parseInt(n[1], 10);
    return {
      browser: "Edge",
      version: n[1],
      likelySupported: i >= 116
    };
  }
  return {
    browser: "Unknown",
    version: "Unknown",
    likelySupported: !1
  };
}
let j = null;
async function bt(e = !1) {
  return !e && j !== null || (j = await Dt()), j;
}
const Gt = 1e4, Kt = 2;
function Ht(e, t) {
  return {
    code: e.code || "SERVER_ERROR",
    message: e.message || t,
    details: e.details
  };
}
function Jt() {
  return {
    code: "NETWORK_ERROR",
    message: "Unable to connect to server"
  };
}
async function Mt(e, t, A) {
  const r = new AbortController(), n = setTimeout(() => r.abort(), A);
  try {
    return await fetch(e, {
      ...t,
      signal: r.signal
    });
  } finally {
    clearTimeout(n);
  }
}
function Nt(e) {
  if (e instanceof Error) {
    if (e.retryable) return !0;
    if (e.name === "AbortError") return !1;
    if (e.message.includes("fetch")) return !0;
  }
  return !1;
}
function Vt(e) {
  return new Promise((t) => setTimeout(t, e));
}
class Ot {
  baseUrl;
  timeoutMs;
  retryAttempts;
  getAccessToken;
  constructor(t) {
    this.baseUrl = t.baseUrl, this.timeoutMs = t.timeoutMs ?? Gt, this.retryAttempts = t.retryAttempts ?? Kt, this.getAccessToken = t.getAccessToken;
  }
  /**
   * Make an API request with timeout and optional retry
   */
  async request(t) {
    const { method: A, path: r, body: n, credentials: i = "include", skipRetry: o = !1, validator: I } = t, c = `${this.baseUrl}${r}`, B = o || !(A === "GET" || A === "HEAD" || A === "PUT" || A === "DELETE") ? 1 : this.retryAttempts + 1, p = {};
    n !== void 0 && (p["Content-Type"] = "application/json");
    const f = this.getAccessToken?.();
    f && (p.Authorization = `Bearer ${f}`);
    const Q = ne();
    Q && (p["X-CSRF-Token"] = Q);
    let u;
    for (let h = 1; h <= B; h++)
      try {
        const a = await Mt(
          c,
          {
            method: A,
            headers: p,
            credentials: i,
            body: n !== void 0 ? JSON.stringify(n) : void 0
          },
          this.timeoutMs
        ), g = a.headers.get("content-type") || "";
        let C = {};
        if (g.includes("application/json")) {
          if (a.status !== 204)
            try {
              C = await a.json();
            } catch (d) {
              const D = d instanceof Error ? d.message : "parse failed";
              throw new Error(`Invalid JSON response: ${D}`);
            }
        } else {
          const d = await a.text();
          if (d) {
            const D = d.length > 200 ? d.slice(0, 200) + "..." : d;
            C = {
              message: g.includes("text/html") || d.trimStart().startsWith("<") ? `Unexpected HTML response (${a.status}). The server may be unavailable.` : D
            };
          }
        }
        if (!a.ok) {
          if (a.status >= 400 && a.status < 500)
            throw { isApiError: !0, data: C, status: a.status };
          const d = new Error(`Server error: ${a.status}`);
          throw d.retryable = !0, d;
        }
        if (I)
          try {
            return I(C);
          } catch (d) {
            throw new Error(
              `Response validation failed: ${d instanceof Error ? d.message : "Invalid response shape"}`
            );
          }
        return C;
      } catch (a) {
        if (u = a, typeof a == "object" && a !== null && "isApiError" in a)
          throw a;
        if (h < B && Nt(a)) {
          await Vt(100 * Math.pow(2, h - 1));
          continue;
        }
        throw a;
      }
    throw u;
  }
  /**
   * POST request helper
   */
  async post(t, A, r) {
    return this.request({ method: "POST", path: t, body: A, ...r });
  }
  /**
   * GET request helper
   */
  async get(t, A) {
    return this.request({ method: "GET", path: t, ...A });
  }
  /**
   * PATCH request helper
   */
  async patch(t, A, r) {
    return this.request({ method: "PATCH", path: t, body: A, ...r });
  }
  /**
   * DELETE request helper
   */
  async delete(t, A) {
    return this.request({ method: "DELETE", path: t, ...A });
  }
}
function Pt(e) {
  return typeof e == "object" && e !== null && "isApiError" in e;
}
function xt(e) {
  return typeof e == "object" && e !== null && "code" in e && "message" in e;
}
function H(e, t) {
  if (xt(e))
    return e;
  if (Pt(e))
    return Ht(e.data, t);
  if (e instanceof Error) {
    if (e.name === "AbortError")
      return {
        code: "NETWORK_ERROR",
        message: "Request timed out"
      };
    if (e.message.startsWith("Server error:") || e.message.startsWith("Invalid JSON response"))
      return {
        code: "SERVER_ERROR",
        message: t
      };
  }
  return Jt();
}
function Yt(e) {
  switch (e.type) {
    case "password":
      return { password: e.password };
    case "prfOutput":
      return { prfOutput: e.prfOutput };
  }
}
function vt() {
  const e = de(), [t, A] = U(!1), [r, n] = U(null), i = O(() => e ? new Ot({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), o = k(async () => {
    if (!i)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), n(null);
    try {
      return await i.get("/wallet/status");
    } catch (a) {
      const g = H(a, "Failed to fetch wallet status");
      throw n(g.message), g;
    } finally {
      A(!1);
    }
  }, [i]), I = k(async () => {
    if (!i)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), n(null);
    try {
      return await i.get("/wallet/material");
    } catch (a) {
      const g = H(a, "Failed to fetch wallet material");
      if (g.code === "NOT_FOUND")
        return null;
      throw n(g.message), g;
    } finally {
      A(!1);
    }
  }, [i]), c = k(
    async (a) => {
      if (!i)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), n(null);
      try {
        await i.post("/wallet/enroll", a);
      } catch (g) {
        const C = H(g, "Failed to enroll wallet");
        throw n(C.message), C;
      } finally {
        A(!1);
      }
    },
    [i]
  ), w = k(
    async (a) => {
      if (!i)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), n(null);
      try {
        await i.post("/wallet/recover", a);
      } catch (g) {
        const C = H(g, "Failed to recover wallet");
        throw n(C.message), C;
      } finally {
        A(!1);
      }
    },
    [i]
  ), B = k(
    async (a) => {
      if (!i)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), n(null);
      try {
        return await i.post("/wallet/sign", a);
      } catch (g) {
        const C = H(g, "Failed to sign transaction");
        throw n(C.message), C;
      } finally {
        A(!1);
      }
    },
    [i]
  ), p = k(
    async (a) => {
      if (!i)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), n(null);
      try {
        await i.post("/wallet/rotate-user-secret", a);
      } catch (g) {
        const C = H(g, "Failed to rotate user secret");
        throw n(C.message), C;
      } finally {
        A(!1);
      }
    },
    [i]
  ), f = k(
    async (a) => {
      if (!i)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), n(null);
      try {
        return await i.post(
          "/wallet/unlock",
          Yt(a)
        );
      } catch (g) {
        const C = H(g, "Failed to unlock wallet");
        throw n(C.message), C;
      } finally {
        A(!1);
      }
    },
    [i]
  ), Q = k(async () => {
    if (!i)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), n(null);
    try {
      await i.post("/wallet/lock", {});
    } catch (a) {
      const g = H(a, "Failed to lock wallet");
      throw n(g.message), g;
    } finally {
      A(!1);
    }
  }, [i]), u = k(
    async (a) => {
      if (!i)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), n(null);
      try {
        return await i.post("/wallet/share-b", a);
      } catch (g) {
        const C = H(g, "Failed to get Share B for recovery");
        throw n(C.message), C;
      } finally {
        A(!1);
      }
    },
    [i]
  ), h = k(() => n(null), []);
  return {
    getStatus: o,
    getMaterial: I,
    enroll: c,
    recover: w,
    signTransaction: B,
    rotateUserSecret: p,
    unlock: f,
    lock: Q,
    getShareBForRecovery: u,
    isLoading: t,
    error: r,
    clearError: h
  };
}
const Tt = {
  status: "not_enrolled",
  solanaPubkey: null,
  authMethod: null,
  hasExternalWallet: !1,
  isUnlocked: !1,
  capabilities: null,
  isSupported: !1,
  error: null,
  refresh: async () => {
  },
  clearError: () => {
  }
};
function Rt() {
  const t = de() !== null, [A, r] = U("loading"), [n, i] = U(null), [o, I] = U(null), [c, w] = U(!1), [B, p] = U(!1), [f, Q] = U(null), [u, h] = U(null), { getStatus: a, isLoading: g } = vt(), C = P(!1);
  K(() => {
    if (!t) return;
    let y = !1;
    return (async () => {
      try {
        const s = await bt();
        if (y) return;
        Q(s), s.allSupported || (r("error"), h(
          "Your browser or device does not support all required features. Please use a modern browser with a platform authenticator."
        ));
      } catch {
        if (y) return;
        Q(null), r("error"), h("Failed to check crypto capabilities");
      }
    })(), () => {
      y = !0;
    };
  }, [t]);
  const d = k(async () => {
    if (!(!t || !f?.allSupported)) {
      r("loading"), h(null);
      try {
        const y = await a();
        i(y.solanaPubkey ?? null), I(y.authMethod ?? null), w(y.hasExternalWallet), p(y.unlocked), y.hasExternalWallet ? r("enrolled_unlocked") : y.enrolled ? r(y.unlocked ? "enrolled_unlocked" : "enrolled_locked") : r("not_enrolled");
      } catch (y) {
        r("error"), h(y instanceof Error ? y.message : "Failed to fetch wallet status");
      }
    }
  }, [t, f?.allSupported, a]);
  K(() => {
    t && f?.allSupported && !g && !C.current && (C.current = !0, d());
  }, [t, f?.allSupported, g, d]);
  const D = k(() => h(null), []);
  return t ? {
    status: A,
    solanaPubkey: n,
    authMethod: o,
    hasExternalWallet: c,
    isUnlocked: B,
    capabilities: f,
    isSupported: f?.allSupported ?? !1,
    error: u,
    refresh: d,
    clearError: D
  } : Tt;
}
const $ = "__CEDROS_EMBEDDED_WALLET__";
function Lt(e) {
  typeof window < "u" && (window[$] = e);
}
function ie() {
  typeof window < "u" && delete window[$];
}
function sA() {
  return typeof window > "u" ? !1 : window[$]?.available ?? !1;
}
function IA() {
  return typeof window > "u" ? null : window[$] ?? null;
}
function Xt() {
  const { config: e, user: t } = Be(), { status: A, solanaPubkey: r, hasExternalWallet: n } = Rt(), i = e.wallet?.exposeAvailability ?? !1, o = e.wallet?.exposePublicKey ?? !1;
  return K(() => {
    if (!i || !t) {
      ie();
      return;
    }
    if (n) {
      ie();
      return;
    }
    if (A === "loading")
      return;
    const I = A === "enrolled_locked" || A === "enrolled_unlocked";
    return Lt({
      available: I,
      publicKey: o && I ? r : null
    }), () => {
      ie();
    };
  }, [i, o, t, A, r, n]), null;
}
function aA({ config: e, children: t }) {
  const [A, r] = U(null), [n, i] = U(!1), o = O(
    () => JSON.stringify(e.themeOverrides ?? null),
    [e.themeOverrides]
  ), I = O(() => JSON.stringify(e.session ?? null), [e.session]), c = O(() => JSON.stringify(e.features ?? null), [e.features]), w = O(() => JSON.stringify(e.forms ?? null), [e.forms]), B = O(
    () => e,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Using serialized keys for deep comparison
    [
      e.serverUrl,
      e.googleClientId,
      e.requestTimeout,
      e.retryAttempts,
      e.theme,
      o,
      I,
      c,
      w,
      e.callbacks
    ]
  );
  be({
    theme: B.theme,
    themeOverrides: B.themeOverrides
  });
  const {
    user: p,
    authState: f,
    handleLoginSuccess: Q,
    logout: u,
    refreshUser: h,
    getAccessToken: a
  } = Ve({
    serverUrl: B.serverUrl,
    session: B.session,
    callbacks: B.callbacks,
    requestTimeoutMs: B.requestTimeout
  }), g = k(async () => {
    r(null), await u();
  }, [u]), C = k(
    (...l) => {
      r(null), Q(...l);
    },
    [Q]
  ), d = k(() => i(!0), []), D = k(() => i(!1), []), y = O(
    () => ({
      config: B,
      user: p,
      authState: f,
      error: A,
      logout: g,
      refreshUser: h,
      isModalOpen: n,
      openModal: d,
      closeModal: D,
      _internal: {
        handleLoginSuccess: C,
        getAccessToken: a
      }
    }),
    [
      B,
      p,
      f,
      A,
      g,
      h,
      n,
      d,
      D,
      C,
      a
    ]
  );
  return /* @__PURE__ */ R(ae.Provider, { value: y, children: [
    /* @__PURE__ */ m(Xt, {}),
    t
  ] });
}
function gA() {
  const { user: e, authState: t, error: A, logout: r, refreshUser: n, openModal: i, closeModal: o } = Be();
  return {
    user: e,
    authState: t,
    error: A,
    isAuthenticated: t === "authenticated" && e !== null,
    isLoading: t === "loading",
    logout: r,
    refreshUser: n,
    openLoginModal: i,
    closeLoginModal: o
  };
}
const Wt = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48
  // H-04: Added for WalletUnlock component
}, cA = Qe(function({
  size: t = "md",
  className: A = "",
  style: r,
  label: n = "Loading",
  announce: i = !1
}) {
  const o = Wt[t], I = /* @__PURE__ */ R(
    "svg",
    {
      className: `cedros-spinner ${A}`,
      width: o,
      height: o,
      viewBox: "0 0 24 24",
      fill: "none",
      style: r,
      "aria-label": n,
      role: "status",
      "aria-hidden": i ? "true" : void 0,
      children: [
        /* @__PURE__ */ m(
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
        /* @__PURE__ */ m(
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
            children: /* @__PURE__ */ m(
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
  return i ? /* @__PURE__ */ R("span", { "aria-live": "polite", "aria-busy": "true", children: [
    I,
    /* @__PURE__ */ m("span", { className: "cedros-sr-only", children: n })
  ] }) : I;
}), lA = Qe(function({
  error: t,
  className: A = "",
  onDismiss: r,
  autoFocus: n = !1
}) {
  const i = P(null);
  if (K(() => {
    t && n && i.current && i.current.focus();
  }, [t, n]), !t) return null;
  const o = typeof t == "string" ? t : t.message;
  return /* @__PURE__ */ R(
    "div",
    {
      ref: i,
      className: `cedros-error ${A}`,
      role: "alert",
      "aria-live": "assertive",
      tabIndex: n ? -1 : void 0,
      children: [
        /* @__PURE__ */ R(
          "svg",
          {
            className: "cedros-error-icon",
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ m("circle", { cx: "8", cy: "8", r: "7", stroke: "currentColor", strokeWidth: "1.5" }),
              /* @__PURE__ */ m("path", { d: "M8 4.5v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
              /* @__PURE__ */ m("circle", { cx: "8", cy: "11", r: "0.75", fill: "currentColor" })
            ]
          }
        ),
        /* @__PURE__ */ m("span", { className: "cedros-error-message", children: o }),
        r && /* @__PURE__ */ m(
          "button",
          {
            type: "button",
            className: "cedros-error-dismiss",
            onClick: r,
            "aria-label": "Dismiss error",
            children: /* @__PURE__ */ m("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ m(
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
  Ot as A,
  aA as C,
  Oe as D,
  lA as E,
  cA as L,
  gA as a,
  AA as b,
  Le as c,
  $t as d,
  eA as e,
  Ee as f,
  _t as g,
  H as h,
  Z as i,
  zt as j,
  nA as k,
  oA as l,
  de as m,
  vt as n,
  qe as o,
  iA as p,
  tA as q,
  rA as r,
  Yt as s,
  qt as t,
  Be as u,
  ze as v,
  pe as w,
  Rt as x,
  sA as y,
  IA as z
};
