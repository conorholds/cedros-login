import { jsxs as a, jsx as e, Fragment as M } from "react/jsx-runtime";
import { useState as d, useMemo as Ne, useCallback as S, useEffect as fe } from "react";
import { u as ye, A as Ge } from "./AdminUserList-Be80MypL.js";
import { A as ze } from "./adminUserApi-Cv3oWYoC.js";
import { c as Qe, b as We } from "./EmailRegisterForm-DrtZJXIS.js";
import { S as Xe } from "./StatsBar-BX-hHtTq.js";
function ve(s) {
  return new Date(s).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function k(s) {
  return new Date(s).toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Ze(s) {
  return s == null ? "—" : `${(s / 1e9).toFixed(4)} SOL`;
}
function ee(s) {
  return s == null ? "—" : (s / 1e9).toFixed(4);
}
function es(s) {
  return {
    DEPOSIT: "Deposit",
    SPEND: "Spend",
    ADJUSTMENT: "Adjustment",
    REFUND: "Refund"
  }[s.toUpperCase()] || s;
}
function ss(s, t) {
  return t ? {
    deposit: "Credit deposit",
    purchase: "Purchase",
    api_call: "API usage",
    subscription: "Subscription",
    refund: "Refund",
    bonus: "Bonus credit",
    promo: "Promotional credit",
    correction: "Balance correction"
  }[t.toLowerCase()] || t : {
    DEPOSIT: "Credit added",
    SPEND: "Credit used",
    ADJUSTMENT: "Manual adjustment",
    REFUND: "Credit refunded"
  }[s.toUpperCase()] || "—";
}
function se({ currentPage: s, totalPages: t, total: c, onPageChange: i }) {
  return /* @__PURE__ */ a("div", { className: "cedros-admin-pagination", children: [
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => i(s - 1),
        disabled: s <= 1,
        children: "Previous"
      }
    ),
    /* @__PURE__ */ a("span", { className: "cedros-admin-page-info", children: [
      "Page ",
      s,
      " of ",
      t,
      " (",
      c,
      " total)"
    ] }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: () => i(s + 1),
        disabled: s >= t,
        children: "Next"
      }
    )
  ] });
}
function as({
  deposits: s,
  total: t,
  currentPage: c,
  totalPages: i,
  onPageChange: f,
  isLoading: u,
  error: o,
  onRetry: l
}) {
  return o ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: o }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: l,
        children: "Retry"
      }
    )
  ] }) : u && s.length === 0 ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading deposits..." })
  ] }) : t === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No deposits found." }) : /* @__PURE__ */ a(M, { children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ a("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Transaction" })
      ] }),
      s.map((r) => /* @__PURE__ */ a("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: k(r.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: Ze(r.amountLamports) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e("span", { className: `cedros-admin-status-badge cedros-admin-status-${r.status}`, children: r.status }) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", children: r.txSignature ? /* @__PURE__ */ a(M, { children: [
          /* @__PURE__ */ a("span", { className: "cedros-admin-list-td-mono", title: r.txSignature, children: [
            r.txSignature.slice(0, 8),
            "..."
          ] }),
          /* @__PURE__ */ e(
            "a",
            {
              href: `https://orbmarkets.io/tx/${r.txSignature}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "cedros-admin-icon-link",
              title: "View on Orbmarkets",
              "aria-label": "View transaction on Orbmarkets",
              children: "↗"
            }
          )
        ] }) : /* @__PURE__ */ e("span", { className: "cedros-admin-list-td-muted", children: "—" }) })
      ] }, r.id))
    ] }),
    i > 1 && /* @__PURE__ */ e(
      se,
      {
        currentPage: c,
        totalPages: i,
        total: t,
        onPageChange: f
      }
    )
  ] });
}
function ts({
  transactions: s,
  total: t,
  currentPage: c,
  totalPages: i,
  onPageChange: f,
  isLoading: u,
  error: o,
  onRetry: l
}) {
  return o ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: o }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: l,
        children: "Retry"
      }
    )
  ] }) : u && s.length === 0 ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading transactions..." })
  ] }) : t === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No credit transactions found." }) : /* @__PURE__ */ a(M, { children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ a("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Type" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Description" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Amount" })
      ] }),
      s.map((r) => /* @__PURE__ */ a("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: k(r.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-tx-type cedros-admin-tx-type-${r.txType.toLowerCase()}`,
            children: es(r.txType)
          }
        ) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: ss(r.txType, r.referenceType) }),
        /* @__PURE__ */ a(
          "div",
          {
            className: `cedros-admin-list-td ${r.amountLamports >= 0 ? "cedros-admin-amount-positive" : "cedros-admin-amount-negative"}`,
            children: [
              r.amountLamports >= 0 ? "+" : "",
              ee(r.amountLamports)
            ]
          }
        )
      ] }, r.id))
    ] }),
    i > 1 && /* @__PURE__ */ e(
      se,
      {
        currentPage: c,
        totalPages: i,
        total: t,
        onPageChange: f
      }
    )
  ] });
}
function rs({
  sessions: s,
  total: t,
  currentPage: c,
  totalPages: i,
  onPageChange: f,
  isLoading: u,
  error: o,
  onRetry: l
}) {
  return o ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: o }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: l,
        children: "Retry"
      }
    )
  ] }) : u && s.length === 0 ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading chat history..." })
  ] }) : t === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No chat sessions found." }) : /* @__PURE__ */ a(M, { children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ a("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Session" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Messages" })
      ] }),
      s.map((r) => /* @__PURE__ */ a("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: k(r.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: r.title || `Chat ${r.id.slice(0, 8)}...` }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: r.messageCount })
      ] }, r.id))
    ] }),
    i > 1 && /* @__PURE__ */ e(
      se,
      {
        currentPage: c,
        totalPages: i,
        total: t,
        onPageChange: f
      }
    )
  ] });
}
function ns({
  referrals: s,
  total: t,
  currentPage: c,
  totalPages: i,
  onPageChange: f,
  isLoading: u,
  error: o,
  onRetry: l
}) {
  return o ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: o }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: l,
        children: "Retry"
      }
    )
  ] }) : u && s.length === 0 ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading referrals..." })
  ] }) : t === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No referred users found." }) : /* @__PURE__ */ a(M, { children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ a("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Name" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Email" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Joined" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Last Login" })
      ] }),
      s.map((r) => /* @__PURE__ */ a("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: r.name || "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: r.email || "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: ve(r.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: r.lastLoginAt ? k(r.lastLoginAt) : "—" })
      ] }, r.id))
    ] }),
    i > 1 && /* @__PURE__ */ e(
      se,
      {
        currentPage: c,
        totalPages: i,
        total: t,
        onPageChange: f
      }
    )
  ] });
}
const is = [
  { value: "none", label: "None (reset)" },
  { value: "verified", label: "Verified" },
  { value: "failed", label: "Failed" }
];
function ds({
  kycData: s,
  userKycStatus: t,
  userKycVerifiedAt: c,
  userKycExpiresAt: i,
  error: f,
  onRetry: u,
  onOverride: o
}) {
  const [l, r] = d("none"), [C, A] = d(!1), [R, w] = d(null), E = s?.status ?? t ?? "none", p = s?.verifiedAt ?? c, N = s?.expiresAt ?? i, D = async () => {
    if (window.confirm(
      `Override KYC status to "${l}" for this user?`
    )) {
      A(!0), w(null);
      try {
        await o(l);
      } catch (b) {
        w(b instanceof Error ? b.message : "Override failed");
      } finally {
        A(!1);
      }
    }
  };
  return f ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: f }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: u,
        children: "Retry"
      }
    )
  ] }) : !s && !t ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading KYC data..." })
  ] }) : /* @__PURE__ */ a("div", { className: "cedros-kyc-admin-tab", children: [
    /* @__PURE__ */ a("div", { className: "cedros-kyc-admin-tab-summary", children: [
      /* @__PURE__ */ a("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Status" }),
        /* @__PURE__ */ e("span", { className: `cedros-admin-status-badge cedros-kyc-status-${E}`, children: E })
      ] }),
      p && /* @__PURE__ */ a("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Verified at" }),
        /* @__PURE__ */ e("span", { children: k(p) })
      ] }),
      N && /* @__PURE__ */ a("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Expires at" }),
        /* @__PURE__ */ e("span", { children: k(N) })
      ] })
    ] }),
    /* @__PURE__ */ a("div", { className: "cedros-kyc-admin-override", children: [
      /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-override-label", children: "Override status" }),
      /* @__PURE__ */ e(
        "select",
        {
          className: "cedros-kyc-admin-override-select",
          value: l,
          onChange: (h) => r(h.target.value),
          disabled: C,
          "aria-label": "Select KYC override status",
          children: is.map((h) => /* @__PURE__ */ e("option", { value: h.value, children: h.label }, h.value))
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: D,
          disabled: C,
          children: C ? "Saving..." : "Apply Override"
        }
      ),
      R && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: R })
    ] }),
    s && s.sessions.length > 0 ? /* @__PURE__ */ a("div", { className: "cedros-admin-list-table", children: [
      /* @__PURE__ */ a("div", { className: "cedros-admin-list-thead", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Provider" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Error" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Completed" })
      ] }),
      s.sessions.map((h) => /* @__PURE__ */ a("div", { className: "cedros-admin-list-row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: k(h.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: h.provider }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-status-badge cedros-kyc-status-${h.status}`,
            children: h.status
          }
        ) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-muted", children: h.errorCode ? `${h.errorCode}${h.errorReason ? `: ${h.errorReason}` : ""}` : "—" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: h.completedAt ? k(h.completedAt) : "—" })
      ] }, h.id))
    ] }) : s && /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No verification sessions found." })
  ] });
}
const cs = [
  { value: "none", label: "None (reset)" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" }
];
function os({
  accreditationData: s,
  userAccreditationStatus: t,
  userAccreditationVerifiedAt: c,
  userAccreditationExpiresAt: i,
  error: f,
  onRetry: u,
  onOverride: o,
  onReview: l
}) {
  const [r, C] = d("none"), [A, R] = d(!1), [w, E] = d(null), [p, N] = d(null), [D, h] = d(""), [b, v] = d(""), [U, P] = d(!1), [F, L] = d(null), K = s?.status ?? t ?? "none", $ = s?.verifiedAt ?? c, V = s?.expiresAt ?? i, _ = async () => {
    if (window.confirm(
      `Override accreditation status to "${r}" for this user?`
    )) {
      R(!0), E(null);
      try {
        await o(r);
      } catch (O) {
        E(O instanceof Error ? O.message : "Override failed");
      } finally {
        R(!1);
      }
    }
  }, T = async (m, O) => {
    const j = O ? "approve" : "reject";
    if (window.confirm(
      `${j.charAt(0).toUpperCase() + j.slice(1)} this submission?`
    )) {
      P(!0), L(null);
      try {
        await l(
          m,
          O,
          D || void 0,
          O ? void 0 : b || void 0
        ), N(null), h(""), v("");
      } catch (I) {
        L(I instanceof Error ? I.message : "Review failed");
      } finally {
        P(!1);
      }
    }
  };
  return f ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: f }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: u,
        children: "Retry"
      }
    )
  ] }) : !s && !t ? /* @__PURE__ */ a("div", { className: "cedros-admin-tab-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading accreditation data..." })
  ] }) : /* @__PURE__ */ a("div", { className: "cedros-accreditation-admin-tab", children: [
    /* @__PURE__ */ a("div", { className: "cedros-kyc-admin-tab-summary", children: [
      /* @__PURE__ */ a("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Status" }),
        /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-status-badge cedros-accreditation-status-${K}`,
            children: K
          }
        )
      ] }),
      $ && /* @__PURE__ */ a("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Verified at" }),
        /* @__PURE__ */ e("span", { children: k($) })
      ] }),
      V && /* @__PURE__ */ a("div", { className: "cedros-kyc-admin-tab-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-tab-label", children: "Expires at" }),
        /* @__PURE__ */ e("span", { children: k(V) })
      ] })
    ] }),
    /* @__PURE__ */ a("div", { className: "cedros-kyc-admin-override", children: [
      /* @__PURE__ */ e("span", { className: "cedros-kyc-admin-override-label", children: "Override status" }),
      /* @__PURE__ */ e(
        "select",
        {
          className: "cedros-kyc-admin-override-select",
          value: r,
          onChange: (m) => C(m.target.value),
          disabled: A,
          "aria-label": "Select accreditation override status",
          children: cs.map((m) => /* @__PURE__ */ e("option", { value: m.value, children: m.label }, m.value))
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: _,
          disabled: A,
          children: A ? "Saving..." : "Apply Override"
        }
      ),
      w && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: w })
    ] }),
    s && s.submissions.length > 0 ? /* @__PURE__ */ a(M, { children: [
      /* @__PURE__ */ a("div", { className: "cedros-admin-list-table", children: [
        /* @__PURE__ */ a("div", { className: "cedros-admin-list-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Date" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Method" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Status" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Expires" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", children: "Actions" })
        ] }),
        s.submissions.map((m) => /* @__PURE__ */ a("div", { className: "cedros-admin-list-row", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: k(m.createdAt) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: m.method.replace(/_/g, " ") }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: /* @__PURE__ */ e(
            "span",
            {
              className: `cedros-admin-status-badge cedros-accreditation-status-${m.status}`,
              children: m.status
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", children: m.expiresAt ? k(m.expiresAt) : "—" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", children: m.status === "pending" && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-sm",
              onClick: () => N(p === m.id ? null : m.id),
              children: "Review"
            }
          ) })
        ] }, m.id))
      ] }),
      p && /* @__PURE__ */ a("div", { className: "cedros-accreditation-review-panel", children: [
        /* @__PURE__ */ e("p", { className: "cedros-accreditation-review-title", children: "Review submission" }),
        /* @__PURE__ */ e("label", { className: "cedros-kyc-admin-tab-label", htmlFor: "review-notes", children: "Reviewer notes (internal)" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "review-notes",
            type: "text",
            className: "cedros-input cedros-input-sm",
            value: D,
            onChange: (m) => h(m.target.value),
            placeholder: "Optional internal notes",
            disabled: U
          }
        ),
        /* @__PURE__ */ e("label", { className: "cedros-kyc-admin-tab-label", htmlFor: "review-rejection", children: "Rejection reason (shown to user if rejected)" }),
        /* @__PURE__ */ e(
          "input",
          {
            id: "review-rejection",
            type: "text",
            className: "cedros-input cedros-input-sm",
            value: b,
            onChange: (m) => v(m.target.value),
            placeholder: "Required when rejecting",
            disabled: U
          }
        ),
        /* @__PURE__ */ a("div", { className: "cedros-accreditation-review-actions", children: [
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-sm",
              onClick: () => T(p, !0),
              disabled: U,
              children: U ? "Saving..." : "Approve"
            }
          ),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-btn-danger",
              onClick: () => T(p, !1),
              disabled: U || !b.trim(),
              children: U ? "Saving..." : "Reject"
            }
          )
        ] }),
        F && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: F })
      ] })
    ] }) : s && /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No accreditation submissions found." })
  ] });
}
function ls({ user: s, isCurrentUser: t }) {
  return /* @__PURE__ */ a("div", { className: "cedros-admin-user-detail-info", children: [
    /* @__PURE__ */ e("div", { className: "cedros-admin-user-detail-avatar", children: s.picture ? /* @__PURE__ */ e(
      "img",
      {
        src: s.picture,
        alt: s.name || s.email || "User",
        className: "cedros-admin-user-detail-avatar-img",
        referrerPolicy: "no-referrer"
      }
    ) : /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-avatar-placeholder", children: (s.name?.[0] || s.email?.[0] || "?").toUpperCase() }) }),
    /* @__PURE__ */ a("div", { className: "cedros-admin-user-detail-meta", children: [
      /* @__PURE__ */ a("h2", { className: "cedros-admin-user-detail-name", children: [
        s.name || "Unknown",
        t && /* @__PURE__ */ e("span", { className: "cedros-admin-user-you", children: "(you)" })
      ] }),
      /* @__PURE__ */ a("p", { className: "cedros-admin-user-detail-email", children: [
        s.email || "No email",
        s.emailVerified && /* @__PURE__ */ e("span", { className: "cedros-admin-verified-badge", title: "Email verified", children: "Verified" })
      ] }),
      s.isSystemAdmin && /* @__PURE__ */ e("div", { className: "cedros-admin-user-detail-badges", children: /* @__PURE__ */ e("span", { className: "cedros-admin-admin-badge cedros-admin-admin-badge-yes", children: "System Admin" }) }),
      /* @__PURE__ */ a("div", { className: "cedros-admin-user-detail-methods", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-methods-label", children: "Auth Methods:" }),
        s.authMethods.length > 0 ? s.authMethods.map((c) => /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-auth-badge cedros-admin-auth-badge-${c}`,
            children: c
          },
          c
        )) : /* @__PURE__ */ e("span", { className: "cedros-admin-auth-badge cedros-admin-auth-badge-none", children: "none" })
      ] }),
      /* @__PURE__ */ a("p", { className: "cedros-admin-user-detail-dates", children: [
        "Registered: ",
        ve(s.createdAt),
        " | Updated: ",
        ve(s.updatedAt)
      ] }),
      s.referralCode && /* @__PURE__ */ a("div", { className: "cedros-admin-user-detail-referral", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-referral-label", children: "Referral:" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-user-detail-referral-code", children: s.referralCode }),
        s.referralCount !== void 0 && s.referralCount > 0 && /* @__PURE__ */ a("span", { className: "cedros-admin-user-detail-referral-count", children: [
          "(",
          s.referralCount,
          " referred)"
        ] }),
        s.referredBy && /* @__PURE__ */ a("span", { className: "cedros-admin-user-detail-referred-by", children: [
          "Referred by:",
          " ",
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-admin-user-uuid-link",
              onClick: () => navigator.clipboard?.writeText(s.referredBy),
              title: "Click to copy referrer UUID",
              children: s.referredBy
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function ms({ credits: s, creditsError: t, onRetry: c }) {
  return t ? /* @__PURE__ */ a("div", { className: "cedros-admin-stats-error", children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: t }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: c,
        children: "Retry"
      }
    )
  ] }) : s ? /* @__PURE__ */ a("div", { className: "cedros-admin-user-detail-stats", children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-stat-card", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Credit Balance" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: ee(s.stats.currentBalanceLamports) })
    ] }),
    /* @__PURE__ */ a("div", { className: "cedros-admin-stat-card", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Credited" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: ee(s.stats.totalDepositedLamports) })
    ] }),
    /* @__PURE__ */ a("div", { className: "cedros-admin-stat-card", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Spent" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: ee(s.stats.totalSpentLamports) })
    ] }),
    /* @__PURE__ */ a("div", { className: "cedros-admin-stat-card", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Deposits" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: s.stats.depositCount })
    ] }),
    /* @__PURE__ */ a("div", { className: "cedros-admin-stat-card", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Transactions" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: s.stats.spendCount })
    ] })
  ] }) : /* @__PURE__ */ a("div", { className: "cedros-admin-stats-loading", children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { children: "Loading credit stats..." })
  ] });
}
function us({
  activeTab: s,
  onTabChange: t,
  cedrosPayEnabled: c,
  user: i,
  deposits: f,
  credits: u,
  chats: o,
  referrals: l,
  kycData: r,
  accreditationData: C,
  depositsError: A,
  creditsError: R,
  chatsError: w,
  referralsError: E,
  kycError: p,
  accreditationError: N,
  depositsCurrentPage: D,
  depositsTotalPages: h,
  onDepositsPageChange: b,
  transactionsCurrentPage: v,
  transactionsTotalPages: U,
  onTransactionsPageChange: P,
  chatsCurrentPage: F,
  chatsTotalPages: L,
  onChatsPageChange: K,
  referralsCurrentPage: $,
  referralsTotalPages: V,
  onReferralsPageChange: _,
  isLoading: T,
  onRetryDeposits: m,
  onRetryCredits: O,
  onRetryChats: j,
  onRetryReferrals: H,
  onRetryKyc: I,
  onRetryAccreditation: ae,
  onKycOverride: J,
  onAccreditationOverride: B,
  onAccreditationReview: G
}) {
  return /* @__PURE__ */ a(M, { children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-user-detail-tabs", children: [
      /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "deposits" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => t("deposits"),
          children: [
            "Deposits (",
            f?.total ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "transactions" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => t("transactions"),
          children: [
            "Credits (",
            u?.totalTransactions ?? 0,
            ")"
          ]
        }
      ),
      c && /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "chats" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => t("chats"),
          children: [
            "Chats (",
            o?.total ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "referrals" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => t("referrals"),
          children: [
            "Referrals (",
            l?.total ?? i.referralCount ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "kyc" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => t("kyc"),
          children: [
            "KYC (",
            r?.totalSessions ?? 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "accreditation" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => t("accreditation"),
          children: [
            "Accreditation (",
            C?.totalSubmissions ?? 0,
            ")"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ a("div", { className: "cedros-admin-user-detail-content", children: [
      s === "deposits" && /* @__PURE__ */ e(
        as,
        {
          deposits: f?.deposits ?? [],
          total: f?.total ?? 0,
          currentPage: D,
          totalPages: h,
          onPageChange: b,
          isLoading: T,
          error: A,
          onRetry: m
        }
      ),
      s === "transactions" && /* @__PURE__ */ e(
        ts,
        {
          transactions: u?.transactions ?? [],
          total: u?.totalTransactions ?? 0,
          currentPage: v,
          totalPages: U,
          onPageChange: P,
          error: R,
          onRetry: O,
          isLoading: T
        }
      ),
      s === "chats" && c && /* @__PURE__ */ e(
        rs,
        {
          sessions: o?.sessions ?? [],
          total: o?.total ?? 0,
          currentPage: F,
          totalPages: L,
          onPageChange: K,
          error: w,
          onRetry: j,
          isLoading: T
        }
      ),
      s === "referrals" && /* @__PURE__ */ e(
        ns,
        {
          referrals: l?.users ?? [],
          total: l?.total ?? 0,
          currentPage: $,
          totalPages: V,
          onPageChange: _,
          error: E,
          onRetry: H,
          isLoading: T
        }
      ),
      s === "kyc" && /* @__PURE__ */ e(
        ds,
        {
          kycData: r,
          userKycStatus: i.kycStatus,
          userKycVerifiedAt: i.kycVerifiedAt,
          userKycExpiresAt: i.kycExpiresAt,
          error: p,
          onRetry: I,
          onOverride: J
        }
      ),
      s === "accreditation" && /* @__PURE__ */ e(
        os,
        {
          accreditationData: C,
          userAccreditationStatus: i.accreditationStatus,
          userAccreditationVerifiedAt: i.accreditationVerifiedAt,
          userAccreditationExpiresAt: i.accreditationExpiresAt,
          error: N,
          onRetry: ae,
          onOverride: B,
          onReview: G
        }
      )
    ] })
  ] });
}
function hs({
  userId: s,
  onBack: t,
  currentUserId: c,
  onEditUser: i,
  onAdjustCredits: f,
  cedrosPayEnabled: u = !1,
  className: o = ""
}) {
  const { config: l, _internal: r } = Qe(), {
    isLoading: C,
    getUser: A,
    getUserDeposits: R,
    getUserCredits: w,
    getUserChats: E,
    getUserReferrals: p,
    deleteUser: N,
    forcePasswordReset: D,
    clearError: h
  } = ye(), b = Ne(
    () => new ze(
      l.serverUrl,
      l.requestTimeout,
      l.retryAttempts,
      r?.getAccessToken
    ),
    [l.serverUrl, l.requestTimeout, l.retryAttempts, r]
  ), [v, U] = d(null), [P, F] = d(null), [L, K] = d(null), [$, V] = d(null), [_, T] = d(null), [m, O] = d(null), [j, H] = d(null), [I, ae] = d("deposits"), [J, B] = d(null), [G, z] = d(null), [ge, te] = d(null), [Ce, re] = d(null), [we, ne] = d(null), [Ae, Q] = d(null), [Re, Y] = d(null), [W, X] = d(!1), [ie, Se] = d(0), [de, ke] = d(0), [ce, Ee] = d(0), [oe, Ue] = d(0), y = 10, le = S(async () => {
    try {
      const n = await A(s);
      U(n), B(null);
    } catch (n) {
      B(n instanceof Error ? n.message : "Failed to load user");
    }
  }, [s, A]), me = S(async () => {
    try {
      const g = await R(s, { limit: y, offset: ie });
      K(g), te(null);
    } catch (n) {
      te(n instanceof Error ? n.message : "Failed to load deposits");
    }
  }, [s, R, ie]), Z = S(async () => {
    try {
      const g = await w(s, { limit: y, offset: de });
      F(g), z(null);
    } catch (n) {
      z(n instanceof Error ? n.message : "Failed to load credits");
    }
  }, [s, w, de]), ue = S(async () => {
    if (u)
      try {
        const g = await E(s, { limit: y, offset: ce });
        V(g), re(null);
      } catch (n) {
        re(n instanceof Error ? n.message : "Failed to load chat history");
      }
  }, [s, E, ce, u]), he = S(async () => {
    try {
      const g = await p(s, { limit: y, offset: oe });
      T(g), ne(null);
    } catch (n) {
      ne(n instanceof Error ? n.message : "Failed to load referrals");
    }
  }, [s, p, oe]), q = S(async () => {
    try {
      const n = await b.getUserKyc(s);
      O(n), Q(null);
    } catch (n) {
      Q(n instanceof Error ? n.message : "Failed to load KYC data");
    }
  }, [s, b]), x = S(async () => {
    try {
      const n = await b.getUserAccreditation(s);
      H(n), Y(null);
    } catch (n) {
      Y(
        n instanceof Error ? n.message : "Failed to load accreditation data"
      );
    }
  }, [s, b]), Oe = S(
    async (n) => {
      try {
        await b.overrideAccreditationStatus(s, n), await x();
      } catch (g) {
        Y(
          g instanceof Error ? g.message : "Failed to override accreditation status"
        );
      }
    },
    [s, b, x]
  ), Pe = S(
    async (n, g, He, Je) => {
      try {
        await b.reviewAccreditation(
          n,
          g,
          He,
          Je
        ), await x();
      } catch (be) {
        Y(
          be instanceof Error ? be.message : "Failed to review accreditation submission"
        );
      }
    },
    [b, x]
  ), Te = S(
    async (n) => {
      try {
        await b.overrideUserKyc(s, n), await q();
      } catch (g) {
        Q(g instanceof Error ? g.message : "Failed to override KYC status");
      }
    },
    [s, b, q]
  );
  fe(() => {
    le(), me(), Z(), he(), q(), x(), u && ue();
  }, [le, me, Z, ue, he, q, x, u]);
  const De = async () => {
    if (!v) return;
    if (v.id === c) {
      alert("You cannot delete your own account");
      return;
    }
    if (v.isSystemAdmin) {
      alert("Cannot delete a system admin. Remove admin status first.");
      return;
    }
    if (window.confirm(
      `Are you sure you want to delete ${v.name || v.email || "this user"}? This action cannot be undone.`
    )) {
      X(!0);
      try {
        await N(v.id), t();
      } catch {
      } finally {
        X(!1);
      }
    }
  }, Le = async () => {
    if (!v?.email) {
      alert("User has no email address");
      return;
    }
    if (window.confirm(`Send a password reset email to ${v.email}?`)) {
      X(!0);
      try {
        await D(v.id), alert("Password reset email sent");
      } catch {
      } finally {
        X(!1);
      }
    }
  }, $e = L ? Math.ceil(L.total / y) : 0, _e = Math.floor(ie / y) + 1, xe = P ? Math.ceil(P.totalTransactions / y) : 0, Me = Math.floor(de / y) + 1, Fe = $ ? Math.ceil($.total / y) : 0, Ke = Math.floor(ce / y) + 1, Ve = _ ? Math.ceil(_.total / y) : 0, je = Math.floor(oe / y) + 1, Ie = (n) => Se((n - 1) * y), Be = (n) => ke((n - 1) * y), Ye = (n) => Ee((n - 1) * y), qe = (n) => Ue((n - 1) * y);
  if (J)
    return /* @__PURE__ */ a("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-error ${o}`, children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: t,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: J }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline",
          onClick: () => {
            h(), B(null), le();
          },
          children: "Retry"
        }
      )
    ] });
  if (C && !v)
    return /* @__PURE__ */ a("div", { className: `cedros-admin-user-detail cedros-admin-user-detail-loading ${o}`, children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading user..." })
    ] });
  if (!v)
    return /* @__PURE__ */ a("div", { className: `cedros-admin-user-detail ${o}`, children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: t,
          children: "Back"
        }
      ),
      /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "User not found." })
    ] });
  const pe = v.id === c;
  return /* @__PURE__ */ a("div", { className: `cedros-admin-user-detail ${o}`, children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-user-detail-header", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-back-btn",
          onClick: t,
          children: "Back to Users"
        }
      ),
      /* @__PURE__ */ a("div", { className: "cedros-admin-user-detail-actions", children: [
        i && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => i(v),
            disabled: W,
            children: "Edit"
          }
        ),
        v.email && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: Le,
            disabled: W,
            children: "Reset Password"
          }
        ),
        f && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => f(v),
            disabled: W,
            children: "Adjust Credits"
          }
        ),
        !pe && !v.isSystemAdmin && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm cedros-admin-btn-danger",
            onClick: De,
            disabled: W,
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e(ls, { user: v, isCurrentUser: pe }),
    /* @__PURE__ */ e(
      ms,
      {
        credits: P,
        creditsError: G,
        onRetry: () => {
          z(null), Z();
        }
      }
    ),
    /* @__PURE__ */ e(
      us,
      {
        activeTab: I,
        onTabChange: ae,
        cedrosPayEnabled: u,
        user: v,
        deposits: L,
        credits: P,
        chats: $,
        referrals: _,
        kycData: m,
        accreditationData: j,
        depositsError: ge,
        creditsError: G,
        chatsError: Ce,
        referralsError: we,
        kycError: Ae,
        accreditationError: Re,
        depositsCurrentPage: _e,
        depositsTotalPages: $e,
        onDepositsPageChange: Ie,
        transactionsCurrentPage: Me,
        transactionsTotalPages: xe,
        onTransactionsPageChange: Be,
        chatsCurrentPage: Ke,
        chatsTotalPages: Fe,
        onChatsPageChange: Ye,
        referralsCurrentPage: je,
        referralsTotalPages: Ve,
        onReferralsPageChange: qe,
        isLoading: C,
        onRetryDeposits: () => {
          te(null), me();
        },
        onRetryCredits: () => {
          z(null), Z();
        },
        onRetryChats: () => {
          re(null), ue();
        },
        onRetryReferrals: () => {
          ne(null), he();
        },
        onRetryKyc: () => {
          Q(null), q();
        },
        onRetryAccreditation: () => {
          Y(null), x();
        },
        onKycOverride: Te,
        onAccreditationOverride: Oe,
        onAccreditationReview: Pe
      }
    )
  ] });
}
const fs = ["email", "google", "apple", "solana", "webauthn", "sso"], vs = {
  email: "Email Users",
  google: "Google Users",
  apple: "Apple Users",
  solana: "Solana Users",
  webauthn: "Passkey Users",
  sso: "SSO Provider Users"
}, ps = {
  email: "auth_email_enabled",
  google: "auth_google_enabled",
  apple: "auth_apple_enabled",
  solana: "auth_solana_enabled",
  webauthn: "auth_webauthn_enabled",
  sso: "feature_sso"
};
function bs() {
  const { getStats: s } = ye(), { fetchSettings: t, getValue: c } = We(), [i, f] = d(null), [u, o] = d(!1), [l, r] = d(null), [C, A] = d(!1);
  fe(() => {
    C || (t(), A(!0));
  }, [t, C]);
  const R = S(
    (p) => {
      const N = c(p);
      return N === void 0 ? !1 : N === "true" || N === "1";
    },
    [c]
  ), w = S(async () => {
    o(!0), r(null);
    try {
      const p = await s();
      f(p);
    } catch (p) {
      r(p instanceof Error ? p.message : "Failed to load user stats");
    } finally {
      o(!1);
    }
  }, [s]);
  return fe(() => {
    w();
  }, [w]), { statsItems: Ne(() => {
    const p = [{ label: "Total Users", value: i?.total ?? "—" }];
    return fs.forEach((N) => {
      R(ps[N]) && p.push({
        label: vs[N],
        value: i?.authMethodCounts[N] ?? 0
      });
    }), p;
  }, [i, R]), isLoading: u, error: l, refresh: w };
}
function Rs({
  pluginContext: s,
  pageSize: t = 20
}) {
  const [c, i] = d(null), { statsItems: f, isLoading: u, error: o, refresh: l } = bs();
  return c ? /* @__PURE__ */ e("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ e(
    hs,
    {
      userId: c.id,
      onBack: () => i(null),
      currentUserId: s.userId
    }
  ) }) : /* @__PURE__ */ a("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ e(Xe, { stats: f, isLoading: u, onRefresh: l }),
    o && /* @__PURE__ */ e("p", { className: "cedros-admin-error-inline", children: o }),
    /* @__PURE__ */ e("p", { className: "cedros-dashboard__text-muted", children: "All registered users in the system. Requires system admin privileges." }),
    /* @__PURE__ */ e(
      Ge,
      {
        pageSize: t,
        currentUserId: s.userId,
        onUserClick: (r) => i(r)
      }
    )
  ] });
}
export {
  Rs as default
};
