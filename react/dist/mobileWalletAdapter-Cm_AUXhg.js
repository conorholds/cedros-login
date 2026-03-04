import { jsx as c, jsxs as F } from "react/jsx-runtime";
import { useState as D, useMemo as X, useCallback as v, useRef as T, useEffect as W } from "react";
import { WalletProvider as Z, useWallet as x } from "@solana/wallet-adapter-react";
import { WalletModalProvider as H, useWalletModal as ee } from "@solana/wallet-adapter-react-ui";
import { u as te, A as ne, h as R } from "./useCedrosLogin-_94MmGGq.js";
import { a as V } from "./validation-B8kMV3BL.js";
import { L as ae } from "./LoadingSpinner-6vml-zwr.js";
function re() {
  const { config: e, _internal: t } = te(), [b, s] = D(!1), [P, l] = D(null), f = X(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), S = v(
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
        const a = R(i, "Failed to get challenge");
        throw l(a), a;
      } finally {
        s(!1);
      }
    },
    [f]
  ), o = v(
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
        const C = R(r, "Solana sign-in failed");
        throw l(C), C;
      } finally {
        s(!1);
      }
    },
    [f, e.callbacks, t]
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
  return e.walletContext ? /* @__PURE__ */ c(H, { children: /* @__PURE__ */ c(j, { ...e }) }) : /* @__PURE__ */ c(Z, { wallets: se, localStorageKey: "cedros-walletName", children: /* @__PURE__ */ c(H, { children: /* @__PURE__ */ c(j, { ...e }) }) });
}
function j({
  onSuccess: e,
  onError: t,
  className: b = "",
  variant: s = "default",
  size: P = "md",
  disabled: l = !1,
  hideIfNoWallet: f = !0,
  onLoadingChange: S,
  walletContext: o
}) {
  const { requestChallenge: L, signIn: d, isLoading: i } = re(), a = x(), { visible: r, setVisible: C } = ee(), [g, h] = D(!1), [U, k] = D(!1), E = T(!1), z = T(!1), A = T(!1), u = o?.connected ?? a.connected, m = o?.connecting ?? a.connecting, p = o?.publicKey ?? a.publicKey, y = o?.signMessage ?? a.signMessage, w = o?.wallet ?? a.wallet, Y = o?.wallets ?? a.wallets, $ = o ? o.select : (n) => a.select(n), _ = o?.connect ?? a.connect, N = Y.filter(
    (n) => n.adapter.readyState === "Installed" || n.adapter.readyState === "Loadable"
  ), B = v(async () => {
    if (!E.current) {
      if (!p || !y) {
        t?.(new Error("Wallet not ready"));
        return;
      }
      E.current = !0;
      try {
        const n = p.toBase58(), M = await L(n), Q = new TextEncoder().encode(M.message), K = await y(Q);
        if (!(K instanceof Uint8Array) || K.length === 0)
          throw new Error("Wallet returned invalid signature");
        let q;
        try {
          q = btoa(String.fromCharCode(...K));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await d(n, q, M.message), A.current = !1, e?.();
      } catch (n) {
        const M = n instanceof Error ? n : new Error(String(n));
        A.current = !0, t?.(M);
      } finally {
        E.current = !1, h(!1);
      }
    }
  }, [p, y, L, d, e, t]);
  if (W(() => {
    U && w && !u && !m && (k(!1), _().catch((n) => {
      t?.(n instanceof Error ? n : new Error(String(n))), h(!1);
    }));
  }, [U, w, u, m, _, t]), W(() => {
    g && u && p && y && !E.current && B().catch(() => {
    });
  }, [g, u, p, y, B]), W(() => {
    r ? z.current = !0 : z.current && (z.current = !1, g && !u && w && !m ? k(!0) : g && !u && h(!1));
  }, [r, g, u, w, m]), f && N.length === 0)
    return null;
  const O = async () => {
    l || i || m || (u && p && y && !A.current ? (h(!0), await B()) : N.length === 1 && !w ? ($(N[0].adapter.name), h(!0), k(!0)) : (A.current = !1, w && a.select(null), C(!0), h(!0)));
  }, G = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, J = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, I = i || m || g && !u;
  return W(() => {
    S?.(I);
  }, [I, S]), /* @__PURE__ */ F(
    "button",
    {
      type: "button",
      className: `cedros-button ${J[s]} ${G[P]} ${b}`,
      onClick: O,
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
    const t = require("@solana-mobile/wallet-standard-mobile"), b = e?.chains ?? ["solana:mainnet"], s = {
      appIdentity: {
        name: e?.name,
        uri: e?.uri,
        icon: e?.icon
      },
      chains: b
    };
    return typeof t.createDefaultAuthorizationCache == "function" && (s.authorizationCache = t.createDefaultAuthorizationCache()), typeof t.createDefaultChainSelector == "function" && (s.chainSelector = t.createDefaultChainSelector()), typeof t.createDefaultWalletNotFoundHandler == "function" && (s.onWalletNotFound = t.createDefaultWalletNotFoundHandler()), t.registerMwa(s), !0;
  } catch {
    return !1;
  }
}
export {
  ge as S,
  he as r,
  re as u
};
