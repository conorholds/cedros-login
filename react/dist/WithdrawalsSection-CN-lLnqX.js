import { jsxs as s, jsx as a } from "react/jsx-runtime";
import "react";
import { A as r, a as o, b as t, c } from "./AdminWithdrawalHistory-BGjfrIe3.js";
function p({
  pageSize: i = 20,
  refreshInterval: d = 0
}) {
  return /* @__PURE__ */ s("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ a(r, { refreshInterval: d }),
    /* @__PURE__ */ a("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ s("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ a(o, { pageSize: i, refreshInterval: d }),
      /* @__PURE__ */ a(t, { pageSize: i, refreshInterval: d }),
      /* @__PURE__ */ a(c, { pageSize: i, refreshInterval: d })
    ] })
  ] });
}
export {
  p as default
};
