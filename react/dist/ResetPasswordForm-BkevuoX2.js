import { jsxs as E, jsx as r, Fragment as V } from "react/jsx-runtime";
import { useState as v, useMemo as K, useCallback as k, useId as ae, useRef as ie, useEffect as Y, Fragment as ce } from "react";
import { u as B, A as q, h as P } from "./useCedrosLogin-fUZvc4r9.js";
import { b as ee, E as le, a as de, P as X } from "./EmailRegisterForm-DuS9keFz.js";
import { b as te, v as ue } from "./validation-B8kMV3BL.js";
import { E as Q, L as $ } from "./ErrorMessage-59nRkszi.js";
import { G as pe } from "./GoogleLoginButton-93NKx5J_.js";
import { u as he } from "./useServerFeatures-BYUkbO1Y.js";
function se() {
  const { config: e } = B(), [t, c] = v(!1), [n, a] = v(!1), [i, l] = v(null), u = K(
    () => new q({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: m, getRemainingAttempts: p } = ee({
    maxAttempts: 3,
    windowMs: 3e5
  }), w = k(
    async (R) => {
      if (!te(R)) {
        const h = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw l(h), h;
      }
      try {
        m();
      } catch (h) {
        const s = {
          code: "RATE_LIMITED",
          message: h instanceof Error ? h.message : "Too many attempts"
        };
        throw l(s), s;
      }
      c(!0), l(null), a(!1);
      try {
        await u.post("/forgot-password", { email: R }), a(!0);
      } catch (h) {
        const s = P(h, "Unable to send the reset email. Please try again.");
        throw l(s), s;
      } finally {
        c(!1);
      }
    },
    [u, m]
  ), y = k(
    async (R, h) => {
      c(!0), l(null), a(!1);
      try {
        await u.post("/reset-password", { token: R, newPassword: h }), a(!0);
      } catch (s) {
        const o = P(s, "Unable to reset your password. Please try again.");
        throw l(o), o;
      } finally {
        c(!1);
      }
    },
    [u]
  ), A = k(() => l(null), []), L = k(() => {
    l(null), a(!1), c(!1);
  }, []);
  return {
    forgotPassword: w,
    resetPassword: y,
    isLoading: t,
    isSuccess: n,
    error: i,
    clearError: A,
    reset: L,
    remainingAttempts: p()
  };
}
function ge(e) {
  return typeof e == "object" && e !== null && "mfaRequired" in e && e.mfaRequired === !0;
}
function me() {
  const { config: e, _internal: t } = B(), [c, n] = v(!1), [a, i] = v(!1), [l, u] = v(null), m = K(
    () => new q({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: p, getRemainingAttempts: w } = ee({
    maxAttempts: 3,
    windowMs: 3e5
  }), y = k(
    async (h) => {
      if (!te(h)) {
        const s = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw u(s), s;
      }
      try {
        p();
      } catch (s) {
        const o = {
          code: "RATE_LIMITED",
          message: s instanceof Error ? s.message : "Too many attempts"
        };
        throw u(o), o;
      }
      n(!0), u(null), i(!1);
      try {
        await m.post("/instant-link", {
          email: h,
          referral: t?.getReferralCode?.() ?? void 0
        }), i(!0);
      } catch (s) {
        const o = P(s, "Unable to send the sign-in link. Please try again.");
        throw u(o), o;
      } finally {
        n(!1);
      }
    },
    [m, p, t]
  ), A = k(
    async (h) => {
      if (!h || h.trim().length === 0) {
        const s = {
          code: "VALIDATION_ERROR",
          message: "Invalid or missing sign-in link token"
        };
        throw u(s), s;
      }
      n(!0), u(null), i(!1);
      try {
        const s = await m.post(
          "/instant-link/verify",
          {
            token: h
          }
        );
        return ge(s) || (e.callbacks?.onLoginSuccess?.(s.user, "email"), t?.handleLoginSuccess(s.user, s.tokens)), s;
      } catch (s) {
        const o = P(s, "Unable to verify the sign-in link. Please try again.");
        throw u(o), o;
      } finally {
        n(!1);
      }
    },
    [m, e.callbacks, t]
  ), L = k(() => u(null), []), R = k(() => {
    u(null), i(!1), n(!1);
  }, []);
  return {
    sendInstantLink: y,
    verifyInstantLink: A,
    isLoading: c,
    isSuccess: a,
    error: l,
    clearError: L,
    reset: R,
    remainingAttempts: w()
  };
}
const fe = {
  reset: {
    subtitle: "Enter your email address and we'll send you a link to reset your password.",
    button: "Send reset link",
    successMessage: (e) => /* @__PURE__ */ E(V, { children: [
      "If an account exists for ",
      /* @__PURE__ */ r("strong", { children: e }),
      ", you will receive a password reset link shortly."
    ] })
  },
  instantLink: {
    subtitle: "Enter your email and we'll send you a sign-in link. You can change your password in your account settings once signed in.",
    button: "Send sign-in link",
    successMessage: (e) => /* @__PURE__ */ E(V, { children: [
      "We sent a sign-in link to ",
      /* @__PURE__ */ r("strong", { children: e }),
      ". Click the link to sign in."
    ] })
  }
};
function ye({
  mode: e = "reset",
  onSuccess: t,
  onCancel: c,
  className: n = ""
}) {
  const [a, i] = v(""), l = se(), u = me(), m = ae(), p = e === "instantLink" ? { submit: u.sendInstantLink, isLoading: u.isLoading, isSuccess: u.isSuccess, error: u.error, clearError: u.clearError } : { submit: l.forgotPassword, isLoading: l.isLoading, isSuccess: l.isSuccess, error: l.error, clearError: l.clearError }, w = fe[e], y = async (A) => {
    A.preventDefault();
    try {
      await p.submit(a), t?.();
    } catch {
    }
  };
  return p.isSuccess ? /* @__PURE__ */ E("div", { className: `cedros-forgot-password-success ${n}`, children: [
    /* @__PURE__ */ E(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ r("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ r(
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
    /* @__PURE__ */ r("h3", { className: "cedros-success-title", children: "Check your email" }),
    /* @__PURE__ */ r("p", { className: "cedros-success-message", children: w.successMessage(a) }),
    c && /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-outline",
        onClick: c,
        children: "Back to login"
      }
    )
  ] }) : /* @__PURE__ */ E("form", { className: `cedros-forgot-password-form ${n}`, onSubmit: y, children: [
    /* @__PURE__ */ E("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-form-title", children: "Forgot password?" }),
      /* @__PURE__ */ r("p", { className: "cedros-form-subtitle", children: w.subtitle })
    ] }),
    /* @__PURE__ */ r(Q, { error: p.error, onDismiss: p.clearError }),
    /* @__PURE__ */ E("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ r("label", { htmlFor: m, className: "cedros-label", children: "Email address" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: m,
          type: "email",
          className: "cedros-input",
          value: a,
          onChange: (A) => i(A.target.value),
          placeholder: "you@example.com",
          required: !0,
          autoComplete: "email",
          disabled: p.isLoading
        }
      )
    ] }),
    /* @__PURE__ */ E("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: p.isLoading || !a,
          children: p.isLoading ? /* @__PURE__ */ E(V, { children: [
            /* @__PURE__ */ r($, { size: "sm" }),
            "Sending..."
          ] }) : w.button
        }
      ),
      c && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: c,
          disabled: p.isLoading,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
