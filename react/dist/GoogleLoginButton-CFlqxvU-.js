import { jsxs as C, jsx as u } from "react/jsx-runtime";
import { useState as m, useRef as w, useMemo as G, useEffect as y, useCallback as p } from "react";
import { u as S, A as _, h as T } from "./useCedrosLogin-CFfID-0i.js";
import { L as P } from "./LoadingSpinner-6vml-zwr.js";
const z = {
  loading: !1,
  loaded: !1,
  error: null,
  callbacks: [],
  load() {
    return typeof window > "u" || typeof document > "u" ? Promise.reject(new Error("Google Sign-In script loader cannot run in SSR")) : this.loaded ? Promise.resolve() : this.loading ? new Promise((e, i) => {
      this.callbacks.push({ resolve: e, reject: i });
    }) : (this.loading = !0, new Promise((e, i) => {
      this.callbacks.push({ resolve: e, reject: i });
      const d = document.getElementById("google-gsi-script");
      if (d) {
        window.google?.accounts?.id ? (this.loaded = !0, this.loading = !1, this.callbacks.forEach((o) => o.resolve()), this.callbacks = []) : d.addEventListener("load", () => {
          this.loaded = !0, this.loading = !1, this.callbacks.forEach((o) => o.resolve()), this.callbacks = [];
        });
        return;
      }
      const n = document.createElement("script");
      n.src = "https://accounts.google.com/gsi/client", n.async = !0, n.defer = !0, n.id = "google-gsi-script", n.onload = () => {
        this.loaded = !0, this.loading = !1, this.callbacks.forEach((o) => o.resolve()), this.callbacks = [];
      }, n.onerror = () => {
        this.loading = !1, n.remove();
        const o = new Error("Failed to load Google Sign-In script");
        this.callbacks.forEach((g) => g.reject(o)), this.callbacks = [];
      }, document.head.appendChild(n);
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
function O() {
  const { config: e, _internal: i } = S(), [d, n] = m(!1), [o, g] = m(!1), [b, s] = m(null), [k, h] = m(null), a = w(null), E = w(e), c = w(null), f = G(
    () => new _({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  );
  y(() => {
    E.current = e;
  }, [e]);
  const I = p(
    async (t) => {
      const r = a.current;
      if (r) {
        if (t.error) {
          const l = {
            code: "SERVER_ERROR",
            message: t.error === "access_denied" ? "Google sign-in was cancelled." : "Unable to sign in with Google. Please try again."
          };
          s(l), n(!1), a.current = null, r.reject(l);
          return;
        }
        try {
          const l = await f.post("/google", {
            accessToken: t.access_token
          });
          E.current.callbacks?.onLoginSuccess?.(l.user, "google"), i?.handleLoginSuccess(l.user, l.tokens), n(!1), r.resolve(l);
        } catch (l) {
          const R = T(l, "Unable to sign in with Google. Please try again.");
          R.code === "ACCOUNT_LINK_REQUIRED" && h(t.access_token ?? null), s(R), n(!1), r.reject(R);
        } finally {
          a.current = null;
        }
      }
    },
    [f, i]
  );
  y(() => {
    if (!e.googleClientId)
      return;
    let t = !0;
    return z.load().then(() => {
      if (!t) return;
      const r = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: e.googleClientId,
        scope: "openid email profile",
        callback: I
      });
      r && (c.current = r, g(!0));
    }).catch(() => {
      t && s({
        code: "SERVER_ERROR",
        message: "Unable to load Google sign-in. Please refresh and try again."
      });
    }), () => {
      t = !1, c.current = null;
    };
  }, [e.googleClientId, I]);
  const A = p(async () => {
    if (!e.googleClientId) {
      const t = {
        code: "VALIDATION_ERROR",
        message: "Google Client ID not configured"
      };
      throw s(t), t;
    }
    if (!o) {
      const t = {
        code: "VALIDATION_ERROR",
        message: "Google sign-in is not ready yet. Please wait a moment and try again."
      };
      throw s(t), t;
    }
    if (a.current) {
      const t = {
        code: "VALIDATION_ERROR",
        message: "Google sign-in is already in progress."
      };
      throw s(t), t;
    }
    return n(!0), s(null), new Promise((t, r) => {
      a.current = { resolve: t, reject: r }, c.current?.requestAccessToken();
    });
  }, [e.googleClientId, o]), L = p(() => s(null), []), v = p(() => h(null), []);
  return {
    signIn: A,
    isLoading: d,
    isInitialized: o,
    error: b,
    clearError: L,
    pendingLinkIdToken: k,
    clearPendingLink: v
  };
}
function V({
  onSuccess: e,
  onError: i,
  className: d = "",
  variant: n = "default",
  size: o = "md",
  disabled: g = !1
}) {
  const { signIn: b, isLoading: s, isInitialized: k } = O(), h = async () => {
    try {
      await b(), e?.();
    } catch (c) {
      const f = c instanceof Error ? c : new Error(String(c));
      i?.(f);
    }
  }, a = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ C(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[n]} ${a[o]} ${d}`,
      onClick: h,
      disabled: g || !k || s,
      "aria-label": "Sign in with Google",
      children: [
        s ? /* @__PURE__ */ u(P, { size: "sm" }) : /* @__PURE__ */ C(
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
  V as G,
  O as u
};
