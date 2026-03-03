import { jsx as c, jsxs as _ } from "react/jsx-runtime";
import { useState as v, useMemo as Q, useCallback as W, useRef as q, useEffect as M } from "react";
import { WalletProvider as X, useWallet as Z } from "@solana/wallet-adapter-react";
import { WalletModalProvider as F, useWalletModal as x } from "@solana/wallet-adapter-react-ui";
import { u as ee, A as te, h as H } from "./useCedrosLogin-_94MmGGq.js";
import { a as V } from "./validation-B8kMV3BL.js";
import { L as ne } from "./LoadingSpinner-6vml-zwr.js";
function ae() {
  const { config: e, _internal: t } = ee(), [w, s] = v(!1), [D, l] = v(null), f = Q(
    () => new te({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), S = W(
    async (d) => {
      if (!V(d)) {
        const i = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw l(i), i;
      }
      s(!0), l(null);
      try {
        return await f.post(
          "/solana/challenge",
          { publicKey: d },
          { credentials: "omit" }
        );
      } catch (i) {
        const a = H(i, "Failed to get challenge");
        throw l(a), a;
      } finally {
        s(!1);
      }
    },
    [f]
  ), o = W(
    async (d, i, a) => {
      if (!V(d)) {
        const r = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw l(r), r;
      }
      s(!0), l(null);
      try {
        const r = await f.post("/solana", {
          publicKey: d,
          signature: i,
          message: a
        });
        return e.callbacks?.onLoginSuccess?.(r.user, "solana"), t?.handleLoginSuccess(r.user, r.tokens), r;
      } catch (r) {
        const C = H(r, "Solana sign-in failed");
        throw l(C), C;
      } finally {
        s(!1);
      }
    },
    [f, e.callbacks, t]
  ), L = W(() => l(null), []);
  return {
    requestChallenge: S,
    signIn: o,
    isLoading: w,
    error: D,
    clearError: L
  };
}
const re = [];
function fe(e) {
  return e.walletContext ? /* @__PURE__ */ c(F, { children: /* @__PURE__ */ c(R, { ...e }) }) : /* @__PURE__ */ c(X, { wallets: re, localStorageKey: "cedros-walletName", children: /* @__PURE__ */ c(F, { children: /* @__PURE__ */ c(R, { ...e }) }) });
}
function R({
  onSuccess: e,
  onError: t,
  className: w = "",
  variant: s = "default",
  size: D = "md",
  disabled: l = !1,
  hideIfNoWallet: f = !0,
  onLoadingChange: S,
  walletContext: o
}) {
  const { requestChallenge: L, signIn: d, isLoading: i } = ae(), a = Z(), { visible: r, setVisible: C } = x(), [g, h] = v(!1), [K, P] = v(!1), E = q(!1), k = q(!1), u = o?.connected ?? a.connected, m = o?.connecting ?? a.connecting, p = o?.publicKey ?? a.publicKey, y = o?.signMessage ?? a.signMessage, b = o?.wallet ?? a.wallet, Y = o?.wallets ?? a.wallets, $ = o ? o.select : (n) => a.select(n), T = o?.connect ?? a.connect, z = Y.filter(
    (n) => n.adapter.readyState === "Installed" || n.adapter.readyState === "Loadable"
  ), N = W(async () => {
    if (!E.current) {
      if (!p || !y) {
        t?.(new Error("Wallet not ready"));
        return;
      }
      E.current = !0;
      try {
        const n = p.toBase58(), I = await L(n), J = new TextEncoder().encode(I.message), B = await y(J);
        if (!(B instanceof Uint8Array) || B.length === 0)
          throw new Error("Wallet returned invalid signature");
        let U;
        try {
          U = btoa(String.fromCharCode(...B));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await d(n, U, I.message), e?.();
      } catch (n) {
        const I = n instanceof Error ? n : new Error(String(n));
        t?.(I);
      } finally {
        E.current = !1, h(!1);
      }
    }
  }, [p, y, L, d, e, t]);
  if (M(() => {
    K && b && !u && !m && (P(!1), T().catch((n) => {
      t?.(n instanceof Error ? n : new Error(String(n))), h(!1);
    }));
  }, [K, b, u, m, T, t]), M(() => {
    g && u && p && y && !E.current && N().catch(() => {
    });
  }, [g, u, p, y, N]), M(() => {
    r ? k.current = !0 : k.current && (k.current = !1, g && !u && b && !m ? P(!0) : g && !u && !b && h(!1));
  }, [r, g, u, b, m]), f && z.length === 0)
    return null;
  const j = async () => {
    l || i || m || (u && p && y ? (h(!0), await N()) : z.length === 1 ? ($(z[0].adapter.name), h(!0), P(!0)) : (C(!0), h(!0)));
  }, O = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, G = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, A = i || m || g && !u;
  return M(() => {
    S?.(A);
  }, [A, S]), /* @__PURE__ */ _(
    "button",
    {
      type: "button",
      className: `cedros-button ${G[s]} ${O[D]} ${w}`,
      onClick: j,
      disabled: l || A,
      "aria-label": "Continue with Solana",
      children: [
        A ? /* @__PURE__ */ c(ne, { size: "sm" }) : /* @__PURE__ */ _(
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
function ge(e) {
  if (typeof window > "u")
    return !1;
  try {
    const t = require("@solana-mobile/wallet-standard-mobile"), w = e?.chains ?? ["solana:mainnet"], s = {
      appIdentity: {
        name: e?.name,
        uri: e?.uri,
        icon: e?.icon
      },
      chains: w
    };
    return typeof t.createDefaultAuthorizationCache == "function" && (s.authorizationCache = t.createDefaultAuthorizationCache()), typeof t.createDefaultChainSelector == "function" && (s.chainSelector = t.createDefaultChainSelector()), typeof t.createDefaultWalletNotFoundHandler == "function" && (s.onWalletNotFound = t.createDefaultWalletNotFoundHandler()), t.registerMwa(s), !0;
  } catch {
    return !1;
  }
}
export {
  fe as S,
  ge as r,
  ae as u
};
