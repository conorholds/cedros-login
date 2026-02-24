import { jsxs as a, jsx as i, Fragment as F } from "react/jsx-runtime";
import { useState as T, useEffect as j, useMemo as y, useCallback as L } from "react";
import { L as $ } from "./LoadingSpinner-6vml-zwr.js";
import { E as A } from "./ErrorMessage-CcEK0pYO.js";
import { u as M, A as B, S as k } from "./AutosaveStatus-Ciyt350A.js";
const w = [
  {
    id: "deposits",
    label: "Deposits",
    categories: ["deposit.general"],
    includeKeys: [
      "deposit_company_token",
      "deposit_max_usd",
      "deposit_min_usd",
      "deposit_micro_enabled",
      "deposit_gasless_swap_enabled",
      "solana_rpc_url",
      "jupiter_api_key"
    ]
  },
  {
    id: "tokens",
    label: "Component",
    categories: ["deposit"],
    includeKeys: [
      "deposit_show_explainer",
      "deposit_quick_action_tokens",
      "deposit_custom_tokens",
      "deposit_custom_tokens_json"
    ]
  },
  {
    id: "fees",
    label: "Fees",
    categories: ["deposit"],
    includeKeys: [
      "deposit_fee_policy",
      "privacy_fee_fixed_lamports",
      "privacy_fee_percent_bps",
      "swap_fee_fixed_lamports",
      "swap_fee_percent_bps",
      "company_fee_fixed_lamports",
      "company_fee_percent_bps",
      "private_deposit_min_lamports"
    ]
  },
  {
    id: "privacy",
    label: "Privacy",
    categories: ["deposit.general", "privacy", "withdrawal"],
    includeKeys: [
      // Enable toggle
      "deposit_privacy_enabled",
      // Privacy period setting
      "privacy_period_secs",
      // Withdrawal settings (from privacy pool)
      "withdrawal_percentage",
      "withdrawal_min_lamports",
      // Partial withdrawal settings (related to privacy mixing)
      "partial_withdrawal_count",
      "partial_withdrawal_min_lamports"
    ],
    sections: [
      {
        title: "Privacy Pool Worker",
        description: "Background worker for processing withdrawals from the privacy cash pool.",
        keys: ["withdrawal_poll_interval_secs", "withdrawal_batch_size"]
      }
    ]
  },
  {
    id: "treasury",
    label: "Treasury",
    categories: ["withdrawal", "deposit"],
    includeKeys: [
      // Treasury wallet (separate section)
      "treasury_wallet_address"
    ],
    sections: [
      {
        title: "Micropayment Batch Worker",
        description: "Background worker for batching small SOL deposits together.",
        keys: ["micro_batch_threshold_usd", "micro_batch_poll_secs"]
      }
    ]
  }
];
function z({ className: p }) {
  const {
    settings: _,
    edits: f,
    isLoading: S,
    autosaveStatus: x,
    autosaveError: N,
    error: h,
    fetchSettings: b,
    handleChange: u,
    getEffectiveValue: n
  } = M(), [m, K] = T("deposits");
  j(() => {
    b();
  }, [b]);
  const s = w.find((e) => e.id === m), c = y(() => {
    if (!s) return [];
    const e = [];
    for (const t of s.categories) {
      const r = _[t] ?? [];
      e.push(...r);
    }
    return e;
  }, [_, s]), o = n("deposit_fee_policy") || "company_pays_all", g = y(() => {
    if (!s) return [];
    let e = c;
    if (s.includeKeys && s.includeKeys.length > 0 ? (e = e.filter((t) => s.includeKeys.includes(t.key)), e.sort(
      (t, r) => s.includeKeys.indexOf(t.key) - s.includeKeys.indexOf(r.key)
    )) : s.excludeKeys && s.excludeKeys.length > 0 && (e = e.filter((t) => !s.excludeKeys.includes(t.key))), s.id === "deposits" && (parseFloat(n("deposit_min_usd")) || 0) > 10 && (e = e.filter((r) => r.key !== "deposit_micro_enabled")), s.id === "fees") {
      const t = [
        "privacy_fee_fixed_lamports",
        "privacy_fee_percent_bps",
        "private_deposit_min_lamports"
      ], r = ["swap_fee_fixed_lamports", "swap_fee_percent_bps"], v = ["company_fee_fixed_lamports", "company_fee_percent_bps"];
      e = e.filter((l) => l.key === "deposit_fee_policy" ? !0 : o === "company_pays_all" ? !1 : t.includes(l.key) ? o === "user_pays_privacy" || o === "user_pays_all" : r.includes(l.key) ? o === "user_pays_swap" || o === "user_pays_all" : v.includes(l.key) ? o === "user_pays_all" : !0);
    }
    return e;
  }, [c, s, n, o]), C = L(
    (e) => c.filter((t) => e.includes(t.key)).sort((t, r) => e.indexOf(t.key) - e.indexOf(r.key)),
    [c]
  ), E = y(() => {
    if (s?.id !== "deposits") return;
    const e = {}, t = parseFloat(n("deposit_min_usd")) || 0, r = n("deposit_micro_enabled");
    return (r === "false" || r === "0" || r === "") && t < 10 && (e.deposit_min_usd = "SOL micro payments must be enabled for minimum deposits under $10."), Object.keys(e).length > 0 ? e : void 0;
  }, [s?.id, n]), d = n("feature_credits") === "true", O = () => {
    u("feature_credits", d ? "false" : "true");
  };
  return S && Object.keys(_).length === 0 ? /* @__PURE__ */ a("div", { className: `cedros-system-settings cedros-system-settings-loading ${p ?? ""}`, children: [
    /* @__PURE__ */ i($, {}),
    /* @__PURE__ */ i("span", { children: "Loading settings..." })
  ] }) : h ? /* @__PURE__ */ i("div", { className: `cedros-system-settings ${p ?? ""}`, children: /* @__PURE__ */ i(A, { error: h.message }) }) : /* @__PURE__ */ a("div", { className: `cedros-system-settings ${p ?? ""}`, children: [
    /* @__PURE__ */ a("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ a("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ i("h2", { className: "cedros-settings-page-title", children: "Credit System" }),
        /* @__PURE__ */ i("p", { className: "cedros-settings-page-description", children: "Configure credit deposits, timed withdrawals, and privacy period settings." })
      ] }),
      /* @__PURE__ */ a("div", { className: "cedros-settings-page-header-actions", children: [
        /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            role: "switch",
            "aria-checked": d,
            className: `cedros-toggle ${d ? "cedros-toggle-on" : "cedros-toggle-off"}`,
            onClick: O,
            children: [
              /* @__PURE__ */ i("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ i("span", { className: "cedros-toggle-thumb" }) }),
              /* @__PURE__ */ i("span", { className: "cedros-toggle-label", children: d ? "Enabled" : "Disabled" })
            ]
          }
        ),
        /* @__PURE__ */ i(B, { status: x, error: N })
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: w.map((e) => /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${m === e.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => K(e.id),
        "aria-selected": m === e.id,
        role: "tab",
        children: e.label
      },
      e.id
    )) }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: g.length === 0 && !s?.sections?.length ? /* @__PURE__ */ i("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ a("p", { children: [
      "No settings found for ",
      s?.label ?? "this section",
      "."
    ] }) }) : /* @__PURE__ */ a(F, { children: [
      g.length > 0 && /* @__PURE__ */ i(
        k,
        {
          settings: g,
          edits: f,
          onChange: u,
          externalWarnings: E
        }
      ),
      s?.sections?.map((e) => {
        const t = C(e.keys);
        return t.length === 0 ? null : /* @__PURE__ */ a("div", { className: "cedros-settings-subsection", children: [
          /* @__PURE__ */ a("div", { className: "cedros-settings-subsection-header", children: [
            /* @__PURE__ */ i("h4", { className: "cedros-settings-subsection-title", children: e.title }),
            e.description && /* @__PURE__ */ i("p", { className: "cedros-settings-subsection-description", children: e.description })
          ] }),
          /* @__PURE__ */ i(
            k,
            {
              settings: t,
              edits: f,
              onChange: u
            }
          )
        ] }, e.title);
      })
    ] }) })
  ] });
}
export {
  z as C
};
