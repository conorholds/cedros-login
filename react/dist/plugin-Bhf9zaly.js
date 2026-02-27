import { jsxs as n, jsx as e } from "react/jsx-runtime";
import { useState as M, useRef as D, useEffect as C, useCallback as P, useMemo as L, createContext as z, Suspense as H, useContext as F, lazy as w } from "react";
import { C as J, L as K } from "./LoadingSpinner-6vml-zwr.js";
function Q({
  name: t,
  email: i,
  picture: s,
  onSettings: c,
  onLogout: m,
  className: A = ""
}) {
  const [h, _] = M(!1), k = D(null);
  C(() => {
    function p(y) {
      k.current && !k.current.contains(y.target) && _(!1);
    }
    if (h)
      return document.addEventListener("mousedown", p), () => document.removeEventListener("mousedown", p);
  }, [h]), C(() => {
    function p(y) {
      y.key === "Escape" && _(!1);
    }
    if (h)
      return document.addEventListener("keydown", p), () => document.removeEventListener("keydown", p);
  }, [h]);
  const I = P(() => {
    _(!1), c?.();
  }, [c]), q = P(() => {
    _(!1), m?.();
  }, [m]), x = t || "User", u = (t?.[0] || i?.[0] || "?").toUpperCase();
  return /* @__PURE__ */ n("div", { className: `cedros-profile-dropdown ${A}`, ref: k, children: [
    /* @__PURE__ */ n(
      "button",
      {
        type: "button",
        className: "cedros-profile-dropdown__trigger",
        onClick: () => _(!h),
        "aria-expanded": h,
        "aria-haspopup": "menu",
        children: [
          /* @__PURE__ */ e("div", { className: "cedros-profile-dropdown__avatar", children: s ? /* @__PURE__ */ e(
            "img",
            {
              src: s,
              alt: x,
              className: "cedros-profile-dropdown__avatar-img",
              referrerPolicy: "no-referrer"
            }
          ) : /* @__PURE__ */ e("span", { className: "cedros-profile-dropdown__avatar-placeholder", children: u }) }),
          /* @__PURE__ */ n("div", { className: "cedros-profile-dropdown__info", children: [
            /* @__PURE__ */ e("span", { className: "cedros-profile-dropdown__name", children: x }),
            i && /* @__PURE__ */ e("span", { className: "cedros-profile-dropdown__email", children: i })
          ] }),
          /* @__PURE__ */ e(
            "svg",
            {
              className: `cedros-profile-dropdown__chevron ${h ? "cedros-profile-dropdown__chevron--open" : ""}`,
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: /* @__PURE__ */ e("path", { d: "m6 9 6 6 6-6" })
            }
          )
        ]
      }
    ),
    h && /* @__PURE__ */ n("div", { className: "cedros-profile-dropdown__menu", role: "menu", children: [
      c && /* @__PURE__ */ n(
        "button",
        {
          type: "button",
          className: "cedros-profile-dropdown__item",
          onClick: I,
          role: "menuitem",
          children: [
            /* @__PURE__ */ n(
              "svg",
              {
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                children: [
                  /* @__PURE__ */ e("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
                  /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "3" })
                ]
              }
            ),
            "Settings"
          ]
        }
      ),
      m && /* @__PURE__ */ n(
        "button",
        {
          type: "button",
          className: "cedros-profile-dropdown__item cedros-profile-dropdown__item--danger",
          onClick: q,
          role: "menuitem",
          children: [
            /* @__PURE__ */ n(
              "svg",
              {
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                children: [
                  /* @__PURE__ */ e("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
                  /* @__PURE__ */ e("polyline", { points: "16 17 21 12 16 7" }),
                  /* @__PURE__ */ e("line", { x1: "21", x2: "9", y1: "12", y2: "12" })
                ]
              }
            ),
            "Log out"
          ]
        }
      )
    ] })
  ] });
}
class X {
  plugins = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  register(i) {
    this.plugins.has(i.id) && console.warn(`Plugin ${i.id} already registered, replacing...`), this.plugins.set(i.id, i), i.onRegister?.(this), this.notify();
  }
  unregister(i) {
    const s = this.plugins.get(i);
    s && (s.onUnregister?.(), this.plugins.delete(i), this.notify());
  }
  get(i) {
    return this.plugins.get(i);
  }
  getAll() {
    return Array.from(this.plugins.values());
  }
  subscribe(i) {
    return this.listeners.add(i), () => this.listeners.delete(i);
  }
  notify() {
    const i = this.getAll();
    this.listeners.forEach((s) => s(i));
  }
}
const O = z(null);
function pe() {
  const t = F(O);
  if (!t) throw new Error("useAdminShell must be used within AdminShell");
  return t;
}
function Y(t) {
  const i = /* @__PURE__ */ new Map();
  for (const s of t)
    for (const c of s.groups ?? [])
      i.has(c.label) || i.set(c.label, c.order);
  return i;
}
function ve({
  title: t = "Admin",
  plugins: i = [],
  hostContext: s,
  defaultSection: c,
  pageSize: m = 20,
  refreshInterval: A = 0,
  onSectionChange: h,
  logo: _,
  sidebarFooter: k,
  onSettingsClick: I,
  onLogoutClick: q,
  className: x = ""
}) {
  const [u] = M(() => {
    const r = new X();
    return i.forEach((o) => r.register(o)), r;
  }), [p, y] = M(
    () => u.getAll()
  );
  C(() => u.subscribe(y), [u]);
  const b = L(() => p.flatMap(
    (r) => r.sections.filter((o) => !(o.requiredPermission && !r.checkPermission(o.requiredPermission, s) || s.dashboardPermissions && !s.dashboardPermissions.canAccess(o.id))).map(
      (o) => ({
        ...o,
        qualifiedId: `${r.id}:${o.id}`,
        pluginId: r.id,
        cssNamespace: r.cssNamespace
      })
    )
  ), [p, s]), [v, U] = M(
    () => c ?? b[0]?.qualifiedId ?? null
  ), [V, R] = M(/* @__PURE__ */ new Set()), T = P((r) => {
    R((o) => {
      const d = new Set(o);
      return d.has(r) ? d.delete(r) : d.add(r), d;
    });
  }, []);
  C(() => {
    v && !b.find((r) => r.qualifiedId === v) && U(b[0]?.qualifiedId ?? null);
  }, [b, v]);
  const E = P(
    (r) => {
      U(r), h?.(r);
    },
    [h]
  ), W = P(
    (r) => {
      const o = u.get(r);
      return o ? o.createPluginContext(s) : null;
    },
    [u, s]
  ), $ = L(() => {
    const r = Y(p), o = /* @__PURE__ */ new Map();
    return b.forEach((g) => {
      const a = g.group ?? "Menu", S = o.get(a) ?? [];
      o.set(a, [...S, g]);
    }), Array.from(o.entries()).sort(([g], [a]) => {
      const S = r.get(g) ?? 99, G = r.get(a) ?? 99;
      return S - G;
    });
  }, [b, p]), N = L(() => {
    if (!v) return null;
    const [r, o] = v.split(":"), d = u.get(r);
    if (!d) return null;
    const g = d.components[o];
    if (!g) return null;
    const a = d.createPluginContext(s);
    return { Component: g, pluginContext: a, plugin: d };
  }, [v, u, s]), j = L(
    () => ({
      registry: u,
      hostContext: s,
      activeSection: v,
      setActiveSection: E,
      getPluginContext: W
    }),
    [u, s, v, E, W]
  ), B = L(() => {
    const r = s.cedrosLogin;
    if (!r) return null;
    const o = r.user ? { authMethods: [], emailVerified: !1, createdAt: "", updatedAt: "", ...r.user } : null;
    return {
      config: { serverUrl: r.serverUrl },
      user: o,
      authState: r.user ? "authenticated" : "unauthenticated",
      error: null,
      logout: async () => {
      },
      refreshUser: async () => {
      },
      isModalOpen: !1,
      openModal: () => {
      },
      closeModal: () => {
      },
      _internal: {
        handleLoginSuccess: () => {
        },
        getAccessToken: r.getAccessToken
      }
    };
  }, [s.cedrosLogin]);
  return /* @__PURE__ */ e(O.Provider, { value: j, children: /* @__PURE__ */ e(J.Provider, { value: B, children: /* @__PURE__ */ n("div", { className: `cedros-admin cedros-admin-shell ${x || ""}`, children: [
    /* @__PURE__ */ n("aside", { className: "cedros-admin-shell__sidebar", children: [
      /* @__PURE__ */ e("div", { className: "cedros-admin-shell__sidebar-header", children: _ ?? /* @__PURE__ */ e("div", { className: "cedros-admin-shell__logo", children: /* @__PURE__ */ e("span", { className: "cedros-admin-shell__logo-text", children: t }) }) }),
      /* @__PURE__ */ e("nav", { className: "cedros-admin-shell__nav", children: $.map(([r, o]) => {
        const d = r === "Configuration", g = V.has(r);
        return /* @__PURE__ */ n("div", { className: "cedros-admin-shell__nav-group", children: [
          d ? /* @__PURE__ */ n(
            "button",
            {
              type: "button",
              className: "cedros-admin-shell__nav-label cedros-admin-shell__nav-label--collapsible",
              onClick: () => T(r),
              "aria-expanded": !g,
              children: [
                /* @__PURE__ */ e("span", { children: r }),
                /* @__PURE__ */ e(
                  "span",
                  {
                    className: `cedros-admin-shell__nav-chevron ${g ? "" : "cedros-admin-shell__nav-chevron--expanded"}`,
                    children: /* @__PURE__ */ e(
                      "svg",
                      {
                        width: "16",
                        height: "16",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "2",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        children: /* @__PURE__ */ e("path", { d: "m9 18 6-6-6-6" })
                      }
                    )
                  }
                )
              ]
            }
          ) : /* @__PURE__ */ e("span", { className: "cedros-admin-shell__nav-label", children: r }),
          (!d || !g) && o.sort((a, S) => (a.order ?? 0) - (S.order ?? 0)).map((a) => /* @__PURE__ */ n(
            "button",
            {
              type: "button",
              className: `cedros-admin-shell__nav-item ${v === a.qualifiedId ? "cedros-admin-shell__nav-item--active" : ""}`,
              onClick: () => E(a.qualifiedId),
              "aria-current": v === a.qualifiedId ? "page" : void 0,
              children: [
                /* @__PURE__ */ e("span", { className: "cedros-admin-shell__nav-icon", children: a.icon }),
                /* @__PURE__ */ e("span", { className: "cedros-admin-shell__nav-text", children: a.label }),
                a.badge && /* @__PURE__ */ e("span", { className: "cedros-admin-shell__nav-badge", children: a.badge })
              ]
            },
            a.qualifiedId
          ))
        ] }, r);
      }) }),
      (s.cedrosLogin?.user || k) && /* @__PURE__ */ n("div", { className: "cedros-admin-shell__sidebar-footer", children: [
        s.cedrosLogin?.user && /* @__PURE__ */ e(
          Q,
          {
            name: s.cedrosLogin.user.name,
            email: s.cedrosLogin.user.email,
            picture: s.cedrosLogin.user.picture,
            onSettings: I,
            onLogout: q
          }
        ),
        k
      ] })
    ] }),
    /* @__PURE__ */ e("main", { className: "cedros-admin-shell__main", children: N ? /* @__PURE__ */ e(H, { fallback: /* @__PURE__ */ e(Z, {}), children: /* @__PURE__ */ e(
      "div",
      {
        className: "cedros-admin-shell__section",
        "data-plugin-namespace": N.plugin.cssNamespace,
        children: /* @__PURE__ */ e(
          N.Component,
          {
            pluginContext: N.pluginContext,
            pageSize: m,
            refreshInterval: A
          }
        )
      }
    ) }) : /* @__PURE__ */ e("div", { className: "cedros-admin-shell__empty", children: b.length === 0 ? "No plugins loaded" : "Select a section from the sidebar" }) })
  ] }) }) });
}
function Z() {
  return /* @__PURE__ */ n("div", { className: "cedros-admin-shell__loading", children: [
    /* @__PURE__ */ e(K, {}),
    /* @__PURE__ */ e("span", { children: "Loading..." })
  ] });
}
const l = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, f = {
  users: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ e("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ e("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ e("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] }),
  members: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ e("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ e("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ e("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] }),
  invites: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
    /* @__PURE__ */ e("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
  ] }),
  deposits: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ e("path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" }),
    /* @__PURE__ */ e("path", { d: "M12 18V6" })
  ] }),
  withdrawals: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2" }),
    /* @__PURE__ */ e("path", { d: "M9 22v-4h6v4" }),
    /* @__PURE__ */ e("path", { d: "M8 6h.01" }),
    /* @__PURE__ */ e("path", { d: "M16 6h.01" }),
    /* @__PURE__ */ e("path", { d: "M12 6h.01" }),
    /* @__PURE__ */ e("path", { d: "M12 10h.01" }),
    /* @__PURE__ */ e("path", { d: "M12 14h.01" }),
    /* @__PURE__ */ e("path", { d: "M16 10h.01" }),
    /* @__PURE__ */ e("path", { d: "M16 14h.01" }),
    /* @__PURE__ */ e("path", { d: "M8 10h.01" }),
    /* @__PURE__ */ e("path", { d: "M8 14h.01" })
  ] }),
  settings: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
    /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "3" })
  ] }),
  wallet: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }),
    /* @__PURE__ */ e("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" })
  ] }),
  chevronRight: /* @__PURE__ */ e("svg", { ...l, children: /* @__PURE__ */ e("path", { d: "m9 18 6-6-6-6" }) }),
  // Settings sub-page icons
  key: /* @__PURE__ */ e("svg", { ...l, children: /* @__PURE__ */ e("path", { d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" }) }),
  toggles: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("rect", { width: "20", height: "12", x: "2", y: "6", rx: "6" }),
    /* @__PURE__ */ e("circle", { cx: "8", cy: "12", r: "2" })
  ] }),
  shield: /* @__PURE__ */ e("svg", { ...l, children: /* @__PURE__ */ e("path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }) }),
  mail: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
    /* @__PURE__ */ e("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
  ] }),
  webhook: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("path", { d: "M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" }),
    /* @__PURE__ */ e("path", { d: "m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" }),
    /* @__PURE__ */ e("path", { d: "m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" })
  ] }),
  coins: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "6" }),
    /* @__PURE__ */ e("path", { d: "M18.09 10.37A6 6 0 1 1 10.34 18" }),
    /* @__PURE__ */ e("path", { d: "M7 6h1v4" }),
    /* @__PURE__ */ e("path", { d: "m16.71 13.88.7.71-2.82 2.82" })
  ] }),
  server: /* @__PURE__ */ n("svg", { ...l, children: [
    /* @__PURE__ */ e("rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2" }),
    /* @__PURE__ */ e("rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2" }),
    /* @__PURE__ */ e("line", { x1: "6", x2: "6.01", y1: "6", y2: "6" }),
    /* @__PURE__ */ e("line", { x1: "6", x2: "6.01", y1: "18", y2: "18" })
  ] })
}, ee = w(() => import("./UsersSection-t-zm0jZW.js")), re = w(() => import("./TeamSection-BIECkp7g.js")), se = w(() => import("./DepositsSection-DD9MKUFt.js")), ie = w(() => import("./WithdrawalsSection-yRDTVFsb.js")), ne = w(() => import("./AuthenticationSettings-Cfn0No6U.js")), oe = w(() => import("./EmbeddedWalletSettings-CLWh2TbV.js")), te = w(() => import("./EmailSettings-ulEHtH2y.js")), ae = w(() => import("./WebhookSettings-B6mjH90_.js")), le = w(() => import("./CreditSystemSettings-D13lZbIw.js")), de = w(() => import("./ServerSettings-DooVeOet.js")), ce = {
  "login:users:read": ["admin", "owner"],
  "login:users:write": ["admin", "owner"],
  "login:members:read": ["member:read", "admin", "owner"],
  "login:members:write": ["member:remove", "member:role_change"],
  "login:invites:read": ["invite:read", "admin", "owner"],
  "login:invites:write": ["invite:create", "invite:cancel"],
  "login:deposits:read": ["admin", "owner"],
  "login:deposits:write": ["admin", "owner"],
  "login:settings:read": ["admin", "owner"],
  "login:settings:write": ["admin", "owner"]
}, he = [
  // Users group (main sections)
  {
    id: "users",
    label: "Users",
    icon: f.users,
    group: "Users",
    order: 0,
    requiredPermission: "login:users:read"
  },
  {
    id: "team",
    label: "Team",
    icon: f.members,
    group: "Users",
    order: 1,
    requiredPermission: "login:members:read"
  },
  {
    id: "deposits",
    label: "Deposits",
    icon: f.deposits,
    group: "Users",
    order: 2,
    requiredPermission: "login:deposits:read"
  },
  {
    id: "withdrawals",
    label: "Withdrawals",
    icon: f.withdrawals,
    group: "Users",
    order: 3,
    requiredPermission: "login:deposits:read"
  },
  // Configuration group (settings sections)
  {
    id: "settings-auth",
    label: "Authentication",
    icon: f.key,
    group: "Configuration",
    order: 0,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-email",
    label: "Email & SMTP",
    icon: f.mail,
    group: "Configuration",
    order: 1,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-webhooks",
    label: "Webhooks",
    icon: f.webhook,
    group: "Configuration",
    order: 2,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-wallet",
    label: "User Wallets",
    icon: f.wallet,
    group: "Configuration",
    order: 3,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-credits",
    label: "Credit System",
    icon: f.coins,
    group: "Configuration",
    order: 4,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-server",
    label: "Auth Server",
    icon: f.server,
    group: "Configuration",
    order: 5,
    requiredPermission: "login:settings:read"
  }
], fe = {
  id: "cedros-login",
  name: "Cedros Login",
  version: "1.0.0",
  sections: he,
  groups: [
    { id: "users", label: "Users", order: 0 },
    { id: "configuration", label: "Configuration", order: 2 }
  ],
  components: {
    users: ee,
    team: re,
    deposits: se,
    withdrawals: ie,
    "settings-auth": ne,
    "settings-wallet": oe,
    "settings-email": te,
    "settings-webhooks": ae,
    "settings-credits": le,
    "settings-server": de
  },
  createPluginContext(t) {
    const i = t.cedrosLogin;
    if (!i)
      throw new Error("cedros-login plugin requires cedrosLogin in hostContext");
    return {
      serverUrl: i.serverUrl,
      userId: i.user?.id,
      getAccessToken: i.getAccessToken,
      hasPermission: (s) => this.checkPermission(s, t),
      orgId: t.org?.orgId,
      pluginData: {
        user: i.user,
        orgRole: t.org?.role
      }
    };
  },
  checkPermission(t, i) {
    const s = i.org;
    if (!s)
      return !!i.cedrosLogin?.user;
    const c = ce[t];
    return c ? c.some(
      (m) => s.permissions.includes(m) || m === s.role || m === "admin" && ["admin", "owner"].includes(s.role) || m === "owner" && s.role === "owner"
    ) : !1;
  },
  cssNamespace: "cedros-dashboard"
}, we = {
  users: "users",
  team: "team",
  deposits: "deposits",
  withdrawals: "withdrawals",
  settingsAuth: "settings-auth",
  settingsEmail: "settings-email",
  settingsWebhooks: "settings-webhooks",
  settingsWallet: "settings-wallet",
  settingsCredits: "settings-credits",
  settingsServer: "settings-server"
};
export {
  ve as A,
  we as C,
  f as I,
  Q as P,
  fe as c,
  pe as u
};
