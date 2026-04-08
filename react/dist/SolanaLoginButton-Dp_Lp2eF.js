import { jsx as o, jsxs as _ } from "react/jsx-runtime";
import { useState as L, useMemo as ne, useCallback as R, useEffect as M, useRef as U } from "react";
import { u as ae, A as re, h as $ } from "./useCedrosLogin-BDbp-ld1.js";
import { a as F } from "./validation-B8kMV3BL.js";
import { L as O } from "./ErrorMessage-59nRkszi.js";
function oe() {
  const { config: e, _internal: t } = ae(), [n, s] = L(!1), [f, l] = L(null), i = ne(
    () => new re({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), h = R(
    async (g) => {
      if (!F(g)) {
        const u = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw l(u), u;
      }
      s(!0), l(null);
      try {
        return await i.post(
          "/solana/challenge",
          { publicKey: g },
          { credentials: "omit" }
        );
      } catch (u) {
        const m = $(u, "Unable to start wallet verification. Please try again.");
        throw l(m), m;
      } finally {
        s(!1);
      }
    },
    [i]
  ), w = R(
    async (g, u, m, A) => {
      if (!F(g)) {
        const a = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw l(a), a;
      }
      s(!0), l(null);
      try {
        const a = await i.post("/solana", {
          publicKey: g,
          signature: u,
          message: m,
          referral: t?.getReferralCode?.() ?? void 0,
          access_code: A || void 0
        });
        return e.callbacks?.onLoginSuccess?.(a.user, "solana"), t?.handleLoginSuccess(a.user, a.tokens), a;
      } catch (a) {
        const C = $(a, "Unable to sign in with your wallet. Please try again.");
        throw l(C), C;
      } finally {
        s(!1);
      }
    },
    [i, e.callbacks, t]
  ), c = R(() => l(null), []);
  return {
    requestChallenge: h,
    signIn: w,
    isLoading: n,
    error: f,
    clearError: c
  };
}
async function se(e) {
  if (typeof window > "u")
    return !1;
  try {
    const t = await import("@solana-mobile/wallet-standard-mobile"), n = e?.chains ?? ["solana:mainnet"];
    return t.registerMwa({
      appIdentity: {
        name: e?.name,
        uri: e?.uri,
        icon: e?.icon
      },
      chains: n,
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
function q(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.connect == "function" || typeof t.signMessage == "function" || typeof t.signTransaction == "function" || "isConnected" in t;
}
function Y() {
  if (typeof navigator > "u") return !1;
  const e = navigator.userAgent, t = "brave" in navigator;
  return /Android/i.test(e) && /Chrome\/\d+/.test(e) && !t;
}
function we() {
  if (typeof window > "u")
    return !1;
  const e = window;
  for (const t of le) {
    const n = e[t];
    if (n && typeof n == "object" && "solana" in n && q(n.solana))
      return !0;
  }
  return !!(q(e.solana) || Y());
}
Y() && se();
async function ie() {
  const e = "@solana/wallet-adapter-react", t = "@solana/wallet-adapter-react-ui", n = await import(
    /* @vite-ignore */
    e
  ), s = await import(
    /* @vite-ignore */
    t
  );
  return {
    WalletProvider: n.WalletProvider,
    WalletModalProvider: s.WalletModalProvider,
    useWallet: n.useWallet,
    useWalletModal: s.useWalletModal
  };
}
const ce = [];
function pe(e) {
  const [t, n] = L(null), [s, f] = L(!1);
  if (M(() => {
    let h = !1;
    return ie().then((w) => {
      h || n(w);
    }).catch(() => {
      h || f(!0);
    }), () => {
      h = !0;
    };
  }, []), !t)
    return s && e.hideIfNoWallet !== !1 ? null : /* @__PURE__ */ o(ue, { ...e, isLoading: !s });
  const { WalletProvider: l, WalletModalProvider: i } = t;
  return e.walletContext ? /* @__PURE__ */ o(i, { children: /* @__PURE__ */ o(H, { runtime: t, ...e }) }) : /* @__PURE__ */ o(l, { wallets: ce, localStorageKey: "cedros-walletName", children: /* @__PURE__ */ o(i, { children: /* @__PURE__ */ o(H, { runtime: t, ...e }) }) });
}
function H({
  runtime: e,
  onSuccess: t,
  onError: n,
  className: s = "",
  variant: f = "default",
  size: l = "md",
  disabled: i = !1,
  hideIfNoWallet: h = !0,
  onLoadingChange: w,
  walletContext: c,
  accessCode: g
}) {
  const { requestChallenge: u, signIn: m, isLoading: A } = oe(), a = e.useWallet(), { visible: C, setVisible: J } = e.useWalletModal(), [p, b] = L(!1), [V, z] = L(!1), E = U(!1), B = U(!1), I = U(!1), d = c?.connected ?? a.connected, y = c?.connecting ?? a.connecting, S = c?.publicKey ?? a.publicKey, v = c?.signMessage ?? a.signMessage, W = c?.wallet ?? a.wallet, Q = c?.wallets ?? a.wallets, X = c ? c.select : (r) => a.select(r), j = c?.connect ?? a.connect, N = Q.filter(
    (r) => r.adapter.readyState === "Installed" || r.adapter.readyState === "Loadable"
  ), D = R(async () => {
    if (!E.current) {
      if (!S || !v) {
        n?.(new Error("Wallet not ready"));
        return;
      }
      E.current = !0;
      try {
        const r = S.toBase58(), k = await u(r), te = new TextEncoder().encode(k.message), T = await v(te);
        if (!(T instanceof Uint8Array) || T.length === 0)
          throw new Error("Wallet returned invalid signature");
        let K;
        try {
          K = btoa(String.fromCharCode(...T));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await m(r, K, k.message, g), I.current = !1, t?.();
      } catch (r) {
        const k = r instanceof Error ? r : new Error(String(r));
        I.current = !0, n?.(k);
      } finally {
        E.current = !1, b(!1);
      }
    }
  }, [S, v, u, m, t, n, g]);
  M(() => {
    V && W && !d && !y && (z(!1), j().catch((r) => {
      n?.(r instanceof Error ? r : new Error(String(r))), b(!1);
    }));
  }, [V, W, d, y, j, n]), M(() => {
    p && d && S && v && !E.current && D().catch(() => {
    });
  }, [p, d, S, v, D]), M(() => {
    C ? B.current = !0 : B.current && (B.current = !1, p && !d && W && !y ? z(!0) : p && !d && b(!1));
  }, [C, p, d, W, y]);
  const Z = async () => {
    i || A || y || (d && S && v && !I.current ? (b(!0), await D()) : N.length === 1 && !W ? (X(N[0].adapter.name), b(!0), z(!0)) : (I.current = !1, W && a.select(null), J(!0), b(!0)));
  }, x = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, ee = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, P = A || y || p && !d;
  return M(() => {
    w?.(P);
  }, [P, w]), h && N.length === 0 ? null : /* @__PURE__ */ _(
    "button",
    {
      type: "button",
      className: `cedros-button ${ee[f]} ${x[l]} ${s}`,
      onClick: Z,
      disabled: i || P,
      "aria-label": "Continue with Solana",
      children: [
        P ? /* @__PURE__ */ o(O, { size: "sm" }) : /* @__PURE__ */ o(G, {}),
        /* @__PURE__ */ o("span", { children: "Continue with Solana" })
      ]
    }
  );
}
function ue({
  className: e = "",
  variant: t = "default",
  size: n = "md",
  disabled: s = !1,
  isLoading: f = !0
}) {
  const l = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ _(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[t]} ${l[n]} ${e}`,
      disabled: s || f,
      "aria-label": "Continue with Solana",
      children: [
        f ? /* @__PURE__ */ o(O, { size: "sm" }) : /* @__PURE__ */ o(G, {}),
        /* @__PURE__ */ o("span", { children: "Continue with Solana" })
      ]
    }
  );
}
function G() {
  return /* @__PURE__ */ _(
    "svg",
    {
      className: "cedros-button-icon",
      width: "18",
      height: "18",
      viewBox: "0 0 128 128",
      fill: "currentColor",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ o("path", { d: "M25.38 96.04a4.35 4.35 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7l-17.71 17.72a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7l17.71-17.72z" }),
        /* @__PURE__ */ o("path", { d: "M25.38 11.81a4.47 4.47 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7L103.96 31.96a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7L25.38 11.81z" }),
        /* @__PURE__ */ o("path", { d: "M102.62 53.76a4.35 4.35 0 0 0-3.07-1.27H7.87c-1.93 0-2.9 2.34-1.54 3.7l17.71 17.72a4.35 4.35 0 0 0 3.07 1.27h91.68c1.93 0 2.9-2.34 1.54-3.7L102.62 53.76z" })
      ]
    }
  );
}
export {
  pe as S,
  we as d,
  se as r,
  oe as u
};
