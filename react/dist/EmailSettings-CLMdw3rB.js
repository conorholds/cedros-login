import { jsxs as a, jsx as s } from "react/jsx-runtime";
import { useEffect as y, useMemo as L } from "react";
import { L as P } from "./LoadingSpinner-6vml-zwr.js";
import { E as w } from "./ErrorMessage-CcEK0pYO.js";
import { u as M, A, S as I } from "./AutosaveStatus-BKc7T2Tw.js";
const N = {
  mailgun: "smtp.mailgun.org",
  sendgrid: "smtp.sendgrid.net",
  postmark: "smtp.postmarkapp.com",
  ses: "email-smtp.us-east-1.amazonaws.com",
  resend: "smtp.resend.com"
}, k = [
  "email_provider",
  "email_smtp_password",
  "email_from_address",
  "email_from_name"
], C = [
  "email_provider",
  "email_smtp_host",
  "email_smtp_port",
  "email_smtp_user",
  "email_smtp_password",
  "email_smtp_tls",
  "email_from_address",
  "email_from_name"
];
function F({ className: n }) {
  const {
    settings: o,
    edits: _,
    isLoading: u,
    autosaveStatus: f,
    autosaveError: h,
    error: d,
    fetchSettings: l,
    handleChange: i,
    getEffectiveValue: c
  } = M();
  y(() => {
    l();
  }, [l]);
  const m = (c("email_provider") || "custom") === "custom", g = c("email_smtp_host"), S = !m || g != null && g !== "", p = L(() => {
    const r = o.email ?? [], e = m ? C : k;
    return r.filter((t) => e.includes(t.key)).sort((t, E) => e.indexOf(t.key) - e.indexOf(E.key));
  }, [o, m]), v = (r, e) => {
    if (i(r, e), r === "email_provider" && e !== "custom") {
      const t = N[e];
      t && (i("email_smtp_host", t), i("email_smtp_port", "587"), i("email_smtp_tls", "true"));
    }
  };
  return u && Object.keys(o).length === 0 ? /* @__PURE__ */ a("div", { className: `cedros-system-settings cedros-system-settings-loading ${n ?? ""}`, children: [
    /* @__PURE__ */ s(P, {}),
    /* @__PURE__ */ s("span", { children: "Loading settings..." })
  ] }) : d ? /* @__PURE__ */ s("div", { className: `cedros-system-settings ${n ?? ""}`, children: /* @__PURE__ */ s(w, { error: d.message }) }) : /* @__PURE__ */ a("div", { className: `cedros-system-settings ${n ?? ""}`, children: [
    /* @__PURE__ */ a("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ a("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ s("h2", { className: "cedros-settings-page-title", children: "Email & SMTP" }),
        /* @__PURE__ */ s("p", { className: "cedros-settings-page-description", children: "Configure email delivery for verification emails, password resets, and instant link login." })
      ] }),
      /* @__PURE__ */ s(A, { status: f, error: h })
    ] }),
    !S && /* @__PURE__ */ s("div", { className: "cedros-settings-warning-banner", children: "Email features (verification, password reset, instant link) are disabled until SMTP is configured. Select a provider or enter custom SMTP settings below." }),
    p.length === 0 ? /* @__PURE__ */ s("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ s("p", { children: "No settings found for this section." }) }) : /* @__PURE__ */ s(
      I,
      {
        settings: p,
        edits: _,
        onChange: v
      }
    )
  ] });
}
export {
  C as A,
  F as E,
  N as P,
  k as S
};
