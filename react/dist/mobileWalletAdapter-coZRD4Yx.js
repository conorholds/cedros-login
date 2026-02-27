import { jsxs as w, Fragment as $, jsx as r } from "react/jsx-runtime";
import { useState as y, useMemo as O, useCallback as N, useRef as Y, useEffect as z } from "react";
import { u as G, A as J, h as B } from "./useCedrosLogin-_94MmGGq.js";
import { a as j } from "./validation-B8kMV3BL.js";
import { L as Q } from "./LoadingSpinner-6vml-zwr.js";
function X() {
  const { config: e, _internal: t } = G(), [l, s] = y(!1), [A, c] = y(null), h = O(
    () => new J({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), n = N(
    async (f) => {
      if (!j(f)) {
        const i = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw c(i), i;
      }
      s(!0), c(null);
      try {
        return await h.post(
          "/solana/challenge",
          { publicKey: f },
          { credentials: "omit" }
        );
      } catch (i) {
        const d = B(i, "Failed to get challenge");
        throw c(d), d;
      } finally {
        s(!1);
      }
    },
    [h]
  ), S = N(
    async (f, i, d) => {
      if (!j(f)) {
        const o = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw c(o), o;
      }
      s(!0), c(null);
      try {
        const o = await h.post("/solana", {
          publicKey: f,
          signature: i,
          message: d
        });
        return e.callbacks?.onLoginSuccess?.(o.user, "solana"), t?.handleLoginSuccess(o.user, o.tokens), o;
      } catch (o) {
        const u = B(o, "Solana sign-in failed");
        throw c(u), u;
      } finally {
        s(!1);
      }
    },
    [h, e.callbacks, t]
  ), L = N(() => c(null), []);
  return {
    requestChallenge: n,
    signIn: S,
    isLoading: l,
    error: A,
    clearError: L
  };
}
const Z = [
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
function x() {
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
function ee() {
  if (typeof window > "u")
    return !1;
  const e = window;
  for (const t of Z) {
    const l = e[t];
    if (l && typeof l == "object" && "solana" in l && F(l.solana))
      return !0;
  }
  return !!(F(e.solana) || x());
}
function le({
  onSuccess: e,
  onError: t,
  className: l = "",
  variant: s = "default",
  size: A = "md",
  disabled: c = !1,
  hideIfNoWallet: h = !0,
  walletContext: n
}) {
  const { requestChallenge: S, signIn: L, isLoading: f } = X(), [i, d] = y(!1), [o, u] = y(!1), [_, C] = y(!1), W = Y(!1), [H] = y(() => ee()), g = n?.connected ?? !1, k = n?.connecting ?? !1, m = n?.publicKey, p = n?.signMessage, E = n?.wallet, b = (n?.wallets ?? []).filter(
    (a) => a.adapter.readyState === "Installed" || a.adapter.readyState === "Loadable"
  ), T = n ? b.length > 0 : H, I = N(async () => {
    if (!W.current) {
      if (!m || !p) {
        t?.(new Error("Wallet not ready"));
        return;
      }
      W.current = !0;
      try {
        const a = m.toBase58(), v = await S(a), V = new TextEncoder().encode(v.message), M = await p(V);
        if (!(M instanceof Uint8Array) || M.length === 0)
          throw new Error("Wallet returned invalid signature");
        let D;
        try {
          D = btoa(String.fromCharCode(...M));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await L(a, D, v.message), e?.();
      } catch (a) {
        const v = a instanceof Error ? a : new Error(String(a));
        t?.(v);
      } finally {
        W.current = !1, u(!1);
      }
    }
  }, [m, p, S, L, e, t]);
  if (z(() => {
    _ && E && !g && !k && n?.connect && (C(!1), n.connect().catch((a) => {
      t?.(a instanceof Error ? a : new Error(String(a))), u(!1);
    }));
  }, [_, E, g, k, n, t]), z(() => {
    o && g && m && p && !W.current && I().catch(() => {
    });
  }, [o, g, m, p, I]), h && !T)
    return null;
  const U = async () => {
    c || f || k || (g && m && p ? (u(!0), await I()) : E ? (u(!0), C(!0)) : b.length === 1 ? (n?.select(b[0].adapter.name), u(!0), C(!0)) : b.length > 1 ? d(!0) : t?.(
      new Error("No Solana wallet found. Please install Phantom or another Solana wallet.")
    ));
  }, q = (a) => {
    d(!1), n?.select(a), u(!0), C(!0);
  }, K = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, R = {
    default: "cedros-button-solana",
    outline: "cedros-button-solana-outline"
  }, P = f || k || o && !g;
  return /* @__PURE__ */ w($, { children: [
    /* @__PURE__ */ w(
      "button",
      {
        type: "button",
        className: `cedros-button ${R[s]} ${K[A]} ${l}`,
        onClick: U,
        disabled: c || P,
        "aria-label": "Continue with Solana",
        children: [
          P ? /* @__PURE__ */ r(Q, { size: "sm" }) : /* @__PURE__ */ w(
            "svg",
            {
              className: "cedros-button-icon",
              width: "18",
              height: "18",
              viewBox: "0 0 128 128",
              fill: "currentColor",
              "aria-hidden": "true",
              children: [
                /* @__PURE__ */ r("path", { d: "M25.38 96.04a4.35 4.35 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7l-17.71 17.72a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7l17.71-17.72z" }),
                /* @__PURE__ */ r("path", { d: "M25.38 11.81a4.47 4.47 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7L103.96 31.96a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7L25.38 11.81z" }),
                /* @__PURE__ */ r("path", { d: "M102.62 53.76a4.35 4.35 0 0 0-3.07-1.27H7.87c-1.93 0-2.9 2.34-1.54 3.7l17.71 17.72a4.35 4.35 0 0 0 3.07 1.27h91.68c1.93 0 2.9-2.34 1.54-3.7L102.62 53.76z" })
              ]
            }
          ),
          /* @__PURE__ */ r("span", { children: "Continue with Solana" })
        ]
      }
    ),
    i && /* @__PURE__ */ r(
      "div",
      {
        className: "cedros-modal-backdrop",
        onClick: () => d(!1),
        role: "presentation",
        children: /* @__PURE__ */ w(
          "div",
          {
            className: "cedros-modal cedros-wallet-selector",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "wallet-selector-title",
            onClick: (a) => a.stopPropagation(),
            children: [
              /* @__PURE__ */ w("div", { className: "cedros-modal-header", children: [
                /* @__PURE__ */ r("h2", { id: "wallet-selector-title", className: "cedros-modal-title", children: "Select Wallet" }),
                /* @__PURE__ */ r(
                  "button",
                  {
                    type: "button",
                    className: "cedros-modal-close",
                    onClick: () => d(!1),
                    "aria-label": "Close",
                    children: /* @__PURE__ */ r("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ r(
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
              /* @__PURE__ */ r("div", { className: "cedros-modal-content", children: /* @__PURE__ */ r("div", { className: "cedros-wallet-list", children: b.map((a) => /* @__PURE__ */ w(
                "button",
                {
                  type: "button",
                  className: "cedros-wallet-option",
                  onClick: () => q(a.adapter.name),
                  children: [
                    /* @__PURE__ */ r(
                      "img",
                      {
                        src: a.adapter.icon,
                        alt: "",
                        width: "32",
                        height: "32",
                        className: "cedros-wallet-icon"
                      }
                    ),
                    /* @__PURE__ */ r("span", { children: a.adapter.name })
                  ]
                },
                a.adapter.name
              )) }) })
            ]
          }
        )
      }
    )
  ] });
}
function ce(e) {
  if (typeof window > "u")
    return !1;
  try {
    const t = require("@solana-mobile/wallet-standard-mobile"), l = e?.chains ?? ["solana:mainnet"], s = {
      appIdentity: {
        name: e?.name,
        uri: e?.uri,
        icon: e?.icon
      },
      chains: l
    };
    return typeof t.createDefaultAuthorizationCache == "function" && (s.authorizationCache = t.createDefaultAuthorizationCache()), typeof t.createDefaultChainSelector == "function" && (s.chainSelector = t.createDefaultChainSelector()), typeof t.createDefaultWalletNotFoundHandler == "function" && (s.onWalletNotFound = t.createDefaultWalletNotFoundHandler()), t.registerMwa(s), !0;
  } catch {
    return !1;
  }
}
export {
  le as S,
  ee as d,
  ce as r,
  X as u
};
