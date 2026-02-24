import { jsxs as s, jsx as a } from "react/jsx-runtime";
import { useState as n, useEffect as c } from "react";
import { A as l, a as h, b as m, c as p } from "./AdminWithdrawalHistory-Cud-yuWy.js";
function _({
  pageSize: e = 20,
  refreshInterval: i = 0
}) {
  const [r, t] = n(0);
  return c(() => {
    if (i <= 0) return;
    const d = window.setInterval(() => {
      t((o) => o + 1);
    }, i);
    return () => window.clearInterval(d);
  }, [i]), /* @__PURE__ */ s("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ a(l, { refreshSignal: r }),
    /* @__PURE__ */ a("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ s("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ a(h, { pageSize: e, refreshSignal: r }),
      /* @__PURE__ */ a(m, { pageSize: e, refreshSignal: r }),
      /* @__PURE__ */ a(p, { pageSize: e, refreshSignal: r })
    ] })
  ] });
}
export {
  _ as default
};
