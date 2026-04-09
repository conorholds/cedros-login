import { jsxs as s, jsx as e } from "react/jsx-runtime";
import { useRef as M, useState as y, useCallback as _, useEffect as $, useMemo as O } from "react";
import { L, E as D } from "./ErrorMessage-59nRkszi.js";
import { u as T, A as j, S as F } from "./AutosaveStatus-Bg31Q4YA.js";
import { u as z } from "./useCedrosLogin-fUZvc4r9.js";
import { u as B } from "./useOrgs-CY8R9U79.js";
function U() {
  const { config: t, _internal: m } = z(), l = t.serverUrl, p = M(m?.getAccessToken ?? (() => null));
  p.current = m?.getAccessToken ?? (() => null);
  const [v, S] = y([]), [f, N] = y(0), [C, g] = y(!1), [k, a] = y(null), n = _(() => {
    const b = p.current();
    return {
      "Content-Type": "application/json",
      ...b ? { Authorization: `Bearer ${b}` } : {}
    };
  }, []), o = _(
    async (b, c = 50, d = 0) => {
      g(!0), a(null);
      try {
        const u = new URLSearchParams();
        b && u.set("org_id", b), u.set("limit", String(c)), u.set("offset", String(d));
        const r = await fetch(`${l}/admin/sso-providers?${u}`, {
          headers: n()
        });
        if (!r.ok) {
          const R = await r.json().catch(() => ({}));
          throw new Error(R.error || `Failed to fetch SSO providers: ${r.status}`);
        }
        const w = await r.json();
        return S(w.providers), N(w.total), w;
      } catch (u) {
        const r = u instanceof Error ? u : new Error(String(u));
        throw a(r), r;
      } finally {
        g(!1);
      }
    },
    [l, n]
  ), i = _(
    async (b) => {
      g(!0), a(null);
      try {
        const c = await fetch(`${l}/admin/sso-providers`, {
          method: "POST",
          headers: n(),
          body: JSON.stringify(b)
        });
        if (!c.ok) {
          const u = await c.json().catch(() => ({}));
          throw new Error(u.error || `Failed to create SSO provider: ${c.status}`);
        }
        const d = await c.json();
        return S((u) => [...u, d]), N((u) => u + 1), d;
      } catch (c) {
        const d = c instanceof Error ? c : new Error(String(c));
        throw a(d), d;
      } finally {
        g(!1);
      }
    },
    [l, n]
  ), h = _(
    async (b, c) => {
      g(!0), a(null);
      try {
        const d = await fetch(`${l}/admin/sso-providers/${b}`, {
          method: "PUT",
          headers: n(),
          body: JSON.stringify(c)
        });
        if (!d.ok) {
          const r = await d.json().catch(() => ({}));
          throw new Error(r.error || `Failed to update SSO provider: ${d.status}`);
        }
        const u = await d.json();
        return S((r) => r.map((w) => w.id === b ? u : w)), u;
      } catch (d) {
        const u = d instanceof Error ? d : new Error(String(d));
        throw a(u), u;
      } finally {
        g(!1);
      }
    },
    [l, n]
  ), x = _(
    async (b) => {
      g(!0), a(null);
      try {
        const c = await fetch(`${l}/admin/sso-providers/${b}`, {
          method: "DELETE",
          headers: n()
        });
        if (!c.ok) {
          const d = await c.json().catch(() => ({}));
          throw new Error(d.error || `Failed to delete SSO provider: ${c.status}`);
        }
        S((d) => d.filter((u) => u.id !== b)), N((d) => d - 1);
      } catch (c) {
        const d = c instanceof Error ? c : new Error(String(c));
        throw a(d), d;
      } finally {
        g(!1);
      }
    },
    [l, n]
  ), E = _(
    async (b, c) => h(b, { enabled: c }),
    [h]
  );
  return {
    providers: v,
    total: f,
    isLoading: C,
    error: k,
    fetchProviders: o,
    createProvider: i,
    updateProvider: h,
    deleteProvider: x,
    toggleProvider: E
  };
}
function H({ className: t }) {
  const {
    providers: m,
    isLoading: l,
    error: p,
    fetchProviders: v,
    createProvider: S,
    updateProvider: f,
    deleteProvider: N,
    toggleProvider: C
  } = U(), { activeOrg: g } = B(), [k, a] = y("list"), [n, o] = y(null), [i, h] = y(null);
  $(() => {
    v(g?.id);
  }, [v, g?.id]);
  const x = () => {
    o(null), h(null), a("add");
  }, E = (r) => {
    o(r), h(null), a("edit");
  }, b = () => {
    a("list"), o(null), h(null);
  }, c = async (r) => {
    if (confirm(`Delete SSO provider "${r.name}"? This cannot be undone.`))
      try {
        await N(r.id);
      } catch {
      }
  }, d = async (r) => {
    try {
      await C(r.id, !r.enabled);
    } catch {
    }
  }, u = async (r) => {
    h(null);
    try {
      k === "add" ? await S(r) : n && await f(n.id, r), a("list"), o(null);
    } catch (w) {
      h(w instanceof Error ? w.message : "Failed to save provider");
    }
  };
  return l && m.length === 0 ? /* @__PURE__ */ s("div", { className: `cedros-system-settings cedros-system-settings-loading ${t ?? ""}`, children: [
    /* @__PURE__ */ e(L, {}),
    /* @__PURE__ */ e("span", { children: "Loading SSO providers..." })
  ] }) : k === "add" || k === "edit" ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${t ?? ""}`, children: /* @__PURE__ */ e(
    W,
    {
      provider: n,
      orgId: g?.id,
      error: i,
      isLoading: l,
      onSave: u,
      onCancel: b
    }
  ) }) : /* @__PURE__ */ s("div", { className: `cedros-system-settings ${t ?? ""}`, children: [
    /* @__PURE__ */ s("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ s("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "SSO Providers" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure OIDC identity providers for enterprise single sign-on." })
      ] }),
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-btn cedros-btn-primary", onClick: x, children: "Add Provider" })
    ] }),
    p && /* @__PURE__ */ e(D, { error: p.message }),
    m.length === 0 ? /* @__PURE__ */ s("div", { className: "cedros-system-settings-empty", children: [
      /* @__PURE__ */ e("p", { children: "No SSO providers configured." }),
      /* @__PURE__ */ e("p", { className: "cedros-text-muted", children: "Add an OIDC provider like Okta, Azure AD, or Auth0 to enable enterprise SSO." })
    ] }) : /* @__PURE__ */ e("div", { className: "cedros-sso-provider-list", children: m.map((r) => /* @__PURE__ */ e(
      K,
      {
        provider: r,
        onEdit: () => E(r),
        onDelete: () => c(r),
        onToggle: () => d(r)
      },
      r.id
    )) })
  ] });
}
function K({ provider: t, onEdit: m, onDelete: l, onToggle: p }) {
  return /* @__PURE__ */ s(
    "div",
    {
      className: `cedros-sso-provider-card ${t.enabled ? "" : "cedros-sso-provider-card--disabled"}`,
      children: [
        /* @__PURE__ */ s("div", { className: "cedros-sso-provider-card-header", children: [
          /* @__PURE__ */ s("div", { className: "cedros-sso-provider-card-info", children: [
            /* @__PURE__ */ e("h3", { className: "cedros-sso-provider-card-name", children: t.name }),
            /* @__PURE__ */ e("p", { className: "cedros-sso-provider-card-issuer", children: t.issuerUrl })
          ] }),
          /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              role: "switch",
              "aria-checked": t.enabled,
              className: `cedros-toggle ${t.enabled ? "cedros-toggle-on" : "cedros-toggle-off"}`,
              onClick: p,
              children: [
                /* @__PURE__ */ e("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ e("span", { className: "cedros-toggle-thumb" }) }),
                /* @__PURE__ */ e("span", { className: "cedros-toggle-label", children: t.enabled ? "Enabled" : "Disabled" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ s("div", { className: "cedros-sso-provider-card-details", children: [
          /* @__PURE__ */ s("div", { className: "cedros-sso-provider-card-detail", children: [
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-label", children: "Client ID" }),
            /* @__PURE__ */ e("code", { className: "cedros-sso-provider-card-detail-value", children: t.clientId })
          ] }),
          t.emailDomain && /* @__PURE__ */ s("div", { className: "cedros-sso-provider-card-detail", children: [
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-label", children: "Email Domain" }),
            /* @__PURE__ */ s("span", { className: "cedros-sso-provider-card-detail-value", children: [
              "@",
              t.emailDomain
            ] })
          ] }),
          /* @__PURE__ */ s("div", { className: "cedros-sso-provider-card-detail", children: [
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-label", children: "Registration" }),
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-value", children: t.allowRegistration ? "Allowed" : "Existing users only" })
          ] })
        ] }),
        /* @__PURE__ */ s("div", { className: "cedros-sso-provider-card-actions", children: [
          /* @__PURE__ */ e("button", { type: "button", className: "cedros-btn cedros-btn-ghost", onClick: m, children: "Edit" }),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-btn cedros-btn-ghost cedros-btn-danger",
              onClick: l,
              children: "Delete"
            }
          )
        ] })
      ]
    }
  );
}
function W({
  provider: t,
  orgId: m,
  error: l,
  isLoading: p,
  onSave: v,
  onCancel: S
}) {
  const f = !!t, [N, C] = y(t?.name ?? ""), [g, k] = y(t?.issuerUrl ?? ""), [a, n] = y(t?.clientId ?? ""), [o, i] = y(""), [h, x] = y(t?.emailDomain ?? ""), [E, b] = y(t?.allowRegistration ?? !0), [c, d] = y(t?.enabled ?? !0), u = _(
    (r) => {
      if (r.preventDefault(), f) {
        const w = {
          name: N,
          issuerUrl: g,
          clientId: a,
          emailDomain: h || null,
          allowRegistration: E,
          enabled: c
        };
        o && (w.clientSecret = o), v(w);
      } else {
        if (!m)
          return;
        v({
          orgId: m,
          name: N,
          issuerUrl: g,
          clientId: a,
          clientSecret: o,
          emailDomain: h || null,
          allowRegistration: E,
          enabled: c
        });
      }
    },
    [
      f,
      m,
      N,
      g,
      a,
      o,
      h,
      E,
      c,
      v
    ]
  );
  return /* @__PURE__ */ s("form", { className: "cedros-sso-provider-form", onSubmit: u, children: [
    /* @__PURE__ */ e("div", { className: "cedros-settings-page-header", children: /* @__PURE__ */ s("div", { className: "cedros-settings-page-header-content", children: [
      /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: f ? "Edit SSO Provider" : "Add SSO Provider" }),
      /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure an OIDC identity provider for enterprise single sign-on." })
    ] }) }),
    l && /* @__PURE__ */ e(D, { error: l }),
    /* @__PURE__ */ s("div", { className: "cedros-form-section", children: [
      /* @__PURE__ */ s("div", { className: "cedros-form-group", children: [
        /* @__PURE__ */ e("label", { className: "cedros-form-label", htmlFor: "sso-name", children: "Provider Name" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "sso-name",
            type: "text",
            className: "cedros-form-input",
            value: N,
            onChange: (r) => C(r.target.value),
            placeholder: "e.g., Okta, Azure AD",
            required: !0
          }
        )
      ] }),
      /* @__PURE__ */ s("div", { className: "cedros-form-group", children: [
        /* @__PURE__ */ e("label", { className: "cedros-form-label", htmlFor: "sso-issuer", children: "Issuer URL" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "sso-issuer",
            type: "url",
            className: "cedros-form-input",
            value: g,
            onChange: (r) => k(r.target.value),
            placeholder: "https://your-org.okta.com",
            required: !0
          }
        ),
        /* @__PURE__ */ e("p", { className: "cedros-form-hint", children: "The OIDC issuer URL. Must support discovery at /.well-known/openid-configuration" })
      ] }),
      /* @__PURE__ */ s("div", { className: "cedros-form-group", children: [
        /* @__PURE__ */ e("label", { className: "cedros-form-label", htmlFor: "sso-client-id", children: "Client ID" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "sso-client-id",
            type: "text",
            className: "cedros-form-input",
            value: a,
            onChange: (r) => n(r.target.value),
            placeholder: "OAuth client ID",
            required: !0
          }
        )
      ] }),
      /* @__PURE__ */ s("div", { className: "cedros-form-group", children: [
        /* @__PURE__ */ s("label", { className: "cedros-form-label", htmlFor: "sso-client-secret", children: [
          "Client Secret",
          " ",
          f && /* @__PURE__ */ e("span", { className: "cedros-form-hint-inline", children: "(leave blank to keep current)" })
        ] }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "sso-client-secret",
            type: "password",
            className: "cedros-form-input",
            value: o,
            onChange: (r) => i(r.target.value),
            placeholder: f ? "••••••••" : "OAuth client secret",
            required: !f
          }
        )
      ] }),
      /* @__PURE__ */ s("div", { className: "cedros-form-group", children: [
        /* @__PURE__ */ e("label", { className: "cedros-form-label", htmlFor: "sso-email-domain", children: "Email Domain (optional)" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "sso-email-domain",
            type: "text",
            className: "cedros-form-input",
            value: h,
            onChange: (r) => x(r.target.value),
            placeholder: "company.com"
          }
        ),
        /* @__PURE__ */ e("p", { className: "cedros-form-hint", children: "Restrict to users with emails from this domain" })
      ] }),
      /* @__PURE__ */ e("div", { className: "cedros-form-group", children: /* @__PURE__ */ s("label", { className: "cedros-form-checkbox", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "checkbox",
            checked: E,
            onChange: (r) => b(r.target.checked)
          }
        ),
        /* @__PURE__ */ e("span", { children: "Allow new user registration via SSO" })
      ] }) }),
      /* @__PURE__ */ e("div", { className: "cedros-form-group", children: /* @__PURE__ */ s("label", { className: "cedros-form-checkbox", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "checkbox",
            checked: c,
            onChange: (r) => d(r.target.checked)
          }
        ),
        /* @__PURE__ */ e("span", { children: "Enable this provider" })
      ] }) })
    ] }),
    /* @__PURE__ */ s("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-btn cedros-btn-ghost",
          onClick: S,
          disabled: p,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e("button", { type: "submit", className: "cedros-btn cedros-btn-primary", disabled: p, children: p ? "Saving..." : f ? "Save Changes" : "Add Provider" })
    ] })
  ] });
}
function q() {
  return /* @__PURE__ */ s("svg", { width: "18", height: "18", viewBox: "0 0 18 18", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ e("path", { d: "M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z", fill: "#4285F4" }),
    /* @__PURE__ */ e("path", { d: "M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332A8.997 8.997 0 0 0 9.003 18z", fill: "#34A853" }),
    /* @__PURE__ */ e("path", { d: "M3.964 10.712A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.96A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.96 4.042l3.004-2.33z", fill: "#FBBC05" }),
    /* @__PURE__ */ e("path", { d: "M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 0 0 .96 4.958l3.005 2.332c.708-2.127 2.692-3.71 5.036-3.71z", fill: "#EA4335" })
  ] });
}
function G() {
  return /* @__PURE__ */ e("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" }) });
}
function V() {
  return /* @__PURE__ */ s("svg", { width: "18", height: "18", viewBox: "0 0 128 128", fill: "currentColor", "aria-hidden": "true", children: [
    /* @__PURE__ */ e("path", { d: "M25.38 96.04a4.35 4.35 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7l-17.71 17.72a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7l17.71-17.72z" }),
    /* @__PURE__ */ e("path", { d: "M25.38 11.81a4.47 4.47 0 0 1 3.07-1.27h91.68c1.93 0 2.9 2.34 1.54 3.7L103.96 31.96a4.35 4.35 0 0 1-3.07 1.27H9.21c-1.93 0-2.9-2.34-1.54-3.7L25.38 11.81z" }),
    /* @__PURE__ */ e("path", { d: "M102.62 53.76a4.35 4.35 0 0 0-3.07-1.27H7.87c-1.93 0-2.9 2.34-1.54 3.7l17.71 17.72a4.35 4.35 0 0 0 3.07 1.27h91.68c1.93 0 2.9-2.34 1.54-3.7L102.62 53.76z" })
  ] });
}
function J() {
  return /* @__PURE__ */ s("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ e("path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" }),
    /* @__PURE__ */ e("path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88" }),
    /* @__PURE__ */ e("path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02" }),
    /* @__PURE__ */ e("path", { d: "M2 12a10 10 0 0 1 18-6" }),
    /* @__PURE__ */ e("path", { d: "M2 16h.01" }),
    /* @__PURE__ */ e("path", { d: "M21.8 16c.2-2 .131-5.354 0-6" }),
    /* @__PURE__ */ e("path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" }),
    /* @__PURE__ */ e("path", { d: "M8.65 22c.21-.66.45-1.32.57-2" }),
    /* @__PURE__ */ e("path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2" })
  ] });
}
const A = {
  webauthn: { label: "Passkey", icon: /* @__PURE__ */ e(J, {}), enabledKey: "auth_webauthn_enabled" },
  google: { label: "Google", icon: /* @__PURE__ */ e(q, {}), enabledKey: "auth_google_enabled" },
  apple: { label: "Apple", icon: /* @__PURE__ */ e(G, {}), enabledKey: "auth_apple_enabled" },
  solana: { label: "Solana", icon: /* @__PURE__ */ e(V, {}), enabledKey: "auth_solana_enabled" }
}, Q = ["webauthn", "google", "apple", "solana"], X = {
  webauthn: "Continue with Passkey",
  google: "Continue with Google",
  apple: "Continue with Apple",
  solana: "Continue with Solana"
};
function P(t, m) {
  for (const l of Object.values(t)) {
    const p = l.find((v) => v.key === m);
    if (p) return p.value === "true";
  }
  return !0;
}
function Y(t) {
  for (const m of Object.values(t)) {
    const l = m.find((p) => p.key === "ui_social_button_order");
    if (l && l.value) return l.value.split(",").map((p) => p.trim());
  }
  return Q;
}
function Z() {
  return /* @__PURE__ */ s("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": "true", style: { opacity: 0.4 }, children: [
    /* @__PURE__ */ e("circle", { cx: "5", cy: "3", r: "1.5" }),
    /* @__PURE__ */ e("circle", { cx: "11", cy: "3", r: "1.5" }),
    /* @__PURE__ */ e("circle", { cx: "5", cy: "8", r: "1.5" }),
    /* @__PURE__ */ e("circle", { cx: "11", cy: "8", r: "1.5" }),
    /* @__PURE__ */ e("circle", { cx: "5", cy: "13", r: "1.5" }),
    /* @__PURE__ */ e("circle", { cx: "11", cy: "13", r: "1.5" })
  ] });
}
function ee({ settings: t, handleChange: m }) {
  const [l, p] = y(() => Y(t)), v = M(null), [S, f] = y(null), N = _(
    (n) => {
      p(n), m("ui_social_button_order", n.join(","));
    },
    [m]
  ), C = _((n) => {
    v.current = n;
  }, []), g = _((n, o) => {
    n.preventDefault(), f(o);
  }, []), k = _(
    (n) => {
      const o = v.current;
      if (o === null || o === n) {
        f(null);
        return;
      }
      const i = [...l], [h] = i.splice(o, 1);
      i.splice(n, 0, h), N(i), v.current = null, f(null);
    },
    [l, N]
  ), a = _(() => {
    v.current = null, f(null);
  }, []);
  return /* @__PURE__ */ s("div", { className: "cedros-system-settings", children: [
    /* @__PURE__ */ e("div", { className: "cedros-settings-page-header", children: /* @__PURE__ */ s("div", { className: "cedros-settings-page-header-content", children: [
      /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "Button Order" }),
      /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Drag to reorder the social login buttons on your sign-in form." })
    ] }) }),
    /* @__PURE__ */ s("div", { style: { display: "flex", gap: "2rem", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ e("div", { style: { flex: "1 1 260px", minWidth: 260 }, children: /* @__PURE__ */ e("ul", { style: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }, children: l.map((n, o) => {
        const i = A[n];
        if (!i) return null;
        const h = P(t, i.enabledKey);
        return /* @__PURE__ */ s(
          "li",
          {
            draggable: !0,
            onDragStart: () => C(o),
            onDragOver: (E) => g(E, o),
            onDrop: () => k(o),
            onDragEnd: a,
            className: "cedros-btn-order-item",
            style: {
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.625rem 0.75rem",
              borderRadius: "var(--cedros-radius, 0.5rem)",
              border: S === o ? "2px solid var(--cedros-primary, #6366f1)" : "1px solid var(--cedros-border, #e5e7eb)",
              background: "var(--cedros-background, #fff)",
              cursor: "grab",
              opacity: h ? 1 : 0.5,
              transition: "border-color 0.15s"
            },
            children: [
              /* @__PURE__ */ e(Z, {}),
              /* @__PURE__ */ e("span", { className: "cedros-button-icon", style: { display: "flex", alignItems: "center" }, children: i.icon }),
              /* @__PURE__ */ e("span", { style: { flex: 1, fontWeight: 500, fontSize: "0.875rem" }, children: i.label }),
              /* @__PURE__ */ e(
                "span",
                {
                  style: {
                    fontSize: "0.7rem",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "9999px",
                    background: h ? "var(--cedros-primary, #6366f1)" : "var(--cedros-muted, #f3f4f6)",
                    color: h ? "var(--cedros-primary-foreground, #fff)" : "var(--cedros-muted-foreground, #6b7280)"
                  },
                  children: h ? "Enabled" : "Disabled"
                }
              )
            ]
          },
          n
        );
      }) }) }),
      /* @__PURE__ */ s("div", { style: { flex: "1 1 280px", minWidth: 280 }, children: [
        /* @__PURE__ */ e("p", { style: { fontSize: "0.75rem", color: "var(--cedros-muted-foreground, #6b7280)", margin: "0 0 0.75rem" }, children: "This is how your login form buttons will appear:" }),
        /* @__PURE__ */ e(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              padding: "1.25rem",
              borderRadius: "var(--cedros-radius, 0.5rem)",
              border: "1px solid var(--cedros-border, #e5e7eb)",
              background: "var(--cedros-background, #fff)"
            },
            children: l.map((n) => {
              const o = A[n];
              return !o || !P(t, o.enabledKey) ? null : /* @__PURE__ */ s(
                "button",
                {
                  type: "button",
                  className: "cedros-button cedros-button-social",
                  style: { pointerEvents: "none", width: "100%" },
                  tabIndex: -1,
                  children: [
                    /* @__PURE__ */ e("span", { className: "cedros-button-icon", children: o.icon }),
                    X[n]
                  ]
                },
                n
              );
            })
          }
        )
      ] })
    ] })
  ] });
}
const I = [
  {
    id: "email",
    label: "Email",
    categories: ["auth.email"],
    keys: ["auth_email_enabled", "auth_email_require_verification", "auth_email_block_disposable"]
  },
  {
    id: "google",
    label: "Google",
    categories: ["auth.google"],
    keys: ["auth_google_enabled", "auth_google_client_id"]
  },
  {
    id: "apple",
    label: "Apple",
    categories: ["auth.apple"],
    keys: ["auth_apple_enabled", "auth_apple_client_id", "auth_apple_team_id"]
  },
  {
    id: "solana",
    label: "Solana",
    categories: ["auth.solana"],
    keys: ["auth_solana_enabled", "auth_solana_challenge_expiry"]
  },
  {
    id: "passkeys",
    label: "Passkeys",
    categories: ["auth.webauthn"],
    keys: ["auth_webauthn_enabled", "auth_webauthn_rp_id", "auth_webauthn_rp_name", "auth_webauthn_rp_origin"]
  },
  {
    id: "instantlink",
    label: "Instant Link",
    categories: ["auth.instantlink"],
    keys: ["auth_instantlink_enabled", "auth_instantlink_expiry", "auth_instantlink_rate_limit"]
  },
  { id: "sso", label: "SSO Providers", categories: [], isCustom: !0 },
  { id: "buttonorder", label: "Button Order", categories: [], isCustom: !0 },
  {
    id: "postlogin",
    label: "Post-Login",
    categories: ["postlogin", "postlogin.welcome", "postlogin.username", "postlogin.complete", "postlogin.wallet"],
    keys: ["postlogin_redirect_url", "postlogin_welcome_enabled", "postlogin_welcome_route", "postlogin_username_enabled", "postlogin_complete_enabled", "postlogin_wallet_enroll_enabled", "postlogin_show_recovery_enabled"]
  }
];
function ie({ className: t }) {
  const {
    settings: m,
    edits: l,
    isLoading: p,
    autosaveStatus: v,
    autosaveError: S,
    error: f,
    fetchSettings: N,
    handleChange: C
  } = T(), [g, k] = y("email");
  $(() => {
    N();
  }, [N]);
  const a = I.find((i) => i.id === g), n = O(() => {
    if (!a) return [];
    const i = [];
    for (const h of a.categories) {
      const x = m[h] ?? [];
      i.push(...x);
    }
    return i;
  }, [m, a]), o = O(() => a?.keys ? n.filter((i) => a.keys.includes(i.key)).sort((i, h) => a.keys.indexOf(i.key) - a.keys.indexOf(h.key)) : n, [n, a]);
  return p && Object.keys(m).length === 0 ? /* @__PURE__ */ s("div", { className: `cedros-system-settings cedros-system-settings-loading ${t ?? ""}`, children: [
    /* @__PURE__ */ e(L, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : f ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${t ?? ""}`, children: /* @__PURE__ */ e(D, { error: f.message }) }) : /* @__PURE__ */ s("div", { className: `cedros-system-settings ${t ?? ""}`, children: [
    /* @__PURE__ */ s("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ s("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "Authentication" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure authentication providers and methods for user sign-in." })
      ] }),
      /* @__PURE__ */ e(j, { status: v, error: S })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: I.map((i) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${g === i.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => k(i.id),
        "aria-selected": g === i.id,
        role: "tab",
        children: i.label
      },
      i.id
    )) }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: a?.id === "buttonorder" ? /* @__PURE__ */ e(ee, { settings: m, handleChange: C }) : a?.isCustom ? /* @__PURE__ */ e(H, {}) : o.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ s("p", { children: [
      "No settings found for ",
      a?.label ?? "this provider",
      "."
    ] }) }) : /* @__PURE__ */ e(F, { settings: o, edits: l, onChange: C }) })
  ] });
}
export {
  ie as A
};
