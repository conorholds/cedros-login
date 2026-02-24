import { jsx as s, jsxs as m } from "react/jsx-runtime";
import { useState as l } from "react";
import { u, A as h, a as f } from "./useUsersStatsSummary-NjEFvWuz.js";
import { S as U } from "./StatsBar-BX-hHtTq.js";
function A({
  pluginContext: e,
  pageSize: d = 20
}) {
  const [r, t] = l(null), { statsItems: i, isLoading: o, error: a, refresh: n } = u();
  return r ? /* @__PURE__ */ s("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ s(
    h,
    {
      userId: r.id,
      onBack: () => t(null),
      currentUserId: e.userId
    }
  ) }) : /* @__PURE__ */ m("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ s(U, { stats: i, isLoading: o, onRefresh: n }),
    a && /* @__PURE__ */ s("p", { className: "cedros-admin-error-inline", children: a }),
    /* @__PURE__ */ s("p", { className: "cedros-dashboard__text-muted", children: "All registered users in the system. Requires system admin privileges." }),
    /* @__PURE__ */ s(
      f,
      {
        pageSize: d,
        currentUserId: e.userId,
        onUserClick: (c) => t(c)
      }
    )
  ] });
}
export {
  A as default
};
