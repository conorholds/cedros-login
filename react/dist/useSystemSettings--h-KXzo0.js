import { useState as g, useRef as S, useMemo as T, useCallback as f } from "react";
import { A as v, h as y, a as O } from "./useCedrosLogin-aNpnZjyZ.js";
import { u as _ } from "./CedrosLoginAdminRuntimeContext-C7X2Grx-.js";
class q {
  client;
  constructor(t, s, i, a) {
    this.client = new v({ baseUrl: t, timeoutMs: s, retryAttempts: i, getAccessToken: a });
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
    } catch (s) {
      throw y(s, "Failed to update system settings");
    }
  }
}
const R = () => null;
function F() {
  const e = _(), t = O();
  if (e)
    return {
      config: e.config,
      user: e.user,
      authState: e.authState,
      _internal: {
        getAccessToken: e.getAccessToken
      }
    };
  if (t)
    return {
      config: t.config,
      user: t.user,
      authState: t.authState,
      _internal: {
        getAccessToken: t._internal?.getAccessToken ?? R
      }
    };
  throw new Error(
    "Login admin hooks require CedrosLoginAdminSectionWrapper or CedrosLoginProvider"
  );
}
function b() {
  const { config: e, authState: t, _internal: s } = F(), [i, a] = g({}), [w, h] = g(!1), [A, m] = g(!1), [C, c] = g(null), u = S(0), p = T(
    () => new q(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), l = S(p);
  l.current = p;
  const d = f(async () => {
    if (t !== "authenticated") {
      a({});
      return;
    }
    h(!0), c(null);
    const r = ++u.current;
    try {
      const n = await l.current.getSettings();
      if (r !== u.current) return;
      a(n.settings);
    } catch (n) {
      if (r !== u.current) return;
      c(n instanceof Error ? n : new Error("Failed to fetch settings"));
    } finally {
      r === u.current && h(!1);
    }
  }, [t]), E = f(
    async (r) => {
      if (t !== "authenticated")
        throw new Error("Not authenticated");
      m(!0), c(null);
      try {
        await l.current.updateSettings(r), await d();
      } catch (n) {
        const o = n instanceof Error ? n : new Error("Failed to update settings");
        throw c(o), o;
      } finally {
        m(!1);
      }
    },
    [t, d]
  ), L = f(
    (r) => {
      for (const n of Object.values(i)) {
        const o = n.find((k) => k.key === r);
        if (o) return o.value;
      }
    },
    [i]
  );
  return {
    settings: i,
    isLoading: w,
    isUpdating: A,
    error: C,
    fetchSettings: d,
    updateSettings: E,
    getValue: L
  };
}
export {
  F as a,
  b as u
};
