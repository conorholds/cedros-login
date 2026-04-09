import { useState as f, useMemo as x, useRef as R, useEffect as S, useCallback as u } from "react";
import { A as G, h as g } from "./useCedrosLogin-fUZvc4r9.js";
import { a as K } from "./useSystemSettings-DsoAamlp.js";
class M {
  client;
  constructor(e, t, h, l) {
    this.client = new G({ baseUrl: e, timeoutMs: t, retryAttempts: h, getAccessToken: l });
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
function B() {
  const { config: a, user: e, authState: t, _internal: h } = K(), l = typeof window < "u" && !!window.localStorage, [m, E] = f([]), [_, w] = f(null), [A, y] = f([]), [T, p] = f(null), [k, c] = f(t === "authenticated"), [L, i] = f(null), z = x(
    () => new M(
      a.serverUrl,
      a.requestTimeout,
      a.retryAttempts,
      h?.getAccessToken
    ),
    [a.serverUrl, a.requestTimeout, a.retryAttempts, h]
  ), d = R(z);
  S(() => {
    d.current = z;
  }, [z]);
  const O = u(async (r) => {
    try {
      const n = await d.current.getPermissions(r);
      y(n.permissions), p(n.role);
    } catch {
      y([]), p(null);
    }
  }, []), I = R(async () => {
  }), o = u(async () => {
    if (t !== "authenticated" || !e) {
      E([]), w(null), y([]), p(null);
      return;
    }
    c(!0), i(null);
    try {
      const r = await d.current.listOrgs();
      E(r);
      const n = l ? V(v) : null;
      let s = r.find((F) => F.id === n);
      !s && r.length > 0 && (s = r.find((F) => F.isPersonal) || r[0]), s ? (w(s), l && P(v, s.id), await O(s.id)) : (w(null), y([]), p(null));
    } catch (r) {
      i(r);
    } finally {
      c(!1);
    }
  }, [t, e, O, l]);
  S(() => {
    I.current = o;
  }, [o]);
  const C = R(!1);
  S(() => {
    t === "authenticated" && !C.current ? (C.current = !0, I.current()) : t !== "authenticated" && (C.current = !1);
  }, [t]);
  const N = u(
    async (r) => {
      const n = m.find((s) => s.id === r);
      if (!n) {
        i({ code: "UNKNOWN_ERROR", message: "Organization not found" });
        return;
      }
      w(n), l && P(v, r), await O(r);
    },
    [m, O, l]
  ), U = u(
    async (r) => {
      c(!0), i(null);
      try {
        const n = await d.current.createOrg(r);
        return await o(), n;
      } catch (n) {
        throw i(n), n;
      } finally {
        c(!1);
      }
    },
    [o]
  ), $ = u(
    async (r, n) => {
      c(!0), i(null);
      try {
        const s = await d.current.updateOrg(r, n);
        return await o(), s;
      } catch (s) {
        throw i(s), s;
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
      } catch (n) {
        throw i(n), n;
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
  B as u
};
