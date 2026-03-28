import { jsx as z, jsxs as Me } from "react/jsx-runtime";
import { useMemo as M, useEffect as Y, useState as D, useRef as v, useCallback as d } from "react";
import { h as Ve, d as ve, i as Ne, A as Oe, e as Ye, C as Pe } from "./featureFlags-_5x_2FxU.js";
import { A as Se, g as se, a as Fe, h as V, u as De } from "./useCedrosLogin-aNpnZjyZ.js";
let ee = 0;
function xe({ theme: e, themeOverrides: A }) {
  const t = M(() => typeof window > "u" ? !1 : e === "dark" ? !0 : e === "light" ? !1 : window.matchMedia("(prefers-color-scheme: dark)").matches, [e]);
  Y(() => {
    if (typeof document > "u") return;
    const n = document.documentElement;
    let s = !1;
    return t ? (ee++, s = !0, n.classList.add("cedros-dark")) : ee === 0 && n.classList.remove("cedros-dark"), () => {
      s && (ee--, ee === 0 && n.classList.remove("cedros-dark"));
    };
  }, [t]);
  const i = t ? "cedros-dark" : "", r = M(() => {
    if (!A) return {};
    const n = {};
    for (const [s, c] of Object.entries(A))
      c && (n[s] = c);
    return n;
  }, [A]);
  return { className: i, style: r };
}
const Te = Ve();
function Re(e, A, t) {
  const [i, r] = D(null), [n, s] = D(), [c, h] = D(), [o, p] = D(), [E, Q] = D(), [m, U] = D(), [u, B] = D(), [g, b] = D(A), y = v(!1);
  return Y(() => {
    if (!A || y.current) return;
    y.current = !0, new Se({
      baseUrl: e,
      timeoutMs: t ?? 5e3,
      retryAttempts: 1
    }).get("/features", { credentials: "omit" }).then((C) => {
      r({
        email: C.email,
        google: C.google,
        apple: C.apple,
        solana: C.solana,
        webauthn: C.webauthn,
        instantLink: C.instantLink
      }), s(C.googleClientId), h(C.appleClientId), p(C.usernameEnabled), Q(C.walletEnrollEnabled), U(C.showRecoveryEnabled), B(C.socialButtonOrder);
    }).catch(() => {
      r(Te);
    }).finally(() => {
      b(!1);
    });
  }, [A, e, t]), { features: i, googleClientId: n, appleClientId: c, usernameEnabled: o, walletEnrollEnabled: E, showRecoveryEnabled: m, socialButtonOrder: u, isLoading: g };
}
const Le = "cedros_tokens", Xe = 6e4;
class We {
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
  // S-13: Prevent onSessionExpired from firing multiple times
  sessionExpiredFired = !1;
  allowWebStorage;
  constructor(A = "cookie", t = Le, i = {}) {
    this.requestedStorage = A, this.storage = A, this.storageKey = t, this.allowWebStorage = i.allowWebStorage ?? !1, this.warnIfLocalStorage(), !this.allowWebStorage && (this.requestedStorage === "localStorage" || this.requestedStorage === "sessionStorage") && (this.storage = "memory"), this.loadFromStorage();
  }
  /**
   * S-18/UI-XSS: Warn about localStorage XSS vulnerability in all environments.
   * Security warnings should not be suppressed in production - operators need
   * to be aware of the security implications of their storage choices.
   */
  warnIfLocalStorage() {
    if ((this.requestedStorage === "localStorage" || this.requestedStorage === "sessionStorage") && typeof console < "u") {
      const A = this.allowWebStorage ? "" : " (web storage disabled by default; set allowWebStorage=true to enable)";
      console.warn(
        "[cedros-login] SECURITY: Using web storage for token storage. Tokens are vulnerable to XSS attacks." + A + " PRODUCTION RECOMMENDATIONS: (1) Use httpOnly cookie storage instead, (2) If web storage required: implement strict Content-Security-Policy, sanitize all input/output, audit third-party scripts. See https://owasp.org/www-community/attacks/xss/"
      );
    }
  }
  /**
   * Set the callback for when tokens need to be refreshed
   */
  setRefreshCallback(A) {
    this.onRefreshNeeded = A, this.scheduleRefresh();
  }
  /**
   * Set the callback for when session expires
   */
  setSessionExpiredCallback(A) {
    this.onSessionExpired = A;
  }
  /**
   * Set the callback for when token refresh fails
   * This allows the UI to show an error message to the user
   */
  setRefreshErrorCallback(A) {
    this.onRefreshError = A;
  }
  /**
   * Store tokens and schedule auto-refresh
   */
  setTokens(A) {
    this.tokens = A, this.expiresAt = Date.now() + A.expiresIn * 1e3, this.sessionExpiredFired = !1, this.saveToStorage(), this.scheduleRefresh();
  }
  /**
   * Get the current access token
   * UI-4 FIX: Store token in local variable before expiry check to eliminate TOCTOU race.
   * UI-TOK-01 FIX: Check isDestroyed to prevent access after manager is cleaned up.
   */
  getAccessToken() {
    if (this.isDestroyed) return null;
    const A = this.tokens?.accessToken;
    return A ? Date.now() >= this.expiresAt ? (this.clear(), this.fireSessionExpired(), null) : A : null;
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
    this.isDestroyed = !0, this.cancelRefresh(), this.clearStorage(), this.onRefreshNeeded = null, this.onSessionExpired = null, this.onRefreshError = null, this.tokens = null;
  }
  /**
   * Get time until token expiry in ms
   */
  getTimeUntilExpiry() {
    return this.tokens ? Math.max(0, this.expiresAt - Date.now()) : 0;
  }
  /**
   * S-13: Fire onSessionExpired at most once per token lifecycle.
   * Reset by setTokens() when new tokens are stored.
   */
  fireSessionExpired() {
    this.sessionExpiredFired || (this.sessionExpiredFired = !0, this.onSessionExpired?.());
  }
  scheduleRefresh() {
    if (this.cancelRefresh(), !this.tokens || !this.onRefreshNeeded) return;
    const A = this.getTimeUntilExpiry(), t = Math.max(0, A - Xe);
    if (t <= 0) {
      if (this.isDestroyed) return;
      this.onRefreshNeeded().catch((i) => {
        if (this.isDestroyed) return;
        const r = i instanceof Error ? i : new Error("Token refresh failed");
        this.onRefreshError?.(r), this.clear(), this.fireSessionExpired();
      });
      return;
    }
    this.refreshTimer = setTimeout(() => {
      this.isDestroyed || this.onRefreshNeeded?.().catch((i) => {
        if (this.isDestroyed) return;
        const r = i instanceof Error ? i : new Error("Token refresh failed");
        this.onRefreshError?.(r), this.clear(), this.fireSessionExpired();
      });
    }, t);
  }
  cancelRefresh() {
    this.refreshTimer && (clearTimeout(this.refreshTimer), this.refreshTimer = null);
  }
  loadFromStorage() {
    if (this.storage !== "memory" && !(typeof window > "u") && !(!this.allowWebStorage && (this.storage === "localStorage" || this.storage === "sessionStorage")))
      try {
        if (this.storage === "localStorage" || this.storage === "sessionStorage") {
          const A = this.storage === "localStorage" ? localStorage : sessionStorage, t = A.getItem(this.storageKey);
          if (t) {
            const i = JSON.parse(t);
            this.isValidStoredTokenData(i) ? i.expiresAt > Date.now() ? (this.tokens = i.tokens, this.expiresAt = i.expiresAt) : A.removeItem(this.storageKey) : A.removeItem(this.storageKey);
          }
        }
      } catch {
        if (this.storage === "localStorage" || this.storage === "sessionStorage") {
          const A = this.storage === "localStorage" ? localStorage : sessionStorage;
          try {
            A.removeItem(this.storageKey);
          } catch {
          }
        }
      }
  }
  /**
   * Validate that parsed data matches expected StoredTokenData structure
   */
  isValidStoredTokenData(A) {
    if (typeof A != "object" || A === null) return !1;
    const t = A;
    if (typeof t.expiresAt != "number" || typeof t.tokens != "object" || t.tokens === null) return !1;
    const i = t.tokens;
    return !(typeof i.accessToken != "string" || typeof i.refreshToken != "string" || typeof i.expiresIn != "number");
  }
  saveToStorage() {
    if (!(this.storage === "memory" || !this.tokens) && !(typeof window > "u") && !(!this.allowWebStorage && (this.storage === "localStorage" || this.storage === "sessionStorage")))
      try {
        if (this.storage === "localStorage" || this.storage === "sessionStorage") {
          const A = this.storage === "localStorage" ? localStorage : sessionStorage, t = {
            tokens: this.tokens,
            expiresAt: this.expiresAt
          };
          A.setItem(this.storageKey, JSON.stringify(t));
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
const je = "cedros_auth_sync";
class Ze {
  channel = null;
  callback = null;
  boundHandler = null;
  constructor() {
    typeof window < "u" && "BroadcastChannel" in window && (this.channel = new BroadcastChannel(je), this.boundHandler = this.handleMessage.bind(this), this.channel.addEventListener("message", this.boundHandler));
  }
  /**
   * Handle incoming sync messages.
   * S-15: Validate message shape to prevent forged auth state from same-origin XSS.
   */
  handleMessage(A) {
    const t = A.data;
    if (!(!t || typeof t != "object" || typeof t.type != "string") && ["login", "logout", "refresh"].includes(t.type)) {
      if (t.type === "login") {
        const i = t;
        if (typeof i.user != "object" || i.user === null || typeof i.user.id != "string")
          return;
      }
      this.callback?.(t);
    }
  }
  /**
   * Set the callback for sync events from other tabs
   */
  setCallback(A) {
    this.callback = A;
  }
  /**
   * Broadcast login event to other tabs
   */
  broadcastLogin(A) {
    this.channel?.postMessage({ type: "login", user: A });
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
function Ae(e) {
  if (typeof e != "object" || e === null) return !1;
  const A = e;
  if (typeof A.user != "object" || A.user === null) return !1;
  const t = A.user;
  return typeof t.id == "string" && t.id.length > 0;
}
function qe(e) {
  if (typeof e != "object" || e === null) return !1;
  const A = e;
  return typeof A.accessToken == "string" && A.accessToken.length > 0 && typeof A.refreshToken == "string" && A.refreshToken.length > 0 && typeof A.expiresIn == "number" && A.expiresIn > 0;
}
function _e({
  serverUrl: e,
  session: A,
  callbacks: t,
  requestTimeoutMs: i
}) {
  const [r, n] = D(null), [s, c] = D("idle"), h = v(null), o = v(null), p = v(t), E = v(!0), Q = v(null), m = v(() => Promise.resolve()), U = v(() => {
  });
  Y(() => {
    p.current = t;
  }, [t]), Y(() => (E.current = !0, () => {
    E.current = !1;
  }), []);
  const u = d((f) => {
    E.current && n(f);
  }, []), B = d((f) => {
    E.current && c(f);
  }, []), g = M(
    () => ({
      storage: A?.storage ?? "cookie",
      autoRefresh: A?.autoRefresh ?? !0,
      syncTabs: A?.syncTabs ?? !0,
      persistKey: A?.persistKey,
      allowWebStorage: A?.allowWebStorage ?? !1
    }),
    [
      A?.storage,
      A?.autoRefresh,
      A?.syncTabs,
      A?.persistKey,
      A?.allowWebStorage
    ]
  );
  Y(() => {
    const f = new We(g.storage, g.persistKey, {
      allowWebStorage: g.allowWebStorage
    });
    return h.current = f, g.autoRefresh && f.setRefreshCallback(() => m.current()), f.setSessionExpiredCallback(() => U.current()), g.syncTabs && (o.current = new Ze()), () => {
      f.destroy(), h.current = null, o.current?.close();
    };
  }, [
    g.storage,
    g.syncTabs,
    g.persistKey,
    g.allowWebStorage,
    g.autoRefresh
  ]);
  const b = d(async () => {
    if (Q.current)
      return Q.current;
    const f = h.current?.getRefreshToken(), k = !!f, G = se(), H = {};
    k && (H["Content-Type"] = "application/json"), G && (H["X-CSRF-Token"] = G);
    let K, J;
    const N = new Promise((X, L) => {
      K = X, J = L;
    });
    Q.current = N, (async () => {
      const X = new AbortController(), L = i ?? 1e4, $ = window.setTimeout(() => X.abort(), L);
      try {
        const x = await fetch(`${e}/refresh`, {
          method: "POST",
          headers: Object.keys(H).length > 0 ? H : void 0,
          credentials: "include",
          body: k ? JSON.stringify({ refreshToken: f }) : void 0,
          signal: X.signal
        });
        if (!x.ok)
          throw new Error("Token refresh failed");
        const W = await x.json();
        if (W.tokens) {
          if (!qe(W.tokens))
            throw new Error("Invalid token response structure");
          h.current?.setTokens(W.tokens);
        } else if (g.storage !== "cookie")
          throw new Error("Token refresh failed");
        o.current?.broadcastRefresh(), K();
      } catch (x) {
        throw J(x), x;
      } finally {
        window.clearTimeout($);
      }
    })().catch(() => {
    });
    try {
      await N;
    } finally {
      Q.current = null;
    }
  }, [e, g.storage, i]), y = d(() => {
    if (g.storage === "cookie") return;
    const f = h.current?.getAccessToken();
    if (f)
      return { Authorization: `Bearer ${f}` };
  }, [g.storage]), F = d(() => {
    h.current?.clear(), u(null), B("unauthenticated"), p.current?.onSessionExpired?.();
  }, [B, u]);
  m.current = b, U.current = F;
  const C = d(
    (f) => {
      const k = new AbortController(), G = i ?? 1e4, H = window.setTimeout(() => k.abort(), G), K = {}, J = y();
      J && Object.assign(K, J);
      const N = se();
      return N && (K["X-CSRF-Token"] = N), {
        promise: fetch(f, {
          credentials: "include",
          headers: Object.keys(K).length > 0 ? K : void 0,
          signal: k.signal
        }),
        cleanup: () => window.clearTimeout(H)
      };
    },
    [y, i]
  ), a = d(async () => {
    const f = C(`${e}/user`);
    try {
      const k = await f.promise;
      if (k.ok) {
        const G = await k.json();
        if (Ae(G)) {
          u(G.user), B("authenticated");
          return;
        }
      }
      if (k.status === 401 && g.autoRefresh) {
        try {
          await b();
        } catch {
          F();
          return;
        }
        const G = C(`${e}/user`);
        try {
          const H = await G.promise;
          if (H.ok) {
            const K = await H.json();
            if (Ae(K)) {
              u(K.user), B("authenticated");
              return;
            }
          }
        } finally {
          G.cleanup();
        }
      }
      u(null), B("unauthenticated");
    } catch {
      u(null), B("unauthenticated");
    } finally {
      f.cleanup();
    }
  }, [
    e,
    g.autoRefresh,
    b,
    C,
    F,
    B,
    u
  ]);
  Y(() => {
    !o.current || !g.syncTabs || o.current.setCallback((f) => {
      switch (f.type) {
        case "login":
          u(f.user), B("authenticated");
          break;
        case "logout":
          u(null), B("unauthenticated"), h.current?.clear();
          break;
        case "refresh":
          a();
          break;
        default:
          console.warn("[Cedros Login] Unhandled tab sync event:", f);
      }
    });
  }, [g.syncTabs, a, B, u]), Y(() => {
    const f = new AbortController(), k = i ?? 1e4, G = window.setTimeout(() => f.abort(), k);
    return (async () => {
      B("loading");
      try {
        const K = await fetch(`${e}/user`, {
          credentials: "include",
          headers: y(),
          signal: f.signal
        });
        if (K.ok) {
          const J = await K.json();
          if (Ae(J)) {
            u(J.user), B("authenticated");
            return;
          }
        }
        if (K.status === 401 && g.autoRefresh) {
          try {
            await b();
          } catch {
            F();
            return;
          }
          const J = await fetch(`${e}/user`, {
            credentials: "include",
            headers: y(),
            signal: f.signal
          });
          if (J.ok) {
            const N = await J.json();
            if (Ae(N)) {
              u(N.user), B("authenticated");
              return;
            }
          }
        }
        u(null), B("unauthenticated");
      } catch {
        u(null), B("unauthenticated");
      }
    })(), () => {
      window.clearTimeout(G), f.abort();
    };
  }, [
    e,
    g.autoRefresh,
    b,
    y,
    F,
    B,
    u,
    i
  ]);
  const I = d(
    (f, k) => {
      u(f), B("authenticated"), k && h.current?.setTokens(k), E.current && o.current?.broadcastLogin(f);
    },
    [u, B]
  ), l = d(async () => {
    const f = se(), k = new AbortController(), G = i ?? 1e4, H = window.setTimeout(() => k.abort(), G);
    try {
      await fetch(`${e}/logout`, {
        method: "POST",
        headers: {
          ...f ? { "X-CSRF-Token": f } : {},
          ...y() ?? {}
        },
        credentials: "include",
        signal: k.signal
      });
    } catch {
    } finally {
      window.clearTimeout(H), u(null), B("unauthenticated"), h.current?.clear(), o.current?.broadcastLogout(), p.current?.onLogout?.();
    }
  }, [e, y, u, B, i]), w = d(() => h.current?.getAccessToken() ?? null, []);
  return {
    user: r,
    authState: s,
    handleLoginSuccess: I,
    logout: l,
    refreshUser: a,
    getAccessToken: w
  };
}
const $e = {
  mCost: 19456,
  // 19 MiB
  tCost: 2,
  pCost: 1
};
function ze(e) {
  return e.length === 16;
}
function eA(e) {
  if (e.length === 16) return !0;
  if (e.length < 18) return !1;
  const A = e[0];
  return A === 0 || A === 1 || A === 128 || A === 8;
}
function AA(e) {
  return e.length === 32;
}
function tA(e) {
  return e.length === 12;
}
function iA(e) {
  return e.length >= 16;
}
function rA(e) {
  return e.length === 32;
}
function nA(e) {
  if (!ze(e))
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  return e;
}
function tt(e) {
  if (!eA(e))
    throw new Error(`Invalid share length: expected >=16, got ${e.length}`);
  return e;
}
function Ue(e) {
  if (!AA(e))
    throw new Error(`Invalid key length: expected 32, got ${e.length}`);
  return e;
}
function oA(e) {
  if (!tA(e))
    throw new Error(`Invalid nonce length: expected 12, got ${e.length}`);
  return e;
}
function sA(e) {
  if (!iA(e))
    throw new Error(`Invalid salt length: expected >=16, got ${e.length}`);
  return e;
}
function IA(e) {
  if (!rA(e))
    throw new Error(`Invalid PRF salt length: expected 32, got ${e.length}`);
  return e;
}
function Z(e) {
  return new Uint8Array(e);
}
function re(e) {
  if (typeof crypto > "u" || !crypto.getRandomValues)
    throw new Error(
      "WebCrypto API not available. Secure random generation requires a modern browser."
    );
  const A = new Uint8Array(e);
  return crypto.getRandomValues(A), A;
}
function it() {
  return nA(re(16));
}
function aA() {
  return oA(re(12));
}
function rt() {
  return sA(re(16));
}
function nt() {
  return IA(re(32));
}
function me(e) {
  if (!(!e || e.length === 0)) {
    if (typeof globalThis.crypto?.getRandomValues == "function")
      globalThis.crypto.getRandomValues(e);
    else
      for (let A = 0; A < e.length; A++)
        e[A] = A * 90 & 255;
    e.fill(0);
  }
}
function ot(...e) {
  for (const A of e)
    A && me(A);
}
async function gA(e) {
  return crypto.subtle.importKey(
    "raw",
    Z(e),
    { name: "AES-GCM", length: 256 },
    !1,
    // not extractable
    ["encrypt", "decrypt"]
  );
}
async function lA(e, A, t) {
  const i = t ?? aA(), r = await gA(A), n = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: Z(i) },
    r,
    Z(e)
  );
  return {
    ciphertext: new Uint8Array(n),
    nonce: i
  };
}
async function st(e, A) {
  const t = await lA(e, A);
  return {
    ciphertext: Be(t.ciphertext),
    nonce: Be(t.nonce)
  };
}
function Be(e) {
  const t = [];
  for (let i = 0; i < e.length; i += 32768) {
    const r = e.subarray(i, Math.min(i + 32768, e.length));
    t.push(String.fromCharCode(...r));
  }
  return btoa(t.join(""));
}
function cA(e) {
  let A;
  try {
    A = atob(e);
  } catch {
    throw new Error("Invalid base64 string: input is malformed or contains invalid characters");
  }
  const t = new Uint8Array(A.length);
  for (let i = 0; i < A.length; i++)
    t[i] = A.charCodeAt(i);
  return t;
}
async function CA(e, A, t, i = 32) {
  const r = await crypto.subtle.importKey(
    "raw",
    Z(e),
    "HKDF",
    !1,
    ["deriveBits"]
  ), n = new TextEncoder().encode(t), s = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: Z(A ?? new Uint8Array(32)),
      // Zero salt if not provided
      info: Z(n)
    },
    r,
    i * 8
    // bits
  );
  return new Uint8Array(s);
}
async function It(e, A) {
  const t = await CA(e, A, "cedros-wallet-share-b-encryption", 32);
  return Ue(t);
}
async function hA() {
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
function j(e, A, t, i) {
  function r(n) {
    return n instanceof t ? n : new t(function(s) {
      s(n);
    });
  }
  return new (t || (t = Promise))(function(n, s) {
    function c(p) {
      try {
        o(i.next(p));
      } catch (E) {
        s(E);
      }
    }
    function h(p) {
      try {
        o(i.throw(p));
      } catch (E) {
        s(E);
      }
    }
    function o(p) {
      p.done ? n(p.value) : r(p.value).then(c, h);
    }
    o((i = i.apply(e, [])).next());
  });
}
class S {
  constructor() {
    this.mutex = Promise.resolve();
  }
  lock() {
    let A = () => {
    };
    return this.mutex = this.mutex.then(() => new Promise(A)), new Promise((t) => {
      A = t;
    });
  }
  dispatch(A) {
    return j(this, void 0, void 0, function* () {
      const t = yield this.lock();
      try {
        return yield Promise.resolve(A());
      } finally {
        t();
      }
    });
  }
}
var Ie;
function fA() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global;
}
const he = fA(), ae = (Ie = he.Buffer) !== null && Ie !== void 0 ? Ie : null, uA = he.TextEncoder ? new he.TextEncoder() : null;
function be(e, A) {
  return (e & 15) + (e >> 6 | e >> 3 & 8) << 4 | (A & 15) + (A >> 6 | A >> 3 & 8);
}
function Ge(e, A) {
  const t = A.length >> 1;
  for (let i = 0; i < t; i++) {
    const r = i << 1;
    e[i] = be(A.charCodeAt(r), A.charCodeAt(r + 1));
  }
}
function wA(e, A) {
  if (e.length !== A.length * 2)
    return !1;
  for (let t = 0; t < A.length; t++) {
    const i = t << 1;
    if (A[t] !== be(e.charCodeAt(i), e.charCodeAt(i + 1)))
      return !1;
  }
  return !0;
}
const de = 87, Ee = 48;
function fe(e, A, t) {
  let i = 0;
  for (let r = 0; r < t; r++) {
    let n = A[r] >>> 4;
    e[i++] = n > 9 ? n + de : n + Ee, n = A[r] & 15, e[i++] = n > 9 ? n + de : n + Ee;
  }
  return String.fromCharCode.apply(null, e);
}
const R = ae !== null ? (e) => {
  if (typeof e == "string") {
    const A = ae.from(e, "utf8");
    return new Uint8Array(A.buffer, A.byteOffset, A.length);
  }
  if (ae.isBuffer(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.length);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
} : (e) => {
  if (typeof e == "string")
    return uA.encode(e);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
}, O = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", _ = new Uint8Array(256);
for (let e = 0; e < O.length; e++)
  _[O.charCodeAt(e)] = e;
function pe(e, A = !0) {
  const t = e.length, i = t % 3, r = [], n = t - i;
  for (let s = 0; s < n; s += 3) {
    const c = (e[s] << 16 & 16711680) + (e[s + 1] << 8 & 65280) + (e[s + 2] & 255), h = O.charAt(c >> 18 & 63) + O.charAt(c >> 12 & 63) + O.charAt(c >> 6 & 63) + O.charAt(c & 63);
    r.push(h);
  }
  if (i === 1) {
    const s = e[t - 1], c = O.charAt(s >> 2), h = O.charAt(s << 4 & 63);
    r.push(`${c}${h}`), A && r.push("==");
  } else if (i === 2) {
    const s = (e[t - 2] << 8) + e[t - 1], c = O.charAt(s >> 10), h = O.charAt(s >> 4 & 63), o = O.charAt(s << 2 & 63);
    r.push(`${c}${h}${o}`), A && r.push("=");
  }
  return r.join("");
}
function QA(e) {
  let A = Math.floor(e.length * 0.75);
  const t = e.length;
  return e[t - 1] === "=" && (A -= 1, e[t - 2] === "=" && (A -= 1)), A;
}
function BA(e) {
  const A = QA(e), t = e.length, i = new Uint8Array(A);
  let r = 0;
  for (let n = 0; n < t; n += 4) {
    const s = _[e.charCodeAt(n)], c = _[e.charCodeAt(n + 1)], h = _[e.charCodeAt(n + 2)], o = _[e.charCodeAt(n + 3)];
    i[r] = s << 2 | c >> 4, r += 1, i[r] = (c & 15) << 4 | h >> 2, r += 1, i[r] = (h & 3) << 6 | o & 63, r += 1;
  }
  return i;
}
const te = 16 * 1024, q = 4, dA = new S(), ge = /* @__PURE__ */ new Map();
function Ke(e, A) {
  return j(this, void 0, void 0, function* () {
    let t = null, i = null, r = !1;
    if (typeof WebAssembly > "u")
      throw new Error("WebAssembly is not supported in this environment!");
    const n = (a, I = 0) => {
      i.set(a, I);
    }, s = () => i, c = () => t.exports, h = (a) => {
      t.exports.Hash_SetMemorySize(a);
      const I = t.exports.Hash_GetBuffer(), l = t.exports.memory.buffer;
      i = new Uint8Array(l, I, a);
    }, o = () => new DataView(t.exports.memory.buffer).getUint32(t.exports.STATE_SIZE, !0), p = dA.dispatch(() => j(this, void 0, void 0, function* () {
      if (!ge.has(e.name)) {
        const I = BA(e.data), l = WebAssembly.compile(I);
        ge.set(e.name, l);
      }
      const a = yield ge.get(e.name);
      t = yield WebAssembly.instantiate(a, {
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
    })), E = () => j(this, void 0, void 0, function* () {
      t || (yield p);
      const a = t.exports.Hash_GetBuffer(), I = t.exports.memory.buffer;
      i = new Uint8Array(I, a, te);
    }), Q = (a = null) => {
      r = !0, t.exports.Hash_Init(a);
    }, m = (a) => {
      let I = 0;
      for (; I < a.length; ) {
        const l = a.subarray(I, I + te);
        I += l.length, i.set(l), t.exports.Hash_Update(l.length);
      }
    }, U = (a) => {
      if (!r)
        throw new Error("update() called before init()");
      const I = R(a);
      m(I);
    }, u = new Uint8Array(A * 2), B = (a, I = null) => {
      if (!r)
        throw new Error("digest() called before init()");
      return r = !1, t.exports.Hash_Final(I), a === "binary" ? i.slice(0, A) : fe(u, i, A);
    }, g = () => {
      if (!r)
        throw new Error("save() can only be called after init() and before digest()");
      const a = t.exports.Hash_GetState(), I = o(), l = t.exports.memory.buffer, w = new Uint8Array(l, a, I), f = new Uint8Array(q + I);
      return Ge(f, e.hash), f.set(w, q), f;
    }, b = (a) => {
      if (!(a instanceof Uint8Array))
        throw new Error("load() expects an Uint8Array generated by save()");
      const I = t.exports.Hash_GetState(), l = o(), w = q + l, f = t.exports.memory.buffer;
      if (a.length !== w)
        throw new Error(`Bad state length (expected ${w} bytes, got ${a.length})`);
      if (!wA(e.hash, a.subarray(0, q)))
        throw new Error("This state was written by an incompatible hash implementation");
      const k = a.subarray(q);
      new Uint8Array(f, I, l).set(k), r = !0;
    }, y = (a) => typeof a == "string" ? a.length < te / 4 : a.byteLength < te;
    let F = y;
    switch (e.name) {
      case "argon2":
      case "scrypt":
        F = () => !0;
        break;
      case "blake2b":
      case "blake2s":
        F = (a, I) => I <= 512 && y(a);
        break;
      case "blake3":
        F = (a, I) => I === 0 && y(a);
        break;
      case "xxhash64":
      // cannot simplify
      case "xxhash3":
      case "xxhash128":
      case "crc64":
        F = () => !1;
        break;
    }
    const C = (a, I = null, l = null) => {
      if (!F(a, I))
        return Q(I), U(a), B("hex", l);
      const w = R(a);
      return i.set(w), t.exports.Hash_Calculate(w.length, I, l), fe(u, i, A);
    };
    return yield E(), {
      getMemory: s,
      writeMemory: n,
      getExports: c,
      setMemorySize: h,
      init: Q,
      update: U,
      digest: B,
      save: g,
      load: b,
      calculate: C,
      hashLength: A
    };
  });
}
new S();
var EA = "argon2", pA = "AGFzbQEAAAABKQVgAX8Bf2AAAX9gEH9/f39/f39/f39/f39/f38AYAR/f39/AGACf38AAwYFAAECAwQFBgEBAoCAAgYIAX8BQZCoBAsHQQQGbWVtb3J5AgASSGFzaF9TZXRNZW1vcnlTaXplAAAOSGFzaF9HZXRCdWZmZXIAAQ5IYXNoX0NhbGN1bGF0ZQAECvEyBVgBAn9BACEBAkAgAEEAKAKICCICRg0AAkAgACACayIAQRB2IABBgIB8cSAASWoiAEAAQX9HDQBB/wHADwtBACEBQQBBACkDiAggAEEQdK18NwOICAsgAcALcAECfwJAQQAoAoAIIgANAEEAPwBBEHQiADYCgAhBACgCiAgiAUGAgCBGDQACQEGAgCAgAWsiAEEQdiAAQYCAfHEgAElqIgBAAEF/Rw0AQQAPC0EAQQApA4gIIABBEHStfDcDiAhBACgCgAghAAsgAAvcDgECfiAAIAQpAwAiECAAKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAMIBAgDCkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgBCAQIAQpAwCFQiiJIhA3AwAgACAQIAApAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAwgECAMKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAEIBAgBCkDAIVCAYk3AwAgASAFKQMAIhAgASkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDSAQIA0pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAEgECABKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACANIBAgDSkDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAIgBikDACIQIAIpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIA4gECAOKQMAhUIgiSIQNwMAIAogECAKKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACACIBAgAikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDiAQIA4pAwCFQjCJIhA3AwAgCiAQIAopAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACADIAcpAwAiECADKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAPIBAgDykDAIVCIIkiEDcDACALIBAgCykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAyAQIAMpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA8gECAPKQMAhUIwiSIQNwMAIAsgECALKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgACAFKQMAIhAgACkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDyAQIA8pAwCFQiCJIhA3AwAgCiAQIAopAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAAgECAAKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAPIBAgDykDAIVCMIkiEDcDACAKIBAgCikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAEgBikDACIQIAEpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAwgECAMKQMAhUIgiSIQNwMAIAsgECALKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACABIBAgASkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDCAQIAwpAwCFQjCJIhA3AwAgCyAQIAspAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACACIAcpAwAiECACKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACANIBAgDSkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAiAQIAIpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA0gECANKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgAyAEKQMAIhAgAykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDiAQIA4pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAQgECAEKQMAhUIoiSIQNwMAIAMgECADKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAOIBAgDikDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBCAQIAQpAwCFQgGJNwMAC98aAQN/QQAhBEEAIAIpAwAgASkDAIU3A5AIQQAgAikDCCABKQMIhTcDmAhBACACKQMQIAEpAxCFNwOgCEEAIAIpAxggASkDGIU3A6gIQQAgAikDICABKQMghTcDsAhBACACKQMoIAEpAyiFNwO4CEEAIAIpAzAgASkDMIU3A8AIQQAgAikDOCABKQM4hTcDyAhBACACKQNAIAEpA0CFNwPQCEEAIAIpA0ggASkDSIU3A9gIQQAgAikDUCABKQNQhTcD4AhBACACKQNYIAEpA1iFNwPoCEEAIAIpA2AgASkDYIU3A/AIQQAgAikDaCABKQNohTcD+AhBACACKQNwIAEpA3CFNwOACUEAIAIpA3ggASkDeIU3A4gJQQAgAikDgAEgASkDgAGFNwOQCUEAIAIpA4gBIAEpA4gBhTcDmAlBACACKQOQASABKQOQAYU3A6AJQQAgAikDmAEgASkDmAGFNwOoCUEAIAIpA6ABIAEpA6ABhTcDsAlBACACKQOoASABKQOoAYU3A7gJQQAgAikDsAEgASkDsAGFNwPACUEAIAIpA7gBIAEpA7gBhTcDyAlBACACKQPAASABKQPAAYU3A9AJQQAgAikDyAEgASkD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", yA = "e4cdc523", kA = {
  name: EA,
  data: pA,
  hash: yA
}, SA = "blake2b", FA = "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", DA = "c6f286e6", UA = {
  name: SA,
  data: FA,
  hash: DA
};
new S();
function ye(e) {
  return !Number.isInteger(e) || e < 8 || e > 512 || e % 8 !== 0 ? new Error("Invalid variant! Valid values: 8, 16, ..., 512") : null;
}
function mA(e, A) {
  return e | A << 16;
}
function ue(e = 512, A = null) {
  if (ye(e))
    return Promise.reject(ye(e));
  let t = null, i = e;
  if (A !== null) {
    if (t = R(A), t.length > 64)
      return Promise.reject(new Error("Max key length is 64 bytes"));
    i = mA(e, t.length);
  }
  const r = e / 8;
  return Ke(UA, r).then((n) => {
    i > 512 && n.writeMemory(t), n.init(i);
    const s = {
      init: i > 512 ? () => (n.writeMemory(t), n.init(i), s) : () => (n.init(i), s),
      update: (c) => (n.update(c), s),
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (c) => n.digest(c),
      save: () => n.save(),
      load: (c) => (n.load(c), s),
      blockSize: 128,
      digestSize: r
    };
    return s;
  });
}
function bA(e, A, t) {
  const i = [
    `m=${A.memorySize}`,
    `t=${A.iterations}`,
    `p=${A.parallelism}`
  ].join(",");
  return `$argon2${A.hashType}$v=19$${i}$${pe(e, !1)}$${pe(t, !1)}`;
}
const ke = new DataView(new ArrayBuffer(4));
function T(e) {
  return ke.setInt32(0, e, !0), new Uint8Array(ke.buffer);
}
function le(e, A, t) {
  return j(this, void 0, void 0, function* () {
    if (t <= 64) {
      const h = yield ue(t * 8);
      return h.update(T(t)), h.update(A), h.digest("binary");
    }
    const i = Math.ceil(t / 32) - 2, r = new Uint8Array(t);
    e.init(), e.update(T(t)), e.update(A);
    let n = e.digest("binary");
    r.set(n.subarray(0, 32), 0);
    for (let h = 1; h < i; h++)
      e.init(), e.update(n), n = e.digest("binary"), r.set(n.subarray(0, 32), h * 32);
    const s = t - 32 * i;
    let c;
    return s === 64 ? (c = e, c.init()) : c = yield ue(s * 8), c.update(n), n = c.digest("binary"), r.set(n.subarray(0, s), i * 32), r;
  });
}
function GA(e) {
  switch (e) {
    case "d":
      return 0;
    case "i":
      return 1;
    default:
      return 2;
  }
}
function KA(e) {
  return j(this, void 0, void 0, function* () {
    var A;
    const { parallelism: t, iterations: i, hashLength: r } = e, n = R(e.password), s = R(e.salt), c = 19, h = GA(e.hashType), { memorySize: o } = e, p = R((A = e.secret) !== null && A !== void 0 ? A : ""), [E, Q] = yield Promise.all([
      Ke(kA, 1024),
      ue(512)
    ]);
    E.setMemorySize(o * 1024 + 1024);
    const m = new Uint8Array(24), U = new DataView(m.buffer);
    U.setInt32(0, t, !0), U.setInt32(4, r, !0), U.setInt32(8, o, !0), U.setInt32(12, i, !0), U.setInt32(16, c, !0), U.setInt32(20, h, !0), E.writeMemory(m, o * 1024), Q.init(), Q.update(m), Q.update(T(n.length)), Q.update(n), Q.update(T(s.length)), Q.update(s), Q.update(T(p.length)), Q.update(p), Q.update(T(0));
    const B = Math.floor(o / (t * 4)) * 4, g = new Uint8Array(72), b = Q.digest("binary");
    g.set(b);
    for (let C = 0; C < t; C++) {
      g.set(T(0), 64), g.set(T(C), 68);
      let a = C * B, I = yield le(Q, g, 1024);
      E.writeMemory(I, a * 1024), a += 1, g.set(T(1), 64), I = yield le(Q, g, 1024), E.writeMemory(I, a * 1024);
    }
    const y = new Uint8Array(1024);
    Ge(y, E.calculate(new Uint8Array([]), o));
    const F = yield le(Q, y, r);
    if (e.outputType === "hex") {
      const C = new Uint8Array(r * 2);
      return fe(C, F, r);
    }
    return e.outputType === "encoded" ? bA(s, e, F) : F;
  });
}
const HA = (e) => {
  var A;
  if (!e || typeof e != "object")
    throw new Error("Invalid options parameter. It requires an object.");
  if (!e.password)
    throw new Error("Password must be specified");
  if (e.password = R(e.password), e.password.length < 1)
    throw new Error("Password must be specified");
  if (!e.salt)
    throw new Error("Salt must be specified");
  if (e.salt = R(e.salt), e.salt.length < 8)
    throw new Error("Salt should be at least 8 bytes long");
  if (e.secret = R((A = e.secret) !== null && A !== void 0 ? A : ""), !Number.isInteger(e.iterations) || e.iterations < 1)
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
function He(e) {
  return j(this, void 0, void 0, function* () {
    return HA(e), KA(Object.assign(Object.assign({}, e), { hashType: "id" }));
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
const JA = 32;
async function at(e, A, t = $e) {
  MA(t);
  try {
    const i = await He({
      password: e,
      salt: A,
      iterations: t.tCost,
      memorySize: t.mCost,
      parallelism: t.pCost,
      hashLength: JA,
      outputType: "binary"
    });
    return Ue(i);
  } catch {
    throw new Error("Key derivation failed");
  }
}
function MA(e) {
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
async function VA() {
  try {
    const e = await He({
      password: "test",
      salt: new Uint8Array(16),
      iterations: 1,
      memorySize: 1024,
      // 1 MiB for quick test
      parallelism: 1,
      hashLength: 32,
      outputType: "binary"
    });
    return e.length !== 32 ? !1 : (me(e), !0);
  } catch {
    return !1;
  }
}
function vA(e) {
  return e === "localhost" || e === "127.0.0.1" || e.endsWith(".localhost");
}
function NA(e) {
  if (typeof window > "u")
    return;
  const A = window.location.hostname;
  if (!vA(A))
    throw new Error(
      "[Cedros] WebAuthn RP domain validation is not configured. Set wallet.allowedRpDomains to a non-empty list of allowed domains."
    );
}
function we() {
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator.credentials < "u";
}
async function OA() {
  if (!we())
    return !1;
  try {
    if (!await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
      return !1;
    if ("getClientCapabilities" in PublicKeyCredential && typeof PublicKeyCredential.getClientCapabilities == "function") {
      const A = await PublicKeyCredential.getClientCapabilities();
      if (A && "prf" in A)
        return A.prf === !0;
    }
    return !0;
  } catch {
    return !1;
  }
}
async function gt(e, A) {
  if (!we())
    throw new Error("WebAuthn is not available in this browser");
  NA();
  const t = cA(e), i = await navigator.credentials.get({
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
            first: t
          }
        }
      }
    }
  });
  if (!i)
    throw new Error("Passkey authentication was cancelled");
  const n = i.getClientExtensionResults().prf?.results?.first;
  if (!n)
    throw new Error("PRF extension did not return a result during authentication");
  const s = new Uint8Array(n);
  if (s.length !== 32)
    throw new Error(
      `Unexpected PRF output length: expected 32 bytes, got ${s.length}. The authenticator may not be compatible.`
    );
  return { prfOutput: s };
}
async function YA() {
  const [e, A, t, i, r, n, s] = await Promise.all([
    PA(),
    xA(),
    hA(),
    TA(),
    Promise.resolve(we()),
    OA(),
    VA()
  ]);
  return {
    webCrypto: e,
    aesGcm: A,
    hkdf: t,
    ed25519: i,
    webAuthn: r,
    webAuthnPrf: n,
    argon2: s,
    allSupported: e && A && t && r && n && s
  };
}
async function PA() {
  try {
    return typeof crypto < "u" && typeof crypto.subtle < "u" && typeof crypto.getRandomValues == "function";
  } catch {
    return !1;
  }
}
async function xA() {
  try {
    const e = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, !1, [
      "encrypt",
      "decrypt"
    ]), A = new Uint8Array([1, 2, 3, 4]), t = crypto.getRandomValues(new Uint8Array(12)), i = await crypto.subtle.encrypt({ name: "AES-GCM", iv: t }, e, A), r = await crypto.subtle.decrypt({ name: "AES-GCM", iv: t }, e, i), n = new Uint8Array(r);
    return n.length === A.length && n.every((s, c) => s === A[c]);
  } catch {
    return !1;
  }
}
async function TA() {
  try {
    return await crypto.subtle.generateKey("Ed25519", !1, ["sign", "verify"]), !0;
  } catch {
    return !1;
  }
}
function lt(e) {
  if (e.allSupported)
    return null;
  const A = [];
  return e.webCrypto || A.push("Web Crypto API"), e.aesGcm || A.push("AES-GCM encryption"), e.hkdf || A.push("HKDF key derivation"), e.webAuthn || A.push("WebAuthn/Passkeys"), e.webAuthnPrf || A.push("WebAuthn PRF extension (requires platform authenticator)"), e.argon2 || A.push("Argon2 password hashing"), A.length === 0 ? null : `Your browser or device is missing required features: ${A.join(", ")}. Please use a modern browser with a platform authenticator (e.g., Touch ID, Face ID, Windows Hello).`;
}
function ct() {
  const e = typeof navigator < "u" ? navigator.userAgent : "", A = e.match(/Chrome\/(\d+)/);
  if (A) {
    const n = parseInt(A[1], 10);
    return {
      browser: "Chrome",
      version: A[1],
      likelySupported: n >= 116
    };
  }
  const t = e.match(/Version\/(\d+)/);
  if (t && e.includes("Safari") && !e.includes("Chrome")) {
    const n = parseInt(t[1], 10);
    return {
      browser: "Safari",
      version: t[1],
      likelySupported: n >= 17
    };
  }
  const i = e.match(/Firefox\/(\d+)/);
  if (i)
    return {
      browser: "Firefox",
      version: i[1],
      likelySupported: !1
      // Firefox PRF support is limited
    };
  const r = e.match(/Edg\/(\d+)/);
  if (r) {
    const n = parseInt(r[1], 10);
    return {
      browser: "Edge",
      version: r[1],
      likelySupported: n >= 116
    };
  }
  return {
    browser: "Unknown",
    version: "Unknown",
    likelySupported: !1
  };
}
let ie = null, ce = null;
const RA = 6e4;
async function LA(e = !1) {
  const A = Date.now(), t = ce === null || A - ce > RA;
  return !e && !(typeof window > "u") && !t && ie !== null || (ie = await YA(), ce = Date.now()), ie;
}
function XA(e) {
  switch (e.type) {
    case "password":
      return { password: e.password };
    case "prfOutput":
      return { prfOutput: e.prfOutput };
  }
}
function WA() {
  const e = Fe(), [A, t] = D(!1), [i, r] = D(null), n = e?.config.serverUrl, s = e?.config.requestTimeout, c = e?.config.retryAttempts, h = e?._internal?.getAccessToken, o = M(() => e ? new Se({
    baseUrl: n,
    timeoutMs: s,
    retryAttempts: c,
    getAccessToken: h
  }) : null, [e, n, s, c, h]), p = d(async () => {
    if (!o)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      return await o.get("/wallet/status");
    } catch (I) {
      const l = V(I, "Failed to fetch wallet status");
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [o]), E = d(async () => {
    if (!o)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      return await o.get("/wallet/material");
    } catch (I) {
      const l = V(I, "Failed to fetch wallet material");
      if (l.code === "NOT_FOUND")
        return null;
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [o]), Q = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await o.post("/wallet/enroll", I);
      } catch (l) {
        const w = V(l, "Failed to enroll wallet");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [o]
  ), m = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await o.post("/wallet/recover", I);
      } catch (l) {
        const w = V(l, "Failed to recover wallet");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [o]
  ), U = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await o.post("/wallet/sign", I);
      } catch (l) {
        const w = V(l, "Failed to sign transaction");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [o]
  ), u = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await o.post("/wallet/rotate-user-secret", I);
      } catch (l) {
        const w = V(l, "Failed to rotate user secret");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [o]
  ), B = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await o.post(
          "/wallet/unlock",
          XA(I)
        );
      } catch (l) {
        const w = V(l, "Failed to unlock wallet");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [o]
  ), g = d(async () => {
    if (!o)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      await o.post("/wallet/lock", {});
    } catch (I) {
      const l = V(I, "Failed to lock wallet");
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [o]), b = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await o.post("/wallet/share-b", I);
      } catch (l) {
        const w = V(l, "Failed to get Share B for recovery");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [o]
  ), y = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await o.post("/wallet/derived", I);
      } catch (l) {
        const w = V(l, "Failed to create derived wallet");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [o]
  ), F = d(async () => {
    if (!o)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      return await o.get("/wallet/derived");
    } catch (I) {
      const l = V(I, "Failed to list wallets");
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [o]), C = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await o.delete(`/wallet/derived/${I}`);
      } catch (l) {
        const w = V(l, "Failed to delete derived wallet");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [o]
  ), a = d(() => r(null), []);
  return {
    getStatus: p,
    getMaterial: E,
    enroll: Q,
    recover: m,
    signTransaction: U,
    rotateUserSecret: u,
    unlock: B,
    lock: g,
    getShareBForRecovery: b,
    createDerivedWallet: y,
    listAllWallets: F,
    deleteDerivedWallet: C,
    isLoading: A,
    error: i,
    clearError: a
  };
}
const jA = {
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
function ZA() {
  const A = Fe() !== null, [t, i] = D("loading"), [r, n] = D(null), [s, c] = D(null), [h, o] = D(!1), [p, E] = D(!1), [Q, m] = D(null), [U, u] = D(null), { getStatus: B, isLoading: g } = WA(), b = v(!1);
  Y(() => {
    if (!A) return;
    let C = !1;
    return (async () => {
      try {
        const I = await LA();
        if (C) return;
        m(I), I.allSupported || (i("error"), u(
          "Your browser or device does not support all required features. Please use a modern browser with a platform authenticator."
        ));
      } catch {
        if (C) return;
        m(null), i("error"), u("Failed to check crypto capabilities");
      }
    })(), () => {
      C = !0;
    };
  }, [A]);
  const y = d(async () => {
    if (!(!A || !Q?.allSupported)) {
      i("loading"), u(null);
      try {
        const C = await B();
        n(C.solanaPubkey ?? null), c(C.authMethod ?? null), o(C.hasExternalWallet), E(C.unlocked), C.hasExternalWallet ? i("enrolled_unlocked") : C.enrolled ? i(C.unlocked ? "enrolled_unlocked" : "enrolled_locked") : i("not_enrolled");
      } catch (C) {
        i("error"), u(C instanceof Error ? C.message : "Failed to fetch wallet status");
      }
    }
  }, [A, Q?.allSupported, B]);
  Y(() => {
    A && Q?.allSupported && !g && !b.current && (b.current = !0, y());
  }, [A, Q?.allSupported, g, y]);
  const F = d(() => u(null), []);
  return A ? {
    status: t,
    solanaPubkey: r,
    authMethod: s,
    hasExternalWallet: h,
    isUnlocked: p,
    capabilities: Q,
    isSupported: Q?.allSupported ?? !1,
    error: U,
    refresh: y,
    clearError: F
  } : jA;
}
const ne = "__CEDROS_EMBEDDED_WALLET__";
function qA(e) {
  typeof window < "u" && (window[ne] = e);
}
function Ce() {
  typeof window < "u" && delete window[ne];
}
function Ct() {
  return typeof window > "u" ? !1 : window[ne]?.available ?? !1;
}
function ht() {
  return typeof window > "u" ? null : window[ne] ?? null;
}
function _A() {
  const { config: e, user: A } = De(), { status: t, solanaPubkey: i, hasExternalWallet: r } = ZA(), n = e.wallet?.exposeAvailability ?? !1, s = e.wallet?.exposePublicKey ?? !1;
  return Y(() => {
    if (!n || !A) {
      Ce();
      return;
    }
    if (r) {
      Ce();
      return;
    }
    if (t === "loading")
      return;
    const c = t === "enrolled_locked" || t === "enrolled_unlocked";
    return qA({
      available: c,
      publicKey: s && c ? i : null
    }), () => {
      Ce();
    };
  }, [n, s, A, t, i, r]), null;
}
function ft({ config: e, children: A }) {
  const [t, i] = D(null), [r, n] = D(!1), s = v(e.callbacks);
  s.current = e.callbacks;
  const c = v({
    onLoginSuccess: (...P) => s.current?.onLoginSuccess?.(...P),
    onLoginError: (...P) => s.current?.onLoginError?.(...P),
    onLogout: () => s.current?.onLogout?.(),
    onSessionExpired: () => s.current?.onSessionExpired?.()
  }), h = v(null);
  Y(() => {
    if (typeof window > "u") return;
    const P = new URLSearchParams(window.location.search), Qe = P.get("ref") || P.get("referral");
    Qe && (h.current = Qe);
  }, []);
  const o = e.features === "auto", {
    features: p,
    googleClientId: E,
    appleClientId: Q,
    socialButtonOrder: m,
    isLoading: U
  } = Re(
    e.serverUrl,
    o,
    e.requestTimeout
  ), u = o ? void 0 : e.features, B = M(
    () => ve({
      config: u,
      env: e.featureFlagEnv,
      base: o ? p ?? void 0 : void 0
    }),
    [e.featureFlagEnv, u, o, p]
  ), g = M(() => ({
    ...e,
    features: B,
    googleClientId: o ? e.googleClientId ?? E : e.googleClientId,
    appleClientId: o ? e.appleClientId ?? Q : e.appleClientId
  }), [e, o, B, E, Q]), b = M(
    () => JSON.stringify(g.themeOverrides ?? null),
    [g.themeOverrides]
  ), y = M(() => JSON.stringify(g.session ?? null), [g.session]), F = M(() => JSON.stringify(g.features ?? null), [g.features]), C = M(() => JSON.stringify(g.forms ?? null), [g.forms]), a = M(
    () => g,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Using serialized keys for deep comparison; callbacks excluded (see UI-06)
    [
      g.serverUrl,
      g.googleClientId,
      g.appleClientId,
      g.requestTimeout,
      g.retryAttempts,
      g.theme,
      b,
      y,
      F,
      C
    ]
  ), I = a.unstyled ?? !1, l = xe({
    theme: I ? void 0 : a.theme,
    themeOverrides: I ? void 0 : a.themeOverrides
  }), {
    user: w,
    authState: f,
    handleLoginSuccess: k,
    logout: G,
    refreshUser: H,
    getAccessToken: K
  } = _e({
    serverUrl: a.serverUrl,
    session: a.session,
    callbacks: c.current,
    requestTimeoutMs: a.requestTimeout
  }), J = d(async () => {
    i(null), await G();
  }, [G]), N = d(
    (...P) => {
      i(null), k(...P);
    },
    [k]
  ), oe = d(() => n(!0), []), X = d(() => n(!1), []), L = a.features, $ = d(
    (P) => Ne(P, { flags: L }),
    [L]
  ), x = M(
    () => ({
      config: a,
      featureFlags: L,
      isFeatureEnabled: $,
      user: w,
      authState: f,
      logout: J,
      refreshUser: H,
      socialButtonOrder: o ? m : void 0,
      _internal: {
        handleLoginSuccess: N,
        getAccessToken: K,
        getReferralCode: () => h.current
      }
    }),
    [a, L, $, w, f, J, H, o, m, N, K]
  ), W = M(
    () => ({
      error: t,
      isModalOpen: r,
      openModal: oe,
      closeModal: X
    }),
    [t, r, oe, X]
  ), Je = M(
    () => ({ ...x, ...W }),
    [x, W]
  );
  return o && U ? null : /* @__PURE__ */ z(Oe.Provider, { value: x, children: /* @__PURE__ */ z(Ye.Provider, { value: W, children: /* @__PURE__ */ z(Pe.Provider, { value: Je, children: /* @__PURE__ */ Me("div", { className: l.className, style: l.style, children: [
    /* @__PURE__ */ z(_A, {}),
    A
  ] }) }) }) });
}
function ut() {
  const { user: e, authState: A, error: t, logout: i, refreshUser: r, openModal: n, closeModal: s } = De();
  return {
    user: e,
    authState: A,
    error: t,
    isAuthenticated: A === "authenticated" && e !== null,
    isLoading: A === "loading",
    logout: i,
    refreshUser: r,
    openLoginModal: n,
    closeLoginModal: s
  };
}
export {
  ft as C,
  $e as D,
  at as a,
  nA as b,
  ot as c,
  ct as d,
  WA as e,
  it as f,
  lt as g,
  st as h,
  Ue as i,
  Be as j,
  rt as k,
  nt as l,
  gt as m,
  It as n,
  XA as o,
  cA as p,
  ZA as q,
  xe as r,
  ht as s,
  tt as t,
  ut as u,
  MA as v,
  me as w,
  Ct as x
};
