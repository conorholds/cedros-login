import { jsxs as f, jsx as e, Fragment as O } from "react/jsx-runtime";
import { useRef as G, useState as v, useCallback as C, useEffect as W, useMemo as z, useId as J } from "react";
import { u as U, A as H, h as P } from "./apiClient-B2JxVPlH.js";
import { b as j, v as ce } from "./validation-B8kMV3BL.js";
import { L as K } from "./LoadingSpinner-6vml-zwr.js";
import { E as Q } from "./ErrorMessage-CcEK0pYO.js";
import { s as ie } from "./sanitization-CQ-H1MSg.js";
function Z(n = {}) {
  const { maxAttempts: h = 5, windowMs: N = 6e4, showCountdown: d = !1 } = n, p = G([]), [c, w] = v(!1), [, l] = v(0), m = C(() => {
    l((r) => r + 1);
  }, []), u = C(() => {
    const r = Date.now();
    p.current = p.current.filter((t) => r - t < N);
  }, [N]), b = C(() => {
    u(), w((r) => p.current.length === 0 && r ? !1 : r);
  }, [u]), i = C(() => (u(), Math.max(0, h - p.current.length)), [u, h]), g = C(() => {
    if (u(), p.current.length === 0)
      return 0;
    const t = p.current[0] + N;
    return Math.max(0, t - Date.now());
  }, [u, N]), y = C(() => (u(), p.current.length < h), [u, h]), E = C(() => {
    if (b(), p.current.length >= h) {
      const r = g(), t = Math.ceil(r / 1e3);
      throw new Error(
        `Too many attempts. Please wait ${t} second${t === 1 ? "" : "s"} before trying again.`
      );
    }
    p.current.push(Date.now()), w((r) => r || !0), m();
  }, [b, h, g, m]), k = C(() => {
    p.current = [], w((r) => r && !1), m();
  }, [m]);
  return W(() => {
    if (!c || !d) return;
    const r = window.setInterval(() => {
      b(), m();
    }, 1e3);
    return () => {
      window.clearInterval(r);
    };
  }, [c, d, m, b]), {
    checkLimit: E,
    isAllowed: y,
    getRemainingAttempts: i,
    getTimeUntilReset: g,
    reset: k
  };
}
function le(n) {
  return "mfaRequired" in n && n.mfaRequired === !0;
}
function X() {
  const { config: n, _internal: h } = U(), [N, d] = v(!1), [p, c] = v(null), {
    checkLimit: w,
    getRemainingAttempts: l,
    getTimeUntilReset: m,
    reset: u
  } = Z({ maxAttempts: 5, windowMs: 6e4 }), b = z(
    () => new H({
      baseUrl: n.serverUrl,
      timeoutMs: n.requestTimeout,
      retryAttempts: n.retryAttempts
    }),
    [n.serverUrl, n.requestTimeout, n.retryAttempts]
  ), i = n.callbacks, g = n.features?.walletEnrollment !== !1, y = n.serverUrl, E = C(
    async (t, s) => {
      if (!j(t)) {
        const a = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw c(a), a;
      }
      try {
        w();
      } catch (a) {
        const o = {
          code: "RATE_LIMITED",
          message: a instanceof Error ? a.message : "Too many attempts"
        };
        throw c(o), o;
      }
      d(!0), c(null);
      try {
        const a = await b.post("/login", {
          email: t,
          password: s
        });
        if (le(a))
          return {
            mfaRequired: !0,
            mfaToken: a.mfaToken,
            email: t,
            userId: a.userId
          };
        const o = a;
        return i?.onLoginSuccess?.(o.user, "email"), h?.handleLoginSuccess(o.user, o.tokens), u(), {
          mfaRequired: !1,
          response: o
        };
      } catch (a) {
        const o = P(a, "Login failed");
        throw c(o), o;
      } finally {
        d(!1);
      }
    },
    [b, i, h, w, u]
  ), k = C(
    async (t, s, a) => {
      if (!j(t)) {
        const o = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw c(o), o;
      }
      try {
        w();
      } catch (o) {
        const L = {
          code: "RATE_LIMITED",
          message: o instanceof Error ? o.message : "Too many attempts"
        };
        throw c(L), L;
      }
      d(!0), c(null);
      try {
        const o = await b.post("/register", { email: t, password: s, name: a });
        if (i?.onLoginSuccess?.(o.user, "email"), h?.handleLoginSuccess(o.user, o.tokens), u(), g) {
          const L = o.tokens?.accessToken ?? "", R = !L ? 200 : 0;
          new Promise((A) => setTimeout(A, R)).then(() => import("./silentWalletEnroll-DR2kPw7W.js")).then(
            ({ silentWalletEnroll: A }) => A({
              password: s,
              serverUrl: y,
              accessToken: L
            })
          ).then((A) => {
            A.success || console.warn("[useEmailAuth] Wallet auto-enrollment failed:", A.error);
          }).catch((A) => {
            const M = A instanceof Error ? A.message : "Unknown error";
            console.warn("[useEmailAuth] Wallet auto-enrollment unavailable:", M);
          });
        }
        return o;
      } catch (o) {
        const L = P(o, "Registration failed");
        throw c(L), L;
      } finally {
        d(!1);
      }
    },
    [
      b,
      i,
      h,
      w,
      u,
      y,
      g
    ]
  ), r = C(() => c(null), []);
  return {
    login: E,
    register: k,
    isLoading: N,
    error: p,
    clearError: r,
    // M-10: Point-in-time snapshots for UI display (see interface JSDoc)
    remainingAttempts: l(),
    timeUntilReset: m()
  };
}
function de(n) {
  return typeof n == "object" && n !== null && "mfaRequired" in n && n.mfaRequired === !0;
}
function ue() {
  const { config: n, _internal: h } = U(), [N, d] = v(!1), [p, c] = v(!1), [w, l] = v(null), m = z(
    () => new H({
      baseUrl: n.serverUrl,
      timeoutMs: n.requestTimeout,
      retryAttempts: n.retryAttempts
    }),
    [n.serverUrl, n.requestTimeout, n.retryAttempts]
  ), { checkLimit: u, getRemainingAttempts: b } = Z({
    maxAttempts: 3,
    windowMs: 3e5
  }), i = C(
    async (k) => {
      if (!j(k)) {
        const r = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw l(r), r;
      }
      try {
        u();
      } catch (r) {
        const t = {
          code: "RATE_LIMITED",
          message: r instanceof Error ? r.message : "Too many attempts"
        };
        throw l(t), t;
      }
      d(!0), l(null), c(!1);
      try {
        await m.post("/instant-link", { email: k }), c(!0);
      } catch (r) {
        const t = P(r, "Failed to send sign-in link");
        throw l(t), t;
      } finally {
        d(!1);
      }
    },
    [m, u]
  ), g = C(
    async (k) => {
      if (!k || k.trim().length === 0) {
        const r = {
          code: "VALIDATION_ERROR",
          message: "Invalid or missing sign-in link token"
        };
        throw l(r), r;
      }
      d(!0), l(null), c(!1);
      try {
        const r = await m.post(
          "/instant-link/verify",
          {
            token: k
          }
        );
        return de(r) || (n.callbacks?.onLoginSuccess?.(r.user, "email"), h?.handleLoginSuccess(r.user, r.tokens)), r;
      } catch (r) {
        const t = P(r, "Failed to verify sign-in link");
        throw l(t), t;
      } finally {
        d(!1);
      }
    },
    [m, n.callbacks, h]
  ), y = C(() => l(null), []), E = C(() => {
    l(null), c(!1), d(!1);
  }, []);
  return {
    sendInstantLink: i,
    verifyInstantLink: g,
    isLoading: N,
    isSuccess: p,
    error: w,
    clearError: y,
    reset: E,
    remainingAttempts: b()
  };
}
function ee({
  label: n = "Password",
  labelAction: h,
  showStrengthMeter: N = !1,
  onValidationChange: d,
  error: p,
  className: c = "",
  onChange: w,
  value: l,
  ...m
}) {
  const [u, b] = v(!1), [i, g] = v(null), y = J(), E = (r) => {
    const t = r.target.value;
    if (N || d) {
      const s = ce(t);
      g(s), d?.(s);
    }
    w?.(r);
  }, k = {
    weak: "var(--cedros-destructive, #ef4444)",
    fair: "var(--cedros-warning, #f59e0b)",
    good: "var(--cedros-success, #22c55e)",
    strong: "var(--cedros-success, #22c55e)"
  };
  return /* @__PURE__ */ f("div", { className: `cedros-password-input ${c}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-label-row", children: [
      /* @__PURE__ */ e("label", { htmlFor: y, className: "cedros-label", children: n }),
      h
    ] }),
    /* @__PURE__ */ f("div", { className: "cedros-password-wrapper", children: [
      /* @__PURE__ */ e(
        "input",
        {
          id: y,
          type: u ? "text" : "password",
          className: "cedros-input",
          onChange: E,
          value: l,
          "aria-invalid": p ? "true" : void 0,
          "aria-describedby": p ? `${y}-error` : void 0,
          ...m
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-password-toggle",
          onClick: () => b(!u),
          "aria-label": u ? "Hide password" : "Show password",
          "aria-pressed": u,
          children: u ? /* @__PURE__ */ f("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
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
    p && /* @__PURE__ */ e("p", { id: `${y}-error`, className: "cedros-input-error", children: p }),
    N && i && l?.length > 0 && /* @__PURE__ */ f("div", { className: "cedros-password-strength", children: [
      /* @__PURE__ */ e("div", { className: "cedros-strength-bar", children: /* @__PURE__ */ e(
        "div",
        {
          className: "cedros-strength-fill",
          style: {
            width: `${i.strength === "weak" ? 25 : i.strength === "fair" ? 50 : i.strength === "good" ? 75 : 100}%`,
            backgroundColor: k[i.strength]
          }
        }
      ) }),
      /* @__PURE__ */ e("span", { className: "cedros-strength-label", children: i.strength })
    ] })
  ] });
}
function me() {
  const { config: n, _internal: h } = U(), [N, d] = v("idle"), [p, c] = v(!1), [w, l] = v(null), {
    checkLimit: m,
    getRemainingAttempts: u,
    getTimeUntilReset: b,
    reset: i
  } = Z({ maxAttempts: 5, windowMs: 12e4 }), g = z(
    () => new H({
      baseUrl: n.serverUrl,
      timeoutMs: n.requestTimeout,
      retryAttempts: n.retryAttempts
    }),
    [n.serverUrl, n.requestTimeout, n.retryAttempts]
  ), y = C(
    async (r, t) => {
      const s = /^[A-Z0-9]{16}$/i.test(t) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/i.test(t);
      if (!(/^\d{6}$/.test(t) || s)) {
        const o = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid 6-digit code or recovery code"
        };
        throw l(o), o;
      }
      try {
        m();
      } catch (o) {
        const L = {
          code: "RATE_LIMITED",
          message: o instanceof Error ? o.message : "Too many attempts"
        };
        throw l(L), L;
      }
      c(!0), l(null), d("verifying");
      try {
        const o = await g.post("/login/mfa", { mfaToken: r, code: t });
        return d("success"), i(), h && o.user && o.tokens && h.handleLoginSuccess(o.user, o.tokens), o;
      } catch (o) {
        const L = P(o, "Invalid verification code");
        throw l(L), d("error"), L;
      } finally {
        c(!1);
      }
    },
    [g, h, m, i]
  ), E = C(() => l(null), []), k = C(() => {
    l(null), d("idle"), c(!1);
  }, []);
  return {
    state: N,
    isLoading: p,
    error: w,
    verifyTotp: y,
    clearError: E,
    reset: k,
    // Point-in-time snapshots for UI display
    remainingAttempts: u(),
    timeUntilReset: b()
  };
}
const I = 6;
function he({
  value: n = "",
  onChange: h,
  onComplete: N,
  disabled: d = !1,
  error: p,
  autoFocus: c = !1,
  className: w = ""
}) {
  const l = G([]), [m, u] = v(n.padEnd(I, "")), b = J();
  W(() => {
    u(n.padEnd(I, ""));
  }, [n]);
  const i = C((t) => {
    t >= 0 && t < I && l.current[t]?.focus();
  }, []), g = C(
    (t) => {
      const s = t.replace(/\D/g, "").slice(0, I);
      u(s.padEnd(I, "")), h?.(s), s.length === I && N?.(s);
    },
    [h, N]
  ), y = C(
    (t, s) => {
      if (!/^\d?$/.test(s)) return;
      const a = m.split("");
      a[t] = s;
      const o = a.join("").replace(/ /g, "");
      g(o), s && t < I - 1 && i(t + 1);
    },
    [m, g, i]
  ), E = C(
    (t, s) => {
      if (s.key === "Backspace") {
        s.preventDefault();
        const a = m.split("");
        a[t] && a[t] !== " " ? (a[t] = " ", g(a.join("").replace(/ /g, ""))) : t > 0 && (a[t - 1] = " ", g(a.join("").replace(/ /g, "")), i(t - 1));
      } else s.key === "ArrowLeft" && t > 0 ? (s.preventDefault(), i(t - 1)) : s.key === "ArrowRight" && t < I - 1 && (s.preventDefault(), i(t + 1));
    },
    [m, g, i]
  ), k = C(
    (t) => {
      t.preventDefault();
      const a = t.clipboardData.getData("text").replace(/\D/g, "").slice(0, I);
      a && (g(a), i(Math.min(a.length, I - 1)));
    },
    [g, i]
  ), r = C((t) => {
    t.target.select();
  }, []);
  return W(() => {
    c && !d && l.current[0]?.focus();
  }, [c, d]), /* @__PURE__ */ f("div", { className: `cedros-otp-input ${w}`, children: [
    /* @__PURE__ */ e("div", { className: "cedros-otp-slots", role: "group", "aria-label": "One-time password", children: Array.from({ length: I }).map((t, s) => /* @__PURE__ */ e(
      "input",
      {
        ref: (a) => {
          l.current[s] = a;
        },
        id: `${b}-${s}`,
        type: "text",
        inputMode: "numeric",
        pattern: "[0-9]*",
        maxLength: 1,
        className: `cedros-otp-slot ${p ? "cedros-otp-slot-error" : ""}`,
        value: m[s] === " " ? "" : m[s] || "",
        onChange: (a) => y(s, a.target.value),
        onKeyDown: (a) => E(s, a),
        onPaste: k,
        onFocus: r,
        disabled: d,
        autoComplete: "one-time-code",
        "aria-label": `Digit ${s + 1}`,
        "aria-invalid": p ? "true" : void 0
      },
      s
    )) }),
    p && /* @__PURE__ */ e("p", { className: "cedros-otp-error", role: "alert", children: p })
  ] });
}
function pe({
  mfaToken: n,
  email: h,
  onSuccess: N,
  onBack: d,
  className: p = ""
}) {
  const { verifyTotp: c, isLoading: w, error: l, clearError: m } = me(), [u, b] = v(""), [i, g] = v(!1), [y, E] = v(""), k = async (s) => {
    const a = s || (i ? y : u);
    if (a)
      try {
        await c(n, a), N?.();
      } catch {
        i ? E("") : b("");
      }
  }, r = (s) => {
    k(s);
  }, t = () => {
    g(!i), m(), b(""), E("");
  };
  return /* @__PURE__ */ f("div", { className: `cedros-totp-verify ${p}`, children: [
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
      /* @__PURE__ */ e("p", { className: "cedros-totp-description", children: i ? "Enter one of your recovery codes to sign in." : "Enter the 6-digit code from your authenticator app." }),
      h && /* @__PURE__ */ e("p", { className: "cedros-totp-email", children: h })
    ] }),
    i ? /* @__PURE__ */ f("div", { className: "cedros-totp-backup-input", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "text",
          className: `cedros-input ${l ? "cedros-input-error" : ""}`,
          placeholder: "Enter recovery code",
          value: y,
          onChange: (s) => {
            E(s.target.value.toUpperCase()), m();
          },
          onKeyDown: (s) => {
            s.key === "Enter" && y && k();
          },
          disabled: w,
          autoFocus: !0,
          autoComplete: "one-time-code"
        }
      ),
      l && /* @__PURE__ */ e("p", { className: "cedros-input-error", role: "alert", children: l.message })
    ] }) : /* @__PURE__ */ e(
      he,
      {
        value: u,
        onChange: (s) => {
          b(s), m();
        },
        onComplete: r,
        disabled: w,
        error: l?.message,
        autoFocus: !0
      }
    ),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        onClick: () => k(),
        disabled: w || (i ? !y : u.length !== 6),
        children: w ? /* @__PURE__ */ f(O, { children: [
          /* @__PURE__ */ e(K, { size: "sm" }),
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
          disabled: w,
          children: i ? "Use authenticator app" : "Use a recovery code"
        }
      ),
      d && /* @__PURE__ */ f(O, { children: [
        /* @__PURE__ */ e("span", { className: "cedros-totp-verify-divider", children: "•" }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-link cedros-link-sm",
            onClick: d,
            disabled: w,
            children: "Back to login"
          }
        )
      ] })
    ] })
  ] });
}
function Ce({
  onSuccess: n,
  onSwitchToRegister: h,
  onForgotPassword: N,
  className: d = ""
}) {
  const { config: p } = U(), { login: c, isLoading: w, error: l, clearError: m } = X(), {
    sendInstantLink: u,
    isLoading: b,
    isSuccess: i,
    error: g,
    clearError: y,
    reset: E
  } = ue(), [k, r] = v(""), [t, s] = v(""), [a, o] = v(null), [L, S] = v(""), R = p.forms?.forgotPassword?.mode ?? "reset", A = async (D) => {
    D.preventDefault();
    try {
      const q = await c(k, t);
      q.mfaRequired ? (o(q.mfaToken), S(q.email)) : n?.();
    } catch {
    }
  }, M = () => {
    o(null), S(""), n?.();
  }, _ = () => {
    o(null), S(""), s("");
  }, x = async () => {
    if (R === "instantLink")
      try {
        await u(k);
      } catch {
      }
    else
      N?.();
  };
  if (a)
    return /* @__PURE__ */ e(
      pe,
      {
        mfaToken: a,
        email: L,
        onSuccess: M,
        onBack: _,
        className: d
      }
    );
  if (i)
    return /* @__PURE__ */ f("div", { className: `cedros-instant-link-success ${d}`, children: [
      /* @__PURE__ */ f(
        "svg",
        {
          className: "cedros-success-icon",
          width: "48",
          height: "48",
          viewBox: "0 0 48 48",
          fill: "none",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ e("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
            /* @__PURE__ */ e(
              "path",
              {
                d: "M14 24l7 7 13-13",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ e("h3", { className: "cedros-success-title", children: "Check your email" }),
      /* @__PURE__ */ f("p", { className: "cedros-success-message", children: [
        "We sent a sign-in link to ",
        /* @__PURE__ */ e("strong", { children: k }),
        ". Click the link to sign in."
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-outline",
          onClick: E,
          children: "Back to login"
        }
      )
    ] });
  const F = l || g, B = () => {
    m(), y();
  }, V = w || b;
  return /* @__PURE__ */ f("form", { onSubmit: A, className: `cedros-form ${d}`, children: [
    /* @__PURE__ */ f("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: "email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: "email",
          type: "email",
          className: "cedros-input",
          value: k,
          onChange: (D) => r(D.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: V
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      ee,
      {
        value: t,
        onChange: (D) => s(D.target.value),
        placeholder: "Enter your password",
        required: !0,
        autoComplete: "current-password",
        disabled: V,
        labelAction: N || R === "instantLink" ? /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-link cedros-link-sm",
            onClick: x,
            disabled: b,
            children: b ? "Sending..." : "Forgot your password?"
          }
        ) : void 0
      }
    ) }),
    /* @__PURE__ */ e(Q, { error: F, onDismiss: B }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: V || !k || !t,
        "aria-busy": w,
        children: w ? /* @__PURE__ */ f(O, { children: [
          /* @__PURE__ */ e(K, { size: "sm", announce: !0, label: "Signing in" }),
          /* @__PURE__ */ e("span", { children: "Signing in..." })
        ] }) : "Sign in"
      }
    ),
    h && /* @__PURE__ */ f("p", { className: "cedros-form-footer", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-link", onClick: h, children: "Sign up" })
    ] })
  ] });
}
function Ne({
  onSuccess: n,
  onSwitchToLogin: h,
  className: N = ""
}) {
  const { config: d } = U(), { register: p, isLoading: c, error: w, clearError: l } = X(), [m, u] = v(""), [b, i] = v(""), [g, y] = v(""), [E, k] = v(""), [r, t] = v(null), [s, a] = v(null), o = d.forms?.termsOfService, L = d.forms?.emailOptIn, S = o?.show ?? !1, R = o?.required ?? !0, A = o?.defaultChecked ?? !1, M = o?.label ?? "I agree to the Terms of Service", _ = o?.url, x = ie(_), F = L?.show ?? !1, B = L?.defaultChecked ?? !1, V = L?.label ?? "Send me updates and news", [D, q] = v(A), [te, re] = v(B), $ = g === E, se = r?.isValid ?? !1, Y = b && g && E && $ && se && (!S || !R || D) && !c, oe = async (T) => {
    if (T.preventDefault(), a(null), S && R && !D) {
      a({
        code: "VALIDATION_ERROR",
        message: "You must agree to the Terms of Service to continue"
      });
      return;
    }
    if (Y)
      try {
        await p(b, g, m || void 0), n?.();
      } catch {
      }
  }, ne = w || s, ae = () => {
    l(), a(null);
  };
  return /* @__PURE__ */ f("form", { onSubmit: oe, className: `cedros-form ${N}`, children: [
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
          value: m,
          onChange: (T) => u(T.target.value),
          placeholder: "Your name",
          autoComplete: "name",
          disabled: c
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
          value: b,
          onChange: (T) => i(T.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: c
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-form-field", children: /* @__PURE__ */ e(
      ee,
      {
        value: g,
        onChange: (T) => y(T.target.value),
        placeholder: "Create a password",
        required: !0,
        autoComplete: "new-password",
        disabled: c,
        showStrengthMeter: !0,
        onValidationChange: t
      }
    ) }),
    /* @__PURE__ */ f("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ e("label", { htmlFor: "confirm-password", className: "cedros-label", children: "Confirm Password" }),
      /* @__PURE__ */ e(
        "input",
        {
          id: "confirm-password",
          type: "password",
          className: "cedros-input",
          value: E,
          onChange: (T) => k(T.target.value),
          placeholder: "Confirm your password",
          required: !0,
          "aria-required": "true",
          autoComplete: "new-password",
          disabled: c,
          "aria-invalid": E && !$ ? "true" : void 0,
          "aria-describedby": E && !$ ? "confirm-password-error" : void 0
        }
      ),
      E && !$ && /* @__PURE__ */ e("p", { id: "confirm-password-error", className: "cedros-input-error", role: "alert", children: "Passwords do not match" })
    ] }),
    S && /* @__PURE__ */ e("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ f("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: D,
          onChange: (T) => q(T.target.checked),
          disabled: c,
          "aria-required": R
        }
      ),
      /* @__PURE__ */ f("span", { className: "cedros-checkbox-text", children: [
        x ? /* @__PURE__ */ f(O, { children: [
          M.replace("Terms of Service", "").trim() || "I agree to the",
          " ",
          /* @__PURE__ */ e(
            "a",
            {
              href: x,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "cedros-link",
              children: "Terms of Service"
            }
          )
        ] }) : M,
        R && /* @__PURE__ */ e("span", { className: "cedros-required", children: "*" })
      ] })
    ] }) }),
    F && /* @__PURE__ */ e("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ f("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: te,
          onChange: (T) => re(T.target.checked),
          disabled: c
        }
      ),
      /* @__PURE__ */ e("span", { className: "cedros-checkbox-text", children: V })
    ] }) }),
    /* @__PURE__ */ e(Q, { error: ne, onDismiss: ae }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: !Y,
        "aria-busy": c,
        children: c ? /* @__PURE__ */ f(O, { children: [
          /* @__PURE__ */ e(K, { size: "sm", announce: !0, label: "Creating account" }),
          /* @__PURE__ */ e("span", { children: "Creating account..." })
        ] }) : "Create account"
      }
    ),
    h && /* @__PURE__ */ f("p", { className: "cedros-form-footer", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-link", onClick: h, children: "Sign in" })
    ] })
  ] });
}
export {
  Ce as E,
  he as O,
  ee as P,
  pe as T,
  Ne as a,
  Z as b,
  ue as c,
  me as d,
  X as u
};
