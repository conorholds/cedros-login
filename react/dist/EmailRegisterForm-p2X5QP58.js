import { jsxs as f, jsx as t, Fragment as L } from "react/jsx-runtime";
import { useRef as F, useState as w, useCallback as E, useEffect as M, useMemo as z, useId as W } from "react";
import { L as O } from "./LoadingSpinner-6vml-zwr.js";
import { E as j } from "./ErrorMessage-CcEK0pYO.js";
import { u as U, A as H, h as P } from "./useCedrosLogin-CFfID-0i.js";
import { b as B, v as ce } from "./validation-B8kMV3BL.js";
import { s as ie } from "./sanitization-CQ-H1MSg.js";
function K(i = {}) {
  const { maxAttempts: u = 5, windowMs: C = 6e4, showCountdown: p = !1 } = i, m = F([]), [o, v] = w(!1), [, b] = w(0), d = E(() => {
    b((c) => c + 1);
  }, []), l = E(() => {
    const c = Date.now();
    m.current = m.current.filter((e) => c - e < C);
  }, [C]), g = E(() => {
    l(), v((c) => m.current.length === 0 && c ? !1 : c);
  }, [l]), a = E(() => (l(), Math.max(0, u - m.current.length)), [l, u]), h = E(() => {
    if (l(), m.current.length === 0)
      return 0;
    const e = m.current[0] + C;
    return Math.max(0, e - Date.now());
  }, [l, C]), k = E(() => (l(), m.current.length < u), [l, u]), N = E(() => {
    if (g(), m.current.length >= u) {
      const c = h(), e = Math.ceil(c / 1e3);
      throw new Error(
        `Too many attempts. Please wait ${e} second${e === 1 ? "" : "s"} before trying again.`
      );
    }
    m.current.push(Date.now()), v((c) => c || !0), d();
  }, [g, u, h, d]), y = E(() => {
    m.current = [], v((c) => c && !1), d();
  }, [d]);
  return M(() => {
    if (!o || !p) return;
    const c = window.setInterval(() => {
      g(), d();
    }, 1e3);
    return () => {
      window.clearInterval(c);
    };
  }, [o, p, d, g]), {
    checkLimit: N,
    isAllowed: k,
    getRemainingAttempts: a,
    getTimeUntilReset: h,
    reset: y
  };
}
function le(i) {
  return "mfaRequired" in i && i.mfaRequired === !0;
}
function Z() {
  const { config: i, _internal: u } = U(), [C, p] = w(!1), [m, o] = w(null), {
    checkLimit: v,
    getRemainingAttempts: b,
    getTimeUntilReset: d,
    reset: l
  } = K({ maxAttempts: 5, windowMs: 6e4 }), g = z(
    () => new H({
      baseUrl: i.serverUrl,
      timeoutMs: i.requestTimeout,
      retryAttempts: i.retryAttempts
    }),
    [i.serverUrl, i.requestTimeout, i.retryAttempts]
  ), a = i.callbacks, h = E(
    async (y, c) => {
      if (!B(y)) {
        const e = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw o(e), e;
      }
      try {
        v();
      } catch (e) {
        const r = {
          code: "RATE_LIMITED",
          message: e instanceof Error ? e.message : "Too many attempts"
        };
        throw o(r), r;
      }
      p(!0), o(null);
      try {
        const e = await g.post("/login", {
          email: y,
          password: c
        });
        if (le(e))
          return {
            mfaRequired: !0,
            mfaToken: e.mfaToken,
            email: y,
            userId: e.userId
          };
        const r = e;
        return a?.onLoginSuccess?.(r.user, "email"), u?.handleLoginSuccess(r.user, r.tokens), l(), {
          mfaRequired: !1,
          response: r
        };
      } catch (e) {
        const r = P(e, "Unable to sign in. Please try again.");
        throw o(r), r;
      } finally {
        p(!1);
      }
    },
    [g, a, u, v, l]
  ), k = E(
    async (y, c, e, r) => {
      if (!B(y)) {
        const s = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw o(s), s;
      }
      try {
        v();
      } catch (s) {
        const n = {
          code: "RATE_LIMITED",
          message: s instanceof Error ? s.message : "Too many attempts"
        };
        throw o(n), n;
      }
      p(!0), o(null);
      try {
        const s = r ?? u?.getReferralCode?.() ?? void 0, n = await g.post("/register", { email: y, password: c, name: e, referral: s });
        return a?.onLoginSuccess?.(n.user, "email"), u?.handleLoginSuccess(n.user, n.tokens), l(), n;
      } catch (s) {
        const n = P(s, "Unable to create your account. Please try again.");
        throw o(n), n;
      } finally {
        p(!1);
      }
    },
    [g, a, u, v, l]
  ), N = E(() => o(null), []);
  return {
    login: h,
    register: k,
    isLoading: C,
    error: m,
    clearError: N,
    // M-10: Point-in-time snapshots for UI display (see interface JSDoc)
    remainingAttempts: b(),
    timeUntilReset: d()
  };
}
function q({
  label: i = "Password",
  labelAction: u,
  showStrengthMeter: C = !1,
  onValidationChange: p,
  error: m,
  className: o = "",
  onChange: v,
  value: b,
  ...d
}) {
  const [l, g] = w(!1), [a, h] = w(null), k = W(), N = (c) => {
    const e = c.target.value;
    if (C || p) {
      const r = ce(e);
      h(r), p?.(r);
    }
    v?.(c);
  }, y = {
    weak: "var(--cedros-destructive, #ef4444)",
    fair: "var(--cedros-warning, #f59e0b)",
    good: "var(--cedros-success, #22c55e)",
    strong: "var(--cedros-success, #22c55e)"
  };
  return /* @__PURE__ */ f("div", { className: `cedros-password-input ${o}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-label-row", children: [
      /* @__PURE__ */ t("label", { htmlFor: k, className: "cedros-label", children: i }),
      u
    ] }),
    /* @__PURE__ */ f("div", { className: "cedros-password-wrapper", children: [
      /* @__PURE__ */ t(
        "input",
        {
          id: k,
          type: l ? "text" : "password",
          className: "cedros-input",
          onChange: N,
          value: b,
          "aria-invalid": m ? "true" : void 0,
          "aria-describedby": m ? `${k}-error` : void 0,
          ...d
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-password-toggle",
          onClick: () => g(!l),
          "aria-label": l ? "Hide password" : "Show password",
          "aria-pressed": l,
          children: l ? /* @__PURE__ */ f("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
            /* @__PURE__ */ t(
              "path",
              {
                d: "M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z",
                stroke: "currentColor",
                strokeWidth: "1.5"
              }
            ),
            /* @__PURE__ */ t("circle", { cx: "10", cy: "10", r: "2.5", stroke: "currentColor", strokeWidth: "1.5" }),
            /* @__PURE__ */ t("path", { d: "M3 17L17 3", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
          ] }) : /* @__PURE__ */ f("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
            /* @__PURE__ */ t(
              "path",
              {
                d: "M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z",
                stroke: "currentColor",
                strokeWidth: "1.5"
              }
            ),
            /* @__PURE__ */ t("circle", { cx: "10", cy: "10", r: "2.5", stroke: "currentColor", strokeWidth: "1.5" })
          ] })
        }
      )
    ] }),
    m && /* @__PURE__ */ t("p", { id: `${k}-error`, className: "cedros-input-error", children: m }),
    C && a && b?.length > 0 && /* @__PURE__ */ f("div", { className: "cedros-password-strength", children: [
      /* @__PURE__ */ t("div", { className: "cedros-strength-bar", children: /* @__PURE__ */ t(
        "div",
        {
          className: "cedros-strength-fill",
          style: {
            width: `${a.strength === "weak" ? 25 : a.strength === "fair" ? 50 : a.strength === "good" ? 75 : 100}%`,
            backgroundColor: y[a.strength]
          }
        }
      ) }),
      /* @__PURE__ */ t("span", { className: "cedros-strength-label", children: a.strength })
    ] })
  ] });
}
function de() {
  const { config: i, _internal: u } = U(), [C, p] = w("idle"), [m, o] = w(!1), [v, b] = w(null), {
    checkLimit: d,
    getRemainingAttempts: l,
    getTimeUntilReset: g,
    reset: a
  } = K({ maxAttempts: 5, windowMs: 12e4 }), h = z(
    () => new H({
      baseUrl: i.serverUrl,
      timeoutMs: i.requestTimeout,
      retryAttempts: i.retryAttempts
    }),
    [i.serverUrl, i.requestTimeout, i.retryAttempts]
  ), k = E(
    async (c, e) => {
      const r = /^[A-Z0-9]{16}$/i.test(e) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/i.test(e);
      if (!(/^\d{6}$/.test(e) || r)) {
        const n = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid 6-digit code or recovery code"
        };
        throw b(n), n;
      }
      try {
        d();
      } catch (n) {
        const R = {
          code: "RATE_LIMITED",
          message: n instanceof Error ? n.message : "Too many attempts"
        };
        throw b(R), R;
      }
      o(!0), b(null), p("verifying");
      try {
        const n = await h.post("/login/mfa", { mfaToken: c, code: e });
        return p("success"), a(), u && n.user && n.tokens && u.handleLoginSuccess(n.user, n.tokens), n;
      } catch (n) {
        const R = P(n, "Incorrect verification code. Please check and try again.");
        throw b(R), p("error"), R;
      } finally {
        o(!1);
      }
    },
    [h, u, d, a]
  ), N = E(() => b(null), []), y = E(() => {
    b(null), p("idle"), o(!1);
  }, []);
  return {
    state: C,
    isLoading: m,
    error: v,
    verifyTotp: k,
    clearError: N,
    reset: y,
    // Point-in-time snapshots for UI display
    remainingAttempts: l(),
    timeUntilReset: g()
  };
}
const T = 6;
function ue({
  value: i = "",
  onChange: u,
  onComplete: C,
  disabled: p = !1,
  error: m,
  autoFocus: o = !1,
  className: v = ""
}) {
  const b = F([]), [d, l] = w(i.padEnd(T, "")), g = W();
  M(() => {
    l(i.padEnd(T, ""));
  }, [i]);
  const a = E((e) => {
    e >= 0 && e < T && b.current[e]?.focus();
  }, []), h = E(
    (e) => {
      const r = e.replace(/\D/g, "").slice(0, T);
      l(r.padEnd(T, "")), u?.(r), r.length === T && C?.(r);
    },
    [u, C]
  ), k = E(
    (e, r) => {
      if (!/^\d?$/.test(r)) return;
      const s = d.split("");
      s[e] = r;
      const n = s.join("").replace(/ /g, "");
      h(n), r && e < T - 1 && a(e + 1);
    },
    [d, h, a]
  ), N = E(
    (e, r) => {
      if (r.key === "Backspace") {
        r.preventDefault();
        const s = d.split("");
        s[e] && s[e] !== " " ? (s[e] = " ", h(s.join("").replace(/ /g, ""))) : e > 0 && (s[e - 1] = " ", h(s.join("").replace(/ /g, "")), a(e - 1));
      } else r.key === "ArrowLeft" && e > 0 ? (r.preventDefault(), a(e - 1)) : r.key === "ArrowRight" && e < T - 1 && (r.preventDefault(), a(e + 1));
    },
    [d, h, a]
  ), y = E(
    (e) => {
      e.preventDefault();
      const s = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, T);
      s && (h(s), a(Math.min(s.length, T - 1)));
    },
    [h, a]
  ), c = E((e) => {
    e.target.select();
  }, []);
  return M(() => {
    o && !p && b.current[0]?.focus();
  }, [o, p]), /* @__PURE__ */ f("div", { className: `cedros-otp-input ${v}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-otp-slots", role: "group", "aria-label": "One-time password", children: Array.from({ length: T }).map((e, r) => /* @__PURE__ */ t(
      "input",
      {
        ref: (s) => {
          b.current[r] = s;
        },
        id: `${g}-${r}`,
        type: "text",
        inputMode: "numeric",
        pattern: "[0-9]*",
        maxLength: 1,
        className: `cedros-otp-slot ${m ? "cedros-otp-slot-error" : ""}`,
        value: d[r] === " " ? "" : d[r] || "",
        onChange: (s) => k(r, s.target.value),
        onKeyDown: (s) => N(r, s),
        onPaste: y,
        onFocus: c,
        disabled: p,
        autoComplete: "one-time-code",
        "aria-label": `Digit ${r + 1}`,
        "aria-invalid": m ? "true" : void 0
      },
      r
    )) }),
    m && /* @__PURE__ */ t("p", { className: "cedros-otp-error", role: "alert", children: m })
  ] });
}
function me({
  mfaToken: i,
  email: u,
  onSuccess: C,
  onBack: p,
  className: m = ""
}) {
  const { verifyTotp: o, isLoading: v, error: b, clearError: d } = de(), [l, g] = w(""), [a, h] = w(!1), [k, N] = w(""), y = async (r) => {
    const s = r || (a ? k : l);
    if (s)
      try {
        await o(i, s), C?.();
      } catch {
        a ? N("") : g("");
      }
  }, c = (r) => {
    y(r);
  }, e = () => {
    h(!a), d(), g(""), N("");
  };
  return /* @__PURE__ */ f("div", { className: `cedros-totp-verify ${m}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-totp-verify-header", children: [
      /* @__PURE__ */ f(
        "svg",
        {
          className: "cedros-totp-verify-icon",
          width: "48",
          height: "48",
          viewBox: "0 0 48 48",
          fill: "none",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ t("rect", { x: "8", y: "20", width: "32", height: "24", rx: "4", stroke: "currentColor", strokeWidth: "2" }),
            /* @__PURE__ */ t(
              "path",
              {
                d: "M16 20V14a8 8 0 1 1 16 0v6",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ t("circle", { cx: "24", cy: "32", r: "3", fill: "currentColor" })
          ]
        }
      ),
      /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Two-factor authentication" }),
      /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: a ? "Enter one of your recovery codes to sign in." : "Enter the 6-digit code from your authenticator app." }),
      u && /* @__PURE__ */ t("p", { className: "cedros-totp-email", children: u })
    ] }),
    a ? /* @__PURE__ */ f("div", { className: "cedros-totp-backup-input", children: [
      /* @__PURE__ */ t(
        "input",
        {
          type: "text",
          className: `cedros-input ${b ? "cedros-input-error" : ""}`,
          placeholder: "Enter recovery code",
          value: k,
          onChange: (r) => {
            N(r.target.value.toUpperCase()), d();
          },
          onKeyDown: (r) => {
            r.key === "Enter" && k && y();
          },
          disabled: v,
          autoFocus: !0,
          autoComplete: "one-time-code"
        }
      ),
      b && /* @__PURE__ */ t("p", { className: "cedros-input-error", role: "alert", children: b.message })
    ] }) : /* @__PURE__ */ t(
      ue,
      {
        value: l,
        onChange: (r) => {
          g(r), d();
        },
        onComplete: c,
        disabled: v,
        error: b?.message,
        autoFocus: !0
      }
    ),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        onClick: () => y(),
        disabled: v || (a ? !k : l.length !== 6),
        children: v ? /* @__PURE__ */ f(L, { children: [
          /* @__PURE__ */ t(O, { size: "sm" }),
          /* @__PURE__ */ t("span", { children: "Verifying..." })
        ] }) : "Verify"
      }
    ),
    /* @__PURE__ */ f("div", { className: "cedros-totp-verify-footer", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-link cedros-link-sm",
          onClick: e,
          disabled: v,
          children: a ? "Use authenticator app" : "Use a recovery code"
        }
      ),
      p && /* @__PURE__ */ f(L, { children: [
        /* @__PURE__ */ t("span", { className: "cedros-totp-verify-divider", children: "•" }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-link cedros-link-sm",
            onClick: p,
            disabled: v,
            children: "Back to login"
          }
        )
      ] })
    ] })
  ] });
}
function ke({
  onSuccess: i,
  onSwitchToRegister: u,
  onForgotPassword: C,
  className: p = ""
}) {
  const { login: m, isLoading: o, error: v, clearError: b } = Z(), [d, l] = w(""), [g, a] = w(""), [h, k] = w(null), [N, y] = w(""), c = async (s) => {
    s.preventDefault();
    try {
      const n = await m(d, g);
      n.mfaRequired ? (k(n.mfaToken), y(n.email)) : i?.();
    } catch {
    }
  }, e = () => {
    k(null), y(""), i?.();
  }, r = () => {
    k(null), y(""), a("");
  };
  return h ? /* @__PURE__ */ t(
    me,
    {
      mfaToken: h,
      email: N,
      onSuccess: e,
      onBack: r,
      className: p
    }
  ) : /* @__PURE__ */ f("form", { onSubmit: c, className: `cedros-form ${p}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ t("label", { htmlFor: "email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ t(
        "input",
        {
          id: "email",
          type: "email",
          className: "cedros-input",
          value: d,
          onChange: (s) => l(s.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: o
        }
      )
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-form-field", children: /* @__PURE__ */ t(
      q,
      {
        value: g,
        onChange: (s) => a(s.target.value),
        placeholder: "Enter your password",
        required: !0,
        autoComplete: "current-password",
        disabled: o,
        labelAction: C ? /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-link cedros-link-muted cedros-link-sm",
            onClick: C,
            children: "Forgot your password?"
          }
        ) : void 0
      }
    ) }),
    /* @__PURE__ */ t(j, { error: v, onDismiss: b }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: o || !d || !g,
        "aria-busy": o,
        children: o ? /* @__PURE__ */ f(L, { children: [
          /* @__PURE__ */ t(O, { size: "sm", announce: !0, label: "Signing in" }),
          /* @__PURE__ */ t("span", { children: "Signing in..." })
        ] }) : "Sign in"
      }
    ),
    u && /* @__PURE__ */ f("p", { className: "cedros-form-footer", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ t("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: u, children: "Sign up" })
    ] })
  ] });
}
function Ce({
  onSuccess: i,
  onSwitchToLogin: u,
  className: C = ""
}) {
  const { config: p } = U(), { register: m, isLoading: o, error: v, clearError: b } = Z(), [d, l] = w(""), [g, a] = w(""), [h, k] = w(""), [N, y] = w(""), [c, e] = w(null), [r, s] = w(null), n = p.forms?.termsOfService, R = p.forms?.emailOptIn, D = n?.show ?? !1, I = n?.required ?? !0, Y = n?.defaultChecked ?? !1, $ = n?.label ?? "I agree to the Terms of Service", G = n?.url, x = ie(G), J = R?.show ?? !1, Q = R?.defaultChecked ?? !1, X = R?.label ?? "Send me updates and news", [S, ee] = w(Y), [te, re] = w(Q), V = h === N, se = c?.isValid ?? !1, _ = g && h && N && V && se && (!D || !I || S) && !o, oe = async (A) => {
    if (A.preventDefault(), s(null), D && I && !S) {
      s({
        code: "VALIDATION_ERROR",
        message: "You must agree to the Terms of Service to continue"
      });
      return;
    }
    if (_)
      try {
        await m(g, h, d || void 0), i?.();
      } catch {
      }
  }, ae = v || r, ne = () => {
    b(), s(null);
  };
  return /* @__PURE__ */ f("form", { onSubmit: oe, className: `cedros-form ${C}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ f("label", { htmlFor: "name", className: "cedros-label", children: [
        "Name ",
        /* @__PURE__ */ t("span", { className: "cedros-optional", children: "(optional)" })
      ] }),
      /* @__PURE__ */ t(
        "input",
        {
          id: "name",
          type: "text",
          className: "cedros-input",
          value: d,
          onChange: (A) => l(A.target.value),
          placeholder: "Your name",
          autoComplete: "name",
          disabled: o
        }
      )
    ] }),
    /* @__PURE__ */ f("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ t("label", { htmlFor: "register-email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ t(
        "input",
        {
          id: "register-email",
          type: "email",
          className: "cedros-input",
          value: g,
          onChange: (A) => a(A.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: o
        }
      )
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-form-field", children: /* @__PURE__ */ t(
      q,
      {
        value: h,
        onChange: (A) => k(A.target.value),
        placeholder: "Create a password",
        required: !0,
        autoComplete: "new-password",
        disabled: o,
        showStrengthMeter: !0,
        onValidationChange: e
      }
    ) }),
    /* @__PURE__ */ t("div", { className: "cedros-form-field", children: /* @__PURE__ */ t(
      q,
      {
        label: "Confirm Password",
        value: N,
        onChange: (A) => y(A.target.value),
        placeholder: "Confirm your password",
        required: !0,
        autoComplete: "new-password",
        disabled: o,
        "aria-invalid": N && !V ? "true" : void 0,
        error: N && !V ? "Passwords do not match" : void 0
      }
    ) }),
    D && /* @__PURE__ */ t("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ f("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ t(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: S,
          onChange: (A) => ee(A.target.checked),
          disabled: o,
          "aria-required": I
        }
      ),
      /* @__PURE__ */ f("span", { className: "cedros-checkbox-text", children: [
        x ? /* @__PURE__ */ f(L, { children: [
          $.replace("Terms of Service", "").trim() || "I agree to the",
          " ",
          /* @__PURE__ */ t(
            "a",
            {
              href: x,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "cedros-link",
              children: "Terms of Service"
            }
          )
        ] }) : $,
        I && /* @__PURE__ */ t("span", { className: "cedros-required", children: "*" })
      ] })
    ] }) }),
    J && /* @__PURE__ */ t("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ f("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ t(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: te,
          onChange: (A) => re(A.target.checked),
          disabled: o
        }
      ),
      /* @__PURE__ */ t("span", { className: "cedros-checkbox-text", children: X })
    ] }) }),
    /* @__PURE__ */ t(j, { error: ae, onDismiss: ne }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: !_,
        "aria-busy": o,
        children: o ? /* @__PURE__ */ f(L, { children: [
          /* @__PURE__ */ t(O, { size: "sm", announce: !0, label: "Creating account" }),
          /* @__PURE__ */ t("span", { children: "Creating account..." })
        ] }) : "Create account"
      }
    ),
    u && /* @__PURE__ */ f("p", { className: "cedros-form-footer", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ t("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: u, children: "Sign in" })
    ] })
  ] });
}
export {
  ke as E,
  ue as O,
  q as P,
  me as T,
  Ce as a,
  K as b,
  de as c,
  Z as u
};
