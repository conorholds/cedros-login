import { jsxs as f, jsx as e, Fragment as D } from "react/jsx-runtime";
import { useRef as W, useState as w, useCallback as E, useEffect as U, useMemo as z, useId as j } from "react";
import { L as $ } from "./LoadingSpinner-6vml-zwr.js";
import { E as H } from "./ErrorMessage-CcEK0pYO.js";
import { u as x, A as K, h as q } from "./useCedrosLogin-CFfID-0i.js";
import { b as F, v as ce } from "./validation-B8kMV3BL.js";
import { s as le } from "./sanitization-CQ-H1MSg.js";
function Z(c = {}) {
  const { maxAttempts: m = 5, windowMs: k = 6e4, showCountdown: p = !1 } = c, u = W([]), [a, v] = w(!1), [, b] = w(0), d = E(() => {
    b((i) => i + 1);
  }, []), l = E(() => {
    const i = Date.now();
    u.current = u.current.filter((t) => i - t < k);
  }, [k]), g = E(() => {
    l(), v((i) => u.current.length === 0 && i ? !1 : i);
  }, [l]), n = E(() => (l(), Math.max(0, m - u.current.length)), [l, m]), h = E(() => {
    if (l(), u.current.length === 0)
      return 0;
    const t = u.current[0] + k;
    return Math.max(0, t - Date.now());
  }, [l, k]), y = E(() => (l(), u.current.length < m), [l, m]), C = E(() => {
    if (g(), u.current.length >= m) {
      const i = h(), t = Math.ceil(i / 1e3);
      throw new Error(
        `Too many attempts. Please wait ${t} second${t === 1 ? "" : "s"} before trying again.`
      );
    }
    u.current.push(Date.now()), v((i) => i || !0), d();
  }, [g, m, h, d]), N = E(() => {
    u.current = [], v((i) => i && !1), d();
  }, [d]);
  return U(() => {
    if (!a || !p) return;
    const i = window.setInterval(() => {
      g(), d();
    }, 1e3);
    return () => {
      window.clearInterval(i);
    };
  }, [a, p, d, g]), {
    checkLimit: C,
    isAllowed: y,
    getRemainingAttempts: n,
    getTimeUntilReset: h,
    reset: N
  };
}
function ie(c) {
  return "mfaRequired" in c && c.mfaRequired === !0;
}
function Y() {
  const { config: c, _internal: m } = x(), [k, p] = w(!1), [u, a] = w(null), {
    checkLimit: v,
    getRemainingAttempts: b,
    getTimeUntilReset: d,
    reset: l
  } = Z({ maxAttempts: 5, windowMs: 6e4 }), g = z(
    () => new K({
      baseUrl: c.serverUrl,
      timeoutMs: c.requestTimeout,
      retryAttempts: c.retryAttempts
    }),
    [c.serverUrl, c.requestTimeout, c.retryAttempts]
  ), n = c.callbacks, h = c.features?.walletEnrollment !== !1, y = c.serverUrl, C = E(
    async (t, s) => {
      if (!F(t)) {
        const o = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw a(o), o;
      }
      try {
        v();
      } catch (o) {
        const r = {
          code: "RATE_LIMITED",
          message: o instanceof Error ? o.message : "Too many attempts"
        };
        throw a(r), r;
      }
      p(!0), a(null);
      try {
        const o = await g.post("/login", {
          email: t,
          password: s
        });
        if (ie(o))
          return {
            mfaRequired: !0,
            mfaToken: o.mfaToken,
            email: t,
            userId: o.userId
          };
        const r = o;
        return n?.onLoginSuccess?.(r.user, "email"), m?.handleLoginSuccess(r.user, r.tokens), l(), {
          mfaRequired: !1,
          response: r
        };
      } catch (o) {
        const r = q(o, "Unable to sign in. Please try again.");
        throw a(r), r;
      } finally {
        p(!1);
      }
    },
    [g, n, m, v, l]
  ), N = E(
    async (t, s, o) => {
      if (!F(t)) {
        const r = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw a(r), r;
      }
      try {
        v();
      } catch (r) {
        const A = {
          code: "RATE_LIMITED",
          message: r instanceof Error ? r.message : "Too many attempts"
        };
        throw a(A), A;
      }
      p(!0), a(null);
      try {
        const r = await g.post("/register", { email: t, password: s, name: o });
        if (n?.onLoginSuccess?.(r.user, "email"), m?.handleLoginSuccess(r.user, r.tokens), l(), h) {
          const A = r.tokens?.accessToken ?? "", I = !A ? 200 : 0;
          new Promise((L) => setTimeout(L, I)).then(() => import("./silentWalletEnroll-Dp1GTeNr.js")).then(
            ({ silentWalletEnroll: L }) => L({
              password: s,
              serverUrl: y,
              accessToken: A
            })
          ).then((L) => {
            L.success || console.warn("[useEmailAuth] Wallet auto-enrollment failed:", L.error);
          }).catch((L) => {
            const V = L instanceof Error ? L.message : "Unknown error";
            console.warn("[useEmailAuth] Wallet auto-enrollment unavailable:", V);
          });
        }
        return r;
      } catch (r) {
        const A = q(r, "Unable to create your account. Please try again.");
        throw a(A), A;
      } finally {
        p(!1);
      }
    },
    [
      g,
      n,
      m,
      v,
      l,
      y,
      h
    ]
  ), i = E(() => a(null), []);
  return {
    login: C,
    register: N,
    isLoading: k,
    error: u,
    clearError: i,
    // M-10: Point-in-time snapshots for UI display (see interface JSDoc)
    remainingAttempts: b(),
    timeUntilReset: d()
  };
}
function O({
  label: c = "Password",
  labelAction: m,
  showStrengthMeter: k = !1,
  onValidationChange: p,
  error: u,
  className: a = "",
  onChange: v,
  value: b,
  ...d
}) {
  const [l, g] = w(!1), [n, h] = w(null), y = j(), C = (i) => {
    const t = i.target.value;
    if (k || p) {
      const s = ce(t);
      h(s), p?.(s);
    }
    v?.(i);
  }, N = {
    weak: "var(--cedros-destructive, #ef4444)",
    fair: "var(--cedros-warning, #f59e0b)",
    good: "var(--cedros-success, #22c55e)",
    strong: "var(--cedros-success, #22c55e)"
  };
  return /* @__PURE__ */ f("div", { className: `cedros-password-input ${a}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-label-row", children: [
      /* @__PURE__ */ e("label", { htmlFor: y, className: "cedros-label", children: c }),
      m
    ] }),
    /* @__PURE__ */ f("div", { className: "cedros-password-wrapper", children: [
      /* @__PURE__ */ e(
        "input",
        {
          id: y,
          type: l ? "text" : "password",
          className: "cedros-input",
          onChange: C,
          value: b,
          "aria-invalid": u ? "true" : void 0,
          "aria-describedby": u ? `${y}-error` : void 0,
          ...d
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-password-toggle",
          onClick: () => g(!l),
          "aria-label": l ? "Hide password" : "Show password",
          "aria-pressed": l,
          children: l ? /* @__PURE__ */ f("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
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
          ] }) : /* @__PURE__ */ f("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
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
    u && /* @__PURE__ */ e("p", { id: `${y}-error`, className: "cedros-input-error", children: u }),
    k && n && b?.length > 0 && /* @__PURE__ */ f("div", { className: "cedros-password-strength", children: [
      /* @__PURE__ */ e("div", { className: "cedros-strength-bar", children: /* @__PURE__ */ e(
        "div",
        {
          className: "cedros-strength-fill",
          style: {
            width: `${n.strength === "weak" ? 25 : n.strength === "fair" ? 50 : n.strength === "good" ? 75 : 100}%`,
            backgroundColor: N[n.strength]
          }
        }
      ) }),
      /* @__PURE__ */ e("span", { className: "cedros-strength-label", children: n.strength })
    ] })
  ] });
}
function de() {
  const { config: c, _internal: m } = x(), [k, p] = w("idle"), [u, a] = w(!1), [v, b] = w(null), {
    checkLimit: d,
    getRemainingAttempts: l,
    getTimeUntilReset: g,
    reset: n
  } = Z({ maxAttempts: 5, windowMs: 12e4 }), h = z(
    () => new K({
      baseUrl: c.serverUrl,
      timeoutMs: c.requestTimeout,
      retryAttempts: c.retryAttempts
    }),
    [c.serverUrl, c.requestTimeout, c.retryAttempts]
  ), y = E(
    async (i, t) => {
      const s = /^[A-Z0-9]{16}$/i.test(t) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/i.test(t);
      if (!(/^\d{6}$/.test(t) || s)) {
        const r = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid 6-digit code or recovery code"
        };
        throw b(r), r;
      }
      try {
        d();
      } catch (r) {
        const A = {
          code: "RATE_LIMITED",
          message: r instanceof Error ? r.message : "Too many attempts"
        };
        throw b(A), A;
      }
      a(!0), b(null), p("verifying");
      try {
        const r = await h.post("/login/mfa", { mfaToken: i, code: t });
        return p("success"), n(), m && r.user && r.tokens && m.handleLoginSuccess(r.user, r.tokens), r;
      } catch (r) {
        const A = q(r, "Incorrect verification code. Please check and try again.");
        throw b(A), p("error"), A;
      } finally {
        a(!1);
      }
    },
    [h, m, d, n]
  ), C = E(() => b(null), []), N = E(() => {
    b(null), p("idle"), a(!1);
  }, []);
  return {
    state: k,
    isLoading: u,
    error: v,
    verifyTotp: y,
    clearError: C,
    reset: N,
    // Point-in-time snapshots for UI display
    remainingAttempts: l(),
    timeUntilReset: g()
  };
}
const R = 6;
function ue({
  value: c = "",
  onChange: m,
  onComplete: k,
  disabled: p = !1,
  error: u,
  autoFocus: a = !1,
  className: v = ""
}) {
  const b = W([]), [d, l] = w(c.padEnd(R, "")), g = j();
  U(() => {
    l(c.padEnd(R, ""));
  }, [c]);
  const n = E((t) => {
    t >= 0 && t < R && b.current[t]?.focus();
  }, []), h = E(
    (t) => {
      const s = t.replace(/\D/g, "").slice(0, R);
      l(s.padEnd(R, "")), m?.(s), s.length === R && k?.(s);
    },
    [m, k]
  ), y = E(
    (t, s) => {
      if (!/^\d?$/.test(s)) return;
      const o = d.split("");
      o[t] = s;
      const r = o.join("").replace(/ /g, "");
      h(r), s && t < R - 1 && n(t + 1);
    },
    [d, h, n]
  ), C = E(
    (t, s) => {
      if (s.key === "Backspace") {
        s.preventDefault();
        const o = d.split("");
        o[t] && o[t] !== " " ? (o[t] = " ", h(o.join("").replace(/ /g, ""))) : t > 0 && (o[t - 1] = " ", h(o.join("").replace(/ /g, "")), n(t - 1));
      } else s.key === "ArrowLeft" && t > 0 ? (s.preventDefault(), n(t - 1)) : s.key === "ArrowRight" && t < R - 1 && (s.preventDefault(), n(t + 1));
    },
    [d, h, n]
  ), N = E(
    (t) => {
      t.preventDefault();
      const o = t.clipboardData.getData("text").replace(/\D/g, "").slice(0, R);
      o && (h(o), n(Math.min(o.length, R - 1)));
    },
    [h, n]
  ), i = E((t) => {
    t.target.select();
  }, []);
  return U(() => {
    a && !p && b.current[0]?.focus();
  }, [a, p]), /* @__PURE__ */ f("div", { className: `cedros-otp-input ${v}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-otp-slots", role: "group", "aria-label": "One-time password", children: Array.from({ length: R }).map((t, s) => /* @__PURE__ */ e(
      "input",
      {
        ref: (o) => {
          b.current[s] = o;
        },
        id: `${g}-${s}`,
        type: "text",
        inputMode: "numeric",
        pattern: "[0-9]*",
        maxLength: 1,
        className: `cedros-otp-slot ${u ? "cedros-otp-slot-error" : ""}`,
        value: d[s] === " " ? "" : d[s] || "",
        onChange: (o) => y(s, o.target.value),
        onKeyDown: (o) => C(s, o),
        onPaste: N,
        onFocus: i,
        disabled: p,
        autoComplete: "one-time-code",
        "aria-label": `Digit ${s + 1}`,
        "aria-invalid": u ? "true" : void 0
      },
      s
    )) }),
    u && /* @__PURE__ */ e("p", { className: "cedros-otp-error", role: "alert", children: u })
  ] });
}
function me({
  mfaToken: c,
  email: m,
  onSuccess: k,
  onBack: p,
  className: u = ""
}) {
  const { verifyTotp: a, isLoading: v, error: b, clearError: d } = de(), [l, g] = w(""), [n, h] = w(!1), [y, C] = w(""), N = async (s) => {
    const o = s || (n ? y : l);
    if (o)
      try {
        await a(c, o), k?.();
      } catch {
        n ? C("") : g("");
      }
  }, i = (s) => {
    N(s);
  }, t = () => {
    h(!n), d(), g(""), C("");
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
      /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: n ? "Enter one of your recovery codes to sign in." : "Enter the 6-digit code from your authenticator app." }),
      m && /* @__PURE__ */ e("p", { className: "cedros-totp-email", children: m })
    ] }),
    n ? /* @__PURE__ */ f("div", { className: "cedros-totp-backup-input", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "text",
          className: `cedros-input ${b ? "cedros-input-error" : ""}`,
          placeholder: "Enter recovery code",
          value: y,
          onChange: (s) => {
            C(s.target.value.toUpperCase()), d();
          },
          onKeyDown: (s) => {
            s.key === "Enter" && y && N();
          },
          disabled: v,
          autoFocus: !0,
          autoComplete: "one-time-code"
        }
      ),
      b && /* @__PURE__ */ e("p", { className: "cedros-input-error", role: "alert", children: b.message })
    ] }) : /* @__PURE__ */ e(
      ue,
      {
        value: l,
        onChange: (s) => {
          g(s), d();
        },
        onComplete: i,
        disabled: v,
        error: b?.message,
        autoFocus: !0
      }
    ),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        onClick: () => N(),
        disabled: v || (n ? !y : l.length !== 6),
        children: v ? /* @__PURE__ */ f(D, { children: [
          /* @__PURE__ */ e($, { size: "sm" }),
          /* @__PURE__ */ e("span", { children: "Verifying..." })
        ] }) : "Verify"
      }
    ),
    /* @__PURE__ */ f("div", { className: "cedros-totp-verify-footer", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-link cedros-link-sm",
          onClick: t,
          disabled: v,
          children: n ? "Use authenticator app" : "Use a recovery code"
        }
      ),
      p && /* @__PURE__ */ f(D, { children: [
        /* @__PURE__ */ e("span", { className: "cedros-totp-verify-divider", children: "•" }),
        /* @__PURE__ */ e(
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
  onForgotPassword: k,
  className: p = ""
}) {
  const { login: u, isLoading: a, error: v, clearError: b } = Y(), [d, l] = w(""), [g, n] = w(""), [h, y] = w(null), [C, N] = w(""), i = async (o) => {
    o.preventDefault();
    try {
      const r = await u(d, g);
      r.mfaRequired ? (y(r.mfaToken), N(r.email)) : c?.();
    } catch {
    }
  }, t = () => {
    y(null), N(""), c?.();
  }, s = () => {
    y(null), N(""), n("");
  };
  return h ? /* @__PURE__ */ e(
    me,
    {
      mfaToken: h,
      email: C,
      onSuccess: t,
      onBack: s,
      className: p
    }
  ) : /* @__PURE__ */ f("form", { onSubmit: i, className: `cedros-form ${p}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: "email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: "email",
          type: "email",
          className: "cedros-input",
          value: d,
          onChange: (o) => l(o.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: a
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      O,
      {
        value: g,
        onChange: (o) => n(o.target.value),
        placeholder: "Enter your password",
        required: !0,
        autoComplete: "current-password",
        disabled: a,
        labelAction: k ? /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-link cedros-link-muted cedros-link-sm",
            onClick: k,
            children: "Forgot your password?"
          }
        ) : void 0
      }
    ) }),
    /* @__PURE__ */ e(H, { error: v, onDismiss: b }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: a || !d || !g,
        "aria-busy": a,
        children: a ? /* @__PURE__ */ f(D, { children: [
          /* @__PURE__ */ e($, { size: "sm", announce: !0, label: "Signing in" }),
          /* @__PURE__ */ e("span", { children: "Signing in..." })
        ] }) : "Sign in"
      }
    ),
    m && /* @__PURE__ */ f("p", { className: "cedros-form-footer", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: m, children: "Sign up" })
    ] })
  ] });
}
function Ce({
  onSuccess: c,
  onSwitchToLogin: m,
  className: k = ""
}) {
  const { config: p } = x(), { register: u, isLoading: a, error: v, clearError: b } = Y(), [d, l] = w(""), [g, n] = w(""), [h, y] = w(""), [C, N] = w(""), [i, t] = w(null), [s, o] = w(null), r = p.forms?.termsOfService, A = p.forms?.emailOptIn, S = r?.show ?? !1, I = r?.required ?? !0, L = r?.defaultChecked ?? !1, V = r?.label ?? "I agree to the Terms of Service", G = r?.url, _ = le(G), J = A?.show ?? !1, Q = A?.defaultChecked ?? !1, X = A?.label ?? "Send me updates and news", [M, ee] = w(L), [te, re] = w(Q), P = h === C, se = i?.isValid ?? !1, B = g && h && C && P && se && (!S || !I || M) && !a, oe = async (T) => {
    if (T.preventDefault(), o(null), S && I && !M) {
      o({
        code: "VALIDATION_ERROR",
        message: "You must agree to the Terms of Service to continue"
      });
      return;
    }
    if (B)
      try {
        await u(g, h, d || void 0), c?.();
      } catch {
      }
  }, ae = v || s, ne = () => {
    b(), o(null);
  };
  return /* @__PURE__ */ f("form", { onSubmit: oe, className: `cedros-form ${k}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ f("label", { htmlFor: "name", className: "cedros-label", children: [
        "Name ",
        /* @__PURE__ */ e("span", { className: "cedros-optional", children: "(optional)" })
      ] }),
      /* @__PURE__ */ e(
        "input",
        {
          id: "name",
          type: "text",
          className: "cedros-input",
          value: d,
          onChange: (T) => l(T.target.value),
          placeholder: "Your name",
          autoComplete: "name",
          disabled: a
        }
      )
    ] }),
    /* @__PURE__ */ f("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: "register-email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: "register-email",
          type: "email",
          className: "cedros-input",
          value: g,
          onChange: (T) => n(T.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: a
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      O,
      {
        value: h,
        onChange: (T) => y(T.target.value),
        placeholder: "Create a password",
        required: !0,
        autoComplete: "new-password",
        disabled: a,
        showStrengthMeter: !0,
        onValidationChange: t
      }
    ) }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      O,
      {
        label: "Confirm Password",
        value: C,
        onChange: (T) => N(T.target.value),
        placeholder: "Confirm your password",
        required: !0,
        autoComplete: "new-password",
        disabled: a,
        "aria-invalid": C && !P ? "true" : void 0,
        error: C && !P ? "Passwords do not match" : void 0
      }
    ) }),
    S && /* @__PURE__ */ e("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ f("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: M,
          onChange: (T) => ee(T.target.checked),
          disabled: a,
          "aria-required": I
        }
      ),
      /* @__PURE__ */ f("span", { className: "cedros-checkbox-text", children: [
        _ ? /* @__PURE__ */ f(D, { children: [
          V.replace("Terms of Service", "").trim() || "I agree to the",
          " ",
          /* @__PURE__ */ e(
            "a",
            {
              href: _,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "cedros-link",
              children: "Terms of Service"
            }
          )
        ] }) : V,
        I && /* @__PURE__ */ e("span", { className: "cedros-required", children: "*" })
      ] })
    ] }) }),
    J && /* @__PURE__ */ e("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ f("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: te,
          onChange: (T) => re(T.target.checked),
          disabled: a
        }
      ),
      /* @__PURE__ */ e("span", { className: "cedros-checkbox-text", children: X })
    ] }) }),
    /* @__PURE__ */ e(H, { error: ae, onDismiss: ne }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: !B,
        "aria-busy": a,
        children: a ? /* @__PURE__ */ f(D, { children: [
          /* @__PURE__ */ e($, { size: "sm", announce: !0, label: "Creating account" }),
          /* @__PURE__ */ e("span", { children: "Creating account..." })
        ] }) : "Create account"
      }
    ),
    m && /* @__PURE__ */ f("p", { className: "cedros-form-footer", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: m, children: "Sign in" })
    ] })
  ] });
}
export {
  ke as E,
  ue as O,
  O as P,
  me as T,
  Ce as a,
  Z as b,
  de as c,
  Y as u
};
