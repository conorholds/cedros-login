import { jsx as i, jsxs as V } from "react/jsx-runtime";
import { useState as P, useMemo as X, useCallback as W, useRef as K, useEffect as M } from "react";
import { WalletProvider as Z, useWallet as x } from "@solana/wallet-adapter-react";
import { WalletModalProvider as q, useWalletModal as ee } from "@solana/wallet-adapter-react-ui";
import { u as te, A as ne, h as H } from "./useCedrosLogin-CFfID-0i.js";
import { a as j } from "./validation-B8kMV3BL.js";
import { L as ae } from "./LoadingSpinner-6vml-zwr.js";
function re() {
  const { config: e, _internal: a } = te(), [b, d] = P(!1), [k, o] = P(null), f = X(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), S = W(
    async (u) => {
      if (!j(u)) {
        const l = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw o(l), l;
      }
      d(!0), o(null);
      try {
        return await f.post(
          "/solana/challenge",
          { publicKey: u },
          { credentials: "omit" }
        );
      } catch (l) {
        const n = H(l, "Unable to start wallet verification. Please try again.");
        throw o(n), n;
      } finally {
        d(!1);
      }
    },
    [f]
  ), s = W(
    async (u, l, n) => {
      if (!j(u)) {
        const r = {
          code: "INVALID_PUBLIC_KEY",
          message: "Invalid Solana public key format"
        };
        throw o(r), r;
      }
      d(!0), o(null);
      try {
        const r = await f.post("/solana", {
          publicKey: u,
          signature: l,
          message: n
        });
        return e.callbacks?.onLoginSuccess?.(r.user, "solana"), a?.handleLoginSuccess(r.user, r.tokens), r;
      } catch (r) {
        const v = H(r, "Unable to sign in with your wallet. Please try again.");
        throw o(v), v;
      } finally {
        d(!1);
      }
    },
    [f, e.callbacks, a]
  ), L = W(() => o(null), []);
  return {
    requestChallenge: S,
    signIn: s,
    isLoading: b,
    error: k,
    clearError: L
  };
}
async function se(e) {
  if (typeof window > "u")
    return !1;
  try {
    const a = await import("@solana-mobile/wallet-standard-mobile"), b = e?.chains ?? ["solana:mainnet"];
    return a.registerMwa({
      appIdentity: {
        name: e?.name,
        uri: e?.uri,
        icon: e?.icon
      },
      chains: b,
      authorizationCache: a.createDefaultAuthorizationCache(),
      chainSelector: a.createDefaultChainSelector(),
      onWalletNotFound: a.createDefaultWalletNotFoundHandler()
    }), !0;
  } catch {
    return !1;
  }
}
typeof navigator < "u" && /Android/i.test(navigator.userAgent) && se();
const oe = [];
function he(e) {
  return e.walletContext ? /* @__PURE__ */ i(q, { children: /* @__PURE__ */ i(F, { ...e }) }) : /* @__PURE__ */ i(Z, { wallets: oe, localStorageKey: "cedros-walletName", children: /* @__PURE__ */ i(q, { children: /* @__PURE__ */ i(F, { ...e }) }) });
}
function F({
  onSuccess: e,
  onError: a,
  className: b = "",
  variant: d = "default",
  size: k = "md",
  disabled: o = !1,
  hideIfNoWallet: f = !0,
  onLoadingChange: S,
  walletContext: s
}) {
  const { requestChallenge: L, signIn: u, isLoading: l } = re(), n = x(), { visible: r, setVisible: v } = ee(), [g, h] = P(!1), [T, U] = P(!1), A = K(!1), z = K(!1), E = K(!1), c = s?.connected ?? n.connected, m = s?.connecting ?? n.connecting, y = s?.publicKey ?? n.publicKey, p = s?.signMessage ?? n.signMessage, w = s?.wallet ?? n.wallet, Y = s?.wallets ?? n.wallets, $ = s ? s.select : (t) => n.select(t), _ = s?.connect ?? n.connect, B = Y.filter(
    (t) => t.adapter.readyState === "Installed" || t.adapter.readyState === "Loadable"
  ), N = W(async () => {
    if (!A.current) {
      if (!y || !p) {
        a?.(new Error("Wallet not ready"));
        return;
      }
      A.current = !0;
      try {
        const t = y.toBase58(), C = await L(t), Q = new TextEncoder().encode(C.message), D = await p(Q);
        if (!(D instanceof Uint8Array) || D.length === 0)
          throw new Error("Wallet returned invalid signature");
        let R;
        try {
          R = btoa(String.fromCharCode(...D));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await u(t, R, C.message), E.current = !1, e?.();
      } catch (t) {
        const C = t instanceof Error ? t : new Error(String(t));
        E.current = !0, a?.(C);
      } finally {
        A.current = !1, h(!1);
      }
    }
  }, [y, p, L, u, e, a]);
  if (M(() => {
    T && w && !c && !m && (U(!1), _().catch((t) => {
      a?.(t instanceof Error ? t : new Error(String(t))), h(!1);
    }));
  }, [T, w, c, m, _, a]), M(() => {
    g && c && y && p && !A.current && N().catch(() => {
    });
  }, [g, c, y, p, N]), M(() => {
    r ? z.current = !0 : z.current && (z.current = !1, g && !c && w && !m ? U(!0) : g && !c && h(!1));
  }, [r, g, c, w, m]), f && B.length === 0)
    return null;
  const O = async () => {
    o || l || m || (c && y && p && !E.current ? (h(!0), await N()) : B.length === 1 && !w ? ($(B[0].adapter.name), h(!0), U(!0)) : (E.current = !1, w && n.select(null), v(!0), h(!0)));
  }, G = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, J = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, I = l || m || g && !c;
  return M(() => {
    S?.(I);
  }, [I, S]), /* @__PURE__ */ V(
    "button",
    {
      type: "button",
      className: `cedros-button ${J[d]} ${G[k]} ${b}`,
      onClick: O,
      disabled: o || I,
      "aria-label": "Continue with Solana",
      children: [
        I ? /* @__PURE__ */ i(ae, { size: "sm" }) : /* @__PURE__ */ V(
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
export {
  he as S,
  se as r,
  re as u
};
