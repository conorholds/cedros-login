import { jsxs as y, jsx as s, Fragment as Y } from "react/jsx-runtime";
import { useState as v, useMemo as q, useCallback as k, useId as ce, useRef as U, useEffect as F, Fragment as le } from "react";
import { b as j, A as V, h as L, E as ee, L as J } from "./ErrorMessage-DObd7075.js";
import { e as ne, d as de, E as ue, a as pe, c as he } from "./EmailRegisterForm-DrtZJXIS.js";
import { b as ae } from "./validation-B8kMV3BL.js";
import { G as me } from "./GoogleLoginButton-COhxqq-a.js";
function ge() {
  const { config: e } = j(), [t, n] = v(!1), [a, i] = v(!1), [c, l] = v(null), d = q(
    () => new V({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: p, getRemainingAttempts: m } = ne({
    maxAttempts: 3,
    windowMs: 3e5
  }), f = k(
    async (w) => {
      if (!ae(w)) {
        const h = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw l(h), h;
      }
      try {
        p();
      } catch (h) {
        const r = {
          code: "RATE_LIMITED",
          message: h instanceof Error ? h.message : "Too many attempts"
        };
        throw l(r), r;
      }
      n(!0), l(null), i(!1);
      try {
        await d.post("/forgot-password", { email: w }), i(!0);
      } catch (h) {
        const r = L(h, "Unable to send the reset email. Please try again.");
        throw l(r), r;
      } finally {
        n(!1);
      }
    },
    [d, p]
  ), _ = k(
    async (w, h) => {
      n(!0), l(null), i(!1);
      try {
        await d.post("/reset-password", { token: w, newPassword: h }), i(!0);
      } catch (r) {
        const o = L(r, "Unable to reset your password. Please try again.");
        throw l(o), o;
      } finally {
        n(!1);
      }
    },
    [d]
  ), I = k(() => l(null), []), R = k(() => {
    l(null), i(!1), n(!1);
  }, []);
  return {
    forgotPassword: f,
    resetPassword: _,
    isLoading: t,
    isSuccess: a,
    error: c,
    clearError: I,
    reset: R,
    remainingAttempts: m()
  };
}
function fe(e) {
  return typeof e == "object" && e !== null && "mfaRequired" in e && e.mfaRequired === !0;
}
function ye() {
  const { config: e, _internal: t } = j(), [n, a] = v(!1), [i, c] = v(!1), [l, d] = v(null), p = q(
    () => new V({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: m, getRemainingAttempts: f } = ne({
    maxAttempts: 3,
    windowMs: 3e5
  }), _ = k(
    async (h) => {
      if (!ae(h)) {
        const r = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw d(r), r;
      }
      try {
        m();
      } catch (r) {
        const o = {
          code: "RATE_LIMITED",
          message: r instanceof Error ? r.message : "Too many attempts"
        };
        throw d(o), o;
      }
      a(!0), d(null), c(!1);
      try {
        await p.post("/instant-link", {
          email: h,
          referral: t?.getReferralCode?.() ?? void 0
        }), c(!0);
      } catch (r) {
        const o = L(r, "Unable to send the sign-in link. Please try again.");
        throw d(o), o;
      } finally {
        a(!1);
      }
    },
    [p, m, t]
  ), I = k(
    async (h) => {
      if (!h || h.trim().length === 0) {
        const r = {
          code: "VALIDATION_ERROR",
          message: "Invalid or missing sign-in link token"
        };
        throw d(r), r;
      }
      a(!0), d(null), c(!1);
      try {
        const r = await p.post(
          "/instant-link/verify",
          {
            token: h
          }
        );
        return fe(r) || (e.callbacks?.onLoginSuccess?.(r.user, "email"), t?.handleLoginSuccess(r.user, r.tokens)), r;
      } catch (r) {
        const o = L(r, "Unable to verify the sign-in link. Please try again.");
        throw d(o), o;
      } finally {
        a(!1);
      }
    },
    [p, e.callbacks, t]
  ), R = k(() => d(null), []), w = k(() => {
    d(null), c(!1), a(!1);
  }, []);
  return {
    sendInstantLink: _,
    verifyInstantLink: I,
    isLoading: n,
    isSuccess: i,
    error: l,
    clearError: R,
    reset: w,
    remainingAttempts: f()
  };
}
const we = {
  reset: {
    subtitle: "Enter your email address and we'll send you a link to reset your password.",
    button: "Send reset link",
    successMessage: (e) => /* @__PURE__ */ y(Y, { children: [
      "If an account exists for ",
      /* @__PURE__ */ s("strong", { children: e }),
      ", you will receive a password reset link shortly."
    ] })
  },
  instantLink: {
    subtitle: "Enter your email and we'll send you a sign-in link. You can change your password in your account settings once signed in.",
    button: "Send sign-in link",
    successMessage: (e) => /* @__PURE__ */ y(Y, { children: [
      "We sent a sign-in link to ",
      /* @__PURE__ */ s("strong", { children: e }),
      ". Click the link to sign in."
    ] })
  }
};
function be({
  mode: e = "reset",
  onSuccess: t,
  onCancel: n,
  className: a = ""
}) {
  const [i, c] = v(""), l = ge(), d = ye(), p = ce(), m = e === "instantLink" ? { submit: d.sendInstantLink, isLoading: d.isLoading, isSuccess: d.isSuccess, error: d.error, clearError: d.clearError } : { submit: l.forgotPassword, isLoading: l.isLoading, isSuccess: l.isSuccess, error: l.error, clearError: l.clearError }, f = we[e], _ = async (I) => {
    I.preventDefault();
    try {
      await m.submit(i), t?.();
    } catch {
    }
  };
  return m.isSuccess ? /* @__PURE__ */ y("div", { className: `cedros-forgot-password-success ${a}`, children: [
    /* @__PURE__ */ y(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ s("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ s(
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
    /* @__PURE__ */ s("h3", { className: "cedros-success-title", children: "Check your email" }),
    /* @__PURE__ */ s("p", { className: "cedros-success-message", children: f.successMessage(i) }),
    n && /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-outline",
        onClick: n,
        children: "Back to login"
      }
    )
  ] }) : /* @__PURE__ */ y("form", { className: `cedros-forgot-password-form ${a}`, onSubmit: _, children: [
    /* @__PURE__ */ y("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ s("h3", { className: "cedros-form-title", children: "Forgot password?" }),
      /* @__PURE__ */ s("p", { className: "cedros-form-subtitle", children: f.subtitle })
    ] }),
    /* @__PURE__ */ s(ee, { error: m.error, onDismiss: m.clearError }),
    /* @__PURE__ */ y("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ s("label", { htmlFor: p, className: "cedros-label", children: "Email address" }),
      /* @__PURE__ */ s(
        "input",
        {
          id: p,
          type: "email",
          className: "cedros-input",
          value: i,
          onChange: (I) => c(I.target.value),
          placeholder: "you@example.com",
          required: !0,
          autoComplete: "email",
          disabled: m.isLoading
        }
      )
    ] }),
    /* @__PURE__ */ y("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ s(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: m.isLoading || !i,
          children: m.isLoading ? /* @__PURE__ */ y(Y, { children: [
            /* @__PURE__ */ s(J, { size: "sm" }),
            "Sending..."
          ] }) : f.button
        }
      ),
      n && /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: n,
          disabled: m.isLoading,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
const ve = {
  loading: !1,
  loaded: !1,
  error: null,
  callbacks: [],
  load() {
    return typeof window > "u" || typeof document > "u" ? Promise.reject(new Error("Apple Sign-In script loader cannot run in SSR")) : this.loaded ? Promise.resolve() : this.loading ? new Promise((e, t) => {
      this.callbacks.push({ resolve: e, reject: t });
    }) : (this.loading = !0, new Promise((e, t) => {
      this.callbacks.push({ resolve: e, reject: t });
      const n = document.getElementById("apple-signin-script");
      if (n) {
        window.AppleID ? (this.loaded = !0, this.loading = !1, this.callbacks.forEach((i) => i.resolve()), this.callbacks = []) : n.addEventListener("load", () => {
          this.loaded = !0, this.loading = !1, this.callbacks.forEach((i) => i.resolve()), this.callbacks = [];
        });
        return;
      }
      const a = document.createElement("script");
      a.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js", a.async = !0, a.defer = !0, a.id = "apple-signin-script", a.onload = () => {
        this.loaded = !0, this.loading = !1, this.callbacks.forEach((i) => i.resolve()), this.callbacks = [];
      }, a.onerror = () => {
        this.loading = !1, a.remove();
        const i = new Error("Failed to load Apple Sign In script");
        this.callbacks.forEach((c) => c.reject(i)), this.callbacks = [];
      }, document.head.appendChild(a);
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
function Ee() {
  const { config: e, _internal: t } = j(), [n, a] = v(!1), [i, c] = v(!1), [l, d] = v(null), [p, m] = v(null), f = U(e), _ = q(
    () => new V({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  );
  F(() => {
    f.current = e;
  }, [e]), F(() => {
    if (!e.appleClientId)
      return;
    let h = !0;
    const r = () => {
      if (h)
        try {
          window.AppleID?.auth?.init({
            clientId: e.appleClientId,
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: !0
          }), h && c(!0);
        } catch {
          h && d({
            code: "SERVER_ERROR",
            message: "Unable to initialize Apple sign-in. Please refresh and try again."
          });
        }
    };
    return ve.load().then(() => {
      h && r();
    }).catch(() => {
      h && d({
        code: "SERVER_ERROR",
        message: "Unable to load Apple sign-in. Please refresh and try again."
      });
    }), () => {
      h = !1;
    };
  }, [e.appleClientId]);
  const I = k(async (h) => {
    if (!e.appleClientId) {
      const o = {
        code: "VALIDATION_ERROR",
        message: "Apple Client ID not configured"
      };
      throw d(o), o;
    }
    if (!i) {
      const o = {
        code: "VALIDATION_ERROR",
        message: "Apple sign-in is not ready yet. Please wait a moment and try again."
      };
      throw d(o), o;
    }
    a(!0), d(null);
    let r;
    try {
      const o = crypto.getRandomValues(new Uint8Array(32)), u = Array.from(o, (M) => M.toString(16).padStart(2, "0")).join(""), g = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(u)
      ), E = Array.from(
        new Uint8Array(g),
        (M) => M.toString(16).padStart(2, "0")
      ).join("");
      window.AppleID.auth.init({
        clientId: e.appleClientId,
        scope: "name email",
        redirectURI: window.location.origin,
        usePopup: !0,
        nonce: E
      });
      const b = await window.AppleID.auth.signIn();
      if (r = b.authorization?.id_token, !r)
        throw new Error("No ID token received from Apple");
      const O = b.user?.name ? `${b.user.name.firstName || ""} ${b.user.name.lastName || ""}`.trim() : void 0, P = await _.post("/apple", {
        idToken: r,
        name: O || void 0,
        nonce: u,
        referral: t?.getReferralCode?.() ?? void 0,
        access_code: h || void 0
      });
      return f.current.callbacks?.onLoginSuccess?.(P.user, "apple"), t?.handleLoginSuccess(P.user, P.tokens), a(!1), P;
    } catch (o) {
      if (o.error === "popup_closed_by_user") {
        const E = {
          code: "SERVER_ERROR",
          message: "Apple sign-in was cancelled."
        };
        throw d(E), a(!1), E;
      }
      const g = L(o, "Unable to sign in with Apple. Please try again.");
      throw g.code === "ACCOUNT_LINK_REQUIRED" && r && m(r), d(g), a(!1), g;
    }
  }, [e.appleClientId, i, _, t]), R = k(() => d(null), []), w = k(() => m(null), []);
  return {
    signIn: I,
    isLoading: n,
    isInitialized: i,
    error: l,
    clearError: R,
    pendingLinkIdToken: p,
    clearPendingLink: w
  };
}
function oe() {
  if (typeof window > "u" || typeof navigator > "u")
    return !1;
  const e = navigator.userAgent.toLowerCase(), t = (navigator.platform || "").toLowerCase();
  return !!(/iphone|ipad|ipod/.test(e) || t.includes("mac") || /macintosh/.test(e) || t === "macintel" && navigator.maxTouchPoints > 1);
}
function ke({
  onSuccess: e,
  onError: t,
  className: n = "",
  variant: a = "default",
  size: i = "md",
  disabled: c = !1,
  hideOnNonApple: l = !0,
  accessCode: d
}) {
  const { signIn: p, isLoading: m, isInitialized: f } = Ee(), [_] = v(() => oe());
  if (l && !_)
    return null;
  const I = async () => {
    try {
      await p(d), e?.();
    } catch (h) {
      const r = h instanceof Error ? h : new Error(String(h));
      t?.(r);
    }
  }, R = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ y(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[a]} ${R[i]} ${n}`,
      onClick: I,
      disabled: c || !f || m,
      "aria-label": "Sign in with Apple",
      children: [
        m ? /* @__PURE__ */ s(J, { size: "sm" }) : /* @__PURE__ */ s(
          "svg",
          {
            className: "cedros-button-icon",
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true",
            children: /* @__PURE__ */ s("path", { d: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" })
          }
        ),
        /* @__PURE__ */ s("span", { children: "Continue with Apple" })
      ]
    }
  );
}
function S(e, t) {
  if (!e) throw new Error(t);
}
function Ae(e) {
  return e.replace(/-/g, "+").replace(/_/g, "/");
}
function Q(e) {
  S(typeof e == "string" && e.length > 0, "Expected base64url string");
  const t = Ae(e), n = t + "=".repeat((4 - t.length % 4) % 4), a = atob(n), i = new Uint8Array(a.length);
  for (let c = 0; c < a.length; c++) i[c] = a.charCodeAt(c);
  return i.buffer;
}
function D(e) {
  const t = new Uint8Array(e);
  let n = "";
  for (let i = 0; i < t.length; i++) n += String.fromCharCode(t[i]);
  return btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function ie(e) {
  S(typeof e == "object" && e !== null, "Invalid credential descriptor");
  const t = e;
  return S(typeof t.type == "string", "Invalid credential descriptor type"), S(typeof t.id == "string", "Invalid credential descriptor id"), {
    type: t.type,
    id: Q(t.id),
    transports: Array.isArray(t.transports) ? t.transports : void 0
  };
}
function X(e) {
  S(e && typeof e == "object", "Missing creation options");
  const t = e.publicKey;
  S(t && typeof t == "object", "Missing creation options.publicKey"), S(typeof t.challenge == "string", "Missing creation challenge"), S(typeof t.rp == "object" && t.rp !== null, "Missing rp"), S(typeof t.user == "object" && t.user !== null, "Missing user");
  const n = t.rp, a = t.user;
  S(typeof n.name == "string", "Missing rp.name"), S(typeof a.id == "string", "Missing user.id"), S(typeof a.name == "string", "Missing user.name"), S(typeof a.displayName == "string", "Missing user.displayName");
  const i = Array.isArray(t.excludeCredentials) ? t.excludeCredentials.map(ie) : void 0, c = Array.isArray(t.pubKeyCredParams) ? t.pubKeyCredParams.map((d) => ({
    type: d.type,
    alg: d.alg
  })) : [], l = {
    challenge: Q(t.challenge),
    rp: {
      name: n.name,
      id: typeof n.id == "string" ? n.id : void 0
    },
    user: {
      id: Q(a.id),
      name: a.name,
      displayName: a.displayName
    },
    pubKeyCredParams: c,
    timeout: typeof t.timeout == "number" ? t.timeout : void 0,
    attestation: typeof t.attestation == "string" ? t.attestation : void 0,
    authenticatorSelection: typeof t.authenticatorSelection == "object" && t.authenticatorSelection !== null ? t.authenticatorSelection : void 0,
    excludeCredentials: i,
    extensions: typeof t.extensions == "object" && t.extensions !== null ? t.extensions : void 0
  };
  return l.hints = ["client-device"], l;
}
function te(e) {
  S(e && typeof e == "object", "Missing request options");
  const t = e.publicKey;
  S(t && typeof t == "object", "Missing request options.publicKey"), S(typeof t.challenge == "string", "Missing request challenge");
  const n = Array.isArray(t.allowCredentials) ? t.allowCredentials.map(ie) : void 0, a = {
    challenge: Q(t.challenge),
    rpId: typeof t.rpId == "string" ? t.rpId : void 0,
    timeout: typeof t.timeout == "number" ? t.timeout : void 0,
    userVerification: typeof t.userVerification == "string" ? t.userVerification : void 0,
    allowCredentials: n,
    extensions: typeof t.extensions == "object" && t.extensions !== null ? t.extensions : void 0
  };
  return a.hints = ["client-device"], a;
}
function W(e) {
  const t = D(e.rawId), n = e.response, i = { ...{
    clientDataJSON: D(n.clientDataJSON)
  } };
  if ("attestationObject" in n) {
    const c = n;
    if (i.attestationObject = D(c.attestationObject), typeof c.getTransports == "function")
      try {
        i.transports = c.getTransports();
      } catch {
      }
  }
  if ("authenticatorData" in n) {
    const c = n;
    i.authenticatorData = D(c.authenticatorData), i.signature = D(c.signature), c.userHandle && (i.userHandle = D(c.userHandle));
  }
  return {
    id: e.id,
    rawId: t,
    type: e.type,
    authenticatorAttachment: e.authenticatorAttachment ?? void 0,
    clientExtensionResults: e.getClientExtensionResults?.() ?? {},
    response: i
  };
}
function _e() {
  if (typeof window < "u") {
    const e = window.location?.hostname, t = e === "localhost" || e === "127.0.0.1" || e?.endsWith(".localhost");
    if (!(window.isSecureContext === !0) && !t)
      return !1;
  }
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator < "u" && typeof navigator.credentials < "u";
}
function Ie(e) {
  return typeof e == "object" && e !== null && "code" in e && "message" in e && typeof e.code == "string" && typeof e.message == "string";
}
function H(e) {
  if (!(e instanceof Error)) return null;
  const t = e.name;
  return t === "NotAllowedError" ? { code: "SERVER_ERROR", message: "Passkey operation was cancelled or timed out" } : t === "InvalidStateError" ? { code: "VALIDATION_ERROR", message: "Passkey is not available for this operation" } : t === "SecurityError" ? {
    code: "VALIDATION_ERROR",
    message: "Passkeys require HTTPS and a correctly configured relying party (WEBAUTHN_RP_ID / WEBAUTHN_RP_ORIGIN)"
  } : null;
}
function Ne() {
  const { config: e, _internal: t } = j(), [n, a] = v(!1), [i, c] = v(null), l = q(
    () => new V({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      // Needed for authenticated registration endpoints when cookie auth is disabled
      getAccessToken: t?.getAccessToken
    }),
    [t?.getAccessToken, e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), d = k(() => c(null), []), p = _e(), m = k(
    async (r) => {
      if (!p) {
        const o = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw c(o), o;
      }
      a(!0), c(null);
      try {
        const o = await l.post(
          "/webauthn/auth/options",
          { email: r?.email }
        ), u = te(o.options), g = await navigator.credentials.get({
          publicKey: u
        });
        if (!g)
          throw new Error("Passkey authentication returned no credential");
        const E = await l.post("/webauthn/auth/verify", {
          challengeId: o.challengeId,
          credential: W(g)
        });
        return e.callbacks?.onLoginSuccess?.(E.user, "webauthn"), t?.handleLoginSuccess(E.user, E.tokens), E;
      } catch (o) {
        const g = H(o) ?? L(o, "Unable to sign in with passkey. Please try again.");
        throw c(g), g;
      } finally {
        a(!1);
      }
    },
    [l, e.callbacks, t, p]
  ), f = k(
    async (r) => {
      if (!p) {
        const o = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw c(o), o;
      }
      a(!0), c(null);
      try {
        const o = await l.post(
          "/webauthn/register/options",
          {}
        ), u = X(o.options), g = await navigator.credentials.create({
          publicKey: u
        });
        if (!g)
          throw new Error("Passkey registration returned no credential");
        const E = await l.post("/webauthn/register/verify", {
          challengeId: o.challengeId,
          credential: W(g),
          label: r?.label
        });
        if (!E.success)
          throw new Error("Passkey registration failed");
        return { credentialId: E.credentialId, label: E.label };
      } catch (o) {
        const g = H(o) ?? L(o, "Unable to register passkey. Please try again.");
        throw c(g), g;
      } finally {
        a(!1);
      }
    },
    [l, p]
  ), _ = k(
    async (r) => {
      if (!p) {
        const o = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw c(o), o;
      }
      a(!0), c(null);
      try {
        const o = await l.post(
          "/webauthn/signup/options",
          {}
        ), u = X(o.options), g = await navigator.credentials.create({
          publicKey: u
        });
        if (!g)
          throw new Error("Passkey signup returned no credential");
        const E = await l.post("/webauthn/signup/verify", {
          challengeId: o.challengeId,
          credential: W(g),
          email: r?.email,
          name: r?.name,
          label: r?.label,
          referral: t?.getReferralCode?.() ?? void 0,
          access_code: r?.accessCode || void 0
        });
        return e.callbacks?.onLoginSuccess?.(E.user, "webauthn"), t?.handleLoginSuccess(E.user, E.tokens), E;
      } catch (o) {
        const g = H(o) ?? L(o, "Unable to sign up with passkey. Please try again.");
        throw c(g), g;
      } finally {
        a(!1);
      }
    },
    [l, e.callbacks, t, p]
  ), I = k(async (r) => {
    if (!p) {
      const g = {
        code: "VALIDATION_ERROR",
        message: "Passkeys are not supported in this browser"
      };
      throw c(g), g;
    }
    a(!0), c(null);
    const o = typeof localStorage < "u" && localStorage.getItem("cedros-passkey-registered") === "1", u = () => {
      try {
        localStorage.setItem("cedros-passkey-registered", "1");
      } catch {
      }
    };
    return o ? R(u, r) : w(u, r);
  }, [l, e.callbacks, t, p]), R = k(
    async (r, o) => {
      try {
        const u = await l.post(
          "/webauthn/auth/options",
          {}
        ), g = te(u.options), E = await navigator.credentials.get({
          publicKey: g
        });
        if (!E)
          throw new Error("Passkey authentication returned no credential");
        const b = await l.post("/webauthn/auth/verify", {
          challengeId: u.challengeId,
          credential: W(E)
        });
        return e.callbacks?.onLoginSuccess?.(b.user, "webauthn"), t?.handleLoginSuccess(b.user, b.tokens), r(), b;
      } catch (u) {
        if (u instanceof Error && (u.name === "NotAllowedError" || u.name === "InvalidStateError"))
          return h(r, o);
        if (typeof u == "object" && u !== null && "isApiError" in u && u.data?.code === "INVALID_CREDENTIALS") {
          const P = {
            code: "INVALID_CREDENTIALS",
            message: "This passkey is not recognized. Please remove old passkeys for this site and try again, or sign in another way."
          };
          throw c(P), P;
        }
        const O = H(u) ?? L(u, "Unable to sign in with passkey. Please try again.");
        throw c(O), O;
      } finally {
        a(!1);
      }
    },
    [l, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), w = k(
    async (r, o) => {
      try {
        return await h(r, o);
      } catch (u) {
        if (u instanceof Error && (u.name === "InvalidStateError" || u.name === "NotAllowedError"))
          return R(r, o);
        if (!Ie(u)) {
          const b = H(u) ?? L(u, "Unable to create passkey. Please try again.");
          throw c(b), b;
        }
        throw u;
      } finally {
        a(!1);
      }
    },
    [l, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), h = k(
    async (r, o) => {
      const u = await l.post(
        "/webauthn/signup/options",
        {}
      ), g = X(u.options), E = await navigator.credentials.create({
        publicKey: g
      });
      if (!E)
        throw new Error("Passkey signup returned no credential");
      const b = await l.post("/webauthn/signup/verify", {
        challengeId: u.challengeId,
        credential: W(E),
        referral: t?.getReferralCode?.() ?? void 0,
        access_code: o || void 0
      });
      return e.callbacks?.onLoginSuccess?.(b.user, "webauthn"), t?.handleLoginSuccess(b.user, b.tokens), r(), b;
    },
    [l, e.callbacks, t]
  );
  return {
    isSupported: p,
    isLoading: n,
    error: i,
    clearError: d,
    continueWithPasskey: I,
    authenticatePasskey: m,
    registerPasskey: f,
    signupWithPasskey: _
  };
}
function Ce({
  onSuccess: e,
  onError: t,
  className: n = "",
  children: a,
  disabled: i,
  accessCode: c
}) {
  const { continueWithPasskey: l, isLoading: d, isSupported: p } = Ne(), m = i || !p || d;
  return /* @__PURE__ */ y(
    "button",
    {
      type: "button",
      className: `cedros-button cedros-button-social ${n}`,
      onClick: async () => {
        try {
          await l(c), e?.();
        } catch (_) {
          t?.(_ instanceof Error ? _ : new Error(String(_)));
        }
      },
      disabled: m,
      "aria-disabled": m,
      children: [
        d ? /* @__PURE__ */ s(J, { size: "sm" }) : /* @__PURE__ */ s("span", { className: "cedros-social-icon", "aria-hidden": "true", children: /* @__PURE__ */ s(Le, {}) }),
        /* @__PURE__ */ s("span", { children: a ?? "Continue with Passkey" })
      ]
    }
  );
}
function Le() {
  return /* @__PURE__ */ y(
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
        /* @__PURE__ */ s("path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" }),
        /* @__PURE__ */ s("path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88" }),
        /* @__PURE__ */ s("path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02" }),
        /* @__PURE__ */ s("path", { d: "M2 12a10 10 0 0 1 18-6" }),
        /* @__PURE__ */ s("path", { d: "M2 16h.01" }),
        /* @__PURE__ */ s("path", { d: "M21.8 16c.2-2 .131-5.354 0-6" }),
        /* @__PURE__ */ s("path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" }),
        /* @__PURE__ */ s("path", { d: "M8.65 22c.21-.66.45-1.32.57-2" }),
        /* @__PURE__ */ s("path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2" })
      ]
    }
  );
}
const G = ["login", "register"];
function $e({
  onSuccess: e,
  className: t = "",
  defaultTab: n = "login",
  getHasWallets: a,
  renderSolanaButton: i
}) {
  const { config: c, socialButtonOrder: l, isFeatureEnabled: d } = j(), { features: p } = de(), [m, f] = v(n), [_, I] = v("form"), [R, w] = v(() => a ? a() : !1), [h] = v(() => oe()), [r, o] = v(""), [u, g] = v(null), E = p?.signupAccessCodeRequired ?? !1, b = k((A) => {
    g(A.message);
  }, []);
  F(() => {
    if (!a)
      return;
    const A = () => w(a());
    return A(), window.addEventListener("load", A), window.addEventListener("focus", A), () => {
      window.removeEventListener("load", A), window.removeEventListener("focus", A);
    };
  }, [a]);
  const O = c.forms?.forgotPassword?.mode ?? (d("instantLink") ? "instantLink" : "reset"), P = k(
    (A) => {
      const T = G.indexOf(m);
      let x = T;
      switch (A.key) {
        case "ArrowLeft":
        case "ArrowUp":
          x = T === 0 ? G.length - 1 : T - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          x = T === G.length - 1 ? 0 : T + 1;
          break;
        case "Home":
          x = 0;
          break;
        case "End":
          x = G.length - 1;
          break;
        default:
          return;
      }
      A.preventDefault();
      const K = G[x];
      f(K), document.getElementById(`cedros-tab-${K}`)?.focus();
    },
    [m]
  ), M = d("email"), $ = d("google") && c.googleClientId, B = d("apple") && c.appleClientId && h, z = !!i && d("solana") && R, N = d("webauthn"), C = M && ($ || B || z || N);
  return _ === "forgotPassword" ? /* @__PURE__ */ s("div", { className: `cedros-login-form ${t}`, children: /* @__PURE__ */ s(be, { mode: O, onCancel: () => I("form") }) }) : /* @__PURE__ */ y("div", { className: `cedros-login-form ${t}`, children: [
    E && /* @__PURE__ */ y("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ s("label", { htmlFor: "login-form-access-code", className: "cedros-label", children: "Access Code" }),
      /* @__PURE__ */ s(
        "input",
        {
          id: "login-form-access-code",
          type: "text",
          className: "cedros-input",
          value: r,
          onChange: (A) => o(A.target.value),
          placeholder: "Enter access code",
          "aria-required": "true",
          autoComplete: "off"
        }
      )
    ] }),
    u && /* @__PURE__ */ s(
      ee,
      {
        error: u,
        onDismiss: () => g(null)
      }
    ),
    (N || $ || B || z) && (() => {
      const A = {
        webauthn: N ? /* @__PURE__ */ s(Ce, { onSuccess: e, onError: b, accessCode: r || void 0 }) : null,
        google: $ ? /* @__PURE__ */ s(me, { onSuccess: e, onError: b, accessCode: r || void 0 }) : null,
        apple: B ? /* @__PURE__ */ s(ke, { onSuccess: e, onError: b, accessCode: r || void 0 }) : null,
        solana: z ? i?.({
          onSuccess: e,
          onError: b,
          accessCode: r || void 0
        }) : null
      };
      return /* @__PURE__ */ s("div", { className: "cedros-social-buttons", children: (l ?? ["webauthn", "google", "apple", "solana"]).map((x) => {
        const K = A[x];
        return K ? /* @__PURE__ */ s(le, { children: K }, x) : null;
      }) });
    })(),
    C && /* @__PURE__ */ s("div", { className: "cedros-divider", children: /* @__PURE__ */ s("span", { children: "Or continue with" }) }),
    M && /* @__PURE__ */ y(Y, { children: [
      /* @__PURE__ */ y("div", { className: "cedros-tabs", role: "tablist", "aria-label": "Authentication method", children: [
        /* @__PURE__ */ s(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-login",
            className: `cedros-tab ${m === "login" ? "cedros-tab-active" : ""}`,
            onClick: () => f("login"),
            onKeyDown: P,
            "aria-selected": m === "login",
            "aria-controls": "cedros-tabpanel-login",
            tabIndex: m === "login" ? 0 : -1,
            children: "Sign in"
          }
        ),
        /* @__PURE__ */ s(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-register",
            className: `cedros-tab ${m === "register" ? "cedros-tab-active" : ""}`,
            onClick: () => f("register"),
            onKeyDown: P,
            "aria-selected": m === "register",
            "aria-controls": "cedros-tabpanel-register",
            tabIndex: m === "register" ? 0 : -1,
            children: "Sign up"
          }
        )
      ] }),
      /* @__PURE__ */ s(
        "div",
        {
          role: "tabpanel",
          id: `cedros-tabpanel-${m}`,
          "aria-labelledby": `cedros-tab-${m}`,
          children: m === "login" ? /* @__PURE__ */ s(
            ue,
            {
              onSuccess: e,
              onSwitchToRegister: () => f("register"),
              onForgotPassword: () => I("forgotPassword")
            }
          ) : /* @__PURE__ */ s(
            pe,
            {
              onSuccess: e,
              onSwitchToLogin: () => f("login"),
              accessCode: E ? r : void 0
            }
          )
        }
      )
    ] })
  ] });
}
class Re {
  client;
  constructor(t, n, a) {
    this.client = new V({ baseUrl: t, timeoutMs: n, retryAttempts: a });
  }
  /**
   * Check if initial setup is required
   * Returns whether the system needs initial setup (no admin exists)
   */
  async getStatus() {
    try {
      return await this.client.get("/setup/status");
    } catch (t) {
      throw L(t, "Failed to check setup status");
    }
  }
  /**
   * Create the first admin user
   * Only works when no admin users exist
   */
  async createFirstAdmin(t) {
    try {
      return await this.client.post("/setup/admin", t);
    } catch (n) {
      throw L(n, "Failed to create admin account");
    }
  }
}
function Se() {
  const { config: e } = j(), [t, n] = v(null), [a, i] = v(!1), [c, l] = v(!1), [d, p] = v(null), m = U(0), f = q(
    () => new Re(e.serverUrl, e.requestTimeout, e.retryAttempts),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), _ = U(f);
  _.current = f;
  const I = k(async () => {
    i(!0), p(null);
    const w = ++m.current;
    try {
      const h = await _.current.getStatus();
      if (w !== m.current) return;
      n(h);
    } catch (h) {
      if (w !== m.current) return;
      p(h instanceof Error ? h : new Error("Failed to check setup status"));
    } finally {
      w === m.current && i(!1);
    }
  }, []), R = k(
    async (w) => {
      l(!0), p(null);
      try {
        const h = await _.current.createFirstAdmin(w);
        return await I(), h;
      } catch (h) {
        const r = h instanceof Error ? h : new Error("Failed to create admin");
        throw p(r), r;
      } finally {
        l(!1);
      }
    },
    [I]
  );
  return {
    status: t,
    isLoading: a,
    isCreating: c,
    error: d,
    checkStatus: I,
    createAdmin: R
  };
}
const Pe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, se = 8;
function Oe(e) {
  const t = {};
  return e.email ? Pe.test(e.email) || (t.email = "Invalid email format") : t.email = "Email is required", e.password ? e.password.length < se && (t.password = `Password must be at least ${se} characters`) : t.password = "Password is required", e.confirmPassword ? e.password !== e.confirmPassword && (t.confirmPassword = "Passwords do not match") : t.confirmPassword = "Please confirm your password", t;
}
function Be({ onComplete: e, className: t = "" }) {
  const { status: n, isLoading: a, isCreating: i, error: c, checkStatus: l, createAdmin: d } = Se(), [p, m] = v({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    orgName: ""
  }), [f, _] = v({}), [I, R] = v(!1);
  F(() => {
    l();
  }, [l]);
  const w = k(
    (r) => (o) => {
      m((u) => ({ ...u, [r]: o.target.value })), _((u) => ({ ...u, [r]: void 0 }));
    },
    []
  ), h = k(
    async (r) => {
      r.preventDefault();
      const o = Oe(p);
      if (Object.keys(o).length > 0) {
        _(o);
        return;
      }
      try {
        await d({
          email: p.email,
          password: p.password,
          name: p.name || void 0,
          orgName: p.orgName || void 0
        }), R(!0), e?.();
      } catch {
      }
    },
    [p, d, e]
  );
  return a ? /* @__PURE__ */ s("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ y("div", { className: "cedros-setup__loading", children: [
    /* @__PURE__ */ s(J, {}),
    /* @__PURE__ */ s("span", { className: "cedros-setup__loading-text", children: "Checking setup status..." })
  ] }) }) : n && !n.needsSetup ? /* @__PURE__ */ s("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ y("div", { className: "cedros-setup__complete", children: [
    /* @__PURE__ */ s("div", { className: "cedros-setup__icon cedros-setup__icon--success", children: /* @__PURE__ */ y(
      "svg",
      {
        width: "48",
        height: "48",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ s("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          /* @__PURE__ */ s("polyline", { points: "22 4 12 14.01 9 11.01" })
        ]
      }
    ) }),
    /* @__PURE__ */ s("h2", { className: "cedros-setup__title", children: "Setup Complete" }),
    /* @__PURE__ */ s("p", { className: "cedros-setup__text", children: "An admin account already exists. You can now log in." })
  ] }) }) : I ? /* @__PURE__ */ s("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ y("div", { className: "cedros-setup__complete", children: [
    /* @__PURE__ */ s("div", { className: "cedros-setup__icon cedros-setup__icon--success", children: /* @__PURE__ */ y(
      "svg",
      {
        width: "48",
        height: "48",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ s("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          /* @__PURE__ */ s("polyline", { points: "22 4 12 14.01 9 11.01" })
        ]
      }
    ) }),
    /* @__PURE__ */ s("h2", { className: "cedros-setup__title", children: "Admin Account Created" }),
    /* @__PURE__ */ s("p", { className: "cedros-setup__text", children: "Your admin account has been created successfully. You can now log in with your credentials." })
  ] }) }) : /* @__PURE__ */ s("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ y("div", { className: "cedros-setup__container", children: [
    /* @__PURE__ */ y("div", { className: "cedros-setup__header", children: [
      /* @__PURE__ */ s("div", { className: "cedros-setup__logo", children: /* @__PURE__ */ y(
        "svg",
        {
          width: "32",
          height: "32",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            /* @__PURE__ */ s("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }),
            /* @__PURE__ */ s("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" })
          ]
        }
      ) }),
      /* @__PURE__ */ s("h1", { className: "cedros-setup__title", children: "Welcome to Cedros" }),
      /* @__PURE__ */ s("p", { className: "cedros-setup__subtitle", children: "Let's set up your admin account to get started." })
    ] }),
    /* @__PURE__ */ y("form", { className: "cedros-setup__form", onSubmit: h, children: [
      c && /* @__PURE__ */ s(ee, { error: c.message }),
      /* @__PURE__ */ y("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ y("label", { htmlFor: "setup-email", className: "cedros-setup__label", children: [
          "Email Address ",
          /* @__PURE__ */ s("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ s(
          "input",
          {
            id: "setup-email",
            type: "email",
            className: `cedros-setup__input ${f.email ? "cedros-setup__input--error" : ""}`,
            value: p.email,
            onChange: w("email"),
            placeholder: "admin@example.com",
            autoComplete: "email",
            autoFocus: !0,
            disabled: i
          }
        ),
        f.email && /* @__PURE__ */ s("span", { className: "cedros-setup__error", children: f.email })
      ] }),
      /* @__PURE__ */ y("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ s("label", { htmlFor: "setup-name", className: "cedros-setup__label", children: "Display Name" }),
        /* @__PURE__ */ s(
          "input",
          {
            id: "setup-name",
            type: "text",
            className: "cedros-setup__input",
            value: p.name,
            onChange: w("name"),
            placeholder: "Admin",
            autoComplete: "name",
            disabled: i
          }
        )
      ] }),
      /* @__PURE__ */ y("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ s("label", { htmlFor: "setup-org-name", className: "cedros-setup__label", children: "Organization Name" }),
        /* @__PURE__ */ s(
          "input",
          {
            id: "setup-org-name",
            type: "text",
            className: "cedros-setup__input",
            value: p.orgName,
            onChange: w("orgName"),
            placeholder: "My Organization",
            disabled: i
          }
        )
      ] }),
      /* @__PURE__ */ y("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ y("label", { htmlFor: "setup-password", className: "cedros-setup__label", children: [
          "Password ",
          /* @__PURE__ */ s("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ s(
          "input",
          {
            id: "setup-password",
            type: "password",
            className: `cedros-setup__input ${f.password ? "cedros-setup__input--error" : ""}`,
            value: p.password,
            onChange: w("password"),
            placeholder: "At least 8 characters",
            autoComplete: "new-password",
            disabled: i
          }
        ),
        f.password && /* @__PURE__ */ s("span", { className: "cedros-setup__error", children: f.password })
      ] }),
      /* @__PURE__ */ y("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ y("label", { htmlFor: "setup-confirm-password", className: "cedros-setup__label", children: [
          "Confirm Password ",
          /* @__PURE__ */ s("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ s(
          "input",
          {
            id: "setup-confirm-password",
            type: "password",
            className: `cedros-setup__input ${f.confirmPassword ? "cedros-setup__input--error" : ""}`,
            value: p.confirmPassword,
            onChange: w("confirmPassword"),
            placeholder: "Confirm your password",
            autoComplete: "new-password",
            disabled: i
          }
        ),
        f.confirmPassword && /* @__PURE__ */ s("span", { className: "cedros-setup__error", children: f.confirmPassword })
      ] }),
      /* @__PURE__ */ s("button", { type: "submit", className: "cedros-setup__button", disabled: i, children: i ? /* @__PURE__ */ y(Y, { children: [
        /* @__PURE__ */ s(J, {}),
        /* @__PURE__ */ s("span", { children: "Creating Account..." })
      ] }) : "Create Admin Account" })
    ] }),
    /* @__PURE__ */ y("div", { className: "cedros-setup__footer", children: [
      /* @__PURE__ */ s("p", { className: "cedros-setup__note", children: "This will be the first administrator account for your installation." }),
      n?.serverVersion && /* @__PURE__ */ y("p", { className: "cedros-setup__version", children: [
        "Server version: ",
        n.serverVersion
      ] })
    ] })
  ] }) });
}
class Te {
  client;
  constructor(t, n, a, i) {
    this.client = new V({ baseUrl: t, timeoutMs: n, retryAttempts: a, getAccessToken: i });
  }
  /**
   * List all organizations the current user belongs to
   */
  async listOrgs() {
    try {
      return (await this.client.get("/orgs")).orgs.map((n) => ({
        ...n,
        membership: {
          orgId: n.id,
          role: n.role
        }
      }));
    } catch (t) {
      throw L(t, "Failed to list organizations");
    }
  }
  /**
   * Get a single organization by ID
   */
  async getOrg(t) {
    try {
      return await this.client.get(`/orgs/${t}`);
    } catch (n) {
      throw L(n, "Failed to get organization");
    }
  }
  /**
   * Create a new organization
   */
  async createOrg(t) {
    try {
      return await this.client.post("/orgs", t);
    } catch (n) {
      throw L(n, "Failed to create organization");
    }
  }
  /**
   * Update an organization
   */
  async updateOrg(t, n) {
    try {
      return await this.client.patch(`/orgs/${t}`, n);
    } catch (a) {
      throw L(a, "Failed to update organization");
    }
  }
  /**
   * Delete an organization
   */
  async deleteOrg(t) {
    try {
      await this.client.delete(`/orgs/${t}`);
    } catch (n) {
      throw L(n, "Failed to delete organization");
    }
  }
  /**
   * Check authorization for an action
   */
  async authorize(t) {
    try {
      return await this.client.post("/authorize", t);
    } catch (n) {
      throw L(n, "Failed to check authorization");
    }
  }
  /**
   * Get current user's permissions in an organization
   */
  async getPermissions(t) {
    try {
      return await this.client.post("/permissions", { orgId: t });
    } catch (n) {
      throw L(n, "Failed to get permissions");
    }
  }
}
const Z = "cedros_active_org";
function Me(e) {
  try {
    return localStorage.getItem(e);
  } catch {
    return null;
  }
}
function re(e, t) {
  try {
    localStorage.setItem(e, t);
  } catch {
  }
}
function ze() {
  const { config: e, user: t, authState: n, _internal: a } = he(), i = typeof window < "u" && !!window.localStorage, [c, l] = v([]), [d, p] = v(null), [m, f] = v([]), [_, I] = v(null), [R, w] = v(n === "authenticated"), [h, r] = v(null), o = q(
    () => new Te(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      a?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, a]
  ), u = U(o);
  F(() => {
    u.current = o;
  }, [o]);
  const g = k(async (N) => {
    try {
      const C = await u.current.getPermissions(N);
      f(C.permissions), I(C.role);
    } catch {
      f([]), I(null);
    }
  }, []), E = U(async () => {
  }), b = k(async () => {
    if (n !== "authenticated" || !t) {
      l([]), p(null), f([]), I(null);
      return;
    }
    w(!0), r(null);
    try {
      const N = await u.current.listOrgs();
      l(N);
      const C = i ? Me(Z) : null;
      let A = N.find((T) => T.id === C);
      !A && N.length > 0 && (A = N.find((T) => T.isPersonal) || N[0]), A ? (p(A), i && re(Z, A.id), await g(A.id)) : (p(null), f([]), I(null));
    } catch (N) {
      r(N);
    } finally {
      w(!1);
    }
  }, [n, t, g, i]);
  F(() => {
    E.current = b;
  }, [b]);
  const O = U(!1);
  F(() => {
    n === "authenticated" && !O.current ? (O.current = !0, E.current()) : n !== "authenticated" && (O.current = !1);
  }, [n]);
  const P = k(
    async (N) => {
      const C = c.find((A) => A.id === N);
      if (!C) {
        r({ code: "UNKNOWN_ERROR", message: "Organization not found" });
        return;
      }
      p(C), i && re(Z, N), await g(N);
    },
    [c, g, i]
  ), M = k(
    async (N) => {
      w(!0), r(null);
      try {
        const C = await u.current.createOrg(N);
        return await b(), C;
      } catch (C) {
        throw r(C), C;
      } finally {
        w(!1);
      }
    },
    [b]
  ), $ = k(
    async (N, C) => {
      w(!0), r(null);
      try {
        const A = await u.current.updateOrg(N, C);
        return await b(), A;
      } catch (A) {
        throw r(A), A;
      } finally {
        w(!1);
      }
    },
    [b]
  ), B = k(
    async (N) => {
      w(!0), r(null);
      try {
        await u.current.deleteOrg(N), await b();
      } catch (C) {
        throw r(C), C;
      } finally {
        w(!1);
      }
    },
    [b]
  ), z = k(
    (N) => m.includes(N),
    [m]
  );
  return {
    orgs: c,
    activeOrg: d,
    permissions: m,
    role: _,
    isLoading: R,
    error: h,
    fetchOrgs: b,
    switchOrg: P,
    createOrg: M,
    updateOrg: $,
    deleteOrg: B,
    hasPermission: z
  };
}
export {
  ke as A,
  be as F,
  $e as L,
  Te as O,
  Ce as P,
  Be as S,
  Se as a,
  ge as b,
  Ne as c,
  Ee as d,
  ye as e,
  ze as u
};
