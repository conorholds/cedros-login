import { jsx as e } from "react/jsx-runtime";
import { S as i } from "./WebhookSettings-Ci_CIPUK.js";
const n = ["security", "rate_limit"];
function g({ className: t }) {
  return /* @__PURE__ */ e(
    i,
    {
      title: "Security",
      description: "Configure CORS, cookies, sessions, JWT, and rate limiting settings.",
      categories: n,
      className: t
    }
  );
}
const r = ["kyc", "accreditation", "sanctions", "token_gating"];
function u({ className: t }) {
  return /* @__PURE__ */ e(
    i,
    {
      title: "Compliance & Gating",
      description: "Configure KYC identity verification, accredited investor verification, sanctions screening, and Solana token gating.",
      categories: r,
      className: t
    }
  );
}
const s = ["referral"];
function p({ className: t }) {
  return /* @__PURE__ */ e(
    i,
    {
      title: "Referrals & Rewards",
      description: "Configure referral reward types, amounts, triggers, per-referrer caps, and automated payout processing.",
      categories: s,
      className: t
    }
  );
}
const o = ["signup"];
function d({ className: t }) {
  return /* @__PURE__ */ e(
    i,
    {
      title: "Signup Gating",
      description: "Configure access codes required to register and optional signup rate limits.",
      categories: o,
      className: t
    }
  );
}
export {
  u as C,
  p as R,
  d as S,
  g as a
};
