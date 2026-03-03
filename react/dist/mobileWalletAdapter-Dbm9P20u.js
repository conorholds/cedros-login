import { jsx as i, jsxs as U } from "react/jsx-runtime";
import { useState as A, useMemo as J, useCallback as E, useRef as _, useEffect as P } from "react";
import { WalletProvider as Q, useWallet as X } from "@solana/wallet-adapter-react";
import { WalletModalProvider as q, useWalletModal as Z } from "@solana/wallet-adapter-react-ui";
import { u as x, A as ee, h as F } from "./useCedrosLogin-_94MmGGq.js";
import { a as H } from "./validation-B8kMV3BL.js";
import { L as te } from "./LoadingSpinner-6vml-zwr.js";
function ne() {
  const { config: e, _internal: t } = x(), [y, r] = A(!1), [I, l] = A(null), g = J(
    () => new ee({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), s = E(
    async (c) => {
      if (!H(c)) {
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
          { publicKey: c },
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
  ), w = E(
    async (c, n, f) => {
      if (!H(c)) {
        const o = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw l(o), o;
      }
      r(!0), l(null);
      try {
        const o = await g.post("/solana", {
          publicKey: c,
          signature: n,
          message: f
        });
        return e.callbacks?.onLoginSuccess?.(o.user, "solana"), t?.handleLoginSuccess(o.user, o.tokens), o;
      } catch (o) {
        const u = F(o, "Solana sign-in failed");
        throw l(u), u;
      } finally {
        r(!1);
      }
    },
    [g, e.callbacks, t]
  ), b = E(() => l(null), []);
  return {
    requestChallenge: s,
    signIn: w,
    isLoading: y,
    error: I,
    clearError: b
  };
}
const ae = [];
function de(e) {
  return e.walletContext ? /* @__PURE__ */ i(q, { children: /* @__PURE__ */ i(V, { ...e }) }) : /* @__PURE__ */ i(Q, { wallets: ae, localStorageKey: "cedros-walletName", children: /* @__PURE__ */ i(q, { children: /* @__PURE__ */ i(V, { ...e }) }) });
}
function V({
  onSuccess: e,
  onError: t,
  className: y = "",
  variant: r = "default",
  size: I = "md",
  disabled: l = !1,
  hideIfNoWallet: g = !0,
  walletContext: s
}) {
  const { requestChallenge: w, signIn: b, isLoading: c } = ne(), n = X(), { visible: f, setVisible: o } = Z(), [u, h] = A(!1), [k, z] = A(!1), S = _(!1), M = _(!1), d = s?.connected ?? n.connected, L = s?.connecting ?? n.connecting, m = s?.publicKey ?? n.publicKey, p = s?.signMessage ?? n.signMessage, N = s?.wallet ?? n.wallet, R = s?.wallets ?? n.wallets, Y = s ? s.select : (a) => n.select(a), B = s?.connect ?? n.connect, W = R.filter(
    (a) => a.adapter.readyState === "Installed" || a.adapter.readyState === "Loadable"
  ), v = E(async () => {
    if (!S.current) {
      if (!m || !p) {
        t?.(new Error("Wallet not ready"));
        return;
      }
      S.current = !0;
      try {
        const a = m.toBase58(), C = await w(a), G = new TextEncoder().encode(C.message), D = await p(G);
        if (!(D instanceof Uint8Array) || D.length === 0)
          throw new Error("Wallet returned invalid signature");
        let T;
        try {
          T = btoa(String.fromCharCode(...D));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await b(a, T, C.message), e?.();
      } catch (a) {
        const C = a instanceof Error ? a : new Error(String(a));
        t?.(C);
      } finally {
        S.current = !1, h(!1);
      }
    }
  }, [m, p, w, b, e, t]);
  if (P(() => {
    k && N && !d && !L && (z(!1), B().catch((a) => {
      t?.(a instanceof Error ? a : new Error(String(a))), h(!1);
    }));
  }, [k, N, d, L, B, t]), P(() => {
    u && d && m && p && !S.current && v().catch(() => {
    });
  }, [u, d, m, p, v]), P(() => {
    f ? M.current = !0 : M.current && (M.current = !1, u && !d && h(!1));
  }, [f, u, d]), g && W.length === 0)
    return null;
  const $ = async () => {
    l || c || L || (d && m && p ? (h(!0), await v()) : W.length === 1 ? (Y(W[0].adapter.name), h(!0), z(!0)) : (o(!0), h(!0)));
  }, j = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, O = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, K = c || L || u && !d;
  return /* @__PURE__ */ U(
    "button",
    {
      type: "button",
      className: `cedros-button ${O[r]} ${j[I]} ${y}`,
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
    const t = require("@solana-mobile/wallet-standard-mobile"), y = e?.chains ?? ["solana:mainnet"], r = {
      appIdentity: {
        name: e?.name,
        uri: e?.uri,
        icon: e?.icon
      },
      chains: y
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
