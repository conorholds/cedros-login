import { useState as g, useEffect as m, useCallback as c, useMemo as _ } from "react";
import { u as h } from "./useSystemSettings-K3wDZ3qB.js";
const w = ["https:"], u = ["javascript:", "data:", "vbscript:", "file:"];
function U(r) {
  if (!r || typeof r != "string")
    return;
  const t = r.trim();
  if (!t)
    return;
  const a = t.toLowerCase();
  for (const e of u)
    if (a.startsWith(e))
      return;
  try {
    const e = new URL(t);
    return w.includes(e.protocol) ? t : void 0;
  } catch {
    return;
  }
}
function R(r) {
  if (!r || typeof r != "string")
    return;
  const t = r.trim();
  if (!t)
    return;
  const a = t.toLowerCase();
  for (const e of u)
    if (a.startsWith(e))
      return;
  try {
    const e = new URL(t);
    return e.protocol !== "https:" && e.protocol !== "http:" ? void 0 : t;
  } catch {
    return;
  }
}
const v = {
  organizations: !1,
  sso: !1,
  mfa: !1,
  mfaRequired: !1,
  walletSigning: !1,
  credits: !1,
  userWithdrawals: !1,
  cedrosPay: !1,
  signupAccessCodeRequired: !1
};
function E() {
  const { settings: r, isLoading: t, error: a, fetchSettings: e, getValue: s } = h(), [f, d] = g(!1);
  m(() => {
    f || (e(), d(!0));
  }, [e, f]);
  const o = c((i) => i === void 0 ? !1 : i === "true" || i === "1", []), n = _(() => Object.keys(r).length === 0 ? v : {
    organizations: o(s("feature_organizations")),
    sso: o(s("feature_sso")),
    mfa: o(s("feature_mfa")),
    mfaRequired: o(s("security_require_mfa")),
    walletSigning: o(s("feature_wallet_signing")),
    credits: o(s("feature_credits")),
    userWithdrawals: o(s("feature_user_withdrawals")),
    cedrosPay: o(s("feature_cedros_pay")),
    signupAccessCodeRequired: o(s("signup_access_code_enabled"))
  }, [r, s, o]), l = c(async () => {
    await e();
  }, [e]), p = c(
    (i) => n[i],
    [n]
  );
  return {
    features: n,
    isLoading: t,
    error: a,
    refetch: l,
    isEnabled: p
  };
}
export {
  U as a,
  R as s,
  E as u
};
