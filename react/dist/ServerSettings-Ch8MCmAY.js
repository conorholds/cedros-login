import { jsxs as a, jsx as s } from "react/jsx-runtime";
import { useMemo as v, useState as N, useEffect as h } from "react";
import { L as A } from "./LoadingSpinner-6vml-zwr.js";
import { E as x } from "./ErrorMessage-CcEK0pYO.js";
import { u as E, A as L, S as T } from "./AutosaveStatus-BKc7T2Tw.js";
const $ = [
  {
    id: "integrations",
    label: "Integrations",
    keys: ["server_cedros_pay_api_key"],
    requiredSetting: "feature_cedros_pay"
  },
  {
    id: "logging",
    label: "Logging",
    keys: ["server_log_level"]
  },
  {
    id: "metrics",
    label: "Metrics",
    keys: ["server_metrics_api_key"]
  },
  {
    id: "security",
    label: "Security",
    categories: ["security", "features"],
    keys: ["feature_mfa", "security_cors_origins", "security_session_timeout"]
  }
];
function B({ className: o }) {
  const {
    settings: c,
    edits: p,
    isLoading: S,
    autosaveStatus: b,
    autosaveError: _,
    error: g,
    fetchSettings: u,
    handleChange: k,
    getEffectiveValue: m
  } = E(), t = v(
    () => $.filter((e) => e.requiredSetting ? m(e.requiredSetting) === "true" : !0),
    [m]
  ), [r, d] = N(null);
  h(() => {
    r === null && t.length > 0 ? d(t[0].id) : r && !t.some((e) => e.id === r) && d(t[0]?.id ?? null);
  }, [t, r]), h(() => {
    u();
  }, [u]);
  const i = t.find((e) => e.id === r), f = v(() => {
    if (!i) return [];
    const e = i.categories ?? ["server"], y = [];
    for (const n of e) {
      const l = c[n] ?? [];
      y.push(...l);
    }
    return y.filter((n) => i.keys.includes(n.key)).sort((n, l) => i.keys.indexOf(n.key) - i.keys.indexOf(l.key));
  }, [c, i]);
  return S && Object.keys(c).length === 0 ? /* @__PURE__ */ a("div", { className: `cedros-system-settings cedros-system-settings-loading ${o ?? ""}`, children: [
    /* @__PURE__ */ s(A, {}),
    /* @__PURE__ */ s("span", { children: "Loading settings..." })
  ] }) : g ? /* @__PURE__ */ s("div", { className: `cedros-system-settings ${o ?? ""}`, children: /* @__PURE__ */ s(x, { error: g.message }) }) : /* @__PURE__ */ a("div", { className: `cedros-system-settings ${o ?? ""}`, children: [
    /* @__PURE__ */ a("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ a("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ s("h2", { className: "cedros-settings-page-title", children: "Auth Server" }),
        /* @__PURE__ */ s("p", { className: "cedros-settings-page-description", children: "Server infrastructure settings. Some may be overridden by environment variables." })
      ] }),
      /* @__PURE__ */ s(L, { status: b, error: _ })
    ] }),
    /* @__PURE__ */ s("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: t.map((e) => /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${r === e.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => d(e.id),
        "aria-selected": r === e.id,
        role: "tab",
        children: e.label
      },
      e.id
    )) }),
    /* @__PURE__ */ s("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: f.length === 0 ? /* @__PURE__ */ s("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ a("p", { children: [
      "No settings found for ",
      i?.label ?? "this section",
      "."
    ] }) }) : /* @__PURE__ */ s(T, { settings: f, edits: p, onChange: k }) })
  ] });
}
export {
  B as S
};
