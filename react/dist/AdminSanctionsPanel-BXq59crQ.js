import { jsxs as n, jsx as e } from "react/jsx-runtime";
import { useMemo as A, useState as c, useCallback as v, useEffect as C } from "react";
import { c as R } from "./EmailRegisterForm-DrtZJXIS.js";
import { A as $ } from "./adminUserApi-Cv3oWYoC.js";
function L(s) {
  return s === void 0 ? "—" : s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${Math.floor(s / 3600)}h ${Math.floor(s % 3600 / 60)}m`;
}
function E(s) {
  return s ? new Date(s).toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "—";
}
function I({ className: s = "" }) {
  const { config: t, _internal: u } = R(), o = A(
    () => new $(
      t.serverUrl,
      t.requestTimeout,
      t.retryAttempts,
      u?.getAccessToken
    ),
    [t.serverUrl, t.requestTimeout, t.retryAttempts, u]
  ), [a, _] = c(null), [d, h] = c(!1), [l, f] = c(null), [m, p] = c(!1), [g, N] = c(null), [S, b] = c(!1), i = v(async () => {
    h(!0), f(null);
    try {
      const r = await o.getSanctionsStats();
      _(r);
    } catch (r) {
      f(r instanceof Error ? r.message : "Failed to load sanctions stats");
    } finally {
      h(!1);
    }
  }, [o]);
  C(() => {
    i();
  }, [i]);
  const y = v(async () => {
    p(!0), N(null), b(!1);
    try {
      await o.refreshSanctions(), b(!0), await i();
    } catch (r) {
      N(r instanceof Error ? r.message : "Failed to refresh sanctions cache");
    } finally {
      p(!1);
    }
  }, [o, i]);
  return d && !a ? /* @__PURE__ */ n("div", { className: `cedros-admin-sanctions-panel ${s} cedros-admin-sanctions-panel--loading`, children: [
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading sanctions stats..." })
  ] }) : l && !a ? /* @__PURE__ */ n("div", { className: `cedros-admin-sanctions-panel ${s} cedros-admin-sanctions-panel--error`, children: [
    /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: l }),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: i,
        children: "Retry"
      }
    )
  ] }) : /* @__PURE__ */ n("div", { className: `cedros-admin-sanctions-panel ${s}`, children: [
    /* @__PURE__ */ n("div", { className: "cedros-admin-sanctions-panel__header", children: [
      /* @__PURE__ */ e("h2", { className: "cedros-admin-sanctions-panel__title", children: "Sanctions Screening" }),
      /* @__PURE__ */ n("div", { className: "cedros-admin-sanctions-panel__header-actions", children: [
        a !== null && /* @__PURE__ */ e(
          "span",
          {
            className: `cedros-admin-badge ${a.configured ? "cedros-admin-badge--approved" : "cedros-admin-badge--pending"}`,
            title: a.configured ? "Sanctions API configured" : "Sanctions API not configured",
            children: a.configured ? "Configured" : "Not Configured"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: i,
            disabled: d,
            title: "Refresh stats",
            "aria-label": "Refresh stats",
            children: d ? "..." : "↻"
          }
        )
      ] })
    ] }),
    a !== null && /* @__PURE__ */ n("div", { className: "cedros-admin-sanctions-panel__stats", children: [
      /* @__PURE__ */ n("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Sanctioned Addresses" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: a.sanctionedAddresses.toLocaleString() })
      ] }),
      /* @__PURE__ */ n("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Sanctioned Countries" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: a.sanctionedCountries.toLocaleString() })
      ] }),
      /* @__PURE__ */ n("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Cache Age" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: L(a.cacheAgeSeconds) })
      ] }),
      /* @__PURE__ */ n("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-label", children: "Last Refresh" }),
        /* @__PURE__ */ e("span", { className: "cedros-admin-stat-value", children: E(a.lastRefreshedAt) })
      ] })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-sanctions-panel__actions", children: /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-sm",
        onClick: y,
        disabled: m || d,
        "aria-busy": m,
        children: m ? "Refreshing..." : "Force Refresh"
      }
    ) }),
    S && /* @__PURE__ */ e("div", { className: "cedros-admin-sanctions-panel__result cedros-admin-sanctions-panel__result--success", children: "Sanctions cache refreshed successfully." }),
    g && /* @__PURE__ */ e("div", { className: "cedros-admin-sanctions-panel__result cedros-admin-sanctions-panel__result--error", children: g }),
    l && a && /* @__PURE__ */ e("p", { className: "cedros-admin-error cedros-admin-error--inline", children: l })
  ] });
}
export {
  I as AdminSanctionsPanel
};
