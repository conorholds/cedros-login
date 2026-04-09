import { jsxs as r, jsx as s, Fragment as C } from "react/jsx-runtime";
import { useState as c } from "react";
import { b as k } from "./useOrgs-PRReHJVn.js";
import { P as h } from "./EmailRegisterForm-DrtZJXIS.js";
import { E as R, L as S } from "./ErrorMessage-DObd7075.js";
import { v as x } from "./validation-B8kMV3BL.js";
function F({
  token: w,
  onSuccess: p,
  onLoginClick: t,
  className: i = ""
}) {
  const [a, b] = c(""), [n, f] = c(""), [d, l] = c(null), { resetPassword: v, isLoading: o, isSuccess: g, error: N, clearError: y } = k(), u = a === n, m = d?.isValid && u && a.length > 0, P = async (e) => {
    if (e.preventDefault(), !!m)
      try {
        await v(w, a), p?.();
      } catch {
      }
  };
  return g ? /* @__PURE__ */ r("div", { className: `cedros-reset-password-success ${i}`, children: [
    /* @__PURE__ */ r(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ s("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ s(
            "path",
            {
              d: "M14 24l7 7 13-13",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ s("h3", { className: "cedros-success-title", children: "Password reset successful" }),
    /* @__PURE__ */ s("p", { className: "cedros-success-message", children: "Your password has been reset. You can now log in with your new password." }),
    t && /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-primary",
        onClick: t,
        children: "Go to login"
      }
    )
  ] }) : /* @__PURE__ */ r("form", { className: `cedros-reset-password-form ${i}`, onSubmit: P, children: [
    /* @__PURE__ */ r("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ s("h3", { className: "cedros-form-title", children: "Reset your password" }),
      /* @__PURE__ */ s("p", { className: "cedros-form-subtitle", children: "Enter your new password below." })
    ] }),
    /* @__PURE__ */ s(R, { error: N, onDismiss: y }),
    /* @__PURE__ */ s("div", { className: "cedros-form-field", children: /* @__PURE__ */ s(
      h,
      {
        label: "New password",
        value: a,
        onChange: (e) => {
          b(e.target.value), l(x(e.target.value));
        },
        showStrengthMeter: !0,
        onValidationChange: l,
        disabled: o,
        autoComplete: "new-password",
        error: d && !d.isValid ? Object.values(d.errors).find(Boolean) : void 0
      }
    ) }),
    /* @__PURE__ */ s("div", { className: "cedros-form-field", children: /* @__PURE__ */ s(
      h,
      {
        label: "Confirm password",
        value: n,
        onChange: (e) => f(e.target.value),
        disabled: o,
        autoComplete: "new-password",
        error: n && !u ? "Passwords do not match" : void 0
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ s(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: o || !m,
          children: o ? /* @__PURE__ */ r(C, { children: [
            /* @__PURE__ */ s(S, { size: "sm" }),
            "Resetting..."
          ] }) : "Reset password"
        }
      ),
      t && /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: t,
          disabled: o,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
export {
  F as R
};
