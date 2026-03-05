import { jsx as c, jsxs as j } from "react/jsx-runtime";
import { useState as P, useMemo as x, useCallback as W, useRef as N, useEffect as M } from "react";
import { WalletProvider as ee, useWallet as te } from "@solana/wallet-adapter-react";
import { WalletModalProvider as K, useWalletModal as ne } from "@solana/wallet-adapter-react-ui";
import { u as ae, A as re, h as q } from "./useCedrosLogin-CFfID-0i.js";
import { a as H } from "./validation-B8kMV3BL.js";
import { L as se } from "./LoadingSpinner-6vml-zwr.js";
function oe() {
  const { config: e, _internal: t } = ae(), [o, d] = P(!1), [k, i] = P(null), g = x(
    () => new re({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), S = W(
    async (f) => {
      if (!H(f)) {
        const l = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw i(l), l;
      }
      d(!0), i(null);
      try {
        return await g.post(
          "/solana/challenge",
          { publicKey: f },
          { credentials: "omit" }
        );
      } catch (l) {
        const a = q(l, "Unable to start wallet verification. Please try again.");
        throw i(a), a;
      } finally {
        d(!1);
      }
    },
    [g]
  ), s = W(
    async (f, l, a) => {
      if (!H(f)) {
        const r = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw i(r), r;
      }
      d(!0), i(null);
      try {
        const r = await g.post("/solana", {
          publicKey: f,
          signature: l,
          message: a
        });
        return e.callbacks?.onLoginSuccess?.(r.user, "solana"), t?.handleLoginSuccess(r.user, r.tokens), r;
      } catch (r) {
        const v = q(r, "Unable to sign in with your wallet. Please try again.");
        throw i(v), v;
      } finally {
        d(!1);
      }
    },
    [g, e.callbacks, t]
  ), L = W(() => i(null), []);
  return {
    requestChallenge: S,
    signIn: s,
    isLoading: o,
    error: k,
    clearError: L
  };
}
async function ie(e) {
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
const le = [
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
  for (const t of le) {
    const o = e[t];
    if (o && typeof o == "object" && "solana" in o && F(o.solana))
      return !0;
  }
  return !!(F(e.solana) || Y());
}
Y() && ie();
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
  disabled: i = !1,
  hideIfNoWallet: g = !0,
  onLoadingChange: S,
  walletContext: s
}) {
  const { requestChallenge: L, signIn: f, isLoading: l } = oe(), a = te(), { visible: r, setVisible: v } = ne(), [h, m] = P(!1), [R, B] = P(!1), A = N(!1), T = N(!1), E = N(!1), u = s?.connected ?? a.connected, p = s?.connecting ?? a.connecting, y = s?.publicKey ?? a.publicKey, w = s?.signMessage ?? a.signMessage, b = s?.wallet ?? a.wallet, $ = s?.wallets ?? a.wallets, G = s ? s.select : (n) => a.select(n), V = s?.connect ?? a.connect, U = $.filter(
    (n) => n.adapter.readyState === "Installed" || n.adapter.readyState === "Loadable"
  ), z = W(async () => {
    if (!A.current) {
      if (!y || !w) {
        t?.(new Error("Wallet not ready"));
        return;
      }
      A.current = !0;
      try {
        const n = y.toBase58(), I = await L(n), Z = new TextEncoder().encode(I.message), D = await w(Z);
        if (!(D instanceof Uint8Array) || D.length === 0)
          throw new Error("Wallet returned invalid signature");
        let _;
        try {
          _ = btoa(String.fromCharCode(...D));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await f(n, _, I.message), E.current = !1, e?.();
      } catch (n) {
        const I = n instanceof Error ? n : new Error(String(n));
        E.current = !0, t?.(I);
      } finally {
        A.current = !1, m(!1);
      }
    }
  }, [y, w, L, f, e, t]);
  if (M(() => {
    R && b && !u && !p && (B(!1), V().catch((n) => {
      t?.(n instanceof Error ? n : new Error(String(n))), m(!1);
    }));
  }, [R, b, u, p, V, t]), M(() => {
    h && u && y && w && !A.current && z().catch(() => {
    });
  }, [h, u, y, w, z]), M(() => {
    r ? T.current = !0 : T.current && (T.current = !1, h && !u && b && !p ? B(!0) : h && !u && m(!1));
  }, [r, h, u, b, p]), g && U.length === 0)
    return null;
  const J = async () => {
    i || l || p || (u && y && w && !E.current ? (m(!0), await z()) : U.length === 1 && !b ? (G(U[0].adapter.name), m(!0), B(!0)) : (E.current = !1, b && a.select(null), v(!0), m(!0)));
  }, Q = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, X = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, C = l || p || h && !u;
  return M(() => {
    S?.(C);
  }, [C, S]), /* @__PURE__ */ j(
    "button",
    {
      type: "button",
      className: `cedros-button ${X[d]} ${Q[k]} ${o}`,
      onClick: J,
      disabled: i || C,
      "aria-label": "Continue with Solana",
      children: [
        C ? /* @__PURE__ */ c(se, { size: "sm" }) : /* @__PURE__ */ j(
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
  ie as r,
  oe as u
};
