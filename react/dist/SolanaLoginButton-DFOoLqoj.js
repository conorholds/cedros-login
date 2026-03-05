import { jsx as c, jsxs as H } from "react/jsx-runtime";
import { useState as P, useMemo as X, useCallback as W, useRef as K, useEffect as M } from "react";
import { WalletProvider as Z, useWallet as x } from "@solana/wallet-adapter-react";
import { WalletModalProvider as R, useWalletModal as ee } from "@solana/wallet-adapter-react-ui";
import { u as te, A as ne, h as V } from "./useCedrosLogin-CFfID-0i.js";
import { a as F } from "./validation-B8kMV3BL.js";
import { L as ae } from "./LoadingSpinner-6vml-zwr.js";
function re() {
  const { config: e, _internal: t } = te(), [b, s] = P(!1), [D, i] = P(null), f = X(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), S = W(
    async (d) => {
      if (!F(d)) {
        const l = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw i(l), l;
      }
      s(!0), i(null);
      try {
        return await f.post(
          "/solana/challenge",
          { publicKey: d },
          { credentials: "omit" }
        );
      } catch (l) {
        const a = V(l, "Unable to start wallet verification. Please try again.");
        throw i(a), a;
      } finally {
        s(!1);
      }
    },
    [f]
  ), o = W(
    async (d, l, a) => {
      if (!F(d)) {
        const r = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw i(r), r;
      }
      s(!0), i(null);
      try {
        const r = await f.post("/solana", {
          publicKey: d,
          signature: l,
          message: a
        });
        return e.callbacks?.onLoginSuccess?.(r.user, "solana"), t?.handleLoginSuccess(r.user, r.tokens), r;
      } catch (r) {
        const A = V(r, "Unable to sign in with your wallet. Please try again.");
        throw i(A), A;
      } finally {
        s(!1);
      }
    },
    [f, e.callbacks, t]
  ), L = W(() => i(null), []);
  return {
    requestChallenge: S,
    signIn: o,
    isLoading: b,
    error: D,
    clearError: L
  };
}
function se(e) {
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
typeof navigator < "u" && /Android/i.test(navigator.userAgent) && se();
const oe = [];
function he(e) {
  return e.walletContext ? /* @__PURE__ */ c(R, { children: /* @__PURE__ */ c(j, { ...e }) }) : /* @__PURE__ */ c(Z, { wallets: oe, localStorageKey: "cedros-walletName", children: /* @__PURE__ */ c(R, { children: /* @__PURE__ */ c(j, { ...e }) }) });
}
function j({
  onSuccess: e,
  onError: t,
  className: b = "",
  variant: s = "default",
  size: D = "md",
  disabled: i = !1,
  hideIfNoWallet: f = !0,
  onLoadingChange: S,
  walletContext: o
}) {
  const { requestChallenge: L, signIn: d, isLoading: l } = re(), a = x(), { visible: r, setVisible: A } = ee(), [g, h] = P(!1), [T, k] = P(!1), C = K(!1), z = K(!1), E = K(!1), u = o?.connected ?? a.connected, m = o?.connecting ?? a.connecting, y = o?.publicKey ?? a.publicKey, p = o?.signMessage ?? a.signMessage, w = o?.wallet ?? a.wallet, Y = o?.wallets ?? a.wallets, $ = o ? o.select : (n) => a.select(n), _ = o?.connect ?? a.connect, N = Y.filter(
    (n) => n.adapter.readyState === "Installed" || n.adapter.readyState === "Loadable"
  ), U = W(async () => {
    if (!C.current) {
      if (!y || !p) {
        t?.(new Error("Wallet not ready"));
        return;
      }
      C.current = !0;
      try {
        const n = y.toBase58(), I = await L(n), Q = new TextEncoder().encode(I.message), B = await p(Q);
        if (!(B instanceof Uint8Array) || B.length === 0)
          throw new Error("Wallet returned invalid signature");
        let q;
        try {
          q = btoa(String.fromCharCode(...B));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await d(n, q, I.message), E.current = !1, e?.();
      } catch (n) {
        const I = n instanceof Error ? n : new Error(String(n));
        E.current = !0, t?.(I);
      } finally {
        C.current = !1, h(!1);
      }
    }
  }, [y, p, L, d, e, t]);
  if (M(() => {
    T && w && !u && !m && (k(!1), _().catch((n) => {
      t?.(n instanceof Error ? n : new Error(String(n))), h(!1);
    }));
  }, [T, w, u, m, _, t]), M(() => {
    g && u && y && p && !C.current && U().catch(() => {
    });
  }, [g, u, y, p, U]), M(() => {
    r ? z.current = !0 : z.current && (z.current = !1, g && !u && w && !m ? k(!0) : g && !u && h(!1));
  }, [r, g, u, w, m]), f && N.length === 0)
    return null;
  const O = async () => {
    i || l || m || (u && y && p && !E.current ? (h(!0), await U()) : N.length === 1 && !w ? ($(N[0].adapter.name), h(!0), k(!0)) : (E.current = !1, w && a.select(null), A(!0), h(!0)));
  }, G = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, J = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, v = l || m || g && !u;
  return M(() => {
    S?.(v);
  }, [v, S]), /* @__PURE__ */ H(
    "button",
    {
      type: "button",
      className: `cedros-button ${J[s]} ${G[D]} ${b}`,
      onClick: O,
      disabled: i || v,
      "aria-label": "Continue with Solana",
      children: [
        v ? /* @__PURE__ */ c(ae, { size: "sm" }) : /* @__PURE__ */ H(
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
export {
  he as S,
  se as r,
  re as u
};
