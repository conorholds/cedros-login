import { jsxs as a, jsx as t, Fragment as W } from "react/jsx-runtime";
import { useState as u, useCallback as T, useEffect as D, useMemo as V } from "react";
import { u as O } from "./useAdminDeposits-BDY5KJ0-.js";
import { S as B } from "./StatsBar-BX-hHtTq.js";
function Y({
  refreshInterval: s = 0,
  className: r = "",
  onLoad: b
}) {
  const { getStats: g, isLoading: y, error: f, clearError: A } = O(), [d, C] = u(null), [L, l] = u(null), m = T(async () => {
    try {
      const i = await g();
      C(i), b?.(i), l(null);
    } catch (i) {
      const S = i && typeof i == "object" && "message" in i ? String(i.message) : "Failed to load stats";
      l(S);
    }
  }, [g, b]);
  D(() => {
    m();
  }, [m]), D(() => {
    if (s <= 0) return;
    const i = setInterval(m, s);
    return () => clearInterval(i);
  }, [s, m]);
  const N = L || f;
  return N ? /* @__PURE__ */ a("div", { className: `cedros-admin-stats cedros-admin-stats-error ${r}`, children: [
    /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: N }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          A(), l(null), m();
        },
        children: "Retry"
      }
    )
  ] }) : y && !d ? /* @__PURE__ */ a("div", { className: `cedros-admin-stats cedros-admin-stats-loading ${r}`, children: [
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading statistics..." })
  ] }) : d ? /* @__PURE__ */ t("div", { className: `cedros-admin-stats ${r}`, children: /* @__PURE__ */ t(
    B,
    {
      stats: [
        { label: "Total Deposits", value: d.totalDeposits },
        { label: "Private Deposits", value: d.inPrivacyPeriodCount ?? 0 },
        { label: "Standard Deposits", value: d.readyForWithdrawalCount ?? 0 },
        { label: "Microdeposits", value: d.nativeSolDepositCount ?? 0 }
      ],
      isLoading: y,
      onRefresh: m
    }
  ) }) : null;
}
function K(s) {
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
function U(s) {
  return s === "completed" || s === "withdrawn" || s === "partially_withdrawn" ? "cedros-admin-deposit-success" : s === "failed" || s === "expired" ? "cedros-admin-deposit-error" : s === "processing" || s === "detected" ? "cedros-admin-deposit-processing" : "cedros-admin-deposit-pending";
}
function q(s) {
  return s == null ? "—" : `${(s / 1e9).toFixed(4)} SOL`;
}
function G(s) {
  return new Date(s).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function F(s) {
  return s.length <= 12 ? s : `${s.slice(0, 6)}...${s.slice(-4)}`;
}
function Z({
  statusFilter: s,
  pageSize: r = 20,
  refreshInterval: b = 0,
  className: g = "",
  onLoad: y,
  onDepositClick: f
}) {
  const { listDeposits: A, isLoading: d, error: C, clearError: L } = O(), [l, m] = u([]), [N, i] = u(0), [S, P] = u(0), [R, k] = u(null), [n, j] = u("createdAt"), [c, I] = u("desc"), x = (e) => {
    n === e ? I(c === "asc" ? "desc" : "asc") : (j(e), I("desc"));
  }, _ = V(() => [...l].sort((e, o) => {
    let p, h;
    switch (n) {
      case "userId":
        p = e.userId.toLowerCase(), h = o.userId.toLowerCase();
        break;
      case "amountLamports":
        p = e.amountLamports ?? 0, h = o.amountLamports ?? 0;
        break;
      case "status":
        p = e.status, h = o.status;
        break;
      case "createdAt":
        p = new Date(e.createdAt).getTime(), h = new Date(o.createdAt).getTime();
        break;
      case "txSignature":
        p = e.txSignature || "", h = o.txSignature || "";
        break;
      default:
        return 0;
    }
    return p < h ? c === "asc" ? -1 : 1 : p > h ? c === "asc" ? 1 : -1 : 0;
  }), [l, n, c]), v = T(async () => {
    try {
      const e = await A({ status: s, limit: r, offset: S });
      m(e.deposits), i(e.total), y?.(e), k(null);
    } catch (e) {
      const o = e && typeof e == "object" && "message" in e ? String(e.message) : "Failed to load deposits";
      k(o);
    }
  }, [s, r, S, A, y]);
  D(() => {
    P(0);
  }, [s, r]), D(() => {
    v();
  }, [v]), D(() => {
    if (b <= 0) return;
    const e = setInterval(v, b);
    return () => clearInterval(e);
  }, [b, v]);
  const $ = Math.ceil(N / r), w = Math.floor(S / r) + 1, E = (e) => {
    const o = (e - 1) * r;
    P(Math.max(0, Math.min(o, Math.max(0, N - 1))));
  }, M = R || C;
  return M ? /* @__PURE__ */ a("div", { className: `cedros-admin-deposit-list cedros-admin-deposit-list-error ${g}`, children: [
    /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: M }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          L(), k(null), v();
        },
        children: "Retry"
      }
    )
  ] }) : d && l.length === 0 ? /* @__PURE__ */ a("div", { className: `cedros-admin-deposit-list cedros-admin-deposit-list-loading ${g}`, children: [
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading deposits..." })
  ] }) : /* @__PURE__ */ a("div", { className: `cedros-admin-deposit-list ${g}`, children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-deposit-list-header", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-admin-deposit-list-title", children: "All Deposits" }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-admin__stats-bar-refresh",
          onClick: v,
          disabled: d,
          title: "Refresh deposits",
          "aria-label": "Refresh deposits",
          children: d ? "..." : "↻"
        }
      )
    ] }),
    l.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ t("p", { className: "cedros-admin-empty-message", children: "No deposits found." }) }) : /* @__PURE__ */ a(W, { children: [
      /* @__PURE__ */ a("div", { className: "cedros-admin-deposit-table", children: [
        /* @__PURE__ */ a("div", { className: "cedros-admin-deposit-thead", children: [
          /* @__PURE__ */ t("div", { className: "cedros-admin-deposit-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${n === "userId" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => x("userId"),
              "aria-label": "Sort by user",
              children: [
                "User",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: n === "userId" ? c === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-deposit-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${n === "amountLamports" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => x("amountLamports"),
              "aria-label": "Sort by amount",
              children: [
                "Amount",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: n === "amountLamports" ? c === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-deposit-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${n === "status" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => x("status"),
              "aria-label": "Sort by status",
              children: [
                "Status",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: n === "status" ? c === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-deposit-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${n === "createdAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => x("createdAt"),
              "aria-label": "Sort by created",
              children: [
                "Created",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: n === "createdAt" ? c === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-deposit-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${n === "txSignature" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => x("txSignature"),
              "aria-label": "Sort by transaction",
              children: [
                "Tx",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: n === "txSignature" ? c === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) })
        ] }),
        _.map((e) => /* @__PURE__ */ a(
          "div",
          {
            className: `cedros-admin-deposit-row ${U(e.status)}`,
            onClick: () => f?.(e),
            onKeyDown: (o) => {
              (o.key === "Enter" || o.key === " ") && (o.preventDefault(), f?.(e));
            },
            role: f ? "button" : void 0,
            tabIndex: f ? 0 : void 0,
            children: [
              /* @__PURE__ */ t("div", { className: "cedros-admin-deposit-td", title: e.userId, children: F(e.userId) }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-deposit-td", children: q(e.amountLamports) }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-deposit-td", children: /* @__PURE__ */ t("span", { className: "cedros-admin-status-badge", children: K(e.status) }) }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-deposit-td", children: G(e.createdAt) }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-deposit-td", title: e.txSignature || void 0, children: e.txSignature ? F(e.txSignature) : "—" })
            ]
          },
          e.id
        ))
      ] }),
      $ > 1 && /* @__PURE__ */ a("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => E(w - 1),
            disabled: w <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ a("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          w,
          " of ",
          $,
          " (",
          N,
          " total)"
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => E(w + 1),
            disabled: w >= $,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
export {
  Y as A,
  Z as a
};
