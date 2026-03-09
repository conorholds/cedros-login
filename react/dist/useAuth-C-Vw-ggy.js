import { jsx as re, jsxs as Ke } from "react/jsx-runtime";
import { useEffect as O, useState as U, useRef as P, useCallback as p, useMemo as V } from "react";
import { A as He, a as Je, C as Me } from "./LoadingSpinner-6vml-zwr.js";
import { A as pe, g as ne, a as ye, h as M, u as ke } from "./useCedrosLogin-CFfID-0i.js";
let q = 0;
function Ve({ theme: e, themeOverrides: A }) {
  O(() => {
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
        const c = t.style.getPropertyValue(o);
        n.set(o, c), t.style.setProperty(o, a);
      }
    }), () => {
      r && (q--, q === 0 && t.classList.remove("cedros-dark")), n.forEach((o, a) => {
        o ? t.style.setProperty(a, o) : t.style.removeProperty(a);
      });
    };
  }, [e, A]);
}
const Ne = {
  email: !0,
  google: !0,
  apple: !0,
  solana: !0,
  webauthn: !0,
  instantLink: !0
};
function Pe(e, A, t) {
  const [i, r] = U(null), [n, o] = U(), [a, c] = U(), [s, k] = U(), [y, w] = U(), [G, B] = U(), [Q, d] = U(), [f, m] = U(A), E = P(!1);
  return O(() => {
    if (!A || E.current) return;
    E.current = !0, new pe({
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
      }), o(C.googleClientId), c(C.appleClientId), k(C.usernameEnabled), w(C.walletEnrollEnabled), B(C.showRecoveryEnabled), d(C.socialButtonOrder);
    }).catch(() => {
      r(Ne);
    }).finally(() => {
      m(!1);
    });
  }, [A, e, t]), { features: i, googleClientId: n, appleClientId: a, usernameEnabled: s, walletEnrollEnabled: y, showRecoveryEnabled: G, socialButtonOrder: Q, isLoading: f };
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
  const [r, n] = U(null), [o, a] = U("idle"), c = P(null), s = P(null), k = P(t), y = P(!0), w = P(null), G = P(() => Promise.resolve()), B = P(() => {
  });
  O(() => {
    k.current = t;
  }, [t]), O(() => (y.current = !0, () => {
    y.current = !1;
  }), []);
  const Q = p((h) => {
    y.current && n(h);
  }, []), d = p((h) => {
    y.current && a(h);
  }, []), f = V(
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
  O(() => {
    const h = new xe(f.storage, f.persistKey, {
      allowWebStorage: f.allowWebStorage
    });
    return c.current = h, f.autoRefresh && h.setRefreshCallback(() => G.current()), h.setSessionExpiredCallback(() => B.current()), f.syncTabs && (s.current = new Te()), () => {
      h.destroy(), c.current = null, s.current?.close();
    };
  }, [
    f.storage,
    f.syncTabs,
    f.persistKey,
    f.allowWebStorage,
    f.autoRefresh
  ]);
  const m = p(async () => {
    if (w.current)
      return w.current;
    const h = c.current?.getRefreshToken(), D = !!h, K = ne(), H = {};
    D && (H["Content-Type"] = "application/json"), K && (H["X-CSRF-Token"] = K);
    let b, J;
    const Y = new Promise((Z, te) => {
      b = Z, J = te;
    });
    w.current = Y, (async () => {
      const Z = new AbortController(), te = i ?? 1e4, Ge = window.setTimeout(() => Z.abort(), te);
      try {
        const X = await fetch(`${e}/refresh`, {
          method: "POST",
          headers: Object.keys(H).length > 0 ? H : void 0,
          credentials: "include",
          body: D ? JSON.stringify({ refreshToken: h }) : void 0,
          signal: Z.signal
        });
        if (!X.ok)
          throw new Error("Token refresh failed");
        const ie = await X.json();
        if (ie.tokens) {
          if (!Re(ie.tokens))
            throw new Error("Invalid token response structure");
          c.current?.setTokens(ie.tokens);
        } else if (f.storage !== "cookie")
          throw new Error("Token refresh failed");
        s.current?.broadcastRefresh(), b();
      } catch (X) {
        throw J(X), X;
      } finally {
        window.clearTimeout(Ge);
      }
    })().catch(() => {
    });
    try {
      await Y;
    } finally {
      w.current = null;
    }
  }, [e, f.storage, i]), E = p(() => {
    if (f.storage === "cookie") return;
    const h = c.current?.getAccessToken();
    if (h)
      return { Authorization: `Bearer ${h}` };
  }, [f.storage]), S = p(() => {
    c.current?.clear(), Q(null), d("unauthenticated"), k.current?.onSessionExpired?.();
  }, [d, Q]);
  G.current = m, B.current = S;
  const C = p(
    (h) => {
      const D = new AbortController(), K = i ?? 1e4, H = window.setTimeout(() => D.abort(), K), b = {}, J = E();
      J && Object.assign(b, J);
      const Y = ne();
      return Y && (b["X-CSRF-Token"] = Y), {
        promise: fetch(h, {
          credentials: "include",
          headers: Object.keys(b).length > 0 ? b : void 0,
          signal: D.signal
        }),
        cleanup: () => window.clearTimeout(H)
      };
    },
    [E, i]
  ), g = p(async () => {
    const h = C(`${e}/user`);
    try {
      const D = await h.promise;
      if (D.ok) {
        const K = await D.json();
        if (_(K)) {
          Q(K.user), d("authenticated");
          return;
        }
      }
      if (D.status === 401 && f.autoRefresh) {
        try {
          await m();
        } catch {
          S();
          return;
        }
        const K = C(`${e}/user`);
        try {
          const H = await K.promise;
          if (H.ok) {
            const b = await H.json();
            if (_(b)) {
              Q(b.user), d("authenticated");
              return;
            }
          }
        } finally {
          K.cleanup();
        }
      }
      Q(null), d("unauthenticated");
    } catch {
      Q(null), d("unauthenticated");
    } finally {
      h.cleanup();
    }
  }, [
    e,
    f.autoRefresh,
    m,
    C,
    S,
    d,
    Q
  ]);
  O(() => {
    !s.current || !f.syncTabs || s.current.setCallback((h) => {
      switch (h.type) {
        case "login":
          Q(h.user), d("authenticated");
          break;
        case "logout":
          Q(null), d("unauthenticated"), c.current?.clear();
          break;
        case "refresh":
          g();
          break;
        default:
          console.warn("[Cedros Login] Unhandled tab sync event:", h);
      }
    });
  }, [f.syncTabs, g, d, Q]), O(() => {
    const h = new AbortController(), D = i ?? 1e4, K = window.setTimeout(() => h.abort(), D);
    return (async () => {
      d("loading");
      try {
        const b = await fetch(`${e}/user`, {
          credentials: "include",
          headers: E(),
          signal: h.signal
        });
        if (b.ok) {
          const J = await b.json();
          if (_(J)) {
            Q(J.user), d("authenticated");
            return;
          }
        }
        if (b.status === 401 && f.autoRefresh) {
          try {
            await m();
          } catch {
            S();
            return;
          }
          const J = await fetch(`${e}/user`, {
            credentials: "include",
            headers: E(),
            signal: h.signal
          });
          if (J.ok) {
            const Y = await J.json();
            if (_(Y)) {
              Q(Y.user), d("authenticated");
              return;
            }
          }
        }
        Q(null), d("unauthenticated");
      } catch {
        Q(null), d("unauthenticated");
      }
    })(), () => {
      window.clearTimeout(K), h.abort();
    };
  }, [
    e,
    f.autoRefresh,
    m,
    E,
    S,
    d,
    Q,
    i
  ]);
  const I = p(
    (h, D) => {
      Q(h), d("authenticated"), D && c.current?.setTokens(D), y.current && s.current?.broadcastLogin(h);
    },
    [Q, d]
  ), l = p(async () => {
    const h = ne(), D = new AbortController(), K = i ?? 1e4, H = window.setTimeout(() => D.abort(), K);
    try {
      await fetch(`${e}/logout`, {
        method: "POST",
        headers: {
          ...h ? { "X-CSRF-Token": h } : {},
          ...E() ?? {}
        },
        credentials: "include",
        signal: D.signal
      });
    } catch {
    } finally {
      window.clearTimeout(H), Q(null), d("unauthenticated"), c.current?.clear(), s.current?.broadcastLogout(), k.current?.onLogout?.();
    }
  }, [e, E, Q, d, i]), u = p(() => c.current?.getAccessToken() ?? null, []);
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
function L(e) {
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
    L(e),
    { name: "AES-GCM", length: 256 },
    !1,
    // not extractable
    ["encrypt", "decrypt"]
  );
}
async function nA(e, A, t) {
  const i = t ?? iA(), r = await rA(A), n = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: L(i) },
    r,
    L(e)
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
    L(e),
    "HKDF",
    !1,
    ["deriveBits"]
  ), n = new TextEncoder().encode(t), o = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: L(A ?? new Uint8Array(32)),
      // Zero salt if not provided
      info: L(n)
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
function T(e, A, t, i) {
  function r(n) {
    return n instanceof t ? n : new t(function(o) {
      o(n);
    });
  }
  return new (t || (t = Promise))(function(n, o) {
    function a(k) {
      try {
        s(i.next(k));
      } catch (y) {
        o(y);
      }
    }
    function c(k) {
      try {
        s(i.throw(k));
      } catch (y) {
        o(y);
      }
    }
    function s(k) {
      k.done ? n(k.value) : r(k.value).then(a, c);
    }
    s((i = i.apply(e, [])).next());
  });
}
class F {
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
    return T(this, void 0, void 0, function* () {
      const t = yield this.lock();
      try {
        return yield Promise.resolve(A());
      } finally {
        t();
      }
    });
  }
}
var oe;
function aA() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global;
}
const ce = aA(), se = (oe = ce.Buffer) !== null && oe !== void 0 ? oe : null, gA = ce.TextEncoder ? new ce.TextEncoder() : null;
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
function Ce(e, A, t) {
  let i = 0;
  for (let r = 0; r < t; r++) {
    let n = A[r] >>> 4;
    e[i++] = n > 9 ? n + we : n + Qe, n = A[r] & 15, e[i++] = n > 9 ? n + we : n + Qe;
  }
  return String.fromCharCode.apply(null, e);
}
const v = se !== null ? (e) => {
  if (typeof e == "string") {
    const A = se.from(e, "utf8");
    return new Uint8Array(A.buffer, A.byteOffset, A.length);
  }
  if (se.isBuffer(e))
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
}, N = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", j = new Uint8Array(256);
for (let e = 0; e < N.length; e++)
  j[N.charCodeAt(e)] = e;
