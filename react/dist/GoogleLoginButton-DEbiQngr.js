import { jsxs as k, jsx as g } from "react/jsx-runtime";
import { useState as p, useRef as I, useMemo as S, useEffect as C, useCallback as R } from "react";
import { u as v, A as G, h as _ } from "./useCedrosLogin-CFfID-0i.js";
import { L as z } from "./LoadingSpinner-6vml-zwr.js";
const O = {
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
      const o = document.createElement("script");
      o.src = "https://accounts.google.com/gsi/client", o.async = !0, o.defer = !0, o.id = "google-gsi-script", o.onload = () => {
        this.loaded = !0, this.loading = !1, this.callbacks.forEach((t) => t.resolve()), this.callbacks = [];
      }, o.onerror = () => {
        this.loading = !1, o.remove();
        const t = new Error("Failed to load Google Sign-In script");
        this.callbacks.forEach((f) => f.reject(t)), this.callbacks = [];
      }, document.head.appendChild(o);
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
function P() {
  const { config: e, _internal: c } = v(), [d, o] = p(!1), [t, f] = p(!1), [E, n] = p(null), [b, h] = p(null), a = I(null), w = I(e), u = S(
    () => new G({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  );
  C(() => {
    w.current = e;
  }, [e]);
  const m = R(
    async (s) => {
      const i = a.current;
      if (i)
        try {
          const r = await u.post("/google", {
            idToken: s.credential
          });
          w.current.callbacks?.onLoginSuccess?.(r.user, "google"), c?.handleLoginSuccess(r.user, r.tokens), o(!1), i.resolve(r);
        } catch (r) {
          const l = _(r, "Unable to sign in with Google. Please try again.");
          l.code === "ACCOUNT_LINK_REQUIRED" && h(s.credential), n(l), o(!1), i.reject(l);
        } finally {
          a.current = null;
        }
    },
    [u, c]
  );
  C(() => {
    if (!e.googleClientId)
      return;
    let s = !0;
    const i = () => {
      s && (window.google?.accounts?.id?.initialize({
        client_id: e.googleClientId,
        callback: m,
        auto_select: !1,
        cancel_on_tap_outside: !0
      }), s && f(!0));
    };
    return O.load().then(() => {
      s && i();
    }).catch(() => {
      s && n({
        code: "SERVER_ERROR",
        message: "Unable to load Google sign-in. Please refresh and try again."
      });
    }), () => {
      s = !1;
    };
  }, [e.googleClientId, m]);
  const y = R(async () => {
    if (!e.googleClientId) {
      const s = {
        code: "VALIDATION_ERROR",
        message: "Google Client ID not configured"
      };
      throw n(s), s;
    }
    if (!t) {
      const s = {
        code: "VALIDATION_ERROR",
        message: "Google sign-in is not ready yet. Please wait a moment and try again."
      };
      throw n(s), s;
    }
    if (a.current) {
      const s = {
        code: "VALIDATION_ERROR",
        message: "Google sign-in is already in progress."
      };
      throw n(s), s;
    }
    return o(!0), n(null), new Promise((s, i) => {
      a.current = { resolve: s, reject: i }, window.google?.accounts?.id?.prompt((r) => {
        if (r.isNotDisplayed()) {
          const l = {
            code: "SERVER_ERROR",
            message: "Google sign-in popup was blocked. Please allow popups for this site and try again."
          };
          n(l), o(!1), a.current = null, i(l);
        } else if (r.isSkippedMoment()) {
          const l = {
            code: "SERVER_ERROR",
            message: "Google sign-in was cancelled."
          };
          n(l), o(!1), a.current = null, i(l);
        } else if (r.isDismissedMoment()) {
          const l = {
            code: "SERVER_ERROR",
            message: "Google sign-in was cancelled."
          };
          n(l), o(!1), a.current = null, i(l);
        }
      });
    });
  }, [e.googleClientId, t]), A = R(() => n(null), []), L = R(() => h(null), []);
  return {
    signIn: y,
    isLoading: d,
    isInitialized: t,
    error: E,
    clearError: A,
    pendingLinkIdToken: b,
    clearPendingLink: L
  };
}
function D({
  onSuccess: e,
  onError: c,
  className: d = "",
  variant: o = "default",
  size: t = "md",
  disabled: f = !1
}) {
  const { signIn: E, isLoading: n, isInitialized: b } = P(), h = async () => {
    try {
      await E(), e?.();
    } catch (u) {
      const m = u instanceof Error ? u : new Error(String(u));
      c?.(m);
    }
  }, a = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ k(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[o]} ${a[t]} ${d}`,
      onClick: h,
      disabled: f || !b || n,
      "aria-label": "Sign in with Google",
      children: [
        n ? /* @__PURE__ */ g(z, { size: "sm" }) : /* @__PURE__ */ k(
          "svg",
          {
            className: "cedros-button-icon",
            width: "18",
            height: "18",
            viewBox: "0 0 18 18",
            fill: "none",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ g(
                "path",
                {
                  d: "M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z",
                  fill: "#4285F4"
                }
              ),
              /* @__PURE__ */ g(
                "path",
                {
                  d: "M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332A8.997 8.997 0 0 0 9.003 18z",
                  fill: "#34A853"
                }
              ),
              /* @__PURE__ */ g(
                "path",
                {
                  d: "M3.964 10.712A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.96A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.96 4.042l3.004-2.33z",
                  fill: "#FBBC05"
                }
              ),
              /* @__PURE__ */ g(
                "path",
                {
                  d: "M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 0 0 .96 4.958l3.005 2.332c.708-2.127 2.692-3.71 5.036-3.71z",
                  fill: "#EA4335"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ g("span", { children: "Continue with Google" })
      ]
    }
  );
}
export {
  D as G,
  P as u
};
