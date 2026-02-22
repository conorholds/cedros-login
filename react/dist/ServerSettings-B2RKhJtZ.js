import { jsxs as i, jsx as e } from "react/jsx-runtime";
import { useState as b, useEffect as k, useMemo as _ } from "react";
import { L as N } from "./LoadingSpinner-6vml-zwr.js";
import { E as A } from "./ErrorMessage-CcEK0pYO.js";
import { u as x, A as L, S as E } from "./AutosaveStatus-N4uNS6-2.js";
const u = [
  {
    id: "general",
    label: "Integrations",
    keys: ["server_cedros_pay_api_key"]
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
function O({ className: n }) {
  const {
    settings: a,
    edits: y,
    isLoading: v,
    autosaveStatus: h,
    autosaveError: f,
    error: d,
    fetchSettings: l,
    handleChange: p
  } = x(), [o, S] = b("general");
  k(() => {
    l();
  }, [l]);
  const t = u.find((s) => s.id === o), g = _(() => {
    if (!t) return [];
    const s = t.categories ?? ["server"], m = [];
    for (const r of s) {
      const c = a[r] ?? [];
      m.push(...c);
    }
    return m.filter((r) => t.keys.includes(r.key)).sort((r, c) => t.keys.indexOf(r.key) - t.keys.indexOf(c.key));
  }, [a, t]);
  return v && Object.keys(a).length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-system-settings cedros-system-settings-loading ${n ?? ""}`, children: [
    /* @__PURE__ */ e(N, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : d ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${n ?? ""}`, children: /* @__PURE__ */ e(A, { error: d.message }) }) : /* @__PURE__ */ i("div", { className: `cedros-system-settings ${n ?? ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "Auth Server" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Server infrastructure settings. Some may be overridden by environment variables." })
      ] }),
      /* @__PURE__ */ e(L, { status: h, error: f })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: u.map((s) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${o === s.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => S(s.id),
        "aria-selected": o === s.id,
        role: "tab",
        children: s.label
      },
      s.id
    )) }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: g.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ i("p", { children: [
      "No settings found for ",
      t?.label ?? "this section",
      "."
    ] }) }) : /* @__PURE__ */ e(E, { settings: g, edits: y, onChange: p }) })
  ] });
}
export {
  O as S
};
