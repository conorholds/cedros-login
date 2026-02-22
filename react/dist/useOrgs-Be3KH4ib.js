import { useState as f, useMemo as G, useRef as C, useEffect as S, useCallback as u } from "react";
import { A as K, h as g, u as x } from "./apiClient-B2JxVPlH.js";
class M {
  client;
  constructor(e, t, h, l) {
    this.client = new K({ baseUrl: e, timeoutMs: t, retryAttempts: h, getAccessToken: l });
  }
  /**
   * List all organizations the current user belongs to
   */
  async listOrgs() {
    try {
      return (await this.client.get("/orgs")).orgs.map((t) => ({
        ...t,
        membership: {
          orgId: t.id,
          role: t.role
        }
      }));
    } catch (e) {
      throw g(e, "Failed to list organizations");
    }
  }
  /**
   * Get a single organization by ID
   */
  async getOrg(e) {
    try {
      return await this.client.get(`/orgs/${e}`);
    } catch (t) {
      throw g(t, "Failed to get organization");
    }
  }
  /**
   * Create a new organization
   */
  async createOrg(e) {
    try {
      return await this.client.post("/orgs", e);
    } catch (t) {
      throw g(t, "Failed to create organization");
    }
  }
  /**
   * Update an organization
   */
  async updateOrg(e, t) {
    try {
      return await this.client.patch(`/orgs/${e}`, t);
    } catch (h) {
      throw g(h, "Failed to update organization");
    }
  }
  /**
   * Delete an organization
   */
  async deleteOrg(e) {
    try {
      await this.client.delete(`/orgs/${e}`);
    } catch (t) {
      throw g(t, "Failed to delete organization");
    }
  }
  /**
   * Check authorization for an action
   */
  async authorize(e) {
    try {
      return await this.client.post("/authorize", e);
    } catch (t) {
      throw g(t, "Failed to check authorization");
    }
  }
  /**
   * Get current user's permissions in an organization
   */
  async getPermissions(e) {
    try {
      return await this.client.post("/permissions", { orgId: e });
    } catch (t) {
      throw g(t, "Failed to get permissions");
    }
  }
}
const v = "cedros_active_org";
function V(a) {
  try {
    return localStorage.getItem(a);
  } catch {
    return null;
  }
}
function P(a, e) {
  try {
    localStorage.setItem(a, e);
  } catch {
  }
}
function j() {
  const { config: a, user: e, authState: t, _internal: h } = x(), l = typeof window < "u" && !!window.localStorage, [m, E] = f([]), [_, w] = f(null), [A, y] = f([]), [T, O] = f(null), [k, c] = f(t === "authenticated"), [L, i] = f(null), z = G(
    () => new M(
      a.serverUrl,
      a.requestTimeout,
      a.retryAttempts,
      h?.getAccessToken
    ),
    [a.serverUrl, a.requestTimeout, a.retryAttempts, h]
  ), d = C(z);
  S(() => {
    d.current = z;
  }, [z]);
  const p = u(async (r) => {
    try {
      const s = await d.current.getPermissions(r);
      y(s.permissions), O(s.role);
    } catch {
      y([]), O(null);
    }
  }, []), I = C(async () => {
  }), o = u(async () => {
    if (t !== "authenticated" || !e) {
      E([]), w(null), y([]), O(null);
      return;
    }
    c(!0), i(null);
    try {
      const r = await d.current.listOrgs();
      E(r);
      const s = l ? V(v) : null;
      let n = r.find((R) => R.id === s);
      !n && r.length > 0 && (n = r.find((R) => R.isPersonal) || r[0]), n ? (w(n), l && P(v, n.id), await p(n.id)) : (w(null), y([]), O(null));
    } catch (r) {
      i(r);
    } finally {
      c(!1);
    }
  }, [t, e, p, l]);
  S(() => {
    I.current = o;
  }, [o]);
  const F = C(!1);
  S(() => {
    t === "authenticated" && !F.current ? (F.current = !0, I.current()) : t !== "authenticated" && (F.current = !1);
  }, [t]);
  const N = u(
    async (r) => {
      const s = m.find((n) => n.id === r);
      if (!s) {
        i({ code: "UNKNOWN_ERROR", message: "Organization not found" });
        return;
      }
      w(s), l && P(v, r), await p(r);
    },
    [m, p, l]
  ), U = u(
    async (r) => {
      c(!0), i(null);
      try {
        const s = await d.current.createOrg(r);
        return await o(), s;
      } catch (s) {
        throw i(s), s;
      } finally {
        c(!1);
      }
    },
    [o]
  ), $ = u(
    async (r, s) => {
      c(!0), i(null);
      try {
        const n = await d.current.updateOrg(r, s);
        return await o(), n;
      } catch (n) {
        throw i(n), n;
      } finally {
        c(!1);
      }
    },
    [o]
  ), b = u(
    async (r) => {
      c(!0), i(null);
      try {
        await d.current.deleteOrg(r), await o();
      } catch (s) {
        throw i(s), s;
      } finally {
        c(!1);
      }
    },
    [o]
  ), q = u(
    (r) => A.includes(r),
    [A]
  );
  return {
    orgs: m,
    activeOrg: _,
    permissions: A,
    role: T,
    isLoading: k,
    error: L,
    fetchOrgs: o,
    switchOrg: N,
    createOrg: U,
    updateOrg: $,
    deleteOrg: b,
    hasPermission: q
  };
}
export {
  M as O,
  j as u
};
