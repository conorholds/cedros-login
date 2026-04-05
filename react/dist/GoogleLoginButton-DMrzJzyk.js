import { jsxs as A, jsx as u } from "react/jsx-runtime";
import { useState as R, useRef as E, useMemo as S, useEffect as v, useCallback as f } from "react";
import { u as T, A as P, h as O } from "./useCedrosLogin-BDbp-ld1.js";
import { L as z } from "./ErrorMessage-59nRkszi.js";
const U = {
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
        window.google?.accounts?.id ? (this.loaded = !0, this.loading = !1, this.callbacks.forEach((s) => s.resolve()), this.callbacks = []) : d.addEventListener("load", () => {
          this.loaded = !0, this.loading = !1, this.callbacks.forEach((s) => s.resolve()), this.callbacks = [];
        });
        return;
      }
      const t = document.createElement("script");
      t.src = "https://accounts.google.com/gsi/client", t.async = !0, t.defer = !0, t.id = "google-gsi-script", t.onload = () => {
        this.loaded = !0, this.loading = !1, this.callbacks.forEach((s) => s.resolve()), this.callbacks = [];
      }, t.onerror = () => {
        this.loading = !1, t.remove();
        const s = new Error("Failed to load Google Sign-In script");
        this.callbacks.forEach((g) => g.reject(s)), this.callbacks = [];
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
function j() {
  const { config: o, _internal: i } = T(), [d, t] = R(!1), [s, g] = R(!1), [w, l] = R(null), [h, p] = R(null), a = E(null), m = E(o), k = E(null), c = E(void 0), b = S(
    () => new P({
      baseUrl: o.serverUrl,
      timeoutMs: o.requestTimeout,
      retryAttempts: o.retryAttempts
    }),
    [o.serverUrl, o.requestTimeout, o.retryAttempts]
  );
  v(() => {
    m.current = o;
  }, [o]);
  const I = f(
    async (r) => {
      const e = a.current;
      if (e) {
        if (r.error) {
          const n = {
            code: "SERVER_ERROR",
            message: r.error === "access_denied" ? "Google sign-in was cancelled." : "Unable to sign in with Google. Please try again."
          };
          l(n), t(!1), a.current = null, e.reject(n);
          return;
        }
        try {
          const n = await b.post("/google", {
            accessToken: r.access_token,
            referral: i?.getReferralCode?.() ?? void 0,
            access_code: c.current || void 0
          });
          m.current.callbacks?.onLoginSuccess?.(n.user, "google"), i?.handleLoginSuccess(n.user, n.tokens), t(!1), e.resolve(n);
        } catch (n) {
          const C = O(n, "Unable to sign in with Google. Please try again.");
          C.code === "ACCOUNT_LINK_REQUIRED" && p(r.access_token ?? null), l(C), t(!1), e.reject(C);
        } finally {
          a.current = null, c.current = void 0;
        }
      }
    },
    [b, i]
  ), y = f(
    (r) => {
      const e = a.current;
      if (!e) return;
      const n = {
        code: "SERVER_ERROR",
        message: r.type === "popup_failed_to_open" ? "Google sign-in popup was blocked. Please allow popups for this site." : "Google sign-in was cancelled."
      };
      l(n), t(!1), a.current = null, e.reject(n);
    },
    []
  );
  v(() => {
    if (!o.googleClientId)
      return;
    let r = !0;
    return U.load().then(() => {
      if (!r) return;
      const e = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: o.googleClientId,
        scope: "openid email profile",
        callback: I,
        error_callback: y
      });
      e && (k.current = e, g(!0));
    }).catch(() => {
      r && l({
        code: "SERVER_ERROR",
        message: "Unable to load Google sign-in. Please refresh and try again."
      });
    }), () => {
      r = !1, k.current = null;
    };
  }, [o.googleClientId, I, y]);
  const _ = f(async (r) => {
    if (c.current = r, !o.googleClientId) {
      const e = {
        code: "VALIDATION_ERROR",
        message: "Google Client ID not configured"
      };
      throw l(e), e;
    }
    if (!s) {
      const e = {
        code: "VALIDATION_ERROR",
        message: "Google sign-in is not ready yet. Please wait a moment and try again."
      };
      throw l(e), e;
    }
    if (a.current) {
      const e = {
        code: "VALIDATION_ERROR",
        message: "Google sign-in is already in progress."
      };
      throw l(e), e;
    }
    return t(!0), l(null), new Promise((e, n) => {
      a.current = { resolve: e, reject: n }, k.current?.requestAccessToken();
    });
  }, [o.googleClientId, s]), L = f(() => l(null), []), G = f(() => p(null), []);
  return {
    signIn: _,
    isLoading: d,
    isInitialized: s,
    error: w,
    clearError: L,
    pendingLinkToken: h,
    clearPendingLink: G
  };
}
function B({
  onSuccess: o,
  onError: i,
  className: d = "",
  variant: t = "default",
  size: s = "md",
  disabled: g = !1,
  accessCode: w
}) {
  const { signIn: l, isLoading: h, isInitialized: p } = j(), a = async () => {
    try {
      await l(w), o?.();
    } catch (c) {
      const b = c instanceof Error ? c : new Error(String(c));
      i?.(b);
    }
  }, m = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ A(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[t]} ${m[s]} ${d}`,
      onClick: a,
      disabled: g || !p || h,
      "aria-label": "Sign in with Google",
      children: [
        h ? /* @__PURE__ */ u(z, { size: "sm" }) : /* @__PURE__ */ A(
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
  B as G,
  j as u
};
