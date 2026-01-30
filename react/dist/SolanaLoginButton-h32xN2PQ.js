import { jsxs as w, Fragment as $, jsx as s } from "react/jsx-runtime";
import { useState as y, useMemo as O, useCallback as I, useRef as Y, useEffect as U } from "react";
import { u as G, A as J, h as _, L as Q } from "./ErrorMessage-Bm1j5mBT.js";
import { a as j } from "./validation-BebL7hMF.js";
function X() {
  const { config: t, _internal: a } = G(), [d, f] = y(!1), [N, r] = y(null), h = O(
    () => new J({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), n = I(
    async (u) => {
      if (!j(u)) {
        const l = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw r(l), l;
      }
      f(!0), r(null);
      try {
        return await h.post(
          "/solana/challenge",
          { publicKey: u },
          { credentials: "omit" }
        );
      } catch (l) {
        const c = _(l, "Failed to get challenge");
        throw r(c), c;
      } finally {
        f(!1);
      }
    },
    [h]
  ), S = I(
    async (u, l, c) => {
      if (!j(u)) {
        const o = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw r(o), o;
      }
      f(!0), r(null);
      try {
        const o = await h.post("/solana", {
          publicKey: u,
          signature: l,
          message: c
        });
        return t.callbacks?.onLoginSuccess?.(o.user, "solana"), a?.handleLoginSuccess(o.user, o.tokens), o;
      } catch (o) {
        const i = _(o, "Solana sign-in failed");
        throw r(i), i;
      } finally {
        f(!1);
      }
    },
    [h, t.callbacks, a]
  ), L = I(() => r(null), []);
  return {
    requestChallenge: n,
    signIn: S,
    isLoading: d,
    error: N,
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
function z(t) {
  if (!t || typeof t != "object") return !1;
  const a = t;
  return typeof a.connect == "function" || typeof a.signMessage == "function" || typeof a.signTransaction == "function" || "isConnected" in a;
}
function x() {
  if (typeof window > "u")
    return !1;
  const t = window;
  for (const a of Z) {
    const d = t[a];
    if (d && typeof d == "object" && "solana" in d && z(d.solana))
      return !0;
  }
  return !!z(t.solana);
}
function oe({
  onSuccess: t,
  onError: a,
  className: d = "",
  variant: f = "default",
  size: N = "md",
  disabled: r = !1,
  hideIfNoWallet: h = !0,
  walletContext: n
}) {
  const { requestChallenge: S, signIn: L, isLoading: u } = X(), [l, c] = y(!1), [o, i] = y(!1), [P, k] = y(!1), v = Y(!1), [q] = y(() => x()), g = n?.connected ?? !1, E = n?.connecting ?? !1, m = n?.publicKey, p = n?.signMessage, W = n?.wallet, b = (n?.wallets ?? []).filter(
    (e) => e.adapter.readyState === "Installed" || e.adapter.readyState === "Loadable"
  ), H = n ? b.length > 0 : q, A = I(async () => {
    if (!v.current) {
      if (!m || !p) {
        a?.(new Error("Wallet not ready"));
        return;
      }
      v.current = !0;
      try {
        const e = m.toBase58(), C = await S(e), F = new TextEncoder().encode(C.message), M = await p(F);
        if (!(M instanceof Uint8Array) || M.length === 0)
          throw new Error("Wallet returned invalid signature");
        let T;
        try {
          T = btoa(String.fromCharCode(...M));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await L(e, T, C.message), t?.();
      } catch (e) {
        const C = e instanceof Error ? e : new Error(String(e));
        a?.(C);
      } finally {
        v.current = !1, i(!1);
      }
    }
  }, [m, p, S, L, t, a]);
  if (U(() => {
    P && W && !g && !E && n?.connect && (k(!1), n.connect().catch((e) => {
      a?.(e instanceof Error ? e : new Error(String(e))), i(!1);
    }));
  }, [P, W, g, E, n, a]), U(() => {
    o && g && m && p && !v.current && A().catch(() => {
    });
  }, [o, g, m, p, A]), h && !H)
    return null;
  const K = async () => {
    r || u || E || (g && m && p ? (i(!0), await A()) : W ? (i(!0), k(!0)) : b.length === 1 ? (n?.select(b[0].adapter.name), i(!0), k(!0)) : b.length > 1 ? c(!0) : a?.(
      new Error("No Solana wallet found. Please install Phantom or another Solana wallet.")
    ));
  }, R = (e) => {
    c(!1), n?.select(e), i(!0), k(!0);
  }, V = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, D = {
    default: "cedros-button-solana",
    outline: "cedros-button-solana-outline"
  }, B = u || E || o && !g;
  return /* @__PURE__ */ w($, { children: [
    /* @__PURE__ */ w(
      "button",
      {
        type: "button",
        className: `cedros-button ${D[f]} ${V[N]} ${d}`,
        onClick: K,
        disabled: r || B,
        "aria-label": "Continue with Solana",
        children: [
          B ? /* @__PURE__ */ s(Q, { size: "sm" }) : /* @__PURE__ */ w(
            "svg",
            {
              className: "cedros-button-icon",
              width: "18",
              height: "18",
              viewBox: "0 0 128 128",
              fill: "currentColor",
              "aria-hidden": "true",
              children: [
                /* @__PURE__ */ s("path", { d: "M25.38 96.04a4.35 4.35 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7l-17.71 17.72a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7l17.71-17.72z" }),
                /* @__PURE__ */ s("path", { d: "M25.38 11.81a4.47 4.47 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7L103.96 31.96a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7L25.38 11.81z" }),
                /* @__PURE__ */ s("path", { d: "M102.62 53.76a4.35 4.35 0 0 0-3.07-1.27H7.87c-1.93 0-2.9 2.34-1.54 3.7l17.71 17.72a4.35 4.35 0 0 0 3.07 1.27h91.68c1.93 0 2.9-2.34 1.54-3.7L102.62 53.76z" })
              ]
            }
          ),
          /* @__PURE__ */ s("span", { children: "Continue with Solana" })
        ]
      }
    ),
    l && /* @__PURE__ */ s(
      "div",
      {
        className: "cedros-modal-backdrop",
        onClick: () => c(!1),
        role: "presentation",
        children: /* @__PURE__ */ w(
          "div",
          {
            className: "cedros-modal cedros-wallet-selector",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "wallet-selector-title",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ w("div", { className: "cedros-modal-header", children: [
                /* @__PURE__ */ s("h2", { id: "wallet-selector-title", className: "cedros-modal-title", children: "Select Wallet" }),
                /* @__PURE__ */ s(
                  "button",
                  {
                    type: "button",
                    className: "cedros-modal-close",
                    onClick: () => c(!1),
                    "aria-label": "Close",
                    children: /* @__PURE__ */ s("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ s(
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
              /* @__PURE__ */ s("div", { className: "cedros-modal-content", children: /* @__PURE__ */ s("div", { className: "cedros-wallet-list", children: b.map((e) => /* @__PURE__ */ w(
                "button",
                {
                  type: "button",
                  className: "cedros-wallet-option",
                  onClick: () => R(e.adapter.name),
                  children: [
                    /* @__PURE__ */ s(
                      "img",
                      {
                        src: e.adapter.icon,
                        alt: "",
                        width: "32",
                        height: "32",
                        className: "cedros-wallet-icon"
                      }
                    ),
                    /* @__PURE__ */ s("span", { children: e.adapter.name })
                  ]
                },
                e.adapter.name
              )) }) })
            ]
          }
        )
      }
    )
  ] });
}
export {
  oe as S,
  x as d,
  X as u
};
