import { useState as u, useMemo as P, useCallback as o } from "react";
import { a as L, A as C, h as d } from "./useCedrosLogin-_94MmGGq.js";
function F() {
  const l = L(), [w, a] = u(!1), [m, i] = u(null), s = P(() => l ? new C({
    baseUrl: l.config.serverUrl,
    timeoutMs: l.config.requestTimeout,
    retryAttempts: l.config.retryAttempts,
    getAccessToken: l._internal?.getAccessToken
  }) : null, [l]), f = o(() => {
    i(null);
  }, []), g = o(
    async (r) => {
      if (!s)
        throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
      a(!0), i(null);
      try {
        const t = new URLSearchParams();
        r?.status && t.set("status", r.status), r?.limit !== void 0 && t.set("limit", String(r.limit)), r?.offset !== void 0 && t.set("offset", String(r.offset));
        const e = t.toString(), n = e ? `/admin/deposits?${e}` : "/admin/deposits";
        return await s.get(n);
      } catch (t) {
        const e = d(t, "Failed to list deposits");
        throw i(e.message), e;
      } finally {
        a(!1);
      }
    },
    [s]
  ), h = o(async () => {
    if (!s)
      throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
    a(!0), i(null);
    try {
      return await s.get("/admin/deposits/stats");
    } catch (r) {
      const t = d(r, "Failed to get deposit stats");
      throw i(t.message), t;
    } finally {
      a(!1);
    }
  }, [s]), p = o(
    async (r) => {
      if (!s)
        throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
      a(!0), i(null);
      try {
        const t = new URLSearchParams();
        r?.limit !== void 0 && t.set("limit", String(r.limit)), r?.offset !== void 0 && t.set("offset", String(r.offset));
        const e = t.toString(), n = e ? `/admin/deposits/in-privacy-period?${e}` : "/admin/deposits/in-privacy-period";
        return await s.get(n);
      } catch (t) {
        const e = d(t, "Failed to list deposits in privacy period");
        throw i(e.message), e;
      } finally {
        a(!1);
      }
    },
    [s]
  ), y = o(
    async (r) => {
      if (!s)
        throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
      a(!0), i(null);
      try {
        const t = new URLSearchParams();
        r?.limit !== void 0 && t.set("limit", String(r.limit)), r?.offset !== void 0 && t.set("offset", String(r.offset));
        const e = t.toString(), n = e ? `/admin/withdrawals/pending?${e}` : "/admin/withdrawals/pending";
        return await s.get(n);
      } catch (t) {
        const e = d(t, "Failed to list pending withdrawals");
        throw i(e.message), e;
      } finally {
        a(!1);
      }
    },
    [s]
  ), v = o(
    async (r, t) => {
      if (!s)
        throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
      a(!0), i(null);
      try {
        return await s.post(
          `/admin/withdrawals/${r}/process`,
          t ?? {}
        );
      } catch (e) {
        const n = d(e, "Failed to process withdrawal");
        throw i(n.message), n;
      } finally {
        a(!1);
      }
    },
    [s]
  ), E = o(async () => {
    if (!s)
      throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
    a(!0), i(null);
    try {
      return await s.post(
        "/admin/withdrawals/process-all",
        {}
      );
    } catch (r) {
      const t = d(r, "Failed to process withdrawals");
      throw i(t.message), t;
    } finally {
      a(!1);
    }
  }, [s]), A = o(async () => {
    if (!s)
      throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
    a(!0), i(null);
    try {
      return await s.get("/admin/privacy/status");
    } catch (r) {
      const t = d(r, "Failed to get privacy status");
      throw i(t.message), t;
    } finally {
      a(!1);
    }
  }, [s]), S = o(async () => {
    if (!s)
      throw new Error("useAdminDeposits must be used within a CedrosLoginProvider");
    a(!0), i(null);
    try {
      return await s.get("/admin/credits/stats");
    } catch (r) {
      const t = d(r, "Failed to get credit stats");
      throw i(t.message), t;
    } finally {
      a(!1);
    }
  }, [s]);
  return {
    listDeposits: g,
    getStats: h,
    listInPrivacyPeriod: p,
    listPendingWithdrawals: y,
    processWithdrawal: v,
    processAllWithdrawals: E,
    getPrivacyStatus: A,
    getCreditStats: S,
    isLoading: w,
    error: m,
    clearError: f
  };
}
export {
  F as u
};
