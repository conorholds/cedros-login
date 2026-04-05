import { jsx as c, jsxs as K } from "react/jsx-runtime";
import { useState as k, useMemo as ee, useCallback as P, useRef as D, useEffect as W } from "react";
import { WalletProvider as te, useWallet as ne } from "@solana/wallet-adapter-react";
import { WalletModalProvider as q, useWalletModal as ae } from "@solana/wallet-adapter-react-ui";
import { u as re, A as se, h as H } from "./useCedrosLogin-BDbp-ld1.js";
import { a as F } from "./validation-B8kMV3BL.js";
import { L as oe } from "./ErrorMessage-59nRkszi.js";
function ie() {
  const { config: e, _internal: t } = re(), [o, g] = k(!1), [B, i] = k(null), h = ee(
    () => new se({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), L = P(
    async (f) => {
      if (!F(f)) {
        const l = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw i(l), l;
      }
      g(!0), i(null);
      try {
        return await h.post(
          "/solana/challenge",
          { publicKey: f },
          { credentials: "omit" }
        );
      } catch (l) {
        const d = H(l, "Unable to start wallet verification. Please try again.");
        throw i(d), d;
      } finally {
        g(!1);
      }
    },
    [h]
  ), r = P(
    async (f, l, d, s) => {
      if (!F(f)) {
        const a = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw i(a), a;
      }
      g(!0), i(null);
      try {
        const a = await h.post("/solana", {
          publicKey: f,
          signature: l,
          message: d,
          referral: t?.getReferralCode?.() ?? void 0,
          access_code: s || void 0
        });
        return e.callbacks?.onLoginSuccess?.(a.user, "solana"), t?.handleLoginSuccess(a.user, a.tokens), a;
      } catch (a) {
        const A = H(a, "Unable to sign in with your wallet. Please try again.");
        throw i(A), A;
      } finally {
        g(!1);
      }
    },
    [h, e.callbacks, t]
  ), v = P(() => i(null), []);
  return {
    requestChallenge: L,
    signIn: r,
    isLoading: o,
    error: B,
    clearError: v
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
const ce = [
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
function O(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.connect == "function" || typeof t.signMessage == "function" || typeof t.signTransaction == "function" || "isConnected" in t;
}
function $() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent, t = "brave" in navigator;
  return /Android/i.test(e) && /Chrome\/\d+/.test(e) && !t;
}
function we() {
  if (typeof window > "u")
    return !1;
  const e = window;
  for (const t of ce) {
    const o = e[t];
    if (o && typeof o == "object" && "solana" in o && O(o.solana))
      return !0;
  }
  return !!(O(e.solana) || $());
}
$() && le();
const ue = [];
function be(e) {
  return e.walletContext ? /* @__PURE__ */ c(q, { children: /* @__PURE__ */ c(Y, { ...e }) }) : /* @__PURE__ */ c(te, { wallets: ue, localStorageKey: "cedros-walletName", children: /* @__PURE__ */ c(q, { children: /* @__PURE__ */ c(Y, { ...e }) }) });
}
function Y({
  onSuccess: e,
  onError: t,
  className: o = "",
  variant: g = "default",
  size: B = "md",
  disabled: i = !1,
  hideIfNoWallet: h = !0,
  onLoadingChange: L,
  walletContext: r,
  accessCode: v
}) {
  const { requestChallenge: f, signIn: l, isLoading: d } = ie(), s = ne(), { visible: a, setVisible: A } = ae(), [m, p] = k(!1), [N, R] = k(!1), E = D(!1), T = D(!1), C = D(!1), u = r?.connected ?? s.connected, y = r?.connecting ?? s.connecting, w = r?.publicKey ?? s.publicKey, b = r?.signMessage ?? s.signMessage, S = r?.wallet ?? s.wallet, G = r?.wallets ?? s.wallets, J = r ? r.select : (n) => s.select(n), V = r?.connect ?? s.connect, U = G.filter(
    (n) => n.adapter.readyState === "Installed" || n.adapter.readyState === "Loadable"
  ), _ = P(async () => {
    if (!E.current) {
      if (!w || !b) {
        t?.(new Error("Wallet not ready"));
        return;
      }
      E.current = !0;
      try {
        const n = w.toBase58(), M = await f(n), x = new TextEncoder().encode(M.message), z = await b(x);
        if (!(z instanceof Uint8Array) || z.length === 0)
          throw new Error("Wallet returned invalid signature");
        let j;
        try {
          j = btoa(String.fromCharCode(...z));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await l(n, j, M.message, v), C.current = !1, e?.();
      } catch (n) {
        const M = n instanceof Error ? n : new Error(String(n));
        C.current = !0, t?.(M);
      } finally {
        E.current = !1, p(!1);
      }
    }
  }, [w, b, f, l, e, t, v]);
  W(() => {
    N && S && !u && !y && (R(!1), V().catch((n) => {
      t?.(n instanceof Error ? n : new Error(String(n))), p(!1);
    }));
  }, [N, S, u, y, V, t]), W(() => {
    m && u && w && b && !E.current && _().catch(() => {
    });
  }, [m, u, w, b, _]), W(() => {
    a ? T.current = !0 : T.current && (T.current = !1, m && !u && S && !y ? R(!0) : m && !u && p(!1));
  }, [a, m, u, S, y]);
  const Q = async () => {
    i || d || y || (u && w && b && !C.current ? (p(!0), await _()) : U.length === 1 && !S ? (J(U[0].adapter.name), p(!0), R(!0)) : (C.current = !1, S && s.select(null), A(!0), p(!0)));
  }, X = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, Z = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, I = d || y || m && !u;
  return W(() => {
    L?.(I);
  }, [I, L]), h && U.length === 0 ? null : /* @__PURE__ */ K(
    "button",
    {
      type: "button",
      className: `cedros-button ${Z[g]} ${X[B]} ${o}`,
      onClick: Q,
      disabled: i || I,
      "aria-label": "Continue with Solana",
      children: [
        I ? /* @__PURE__ */ c(oe, { size: "sm" }) : /* @__PURE__ */ K(
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
  be as S,
  we as d,
  le as r,
  ie as u
};
