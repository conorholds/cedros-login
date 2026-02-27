import { jsxs as r, jsx as e } from "react/jsx-runtime";
import { useRef as I, useState as v, useCallback as O, useEffect as $, useMemo as P } from "react";
import { L as T } from "./LoadingSpinner-6vml-zwr.js";
import { E as A } from "./ErrorMessage-CcEK0pYO.js";
import { u as F, A as L, S as j } from "./AutosaveStatus-BKc7T2Tw.js";
import { u as R } from "./useCedrosLogin-_94MmGGq.js";
import { u as U } from "./useOrgs-C3pzMA9h.js";
function q() {
  const { config: o, _internal: g } = R(), h = o.serverUrl, b = I(g?.getAccessToken ?? (() => null));
  b.current = g?.getAccessToken ?? (() => null);
  const [S, k] = v([]), [f, y] = v(0), [C, c] = v(!1), [w, t] = v(null), m = O(() => {
    const d = b.current();
    return {
      "Content-Type": "application/json",
      ...d ? { Authorization: `Bearer ${d}` } : {}
    };
  }, []), p = O(
    async (d, a = 50, n = 0) => {
      c(!0), t(null);
      try {
        const i = new URLSearchParams();
        d && i.set("org_id", d), i.set("limit", String(a)), i.set("offset", String(n));
        const s = await fetch(`${h}/admin/sso-providers?${i}`, {
          headers: m()
        });
        if (!s.ok) {
          const x = await s.json().catch(() => ({}));
          throw new Error(x.error || `Failed to fetch SSO providers: ${s.status}`);
        }
        const N = await s.json();
        return k(N.providers), y(N.total), N;
      } catch (i) {
        const s = i instanceof Error ? i : new Error(String(i));
        throw t(s), s;
      } finally {
        c(!1);
      }
    },
    [h, m]
  ), l = O(
    async (d) => {
      c(!0), t(null);
      try {
        const a = await fetch(`${h}/admin/sso-providers`, {
          method: "POST",
          headers: m(),
          body: JSON.stringify(d)
        });
        if (!a.ok) {
          const i = await a.json().catch(() => ({}));
          throw new Error(i.error || `Failed to create SSO provider: ${a.status}`);
        }
        const n = await a.json();
        return k((i) => [...i, n]), y((i) => i + 1), n;
      } catch (a) {
        const n = a instanceof Error ? a : new Error(String(a));
        throw t(n), n;
      } finally {
        c(!1);
      }
    },
    [h, m]
  ), u = O(
    async (d, a) => {
      c(!0), t(null);
      try {
        const n = await fetch(`${h}/admin/sso-providers/${d}`, {
          method: "PUT",
          headers: m(),
          body: JSON.stringify(a)
        });
        if (!n.ok) {
          const s = await n.json().catch(() => ({}));
          throw new Error(s.error || `Failed to update SSO provider: ${n.status}`);
        }
        const i = await n.json();
        return k((s) => s.map((N) => N.id === d ? i : N)), i;
      } catch (n) {
        const i = n instanceof Error ? n : new Error(String(n));
        throw t(i), i;
      } finally {
        c(!1);
      }
    },
    [h, m]
  ), E = O(
    async (d) => {
      c(!0), t(null);
      try {
        const a = await fetch(`${h}/admin/sso-providers/${d}`, {
          method: "DELETE",
          headers: m()
        });
        if (!a.ok) {
          const n = await a.json().catch(() => ({}));
          throw new Error(n.error || `Failed to delete SSO provider: ${a.status}`);
        }
        k((n) => n.filter((i) => i.id !== d)), y((n) => n - 1);
      } catch (a) {
        const n = a instanceof Error ? a : new Error(String(a));
        throw t(n), n;
      } finally {
        c(!1);
      }
    },
    [h, m]
  ), _ = O(
    async (d, a) => u(d, { enabled: a }),
    [u]
  );
  return {
    providers: S,
    total: f,
    isLoading: C,
    error: w,
    fetchProviders: p,
    createProvider: l,
    updateProvider: u,
    deleteProvider: E,
    toggleProvider: _
  };
}
function M({ className: o }) {
  const {
    providers: g,
    isLoading: h,
    error: b,
    fetchProviders: S,
    createProvider: k,
    updateProvider: f,
    deleteProvider: y,
    toggleProvider: C
  } = q(), { activeOrg: c } = U(), [w, t] = v("list"), [m, p] = v(null), [l, u] = v(null);
  $(() => {
    S(c?.id);
  }, [S, c?.id]);
  const E = () => {
    p(null), u(null), t("add");
  }, _ = (s) => {
    p(s), u(null), t("edit");
  }, d = () => {
    t("list"), p(null), u(null);
  }, a = async (s) => {
    if (confirm(`Delete SSO provider "${s.name}"? This cannot be undone.`))
      try {
        await y(s.id);
      } catch {
      }
  }, n = async (s) => {
    try {
      await C(s.id, !s.enabled);
    } catch {
    }
  }, i = async (s) => {
    u(null);
    try {
      w === "add" ? await k(s) : m && await f(m.id, s), t("list"), p(null);
    } catch (N) {
      u(N instanceof Error ? N.message : "Failed to save provider");
    }
  };
  return h && g.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-system-settings cedros-system-settings-loading ${o ?? ""}`, children: [
    /* @__PURE__ */ e(T, {}),
    /* @__PURE__ */ e("span", { children: "Loading SSO providers..." })
  ] }) : w === "add" || w === "edit" ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${o ?? ""}`, children: /* @__PURE__ */ e(
    B,
    {
      provider: m,
      orgId: c?.id,
      error: l,
      isLoading: h,
      onSave: i,
      onCancel: d
    }
  ) }) : /* @__PURE__ */ r("div", { className: `cedros-system-settings ${o ?? ""}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ r("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "SSO Providers" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure OIDC identity providers for enterprise single sign-on." })
      ] }),
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-btn cedros-btn-primary", onClick: E, children: "Add Provider" })
    ] }),
    b && /* @__PURE__ */ e(A, { error: b.message }),
    g.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-system-settings-empty", children: [
      /* @__PURE__ */ e("p", { children: "No SSO providers configured." }),
      /* @__PURE__ */ e("p", { className: "cedros-text-muted", children: "Add an OIDC provider like Okta, Azure AD, or Auth0 to enable enterprise SSO." })
    ] }) : /* @__PURE__ */ e("div", { className: "cedros-sso-provider-list", children: g.map((s) => /* @__PURE__ */ e(
      z,
      {
        provider: s,
        onEdit: () => _(s),
        onDelete: () => a(s),
        onToggle: () => n(s)
      },
      s.id
    )) })
  ] });
}
function z({ provider: o, onEdit: g, onDelete: h, onToggle: b }) {
  return /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-sso-provider-card ${o.enabled ? "" : "cedros-sso-provider-card--disabled"}`,
      children: [
        /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-header", children: [
          /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-info", children: [
            /* @__PURE__ */ e("h3", { className: "cedros-sso-provider-card-name", children: o.name }),
            /* @__PURE__ */ e("p", { className: "cedros-sso-provider-card-issuer", children: o.issuerUrl })
          ] }),
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              role: "switch",
              "aria-checked": o.enabled,
              className: `cedros-toggle ${o.enabled ? "cedros-toggle-on" : "cedros-toggle-off"}`,
              onClick: b,
              children: [
                /* @__PURE__ */ e("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ e("span", { className: "cedros-toggle-thumb" }) }),
                /* @__PURE__ */ e("span", { className: "cedros-toggle-label", children: o.enabled ? "Enabled" : "Disabled" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-details", children: [
          /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-detail", children: [
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-label", children: "Client ID" }),
            /* @__PURE__ */ e("code", { className: "cedros-sso-provider-card-detail-value", children: o.clientId })
          ] }),
          o.emailDomain && /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-detail", children: [
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-label", children: "Email Domain" }),
            /* @__PURE__ */ r("span", { className: "cedros-sso-provider-card-detail-value", children: [
              "@",
              o.emailDomain
            ] })
          ] }),
          /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-detail", children: [
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-label", children: "Registration" }),
            /* @__PURE__ */ e("span", { className: "cedros-sso-provider-card-detail-value", children: o.allowRegistration ? "Allowed" : "Existing users only" })
          ] })
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-sso-provider-card-actions", children: [
          /* @__PURE__ */ e("button", { type: "button", className: "cedros-btn cedros-btn-ghost", onClick: g, children: "Edit" }),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-btn cedros-btn-ghost cedros-btn-danger",
              onClick: h,
              children: "Delete"
            }
          )
        ] })
      ]
    }
  );
}
function B({
  provider: o,
  orgId: g,
  error: h,
  isLoading: b,
  onSave: S,
  onCancel: k
}) {
  const f = !!o, [y, C] = v(o?.name ?? ""), [c, w] = v(o?.issuerUrl ?? ""), [t, m] = v(o?.clientId ?? ""), [p, l] = v(""), [u, E] = v(o?.emailDomain ?? ""), [_, d] = v(o?.allowRegistration ?? !0), [a, n] = v(o?.enabled ?? !0), i = O(
    (s) => {
      if (s.preventDefault(), f) {
        const N = {
          name: y,
          issuerUrl: c,
          clientId: t,
          emailDomain: u || null,
          allowRegistration: _,
          enabled: a
        };
        p && (N.clientSecret = p), S(N);
      } else {
        if (!g)
          return;
        S({
          orgId: g,
          name: y,
          issuerUrl: c,
          clientId: t,
          clientSecret: p,
          emailDomain: u || null,
          allowRegistration: _,
          enabled: a
        });
      }
    },
    [
      f,
      g,
      y,
      c,
      t,
      p,
      u,
      _,
      a,
      S
    ]
  );
  return /* @__PURE__ */ r("form", { className: "cedros-sso-provider-form", onSubmit: i, children: [
    /* @__PURE__ */ e("div", { className: "cedros-settings-page-header", children: /* @__PURE__ */ r("div", { className: "cedros-settings-page-header-content", children: [
      /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: f ? "Edit SSO Provider" : "Add SSO Provider" }),
      /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure an OIDC identity provider for enterprise single sign-on." })
    ] }) }),
    h && /* @__PURE__ */ e(A, { error: h }),
    /* @__PURE__ */ r("div", { className: "cedros-form-section", children: [
      /* @__PURE__ */ r("div", { className: "cedros-form-group", children: [
        /* @__PURE__ */ e("label", { className: "cedros-form-label", htmlFor: "sso-name", children: "Provider Name" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "sso-name",
            type: "text",
            className: "cedros-form-input",
            value: y,
            onChange: (s) => C(s.target.value),
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
            onChange: (s) => w(s.target.value),
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
            onChange: (s) => m(s.target.value),
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
            onChange: (s) => E(s.target.value),
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
            checked: _,
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
            onChange: (s) => n(s.target.checked)
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
          onClick: k,
          disabled: b,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e("button", { type: "submit", className: "cedros-btn cedros-btn-primary", disabled: b, children: b ? "Saving..." : f ? "Save Changes" : "Add Provider" })
    ] })
  ] });
}
const D = [
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
  { id: "sso", label: "SSO Providers", categories: [], isCustom: !0 }
];
function X({ className: o }) {
  const {
    settings: g,
    edits: h,
    isLoading: b,
    autosaveStatus: S,
    autosaveError: k,
    error: f,
    fetchSettings: y,
    handleChange: C
  } = F(), [c, w] = v("email");
  $(() => {
    y();
  }, [y]);
  const t = D.find((l) => l.id === c), m = P(() => {
    if (!t) return [];
    const l = [];
    for (const u of t.categories) {
      const E = g[u] ?? [];
      l.push(...E);
    }
    return l;
  }, [g, t]), p = P(() => t?.keys ? m.filter((l) => t.keys.includes(l.key)).sort((l, u) => t.keys.indexOf(l.key) - t.keys.indexOf(u.key)) : m, [m, t]);
  return b && Object.keys(g).length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-system-settings cedros-system-settings-loading ${o ?? ""}`, children: [
    /* @__PURE__ */ e(T, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : f ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${o ?? ""}`, children: /* @__PURE__ */ e(A, { error: f.message }) }) : /* @__PURE__ */ r("div", { className: `cedros-system-settings ${o ?? ""}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ r("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "Authentication" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure authentication providers and methods for user sign-in." })
      ] }),
      /* @__PURE__ */ e(L, { status: S, error: k })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: D.map((l) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${c === l.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => w(l.id),
        "aria-selected": c === l.id,
        role: "tab",
        children: l.label
      },
      l.id
    )) }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: t?.isCustom ? /* @__PURE__ */ e(M, {}) : p.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ r("p", { children: [
      "No settings found for ",
      t?.label ?? "this provider",
      "."
    ] }) }) : /* @__PURE__ */ e(j, { settings: p, edits: h, onChange: C }) })
  ] });
}
export {
  X as A
};
