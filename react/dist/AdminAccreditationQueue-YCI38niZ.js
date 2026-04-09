import { jsxs as n, Fragment as U, jsx as e } from "react/jsx-runtime";
import { useMemo as V, useState as d, useCallback as x, useEffect as z } from "react";
import { c as X } from "./EmailRegisterForm-DrtZJXIS.js";
import { A as Y } from "./adminUserApi-Cv3oWYoC.js";
function ee(a) {
  return new Date(a).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function ae(a) {
  return {
    income: "Income",
    net_worth: "Net Worth",
    credential: "Credential",
    third_party_letter: "Third-Party Letter",
    insider: "Insider / Executive",
    investment_threshold: "Investment Threshold"
  }[a] ?? a;
}
function ne(a) {
  switch (a) {
    case "pending":
      return "cedros-admin-badge--pending";
    case "approved":
      return "cedros-admin-badge--approved";
    case "rejected":
      return "cedros-admin-badge--rejected";
    case "expired":
      return "cedros-admin-badge--expired";
    default:
      return "";
  }
}
function se({
  item: a,
  isExpanded: i,
  detail: r,
  detailLoading: t,
  detailError: o,
  reviewNotes: b,
  rejectionReason: m,
  isReviewing: p,
  reviewError: l,
  onRowClick: A,
  onDocumentDownload: u,
  onReviewNotesChange: g,
  onRejectionReasonChange: f,
  onReview: S
}) {
  const w = a.statedAmountUsd !== void 0 ? `$${a.statedAmountUsd.toLocaleString()}` : a.investmentCommitmentUsd !== void 0 ? `$${a.investmentCommitmentUsd.toLocaleString()}` : "—";
  return /* @__PURE__ */ n(U, { children: [
    /* @__PURE__ */ n(
      "div",
      {
        className: `cedros-admin-list-row cedros-admin-list-row--clickable ${i ? "cedros-admin-list-row--expanded" : ""}`,
        role: "row",
        onClick: () => A(a.id),
        onKeyDown: (v) => {
          (v.key === "Enter" || v.key === " ") && (v.preventDefault(), A(a.id));
        },
        tabIndex: 0,
        "aria-expanded": i,
        children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: a.userEmail ?? /* @__PURE__ */ n("span", { className: "cedros-admin-list-td-mono", children: [
            a.userId.slice(0, 12),
            "..."
          ] }) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: ae(a.method) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: w }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: ee(a.createdAt) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ e("span", { className: `cedros-admin-badge ${ne(a.status)}`, children: a.status }) })
        ]
      }
    ),
    i && /* @__PURE__ */ n("div", { className: "cedros-admin-accreditation-queue__detail", role: "region", "aria-label": "Submission detail", children: [
      t && /* @__PURE__ */ n("div", { className: "cedros-admin-accreditation-queue__detail-loading", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading detail..." })
      ] }),
      o && /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: o }),
      r && /* @__PURE__ */ n(U, { children: [
        /* @__PURE__ */ e(te, { detail: r, onDocumentDownload: u }),
        a.status === "pending" && /* @__PURE__ */ e(
          ie,
          {
            submissionId: a.id,
            notes: b,
            rejectionReason: m,
            isReviewing: p,
            error: l,
            onNotesChange: g,
            onRejectionReasonChange: f,
            onReview: S
          }
        )
      ] })
    ] })
  ] });
}
function te({ detail: a, onDocumentDownload: i }) {
  return /* @__PURE__ */ n("div", { className: "cedros-admin-accreditation-queue__detail-fields", children: [
    a.incomeType && /* @__PURE__ */ n("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-detail-label", children: "Income Type" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-detail-value", children: a.incomeType })
    ] }),
    a.statedAmountUsd !== void 0 && /* @__PURE__ */ n("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-detail-label", children: "Stated Amount" }),
      /* @__PURE__ */ n("span", { className: "cedros-admin-detail-value", children: [
        "$",
        a.statedAmountUsd.toLocaleString()
      ] })
    ] }),
    a.crdNumber && /* @__PURE__ */ n("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-detail-label", children: "CRD Number" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-detail-value cedros-admin-list-td-mono", children: a.crdNumber })
    ] }),
    a.licenseType && /* @__PURE__ */ n("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-detail-label", children: "License Type" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-detail-value", children: a.licenseType })
    ] }),
    a.investmentCommitmentUsd !== void 0 && /* @__PURE__ */ n("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-detail-label", children: "Investment Commitment" }),
      /* @__PURE__ */ n("span", { className: "cedros-admin-detail-value", children: [
        "$",
        a.investmentCommitmentUsd.toLocaleString()
      ] })
    ] }),
    a.entityType && /* @__PURE__ */ n("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-detail-label", children: "Entity Type" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-detail-value", children: a.entityType })
    ] }),
    a.userStatement && /* @__PURE__ */ n("div", { className: "cedros-admin-detail-row cedros-admin-detail-row--block", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-detail-label", children: "User Statement" }),
      /* @__PURE__ */ e("p", { className: "cedros-admin-detail-statement", children: a.userStatement })
    ] }),
    a.documents.length > 0 && /* @__PURE__ */ n("div", { className: "cedros-admin-accreditation-queue__documents", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-accreditation-queue__documents-title", children: "Documents" }),
      a.documents.map((r) => /* @__PURE__ */ n("div", { className: "cedros-admin-accreditation-queue__document-row", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-accreditation-queue__document-name", children: r.originalFilename ?? r.documentType }),
        r.fileSizeBytes && /* @__PURE__ */ n("span", { className: "cedros-admin-list-td-muted", children: [
          (r.fileSizeBytes / 1024).toFixed(1),
          " KB"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => i(r.id),
            children: "Download"
          }
        )
      ] }, r.id))
    ] })
  ] });
}
function ie({
  submissionId: a,
  notes: i,
  rejectionReason: r,
  isReviewing: t,
  error: o,
  onNotesChange: b,
  onRejectionReasonChange: m,
  onReview: p
}) {
  return /* @__PURE__ */ n("div", { className: "cedros-admin-accreditation-queue__review-form", children: [
    /* @__PURE__ */ e("h4", { className: "cedros-admin-accreditation-queue__review-title", children: "Review Decision" }),
    /* @__PURE__ */ n("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ e("label", { className: "cedros-admin-form-label", htmlFor: "review-notes", children: "Reviewer Notes (internal)" }),
      /* @__PURE__ */ e(
        "textarea",
        {
          id: "review-notes",
          className: "cedros-admin-form-textarea",
          value: i,
          onChange: (l) => b(l.target.value),
          rows: 2,
          placeholder: "Optional internal notes"
        }
      )
    ] }),
    /* @__PURE__ */ n("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ e("label", { className: "cedros-admin-form-label", htmlFor: "rejection-reason", children: "Rejection Reason (required if rejecting)" }),
      /* @__PURE__ */ e(
        "textarea",
        {
          id: "rejection-reason",
          className: "cedros-admin-form-textarea",
          value: r,
          onChange: (l) => m(l.target.value),
          rows: 2,
          placeholder: "Reason shown to user"
        }
      )
    ] }),
    o && /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: o }),
    /* @__PURE__ */ n("div", { className: "cedros-admin-accreditation-queue__review-actions", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: () => p(a, !0),
          disabled: t,
          "aria-busy": t,
          children: t ? "Saving..." : "Approve"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-danger cedros-button-sm",
          onClick: () => p(a, !1),
          disabled: t,
          "aria-busy": t,
          children: t ? "Saving..." : "Reject"
        }
      )
    ] })
  ] });
}
const C = 20;
function le({ className: a = "" }) {
  const { config: i, _internal: r } = X(), t = V(
    () => new Y(
      i.serverUrl,
      i.requestTimeout,
      i.retryAttempts,
      r?.getAccessToken
    ),
    [i.serverUrl, i.requestTimeout, i.retryAttempts, r]
  ), [o, b] = d("pending"), [m, p] = d([]), [l, A] = d(0), [u, g] = d(0), [f, S] = d(!1), [w, v] = d(null), [h, q] = d(null), [K, y] = d(null), [O, j] = d(!1), [Q, I] = d(null), [D, $] = d(""), [R, F] = d(""), [G, P] = d(!1), [W, _] = d(null), [M, k] = d(null), N = x(async () => {
    S(!0), v(null);
    try {
      const s = await t.listPendingAccreditations(C, u);
      p(s.items), A(s.total);
    } catch (s) {
      v(s instanceof Error ? s.message : "Failed to load submissions");
    } finally {
      S(!1);
    }
  }, [t, u]);
  z(() => {
    N();
  }, [N]), z(() => {
    g(0), q(null), y(null);
  }, [o]);
  const Z = x(
    async (s) => {
      if (h === s) {
        q(null), y(null);
        return;
      }
      q(s), y(null), I(null), $(""), F(""), _(null), k(null), j(!0);
      try {
        const c = await t.getAccreditationSubmission(s);
        y(c);
      } catch (c) {
        I(c instanceof Error ? c.message : "Failed to load submission detail");
      } finally {
        j(!1);
      }
    },
    [h, t]
  ), H = x(
    async (s) => {
      try {
        const c = await t.getAccreditationDocumentUrl(s);
        window.open(c, "_blank", "noopener,noreferrer");
      } catch (c) {
        _(c instanceof Error ? c.message : "Failed to get document URL");
      }
    },
    [t]
  ), J = x(
    async (s, c) => {
      if (!c && !R.trim()) {
        _("Rejection reason is required.");
        return;
      }
      P(!0), _(null), k(null);
      try {
        await t.reviewAccreditation(
          s,
          c,
          D.trim() || void 0,
          c ? void 0 : R.trim()
        ), k(c ? "Submission approved." : "Submission rejected."), q(null), y(null), N();
      } catch (B) {
        _(B instanceof Error ? B.message : "Failed to submit review");
      } finally {
        P(!1);
      }
    },
    [t, D, R, N]
  ), E = Math.ceil(l / C), T = Math.floor(u / C) + 1, L = o === "pending" ? l : m.filter((s) => s.status === "pending").length;
  return /* @__PURE__ */ n("div", { className: `cedros-admin-accreditation-queue ${a}`, children: [
    /* @__PURE__ */ n("div", { className: "cedros-admin-accreditation-queue__header", children: [
      /* @__PURE__ */ n("h2", { className: "cedros-admin-accreditation-queue__title", children: [
        "Accreditation Review Queue",
        L > 0 && /* @__PURE__ */ e("span", { className: "cedros-admin-queue-count", "aria-label": `${L} pending`, children: L })
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-admin__stats-bar-refresh",
          onClick: N,
          disabled: f,
          title: "Refresh",
          "aria-label": "Refresh list",
          children: f ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ n("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", role: "tablist", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${o === "pending" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => b("pending"),
          "aria-selected": o === "pending",
          role: "tab",
          children: "Pending"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${o === "all" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => b("all"),
          "aria-selected": o === "all",
          role: "tab",
          children: "All"
        }
      )
    ] }),
    M && /* @__PURE__ */ e("div", { className: "cedros-admin-accreditation-queue__result cedros-admin-accreditation-queue__result--success", children: M }),
    w && /* @__PURE__ */ n("div", { className: "cedros-admin-accreditation-queue cedros-admin-accreditation-queue--error", children: [
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: w }),
      /* @__PURE__ */ e("button", { type: "button", className: "cedros-button cedros-button-outline cedros-button-sm", onClick: N, children: "Retry" })
    ] }),
    !w && f && m.length === 0 ? /* @__PURE__ */ n("div", { className: "cedros-admin-accreditation-queue--loading", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading submissions..." })
    ] }) : /* @__PURE__ */ e("div", { role: "tabpanel", children: m.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No submissions found." }) : /* @__PURE__ */ n(U, { children: [
      /* @__PURE__ */ n("div", { className: "cedros-admin-list-table", role: "table", "aria-label": "Accreditation submissions", children: [
        /* @__PURE__ */ n("div", { className: "cedros-admin-list-thead", role: "row", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "User" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Method" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Amount" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Submitted" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Status" })
        ] }),
        m.map((s) => /* @__PURE__ */ e(
          se,
          {
            item: s,
            isExpanded: h === s.id,
            detail: h === s.id ? K : null,
            detailLoading: h === s.id && O,
            detailError: h === s.id ? Q : null,
            reviewNotes: D,
            rejectionReason: R,
            isReviewing: G,
            reviewError: h === s.id ? W : null,
            onRowClick: Z,
            onDocumentDownload: H,
            onReviewNotesChange: $,
            onRejectionReasonChange: F,
            onReview: J
          },
          s.id
        ))
      ] }),
      E > 1 && /* @__PURE__ */ n("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => g(Math.max(0, u - C)),
            disabled: T <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ n("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          T,
          " of ",
          E,
          " (",
          l,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => g(u + C),
            disabled: T >= E,
            children: "Next"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  le as AdminAccreditationQueue
};
