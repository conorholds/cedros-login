import { jsxs as a, jsx as e } from "react/jsx-runtime";
import { useEffect as y, useMemo as w } from "react";
import { L as I, E as M } from "./ErrorMessage-DObd7075.js";
import { u as P, A as b, S as j } from "./AutosaveStatus-CkrF3ffV.js";
const k = {
  mailgun: "smtp.mailgun.org",
  sendgrid: "smtp.sendgrid.net",
  postmark: "smtp.postmarkapp.com",
  ses: "email-smtp.us-east-1.amazonaws.com",
  resend: "smtp.resend.com"
}, p = [
  "email_subject_verification",
  "email_subject_password_reset",
  "email_subject_instant_link",
  "email_subject_invite",
  "email_subject_security_alert"
], A = [
  "email_provider",
  "email_smtp_password",
  "email_from_address",
  "email_from_name",
  ...p
], N = [
  "email_provider",
  "email_smtp_host",
  "email_smtp_port",
  "email_smtp_user",
  "email_smtp_password",
  "email_smtp_tls",
  "email_from_address",
  "email_from_name",
  ...p
];
function F({ className: n }) {
  const {
    settings: o,
    edits: u,
    isLoading: f,
    autosaveStatus: h,
    autosaveError: S,
    error: l,
    fetchSettings: d,
    handleChange: i,
    getEffectiveValue: c
  } = P();
  y(() => {
    d();
  }, [d]);
  const m = (c("email_provider") || "custom") === "custom", _ = c("email_smtp_host"), v = !m || _ != null && _ !== "", g = w(() => {
    const r = o.email ?? [], s = m ? N : A;
    return r.filter((t) => s.includes(t.key)).sort((t, L) => s.indexOf(t.key) - s.indexOf(L.key));
  }, [o, m]), E = (r, s) => {
    if (i(r, s), r === "email_provider" && s !== "custom") {
      const t = k[s];
      t && (i("email_smtp_host", t), i("email_smtp_port", "587"), i("email_smtp_tls", "true"));
    }
  };
  return f && Object.keys(o).length === 0 ? /* @__PURE__ */ a("div", { className: `cedros-system-settings cedros-system-settings-loading ${n ?? ""}`, children: [
    /* @__PURE__ */ e(I, {}),
    /* @__PURE__ */ e("span", { children: "Loading settings..." })
  ] }) : l ? /* @__PURE__ */ e("div", { className: `cedros-system-settings ${n ?? ""}`, children: /* @__PURE__ */ e(M, { error: l.message }) }) : /* @__PURE__ */ a("div", { className: `cedros-system-settings ${n ?? ""}`, children: [
    /* @__PURE__ */ a("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ a("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ e("h2", { className: "cedros-settings-page-title", children: "Email & SMTP" }),
        /* @__PURE__ */ e("p", { className: "cedros-settings-page-description", children: "Configure email delivery for verification emails, password resets, and instant link login." })
      ] }),
      /* @__PURE__ */ e(b, { status: h, error: S })
    ] }),
    !v && /* @__PURE__ */ e("div", { className: "cedros-settings-warning-banner", children: "Email features (verification, password reset, instant link) are disabled until SMTP is configured. Select a provider or enter custom SMTP settings below." }),
    g.length === 0 ? /* @__PURE__ */ e("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ e("p", { children: "No settings found for this section." }) }) : /* @__PURE__ */ e(
      j,
      {
        settings: g,
        edits: u,
        onChange: E
      }
    )
  ] });
}
export {
  F as E
};
