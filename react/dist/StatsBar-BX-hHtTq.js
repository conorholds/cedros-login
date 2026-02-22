import { jsxs as r, jsx as e } from "react/jsx-runtime";
const d = {
  loading: /* @__PURE__ */ e(
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
      className: "cedros-admin__spinner",
      children: /* @__PURE__ */ e("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
    }
  ),
  refresh: /* @__PURE__ */ r(
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
        /* @__PURE__ */ e("path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }),
        /* @__PURE__ */ e("path", { d: "M21 3v5h-5" }),
        /* @__PURE__ */ e("path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }),
        /* @__PURE__ */ e("path", { d: "M8 16H3v5" })
      ]
    }
  )
};
function c({ stats: i, isLoading: a = !1, onRefresh: n }) {
  return /* @__PURE__ */ r("div", { className: "cedros-admin__stats-bar", children: [
    /* @__PURE__ */ e("div", { className: "cedros-admin__stats-bar-grid", children: i.map((s, t) => /* @__PURE__ */ r("div", { className: "cedros-admin__stats-bar-item", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin__stats-bar-label", children: s.label }),
      /* @__PURE__ */ e(
        "span",
        {
          className: `cedros-admin__stats-bar-value ${s.variant ? `cedros-admin__stats-bar-value--${s.variant}` : ""}`,
          children: a ? /* @__PURE__ */ e("span", { className: "cedros-admin__skeleton cedros-admin__skeleton--value" }) : s.value
        }
      ),
      s.description && /* @__PURE__ */ e("span", { className: "cedros-admin__stats-bar-desc", children: s.description })
    ] }, t)) }),
    n && /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-admin__stats-bar-refresh",
        onClick: n,
        disabled: a,
        title: "Refresh stats",
        children: a ? d.loading : d.refresh
      }
    )
  ] });
}
export {
  c as S
};
