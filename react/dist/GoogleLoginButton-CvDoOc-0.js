import { jsxs as w, jsx as u } from "react/jsx-runtime";
import { useState as b, useRef as k, useMemo as C, useEffect as S, useCallback as I } from "react";
import { u as A, A as y, h as v, L as G } from "./ErrorMessage-Bm1j5mBT.js";
const L = {
  loading: !1,
  loaded: !1,
  error: null,
  callbacks: [],
  load() {
    return typeof window > "u" || typeof document > "u" ? Promise.reject(new Error("Google Sign-In script loader cannot run in SSR")) : this.loaded ? Promise.resolve() : this.loading ? new Promise((e, c) => {
      this.callbacks.push({ resolve: e, reject: c });
    }) : (this.loading = !0, new Promise((e, c) => {
      this.callbacks.push({ resolve: e, reject: c });
      const d = document.getElementById("google-gsi-script");
      if (d) {
        window.google?.accounts?.id ? (this.loaded = !0, this.loading = !1, this.callbacks.forEach((t) => t.resolve()), this.callbacks = []) : d.addEventListener("load", () => {
          this.loaded = !0, this.loading = !1, this.callbacks.forEach((t) => t.resolve()), this.callbacks = [];
        });
        return;
      }
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client", s.async = !0, s.defer = !0, s.id = "google-gsi-script", s.onload = () => {
        this.loaded = !0, this.loading = !1, this.callbacks.forEach((t) => t.resolve()), this.callbacks = [];
      }, s.onerror = () => {
        this.loading = !1, s.remove();
        const t = new Error("Failed to load Google Sign-In script");
        this.callbacks.forEach((g) => g.reject(t)), this.callbacks = [];
      }, document.head.appendChild(s);
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
function _() {
  const { config: e, _internal: c } = A(), [d, s] = b(!1), [t, g] = b(!1), [m, n] = b(null), a = k(null), h = k(e), p = C(
    () => new y({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  );
  S(() => {
    h.current = e;
  }, [e]);
  const R = I(
    async (o) => {
      const r = a.current;
      if (r)
        try {
          const i = await p.post("/google", {
            idToken: o.credential
          });
          h.current.callbacks?.onLoginSuccess?.(i.user, "google"), c?.handleLoginSuccess(i.user, i.tokens), s(!1), r.resolve(i);
        } catch (i) {
          const l = v(i, "Google sign-in failed");
          n(l), s(!1), r.reject(l);
        } finally {
          a.current = null;
        }
    },
    [p, c]
  );
  S(() => {
    if (!e.googleClientId)
      return;
    let o = !0;
    const r = () => {
      o && (window.google?.accounts?.id?.initialize({
        client_id: e.googleClientId,
        callback: R,
        auto_select: !1,
        cancel_on_tap_outside: !0
      }), o && g(!0));
    };
    return L.load().then(() => {
      o && r();
    }).catch(() => {
      o && n({
        code: "SERVER_ERROR",
        message: "Failed to load Google Sign-In"
      });
    }), () => {
      o = !1;
    };
  }, [e.googleClientId, R]);
  const f = I(async () => {
    if (!e.googleClientId) {
      const o = {
        code: "VALIDATION_ERROR",
        message: "Google Client ID not configured"
      };
      throw n(o), o;
    }
    if (!t) {
      const o = {
        code: "VALIDATION_ERROR",
        message: "Google Sign-In not initialized"
      };
      throw n(o), o;
    }
    if (a.current) {
      const o = {
        code: "VALIDATION_ERROR",
        message: "Google Sign-In already in progress"
      };
      throw n(o), o;
    }
    return s(!0), n(null), new Promise((o, r) => {
      a.current = { resolve: o, reject: r }, window.google?.accounts?.id?.prompt((i) => {
        if (i.isNotDisplayed()) {
          const l = {
            code: "SERVER_ERROR",
            message: "Google Sign-In popup was blocked. Please allow popups or try again."
          };
          n(l), s(!1), a.current = null, r(l);
        } else if (i.isSkippedMoment()) {
          const l = {
            code: "SERVER_ERROR",
            message: "Google Sign-In was cancelled"
          };
          n(l), s(!1), a.current = null, r(l);
        } else if (i.isDismissedMoment()) {
          const l = {
            code: "SERVER_ERROR",
            message: "Google Sign-In was cancelled"
          };
          n(l), s(!1), a.current = null, r(l);
        }
      });
    });
  }, [e.googleClientId, t]), E = I(() => n(null), []);
  return {
    signIn: f,
    isLoading: d,
    isInitialized: t,
    error: m,
    clearError: E
  };
}
function V({
  onSuccess: e,
  onError: c,
  className: d = "",
  variant: s = "default",
  size: t = "md",
  disabled: g = !1
}) {
  const { signIn: m, isLoading: n, isInitialized: a } = _(), h = async () => {
    try {
      await m(), e?.();
    } catch (f) {
      const E = f instanceof Error ? f : new Error(String(f));
      c?.(E);
    }
  }, p = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ w(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-google",
        outline: "cedros-button-google-outline"
      }[s]} ${p[t]} ${d}`,
      onClick: h,
      disabled: g || !a || n,
      "aria-label": "Sign in with Google",
      children: [
        n ? /* @__PURE__ */ u(G, { size: "sm" }) : /* @__PURE__ */ w(
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
  _ as u
};
