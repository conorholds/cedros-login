import { useState as d, useMemo as A, useCallback as u } from "react";
import { b as C, A as I, h } from "./ErrorMessage-DObd7075.js";
import { a as m } from "./validation-B8kMV3BL.js";
const S = [
  "phantom",
  "solflare",
  "backpack",
  "glow",
  "slope",
  "sollet",
  "coin98",
  "clover",
  "mathWallet",
  "ledger",
  "torus",
  "walletconnect"
];
function p(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.connect == "function" || typeof t.signMessage == "function" || typeof t.signTransaction == "function" || "isConnected" in t;
}
function E() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent, t = "brave" in navigator;
  return /Android/i.test(e) && /Chrome\/\d+/.test(e) && !t;
}
function U() {
  if (typeof window > "u")
    return !1;
  const e = window;
  for (const t of S) {
    const n = e[t];
    if (n && typeof n == "object" && "solana" in n && p(n.solana))
      return !0;
  }
  return !!(p(e.solana) || E());
}
function _() {
  const { config: e, _internal: t } = C(), [n, l] = d(!1), [w, r] = d(null), i = A(
    () => new I({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), y = u(
    async (s) => {
      if (!m(s)) {
        const o = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw r(o), o;
      }
      l(!0), r(null);
      try {
        return await i.post(
          "/solana/challenge",
          { publicKey: s },
          { credentials: "omit" }
        );
      } catch (o) {
        const c = h(o, "Unable to start wallet verification. Please try again.");
        throw r(c), c;
      } finally {
        l(!1);
      }
    },
    [i]
  ), g = u(
    async (s, o, c, v) => {
      if (!m(s)) {
        const a = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw r(a), a;
      }
      l(!0), r(null);
      try {
        const a = await i.post("/solana", {
          publicKey: s,
          signature: o,
          message: c,
          referral: t?.getReferralCode?.() ?? void 0,
          access_code: v || void 0
        });
        return e.callbacks?.onLoginSuccess?.(a.user, "solana"), t?.handleLoginSuccess(a.user, a.tokens), a;
      } catch (a) {
        const f = h(a, "Unable to sign in with your wallet. Please try again.");
        throw r(f), f;
      } finally {
        l(!1);
      }
    },
    [i, e.callbacks, t]
  ), b = u(() => r(null), []);
  return {
    requestChallenge: y,
    signIn: g,
    isLoading: n,
    error: w,
    clearError: b
  };
}
async function D(e) {
  if (typeof window > "u")
    return !1;
  try {
    const t = await import("@solana-mobile/wallet-standard-mobile"), n = e?.chains ?? ["solana:mainnet"];
    return t.registerMwa({
      appIdentity: {
        name: e?.name,
        uri: e?.uri,
        icon: e?.icon
      },
      chains: n,
      authorizationCache: t.createDefaultAuthorizationCache(),
      chainSelector: t.createDefaultChainSelector(),
      onWalletNotFound: t.createDefaultWalletNotFoundHandler()
    }), !0;
  } catch {
    return !1;
  }
}
export {
  U as d,
  E as i,
  D as r,
  _ as u
};
