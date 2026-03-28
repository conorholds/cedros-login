import { jsxs as n, jsx as r } from "react/jsx-runtime";
import { memo as l, useRef as h, useEffect as m } from "react";
const u = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48
  // H-04: Added for WalletUnlock component
}, k = l(function({
  size: e = "md",
  className: a = "",
  style: i,
  label: s = "Loading",
  announce: t = !1
}) {
  const o = u[e], c = /* @__PURE__ */ n(
    "svg",
    {
      className: `cedros-spinner ${a}`,
      width: o,
      height: o,
      viewBox: "0 0 24 24",
      fill: "none",
      style: i,
      "aria-label": s,
      role: "status",
      "aria-hidden": t ? "true" : void 0,
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
  return t ? /* @__PURE__ */ n("span", { "aria-live": "polite", "aria-busy": "true", children: [
    c,
    /* @__PURE__ */ r("span", { className: "cedros-sr-only", children: s })
  ] }) : c;
}), g = l(function({
  error: e,
  className: a = "",
  onDismiss: i,
  autoFocus: s = !1
}) {
  const t = h(null);
  if (m(() => {
    e && s && t.current && t.current.focus();
  }, [e, s]), !e) return null;
  const o = typeof e == "string" ? e : e.message;
  return /* @__PURE__ */ n(
    "div",
    {
      ref: t,
      className: `cedros-error ${a}`,
      role: "alert",
      "aria-live": "assertive",
      tabIndex: s ? -1 : void 0,
      children: [
        /* @__PURE__ */ n(
          "svg",
          {
            className: "cedros-error-icon",
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "7", stroke: "currentColor", strokeWidth: "1.5" }),
              /* @__PURE__ */ r("path", { d: "M8 4.5v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
              /* @__PURE__ */ r("circle", { cx: "8", cy: "11", r: "0.75", fill: "currentColor" })
            ]
          }
        ),
        /* @__PURE__ */ r("span", { className: "cedros-error-message", children: o }),
        i && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-error-dismiss",
            onClick: i,
            "aria-label": "Dismiss error",
            children: /* @__PURE__ */ r("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ r(
              "path",
              {
                d: "M10.5 3.5L3.5 10.5M3.5 3.5l7 7",
                stroke: "currentColor",
                strokeWidth: "1.5",
                strokeLinecap: "round"
              }
            ) })
          }
        )
      ]
    }
  );
});
export {
  g as E,
  k as L
};
