import { jsxs as i, jsx as e } from "react/jsx-runtime";
import { memo as l, useRef as a, useEffect as d } from "react";
const m = l(function({
  error: r,
  className: n = "",
  onDismiss: o,
  autoFocus: s = !1
}) {
  const t = a(null);
  if (d(() => {
    r && s && t.current && t.current.focus();
  }, [r, s]), !r) return null;
  const c = typeof r == "string" ? r : r.message;
  return /* @__PURE__ */ i(
    "div",
    {
      ref: t,
      className: `cedros-error ${n}`,
      role: "alert",
      "aria-live": "assertive",
      tabIndex: s ? -1 : void 0,
      children: [
        /* @__PURE__ */ i(
          "svg",
          {
            className: "cedros-error-icon",
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "7", stroke: "currentColor", strokeWidth: "1.5" }),
              /* @__PURE__ */ e("path", { d: "M8 4.5v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
              /* @__PURE__ */ e("circle", { cx: "8", cy: "11", r: "0.75", fill: "currentColor" })
            ]
          }
        ),
        /* @__PURE__ */ e("span", { className: "cedros-error-message", children: c }),
        o && /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-error-dismiss",
            onClick: o,
            "aria-label": "Dismiss error",
            children: /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ e(
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
  m as E
};
