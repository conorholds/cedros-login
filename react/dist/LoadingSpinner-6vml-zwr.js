import { createContext as e, memo as d } from "react";
import { jsxs as a, jsx as r } from "react/jsx-runtime";
const f = e(null), x = e(null), C = e(null), m = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48
  // H-04: Added for WalletUnlock component
}, k = d(function({
  size: i = "md",
  className: c = "",
  style: l,
  label: t = "Loading",
  announce: n = !1
}) {
  const s = m[i], o = /* @__PURE__ */ a(
    "svg",
    {
      className: `cedros-spinner ${c}`,
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: "none",
      style: l,
      "aria-label": t,
      role: "status",
      "aria-hidden": n ? "true" : void 0,
      children: [
        /* @__PURE__ */ r(
          "circle",
          {
            className: "cedros-spinner-track",
            cx: "12",
            cy: "12",
            r: "10",
            stroke: "currentColor",
            strokeWidth: "3",
            strokeOpacity: "0.25"
          }
        ),
        /* @__PURE__ */ r(
          "circle",
          {
            className: "cedros-spinner-head",
            cx: "12",
            cy: "12",
            r: "10",
            stroke: "currentColor",
            strokeWidth: "3",
            strokeLinecap: "round",
            strokeDasharray: "31.4 31.4",
            transform: "rotate(-90 12 12)",
            children: /* @__PURE__ */ r(
              "animateTransform",
              {
                attributeName: "transform",
                type: "rotate",
                from: "0 12 12",
                to: "360 12 12",
                dur: "1s",
                repeatCount: "indefinite"
              }
            )
          }
        )
      ]
    }
  );
  return n ? /* @__PURE__ */ a("span", { "aria-live": "polite", "aria-busy": "true", children: [
    o,
    /* @__PURE__ */ r("span", { className: "cedros-sr-only", children: t })
  ] }) : o;
});
export {
  f as A,
  C,
  k as L,
  x as a
};
