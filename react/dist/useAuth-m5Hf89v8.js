import { jsx as ne, jsxs as Ke } from "react/jsx-runtime";
import { useEffect as x, useState as K, useRef as Y, useCallback as E, useMemo as P } from "react";
import { A as He, a as Je, C as Me } from "./LoadingSpinner-6vml-zwr.js";
import { A as Ee, g as oe, a as pe, h as V, u as ye } from "./useCedrosLogin-_94MmGGq.js";
let Z = 0;
function Ve({ theme: e, themeOverrides: t }) {
  x(() => {
    if (typeof document > "u" || typeof window > "u")
      return;
    const A = document.documentElement;
    let i = !1;
    e === "dark" ? i = !0 : e === "light" ? i = !1 : i = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let r = !1;
    i ? (Z++, r = !0, A.classList.add("cedros-dark")) : Z === 0 && A.classList.remove("cedros-dark");
    const n = /* @__PURE__ */ new Map();
    return t && Object.entries(t).forEach(([o, a]) => {
      if (a) {
        const c = A.style.getPropertyValue(o);
        n.set(o, c), A.style.setProperty(o, a);
      }
    }), () => {
      r && (Z--, Z === 0 && A.classList.remove("cedros-dark")), n.forEach((o, a) => {
        o ? A.style.setProperty(a, o) : A.style.removeProperty(a);
      });
    };
  }, [e, t]);
}
const Pe = {
  email: !0,
  google: !0,
  apple: !0,
  solana: !0,
  webauthn: !0,
  instantLink: !0
};
function Ne(e, t, A) {
  const [i, r] = K(null), [n, o] = K(), [a, c] = K(), [s, y] = K(t), p = Y(!1);
  return x(() => {
    if (!t || p.current) return;
    p.current = !0, new Ee({
      baseUrl: e,
      timeoutMs: A ?? 5e3,
      retryAttempts: 1
    }).get("/features", { credentials: "omit" }).then((h) => {
      r({
        email: h.email,
        google: h.google,
        apple: h.apple,
        solana: h.solana,
        webauthn: h.webauthn,
        instantLink: h.instantLink
      }), o(h.googleClientId), c(h.appleClientId);
    }).catch(() => {
      r(Pe);
    }).finally(() => {
      y(!1);
    });
  }, [t, e, A]), { features: i, googleClientId: n, appleClientId: a, isLoading: s };
}
const Ye = "cedros_tokens", xe = 6e4;
class Oe {
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
  constructor(t = "cookie", A = Ye, i = {}) {
    this.requestedStorage = t, this.storage = t, this.storageKey = A, this.allowWebStorage = i.allowWebStorage ?? !1, this.warnIfLocalStorage(), !this.allowWebStorage && (this.requestedStorage === "localStorage" || this.requestedStorage === "sessionStorage") && (this.storage = "memory"), this.loadFromStorage();
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
    this.tokens = t, this.expiresAt = Date.now() + t.expiresIn * 1e3, this.sessionExpiredFired = !1, this.saveToStorage(), this.scheduleRefresh();
  }
  /**
   * Get the current access token
   * UI-4 FIX: Store token in local variable before expiry check to eliminate TOCTOU race.
   * UI-TOK-01 FIX: Check isDestroyed to prevent access after manager is cleaned up.
   */
  getAccessToken() {
    if (this.isDestroyed) return null;
    const t = this.tokens?.accessToken;
    return t ? Date.now() >= this.expiresAt ? (this.clear(), this.fireSessionExpired(), null) : t : null;
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
    const t = this.getTimeUntilExpiry(), A = Math.max(0, t - xe);
    if (A <= 0) {
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
            const i = JSON.parse(A);
            this.isValidStoredTokenData(i) ? i.expiresAt > Date.now() ? (this.tokens = i.tokens, this.expiresAt = i.expiresAt) : t.removeItem(this.storageKey) : t.removeItem(this.storageKey);
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
    const i = A.tokens;
    return !(typeof i.accessToken != "string" || typeof i.refreshToken != "string" || typeof i.expiresIn != "number");
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
const ve = "cedros_auth_sync";
class Te {
  channel = null;
  callback = null;
  boundHandler = null;
  constructor() {
    typeof window < "u" && "BroadcastChannel" in window && (this.channel = new BroadcastChannel(ve), this.boundHandler = this.handleMessage.bind(this), this.channel.addEventListener("message", this.boundHandler));
  }
  /**
   * Handle incoming sync messages.
   * S-15: Validate message shape to prevent forged auth state from same-origin XSS.
   */
  handleMessage(t) {
    const A = t.data;
    if (!(!A || typeof A != "object" || typeof A.type != "string") && ["login", "logout", "refresh"].includes(A.type)) {
      if (A.type === "login") {
        const i = A;
        if (typeof i.user != "object" || i.user === null || typeof i.user.id != "string")
          return;
      }
      this.callback?.(A);
    }
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
function q(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = e;
  if (typeof t.user != "object" || t.user === null) return !1;
  const A = t.user;
  return typeof A.id == "string" && A.id.length > 0;
}
function Re(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = e;
  return typeof t.accessToken == "string" && t.accessToken.length > 0 && typeof t.refreshToken == "string" && t.refreshToken.length > 0 && typeof t.expiresIn == "number" && t.expiresIn > 0;
}
function Le({
  serverUrl: e,
  session: t,
  callbacks: A,
  requestTimeoutMs: i
}) {
  const [r, n] = K(null), [o, a] = K("idle"), c = Y(null), s = Y(null), y = Y(A), p = Y(!0), w = Y(null), h = Y(() => Promise.resolve()), m = Y(() => {
  });
  x(() => {
    y.current = A;
  }, [A]), x(() => (p.current = !0, () => {
    p.current = !1;
  }), []);
  const Q = E((C) => {
    p.current && n(C);
  }, []), B = E((C) => {
    p.current && a(C);
  }, []), f = P(
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
  x(() => {
    const C = new Oe(f.storage, f.persistKey, {
      allowWebStorage: f.allowWebStorage
    });
    return c.current = C, f.autoRefresh && C.setRefreshCallback(() => h.current()), C.setSessionExpiredCallback(() => m.current()), f.syncTabs && (s.current = new Te()), () => {
      C.destroy(), c.current = null, s.current?.close();
    };
  }, [
    f.storage,
    f.syncTabs,
    f.persistKey,
    f.allowWebStorage,
    f.autoRefresh
  ]);
  const F = E(async () => {
    if (w.current)
      return w.current;
    const C = c.current?.getRefreshToken(), S = !!C, G = oe(), H = {};
    S && (H["Content-Type"] = "application/json"), G && (H["X-CSRF-Token"] = G);
    let b, M;
    const J = new Promise((j, ie) => {
      b = j, M = ie;
    });
    w.current = J, (async () => {
      const j = new AbortController(), ie = i ?? 1e4, Ge = window.setTimeout(() => j.abort(), ie);
      try {
        const L = await fetch(`${e}/refresh`, {
          method: "POST",
          headers: Object.keys(H).length > 0 ? H : void 0,
          credentials: "include",
          body: S ? JSON.stringify({ refreshToken: C }) : void 0,
          signal: j.signal
        });
        if (!L.ok)
          throw new Error("Token refresh failed");
        const re = await L.json();
        if (re.tokens) {
          if (!Re(re.tokens))
            throw new Error("Invalid token response structure");
          c.current?.setTokens(re.tokens);
        } else if (f.storage !== "cookie")
          throw new Error("Token refresh failed");
        s.current?.broadcastRefresh(), b();
      } catch (L) {
        throw M(L), L;
      } finally {
        window.clearTimeout(Ge);
      }
    })().catch(() => {
    });
    try {
      await J;
    } finally {
      w.current = null;
    }
  }, [e, f.storage, i]), k = E(() => {
    if (f.storage === "cookie") return;
    const C = c.current?.getAccessToken();
    if (C)
      return { Authorization: `Bearer ${C}` };
  }, [f.storage]), U = E(() => {
    c.current?.clear(), Q(null), B("unauthenticated"), y.current?.onSessionExpired?.();
  }, [B, Q]);
  h.current = F, m.current = U;
  const d = E(
    (C) => {
      const S = new AbortController(), G = i ?? 1e4, H = window.setTimeout(() => S.abort(), G), b = {}, M = k();
      M && Object.assign(b, M);
      const J = oe();
      return J && (b["X-CSRF-Token"] = J), {
        promise: fetch(C, {
          credentials: "include",
          headers: Object.keys(b).length > 0 ? b : void 0,
          signal: S.signal
        }),
        cleanup: () => window.clearTimeout(H)
      };
    },
    [k, i]
  ), g = E(async () => {
    const C = d(`${e}/user`);
    try {
      const S = await C.promise;
      if (S.ok) {
        const G = await S.json();
        if (q(G)) {
          Q(G.user), B("authenticated");
          return;
        }
      }
      if (S.status === 401 && f.autoRefresh) {
        try {
          await F();
        } catch {
          U();
          return;
        }
        const G = d(`${e}/user`);
        try {
          const H = await G.promise;
          if (H.ok) {
            const b = await H.json();
            if (q(b)) {
              Q(b.user), B("authenticated");
              return;
            }
          }
        } finally {
          G.cleanup();
        }
      }
      Q(null), B("unauthenticated");
    } catch {
      Q(null), B("unauthenticated");
    } finally {
      C.cleanup();
    }
  }, [
    e,
    f.autoRefresh,
    F,
    d,
    U,
    B,
    Q
  ]);
  x(() => {
    !s.current || !f.syncTabs || s.current.setCallback((C) => {
      switch (C.type) {
        case "login":
          Q(C.user), B("authenticated");
          break;
        case "logout":
          Q(null), B("unauthenticated"), c.current?.clear();
          break;
        case "refresh":
          g();
          break;
        default:
          console.warn("[Cedros Login] Unhandled tab sync event:", C);
      }
    });
  }, [f.syncTabs, g, B, Q]), x(() => {
    const C = new AbortController(), S = i ?? 1e4, G = window.setTimeout(() => C.abort(), S);
    return (async () => {
      B("loading");
      try {
        const b = await fetch(`${e}/user`, {
          credentials: "include",
          headers: k(),
          signal: C.signal
        });
        if (b.ok) {
          const M = await b.json();
          if (q(M)) {
            Q(M.user), B("authenticated");
            return;
          }
        }
        if (b.status === 401 && f.autoRefresh) {
          try {
            await F();
          } catch {
            U();
            return;
          }
          const M = await fetch(`${e}/user`, {
            credentials: "include",
            headers: k(),
            signal: C.signal
          });
          if (M.ok) {
            const J = await M.json();
            if (q(J)) {
              Q(J.user), B("authenticated");
              return;
            }
          }
        }
        Q(null), B("unauthenticated");
      } catch {
        Q(null), B("unauthenticated");
      }
    })(), () => {
      window.clearTimeout(G), C.abort();
    };
  }, [
    e,
    f.autoRefresh,
    F,
    k,
    U,
    B,
    Q,
    i
  ]);
  const I = E(
    (C, S) => {
      Q(C), B("authenticated"), S && c.current?.setTokens(S), p.current && s.current?.broadcastLogin(C);
    },
    [Q, B]
  ), l = E(async () => {
    const C = oe(), S = new AbortController(), G = i ?? 1e4, H = window.setTimeout(() => S.abort(), G);
    try {
      await fetch(`${e}/logout`, {
        method: "POST",
        headers: {
          ...C ? { "X-CSRF-Token": C } : {},
          ...k() ?? {}
        },
        credentials: "include",
        signal: S.signal
      });
    } catch {
    } finally {
      window.clearTimeout(H), Q(null), B("unauthenticated"), c.current?.clear(), s.current?.broadcastLogout(), y.current?.onLogout?.();
    }
  }, [e, k, Q, B, i]), u = E(() => c.current?.getAccessToken() ?? null, []);
  return {
    user: r,
    authState: o,
    handleLoginSuccess: I,
    logout: l,
    refreshUser: g,
    getAccessToken: u
  };
}
const Xe = {
  mCost: 19456,
  // 19 MiB
  tCost: 2,
  pCost: 1
};
function We(e) {
  return e.length === 16;
}
function je(e) {
  if (e.length === 16) return !0;
  if (e.length < 18) return !1;
  const t = e[0];
  return t === 0 || t === 1 || t === 128 || t === 8;
}
function Ze(e) {
  return e.length === 32;
}
function qe(e) {
  return e.length === 12;
}
function _e(e) {
  return e.length >= 16;
}
function $e(e) {
  return e.length === 32;
}
function ze(e) {
  if (!We(e))
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  return e;
}
function _t(e) {
  if (!je(e))
    throw new Error(`Invalid share length: expected >=16, got ${e.length}`);
  return e;
}
function ke(e) {
  if (!Ze(e))
    throw new Error(`Invalid key length: expected 32, got ${e.length}`);
  return e;
}
function et(e) {
  if (!qe(e))
    throw new Error(`Invalid nonce length: expected 12, got ${e.length}`);
  return e;
}
function tt(e) {
  if (!_e(e))
    throw new Error(`Invalid salt length: expected >=16, got ${e.length}`);
  return e;
}
function At(e) {
  if (!$e(e))
    throw new Error(`Invalid PRF salt length: expected 32, got ${e.length}`);
  return e;
}
function T(e) {
  return new Uint8Array(e);
}
function ee(e) {
  if (typeof crypto > "u" || !crypto.getRandomValues)
    throw new Error(
      "WebCrypto API not available. Secure random generation requires a modern browser."
    );
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), t;
}
function $t() {
  return ze(ee(16));
}
function it() {
  return et(ee(12));
}
function zt() {
  return tt(ee(16));
}
function rt() {
  return At(ee(32));
}
function Se(e) {
  if (!(!e || e.length === 0)) {
    if (typeof globalThis.crypto?.getRandomValues == "function")
      globalThis.crypto.getRandomValues(e);
    else
      for (let t = 0; t < e.length; t++)
        e[t] = t * 90 & 255;
    e.fill(0);
  }
}
function eA(...e) {
  for (const t of e)
    t && Se(t);
}
async function nt(e) {
  return crypto.subtle.importKey(
    "raw",
    T(e),
    { name: "AES-GCM", length: 256 },
    !1,
    // not extractable
    ["encrypt", "decrypt"]
  );
}
async function ot(e, t, A) {
  const i = A ?? it(), r = await nt(t), n = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: T(i) },
    r,
    T(e)
  );
  return {
    ciphertext: new Uint8Array(n),
    nonce: i
  };
}
async function tA(e, t) {
  const A = await ot(e, t);
  return {
    ciphertext: z(A.ciphertext),
    nonce: z(A.nonce)
  };
}
function z(e) {
  const A = [];
  for (let i = 0; i < e.length; i += 32768) {
    const r = e.subarray(i, Math.min(i + 32768, e.length));
    A.push(String.fromCharCode(...r));
  }
  return btoa(A.join(""));
}
function st(e) {
  let t;
  try {
    t = atob(e);
  } catch {
    throw new Error("Invalid base64 string: input is malformed or contains invalid characters");
  }
  const A = new Uint8Array(t.length);
  for (let i = 0; i < t.length; i++)
    A[i] = t.charCodeAt(i);
  return A;
}
async function It(e, t, A, i = 32) {
  const r = await crypto.subtle.importKey(
    "raw",
    T(e),
    "HKDF",
    !1,
    ["deriveBits"]
  ), n = new TextEncoder().encode(A), o = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: T(t ?? new Uint8Array(32)),
      // Zero salt if not provided
      info: T(n)
    },
    r,
    i * 8
    // bits
  );
  return new Uint8Array(o);
}
async function AA(e, t) {
  const A = await It(e, t, "cedros-wallet-share-b-encryption", 32);
  return ke(A);
}
async function at() {
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
function R(e, t, A, i) {
  function r(n) {
    return n instanceof A ? n : new A(function(o) {
      o(n);
    });
  }
  return new (A || (A = Promise))(function(n, o) {
    function a(y) {
      try {
        s(i.next(y));
      } catch (p) {
        o(p);
      }
    }
    function c(y) {
      try {
        s(i.throw(y));
      } catch (p) {
        o(p);
      }
    }
    function s(y) {
      y.done ? n(y.value) : r(y.value).then(a, c);
    }
    s((i = i.apply(e, [])).next());
  });
}
class D {
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
    return R(this, void 0, void 0, function* () {
      const A = yield this.lock();
      try {
        return yield Promise.resolve(t());
      } finally {
        A();
      }
    });
  }
}
var se;
function gt() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global;
}
const Ce = gt(), Ie = (se = Ce.Buffer) !== null && se !== void 0 ? se : null, lt = Ce.TextEncoder ? new Ce.TextEncoder() : null;
function De(e, t) {
  return (e & 15) + (e >> 6 | e >> 3 & 8) << 4 | (t & 15) + (t >> 6 | t >> 3 & 8);
}
function Fe(e, t) {
  const A = t.length >> 1;
  for (let i = 0; i < A; i++) {
    const r = i << 1;
    e[i] = De(t.charCodeAt(r), t.charCodeAt(r + 1));
  }
}
function ct(e, t) {
  if (e.length !== t.length * 2)
    return !1;
  for (let A = 0; A < t.length; A++) {
    const i = A << 1;
    if (t[A] !== De(e.charCodeAt(i), e.charCodeAt(i + 1)))
      return !1;
  }
  return !0;
}
const ue = 87, we = 48;
function he(e, t, A) {
  let i = 0;
  for (let r = 0; r < A; r++) {
    let n = t[r] >>> 4;
    e[i++] = n > 9 ? n + ue : n + we, n = t[r] & 15, e[i++] = n > 9 ? n + ue : n + we;
  }
  return String.fromCharCode.apply(null, e);
}
const v = Ie !== null ? (e) => {
  if (typeof e == "string") {
    const t = Ie.from(e, "utf8");
    return new Uint8Array(t.buffer, t.byteOffset, t.length);
  }
  if (Ie.isBuffer(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.length);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
} : (e) => {
  if (typeof e == "string")
    return lt.encode(e);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
}, N = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", W = new Uint8Array(256);
for (let e = 0; e < N.length; e++)
  W[N.charCodeAt(e)] = e;
function Qe(e, t = !0) {
  const A = e.length, i = A % 3, r = [], n = A - i;
  for (let o = 0; o < n; o += 3) {
    const a = (e[o] << 16 & 16711680) + (e[o + 1] << 8 & 65280) + (e[o + 2] & 255), c = N.charAt(a >> 18 & 63) + N.charAt(a >> 12 & 63) + N.charAt(a >> 6 & 63) + N.charAt(a & 63);
    r.push(c);
  }
  if (i === 1) {
    const o = e[A - 1], a = N.charAt(o >> 2), c = N.charAt(o << 4 & 63);
    r.push(`${a}${c}`), t && r.push("==");
  } else if (i === 2) {
    const o = (e[A - 2] << 8) + e[A - 1], a = N.charAt(o >> 10), c = N.charAt(o >> 4 & 63), s = N.charAt(o << 2 & 63);
    r.push(`${a}${c}${s}`), t && r.push("=");
  }
  return r.join("");
}
function Ct(e) {
  let t = Math.floor(e.length * 0.75);
  const A = e.length;
  return e[A - 1] === "=" && (t -= 1, e[A - 2] === "=" && (t -= 1)), t;
}
function ht(e) {
  const t = Ct(e), A = e.length, i = new Uint8Array(t);
  let r = 0;
  for (let n = 0; n < A; n += 4) {
    const o = W[e.charCodeAt(n)], a = W[e.charCodeAt(n + 1)], c = W[e.charCodeAt(n + 2)], s = W[e.charCodeAt(n + 3)];
    i[r] = o << 2 | a >> 4, r += 1, i[r] = (a & 15) << 4 | c >> 2, r += 1, i[r] = (c & 3) << 6 | s & 63, r += 1;
  }
  return i;
}
const _ = 16 * 1024, X = 4, ft = new D(), ae = /* @__PURE__ */ new Map();
function Ue(e, t) {
  return R(this, void 0, void 0, function* () {
    let A = null, i = null, r = !1;
    if (typeof WebAssembly > "u")
      throw new Error("WebAssembly is not supported in this environment!");
    const n = (g, I = 0) => {
      i.set(g, I);
    }, o = () => i, a = () => A.exports, c = (g) => {
      A.exports.Hash_SetMemorySize(g);
      const I = A.exports.Hash_GetBuffer(), l = A.exports.memory.buffer;
      i = new Uint8Array(l, I, g);
    }, s = () => new DataView(A.exports.memory.buffer).getUint32(A.exports.STATE_SIZE, !0), y = ft.dispatch(() => R(this, void 0, void 0, function* () {
      if (!ae.has(e.name)) {
        const I = ht(e.data), l = WebAssembly.compile(I);
        ae.set(e.name, l);
      }
      const g = yield ae.get(e.name);
      A = yield WebAssembly.instantiate(g, {
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
    })), p = () => R(this, void 0, void 0, function* () {
      A || (yield y);
      const g = A.exports.Hash_GetBuffer(), I = A.exports.memory.buffer;
      i = new Uint8Array(I, g, _);
    }), w = (g = null) => {
      r = !0, A.exports.Hash_Init(g);
    }, h = (g) => {
      let I = 0;
      for (; I < g.length; ) {
        const l = g.subarray(I, I + _);
        I += l.length, i.set(l), A.exports.Hash_Update(l.length);
      }
    }, m = (g) => {
      if (!r)
        throw new Error("update() called before init()");
      const I = v(g);
      h(I);
    }, Q = new Uint8Array(t * 2), B = (g, I = null) => {
      if (!r)
        throw new Error("digest() called before init()");
      return r = !1, A.exports.Hash_Final(I), g === "binary" ? i.slice(0, t) : he(Q, i, t);
    }, f = () => {
      if (!r)
        throw new Error("save() can only be called after init() and before digest()");
      const g = A.exports.Hash_GetState(), I = s(), l = A.exports.memory.buffer, u = new Uint8Array(l, g, I), C = new Uint8Array(X + I);
      return Fe(C, e.hash), C.set(u, X), C;
    }, F = (g) => {
      if (!(g instanceof Uint8Array))
        throw new Error("load() expects an Uint8Array generated by save()");
      const I = A.exports.Hash_GetState(), l = s(), u = X + l, C = A.exports.memory.buffer;
      if (g.length !== u)
        throw new Error(`Bad state length (expected ${u} bytes, got ${g.length})`);
      if (!ct(e.hash, g.subarray(0, X)))
        throw new Error("This state was written by an incompatible hash implementation");
      const S = g.subarray(X);
      new Uint8Array(C, I, l).set(S), r = !0;
    }, k = (g) => typeof g == "string" ? g.length < _ / 4 : g.byteLength < _;
    let U = k;
    switch (e.name) {
      case "argon2":
      case "scrypt":
        U = () => !0;
        break;
      case "blake2b":
      case "blake2s":
        U = (g, I) => I <= 512 && k(g);
        break;
      case "blake3":
        U = (g, I) => I === 0 && k(g);
        break;
      case "xxhash64":
      // cannot simplify
      case "xxhash3":
      case "xxhash128":
      case "crc64":
        U = () => !1;
        break;
    }
    const d = (g, I = null, l = null) => {
      if (!U(g, I))
        return w(I), m(g), B("hex", l);
      const u = v(g);
      return i.set(u), A.exports.Hash_Calculate(u.length, I, l), he(Q, i, t);
    };
    return yield p(), {
      getMemory: o,
      writeMemory: n,
      getExports: a,
      setMemorySize: c,
      init: w,
      update: m,
      digest: B,
      save: f,
      load: F,
      calculate: d,
      hashLength: t
    };
  });
}
new D();
var ut = "argon2", wt = "AGFzbQEAAAABKQVgAX8Bf2AAAX9gEH9/f39/f39/f39/f39/f38AYAR/f39/AGACf38AAwYFAAECAwQFBgEBAoCAAgYIAX8BQZCoBAsHQQQGbWVtb3J5AgASSGFzaF9TZXRNZW1vcnlTaXplAAAOSGFzaF9HZXRCdWZmZXIAAQ5IYXNoX0NhbGN1bGF0ZQAECvEyBVgBAn9BACEBAkAgAEEAKAKICCICRg0AAkAgACACayIAQRB2IABBgIB8cSAASWoiAEAAQX9HDQBB/wHADwtBACEBQQBBACkDiAggAEEQdK18NwOICAsgAcALcAECfwJAQQAoAoAIIgANAEEAPwBBEHQiADYCgAhBACgCiAgiAUGAgCBGDQACQEGAgCAgAWsiAEEQdiAAQYCAfHEgAElqIgBAAEF/Rw0AQQAPC0EAQQApA4gIIABBEHStfDcDiAhBACgCgAghAAsgAAvcDgECfiAAIAQpAwAiECAAKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAMIBAgDCkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgBCAQIAQpAwCFQiiJIhA3AwAgACAQIAApAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAwgECAMKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAEIBAgBCkDAIVCAYk3AwAgASAFKQMAIhAgASkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDSAQIA0pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAEgECABKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACANIBAgDSkDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAIgBikDACIQIAIpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIA4gECAOKQMAhUIgiSIQNwMAIAogECAKKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACACIBAgAikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDiAQIA4pAwCFQjCJIhA3AwAgCiAQIAopAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACADIAcpAwAiECADKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAPIBAgDykDAIVCIIkiEDcDACALIBAgCykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAyAQIAMpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA8gECAPKQMAhUIwiSIQNwMAIAsgECALKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgACAFKQMAIhAgACkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDyAQIA8pAwCFQiCJIhA3AwAgCiAQIAopAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAAgECAAKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAPIBAgDykDAIVCMIkiEDcDACAKIBAgCikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAEgBikDACIQIAEpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAwgECAMKQMAhUIgiSIQNwMAIAsgECALKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACABIBAgASkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDCAQIAwpAwCFQjCJIhA3AwAgCyAQIAspAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACACIAcpAwAiECACKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACANIBAgDSkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAiAQIAIpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA0gECANKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgAyAEKQMAIhAgAykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDiAQIA4pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAQgECAEKQMAhUIoiSIQNwMAIAMgECADKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAOIBAgDikDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBCAQIAQpAwCFQgGJNwMAC98aAQN/QQAhBEEAIAIpAwAgASkDAIU3A5AIQQAgAikDCCABKQMIhTcDmAhBACACKQMQIAEpAxCFNwOgCEEAIAIpAxggASkDGIU3A6gIQQAgAikDICABKQMghTcDsAhBACACKQMoIAEpAyiFNwO4CEEAIAIpAzAgASkDMIU3A8AIQQAgAikDOCABKQM4hTcDyAhBACACKQNAIAEpA0CFNwPQCEEAIAIpA0ggASkDSIU3A9gIQQAgAikDUCABKQNQhTcD4AhBACACKQNYIAEpA1iFNwPoCEEAIAIpA2AgASkDYIU3A/AIQQAgAikDaCABKQNohTcD+AhBACACKQNwIAEpA3CFNwOACUEAIAIpA3ggASkDeIU3A4gJQQAgAikDgAEgASkDgAGFNwOQCUEAIAIpA4gBIAEpA4gBhTcDmAlBACACKQOQASABKQOQAYU3A6AJQQAgAikDmAEgASkDmAGFNwOoCUEAIAIpA6ABIAEpA6ABhTcDsAlBACACKQOoASABKQOoAYU3A7gJQQAgAikDsAEgASkDsAGFNwPACUEAIAIpA7gBIAEpA7gBhTcDyAlBACACKQPAASABKQPAAYU3A9AJQQAgAikDyAEgASkD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", Qt = "e4cdc523", Bt = {
  name: ut,
  data: wt,
  hash: Qt
}, dt = "blake2b", Et = "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", pt = "c6f286e6", yt = {
  name: dt,
  data: Et,
  hash: pt
};
new D();
function Be(e) {
  return !Number.isInteger(e) || e < 8 || e > 512 || e % 8 !== 0 ? new Error("Invalid variant! Valid values: 8, 16, ..., 512") : null;
}
function kt(e, t) {
  return e | t << 16;
}
function fe(e = 512, t = null) {
  if (Be(e))
    return Promise.reject(Be(e));
  let A = null, i = e;
  if (t !== null) {
    if (A = v(t), A.length > 64)
      return Promise.reject(new Error("Max key length is 64 bytes"));
    i = kt(e, A.length);
  }
  const r = e / 8;
  return Ue(yt, r).then((n) => {
    i > 512 && n.writeMemory(A), n.init(i);
    const o = {
      init: i > 512 ? () => (n.writeMemory(A), n.init(i), o) : () => (n.init(i), o),
      update: (a) => (n.update(a), o),
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (a) => n.digest(a),
      save: () => n.save(),
      load: (a) => (n.load(a), o),
      blockSize: 128,
      digestSize: r
    };
    return o;
  });
}
function St(e, t, A) {
  const i = [
    `m=${t.memorySize}`,
    `t=${t.iterations}`,
    `p=${t.parallelism}`
  ].join(",");
  return `$argon2${t.hashType}$v=19$${i}$${Qe(e, !1)}$${Qe(A, !1)}`;
}
const de = new DataView(new ArrayBuffer(4));
function O(e) {
  return de.setInt32(0, e, !0), new Uint8Array(de.buffer);
}
function ge(e, t, A) {
  return R(this, void 0, void 0, function* () {
    if (A <= 64) {
      const c = yield fe(A * 8);
      return c.update(O(A)), c.update(t), c.digest("binary");
    }
    const i = Math.ceil(A / 32) - 2, r = new Uint8Array(A);
    e.init(), e.update(O(A)), e.update(t);
    let n = e.digest("binary");
    r.set(n.subarray(0, 32), 0);
    for (let c = 1; c < i; c++)
      e.init(), e.update(n), n = e.digest("binary"), r.set(n.subarray(0, 32), c * 32);
    const o = A - 32 * i;
    let a;
    return o === 64 ? (a = e, a.init()) : a = yield fe(o * 8), a.update(n), n = a.digest("binary"), r.set(n.subarray(0, o), i * 32), r;
  });
}
function Dt(e) {
  switch (e) {
    case "d":
      return 0;
    case "i":
      return 1;
    default:
      return 2;
  }
}
function Ft(e) {
  return R(this, void 0, void 0, function* () {
    var t;
    const { parallelism: A, iterations: i, hashLength: r } = e, n = v(e.password), o = v(e.salt), a = 19, c = Dt(e.hashType), { memorySize: s } = e, y = v((t = e.secret) !== null && t !== void 0 ? t : ""), [p, w] = yield Promise.all([
      Ue(Bt, 1024),
      fe(512)
    ]);
    p.setMemorySize(s * 1024 + 1024);
    const h = new Uint8Array(24), m = new DataView(h.buffer);
    m.setInt32(0, A, !0), m.setInt32(4, r, !0), m.setInt32(8, s, !0), m.setInt32(12, i, !0), m.setInt32(16, a, !0), m.setInt32(20, c, !0), p.writeMemory(h, s * 1024), w.init(), w.update(h), w.update(O(n.length)), w.update(n), w.update(O(o.length)), w.update(o), w.update(O(y.length)), w.update(y), w.update(O(0));
    const B = Math.floor(s / (A * 4)) * 4, f = new Uint8Array(72), F = w.digest("binary");
    f.set(F);
    for (let d = 0; d < A; d++) {
      f.set(O(0), 64), f.set(O(d), 68);
      let g = d * B, I = yield ge(w, f, 1024);
      p.writeMemory(I, g * 1024), g += 1, f.set(O(1), 64), I = yield ge(w, f, 1024), p.writeMemory(I, g * 1024);
    }
    const k = new Uint8Array(1024);
    Fe(k, p.calculate(new Uint8Array([]), s));
    const U = yield ge(w, k, r);
    if (e.outputType === "hex") {
      const d = new Uint8Array(r * 2);
      return he(d, U, r);
    }
    return e.outputType === "encoded" ? St(o, e, U) : U;
  });
}
const Ut = (e) => {
  var t;
  if (!e || typeof e != "object")
    throw new Error("Invalid options parameter. It requires an object.");
  if (!e.password)
    throw new Error("Password must be specified");
  if (e.password = v(e.password), e.password.length < 1)
    throw new Error("Password must be specified");
  if (!e.salt)
    throw new Error("Salt must be specified");
  if (e.salt = v(e.salt), e.salt.length < 8)
    throw new Error("Salt should be at least 8 bytes long");
  if (e.secret = v((t = e.secret) !== null && t !== void 0 ? t : ""), !Number.isInteger(e.iterations) || e.iterations < 1)
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
function me(e) {
  return R(this, void 0, void 0, function* () {
    return Ut(e), Ft(Object.assign(Object.assign({}, e), { hashType: "id" }));
  });
}
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
new D();
const mt = 32;
async function iA(e, t, A = Xe) {
  bt(A);
  try {
    const i = await me({
      password: e,
      salt: t,
      iterations: A.tCost,
      memorySize: A.mCost,
      parallelism: A.pCost,
      hashLength: mt,
      outputType: "binary"
    });
    return ke(i);
  } catch {
    throw new Error("Key derivation failed");
  }
}
function bt(e) {
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
async function Gt() {
  try {
    const e = await me({
      password: "test",
      salt: new Uint8Array(16),
      iterations: 1,
      memorySize: 1024,
      // 1 MiB for quick test
      parallelism: 1,
      hashLength: 32,
      outputType: "binary"
    });
    return e.length !== 32 ? !1 : (Se(e), !0);
  } catch {
    return !1;
  }
}
function Kt(e) {
  return e === "localhost" || e === "127.0.0.1" || e.endsWith(".localhost");
}
function be(e) {
  if (typeof window > "u")
    return;
  const t = window.location.hostname;
  if (!Kt(t))
    throw new Error(
      "[Cedros] WebAuthn RP domain validation is not configured. Set wallet.allowedRpDomains to a non-empty list of allowed domains."
    );
}
function te() {
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator.credentials < "u";
}
async function Ht() {
  if (!te())
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
async function rA(e, t, A, i, r) {
  if (!te())
    throw new Error("WebAuthn is not available in this browser");
  be();
  const n = i ?? rt(), o = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        name: "Cedros Wallet",
        id: window.location.hostname
      },
      user: {
        id: T(e),
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
            first: n
          }
        }
      }
    }
  });
  if (!o)
    throw new Error("Passkey registration was cancelled");
  const a = o.getClientExtensionResults();
  if (!a.prf?.enabled || !a.prf?.results?.first)
    throw new Error(
      "PRF extension is not supported by this authenticator. Please use a device with a compatible platform authenticator."
    );
  const c = a.prf?.results?.first;
  if (!c)
    throw new Error("PRF extension did not return a result");
  const s = new Uint8Array(c);
  if (s.length !== 32)
    throw new Error(
      `Unexpected PRF output length: expected 32 bytes, got ${s.length}. The authenticator may not be compatible.`
    );
  return {
    credentialId: z(new Uint8Array(o.rawId)),
    prfSalt: z(n),
    prfOutput: s
  };
}
async function nA(e, t) {
  if (!te())
    throw new Error("WebAuthn is not available in this browser");
  be();
  const A = st(e), i = await navigator.credentials.get({
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
  if (!i)
    throw new Error("Passkey authentication was cancelled");
  const n = i.getClientExtensionResults().prf?.results?.first;
  if (!n)
    throw new Error("PRF extension did not return a result during authentication");
  const o = new Uint8Array(n);
  if (o.length !== 32)
    throw new Error(
      `Unexpected PRF output length: expected 32 bytes, got ${o.length}. The authenticator may not be compatible.`
    );
  return { prfOutput: o };
}
async function Jt() {
  const [e, t, A, i, r, n, o] = await Promise.all([
    Mt(),
    Vt(),
    at(),
    Pt(),
    Promise.resolve(te()),
    Ht(),
    Gt()
  ]);
  return {
    webCrypto: e,
    aesGcm: t,
    hkdf: A,
    ed25519: i,
    webAuthn: r,
    webAuthnPrf: n,
    argon2: o,
    allSupported: e && t && A && r && n && o
  };
}
async function Mt() {
  try {
    return typeof crypto < "u" && typeof crypto.subtle < "u" && typeof crypto.getRandomValues == "function";
  } catch {
    return !1;
  }
}
async function Vt() {
  try {
    const e = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, !1, [
      "encrypt",
      "decrypt"
    ]), t = new Uint8Array([1, 2, 3, 4]), A = crypto.getRandomValues(new Uint8Array(12)), i = await crypto.subtle.encrypt({ name: "AES-GCM", iv: A }, e, t), r = await crypto.subtle.decrypt({ name: "AES-GCM", iv: A }, e, i), n = new Uint8Array(r);
    return n.length === t.length && n.every((o, a) => o === t[a]);
  } catch {
    return !1;
  }
}
async function Pt() {
  try {
    return await crypto.subtle.generateKey("Ed25519", !1, ["sign", "verify"]), !0;
  } catch {
    return !1;
  }
}
function oA(e) {
  if (e.allSupported)
    return null;
  const t = [];
  return e.webCrypto || t.push("Web Crypto API"), e.aesGcm || t.push("AES-GCM encryption"), e.hkdf || t.push("HKDF key derivation"), e.webAuthn || t.push("WebAuthn/Passkeys"), e.webAuthnPrf || t.push("WebAuthn PRF extension (requires platform authenticator)"), e.argon2 || t.push("Argon2 password hashing"), t.length === 0 ? null : `Your browser or device is missing required features: ${t.join(", ")}. Please use a modern browser with a platform authenticator (e.g., Touch ID, Face ID, Windows Hello).`;
}
function sA() {
  const e = typeof navigator < "u" ? navigator.userAgent : "", t = e.match(/Chrome\/(\d+)/);
  if (t) {
    const n = parseInt(t[1], 10);
    return {
      browser: "Chrome",
      version: t[1],
      likelySupported: n >= 116
    };
  }
  const A = e.match(/Version\/(\d+)/);
  if (A && e.includes("Safari") && !e.includes("Chrome")) {
    const n = parseInt(A[1], 10);
    return {
      browser: "Safari",
      version: A[1],
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
let $ = null, le = null;
const Nt = 6e4;
async function Yt(e = !1) {
  const t = Date.now(), A = le === null || t - le > Nt;
  return !e && !(typeof window > "u") && !A && $ !== null || ($ = await Jt(), le = Date.now()), $;
}
function xt(e) {
  switch (e.type) {
    case "password":
      return { password: e.password };
    case "prfOutput":
      return { prfOutput: e.prfOutput };
  }
}
function Ot() {
  const e = pe(), [t, A] = K(!1), [i, r] = K(null), n = e?.config.serverUrl, o = e?.config.requestTimeout, a = e?.config.retryAttempts, c = e?._internal?.getAccessToken, s = P(() => e ? new Ee({
    baseUrl: n,
    timeoutMs: o,
    retryAttempts: a,
    getAccessToken: c
  }) : null, [e, n, o, a, c]), y = E(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      return await s.get("/wallet/status");
    } catch (I) {
      const l = V(I, "Failed to fetch wallet status");
      throw r(l.message), l;
    } finally {
      A(!1);
    }
  }, [s]), p = E(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      return await s.get("/wallet/material");
    } catch (I) {
      const l = V(I, "Failed to fetch wallet material");
      if (l.code === "NOT_FOUND")
        return null;
      throw r(l.message), l;
    } finally {
      A(!1);
    }
  }, [s]), w = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        await s.post("/wallet/enroll", I);
      } catch (l) {
        const u = V(l, "Failed to enroll wallet");
        throw r(u.message), u;
      } finally {
        A(!1);
      }
    },
    [s]
  ), h = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        await s.post("/wallet/recover", I);
      } catch (l) {
        const u = V(l, "Failed to recover wallet");
        throw r(u.message), u;
      } finally {
        A(!1);
      }
    },
    [s]
  ), m = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        return await s.post("/wallet/sign", I);
      } catch (l) {
        const u = V(l, "Failed to sign transaction");
        throw r(u.message), u;
      } finally {
        A(!1);
      }
    },
    [s]
  ), Q = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        await s.post("/wallet/rotate-user-secret", I);
      } catch (l) {
        const u = V(l, "Failed to rotate user secret");
        throw r(u.message), u;
      } finally {
        A(!1);
      }
    },
    [s]
  ), B = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        return await s.post(
          "/wallet/unlock",
          xt(I)
        );
      } catch (l) {
        const u = V(l, "Failed to unlock wallet");
        throw r(u.message), u;
      } finally {
        A(!1);
      }
    },
    [s]
  ), f = E(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      await s.post("/wallet/lock", {});
    } catch (I) {
      const l = V(I, "Failed to lock wallet");
      throw r(l.message), l;
    } finally {
      A(!1);
    }
  }, [s]), F = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        return await s.post("/wallet/share-b", I);
      } catch (l) {
        const u = V(l, "Failed to get Share B for recovery");
        throw r(u.message), u;
      } finally {
        A(!1);
      }
    },
    [s]
  ), k = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        return await s.post("/wallet/derived", I);
      } catch (l) {
        const u = V(l, "Failed to create derived wallet");
        throw r(u.message), u;
      } finally {
        A(!1);
      }
    },
    [s]
  ), U = E(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      return await s.get("/wallet/derived");
    } catch (I) {
      const l = V(I, "Failed to list wallets");
      throw r(l.message), l;
    } finally {
      A(!1);
    }
  }, [s]), d = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        await s.delete(`/wallet/derived/${I}`);
      } catch (l) {
        const u = V(l, "Failed to delete derived wallet");
        throw r(u.message), u;
      } finally {
        A(!1);
      }
    },
    [s]
  ), g = E(() => r(null), []);
  return {
    getStatus: y,
    getMaterial: p,
    enroll: w,
    recover: h,
    signTransaction: m,
    rotateUserSecret: Q,
    unlock: B,
    lock: f,
    getShareBForRecovery: F,
    createDerivedWallet: k,
    listAllWallets: U,
    deleteDerivedWallet: d,
    isLoading: t,
    error: i,
    clearError: g
  };
}
const vt = {
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
function Tt() {
  const t = pe() !== null, [A, i] = K("loading"), [r, n] = K(null), [o, a] = K(null), [c, s] = K(!1), [y, p] = K(!1), [w, h] = K(null), [m, Q] = K(null), { getStatus: B, isLoading: f } = Ot(), F = Y(!1);
  x(() => {
    if (!t) return;
    let d = !1;
    return (async () => {
      try {
        const I = await Yt();
        if (d) return;
        h(I), I.allSupported || (i("error"), Q(
          "Your browser or device does not support all required features. Please use a modern browser with a platform authenticator."
        ));
      } catch {
        if (d) return;
        h(null), i("error"), Q("Failed to check crypto capabilities");
      }
    })(), () => {
      d = !0;
    };
  }, [t]);
  const k = E(async () => {
    if (!(!t || !w?.allSupported)) {
      i("loading"), Q(null);
      try {
        const d = await B();
        n(d.solanaPubkey ?? null), a(d.authMethod ?? null), s(d.hasExternalWallet), p(d.unlocked), d.hasExternalWallet ? i("enrolled_unlocked") : d.enrolled ? i(d.unlocked ? "enrolled_unlocked" : "enrolled_locked") : i("not_enrolled");
      } catch (d) {
        i("error"), Q(d instanceof Error ? d.message : "Failed to fetch wallet status");
      }
    }
  }, [t, w?.allSupported, B]);
  x(() => {
    t && w?.allSupported && !f && !F.current && (F.current = !0, k());
  }, [t, w?.allSupported, f, k]);
  const U = E(() => Q(null), []);
  return t ? {
    status: A,
    solanaPubkey: r,
    authMethod: o,
    hasExternalWallet: c,
    isUnlocked: y,
    capabilities: w,
    isSupported: w?.allSupported ?? !1,
    error: m,
    refresh: k,
    clearError: U
  } : vt;
}
const Ae = "__CEDROS_EMBEDDED_WALLET__";
function Rt(e) {
  typeof window < "u" && (window[Ae] = e);
}
function ce() {
  typeof window < "u" && delete window[Ae];
}
function IA() {
  return typeof window > "u" ? !1 : window[Ae]?.available ?? !1;
}
function aA() {
  return typeof window > "u" ? null : window[Ae] ?? null;
}
function Lt() {
  const { config: e, user: t } = ye(), { status: A, solanaPubkey: i, hasExternalWallet: r } = Tt(), n = e.wallet?.exposeAvailability ?? !1, o = e.wallet?.exposePublicKey ?? !1;
  return x(() => {
    if (!n || !t) {
      ce();
      return;
    }
    if (r) {
      ce();
      return;
    }
    if (A === "loading")
      return;
    const a = A === "enrolled_locked" || A === "enrolled_unlocked";
    return Rt({
      available: a,
      publicKey: o && a ? i : null
    }), () => {
      ce();
    };
  }, [n, o, t, A, i, r]), null;
}
function gA({ config: e, children: t }) {
  const [A, i] = K(null), [r, n] = K(!1), o = Y(e.callbacks);
  o.current = e.callbacks;
  const a = Y({
    onLoginSuccess: (...J) => o.current?.onLoginSuccess?.(...J),
    onLoginError: (...J) => o.current?.onLoginError?.(...J),
    onLogout: () => o.current?.onLogout?.(),
    onSessionExpired: () => o.current?.onSessionExpired?.()
  }), c = e.features === "auto", {
    features: s,
    googleClientId: y,
    appleClientId: p,
    isLoading: w
  } = Ne(
    e.serverUrl,
    c,
    e.requestTimeout
  ), h = P(() => !c || !s ? e : {
    ...e,
    features: s,
    googleClientId: e.googleClientId ?? y,
    appleClientId: e.appleClientId ?? p
  }, [e, c, s, y, p]), m = P(
    () => JSON.stringify(h.themeOverrides ?? null),
    [h.themeOverrides]
  ), Q = P(() => JSON.stringify(h.session ?? null), [h.session]), B = P(() => JSON.stringify(h.features ?? null), [h.features]), f = P(() => JSON.stringify(h.forms ?? null), [h.forms]), F = P(
    () => h,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Using serialized keys for deep comparison; callbacks excluded (see UI-06)
    [
      h.serverUrl,
      h.googleClientId,
      h.appleClientId,
      h.requestTimeout,
      h.retryAttempts,
      h.theme,
      m,
      Q,
      B,
      f
    ]
  );
  Ve({
    theme: F.theme,
    themeOverrides: F.themeOverrides
  });
  const {
    user: k,
    authState: U,
    handleLoginSuccess: d,
    logout: g,
    refreshUser: I,
    getAccessToken: l
  } = Le({
    serverUrl: F.serverUrl,
    session: F.session,
    callbacks: a.current,
    requestTimeoutMs: F.requestTimeout
  }), u = E(async () => {
    i(null), await g();
  }, [g]), C = E(
    (...J) => {
      i(null), d(...J);
    },
    [d]
  ), S = E(() => n(!0), []), G = E(() => n(!1), []), H = P(
    () => ({
      config: F,
      user: k,
      authState: U,
      logout: u,
      refreshUser: I,
      _internal: {
        handleLoginSuccess: C,
        getAccessToken: l
      }
    }),
    [F, k, U, u, I, C, l]
  ), b = P(
    () => ({
      error: A,
      isModalOpen: r,
      openModal: S,
      closeModal: G
    }),
    [A, r, S, G]
  ), M = P(
    () => ({ ...H, ...b }),
    [H, b]
  );
  return c && w ? null : /* @__PURE__ */ ne(He.Provider, { value: H, children: /* @__PURE__ */ ne(Je.Provider, { value: b, children: /* @__PURE__ */ Ke(Me.Provider, { value: M, children: [
    /* @__PURE__ */ ne(Lt, {}),
    t
  ] }) }) });
}
function lA() {
  const { user: e, authState: t, error: A, logout: i, refreshUser: r, openModal: n, closeModal: o } = ye();
  return {
    user: e,
    authState: t,
    error: A,
    isAuthenticated: t === "authenticated" && e !== null,
    isLoading: t === "loading",
    logout: i,
    refreshUser: r,
    openLoginModal: n,
    closeLoginModal: o
  };
}
export {
  gA as C,
  Xe as D,
  zt as a,
  tA as b,
  z as c,
  iA as d,
  Se as e,
  _t as f,
  $t as g,
  ze as h,
  oA as i,
  sA as j,
  Ot as k,
  rt as l,
  nA as m,
  AA as n,
  xt as o,
  st as p,
  Tt as q,
  rA as r,
  IA as s,
  ke as t,
  lA as u,
  bt as v,
  eA as w,
  aA as x
};
