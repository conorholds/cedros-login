import { jsx as a, jsxs as U } from "react/jsx-runtime";
import { useState as l, useEffect as S, useCallback as _, useMemo as b } from "react";
import { A as E, a as I, u as v } from "./AdminUserDetail-DHFDzY8B.js";
import { S as y } from "./StatsBar-BX-hHtTq.js";
import { u as A } from "./useSystemSettings-DN5YqfNq.js";
const L = ["email", "google", "apple", "solana", "webauthn", "sso"], T = {
  email: "Email Users",
  google: "Google Users",
  apple: "Apple Users",
  solana: "Solana Users",
  webauthn: "Passkey Users",
  sso: "SSO Provider Users"
}, w = {
  email: "auth_email_enabled",
  google: "auth_google_enabled",
  apple: "auth_apple_enabled",
  solana: "auth_solana_enabled",
  webauthn: "auth_webauthn_enabled",
  sso: "feature_sso"
};
function D() {
  const { getStats: r } = v(), { fetchSettings: i, getValue: n } = A(), [t, c] = l(null), [d, o] = l(!1), [m, u] = l(null), [h, p] = l(!1);
  S(() => {
    h || (i(), p(!0));
  }, [i, h]);
  const g = _(
    (e) => {
      const s = n(e);
      return s === void 0 ? !1 : s === "true" || s === "1";
    },
    [n]
  ), f = _(async () => {
    o(!0), u(null);
    try {
      const e = await r();
      c(e);
    } catch (e) {
      u(e instanceof Error ? e.message : "Failed to load user stats");
    } finally {
      o(!1);
    }
  }, [r]);
  return S(() => {
    f();
  }, [f]), { statsItems: b(() => {
    const e = [{ label: "Total Users", value: t?.total ?? "—" }];
    return L.forEach((s) => {
      g(w[s]) && e.push({
        label: T[s],
        value: t?.authMethodCounts[s] ?? 0
      });
    }), e;
  }, [t, g]), isLoading: d, error: m, refresh: f };
}
function B({
  pluginContext: r,
  pageSize: i = 20
}) {
  const [n, t] = l(null), { statsItems: c, isLoading: d, error: o, refresh: m } = D();
  return n ? /* @__PURE__ */ a("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ a(
    E,
    {
      userId: n.id,
      onBack: () => t(null),
      currentUserId: r.userId
    }
  ) }) : /* @__PURE__ */ U("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ a(y, { stats: c, isLoading: d, onRefresh: m }),
    o && /* @__PURE__ */ a("p", { className: "cedros-admin-error-inline", children: o }),
    /* @__PURE__ */ a("p", { className: "cedros-dashboard__text-muted", children: "All registered users in the system. Requires system admin privileges." }),
    /* @__PURE__ */ a(
      I,
      {
        pageSize: i,
        currentUserId: r.userId,
        onUserClick: (u) => t(u)
      }
    )
  ] });
}
export {
  B as default
};
