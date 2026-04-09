import { jsxs as b, jsx as r, Fragment as S } from "react/jsx-runtime";
import { useRef as O, useState as w, useCallback as E, useEffect as U, useMemo as _, useId as G, useContext as pe, createContext as ge } from "react";
import { b as z, A as B, h as I, L as W, E as Y, c as ve } from "./ErrorMessage-DObd7075.js";
import { b as Z, v as we } from "./validation-B8kMV3BL.js";
const ye = ["https:"], J = ["javascript:", "data:", "vbscript:", "file:"];
function Ve(o) {
  if (!o || typeof o != "string")
    return;
  const s = o.trim();
  if (!s)
    return;
  const m = s.toLowerCase();
  for (const n of J)
    if (m.startsWith(n))
      return;
  try {
    const n = new URL(s);
    return ye.includes(n.protocol) ? s : void 0;
  } catch {
    return;
  }
}
function be(o) {
  if (!o || typeof o != "string")
    return;
  const s = o.trim();
  if (!s)
    return;
  const m = s.toLowerCase();
  for (const n of J)
    if (m.startsWith(n))
      return;
  try {
    const n = new URL(s);
    return n.protocol !== "https:" && n.protocol !== "http:" ? void 0 : s;
  } catch {
    return;
  }
}
function Q(o = {}) {
  const { maxAttempts: s = 5, windowMs: m = 6e4, showCountdown: n = !1 } = o, c = O([]), [h, d] = w(!1), [, u] = w(0), f = E(() => {
    u((i) => i + 1);
  }, []), p = E(() => {
    const i = Date.now();
    c.current = c.current.filter((e) => i - e < m);
  }, [m]), v = E(() => {
    p(), d((i) => c.current.length === 0 && i ? !1 : i);
  }, [p]), a = E(() => (p(), Math.max(0, s - c.current.length)), [p, s]), y = E(() => {
    if (p(), c.current.length === 0)
      return 0;
    const e = c.current[0] + m;
    return Math.max(0, e - Date.now());
  }, [p, m]), C = E(() => (p(), c.current.length < s), [p, s]), N = E(() => {
    if (v(), c.current.length >= s) {
      const i = y(), e = Math.ceil(i / 1e3);
      throw new Error(
        `Too many attempts. Please wait ${e} second${e === 1 ? "" : "s"} before trying again.`
      );
    }
    c.current.push(Date.now()), d((i) => i || !0), f();
  }, [v, s, y, f]), k = E(() => {
    c.current = [], d((i) => i && !1), f();
  }, [f]);
  return U(() => {
    if (!h || !n) return;
    const i = window.setInterval(() => {
      v(), f();
    }, 1e3);
    return () => {
      window.clearInterval(i);
    };
  }, [h, n, f, v]), {
    checkLimit: N,
    isAllowed: C,
    getRemainingAttempts: a,
    getTimeUntilReset: y,
    reset: k
  };
}
function Ce(o) {
  return "mfaRequired" in o && o.mfaRequired === !0;
}
function X() {
  const { config: o, _internal: s } = z(), [m, n] = w(!1), [c, h] = w(null), {
    checkLimit: d,
    getRemainingAttempts: u,
    getTimeUntilReset: f,
    reset: p
  } = Q({ maxAttempts: 5, windowMs: 6e4 }), v = _(
    () => new B({
      baseUrl: o.serverUrl,
      timeoutMs: o.requestTimeout,
      retryAttempts: o.retryAttempts
    }),
    [o.serverUrl, o.requestTimeout, o.retryAttempts]
  ), a = o.callbacks, y = E(
    async (k, i) => {
      if (!Z(k)) {
        const e = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw h(e), e;
      }
      try {
        d();
      } catch (e) {
        const t = {
          code: "RATE_LIMITED",
          message: e instanceof Error ? e.message : "Too many attempts"
        };
        throw h(t), t;
      }
      n(!0), h(null);
      try {
        const e = await v.post("/login", {
          email: k,
          password: i
        });
        if (Ce(e))
          return {
            mfaRequired: !0,
            mfaToken: e.mfaToken,
            email: k,
            userId: e.userId
          };
        const t = e;
        return a?.onLoginSuccess?.(t.user, "email"), s?.handleLoginSuccess(t.user, t.tokens), p(), {
          mfaRequired: !1,
          response: t
        };
      } catch (e) {
        const t = I(e, "Unable to sign in. Please try again.");
        throw h(t), t;
      } finally {
        n(!1);
      }
    },
    [v, a, s, d, p]
  ), C = E(
    async (k, i, e, t, l) => {
      if (!Z(k)) {
        const g = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw h(g), g;
      }
      try {
        d();
      } catch (g) {
        const A = {
          code: "RATE_LIMITED",
          message: g instanceof Error ? g.message : "Too many attempts"
        };
        throw h(A), A;
      }
      n(!0), h(null);
      try {
        const g = t ?? s?.getReferralCode?.() ?? void 0, A = await v.post("/register", {
          email: k,
          password: i,
          name: e,
          referral: g,
          ...l ? { access_code: l } : {}
        });
        return a?.onLoginSuccess?.(A.user, "email"), s?.handleLoginSuccess(A.user, A.tokens), p(), A;
      } catch (g) {
        const A = I(g, "Unable to create your account. Please try again.");
        throw h(A), A;
      } finally {
        n(!1);
      }
    },
    [v, a, s, d, p]
  ), N = E(() => h(null), []);
  return {
    login: y,
    register: C,
    isLoading: m,
    error: c,
    clearError: N,
    // M-10: Point-in-time snapshots for UI display (see interface JSDoc)
    remainingAttempts: u(),
    timeUntilReset: f()
  };
}
function $({
  label: o = "Password",
  labelAction: s,
  showStrengthMeter: m = !1,
  onValidationChange: n,
  error: c,
  className: h = "",
  onChange: d,
  value: u,
  ...f
}) {
  const [p, v] = w(!1), [a, y] = w(null), C = G(), N = (i) => {
    const e = i.target.value;
    if (m || n) {
      const t = we(e);
      y(t), n?.(t);
    }
    d?.(i);
  }, k = {
    weak: "var(--cedros-destructive, #ef4444)",
    fair: "var(--cedros-warning, #f59e0b)",
    good: "var(--cedros-success, #22c55e)",
    strong: "var(--cedros-success, #22c55e)"
  };
  return /* @__PURE__ */ b("div", { className: `cedros-password-input ${h}`, children: [
    /* @__PURE__ */ b("div", { className: "cedros-label-row", children: [
      /* @__PURE__ */ r("label", { htmlFor: C, className: "cedros-label", children: o }),
      s
    ] }),
    /* @__PURE__ */ b("div", { className: "cedros-password-wrapper", children: [
      /* @__PURE__ */ r(
        "input",
        {
          id: C,
          type: p ? "text" : "password",
          className: "cedros-input",
          onChange: N,
          value: u,
          "aria-invalid": c ? "true" : void 0,
          "aria-describedby": c ? `${C}-error` : void 0,
          ...f
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-password-toggle",
          onClick: () => v(!p),
          "aria-label": p ? "Hide password" : "Show password",
          "aria-pressed": p,
          children: p ? /* @__PURE__ */ b("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
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
          ] }) : /* @__PURE__ */ b("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
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
    c && /* @__PURE__ */ r("p", { id: `${C}-error`, className: "cedros-input-error", children: c }),
    m && a && u?.length > 0 && /* @__PURE__ */ b("div", { className: "cedros-password-strength", children: [
      /* @__PURE__ */ r("div", { className: "cedros-strength-bar", children: /* @__PURE__ */ r(
        "div",
        {
          className: "cedros-strength-fill",
          style: {
            width: `${a.strength === "weak" ? 25 : a.strength === "fair" ? 50 : a.strength === "good" ? 75 : 100}%`,
            backgroundColor: k[a.strength]
          }
        }
      ) }),
      /* @__PURE__ */ r("span", { className: "cedros-strength-label", children: a.strength })
    ] })
  ] });
}
function ke() {
  const { config: o, _internal: s } = z(), [m, n] = w("idle"), [c, h] = w(!1), [d, u] = w(null), {
    checkLimit: f,
    getRemainingAttempts: p,
    getTimeUntilReset: v,
    reset: a
  } = Q({ maxAttempts: 5, windowMs: 12e4 }), y = _(
    () => new B({
      baseUrl: o.serverUrl,
      timeoutMs: o.requestTimeout,
      retryAttempts: o.retryAttempts
    }),
    [o.serverUrl, o.requestTimeout, o.retryAttempts]
  ), C = E(
    async (i, e) => {
      const t = /^[A-Z0-9]{16}$/i.test(e) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/i.test(e);
      if (!(/^\d{6}$/.test(e) || t)) {
        const g = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid 6-digit code or recovery code"
        };
        throw u(g), g;
      }
      try {
        f();
      } catch (g) {
        const A = {
          code: "RATE_LIMITED",
          message: g instanceof Error ? g.message : "Too many attempts"
        };
        throw u(A), A;
      }
      h(!0), u(null), n("verifying");
      try {
        const g = await y.post("/login/mfa", { mfaToken: i, code: e });
        return n("success"), a(), s && g.user && g.tokens && s.handleLoginSuccess(g.user, g.tokens), g;
      } catch (g) {
        const A = I(g, "Incorrect verification code. Please check and try again.");
        throw u(A), n("error"), A;
      } finally {
        h(!1);
      }
    },
    [y, s, f, a]
  ), N = E(() => u(null), []), k = E(() => {
    u(null), n("idle"), h(!1);
  }, []);
  return {
    state: m,
    isLoading: c,
    error: d,
    verifyTotp: C,
    clearError: N,
    reset: k,
    // Point-in-time snapshots for UI display
    remainingAttempts: p(),
    timeUntilReset: v()
  };
}
const L = 6;
function Ee({
  value: o = "",
  onChange: s,
  onComplete: m,
  disabled: n = !1,
  error: c,
  autoFocus: h = !1,
  className: d = ""
}) {
  const u = O([]), [f, p] = w(o.padEnd(L, "")), v = G();
  U(() => {
    p(o.padEnd(L, ""));
  }, [o]);
  const a = E((e) => {
    e >= 0 && e < L && u.current[e]?.focus();
  }, []), y = E(
    (e) => {
      const t = e.replace(/\D/g, "").slice(0, L);
      p(t.padEnd(L, "")), s?.(t), t.length === L && m?.(t);
    },
    [s, m]
  ), C = E(
    (e, t) => {
      if (!/^\d?$/.test(t)) return;
      const l = f.split("");
      l[e] = t;
      const g = l.join("").replace(/ /g, "");
      y(g), t && e < L - 1 && a(e + 1);
    },
    [f, y, a]
  ), N = E(
    (e, t) => {
      if (t.key === "Backspace") {
        t.preventDefault();
        const l = f.split("");
        l[e] && l[e] !== " " ? (l[e] = " ", y(l.join("").replace(/ /g, ""))) : e > 0 && (l[e - 1] = " ", y(l.join("").replace(/ /g, "")), a(e - 1));
      } else t.key === "ArrowLeft" && e > 0 ? (t.preventDefault(), a(e - 1)) : t.key === "ArrowRight" && e < L - 1 && (t.preventDefault(), a(e + 1));
    },
    [f, y, a]
  ), k = E(
    (e) => {
      e.preventDefault();
      const l = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, L);
      l && (y(l), a(Math.min(l.length, L - 1)));
    },
    [y, a]
  ), i = E((e) => {
    e.target.select();
  }, []);
  return U(() => {
    h && !n && u.current[0]?.focus();
  }, [h, n]), /* @__PURE__ */ b("div", { className: `cedros-otp-input ${d}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-otp-slots", role: "group", "aria-label": "One-time password", children: Array.from({ length: L }).map((e, t) => /* @__PURE__ */ r(
      "input",
      {
        ref: (l) => {
          u.current[t] = l;
        },
        id: `${v}-${t}`,
        type: "text",
        inputMode: "numeric",
        pattern: "[0-9]*",
        maxLength: 1,
        className: `cedros-otp-slot ${c ? "cedros-otp-slot-error" : ""}`,
        value: f[t] === " " ? "" : f[t] || "",
        onChange: (l) => C(t, l.target.value),
        onKeyDown: (l) => N(t, l),
        onPaste: k,
        onFocus: i,
        disabled: n,
        autoComplete: "one-time-code",
        "aria-label": `Digit ${t + 1}`,
        "aria-invalid": c ? "true" : void 0
      },
      t
    )) }),
    c && /* @__PURE__ */ r("p", { className: "cedros-otp-error", role: "alert", children: c })
  ] });
}
function Ne({
  mfaToken: o,
  email: s,
  onSuccess: m,
  onBack: n,
  className: c = ""
}) {
  const { verifyTotp: h, isLoading: d, error: u, clearError: f } = ke(), [p, v] = w(""), [a, y] = w(!1), [C, N] = w(""), k = async (t) => {
    const l = t || (a ? C : p);
    if (l)
      try {
        await h(o, l), m?.();
      } catch {
        a ? N("") : v("");
      }
  }, i = (t) => {
    k(t);
  }, e = () => {
    y(!a), f(), v(""), N("");
  };
  return /* @__PURE__ */ b("div", { className: `cedros-totp-verify ${c}`, children: [
    /* @__PURE__ */ b("div", { className: "cedros-totp-verify-header", children: [
      /* @__PURE__ */ b(
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
      s && /* @__PURE__ */ r("p", { className: "cedros-totp-email", children: s })
    ] }),
    a ? /* @__PURE__ */ b("div", { className: "cedros-totp-backup-input", children: [
      /* @__PURE__ */ r(
        "input",
        {
          type: "text",
          className: `cedros-input ${u ? "cedros-input-error" : ""}`,
          placeholder: "Enter recovery code",
          value: C,
          onChange: (t) => {
            N(t.target.value.toUpperCase()), f();
          },
          onKeyDown: (t) => {
            t.key === "Enter" && C && k();
          },
          disabled: d,
          autoFocus: !0,
          autoComplete: "one-time-code"
        }
      ),
      u && /* @__PURE__ */ r("p", { className: "cedros-input-error", role: "alert", children: u.message })
    ] }) : /* @__PURE__ */ r(
      Ee,
      {
        value: p,
        onChange: (t) => {
          v(t), f();
        },
        onComplete: i,
        disabled: d,
        error: u?.message,
        autoFocus: !0
      }
    ),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        onClick: () => k(),
        disabled: d || (a ? !C : p.length !== 6),
        children: d ? /* @__PURE__ */ b(S, { children: [
          /* @__PURE__ */ r(W, { size: "sm" }),
          /* @__PURE__ */ r("span", { children: "Verifying..." })
        ] }) : "Verify"
      }
    ),
    /* @__PURE__ */ b("div", { className: "cedros-totp-verify-footer", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-link cedros-link-sm",
          onClick: e,
          disabled: d,
          children: a ? "Use authenticator app" : "Use a recovery code"
        }
      ),
      n && /* @__PURE__ */ b(S, { children: [
        /* @__PURE__ */ r("span", { className: "cedros-totp-verify-divider", children: "•" }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-link cedros-link-sm",
            onClick: n,
            disabled: d,
            children: "Back to login"
          }
        )
      ] })
    ] })
  ] });
}
function xe({
  onSuccess: o,
  onSwitchToRegister: s,
  onForgotPassword: m,
  className: n = ""
}) {
  const { login: c, isLoading: h, error: d, clearError: u } = X(), [f, p] = w(""), [v, a] = w(""), [y, C] = w(null), [N, k] = w(""), i = async (l) => {
    l.preventDefault();
    try {
      const g = await c(f, v);
      g.mfaRequired ? (C(g.mfaToken), k(g.email)) : o?.();
    } catch {
    }
  }, e = () => {
    C(null), k(""), o?.();
  }, t = () => {
    C(null), k(""), a("");
  };
  return y ? /* @__PURE__ */ r(
    Ne,
    {
      mfaToken: y,
      email: N,
      onSuccess: e,
      onBack: t,
      className: n
    }
  ) : /* @__PURE__ */ b("form", { onSubmit: i, className: `cedros-form ${n}`, children: [
    /* @__PURE__ */ b("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ r("label", { htmlFor: "email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: "email",
          type: "email",
          className: "cedros-input",
          value: f,
          onChange: (l) => p(l.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: h
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      $,
      {
        value: v,
        onChange: (l) => a(l.target.value),
        placeholder: "Enter your password",
        required: !0,
        autoComplete: "current-password",
        disabled: h,
        labelAction: m ? /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-link cedros-link-muted cedros-link-sm",
            onClick: m,
            children: "Forgot your password?"
          }
        ) : void 0
      }
    ) }),
    /* @__PURE__ */ r(Y, { error: d, onDismiss: u }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: h || !f || !v,
        "aria-busy": h,
        children: h ? /* @__PURE__ */ b(S, { children: [
          /* @__PURE__ */ r(W, { size: "sm", announce: !0, label: "Signing in" }),
          /* @__PURE__ */ r("span", { children: "Signing in..." })
        ] }) : "Sign in"
      }
    ),
    s && /* @__PURE__ */ b("p", { className: "cedros-form-footer", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ r("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: s, children: "Sign up" })
    ] })
  ] });
}
class Ae {
  client;
  constructor(s, m, n, c) {
    this.client = new B({ baseUrl: s, timeoutMs: m, retryAttempts: n, getAccessToken: c });
  }
  /**
   * Get all system settings grouped by category
   * Requires system admin privileges
   */
  async getSettings() {
    try {
      return await this.client.get("/admin/settings");
    } catch (s) {
      throw I(s, "Failed to fetch system settings");
    }
  }
  /**
   * Update one or more system settings
   * Requires system admin privileges
   */
  async updateSettings(s) {
    try {
      return await this.client.patch("/admin/settings", {
        settings: s
      });
    } catch (m) {
      throw I(m, "Failed to update system settings");
    }
  }
}
const Re = ge(
  null
);
function Le() {
  return pe(Re);
}
const Te = () => null;
function Se() {
  const o = Le(), s = ve(), m = _(() => o ? {
    config: o.config,
    user: o.user,
    authState: o.authState,
    _internal: {
      getAccessToken: o.getAccessToken
    }
  } : s ? {
    config: s.config,
    user: s.user,
    authState: s.authState,
    _internal: {
      getAccessToken: s._internal?.getAccessToken ?? Te
    }
  } : null, [o, s]);
  if (m)
    return m;
  throw new Error(
    "Login admin hooks require cedrosLoginPlugin under AdminShell or CedrosLoginProvider"
  );
}
function Ie() {
  const { config: o, authState: s, _internal: m } = Se(), [n, c] = w({}), [h, d] = w(!1), [u, f] = w(!1), [p, v] = w(null), a = O(0), y = _(
    () => new Ae(
      o.serverUrl,
      o.requestTimeout,
      o.retryAttempts,
      m?.getAccessToken
    ),
    [o.serverUrl, o.requestTimeout, o.retryAttempts, m]
  ), C = O(y);
  C.current = y;
  const N = E(async () => {
    if (s !== "authenticated") {
      c({});
      return;
    }
    d(!0), v(null);
    const e = ++a.current;
    try {
      const t = await C.current.getSettings();
      if (e !== a.current) return;
      c(t.settings);
    } catch (t) {
      if (e !== a.current) return;
      v(t instanceof Error ? t : new Error("Failed to fetch settings"));
    } finally {
      e === a.current && d(!1);
    }
  }, [s]), k = E(
    async (e) => {
      if (s !== "authenticated")
        throw new Error("Not authenticated");
      f(!0), v(null);
      try {
        await C.current.updateSettings(e), await N();
      } catch (t) {
        const l = t instanceof Error ? t : new Error("Failed to update settings");
        throw v(l), l;
      } finally {
        f(!1);
      }
    },
    [s, N]
  ), i = E(
    (e) => {
      for (const t of Object.values(n)) {
        const l = t.find((g) => g.key === e);
        if (l) return l.value;
      }
    },
    [n]
  );
  return {
    settings: n,
    isLoading: h,
    isUpdating: u,
    error: p,
    fetchSettings: N,
    updateSettings: k,
    getValue: i
  };
}
const _e = {
  organizations: !1,
  sso: !1,
  mfa: !1,
  mfaRequired: !1,
  walletSigning: !1,
  credits: !1,
  userWithdrawals: !1,
  cedrosPay: !1,
  signupAccessCodeRequired: !1
};
function qe() {
  const { settings: o, isLoading: s, error: m, fetchSettings: n, getValue: c } = Ie(), [h, d] = w(!1);
  U(() => {
    h || (n(), d(!0));
  }, [n, h]);
  const u = E((a) => a === void 0 ? !1 : a === "true" || a === "1", []), f = _(() => Object.keys(o).length === 0 ? _e : {
    organizations: u(c("feature_organizations")),
    sso: u(c("feature_sso")),
    mfa: u(c("feature_mfa")),
    mfaRequired: u(c("security_require_mfa")),
    walletSigning: u(c("feature_wallet_signing")),
    credits: u(c("feature_credits")),
    userWithdrawals: u(c("feature_user_withdrawals")),
    cedrosPay: u(c("feature_cedros_pay")),
    signupAccessCodeRequired: u(c("signup_access_code_enabled"))
  }, [o, c, u]), p = E(async () => {
    await n();
  }, [n]), v = E(
    (a) => f[a],
    [f]
  );
  return {
    features: f,
    isLoading: s,
    error: m,
    refetch: p,
    isEnabled: v
  };
}
function Me({
  onSuccess: o,
  onSwitchToLogin: s,
  className: m = "",
  accessCode: n
}) {
  const { config: c } = z(), { register: h, isLoading: d, error: u, clearError: f } = X(), { features: p } = qe(), [v, a] = w(""), [y, C] = w(""), [N, k] = w(""), [i, e] = w(""), [t, l] = w(""), g = n ?? t, [A, ee] = w(null), [te, D] = w(null), T = c.forms?.termsOfService, P = c.forms?.emailOptIn, V = T?.show ?? !1, q = T?.required ?? !0, re = T?.defaultChecked ?? !1, j = T?.label ?? "I agree to the Terms of Service", se = T?.url, H = be(se), oe = P?.show ?? !1, ae = P?.defaultChecked ?? !1, ne = P?.label ?? "Send me updates and news", [x, ce] = w(re), [ie, le] = w(ae), M = N === i, de = A?.isValid ?? !1, ue = !V || !q || x, F = p?.signupAccessCodeRequired ?? !1, K = y && N && i && M && de && ue && (!F || g.trim()) && !d, me = async (R) => {
    if (R.preventDefault(), D(null), V && q && !x) {
      D({
        code: "VALIDATION_ERROR",
        message: "You must agree to the Terms of Service to continue"
      });
      return;
    }
    if (K)
      try {
        await h(
          y,
          N,
          v || void 0,
          void 0,
          F && g.trim() || void 0
        ), o?.();
      } catch {
      }
  }, fe = u || te, he = () => {
    f(), D(null);
  };
  return /* @__PURE__ */ b("form", { onSubmit: me, className: `cedros-form ${m}`, children: [
    /* @__PURE__ */ b("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ b("label", { htmlFor: "name", className: "cedros-label", children: [
        "Name ",
        /* @__PURE__ */ r("span", { className: "cedros-optional", children: "(optional)" })
      ] }),
      /* @__PURE__ */ r(
        "input",
        {
          id: "name",
          type: "text",
          className: "cedros-input",
          value: v,
          onChange: (R) => a(R.target.value),
          placeholder: "Your name",
          autoComplete: "name",
          disabled: d
        }
      )
    ] }),
    /* @__PURE__ */ b("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ r("label", { htmlFor: "register-email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: "register-email",
          type: "email",
          className: "cedros-input",
          value: y,
          onChange: (R) => C(R.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: d
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      $,
      {
        value: N,
        onChange: (R) => k(R.target.value),
        placeholder: "Create a password",
        required: !0,
        autoComplete: "new-password",
        disabled: d,
        showStrengthMeter: !0,
        onValidationChange: ee
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      $,
      {
        label: "Confirm Password",
        value: i,
        onChange: (R) => e(R.target.value),
        placeholder: "Confirm your password",
        required: !0,
        autoComplete: "new-password",
        disabled: d,
        "aria-invalid": i && !M ? "true" : void 0,
        error: i && !M ? "Passwords do not match" : void 0
      }
    ) }),
    F && n === void 0 && /* @__PURE__ */ b("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ r("label", { htmlFor: "register-access-code", className: "cedros-label", children: "Access Code" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: "register-access-code",
          type: "text",
          className: "cedros-input",
          value: t,
          onChange: (R) => l(R.target.value),
          placeholder: "Enter access code",
          required: !0,
          "aria-required": "true",
          disabled: d,
          autoComplete: "off"
        }
      )
    ] }),
    V && /* @__PURE__ */ r("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ b("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ r(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: x,
          onChange: (R) => ce(R.target.checked),
          disabled: d,
          "aria-required": q
        }
      ),
      /* @__PURE__ */ b("span", { className: "cedros-checkbox-text", children: [
        H ? /* @__PURE__ */ b(S, { children: [
          j.replace("Terms of Service", "").trim() || "I agree to the",
          " ",
          /* @__PURE__ */ r(
            "a",
            {
              href: H,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "cedros-link",
              children: "Terms of Service"
            }
          )
        ] }) : j,
        q && /* @__PURE__ */ r("span", { className: "cedros-required", children: "*" })
      ] })
    ] }) }),
    oe && /* @__PURE__ */ r("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ b("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ r(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: ie,
          onChange: (R) => le(R.target.checked),
          disabled: d
        }
      ),
      /* @__PURE__ */ r("span", { className: "cedros-checkbox-text", children: ne })
    ] }) }),
    /* @__PURE__ */ r(Y, { error: fe, onDismiss: he }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: !K,
        "aria-busy": d,
        children: d ? /* @__PURE__ */ b(S, { children: [
          /* @__PURE__ */ r(W, { size: "sm", announce: !0, label: "Creating account" }),
          /* @__PURE__ */ r("span", { children: "Creating account..." })
        ] }) : "Create account"
      }
    ),
    s && /* @__PURE__ */ b("p", { className: "cedros-form-footer", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ r("button", { type: "button", className: "cedros-link cedros-link-muted", onClick: s, children: "Sign in" })
    ] })
  ] });
}
export {
  Re as C,
  xe as E,
  Ee as O,
  $ as P,
  Ne as T,
  Me as a,
  Ie as b,
  Se as c,
  qe as d,
  Q as e,
  be as f,
  ke as g,
  Ve as s,
  X as u
};
