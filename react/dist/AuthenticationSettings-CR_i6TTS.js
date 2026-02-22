import { jsxs as r, jsx as e } from "react/jsx-runtime";
import { useRef as F, useState as v, useCallback as A, useEffect as T, useMemo as D } from "react";
import { L as x } from "./LoadingSpinner-6vml-zwr.js";
import { E as P } from "./ErrorMessage-CcEK0pYO.js";
import { u as L, A as j, S as R } from "./AutosaveStatus-N4uNS6-2.js";
import { u as U } from "./apiClient-B2JxVPlH.js";
import { u as M } from "./useOrgs-Be3KH4ib.js";
function q() {
  const { config: n, _internal: g } = U(), m = n.serverUrl, b = F(g?.getAccessToken ?? (() => null));
  b.current = g?.getAccessToken ?? (() => null);
  const [S, w] = v([]), [f, N] = v(0), [E, c] = v(!1), [k, t] = v(null), h = A(() => {
    const d = b.current();
    return {
      "Content-Type": "application/json",
      ...d ? { Authorization: `Bearer ${d}` } : {}
    };
  }, []), p = A(
    async (d, a = 50, o = 0) => {
      c(!0), t(null);
      try {
        const i = new URLSearchParams();
        d && i.set("org_id", d), i.set("limit", String(a)), i.set("offset", String(o));
        const s = await fetch(`${m}/admin/sso-providers?${i}`, {
          headers: h()
        });
        if (!s.ok) {
          const I = await s.json().catch(() => ({}));
          throw new Error(I.error || `Failed to fetch SSO providers: ${s.status}`);
        }
        const y = await s.json();
        return w(y.providers), N(y.total), y;
      } catch (i) {
        const s = i instanceof Error ? i : new Error(String(i));
        throw t(s), s;
      } finally {
        c(!1);
      }
    },
    [m, h]
  ), l = A(
    async (d) => {
      c(!0), t(null);
      try {
        const a = await fetch(`${m}/admin/sso-providers`, {
          method: "POST",
          headers: h(),
          body: JSON.stringify(d)
        });
        if (!a.ok) {
          const i = await a.json().catch(() => ({}));
          throw new Error(i.error || `Failed to create SSO provider: ${a.status}`);
        }
        const o = await a.json();
        return w((i) => [...i, o]), N((i) => i + 1), o;
      } catch (a) {
        const o = a instanceof Error ? a : new Error(String(a));
        throw t(o), o;
      } finally {
        c(!1);
      }
    },
    [m, h]
  ), u = A(
    async (d, a) => {
      c(!0), t(null);
      try {
        const o = await fetch(`${m}/admin/sso-providers/${d}`, {
          method: "PUT",
          headers: h(),
          body: JSON.stringify(a)
        });
        if (!o.ok) {
          const s = await o.json().catch(() => ({}));
          throw new Error(s.error || `Failed to update SSO provider: ${o.status}`);
        }
        const i = await o.json();
        return w((s) => s.map((y) => y.id === d ? i : y)), i;
      } catch (o) {
        const i = o instanceof Error ? o : new Error(String(o));
        throw t(i), i;
      } finally {
        c(!1);
      }
    },
    [m, h]
  ), O = A(
    async (d) => {
      c(!0), t(null);
      try {
        const a = await fetch(`${m}/admin/sso-providers/${d}`, {
          method: "DELETE",
          headers: h()
        });
        if (!a.ok) {
          const o = await a.json().catch(() => ({}));
          throw new Error(o.error || `Failed to delete SSO provider: ${a.status}`);
        }
        w((o) => o.filter((i) => i.id !== d)), N((o) => o - 1);
      } catch (a) {
        const o = a instanceof Error ? a : new Error(String(a));
        throw t(o), o;
      } finally {
        c(!1);
      }
    },
    [m, h]
  ), C = A(
    async (d, a) => u(d, { enabled: a }),
    [u]
  );
  return {
    providers: S,
    total: f,
    isLoading: E,
    error: k,
    fetchProviders: p,
    createProvider: l,
    updateProvider: u,
    deleteProvider: O,
    toggleProvider: C
  };
}
function z({ className: n }) {
  const {
    providers: g,
    isLoading: m,
    error: b,
    fetchProviders: S,
    createProvider: w,
    updateProvider: f,
    deleteProvider: N,
    toggleProvider: E
  } = q(), { activeOrg: c } = M(), [k, t] = v("list"), [h, p] = v(null), [l, u] = v(null);
  T(() => {
    S(c?.id);
  }, [S, c?.id]);
  const O = () => {
    p(null), u(null), t("add");
  }, C = (s) => {
    p(s), u(null), t("edit");
  }, d = () => {
    t("list"), p(null), u(null);
  }, a = async (s) => {
    if (confirm(`Delete SSO provider "${s.name}"? This cannot be undone.`))
      try {
        await N(s.id);
      } catch {
      }
  }, o = async (s) => {
    try {
      await E(s.id, !s.enabled);
    } catch {
    }
  }, i = async (s) => {
    u(null);
    try {
      k === "add" ? await w(s) : h && await f(h.id, s), t("list"), p(null);
    } catch (y) {
      u(y instanceof Error ? y.message : "Failed to save provider");
    }
  };
  return m && g.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-system-settings cedros-system-settings-loading ${n ?? ""}`, children: [
    /* @__PURE__ */ e(x, {}),
    /* @__PURE__ */ e("span", { children: "Loading SSO providers..." })
  ] }) : k === "add" || k === "edit" ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${n ?? ""}`, children: /* @__PURE__ */ e(
    J,
    {
      provider: h,
      orgId: c?.id,
      error: l,
      isLoading: m,
      onSave: i,
      onCancel: d
    }
  ) }) : /* @__PURE__ */ r("div", { className: `cedros-system-settings ${n ?? ""}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ r("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "SSO Providers" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure OIDC identity providers for enterprise single sign-on." })
      ] }),
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-btn cedros-btn-primary", onClick: O, children: "Add Provider" })
    ] }),
    b && /* @__PURE__ */ e(P, { error: b.message }),
    g.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-system-settings-empty", children: [
      /* @__PURE__ */ e("p", { children: "No SSO providers configured." }),
      /* @__PURE__ */ e("p", { className: "cedros-text-muted", children: "Add an OIDC provider like Okta, Azure AD, or Auth0 to enable enterprise SSO." })
    ] }) : /* @__PURE__ */ e("div", { className: "cedros-sso-provider-list", children: g.map((s) => /* @__PURE__ */ e(
      B,
      {
        provider: s,
        onEdit: () => C(s),
        onDelete: () => a(s),
        onToggle: () => o(s)
      },
      s.id
    )) })
  ] });
}
function B({ provider: n, onEdit: g, onDelete: m, onToggle: b }) {
  return /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-sso-provider-card ${n.enabled ? "" : "cedros-sso-provider-card--disabled"}`,
      children: [
        /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-header", children: [
          /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-info", children: [
            /* @__PURE__ */ e("h3", { className: "cedros-sso-provider-card-name", children: n.name }),
            /* @__PURE__ */ e("p", { className: "cedros-sso-provider-card-issuer", children: n.issuerUrl })
          ] }),
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              role: "switch",
              "aria-checked": n.enabled,
              className: `cedros-toggle ${n.enabled ? "cedros-toggle-on" : "cedros-toggle-off"}`,
              onClick: b,
              children: [
                /* @__PURE__ */ e("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ e("span", { className: "cedros-toggle-thumb" }) }),
                /* @__PURE__ */ e("span", { className: "cedros-toggle-label", children: n.enabled ? "Enabled" : "Disabled" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-details", children: [
          /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-detail", children: [
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-label", children: "Client ID" }),
            /* @__PURE__ */ e("code", { className: "cedros-sso-provider-card-detail-value", children: n.clientId })
          ] }),
          n.emailDomain && /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-detail", children: [
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-label", children: "Email Domain" }),
            /* @__PURE__ */ r("span", { className: "cedros-sso-provider-card-detail-value", children: [
              "@",
              n.emailDomain
            ] })
          ] }),
          /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-detail", children: [
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-label", children: "Registration" }),
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-value", children: n.allowRegistration ? "Allowed" : "Existing users only" })
          ] })
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-actions", children: [
          /* @__PURE__ */ e("button", { type: "button", className: "cedros-btn cedros-btn-ghost", onClick: g, children: "Edit" }),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-btn cedros-btn-ghost cedros-btn-danger",
              onClick: m,
              children: "Delete"
            }
          )
        ] })
      ]
    }
  );
}
function J({
  provider: n,
  orgId: g,
  error: m,
  isLoading: b,
  onSave: S,
  onCancel: w
}) {
  const f = !!n, [N, E] = v(n?.name ?? ""), [c, k] = v(n?.issuerUrl ?? ""), [t, h] = v(n?.clientId ?? ""), [p, l] = v(""), [u, O] = v(n?.emailDomain ?? ""), [C, d] = v(n?.allowRegistration ?? !0), [a, o] = v(n?.enabled ?? !0), i = A(
    (s) => {
      if (s.preventDefault(), f) {
        const y = {
          name: N,
          issuerUrl: c,
          clientId: t,
          emailDomain: u || null,
          allowRegistration: C,
          enabled: a
        };
        p && (y.clientSecret = p), S(y);
      } else {
        if (!g)
          return;
        S({
          orgId: g,
          name: N,
          issuerUrl: c,
          clientId: t,
          clientSecret: p,
          emailDomain: u || null,
          allowRegistration: C,
          enabled: a
        });
      }
    },
    [
      f,
      g,
      N,
      c,
      t,
      p,
      u,
      C,
      a,
      S
    ]
  );
  return /* @__PURE__ */ r("form", { className: "cedros-sso-provider-form", onSubmit: i, children: [
    /* @__PURE__ */ e("div", { className: "cedros-settings-page-header", children: /* @__PURE__ */ r("div", { className: "cedros-settings-page-header-content", children: [
      /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: f ? "Edit SSO Provider" : "Add SSO Provider" }),
      /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure an OIDC identity provider for enterprise single sign-on." })
    ] }) }),
    m && /* @__PURE__ */ e(P, { error: m }),
    /* @__PURE__ */ r("div", { className: "cedros-form-section", children: [
      /* @__PURE__ */ r("div", { className: "cedros-form-group", children: [
        /* @__PURE__ */ e("label", { className: "cedros-form-label", htmlFor: "sso-name", children: "Provider Name" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "sso-name",
            type: "text",
            className: "cedros-form-input",
            value: N,
            onChange: (s) => E(s.target.value),
            placeholder: "e.g., Okta, Azure AD",
            required: !0
          }
        )
      ] }),
      /* @__PURE__ */ r("div", { className: "cedros-form-group", children: [
        /* @__PURE__ */ e("label", { className: "cedros-form-label", htmlFor: "sso-issuer", children: "Issuer URL" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "sso-issuer",
            type: "url",
            className: "cedros-form-input",
            value: c,
            onChange: (s) => k(s.target.value),
            placeholder: "https://your-org.okta.com",
            required: !0
          }
        ),
        /* @__PURE__ */ e("p", { className: "cedros-form-hint", children: "The OIDC issuer URL. Must support discovery at /.well-known/openid-configuration" })
      ] }),
      /* @__PURE__ */ r("div", { className: "cedros-form-group", children: [
        /* @__PURE__ */ e("label", { className: "cedros-form-label", htmlFor: "sso-client-id", children: "Client ID" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "sso-client-id",
            type: "text",
            className: "cedros-form-input",
            value: t,
            onChange: (s) => h(s.target.value),
            placeholder: "OAuth client ID",
            required: !0
          }
        )
      ] }),
      /* @__PURE__ */ r("div", { className: "cedros-form-group", children: [
        /* @__PURE__ */ r("label", { className: "cedros-form-label", htmlFor: "sso-client-secret", children: [
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
            value: p,
            onChange: (s) => l(s.target.value),
            placeholder: f ? "••••••••" : "OAuth client secret",
            required: !f
          }
        )
      ] }),
      /* @__PURE__ */ r("div", { className: "cedros-form-group", children: [
        /* @__PURE__ */ e("label", { className: "cedros-form-label", htmlFor: "sso-email-domain", children: "Email Domain (optional)" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "sso-email-domain",
            type: "text",
            className: "cedros-form-input",
            value: u,
            onChange: (s) => O(s.target.value),
            placeholder: "company.com"
          }
        ),
        /* @__PURE__ */ e("p", { className: "cedros-form-hint", children: "Restrict to users with emails from this domain" })
      ] }),
      /* @__PURE__ */ e("div", { className: "cedros-form-group", children: /* @__PURE__ */ r("label", { className: "cedros-form-checkbox", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "checkbox",
            checked: C,
            onChange: (s) => d(s.target.checked)
          }
        ),
        /* @__PURE__ */ e("span", { children: "Allow new user registration via SSO" })
      ] }) }),
      /* @__PURE__ */ e("div", { className: "cedros-form-group", children: /* @__PURE__ */ r("label", { className: "cedros-form-checkbox", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "checkbox",
            checked: a,
            onChange: (s) => o(s.target.checked)
          }
        ),
        /* @__PURE__ */ e("span", { children: "Enable this provider" })
      ] }) })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-btn cedros-btn-ghost",
          onClick: w,
          disabled: b,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e("button", { type: "submit", className: "cedros-btn cedros-btn-primary", disabled: b, children: b ? "Saving..." : f ? "Save Changes" : "Add Provider" })
    ] })
  ] });
}
const $ = [
  { id: "email", label: "Email", categories: ["auth.email"] },
  { id: "google", label: "Google", categories: ["auth.google"] },
  { id: "apple", label: "Apple", categories: ["auth.apple"] },
  { id: "solana", label: "Solana", categories: ["auth.solana"] },
  { id: "passkeys", label: "Passkeys", categories: ["auth.webauthn"] },
  { id: "instantlink", label: "Instant Link", categories: ["auth.instantlink"] },
  { id: "sso", label: "SSO Providers", categories: [], isCustom: !0 }
];
function X({ className: n }) {
  const {
    settings: g,
    edits: m,
    isLoading: b,
    autosaveStatus: S,
    autosaveError: w,
    error: f,
    fetchSettings: N,
    handleChange: E
  } = L(), [c, k] = v("email");
  T(() => {
    N();
  }, [N]);
  const t = $.find((l) => l.id === c), h = D(() => {
    if (!t) return [];
    const l = [];
    for (const u of t.categories) {
      const O = g[u] ?? [];
      l.push(...O);
    }
    return l;
  }, [g, t]), p = D(() => t?.keys ? h.filter((l) => t.keys.includes(l.key)).sort((l, u) => t.keys.indexOf(l.key) - t.keys.indexOf(u.key)) : h, [h, t]);
  return b && Object.keys(g).length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-system-settings cedros-system-settings-loading ${n ?? ""}`, children: [
    /* @__PURE__ */ e(x, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : f ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${n ?? ""}`, children: /* @__PURE__ */ e(P, { error: f.message }) }) : /* @__PURE__ */ r("div", { className: `cedros-system-settings ${n ?? ""}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ r("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "Authentication" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure authentication providers and methods for user sign-in." })
      ] }),
      /* @__PURE__ */ e(j, { status: S, error: w })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: $.map((l) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${c === l.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => k(l.id),
        "aria-selected": c === l.id,
        role: "tab",
        children: l.label
      },
      l.id
    )) }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: t?.isCustom ? /* @__PURE__ */ e(z, {}) : p.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ r("p", { children: [
      "No settings found for ",
      t?.label ?? "this provider",
      "."
    ] }) }) : /* @__PURE__ */ e(R, { settings: p, edits: m, onChange: E }) })
  ] });
}
export {
  X as A
};
