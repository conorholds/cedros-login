import { A as g } from "./apiClient-B2JxVPlH.js";
import { g as f, a as w, D as i, b as K, t as b, c as p, w as S } from "./useAuth-Bge6KaWN.js";
import { s as T, a as k, g as B, p as D } from "./shamir-B0wConeK.js";
async function P(u) {
  const { password: A, serverUrl: h, accessToken: r, timeoutMs: y = 3e4 } = u, s = [];
  try {
    const e = f();
    s.push(e);
    const { shareA: a, shareB: t } = T(e);
    s.push(a, t);
    const o = w(), n = await k(A, o, i);
    s.push(n);
    const c = await K(a, b(n)), m = B(e), l = D(m), d = {
      solanaPubkey: l,
      shareAAuthMethod: "password",
      shareACiphertext: c.ciphertext,
      shareANonce: c.nonce,
      shareB: p(t),
      shareAKdfSalt: p(o),
      shareAKdfParams: i
    };
    return await new g({
      baseUrl: h,
      timeoutMs: y,
      getAccessToken: r ? () => r : void 0
    }).post("/wallet/enroll", d), {
      success: !0,
      solanaPubkey: l
    };
  } catch (e) {
    return {
      success: !1,
      error: e instanceof Error ? e.message : "Wallet enrollment failed"
    };
  } finally {
    S(...s);
  }
}
export {
  P as silentWalletEnroll
};
