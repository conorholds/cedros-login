import { jsxs as r, jsx as e, Fragment as G } from "react/jsx-runtime";
import { useState as m, useCallback as V, useEffect as S, useMemo as re } from "react";
import { u as B } from "./useAdminDeposits-BDY5KJ0-.js";
import { S as Z } from "./StatsBar-BX-hHtTq.js";
function ve({
  refreshInterval: t = 0,
  className: i = "",
  onLoad: y
}) {
  const { getStats: g, isLoading: o, error: w, clearError: p } = B(), [b, O] = m(null), [P, $] = m(null), h = V(async () => {
    try {
      const d = await g();
      O(d), y?.(d), $(null);
    } catch (d) {
      const L = d && typeof d == "object" && "message" in d ? String(d.message) : "Failed to load stats";
      $(L);
    }
  }, [g, y]);
  S(() => {
    h();
  }, [h]), S(() => {
    if (t <= 0) return;
    const d = setInterval(h, t);
    return () => clearInterval(d);
  }, [t, h]);
  const E = P || w;
  return E ? /* @__PURE__ */ r("div", { className: `cedros-admin-stats ${i}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: E }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          p(), $(null), h();
        },
        children: "Retry"
      }
    )
  ] }) : o && !b ? /* @__PURE__ */ e("div", { className: `cedros-admin-stats ${i}`, children: /* @__PURE__ */ e(
    Z,
    {
      stats: [
        { label: "Total Withdrawn", value: 0 },
        { label: "Pending Withdraw", value: 0 },
        { label: "In Privacy Period", value: 0 },
        { label: "Microbatch (SOL)", value: "0.0000" }
      ],
      isLoading: !0
    }
  ) }) : b ? /* @__PURE__ */ e("div", { className: `cedros-admin-stats ${i}`, children: /* @__PURE__ */ e(
    Z,
    {
      stats: [
        { label: "Total Withdrawn", value: b.totalWithdrawnCount },
        { label: "Pending Withdraw", value: b.pendingWithdrawalCount },
        { label: "In Privacy Period", value: b.inPrivacyPeriodCount ?? 0 },
        { label: "Microbatch (SOL)", value: b.readyForWithdrawalSol?.toFixed(4) ?? "0.0000" }
      ],
      isLoading: o,
      onRefresh: h
    }
  ) }) : null;
}
function z(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function ee(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function te(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function ne(t) {
  const i = new Date(t), g = (/* @__PURE__ */ new Date()).getTime() - i.getTime(), o = Math.floor(g / 6e4), w = Math.floor(o / 60), p = Math.floor(w / 24);
  return p > 0 ? `${p}d ago` : w > 0 ? `${w}h ago` : o > 0 ? `${o}m ago` : "just now";
}
function ae(t) {
  return t ? new Date(t) > /* @__PURE__ */ new Date() : !0;
}
function fe({
  pageSize: t = 20,
  refreshInterval: i = 0,
  className: y = "",
  onLoad: g,
  onItemClick: o,
  onWithdrawalProcessed: w,
  onAllProcessed: p
}) {
  const {
    listPendingWithdrawals: b,
    processWithdrawal: O,
    processAllWithdrawals: P,
    isLoading: $,
    error: h,
    clearError: E
  } = B(), [d, L] = m([]), [W, I] = m(0), [c, F] = m(0), [N, D] = m(null), [v, n] = m("withdrawalAvailableAt"), [l, _] = m("asc"), M = (a) => {
    v === a ? _(l === "asc" ? "desc" : "asc") : (n(a), _(a === "withdrawalAvailableAt" ? "asc" : "desc"));
  }, U = re(() => [...d].sort((a, f) => {
    let A, x;
    switch (v) {
      case "userId":
        A = a.userId.toLowerCase(), x = f.userId.toLowerCase();
        break;
      case "amountLamports":
        A = a.amountLamports ?? 0, x = f.amountLamports ?? 0;
        break;
      case "withdrawalAvailableAt":
        A = a.withdrawalAvailableAt ? new Date(a.withdrawalAvailableAt).getTime() : 0, x = f.withdrawalAvailableAt ? new Date(f.withdrawalAvailableAt).getTime() : 0;
        break;
      default:
        return 0;
    }
    return A < x ? l === "asc" ? -1 : 1 : A > x ? l === "asc" ? 1 : -1 : 0;
  }), [d, v, l]), [j, s] = m(null), [u, T] = m(!1), [k, C] = m(null), [R, H] = m(null), q = V(async () => {
    try {
      const a = await b({ limit: t, offset: c });
      L(a.deposits), I(a.total), g?.(a), D(null);
    } catch (a) {
      const f = a && typeof a == "object" && "message" in a ? String(a.message) : "Failed to load pending withdrawals";
      D(f);
    }
  }, [t, c, b, g]);
  S(() => {
    F(0);
  }, [t]), S(() => {
    q();
  }, [q]), S(() => {
    if (i <= 0) return;
    const a = setInterval(q, i);
    return () => clearInterval(a);
  }, [i, q]), S(() => {
    if (!k) return;
    const a = setTimeout(() => C(null), 5e3);
    return () => clearTimeout(a);
  }, [k]);
  const Q = Math.ceil(W / t), K = Math.floor(c / t) + 1, J = (a) => {
    const f = (a - 1) * t;
    F(Math.max(0, Math.min(f, Math.max(0, W - 1))));
  }, X = async (a, f = !1) => {
    if (!f && ae(a.withdrawalAvailableAt)) {
      H(a);
      return;
    }
    s(a.id), C(null);
    try {
      const A = await O(a.id, { force: f });
      A.success ? (C({
        type: "success",
        message: `Withdrawal processed: ${A.txSignature?.slice(0, 12)}...`
      }), w?.(A), await q()) : C({
        type: "error",
        message: A.error || "Failed to process withdrawal"
      });
    } catch (A) {
      C({
        type: "error",
        message: A instanceof Error ? A.message : "Failed to process withdrawal"
      });
    } finally {
      s(null), H(null);
    }
  }, se = async () => {
    if (d.length !== 0) {
      T(!0), C(null);
      try {
        const a = await P();
        a.totalSucceeded > 0 ? C({
          type: "success",
          message: `Processed ${a.totalSucceeded}/${a.totalProcessed} withdrawals`
        }) : a.totalFailed > 0 && C({
          type: "error",
          message: `Failed to process ${a.totalFailed} withdrawals`
        }), p?.(a), await q();
      } catch (a) {
        C({
          type: "error",
          message: a instanceof Error ? a.message : "Failed to process withdrawals"
        });
      } finally {
        T(!1);
      }
    }
  }, Y = N || h;
  return Y ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-withdrawal-queue cedros-admin-withdrawal-queue-error ${y}`,
      children: [
        /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: Y }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              E(), D(null), q();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : $ && d.length === 0 && !j && !u ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-withdrawal-queue cedros-admin-withdrawal-queue-loading ${y}`,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading withdrawal queue..." })
      ]
    }
  ) : /* @__PURE__ */ r("div", { className: `cedros-admin-withdrawal-queue ${y}`, children: [
    R && /* @__PURE__ */ e(
      "div",
      {
        className: "cedros-admin-modal-overlay",
        onClick: () => H(null),
        onKeyDown: (a) => a.key === "Escape" && H(null),
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "early-withdrawal-title",
        children: /* @__PURE__ */ r(
          "div",
          {
            className: "cedros-admin-modal cedros-admin-modal-warning",
            onClick: (a) => a.stopPropagation(),
            onKeyDown: () => {
            },
            role: "document",
            children: [
              /* @__PURE__ */ e("h3", { id: "early-withdrawal-title", className: "cedros-admin-modal-title", children: "Early Withdrawal Warning" }),
              /* @__PURE__ */ r("div", { className: "cedros-admin-modal-content", children: [
                /* @__PURE__ */ e("p", { className: "cedros-admin-modal-warning-text", children: /* @__PURE__ */ e("strong", { children: "This deposit is still within its privacy period." }) }),
                /* @__PURE__ */ e("p", { children: "Processing this withdrawal early may compromise user privacy. The privacy period exists to provide plausible deniability for deposits." }),
                /* @__PURE__ */ r("p", { className: "cedros-admin-modal-details", children: [
                  "User: ",
                  te(R.userId),
                  /* @__PURE__ */ e("br", {}),
                  "Amount: ",
                  z(R.amountLamports),
                  /* @__PURE__ */ e("br", {}),
                  "Available at:",
                  " ",
                  R.withdrawalAvailableAt ? ee(R.withdrawalAvailableAt) : "—"
                ] }),
                /* @__PURE__ */ e("p", { children: "Are you sure you want to process this withdrawal early?" })
              ] }),
              /* @__PURE__ */ r("div", { className: "cedros-admin-modal-actions", children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: "cedros-button cedros-button-outline",
                    onClick: () => H(null),
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: "cedros-button cedros-button-danger",
                    onClick: () => X(R, !0),
                    disabled: j === R.id,
                    children: j === R.id ? "Processing..." : "Process Early"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    k && /* @__PURE__ */ e(
      "div",
      {
        className: `cedros-admin-result cedros-admin-result-${k.type}`,
        role: "status",
        "aria-live": "polite",
        children: k.message
      }
    ),
    /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-queue-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-withdrawal-queue-title", children: "Pending Withdrawals" }),
      /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-queue-actions", children: [
        /* @__PURE__ */ r("span", { className: "cedros-admin-queue-count", children: [
          W,
          " pending"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: q,
            disabled: $ || u,
            title: "Refresh queue",
            "aria-label": "Refresh queue",
            children: $ && !u ? "..." : "↻"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-sm",
            onClick: se,
            disabled: $ || u || d.length === 0,
            title: "Process all ready withdrawals",
            children: u ? "Processing..." : "Process All"
          }
        )
      ] })
    ] }),
    d.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No pending withdrawals." }) }) : /* @__PURE__ */ r(G, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-table", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${v === "userId" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => M("userId"),
              "aria-label": "Sort by user",
              children: [
                "User",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: v === "userId" ? l === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${v === "amountLamports" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => M("amountLamports"),
              "aria-label": "Sort by amount",
              children: [
                "Amount",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: v === "amountLamports" ? l === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${v === "withdrawalAvailableAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => M("withdrawalAvailableAt"),
              "aria-label": "Sort by ready since",
              children: [
                "Ready Since",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: v === "withdrawalAvailableAt" ? l === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-th", children: "Waiting" }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-th cedros-admin-withdrawal-th-action", children: "Action" })
        ] }),
        U.map((a) => {
          const f = ae(a.withdrawalAvailableAt), A = j === a.id;
          return /* @__PURE__ */ r(
            "div",
            {
              className: `cedros-admin-withdrawal-row ${f ? "cedros-admin-withdrawal-row-early" : ""}`,
              onClick: () => o?.(a),
              onKeyDown: (x) => {
                (x.key === "Enter" || x.key === " ") && (x.preventDefault(), o?.(a));
              },
              role: o ? "button" : void 0,
              tabIndex: o ? 0 : void 0,
              children: [
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td", title: a.userId, children: te(a.userId) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td", children: z(a.amountLamports) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td", children: a.withdrawalAvailableAt ? ee(a.withdrawalAvailableAt) : "—" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td cedros-admin-withdrawal-waiting", children: a.withdrawalAvailableAt ? f ? "In privacy period" : ne(a.withdrawalAvailableAt) : "—" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td cedros-admin-withdrawal-td-action", children: /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: `cedros-button cedros-button-sm ${f ? "cedros-button-warning" : "cedros-button-primary"}`,
                    onClick: (x) => {
                      x.stopPropagation(), X(a);
                    },
                    disabled: A || u,
                    title: f ? "Early withdrawal (requires confirmation)" : "Process this withdrawal",
                    children: A ? "..." : f ? "Early" : "Process"
                  }
                ) })
              ]
            },
            a.id
          );
        })
      ] }),
      Q > 1 && /* @__PURE__ */ r("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => J(K - 1),
            disabled: K <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ r("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          K,
          " of ",
          Q,
          " (",
          W,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => J(K + 1),
            disabled: K >= Q,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function ie(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function oe(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function de(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function ce(t) {
  const i = new Date(t), y = /* @__PURE__ */ new Date(), g = i.getTime() - y.getTime();
  if (g <= 0) return "Ready";
  const o = Math.floor(g / 6e4), w = Math.floor(o / 60), p = Math.floor(w / 24);
  if (p > 0) {
    const b = w % 24;
    return b > 0 ? `${p}d ${b}h` : `${p}d`;
  }
  if (w > 0) {
    const b = o % 60;
    return b > 0 ? `${w}h ${b}m` : `${w}h`;
  }
  return `${o}m`;
}
function ge({
  pageSize: t = 20,
  refreshInterval: i = 0,
  className: y = "",
  onLoad: g,
  onItemClick: o
}) {
  const { listInPrivacyPeriod: w, isLoading: p, error: b, clearError: O } = B(), [P, $] = m([]), [h, E] = m(0), [d, L] = m(0), [W, I] = m(null), c = V(async () => {
    try {
      const n = await w({ limit: t, offset: d });
      $(n.deposits), E(n.total), g?.(n), I(null);
    } catch (n) {
      const l = n && typeof n == "object" && "message" in n ? String(n.message) : "Failed to load deposits";
      I(l);
    }
  }, [t, d, w, g]);
  S(() => {
    L(0);
  }, [t]), S(() => {
    c();
  }, [c]), S(() => {
    if (i <= 0) return;
    const n = setInterval(c, i);
    return () => clearInterval(n);
  }, [i, c]);
  const F = Math.ceil(h / t), N = Math.floor(d / t) + 1, D = (n) => {
    const l = (n - 1) * t;
    L(Math.max(0, Math.min(l, Math.max(0, h - 1))));
  }, v = W || b;
  return v ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-privacy-deposits cedros-admin-privacy-deposits-error ${y}`,
      children: [
        /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: v }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              O(), I(null), c();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : p && P.length === 0 ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-privacy-deposits cedros-admin-privacy-deposits-loading ${y}`,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading deposits..." })
      ]
    }
  ) : /* @__PURE__ */ r("div", { className: `cedros-admin-privacy-deposits ${y}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-privacy-deposits-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-privacy-deposits-title", children: "In Privacy Period" }),
      /* @__PURE__ */ r("div", { className: "cedros-admin-privacy-deposits-actions", children: [
        /* @__PURE__ */ r("span", { className: "cedros-admin-queue-count", children: [
          h,
          " deposit",
          h !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: c,
            disabled: p,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: p ? "..." : "↻"
          }
        )
      ] })
    ] }),
    P.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No deposits in privacy period." }) }) : /* @__PURE__ */ r(G, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-privacy-table", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-privacy-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-admin-sort-button",
              "aria-label": "Sort by user",
              children: [
                "User ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-admin-sort-button",
              "aria-label": "Sort by amount",
              children: [
                "Amount ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-admin-sort-button",
              "aria-label": "Sort by deposited",
              children: [
                "Deposited ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-admin-sort-button",
              "aria-label": "Sort by ready in",
              children: [
                "Ready In ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: "↕" })
              ]
            }
          ) })
        ] }),
        P.map((n) => /* @__PURE__ */ r(
          "div",
          {
            className: "cedros-admin-privacy-row",
            onClick: () => o?.(n),
            onKeyDown: (l) => {
              (l.key === "Enter" || l.key === " ") && (l.preventDefault(), o?.(n));
            },
            role: o ? "button" : void 0,
            tabIndex: o ? 0 : void 0,
            children: [
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td", title: n.userId, children: de(n.userId) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td", children: ie(n.amountLamports) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td", children: n.completedAt ? oe(n.completedAt) : "—" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td cedros-admin-privacy-remaining", children: n.withdrawalAvailableAt ? ce(n.withdrawalAvailableAt) : "—" })
            ]
          },
          n.id
        ))
      ] }),
      F > 1 && /* @__PURE__ */ r("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => D(N - 1),
            disabled: N <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ r("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          N,
          " of ",
          F,
          " (",
          h,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => D(N + 1),
            disabled: N >= F,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function le(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function ue(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function me(t) {
  return t.length <= 16 ? t : `${t.slice(0, 8)}...${t.slice(-6)}`;
}
function he(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function Ne({
  pageSize: t = 20,
  refreshInterval: i = 0,
  className: y = "",
  onLoad: g,
  onItemClick: o
}) {
  const { listDeposits: w, isLoading: p, error: b, clearError: O } = B(), [P, $] = m([]), [h, E] = m(0), [d, L] = m(0), [W, I] = m(null), [c, F] = m("completedAt"), [N, D] = m("desc"), v = (s) => {
    c === s ? D(N === "asc" ? "desc" : "asc") : (F(s), D("desc"));
  }, n = re(() => [...P].sort((s, u) => {
    let T, k;
    switch (c) {
      case "userId":
        T = s.userId.toLowerCase(), k = u.userId.toLowerCase();
        break;
      case "amountLamports":
        T = s.amountLamports ?? 0, k = u.amountLamports ?? 0;
        break;
      case "completedAt":
        T = s.completedAt ? new Date(s.completedAt).getTime() : 0, k = u.completedAt ? new Date(u.completedAt).getTime() : 0;
        break;
      case "withdrawalTxSignature":
        T = s.withdrawalTxSignature || "", k = u.withdrawalTxSignature || "";
        break;
      default:
        return 0;
    }
    return T < k ? N === "asc" ? -1 : 1 : T > k ? N === "asc" ? 1 : -1 : 0;
  }), [P, c, N]), l = V(async () => {
    try {
      const s = await w({ status: "withdrawn", limit: t, offset: d });
      $(s.deposits), E(s.total), g?.(s), I(null);
    } catch (s) {
      const u = s && typeof s == "object" && "message" in s ? String(s.message) : "Failed to load withdrawal history";
      I(u);
    }
  }, [t, d, w, g]);
  S(() => {
    L(0);
  }, [t]), S(() => {
    l();
  }, [l]), S(() => {
    if (i <= 0) return;
    const s = setInterval(l, i);
    return () => clearInterval(s);
  }, [i, l]);
  const _ = Math.ceil(h / t), M = Math.floor(d / t) + 1, U = (s) => {
    const u = (s - 1) * t;
    L(Math.max(0, Math.min(u, Math.max(0, h - 1))));
  }, j = W || b;
  return j ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-withdrawal-history cedros-admin-withdrawal-history-error ${y}`,
      children: [
        /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: j }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              O(), I(null), l();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : p && P.length === 0 ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-withdrawal-history cedros-admin-withdrawal-history-loading ${y}`,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading withdrawal history..." })
      ]
    }
  ) : /* @__PURE__ */ r("div", { className: `cedros-admin-withdrawal-history ${y}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-history-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-withdrawal-history-title", children: "Withdrawal History" }),
      /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-history-actions", children: [
        /* @__PURE__ */ r("span", { className: "cedros-admin-queue-count", children: [
          h,
          " withdrawal",
          h !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: l,
            disabled: p,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: p ? "..." : "↻"
          }
        )
      ] })
    ] }),
    P.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No withdrawals processed yet." }) }) : /* @__PURE__ */ r(G, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-history-table", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-history-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-history-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${c === "userId" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => v("userId"),
              "aria-label": "Sort by user",
              children: [
                "User",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: c === "userId" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-history-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${c === "amountLamports" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => v("amountLamports"),
              "aria-label": "Sort by amount",
              children: [
                "Amount",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: c === "amountLamports" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-history-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${c === "completedAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => v("completedAt"),
              "aria-label": "Sort by processed",
              children: [
                "Processed",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: c === "completedAt" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ e("div", { className: "cedros-admin-history-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${c === "withdrawalTxSignature" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => v("withdrawalTxSignature"),
              "aria-label": "Sort by transaction",
              children: [
                "Transaction",
                " ",
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: c === "withdrawalTxSignature" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) })
        ] }),
        n.map((s) => /* @__PURE__ */ r(
          "div",
          {
            className: "cedros-admin-history-row",
            onClick: () => o?.(s),
            onKeyDown: (u) => {
              (u.key === "Enter" || u.key === " ") && (u.preventDefault(), o?.(s));
            },
            role: o ? "button" : void 0,
            tabIndex: o ? 0 : void 0,
            children: [
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", title: s.userId, children: he(s.userId) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", children: le(s.amountLamports) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", children: s.completedAt ? ue(s.completedAt) : "—" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", children: s.withdrawalTxSignature ? /* @__PURE__ */ e(
                "a",
                {
                  href: `https://orbmarkets.io/tx/${s.withdrawalTxSignature}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "cedros-admin-tx-link",
                  onClick: (u) => u.stopPropagation(),
                  title: s.withdrawalTxSignature,
                  children: me(s.withdrawalTxSignature)
                }
              ) : "—" })
            ]
          },
          s.id
        ))
      ] }),
      _ > 1 && /* @__PURE__ */ r("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => U(M - 1),
            disabled: M <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ r("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          M,
          " of ",
          _,
          " (",
          h,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => U(M + 1),
            disabled: M >= _,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
export {
  ve as A,
  ge as a,
  fe as b,
  Ne as c
};
