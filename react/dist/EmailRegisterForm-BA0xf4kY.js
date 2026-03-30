import { jsxs as h, jsx as e, Fragment as I } from "react/jsx-runtime";
import { useRef as H, useState as w, useCallback as E, useEffect as U, useMemo as K, useId as Z } from "react";
import { L as _, E as Y } from "./ErrorMessage-59nRkszi.js";
import { u as F, A as G, h as x } from "./useCedrosLogin-aNpnZjyZ.js";
import { b as j, v as he } from "./validation-B8kMV3BL.js";
import { u as fe, s as ge } from "./useServerFeatures-CnThdmAr.js";
function J(c = {}) {
  const { maxAttempts: m = 5, windowMs: C = 6e4, showCountdown: f = !1 } = c, d = H([]), [u, a] = w(!1), [, v] = w(0), p = E(() => {
    v((o) => o + 1);
  }, []), i = E(() => {
    const o = Date.now();
    d.current = d.current.filter((t) => o - t < C);
  }, [C]), b = E(() => {
    i(), a((o) => d.current.length === 0 && o ? !1 : o);
  }, [i]), s = E(() => (i(), Math.max(0, m - d.current.length)), [i, m]), g = E(() => {
    if (i(), d.current.length === 0)
      return 0;
    const t = d.current[0] + C;
    return Math.max(0, t - Date.now());
  }, [i, C]), k = E(() => (i(), d.current.length < m), [i, m]), N = E(() => {
    if (b(), d.current.length >= m) {
      const o = g(), t = Math.ceil(o / 1e3);
      throw new Error(
        `Too many attempts. Please wait ${t} second${t === 1 ? "" : "s"} before trying again.`
      );
    }
    d.current.push(Date.now()), a((o) => o || !0), p();
  }, [b, m, g, p]), y = E(() => {
    d.current = [], a((o) => o && !1), p();
  }, [p]);
  return U(() => {
    if (!u || !f) return;
    const o = window.setInterval(() => {
      b(), p();
    }, 1e3);
    return () => {
      window.clearInterval(o);
    };
  }, [u, f, p, b]), {
    checkLimit: N,
    isAllowed: k,
    getRemainingAttempts: s,
    getTimeUntilReset: g,
    reset: y
  };
}
function ve(c) {
  return "mfaRequired" in c && c.mfaRequired === !0;
}
function Q() {
  const { config: c, _internal: m } = F(), [C, f] = w(!1), [d, u] = w(null), {
    checkLimit: a,
    getRemainingAttempts: v,
    getTimeUntilReset: p,
    reset: i
  } = J({ maxAttempts: 5, windowMs: 6e4 }), b = K(
    () => new G({
      baseUrl: c.serverUrl,
      timeoutMs: c.requestTimeout,
      retryAttempts: c.retryAttempts
    }),
    [c.serverUrl, c.requestTimeout, c.retryAttempts]
  ), s = c.callbacks, g = E(
    async (y, o) => {
      if (!j(y)) {
        const t = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw u(t), t;
      }
      try {
        a();
      } catch (t) {
        const r = {
          code: "RATE_LIMITED",
          message: t instanceof Error ? t.message : "Too many attempts"
        };
        throw u(r), r;
      }
      f(!0), u(null);
      try {
        const t = await b.post("/login", {
          email: y,
          password: o
        });
        if (ve(t))
          return {
            mfaRequired: !0,
            mfaToken: t.mfaToken,
            email: y,
            userId: t.userId
          };
        const r = t;
        return s?.onLoginSuccess?.(r.user, "email"), m?.handleLoginSuccess(r.user, r.tokens), i(), {
          mfaRequired: !1,
          response: r
        };
      } catch (t) {
        const r = x(t, "Unable to sign in. Please try again.");
        throw u(r), r;
      } finally {
        f(!1);
      }
    },
    [b, s, m, a, i]
  ), k = E(
    async (y, o, t, r, n) => {
      if (!j(y)) {
        const l = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw u(l), l;
      }
      try {
        a();
      } catch (l) {
        const A = {
          code: "RATE_LIMITED",
          message: l instanceof Error ? l.message : "Too many attempts"
        };
        throw u(A), A;
      }
      f(!0), u(null);
      try {
        const l = r ?? m?.getReferralCode?.() ?? void 0, A = await b.post("/register", {
          email: y,
          password: o,
          name: t,
          referral: l,
          ...n ? { access_code: n } : {}
        });
        return s?.onLoginSuccess?.(A.user, "email"), m?.handleLoginSuccess(A.user, A.tokens), i(), A;
      } catch (l) {
        const A = x(l, "Unable to create your account. Please try again.");
        throw u(A), A;
      } finally {
        f(!1);
      }
    },
    [b, s, m, a, i]
  ), N = E(() => u(null), []);
  return {
    login: g,
    register: k,
    isLoading: C,
    error: d,
    clearError: N,
    // M-10: Point-in-time snapshots for UI display (see interface JSDoc)
    remainingAttempts: v(),
    timeUntilReset: p()
  };
}
function $({
  label: c = "Password",
  labelAction: m,
  showStrengthMeter: C = !1,
  onValidationChange: f,
  error: d,
  className: u = "",
  onChange: a,
  value: v,
  ...p
}) {
  const [i, b] = w(!1), [s, g] = w(null), k = Z(), N = (o) => {
    const t = o.target.value;
    if (C || f) {
      const r = he(t);
      g(r), f?.(r);
    }
    a?.(o);
  }, y = {
    weak: "var(--cedros-destructive, #ef4444)",
    fair: "var(--cedros-warning, #f59e0b)",
    good: "var(--cedros-success, #22c55e)",
    strong: "var(--cedros-success, #22c55e)"
  };
  return /* @__PURE__ */ h("div", { className: `cedros-password-input ${u}`, children: [
    /* @__PURE__ */ h("div", { className: "cedros-label-row", children: [
      /* @__PURE__ */ e("label", { htmlFor: k, className: "cedros-label", children: c }),
      m
    ] }),
    /* @__PURE__ */ h("div", { className: "cedros-password-wrapper", children: [
      /* @__PURE__ */ e(
        "input",
        {
          id: k,
          type: i ? "text" : "password",
          className: "cedros-input",
          onChange: N,
          value: v,
          "aria-invalid": d ? "true" : void 0,
          "aria-describedby": d ? `${k}-error` : void 0,
          ...p
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-password-toggle",
          onClick: () => b(!i),
          "aria-label": i ? "Hide password" : "Show password",
          "aria-pressed": i,
          children: i ? /* @__PURE__ */ h("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
            /* @__PURE__ */ e(
              "path",
              {
                d: "M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z",
                stroke: "currentColor",
                strokeWidth: "1.5"
              }
            ),
            /* @__PURE__ */ e("circle", { cx: "10", cy: "10", r: "2.5", stroke: "currentColor", strokeWidth: "1.5" }),
            /* @__PURE__ */ e("path", { d: "M3 17L17 3", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
          ] }) : /* @__PURE__ */ h("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
            /* @__PURE__ */ e(
              "path",
              {
                d: "M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z",
                stroke: "currentColor",
                strokeWidth: "1.5"
              }
            ),
            /* @__PURE__ */ e("circle", { cx: "10", cy: "10", r: "2.5", stroke: "currentColor", strokeWidth: "1.5" })
          ] })
        }
      )
    ] }),
    d && /* @__PURE__ */ e("p", { id: `${k}-error`, className: "cedros-input-error", children: d }),
    C && s && v?.length > 0 && /* @__PURE__ */ h("div", { className: "cedros-password-strength", children: [
      /* @__PURE__ */ e("div", { className: "cedros-strength-bar", children: /* @__PURE__ */ e(
        "div",
        {
          className: "cedros-strength-fill",
          style: {
            width: `${s.strength === "weak" ? 25 : s.strength === "fair" ? 50 : s.strength === "good" ? 75 : 100}%`,
            backgroundColor: y[s.strength]
          }
        }
      ) }),
      /* @__PURE__ */ e("span", { className: "cedros-strength-label", children: s.strength })
    ] })
  ] });
}
function be() {
  const { config: c, _internal: m } = F(), [C, f] = w("idle"), [d, u] = w(!1), [a, v] = w(null), {
    checkLimit: p,
    getRemainingAttempts: i,
    getTimeUntilReset: b,
    reset: s
  } = J({ maxAttempts: 5, windowMs: 12e4 }), g = K(
    () => new G({
      baseUrl: c.serverUrl,
      timeoutMs: c.requestTimeout,
      retryAttempts: c.retryAttempts
    }),
    [c.serverUrl, c.requestTimeout, c.retryAttempts]
  ), k = E(
    async (o, t) => {
      const r = /^[A-Z0-9]{16}$/i.test(t) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/i.test(t);
      if (!(/^\d{6}$/.test(t) || r)) {
        const l = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid 6-digit code or recovery code"
        };
        throw v(l), l;
      }
      try {
        p();
      } catch (l) {
        const A = {
          code: "RATE_LIMITED",
          message: l instanceof Error ? l.message : "Too many attempts"
        };
        throw v(A), A;
      }
      u(!0), v(null), f("verifying");
      try {
        const l = await g.post("/login/mfa", { mfaToken: o, code: t });
        return f("success"), s(), m && l.user && l.tokens && m.handleLoginSuccess(l.user, l.tokens), l;
      } catch (l) {
        const A = x(l, "Incorrect verification code. Please check and try again.");
        throw v(A), f("error"), A;
      } finally {
        u(!1);
      }
    },
    [g, m, p, s]
  ), N = E(() => v(null), []), y = E(() => {
    v(null), f("idle"), u(!1);
  }, []);
  return {
    state: C,
    isLoading: d,
    error: a,
    verifyTotp: k,
    clearError: N,
    reset: y,
    // Point-in-time snapshots for UI display
    remainingAttempts: i(),
    timeUntilReset: b()
  };
}
const R = 6;
function we({
  value: c = "",
  onChange: m,
  onComplete: C,
  disabled: f = !1,
  error: d,
  autoFocus: u = !1,
  className: a = ""
}) {
  const v = H([]), [p, i] = w(c.padEnd(R, "")), b = Z();
  U(() => {
    i(c.padEnd(R, ""));
  }, [c]);
  const s = E((t) => {
    t >= 0 && t < R && v.current[t]?.focus();
  }, []), g = E(
    (t) => {
      const r = t.replace(/\D/g, "").slice(0, R);
      i(r.padEnd(R, "")), m?.(r), r.length === R && C?.(r);
    },
    [m, C]
  ), k = E(
    (t, r) => {
      if (!/^\d?$/.test(r)) return;
      const n = p.split("");
      n[t] = r;
      const l = n.join("").replace(/ /g, "");
      g(l), r && t < R - 1 && s(t + 1);
    },
    [p, g, s]
  ), N = E(
    (t, r) => {
      if (r.key === "Backspace") {
        r.preventDefault();
        const n = p.split("");
        n[t] && n[t] !== " " ? (n[t] = " ", g(n.join("").replace(/ /g, ""))) : t > 0 && (n[t - 1] = " ", g(n.join("").replace(/ /g, "")), s(t - 1));
      } else r.key === "ArrowLeft" && t > 0 ? (r.preventDefault(), s(t - 1)) : r.key === "ArrowRight" && t < R - 1 && (r.preventDefault(), s(t + 1));
    },
    [p, g, s]
  ), y = E(
    (t) => {
      t.preventDefault();
      const n = t.clipboardData.getData("text").replace(/\D/g, "").slice(0, R);
      n && (g(n), s(Math.min(n.length, R - 1)));
    },
    [g, s]
  ), o = E((t) => {
    t.target.select();
  }, []);
  return U(() => {
    u && !f && v.current[0]?.focus();
  }, [u, f]), /* @__PURE__ */ h("div", { className: `cedros-otp-input ${a}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-otp-slots", role: "group", "aria-label": "One-time password", children: Array.from({ length: R }).map((t, r) => /* @__PURE__ */ e(
      "input",
      {
        ref: (n) => {
          v.current[r] = n;
        },
        id: `${b}-${r}`,
        type: "text",
        inputMode: "numeric",
        pattern: "[0-9]*",
        maxLength: 1,
        className: `cedros-otp-slot ${d ? "cedros-otp-slot-error" : ""}`,
        value: p[r] === " " ? "" : p[r] || "",
        onChange: (n) => k(r, n.target.value),
        onKeyDown: (n) => N(r, n),
        onPaste: y,
        onFocus: o,
        disabled: f,
        autoComplete: "one-time-code",
        "aria-label": `Digit ${r + 1}`,
        "aria-invalid": d ? "true" : void 0
      },
      r
    )) }),
    d && /* @__PURE__ */ e("p", { className: "cedros-otp-error", role: "alert", children: d })
  ] });
}
function ye({
  mfaToken: c,
  email: m,
  onSuccess: C,
  onBack: f,
  className: d = ""
}) {
  const { verifyTotp: u, isLoading: a, error: v, clearError: p } = be(), [i, b] = w(""), [s, g] = w(!1), [k, N] = w(""), y = async (r) => {
    const n = r || (s ? k : i);
    if (n)
      try {
        await u(c, n), C?.();
      } catch {
        s ? N("") : b("");
      }
  }, o = (r) => {
    y(r);
  }, t = () => {
    g(!s), p(), b(""), N("");
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
            /* @__PURE__ */ e("rect", { x: "8", y: "20", width: "32", height: "24", rx: "4", stroke: "currentColor", strokeWidth: "2" }),
            /* @__PURE__ */ e(
              "path",
              {
                d: "M16 20V14a8 8 0 1 1 16 0v6",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ e("circle", { cx: "24", cy: "32", r: "3", fill: "currentColor" })
          ]
        }
      ),
      /* @__PURE__ */ e("h3", { className: "cedros-totp-title", children: "Two-factor authentication" }),
      /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: s ? "Enter one of your recovery codes to sign in." : "Enter the 6-digit code from your authenticator app." }),
      m && /* @__PURE__ */ e("p", { className: "cedros-totp-email", children: m })
    ] }),
    s ? /* @__PURE__ */ h("div", { className: "cedros-totp-backup-input", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "text",
          className: `cedros-input ${v ? "cedros-input-error" : ""}`,
          placeholder: "Enter recovery code",
          value: k,
          onChange: (r) => {
            N(r.target.value.toUpperCase()), p();
          },
          onKeyDown: (r) => {
            r.key === "Enter" && k && y();
          },
          disabled: a,
          autoFocus: !0,
          autoComplete: "one-time-code"
        }
      ),
      v && /* @__PURE__ */ e("p", { className: "cedros-input-error", role: "alert", children: v.message })
    ] }) : /* @__PURE__ */ e(
      we,
      {
        value: i,
        onChange: (r) => {
          b(r), p();
        },
        onComplete: o,
        disabled: a,
        error: v?.message,
        autoFocus: !0
      }
    ),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        onClick: () => y(),
        disabled: a || (s ? !k : i.length !== 6),
        children: a ? /* @__PURE__ */ h(I, { children: [
          /* @__PURE__ */ e(_, { size: "sm" }),
          /* @__PURE__ */ e("span", { children: "Verifying..." })
        ] }) : "Verify"
      }
    ),
    /* @__PURE__ */ h("div", { className: "cedros-totp-verify-footer", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-link cedros-link-sm",
          onClick: t,
          disabled: a,
          children: s ? "Use authenticator app" : "Use a recovery code"
        }
      ),
      f && /* @__PURE__ */ h(I, { children: [
        /* @__PURE__ */ e("span", { className: "cedros-totp-verify-divider", children: "•" }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-link cedros-link-sm",
            onClick: f,
            disabled: a,
            children: "Back to login"
          }
        )
      ] })
    ] })
  ] });
}
function Re({
  onSuccess: c,
  onSwitchToRegister: m,
  onForgotPassword: C,
  className: f = ""
}) {
  const { login: d, isLoading: u, error: a, clearError: v } = Q(), [p, i] = w(""), [b, s] = w(""), [g, k] = w(null), [N, y] = w(""), o = async (n) => {
    n.preventDefault();
    try {
      const l = await d(p, b);
      l.mfaRequired ? (k(l.mfaToken), y(l.email)) : c?.();
    } catch {
    }
  }, t = () => {
    k(null), y(""), c?.();
  }, r = () => {
    k(null), y(""), s("");
  };
  return g ? /* @__PURE__ */ e(
    ye,
    {
      mfaToken: g,
      email: N,
      onSuccess: t,
      onBack: r,
      className: f
    }
  ) : /* @__PURE__ */ h("form", { onSubmit: o, className: `cedros-form ${f}`, children: [
    /* @__PURE__ */ h("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: "email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: "email",
          type: "email",
          className: "cedros-input",
          value: p,
          onChange: (n) => i(n.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: u
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      $,
      {
        value: b,
        onChange: (n) => s(n.target.value),
        placeholder: "Enter your password",
        required: !0,
        autoComplete: "current-password",
        disabled: u,
        labelAction: C ? /* @__PURE__ */ e(
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
    /* @__PURE__ */ e(Y, { error: a, onDismiss: v }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: u || !p || !b,
        "aria-busy": u,
        children: u ? /* @__PURE__ */ h(I, { children: [
          /* @__PURE__ */ e(_, { size: "sm", announce: !0, label: "Signing in" }),
          /* @__PURE__ */ e("span", { children: "Signing in..." })
        ] }) : "Sign in"
      }
    ),
    m && /* @__PURE__ */ h("p", { className: "cedros-form-footer", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: m, children: "Sign up" })
    ] })
  ] });
}
function Le({
  onSuccess: c,
  onSwitchToLogin: m,
  className: C = "",
  accessCode: f
}) {
  const { config: d } = F(), { register: u, isLoading: a, error: v, clearError: p } = Q(), { features: i } = fe(), [b, s] = w(""), [g, k] = w(""), [N, y] = w(""), [o, t] = w(""), [r, n] = w(""), l = f ?? r, [A, X] = w(null), [ee, S] = w(null), L = d.forms?.termsOfService, q = d.forms?.emailOptIn, V = L?.show ?? !1, D = L?.required ?? !0, te = L?.defaultChecked ?? !1, B = L?.label ?? "I agree to the Terms of Service", re = L?.url, z = ge(re), se = q?.show ?? !1, oe = q?.defaultChecked ?? !1, ae = q?.label ?? "Send me updates and news", [M, ne] = w(te), [ce, ie] = w(oe), P = N === o, le = A?.isValid ?? !1, de = !V || !D || M, O = i?.signupAccessCodeRequired ?? !1, W = g && N && o && P && le && de && (!O || l.trim()) && !a, ue = async (T) => {
    if (T.preventDefault(), S(null), V && D && !M) {
      S({
        code: "VALIDATION_ERROR",
        message: "You must agree to the Terms of Service to continue"
      });
      return;
    }
    if (W)
      try {
        await u(
          g,
          N,
          b || void 0,
          void 0,
          O && l.trim() || void 0
        ), c?.();
      } catch {
      }
  }, me = v || ee, pe = () => {
    p(), S(null);
  };
  return /* @__PURE__ */ h("form", { onSubmit: ue, className: `cedros-form ${C}`, children: [
    /* @__PURE__ */ h("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ h("label", { htmlFor: "name", className: "cedros-label", children: [
        "Name ",
        /* @__PURE__ */ e("span", { className: "cedros-optional", children: "(optional)" })
      ] }),
      /* @__PURE__ */ e(
        "input",
        {
          id: "name",
          type: "text",
          className: "cedros-input",
          value: b,
          onChange: (T) => s(T.target.value),
          placeholder: "Your name",
          autoComplete: "name",
          disabled: a
        }
      )
    ] }),
    /* @__PURE__ */ h("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: "register-email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: "register-email",
          type: "email",
          className: "cedros-input",
          value: g,
          onChange: (T) => k(T.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: a
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      $,
      {
        value: N,
        onChange: (T) => y(T.target.value),
        placeholder: "Create a password",
        required: !0,
        autoComplete: "new-password",
        disabled: a,
        showStrengthMeter: !0,
        onValidationChange: X
      }
    ) }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      $,
      {
        label: "Confirm Password",
        value: o,
        onChange: (T) => t(T.target.value),
        placeholder: "Confirm your password",
        required: !0,
        autoComplete: "new-password",
        disabled: a,
        "aria-invalid": o && !P ? "true" : void 0,
        error: o && !P ? "Passwords do not match" : void 0
      }
    ) }),
    O && f === void 0 && /* @__PURE__ */ h("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: "register-access-code", className: "cedros-label", children: "Access Code" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: "register-access-code",
          type: "text",
          className: "cedros-input",
          value: r,
          onChange: (T) => n(T.target.value),
          placeholder: "Enter access code",
          required: !0,
          "aria-required": "true",
          disabled: a,
          autoComplete: "off"
        }
      )
    ] }),
    V && /* @__PURE__ */ e("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ h("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: M,
          onChange: (T) => ne(T.target.checked),
          disabled: a,
          "aria-required": D
        }
      ),
      /* @__PURE__ */ h("span", { className: "cedros-checkbox-text", children: [
        z ? /* @__PURE__ */ h(I, { children: [
          B.replace("Terms of Service", "").trim() || "I agree to the",
          " ",
          /* @__PURE__ */ e(
            "a",
            {
              href: z,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "cedros-link",
              children: "Terms of Service"
            }
          )
        ] }) : B,
        D && /* @__PURE__ */ e("span", { className: "cedros-required", children: "*" })
      ] })
    ] }) }),
    se && /* @__PURE__ */ e("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ h("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: ce,
          onChange: (T) => ie(T.target.checked),
          disabled: a
        }
      ),
      /* @__PURE__ */ e("span", { className: "cedros-checkbox-text", children: ae })
    ] }) }),
    /* @__PURE__ */ e(Y, { error: me, onDismiss: pe }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: !W,
        "aria-busy": a,
        children: a ? /* @__PURE__ */ h(I, { children: [
          /* @__PURE__ */ e(_, { size: "sm", announce: !0, label: "Creating account" }),
          /* @__PURE__ */ e("span", { children: "Creating account..." })
        ] }) : "Create account"
      }
    ),
    m && /* @__PURE__ */ h("p", { className: "cedros-form-footer", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: m, children: "Sign in" })
    ] })
  ] });
}
export {
  Re as E,
  we as O,
  $ as P,
  ye as T,
  Le as a,
  J as b,
  be as c,
  Q as u
};
