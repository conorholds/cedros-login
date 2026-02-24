import { jsxs as s, jsx as e } from "react/jsx-runtime";
import { useEffect as v } from "react";
import { L as S } from "./LoadingSpinner-6vml-zwr.js";
import { E } from "./ErrorMessage-CcEK0pYO.js";
import { u as y, A as k, S as _ } from "./AutosaveStatus-Ciyt350A.js";
const l = ["wallet_recovery_mode"];
function O({ className: r }) {
  const {
    settings: d,
    edits: m,
    isLoading: u,
    autosaveStatus: f,
    autosaveError: p,
    error: o,
    fetchSettings: c,
    handleChange: n,
    getEffectiveValue: g
  } = y();
  v(() => {
    c();
  }, [c]);
  const h = (d.features ?? []).filter((i) => l.includes(i.key)).sort((i, w) => l.indexOf(i.key) - l.indexOf(w.key)), t = g("feature_wallet_signing") === "true", b = () => {
    n("feature_wallet_signing", t ? "false" : "true");
  }, a = g("feature_user_withdrawals") === "true", N = () => {
    n("feature_user_withdrawals", a ? "false" : "true");
  };
  return u && Object.keys(d).length === 0 ? /* @__PURE__ */ s("div", { className: `cedros-system-settings cedros-system-settings-loading ${r ?? ""}`, children: [
    /* @__PURE__ */ e(S, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : o ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${r ?? ""}`, children: /* @__PURE__ */ e(E, { error: o.message }) }) : /* @__PURE__ */ s("div", { className: `cedros-system-settings ${r ?? ""}`, children: [
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
            onClick: b,
            children: [
              /* @__PURE__ */ e("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ e("span", { className: "cedros-toggle-thumb" }) }),
              /* @__PURE__ */ e("span", { className: "cedros-toggle-label", children: t ? "Enabled" : "Disabled" })
            ]
          }
        ),
        /* @__PURE__ */ e(k, { status: f, error: p })
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
    /* @__PURE__ */ e("div", { className: "cedros-admin-tab-content", children: h.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ e("p", { children: "No additional settings available." }) }) : /* @__PURE__ */ e(_, { settings: h, edits: m, onChange: n }) })
  ] });
}
export {
  O as E
};
