import { D as ot, v as Wo, a as qo, w as on, t as Oe, b as an, c as cn, u as St, g as jo, d as zo, e as Ye, f as Vo, h as ln, i as dn, j as Se, k as un, l as hn, m as Tr, n as fn, o as Ho, p as mn, q as Lt } from "./useAuth-C-Vw-ggy.js";
import { C as Ch, r as xh, s as Sh } from "./useAuth-C-Vw-ggy.js";
import { u as ne, A as ce, h as q, a as We } from "./useCedrosLogin-CFfID-0i.js";
import { b as Bh, c as Ph } from "./useCedrosLogin-CFfID-0i.js";
import { jsx as r, jsxs as d, Fragment as X } from "react/jsx-runtime";
import { useState as B, useRef as J, useMemo as z, useEffect as O, useCallback as T, useId as pn, Fragment as $o, Component as Qo, createContext as Go, useContext as gn } from "react";
import { L as Q } from "./LoadingSpinner-6vml-zwr.js";
import { a as wn, s as Ko } from "./sanitization-CQ-H1MSg.js";
import { b as bn, E as Yo, a as Zo, P as pe, O as yn } from "./EmailRegisterForm-D2VaJouj.js";
import { T as Th, u as Mh, c as Ih } from "./EmailRegisterForm-D2VaJouj.js";
import { b as An, v as Bt } from "./validation-B8kMV3BL.js";
import { E as re } from "./ErrorMessage-CcEK0pYO.js";
import { G as Xo } from "./GoogleLoginButton-qf4A_A3G.js";
import { u as Dh } from "./GoogleLoginButton-qf4A_A3G.js";
import { d as rs, S as Jo } from "./SolanaLoginButton-B04dib6X.js";
import { r as Fh, u as Oh } from "./SolanaLoginButton-B04dib6X.js";
import { c as ea, d as ta, u as ra, a as sa, M as na, I as oa, b as aa, P as ia } from "./PermissionsSection-DNzOL1xW.js";
import { u as ca } from "./useSystemSettings-rgskaDqP.js";
import { C as la, S as vn, a as da, u as ua, A as ha } from "./AutosaveStatus-CSZsp6w7.js";
import { u as fa, O as ma } from "./useOrgs-C90KT9KP.js";
import { A as pa, a as ga } from "./AdminDepositList-BUm_ZcAW.js";
import { A as wa, a as ba, b as ya, c as Aa } from "./AdminWithdrawalHistory-C76bkbjX.js";
import { u as va, A as ka, a as Na } from "./useUsersStatsSummary-5DJwzntC.js";
import { b as qh } from "./useUsersStatsSummary-5DJwzntC.js";
import { S as kn } from "./StatsBar-BX-hHtTq.js";
import { P as Ea } from "./plugin-C_NDZ2-D.js";
import { I as zh, A as Vh, C as Hh, c as $h, c as Qh, u as Gh } from "./plugin-C_NDZ2-D.js";
import { A as Ca } from "./AuthenticationSettings-DUXpyiJ5.js";
import { E as xa } from "./EmbeddedWalletSettings-M-D5N0eY.js";
import { A as Sa, S as La, P as Ba } from "./EmailSettings-DRfOF0Sf.js";
import { E as Yh } from "./EmailSettings-DRfOF0Sf.js";
import { C as Pa } from "./CreditSystemSettings-Buu7Y-7I.js";
import { S as Ra } from "./ServerSettings-qxi8aZO7.js";
import { u as Xh } from "./useAdminDeposits-C76B2Q_8.js";
import { S as Ta } from "./WebhookSettings-B8hAwhZ2.js";
import { W as ef } from "./WebhookSettings-B8hAwhZ2.js";
let Ue = null, Ma = 0;
const nt = /* @__PURE__ */ new Map();
function Ia() {
  return typeof Worker > "u" ? null : (Ue || (Ue = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/argon2Worker-Bi5TuQvD.js", import.meta.url).href,
    import.meta.url
  ), {
    type: "module"
  }), Ue.onmessage = (e) => {
    const { id: t, key: n, error: o } = e.data, s = nt.get(t);
    if (s) {
      if (nt.delete(t), o) {
        s.reject(new Error(o));
        return;
      }
      if (!n) {
        s.reject(new Error("Argon2 worker returned no key"));
        return;
      }
      s.resolve(n);
    }
  }, Ue.onerror = (e) => {
    const t = e instanceof ErrorEvent ? e.error : new Error("Argon2 worker error");
    for (const n of nt.values())
      n.reject(t instanceof Error ? t : new Error(String(t)));
    nt.clear(), Ue?.terminate(), Ue = null;
  }), Ue);
}
async function Nn(e, t, n = ot) {
  Wo(n);
  const o = Ia();
  return o ? new Promise((s, a) => {
    const c = Ma++;
    nt.set(c, { resolve: s, reject: a });
    const i = {
      id: c,
      password: e,
      salt: t,
      params: n
    };
    o.postMessage(i);
  }) : qo(e, t, n);
}
function En(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function _a(e) {
  if (Object.prototype.hasOwnProperty.call(e, "__esModule")) return e;
  var t = e.default;
  if (typeof t == "function") {
    var n = function o() {
      var s = !1;
      try {
        s = this instanceof o;
      } catch {
      }
      return s ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    n.prototype = t.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(e).forEach(function(o) {
    var s = Object.getOwnPropertyDescriptor(e, o);
    Object.defineProperty(n, o, s.get ? s : {
      enumerable: !0,
      get: function() {
        return e[o];
      }
    });
  }), n;
}
var pt = { exports: {} };
const Da = globalThis.crypto, Ua = globalThis.crypto, Fa = globalThis.crypto.subtle, Oa = globalThis.crypto.getRandomValues.bind(globalThis.crypto), Wa = globalThis.crypto.randomUUID.bind(globalThis.crypto), qa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Da,
  getRandomValues: Oa,
  randomUUID: Wa,
  subtle: Fa,
  webcrypto: Ua
}, Symbol.toStringTag, { value: "Module" })), ja = /* @__PURE__ */ _a(qa);
var za = pt.exports, ss;
function Va() {
  return ss || (ss = 1, (function(e, t) {
    (function(n, o) {
      e.exports = o(ja);
    })(za, function(n) {
      var o, s, a, c, i;
      function l() {
        o = {
          bits: 8,
          // default number of bits
          radix: 16,
          // work with HEX by default
          minBits: 3,
          maxBits: 20,
          // this permits 1,048,575 shares, though going this high is NOT recommended in JS!
          bytesPerChar: 2,
          maxBytesPerChar: 6,
          // Math.pow(256,7) > Math.pow(2,53)
          // Primitive polynomials (in decimal form) for Galois Fields GF(2^n), for 2 <= n <= 30
          // The index of each term in the array corresponds to the n for that polynomial
          // i.e. to get the polynomial for n=16, use primitivePolynomials[16]
          primitivePolynomials: [
            null,
            null,
            1,
            3,
            3,
            5,
            3,
            3,
            29,
            17,
            9,
            5,
            83,
            27,
            43,
            3,
            45,
            9,
            39,
            39,
            9,
            5,
            3,
            33,
            27,
            9,
            71,
            39,
            9,
            5,
            83
          ]
        }, s = {}, a = new Array(1024).join("0"), c = !0, i = [
          "nodeCryptoRandomBytes",
          "browserCryptoGetRandomValues",
          "testRandom"
        ];
      }
      function u() {
        return !!(s && s.rng && typeof s.rng == "function");
      }
      function f(g, k) {
        var v;
        if (k === 0 || k === 1)
          return g;
        if (k && k > 1024)
          throw new Error(
            "Padding must be multiples of no larger than 1024 bits."
          );
        return k = k || s.bits, g && (v = g.length % k), v ? (a + g).slice(
          -(k - v + g.length)
        ) : g;
      }
      function h(g) {
        var k = "", v, y;
        for (y = g.length - 1; y >= 0; y--) {
          if (v = parseInt(g[y], 16), isNaN(v))
            throw new Error("Invalid hex character.");
          k = f(v.toString(2), 4) + k;
        }
        return k;
      }
      function m(g) {
        var k = "", v, y;
        for (g = f(g, 4), y = g.length; y >= 4; y -= 4) {
          if (v = parseInt(g.slice(y - 4, y), 2), isNaN(v))
            throw new Error("Invalid binary character.");
          k = v.toString(16) + k;
        }
        return k;
      }
      function b() {
        return !!(n && typeof n == "object" && (typeof n.getRandomValues == "function" || typeof n.getRandomValues == "object") && (typeof Uint32Array == "function" || typeof Uint32Array == "object"));
      }
      function w() {
        return typeof n == "object" && typeof n.randomBytes == "function";
      }
      function p(g) {
        function k(L, M, P, I) {
          var _ = 0, F, W = "", H;
          for (M && (F = M.length - 1); _ < F || W.length < L; )
            H = Math.abs(parseInt(M[_], P)), W = W + f(H.toString(2), I), _++;
          return W = W.substr(-L), (W.match(/0/g) || []).length === W.length ? null : W;
        }
        function v(L) {
          var M, P, I, _, F = null;
          for (I = 16, _ = 4, P = Math.ceil(L / 8); F === null; )
            M = n.randomBytes(P), F = k(L, M.toString("hex"), I, _);
          return F;
        }
        function y(L) {
          var M, P, I, _ = null;
          for (P = 10, I = 32, M = Math.ceil(L / 32); _ === null; )
            _ = k(
              L,
              n.getRandomValues(new Uint32Array(M)),
              P,
              I
            );
          return _;
        }
        function S(L) {
          var M, P, I, _, F, W = null;
          _ = 10, F = 32, P = Math.ceil(L / 32), I = 123456789, M = new Uint32Array(P);
          for (var H = 0; H < M.length; H++)
            M[H] = I;
          for (; W === null; )
            W = k(L, M, _, F);
          return W;
        }
        if (g && g === "testRandom")
          return s.typeCSPRNG = g, S;
        if (g && g === "nodeCryptoRandomBytes")
          return s.typeCSPRNG = g, v;
        if (g && g === "browserCryptoGetRandomValues")
          return s.typeCSPRNG = g, y;
        if (w())
          return s.typeCSPRNG = "nodeCryptoRandomBytes", v;
        if (b())
          return s.typeCSPRNG = "browserCryptoGetRandomValues", y;
      }
      function E(g, k) {
        var v = [], y;
        for (k && (g = f(g, k)), y = g.length; y > s.bits; y -= s.bits)
          v.push(parseInt(g.slice(y - s.bits, y), 2));
        return v.push(parseInt(g.slice(0, y), 2)), v;
      }
      function A(g, k) {
        var v = s.logs[g], y = 0, S;
        for (S = k.length - 1; S >= 0; S--)
          y !== 0 ? y = s.exps[(v + s.logs[y]) % s.maxShares] ^ k[S] : y = k[S];
        return y;
      }
      function C(g, k, v) {
        var y = 0, S, L, M, P;
        for (M = 0, S = k.length; M < S; M++)
          if (v[M]) {
            for (L = s.logs[v[M]], P = 0; P < S; P++)
              if (M !== P) {
                if (g === k[P]) {
                  L = -1;
                  break;
                }
                L = (L + s.logs[g ^ k[P]] - s.logs[k[M] ^ k[P]] + s.maxShares) % s.maxShares;
              }
            y = L === -1 ? y : y ^ s.exps[L];
          }
        return y;
      }
      function N(g, k, v) {
        var y = [], S = [g], L, M;
        for (L = 1; L < v; L++)
          S[L] = parseInt(s.rng(s.bits), 2);
        for (L = 1, M = k + 1; L < M; L++)
          y[L - 1] = {
            x: L,
            y: A(L, S)
          };
        return y;
      }
      function x(g, k, v) {
        var y, S, L, M, P;
        if (k = parseInt(k, s.radix), g = parseInt(g, 10) || s.bits, y = g.toString(36).toUpperCase(), L = Math.pow(2, g) - 1, M = L.toString(s.radix).length, S = f(k.toString(s.radix), M), typeof k != "number" || k % 1 !== 0 || k < 1 || k > L)
          throw new Error(
            "Share id must be an integer between 1 and " + L + ", inclusive."
          );
        return P = y + S + v, P;
      }
      var R = {
        init: function(g, k) {
          var v = [], y = [], S = 1, L, M;
          if (l(), g && (typeof g != "number" || g % 1 !== 0 || g < o.minBits || g > o.maxBits))
            throw new Error(
              "Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (k && i.indexOf(k) === -1)
            throw new Error("Invalid RNG type argument : '" + k + "'");
          for (s.radix = o.radix, s.bits = g || o.bits, s.size = Math.pow(2, s.bits), s.maxShares = s.size - 1, L = o.primitivePolynomials[s.bits], M = 0; M < s.size; M++)
            y[M] = S, v[S] = M, S = S << 1, S >= s.size && (S = S ^ L, S = S & s.maxShares);
          if (s.logs = v, s.exps = y, k && this.setRNG(k), u() || this.setRNG(), !u() || !s.bits || !s.size || !s.maxShares || !s.logs || !s.exps || s.logs.length !== s.size || s.exps.length !== s.size)
            throw new Error("Initialization failed.");
        },
        // Evaluates the Lagrange interpolation polynomial at x=`at` for
        // individual config.bits-length segments of each share in the `shares`
        // Array. Each share is expressed in base `inputRadix`. The output
        // is expressed in base `outputRadix'.
        combine: function(g, k) {
          var v, y, S, L, M = "", P, I, _, F = [], W = [];
          for (k = k || 0, v = 0, S = g.length; v < S; v++) {
            if (I = this.extractShareComponents(g[v]), P === void 0)
              P = I.bits;
            else if (I.bits !== P)
              throw new Error(
                "Mismatched shares: Different bit settings."
              );
            if (s.bits !== P && this.init(P), F.indexOf(I.id) === -1)
              for (F.push(I.id), _ = E(h(I.data)), y = 0, L = _.length; y < L; y++)
                W[y] = W[y] || [], W[y][F.length - 1] = _[y];
          }
          for (v = 0, S = W.length; v < S; v++)
            M = f(C(k, F, W[v]).toString(2)) + M;
          return m(
            k >= 1 ? M : M.slice(M.indexOf("1") + 1)
          );
        },
        getConfig: function() {
          var g = {};
          return g.radix = s.radix, g.bits = s.bits, g.maxShares = s.maxShares, g.hasCSPRNG = u(), g.typeCSPRNG = s.typeCSPRNG, g;
        },
        // Given a public share, extract the bits (Integer), share ID (Integer), and share data (Hex)
        // and return an Object containing those components.
        extractShareComponents: function(g) {
          var k, v, y, S, L = {}, M, P;
          if (k = parseInt(g.substr(0, 1), 36), k && (typeof k != "number" || k % 1 !== 0 || k < o.minBits || k > o.maxBits))
            throw new Error(
              "Invalid share : Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (S = Math.pow(2, k) - 1, y = (Math.pow(2, k) - 1).toString(s.radix).length, M = "^([a-kA-K3-9]{1})([a-fA-F0-9]{" + y + "})([a-fA-F0-9]+)$", P = new RegExp(M).exec(g), P && (v = parseInt(P[2], s.radix)), typeof v != "number" || v % 1 !== 0 || v < 1 || v > S)
            throw new Error(
              "Invalid share : Share id must be an integer between 1 and " + s.maxShares + ", inclusive."
            );
          if (P && P[3])
            return L.bits = k, L.id = v, L.data = P[3], L;
          throw new Error("The share data provided is invalid : " + g);
        },
        // Set the PRNG to use. If no RNG function is supplied, pick a default using getRNG()
        setRNG: function(g) {
          var k = "Random number generator is invalid ", v = " Supply an CSPRNG of the form function(bits){} that returns a string containing 'bits' number of random 1's and 0's.";
          if (g && typeof g == "string" && i.indexOf(g) === -1)
            throw new Error("Invalid RNG type argument : '" + g + "'");
          if (g || (g = p()), g && typeof g == "string" && (g = p(g)), c) {
            if (g && typeof g != "function")
              throw new Error(k + "(Not a function)." + v);
            if (g && typeof g(s.bits) != "string")
              throw new Error(
                k + "(Output is not a string)." + v
              );
            if (g && !parseInt(g(s.bits), 2))
              throw new Error(
                k + "(Binary string output not parseable to an Integer)." + v
              );
            if (g && g(s.bits).length > s.bits)
              throw new Error(
                k + "(Output length is greater than config.bits)." + v
              );
            if (g && g(s.bits).length < s.bits)
              throw new Error(
                k + "(Output length is less than config.bits)." + v
              );
          }
          return s.rng = g, !0;
        },
        // Converts a given UTF16 character string to the HEX representation.
        // Each character of the input string is represented by
        // `bytesPerChar` bytes in the output string which defaults to 2.
        str2hex: function(g, k) {
          var v, y, S = "", L, M, P, I;
          if (typeof g != "string")
            throw new Error("Input must be a character string.");
          if (k || (k = o.bytesPerChar), typeof k != "number" || k < 1 || k > o.maxBytesPerChar || k % 1 !== 0)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (v = 2 * k, y = Math.pow(16, v) - 1, P = 0, I = g.length; P < I; P++) {
            if (M = g[P].charCodeAt(), isNaN(M))
              throw new Error("Invalid character: " + g[P]);
            if (M > y)
              throw L = Math.ceil(Math.log(M + 1) / Math.log(256)), new Error(
                "Invalid character code (" + M + "). Maximum allowable is 256^bytes-1 (" + y + "). To convert this character, use at least " + L + " bytes."
              );
            S = f(M.toString(16), v) + S;
          }
          return S;
        },
        // Converts a given HEX number string to a UTF16 character string.
        hex2str: function(g, k) {
          var v, y = "", S, L;
          if (typeof g != "string")
            throw new Error("Input must be a hexadecimal string.");
          if (k = k || o.bytesPerChar, typeof k != "number" || k % 1 !== 0 || k < 1 || k > o.maxBytesPerChar)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (v = 2 * k, g = f(g, v), S = 0, L = g.length; S < L; S += v)
            y = String.fromCharCode(
              parseInt(g.slice(S, S + v), 16)
            ) + y;
          return y;
        },
        // Generates a random bits-length number string using the PRNG
        random: function(g) {
          if (typeof g != "number" || g % 1 !== 0 || g < 2 || g > 65536)
            throw new Error(
              "Number of bits must be an Integer between 1 and 65536."
            );
          return m(s.rng(g));
        },
        // Divides a `secret` number String str expressed in radix `inputRadix` (optional, default 16)
        // into `numShares` shares, each expressed in radix `outputRadix` (optional, default to `inputRadix`),
        // requiring `threshold` number of shares to reconstruct the secret.
        // Optionally, zero-pads the secret to a length that is a multiple of padLength before sharing.
        share: function(g, k, v, y) {
          var S, L, M = new Array(k), P = new Array(k), I, _, F;
          if (y = y || 128, typeof g != "string")
            throw new Error("Secret must be a string.");
          if (typeof k != "number" || k % 1 !== 0 || k < 2)
            throw new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive."
            );
          if (k > s.maxShares)
            throw S = Math.ceil(Math.log(k + 1) / Math.LN2), new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive. To create " + k + " shares, use at least " + S + " bits."
            );
          if (typeof v != "number" || v % 1 !== 0 || v < 2)
            throw new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive."
            );
          if (v > s.maxShares)
            throw S = Math.ceil(Math.log(v + 1) / Math.LN2), new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive.  To use a threshold of " + v + ", use at least " + S + " bits."
            );
          if (v > k)
            throw new Error(
              "Threshold number of shares was " + v + " but must be less than or equal to the " + k + " shares specified as the total to generate."
            );
          if (typeof y != "number" || y % 1 !== 0 || y < 0 || y > 1024)
            throw new Error(
              "Zero-pad length must be an integer between 0 and 1024 inclusive."
            );
          for (g = "1" + h(g), g = E(g, y), I = 0, F = g.length; I < F; I++)
            for (L = N(g[I], k, v), _ = 0; _ < k; _++)
              M[_] = M[_] || L[_].x.toString(s.radix), P[_] = f(L[_].y.toString(2)) + (P[_] || "");
          for (I = 0; I < k; I++)
            M[I] = x(
              s.bits,
              M[I],
              m(P[I])
            );
          return M;
        },
        // Generate a new share with id `id` (a number between 1 and 2^bits-1)
        // `id` can be a Number or a String in the default radix (16)
        newShare: function(g, k) {
          var v, y;
          if (g && typeof g == "string" && (g = parseInt(g, s.radix)), y = g.toString(s.radix), g && y && k && k[0])
            return v = this.extractShareComponents(k[0]), x(
              v.bits,
              y,
              this.combine(k, g)
            );
          throw new Error(
            "Invalid 'id' or 'shares' Array argument to newShare()."
          );
        },
        /* test-code */
        // export private functions so they can be unit tested directly.
        _reset: l,
        _padLeft: f,
        _hex2bin: h,
        _bin2hex: m,
        _hasCryptoGetRandomValues: b,
        _hasCryptoRandomBytes: w,
        _getRNG: p,
        _isSetRNG: u,
        _splitNumStringToIntArray: E,
        _horner: A,
        _lagrange: C,
        _getShares: N,
        _constructPublicShareString: x
        /* end-test-code */
      };
      return R.init(), R;
    });
  })(pt)), pt.exports;
}
var Ha = Va();
const Cn = /* @__PURE__ */ En(Ha);
function xn(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Mr(e, t = "") {
  if (!Number.isSafeInteger(e) || e < 0) {
    const n = t && `"${t}" `;
    throw new Error(`${n}expected integer >= 0, got ${e}`);
  }
}
function ie(e, t, n = "") {
  const o = xn(e), s = e?.length, a = t !== void 0;
  if (!o || a && s !== t) {
    const c = n && `"${n}" `, i = a ? ` of length ${t}` : "", l = o ? `length=${s}` : `type=${typeof e}`;
    throw new Error(c + "expected Uint8Array" + i + ", got " + l);
  }
  return e;
}
function ns(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function $a(e, t) {
  ie(e, void 0, "digestInto() output");
  const n = t.outputLen;
  if (e.length < n)
    throw new Error('"digestInto() output" expected to be of length >=' + n);
}
function vr(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function Ot(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
const Sn = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", Qa = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function Ir(e) {
  if (ie(e), Sn)
    return e.toHex();
  let t = "";
  for (let n = 0; n < e.length; n++)
    t += Qa[e[n]];
  return t;
}
const Ce = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function os(e) {
  if (e >= Ce._0 && e <= Ce._9)
    return e - Ce._0;
  if (e >= Ce.A && e <= Ce.F)
    return e - (Ce.A - 10);
  if (e >= Ce.a && e <= Ce.f)
    return e - (Ce.a - 10);
}
function Ln(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  if (Sn)
    return Uint8Array.fromHex(e);
  const t = e.length, n = t / 2;
  if (t % 2)
    throw new Error("hex string expected, got unpadded hex of length " + t);
  const o = new Uint8Array(n);
  for (let s = 0, a = 0; s < n; s++, a += 2) {
    const c = os(e.charCodeAt(a)), i = os(e.charCodeAt(a + 1));
    if (c === void 0 || i === void 0) {
      const l = e[a] + e[a + 1];
      throw new Error('hex string expected, got non-hex character "' + l + '" at index ' + a);
    }
    o[s] = c * 16 + i;
  }
  return o;
}
function as(...e) {
  let t = 0;
  for (let o = 0; o < e.length; o++) {
    const s = e[o];
    ie(s), t += s.length;
  }
  const n = new Uint8Array(t);
  for (let o = 0, s = 0; o < e.length; o++) {
    const a = e[o];
    n.set(a, s), s += a.length;
  }
  return n;
}
function Ga(e, t = {}) {
  const n = (s, a) => e(a).update(s).digest(), o = e(void 0);
  return n.outputLen = o.outputLen, n.blockLen = o.blockLen, n.create = (s) => e(s), Object.assign(n, t), Object.freeze(n);
}
function Ka(e = 32) {
  const t = typeof globalThis == "object" ? globalThis.crypto : null;
  if (typeof t?.getRandomValues != "function")
    throw new Error("crypto.getRandomValues must be defined");
  return t.getRandomValues(new Uint8Array(e));
}
const Ya = (e) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, e])
});
let Za = class {
  blockLen;
  outputLen;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = !1;
  length = 0;
  pos = 0;
  destroyed = !1;
  constructor(t, n, o, s) {
    this.blockLen = t, this.outputLen = n, this.padOffset = o, this.isLE = s, this.buffer = new Uint8Array(t), this.view = Ot(this.buffer);
  }
  update(t) {
    ns(this), ie(t);
    const { view: n, buffer: o, blockLen: s } = this, a = t.length;
    for (let c = 0; c < a; ) {
      const i = Math.min(s - this.pos, a - c);
      if (i === s) {
        const l = Ot(t);
        for (; s <= a - c; c += s)
          this.process(l, c);
        continue;
      }
      o.set(t.subarray(c, c + i), this.pos), this.pos += i, c += i, this.pos === s && (this.process(n, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    ns(this), $a(t, this), this.finished = !0;
    const { buffer: n, view: o, blockLen: s, isLE: a } = this;
    let { pos: c } = this;
    n[c++] = 128, vr(this.buffer.subarray(c)), this.padOffset > s - c && (this.process(o, 0), c = 0);
    for (let h = c; h < s; h++)
      n[h] = 0;
    o.setBigUint64(s - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const i = Ot(t), l = this.outputLen;
    if (l % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const u = l / 4, f = this.get();
    if (u > f.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let h = 0; h < u; h++)
      i.setUint32(4 * h, f[h], a);
  }
  digest() {
    const { buffer: t, outputLen: n } = this;
    this.digestInto(t);
    const o = t.slice(0, n);
    return this.destroy(), o;
  }
  _cloneInto(t) {
    t ||= new this.constructor(), t.set(...this.get());
    const { blockLen: n, buffer: o, length: s, finished: a, destroyed: c, pos: i } = this;
    return t.destroyed = c, t.finished = a, t.length = s, t.pos = i, s % n && t.buffer.set(o), t;
  }
  clone() {
    return this._cloneInto();
  }
};
const le = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]), ct = /* @__PURE__ */ BigInt(2 ** 32 - 1), is = /* @__PURE__ */ BigInt(32);
function Xa(e, t = !1) {
  return t ? { h: Number(e & ct), l: Number(e >> is & ct) } : { h: Number(e >> is & ct) | 0, l: Number(e & ct) | 0 };
}
function Ja(e, t = !1) {
  const n = e.length;
  let o = new Uint32Array(n), s = new Uint32Array(n);
  for (let a = 0; a < n; a++) {
    const { h: c, l: i } = Xa(e[a], t);
    [o[a], s[a]] = [c, i];
  }
  return [o, s];
}
const cs = (e, t, n) => e >>> n, ls = (e, t, n) => e << 32 - n | t >>> n, Ve = (e, t, n) => e >>> n | t << 32 - n, He = (e, t, n) => e << 32 - n | t >>> n, lt = (e, t, n) => e << 64 - n | t >>> n - 32, dt = (e, t, n) => e >>> n - 32 | t << 64 - n;
function xe(e, t, n, o) {
  const s = (t >>> 0) + (o >>> 0);
  return { h: e + n + (s / 2 ** 32 | 0) | 0, l: s | 0 };
}
const ei = (e, t, n) => (e >>> 0) + (t >>> 0) + (n >>> 0), ti = (e, t, n, o) => t + n + o + (e / 2 ** 32 | 0) | 0, ri = (e, t, n, o) => (e >>> 0) + (t >>> 0) + (n >>> 0) + (o >>> 0), si = (e, t, n, o, s) => t + n + o + s + (e / 2 ** 32 | 0) | 0, ni = (e, t, n, o, s) => (e >>> 0) + (t >>> 0) + (n >>> 0) + (o >>> 0) + (s >>> 0), oi = (e, t, n, o, s, a) => t + n + o + s + a + (e / 2 ** 32 | 0) | 0, Bn = Ja([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((e) => BigInt(e))), ai = Bn[0], ii = Bn[1], Re = /* @__PURE__ */ new Uint32Array(80), Te = /* @__PURE__ */ new Uint32Array(80);
class ci extends Za {
  constructor(t) {
    super(128, t, 16, !1);
  }
  // prettier-ignore
  get() {
    const { Ah: t, Al: n, Bh: o, Bl: s, Ch: a, Cl: c, Dh: i, Dl: l, Eh: u, El: f, Fh: h, Fl: m, Gh: b, Gl: w, Hh: p, Hl: E } = this;
    return [t, n, o, s, a, c, i, l, u, f, h, m, b, w, p, E];
  }
  // prettier-ignore
  set(t, n, o, s, a, c, i, l, u, f, h, m, b, w, p, E) {
    this.Ah = t | 0, this.Al = n | 0, this.Bh = o | 0, this.Bl = s | 0, this.Ch = a | 0, this.Cl = c | 0, this.Dh = i | 0, this.Dl = l | 0, this.Eh = u | 0, this.El = f | 0, this.Fh = h | 0, this.Fl = m | 0, this.Gh = b | 0, this.Gl = w | 0, this.Hh = p | 0, this.Hl = E | 0;
  }
  process(t, n) {
    for (let N = 0; N < 16; N++, n += 4)
      Re[N] = t.getUint32(n), Te[N] = t.getUint32(n += 4);
    for (let N = 16; N < 80; N++) {
      const x = Re[N - 15] | 0, R = Te[N - 15] | 0, g = Ve(x, R, 1) ^ Ve(x, R, 8) ^ cs(x, R, 7), k = He(x, R, 1) ^ He(x, R, 8) ^ ls(x, R, 7), v = Re[N - 2] | 0, y = Te[N - 2] | 0, S = Ve(v, y, 19) ^ lt(v, y, 61) ^ cs(v, y, 6), L = He(v, y, 19) ^ dt(v, y, 61) ^ ls(v, y, 6), M = ri(k, L, Te[N - 7], Te[N - 16]), P = si(M, g, S, Re[N - 7], Re[N - 16]);
      Re[N] = P | 0, Te[N] = M | 0;
    }
    let { Ah: o, Al: s, Bh: a, Bl: c, Ch: i, Cl: l, Dh: u, Dl: f, Eh: h, El: m, Fh: b, Fl: w, Gh: p, Gl: E, Hh: A, Hl: C } = this;
    for (let N = 0; N < 80; N++) {
      const x = Ve(h, m, 14) ^ Ve(h, m, 18) ^ lt(h, m, 41), R = He(h, m, 14) ^ He(h, m, 18) ^ dt(h, m, 41), g = h & b ^ ~h & p, k = m & w ^ ~m & E, v = ni(C, R, k, ii[N], Te[N]), y = oi(v, A, x, g, ai[N], Re[N]), S = v | 0, L = Ve(o, s, 28) ^ lt(o, s, 34) ^ lt(o, s, 39), M = He(o, s, 28) ^ dt(o, s, 34) ^ dt(o, s, 39), P = o & a ^ o & i ^ a & i, I = s & c ^ s & l ^ c & l;
      A = p | 0, C = E | 0, p = b | 0, E = w | 0, b = h | 0, w = m | 0, { h, l: m } = xe(u | 0, f | 0, y | 0, S | 0), u = i | 0, f = l | 0, i = a | 0, l = c | 0, a = o | 0, c = s | 0;
      const _ = ei(S, M, I);
      o = ti(_, y, L, P), s = _ | 0;
    }
    ({ h: o, l: s } = xe(this.Ah | 0, this.Al | 0, o | 0, s | 0)), { h: a, l: c } = xe(this.Bh | 0, this.Bl | 0, a | 0, c | 0), { h: i, l } = xe(this.Ch | 0, this.Cl | 0, i | 0, l | 0), { h: u, l: f } = xe(this.Dh | 0, this.Dl | 0, u | 0, f | 0), { h, l: m } = xe(this.Eh | 0, this.El | 0, h | 0, m | 0), { h: b, l: w } = xe(this.Fh | 0, this.Fl | 0, b | 0, w | 0), { h: p, l: E } = xe(this.Gh | 0, this.Gl | 0, p | 0, E | 0), { h: A, l: C } = xe(this.Hh | 0, this.Hl | 0, A | 0, C | 0), this.set(o, s, a, c, i, l, u, f, h, m, b, w, p, E, A, C);
  }
  roundClean() {
    vr(Re, Te);
  }
  destroy() {
    vr(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class li extends ci {
  Ah = le[0] | 0;
  Al = le[1] | 0;
  Bh = le[2] | 0;
  Bl = le[3] | 0;
  Ch = le[4] | 0;
  Cl = le[5] | 0;
  Dh = le[6] | 0;
  Dl = le[7] | 0;
  Eh = le[8] | 0;
  El = le[9] | 0;
  Fh = le[10] | 0;
  Fl = le[11] | 0;
  Gh = le[12] | 0;
  Gl = le[13] | 0;
  Hh = le[14] | 0;
  Hl = le[15] | 0;
  constructor() {
    super(64);
  }
}
const di = /* @__PURE__ */ Ga(
  () => new li(),
  /* @__PURE__ */ Ya(3)
);
const Pn = /* @__PURE__ */ BigInt(0), ds = /* @__PURE__ */ BigInt(1);
function kr(e, t = "") {
  if (typeof e != "boolean") {
    const n = t && `"${t}" `;
    throw new Error(n + "expected boolean, got type=" + typeof e);
  }
  return e;
}
function ui(e) {
  if (typeof e == "bigint") {
    if (!gt(e))
      throw new Error("positive bigint expected, got " + e);
  } else
    Mr(e);
  return e;
}
function Rn(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  return e === "" ? Pn : BigInt("0x" + e);
}
function hi(e) {
  return Rn(Ir(e));
}
function bt(e) {
  return Rn(Ir(Nr(ie(e)).reverse()));
}
function Tn(e, t) {
  Mr(t), e = ui(e);
  const n = Ln(e.toString(16).padStart(t * 2, "0"));
  if (n.length !== t)
    throw new Error("number too large");
  return n;
}
function fi(e, t) {
  return Tn(e, t).reverse();
}
function Nr(e) {
  return Uint8Array.from(e);
}
const gt = (e) => typeof e == "bigint" && Pn <= e;
function mi(e, t, n) {
  return gt(e) && gt(t) && gt(n) && t <= e && e < n;
}
function us(e, t, n, o) {
  if (!mi(t, n, o))
    throw new Error("expected valid " + e + ": " + n + " <= n < " + o + ", got " + t);
}
const pi = (e) => (ds << BigInt(e)) - ds;
function _r(e, t = {}, n = {}) {
  if (!e || typeof e != "object")
    throw new Error("expected valid options object");
  function o(a, c, i) {
    const l = e[a];
    if (i && l === void 0)
      return;
    const u = typeof l;
    if (u !== c || l === null)
      throw new Error(`param "${a}" is invalid: expected ${c}, got ${u}`);
  }
  const s = (a, c) => Object.entries(a).forEach(([i, l]) => o(i, l, c));
  s(t, !1), s(n, !0);
}
function hs(e) {
  const t = /* @__PURE__ */ new WeakMap();
  return (n, ...o) => {
    const s = t.get(n);
    if (s !== void 0)
      return s;
    const a = e(n, ...o);
    return t.set(n, a), a;
  };
}
const fe = /* @__PURE__ */ BigInt(0), he = /* @__PURE__ */ BigInt(1), Fe = /* @__PURE__ */ BigInt(2), Mn = /* @__PURE__ */ BigInt(3), In = /* @__PURE__ */ BigInt(4), _n = /* @__PURE__ */ BigInt(5), gi = /* @__PURE__ */ BigInt(7), Dn = /* @__PURE__ */ BigInt(8), wi = /* @__PURE__ */ BigInt(9), Un = /* @__PURE__ */ BigInt(16);
function oe(e, t) {
  const n = e % t;
  return n >= fe ? n : t + n;
}
function ve(e, t, n) {
  let o = e;
  for (; t-- > fe; )
    o *= o, o %= n;
  return o;
}
function fs(e, t) {
  if (e === fe)
    throw new Error("invert: expected non-zero number");
  if (t <= fe)
    throw new Error("invert: expected positive modulus, got " + t);
  let n = oe(e, t), o = t, s = fe, a = he;
  for (; n !== fe; ) {
    const i = o / n, l = o % n, u = s - a * i;
    o = n, n = l, s = a, a = u;
  }
  if (o !== he)
    throw new Error("invert: does not exist");
  return oe(s, t);
}
function Dr(e, t, n) {
  if (!e.eql(e.sqr(t), n))
    throw new Error("Cannot find square root");
}
function Fn(e, t) {
  const n = (e.ORDER + he) / In, o = e.pow(t, n);
  return Dr(e, o, t), o;
}
function bi(e, t) {
  const n = (e.ORDER - _n) / Dn, o = e.mul(t, Fe), s = e.pow(o, n), a = e.mul(t, s), c = e.mul(e.mul(a, Fe), s), i = e.mul(a, e.sub(c, e.ONE));
  return Dr(e, i, t), i;
}
function yi(e) {
  const t = Ur(e), n = On(e), o = n(t, t.neg(t.ONE)), s = n(t, o), a = n(t, t.neg(o)), c = (e + gi) / Un;
  return (i, l) => {
    let u = i.pow(l, c), f = i.mul(u, o);
    const h = i.mul(u, s), m = i.mul(u, a), b = i.eql(i.sqr(f), l), w = i.eql(i.sqr(h), l);
    u = i.cmov(u, f, b), f = i.cmov(m, h, w);
    const p = i.eql(i.sqr(f), l), E = i.cmov(u, f, p);
    return Dr(i, E, l), E;
  };
}
function On(e) {
  if (e < Mn)
    throw new Error("sqrt is not defined for small field");
  let t = e - he, n = 0;
  for (; t % Fe === fe; )
    t /= Fe, n++;
  let o = Fe;
  const s = Ur(e);
  for (; ms(s, o) === 1; )
    if (o++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (n === 1)
    return Fn;
  let a = s.pow(o, t);
  const c = (t + he) / Fe;
  return function(l, u) {
    if (l.is0(u))
      return u;
    if (ms(l, u) !== 1)
      throw new Error("Cannot find square root");
    let f = n, h = l.mul(l.ONE, a), m = l.pow(u, t), b = l.pow(u, c);
    for (; !l.eql(m, l.ONE); ) {
      if (l.is0(m))
        return l.ZERO;
      let w = 1, p = l.sqr(m);
      for (; !l.eql(p, l.ONE); )
        if (w++, p = l.sqr(p), w === f)
          throw new Error("Cannot find square root");
      const E = he << BigInt(f - w - 1), A = l.pow(h, E);
      f = w, h = l.sqr(A), m = l.mul(m, h), b = l.mul(b, A);
    }
    return b;
  };
}
function Ai(e) {
  return e % In === Mn ? Fn : e % Dn === _n ? bi : e % Un === wi ? yi(e) : On(e);
}
const vi = (e, t) => (oe(e, t) & he) === he, ki = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function Ni(e) {
  const t = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  }, n = ki.reduce((o, s) => (o[s] = "function", o), t);
  return _r(e, n), e;
}
function Ei(e, t, n) {
  if (n < fe)
    throw new Error("invalid exponent, negatives unsupported");
  if (n === fe)
    return e.ONE;
  if (n === he)
    return t;
  let o = e.ONE, s = t;
  for (; n > fe; )
    n & he && (o = e.mul(o, s)), s = e.sqr(s), n >>= he;
  return o;
}
function Wn(e, t, n = !1) {
  const o = new Array(t.length).fill(n ? e.ZERO : void 0), s = t.reduce((c, i, l) => e.is0(i) ? c : (o[l] = c, e.mul(c, i)), e.ONE), a = e.inv(s);
  return t.reduceRight((c, i, l) => e.is0(i) ? c : (o[l] = e.mul(c, o[l]), e.mul(c, i)), a), o;
}
function ms(e, t) {
  const n = (e.ORDER - he) / Fe, o = e.pow(t, n), s = e.eql(o, e.ONE), a = e.eql(o, e.ZERO), c = e.eql(o, e.neg(e.ONE));
  if (!s && !a && !c)
    throw new Error("invalid Legendre symbol result");
  return s ? 1 : a ? 0 : -1;
}
function Ci(e, t) {
  t !== void 0 && Mr(t);
  const n = t !== void 0 ? t : e.toString(2).length, o = Math.ceil(n / 8);
  return { nBitLength: n, nByteLength: o };
}
class xi {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = fe;
  ONE = he;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(t, n = {}) {
    if (t <= fe)
      throw new Error("invalid field: expected ORDER > 0, got " + t);
    let o;
    this.isLE = !1, n != null && typeof n == "object" && (typeof n.BITS == "number" && (o = n.BITS), typeof n.sqrt == "function" && (this.sqrt = n.sqrt), typeof n.isLE == "boolean" && (this.isLE = n.isLE), n.allowedLengths && (this._lengths = n.allowedLengths?.slice()), typeof n.modFromBytes == "boolean" && (this._mod = n.modFromBytes));
    const { nBitLength: s, nByteLength: a } = Ci(t, o);
    if (a > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = t, this.BITS = s, this.BYTES = a, this._sqrt = void 0, Object.preventExtensions(this);
  }
  create(t) {
    return oe(t, this.ORDER);
  }
  isValid(t) {
    if (typeof t != "bigint")
      throw new Error("invalid field element: expected bigint, got " + typeof t);
    return fe <= t && t < this.ORDER;
  }
  is0(t) {
    return t === fe;
  }
  // is valid and invertible
  isValidNot0(t) {
    return !this.is0(t) && this.isValid(t);
  }
  isOdd(t) {
    return (t & he) === he;
  }
  neg(t) {
    return oe(-t, this.ORDER);
  }
  eql(t, n) {
    return t === n;
  }
  sqr(t) {
    return oe(t * t, this.ORDER);
  }
  add(t, n) {
    return oe(t + n, this.ORDER);
  }
  sub(t, n) {
    return oe(t - n, this.ORDER);
  }
  mul(t, n) {
    return oe(t * n, this.ORDER);
  }
  pow(t, n) {
    return Ei(this, t, n);
  }
  div(t, n) {
    return oe(t * fs(n, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(t) {
    return t * t;
  }
  addN(t, n) {
    return t + n;
  }
  subN(t, n) {
    return t - n;
  }
  mulN(t, n) {
    return t * n;
  }
  inv(t) {
    return fs(t, this.ORDER);
  }
  sqrt(t) {
    return this._sqrt || (this._sqrt = Ai(this.ORDER)), this._sqrt(this, t);
  }
  toBytes(t) {
    return this.isLE ? fi(t, this.BYTES) : Tn(t, this.BYTES);
  }
  fromBytes(t, n = !1) {
    ie(t);
    const { _lengths: o, BYTES: s, isLE: a, ORDER: c, _mod: i } = this;
    if (o) {
      if (!o.includes(t.length) || t.length > s)
        throw new Error("Field.fromBytes: expected " + o + " bytes, got " + t.length);
      const u = new Uint8Array(s);
      u.set(t, a ? 0 : u.length - t.length), t = u;
    }
    if (t.length !== s)
      throw new Error("Field.fromBytes: expected " + s + " bytes, got " + t.length);
    let l = a ? bt(t) : hi(t);
    if (i && (l = oe(l, c)), !n && !this.isValid(l))
      throw new Error("invalid field element: outside of range 0..ORDER");
    return l;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(t) {
    return Wn(this, t);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(t, n, o) {
    return o ? n : t;
  }
}
function Ur(e, t = {}) {
  return new xi(e, t);
}
const yt = /* @__PURE__ */ BigInt(0), Er = /* @__PURE__ */ BigInt(1);
function ps(e, t) {
  const n = t.negate();
  return e ? n : t;
}
function Wt(e, t) {
  const n = Wn(e.Fp, t.map((o) => o.Z));
  return t.map((o, s) => e.fromAffine(o.toAffine(n[s])));
}
function qn(e, t) {
  if (!Number.isSafeInteger(e) || e <= 0 || e > t)
    throw new Error("invalid window size, expected [1.." + t + "], got W=" + e);
}
function qt(e, t) {
  qn(e, t);
  const n = Math.ceil(t / e) + 1, o = 2 ** (e - 1), s = 2 ** e, a = pi(e), c = BigInt(e);
  return { windows: n, windowSize: o, mask: a, maxNumber: s, shiftBy: c };
}
function gs(e, t, n) {
  const { windowSize: o, mask: s, maxNumber: a, shiftBy: c } = n;
  let i = Number(e & s), l = e >> c;
  i > o && (i -= a, l += Er);
  const u = t * o, f = u + Math.abs(i) - 1, h = i === 0, m = i < 0, b = t % 2 !== 0;
  return { nextN: l, offset: f, isZero: h, isNeg: m, isNegF: b, offsetF: u };
}
const jt = /* @__PURE__ */ new WeakMap(), jn = /* @__PURE__ */ new WeakMap();
function zt(e) {
  return jn.get(e) || 1;
}
function ws(e) {
  if (e !== yt)
    throw new Error("invalid wNAF");
}
class Si {
  BASE;
  ZERO;
  Fn;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(t, n) {
    this.BASE = t.BASE, this.ZERO = t.ZERO, this.Fn = t.Fn, this.bits = n;
  }
  // non-const time multiplication ladder
  _unsafeLadder(t, n, o = this.ZERO) {
    let s = t;
    for (; n > yt; )
      n & Er && (o = o.add(s)), s = s.double(), n >>= Er;
    return o;
  }
  /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */
  precomputeWindow(t, n) {
    const { windows: o, windowSize: s } = qt(n, this.bits), a = [];
    let c = t, i = c;
    for (let l = 0; l < o; l++) {
      i = c, a.push(i);
      for (let u = 1; u < s; u++)
        i = i.add(c), a.push(i);
      c = i.double();
    }
    return a;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(t, n, o) {
    if (!this.Fn.isValid(o))
      throw new Error("invalid scalar");
    let s = this.ZERO, a = this.BASE;
    const c = qt(t, this.bits);
    for (let i = 0; i < c.windows; i++) {
      const { nextN: l, offset: u, isZero: f, isNeg: h, isNegF: m, offsetF: b } = gs(o, i, c);
      o = l, f ? a = a.add(ps(m, n[b])) : s = s.add(ps(h, n[u]));
    }
    return ws(o), { p: s, f: a };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(t, n, o, s = this.ZERO) {
    const a = qt(t, this.bits);
    for (let c = 0; c < a.windows && o !== yt; c++) {
      const { nextN: i, offset: l, isZero: u, isNeg: f } = gs(o, c, a);
      if (o = i, !u) {
        const h = n[l];
        s = s.add(f ? h.negate() : h);
      }
    }
    return ws(o), s;
  }
  getPrecomputes(t, n, o) {
    let s = jt.get(n);
    return s || (s = this.precomputeWindow(n, t), t !== 1 && (typeof o == "function" && (s = o(s)), jt.set(n, s))), s;
  }
  cached(t, n, o) {
    const s = zt(t);
    return this.wNAF(s, this.getPrecomputes(s, t, o), n);
  }
  unsafe(t, n, o, s) {
    const a = zt(t);
    return a === 1 ? this._unsafeLadder(t, n, s) : this.wNAFUnsafe(a, this.getPrecomputes(a, t, o), n, s);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(t, n) {
    qn(n, this.bits), jn.set(t, n), jt.delete(t);
  }
  hasCache(t) {
    return zt(t) !== 1;
  }
}
function bs(e, t, n) {
  if (t) {
    if (t.ORDER !== e)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return Ni(t), t;
  } else
    return Ur(e, { isLE: n });
}
function Li(e, t, n = {}, o) {
  if (o === void 0 && (o = e === "edwards"), !t || typeof t != "object")
    throw new Error(`expected valid ${e} CURVE object`);
  for (const l of ["p", "n", "h"]) {
    const u = t[l];
    if (!(typeof u == "bigint" && u > yt))
      throw new Error(`CURVE.${l} must be positive bigint`);
  }
  const s = bs(t.p, n.Fp, o), a = bs(t.n, n.Fn, o), i = ["Gx", "Gy", "a", "d"];
  for (const l of i)
    if (!s.isValid(t[l]))
      throw new Error(`CURVE.${l} must be valid field element of CURVE.Fp`);
  return t = Object.freeze(Object.assign({}, t)), { CURVE: t, Fp: s, Fn: a };
}
function Bi(e, t) {
  return function(o) {
    const s = e(o);
    return { secretKey: s, publicKey: t(s) };
  };
}
const Me = BigInt(0), ae = BigInt(1), Vt = BigInt(2), Pi = BigInt(8);
function Ri(e, t, n, o) {
  const s = e.sqr(n), a = e.sqr(o), c = e.add(e.mul(t.a, s), a), i = e.add(e.ONE, e.mul(t.d, e.mul(s, a)));
  return e.eql(c, i);
}
function Ti(e, t = {}) {
  const n = Li("edwards", e, t, t.FpFnLE), { Fp: o, Fn: s } = n;
  let a = n.CURVE;
  const { h: c } = a;
  _r(t, {}, { uvRatio: "function" });
  const i = Vt << BigInt(s.BYTES * 8) - ae, l = (E) => o.create(E), u = t.uvRatio || ((E, A) => {
    try {
      return { isValid: !0, value: o.sqrt(o.div(E, A)) };
    } catch {
      return { isValid: !1, value: Me };
    }
  });
  if (!Ri(o, a, a.Gx, a.Gy))
    throw new Error("bad curve params: generator point");
  function f(E, A, C = !1) {
    const N = C ? ae : Me;
    return us("coordinate " + E, A, N, i), A;
  }
  function h(E) {
    if (!(E instanceof w))
      throw new Error("EdwardsPoint expected");
  }
  const m = hs((E, A) => {
    const { X: C, Y: N, Z: x } = E, R = E.is0();
    A == null && (A = R ? Pi : o.inv(x));
    const g = l(C * A), k = l(N * A), v = o.mul(x, A);
    if (R)
      return { x: Me, y: ae };
    if (v !== ae)
      throw new Error("invZ was invalid");
    return { x: g, y: k };
  }), b = hs((E) => {
    const { a: A, d: C } = a;
    if (E.is0())
      throw new Error("bad point: ZERO");
    const { X: N, Y: x, Z: R, T: g } = E, k = l(N * N), v = l(x * x), y = l(R * R), S = l(y * y), L = l(k * A), M = l(y * l(L + v)), P = l(S + l(C * l(k * v)));
    if (M !== P)
      throw new Error("bad point: equation left != right (1)");
    const I = l(N * x), _ = l(R * g);
    if (I !== _)
      throw new Error("bad point: equation left != right (2)");
    return !0;
  });
  class w {
    // base / generator point
    static BASE = new w(a.Gx, a.Gy, ae, l(a.Gx * a.Gy));
    // zero / infinity / identity point
    static ZERO = new w(Me, ae, ae, Me);
    // 0, 1, 1, 0
    // math field
    static Fp = o;
    // scalar field
    static Fn = s;
    X;
    Y;
    Z;
    T;
    constructor(A, C, N, x) {
      this.X = f("x", A), this.Y = f("y", C), this.Z = f("z", N, !0), this.T = f("t", x), Object.freeze(this);
    }
    static CURVE() {
      return a;
    }
    static fromAffine(A) {
      if (A instanceof w)
        throw new Error("extended point not allowed");
      const { x: C, y: N } = A || {};
      return f("x", C), f("y", N), new w(C, N, ae, l(C * N));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(A, C = !1) {
      const N = o.BYTES, { a: x, d: R } = a;
      A = Nr(ie(A, N, "point")), kr(C, "zip215");
      const g = Nr(A), k = A[N - 1];
      g[N - 1] = k & -129;
      const v = bt(g), y = C ? i : o.ORDER;
      us("point.y", v, Me, y);
      const S = l(v * v), L = l(S - ae), M = l(R * S - x);
      let { isValid: P, value: I } = u(L, M);
      if (!P)
        throw new Error("bad point: invalid y coordinate");
      const _ = (I & ae) === ae, F = (k & 128) !== 0;
      if (!C && I === Me && F)
        throw new Error("bad point: x=0 and x_0=1");
      return F !== _ && (I = l(-I)), w.fromAffine({ x: I, y: v });
    }
    static fromHex(A, C = !1) {
      return w.fromBytes(Ln(A), C);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(A = 8, C = !0) {
      return p.createCache(this, A), C || this.multiply(Vt), this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      b(this);
    }
    // Compare one point to another.
    equals(A) {
      h(A);
      const { X: C, Y: N, Z: x } = this, { X: R, Y: g, Z: k } = A, v = l(C * k), y = l(R * x), S = l(N * k), L = l(g * x);
      return v === y && S === L;
    }
    is0() {
      return this.equals(w.ZERO);
    }
    negate() {
      return new w(l(-this.X), this.Y, this.Z, l(-this.T));
    }
    // Fast algo for doubling Extended Point.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
    // Cost: 4M + 4S + 1*a + 6add + 1*2.
    double() {
      const { a: A } = a, { X: C, Y: N, Z: x } = this, R = l(C * C), g = l(N * N), k = l(Vt * l(x * x)), v = l(A * R), y = C + N, S = l(l(y * y) - R - g), L = v + g, M = L - k, P = v - g, I = l(S * M), _ = l(L * P), F = l(S * P), W = l(M * L);
      return new w(I, _, W, F);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(A) {
      h(A);
      const { a: C, d: N } = a, { X: x, Y: R, Z: g, T: k } = this, { X: v, Y: y, Z: S, T: L } = A, M = l(x * v), P = l(R * y), I = l(k * N * L), _ = l(g * S), F = l((x + R) * (v + y) - M - P), W = _ - I, H = _ + I, V = l(P - C * M), D = l(F * W), U = l(H * V), K = l(F * V), se = l(W * H);
      return new w(D, U, se, K);
    }
    subtract(A) {
      return this.add(A.negate());
    }
    // Constant-time multiplication.
    multiply(A) {
      if (!s.isValidNot0(A))
        throw new Error("invalid scalar: expected 1 <= sc < curve.n");
      const { p: C, f: N } = p.cached(this, A, (x) => Wt(w, x));
      return Wt(w, [C, N])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Does NOT allow scalars higher than CURVE.n.
    // Accepts optional accumulator to merge with multiply (important for sparse scalars)
    multiplyUnsafe(A, C = w.ZERO) {
      if (!s.isValid(A))
        throw new Error("invalid scalar: expected 0 <= sc < curve.n");
      return A === Me ? w.ZERO : this.is0() || A === ae ? this : p.unsafe(this, A, (N) => Wt(w, N), C);
    }
    // Checks if point is of small order.
    // If you add something to small order point, you will have "dirty"
    // point with torsion component.
    // Multiplies point by cofactor and checks if the result is 0.
    isSmallOrder() {
      return this.multiplyUnsafe(c).is0();
    }
    // Multiplies point by curve order and checks if the result is 0.
    // Returns `false` is the point is dirty.
    isTorsionFree() {
      return p.unsafe(this, a.n).is0();
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    toAffine(A) {
      return m(this, A);
    }
    clearCofactor() {
      return c === ae ? this : this.multiplyUnsafe(c);
    }
    toBytes() {
      const { x: A, y: C } = this.toAffine(), N = o.toBytes(C);
      return N[N.length - 1] |= A & ae ? 128 : 0, N;
    }
    toHex() {
      return Ir(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const p = new Si(w, s.BITS);
  return w.BASE.precompute(8), w;
}
function Mi(e, t, n = {}) {
  if (typeof t != "function")
    throw new Error('"hash" function param is required');
  _r(n, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    mapToCurve: "function"
  });
  const { prehash: o } = n, { BASE: s, Fp: a, Fn: c } = e, i = n.randomBytes || Ka, l = n.adjustScalarBytes || ((v) => v), u = n.domain || ((v, y, S) => {
    if (kr(S, "phflag"), y.length || S)
      throw new Error("Contexts/pre-hash are not supported");
    return v;
  });
  function f(v) {
    return c.create(bt(v));
  }
  function h(v) {
    const y = N.secretKey;
    ie(v, N.secretKey, "secretKey");
    const S = ie(t(v), 2 * y, "hashedSecretKey"), L = l(S.slice(0, y)), M = S.slice(y, 2 * y), P = f(L);
    return { head: L, prefix: M, scalar: P };
  }
  function m(v) {
    const { head: y, prefix: S, scalar: L } = h(v), M = s.multiply(L), P = M.toBytes();
    return { head: y, prefix: S, scalar: L, point: M, pointBytes: P };
  }
  function b(v) {
    return m(v).pointBytes;
  }
  function w(v = Uint8Array.of(), ...y) {
    const S = as(...y);
    return f(t(u(S, ie(v, void 0, "context"), !!o)));
  }
  function p(v, y, S = {}) {
    v = ie(v, void 0, "message"), o && (v = o(v));
    const { prefix: L, scalar: M, pointBytes: P } = m(y), I = w(S.context, L, v), _ = s.multiply(I).toBytes(), F = w(S.context, _, P, v), W = c.create(I + F * M);
    if (!c.isValid(W))
      throw new Error("sign failed: invalid s");
    const H = as(_, c.toBytes(W));
    return ie(H, N.signature, "result");
  }
  const E = { zip215: !0 };
  function A(v, y, S, L = E) {
    const { context: M, zip215: P } = L, I = N.signature;
    v = ie(v, I, "signature"), y = ie(y, void 0, "message"), S = ie(S, N.publicKey, "publicKey"), P !== void 0 && kr(P, "zip215"), o && (y = o(y));
    const _ = I / 2, F = v.subarray(0, _), W = bt(v.subarray(_, I));
    let H, V, D;
    try {
      H = e.fromBytes(S, P), V = e.fromBytes(F, P), D = s.multiplyUnsafe(W);
    } catch {
      return !1;
    }
    if (!P && H.isSmallOrder())
      return !1;
    const U = w(M, V.toBytes(), H.toBytes(), y);
    return V.add(H.multiplyUnsafe(U)).subtract(D).clearCofactor().is0();
  }
  const C = a.BYTES, N = {
    secretKey: C,
    publicKey: C,
    signature: 2 * C,
    seed: C
  };
  function x(v = i(N.seed)) {
    return ie(v, N.seed, "seed");
  }
  function R(v) {
    return xn(v) && v.length === c.BYTES;
  }
  function g(v, y) {
    try {
      return !!e.fromBytes(v, y);
    } catch {
      return !1;
    }
  }
  const k = {
    getExtendedPublicKey: m,
    randomSecretKey: x,
    isValidSecretKey: R,
    isValidPublicKey: g,
    /**
     * Converts ed public key to x public key. Uses formula:
     * - ed25519:
     *   - `(u, v) = ((1+y)/(1-y), sqrt(-486664)*u/x)`
     *   - `(x, y) = (sqrt(-486664)*u/v, (u-1)/(u+1))`
     * - ed448:
     *   - `(u, v) = ((y-1)/(y+1), sqrt(156324)*u/x)`
     *   - `(x, y) = (sqrt(156324)*u/v, (1+u)/(1-u))`
     */
    toMontgomery(v) {
      const { y } = e.fromBytes(v), S = N.publicKey, L = S === 32;
      if (!L && S !== 57)
        throw new Error("only defined for 25519 and 448");
      const M = L ? a.div(ae + y, ae - y) : a.div(y - ae, y + ae);
      return a.toBytes(M);
    },
    toMontgomerySecret(v) {
      const y = N.secretKey;
      ie(v, y);
      const S = t(v.subarray(0, y));
      return l(S).subarray(0, y);
    }
  };
  return Object.freeze({
    keygen: Bi(x, b),
    getPublicKey: b,
    sign: p,
    verify: A,
    utils: k,
    Point: e,
    lengths: N
  });
}
const Ii = BigInt(1), ys = BigInt(2), _i = BigInt(5), Di = BigInt(8), Fr = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"), Ui = {
  p: Fr,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: Di,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
};
function Fi(e) {
  const t = BigInt(10), n = BigInt(20), o = BigInt(40), s = BigInt(80), a = Fr, i = e * e % a * e % a, l = ve(i, ys, a) * i % a, u = ve(l, Ii, a) * e % a, f = ve(u, _i, a) * u % a, h = ve(f, t, a) * f % a, m = ve(h, n, a) * h % a, b = ve(m, o, a) * m % a, w = ve(b, s, a) * b % a, p = ve(w, s, a) * b % a, E = ve(p, t, a) * f % a;
  return { pow_p_5_8: ve(E, ys, a) * e % a, b2: i };
}
function Oi(e) {
  return e[0] &= 248, e[31] &= 127, e[31] |= 64, e;
}
const As = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function Wi(e, t) {
  const n = Fr, o = oe(t * t * t, n), s = oe(o * o * t, n), a = Fi(e * s).pow_p_5_8;
  let c = oe(e * o * a, n);
  const i = oe(t * c * c, n), l = c, u = oe(c * As, n), f = i === e, h = i === oe(-e, n), m = i === oe(-e * As, n);
  return f && (c = l), (h || m) && (c = u), vi(c, n) && (c = oe(-c, n)), { isValid: f || h, value: c };
}
const qi = /* @__PURE__ */ Ti(Ui, { uvRatio: Wi });
function ji(e) {
  return Mi(qi, di, Object.assign({ adjustScalarBytes: Oi }, e));
}
const zi = /* @__PURE__ */ ji({});
function Vi(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Pt(e, ...t) {
  if (!Vi(e))
    throw new Error("Uint8Array expected");
  if (t.length > 0 && !t.includes(e.length))
    throw new Error("Uint8Array expected of length " + t + ", got length=" + e.length);
}
function vs(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function Hi(e, t) {
  Pt(e);
  const n = t.outputLen;
  if (e.length < n)
    throw new Error("digestInto() expects output buffer of length at least " + n);
}
function Cr(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function Ht(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function ke(e, t) {
  return e << 32 - t | e >>> t;
}
function $i(e) {
  if (typeof e != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(e));
}
function zn(e) {
  return typeof e == "string" && (e = $i(e)), Pt(e), e;
}
class Qi {
}
function Gi(e) {
  const t = (o) => e().update(zn(o)).digest(), n = e();
  return t.outputLen = n.outputLen, t.blockLen = n.blockLen, t.create = () => e(), t;
}
function Ki(e, t, n, o) {
  if (typeof e.setBigUint64 == "function")
    return e.setBigUint64(t, n, o);
  const s = BigInt(32), a = BigInt(4294967295), c = Number(n >> s & a), i = Number(n & a), l = o ? 4 : 0, u = o ? 0 : 4;
  e.setUint32(t + l, c, o), e.setUint32(t + u, i, o);
}
function Yi(e, t, n) {
  return e & t ^ ~e & n;
}
function Zi(e, t, n) {
  return e & t ^ e & n ^ t & n;
}
class Xi extends Qi {
  constructor(t, n, o, s) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = t, this.outputLen = n, this.padOffset = o, this.isLE = s, this.buffer = new Uint8Array(t), this.view = Ht(this.buffer);
  }
  update(t) {
    vs(this), t = zn(t), Pt(t);
    const { view: n, buffer: o, blockLen: s } = this, a = t.length;
    for (let c = 0; c < a; ) {
      const i = Math.min(s - this.pos, a - c);
      if (i === s) {
        const l = Ht(t);
        for (; s <= a - c; c += s)
          this.process(l, c);
        continue;
      }
      o.set(t.subarray(c, c + i), this.pos), this.pos += i, c += i, this.pos === s && (this.process(n, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    vs(this), Hi(t, this), this.finished = !0;
    const { buffer: n, view: o, blockLen: s, isLE: a } = this;
    let { pos: c } = this;
    n[c++] = 128, Cr(this.buffer.subarray(c)), this.padOffset > s - c && (this.process(o, 0), c = 0);
    for (let h = c; h < s; h++)
      n[h] = 0;
    Ki(o, s - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const i = Ht(t), l = this.outputLen;
    if (l % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const u = l / 4, f = this.get();
    if (u > f.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let h = 0; h < u; h++)
      i.setUint32(4 * h, f[h], a);
  }
  digest() {
    const { buffer: t, outputLen: n } = this;
    this.digestInto(t);
    const o = t.slice(0, n);
    return this.destroy(), o;
  }
  _cloneInto(t) {
    t || (t = new this.constructor()), t.set(...this.get());
    const { blockLen: n, buffer: o, length: s, finished: a, destroyed: c, pos: i } = this;
    return t.destroyed = c, t.finished = a, t.length = s, t.pos = i, s % n && t.buffer.set(o), t;
  }
  clone() {
    return this._cloneInto();
  }
}
const Ie = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), Ji = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]), _e = /* @__PURE__ */ new Uint32Array(64);
class ec extends Xi {
  constructor(t = 32) {
    super(64, t, 8, !1), this.A = Ie[0] | 0, this.B = Ie[1] | 0, this.C = Ie[2] | 0, this.D = Ie[3] | 0, this.E = Ie[4] | 0, this.F = Ie[5] | 0, this.G = Ie[6] | 0, this.H = Ie[7] | 0;
  }
  get() {
    const { A: t, B: n, C: o, D: s, E: a, F: c, G: i, H: l } = this;
    return [t, n, o, s, a, c, i, l];
  }
  // prettier-ignore
  set(t, n, o, s, a, c, i, l) {
    this.A = t | 0, this.B = n | 0, this.C = o | 0, this.D = s | 0, this.E = a | 0, this.F = c | 0, this.G = i | 0, this.H = l | 0;
  }
  process(t, n) {
    for (let h = 0; h < 16; h++, n += 4)
      _e[h] = t.getUint32(n, !1);
    for (let h = 16; h < 64; h++) {
      const m = _e[h - 15], b = _e[h - 2], w = ke(m, 7) ^ ke(m, 18) ^ m >>> 3, p = ke(b, 17) ^ ke(b, 19) ^ b >>> 10;
      _e[h] = p + _e[h - 7] + w + _e[h - 16] | 0;
    }
    let { A: o, B: s, C: a, D: c, E: i, F: l, G: u, H: f } = this;
    for (let h = 0; h < 64; h++) {
      const m = ke(i, 6) ^ ke(i, 11) ^ ke(i, 25), b = f + m + Yi(i, l, u) + Ji[h] + _e[h] | 0, p = (ke(o, 2) ^ ke(o, 13) ^ ke(o, 22)) + Zi(o, s, a) | 0;
      f = u, u = l, l = i, i = c + b | 0, c = a, a = s, s = o, o = b + p | 0;
    }
    o = o + this.A | 0, s = s + this.B | 0, a = a + this.C | 0, c = c + this.D | 0, i = i + this.E | 0, l = l + this.F | 0, u = u + this.G | 0, f = f + this.H | 0, this.set(o, s, a, c, i, l, u, f);
  }
  roundClean() {
    Cr(_e);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), Cr(this.buffer);
  }
}
const Vn = /* @__PURE__ */ Gi(() => new ec()), tc = Vn, rc = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function sc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = tc(e), n = zi.getPublicKey(t), o = new Uint8Array(64);
  return o.set(t, 0), o.set(n, 32), on(t), { publicKey: n, secretKey: o };
}
function Hn(e) {
  const t = sc(e), n = t.publicKey;
  return on(t.secretKey), n;
}
function $n(e) {
  if (e.length !== 32)
    throw new Error(`Invalid public key length: expected 32, got ${e.length}`);
  return nc(e);
}
function nc(e) {
  let t = 0;
  for (let s = 0; s < e.length && e[s] === 0; s++)
    t++;
  let n = 0n;
  for (let s = 0; s < e.length; s++)
    n = n * 256n + BigInt(e[s]);
  let o = "";
  for (; n > 0n; ) {
    const s = Number(n % 58n);
    o = rc[s] + o, n = n / 58n;
  }
  return "1".repeat(t) + o;
}
const oc = 2, ac = 3;
function Qn(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = xr(e), n = Cn.share(t, ac, oc);
  if (n.length !== 3)
    throw new Error(`Unexpected share count: ${n.length}`);
  const o = $t(n[0]), s = $t(n[1]), a = $t(n[2]);
  return {
    shareA: Oe(o),
    shareB: Oe(s),
    shareC: Oe(a)
  };
}
function ic(e, t, n) {
  const o = ks(e), s = ks(t);
  try {
    const a = Cn.combine([o, s]), c = Gn(a);
    if (c.length !== 16)
      throw new Error(`Reconstructed seed has wrong length: ${c.length}`);
    return an(c);
  } catch (a) {
    throw a instanceof Error && a.message.startsWith("Reconstructed seed") || a instanceof Error && a.message.startsWith("Invalid expectedPublicKey") || a instanceof Error && a.message.startsWith("Reconstructed seed does not match") ? a : new Error("Failed to reconstruct seed from shares");
  }
}
function xr(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
}
function Gn(e) {
  if (!/^[0-9a-fA-F]*$/.test(e))
    throw new Error("Invalid hex string: contains non-hex characters");
  if (e.length % 2 !== 0)
    throw new Error(`Invalid hex string: length ${e.length} is odd (must be even)`);
  const t = new Uint8Array(e.length / 2);
  for (let n = 0; n < t.length; n++)
    t[n] = parseInt(e.substr(n * 2, 2), 16);
  return t;
}
function $t(e) {
  const t = e.length % 2 !== 0, n = t ? "0" + e : e, o = Gn(n), s = new Uint8Array(1 + o.length);
  return s[0] = t ? 1 : 0, s.set(o, 1), s;
}
function ks(e) {
  const t = e[0];
  if (t === 0 || t === 1) {
    const o = t === 1, s = e.subarray(1), a = xr(s), c = o ? a.substring(1) : a;
    if (/^[0-9a-f]/.test(c))
      return c;
  }
  const n = xr(e);
  return n.startsWith("0") && !n.startsWith("00") ? n.substring(1) : n;
}
function At(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Kn(e, t) {
  return Array.isArray(t) ? t.length === 0 ? !0 : e ? t.every((n) => typeof n == "string") : t.every((n) => Number.isSafeInteger(n)) : !1;
}
function cc(e) {
  if (typeof e != "function")
    throw new Error("function expected");
  return !0;
}
function vt(e, t) {
  if (typeof t != "string")
    throw new Error(`${e}: string expected`);
  return !0;
}
function Ze(e) {
  if (!Number.isSafeInteger(e))
    throw new Error(`invalid integer: ${e}`);
}
function kt(e) {
  if (!Array.isArray(e))
    throw new Error("array expected");
}
function Nt(e, t) {
  if (!Kn(!0, t))
    throw new Error(`${e}: array of strings expected`);
}
function Yn(e, t) {
  if (!Kn(!1, t))
    throw new Error(`${e}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function lc(...e) {
  const t = (a) => a, n = (a, c) => (i) => a(c(i)), o = e.map((a) => a.encode).reduceRight(n, t), s = e.map((a) => a.decode).reduce(n, t);
  return { encode: o, decode: s };
}
// @__NO_SIDE_EFFECTS__
function dc(e) {
  const t = typeof e == "string" ? e.split("") : e, n = t.length;
  Nt("alphabet", t);
  const o = new Map(t.map((s, a) => [s, a]));
  return {
    encode: (s) => (kt(s), s.map((a) => {
      if (!Number.isSafeInteger(a) || a < 0 || a >= n)
        throw new Error(`alphabet.encode: digit index outside alphabet "${a}". Allowed: ${e}`);
      return t[a];
    })),
    decode: (s) => (kt(s), s.map((a) => {
      vt("alphabet.decode", a);
      const c = o.get(a);
      if (c === void 0)
        throw new Error(`Unknown letter: "${a}". Allowed: ${e}`);
      return c;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function uc(e = "") {
  return vt("join", e), {
    encode: (t) => (Nt("join.decode", t), t.join(e)),
    decode: (t) => (vt("join.decode", t), t.split(e))
  };
}
// @__NO_SIDE_EFFECTS__
function hc(e, t = "=") {
  return Ze(e), vt("padding", t), {
    encode(n) {
      for (Nt("padding.encode", n); n.length * e % 8; )
        n.push(t);
      return n;
    },
    decode(n) {
      Nt("padding.decode", n);
      let o = n.length;
      if (o * e % 8)
        throw new Error("padding: invalid, string should have whole number of bytes");
      for (; o > 0 && n[o - 1] === t; o--)
        if ((o - 1) * e % 8 === 0)
          throw new Error("padding: invalid, string has too much padding");
      return n.slice(0, o);
    }
  };
}
function Sr(e, t, n) {
  if (t < 2)
    throw new Error(`convertRadix: invalid from=${t}, base cannot be less than 2`);
  if (n < 2)
    throw new Error(`convertRadix: invalid to=${n}, base cannot be less than 2`);
  if (kt(e), !e.length)
    return [];
  let o = 0;
  const s = [], a = Array.from(e, (i) => {
    if (Ze(i), i < 0 || i >= t)
      throw new Error(`invalid integer: ${i}`);
    return i;
  }), c = a.length;
  for (; ; ) {
    let i = 0, l = !0;
    for (let u = o; u < c; u++) {
      const f = a[u], h = t * i, m = h + f;
      if (!Number.isSafeInteger(m) || h / t !== i || m - f !== h)
        throw new Error("convertRadix: carry overflow");
      const b = m / n;
      i = m % n;
      const w = Math.floor(b);
      if (a[u] = w, !Number.isSafeInteger(w) || w * n + i !== m)
        throw new Error("convertRadix: carry overflow");
      if (l)
        w ? l = !1 : o = u;
      else continue;
    }
    if (s.push(i), l)
      break;
  }
  for (let i = 0; i < e.length - 1 && e[i] === 0; i++)
    s.push(0);
  return s.reverse();
}
const Zn = (e, t) => t === 0 ? e : Zn(t, e % t), Et = /* @__NO_SIDE_EFFECTS__ */ (e, t) => e + (t - Zn(e, t)), Qt = /* @__PURE__ */ (() => {
  let e = [];
  for (let t = 0; t < 40; t++)
    e.push(2 ** t);
  return e;
})();
function Lr(e, t, n, o) {
  if (kt(e), t <= 0 || t > 32)
    throw new Error(`convertRadix2: wrong from=${t}`);
  if (n <= 0 || n > 32)
    throw new Error(`convertRadix2: wrong to=${n}`);
  if (/* @__PURE__ */ Et(t, n) > 32)
    throw new Error(`convertRadix2: carry overflow from=${t} to=${n} carryBits=${/* @__PURE__ */ Et(t, n)}`);
  let s = 0, a = 0;
  const c = Qt[t], i = Qt[n] - 1, l = [];
  for (const u of e) {
    if (Ze(u), u >= c)
      throw new Error(`convertRadix2: invalid data word=${u} from=${t}`);
    if (s = s << t | u, a + t > 32)
      throw new Error(`convertRadix2: carry overflow pos=${a} from=${t}`);
    for (a += t; a >= n; a -= n)
      l.push((s >> a - n & i) >>> 0);
    const f = Qt[a];
    if (f === void 0)
      throw new Error("invalid carry");
    s &= f - 1;
  }
  if (s = s << n - a & i, !o && a >= t)
    throw new Error("Excess padding");
  if (!o && s > 0)
    throw new Error(`Non-zero padding: ${s}`);
  return o && a > 0 && l.push(s >>> 0), l;
}
// @__NO_SIDE_EFFECTS__
function fc(e) {
  Ze(e);
  const t = 2 ** 8;
  return {
    encode: (n) => {
      if (!At(n))
        throw new Error("radix.encode input should be Uint8Array");
      return Sr(Array.from(n), t, e);
    },
    decode: (n) => (Yn("radix.decode", n), Uint8Array.from(Sr(n, e, t)))
  };
}
// @__NO_SIDE_EFFECTS__
function mc(e, t = !1) {
  if (Ze(e), e <= 0 || e > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Et(8, e) > 32 || /* @__PURE__ */ Et(e, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (n) => {
      if (!At(n))
        throw new Error("radix2.encode input should be Uint8Array");
      return Lr(Array.from(n), 8, e, !t);
    },
    decode: (n) => (Yn("radix2.decode", n), Uint8Array.from(Lr(n, e, 8, t)))
  };
}
function pc(e, t) {
  return Ze(e), cc(t), {
    encode(n) {
      if (!At(n))
        throw new Error("checksum.encode: input should be Uint8Array");
      const o = t(n).slice(0, e), s = new Uint8Array(n.length + e);
      return s.set(n), s.set(o, n.length), s;
    },
    decode(n) {
      if (!At(n))
        throw new Error("checksum.decode: input should be Uint8Array");
      const o = n.slice(0, -e), s = n.slice(-e), a = t(o).slice(0, e);
      for (let c = 0; c < e; c++)
        if (a[c] !== s[c])
          throw new Error("Invalid checksum");
      return o;
    }
  };
}
const ut = {
  alphabet: dc,
  chain: lc,
  checksum: pc,
  convertRadix: Sr,
  convertRadix2: Lr,
  radix: fc,
  radix2: mc,
  join: uc,
  padding: hc
};
const gc = (e) => e[0] === "あいこくしん";
function wc(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function bc(e) {
  const t = wc(e), n = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: n };
}
function Xn(e) {
  Pt(e, 16, 20, 24, 28, 32);
}
const yc = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([Vn(e)[0] >> t << t]);
};
function Jn(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), ut.chain(ut.checksum(1, yc), ut.radix2(11, !0), ut.alphabet(e));
}
function Or(e, t) {
  const { words: n } = bc(e), o = Jn(t).decode(n);
  return Xn(o), o;
}
function eo(e, t) {
  return Xn(e), Jn(t).encode(e).join(gc(t) ? "　" : " ");
}
function Wr(e, t) {
  try {
    Or(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const Le = `abandon
ability
able
about
above
absent
absorb
abstract
absurd
abuse
access
accident
account
accuse
achieve
acid
acoustic
acquire
across
act
action
actor
actress
actual
adapt
add
addict
address
adjust
admit
adult
advance
advice
aerobic
affair
afford
afraid
again
age
agent
agree
ahead
aim
air
airport
aisle
alarm
album
alcohol
alert
alien
all
alley
allow
almost
alone
alpha
already
also
alter
always
amateur
amazing
among
amount
amused
analyst
anchor
ancient
anger
angle
angry
animal
ankle
announce
annual
another
answer
antenna
antique
anxiety
any
apart
apology
appear
apple
approve
april
arch
arctic
area
arena
argue
arm
armed
armor
army
around
arrange
arrest
arrive
arrow
art
artefact
artist
artwork
ask
aspect
assault
asset
assist
assume
asthma
athlete
atom
attack
attend
attitude
attract
auction
audit
august
aunt
author
auto
autumn
average
avocado
avoid
awake
aware
away
awesome
awful
awkward
axis
baby
bachelor
bacon
badge
bag
balance
balcony
ball
bamboo
banana
banner
bar
barely
bargain
barrel
base
basic
basket
battle
beach
bean
beauty
because
become
beef
before
begin
behave
behind
believe
below
belt
bench
benefit
best
betray
better
between
beyond
bicycle
bid
bike
bind
biology
bird
birth
bitter
black
blade
blame
blanket
blast
bleak
bless
blind
blood
blossom
blouse
blue
blur
blush
board
boat
body
boil
bomb
bone
bonus
book
boost
border
boring
borrow
boss
bottom
bounce
box
boy
bracket
brain
brand
brass
brave
bread
breeze
brick
bridge
brief
bright
bring
brisk
broccoli
broken
bronze
broom
brother
brown
brush
bubble
buddy
budget
buffalo
build
bulb
bulk
bullet
bundle
bunker
burden
burger
burst
bus
business
busy
butter
buyer
buzz
cabbage
cabin
cable
cactus
cage
cake
call
calm
camera
camp
can
canal
cancel
candy
cannon
canoe
canvas
canyon
capable
capital
captain
car
carbon
card
cargo
carpet
carry
cart
case
cash
casino
castle
casual
cat
catalog
catch
category
cattle
caught
cause
caution
cave
ceiling
celery
cement
census
century
cereal
certain
chair
chalk
champion
change
chaos
chapter
charge
chase
chat
cheap
check
cheese
chef
cherry
chest
chicken
chief
child
chimney
choice
choose
chronic
chuckle
chunk
churn
cigar
cinnamon
circle
citizen
city
civil
claim
clap
clarify
claw
clay
clean
clerk
clever
click
client
cliff
climb
clinic
clip
clock
clog
close
cloth
cloud
clown
club
clump
cluster
clutch
coach
coast
coconut
code
coffee
coil
coin
collect
color
column
combine
come
comfort
comic
common
company
concert
conduct
confirm
congress
connect
consider
control
convince
cook
cool
copper
copy
coral
core
corn
correct
cost
cotton
couch
country
couple
course
cousin
cover
coyote
crack
cradle
craft
cram
crane
crash
crater
crawl
crazy
cream
credit
creek
crew
cricket
crime
crisp
critic
crop
cross
crouch
crowd
crucial
cruel
cruise
crumble
crunch
crush
cry
crystal
cube
culture
cup
cupboard
curious
current
curtain
curve
cushion
custom
cute
cycle
dad
damage
damp
dance
danger
daring
dash
daughter
dawn
day
deal
debate
debris
decade
december
decide
decline
decorate
decrease
deer
defense
define
defy
degree
delay
deliver
demand
demise
denial
dentist
deny
depart
depend
deposit
depth
deputy
derive
describe
desert
design
desk
despair
destroy
detail
detect
develop
device
devote
diagram
dial
diamond
diary
dice
diesel
diet
differ
digital
dignity
dilemma
dinner
dinosaur
direct
dirt
disagree
discover
disease
dish
dismiss
disorder
display
distance
divert
divide
divorce
dizzy
doctor
document
dog
doll
dolphin
domain
donate
donkey
donor
door
dose
double
dove
draft
dragon
drama
drastic
draw
dream
dress
drift
drill
drink
drip
drive
drop
drum
dry
duck
dumb
dune
during
dust
dutch
duty
dwarf
dynamic
eager
eagle
early
earn
earth
easily
east
easy
echo
ecology
economy
edge
edit
educate
effort
egg
eight
either
elbow
elder
electric
elegant
element
elephant
elevator
elite
else
embark
embody
embrace
emerge
emotion
employ
empower
empty
enable
enact
end
endless
endorse
enemy
energy
enforce
engage
engine
enhance
enjoy
enlist
enough
enrich
enroll
ensure
enter
entire
entry
envelope
episode
equal
equip
era
erase
erode
erosion
error
erupt
escape
essay
essence
estate
eternal
ethics
evidence
evil
evoke
evolve
exact
example
excess
exchange
excite
exclude
excuse
execute
exercise
exhaust
exhibit
exile
exist
exit
exotic
expand
expect
expire
explain
expose
express
extend
extra
eye
eyebrow
fabric
face
faculty
fade
faint
faith
fall
false
fame
family
famous
fan
fancy
fantasy
farm
fashion
fat
fatal
father
fatigue
fault
favorite
feature
february
federal
fee
feed
feel
female
fence
festival
fetch
fever
few
fiber
fiction
field
figure
file
film
filter
final
find
fine
finger
finish
fire
firm
first
fiscal
fish
fit
fitness
fix
flag
flame
flash
flat
flavor
flee
flight
flip
float
flock
floor
flower
fluid
flush
fly
foam
focus
fog
foil
fold
follow
food
foot
force
forest
forget
fork
fortune
forum
forward
fossil
foster
found
fox
fragile
frame
frequent
fresh
friend
fringe
frog
front
frost
frown
frozen
fruit
fuel
fun
funny
furnace
fury
future
gadget
gain
galaxy
gallery
game
gap
garage
garbage
garden
garlic
garment
gas
gasp
gate
gather
gauge
gaze
general
genius
genre
gentle
genuine
gesture
ghost
giant
gift
giggle
ginger
giraffe
girl
give
glad
glance
glare
glass
glide
glimpse
globe
gloom
glory
glove
glow
glue
goat
goddess
gold
good
goose
gorilla
gospel
gossip
govern
gown
grab
grace
grain
grant
grape
grass
gravity
great
green
grid
grief
grit
grocery
group
grow
grunt
guard
guess
guide
guilt
guitar
gun
gym
habit
hair
half
hammer
hamster
hand
happy
harbor
hard
harsh
harvest
hat
have
hawk
hazard
head
health
heart
heavy
hedgehog
height
hello
helmet
help
hen
hero
hidden
high
hill
hint
hip
hire
history
hobby
hockey
hold
hole
holiday
hollow
home
honey
hood
hope
horn
horror
horse
hospital
host
hotel
hour
hover
hub
huge
human
humble
humor
hundred
hungry
hunt
hurdle
hurry
hurt
husband
hybrid
ice
icon
idea
identify
idle
ignore
ill
illegal
illness
image
imitate
immense
immune
impact
impose
improve
impulse
inch
include
income
increase
index
indicate
indoor
industry
infant
inflict
inform
inhale
inherit
initial
inject
injury
inmate
inner
innocent
input
inquiry
insane
insect
inside
inspire
install
intact
interest
into
invest
invite
involve
iron
island
isolate
issue
item
ivory
jacket
jaguar
jar
jazz
jealous
jeans
jelly
jewel
job
join
joke
journey
joy
judge
juice
jump
jungle
junior
junk
just
kangaroo
keen
keep
ketchup
key
kick
kid
kidney
kind
kingdom
kiss
kit
kitchen
kite
kitten
kiwi
knee
knife
knock
know
lab
label
labor
ladder
lady
lake
lamp
language
laptop
large
later
latin
laugh
laundry
lava
law
lawn
lawsuit
layer
lazy
leader
leaf
learn
leave
lecture
left
leg
legal
legend
leisure
lemon
lend
length
lens
leopard
lesson
letter
level
liar
liberty
library
license
life
lift
light
like
limb
limit
link
lion
liquid
list
little
live
lizard
load
loan
lobster
local
lock
logic
lonely
long
loop
lottery
loud
lounge
love
loyal
lucky
luggage
lumber
lunar
lunch
luxury
lyrics
machine
mad
magic
magnet
maid
mail
main
major
make
mammal
man
manage
mandate
mango
mansion
manual
maple
marble
march
margin
marine
market
marriage
mask
mass
master
match
material
math
matrix
matter
maximum
maze
meadow
mean
measure
meat
mechanic
medal
media
melody
melt
member
memory
mention
menu
mercy
merge
merit
merry
mesh
message
metal
method
middle
midnight
milk
million
mimic
mind
minimum
minor
minute
miracle
mirror
misery
miss
mistake
mix
mixed
mixture
mobile
model
modify
mom
moment
monitor
monkey
monster
month
moon
moral
more
morning
mosquito
mother
motion
motor
mountain
mouse
move
movie
much
muffin
mule
multiply
muscle
museum
mushroom
music
must
mutual
myself
mystery
myth
naive
name
napkin
narrow
nasty
nation
nature
near
neck
need
negative
neglect
neither
nephew
nerve
nest
net
network
neutral
never
news
next
nice
night
noble
noise
nominee
noodle
normal
north
nose
notable
note
nothing
notice
novel
now
nuclear
number
nurse
nut
oak
obey
object
oblige
obscure
observe
obtain
obvious
occur
ocean
october
odor
off
offer
office
often
oil
okay
old
olive
olympic
omit
once
one
onion
online
only
open
opera
opinion
oppose
option
orange
orbit
orchard
order
ordinary
organ
orient
original
orphan
ostrich
other
outdoor
outer
output
outside
oval
oven
over
own
owner
oxygen
oyster
ozone
pact
paddle
page
pair
palace
palm
panda
panel
panic
panther
paper
parade
parent
park
parrot
party
pass
patch
path
patient
patrol
pattern
pause
pave
payment
peace
peanut
pear
peasant
pelican
pen
penalty
pencil
people
pepper
perfect
permit
person
pet
phone
photo
phrase
physical
piano
picnic
picture
piece
pig
pigeon
pill
pilot
pink
pioneer
pipe
pistol
pitch
pizza
place
planet
plastic
plate
play
please
pledge
pluck
plug
plunge
poem
poet
point
polar
pole
police
pond
pony
pool
popular
portion
position
possible
post
potato
pottery
poverty
powder
power
practice
praise
predict
prefer
prepare
present
pretty
prevent
price
pride
primary
print
priority
prison
private
prize
problem
process
produce
profit
program
project
promote
proof
property
prosper
protect
proud
provide
public
pudding
pull
pulp
pulse
pumpkin
punch
pupil
puppy
purchase
purity
purpose
purse
push
put
puzzle
pyramid
quality
quantum
quarter
question
quick
quit
quiz
quote
rabbit
raccoon
race
rack
radar
radio
rail
rain
raise
rally
ramp
ranch
random
range
rapid
rare
rate
rather
raven
raw
razor
ready
real
reason
rebel
rebuild
recall
receive
recipe
record
recycle
reduce
reflect
reform
refuse
region
regret
regular
reject
relax
release
relief
rely
remain
remember
remind
remove
render
renew
rent
reopen
repair
repeat
replace
report
require
rescue
resemble
resist
resource
response
result
retire
retreat
return
reunion
reveal
review
reward
rhythm
rib
ribbon
rice
rich
ride
ridge
rifle
right
rigid
ring
riot
ripple
risk
ritual
rival
river
road
roast
robot
robust
rocket
romance
roof
rookie
room
rose
rotate
rough
round
route
royal
rubber
rude
rug
rule
run
runway
rural
sad
saddle
sadness
safe
sail
salad
salmon
salon
salt
salute
same
sample
sand
satisfy
satoshi
sauce
sausage
save
say
scale
scan
scare
scatter
scene
scheme
school
science
scissors
scorpion
scout
scrap
screen
script
scrub
sea
search
season
seat
second
secret
section
security
seed
seek
segment
select
sell
seminar
senior
sense
sentence
series
service
session
settle
setup
seven
shadow
shaft
shallow
share
shed
shell
sheriff
shield
shift
shine
ship
shiver
shock
shoe
shoot
shop
short
shoulder
shove
shrimp
shrug
shuffle
shy
sibling
sick
side
siege
sight
sign
silent
silk
silly
silver
similar
simple
since
sing
siren
sister
situate
six
size
skate
sketch
ski
skill
skin
skirt
skull
slab
slam
sleep
slender
slice
slide
slight
slim
slogan
slot
slow
slush
small
smart
smile
smoke
smooth
snack
snake
snap
sniff
snow
soap
soccer
social
sock
soda
soft
solar
soldier
solid
solution
solve
someone
song
soon
sorry
sort
soul
sound
soup
source
south
space
spare
spatial
spawn
speak
special
speed
spell
spend
sphere
spice
spider
spike
spin
spirit
split
spoil
sponsor
spoon
sport
spot
spray
spread
spring
spy
square
squeeze
squirrel
stable
stadium
staff
stage
stairs
stamp
stand
start
state
stay
steak
steel
stem
step
stereo
stick
still
sting
stock
stomach
stone
stool
story
stove
strategy
street
strike
strong
struggle
student
stuff
stumble
style
subject
submit
subway
success
such
sudden
suffer
sugar
suggest
suit
summer
sun
sunny
sunset
super
supply
supreme
sure
surface
surge
surprise
surround
survey
suspect
sustain
swallow
swamp
swap
swarm
swear
sweet
swift
swim
swing
switch
sword
symbol
symptom
syrup
system
table
tackle
tag
tail
talent
talk
tank
tape
target
task
taste
tattoo
taxi
teach
team
tell
ten
tenant
tennis
tent
term
test
text
thank
that
theme
then
theory
there
they
thing
this
thought
three
thrive
throw
thumb
thunder
ticket
tide
tiger
tilt
timber
time
tiny
tip
tired
tissue
title
toast
tobacco
today
toddler
toe
together
toilet
token
tomato
tomorrow
tone
tongue
tonight
tool
tooth
top
topic
topple
torch
tornado
tortoise
toss
total
tourist
toward
tower
town
toy
track
trade
traffic
tragic
train
transfer
trap
trash
travel
tray
treat
tree
trend
trial
tribe
trick
trigger
trim
trip
trophy
trouble
truck
true
truly
trumpet
trust
truth
try
tube
tuition
tumble
tuna
tunnel
turkey
turn
turtle
twelve
twenty
twice
twin
twist
two
type
typical
ugly
umbrella
unable
unaware
uncle
uncover
under
undo
unfair
unfold
unhappy
uniform
unique
unit
universe
unknown
unlock
until
unusual
unveil
update
upgrade
uphold
upon
upper
upset
urban
urge
usage
use
used
useful
useless
usual
utility
vacant
vacuum
vague
valid
valley
valve
van
vanish
vapor
various
vast
vault
vehicle
velvet
vendor
venture
venue
verb
verify
version
very
vessel
veteran
viable
vibrant
vicious
victory
video
view
village
vintage
violin
virtual
virus
visa
visit
visual
vital
vivid
vocal
voice
void
volcano
volume
vote
voyage
wage
wagon
wait
walk
wall
walnut
want
warfare
warm
warrior
wash
wasp
waste
water
wave
way
wealth
weapon
wear
weasel
weather
web
wedding
weekend
weird
welcome
west
wet
whale
what
wheat
wheel
when
where
whip
whisper
wide
width
wife
wild
will
win
window
wine
wing
wink
winner
winter
wire
wisdom
wise
wish
witness
wolf
woman
wonder
wood
wool
word
work
world
worry
worth
wrap
wreck
wrestle
wrist
write
wrong
yard
year
yellow
you
young
youth
zebra
zero
zone
zoo`.split(`
`), me = 12;
function Ac(e) {
  if (e.length !== 16)
    throw new Error(`Invalid share length: expected 16, got ${e.length}`);
  const n = eo(e, Le).split(" ");
  if (n.length !== me)
    throw new Error(`Unexpected word count: expected ${me}, got ${n.length}`);
  return n;
}
function vc(e) {
  if (e.length !== me)
    throw new Error(`Invalid word count: expected ${me}, got ${e.length}`);
  const t = e.join(" ").toLowerCase().trim();
  if (!Wr(t, Le))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const n = Or(t, Le);
  if (n.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${n.length}`);
  return Oe(n);
}
function kc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const n = eo(e, Le).split(" ");
  if (n.length !== me)
    throw new Error(`Unexpected word count: expected ${me}, got ${n.length}`);
  return n;
}
function Nc(e) {
  if (e.length !== me)
    throw new Error(`Invalid word count: expected ${me}, got ${e.length}`);
  const t = e.join(" ").toLowerCase().trim();
  if (!Wr(t, Le))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const n = Or(t, Le);
  if (n.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${n.length}`);
  return an(n);
}
function to(e) {
  if (e.length !== me)
    return !1;
  const t = e.join(" ").toLowerCase().trim();
  return Wr(t, Le);
}
function ht(e) {
  return Le.includes(e.toLowerCase().trim());
}
function Ec(e, t = 5) {
  const n = e.toLowerCase().trim();
  return n.length === 0 ? [] : Le.filter((o) => o.startsWith(n)).slice(0, t);
}
function Cc(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 4)
    t.push(e.slice(n, n + 4));
  return t;
}
function xc(e) {
  return e.toLowerCase().replace(/[,\n\r\t]+/g, " ").split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);
}
function Qu({
  className: e = "",
  variant: t = "default",
  size: n = "md",
  children: o,
  menuItems: s = [],
  hideSignOut: a = !1
}) {
  const { user: c, isAuthenticated: i, isLoading: l, openLoginModal: u, logout: f } = St(), [h, m] = B(!1), [b, w] = B(-1), p = J(null), E = J(null), A = z(
    () => [...s, ...a ? [] : [{ label: "Sign out", onClick: f }]],
    [s, a, f]
  );
  O(() => {
    if (!h) return;
    const g = (v) => {
      p.current && !p.current.contains(v.target) && (m(!1), w(-1));
    }, k = (v) => {
      v.key === "Escape" && (m(!1), w(-1), E.current?.focus());
    };
    return document.addEventListener("mousedown", g), document.addEventListener("keydown", k), () => {
      document.removeEventListener("mousedown", g), document.removeEventListener("keydown", k);
    };
  }, [h]);
  const C = T(
    (g) => {
      if (!(!h || A.length === 0))
        switch (g.key) {
          case "ArrowDown":
            g.preventDefault(), w((k) => (k + 1) % A.length);
            break;
          case "ArrowUp":
            g.preventDefault(), w((k) => (k - 1 + A.length) % A.length);
            break;
          case "Home":
            g.preventDefault(), w(0);
            break;
          case "End":
            g.preventDefault(), w(A.length - 1);
            break;
          case "Enter":
          case " ":
            b >= 0 && (g.preventDefault(), A[b].onClick(), m(!1), w(-1));
            break;
        }
    },
    [h, b, A]
  ), N = T(() => {
    A.length !== 0 && (m((g) => !g), w(-1));
  }, [A.length]), x = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, R = {
    default: "cedros-button-primary",
    outline: "cedros-button-outline",
    ghost: "cedros-button-ghost"
  };
  if (l)
    return /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: `cedros-button ${R[t]} ${x[n]} ${e}`,
        disabled: !0,
        children: /* @__PURE__ */ r(Q, { size: "sm" })
      }
    );
  if (i && c) {
    const g = c.name || c.email || "User", k = wn(c.picture);
    return (
      // L-08: Added keyboard handler and ref for accessibility
      /* @__PURE__ */ d("div", { className: "cedros-user-menu", ref: p, onKeyDown: C, children: [
        /* @__PURE__ */ d(
          "button",
          {
            ref: E,
            type: "button",
            className: `cedros-button cedros-user-button ${x[n]} ${e}`,
            "aria-haspopup": "menu",
            "aria-expanded": h,
            "aria-label": `User menu for ${g}`,
            onClick: N,
            children: [
              k ? /* @__PURE__ */ r(
                "img",
                {
                  src: k,
                  alt: g,
                  className: "cedros-user-avatar",
                  referrerPolicy: "no-referrer",
                  crossOrigin: "anonymous"
                }
              ) : /* @__PURE__ */ r("div", { className: "cedros-user-avatar-placeholder", children: (g[0] || "?").toUpperCase() }),
              /* @__PURE__ */ r("span", { className: "cedros-user-name", children: g })
            ]
          }
        ),
        h && /* @__PURE__ */ d("div", { className: "cedros-dropdown cedros-dropdown-open", role: "menu", children: [
          s.map((v, y) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item ${b === y ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: b === y ? 0 : -1,
              onClick: () => {
                v.onClick(), m(!1);
              },
              children: [
                v.icon && /* @__PURE__ */ r("span", { className: "cedros-dropdown-icon", children: v.icon }),
                v.label
              ]
            },
            y
          )),
          s.length > 0 && !a && /* @__PURE__ */ r("div", { className: "cedros-dropdown-divider", role: "separator" }),
          !a && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item cedros-dropdown-item-danger ${b === s.length ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: b === s.length ? 0 : -1,
              onClick: () => {
                f(), m(!1);
              },
              children: "Sign out"
            }
          )
        ] })
      ] })
    );
  }
  return /* @__PURE__ */ r(
    "button",
    {
      type: "button",
      className: `cedros-button ${R[t]} ${x[n]} ${e}`,
      onClick: u,
      children: o || "Sign in"
    }
  );
}
function qr() {
  const { config: e } = ne(), [t, n] = B(!1), [o, s] = B(!1), [a, c] = B(null), i = z(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: l, getRemainingAttempts: u } = bn({
    maxAttempts: 3,
    windowMs: 3e5
  }), f = T(
    async (w) => {
      if (!An(w)) {
        const p = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw c(p), p;
      }
      try {
        l();
      } catch (p) {
        const E = {
          code: "RATE_LIMITED",
          message: p instanceof Error ? p.message : "Too many attempts"
        };
        throw c(E), E;
      }
      n(!0), c(null), s(!1);
      try {
        await i.post("/forgot-password", { email: w }), s(!0);
      } catch (p) {
        const E = q(p, "Unable to send the reset email. Please try again.");
        throw c(E), E;
      } finally {
        n(!1);
      }
    },
    [i, l]
  ), h = T(
    async (w, p) => {
      n(!0), c(null), s(!1);
      try {
        await i.post("/reset-password", { token: w, newPassword: p }), s(!0);
      } catch (E) {
        const A = q(E, "Unable to reset your password. Please try again.");
        throw c(A), A;
      } finally {
        n(!1);
      }
    },
    [i]
  ), m = T(() => c(null), []), b = T(() => {
    c(null), s(!1), n(!1);
  }, []);
  return {
    forgotPassword: f,
    resetPassword: h,
    isLoading: t,
    isSuccess: o,
    error: a,
    clearError: m,
    reset: b,
    remainingAttempts: u()
  };
}
function Sc(e) {
  return typeof e == "object" && e !== null && "mfaRequired" in e && e.mfaRequired === !0;
}
function Lc() {
  const { config: e, _internal: t } = ne(), [n, o] = B(!1), [s, a] = B(!1), [c, i] = B(null), l = z(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: u, getRemainingAttempts: f } = bn({
    maxAttempts: 3,
    windowMs: 3e5
  }), h = T(
    async (p) => {
      if (!An(p)) {
        const E = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw i(E), E;
      }
      try {
        u();
      } catch (E) {
        const A = {
          code: "RATE_LIMITED",
          message: E instanceof Error ? E.message : "Too many attempts"
        };
        throw i(A), A;
      }
      o(!0), i(null), a(!1);
      try {
        await l.post("/instant-link", { email: p }), a(!0);
      } catch (E) {
        const A = q(E, "Unable to send the sign-in link. Please try again.");
        throw i(A), A;
      } finally {
        o(!1);
      }
    },
    [l, u]
  ), m = T(
    async (p) => {
      if (!p || p.trim().length === 0) {
        const E = {
          code: "VALIDATION_ERROR",
          message: "Invalid or missing sign-in link token"
        };
        throw i(E), E;
      }
      o(!0), i(null), a(!1);
      try {
        const E = await l.post(
          "/instant-link/verify",
          {
            token: p
          }
        );
        return Sc(E) || (e.callbacks?.onLoginSuccess?.(E.user, "email"), t?.handleLoginSuccess(E.user, E.tokens)), E;
      } catch (E) {
        const A = q(E, "Unable to verify the sign-in link. Please try again.");
        throw i(A), A;
      } finally {
        o(!1);
      }
    },
    [l, e.callbacks, t]
  ), b = T(() => i(null), []), w = T(() => {
    i(null), a(!1), o(!1);
  }, []);
  return {
    sendInstantLink: h,
    verifyInstantLink: m,
    isLoading: n,
    isSuccess: s,
    error: c,
    clearError: b,
    reset: w,
    remainingAttempts: f()
  };
}
const Bc = {
  reset: {
    subtitle: "Enter your email address and we'll send you a link to reset your password.",
    button: "Send reset link",
    successMessage: (e) => /* @__PURE__ */ d(X, { children: [
      "If an account exists for ",
      /* @__PURE__ */ r("strong", { children: e }),
      ", you will receive a password reset link shortly."
    ] })
  },
  instantLink: {
    subtitle: "Enter your email and we'll send you a sign-in link. You can change your password in your account settings once signed in.",
    button: "Send sign-in link",
    successMessage: (e) => /* @__PURE__ */ d(X, { children: [
      "We sent a sign-in link to ",
      /* @__PURE__ */ r("strong", { children: e }),
      ". Click the link to sign in."
    ] })
  }
};
function Pc({
  mode: e = "reset",
  onSuccess: t,
  onCancel: n,
  className: o = ""
}) {
  const [s, a] = B(""), c = qr(), i = Lc(), l = pn(), u = e === "instantLink" ? { submit: i.sendInstantLink, isLoading: i.isLoading, isSuccess: i.isSuccess, error: i.error, clearError: i.clearError } : { submit: c.forgotPassword, isLoading: c.isLoading, isSuccess: c.isSuccess, error: c.error, clearError: c.clearError }, f = Bc[e], h = async (m) => {
    m.preventDefault();
    try {
      await u.submit(s), t?.();
    } catch {
    }
  };
  return u.isSuccess ? /* @__PURE__ */ d("div", { className: `cedros-forgot-password-success ${o}`, children: [
    /* @__PURE__ */ d(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ r("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ r(
            "path",
            {
              d: "M14 24l7 7 13-13",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ r("h3", { className: "cedros-success-title", children: "Check your email" }),
    /* @__PURE__ */ r("p", { className: "cedros-success-message", children: f.successMessage(s) }),
    n && /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-outline",
        onClick: n,
        children: "Back to login"
      }
    )
  ] }) : /* @__PURE__ */ d("form", { className: `cedros-forgot-password-form ${o}`, onSubmit: h, children: [
    /* @__PURE__ */ d("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-form-title", children: "Forgot password?" }),
      /* @__PURE__ */ r("p", { className: "cedros-form-subtitle", children: f.subtitle })
    ] }),
    /* @__PURE__ */ r(re, { error: u.error, onDismiss: u.clearError }),
    /* @__PURE__ */ d("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ r("label", { htmlFor: l, className: "cedros-label", children: "Email address" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: l,
          type: "email",
          className: "cedros-input",
          value: s,
          onChange: (m) => a(m.target.value),
          placeholder: "you@example.com",
          required: !0,
          autoComplete: "email",
          disabled: u.isLoading
        }
      )
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: u.isLoading || !s,
          children: u.isLoading ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Q, { size: "sm" }),
            "Sending..."
          ] }) : f.button
        }
      ),
      n && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: n,
          disabled: u.isLoading,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
const Rc = {
  loading: !1,
  loaded: !1,
  error: null,
  callbacks: [],
  load() {
    return typeof window > "u" || typeof document > "u" ? Promise.reject(new Error("Apple Sign-In script loader cannot run in SSR")) : this.loaded ? Promise.resolve() : this.loading ? new Promise((e, t) => {
      this.callbacks.push({ resolve: e, reject: t });
    }) : (this.loading = !0, new Promise((e, t) => {
      this.callbacks.push({ resolve: e, reject: t });
      const n = document.getElementById("apple-signin-script");
      if (n) {
        window.AppleID ? (this.loaded = !0, this.loading = !1, this.callbacks.forEach((s) => s.resolve()), this.callbacks = []) : n.addEventListener("load", () => {
          this.loaded = !0, this.loading = !1, this.callbacks.forEach((s) => s.resolve()), this.callbacks = [];
        });
        return;
      }
      const o = document.createElement("script");
      o.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js", o.async = !0, o.defer = !0, o.id = "apple-signin-script", o.onload = () => {
        this.loaded = !0, this.loading = !1, this.callbacks.forEach((s) => s.resolve()), this.callbacks = [];
      }, o.onerror = () => {
        this.loading = !1, o.remove();
        const s = new Error("Failed to load Apple Sign In script");
        this.callbacks.forEach((a) => a.reject(s)), this.callbacks = [];
      }, document.head.appendChild(o);
    }));
  },
  /**
   * Reset singleton state for test isolation
   * @internal - Only use in test setup/teardown
   */
  _reset() {
    this.loading = !1, this.loaded = !1, this.error = null, this.callbacks = [];
  }
};
function Tc() {
  const { config: e, _internal: t } = ne(), [n, o] = B(!1), [s, a] = B(!1), [c, i] = B(null), [l, u] = B(null), f = J(e), h = z(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  );
  O(() => {
    f.current = e;
  }, [e]), O(() => {
    if (!e.appleClientId)
      return;
    let p = !0;
    const E = () => {
      if (p)
        try {
          window.AppleID?.auth?.init({
            clientId: e.appleClientId,
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: !0
          }), p && a(!0);
        } catch {
          p && i({
            code: "SERVER_ERROR",
            message: "Unable to initialize Apple sign-in. Please refresh and try again."
          });
        }
    };
    return Rc.load().then(() => {
      p && E();
    }).catch(() => {
      p && i({
        code: "SERVER_ERROR",
        message: "Unable to load Apple sign-in. Please refresh and try again."
      });
    }), () => {
      p = !1;
    };
  }, [e.appleClientId]);
  const m = T(async () => {
    if (!e.appleClientId) {
      const E = {
        code: "VALIDATION_ERROR",
        message: "Apple Client ID not configured"
      };
      throw i(E), E;
    }
    if (!s) {
      const E = {
        code: "VALIDATION_ERROR",
        message: "Apple sign-in is not ready yet. Please wait a moment and try again."
      };
      throw i(E), E;
    }
    o(!0), i(null);
    let p;
    try {
      const E = crypto.getRandomValues(new Uint8Array(32)), A = Array.from(E, (k) => k.toString(16).padStart(2, "0")).join(""), C = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(A)
      ), N = Array.from(
        new Uint8Array(C),
        (k) => k.toString(16).padStart(2, "0")
      ).join("");
      window.AppleID.auth.init({
        clientId: e.appleClientId,
        scope: "name email",
        redirectURI: window.location.origin,
        usePopup: !0,
        nonce: N
      });
      const x = await window.AppleID.auth.signIn();
      if (p = x.authorization?.id_token, !p)
        throw new Error("No ID token received from Apple");
      const R = x.user?.name ? `${x.user.name.firstName || ""} ${x.user.name.lastName || ""}`.trim() : void 0, g = await h.post("/apple", {
        idToken: p,
        name: R || void 0,
        nonce: A
      });
      return f.current.callbacks?.onLoginSuccess?.(g.user, "apple"), t?.handleLoginSuccess(g.user, g.tokens), o(!1), g;
    } catch (E) {
      if (E.error === "popup_closed_by_user") {
        const N = {
          code: "SERVER_ERROR",
          message: "Apple sign-in was cancelled."
        };
        throw i(N), o(!1), N;
      }
      const C = q(E, "Unable to sign in with Apple. Please try again.");
      throw C.code === "ACCOUNT_LINK_REQUIRED" && p && u(p), i(C), o(!1), C;
    }
  }, [e.appleClientId, s, h, t]), b = T(() => i(null), []), w = T(() => u(null), []);
  return {
    signIn: m,
    isLoading: n,
    isInitialized: s,
    error: c,
    clearError: b,
    pendingLinkIdToken: l,
    clearPendingLink: w
  };
}
function ro() {
  if (typeof window > "u" || typeof navigator > "u")
    return !1;
  const e = navigator.userAgent.toLowerCase(), t = (navigator.platform || "").toLowerCase();
  return !!(/iphone|ipad|ipod/.test(e) || t.includes("mac") || /macintosh/.test(e) || t === "macintel" && navigator.maxTouchPoints > 1);
}
function Mc({
  onSuccess: e,
  onError: t,
  className: n = "",
  variant: o = "default",
  size: s = "md",
  disabled: a = !1,
  hideOnNonApple: c = !0
}) {
  const { signIn: i, isLoading: l, isInitialized: u } = Tc(), [f] = B(() => ro());
  if (c && !f)
    return null;
  const h = async () => {
    try {
      await i(), e?.();
    } catch (w) {
      const p = w instanceof Error ? w : new Error(String(w));
      t?.(p);
    }
  }, m = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ d(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[o]} ${m[s]} ${n}`,
      onClick: h,
      disabled: a || !u || l,
      "aria-label": "Sign in with Apple",
      children: [
        l ? /* @__PURE__ */ r(Q, { size: "sm" }) : /* @__PURE__ */ r(
          "svg",
          {
            className: "cedros-button-icon",
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true",
            children: /* @__PURE__ */ r("path", { d: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" })
          }
        ),
        /* @__PURE__ */ r("span", { children: "Continue with Apple" })
      ]
    }
  );
}
function de(e, t) {
  if (!e) throw new Error(t);
}
function Ic(e) {
  return e.replace(/-/g, "+").replace(/_/g, "/");
}
function Ct(e) {
  de(typeof e == "string" && e.length > 0, "Expected base64url string");
  const t = Ic(e), n = t + "=".repeat((4 - t.length % 4) % 4), o = atob(n), s = new Uint8Array(o.length);
  for (let a = 0; a < o.length; a++) s[a] = o.charCodeAt(a);
  return s.buffer;
}
function $e(e) {
  const t = new Uint8Array(e);
  let n = "";
  for (let s = 0; s < t.length; s++) n += String.fromCharCode(t[s]);
  return btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function so(e) {
  de(typeof e == "object" && e !== null, "Invalid credential descriptor");
  const t = e;
  return de(typeof t.type == "string", "Invalid credential descriptor type"), de(typeof t.id == "string", "Invalid credential descriptor id"), {
    type: t.type,
    id: Ct(t.id),
    transports: Array.isArray(t.transports) ? t.transports : void 0
  };
}
function Gt(e) {
  de(e && typeof e == "object", "Missing creation options");
  const t = e.publicKey;
  de(t && typeof t == "object", "Missing creation options.publicKey"), de(typeof t.challenge == "string", "Missing creation challenge"), de(typeof t.rp == "object" && t.rp !== null, "Missing rp"), de(typeof t.user == "object" && t.user !== null, "Missing user");
  const n = t.rp, o = t.user;
  de(typeof n.name == "string", "Missing rp.name"), de(typeof o.id == "string", "Missing user.id"), de(typeof o.name == "string", "Missing user.name"), de(typeof o.displayName == "string", "Missing user.displayName");
  const s = Array.isArray(t.excludeCredentials) ? t.excludeCredentials.map(so) : void 0, a = Array.isArray(t.pubKeyCredParams) ? t.pubKeyCredParams.map((i) => ({
    type: i.type,
    alg: i.alg
  })) : [], c = {
    challenge: Ct(t.challenge),
    rp: {
      name: n.name,
      id: typeof n.id == "string" ? n.id : void 0
    },
    user: {
      id: Ct(o.id),
      name: o.name,
      displayName: o.displayName
    },
    pubKeyCredParams: a,
    timeout: typeof t.timeout == "number" ? t.timeout : void 0,
    attestation: typeof t.attestation == "string" ? t.attestation : void 0,
    authenticatorSelection: typeof t.authenticatorSelection == "object" && t.authenticatorSelection !== null ? t.authenticatorSelection : void 0,
    excludeCredentials: s,
    extensions: typeof t.extensions == "object" && t.extensions !== null ? t.extensions : void 0
  };
  return c.hints = ["client-device"], c;
}
function Ns(e) {
  de(e && typeof e == "object", "Missing request options");
  const t = e.publicKey;
  de(t && typeof t == "object", "Missing request options.publicKey"), de(typeof t.challenge == "string", "Missing request challenge");
  const n = Array.isArray(t.allowCredentials) ? t.allowCredentials.map(so) : void 0, o = {
    challenge: Ct(t.challenge),
    rpId: typeof t.rpId == "string" ? t.rpId : void 0,
    timeout: typeof t.timeout == "number" ? t.timeout : void 0,
    userVerification: typeof t.userVerification == "string" ? t.userVerification : void 0,
    allowCredentials: n,
    extensions: typeof t.extensions == "object" && t.extensions !== null ? t.extensions : void 0
  };
  return o.hints = ["client-device"], o;
}
function et(e) {
  const t = $e(e.rawId), n = e.response, s = { ...{
    clientDataJSON: $e(n.clientDataJSON)
  } };
  if ("attestationObject" in n) {
    const a = n;
    if (s.attestationObject = $e(a.attestationObject), typeof a.getTransports == "function")
      try {
        s.transports = a.getTransports();
      } catch {
      }
  }
  if ("authenticatorData" in n) {
    const a = n;
    s.authenticatorData = $e(a.authenticatorData), s.signature = $e(a.signature), a.userHandle && (s.userHandle = $e(a.userHandle));
  }
  return {
    id: e.id,
    rawId: t,
    type: e.type,
    authenticatorAttachment: e.authenticatorAttachment ?? void 0,
    clientExtensionResults: e.getClientExtensionResults?.() ?? {},
    response: s
  };
}
function _c() {
  if (typeof window < "u") {
    const e = window.location?.hostname, t = e === "localhost" || e === "127.0.0.1" || e?.endsWith(".localhost");
    if (!(window.isSecureContext === !0) && !t)
      return !1;
  }
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator < "u" && typeof navigator.credentials < "u";
}
function Dc(e) {
  return typeof e == "object" && e !== null && "code" in e && "message" in e && typeof e.code == "string" && typeof e.message == "string";
}
function tt(e) {
  if (!(e instanceof Error)) return null;
  const t = e.name;
  return t === "NotAllowedError" ? { code: "SERVER_ERROR", message: "Passkey operation was cancelled or timed out" } : t === "InvalidStateError" ? { code: "VALIDATION_ERROR", message: "Passkey is not available for this operation" } : t === "SecurityError" ? {
    code: "VALIDATION_ERROR",
    message: "Passkeys require HTTPS and a correctly configured relying party (WEBAUTHN_RP_ID / WEBAUTHN_RP_ORIGIN)"
  } : null;
}
function no() {
  const { config: e, _internal: t } = ne(), [n, o] = B(!1), [s, a] = B(null), c = z(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      // Needed for authenticated registration endpoints when cookie auth is disabled
      getAccessToken: t?.getAccessToken
    }),
    [t?.getAccessToken, e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), i = T(() => a(null), []), l = _c(), u = T(
    async (E) => {
      if (!l) {
        const A = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(A), A;
      }
      o(!0), a(null);
      try {
        const A = await c.post(
          "/webauthn/auth/options",
          { email: E?.email }
        ), C = Ns(A.options), N = await navigator.credentials.get({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey authentication returned no credential");
        const x = await c.post("/webauthn/auth/verify", {
          challengeId: A.challengeId,
          credential: et(N)
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), x;
      } catch (A) {
        const N = tt(A) ?? q(A, "Unable to sign in with passkey. Please try again.");
        throw a(N), N;
      } finally {
        o(!1);
      }
    },
    [c, e.callbacks, t, l]
  ), f = T(
    async (E) => {
      if (!l) {
        const A = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(A), A;
      }
      o(!0), a(null);
      try {
        const A = await c.post(
          "/webauthn/register/options",
          {}
        ), C = Gt(A.options), N = await navigator.credentials.create({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey registration returned no credential");
        const x = await c.post("/webauthn/register/verify", {
          challengeId: A.challengeId,
          credential: et(N),
          label: E?.label
        });
        if (!x.success)
          throw new Error("Passkey registration failed");
        return { credentialId: x.credentialId, label: x.label };
      } catch (A) {
        const N = tt(A) ?? q(A, "Unable to register passkey. Please try again.");
        throw a(N), N;
      } finally {
        o(!1);
      }
    },
    [c, l]
  ), h = T(
    async (E) => {
      if (!l) {
        const A = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(A), A;
      }
      o(!0), a(null);
      try {
        const A = await c.post(
          "/webauthn/signup/options",
          {}
        ), C = Gt(A.options), N = await navigator.credentials.create({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey signup returned no credential");
        const x = await c.post("/webauthn/signup/verify", {
          challengeId: A.challengeId,
          credential: et(N),
          email: E?.email,
          name: E?.name,
          label: E?.label
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), x;
      } catch (A) {
        const N = tt(A) ?? q(A, "Unable to sign up with passkey. Please try again.");
        throw a(N), N;
      } finally {
        o(!1);
      }
    },
    [c, e.callbacks, t, l]
  ), m = T(async () => {
    if (!l) {
      const C = {
        code: "VALIDATION_ERROR",
        message: "Passkeys are not supported in this browser"
      };
      throw a(C), C;
    }
    o(!0), a(null);
    const E = typeof localStorage < "u" && localStorage.getItem("cedros-passkey-registered") === "1", A = () => {
      try {
        localStorage.setItem("cedros-passkey-registered", "1");
      } catch {
      }
    };
    return E ? b(A) : w(A);
  }, [c, e.callbacks, t, l]), b = T(
    async (E) => {
      try {
        const A = await c.post(
          "/webauthn/auth/options",
          {}
        ), C = Ns(A.options), N = await navigator.credentials.get({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey authentication returned no credential");
        const x = await c.post("/webauthn/auth/verify", {
          challengeId: A.challengeId,
          credential: et(N)
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), E(), x;
      } catch (A) {
        if (A instanceof Error && (A.name === "NotAllowedError" || A.name === "InvalidStateError"))
          return p(E);
        if (typeof A == "object" && A !== null && "isApiError" in A && A.data?.code === "INVALID_CREDENTIALS") {
          const g = {
            code: "INVALID_CREDENTIALS",
            message: "This passkey is not recognized. Please remove old passkeys for this site and try again, or sign in another way."
          };
          throw a(g), g;
        }
        const R = tt(A) ?? q(A, "Unable to sign in with passkey. Please try again.");
        throw a(R), R;
      } finally {
        o(!1);
      }
    },
    [c, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), w = T(
    async (E) => {
      try {
        return await p(E);
      } catch (A) {
        if (A instanceof Error && (A.name === "InvalidStateError" || A.name === "NotAllowedError"))
          return b(E);
        if (!Dc(A)) {
          const x = tt(A) ?? q(A, "Unable to create passkey. Please try again.");
          throw a(x), x;
        }
        throw A;
      } finally {
        o(!1);
      }
    },
    [c, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), p = T(
    async (E) => {
      const A = await c.post(
        "/webauthn/signup/options",
        {}
      ), C = Gt(A.options), N = await navigator.credentials.create({
        publicKey: C
      });
      if (!N)
        throw new Error("Passkey signup returned no credential");
      const x = await c.post("/webauthn/signup/verify", {
        challengeId: A.challengeId,
        credential: et(N)
      });
      return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), E(), x;
    },
    [c, e.callbacks, t]
  );
  return {
    isSupported: l,
    isLoading: n,
    error: s,
    clearError: i,
    continueWithPasskey: m,
    authenticatePasskey: u,
    registerPasskey: f,
    signupWithPasskey: h
  };
}
function Uc({
  onSuccess: e,
  className: t = "",
  children: n,
  disabled: o
}) {
  const { continueWithPasskey: s, isLoading: a, isSupported: c } = no(), i = o || !c || a;
  return /* @__PURE__ */ d(
    "button",
    {
      type: "button",
      className: `cedros-button cedros-button-social ${t}`,
      onClick: async () => {
        try {
          await s(), e?.();
        } catch {
        }
      },
      disabled: i,
      "aria-disabled": i,
      children: [
        a ? /* @__PURE__ */ r(Q, { size: "sm" }) : /* @__PURE__ */ r("span", { className: "cedros-social-icon", "aria-hidden": "true", children: /* @__PURE__ */ r(Fc, {}) }),
        /* @__PURE__ */ r("span", { children: n ?? "Continue with Passkey" })
      ]
    }
  );
}
function Fc() {
  return /* @__PURE__ */ d(
    "svg",
    {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ r("path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" }),
        /* @__PURE__ */ r("path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88" }),
        /* @__PURE__ */ r("path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02" }),
        /* @__PURE__ */ r("path", { d: "M2 12a10 10 0 0 1 18-6" }),
        /* @__PURE__ */ r("path", { d: "M2 16h.01" }),
        /* @__PURE__ */ r("path", { d: "M21.8 16c.2-2 .131-5.354 0-6" }),
        /* @__PURE__ */ r("path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" }),
        /* @__PURE__ */ r("path", { d: "M8.65 22c.21-.66.45-1.32.57-2" }),
        /* @__PURE__ */ r("path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2" })
      ]
    }
  );
}
const rt = ["login", "register"];
function jr({ onSuccess: e, className: t = "", defaultTab: n = "login" }) {
  const { config: o, socialButtonOrder: s } = ne(), [a, c] = B(n), [i, l] = B("form"), [u, f] = B(() => rs()), [h] = B(() => ro());
  O(() => {
    const R = () => f(rs());
    return R(), window.addEventListener("load", R), window.addEventListener("focus", R), () => {
      window.removeEventListener("load", R), window.removeEventListener("focus", R);
    };
  }, []);
  const m = o.forms?.forgotPassword?.mode ?? (o.features?.instantLink ? "instantLink" : "reset"), b = T(
    (R) => {
      const g = rt.indexOf(a);
      let k = g;
      switch (R.key) {
        case "ArrowLeft":
        case "ArrowUp":
          k = g === 0 ? rt.length - 1 : g - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          k = g === rt.length - 1 ? 0 : g + 1;
          break;
        case "Home":
          k = 0;
          break;
        case "End":
          k = rt.length - 1;
          break;
        default:
          return;
      }
      R.preventDefault();
      const v = rt[k];
      c(v), document.getElementById(`cedros-tab-${v}`)?.focus();
    },
    [a]
  ), w = o.features ?? {
    email: !0,
    google: !0,
    apple: !0,
    solana: !0,
    webauthn: !0
  }, p = w.email !== !1, E = w.google !== !1 && o.googleClientId, A = w.apple !== !1 && o.appleClientId && h, C = w.solana !== !1 && u, N = w.webauthn !== !1, x = p && (E || A || C || N);
  return i === "forgotPassword" ? /* @__PURE__ */ r("div", { className: `cedros-login-form ${t}`, children: /* @__PURE__ */ r(Pc, { mode: m, onCancel: () => l("form") }) }) : /* @__PURE__ */ d("div", { className: `cedros-login-form ${t}`, children: [
    (N || E || A || C) && (() => {
      const R = {
        webauthn: N ? /* @__PURE__ */ r(Uc, { onSuccess: e }) : null,
        google: E ? /* @__PURE__ */ r(Xo, { onSuccess: e }) : null,
        apple: A ? /* @__PURE__ */ r(Mc, { onSuccess: e }) : null,
        solana: C ? /* @__PURE__ */ r(Jo, { onSuccess: e }) : null
      };
      return /* @__PURE__ */ r("div", { className: "cedros-social-buttons", children: (s ?? ["webauthn", "google", "apple", "solana"]).map((k) => {
        const v = R[k];
        return v ? /* @__PURE__ */ r($o, { children: v }, k) : null;
      }) });
    })(),
    x && /* @__PURE__ */ r("div", { className: "cedros-divider", children: /* @__PURE__ */ r("span", { children: "Or continue with" }) }),
    p && /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ d("div", { className: "cedros-tabs", role: "tablist", "aria-label": "Authentication method", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-login",
            className: `cedros-tab ${a === "login" ? "cedros-tab-active" : ""}`,
            onClick: () => c("login"),
            onKeyDown: b,
            "aria-selected": a === "login",
            "aria-controls": "cedros-tabpanel-login",
            tabIndex: a === "login" ? 0 : -1,
            children: "Sign in"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-register",
            className: `cedros-tab ${a === "register" ? "cedros-tab-active" : ""}`,
            onClick: () => c("register"),
            onKeyDown: b,
            "aria-selected": a === "register",
            "aria-controls": "cedros-tabpanel-register",
            tabIndex: a === "register" ? 0 : -1,
            children: "Sign up"
          }
        )
      ] }),
      /* @__PURE__ */ r(
        "div",
        {
          role: "tabpanel",
          id: `cedros-tabpanel-${a}`,
          "aria-labelledby": `cedros-tab-${a}`,
          children: a === "login" ? /* @__PURE__ */ r(
            Yo,
            {
              onSuccess: e,
              onSwitchToRegister: () => c("register"),
              onForgotPassword: () => l("forgotPassword")
            }
          ) : /* @__PURE__ */ r(
            Zo,
            {
              onSuccess: e,
              onSwitchToLogin: () => c("login")
            }
          )
        }
      )
    ] })
  ] });
}
class Oc extends Qo {
  constructor(t) {
    super(t), this.state = {
      hasError: !1,
      error: null,
      errorInfo: null
    };
  }
  static getDerivedStateFromError(t) {
    return { hasError: !0, error: t };
  }
  componentDidCatch(t, n) {
    this.setState({ errorInfo: n }), console.error("[Cedros Login] Error caught by ErrorBoundary:", t), console.error("[Cedros Login] Component stack:", n.componentStack), this.props.onError?.(t, n);
  }
  handleRetry = () => {
    this.setState({
      hasError: !1,
      error: null,
      errorInfo: null
    });
  };
  render() {
    const { hasError: t, error: n, errorInfo: o } = this.state, { children: s, fallback: a, showDetails: c = !1 } = this.props;
    return t ? a || /* @__PURE__ */ r("div", { className: "cedros-error-boundary", role: "alert", "aria-live": "assertive", children: /* @__PURE__ */ d("div", { className: "cedros-error-boundary-content", children: [
      /* @__PURE__ */ d(
        "svg",
        {
          className: "cedros-error-boundary-icon",
          width: "48",
          height: "48",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ r("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
            /* @__PURE__ */ r("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
          ]
        }
      ),
      /* @__PURE__ */ r("h2", { className: "cedros-error-boundary-title", children: "Something went wrong" }),
      /* @__PURE__ */ r("p", { className: "cedros-error-boundary-message", children: "We encountered an unexpected error. Please try again." }),
      c && n && /* @__PURE__ */ d("details", { className: "cedros-error-boundary-details", children: [
        /* @__PURE__ */ r("summary", { children: "Error details" }),
        /* @__PURE__ */ d("pre", { children: [
          n.toString(),
          o?.componentStack
        ] })
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: this.handleRetry,
          children: "Try again"
        }
      )
    ] }) }) : s;
  }
}
function Gu({ className: e = "", title: t = "Sign in to your account" }) {
  const { isModalOpen: n, closeModal: o } = ne(), s = J(null), a = J(null), c = J(o);
  if (O(() => {
    c.current = o;
  }, [o]), O(() => {
    if (!n) return;
    a.current = document.activeElement, s.current?.focus();
    const l = (f) => {
      if (f.key === "Escape" && c.current(), f.key === "Tab" && s.current) {
        const h = s.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ), m = h[0], b = h[h.length - 1];
        f.shiftKey && document.activeElement === m ? (f.preventDefault(), b?.focus()) : !f.shiftKey && document.activeElement === b && (f.preventDefault(), m?.focus());
      }
    };
    document.addEventListener("keydown", l);
    const u = document.body.style.overflow;
    return document.body.style.overflow = "hidden", () => {
      document.removeEventListener("keydown", l), document.body.style.overflow = u, a.current instanceof HTMLElement && a.current.focus();
    };
  }, [n]), !n) return null;
  const i = (l) => {
    l.target === l.currentTarget && o();
  };
  return /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-modal-backdrop ${e}`,
      onClick: i,
      role: "presentation",
      children: /* @__PURE__ */ d(
        "div",
        {
          ref: s,
          className: "cedros-modal",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "cedros-modal-title",
          tabIndex: -1,
          children: [
            /* @__PURE__ */ d("div", { className: "cedros-modal-header", children: [
              /* @__PURE__ */ r("h2", { id: "cedros-modal-title", className: "cedros-modal-title", children: t }),
              /* @__PURE__ */ r(
                "button",
                {
                  type: "button",
                  className: "cedros-modal-close",
                  onClick: o,
                  "aria-label": "Close",
                  children: /* @__PURE__ */ r("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ r(
                    "path",
                    {
                      d: "M18 6L6 18M6 6l12 12",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      strokeLinecap: "round"
                    }
                  ) })
                }
              )
            ] }),
            /* @__PURE__ */ r("div", { className: "cedros-modal-content", children: /* @__PURE__ */ r(Oc, { children: /* @__PURE__ */ r(jr, { onSuccess: o }) }) })
          ]
        }
      )
    }
  );
}
function Ku({
  token: e,
  onSuccess: t,
  onLoginClick: n,
  className: o = ""
}) {
  const [s, a] = B(""), [c, i] = B(""), [l, u] = B(null), { resetPassword: f, isLoading: h, isSuccess: m, error: b, clearError: w } = qr(), p = s === c, E = l?.isValid && p && s.length > 0, A = async (C) => {
    if (C.preventDefault(), !!E)
      try {
        await f(e, s), t?.();
      } catch {
      }
  };
  return m ? /* @__PURE__ */ d("div", { className: `cedros-reset-password-success ${o}`, children: [
    /* @__PURE__ */ d(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ r("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ r(
            "path",
            {
              d: "M14 24l7 7 13-13",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ r("h3", { className: "cedros-success-title", children: "Password reset successful" }),
    /* @__PURE__ */ r("p", { className: "cedros-success-message", children: "Your password has been reset. You can now log in with your new password." }),
    n && /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-primary",
        onClick: n,
        children: "Go to login"
      }
    )
  ] }) : /* @__PURE__ */ d("form", { className: `cedros-reset-password-form ${o}`, onSubmit: A, children: [
    /* @__PURE__ */ d("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-form-title", children: "Reset your password" }),
      /* @__PURE__ */ r("p", { className: "cedros-form-subtitle", children: "Enter your new password below." })
    ] }),
    /* @__PURE__ */ r(re, { error: b, onDismiss: w }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      pe,
      {
        label: "New password",
        value: s,
        onChange: (C) => {
          a(C.target.value), u(Bt(C.target.value));
        },
        showStrengthMeter: !0,
        onValidationChange: u,
        disabled: h,
        autoComplete: "new-password",
        error: l && !l.isValid ? Object.values(l.errors).find(Boolean) : void 0
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      pe,
      {
        label: "Confirm password",
        value: c,
        onChange: (C) => i(C.target.value),
        disabled: h,
        autoComplete: "new-password",
        error: c && !p ? "Passwords do not match" : void 0
      }
    ) }),
    /* @__PURE__ */ d("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: h || !E,
          children: h ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Q, { size: "sm" }),
            "Resetting..."
          ] }) : "Reset password"
        }
      ),
      n && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: n,
          disabled: h,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
function Br({ org: e, size: t = "lg", className: n = "" }) {
  const o = wn(e.logoUrl), s = t === "lg" ? "cedros-org-avatar-lg" : "", a = ["cedros-org-avatar", s, n].filter(Boolean).join(" "), c = ["cedros-org-avatar-placeholder", s, n].filter(Boolean).join(" ");
  return o ? /* @__PURE__ */ r(
    "img",
    {
      src: o,
      alt: e.name,
      className: a,
      referrerPolicy: "no-referrer"
    }
  ) : /* @__PURE__ */ r("div", { className: c, children: e.name[0]?.toUpperCase() || "?" });
}
function Yu({
  orgs: e,
  activeOrg: t,
  isLoading: n = !1,
  onSelect: o,
  onCreateClick: s,
  className: a = "",
  placeholder: c = "Select organization"
}) {
  const [i, l] = B(!1), u = J(null);
  O(() => {
    const b = (w) => {
      u.current && !u.current.contains(w.target) && l(!1);
    };
    return document.addEventListener("mousedown", b), () => document.removeEventListener("mousedown", b);
  }, []), O(() => {
    const b = (w) => {
      w.key === "Escape" && l(!1);
    };
    if (i)
      return document.addEventListener("keydown", b), () => document.removeEventListener("keydown", b);
  }, [i]);
  const f = T(
    (b) => {
      o(b), l(!1);
    },
    [o]
  ), h = T(() => {
    l(!1), s?.();
  }, [s]), m = T(() => {
    l((b) => !b);
  }, []);
  return n ? /* @__PURE__ */ d(
    "div",
    {
      className: `cedros-org-selector cedros-org-selector-loading ${a}`,
      "aria-busy": "true",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ r(Q, { size: "sm" }),
        /* @__PURE__ */ r("span", { children: "Loading..." })
      ]
    }
  ) : /* @__PURE__ */ d("div", { ref: u, className: `cedros-org-selector ${a}`, children: [
    /* @__PURE__ */ d(
      "button",
      {
        type: "button",
        className: "cedros-org-selector-trigger",
        onClick: m,
        "aria-haspopup": "listbox",
        "aria-expanded": i,
        children: [
          t ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Br, { org: t, size: "sm" }),
            /* @__PURE__ */ r("span", { className: "cedros-org-selector-name", children: t.name }),
            /* @__PURE__ */ r(Es, { role: t.membership.role })
          ] }) : /* @__PURE__ */ r("span", { className: "cedros-org-selector-placeholder", children: c }),
          /* @__PURE__ */ r(Wc, { isOpen: i })
        ]
      }
    ),
    i && /* @__PURE__ */ d("div", { className: "cedros-org-selector-dropdown", role: "listbox", children: [
      e.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-org-selector-empty", children: "No organizations" }) : /* @__PURE__ */ r("ul", { className: "cedros-org-selector-list", children: e.map((b) => /* @__PURE__ */ r("li", { children: /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: `cedros-org-selector-item ${b.id === t?.id ? "cedros-org-selector-item-active" : ""}`,
          onClick: () => f(b.id),
          role: "option",
          "aria-selected": b.id === t?.id,
          children: [
            /* @__PURE__ */ r(Br, { org: b, size: "sm" }),
            /* @__PURE__ */ r("span", { className: "cedros-org-selector-item-name", children: b.name }),
            /* @__PURE__ */ r(Es, { role: b.membership.role }),
            b.id === t?.id && /* @__PURE__ */ r(qc, {})
          ]
        }
      ) }, b.id)) }),
      s && /* @__PURE__ */ d(X, { children: [
        /* @__PURE__ */ r("div", { className: "cedros-org-selector-divider" }),
        /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-org-selector-create",
            onClick: h,
            children: [
              /* @__PURE__ */ r(jc, {}),
              /* @__PURE__ */ r("span", { children: "Create organization" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function Es({ role: e }) {
  return /* @__PURE__ */ r("span", { className: `cedros-org-role cedros-org-role-${e}`, children: e });
}
function Wc({ isOpen: e }) {
  return /* @__PURE__ */ r(
    "svg",
    {
      className: `cedros-org-chevron ${e ? "cedros-org-chevron-open" : ""}`,
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ r(
        "path",
        {
          d: "M4 6L8 10L12 6",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function qc() {
  return /* @__PURE__ */ r(
    "svg",
    {
      className: "cedros-org-check",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ r(
        "path",
        {
          d: "M3 8L6 11L13 4",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function jc() {
  return /* @__PURE__ */ r(
    "svg",
    {
      className: "cedros-org-plus",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ r(
        "path",
        {
          d: "M8 3V13M3 8H13",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function zc() {
  return /* @__PURE__ */ r("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r(
    "path",
    {
      d: "M5 5L15 15M15 5L5 15",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function Vc() {
  return /* @__PURE__ */ r(
    "svg",
    {
      className: "cedros-org-check",
      width: "20",
      height: "20",
      viewBox: "0 0 20 20",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ r(
        "path",
        {
          d: "M4 10L8 14L16 5",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function Hc() {
  return /* @__PURE__ */ r("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r(
    "path",
    {
      d: "M10 4V16M4 10H16",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function $c({
  orgs: e,
  activeOrg: t,
  isLoading: n,
  onSelect: o,
  onCreateClick: s
}) {
  return n ? /* @__PURE__ */ d("div", { className: "cedros-org-switcher-loading", children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { children: "Loading organizations..." })
  ] }) : /* @__PURE__ */ d(X, { children: [
    e.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-org-switcher-empty", children: /* @__PURE__ */ r("p", { children: "You don't belong to any organizations yet." }) }) : /* @__PURE__ */ r("ul", { className: "cedros-org-switcher-list", children: e.map((a) => /* @__PURE__ */ r("li", { children: /* @__PURE__ */ d(
      "button",
      {
        type: "button",
        className: `cedros-org-switcher-item ${a.id === t?.id ? "cedros-org-switcher-item-active" : ""}`,
        onClick: () => o(a.id),
        children: [
          /* @__PURE__ */ r(Br, { org: a }),
          /* @__PURE__ */ d("div", { className: "cedros-org-switcher-item-content", children: [
            /* @__PURE__ */ r("span", { className: "cedros-org-switcher-item-name", children: a.name }),
            /* @__PURE__ */ d("span", { className: "cedros-org-switcher-item-slug", children: [
              "@",
              a.slug
            ] })
          ] }),
          /* @__PURE__ */ d("div", { className: "cedros-org-switcher-item-meta", children: [
            /* @__PURE__ */ r("span", { className: `cedros-org-role cedros-org-role-${a.membership.role}`, children: a.membership.role }),
            a.isPersonal && /* @__PURE__ */ r("span", { className: "cedros-org-personal-badge", children: "Personal" })
          ] }),
          a.id === t?.id && /* @__PURE__ */ r(Vc, {})
        ]
      }
    ) }, a.id)) }),
    s && /* @__PURE__ */ d("button", { type: "button", className: "cedros-org-switcher-create", onClick: s, children: [
      /* @__PURE__ */ r(Hc, {}),
      /* @__PURE__ */ r("span", { children: "Create new organization" })
    ] })
  ] });
}
function Qc({ isLoading: e, onSubmit: t, onCancel: n }) {
  const [o, s] = B(""), [a, c] = B(""), [i, l] = B(null), u = T((h) => {
    s(h);
    const m = h.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 50);
    c(m);
  }, []), f = T(
    async (h) => {
      if (h.preventDefault(), l(null), !o.trim()) {
        l("Organization name is required");
        return;
      }
      if (!a.trim()) {
        l("Organization slug is required");
        return;
      }
      try {
        await t({ name: o.trim(), slug: a.trim() });
      } catch (m) {
        l(m.message || "Failed to create organization");
      }
    },
    [o, a, t]
  );
  return /* @__PURE__ */ d("form", { className: "cedros-org-create-form", onSubmit: f, children: [
    i && /* @__PURE__ */ r(re, { error: i }),
    /* @__PURE__ */ d("div", { className: "cedros-form-group", children: [
      /* @__PURE__ */ r("label", { htmlFor: "org-name", className: "cedros-form-label", children: "Organization Name" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: "org-name",
          type: "text",
          className: "cedros-form-input",
          value: o,
          onChange: (h) => u(h.target.value),
          placeholder: "My Organization",
          maxLength: 255,
          disabled: e,
          autoFocus: !0
        }
      )
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-form-group", children: [
      /* @__PURE__ */ r("label", { htmlFor: "org-slug", className: "cedros-form-label", children: "URL Slug" }),
      /* @__PURE__ */ d("div", { className: "cedros-form-input-prefix", children: [
        /* @__PURE__ */ r("span", { className: "cedros-form-prefix", children: "@" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "org-slug",
            type: "text",
            className: "cedros-form-input",
            value: a,
            onChange: (h) => c(h.target.value.toLowerCase()),
            placeholder: "my-organization",
            maxLength: 100,
            pattern: "[a-z0-9-]+",
            disabled: e
          }
        )
      ] }),
      /* @__PURE__ */ r("span", { className: "cedros-form-hint", children: "Only lowercase letters, numbers, and hyphens" })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline",
          onClick: n,
          disabled: e,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: e || !o.trim() || !a.trim(),
          children: e ? /* @__PURE__ */ r(Q, { size: "sm" }) : "Create Organization"
        }
      )
    ] })
  ] });
}
function Zu({
  isOpen: e,
  onClose: t,
  orgs: n,
  activeOrg: o,
  isLoading: s = !1,
  error: a,
  onSelect: c,
  onCreate: i,
  className: l = ""
}) {
  return e ? /* @__PURE__ */ r(
    Gc,
    {
      onClose: t,
      orgs: n,
      activeOrg: o,
      isLoading: s,
      error: a,
      onSelect: c,
      onCreate: i,
      className: l
    }
  ) : null;
}
function Gc({
  onClose: e,
  orgs: t,
  activeOrg: n,
  isLoading: o = !1,
  error: s,
  onSelect: a,
  onCreate: c,
  className: i
}) {
  const [l, u] = B("list"), f = J(null), h = J(null);
  O(() => (h.current = document.activeElement, f.current?.querySelector(".cedros-modal-close")?.focus(), () => {
    h.current?.focus();
  }), []), O(() => {
    const p = (E) => {
      if (E.key === "Escape") {
        e();
        return;
      }
      if (E.key === "Tab" && f.current) {
        const A = f.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ), C = A[0], N = A[A.length - 1];
        E.shiftKey ? document.activeElement === C && (E.preventDefault(), N?.focus()) : document.activeElement === N && (E.preventDefault(), C?.focus());
      }
    };
    return document.addEventListener("keydown", p), () => document.removeEventListener("keydown", p);
  }, [e]);
  const m = T(
    (p) => {
      p.target === p.currentTarget && e();
    },
    [e]
  ), b = T(
    (p) => {
      a(p), e();
    },
    [a, e]
  ), w = T(
    async (p) => {
      await c?.(p), e();
    },
    [c, e]
  );
  return /* @__PURE__ */ r("div", { className: "cedros-modal-backdrop", onClick: m, children: /* @__PURE__ */ d(
    "div",
    {
      ref: f,
      className: `cedros-modal cedros-org-switcher ${i}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "org-switcher-title",
      children: [
        /* @__PURE__ */ d("div", { className: "cedros-modal-header", children: [
          /* @__PURE__ */ r("h2", { id: "org-switcher-title", className: "cedros-modal-title", children: l === "list" ? "Switch Organization" : "Create Organization" }),
          /* @__PURE__ */ r("button", { type: "button", className: "cedros-modal-close", onClick: e, "aria-label": "Close", children: /* @__PURE__ */ r(zc, {}) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-modal-body", children: [
          s && /* @__PURE__ */ r(re, { error: s }),
          l === "list" ? /* @__PURE__ */ r(
            $c,
            {
              orgs: t,
              activeOrg: n,
              isLoading: o,
              onSelect: b,
              onCreateClick: c ? () => u("create") : void 0
            }
          ) : /* @__PURE__ */ r(
            Qc,
            {
              isLoading: o,
              onSubmit: w,
              onCancel: () => u("list")
            }
          )
        ] })
      ]
    }
  ) });
}
function Kc({
  sessions: e,
  isLoading: t = !1,
  error: n,
  onRevokeAll: o,
  className: s = ""
}) {
  const [a, c] = B(!1), [i, l] = B(!1), u = J(null), f = z(() => e.filter((m) => !m.isCurrent).length, [e]), h = T(async () => {
    if (!o) return;
    const m = e.filter((w) => !w.isCurrent).length;
    if (!(m === 0 || !window.confirm(
      `Are you sure you want to sign out of ${m} other device(s)? This will log you out everywhere except this browser.`
    ))) {
      c(!0), l(!1);
      try {
        await o(), l(!0), u.current !== null && window.clearTimeout(u.current), u.current = window.setTimeout(() => {
          l(!1), u.current = null;
        }, 3e3);
      } finally {
        c(!1);
      }
    }
  }, [o, e]);
  return O(() => () => {
    u.current !== null && (window.clearTimeout(u.current), u.current = null);
  }, []), t && e.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-session-list cedros-session-list-loading ${s}`, children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { children: "Loading sessions..." })
  ] }) : n ? /* @__PURE__ */ r("div", { className: `cedros-session-list ${s}`, children: /* @__PURE__ */ r(re, { error: n }) }) : e.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-session-list cedros-session-list-empty ${s}`, children: /* @__PURE__ */ r("p", { children: "No active sessions found." }) }) : /* @__PURE__ */ d("div", { className: `cedros-session-list ${s}`, children: [
    i && /* @__PURE__ */ d("div", { className: "cedros-session-success", role: "status", children: [
      /* @__PURE__ */ r(tl, {}),
      /* @__PURE__ */ r("span", { children: "All other sessions have been revoked." })
    ] }),
    /* @__PURE__ */ r("ul", { className: "cedros-session-items", children: e.map((m) => /* @__PURE__ */ r(Yc, { session: m }, m.id)) }),
    o && f > 0 && /* @__PURE__ */ r("div", { className: "cedros-session-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: h,
        disabled: a,
        children: a ? /* @__PURE__ */ d(X, { children: [
          /* @__PURE__ */ r(Q, { size: "sm" }),
          /* @__PURE__ */ r("span", { children: "Signing out..." })
        ] }) : `Sign out of ${f} other device${f > 1 ? "s" : ""}`
      }
    ) })
  ] });
}
function Yc({ session: e }) {
  const t = Zc(e.userAgent), n = Jc(e.expiresAt);
  return /* @__PURE__ */ d("li", { className: `cedros-session-item ${e.isCurrent ? "cedros-session-item-current" : ""}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-session-item-icon", children: /* @__PURE__ */ r(el, { userAgent: e.userAgent }) }),
    /* @__PURE__ */ d("div", { className: "cedros-session-item-info", children: [
      /* @__PURE__ */ d("div", { className: "cedros-session-item-main", children: [
        /* @__PURE__ */ d("span", { className: "cedros-session-item-device", children: [
          t.browser,
          " on ",
          t.os
        ] }),
        e.isCurrent && /* @__PURE__ */ r("span", { className: "cedros-session-current-badge", children: "Current session" })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-session-item-meta", children: [
        e.ipAddress && /* @__PURE__ */ d("span", { className: "cedros-session-item-ip", children: [
          "IP: ",
          e.ipAddress
        ] }),
        /* @__PURE__ */ d("span", { className: "cedros-session-item-created", children: [
          "Started ",
          Xc(e.createdAt)
        ] }),
        n && /* @__PURE__ */ r("span", { className: "cedros-session-expiring", children: "Expires soon" })
      ] })
    ] })
  ] });
}
function Zc(e) {
  if (!e)
    return { browser: "Unknown browser", os: "Unknown device" };
  let t = "Unknown browser";
  e.includes("Chrome") && !e.includes("Edg") ? t = "Chrome" : e.includes("Safari") && !e.includes("Chrome") ? t = "Safari" : e.includes("Firefox") ? t = "Firefox" : e.includes("Edg") && (t = "Edge");
  let n = "Unknown device";
  return e.includes("Windows") ? n = "Windows" : e.includes("Mac") ? n = "macOS" : e.includes("Linux") ? n = "Linux" : e.includes("iPhone") || e.includes("iPad") ? n = "iOS" : e.includes("Android") && (n = "Android"), { browser: t, os: n };
}
function Xc(e) {
  const t = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - t.getTime(), s = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), c = Math.floor(o / (1e3 * 60 * 60 * 24));
  return s < 1 ? "just now" : s < 60 ? `${s} minute${s > 1 ? "s" : ""} ago` : a < 24 ? `${a} hour${a > 1 ? "s" : ""} ago` : c < 7 ? `${c} day${c > 1 ? "s" : ""} ago` : t.toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function Jc(e) {
  const t = new Date(e), n = /* @__PURE__ */ new Date(), o = 3600 * 1e3;
  return t.getTime() - n.getTime() < o;
}
function el({ userAgent: e }) {
  return e?.includes("iPhone") || e?.includes("iPad") || e?.includes("Android") ? /* @__PURE__ */ d(
    "svg",
    {
      className: "cedros-session-device-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ r("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ r("circle", { cx: "12", cy: "18", r: "1", fill: "currentColor" })
      ]
    }
  ) : /* @__PURE__ */ d(
    "svg",
    {
      className: "cedros-session-device-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ r("rect", { x: "2", y: "4", width: "20", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ r("path", { d: "M8 21H16", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
        /* @__PURE__ */ r("path", { d: "M12 18V21", stroke: "currentColor", strokeWidth: "1.5" })
      ]
    }
  );
}
function tl() {
  return /* @__PURE__ */ r(
    "svg",
    {
      className: "cedros-session-check",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ r(
        "path",
        {
          d: "M3 8L6 11L13 5",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function rl({
  words: e,
  onConfirm: t,
  className: n = ""
}) {
  const [o, s] = B(!1), [a, c] = B(!1), i = J(null), l = Cc(e), u = T(async () => {
    try {
      await navigator.clipboard.writeText(e.join(" ")), s(!0), i.current !== null && window.clearTimeout(i.current), i.current = window.setTimeout(() => s(!1), 2e3);
    } catch {
    }
  }, [e]);
  O(() => () => {
    i.current !== null && (window.clearTimeout(i.current), i.current = null);
  }, []);
  const f = T(() => {
    a && t();
  }, [a, t]);
  return /* @__PURE__ */ d("div", { className: `cedros-recovery-phrase-display ${n}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-recovery-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-recovery-title", children: "Recovery Phrase" }),
      /* @__PURE__ */ r("p", { className: "cedros-recovery-warning", children: "Write down these 12 words in order and store them securely. This is the only way to recover your wallet if you lose access." })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-recovery-grid", children: l.map((h, m) => /* @__PURE__ */ r("div", { className: "cedros-word-group", children: h.map((b, w) => {
      const p = m * 4 + w + 1;
      return /* @__PURE__ */ d("div", { className: "cedros-word-item", children: [
        /* @__PURE__ */ d("span", { className: "cedros-word-number", children: [
          p,
          "."
        ] }),
        /* @__PURE__ */ r("span", { className: "cedros-word-text", children: b })
      ] }, p);
    }) }, m)) }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-secondary cedros-copy-btn",
        onClick: u,
        children: o ? "Copied!" : "Copy to Clipboard"
      }
    ),
    /* @__PURE__ */ r("div", { className: "cedros-recovery-security", children: /* @__PURE__ */ d("div", { className: "cedros-warning-box", children: [
      /* @__PURE__ */ r(
        "svg",
        {
          className: "cedros-warning-icon",
          width: "20",
          height: "20",
          viewBox: "0 0 20 20",
          fill: "none",
          "aria-hidden": "true",
          children: /* @__PURE__ */ r(
            "path",
            {
              d: "M10 6v4m0 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round"
            }
          )
        }
      ),
      /* @__PURE__ */ d("div", { className: "cedros-warning-content", children: [
        /* @__PURE__ */ r("strong", { children: "Security Warning" }),
        /* @__PURE__ */ d("ul", { children: [
          /* @__PURE__ */ r("li", { children: "Never share this phrase with anyone" }),
          /* @__PURE__ */ r("li", { children: "Store it offline in a secure location" }),
          /* @__PURE__ */ r("li", { children: "Anyone with this phrase can access your wallet" }),
          /* @__PURE__ */ r("li", { children: "Cedros cannot recover this phrase for you" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ d("div", { className: "cedros-recovery-confirm", children: [
      /* @__PURE__ */ d("label", { className: "cedros-checkbox-label", children: [
        /* @__PURE__ */ r(
          "input",
          {
            type: "checkbox",
            checked: a,
            onChange: (h) => c(h.target.checked),
            className: "cedros-checkbox"
          }
        ),
        /* @__PURE__ */ r("span", { children: "I have written down and securely stored my recovery phrase" })
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: f,
          disabled: !a,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function sl({
  onSubmit: e,
  onCancel: t,
  isSubmitting: n = !1,
  error: o,
  className: s = ""
}) {
  const [a, c] = B(Array(me).fill("")), [i, l] = B(null), [u, f] = B([]), [h, m] = B(null), b = pn(), w = J(null), p = T(
    (g, k) => {
      const v = [...a];
      if (v[g] = k.toLowerCase().trim(), c(v), k.length > 0) {
        const y = Ec(k, 5);
        f(y);
      } else
        f([]);
      m(null);
    },
    [a]
  ), E = T((g) => {
    l(g), f([]);
  }, []), A = T(
    (g) => {
      const k = a[g];
      k && !ht(k) && m(`Word ${g + 1} is not in the wordlist`), w.current !== null && window.clearTimeout(w.current), w.current = window.setTimeout(() => {
        i === g && f([]);
      }, 200);
    },
    [a, i]
  );
  O(() => () => {
    w.current !== null && (window.clearTimeout(w.current), w.current = null);
  }, []);
  const C = T(
    (g) => {
      if (i !== null) {
        const k = [...a];
        k[i] = g, c(k), f([]), document.querySelector(
          `[data-word-index="${i + 1}"]`
        )?.focus();
      }
    },
    [i, a]
  ), N = T((g) => {
    const k = g.clipboardData.getData("text"), v = xc(k);
    v.length === me && (g.preventDefault(), c(v), m(null));
  }, []), x = T(
    (g) => {
      if (g.preventDefault(), a.filter((y) => !y).length > 0) {
        m(`Please enter all ${me} words`);
        return;
      }
      const v = a.map((y, S) => ({ word: y, index: S + 1 })).filter(({ word: y }) => !ht(y));
      if (v.length > 0) {
        m(`Invalid words: ${v.map((y) => `#${y.index}`).join(", ")}`);
        return;
      }
      if (!to(a)) {
        m("Invalid recovery phrase - please check your words");
        return;
      }
      e(a);
    },
    [a, e]
  ), R = o || h;
  return /* @__PURE__ */ d(
    "form",
    {
      className: `cedros-recovery-phrase-input ${s}`,
      onSubmit: x,
      onPaste: N,
      children: [
        /* @__PURE__ */ d("div", { className: "cedros-recovery-input-header", children: [
          /* @__PURE__ */ r("h3", { className: "cedros-recovery-input-title", children: "Enter Recovery Phrase" }),
          /* @__PURE__ */ r("p", { className: "cedros-recovery-input-description", children: "Enter your 12-word recovery phrase. You can paste the entire phrase at once." })
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-word-inputs", children: Array.from({ length: me }, (g, k) => /* @__PURE__ */ d("div", { className: "cedros-word-input-wrapper", children: [
          /* @__PURE__ */ d("label", { className: "cedros-word-label", children: [
            k + 1,
            "."
          ] }),
          /* @__PURE__ */ r(
            "input",
            {
              type: "text",
              className: `cedros-word-input ${a[k] && !ht(a[k]) ? "cedros-word-invalid" : a[k] && ht(a[k]) ? "cedros-word-valid" : ""}`,
              value: a[k],
              onChange: (v) => p(k, v.target.value),
              onFocus: () => E(k),
              onBlur: () => A(k),
              "data-word-index": k,
              autoComplete: "off",
              autoCapitalize: "none",
              spellCheck: !1,
              disabled: n,
              "aria-label": `Word ${k + 1}`
            }
          )
        ] }, k)) }),
        i !== null && u.length > 0 && /* @__PURE__ */ r("div", { className: "cedros-suggestions", role: "listbox", id: `${b}-suggestions`, children: u.map((g) => /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-suggestion",
            onClick: () => C(g),
            role: "option",
            children: g
          },
          g
        )) }),
        R && /* @__PURE__ */ r("p", { className: "cedros-input-error", role: "alert", children: R }),
        /* @__PURE__ */ d("div", { className: "cedros-recovery-input-actions", children: [
          t && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-secondary",
              onClick: t,
              disabled: n,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ r(
            "button",
            {
              type: "submit",
              className: "cedros-button cedros-button-primary",
              disabled: n,
              children: n ? "Recovering..." : "Recover Wallet"
            }
          )
        ] })
      ]
    }
  );
}
function Xu({ capabilities: e, className: t = "" }) {
  if (e.allSupported)
    return null;
  const n = jo(e), o = zo();
  return /* @__PURE__ */ d("div", { className: `cedros-capability-warning ${t}`, role: "alert", children: [
    /* @__PURE__ */ d("div", { className: "cedros-warning-header", children: [
      /* @__PURE__ */ r(
        "svg",
        {
          className: "cedros-warning-icon",
          width: "24",
          height: "24",
          viewBox: "0 0 24 24",
          fill: "none",
          "aria-hidden": "true",
          children: /* @__PURE__ */ r(
            "path",
            {
              d: "M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round"
            }
          )
        }
      ),
      /* @__PURE__ */ r("h3", { className: "cedros-warning-title", children: "Wallet Feature Unavailable" })
    ] }),
    /* @__PURE__ */ r("p", { className: "cedros-warning-message", children: n }),
    /* @__PURE__ */ d("div", { className: "cedros-capability-details", children: [
      /* @__PURE__ */ r("h4", { children: "Browser Compatibility" }),
      /* @__PURE__ */ d("p", { children: [
        "Detected: ",
        o.browser,
        " ",
        o.version,
        o.likelySupported ? " (likely supported)" : " (may not be supported)"
      ] }),
      /* @__PURE__ */ r("h4", { children: "Required Features" }),
      /* @__PURE__ */ d("ul", { className: "cedros-capability-list", children: [
        /* @__PURE__ */ d("li", { className: e.webCrypto ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "Web Crypto API: ",
          e.webCrypto ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ d("li", { className: e.aesGcm ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "AES-GCM Encryption: ",
          e.aesGcm ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ d("li", { className: e.hkdf ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "HKDF Key Derivation: ",
          e.hkdf ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ d("li", { className: e.webAuthn ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "WebAuthn/Passkeys: ",
          e.webAuthn ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ d("li", { className: e.webAuthnPrf ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "WebAuthn PRF Extension: ",
          e.webAuthnPrf ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ d("li", { className: e.argon2 ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "Argon2 Password Hashing: ",
          e.argon2 ? "Available" : "Missing"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-capability-help", children: [
      /* @__PURE__ */ r("h4", { children: "Recommended Browsers" }),
      /* @__PURE__ */ d("ul", { children: [
        /* @__PURE__ */ r("li", { children: "Chrome 116+ on Windows, macOS, or Android" }),
        /* @__PURE__ */ r("li", { children: "Safari 17+ on macOS or iOS" }),
        /* @__PURE__ */ r("li", { children: "Edge 116+ on Windows" })
      ] }),
      /* @__PURE__ */ r("p", { className: "cedros-capability-note", children: "A platform authenticator (Touch ID, Face ID, or Windows Hello) is required." })
    ] })
  ] });
}
const nl = ["share_c_only", "full_seed", "none"];
function ol(e) {
  return e && nl.includes(e) ? e : "share_c_only";
}
const al = {
  walletEnabled: !1,
  recoveryMode: "share_c_only",
  unlockTtlSeconds: 900,
  isLoading: !1,
  error: null,
  refetch: async () => {
  }
};
function oo() {
  const e = We(), [t, n] = B(null), [o, s] = B(!!e), [a, c] = B(null), i = z(() => e ? new ce({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts
  }) : null, [e]), l = T(async () => {
    if (i) {
      s(!0), c(null);
      try {
        const u = await i.get("/discovery");
        u.wallet ? n({
          enabled: u.wallet.enabled,
          recoveryMode: ol(u.wallet.recoveryMode),
          unlockTtlSeconds: u.wallet.unlockTtlSeconds
        }) : n({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } catch (u) {
        const f = u instanceof Error ? u.message : "Failed to fetch wallet config";
        c(f), n({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } finally {
        s(!1);
      }
    }
  }, [i]);
  return O(() => {
    i && l();
  }, [i, l]), e ? {
    walletEnabled: t?.enabled ?? !1,
    recoveryMode: t?.recoveryMode ?? "share_c_only",
    unlockTtlSeconds: t?.unlockTtlSeconds ?? 900,
    isLoading: o,
    error: a,
    refetch: l
  } : al;
}
function il() {
  const { user: e } = ne(), { enroll: t } = Ye(), { recoveryMode: n } = oo(), [o, s] = B({ step: "idle" }), [a, c] = B(!1), i = J([]), l = T(() => {
    cn(...i.current), i.current = [];
  }, []);
  O(() => () => {
    l();
  }, [l]);
  const u = T(
    async (w, p, E, A) => {
      s({ step: "generating_seed" });
      const C = Vo();
      i.current.push(C), s({ step: "splitting_shares" });
      const { shareA: N, shareB: x, shareC: R } = Qn(C);
      i.current.push(N, x, R), s({ step: "encrypting_shares" });
      const g = await ln(N, dn(p)), k = Hn(C), v = $n(k);
      s({ step: "uploading" });
      const y = {
        solanaPubkey: v,
        shareAAuthMethod: w,
        shareACiphertext: g.ciphertext,
        shareANonce: g.nonce,
        // Share B is now plaintext (SSS math protects it)
        shareB: Se(x)
      };
      if (w === "password") {
        if (!E) throw new Error("KDF salt required for password method");
        y.shareAKdfSalt = Se(E), y.shareAKdfParams = ot;
      }
      if (w === "passkey" && A && (y.prfSalt = A), await t(y), n === "none")
        l(), s({
          step: "complete",
          solanaPubkey: v
        });
      else {
        const S = n === "full_seed" ? kc(C) : Ac(Oe(R));
        s({
          step: "showing_recovery",
          recoveryPhrase: S,
          solanaPubkey: v
        });
      }
    },
    [t, n, l]
  ), f = T(
    async (w) => {
      if (!e) {
        s({ step: "error", error: "User not authenticated" });
        return;
      }
      c(!0), l();
      try {
        const p = un(), E = await Nn(w, p, ot);
        i.current.push(E), await u("password", E, p);
      } catch (p) {
        s({
          step: "error",
          error: p instanceof Error ? p.message : "Enrollment failed"
        });
      } finally {
        c(!1);
      }
    },
    [e, l, u]
  ), h = T(async () => {
    if (!e) {
      s({ step: "error", error: "User not authenticated" });
      return;
    }
    c(!0), l();
    try {
      const w = hn(), p = Se(w);
      s({ step: "encrypting_shares" });
      const A = (await Tr(p)).prfOutput;
      i.current.push(A);
      const C = await fn(A, w);
      i.current.push(C), await u("passkey", C, void 0, p);
    } catch (w) {
      s({
        step: "error",
        error: w instanceof Error ? w.message : "Enrollment failed"
      });
    } finally {
      c(!1);
    }
  }, [e, l, u]), m = T(() => {
    const w = o.solanaPubkey;
    l(), s({
      step: "complete",
      solanaPubkey: w
    });
  }, [o.solanaPubkey, l]), b = T(() => {
    l(), s({ step: "idle" }), c(!1);
  }, [l]);
  return {
    state: o,
    startEnrollmentWithPassword: f,
    startEnrollmentWithPasskey: h,
    confirmRecoveryPhrase: m,
    cancel: b,
    isEnrolling: a
  };
}
function cl() {
  const { config: e, _internal: t } = ne(), [n, o] = B(!1), [s, a] = B(null), c = z(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t?.getAccessToken]
  );
  return {
    setPassword: T(
      async (l) => {
        o(!0), a(null);
        try {
          await c.post("/set-password", { password: l });
        } catch (u) {
          const f = q(u, "Failed to set password");
          throw a(f), f;
        } finally {
          o(!1);
        }
      },
      [c]
    ),
    isLoading: n,
    error: s
  };
}
function ll(e) {
  return e.includes("email") ? "password" : e.includes("webauthn") ? "passkey" : "set-password";
}
function dl({
  onComplete: e,
  onCancel: t,
  className: n = ""
}) {
  const { user: o } = ne(), {
    state: s,
    startEnrollmentWithPassword: a,
    startEnrollmentWithPasskey: c,
    confirmRecoveryPhrase: i,
    cancel: l,
    isEnrolling: u
  } = il(), { setPassword: f, isLoading: h } = cl(), m = o ? ll(o.authMethods) : "password", [b, w] = B(""), [p, E] = B(""), [A, C] = B(null);
  O(() => {
    w(""), E(""), C(null);
  }, [o?.id]);
  const N = T(
    async (y) => {
      y.preventDefault(), C(null), await a(b);
    },
    [b, a]
  ), x = T(
    async (y) => {
      if (y.preventDefault(), b !== p) {
        C("Passwords do not match");
        return;
      }
      const S = Bt(b);
      if (!S.isValid) {
        const L = Object.values(S.errors)[0];
        C(L ?? "Password does not meet requirements");
        return;
      }
      C(null);
      try {
        await f(b), await a(b);
      } catch {
      }
    },
    [b, p, f, a]
  ), R = T(async () => {
    await c();
  }, [c]), g = T(() => {
    i(), s.solanaPubkey && e?.(s.solanaPubkey);
  }, [i, s.solanaPubkey, e]), k = T(() => {
    l(), t?.();
  }, [l, t]), v = u || h;
  return s.step === "generating_seed" || s.step === "splitting_shares" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, "aria-busy": "true", children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ r("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ r("p", { children: "Generating secure wallet..." })
  ] }) }) : s.step === "encrypting_shares" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, "aria-busy": "true", children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ r("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ r("p", { children: "Encrypting wallet shares..." })
  ] }) }) : s.step === "uploading" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, "aria-busy": "true", children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ r("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ r("p", { children: "Saving wallet..." })
  ] }) }) : s.step === "showing_recovery" && s.recoveryPhrase ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, children: /* @__PURE__ */ r(rl, { words: s.recoveryPhrase, onConfirm: g }) }) : s.step === "complete" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-complete", children: [
    /* @__PURE__ */ d(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ r("circle", { cx: "24", cy: "24", r: "20", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ r(
            "path",
            {
              d: "M16 24l6 6 12-12",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ r("h3", { children: "Wallet Created!" }),
    /* @__PURE__ */ d("p", { className: "cedros-pubkey", children: [
      /* @__PURE__ */ r("strong", { children: "Address:" }),
      " ",
      s.solanaPubkey
    ] }),
    /* @__PURE__ */ r("p", { children: "Your non-custodial Solana wallet is ready to use." })
  ] }) }) : s.step === "error" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-error", children: [
    /* @__PURE__ */ d(
      "svg",
      {
        className: "cedros-error-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ r("circle", { cx: "24", cy: "24", r: "20", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ r(
            "path",
            {
              d: "M24 16v12m0 6h.01",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ r("h3", { children: "Enrollment Failed" }),
    /* @__PURE__ */ r("p", { className: "cedros-error-message", children: s.error }),
    /* @__PURE__ */ d("div", { className: "cedros-error-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: k,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: () => l(),
          children: "Try Again"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ d("div", { className: `cedros-wallet-enrollment ${n}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-enrollment-header", children: [
      /* @__PURE__ */ r("h2", { children: "Create Wallet" }),
      m === "password" && /* @__PURE__ */ r("p", { children: "Enter your account password to secure your wallet." }),
      m === "passkey" && /* @__PURE__ */ r("p", { children: "Authenticate with your passkey to secure your wallet." }),
      m === "set-password" && /* @__PURE__ */ r("p", { children: "Set a password for your account to secure your wallet." })
    ] }),
    m === "password" && /* @__PURE__ */ d("form", { onSubmit: N, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ r(
        pe,
        {
          label: "Account Password",
          value: b,
          onChange: (y) => w(y.target.value),
          disabled: v,
          required: !0,
          placeholder: "Enter your account password"
        }
      ),
      /* @__PURE__ */ d("div", { className: "cedros-enrollment-actions", children: [
        t && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: k,
            disabled: v,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: v || !b,
            children: v ? "Creating..." : "Continue"
          }
        )
      ] })
    ] }),
    m === "passkey" && /* @__PURE__ */ d("div", { className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ d("div", { className: "cedros-passkey-info", children: [
        /* @__PURE__ */ d(
          "svg",
          {
            className: "cedros-passkey-icon",
            width: "48",
            height: "48",
            viewBox: "0 0 48 48",
            fill: "none",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ r(
                "rect",
                {
                  x: "8",
                  y: "16",
                  width: "32",
                  height: "24",
                  rx: "4",
                  stroke: "currentColor",
                  strokeWidth: "2"
                }
              ),
              /* @__PURE__ */ r("circle", { cx: "24", cy: "28", r: "4", stroke: "currentColor", strokeWidth: "2" }),
              /* @__PURE__ */ r("path", { d: "M24 32v4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
            ]
          }
        ),
        /* @__PURE__ */ r("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-enrollment-actions", children: [
        t && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: k,
            disabled: v,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: R,
            disabled: v,
            children: v ? "Creating..." : "Use Passkey"
          }
        )
      ] })
    ] }),
    m === "set-password" && /* @__PURE__ */ d("form", { onSubmit: x, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ r(
        pe,
        {
          label: "New Password",
          value: b,
          onChange: (y) => w(y.target.value),
          showStrengthMeter: !0,
          disabled: v,
          required: !0,
          minLength: 8,
          placeholder: "Choose a strong password"
        }
      ),
      /* @__PURE__ */ r(
        pe,
        {
          label: "Confirm Password",
          value: p,
          onChange: (y) => E(y.target.value),
          error: A ?? void 0,
          disabled: v,
          required: !0,
          minLength: 8,
          placeholder: "Confirm your password"
        }
      ),
      /* @__PURE__ */ r("div", { className: "cedros-password-info", children: /* @__PURE__ */ r("p", { children: "This password will also be used to sign transactions." }) }),
      /* @__PURE__ */ d("div", { className: "cedros-enrollment-actions", children: [
        t && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: k,
            disabled: v,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: v || !b || !p,
            children: v ? "Creating..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function ul() {
  const { user: e } = ne(), { signTransaction: t } = Ye(), [n, o] = B(!1), [s, a] = B(null), c = T(
    async (l, u) => {
      if (!e) {
        const f = "User not authenticated";
        throw a(f), new Error(f);
      }
      o(!0), a(null);
      try {
        const f = {
          transaction: Se(l),
          ...u ? { credential: Ho(u) } : {}
        }, h = await t(f);
        return mn(h.signature);
      } catch (f) {
        const h = f instanceof Error ? f.message : "Signing failed";
        throw a(h), f;
      } finally {
        o(!1);
      }
    },
    [e, t]
  ), i = T(() => a(null), []);
  return {
    signTransaction: c,
    isSigning: n,
    error: s,
    clearError: i
  };
}
function hl() {
  const { getMaterial: e } = Ye(), [t, n] = B(!1), [o, s] = B(null), a = T(async () => {
    n(!0), s(null);
    try {
      const i = await e();
      if (!i)
        throw new Error("No wallet enrolled");
      if (i.shareAAuthMethod !== "passkey")
        throw new Error("Wallet is not configured for passkey authentication");
      if (!i.prfSalt)
        throw new Error("No PRF salt configured for wallet");
      const l = await Tr(i.prfSalt);
      try {
        return {
          type: "prfOutput",
          prfOutput: Se(l.prfOutput)
        };
      } finally {
        l.prfOutput.fill(0);
      }
    } catch (i) {
      const l = i instanceof Error ? i.message : "Passkey authentication failed";
      return s(l), null;
    } finally {
      n(!1);
    }
  }, [e]), c = T(() => s(null), []);
  return {
    getPasskeyCredential: a,
    isAuthenticating: t,
    error: o,
    clearError: c
  };
}
function fl({
  mode: e,
  isLoading: t = !1,
  error: n,
  onPrompt: o,
  onRetry: s,
  onCancel: a,
  title: c,
  description: i,
  className: l = ""
}) {
  const u = T(() => {
    t || o?.();
  }, [t, o]), f = T(() => {
    s?.();
  }, [s]), h = e === "register" ? "Set Up Passkey" : "Verify with Passkey", m = e === "register" ? "Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN." : "Use your passkey to unlock your wallet. You will be prompted for biometric verification.";
  return /* @__PURE__ */ d("div", { className: `cedros-passkey-prompt ${l}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-passkey-icon", children: t ? /* @__PURE__ */ r(pl, {}) : n ? /* @__PURE__ */ r(gl, {}) : /* @__PURE__ */ r(ml, {}) }),
    /* @__PURE__ */ r("h3", { className: "cedros-passkey-title", children: c ?? h }),
    /* @__PURE__ */ r("p", { className: "cedros-passkey-description", children: i ?? m }),
    n && /* @__PURE__ */ r("div", { className: "cedros-passkey-error", role: "alert", children: /* @__PURE__ */ r("p", { children: n }) }),
    /* @__PURE__ */ r("div", { className: "cedros-passkey-actions", children: n ? /* @__PURE__ */ d(X, { children: [
      s && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: f,
          children: "Try Again"
        }
      ),
      a && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: a,
          children: "Cancel"
        }
      )
    ] }) : /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: u,
          disabled: t,
          children: t ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r("span", { className: "cedros-button-spinner", "aria-hidden": "true" }),
            "Waiting for passkey..."
          ] }) : e === "register" ? "Create Passkey" : "Use Passkey"
        }
      ),
      a && !t && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: a,
          children: "Cancel"
        }
      )
    ] }) }),
    t && /* @__PURE__ */ d("p", { className: "cedros-passkey-hint", children: [
      "Follow the prompts on your device to ",
      e === "register" ? "create" : "verify",
      " your passkey."
    ] })
  ] });
}
function ml() {
  return /* @__PURE__ */ d(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ r("path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" }),
        /* @__PURE__ */ r("path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88" }),
        /* @__PURE__ */ r("path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02" }),
        /* @__PURE__ */ r("path", { d: "M2 12a10 10 0 0 1 18-6" }),
        /* @__PURE__ */ r("path", { d: "M2 16h.01" }),
        /* @__PURE__ */ r("path", { d: "M21.8 16c.2-2 .131-5.354 0-6" }),
        /* @__PURE__ */ r("path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" }),
        /* @__PURE__ */ r("path", { d: "M8.65 22c.21-.66.45-1.32.57-2" }),
        /* @__PURE__ */ r("path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2" })
      ]
    }
  );
}
function pl() {
  return /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
    /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
    /* @__PURE__ */ r("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function gl() {
  return /* @__PURE__ */ d(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ r("path", { d: "M12 8v4M12 16h.01" })
      ]
    }
  );
}
function wl({
  onUnlock: e,
  onCancel: t,
  showCancel: n = !0,
  authMethod: o,
  className: s = ""
}) {
  ne();
  const { unlock: a, getMaterial: c, isLoading: i } = Ye(), { getPasskeyCredential: l, isAuthenticating: u } = hl(), [f, h] = B("idle"), [m, b] = B(o ?? null), [w, p] = B(""), [E, A] = B(null);
  O(() => {
    o !== void 0 && b(o);
  }, [o]);
  const C = m === "password", N = m === "passkey", x = T(async () => {
    if (h("credential"), A(null), !m)
      try {
        const L = await c();
        L ? b(L.shareAAuthMethod) : (A("No wallet enrolled"), h("error"));
      } catch (L) {
        A(L instanceof Error ? L.message : "Failed to get wallet info"), h("error");
      }
  }, [m, c]), R = T(
    async (L) => {
      L.preventDefault(), A(null), h("unlocking");
      try {
        let M;
        if (C)
          M = { type: "password", password: w };
        else
          throw new Error("Invalid auth method");
        await a(M), h("unlocked"), e?.();
      } catch (M) {
        A(M instanceof Error ? M.message : "Failed to unlock wallet"), h("error");
      }
    },
    [C, w, a, e]
  ), g = T(async () => {
    A(null), h("unlocking");
    try {
      const L = await l();
      if (!L) {
        h("credential");
        return;
      }
      await a(L), h("unlocked"), e?.();
    } catch (L) {
      A(L instanceof Error ? L.message : "Failed to unlock wallet"), h("error");
    }
  }, [l, a, e]), k = T(() => {
    p(""), h("idle"), A(null), t?.();
  }, [t]), v = T(() => {
    p(""), h("credential"), A(null);
  }, []), y = i || u, S = () => {
    switch (f) {
      case "idle":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-idle", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(bl, {}) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Locked" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Unlock your wallet to sign transactions." }),
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-primary",
              onClick: x,
              children: "Unlock Wallet"
            }
          )
        ] });
      case "credential":
        return C ? /* @__PURE__ */ d("form", { className: "cedros-wallet-unlock-form", onSubmit: R, children: [
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Enter Password" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Enter your wallet password to unlock." }),
          /* @__PURE__ */ r(
            pe,
            {
              label: "Password",
              value: w,
              onChange: (L) => p(L.target.value),
              disabled: y,
              autoComplete: "current-password",
              error: E ?? void 0
            }
          ),
          /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ r(
              "button",
              {
                type: "submit",
                className: "cedros-button cedros-button-primary",
                disabled: y || w.length === 0,
                children: y ? "Unlocking..." : "Unlock"
              }
            ),
            n && /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: k,
                disabled: y,
                children: "Cancel"
              }
            )
          ] })
        ] }) : N ? /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-passkey", children: [
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Verify with Passkey" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Use your passkey to unlock your wallet." }),
          /* @__PURE__ */ r(
            fl,
            {
              mode: "authenticate",
              isLoading: y,
              error: E ?? void 0,
              onPrompt: g,
              onRetry: g,
              onCancel: n ? k : void 0
            }
          )
        ] }) : /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-loading", children: [
          /* @__PURE__ */ r(Q, { size: "xl" }),
          /* @__PURE__ */ r("p", { children: "Loading wallet info..." })
        ] });
      case "unlocking":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-progress", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(Q, { size: "xl" }) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Unlocking Wallet" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Verifying your credentials..." })
        ] });
      case "unlocked":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-success", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(yl, {}) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Unlocked" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Your wallet is ready to sign transactions." })
        ] });
      case "error":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-error", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(Al, {}) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Unlock Failed" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: E ?? "Failed to unlock wallet. Please try again." }),
          /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary",
                onClick: v,
                children: "Try Again"
              }
            ),
            n && /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: k,
                children: "Cancel"
              }
            )
          ] })
        ] });
    }
  };
  return /* @__PURE__ */ r("div", { className: `cedros-wallet-unlock ${s}`, children: S() });
}
function bl() {
  return /* @__PURE__ */ d("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ r(
      "rect",
      {
        x: "10",
        y: "22",
        width: "28",
        height: "20",
        rx: "4",
        stroke: "currentColor",
        strokeWidth: "2",
        fill: "var(--cedros-muted, #f3f4f6)"
      }
    ),
    /* @__PURE__ */ r("path", { d: "M16 22V16a8 8 0 1 1 16 0v6", stroke: "currentColor", strokeWidth: "2", fill: "none" }),
    /* @__PURE__ */ r("circle", { cx: "24", cy: "32", r: "3", fill: "currentColor" })
  ] });
}
function yl() {
  return /* @__PURE__ */ d("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ r(
      "circle",
      {
        cx: "24",
        cy: "24",
        r: "20",
        stroke: "var(--cedros-success, #22c55e)",
        strokeWidth: "2",
        fill: "var(--cedros-success-light, #dcfce7)"
      }
    ),
    /* @__PURE__ */ r(
      "path",
      {
        d: "M16 24l6 6 10-10",
        stroke: "var(--cedros-success, #22c55e)",
        strokeWidth: "3",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        fill: "none"
      }
    )
  ] });
}
function Al() {
  return /* @__PURE__ */ d("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ r(
      "circle",
      {
        cx: "24",
        cy: "24",
        r: "20",
        stroke: "var(--cedros-destructive, #ef4444)",
        strokeWidth: "2",
        fill: "var(--cedros-destructive-light, #fee2e2)"
      }
    ),
    /* @__PURE__ */ r(
      "path",
      {
        d: "M24 16v10M24 30v2",
        stroke: "var(--cedros-destructive, #ef4444)",
        strokeWidth: "3",
        strokeLinecap: "round"
      }
    )
  ] });
}
function vl() {
  const { recover: e, getShareBForRecovery: t } = Ye(), { recoveryMode: n } = oo(), [o, s] = B({ step: "idle" }), [a, c] = B(!1), i = J([]), l = T(() => {
    cn(...i.current), i.current = [];
  }, []);
  O(() => () => {
    l();
  }, [l]);
  const u = T(
    async (h, m, b) => {
      c(!0), l();
      try {
        if (s({ step: "validating" }), !to(h))
          throw new Error("Invalid recovery phrase. Please check your words.");
        let w;
        if (n === "share_c_only") {
          const v = vc(h);
          i.current.push(v);
          const y = Se(v), S = await t({ shareC: y }), L = mn(S.shareB);
          i.current.push(L), w = ic(Oe(L), Oe(v)), i.current.push(w);
        } else
          w = Nc(h), i.current.push(w);
        const p = Hn(w), E = $n(p), { shareA: A, shareB: C } = Qn(w);
        i.current.push(A, C), s({ step: "encrypting" });
        let N, x, R;
        if (m === "passkey") {
          const v = hn();
          R = Se(v);
          const y = await Tr(R);
          i.current.push(y.prfOutput), N = await fn(y.prfOutput, v), i.current.push(N);
        } else
          x = un(), N = await Nn(b, x, ot), i.current.push(N);
        const g = await ln(A, dn(N));
        s({ step: "uploading" });
        const k = {
          solanaPubkey: E,
          shareAAuthMethod: m,
          shareACiphertext: g.ciphertext,
          shareANonce: g.nonce,
          shareB: Se(C)
        };
        m === "password" && (k.shareAKdfSalt = Se(x), k.shareAKdfParams = ot), m === "passkey" && (k.prfSalt = R), await e(k), l(), s({ step: "complete" });
      } catch (w) {
        l(), s({
          step: "error",
          error: w instanceof Error ? w.message : "Recovery failed"
        });
      } finally {
        c(!1);
      }
    },
    [e, t, n, l]
  ), f = T(() => {
    l(), s({ step: "idle" }), c(!1);
  }, [l]);
  return {
    state: o,
    startRecovery: u,
    cancel: f,
    isRecovering: a
  };
}
function kl({
  onComplete: e,
  onCancel: t,
  className: n = "",
  defaultAuthMethod: o = "password"
}) {
  const { state: s, startRecovery: a, cancel: c, isRecovering: i } = vl(), [l, u] = B([]), [f, h] = B(!1), [m, b] = B(o), [w, p] = B(""), [E, A] = B(""), [C, N] = B(null), x = T((y) => {
    u(y), h(!0);
  }, []), R = T(
    async (y) => {
      if (y.preventDefault(), N(null), m !== "passkey") {
        if (w !== E) {
          N("Passwords do not match");
          return;
        }
        if (m === "password" && w.length < 8) {
          N("Password must be at least 8 characters");
          return;
        }
      }
      await a(l, m, w);
    },
    [l, m, w, E, a]
  ), g = T(() => {
    c(), u([]), h(!1), p(""), A(""), t?.();
  }, [c, t]), k = T(() => {
    h(!1), p(""), A("");
  }, []), v = T(() => {
    e?.();
  }, [e]);
  return s.step === "validating" || s.step === "encrypting" || s.step === "uploading" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-progress", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(Nl, {}) }),
    /* @__PURE__ */ d("h3", { className: "cedros-wallet-recovery-title", children: [
      s.step === "validating" && "Validating Recovery Phrase",
      s.step === "encrypting" && "Encrypting Wallet",
      s.step === "uploading" && "Saving to Server"
    ] }),
    /* @__PURE__ */ d("p", { className: "cedros-wallet-recovery-description", children: [
      s.step === "validating" && "Checking your recovery phrase...",
      s.step === "encrypting" && "Securing your wallet with new encryption...",
      s.step === "uploading" && "Uploading encrypted wallet data..."
    ] })
  ] }) }) : s.step === "complete" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-success", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(El, {}) }),
    /* @__PURE__ */ r("h3", { className: "cedros-wallet-recovery-title", children: "Wallet Recovered" }),
    /* @__PURE__ */ d("p", { className: "cedros-wallet-recovery-description", children: [
      "Your wallet has been successfully recovered and secured with your new",
      " ",
      m === "passkey" ? "passkey" : "password",
      "."
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: v,
        children: "Done"
      }
    ) })
  ] }) }) : s.step === "error" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-error", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(Cl, {}) }),
    /* @__PURE__ */ r("h3", { className: "cedros-wallet-recovery-title", children: "Recovery Failed" }),
    /* @__PURE__ */ r("p", { className: "cedros-wallet-recovery-description", children: s.error ?? "An error occurred during recovery. Please try again." }),
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: g,
        children: "Start Over"
      }
    ) })
  ] }) }) : f ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("form", { className: "cedros-wallet-recovery-credential", onSubmit: R, children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-wallet-recovery-title", children: "Set New Security" }),
      /* @__PURE__ */ r("p", { className: "cedros-wallet-recovery-description", children: "Choose how to secure your recovered wallet." })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-auth-method-selector", children: [
      /* @__PURE__ */ d("label", { className: "cedros-radio-label", children: [
        /* @__PURE__ */ r(
          "input",
          {
            type: "radio",
            name: "authMethod",
            value: "password",
            checked: m === "password",
            onChange: () => b("password"),
            disabled: i
          }
        ),
        /* @__PURE__ */ r("span", { children: "Password" })
      ] }),
      /* @__PURE__ */ d("label", { className: "cedros-radio-label", children: [
        /* @__PURE__ */ r(
          "input",
          {
            type: "radio",
            name: "authMethod",
            value: "passkey",
            checked: m === "passkey",
            onChange: () => b("passkey"),
            disabled: i
          }
        ),
        /* @__PURE__ */ r("span", { children: "Passkey" })
      ] })
    ] }),
    m === "password" && /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ d("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ r("label", { htmlFor: "recovery-password", className: "cedros-label", children: "New Password" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "recovery-password",
            type: "password",
            className: "cedros-input",
            value: w,
            onChange: (y) => p(y.target.value),
            disabled: i,
            minLength: 8,
            placeholder: "Enter a strong password"
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ r("label", { htmlFor: "recovery-password-confirm", className: "cedros-label", children: "Confirm Password" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "recovery-password-confirm",
            type: "password",
            className: "cedros-input",
            value: E,
            onChange: (y) => A(y.target.value),
            disabled: i,
            "aria-invalid": C ? "true" : void 0,
            placeholder: "Confirm your password"
          }
        ),
        C && /* @__PURE__ */ r("p", { className: "cedros-input-error", role: "alert", children: C })
      ] })
    ] }),
    m === "passkey" && /* @__PURE__ */ d("div", { className: "cedros-passkey-info", children: [
      /* @__PURE__ */ r(xl, {}),
      /* @__PURE__ */ r("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: k,
          disabled: i,
          children: "Back"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: i || m !== "passkey" && (w.length === 0 || E.length === 0),
          children: i ? "Recovering..." : "Recover Wallet"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-phrase", children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-wallet-recovery-title", children: "Recover Your Wallet" }),
      /* @__PURE__ */ r("p", { className: "cedros-wallet-recovery-description", children: "Enter your 12-word recovery phrase to restore your wallet." })
    ] }),
    /* @__PURE__ */ r(
      sl,
      {
        onSubmit: x,
        onCancel: g,
        isSubmitting: !1
      }
    )
  ] }) });
}
function Nl() {
  return /* @__PURE__ */ d(
    "svg",
    {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48",
      fill: "none",
      "aria-hidden": "true",
      className: "cedros-spinner",
      children: [
        /* @__PURE__ */ r(
          "circle",
          {
            cx: "24",
            cy: "24",
            r: "20",
            stroke: "var(--cedros-muted, #e5e7eb)",
            strokeWidth: "3",
            fill: "none"
          }
        ),
        /* @__PURE__ */ r(
          "path",
          {
            d: "M24 4a20 20 0 0 1 20 20",
            stroke: "var(--cedros-primary, #6366f1)",
            strokeWidth: "3",
            strokeLinecap: "round",
            fill: "none"
          }
        )
      ]
    }
  );
}
function El() {
  return /* @__PURE__ */ d("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ r(
      "circle",
      {
        cx: "24",
        cy: "24",
        r: "20",
        stroke: "var(--cedros-success, #22c55e)",
        strokeWidth: "2",
        fill: "var(--cedros-success-light, #dcfce7)"
      }
    ),
    /* @__PURE__ */ r(
      "path",
      {
        d: "M16 24l6 6 10-10",
        stroke: "var(--cedros-success, #22c55e)",
        strokeWidth: "3",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        fill: "none"
      }
    )
  ] });
}
function Cl() {
  return /* @__PURE__ */ d("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ r(
      "circle",
      {
        cx: "24",
        cy: "24",
        r: "20",
        stroke: "var(--cedros-destructive, #ef4444)",
        strokeWidth: "2",
        fill: "var(--cedros-destructive-light, #fee2e2)"
      }
    ),
    /* @__PURE__ */ r(
      "path",
      {
        d: "M24 16v10M24 30v2",
        stroke: "var(--cedros-destructive, #ef4444)",
        strokeWidth: "3",
        strokeLinecap: "round"
      }
    )
  ] });
}
function xl() {
  return /* @__PURE__ */ d(
    "svg",
    {
      className: "cedros-passkey-icon",
      width: "48",
      height: "48",
      viewBox: "0 0 48 48",
      fill: "none",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ r("rect", { x: "8", y: "16", width: "32", height: "24", rx: "4", stroke: "currentColor", strokeWidth: "2" }),
        /* @__PURE__ */ r("circle", { cx: "24", cy: "28", r: "4", stroke: "currentColor", strokeWidth: "2" }),
        /* @__PURE__ */ r("path", { d: "M24 32v4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
      ]
    }
  );
}
function Sl({
  address: e,
  label: t = "Wallet Address",
  showCopy: n = !0,
  showExplorerLink: o = !0,
  allowReveal: s = !0,
  className: a = ""
}) {
  const c = We(), [i, l] = B(!1), [u, f] = B(null), [h, m] = B(!1), b = J(null), w = c?.config.solana?.network ?? "mainnet-beta", p = z(() => {
    const N = `https://explorer.solana.com/address/${e}`;
    return w === "mainnet-beta" ? N : `${N}?cluster=${encodeURIComponent(w)}`;
  }, [e, w]), E = s && e.length > 18, A = z(() => !E || h ? e : `${e.slice(0, 8)}...${e.slice(-8)}`, [e, E, h]), C = T(async () => {
    try {
      f(null), await navigator.clipboard.writeText(e), l(!0), b.current !== null && window.clearTimeout(b.current), b.current = window.setTimeout(() => {
        l(!1), b.current = null;
      }, 2e3);
    } catch (N) {
      l(!1), f(N instanceof Error ? N.message : "Copy failed");
    }
  }, [e]);
  return O(() => () => {
    b.current !== null && (window.clearTimeout(b.current), b.current = null);
  }, []), /* @__PURE__ */ d("div", { className: `cedros-wallet-address-row ${a}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-address-row-header", children: [
      /* @__PURE__ */ r("span", { className: "cedros-wallet-status-pubkey-label", children: t }),
      /* @__PURE__ */ d("div", { className: "cedros-wallet-address-row-actions", children: [
        E && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-ghost",
            onClick: () => m((N) => !N),
            "aria-label": h ? "Hide full wallet address" : "Show full wallet address",
            children: h ? /* @__PURE__ */ d("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
              /* @__PURE__ */ r(
                "path",
                {
                  d: "M3 3l18 18",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ r(
                "path",
                {
                  d: "M10.7 10.7a3 3 0 0 0 4.24 4.24",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ r(
                "path",
                {
                  d: "M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7-0.55 1.23-1.32 2.33-2.27 3.25",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ r(
                "path",
                {
                  d: "M6.61 6.61C4.4 7.9 2.74 9.8 1 12c1.73 3.89 6 7 11 7 1.14 0 2.25-0.16 3.3-0.46",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            ] }) : /* @__PURE__ */ d("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
              /* @__PURE__ */ r(
                "path",
                {
                  d: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ r(
                "path",
                {
                  d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            ] })
          }
        ),
        o && /* @__PURE__ */ r(
          "a",
          {
            className: "cedros-button cedros-button-sm cedros-button-ghost",
            href: p,
            target: "_blank",
            rel: "noreferrer",
            children: "Explorer"
          }
        ),
        n && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-outline",
            onClick: C,
            "aria-label": "Copy wallet address",
            children: i ? "Copied" : "Copy"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ r("code", { className: "cedros-wallet-status-pubkey-value", title: e, children: A }),
    u && /* @__PURE__ */ r("p", { className: "cedros-input-hint", role: "status", children: u })
  ] });
}
function Ll({
  status: e,
  publicKey: t,
  onLock: n,
  onEnroll: o,
  onUnlock: s,
  onRecover: a,
  showActions: c = !0,
  compact: i = !1,
  className: l = ""
}) {
  const u = e !== void 0, f = Lt(), h = u ? e : f.status, m = u ? t ?? null : f.solanaPubkey, b = u ? null : f.error, w = u ? () => {
  } : f.refresh, p = u ? () => {
  } : f.clearError, E = Bl(h, b);
  return i ? /* @__PURE__ */ d("div", { className: `cedros-wallet-status cedros-wallet-status-compact ${l}`, children: [
    /* @__PURE__ */ r(
      "span",
      {
        className: `cedros-wallet-status-dot cedros-wallet-status-${E.color}`,
        title: E.label
      }
    ),
    /* @__PURE__ */ r("span", { className: "cedros-wallet-status-label", children: E.label }),
    m && /* @__PURE__ */ r("span", { className: "cedros-wallet-status-pubkey", title: m, children: Pl(m) })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-wallet-status ${l}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-status-header", children: [
      /* @__PURE__ */ r(
        "div",
        {
          className: `cedros-wallet-status-icon cedros-wallet-status-icon-${E.color}`,
          children: /* @__PURE__ */ r(Rl, { status: h })
        }
      ),
      /* @__PURE__ */ d("div", { className: "cedros-wallet-status-info", children: [
        /* @__PURE__ */ r("h4", { className: "cedros-wallet-status-title", children: E.title }),
        /* @__PURE__ */ r("p", { className: "cedros-wallet-status-description", children: E.description })
      ] })
    ] }),
    m && /* @__PURE__ */ r("div", { className: "cedros-wallet-status-pubkey-full", children: /* @__PURE__ */ r(Sl, { address: m }) }),
    b && /* @__PURE__ */ d("div", { className: "cedros-wallet-status-error-box", role: "alert", children: [
      /* @__PURE__ */ r("p", { children: b }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-secondary",
          onClick: p,
          children: "Dismiss"
        }
      )
    ] }),
    c && /* @__PURE__ */ d("div", { className: "cedros-wallet-status-actions", children: [
      h === "not_enrolled" && o && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: o,
          children: "Create Wallet"
        }
      ),
      h === "enrolled_locked" && s && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: s,
          children: "Unlock Wallet"
        }
      ),
      (h === "not_enrolled" || h === "error") && a && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: a,
          children: "Recover Wallet"
        }
      ),
      h === "error" && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: w,
          children: "Retry"
        }
      )
    ] })
  ] });
}
function Bl(e, t) {
  switch (e) {
    case "loading":
      return {
        label: "Loading",
        title: "Checking Wallet",
        description: "Verifying wallet status...",
        color: "loading"
      };
    case "not_enrolled":
      return {
        label: "Not Set Up",
        title: "No Wallet",
        description: "Create a wallet to start using Solana.",
        color: "muted"
      };
    case "enrolled_locked":
      return {
        label: "Locked",
        title: "Wallet Locked",
        description: "Unlock your wallet to sign transactions.",
        color: "warning"
      };
    case "enrolled_unlocked":
    case "unlocked":
      return {
        label: "Ready",
        title: "Wallet Ready",
        description: "Your wallet is unlocked and ready to use.",
        color: "success"
      };
    case "error":
    default:
      return {
        label: "Error",
        title: "Wallet Error",
        description: t ?? "An error occurred with your wallet.",
        color: "error"
      };
  }
}
function Pl(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function Rl({ status: e }) {
  switch (e) {
    case "loading":
      return /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
        /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
        /* @__PURE__ */ r(
          "path",
          {
            d: "M12 3a9 9 0 0 1 9 9",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round"
          }
        )
      ] });
    case "not_enrolled":
      return /* @__PURE__ */ d(
        "svg",
        {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ r("path", { d: "M8 12h8M12 8v8" })
          ]
        }
      );
    case "enrolled_locked":
      return /* @__PURE__ */ d(
        "svg",
        {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ r("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
            /* @__PURE__ */ r("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
          ]
        }
      );
    case "enrolled_unlocked":
    case "unlocked":
      return /* @__PURE__ */ r(
        "svg",
        {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2.5",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: /* @__PURE__ */ r("path", { d: "M20 6L9 17l-5-5" })
        }
      );
    case "error":
      return /* @__PURE__ */ d(
        "svg",
        {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ r("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }),
            /* @__PURE__ */ r("path", { d: "M12 9v4M12 17h.01" })
          ]
        }
      );
    default:
      return null;
  }
}
function Ju({ className: e = "", showActions: t = !0 }) {
  const n = Lt(), [o, s] = B("status"), a = z(() => {
    switch (o) {
      case "enroll":
        return { title: "Create Wallet", description: "Set up your embedded wallet." };
      case "unlock":
        return { title: "Unlock Wallet", description: "Unlock to sign transactions." };
      case "recover_intro":
      case "recover":
        return {
          title: "Recover Wallet",
          description: "Restore access using your recovery phrase."
        };
      case "status":
      default:
        return null;
    }
  }, [o]), c = T(() => s("status"), []), i = T(async () => {
    s("status"), await n.refresh();
  }, [n]), l = T(async () => {
    s("status"), await n.refresh();
  }, [n]), u = T(async () => {
    s("status"), await n.refresh();
  }, [n]);
  return /* @__PURE__ */ d("div", { className: `cedros-wallet-manager ${e}`, children: [
    o !== "status" && a && /* @__PURE__ */ d("div", { className: "cedros-wallet-manager-header", children: [
      /* @__PURE__ */ d("div", { className: "cedros-wallet-manager-header-text", children: [
        /* @__PURE__ */ r("h3", { className: "cedros-wallet-manager-title", children: a.title }),
        /* @__PURE__ */ r("p", { className: "cedros-wallet-manager-subtitle", children: a.description })
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-ghost",
          onClick: c,
          children: "Back"
        }
      )
    ] }),
    o === "status" && /* @__PURE__ */ r(
      Ll,
      {
        onEnroll: () => s("enroll"),
        onUnlock: () => s("unlock"),
        onRecover: () => s("recover_intro"),
        showActions: t
      }
    ),
    o === "enroll" && /* @__PURE__ */ r(
      dl,
      {
        onComplete: () => {
          i();
        },
        onCancel: c
      }
    ),
    o === "unlock" && /* @__PURE__ */ r(
      wl,
      {
        onUnlock: () => {
          l();
        },
        onCancel: c
      }
    ),
    o === "recover_intro" && /* @__PURE__ */ r("div", { className: "cedros-wallet-manager-intro", children: /* @__PURE__ */ d("div", { className: "cedros-wallet-manager-intro-card", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-wallet-manager-intro-title", children: "Before you start" }),
      /* @__PURE__ */ d("ul", { className: "cedros-wallet-manager-intro-list", children: [
        /* @__PURE__ */ r("li", { children: "You’ll need your 12-word recovery phrase." }),
        /* @__PURE__ */ r("li", { children: "You’ll set a new password or passkey for this wallet." }),
        /* @__PURE__ */ r("li", { children: "If you’re on a shared device, avoid copying the phrase into other apps." })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-wallet-manager-intro-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: () => s("recover"),
            children: "Start recovery"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: c,
            children: "Cancel"
          }
        )
      ] })
    ] }) }),
    o === "recover" && /* @__PURE__ */ r(
      kl,
      {
        onComplete: () => {
          u();
        },
        onCancel: c
      }
    )
  ] });
}
function eh({
  showDescriptions: e = !0,
  className: t = "",
  onSave: n
}) {
  const { settings: o, isLoading: s, isUpdating: a, error: c, fetchSettings: i, updateSettings: l } = ca(), [u, f] = B({}), [h, m] = B(null), [b, w] = B(!1);
  O(() => {
    i();
  }, [i]), O(() => {
    if (b) {
      const R = setTimeout(() => w(!1), 3e3);
      return () => clearTimeout(R);
    }
  }, [b]);
  const p = T((R, g) => {
    f((k) => ({ ...k, [R]: g })), m(null), w(!1);
  }, []), E = T(async () => {
    const R = Object.entries(u).map(([g, k]) => ({
      key: g,
      value: k
    }));
    if (R.length !== 0)
      try {
        await l(R), f({}), m(null), w(!0), n?.();
      } catch (g) {
        m(g instanceof Error ? g.message : "Failed to save settings");
      }
  }, [u, l, n]), A = T(() => {
    f({}), m(null), w(!1);
  }, []), C = Object.keys(u).length > 0, N = Object.keys(u).length;
  if (s && Object.keys(o).length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-system-settings cedros-system-settings-loading ${t}`, children: [
      /* @__PURE__ */ r(Q, {}),
      /* @__PURE__ */ r("span", { children: "Loading settings..." })
    ] });
  if (c)
    return /* @__PURE__ */ r("div", { className: `cedros-system-settings ${t}`, children: /* @__PURE__ */ r(re, { error: c.message }) });
  const x = Object.keys(o).sort();
  return x.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-system-settings cedros-system-settings-empty ${t}`, children: /* @__PURE__ */ r("p", { children: "No system settings found." }) }) : /* @__PURE__ */ d("div", { className: `cedros-system-settings ${t}`, children: [
    h && /* @__PURE__ */ r(re, { error: h }),
    b && /* @__PURE__ */ r("div", { className: "cedros-settings-success", children: "Settings saved successfully." }),
    x.map((R) => /* @__PURE__ */ r(
      Tl,
      {
        category: R,
        settings: o[R],
        edits: u,
        showDescription: e,
        onChange: p
      },
      R
    )),
    /* @__PURE__ */ d("div", { className: "cedros-system-settings-actions", children: [
      C && /* @__PURE__ */ d("span", { className: "cedros-settings-change-count", children: [
        N,
        " unsaved change",
        N !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: A,
          disabled: !C || a,
          children: "Reset"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: E,
          disabled: !C || a,
          children: a ? /* @__PURE__ */ r(Q, { size: "sm" }) : "Save Changes"
        }
      )
    ] })
  ] });
}
const Cs = Object.keys(da);
function Tl({
  category: e,
  settings: t,
  edits: n,
  showDescription: o,
  onChange: s
}) {
  const a = la[e] || {
    label: e,
    description: "",
    icon: ""
  }, c = z(() => [...t].sort((i, l) => {
    const u = Cs.indexOf(i.key), f = Cs.indexOf(l.key);
    return (u === -1 ? 1 / 0 : u) - (f === -1 ? 1 / 0 : f);
  }), [t]);
  return /* @__PURE__ */ d("section", { className: "cedros-settings-section", children: [
    /* @__PURE__ */ d("div", { className: "cedros-settings-section-header", children: [
      /* @__PURE__ */ r("span", { className: "cedros-settings-section-icon", children: a.icon }),
      /* @__PURE__ */ d("div", { children: [
        /* @__PURE__ */ r("h3", { className: "cedros-settings-section-title", children: a.label }),
        o && a.description && /* @__PURE__ */ r("p", { className: "cedros-settings-section-description", children: a.description })
      ] })
    ] }),
    /* @__PURE__ */ r(vn, { settings: c, edits: n, onChange: s })
  ] });
}
class Ml {
  client;
  constructor(t, n, o) {
    this.client = new ce({ baseUrl: t, timeoutMs: n, retryAttempts: o });
  }
  /**
   * Check if initial setup is required
   * Returns whether the system needs initial setup (no admin exists)
   */
  async getStatus() {
    try {
      return await this.client.get("/setup/status");
    } catch (t) {
      throw q(t, "Failed to check setup status");
    }
  }
  /**
   * Create the first admin user
   * Only works when no admin users exist
   */
  async createFirstAdmin(t) {
    try {
      return await this.client.post("/setup/admin", t);
    } catch (n) {
      throw q(n, "Failed to create admin account");
    }
  }
}
function ao() {
  const { config: e } = ne(), [t, n] = B(null), [o, s] = B(!1), [a, c] = B(!1), [i, l] = B(null), u = J(0), f = z(
    () => new Ml(e.serverUrl, e.requestTimeout, e.retryAttempts),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), h = J(f);
  h.current = f;
  const m = T(async () => {
    s(!0), l(null);
    const w = ++u.current;
    try {
      const p = await h.current.getStatus();
      if (w !== u.current) return;
      n(p);
    } catch (p) {
      if (w !== u.current) return;
      l(p instanceof Error ? p : new Error("Failed to check setup status"));
    } finally {
      w === u.current && s(!1);
    }
  }, []), b = T(
    async (w) => {
      c(!0), l(null);
      try {
        const p = await h.current.createFirstAdmin(w);
        return await m(), p;
      } catch (p) {
        const E = p instanceof Error ? p : new Error("Failed to create admin");
        throw l(E), E;
      } finally {
        c(!1);
      }
    },
    [m]
  );
  return {
    status: t,
    isLoading: o,
    isCreating: a,
    error: i,
    checkStatus: m,
    createAdmin: b
  };
}
const Il = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, xs = 8;
function _l(e) {
  const t = {};
  return e.email ? Il.test(e.email) || (t.email = "Invalid email format") : t.email = "Email is required", e.password ? e.password.length < xs && (t.password = `Password must be at least ${xs} characters`) : t.password = "Password is required", e.confirmPassword ? e.password !== e.confirmPassword && (t.confirmPassword = "Passwords do not match") : t.confirmPassword = "Please confirm your password", t;
}
function Dl({ onComplete: e, className: t = "" }) {
  const { status: n, isLoading: o, isCreating: s, error: a, checkStatus: c, createAdmin: i } = ao(), [l, u] = B({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    orgName: ""
  }), [f, h] = B({}), [m, b] = B(!1);
  O(() => {
    c();
  }, [c]);
  const w = T(
    (E) => (A) => {
      u((C) => ({ ...C, [E]: A.target.value })), h((C) => ({ ...C, [E]: void 0 }));
    },
    []
  ), p = T(
    async (E) => {
      E.preventDefault();
      const A = _l(l);
      if (Object.keys(A).length > 0) {
        h(A);
        return;
      }
      try {
        await i({
          email: l.email,
          password: l.password,
          name: l.name || void 0,
          orgName: l.orgName || void 0
        }), b(!0), e?.();
      } catch {
      }
    },
    [l, i, e]
  );
  return o ? /* @__PURE__ */ r("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-setup__loading", children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { className: "cedros-setup__loading-text", children: "Checking setup status..." })
  ] }) }) : n && !n.needsSetup ? /* @__PURE__ */ r("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-setup__complete", children: [
    /* @__PURE__ */ r("div", { className: "cedros-setup__icon cedros-setup__icon--success", children: /* @__PURE__ */ d(
      "svg",
      {
        width: "48",
        height: "48",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ r("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          /* @__PURE__ */ r("polyline", { points: "22 4 12 14.01 9 11.01" })
        ]
      }
    ) }),
    /* @__PURE__ */ r("h2", { className: "cedros-setup__title", children: "Setup Complete" }),
    /* @__PURE__ */ r("p", { className: "cedros-setup__text", children: "An admin account already exists. You can now log in." })
  ] }) }) : m ? /* @__PURE__ */ r("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-setup__complete", children: [
    /* @__PURE__ */ r("div", { className: "cedros-setup__icon cedros-setup__icon--success", children: /* @__PURE__ */ d(
      "svg",
      {
        width: "48",
        height: "48",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ r("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          /* @__PURE__ */ r("polyline", { points: "22 4 12 14.01 9 11.01" })
        ]
      }
    ) }),
    /* @__PURE__ */ r("h2", { className: "cedros-setup__title", children: "Admin Account Created" }),
    /* @__PURE__ */ r("p", { className: "cedros-setup__text", children: "Your admin account has been created successfully. You can now log in with your credentials." })
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-setup__container", children: [
    /* @__PURE__ */ d("div", { className: "cedros-setup__header", children: [
      /* @__PURE__ */ r("div", { className: "cedros-setup__logo", children: /* @__PURE__ */ d(
        "svg",
        {
          width: "32",
          height: "32",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            /* @__PURE__ */ r("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }),
            /* @__PURE__ */ r("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" })
          ]
        }
      ) }),
      /* @__PURE__ */ r("h1", { className: "cedros-setup__title", children: "Welcome to Cedros" }),
      /* @__PURE__ */ r("p", { className: "cedros-setup__subtitle", children: "Let's set up your admin account to get started." })
    ] }),
    /* @__PURE__ */ d("form", { className: "cedros-setup__form", onSubmit: p, children: [
      a && /* @__PURE__ */ r(re, { error: a.message }),
      /* @__PURE__ */ d("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ d("label", { htmlFor: "setup-email", className: "cedros-setup__label", children: [
          "Email Address ",
          /* @__PURE__ */ r("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "setup-email",
            type: "email",
            className: `cedros-setup__input ${f.email ? "cedros-setup__input--error" : ""}`,
            value: l.email,
            onChange: w("email"),
            placeholder: "admin@example.com",
            autoComplete: "email",
            autoFocus: !0,
            disabled: s
          }
        ),
        f.email && /* @__PURE__ */ r("span", { className: "cedros-setup__error", children: f.email })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ r("label", { htmlFor: "setup-name", className: "cedros-setup__label", children: "Display Name" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "setup-name",
            type: "text",
            className: "cedros-setup__input",
            value: l.name,
            onChange: w("name"),
            placeholder: "Admin",
            autoComplete: "name",
            disabled: s
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ r("label", { htmlFor: "setup-org-name", className: "cedros-setup__label", children: "Organization Name" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "setup-org-name",
            type: "text",
            className: "cedros-setup__input",
            value: l.orgName,
            onChange: w("orgName"),
            placeholder: "My Organization",
            disabled: s
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ d("label", { htmlFor: "setup-password", className: "cedros-setup__label", children: [
          "Password ",
          /* @__PURE__ */ r("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "setup-password",
            type: "password",
            className: `cedros-setup__input ${f.password ? "cedros-setup__input--error" : ""}`,
            value: l.password,
            onChange: w("password"),
            placeholder: "At least 8 characters",
            autoComplete: "new-password",
            disabled: s
          }
        ),
        f.password && /* @__PURE__ */ r("span", { className: "cedros-setup__error", children: f.password })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ d("label", { htmlFor: "setup-confirm-password", className: "cedros-setup__label", children: [
          "Confirm Password ",
          /* @__PURE__ */ r("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "setup-confirm-password",
            type: "password",
            className: `cedros-setup__input ${f.confirmPassword ? "cedros-setup__input--error" : ""}`,
            value: l.confirmPassword,
            onChange: w("confirmPassword"),
            placeholder: "Confirm your password",
            autoComplete: "new-password",
            disabled: s
          }
        ),
        f.confirmPassword && /* @__PURE__ */ r("span", { className: "cedros-setup__error", children: f.confirmPassword })
      ] }),
      /* @__PURE__ */ r("button", { type: "submit", className: "cedros-setup__button", disabled: s, children: s ? /* @__PURE__ */ d(X, { children: [
        /* @__PURE__ */ r(Q, {}),
        /* @__PURE__ */ r("span", { children: "Creating Account..." })
      ] }) : "Create Admin Account" })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-setup__footer", children: [
      /* @__PURE__ */ r("p", { className: "cedros-setup__note", children: "This will be the first administrator account for your installation." }),
      n?.serverVersion && /* @__PURE__ */ d("p", { className: "cedros-setup__version", children: [
        "Server version: ",
        n.serverVersion
      ] })
    ] })
  ] }) });
}
const Ul = ["security", "rate_limit"];
function th({ className: e }) {
  return /* @__PURE__ */ r(
    Ta,
    {
      title: "Security",
      description: "Configure CORS, cookies, sessions, JWT, and rate limiting settings.",
      categories: Ul,
      className: e
    }
  );
}
const Ss = [
  { id: "email", label: "Email", category: "email" },
  { id: "webhooks", label: "Webhooks", category: "webhook" }
];
function Fl({ className: e }) {
  const {
    settings: t,
    edits: n,
    isLoading: o,
    autosaveStatus: s,
    autosaveError: a,
    error: c,
    fetchSettings: i,
    handleChange: l,
    getEffectiveValue: u
  } = ua(), [f, h] = B("email");
  O(() => {
    i();
  }, [i]);
  const m = Ss.find((x) => x.id === f), b = m?.category ?? "", p = (u("email_provider") || "custom") === "custom", E = u("email_smtp_host"), A = !p || E != null && E !== "", C = z(() => {
    const x = t[b] ?? [];
    if (f !== "email") return x;
    const R = p ? Sa : La;
    return x.filter((g) => R.includes(g.key)).sort((g, k) => R.indexOf(g.key) - R.indexOf(k.key));
  }, [t, b, f, p]), N = (x, R) => {
    if (l(x, R), x === "email_provider" && R !== "custom") {
      const g = Ba[R];
      g && (l("email_smtp_host", g), l("email_smtp_port", "587"), l("email_smtp_tls", "true"));
    }
  };
  return o && Object.keys(t).length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-system-settings cedros-system-settings-loading ${e ?? ""}`, children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { children: "Loading settings..." })
  ] }) : c ? /* @__PURE__ */ r("div", { className: `cedros-system-settings ${e ?? ""}`, children: /* @__PURE__ */ r(re, { error: c.message }) }) : /* @__PURE__ */ d("div", { className: `cedros-system-settings ${e ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ d("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ r("h2", { className: "cedros-settings-page-title", children: "Auth Messages" }),
        /* @__PURE__ */ r("p", { className: "cedros-settings-page-description", children: "Configure email delivery for verification emails, password resets, and instant link login. Webhook notifications can be sent to Discord or Slack." })
      ] }),
      /* @__PURE__ */ r(ha, { status: s, error: a })
    ] }),
    f === "email" && !A && /* @__PURE__ */ r("div", { className: "cedros-settings-warning-banner", children: "Email features (verification, password reset, instant link) are disabled until SMTP is configured. Select a provider or enter custom SMTP settings below." }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: Ss.map((x) => /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${f === x.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => h(x.id),
        "aria-selected": f === x.id,
        role: "tab",
        children: x.label
      },
      x.id
    )) }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: C.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ d("p", { children: [
      "No settings found for ",
      m?.label ?? "this section",
      "."
    ] }) }) : /* @__PURE__ */ r(
      vn,
      {
        settings: C,
        edits: n,
        onChange: f === "email" ? N : l
      }
    ) })
  ] });
}
const be = {
  users: /* @__PURE__ */ d(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ r("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
        /* @__PURE__ */ r("circle", { cx: "9", cy: "7", r: "4" }),
        /* @__PURE__ */ r("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
        /* @__PURE__ */ r("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
      ]
    }
  ),
  members: /* @__PURE__ */ d(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ r("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
        /* @__PURE__ */ r("circle", { cx: "9", cy: "7", r: "4" }),
        /* @__PURE__ */ r("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
        /* @__PURE__ */ r("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
      ]
    }
  ),
  deposits: /* @__PURE__ */ d(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ r("path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" }),
        /* @__PURE__ */ r("path", { d: "M12 18V6" })
      ]
    }
  ),
  withdrawals: /* @__PURE__ */ d(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ r("rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2" }),
        /* @__PURE__ */ r("path", { d: "M9 22v-4h6v4" }),
        /* @__PURE__ */ r("path", { d: "M8 6h.01" }),
        /* @__PURE__ */ r("path", { d: "M16 6h.01" }),
        /* @__PURE__ */ r("path", { d: "M12 6h.01" }),
        /* @__PURE__ */ r("path", { d: "M12 10h.01" }),
        /* @__PURE__ */ r("path", { d: "M12 14h.01" }),
        /* @__PURE__ */ r("path", { d: "M16 10h.01" }),
        /* @__PURE__ */ r("path", { d: "M16 14h.01" }),
        /* @__PURE__ */ r("path", { d: "M8 10h.01" }),
        /* @__PURE__ */ r("path", { d: "M8 14h.01" })
      ]
    }
  ),
  wallet: /* @__PURE__ */ d(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ r("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }),
        /* @__PURE__ */ r("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" })
      ]
    }
  ),
  chevronRight: /* @__PURE__ */ r(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ r("path", { d: "m9 18 6-6-6-6" })
    }
  ),
  // Settings sub-page icons
  key: /* @__PURE__ */ r(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ r("path", { d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" })
    }
  ),
  mail: /* @__PURE__ */ d(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ r("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
        /* @__PURE__ */ r("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
      ]
    }
  ),
  coins: /* @__PURE__ */ d(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "6" }),
        /* @__PURE__ */ r("path", { d: "M18.09 10.37A6 6 0 1 1 10.34 18" }),
        /* @__PURE__ */ r("path", { d: "M7 6h1v4" }),
        /* @__PURE__ */ r("path", { d: "m16.71 13.88.7.71-2.82 2.82" })
      ]
    }
  ),
  server: /* @__PURE__ */ d(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ r("rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2" }),
        /* @__PURE__ */ r("rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2" }),
        /* @__PURE__ */ r("line", { x1: "6", x2: "6.01", y1: "6", y2: "6" }),
        /* @__PURE__ */ r("line", { x1: "6", x2: "6.01", y1: "18", y2: "18" })
      ]
    }
  )
}, Ol = [
  // Top-level menu items
  { id: "users", label: "Users", icon: be.users },
  { id: "team", label: "Team", icon: be.members },
  { id: "deposits", label: "Deposits", icon: be.deposits, requiredFeature: "credits" },
  { id: "withdrawals", label: "Withdrawals", icon: be.withdrawals, requiredFeature: "credits" },
  // Configuration group
  { id: "settings-auth", label: "Authentication", icon: be.key, group: "Configuration" },
  { id: "settings-messaging", label: "Auth Messages", icon: be.mail, group: "Configuration" },
  { id: "settings-wallet", label: "User Wallets", icon: be.wallet, group: "Configuration" },
  {
    id: "settings-credits",
    label: "Credit System",
    icon: be.coins,
    group: "Configuration",
    requiredFeature: "credits"
  },
  { id: "settings-server", label: "Auth Server", icon: be.server, group: "Configuration" }
];
function rh({
  title: e = "Dashboard",
  sections: t = [
    "users",
    "team",
    "deposits",
    "withdrawals",
    "settings-wallet",
    "settings-auth",
    "settings-messaging",
    "settings-credits",
    "settings-server"
  ],
  defaultSection: n = "users",
  refreshInterval: o = 0,
  pageSize: s = 20,
  onSectionChange: a,
  onSettingsClick: c,
  onLogoutClick: i,
  className: l = ""
}) {
  const [u, f] = B(n), [h, m] = B(!0), { user: b, logout: w } = ne(), { activeOrg: p, role: E, isLoading: A, fetchOrgs: C, hasPermission: N } = fa(), { status: x, isLoading: R, checkStatus: g } = ao(), { features: k, isLoading: v } = ea(), { canAccess: y } = ta(), S = T(
    (_) => {
      f(_), a?.(_);
    },
    [a]
  ), L = Ol.filter((_) => !(!t.includes(_.id) || _.requiredFeature && !k[_.requiredFeature] || !y(_.id))), M = L.find((_) => _.id === u), P = !M && !v;
  return O(() => {
    C(), g();
  }, [C, g]), O(() => {
    P && L.length > 0 && f("users");
  }, [P, L.length]), !R && x?.needsSetup ? /* @__PURE__ */ r("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--setup ${l}`, children: /* @__PURE__ */ r(Dl, { onComplete: () => g() }) }) : (A || R || v) && !p ? /* @__PURE__ */ d("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--loading ${l}`, children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { className: "cedros-dashboard__loading-text", children: "Loading..." })
  ] }) : u === "team" && !p ? /* @__PURE__ */ r("div", { className: `cedros-admin cedros-dashboard ${l}`, children: /* @__PURE__ */ r(re, { error: "No organization selected. Please select an organization first." }) }) : /* @__PURE__ */ d("div", { className: `cedros-admin cedros-dashboard ${l}`, children: [
    /* @__PURE__ */ d("aside", { className: "cedros-dashboard__sidebar", children: [
      /* @__PURE__ */ r("div", { className: "cedros-dashboard__sidebar-header", children: /* @__PURE__ */ d("div", { className: "cedros-dashboard__logo", children: [
        be.wallet,
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__logo-text", children: e })
      ] }) }),
      /* @__PURE__ */ d("nav", { className: "cedros-dashboard__nav", children: [
        /* @__PURE__ */ d("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-label", children: "Menu" }),
          L.filter((_) => !_.group).map((_) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === _.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => S(_.id),
              "aria-current": u === _.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-icon", children: _.icon }),
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-text", children: _.label })
              ]
            },
            _.id
          ))
        ] }),
        L.some((_) => _.group === "Configuration") && /* @__PURE__ */ d("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: "cedros-dashboard__nav-label cedros-dashboard__nav-label--collapsible",
              onClick: () => m(!h),
              "aria-expanded": h,
              children: [
                /* @__PURE__ */ r("span", { children: "Configuration" }),
                /* @__PURE__ */ r(
                  "span",
                  {
                    className: `cedros-dashboard__nav-chevron ${h ? "cedros-dashboard__nav-chevron--expanded" : ""}`,
                    children: be.chevronRight
                  }
                )
              ]
            }
          ),
          h && L.filter((_) => _.group === "Configuration").map((_) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === _.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => S(_.id),
              "aria-current": u === _.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-icon", children: _.icon }),
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-text", children: _.label })
              ]
            },
            _.id
          ))
        ] })
      ] }),
      b && /* @__PURE__ */ r("div", { className: "cedros-dashboard__sidebar-footer", children: /* @__PURE__ */ r(
        Ea,
        {
          name: b.name,
          email: b.email,
          picture: b.picture,
          onSettings: c,
          onLogout: i ?? w
        }
      ) })
    ] }),
    /* @__PURE__ */ d("main", { className: "cedros-dashboard__main", children: [
      /* @__PURE__ */ r("header", { className: "cedros-dashboard__header", children: /* @__PURE__ */ d("div", { className: "cedros-dashboard__breadcrumb", children: [
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-root", children: e }),
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-sep", children: be.chevronRight }),
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-current", children: M?.label })
      ] }) }),
      /* @__PURE__ */ d("div", { className: "cedros-dashboard__content", children: [
        u === "users" && /* @__PURE__ */ r(Wl, { pageSize: s, currentUserId: b?.id }),
        u === "team" && p && /* @__PURE__ */ r(
          ql,
          {
            orgId: p.id,
            currentUserId: b?.id,
            hasPermission: N,
            role: E
          }
        ),
        u === "deposits" && /* @__PURE__ */ r(jl, { pageSize: s, refreshInterval: o }),
        u === "withdrawals" && /* @__PURE__ */ r(zl, { pageSize: s, refreshInterval: o }),
        u === "settings-auth" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Ca, {}) }),
        u === "settings-wallet" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(xa, {}) }),
        u === "settings-messaging" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Fl, {}) }),
        u === "settings-credits" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Pa, {}) }),
        u === "settings-server" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Ra, {}) })
      ] })
    ] })
  ] });
}
function Wl({ pageSize: e, currentUserId: t }) {
  const [n, o] = B(null), { statsItems: s, isLoading: a, error: c, refresh: i } = va();
  return n ? /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(
    ka,
    {
      userId: n.id,
      currentUserId: t,
      onBack: () => o(null)
    }
  ) }) : /* @__PURE__ */ d("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ r(kn, { stats: s, isLoading: a, onRefresh: i }),
    c && /* @__PURE__ */ r("p", { className: "cedros-admin-error-inline", children: c }),
    /* @__PURE__ */ r(
      Na,
      {
        pageSize: e,
        currentUserId: t,
        onUserClick: (l) => o(l)
      }
    )
  ] });
}
function ql({ orgId: e, currentUserId: t, hasPermission: n, role: o }) {
  const [s, a] = B("members"), {
    members: c,
    isLoading: i,
    error: l,
    fetchMembers: u,
    updateMemberRole: f,
    removeMember: h
  } = ra(e), {
    invites: m,
    isLoading: b,
    error: w,
    fetchInvites: p,
    createInvite: E,
    cancelInvite: A,
    resendInvite: C
  } = sa(e);
  O(() => {
    u(), p();
  }, [u, p]);
  const N = n("invite:create"), x = n("invite:cancel"), R = m.length, g = c.reduce(
    (S, L) => (S[L.role] = (S[L.role] ?? 0) + 1, S),
    {}
  ), k = g.owner ?? 0, v = g.admin ?? 0, y = g.member ?? 0;
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__team", children: [
    /* @__PURE__ */ r(
      kn,
      {
        stats: [
          { label: "Owners", value: k },
          { label: "Admins", value: v },
          { label: "Members", value: y },
          { label: "Pending Invites", value: R }
        ]
      }
    ),
    /* @__PURE__ */ d("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "members" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => a("members"),
          "aria-selected": s === "members",
          role: "tab",
          children: "Members"
        }
      ),
      /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "invites" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => a("invites"),
          "aria-selected": s === "invites",
          role: "tab",
          children: [
            "Pending Invites",
            R > 0 && ` (${R})`
          ]
        }
      ),
      o === "owner" && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${s === "permissions" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => a("permissions"),
          "aria-selected": s === "permissions",
          role: "tab",
          children: "Permissions"
        }
      )
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: [
      s === "members" && /* @__PURE__ */ r(
        na,
        {
          members: c,
          currentUserId: t,
          isLoading: i,
          error: l?.message,
          canManage: n("member:remove"),
          canChangeRoles: n("member:role_change"),
          onUpdateRole: f,
          onRemove: h
        }
      ),
      s === "invites" && /* @__PURE__ */ d("div", { className: "cedros-dashboard__invites", children: [
        N && /* @__PURE__ */ d("div", { className: "cedros-dashboard__section", children: [
          /* @__PURE__ */ r("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ r("h3", { className: "cedros-dashboard__section-title", children: "Send Invitation" }) }),
          /* @__PURE__ */ r(
            oa,
            {
              onSubmit: E,
              isLoading: b,
              error: w?.message
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(
          aa,
          {
            invites: m,
            isLoading: b,
            error: w?.message,
            canManage: x || N,
            onCancel: x ? A : void 0,
            onResend: N ? C : void 0
          }
        ) })
      ] }),
      s === "permissions" && o === "owner" && /* @__PURE__ */ r(ia, { userRole: o })
    ] })
  ] });
}
function jl({ pageSize: e, refreshInterval: t }) {
  const [n, o] = B("");
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ r(pa, { refreshInterval: t }),
    /* @__PURE__ */ d("div", { className: "cedros-dashboard__deposits-list", children: [
      /* @__PURE__ */ r("div", { className: "cedros-dashboard__toolbar", children: /* @__PURE__ */ d("div", { className: "cedros-dashboard__filter", children: [
        /* @__PURE__ */ r("label", { className: "cedros-dashboard__filter-label", htmlFor: "status-filter", children: "Status" }),
        /* @__PURE__ */ d(
          "select",
          {
            id: "status-filter",
            className: "cedros-dashboard__select",
            value: n,
            onChange: (s) => o(s.target.value),
            children: [
              /* @__PURE__ */ r("option", { value: "", children: "All statuses" }),
              /* @__PURE__ */ r("option", { value: "pending", children: "Pending" }),
              /* @__PURE__ */ r("option", { value: "detected", children: "Detected" }),
              /* @__PURE__ */ r("option", { value: "processing", children: "Processing" }),
              /* @__PURE__ */ r("option", { value: "completed", children: "Completed" }),
              /* @__PURE__ */ r("option", { value: "withdrawn", children: "Withdrawn" }),
              /* @__PURE__ */ r("option", { value: "expired", children: "Expired" }),
              /* @__PURE__ */ r("option", { value: "failed", children: "Failed" })
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ r(
        ga,
        {
          statusFilter: n || void 0,
          pageSize: e,
          refreshInterval: t
        }
      )
    ] })
  ] });
}
function zl({ pageSize: e, refreshInterval: t }) {
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ r(wa, { refreshInterval: t }),
    /* @__PURE__ */ r("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ d("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ r(ba, { pageSize: e, refreshInterval: t }),
      /* @__PURE__ */ r(ya, { pageSize: e, refreshInterval: t }),
      /* @__PURE__ */ r(Aa, { pageSize: e, refreshInterval: t })
    ] })
  ] });
}
var Qe = {}, Kt, Ls;
function Vl() {
  return Ls || (Ls = 1, Kt = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), Kt;
}
var Yt = {}, De = {}, Bs;
function qe() {
  if (Bs) return De;
  Bs = 1;
  let e;
  const t = [
    0,
    // Not used
    26,
    44,
    70,
    100,
    134,
    172,
    196,
    242,
    292,
    346,
    404,
    466,
    532,
    581,
    655,
    733,
    815,
    901,
    991,
    1085,
    1156,
    1258,
    1364,
    1474,
    1588,
    1706,
    1828,
    1921,
    2051,
    2185,
    2323,
    2465,
    2611,
    2761,
    2876,
    3034,
    3196,
    3362,
    3532,
    3706
  ];
  return De.getSymbolSize = function(o) {
    if (!o) throw new Error('"version" cannot be null or undefined');
    if (o < 1 || o > 40) throw new Error('"version" should be in range from 1 to 40');
    return o * 4 + 17;
  }, De.getSymbolTotalCodewords = function(o) {
    return t[o];
  }, De.getBCHDigit = function(n) {
    let o = 0;
    for (; n !== 0; )
      o++, n >>>= 1;
    return o;
  }, De.setToSJISFunction = function(o) {
    if (typeof o != "function")
      throw new Error('"toSJISFunc" is not a valid function.');
    e = o;
  }, De.isKanjiModeEnabled = function() {
    return typeof e < "u";
  }, De.toSJIS = function(o) {
    return e(o);
  }, De;
}
var Zt = {}, Ps;
function zr() {
  return Ps || (Ps = 1, (function(e) {
    e.L = { bit: 1 }, e.M = { bit: 0 }, e.Q = { bit: 3 }, e.H = { bit: 2 };
    function t(n) {
      if (typeof n != "string")
        throw new Error("Param is not a string");
      switch (n.toLowerCase()) {
        case "l":
        case "low":
          return e.L;
        case "m":
        case "medium":
          return e.M;
        case "q":
        case "quartile":
          return e.Q;
        case "h":
        case "high":
          return e.H;
        default:
          throw new Error("Unknown EC Level: " + n);
      }
    }
    e.isValid = function(o) {
      return o && typeof o.bit < "u" && o.bit >= 0 && o.bit < 4;
    }, e.from = function(o, s) {
      if (e.isValid(o))
        return o;
      try {
        return t(o);
      } catch {
        return s;
      }
    };
  })(Zt)), Zt;
}
var Xt, Rs;
function Hl() {
  if (Rs) return Xt;
  Rs = 1;
  function e() {
    this.buffer = [], this.length = 0;
  }
  return e.prototype = {
    get: function(t) {
      const n = Math.floor(t / 8);
      return (this.buffer[n] >>> 7 - t % 8 & 1) === 1;
    },
    put: function(t, n) {
      for (let o = 0; o < n; o++)
        this.putBit((t >>> n - o - 1 & 1) === 1);
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(t) {
      const n = Math.floor(this.length / 8);
      this.buffer.length <= n && this.buffer.push(0), t && (this.buffer[n] |= 128 >>> this.length % 8), this.length++;
    }
  }, Xt = e, Xt;
}
var Jt, Ts;
function $l() {
  if (Ts) return Jt;
  Ts = 1;
  function e(t) {
    if (!t || t < 1)
      throw new Error("BitMatrix size must be defined and greater than 0");
    this.size = t, this.data = new Uint8Array(t * t), this.reservedBit = new Uint8Array(t * t);
  }
  return e.prototype.set = function(t, n, o, s) {
    const a = t * this.size + n;
    this.data[a] = o, s && (this.reservedBit[a] = !0);
  }, e.prototype.get = function(t, n) {
    return this.data[t * this.size + n];
  }, e.prototype.xor = function(t, n, o) {
    this.data[t * this.size + n] ^= o;
  }, e.prototype.isReserved = function(t, n) {
    return this.reservedBit[t * this.size + n];
  }, Jt = e, Jt;
}
var er = {}, Ms;
function Ql() {
  return Ms || (Ms = 1, (function(e) {
    const t = qe().getSymbolSize;
    e.getRowColCoords = function(o) {
      if (o === 1) return [];
      const s = Math.floor(o / 7) + 2, a = t(o), c = a === 145 ? 26 : Math.ceil((a - 13) / (2 * s - 2)) * 2, i = [a - 7];
      for (let l = 1; l < s - 1; l++)
        i[l] = i[l - 1] - c;
      return i.push(6), i.reverse();
    }, e.getPositions = function(o) {
      const s = [], a = e.getRowColCoords(o), c = a.length;
      for (let i = 0; i < c; i++)
        for (let l = 0; l < c; l++)
          i === 0 && l === 0 || // top-left
          i === 0 && l === c - 1 || // bottom-left
          i === c - 1 && l === 0 || s.push([a[i], a[l]]);
      return s;
    };
  })(er)), er;
}
var tr = {}, Is;
function Gl() {
  if (Is) return tr;
  Is = 1;
  const e = qe().getSymbolSize, t = 7;
  return tr.getPositions = function(o) {
    const s = e(o);
    return [
      // top-left
      [0, 0],
      // top-right
      [s - t, 0],
      // bottom-left
      [0, s - t]
    ];
  }, tr;
}
var rr = {}, _s;
function Kl() {
  return _s || (_s = 1, (function(e) {
    e.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    const t = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    e.isValid = function(s) {
      return s != null && s !== "" && !isNaN(s) && s >= 0 && s <= 7;
    }, e.from = function(s) {
      return e.isValid(s) ? parseInt(s, 10) : void 0;
    }, e.getPenaltyN1 = function(s) {
      const a = s.size;
      let c = 0, i = 0, l = 0, u = null, f = null;
      for (let h = 0; h < a; h++) {
        i = l = 0, u = f = null;
        for (let m = 0; m < a; m++) {
          let b = s.get(h, m);
          b === u ? i++ : (i >= 5 && (c += t.N1 + (i - 5)), u = b, i = 1), b = s.get(m, h), b === f ? l++ : (l >= 5 && (c += t.N1 + (l - 5)), f = b, l = 1);
        }
        i >= 5 && (c += t.N1 + (i - 5)), l >= 5 && (c += t.N1 + (l - 5));
      }
      return c;
    }, e.getPenaltyN2 = function(s) {
      const a = s.size;
      let c = 0;
      for (let i = 0; i < a - 1; i++)
        for (let l = 0; l < a - 1; l++) {
          const u = s.get(i, l) + s.get(i, l + 1) + s.get(i + 1, l) + s.get(i + 1, l + 1);
          (u === 4 || u === 0) && c++;
        }
      return c * t.N2;
    }, e.getPenaltyN3 = function(s) {
      const a = s.size;
      let c = 0, i = 0, l = 0;
      for (let u = 0; u < a; u++) {
        i = l = 0;
        for (let f = 0; f < a; f++)
          i = i << 1 & 2047 | s.get(u, f), f >= 10 && (i === 1488 || i === 93) && c++, l = l << 1 & 2047 | s.get(f, u), f >= 10 && (l === 1488 || l === 93) && c++;
      }
      return c * t.N3;
    }, e.getPenaltyN4 = function(s) {
      let a = 0;
      const c = s.data.length;
      for (let l = 0; l < c; l++) a += s.data[l];
      return Math.abs(Math.ceil(a * 100 / c / 5) - 10) * t.N4;
    };
    function n(o, s, a) {
      switch (o) {
        case e.Patterns.PATTERN000:
          return (s + a) % 2 === 0;
        case e.Patterns.PATTERN001:
          return s % 2 === 0;
        case e.Patterns.PATTERN010:
          return a % 3 === 0;
        case e.Patterns.PATTERN011:
          return (s + a) % 3 === 0;
        case e.Patterns.PATTERN100:
          return (Math.floor(s / 2) + Math.floor(a / 3)) % 2 === 0;
        case e.Patterns.PATTERN101:
          return s * a % 2 + s * a % 3 === 0;
        case e.Patterns.PATTERN110:
          return (s * a % 2 + s * a % 3) % 2 === 0;
        case e.Patterns.PATTERN111:
          return (s * a % 3 + (s + a) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + o);
      }
    }
    e.applyMask = function(s, a) {
      const c = a.size;
      for (let i = 0; i < c; i++)
        for (let l = 0; l < c; l++)
          a.isReserved(l, i) || a.xor(l, i, n(s, l, i));
    }, e.getBestMask = function(s, a) {
      const c = Object.keys(e.Patterns).length;
      let i = 0, l = 1 / 0;
      for (let u = 0; u < c; u++) {
        a(u), e.applyMask(u, s);
        const f = e.getPenaltyN1(s) + e.getPenaltyN2(s) + e.getPenaltyN3(s) + e.getPenaltyN4(s);
        e.applyMask(u, s), f < l && (l = f, i = u);
      }
      return i;
    };
  })(rr)), rr;
}
var ft = {}, Ds;
function io() {
  if (Ds) return ft;
  Ds = 1;
  const e = zr(), t = [
    // L  M  Q  H
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    2,
    2,
    1,
    2,
    2,
    4,
    1,
    2,
    4,
    4,
    2,
    4,
    4,
    4,
    2,
    4,
    6,
    5,
    2,
    4,
    6,
    6,
    2,
    5,
    8,
    8,
    4,
    5,
    8,
    8,
    4,
    5,
    8,
    11,
    4,
    8,
    10,
    11,
    4,
    9,
    12,
    16,
    4,
    9,
    16,
    16,
    6,
    10,
    12,
    18,
    6,
    10,
    17,
    16,
    6,
    11,
    16,
    19,
    6,
    13,
    18,
    21,
    7,
    14,
    21,
    25,
    8,
    16,
    20,
    25,
    8,
    17,
    23,
    25,
    9,
    17,
    23,
    34,
    9,
    18,
    25,
    30,
    10,
    20,
    27,
    32,
    12,
    21,
    29,
    35,
    12,
    23,
    34,
    37,
    12,
    25,
    34,
    40,
    13,
    26,
    35,
    42,
    14,
    28,
    38,
    45,
    15,
    29,
    40,
    48,
    16,
    31,
    43,
    51,
    17,
    33,
    45,
    54,
    18,
    35,
    48,
    57,
    19,
    37,
    51,
    60,
    19,
    38,
    53,
    63,
    20,
    40,
    56,
    66,
    21,
    43,
    59,
    70,
    22,
    45,
    62,
    74,
    24,
    47,
    65,
    77,
    25,
    49,
    68,
    81
  ], n = [
    // L  M  Q  H
    7,
    10,
    13,
    17,
    10,
    16,
    22,
    28,
    15,
    26,
    36,
    44,
    20,
    36,
    52,
    64,
    26,
    48,
    72,
    88,
    36,
    64,
    96,
    112,
    40,
    72,
    108,
    130,
    48,
    88,
    132,
    156,
    60,
    110,
    160,
    192,
    72,
    130,
    192,
    224,
    80,
    150,
    224,
    264,
    96,
    176,
    260,
    308,
    104,
    198,
    288,
    352,
    120,
    216,
    320,
    384,
    132,
    240,
    360,
    432,
    144,
    280,
    408,
    480,
    168,
    308,
    448,
    532,
    180,
    338,
    504,
    588,
    196,
    364,
    546,
    650,
    224,
    416,
    600,
    700,
    224,
    442,
    644,
    750,
    252,
    476,
    690,
    816,
    270,
    504,
    750,
    900,
    300,
    560,
    810,
    960,
    312,
    588,
    870,
    1050,
    336,
    644,
    952,
    1110,
    360,
    700,
    1020,
    1200,
    390,
    728,
    1050,
    1260,
    420,
    784,
    1140,
    1350,
    450,
    812,
    1200,
    1440,
    480,
    868,
    1290,
    1530,
    510,
    924,
    1350,
    1620,
    540,
    980,
    1440,
    1710,
    570,
    1036,
    1530,
    1800,
    570,
    1064,
    1590,
    1890,
    600,
    1120,
    1680,
    1980,
    630,
    1204,
    1770,
    2100,
    660,
    1260,
    1860,
    2220,
    720,
    1316,
    1950,
    2310,
    750,
    1372,
    2040,
    2430
  ];
  return ft.getBlocksCount = function(s, a) {
    switch (a) {
      case e.L:
        return t[(s - 1) * 4 + 0];
      case e.M:
        return t[(s - 1) * 4 + 1];
      case e.Q:
        return t[(s - 1) * 4 + 2];
      case e.H:
        return t[(s - 1) * 4 + 3];
      default:
        return;
    }
  }, ft.getTotalCodewordsCount = function(s, a) {
    switch (a) {
      case e.L:
        return n[(s - 1) * 4 + 0];
      case e.M:
        return n[(s - 1) * 4 + 1];
      case e.Q:
        return n[(s - 1) * 4 + 2];
      case e.H:
        return n[(s - 1) * 4 + 3];
      default:
        return;
    }
  }, ft;
}
var sr = {}, st = {}, Us;
function Yl() {
  if (Us) return st;
  Us = 1;
  const e = new Uint8Array(512), t = new Uint8Array(256);
  return (function() {
    let o = 1;
    for (let s = 0; s < 255; s++)
      e[s] = o, t[o] = s, o <<= 1, o & 256 && (o ^= 285);
    for (let s = 255; s < 512; s++)
      e[s] = e[s - 255];
  })(), st.log = function(o) {
    if (o < 1) throw new Error("log(" + o + ")");
    return t[o];
  }, st.exp = function(o) {
    return e[o];
  }, st.mul = function(o, s) {
    return o === 0 || s === 0 ? 0 : e[t[o] + t[s]];
  }, st;
}
var Fs;
function Zl() {
  return Fs || (Fs = 1, (function(e) {
    const t = Yl();
    e.mul = function(o, s) {
      const a = new Uint8Array(o.length + s.length - 1);
      for (let c = 0; c < o.length; c++)
        for (let i = 0; i < s.length; i++)
          a[c + i] ^= t.mul(o[c], s[i]);
      return a;
    }, e.mod = function(o, s) {
      let a = new Uint8Array(o);
      for (; a.length - s.length >= 0; ) {
        const c = a[0];
        for (let l = 0; l < s.length; l++)
          a[l] ^= t.mul(s[l], c);
        let i = 0;
        for (; i < a.length && a[i] === 0; ) i++;
        a = a.slice(i);
      }
      return a;
    }, e.generateECPolynomial = function(o) {
      let s = new Uint8Array([1]);
      for (let a = 0; a < o; a++)
        s = e.mul(s, new Uint8Array([1, t.exp(a)]));
      return s;
    };
  })(sr)), sr;
}
var nr, Os;
function Xl() {
  if (Os) return nr;
  Os = 1;
  const e = Zl();
  function t(n) {
    this.genPoly = void 0, this.degree = n, this.degree && this.initialize(this.degree);
  }
  return t.prototype.initialize = function(o) {
    this.degree = o, this.genPoly = e.generateECPolynomial(this.degree);
  }, t.prototype.encode = function(o) {
    if (!this.genPoly)
      throw new Error("Encoder not initialized");
    const s = new Uint8Array(o.length + this.degree);
    s.set(o);
    const a = e.mod(s, this.genPoly), c = this.degree - a.length;
    if (c > 0) {
      const i = new Uint8Array(this.degree);
      return i.set(a, c), i;
    }
    return a;
  }, nr = t, nr;
}
var or = {}, ar = {}, ir = {}, Ws;
function co() {
  return Ws || (Ws = 1, ir.isValid = function(t) {
    return !isNaN(t) && t >= 1 && t <= 40;
  }), ir;
}
var Ne = {}, qs;
function lo() {
  if (qs) return Ne;
  qs = 1;
  const e = "[0-9]+", t = "[A-Z $%*+\\-./:]+";
  let n = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  n = n.replace(/u/g, "\\u");
  const o = "(?:(?![A-Z0-9 $%*+\\-./:]|" + n + `)(?:.|[\r
]))+`;
  Ne.KANJI = new RegExp(n, "g"), Ne.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), Ne.BYTE = new RegExp(o, "g"), Ne.NUMERIC = new RegExp(e, "g"), Ne.ALPHANUMERIC = new RegExp(t, "g");
  const s = new RegExp("^" + n + "$"), a = new RegExp("^" + e + "$"), c = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return Ne.testKanji = function(l) {
    return s.test(l);
  }, Ne.testNumeric = function(l) {
    return a.test(l);
  }, Ne.testAlphanumeric = function(l) {
    return c.test(l);
  }, Ne;
}
var js;
function je() {
  return js || (js = 1, (function(e) {
    const t = co(), n = lo();
    e.NUMERIC = {
      id: "Numeric",
      bit: 1,
      ccBits: [10, 12, 14]
    }, e.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 2,
      ccBits: [9, 11, 13]
    }, e.BYTE = {
      id: "Byte",
      bit: 4,
      ccBits: [8, 16, 16]
    }, e.KANJI = {
      id: "Kanji",
      bit: 8,
      ccBits: [8, 10, 12]
    }, e.MIXED = {
      bit: -1
    }, e.getCharCountIndicator = function(a, c) {
      if (!a.ccBits) throw new Error("Invalid mode: " + a);
      if (!t.isValid(c))
        throw new Error("Invalid version: " + c);
      return c >= 1 && c < 10 ? a.ccBits[0] : c < 27 ? a.ccBits[1] : a.ccBits[2];
    }, e.getBestModeForData = function(a) {
      return n.testNumeric(a) ? e.NUMERIC : n.testAlphanumeric(a) ? e.ALPHANUMERIC : n.testKanji(a) ? e.KANJI : e.BYTE;
    }, e.toString = function(a) {
      if (a && a.id) return a.id;
      throw new Error("Invalid mode");
    }, e.isValid = function(a) {
      return a && a.bit && a.ccBits;
    };
    function o(s) {
      if (typeof s != "string")
        throw new Error("Param is not a string");
      switch (s.toLowerCase()) {
        case "numeric":
          return e.NUMERIC;
        case "alphanumeric":
          return e.ALPHANUMERIC;
        case "kanji":
          return e.KANJI;
        case "byte":
          return e.BYTE;
        default:
          throw new Error("Unknown mode: " + s);
      }
    }
    e.from = function(a, c) {
      if (e.isValid(a))
        return a;
      try {
        return o(a);
      } catch {
        return c;
      }
    };
  })(ar)), ar;
}
var zs;
function Jl() {
  return zs || (zs = 1, (function(e) {
    const t = qe(), n = io(), o = zr(), s = je(), a = co(), c = 7973, i = t.getBCHDigit(c);
    function l(m, b, w) {
      for (let p = 1; p <= 40; p++)
        if (b <= e.getCapacity(p, w, m))
          return p;
    }
    function u(m, b) {
      return s.getCharCountIndicator(m, b) + 4;
    }
    function f(m, b) {
      let w = 0;
      return m.forEach(function(p) {
        const E = u(p.mode, b);
        w += E + p.getBitsLength();
      }), w;
    }
    function h(m, b) {
      for (let w = 1; w <= 40; w++)
        if (f(m, w) <= e.getCapacity(w, b, s.MIXED))
          return w;
    }
    e.from = function(b, w) {
      return a.isValid(b) ? parseInt(b, 10) : w;
    }, e.getCapacity = function(b, w, p) {
      if (!a.isValid(b))
        throw new Error("Invalid QR Code version");
      typeof p > "u" && (p = s.BYTE);
      const E = t.getSymbolTotalCodewords(b), A = n.getTotalCodewordsCount(b, w), C = (E - A) * 8;
      if (p === s.MIXED) return C;
      const N = C - u(p, b);
      switch (p) {
        case s.NUMERIC:
          return Math.floor(N / 10 * 3);
        case s.ALPHANUMERIC:
          return Math.floor(N / 11 * 2);
        case s.KANJI:
          return Math.floor(N / 13);
        case s.BYTE:
        default:
          return Math.floor(N / 8);
      }
    }, e.getBestVersionForData = function(b, w) {
      let p;
      const E = o.from(w, o.M);
      if (Array.isArray(b)) {
        if (b.length > 1)
          return h(b, E);
        if (b.length === 0)
          return 1;
        p = b[0];
      } else
        p = b;
      return l(p.mode, p.getLength(), E);
    }, e.getEncodedBits = function(b) {
      if (!a.isValid(b) || b < 7)
        throw new Error("Invalid QR Code version");
      let w = b << 12;
      for (; t.getBCHDigit(w) - i >= 0; )
        w ^= c << t.getBCHDigit(w) - i;
      return b << 12 | w;
    };
  })(or)), or;
}
var cr = {}, Vs;
function ed() {
  if (Vs) return cr;
  Vs = 1;
  const e = qe(), t = 1335, n = 21522, o = e.getBCHDigit(t);
  return cr.getEncodedBits = function(a, c) {
    const i = a.bit << 3 | c;
    let l = i << 10;
    for (; e.getBCHDigit(l) - o >= 0; )
      l ^= t << e.getBCHDigit(l) - o;
    return (i << 10 | l) ^ n;
  }, cr;
}
var lr = {}, dr, Hs;
function td() {
  if (Hs) return dr;
  Hs = 1;
  const e = je();
  function t(n) {
    this.mode = e.NUMERIC, this.data = n.toString();
  }
  return t.getBitsLength = function(o) {
    return 10 * Math.floor(o / 3) + (o % 3 ? o % 3 * 3 + 1 : 0);
  }, t.prototype.getLength = function() {
    return this.data.length;
  }, t.prototype.getBitsLength = function() {
    return t.getBitsLength(this.data.length);
  }, t.prototype.write = function(o) {
    let s, a, c;
    for (s = 0; s + 3 <= this.data.length; s += 3)
      a = this.data.substr(s, 3), c = parseInt(a, 10), o.put(c, 10);
    const i = this.data.length - s;
    i > 0 && (a = this.data.substr(s), c = parseInt(a, 10), o.put(c, i * 3 + 1));
  }, dr = t, dr;
}
var ur, $s;
function rd() {
  if ($s) return ur;
  $s = 1;
  const e = je(), t = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    " ",
    "$",
    "%",
    "*",
    "+",
    "-",
    ".",
    "/",
    ":"
  ];
  function n(o) {
    this.mode = e.ALPHANUMERIC, this.data = o;
  }
  return n.getBitsLength = function(s) {
    return 11 * Math.floor(s / 2) + 6 * (s % 2);
  }, n.prototype.getLength = function() {
    return this.data.length;
  }, n.prototype.getBitsLength = function() {
    return n.getBitsLength(this.data.length);
  }, n.prototype.write = function(s) {
    let a;
    for (a = 0; a + 2 <= this.data.length; a += 2) {
      let c = t.indexOf(this.data[a]) * 45;
      c += t.indexOf(this.data[a + 1]), s.put(c, 11);
    }
    this.data.length % 2 && s.put(t.indexOf(this.data[a]), 6);
  }, ur = n, ur;
}
var hr, Qs;
function sd() {
  if (Qs) return hr;
  Qs = 1;
  const e = je();
  function t(n) {
    this.mode = e.BYTE, typeof n == "string" ? this.data = new TextEncoder().encode(n) : this.data = new Uint8Array(n);
  }
  return t.getBitsLength = function(o) {
    return o * 8;
  }, t.prototype.getLength = function() {
    return this.data.length;
  }, t.prototype.getBitsLength = function() {
    return t.getBitsLength(this.data.length);
  }, t.prototype.write = function(n) {
    for (let o = 0, s = this.data.length; o < s; o++)
      n.put(this.data[o], 8);
  }, hr = t, hr;
}
var fr, Gs;
function nd() {
  if (Gs) return fr;
  Gs = 1;
  const e = je(), t = qe();
  function n(o) {
    this.mode = e.KANJI, this.data = o;
  }
  return n.getBitsLength = function(s) {
    return s * 13;
  }, n.prototype.getLength = function() {
    return this.data.length;
  }, n.prototype.getBitsLength = function() {
    return n.getBitsLength(this.data.length);
  }, n.prototype.write = function(o) {
    let s;
    for (s = 0; s < this.data.length; s++) {
      let a = t.toSJIS(this.data[s]);
      if (a >= 33088 && a <= 40956)
        a -= 33088;
      else if (a >= 57408 && a <= 60351)
        a -= 49472;
      else
        throw new Error(
          "Invalid SJIS character: " + this.data[s] + `
Make sure your charset is UTF-8`
        );
      a = (a >>> 8 & 255) * 192 + (a & 255), o.put(a, 13);
    }
  }, fr = n, fr;
}
var mr = { exports: {} }, Ks;
function od() {
  return Ks || (Ks = 1, (function(e) {
    var t = {
      single_source_shortest_paths: function(n, o, s) {
        var a = {}, c = {};
        c[o] = 0;
        var i = t.PriorityQueue.make();
        i.push(o, 0);
        for (var l, u, f, h, m, b, w, p, E; !i.empty(); ) {
          l = i.pop(), u = l.value, h = l.cost, m = n[u] || {};
          for (f in m)
            m.hasOwnProperty(f) && (b = m[f], w = h + b, p = c[f], E = typeof c[f] > "u", (E || p > w) && (c[f] = w, i.push(f, w), a[f] = u));
        }
        if (typeof s < "u" && typeof c[s] > "u") {
          var A = ["Could not find a path from ", o, " to ", s, "."].join("");
          throw new Error(A);
        }
        return a;
      },
      extract_shortest_path_from_predecessor_list: function(n, o) {
        for (var s = [], a = o; a; )
          s.push(a), n[a], a = n[a];
        return s.reverse(), s;
      },
      find_path: function(n, o, s) {
        var a = t.single_source_shortest_paths(n, o, s);
        return t.extract_shortest_path_from_predecessor_list(
          a,
          s
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(n) {
          var o = t.PriorityQueue, s = {}, a;
          n = n || {};
          for (a in o)
            o.hasOwnProperty(a) && (s[a] = o[a]);
          return s.queue = [], s.sorter = n.sorter || o.default_sorter, s;
        },
        default_sorter: function(n, o) {
          return n.cost - o.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(n, o) {
          var s = { value: n, cost: o };
          this.queue.push(s), this.queue.sort(this.sorter);
        },
        /**
         * Return the highest priority element in the queue.
         */
        pop: function() {
          return this.queue.shift();
        },
        empty: function() {
          return this.queue.length === 0;
        }
      }
    };
    e.exports = t;
  })(mr)), mr.exports;
}
var Ys;
function ad() {
  return Ys || (Ys = 1, (function(e) {
    const t = je(), n = td(), o = rd(), s = sd(), a = nd(), c = lo(), i = qe(), l = od();
    function u(A) {
      return unescape(encodeURIComponent(A)).length;
    }
    function f(A, C, N) {
      const x = [];
      let R;
      for (; (R = A.exec(N)) !== null; )
        x.push({
          data: R[0],
          index: R.index,
          mode: C,
          length: R[0].length
        });
      return x;
    }
    function h(A) {
      const C = f(c.NUMERIC, t.NUMERIC, A), N = f(c.ALPHANUMERIC, t.ALPHANUMERIC, A);
      let x, R;
      return i.isKanjiModeEnabled() ? (x = f(c.BYTE, t.BYTE, A), R = f(c.KANJI, t.KANJI, A)) : (x = f(c.BYTE_KANJI, t.BYTE, A), R = []), C.concat(N, x, R).sort(function(k, v) {
        return k.index - v.index;
      }).map(function(k) {
        return {
          data: k.data,
          mode: k.mode,
          length: k.length
        };
      });
    }
    function m(A, C) {
      switch (C) {
        case t.NUMERIC:
          return n.getBitsLength(A);
        case t.ALPHANUMERIC:
          return o.getBitsLength(A);
        case t.KANJI:
          return a.getBitsLength(A);
        case t.BYTE:
          return s.getBitsLength(A);
      }
    }
    function b(A) {
      return A.reduce(function(C, N) {
        const x = C.length - 1 >= 0 ? C[C.length - 1] : null;
        return x && x.mode === N.mode ? (C[C.length - 1].data += N.data, C) : (C.push(N), C);
      }, []);
    }
    function w(A) {
      const C = [];
      for (let N = 0; N < A.length; N++) {
        const x = A[N];
        switch (x.mode) {
          case t.NUMERIC:
            C.push([
              x,
              { data: x.data, mode: t.ALPHANUMERIC, length: x.length },
              { data: x.data, mode: t.BYTE, length: x.length }
            ]);
            break;
          case t.ALPHANUMERIC:
            C.push([
              x,
              { data: x.data, mode: t.BYTE, length: x.length }
            ]);
            break;
          case t.KANJI:
            C.push([
              x,
              { data: x.data, mode: t.BYTE, length: u(x.data) }
            ]);
            break;
          case t.BYTE:
            C.push([
              { data: x.data, mode: t.BYTE, length: u(x.data) }
            ]);
        }
      }
      return C;
    }
    function p(A, C) {
      const N = {}, x = { start: {} };
      let R = ["start"];
      for (let g = 0; g < A.length; g++) {
        const k = A[g], v = [];
        for (let y = 0; y < k.length; y++) {
          const S = k[y], L = "" + g + y;
          v.push(L), N[L] = { node: S, lastCount: 0 }, x[L] = {};
          for (let M = 0; M < R.length; M++) {
            const P = R[M];
            N[P] && N[P].node.mode === S.mode ? (x[P][L] = m(N[P].lastCount + S.length, S.mode) - m(N[P].lastCount, S.mode), N[P].lastCount += S.length) : (N[P] && (N[P].lastCount = S.length), x[P][L] = m(S.length, S.mode) + 4 + t.getCharCountIndicator(S.mode, C));
          }
        }
        R = v;
      }
      for (let g = 0; g < R.length; g++)
        x[R[g]].end = 0;
      return { map: x, table: N };
    }
    function E(A, C) {
      let N;
      const x = t.getBestModeForData(A);
      if (N = t.from(C, x), N !== t.BYTE && N.bit < x.bit)
        throw new Error('"' + A + '" cannot be encoded with mode ' + t.toString(N) + `.
 Suggested mode is: ` + t.toString(x));
      switch (N === t.KANJI && !i.isKanjiModeEnabled() && (N = t.BYTE), N) {
        case t.NUMERIC:
          return new n(A);
        case t.ALPHANUMERIC:
          return new o(A);
        case t.KANJI:
          return new a(A);
        case t.BYTE:
          return new s(A);
      }
    }
    e.fromArray = function(C) {
      return C.reduce(function(N, x) {
        return typeof x == "string" ? N.push(E(x, null)) : x.data && N.push(E(x.data, x.mode)), N;
      }, []);
    }, e.fromString = function(C, N) {
      const x = h(C, i.isKanjiModeEnabled()), R = w(x), g = p(R, N), k = l.find_path(g.map, "start", "end"), v = [];
      for (let y = 1; y < k.length - 1; y++)
        v.push(g.table[k[y]].node);
      return e.fromArray(b(v));
    }, e.rawSplit = function(C) {
      return e.fromArray(
        h(C, i.isKanjiModeEnabled())
      );
    };
  })(lr)), lr;
}
var Zs;
function id() {
  if (Zs) return Yt;
  Zs = 1;
  const e = qe(), t = zr(), n = Hl(), o = $l(), s = Ql(), a = Gl(), c = Kl(), i = io(), l = Xl(), u = Jl(), f = ed(), h = je(), m = ad();
  function b(g, k) {
    const v = g.size, y = a.getPositions(k);
    for (let S = 0; S < y.length; S++) {
      const L = y[S][0], M = y[S][1];
      for (let P = -1; P <= 7; P++)
        if (!(L + P <= -1 || v <= L + P))
          for (let I = -1; I <= 7; I++)
            M + I <= -1 || v <= M + I || (P >= 0 && P <= 6 && (I === 0 || I === 6) || I >= 0 && I <= 6 && (P === 0 || P === 6) || P >= 2 && P <= 4 && I >= 2 && I <= 4 ? g.set(L + P, M + I, !0, !0) : g.set(L + P, M + I, !1, !0));
    }
  }
  function w(g) {
    const k = g.size;
    for (let v = 8; v < k - 8; v++) {
      const y = v % 2 === 0;
      g.set(v, 6, y, !0), g.set(6, v, y, !0);
    }
  }
  function p(g, k) {
    const v = s.getPositions(k);
    for (let y = 0; y < v.length; y++) {
      const S = v[y][0], L = v[y][1];
      for (let M = -2; M <= 2; M++)
        for (let P = -2; P <= 2; P++)
          M === -2 || M === 2 || P === -2 || P === 2 || M === 0 && P === 0 ? g.set(S + M, L + P, !0, !0) : g.set(S + M, L + P, !1, !0);
    }
  }
  function E(g, k) {
    const v = g.size, y = u.getEncodedBits(k);
    let S, L, M;
    for (let P = 0; P < 18; P++)
      S = Math.floor(P / 3), L = P % 3 + v - 8 - 3, M = (y >> P & 1) === 1, g.set(S, L, M, !0), g.set(L, S, M, !0);
  }
  function A(g, k, v) {
    const y = g.size, S = f.getEncodedBits(k, v);
    let L, M;
    for (L = 0; L < 15; L++)
      M = (S >> L & 1) === 1, L < 6 ? g.set(L, 8, M, !0) : L < 8 ? g.set(L + 1, 8, M, !0) : g.set(y - 15 + L, 8, M, !0), L < 8 ? g.set(8, y - L - 1, M, !0) : L < 9 ? g.set(8, 15 - L - 1 + 1, M, !0) : g.set(8, 15 - L - 1, M, !0);
    g.set(y - 8, 8, 1, !0);
  }
  function C(g, k) {
    const v = g.size;
    let y = -1, S = v - 1, L = 7, M = 0;
    for (let P = v - 1; P > 0; P -= 2)
      for (P === 6 && P--; ; ) {
        for (let I = 0; I < 2; I++)
          if (!g.isReserved(S, P - I)) {
            let _ = !1;
            M < k.length && (_ = (k[M] >>> L & 1) === 1), g.set(S, P - I, _), L--, L === -1 && (M++, L = 7);
          }
        if (S += y, S < 0 || v <= S) {
          S -= y, y = -y;
          break;
        }
      }
  }
  function N(g, k, v) {
    const y = new n();
    v.forEach(function(I) {
      y.put(I.mode.bit, 4), y.put(I.getLength(), h.getCharCountIndicator(I.mode, g)), I.write(y);
    });
    const S = e.getSymbolTotalCodewords(g), L = i.getTotalCodewordsCount(g, k), M = (S - L) * 8;
    for (y.getLengthInBits() + 4 <= M && y.put(0, 4); y.getLengthInBits() % 8 !== 0; )
      y.putBit(0);
    const P = (M - y.getLengthInBits()) / 8;
    for (let I = 0; I < P; I++)
      y.put(I % 2 ? 17 : 236, 8);
    return x(y, g, k);
  }
  function x(g, k, v) {
    const y = e.getSymbolTotalCodewords(k), S = i.getTotalCodewordsCount(k, v), L = y - S, M = i.getBlocksCount(k, v), P = y % M, I = M - P, _ = Math.floor(y / M), F = Math.floor(L / M), W = F + 1, H = _ - F, V = new l(H);
    let D = 0;
    const U = new Array(M), K = new Array(M);
    let se = 0;
    const ue = new Uint8Array(g.buffer);
    for (let ee = 0; ee < M; ee++) {
      const ge = ee < I ? F : W;
      U[ee] = ue.slice(D, D + ge), K[ee] = V.encode(U[ee]), D += ge, se = Math.max(se, ge);
    }
    const Ee = new Uint8Array(y);
    let ye = 0, G, $;
    for (G = 0; G < se; G++)
      for ($ = 0; $ < M; $++)
        G < U[$].length && (Ee[ye++] = U[$][G]);
    for (G = 0; G < H; G++)
      for ($ = 0; $ < M; $++)
        Ee[ye++] = K[$][G];
    return Ee;
  }
  function R(g, k, v, y) {
    let S;
    if (Array.isArray(g))
      S = m.fromArray(g);
    else if (typeof g == "string") {
      let _ = k;
      if (!_) {
        const F = m.rawSplit(g);
        _ = u.getBestVersionForData(F, v);
      }
      S = m.fromString(g, _ || 40);
    } else
      throw new Error("Invalid data");
    const L = u.getBestVersionForData(S, v);
    if (!L)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!k)
      k = L;
    else if (k < L)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + L + `.
`
      );
    const M = N(k, v, S), P = e.getSymbolSize(k), I = new o(P);
    return b(I, k), w(I), p(I, k), A(I, v, 0), k >= 7 && E(I, k), C(I, M), isNaN(y) && (y = c.getBestMask(
      I,
      A.bind(null, I, v)
    )), c.applyMask(y, I), A(I, v, y), {
      modules: I,
      version: k,
      errorCorrectionLevel: v,
      maskPattern: y,
      segments: S
    };
  }
  return Yt.create = function(k, v) {
    if (typeof k > "u" || k === "")
      throw new Error("No input text");
    let y = t.M, S, L;
    return typeof v < "u" && (y = t.from(v.errorCorrectionLevel, t.M), S = u.from(v.version), L = c.from(v.maskPattern), v.toSJISFunc && e.setToSJISFunction(v.toSJISFunc)), R(k, S, y, L);
  }, Yt;
}
var pr = {}, gr = {}, Xs;
function uo() {
  return Xs || (Xs = 1, (function(e) {
    function t(n) {
      if (typeof n == "number" && (n = n.toString()), typeof n != "string")
        throw new Error("Color should be defined as hex string");
      let o = n.slice().replace("#", "").split("");
      if (o.length < 3 || o.length === 5 || o.length > 8)
        throw new Error("Invalid hex color: " + n);
      (o.length === 3 || o.length === 4) && (o = Array.prototype.concat.apply([], o.map(function(a) {
        return [a, a];
      }))), o.length === 6 && o.push("F", "F");
      const s = parseInt(o.join(""), 16);
      return {
        r: s >> 24 & 255,
        g: s >> 16 & 255,
        b: s >> 8 & 255,
        a: s & 255,
        hex: "#" + o.slice(0, 6).join("")
      };
    }
    e.getOptions = function(o) {
      o || (o = {}), o.color || (o.color = {});
      const s = typeof o.margin > "u" || o.margin === null || o.margin < 0 ? 4 : o.margin, a = o.width && o.width >= 21 ? o.width : void 0, c = o.scale || 4;
      return {
        width: a,
        scale: a ? 4 : c,
        margin: s,
        color: {
          dark: t(o.color.dark || "#000000ff"),
          light: t(o.color.light || "#ffffffff")
        },
        type: o.type,
        rendererOpts: o.rendererOpts || {}
      };
    }, e.getScale = function(o, s) {
      return s.width && s.width >= o + s.margin * 2 ? s.width / (o + s.margin * 2) : s.scale;
    }, e.getImageWidth = function(o, s) {
      const a = e.getScale(o, s);
      return Math.floor((o + s.margin * 2) * a);
    }, e.qrToImageData = function(o, s, a) {
      const c = s.modules.size, i = s.modules.data, l = e.getScale(c, a), u = Math.floor((c + a.margin * 2) * l), f = a.margin * l, h = [a.color.light, a.color.dark];
      for (let m = 0; m < u; m++)
        for (let b = 0; b < u; b++) {
          let w = (m * u + b) * 4, p = a.color.light;
          if (m >= f && b >= f && m < u - f && b < u - f) {
            const E = Math.floor((m - f) / l), A = Math.floor((b - f) / l);
            p = h[i[E * c + A] ? 1 : 0];
          }
          o[w++] = p.r, o[w++] = p.g, o[w++] = p.b, o[w] = p.a;
        }
    };
  })(gr)), gr;
}
var Js;
function cd() {
  return Js || (Js = 1, (function(e) {
    const t = uo();
    function n(s, a, c) {
      s.clearRect(0, 0, a.width, a.height), a.style || (a.style = {}), a.height = c, a.width = c, a.style.height = c + "px", a.style.width = c + "px";
    }
    function o() {
      try {
        return document.createElement("canvas");
      } catch {
        throw new Error("You need to specify a canvas element");
      }
    }
    e.render = function(a, c, i) {
      let l = i, u = c;
      typeof l > "u" && (!c || !c.getContext) && (l = c, c = void 0), c || (u = o()), l = t.getOptions(l);
      const f = t.getImageWidth(a.modules.size, l), h = u.getContext("2d"), m = h.createImageData(f, f);
      return t.qrToImageData(m.data, a, l), n(h, u, f), h.putImageData(m, 0, 0), u;
    }, e.renderToDataURL = function(a, c, i) {
      let l = i;
      typeof l > "u" && (!c || !c.getContext) && (l = c, c = void 0), l || (l = {});
      const u = e.render(a, c, l), f = l.type || "image/png", h = l.rendererOpts || {};
      return u.toDataURL(f, h.quality);
    };
  })(pr)), pr;
}
var wr = {}, en;
function ld() {
  if (en) return wr;
  en = 1;
  const e = uo();
  function t(s, a) {
    const c = s.a / 255, i = a + '="' + s.hex + '"';
    return c < 1 ? i + " " + a + '-opacity="' + c.toFixed(2).slice(1) + '"' : i;
  }
  function n(s, a, c) {
    let i = s + a;
    return typeof c < "u" && (i += " " + c), i;
  }
  function o(s, a, c) {
    let i = "", l = 0, u = !1, f = 0;
    for (let h = 0; h < s.length; h++) {
      const m = Math.floor(h % a), b = Math.floor(h / a);
      !m && !u && (u = !0), s[h] ? (f++, h > 0 && m > 0 && s[h - 1] || (i += u ? n("M", m + c, 0.5 + b + c) : n("m", l, 0), l = 0, u = !1), m + 1 < a && s[h + 1] || (i += n("h", f), f = 0)) : l++;
    }
    return i;
  }
  return wr.render = function(a, c, i) {
    const l = e.getOptions(c), u = a.modules.size, f = a.modules.data, h = u + l.margin * 2, m = l.color.light.a ? "<path " + t(l.color.light, "fill") + ' d="M0 0h' + h + "v" + h + 'H0z"/>' : "", b = "<path " + t(l.color.dark, "stroke") + ' d="' + o(f, u, l.margin) + '"/>', w = 'viewBox="0 0 ' + h + " " + h + '"', E = '<svg xmlns="http://www.w3.org/2000/svg" ' + (l.width ? 'width="' + l.width + '" height="' + l.width + '" ' : "") + w + ' shape-rendering="crispEdges">' + m + b + `</svg>
`;
    return typeof i == "function" && i(null, E), E;
  }, wr;
}
var tn;
function dd() {
  if (tn) return Qe;
  tn = 1;
  const e = Vl(), t = id(), n = cd(), o = ld();
  function s(a, c, i, l, u) {
    const f = [].slice.call(arguments, 1), h = f.length, m = typeof f[h - 1] == "function";
    if (!m && !e())
      throw new Error("Callback required as last argument");
    if (m) {
      if (h < 2)
        throw new Error("Too few arguments provided");
      h === 2 ? (u = i, i = c, c = l = void 0) : h === 3 && (c.getContext && typeof u > "u" ? (u = l, l = void 0) : (u = l, l = i, i = c, c = void 0));
    } else {
      if (h < 1)
        throw new Error("Too few arguments provided");
      return h === 1 ? (i = c, c = l = void 0) : h === 2 && !c.getContext && (l = i, i = c, c = void 0), new Promise(function(b, w) {
        try {
          const p = t.create(i, l);
          b(a(p, c, l));
        } catch (p) {
          w(p);
        }
      });
    }
    try {
      const b = t.create(i, l);
      u(null, a(b, c, l));
    } catch (b) {
      u(b);
    }
  }
  return Qe.create = t.create, Qe.toCanvas = s.bind(null, n.render), Qe.toDataURL = s.bind(null, n.renderToDataURL), Qe.toString = s.bind(null, function(a, c, i) {
    return o.render(a, i);
  }), Qe;
}
var ud = dd();
const hd = /* @__PURE__ */ En(ud);
function fd({ value: e, size: t = 200, alt: n = "QR code", className: o = "" }) {
  const s = J(null), [a, c] = B(null);
  return O(() => {
    !s.current || !e || hd.toCanvas(s.current, e, {
      width: t,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
      errorCorrectionLevel: "M"
    }).then(() => {
      c(null);
    }).catch((i) => {
      c(i instanceof Error ? i.message : "Failed to generate QR code");
    });
  }, [e, t]), a ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-qr-error ${o}`,
      style: { width: t, height: t },
      role: "img",
      "aria-label": n,
      children: /* @__PURE__ */ r("p", { children: "Failed to generate QR code" })
    }
  ) : /* @__PURE__ */ r(
    "canvas",
    {
      ref: s,
      className: `cedros-totp-qr-image ${o}`,
      role: "img",
      "aria-label": n,
      style: { borderRadius: "0.5rem" }
    }
  );
}
function ho() {
  const { config: e, _internal: t } = ne(), [n, o] = B(null), [s, a] = B("idle"), [c, i] = B(null), [l, u] = B(!1), [f, h] = B(null), m = z(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t]
  ), b = T(async () => {
    u(!0), h(null);
    try {
      const x = await m.get("/mfa/status");
      return o(x), x;
    } catch (x) {
      const R = q(x, "Unable to load two-factor authentication status. Please try again.");
      throw h(R), R;
    } finally {
      u(!1);
    }
  }, [m]), w = T(async () => {
    u(!0), h(null), a("loading");
    try {
      const x = await m.post("/mfa/setup", {});
      return i(x), a("setup"), x;
    } catch (x) {
      const R = q(x, "Unable to start two-factor setup. Please try again.");
      throw h(R), a("error"), R;
    } finally {
      u(!1);
    }
  }, [m]), p = T(
    async (x) => {
      if (!/^\d{6}$/.test(x)) {
        const R = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw h(R), R;
      }
      u(!0), h(null), a("verifying");
      try {
        await m.post("/mfa/enable", { code: x }), a("success");
        try {
          const R = await m.get("/mfa/status");
          o(R);
        } catch {
          o({ enabled: !0, recoveryCodesRemaining: 0 });
        }
      } catch (R) {
        const g = q(R, "Incorrect verification code. Please check and try again.");
        throw h(g), a("error"), g;
      } finally {
        u(!1);
      }
    },
    [m]
  ), E = T(
    async (x) => {
      if (!x) {
        const R = {
          code: "VALIDATION_ERROR",
          message: "Please enter your password"
        };
        throw h(R), R;
      }
      u(!0), h(null);
      try {
        await m.post("/mfa/disable", { password: x }), o({ enabled: !1, recoveryCodesRemaining: 0 }), i(null), a("idle");
      } catch (R) {
        const g = q(R, "Unable to disable two-factor authentication. Please try again.");
        throw h(g), g;
      } finally {
        u(!1);
      }
    },
    [m]
  ), A = T(
    async (x) => {
      if (!/^\d{6}$/.test(x)) {
        const R = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw h(R), R;
      }
      u(!0), h(null);
      try {
        return await m.post(
          "/mfa/recovery-codes/regenerate",
          { code: x }
        );
      } catch (R) {
        const g = q(R, "Unable to regenerate recovery codes. Please try again.");
        throw h(g), g;
      } finally {
        u(!1);
      }
    },
    [m]
  ), C = T(() => h(null), []), N = T(() => {
    h(null), i(null), a("idle"), u(!1);
  }, []);
  return {
    status: n,
    setupState: s,
    setupData: c,
    isLoading: l,
    error: f,
    getStatus: b,
    beginSetup: w,
    enableTotp: p,
    disableTotp: E,
    regenerateBackupCodes: A,
    clearError: C,
    reset: N
  };
}
function fo({ onSuccess: e, onCancel: t, className: n = "" }) {
  const { setupState: o, setupData: s, isLoading: a, error: c, beginSetup: i, enableTotp: l, clearError: u, reset: f } = ho(), [h, m] = B("qr"), [b, w] = B(""), [p, E] = B(!1), [A, C] = B(!1), N = J(null);
  O(() => {
    o === "idle" && i().catch(() => {
    });
  }, [o, i]), O(() => {
    o === "success" && e?.();
  }, [o, e]);
  const x = async () => {
    s?.secret && (await navigator.clipboard.writeText(s.secret), E(!0), N.current !== null && window.clearTimeout(N.current), N.current = window.setTimeout(() => E(!1), 2e3));
  }, R = async () => {
    if (s?.recoveryCodes) {
      const v = s.recoveryCodes.join(`
`);
      await navigator.clipboard.writeText(v);
    }
  }, g = async () => {
    try {
      await l(b);
    } catch {
      w("");
    }
  }, k = () => {
    f(), t?.();
  };
  return O(() => () => {
    N.current !== null && (window.clearTimeout(N.current), N.current = null);
  }, []), o === "loading" || o === "idle" && a ? /* @__PURE__ */ r("div", { className: `cedros-totp-setup ${n}`, children: /* @__PURE__ */ r("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ r(Q, { size: "lg", label: "Setting up two-factor authentication" }) }) }) : o === "error" && !s ? /* @__PURE__ */ d("div", { className: `cedros-totp-setup ${n}`, children: [
    /* @__PURE__ */ r(re, { error: c, onDismiss: u }),
    /* @__PURE__ */ d("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: k,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: () => i(),
          children: "Try again"
        }
      )
    ] })
  ] }) : o === "success" ? /* @__PURE__ */ r("div", { className: `cedros-totp-setup ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-success", children: [
    /* @__PURE__ */ d(
      "svg",
      {
        className: "cedros-totp-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ r("circle", { cx: "24", cy: "24", r: "22", stroke: "var(--cedros-success)", strokeWidth: "2" }),
          /* @__PURE__ */ r(
            "path",
            {
              d: "M14 24l7 7 13-13",
              stroke: "var(--cedros-success)",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Two-factor authentication enabled" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Your account is now protected with an additional layer of security." })
  ] }) }) : s ? /* @__PURE__ */ d("div", { className: `cedros-totp-setup ${n}`, children: [
    h === "qr" && /* @__PURE__ */ d("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Scan QR code" }),
      /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Use your authenticator app to scan this QR code." }),
      /* @__PURE__ */ r("div", { className: "cedros-totp-qr", children: /* @__PURE__ */ r(fd, { value: s.otpauthUri, size: 200, alt: "QR code for authenticator app" }) }),
      /* @__PURE__ */ d("div", { className: "cedros-totp-manual", children: [
        /* @__PURE__ */ r("p", { className: "cedros-totp-manual-label", children: "Or enter this code manually:" }),
        /* @__PURE__ */ d("div", { className: "cedros-totp-secret", children: [
          /* @__PURE__ */ r("code", { className: "cedros-totp-secret-code", children: s.secret }),
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-ghost cedros-button-sm",
              onClick: x,
              "aria-label": "Copy secret",
              children: p ? "Copied!" : "Copy"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-totp-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-md",
            onClick: k,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: () => m("backup"),
            children: "Continue"
          }
        )
      ] })
    ] }),
    h === "backup" && /* @__PURE__ */ d("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Save recovery codes" }),
      /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. You can use them to access your account if you lose your authenticator device." }),
      /* @__PURE__ */ r("div", { className: "cedros-totp-backup-codes", children: s.recoveryCodes.map((v, y) => /* @__PURE__ */ r("code", { className: "cedros-totp-backup-code", children: v }, y)) }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
          onClick: R,
          children: "Copy all codes"
        }
      ),
      /* @__PURE__ */ d("label", { className: "cedros-checkbox-label cedros-totp-confirm", children: [
        /* @__PURE__ */ r(
          "input",
          {
            type: "checkbox",
            className: "cedros-checkbox",
            checked: A,
            onChange: (v) => C(v.target.checked)
          }
        ),
        /* @__PURE__ */ r("span", { className: "cedros-checkbox-text", children: "I have saved these recovery codes" })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-totp-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-md",
            onClick: () => m("qr"),
            children: "Back"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: () => m("verify"),
            disabled: !A,
            children: "Continue"
          }
        )
      ] })
    ] }),
    h === "verify" && /* @__PURE__ */ d("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Verify setup" }),
      /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Enter the 6-digit code from your authenticator app to complete setup." }),
      /* @__PURE__ */ r(
        yn,
        {
          value: b,
          onChange: w,
          onComplete: g,
          disabled: a,
          error: c?.message,
          autoFocus: !0
        }
      ),
      /* @__PURE__ */ d("div", { className: "cedros-totp-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-md",
            onClick: () => m("backup"),
            disabled: a,
            children: "Back"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: g,
            disabled: a || b.length !== 6,
            children: a ? /* @__PURE__ */ d(X, { children: [
              /* @__PURE__ */ r(Q, { size: "sm" }),
              /* @__PURE__ */ r("span", { children: "Verifying..." })
            ] }) : "Enable 2FA"
          }
        )
      ] })
    ] })
  ] }) : null;
}
function md({ onStatusChange: e, className: t = "" }) {
  const { status: n, isLoading: o, error: s, getStatus: a, disableTotp: c, regenerateBackupCodes: i, clearError: l } = ho(), [u, f] = B("status"), [h, m] = B(""), [b, w] = B(""), [p, E] = B(null), [A, C] = B(!1), [N, x] = B(null);
  O(() => {
    a().catch(() => {
    });
  }, [a]);
  const R = T(() => {
    f("status"), e?.(!0);
  }, [e]), g = async () => {
    C(!0), x(null);
    try {
      await c(h), f("status"), m(""), e?.(!1);
    } catch (y) {
      x(y instanceof Error ? y.message : "Failed to disable 2FA"), m("");
    } finally {
      C(!1);
    }
  }, k = async () => {
    C(!0), x(null);
    try {
      const y = await i(b);
      E(y.recoveryCodes), w("");
    } catch (y) {
      x(y instanceof Error ? y.message : "Failed to regenerate codes"), w("");
    } finally {
      C(!1);
    }
  }, v = async () => {
    p && await navigator.clipboard.writeText(p.join(`
`));
  };
  return o && !n ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ r("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ r(Q, { size: "md", label: "Loading security settings" }) }) }) : s && !n ? /* @__PURE__ */ d("div", { className: `cedros-totp-settings ${t}`, children: [
    /* @__PURE__ */ r(re, { error: s, onDismiss: l }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => a(),
        children: "Retry"
      }
    )
  ] }) : u === "setup" ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ r(fo, { onSuccess: R, onCancel: () => f("status") }) }) : u === "disable" ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Disable two-factor authentication" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description cedros-totp-warning", children: "This will make your account less secure. Enter your password to confirm." }),
    N && /* @__PURE__ */ r("div", { className: "cedros-totp-error", children: /* @__PURE__ */ r(
      re,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => x(null)
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ r(
      pe,
      {
        label: "Password",
        placeholder: "Enter your password",
        value: h,
        onChange: (y) => m(y.target.value),
        disabled: A,
        autoFocus: !0
      }
    ) }),
    /* @__PURE__ */ d("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: () => {
            f("status"), m(""), x(null);
          },
          disabled: A,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive cedros-button-md",
          onClick: g,
          disabled: A || h.length === 0,
          children: A ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Q, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Disabling..." })
          ] }) : "Disable 2FA"
        }
      )
    ] })
  ] }) }) : u === "regenerate" ? p ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "New recovery codes" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. Your old codes are no longer valid." }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-backup-codes", children: p.map((y, S) => /* @__PURE__ */ r("code", { className: "cedros-totp-backup-code", children: y }, S)) }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
        onClick: v,
        children: "Copy all codes"
      }
    ),
    /* @__PURE__ */ r("div", { className: "cedros-totp-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => {
          f("status"), E(null);
        },
        children: "Done"
      }
    ) })
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Regenerate recovery codes" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "This will invalidate all existing recovery codes. Enter your authenticator code to confirm." }),
    N && /* @__PURE__ */ r("div", { className: "cedros-totp-error", children: /* @__PURE__ */ r(
      re,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => x(null)
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ r(
      yn,
      {
        value: b,
        onChange: w,
        onComplete: k,
        disabled: A,
        autoFocus: !0
      }
    ) }),
    /* @__PURE__ */ d("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: () => {
            f("status"), w(""), x(null);
          },
          disabled: A,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: k,
          disabled: A || b.length !== 6,
          children: A ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Q, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Regenerating..." })
          ] }) : "Regenerate codes"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ d("div", { className: "cedros-totp-status-header", children: [
      /* @__PURE__ */ d("div", { className: "cedros-totp-status-info", children: [
        /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Two-factor authentication" }),
        /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Add an extra layer of security to your account by requiring a verification code from your authenticator app when signing in with email and password. Other sign-in methods (Google, Apple, passkeys) use their own built-in verification." })
      ] }),
      /* @__PURE__ */ r(
        "div",
        {
          className: `cedros-totp-badge ${n?.enabled ? "cedros-totp-badge-enabled" : "cedros-totp-badge-disabled"}`,
          children: n?.enabled ? "Enabled" : "Disabled"
        }
      )
    ] }),
    n?.enabled ? /* @__PURE__ */ d("div", { className: "cedros-totp-enabled-actions", children: [
      /* @__PURE__ */ d("div", { className: "cedros-totp-description", style: { marginTop: "0.25rem" }, children: [
        "Recovery codes remaining: ",
        /* @__PURE__ */ r("strong", { children: n.recoveryCodesRemaining })
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: () => f("regenerate"),
          children: "Regenerate recovery codes"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive-outline cedros-button-md",
          onClick: () => f("disable"),
          children: "Disable 2FA"
        }
      )
    ] }) : /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => f("setup"),
        children: "Enable two-factor authentication"
      }
    )
  ] }) });
}
class pd {
  client;
  constructor(t, n, o, s) {
    this.client = new ce({ baseUrl: t, timeoutMs: n, retryAttempts: o, getAccessToken: s });
  }
  /**
   * Change the user's password
   *
   * Requires the current password for verification. Also revokes all other sessions
   * and re-encrypts wallet Share A if using password-based wallet protection.
   */
  async changePassword(t) {
    try {
      return await this.client.post("/auth/change-password", t);
    } catch (n) {
      throw q(n, "Failed to change password");
    }
  }
  /**
   * Update user profile (name, picture)
   *
   * NOTE: Requires PATCH /auth/me endpoint on the backend.
   * If not implemented, returns a rejection.
   */
  async updateProfile(t) {
    try {
      return await this.client.patch("/auth/me", t);
    } catch (n) {
      throw q(n, "Failed to update profile");
    }
  }
}
function Rt() {
  const { config: e, authState: t, _internal: n } = ne(), [o, s] = B(!1), [a, c] = B(null), i = z(
    () => new pd(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      n?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, n]
  ), l = T(() => {
    c(null);
  }, []), u = T(
    async (h) => {
      if (t !== "authenticated")
        throw new Error("Must be authenticated to update profile");
      s(!0), c(null);
      try {
        return await i.updateProfile(h);
      } catch (m) {
        const b = m instanceof Error ? m : new Error("Failed to update profile");
        throw c(b), b;
      } finally {
        s(!1);
      }
    },
    [t, i]
  ), f = T(
    async (h) => {
      if (t !== "authenticated")
        throw new Error("Must be authenticated to change password");
      s(!0), c(null);
      try {
        await i.changePassword(h);
      } catch (m) {
        const b = m instanceof Error ? m : new Error("Failed to change password");
        throw c(b), b;
      } finally {
        s(!1);
      }
    },
    [t, i]
  );
  return {
    isLoading: o,
    error: a,
    updateProfile: u,
    changePassword: f,
    clearError: l
  };
}
function sh({
  onPasswordChange: e,
  onClose: t,
  className: n = ""
}) {
  const { user: o } = St(), { isLoading: s, error: a, changePassword: c, clearError: i } = Rt(), [l, u] = B("main"), [f, h] = B(""), [m, b] = B(""), [w, p] = B(""), [E, A] = B(null), [C, N] = B(null), x = Bt(m), R = m === w, g = f.length > 0 && m.length > 0 && w.length > 0 && x.isValid && R, k = T(async () => {
    if (g) {
      A(null), N(null);
      try {
        await c({
          currentPassword: f,
          newPassword: m
        }), h(""), b(""), p(""), N("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => {
          u("main"), N(null);
        }, 2e3);
      } catch (S) {
        A(S instanceof Error ? S.message : "Failed to change password");
      }
    }
  }, [g, f, m, c, e]), v = T(() => {
    u("main"), h(""), b(""), p(""), A(null), i();
  }, [i]), y = () => o?.name ? o.name.split(" ").map((S) => S[0]).join("").toUpperCase().slice(0, 2) : o?.email ? o.email[0].toUpperCase() : "?";
  return l === "change-password" ? /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (E || a) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      re,
      {
        error: { code: "UNKNOWN_ERROR", message: E || a?.message || "" },
        onDismiss: () => {
          A(null), i();
        }
      }
    ) }),
    C && /* @__PURE__ */ d("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ r("span", { className: "cedros-profile-success-icon", children: "✓" }),
      C
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        pe,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: f,
          onChange: (S) => h(S.target.value),
          disabled: s,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        pe,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: m,
          onChange: (S) => b(S.target.value),
          disabled: s,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        pe,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: w,
          onChange: (S) => p(S.target.value),
          disabled: s,
          error: w.length > 0 && !R ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: v,
          disabled: s,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: k,
          disabled: s || !g,
          children: s ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Q, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ d("div", { className: "cedros-profile-header", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-avatar-container", children: o?.picture ? /* @__PURE__ */ r(
        "img",
        {
          src: o.picture,
          alt: o.name || "Profile",
          className: "cedros-profile-avatar"
        }
      ) : /* @__PURE__ */ r("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: y() }) }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-info", children: [
        /* @__PURE__ */ r("h3", { className: "cedros-profile-name", children: o?.name || "User" }),
        /* @__PURE__ */ r("p", { className: "cedros-profile-email", children: o?.email })
      ] })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-profile-section-title", children: "Account" }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-row", children: /* @__PURE__ */ d("div", { className: "cedros-profile-row-content", children: [
        /* @__PURE__ */ r("span", { className: "cedros-profile-row-label", children: "Email" }),
        /* @__PURE__ */ r("span", { className: "cedros-profile-row-value", children: o?.email || "Not set" })
      ] }) }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ d("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-label", children: "Password" }),
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-value", children: "••••••••" })
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => u("change-password"),
            children: "Change"
          }
        )
      ] })
    ] }),
    t && /* @__PURE__ */ r("div", { className: "cedros-profile-footer", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md",
        onClick: t,
        children: "Close"
      }
    ) })
  ] }) });
}
class gd {
  client;
  constructor(t, n, o, s) {
    this.client = new ce({ baseUrl: t, timeoutMs: n, retryAttempts: o, getAccessToken: s });
  }
  /**
   * List all credentials linked to the current user
   */
  async listCredentials() {
    try {
      return (await this.client.get("/credentials")).credentials;
    } catch (t) {
      throw q(t, "Failed to list credentials");
    }
  }
  /**
   * Unlink (delete) a credential by ID.
   * The server prevents removing the last primary credential.
   */
  async unlinkCredential(t) {
    try {
      await this.client.delete(`/credentials/${encodeURIComponent(t)}`);
    } catch (n) {
      throw q(n, "Failed to unlink credential");
    }
  }
}
function mo() {
  const { config: e, authState: t, _internal: n } = ne(), [o, s] = B([]), [a, c] = B(!1), [i, l] = B(null), u = z(
    () => new gd(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      n?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, n]
  ), f = T(() => {
    l(null);
  }, []), h = T(async () => {
    if (t !== "authenticated") {
      s([]);
      return;
    }
    c(!0), l(null);
    try {
      const b = await u.listCredentials();
      s(b);
    } catch (b) {
      l(b);
    } finally {
      c(!1);
    }
  }, [t, u]);
  O(() => {
    t === "authenticated" ? h() : s([]);
  }, [t, h]);
  const m = T(
    async (b) => {
      c(!0), l(null);
      try {
        await u.unlinkCredential(b), await h();
      } catch (w) {
        throw l(w), w;
      } finally {
        c(!1);
      }
    },
    [u, h]
  );
  return {
    credentials: o,
    isLoading: a,
    error: i,
    fetchCredentials: h,
    unlinkCredential: m,
    clearError: f
  };
}
function wd({
  onPasswordChange: e,
  onCancel: t,
  className: n = ""
}) {
  const { isLoading: o, error: s, changePassword: a, clearError: c } = Rt(), [i, l] = B(""), [u, f] = B(""), [h, m] = B(""), [b, w] = B(null), [p, E] = B(null), A = Bt(u), C = u === h, N = i.length > 0 && u.length > 0 && h.length > 0 && A.isValid && C, x = T(async () => {
    if (N) {
      w(null), E(null);
      try {
        await a({ currentPassword: i, newPassword: u }), l(""), f(""), m(""), E("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => t(), 2e3);
      } catch (g) {
        w(g instanceof Error ? g.message : "Failed to change password");
      }
    }
  }, [N, i, u, a, e, t]), R = T(() => {
    w(null), c(), t();
  }, [c, t]);
  return /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (b || s) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      re,
      {
        error: { code: "UNKNOWN_ERROR", message: b || s?.message || "" },
        onDismiss: () => {
          w(null), c();
        }
      }
    ) }),
    p && /* @__PURE__ */ d("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ r("span", { className: "cedros-profile-success-icon", children: "✓" }),
      p
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        pe,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: i,
          onChange: (g) => l(g.target.value),
          disabled: o,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        pe,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: u,
          onChange: (g) => f(g.target.value),
          disabled: o,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        pe,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: h,
          onChange: (g) => m(g.target.value),
          disabled: o,
          error: h.length > 0 && !C ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: R,
          disabled: o,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: x,
          disabled: o || !N,
          children: o ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Q, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) });
}
function bd({ onPasswordChange: e, className: t = "" }) {
  const { user: n, refreshUser: o } = St(), { isLoading: s, error: a, updateProfile: c, clearError: i } = Rt(), { credentials: l } = mo(), {
    forgotPassword: u,
    isLoading: f,
    isSuccess: h,
    reset: m
  } = qr(), b = l.some((y) => y.credentialType === "password"), [w, p] = B("view"), [E, A] = B(""), [C, N] = B(null), x = () => n?.name ? n.name.split(" ").map((y) => y[0]).join("").toUpperCase().slice(0, 2) : n?.email ? n.email[0].toUpperCase() : "?", R = T(() => {
    A(n?.name || ""), p("edit"), N(null);
  }, [n?.name]), g = T(async () => {
    const y = E.trim();
    if (y) {
      N(null);
      try {
        await c({ name: y }), await o(), p("view");
      } catch (S) {
        N(S instanceof Error ? S.message : "Failed to update name");
      }
    }
  }, [E, c, o]), k = T(() => {
    p("view"), A(""), N(null), i();
  }, [i]), v = T(async () => {
    if (n?.email) {
      N(null);
      try {
        await u(n.email);
      } catch (y) {
        N(y instanceof Error ? y.message : "Failed to send password setup email");
      }
    }
  }, [n?.email, u]);
  return w === "change-password" ? /* @__PURE__ */ r(
    wd,
    {
      onPasswordChange: e,
      onCancel: () => p("view"),
      className: t
    }
  ) : /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ d("div", { className: "cedros-profile-header", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-avatar-container", children: n?.picture ? /* @__PURE__ */ r(
        "img",
        {
          src: n.picture,
          alt: n.name || "Profile",
          className: "cedros-profile-avatar"
        }
      ) : /* @__PURE__ */ r("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: x() }) }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-info", children: [
        w === "edit" ? /* @__PURE__ */ d("div", { className: "cedros-profile-name-edit", children: [
          /* @__PURE__ */ r(
            "input",
            {
              type: "text",
              className: "cedros-input",
              value: E,
              onChange: (y) => A(y.target.value),
              disabled: s,
              autoFocus: !0,
              onKeyDown: (y) => {
                y.key === "Enter" && g(), y.key === "Escape" && k();
              }
            }
          ),
          /* @__PURE__ */ d("div", { className: "cedros-profile-name-edit-actions", children: [
            /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary cedros-button-sm",
                onClick: g,
                disabled: s || !E.trim(),
                children: s ? /* @__PURE__ */ r(Q, { size: "sm" }) : "Save"
              }
            ),
            /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-outline cedros-button-sm",
                onClick: k,
                disabled: s,
                children: "Cancel"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ d("div", { className: "cedros-profile-name-row", children: [
          /* @__PURE__ */ r("h3", { className: "cedros-profile-name", children: n?.name || "User" }),
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-profile-edit-btn",
              onClick: R,
              title: "Edit name",
              "aria-label": "Edit name",
              children: /* @__PURE__ */ r(yd, {})
            }
          )
        ] }),
        /* @__PURE__ */ r("p", { className: "cedros-profile-email", children: n?.email })
      ] })
    ] }),
    (C || a) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      re,
      {
        error: { code: "UNKNOWN_ERROR", message: C || a?.message || "" },
        onDismiss: () => {
          N(null), i();
        }
      }
    ) }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-profile-section-title", children: "Account" }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-row", children: /* @__PURE__ */ d("div", { className: "cedros-profile-row-content", children: [
        /* @__PURE__ */ r("span", { className: "cedros-profile-row-label", children: "Email" }),
        /* @__PURE__ */ r("span", { className: "cedros-profile-row-value", children: n?.email || "Not set" })
      ] }) }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ d("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-label", children: "Password" }),
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-value", children: b ? "••••••••" : "Not set" })
        ] }),
        b ? /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => {
              p("change-password"), N(null);
            },
            children: "Change"
          }
        ) : h ? /* @__PURE__ */ d("span", { className: "cedros-profile-row-sent", children: [
          "Check your email",
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-profile-row-sent-dismiss",
              onClick: m,
              "aria-label": "Dismiss",
              children: "×"
            }
          )
        ] }) : /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: v,
            disabled: f,
            children: f ? /* @__PURE__ */ r(Q, { size: "sm" }) : "Add password"
          }
        )
      ] })
    ] })
  ] }) });
}
function yd() {
  return /* @__PURE__ */ d("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r(
      "path",
      {
        d: "M16.474 5.408l2.118 2.117m-.756-3.982L12.109 9.27a2.118 2.118 0 00-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 10-2.621-2.621z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ r(
      "path",
      {
        d: "M19 15v3a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h3",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    )
  ] });
}
const po = {
  password: "Email & Password",
  oauth_google: "Google",
  oauth_apple: "Apple",
  solana: "Solana Wallet",
  webauthn_passkey: "Passkey",
  webauthn_security_key: "Security Key",
  totp: "Authenticator App (2FA)",
  sso_oidc: "Single Sign-On"
};
function Ad({
  onLinkGoogle: e,
  onLinkApple: t,
  onAddPasskey: n,
  onLinkSolana: o,
  className: s = ""
}) {
  const { credentials: a, isLoading: c, error: i, unlinkCredential: l, clearError: u, fetchCredentials: f } = mo(), { registerPasskey: h, isSupported: m } = no(), [b, w] = B(null), [p, E] = B(!1), A = T(async () => {
    if (n) {
      n();
      return;
    }
    E(!0);
    try {
      await h(), await f();
    } catch {
    } finally {
      E(!1);
    }
  }, [n, h, f]), C = T(
    async (y) => {
      const S = y.label || po[y.credentialType];
      if (window.confirm(
        `Remove "${S}" as a sign-in method? You won't be able to sign in with it anymore.`
      )) {
        w(y.id);
        try {
          await l(y.id);
        } catch {
        } finally {
          w(null);
        }
      }
    },
    [l]
  ), N = new Set(a.map((y) => y.credentialType)), x = e && !N.has("oauth_google"), R = t && !N.has("oauth_apple"), g = (n || m) && !N.has("webauthn_passkey"), k = o && !N.has("solana"), v = x || R || g || k;
  return c && a.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-linked-accounts ${s}`, children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { children: "Loading linked accounts..." })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-linked-accounts ${s}`, children: [
    i && /* @__PURE__ */ r(
      re,
      {
        error: { code: "UNKNOWN_ERROR", message: i.message },
        onDismiss: u
      }
    ),
    a.length === 0 && !c && /* @__PURE__ */ r("p", { className: "cedros-linked-accounts-empty", children: "No linked sign-in methods found." }),
    a.length > 0 && /* @__PURE__ */ r("ul", { className: "cedros-linked-credential-list", children: a.map((y) => /* @__PURE__ */ r(
      vd,
      {
        credential: y,
        isUnlinking: b === y.id,
        onUnlink: C
      },
      y.id
    )) }),
    v && /* @__PURE__ */ d("div", { className: "cedros-linked-add", children: [
      /* @__PURE__ */ r("p", { className: "cedros-linked-add-label", children: "Link a new sign-in method" }),
      /* @__PURE__ */ d("div", { className: "cedros-linked-add-buttons", children: [
        x && /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: e,
            children: [
              /* @__PURE__ */ r(go, {}),
              " Google"
            ]
          }
        ),
        R && /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: t,
            children: [
              /* @__PURE__ */ r(wo, {}),
              " Apple"
            ]
          }
        ),
        g && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: A,
            disabled: p,
            children: p ? /* @__PURE__ */ r(Q, { size: "sm" }) : /* @__PURE__ */ d(X, { children: [
              /* @__PURE__ */ r(Pr, {}),
              " Passkey"
            ] })
          }
        ),
        k && /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: o,
            children: [
              /* @__PURE__ */ r(bo, {}),
              " Solana"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function vd({
  credential: e,
  isUnlinking: t,
  onUnlink: n
}) {
  const o = e.label || po[e.credentialType], s = kd[e.credentialType] || Nd;
  return /* @__PURE__ */ d("li", { className: "cedros-linked-credential", children: [
    /* @__PURE__ */ r("div", { className: "cedros-linked-credential__icon", children: /* @__PURE__ */ r(s, {}) }),
    /* @__PURE__ */ d("div", { className: "cedros-linked-credential__info", children: [
      /* @__PURE__ */ r("span", { className: "cedros-linked-credential__name", children: o }),
      /* @__PURE__ */ d("span", { className: "cedros-linked-credential__meta", children: [
        "Added ",
        rn(e.createdAt),
        e.lastUsedAt && /* @__PURE__ */ d(X, { children: [
          " · Last used ",
          rn(e.lastUsedAt)
        ] }),
        e.isPrimary && /* @__PURE__ */ r(X, { children: " · Primary" })
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-linked-credential__action", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm cedros-button-danger-outline",
        onClick: () => n(e),
        disabled: t,
        title: e.isPrimary ? "Cannot remove primary sign-in method" : "Remove",
        children: t ? /* @__PURE__ */ r(Q, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function rn(e) {
  const t = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - t.getTime(), s = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), c = Math.floor(o / (1e3 * 60 * 60 * 24));
  return s < 1 ? "just now" : s < 60 ? `${s}m ago` : a < 24 ? `${a}h ago` : c < 30 ? `${c}d ago` : t.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
const kd = {
  password: Ed,
  oauth_google: go,
  oauth_apple: wo,
  solana: bo,
  webauthn_passkey: Pr,
  webauthn_security_key: Pr,
  totp: Cd,
  sso_oidc: xd
};
function Nd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M12 8v4m0 4h.01", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function Ed() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M7 11V7a5 5 0 0110 0v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ r("circle", { cx: "12", cy: "16", r: "1.5", fill: "currentColor" })
  ] });
}
function go() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("path", { d: "M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 01-2 3.1v2.5h3.3c1.9-1.7 3-4.3 3-7.4z", fill: "#4285F4" }),
    /* @__PURE__ */ r("path", { d: "M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.5c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.4-4H3.2v2.6A10 10 0 0012 22z", fill: "#34A853" }),
    /* @__PURE__ */ r("path", { d: "M6.6 14.1a6 6 0 010-4.2V7.3H3.2a10 10 0 000 9.4l3.4-2.6z", fill: "#FBBC05" }),
    /* @__PURE__ */ r("path", { d: "M12 5.9c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0012 2 10 10 0 003.2 7.3l3.4 2.6C7.3 7.6 9.5 5.9 12 5.9z", fill: "#EA4335" })
  ] });
}
function wo() {
  return /* @__PURE__ */ r("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r(
    "path",
    {
      d: "M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.16 4.36 9.53 8.72 9.28c1.3.07 2.2.74 2.96.8.93-.2 1.82-.92 3.03-.83 1.47.12 2.57.72 3.28 1.83-3.02 1.8-2.3 5.75.5 6.86-.6 1.53-1.37 3.04-2.44 4.34zM12.03 9.2C11.88 7.17 13.5 5.5 15.4 5.35c.29 2.28-2.08 3.98-3.37 3.85z",
      fill: "currentColor"
    }
  ) });
}
function bo() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "2", y: "6", width: "20", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M2 10h20", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("circle", { cx: "17", cy: "14", r: "1.5", fill: "currentColor" })
  ] });
}
function Pr() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("circle", { cx: "10", cy: "7", r: "4", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M3 21v-2a7 7 0 017-7", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ r("path", { d: "M17 14v4m0 0v2m0-2h-2m2 0h2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function Cd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M9 12h6M12 9v6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function xd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "3", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "13", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "3", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "13", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" })
  ] });
}
class Sd {
  client;
  constructor(t, n, o, s) {
    this.client = new ce({ baseUrl: t, timeoutMs: n, retryAttempts: o, getAccessToken: s });
  }
  /**
   * List all active sessions for the current user
   */
  async listSessions() {
    try {
      return (await this.client.get("/sessions")).sessions;
    } catch (t) {
      throw q(t, "Failed to list sessions");
    }
  }
  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions() {
    try {
      return await this.client.delete("/sessions");
    } catch (t) {
      throw q(t, "Failed to revoke sessions");
    }
  }
}
function Ld() {
  const { config: e, authState: t, _internal: n } = ne(), [o, s] = B([]), [a, c] = B(!1), [i, l] = B(null), u = z(
    () => new Sd(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      n?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, n]
  ), f = T(async () => {
    if (t !== "authenticated") {
      s([]);
      return;
    }
    c(!0), l(null);
    try {
      const b = await u.listSessions();
      s(b);
    } catch (b) {
      l(b);
    } finally {
      c(!1);
    }
  }, [t, u]);
  O(() => {
    t === "authenticated" ? f() : s([]);
  }, [t, f]);
  const h = T(async () => {
    c(!0), l(null);
    try {
      const b = await u.revokeAllSessions();
      return await f(), b;
    } catch (b) {
      throw l(b), b;
    } finally {
      c(!1);
    }
  }, [u, f]), m = z(() => o.filter((b) => !b.isCurrent).length, [o]);
  return {
    sessions: o,
    isLoading: a,
    error: i,
    fetchSessions: f,
    revokeAllSessions: h,
    otherSessionCount: m
  };
}
const Bd = {
  profile: "Profile",
  security: "Security",
  linked: "Linked Accounts"
}, Pd = ["profile", "security", "linked"];
function nh({
  defaultTab: e = "profile",
  onClose: t,
  onPasswordChange: n,
  onTotpChange: o,
  onLinkGoogle: s,
  onLinkApple: a,
  onAddPasskey: c,
  onLinkSolana: i,
  className: l = ""
}) {
  const [u, f] = B(e), { sessions: h, isLoading: m, error: b, revokeAllSessions: w } = Ld();
  return /* @__PURE__ */ d("div", { className: `cedros-account-settings ${l}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-account-tabs--line", role: "tablist", children: Pd.map((p) => /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        role: "tab",
        "aria-selected": u === p,
        className: `cedros-account-tab ${u === p ? "cedros-account-tab-active" : ""}`,
        onClick: () => f(p),
        children: Bd[p]
      },
      p
    )) }),
    /* @__PURE__ */ d("div", { className: "cedros-account-tab-content", role: "tabpanel", children: [
      u === "profile" && /* @__PURE__ */ r(bd, { onPasswordChange: n }),
      u === "security" && /* @__PURE__ */ d("div", { className: "cedros-account-security", children: [
        /* @__PURE__ */ r(md, { onStatusChange: o }),
        /* @__PURE__ */ r(
          Kc,
          {
            sessions: h,
            isLoading: m,
            error: b ?? void 0,
            onRevokeAll: async () => {
              await w();
            }
          }
        )
      ] }),
      u === "linked" && /* @__PURE__ */ r(
        Ad,
        {
          onLinkGoogle: s,
          onLinkApple: a,
          onAddPasskey: c,
          onLinkSolana: i
        }
      )
    ] }),
    t && /* @__PURE__ */ r("div", { className: "cedros-account-footer", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md",
        onClick: t,
        children: "Close"
      }
    ) })
  ] });
}
function oh({ onComplete: e, className: t }) {
  return /* @__PURE__ */ d("div", { className: `cedros-mfa-setup-prompt ${t ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-mfa-setup-prompt__header", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-mfa-setup-prompt__title", children: "Two-factor authentication required" }),
      /* @__PURE__ */ r("p", { className: "cedros-mfa-setup-prompt__description", children: "Your administrator requires you to set up two-factor authentication before continuing. This adds an extra layer of security to your account." })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-mfa-setup-prompt__body", children: /* @__PURE__ */ r(fo, { onSuccess: e }) })
  ] });
}
function ah({
  onComplete: e,
  onSkip: t,
  className: n
}) {
  const { user: o } = St(), { isLoading: s, error: a, updateProfile: c, clearError: i } = Rt(), [l, u] = B(o?.name ?? ""), f = T(
    async (m) => {
      m.preventDefault(), i();
      const b = l.trim();
      if (!b) {
        e?.();
        return;
      }
      try {
        await c({ name: b }), e?.();
      } catch {
      }
    },
    [l, c, i, e]
  ), h = l.trim().length > 0;
  return /* @__PURE__ */ d("div", { className: `cedros-complete-account ${n ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-complete-account__header", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-complete-account__title", children: "Complete Your Profile" }),
      /* @__PURE__ */ r("p", { className: "cedros-complete-account__description", children: "Please fill in your name to get started." })
    ] }),
    /* @__PURE__ */ d("form", { onSubmit: f, className: "cedros-complete-account__form", children: [
      /* @__PURE__ */ d("div", { className: "cedros-complete-account__field", children: [
        /* @__PURE__ */ r(
          "label",
          {
            htmlFor: "cedros-complete-name",
            className: "cedros-complete-account__label",
            children: "Name"
          }
        ),
        /* @__PURE__ */ r(
          "input",
          {
            id: "cedros-complete-name",
            type: "text",
            value: l,
            onChange: (m) => u(m.target.value),
            placeholder: "Enter your name",
            className: "cedros-complete-account__input",
            maxLength: 100,
            autoFocus: !0
          }
        )
      ] }),
      a && /* @__PURE__ */ r("div", { className: "cedros-complete-account__error", role: "alert", children: a.message }),
      /* @__PURE__ */ d("div", { className: "cedros-complete-account__actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "submit",
            className: "cedros-complete-account__button cedros-complete-account__button--primary",
            disabled: s || !h,
            children: s ? "Saving..." : "Save"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-complete-account__button cedros-complete-account__button--secondary",
            onClick: t,
            disabled: s,
            children: "Skip"
          }
        )
      ] })
    ] })
  ] });
}
function Rd() {
  const { config: e, _internal: t } = ne(), [n, o] = B(!1), [s, a] = B(null), c = z(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), i = T(
    async (f) => await c.get(
      `/username/available?username=${encodeURIComponent(f)}`,
      { credentials: "include" }
    ),
    [c]
  ), l = T(async () => {
    try {
      return (await c.get(
        "/username/available?username=",
        { credentials: "include" }
      )).suggestion ?? null;
    } catch {
      return null;
    }
  }, [c]), u = T(
    async (f) => {
      o(!0), a(null);
      try {
        await c.patch("/me", { username: f });
      } catch (h) {
        const m = h instanceof Error ? h : new Error(String(h));
        throw a(m), m;
      } finally {
        o(!1);
      }
    },
    [c]
  );
  return { checkAvailability: i, getSuggestion: l, setUsername: u, isLoading: n, error: s };
}
function ih({
  onComplete: e,
  onSkip: t,
  className: n
}) {
  const { checkAvailability: o, getSuggestion: s, setUsername: a, isLoading: c, error: i } = Rd(), [l, u] = B(""), [f, h] = B("idle"), [m, b] = B(""), w = J(null), p = J(!0);
  O(() => (p.current = !0, s().then((N) => {
    p.current && N && (u(N), h("available"), b("Available"));
  }), () => {
    p.current = !1;
  }), [s]);
  const E = T(
    (N) => {
      const x = N.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (u(x), h("idle"), b(""), w.current && clearTimeout(w.current), x.length < 3) {
        x.length > 0 && (h("error"), b("At least 3 characters"));
        return;
      }
      h("checking"), w.current = setTimeout(async () => {
        try {
          const R = await o(x);
          if (!p.current) return;
          R.error ? (h("error"), b(R.error)) : R.available ? (h("available"), b("Available")) : (h("taken"), b("Already taken"), R.suggestion);
        } catch {
          if (!p.current) return;
          h("error"), b("Could not check availability");
        }
      }, 400);
    },
    [o]
  ), A = T(
    async (N) => {
      if (N.preventDefault(), !(f !== "available" || !l.trim()))
        try {
          await a(l.trim()), e?.();
        } catch {
        }
    },
    [l, f, a, e]
  ), C = f === "available" && !c;
  return /* @__PURE__ */ d("div", { className: `cedros-choose-username ${n ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-choose-username__header", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-choose-username__title", children: "Choose a Username" }),
      /* @__PURE__ */ r("p", { className: "cedros-choose-username__description", children: "Pick a unique handle for your account." })
    ] }),
    /* @__PURE__ */ d("form", { onSubmit: A, className: "cedros-choose-username__form", children: [
      /* @__PURE__ */ d("div", { className: "cedros-choose-username__field", children: [
        /* @__PURE__ */ r(
          "label",
          {
            htmlFor: "cedros-choose-username",
            className: "cedros-choose-username__label",
            children: "Username"
          }
        ),
        /* @__PURE__ */ d("div", { className: "cedros-choose-username__input-wrapper", children: [
          /* @__PURE__ */ r("span", { className: "cedros-choose-username__prefix", children: "@" }),
          /* @__PURE__ */ r(
            "input",
            {
              id: "cedros-choose-username",
              type: "text",
              value: l,
              onChange: (N) => E(N.target.value),
              placeholder: "swift_falcon_42",
              className: "cedros-choose-username__input",
              maxLength: 30,
              autoFocus: !0,
              autoComplete: "off",
              spellCheck: !1
            }
          )
        ] }),
        m && /* @__PURE__ */ r(
          "span",
          {
            className: `cedros-choose-username__status cedros-choose-username__status--${f}`,
            role: f === "error" || f === "taken" ? "alert" : void 0,
            children: f === "checking" ? "Checking..." : m
          }
        )
      ] }),
      i && /* @__PURE__ */ r("div", { className: "cedros-choose-username__error", role: "alert", children: i.message }),
      /* @__PURE__ */ d("div", { className: "cedros-choose-username__actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "submit",
            className: "cedros-choose-username__button cedros-choose-username__button--primary",
            disabled: !C,
            children: c ? "Saving..." : "Continue"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-choose-username__button cedros-choose-username__button--secondary",
            onClick: t,
            disabled: c,
            children: "Skip"
          }
        )
      ] })
    ] })
  ] });
}
function Td() {
  const e = We(), [t, n] = B(!1), [o, s] = B(null), a = z(() => e ? new ce({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), c = T(() => {
    s(null);
  }, []), i = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      if (!Number.isInteger(w) || w <= 0) {
        const p = new Error(
          `Invalid deposit amount: ${w}. Must be a positive integer (lamports).`
        );
        throw s(p.message), p;
      }
      n(!0), s(null);
      try {
        return await a.post("/deposit", {
          amount_lamports: w
        });
      } catch (p) {
        const E = q(p, "Failed to execute deposit");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [a]
  ), l = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      return await a.get(`/deposit/status/${encodeURIComponent(w)}`);
    },
    [a]
  ), u = T(async () => {
    if (!a)
      throw new Error("useDeposit must be used within a CedrosLoginProvider");
    n(!0), s(null);
    try {
      return await a.get("/deposit/config");
    } catch (w) {
      const p = q(w, "Failed to get deposit config");
      throw s(p.message), p;
    } finally {
      n(!1);
    }
  }, [a]), f = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const p = new URLSearchParams();
        w?.limit !== void 0 && p.set("limit", String(w.limit)), w?.offset !== void 0 && p.set("offset", String(w.offset));
        const E = p.toString(), A = E ? `/deposits?${E}` : "/deposits";
        return await a.get(A);
      } catch (p) {
        const E = q(p, "Failed to list deposits");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [a]
  ), h = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const p = new URLSearchParams({
          input_mint: w.inputMint,
          amount: String(w.amount),
          taker: w.taker
        });
        return await a.get(`/deposit/quote?${p}`);
      } catch (p) {
        const E = q(p, "Failed to get deposit quote");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [a]
  ), m = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        return await a.post("/deposit/public", w);
      } catch (p) {
        const E = q(p, "Failed to execute public deposit");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [a]
  ), b = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        return await a.post("/deposit/micro", w);
      } catch (p) {
        const E = q(p, "Failed to execute micro deposit");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [a]
  );
  return {
    deposit: i,
    getQuote: h,
    publicDeposit: m,
    microDeposit: b,
    getStatus: l,
    getConfig: u,
    listDeposits: f,
    isLoading: t,
    error: o,
    clearError: c
  };
}
function yo({
  tokens: e,
  selectedToken: t,
  onSelect: n,
  openSignal: o,
  placeholder: s = "Select token",
  disabled: a = !1,
  className: c = "",
  searchable: i = !0
}) {
  const [l, u] = B(!1), [f, h] = B(""), m = J(null), b = J(null), w = z(() => {
    if (!f.trim()) return e;
    const C = f.toLowerCase();
    return e.filter(
      (N) => N.symbol.toLowerCase().includes(C) || N.name.toLowerCase().includes(C) || N.mint.toLowerCase().includes(C)
    );
  }, [e, f]);
  O(() => {
    const C = (N) => {
      m.current && !m.current.contains(N.target) && (u(!1), h(""));
    };
    if (l)
      return document.addEventListener("mousedown", C), () => document.removeEventListener("mousedown", C);
  }, [l]), O(() => {
    l && i && b.current && b.current.focus();
  }, [l, i]), O(() => {
    o === void 0 || a || (u(!0), h(""));
  }, [o, a]);
  const p = T(() => {
    a || (u((C) => !C), l && h(""));
  }, [a, l]), E = T(
    (C) => {
      n(C), u(!1), h("");
    },
    [n]
  ), A = T(
    (C) => {
      C.key === "Escape" ? (u(!1), h("")) : C.key === "Enter" && w.length === 1 && E(w[0]);
    },
    [w, E]
  );
  return /* @__PURE__ */ d(
    "div",
    {
      ref: m,
      className: `cedros-token-selector ${l ? "cedros-token-selector-open" : ""} ${a ? "cedros-token-selector-disabled" : ""} ${c}`,
      onKeyDown: A,
      children: [
        /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-token-selector-trigger",
            onClick: p,
            disabled: a,
            "aria-haspopup": "listbox",
            "aria-expanded": l,
            children: [
              t ? /* @__PURE__ */ d("span", { className: "cedros-token-selector-selected", children: [
                t.logoUrl && /* @__PURE__ */ r(
                  "img",
                  {
                    src: t.logoUrl,
                    alt: t.symbol,
                    className: "cedros-token-icon",
                    onError: (C) => {
                      C.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ r("span", { className: "cedros-token-symbol", children: t.symbol })
              ] }) : /* @__PURE__ */ r("span", { className: "cedros-token-selector-placeholder", children: s }),
              /* @__PURE__ */ r("span", { className: "cedros-token-selector-arrow", children: l ? "▲" : "▼" })
            ]
          }
        ),
        l && /* @__PURE__ */ d("div", { className: "cedros-token-selector-dropdown", role: "listbox", children: [
          i && /* @__PURE__ */ r("div", { className: "cedros-token-search", children: /* @__PURE__ */ r(
            "input",
            {
              ref: b,
              type: "text",
              value: f,
              onChange: (C) => h(C.target.value),
              placeholder: "Search tokens...",
              className: "cedros-token-search-input"
            }
          ) }),
          /* @__PURE__ */ r("div", { className: "cedros-token-list", children: w.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-token-empty", children: "No tokens found" }) : /* @__PURE__ */ r(X, { children: w.map((C) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-token-option ${t?.mint === C.mint ? "cedros-token-option-selected" : ""}`,
              onClick: () => E(C),
              role: "option",
              "aria-selected": t?.mint === C.mint,
              children: [
                C.logoUrl && /* @__PURE__ */ r(
                  "img",
                  {
                    src: C.logoUrl,
                    alt: C.symbol,
                    className: "cedros-token-icon",
                    onError: (N) => {
                      N.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ d("span", { className: "cedros-token-info", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-token-symbol", children: C.symbol }),
                  /* @__PURE__ */ r("span", { className: "cedros-token-name", children: C.name })
                ] }),
                t?.mint === C.mint && /* @__PURE__ */ r("span", { className: "cedros-token-check", children: "✓" })
              ]
            },
            C.mint
          )) }) })
        ] })
      ]
    }
  );
}
function Vr(e, t) {
  return t.privateDepositsEnabled && e >= t.privateMinUsd ? "private" : e >= t.publicMinUsd ? "public" : "sol_micro";
}
const Hr = "data:image/webp;base64,UklGRkACAABXRUJQVlA4IDQCAACQDQCdASo8ADwAPjEWiUMiISEUBFQgAwSgB4Z/TeLt3XMAoQH23eph0gPMB+sn+M9tvngOsA9ADwgPg3/cH9sfZciikEBuA1AB+nf+84CUkAVvA2x4xvyobR+mBaYhjUv/ewHb4hTqOnP38rzsxZX2inOSciAA/v7uqvqGdpWcjjrfMDFaNHumTog38t3yor0kbjn631VsX61cAC749wWuAX74u/f/hpeDFqS/ci8E1g94wk9UVs7BHqtv7f/M9iT1u5ITJV0Gv6tE/CW5j/nVR6yExJ6JoDRDOWQ8zVpWH92r3Lnbnc4WJpOchbRT3H5rv//6PP+F//4ehLUlR/4tkRUKZu/yOa26+sywmY+Xc1X2lXMcUv7+eQ7+FBE7bhKc7htieBfH4eR134AVaILL7PWA2FjzAjfaP1Lgirqoq/ZooE8jVD/b4g3J3O3/TG/4ajHe6clnAI/4NdwrnHX0P/quBU03HqSsQ0qsEMAuhrH/jn+YtDzmjm8q/cGJ44qvi24Hn+G1kxz2XP2S/Gp7ri5cMlo+muuwBjyNJnnEcTt/5cRdYS2cbEBZtpINWj3PuC1EOsd/8cTepSpxODcJHLzktfC1PHW3Pgoh3J5PHjW3TCQ1Wlu/wP8e8OPfNm48BODGChioj3ezblqrOBV+cI+hLi7ReJdvBF/4jY+/Un0asuWnrA6kRNpgOeO8wyl4Ryhkrff+9R1SpyPYP+5T3EuWWLZaCn0bGzyk97S3VAAAAAA=", Md = 1e4, xt = 1e3, Ao = 3;
function Id(e) {
  return Number.isFinite(e) ? `$${Math.round(e)}` : "$0";
}
function _d(e, t) {
  switch (e) {
    case "private":
      return {
        label: "Private",
        detail: "Private transaction, instant credit",
        note: null
      };
    case "public":
      return {
        label: "Public",
        detail: "Visible on-chain, instant credit",
        note: null
      };
    case "sol_micro":
      return {
        label: "SOL Only",
        detail: `SOL only under ${Id(t.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens."
      };
  }
}
function $r(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
function Dd(e, t) {
  if (t <= 0) return 0;
  const n = $r(e / t, 0, 1);
  return Math.round(Math.pow(n, 1 / Ao) * xt);
}
function Ud(e, t) {
  const n = $r(e / xt, 0, 1);
  return t * Math.pow(n, Ao);
}
function vo(e) {
  return e < 10 ? 0.01 : e < 100 ? 1 : e < 500 ? 5 : e < 1e3 ? 10 : e < 5e3 ? 25 : 50;
}
function Fd(e) {
  return e < 1 ? 2 : 0;
}
function sn(e) {
  const t = vo(e), n = Math.round(e / t) * t, o = Fd(t);
  return Number(n.toFixed(o));
}
function ko({
  config: e,
  valueUsd: t,
  onChange: n,
  maxUsd: o = Md,
  disabled: s = !1,
  className: a = ""
}) {
  const c = $r(Number.isFinite(t) ? t : 0, 0, o), i = z(() => Vr(c, e), [c, e]), l = _d(i, e), u = Dd(c, o), f = u / xt * 100;
  return /* @__PURE__ */ d("div", { className: `cedros-tiered-slider ${a}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-input-row", children: [
      /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-input", children: [
        /* @__PURE__ */ r("span", { className: "cedros-tiered-slider-currency", children: "$" }),
        /* @__PURE__ */ r(
          "input",
          {
            type: "number",
            value: c || "",
            onChange: (h) => n(sn(Math.max(0, Math.min(parseFloat(h.target.value) || 0, o)))),
            placeholder: "Enter amount",
            disabled: s,
            min: 0,
            step: vo(c),
            className: "cedros-deposit-flow-input cedros-tiered-slider-input-field",
            "aria-label": "Deposit amount"
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-tier", children: [
        /* @__PURE__ */ d("span", { className: `cedros-tiered-slider-badge cedros-tiered-slider-badge-${i}`, children: [
          i === "sol_micro" && /* @__PURE__ */ r("img", { src: Hr, alt: "SOL", className: "cedros-tiered-slider-badge-icon" }),
          l.label
        ] }),
        /* @__PURE__ */ r("span", { className: "cedros-tiered-slider-tier-detail", children: l.detail })
      ] })
    ] }),
    /* @__PURE__ */ r(
      "input",
      {
        type: "range",
        min: 0,
        max: xt,
        step: 1,
        value: u,
        onChange: (h) => n(sn(Ud(parseFloat(h.target.value), o))),
        className: "cedros-tiered-slider-range",
        style: {
          background: `linear-gradient(to right, var(--cedros-primary) 0%, var(--cedros-primary) ${f}%, var(--cedros-border) ${f}%, var(--cedros-border) 100%)`
        },
        disabled: s,
        "aria-label": "Deposit amount slider"
      }
    ),
    l.note && /* @__PURE__ */ r("div", { className: "cedros-tiered-slider-note", children: l.note })
  ] });
}
const Od = "data:image/webp;base64,UklGRmIEAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IIIDAADwDwCdASo8ADwAPm0qkUWkIqGWDVeYQAbEtgBOmZMBu+H816ov3b8R8R2g2FXtxdyh5s3+A60v0APLi9ktgGB/LZjWNAXqgpE6jfW0NF+P4xEhH2L7M+26iGwrTjjcQegyCZqxs+ifvZANjWd279diqZNKUrgOTVtjJGtW4IVtRhMECd5aWVgAAP7nDv3UY/8f1l//xTP/FM/8NU8c9g//sC3+bX/1HZXsNsM57VKG2LVf1a0KdncWO8uPo/Oh79m9ZqjJZwXfPXuvwkK+WDOl6+N8C2Ux6no/V/zkoucKK/JZek7MR5sS8TknXB+6BuVDXou9Rx4aUea2q2IzvLvFIujjKsVYLMab7j9zo48fhgm9YOtjmWuS0WZ4c+6ta0mr3xF4fcdAIFf6oXRSlqovOX0HUiMV//hXwSX1cfP5cLj8c7OTyT/4ce4olJARV95GoY8oF+2uU0blGul3ItlG7c2Hl2/uC6s2WZc7Zukwojx6ed8t97bZ68N1uzCLzPlG7BuYS17F19e0wXnc6vEl3q7ft0K7OEl7r8mY6Kh+Nt/5V/Lp68mFBjLem1JjvC371+lKwez4KCdXwNo2Z04FqyzGpFutY6YQ/r5Tfu7Oi+oNfN0R/W+D4aj1nqHhlqYJzpx2NK4mj0gJIXmX8EArelSQI8mV4Ux9MRPwC2PuZhLTjQZv+Vl4p0D8bSB+Z0rek3hS6G1r80fW3cn767Pz/bXanjVmm34wt1nQPqdJObrZ7vv2NWcEuQKj9d+V6DzeDrq0CtGNcanEB5MY9agi1E6BprEScTdfPXjBeMnPbpD+QO6P7IW4UZ9etCCHtX++S/fl5Iz5RzUr10ojRMw//35C0yTjSEhbe884dPwor64n//KByjUFEGsCPAAXPJp1+O+SiKfUaODq6ncjKayTHXjoXgM7XP1z4sBhIKJZJRiM7vGC/+v/Sk8/jbgZLZDAVz1vLou93y7Yd8hxcWM/BesxgWgeKvl8fjE/Ud8tQKp4425hWh66lzzwxa4J3ctA4/E50wX/eoBOgq0B7+7S6FK4wvPHSNgfh+vwSWIJsJLt/3yjBeb41RRyMDMZqFQTZPEdFpXp48ExEyDayZ6objbjTHoS5WQDnDQpRyqMNKfvd41nhEPdb/hxpzXeTIjWmfHHCT+CQYWXDqLehCh1cRyeYOBwsSlSw5PiquAbsgAARVhJRroAAABFeGlmAABJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAEgAAAABAAAASAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAPAAAAAOgBAABAAAAPAAAAAAAAAA=", Wd = "data:image/webp;base64,UklGRtgCAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IPgBAABQCwCdASo8ADwAPm0wk0ekIqGhKBQMqIANiWkADPF3uV2D8VcQGk1mg+P36i9SLnZvYAQxszEWYzEwX1RVkqG/4BGbJgMSHqhKDFsjWsGfPPrvfef11goNmCDDlBJHVVD+8gAA/vu4q03kl+E7FpjtZ2gc8pQ619Hjv9NywoRZ6az43C1wcrRr/lWzJlJhLWMHN0MkVl1ueAf6Hn8StVzeUfMBXOKkgfe2msx7QWR5PnHW/5c6/35yrtWnrURc2q6UYlGin+v8C2dQqexkW6rX2EEijTI9eEQ46PWH3/59fM2AlMvvR2abaRk5XX7V1triQncRxvMfz5YmYDN+PY/ikcZUNaiFucKoUq5riv0eKCezuFNHecE11ojwJqWRSTWpalkz5autXp6vFS+FT1tWUsB/fs1CCOZxaA1vR1grOEaiuKe1RYm7e05psWtqbXLVmm1bA8Ly9PFkVdCbc6hR3UuBBsFGnVeGOUeMn2onnfvYhBMcM9YPxGdQkwZLXOk1VuQSTk01Shf3fZrFyRlFauftFdPYhKXwqrr+meav1P+KLKBVosqmHnFFfgExsQ/rOf3TSd+mOqQfJA+cF+HojNU7nmM3uDkoCBi+//Gqp+gPNNW8M4LFrol8rxE+7WsjqMgfwv1f+Nr25RtG1Wa/KkniRCAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", qd = "data:image/webp;base64,UklGRhYJAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSGICAAABkJz9nzon3/nNJGnBXRvBI0sDkR7slpRBaMDl5LByx7cEyBWHtWd+8/uiK/95uEfEBKBnFwRwk6Wjm89PW2Tj9OWNo7VxASQ4DDoIML9fbdLYpbFR21tykDAY8ZCLT9okqZrsD0uqJNl5sj6CIAPwDmdqRlNlz6o0vroE5/vlPObv0kyN/dVE3pmHd31xgt0P1MgBauTHLYjrg2DoClM0DtRi4kmA6ylgrMq2cuDaZm0CoQePyTqVhVTWJ+G7EozXqSyosj4K6cIhVBhZ2MjyMNy/BFcZWeDIE8g/PLaoLLRyF/4vgrlPTMVK/DQH+cPjGpUFV17/i6BEZeGVF+Dh4F/kUYGDR4nKDBPX4AX381Deh2C1Q8vB2F4CDqnMUrkPlPMpY+obLQ/j9+k1GjNNLB0z5hJ5fD0f5Y2XTLkkPn9Hy8X4vsGMW/xvt3JqvKflYnz3nCmXxJc3qLlEXj9mzOe4xJSLcW36Oy0P47cplKl5KMvAfj6HwFKbloOxswrBfWoOyvsQjzWmPErwcKhQi6d84eHgcSGPEgSA4Dq1aMpr8PjL3CemYiV+moP8AY9darGUW/D4u+CEsUiRVyH4p8NwmbE4kZUA9y8IRuvUoijr4xB06zFZpxZDWZ+ER/cBEzW2dXDaZnUMAb06hBOmaIOxmHhlCILenWDrI6MOIio/7kIc+uk85u+SSftkasZ78/AOffYOl17RqNqbqtFqZ+A8+i8BI+tPOiRNNdkfllSNZPvJRYEXDDQI3NJerUFjl8ZmbX8ekIBBuyCAjK8d3Xh52iBbp89vHl2ecIAEh54BVlA4IMwFAADQGwCdASo8ADwAPm0qkkYkIiGhLhtqqIANiWwAqSdaNo+beZFT37f+J9yXOd2J6HfQh5gH6edIDzAfst6vXoO9AD/Lf4DrAP2V9gDzY/+57F39p/3/7k+0RmjvYp/meic9ieyvJnZVfquF/a23ZOCHGT/sfDDjQ89zOL9Gewd+s3Vh/b32Gf28Ejb5ttLg9hoDiFb2tMW81eZU9Z1LHfdRSCsRMzHz0WT4BNgUakGf9oJtrGtVJFxHJfxAatIxnW1qjDi9i3DQtJp9pVNKlMoJEWdPKv3KaaFSlhd/aMGiir9CPcex5QAA+fpjxA6zfUamE3wS2zWwLVrt/fXA5+Wvx9j5SID0zuEHU2LisPUxvtRuIUwNrsUis8zy+IMpzft+ZSg+9gdx9e6+ZvPmtj4OByz5qo26J3rXhPy8LBXSpuPb+f+mP4CoTvYDhzQXh/SIGj8Ez1+W5MJ/Tkdw09wPCs3JuR3yoqO63FH/j81xW5Abr7tCdwfXwv3CXDtOcHwUqPCd1aiU2uT6XwgdnYqYygEXGKFx8nmaUvqSn9p8HmIA9dVTOoEnqYFjrNfWY034N2vjohd16cxnkP4PYvHkIOWa/FEUug7/qbJ/GFLPxNh6y9eQ//MzzXbcPwsT2chWXPBXNVF1S9dxv5NUuEueiw2kdebblQuvUSRLN+zx3VyT2lOzWBUqrzsTmeOlxjVcTA83H99r35O4X7WXNq7HExiWXxrdM/Ih4CvPJaEHPxUE/i6WIz6+VGq4RB3sBKl3P4M7/DLWAwCnwcpX228XezqQ4cS2tttWxLTc9cPd1ofek9qF9lpB8RvakdPnj2PruFA9W3iKbNdmgnb+mIpohHuUR73KdDDOHbyfAiOjPzzqomnIU3jcSt7LKOB/Op97sCk0yd18mVG3prs351B+xmCE2Zd3RFKL+mpMz5qcuAFAfRyodbggdgmFGkEGQ33VryYFl/upr31FGdI52sqzuxd7jZIsqCcznUH/gu+xaBw7wla49EmFNf+Ss+91i9Hsys0FS//Ktru1xWgkeEweX77y6Oot5tHQsDxgy0sAI85V7FmlpiiWXQdM12MGfCBfyRM+N23SjOdReeSILYCgsM3r33/54X+lfDVNj427MvbDFtKccqazlQ+iKqC//MvYwqyiJPL1ZbVoCEP774fKZA3D3qvsVPGlp9LPchpTs4mTJugt8qXl82RwXQCDNZXnbEois53E35hkRr+IJhndoRo1o2sZDoTgykbeOKiynPH03+BcUQ8zmxTmiVlHQym/LL3kRREnUlxs2zPPGb2E+Rpdib+LxOvFSmj9RfTZoYIJnrqNnBIXV2lt7xeZ0srf98JymJxrtr8lx69oSNZIReDddL+3iiUjh6lm7EcYuclqBaKp8q68geo7H1EvKy4nSRx5Q+uz4l/ypo2hVdwi9l+BHjZZmJ7lXkpNTRJ0gZpzquzN2vh/MZQALV6FZ6q4aofA9AJy1DVLdNjV8n6s9eFA5pazxwhLW4tgWMciGf5x6G7HqFPTL1ZL3l447zLGUkqAXjkeVaNmxZ2oNKIuTy6JDc0Z61Z2dgbsg6HwCX1/ux5sk82WsnNIO4CTnWKI1aCtQZaEsBf6hIl9n7VBsgZGIcPpqn7P4mbyf3EbfdfQ32qlawLuAxmDlwRsVsPkw7j4aKbvIBykNcsVXv0/X6UXXaAtw3feJnTwDak2qY6QpMLE9e7PJeuQQ8FXpqI5HoR82kd+DOwGH5F3OpuWsmEt8v7WQG8q1LMkg6vrl3I8047zMl1Yq0VwotbrsKJocsHgsbs/PGOO9v2s8U0Sju/71XRtG5skcy2msae3wixjlGR4i6ZfldMehQD1zf/FbWN9hnHfpq1Fh8+PSA9AzUi33qli8ixISbH+tw7CcumxvegMk88HMNZlVdnIEzIfyHrSdZ2S98yX2OYZw0+JyaBbQxI0fOr6KpuMD6FVGLrdN9dgOTgOPQgAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", jd = "data:image/webp;base64,UklGRo4EAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSA4CAAABkGXb2to2V9/v6D1Jmd5CQ5GXPYXAJMrtPOJMoMzMzDgIPYY5+vVds6T/m0BEOGzAtm1IBlR2d8kXUMyaADjeuHr9V7qj3E5/XrvaOA5AHCqzFgHTFz9tUTmEyq1PF6cBqVWDOLjkwS6VPsu8KqnaewRU7j5KIjipgFiQfCf1IGch8wMlv9QhcWk4nLlL9Z4l6b3y7hmUvGQkmF1nnrMC85zrc5CozDUQtwamisNSDCmxjL5jpqxMzfhutFCCY3+5110CaI9/jhVIcPg/DxiIB/x/eKgijLxkRobTyxFEw7zVm0NqcYg5LNAzKD3n4QbmyRVqWCiXJyD9uN7z0Ha9Dw4N5gzOnHU4IMJ7egt8HuYWasIJnlg46fkYgul9qgWU+9PA2Z7b2FngnR3e49Qm1QbKzVPNnltZ8wozK2S8et0SN34wt0LOnynVCsp02xI7tKSqqXYsV7ZtD/lpeaEfNyw/k9evWuKK7XfQ9ruP9/RW/s74t872N1bw2MY8n0Acmlb/KQ04AJ8t5PkeEbpDnbmR2/5392FiOfRFlCuTkIGsMh/aPBeGZFLBYuiM1IIUZLOD0NnMNBMWZdE/4bLo32MQ0wxcJnsvhcnerRhSLvPPhcj8s5DIsmtU6Tj1L1U6zvcEElfrVlHyqGy3epC4om5Vsg3OlO50UQ2V6Qa65LWf6TZ1J/11faBLlpgAVlA4IJgBAADwCQCdASo8ADwAPm0ylEckIyIhKAoAgA2JaQATzh4OcBkEByVmbl5z9gD9U/+J2APQgLaX4twLu19/UVxAWN1IKXE4cIqJBhoyQ0yDYn61m3zk6T7FMg0AAP78+EMvGgC8jLXmcbbmqvufKjG8Tv1M9Krl47vOW74O/Rapv2DgXbg9iK6PrRQG/9d9+rF/ESxzbszVFn3GThrMBmsklj/LPWDQ0pKzG7EyjQL6p6gfUwMze+wPhzJpn8tMqlUVgq6/QSUVcgG+ztsi73rA3vl3n4baeF1INsbuosTXtnsotVYuTii6rscx9OUTvevYcPNvcL9MPhyWeCQw0qynnGtzCIw+oFRN0+TN1mqXkFyk/rFBcH+FHiI6s9XX5EWCKn5vTRt/0RbS687PiXPFC5Zk/Gk4+538IYi+HZDjvlQQWOH/vddfYTerQ5QqWJt1YuaZNThQ2u+/DtXfZPRy1iWWLR9SKFFtlGrqBKWF5nPRPWWMNA3OssvUtvCNBLBA4cn1whzy+SpbgLvnaepxiykjKsU/MhzgAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", zd = "data:image/webp;base64,UklGRqwEAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSL8BAAABkGvbtmlLc5997yvbmW19gBnbDm2kjF5UmW3bthXZVZFdZ+81r+87Z1XlEaHIbSNlMstwos4XUBSTLAFQo/u01Zdf/yLDDze3zB/YwADJEoOoJAKg7oTdH4SF+XxiZlMgSESzwAJdVn2iUJzzOUMiLhQKf+/va2FtBLMBuu1zpHcsincUXhtoTKLsCTVX/KF3wrLhPLm/OWzZtjQWfZ7RhYyAC/lxMowpSzJYJAyFkZDQc21FBMUT7BqGjpHxf3m+XlEPUHE/f3vGgPzmw4awRUaTexkyJhwfNShctVgZXyJDXq4CUyjNy6Y4fVOBIkAPR2GcOE7Jm2NQ/RE9YzXht3a5VYvlOX0xF0fy+tp/ozBuQg6DzZYb6Bi7ed4rB5Mp/1Co4cNhLUo1StLxDIDqrynUoRswiF6nFnIxsDpnZ5WBW0GFZ1qZ8HfLDk5txHHsGDpSa6B0cXZEa+DsTr1M+P4qPdXwjynU4+1/a7oN3Sm6G+meSd27oHsHde++7puj+tYpv7G6b7vun6L7l6n+oZp/t7JmUNUqqhpJV5upakJVLaqqgVW1t6rmV401NGMc1djqH4rpIseSfyPFkgAAVlA4IAQCAABQDACdASo8ADwAPm0yk0akIyGhJgzogA2JaQAThroHvLxu+aPf5G2BYxv+B6XHzx6GPon/o+qz/tOAA/TM82gR0vnExWoiQRM36jlg2UIvwCSqySErzuguz9EP2x/7hsNazr91aIworWI7AAD+/TZ+6Ipl444OdT+2wU0Ov+T8oJuVP/vUbT/w1Jsv6Awnl6rvF/xetfOPt3gTQZZi0Y/AOx563J7CJkqTR/fc/n34zyeKzR80fhfv4ef+Hjhz/CX5aQo+58zg/FdE+7bLoophGfG0szI513EH+q+Gc73H1PFdJYf7CF8v5dhr3tMwEVX5Ji2ZxejK8xrf/E6nVXqlA4DrYNRP09InHc+fEqO/fH8xr+rMf4y1F9TOnwVffZblLoTP6lot0m/sh7sTiDQr0mIA8TiHoOffGDG6KzV+B3239udfhzD740gkRi/m53abX0Ku3vAgadgFFqL0vk8M/4aI+cI+0fbLW17mWGeMu21wSRRQiv5iNgGKR3vEGXAItcLDft1uUzWAfbe1X3zK/ymT7bA/76PB6UUknm+Y5MM4osurUXU/k7P38pN/3slnGfpFzjl4c3USY4mH9ZCJYUuC/kGEnq/yRPalPdODNFvW6s8MiQeQejYNRY0LsJ0WXkK8vXiDmihCivYAOPoSovesL7on+WAArDNM/BcQSQvCYABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Vd = "data:image/webp;base64,UklGRnIIAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSK4BAAABkHPbtrE9+z73/RTbqWw7Lf+BbbNKbTudbZe2qy+VbVv3PmeHj05G6ohg4LaRounNMtN1voB42ABA5R7TNlx5+O7du9e3Tiwb0b4EgFyAOCQM1Z16+DWFUZC7m3uVB2zKQGBhe+77RGHonJffCL1zQuHDxQ1hrEmTatDjHIXOC2MgzpNf1tVJkWgsGhyihI7JIE74aUYp2ITFAoz9QO+ZAs7zanvkEilKbIkMJS5ANwoJmrCodYVOmBqh5zIEJjZc9xods4A4rrPGxGitrJSU71yNyH4Myl7JTEl+5zzYSH9nlkrxHBzxWUzLVEnhh+YI/gq3+UphpvA8m/s7/wg9M4bjFNg/0vplrxQ+rQEDg/xihmT23jxYJZ8UPq8OA5z77Wt405FDR4poSMjiAJhPRxUIu8D+UVonOhfNPEVHPM9juFacwo+1V6kJQ3Y9Sa8ljhPuUvRk4UdNWU9ST3b9n0W3iG5DumdS9y7o3kHVu6/75ii/dbpvrO7brvtPUf2X6f5DVf/dmpxBmauociRVbqbKCXW5qCoHVuXempxf1dZQtXFUbat/yKZTtSUBVlA4INwFAABwGgCdASo8ADwAPm0qj0WkIqEZ+zYAQAbEtgBOmZoZF+E8zGoP3X8VbcdLvma8t+jH0E+YB+ofSA8wH7VdQv0AP75/iOsG9ADy3/Y5/b/91fgI/Y7MOesb0e/q+TUR1vt7VO6mwG0imO70GM5/0P7BX6qelv7EP209lz9oDRea09ZR+SjhX7sBu/ZS7tG917rPgI3Q7XsB7luy2hAg/95C2Z1L362OH1oFziDY/K5gWoSytSAtiKvA/jW1MehBzdLzJfszPPBvGa15IYwIVRTjO2Hz5ZS9HjLMehwAAP64SgjD3qeg6NRe/Ok+iFhrG3pgglCfbam3yBaDUH36sUiQx0PB1ZZyOHq0ky+f97h6tJMvo0p9LkfXecWOFJ8J5G7yRPuL4tzGLT09QulTJw42xp2hd+lMgIa51XoHx/iftn8B2D3k92H5jOQr+uIXFHHK5FpcTG+qGEF+np0LiQa+vdW7/+ZzOLVRf7jR5X3ANPt93Ng92DW7NflVr6kMr88O/v2ZNb0vtgao2Am/R3CDKiNq89f86CT6r2L2g1oTui7H3E1yhSPQpEOz01I3fhfiMMv4weqKuoedxn/xLg5uzHa6Gte4C/dQYkG3ZFSy4CXQtRjftBrjX/Oj+HpSUPDsv0wPW+ml5NbBKDCj2f3SD8TVMf2ZfHrOkR602RVk2UmKC+H0Y9iK6k98vsgPINtz0II8X7Mj2nJkTC6IMLuQ8dNTUq9VXOnhXrdhNZoaH94ePo6baBl3hTGFAnD3/b+gR/vtbqV7wktuX6fpnjeTBe/Drp6z3neeANj/aX4CsU9w67nwYOjZhueCjxaDKUnNjLPjI1e0BoTbcOzOQ0wHJHZJ+Pt608StBu4HiJ8NjH46fnvXL3yiMoSvkAuwCE1AakA+eU1u3unyjl1/MnZQmbp8fzfsfrFesehLPcIkYdCiZ+52QbmINNTjEsvjuBuZRubBE+Laihppsxoo4efGIo0xkw0etu1+yzvkqp88w3pBq0mRl13gnnc+2zl6SmhwgmNFbz+F8qAqmdfJL8iaNSGEWlPlpczDDe62GBZMlBhQmq/XCn/1b+VazHvJXkoIFDF+wktMg+rKfLyfTlXdK0cs+Kn8h+rjMakkf3WLo1TftMLn+O+x/Gat+BGstJrM1xvCSSnHQY+NV4B4gRqyZ55gRNnqN/0lWrATOcHUaGXpkTIM/yxFjxcePcSFo+t2aJ5lShtVukETzRxaIXgRkpROeWQHWpTHOaexmXOzF0b833qJSoXMk2zB/uMrgDzKd7d3ohUz8Ra08WYKlAuMQD08bF4+jUepEspqPLoYLQ73TfmL+1LwKxyTV3gEu6WnxBPWPLnYIGYN9U47ZNlB+NgHgYtKTyii6060RAG+wN32WUVFxCZw0HMHnHFgwxD34L/anlpS7mOrjKgyuGYhFC7iHqTQHuoAO1ekBHV+rndnbETKfa1F7LxNLYq+dmJyytmQrJUCGjelorI1m/TMQNiFVrY4FCI1Gl2W1JsZsw9zA+Bh3JmjkC0H5/0JV6JotNMatJIZ4v5PqwJe3r8xd+FNS3ynccdu+xtVdc27qwVdoomciZD5oXYey9KAFSAKO594sBKZNWUJTLXnt0BJbdF8FkQYvg3DQajYY2p+ixd5Ag7o92gw0pVVDDOP+WQxiEmKqgWJyTBsnsBk2Bxi2Unsv8S/4PmE8Hy/vy+Mij+aTAKZvg716IHfHX0/JMeFfmAnsZ39Q0qkfdPtq6+CxbGZ7wKDsK/8l/MVGuyd6faJFt5wyoOXuNrr3JC9EoBmjcOzkVw/6RNP49poZ1xzsX3q7B4HGfI/XSfRQq3HeZ2j12d0E3gCAube4oExaT1sx/v8F+f61QOsGdSaqM2im6qOGkSRkrRQ7L8hvS8vEYJeVkAbFvX5ov7e/egYYNToMHj651c5/rCVYtB9Ned6GvGN8R0x3t7+lsf8+ofhHRzpyvwxd6c5pREZVOKnXzplhJ61mki4JmAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Hd = "data:image/svg+xml,%3csvg%20width='88'%20height='88'%20viewBox='0%200%2088%2088'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='88'%20height='88'%20fill='url(%23paint0_linear_170_79)'/%3e%3crect%20x='25.6665'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='51.3335'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='29.3335'%20y='40.3333'%20width='29.3333'%20height='7.33333'%20fill='white'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_170_79'%20x1='-75.3077'%20y1='-55'%20x2='146.302'%20y2='148.167'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FF00FF'/%3e%3cstop%20offset='0.531673'%20stop-color='%237A84FF'/%3e%3cstop%20offset='1'%20stop-color='%2305FAFF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e", $d = "data:image/webp;base64,UklGRh4HAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSNwBAAABkFxbexpJnyR3z8y+ajXMkAnjnnOgbUUxEAHjkpldWQwzFUn6v3PGVNI/AUQEA7dt49gN3PXavTlfQDeNAeyqg4PL5buRyOhteXlwcJWtHU8qzUIBs+30g7/s4N8Hp7cZFAtpDc7Bbr8xplB8iFJBYvBC4fjGdgvnElqdwc6XFPGRnQxehC93wjgzbxRYf1UYA+dkiJSrG1DMV6zDoW+MkQmMkd8Owdl5AsvOM3gm0geeXwY7R/Tu0EcmM3re6cF2Rr/kTJiBMmPZh+2q/wtm4ozD9qrB0tucMhunvL0Upg1n6JmRnmda4HCckVkZeRyuMWjjF0peCD9vhK3jAgMzM/BCDQ576225m/bCwcA+qzS/PLUwDrsr1ZDdcAa3KtWQWzDYPKZoQDjeDJyoVEdOAPf0cA/Lf1F0IPy1fG8VWmXvgF4LnoOLDFoIvPiaUQuRr99pNr8dUZEj0YToQnfjreaQd7oL6T6Tuu+C7juo++6rfnOUv3W631jNb7v+P8U+1ZDAZxZG9R+q/e+GxcbPuRcRftkIq+pVVD2Srjdr94TDnJ6w7MGqedFhH1bVA6t67zk9/3ctzw+YAhvSc431KExyjjNHQ2zLcTRzq/8op0vKJd+OREbvUnJJAFZQOCBaBAAA8BUAnQEqPAA8AD5tMJRHJCMiISgb+1CADYlsAJ0zIUCfxfmY2f+0b2AbztDnPeKX0qPMp+wHrDehz0AP7J/o+tP9ADy3f23+C79yPYA/aqK9mONrQbuszbsEyALJNTfg+Z6NjG2v+ETCuvlr1q6QUqEiAMUndG/WwfnjJIOTfOBS4W1w0HjOJa1XQ2K33n2b07EOjOBapwKzyoA2erTBTnEKlFjllBy68GBjZ+UKnlzN/f5ibbb4gAD+i9OsnW0xUnmTpyhVasIKzTu0BsXnfBm4rHJqGMFJBUgTESDXEPcNjAeaHP8ck9qdNBH4L/h53tXgHeZttc7c4lwTa6U4Lziz8qUoy8ce0IMc5TFElawGj16tME0GzSSbUqgH7/tYA6huPsWM2z3GjP8b9y7paRbINxwYRtuE90I6QVsNrEkbhL1YfwxRXnuobOfSe3KFVamrvsOqwTCMqlNfjsR3pyoiZ+lYt3+AH6x4ZVNltbYI5KiVhgCu1isooK324ldloH3zhlefYKEwTCYfNjbeH5UiL7JSev+t/C+ftc3TkAHcsvrLCU6n5pYYY2Yr1kRq+r6XVzI6iXuA/TqwMk6xq1PmdzHOwKavncLjWJrk0uU/5E5WKqXM0tgl5s3pduHjb5aiAt0ikEisMyYwnIhDiSemPRdGON4RlwSb3OEpZjhuZqoyen4Sw/fULewt3hAZizeiPZx1o9LS3M/4r3v/M6/o5925VJcmxAf/yjsyjCz0mV+6NuIeWp8shrFaIGgeduVJoZ0Kys1WjSLuFg9QvF5LlkOZ2k7WrzSu4ucsUOS/X4wnQvB0RCnR1PCsU4NDdLfxvQITUgGIuVTJ7LR73PHzZam/Z21oy3euiU55ffITekwjR4SgVoPvhxbdBSyVePf/twm62pSK9IfgPGN+ttubhQub1ooVZymdQCrS3goEs6dlnl/6TVfkgxFyBfAORkZafeu/Va2vIgUBNUQd48W8oPiMFjx+SAKx1qm2IwCLnuhJGf9M4nCzu7oo43f+nBeT07IjB+FpFKRGFNvlpLEXhPclSgFkqeU1W2eNqW2zShCWkQkgfE1HAoNX3z+CQcRQJq+HkC2nSjFdFYT8UNYNS6lYcyVWzEnOos1qpsNRxnLqY2Dl5CCT3Yeg/qT8chfF9ZadFvzNTEIDlARoN//7IU23MtuLdpsAjsiGfBHuR7y4lemYPdD/9Cuff9Qn/r/xlhmB5x2Y9Z1yME3aANAb5+u3lYz01zUlWwakKVmv9fhaeu/YzQ7BXLlcb+cbaIF5t/COmObnt20zaTfjad542f7p7f2Xea134nvyPYS+EAgjM+GufHvl9tXCrrRbH0pn7kH2XEGx9VbO4mY54+QZa5kPr0j3AOEtKd7SJWjlg5TQfgIuB6KoLGainSwF+pPdiCmzEzAOa1eFwn//2VdDMeq42/bKH8U4orewhLh60ci/S0BRBuItNMc+v1+vxl0YyS5it4AAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Qd = "data:image/svg+xml,%3csvg%20width='868'%20height='868'%20viewBox='0%200%20868%20868'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='434'%20cy='434'%20r='434'%20fill='%231B262D'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M234.563%20184H640.697C650.387%20184%20659.339%20189.164%20664.172%20197.542L782.495%20402.657C788.631%20413.294%20786.808%20426.72%20778.056%20435.346L452.368%20756.327C441.818%20766.724%20424.846%20766.724%20414.296%20756.327L89.0484%20435.78C80.0927%20426.954%2078.4157%20413.136%2085.0013%20402.433L211.48%20196.884C216.405%20188.879%20225.146%20184%20234.563%20184ZM588.257%20275.577V333.129H472.567V373.032C553.82%20377.296%20614.782%20394.81%20615.234%20415.802L615.231%20459.563C614.779%20480.556%20553.82%20498.069%20472.567%20502.333V600.259H395.746V502.333C314.492%20498.069%20253.531%20480.555%20253.078%20459.563L253.081%20415.802C253.533%20394.81%20314.492%20377.296%20395.746%20373.032V333.129H280.055V275.577H588.257ZM434.156%20472.268C520.868%20472.268%20593.345%20457.459%20611.082%20437.683C596.041%20420.912%20541.636%20407.713%20472.567%20404.089V445.867C460.187%20446.516%20447.336%20446.858%20434.156%20446.858C420.976%20446.858%20408.125%20446.516%20395.746%20445.867V404.089C326.676%20407.713%20272.271%20420.912%20257.23%20437.683C274.968%20457.459%20347.444%20472.268%20434.156%20472.268Z'%20fill='%23009393'/%3e%3c/svg%3e";
function No(e) {
  const t = e.toUpperCase();
  return Qr.find((o) => o.symbol === t)?.decimals ?? 6;
}
function Gd(e, t) {
  const n = e.toUpperCase(), s = Qr.find((a) => a.symbol === n)?.decimals ?? t;
  return s === void 0 ? 2 : n === "SOL" ? 4 : s === 6 && n !== "SOL" ? 2 : s > 6 ? 6 : s;
}
const Qr = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: Hr
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: Vd
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: Qd
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
    logoUrl: qd
  },
  {
    mint: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    name: "WLFI USD",
    decimals: 6,
    logoUrl: $d
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logoUrl: zd
  },
  {
    mint: "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    name: "Hubble USD",
    decimals: 6,
    logoUrl: Hd
  },
  {
    mint: "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT",
    symbol: "CASH",
    name: "Stripe USD",
    decimals: 6,
    logoUrl: Wd
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoUrl: Od
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
    logoUrl: jd
  }
];
function Kd(e) {
  return e.companyFeePercent > 0 || e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap" || e.feePolicy === "user_pays_privacy";
}
function Yd(e, t, n) {
  const { feePolicy: o, privacyFeePercent: s, swapFeePercent: a, companyFeePercent: c } = e;
  let i = c;
  return n || (o === "user_pays_all" ? (i += a, t && (i += s)) : o === "user_pays_privacy" && t ? i += s : o === "user_pays_swap" && (i += a)), i;
}
const wt = 1e9, Ge = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoUrl: Hr
}, Ke = {
  mint: "other",
  symbol: "OTHER",
  name: "Other",
  decimals: 6
}, Eo = 1e4;
function Zd(e, t) {
  const n = t < e.publicMinUsd, o = t >= e.privateMinUsd, s = [], a = !n && o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0), c = !n && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0), i = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  if (a) {
    const l = e.privacyFeeFixedLamports / wt, u = e.privacyFeePercent, f = l * e.solPriceUsd, h = t * (u / 100);
    s.push({ label: "Privacy", solAmount: l, percent: u, usdAmount: f + h });
  }
  if (c) {
    const l = e.swapFeeFixedLamports / wt, u = e.swapFeePercent, f = l * e.solPriceUsd, h = t * (u / 100);
    s.push({ label: "Swap", solAmount: l, percent: u, usdAmount: f + h });
  }
  if (i) {
    const l = e.companyFeeFixedLamports / wt, u = e.companyFeePercent, f = l * e.solPriceUsd, h = t * (u / 100);
    s.push({ label: "Service", solAmount: l, percent: u, usdAmount: f + h });
  }
  return s;
}
function Co(e, t, n) {
  const o = Zd(e, t), s = n === 0 ? 0 : n < 0.01 ? 0.01 : n;
  if (o.length === 0)
    return n === 0 ? "No fees" : `Total: $${s.toFixed(2)}`;
  const a = o.reduce((w, p) => w + p.solAmount, 0), c = o.reduce((w, p) => w + p.percent, 0), i = { fee: 7, sol: 8, rate: 7, usd: 8 }, l = (w) => {
    const p = w.label.padEnd(i.fee), E = w.solAmount.toFixed(4).padStart(6).padEnd(i.sol), A = (w.percent.toFixed(2) + "%").padStart(5).padEnd(i.rate), N = ("$" + (w.usdAmount === 0 ? 0 : Math.max(w.usdAmount, 0.01)).toFixed(2)).padEnd(i.usd);
    return `${p} │ ${E} │ ${A} │ ${N}`;
  }, u = `${"Fee".padEnd(i.fee)} │ ${"SOL".padEnd(i.sol)} │ ${"+ Rate".padEnd(i.rate)} │ ${"= Total".padEnd(i.usd)}`, f = `${"─".repeat(i.fee)}─┼─${"─".repeat(i.sol)}─┼─${"─".repeat(i.rate)}─┼─${"─".repeat(i.usd)}`, h = ("$" + s.toFixed(2)).padEnd(i.usd), m = `${"TOTAL".padEnd(i.fee)} │ ${a.toFixed(4).padStart(6).padEnd(i.sol)} │ ${(c.toFixed(2) + "%").padStart(5).padEnd(i.rate)} │ ${h}`;
  return [u, f, ...o.map(l), f, m].join(`
`);
}
function Xd(e) {
  const t = [], n = e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0, o = e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0, s = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  return n && t.push("Privacy Cash fee"), o && t.push("swap fee"), s && t.push("company service fee"), t.length === 0 ? "No processing fees apply to deposits." : "A small fee may apply. We'll show exact totals before you confirm.";
}
function Tt(e, t) {
  if (t <= 0) return 0;
  const n = t < e.publicMinUsd, o = t >= e.privateMinUsd, s = Yd(e, o, n);
  let a = e.companyFeeFixedLamports;
  n || (o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (a += e.privacyFeeFixedLamports), (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (a += e.swapFeeFixedLamports));
  const c = a / wt * e.solPriceUsd, i = t * (s / 100);
  return c + i;
}
function xo(e, t, n) {
  return e === "sol" ? "SOL" : e === "single-token" ? t.symbol : n.some((s) => s.symbol === "USDC") ? "SOL or USDC" : "SOL or supported tokens";
}
function nn(e) {
  return e.map((t) => t.trim()).filter(Boolean);
}
const Jd = /* @__PURE__ */ new Set(["USDC", "USDT", "USD1", "PYUSD", "USDH", "CASH"]);
function Gr(e, t, n) {
  if (Jd.has(e.symbol)) return 1;
  const o = t.tokenPrices?.[e.symbol];
  if (o && o > 0) return o;
  if (e.symbol === "SOL") return t.solPriceUsd || null;
  const s = n?.[e.symbol];
  return s && s > 0 ? s : null;
}
function So(e, t) {
  return e.toFixed(Gd(t));
}
function ch({
  config: e,
  currencyMode: t,
  depositMethod: n,
  tokens: o = [],
  defaultToken: s,
  minAmount: a,
  maxAmount: c = 1e4,
  onSuccess: i,
  onError: l,
  onCancel: u,
  onUnlockRequired: f,
  onAuthorize: h,
  className: m = "",
  showStepIndicator: b = !0,
  pollInterval: w = 5e3,
  demoMode: p = !1,
  demoAutoConfirmMs: E,
  tokenPriceUsd: A,
  showExplainer: C = !1,
  siteName: N,
  explainerConfig: x
}) {
  const { deposit: R, getStatus: g, error: k, clearError: v } = Td(), y = Lt(), S = nn(e.quickActionTokens), L = nn(e.customTokenSymbols), M = z(() => {
    const j = e.customTokens ?? [];
    if (j.length === 0) return o;
    const Y = new Set(o.map((te) => te.symbol)), Z = [...o];
    for (const te of j)
      Y.has(te.symbol) || (Z.push({
        mint: te.mint,
        symbol: te.symbol,
        name: te.symbol,
        // Use symbol as name for custom tokens
        decimals: te.decimals,
        logoUrl: te.logoUrl
      }), Y.add(te.symbol));
    return Z;
  }, [o, e.customTokens]), P = z(() => {
    if (L.length === 0) return M;
    const j = M.filter((Y) => L.includes(Y.symbol));
    return j.length > 0 ? j : M;
  }, [M, L]), I = e.privateDepositsEnabled, _ = n ? n === "sign" && !I ? "receive" : n : I && y.hasExternalWallet ? "sign" : "receive", F = S[0] ? M.find((j) => j.symbol === S[0]) : void 0, W = t === "sol" ? Ge : t === "single-token" ? F ?? M.find((j) => j.symbol === "USDC") ?? M[0] ?? Ge : s ?? F ?? M.find((j) => j.symbol === "USDC") ?? M.find((j) => j.symbol !== "SOL") ?? M[0] ?? Ge, H = T(() => C ? "explainer" : "unlock", [C]), [V, D] = B(H), [U, K] = B(W), [se, ue] = B(""), [Ee, ye] = B(null), [G, $] = B(null), [ee, ge] = B(null), [Be, Yr] = B(null), [Mt, Xe] = B(!1), [Ro, It] = B(!1), [at, Zr] = B(null), ze = J(null);
  O(() => () => {
    ze.current && clearTimeout(ze.current);
  }, []), O(() => {
    D(H()), K(W), ue(""), ye(null), $(null), ge(null), Yr(null), Xe(!1), It(!1), Zr(null), v();
  }, [t, _, W, v]);
  const To = a ?? e.privateMinSol, Mo = c, it = parseFloat(se), Xr = y.status === "enrolled_locked" || y.status === "enrolled_unlocked" || y.status === "unlocked", _t = Xr && y.isUnlocked, Dt = Xr && !y.isUnlocked, Jr = T(() => {
    let Z = _ === "sign" ? [
      { key: "unlock", label: "Authorize" },
      { key: "confirm", label: "Send" },
      { key: "signing", label: "Signing" },
      { key: "success", label: "Complete" }
    ] : [
      { key: "unlock", label: "Authorize" },
      { key: "show-address", label: "Send" },
      { key: "waiting", label: "Confirming" },
      { key: "success", label: "Complete" }
    ];
    return C && (Z = [{ key: "explainer", label: "Info" }, ...Z]), Z;
  }, [_, C])(), Io = Jr.findIndex((j) => j.key === V), es = T((j) => {
    K(j);
  }, []), _o = T(
    async (j) => {
      if (!h) {
        D(_ === "sign" ? "confirm" : "show-address");
        return;
      }
      It(!0), $(null);
      try {
        const Z = await h(j, _ === "sign" ? it : null, U);
        ge(Z.sessionId), Yr(Z.depositAddress), D(_ === "sign" ? "confirm" : "show-address");
      } catch (Y) {
        const Z = Y instanceof Error ? Y : new Error("Authorization failed");
        $(Z.message);
      } finally {
        It(!1);
      }
    },
    [h, _, it, U]
  ), Do = T(
    async (j, Y) => {
      v(), $(null), D("signing");
      const Z = j ?? it, te = Y ?? U;
      if (!p) {
        if (Dt && f) {
          f(), D("confirm");
          return;
        }
        if (!_t) {
          $("Wallet not ready"), D("error");
          return;
        }
      }
      try {
        const we = Math.round(Z * Math.pow(10, te.decimals));
        if (p) {
          await new Promise((Ft) => setTimeout(Ft, 1500));
          const Ae = {
            token: t === "sol" ? null : te,
            amount: Z,
            amountSmallestUnit: we,
            txSignature: `demo-tx-${Date.now()}`,
            sessionId: ee || `demo-session-${Date.now()}`,
            response: {
              sessionId: ee || `demo-session-${Date.now()}`,
              txSignature: `demo-tx-${Date.now()}`,
              amountLamports: we,
              message: "Demo deposit successful",
              withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
            },
            method: "sign"
          };
          ye(Ae), D("success"), i?.(Ae);
          return;
        }
        const Pe = await R(we), Je = {
          token: t === "sol" ? null : te,
          amount: Z,
          amountSmallestUnit: we,
          txSignature: Pe.txSignature,
          sessionId: Pe.sessionId,
          response: Pe,
          method: "sign"
        };
        ye(Je), D("success"), i?.(Je);
      } catch (we) {
        const Pe = we instanceof Error ? we : new Error("Deposit failed");
        $(Pe.message), D("error"), l?.(Pe);
      }
    },
    [
      R,
      it,
      U,
      t,
      p,
      ee,
      _t,
      Dt,
      f,
      i,
      l,
      v
    ]
  ), Uo = T(() => {
    D("waiting");
  }, []), Ut = T(async () => {
    const j = Be || y.solanaPubkey;
    if (j) {
      ze.current && clearTimeout(ze.current);
      try {
        await navigator.clipboard.writeText(j), Xe(!0), ze.current = setTimeout(() => Xe(!1), 2e3);
      } catch {
        const Y = document.createElement("textarea");
        Y.value = j, document.body.appendChild(Y), Y.select(), document.execCommand("copy"), document.body.removeChild(Y), Xe(!0), ze.current = setTimeout(() => Xe(!1), 2e3);
      }
    }
  }, [Be, y.solanaPubkey]);
  O(() => {
    if (!(V === "confirm" || V === "show-address" || V === "waiting") || !ee || p) return;
    let Y = !1, Z = 0, te = 0;
    const we = 360, Pe = 5, Je = async () => {
      if (!(Y || Z >= we)) {
        Z++;
        try {
          const Ae = await g(ee);
          if (te = 0, Ae.status === "completed" || Ae.status === "detected") {
            const Ft = Ae.amountLamports ? Ae.amountLamports / Math.pow(10, U.decimals) : 0, Oo = Ae.amountLamports || 0, ts = {
              token: t === "sol" ? null : U,
              amount: Ft,
              amountSmallestUnit: Oo,
              txSignature: Ae.txSignature || "",
              sessionId: ee,
              response: Ae,
              method: "receive",
              depositAddress: y.solanaPubkey ?? void 0
            };
            ye(ts), D("success"), i?.(ts);
            return;
          }
        } catch {
          if (te++, te >= Pe) {
            $("Unable to check deposit status. Please check your connection and try again.");
            return;
          }
        }
        Y || setTimeout(Je, w);
      }
    };
    return Je(), () => {
      Y = !0;
    };
  }, [
    V,
    ee,
    p,
    g,
    U,
    t,
    y.solanaPubkey,
    i,
    w
  ]), O(() => {
    if (!p || !E || V !== "waiting" || _ !== "receive" || !Be) return;
    const j = window.setTimeout(() => {
      const Y = at ?? e.privateMinUsd, Z = U.symbol === "SOL" && e.solPriceUsd > 0 ? Y / e.solPriceUsd : Y, te = Math.round(Z * Math.pow(10, U.decimals)), we = {
        token: t === "sol" ? null : U,
        amount: Z,
        amountSmallestUnit: te,
        txSignature: `demo-tx-${Date.now()}`,
        sessionId: ee || `demo-session-${Date.now()}`,
        response: {
          sessionId: ee || `demo-session-${Date.now()}`,
          txSignature: `demo-tx-${Date.now()}`,
          amountLamports: te,
          message: "Demo deposit detected",
          withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
        },
        method: "receive",
        depositAddress: Be ?? void 0
      };
      ye(we), D("success"), i?.(we);
    }, E);
    return () => window.clearTimeout(j);
  }, [
    p,
    E,
    V,
    _,
    Be,
    at,
    e,
    U,
    t,
    ee,
    i
  ]);
  const Fo = T(() => {
    D(H()), ue(""), ye(null), $(null), v();
  }, [H, v]);
  return e.enabled ? /* @__PURE__ */ d("div", { className: `cedros-deposit-flow ${m}`, children: [
    b && V !== "error" && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-steps", children: Jr.map((j, Y) => {
      const Z = Io >= Y, te = j.key === V;
      return /* @__PURE__ */ d(
        "div",
        {
          className: `cedros-deposit-flow-step-item ${Z ? "step-active" : ""}`,
          children: [
            /* @__PURE__ */ r(
              "div",
              {
                className: `cedros-deposit-flow-step-circle ${Z ? "active" : ""} ${te ? "current" : ""}`,
                children: Y + 1
              }
            ),
            /* @__PURE__ */ r("span", { className: `cedros-deposit-flow-step-label ${Z ? "active" : ""}`, children: j.label })
          ]
        },
        j.key
      );
    }) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-content", children: [
      V === "explainer" && /* @__PURE__ */ r(
        eu,
        {
          siteName: N,
          config: x,
          depositConfig: e,
          currencyMode: t,
          token: U,
          tokens: P,
          onContinue: () => D("unlock"),
          onCancel: u
        }
      ),
      V === "unlock" && /* @__PURE__ */ r(
        tu,
        {
          token: U,
          tokens: P,
          currencyMode: t,
          depositMethod: _,
          isAuthorizing: Ro,
          error: G,
          onAuthorize: _o,
          onBack: C ? () => D("explainer") : void 0,
          onCancel: u
        }
      ),
      V === "confirm" && _ === "sign" && /* @__PURE__ */ r(
        ru,
        {
          token: U,
          tokens: M,
          quickActionSymbols: S,
          customTokenSymbols: L,
          currencyMode: t,
          minAmount: To,
          maxAmount: Mo,
          depositAddress: Be || y.solanaPubkey,
          walletReady: _t || p,
          needsUnlock: Dt && !p,
          copied: Mt,
          isListening: !!ee && !p,
          config: e,
          onCopy: Ut,
          onTokenSelect: es,
          onUnlockRequired: f,
          onConfirm: (j, Y) => Do(j, Y),
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      V === "signing" && /* @__PURE__ */ r(su, { depositAddress: y.solanaPubkey }),
      V === "show-address" && /* @__PURE__ */ r(
        nu,
        {
          token: U,
          tokens: M,
          quickActionSymbols: S,
          customTokenSymbols: L,
          tokenPriceUsd: A,
          currencyMode: t,
          depositAddress: Be || y.solanaPubkey,
          copied: Mt,
          isListening: !!ee && !p,
          config: e,
          onCopy: Ut,
          onTokenSelect: es,
          onAmountChange: Zr,
          onSent: Uo,
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      V === "waiting" && /* @__PURE__ */ r(
        ou,
        {
          token: U,
          depositAddress: Be || y.solanaPubkey,
          copied: Mt,
          feeLine: at ? (() => {
            const j = Tt(e, at);
            return j === 0 ? "No fees" : `Fees: $${Math.max(j, 0.01).toFixed(2)} total`;
          })() : "Fees: calculated after deposit",
          onCopy: Ut
        }
      ),
      V === "success" && Ee && /* @__PURE__ */ r(au, { result: Ee, config: e, onNewDeposit: Fo }),
      V === "error" && /* @__PURE__ */ r(
        iu,
        {
          error: G || k || "An error occurred",
          onRetry: () => D("confirm"),
          onCancel: u
        }
      )
    ] })
  ] }) : /* @__PURE__ */ r("div", { className: `cedros-deposit-flow cedros-deposit-flow-disabled ${m}`, children: /* @__PURE__ */ r("p", { children: "Deposits are not currently available." }) });
}
function eu({
  siteName: e,
  config: t,
  depositConfig: n,
  currencyMode: o,
  token: s,
  tokens: a,
  onContinue: c,
  onCancel: i
}) {
  const l = t?.title ?? "How Deposits Work", u = t?.exchangeName ?? "Coinbase", f = Ko(t?.exchangeUrl) ?? "https://www.coinbase.com", h = t?.showExchangeSuggestion !== !1, m = xo(o, s, a), b = e ? `${e} uses the Solana blockchain to process secure, private payments.` : "This site uses the Solana blockchain to process secure, private payments.", w = t?.body ?? b, p = Kd(n), E = Xd(n);
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: l }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: w }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-explainer-content", children: [
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-shield" }),
        /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ r("strong", { children: "Private & Secure" }),
          /* @__PURE__ */ r("p", { children: "Your deposits are protected by cryptographic privacy technology." })
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-bolt" }),
        /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ r("strong", { children: "Fast Transactions" }),
          /* @__PURE__ */ r("p", { children: "Solana transactions confirm in seconds, not minutes." })
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-coin" }),
        /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ r("strong", { children: p ? "Transparent Fees" : "Low Fees" }),
          /* @__PURE__ */ r("p", { children: E })
        ] })
      ] })
    ] }),
    h && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-explainer-exchange", children: /* @__PURE__ */ d("p", { className: "cedros-deposit-flow-explainer-exchange-text", children: [
      /* @__PURE__ */ r("strong", { children: "New to Solana?" }),
      " You can purchase ",
      m,
      " using your credit card at",
      " ",
      /* @__PURE__ */ r("a", { href: f, target: "_blank", rel: "noopener noreferrer", children: u }),
      ", then send it here to fund your account."
    ] }) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-actions", children: [
      i && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: i,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: c,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function tu({
  token: e,
  tokens: t,
  currencyMode: n,
  depositMethod: o,
  isAuthorizing: s,
  error: a,
  onAuthorize: c,
  onBack: i
}) {
  const [l, u] = B(""), f = xo(n, e, t), h = (m) => {
    m.preventDefault(), l.trim() && (c(l), u(""));
  };
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Authorize Deposit" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: o === "sign" ? n === "multi-token" ? "Enter your password to authorize a deposit. This allows us to process your withdrawal when the privacy period ends." : `Enter your password to authorize a ${f} deposit. This allows us to process your withdrawal when the privacy period ends.` : n === "multi-token" ? "Enter your password to get your deposit address. Any supported token sent to this address will be credited to your account." : `Enter your password to get your deposit address. Any ${f} sent to this address will be credited to your account.` }),
    /* @__PURE__ */ d("form", { onSubmit: h, children: [
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
        /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", htmlFor: "deposit-password", children: "Password" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "deposit-password",
            type: "password",
            value: l,
            onChange: (m) => u(m.target.value),
            className: "cedros-deposit-flow-input",
            placeholder: "Enter your password",
            disabled: s,
            autoComplete: "current-password"
          }
        )
      ] }),
      a && /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-error", children: a }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
            onClick: i,
            disabled: s,
            children: "Back"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "submit",
            className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
            disabled: !l.trim() || s,
            children: s ? "Authorizing..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function ru({
  token: e,
  tokens: t,
  quickActionSymbols: n,
  customTokenSymbols: o,
  currencyMode: s,
  minAmount: a,
  maxAmount: c,
  depositAddress: i,
  walletReady: l,
  needsUnlock: u,
  copied: f,
  isListening: h,
  config: m,
  onCopy: b,
  onTokenSelect: w,
  onUnlockRequired: p,
  onConfirm: E,
  onBack: A
}) {
  const [C, N] = B(m.privateMinUsd), [x, R] = B(!1), [g, k] = B(!1), [v, y] = B(0), [S, L] = B(null), P = Vr(C, m) === "sol_micro", I = e.symbol === Ke.symbol, _ = z(() => {
    const G = o.length === 0 ? t : t.filter((ge) => o.includes(ge.symbol)), $ = G.length > 0 ? G : t;
    return $.some((ge) => ge.symbol === Ke.symbol) ? $ : [...$, Ke];
  }, [t, o]), F = Tt(m, C), W = F === 0 ? 0 : F < 0.01 ? 0.01 : F, H = I ? "Fees: calculated after deposit" : F === 0 ? "No fees" : `Fees: $${W.toFixed(2)} total`, V = I ? "" : Co(m, C, F), D = Gr(P ? Ge : e, m), U = D ? C / D : e.symbol === "SOL" && m.solPriceUsd > 0 ? C / m.solPriceUsd : null, K = U != null ? So(U, P ? "SOL" : e.symbol) : null, ue = C - F <= 0 && C > 0, Ee = !I && C > 0 && !ue && U != null && U >= a && U <= c;
  O(() => {
    if (s === "multi-token")
      if (P && e.symbol !== "SOL") {
        L(e);
        const G = t.find(($) => $.symbol === "SOL");
        G && w(G);
      } else !P && S && e.symbol === "SOL" && (w(S), L(null));
  }, [P, e.symbol, s, t, w, S, e]);
  const ye = () => {
    Ee && U != null && E(U, e);
  };
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Choose Amount" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Set how much you want to deposit. Higher tiers unlock privacy." }),
    s === "multi-token" && !P && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-token-quick", children: [
        n.map((G) => {
          const $ = t.find((ge) => ge.symbol === G), ee = e.symbol === G;
          return /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${ee ? "is-active" : ""}`,
              onClick: () => {
                $ && (R(!1), w($));
              },
              disabled: !$,
              children: [
                $?.logoUrl && /* @__PURE__ */ r(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: $.logoUrl,
                    alt: `${G} logo`
                  }
                ),
                G
              ]
            },
            G
          );
        }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${x ? "is-active" : ""}`,
            onClick: () => {
              R(!0), y((G) => G + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      x && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ r(
        yo,
        {
          tokens: _,
          selectedToken: e,
          onSelect: w,
          openSignal: v
        }
      ) })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-field", children: /* @__PURE__ */ r(
      ko,
      {
        config: m,
        valueUsd: C,
        onChange: N,
        maxUsd: Eo
      }
    ) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: I ? "Sign to send tokens to this address" : `Sign to send ${K ?? "--"} ${P ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ r("code", { className: "cedros-deposit-flow-address", children: i || "Loading..." }),
        /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-actions", children: [
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-icon",
              onClick: b,
              title: "Copy address",
              disabled: !i,
              children: f ? "✓" : "⧉"
            }
          ),
          i && /* @__PURE__ */ r(
            "a",
            {
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-link cedros-deposit-flow-copy-icon",
              href: `https://orbmarkets.io/account/${i}`,
              target: "_blank",
              rel: "noopener noreferrer",
              title: "View on Orb Markets",
              children: "↗"
            }
          )
        ] })
      ] }),
      f && /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    ue && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-warning", children: /* @__PURE__ */ r("p", { children: "Deposit amount is less than the fees. Increase the amount to proceed." }) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ r("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ d("span", { children: [
          H,
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${g ? "is-open" : ""}`,
              "data-tooltip": V,
              "aria-label": `Fee breakdown: ${V.replaceAll(`
`, ", ")}`,
              "aria-expanded": g,
              onClick: (G) => {
                G.stopPropagation(), k(($) => !$);
              },
              onBlur: () => k(!1),
              onKeyDown: (G) => {
                G.key === "Escape" && k(!1);
              },
              children: "i"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ r("span", { children: "Credits appear after network confirmation." })
      ] })
    ] }),
    h && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-info-banner", children: "Listening for incoming transfers. We will confirm automatically." }),
    u && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-warning", children: [
      /* @__PURE__ */ r("p", { children: "Your wallet is locked. Unlock it to continue." }),
      p && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: p,
          children: "Unlock Wallet"
        }
      )
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: A,
          children: "Back"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: ye,
          disabled: !Ee || !l || !i,
          children: "Deposit"
        }
      )
    ] })
  ] });
}
function su({ depositAddress: e }) {
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-spinner" }),
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Signing Transfer" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Approve the transfer in your wallet extension..." }),
    e && /* @__PURE__ */ d("p", { className: "cedros-deposit-flow-signing-dest", children: [
      "Sending to:",
      " ",
      /* @__PURE__ */ d("code", { children: [
        e.slice(0, 6),
        "...",
        e.slice(-4)
      ] })
    ] })
  ] });
}
function nu({
  token: e,
  tokens: t,
  quickActionSymbols: n,
  customTokenSymbols: o,
  tokenPriceUsd: s,
  currencyMode: a,
  depositAddress: c,
  copied: i,
  isListening: l,
  config: u,
  onCopy: f,
  onTokenSelect: h,
  onAmountChange: m,
  onSent: b,
  onBack: w
}) {
  const [p, E] = B(u.privateMinUsd), [A, C] = B(!1), [N, x] = B(!1), [R, g] = B(0), [k, v] = B(null), S = Vr(p, u) === "sol_micro", L = e.symbol === Ke.symbol, M = z(() => {
    const U = o.length === 0 ? t : t.filter((ue) => o.includes(ue.symbol)), K = U.length > 0 ? U : t;
    return K.some((ue) => ue.symbol === Ke.symbol) ? K : [...K, Ke];
  }, [t, o]), P = Tt(u, p), I = P === 0 ? 0 : P < 0.01 ? 0.01 : P, _ = L ? "Fees: calculated after deposit" : P === 0 ? "No fees" : `Fees: $${I.toFixed(2)} total`, F = L ? "" : Co(u, p, P), W = L || p > 0, H = Gr(S ? Ge : e, u, s), V = H ? p / H : null, D = V ? So(V, e.symbol) : null;
  return O(() => {
    if (a === "multi-token")
      if (S && e.symbol !== "SOL") {
        v(e);
        const U = t.find((K) => K.symbol === "SOL");
        U && h(U);
      } else !S && k && e.symbol === "SOL" && (h(k), v(null));
  }, [S, e.symbol, a, t, h, k, e]), O(() => {
    m(p);
  }, [p, m]), c ? /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Send Deposit" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Send funds to your deposit address. We'll confirm automatically." }),
    a === "multi-token" && !S && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-token-quick", children: [
        n.map((U) => {
          const K = t.find((ue) => ue.symbol === U), se = e.symbol === U;
          return /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${se ? "is-active" : ""}`,
              onClick: () => {
                K && (C(!1), h(K));
              },
              disabled: !K,
              children: [
                K?.logoUrl && /* @__PURE__ */ r(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: K.logoUrl,
                    alt: `${U} logo`
                  }
                ),
                U
              ]
            },
            U
          );
        }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${A ? "is-active" : ""}`,
            onClick: () => {
              C(!0), g((U) => U + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      A && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ r(
        yo,
        {
          tokens: M,
          selectedToken: e,
          onSelect: h,
          openSignal: R
        }
      ) })
    ] }),
    !L && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Deposit Amount" }),
      /* @__PURE__ */ r(
        ko,
        {
          config: u,
          valueUsd: p,
          onChange: E,
          maxUsd: Eo
        }
      )
    ] }),
    L && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-note", children: "Send any token you want. We'll detect the deposit, swap it, and credit your balance automatically." }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: L ? "Send any token to this address" : `Send ${D ?? "--"} ${S ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ r("code", { className: "cedros-deposit-flow-address", children: c }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-copy-btn",
            onClick: f,
            title: "Copy address",
            children: i ? "✓" : "📋"
          }
        )
      ] }),
      i && /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ r("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ d("span", { children: [
          _,
          !L && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${N ? "is-open" : ""}`,
              "data-tooltip": F,
              "aria-label": `Fee breakdown: ${F.replaceAll(`
`, ", ")}`,
              "aria-expanded": N,
              onClick: (U) => {
                U.stopPropagation(), x((K) => !K);
              },
              onBlur: () => x(!1),
              onKeyDown: (U) => {
                U.key === "Escape" && x(!1);
              },
              children: "i"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ r("span", { children: "Credits appear after confirmation (typically ~30s)." })
      ] })
    ] }),
    l && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-info-banner", children: "Listening for your deposit. We'll notify you when it arrives." }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: w,
          children: "Back"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: b,
          disabled: !W,
          children: "I've Sent It"
        }
      )
    ] })
  ] }) : /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-error-icon", children: "!" }),
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Wallet Not Ready" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Your embedded wallet is not set up. Please complete wallet enrollment first." })
  ] });
}
function ou({ token: e, depositAddress: t, copied: n, feeLine: o, onCopy: s }) {
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-spinner" }),
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Waiting for Deposit" }),
    /* @__PURE__ */ d("p", { className: "cedros-deposit-flow-step-desc", children: [
      "Looking for incoming ",
      /* @__PURE__ */ r("strong", { children: e.symbol }),
      " deposits..."
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-waiting-info", children: [
      /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-waiting-text", children: "Once your transaction is confirmed on the Solana network, your account will be credited automatically. This usually takes 20-30 seconds." }),
      t && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
        /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Deposit address" }),
        /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-box", children: [
          /* @__PURE__ */ d("code", { className: "cedros-deposit-flow-address", children: [
            t.slice(0, 6),
            "...",
            t.slice(-6)
          ] }),
          /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-actions", children: [
            /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-icon",
                onClick: s,
                title: "Copy address",
                children: n ? "✓" : "⧉"
              }
            ),
            /* @__PURE__ */ r(
              "a",
              {
                className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-link cedros-deposit-flow-copy-icon",
                href: `https://orbmarkets.io/account/${t}`,
                target: "_blank",
                rel: "noopener noreferrer",
                title: "View on Orb Markets",
                children: "↗"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-stack", children: [
        /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
          /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
          /* @__PURE__ */ r("span", { children: "Send only on the Solana network." })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
          /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
          /* @__PURE__ */ r("span", { children: o })
        ] })
      ] })
    ] })
  ] });
}
function au({ result: e, config: t, onNewDeposit: n }) {
  const o = e.token ?? Ge, s = Gr(o, t), a = s ? e.amount * s : e.amount, c = Tt(t, a), i = Math.max(a - c, 0), l = c === 0 ? 0 : c < 0.01 ? 0.01 : c;
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-success-icon", children: "✓" }),
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Deposit Successful!" }),
    /* @__PURE__ */ d("p", { className: "cedros-deposit-flow-step-desc", children: [
      "Your deposit of ",
      e.amount.toLocaleString(),
      " ",
      o.symbol,
      " has been received."
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-summary", children: [
      e.txSignature && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-summary-label", children: "Transaction" }),
        /* @__PURE__ */ d("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-tx", children: [
          /* @__PURE__ */ d(
            "a",
            {
              href: `https://orbmarkets.io/tx/${e.txSignature}`,
              target: "_blank",
              rel: "noopener noreferrer",
              children: [
                e.txSignature.slice(0, 8),
                "...",
                e.txSignature.slice(-8)
              ]
            }
          ),
          /* @__PURE__ */ r(
            "a",
            {
              className: "cedros-deposit-flow-tx-action",
              href: `https://orbmarkets.io/tx/${e.txSignature}`,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": "View transaction on Orb Markets",
              title: "View transaction",
              children: "↗"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-summary-label", children: "Deposit Amount" }),
        /* @__PURE__ */ d("span", { className: "cedros-deposit-flow-summary-value", children: [
          "$",
          a.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-summary-label", children: "Total Fees" }),
        /* @__PURE__ */ d("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-fee", children: [
          "-$",
          l.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-summary-label", children: "Credits Added" }),
        /* @__PURE__ */ d("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-credit", children: [
          "+$",
          i.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-summary-label", children: "Available" }),
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-summary-value", children: "Immediately" })
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
        onClick: n,
        children: "Make Another Deposit"
      }
    ) })
  ] });
}
function iu({ error: e, onRetry: t, onCancel: n }) {
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-error-icon", children: "✕" }),
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Deposit Failed" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-error-message", children: e }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-actions", children: [
      n && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: n,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: t,
          children: "Try Again"
        }
      )
    ] })
  ] });
}
function Lo() {
  const e = We(), [t, n] = B(!1), [o, s] = B(null), a = z(() => e ? new ce({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), c = T(() => {
    s(null);
  }, []), i = T(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    n(!0), s(null);
    try {
      return await a.get("/credits/balance/sol");
    } catch (f) {
      const h = q(f, "Failed to fetch credit balance");
      throw s(h.message), h;
    } finally {
      n(!1);
    }
  }, [a]), l = T(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    n(!0), s(null);
    try {
      return (await a.get("/credits/balance")).balances;
    } catch (f) {
      const h = q(f, "Failed to fetch credit balances");
      throw s(h.message), h;
    } finally {
      n(!1);
    }
  }, [a]), u = T(
    async (f) => {
      if (!a)
        throw new Error("useCredits must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const h = new URLSearchParams();
        f?.currency && h.set("currency", f.currency), f?.limit !== void 0 && h.set("limit", f.limit.toString()), f?.offset !== void 0 && h.set("offset", f.offset.toString());
        const m = h.toString(), b = m ? `/credits/history?${m}` : "/credits/history";
        return await a.get(b);
      } catch (h) {
        const m = q(h, "Failed to fetch transaction history");
        throw s(m.message), m;
      } finally {
        n(!1);
      }
    },
    [a]
  );
  return {
    getBalance: i,
    getAllBalances: l,
    getHistory: u,
    isLoading: t,
    error: o,
    clearError: c
  };
}
function lh({
  showAllCurrencies: e = !1,
  refreshInterval: t = 0,
  compact: n = !1,
  className: o = "",
  onLoad: s
}) {
  const { getBalance: a, getAllBalances: c, isLoading: i, error: l, clearError: u } = Lo(), [f, h] = B([]), [m, b] = B(null), w = T(async () => {
    try {
      if (e) {
        const p = await c();
        h(p), s?.(p);
      } else {
        const p = await a();
        h([p]), s?.([p]);
      }
      b(null);
    } catch (p) {
      b(p instanceof Error ? p.message : "Failed to load balance");
    }
  }, [e, a, c, s]);
  if (O(() => {
    w();
  }, [w]), O(() => {
    if (t <= 0) return;
    const p = setInterval(w, t);
    return () => clearInterval(p);
  }, [t, w]), m || l)
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-error ${o}`, children: [
      /* @__PURE__ */ r("p", { className: "cedros-credit-error", children: m || l }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-credit-retry",
          onClick: () => {
            u(), b(null), w();
          },
          children: "Retry"
        }
      )
    ] });
  if (i && f.length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-loading ${o}`, children: [
      /* @__PURE__ */ r("span", { className: "cedros-credit-loading-indicator" }),
      /* @__PURE__ */ r("span", { className: "cedros-credit-loading-text", children: "Loading balance..." })
    ] });
  if (n) {
    const p = f[0];
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-compact ${o}`, children: [
      p ? /* @__PURE__ */ r(
        "span",
        {
          className: "cedros-credit-value",
          title: `${p.balanceLamports} lamports`,
          children: p.display
        }
      ) : /* @__PURE__ */ r("span", { className: "cedros-credit-value cedros-credit-value-zero", children: "0.0000 SOL" }),
      i && /* @__PURE__ */ r("span", { className: "cedros-credit-refresh-indicator", title: "Refreshing..." })
    ] });
  }
  return /* @__PURE__ */ d("div", { className: `cedros-credit-balance ${o}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-credit-header", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-credit-title", children: "Credit Balance" }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-credit-refresh",
          onClick: w,
          disabled: i,
          title: "Refresh balance",
          children: i ? "..." : "↻"
        }
      )
    ] }),
    f.length === 0 ? /* @__PURE__ */ d("div", { className: "cedros-credit-empty", children: [
      /* @__PURE__ */ r("p", { className: "cedros-credit-empty-message", children: "No credit balance yet." }),
      /* @__PURE__ */ r("p", { className: "cedros-credit-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ r("div", { className: "cedros-credit-list", children: f.map((p) => /* @__PURE__ */ d("div", { className: "cedros-credit-item", children: [
      /* @__PURE__ */ r("span", { className: "cedros-credit-currency", children: p.currency }),
      /* @__PURE__ */ r("span", { className: "cedros-credit-amount", children: p.display })
    ] }, p.currency)) })
  ] });
}
const br = [
  { key: "all", label: "All", txTypes: null },
  { key: "deposits", label: "Deposits", txTypes: ["deposit"] },
  { key: "usage", label: "Usage", txTypes: ["spend", "usage", "charge"] },
  {
    key: "adjustments",
    label: "Adjustments",
    txTypes: ["refund", "adjustment", "bonus", "credit"]
  }
];
function cu(e, t) {
  const n = e < 0, o = Math.abs(e), s = No(t), a = o / Math.pow(10, s), c = n ? "-" : "+";
  return t.toUpperCase() === "SOL" ? `${c}${a.toFixed(4)} SOL` : `${c}$${a.toFixed(2)}`;
}
function lu(e) {
  const t = new Date(e), n = /* @__PURE__ */ new Date(), o = n.getTime() - t.getTime();
  if (o < 0) return "Just now";
  const s = Math.floor(o / (1e3 * 60 * 60 * 24));
  if (s === 0) {
    const a = Math.floor(o / 36e5);
    if (a === 0) {
      const c = Math.floor(o / 6e4);
      return c < 1 ? "Just now" : `${c}m ago`;
    }
    return `${a}h ago`;
  }
  return s === 1 ? "Yesterday" : s < 7 ? `${s}d ago` : t.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: t.getFullYear() !== n.getFullYear() ? "numeric" : void 0
  });
}
function du(e) {
  return e ? {
    deposit: "Deposit",
    spend: "Usage",
    usage: "Usage",
    charge: "Charge",
    refund: "Refund",
    adjustment: "Adjustment",
    bonus: "Bonus",
    credit: "Credit"
  }[e.toLowerCase()] || e : "Transaction";
}
function uu(e, t) {
  const n = (e || "").toLowerCase();
  return n === "deposit" ? "↓" : n === "spend" || n === "usage" || n === "charge" ? "↑" : n === "refund" ? "←" : n === "bonus" || n === "credit" ? "★" : t ? "+" : "−";
}
function dh({
  defaultTab: e = "all",
  pageSize: t = 10,
  refreshInterval: n = 0,
  className: o = "",
  onLoad: s,
  onTransactionClick: a
}) {
  const { getHistory: c, isLoading: i, error: l, clearError: u } = Lo(), [f, h] = B(e), [m, b] = B([]), [w, p] = B(0), [E, A] = B(0), [C, N] = B(null), x = br.find((P) => P.key === f) || br[0], R = z(() => x.txTypes === null ? m : m.filter((P) => {
    const I = P.txType || "";
    return x.txTypes.some((_) => I.toLowerCase() === _.toLowerCase());
  }), [m, x.txTypes]), g = T(async () => {
    try {
      const P = await c({ limit: t * 3, offset: E });
      b(P.transactions), p(P.total), s?.(P), N(null);
    } catch (P) {
      N(P instanceof Error ? P.message : "Failed to load history");
    }
  }, [t, E, c, s]);
  O(() => {
    A(0);
  }, [f]), O(() => {
    g();
  }, [g]), O(() => {
    if (n <= 0) return;
    const P = setInterval(g, n);
    return () => clearInterval(P);
  }, [n, g]);
  const k = x.txTypes === null ? w : R.length, v = Math.ceil(k / t), y = Math.floor(E / t) + 1, S = (P) => {
    const I = (P - 1) * t;
    A(Math.max(0, Math.min(I, Math.max(0, k - t))));
  }, L = (P) => {
    h(P);
  };
  if (C || l)
    return /* @__PURE__ */ d("div", { className: `cedros-tx-history cedros-tx-history-error ${o}`, children: [
      /* @__PURE__ */ r("p", { className: "cedros-tx-error", children: C || l }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-tx-retry",
          onClick: () => {
            u(), N(null), g();
          },
          children: "Retry"
        }
      )
    ] });
  if (i && m.length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-tx-history cedros-tx-history-loading ${o}`, children: [
      /* @__PURE__ */ r("span", { className: "cedros-tx-loading-indicator" }),
      /* @__PURE__ */ r("span", { className: "cedros-tx-loading-text", children: "Loading transactions..." })
    ] });
  const M = (P) => P.txTypes === null ? m.length : m.filter((I) => {
    const _ = I.txType || "";
    return P.txTypes.some((F) => _.toLowerCase() === F.toLowerCase());
  }).length;
  return /* @__PURE__ */ d("div", { className: `cedros-tx-history ${o}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-tx-header", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-tx-title", children: "Transaction History" }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-tx-refresh",
          onClick: g,
          disabled: i,
          title: "Refresh",
          children: i ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-tx-tabs", children: br.map((P) => {
      const I = M(P), _ = f === P.key;
      return /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: `cedros-tx-tab ${_ ? "cedros-tx-tab-active" : ""}`,
          onClick: () => L(P.key),
          children: [
            P.label,
            I > 0 && /* @__PURE__ */ r("span", { className: "cedros-tx-tab-count", children: I })
          ]
        },
        P.key
      );
    }) }),
    R.length === 0 ? /* @__PURE__ */ d("div", { className: "cedros-tx-empty", children: [
      /* @__PURE__ */ r("p", { className: "cedros-tx-empty-message", children: f === "all" ? "No transactions yet." : `No ${x.label.toLowerCase()} found.` }),
      f === "all" && /* @__PURE__ */ r("p", { className: "cedros-tx-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-tx-list", children: R.slice(0, t).map((P) => {
        const I = P.amountLamports >= 0;
        return /* @__PURE__ */ d(
          "div",
          {
            className: `cedros-tx-item ${I ? "cedros-tx-item-positive" : "cedros-tx-item-negative"}`,
            onClick: () => a?.(P),
            onKeyDown: (_) => {
              (_.key === "Enter" || _.key === " ") && (_.preventDefault(), a?.(P));
            },
            role: a ? "button" : void 0,
            tabIndex: a ? 0 : void 0,
            children: [
              /* @__PURE__ */ r(
                "div",
                {
                  className: `cedros-tx-icon ${I ? "cedros-tx-icon-positive" : "cedros-tx-icon-negative"}`,
                  children: uu(P.txType, I)
                }
              ),
              /* @__PURE__ */ d("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-tx-type", children: du(P.txType) }),
                  /* @__PURE__ */ r(
                    "span",
                    {
                      className: `cedros-tx-amount ${I ? "cedros-tx-amount-positive" : "cedros-tx-amount-negative"}`,
                      children: cu(P.amountLamports, P.currency)
                    }
                  )
                ] }),
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-tx-description", children: P.description }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-date", children: lu(P.createdAt) })
                ] })
              ] })
            ]
          },
          P.id
        );
      }) }),
      v > 1 && /* @__PURE__ */ d("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => S(y - 1),
            disabled: y <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ d("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          y,
          " of ",
          v
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => S(y + 1),
            disabled: y >= v,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Bo() {
  const e = We(), [t, n] = B(!1), [o, s] = B(null), [a, c] = B(null), i = z(() => e ? new ce({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), l = T(() => {
    s(null);
  }, []), u = T(async () => {
    if (!i)
      throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
    try {
      return await i.get("/wallet/withdraw/balances");
    } catch (b) {
      const w = q(b, "Failed to fetch wallet balances");
      throw s(w.message), w;
    }
  }, [i]), f = T(
    async (b, w) => {
      if (!i)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const p = await i.post("/wallet/withdraw/sol", {
          destination: b,
          amount_lamports: w
        });
        return c(p), p;
      } catch (p) {
        const E = q(p, "Failed to withdraw SOL");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [i]
  ), h = T(
    async (b, w, p) => {
      if (!i)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const E = await i.post("/wallet/withdraw/spl", {
          destination: b,
          token_mint: w,
          amount: p
        });
        return c(E), E;
      } catch (E) {
        const A = q(E, "Failed to withdraw token");
        throw s(A.message), A;
      } finally {
        n(!1);
      }
    },
    [i]
  ), m = T(
    async (b = 10, w = 0) => {
      if (!i)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      try {
        const p = Math.max(1, Math.min(100, Math.trunc(b))), E = Math.max(0, Math.trunc(w)), A = new URLSearchParams({
          limit: String(p),
          offset: String(E)
        });
        return await i.get(
          `/wallet/withdraw/history?${A}`
        );
      } catch (p) {
        const E = q(p, "Failed to fetch withdrawal history");
        throw s(E.message), E;
      }
    },
    [i]
  );
  return {
    withdrawSol: f,
    withdrawSpl: h,
    getBalances: u,
    getHistory: m,
    isSubmitting: t,
    error: o,
    clearError: l,
    lastResult: a
  };
}
const yr = "So11111111111111111111111111111111111111112", hu = {
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
  HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr: "EURC",
  USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB: "USD1",
  "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo": "PYUSD",
  USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX: "USDH",
  CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT: "CASH",
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: "BONK",
  oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp: "ORE"
};
function fu(e) {
  return e.length < 32 || e.length > 50 ? !1 : /^[1-9A-HJ-NP-Za-km-z]+$/.test(e);
}
function Ar(e) {
  return e.length <= 16 ? e : `${e.slice(0, 6)}...${e.slice(-6)}`;
}
function mt(e, t) {
  return (Number(e) / Math.pow(10, t)).toLocaleString(void 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(t, 6)
  });
}
function uh({
  onSuccess: e,
  onError: t,
  onCancel: n,
  className: o = ""
}) {
  const s = We(), { withdrawSol: a, withdrawSpl: c, getBalances: i, isSubmitting: l, error: u, clearError: f } = Bo(), [h, m] = B("loading"), [b, w] = B([]), [p, E] = B(null), [A, C] = B(""), [N, x] = B(""), [R, g] = B(null), [k, v] = B(null), [y, S] = B(null), L = s?.config.solana?.network ?? "mainnet-beta", M = z(() => {
    if (!R?.txSignature) return "";
    const D = `https://explorer.solana.com/tx/${R.txSignature}`;
    return L === "mainnet-beta" ? D : `${D}?cluster=${encodeURIComponent(L)}`;
  }, [R, L]), P = z(() => {
    if (!p || !N) return "0";
    const D = parseFloat(N);
    return isNaN(D) || D <= 0 ? "0" : Math.floor(D * Math.pow(10, p.decimals)).toString();
  }, [N, p]);
  O(() => {
    if (!s) return;
    let D = !1;
    return (async () => {
      try {
        const U = await i();
        if (D) return;
        const K = [];
        U.solLamports > 0 && K.push({
          symbol: "SOL",
          mint: yr,
          decimals: 9,
          rawBalance: String(U.solLamports),
          displayBalance: mt(String(U.solLamports), 9)
        });
        for (const se of U.tokens) {
          const ue = hu[se.mint] ?? Ar(se.mint);
          K.push({
            symbol: ue,
            mint: se.mint,
            decimals: se.decimals,
            rawBalance: se.amount,
            displayBalance: mt(se.amount, se.decimals)
          });
        }
        w(K), m((K.length > 0, "select"));
      } catch {
        D || (S("Failed to load wallet balances"), m("select"));
      }
    })(), () => {
      D = !0;
    };
  }, [s, i]);
  const I = T(
    (D) => {
      E(D), m("form"), f(), v(null), x("");
    },
    [f]
  ), _ = T(() => {
    if (!p) return;
    const D = Number(p.rawBalance) / Math.pow(10, p.decimals);
    p.mint === yr ? x(String(Math.max(0, D - 0.01))) : x(String(D));
  }, [p]), F = T(() => {
    if (v(null), !A.trim()) {
      v("Destination address is required");
      return;
    }
    if (!fu(A.trim())) {
      v("Invalid Solana address");
      return;
    }
    if (!N || parseFloat(N) <= 0 || isNaN(parseFloat(N))) {
      v("Please enter a valid amount");
      return;
    }
    if (P === "0") {
      v("Amount is too small");
      return;
    }
    m("confirm");
  }, [A, N, P]), W = T(async () => {
    if (p) {
      m("processing"), f();
      try {
        let D;
        p.mint === yr ? D = await a(A.trim(), Number(P)) : D = await c(A.trim(), p.mint, P), g(D), m("success"), e?.(D);
      } catch (D) {
        m("confirm"), t?.(D instanceof Error ? D : new Error(String(D)));
      }
    }
  }, [
    p,
    A,
    P,
    a,
    c,
    f,
    e,
    t
  ]), H = T(() => {
    f(), v(null), h === "form" ? (m("select"), E(null), x(""), C("")) : h === "confirm" && m("form");
  }, [h, f]), V = T(() => {
    m("select"), E(null), C(""), x(""), g(null), f(), v(null);
  }, [f]);
  return s ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal ${o}`, children: [
    h === "loading" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ r(Q, {}),
      /* @__PURE__ */ r("p", { className: "cedros-withdrawal-processing-text", children: "Loading wallet balances..." })
    ] }),
    h === "select" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-select", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Withdraw" }),
        /* @__PURE__ */ r("p", { className: "cedros-withdrawal-subtitle", children: "Select a token to withdraw" })
      ] }),
      y && /* @__PURE__ */ r(re, { error: y }),
      b.length === 0 && !y && /* @__PURE__ */ r("p", { className: "cedros-withdrawal-empty", children: "No tokens found in your wallet." }),
      /* @__PURE__ */ r("div", { className: "cedros-withdrawal-tokens", children: b.map((D) => /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: "cedros-withdrawal-token-pill",
          onClick: () => I(D),
          children: [
            /* @__PURE__ */ r("span", { className: "cedros-withdrawal-token-symbol", children: D.symbol }),
            /* @__PURE__ */ r("span", { className: "cedros-withdrawal-token-balance", children: D.displayBalance })
          ]
        },
        D.mint
      )) }),
      n && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-ghost cedros-withdrawal-cancel",
          onClick: n,
          children: "Cancel"
        }
      )
    ] }),
    h === "form" && p && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-form", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: H,
            children: "Back"
          }
        ),
        /* @__PURE__ */ d("h3", { className: "cedros-withdrawal-title", children: [
          "Withdraw ",
          p.symbol
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-balance-hint", children: [
        "Balance: ",
        p.displayBalance,
        " ",
        p.symbol
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ r("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-destination", children: "Destination Address" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "cedros-withdrawal-destination",
            type: "text",
            className: "cedros-input",
            placeholder: "Solana address (base58)",
            value: A,
            onChange: (D) => C(D.target.value),
            autoComplete: "off",
            spellCheck: !1
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ d("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-amount", children: [
          "Amount (",
          p.symbol,
          ")"
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-amount-row", children: [
          /* @__PURE__ */ r(
            "input",
            {
              id: "cedros-withdrawal-amount",
              type: "number",
              className: "cedros-input",
              placeholder: "0.00",
              value: N,
              onChange: (D) => x(D.target.value),
              min: "0",
              step: "any"
            }
          ),
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-ghost cedros-button-sm",
              onClick: _,
              children: "Max"
            }
          )
        ] })
      ] }),
      (k || u) && /* @__PURE__ */ r(re, { error: k || u || "" }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-withdrawal-submit",
          onClick: F,
          children: "Review Withdrawal"
        }
      )
    ] }),
    h === "confirm" && p && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-confirm", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: H,
            disabled: l,
            children: "Back"
          }
        ),
        /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Confirm Withdrawal" })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary", children: [
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Token" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", children: p.symbol })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Amount" }),
          /* @__PURE__ */ d("span", { className: "cedros-withdrawal-summary-value", children: [
            mt(P, p.decimals),
            " ",
            p.symbol
          ] })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Destination" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", title: A, children: Ar(A) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Est. Fee" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", children: "~0.000005 SOL" })
        ] })
      ] }),
      u && /* @__PURE__ */ r(re, { error: u }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: H,
            disabled: l,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: W,
            disabled: l,
            children: l ? "Sending..." : "Confirm & Send"
          }
        )
      ] })
    ] }),
    h === "processing" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ r(Q, {}),
      /* @__PURE__ */ d("p", { className: "cedros-withdrawal-processing-text", children: [
        "Sending ",
        p?.symbol,
        "..."
      ] })
    ] }),
    h === "success" && R && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-success", children: [
      /* @__PURE__ */ r("div", { className: "cedros-withdrawal-success-icon", children: "✓" }),
      /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Withdrawal Complete" }),
      /* @__PURE__ */ d("p", { className: "cedros-withdrawal-subtitle", children: [
        mt(P, p?.decimals ?? 9),
        " ",
        p?.symbol,
        " ",
        "sent"
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-tx", children: [
        /* @__PURE__ */ r("span", { className: "cedros-withdrawal-tx-label", children: "Transaction" }),
        /* @__PURE__ */ r(
          "a",
          {
            className: "cedros-withdrawal-tx-link",
            href: M,
            target: "_blank",
            rel: "noreferrer",
            children: Ar(R.txSignature)
          }
        )
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-withdrawal-done",
          onClick: V,
          children: "Done"
        }
      )
    ] })
  ] }) : null;
}
function mu(e, t) {
  if (e === "sol") return "SOL";
  if (!t) return "SPL";
  const n = Qr.find((o) => o.mint === t);
  return n ? n.symbol : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function pu(e, t) {
  const n = Number(e);
  if (Number.isNaN(n)) return e;
  const o = No(t), s = n / Math.pow(10, o);
  return t === "SOL" ? `${s.toFixed(4)} SOL` : `${s.toFixed(2)} ${t}`;
}
function gu(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function wu(e) {
  const t = new Date(e), n = /* @__PURE__ */ new Date(), o = n.getTime() - t.getTime();
  if (o < 0) return "Just now";
  const s = Math.floor(o / (1e3 * 60 * 60 * 24));
  if (s === 0) {
    const a = Math.floor(o / 36e5);
    if (a === 0) {
      const c = Math.floor(o / 6e4);
      return c < 1 ? "Just now" : `${c}m ago`;
    }
    return `${a}h ago`;
  }
  return s === 1 ? "Yesterday" : s < 7 ? `${s}d ago` : t.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: t.getFullYear() !== n.getFullYear() ? "numeric" : void 0
  });
}
function hh({
  pageSize: e = 10,
  className: t = "",
  onTransactionClick: n,
  explorerUrl: o = "https://solscan.io"
}) {
  const s = o.startsWith("https://") ? o : "https://solscan.io", { getHistory: a, error: c, clearError: i } = Bo(), [l, u] = B([]), [f, h] = B(0), [m, b] = B(0), [w, p] = B(!1), [E, A] = B(null), C = T(async () => {
    p(!0);
    try {
      const g = await a(e, m);
      u(g.items), h(g.total), A(null);
    } catch (g) {
      A(g instanceof Error ? g.message : "Failed to load withdrawal history");
    } finally {
      p(!1);
    }
  }, [e, m, a]);
  O(() => {
    C();
  }, [C]);
  const N = Math.ceil(f / e), x = Math.floor(m / e) + 1, R = (g) => {
    const k = (g - 1) * e;
    b(Math.max(0, Math.min(k, Math.max(0, f - e))));
  };
  return E || c ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-error ${t}`, children: [
    /* @__PURE__ */ r("p", { className: "cedros-withdrawal-error", children: E || c }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-withdrawal-retry",
        onClick: () => {
          i(), A(null), C();
        },
        children: "Retry"
      }
    )
  ] }) : w && l.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-loading ${t}`, children: [
    /* @__PURE__ */ r("span", { className: "cedros-tx-loading-indicator" }),
    /* @__PURE__ */ r("span", { className: "cedros-tx-loading-text", children: "Loading withdrawal history..." })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-withdrawal-history ${t}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-tx-header", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-tx-title", children: "Withdrawal History" }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-tx-refresh",
          onClick: C,
          disabled: w,
          title: "Refresh",
          children: w ? "..." : "↻"
        }
      )
    ] }),
    l.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-tx-empty", children: /* @__PURE__ */ r("p", { className: "cedros-tx-empty-message", children: "No withdrawal history yet." }) }) : /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-tx-list", children: l.map((g) => {
        const k = mu(g.tokenType, g.tokenMint);
        return /* @__PURE__ */ d(
          "div",
          {
            className: "cedros-tx-item cedros-tx-item-negative",
            onClick: () => n?.(g),
            onKeyDown: (v) => {
              (v.key === "Enter" || v.key === " ") && (v.preventDefault(), n?.(g));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ r("div", { className: "cedros-tx-icon cedros-tx-icon-negative", children: "↑" }),
              /* @__PURE__ */ d("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ d("span", { className: "cedros-tx-type", children: [
                    k,
                    " Withdrawal"
                  ] }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-amount cedros-tx-amount-negative", children: pu(g.amount, k) })
                ] }),
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ d("span", { className: "cedros-tx-description", children: [
                    "To",
                    " ",
                    /* @__PURE__ */ r(
                      "a",
                      {
                        href: `${s}/account/${g.destination}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (v) => v.stopPropagation(),
                        children: gu(g.destination)
                      }
                    ),
                    " · ",
                    /* @__PURE__ */ r(
                      "a",
                      {
                        href: `${s}/tx/${g.txSignature}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (v) => v.stopPropagation(),
                        children: "tx"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-date", children: wu(g.createdAt) })
                ] })
              ] })
            ]
          },
          g.id
        );
      }) }),
      N > 1 && /* @__PURE__ */ d("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => R(x - 1),
            disabled: x <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ d("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          x,
          " of ",
          N
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => R(x + 1),
            disabled: x >= N,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function fh({
  brandLogo: e,
  brandName: t,
  title: n = "Welcome back",
  subtitle: o = "Login with your Apple or Google account",
  termsText: s,
  onSuccess: a,
  defaultTab: c = "login",
  children: i,
  className: l = ""
}) {
  return /* @__PURE__ */ d("div", { className: `cedros-full-page-layout ${l}`, children: [
    (e || t) && /* @__PURE__ */ d("div", { className: "cedros-brand-header", children: [
      e,
      t && /* @__PURE__ */ r("span", { className: "cedros-brand-name", children: t })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-full-page-card", children: [
      /* @__PURE__ */ d("div", { className: "cedros-full-page-header", children: [
        /* @__PURE__ */ r("h1", { className: "cedros-full-page-title", children: n }),
        o && /* @__PURE__ */ r("p", { className: "cedros-full-page-subtitle", children: o })
      ] }),
      i ?? /* @__PURE__ */ r(jr, { defaultTab: c, onSuccess: a })
    ] }),
    s && /* @__PURE__ */ r("p", { className: "cedros-terms-footer", children: s })
  ] });
}
function mh({
  brandName: e = "Your Brand",
  brandLogo: t,
  tagline: n = "Your tagline goes here. Make it compelling.",
  title: o = "Sign in",
  subtitle: s = "Enter your credentials to access your account",
  onSuccess: a,
  defaultTab: c = "login",
  children: i,
  className: l = ""
}) {
  return /* @__PURE__ */ d("div", { className: `cedros-split-page-layout ${l}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-split-page-brand", children: /* @__PURE__ */ d("div", { className: "cedros-split-page-brand-content", children: [
      t ?? /* @__PURE__ */ r("div", { className: "cedros-split-page-logo", children: e.charAt(0).toUpperCase() }),
      /* @__PURE__ */ r("h1", { className: "cedros-split-page-brand-name", children: e }),
      n && /* @__PURE__ */ r("p", { className: "cedros-split-page-tagline", children: n })
    ] }) }),
    /* @__PURE__ */ r("div", { className: "cedros-split-page-form", children: /* @__PURE__ */ d("div", { className: "cedros-split-page-form-content", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-split-page-title", children: o }),
      s && /* @__PURE__ */ r("p", { className: "cedros-split-page-subtitle", children: s }),
      i ?? /* @__PURE__ */ r(jr, { defaultTab: c, onSuccess: a })
    ] }) })
  ] });
}
function ph() {
  const { config: e, _internal: t } = ne(), [n, o] = B({
    allowed: !1,
    reason: void 0,
    isLoading: !1,
    error: null
  }), s = z(
    () => new ma(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      t?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t]
  ), a = T(
    async (l) => {
      o((u) => ({ ...u, isLoading: !0, error: null }));
      try {
        const u = await s.authorize(l), f = {
          allowed: u.allowed,
          reason: u.reason,
          isLoading: !1,
          error: null
        };
        return o(f), f;
      } catch (u) {
        const f = {
          allowed: !1,
          reason: void 0,
          isLoading: !1,
          error: u
        };
        return o(f), f;
      }
    },
    [s]
  ), c = T(
    async (l) => (await a(l)).allowed,
    [a]
  ), i = T(() => {
    o({
      allowed: !1,
      reason: void 0,
      isLoading: !1,
      error: null
    });
  }, []);
  return {
    authorize: c,
    lastCheck: n,
    clearCheck: i,
    checkAuthorization: a
  };
}
function gh() {
  const { listAllWallets: e, createDerivedWallet: t, deleteDerivedWallet: n } = Ye(), [o, s] = B([]), [a, c] = B(!1), [i, l] = B(null), u = T(async () => {
    c(!0), l(null);
    try {
      const b = await e();
      s(b.wallets);
    } catch (b) {
      const w = b instanceof Error ? b.message : "Failed to list wallets";
      l(w);
    } finally {
      c(!1);
    }
  }, [e]), f = T(
    async (b) => {
      c(!0), l(null);
      try {
        const w = await t({ label: b });
        return await u(), w;
      } catch (w) {
        const p = w instanceof Error ? w.message : "Failed to create wallet";
        throw l(p), w;
      } finally {
        c(!1);
      }
    },
    [t, u]
  ), h = T(
    async (b) => {
      c(!0), l(null);
      try {
        await n(b), await u();
      } catch (w) {
        const p = w instanceof Error ? w.message : "Failed to delete wallet";
        throw l(p), w;
      } finally {
        c(!1);
      }
    },
    [n, u]
  ), m = T(() => l(null), []);
  return {
    wallets: o,
    isLoading: a,
    createWallet: f,
    deleteWallet: h,
    refresh: u,
    error: i,
    clearError: m
  };
}
function wh() {
  const e = We(), [t, n] = B(!1), [o, s] = B(null), [a, c] = B(null), i = z(() => e ? new ce({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), l = T(async () => {
    if (!i)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    n(!0), s(null);
    try {
      const h = await i.get("/wallet/pending-recovery");
      c(h);
    } catch (h) {
      const m = q(h, "Failed to fetch pending recovery");
      throw s(m.message), m;
    } finally {
      n(!1);
    }
  }, [i]), u = T(async () => {
    if (!i)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    n(!0), s(null);
    try {
      const h = { confirmed: !0 };
      await i.post("/wallet/acknowledge-recovery", h), c(null);
    } catch (h) {
      const m = q(h, "Failed to acknowledge recovery");
      throw s(m.message), m;
    } finally {
      n(!1);
    }
  }, [i]), f = T(() => s(null), []);
  return O(() => {
    i && e?.authState === "authenticated" && l().catch(() => {
    });
  }, [i, e?.authState, l]), {
    hasPendingRecovery: a?.hasPendingRecovery ?? !1,
    recoveryType: a?.recoveryType ?? null,
    recoveryPhrase: a?.recoveryPhrase ?? null,
    expiresAt: a?.expiresAt ? new Date(a.expiresAt) : null,
    fetchPendingRecovery: l,
    acknowledgeRecovery: u,
    isLoading: t,
    error: o,
    clearError: f
  };
}
function bh(e = {}) {
  const { onExternalSign: t } = e, { solanaPubkey: n, hasExternalWallet: o, status: s, isUnlocked: a } = Lt(), {
    signTransaction: c,
    isSigning: i,
    error: l,
    clearError: u
  } = ul(), f = z(() => o && t ? "external" : s === "enrolled_locked" || s === "enrolled_unlocked" ? "sss" : "none", [o, t, s]), h = f !== "none", m = s === "enrolled_locked" || s === "enrolled_unlocked";
  return {
    signTransaction: T(
      async (w, p) => {
        if (f === "external") {
          if (!t)
            throw new Error("External wallet signing callback not provided");
          return t(w);
        }
        if (f === "sss") {
          if (!p && !a)
            throw new Error(
              "Credential required for signing. Unlock wallet first or provide credential."
            );
          return p ? c(w, p) : c(w);
        }
        throw new Error("No signing method available. Enroll a wallet first.");
      },
      [f, t, a, c]
    ),
    signingMethod: f,
    canSign: h,
    isSigning: i,
    publicKey: n,
    hasExternalWallet: o,
    hasSssWallet: m,
    isSssUnlocked: a,
    error: l,
    clearError: u
  };
}
function yh() {
  const { config: e, _internal: t } = ne(), [n, o] = B(null), [s, a] = B(!1), [c, i] = B(null), l = z(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), u = T(async () => {
    a(!0), i(null);
    try {
      await l.post("/welcome-completed", {});
    } catch (h) {
      const m = h instanceof Error ? h : new Error(String(h));
      throw i(m), m;
    } finally {
      a(!1);
    }
  }, [l]), f = T(() => {
    o(null);
  }, []);
  return {
    postLoginAction: n,
    setPostLoginAction: o,
    markWelcomeCompleted: u,
    clearPostLogin: f,
    isLoading: s,
    error: c
  };
}
const Kr = Go(null), Rr = {
  auth: {
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    name: "Name",
    optional: "(optional)",
    createPassword: "Create a password",
    confirmYourPassword: "Confirm your password",
    emailPlaceholder: "you@example.com",
    namePlaceholder: "Your name"
  },
  buttons: {
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    createAccount: "Create account",
    continueWithGoogle: "Continue with Google",
    continueWithSolana: "Connect Wallet",
    forgotPassword: "Forgot password?",
    resetPassword: "Reset password",
    sendVerification: "Send verification email"
  },
  messages: {
    signingIn: "Signing in...",
    signingUp: "Signing up...",
    creatingAccount: "Creating account...",
    connectingWallet: "Connecting wallet...",
    verifyingSignature: "Verifying signature...",
    passwordsDoNotMatch: "Passwords do not match",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    orContinueWith: "Or continue with"
  },
  errors: {
    invalidCredentials: "Invalid email or password",
    emailExists: "An account with this email already exists",
    invalidEmail: "Please enter a valid email address",
    weakPassword: "Password does not meet requirements",
    networkError: "Network error. Please try again.",
    unknownError: "An error occurred. Please try again.",
    walletNotFound: "No wallet found. Please install a Solana wallet.",
    signatureRejected: "Signature request was rejected",
    challengeExpired: "Challenge expired. Please try again."
  },
  passwordValidation: {
    minLength: "At least 10 characters",
    uppercase: "At least 1 uppercase letter",
    lowercase: "At least 1 lowercase letter",
    number: "At least 1 number",
    special: "At least 1 special character",
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong"
  }
};
function bu(e, t) {
  return Po(e, t);
}
function Po(e, t) {
  const n = { ...e };
  for (const o in t)
    if (Object.prototype.hasOwnProperty.call(t, o)) {
      const s = e[o], a = t[o];
      typeof s == "object" && s !== null && typeof a == "object" && a !== null ? n[o] = Po(
        s,
        a
      ) : a !== void 0 && (n[o] = a);
    }
  return n;
}
function Ah({
  children: e,
  locale: t = "en",
  translations: n
}) {
  const o = z(() => ({ t: n ? bu(Rr, n) : Rr, locale: t }), [n, t]);
  return /* @__PURE__ */ r(Kr.Provider, { value: o, children: e });
}
function vh() {
  return gn(Kr)?.t ?? Rr;
}
function kh() {
  return gn(Kr)?.locale ?? "en";
}
export {
  nh as AccountSettings,
  ga as AdminDepositList,
  pa as AdminDepositStats,
  zh as AdminIcons,
  ba as AdminPrivacyPeriodDeposits,
  Vh as AdminShell,
  Na as AdminUserList,
  Aa as AdminWithdrawalHistory,
  ya as AdminWithdrawalQueue,
  wa as AdminWithdrawalStats,
  Mc as AppleLoginButton,
  Ca as AuthenticationSettings,
  Hh as CEDROS_LOGIN_SECTION_IDS,
  Xu as CapabilityWarning,
  rh as CedrosAdminDashboard,
  Ch as CedrosLoginProvider,
  ih as ChooseUsernamePrompt,
  ah as CompleteAccountPrompt,
  lh as CreditBalance,
  Pa as CreditSystemSettings,
  ch as DepositFlow,
  Yo as EmailLoginForm,
  Zo as EmailRegisterForm,
  Yh as EmailSettings,
  xa as EmbeddedWalletSettings,
  Oc as ErrorBoundary,
  re as ErrorMessage,
  Pc as ForgotPasswordForm,
  fh as FullPageLayout,
  Xo as GoogleLoginButton,
  dh as History,
  Ah as I18nProvider,
  oa as InviteForm,
  aa as InviteList,
  Ad as LinkedAccounts,
  Q as LoadingSpinner,
  Qu as LoginButton,
  jr as LoginForm,
  Gu as LoginModal,
  na as MemberList,
  oh as MfaSetupPrompt,
  Yu as OrgSelector,
  Zu as OrgSwitcher,
  yn as OtpInput,
  Uc as PasskeyLoginButton,
  fl as PasskeyPrompt,
  pe as PasswordInput,
  Pa as PrivacyCashSettings,
  Ea as ProfileDropdown,
  bd as ProfileTab,
  rl as RecoveryPhraseDisplay,
  sl as RecoveryPhraseInput,
  Ku as ResetPasswordForm,
  Qr as SUPPORTED_TOKENS,
  th as SecuritySettings,
  Ra as ServerSettings,
  Kc as SessionList,
  Ta as SettingsPageLayout,
  Dl as SetupWizard,
  Jo as SolanaLoginButton,
  mh as SplitPageLayout,
  eh as SystemSettings,
  ko as TieredAmountSlider,
  yo as TokenSelector,
  md as TotpSettings,
  fo as TotpSetup,
  Th as TotpVerify,
  sh as UserProfileSettings,
  Sl as WalletAddressRow,
  dl as WalletEnrollment,
  Ju as WalletManager,
  kl as WalletRecovery,
  Ll as WalletStatus,
  wl as WalletUnlock,
  ef as WebhookSettings,
  uh as WithdrawalFlow,
  hh as WithdrawalHistory,
  $h as cedrosLoginPlugin,
  Rr as defaultTranslations,
  xh as getEmbeddedWalletInfo,
  Vr as getTierForAmount,
  Sh as isEmbeddedWalletAvailable,
  Qh as loginPlugin,
  bu as mergeTranslations,
  Fh as registerMobileWallet,
  Xh as useAdminDeposits,
  Gh as useAdminShell,
  qh as useAdminUsers,
  Tc as useAppleAuth,
  St as useAuth,
  Bh as useAuthState,
  Ph as useAuthUI,
  ph as useAuthorize,
  ne as useCedrosLogin,
  mo as useCredentials,
  Lo as useCredits,
  Td as useDeposit,
  Mh as useEmailAuth,
  Dh as useGoogleAuth,
  Lc as useInstantLink,
  sa as useInvites,
  kh as useLocale,
  ra as useMembers,
  fa as useOrgs,
  hl as usePasskeySigning,
  qr as usePasswordReset,
  wh as usePendingRecovery,
  yh as usePostLogin,
  Rt as useProfile,
  ea as useServerFeatures,
  Ld as useSessions,
  cl as useSetPassword,
  ao as useSetup,
  Oh as useSolanaAuth,
  ca as useSystemSettings,
  ho as useTotp,
  Ih as useTotpVerify,
  bh as useTransactionSigning,
  vh as useTranslations,
  Rd as useUsername,
  Lt as useWallet,
  il as useWalletEnrollment,
  Ye as useWalletMaterial,
  vl as useWalletRecovery,
  ul as useWalletSigning,
  gh as useWallets,
  no as useWebAuthn,
  Bo as useWithdrawal,
  Bt as validatePassword
};
