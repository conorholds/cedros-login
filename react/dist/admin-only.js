import { jsxs as a, jsx as r, Fragment as H } from "react/jsx-runtime";
import { Suspense as Z, useState as N, useRef as J, useCallback as q, useEffect as L, useMemo as S, createContext as X, lazy as Y } from "react";
import { C as ee } from "./EmailRegisterForm-DrtZJXIS.js";
import { u as ie, a as re, S as ne } from "./useOrgs-PRReHJVn.js";
import { N as se } from "./NonWalletLoginForm-BU6Iz0YF.js";
import { u as te, E as O } from "./ErrorMessage-DObd7075.js";
function oe({ title: i, logo: e, profileMenu: n, sidebarFooter: s, groupedSections: t, groupConfigs: o, activeSection: c, collapsedGroups: l, onToggleGroup: m, onSelectSection: w }) {
  return a("aside", { className: "cedros-admin-shell__sidebar", children: [r("div", { className: "cedros-admin-shell__sidebar-header", children: e ?? r("div", { className: "cedros-admin-shell__logo", children: r("span", { className: "cedros-admin-shell__logo-text", children: i }) }) }), r("nav", { className: "cedros-admin-shell__nav", children: t.map(([f, b]) => r(ce, { groupName: f, sections: b, groupConfig: o.get(f), activeSection: c, isCollapsed: l.has(f), onToggleGroup: m, onSelectSection: w }, f)) }), (n || s) && a("div", { className: "cedros-admin-shell__sidebar-footer", children: [n, s] })] });
}
function ae({ allSections: i, hasRegisteredPlugins: e, currentSection: n, hostContext: s, activeSection: t, pageSize: o, refreshInterval: c, loadingFallback: l, sectionWrappers: m }) {
  return r("main", { className: "cedros-admin-shell__main", children: n ? me(r(Z, { fallback: l ?? r(he, {}), children: r("div", { className: "cedros-admin-shell__section", "data-plugin-namespace": n.plugin.cssNamespace, children: r(n.Component, { pluginContext: n.pluginContext, pageSize: o, refreshInterval: c }) }) }), m, s, t, n) : r("div", { className: "cedros-admin-shell__empty", children: pe(i, e) }) });
}
function ce({ groupName: i, sections: e, groupConfig: n, activeSection: s, isCollapsed: t, onToggleGroup: o, onSelectSection: c }) {
  const l = ge(i, n);
  return a("div", { className: "cedros-admin-shell__nav-group", children: [r(de, { groupName: i, collapsible: l, isCollapsed: t, onToggleGroup: o }), (!l || !t) && e.map((m) => r(le, { section: m, activeSection: s, onSelectSection: c }, m.qualifiedId))] });
}
function de({ groupName: i, collapsible: e, isCollapsed: n, onToggleGroup: s }) {
  return e ? a("button", { type: "button", className: "cedros-admin-shell__nav-label cedros-admin-shell__nav-label--collapsible", onClick: () => s(i), "aria-expanded": !n, children: [r("span", { children: i }), r("span", { className: V("cedros-admin-shell__nav-chevron", n ? void 0 : "cedros-admin-shell__nav-chevron--expanded"), children: r("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: r("path", { d: "m9 18 6-6-6-6" }) }) })] }) : r("span", { className: "cedros-admin-shell__nav-label", children: i });
}
function le({ section: i, activeSection: e, onSelectSection: n }) {
  return a("button", { type: "button", className: V("cedros-admin-shell__nav-item", e === i.qualifiedId ? "cedros-admin-shell__nav-item--active" : void 0), onClick: () => n(i.qualifiedId), "aria-current": e === i.qualifiedId ? "page" : void 0, children: [r("span", { className: "cedros-admin-shell__nav-icon", children: ue(i.icon) }), r("span", { className: "cedros-admin-shell__nav-text", children: i.label }), i.badge && r("span", { className: "cedros-admin-shell__nav-badge", children: i.badge })] });
}
function ue(i) {
  return typeof i == "function" ? i() : i;
}
function ge(i, e) {
  return i === "Configuration" || e?.defaultCollapsed !== void 0;
}
function V(...i) {
  return i.filter(Boolean).join(" ");
}
function me(i, e, n, s, t) {
  return e.reduceRight((o, c) => r(c, { hostContext: n, activeSection: s, currentPlugin: t.plugin, currentSection: t.section, pluginContext: t.pluginContext, children: o }), i);
}
function pe(i, e) {
  return i.length === 0 ? e ? "No sections available" : "No plugins loaded" : "Select a section from the sidebar";
}
function he() {
  return a("div", { className: "cedros-admin-shell__loading", children: [r("span", { className: "cedros-admin-shell__loading-spinner", "aria-hidden": "true" }), r("span", { children: "Loading..." })] });
}
const d = {
  adminProfile: "admin-profile",
  adminSectionAccess: "admin-section-access",
  cedrosLogin: "cedros-login",
  cedrosPay: "cedros-pay",
  org: "org",
  dashboardPermissions: "dashboard-permissions"
};
function fe(i = {}) {
  return { ...i };
}
function ve(i) {
  const e = fe(i.services);
  return !(d.adminProfile in e) && i.cedrosLogin?.user && (e[d.adminProfile] = {
    user: i.cedrosLogin.user
  }), !(d.adminSectionAccess in e) && i.dashboardPermissions && (e[d.adminSectionAccess] = i.dashboardPermissions), !(d.cedrosLogin in e) && i.cedrosLogin && (e[d.cedrosLogin] = i.cedrosLogin), !(d.cedrosPay in e) && i.cedrosPay && (e[d.cedrosPay] = i.cedrosPay), !(d.org in e) && i.org && (e[d.org] = i.org), !(d.dashboardPermissions in e) && i.dashboardPermissions && (e[d.dashboardPermissions] = i.dashboardPermissions), e;
}
function P(i, e) {
  return Se(ve(i), e);
}
function Se(i, e) {
  return i[e];
}
function we(i) {
  const e = P(i, d.adminProfile);
  if (e?.getProfile)
    return e.getProfile();
  if (e?.profile)
    return e.profile;
  if (e?.user)
    return {
      email: e.user.email,
      name: e.user.name,
      picture: e.user.picture
    };
  const n = P(i, d.cedrosLogin)?.user;
  return n ? {
    email: n.email,
    name: n.name,
    picture: n.picture
  } : null;
}
function be(i, e) {
  const n = P(i, d.adminSectionAccess);
  return n ? n.canAccess(e) : P(i, d.dashboardPermissions)?.canAccess(e) ?? !0;
}
class ye {
  plugins = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  register(e) {
    this.plugins.set(e.id, e), this.notify();
  }
  unregister(e) {
    this.plugins.has(e) && (this.plugins.delete(e), this.notify());
  }
  get(e) {
    return this.plugins.get(e);
  }
  getAll() {
    return Array.from(this.plugins.values());
  }
  subscribe(e) {
    return this.listeners.add(e), () => this.listeners.delete(e);
  }
  notify() {
    const e = this.getAll();
    this.listeners.forEach((n) => n(e));
  }
}
function _e(i = []) {
  const e = new ye();
  return i.forEach((n) => e.register(n)), e;
}
function Pe({ name: i, email: e, picture: n, onSettings: s, onLogout: t, className: o = "" }) {
  const [c, l] = N(!1), m = J(null), w = i || "User", f = (i?.[0] || e?.[0] || "?").toUpperCase();
  ke({
    dropdownRef: m,
    isOpen: c,
    onClose: () => l(!1)
  });
  const b = q(() => {
    l(!1), s?.();
  }, [s]), C = q(() => {
    l(!1), t?.();
  }, [t]);
  return a("div", { className: `cedros-profile-dropdown ${o}`.trim(), ref: m, children: [r(Ae, { displayName: w, email: e, picture: n, initial: f, isOpen: c, onToggle: () => l((M) => !M) }), c && r(Ce, { onSettings: b, onLogout: C })] });
}
function ke({ dropdownRef: i, isOpen: e, onClose: n }) {
  L(() => {
    if (!e)
      return;
    function s(t) {
      i.current && !i.current.contains(t.target) && n();
    }
    return document.addEventListener("mousedown", s), () => document.removeEventListener("mousedown", s);
  }, [i, e, n]), L(() => {
    if (!e)
      return;
    function s(t) {
      t.key === "Escape" && n();
    }
    return document.addEventListener("keydown", s), () => document.removeEventListener("keydown", s);
  }, [e, n]);
}
function Ae({ displayName: i, email: e, picture: n, initial: s, isOpen: t, onToggle: o }) {
  return a("button", { type: "button", className: "cedros-profile-dropdown__trigger", onClick: o, "aria-expanded": t, "aria-haspopup": "menu", children: [r("div", { className: "cedros-profile-dropdown__avatar", children: n ? r("img", { src: n, alt: i, className: "cedros-profile-dropdown__avatar-img", referrerPolicy: "no-referrer" }) : r("span", { className: "cedros-profile-dropdown__avatar-placeholder", children: s }) }), a("div", { className: "cedros-profile-dropdown__info", children: [r("span", { className: "cedros-profile-dropdown__name", children: i }), e && r("span", { className: "cedros-profile-dropdown__email", children: e })] }), r("svg", { className: `cedros-profile-dropdown__chevron ${t ? "cedros-profile-dropdown__chevron--open" : ""}`.trim(), width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: r("path", { d: "m6 9 6 6 6-6" }) })] });
}
function Ce({ onSettings: i, onLogout: e }) {
  return a("div", { className: "cedros-profile-dropdown__menu", role: "menu", children: [i && a("button", { type: "button", className: "cedros-profile-dropdown__item", onClick: i, role: "menuitem", children: [a("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [r("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }), r("circle", { cx: "12", cy: "12", r: "3" })] }), "Settings"] }), e && a("button", { type: "button", className: "cedros-profile-dropdown__item cedros-profile-dropdown__item--danger", onClick: e, role: "menuitem", children: [a("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [r("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }), r("polyline", { points: "16 17 21 12 16 7" }), r("line", { x1: "21", x2: "9", y1: "12", y2: "12" })] }), "Log out"] })] });
}
const Le = X(null);
function Me({ title: i = "Admin", plugins: e = [], hostContext: n, defaultSection: s, pageSize: t = 20, refreshInterval: o = 0, onSectionChange: c, logo: l, profileMenu: m, sidebarFooter: w, onSettingsClick: f, onLogoutClick: b, sectionWrappers: C = [], loadingFallback: M, className: x }) {
  const [p] = N(() => _e(e)), [k, I] = N(() => p.getAll()), [y, E] = N(() => s ?? null), [T, j] = N(/* @__PURE__ */ new Set());
  L(() => p.subscribe(I), [p]), L(() => {
    Ne(p, e), I(p.getAll());
  }, [e, p]);
  const A = S(() => qe(k, n), [k, n]), W = S(() => Re(k), [k]), z = S(() => Ue(A, W), [A, W]), v = S(() => Ee(y, A), [y, A]), F = S(() => We(p, v, n, A), [p, v, n, A]);
  L(() => {
    y !== v && E(v);
  }, [y, v]);
  const G = q((_) => {
    E(_), c?.(_);
  }, [c]), D = q((_) => {
    const R = p.get(_);
    return R ? R.createPluginContext(n) : null;
  }, [p, n]), $ = q((_) => {
    j((R) => {
      const U = new Set(R);
      return U.has(_) ? U.delete(_) : U.add(_), U;
    });
  }, []), Q = S(() => ({
    registry: p,
    hostContext: n,
    activeSection: v,
    setActiveSection: G,
    getPluginContext: D
  }), [p, n, v, G, D]), K = m === void 0 ? Ie(n, { onSettingsClick: f, onLogoutClick: b }) : m;
  return r(Le.Provider, { value: Q, children: a("div", { className: Ge("cedros-admin", "cedros-admin-shell", x), children: [r(oe, { title: i, logo: l, profileMenu: K, sidebarFooter: w, groupedSections: z, groupConfigs: W, activeSection: v, collapsedGroups: T, onToggleGroup: $, onSelectSection: G }), r(ae, { allSections: A, hasRegisteredPlugins: k.length > 0, currentSection: F, hostContext: n, activeSection: v, pageSize: t, refreshInterval: o, loadingFallback: M, sectionWrappers: C })] }) });
}
function Ie(i, e) {
  const n = we(i);
  return n ? r(Pe, { name: n.name, email: n.email, picture: n.picture, onSettings: e.onSettingsClick, onLogout: e.onLogoutClick }) : null;
}
function Ne(i, e) {
  const n = new Set(e.map((s) => s.id));
  i.getAll().forEach((s) => {
    n.has(s.id) || i.unregister(s.id);
  }), e.forEach((s) => {
    i.get(s.id) !== s && i.register(s);
  });
}
function qe(i, e) {
  return i.flatMap((n) => n.sections.filter((s) => xe(s, n, e)).map((s) => ({
    ...s,
    qualifiedId: `${n.id}:${s.id}`,
    pluginId: n.id,
    cssNamespace: n.cssNamespace
  })));
}
function xe(i, e, n) {
  return i.requiredPermission && !e.checkPermission(i.requiredPermission, n) ? !1 : be(n, i.id);
}
function Ee(i, e) {
  return i && e.some((n) => n.qualifiedId === i) ? i : e[0]?.qualifiedId ?? null;
}
function Re(i) {
  const e = /* @__PURE__ */ new Map();
  return i.forEach((n) => {
    n.groups?.forEach((s) => {
      e.has(s.label) || e.set(s.label, s);
    });
  }), e;
}
function Ue(i, e) {
  const n = /* @__PURE__ */ new Map();
  return i.forEach((s) => {
    const t = s.group ?? "Menu";
    n.set(t, [...n.get(t) ?? [], s]);
  }), Array.from(n.entries()).sort(([s], [t]) => {
    const o = e.get(s)?.order ?? 99, c = e.get(t)?.order ?? 99;
    return o - c;
  }).map(([s, t]) => [s, [...t].sort(Te)]);
}
function Te(i, e) {
  return (i.order ?? 0) - (e.order ?? 0);
}
function We(i, e, n, s) {
  if (!e)
    return null;
  const t = s.find((l) => l.qualifiedId === e), o = t ? i.get(t.pluginId) : void 0, c = t ? o?.components[t.id] : void 0;
  return !t || !o || !c ? null : {
    Component: c,
    plugin: o,
    pluginContext: o.createPluginContext(n),
    section: t
  };
}
function Ge(...i) {
  return i.filter(Boolean).join(" ");
}
const h = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
function De() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ r("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ r("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ r("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] });
}
function Oe() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ r("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ r("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ r("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] });
}
function Be() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ r("path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" }),
    /* @__PURE__ */ r("path", { d: "M12 18V6" })
  ] });
}
function He() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2" }),
    /* @__PURE__ */ r("path", { d: "M9 22v-4h6v4" }),
    /* @__PURE__ */ r("path", { d: "M8 6h.01" }),
    /* @__PURE__ */ r("path", { d: "M16 6h.01" }),
    /* @__PURE__ */ r("path", { d: "M12 6h.01" }),
    /* @__PURE__ */ r("path", { d: "M12 10h.01" }),
    /* @__PURE__ */ r("path", { d: "M12 14h.01" }),
    /* @__PURE__ */ r("path", { d: "M16 10h.01" }),
    /* @__PURE__ */ r("path", { d: "M16 14h.01" }),
    /* @__PURE__ */ r("path", { d: "M8 10h.01" }),
    /* @__PURE__ */ r("path", { d: "M8 14h.01" })
  ] });
}
function Ve() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }),
    /* @__PURE__ */ r("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" })
  ] });
}
function je() {
  return /* @__PURE__ */ r("svg", { ...h, children: /* @__PURE__ */ r("path", { d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" }) });
}
function ze() {
  return /* @__PURE__ */ r("svg", { ...h, children: /* @__PURE__ */ r("path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }) });
}
function Fe() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
    /* @__PURE__ */ r("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
  ] });
}
function $e() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("path", { d: "M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" }),
    /* @__PURE__ */ r("path", { d: "m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" }),
    /* @__PURE__ */ r("path", { d: "m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" })
  ] });
}
function Qe() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "6" }),
    /* @__PURE__ */ r("path", { d: "M18.09 10.37A6 6 0 1 1 10.34 18" }),
    /* @__PURE__ */ r("path", { d: "M7 6h1v4" }),
    /* @__PURE__ */ r("path", { d: "m16.71 13.88.7.71-2.82 2.82" })
  ] });
}
function Ke() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2" }),
    /* @__PURE__ */ r("rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2" }),
    /* @__PURE__ */ r("line", { x1: "6", x2: "6.01", y1: "6", y2: "6" }),
    /* @__PURE__ */ r("line", { x1: "6", x2: "6.01", y1: "18", y2: "18" })
  ] });
}
function Ze() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }),
    /* @__PURE__ */ r("circle", { cx: "9", cy: "9", r: "2" }),
    /* @__PURE__ */ r("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" })
  ] });
}
function Je() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("circle", { cx: "18", cy: "5", r: "3" }),
    /* @__PURE__ */ r("circle", { cx: "6", cy: "12", r: "3" }),
    /* @__PURE__ */ r("circle", { cx: "18", cy: "19", r: "3" }),
    /* @__PURE__ */ r("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
    /* @__PURE__ */ r("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" })
  ] });
}
function Xe() {
  return /* @__PURE__ */ a("svg", { ...h, children: [
    /* @__PURE__ */ r("path", { d: "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" }),
    /* @__PURE__ */ r("path", { d: "M13 5v2" }),
    /* @__PURE__ */ r("path", { d: "M13 17v2" }),
    /* @__PURE__ */ r("path", { d: "M13 11v2" })
  ] });
}
const u = {
  users: () => /* @__PURE__ */ r(De, {}),
  members: () => /* @__PURE__ */ r(Oe, {}),
  deposits: () => /* @__PURE__ */ r(Be, {}),
  withdrawals: () => /* @__PURE__ */ r(He, {}),
  wallet: () => /* @__PURE__ */ r(Ve, {}),
  key: () => /* @__PURE__ */ r(je, {}),
  shield: () => /* @__PURE__ */ r(ze, {}),
  mail: () => /* @__PURE__ */ r(Fe, {}),
  webhook: () => /* @__PURE__ */ r($e, {}),
  coins: () => /* @__PURE__ */ r(Qe, {}),
  server: () => /* @__PURE__ */ r(Ke, {}),
  image: () => /* @__PURE__ */ r(Ze, {}),
  referrals: () => /* @__PURE__ */ r(Je, {}),
  ticket: () => /* @__PURE__ */ r(Xe, {})
};
function Ye(i) {
  return i ? {
    authMethods: [],
    emailVerified: !1,
    createdAt: "",
    updatedAt: "",
    ...i
  } : null;
}
function ei(i) {
  const e = Ye(i.pluginData?.user);
  return {
    config: {
      serverUrl: i.serverUrl
    },
    user: e,
    authState: e ? "authenticated" : "unauthenticated",
    getAccessToken: i.getAccessToken
  };
}
function ii({
  pluginContext: i,
  children: e
}) {
  const n = S(() => ei(i), [i]);
  return /* @__PURE__ */ r(ee.Provider, { value: n, children: e });
}
const g = (i) => Y(async () => {
  const e = await i();
  return {
    default: function(s) {
      return /* @__PURE__ */ r(ii, { pluginContext: s.pluginContext, children: /* @__PURE__ */ r(e, { ...s }) });
    }
  };
}), ri = g(async () => (await import("./UsersSection-CPElCb6J.js")).default), ni = g(async () => (await import("./TeamSection-DkqhXecX.js")).default), si = g(async () => (await import("./DepositsSection-CWVQ_11h.js")).default), ti = g(async () => (await import("./WithdrawalsSection-Cts4D4qb.js")).default), oi = g(async () => (await import("./AuthenticationSettings-DtMr1CHl.js")).default), ai = g(async () => (await import("./EmbeddedWalletSettings-BASiuj3D.js")).default), ci = g(async () => (await import("./EmailSettings-DaTbgwNj.js")).default), di = g(async () => (await import("./WebhookSettings-B09lxU2B.js")).default), li = g(async () => (await import("./CreditSystemSettings-zQoBFDE7.js")).default), ui = g(async () => (await import("./ServerSettings-d1iPkA9e.js")).default), gi = g(async () => (await import("./AdminReferralPayouts-CLph2yFJ.js")).AdminReferralPayouts), mi = g(async () => (await import("./TokenGateSettings-DjyRgFfN.js")).TokenGateSettings), pi = g(async () => (await import("./AdminAccreditationQueue-YCI38niZ.js")).AdminAccreditationQueue), hi = g(async () => (await import("./AdminSanctionsPanel-BXq59crQ.js")).AdminSanctionsPanel), fi = g(async () => (await import("./AdminAccessCodes-DIvFE0gg.js")).AdminAccessCodes), vi = g(async () => (await import("./index-BlfGPQ4i.js")).ComplianceSettings), Si = g(async () => (await import("./index-BlfGPQ4i.js")).ReferralSettings), wi = g(async () => (await import("./index-BlfGPQ4i.js")).SignupSettings), bi = g(async () => (await import("./index-BlfGPQ4i.js")).ImageStorageSettings), yi = {
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
}, _i = [
  // Users group (main sections)
  {
    id: "users",
    label: "Users",
    icon: u.users,
    group: "Users",
    order: 0,
    requiredPermission: "login:users:read"
  },
  {
    id: "team",
    label: "Team",
    icon: u.members,
    group: "Users",
    order: 1,
    requiredPermission: "login:members:read"
  },
  {
    id: "deposits",
    label: "Deposits",
    icon: u.deposits,
    group: "Users",
    order: 2,
    requiredPermission: "login:deposits:read"
  },
  {
    id: "withdrawals",
    label: "Withdrawals",
    icon: u.withdrawals,
    group: "Users",
    order: 3,
    requiredPermission: "login:deposits:read"
  },
  // Configuration group (settings sections)
  {
    id: "referrals",
    label: "Referrals",
    icon: u.referrals,
    group: "Users",
    order: 4,
    requiredPermission: "login:deposits:read"
  },
  {
    id: "settings-auth",
    label: "Authentication",
    icon: u.key,
    group: "Configuration",
    order: 0,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-email",
    label: "Email & SMTP",
    icon: u.mail,
    group: "Configuration",
    order: 1,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-webhooks",
    label: "Webhooks",
    icon: u.webhook,
    group: "Configuration",
    order: 2,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-wallet",
    label: "User Wallets",
    icon: u.wallet,
    group: "Configuration",
    order: 3,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-credits",
    label: "Credit System",
    icon: u.coins,
    group: "Configuration",
    order: 4,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-server",
    label: "Auth Server",
    icon: u.server,
    group: "Configuration",
    order: 5,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-compliance",
    label: "Compliance & Gating",
    icon: u.shield,
    group: "Configuration",
    order: 6,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-referrals",
    label: "Referrals & Rewards",
    icon: u.referrals,
    group: "Configuration",
    order: 7,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-signup",
    label: "Signup Gating",
    icon: u.ticket,
    group: "Configuration",
    order: 8,
    requiredPermission: "login:settings:read"
  },
  {
    id: "settings-images",
    label: "Image Storage",
    icon: u.image,
    group: "Configuration",
    order: 9,
    requiredPermission: "login:settings:read"
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: u.shield,
    group: "Compliance",
    order: 0,
    requiredPermission: "login:settings:read"
  },
  {
    id: "accreditation-queue",
    label: "Accreditation Queue",
    icon: u.shield,
    group: "Compliance",
    order: 1,
    requiredPermission: "login:settings:read"
  },
  {
    id: "sanctions",
    label: "Sanctions",
    icon: u.shield,
    group: "Compliance",
    order: 2,
    requiredPermission: "login:settings:read"
  },
  {
    id: "signup-gating",
    label: "Signup Gating",
    icon: u.ticket,
    group: "Compliance",
    order: 3,
    requiredPermission: "login:settings:read"
  }
], B = {
  id: "cedros-login",
  name: "Cedros Login",
  version: "1.0.0",
  sections: _i,
  groups: [
    { id: "users", label: "Users", order: 0 },
    { id: "compliance", label: "Compliance", order: 1 },
    { id: "configuration", label: "Configuration", order: 2 }
  ],
  components: {
    users: ri,
    team: ni,
    deposits: si,
    withdrawals: ti,
    referrals: gi,
    "settings-auth": oi,
    "settings-wallet": ai,
    "settings-email": ci,
    "settings-webhooks": di,
    "settings-credits": li,
    "settings-compliance": vi,
    "settings-referrals": Si,
    "settings-signup": wi,
    "settings-server": ui,
    "settings-images": bi,
    compliance: mi,
    "accreditation-queue": pi,
    sanctions: hi,
    "signup-gating": fi
  },
  createPluginContext(i) {
    const e = P(
      i,
      d.cedrosLogin
    );
    if (!e)
      throw new Error(
        "cedros-login plugin requires the cedros-login host service"
      );
    const n = P(i, d.org);
    return {
      serverUrl: e.serverUrl,
      userId: e.user?.id,
      getAccessToken: e.getAccessToken,
      hasPermission: (s) => this.checkPermission(s, i),
      orgId: n?.orgId,
      pluginData: {
        user: e.user,
        orgRole: n?.role
      }
    };
  },
  checkPermission(i, e) {
    const n = P(e, d.org), s = P(e, d.cedrosLogin);
    if (!n)
      return !!s?.user;
    const t = yi[i];
    return t ? t.some(
      (o) => n.permissions.includes(o) || o === n.role || o === "admin" && ["admin", "owner"].includes(n.role) || o === "owner" && n.role === "owner"
    ) : !1;
  },
  cssNamespace: "cedros-dashboard"
}, Ei = {
  users: "users",
  team: "team",
  referrals: "referrals",
  deposits: "deposits",
  withdrawals: "withdrawals",
  compliance: "compliance",
  accreditationQueue: "accreditation-queue",
  sanctions: "sanctions",
  signupGating: "signup-gating",
  settingsAuth: "settings-auth",
  settingsEmail: "settings-email",
  settingsWebhooks: "settings-webhooks",
  settingsWallet: "settings-wallet",
  settingsCredits: "settings-credits",
  settingsCompliance: "settings-compliance",
  settingsReferrals: "settings-referrals",
  settingsSignup: "settings-signup",
  settingsServer: "settings-server",
  settingsImages: "settings-images"
};
function Ri({
  additionalPlugins: i = [],
  hostContext: e,
  loginFallback: n,
  loadingFallback: s,
  defaultSection: t = "cedros-login:users",
  ...o
}) {
  const { config: c, user: l, authState: m, _internal: w } = te(), { activeOrg: f, role: b, permissions: C, isLoading: M, error: x } = ie(), { status: p, isLoading: k, error: I, checkStatus: y } = re();
  L(() => {
    y();
  }, [y]);
  const E = S(
    () => Pi(i),
    [i]
  ), T = S(
    () => ki(e, {
      serverUrl: c.serverUrl,
      user: l,
      getAccessToken: w?.getAccessToken ?? (() => null),
      activeOrg: f,
      role: b,
      permissions: C
    }),
    [e, c.serverUrl, l, w, f, b, C]
  );
  return I ? /* @__PURE__ */ r(O, { error: `Failed to check admin setup status: ${I.message}`, autoFocus: !0 }) : x ? /* @__PURE__ */ r(O, { error: `Failed to load admin organization context: ${x.message}`, autoFocus: !0 }) : k || p === null || m === "loading" || m === "authenticated" && M ? Ci(s) : p.needsSetup ? /* @__PURE__ */ r(ne, { onComplete: () => void y() }) : m !== "authenticated" || !l ? /* @__PURE__ */ r(H, { children: n ?? /* @__PURE__ */ r(se, {}) }) : /* @__PURE__ */ r(
    Me,
    {
      ...o,
      loadingFallback: s,
      defaultSection: t,
      plugins: E,
      hostContext: T
    }
  );
}
function Pi(i) {
  const e = [B];
  for (const n of i)
    n.id !== B.id && e.push(n);
  return e;
}
function ki(i, e) {
  const n = {
    user: e.user ? {
      id: e.user.id,
      email: e.user.email,
      name: e.user.name,
      picture: e.user.picture
    } : null,
    getAccessToken: e.getAccessToken,
    serverUrl: e.serverUrl
  }, s = Ai(i, e.activeOrg, e.role, e.permissions);
  return {
    ...i,
    services: {
      ...i?.services,
      [d.cedrosLogin]: n,
      ...s ? { [d.org]: s } : {}
    },
    cedrosLogin: n,
    ...s ? { org: s } : {}
  };
}
function Ai(i, e, n, s) {
  return e ? {
    orgId: e.id,
    role: n ?? "member",
    permissions: s ?? []
  } : i?.org;
}
function Ci(i) {
  return i !== void 0 ? /* @__PURE__ */ r(H, { children: i }) : /* @__PURE__ */ r("div", { children: "Loading admin..." });
}
export {
  Ei as CEDROS_LOGIN_SECTION_IDS,
  Ri as CedrosUnifiedAdmin,
  B as cedrosLoginPlugin,
  B as loginPlugin
};
