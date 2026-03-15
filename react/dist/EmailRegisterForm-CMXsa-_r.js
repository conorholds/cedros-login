import { jsxs as f, jsx as t, Fragment as R } from "react/jsx-runtime";
import { useRef as F, useState as w, useCallback as E, useEffect as M, useMemo as z, useId as W } from "react";
import { L as O } from "./LoadingSpinner-6vml-zwr.js";
import { E as j } from "./ErrorMessage-CcEK0pYO.js";
import { u as U, A as H, h as P } from "./useCedrosLogin-CFfID-0i.js";
import { b as B, v as ce } from "./validation-B8kMV3BL.js";
import { s as ie } from "./sanitization-CQ-H1MSg.js";
function K(c = {}) {
  const { maxAttempts: m = 5, windowMs: C = 6e4, showCountdown: p = !1 } = c, u = F([]), [o, v] = w(!1), [, b] = w(0), l = E(() => {
    b((n) => n + 1);
  }, []), i = E(() => {
    const n = Date.now();
    u.current = u.current.filter((e) => n - e < C);
  }, [C]), g = E(() => {
    i(), v((n) => u.current.length === 0 && n ? !1 : n);
  }, [i]), a = E(() => (i(), Math.max(0, m - u.current.length)), [i, m]), h = E(() => {
    if (i(), u.current.length === 0)
      return 0;
    const e = u.current[0] + C;
    return Math.max(0, e - Date.now());
  }, [i, C]), k = E(() => (i(), u.current.length < m), [i, m]), N = E(() => {
    if (g(), u.current.length >= m) {
      const n = h(), e = Math.ceil(n / 1e3);
      throw new Error(
        `Too many attempts. Please wait ${e} second${e === 1 ? "" : "s"} before trying again.`
      );
    }
    u.current.push(Date.now()), v((n) => n || !0), l();
  }, [g, m, h, l]), y = E(() => {
    u.current = [], v((n) => n && !1), l();
  }, [l]);
  return M(() => {
    if (!o || !p) return;
    const n = window.setInterval(() => {
      g(), l();
    }, 1e3);
    return () => {
      window.clearInterval(n);
    };
  }, [o, p, l, g]), {
    checkLimit: N,
    isAllowed: k,
    getRemainingAttempts: a,
    getTimeUntilReset: h,
    reset: y
  };
}
function le(c) {
  return "mfaRequired" in c && c.mfaRequired === !0;
}
function Z() {
  const { config: c, _internal: m } = U(), [C, p] = w(!1), [u, o] = w(null), {
    checkLimit: v,
    getRemainingAttempts: b,
    getTimeUntilReset: l,
    reset: i
  } = K({ maxAttempts: 5, windowMs: 6e4 }), g = z(
    () => new H({
      baseUrl: c.serverUrl,
      timeoutMs: c.requestTimeout,
      retryAttempts: c.retryAttempts
    }),
    [c.serverUrl, c.requestTimeout, c.retryAttempts]
  ), a = c.callbacks, h = E(
    async (y, n) => {
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
          password: n
        });
        if (le(e))
          return {
            mfaRequired: !0,
            mfaToken: e.mfaToken,
            email: y,
            userId: e.userId
          };
        const r = e;
        return a?.onLoginSuccess?.(r.user, "email"), m?.handleLoginSuccess(r.user, r.tokens), i(), {
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
    [g, a, m, v, i]
  ), k = E(
    async (y, n, e, r) => {
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
        const d = {
          code: "RATE_LIMITED",
          message: s instanceof Error ? s.message : "Too many attempts"
        };
        throw o(d), d;
      }
      p(!0), o(null);
      try {
        const s = await g.post("/register", { email: y, password: n, name: e, referral: r });
        return a?.onLoginSuccess?.(s.user, "email"), m?.handleLoginSuccess(s.user, s.tokens), i(), s;
      } catch (s) {
        const d = P(s, "Unable to create your account. Please try again.");
        throw o(d), d;
      } finally {
        p(!1);
      }
    },
    [g, a, m, v, i]
  ), N = E(() => o(null), []);
  return {
    login: h,
    register: k,
    isLoading: C,
    error: u,
    clearError: N,
    // M-10: Point-in-time snapshots for UI display (see interface JSDoc)
    remainingAttempts: b(),
    timeUntilReset: l()
  };
}
function q({
  label: c = "Password",
  labelAction: m,
  showStrengthMeter: C = !1,
  onValidationChange: p,
  error: u,
  className: o = "",
  onChange: v,
  value: b,
  ...l
}) {
  const [i, g] = w(!1), [a, h] = w(null), k = W(), N = (n) => {
    const e = n.target.value;
    if (C || p) {
      const r = ce(e);
      h(r), p?.(r);
    }
    v?.(n);
  }, y = {
    weak: "var(--cedros-destructive, #ef4444)",
    fair: "var(--cedros-warning, #f59e0b)",
    good: "var(--cedros-success, #22c55e)",
    strong: "var(--cedros-success, #22c55e)"
  };
  return /* @__PURE__ */ f("div", { className: `cedros-password-input ${o}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-label-row", children: [
      /* @__PURE__ */ t("label", { htmlFor: k, className: "cedros-label", children: c }),
      m
    ] }),
    /* @__PURE__ */ f("div", { className: "cedros-password-wrapper", children: [
      /* @__PURE__ */ t(
        "input",
        {
          id: k,
          type: i ? "text" : "password",
          className: "cedros-input",
          onChange: N,
          value: b,
          "aria-invalid": u ? "true" : void 0,
          "aria-describedby": u ? `${k}-error` : void 0,
          ...l
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-password-toggle",
          onClick: () => g(!i),
          "aria-label": i ? "Hide password" : "Show password",
          "aria-pressed": i,
          children: i ? /* @__PURE__ */ f("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
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
    u && /* @__PURE__ */ t("p", { id: `${k}-error`, className: "cedros-input-error", children: u }),
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
  const { config: c, _internal: m } = U(), [C, p] = w("idle"), [u, o] = w(!1), [v, b] = w(null), {
    checkLimit: l,
    getRemainingAttempts: i,
    getTimeUntilReset: g,
    reset: a
  } = K({ maxAttempts: 5, windowMs: 12e4 }), h = z(
    () => new H({
      baseUrl: c.serverUrl,
      timeoutMs: c.requestTimeout,
      retryAttempts: c.retryAttempts
    }),
    [c.serverUrl, c.requestTimeout, c.retryAttempts]
  ), k = E(
    async (n, e) => {
      const r = /^[A-Z0-9]{16}$/i.test(e) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/i.test(e);
      if (!(/^\d{6}$/.test(e) || r)) {
        const d = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid 6-digit code or recovery code"
        };
        throw b(d), d;
      }
      try {
        l();
      } catch (d) {
        const L = {
          code: "RATE_LIMITED",
          message: d instanceof Error ? d.message : "Too many attempts"
        };
        throw b(L), L;
      }
      o(!0), b(null), p("verifying");
      try {
        const d = await h.post("/login/mfa", { mfaToken: n, code: e });
        return p("success"), a(), m && d.user && d.tokens && m.handleLoginSuccess(d.user, d.tokens), d;
      } catch (d) {
        const L = P(d, "Incorrect verification code. Please check and try again.");
        throw b(L), p("error"), L;
      } finally {
        o(!1);
      }
    },
    [h, m, l, a]
  ), N = E(() => b(null), []), y = E(() => {
    b(null), p("idle"), o(!1);
  }, []);
  return {
    state: C,
    isLoading: u,
    error: v,
    verifyTotp: k,
    clearError: N,
    reset: y,
    // Point-in-time snapshots for UI display
    remainingAttempts: i(),
    timeUntilReset: g()
  };
}
const T = 6;
function ue({
  value: c = "",
  onChange: m,
  onComplete: C,
  disabled: p = !1,
  error: u,
  autoFocus: o = !1,
  className: v = ""
}) {
  const b = F([]), [l, i] = w(c.padEnd(T, "")), g = W();
  M(() => {
    i(c.padEnd(T, ""));
  }, [c]);
  const a = E((e) => {
    e >= 0 && e < T && b.current[e]?.focus();
  }, []), h = E(
    (e) => {
      const r = e.replace(/\D/g, "").slice(0, T);
      i(r.padEnd(T, "")), m?.(r), r.length === T && C?.(r);
    },
    [m, C]
  ), k = E(
    (e, r) => {
      if (!/^\d?$/.test(r)) return;
      const s = l.split("");
      s[e] = r;
      const d = s.join("").replace(/ /g, "");
      h(d), r && e < T - 1 && a(e + 1);
    },
    [l, h, a]
  ), N = E(
    (e, r) => {
      if (r.key === "Backspace") {
        r.preventDefault();
        const s = l.split("");
        s[e] && s[e] !== " " ? (s[e] = " ", h(s.join("").replace(/ /g, ""))) : e > 0 && (s[e - 1] = " ", h(s.join("").replace(/ /g, "")), a(e - 1));
      } else r.key === "ArrowLeft" && e > 0 ? (r.preventDefault(), a(e - 1)) : r.key === "ArrowRight" && e < T - 1 && (r.preventDefault(), a(e + 1));
    },
    [l, h, a]
  ), y = E(
    (e) => {
      e.preventDefault();
      const s = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, T);
      s && (h(s), a(Math.min(s.length, T - 1)));
    },
    [h, a]
  ), n = E((e) => {
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
        className: `cedros-otp-slot ${u ? "cedros-otp-slot-error" : ""}`,
        value: l[r] === " " ? "" : l[r] || "",
        onChange: (s) => k(r, s.target.value),
        onKeyDown: (s) => N(r, s),
        onPaste: y,
        onFocus: n,
        disabled: p,
        autoComplete: "one-time-code",
        "aria-label": `Digit ${r + 1}`,
        "aria-invalid": u ? "true" : void 0
      },
      r
    )) }),
    u && /* @__PURE__ */ t("p", { className: "cedros-otp-error", role: "alert", children: u })
  ] });
}
function me({
  mfaToken: c,
  email: m,
  onSuccess: C,
  onBack: p,
  className: u = ""
}) {
  const { verifyTotp: o, isLoading: v, error: b, clearError: l } = de(), [i, g] = w(""), [a, h] = w(!1), [k, N] = w(""), y = async (r) => {
    const s = r || (a ? k : i);
    if (s)
      try {
        await o(c, s), C?.();
      } catch {
        a ? N("") : g("");
      }
  }, n = (r) => {
    y(r);
  }, e = () => {
    h(!a), l(), g(""), N("");
  };
  return /* @__PURE__ */ f("div", { className: `cedros-totp-verify ${u}`, children: [
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
      m && /* @__PURE__ */ t("p", { className: "cedros-totp-email", children: m })
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
            N(r.target.value.toUpperCase()), l();
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
        value: i,
        onChange: (r) => {
          g(r), l();
        },
        onComplete: n,
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
        disabled: v || (a ? !k : i.length !== 6),
        children: v ? /* @__PURE__ */ f(R, { children: [
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
      p && /* @__PURE__ */ f(R, { children: [
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
  onSuccess: c,
  onSwitchToRegister: m,
  onForgotPassword: C,
  className: p = ""
}) {
  const { login: u, isLoading: o, error: v, clearError: b } = Z(), [l, i] = w(""), [g, a] = w(""), [h, k] = w(null), [N, y] = w(""), n = async (s) => {
    s.preventDefault();
    try {
      const d = await u(l, g);
      d.mfaRequired ? (k(d.mfaToken), y(d.email)) : c?.();
    } catch {
    }
  }, e = () => {
    k(null), y(""), c?.();
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
  ) : /* @__PURE__ */ f("form", { onSubmit: n, className: `cedros-form ${p}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ t("label", { htmlFor: "email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ t(
        "input",
        {
          id: "email",
          type: "email",
          className: "cedros-input",
          value: l,
          onChange: (s) => i(s.target.value),
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
        disabled: o || !l || !g,
        "aria-busy": o,
        children: o ? /* @__PURE__ */ f(R, { children: [
          /* @__PURE__ */ t(O, { size: "sm", announce: !0, label: "Signing in" }),
          /* @__PURE__ */ t("span", { children: "Signing in..." })
        ] }) : "Sign in"
      }
    ),
    m && /* @__PURE__ */ f("p", { className: "cedros-form-footer", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ t("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: m, children: "Sign up" })
    ] })
  ] });
}
function Ce({
  onSuccess: c,
  onSwitchToLogin: m,
  className: C = ""
}) {
  const { config: p } = U(), { register: u, isLoading: o, error: v, clearError: b } = Z(), [l, i] = w(""), [g, a] = w(""), [h, k] = w(""), [N, y] = w(""), [n, e] = w(null), [r, s] = w(null), d = p.forms?.termsOfService, L = p.forms?.emailOptIn, D = d?.show ?? !1, I = d?.required ?? !0, Y = d?.defaultChecked ?? !1, $ = d?.label ?? "I agree to the Terms of Service", G = d?.url, x = ie(G), J = L?.show ?? !1, Q = L?.defaultChecked ?? !1, X = L?.label ?? "Send me updates and news", [S, ee] = w(Y), [te, re] = w(Q), V = h === N, se = n?.isValid ?? !1, _ = g && h && N && V && se && (!D || !I || S) && !o, oe = async (A) => {
    if (A.preventDefault(), s(null), D && I && !S) {
      s({
        code: "VALIDATION_ERROR",
        message: "You must agree to the Terms of Service to continue"
      });
      return;
    }
    if (_)
      try {
        await u(g, h, l || void 0), c?.();
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
          value: l,
          onChange: (A) => i(A.target.value),
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
        x ? /* @__PURE__ */ f(R, { children: [
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
        children: o ? /* @__PURE__ */ f(R, { children: [
          /* @__PURE__ */ t(O, { size: "sm", announce: !0, label: "Creating account" }),
          /* @__PURE__ */ t("span", { children: "Creating account..." })
        ] }) : "Create account"
      }
    ),
    m && /* @__PURE__ */ f("p", { className: "cedros-form-footer", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ t("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: m, children: "Sign in" })
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
