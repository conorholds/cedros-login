import { jsx as c, jsxs as F } from "react/jsx-runtime";
import { useState as D, useMemo as X, useCallback as v, useRef as K, useEffect as W } from "react";
import { WalletProvider as Z, useWallet as x } from "@solana/wallet-adapter-react";
import { WalletModalProvider as H, useWalletModal as ee } from "@solana/wallet-adapter-react-ui";
import { u as te, A as ne, h as V } from "./useCedrosLogin-_94MmGGq.js";
import { a as O } from "./validation-B8kMV3BL.js";
import { L as ae } from "./LoadingSpinner-6vml-zwr.js";
function re() {
  const { config: e, _internal: n } = te(), [b, s] = D(!1), [P, l] = D(null), m = X(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), S = v(
    async (d) => {
      if (!O(d)) {
        const i = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw l(i), i;
      }
      s(!0), l(null);
      try {
        return await m.post(
          "/solana/challenge",
          { publicKey: d },
          { credentials: "omit" }
        );
      } catch (i) {
        const a = V(i, "Failed to get challenge");
        throw l(a), a;
      } finally {
        s(!1);
      }
    },
    [m]
  ), o = v(
    async (d, i, a) => {
      if (!O(d)) {
        const r = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw l(r), r;
      }
      s(!0), l(null);
      try {
        const r = await m.post("/solana", {
          publicKey: d,
          signature: i,
          message: a
        });
        return e.callbacks?.onLoginSuccess?.(r.user, "solana"), n?.handleLoginSuccess(r.user, r.tokens), r;
      } catch (r) {
        const C = V(r, "Solana sign-in failed");
        throw l(C), C;
      } finally {
        s(!1);
      }
    },
    [m, e.callbacks, n]
  ), L = v(() => l(null), []);
  return {
    requestChallenge: S,
    signIn: o,
    isLoading: b,
    error: P,
    clearError: L
  };
}
const se = [];
function ge(e) {
  return e.walletContext ? /* @__PURE__ */ c(H, { children: /* @__PURE__ */ c(R, { ...e }) }) : /* @__PURE__ */ c(Z, { wallets: se, localStorageKey: "cedros-walletName", children: /* @__PURE__ */ c(H, { children: /* @__PURE__ */ c(R, { ...e }) }) });
}
function R({
  onSuccess: e,
  onError: n,
  className: b = "",
  variant: s = "default",
  size: P = "md",
  disabled: l = !1,
  hideIfNoWallet: m = !0,
  onLoadingChange: S,
  walletContext: o
}) {
  const { requestChallenge: L, signIn: d, isLoading: i } = re(), a = x(), { visible: r, setVisible: C } = ee(), [p, f] = D(!1), [T, E] = D(!1), A = K(!1), k = K(!1), U = K(null), u = o?.connected ?? a.connected, g = o?.connecting ?? a.connecting, y = o?.publicKey ?? a.publicKey, w = o?.signMessage ?? a.signMessage, h = o?.wallet ?? a.wallet, Y = o?.wallets ?? a.wallets, $ = o ? o.select : (t) => a.select(t), _ = o?.connect ?? a.connect, z = Y.filter(
    (t) => t.adapter.readyState === "Installed" || t.adapter.readyState === "Loadable"
  ), N = v(async () => {
    if (!A.current) {
      if (!y || !w) {
        n?.(new Error("Wallet not ready"));
        return;
      }
      A.current = !0;
      try {
        const t = y.toBase58(), M = await L(t), Q = new TextEncoder().encode(M.message), B = await w(Q);
        if (!(B instanceof Uint8Array) || B.length === 0)
          throw new Error("Wallet returned invalid signature");
        let q;
        try {
          q = btoa(String.fromCharCode(...B));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await d(t, q, M.message), e?.();
      } catch (t) {
        const M = t instanceof Error ? t : new Error(String(t));
        n?.(M);
      } finally {
        A.current = !1, f(!1);
      }
    }
  }, [y, w, L, d, e, n]);
  if (W(() => {
    T && h && !u && !g && (E(!1), _().catch((t) => {
      n?.(t instanceof Error ? t : new Error(String(t))), f(!1);
    }));
  }, [T, h, u, g, _, n]), W(() => {
    p && u && y && w && !A.current && N().catch(() => {
    });
  }, [p, u, y, w, N]), W(() => {
    if (r)
      k.current = !0, U.current = h?.adapter.name ?? null;
    else if (k.current) {
      k.current = !1;
      const t = (h?.adapter.name ?? null) !== U.current;
      p && !u && h && t && !g ? E(!0) : p && !u && f(!1);
    }
  }, [r, p, u, h, g]), m && z.length === 0)
    return null;
  const j = async () => {
    l || i || g || (u && y && w ? (f(!0), await N()) : h && !g ? (f(!0), E(!0)) : z.length === 1 ? ($(z[0].adapter.name), f(!0), E(!0)) : (C(!0), f(!0)));
  }, G = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, J = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, I = i || g || p && !u;
  return W(() => {
    S?.(I);
  }, [I, S]), /* @__PURE__ */ F(
    "button",
    {
      type: "button",
      className: `cedros-button ${J[s]} ${G[P]} ${b}`,
      onClick: j,
      disabled: l || I,
      "aria-label": "Continue with Solana",
      children: [
        I ? /* @__PURE__ */ c(ae, { size: "sm" }) : /* @__PURE__ */ F(
          "svg",
          {
            className: "cedros-button-icon",
            width: "18",
            height: "18",
            viewBox: "0 0 128 128",
            fill: "currentColor",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ c("path", { d: "M25.38 96.04a4.35 4.35 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7l-17.71 17.72a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7l17.71-17.72z" }),
              /* @__PURE__ */ c("path", { d: "M25.38 11.81a4.47 4.47 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7L103.96 31.96a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7L25.38 11.81z" }),
              /* @__PURE__ */ c("path", { d: "M102.62 53.76a4.35 4.35 0 0 0-3.07-1.27H7.87c-1.93 0-2.9 2.34-1.54 3.7l17.71 17.72a4.35 4.35 0 0 0 3.07 1.27h91.68c1.93 0 2.9-2.34 1.54-3.7L102.62 53.76z" })
            ]
          }
        ),
        /* @__PURE__ */ c("span", { children: "Continue with Solana" })
      ]
    }
  );
}
function he(e) {
  if (typeof window > "u")
    return !1;
  try {
    const n = require("@solana-mobile/wallet-standard-mobile"), b = e?.chains ?? ["solana:mainnet"], s = {
      appIdentity: {
        name: e?.name,
        uri: e?.uri,
        icon: e?.icon
      },
      chains: b
    };
    return typeof n.createDefaultAuthorizationCache == "function" && (s.authorizationCache = n.createDefaultAuthorizationCache()), typeof n.createDefaultChainSelector == "function" && (s.chainSelector = n.createDefaultChainSelector()), typeof n.createDefaultWalletNotFoundHandler == "function" && (s.onWalletNotFound = n.createDefaultWalletNotFoundHandler()), n.registerMwa(s), !0;
  } catch {
    return !1;
  }
}
export {
  ge as S,
  he as r,
  re as u
};
