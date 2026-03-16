import { jsxs as y, jsx as u } from "react/jsx-runtime";
import { useState as m, useRef as w, useMemo as G, useEffect as A, useCallback as f } from "react";
import { u as S, A as T, h as P } from "./useCedrosLogin-CFfID-0i.js";
import { L as O } from "./LoadingSpinner-6vml-zwr.js";
const z = {
  loading: !1,
  loaded: !1,
  error: null,
  callbacks: [],
  load() {
    return typeof window > "u" || typeof document > "u" ? Promise.reject(new Error("Google Sign-In script loader cannot run in SSR")) : this.loaded ? Promise.resolve() : this.loading ? new Promise((o, i) => {
      this.callbacks.push({ resolve: o, reject: i });
    }) : (this.loading = !0, new Promise((o, i) => {
      this.callbacks.push({ resolve: o, reject: i });
      const d = document.getElementById("google-gsi-script");
      if (d) {
        window.google?.accounts?.id ? (this.loaded = !0, this.loading = !1, this.callbacks.forEach((n) => n.resolve()), this.callbacks = []) : d.addEventListener("load", () => {
          this.loaded = !0, this.loading = !1, this.callbacks.forEach((n) => n.resolve()), this.callbacks = [];
        });
        return;
      }
      const t = document.createElement("script");
      t.src = "https://accounts.google.com/gsi/client", t.async = !0, t.defer = !0, t.id = "google-gsi-script", t.onload = () => {
        this.loaded = !0, this.loading = !1, this.callbacks.forEach((n) => n.resolve()), this.callbacks = [];
      }, t.onerror = () => {
        this.loading = !1, t.remove();
        const n = new Error("Failed to load Google Sign-In script");
        this.callbacks.forEach((g) => g.reject(n)), this.callbacks = [];
      }, document.head.appendChild(t);
    }));
  },
  /**
   * Reset singleton state for test isolation (F-08)
   * @internal - Only use in test setup/teardown
   */
  _reset() {
    this.loading = !1, this.loaded = !1, this.error = null, this.callbacks = [];
  }
};
function U() {
  const { config: o, _internal: i } = S(), [d, t] = m(!1), [n, g] = m(!1), [k, s] = m(null), [b, h] = m(null), a = w(null), E = w(o), c = w(null), p = G(
    () => new T({
      baseUrl: o.serverUrl,
      timeoutMs: o.requestTimeout,
      retryAttempts: o.retryAttempts
    }),
    [o.serverUrl, o.requestTimeout, o.retryAttempts]
  );
  A(() => {
    E.current = o;
  }, [o]);
  const C = f(
    async (e) => {
      const r = a.current;
      if (r) {
        if (e.error) {
          const l = {
            code: "SERVER_ERROR",
            message: e.error === "access_denied" ? "Google sign-in was cancelled." : "Unable to sign in with Google. Please try again."
          };
          s(l), t(!1), a.current = null, r.reject(l);
          return;
        }
        try {
          const l = await p.post("/google", {
            accessToken: e.access_token,
            referral: i?.getReferralCode?.() ?? void 0
          });
          E.current.callbacks?.onLoginSuccess?.(l.user, "google"), i?.handleLoginSuccess(l.user, l.tokens), t(!1), r.resolve(l);
        } catch (l) {
          const R = P(l, "Unable to sign in with Google. Please try again.");
          R.code === "ACCOUNT_LINK_REQUIRED" && h(e.access_token ?? null), s(R), t(!1), r.reject(R);
        } finally {
          a.current = null;
        }
      }
    },
    [p, i]
  ), I = f(
    (e) => {
      const r = a.current;
      if (!r) return;
      const l = {
        code: "SERVER_ERROR",
        message: e.type === "popup_failed_to_open" ? "Google sign-in popup was blocked. Please allow popups for this site." : "Google sign-in was cancelled."
      };
      s(l), t(!1), a.current = null, r.reject(l);
    },
    []
  );
  A(() => {
    if (!o.googleClientId)
      return;
    let e = !0;
    return z.load().then(() => {
      if (!e) return;
      const r = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: o.googleClientId,
        scope: "openid email profile",
        callback: C,
        error_callback: I
      });
      r && (c.current = r, g(!0));
    }).catch(() => {
      e && s({
        code: "SERVER_ERROR",
        message: "Unable to load Google sign-in. Please refresh and try again."
      });
    }), () => {
      e = !1, c.current = null;
    };
  }, [o.googleClientId, C, I]);
  const L = f(async () => {
    if (!o.googleClientId) {
      const e = {
        code: "VALIDATION_ERROR",
        message: "Google Client ID not configured"
      };
      throw s(e), e;
    }
    if (!n) {
      const e = {
        code: "VALIDATION_ERROR",
        message: "Google sign-in is not ready yet. Please wait a moment and try again."
      };
      throw s(e), e;
    }
    if (a.current) {
      const e = {
        code: "VALIDATION_ERROR",
        message: "Google sign-in is already in progress."
      };
      throw s(e), e;
    }
    return t(!0), s(null), new Promise((e, r) => {
      a.current = { resolve: e, reject: r }, c.current?.requestAccessToken();
    });
  }, [o.googleClientId, n]), _ = f(() => s(null), []), v = f(() => h(null), []);
  return {
    signIn: L,
    isLoading: d,
    isInitialized: n,
    error: k,
    clearError: _,
    pendingLinkToken: b,
    clearPendingLink: v
  };
}
function x({
  onSuccess: o,
  onError: i,
  className: d = "",
  variant: t = "default",
  size: n = "md",
  disabled: g = !1
}) {
  const { signIn: k, isLoading: s, isInitialized: b } = U(), h = async () => {
    try {
      await k(), o?.();
    } catch (c) {
      const p = c instanceof Error ? c : new Error(String(c));
      i?.(p);
    }
  }, a = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ y(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[t]} ${a[n]} ${d}`,
      onClick: h,
      disabled: g || !b || s,
      "aria-label": "Sign in with Google",
      children: [
        s ? /* @__PURE__ */ u(O, { size: "sm" }) : /* @__PURE__ */ y(
          "svg",
          {
            className: "cedros-button-icon",
            width: "18",
            height: "18",
            viewBox: "0 0 18 18",
            fill: "none",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ u(
                "path",
                {
                  d: "M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z",
                  fill: "#4285F4"
                }
              ),
              /* @__PURE__ */ u(
                "path",
                {
                  d: "M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332A8.997 8.997 0 0 0 9.003 18z",
                  fill: "#34A853"
                }
              ),
              /* @__PURE__ */ u(
                "path",
                {
                  d: "M3.964 10.712A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.96A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.96 4.042l3.004-2.33z",
                  fill: "#FBBC05"
                }
              ),
              /* @__PURE__ */ u(
                "path",
                {
                  d: "M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 0 0 .96 4.958l3.005 2.332c.708-2.127 2.692-3.71 5.036-3.71z",
                  fill: "#EA4335"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ u("span", { children: "Continue with Google" })
      ]
    }
  );
}
export {
  x as G,
  U as u
};
