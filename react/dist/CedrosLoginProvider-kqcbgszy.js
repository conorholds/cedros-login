import { jsx as ee, jsxs as Me } from "react/jsx-runtime";
import { useMemo as v, useEffect as P, useState as D, useRef as O, useCallback as d } from "react";
import { A as ke, g as Ie, c as De, h as V, u as Ne, d as Pe, e as Ye, C as xe } from "./useCedrosLogin-fUZvc4r9.js";
const gA = "CEDROS_FEATURE_", _ = {
  email: {
    name: "email",
    description: "Enable email/password authentication.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_EMAIL",
    autoDiscoverable: !0
  },
  google: {
    name: "google",
    description: "Enable Google OAuth authentication.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_GOOGLE",
    autoDiscoverable: !0
  },
  apple: {
    name: "apple",
    description: "Enable Apple Sign In authentication.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_APPLE",
    autoDiscoverable: !0
  },
  solana: {
    name: "solana",
    description: "Enable Solana wallet authentication.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_SOLANA",
    autoDiscoverable: !0
  },
  webauthn: {
    name: "webauthn",
    description: "Enable passkey authentication.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_WEBAUTHN",
    autoDiscoverable: !0
  },
  instantLink: {
    name: "instantLink",
    description: "Enable passwordless instant-link sign-in.",
    defaultEnabled: !1,
    status: "experimental",
    envVar: "CEDROS_FEATURE_INSTANT_LINK",
    autoDiscoverable: !0
  },
  walletEnrollment: {
    name: "walletEnrollment",
    description: "Enable embedded wallet auto-enrollment after registration.",
    defaultEnabled: !0,
    status: "stable",
    envVar: "CEDROS_FEATURE_WALLET_ENROLLMENT",
    autoDiscoverable: !1
  }
}, Re = /* @__PURE__ */ new Set(["1", "true", "yes", "on"]), Te = /* @__PURE__ */ new Set(["0", "false", "no", "off"]);
function lA(e) {
  return _[e];
}
function Ue() {
  return Object.values(_);
}
function cA(e) {
  return _[e].envVar;
}
function Le(e) {
  if (typeof e == "boolean") return e;
  if (typeof e != "string") return;
  const t = e.trim().toLowerCase();
  if (Re.has(t)) return !0;
  if (Te.has(t)) return !1;
}
function be() {
  return Object.fromEntries(
    Object.entries(_).map(([e, t]) => [
      e,
      t.defaultEnabled
    ])
  );
}
function Xe(e = _e()) {
  const t = {};
  for (const A of Ue()) {
    const i = Le(e?.[A.envVar]);
    i !== void 0 && (t[A.name] = i);
  }
  return t;
}
function me(e = {}) {
  const t = be(), A = Xe(e.env), i = { ...t };
  for (const r of Object.keys(_))
    i[r] = e.config?.[r] ?? A[r] ?? e.base?.[r] ?? t[r];
  return i;
}
function We(e, t = {}) {
  return t.flags ? t.flags[e] ?? _[e].defaultEnabled : me(t)[e];
}
function je() {
  return Ue().filter((e) => e.autoDiscoverable).map((e) => e.name);
}
function Ze() {
  const e = be(), t = {};
  for (const A of je())
    t[A] = e[A];
  return t;
}
function _e() {
  const e = globalThis.process;
  if (e?.env)
    return e.env;
  if (typeof process < "u" && process.env)
    return process.env;
}
let te = 0;
function qe({ theme: e, themeOverrides: t }) {
  const A = v(() => typeof window > "u" ? !1 : e === "dark" ? !0 : e === "light" ? !1 : window.matchMedia("(prefers-color-scheme: dark)").matches, [e]);
  P(() => {
    if (typeof document > "u") return;
    const n = document.documentElement;
    let s = !1;
    return A ? (te++, s = !0, n.classList.add("cedros-dark")) : te === 0 && n.classList.remove("cedros-dark"), () => {
      s && (te--, te === 0 && n.classList.remove("cedros-dark"));
    };
  }, [A]);
  const i = A ? "cedros-dark" : "", r = v(() => {
    if (!t) return {};
    const n = {};
    for (const [s, c] of Object.entries(t))
      c && (n[s] = c);
    return n;
  }, [t]);
  return { className: i, style: r };
}
const $e = Ze();
function ze(e, t, A) {
  const [i, r] = D(null), [n, s] = D(), [c, h] = D(), [o, p] = D(), [E, Q] = D(), [b, U] = D(), [f, B] = D(), [g, m] = D(t), y = O(!1);
  return P(() => {
    if (!t || y.current) return;
    y.current = !0, new ke({
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
      }), s(C.googleClientId), h(C.appleClientId), p(C.usernameEnabled), Q(C.walletEnrollEnabled), U(C.showRecoveryEnabled), B(C.socialButtonOrder);
    }).catch(() => {
      r($e);
    }).finally(() => {
      m(!1);
    });
  }, [t, e, A]), { features: i, googleClientId: n, appleClientId: c, usernameEnabled: o, walletEnrollEnabled: E, showRecoveryEnabled: b, socialButtonOrder: f, isLoading: g };
}
const et = "cedros_tokens", tt = 6e4;
class At {
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
  constructor(t = "cookie", A = et, i = {}) {
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
    const t = this.getTimeUntilExpiry(), A = Math.max(0, t - tt);
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
const it = "cedros_auth_sync";
class rt {
  channel = null;
  callback = null;
  boundHandler = null;
  constructor() {
    typeof window < "u" && "BroadcastChannel" in window && (this.channel = new BroadcastChannel(it), this.boundHandler = this.handleMessage.bind(this), this.channel.addEventListener("message", this.boundHandler));
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
function Ae(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = e;
  if (typeof t.user != "object" || t.user === null) return !1;
  const A = t.user;
  return typeof A.id == "string" && A.id.length > 0;
}
function nt(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = e;
  return typeof t.accessToken == "string" && t.accessToken.length > 0 && typeof t.refreshToken == "string" && t.refreshToken.length > 0 && typeof t.expiresIn == "number" && t.expiresIn > 0;
}
function ot({
  serverUrl: e,
  session: t,
  callbacks: A,
  requestTimeoutMs: i
}) {
  const [r, n] = D(null), [s, c] = D("idle"), h = O(null), o = O(null), p = O(A), E = O(!0), Q = O(null), b = O(() => Promise.resolve()), U = O(() => {
  });
  P(() => {
    p.current = A;
  }, [A]), P(() => (E.current = !0, () => {
    E.current = !1;
  }), []);
  const f = d((u) => {
    E.current && n(u);
  }, []), B = d((u) => {
    E.current && c(u);
  }, []), g = v(
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
  P(() => {
    const u = new At(g.storage, g.persistKey, {
      allowWebStorage: g.allowWebStorage
    });
    return h.current = u, g.autoRefresh && u.setRefreshCallback(() => b.current()), u.setSessionExpiredCallback(() => U.current()), g.syncTabs && (o.current = new rt()), () => {
      u.destroy(), h.current = null, o.current?.close();
    };
  }, [
    g.storage,
    g.syncTabs,
    g.persistKey,
    g.allowWebStorage,
    g.autoRefresh
  ]);
  const m = d(async () => {
    if (Q.current)
      return Q.current;
    const u = h.current?.getRefreshToken(), S = !!u, G = Ie(), H = {};
    S && (H["Content-Type"] = "application/json"), G && (H["X-CSRF-Token"] = G);
    let K, J;
    const M = new Promise((X, L) => {
      K = X, J = L;
    });
    Q.current = M, (async () => {
      const X = new AbortController(), L = i ?? 1e4, z = window.setTimeout(() => X.abort(), L);
      try {
        const x = await fetch(`${e}/refresh`, {
          method: "POST",
          headers: Object.keys(H).length > 0 ? H : void 0,
          credentials: "include",
          body: S ? JSON.stringify({ refreshToken: u }) : void 0,
          signal: X.signal
        });
        if (!x.ok)
          throw new Error("Token refresh failed");
        const W = await x.json();
        if (W.tokens) {
          if (!nt(W.tokens))
            throw new Error("Invalid token response structure");
          h.current?.setTokens(W.tokens);
        } else if (g.storage !== "cookie")
          throw new Error("Token refresh failed");
        o.current?.broadcastRefresh(), K();
      } catch (x) {
        throw J(x), x;
      } finally {
        window.clearTimeout(z);
      }
    })().catch(() => {
    });
    try {
      await M;
    } finally {
      Q.current = null;
    }
  }, [e, g.storage, i]), y = d(() => {
    if (g.storage === "cookie") return;
    const u = h.current?.getAccessToken();
    if (u)
      return { Authorization: `Bearer ${u}` };
  }, [g.storage]), k = d(() => {
    h.current?.clear(), f(null), B("unauthenticated"), p.current?.onSessionExpired?.();
  }, [B, f]);
  b.current = m, U.current = k;
  const C = d(
    (u) => {
      const S = new AbortController(), G = i ?? 1e4, H = window.setTimeout(() => S.abort(), G), K = {}, J = y();
      J && Object.assign(K, J);
      const M = Ie();
      return M && (K["X-CSRF-Token"] = M), {
        promise: fetch(u, {
          credentials: "include",
          headers: Object.keys(K).length > 0 ? K : void 0,
          signal: S.signal
        }),
        cleanup: () => window.clearTimeout(H)
      };
    },
    [y, i]
  ), a = d(async () => {
    const u = C(`${e}/user`);
    try {
      const S = await u.promise;
      if (S.ok) {
        const G = await S.json();
        if (Ae(G)) {
          f(G.user), B("authenticated");
          return;
        }
      }
      if (S.status === 401 && g.autoRefresh) {
        try {
          await m();
        } catch {
          k();
          return;
        }
        const G = C(`${e}/user`);
        try {
          const H = await G.promise;
          if (H.ok) {
            const K = await H.json();
            if (Ae(K)) {
              f(K.user), B("authenticated");
              return;
            }
          }
        } finally {
          G.cleanup();
        }
      }
      f(null), B("unauthenticated");
    } catch {
      f(null), B("unauthenticated");
    } finally {
      u.cleanup();
    }
  }, [
    e,
    g.autoRefresh,
    m,
    C,
    k,
    B,
    f
  ]);
  P(() => {
    !o.current || !g.syncTabs || o.current.setCallback((u) => {
      switch (u.type) {
        case "login":
          f(u.user), B("authenticated");
          break;
        case "logout":
          f(null), B("unauthenticated"), h.current?.clear();
          break;
        case "refresh":
          a();
          break;
        default:
          console.warn("[Cedros Login] Unhandled tab sync event:", u);
      }
    });
  }, [g.syncTabs, a, B, f]), P(() => {
    const u = new AbortController(), S = i ?? 1e4, G = window.setTimeout(() => u.abort(), S);
    return (async () => {
      B("loading");
      try {
        const K = await fetch(`${e}/user`, {
          credentials: "include",
          headers: y(),
          signal: u.signal
        });
        if (K.ok) {
          const J = await K.json();
          if (Ae(J)) {
            f(J.user), B("authenticated");
            return;
          }
        }
        if (K.status === 401 && g.autoRefresh) {
          try {
            await m();
          } catch {
            k();
            return;
          }
          const J = await fetch(`${e}/user`, {
            credentials: "include",
            headers: y(),
            signal: u.signal
          });
          if (J.ok) {
            const M = await J.json();
            if (Ae(M)) {
              f(M.user), B("authenticated");
              return;
            }
          }
        }
        f(null), B("unauthenticated");
      } catch {
        f(null), B("unauthenticated");
      }
    })(), () => {
      window.clearTimeout(G), u.abort();
    };
  }, [
    e,
    g.autoRefresh,
    m,
    y,
    k,
    B,
    f,
    i
  ]);
  const I = d(
    (u, S) => {
      f(u), B("authenticated"), S && h.current?.setTokens(S), E.current && o.current?.broadcastLogin(u);
    },
    [f, B]
  ), l = d(async () => {
    const u = Ie(), S = new AbortController(), G = i ?? 1e4, H = window.setTimeout(() => S.abort(), G);
    try {
      await fetch(`${e}/logout`, {
        method: "POST",
        headers: {
          ...u ? { "X-CSRF-Token": u } : {},
          ...y() ?? {}
        },
        credentials: "include",
        signal: S.signal
      });
    } catch {
    } finally {
      window.clearTimeout(H), f(null), B("unauthenticated"), h.current?.clear(), o.current?.broadcastLogout(), p.current?.onLogout?.();
    }
  }, [e, y, f, B, i]), w = d(() => h.current?.getAccessToken() ?? null, []);
  return {
    user: r,
    authState: s,
    handleLoginSuccess: I,
    logout: l,
    refreshUser: a,
    getAccessToken: w
  };
}
const st = {
  mCost: 19456,
  // 19 MiB
  tCost: 2,
  pCost: 1
};
function It(e) {
  return e.length === 16;
}
function at(e) {
  if (e.length === 16) return !0;
  if (e.length < 18) return !1;
  const t = e[0];
  return t === 0 || t === 1 || t === 128 || t === 8;
}
function gt(e) {
  return e.length === 32;
}
function lt(e) {
  return e.length === 12;
}
function ct(e) {
  return e.length >= 16;
}
function Ct(e) {
  return e.length === 32;
}
function ht(e) {
  if (!It(e))
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  return e;
}
function CA(e) {
  if (!at(e))
    throw new Error(`Invalid share length: expected >=16, got ${e.length}`);
  return e;
}
function Ge(e) {
  if (!gt(e))
    throw new Error(`Invalid key length: expected 32, got ${e.length}`);
  return e;
}
function ut(e) {
  if (!lt(e))
    throw new Error(`Invalid nonce length: expected 12, got ${e.length}`);
  return e;
}
function ft(e) {
  if (!ct(e))
    throw new Error(`Invalid salt length: expected >=16, got ${e.length}`);
  return e;
}
function wt(e) {
  if (!Ct(e))
    throw new Error(`Invalid PRF salt length: expected 32, got ${e.length}`);
  return e;
}
function Z(e) {
  return new Uint8Array(e);
}
function ne(e) {
  if (typeof crypto > "u" || !crypto.getRandomValues)
    throw new Error(
      "WebCrypto API not available. Secure random generation requires a modern browser."
    );
  const t = new Uint8Array(e);
  return crypto.getRandomValues(t), t;
}
function hA() {
  return ht(ne(16));
}
function Qt() {
  return ut(ne(12));
}
function uA() {
  return ft(ne(16));
}
function fA() {
  return wt(ne(32));
}
function Ke(e) {
  if (!(!e || e.length === 0)) {
    if (typeof globalThis.crypto?.getRandomValues == "function")
      globalThis.crypto.getRandomValues(e);
    else
      for (let t = 0; t < e.length; t++)
        e[t] = t * 90 & 255;
    e.fill(0);
  }
}
function wA(...e) {
  for (const t of e)
    t && Ke(t);
}
async function Bt(e) {
  return crypto.subtle.importKey(
    "raw",
    Z(e),
    { name: "AES-GCM", length: 256 },
    !1,
    // not extractable
    ["encrypt", "decrypt"]
  );
}
async function dt(e, t, A) {
  const i = A ?? Qt(), r = await Bt(t), n = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: Z(i) },
    r,
    Z(e)
  );
  return {
    ciphertext: new Uint8Array(n),
    nonce: i
  };
}
async function QA(e, t) {
  const A = await dt(e, t);
  return {
    ciphertext: de(A.ciphertext),
    nonce: de(A.nonce)
  };
}
function de(e) {
  const A = [];
  for (let i = 0; i < e.length; i += 32768) {
    const r = e.subarray(i, Math.min(i + 32768, e.length));
    A.push(String.fromCharCode(...r));
  }
  return btoa(A.join(""));
}
function Et(e) {
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
async function pt(e, t, A, i = 32) {
  const r = await crypto.subtle.importKey(
    "raw",
    Z(e),
    "HKDF",
    !1,
    ["deriveBits"]
  ), n = new TextEncoder().encode(A), s = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: Z(t ?? new Uint8Array(32)),
      // Zero salt if not provided
      info: Z(n)
    },
    r,
    i * 8
    // bits
  );
  return new Uint8Array(s);
}
async function BA(e, t) {
  const A = await pt(e, t, "cedros-wallet-share-b-encryption", 32);
  return Ge(A);
}
async function yt() {
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
function j(e, t, A, i) {
  function r(n) {
    return n instanceof A ? n : new A(function(s) {
      s(n);
    });
  }
  return new (A || (A = Promise))(function(n, s) {
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
class F {
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
    return j(this, void 0, void 0, function* () {
      const A = yield this.lock();
      try {
        return yield Promise.resolve(t());
      } finally {
        A();
      }
    });
  }
}
var ae;
function St() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global;
}
const ue = St(), ge = (ae = ue.Buffer) !== null && ae !== void 0 ? ae : null, Ft = ue.TextEncoder ? new ue.TextEncoder() : null;
function He(e, t) {
  return (e & 15) + (e >> 6 | e >> 3 & 8) << 4 | (t & 15) + (t >> 6 | t >> 3 & 8);
}
function Je(e, t) {
  const A = t.length >> 1;
  for (let i = 0; i < A; i++) {
    const r = i << 1;
    e[i] = He(t.charCodeAt(r), t.charCodeAt(r + 1));
  }
}
function kt(e, t) {
  if (e.length !== t.length * 2)
    return !1;
  for (let A = 0; A < t.length; A++) {
    const i = A << 1;
    if (t[A] !== He(e.charCodeAt(i), e.charCodeAt(i + 1)))
      return !1;
  }
  return !0;
}
const Ee = 87, pe = 48;
function fe(e, t, A) {
  let i = 0;
  for (let r = 0; r < A; r++) {
    let n = t[r] >>> 4;
    e[i++] = n > 9 ? n + Ee : n + pe, n = t[r] & 15, e[i++] = n > 9 ? n + Ee : n + pe;
  }
  return String.fromCharCode.apply(null, e);
}
const T = ge !== null ? (e) => {
  if (typeof e == "string") {
    const t = ge.from(e, "utf8");
    return new Uint8Array(t.buffer, t.byteOffset, t.length);
  }
  if (ge.isBuffer(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.length);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
} : (e) => {
  if (typeof e == "string")
    return Ft.encode(e);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
}, N = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", $ = new Uint8Array(256);
for (let e = 0; e < N.length; e++)
  $[N.charCodeAt(e)] = e;
function ye(e, t = !0) {
  const A = e.length, i = A % 3, r = [], n = A - i;
  for (let s = 0; s < n; s += 3) {
    const c = (e[s] << 16 & 16711680) + (e[s + 1] << 8 & 65280) + (e[s + 2] & 255), h = N.charAt(c >> 18 & 63) + N.charAt(c >> 12 & 63) + N.charAt(c >> 6 & 63) + N.charAt(c & 63);
    r.push(h);
  }
  if (i === 1) {
    const s = e[A - 1], c = N.charAt(s >> 2), h = N.charAt(s << 4 & 63);
    r.push(`${c}${h}`), t && r.push("==");
  } else if (i === 2) {
    const s = (e[A - 2] << 8) + e[A - 1], c = N.charAt(s >> 10), h = N.charAt(s >> 4 & 63), o = N.charAt(s << 2 & 63);
    r.push(`${c}${h}${o}`), t && r.push("=");
  }
  return r.join("");
}
function Dt(e) {
  let t = Math.floor(e.length * 0.75);
  const A = e.length;
  return e[A - 1] === "=" && (t -= 1, e[A - 2] === "=" && (t -= 1)), t;
}
function Ut(e) {
  const t = Dt(e), A = e.length, i = new Uint8Array(t);
  let r = 0;
  for (let n = 0; n < A; n += 4) {
    const s = $[e.charCodeAt(n)], c = $[e.charCodeAt(n + 1)], h = $[e.charCodeAt(n + 2)], o = $[e.charCodeAt(n + 3)];
    i[r] = s << 2 | c >> 4, r += 1, i[r] = (c & 15) << 4 | h >> 2, r += 1, i[r] = (h & 3) << 6 | o & 63, r += 1;
  }
  return i;
}
const ie = 16 * 1024, q = 4, bt = new F(), le = /* @__PURE__ */ new Map();
function ve(e, t) {
  return j(this, void 0, void 0, function* () {
    let A = null, i = null, r = !1;
    if (typeof WebAssembly > "u")
      throw new Error("WebAssembly is not supported in this environment!");
    const n = (a, I = 0) => {
      i.set(a, I);
    }, s = () => i, c = () => A.exports, h = (a) => {
      A.exports.Hash_SetMemorySize(a);
      const I = A.exports.Hash_GetBuffer(), l = A.exports.memory.buffer;
      i = new Uint8Array(l, I, a);
    }, o = () => new DataView(A.exports.memory.buffer).getUint32(A.exports.STATE_SIZE, !0), p = bt.dispatch(() => j(this, void 0, void 0, function* () {
      if (!le.has(e.name)) {
        const I = Ut(e.data), l = WebAssembly.compile(I);
        le.set(e.name, l);
      }
      const a = yield le.get(e.name);
      A = yield WebAssembly.instantiate(a, {
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
      A || (yield p);
      const a = A.exports.Hash_GetBuffer(), I = A.exports.memory.buffer;
      i = new Uint8Array(I, a, ie);
    }), Q = (a = null) => {
      r = !0, A.exports.Hash_Init(a);
    }, b = (a) => {
      let I = 0;
      for (; I < a.length; ) {
        const l = a.subarray(I, I + ie);
        I += l.length, i.set(l), A.exports.Hash_Update(l.length);
      }
    }, U = (a) => {
      if (!r)
        throw new Error("update() called before init()");
      const I = T(a);
      b(I);
    }, f = new Uint8Array(t * 2), B = (a, I = null) => {
      if (!r)
        throw new Error("digest() called before init()");
      return r = !1, A.exports.Hash_Final(I), a === "binary" ? i.slice(0, t) : fe(f, i, t);
    }, g = () => {
      if (!r)
        throw new Error("save() can only be called after init() and before digest()");
      const a = A.exports.Hash_GetState(), I = o(), l = A.exports.memory.buffer, w = new Uint8Array(l, a, I), u = new Uint8Array(q + I);
      return Je(u, e.hash), u.set(w, q), u;
    }, m = (a) => {
      if (!(a instanceof Uint8Array))
        throw new Error("load() expects an Uint8Array generated by save()");
      const I = A.exports.Hash_GetState(), l = o(), w = q + l, u = A.exports.memory.buffer;
      if (a.length !== w)
        throw new Error(`Bad state length (expected ${w} bytes, got ${a.length})`);
      if (!kt(e.hash, a.subarray(0, q)))
        throw new Error("This state was written by an incompatible hash implementation");
      const S = a.subarray(q);
      new Uint8Array(u, I, l).set(S), r = !0;
    }, y = (a) => typeof a == "string" ? a.length < ie / 4 : a.byteLength < ie;
    let k = y;
    switch (e.name) {
      case "argon2":
      case "scrypt":
        k = () => !0;
        break;
      case "blake2b":
      case "blake2s":
        k = (a, I) => I <= 512 && y(a);
        break;
      case "blake3":
        k = (a, I) => I === 0 && y(a);
        break;
      case "xxhash64":
      // cannot simplify
      case "xxhash3":
      case "xxhash128":
      case "crc64":
        k = () => !1;
        break;
    }
    const C = (a, I = null, l = null) => {
      if (!k(a, I))
        return Q(I), U(a), B("hex", l);
      const w = T(a);
      return i.set(w), A.exports.Hash_Calculate(w.length, I, l), fe(f, i, t);
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
      load: m,
      calculate: C,
      hashLength: t
    };
  });
}
new F();
var mt = "argon2", Gt = "AGFzbQEAAAABKQVgAX8Bf2AAAX9gEH9/f39/f39/f39/f39/f38AYAR/f39/AGACf38AAwYFAAECAwQFBgEBAoCAAgYIAX8BQZCoBAsHQQQGbWVtb3J5AgASSGFzaF9TZXRNZW1vcnlTaXplAAAOSGFzaF9HZXRCdWZmZXIAAQ5IYXNoX0NhbGN1bGF0ZQAECvEyBVgBAn9BACEBAkAgAEEAKAKICCICRg0AAkAgACACayIAQRB2IABBgIB8cSAASWoiAEAAQX9HDQBB/wHADwtBACEBQQBBACkDiAggAEEQdK18NwOICAsgAcALcAECfwJAQQAoAoAIIgANAEEAPwBBEHQiADYCgAhBACgCiAgiAUGAgCBGDQACQEGAgCAgAWsiAEEQdiAAQYCAfHEgAElqIgBAAEF/Rw0AQQAPC0EAQQApA4gIIABBEHStfDcDiAhBACgCgAghAAsgAAvcDgECfiAAIAQpAwAiECAAKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAMIBAgDCkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgBCAQIAQpAwCFQiiJIhA3AwAgACAQIAApAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAwgECAMKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAEIBAgBCkDAIVCAYk3AwAgASAFKQMAIhAgASkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDSAQIA0pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAEgECABKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACANIBAgDSkDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAIgBikDACIQIAIpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIA4gECAOKQMAhUIgiSIQNwMAIAogECAKKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACACIBAgAikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDiAQIA4pAwCFQjCJIhA3AwAgCiAQIAopAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACADIAcpAwAiECADKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAPIBAgDykDAIVCIIkiEDcDACALIBAgCykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAyAQIAMpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA8gECAPKQMAhUIwiSIQNwMAIAsgECALKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgACAFKQMAIhAgACkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDyAQIA8pAwCFQiCJIhA3AwAgCiAQIAopAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAAgECAAKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAPIBAgDykDAIVCMIkiEDcDACAKIBAgCikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAEgBikDACIQIAEpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAwgECAMKQMAhUIgiSIQNwMAIAsgECALKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACABIBAgASkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDCAQIAwpAwCFQjCJIhA3AwAgCyAQIAspAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACACIAcpAwAiECACKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACANIBAgDSkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAiAQIAIpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA0gECANKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgAyAEKQMAIhAgAykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDiAQIA4pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAQgECAEKQMAhUIoiSIQNwMAIAMgECADKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAOIBAgDikDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBCAQIAQpAwCFQgGJNwMAC98aAQN/QQAhBEEAIAIpAwAgASkDAIU3A5AIQQAgAikDCCABKQMIhTcDmAhBACACKQMQIAEpAxCFNwOgCEEAIAIpAxggASkDGIU3A6gIQQAgAikDICABKQMghTcDsAhBACACKQMoIAEpAyiFNwO4CEEAIAIpAzAgASkDMIU3A8AIQQAgAikDOCABKQM4hTcDyAhBACACKQNAIAEpA0CFNwPQCEEAIAIpA0ggASkDSIU3A9gIQQAgAikDUCABKQNQhTcD4AhBACACKQNYIAEpA1iFNwPoCEEAIAIpA2AgASkDYIU3A/AIQQAgAikDaCABKQNohTcD+AhBACACKQNwIAEpA3CFNwOACUEAIAIpA3ggASkDeIU3A4gJQQAgAikDgAEgASkDgAGFNwOQCUEAIAIpA4gBIAEpA4gBhTcDmAlBACACKQOQASABKQOQAYU3A6AJQQAgAikDmAEgASkDmAGFNwOoCUEAIAIpA6ABIAEpA6ABhTcDsAlBACACKQOoASABKQOoAYU3A7gJQQAgAikDsAEgASkDsAGFNwPACUEAIAIpA7gBIAEpA7gBhTcDyAlBACACKQPAASABKQPAAYU3A9AJQQAgAikDyAEgASkD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", Kt = "e4cdc523", Ht = {
  name: mt,
  data: Gt,
  hash: Kt
}, Jt = "blake2b", vt = "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", Vt = "c6f286e6", Ot = {
  name: Jt,
  data: vt,
  hash: Vt
};
new F();
function Se(e) {
  return !Number.isInteger(e) || e < 8 || e > 512 || e % 8 !== 0 ? new Error("Invalid variant! Valid values: 8, 16, ..., 512") : null;
}
function Mt(e, t) {
  return e | t << 16;
}
function we(e = 512, t = null) {
  if (Se(e))
    return Promise.reject(Se(e));
  let A = null, i = e;
  if (t !== null) {
    if (A = T(t), A.length > 64)
      return Promise.reject(new Error("Max key length is 64 bytes"));
    i = Mt(e, A.length);
  }
  const r = e / 8;
  return ve(Ot, r).then((n) => {
    i > 512 && n.writeMemory(A), n.init(i);
    const s = {
      init: i > 512 ? () => (n.writeMemory(A), n.init(i), s) : () => (n.init(i), s),
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
function Nt(e, t, A) {
  const i = [
    `m=${t.memorySize}`,
    `t=${t.iterations}`,
    `p=${t.parallelism}`
  ].join(",");
  return `$argon2${t.hashType}$v=19$${i}$${ye(e, !1)}$${ye(A, !1)}`;
}
const Fe = new DataView(new ArrayBuffer(4));
function R(e) {
  return Fe.setInt32(0, e, !0), new Uint8Array(Fe.buffer);
}
function ce(e, t, A) {
  return j(this, void 0, void 0, function* () {
    if (A <= 64) {
      const h = yield we(A * 8);
      return h.update(R(A)), h.update(t), h.digest("binary");
    }
    const i = Math.ceil(A / 32) - 2, r = new Uint8Array(A);
    e.init(), e.update(R(A)), e.update(t);
    let n = e.digest("binary");
    r.set(n.subarray(0, 32), 0);
    for (let h = 1; h < i; h++)
      e.init(), e.update(n), n = e.digest("binary"), r.set(n.subarray(0, 32), h * 32);
    const s = A - 32 * i;
    let c;
    return s === 64 ? (c = e, c.init()) : c = yield we(s * 8), c.update(n), n = c.digest("binary"), r.set(n.subarray(0, s), i * 32), r;
  });
}
function Pt(e) {
  switch (e) {
    case "d":
      return 0;
    case "i":
      return 1;
    default:
      return 2;
  }
}
function Yt(e) {
  return j(this, void 0, void 0, function* () {
    var t;
    const { parallelism: A, iterations: i, hashLength: r } = e, n = T(e.password), s = T(e.salt), c = 19, h = Pt(e.hashType), { memorySize: o } = e, p = T((t = e.secret) !== null && t !== void 0 ? t : ""), [E, Q] = yield Promise.all([
      ve(Ht, 1024),
      we(512)
    ]);
    E.setMemorySize(o * 1024 + 1024);
    const b = new Uint8Array(24), U = new DataView(b.buffer);
    U.setInt32(0, A, !0), U.setInt32(4, r, !0), U.setInt32(8, o, !0), U.setInt32(12, i, !0), U.setInt32(16, c, !0), U.setInt32(20, h, !0), E.writeMemory(b, o * 1024), Q.init(), Q.update(b), Q.update(R(n.length)), Q.update(n), Q.update(R(s.length)), Q.update(s), Q.update(R(p.length)), Q.update(p), Q.update(R(0));
    const B = Math.floor(o / (A * 4)) * 4, g = new Uint8Array(72), m = Q.digest("binary");
    g.set(m);
    for (let C = 0; C < A; C++) {
      g.set(R(0), 64), g.set(R(C), 68);
      let a = C * B, I = yield ce(Q, g, 1024);
      E.writeMemory(I, a * 1024), a += 1, g.set(R(1), 64), I = yield ce(Q, g, 1024), E.writeMemory(I, a * 1024);
    }
    const y = new Uint8Array(1024);
    Je(y, E.calculate(new Uint8Array([]), o));
    const k = yield ce(Q, y, r);
    if (e.outputType === "hex") {
      const C = new Uint8Array(r * 2);
      return fe(C, k, r);
    }
    return e.outputType === "encoded" ? Nt(s, e, k) : k;
  });
}
const xt = (e) => {
  var t;
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
  if (e.secret = T((t = e.secret) !== null && t !== void 0 ? t : ""), !Number.isInteger(e.iterations) || e.iterations < 1)
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
function Ve(e) {
  return j(this, void 0, void 0, function* () {
    return xt(e), Yt(Object.assign(Object.assign({}, e), { hashType: "id" }));
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
const Rt = 32;
async function dA(e, t, A = st) {
  Tt(A);
  try {
    const i = await Ve({
      password: e,
      salt: t,
      iterations: A.tCost,
      memorySize: A.mCost,
      parallelism: A.pCost,
      hashLength: Rt,
      outputType: "binary"
    });
    return Ge(i);
  } catch {
    throw new Error("Key derivation failed");
  }
}
function Tt(e) {
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
async function Lt() {
  try {
    const e = await Ve({
      password: "test",
      salt: new Uint8Array(16),
      iterations: 1,
      memorySize: 1024,
      // 1 MiB for quick test
      parallelism: 1,
      hashLength: 32,
      outputType: "binary"
    });
    return e.length !== 32 ? !1 : (Ke(e), !0);
  } catch {
    return !1;
  }
}
function Xt(e) {
  return e === "localhost" || e === "127.0.0.1" || e.endsWith(".localhost");
}
function Wt(e) {
  if (typeof window > "u")
    return;
  const t = window.location.hostname;
  if (!Xt(t))
    throw new Error(
      "[Cedros] WebAuthn RP domain validation is not configured. Set wallet.allowedRpDomains to a non-empty list of allowed domains."
    );
}
function Qe() {
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator.credentials < "u";
}
async function jt() {
  if (!Qe())
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
async function EA(e, t) {
  if (!Qe())
    throw new Error("WebAuthn is not available in this browser");
  Wt();
  const A = Et(e), i = await navigator.credentials.get({
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
  const s = new Uint8Array(n);
  if (s.length !== 32)
    throw new Error(
      `Unexpected PRF output length: expected 32 bytes, got ${s.length}. The authenticator may not be compatible.`
    );
  return { prfOutput: s };
}
async function Zt() {
  const [e, t, A, i, r, n, s] = await Promise.all([
    _t(),
    qt(),
    yt(),
    $t(),
    Promise.resolve(Qe()),
    jt(),
    Lt()
  ]);
  return {
    webCrypto: e,
    aesGcm: t,
    hkdf: A,
    ed25519: i,
    webAuthn: r,
    webAuthnPrf: n,
    argon2: s,
    allSupported: e && t && A && r && n && s
  };
}
async function _t() {
  try {
    return typeof crypto < "u" && typeof crypto.subtle < "u" && typeof crypto.getRandomValues == "function";
  } catch {
    return !1;
  }
}
async function qt() {
  try {
    const e = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, !1, [
      "encrypt",
      "decrypt"
    ]), t = new Uint8Array([1, 2, 3, 4]), A = crypto.getRandomValues(new Uint8Array(12)), i = await crypto.subtle.encrypt({ name: "AES-GCM", iv: A }, e, t), r = await crypto.subtle.decrypt({ name: "AES-GCM", iv: A }, e, i), n = new Uint8Array(r);
    return n.length === t.length && n.every((s, c) => s === t[c]);
  } catch {
    return !1;
  }
}
async function $t() {
  try {
    return await crypto.subtle.generateKey("Ed25519", !1, ["sign", "verify"]), !0;
  } catch {
    return !1;
  }
}
function pA(e) {
  if (e.allSupported)
    return null;
  const t = [];
  return e.webCrypto || t.push("Web Crypto API"), e.aesGcm || t.push("AES-GCM encryption"), e.hkdf || t.push("HKDF key derivation"), e.webAuthn || t.push("WebAuthn/Passkeys"), e.webAuthnPrf || t.push("WebAuthn PRF extension (requires platform authenticator)"), e.argon2 || t.push("Argon2 password hashing"), t.length === 0 ? null : `Your browser or device is missing required features: ${t.join(", ")}. Please use a modern browser with a platform authenticator (e.g., Touch ID, Face ID, Windows Hello).`;
}
function yA() {
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
let re = null, Ce = null;
const zt = 6e4;
async function eA(e = !1) {
  const t = Date.now(), A = Ce === null || t - Ce > zt;
  return !e && !(typeof window > "u") && !A && re !== null || (re = await Zt(), Ce = Date.now()), re;
}
function tA(e) {
  switch (e.type) {
    case "password":
      return { password: e.password };
    case "prfOutput":
      return { prfOutput: e.prfOutput };
  }
}
function AA() {
  const e = De(), [t, A] = D(!1), [i, r] = D(null), n = e?.config.serverUrl, s = e?.config.requestTimeout, c = e?.config.retryAttempts, h = e?._internal?.getAccessToken, o = v(() => e ? new ke({
    baseUrl: n,
    timeoutMs: s,
    retryAttempts: c,
    getAccessToken: h
  }) : null, [e, n, s, c, h]), p = d(async () => {
    if (!o)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      return await o.get("/wallet/status");
    } catch (I) {
      const l = V(I, "Failed to fetch wallet status");
      throw r(l.message), l;
    } finally {
      A(!1);
    }
  }, [o]), E = d(async () => {
    if (!o)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      return await o.get("/wallet/material");
    } catch (I) {
      const l = V(I, "Failed to fetch wallet material");
      if (l.code === "NOT_FOUND")
        return null;
      throw r(l.message), l;
    } finally {
      A(!1);
    }
  }, [o]), Q = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        await o.post("/wallet/enroll", I);
      } catch (l) {
        const w = V(l, "Failed to enroll wallet");
        throw r(w.message), w;
      } finally {
        A(!1);
      }
    },
    [o]
  ), b = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        await o.post("/wallet/recover", I);
      } catch (l) {
        const w = V(l, "Failed to recover wallet");
        throw r(w.message), w;
      } finally {
        A(!1);
      }
    },
    [o]
  ), U = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        return await o.post("/wallet/sign", I);
      } catch (l) {
        const w = V(l, "Failed to sign transaction");
        throw r(w.message), w;
      } finally {
        A(!1);
      }
    },
    [o]
  ), f = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        await o.post("/wallet/rotate-user-secret", I);
      } catch (l) {
        const w = V(l, "Failed to rotate user secret");
        throw r(w.message), w;
      } finally {
        A(!1);
      }
    },
    [o]
  ), B = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        return await o.post(
          "/wallet/unlock",
          tA(I)
        );
      } catch (l) {
        const w = V(l, "Failed to unlock wallet");
        throw r(w.message), w;
      } finally {
        A(!1);
      }
    },
    [o]
  ), g = d(async () => {
    if (!o)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      await o.post("/wallet/lock", {});
    } catch (I) {
      const l = V(I, "Failed to lock wallet");
      throw r(l.message), l;
    } finally {
      A(!1);
    }
  }, [o]), m = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        return await o.post("/wallet/share-b", I);
      } catch (l) {
        const w = V(l, "Failed to get Share B for recovery");
        throw r(w.message), w;
      } finally {
        A(!1);
      }
    },
    [o]
  ), y = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        return await o.post("/wallet/derived", I);
      } catch (l) {
        const w = V(l, "Failed to create derived wallet");
        throw r(w.message), w;
      } finally {
        A(!1);
      }
    },
    [o]
  ), k = d(async () => {
    if (!o)
      throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
    A(!0), r(null);
    try {
      return await o.get("/wallet/derived");
    } catch (I) {
      const l = V(I, "Failed to list wallets");
      throw r(l.message), l;
    } finally {
      A(!1);
    }
  }, [o]), C = d(
    async (I) => {
      if (!o)
        throw new Error("useWalletMaterial must be used within a CedrosLoginProvider");
      A(!0), r(null);
      try {
        await o.delete(`/wallet/derived/${I}`);
      } catch (l) {
        const w = V(l, "Failed to delete derived wallet");
        throw r(w.message), w;
      } finally {
        A(!1);
      }
    },
    [o]
  ), a = d(() => r(null), []);
  return {
    getStatus: p,
    getMaterial: E,
    enroll: Q,
    recover: b,
    signTransaction: U,
    rotateUserSecret: f,
    unlock: B,
    lock: g,
    getShareBForRecovery: m,
    createDerivedWallet: y,
    listAllWallets: k,
    deleteDerivedWallet: C,
    isLoading: t,
    error: i,
    clearError: a
  };
}
const iA = {
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
function rA() {
  const t = De() !== null, [A, i] = D("loading"), [r, n] = D(null), [s, c] = D(null), [h, o] = D(!1), [p, E] = D(!1), [Q, b] = D(null), [U, f] = D(null), { getStatus: B, isLoading: g } = AA(), m = O(!1);
  P(() => {
    if (!t) return;
    let C = !1;
    return (async () => {
      try {
        const I = await eA();
        if (C) return;
        b(I), I.allSupported || (i("error"), f(
          "Your browser or device does not support all required features. Please use a modern browser with a platform authenticator."
        ));
      } catch {
        if (C) return;
        b(null), i("error"), f("Failed to check crypto capabilities");
      }
    })(), () => {
      C = !0;
    };
  }, [t]);
  const y = d(async () => {
    if (!(!t || !Q?.allSupported)) {
      i("loading"), f(null);
      try {
        const C = await B();
        n(C.solanaPubkey ?? null), c(C.authMethod ?? null), o(C.hasExternalWallet), E(C.unlocked), C.hasExternalWallet ? i("enrolled_unlocked") : C.enrolled ? i(C.unlocked ? "enrolled_unlocked" : "enrolled_locked") : i("not_enrolled");
      } catch (C) {
        i("error"), f(C instanceof Error ? C.message : "Failed to fetch wallet status");
      }
    }
  }, [t, Q?.allSupported, B]);
  P(() => {
    t && Q?.allSupported && !g && !m.current && (m.current = !0, y());
  }, [t, Q?.allSupported, g, y]);
  const k = d(() => f(null), []);
  return t ? {
    status: A,
    solanaPubkey: r,
    authMethod: s,
    hasExternalWallet: h,
    isUnlocked: p,
    capabilities: Q,
    isSupported: Q?.allSupported ?? !1,
    error: U,
    refresh: y,
    clearError: k
  } : iA;
}
const oe = "__CEDROS_EMBEDDED_WALLET__";
function nA(e) {
  typeof window < "u" && (window[oe] = e);
}
function he() {
  typeof window < "u" && delete window[oe];
}
function SA() {
  return typeof window > "u" ? !1 : window[oe]?.available ?? !1;
}
function FA() {
  return typeof window > "u" ? null : window[oe] ?? null;
}
function oA() {
  const { config: e, user: t } = Ne(), { status: A, solanaPubkey: i, hasExternalWallet: r } = rA(), n = e.wallet?.exposeAvailability ?? !1, s = e.wallet?.exposePublicKey ?? !1;
  return P(() => {
    if (!n || !t) {
      he();
      return;
    }
    if (r) {
      he();
      return;
    }
    if (A === "loading")
      return;
    const c = A === "enrolled_locked" || A === "enrolled_unlocked";
    return nA({
      available: c,
      publicKey: s && c ? i : null
    }), () => {
      he();
    };
  }, [n, s, t, A, i, r]), null;
}
function kA({ config: e, children: t }) {
  const [A, i] = D(null), [r, n] = D(!1), s = O(e.callbacks);
  s.current = e.callbacks;
  const c = O({
    onLoginSuccess: (...Y) => s.current?.onLoginSuccess?.(...Y),
    onLoginError: (...Y) => s.current?.onLoginError?.(...Y),
    onLogout: () => s.current?.onLogout?.(),
    onSessionExpired: () => s.current?.onSessionExpired?.()
  }), h = O(null);
  P(() => {
    if (typeof window > "u") return;
    const Y = new URLSearchParams(window.location.search), Be = Y.get("ref") || Y.get("referral");
    Be && (h.current = Be);
  }, []);
  const o = e.features === "auto", {
    features: p,
    googleClientId: E,
    appleClientId: Q,
    socialButtonOrder: b,
    isLoading: U
  } = ze(
    e.serverUrl,
    o,
    e.requestTimeout
  ), f = o ? void 0 : e.features, B = v(
    () => me({
      config: f,
      env: e.featureFlagEnv,
      base: o ? p ?? void 0 : void 0
    }),
    [e.featureFlagEnv, f, o, p]
  ), g = v(() => ({
    ...e,
    features: B,
    googleClientId: o ? e.googleClientId ?? E : e.googleClientId,
    appleClientId: o ? e.appleClientId ?? Q : e.appleClientId
  }), [e, o, B, E, Q]), m = v(
    () => JSON.stringify(g.themeOverrides ?? null),
    [g.themeOverrides]
  ), y = v(() => JSON.stringify(g.session ?? null), [g.session]), k = v(() => JSON.stringify(g.features ?? null), [g.features]), C = v(() => JSON.stringify(g.forms ?? null), [g.forms]), a = v(
    () => g,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Using serialized keys for deep comparison; callbacks excluded (see UI-06)
    [
      g.serverUrl,
      g.googleClientId,
      g.appleClientId,
      g.requestTimeout,
      g.retryAttempts,
      g.theme,
      m,
      y,
      k,
      C
    ]
  ), I = a.unstyled ?? !1, l = qe({
    theme: I ? void 0 : a.theme,
    themeOverrides: I ? void 0 : a.themeOverrides
  }), {
    user: w,
    authState: u,
    handleLoginSuccess: S,
    logout: G,
    refreshUser: H,
    getAccessToken: K
  } = ot({
    serverUrl: a.serverUrl,
    session: a.session,
    callbacks: c.current,
    requestTimeoutMs: a.requestTimeout
  }), J = d(async () => {
    i(null), await G();
  }, [G]), M = d(
    (...Y) => {
      i(null), S(...Y);
    },
    [S]
  ), se = d(() => n(!0), []), X = d(() => n(!1), []), L = a.features, z = d(
    (Y) => We(Y, { flags: L }),
    [L]
  ), x = v(
    () => ({
      config: a,
      featureFlags: L,
      isFeatureEnabled: z,
      user: w,
      authState: u,
      logout: J,
      refreshUser: H,
      socialButtonOrder: o ? b : void 0,
      _internal: {
        handleLoginSuccess: M,
        getAccessToken: K,
        getReferralCode: () => h.current
      }
    }),
    [a, L, z, w, u, J, H, o, b, M, K]
  ), W = v(
    () => ({
      error: A,
      isModalOpen: r,
      openModal: se,
      closeModal: X
    }),
    [A, r, se, X]
  ), Oe = v(
    () => ({ ...x, ...W }),
    [x, W]
  );
  return o && U ? null : /* @__PURE__ */ ee(Pe.Provider, { value: x, children: /* @__PURE__ */ ee(Ye.Provider, { value: W, children: /* @__PURE__ */ ee(xe.Provider, { value: Oe, children: /* @__PURE__ */ Me("div", { className: l.className, style: l.style, children: [
    /* @__PURE__ */ ee(oA, {}),
    t
  ] }) }) }) });
}
export {
  EA as A,
  BA as B,
  kA as C,
  st as D,
  tA as E,
  gA as F,
  Et as G,
  rA as H,
  qe as I,
  FA as J,
  SA as K,
  _ as a,
  Ue as b,
  cA as c,
  me as d,
  Ze as e,
  je as f,
  lA as g,
  be as h,
  We as i,
  dA as j,
  ht as k,
  wA as l,
  pA as m,
  yA as n,
  hA as o,
  Le as p,
  QA as q,
  Xe as r,
  Ge as s,
  CA as t,
  AA as u,
  Tt as v,
  Ke as w,
  de as x,
  uA as y,
  fA as z
};
