import { useState as l, useRef as m, useMemo as F, useCallback as d } from "react";
import { A as I, h as w, u as U } from "./useCedrosLogin-_94MmGGq.js";
class k {
  client;
  constructor(t, s, i, o) {
    this.client = new I({ baseUrl: t, timeoutMs: s, retryAttempts: i, getAccessToken: o });
  }
  /**
   * Get all system settings grouped by category
   * Requires system admin privileges
   */
  async getSettings() {
    try {
      return await this.client.get("/admin/settings");
    } catch (t) {
      throw w(t, "Failed to fetch system settings");
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
    } catch (s) {
      throw w(s, "Failed to update system settings");
    }
  }
}
function T() {
  const { config: r, authState: t, _internal: s } = U(), [i, o] = l({}), [S, h] = l(!1), [A, p] = l(!1), [E, c] = l(null), u = m(0), y = F(
    () => new k(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      s?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, s]
  ), g = m(y);
  g.current = y;
  const f = d(async () => {
    if (t !== "authenticated") {
      o({});
      return;
    }
    h(!0), c(null);
    const n = ++u.current;
    try {
      const e = await g.current.getSettings();
      if (n !== u.current) return;
      o(e.settings);
    } catch (e) {
      if (n !== u.current) return;
      c(e instanceof Error ? e : new Error("Failed to fetch settings"));
    } finally {
      n === u.current && h(!1);
    }
  }, [t]), C = d(
    async (n) => {
      if (t !== "authenticated")
        throw new Error("Not authenticated");
      p(!0), c(null);
      try {
        await g.current.updateSettings(n), await f();
      } catch (e) {
        const a = e instanceof Error ? e : new Error("Failed to update settings");
        throw c(a), a;
      } finally {
        p(!1);
      }
    },
    [t, f]
  ), v = d(
    (n) => {
      for (const e of Object.values(i)) {
        const a = e.find((q) => q.key === n);
        if (a) return a.value;
      }
    },
    [i]
  );
  return {
    settings: i,
    isLoading: S,
    isUpdating: A,
    error: E,
    fetchSettings: f,
    updateSettings: C,
    getValue: v
  };
}
export {
  T as u
};
