import { jsx as c, jsxs as j } from "react/jsx-runtime";
import { useState as P, useMemo as x, useCallback as W, useRef as D, useEffect as M } from "react";
import { WalletProvider as ee, useWallet as te } from "@solana/wallet-adapter-react";
import { WalletModalProvider as K, useWalletModal as ne } from "@solana/wallet-adapter-react-ui";
import { u as ae, A as re, h as q } from "./useCedrosLogin-CFfID-0i.js";
import { a as H } from "./validation-B8kMV3BL.js";
import { L as se } from "./LoadingSpinner-6vml-zwr.js";
function oe() {
  const { config: e, _internal: t } = ae(), [o, d] = P(!1), [k, l] = P(null), g = x(
    () => new re({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), S = W(
    async (f) => {
      if (!H(f)) {
        const i = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw l(i), i;
      }
      d(!0), l(null);
      try {
        return await g.post(
          "/solana/challenge",
          { publicKey: f },
          { credentials: "omit" }
        );
      } catch (i) {
        const a = q(i, "Unable to start wallet verification. Please try again.");
        throw l(a), a;
      } finally {
        d(!1);
      }
    },
    [g]
  ), s = W(
    async (f, i, a) => {
      if (!H(f)) {
        const r = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw l(r), r;
      }
      d(!0), l(null);
      try {
        const r = await g.post("/solana", {
          publicKey: f,
          signature: i,
          message: a,
          referral: t?.getReferralCode?.() ?? void 0
        });
        return e.callbacks?.onLoginSuccess?.(r.user, "solana"), t?.handleLoginSuccess(r.user, r.tokens), r;
      } catch (r) {
        const v = q(r, "Unable to sign in with your wallet. Please try again.");
        throw l(v), v;
      } finally {
        d(!1);
      }
    },
    [g, e.callbacks, t]
  ), L = W(() => l(null), []);
  return {
    requestChallenge: S,
    signIn: s,
    isLoading: o,
    error: k,
    clearError: L
  };
}
async function le(e) {
  if (typeof window > "u")
    return !1;
  try {
    const t = await import("@solana-mobile/wallet-standard-mobile"), o = e?.chains ?? ["solana:mainnet"];
    return t.registerMwa({
      appIdentity: {
        name: e?.name,
        uri: e?.uri,
        icon: e?.icon
      },
      chains: o,
      authorizationCache: t.createDefaultAuthorizationCache(),
      chainSelector: t.createDefaultChainSelector(),
      onWalletNotFound: t.createDefaultWalletNotFoundHandler()
    }), !0;
  } catch {
    return !1;
  }
}
const ie = [
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
function F(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.connect == "function" || typeof t.signMessage == "function" || typeof t.signTransaction == "function" || "isConnected" in t;
}
function Y() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent, t = "brave" in navigator;
  return /Android/i.test(e) && /Chrome\/\d+/.test(e) && !t;
}
function ye() {
  if (typeof window > "u")
    return !1;
  const e = window;
  for (const t of ie) {
    const o = e[t];
    if (o && typeof o == "object" && "solana" in o && F(o.solana))
      return !0;
  }
  return !!(F(e.solana) || Y());
}
Y() && le();
const ce = [];
function we(e) {
  return e.walletContext ? /* @__PURE__ */ c(K, { children: /* @__PURE__ */ c(O, { ...e }) }) : /* @__PURE__ */ c(ee, { wallets: ce, localStorageKey: "cedros-walletName", children: /* @__PURE__ */ c(K, { children: /* @__PURE__ */ c(O, { ...e }) }) });
}
function O({
  onSuccess: e,
  onError: t,
  className: o = "",
  variant: d = "default",
  size: k = "md",
  disabled: l = !1,
  hideIfNoWallet: g = !0,
  onLoadingChange: S,
  walletContext: s
}) {
  const { requestChallenge: L, signIn: f, isLoading: i } = oe(), a = te(), { visible: r, setVisible: v } = ne(), [h, m] = P(!1), [N, B] = P(!1), A = D(!1), R = D(!1), C = D(!1), u = s?.connected ?? a.connected, p = s?.connecting ?? a.connecting, y = s?.publicKey ?? a.publicKey, w = s?.signMessage ?? a.signMessage, b = s?.wallet ?? a.wallet, $ = s?.wallets ?? a.wallets, G = s ? s.select : (n) => a.select(n), V = s?.connect ?? a.connect, T = $.filter(
    (n) => n.adapter.readyState === "Installed" || n.adapter.readyState === "Loadable"
  ), U = W(async () => {
    if (!A.current) {
      if (!y || !w) {
        t?.(new Error("Wallet not ready"));
        return;
      }
      A.current = !0;
      try {
        const n = y.toBase58(), I = await L(n), Z = new TextEncoder().encode(I.message), z = await w(Z);
        if (!(z instanceof Uint8Array) || z.length === 0)
          throw new Error("Wallet returned invalid signature");
        let _;
        try {
          _ = btoa(String.fromCharCode(...z));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await f(n, _, I.message), C.current = !1, e?.();
      } catch (n) {
        const I = n instanceof Error ? n : new Error(String(n));
        C.current = !0, t?.(I);
      } finally {
        A.current = !1, m(!1);
      }
    }
  }, [y, w, L, f, e, t]);
  if (M(() => {
    N && b && !u && !p && (B(!1), V().catch((n) => {
      t?.(n instanceof Error ? n : new Error(String(n))), m(!1);
    }));
  }, [N, b, u, p, V, t]), M(() => {
    h && u && y && w && !A.current && U().catch(() => {
    });
  }, [h, u, y, w, U]), M(() => {
    r ? R.current = !0 : R.current && (R.current = !1, h && !u && b && !p ? B(!0) : h && !u && m(!1));
  }, [r, h, u, b, p]), g && T.length === 0)
    return null;
  const J = async () => {
    l || i || p || (u && y && w && !C.current ? (m(!0), await U()) : T.length === 1 && !b ? (G(T[0].adapter.name), m(!0), B(!0)) : (C.current = !1, b && a.select(null), v(!0), m(!0)));
  }, Q = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, X = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, E = i || p || h && !u;
  return M(() => {
    S?.(E);
  }, [E, S]), /* @__PURE__ */ j(
    "button",
    {
      type: "button",
      className: `cedros-button ${X[d]} ${Q[k]} ${o}`,
      onClick: J,
      disabled: l || E,
      "aria-label": "Continue with Solana",
      children: [
        E ? /* @__PURE__ */ c(se, { size: "sm" }) : /* @__PURE__ */ j(
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
  we as S,
  ye as d,
  le as r,
  oe as u
};
