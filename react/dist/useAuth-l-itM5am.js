import { jsx as ie, jsxs as Ke } from "react/jsx-runtime";
import { useEffect as x, useState as F, useRef as N, useCallback as d, useMemo as Y } from "react";
import { A as He, a as Je, C as Me } from "./LoadingSpinner-6vml-zwr.js";
import { A as pe, g as re, a as ye, h as P, u as ke } from "./useCedrosLogin-CFfID-0i.js";
let q = 0;
function Ve({ theme: e, themeOverrides: A }) {
  x(() => {
    if (typeof document > "u" || typeof window > "u")
      return;
    const t = document.documentElement;
    let i = !1;
    e === "dark" ? i = !0 : e === "light" ? i = !1 : i = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let r = !1;
    i ? (q++, r = !0, t.classList.add("cedros-dark")) : q === 0 && t.classList.remove("cedros-dark");
    const n = /* @__PURE__ */ new Map();
    return A && Object.entries(A).forEach(([o, a]) => {
      if (a) {
        const C = t.style.getPropertyValue(o);
        n.set(o, C), t.style.setProperty(o, a);
      }
    }), () => {
      r && (q--, q === 0 && t.classList.remove("cedros-dark")), n.forEach((o, a) => {
        o ? t.style.setProperty(a, o) : t.style.removeProperty(a);
      });
    };
  }, [e, A]);
}
const Pe = {
  email: !0,
  google: !0,
  apple: !0,
  solana: !0,
  webauthn: !0,
  instantLink: !0
};
function Ne(e, A, t) {
  const [i, r] = F(null), [n, o] = F(), [a, C] = F(), [s, p] = F(), [y, Q] = F(), [m, U] = F(), [c, B] = F(), [u, b] = F(A), k = N(!1);
  return x(() => {
    if (!A || k.current) return;
    k.current = !0, new pe({
      baseUrl: e,
      timeoutMs: t ?? 5e3,
      retryAttempts: 1
    }).get("/features", { credentials: "omit" }).then((h) => {
      r({
        email: h.email,
        google: h.google,
        apple: h.apple,
        solana: h.solana,
        webauthn: h.webauthn,
        instantLink: h.instantLink
      }), o(h.googleClientId), C(h.appleClientId), p(h.usernameEnabled), Q(h.walletEnrollEnabled), U(h.showRecoveryEnabled), B(h.socialButtonOrder);
    }).catch(() => {
      r(Pe);
    }).finally(() => {
      b(!1);
    });
  }, [A, e, t]), { features: i, googleClientId: n, appleClientId: a, usernameEnabled: s, walletEnrollEnabled: y, showRecoveryEnabled: m, socialButtonOrder: c, isLoading: u };
}
const Ye = "cedros_tokens", Oe = 6e4;
class xe {
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
  constructor(A = "cookie", t = Ye, i = {}) {
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
    const A = this.getTimeUntilExpiry(), t = Math.max(0, A - Oe);
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
function _(e) {
  if (typeof e != "object" || e === null) return !1;
  const A = e;
  if (typeof A.user != "object" || A.user === null) return !1;
  const t = A.user;
  return typeof t.id == "string" && t.id.length > 0;
}
function Re(e) {
  if (typeof e != "object" || e === null) return !1;
  const A = e;
  return typeof A.accessToken == "string" && A.accessToken.length > 0 && typeof A.refreshToken == "string" && A.refreshToken.length > 0 && typeof A.expiresIn == "number" && A.expiresIn > 0;
}
function Le({
  serverUrl: e,
  session: A,
  callbacks: t,
  requestTimeoutMs: i
}) {
  const [r, n] = F(null), [o, a] = F("idle"), C = N(null), s = N(null), p = N(t), y = N(!0), Q = N(null), m = N(() => Promise.resolve()), U = N(() => {
  });
  x(() => {
    p.current = t;
  }, [t]), x(() => (y.current = !0, () => {
    y.current = !1;
  }), []);
  const c = d((f) => {
    y.current && n(f);
  }, []), B = d((f) => {
    y.current && a(f);
  }, []), u = Y(
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
  x(() => {
    const f = new xe(u.storage, u.persistKey, {
      allowWebStorage: u.allowWebStorage
    });
    return C.current = f, u.autoRefresh && f.setRefreshCallback(() => m.current()), f.setSessionExpiredCallback(() => U.current()), u.syncTabs && (s.current = new Te()), () => {
      f.destroy(), C.current = null, s.current?.close();
    };
  }, [
    u.storage,
    u.syncTabs,
    u.persistKey,
    u.allowWebStorage,
    u.autoRefresh
  ]);
  const b = d(async () => {
    if (Q.current)
      return Q.current;
    const f = C.current?.getRefreshToken(), S = !!f, G = re(), H = {};
    S && (H["Content-Type"] = "application/json"), G && (H["X-CSRF-Token"] = G);
    let K, J;
    const V = new Promise((M, L) => {
      K = M, J = L;
    });
    Q.current = V, (async () => {
      const M = new AbortController(), L = i ?? 1e4, Ge = window.setTimeout(() => M.abort(), L);
      try {
        const W = await fetch(`${e}/refresh`, {
          method: "POST",
          headers: Object.keys(H).length > 0 ? H : void 0,
          credentials: "include",
          body: S ? JSON.stringify({ refreshToken: f }) : void 0,
          signal: M.signal
        });
        if (!W.ok)
          throw new Error("Token refresh failed");
        const te = await W.json();
        if (te.tokens) {
          if (!Re(te.tokens))
            throw new Error("Invalid token response structure");
          C.current?.setTokens(te.tokens);
        } else if (u.storage !== "cookie")
          throw new Error("Token refresh failed");
        s.current?.broadcastRefresh(), K();
      } catch (W) {
        throw J(W), W;
      } finally {
        window.clearTimeout(Ge);
      }
    })().catch(() => {
    });
    try {
      await V;
    } finally {
      Q.current = null;
    }
  }, [e, u.storage, i]), k = d(() => {
    if (u.storage === "cookie") return;
    const f = C.current?.getAccessToken();
    if (f)
      return { Authorization: `Bearer ${f}` };
  }, [u.storage]), E = d(() => {
    C.current?.clear(), c(null), B("unauthenticated"), p.current?.onSessionExpired?.();
  }, [B, c]);
  m.current = b, U.current = E;
  const h = d(
    (f) => {
      const S = new AbortController(), G = i ?? 1e4, H = window.setTimeout(() => S.abort(), G), K = {}, J = k();
      J && Object.assign(K, J);
      const V = re();
      return V && (K["X-CSRF-Token"] = V), {
        promise: fetch(f, {
          credentials: "include",
          headers: Object.keys(K).length > 0 ? K : void 0,
          signal: S.signal
        }),
        cleanup: () => window.clearTimeout(H)
      };
    },
    [k, i]
  ), g = d(async () => {
    const f = h(`${e}/user`);
    try {
      const S = await f.promise;
      if (S.ok) {
        const G = await S.json();
        if (_(G)) {
          c(G.user), B("authenticated");
          return;
        }
      }
      if (S.status === 401 && u.autoRefresh) {
        try {
          await b();
        } catch {
          E();
          return;
        }
        const G = h(`${e}/user`);
        try {
          const H = await G.promise;
          if (H.ok) {
            const K = await H.json();
            if (_(K)) {
              c(K.user), B("authenticated");
              return;
            }
          }
        } finally {
          G.cleanup();
        }
      }
      c(null), B("unauthenticated");
    } catch {
      c(null), B("unauthenticated");
    } finally {
      f.cleanup();
    }
  }, [
    e,
    u.autoRefresh,
    b,
    h,
    E,
    B,
    c
  ]);
  x(() => {
    !s.current || !u.syncTabs || s.current.setCallback((f) => {
      switch (f.type) {
        case "login":
          c(f.user), B("authenticated");
          break;
        case "logout":
          c(null), B("unauthenticated"), C.current?.clear();
          break;
        case "refresh":
          g();
          break;
        default:
          console.warn("[Cedros Login] Unhandled tab sync event:", f);
      }
    });
  }, [u.syncTabs, g, B, c]), x(() => {
    const f = new AbortController(), S = i ?? 1e4, G = window.setTimeout(() => f.abort(), S);
    return (async () => {
      B("loading");
      try {
        const K = await fetch(`${e}/user`, {
          credentials: "include",
          headers: k(),
          signal: f.signal
        });
        if (K.ok) {
          const J = await K.json();
          if (_(J)) {
            c(J.user), B("authenticated");
            return;
          }
        }
        if (K.status === 401 && u.autoRefresh) {
          try {
            await b();
          } catch {
            E();
            return;
          }
          const J = await fetch(`${e}/user`, {
            credentials: "include",
            headers: k(),
            signal: f.signal
          });
          if (J.ok) {
            const V = await J.json();
            if (_(V)) {
              c(V.user), B("authenticated");
              return;
            }
          }
        }
        c(null), B("unauthenticated");
      } catch {
        c(null), B("unauthenticated");
      }
    })(), () => {
      window.clearTimeout(G), f.abort();
    };
  }, [
    e,
    u.autoRefresh,
    b,
    k,
    E,
    B,
    c,
    i
  ]);
  const I = d(
    (f, S) => {
      c(f), B("authenticated"), S && C.current?.setTokens(S), y.current && s.current?.broadcastLogin(f);
    },
    [c, B]
  ), l = d(async () => {
    const f = re(), S = new AbortController(), G = i ?? 1e4, H = window.setTimeout(() => S.abort(), G);
    try {
      await fetch(`${e}/logout`, {
        method: "POST",
        headers: {
          ...f ? { "X-CSRF-Token": f } : {},
          ...k() ?? {}
        },
        credentials: "include",
        signal: S.signal
      });
    } catch {
    } finally {
      window.clearTimeout(H), c(null), B("unauthenticated"), C.current?.clear(), s.current?.broadcastLogout(), p.current?.onLogout?.();
    }
  }, [e, k, c, B, i]), w = d(() => C.current?.getAccessToken() ?? null, []);
  return {
    user: r,
    authState: o,
    handleLoginSuccess: I,
    logout: l,
    refreshUser: g,
    getAccessToken: w
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
  const A = e[0];
  return A === 0 || A === 1 || A === 128 || A === 8;
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
function qA(e) {
  if (!je(e))
    throw new Error(`Invalid share length: expected >=16, got ${e.length}`);
  return e;
}
function Se(e) {
  if (!Ze(e))
    throw new Error(`Invalid key length: expected 32, got ${e.length}`);
  return e;
}
function eA(e) {
  if (!qe(e))
    throw new Error(`Invalid nonce length: expected 12, got ${e.length}`);
  return e;
}
function AA(e) {
  if (!_e(e))
    throw new Error(`Invalid salt length: expected >=16, got ${e.length}`);
  return e;
}
function tA(e) {
  if (!$e(e))
    throw new Error(`Invalid PRF salt length: expected 32, got ${e.length}`);
  return e;
}
function X(e) {
  return new Uint8Array(e);
}
function ee(e) {
  if (typeof crypto > "u" || !crypto.getRandomValues)
    throw new Error(
      "WebCrypto API not available. Secure random generation requires a modern browser."
    );
  const A = new Uint8Array(e);
  return crypto.getRandomValues(A), A;
}
function _A() {
  return ze(ee(16));
}
function iA() {
  return eA(ee(12));
}
function $A() {
  return AA(ee(16));
}
function zA() {
  return tA(ee(32));
}
function De(e) {
  if (!(!e || e.length === 0)) {
    if (typeof globalThis.crypto?.getRandomValues == "function")
      globalThis.crypto.getRandomValues(e);
    else
      for (let A = 0; A < e.length; A++)
        e[A] = A * 90 & 255;
    e.fill(0);
  }
}
function et(...e) {
  for (const A of e)
    A && De(A);
}
async function rA(e) {
  return crypto.subtle.importKey(
    "raw",
    X(e),
    { name: "AES-GCM", length: 256 },
    !1,
    // not extractable
    ["encrypt", "decrypt"]
  );
}
async function nA(e, A, t) {
  const i = t ?? iA(), r = await rA(A), n = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: X(i) },
    r,
    X(e)
  );
  return {
    ciphertext: new Uint8Array(n),
    nonce: i
  };
}
async function At(e, A) {
  const t = await nA(e, A);
  return {
    ciphertext: ue(t.ciphertext),
    nonce: ue(t.nonce)
  };
}
function ue(e) {
  const t = [];
  for (let i = 0; i < e.length; i += 32768) {
    const r = e.subarray(i, Math.min(i + 32768, e.length));
    t.push(String.fromCharCode(...r));
  }
  return btoa(t.join(""));
}
function oA(e) {
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
async function sA(e, A, t, i = 32) {
  const r = await crypto.subtle.importKey(
    "raw",
    X(e),
    "HKDF",
    !1,
    ["deriveBits"]
  ), n = new TextEncoder().encode(t), o = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: X(A ?? new Uint8Array(32)),
      // Zero salt if not provided
      info: X(n)
    },
    r,
    i * 8
    // bits
  );
  return new Uint8Array(o);
}
async function tt(e, A) {
  const t = await sA(e, A, "cedros-wallet-share-b-encryption", 32);
  return Se(t);
}
async function IA() {
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
function R(e, A, t, i) {
  function r(n) {
    return n instanceof t ? n : new t(function(o) {
      o(n);
    });
  }
  return new (t || (t = Promise))(function(n, o) {
    function a(p) {
      try {
        s(i.next(p));
      } catch (y) {
        o(y);
      }
    }
    function C(p) {
      try {
        s(i.throw(p));
      } catch (y) {
        o(y);
      }
    }
    function s(p) {
      p.done ? n(p.value) : r(p.value).then(a, C);
    }
    s((i = i.apply(e, [])).next());
  });
}
class D {
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
    return R(this, void 0, void 0, function* () {
      const t = yield this.lock();
      try {
        return yield Promise.resolve(A());
      } finally {
        t();
      }
    });
  }
}
var ne;
function aA() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global;
}
const le = aA(), oe = (ne = le.Buffer) !== null && ne !== void 0 ? ne : null, gA = le.TextEncoder ? new le.TextEncoder() : null;
function Fe(e, A) {
  return (e & 15) + (e >> 6 | e >> 3 & 8) << 4 | (A & 15) + (A >> 6 | A >> 3 & 8);
}
function Ue(e, A) {
  const t = A.length >> 1;
  for (let i = 0; i < t; i++) {
    const r = i << 1;
    e[i] = Fe(A.charCodeAt(r), A.charCodeAt(r + 1));
  }
}
function lA(e, A) {
  if (e.length !== A.length * 2)
    return !1;
  for (let t = 0; t < A.length; t++) {
    const i = t << 1;
    if (A[t] !== Fe(e.charCodeAt(i), e.charCodeAt(i + 1)))
      return !1;
  }
  return !0;
}
const we = 87, Qe = 48;
function ce(e, A, t) {
  let i = 0;
  for (let r = 0; r < t; r++) {
    let n = A[r] >>> 4;
    e[i++] = n > 9 ? n + we : n + Qe, n = A[r] & 15, e[i++] = n > 9 ? n + we : n + Qe;
  }
  return String.fromCharCode.apply(null, e);
}
const T = oe !== null ? (e) => {
  if (typeof e == "string") {
    const A = oe.from(e, "utf8");
    return new Uint8Array(A.buffer, A.byteOffset, A.length);
  }
  if (oe.isBuffer(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.length);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
} : (e) => {
  if (typeof e == "string")
    return gA.encode(e);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
}, O = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Z = new Uint8Array(256);
for (let e = 0; e < O.length; e++)
  Z[O.charCodeAt(e)] = e;
function Be(e, A = !0) {
  const t = e.length, i = t % 3, r = [], n = t - i;
  for (let o = 0; o < n; o += 3) {
    const a = (e[o] << 16 & 16711680) + (e[o + 1] << 8 & 65280) + (e[o + 2] & 255), C = O.charAt(a >> 18 & 63) + O.charAt(a >> 12 & 63) + O.charAt(a >> 6 & 63) + O.charAt(a & 63);
    r.push(C);
  }
  if (i === 1) {
    const o = e[t - 1], a = O.charAt(o >> 2), C = O.charAt(o << 4 & 63);
    r.push(`${a}${C}`), A && r.push("==");
  } else if (i === 2) {
    const o = (e[t - 2] << 8) + e[t - 1], a = O.charAt(o >> 10), C = O.charAt(o >> 4 & 63), s = O.charAt(o << 2 & 63);
    r.push(`${a}${C}${s}`), A && r.push("=");
  }
  return r.join("");
}
function cA(e) {
  let A = Math.floor(e.length * 0.75);
  const t = e.length;
  return e[t - 1] === "=" && (A -= 1, e[t - 2] === "=" && (A -= 1)), A;
}
function CA(e) {
  const A = cA(e), t = e.length, i = new Uint8Array(A);
  let r = 0;
  for (let n = 0; n < t; n += 4) {
    const o = Z[e.charCodeAt(n)], a = Z[e.charCodeAt(n + 1)], C = Z[e.charCodeAt(n + 2)], s = Z[e.charCodeAt(n + 3)];
    i[r] = o << 2 | a >> 4, r += 1, i[r] = (a & 15) << 4 | C >> 2, r += 1, i[r] = (C & 3) << 6 | s & 63, r += 1;
  }
  return i;
}
const $ = 16 * 1024, j = 4, hA = new D(), se = /* @__PURE__ */ new Map();
function me(e, A) {
  return R(this, void 0, void 0, function* () {
    let t = null, i = null, r = !1;
    if (typeof WebAssembly > "u")
      throw new Error("WebAssembly is not supported in this environment!");
    const n = (g, I = 0) => {
      i.set(g, I);
    }, o = () => i, a = () => t.exports, C = (g) => {
      t.exports.Hash_SetMemorySize(g);
      const I = t.exports.Hash_GetBuffer(), l = t.exports.memory.buffer;
      i = new Uint8Array(l, I, g);
    }, s = () => new DataView(t.exports.memory.buffer).getUint32(t.exports.STATE_SIZE, !0), p = hA.dispatch(() => R(this, void 0, void 0, function* () {
      if (!se.has(e.name)) {
        const I = CA(e.data), l = WebAssembly.compile(I);
        se.set(e.name, l);
      }
      const g = yield se.get(e.name);
      t = yield WebAssembly.instantiate(g, {
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
    })), y = () => R(this, void 0, void 0, function* () {
      t || (yield p);
      const g = t.exports.Hash_GetBuffer(), I = t.exports.memory.buffer;
      i = new Uint8Array(I, g, $);
    }), Q = (g = null) => {
      r = !0, t.exports.Hash_Init(g);
    }, m = (g) => {
      let I = 0;
      for (; I < g.length; ) {
        const l = g.subarray(I, I + $);
        I += l.length, i.set(l), t.exports.Hash_Update(l.length);
      }
    }, U = (g) => {
      if (!r)
        throw new Error("update() called before init()");
      const I = T(g);
      m(I);
    }, c = new Uint8Array(A * 2), B = (g, I = null) => {
      if (!r)
        throw new Error("digest() called before init()");
      return r = !1, t.exports.Hash_Final(I), g === "binary" ? i.slice(0, A) : ce(c, i, A);
    }, u = () => {
      if (!r)
        throw new Error("save() can only be called after init() and before digest()");
      const g = t.exports.Hash_GetState(), I = s(), l = t.exports.memory.buffer, w = new Uint8Array(l, g, I), f = new Uint8Array(j + I);
      return Ue(f, e.hash), f.set(w, j), f;
    }, b = (g) => {
      if (!(g instanceof Uint8Array))
        throw new Error("load() expects an Uint8Array generated by save()");
      const I = t.exports.Hash_GetState(), l = s(), w = j + l, f = t.exports.memory.buffer;
      if (g.length !== w)
        throw new Error(`Bad state length (expected ${w} bytes, got ${g.length})`);
      if (!lA(e.hash, g.subarray(0, j)))
        throw new Error("This state was written by an incompatible hash implementation");
      const S = g.subarray(j);
      new Uint8Array(f, I, l).set(S), r = !0;
    }, k = (g) => typeof g == "string" ? g.length < $ / 4 : g.byteLength < $;
    let E = k;
    switch (e.name) {
      case "argon2":
      case "scrypt":
        E = () => !0;
        break;
      case "blake2b":
      case "blake2s":
        E = (g, I) => I <= 512 && k(g);
        break;
      case "blake3":
        E = (g, I) => I === 0 && k(g);
        break;
      case "xxhash64":
      // cannot simplify
      case "xxhash3":
      case "xxhash128":
      case "crc64":
        E = () => !1;
        break;
    }
    const h = (g, I = null, l = null) => {
      if (!E(g, I))
        return Q(I), U(g), B("hex", l);
      const w = T(g);
      return i.set(w), t.exports.Hash_Calculate(w.length, I, l), ce(c, i, A);
    };
    return yield y(), {
      getMemory: o,
      writeMemory: n,
      getExports: a,
      setMemorySize: C,
      init: Q,
      update: U,
      digest: B,
      save: u,
      load: b,
      calculate: h,
      hashLength: A
    };
  });
}
new D();
var fA = "argon2", uA = "AGFzbQEAAAABKQVgAX8Bf2AAAX9gEH9/f39/f39/f39/f39/f38AYAR/f39/AGACf38AAwYFAAECAwQFBgEBAoCAAgYIAX8BQZCoBAsHQQQGbWVtb3J5AgASSGFzaF9TZXRNZW1vcnlTaXplAAAOSGFzaF9HZXRCdWZmZXIAAQ5IYXNoX0NhbGN1bGF0ZQAECvEyBVgBAn9BACEBAkAgAEEAKAKICCICRg0AAkAgACACayIAQRB2IABBgIB8cSAASWoiAEAAQX9HDQBB/wHADwtBACEBQQBBACkDiAggAEEQdK18NwOICAsgAcALcAECfwJAQQAoAoAIIgANAEEAPwBBEHQiADYCgAhBACgCiAgiAUGAgCBGDQACQEGAgCAgAWsiAEEQdiAAQYCAfHEgAElqIgBAAEF/Rw0AQQAPC0EAQQApA4gIIABBEHStfDcDiAhBACgCgAghAAsgAAvcDgECfiAAIAQpAwAiECAAKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAMIBAgDCkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgBCAQIAQpAwCFQiiJIhA3AwAgACAQIAApAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAwgECAMKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAEIBAgBCkDAIVCAYk3AwAgASAFKQMAIhAgASkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDSAQIA0pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAEgECABKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACANIBAgDSkDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAIgBikDACIQIAIpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIA4gECAOKQMAhUIgiSIQNwMAIAogECAKKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACACIBAgAikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDiAQIA4pAwCFQjCJIhA3AwAgCiAQIAopAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACADIAcpAwAiECADKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAPIBAgDykDAIVCIIkiEDcDACALIBAgCykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAyAQIAMpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA8gECAPKQMAhUIwiSIQNwMAIAsgECALKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgACAFKQMAIhAgACkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDyAQIA8pAwCFQiCJIhA3AwAgCiAQIAopAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAAgECAAKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAPIBAgDykDAIVCMIkiEDcDACAKIBAgCikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAEgBikDACIQIAEpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAwgECAMKQMAhUIgiSIQNwMAIAsgECALKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACABIBAgASkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDCAQIAwpAwCFQjCJIhA3AwAgCyAQIAspAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACACIAcpAwAiECACKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACANIBAgDSkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAiAQIAIpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA0gECANKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgAyAEKQMAIhAgAykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDiAQIA4pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAQgECAEKQMAhUIoiSIQNwMAIAMgECADKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAOIBAgDikDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBCAQIAQpAwCFQgGJNwMAC98aAQN/QQAhBEEAIAIpAwAgASkDAIU3A5AIQQAgAikDCCABKQMIhTcDmAhBACACKQMQIAEpAxCFNwOgCEEAIAIpAxggASkDGIU3A6gIQQAgAikDICABKQMghTcDsAhBACACKQMoIAEpAyiFNwO4CEEAIAIpAzAgASkDMIU3A8AIQQAgAikDOCABKQM4hTcDyAhBACACKQNAIAEpA0CFNwPQCEEAIAIpA0ggASkDSIU3A9gIQQAgAikDUCABKQNQhTcD4AhBACACKQNYIAEpA1iFNwPoCEEAIAIpA2AgASkDYIU3A/AIQQAgAikDaCABKQNohTcD+AhBACACKQNwIAEpA3CFNwOACUEAIAIpA3ggASkDeIU3A4gJQQAgAikDgAEgASkDgAGFNwOQCUEAIAIpA4gBIAEpA4gBhTcDmAlBACACKQOQASABKQOQAYU3A6AJQQAgAikDmAEgASkDmAGFNwOoCUEAIAIpA6ABIAEpA6ABhTcDsAlBACACKQOoASABKQOoAYU3A7gJQQAgAikDsAEgASkDsAGFNwPACUEAIAIpA7gBIAEpA7gBhTcDyAlBACACKQPAASABKQPAAYU3A9AJQQAgAikDyAEgASkD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", wA = "e4cdc523", QA = {
  name: fA,
  data: uA,
  hash: wA
}, BA = "blake2b", dA = "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", EA = "c6f286e6", pA = {
  name: BA,
  data: dA,
  hash: EA
};
new D();
function de(e) {
  return !Number.isInteger(e) || e < 8 || e > 512 || e % 8 !== 0 ? new Error("Invalid variant! Valid values: 8, 16, ..., 512") : null;
}
function yA(e, A) {
  return e | A << 16;
}
function Ce(e = 512, A = null) {
  if (de(e))
    return Promise.reject(de(e));
  let t = null, i = e;
  if (A !== null) {
    if (t = T(A), t.length > 64)
      return Promise.reject(new Error("Max key length is 64 bytes"));
    i = yA(e, t.length);
  }
  const r = e / 8;
  return me(pA, r).then((n) => {
    i > 512 && n.writeMemory(t), n.init(i);
    const o = {
      init: i > 512 ? () => (n.writeMemory(t), n.init(i), o) : () => (n.init(i), o),
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
function kA(e, A, t) {
  const i = [
    `m=${A.memorySize}`,
    `t=${A.iterations}`,
    `p=${A.parallelism}`
  ].join(",");
  return `$argon2${A.hashType}$v=19$${i}$${Be(e, !1)}$${Be(t, !1)}`;
}
const Ee = new DataView(new ArrayBuffer(4));
function v(e) {
  return Ee.setInt32(0, e, !0), new Uint8Array(Ee.buffer);
}
function Ie(e, A, t) {
  return R(this, void 0, void 0, function* () {
    if (t <= 64) {
      const C = yield Ce(t * 8);
      return C.update(v(t)), C.update(A), C.digest("binary");
    }
    const i = Math.ceil(t / 32) - 2, r = new Uint8Array(t);
    e.init(), e.update(v(t)), e.update(A);
    let n = e.digest("binary");
    r.set(n.subarray(0, 32), 0);
    for (let C = 1; C < i; C++)
      e.init(), e.update(n), n = e.digest("binary"), r.set(n.subarray(0, 32), C * 32);
    const o = t - 32 * i;
    let a;
    return o === 64 ? (a = e, a.init()) : a = yield Ce(o * 8), a.update(n), n = a.digest("binary"), r.set(n.subarray(0, o), i * 32), r;
  });
}
function SA(e) {
  switch (e) {
    case "d":
      return 0;
    case "i":
      return 1;
    default:
      return 2;
  }
}
function DA(e) {
  return R(this, void 0, void 0, function* () {
    var A;
    const { parallelism: t, iterations: i, hashLength: r } = e, n = T(e.password), o = T(e.salt), a = 19, C = SA(e.hashType), { memorySize: s } = e, p = T((A = e.secret) !== null && A !== void 0 ? A : ""), [y, Q] = yield Promise.all([
      me(QA, 1024),
      Ce(512)
    ]);
    y.setMemorySize(s * 1024 + 1024);
    const m = new Uint8Array(24), U = new DataView(m.buffer);
    U.setInt32(0, t, !0), U.setInt32(4, r, !0), U.setInt32(8, s, !0), U.setInt32(12, i, !0), U.setInt32(16, a, !0), U.setInt32(20, C, !0), y.writeMemory(m, s * 1024), Q.init(), Q.update(m), Q.update(v(n.length)), Q.update(n), Q.update(v(o.length)), Q.update(o), Q.update(v(p.length)), Q.update(p), Q.update(v(0));
    const B = Math.floor(s / (t * 4)) * 4, u = new Uint8Array(72), b = Q.digest("binary");
    u.set(b);
    for (let h = 0; h < t; h++) {
      u.set(v(0), 64), u.set(v(h), 68);
      let g = h * B, I = yield Ie(Q, u, 1024);
      y.writeMemory(I, g * 1024), g += 1, u.set(v(1), 64), I = yield Ie(Q, u, 1024), y.writeMemory(I, g * 1024);
    }
    const k = new Uint8Array(1024);
    Ue(k, y.calculate(new Uint8Array([]), s));
    const E = yield Ie(Q, k, r);
    if (e.outputType === "hex") {
      const h = new Uint8Array(r * 2);
      return ce(h, E, r);
    }
    return e.outputType === "encoded" ? kA(o, e, E) : E;
  });
}
const FA = (e) => {
  var A;
  if (!e || typeof e != "object")
    throw new Error("Invalid options parameter. It requires an object.");
  if (!e.password)
    throw new Error("Password must be specified");
  if (e.password = T(e.password), e.password.length < 1)
    throw new Error("Password must be specified");
  if (!e.salt)
    throw new Error("Salt must be specified");
  if (e.salt = T(e.salt), e.salt.length < 8)
    throw new Error("Salt should be at least 8 bytes long");
  if (e.secret = T((A = e.secret) !== null && A !== void 0 ? A : ""), !Number.isInteger(e.iterations) || e.iterations < 1)
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
function be(e) {
  return R(this, void 0, void 0, function* () {
    return FA(e), DA(Object.assign(Object.assign({}, e), { hashType: "id" }));
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
const UA = 32;
async function it(e, A, t = Xe) {
  mA(t);
  try {
    const i = await be({
      password: e,
      salt: A,
      iterations: t.tCost,
      memorySize: t.mCost,
      parallelism: t.pCost,
      hashLength: UA,
      outputType: "binary"
    });
    return Se(i);
  } catch {
    throw new Error("Key derivation failed");
  }
}
function mA(e) {
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
async function bA() {
  try {
    const e = await be({
      password: "test",
      salt: new Uint8Array(16),
      iterations: 1,
      memorySize: 1024,
      // 1 MiB for quick test
      parallelism: 1,
      hashLength: 32,
      outputType: "binary"
    });
    return e.length !== 32 ? !1 : (De(e), !0);
  } catch {
    return !1;
  }
}
function GA(e) {
  return e === "localhost" || e === "127.0.0.1" || e.endsWith(".localhost");
}
function KA(e) {
  if (typeof window > "u")
    return;
  const A = window.location.hostname;
  if (!GA(A))
    throw new Error(
      "[Cedros] WebAuthn RP domain validation is not configured. Set wallet.allowedRpDomains to a non-empty list of allowed domains."
    );
}
function he() {
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator.credentials < "u";
}
async function HA() {
  if (!he())
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
async function rt(e, A) {
  if (!he())
    throw new Error("WebAuthn is not available in this browser");
  KA();
  const t = oA(e), i = await navigator.credentials.get({
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
  const o = new Uint8Array(n);
  if (o.length !== 32)
    throw new Error(
      `Unexpected PRF output length: expected 32 bytes, got ${o.length}. The authenticator may not be compatible.`
    );
  return { prfOutput: o };
}
async function JA() {
  const [e, A, t, i, r, n, o] = await Promise.all([
    MA(),
    VA(),
    IA(),
    PA(),
    Promise.resolve(he()),
    HA(),
    bA()
  ]);
  return {
    webCrypto: e,
    aesGcm: A,
    hkdf: t,
    ed25519: i,
    webAuthn: r,
    webAuthnPrf: n,
    argon2: o,
    allSupported: e && A && t && r && n && o
  };
}
async function MA() {
  try {
    return typeof crypto < "u" && typeof crypto.subtle < "u" && typeof crypto.getRandomValues == "function";
  } catch {
    return !1;
  }
}
async function VA() {
  try {
    const e = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, !1, [
      "encrypt",
      "decrypt"
    ]), A = new Uint8Array([1, 2, 3, 4]), t = crypto.getRandomValues(new Uint8Array(12)), i = await crypto.subtle.encrypt({ name: "AES-GCM", iv: t }, e, A), r = await crypto.subtle.decrypt({ name: "AES-GCM", iv: t }, e, i), n = new Uint8Array(r);
    return n.length === A.length && n.every((o, a) => o === A[a]);
  } catch {
    return !1;
  }
}
async function PA() {
  try {
    return await crypto.subtle.generateKey("Ed25519", !1, ["sign", "verify"]), !0;
  } catch {
    return !1;
  }
}
function nt(e) {
  if (e.allSupported)
    return null;
  const A = [];
  return e.webCrypto || A.push("Web Crypto API"), e.aesGcm || A.push("AES-GCM encryption"), e.hkdf || A.push("HKDF key derivation"), e.webAuthn || A.push("WebAuthn/Passkeys"), e.webAuthnPrf || A.push("WebAuthn PRF extension (requires platform authenticator)"), e.argon2 || A.push("Argon2 password hashing"), A.length === 0 ? null : `Your browser or device is missing required features: ${A.join(", ")}. Please use a modern browser with a platform authenticator (e.g., Touch ID, Face ID, Windows Hello).`;
}
function ot() {
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
let z = null, ae = null;
const NA = 6e4;
async function YA(e = !1) {
  const A = Date.now(), t = ae === null || A - ae > NA;
  return !e && !(typeof window > "u") && !t && z !== null || (z = await JA(), ae = Date.now()), z;
}
function OA(e) {
  switch (e.type) {
    case "password":
      return { password: e.password };
    case "prfOutput":
      return { prfOutput: e.prfOutput };
  }
}
function xA() {
  const e = ye(), [A, t] = F(!1), [i, r] = F(null), n = e?.config.serverUrl, o = e?.config.requestTimeout, a = e?.config.retryAttempts, C = e?._internal?.getAccessToken, s = Y(() => e ? new pe({
    baseUrl: n,
    timeoutMs: o,
    retryAttempts: a,
    getAccessToken: C
  }) : null, [e, n, o, a, C]), p = d(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      return await s.get("/wallet/status");
    } catch (I) {
      const l = P(I, "Failed to fetch wallet status");
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [s]), y = d(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      return await s.get("/wallet/material");
    } catch (I) {
      const l = P(I, "Failed to fetch wallet material");
      if (l.code === "NOT_FOUND")
        return null;
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [s]), Q = d(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await s.post("/wallet/enroll", I);
      } catch (l) {
        const w = P(l, "Failed to enroll wallet");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [s]
  ), m = d(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await s.post("/wallet/recover", I);
      } catch (l) {
        const w = P(l, "Failed to recover wallet");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [s]
  ), U = d(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await s.post("/wallet/sign", I);
      } catch (l) {
        const w = P(l, "Failed to sign transaction");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [s]
  ), c = d(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await s.post("/wallet/rotate-user-secret", I);
      } catch (l) {
        const w = P(l, "Failed to rotate user secret");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [s]
  ), B = d(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await s.post(
          "/wallet/unlock",
          OA(I)
        );
      } catch (l) {
        const w = P(l, "Failed to unlock wallet");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [s]
  ), u = d(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      await s.post("/wallet/lock", {});
    } catch (I) {
      const l = P(I, "Failed to lock wallet");
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [s]), b = d(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await s.post("/wallet/share-b", I);
      } catch (l) {
        const w = P(l, "Failed to get Share B for recovery");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [s]
  ), k = d(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await s.post("/wallet/derived", I);
      } catch (l) {
        const w = P(l, "Failed to create derived wallet");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [s]
  ), E = d(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      return await s.get("/wallet/derived");
    } catch (I) {
      const l = P(I, "Failed to list wallets");
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [s]), h = d(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await s.delete(`/wallet/derived/${I}`);
      } catch (l) {
        const w = P(l, "Failed to delete derived wallet");
        throw r(w.message), w;
      } finally {
        t(!1);
      }
    },
    [s]
  ), g = d(() => r(null), []);
  return {
    getStatus: p,
    getMaterial: y,
    enroll: Q,
    recover: m,
    signTransaction: U,
    rotateUserSecret: c,
    unlock: B,
    lock: u,
    getShareBForRecovery: b,
    createDerivedWallet: k,
    listAllWallets: E,
    deleteDerivedWallet: h,
    isLoading: A,
    error: i,
    clearError: g
  };
}
const vA = {
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
function TA() {
  const A = ye() !== null, [t, i] = F("loading"), [r, n] = F(null), [o, a] = F(null), [C, s] = F(!1), [p, y] = F(!1), [Q, m] = F(null), [U, c] = F(null), { getStatus: B, isLoading: u } = xA(), b = N(!1);
  x(() => {
    if (!A) return;
    let h = !1;
    return (async () => {
      try {
        const I = await YA();
        if (h) return;
        m(I), I.allSupported || (i("error"), c(
          "Your browser or device does not support all required features. Please use a modern browser with a platform authenticator."
        ));
      } catch {
        if (h) return;
        m(null), i("error"), c("Failed to check crypto capabilities");
      }
    })(), () => {
      h = !0;
    };
  }, [A]);
  const k = d(async () => {
    if (!(!A || !Q?.allSupported)) {
      i("loading"), c(null);
      try {
        const h = await B();
        n(h.solanaPubkey ?? null), a(h.authMethod ?? null), s(h.hasExternalWallet), y(h.unlocked), h.hasExternalWallet ? i("enrolled_unlocked") : h.enrolled ? i(h.unlocked ? "enrolled_unlocked" : "enrolled_locked") : i("not_enrolled");
      } catch (h) {
        i("error"), c(h instanceof Error ? h.message : "Failed to fetch wallet status");
      }
    }
  }, [A, Q?.allSupported, B]);
  x(() => {
    A && Q?.allSupported && !u && !b.current && (b.current = !0, k());
  }, [A, Q?.allSupported, u, k]);
  const E = d(() => c(null), []);
  return A ? {
    status: t,
    solanaPubkey: r,
    authMethod: o,
    hasExternalWallet: C,
    isUnlocked: p,
    capabilities: Q,
    isSupported: Q?.allSupported ?? !1,
    error: U,
    refresh: k,
    clearError: E
  } : vA;
}
const Ae = "__CEDROS_EMBEDDED_WALLET__";
function RA(e) {
  typeof window < "u" && (window[Ae] = e);
}
function ge() {
  typeof window < "u" && delete window[Ae];
}
function st() {
  return typeof window > "u" ? !1 : window[Ae]?.available ?? !1;
}
function It() {
  return typeof window > "u" ? null : window[Ae] ?? null;
}
function LA() {
  const { config: e, user: A } = ke(), { status: t, solanaPubkey: i, hasExternalWallet: r } = TA(), n = e.wallet?.exposeAvailability ?? !1, o = e.wallet?.exposePublicKey ?? !1;
  return x(() => {
    if (!n || !A) {
      ge();
      return;
    }
    if (r) {
      ge();
      return;
    }
    if (t === "loading")
      return;
    const a = t === "enrolled_locked" || t === "enrolled_unlocked";
    return RA({
      available: a,
      publicKey: o && a ? i : null
    }), () => {
      ge();
    };
  }, [n, o, A, t, i, r]), null;
}
function at({ config: e, children: A }) {
  const [t, i] = F(null), [r, n] = F(!1), o = N(e.callbacks);
  o.current = e.callbacks;
  const a = N({
    onLoginSuccess: (...M) => o.current?.onLoginSuccess?.(...M),
    onLoginError: (...M) => o.current?.onLoginError?.(...M),
    onLogout: () => o.current?.onLogout?.(),
    onSessionExpired: () => o.current?.onSessionExpired?.()
  }), C = N(null);
  x(() => {
    if (typeof window > "u") return;
    const M = new URLSearchParams(window.location.search), L = M.get("ref") || M.get("referral");
    L && (C.current = L);
  }, []);
  const s = e.features === "auto", {
    features: p,
    googleClientId: y,
    appleClientId: Q,
    socialButtonOrder: m,
    isLoading: U
  } = Ne(
    e.serverUrl,
    s,
    e.requestTimeout
  ), c = Y(() => !s || !p ? e : {
    ...e,
    features: p,
    googleClientId: e.googleClientId ?? y,
    appleClientId: e.appleClientId ?? Q
  }, [e, s, p, y, Q]), B = Y(
    () => JSON.stringify(c.themeOverrides ?? null),
    [c.themeOverrides]
  ), u = Y(() => JSON.stringify(c.session ?? null), [c.session]), b = Y(() => JSON.stringify(c.features ?? null), [c.features]), k = Y(() => JSON.stringify(c.forms ?? null), [c.forms]), E = Y(
    () => c,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Using serialized keys for deep comparison; callbacks excluded (see UI-06)
    [
      c.serverUrl,
      c.googleClientId,
      c.appleClientId,
      c.requestTimeout,
      c.retryAttempts,
      c.theme,
      B,
      u,
      b,
      k
    ]
  );
  Ve({
    theme: E.theme,
    themeOverrides: E.themeOverrides
  });
  const {
    user: h,
    authState: g,
    handleLoginSuccess: I,
    logout: l,
    refreshUser: w,
    getAccessToken: f
  } = Le({
    serverUrl: E.serverUrl,
    session: E.session,
    callbacks: a.current,
    requestTimeoutMs: E.requestTimeout
  }), S = d(async () => {
    i(null), await l();
  }, [l]), G = d(
    (...M) => {
      i(null), I(...M);
    },
    [I]
  ), H = d(() => n(!0), []), K = d(() => n(!1), []), J = Y(
    () => ({
      config: E,
      user: h,
      authState: g,
      logout: S,
      refreshUser: w,
      socialButtonOrder: s ? m : void 0,
      _internal: {
        handleLoginSuccess: G,
        getAccessToken: f,
        getReferralCode: () => C.current
      }
    }),
    [E, h, g, S, w, s, m, G, f]
  ), V = Y(
    () => ({
      error: t,
      isModalOpen: r,
      openModal: H,
      closeModal: K
    }),
    [t, r, H, K]
  ), fe = Y(
    () => ({ ...J, ...V }),
    [J, V]
  );
  return s && U ? null : /* @__PURE__ */ ie(He.Provider, { value: J, children: /* @__PURE__ */ ie(Je.Provider, { value: V, children: /* @__PURE__ */ Ke(Me.Provider, { value: fe, children: [
    /* @__PURE__ */ ie(LA, {}),
    A
  ] }) }) });
}
function gt() {
  const { user: e, authState: A, error: t, logout: i, refreshUser: r, openModal: n, closeModal: o } = ke();
  return {
    user: e,
    authState: A,
    error: t,
    isAuthenticated: A === "authenticated" && e !== null,
    isLoading: A === "loading",
    logout: i,
    refreshUser: r,
    openLoginModal: n,
    closeLoginModal: o
  };
}
export {
  at as C,
  Xe as D,
  it as a,
  ze as b,
  et as c,
  ot as d,
  xA as e,
  _A as f,
  nt as g,
  At as h,
  Se as i,
  ue as j,
  $A as k,
  zA as l,
  rt as m,
  tt as n,
  OA as o,
  oA as p,
  TA as q,
  It as r,
  st as s,
  qA as t,
  gt as u,
  mA as v,
  De as w
};
