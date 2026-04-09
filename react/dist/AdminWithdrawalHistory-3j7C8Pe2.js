import { jsxs as a, jsx as t, Fragment as G } from "react/jsx-runtime";
import { useState as y, useCallback as U, useEffect as g, useMemo as ee } from "react";
import { u as V } from "./useAdminDeposits-yA9wshTw.js";
import { S as z } from "./StatsBar-BX-hHtTq.js";
function ge({
  refreshInterval: e = 0,
  refreshSignal: o,
  className: c = "",
  onLoad: i
}) {
  const { getStats: l, isLoading: n, error: v, clearError: w } = V(), [A, q] = y(null), [$, k] = y(null), b = U(async () => {
    try {
      const u = await l();
      q(u), i?.(u), k(null);
    } catch (u) {
      const D = u && typeof u == "object" && "message" in u ? String(u.message) : "Failed to load stats";
      k(D);
    }
  }, [l, i]);
  g(() => {
    b();
  }, [b]), g(() => {
    o !== void 0 && b();
  }, [o, b]), g(() => {
    if (o !== void 0 || e <= 0) return;
    const u = setInterval(b, e);
    return () => clearInterval(u);
  }, [e, o, b]);
  const S = $ || v;
  return S ? /* @__PURE__ */ a("div", { className: `cedros-admin-stats ${c}`, children: [
    /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: S }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline",
        onClick: () => {
          w(), k(null), b();
        },
        children: "Retry"
      }
    )
  ] }) : n && !A ? /* @__PURE__ */ t("div", { className: `cedros-admin-stats ${c}`, children: /* @__PURE__ */ t(
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
  ) }) : A ? /* @__PURE__ */ t("div", { className: `cedros-admin-stats ${c}`, children: /* @__PURE__ */ t(
    z,
    {
      stats: [
        { label: "Total Withdrawn", value: A.totalWithdrawnCount },
        { label: "Pending Withdraw", value: A.pendingWithdrawalCount },
        { label: "In Privacy Period", value: A.inPrivacyPeriodCount ?? 0 },
        { label: "Microbatch (SOL)", value: A.readyForWithdrawalSol?.toFixed(4) ?? "0.0000" }
      ],
      isLoading: n,
      onRefresh: b
    }
  ) }) : null;
}
function te(e) {
  return e == null ? "—" : `${(e / 1e9).toFixed(4)} SOL`;
}
function ae(e) {
  return new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function re(e) {
  return e.length <= 12 ? e : `${e.slice(0, 6)}...${e.slice(-4)}`;
}
function ne(e) {
  const o = new Date(e), i = (/* @__PURE__ */ new Date()).getTime() - o.getTime(), l = Math.floor(i / 6e4), n = Math.floor(l / 60), v = Math.floor(n / 24);
  return v > 0 ? `${v}d ago` : n > 0 ? `${n}h ago` : l > 0 ? `${l}m ago` : "just now";
}
function se(e) {
  return e ? new Date(e) > /* @__PURE__ */ new Date() : !0;
}
function ie({
  item: e,
  processingId: o,
  onConfirm: c,
  onCancel: i
}) {
  return /* @__PURE__ */ t(
    "div",
    {
      className: "cedros-admin-modal-overlay",
      onClick: i,
      onKeyDown: (l) => l.key === "Escape" && i(),
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "early-withdrawal-title",
      children: /* @__PURE__ */ a(
        "div",
        {
          className: "cedros-admin-modal cedros-admin-modal-warning",
          onClick: (l) => l.stopPropagation(),
          onKeyDown: () => {
          },
          role: "document",
          children: [
            /* @__PURE__ */ t("h3", { id: "early-withdrawal-title", className: "cedros-admin-modal-title", children: "Early Withdrawal Warning" }),
            /* @__PURE__ */ a("div", { className: "cedros-admin-modal-content", children: [
              /* @__PURE__ */ t("p", { className: "cedros-admin-modal-warning-text", children: /* @__PURE__ */ t("strong", { children: "This deposit is still within its privacy period." }) }),
              /* @__PURE__ */ t("p", { children: "Processing this withdrawal early may compromise user privacy. The privacy period exists to provide plausible deniability for deposits." }),
              /* @__PURE__ */ a("p", { className: "cedros-admin-modal-details", children: [
                "User: ",
                re(e.userId),
                /* @__PURE__ */ t("br", {}),
                "Amount: ",
                te(e.amountLamports),
                /* @__PURE__ */ t("br", {}),
                "Available at:",
                " ",
                e.withdrawalAvailableAt ? ae(e.withdrawalAvailableAt) : "—"
              ] }),
              /* @__PURE__ */ t("p", { children: "Are you sure you want to process this withdrawal early?" })
            ] }),
            /* @__PURE__ */ a("div", { className: "cedros-admin-modal-actions", children: [
              /* @__PURE__ */ t(
                "button",
                {
                  type: "button",
                  className: "cedros-button cedros-button-outline",
                  onClick: i,
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ t(
                "button",
                {
                  type: "button",
                  className: "cedros-button cedros-button-danger",
                  onClick: () => c(e, !0),
                  disabled: o === e.id,
                  children: o === e.id ? "Processing..." : "Process Early"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function de({
  item: e,
  processingId: o,
  processingAll: c,
  onItemClick: i,
  onProcess: l
}) {
  const n = se(e.withdrawalAvailableAt), v = o === e.id;
  return /* @__PURE__ */ a(
    "div",
    {
      className: `cedros-admin-withdrawal-row ${n ? "cedros-admin-withdrawal-row-early" : ""}`,
      onClick: () => i?.(e),
      onKeyDown: (w) => {
        (w.key === "Enter" || w.key === " ") && (w.preventDefault(), i?.(e));
      },
      role: i ? "button" : void 0,
      tabIndex: i ? 0 : void 0,
      children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-withdrawal-td", title: e.userId, children: re(e.userId) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-withdrawal-td", children: te(e.amountLamports) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-withdrawal-td", children: e.withdrawalAvailableAt ? ae(e.withdrawalAvailableAt) : "—" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-withdrawal-td cedros-admin-withdrawal-waiting", children: e.withdrawalAvailableAt ? n ? "In privacy period" : ne(e.withdrawalAvailableAt) : "—" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-withdrawal-td cedros-admin-withdrawal-td-action", children: /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: `cedros-button cedros-button-sm ${n ? "cedros-button-warning" : "cedros-button-primary"}`,
            onClick: (w) => {
              w.stopPropagation(), l(e);
            },
            disabled: v || c,
            title: n ? "Early withdrawal (requires confirmation)" : "Process this withdrawal",
            children: v ? "..." : n ? "Early" : "Process"
          }
        ) })
      ]
    },
    e.id
  );
}
function Ae({
  pageSize: e = 20,
  refreshInterval: o = 0,
  refreshSignal: c,
  className: i = "",
  onLoad: l,
  onItemClick: n,
  onWithdrawalProcessed: v,
  onAllProcessed: w
}) {
  const {
    listPendingWithdrawals: A,
    processWithdrawal: q,
    processAllWithdrawals: $,
    isLoading: k,
    error: b,
    clearError: S
  } = V(), [u, D] = y([]), [F, I] = y(0), [m, R] = y(0), [N, T] = y(null), [f, d] = y("withdrawalAvailableAt"), [h, O] = y("asc"), C = (r) => {
    f === r ? O(h === "asc" ? "desc" : "asc") : (d(r), O(r === "withdrawalAvailableAt" ? "asc" : "desc"));
  }, K = ee(() => [...u].sort((r, L) => {
    let P, H;
    switch (f) {
      case "userId":
        P = r.userId.toLowerCase(), H = L.userId.toLowerCase();
        break;
      case "amountLamports":
        P = r.amountLamports ?? 0, H = L.amountLamports ?? 0;
        break;
      case "withdrawalAvailableAt":
        P = r.withdrawalAvailableAt ? new Date(r.withdrawalAvailableAt).getTime() : 0, H = L.withdrawalAvailableAt ? new Date(L.withdrawalAvailableAt).getTime() : 0;
        break;
      default:
        return 0;
    }
    return P < H ? h === "asc" ? -1 : 1 : P > H ? h === "asc" ? 1 : -1 : 0;
  }), [u, f, h]), [j, s] = y(null), [p, W] = y(!1), [x, E] = y(null), [J, B] = y(null), M = U(async () => {
    try {
      const r = await A({ limit: e, offset: m });
      D(r.deposits), I(r.total), l?.(r), T(null);
    } catch (r) {
      const L = r && typeof r == "object" && "message" in r ? String(r.message) : "Failed to load pending withdrawals";
      T(L);
    }
  }, [e, m, A, l]);
  g(() => {
    R(0);
  }, [e]), g(() => {
    M();
  }, [M]), g(() => {
    c !== void 0 && M();
  }, [c, M]), g(() => {
    if (c !== void 0 || o <= 0) return;
    const r = setInterval(M, o);
    return () => clearInterval(r);
  }, [o, c, M]), g(() => {
    if (!x) return;
    const r = setTimeout(() => E(null), 5e3);
    return () => clearTimeout(r);
  }, [x]);
  const Q = Math.ceil(F / e), _ = Math.floor(m / e) + 1, X = (r) => {
    const L = (r - 1) * e;
    R(Math.max(0, Math.min(L, Math.max(0, F - 1))));
  }, Y = async (r, L = !1) => {
    if (!L && se(r.withdrawalAvailableAt)) {
      B(r);
      return;
    }
    s(r.id), E(null);
    try {
      const P = await q(r.id, { force: L });
      P.success ? (E({
        type: "success",
        message: `Withdrawal processed: ${P.txSignature?.slice(0, 12)}...`
      }), v?.(P), await M()) : E({
        type: "error",
        message: P.error || "Failed to process withdrawal"
      });
    } catch (P) {
      E({
        type: "error",
        message: P instanceof Error ? P.message : "Failed to process withdrawal"
      });
    } finally {
      s(null), B(null);
    }
  }, oe = async () => {
    if (u.length !== 0) {
      W(!0), E(null);
      try {
        const r = await $();
        r.totalSucceeded > 0 ? E({
          type: "success",
          message: `Processed ${r.totalSucceeded}/${r.totalProcessed} withdrawals`
        }) : r.totalFailed > 0 && E({
          type: "error",
          message: `Failed to process ${r.totalFailed} withdrawals`
        }), w?.(r), await M();
      } catch (r) {
        E({
          type: "error",
          message: r instanceof Error ? r.message : "Failed to process withdrawals"
        });
      } finally {
        W(!1);
      }
    }
  }, Z = N || b;
  return Z ? /* @__PURE__ */ a(
    "div",
    {
      className: `cedros-admin-withdrawal-queue cedros-admin-withdrawal-queue-error ${i}`,
      children: [
        /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: Z }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              S(), T(null), M();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : k && u.length === 0 && !j && !p ? /* @__PURE__ */ a(
    "div",
    {
      className: `cedros-admin-withdrawal-queue cedros-admin-withdrawal-queue-loading ${i}`,
      children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading withdrawal queue..." })
      ]
    }
  ) : /* @__PURE__ */ a("div", { className: `cedros-admin-withdrawal-queue ${i}`, children: [
    J && /* @__PURE__ */ t(
      ie,
      {
        item: J,
        processingId: j,
        onConfirm: Y,
        onCancel: () => B(null)
      }
    ),
    x && /* @__PURE__ */ t(
      "div",
      {
        className: `cedros-admin-result cedros-admin-result-${x.type}`,
        role: "status",
        "aria-live": "polite",
        children: x.message
      }
    ),
    /* @__PURE__ */ a("div", { className: "cedros-admin-withdrawal-queue-header", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-admin-withdrawal-queue-title", children: "Pending Withdrawals" }),
      /* @__PURE__ */ a("div", { className: "cedros-admin-withdrawal-queue-actions", children: [
        /* @__PURE__ */ a("span", { className: "cedros-admin-queue-count", children: [
          F,
          " pending"
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: M,
            disabled: k || p,
            title: "Refresh queue",
            "aria-label": "Refresh queue",
            children: k && !p ? "..." : "↻"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-sm",
            onClick: oe,
            disabled: k || p || u.length === 0,
            title: "Process all ready withdrawals",
            children: p ? "Processing..." : "Process All"
          }
        )
      ] })
    ] }),
    u.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ t("p", { className: "cedros-admin-empty-message", children: "No pending withdrawals." }) }) : /* @__PURE__ */ a(G, { children: [
      /* @__PURE__ */ a("div", { className: "cedros-admin-withdrawal-table", children: [
        /* @__PURE__ */ a("div", { className: "cedros-admin-withdrawal-thead", children: [
          /* @__PURE__ */ t("div", { className: "cedros-admin-withdrawal-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${f === "userId" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => C("userId"),
              "aria-label": "Sort by user",
              children: [
                "User",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: f === "userId" ? h === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-withdrawal-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${f === "amountLamports" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => C("amountLamports"),
              "aria-label": "Sort by amount",
              children: [
                "Amount",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: f === "amountLamports" ? h === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-withdrawal-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${f === "withdrawalAvailableAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => C("withdrawalAvailableAt"),
              "aria-label": "Sort by ready since",
              children: [
                "Ready Since",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: f === "withdrawalAvailableAt" ? h === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-withdrawal-th", children: "Waiting" }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-withdrawal-th cedros-admin-withdrawal-th-action", children: "Action" })
        ] }),
        K.map((r) => /* @__PURE__ */ t(
          de,
          {
            item: r,
            processingId: j,
            processingAll: p,
            onItemClick: n,
            onProcess: Y
          },
          r.id
        ))
      ] }),
      Q > 1 && /* @__PURE__ */ a("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => X(_ - 1),
            disabled: _ <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ a("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          _,
          " of ",
          Q,
          " (",
          F,
          " total)"
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => X(_ + 1),
            disabled: _ >= Q,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function ce(e) {
  return e == null ? "—" : `${(e / 1e9).toFixed(4)} SOL`;
}
function le(e) {
  return new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function ue(e) {
  return e.length <= 12 ? e : `${e.slice(0, 6)}...${e.slice(-4)}`;
}
function me(e) {
  const o = new Date(e), c = /* @__PURE__ */ new Date(), i = o.getTime() - c.getTime();
  if (i <= 0) return "Ready";
  const l = Math.floor(i / 6e4), n = Math.floor(l / 60), v = Math.floor(n / 24);
  if (v > 0) {
    const w = n % 24;
    return w > 0 ? `${v}d ${w}h` : `${v}d`;
  }
  if (n > 0) {
    const w = l % 60;
    return w > 0 ? `${n}h ${w}m` : `${n}h`;
  }
  return `${l}m`;
}
function Pe({
  pageSize: e = 20,
  refreshInterval: o = 0,
  refreshSignal: c,
  className: i = "",
  onLoad: l,
  onItemClick: n
}) {
  const { listInPrivacyPeriod: v, isLoading: w, error: A, clearError: q } = V(), [$, k] = y([]), [b, S] = y(0), [u, D] = y(0), [F, I] = y(null), m = U(async () => {
    try {
      const d = await v({ limit: e, offset: u });
      k(d.deposits), S(d.total), l?.(d), I(null);
    } catch (d) {
      const h = d && typeof d == "object" && "message" in d ? String(d.message) : "Failed to load deposits";
      I(h);
    }
  }, [e, u, v, l]);
  g(() => {
    D(0);
  }, [e]), g(() => {
    m();
  }, [m]), g(() => {
    c !== void 0 && m();
  }, [c, m]), g(() => {
    if (c !== void 0 || o <= 0) return;
    const d = setInterval(m, o);
    return () => clearInterval(d);
  }, [o, c, m]);
  const R = Math.ceil(b / e), N = Math.floor(u / e) + 1, T = (d) => {
    const h = (d - 1) * e;
    D(Math.max(0, Math.min(h, Math.max(0, b - 1))));
  }, f = F || A;
  return f ? /* @__PURE__ */ a(
    "div",
    {
      className: `cedros-admin-privacy-deposits cedros-admin-privacy-deposits-error ${i}`,
      children: [
        /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: f }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              q(), I(null), m();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : w && $.length === 0 ? /* @__PURE__ */ a(
    "div",
    {
      className: `cedros-admin-privacy-deposits cedros-admin-privacy-deposits-loading ${i}`,
      children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading deposits..." })
      ]
    }
  ) : /* @__PURE__ */ a("div", { className: `cedros-admin-privacy-deposits ${i}`, children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-privacy-deposits-header", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-admin-privacy-deposits-title", children: "In Privacy Period" }),
      /* @__PURE__ */ a("div", { className: "cedros-admin-privacy-deposits-actions", children: [
        /* @__PURE__ */ a("span", { className: "cedros-admin-queue-count", children: [
          b,
          " deposit",
          b !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: m,
            disabled: w,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: w ? "..." : "↻"
          }
        )
      ] })
    ] }),
    $.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ t("p", { className: "cedros-admin-empty-message", children: "No deposits in privacy period." }) }) : /* @__PURE__ */ a(G, { children: [
      /* @__PURE__ */ a("div", { className: "cedros-admin-privacy-table", children: [
        /* @__PURE__ */ a("div", { className: "cedros-admin-privacy-thead", children: [
          /* @__PURE__ */ t("div", { className: "cedros-admin-privacy-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: "cedros-admin-sort-button",
              "aria-label": "Sort by user",
              children: [
                "User ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-privacy-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: "cedros-admin-sort-button",
              "aria-label": "Sort by amount",
              children: [
                "Amount ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-privacy-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: "cedros-admin-sort-button",
              "aria-label": "Sort by deposited",
              children: [
                "Deposited ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-privacy-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: "cedros-admin-sort-button",
              "aria-label": "Sort by ready in",
              children: [
                "Ready In ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: "↕" })
              ]
            }
          ) })
        ] }),
        $.map((d) => /* @__PURE__ */ a(
          "div",
          {
            className: "cedros-admin-privacy-row",
            onClick: () => n?.(d),
            onKeyDown: (h) => {
              (h.key === "Enter" || h.key === " ") && (h.preventDefault(), n?.(d));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ t("div", { className: "cedros-admin-privacy-td", title: d.userId, children: ue(d.userId) }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-privacy-td", children: ce(d.amountLamports) }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-privacy-td", children: d.completedAt ? le(d.completedAt) : "—" }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-privacy-td cedros-admin-privacy-remaining", children: d.withdrawalAvailableAt ? me(d.withdrawalAvailableAt) : "—" })
            ]
          },
          d.id
        ))
      ] }),
      R > 1 && /* @__PURE__ */ a("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => T(N - 1),
            disabled: N <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ a("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          N,
          " of ",
          R,
          " (",
          b,
          " total)"
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => T(N + 1),
            disabled: N >= R,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function he(e) {
  return e == null ? "—" : `${(e / 1e9).toFixed(4)} SOL`;
}
function we(e) {
  return new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function be(e) {
  return e.length <= 16 ? e : `${e.slice(0, 8)}...${e.slice(-6)}`;
}
function pe(e) {
  return e.length <= 12 ? e : `${e.slice(0, 6)}...${e.slice(-4)}`;
}
function $e({
  pageSize: e = 20,
  refreshInterval: o = 0,
  refreshSignal: c,
  className: i = "",
  onLoad: l,
  onItemClick: n
}) {
  const { listDeposits: v, isLoading: w, error: A, clearError: q } = V(), [$, k] = y([]), [b, S] = y(0), [u, D] = y(0), [F, I] = y(null), [m, R] = y("completedAt"), [N, T] = y("desc"), f = (s) => {
    m === s ? T(N === "asc" ? "desc" : "asc") : (R(s), T("desc"));
  }, d = ee(() => [...$].sort((s, p) => {
    let W, x;
    switch (m) {
      case "userId":
        W = s.userId.toLowerCase(), x = p.userId.toLowerCase();
        break;
      case "amountLamports":
        W = s.amountLamports ?? 0, x = p.amountLamports ?? 0;
        break;
      case "completedAt":
        W = s.completedAt ? new Date(s.completedAt).getTime() : 0, x = p.completedAt ? new Date(p.completedAt).getTime() : 0;
        break;
      case "withdrawalTxSignature":
        W = s.withdrawalTxSignature || "", x = p.withdrawalTxSignature || "";
        break;
      default:
        return 0;
    }
    return W < x ? N === "asc" ? -1 : 1 : W > x ? N === "asc" ? 1 : -1 : 0;
  }), [$, m, N]), h = U(async () => {
    try {
      const s = await v({ status: "withdrawn", limit: e, offset: u });
      k(s.deposits), S(s.total), l?.(s), I(null);
    } catch (s) {
      const p = s && typeof s == "object" && "message" in s ? String(s.message) : "Failed to load withdrawal history";
      I(p);
    }
  }, [e, u, v, l]);
  g(() => {
    D(0);
  }, [e]), g(() => {
    h();
  }, [h]), g(() => {
    c !== void 0 && h();
  }, [c, h]), g(() => {
    if (c !== void 0 || o <= 0) return;
    const s = setInterval(h, o);
    return () => clearInterval(s);
  }, [o, c, h]);
  const O = Math.ceil(b / e), C = Math.floor(u / e) + 1, K = (s) => {
    const p = (s - 1) * e;
    D(Math.max(0, Math.min(p, Math.max(0, b - 1))));
  }, j = F || A;
  return j ? /* @__PURE__ */ a(
    "div",
    {
      className: `cedros-admin-withdrawal-history cedros-admin-withdrawal-history-error ${i}`,
      children: [
        /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: j }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: () => {
              q(), I(null), h();
            },
            children: "Retry"
          }
        )
      ]
    }
  ) : w && $.length === 0 ? /* @__PURE__ */ a(
    "div",
    {
      className: `cedros-admin-withdrawal-history cedros-admin-withdrawal-history-loading ${i}`,
      children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading withdrawal history..." })
      ]
    }
  ) : /* @__PURE__ */ a("div", { className: `cedros-admin-withdrawal-history ${i}`, children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-withdrawal-history-header", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-admin-withdrawal-history-title", children: "Withdrawal History" }),
      /* @__PURE__ */ a("div", { className: "cedros-admin-withdrawal-history-actions", children: [
        /* @__PURE__ */ a("span", { className: "cedros-admin-queue-count", children: [
          b,
          " withdrawal",
          b !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: h,
            disabled: w,
            title: "Refresh list",
            "aria-label": "Refresh list",
            children: w ? "..." : "↻"
          }
        )
      ] })
    ] }),
    $.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-empty", children: /* @__PURE__ */ t("p", { className: "cedros-admin-empty-message", children: "No withdrawals processed yet." }) }) : /* @__PURE__ */ a(G, { children: [
      /* @__PURE__ */ a("div", { className: "cedros-admin-history-table", children: [
        /* @__PURE__ */ a("div", { className: "cedros-admin-history-thead", children: [
          /* @__PURE__ */ t("div", { className: "cedros-admin-history-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${m === "userId" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => f("userId"),
              "aria-label": "Sort by user",
              children: [
                "User",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: m === "userId" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-history-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${m === "amountLamports" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => f("amountLamports"),
              "aria-label": "Sort by amount",
              children: [
                "Amount",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: m === "amountLamports" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-history-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${m === "completedAt" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => f("completedAt"),
              "aria-label": "Sort by processed",
              children: [
                "Processed",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: m === "completedAt" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-history-th", children: /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: `cedros-admin-sort-button ${m === "withdrawalTxSignature" ? "cedros-admin-sort-active" : ""}`,
              onClick: () => f("withdrawalTxSignature"),
              "aria-label": "Sort by transaction",
              children: [
                "Transaction",
                " ",
                /* @__PURE__ */ t("span", { className: "cedros-admin-sort-icon", children: m === "withdrawalTxSignature" ? N === "asc" ? "↑" : "↓" : "↕" })
              ]
            }
          ) })
        ] }),
        d.map((s) => /* @__PURE__ */ a(
          "div",
          {
            className: "cedros-admin-history-row",
            onClick: () => n?.(s),
            onKeyDown: (p) => {
              (p.key === "Enter" || p.key === " ") && (p.preventDefault(), n?.(s));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ t("div", { className: "cedros-admin-history-td", title: s.userId, children: pe(s.userId) }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-history-td", children: he(s.amountLamports) }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-history-td", children: s.completedAt ? we(s.completedAt) : "—" }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-history-td", children: s.withdrawalTxSignature ? /* @__PURE__ */ t(
                "a",
                {
                  href: `https://orbmarkets.io/tx/${s.withdrawalTxSignature}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "cedros-admin-tx-link",
                  onClick: (p) => p.stopPropagation(),
                  title: s.withdrawalTxSignature,
                  children: be(s.withdrawalTxSignature)
                }
              ) : "—" })
            ]
          },
          s.id
        ))
      ] }),
      O > 1 && /* @__PURE__ */ a("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => K(C - 1),
            disabled: C <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ a("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          C,
          " of ",
          O,
          " (",
          b,
          " total)"
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => K(C + 1),
            disabled: C >= O,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
export {
  ge as A,
  Pe as a,
  Ae as b,
  $e as c
};
