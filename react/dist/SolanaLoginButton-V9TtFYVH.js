import { jsx as t, jsxs as I } from "react/jsx-runtime";
import { useState as C, useEffect as S, useRef as B, useCallback as X } from "react";
import { u as Z, i as x, r as ee } from "./mobileWalletAdapter-73nNoL7O.js";
import { L as D } from "./ErrorMessage-DObd7075.js";
x() && ee();
async function te() {
  const n = "@solana/wallet-adapter-react", l = "@solana/wallet-adapter-react-ui", a = await import(
    /* @vite-ignore */
    n
  ), s = await import(
    /* @vite-ignore */
    l
  );
  return {
    WalletProvider: a.WalletProvider,
    WalletModalProvider: s.WalletModalProvider,
    useWallet: a.useWallet,
    useWalletModal: s.useWalletModal
  };
}
const ne = [];
function ie(n) {
  const [l, a] = C(null), [s, c] = C(!1);
  if (S(() => {
    let w = !1;
    return te().then((W) => {
      w || a(W);
    }).catch(() => {
      w || c(!0);
    }), () => {
      w = !0;
    };
  }, []), !l)
    return s && n.hideIfNoWallet !== !1 ? null : /* @__PURE__ */ t(ae, { ...n, isLoading: !s });
  const { WalletProvider: p, WalletModalProvider: u } = l;
  return n.walletContext ? /* @__PURE__ */ t(u, { children: /* @__PURE__ */ t(V, { runtime: l, ...n }) }) : /* @__PURE__ */ t(p, { wallets: ne, localStorageKey: "cedros-walletName", children: /* @__PURE__ */ t(u, { children: /* @__PURE__ */ t(V, { runtime: l, ...n }) }) });
}
function V({
  runtime: n,
  onSuccess: l,
  onError: a,
  className: s = "",
  variant: c = "default",
  size: p = "md",
  disabled: u = !1,
  hideIfNoWallet: w = !0,
  onLoadingChange: W,
  walletContext: r,
  accessCode: $
}) {
  const { requestChallenge: K, signIn: N, isLoading: T } = Z(), o = n.useWallet(), { visible: j, setVisible: O } = n.useWalletModal(), [d, f] = C(!1), [k, P] = C(!1), y = B(!1), z = B(!1), M = B(!1), i = r?.connected ?? o.connected, g = r?.connecting ?? o.connecting, h = r?.publicKey ?? o.publicKey, m = r?.signMessage ?? o.signMessage, b = r?.wallet ?? o.wallet, U = r?.wallets ?? o.wallets, Y = r ? r.select : (e) => o.select(e), F = r?.connect ?? o.connect, A = U.filter(
    (e) => e.adapter.readyState === "Installed" || e.adapter.readyState === "Loadable"
  ), E = X(async () => {
    if (!y.current) {
      if (!h || !m) {
        a?.(new Error("Wallet not ready"));
        return;
      }
      y.current = !0;
      try {
        const e = h.toBase58(), L = await K(e), Q = new TextEncoder().encode(L.message), R = await m(Q);
        if (!(R instanceof Uint8Array) || R.length === 0)
          throw new Error("Wallet returned invalid signature");
        let H;
        try {
          H = btoa(String.fromCharCode(...R));
        } catch {
          throw new Error("Failed to encode signature");
        }
        await N(e, H, L.message, $), M.current = !1, l?.();
      } catch (e) {
        const L = e instanceof Error ? e : new Error(String(e));
        M.current = !0, a?.(L);
      } finally {
        y.current = !1, f(!1);
      }
    }
  }, [h, m, K, N, l, a, $]);
  S(() => {
    k && b && !i && !g && (P(!1), F().catch((e) => {
      a?.(e instanceof Error ? e : new Error(String(e))), f(!1);
    }));
  }, [k, b, i, g, F, a]), S(() => {
    d && i && h && m && !y.current && E().catch(() => {
    });
  }, [d, i, h, m, E]), S(() => {
    j ? z.current = !0 : z.current && (z.current = !1, d && !i && b && !g ? P(!0) : d && !i && f(!1));
  }, [j, d, i, b, g]);
  const _ = async () => {
    u || T || g || (i && h && m && !M.current ? (f(!0), await E()) : A.length === 1 && !b ? (Y(A[0].adapter.name), f(!0), P(!0)) : (M.current = !1, b && o.select(null), O(!0), f(!0)));
  }, G = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, J = {
    default: "cedros-button-social",
    outline: "cedros-button-social-outline"
  }, v = T || g || d && !i;
  return S(() => {
    W?.(v);
  }, [v, W]), w && A.length === 0 ? null : /* @__PURE__ */ I(
    "button",
    {
      type: "button",
      className: `cedros-button ${J[c]} ${G[p]} ${s}`,
      onClick: _,
      disabled: u || v,
      "aria-label": "Continue with Solana",
      children: [
        v ? /* @__PURE__ */ t(D, { size: "sm" }) : /* @__PURE__ */ t(q, {}),
        /* @__PURE__ */ t("span", { children: "Continue with Solana" })
      ]
    }
  );
}
function ae({
  className: n = "",
  variant: l = "default",
  size: a = "md",
  disabled: s = !1,
  isLoading: c = !0
}) {
  const p = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ I(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[l]} ${p[a]} ${n}`,
      disabled: s || c,
      "aria-label": "Continue with Solana",
      children: [
        c ? /* @__PURE__ */ t(D, { size: "sm" }) : /* @__PURE__ */ t(q, {}),
        /* @__PURE__ */ t("span", { children: "Continue with Solana" })
      ]
    }
  );
}
function q() {
  return /* @__PURE__ */ I(
    "svg",
    {
      className: "cedros-button-icon",
      width: "18",
      height: "18",
      viewBox: "0 0 128 128",
      fill: "currentColor",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ t("path", { d: "M25.38 96.04a4.35 4.35 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7l-17.71 17.72a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7l17.71-17.72z" }),
        /* @__PURE__ */ t("path", { d: "M25.38 11.81a4.47 4.47 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7L103.96 31.96a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7L25.38 11.81z" }),
        /* @__PURE__ */ t("path", { d: "M102.62 53.76a4.35 4.35 0 0 0-3.07-1.27H7.87c-1.93 0-2.9 2.34-1.54 3.7l17.71 17.72a4.35 4.35 0 0 0 3.07 1.27h91.68c1.93 0 2.9-2.34 1.54-3.7L102.62 53.76z" })
      ]
    }
  );
}
export {
  ie as SolanaLoginButton
};
