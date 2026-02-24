import { jsxs as t, jsx as e } from "react/jsx-runtime";
import { useEffect as f } from "react";
import { L as v } from "./LoadingSpinner-6vml-zwr.js";
import { E as S } from "./ErrorMessage-CcEK0pYO.js";
import { u as y, A as N, S as L } from "./AutosaveStatus-Ciyt350A.js";
function $({
  title: d,
  description: c,
  categories: g,
  className: r = ""
}) {
  const {
    settings: i,
    edits: l,
    isLoading: m,
    autosaveStatus: h,
    autosaveError: p,
    error: n,
    fetchSettings: a,
    handleChange: u
  } = y();
  f(() => {
    a();
  }, [a]);
  const o = g.filter((s) => i[s]?.length > 0);
  return m && Object.keys(i).length === 0 ? /* @__PURE__ */ t("div", { className: `cedros-system-settings cedros-system-settings-loading ${r}`, children: [
    /* @__PURE__ */ e(v, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : n ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${r}`, children: /* @__PURE__ */ e(S, { error: n.message }) }) : /* @__PURE__ */ t("div", { className: `cedros-system-settings ${r}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ t("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: d }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: c })
      ] }),
      /* @__PURE__ */ e(N, { status: h, error: p })
    ] }),
    o.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ e("p", { children: "No settings found for this section." }) }) : o.map((s) => /* @__PURE__ */ e(
      L,
      {
        settings: i[s],
        edits: l,
        onChange: u
      },
      s
    ))
  ] });
}
export {
  $ as S
};
