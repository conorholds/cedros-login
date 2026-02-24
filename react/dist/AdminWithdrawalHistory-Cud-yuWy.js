import { jsxs as r, jsx as e, Fragment as J } from "react/jsx-runtime";
import { useState as h, useCallback as B, useEffect as P, useMemo as se } from "react";
import { u as Q } from "./useAdminDeposits-BTSyeAfg.js";
import { S as z } from "./StatsBar-BX-hHtTq.js";
function fe({
  refreshInterval: t = 0,
  refreshSignal: i,
  className: w = "",
  onLoad: b
}) {
  const { getStats: p, isLoading: n, error: N, clearError: y } = Q(), [$, j] = h(null), [k, x] = h(null), u = B(async () => {
    try {
      const d = await p();
      j(d), b?.(d), x(null);
    } catch (d) {
      const M = d && typeof d == "object" && "message" in d ? String(d.message) : "Failed to load stats";
      x(M);
    }
  }, [p, b]);
  P(() => {
    u();
  }, [u]), P(() => {
    i !== void 0 && u();
  }, [i, u]), P(() => {
    if (i !== void 0 || t <= 0) return;
    const d = setInterval(u, t);
    return () => clearInterval(d);
  }, [t, i, u]);
  const F = k || N;
  return F ? /* @__PURE__ */ r("div", { className: `cedros-admin-stats ${w}`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: F }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          y(), x(null), u();
        },
        children: "Retry"
      }
    )
  ] }) : n && !$ ? /* @__PURE__ */ e("div", { className: `cedros-admin-stats ${w}`, children: /* @__PURE__ */ e(
    z,
    {
      stats: [
        { label: "Total Withdrawn", value: 0 },
        { label: "Pending Withdraw", value: 0 },
        { label: "In Privacy Period", value: 0 },
        { label: "Microbatch (SOL)", value: "0.0000" }
      ],
      isLoading: !0
    }
  ) }) : $ ? /* @__PURE__ */ e("div", { className: `cedros-admin-stats ${w}`, children: /* @__PURE__ */ e(
    z,
    {
      stats: [
        { label: "Total Withdrawn", value: $.totalWithdrawnCount },
        { label: "Pending Withdraw", value: $.pendingWithdrawalCount },
        { label: "In Privacy Period", value: $.inPrivacyPeriodCount ?? 0 },
        { label: "Microbatch (SOL)", value: $.readyForWithdrawalSol?.toFixed(4) ?? "0.0000" }
      ],
      isLoading: n,
      onRefresh: u
    }
  ) }) : null;
}
function ee(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function te(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function ae(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function oe(t) {
  const i = new Date(t), b = (/* @__PURE__ */ new Date()).getTime() - i.getTime(), p = Math.floor(b / 6e4), n = Math.floor(p / 60), N = Math.floor(n / 24);
  return N > 0 ? `${N}d ago` : n > 0 ? `${n}h ago` : p > 0 ? `${p}m ago` : "just now";
}
function re(t) {
  return t ? new Date(t) > /* @__PURE__ */ new Date() : !0;
}
function Ne({
  pageSize: t = 20,
  refreshInterval: i = 0,
  refreshSignal: w,
  className: b = "",
  onLoad: p,
  onItemClick: n,
  onWithdrawalProcessed: N,
  onAllProcessed: y
}) {
  const {
    listPendingWithdrawals: $,
    processWithdrawal: j,
    processAllWithdrawals: k,
    isLoading: x,
    error: u,
    clearError: F
  } = Q(), [d, M] = h([]), [R, T] = h(0), [c, q] = h(0), [g, C] = h(null), [v, o] = h("withdrawalAvailableAt"), [l, H] = h("asc"), S = (a) => {
    v === a ? H(l === "asc" ? "desc" : "asc") : (o(a), H(a === "withdrawalAvailableAt" ? "asc" : "desc"));
  }, V = se(() => [...d].sort((a, f) => {
    let A, I;
    switch (v) {
      case "userId":
        A = a.userId.toLowerCase(), I = f.userId.toLowerCase();
        break;
      case "amountLamports":
        A = a.amountLamports ?? 0, I = f.amountLamports ?? 0;
        break;
      case "withdrawalAvailableAt":
        A = a.withdrawalAvailableAt ? new Date(a.withdrawalAvailableAt).getTime() : 0, I = f.withdrawalAvailableAt ? new Date(f.withdrawalAvailableAt).getTime() : 0;
        break;
      default:
        return 0;
    }
    return A < I ? l === "asc" ? -1 : 1 : A > I ? l === "asc" ? 1 : -1 : 0;
  }), [d, v, l]), [_, s] = h(null), [m, E] = h(!1), [L, W] = h(null), [O, K] = h(null), D = B(async () => {
    try {
      const a = await $({ limit: t, offset: c });
      M(a.deposits), T(a.total), p?.(a), C(null);
    } catch (a) {
      const f = a && typeof a == "object" && "message" in a ? String(a.message) : "Failed to load pending withdrawals";
      C(f);
    }
  }, [t, c, $, p]);
  P(() => {
    q(0);
  }, [t]), P(() => {
    D();
  }, [D]), P(() => {
    w !== void 0 && D();
  }, [w, D]), P(() => {
    if (w !== void 0 || i <= 0) return;
    const a = setInterval(D, i);
    return () => clearInterval(a);
  }, [i, w, D]), P(() => {
    if (!L) return;
    const a = setTimeout(() => W(null), 5e3);
    return () => clearTimeout(a);
  }, [L]);
  const G = Math.ceil(R / t), U = Math.floor(c / t) + 1, X = (a) => {
    const f = (a - 1) * t;
    q(Math.max(0, Math.min(f, Math.max(0, R - 1))));
  }, Y = async (a, f = !1) => {
    if (!f && re(a.withdrawalAvailableAt)) {
      K(a);
      return;
    }
    s(a.id), W(null);
    try {
      const A = await j(a.id, { force: f });
      A.success ? (W({
        type: "success",
        message: `Withdrawal processed: ${A.txSignature?.slice(0, 12)}...`
      }), N?.(A), await D()) : W({
        type: "error",
        message: A.error || "Failed to process withdrawal"
      });
    } catch (A) {
      W({
        type: "error",
        message: A instanceof Error ? A.message : "Failed to process withdrawal"
      });
    } finally {
      s(null), K(null);
    }
  }, ne = async () => {
    if (d.length !== 0) {
      E(!0), W(null);
      try {
        const a = await k();
        a.totalSucceeded > 0 ? W({
          type: "success",
          message: `Processed ${a.totalSucceeded}/${a.totalProcessed} withdrawals`
        }) : a.totalFailed > 0 && W({
          type: "error",
          message: `Failed to process ${a.totalFailed} withdrawals`
        }), y?.(a), await D();
      } catch (a) {
        W({
          type: "error",
          message: a instanceof Error ? a.message : "Failed to process withdrawals"
        });
      } finally {
        E(!1);
      }
    }
  }, Z = g || u;
  return Z ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-withdrawal-queue cedros-admin-withdrawal-queue-error ${b}`,
      children: [
        /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: Z }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              F(), C(null), D();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : x && d.length === 0 && !_ && !m ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-withdrawal-queue cedros-admin-withdrawal-queue-loading ${b}`,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading withdrawal queue..." })
      ]
    }
  ) : /* @__PURE__ */ r("div", { className: `cedros-admin-withdrawal-queue ${b}`, children: [
    O && /* @__PURE__ */ e(
      "div",
      {
        className: "cedros-admin-modal-overlay",
        onClick: () => K(null),
        onKeyDown: (a) => a.key === "Escape" && K(null),
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
                  ae(O.userId),
                  /* @__PURE__ */ e("br", {}),
                  "Amount: ",
                  ee(O.amountLamports),
                  /* @__PURE__ */ e("br", {}),
                  "Available at:",
                  " ",
                  O.withdrawalAvailableAt ? te(O.withdrawalAvailableAt) : "—"
                ] }),
                /* @__PURE__ */ e("p", { children: "Are you sure you want to process this withdrawal early?" })
              ] }),
              /* @__PURE__ */ r("div", { className: "cedros-admin-modal-actions", children: [
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: "cedros-button cedros-button-outline",
                    onClick: () => K(null),
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: "cedros-button cedros-button-danger",
                    onClick: () => Y(O, !0),
                    disabled: _ === O.id,
                    children: _ === O.id ? "Processing..." : "Process Early"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    L && /* @__PURE__ */ e(
      "div",
      {
        className: `cedros-admin-result cedros-admin-result-${L.type}`,
        role: "status",
        "aria-live": "polite",
        children: L.message
      }
    ),
    /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-queue-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-withdrawal-queue-title", children: "Pending Withdrawals" }),
      /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-queue-actions", children: [
        /* @__PURE__ */ r("span", { className: "cedros-admin-queue-count", children: [
          R,
          " pending"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: D,
            disabled: x || m,
            title: "Refresh queue",
            "aria-label": "Refresh queue",
            children: x && !m ? "..." : "↻"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-sm",
            onClick: ne,
            disabled: x || m || d.length === 0,
            title: "Process all ready withdrawals",
            children: m ? "Processing..." : "Process All"
          }
        )
      ] })
    ] }),
    d.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No pending withdrawals." }) }) : /* @__PURE__ */ r(J, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-table", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-thead", children: [
          /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-th", children: /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${v === "userId" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => S("userId"),
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
              onClick: () => S("amountLamports"),
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
              onClick: () => S("withdrawalAvailableAt"),
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
        V.map((a) => {
          const f = re(a.withdrawalAvailableAt), A = _ === a.id;
          return /* @__PURE__ */ r(
            "div",
            {
              className: `cedros-admin-withdrawal-row ${f ? "cedros-admin-withdrawal-row-early" : ""}`,
              onClick: () => n?.(a),
              onKeyDown: (I) => {
                (I.key === "Enter" || I.key === " ") && (I.preventDefault(), n?.(a));
              },
              role: n ? "button" : void 0,
              tabIndex: n ? 0 : void 0,
              children: [
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td", title: a.userId, children: ae(a.userId) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td", children: ee(a.amountLamports) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td", children: a.withdrawalAvailableAt ? te(a.withdrawalAvailableAt) : "—" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td cedros-admin-withdrawal-waiting", children: a.withdrawalAvailableAt ? f ? "In privacy period" : oe(a.withdrawalAvailableAt) : "—" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-withdrawal-td cedros-admin-withdrawal-td-action", children: /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: `cedros-button cedros-button-sm ${f ? "cedros-button-warning" : "cedros-button-primary"}`,
                    onClick: (I) => {
                      I.stopPropagation(), Y(a);
                    },
                    disabled: A || m,
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
      G > 1 && /* @__PURE__ */ r("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => X(U - 1),
            disabled: U <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ r("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          U,
          " of ",
          G,
          " (",
          R,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => X(U + 1),
            disabled: U >= G,
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
function de(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function ce(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function le(t) {
  const i = new Date(t), w = /* @__PURE__ */ new Date(), b = i.getTime() - w.getTime();
  if (b <= 0) return "Ready";
  const p = Math.floor(b / 6e4), n = Math.floor(p / 60), N = Math.floor(n / 24);
  if (N > 0) {
    const y = n % 24;
    return y > 0 ? `${N}d ${y}h` : `${N}d`;
  }
  if (n > 0) {
    const y = p % 60;
    return y > 0 ? `${n}h ${y}m` : `${n}h`;
  }
  return `${p}m`;
}
function ge({
  pageSize: t = 20,
  refreshInterval: i = 0,
  refreshSignal: w,
  className: b = "",
  onLoad: p,
  onItemClick: n
}) {
  const { listInPrivacyPeriod: N, isLoading: y, error: $, clearError: j } = Q(), [k, x] = h([]), [u, F] = h(0), [d, M] = h(0), [R, T] = h(null), c = B(async () => {
    try {
      const o = await N({ limit: t, offset: d });
      x(o.deposits), F(o.total), p?.(o), T(null);
    } catch (o) {
      const l = o && typeof o == "object" && "message" in o ? String(o.message) : "Failed to load deposits";
      T(l);
    }
  }, [t, d, N, p]);
  P(() => {
    M(0);
  }, [t]), P(() => {
    c();
  }, [c]), P(() => {
    w !== void 0 && c();
  }, [w, c]), P(() => {
    if (w !== void 0 || i <= 0) return;
    const o = setInterval(c, i);
    return () => clearInterval(o);
  }, [i, w, c]);
  const q = Math.ceil(u / t), g = Math.floor(d / t) + 1, C = (o) => {
    const l = (o - 1) * t;
    M(Math.max(0, Math.min(l, Math.max(0, u - 1))));
  }, v = R || $;
  return v ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-privacy-deposits cedros-admin-privacy-deposits-error ${b}`,
      children: [
        /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: v }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              j(), T(null), c();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : y && k.length === 0 ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-privacy-deposits cedros-admin-privacy-deposits-loading ${b}`,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading deposits..." })
      ]
    }
  ) : /* @__PURE__ */ r("div", { className: `cedros-admin-privacy-deposits ${b}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-privacy-deposits-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-privacy-deposits-title", children: "In Privacy Period" }),
      /* @__PURE__ */ r("div", { className: "cedros-admin-privacy-deposits-actions", children: [
        /* @__PURE__ */ r("span", { className: "cedros-admin-queue-count", children: [
          u,
          " deposit",
          u !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: c,
            disabled: y,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: y ? "..." : "↻"
          }
        )
      ] })
    ] }),
    k.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No deposits in privacy period." }) }) : /* @__PURE__ */ r(J, { children: [
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
        k.map((o) => /* @__PURE__ */ r(
          "div",
          {
            className: "cedros-admin-privacy-row",
            onClick: () => n?.(o),
            onKeyDown: (l) => {
              (l.key === "Enter" || l.key === " ") && (l.preventDefault(), n?.(o));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td", title: o.userId, children: ce(o.userId) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td", children: ie(o.amountLamports) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td", children: o.completedAt ? de(o.completedAt) : "—" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-privacy-td cedros-admin-privacy-remaining", children: o.withdrawalAvailableAt ? le(o.withdrawalAvailableAt) : "—" })
            ]
          },
          o.id
        ))
      ] }),
      q > 1 && /* @__PURE__ */ r("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => C(g - 1),
            disabled: g <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ r("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          g,
          " of ",
          q,
          " (",
          u,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => C(g + 1),
            disabled: g >= q,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function ue(t) {
  return t == null ? "—" : `${(t / 1e9).toFixed(4)} SOL`;
}
function me(t) {
  return new Date(t).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function he(t) {
  return t.length <= 16 ? t : `${t.slice(0, 8)}...${t.slice(-6)}`;
}
function we(t) {
  return t.length <= 12 ? t : `${t.slice(0, 6)}...${t.slice(-4)}`;
}
function Ae({
  pageSize: t = 20,
  refreshInterval: i = 0,
  refreshSignal: w,
  className: b = "",
  onLoad: p,
  onItemClick: n
}) {
  const { listDeposits: N, isLoading: y, error: $, clearError: j } = Q(), [k, x] = h([]), [u, F] = h(0), [d, M] = h(0), [R, T] = h(null), [c, q] = h("completedAt"), [g, C] = h("desc"), v = (s) => {
    c === s ? C(g === "asc" ? "desc" : "asc") : (q(s), C("desc"));
  }, o = se(() => [...k].sort((s, m) => {
    let E, L;
    switch (c) {
      case "userId":
        E = s.userId.toLowerCase(), L = m.userId.toLowerCase();
        break;
      case "amountLamports":
        E = s.amountLamports ?? 0, L = m.amountLamports ?? 0;
        break;
      case "completedAt":
        E = s.completedAt ? new Date(s.completedAt).getTime() : 0, L = m.completedAt ? new Date(m.completedAt).getTime() : 0;
        break;
      case "withdrawalTxSignature":
        E = s.withdrawalTxSignature || "", L = m.withdrawalTxSignature || "";
        break;
      default:
        return 0;
    }
    return E < L ? g === "asc" ? -1 : 1 : E > L ? g === "asc" ? 1 : -1 : 0;
  }), [k, c, g]), l = B(async () => {
    try {
      const s = await N({ status: "withdrawn", limit: t, offset: d });
      x(s.deposits), F(s.total), p?.(s), T(null);
    } catch (s) {
      const m = s && typeof s == "object" && "message" in s ? String(s.message) : "Failed to load withdrawal history";
      T(m);
    }
  }, [t, d, N, p]);
  P(() => {
    M(0);
  }, [t]), P(() => {
    l();
  }, [l]), P(() => {
    w !== void 0 && l();
  }, [w, l]), P(() => {
    if (w !== void 0 || i <= 0) return;
    const s = setInterval(l, i);
    return () => clearInterval(s);
  }, [i, w, l]);
  const H = Math.ceil(u / t), S = Math.floor(d / t) + 1, V = (s) => {
    const m = (s - 1) * t;
    M(Math.max(0, Math.min(m, Math.max(0, u - 1))));
  }, _ = R || $;
  return _ ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-withdrawal-history cedros-admin-withdrawal-history-error ${b}`,
      children: [
        /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: _ }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              j(), T(null), l();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : y && k.length === 0 ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-admin-withdrawal-history cedros-admin-withdrawal-history-loading ${b}`,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading withdrawal history..." })
      ]
    }
  ) : /* @__PURE__ */ r("div", { className: `cedros-admin-withdrawal-history ${b}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-history-header", children: [
      /* @__PURE__ */ e("h4", { className: "cedros-admin-withdrawal-history-title", children: "Withdrawal History" }),
      /* @__PURE__ */ r("div", { className: "cedros-admin-withdrawal-history-actions", children: [
        /* @__PURE__ */ r("span", { className: "cedros-admin-queue-count", children: [
          u,
          " withdrawal",
          u !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: l,
            disabled: y,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: y ? "..." : "↻"
          }
        )
      ] })
    ] }),
    k.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ e("p", { className: "cedros-admin-empty-message", children: "No withdrawals processed yet." }) }) : /* @__PURE__ */ r(J, { children: [
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
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: c === "userId" ? g === "asc" ? "↑" : "↓" : "↕" })
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
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: c === "amountLamports" ? g === "asc" ? "↑" : "↓" : "↕" })
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
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: c === "completedAt" ? g === "asc" ? "↑" : "↓" : "↕" })
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
                /* @__PURE__ */ e("span", { className: "cedros-admin-sort-icon", children: c === "withdrawalTxSignature" ? g === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) })
        ] }),
        o.map((s) => /* @__PURE__ */ r(
          "div",
          {
            className: "cedros-admin-history-row",
            onClick: () => n?.(s),
            onKeyDown: (m) => {
              (m.key === "Enter" || m.key === " ") && (m.preventDefault(), n?.(s));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", title: s.userId, children: we(s.userId) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", children: ue(s.amountLamports) }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", children: s.completedAt ? me(s.completedAt) : "—" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-history-td", children: s.withdrawalTxSignature ? /* @__PURE__ */ e(
                "a",
                {
                  href: `https://orbmarkets.io/tx/${s.withdrawalTxSignature}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "cedros-admin-tx-link",
                  onClick: (m) => m.stopPropagation(),
                  title: s.withdrawalTxSignature,
                  children: he(s.withdrawalTxSignature)
                }
              ) : "—" })
            ]
          },
          s.id
        ))
      ] }),
      H > 1 && /* @__PURE__ */ r("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => V(S - 1),
            disabled: S <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ r("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          S,
          " of ",
          H,
          " (",
          u,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => V(S + 1),
            disabled: S >= H,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
export {
  fe as A,
  ge as a,
  Ne as b,
  Ae as c
};
