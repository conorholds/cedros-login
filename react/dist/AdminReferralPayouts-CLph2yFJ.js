import { jsxs as r, Fragment as D, jsx as e } from "react/jsx-runtime";
import { useMemo as W, useState as o, useCallback as g, useEffect as q } from "react";
import { c as j } from "./EmailRegisterForm-DrtZJXIS.js";
import { A as B, h as P } from "./ErrorMessage-DObd7075.js";
function H(t, c) {
  return c.toUpperCase() === "SOL" ? `${(t / 1e9).toFixed(4)} SOL` : `${t} ${c}`;
}
function M(t) {
  return t.length <= 16 ? t : `${t.slice(0, 8)}...${t.slice(-6)}`;
}
function J(t) {
  return new Date(t).toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const K = ["all", "pending", "completed", "failed", "cancelled"];
function Q() {
  const { config: t, _internal: c } = j(), l = W(
    () => new B({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts,
      getAccessToken: c?.getAccessToken
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, c]
  ), [h, F] = o("all"), [p, N] = o(0), b = 20, [i, C] = o(null), [T, d] = o(!1), [k, S] = o(null), [$, u] = o(null), [v, f] = o(null), m = g(async () => {
    d(!0), S(null);
    try {
      const s = new URLSearchParams();
      h !== "all" && s.set("status", h), s.set("limit", String(b)), s.set("offset", String(p * b));
      const n = await l.get(
        `/admin/referral-payouts/list?${s.toString()}`
      );
      C(n);
    } catch (s) {
      const n = P(s, "Failed to load payouts");
      S(n.message);
    } finally {
      d(!1);
    }
  }, [l, h, p]);
  q(() => {
    m();
  }, [m]);
  const w = g(
    async (s) => {
      f(s), u(null);
      try {
        const n = await l.post(
          `/admin/referral-payouts/${s}/process`,
          {}
        );
        u(`Processed: ${n.txSignature}`), m();
      } catch (n) {
        const A = P(n, "Failed to process payout");
        u(A.message);
      } finally {
        f(null);
      }
    },
    [l, m]
  ), R = g(
    async (s) => {
      f(s), u(null);
      try {
        await l.post(`/admin/referral-payouts/${s}/cancel`, {}), u("Payout cancelled."), m();
      } catch (n) {
        const A = P(n, "Failed to cancel payout");
        u(A.message);
      } finally {
        f(null);
      }
    },
    [l, m]
  ), _ = i ? Math.ceil(i.total / b) : 0;
  return /* @__PURE__ */ r(D, { children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts__filter-bar", children: [
      /* @__PURE__ */ r("label", { className: "cedros-admin-referral-payouts__filter-label", children: [
        "Status:",
        /* @__PURE__ */ e(
          "select",
          {
            value: h,
            onChange: (s) => {
              F(s.target.value), N(0);
            },
            className: "cedros-admin-referral-payouts__filter-select",
            children: K.map((s) => /* @__PURE__ */ e("option", { value: s, children: s.charAt(0).toUpperCase() + s.slice(1) }, s))
          }
        )
      ] }),
      i && /* @__PURE__ */ r("span", { className: "cedros-admin-referral-payouts__filter-count", children: [
        i.total,
        " total"
      ] })
    ] }),
    $ && /* @__PURE__ */ e("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--info", children: $ }),
    T && !i && /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts--loading", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading payouts..." })
    ] }),
    k && /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts--error", children: [
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: k }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: m,
          children: "Retry"
        }
      )
    ] }),
    i && i.payouts.length === 0 && /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No payouts found." }),
    i && i.payouts.length > 0 && /* @__PURE__ */ r("div", { className: "cedros-admin-list-table", role: "table", "aria-label": "All referral payouts", children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-list-thead", role: "row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Date" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Referrer" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Trigger" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Amount" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Status" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "TX / Error" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Actions" })
      ] }),
      i.payouts.map((s) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", role: "row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: J(s.createdAt) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: s.referrerEmail || s.referrerName || M(s.referrerId) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: s.triggerType }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: H(s.amount, s.currency) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ e("span", { className: `cedros-admin-referral-payouts__status cedros-admin-referral-payouts__status--${s.status}`, children: s.status }) }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-td cedros-admin-list-td-mono", role: "cell", children: [
          s.txSignature && M(s.txSignature),
          s.errorMessage && /* @__PURE__ */ e("span", { className: "cedros-admin-list-td-muted", title: s.errorMessage, children: s.errorMessage.slice(0, 40) })
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-td", role: "cell", children: [
          (s.status === "pending" || s.status === "failed") && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-primary cedros-button-xs",
              onClick: () => w(s.id),
              disabled: v !== null,
              children: v === s.id ? "..." : "Process"
            }
          ),
          s.status === "pending" && /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-xs",
              onClick: () => R(s.id),
              disabled: v !== null,
              style: { marginLeft: 4 },
              children: "Cancel"
            }
          )
        ] })
      ] }, s.id))
    ] }),
    _ > 1 && /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts__pagination", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-xs",
          disabled: p === 0,
          onClick: () => N((s) => s - 1),
          children: "Previous"
        }
      ),
      /* @__PURE__ */ r("span", { className: "cedros-admin-referral-payouts__page-info", children: [
        "Page ",
        p + 1,
        " of ",
        _
      ] }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-xs",
          disabled: p >= _ - 1,
          onClick: () => N((s) => s + 1),
          children: "Next"
        }
      )
    ] })
  ] });
}
function E(t, c) {
  return c.toUpperCase() === "SOL" ? `${(t / 1e9).toFixed(4)} SOL` : `${t} ${c}`;
}
function O(t) {
  return t.length <= 16 ? t : `${t.slice(0, 8)}...${t.slice(-6)}`;
}
function te({ className: t = "" }) {
  const [c, l] = o("summary");
  return /* @__PURE__ */ r("div", { className: `cedros-admin-referral-payouts ${t}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts__tabs", children: [
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `cedros-admin-referral-payouts__tab ${c === "summary" ? "cedros-admin-referral-payouts__tab--active" : ""}`,
          onClick: () => l("summary"),
          children: "Summary"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: `cedros-admin-referral-payouts__tab ${c === "all" ? "cedros-admin-referral-payouts__tab--active" : ""}`,
          onClick: () => l("all"),
          children: "All Payouts"
        }
      )
    ] }),
    c === "summary" ? /* @__PURE__ */ e(V, {}) : /* @__PURE__ */ e(Q, {})
  ] });
}
function V() {
  const { config: t, _internal: c } = j(), l = W(
    () => new B({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts,
      getAccessToken: c?.getAccessToken
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, c]
  ), [h, F] = o(null), [p, N] = o(!1), [b, i] = o(null), [C, T] = o(!1), [d, k] = o(null), [S, $] = o(null), [u, v] = o(!1), [f, m] = o(null), [w, R] = o(null), [_, s] = o(null), n = g(async () => {
    N(!0), i(null);
    try {
      const a = await l.get("/admin/referral-payouts");
      F(a);
    } catch (a) {
      const y = P(a, "Failed to load referral payouts");
      i(y.message);
    } finally {
      N(!1);
    }
  }, [l]), A = g(async () => {
    try {
      const y = (await l.get("/admin/settings"))?.payout_auto_enabled?.value;
      s(y === "true");
    } catch {
    }
  }, [l]);
  q(() => {
    n(), A();
  }, [n, A]);
  const z = g(async () => {
    T(!0), k(null), $(null);
    try {
      const a = await l.post(
        "/admin/referral-payouts/process",
        {}
      );
      k(a), n();
    } catch (a) {
      const y = P(a, "Failed to process payouts");
      $(y.message);
    } finally {
      T(!1);
    }
  }, [l, n]), X = g(async () => {
    v(!0), m(null), R(null);
    try {
      const a = await l.post(
        "/admin/referral-payouts/retry-failed",
        {}
      );
      m(a), n();
    } catch (a) {
      const y = P(a, "Failed to retry failed payouts");
      R(y.message);
    } finally {
      v(!1);
    }
  }, [l, n]), I = C || u;
  if (p && !h)
    return /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts cedros-admin-referral-payouts--loading", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading referral payouts..." })
    ] });
  if (b)
    return /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts cedros-admin-referral-payouts--error", children: [
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: b }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: n,
          children: "Retry"
        }
      )
    ] });
  const x = h?.referrers ?? [], L = h?.total ?? 0, U = x[0]?.currency ?? "SOL", G = x.reduce((a, y) => a + y.totalPendingAmount, 0);
  return /* @__PURE__ */ r(D, { children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts__header", children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts__summary", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Pending Referrers" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: L })
        ] }),
        L > 0 && /* @__PURE__ */ r("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Total Pending Amount" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: E(G, U) })
        ] }),
        _ !== null && /* @__PURE__ */ r("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Auto-Processing" }),
          /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: _ ? "ON" : "OFF" })
        ] })
      ] }),
      /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts__actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-sm",
            onClick: z,
            disabled: I || L === 0,
            "aria-busy": C,
            children: C ? "Processing..." : "Process All Payouts"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: X,
            disabled: I,
            "aria-busy": u,
            children: u ? "Retrying..." : "Retry Failed"
          }
        )
      ] })
    ] }),
    d && /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--success", children: [
      "Processed ",
      d.processed,
      " payout(s) totalling",
      " ",
      E(d.totalAmount, U),
      ".",
      d.failed > 0 && ` ${d.failed} failed.`,
      d.skippedNoWallet > 0 && ` ${d.skippedNoWallet} skipped (no wallet).`
    ] }),
    S && /* @__PURE__ */ e("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--error", children: S }),
    f && /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--success", children: [
      "Reset ",
      f.resetCount,
      " failed payout(s) for retry."
    ] }),
    w && /* @__PURE__ */ e("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--error", children: w }),
    x.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No pending referral payouts." }) : /* @__PURE__ */ r("div", { className: "cedros-admin-list-table", role: "table", "aria-label": "Pending referral payouts", children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-list-thead", role: "row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Referrer ID" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Wallet Address" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Pending Referrals" }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Total Amount" })
      ] }),
      x.map((a) => /* @__PURE__ */ r("div", { className: "cedros-admin-list-row", role: "row", children: [
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td cedros-admin-list-td-mono", role: "cell", children: /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin-user-uuid-link",
            onClick: () => navigator.clipboard?.writeText(a.referrerId),
            title: `Click to copy: ${a.referrerId}`,
            children: O(a.referrerId)
          }
        ) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: a.payoutWalletAddress ? /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin-user-uuid-link cedros-admin-list-td-mono",
            onClick: () => navigator.clipboard?.writeText(a.payoutWalletAddress),
            title: `Click to copy: ${a.payoutWalletAddress}`,
            children: O(a.payoutWalletAddress)
          }
        ) : /* @__PURE__ */ e("span", { className: "cedros-admin-list-td-muted", children: "No wallet" }) }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: a.pendingCount }),
        /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: E(a.totalPendingAmount, a.currency) })
      ] }, a.referrerId))
    ] })
  ] });
}
export {
  te as AdminReferralPayouts
};
