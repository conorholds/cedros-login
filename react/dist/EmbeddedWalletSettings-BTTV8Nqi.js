import { jsxs as s, jsx as e } from "react/jsx-runtime";
import { useEffect as k, useMemo as x } from "react";
import { L } from "./LoadingSpinner-6vml-zwr.js";
import { E as W } from "./ErrorMessage-CcEK0pYO.js";
import { u as C, A as M, S as $ } from "./AutosaveStatus-BKc7T2Tw.js";
const d = ["wallet_recovery_mode"];
function q({ className: n }) {
  const {
    settings: c,
    edits: p,
    isLoading: b,
    autosaveStatus: v,
    autosaveError: f,
    error: g,
    fetchSettings: h,
    handleChange: i,
    getEffectiveValue: r
  } = C();
  k(() => {
    h();
  }, [h]);
  const m = (c.features ?? []).filter((l) => d.includes(l.key)).sort((l, E) => d.indexOf(l.key) - d.indexOf(E.key)), t = r("feature_wallet_signing") === "true", w = () => {
    i("feature_wallet_signing", t ? "false" : "true");
  }, a = r("feature_user_withdrawals") === "true", N = () => {
    i("feature_user_withdrawals", a ? "false" : "true");
  }, u = r("deposit_privacy_enabled") === "true", y = r("wallet_recovery_mode"), o = u && y !== "none", S = u && !t, _ = x(() => {
    if (o)
      return {
        wallet_recovery_mode: "Private deposits require No Recovery mode. Deposits will fail with the current setting."
      };
  }, [o]);
  return b && Object.keys(c).length === 0 ? /* @__PURE__ */ s("div", { className: `cedros-system-settings cedros-system-settings-loading ${n ?? ""}`, children: [
    /* @__PURE__ */ e(L, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : g ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${n ?? ""}`, children: /* @__PURE__ */ e(W, { error: g.message }) }) : /* @__PURE__ */ s("div", { className: `cedros-system-settings ${n ?? ""}`, children: [
    /* @__PURE__ */ s("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ s("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "Embedded Wallet" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure the embedded wallet for transaction signing." })
      ] }),
      /* @__PURE__ */ s("div", { className: "cedros-settings-page-header-actions", children: [
        /* @__PURE__ */ s(
          "button",
          {
            type: "button",
            role: "switch",
            "aria-checked": t,
            className: `cedros-toggle ${t ? "cedros-toggle-on" : "cedros-toggle-off"}`,
            onClick: w,
            children: [
              /* @__PURE__ */ e("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ e("span", { className: "cedros-toggle-thumb" }) }),
              /* @__PURE__ */ e("span", { className: "cedros-toggle-label", children: t ? "Enabled" : "Disabled" })
            ]
          }
        ),
        /* @__PURE__ */ e(M, { status: v, error: f })
      ] })
    ] }),
    t && /* @__PURE__ */ e("div", { className: "cedros-settings-subsection", children: /* @__PURE__ */ s("div", { className: "cedros-settings-subsection-header", children: [
      /* @__PURE__ */ s("div", { children: [
        /* @__PURE__ */ e("h3", { className: "cedros-settings-subsection-title", children: "User Withdrawals" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-subsection-description", children: "Allow users to withdraw SOL/SPL tokens from their embedded wallet to external addresses." })
      ] }),
      /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          role: "switch",
          "aria-checked": a,
          className: `cedros-toggle ${a ? "cedros-toggle-on" : "cedros-toggle-off"}`,
          onClick: N,
          children: [
            /* @__PURE__ */ e("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ e("span", { className: "cedros-toggle-thumb" }) }),
            /* @__PURE__ */ e("span", { className: "cedros-toggle-label", children: a ? "Enabled" : "Disabled" })
          ]
        }
      )
    ] }) }),
    o && /* @__PURE__ */ e("div", { className: "cedros-settings-warning-banner", children: "Private deposits are enabled but require No Recovery mode. Users will see an error when attempting private deposits until recovery mode is changed below." }),
    S && /* @__PURE__ */ e("div", { className: "cedros-settings-warning-banner", children: "Private deposits are enabled but require the embedded wallet. Enable it above." }),
    /* @__PURE__ */ e("div", { className: "cedros-admin-tab-content", children: m.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ e("p", { children: "No additional settings available." }) }) : /* @__PURE__ */ e(
      $,
      {
        settings: m,
        edits: p,
        onChange: i,
        externalWarnings: _
      }
    ) })
  ] });
}
export {
  q as E
};
