import { jsxs as m, Fragment as X, jsx as l } from "react/jsx-runtime";
import { useState as L, useMemo as ee, useCallback as A, useRef as te, useEffect as U } from "react";
import { u as ae, A as ne, h as H } from "./useCedrosLogin-_94MmGGq.js";
import { a as K } from "./validation-B8kMV3BL.js";
import { L as re } from "./LoadingSpinner-6vml-zwr.js";
function oe() {
  const { config: e, _internal: t } = ae(), [o, n] = L(!1), [_, d] = L(null), p = ee(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), r = A(
    async (f) => {
      if (!K(f)) {
        const u = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw d(u), u;
      }
      n(!0), d(null);
      try {
        return await p.post(
          "/solana/challenge",
          { publicKey: f },
          { credentials: "omit" }
        );
      } catch (u) {
        const i = H(u, "Failed to get challenge");
        throw d(i), i;
      } finally {
        n(!1);
      }
    },
    [p]
  ), y = A(
    async (f, u, i) => {
      if (!K(f)) {
        const s = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw d(s), s;
      }
      n(!0), d(null);
      try {
        const s = await p.post("/solana", {
          publicKey: f,
          signature: u,
          message: i
        });
        return e.callbacks?.onLoginSuccess?.(s.user, "solana"), t?.handleLoginSuccess(s.user, s.tokens), s;
      } catch (s) {
        const c = H(s, "Solana sign-in failed");
        throw d(c), c;
      } finally {
        n(!1);
      }
    },
    [p, e.callbacks, t]
  ), v = A(() => d(null), []);
  return {
    requestChallenge: r,
    signIn: y,
    isLoading: o,
    error: _,
    clearError: v
  };
}
const R = [
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
function I(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.connect == "function" || typeof t.signMessage == "function" || typeof t.signTransaction == "function" || "isConnected" in t;
}
function le() {
  try {
    const e = window.__wallet_standard__;
    if (e && typeof e == "object" && "get" in e && typeof e.get == "function") {
      const t = e.get();
      return Array.isArray(t) && t.length > 0;
    }
  } catch {
  }
  return !1;
}
function me() {
  if (typeof window > "u")
    return !1;
  const e = window;
  for (const t of R) {
    const o = e[t];
    if (o && typeof o == "object" && "solana" in o && I(o.solana))
      return !0;
  }
  return !!(I(e.solana) || le());
}
const q = {
  phantom: "Phantom",
  solflare: "Solflare",
  backpack: "Backpack",
  glow: "Glow",
  slope: "Slope",
  sollet: "Sollet",
  coin98: "Coin98",
  clover: "Clover",
  mathWallet: "MathWallet",
  ledger: "Ledger",
  torus: "Torus",
  walletconnect: "WalletConnect",
  solana: "Solana Wallet"
}, O = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12V7H5a2 2 0 0 1 0-4h14v4'/%3E%3Cpath d='M3 5v14a2 2 0 0 0 2 2h16v-5'/%3E%3Cpath d='M18 12a2 2 0 0 0 0 4h4v-4Z'/%3E%3C/svg%3E", se = {
  phantom: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' rx='26' fill='%23AB9FF2'/%3E%3Cpath d='M110.5 64.2c-.3-3-3-5.2-6-4.8-13.6 1.6-25 7.1-33.5 15.9-5.3 5.4-9 11.7-11.3 18.5-1.1 3.3.7 6.9 4.1 7.9 3.3 1.1 6.9-.7 7.9-4.1 1.7-5.1 4.5-9.7 8.3-13.6 6.4-6.6 15-10.7 25.5-12 3-.3 5.2-3 4.8-6l.2-1.8zM110.2 43.8c-.3-3-3-5.2-6-4.8-25.2 3-44.1 18-53.5 39.2-1.3 2.9.1 6.3 3.1 7.6s6.3-.1 7.6-3.1c7.9-17.9 23.8-30.5 45.8-33.1 3-.3 5.2-3 4.8-6l-1.8-1.8zM44.8 44.5c2.9-1.5 4.1-5.1 2.5-8-1.5-2.9-5.1-4.1-8-2.5C24.4 42.1 16 57.9 16 75.8c0 3.3 2.7 6 6 6s6-2.7 6-6c0-14 6.5-26.3 16.8-31.3z' fill='%23FFFDF8'/%3E%3C/svg%3E",
  solflare: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' rx='26' fill='%23FC7227'/%3E%3Cpath d='M64 28l28 36-28 36-28-36z' fill='%23fff'/%3E%3C/svg%3E",
  backpack: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' rx='26' fill='%23E33E3F'/%3E%3Cpath d='M48 42h32v8H48zM40 54h48v36H40z' fill='%23fff'/%3E%3C/svg%3E"
};
function ie() {
  if (typeof window > "u") return [];
  const e = window, t = [];
  for (const o of R) {
    const n = e[o];
    n && typeof n == "object" && "solana" in n && I(n.solana) && t.push({
      key: o,
      name: q[o] ?? o,
      icon: se[o] ?? O,
      provider: n.solana
    });
  }
  return t.length === 0 && I(e.solana) && t.push({
    key: "solana",
    name: q.solana,
    icon: O,
    provider: e.solana
  }), t;
}
function ce(e) {
  if (e instanceof Uint8Array) return e;
  if (e && typeof e == "object" && "signature" in e && e.signature instanceof Uint8Array)
    return e.signature;
  throw new Error("Wallet returned invalid signature format");
}
function pe({
  onSuccess: e,
  onError: t,
  className: o = "",
  variant: n = "default",
  size: _ = "md",
  disabled: d = !1,
  hideIfNoWallet: p = !0,
  walletContext: r
}) {
  const { requestChallenge: y, signIn: v, isLoading: f } = oe(), [u, i] = L(!1), [s, c] = L(!1), [P, M] = L(!1), w = te(!1), [k] = L(
    () => r ? [] : ie()
  ), S = r?.connected ?? !1, N = r?.connecting ?? !1, C = r?.publicKey, E = r?.signMessage, z = r?.wallet, W = (r?.wallets ?? []).filter(
    (a) => a.adapter.readyState === "Installed" || a.adapter.readyState === "Loadable"
  ), V = r ? W.length > 0 : k.length > 0, F = A(async () => {
    if (!w.current) {
      if (!C || !E) {
        t?.(new Error("Wallet not ready"));
        return;
      }
      w.current = !0;
      try {
        const a = C.toBase58(), h = await y(a), g = new TextEncoder().encode(h.message), b = await E(g);
        if (!(b instanceof Uint8Array) || b.length === 0)
          throw new Error("Wallet returned invalid signature");
        let B;
        try {
          B = btoa(String.fromCharCode(...b));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await v(a, B, h.message), e?.();
      } catch (a) {
        const h = a instanceof Error ? a : new Error(String(a));
        t?.(h);
      } finally {
        w.current = !1, c(!1);
      }
    }
  }, [C, E, y, v, e, t]), j = A(
    async (a) => {
      if (!w.current) {
        w.current = !0, c(!0);
        try {
          const g = (await a.provider.connect()).publicKey.toBase58(), b = await y(g), B = new TextEncoder().encode(b.message), Q = await a.provider.signMessage(B), T = ce(Q);
          if (T.length === 0)
            throw new Error("Wallet returned empty signature");
          let x;
          try {
            x = btoa(String.fromCharCode(...T));
          } catch {
            throw new Error("Failed to encode signature");
          }
          await v(g, x, b.message), e?.();
        } catch (h) {
          const g = h instanceof Error ? h : new Error(String(h));
          g.message.includes("User rejected") || g.message.includes("user reject") ? t?.(new Error("Wallet action was cancelled")) : t?.(g);
        } finally {
          w.current = !1, c(!1);
        }
      }
    },
    [y, v, e, t]
  );
  if (U(() => {
    P && z && !S && !N && r?.connect && (M(!1), r.connect().catch((a) => {
      t?.(a instanceof Error ? a : new Error(String(a))), c(!1);
    }));
  }, [P, z, S, N, r, t]), U(() => {
    s && S && C && E && !w.current && F().catch(() => {
    });
  }, [s, S, C, E, F]), p && !V)
    return null;
  const Y = async () => {
    d || f || N || (r ? S && C && E ? (c(!0), await F()) : z ? (c(!0), M(!0)) : W.length === 1 ? (r.select(W[0].adapter.name), c(!0), M(!0)) : W.length > 1 ? i(!0) : t?.(
      new Error("No Solana wallet found. Please install Phantom or another Solana wallet.")
    ) : k.length === 1 ? await j(k[0]) : k.length > 1 ? i(!0) : t?.(
      new Error("No Solana wallet found. Please install Phantom or another Solana wallet.")
    ));
  }, $ = (a) => {
    i(!1), r?.select(a), c(!0), M(!0);
  }, G = (a) => {
    i(!1), j(a).catch(() => {
    });
  }, Z = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, J = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, D = f || N || s && !S;
  return /* @__PURE__ */ m(X, { children: [
    /* @__PURE__ */ m(
      "button",
      {
        type: "button",
        className: `cedros-button ${J[n]} ${Z[_]} ${o}`,
        onClick: Y,
        disabled: d || D,
        "aria-label": "Continue with Solana",
        children: [
          D ? /* @__PURE__ */ l(re, { size: "sm" }) : /* @__PURE__ */ m(
            "svg",
            {
              className: "cedros-button-icon",
              width: "18",
              height: "18",
              viewBox: "0 0 128 128",
              fill: "currentColor",
              "aria-hidden": "true",
              children: [
                /* @__PURE__ */ l("path", { d: "M25.38 96.04a4.35 4.35 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7l-17.71 17.72a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7l17.71-17.72z" }),
                /* @__PURE__ */ l("path", { d: "M25.38 11.81a4.47 4.47 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7L103.96 31.96a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7L25.38 11.81z" }),
                /* @__PURE__ */ l("path", { d: "M102.62 53.76a4.35 4.35 0 0 0-3.07-1.27H7.87c-1.93 0-2.9 2.34-1.54 3.7l17.71 17.72a4.35 4.35 0 0 0 3.07 1.27h91.68c1.93 0 2.9-2.34 1.54-3.7L102.62 53.76z" })
              ]
            }
          ),
          /* @__PURE__ */ l("span", { children: "Continue with Solana" })
        ]
      }
    ),
    u && /* @__PURE__ */ l(
      "div",
      {
        className: "cedros-modal-backdrop",
        onClick: () => i(!1),
        role: "presentation",
        children: /* @__PURE__ */ m(
          "div",
          {
            className: "cedros-modal cedros-wallet-selector",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "wallet-selector-title",
            onClick: (a) => a.stopPropagation(),
            children: [
              /* @__PURE__ */ m("div", { className: "cedros-modal-header", children: [
                /* @__PURE__ */ l("h2", { id: "wallet-selector-title", className: "cedros-modal-title", children: "Select Wallet" }),
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "cedros-modal-close",
                    onClick: () => i(!1),
                    "aria-label": "Close",
                    children: /* @__PURE__ */ l("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ l(
                      "path",
                      {
                        d: "M18 6L6 18M6 6l12 12",
                        stroke: "currentColor",
                        strokeWidth: "2",
                        strokeLinecap: "round"
                      }
                    ) })
                  }
                )
              ] }),
              /* @__PURE__ */ l("div", { className: "cedros-modal-content", children: /* @__PURE__ */ l("div", { className: "cedros-wallet-list", children: r ? W.map((a) => /* @__PURE__ */ m(
                "button",
                {
                  type: "button",
                  className: "cedros-wallet-option",
                  onClick: () => $(a.adapter.name),
                  children: [
                    /* @__PURE__ */ l(
                      "img",
                      {
                        src: a.adapter.icon,
                        alt: "",
                        width: "32",
                        height: "32",
                        className: "cedros-wallet-icon"
                      }
                    ),
                    /* @__PURE__ */ l("span", { children: a.adapter.name })
                  ]
                },
                a.adapter.name
              )) : k.map((a) => /* @__PURE__ */ m(
                "button",
                {
                  type: "button",
                  className: "cedros-wallet-option",
                  onClick: () => G(a),
                  children: [
                    /* @__PURE__ */ l(
                      "img",
                      {
                        src: a.icon,
                        alt: "",
                        width: "32",
                        height: "32",
                        className: "cedros-wallet-icon"
                      }
                    ),
                    /* @__PURE__ */ l("span", { children: a.name })
                  ]
                },
                a.key
              )) }) })
            ]
          }
        )
      }
    )
  ] });
}
function ye(e) {
  if (typeof window > "u")
    return !1;
  try {
    const t = require("@solana-mobile/wallet-standard-mobile"), o = e?.chains ?? ["solana:mainnet"], n = {
      appIdentity: {
        name: e?.name,
        uri: e?.uri,
        icon: e?.icon
      },
      chains: o
    };
    return typeof t.createDefaultAuthorizationCache == "function" && (n.authorizationCache = t.createDefaultAuthorizationCache()), typeof t.createDefaultChainSelector == "function" && (n.chainSelector = t.createDefaultChainSelector()), typeof t.createDefaultWalletNotFoundHandler == "function" && (n.onWalletNotFound = t.createDefaultWalletNotFoundHandler()), t.registerMwa(n), !0;
  } catch {
    return !1;
  }
}
export {
  pe as S,
  me as d,
  ye as r,
  oe as u
};