function Be(e, A = !0) {
  const t = e.length, i = t % 3, r = [], n = t - i;
  for (let o = 0; o < n; o += 3) {
    const a = (e[o] << 16 & 16711680) + (e[o + 1] << 8 & 65280) + (e[o + 2] & 255), c = N.charAt(a >> 18 & 63) + N.charAt(a >> 12 & 63) + N.charAt(a >> 6 & 63) + N.charAt(a & 63);
    r.push(c);
  }
  if (i === 1) {
    const o = e[t - 1], a = N.charAt(o >> 2), c = N.charAt(o << 4 & 63);
    r.push(`${a}${c}`), A && r.push("==");
  } else if (i === 2) {
    const o = (e[t - 2] << 8) + e[t - 1], a = N.charAt(o >> 10), c = N.charAt(o >> 4 & 63), s = N.charAt(o << 2 & 63);
    r.push(`${a}${c}${s}`), A && r.push("=");
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
    const o = j[e.charCodeAt(n)], a = j[e.charCodeAt(n + 1)], c = j[e.charCodeAt(n + 2)], s = j[e.charCodeAt(n + 3)];
    i[r] = o << 2 | a >> 4, r += 1, i[r] = (a & 15) << 4 | c >> 2, r += 1, i[r] = (c & 3) << 6 | s & 63, r += 1;
  }
  return i;
}
const $ = 16 * 1024, W = 4, hA = new F(), Ie = /* @__PURE__ */ new Map();
function me(e, A) {
  return T(this, void 0, void 0, function* () {
    let t = null, i = null, r = !1;
    if (typeof WebAssembly > "u")
      throw new Error("WebAssembly is not supported in this environment!");
    const n = (g, I = 0) => {
      i.set(g, I);
    }, o = () => i, a = () => t.exports, c = (g) => {
      t.exports.Hash_SetMemorySize(g);
      const I = t.exports.Hash_GetBuffer(), l = t.exports.memory.buffer;
      i = new Uint8Array(l, I, g);
    }, s = () => new DataView(t.exports.memory.buffer).getUint32(t.exports.STATE_SIZE, !0), k = hA.dispatch(() => T(this, void 0, void 0, function* () {
      if (!Ie.has(e.name)) {
        const I = CA(e.data), l = WebAssembly.compile(I);
        Ie.set(e.name, l);
      }
      const g = yield Ie.get(e.name);
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
    })), y = () => T(this, void 0, void 0, function* () {
      t || (yield k);
      const g = t.exports.Hash_GetBuffer(), I = t.exports.memory.buffer;
      i = new Uint8Array(I, g, $);
    }), w = (g = null) => {
      r = !0, t.exports.Hash_Init(g);
    }, G = (g) => {
      let I = 0;
      for (; I < g.length; ) {
        const l = g.subarray(I, I + $);
        I += l.length, i.set(l), t.exports.Hash_Update(l.length);
      }
    }, B = (g) => {
      if (!r)
        throw new Error("update() called before init()");
      const I = v(g);
      G(I);
    }, Q = new Uint8Array(A * 2), d = (g, I = null) => {
      if (!r)
        throw new Error("digest() called before init()");
      return r = !1, t.exports.Hash_Final(I), g === "binary" ? i.slice(0, A) : Ce(Q, i, A);
    }, f = () => {
      if (!r)
        throw new Error("save() can only be called after init() and before digest()");
      const g = t.exports.Hash_GetState(), I = s(), l = t.exports.memory.buffer, u = new Uint8Array(l, g, I), h = new Uint8Array(W + I);
      return Ue(h, e.hash), h.set(u, W), h;
    }, m = (g) => {
      if (!(g instanceof Uint8Array))
        throw new Error("load() expects an Uint8Array generated by save()");
      const I = t.exports.Hash_GetState(), l = s(), u = W + l, h = t.exports.memory.buffer;
      if (g.length !== u)
        throw new Error(`Bad state length (expected ${u} bytes, got ${g.length})`);
      if (!lA(e.hash, g.subarray(0, W)))
        throw new Error("This state was written by an incompatible hash implementation");
      const D = g.subarray(W);
      new Uint8Array(h, I, l).set(D), r = !0;
    }, E = (g) => typeof g == "string" ? g.length < $ / 4 : g.byteLength < $;
    let S = E;
    switch (e.name) {
      case "argon2":
      case "scrypt":
        S = () => !0;
        break;
      case "blake2b":
      case "blake2s":
        S = (g, I) => I <= 512 && E(g);
        break;
      case "blake3":
        S = (g, I) => I === 0 && E(g);
        break;
      case "xxhash64":
      // cannot simplify
      case "xxhash3":
      case "xxhash128":
      case "crc64":
        S = () => !1;
        break;
    }
    const C = (g, I = null, l = null) => {
      if (!S(g, I))
        return w(I), B(g), d("hex", l);
      const u = v(g);
      return i.set(u), t.exports.Hash_Calculate(u.length, I, l), Ce(Q, i, A);
    };
    return yield y(), {
      getMemory: o,
      writeMemory: n,
      getExports: a,
      setMemorySize: c,
      init: w,
      update: B,
      digest: d,
      save: f,
      load: m,
      calculate: C,
      hashLength: A
    };
  });
}
new F();
var fA = "argon2", uA = "AGFzbQEAAAABKQVgAX8Bf2AAAX9gEH9/f39/f39/f39/f39/f38AYAR/f39/AGACf38AAwYFAAECAwQFBgEBAoCAAgYIAX8BQZCoBAsHQQQGbWVtb3J5AgASSGFzaF9TZXRNZW1vcnlTaXplAAAOSGFzaF9HZXRCdWZmZXIAAQ5IYXNoX0NhbGN1bGF0ZQAECvEyBVgBAn9BACEBAkAgAEEAKAKICCICRg0AAkAgACACayIAQRB2IABBgIB8cSAASWoiAEAAQX9HDQBB/wHADwtBACEBQQBBACkDiAggAEEQdK18NwOICAsgAcALcAECfwJAQQAoAoAIIgANAEEAPwBBEHQiADYCgAhBACgCiAgiAUGAgCBGDQACQEGAgCAgAWsiAEEQdiAAQYCAfHEgAElqIgBAAEF/Rw0AQQAPC0EAQQApA4gIIABBEHStfDcDiAhBACgCgAghAAsgAAvcDgECfiAAIAQpAwAiECAAKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAMIBAgDCkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgBCAQIAQpAwCFQiiJIhA3AwAgACAQIAApAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAwgECAMKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAEIBAgBCkDAIVCAYk3AwAgASAFKQMAIhAgASkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDSAQIA0pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAEgECABKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACANIBAgDSkDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAIgBikDACIQIAIpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIA4gECAOKQMAhUIgiSIQNwMAIAogECAKKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACACIBAgAikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDiAQIA4pAwCFQjCJIhA3AwAgCiAQIAopAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACADIAcpAwAiECADKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAPIBAgDykDAIVCIIkiEDcDACALIBAgCykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAyAQIAMpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA8gECAPKQMAhUIwiSIQNwMAIAsgECALKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgACAFKQMAIhAgACkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDyAQIA8pAwCFQiCJIhA3AwAgCiAQIAopAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAAgECAAKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAPIBAgDykDAIVCMIkiEDcDACAKIBAgCikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAEgBikDACIQIAEpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAwgECAMKQMAhUIgiSIQNwMAIAsgECALKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACABIBAgASkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDCAQIAwpAwCFQjCJIhA3AwAgCyAQIAspAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACACIAcpAwAiECACKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACANIBAgDSkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAiAQIAIpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA0gECANKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgAyAEKQMAIhAgAykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDiAQIA4pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAQgECAEKQMAhUIoiSIQNwMAIAMgECADKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAOIBAgDikDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBCAQIAQpAwCFQgGJNwMAC98aAQN/QQAhBEEAIAIpAwAgASkDAIU3A5AIQQAgAikDCCABKQMIhTcDmAhBACACKQMQIAEpAxCFNwOgCEEAIAIpAxggASkDGIU3A6gIQQAgAikDICABKQMghTcDsAhBACACKQMoIAEpAyiFNwO4CEEAIAIpAzAgASkDMIU3A8AIQQAgAikDOCABKQM4hTcDyAhBACACKQNAIAEpA0CFNwPQCEEAIAIpA0ggASkDSIU3A9gIQQAgAikDUCABKQNQhTcD4AhBACACKQNYIAEpA1iFNwPoCEEAIAIpA2AgASkDYIU3A/AIQQAgAikDaCABKQNohTcD+AhBACACKQNwIAEpA3CFNwOACUEAIAIpA3ggASkDeIU3A4gJQQAgAikDgAEgASkDgAGFNwOQCUEAIAIpA4gBIAEpA4gBhTcDmAlBACACKQOQASABKQOQAYU3A6AJQQAgAikDmAEgASkDmAGFNwOoCUEAIAIpA6ABIAEpA6ABhTcDsAlBACACKQOoASABKQOoAYU3A7gJQQAgAikDsAEgASkDsAGFNwPACUEAIAIpA7gBIAEpA7gBhTcDyAlBACACKQPAASABKQPAAYU3A9AJQQAgAikDyAEgASkD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", wA = "e4cdc523", QA = {
  name: fA,
  data: uA,
  hash: wA
}, BA = "blake2b", dA = "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", EA = "c6f286e6", pA = {
  name: BA,
  data: dA,
  hash: EA
};
new F();
function de(e) {
  return !Number.isInteger(e) || e < 8 || e > 512 || e % 8 !== 0 ? new Error("Invalid variant! Valid values: 8, 16, ..., 512") : null;
}
function yA(e, A) {
  return e | A << 16;
}
function he(e = 512, A = null) {
  if (de(e))
    return Promise.reject(de(e));
  let t = null, i = e;
  if (A !== null) {
    if (t = v(A), t.length > 64)
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
function x(e) {
  return Ee.setInt32(0, e, !0), new Uint8Array(Ee.buffer);
}
function ae(e, A, t) {
  return T(this, void 0, void 0, function* () {
    if (t <= 64) {
      const c = yield he(t * 8);
      return c.update(x(t)), c.update(A), c.digest("binary");
    }
    const i = Math.ceil(t / 32) - 2, r = new Uint8Array(t);
    e.init(), e.update(x(t)), e.update(A);
    let n = e.digest("binary");
    r.set(n.subarray(0, 32), 0);
    for (let c = 1; c < i; c++)
      e.init(), e.update(n), n = e.digest("binary"), r.set(n.subarray(0, 32), c * 32);
    const o = t - 32 * i;
    let a;
    return o === 64 ? (a = e, a.init()) : a = yield he(o * 8), a.update(n), n = a.digest("binary"), r.set(n.subarray(0, o), i * 32), r;
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
  return T(this, void 0, void 0, function* () {
    var A;
    const { parallelism: t, iterations: i, hashLength: r } = e, n = v(e.password), o = v(e.salt), a = 19, c = SA(e.hashType), { memorySize: s } = e, k = v((A = e.secret) !== null && A !== void 0 ? A : ""), [y, w] = yield Promise.all([
      me(QA, 1024),
      he(512)
    ]);
    y.setMemorySize(s * 1024 + 1024);
    const G = new Uint8Array(24), B = new DataView(G.buffer);
    B.setInt32(0, t, !0), B.setInt32(4, r, !0), B.setInt32(8, s, !0), B.setInt32(12, i, !0), B.setInt32(16, a, !0), B.setInt32(20, c, !0), y.writeMemory(G, s * 1024), w.init(), w.update(G), w.update(x(n.length)), w.update(n), w.update(x(o.length)), w.update(o), w.update(x(k.length)), w.update(k), w.update(x(0));
    const d = Math.floor(s / (t * 4)) * 4, f = new Uint8Array(72), m = w.digest("binary");
    f.set(m);
    for (let C = 0; C < t; C++) {
      f.set(x(0), 64), f.set(x(C), 68);
      let g = C * d, I = yield ae(w, f, 1024);
      y.writeMemory(I, g * 1024), g += 1, f.set(x(1), 64), I = yield ae(w, f, 1024), y.writeMemory(I, g * 1024);
    }
    const E = new Uint8Array(1024);
    Ue(E, y.calculate(new Uint8Array([]), s));
    const S = yield ae(w, E, r);
    if (e.outputType === "hex") {
      const C = new Uint8Array(r * 2);
      return Ce(C, S, r);
    }
    return e.outputType === "encoded" ? kA(o, e, S) : S;
  });
}
const FA = (e) => {
  var A;
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
  if (e.secret = v((A = e.secret) !== null && A !== void 0 ? A : ""), !Number.isInteger(e.iterations) || e.iterations < 1)
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
  return T(this, void 0, void 0, function* () {
    return FA(e), DA(Object.assign(Object.assign({}, e), { hashType: "id" }));
  });
}
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
new F();
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
function fe() {
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator.credentials < "u";
}
async function HA() {
  if (!fe())
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
  if (!fe())
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
    NA(),
    Promise.resolve(fe()),
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
async function NA() {
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
let z = null, ge = null;
const PA = 6e4;
async function YA(e = !1) {
  const A = Date.now(), t = ge === null || A - ge > PA;
  return !e && !(typeof window > "u") && !t && z !== null || (z = await JA(), ge = Date.now()), z;
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
  const e = ye(), [A, t] = U(!1), [i, r] = U(null), n = e?.config.serverUrl, o = e?.config.requestTimeout, a = e?.config.retryAttempts, c = e?._internal?.getAccessToken, s = V(() => e ? new pe({
    baseUrl: n,
    timeoutMs: o,
    retryAttempts: a,
    getAccessToken: c
  }) : null, [e, n, o, a, c]), k = p(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      return await s.get("/wallet/status");
    } catch (I) {
      const l = M(I, "Failed to fetch wallet status");
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [s]), y = p(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      return await s.get("/wallet/material");
    } catch (I) {
      const l = M(I, "Failed to fetch wallet material");
      if (l.code === "NOT_FOUND")
        return null;
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [s]), w = p(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await s.post("/wallet/enroll", I);
      } catch (l) {
        const u = M(l, "Failed to enroll wallet");
        throw r(u.message), u;
      } finally {
        t(!1);
      }
    },
    [s]
  ), G = p(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await s.post("/wallet/recover", I);
      } catch (l) {
        const u = M(l, "Failed to recover wallet");
        throw r(u.message), u;
      } finally {
        t(!1);
      }
    },
    [s]
  ), B = p(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await s.post("/wallet/sign", I);
      } catch (l) {
        const u = M(l, "Failed to sign transaction");
        throw r(u.message), u;
      } finally {
        t(!1);
      }
    },
    [s]
  ), Q = p(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await s.post("/wallet/rotate-user-secret", I);
      } catch (l) {
        const u = M(l, "Failed to rotate user secret");
        throw r(u.message), u;
      } finally {
        t(!1);
      }
    },
    [s]
  ), d = p(
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
        const u = M(l, "Failed to unlock wallet");
        throw r(u.message), u;
      } finally {
        t(!1);
      }
    },
    [s]
  ), f = p(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      await s.post("/wallet/lock", {});
    } catch (I) {
      const l = M(I, "Failed to lock wallet");
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [s]), m = p(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await s.post("/wallet/share-b", I);
      } catch (l) {
        const u = M(l, "Failed to get Share B for recovery");
        throw r(u.message), u;
      } finally {
        t(!1);
      }
    },
    [s]
  ), E = p(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        return await s.post("/wallet/derived", I);
      } catch (l) {
        const u = M(l, "Failed to create derived wallet");
        throw r(u.message), u;
      } finally {
        t(!1);
      }
    },
    [s]
  ), S = p(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    t(!0), r(null);
    try {
      return await s.get("/wallet/derived");
    } catch (I) {
      const l = M(I, "Failed to list wallets");
      throw r(l.message), l;
    } finally {
      t(!1);
    }
  }, [s]), C = p(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      t(!0), r(null);
      try {
        await s.delete(`/wallet/derived/${I}`);
      } catch (l) {
        const u = M(l, "Failed to delete derived wallet");
        throw r(u.message), u;
      } finally {
        t(!1);
      }
    },
    [s]
  ), g = p(() => r(null), []);
  return {
    getStatus: k,
    getMaterial: y,
    enroll: w,
    recover: G,
    signTransaction: B,
    rotateUserSecret: Q,
    unlock: d,
    lock: f,
    getShareBForRecovery: m,
    createDerivedWallet: E,
    listAllWallets: S,
    deleteDerivedWallet: C,
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
  const A = ye() !== null, [t, i] = U("loading"), [r, n] = U(null), [o, a] = U(null), [c, s] = U(!1), [k, y] = U(!1), [w, G] = U(null), [B, Q] = U(null), { getStatus: d, isLoading: f } = xA(), m = P(!1);
  O(() => {
    if (!A) return;
    let C = !1;
    return (async () => {
      try {
        const I = await YA();
        if (C) return;
        G(I), I.allSupported || (i("error"), Q(
          "Your browser or device does not support all required features. Please use a modern browser with a platform authenticator."
        ));
      } catch {
        if (C) return;
        G(null), i("error"), Q("Failed to check crypto capabilities");
      }
    })(), () => {
      C = !0;
    };
  }, [A]);
  const E = p(async () => {
    if (!(!A || !w?.allSupported)) {
      i("loading"), Q(null);
      try {
        const C = await d();
        n(C.solanaPubkey ?? null), a(C.authMethod ?? null), s(C.hasExternalWallet), y(C.unlocked), C.hasExternalWallet ? i("enrolled_unlocked") : C.enrolled ? i(C.unlocked ? "enrolled_unlocked" : "enrolled_locked") : i("not_enrolled");
      } catch (C) {
        i("error"), Q(C instanceof Error ? C.message : "Failed to fetch wallet status");
      }
    }
  }, [A, w?.allSupported, d]);
  O(() => {
    A && w?.allSupported && !f && !m.current && (m.current = !0, E());
  }, [A, w?.allSupported, f, E]);
  const S = p(() => Q(null), []);
  return A ? {
    status: t,
    solanaPubkey: r,
    authMethod: o,
    hasExternalWallet: c,
    isUnlocked: k,
    capabilities: w,
    isSupported: w?.allSupported ?? !1,
    error: B,
    refresh: E,
    clearError: S
  } : vA;
}
const Ae = "__CEDROS_EMBEDDED_WALLET__";
function RA(e) {
  typeof window < "u" && (window[Ae] = e);
}
function le() {
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
  return O(() => {
    if (!n || !A) {
      le();
      return;
    }
    if (r) {
      le();
      return;
    }
    if (t === "loading")
      return;
    const a = t === "enrolled_locked" || t === "enrolled_unlocked";
    return RA({
      available: a,
      publicKey: o && a ? i : null
    }), () => {
      le();
    };
  }, [n, o, A, t, i, r]), null;
}
function at({ config: e, children: A }) {
  const [t, i] = U(null), [r, n] = U(!1), o = P(e.callbacks);
  o.current = e.callbacks;
  const a = P({
    onLoginSuccess: (...R) => o.current?.onLoginSuccess?.(...R),
    onLoginError: (...R) => o.current?.onLoginError?.(...R),
    onLogout: () => o.current?.onLogout?.(),
    onSessionExpired: () => o.current?.onSessionExpired?.()
  }), c = e.features === "auto", {
    features: s,
    googleClientId: k,
    appleClientId: y,
    socialButtonOrder: w,
    isLoading: G
  } = Pe(
    e.serverUrl,
    c,
    e.requestTimeout
  ), B = V(() => !c || !s ? e : {
    ...e,
    features: s,
    googleClientId: e.googleClientId ?? k,
    appleClientId: e.appleClientId ?? y
  }, [e, c, s, k, y]), Q = V(
    () => JSON.stringify(B.themeOverrides ?? null),
    [B.themeOverrides]
  ), d = V(() => JSON.stringify(B.session ?? null), [B.session]), f = V(() => JSON.stringify(B.features ?? null), [B.features]), m = V(() => JSON.stringify(B.forms ?? null), [B.forms]), E = V(
    () => B,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Using serialized keys for deep comparison; callbacks excluded (see UI-06)
    [
      B.serverUrl,
      B.googleClientId,
      B.appleClientId,
      B.requestTimeout,
      B.retryAttempts,
      B.theme,
      Q,
      d,
      f,
      m
    ]
  );
  Ve({
    theme: E.theme,
    themeOverrides: E.themeOverrides
  });
  const {
    user: S,
    authState: C,
    handleLoginSuccess: g,
    logout: I,
    refreshUser: l,
    getAccessToken: u
  } = Le({
    serverUrl: E.serverUrl,
    session: E.session,
    callbacks: a.current,
    requestTimeoutMs: E.requestTimeout
  }), h = p(async () => {
    i(null), await I();
  }, [I]), D = p(
    (...R) => {
      i(null), g(...R);
    },
    [g]
  ), K = p(() => n(!0), []), H = p(() => n(!1), []), b = V(
    () => ({
      config: E,
      user: S,
      authState: C,
      logout: h,
      refreshUser: l,
      socialButtonOrder: c ? w : void 0,
      _internal: {
        handleLoginSuccess: D,
        getAccessToken: u
      }
    }),
    [E, S, C, h, l, c, w, D, u]
  ), J = V(
    () => ({
      error: t,
      isModalOpen: r,
      openModal: K,
      closeModal: H
    }),
    [t, r, K, H]
  ), Y = V(
    () => ({ ...b, ...J }),
    [b, J]
  );
  return c && G ? null : /* @__PURE__ */ re(He.Provider, { value: b, children: /* @__PURE__ */ re(Je.Provider, { value: J, children: /* @__PURE__ */ Ke(Me.Provider, { value: Y, children: [
    /* @__PURE__ */ re(LA, {}),
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
