import { jsxs as a, jsx as e, Fragment as X } from "react/jsx-runtime";
import { useMemo as Y, useState as t, useCallback as y, useEffect as z } from "react";
import { c as ee } from "./EmailRegisterForm-DrtZJXIS.js";
import { A as se } from "./adminUserApi-Cv3oWYoC.js";
const f = 20;
function D(r) {
  try {
    return new Date(r).toLocaleDateString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return r;
  }
}
function ae(r) {
  return !!r.expiresAt && new Date(r.expiresAt) < /* @__PURE__ */ new Date();
}
function te(r) {
  return r.maxUses !== null && r.currentUses >= r.maxUses;
}
function re(r) {
  return ae(r) ? "expired" : te(r) ? "exhausted" : "active";
}
function ne({ className: r = "" }) {
  const { config: i, _internal: I } = ee(), l = Y(
    () => new se(
      i.serverUrl,
      i.requestTimeout,
      i.retryAttempts,
      I?.getAccessToken
    ),
    [i.serverUrl, i.requestTimeout, i.retryAttempts, I]
  ), [m, H] = t("all"), [C, T] = t([]), [k, M] = t(0), [u, x] = t(0), [_, F] = t(!1), [A, $] = t(null), [d, J] = t(null), [v, L] = t(""), [h, P] = t(""), [g, q] = t(""), [n, B] = t(!1), [E, p] = t(null), [K, w] = t(!1), [R, j] = t(null), [O, G] = t(null), Q = {
    all: void 0,
    limited: "limited",
    user_invite: "user_invite"
  }, o = y(async () => {
    F(!0), $(null);
    try {
      const s = await l.listAccessCodes(f, u, Q[m]);
      T(s.items), M(s.total);
    } catch (s) {
      $(s instanceof Error ? s.message : "Failed to load access codes");
    } finally {
      F(!1);
    }
  }, [l, m, u]), N = y(async () => {
    try {
      const s = await l.getSignupStats();
      J(s);
    } catch {
    }
  }, [l]);
  z(() => {
    o(), N();
  }, [o, N]), z(() => {
    x(0);
  }, [m]);
  const V = y(
    async (s) => {
      if (s.preventDefault(), !v.trim()) {
        p("Code is required.");
        return;
      }
      const c = h.trim() ? parseInt(h, 10) : null;
      if (h.trim() && (isNaN(c) || c < 1)) {
        p("Max uses must be a positive integer.");
        return;
      }
      const b = g.trim() ? new Date(g).toISOString() : void 0;
      B(!0), p(null), w(!1);
      try {
        await l.createAccessCode(v.trim(), c, b), L(""), P(""), q(""), w(!0), o(), N();
      } catch (Z) {
        p(Z instanceof Error ? Z.message : "Failed to create code");
      } finally {
        B(!1);
      }
    },
    [l, v, h, g, o, N]
  ), W = y(
    async (s) => {
      j(s), G(null);
      try {
        await l.deleteAccessCode(s), T((c) => c.filter((b) => b.id !== s)), M((c) => c - 1);
      } catch (c) {
        G(c instanceof Error ? c.message : "Failed to delete code");
      } finally {
        j(null);
      }
    },
    [l]
  ), S = Math.ceil(k / f), U = Math.floor(u / f) + 1;
  return /* @__PURE__ */ a("div", { className: `cedros-admin-access-codes ${r}`, children: [
    /* @__PURE__ */ a("div", { className: "cedros-admin-access-codes__header", children: [
      /* @__PURE__ */ e("h2", { className: "cedros-admin-access-codes__title", children: "Access Codes" }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-admin__stats-bar-refresh",
          onClick: () => {
            o(), N();
          },
          disabled: _,
          title: "Refresh",
          "aria-label": "Refresh list",
          children: _ ? "..." : "↻"
        }
      )
    ] }),
    d && /* @__PURE__ */ a("div", { className: "cedros-admin-access-codes__stats-bar", "aria-label": "Signup statistics", children: [
      /* @__PURE__ */ a("span", { className: "cedros-admin-access-codes__stat", children: [
        /* @__PURE__ */ a("strong", { children: [
          "Signups this ",
          d.period,
          ":"
        ] }),
        " ",
        d.count,
        d.limit !== null ? ` / ${d.limit}` : ""
      ] }),
      /* @__PURE__ */ a("span", { className: "cedros-admin-access-codes__stat", children: [
        /* @__PURE__ */ e("strong", { children: "Period start:" }),
        " ",
        D(d.periodStart)
      ] })
    ] }),
    /* @__PURE__ */ a("section", { className: "cedros-admin-access-codes__create-section", "aria-label": "Create access code", children: [
      /* @__PURE__ */ e("h3", { className: "cedros-admin-access-codes__section-title", children: "Create Code" }),
      /* @__PURE__ */ a(
        "form",
        {
          className: "cedros-admin-access-codes__create-form",
          onSubmit: V,
          "aria-label": "Create access code form",
          children: [
            /* @__PURE__ */ a("div", { className: "cedros-form-field cedros-form-field--inline", children: [
              /* @__PURE__ */ e("label", { htmlFor: "ac-code", className: "cedros-label", children: "Code" }),
              /* @__PURE__ */ e(
                "input",
                {
                  id: "ac-code",
                  type: "text",
                  className: "cedros-input",
                  value: v,
                  onChange: (s) => {
                    L(s.target.value), p(null), w(!1);
                  },
                  placeholder: "e.g. BETA2025",
                  disabled: n,
                  required: !0
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "cedros-form-field cedros-form-field--inline", children: [
              /* @__PURE__ */ a("label", { htmlFor: "ac-max-uses", className: "cedros-label", children: [
                "Max Uses ",
                /* @__PURE__ */ e("span", { className: "cedros-optional", children: "(blank = unlimited)" })
              ] }),
              /* @__PURE__ */ e(
                "input",
                {
                  id: "ac-max-uses",
                  type: "number",
                  className: "cedros-input",
                  value: h,
                  onChange: (s) => P(s.target.value),
                  placeholder: "e.g. 100",
                  min: "1",
                  disabled: n
                }
              )
            ] }),
            /* @__PURE__ */ a("div", { className: "cedros-form-field cedros-form-field--inline", children: [
              /* @__PURE__ */ a("label", { htmlFor: "ac-expiry", className: "cedros-label", children: [
                "Expiry ",
                /* @__PURE__ */ e("span", { className: "cedros-optional", children: "(optional)" })
              ] }),
              /* @__PURE__ */ e(
                "input",
                {
                  id: "ac-expiry",
                  type: "date",
                  className: "cedros-input",
                  value: g,
                  onChange: (s) => q(s.target.value),
                  disabled: n
                }
              )
            ] }),
            /* @__PURE__ */ e(
              "button",
              {
                type: "submit",
                className: "cedros-button cedros-button-primary cedros-button-md",
                disabled: n,
                "aria-busy": n,
                children: n ? "Creating..." : "Create"
              }
            )
          ]
        }
      ),
      E && /* @__PURE__ */ e("div", { className: "cedros-admin-error", role: "alert", children: E }),
      K && !E && /* @__PURE__ */ e("div", { className: "cedros-admin-success", role: "status", children: "Code created." })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", role: "tablist", children: ["all", "limited", "user_invite"].map((s) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${m === s ? "cedros-admin-tab-active" : ""}`,
        onClick: () => H(s),
        "aria-selected": m === s,
        role: "tab",
        children: s === "all" ? "All" : s === "limited" ? "Limited" : "User Invite"
      },
      s
    )) }),
    O && /* @__PURE__ */ e("div", { className: "cedros-admin-error", role: "alert", children: O }),
    A && /* @__PURE__ */ a("div", { className: "cedros-admin-access-codes--error", children: [
      /* @__PURE__ */ e("p", { className: "cedros-admin-error", children: A }),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: o,
          children: "Retry"
        }
      )
    ] }),
    !A && /* @__PURE__ */ e("div", { role: "tabpanel", children: _ && C.length === 0 ? /* @__PURE__ */ a("div", { className: "cedros-admin-access-codes--loading", children: [
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ e("span", { className: "cedros-admin-loading-text", children: "Loading..." })
    ] }) : C.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-admin-empty-message", children: "No access codes found." }) : /* @__PURE__ */ a(X, { children: [
      /* @__PURE__ */ a(
        "div",
        {
          className: "cedros-admin-list-table cedros-admin-access-codes__table",
          role: "table",
          "aria-label": "Access codes",
          children: [
            /* @__PURE__ */ a("div", { className: "cedros-admin-list-thead", role: "row", children: [
              /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Code" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Type" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Uses" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Created By" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Created" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Expires" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Status" }),
              /* @__PURE__ */ e("div", { className: "cedros-admin-list-th", role: "columnheader", children: /* @__PURE__ */ e("span", { className: "cedros-sr-only", children: "Actions" }) })
            ] }),
            C.map((s) => {
              const c = re(s), b = s.maxUses !== null ? `${s.currentUses} / ${s.maxUses}` : `${s.currentUses}`;
              return /* @__PURE__ */ a("div", { className: "cedros-admin-list-row", role: "row", children: [
                /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ e("code", { className: "cedros-admin-access-codes__code", children: s.code }) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: s.codeType }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: b }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: s.createdByEmail ?? "—" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: D(s.createdAt) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: s.expiresAt ? D(s.expiresAt) : "—" }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ e("span", { className: `cedros-admin-access-codes__status cedros-admin-access-codes__status--${c}`, children: c.charAt(0).toUpperCase() + c.slice(1) }) }),
                /* @__PURE__ */ e("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ e(
                  "button",
                  {
                    type: "button",
                    className: "cedros-button cedros-button-danger cedros-button-sm",
                    onClick: () => W(s.id),
                    disabled: R === s.id,
                    "aria-label": `Delete code ${s.code}`,
                    children: R === s.id ? "..." : "Delete"
                  }
                ) })
              ] }, s.id);
            })
          ]
        }
      ),
      S > 1 && /* @__PURE__ */ a("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => x(Math.max(0, u - f)),
            disabled: U <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ a("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          U,
          " of ",
          S,
          " (",
          k,
          " total)"
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => x(u + f),
            disabled: U >= S,
            children: "Next"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  ne as AdminAccessCodes
};
