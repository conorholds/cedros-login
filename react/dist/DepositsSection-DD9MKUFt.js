import { jsxs as t, jsx as e } from "react/jsx-runtime";
import { useState as l, useEffect as h } from "react";
import { A as u, a as p } from "./AdminDepositList-CyT4VBH8.js";
function _({
  pageSize: o = 20,
  refreshInterval: s = 0
}) {
  const [a, r] = l(""), [d, n] = l(0);
  return h(() => {
    if (s <= 0) return;
    const i = window.setInterval(() => {
      n((c) => c + 1);
    }, s);
    return () => window.clearInterval(i);
  }, [s]), /* @__PURE__ */ t("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ e(u, { refreshSignal: d }),
    /* @__PURE__ */ t("div", { className: "cedros-dashboard__deposits-list", children: [
      /* @__PURE__ */ e("div", { className: "cedros-dashboard__toolbar", children: /* @__PURE__ */ t("div", { className: "cedros-dashboard__filter", children: [
        /* @__PURE__ */ e("label", { className: "cedros-dashboard__filter-label", htmlFor: "status-filter", children: "Status" }),
        /* @__PURE__ */ t(
          "select",
          {
            id: "status-filter",
            className: "cedros-dashboard__select",
            value: a,
            onChange: (i) => r(i.target.value),
            children: [
              /* @__PURE__ */ e("option", { value: "", children: "All statuses" }),
              /* @__PURE__ */ e("option", { value: "pending", children: "Pending" }),
              /* @__PURE__ */ e("option", { value: "detected", children: "Detected" }),
              /* @__PURE__ */ e("option", { value: "processing", children: "Processing" }),
              /* @__PURE__ */ e("option", { value: "completed", children: "Completed" }),
              /* @__PURE__ */ e("option", { value: "withdrawn", children: "Withdrawn" }),
              /* @__PURE__ */ e("option", { value: "expired", children: "Expired" }),
              /* @__PURE__ */ e("option", { value: "failed", children: "Failed" })
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ e(
        p,
        {
          statusFilter: a || void 0,
          pageSize: o,
          refreshSignal: d
        }
      )
    ] })
  ] });
}
export {
  _ as default
};
