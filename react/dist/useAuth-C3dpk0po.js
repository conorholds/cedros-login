import { jsx as ne, jsxs as Ke } from "react/jsx-runtime";
import { useEffect as N, useState as G, useRef as P, useCallback as d, useMemo as V } from "react";
import { A as He, a as Je, C as Ve } from "./LoadingSpinner-6vml-zwr.js";
import { A as Ee, g as oe, a as pe, h as Y, u as ye } from "./useCedrosLogin-_94MmGGq.js";
let Z = 0;
function Me({ theme: e, themeOverrides: A }) {
  N(() => {
    if (typeof document > "u" || typeof window > "u")
      return;
    const t = document.documentElement;
    let i = !1;
    e === "dark" ? i = !0 : e === "light" ? i = !1 : i = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let r = !1;
    i ? (Z++, r = !0, t.classList.add("cedros-dark")) : Z === 0 && t.classList.remove("cedros-dark");
    const n = /* @__PURE__ */ new Map();
    return A && Object.entries(A).forEach(([o, a]) => {
      if (a) {
        const l = t.style.getPropertyValue(o);
        n.set(o, l), t.style.setProperty(o, a);
      }
    }), () => {
      r && (Z--, Z === 0 && t.classList.remove("cedros-dark")), n.forEach((o, a) => {
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
  const [i, r] = G(null), [n, o] = G(A), a = P(!1);
  return N(() => {
    if (!A || a.current) return;
    a.current = !0, new Ee({
      baseUrl: e,
      timeoutMs: t ?? 5e3,
      retryAttempts: 1
    }).get("/features", { credentials: "omit" }).then((s) => {
      r({
        email: s.email,
        google: s.google,
        apple: s.apple,
        solana: s.solana,
        webauthn: s.webauthn,
        instantLink: s.instantLink
      });
    }).catch(() => {
      r(Pe);
    }).finally(() => {
      o(!1);
    });
  }, [A, e, t]), { features: i, isLoading: n };
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
    const A = this.getTimeUntilExpiry(), t = Math.max(0, A - xe);
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
function q(e) {
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
  const [r, n] = G(null), [o, a] = G("idle"), l = P(null), s = P(null), k = P(t), w = P(!0), B = P(null), b = P(() => Promise.resolve()), F = P(() => {
  });
  N(() => {
    k.current = t;
  }, [t]), N(() => (w.current = !0, () => {
    w.current = !1;
  }), []);
  const Q = d((c) => {
    w.current && n(c);
  }, []), f = d((c) => {
    w.current && a(c);
  }, []), u = V(
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
  N(() => {
    const c = new Oe(u.storage, u.persistKey, {
      allowWebStorage: u.allowWebStorage
    });
    return l.current = c, u.autoRefresh && c.setRefreshCallback(() => b.current()), c.setSessionExpiredCallback(() => F.current()), u.syncTabs && (s.current = new Te()), () => {
      c.destroy(), l.current = null, s.current?.close();
    };
  }, [
    u.storage,
    u.syncTabs,
    u.persistKey,
    u.allowWebStorage,
    u.autoRefresh
  ]);
  const m = d(async () => {
    if (B.current)
      return B.current;
    const c = l.current?.getRefreshToken(), E = !!c, U = oe(), K = {};
    E && (K["Content-Type"] = "application/json"), U && (K["X-CSRF-Token"] = U);
    let D, J;
    const v = new Promise((j, ie) => {
      D = j, J = ie;
    });
    B.current = v, (async () => {
      const j = new AbortController(), ie = i ?? 1e4, Ge = window.setTimeout(() => j.abort(), ie);
      try {
        const L = await fetch(`${e}/refresh`, {
          method: "POST",
          headers: Object.keys(K).length > 0 ? K : void 0,
          credentials: "include",
          body: E ? JSON.stringify({ refreshToken: c }) : void 0,
          signal: j.signal
        });
        if (!L.ok)
          throw new Error("Token refresh failed");
        const re = await L.json();
        if (re.tokens) {
          if (!Re(re.tokens))
            throw new Error("Invalid token response structure");
          l.current?.setTokens(re.tokens);
        } else if (u.storage !== "cookie")
          throw new Error("Token refresh failed");
        s.current?.broadcastRefresh(), D();
      } catch (L) {
        throw J(L), L;
      } finally {
        window.clearTimeout(Ge);
      }
    })().catch(() => {
    });
    try {
      await v;
    } finally {
      B.current = null;
    }
  }, [e, u.storage, i]), p = d(() => {
    if (u.storage === "cookie") return;
    const c = l.current?.getAccessToken();
    if (c)
      return { Authorization: `Bearer ${c}` };
  }, [u.storage]), h = d(() => {
    l.current?.clear(), Q(null), f("unauthenticated"), k.current?.onSessionExpired?.();
  }, [f, Q]);
  b.current = m, F.current = h;
  const g = d(
    (c) => {
      const E = new AbortController(), U = i ?? 1e4, K = window.setTimeout(() => E.abort(), U), D = {}, J = p();
      J && Object.assign(D, J);
      const v = oe();
      return v && (D["X-CSRF-Token"] = v), {
        promise: fetch(c, {
          credentials: "include",
          headers: Object.keys(D).length > 0 ? D : void 0,
          signal: E.signal
        }),
        cleanup: () => window.clearTimeout(K)
      };
    },
    [p, i]
  ), I = d(async () => {
    const c = g(`${e}/user`);
    try {
      const E = await c.promise;
      if (E.ok) {
        const U = await E.json();
        if (q(U)) {
          Q(U.user), f("authenticated");
          return;
        }
      }
      if (E.status === 401 && u.autoRefresh) {
        try {
          await m();
        } catch {
          h();
          return;
        }
        const U = g(`${e}/user`);
        try {
          const K = await U.promise;
          if (K.ok) {
            const D = await K.json();
            if (q(D)) {
              Q(D.user), f("authenticated");
              return;
            }
          }
        } finally {
          U.cleanup();
        }
      }
      Q(null), f("unauthenticated");
    } catch {
      Q(null), f("unauthenticated");
    } finally {
      c.cleanup();
    }
  }, [
    e,
    u.autoRefresh,
    m,
    g,
    h,
    f,
    Q
  ]);
  N(() => {
    !s.current || !u.syncTabs || s.current.setCallback((c) => {
      switch (c.type) {
        case "login":
          Q(c.user), f("authenticated");
          break;
        case "logout":
          Q(null), f("unauthenticated"), l.current?.clear();
          break;
        case "refresh":
          I();
          break;
        default:
          console.warn("[Cedros Login] Unhandled tab sync event:", c);
      }
    });
  }, [u.syncTabs, I, f, Q]), N(() => {
    const c = new AbortController(), E = i ?? 1e4, U = window.setTimeout(() => c.abort(), E);
    return (async () => {
      f("loading");
      try {
        const D = await fetch(`${e}/user`, {
          credentials: "include",
          headers: p(),
          signal: c.signal
        });
        if (D.ok) {
          const J = await D.json();
          if (q(J)) {
            Q(J.user), f("authenticated");
            return;
          }
        }
        if (D.status === 401 && u.autoRefresh) {
          try {
            await m();
          } catch {
            h();
            return;
          }
          const J = await fetch(`${e}/user`, {
            credentials: "include",
            headers: p(),
            signal: c.signal
          });
          if (J.ok) {
            const v = await J.json();
            if (q(v)) {
              Q(v.user), f("authenticated");
              return;
            }
          }
        }
        Q(null), f("unauthenticated");
      } catch {
        Q(null), f("unauthenticated");
      }
    })(), () => {
      window.clearTimeout(U), c.abort();
    };
  }, [
    e,
    u.autoRefresh,
    m,
    p,
    h,
    f,
    Q,
    i
  ]);
  const C = d(
    (c, E) => {
      Q(c), f("authenticated"), E && l.current?.setTokens(E), w.current && s.current?.broadcastLogin(c);
    },
    [Q, f]
  ), S = d(async () => {
    const c = oe(), E = new AbortController(), U = i ?? 1e4, K = window.setTimeout(() => E.abort(), U);
    try {
      await fetch(`${e}/logout`, {
        method: "POST",
        headers: {
          ...c ? { "X-CSRF-Token": c } : {},
          ...p() ?? {}
        },
        credentials: "include",
        signal: E.signal
      });
    } catch {
    } finally {
      window.clearTimeout(K), Q(null), f("unauthenticated"), l.current?.clear(), s.current?.broadcastLogout(), k.current?.onLogout?.();
    }
  }, [e, p, Q, f, i]), H = d(() => l.current?.getAccessToken() ?? null, []);
  return {
    user: r,
    authState: o,
    handleLoginSuccess: C,
    logout: S,
    refreshUser: I,
    getAccessToken: H
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
function _A(e) {
  if (!je(e))
    throw new Error(`Invalid share length: expected >=16, got ${e.length}`);
  return e;
}
function ke(e) {
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
function T(e) {
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
function $A() {
  return ze(ee(16));
}
function iA() {
  return eA(ee(12));
}
function zA() {
  return AA(ee(16));
}
function rA() {
  return tA(ee(32));
}
function Se(e) {
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
    A && Se(A);
}
async function nA(e) {
  return crypto.subtle.importKey(
    "raw",
    T(e),
    { name: "AES-GCM", length: 256 },
    !1,
    // not extractable
    ["encrypt", "decrypt"]
  );
}
async function oA(e, A, t) {
  const i = t ?? iA(), r = await nA(A), n = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: T(i) },
    r,
    T(e)
  );
  return {
    ciphertext: new Uint8Array(n),
    nonce: i
  };
}
async function At(e, A) {
  const t = await oA(e, A);
  return {
    ciphertext: z(t.ciphertext),
    nonce: z(t.nonce)
  };
}
function z(e) {
  const t = [];
  for (let i = 0; i < e.length; i += 32768) {
    const r = e.subarray(i, Math.min(i + 32768, e.length));
    t.push(String.fromCharCode(...r));
  }
  return btoa(t.join(""));
}
function sA(e) {
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
async function IA(e, A, t, i = 32) {
  const r = await crypto.subtle.importKey(
    "raw",
    T(e),
    "HKDF",
    !1,
    ["deriveBits"]
  ), n = new TextEncoder().encode(t), o = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: T(A ?? new Uint8Array(32)),
      // Zero salt if not provided
      info: T(n)
    },
    r,
    i * 8
    // bits
  );
  return new Uint8Array(o);
}
async function tt(e, A) {
  const t = await IA(e, A, "cedros-wallet-share-b-encryption", 32);
  return ke(t);
}
async function aA() {
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
    function a(k) {
      try {
        s(i.next(k));
      } catch (w) {
        o(w);
      }
    }
    function l(k) {
      try {
        s(i.throw(k));
      } catch (w) {
        o(w);
      }
    }
    function s(k) {
      k.done ? n(k.value) : r(k.value).then(a, l);
    }
    s((i = i.apply(e, [])).next());
  });
}
class y {
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
var se;
function gA() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global;
}
const Ce = gA(), Ie = (se = Ce.Buffer) !== null && se !== void 0 ? se : null, lA = Ce.TextEncoder ? new Ce.TextEncoder() : null;
function De(e, A) {
  return (e & 15) + (e >> 6 | e >> 3 & 8) << 4 | (A & 15) + (A >> 6 | A >> 3 & 8);
}
function Fe(e, A) {
  const t = A.length >> 1;
  for (let i = 0; i < t; i++) {
    const r = i << 1;
    e[i] = De(A.charCodeAt(r), A.charCodeAt(r + 1));
  }
}
function cA(e, A) {
  if (e.length !== A.length * 2)
    return !1;
  for (let t = 0; t < A.length; t++) {
    const i = t << 1;
    if (A[t] !== De(e.charCodeAt(i), e.charCodeAt(i + 1)))
      return !1;
  }
  return !0;
}
const ue = 87, we = 48;
function he(e, A, t) {
  let i = 0;
  for (let r = 0; r < t; r++) {
    let n = A[r] >>> 4;
    e[i++] = n > 9 ? n + ue : n + we, n = A[r] & 15, e[i++] = n > 9 ? n + ue : n + we;
  }
  return String.fromCharCode.apply(null, e);
}
const O = Ie !== null ? (e) => {
  if (typeof e == "string") {
    const A = Ie.from(e, "utf8");
    return new Uint8Array(A.buffer, A.byteOffset, A.length);
  }
  if (Ie.isBuffer(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.length);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
} : (e) => {
  if (typeof e == "string")
    return lA.encode(e);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
}, M = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", W = new Uint8Array(256);
for (let e = 0; e < M.length; e++)
  W[M.charCodeAt(e)] = e;
function Qe(e, A = !0) {
  const t = e.length, i = t % 3, r = [], n = t - i;
  for (let o = 0; o < n; o += 3) {
    const a = (e[o] << 16 & 16711680) + (e[o + 1] << 8 & 65280) + (e[o + 2] & 255), l = M.charAt(a >> 18 & 63) + M.charAt(a >> 12 & 63) + M.charAt(a >> 6 & 63) + M.charAt(a & 63);
    r.push(l);
  }
  if (i === 1) {
    const o = e[t - 1], a = M.charAt(o >> 2), l = M.charAt(o << 4 & 63);
    r.push(`${a}${l}`), A && r.push("==");
  } else if (i === 2) {
    const o = (e[t - 2] << 8) + e[t - 1], a = M.charAt(o >> 10), l = M.charAt(o >> 4 & 63), s = M.charAt(o << 2 & 63);
    r.push(`${a}${l}${s}`), A && r.push("=");
  }
  return r.join("");
}
function CA(e) {
  let A = Math.floor(e.length * 0.75);
  const t = e.length;
  return e[t - 1] === "=" && (A -= 1, e[t - 2] === "=" && (A -= 1)), A;
}
function hA(e) {
  const A = CA(e), t = e.length, i = new Uint8Array(A);
  let r = 0;
  for (let n = 0; n < t; n += 4) {
    const o = W[e.charCodeAt(n)], a = W[e.charCodeAt(n + 1)], l = W[e.charCodeAt(n + 2)], s = W[e.charCodeAt(n + 3)];
    i[r] = o << 2 | a >> 4, r += 1, i[r] = (a & 15) << 4 | l >> 2, r += 1, i[r] = (l & 3) << 6 | s & 63, r += 1;
  }
  return i;
}
const _ = 16 * 1024, X = 4, fA = new y(), ae = /* @__PURE__ */ new Map();
function Ue(e, A) {
  return R(this, void 0, void 0, function* () {
    let t = null, i = null, r = !1;
    if (typeof WebAssembly > "u")
      throw new Error("WebAssembly is not supported in this environment!");
    const n = (I, C = 0) => {
      i.set(I, C);
    }, o = () => i, a = () => t.exports, l = (I) => {
      t.exports.Hash_SetMemorySize(I);
      const C = t.exports.Hash_GetBuffer(), S = t.exports.memory.buffer;
      i = new Uint8Array(S, C, I);
    }, s = () => new DataView(t.exports.memory.buffer).getUint32(t.exports.STATE_SIZE, !0), k = fA.dispatch(() => R(this, void 0, void 0, function* () {
      if (!ae.has(e.name)) {
        const C = hA(e.data), S = WebAssembly.compile(C);
        ae.set(e.name, S);
      }
      const I = yield ae.get(e.name);
      t = yield WebAssembly.instantiate(I, {
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
    })), w = () => R(this, void 0, void 0, function* () {
      t || (yield k);
      const I = t.exports.Hash_GetBuffer(), C = t.exports.memory.buffer;
      i = new Uint8Array(C, I, _);
    }), B = (I = null) => {
      r = !0, t.exports.Hash_Init(I);
    }, b = (I) => {
      let C = 0;
      for (; C < I.length; ) {
        const S = I.subarray(C, C + _);
        C += S.length, i.set(S), t.exports.Hash_Update(S.length);
      }
    }, F = (I) => {
      if (!r)
        throw new Error("update() called before init()");
      const C = O(I);
      b(C);
    }, Q = new Uint8Array(A * 2), f = (I, C = null) => {
      if (!r)
        throw new Error("digest() called before init()");
      return r = !1, t.exports.Hash_Final(C), I === "binary" ? i.slice(0, A) : he(Q, i, A);
    }, u = () => {
      if (!r)
        throw new Error("save() can only be called after init() and before digest()");
      const I = t.exports.Hash_GetState(), C = s(), S = t.exports.memory.buffer, H = new Uint8Array(S, I, C), c = new Uint8Array(X + C);
      return Fe(c, e.hash), c.set(H, X), c;
    }, m = (I) => {
      if (!(I instanceof Uint8Array))
        throw new Error("load() expects an Uint8Array generated by save()");
      const C = t.exports.Hash_GetState(), S = s(), H = X + S, c = t.exports.memory.buffer;
      if (I.length !== H)
        throw new Error(`Bad state length (expected ${H} bytes, got ${I.length})`);
      if (!cA(e.hash, I.subarray(0, X)))
        throw new Error("This state was written by an incompatible hash implementation");
      const E = I.subarray(X);
      new Uint8Array(c, C, S).set(E), r = !0;
    }, p = (I) => typeof I == "string" ? I.length < _ / 4 : I.byteLength < _;
    let h = p;
    switch (e.name) {
      case "argon2":
      case "scrypt":
        h = () => !0;
        break;
      case "blake2b":
      case "blake2s":
        h = (I, C) => C <= 512 && p(I);
        break;
      case "blake3":
        h = (I, C) => C === 0 && p(I);
        break;
      case "xxhash64":
      // cannot simplify
      case "xxhash3":
      case "xxhash128":
      case "crc64":
        h = () => !1;
        break;
    }
    const g = (I, C = null, S = null) => {
      if (!h(I, C))
        return B(C), F(I), f("hex", S);
      const H = O(I);
      return i.set(H), t.exports.Hash_Calculate(H.length, C, S), he(Q, i, A);
    };
    return yield w(), {
      getMemory: o,
      writeMemory: n,
      getExports: a,
      setMemorySize: l,
      init: B,
      update: F,
      digest: f,
      save: u,
      load: m,
      calculate: g,
      hashLength: A
    };
  });
}
new y();
var uA = "argon2", wA = "AGFzbQEAAAABKQVgAX8Bf2AAAX9gEH9/f39/f39/f39/f39/f38AYAR/f39/AGACf38AAwYFAAECAwQFBgEBAoCAAgYIAX8BQZCoBAsHQQQGbWVtb3J5AgASSGFzaF9TZXRNZW1vcnlTaXplAAAOSGFzaF9HZXRCdWZmZXIAAQ5IYXNoX0NhbGN1bGF0ZQAECvEyBVgBAn9BACEBAkAgAEEAKAKICCICRg0AAkAgACACayIAQRB2IABBgIB8cSAASWoiAEAAQX9HDQBB/wHADwtBACEBQQBBACkDiAggAEEQdK18NwOICAsgAcALcAECfwJAQQAoAoAIIgANAEEAPwBBEHQiADYCgAhBACgCiAgiAUGAgCBGDQACQEGAgCAgAWsiAEEQdiAAQYCAfHEgAElqIgBAAEF/Rw0AQQAPC0EAQQApA4gIIABBEHStfDcDiAhBACgCgAghAAsgAAvcDgECfiAAIAQpAwAiECAAKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAMIBAgDCkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgBCAQIAQpAwCFQiiJIhA3AwAgACAQIAApAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAwgECAMKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAEIBAgBCkDAIVCAYk3AwAgASAFKQMAIhAgASkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDSAQIA0pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAEgECABKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACANIBAgDSkDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAIgBikDACIQIAIpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIA4gECAOKQMAhUIgiSIQNwMAIAogECAKKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACACIBAgAikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDiAQIA4pAwCFQjCJIhA3AwAgCiAQIAopAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACADIAcpAwAiECADKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAPIBAgDykDAIVCIIkiEDcDACALIBAgCykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAyAQIAMpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA8gECAPKQMAhUIwiSIQNwMAIAsgECALKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgACAFKQMAIhAgACkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDyAQIA8pAwCFQiCJIhA3AwAgCiAQIAopAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAAgECAAKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAPIBAgDykDAIVCMIkiEDcDACAKIBAgCikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAEgBikDACIQIAEpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAwgECAMKQMAhUIgiSIQNwMAIAsgECALKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACABIBAgASkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDCAQIAwpAwCFQjCJIhA3AwAgCyAQIAspAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACACIAcpAwAiECACKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACANIBAgDSkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAiAQIAIpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA0gECANKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgAyAEKQMAIhAgAykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDiAQIA4pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAQgECAEKQMAhUIoiSIQNwMAIAMgECADKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAOIBAgDikDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBCAQIAQpAwCFQgGJNwMAC98aAQN/QQAhBEEAIAIpAwAgASkDAIU3A5AIQQAgAikDCCABKQMIhTcDmAhBACACKQMQIAEpAxCFNwOgCEEAIAIpAxggASkDGIU3A6gIQQAgAikDICABKQMghTcDsAhBACACKQMoIAEpAyiFNwO4CEEAIAIpAzAgASkDMIU3A8AIQQAgAikDOCABKQM4hTcDyAhBACACKQNAIAEpA0CFNwPQCEEAIAIpA0ggASkDSIU3A9gIQQAgAikDUCABKQNQhTcD4AhBACACKQNYIAEpA1iFNwPoCEEAIAIpA2AgASkDYIU3A/AIQQAgAikDaCABKQNohTcD+AhBACACKQNwIAEpA3CFNwOACUEAIAIpA3ggASkDeIU3A4gJQQAgAikDgAEgASkDgAGFNwOQCUEAIAIpA4gBIAEpA4gBhTcDmAlBACACKQOQASABKQOQAYU3A6AJQQAgAikDmAEgASkDmAGFNwOoCUEAIAIpA6ABIAEpA6ABhTcDsAlBACACKQOoASABKQOoAYU3A7gJQQAgAikDsAEgASkDsAGFNwPACUEAIAIpA7gBIAEpA7gBhTcDyAlBACACKQPAASABKQPAAYU3A9AJQQAgAikDyAEgASkD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", QA = "e4cdc523", BA = {
  name: uA,
  data: wA,
  hash: QA
}, dA = "blake2b", EA = "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", pA = "c6f286e6", yA = {
  name: dA,
  data: EA,
  hash: pA
};
new y();
function Be(e) {
  return !Number.isInteger(e) || e < 8 || e > 512 || e % 8 !== 0 ? new Error("Invalid variant! Valid values: 8, 16, ..., 512") : null;
}
function kA(e, A) {
  return e | A << 16;
}
function fe(e = 512, A = null) {
  if (Be(e))
    return Promise.reject(Be(e));
  let t = null, i = e;
  if (A !== null) {
    if (t = O(A), t.length > 64)
      return Promise.reject(new Error("Max key length is 64 bytes"));
    i = kA(e, t.length);
  }
  const r = e / 8;
  return Ue(yA, r).then((n) => {
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
function SA(e, A, t) {
  const i = [
    `m=${A.memorySize}`,
    `t=${A.iterations}`,
    `p=${A.parallelism}`
  ].join(",");
  return `$argon2${A.hashType}$v=19$${i}$${Qe(e, !1)}$${Qe(t, !1)}`;
}
const de = new DataView(new ArrayBuffer(4));
function x(e) {
  return de.setInt32(0, e, !0), new Uint8Array(de.buffer);
}
function ge(e, A, t) {
  return R(this, void 0, void 0, function* () {
    if (t <= 64) {
      const l = yield fe(t * 8);
      return l.update(x(t)), l.update(A), l.digest("binary");
    }
    const i = Math.ceil(t / 32) - 2, r = new Uint8Array(t);
    e.init(), e.update(x(t)), e.update(A);
    let n = e.digest("binary");
    r.set(n.subarray(0, 32), 0);
    for (let l = 1; l < i; l++)
      e.init(), e.update(n), n = e.digest("binary"), r.set(n.subarray(0, 32), l * 32);
    const o = t - 32 * i;
    let a;
    return o === 64 ? (a = e, a.init()) : a = yield fe(o * 8), a.update(n), n = a.digest("binary"), r.set(n.subarray(0, o), i * 32), r;
  });
}
function DA(e) {
  switch (e) {
    case "d":
      return 0;
    case "i":
      return 1;
    default:
      return 2;
  }
}
function FA(e) {
  return R(this, void 0, void 0, function* () {
    var A;
    const { parallelism: t, iterations: i, hashLength: r } = e, n = O(e.password), o = O(e.salt), a = 19, l = DA(e.hashType), { memorySize: s } = e, k = O((A = e.secret) !== null && A !== void 0 ? A : ""), [w, B] = yield Promise.all([
      Ue(BA, 1024),
      fe(512)
    ]);
    w.setMemorySize(s * 1024 + 1024);
    const b = new Uint8Array(24), F = new DataView(b.buffer);
    F.setInt32(0, t, !0), F.setInt32(4, r, !0), F.setInt32(8, s, !0), F.setInt32(12, i, !0), F.setInt32(16, a, !0), F.setInt32(20, l, !0), w.writeMemory(b, s * 1024), B.init(), B.update(b), B.update(x(n.length)), B.update(n), B.update(x(o.length)), B.update(o), B.update(x(k.length)), B.update(k), B.update(x(0));
    const f = Math.floor(s / (t * 4)) * 4, u = new Uint8Array(72), m = B.digest("binary");
    u.set(m);
    for (let g = 0; g < t; g++) {
      u.set(x(0), 64), u.set(x(g), 68);
      let I = g * f, C = yield ge(B, u, 1024);
      w.writeMemory(C, I * 1024), I += 1, u.set(x(1), 64), C = yield ge(B, u, 1024), w.writeMemory(C, I * 1024);
    }
    const p = new Uint8Array(1024);
    Fe(p, w.calculate(new Uint8Array([]), s));
    const h = yield ge(B, p, r);
    if (e.outputType === "hex") {
      const g = new Uint8Array(r * 2);
      return he(g, h, r);
    }
    return e.outputType === "encoded" ? SA(o, e, h) : h;
  });
}
const UA = (e) => {
  var A;
  if (!e || typeof e != "object")
    throw new Error("Invalid options parameter. It requires an object.");
  if (!e.password)
    throw new Error("Password must be specified");
  if (e.password = O(e.password), e.password.length < 1)
    throw new Error("Password must be specified");
  if (!e.salt)
    throw new Error("Salt must be specified");
  if (e.salt = O(e.salt), e.salt.length < 8)
    throw new Error("Salt should be at least 8 bytes long");
  if (e.secret = O((A = e.secret) !== null && A !== void 0 ? A : ""), !Number.isInteger(e.iterations) || e.iterations < 1)
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
    return UA(e), FA(Object.assign(Object.assign({}, e), { hashType: "id" }));
  });
}
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
new y();
const mA = 32;
async function it(e, A, t = Xe) {
  bA(t);
  try {
    const i = await me({
      password: e,
      salt: A,
      iterations: t.tCost,
      memorySize: t.mCost,
      parallelism: t.pCost,
      hashLength: mA,
      outputType: "binary"
    });
    return ke(i);
  } catch {
    throw new Error("Key derivation failed");
  }
}
function bA(e) {
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
async function GA() {
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
function KA(e) {
  return e === "localhost" || e === "127.0.0.1" || e.endsWith(".localhost");
}
function be(e) {
  if (typeof window > "u")
    return;
  const A = window.location.hostname;
  if (!KA(A))
    throw new Error(
      "[Cedros] WebAuthn RP domain validation is not configured. Set wallet.allowedRpDomains to a non-empty list of allowed domains."
    );
}
function Ae() {
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator.credentials < "u";
}
async function HA() {
  if (!Ae())
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
async function rt(e, A, t, i, r) {
  if (!Ae())
    throw new Error("WebAuthn is not available in this browser");
  be();
  const n = i ?? rA(), o = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        name: "Cedros Wallet",
        id: window.location.hostname
      },
      user: {
        id: T(e),
        name: A,
        displayName: t
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
  const l = a.prf?.results?.first;
  if (!l)
    throw new Error("PRF extension did not return a result");
  const s = new Uint8Array(l);
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
async function nt(e, A) {
  if (!Ae())
    throw new Error("WebAuthn is not available in this browser");
  be();
  const t = sA(e), i = await navigator.credentials.get({
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
    VA(),
    MA(),
    aA(),
    PA(),
    Promise.resolve(Ae()),
    HA(),
    GA()
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
async function VA() {
  try {
    return typeof crypto < "u" && typeof crypto.subtle < "u" && typeof crypto.getRandomValues == "function";
  } catch {
    return !1;
  }
}
async function MA() {
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
function ot(e) {
  if (e.allSupported)
    return null;
  const A = [];
  return e.webCrypto || A.push("Web Crypto API"), e.aesGcm || A.push("AES-GCM encryption"), e.hkdf || A.push("HKDF key derivation"), e.webAuthn || A.push("WebAuthn/Passkeys"), e.webAuthnPrf || A.push("WebAuthn PRF extension (requires platform authenticator)"), e.argon2 || A.push("Argon2 password hashing"), A.length === 0 ? null : `Your browser or device is missing required features: ${A.join(", ")}. Please use a modern browser with a platform authenticator (e.g., Touch ID, Face ID, Windows Hello).`;
}
function st() {
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
let $ = null, le = null;
const NA = 6e4;
async function YA(e = !1) {
  const A = Date.now(), t = le === null || A - le > NA;
  return !e && !(typeof window > "u") && !t && $ !== null || ($ = await JA(), le = Date.now()), $;
}
function xA(e) {
  switch (e.type) {
    case "password":
      return { password: e.password };
    case "prfOutput":
      return { prfOutput: e.prfOutput };
  }
}
function OA() {
  const e = pe(), [A, t] = G(!1), [i, r] = G(null), n = e?.config.serverUrl, o = e?.config.requestTimeout, a = e?.config.retryAttempts, l = e?._internal?.getAccessToken, s = V(() => e ? new Ee({
    baseUrl: n,
    timeoutMs: o,
    retryAttempts: a,
    getAccessToken: l
  }) : null, [e, n, o, a, l]), k = d(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      return await s.get("/wallet/status");
    } catch (h) {
      const g = Y(h, "Failed to fetch wallet status");
      throw r(g.message), g;
    } finally {
      t(!1);
    }
  }, [s]), w = d(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      return await s.get("/wallet/material");
    } catch (h) {
      const g = Y(h, "Failed to fetch wallet material");
      if (g.code === "NOT_FOUND")
        return null;
      throw r(g.message), g;
    } finally {
      t(!1);
    }
  }, [s]), B = d(
    async (h) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await s.post("/wallet/enroll", h);
      } catch (g) {
        const I = Y(g, "Failed to enroll wallet");
        throw r(I.message), I;
      } finally {
        t(!1);
      }
    },
    [s]
  ), b = d(
    async (h) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await s.post("/wallet/recover", h);
      } catch (g) {
        const I = Y(g, "Failed to recover wallet");
        throw r(I.message), I;
      } finally {
        t(!1);
      }
    },
    [s]
  ), F = d(
    async (h) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await s.post("/wallet/sign", h);
      } catch (g) {
        const I = Y(g, "Failed to sign transaction");
        throw r(I.message), I;
      } finally {
        t(!1);
      }
    },
    [s]
  ), Q = d(
    async (h) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await s.post("/wallet/rotate-user-secret", h);
      } catch (g) {
        const I = Y(g, "Failed to rotate user secret");
        throw r(I.message), I;
      } finally {
        t(!1);
      }
    },
    [s]
  ), f = d(
    async (h) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await s.post(
          "/wallet/unlock",
          xA(h)
        );
      } catch (g) {
        const I = Y(g, "Failed to unlock wallet");
        throw r(I.message), I;
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
    } catch (h) {
      const g = Y(h, "Failed to lock wallet");
      throw r(g.message), g;
    } finally {
      t(!1);
    }
  }, [s]), m = d(
    async (h) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await s.post("/wallet/share-b", h);
      } catch (g) {
        const I = Y(g, "Failed to get Share B for recovery");
        throw r(I.message), I;
      } finally {
        t(!1);
      }
    },
    [s]
  ), p = d(() => r(null), []);
  return {
    getStatus: k,
    getMaterial: w,
    enroll: B,
    recover: b,
    signTransaction: F,
    rotateUserSecret: Q,
    unlock: f,
    lock: u,
    getShareBForRecovery: m,
    isLoading: A,
    error: i,
    clearError: p
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
  const A = pe() !== null, [t, i] = G("loading"), [r, n] = G(null), [o, a] = G(null), [l, s] = G(!1), [k, w] = G(!1), [B, b] = G(null), [F, Q] = G(null), { getStatus: f, isLoading: u } = OA(), m = P(!1);
  N(() => {
    if (!A) return;
    let g = !1;
    return (async () => {
      try {
        const C = await YA();
        if (g) return;
        b(C), C.allSupported || (i("error"), Q(
          "Your browser or device does not support all required features. Please use a modern browser with a platform authenticator."
        ));
      } catch {
        if (g) return;
        b(null), i("error"), Q("Failed to check crypto capabilities");
      }
    })(), () => {
      g = !0;
    };
  }, [A]);
  const p = d(async () => {
    if (!(!A || !B?.allSupported)) {
      i("loading"), Q(null);
      try {
        const g = await f();
        n(g.solanaPubkey ?? null), a(g.authMethod ?? null), s(g.hasExternalWallet), w(g.unlocked), g.hasExternalWallet ? i("enrolled_unlocked") : g.enrolled ? i(g.unlocked ? "enrolled_unlocked" : "enrolled_locked") : i("not_enrolled");
      } catch (g) {
        i("error"), Q(g instanceof Error ? g.message : "Failed to fetch wallet status");
      }
    }
  }, [A, B?.allSupported, f]);
  N(() => {
    A && B?.allSupported && !u && !m.current && (m.current = !0, p());
  }, [A, B?.allSupported, u, p]);
  const h = d(() => Q(null), []);
  return A ? {
    status: t,
    solanaPubkey: r,
    authMethod: o,
    hasExternalWallet: l,
    isUnlocked: k,
    capabilities: B,
    isSupported: B?.allSupported ?? !1,
    error: F,
    refresh: p,
    clearError: h
  } : vA;
}
const te = "__CEDROS_EMBEDDED_WALLET__";
function RA(e) {
  typeof window < "u" && (window[te] = e);
}
function ce() {
  typeof window < "u" && delete window[te];
}
function It() {
  return typeof window > "u" ? !1 : window[te]?.available ?? !1;
}
function at() {
  return typeof window > "u" ? null : window[te] ?? null;
}
function LA() {
  const { config: e, user: A } = ye(), { status: t, solanaPubkey: i, hasExternalWallet: r } = TA(), n = e.wallet?.exposeAvailability ?? !1, o = e.wallet?.exposePublicKey ?? !1;
  return N(() => {
    if (!n || !A) {
      ce();
      return;
    }
    if (r) {
      ce();
      return;
    }
    if (t === "loading")
      return;
    const a = t === "enrolled_locked" || t === "enrolled_unlocked";
    return RA({
      available: a,
      publicKey: o && a ? i : null
    }), () => {
      ce();
    };
  }, [n, o, A, t, i, r]), null;
}
function gt({ config: e, children: A }) {
  const [t, i] = G(null), [r, n] = G(!1), o = P(e.callbacks);
  o.current = e.callbacks;
  const a = P({
    onLoginSuccess: (...D) => o.current?.onLoginSuccess?.(...D),
    onLoginError: (...D) => o.current?.onLoginError?.(...D),
    onLogout: () => o.current?.onLogout?.(),
    onSessionExpired: () => o.current?.onSessionExpired?.()
  }), l = e.features === "auto", { features: s, isLoading: k } = Ne(
    e.serverUrl,
    l,
    e.requestTimeout
  ), w = V(() => !l || !s ? e : { ...e, features: s }, [e, l, s]), B = V(
    () => JSON.stringify(w.themeOverrides ?? null),
    [w.themeOverrides]
  ), b = V(() => JSON.stringify(w.session ?? null), [w.session]), F = V(() => JSON.stringify(w.features ?? null), [w.features]), Q = V(() => JSON.stringify(w.forms ?? null), [w.forms]), f = V(
    () => w,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Using serialized keys for deep comparison; callbacks excluded (see UI-06)
    [
      w.serverUrl,
      w.googleClientId,
      w.requestTimeout,
      w.retryAttempts,
      w.theme,
      B,
      b,
      F,
      Q
    ]
  );
  Me({
    theme: f.theme,
    themeOverrides: f.themeOverrides
  });
  const {
    user: u,
    authState: m,
    handleLoginSuccess: p,
    logout: h,
    refreshUser: g,
    getAccessToken: I
  } = Le({
    serverUrl: f.serverUrl,
    session: f.session,
    callbacks: a.current,
    requestTimeoutMs: f.requestTimeout
  }), C = d(async () => {
    i(null), await h();
  }, [h]), S = d(
    (...D) => {
      i(null), p(...D);
    },
    [p]
  ), H = d(() => n(!0), []), c = d(() => n(!1), []), E = V(
    () => ({
      config: f,
      user: u,
      authState: m,
      logout: C,
      refreshUser: g,
      _internal: {
        handleLoginSuccess: S,
        getAccessToken: I
      }
    }),
    [f, u, m, C, g, S, I]
  ), U = V(
    () => ({
      error: t,
      isModalOpen: r,
      openModal: H,
      closeModal: c
    }),
    [t, r, H, c]
  ), K = V(
    () => ({ ...E, ...U }),
    [E, U]
  );
  return l && k ? null : /* @__PURE__ */ ne(He.Provider, { value: E, children: /* @__PURE__ */ ne(Je.Provider, { value: U, children: /* @__PURE__ */ Ke(Ve.Provider, { value: K, children: [
    /* @__PURE__ */ ne(LA, {}),
    A
  ] }) }) });
}
function lt() {
  const { user: e, authState: A, error: t, logout: i, refreshUser: r, openModal: n, closeModal: o } = ye();
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
  gt as C,
  Xe as D,
  zA as a,
  At as b,
  z as c,
  it as d,
  Se as e,
  _A as f,
  $A as g,
  ze as h,
  ot as i,
  st as j,
  OA as k,
  rA as l,
  nt as m,
  tt as n,
  xA as o,
  sA as p,
  TA as q,
  rt as r,
  It as s,
  ke as t,
  lt as u,
  bA as v,
  et as w,
  at as x
};
