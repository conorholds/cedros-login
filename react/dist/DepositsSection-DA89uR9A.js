import { jsxs as t, jsx as e } from "react/jsx-runtime";
import { useState as o } from "react";
import { A as r, a as n } from "./AdminDepositList-Cx0xRwES.js";
function u({
  pageSize: a = 20,
  refreshInterval: s = 0
}) {
  const [i, d] = o("");
  return /* @__PURE__ */ t("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ e(r, { refreshInterval: s }),
    /* @__PURE__ */ t("div", { className: "cedros-dashboard__deposits-list", children: [
      /* @__PURE__ */ e("div", { className: "cedros-dashboard__toolbar", children: /* @__PURE__ */ t("div", { className: "cedros-dashboard__filter", children: [
        /* @__PURE__ */ e("label", { className: "cedros-dashboard__filter-label", htmlFor: "status-filter", children: "Status" }),
        /* @__PURE__ */ t(
          "select",
          {
            id: "status-filter",
            className: "cedros-dashboard__select",
            value: i,
            onChange: (l) => d(l.target.value),
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
        n,
        {
          statusFilter: i || void 0,
          pageSize: a,
          refreshInterval: s
        }
      )
    ] })
  ] });
}
export {
  u as default
};
