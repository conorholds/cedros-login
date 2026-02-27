import { jsxs as t, jsx as e } from "react/jsx-runtime";
import { useEffect as p } from "react";
import { L as v } from "./LoadingSpinner-6vml-zwr.js";
import { E as S } from "./ErrorMessage-CcEK0pYO.js";
import { u as y, A as N, S as E } from "./AutosaveStatus-BKc7T2Tw.js";
function b({
  title: i,
  description: d,
  categories: g,
  className: n = ""
}) {
  const {
    settings: r,
    edits: h,
    isLoading: l,
    autosaveStatus: m,
    autosaveError: u,
    error: o,
    fetchSettings: a,
    handleChange: f
  } = y();
  p(() => {
    a();
  }, [a]);
  const c = g.filter((s) => r[s]?.length > 0);
  return l && Object.keys(r).length === 0 ? /* @__PURE__ */ t("div", { className: `cedros-system-settings cedros-system-settings-loading ${n}`, children: [
    /* @__PURE__ */ e(v, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : o ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${n}`, children: /* @__PURE__ */ e(S, { error: o.message }) }) : /* @__PURE__ */ t("div", { className: `cedros-system-settings ${n}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ t("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: i }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: d })
      ] }),
      /* @__PURE__ */ e(N, { status: m, error: u })
    ] }),
    c.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ e("p", { children: "No settings found for this section." }) }) : c.map((s) => /* @__PURE__ */ e(
      E,
      {
        settings: r[s],
        edits: h,
        onChange: f
      },
      s
    ))
  ] });
}
const k = ["webhook"];
function T({ className: i }) {
  return /* @__PURE__ */ e(
    b,
    {
      title: "Webhooks",
      description: "Configure HTTP webhook notifications for authentication events.",
      categories: k,
      className: i
    }
  );
}
export {
  b as S,
  T as W
};
