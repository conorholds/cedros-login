import { jsx as oe, jsxs as He } from "react/jsx-runtime";
import { useEffect as O, useState as U, useRef as N, useCallback as E, useMemo as V } from "react";
import { A as Je, a as Me, C as Ve } from "./LoadingSpinner-6vml-zwr.js";
import { A as pe, g as se, a as ye, h as M, u as ke } from "./useCedrosLogin-CFfID-0i.js";
let q = 0;
function Pe({ theme: e, themeOverrides: t }) {
  O(() => {
    if (typeof document > "u" || typeof window > "u")
      return;
    const A = document.documentElement;
    let i = !1;
    e === "dark" ? i = !0 : e === "light" ? i = !1 : i = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let r = !1;
    i ? (q++, r = !0, A.classList.add("cedros-dark")) : q === 0 && A.classList.remove("cedros-dark");
    const n = /* @__PURE__ */ new Map();
    return t && Object.entries(t).forEach(([o, a]) => {
      if (a) {
        const g = A.style.getPropertyValue(o);
        n.set(o, g), A.style.setProperty(o, a);
      }
    }), () => {
      r && (q--, q === 0 && A.classList.remove("cedros-dark")), n.forEach((o, a) => {
        o ? A.style.setProperty(a, o) : A.style.removeProperty(a);
      });
    };
  }, [e, t]);
}
const Ne = {
  email: !0,
  google: !0,
  apple: !0,
  solana: !0,
  webauthn: !0,
  instantLink: !0
};
function Ye(e, t, A) {
  const [i, r] = U(null), [n, o] = U(), [a, g] = U(), [s, k] = U(), [y, w] = U(), [b, Q] = U(t), u = N(!1);
  return O(() => {
    if (!t || u.current) return;
    u.current = !0, new pe({
      baseUrl: e,
      timeoutMs: A ?? 5e3,
      retryAttempts: 1
    }).get("/features", { credentials: "omit" }).then((C) => {
      r({
        email: C.email,
        google: C.google,
        apple: C.apple,
        solana: C.solana,
        webauthn: C.webauthn,
        instantLink: C.instantLink
      }), o(C.googleClientId), g(C.appleClientId), k(C.usernameEnabled), w(C.socialButtonOrder);
    }).catch(() => {
      r(Ne);
    }).finally(() => {
      Q(!1);
    });
  }, [t, e, A]), { features: i, googleClientId: n, appleClientId: a, usernameEnabled: s, socialButtonOrder: y, isLoading: b };
}
const Oe = "cedros_tokens", xe = 6e4;
class ve {
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
  constructor(t = "cookie", A = Oe, i = {}) {
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
const Te = "cedros_auth_sync";
class Re {
  channel = null;
  callback = null;
  boundHandler = null;
  constructor() {
    typeof window < "u" && "BroadcastChannel" in window && (this.channel = new BroadcastChannel(Te), this.boundHandler = this.handleMessage.bind(this), this.channel.addEventListener("message", this.boundHandler));
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
function _(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = e;
  if (typeof t.user != "object" || t.user === null) return !1;
  const A = t.user;
  return typeof A.id == "string" && A.id.length > 0;
}
function Le(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = e;
  return typeof t.accessToken == "string" && t.accessToken.length > 0 && typeof t.refreshToken == "string" && t.refreshToken.length > 0 && typeof t.expiresIn == "number" && t.expiresIn > 0;
}
function Xe({
  serverUrl: e,
  session: t,
  callbacks: A,
  requestTimeoutMs: i
}) {
  const [r, n] = U(null), [o, a] = U("idle"), g = N(null), s = N(null), k = N(A), y = N(!0), w = N(null), b = N(() => Promise.resolve()), Q = N(() => {
  });
  O(() => {
    k.current = A;
  }, [A]), O(() => (y.current = !0, () => {
    y.current = !1;
  }), []);
  const u = E((h) => {
    y.current && n(h);
  }, []), B = E((h) => {
    y.current && a(h);
  }, []), C = V(
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
  O(() => {
    const h = new ve(C.storage, C.persistKey, {
      allowWebStorage: C.allowWebStorage
    });
    return g.current = h, C.autoRefresh && h.setRefreshCallback(() => b.current()), h.setSessionExpiredCallback(() => Q.current()), C.syncTabs && (s.current = new Re()), () => {
      h.destroy(), g.current = null, s.current?.close();
    };
  }, [
    C.storage,
    C.syncTabs,
    C.persistKey,
    C.allowWebStorage,
    C.autoRefresh
  ]);
  const K = E(async () => {
    if (w.current)
      return w.current;
    const h = g.current?.getRefreshToken(), S = !!h, G = se(), H = {};
    S && (H["Content-Type"] = "application/json"), G && (H["X-CSRF-Token"] = G);
    let m, J;
    const Y = new Promise((Z, re) => {
      m = Z, J = re;
    });
    w.current = Y, (async () => {
      const Z = new AbortController(), re = i ?? 1e4, Ke = window.setTimeout(() => Z.abort(), re);
      try {
        const X = await fetch(`${e}/refresh`, {
          method: "POST",
          headers: Object.keys(H).length > 0 ? H : void 0,
          credentials: "include",
          body: S ? JSON.stringify({ refreshToken: h }) : void 0,
          signal: Z.signal
        });
        if (!X.ok)
          throw new Error("Token refresh failed");
        const ne = await X.json();
        if (ne.tokens) {
          if (!Le(ne.tokens))
            throw new Error("Invalid token response structure");
          g.current?.setTokens(ne.tokens);
        } else if (C.storage !== "cookie")
          throw new Error("Token refresh failed");
        s.current?.broadcastRefresh(), m();
      } catch (X) {
        throw J(X), X;
      } finally {
        window.clearTimeout(Ke);
      }
    })().catch(() => {
    });
    try {
      await Y;
    } finally {
      w.current = null;
    }
  }, [e, C.storage, i]), p = E(() => {
    if (C.storage === "cookie") return;
    const h = g.current?.getAccessToken();
    if (h)
      return { Authorization: `Bearer ${h}` };
  }, [C.storage]), F = E(() => {
    g.current?.clear(), u(null), B("unauthenticated"), k.current?.onSessionExpired?.();
  }, [B, u]);
  b.current = K, Q.current = F;
  const d = E(
    (h) => {
      const S = new AbortController(), G = i ?? 1e4, H = window.setTimeout(() => S.abort(), G), m = {}, J = p();
      J && Object.assign(m, J);
      const Y = se();
      return Y && (m["X-CSRF-Token"] = Y), {
        promise: fetch(h, {
          credentials: "include",
          headers: Object.keys(m).length > 0 ? m : void 0,
          signal: S.signal
        }),
        cleanup: () => window.clearTimeout(H)
      };
    },
    [p, i]
  ), l = E(async () => {
    const h = d(`${e}/user`);
    try {
      const S = await h.promise;
      if (S.ok) {
        const G = await S.json();
        if (_(G)) {
          u(G.user), B("authenticated");
          return;
        }
      }
      if (S.status === 401 && C.autoRefresh) {
        try {
          await K();
        } catch {
          F();
          return;
        }
        const G = d(`${e}/user`);
        try {
          const H = await G.promise;
          if (H.ok) {
            const m = await H.json();
            if (_(m)) {
              u(m.user), B("authenticated");
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
      h.cleanup();
    }
  }, [
    e,
    C.autoRefresh,
    K,
    d,
    F,
    B,
    u
  ]);
  O(() => {
    !s.current || !C.syncTabs || s.current.setCallback((h) => {
      switch (h.type) {
        case "login":
          u(h.user), B("authenticated");
          break;
        case "logout":
          u(null), B("unauthenticated"), g.current?.clear();
          break;
        case "refresh":
          l();
          break;
        default:
          console.warn("[Cedros Login] Unhandled tab sync event:", h);
      }
    });
  }, [C.syncTabs, l, B, u]), O(() => {
    const h = new AbortController(), S = i ?? 1e4, G = window.setTimeout(() => h.abort(), S);
    return (async () => {
      B("loading");
      try {
        const m = await fetch(`${e}/user`, {
          credentials: "include",
          headers: p(),
          signal: h.signal
        });
        if (m.ok) {
          const J = await m.json();
          if (_(J)) {
            u(J.user), B("authenticated");
            return;
          }
        }
        if (m.status === 401 && C.autoRefresh) {
          try {
            await K();
          } catch {
            F();
            return;
          }
          const J = await fetch(`${e}/user`, {
            credentials: "include",
            headers: p(),
            signal: h.signal
          });
          if (J.ok) {
            const Y = await J.json();
            if (_(Y)) {
              u(Y.user), B("authenticated");
              return;
            }
          }
        }
        u(null), B("unauthenticated");
      } catch {
        u(null), B("unauthenticated");
      }
    })(), () => {
      window.clearTimeout(G), h.abort();
    };
  }, [
    e,
    C.autoRefresh,
    K,
    p,
    F,
    B,
    u,
    i
  ]);
  const I = E(
    (h, S) => {
      u(h), B("authenticated"), S && g.current?.setTokens(S), y.current && s.current?.broadcastLogin(h);
    },
    [u, B]
  ), c = E(async () => {
    const h = se(), S = new AbortController(), G = i ?? 1e4, H = window.setTimeout(() => S.abort(), G);
    try {
      await fetch(`${e}/logout`, {
        method: "POST",
        headers: {
          ...h ? { "X-CSRF-Token": h } : {},
          ...p() ?? {}
        },
        credentials: "include",
        signal: S.signal
      });
    } catch {
    } finally {
      window.clearTimeout(H), u(null), B("unauthenticated"), g.current?.clear(), s.current?.broadcastLogout(), k.current?.onLogout?.();
    }
  }, [e, p, u, B, i]), f = E(() => g.current?.getAccessToken() ?? null, []);
  return {
    user: r,
    authState: o,
    handleLoginSuccess: I,
    logout: c,
    refreshUser: l,
    getAccessToken: f
  };
}
const We = {
  mCost: 19456,
  // 19 MiB
  tCost: 2,
  pCost: 1
};
function je(e) {
  return e.length === 16;
}
function Ze(e) {
  if (e.length === 16) return !0;
  if (e.length < 18) return !1;
  const t = e[0];
  return t === 0 || t === 1 || t === 128 || t === 8;
}
function qe(e) {
  return e.length === 32;
}
function _e(e) {
  return e.length === 12;
}
function $e(e) {
  return e.length >= 16;
}
function ze(e) {
  return e.length === 32;
}
function et(e) {
  if (!je(e))
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  return e;
}
function _t(e) {
  if (!Ze(e))
    throw new Error(`Invalid share length: expected >=16, got ${e.length}`);
  return e;
}
function Se(e) {
  if (!qe(e))
    throw new Error(`Invalid key length: expected 32, got ${e.length}`);
  return e;
}
function tt(e) {
  if (!_e(e))
    throw new Error(`Invalid nonce length: expected 12, got ${e.length}`);
  return e;
}
function At(e) {
  if (!$e(e))
    throw new Error(`Invalid salt length: expected >=16, got ${e.length}`);
  return e;
}
function it(e) {
  if (!ze(e))
    throw new Error(`Invalid PRF salt length: expected 32, got ${e.length}`);
  return e;
}
function T(e) {
  return new Uint8Array(e);
}
function te(e) {
  if (typeof crypto > "u" || !crypto.getRandomValues)
    throw new Error(
      "WebCrypto API not available. Secure random generation requires a modern browser."
    );
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), t;
}
function $t() {
  return et(te(16));
}
function rt() {
  return tt(te(12));
}
function zt() {
  return At(te(16));
}
function nt() {
  return it(te(32));
}
function De(e) {
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
    t && De(t);
}
async function ot(e) {
  return crypto.subtle.importKey(
    "raw",
    T(e),
    { name: "AES-GCM", length: 256 },
    !1,
    // not extractable
    ["encrypt", "decrypt"]
  );
}
async function st(e, t, A) {
  const i = A ?? rt(), r = await ot(t), n = await crypto.subtle.encrypt(
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
  const A = await st(e, t);
  return {
    ciphertext: ee(A.ciphertext),
    nonce: ee(A.nonce)
  };
}
function ee(e) {
  const A = [];
  for (let i = 0; i < e.length; i += 32768) {
    const r = e.subarray(i, Math.min(i + 32768, e.length));
    A.push(String.fromCharCode(...r));
  }
  return btoa(A.join(""));
}
function It(e) {
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
async function at(e, t, A, i = 32) {
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
  const A = await at(e, t, "cedros-wallet-share-b-encryption", 32);
  return Se(A);
}
async function gt() {
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
    function a(k) {
      try {
        s(i.next(k));
      } catch (y) {
        o(y);
      }
    }
    function g(k) {
      try {
        s(i.throw(k));
      } catch (y) {
        o(y);
      }
    }
    function s(k) {
      k.done ? n(k.value) : r(k.value).then(a, g);
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
var Ie;
function lt() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global;
}
const he = lt(), ae = (Ie = he.Buffer) !== null && Ie !== void 0 ? Ie : null, ct = he.TextEncoder ? new he.TextEncoder() : null;
function Fe(e, t) {
  return (e & 15) + (e >> 6 | e >> 3 & 8) << 4 | (t & 15) + (t >> 6 | t >> 3 & 8);
}
function Ue(e, t) {
  const A = t.length >> 1;
  for (let i = 0; i < A; i++) {
    const r = i << 1;
    e[i] = Fe(t.charCodeAt(r), t.charCodeAt(r + 1));
  }
}
function Ct(e, t) {
  if (e.length !== t.length * 2)
    return !1;
  for (let A = 0; A < t.length; A++) {
    const i = A << 1;
    if (t[A] !== Fe(e.charCodeAt(i), e.charCodeAt(i + 1)))
      return !1;
  }
  return !0;
}
const we = 87, Qe = 48;
function ue(e, t, A) {
  let i = 0;
  for (let r = 0; r < A; r++) {
    let n = t[r] >>> 4;
    e[i++] = n > 9 ? n + we : n + Qe, n = t[r] & 15, e[i++] = n > 9 ? n + we : n + Qe;
  }
  return String.fromCharCode.apply(null, e);
}
const v = ae !== null ? (e) => {
  if (typeof e == "string") {
    const t = ae.from(e, "utf8");
    return new Uint8Array(t.buffer, t.byteOffset, t.length);
  }
  if (ae.isBuffer(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.length);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
} : (e) => {
  if (typeof e == "string")
    return ct.encode(e);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
}, P = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", j = new Uint8Array(256);
for (let e = 0; e < P.length; e++)
  j[P.charCodeAt(e)] = e;
function Be(e, t = !0) {
  const A = e.length, i = A % 3, r = [], n = A - i;
  for (let o = 0; o < n; o += 3) {
    const a = (e[o] << 16 & 16711680) + (e[o + 1] << 8 & 65280) + (e[o + 2] & 255), g = P.charAt(a >> 18 & 63) + P.charAt(a >> 12 & 63) + P.charAt(a >> 6 & 63) + P.charAt(a & 63);
    r.push(g);
  }
  if (i === 1) {
    const o = e[A - 1], a = P.charAt(o >> 2), g = P.charAt(o << 4 & 63);
    r.push(`${a}${g}`), t && r.push("==");
  } else if (i === 2) {
    const o = (e[A - 2] << 8) + e[A - 1], a = P.charAt(o >> 10), g = P.charAt(o >> 4 & 63), s = P.charAt(o << 2 & 63);
    r.push(`${a}${g}${s}`), t && r.push("=");
  }
  return r.join("");
}
function ht(e) {
  let t = Math.floor(e.length * 0.75);
  const A = e.length;
  return e[A - 1] === "=" && (t -= 1, e[A - 2] === "=" && (t -= 1)), t;
}
function ut(e) {
  const t = ht(e), A = e.length, i = new Uint8Array(t);
  let r = 0;
  for (let n = 0; n < A; n += 4) {
    const o = j[e.charCodeAt(n)], a = j[e.charCodeAt(n + 1)], g = j[e.charCodeAt(n + 2)], s = j[e.charCodeAt(n + 3)];
    i[r] = o << 2 | a >> 4, r += 1, i[r] = (a & 15) << 4 | g >> 2, r += 1, i[r] = (g & 3) << 6 | s & 63, r += 1;
  }
  return i;
}
const $ = 16 * 1024, W = 4, ft = new D(), ge = /* @__PURE__ */ new Map();
function me(e, t) {
  return R(this, void 0, void 0, function* () {
    let A = null, i = null, r = !1;
    if (typeof WebAssembly > "u")
      throw new Error("WebAssembly is not supported in this environment!");
    const n = (l, I = 0) => {
      i.set(l, I);
    }, o = () => i, a = () => A.exports, g = (l) => {
      A.exports.Hash_SetMemorySize(l);
      const I = A.exports.Hash_GetBuffer(), c = A.exports.memory.buffer;
      i = new Uint8Array(c, I, l);
    }, s = () => new DataView(A.exports.memory.buffer).getUint32(A.exports.STATE_SIZE, !0), k = ft.dispatch(() => R(this, void 0, void 0, function* () {
      if (!ge.has(e.name)) {
        const I = ut(e.data), c = WebAssembly.compile(I);
        ge.set(e.name, c);
      }
      const l = yield ge.get(e.name);
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
    })), y = () => R(this, void 0, void 0, function* () {
      A || (yield k);
      const l = A.exports.Hash_GetBuffer(), I = A.exports.memory.buffer;
      i = new Uint8Array(I, l, $);
    }), w = (l = null) => {
      r = !0, A.exports.Hash_Init(l);
    }, b = (l) => {
      let I = 0;
      for (; I < l.length; ) {
        const c = l.subarray(I, I + $);
        I += c.length, i.set(c), A.exports.Hash_Update(c.length);
      }
    }, Q = (l) => {
      if (!r)
        throw new Error("update() called before init()");
      const I = v(l);
      b(I);
    }, u = new Uint8Array(t * 2), B = (l, I = null) => {
      if (!r)
        throw new Error("digest() called before init()");
      return r = !1, A.exports.Hash_Final(I), l === "binary" ? i.slice(0, t) : ue(u, i, t);
    }, C = () => {
      if (!r)
        throw new Error("save() can only be called after init() and before digest()");
      const l = A.exports.Hash_GetState(), I = s(), c = A.exports.memory.buffer, f = new Uint8Array(c, l, I), h = new Uint8Array(W + I);
      return Ue(h, e.hash), h.set(f, W), h;
    }, K = (l) => {
      if (!(l instanceof Uint8Array))
        throw new Error("load() expects an Uint8Array generated by save()");
      const I = A.exports.Hash_GetState(), c = s(), f = W + c, h = A.exports.memory.buffer;
      if (l.length !== f)
        throw new Error(`Bad state length (expected ${f} bytes, got ${l.length})`);
      if (!Ct(e.hash, l.subarray(0, W)))
        throw new Error("This state was written by an incompatible hash implementation");
      const S = l.subarray(W);
      new Uint8Array(h, I, c).set(S), r = !0;
    }, p = (l) => typeof l == "string" ? l.length < $ / 4 : l.byteLength < $;
    let F = p;
    switch (e.name) {
      case "argon2":
      case "scrypt":
        F = () => !0;
        break;
      case "blake2b":
      case "blake2s":
        F = (l, I) => I <= 512 && p(l);
        break;
      case "blake3":
        F = (l, I) => I === 0 && p(l);
        break;
      case "xxhash64":
      // cannot simplify
      case "xxhash3":
      case "xxhash128":
      case "crc64":
        F = () => !1;
        break;
    }
    const d = (l, I = null, c = null) => {
      if (!F(l, I))
        return w(I), Q(l), B("hex", c);
      const f = v(l);
      return i.set(f), A.exports.Hash_Calculate(f.length, I, c), ue(u, i, t);
    };
    return yield y(), {
      getMemory: o,
      writeMemory: n,
      getExports: a,
      setMemorySize: g,
      init: w,
      update: Q,
      digest: B,
      save: C,
      load: K,
      calculate: d,
      hashLength: t
    };
  });
}
new D();
var wt = "argon2", Qt = "AGFzbQEAAAABKQVgAX8Bf2AAAX9gEH9/f39/f39/f39/f39/f38AYAR/f39/AGACf38AAwYFAAECAwQFBgEBAoCAAgYIAX8BQZCoBAsHQQQGbWVtb3J5AgASSGFzaF9TZXRNZW1vcnlTaXplAAAOSGFzaF9HZXRCdWZmZXIAAQ5IYXNoX0NhbGN1bGF0ZQAECvEyBVgBAn9BACEBAkAgAEEAKAKICCICRg0AAkAgACACayIAQRB2IABBgIB8cSAASWoiAEAAQX9HDQBB/wHADwtBACEBQQBBACkDiAggAEEQdK18NwOICAsgAcALcAECfwJAQQAoAoAIIgANAEEAPwBBEHQiADYCgAhBACgCiAgiAUGAgCBGDQACQEGAgCAgAWsiAEEQdiAAQYCAfHEgAElqIgBAAEF/Rw0AQQAPC0EAQQApA4gIIABBEHStfDcDiAhBACgCgAghAAsgAAvcDgECfiAAIAQpAwAiECAAKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAMIBAgDCkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgBCAQIAQpAwCFQiiJIhA3AwAgACAQIAApAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAwgECAMKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAEIBAgBCkDAIVCAYk3AwAgASAFKQMAIhAgASkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDSAQIA0pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAEgECABKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACANIBAgDSkDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAIgBikDACIQIAIpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIA4gECAOKQMAhUIgiSIQNwMAIAogECAKKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACACIBAgAikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDiAQIA4pAwCFQjCJIhA3AwAgCiAQIAopAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACADIAcpAwAiECADKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAPIBAgDykDAIVCIIkiEDcDACALIBAgCykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAyAQIAMpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA8gECAPKQMAhUIwiSIQNwMAIAsgECALKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgACAFKQMAIhAgACkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDyAQIA8pAwCFQiCJIhA3AwAgCiAQIAopAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAAgECAAKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAPIBAgDykDAIVCMIkiEDcDACAKIBAgCikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAEgBikDACIQIAEpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAwgECAMKQMAhUIgiSIQNwMAIAsgECALKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACABIBAgASkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDCAQIAwpAwCFQjCJIhA3AwAgCyAQIAspAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACACIAcpAwAiECACKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACANIBAgDSkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAiAQIAIpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA0gECANKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgAyAEKQMAIhAgAykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDiAQIA4pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAQgECAEKQMAhUIoiSIQNwMAIAMgECADKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAOIBAgDikDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBCAQIAQpAwCFQgGJNwMAC98aAQN/QQAhBEEAIAIpAwAgASkDAIU3A5AIQQAgAikDCCABKQMIhTcDmAhBACACKQMQIAEpAxCFNwOgCEEAIAIpAxggASkDGIU3A6gIQQAgAikDICABKQMghTcDsAhBACACKQMoIAEpAyiFNwO4CEEAIAIpAzAgASkDMIU3A8AIQQAgAikDOCABKQM4hTcDyAhBACACKQNAIAEpA0CFNwPQCEEAIAIpA0ggASkDSIU3A9gIQQAgAikDUCABKQNQhTcD4AhBACACKQNYIAEpA1iFNwPoCEEAIAIpA2AgASkDYIU3A/AIQQAgAikDaCABKQNohTcD+AhBACACKQNwIAEpA3CFNwOACUEAIAIpA3ggASkDeIU3A4gJQQAgAikDgAEgASkDgAGFNwOQCUEAIAIpA4gBIAEpA4gBhTcDmAlBACACKQOQASABKQOQAYU3A6AJQQAgAikDmAEgASkDmAGFNwOoCUEAIAIpA6ABIAEpA6ABhTcDsAlBACACKQOoASABKQOoAYU3A7gJQQAgAikDsAEgASkDsAGFNwPACUEAIAIpA7gBIAEpA7gBhTcDyAlBACACKQPAASABKQPAAYU3A9AJQQAgAikDyAEgASkD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", Bt = "e4cdc523", dt = {
  name: wt,
  data: Qt,
  hash: Bt
}, Et = "blake2b", pt = "AGFzbQEAAAABEQRgAAF/YAJ/fwBgAX8AYAAAAwoJAAECAwECAgABBQQBAQICBg4CfwFBsIsFC38AQYAICwdwCAZtZW1vcnkCAA5IYXNoX0dldEJ1ZmZlcgAACkhhc2hfRmluYWwAAwlIYXNoX0luaXQABQtIYXNoX1VwZGF0ZQAGDUhhc2hfR2V0U3RhdGUABw5IYXNoX0NhbGN1bGF0ZQAIClNUQVRFX1NJWkUDAQrTOAkFAEGACQvrAgIFfwF+AkAgAUEBSA0AAkACQAJAIAFBgAFBACgC4IoBIgJrIgNKDQAgASEEDAELQQBBADYC4IoBAkAgAkH/AEoNACACQeCJAWohBSAAIQRBACEGA0AgBSAELQAAOgAAIARBAWohBCAFQQFqIQUgAyAGQQFqIgZB/wFxSg0ACwtBAEEAKQPAiQEiB0KAAXw3A8CJAUEAQQApA8iJASAHQv9+Vq18NwPIiQFB4IkBEAIgACADaiEAAkAgASADayIEQYEBSA0AIAIgAWohBQNAQQBBACkDwIkBIgdCgAF8NwPAiQFBAEEAKQPIiQEgB0L/flatfDcDyIkBIAAQAiAAQYABaiEAIAVBgH9qIgVBgAJLDQALIAVBgH9qIQQMAQsgBEEATA0BC0EAIQUDQCAFQQAoAuCKAWpB4IkBaiAAIAVqLQAAOgAAIAQgBUEBaiIFQf8BcUoNAAsLQQBBACgC4IoBIARqNgLgigELC78uASR+QQBBACkD0IkBQQApA7CJASIBQQApA5CJAXwgACkDICICfCIDhULr+obav7X2wR+FQiCJIgRCq/DT9K/uvLc8fCIFIAGFQiiJIgYgA3wgACkDKCIBfCIHIASFQjCJIgggBXwiCSAGhUIBiSIKQQApA8iJAUEAKQOoiQEiBEEAKQOIiQF8IAApAxAiA3wiBYVCn9j52cKR2oKbf4VCIIkiC0K7zqqm2NDrs7t/fCIMIASFQiiJIg0gBXwgACkDGCIEfCIOfCAAKQNQIgV8Ig9BACkDwIkBQQApA6CJASIQQQApA4CJASIRfCAAKQMAIgZ8IhKFQtGFmu/6z5SH0QCFQiCJIhNCiJLznf/M+YTqAHwiFCAQhUIoiSIVIBJ8IAApAwgiEHwiFiAThUIwiSIXhUIgiSIYQQApA9iJAUEAKQO4iQEiE0EAKQOYiQF8IAApAzAiEnwiGYVC+cL4m5Gjs/DbAIVCIIkiGkLx7fT4paf9p6V/fCIbIBOFQiiJIhwgGXwgACkDOCITfCIZIBqFQjCJIhogG3wiG3wiHSAKhUIoiSIeIA98IAApA1giCnwiDyAYhUIwiSIYIB18Ih0gDiALhUIwiSIOIAx8Ih8gDYVCAYkiDCAWfCAAKQNAIgt8Ig0gGoVCIIkiFiAJfCIaIAyFQiiJIiAgDXwgACkDSCIJfCIhIBaFQjCJIhYgGyAchUIBiSIMIAd8IAApA2AiB3wiDSAOhUIgiSIOIBcgFHwiFHwiFyAMhUIoiSIbIA18IAApA2giDHwiHCAOhUIwiSIOIBd8IhcgG4VCAYkiGyAZIBQgFYVCAYkiFHwgACkDcCINfCIVIAiFQiCJIhkgH3wiHyAUhUIoiSIUIBV8IAApA3giCHwiFXwgDHwiIoVCIIkiI3wiJCAbhUIoiSIbICJ8IBJ8IiIgFyAYIBUgGYVCMIkiFSAffCIZIBSFQgGJIhQgIXwgDXwiH4VCIIkiGHwiFyAUhUIoiSIUIB98IAV8Ih8gGIVCMIkiGCAXfCIXIBSFQgGJIhR8IAF8IiEgFiAafCIWIBUgHSAehUIBiSIaIBx8IAl8IhyFQiCJIhV8Ih0gGoVCKIkiGiAcfCAIfCIcIBWFQjCJIhWFQiCJIh4gGSAOIBYgIIVCAYkiFiAPfCACfCIPhUIgiSIOfCIZIBaFQiiJIhYgD3wgC3wiDyAOhUIwiSIOIBl8Ihl8IiAgFIVCKIkiFCAhfCAEfCIhIB6FQjCJIh4gIHwiICAiICOFQjCJIiIgJHwiIyAbhUIBiSIbIBx8IAp8IhwgDoVCIIkiDiAXfCIXIBuFQiiJIhsgHHwgE3wiHCAOhUIwiSIOIBkgFoVCAYkiFiAffCAQfCIZICKFQiCJIh8gFSAdfCIVfCIdIBaFQiiJIhYgGXwgB3wiGSAfhUIwiSIfIB18Ih0gFoVCAYkiFiAVIBqFQgGJIhUgD3wgBnwiDyAYhUIgiSIYICN8IhogFYVCKIkiFSAPfCADfCIPfCAHfCIihUIgiSIjfCIkIBaFQiiJIhYgInwgBnwiIiAjhUIwiSIjICR8IiQgFoVCAYkiFiAOIBd8Ig4gDyAYhUIwiSIPICAgFIVCAYkiFCAZfCAKfCIXhUIgiSIYfCIZIBSFQiiJIhQgF3wgC3wiF3wgBXwiICAPIBp8Ig8gHyAOIBuFQgGJIg4gIXwgCHwiGoVCIIkiG3wiHyAOhUIoiSIOIBp8IAx8IhogG4VCMIkiG4VCIIkiISAdIB4gDyAVhUIBiSIPIBx8IAF8IhWFQiCJIhx8Ih0gD4VCKIkiDyAVfCADfCIVIByFQjCJIhwgHXwiHXwiHiAWhUIoiSIWICB8IA18IiAgIYVCMIkiISAefCIeIBogFyAYhUIwiSIXIBl8IhggFIVCAYkiFHwgCXwiGSAchUIgiSIaICR8IhwgFIVCKIkiFCAZfCACfCIZIBqFQjCJIhogHSAPhUIBiSIPICJ8IAR8Ih0gF4VCIIkiFyAbIB98Iht8Ih8gD4VCKIkiDyAdfCASfCIdIBeFQjCJIhcgH3wiHyAPhUIBiSIPIBsgDoVCAYkiDiAVfCATfCIVICOFQiCJIhsgGHwiGCAOhUIoiSIOIBV8IBB8IhV8IAx8IiKFQiCJIiN8IiQgD4VCKIkiDyAifCAHfCIiICOFQjCJIiMgJHwiJCAPhUIBiSIPIBogHHwiGiAVIBuFQjCJIhUgHiAWhUIBiSIWIB18IAR8IhuFQiCJIhx8Ih0gFoVCKIkiFiAbfCAQfCIbfCABfCIeIBUgGHwiFSAXIBogFIVCAYkiFCAgfCATfCIYhUIgiSIXfCIaIBSFQiiJIhQgGHwgCXwiGCAXhUIwiSIXhUIgiSIgIB8gISAVIA6FQgGJIg4gGXwgCnwiFYVCIIkiGXwiHyAOhUIoiSIOIBV8IA18IhUgGYVCMIkiGSAffCIffCIhIA+FQiiJIg8gHnwgBXwiHiAghUIwiSIgICF8IiEgGyAchUIwiSIbIB18IhwgFoVCAYkiFiAYfCADfCIYIBmFQiCJIhkgJHwiHSAWhUIoiSIWIBh8IBJ8IhggGYVCMIkiGSAfIA6FQgGJIg4gInwgAnwiHyAbhUIgiSIbIBcgGnwiF3wiGiAOhUIoiSIOIB98IAZ8Ih8gG4VCMIkiGyAafCIaIA6FQgGJIg4gFSAXIBSFQgGJIhR8IAh8IhUgI4VCIIkiFyAcfCIcIBSFQiiJIhQgFXwgC3wiFXwgBXwiIoVCIIkiI3wiJCAOhUIoiSIOICJ8IAh8IiIgGiAgIBUgF4VCMIkiFSAcfCIXIBSFQgGJIhQgGHwgCXwiGIVCIIkiHHwiGiAUhUIoiSIUIBh8IAZ8IhggHIVCMIkiHCAafCIaIBSFQgGJIhR8IAR8IiAgGSAdfCIZIBUgISAPhUIBiSIPIB98IAN8Ih2FQiCJIhV8Ih8gD4VCKIkiDyAdfCACfCIdIBWFQjCJIhWFQiCJIiEgFyAbIBkgFoVCAYkiFiAefCABfCIZhUIgiSIbfCIXIBaFQiiJIhYgGXwgE3wiGSAbhUIwiSIbIBd8Ihd8Ih4gFIVCKIkiFCAgfCAMfCIgICGFQjCJIiEgHnwiHiAiICOFQjCJIiIgJHwiIyAOhUIBiSIOIB18IBJ8Ih0gG4VCIIkiGyAafCIaIA6FQiiJIg4gHXwgC3wiHSAbhUIwiSIbIBcgFoVCAYkiFiAYfCANfCIXICKFQiCJIhggFSAffCIVfCIfIBaFQiiJIhYgF3wgEHwiFyAYhUIwiSIYIB98Ih8gFoVCAYkiFiAVIA+FQgGJIg8gGXwgCnwiFSAchUIgiSIZICN8IhwgD4VCKIkiDyAVfCAHfCIVfCASfCIihUIgiSIjfCIkIBaFQiiJIhYgInwgBXwiIiAjhUIwiSIjICR8IiQgFoVCAYkiFiAbIBp8IhogFSAZhUIwiSIVIB4gFIVCAYkiFCAXfCADfCIXhUIgiSIZfCIbIBSFQiiJIhQgF3wgB3wiF3wgAnwiHiAVIBx8IhUgGCAaIA6FQgGJIg4gIHwgC3wiGoVCIIkiGHwiHCAOhUIoiSIOIBp8IAR8IhogGIVCMIkiGIVCIIkiICAfICEgFSAPhUIBiSIPIB18IAZ8IhWFQiCJIh18Ih8gD4VCKIkiDyAVfCAKfCIVIB2FQjCJIh0gH3wiH3wiISAWhUIoiSIWIB58IAx8Ih4gIIVCMIkiICAhfCIhIBogFyAZhUIwiSIXIBt8IhkgFIVCAYkiFHwgEHwiGiAdhUIgiSIbICR8Ih0gFIVCKIkiFCAafCAJfCIaIBuFQjCJIhsgHyAPhUIBiSIPICJ8IBN8Ih8gF4VCIIkiFyAYIBx8Ihh8IhwgD4VCKIkiDyAffCABfCIfIBeFQjCJIhcgHHwiHCAPhUIBiSIPIBggDoVCAYkiDiAVfCAIfCIVICOFQiCJIhggGXwiGSAOhUIoiSIOIBV8IA18IhV8IA18IiKFQiCJIiN8IiQgD4VCKIkiDyAifCAMfCIiICOFQjCJIiMgJHwiJCAPhUIBiSIPIBsgHXwiGyAVIBiFQjCJIhUgISAWhUIBiSIWIB98IBB8IhiFQiCJIh18Ih8gFoVCKIkiFiAYfCAIfCIYfCASfCIhIBUgGXwiFSAXIBsgFIVCAYkiFCAefCAHfCIZhUIgiSIXfCIbIBSFQiiJIhQgGXwgAXwiGSAXhUIwiSIXhUIgiSIeIBwgICAVIA6FQgGJIg4gGnwgAnwiFYVCIIkiGnwiHCAOhUIoiSIOIBV8IAV8IhUgGoVCMIkiGiAcfCIcfCIgIA+FQiiJIg8gIXwgBHwiISAehUIwiSIeICB8IiAgGCAdhUIwiSIYIB98Ih0gFoVCAYkiFiAZfCAGfCIZIBqFQiCJIhogJHwiHyAWhUIoiSIWIBl8IBN8IhkgGoVCMIkiGiAcIA6FQgGJIg4gInwgCXwiHCAYhUIgiSIYIBcgG3wiF3wiGyAOhUIoiSIOIBx8IAN8IhwgGIVCMIkiGCAbfCIbIA6FQgGJIg4gFSAXIBSFQgGJIhR8IAt8IhUgI4VCIIkiFyAdfCIdIBSFQiiJIhQgFXwgCnwiFXwgBHwiIoVCIIkiI3wiJCAOhUIoiSIOICJ8IAl8IiIgGyAeIBUgF4VCMIkiFSAdfCIXIBSFQgGJIhQgGXwgDHwiGYVCIIkiHXwiGyAUhUIoiSIUIBl8IAp8IhkgHYVCMIkiHSAbfCIbIBSFQgGJIhR8IAN8Ih4gGiAffCIaIBUgICAPhUIBiSIPIBx8IAd8IhyFQiCJIhV8Ih8gD4VCKIkiDyAcfCAQfCIcIBWFQjCJIhWFQiCJIiAgFyAYIBogFoVCAYkiFiAhfCATfCIahUIgiSIYfCIXIBaFQiiJIhYgGnwgDXwiGiAYhUIwiSIYIBd8Ihd8IiEgFIVCKIkiFCAefCAFfCIeICCFQjCJIiAgIXwiISAiICOFQjCJIiIgJHwiIyAOhUIBiSIOIBx8IAt8IhwgGIVCIIkiGCAbfCIbIA6FQiiJIg4gHHwgEnwiHCAYhUIwiSIYIBcgFoVCAYkiFiAZfCABfCIXICKFQiCJIhkgFSAffCIVfCIfIBaFQiiJIhYgF3wgBnwiFyAZhUIwiSIZIB98Ih8gFoVCAYkiFiAVIA+FQgGJIg8gGnwgCHwiFSAdhUIgiSIaICN8Ih0gD4VCKIkiDyAVfCACfCIVfCANfCIihUIgiSIjfCIkIBaFQiiJIhYgInwgCXwiIiAjhUIwiSIjICR8IiQgFoVCAYkiFiAYIBt8IhggFSAahUIwiSIVICEgFIVCAYkiFCAXfCASfCIXhUIgiSIafCIbIBSFQiiJIhQgF3wgCHwiF3wgB3wiISAVIB18IhUgGSAYIA6FQgGJIg4gHnwgBnwiGIVCIIkiGXwiHSAOhUIoiSIOIBh8IAt8IhggGYVCMIkiGYVCIIkiHiAfICAgFSAPhUIBiSIPIBx8IAp8IhWFQiCJIhx8Ih8gD4VCKIkiDyAVfCAEfCIVIByFQjCJIhwgH3wiH3wiICAWhUIoiSIWICF8IAN8IiEgHoVCMIkiHiAgfCIgIBggFyAahUIwiSIXIBt8IhogFIVCAYkiFHwgBXwiGCAchUIgiSIbICR8IhwgFIVCKIkiFCAYfCABfCIYIBuFQjCJIhsgHyAPhUIBiSIPICJ8IAx8Ih8gF4VCIIkiFyAZIB18Ihl8Ih0gD4VCKIkiDyAffCATfCIfIBeFQjCJIhcgHXwiHSAPhUIBiSIPIBkgDoVCAYkiDiAVfCAQfCIVICOFQiCJIhkgGnwiGiAOhUIoiSIOIBV8IAJ8IhV8IBN8IiKFQiCJIiN8IiQgD4VCKIkiDyAifCASfCIiICOFQjCJIiMgJHwiJCAPhUIBiSIPIBsgHHwiGyAVIBmFQjCJIhUgICAWhUIBiSIWIB98IAt8IhmFQiCJIhx8Ih8gFoVCKIkiFiAZfCACfCIZfCAJfCIgIBUgGnwiFSAXIBsgFIVCAYkiFCAhfCAFfCIahUIgiSIXfCIbIBSFQiiJIhQgGnwgA3wiGiAXhUIwiSIXhUIgiSIhIB0gHiAVIA6FQgGJIg4gGHwgEHwiFYVCIIkiGHwiHSAOhUIoiSIOIBV8IAF8IhUgGIVCMIkiGCAdfCIdfCIeIA+FQiiJIg8gIHwgDXwiICAhhUIwiSIhIB58Ih4gGSAchUIwiSIZIB98IhwgFoVCAYkiFiAafCAIfCIaIBiFQiCJIhggJHwiHyAWhUIoiSIWIBp8IAp8IhogGIVCMIkiGCAdIA6FQgGJIg4gInwgBHwiHSAZhUIgiSIZIBcgG3wiF3wiGyAOhUIoiSIOIB18IAd8Ih0gGYVCMIkiGSAbfCIbIA6FQgGJIg4gFSAXIBSFQgGJIhR8IAx8IhUgI4VCIIkiFyAcfCIcIBSFQiiJIhQgFXwgBnwiFXwgEnwiIoVCIIkiI3wiJCAOhUIoiSIOICJ8IBN8IiIgGyAhIBUgF4VCMIkiFSAcfCIXIBSFQgGJIhQgGnwgBnwiGoVCIIkiHHwiGyAUhUIoiSIUIBp8IBB8IhogHIVCMIkiHCAbfCIbIBSFQgGJIhR8IA18IiEgGCAffCIYIBUgHiAPhUIBiSIPIB18IAJ8Ih2FQiCJIhV8Ih4gD4VCKIkiDyAdfCABfCIdIBWFQjCJIhWFQiCJIh8gFyAZIBggFoVCAYkiFiAgfCADfCIYhUIgiSIZfCIXIBaFQiiJIhYgGHwgBHwiGCAZhUIwiSIZIBd8Ihd8IiAgFIVCKIkiFCAhfCAIfCIhIB+FQjCJIh8gIHwiICAiICOFQjCJIiIgJHwiIyAOhUIBiSIOIB18IAd8Ih0gGYVCIIkiGSAbfCIbIA6FQiiJIg4gHXwgDHwiHSAZhUIwiSIZIBcgFoVCAYkiFiAafCALfCIXICKFQiCJIhogFSAefCIVfCIeIBaFQiiJIhYgF3wgCXwiFyAahUIwiSIaIB58Ih4gFoVCAYkiFiAVIA+FQgGJIg8gGHwgBXwiFSAchUIgiSIYICN8IhwgD4VCKIkiDyAVfCAKfCIVfCACfCIChUIgiSIifCIjIBaFQiiJIhYgAnwgC3wiAiAihUIwiSILICN8IiIgFoVCAYkiFiAZIBt8IhkgFSAYhUIwiSIVICAgFIVCAYkiFCAXfCANfCINhUIgiSIXfCIYIBSFQiiJIhQgDXwgBXwiBXwgEHwiECAVIBx8Ig0gGiAZIA6FQgGJIg4gIXwgDHwiDIVCIIkiFXwiGSAOhUIoiSIOIAx8IBJ8IhIgFYVCMIkiDIVCIIkiFSAeIB8gDSAPhUIBiSINIB18IAl8IgmFQiCJIg98IhogDYVCKIkiDSAJfCAIfCIJIA+FQjCJIgggGnwiD3wiGiAWhUIoiSIWIBB8IAd8IhAgEYUgDCAZfCIHIA6FQgGJIgwgCXwgCnwiCiALhUIgiSILIAUgF4VCMIkiBSAYfCIJfCIOIAyFQiiJIgwgCnwgE3wiEyALhUIwiSIKIA58IguFNwOAiQFBACADIAYgDyANhUIBiSINIAJ8fCICIAWFQiCJIgUgB3wiBiANhUIoiSIHIAJ8fCICQQApA4iJAYUgBCABIBIgCSAUhUIBiSIDfHwiASAIhUIgiSISICJ8IgkgA4VCKIkiAyABfHwiASAShUIwiSIEIAl8IhKFNwOIiQFBACATQQApA5CJAYUgECAVhUIwiSIQIBp8IhOFNwOQiQFBACABQQApA5iJAYUgAiAFhUIwiSICIAZ8IgGFNwOYiQFBACASIAOFQgGJQQApA6CJAYUgAoU3A6CJAUEAIBMgFoVCAYlBACkDqIkBhSAKhTcDqIkBQQAgASAHhUIBiUEAKQOwiQGFIASFNwOwiQFBACALIAyFQgGJQQApA7iJAYUgEIU3A7iJAQvdAgUBfwF+AX8BfgJ/IwBBwABrIgAkAAJAQQApA9CJAUIAUg0AQQBBACkDwIkBIgFBACgC4IoBIgKsfCIDNwPAiQFBAEEAKQPIiQEgAyABVK18NwPIiQECQEEALQDoigFFDQBBAEJ/NwPYiQELQQBCfzcD0IkBAkAgAkH/AEoNAEEAIQQDQCACIARqQeCJAWpBADoAACAEQQFqIgRBgAFBACgC4IoBIgJrSA0ACwtB4IkBEAIgAEEAKQOAiQE3AwAgAEEAKQOIiQE3AwggAEEAKQOQiQE3AxAgAEEAKQOYiQE3AxggAEEAKQOgiQE3AyAgAEEAKQOoiQE3AyggAEEAKQOwiQE3AzAgAEEAKQO4iQE3AzhBACgC5IoBIgVBAUgNAEEAIQRBACECA0AgBEGACWogACAEai0AADoAACAEQQFqIQQgBSACQQFqIgJB/wFxSg0ACwsgAEHAAGokAAv9AwMBfwF+AX8jAEGAAWsiAiQAQQBBgQI7AfKKAUEAIAE6APGKAUEAIAA6APCKAUGQfiEAA0AgAEGAiwFqQgA3AAAgAEH4igFqQgA3AAAgAEHwigFqQgA3AAAgAEEYaiIADQALQQAhAEEAQQApA/CKASIDQoiS853/zPmE6gCFNwOAiQFBAEEAKQP4igFCu86qptjQ67O7f4U3A4iJAUEAQQApA4CLAUKr8NP0r+68tzyFNwOQiQFBAEEAKQOIiwFC8e30+KWn/aelf4U3A5iJAUEAQQApA5CLAULRhZrv+s+Uh9EAhTcDoIkBQQBBACkDmIsBQp/Y+dnCkdqCm3+FNwOoiQFBAEEAKQOgiwFC6/qG2r+19sEfhTcDsIkBQQBBACkDqIsBQvnC+JuRo7Pw2wCFNwO4iQFBACADp0H/AXE2AuSKAQJAIAFBAUgNACACQgA3A3ggAkIANwNwIAJCADcDaCACQgA3A2AgAkIANwNYIAJCADcDUCACQgA3A0ggAkIANwNAIAJCADcDOCACQgA3AzAgAkIANwMoIAJCADcDICACQgA3AxggAkIANwMQIAJCADcDCCACQgA3AwBBACEEA0AgAiAAaiAAQYAJai0AADoAACAAQQFqIQAgBEEBaiIEQf8BcSABSA0ACyACQYABEAELIAJBgAFqJAALEgAgAEEDdkH/P3EgAEEQdhAECwkAQYAJIAAQAQsGAEGAiQELGwAgAUEDdkH/P3EgAUEQdhAEQYAJIAAQARADCwsLAQBBgAgLBPAAAAA=", yt = "c6f286e6", kt = {
  name: Et,
  data: pt,
  hash: yt
};
new D();
function de(e) {
  return !Number.isInteger(e) || e < 8 || e > 512 || e % 8 !== 0 ? new Error("Invalid variant! Valid values: 8, 16, ..., 512") : null;
}
function St(e, t) {
  return e | t << 16;
}
function fe(e = 512, t = null) {
  if (de(e))
    return Promise.reject(de(e));
  let A = null, i = e;
  if (t !== null) {
    if (A = v(t), A.length > 64)
      return Promise.reject(new Error("Max key length is 64 bytes"));
    i = St(e, A.length);
  }
  const r = e / 8;
  return me(kt, r).then((n) => {
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
function Dt(e, t, A) {
  const i = [
    `m=${t.memorySize}`,
    `t=${t.iterations}`,
    `p=${t.parallelism}`
  ].join(",");
  return `$argon2${t.hashType}$v=19$${i}$${Be(e, !1)}$${Be(A, !1)}`;
}
const Ee = new DataView(new ArrayBuffer(4));
function x(e) {
  return Ee.setInt32(0, e, !0), new Uint8Array(Ee.buffer);
}
function le(e, t, A) {
  return R(this, void 0, void 0, function* () {
    if (A <= 64) {
      const g = yield fe(A * 8);
      return g.update(x(A)), g.update(t), g.digest("binary");
    }
    const i = Math.ceil(A / 32) - 2, r = new Uint8Array(A);
    e.init(), e.update(x(A)), e.update(t);
    let n = e.digest("binary");
    r.set(n.subarray(0, 32), 0);
    for (let g = 1; g < i; g++)
      e.init(), e.update(n), n = e.digest("binary"), r.set(n.subarray(0, 32), g * 32);
    const o = A - 32 * i;
    let a;
    return o === 64 ? (a = e, a.init()) : a = yield fe(o * 8), a.update(n), n = a.digest("binary"), r.set(n.subarray(0, o), i * 32), r;
  });
}
function Ft(e) {
  switch (e) {
    case "d":
      return 0;
    case "i":
      return 1;
    default:
      return 2;
  }
}
function Ut(e) {
  return R(this, void 0, void 0, function* () {
    var t;
    const { parallelism: A, iterations: i, hashLength: r } = e, n = v(e.password), o = v(e.salt), a = 19, g = Ft(e.hashType), { memorySize: s } = e, k = v((t = e.secret) !== null && t !== void 0 ? t : ""), [y, w] = yield Promise.all([
      me(dt, 1024),
      fe(512)
    ]);
    y.setMemorySize(s * 1024 + 1024);
    const b = new Uint8Array(24), Q = new DataView(b.buffer);
    Q.setInt32(0, A, !0), Q.setInt32(4, r, !0), Q.setInt32(8, s, !0), Q.setInt32(12, i, !0), Q.setInt32(16, a, !0), Q.setInt32(20, g, !0), y.writeMemory(b, s * 1024), w.init(), w.update(b), w.update(x(n.length)), w.update(n), w.update(x(o.length)), w.update(o), w.update(x(k.length)), w.update(k), w.update(x(0));
    const B = Math.floor(s / (A * 4)) * 4, C = new Uint8Array(72), K = w.digest("binary");
    C.set(K);
    for (let d = 0; d < A; d++) {
      C.set(x(0), 64), C.set(x(d), 68);
      let l = d * B, I = yield le(w, C, 1024);
      y.writeMemory(I, l * 1024), l += 1, C.set(x(1), 64), I = yield le(w, C, 1024), y.writeMemory(I, l * 1024);
    }
    const p = new Uint8Array(1024);
    Ue(p, y.calculate(new Uint8Array([]), s));
    const F = yield le(w, p, r);
    if (e.outputType === "hex") {
      const d = new Uint8Array(r * 2);
      return ue(d, F, r);
    }
    return e.outputType === "encoded" ? Dt(o, e, F) : F;
  });
}
const mt = (e) => {
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
function be(e) {
  return R(this, void 0, void 0, function* () {
    return mt(e), Ut(Object.assign(Object.assign({}, e), { hashType: "id" }));
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
const bt = 32;
async function iA(e, t, A = We) {
  Gt(A);
  try {
    const i = await be({
      password: e,
      salt: t,
      iterations: A.tCost,
      memorySize: A.mCost,
      parallelism: A.pCost,
      hashLength: bt,
      outputType: "binary"
    });
    return Se(i);
  } catch {
    throw new Error("Key derivation failed");
  }
}
function Gt(e) {
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
async function Kt() {
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
function Ht(e) {
  return e === "localhost" || e === "127.0.0.1" || e.endsWith(".localhost");
}
function Ge(e) {
  if (typeof window > "u")
    return;
  const t = window.location.hostname;
  if (!Ht(t))
    throw new Error(
      "[Cedros] WebAuthn RP domain validation is not configured. Set wallet.allowedRpDomains to a non-empty list of allowed domains."
    );
}
function Ae() {
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator.credentials < "u";
}
async function Jt() {
  if (!Ae())
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
  if (!Ae())
    throw new Error("WebAuthn is not available in this browser");
  Ge();
  const n = i ?? nt(), o = await navigator.credentials.create({
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
  const g = a.prf?.results?.first;
  if (!g)
    throw new Error("PRF extension did not return a result");
  const s = new Uint8Array(g);
  if (s.length !== 32)
    throw new Error(
      `Unexpected PRF output length: expected 32 bytes, got ${s.length}. The authenticator may not be compatible.`
    );
  return {
    credentialId: ee(new Uint8Array(o.rawId)),
    prfSalt: ee(n),
    prfOutput: s
  };
}
async function nA(e, t) {
  if (!Ae())
    throw new Error("WebAuthn is not available in this browser");
  Ge();
  const A = It(e), i = await navigator.credentials.get({
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
async function Mt() {
  const [e, t, A, i, r, n, o] = await Promise.all([
    Vt(),
    Pt(),
    gt(),
    Nt(),
    Promise.resolve(Ae()),
    Jt(),
    Kt()
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
async function Vt() {
  try {
    return typeof crypto < "u" && typeof crypto.subtle < "u" && typeof crypto.getRandomValues == "function";
  } catch {
    return !1;
  }
}
async function Pt() {
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
async function Nt() {
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
let z = null, ce = null;
const Yt = 6e4;
async function Ot(e = !1) {
  const t = Date.now(), A = ce === null || t - ce > Yt;
  return !e && !(typeof window > "u") && !A && z !== null || (z = await Mt(), ce = Date.now()), z;
}
function xt(e) {
  switch (e.type) {
    case "password":
      return { password: e.password };
    case "prfOutput":
      return { prfOutput: e.prfOutput };
  }
}
function vt() {
  const e = ye(), [t, A] = U(!1), [i, r] = U(null), n = e?.config.serverUrl, o = e?.config.requestTimeout, a = e?.config.retryAttempts, g = e?._internal?.getAccessToken, s = V(() => e ? new pe({
    baseUrl: n,
    timeoutMs: o,
    retryAttempts: a,
    getAccessToken: g
  }) : null, [e, n, o, a, g]), k = E(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      return await s.get("/wallet/status");
    } catch (I) {
      const c = M(I, "Failed to fetch wallet status");
      throw r(c.message), c;
    } finally {
      A(!1);
    }
  }, [s]), y = E(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      return await s.get("/wallet/material");
    } catch (I) {
      const c = M(I, "Failed to fetch wallet material");
      if (c.code === "NOT_FOUND")
        return null;
      throw r(c.message), c;
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
      } catch (c) {
        const f = M(c, "Failed to enroll wallet");
        throw r(f.message), f;
      } finally {
        A(!1);
      }
    },
    [s]
  ), b = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        await s.post("/wallet/recover", I);
      } catch (c) {
        const f = M(c, "Failed to recover wallet");
        throw r(f.message), f;
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
        return await s.post("/wallet/sign", I);
      } catch (c) {
        const f = M(c, "Failed to sign transaction");
        throw r(f.message), f;
      } finally {
        A(!1);
      }
    },
    [s]
  ), u = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        await s.post("/wallet/rotate-user-secret", I);
      } catch (c) {
        const f = M(c, "Failed to rotate user secret");
        throw r(f.message), f;
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
      } catch (c) {
        const f = M(c, "Failed to unlock wallet");
        throw r(f.message), f;
      } finally {
        A(!1);
      }
    },
    [s]
  ), C = E(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      await s.post("/wallet/lock", {});
    } catch (I) {
      const c = M(I, "Failed to lock wallet");
      throw r(c.message), c;
    } finally {
      A(!1);
    }
  }, [s]), K = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        return await s.post("/wallet/share-b", I);
      } catch (c) {
        const f = M(c, "Failed to get Share B for recovery");
        throw r(f.message), f;
      } finally {
        A(!1);
      }
    },
    [s]
  ), p = E(
    async (I) => {
      if (!s)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        return await s.post("/wallet/derived", I);
      } catch (c) {
        const f = M(c, "Failed to create derived wallet");
        throw r(f.message), f;
      } finally {
        A(!1);
      }
    },
    [s]
  ), F = E(async () => {
    if (!s)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      return await s.get("/wallet/derived");
    } catch (I) {
      const c = M(I, "Failed to list wallets");
      throw r(c.message), c;
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
      } catch (c) {
        const f = M(c, "Failed to delete derived wallet");
        throw r(f.message), f;
      } finally {
        A(!1);
      }
    },
    [s]
  ), l = E(() => r(null), []);
  return {
    getStatus: k,
    getMaterial: y,
    enroll: w,
    recover: b,
    signTransaction: Q,
    rotateUserSecret: u,
    unlock: B,
    lock: C,
    getShareBForRecovery: K,
    createDerivedWallet: p,
    listAllWallets: F,
    deleteDerivedWallet: d,
    isLoading: t,
    error: i,
    clearError: l
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
  const t = ye() !== null, [A, i] = U("loading"), [r, n] = U(null), [o, a] = U(null), [g, s] = U(!1), [k, y] = U(!1), [w, b] = U(null), [Q, u] = U(null), { getStatus: B, isLoading: C } = vt(), K = N(!1);
  O(() => {
    if (!t) return;
    let d = !1;
    return (async () => {
      try {
        const I = await Ot();
        if (d) return;
        b(I), I.allSupported || (i("error"), u(
          "Your browser or device does not support all required features. Please use a modern browser with a platform authenticator."
        ));
      } catch {
        if (d) return;
        b(null), i("error"), u("Failed to check crypto capabilities");
      }
    })(), () => {
      d = !0;
    };
  }, [t]);
  const p = E(async () => {
    if (!(!t || !w?.allSupported)) {
      i("loading"), u(null);
      try {
        const d = await B();
        n(d.solanaPubkey ?? null), a(d.authMethod ?? null), s(d.hasExternalWallet), y(d.unlocked), d.hasExternalWallet ? i("enrolled_unlocked") : d.enrolled ? i(d.unlocked ? "enrolled_unlocked" : "enrolled_locked") : i("not_enrolled");
      } catch (d) {
        i("error"), u(d instanceof Error ? d.message : "Failed to fetch wallet status");
      }
    }
  }, [t, w?.allSupported, B]);
  O(() => {
    t && w?.allSupported && !C && !K.current && (K.current = !0, p());
  }, [t, w?.allSupported, C, p]);
  const F = E(() => u(null), []);
  return t ? {
    status: A,
    solanaPubkey: r,
    authMethod: o,
    hasExternalWallet: g,
    isUnlocked: k,
    capabilities: w,
    isSupported: w?.allSupported ?? !1,
    error: Q,
    refresh: p,
    clearError: F
  } : Tt;
}
const ie = "__CEDROS_EMBEDDED_WALLET__";
function Lt(e) {
  typeof window < "u" && (window[ie] = e);
}
function Ce() {
  typeof window < "u" && delete window[ie];
}
function IA() {
  return typeof window > "u" ? !1 : window[ie]?.available ?? !1;
}
function aA() {
  return typeof window > "u" ? null : window[ie] ?? null;
}
function Xt() {
  const { config: e, user: t } = ke(), { status: A, solanaPubkey: i, hasExternalWallet: r } = Rt(), n = e.wallet?.exposeAvailability ?? !1, o = e.wallet?.exposePublicKey ?? !1;
  return O(() => {
    if (!n || !t) {
      Ce();
      return;
    }
    if (r) {
      Ce();
      return;
    }
    if (A === "loading")
      return;
    const a = A === "enrolled_locked" || A === "enrolled_unlocked";
    return Lt({
      available: a,
      publicKey: o && a ? i : null
    }), () => {
      Ce();
    };
  }, [n, o, t, A, i, r]), null;
}
function gA({ config: e, children: t }) {
  const [A, i] = U(null), [r, n] = U(!1), o = N(e.callbacks);
  o.current = e.callbacks;
  const a = N({
    onLoginSuccess: (...L) => o.current?.onLoginSuccess?.(...L),
    onLoginError: (...L) => o.current?.onLoginError?.(...L),
    onLogout: () => o.current?.onLogout?.(),
    onSessionExpired: () => o.current?.onSessionExpired?.()
  }), g = e.features === "auto", {
    features: s,
    googleClientId: k,
    appleClientId: y,
    socialButtonOrder: w,
    isLoading: b
  } = Ye(
    e.serverUrl,
    g,
    e.requestTimeout
  ), Q = V(() => !g || !s ? e : {
    ...e,
    features: s,
    googleClientId: e.googleClientId ?? k,
    appleClientId: e.appleClientId ?? y
  }, [e, g, s, k, y]), u = V(
    () => JSON.stringify(Q.themeOverrides ?? null),
    [Q.themeOverrides]
  ), B = V(() => JSON.stringify(Q.session ?? null), [Q.session]), C = V(() => JSON.stringify(Q.features ?? null), [Q.features]), K = V(() => JSON.stringify(Q.forms ?? null), [Q.forms]), p = V(
    () => Q,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Using serialized keys for deep comparison; callbacks excluded (see UI-06)
    [
      Q.serverUrl,
      Q.googleClientId,
      Q.appleClientId,
      Q.requestTimeout,
      Q.retryAttempts,
      Q.theme,
      u,
      B,
      C,
      K
    ]
  );
  Pe({
    theme: p.theme,
    themeOverrides: p.themeOverrides
  });
  const {
    user: F,
    authState: d,
    handleLoginSuccess: l,
    logout: I,
    refreshUser: c,
    getAccessToken: f
  } = Xe({
    serverUrl: p.serverUrl,
    session: p.session,
    callbacks: a.current,
    requestTimeoutMs: p.requestTimeout
  }), h = E(async () => {
    i(null), await I();
  }, [I]), S = E(
    (...L) => {
      i(null), l(...L);
    },
    [l]
  ), G = E(() => n(!0), []), H = E(() => n(!1), []), m = V(
    () => ({
      config: p,
      user: F,
      authState: d,
      logout: h,
      refreshUser: c,
      socialButtonOrder: g ? w : void 0,
      _internal: {
        handleLoginSuccess: S,
        getAccessToken: f
      }
    }),
    [p, F, d, h, c, g, w, S, f]
  ), J = V(
    () => ({
      error: A,
      isModalOpen: r,
      openModal: G,
      closeModal: H
    }),
    [A, r, G, H]
  ), Y = V(
    () => ({ ...m, ...J }),
    [m, J]
  );
  return g && b ? null : /* @__PURE__ */ oe(Je.Provider, { value: m, children: /* @__PURE__ */ oe(Me.Provider, { value: J, children: /* @__PURE__ */ He(Ve.Provider, { value: Y, children: [
    /* @__PURE__ */ oe(Xt, {}),
    t
  ] }) }) });
}
function lA() {
  const { user: e, authState: t, error: A, logout: i, refreshUser: r, openModal: n, closeModal: o } = ke();
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
  We as D,
  zt as a,
  tA as b,
  ee as c,
  iA as d,
  De as e,
  _t as f,
  $t as g,
  et as h,
  oA as i,
  sA as j,
  vt as k,
  nt as l,
  nA as m,
  AA as n,
  xt as o,
  It as p,
  Rt as q,
  rA as r,
  IA as s,
  Se as t,
  lA as u,
  Gt as v,
  eA as w,
  aA as x
};
