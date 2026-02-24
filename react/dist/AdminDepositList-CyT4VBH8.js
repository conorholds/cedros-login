import { jsxs as a, jsx as e, Fragment as V } from "react/jsx-runtime";
import { useState as p, useCallback as O, useEffect as f, useMemo as B } from "react";
import { u as R } from "./useAdminDeposits-BTSyeAfg.js";
import { S as K } from "./StatsBar-BX-hHtTq.js";
function Z({
  refreshInterval: s = 0,
  refreshSignal: r,
  className: h = "",
  onLoad: b
}) {
  const { getStats: N, isLoading: w, error: y, clearError: C } = R(), [d, L] = p(null), [k, m] = p(null), c = O(async () => {
    try {
      const i = await N();
      L(i), b?.(i), m(null);
    } catch (i) {
      const S = i && typeof i == "object" && "message" in i ? String(i.message) : "Failed to load stats";
      m(S);
    }
  }, [N, b]);
  f(() => {
    c();
  }, [c]), f(() => {
    r !== void 0 && c();
  }, [r, c]), f(() => {
    if (r !== void 0 || s <= 0) return;
    const i = setInterval(c, s);
    return () => clearInterval(i);
  }, [s, r, c]);
  const x = k || y;
  return x ? /* @__PURE__ */ a("div", { className: `cedros-admin-stats cedros-admin-stats-error ${h}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: x }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          C(), m(null), c();
        },
        children: "Retry"
      }
    )
  ] }) : w && !d ? /* @__PURE__ */ a("div", { className: `cedros-admin-stats cedros-admin-stats-loading ${h}`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading statistics..." })
  ] }) : d ? /* @__PURE__ */ e("div", { className: `cedros-admin-stats ${h}`, children: /* @__PURE__ */ e(
    K,
    {
      stats: [
        { label: "Total Deposits", value: d.totalDeposits },
        { label: "Private Deposits", value: d.inPrivacyPeriodCount ?? 0 },
        { label: "Standard Deposits", value: d.readyForWithdrawalCount ?? 0 },
        { label: "Microdeposits", value: d.nativeSolDepositCount ?? 0 }
      ],
      isLoading: w,
      onRefresh: c
    }
  ) }) : null;
}
function U(s) {
  return {
    pending: "Pending",
    detected: "Detected",
    processing: "Processing",
    completed: "Completed",
    withdrawn: "Withdrawn",
    partially_withdrawn: "Partially Withdrawn",
    expired: "Expired",
    failed: "Failed"
  }[s] || s;
}
function q(s) {
  return s === "completed" || s === "withdrawn" || s === "partially_withdrawn" ? "cedros-admin-deposit-success" : s === "failed" || s === "expired" ? "cedros-admin-deposit-error" : s === "processing" || s === "detected" ? "cedros-admin-deposit-processing" : "cedros-admin-deposit-pending";
}
function G(s) {
  return s == null ? "—" : `${(s / 1e9).toFixed(4)} SOL`;
}
function H(s) {
  return new Date(s).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function T(s) {
  return s.length <= 12 ? s : `${s.slice(0, 6)}...${s.slice(-4)}`;
}
function z({
  statusFilter: s,
  pageSize: r = 20,
  refreshInterval: h = 0,
  refreshSignal: b,
  className: N = "",
  onLoad: w,
  onDepositClick: y
}) {
  const { listDeposits: C, isLoading: d, error: L, clearError: k } = R(), [m, c] = p([]), [x, i] = p(0), [S, I] = p(0), [j, $] = p(null), [o, _] = p("createdAt"), [l, E] = p("desc"), D = (t) => {
    o === t ? E(l === "asc" ? "desc" : "asc") : (_(t), E("desc"));
  }, W = B(() => [...m].sort((t, n) => {
    let g, v;
    switch (o) {
      case "userId":
        g = t.userId.toLowerCase(), v = n.userId.toLowerCase();
        break;
      case "amountLamports":
        g = t.amountLamports ?? 0, v = n.amountLamports ?? 0;
        break;
      case "status":
        g = t.status, v = n.status;
        break;
      case "createdAt":
        g = new Date(t.createdAt).getTime(), v = new Date(n.createdAt).getTime();
        break;
      case "txSignature":
        g = t.txSignature || "", v = n.txSignature || "";
        break;
      default:
        return 0;
    }
    return g < v ? l === "asc" ? -1 : 1 : g > v ? l === "asc" ? 1 : -1 : 0;
  }), [m, o, l]), u = O(async () => {
    try {
      const t = await C({ status: s, limit: r, offset: S });
      c(t.deposits), i(t.total), w?.(t), $(null);
    } catch (t) {
      const n = t && typeof t == "object" && "message" in t ? String(t.message) : "Failed to load deposits";
      $(n);
    }
  }, [s, r, S, C, w]);
  f(() => {
    I(0);
  }, [s, r]), f(() => {
    u();
  }, [u]), f(() => {
    b !== void 0 && u();
  }, [b, u]), f(() => {
    if (b !== void 0 || h <= 0) return;
    const t = setInterval(u, h);
    return () => clearInterval(t);
  }, [h, b, u]);
  const P = Math.ceil(x / r), A = Math.floor(S / r) + 1, M = (t) => {
    const n = (t - 1) * r;
    I(Math.max(0, Math.min(n, Math.max(0, x - 1))));
  }, F = j || L;
  return F ? /* @__PURE__ */ a("div", { className: `cedros-admin-deposit-list cedros-admin-deposit-list-error ${N}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: F }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          k(), $(null), u();
        },
        children: "Retry"
      }
    )
  ] }) : d && m.length === 0 ? /* @__PURE__ */ a("div", { className: `cedros-admin-deposit-list cedros-admin-deposit-list-loading ${N}`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading deposits..." })
  ] }) : /* @__PURE__ */ a("div", { className: `cedros-admin-deposit-list ${N}`, children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-deposit-list-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-deposit-list-title", children: "All Deposits" }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-admin__stats-bar-refresh",
          onClick: u,
          disabled: d,
          title: "Refresh deposits",
          "aria-label": "Refresh deposits",
          children: d ? "..." : "↻"
        }
      )
    ] }),
    m.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No deposits found." }) }) : /* @__PURE__ */ a(V, { children: [
      /* @__PURE__ */ a("div", { className: "cedros-admin-deposit-table", children: [
        /* @__PURE__ */ a("div", { className: "cedros-admin-deposit-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${o === "userId" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => D("userId"),
              "aria-label": "Sort by user",
              children: [
                "User",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: o === "userId" ? l === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${o === "amountLamports" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => D("amountLamports"),
              "aria-label": "Sort by amount",
              children: [
                "Amount",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: o === "amountLamports" ? l === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${o === "status" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => D("status"),
              "aria-label": "Sort by status",
              children: [
                "Status",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: o === "status" ? l === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${o === "createdAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => D("createdAt"),
              "aria-label": "Sort by created",
              children: [
                "Created",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: o === "createdAt" ? l === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${o === "txSignature" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => D("txSignature"),
              "aria-label": "Sort by transaction",
              children: [
                "Tx",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: o === "txSignature" ? l === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) })
        ] }),
        W.map((t) => /* @__PURE__ */ a(
          "div",
          {
            className: `cedros-admin-deposit-row ${q(t.status)}`,
            onClick: () => y?.(t),
            onKeyDown: (n) => {
              (n.key === "Enter" || n.key === " ") && (n.preventDefault(), y?.(t));
            },
            role: y ? "button" : void 0,
            tabIndex: y ? 0 : void 0,
            children: [
              /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-td", title: t.userId, children: T(t.userId) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-td", children: G(t.amountLamports) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-td", children: /* @__PURE__ */ e("span", { className: "cedros-admin-status-badge", children: U(t.status) }) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-td", children: H(t.createdAt) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-deposit-td", title: t.txSignature || void 0, children: t.txSignature ? T(t.txSignature) : "—" })
            ]
          },
          t.id
        ))
      ] }),
      P > 1 && /* @__PURE__ */ a("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => M(A - 1),
            disabled: A <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ a("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          A,
          " of ",
          P,
          " (",
          x,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => M(A + 1),
            disabled: A >= P,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
export {
  Z as A,
  z as a
};