const we = {
  loading: !1,
  loaded: !1,
  error: null,
  callbacks: [],
  load() {
    return typeof window > "u" || typeof document > "u" ? Promise.reject(new Error("Apple Sign-In script loader cannot run in SSR")) : this.loaded ? Promise.resolve() : this.loading ? new Promise((e, t) => {
      this.callbacks.push({ resolve: e, reject: t });
    }) : (this.loading = !0, new Promise((e, t) => {
      this.callbacks.push({ resolve: e, reject: t });
      const c = document.getElementById("apple-signin-script");
      if (c) {
        window.AppleID ? (this.loaded = !0, this.loading = !1, this.callbacks.forEach((a) => a.resolve()), this.callbacks = []) : c.addEventListener("load", () => {
          this.loaded = !0, this.loading = !1, this.callbacks.forEach((a) => a.resolve()), this.callbacks = [];
        });
        return;
      }
      const n = document.createElement("script");
      n.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js", n.async = !0, n.defer = !0, n.id = "apple-signin-script", n.onload = () => {
        this.loaded = !0, this.loading = !1, this.callbacks.forEach((a) => a.resolve()), this.callbacks = [];
      }, n.onerror = () => {
        this.loading = !1, n.remove();
        const a = new Error("Failed to load Apple Sign In script");
        this.callbacks.forEach((i) => i.reject(a)), this.callbacks = [];
      }, document.head.appendChild(n);
    }));
  },
  /**
   * Reset singleton state for test isolation
   * @internal - Only use in test setup/teardown
   */
  _reset() {
    this.loading = !1, this.loaded = !1, this.error = null, this.callbacks = [];
  }
};
function be() {
  const { config: e, _internal: t } = B(), [c, n] = v(!1), [a, i] = v(!1), [l, u] = v(null), [m, p] = v(null), w = ie(e), y = K(
    () => new q({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  );
  Y(() => {
    w.current = e;
  }, [e]), Y(() => {
    if (!e.appleClientId)
      return;
    let h = !0;
    const s = () => {
      if (h)
        try {
          window.AppleID?.auth?.init({
            clientId: e.appleClientId,
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: !0
          }), h && i(!0);
        } catch {
          h && u({
            code: "SERVER_ERROR",
            message: "Unable to initialize Apple sign-in. Please refresh and try again."
          });
        }
    };
    return we.load().then(() => {
      h && s();
    }).catch(() => {
      h && u({
        code: "SERVER_ERROR",
        message: "Unable to load Apple sign-in. Please refresh and try again."
      });
    }), () => {
      h = !1;
    };
  }, [e.appleClientId]);
  const A = k(async (h) => {
    if (!e.appleClientId) {
      const o = {
        code: "VALIDATION_ERROR",
        message: "Apple Client ID not configured"
      };
      throw u(o), o;
    }
    if (!a) {
      const o = {
        code: "VALIDATION_ERROR",
        message: "Apple sign-in is not ready yet. Please wait a moment and try again."
      };
      throw u(o), o;
    }
    n(!0), u(null);
    let s;
    try {
      const o = crypto.getRandomValues(new Uint8Array(32)), d = Array.from(o, (M) => M.toString(16).padStart(2, "0")).join(""), g = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(d)
      ), f = Array.from(
        new Uint8Array(g),
        (M) => M.toString(16).padStart(2, "0")
      ).join("");
      window.AppleID.auth.init({
        clientId: e.appleClientId,
        scope: "name email",
        redirectURI: window.location.origin,
        usePopup: !0,
        nonce: f
      });
      const b = await window.AppleID.auth.signIn();
      if (s = b.authorization?.id_token, !s)
        throw new Error("No ID token received from Apple");
      const T = b.user?.name ? `${b.user.name.firstName || ""} ${b.user.name.lastName || ""}`.trim() : void 0, S = await y.post("/apple", {
        idToken: s,
        name: T || void 0,
        nonce: d,
        referral: t?.getReferralCode?.() ?? void 0,
        access_code: h || void 0
      });
      return w.current.callbacks?.onLoginSuccess?.(S.user, "apple"), t?.handleLoginSuccess(S.user, S.tokens), n(!1), S;
    } catch (o) {
      if (o.error === "popup_closed_by_user") {
        const f = {
          code: "SERVER_ERROR",
          message: "Apple sign-in was cancelled."
        };
        throw u(f), n(!1), f;
      }
      const g = P(o, "Unable to sign in with Apple. Please try again.");
      throw g.code === "ACCOUNT_LINK_REQUIRED" && s && p(s), u(g), n(!1), g;
    }
  }, [e.appleClientId, a, y, t]), L = k(() => u(null), []), R = k(() => p(null), []);
  return {
    signIn: A,
    isLoading: c,
    isInitialized: a,
    error: l,
    clearError: L,
    pendingLinkIdToken: m,
    clearPendingLink: R
  };
}
function re() {
  if (typeof window > "u" || typeof navigator > "u")
    return !1;
  const e = navigator.userAgent.toLowerCase(), t = (navigator.platform || "").toLowerCase();
  return !!(/iphone|ipad|ipod/.test(e) || t.includes("mac") || /macintosh/.test(e) || t === "macintel" && navigator.maxTouchPoints > 1);
}
function ve({
  onSuccess: e,
  onError: t,
  className: c = "",
  variant: n = "default",
  size: a = "md",
  disabled: i = !1,
  hideOnNonApple: l = !0,
  accessCode: u
}) {
  const { signIn: m, isLoading: p, isInitialized: w } = be(), [y] = v(() => re());
  if (l && !y)
    return null;
  const A = async () => {
    try {
      await m(u), e?.();
    } catch (h) {
      const s = h instanceof Error ? h : new Error(String(h));
      t?.(s);
    }
  }, L = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ E(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[n]} ${L[a]} ${c}`,
      onClick: A,
      disabled: i || !w || p,
      "aria-label": "Sign in with Apple",
      children: [
        p ? /* @__PURE__ */ r($, { size: "sm" }) : /* @__PURE__ */ r(
          "svg",
          {
            className: "cedros-button-icon",
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true",
            children: /* @__PURE__ */ r("path", { d: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" })
          }
        ),
        /* @__PURE__ */ r("span", { children: "Continue with Apple" })
      ]
    }
  );
}
function I(e, t) {
  if (!e) throw new Error(t);
}
function Ee(e) {
  return e.replace(/-/g, "+").replace(/_/g, "/");
}
function F(e) {
  I(typeof e == "string" && e.length > 0, "Expected base64url string");
  const t = Ee(e), c = t + "=".repeat((4 - t.length % 4) % 4), n = atob(c), a = new Uint8Array(n.length);
  for (let i = 0; i < n.length; i++) a[i] = n.charCodeAt(i);
  return a.buffer;
}
function O(e) {
  const t = new Uint8Array(e);
  let c = "";
  for (let a = 0; a < t.length; a++) c += String.fromCharCode(t[a]);
  return btoa(c).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function ne(e) {
  I(typeof e == "object" && e !== null, "Invalid credential descriptor");
  const t = e;
  return I(typeof t.type == "string", "Invalid credential descriptor type"), I(typeof t.id == "string", "Invalid credential descriptor id"), {
    type: t.type,
    id: F(t.id),
    transports: Array.isArray(t.transports) ? t.transports : void 0
  };
}
function J(e) {
  I(e && typeof e == "object", "Missing creation options");
  const t = e.publicKey;
  I(t && typeof t == "object", "Missing creation options.publicKey"), I(typeof t.challenge == "string", "Missing creation challenge"), I(typeof t.rp == "object" && t.rp !== null, "Missing rp"), I(typeof t.user == "object" && t.user !== null, "Missing user");
  const c = t.rp, n = t.user;
  I(typeof c.name == "string", "Missing rp.name"), I(typeof n.id == "string", "Missing user.id"), I(typeof n.name == "string", "Missing user.name"), I(typeof n.displayName == "string", "Missing user.displayName");
  const a = Array.isArray(t.excludeCredentials) ? t.excludeCredentials.map(ne) : void 0, i = Array.isArray(t.pubKeyCredParams) ? t.pubKeyCredParams.map((u) => ({
    type: u.type,
    alg: u.alg
  })) : [], l = {
    challenge: F(t.challenge),
    rp: {
      name: c.name,
      id: typeof c.id == "string" ? c.id : void 0
    },
    user: {
      id: F(n.id),
      name: n.name,
      displayName: n.displayName
    },
    pubKeyCredParams: i,
    timeout: typeof t.timeout == "number" ? t.timeout : void 0,
    attestation: typeof t.attestation == "string" ? t.attestation : void 0,
    authenticatorSelection: typeof t.authenticatorSelection == "object" && t.authenticatorSelection !== null ? t.authenticatorSelection : void 0,
    excludeCredentials: a,
    extensions: typeof t.extensions == "object" && t.extensions !== null ? t.extensions : void 0
  };
  return l.hints = ["client-device"], l;
}
function Z(e) {
  I(e && typeof e == "object", "Missing request options");
  const t = e.publicKey;
  I(t && typeof t == "object", "Missing request options.publicKey"), I(typeof t.challenge == "string", "Missing request challenge");
  const c = Array.isArray(t.allowCredentials) ? t.allowCredentials.map(ne) : void 0, n = {
    challenge: F(t.challenge),
    rpId: typeof t.rpId == "string" ? t.rpId : void 0,
    timeout: typeof t.timeout == "number" ? t.timeout : void 0,
    userVerification: typeof t.userVerification == "string" ? t.userVerification : void 0,
    allowCredentials: c,
    extensions: typeof t.extensions == "object" && t.extensions !== null ? t.extensions : void 0
  };
  return n.hints = ["client-device"], n;
}
function _(e) {
  const t = O(e.rawId), c = e.response, a = { ...{
    clientDataJSON: O(c.clientDataJSON)
  } };
  if ("attestationObject" in c) {
    const i = c;
    if (a.attestationObject = O(i.attestationObject), typeof i.getTransports == "function")
      try {
        a.transports = i.getTransports();
      } catch {
      }
  }
  if ("authenticatorData" in c) {
    const i = c;
    a.authenticatorData = O(i.authenticatorData), a.signature = O(i.signature), i.userHandle && (a.userHandle = O(i.userHandle));
  }
  return {
    id: e.id,
    rawId: t,
    type: e.type,
    authenticatorAttachment: e.authenticatorAttachment ?? void 0,
    clientExtensionResults: e.getClientExtensionResults?.() ?? {},
    response: a
  };
}
function ke() {
  if (typeof window < "u") {
    const e = window.location?.hostname, t = e === "localhost" || e === "127.0.0.1" || e?.endsWith(".localhost");
    if (!(window.isSecureContext === !0) && !t)
      return !1;
  }
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator < "u" && typeof navigator.credentials < "u";
}
function Ae(e) {
  return typeof e == "object" && e !== null && "code" in e && "message" in e && typeof e.code == "string" && typeof e.message == "string";
}
function x(e) {
  if (!(e instanceof Error)) return null;
  const t = e.name;
  return t === "NotAllowedError" ? { code: "SERVER_ERROR", message: "Passkey operation was cancelled or timed out" } : t === "InvalidStateError" ? { code: "VALIDATION_ERROR", message: "Passkey is not available for this operation" } : t === "SecurityError" ? {
    code: "VALIDATION_ERROR",
    message: "Passkeys require HTTPS and a correctly configured relying party (WEBAUTHN_RP_ID / WEBAUTHN_RP_ORIGIN)"
  } : null;
}
function Ie() {
  const { config: e, _internal: t } = B(), [c, n] = v(!1), [a, i] = v(null), l = K(
    () => new q({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      // Needed for authenticated registration endpoints when cookie auth is disabled
      getAccessToken: t?.getAccessToken
    }),
    [t?.getAccessToken, e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), u = k(() => i(null), []), m = ke(), p = k(
    async (s) => {
      if (!m) {
        const o = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw i(o), o;
      }
      n(!0), i(null);
      try {
        const o = await l.post(
          "/webauthn/auth/options",
          { email: s?.email }
        ), d = Z(o.options), g = await navigator.credentials.get({
          publicKey: d
        });
        if (!g)
          throw new Error("Passkey authentication returned no credential");
        const f = await l.post("/webauthn/auth/verify", {
          challengeId: o.challengeId,
          credential: _(g)
        });
        return e.callbacks?.onLoginSuccess?.(f.user, "webauthn"), t?.handleLoginSuccess(f.user, f.tokens), f;
      } catch (o) {
        const g = x(o) ?? P(o, "Unable to sign in with passkey. Please try again.");
        throw i(g), g;
      } finally {
        n(!1);
      }
    },
    [l, e.callbacks, t, m]
  ), w = k(
    async (s) => {
      if (!m) {
        const o = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw i(o), o;
      }
      n(!0), i(null);
      try {
        const o = await l.post(
          "/webauthn/register/options",
          {}
        ), d = J(o.options), g = await navigator.credentials.create({
          publicKey: d
        });
        if (!g)
          throw new Error("Passkey registration returned no credential");
        const f = await l.post("/webauthn/register/verify", {
          challengeId: o.challengeId,
          credential: _(g),
          label: s?.label
        });
        if (!f.success)
          throw new Error("Passkey registration failed");
        return { credentialId: f.credentialId, label: f.label };
      } catch (o) {
        const g = x(o) ?? P(o, "Unable to register passkey. Please try again.");
        throw i(g), g;
      } finally {
        n(!1);
      }
    },
    [l, m]
  ), y = k(
    async (s) => {
      if (!m) {
        const o = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw i(o), o;
      }
      n(!0), i(null);
      try {
        const o = await l.post(
          "/webauthn/signup/options",
          {}
        ), d = J(o.options), g = await navigator.credentials.create({
          publicKey: d
        });
        if (!g)
          throw new Error("Passkey signup returned no credential");
        const f = await l.post("/webauthn/signup/verify", {
          challengeId: o.challengeId,
          credential: _(g),
          email: s?.email,
          name: s?.name,
          label: s?.label,
          referral: t?.getReferralCode?.() ?? void 0,
          access_code: s?.accessCode || void 0
        });
        return e.callbacks?.onLoginSuccess?.(f.user, "webauthn"), t?.handleLoginSuccess(f.user, f.tokens), f;
      } catch (o) {
        const g = x(o) ?? P(o, "Unable to sign up with passkey. Please try again.");
        throw i(g), g;
      } finally {
        n(!1);
      }
    },
    [l, e.callbacks, t, m]
  ), A = k(async (s) => {
    if (!m) {
      const g = {
        code: "VALIDATION_ERROR",
        message: "Passkeys are not supported in this browser"
      };
      throw i(g), g;
    }
    n(!0), i(null);
    const o = typeof localStorage < "u" && localStorage.getItem("cedros-passkey-registered") === "1", d = () => {
      try {
        localStorage.setItem("cedros-passkey-registered", "1");
      } catch {
      }
    };
    return o ? L(d, s) : R(d, s);
  }, [l, e.callbacks, t, m]), L = k(
    async (s, o) => {
      try {
        const d = await l.post(
          "/webauthn/auth/options",
          {}
        ), g = Z(d.options), f = await navigator.credentials.get({
          publicKey: g
        });
        if (!f)
          throw new Error("Passkey authentication returned no credential");
        const b = await l.post("/webauthn/auth/verify", {
          challengeId: d.challengeId,
          credential: _(f)
        });
        return e.callbacks?.onLoginSuccess?.(b.user, "webauthn"), t?.handleLoginSuccess(b.user, b.tokens), s(), b;
      } catch (d) {
        if (d instanceof Error && (d.name === "NotAllowedError" || d.name === "InvalidStateError"))
          return h(s, o);
        if (typeof d == "object" && d !== null && "isApiError" in d && d.data?.code === "INVALID_CREDENTIALS") {
          const S = {
            code: "INVALID_CREDENTIALS",
            message: "This passkey is not recognized. Please remove old passkeys for this site and try again, or sign in another way."
          };
          throw i(S), S;
        }
        const T = x(d) ?? P(d, "Unable to sign in with passkey. Please try again.");
        throw i(T), T;
      } finally {
        n(!1);
      }
    },
    [l, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), R = k(
    async (s, o) => {
      try {
        return await h(s, o);
      } catch (d) {
        if (d instanceof Error && (d.name === "InvalidStateError" || d.name === "NotAllowedError"))
          return L(s, o);
        if (!Ae(d)) {
          const b = x(d) ?? P(d, "Unable to create passkey. Please try again.");
          throw i(b), b;
        }
        throw d;
      } finally {
        n(!1);
      }
    },
    [l, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), h = k(
    async (s, o) => {
      const d = await l.post(
        "/webauthn/signup/options",
        {}
      ), g = J(d.options), f = await navigator.credentials.create({
        publicKey: g
      });
      if (!f)
        throw new Error("Passkey signup returned no credential");
      const b = await l.post("/webauthn/signup/verify", {
        challengeId: d.challengeId,
        credential: _(f),
        referral: t?.getReferralCode?.() ?? void 0,
        access_code: o || void 0
      });
      return e.callbacks?.onLoginSuccess?.(b.user, "webauthn"), t?.handleLoginSuccess(b.user, b.tokens), s(), b;
    },
    [l, e.callbacks, t]
  );
  return {
    isSupported: m,
    isLoading: c,
    error: a,
    clearError: u,
    continueWithPasskey: A,
    authenticatePasskey: p,
    registerPasskey: w,
    signupWithPasskey: y
  };
}
function Re({
  onSuccess: e,
  onError: t,
  className: c = "",
  children: n,
  disabled: a,
  accessCode: i
}) {
  const { continueWithPasskey: l, isLoading: u, isSupported: m } = Ie(), p = a || !m || u;
  return /* @__PURE__ */ E(
    "button",
    {
      type: "button",
      className: `cedros-button cedros-button-social ${c}`,
      onClick: async () => {
        try {
          await l(i), e?.();
        } catch (y) {
          t?.(y instanceof Error ? y : new Error(String(y)));
        }
      },
      disabled: p,
      "aria-disabled": p,
      children: [
        u ? /* @__PURE__ */ r($, { size: "sm" }) : /* @__PURE__ */ r("span", { className: "cedros-social-icon", "aria-hidden": "true", children: /* @__PURE__ */ r(Le, {}) }),
        /* @__PURE__ */ r("span", { children: n ?? "Continue with Passkey" })
      ]
    }
  );
}
function Le() {
  return /* @__PURE__ */ E(
    "svg",
    {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ r("path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" }),
        /* @__PURE__ */ r("path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88" }),
        /* @__PURE__ */ r("path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02" }),
        /* @__PURE__ */ r("path", { d: "M2 12a10 10 0 0 1 18-6" }),
        /* @__PURE__ */ r("path", { d: "M2 16h.01" }),
        /* @__PURE__ */ r("path", { d: "M21.8 16c.2-2 .131-5.354 0-6" }),
        /* @__PURE__ */ r("path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" }),
        /* @__PURE__ */ r("path", { d: "M8.65 22c.21-.66.45-1.32.57-2" }),
        /* @__PURE__ */ r("path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2" })
      ]
    }
  );
}
const j = ["login", "register"];
function _e({
  onSuccess: e,
  className: t = "",
  defaultTab: c = "login",
  getHasWallets: n,
  renderSolanaButton: a
}) {
  const { config: i, socialButtonOrder: l, isFeatureEnabled: u } = B(), { features: m } = he(), [p, w] = v(c), [y, A] = v("form"), [L, R] = v(() => n ? n() : !1), [h] = v(() => re()), [s, o] = v(""), [d, g] = v(null), f = m?.signupAccessCodeRequired ?? !1, b = k((C) => {
    g(C.message);
  }, []);
  Y(() => {
    if (!n)
      return;
    const C = () => R(n());
    return C(), window.addEventListener("load", C), window.addEventListener("focus", C), () => {
      window.removeEventListener("load", C), window.removeEventListener("focus", C);
    };
  }, [n]);
  const T = i.forms?.forgotPassword?.mode ?? (u("instantLink") ? "instantLink" : "reset"), S = k(
    (C) => {
      const D = j.indexOf(p);
      let N = D;
      switch (C.key) {
        case "ArrowLeft":
        case "ArrowUp":
          N = D === 0 ? j.length - 1 : D - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          N = D === j.length - 1 ? 0 : D + 1;
          break;
        case "Home":
          N = 0;
          break;
        case "End":
          N = j.length - 1;
          break;
        default:
          return;
      }
      C.preventDefault();
      const U = j[N];
      w(U), document.getElementById(`cedros-tab-${U}`)?.focus();
    },
    [p]
  ), M = u("email"), W = u("google") && i.googleClientId, z = u("apple") && i.appleClientId && h, H = !!a && u("solana") && L, G = u("webauthn"), oe = M && (W || z || H || G);
  return y === "forgotPassword" ? /* @__PURE__ */ r("div", { className: `cedros-login-form ${t}`, children: /* @__PURE__ */ r(ye, { mode: T, onCancel: () => A("form") }) }) : /* @__PURE__ */ E("div", { className: `cedros-login-form ${t}`, children: [
    f && /* @__PURE__ */ E("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ r("label", { htmlFor: "login-form-access-code", className: "cedros-label", children: "Access Code" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: "login-form-access-code",
          type: "text",
          className: "cedros-input",
          value: s,
          onChange: (C) => o(C.target.value),
          placeholder: "Enter access code",
          "aria-required": "true",
          autoComplete: "off"
        }
      )
    ] }),
    d && /* @__PURE__ */ r(
      Q,
      {
        error: d,
        onDismiss: () => g(null)
      }
    ),
    (G || W || z || H) && (() => {
      const C = {
        webauthn: G ? /* @__PURE__ */ r(Re, { onSuccess: e, onError: b, accessCode: s || void 0 }) : null,
        google: W ? /* @__PURE__ */ r(pe, { onSuccess: e, onError: b, accessCode: s || void 0 }) : null,
        apple: z ? /* @__PURE__ */ r(ve, { onSuccess: e, onError: b, accessCode: s || void 0 }) : null,
        solana: H ? a?.({
          onSuccess: e,
          onError: b,
          accessCode: s || void 0
        }) : null
      };
      return /* @__PURE__ */ r("div", { className: "cedros-social-buttons", children: (l ?? ["webauthn", "google", "apple", "solana"]).map((N) => {
        const U = C[N];
        return U ? /* @__PURE__ */ r(ce, { children: U }, N) : null;
      }) });
    })(),
    oe && /* @__PURE__ */ r("div", { className: "cedros-divider", children: /* @__PURE__ */ r("span", { children: "Or continue with" }) }),
    M && /* @__PURE__ */ E(V, { children: [
      /* @__PURE__ */ E("div", { className: "cedros-tabs", role: "tablist", "aria-label": "Authentication method", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-login",
            className: `cedros-tab ${p === "login" ? "cedros-tab-active" : ""}`,
            onClick: () => w("login"),
            onKeyDown: S,
            "aria-selected": p === "login",
            "aria-controls": "cedros-tabpanel-login",
            tabIndex: p === "login" ? 0 : -1,
            children: "Sign in"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-register",
            className: `cedros-tab ${p === "register" ? "cedros-tab-active" : ""}`,
            onClick: () => w("register"),
            onKeyDown: S,
            "aria-selected": p === "register",
            "aria-controls": "cedros-tabpanel-register",
            tabIndex: p === "register" ? 0 : -1,
            children: "Sign up"
          }
        )
      ] }),
      /* @__PURE__ */ r(
        "div",
        {
          role: "tabpanel",
          id: `cedros-tabpanel-${p}`,
          "aria-labelledby": `cedros-tab-${p}`,
          children: p === "login" ? /* @__PURE__ */ r(
            le,
            {
              onSuccess: e,
              onSwitchToRegister: () => w("register"),
              onForgotPassword: () => A("forgotPassword")
            }
          ) : /* @__PURE__ */ r(
            de,
            {
              onSuccess: e,
              onSwitchToLogin: () => w("login"),
              accessCode: f ? s : void 0
            }
          )
        }
      )
    ] })
  ] });
}
function xe({
  token: e,
  onSuccess: t,
  onLoginClick: c,
  className: n = ""
}) {
  const [a, i] = v(""), [l, u] = v(""), [m, p] = v(null), { resetPassword: w, isLoading: y, isSuccess: A, error: L, clearError: R } = se(), h = a === l, s = m?.isValid && h && a.length > 0, o = async (d) => {
    if (d.preventDefault(), !!s)
      try {
        await w(e, a), t?.();
      } catch {
      }
  };
  return A ? /* @__PURE__ */ E("div", { className: `cedros-reset-password-success ${n}`, children: [
    /* @__PURE__ */ E(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ r("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ r(
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
    /* @__PURE__ */ r("h3", { className: "cedros-success-title", children: "Password reset successful" }),
    /* @__PURE__ */ r("p", { className: "cedros-success-message", children: "Your password has been reset. You can now log in with your new password." }),
    c && /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-primary",
        onClick: c,
        children: "Go to login"
      }
    )
  ] }) : /* @__PURE__ */ E("form", { className: `cedros-reset-password-form ${n}`, onSubmit: o, children: [
    /* @__PURE__ */ E("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-form-title", children: "Reset your password" }),
      /* @__PURE__ */ r("p", { className: "cedros-form-subtitle", children: "Enter your new password below." })
    ] }),
    /* @__PURE__ */ r(Q, { error: L, onDismiss: R }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      X,
      {
        label: "New password",
        value: a,
        onChange: (d) => {
          i(d.target.value), p(ue(d.target.value));
        },
        showStrengthMeter: !0,
        onValidationChange: p,
        disabled: y,
        autoComplete: "new-password",
        error: m && !m.isValid ? Object.values(m.errors).find(Boolean) : void 0
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      X,
      {
        label: "Confirm password",
        value: l,
        onChange: (d) => u(d.target.value),
        disabled: y,
        autoComplete: "new-password",
        error: l && !h ? "Passwords do not match" : void 0
      }
    ) }),
    /* @__PURE__ */ E("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: y || !s,
          children: y ? /* @__PURE__ */ E(V, { children: [
            /* @__PURE__ */ r($, { size: "sm" }),
            "Resetting..."
          ] }) : "Reset password"
        }
      ),
      c && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: c,
          disabled: y,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
export {
  ve as A,
  ye as F,
  _e as L,
  Re as P,
  xe as R,
  Ie as a,
  be as b,
  me as c,
  se as u
};
