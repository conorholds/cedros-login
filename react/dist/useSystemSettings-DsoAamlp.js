import { useMemo as w, useState as l, useRef as S, useCallback as f } from "react";
import { A as v, h as y, c as O } from "./useCedrosLogin-fUZvc4r9.js";
import { u as _ } from "./CedrosLoginAdminRuntimeContext-B5hgylEV.js";
class q {
  client;
  constructor(t, n, i, a) {
    this.client = new v({ baseUrl: t, timeoutMs: n, retryAttempts: i, getAccessToken: a });
  }
  /**
   * Get all system settings grouped by category
   * Requires system admin privileges
   */
  async getSettings() {
    try {
      return await this.client.get("/admin/settings");
    } catch (t) {
      throw y(t, "Failed to fetch system settings");
    }
  }
  /**
   * Update one or more system settings
   * Requires system admin privileges
   */
  async updateSettings(t) {
    try {
      return await this.client.patch("/admin/settings", {
        settings: t
      });
    } catch (n) {
      throw y(n, "Failed to update system settings");
    }
  }
}
const R = () => null;
function F() {
  const e = _(), t = O(), n = w(() => e ? {
    config: e.config,
    user: e.user,
    authState: e.authState,
    _internal: {
      getAccessToken: e.getAccessToken
    }
  } : t ? {
    config: t.config,
    user: t.user,
    authState: t.authState,
    _internal: {
      getAccessToken: t._internal?.getAccessToken ?? R
    }
  } : null, [e, t]);
  if (n)
    return n;
  throw new Error(
    "Login admin hooks require cedrosLoginPlugin under AdminShell or CedrosLoginProvider"
  );
}
function P() {
  const { config: e, authState: t, _internal: n } = F(), [i, a] = l({}), [A, h] = l(!1), [C, m] = l(!1), [E, c] = l(null), u = S(0), p = w(
    () => new q(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      n?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, n]
  ), g = S(p);
  g.current = p;
  const d = f(async () => {
    if (t !== "authenticated") {
      a({});
      return;
    }
    h(!0), c(null);
    const s = ++u.current;
    try {
      const r = await g.current.getSettings();
      if (s !== u.current) return;
      a(r.settings);
    } catch (r) {
      if (s !== u.current) return;
      c(r instanceof Error ? r : new Error("Failed to fetch settings"));
    } finally {
      s === u.current && h(!1);
    }
  }, [t]), L = f(
    async (s) => {
      if (t !== "authenticated")
        throw new Error("Not authenticated");
      m(!0), c(null);
      try {
        await g.current.updateSettings(s), await d();
      } catch (r) {
        const o = r instanceof Error ? r : new Error("Failed to update settings");
        throw c(o), o;
      } finally {
        m(!1);
      }
    },
    [t, d]
  ), k = f(
    (s) => {
      for (const r of Object.values(i)) {
        const o = r.find((T) => T.key === s);
        if (o) return o.value;
      }
    },
    [i]
  );
  return {
    settings: i,
    isLoading: A,
    isUpdating: C,
    error: E,
    fetchSettings: d,
    updateSettings: L,
    getValue: k
  };
}
export {
  F as a,
  P as u
};
