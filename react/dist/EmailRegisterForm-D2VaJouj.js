import { jsxs as h, jsx as r, Fragment as R } from "react/jsx-runtime";
import { useRef as F, useState as w, useCallback as E, useEffect as M, useMemo as z, useId as W } from "react";
import { L as O } from "./LoadingSpinner-6vml-zwr.js";
import { E as j } from "./ErrorMessage-CcEK0pYO.js";
import { u as U, A as H, h as P } from "./useCedrosLogin-CFfID-0i.js";
import { b as B, v as ce } from "./validation-B8kMV3BL.js";
import { s as ie } from "./sanitization-CQ-H1MSg.js";
function K(c = {}) {
  const { maxAttempts: u = 5, windowMs: C = 6e4, showCountdown: m = !1 } = c, d = F([]), [s, b] = w(!1), [, g] = w(0), l = E(() => {
    g((n) => n + 1);
  }, []), i = E(() => {
    const n = Date.now();
    d.current = d.current.filter((t) => n - t < C);
  }, [C]), f = E(() => {
    i(), b((n) => d.current.length === 0 && n ? !1 : n);
  }, [i]), a = E(() => (i(), Math.max(0, u - d.current.length)), [i, u]), p = E(() => {
    if (i(), d.current.length === 0)
      return 0;
    const t = d.current[0] + C;
    return Math.max(0, t - Date.now());
  }, [i, C]), k = E(() => (i(), d.current.length < u), [i, u]), N = E(() => {
    if (f(), d.current.length >= u) {
      const n = p(), t = Math.ceil(n / 1e3);
      throw new Error(
        `Too many attempts. Please wait ${t} second${t === 1 ? "" : "s"} before trying again.`
      );
    }
    d.current.push(Date.now()), b((n) => n || !0), l();
  }, [f, u, p, l]), y = E(() => {
    d.current = [], b((n) => n && !1), l();
  }, [l]);
  return M(() => {
    if (!s || !m) return;
    const n = window.setInterval(() => {
      f(), l();
    }, 1e3);
    return () => {
      window.clearInterval(n);
    };
  }, [s, m, l, f]), {
    checkLimit: N,
    isAllowed: k,
    getRemainingAttempts: a,
    getTimeUntilReset: p,
    reset: y
  };
}
function le(c) {
  return "mfaRequired" in c && c.mfaRequired === !0;
}
function Z() {
  const { config: c, _internal: u } = U(), [C, m] = w(!1), [d, s] = w(null), {
    checkLimit: b,
    getRemainingAttempts: g,
    getTimeUntilReset: l,
    reset: i
  } = K({ maxAttempts: 5, windowMs: 6e4 }), f = z(
    () => new H({
      baseUrl: c.serverUrl,
      timeoutMs: c.requestTimeout,
      retryAttempts: c.retryAttempts
    }),
    [c.serverUrl, c.requestTimeout, c.retryAttempts]
  ), a = c.callbacks, p = E(
    async (y, n) => {
      if (!B(y)) {
        const t = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw s(t), t;
      }
      try {
        b();
      } catch (t) {
        const e = {
          code: "RATE_LIMITED",
          message: t instanceof Error ? t.message : "Too many attempts"
        };
        throw s(e), e;
      }
      m(!0), s(null);
      try {
        const t = await f.post("/login", {
          email: y,
          password: n
        });
        if (le(t))
          return {
            mfaRequired: !0,
            mfaToken: t.mfaToken,
            email: y,
            userId: t.userId
          };
        const e = t;
        return a?.onLoginSuccess?.(e.user, "email"), u?.handleLoginSuccess(e.user, e.tokens), i(), {
          mfaRequired: !1,
          response: e
        };
      } catch (t) {
        const e = P(t, "Unable to sign in. Please try again.");
        throw s(e), e;
      } finally {
        m(!1);
      }
    },
    [f, a, u, b, i]
  ), k = E(
    async (y, n, t) => {
      if (!B(y)) {
        const e = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw s(e), e;
      }
      try {
        b();
      } catch (e) {
        const o = {
          code: "RATE_LIMITED",
          message: e instanceof Error ? e.message : "Too many attempts"
        };
        throw s(o), o;
      }
      m(!0), s(null);
      try {
        const e = await f.post("/register", { email: y, password: n, name: t });
        return a?.onLoginSuccess?.(e.user, "email"), u?.handleLoginSuccess(e.user, e.tokens), i(), e;
      } catch (e) {
        const o = P(e, "Unable to create your account. Please try again.");
        throw s(o), o;
      } finally {
        m(!1);
      }
    },
    [f, a, u, b, i]
  ), N = E(() => s(null), []);
  return {
    login: p,
    register: k,
    isLoading: C,
    error: d,
    clearError: N,
    // M-10: Point-in-time snapshots for UI display (see interface JSDoc)
    remainingAttempts: g(),
    timeUntilReset: l()
  };
}
function q({
  label: c = "Password",
  labelAction: u,
  showStrengthMeter: C = !1,
  onValidationChange: m,
  error: d,
  className: s = "",
  onChange: b,
  value: g,
  ...l
}) {
  const [i, f] = w(!1), [a, p] = w(null), k = W(), N = (n) => {
    const t = n.target.value;
    if (C || m) {
      const e = ce(t);
      p(e), m?.(e);
    }
    b?.(n);
  }, y = {
    weak: "var(--cedros-destructive, #ef4444)",
    fair: "var(--cedros-warning, #f59e0b)",
    good: "var(--cedros-success, #22c55e)",
    strong: "var(--cedros-success, #22c55e)"
  };
  return /* @__PURE__ */ h("div", { className: `cedros-password-input ${s}`, children: [
    /* @__PURE__ */ h("div", { className: "cedros-label-row", children: [
      /* @__PURE__ */ r("label", { htmlFor: k, className: "cedros-label", children: c }),
      u
    ] }),
    /* @__PURE__ */ h("div", { className: "cedros-password-wrapper", children: [
      /* @__PURE__ */ r(
        "input",
        {
          id: k,
          type: i ? "text" : "password",
          className: "cedros-input",
          onChange: N,
          value: g,
          "aria-invalid": d ? "true" : void 0,
          "aria-describedby": d ? `${k}-error` : void 0,
          ...l
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-password-toggle",
          onClick: () => f(!i),
          "aria-label": i ? "Hide password" : "Show password",
          "aria-pressed": i,
          children: i ? /* @__PURE__ */ h("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
            /* @__PURE__ */ r(
              "path",
              {
                d: "M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z",
                stroke: "currentColor",
                strokeWidth: "1.5"
              }
            ),
            /* @__PURE__ */ r("circle", { cx: "10", cy: "10", r: "2.5", stroke: "currentColor", strokeWidth: "1.5" }),
            /* @__PURE__ */ r("path", { d: "M3 17L17 3", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
          ] }) : /* @__PURE__ */ h("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
            /* @__PURE__ */ r(
              "path",
              {
                d: "M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z",
                stroke: "currentColor",
                strokeWidth: "1.5"
              }
            ),
            /* @__PURE__ */ r("circle", { cx: "10", cy: "10", r: "2.5", stroke: "currentColor", strokeWidth: "1.5" })
          ] })
        }
      )
    ] }),
    d && /* @__PURE__ */ r("p", { id: `${k}-error`, className: "cedros-input-error", children: d }),
    C && a && g?.length > 0 && /* @__PURE__ */ h("div", { className: "cedros-password-strength", children: [
      /* @__PURE__ */ r("div", { className: "cedros-strength-bar", children: /* @__PURE__ */ r(
        "div",
        {
          className: "cedros-strength-fill",
          style: {
            width: `${a.strength === "weak" ? 25 : a.strength === "fair" ? 50 : a.strength === "good" ? 75 : 100}%`,
            backgroundColor: y[a.strength]
          }
        }
      ) }),
      /* @__PURE__ */ r("span", { className: "cedros-strength-label", children: a.strength })
    ] })
  ] });
}
function de() {
  const { config: c, _internal: u } = U(), [C, m] = w("idle"), [d, s] = w(!1), [b, g] = w(null), {
    checkLimit: l,
    getRemainingAttempts: i,
    getTimeUntilReset: f,
    reset: a
  } = K({ maxAttempts: 5, windowMs: 12e4 }), p = z(
    () => new H({
      baseUrl: c.serverUrl,
      timeoutMs: c.requestTimeout,
      retryAttempts: c.retryAttempts
    }),
    [c.serverUrl, c.requestTimeout, c.retryAttempts]
  ), k = E(
    async (n, t) => {
      const e = /^[A-Z0-9]{16}$/i.test(t) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/i.test(t);
      if (!(/^\d{6}$/.test(t) || e)) {
        const v = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid 6-digit code or recovery code"
        };
        throw g(v), v;
      }
      try {
        l();
      } catch (v) {
        const L = {
          code: "RATE_LIMITED",
          message: v instanceof Error ? v.message : "Too many attempts"
        };
        throw g(L), L;
      }
      s(!0), g(null), m("verifying");
      try {
        const v = await p.post("/login/mfa", { mfaToken: n, code: t });
        return m("success"), a(), u && v.user && v.tokens && u.handleLoginSuccess(v.user, v.tokens), v;
      } catch (v) {
        const L = P(v, "Incorrect verification code. Please check and try again.");
        throw g(L), m("error"), L;
      } finally {
        s(!1);
      }
    },
    [p, u, l, a]
  ), N = E(() => g(null), []), y = E(() => {
    g(null), m("idle"), s(!1);
  }, []);
  return {
    state: C,
    isLoading: d,
    error: b,
    verifyTotp: k,
    clearError: N,
    reset: y,
    // Point-in-time snapshots for UI display
    remainingAttempts: i(),
    timeUntilReset: f()
  };
}
const T = 6;
function ue({
  value: c = "",
  onChange: u,
  onComplete: C,
  disabled: m = !1,
  error: d,
  autoFocus: s = !1,
  className: b = ""
}) {
  const g = F([]), [l, i] = w(c.padEnd(T, "")), f = W();
  M(() => {
    i(c.padEnd(T, ""));
  }, [c]);
  const a = E((t) => {
    t >= 0 && t < T && g.current[t]?.focus();
  }, []), p = E(
    (t) => {
      const e = t.replace(/\D/g, "").slice(0, T);
      i(e.padEnd(T, "")), u?.(e), e.length === T && C?.(e);
    },
    [u, C]
  ), k = E(
    (t, e) => {
      if (!/^\d?$/.test(e)) return;
      const o = l.split("");
      o[t] = e;
      const v = o.join("").replace(/ /g, "");
      p(v), e && t < T - 1 && a(t + 1);
    },
    [l, p, a]
  ), N = E(
    (t, e) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const o = l.split("");
        o[t] && o[t] !== " " ? (o[t] = " ", p(o.join("").replace(/ /g, ""))) : t > 0 && (o[t - 1] = " ", p(o.join("").replace(/ /g, "")), a(t - 1));
      } else e.key === "ArrowLeft" && t > 0 ? (e.preventDefault(), a(t - 1)) : e.key === "ArrowRight" && t < T - 1 && (e.preventDefault(), a(t + 1));
    },
    [l, p, a]
  ), y = E(
    (t) => {
      t.preventDefault();
      const o = t.clipboardData.getData("text").replace(/\D/g, "").slice(0, T);
      o && (p(o), a(Math.min(o.length, T - 1)));
    },
    [p, a]
  ), n = E((t) => {
    t.target.select();
  }, []);
  return M(() => {
    s && !m && g.current[0]?.focus();
  }, [s, m]), /* @__PURE__ */ h("div", { className: `cedros-otp-input ${b}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-otp-slots", role: "group", "aria-label": "One-time password", children: Array.from({ length: T }).map((t, e) => /* @__PURE__ */ r(
      "input",
      {
        ref: (o) => {
          g.current[e] = o;
        },
        id: `${f}-${e}`,
        type: "text",
        inputMode: "numeric",
        pattern: "[0-9]*",
        maxLength: 1,
        className: `cedros-otp-slot ${d ? "cedros-otp-slot-error" : ""}`,
        value: l[e] === " " ? "" : l[e] || "",
        onChange: (o) => k(e, o.target.value),
        onKeyDown: (o) => N(e, o),
        onPaste: y,
        onFocus: n,
        disabled: m,
        autoComplete: "one-time-code",
        "aria-label": `Digit ${e + 1}`,
        "aria-invalid": d ? "true" : void 0
      },
      e
    )) }),
    d && /* @__PURE__ */ r("p", { className: "cedros-otp-error", role: "alert", children: d })
  ] });
}
function me({
  mfaToken: c,
  email: u,
  onSuccess: C,
  onBack: m,
  className: d = ""
}) {
  const { verifyTotp: s, isLoading: b, error: g, clearError: l } = de(), [i, f] = w(""), [a, p] = w(!1), [k, N] = w(""), y = async (e) => {
    const o = e || (a ? k : i);
    if (o)
      try {
        await s(c, o), C?.();
      } catch {
        a ? N("") : f("");
      }
  }, n = (e) => {
    y(e);
  }, t = () => {
    p(!a), l(), f(""), N("");
  };
  return /* @__PURE__ */ h("div", { className: `cedros-totp-verify ${d}`, children: [
    /* @__PURE__ */ h("div", { className: "cedros-totp-verify-header", children: [
      /* @__PURE__ */ h(
        "svg",
        {
          className: "cedros-totp-verify-icon",
          width: "48",
          height: "48",
          viewBox: "0 0 48 48",
          fill: "none",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ r("rect", { x: "8", y: "20", width: "32", height: "24", rx: "4", stroke: "currentColor", strokeWidth: "2" }),
            /* @__PURE__ */ r(
              "path",
              {
                d: "M16 20V14a8 8 0 1 1 16 0v6",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ r("circle", { cx: "24", cy: "32", r: "3", fill: "currentColor" })
          ]
        }
      ),
      /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Two-factor authentication" }),
      /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: a ? "Enter one of your recovery codes to sign in." : "Enter the 6-digit code from your authenticator app." }),
      u && /* @__PURE__ */ r("p", { className: "cedros-totp-email", children: u })
    ] }),
    a ? /* @__PURE__ */ h("div", { className: "cedros-totp-backup-input", children: [
      /* @__PURE__ */ r(
        "input",
        {
          type: "text",
          className: `cedros-input ${g ? "cedros-input-error" : ""}`,
          placeholder: "Enter recovery code",
          value: k,
          onChange: (e) => {
            N(e.target.value.toUpperCase()), l();
          },
          onKeyDown: (e) => {
            e.key === "Enter" && k && y();
          },
          disabled: b,
          autoFocus: !0,
          autoComplete: "one-time-code"
        }
      ),
      g && /* @__PURE__ */ r("p", { className: "cedros-input-error", role: "alert", children: g.message })
    ] }) : /* @__PURE__ */ r(
      ue,
      {
        value: i,
        onChange: (e) => {
          f(e), l();
        },
        onComplete: n,
        disabled: b,
        error: g?.message,
        autoFocus: !0
      }
    ),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        onClick: () => y(),
        disabled: b || (a ? !k : i.length !== 6),
        children: b ? /* @__PURE__ */ h(R, { children: [
          /* @__PURE__ */ r(O, { size: "sm" }),
          /* @__PURE__ */ r("span", { children: "Verifying..." })
        ] }) : "Verify"
      }
    ),
    /* @__PURE__ */ h("div", { className: "cedros-totp-verify-footer", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-link cedros-link-sm",
          onClick: t,
          disabled: b,
          children: a ? "Use authenticator app" : "Use a recovery code"
        }
      ),
      m && /* @__PURE__ */ h(R, { children: [
        /* @__PURE__ */ r("span", { className: "cedros-totp-verify-divider", children: "•" }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-link cedros-link-sm",
            onClick: m,
            disabled: b,
            children: "Back to login"
          }
        )
      ] })
    ] })
  ] });
}
function ke({
  onSuccess: c,
  onSwitchToRegister: u,
  onForgotPassword: C,
  className: m = ""
}) {
  const { login: d, isLoading: s, error: b, clearError: g } = Z(), [l, i] = w(""), [f, a] = w(""), [p, k] = w(null), [N, y] = w(""), n = async (o) => {
    o.preventDefault();
    try {
      const v = await d(l, f);
      v.mfaRequired ? (k(v.mfaToken), y(v.email)) : c?.();
    } catch {
    }
  }, t = () => {
    k(null), y(""), c?.();
  }, e = () => {
    k(null), y(""), a("");
  };
  return p ? /* @__PURE__ */ r(
    me,
    {
      mfaToken: p,
      email: N,
      onSuccess: t,
      onBack: e,
      className: m
    }
  ) : /* @__PURE__ */ h("form", { onSubmit: n, className: `cedros-form ${m}`, children: [
    /* @__PURE__ */ h("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ r("label", { htmlFor: "email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: "email",
          type: "email",
          className: "cedros-input",
          value: l,
          onChange: (o) => i(o.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: s
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      q,
      {
        value: f,
        onChange: (o) => a(o.target.value),
        placeholder: "Enter your password",
        required: !0,
        autoComplete: "current-password",
        disabled: s,
        labelAction: C ? /* @__PURE__ */ r(
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
    /* @__PURE__ */ r(j, { error: b, onDismiss: g }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: s || !l || !f,
        "aria-busy": s,
        children: s ? /* @__PURE__ */ h(R, { children: [
          /* @__PURE__ */ r(O, { size: "sm", announce: !0, label: "Signing in" }),
          /* @__PURE__ */ r("span", { children: "Signing in..." })
        ] }) : "Sign in"
      }
    ),
    u && /* @__PURE__ */ h("p", { className: "cedros-form-footer", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ r("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: u, children: "Sign up" })
    ] })
  ] });
}
function Ce({
  onSuccess: c,
  onSwitchToLogin: u,
  className: C = ""
}) {
  const { config: m } = U(), { register: d, isLoading: s, error: b, clearError: g } = Z(), [l, i] = w(""), [f, a] = w(""), [p, k] = w(""), [N, y] = w(""), [n, t] = w(null), [e, o] = w(null), v = m.forms?.termsOfService, L = m.forms?.emailOptIn, D = v?.show ?? !1, I = v?.required ?? !0, Y = v?.defaultChecked ?? !1, $ = v?.label ?? "I agree to the Terms of Service", G = v?.url, x = ie(G), J = L?.show ?? !1, Q = L?.defaultChecked ?? !1, X = L?.label ?? "Send me updates and news", [S, ee] = w(Y), [te, re] = w(Q), V = p === N, se = n?.isValid ?? !1, _ = f && p && N && V && se && (!D || !I || S) && !s, oe = async (A) => {
    if (A.preventDefault(), o(null), D && I && !S) {
      o({
        code: "VALIDATION_ERROR",
        message: "You must agree to the Terms of Service to continue"
      });
      return;
    }
    if (_)
      try {
        await d(f, p, l || void 0), c?.();
      } catch {
      }
  }, ae = b || e, ne = () => {
    g(), o(null);
  };
  return /* @__PURE__ */ h("form", { onSubmit: oe, className: `cedros-form ${C}`, children: [
    /* @__PURE__ */ h("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ h("label", { htmlFor: "name", className: "cedros-label", children: [
        "Name ",
        /* @__PURE__ */ r("span", { className: "cedros-optional", children: "(optional)" })
      ] }),
      /* @__PURE__ */ r(
        "input",
        {
          id: "name",
          type: "text",
          className: "cedros-input",
          value: l,
          onChange: (A) => i(A.target.value),
          placeholder: "Your name",
          autoComplete: "name",
          disabled: s
        }
      )
    ] }),
    /* @__PURE__ */ h("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ r("label", { htmlFor: "register-email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: "register-email",
          type: "email",
          className: "cedros-input",
          value: f,
          onChange: (A) => a(A.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: s
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      q,
      {
        value: p,
        onChange: (A) => k(A.target.value),
        placeholder: "Create a password",
        required: !0,
        autoComplete: "new-password",
        disabled: s,
        showStrengthMeter: !0,
        onValidationChange: t
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      q,
      {
        label: "Confirm Password",
        value: N,
        onChange: (A) => y(A.target.value),
        placeholder: "Confirm your password",
        required: !0,
        autoComplete: "new-password",
        disabled: s,
        "aria-invalid": N && !V ? "true" : void 0,
        error: N && !V ? "Passwords do not match" : void 0
      }
    ) }),
    D && /* @__PURE__ */ r("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ h("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ r(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: S,
          onChange: (A) => ee(A.target.checked),
          disabled: s,
          "aria-required": I
        }
      ),
      /* @__PURE__ */ h("span", { className: "cedros-checkbox-text", children: [
        x ? /* @__PURE__ */ h(R, { children: [
          $.replace("Terms of Service", "").trim() || "I agree to the",
          " ",
          /* @__PURE__ */ r(
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
        I && /* @__PURE__ */ r("span", { className: "cedros-required", children: "*" })
      ] })
    ] }) }),
    J && /* @__PURE__ */ r("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ h("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ r(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: te,
          onChange: (A) => re(A.target.checked),
          disabled: s
        }
      ),
      /* @__PURE__ */ r("span", { className: "cedros-checkbox-text", children: X })
    ] }) }),
    /* @__PURE__ */ r(j, { error: ae, onDismiss: ne }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: !_,
        "aria-busy": s,
        children: s ? /* @__PURE__ */ h(R, { children: [
          /* @__PURE__ */ r(O, { size: "sm", announce: !0, label: "Creating account" }),
          /* @__PURE__ */ r("span", { children: "Creating account..." })
        ] }) : "Create account"
      }
    ),
    u && /* @__PURE__ */ h("p", { className: "cedros-form-footer", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ r("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: u, children: "Sign in" })
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
