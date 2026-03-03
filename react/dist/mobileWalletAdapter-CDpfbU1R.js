import { jsx as i, jsxs as U } from "react/jsx-runtime";
import { useState as I, useMemo as J, useCallback as A, useRef as _, useEffect as z } from "react";
import { WalletProvider as Q, useWallet as X } from "@solana/wallet-adapter-react";
import { WalletModalProvider as q, useWalletModal as Z } from "@solana/wallet-adapter-react-ui";
import { u as x, A as ee, h as F } from "./useCedrosLogin-_94MmGGq.js";
import { a as H } from "./validation-B8kMV3BL.js";
import { L as te } from "./LoadingSpinner-6vml-zwr.js";
function ne() {
  const { config: e, _internal: t } = x(), [w, r] = I(!1), [M, l] = I(null), g = J(
    () => new ee({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), s = A(
    async (d) => {
      if (!H(d)) {
        const n = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw l(n), n;
      }
      r(!0), l(null);
      try {
        return await g.post(
          "/solana/challenge",
          { publicKey: d },
          { credentials: "omit" }
        );
      } catch (n) {
        const f = F(n, "Failed to get challenge");
        throw l(f), f;
      } finally {
        r(!1);
      }
    },
    [g]
  ), S = A(
    async (d, n, f) => {
      if (!H(d)) {
        const o = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw l(o), o;
      }
      r(!0), l(null);
      try {
        const o = await g.post("/solana", {
          publicKey: d,
          signature: n,
          message: f
        });
        return e.callbacks?.onLoginSuccess?.(o.user, "solana"), t?.handleLoginSuccess(o.user, o.tokens), o;
      } catch (o) {
        const c = F(o, "Solana sign-in failed");
        throw l(c), c;
      } finally {
        r(!1);
      }
    },
    [g, e.callbacks, t]
  ), L = A(() => l(null), []);
  return {
    requestChallenge: s,
    signIn: S,
    isLoading: w,
    error: M,
    clearError: L
  };
}
const ae = [];
function de(e) {
  return e.walletContext ? /* @__PURE__ */ i(q, { children: /* @__PURE__ */ i(V, { ...e }) }) : /* @__PURE__ */ i(Q, { wallets: ae, localStorageKey: "cedros-walletName", children: /* @__PURE__ */ i(q, { children: /* @__PURE__ */ i(V, { ...e }) }) });
}
function V({
  onSuccess: e,
  onError: t,
  className: w = "",
  variant: r = "default",
  size: M = "md",
  disabled: l = !1,
  hideIfNoWallet: g = !0,
  walletContext: s
}) {
  const { requestChallenge: S, signIn: L, isLoading: d } = ne(), n = X(), { visible: f, setVisible: o } = Z(), [c, h] = I(!1), [N, W] = I(!1), C = _(!1), v = _(!1), u = s?.connected ?? n.connected, m = s?.connecting ?? n.connecting, p = s?.publicKey ?? n.publicKey, y = s?.signMessage ?? n.signMessage, b = s?.wallet ?? n.wallet, R = s?.wallets ?? n.wallets, Y = s ? s.select : (a) => n.select(a), B = s?.connect ?? n.connect, D = R.filter(
    (a) => a.adapter.readyState === "Installed" || a.adapter.readyState === "Loadable"
  ), P = A(async () => {
    if (!C.current) {
      if (!p || !y) {
        t?.(new Error("Wallet not ready"));
        return;
      }
      C.current = !0;
      try {
        const a = p.toBase58(), E = await S(a), G = new TextEncoder().encode(E.message), k = await y(G);
        if (!(k instanceof Uint8Array) || k.length === 0)
          throw new Error("Wallet returned invalid signature");
        let T;
        try {
          T = btoa(String.fromCharCode(...k));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await L(a, T, E.message), e?.();
      } catch (a) {
        const E = a instanceof Error ? a : new Error(String(a));
        t?.(E);
      } finally {
        C.current = !1, h(!1);
      }
    }
  }, [p, y, S, L, e, t]);
  if (z(() => {
    N && b && !u && !m && (W(!1), B().catch((a) => {
      t?.(a instanceof Error ? a : new Error(String(a))), h(!1);
    }));
  }, [N, b, u, m, B, t]), z(() => {
    c && u && p && y && !C.current && P().catch(() => {
    });
  }, [c, u, p, y, P]), z(() => {
    f ? v.current = !0 : v.current && (v.current = !1, c && !u && b && !m ? W(!0) : c && !u && !b && h(!1));
  }, [f, c, u, b, m]), g && D.length === 0)
    return null;
  const $ = async () => {
    l || d || m || (u && p && y ? (h(!0), await P()) : D.length === 1 ? (Y(D[0].adapter.name), h(!0), W(!0)) : (o(!0), h(!0)));
  }, j = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, O = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, K = d || m || c && !u;
  return /* @__PURE__ */ U(
    "button",
    {
      type: "button",
      className: `cedros-button ${O[r]} ${j[M]} ${w}`,
      onClick: $,
      disabled: l || K,
      "aria-label": "Continue with Solana",
      children: [
        K ? /* @__PURE__ */ i(te, { size: "sm" }) : /* @__PURE__ */ U(
          "svg",
          {
            className: "cedros-button-icon",
            width: "18",
            height: "18",
            viewBox: "0 0 128 128",
            fill: "currentColor",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ i("path", { d: "M25.38 96.04a4.35 4.35 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7l-17.71 17.72a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7l17.71-17.72z" }),
              /* @__PURE__ */ i("path", { d: "M25.38 11.81a4.47 4.47 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7L103.96 31.96a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7L25.38 11.81z" }),
              /* @__PURE__ */ i("path", { d: "M102.62 53.76a4.35 4.35 0 0 0-3.07-1.27H7.87c-1.93 0-2.9 2.34-1.54 3.7l17.71 17.72a4.35 4.35 0 0 0 3.07 1.27h91.68c1.93 0 2.9-2.34 1.54-3.7L102.62 53.76z" })
            ]
          }
        ),
        /* @__PURE__ */ i("span", { children: "Continue with Solana" })
      ]
    }
  );
}
function fe(e) {
  if (typeof window > "u")
    return !1;
  try {
    const t = require("@solana-mobile/wallet-standard-mobile"), w = e?.chains ?? ["solana:mainnet"], r = {
      appIdentity: {
        name: e?.name,
        uri: e?.uri,
        icon: e?.icon
      },
      chains: w
    };
    return typeof t.createDefaultAuthorizationCache == "function" && (r.authorizationCache = t.createDefaultAuthorizationCache()), typeof t.createDefaultChainSelector == "function" && (r.chainSelector = t.createDefaultChainSelector()), typeof t.createDefaultWalletNotFoundHandler == "function" && (r.onWalletNotFound = t.createDefaultWalletNotFoundHandler()), t.registerMwa(r), !0;
  } catch {
    return !1;
  }
}
export {
  de as S,
  fe as r,
  ne as u
};
