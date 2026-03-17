import { D as ft, v as Jo, a as ea, w as An, t as He, b as Nn, c as kn, u as Ot, g as ta, d as ra, e as nt, f as sa, h as Cn, i as En, j as Te, k as xn, l as Sn, m as Hr, n as _n, o as na, p as Ln, q as Wt } from "./useAuth-l-itM5am.js";
import { C as lm, r as dm, s as um } from "./useAuth-l-itM5am.js";
import { u as ee, A as ne, h as z, a as $e } from "./useCedrosLogin-CFfID-0i.js";
import { b as mm, c as fm } from "./useCedrosLogin-CFfID-0i.js";
import { jsx as r, jsxs as d, Fragment as X } from "react/jsx-runtime";
import { useState as S, useRef as J, useMemo as q, useEffect as O, useCallback as B, useId as Pn, Fragment as oa, Component as aa, createContext as ia, useContext as Tn } from "react";
import { L as Q } from "./LoadingSpinner-6vml-zwr.js";
import { a as Bn, s as ca } from "./sanitization-CQ-H1MSg.js";
import { b as Rn, E as la, a as da, P as be, O as In } from "./EmailRegisterForm-p2X5QP58.js";
import { T as gm, u as wm, c as ym } from "./EmailRegisterForm-p2X5QP58.js";
import { b as Mn, v as zt } from "./validation-B8kMV3BL.js";
import { E as ae } from "./ErrorMessage-CcEK0pYO.js";
import { G as ua } from "./GoogleLoginButton-C1WNu7W3.js";
import { u as vm } from "./GoogleLoginButton-C1WNu7W3.js";
import { d as ms, S as ha } from "./SolanaLoginButton-CyeX35eU.js";
import { r as Nm, u as km } from "./SolanaLoginButton-CyeX35eU.js";
import { c as ma, d as fa, u as pa, a as ga, M as wa, I as ya, b as ba, P as va } from "./PermissionsSection-BDDiEfho.js";
import { u as Aa } from "./useSystemSettings-rgskaDqP.js";
import { C as Na, S as $r, a as ka, u as Un, A as Dn } from "./AutosaveStatus-DtF_58rC.js";
import { u as Ca, O as Ea } from "./useOrgs-C90KT9KP.js";
import { A as xa, a as Sa } from "./AdminDepositList-BUm_ZcAW.js";
import { A as _a, a as La, b as Pa, c as Ta } from "./AdminWithdrawalHistory-C76bkbjX.js";
import { u as Ba, A as Ra, a as Ia } from "./useUsersStatsSummary-9HQDKBU5.js";
import { b as Em } from "./useUsersStatsSummary-9HQDKBU5.js";
import { S as Fn } from "./StatsBar-BX-hHtTq.js";
import { P as Ma } from "./plugin-Bwwe7_ZO.js";
import { I as Sm, A as _m, C as Lm, c as Pm, c as Tm, u as Bm } from "./plugin-Bwwe7_ZO.js";
import { A as Ua } from "./AuthenticationSettings-CxAubcoz.js";
import { E as Da } from "./EmbeddedWalletSettings-Bus7UyOX.js";
import { A as Fa, S as Oa, P as Wa } from "./EmailSettings-D2pCqTKC.js";
import { E as Im } from "./EmailSettings-D2pCqTKC.js";
import { C as za } from "./CreditSystemSettings-GDKgYc7I.js";
import { S as qa } from "./ServerSettings-D7WJDTbZ.js";
import { u as Um } from "./useAdminDeposits-C76B2Q_8.js";
import { S as ja } from "./WebhookSettings-CpPvGmV7.js";
import { W as Fm } from "./WebhookSettings-CpPvGmV7.js";
let je = null, Va = 0;
const mt = /* @__PURE__ */ new Map();
function Ha() {
  return typeof Worker > "u" ? null : (je || (je = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/argon2Worker-Bi5TuQvD.js", import.meta.url).href,
    import.meta.url
  ), {
    type: "module"
  }), je.onmessage = (e) => {
    const { id: t, key: s, error: o } = e.data, n = mt.get(t);
    if (n) {
      if (mt.delete(t), o) {
        n.reject(new Error(o));
        return;
      }
      if (!s) {
        n.reject(new Error("Argon2 worker returned no key"));
        return;
      }
      n.resolve(s);
    }
  }, je.onerror = (e) => {
    const t = e instanceof ErrorEvent ? e.error : new Error("Argon2 worker error");
    for (const s of mt.values())
      s.reject(t instanceof Error ? t : new Error(String(t)));
    mt.clear(), je?.terminate(), je = null;
  }), je);
}
async function On(e, t, s = ft) {
  Jo(s);
  const o = Ha();
  return o ? new Promise((n, a) => {
    const i = Va++;
    mt.set(i, { resolve: n, reject: a });
    const l = {
      id: i,
      password: e,
      salt: t,
      params: s
    };
    o.postMessage(l);
  }) : ea(e, t, s);
}
function Wn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function $a(e) {
  if (Object.prototype.hasOwnProperty.call(e, "__esModule")) return e;
  var t = e.default;
  if (typeof t == "function") {
    var s = function o() {
      var n = !1;
      try {
        n = this instanceof o;
      } catch {
      }
      return n ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    s.prototype = t.prototype;
  } else s = {};
  return Object.defineProperty(s, "__esModule", { value: !0 }), Object.keys(e).forEach(function(o) {
    var n = Object.getOwnPropertyDescriptor(e, o);
    Object.defineProperty(s, o, n.get ? n : {
      enumerable: !0,
      get: function() {
        return e[o];
      }
    });
  }), s;
}
var St = { exports: {} };
const Ga = globalThis.crypto, Qa = globalThis.crypto, Ka = globalThis.crypto.subtle, Ya = globalThis.crypto.getRandomValues.bind(globalThis.crypto), Za = globalThis.crypto.randomUUID.bind(globalThis.crypto), Xa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ga,
  getRandomValues: Ya,
  randomUUID: Za,
  subtle: Ka,
  webcrypto: Qa
}, Symbol.toStringTag, { value: "Module" })), Ja = /* @__PURE__ */ $a(Xa);
var ei = St.exports, fs;
function ti() {
  return fs || (fs = 1, (function(e, t) {
    (function(s, o) {
      e.exports = o(Ja);
    })(ei, function(s) {
      var o, n, a, i, l;
      function c() {
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
        }, n = {}, a = new Array(1024).join("0"), i = !0, l = [
          "nodeCryptoRandomBytes",
          "browserCryptoGetRandomValues",
          "testRandom"
        ];
      }
      function u() {
        return !!(n && n.rng && typeof n.rng == "function");
      }
      function m(f, y) {
        var v;
        if (y === 0 || y === 1)
          return f;
        if (y && y > 1024)
          throw new Error(
            "Padding must be multiples of no larger than 1024 bits."
          );
        return y = y || n.bits, f && (v = f.length % y), v ? (a + f).slice(
          -(y - v + f.length)
        ) : f;
      }
      function h(f) {
        var y = "", v, N;
        for (N = f.length - 1; N >= 0; N--) {
          if (v = parseInt(f[N], 16), isNaN(v))
            throw new Error("Invalid hex character.");
          y = m(v.toString(2), 4) + y;
        }
        return y;
      }
      function p(f) {
        var y = "", v, N;
        for (f = m(f, 4), N = f.length; N >= 4; N -= 4) {
          if (v = parseInt(f.slice(N - 4, N), 2), isNaN(v))
            throw new Error("Invalid binary character.");
          y = v.toString(16) + y;
        }
        return y;
      }
      function b() {
        return !!(s && typeof s == "object" && (typeof s.getRandomValues == "function" || typeof s.getRandomValues == "object") && (typeof Uint32Array == "function" || typeof Uint32Array == "object"));
      }
      function w() {
        return typeof s == "object" && typeof s.randomBytes == "function";
      }
      function g(f) {
        function y(L, R, T, I) {
          var M = 0, U, W = "", j;
          for (R && (U = R.length - 1); M < U || W.length < L; )
            j = Math.abs(parseInt(R[M], T)), W = W + m(j.toString(2), I), M++;
          return W = W.substr(-L), (W.match(/0/g) || []).length === W.length ? null : W;
        }
        function v(L) {
          var R, T, I, M, U = null;
          for (I = 16, M = 4, T = Math.ceil(L / 8); U === null; )
            R = s.randomBytes(T), U = y(L, R.toString("hex"), I, M);
          return U;
        }
        function N(L) {
          var R, T, I, M = null;
          for (T = 10, I = 32, R = Math.ceil(L / 32); M === null; )
            M = y(
              L,
              s.getRandomValues(new Uint32Array(R)),
              T,
              I
            );
          return M;
        }
        function P(L) {
          var R, T, I, M, U, W = null;
          M = 10, U = 32, T = Math.ceil(L / 32), I = 123456789, R = new Uint32Array(T);
          for (var j = 0; j < R.length; j++)
            R[j] = I;
          for (; W === null; )
            W = y(L, R, M, U);
          return W;
        }
        if (f && f === "testRandom")
          return n.typeCSPRNG = f, P;
        if (f && f === "nodeCryptoRandomBytes")
          return n.typeCSPRNG = f, v;
        if (f && f === "browserCryptoGetRandomValues")
          return n.typeCSPRNG = f, N;
        if (w())
          return n.typeCSPRNG = "nodeCryptoRandomBytes", v;
        if (b())
          return n.typeCSPRNG = "browserCryptoGetRandomValues", N;
      }
      function C(f, y) {
        var v = [], N;
        for (y && (f = m(f, y)), N = f.length; N > n.bits; N -= n.bits)
          v.push(parseInt(f.slice(N - n.bits, N), 2));
        return v.push(parseInt(f.slice(0, N), 2)), v;
      }
      function A(f, y) {
        var v = n.logs[f], N = 0, P;
        for (P = y.length - 1; P >= 0; P--)
          N !== 0 ? N = n.exps[(v + n.logs[N]) % n.maxShares] ^ y[P] : N = y[P];
        return N;
      }
      function k(f, y, v) {
        var N = 0, P, L, R, T;
        for (R = 0, P = y.length; R < P; R++)
          if (v[R]) {
            for (L = n.logs[v[R]], T = 0; T < P; T++)
              if (R !== T) {
                if (f === y[T]) {
                  L = -1;
                  break;
                }
                L = (L + n.logs[f ^ y[T]] - n.logs[y[R] ^ y[T]] + n.maxShares) % n.maxShares;
              }
            N = L === -1 ? N : N ^ n.exps[L];
          }
        return N;
      }
      function E(f, y, v) {
        var N = [], P = [f], L, R;
        for (L = 1; L < v; L++)
          P[L] = parseInt(n.rng(n.bits), 2);
        for (L = 1, R = y + 1; L < R; L++)
          N[L - 1] = {
            x: L,
            y: A(L, P)
          };
        return N;
      }
      function x(f, y, v) {
        var N, P, L, R, T;
        if (y = parseInt(y, n.radix), f = parseInt(f, 10) || n.bits, N = f.toString(36).toUpperCase(), L = Math.pow(2, f) - 1, R = L.toString(n.radix).length, P = m(y.toString(n.radix), R), typeof y != "number" || y % 1 !== 0 || y < 1 || y > L)
          throw new Error(
            "Share id must be an integer between 1 and " + L + ", inclusive."
          );
        return T = N + P + v, T;
      }
      var _ = {
        init: function(f, y) {
          var v = [], N = [], P = 1, L, R;
          if (c(), f && (typeof f != "number" || f % 1 !== 0 || f < o.minBits || f > o.maxBits))
            throw new Error(
              "Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (y && l.indexOf(y) === -1)
            throw new Error("Invalid RNG type argument : '" + y + "'");
          for (n.radix = o.radix, n.bits = f || o.bits, n.size = Math.pow(2, n.bits), n.maxShares = n.size - 1, L = o.primitivePolynomials[n.bits], R = 0; R < n.size; R++)
            N[R] = P, v[P] = R, P = P << 1, P >= n.size && (P = P ^ L, P = P & n.maxShares);
          if (n.logs = v, n.exps = N, y && this.setRNG(y), u() || this.setRNG(), !u() || !n.bits || !n.size || !n.maxShares || !n.logs || !n.exps || n.logs.length !== n.size || n.exps.length !== n.size)
            throw new Error("Initialization failed.");
        },
        // Evaluates the Lagrange interpolation polynomial at x=`at` for
        // individual config.bits-length segments of each share in the `shares`
        // Array. Each share is expressed in base `inputRadix`. The output
        // is expressed in base `outputRadix'.
        combine: function(f, y) {
          var v, N, P, L, R = "", T, I, M, U = [], W = [];
          for (y = y || 0, v = 0, P = f.length; v < P; v++) {
            if (I = this.extractShareComponents(f[v]), T === void 0)
              T = I.bits;
            else if (I.bits !== T)
              throw new Error(
                "Mismatched shares: Different bit settings."
              );
            if (n.bits !== T && this.init(T), U.indexOf(I.id) === -1)
              for (U.push(I.id), M = C(h(I.data)), N = 0, L = M.length; N < L; N++)
                W[N] = W[N] || [], W[N][U.length - 1] = M[N];
          }
          for (v = 0, P = W.length; v < P; v++)
            R = m(k(y, U, W[v]).toString(2)) + R;
          return p(
            y >= 1 ? R : R.slice(R.indexOf("1") + 1)
          );
        },
        getConfig: function() {
          var f = {};
          return f.radix = n.radix, f.bits = n.bits, f.maxShares = n.maxShares, f.hasCSPRNG = u(), f.typeCSPRNG = n.typeCSPRNG, f;
        },
        // Given a public share, extract the bits (Integer), share ID (Integer), and share data (Hex)
        // and return an Object containing those components.
        extractShareComponents: function(f) {
          var y, v, N, P, L = {}, R, T;
          if (y = parseInt(f.substr(0, 1), 36), y && (typeof y != "number" || y % 1 !== 0 || y < o.minBits || y > o.maxBits))
            throw new Error(
              "Invalid share : Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (P = Math.pow(2, y) - 1, N = (Math.pow(2, y) - 1).toString(n.radix).length, R = "^([a-kA-K3-9]{1})([a-fA-F0-9]{" + N + "})([a-fA-F0-9]+)$", T = new RegExp(R).exec(f), T && (v = parseInt(T[2], n.radix)), typeof v != "number" || v % 1 !== 0 || v < 1 || v > P)
            throw new Error(
              "Invalid share : Share id must be an integer between 1 and " + n.maxShares + ", inclusive."
            );
          if (T && T[3])
            return L.bits = y, L.id = v, L.data = T[3], L;
          throw new Error("The share data provided is invalid : " + f);
        },
        // Set the PRNG to use. If no RNG function is supplied, pick a default using getRNG()
        setRNG: function(f) {
          var y = "Random number generator is invalid ", v = " Supply an CSPRNG of the form function(bits){} that returns a string containing 'bits' number of random 1's and 0's.";
          if (f && typeof f == "string" && l.indexOf(f) === -1)
            throw new Error("Invalid RNG type argument : '" + f + "'");
          if (f || (f = g()), f && typeof f == "string" && (f = g(f)), i) {
            if (f && typeof f != "function")
              throw new Error(y + "(Not a function)." + v);
            if (f && typeof f(n.bits) != "string")
              throw new Error(
                y + "(Output is not a string)." + v
              );
            if (f && !parseInt(f(n.bits), 2))
              throw new Error(
                y + "(Binary string output not parseable to an Integer)." + v
              );
            if (f && f(n.bits).length > n.bits)
              throw new Error(
                y + "(Output length is greater than config.bits)." + v
              );
            if (f && f(n.bits).length < n.bits)
              throw new Error(
                y + "(Output length is less than config.bits)." + v
              );
          }
          return n.rng = f, !0;
        },
        // Converts a given UTF16 character string to the HEX representation.
        // Each character of the input string is represented by
        // `bytesPerChar` bytes in the output string which defaults to 2.
        str2hex: function(f, y) {
          var v, N, P = "", L, R, T, I;
          if (typeof f != "string")
            throw new Error("Input must be a character string.");
          if (y || (y = o.bytesPerChar), typeof y != "number" || y < 1 || y > o.maxBytesPerChar || y % 1 !== 0)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (v = 2 * y, N = Math.pow(16, v) - 1, T = 0, I = f.length; T < I; T++) {
            if (R = f[T].charCodeAt(), isNaN(R))
              throw new Error("Invalid character: " + f[T]);
            if (R > N)
              throw L = Math.ceil(Math.log(R + 1) / Math.log(256)), new Error(
                "Invalid character code (" + R + "). Maximum allowable is 256^bytes-1 (" + N + "). To convert this character, use at least " + L + " bytes."
              );
            P = m(R.toString(16), v) + P;
          }
          return P;
        },
        // Converts a given HEX number string to a UTF16 character string.
        hex2str: function(f, y) {
          var v, N = "", P, L;
          if (typeof f != "string")
            throw new Error("Input must be a hexadecimal string.");
          if (y = y || o.bytesPerChar, typeof y != "number" || y % 1 !== 0 || y < 1 || y > o.maxBytesPerChar)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (v = 2 * y, f = m(f, v), P = 0, L = f.length; P < L; P += v)
            N = String.fromCharCode(
              parseInt(f.slice(P, P + v), 16)
            ) + N;
          return N;
        },
        // Generates a random bits-length number string using the PRNG
        random: function(f) {
          if (typeof f != "number" || f % 1 !== 0 || f < 2 || f > 65536)
            throw new Error(
              "Number of bits must be an Integer between 1 and 65536."
            );
          return p(n.rng(f));
        },
        // Divides a `secret` number String str expressed in radix `inputRadix` (optional, default 16)
        // into `numShares` shares, each expressed in radix `outputRadix` (optional, default to `inputRadix`),
        // requiring `threshold` number of shares to reconstruct the secret.
        // Optionally, zero-pads the secret to a length that is a multiple of padLength before sharing.
        share: function(f, y, v, N) {
          var P, L, R = new Array(y), T = new Array(y), I, M, U;
          if (N = N || 128, typeof f != "string")
            throw new Error("Secret must be a string.");
          if (typeof y != "number" || y % 1 !== 0 || y < 2)
            throw new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive."
            );
          if (y > n.maxShares)
            throw P = Math.ceil(Math.log(y + 1) / Math.LN2), new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive. To create " + y + " shares, use at least " + P + " bits."
            );
          if (typeof v != "number" || v % 1 !== 0 || v < 2)
            throw new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive."
            );
          if (v > n.maxShares)
            throw P = Math.ceil(Math.log(v + 1) / Math.LN2), new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive.  To use a threshold of " + v + ", use at least " + P + " bits."
            );
          if (v > y)
            throw new Error(
              "Threshold number of shares was " + v + " but must be less than or equal to the " + y + " shares specified as the total to generate."
            );
          if (typeof N != "number" || N % 1 !== 0 || N < 0 || N > 1024)
            throw new Error(
              "Zero-pad length must be an integer between 0 and 1024 inclusive."
            );
          for (f = "1" + h(f), f = C(f, N), I = 0, U = f.length; I < U; I++)
            for (L = E(f[I], y, v), M = 0; M < y; M++)
              R[M] = R[M] || L[M].x.toString(n.radix), T[M] = m(L[M].y.toString(2)) + (T[M] || "");
          for (I = 0; I < y; I++)
            R[I] = x(
              n.bits,
              R[I],
              p(T[I])
            );
          return R;
        },
        // Generate a new share with id `id` (a number between 1 and 2^bits-1)
        // `id` can be a Number or a String in the default radix (16)
        newShare: function(f, y) {
          var v, N;
          if (f && typeof f == "string" && (f = parseInt(f, n.radix)), N = f.toString(n.radix), f && N && y && y[0])
            return v = this.extractShareComponents(y[0]), x(
              v.bits,
              N,
              this.combine(y, f)
            );
          throw new Error(
            "Invalid 'id' or 'shares' Array argument to newShare()."
          );
        },
        /* test-code */
        // export private functions so they can be unit tested directly.
        _reset: c,
        _padLeft: m,
        _hex2bin: h,
        _bin2hex: p,
        _hasCryptoGetRandomValues: b,
        _hasCryptoRandomBytes: w,
        _getRNG: g,
        _isSetRNG: u,
        _splitNumStringToIntArray: C,
        _horner: A,
        _lagrange: k,
        _getShares: E,
        _constructPublicShareString: x
        /* end-test-code */
      };
      return _.init(), _;
    });
  })(St)), St.exports;
}
var ri = ti();
const zn = /* @__PURE__ */ Wn(ri);
function qn(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Gr(e, t = "") {
  if (!Number.isSafeInteger(e) || e < 0) {
    const s = t && `"${t}" `;
    throw new Error(`${s}expected integer >= 0, got ${e}`);
  }
}
function de(e, t, s = "") {
  const o = qn(e), n = e?.length, a = t !== void 0;
  if (!o || a && n !== t) {
    const i = s && `"${s}" `, l = a ? ` of length ${t}` : "", c = o ? `length=${n}` : `type=${typeof e}`;
    throw new Error(i + "expected Uint8Array" + l + ", got " + c);
  }
  return e;
}
function ps(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function si(e, t) {
  de(e, void 0, "digestInto() output");
  const s = t.outputLen;
  if (e.length < s)
    throw new Error('"digestInto() output" expected to be of length >=' + s);
}
function Ir(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function Kt(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
const jn = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", ni = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function Qr(e) {
  if (de(e), jn)
    return e.toHex();
  let t = "";
  for (let s = 0; s < e.length; s++)
    t += ni[e[s]];
  return t;
}
const Le = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function gs(e) {
  if (e >= Le._0 && e <= Le._9)
    return e - Le._0;
  if (e >= Le.A && e <= Le.F)
    return e - (Le.A - 10);
  if (e >= Le.a && e <= Le.f)
    return e - (Le.a - 10);
}
function Vn(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  if (jn)
    return Uint8Array.fromHex(e);
  const t = e.length, s = t / 2;
  if (t % 2)
    throw new Error("hex string expected, got unpadded hex of length " + t);
  const o = new Uint8Array(s);
  for (let n = 0, a = 0; n < s; n++, a += 2) {
    const i = gs(e.charCodeAt(a)), l = gs(e.charCodeAt(a + 1));
    if (i === void 0 || l === void 0) {
      const c = e[a] + e[a + 1];
      throw new Error('hex string expected, got non-hex character "' + c + '" at index ' + a);
    }
    o[n] = i * 16 + l;
  }
  return o;
}
function ws(...e) {
  let t = 0;
  for (let o = 0; o < e.length; o++) {
    const n = e[o];
    de(n), t += n.length;
  }
  const s = new Uint8Array(t);
  for (let o = 0, n = 0; o < e.length; o++) {
    const a = e[o];
    s.set(a, n), n += a.length;
  }
  return s;
}
function oi(e, t = {}) {
  const s = (n, a) => e(a).update(n).digest(), o = e(void 0);
  return s.outputLen = o.outputLen, s.blockLen = o.blockLen, s.create = (n) => e(n), Object.assign(s, t), Object.freeze(s);
}
function ai(e = 32) {
  const t = typeof globalThis == "object" ? globalThis.crypto : null;
  if (typeof t?.getRandomValues != "function")
    throw new Error("crypto.getRandomValues must be defined");
  return t.getRandomValues(new Uint8Array(e));
}
const ii = (e) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, e])
});
let ci = class {
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
  constructor(t, s, o, n) {
    this.blockLen = t, this.outputLen = s, this.padOffset = o, this.isLE = n, this.buffer = new Uint8Array(t), this.view = Kt(this.buffer);
  }
  update(t) {
    ps(this), de(t);
    const { view: s, buffer: o, blockLen: n } = this, a = t.length;
    for (let i = 0; i < a; ) {
      const l = Math.min(n - this.pos, a - i);
      if (l === n) {
        const c = Kt(t);
        for (; n <= a - i; i += n)
          this.process(c, i);
        continue;
      }
      o.set(t.subarray(i, i + l), this.pos), this.pos += l, i += l, this.pos === n && (this.process(s, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    ps(this), si(t, this), this.finished = !0;
    const { buffer: s, view: o, blockLen: n, isLE: a } = this;
    let { pos: i } = this;
    s[i++] = 128, Ir(this.buffer.subarray(i)), this.padOffset > n - i && (this.process(o, 0), i = 0);
    for (let h = i; h < n; h++)
      s[h] = 0;
    o.setBigUint64(n - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const l = Kt(t), c = this.outputLen;
    if (c % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const u = c / 4, m = this.get();
    if (u > m.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let h = 0; h < u; h++)
      l.setUint32(4 * h, m[h], a);
  }
  digest() {
    const { buffer: t, outputLen: s } = this;
    this.digestInto(t);
    const o = t.slice(0, s);
    return this.destroy(), o;
  }
  _cloneInto(t) {
    t ||= new this.constructor(), t.set(...this.get());
    const { blockLen: s, buffer: o, length: n, finished: a, destroyed: i, pos: l } = this;
    return t.destroyed = i, t.finished = a, t.length = n, t.pos = l, n % s && t.buffer.set(o), t;
  }
  clone() {
    return this._cloneInto();
  }
};
const ue = /* @__PURE__ */ Uint32Array.from([
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
]), gt = /* @__PURE__ */ BigInt(2 ** 32 - 1), ys = /* @__PURE__ */ BigInt(32);
function li(e, t = !1) {
  return t ? { h: Number(e & gt), l: Number(e >> ys & gt) } : { h: Number(e >> ys & gt) | 0, l: Number(e & gt) | 0 };
}
function di(e, t = !1) {
  const s = e.length;
  let o = new Uint32Array(s), n = new Uint32Array(s);
  for (let a = 0; a < s; a++) {
    const { h: i, l } = li(e[a], t);
    [o[a], n[a]] = [i, l];
  }
  return [o, n];
}
const bs = (e, t, s) => e >>> s, vs = (e, t, s) => e << 32 - s | t >>> s, Xe = (e, t, s) => e >>> s | t << 32 - s, Je = (e, t, s) => e << 32 - s | t >>> s, wt = (e, t, s) => e << 64 - s | t >>> s - 32, yt = (e, t, s) => e >>> s - 32 | t << 64 - s;
function Pe(e, t, s, o) {
  const n = (t >>> 0) + (o >>> 0);
  return { h: e + s + (n / 2 ** 32 | 0) | 0, l: n | 0 };
}
const ui = (e, t, s) => (e >>> 0) + (t >>> 0) + (s >>> 0), hi = (e, t, s, o) => t + s + o + (e / 2 ** 32 | 0) | 0, mi = (e, t, s, o) => (e >>> 0) + (t >>> 0) + (s >>> 0) + (o >>> 0), fi = (e, t, s, o, n) => t + s + o + n + (e / 2 ** 32 | 0) | 0, pi = (e, t, s, o, n) => (e >>> 0) + (t >>> 0) + (s >>> 0) + (o >>> 0) + (n >>> 0), gi = (e, t, s, o, n, a) => t + s + o + n + a + (e / 2 ** 32 | 0) | 0, Hn = di([
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
].map((e) => BigInt(e))), wi = Hn[0], yi = Hn[1], Ie = /* @__PURE__ */ new Uint32Array(80), Me = /* @__PURE__ */ new Uint32Array(80);
class bi extends ci {
  constructor(t) {
    super(128, t, 16, !1);
  }
  // prettier-ignore
  get() {
    const { Ah: t, Al: s, Bh: o, Bl: n, Ch: a, Cl: i, Dh: l, Dl: c, Eh: u, El: m, Fh: h, Fl: p, Gh: b, Gl: w, Hh: g, Hl: C } = this;
    return [t, s, o, n, a, i, l, c, u, m, h, p, b, w, g, C];
  }
  // prettier-ignore
  set(t, s, o, n, a, i, l, c, u, m, h, p, b, w, g, C) {
    this.Ah = t | 0, this.Al = s | 0, this.Bh = o | 0, this.Bl = n | 0, this.Ch = a | 0, this.Cl = i | 0, this.Dh = l | 0, this.Dl = c | 0, this.Eh = u | 0, this.El = m | 0, this.Fh = h | 0, this.Fl = p | 0, this.Gh = b | 0, this.Gl = w | 0, this.Hh = g | 0, this.Hl = C | 0;
  }
  process(t, s) {
    for (let E = 0; E < 16; E++, s += 4)
      Ie[E] = t.getUint32(s), Me[E] = t.getUint32(s += 4);
    for (let E = 16; E < 80; E++) {
      const x = Ie[E - 15] | 0, _ = Me[E - 15] | 0, f = Xe(x, _, 1) ^ Xe(x, _, 8) ^ bs(x, _, 7), y = Je(x, _, 1) ^ Je(x, _, 8) ^ vs(x, _, 7), v = Ie[E - 2] | 0, N = Me[E - 2] | 0, P = Xe(v, N, 19) ^ wt(v, N, 61) ^ bs(v, N, 6), L = Je(v, N, 19) ^ yt(v, N, 61) ^ vs(v, N, 6), R = mi(y, L, Me[E - 7], Me[E - 16]), T = fi(R, f, P, Ie[E - 7], Ie[E - 16]);
      Ie[E] = T | 0, Me[E] = R | 0;
    }
    let { Ah: o, Al: n, Bh: a, Bl: i, Ch: l, Cl: c, Dh: u, Dl: m, Eh: h, El: p, Fh: b, Fl: w, Gh: g, Gl: C, Hh: A, Hl: k } = this;
    for (let E = 0; E < 80; E++) {
      const x = Xe(h, p, 14) ^ Xe(h, p, 18) ^ wt(h, p, 41), _ = Je(h, p, 14) ^ Je(h, p, 18) ^ yt(h, p, 41), f = h & b ^ ~h & g, y = p & w ^ ~p & C, v = pi(k, _, y, yi[E], Me[E]), N = gi(v, A, x, f, wi[E], Ie[E]), P = v | 0, L = Xe(o, n, 28) ^ wt(o, n, 34) ^ wt(o, n, 39), R = Je(o, n, 28) ^ yt(o, n, 34) ^ yt(o, n, 39), T = o & a ^ o & l ^ a & l, I = n & i ^ n & c ^ i & c;
      A = g | 0, k = C | 0, g = b | 0, C = w | 0, b = h | 0, w = p | 0, { h, l: p } = Pe(u | 0, m | 0, N | 0, P | 0), u = l | 0, m = c | 0, l = a | 0, c = i | 0, a = o | 0, i = n | 0;
      const M = ui(P, R, I);
      o = hi(M, N, L, T), n = M | 0;
    }
    ({ h: o, l: n } = Pe(this.Ah | 0, this.Al | 0, o | 0, n | 0)), { h: a, l: i } = Pe(this.Bh | 0, this.Bl | 0, a | 0, i | 0), { h: l, l: c } = Pe(this.Ch | 0, this.Cl | 0, l | 0, c | 0), { h: u, l: m } = Pe(this.Dh | 0, this.Dl | 0, u | 0, m | 0), { h, l: p } = Pe(this.Eh | 0, this.El | 0, h | 0, p | 0), { h: b, l: w } = Pe(this.Fh | 0, this.Fl | 0, b | 0, w | 0), { h: g, l: C } = Pe(this.Gh | 0, this.Gl | 0, g | 0, C | 0), { h: A, l: k } = Pe(this.Hh | 0, this.Hl | 0, A | 0, k | 0), this.set(o, n, a, i, l, c, u, m, h, p, b, w, g, C, A, k);
  }
  roundClean() {
    Ir(Ie, Me);
  }
  destroy() {
    Ir(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class vi extends bi {
  Ah = ue[0] | 0;
  Al = ue[1] | 0;
  Bh = ue[2] | 0;
  Bl = ue[3] | 0;
  Ch = ue[4] | 0;
  Cl = ue[5] | 0;
  Dh = ue[6] | 0;
  Dl = ue[7] | 0;
  Eh = ue[8] | 0;
  El = ue[9] | 0;
  Fh = ue[10] | 0;
  Fl = ue[11] | 0;
  Gh = ue[12] | 0;
  Gl = ue[13] | 0;
  Hh = ue[14] | 0;
  Hl = ue[15] | 0;
  constructor() {
    super(64);
  }
}
const Ai = /* @__PURE__ */ oi(
  () => new vi(),
  /* @__PURE__ */ ii(3)
);
const $n = /* @__PURE__ */ BigInt(0), As = /* @__PURE__ */ BigInt(1);
function Mr(e, t = "") {
  if (typeof e != "boolean") {
    const s = t && `"${t}" `;
    throw new Error(s + "expected boolean, got type=" + typeof e);
  }
  return e;
}
function Ni(e) {
  if (typeof e == "bigint") {
    if (!_t(e))
      throw new Error("positive bigint expected, got " + e);
  } else
    Gr(e);
  return e;
}
function Gn(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  return e === "" ? $n : BigInt("0x" + e);
}
function ki(e) {
  return Gn(Qr(e));
}
function Pt(e) {
  return Gn(Qr(Ur(de(e)).reverse()));
}
function Qn(e, t) {
  Gr(t), e = Ni(e);
  const s = Vn(e.toString(16).padStart(t * 2, "0"));
  if (s.length !== t)
    throw new Error("number too large");
  return s;
}
function Ci(e, t) {
  return Qn(e, t).reverse();
}
function Ur(e) {
  return Uint8Array.from(e);
}
const _t = (e) => typeof e == "bigint" && $n <= e;
function Ei(e, t, s) {
  return _t(e) && _t(t) && _t(s) && t <= e && e < s;
}
function Ns(e, t, s, o) {
  if (!Ei(t, s, o))
    throw new Error("expected valid " + e + ": " + s + " <= n < " + o + ", got " + t);
}
const xi = (e) => (As << BigInt(e)) - As;
function Kr(e, t = {}, s = {}) {
  if (!e || typeof e != "object")
    throw new Error("expected valid options object");
  function o(a, i, l) {
    const c = e[a];
    if (l && c === void 0)
      return;
    const u = typeof c;
    if (u !== i || c === null)
      throw new Error(`param "${a}" is invalid: expected ${i}, got ${u}`);
  }
  const n = (a, i) => Object.entries(a).forEach(([l, c]) => o(l, c, i));
  n(t, !1), n(s, !0);
}
function ks(e) {
  const t = /* @__PURE__ */ new WeakMap();
  return (s, ...o) => {
    const n = t.get(s);
    if (n !== void 0)
      return n;
    const a = e(s, ...o);
    return t.set(s, a), a;
  };
}
const ge = /* @__PURE__ */ BigInt(0), me = /* @__PURE__ */ BigInt(1), Ve = /* @__PURE__ */ BigInt(2), Kn = /* @__PURE__ */ BigInt(3), Yn = /* @__PURE__ */ BigInt(4), Zn = /* @__PURE__ */ BigInt(5), Si = /* @__PURE__ */ BigInt(7), Xn = /* @__PURE__ */ BigInt(8), _i = /* @__PURE__ */ BigInt(9), Jn = /* @__PURE__ */ BigInt(16);
function ie(e, t) {
  const s = e % t;
  return s >= ge ? s : t + s;
}
function xe(e, t, s) {
  let o = e;
  for (; t-- > ge; )
    o *= o, o %= s;
  return o;
}
function Cs(e, t) {
  if (e === ge)
    throw new Error("invert: expected non-zero number");
  if (t <= ge)
    throw new Error("invert: expected positive modulus, got " + t);
  let s = ie(e, t), o = t, n = ge, a = me;
  for (; s !== ge; ) {
    const l = o / s, c = o % s, u = n - a * l;
    o = s, s = c, n = a, a = u;
  }
  if (o !== me)
    throw new Error("invert: does not exist");
  return ie(n, t);
}
function Yr(e, t, s) {
  if (!e.eql(e.sqr(t), s))
    throw new Error("Cannot find square root");
}
function eo(e, t) {
  const s = (e.ORDER + me) / Yn, o = e.pow(t, s);
  return Yr(e, o, t), o;
}
function Li(e, t) {
  const s = (e.ORDER - Zn) / Xn, o = e.mul(t, Ve), n = e.pow(o, s), a = e.mul(t, n), i = e.mul(e.mul(a, Ve), n), l = e.mul(a, e.sub(i, e.ONE));
  return Yr(e, l, t), l;
}
function Pi(e) {
  const t = Zr(e), s = to(e), o = s(t, t.neg(t.ONE)), n = s(t, o), a = s(t, t.neg(o)), i = (e + Si) / Jn;
  return (l, c) => {
    let u = l.pow(c, i), m = l.mul(u, o);
    const h = l.mul(u, n), p = l.mul(u, a), b = l.eql(l.sqr(m), c), w = l.eql(l.sqr(h), c);
    u = l.cmov(u, m, b), m = l.cmov(p, h, w);
    const g = l.eql(l.sqr(m), c), C = l.cmov(u, m, g);
    return Yr(l, C, c), C;
  };
}
function to(e) {
  if (e < Kn)
    throw new Error("sqrt is not defined for small field");
  let t = e - me, s = 0;
  for (; t % Ve === ge; )
    t /= Ve, s++;
  let o = Ve;
  const n = Zr(e);
  for (; Es(n, o) === 1; )
    if (o++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (s === 1)
    return eo;
  let a = n.pow(o, t);
  const i = (t + me) / Ve;
  return function(c, u) {
    if (c.is0(u))
      return u;
    if (Es(c, u) !== 1)
      throw new Error("Cannot find square root");
    let m = s, h = c.mul(c.ONE, a), p = c.pow(u, t), b = c.pow(u, i);
    for (; !c.eql(p, c.ONE); ) {
      if (c.is0(p))
        return c.ZERO;
      let w = 1, g = c.sqr(p);
      for (; !c.eql(g, c.ONE); )
        if (w++, g = c.sqr(g), w === m)
          throw new Error("Cannot find square root");
      const C = me << BigInt(m - w - 1), A = c.pow(h, C);
      m = w, h = c.sqr(A), p = c.mul(p, h), b = c.mul(b, A);
    }
    return b;
  };
}
function Ti(e) {
  return e % Yn === Kn ? eo : e % Xn === Zn ? Li : e % Jn === _i ? Pi(e) : to(e);
}
const Bi = (e, t) => (ie(e, t) & me) === me, Ri = [
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
function Ii(e) {
  const t = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  }, s = Ri.reduce((o, n) => (o[n] = "function", o), t);
  return Kr(e, s), e;
}
function Mi(e, t, s) {
  if (s < ge)
    throw new Error("invalid exponent, negatives unsupported");
  if (s === ge)
    return e.ONE;
  if (s === me)
    return t;
  let o = e.ONE, n = t;
  for (; s > ge; )
    s & me && (o = e.mul(o, n)), n = e.sqr(n), s >>= me;
  return o;
}
function ro(e, t, s = !1) {
  const o = new Array(t.length).fill(s ? e.ZERO : void 0), n = t.reduce((i, l, c) => e.is0(l) ? i : (o[c] = i, e.mul(i, l)), e.ONE), a = e.inv(n);
  return t.reduceRight((i, l, c) => e.is0(l) ? i : (o[c] = e.mul(i, o[c]), e.mul(i, l)), a), o;
}
function Es(e, t) {
  const s = (e.ORDER - me) / Ve, o = e.pow(t, s), n = e.eql(o, e.ONE), a = e.eql(o, e.ZERO), i = e.eql(o, e.neg(e.ONE));
  if (!n && !a && !i)
    throw new Error("invalid Legendre symbol result");
  return n ? 1 : a ? 0 : -1;
}
function Ui(e, t) {
  t !== void 0 && Gr(t);
  const s = t !== void 0 ? t : e.toString(2).length, o = Math.ceil(s / 8);
  return { nBitLength: s, nByteLength: o };
}
class Di {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = ge;
  ONE = me;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(t, s = {}) {
    if (t <= ge)
      throw new Error("invalid field: expected ORDER > 0, got " + t);
    let o;
    this.isLE = !1, s != null && typeof s == "object" && (typeof s.BITS == "number" && (o = s.BITS), typeof s.sqrt == "function" && (this.sqrt = s.sqrt), typeof s.isLE == "boolean" && (this.isLE = s.isLE), s.allowedLengths && (this._lengths = s.allowedLengths?.slice()), typeof s.modFromBytes == "boolean" && (this._mod = s.modFromBytes));
    const { nBitLength: n, nByteLength: a } = Ui(t, o);
    if (a > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = t, this.BITS = n, this.BYTES = a, this._sqrt = void 0, Object.preventExtensions(this);
  }
  create(t) {
    return ie(t, this.ORDER);
  }
  isValid(t) {
    if (typeof t != "bigint")
      throw new Error("invalid field element: expected bigint, got " + typeof t);
    return ge <= t && t < this.ORDER;
  }
  is0(t) {
    return t === ge;
  }
  // is valid and invertible
  isValidNot0(t) {
    return !this.is0(t) && this.isValid(t);
  }
  isOdd(t) {
    return (t & me) === me;
  }
  neg(t) {
    return ie(-t, this.ORDER);
  }
  eql(t, s) {
    return t === s;
  }
  sqr(t) {
    return ie(t * t, this.ORDER);
  }
  add(t, s) {
    return ie(t + s, this.ORDER);
  }
  sub(t, s) {
    return ie(t - s, this.ORDER);
  }
  mul(t, s) {
    return ie(t * s, this.ORDER);
  }
  pow(t, s) {
    return Mi(this, t, s);
  }
  div(t, s) {
    return ie(t * Cs(s, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(t) {
    return t * t;
  }
  addN(t, s) {
    return t + s;
  }
  subN(t, s) {
    return t - s;
  }
  mulN(t, s) {
    return t * s;
  }
  inv(t) {
    return Cs(t, this.ORDER);
  }
  sqrt(t) {
    return this._sqrt || (this._sqrt = Ti(this.ORDER)), this._sqrt(this, t);
  }
  toBytes(t) {
    return this.isLE ? Ci(t, this.BYTES) : Qn(t, this.BYTES);
  }
  fromBytes(t, s = !1) {
    de(t);
    const { _lengths: o, BYTES: n, isLE: a, ORDER: i, _mod: l } = this;
    if (o) {
      if (!o.includes(t.length) || t.length > n)
        throw new Error("Field.fromBytes: expected " + o + " bytes, got " + t.length);
      const u = new Uint8Array(n);
      u.set(t, a ? 0 : u.length - t.length), t = u;
    }
    if (t.length !== n)
      throw new Error("Field.fromBytes: expected " + n + " bytes, got " + t.length);
    let c = a ? Pt(t) : ki(t);
    if (l && (c = ie(c, i)), !s && !this.isValid(c))
      throw new Error("invalid field element: outside of range 0..ORDER");
    return c;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(t) {
    return ro(this, t);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(t, s, o) {
    return o ? s : t;
  }
}
function Zr(e, t = {}) {
  return new Di(e, t);
}
const Tt = /* @__PURE__ */ BigInt(0), Dr = /* @__PURE__ */ BigInt(1);
function xs(e, t) {
  const s = t.negate();
  return e ? s : t;
}
function Yt(e, t) {
  const s = ro(e.Fp, t.map((o) => o.Z));
  return t.map((o, n) => e.fromAffine(o.toAffine(s[n])));
}
function so(e, t) {
  if (!Number.isSafeInteger(e) || e <= 0 || e > t)
    throw new Error("invalid window size, expected [1.." + t + "], got W=" + e);
}
function Zt(e, t) {
  so(e, t);
  const s = Math.ceil(t / e) + 1, o = 2 ** (e - 1), n = 2 ** e, a = xi(e), i = BigInt(e);
  return { windows: s, windowSize: o, mask: a, maxNumber: n, shiftBy: i };
}
function Ss(e, t, s) {
  const { windowSize: o, mask: n, maxNumber: a, shiftBy: i } = s;
  let l = Number(e & n), c = e >> i;
  l > o && (l -= a, c += Dr);
  const u = t * o, m = u + Math.abs(l) - 1, h = l === 0, p = l < 0, b = t % 2 !== 0;
  return { nextN: c, offset: m, isZero: h, isNeg: p, isNegF: b, offsetF: u };
}
const Xt = /* @__PURE__ */ new WeakMap(), no = /* @__PURE__ */ new WeakMap();
function Jt(e) {
  return no.get(e) || 1;
}
function _s(e) {
  if (e !== Tt)
    throw new Error("invalid wNAF");
}
class Fi {
  BASE;
  ZERO;
  Fn;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(t, s) {
    this.BASE = t.BASE, this.ZERO = t.ZERO, this.Fn = t.Fn, this.bits = s;
  }
  // non-const time multiplication ladder
  _unsafeLadder(t, s, o = this.ZERO) {
    let n = t;
    for (; s > Tt; )
      s & Dr && (o = o.add(n)), n = n.double(), s >>= Dr;
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
  precomputeWindow(t, s) {
    const { windows: o, windowSize: n } = Zt(s, this.bits), a = [];
    let i = t, l = i;
    for (let c = 0; c < o; c++) {
      l = i, a.push(l);
      for (let u = 1; u < n; u++)
        l = l.add(i), a.push(l);
      i = l.double();
    }
    return a;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(t, s, o) {
    if (!this.Fn.isValid(o))
      throw new Error("invalid scalar");
    let n = this.ZERO, a = this.BASE;
    const i = Zt(t, this.bits);
    for (let l = 0; l < i.windows; l++) {
      const { nextN: c, offset: u, isZero: m, isNeg: h, isNegF: p, offsetF: b } = Ss(o, l, i);
      o = c, m ? a = a.add(xs(p, s[b])) : n = n.add(xs(h, s[u]));
    }
    return _s(o), { p: n, f: a };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(t, s, o, n = this.ZERO) {
    const a = Zt(t, this.bits);
    for (let i = 0; i < a.windows && o !== Tt; i++) {
      const { nextN: l, offset: c, isZero: u, isNeg: m } = Ss(o, i, a);
      if (o = l, !u) {
        const h = s[c];
        n = n.add(m ? h.negate() : h);
      }
    }
    return _s(o), n;
  }
  getPrecomputes(t, s, o) {
    let n = Xt.get(s);
    return n || (n = this.precomputeWindow(s, t), t !== 1 && (typeof o == "function" && (n = o(n)), Xt.set(s, n))), n;
  }
  cached(t, s, o) {
    const n = Jt(t);
    return this.wNAF(n, this.getPrecomputes(n, t, o), s);
  }
  unsafe(t, s, o, n) {
    const a = Jt(t);
    return a === 1 ? this._unsafeLadder(t, s, n) : this.wNAFUnsafe(a, this.getPrecomputes(a, t, o), s, n);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(t, s) {
    so(s, this.bits), no.set(t, s), Xt.delete(t);
  }
  hasCache(t) {
    return Jt(t) !== 1;
  }
}
function Ls(e, t, s) {
  if (t) {
    if (t.ORDER !== e)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return Ii(t), t;
  } else
    return Zr(e, { isLE: s });
}
function Oi(e, t, s = {}, o) {
  if (o === void 0 && (o = e === "edwards"), !t || typeof t != "object")
    throw new Error(`expected valid ${e} CURVE object`);
  for (const c of ["p", "n", "h"]) {
    const u = t[c];
    if (!(typeof u == "bigint" && u > Tt))
      throw new Error(`CURVE.${c} must be positive bigint`);
  }
  const n = Ls(t.p, s.Fp, o), a = Ls(t.n, s.Fn, o), l = ["Gx", "Gy", "a", "d"];
  for (const c of l)
    if (!n.isValid(t[c]))
      throw new Error(`CURVE.${c} must be valid field element of CURVE.Fp`);
  return t = Object.freeze(Object.assign({}, t)), { CURVE: t, Fp: n, Fn: a };
}
function Wi(e, t) {
  return function(o) {
    const n = e(o);
    return { secretKey: n, publicKey: t(n) };
  };
}
const Ue = BigInt(0), le = BigInt(1), er = BigInt(2), zi = BigInt(8);
function qi(e, t, s, o) {
  const n = e.sqr(s), a = e.sqr(o), i = e.add(e.mul(t.a, n), a), l = e.add(e.ONE, e.mul(t.d, e.mul(n, a)));
  return e.eql(i, l);
}
function ji(e, t = {}) {
  const s = Oi("edwards", e, t, t.FpFnLE), { Fp: o, Fn: n } = s;
  let a = s.CURVE;
  const { h: i } = a;
  Kr(t, {}, { uvRatio: "function" });
  const l = er << BigInt(n.BYTES * 8) - le, c = (C) => o.create(C), u = t.uvRatio || ((C, A) => {
    try {
      return { isValid: !0, value: o.sqrt(o.div(C, A)) };
    } catch {
      return { isValid: !1, value: Ue };
    }
  });
  if (!qi(o, a, a.Gx, a.Gy))
    throw new Error("bad curve params: generator point");
  function m(C, A, k = !1) {
    const E = k ? le : Ue;
    return Ns("coordinate " + C, A, E, l), A;
  }
  function h(C) {
    if (!(C instanceof w))
      throw new Error("EdwardsPoint expected");
  }
  const p = ks((C, A) => {
    const { X: k, Y: E, Z: x } = C, _ = C.is0();
    A == null && (A = _ ? zi : o.inv(x));
    const f = c(k * A), y = c(E * A), v = o.mul(x, A);
    if (_)
      return { x: Ue, y: le };
    if (v !== le)
      throw new Error("invZ was invalid");
    return { x: f, y };
  }), b = ks((C) => {
    const { a: A, d: k } = a;
    if (C.is0())
      throw new Error("bad point: ZERO");
    const { X: E, Y: x, Z: _, T: f } = C, y = c(E * E), v = c(x * x), N = c(_ * _), P = c(N * N), L = c(y * A), R = c(N * c(L + v)), T = c(P + c(k * c(y * v)));
    if (R !== T)
      throw new Error("bad point: equation left != right (1)");
    const I = c(E * x), M = c(_ * f);
    if (I !== M)
      throw new Error("bad point: equation left != right (2)");
    return !0;
  });
  class w {
    // base / generator point
    static BASE = new w(a.Gx, a.Gy, le, c(a.Gx * a.Gy));
    // zero / infinity / identity point
    static ZERO = new w(Ue, le, le, Ue);
    // 0, 1, 1, 0
    // math field
    static Fp = o;
    // scalar field
    static Fn = n;
    X;
    Y;
    Z;
    T;
    constructor(A, k, E, x) {
      this.X = m("x", A), this.Y = m("y", k), this.Z = m("z", E, !0), this.T = m("t", x), Object.freeze(this);
    }
    static CURVE() {
      return a;
    }
    static fromAffine(A) {
      if (A instanceof w)
        throw new Error("extended point not allowed");
      const { x: k, y: E } = A || {};
      return m("x", k), m("y", E), new w(k, E, le, c(k * E));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(A, k = !1) {
      const E = o.BYTES, { a: x, d: _ } = a;
      A = Ur(de(A, E, "point")), Mr(k, "zip215");
      const f = Ur(A), y = A[E - 1];
      f[E - 1] = y & -129;
      const v = Pt(f), N = k ? l : o.ORDER;
      Ns("point.y", v, Ue, N);
      const P = c(v * v), L = c(P - le), R = c(_ * P - x);
      let { isValid: T, value: I } = u(L, R);
      if (!T)
        throw new Error("bad point: invalid y coordinate");
      const M = (I & le) === le, U = (y & 128) !== 0;
      if (!k && I === Ue && U)
        throw new Error("bad point: x=0 and x_0=1");
      return U !== M && (I = c(-I)), w.fromAffine({ x: I, y: v });
    }
    static fromHex(A, k = !1) {
      return w.fromBytes(Vn(A), k);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(A = 8, k = !0) {
      return g.createCache(this, A), k || this.multiply(er), this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      b(this);
    }
    // Compare one point to another.
    equals(A) {
      h(A);
      const { X: k, Y: E, Z: x } = this, { X: _, Y: f, Z: y } = A, v = c(k * y), N = c(_ * x), P = c(E * y), L = c(f * x);
      return v === N && P === L;
    }
    is0() {
      return this.equals(w.ZERO);
    }
    negate() {
      return new w(c(-this.X), this.Y, this.Z, c(-this.T));
    }
    // Fast algo for doubling Extended Point.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
    // Cost: 4M + 4S + 1*a + 6add + 1*2.
    double() {
      const { a: A } = a, { X: k, Y: E, Z: x } = this, _ = c(k * k), f = c(E * E), y = c(er * c(x * x)), v = c(A * _), N = k + E, P = c(c(N * N) - _ - f), L = v + f, R = L - y, T = v - f, I = c(P * R), M = c(L * T), U = c(P * T), W = c(R * L);
      return new w(I, M, W, U);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(A) {
      h(A);
      const { a: k, d: E } = a, { X: x, Y: _, Z: f, T: y } = this, { X: v, Y: N, Z: P, T: L } = A, R = c(x * v), T = c(_ * N), I = c(y * E * L), M = c(f * P), U = c((x + _) * (v + N) - R - T), W = M - I, j = M + I, H = c(T - k * R), D = c(U * W), F = c(j * H), K = c(U * H), re = c(W * j);
      return new w(D, F, re, K);
    }
    subtract(A) {
      return this.add(A.negate());
    }
    // Constant-time multiplication.
    multiply(A) {
      if (!n.isValidNot0(A))
        throw new Error("invalid scalar: expected 1 <= sc < curve.n");
      const { p: k, f: E } = g.cached(this, A, (x) => Yt(w, x));
      return Yt(w, [k, E])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Does NOT allow scalars higher than CURVE.n.
    // Accepts optional accumulator to merge with multiply (important for sparse scalars)
    multiplyUnsafe(A, k = w.ZERO) {
      if (!n.isValid(A))
        throw new Error("invalid scalar: expected 0 <= sc < curve.n");
      return A === Ue ? w.ZERO : this.is0() || A === le ? this : g.unsafe(this, A, (E) => Yt(w, E), k);
    }
    // Checks if point is of small order.
    // If you add something to small order point, you will have "dirty"
    // point with torsion component.
    // Multiplies point by cofactor and checks if the result is 0.
    isSmallOrder() {
      return this.multiplyUnsafe(i).is0();
    }
    // Multiplies point by curve order and checks if the result is 0.
    // Returns `false` is the point is dirty.
    isTorsionFree() {
      return g.unsafe(this, a.n).is0();
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    toAffine(A) {
      return p(this, A);
    }
    clearCofactor() {
      return i === le ? this : this.multiplyUnsafe(i);
    }
    toBytes() {
      const { x: A, y: k } = this.toAffine(), E = o.toBytes(k);
      return E[E.length - 1] |= A & le ? 128 : 0, E;
    }
    toHex() {
      return Qr(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const g = new Fi(w, n.BITS);
  return w.BASE.precompute(8), w;
}
function Vi(e, t, s = {}) {
  if (typeof t != "function")
    throw new Error('"hash" function param is required');
  Kr(s, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    mapToCurve: "function"
  });
  const { prehash: o } = s, { BASE: n, Fp: a, Fn: i } = e, l = s.randomBytes || ai, c = s.adjustScalarBytes || ((v) => v), u = s.domain || ((v, N, P) => {
    if (Mr(P, "phflag"), N.length || P)
      throw new Error("Contexts/pre-hash are not supported");
    return v;
  });
  function m(v) {
    return i.create(Pt(v));
  }
  function h(v) {
    const N = E.secretKey;
    de(v, E.secretKey, "secretKey");
    const P = de(t(v), 2 * N, "hashedSecretKey"), L = c(P.slice(0, N)), R = P.slice(N, 2 * N), T = m(L);
    return { head: L, prefix: R, scalar: T };
  }
  function p(v) {
    const { head: N, prefix: P, scalar: L } = h(v), R = n.multiply(L), T = R.toBytes();
    return { head: N, prefix: P, scalar: L, point: R, pointBytes: T };
  }
  function b(v) {
    return p(v).pointBytes;
  }
  function w(v = Uint8Array.of(), ...N) {
    const P = ws(...N);
    return m(t(u(P, de(v, void 0, "context"), !!o)));
  }
  function g(v, N, P = {}) {
    v = de(v, void 0, "message"), o && (v = o(v));
    const { prefix: L, scalar: R, pointBytes: T } = p(N), I = w(P.context, L, v), M = n.multiply(I).toBytes(), U = w(P.context, M, T, v), W = i.create(I + U * R);
    if (!i.isValid(W))
      throw new Error("sign failed: invalid s");
    const j = ws(M, i.toBytes(W));
    return de(j, E.signature, "result");
  }
  const C = { zip215: !0 };
  function A(v, N, P, L = C) {
    const { context: R, zip215: T } = L, I = E.signature;
    v = de(v, I, "signature"), N = de(N, void 0, "message"), P = de(P, E.publicKey, "publicKey"), T !== void 0 && Mr(T, "zip215"), o && (N = o(N));
    const M = I / 2, U = v.subarray(0, M), W = Pt(v.subarray(M, I));
    let j, H, D;
    try {
      j = e.fromBytes(P, T), H = e.fromBytes(U, T), D = n.multiplyUnsafe(W);
    } catch {
      return !1;
    }
    if (!T && j.isSmallOrder())
      return !1;
    const F = w(R, H.toBytes(), j.toBytes(), N);
    return H.add(j.multiplyUnsafe(F)).subtract(D).clearCofactor().is0();
  }
  const k = a.BYTES, E = {
    secretKey: k,
    publicKey: k,
    signature: 2 * k,
    seed: k
  };
  function x(v = l(E.seed)) {
    return de(v, E.seed, "seed");
  }
  function _(v) {
    return qn(v) && v.length === i.BYTES;
  }
  function f(v, N) {
    try {
      return !!e.fromBytes(v, N);
    } catch {
      return !1;
    }
  }
  const y = {
    getExtendedPublicKey: p,
    randomSecretKey: x,
    isValidSecretKey: _,
    isValidPublicKey: f,
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
      const { y: N } = e.fromBytes(v), P = E.publicKey, L = P === 32;
      if (!L && P !== 57)
        throw new Error("only defined for 25519 and 448");
      const R = L ? a.div(le + N, le - N) : a.div(N - le, N + le);
      return a.toBytes(R);
    },
    toMontgomerySecret(v) {
      const N = E.secretKey;
      de(v, N);
      const P = t(v.subarray(0, N));
      return c(P).subarray(0, N);
    }
  };
  return Object.freeze({
    keygen: Wi(x, b),
    getPublicKey: b,
    sign: g,
    verify: A,
    utils: y,
    Point: e,
    lengths: E
  });
}
const Hi = BigInt(1), Ps = BigInt(2), $i = BigInt(5), Gi = BigInt(8), Xr = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"), Qi = {
  p: Xr,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: Gi,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
};
function Ki(e) {
  const t = BigInt(10), s = BigInt(20), o = BigInt(40), n = BigInt(80), a = Xr, l = e * e % a * e % a, c = xe(l, Ps, a) * l % a, u = xe(c, Hi, a) * e % a, m = xe(u, $i, a) * u % a, h = xe(m, t, a) * m % a, p = xe(h, s, a) * h % a, b = xe(p, o, a) * p % a, w = xe(b, n, a) * b % a, g = xe(w, n, a) * b % a, C = xe(g, t, a) * m % a;
  return { pow_p_5_8: xe(C, Ps, a) * e % a, b2: l };
}
function Yi(e) {
  return e[0] &= 248, e[31] &= 127, e[31] |= 64, e;
}
const Ts = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function Zi(e, t) {
  const s = Xr, o = ie(t * t * t, s), n = ie(o * o * t, s), a = Ki(e * n).pow_p_5_8;
  let i = ie(e * o * a, s);
  const l = ie(t * i * i, s), c = i, u = ie(i * Ts, s), m = l === e, h = l === ie(-e, s), p = l === ie(-e * Ts, s);
  return m && (i = c), (h || p) && (i = u), Bi(i, s) && (i = ie(-i, s)), { isValid: m || h, value: i };
}
const Xi = /* @__PURE__ */ ji(Qi, { uvRatio: Zi });
function Ji(e) {
  return Vi(Xi, Ai, Object.assign({ adjustScalarBytes: Yi }, e));
}
const ec = /* @__PURE__ */ Ji({});
function tc(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function qt(e, ...t) {
  if (!tc(e))
    throw new Error("Uint8Array expected");
  if (t.length > 0 && !t.includes(e.length))
    throw new Error("Uint8Array expected of length " + t + ", got length=" + e.length);
}
function Bs(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function rc(e, t) {
  qt(e);
  const s = t.outputLen;
  if (e.length < s)
    throw new Error("digestInto() expects output buffer of length at least " + s);
}
function Fr(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function tr(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function Se(e, t) {
  return e << 32 - t | e >>> t;
}
function sc(e) {
  if (typeof e != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(e));
}
function oo(e) {
  return typeof e == "string" && (e = sc(e)), qt(e), e;
}
class nc {
}
function oc(e) {
  const t = (o) => e().update(oo(o)).digest(), s = e();
  return t.outputLen = s.outputLen, t.blockLen = s.blockLen, t.create = () => e(), t;
}
function ac(e, t, s, o) {
  if (typeof e.setBigUint64 == "function")
    return e.setBigUint64(t, s, o);
  const n = BigInt(32), a = BigInt(4294967295), i = Number(s >> n & a), l = Number(s & a), c = o ? 4 : 0, u = o ? 0 : 4;
  e.setUint32(t + c, i, o), e.setUint32(t + u, l, o);
}
function ic(e, t, s) {
  return e & t ^ ~e & s;
}
function cc(e, t, s) {
  return e & t ^ e & s ^ t & s;
}
class lc extends nc {
  constructor(t, s, o, n) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = t, this.outputLen = s, this.padOffset = o, this.isLE = n, this.buffer = new Uint8Array(t), this.view = tr(this.buffer);
  }
  update(t) {
    Bs(this), t = oo(t), qt(t);
    const { view: s, buffer: o, blockLen: n } = this, a = t.length;
    for (let i = 0; i < a; ) {
      const l = Math.min(n - this.pos, a - i);
      if (l === n) {
        const c = tr(t);
        for (; n <= a - i; i += n)
          this.process(c, i);
        continue;
      }
      o.set(t.subarray(i, i + l), this.pos), this.pos += l, i += l, this.pos === n && (this.process(s, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    Bs(this), rc(t, this), this.finished = !0;
    const { buffer: s, view: o, blockLen: n, isLE: a } = this;
    let { pos: i } = this;
    s[i++] = 128, Fr(this.buffer.subarray(i)), this.padOffset > n - i && (this.process(o, 0), i = 0);
    for (let h = i; h < n; h++)
      s[h] = 0;
    ac(o, n - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const l = tr(t), c = this.outputLen;
    if (c % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const u = c / 4, m = this.get();
    if (u > m.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let h = 0; h < u; h++)
      l.setUint32(4 * h, m[h], a);
  }
  digest() {
    const { buffer: t, outputLen: s } = this;
    this.digestInto(t);
    const o = t.slice(0, s);
    return this.destroy(), o;
  }
  _cloneInto(t) {
    t || (t = new this.constructor()), t.set(...this.get());
    const { blockLen: s, buffer: o, length: n, finished: a, destroyed: i, pos: l } = this;
    return t.destroyed = i, t.finished = a, t.length = n, t.pos = l, n % s && t.buffer.set(o), t;
  }
  clone() {
    return this._cloneInto();
  }
}
const De = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), dc = /* @__PURE__ */ Uint32Array.from([
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
]), Fe = /* @__PURE__ */ new Uint32Array(64);
class uc extends lc {
  constructor(t = 32) {
    super(64, t, 8, !1), this.A = De[0] | 0, this.B = De[1] | 0, this.C = De[2] | 0, this.D = De[3] | 0, this.E = De[4] | 0, this.F = De[5] | 0, this.G = De[6] | 0, this.H = De[7] | 0;
  }
  get() {
    const { A: t, B: s, C: o, D: n, E: a, F: i, G: l, H: c } = this;
    return [t, s, o, n, a, i, l, c];
  }
  // prettier-ignore
  set(t, s, o, n, a, i, l, c) {
    this.A = t | 0, this.B = s | 0, this.C = o | 0, this.D = n | 0, this.E = a | 0, this.F = i | 0, this.G = l | 0, this.H = c | 0;
  }
  process(t, s) {
    for (let h = 0; h < 16; h++, s += 4)
      Fe[h] = t.getUint32(s, !1);
    for (let h = 16; h < 64; h++) {
      const p = Fe[h - 15], b = Fe[h - 2], w = Se(p, 7) ^ Se(p, 18) ^ p >>> 3, g = Se(b, 17) ^ Se(b, 19) ^ b >>> 10;
      Fe[h] = g + Fe[h - 7] + w + Fe[h - 16] | 0;
    }
    let { A: o, B: n, C: a, D: i, E: l, F: c, G: u, H: m } = this;
    for (let h = 0; h < 64; h++) {
      const p = Se(l, 6) ^ Se(l, 11) ^ Se(l, 25), b = m + p + ic(l, c, u) + dc[h] + Fe[h] | 0, g = (Se(o, 2) ^ Se(o, 13) ^ Se(o, 22)) + cc(o, n, a) | 0;
      m = u, u = c, c = l, l = i + b | 0, i = a, a = n, n = o, o = b + g | 0;
    }
    o = o + this.A | 0, n = n + this.B | 0, a = a + this.C | 0, i = i + this.D | 0, l = l + this.E | 0, c = c + this.F | 0, u = u + this.G | 0, m = m + this.H | 0, this.set(o, n, a, i, l, c, u, m);
  }
  roundClean() {
    Fr(Fe);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), Fr(this.buffer);
  }
}
const ao = /* @__PURE__ */ oc(() => new uc()), hc = ao, mc = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function fc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = hc(e), s = ec.getPublicKey(t), o = new Uint8Array(64);
  return o.set(t, 0), o.set(s, 32), An(t), { publicKey: s, secretKey: o };
}
function io(e) {
  const t = fc(e), s = t.publicKey;
  return An(t.secretKey), s;
}
function co(e) {
  if (e.length !== 32)
    throw new Error(`Invalid public key length: expected 32, got ${e.length}`);
  return pc(e);
}
function pc(e) {
  let t = 0;
  for (let n = 0; n < e.length && e[n] === 0; n++)
    t++;
  let s = 0n;
  for (let n = 0; n < e.length; n++)
    s = s * 256n + BigInt(e[n]);
  let o = "";
  for (; s > 0n; ) {
    const n = Number(s % 58n);
    o = mc[n] + o, s = s / 58n;
  }
  return "1".repeat(t) + o;
}
const gc = 2, wc = 3;
function lo(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = Or(e), s = zn.share(t, wc, gc);
  if (s.length !== 3)
    throw new Error(`Unexpected share count: ${s.length}`);
  const o = rr(s[0]), n = rr(s[1]), a = rr(s[2]);
  return {
    shareA: He(o),
    shareB: He(n),
    shareC: He(a)
  };
}
function yc(e, t, s) {
  const o = Rs(e), n = Rs(t);
  try {
    const a = zn.combine([o, n]), i = uo(a);
    if (i.length !== 16)
      throw new Error(`Reconstructed seed has wrong length: ${i.length}`);
    return Nn(i);
  } catch (a) {
    throw a instanceof Error && a.message.startsWith("Reconstructed seed") || a instanceof Error && a.message.startsWith("Invalid expectedPublicKey") || a instanceof Error && a.message.startsWith("Reconstructed seed does not match") ? a : new Error("Failed to reconstruct seed from shares");
  }
}
function Or(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
}
function uo(e) {
  if (!/^[0-9a-fA-F]*$/.test(e))
    throw new Error("Invalid hex string: contains non-hex characters");
  if (e.length % 2 !== 0)
    throw new Error(`Invalid hex string: length ${e.length} is odd (must be even)`);
  const t = new Uint8Array(e.length / 2);
  for (let s = 0; s < t.length; s++)
    t[s] = parseInt(e.substr(s * 2, 2), 16);
  return t;
}
function rr(e) {
  const t = e.length % 2 !== 0, s = t ? "0" + e : e, o = uo(s), n = new Uint8Array(1 + o.length);
  return n[0] = t ? 1 : 0, n.set(o, 1), n;
}
function Rs(e) {
  const t = e[0];
  if (t === 0 || t === 1) {
    const o = t === 1, n = e.subarray(1), a = Or(n), i = o ? a.substring(1) : a;
    if (/^[0-9a-f]/.test(i))
      return i;
  }
  const s = Or(e);
  return s.startsWith("0") && !s.startsWith("00") ? s.substring(1) : s;
}
function Bt(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function ho(e, t) {
  return Array.isArray(t) ? t.length === 0 ? !0 : e ? t.every((s) => typeof s == "string") : t.every((s) => Number.isSafeInteger(s)) : !1;
}
function bc(e) {
  if (typeof e != "function")
    throw new Error("function expected");
  return !0;
}
function Rt(e, t) {
  if (typeof t != "string")
    throw new Error(`${e}: string expected`);
  return !0;
}
function ot(e) {
  if (!Number.isSafeInteger(e))
    throw new Error(`invalid integer: ${e}`);
}
function It(e) {
  if (!Array.isArray(e))
    throw new Error("array expected");
}
function Mt(e, t) {
  if (!ho(!0, t))
    throw new Error(`${e}: array of strings expected`);
}
function mo(e, t) {
  if (!ho(!1, t))
    throw new Error(`${e}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function vc(...e) {
  const t = (a) => a, s = (a, i) => (l) => a(i(l)), o = e.map((a) => a.encode).reduceRight(s, t), n = e.map((a) => a.decode).reduce(s, t);
  return { encode: o, decode: n };
}
// @__NO_SIDE_EFFECTS__
function Ac(e) {
  const t = typeof e == "string" ? e.split("") : e, s = t.length;
  Mt("alphabet", t);
  const o = new Map(t.map((n, a) => [n, a]));
  return {
    encode: (n) => (It(n), n.map((a) => {
      if (!Number.isSafeInteger(a) || a < 0 || a >= s)
        throw new Error(`alphabet.encode: digit index outside alphabet "${a}". Allowed: ${e}`);
      return t[a];
    })),
    decode: (n) => (It(n), n.map((a) => {
      Rt("alphabet.decode", a);
      const i = o.get(a);
      if (i === void 0)
        throw new Error(`Unknown letter: "${a}". Allowed: ${e}`);
      return i;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function Nc(e = "") {
  return Rt("join", e), {
    encode: (t) => (Mt("join.decode", t), t.join(e)),
    decode: (t) => (Rt("join.decode", t), t.split(e))
  };
}
// @__NO_SIDE_EFFECTS__
function kc(e, t = "=") {
  return ot(e), Rt("padding", t), {
    encode(s) {
      for (Mt("padding.encode", s); s.length * e % 8; )
        s.push(t);
      return s;
    },
    decode(s) {
      Mt("padding.decode", s);
      let o = s.length;
      if (o * e % 8)
        throw new Error("padding: invalid, string should have whole number of bytes");
      for (; o > 0 && s[o - 1] === t; o--)
        if ((o - 1) * e % 8 === 0)
          throw new Error("padding: invalid, string has too much padding");
      return s.slice(0, o);
    }
  };
}
function Wr(e, t, s) {
  if (t < 2)
    throw new Error(`convertRadix: invalid from=${t}, base cannot be less than 2`);
  if (s < 2)
    throw new Error(`convertRadix: invalid to=${s}, base cannot be less than 2`);
  if (It(e), !e.length)
    return [];
  let o = 0;
  const n = [], a = Array.from(e, (l) => {
    if (ot(l), l < 0 || l >= t)
      throw new Error(`invalid integer: ${l}`);
    return l;
  }), i = a.length;
  for (; ; ) {
    let l = 0, c = !0;
    for (let u = o; u < i; u++) {
      const m = a[u], h = t * l, p = h + m;
      if (!Number.isSafeInteger(p) || h / t !== l || p - m !== h)
        throw new Error("convertRadix: carry overflow");
      const b = p / s;
      l = p % s;
      const w = Math.floor(b);
      if (a[u] = w, !Number.isSafeInteger(w) || w * s + l !== p)
        throw new Error("convertRadix: carry overflow");
      if (c)
        w ? c = !1 : o = u;
      else continue;
    }
    if (n.push(l), c)
      break;
  }
  for (let l = 0; l < e.length - 1 && e[l] === 0; l++)
    n.push(0);
  return n.reverse();
}
const fo = (e, t) => t === 0 ? e : fo(t, e % t), Ut = /* @__NO_SIDE_EFFECTS__ */ (e, t) => e + (t - fo(e, t)), sr = /* @__PURE__ */ (() => {
  let e = [];
  for (let t = 0; t < 40; t++)
    e.push(2 ** t);
  return e;
})();
function zr(e, t, s, o) {
  if (It(e), t <= 0 || t > 32)
    throw new Error(`convertRadix2: wrong from=${t}`);
  if (s <= 0 || s > 32)
    throw new Error(`convertRadix2: wrong to=${s}`);
  if (/* @__PURE__ */ Ut(t, s) > 32)
    throw new Error(`convertRadix2: carry overflow from=${t} to=${s} carryBits=${/* @__PURE__ */ Ut(t, s)}`);
  let n = 0, a = 0;
  const i = sr[t], l = sr[s] - 1, c = [];
  for (const u of e) {
    if (ot(u), u >= i)
      throw new Error(`convertRadix2: invalid data word=${u} from=${t}`);
    if (n = n << t | u, a + t > 32)
      throw new Error(`convertRadix2: carry overflow pos=${a} from=${t}`);
    for (a += t; a >= s; a -= s)
      c.push((n >> a - s & l) >>> 0);
    const m = sr[a];
    if (m === void 0)
      throw new Error("invalid carry");
    n &= m - 1;
  }
  if (n = n << s - a & l, !o && a >= t)
    throw new Error("Excess padding");
  if (!o && n > 0)
    throw new Error(`Non-zero padding: ${n}`);
  return o && a > 0 && c.push(n >>> 0), c;
}
// @__NO_SIDE_EFFECTS__
function Cc(e) {
  ot(e);
  const t = 2 ** 8;
  return {
    encode: (s) => {
      if (!Bt(s))
        throw new Error("radix.encode input should be Uint8Array");
      return Wr(Array.from(s), t, e);
    },
    decode: (s) => (mo("radix.decode", s), Uint8Array.from(Wr(s, e, t)))
  };
}
// @__NO_SIDE_EFFECTS__
function Ec(e, t = !1) {
  if (ot(e), e <= 0 || e > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Ut(8, e) > 32 || /* @__PURE__ */ Ut(e, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (s) => {
      if (!Bt(s))
        throw new Error("radix2.encode input should be Uint8Array");
      return zr(Array.from(s), 8, e, !t);
    },
    decode: (s) => (mo("radix2.decode", s), Uint8Array.from(zr(s, e, 8, t)))
  };
}
function xc(e, t) {
  return ot(e), bc(t), {
    encode(s) {
      if (!Bt(s))
        throw new Error("checksum.encode: input should be Uint8Array");
      const o = t(s).slice(0, e), n = new Uint8Array(s.length + e);
      return n.set(s), n.set(o, s.length), n;
    },
    decode(s) {
      if (!Bt(s))
        throw new Error("checksum.decode: input should be Uint8Array");
      const o = s.slice(0, -e), n = s.slice(-e), a = t(o).slice(0, e);
      for (let i = 0; i < e; i++)
        if (a[i] !== n[i])
          throw new Error("Invalid checksum");
      return o;
    }
  };
}
const bt = {
  alphabet: Ac,
  chain: vc,
  checksum: xc,
  convertRadix: Wr,
  convertRadix2: zr,
  radix: Cc,
  radix2: Ec,
  join: Nc,
  padding: kc
};
const Sc = (e) => e[0] === "あいこくしん";
function _c(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function Lc(e) {
  const t = _c(e), s = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(s.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: s };
}
function po(e) {
  qt(e, 16, 20, 24, 28, 32);
}
const Pc = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([ao(e)[0] >> t << t]);
};
function go(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), bt.chain(bt.checksum(1, Pc), bt.radix2(11, !0), bt.alphabet(e));
}
function Jr(e, t) {
  const { words: s } = Lc(e), o = go(t).decode(s);
  return po(o), o;
}
function wo(e, t) {
  return po(e), go(t).encode(e).join(Sc(t) ? "　" : " ");
}
function es(e, t) {
  try {
    Jr(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const Be = `abandon
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
`), ye = 12;
function Tc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid share length: expected 16, got ${e.length}`);
  const s = wo(e, Be).split(" ");
  if (s.length !== ye)
    throw new Error(`Unexpected word count: expected ${ye}, got ${s.length}`);
  return s;
}
function Bc(e) {
  if (e.length !== ye)
    throw new Error(`Invalid word count: expected ${ye}, got ${e.length}`);
  const t = e.join(" ").toLowerCase().trim();
  if (!es(t, Be))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const s = Jr(t, Be);
  if (s.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${s.length}`);
  return He(s);
}
function Rc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const s = wo(e, Be).split(" ");
  if (s.length !== ye)
    throw new Error(`Unexpected word count: expected ${ye}, got ${s.length}`);
  return s;
}
function Ic(e) {
  if (e.length !== ye)
    throw new Error(`Invalid word count: expected ${ye}, got ${e.length}`);
  const t = e.join(" ").toLowerCase().trim();
  if (!es(t, Be))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const s = Jr(t, Be);
  if (s.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${s.length}`);
  return Nn(s);
}
function yo(e) {
  if (e.length !== ye)
    return !1;
  const t = e.join(" ").toLowerCase().trim();
  return es(t, Be);
}
function vt(e) {
  return Be.includes(e.toLowerCase().trim());
}
function Mc(e, t = 5) {
  const s = e.toLowerCase().trim();
  return s.length === 0 ? [] : Be.filter((o) => o.startsWith(s)).slice(0, t);
}
function Uc(e) {
  const t = [];
  for (let s = 0; s < e.length; s += 4)
    t.push(e.slice(s, s + 4));
  return t;
}
function Dc(e) {
  return e.toLowerCase().replace(/[,\n\r\t]+/g, " ").split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);
}
function Eh({
  className: e = "",
  variant: t = "default",
  size: s = "md",
  children: o,
  menuItems: n = [],
  hideSignOut: a = !1
}) {
  const { user: i, isAuthenticated: l, isLoading: c, openLoginModal: u, logout: m } = Ot(), [h, p] = S(!1), [b, w] = S(-1), g = J(null), C = J(null), A = q(
    () => [...n, ...a ? [] : [{ label: "Sign out", onClick: m }]],
    [n, a, m]
  );
  O(() => {
    if (!h) return;
    const f = (v) => {
      g.current && !g.current.contains(v.target) && (p(!1), w(-1));
    }, y = (v) => {
      v.key === "Escape" && (p(!1), w(-1), C.current?.focus());
    };
    return document.addEventListener("mousedown", f), document.addEventListener("keydown", y), () => {
      document.removeEventListener("mousedown", f), document.removeEventListener("keydown", y);
    };
  }, [h]);
  const k = B(
    (f) => {
      if (!(!h || A.length === 0))
        switch (f.key) {
          case "ArrowDown":
            f.preventDefault(), w((y) => (y + 1) % A.length);
            break;
          case "ArrowUp":
            f.preventDefault(), w((y) => (y - 1 + A.length) % A.length);
            break;
          case "Home":
            f.preventDefault(), w(0);
            break;
          case "End":
            f.preventDefault(), w(A.length - 1);
            break;
          case "Enter":
          case " ":
            b >= 0 && (f.preventDefault(), A[b].onClick(), p(!1), w(-1));
            break;
        }
    },
    [h, b, A]
  ), E = B(() => {
    A.length !== 0 && (p((f) => !f), w(-1));
  }, [A.length]), x = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, _ = {
    default: "cedros-button-primary",
    outline: "cedros-button-outline",
    ghost: "cedros-button-ghost"
  };
  if (c)
    return /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: `cedros-button ${_[t]} ${x[s]} ${e}`,
        disabled: !0,
        children: /* @__PURE__ */ r(Q, { size: "sm" })
      }
    );
  if (l && i) {
    const f = i.name || i.email || "User", y = Bn(i.picture);
    return (
      // L-08: Added keyboard handler and ref for accessibility
      /* @__PURE__ */ d("div", { className: "cedros-user-menu", ref: g, onKeyDown: k, children: [
        /* @__PURE__ */ d(
          "button",
          {
            ref: C,
            type: "button",
            className: `cedros-button cedros-user-button ${x[s]} ${e}`,
            "aria-haspopup": "menu",
            "aria-expanded": h,
            "aria-label": `User menu for ${f}`,
            onClick: E,
            children: [
              y ? /* @__PURE__ */ r(
                "img",
                {
                  src: y,
                  alt: f,
                  className: "cedros-user-avatar",
                  referrerPolicy: "no-referrer",
                  crossOrigin: "anonymous"
                }
              ) : /* @__PURE__ */ r("div", { className: "cedros-user-avatar-placeholder", children: (f[0] || "?").toUpperCase() }),
              /* @__PURE__ */ r("span", { className: "cedros-user-name", children: f })
            ]
          }
        ),
        h && /* @__PURE__ */ d("div", { className: "cedros-dropdown cedros-dropdown-open", role: "menu", children: [
          n.map((v, N) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item ${b === N ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: b === N ? 0 : -1,
              onClick: () => {
                v.onClick(), p(!1);
              },
              children: [
                v.icon && /* @__PURE__ */ r("span", { className: "cedros-dropdown-icon", children: v.icon }),
                v.label
              ]
            },
            N
          )),
          n.length > 0 && !a && /* @__PURE__ */ r("div", { className: "cedros-dropdown-divider", role: "separator" }),
          !a && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item cedros-dropdown-item-danger ${b === n.length ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: b === n.length ? 0 : -1,
              onClick: () => {
                m(), p(!1);
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
      className: `cedros-button ${_[t]} ${x[s]} ${e}`,
      onClick: u,
      children: o || "Sign in"
    }
  );
}
function ts() {
  const { config: e } = ee(), [t, s] = S(!1), [o, n] = S(!1), [a, i] = S(null), l = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: c, getRemainingAttempts: u } = Rn({
    maxAttempts: 3,
    windowMs: 3e5
  }), m = B(
    async (w) => {
      if (!Mn(w)) {
        const g = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw i(g), g;
      }
      try {
        c();
      } catch (g) {
        const C = {
          code: "RATE_LIMITED",
          message: g instanceof Error ? g.message : "Too many attempts"
        };
        throw i(C), C;
      }
      s(!0), i(null), n(!1);
      try {
        await l.post("/forgot-password", { email: w }), n(!0);
      } catch (g) {
        const C = z(g, "Unable to send the reset email. Please try again.");
        throw i(C), C;
      } finally {
        s(!1);
      }
    },
    [l, c]
  ), h = B(
    async (w, g) => {
      s(!0), i(null), n(!1);
      try {
        await l.post("/reset-password", { token: w, newPassword: g }), n(!0);
      } catch (C) {
        const A = z(C, "Unable to reset your password. Please try again.");
        throw i(A), A;
      } finally {
        s(!1);
      }
    },
    [l]
  ), p = B(() => i(null), []), b = B(() => {
    i(null), n(!1), s(!1);
  }, []);
  return {
    forgotPassword: m,
    resetPassword: h,
    isLoading: t,
    isSuccess: o,
    error: a,
    clearError: p,
    reset: b,
    remainingAttempts: u()
  };
}
function Fc(e) {
  return typeof e == "object" && e !== null && "mfaRequired" in e && e.mfaRequired === !0;
}
function Oc() {
  const { config: e, _internal: t } = ee(), [s, o] = S(!1), [n, a] = S(!1), [i, l] = S(null), c = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: u, getRemainingAttempts: m } = Rn({
    maxAttempts: 3,
    windowMs: 3e5
  }), h = B(
    async (g) => {
      if (!Mn(g)) {
        const C = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw l(C), C;
      }
      try {
        u();
      } catch (C) {
        const A = {
          code: "RATE_LIMITED",
          message: C instanceof Error ? C.message : "Too many attempts"
        };
        throw l(A), A;
      }
      o(!0), l(null), a(!1);
      try {
        await c.post("/instant-link", {
          email: g,
          referral: t?.getReferralCode?.() ?? void 0
        }), a(!0);
      } catch (C) {
        const A = z(C, "Unable to send the sign-in link. Please try again.");
        throw l(A), A;
      } finally {
        o(!1);
      }
    },
    [c, u]
  ), p = B(
    async (g) => {
      if (!g || g.trim().length === 0) {
        const C = {
          code: "VALIDATION_ERROR",
          message: "Invalid or missing sign-in link token"
        };
        throw l(C), C;
      }
      o(!0), l(null), a(!1);
      try {
        const C = await c.post(
          "/instant-link/verify",
          {
            token: g
          }
        );
        return Fc(C) || (e.callbacks?.onLoginSuccess?.(C.user, "email"), t?.handleLoginSuccess(C.user, C.tokens)), C;
      } catch (C) {
        const A = z(C, "Unable to verify the sign-in link. Please try again.");
        throw l(A), A;
      } finally {
        o(!1);
      }
    },
    [c, e.callbacks, t]
  ), b = B(() => l(null), []), w = B(() => {
    l(null), a(!1), o(!1);
  }, []);
  return {
    sendInstantLink: h,
    verifyInstantLink: p,
    isLoading: s,
    isSuccess: n,
    error: i,
    clearError: b,
    reset: w,
    remainingAttempts: m()
  };
}
const Wc = {
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
function zc({
  mode: e = "reset",
  onSuccess: t,
  onCancel: s,
  className: o = ""
}) {
  const [n, a] = S(""), i = ts(), l = Oc(), c = Pn(), u = e === "instantLink" ? { submit: l.sendInstantLink, isLoading: l.isLoading, isSuccess: l.isSuccess, error: l.error, clearError: l.clearError } : { submit: i.forgotPassword, isLoading: i.isLoading, isSuccess: i.isSuccess, error: i.error, clearError: i.clearError }, m = Wc[e], h = async (p) => {
    p.preventDefault();
    try {
      await u.submit(n), t?.();
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
    /* @__PURE__ */ r("p", { className: "cedros-success-message", children: m.successMessage(n) }),
    s && /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-outline",
        onClick: s,
        children: "Back to login"
      }
    )
  ] }) : /* @__PURE__ */ d("form", { className: `cedros-forgot-password-form ${o}`, onSubmit: h, children: [
    /* @__PURE__ */ d("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-form-title", children: "Forgot password?" }),
      /* @__PURE__ */ r("p", { className: "cedros-form-subtitle", children: m.subtitle })
    ] }),
    /* @__PURE__ */ r(ae, { error: u.error, onDismiss: u.clearError }),
    /* @__PURE__ */ d("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ r("label", { htmlFor: c, className: "cedros-label", children: "Email address" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: c,
          type: "email",
          className: "cedros-input",
          value: n,
          onChange: (p) => a(p.target.value),
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
          disabled: u.isLoading || !n,
          children: u.isLoading ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Q, { size: "sm" }),
            "Sending..."
          ] }) : m.button
        }
      ),
      s && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: s,
          disabled: u.isLoading,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
const qc = {
  loading: !1,
  loaded: !1,
  error: null,
  callbacks: [],
  load() {
    return typeof window > "u" || typeof document > "u" ? Promise.reject(new Error("Apple Sign-In script loader cannot run in SSR")) : this.loaded ? Promise.resolve() : this.loading ? new Promise((e, t) => {
      this.callbacks.push({ resolve: e, reject: t });
    }) : (this.loading = !0, new Promise((e, t) => {
      this.callbacks.push({ resolve: e, reject: t });
      const s = document.getElementById("apple-signin-script");
      if (s) {
        window.AppleID ? (this.loaded = !0, this.loading = !1, this.callbacks.forEach((n) => n.resolve()), this.callbacks = []) : s.addEventListener("load", () => {
          this.loaded = !0, this.loading = !1, this.callbacks.forEach((n) => n.resolve()), this.callbacks = [];
        });
        return;
      }
      const o = document.createElement("script");
      o.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js", o.async = !0, o.defer = !0, o.id = "apple-signin-script", o.onload = () => {
        this.loaded = !0, this.loading = !1, this.callbacks.forEach((n) => n.resolve()), this.callbacks = [];
      }, o.onerror = () => {
        this.loading = !1, o.remove();
        const n = new Error("Failed to load Apple Sign In script");
        this.callbacks.forEach((a) => a.reject(n)), this.callbacks = [];
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
function jc() {
  const { config: e, _internal: t } = ee(), [s, o] = S(!1), [n, a] = S(!1), [i, l] = S(null), [c, u] = S(null), m = J(e), h = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  );
  O(() => {
    m.current = e;
  }, [e]), O(() => {
    if (!e.appleClientId)
      return;
    let g = !0;
    const C = () => {
      if (g)
        try {
          window.AppleID?.auth?.init({
            clientId: e.appleClientId,
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: !0
          }), g && a(!0);
        } catch {
          g && l({
            code: "SERVER_ERROR",
            message: "Unable to initialize Apple sign-in. Please refresh and try again."
          });
        }
    };
    return qc.load().then(() => {
      g && C();
    }).catch(() => {
      g && l({
        code: "SERVER_ERROR",
        message: "Unable to load Apple sign-in. Please refresh and try again."
      });
    }), () => {
      g = !1;
    };
  }, [e.appleClientId]);
  const p = B(async () => {
    if (!e.appleClientId) {
      const C = {
        code: "VALIDATION_ERROR",
        message: "Apple Client ID not configured"
      };
      throw l(C), C;
    }
    if (!n) {
      const C = {
        code: "VALIDATION_ERROR",
        message: "Apple sign-in is not ready yet. Please wait a moment and try again."
      };
      throw l(C), C;
    }
    o(!0), l(null);
    let g;
    try {
      const C = crypto.getRandomValues(new Uint8Array(32)), A = Array.from(C, (y) => y.toString(16).padStart(2, "0")).join(""), k = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(A)
      ), E = Array.from(
        new Uint8Array(k),
        (y) => y.toString(16).padStart(2, "0")
      ).join("");
      window.AppleID.auth.init({
        clientId: e.appleClientId,
        scope: "name email",
        redirectURI: window.location.origin,
        usePopup: !0,
        nonce: E
      });
      const x = await window.AppleID.auth.signIn();
      if (g = x.authorization?.id_token, !g)
        throw new Error("No ID token received from Apple");
      const _ = x.user?.name ? `${x.user.name.firstName || ""} ${x.user.name.lastName || ""}`.trim() : void 0, f = await h.post("/apple", {
        idToken: g,
        name: _ || void 0,
        nonce: A,
        referral: t?.getReferralCode?.() ?? void 0
      });
      return m.current.callbacks?.onLoginSuccess?.(f.user, "apple"), t?.handleLoginSuccess(f.user, f.tokens), o(!1), f;
    } catch (C) {
      if (C.error === "popup_closed_by_user") {
        const E = {
          code: "SERVER_ERROR",
          message: "Apple sign-in was cancelled."
        };
        throw l(E), o(!1), E;
      }
      const k = z(C, "Unable to sign in with Apple. Please try again.");
      throw k.code === "ACCOUNT_LINK_REQUIRED" && g && u(g), l(k), o(!1), k;
    }
  }, [e.appleClientId, n, h, t]), b = B(() => l(null), []), w = B(() => u(null), []);
  return {
    signIn: p,
    isLoading: s,
    isInitialized: n,
    error: i,
    clearError: b,
    pendingLinkIdToken: c,
    clearPendingLink: w
  };
}
function bo() {
  if (typeof window > "u" || typeof navigator > "u")
    return !1;
  const e = navigator.userAgent.toLowerCase(), t = (navigator.platform || "").toLowerCase();
  return !!(/iphone|ipad|ipod/.test(e) || t.includes("mac") || /macintosh/.test(e) || t === "macintel" && navigator.maxTouchPoints > 1);
}
function Vc({
  onSuccess: e,
  onError: t,
  className: s = "",
  variant: o = "default",
  size: n = "md",
  disabled: a = !1,
  hideOnNonApple: i = !0
}) {
  const { signIn: l, isLoading: c, isInitialized: u } = jc(), [m] = S(() => bo());
  if (i && !m)
    return null;
  const h = async () => {
    try {
      await l(), e?.();
    } catch (w) {
      const g = w instanceof Error ? w : new Error(String(w));
      t?.(g);
    }
  }, p = {
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
      }[o]} ${p[n]} ${s}`,
      onClick: h,
      disabled: a || !u || c,
      "aria-label": "Sign in with Apple",
      children: [
        c ? /* @__PURE__ */ r(Q, { size: "sm" }) : /* @__PURE__ */ r(
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
function he(e, t) {
  if (!e) throw new Error(t);
}
function Hc(e) {
  return e.replace(/-/g, "+").replace(/_/g, "/");
}
function Dt(e) {
  he(typeof e == "string" && e.length > 0, "Expected base64url string");
  const t = Hc(e), s = t + "=".repeat((4 - t.length % 4) % 4), o = atob(s), n = new Uint8Array(o.length);
  for (let a = 0; a < o.length; a++) n[a] = o.charCodeAt(a);
  return n.buffer;
}
function et(e) {
  const t = new Uint8Array(e);
  let s = "";
  for (let n = 0; n < t.length; n++) s += String.fromCharCode(t[n]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function vo(e) {
  he(typeof e == "object" && e !== null, "Invalid credential descriptor");
  const t = e;
  return he(typeof t.type == "string", "Invalid credential descriptor type"), he(typeof t.id == "string", "Invalid credential descriptor id"), {
    type: t.type,
    id: Dt(t.id),
    transports: Array.isArray(t.transports) ? t.transports : void 0
  };
}
function nr(e) {
  he(e && typeof e == "object", "Missing creation options");
  const t = e.publicKey;
  he(t && typeof t == "object", "Missing creation options.publicKey"), he(typeof t.challenge == "string", "Missing creation challenge"), he(typeof t.rp == "object" && t.rp !== null, "Missing rp"), he(typeof t.user == "object" && t.user !== null, "Missing user");
  const s = t.rp, o = t.user;
  he(typeof s.name == "string", "Missing rp.name"), he(typeof o.id == "string", "Missing user.id"), he(typeof o.name == "string", "Missing user.name"), he(typeof o.displayName == "string", "Missing user.displayName");
  const n = Array.isArray(t.excludeCredentials) ? t.excludeCredentials.map(vo) : void 0, a = Array.isArray(t.pubKeyCredParams) ? t.pubKeyCredParams.map((l) => ({
    type: l.type,
    alg: l.alg
  })) : [], i = {
    challenge: Dt(t.challenge),
    rp: {
      name: s.name,
      id: typeof s.id == "string" ? s.id : void 0
    },
    user: {
      id: Dt(o.id),
      name: o.name,
      displayName: o.displayName
    },
    pubKeyCredParams: a,
    timeout: typeof t.timeout == "number" ? t.timeout : void 0,
    attestation: typeof t.attestation == "string" ? t.attestation : void 0,
    authenticatorSelection: typeof t.authenticatorSelection == "object" && t.authenticatorSelection !== null ? t.authenticatorSelection : void 0,
    excludeCredentials: n,
    extensions: typeof t.extensions == "object" && t.extensions !== null ? t.extensions : void 0
  };
  return i.hints = ["client-device"], i;
}
function Is(e) {
  he(e && typeof e == "object", "Missing request options");
  const t = e.publicKey;
  he(t && typeof t == "object", "Missing request options.publicKey"), he(typeof t.challenge == "string", "Missing request challenge");
  const s = Array.isArray(t.allowCredentials) ? t.allowCredentials.map(vo) : void 0, o = {
    challenge: Dt(t.challenge),
    rpId: typeof t.rpId == "string" ? t.rpId : void 0,
    timeout: typeof t.timeout == "number" ? t.timeout : void 0,
    userVerification: typeof t.userVerification == "string" ? t.userVerification : void 0,
    allowCredentials: s,
    extensions: typeof t.extensions == "object" && t.extensions !== null ? t.extensions : void 0
  };
  return o.hints = ["client-device"], o;
}
function lt(e) {
  const t = et(e.rawId), s = e.response, n = { ...{
    clientDataJSON: et(s.clientDataJSON)
  } };
  if ("attestationObject" in s) {
    const a = s;
    if (n.attestationObject = et(a.attestationObject), typeof a.getTransports == "function")
      try {
        n.transports = a.getTransports();
      } catch {
      }
  }
  if ("authenticatorData" in s) {
    const a = s;
    n.authenticatorData = et(a.authenticatorData), n.signature = et(a.signature), a.userHandle && (n.userHandle = et(a.userHandle));
  }
  return {
    id: e.id,
    rawId: t,
    type: e.type,
    authenticatorAttachment: e.authenticatorAttachment ?? void 0,
    clientExtensionResults: e.getClientExtensionResults?.() ?? {},
    response: n
  };
}
function $c() {
  if (typeof window < "u") {
    const e = window.location?.hostname, t = e === "localhost" || e === "127.0.0.1" || e?.endsWith(".localhost");
    if (!(window.isSecureContext === !0) && !t)
      return !1;
  }
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator < "u" && typeof navigator.credentials < "u";
}
function Gc(e) {
  return typeof e == "object" && e !== null && "code" in e && "message" in e && typeof e.code == "string" && typeof e.message == "string";
}
function dt(e) {
  if (!(e instanceof Error)) return null;
  const t = e.name;
  return t === "NotAllowedError" ? { code: "SERVER_ERROR", message: "Passkey operation was cancelled or timed out" } : t === "InvalidStateError" ? { code: "VALIDATION_ERROR", message: "Passkey is not available for this operation" } : t === "SecurityError" ? {
    code: "VALIDATION_ERROR",
    message: "Passkeys require HTTPS and a correctly configured relying party (WEBAUTHN_RP_ID / WEBAUTHN_RP_ORIGIN)"
  } : null;
}
function Ao() {
  const { config: e, _internal: t } = ee(), [s, o] = S(!1), [n, a] = S(null), i = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      // Needed for authenticated registration endpoints when cookie auth is disabled
      getAccessToken: t?.getAccessToken
    }),
    [t?.getAccessToken, e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), l = B(() => a(null), []), c = $c(), u = B(
    async (C) => {
      if (!c) {
        const A = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(A), A;
      }
      o(!0), a(null);
      try {
        const A = await i.post(
          "/webauthn/auth/options",
          { email: C?.email }
        ), k = Is(A.options), E = await navigator.credentials.get({
          publicKey: k
        });
        if (!E)
          throw new Error("Passkey authentication returned no credential");
        const x = await i.post("/webauthn/auth/verify", {
          challengeId: A.challengeId,
          credential: lt(E)
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), x;
      } catch (A) {
        const E = dt(A) ?? z(A, "Unable to sign in with passkey. Please try again.");
        throw a(E), E;
      } finally {
        o(!1);
      }
    },
    [i, e.callbacks, t, c]
  ), m = B(
    async (C) => {
      if (!c) {
        const A = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(A), A;
      }
      o(!0), a(null);
      try {
        const A = await i.post(
          "/webauthn/register/options",
          {}
        ), k = nr(A.options), E = await navigator.credentials.create({
          publicKey: k
        });
        if (!E)
          throw new Error("Passkey registration returned no credential");
        const x = await i.post("/webauthn/register/verify", {
          challengeId: A.challengeId,
          credential: lt(E),
          label: C?.label
        });
        if (!x.success)
          throw new Error("Passkey registration failed");
        return { credentialId: x.credentialId, label: x.label };
      } catch (A) {
        const E = dt(A) ?? z(A, "Unable to register passkey. Please try again.");
        throw a(E), E;
      } finally {
        o(!1);
      }
    },
    [i, c]
  ), h = B(
    async (C) => {
      if (!c) {
        const A = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(A), A;
      }
      o(!0), a(null);
      try {
        const A = await i.post(
          "/webauthn/signup/options",
          {}
        ), k = nr(A.options), E = await navigator.credentials.create({
          publicKey: k
        });
        if (!E)
          throw new Error("Passkey signup returned no credential");
        const x = await i.post("/webauthn/signup/verify", {
          challengeId: A.challengeId,
          credential: lt(E),
          email: C?.email,
          name: C?.name,
          label: C?.label,
          referral: t?.getReferralCode?.() ?? void 0
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), x;
      } catch (A) {
        const E = dt(A) ?? z(A, "Unable to sign up with passkey. Please try again.");
        throw a(E), E;
      } finally {
        o(!1);
      }
    },
    [i, e.callbacks, t, c]
  ), p = B(async () => {
    if (!c) {
      const k = {
        code: "VALIDATION_ERROR",
        message: "Passkeys are not supported in this browser"
      };
      throw a(k), k;
    }
    o(!0), a(null);
    const C = typeof localStorage < "u" && localStorage.getItem("cedros-passkey-registered") === "1", A = () => {
      try {
        localStorage.setItem("cedros-passkey-registered", "1");
      } catch {
      }
    };
    return C ? b(A) : w(A);
  }, [i, e.callbacks, t, c]), b = B(
    async (C) => {
      try {
        const A = await i.post(
          "/webauthn/auth/options",
          {}
        ), k = Is(A.options), E = await navigator.credentials.get({
          publicKey: k
        });
        if (!E)
          throw new Error("Passkey authentication returned no credential");
        const x = await i.post("/webauthn/auth/verify", {
          challengeId: A.challengeId,
          credential: lt(E)
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), C(), x;
      } catch (A) {
        if (A instanceof Error && (A.name === "NotAllowedError" || A.name === "InvalidStateError"))
          return g(C);
        if (typeof A == "object" && A !== null && "isApiError" in A && A.data?.code === "INVALID_CREDENTIALS") {
          const f = {
            code: "INVALID_CREDENTIALS",
            message: "This passkey is not recognized. Please remove old passkeys for this site and try again, or sign in another way."
          };
          throw a(f), f;
        }
        const _ = dt(A) ?? z(A, "Unable to sign in with passkey. Please try again.");
        throw a(_), _;
      } finally {
        o(!1);
      }
    },
    [i, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), w = B(
    async (C) => {
      try {
        return await g(C);
      } catch (A) {
        if (A instanceof Error && (A.name === "InvalidStateError" || A.name === "NotAllowedError"))
          return b(C);
        if (!Gc(A)) {
          const x = dt(A) ?? z(A, "Unable to create passkey. Please try again.");
          throw a(x), x;
        }
        throw A;
      } finally {
        o(!1);
      }
    },
    [i, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), g = B(
    async (C) => {
      const A = await i.post(
        "/webauthn/signup/options",
        {}
      ), k = nr(A.options), E = await navigator.credentials.create({
        publicKey: k
      });
      if (!E)
        throw new Error("Passkey signup returned no credential");
      const x = await i.post("/webauthn/signup/verify", {
        challengeId: A.challengeId,
        credential: lt(E),
        referral: t?.getReferralCode?.() ?? void 0
      });
      return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), C(), x;
    },
    [i, e.callbacks, t]
  );
  return {
    isSupported: c,
    isLoading: s,
    error: n,
    clearError: l,
    continueWithPasskey: p,
    authenticatePasskey: u,
    registerPasskey: m,
    signupWithPasskey: h
  };
}
function Qc({
  onSuccess: e,
  className: t = "",
  children: s,
  disabled: o
}) {
  const { continueWithPasskey: n, isLoading: a, isSupported: i } = Ao(), l = o || !i || a;
  return /* @__PURE__ */ d(
    "button",
    {
      type: "button",
      className: `cedros-button cedros-button-social ${t}`,
      onClick: async () => {
        try {
          await n(), e?.();
        } catch {
        }
      },
      disabled: l,
      "aria-disabled": l,
      children: [
        a ? /* @__PURE__ */ r(Q, { size: "sm" }) : /* @__PURE__ */ r("span", { className: "cedros-social-icon", "aria-hidden": "true", children: /* @__PURE__ */ r(Kc, {}) }),
        /* @__PURE__ */ r("span", { children: s ?? "Continue with Passkey" })
      ]
    }
  );
}
function Kc() {
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
const ut = ["login", "register"];
function rs({ onSuccess: e, className: t = "", defaultTab: s = "login" }) {
  const { config: o, socialButtonOrder: n } = ee(), [a, i] = S(s), [l, c] = S("form"), [u, m] = S(() => ms()), [h] = S(() => bo());
  O(() => {
    const _ = () => m(ms());
    return _(), window.addEventListener("load", _), window.addEventListener("focus", _), () => {
      window.removeEventListener("load", _), window.removeEventListener("focus", _);
    };
  }, []);
  const p = o.forms?.forgotPassword?.mode ?? (o.features?.instantLink ? "instantLink" : "reset"), b = B(
    (_) => {
      const f = ut.indexOf(a);
      let y = f;
      switch (_.key) {
        case "ArrowLeft":
        case "ArrowUp":
          y = f === 0 ? ut.length - 1 : f - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          y = f === ut.length - 1 ? 0 : f + 1;
          break;
        case "Home":
          y = 0;
          break;
        case "End":
          y = ut.length - 1;
          break;
        default:
          return;
      }
      _.preventDefault();
      const v = ut[y];
      i(v), document.getElementById(`cedros-tab-${v}`)?.focus();
    },
    [a]
  ), w = o.features ?? {
    email: !0,
    google: !0,
    apple: !0,
    solana: !0,
    webauthn: !0
  }, g = w.email !== !1, C = w.google !== !1 && o.googleClientId, A = w.apple !== !1 && o.appleClientId && h, k = w.solana !== !1 && u, E = w.webauthn !== !1, x = g && (C || A || k || E);
  return l === "forgotPassword" ? /* @__PURE__ */ r("div", { className: `cedros-login-form ${t}`, children: /* @__PURE__ */ r(zc, { mode: p, onCancel: () => c("form") }) }) : /* @__PURE__ */ d("div", { className: `cedros-login-form ${t}`, children: [
    (E || C || A || k) && (() => {
      const _ = {
        webauthn: E ? /* @__PURE__ */ r(Qc, { onSuccess: e }) : null,
        google: C ? /* @__PURE__ */ r(ua, { onSuccess: e }) : null,
        apple: A ? /* @__PURE__ */ r(Vc, { onSuccess: e }) : null,
        solana: k ? /* @__PURE__ */ r(ha, { onSuccess: e }) : null
      };
      return /* @__PURE__ */ r("div", { className: "cedros-social-buttons", children: (n ?? ["webauthn", "google", "apple", "solana"]).map((y) => {
        const v = _[y];
        return v ? /* @__PURE__ */ r(oa, { children: v }, y) : null;
      }) });
    })(),
    x && /* @__PURE__ */ r("div", { className: "cedros-divider", children: /* @__PURE__ */ r("span", { children: "Or continue with" }) }),
    g && /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ d("div", { className: "cedros-tabs", role: "tablist", "aria-label": "Authentication method", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-login",
            className: `cedros-tab ${a === "login" ? "cedros-tab-active" : ""}`,
            onClick: () => i("login"),
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
            onClick: () => i("register"),
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
            la,
            {
              onSuccess: e,
              onSwitchToRegister: () => i("register"),
              onForgotPassword: () => c("forgotPassword")
            }
          ) : /* @__PURE__ */ r(
            da,
            {
              onSuccess: e,
              onSwitchToLogin: () => i("login")
            }
          )
        }
      )
    ] })
  ] });
}
class Yc extends aa {
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
  componentDidCatch(t, s) {
    this.setState({ errorInfo: s }), console.error("[Cedros Login] Error caught by ErrorBoundary:", t), console.error("[Cedros Login] Component stack:", s.componentStack), this.props.onError?.(t, s);
  }
  handleRetry = () => {
    this.setState({
      hasError: !1,
      error: null,
      errorInfo: null
    });
  };
  render() {
    const { hasError: t, error: s, errorInfo: o } = this.state, { children: n, fallback: a, showDetails: i = !1 } = this.props;
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
      i && s && /* @__PURE__ */ d("details", { className: "cedros-error-boundary-details", children: [
        /* @__PURE__ */ r("summary", { children: "Error details" }),
        /* @__PURE__ */ d("pre", { children: [
          s.toString(),
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
    ] }) }) : n;
  }
}
function xh({ className: e = "", title: t = "Sign in to your account" }) {
  const { isModalOpen: s, closeModal: o } = ee(), n = J(null), a = J(null), i = J(o);
  if (O(() => {
    i.current = o;
  }, [o]), O(() => {
    if (!s) return;
    a.current = document.activeElement, n.current?.focus();
    const c = (m) => {
      if (m.key === "Escape" && i.current(), m.key === "Tab" && n.current) {
        const h = n.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ), p = h[0], b = h[h.length - 1];
        m.shiftKey && document.activeElement === p ? (m.preventDefault(), b?.focus()) : !m.shiftKey && document.activeElement === b && (m.preventDefault(), p?.focus());
      }
    };
    document.addEventListener("keydown", c);
    const u = document.body.style.overflow;
    return document.body.style.overflow = "hidden", () => {
      document.removeEventListener("keydown", c), document.body.style.overflow = u, a.current instanceof HTMLElement && a.current.focus();
    };
  }, [s]), !s) return null;
  const l = (c) => {
    c.target === c.currentTarget && o();
  };
  return /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-modal-backdrop ${e}`,
      onClick: l,
      role: "presentation",
      children: /* @__PURE__ */ d(
        "div",
        {
          ref: n,
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
            /* @__PURE__ */ r("div", { className: "cedros-modal-content", children: /* @__PURE__ */ r(Yc, { children: /* @__PURE__ */ r(rs, { onSuccess: o }) }) })
          ]
        }
      )
    }
  );
}
function Sh({
  token: e,
  onSuccess: t,
  onLoginClick: s,
  className: o = ""
}) {
  const [n, a] = S(""), [i, l] = S(""), [c, u] = S(null), { resetPassword: m, isLoading: h, isSuccess: p, error: b, clearError: w } = ts(), g = n === i, C = c?.isValid && g && n.length > 0, A = async (k) => {
    if (k.preventDefault(), !!C)
      try {
        await m(e, n), t?.();
      } catch {
      }
  };
  return p ? /* @__PURE__ */ d("div", { className: `cedros-reset-password-success ${o}`, children: [
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
    s && /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-primary",
        onClick: s,
        children: "Go to login"
      }
    )
  ] }) : /* @__PURE__ */ d("form", { className: `cedros-reset-password-form ${o}`, onSubmit: A, children: [
    /* @__PURE__ */ d("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-form-title", children: "Reset your password" }),
      /* @__PURE__ */ r("p", { className: "cedros-form-subtitle", children: "Enter your new password below." })
    ] }),
    /* @__PURE__ */ r(ae, { error: b, onDismiss: w }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      be,
      {
        label: "New password",
        value: n,
        onChange: (k) => {
          a(k.target.value), u(zt(k.target.value));
        },
        showStrengthMeter: !0,
        onValidationChange: u,
        disabled: h,
        autoComplete: "new-password",
        error: c && !c.isValid ? Object.values(c.errors).find(Boolean) : void 0
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      be,
      {
        label: "Confirm password",
        value: i,
        onChange: (k) => l(k.target.value),
        disabled: h,
        autoComplete: "new-password",
        error: i && !g ? "Passwords do not match" : void 0
      }
    ) }),
    /* @__PURE__ */ d("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: h || !C,
          children: h ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Q, { size: "sm" }),
            "Resetting..."
          ] }) : "Reset password"
        }
      ),
      s && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: s,
          disabled: h,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
function qr({ org: e, size: t = "lg", className: s = "" }) {
  const o = Bn(e.logoUrl), n = t === "lg" ? "cedros-org-avatar-lg" : "", a = ["cedros-org-avatar", n, s].filter(Boolean).join(" "), i = ["cedros-org-avatar-placeholder", n, s].filter(Boolean).join(" ");
  return o ? /* @__PURE__ */ r(
    "img",
    {
      src: o,
      alt: e.name,
      className: a,
      referrerPolicy: "no-referrer"
    }
  ) : /* @__PURE__ */ r("div", { className: i, children: e.name[0]?.toUpperCase() || "?" });
}
function _h({
  orgs: e,
  activeOrg: t,
  isLoading: s = !1,
  onSelect: o,
  onCreateClick: n,
  className: a = "",
  placeholder: i = "Select organization"
}) {
  const [l, c] = S(!1), u = J(null);
  O(() => {
    const b = (w) => {
      u.current && !u.current.contains(w.target) && c(!1);
    };
    return document.addEventListener("mousedown", b), () => document.removeEventListener("mousedown", b);
  }, []), O(() => {
    const b = (w) => {
      w.key === "Escape" && c(!1);
    };
    if (l)
      return document.addEventListener("keydown", b), () => document.removeEventListener("keydown", b);
  }, [l]);
  const m = B(
    (b) => {
      o(b), c(!1);
    },
    [o]
  ), h = B(() => {
    c(!1), n?.();
  }, [n]), p = B(() => {
    c((b) => !b);
  }, []);
  return s ? /* @__PURE__ */ d(
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
        onClick: p,
        "aria-haspopup": "listbox",
        "aria-expanded": l,
        children: [
          t ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(qr, { org: t, size: "sm" }),
            /* @__PURE__ */ r("span", { className: "cedros-org-selector-name", children: t.name }),
            /* @__PURE__ */ r(Ms, { role: t.membership.role })
          ] }) : /* @__PURE__ */ r("span", { className: "cedros-org-selector-placeholder", children: i }),
          /* @__PURE__ */ r(Zc, { isOpen: l })
        ]
      }
    ),
    l && /* @__PURE__ */ d("div", { className: "cedros-org-selector-dropdown", role: "listbox", children: [
      e.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-org-selector-empty", children: "No organizations" }) : /* @__PURE__ */ r("ul", { className: "cedros-org-selector-list", children: e.map((b) => /* @__PURE__ */ r("li", { children: /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: `cedros-org-selector-item ${b.id === t?.id ? "cedros-org-selector-item-active" : ""}`,
          onClick: () => m(b.id),
          role: "option",
          "aria-selected": b.id === t?.id,
          children: [
            /* @__PURE__ */ r(qr, { org: b, size: "sm" }),
            /* @__PURE__ */ r("span", { className: "cedros-org-selector-item-name", children: b.name }),
            /* @__PURE__ */ r(Ms, { role: b.membership.role }),
            b.id === t?.id && /* @__PURE__ */ r(Xc, {})
          ]
        }
      ) }, b.id)) }),
      n && /* @__PURE__ */ d(X, { children: [
        /* @__PURE__ */ r("div", { className: "cedros-org-selector-divider" }),
        /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-org-selector-create",
            onClick: h,
            children: [
              /* @__PURE__ */ r(Jc, {}),
              /* @__PURE__ */ r("span", { children: "Create organization" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function Ms({ role: e }) {
  return /* @__PURE__ */ r("span", { className: `cedros-org-role cedros-org-role-${e}`, children: e });
}
function Zc({ isOpen: e }) {
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
function Xc() {
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
function Jc() {
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
function el() {
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
function tl() {
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
function rl() {
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
function sl({
  orgs: e,
  activeOrg: t,
  isLoading: s,
  onSelect: o,
  onCreateClick: n
}) {
  return s ? /* @__PURE__ */ d("div", { className: "cedros-org-switcher-loading", children: [
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
          /* @__PURE__ */ r(qr, { org: a }),
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
          a.id === t?.id && /* @__PURE__ */ r(tl, {})
        ]
      }
    ) }, a.id)) }),
    n && /* @__PURE__ */ d("button", { type: "button", className: "cedros-org-switcher-create", onClick: n, children: [
      /* @__PURE__ */ r(rl, {}),
      /* @__PURE__ */ r("span", { children: "Create new organization" })
    ] })
  ] });
}
function nl({ isLoading: e, onSubmit: t, onCancel: s }) {
  const [o, n] = S(""), [a, i] = S(""), [l, c] = S(null), u = B((h) => {
    n(h);
    const p = h.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 50);
    i(p);
  }, []), m = B(
    async (h) => {
      if (h.preventDefault(), c(null), !o.trim()) {
        c("Organization name is required");
        return;
      }
      if (!a.trim()) {
        c("Organization slug is required");
        return;
      }
      try {
        await t({ name: o.trim(), slug: a.trim() });
      } catch (p) {
        c(p.message || "Failed to create organization");
      }
    },
    [o, a, t]
  );
  return /* @__PURE__ */ d("form", { className: "cedros-org-create-form", onSubmit: m, children: [
    l && /* @__PURE__ */ r(ae, { error: l }),
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
            onChange: (h) => i(h.target.value.toLowerCase()),
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
          onClick: s,
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
function Lh({
  isOpen: e,
  onClose: t,
  orgs: s,
  activeOrg: o,
  isLoading: n = !1,
  error: a,
  onSelect: i,
  onCreate: l,
  className: c = ""
}) {
  return e ? /* @__PURE__ */ r(
    ol,
    {
      onClose: t,
      orgs: s,
      activeOrg: o,
      isLoading: n,
      error: a,
      onSelect: i,
      onCreate: l,
      className: c
    }
  ) : null;
}
function ol({
  onClose: e,
  orgs: t,
  activeOrg: s,
  isLoading: o = !1,
  error: n,
  onSelect: a,
  onCreate: i,
  className: l
}) {
  const [c, u] = S("list"), m = J(null), h = J(null);
  O(() => (h.current = document.activeElement, m.current?.querySelector(".cedros-modal-close")?.focus(), () => {
    h.current?.focus();
  }), []), O(() => {
    const g = (C) => {
      if (C.key === "Escape") {
        e();
        return;
      }
      if (C.key === "Tab" && m.current) {
        const A = m.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ), k = A[0], E = A[A.length - 1];
        C.shiftKey ? document.activeElement === k && (C.preventDefault(), E?.focus()) : document.activeElement === E && (C.preventDefault(), k?.focus());
      }
    };
    return document.addEventListener("keydown", g), () => document.removeEventListener("keydown", g);
  }, [e]);
  const p = B(
    (g) => {
      g.target === g.currentTarget && e();
    },
    [e]
  ), b = B(
    (g) => {
      a(g), e();
    },
    [a, e]
  ), w = B(
    async (g) => {
      await i?.(g), e();
    },
    [i, e]
  );
  return /* @__PURE__ */ r("div", { className: "cedros-modal-backdrop", onClick: p, children: /* @__PURE__ */ d(
    "div",
    {
      ref: m,
      className: `cedros-modal cedros-org-switcher ${l}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "org-switcher-title",
      children: [
        /* @__PURE__ */ d("div", { className: "cedros-modal-header", children: [
          /* @__PURE__ */ r("h2", { id: "org-switcher-title", className: "cedros-modal-title", children: c === "list" ? "Switch Organization" : "Create Organization" }),
          /* @__PURE__ */ r("button", { type: "button", className: "cedros-modal-close", onClick: e, "aria-label": "Close", children: /* @__PURE__ */ r(el, {}) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-modal-body", children: [
          n && /* @__PURE__ */ r(ae, { error: n }),
          c === "list" ? /* @__PURE__ */ r(
            sl,
            {
              orgs: t,
              activeOrg: s,
              isLoading: o,
              onSelect: b,
              onCreateClick: i ? () => u("create") : void 0
            }
          ) : /* @__PURE__ */ r(
            nl,
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
function al({
  sessions: e,
  isLoading: t = !1,
  error: s,
  onRevokeAll: o,
  className: n = ""
}) {
  const [a, i] = S(!1), [l, c] = S(!1), u = J(null), m = q(() => e.filter((p) => !p.isCurrent).length, [e]), h = B(async () => {
    if (!o) return;
    const p = e.filter((w) => !w.isCurrent).length;
    if (!(p === 0 || !window.confirm(
      `Are you sure you want to sign out of ${p} other device(s)? This will log you out everywhere except this browser.`
    ))) {
      i(!0), c(!1);
      try {
        await o(), c(!0), u.current !== null && window.clearTimeout(u.current), u.current = window.setTimeout(() => {
          c(!1), u.current = null;
        }, 3e3);
      } finally {
        i(!1);
      }
    }
  }, [o, e]);
  return O(() => () => {
    u.current !== null && (window.clearTimeout(u.current), u.current = null);
  }, []), t && e.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-session-list cedros-session-list-loading ${n}`, children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { children: "Loading sessions..." })
  ] }) : s ? /* @__PURE__ */ r("div", { className: `cedros-session-list ${n}`, children: /* @__PURE__ */ r(ae, { error: s }) }) : e.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-session-list cedros-session-list-empty ${n}`, children: /* @__PURE__ */ r("p", { children: "No active sessions found." }) }) : /* @__PURE__ */ d("div", { className: `cedros-session-list ${n}`, children: [
    l && /* @__PURE__ */ d("div", { className: "cedros-session-success", role: "status", children: [
      /* @__PURE__ */ r(hl, {}),
      /* @__PURE__ */ r("span", { children: "All other sessions have been revoked." })
    ] }),
    /* @__PURE__ */ r("ul", { className: "cedros-session-items", children: e.map((p) => /* @__PURE__ */ r(il, { session: p }, p.id)) }),
    o && m > 0 && /* @__PURE__ */ r("div", { className: "cedros-session-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: h,
        disabled: a,
        children: a ? /* @__PURE__ */ d(X, { children: [
          /* @__PURE__ */ r(Q, { size: "sm" }),
          /* @__PURE__ */ r("span", { children: "Signing out..." })
        ] }) : `Sign out of ${m} other device${m > 1 ? "s" : ""}`
      }
    ) })
  ] });
}
function il({ session: e }) {
  const t = cl(e.userAgent), s = dl(e.expiresAt);
  return /* @__PURE__ */ d("li", { className: `cedros-session-item ${e.isCurrent ? "cedros-session-item-current" : ""}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-session-item-icon", children: /* @__PURE__ */ r(ul, { userAgent: e.userAgent }) }),
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
          ll(e.createdAt)
        ] }),
        s && /* @__PURE__ */ r("span", { className: "cedros-session-expiring", children: "Expires soon" })
      ] })
    ] })
  ] });
}
function cl(e) {
  if (!e)
    return { browser: "Unknown browser", os: "Unknown device" };
  let t = "Unknown browser";
  e.includes("Chrome") && !e.includes("Edg") ? t = "Chrome" : e.includes("Safari") && !e.includes("Chrome") ? t = "Safari" : e.includes("Firefox") ? t = "Firefox" : e.includes("Edg") && (t = "Edge");
  let s = "Unknown device";
  return e.includes("Windows") ? s = "Windows" : e.includes("Mac") ? s = "macOS" : e.includes("Linux") ? s = "Linux" : e.includes("iPhone") || e.includes("iPad") ? s = "iOS" : e.includes("Android") && (s = "Android"), { browser: t, os: s };
}
function ll(e) {
  const t = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - t.getTime(), n = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), i = Math.floor(o / (1e3 * 60 * 60 * 24));
  return n < 1 ? "just now" : n < 60 ? `${n} minute${n > 1 ? "s" : ""} ago` : a < 24 ? `${a} hour${a > 1 ? "s" : ""} ago` : i < 7 ? `${i} day${i > 1 ? "s" : ""} ago` : t.toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function dl(e) {
  const t = new Date(e), s = /* @__PURE__ */ new Date(), o = 3600 * 1e3;
  return t.getTime() - s.getTime() < o;
}
function ul({ userAgent: e }) {
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
function hl() {
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
function ml({
  words: e,
  onConfirm: t,
  className: s = ""
}) {
  const [o, n] = S(!1), [a, i] = S(!1), l = J(null), c = Uc(e), u = B(async () => {
    try {
      await navigator.clipboard.writeText(e.join(" ")), n(!0), l.current !== null && window.clearTimeout(l.current), l.current = window.setTimeout(() => n(!1), 2e3);
    } catch {
    }
  }, [e]);
  O(() => () => {
    l.current !== null && (window.clearTimeout(l.current), l.current = null);
  }, []);
  const m = B(() => {
    a && t();
  }, [a, t]);
  return /* @__PURE__ */ d("div", { className: `cedros-recovery-phrase-display ${s}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-recovery-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-recovery-title", children: "Recovery Phrase" }),
      /* @__PURE__ */ r("p", { className: "cedros-recovery-warning", children: "Write down these 12 words in order and store them securely. This is the only way to recover your wallet if you lose access." })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-recovery-grid", children: c.map((h, p) => /* @__PURE__ */ r("div", { className: "cedros-word-group", children: h.map((b, w) => {
      const g = p * 4 + w + 1;
      return /* @__PURE__ */ d("div", { className: "cedros-word-item", children: [
        /* @__PURE__ */ d("span", { className: "cedros-word-number", children: [
          g,
          "."
        ] }),
        /* @__PURE__ */ r("span", { className: "cedros-word-text", children: b })
      ] }, g);
    }) }, p)) }),
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
            onChange: (h) => i(h.target.checked),
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
          onClick: m,
          disabled: !a,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function fl({
  onSubmit: e,
  onCancel: t,
  isSubmitting: s = !1,
  error: o,
  className: n = ""
}) {
  const [a, i] = S(Array(ye).fill("")), [l, c] = S(null), [u, m] = S([]), [h, p] = S(null), b = Pn(), w = J(null), g = B(
    (f, y) => {
      const v = [...a];
      if (v[f] = y.toLowerCase().trim(), i(v), y.length > 0) {
        const N = Mc(y, 5);
        m(N);
      } else
        m([]);
      p(null);
    },
    [a]
  ), C = B((f) => {
    c(f), m([]);
  }, []), A = B(
    (f) => {
      const y = a[f];
      y && !vt(y) && p(`Word ${f + 1} is not in the wordlist`), w.current !== null && window.clearTimeout(w.current), w.current = window.setTimeout(() => {
        l === f && m([]);
      }, 200);
    },
    [a, l]
  );
  O(() => () => {
    w.current !== null && (window.clearTimeout(w.current), w.current = null);
  }, []);
  const k = B(
    (f) => {
      if (l !== null) {
        const y = [...a];
        y[l] = f, i(y), m([]), document.querySelector(
          `[data-word-index="${l + 1}"]`
        )?.focus();
      }
    },
    [l, a]
  ), E = B((f) => {
    const y = f.clipboardData.getData("text"), v = Dc(y);
    v.length === ye && (f.preventDefault(), i(v), p(null));
  }, []), x = B(
    (f) => {
      if (f.preventDefault(), a.filter((N) => !N).length > 0) {
        p(`Please enter all ${ye} words`);
        return;
      }
      const v = a.map((N, P) => ({ word: N, index: P + 1 })).filter(({ word: N }) => !vt(N));
      if (v.length > 0) {
        p(`Invalid words: ${v.map((N) => `#${N.index}`).join(", ")}`);
        return;
      }
      if (!yo(a)) {
        p("Invalid recovery phrase - please check your words");
        return;
      }
      e(a);
    },
    [a, e]
  ), _ = o || h;
  return /* @__PURE__ */ d(
    "form",
    {
      className: `cedros-recovery-phrase-input ${n}`,
      onSubmit: x,
      onPaste: E,
      children: [
        /* @__PURE__ */ d("div", { className: "cedros-recovery-input-header", children: [
          /* @__PURE__ */ r("h3", { className: "cedros-recovery-input-title", children: "Enter Recovery Phrase" }),
          /* @__PURE__ */ r("p", { className: "cedros-recovery-input-description", children: "Enter your 12-word recovery phrase. You can paste the entire phrase at once." })
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-word-inputs", children: Array.from({ length: ye }, (f, y) => /* @__PURE__ */ d("div", { className: "cedros-word-input-wrapper", children: [
          /* @__PURE__ */ d("label", { className: "cedros-word-label", children: [
            y + 1,
            "."
          ] }),
          /* @__PURE__ */ r(
            "input",
            {
              type: "text",
              className: `cedros-word-input ${a[y] && !vt(a[y]) ? "cedros-word-invalid" : a[y] && vt(a[y]) ? "cedros-word-valid" : ""}`,
              value: a[y],
              onChange: (v) => g(y, v.target.value),
              onFocus: () => C(y),
              onBlur: () => A(y),
              "data-word-index": y,
              autoComplete: "off",
              autoCapitalize: "none",
              spellCheck: !1,
              disabled: s,
              "aria-label": `Word ${y + 1}`
            }
          )
        ] }, y)) }),
        l !== null && u.length > 0 && /* @__PURE__ */ r("div", { className: "cedros-suggestions", role: "listbox", id: `${b}-suggestions`, children: u.map((f) => /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-suggestion",
            onClick: () => k(f),
            role: "option",
            children: f
          },
          f
        )) }),
        _ && /* @__PURE__ */ r("p", { className: "cedros-input-error", role: "alert", children: _ }),
        /* @__PURE__ */ d("div", { className: "cedros-recovery-input-actions", children: [
          t && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-secondary",
              onClick: t,
              disabled: s,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ r(
            "button",
            {
              type: "submit",
              className: "cedros-button cedros-button-primary",
              disabled: s,
              children: s ? "Recovering..." : "Recover Wallet"
            }
          )
        ] })
      ]
    }
  );
}
function Ph({ capabilities: e, className: t = "" }) {
  if (e.allSupported)
    return null;
  const s = ta(e), o = ra();
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
    /* @__PURE__ */ r("p", { className: "cedros-warning-message", children: s }),
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
const pl = ["share_c_only", "full_seed", "none"];
function gl(e) {
  return e && pl.includes(e) ? e : "share_c_only";
}
const wl = {
  walletEnabled: !1,
  recoveryMode: "share_c_only",
  unlockTtlSeconds: 900,
  isLoading: !1,
  error: null,
  refetch: async () => {
  }
};
function No() {
  const e = $e(), [t, s] = S(null), [o, n] = S(!!e), [a, i] = S(null), l = q(() => e ? new ne({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts
  }) : null, [e]), c = B(async () => {
    if (l) {
      n(!0), i(null);
      try {
        const u = await l.get("/discovery");
        u.wallet ? s({
          enabled: u.wallet.enabled,
          recoveryMode: gl(u.wallet.recoveryMode),
          unlockTtlSeconds: u.wallet.unlockTtlSeconds
        }) : s({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } catch (u) {
        const m = u instanceof Error ? u.message : "Failed to fetch wallet config";
        i(m), s({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } finally {
        n(!1);
      }
    }
  }, [l]);
  return O(() => {
    l && c();
  }, [l, c]), e ? {
    walletEnabled: t?.enabled ?? !1,
    recoveryMode: t?.recoveryMode ?? "share_c_only",
    unlockTtlSeconds: t?.unlockTtlSeconds ?? 900,
    isLoading: o,
    error: a,
    refetch: c
  } : wl;
}
function yl() {
  const { user: e } = ee(), { enroll: t } = nt(), { recoveryMode: s } = No(), [o, n] = S({ step: "idle" }), [a, i] = S(!1), l = J([]), c = B(() => {
    kn(...l.current), l.current = [];
  }, []);
  O(() => () => {
    c();
  }, [c]);
  const u = B(
    async (w, g, C, A) => {
      n({ step: "generating_seed" });
      const k = sa();
      l.current.push(k), n({ step: "splitting_shares" });
      const { shareA: E, shareB: x, shareC: _ } = lo(k);
      l.current.push(E, x, _), n({ step: "encrypting_shares" });
      const f = await Cn(E, En(g)), y = io(k), v = co(y);
      n({ step: "uploading" });
      const N = {
        solanaPubkey: v,
        shareAAuthMethod: w,
        shareACiphertext: f.ciphertext,
        shareANonce: f.nonce,
        // Share B is now plaintext (SSS math protects it)
        shareB: Te(x)
      };
      if (w === "password") {
        if (!C) throw new Error("KDF salt required for password method");
        N.shareAKdfSalt = Te(C), N.shareAKdfParams = ft;
      }
      if (w === "passkey" && A && (N.prfSalt = A), await t(N), s === "none")
        c(), n({
          step: "complete",
          solanaPubkey: v
        });
      else {
        const P = s === "full_seed" ? Rc(k) : Tc(He(_));
        n({
          step: "showing_recovery",
          recoveryPhrase: P,
          solanaPubkey: v
        });
      }
    },
    [t, s, c]
  ), m = B(
    async (w) => {
      if (!e) {
        n({ step: "error", error: "User not authenticated" });
        return;
      }
      i(!0), c();
      try {
        const g = xn(), C = await On(w, g, ft);
        l.current.push(C), await u("password", C, g);
      } catch (g) {
        n({
          step: "error",
          error: g instanceof Error ? g.message : "Enrollment failed"
        });
      } finally {
        i(!1);
      }
    },
    [e, c, u]
  ), h = B(async () => {
    if (!e) {
      n({ step: "error", error: "User not authenticated" });
      return;
    }
    i(!0), c();
    try {
      const w = Sn(), g = Te(w);
      n({ step: "encrypting_shares" });
      const A = (await Hr(g)).prfOutput;
      l.current.push(A);
      const k = await _n(A, w);
      l.current.push(k), await u("passkey", k, void 0, g);
    } catch (w) {
      n({
        step: "error",
        error: w instanceof Error ? w.message : "Enrollment failed"
      });
    } finally {
      i(!1);
    }
  }, [e, c, u]), p = B(() => {
    const w = o.solanaPubkey;
    c(), n({
      step: "complete",
      solanaPubkey: w
    });
  }, [o.solanaPubkey, c]), b = B(() => {
    c(), n({ step: "idle" }), i(!1);
  }, [c]);
  return {
    state: o,
    startEnrollmentWithPassword: m,
    startEnrollmentWithPasskey: h,
    confirmRecoveryPhrase: p,
    cancel: b,
    isEnrolling: a
  };
}
function bl() {
  const { config: e, _internal: t } = ee(), [s, o] = S(!1), [n, a] = S(null), i = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t?.getAccessToken]
  );
  return {
    setPassword: B(
      async (c) => {
        o(!0), a(null);
        try {
          await i.post("/set-password", { password: c });
        } catch (u) {
          const m = z(u, "Failed to set password");
          throw a(m), m;
        } finally {
          o(!1);
        }
      },
      [i]
    ),
    isLoading: s,
    error: n
  };
}
function vl(e) {
  return e.includes("email") ? "password" : e.includes("webauthn") ? "passkey" : "set-password";
}
function Al({
  onComplete: e,
  onCancel: t,
  className: s = ""
}) {
  const { user: o } = ee(), {
    state: n,
    startEnrollmentWithPassword: a,
    startEnrollmentWithPasskey: i,
    confirmRecoveryPhrase: l,
    cancel: c,
    isEnrolling: u
  } = yl(), { setPassword: m, isLoading: h } = bl(), p = o ? vl(o.authMethods) : "password", [b, w] = S(""), [g, C] = S(""), [A, k] = S(null);
  O(() => {
    w(""), C(""), k(null);
  }, [o?.id]);
  const E = B(
    async (N) => {
      N.preventDefault(), k(null), await a(b);
    },
    [b, a]
  ), x = B(
    async (N) => {
      if (N.preventDefault(), b !== g) {
        k("Passwords do not match");
        return;
      }
      const P = zt(b);
      if (!P.isValid) {
        const L = Object.values(P.errors)[0];
        k(L ?? "Password does not meet requirements");
        return;
      }
      k(null);
      try {
        await m(b), await a(b);
      } catch {
      }
    },
    [b, g, m, a]
  ), _ = B(async () => {
    await i();
  }, [i]), f = B(() => {
    l(), n.solanaPubkey && e?.(n.solanaPubkey);
  }, [l, n.solanaPubkey, e]), y = B(() => {
    c(), t?.();
  }, [c, t]), v = u || h;
  return n.step === "generating_seed" || n.step === "splitting_shares" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ r("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ r("p", { children: "Generating secure wallet..." })
  ] }) }) : n.step === "encrypting_shares" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ r("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ r("p", { children: "Encrypting wallet shares..." })
  ] }) }) : n.step === "uploading" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ r("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ r("p", { children: "Saving wallet..." })
  ] }) }) : n.step === "showing_recovery" && n.recoveryPhrase ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ r(ml, { words: n.recoveryPhrase, onConfirm: f }) }) : n.step === "complete" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-complete", children: [
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
      n.solanaPubkey
    ] }),
    /* @__PURE__ */ r("p", { children: "Your non-custodial Solana wallet is ready to use." })
  ] }) }) : n.step === "error" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-error", children: [
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
    /* @__PURE__ */ r("p", { className: "cedros-error-message", children: n.error }),
    /* @__PURE__ */ d("div", { className: "cedros-error-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: y,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: () => c(),
          children: "Try Again"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ d("div", { className: `cedros-wallet-enrollment ${s}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-enrollment-header", children: [
      /* @__PURE__ */ r("h2", { children: "Create Wallet" }),
      p === "password" && /* @__PURE__ */ r("p", { children: "Enter your account password to secure your wallet." }),
      p === "passkey" && /* @__PURE__ */ r("p", { children: "Authenticate with your passkey to secure your wallet." }),
      p === "set-password" && /* @__PURE__ */ r("p", { children: "Set a password for your account to secure your wallet." })
    ] }),
    p === "password" && /* @__PURE__ */ d("form", { onSubmit: E, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ r(
        be,
        {
          label: "Account Password",
          value: b,
          onChange: (N) => w(N.target.value),
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
            onClick: y,
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
    p === "passkey" && /* @__PURE__ */ d("div", { className: "cedros-enrollment-form", children: [
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
            onClick: y,
            disabled: v,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: _,
            disabled: v,
            children: v ? "Creating..." : "Use Passkey"
          }
        )
      ] })
    ] }),
    p === "set-password" && /* @__PURE__ */ d("form", { onSubmit: x, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ r(
        be,
        {
          label: "New Password",
          value: b,
          onChange: (N) => w(N.target.value),
          showStrengthMeter: !0,
          disabled: v,
          required: !0,
          minLength: 8,
          placeholder: "Choose a strong password"
        }
      ),
      /* @__PURE__ */ r(
        be,
        {
          label: "Confirm Password",
          value: g,
          onChange: (N) => C(N.target.value),
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
            onClick: y,
            disabled: v,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: v || !b || !g,
            children: v ? "Creating..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function Nl() {
  const { user: e } = ee(), { signTransaction: t } = nt(), [s, o] = S(!1), [n, a] = S(null), i = B(
    async (c, u) => {
      if (!e) {
        const m = "User not authenticated";
        throw a(m), new Error(m);
      }
      o(!0), a(null);
      try {
        const m = {
          transaction: Te(c),
          ...u ? { credential: na(u) } : {}
        }, h = await t(m);
        return Ln(h.signature);
      } catch (m) {
        const h = m instanceof Error ? m.message : "Signing failed";
        throw a(h), m;
      } finally {
        o(!1);
      }
    },
    [e, t]
  ), l = B(() => a(null), []);
  return {
    signTransaction: i,
    isSigning: s,
    error: n,
    clearError: l
  };
}
function kl() {
  const { getMaterial: e } = nt(), [t, s] = S(!1), [o, n] = S(null), a = B(async () => {
    s(!0), n(null);
    try {
      const l = await e();
      if (!l)
        throw new Error("No wallet enrolled");
      if (l.shareAAuthMethod !== "passkey")
        throw new Error("Wallet is not configured for passkey authentication");
      if (!l.prfSalt)
        throw new Error("No PRF salt configured for wallet");
      const c = await Hr(l.prfSalt);
      try {
        return {
          type: "prfOutput",
          prfOutput: Te(c.prfOutput)
        };
      } finally {
        c.prfOutput.fill(0);
      }
    } catch (l) {
      const c = l instanceof Error ? l.message : "Passkey authentication failed";
      return n(c), null;
    } finally {
      s(!1);
    }
  }, [e]), i = B(() => n(null), []);
  return {
    getPasskeyCredential: a,
    isAuthenticating: t,
    error: o,
    clearError: i
  };
}
function Cl({
  mode: e,
  isLoading: t = !1,
  error: s,
  onPrompt: o,
  onRetry: n,
  onCancel: a,
  title: i,
  description: l,
  className: c = ""
}) {
  const u = B(() => {
    t || o?.();
  }, [t, o]), m = B(() => {
    n?.();
  }, [n]), h = e === "register" ? "Set Up Passkey" : "Verify with Passkey", p = e === "register" ? "Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN." : "Use your passkey to unlock your wallet. You will be prompted for biometric verification.";
  return /* @__PURE__ */ d("div", { className: `cedros-passkey-prompt ${c}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-passkey-icon", children: t ? /* @__PURE__ */ r(xl, {}) : s ? /* @__PURE__ */ r(Sl, {}) : /* @__PURE__ */ r(El, {}) }),
    /* @__PURE__ */ r("h3", { className: "cedros-passkey-title", children: i ?? h }),
    /* @__PURE__ */ r("p", { className: "cedros-passkey-description", children: l ?? p }),
    s && /* @__PURE__ */ r("div", { className: "cedros-passkey-error", role: "alert", children: /* @__PURE__ */ r("p", { children: s }) }),
    /* @__PURE__ */ r("div", { className: "cedros-passkey-actions", children: s ? /* @__PURE__ */ d(X, { children: [
      n && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: m,
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
function El() {
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
function xl() {
  return /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
    /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
    /* @__PURE__ */ r("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function Sl() {
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
function _l({
  onUnlock: e,
  onCancel: t,
  showCancel: s = !0,
  authMethod: o,
  className: n = ""
}) {
  ee();
  const { unlock: a, getMaterial: i, isLoading: l } = nt(), { getPasskeyCredential: c, isAuthenticating: u } = kl(), [m, h] = S("idle"), [p, b] = S(o ?? null), [w, g] = S(""), [C, A] = S(null);
  O(() => {
    o !== void 0 && b(o);
  }, [o]);
  const k = p === "password", E = p === "passkey", x = B(async () => {
    if (h("credential"), A(null), !p)
      try {
        const L = await i();
        L ? b(L.shareAAuthMethod) : (A("No wallet enrolled"), h("error"));
      } catch (L) {
        A(L instanceof Error ? L.message : "Failed to get wallet info"), h("error");
      }
  }, [p, i]), _ = B(
    async (L) => {
      L.preventDefault(), A(null), h("unlocking");
      try {
        let R;
        if (k)
          R = { type: "password", password: w };
        else
          throw new Error("Invalid auth method");
        await a(R), h("unlocked"), e?.();
      } catch (R) {
        A(R instanceof Error ? R.message : "Failed to unlock wallet"), h("error");
      }
    },
    [k, w, a, e]
  ), f = B(async () => {
    A(null), h("unlocking");
    try {
      const L = await c();
      if (!L) {
        h("credential");
        return;
      }
      await a(L), h("unlocked"), e?.();
    } catch (L) {
      A(L instanceof Error ? L.message : "Failed to unlock wallet"), h("error");
    }
  }, [c, a, e]), y = B(() => {
    g(""), h("idle"), A(null), t?.();
  }, [t]), v = B(() => {
    g(""), h("credential"), A(null);
  }, []), N = l || u, P = () => {
    switch (m) {
      case "idle":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-idle", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(Ll, {}) }),
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
        return k ? /* @__PURE__ */ d("form", { className: "cedros-wallet-unlock-form", onSubmit: _, children: [
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Enter Password" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Enter your wallet password to unlock." }),
          /* @__PURE__ */ r(
            be,
            {
              label: "Password",
              value: w,
              onChange: (L) => g(L.target.value),
              disabled: N,
              autoComplete: "current-password",
              error: C ?? void 0
            }
          ),
          /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ r(
              "button",
              {
                type: "submit",
                className: "cedros-button cedros-button-primary",
                disabled: N || w.length === 0,
                children: N ? "Unlocking..." : "Unlock"
              }
            ),
            s && /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: y,
                disabled: N,
                children: "Cancel"
              }
            )
          ] })
        ] }) : E ? /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-passkey", children: [
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Verify with Passkey" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Use your passkey to unlock your wallet." }),
          /* @__PURE__ */ r(
            Cl,
            {
              mode: "authenticate",
              isLoading: N,
              error: C ?? void 0,
              onPrompt: f,
              onRetry: f,
              onCancel: s ? y : void 0
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
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(Pl, {}) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Unlocked" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Your wallet is ready to sign transactions." })
        ] });
      case "error":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-error", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(Tl, {}) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Unlock Failed" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: C ?? "Failed to unlock wallet. Please try again." }),
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
            s && /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: y,
                children: "Cancel"
              }
            )
          ] })
        ] });
    }
  };
  return /* @__PURE__ */ r("div", { className: `cedros-wallet-unlock ${n}`, children: P() });
}
function Ll() {
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
function Pl() {
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
function Tl() {
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
function Bl() {
  const { recover: e, getShareBForRecovery: t } = nt(), { recoveryMode: s } = No(), [o, n] = S({ step: "idle" }), [a, i] = S(!1), l = J([]), c = B(() => {
    kn(...l.current), l.current = [];
  }, []);
  O(() => () => {
    c();
  }, [c]);
  const u = B(
    async (h, p, b) => {
      i(!0), c();
      try {
        if (n({ step: "validating" }), !yo(h))
          throw new Error("Invalid recovery phrase. Please check your words.");
        let w;
        if (s === "share_c_only") {
          const v = Bc(h);
          l.current.push(v);
          const N = Te(v), P = await t({ shareC: N }), L = Ln(P.shareB);
          l.current.push(L), w = yc(He(L), He(v)), l.current.push(w);
        } else
          w = Ic(h), l.current.push(w);
        const g = io(w), C = co(g), { shareA: A, shareB: k } = lo(w);
        l.current.push(A, k), n({ step: "encrypting" });
        let E, x, _;
        if (p === "passkey") {
          const v = Sn();
          _ = Te(v);
          const N = await Hr(_);
          l.current.push(N.prfOutput), E = await _n(N.prfOutput, v), l.current.push(E);
        } else
          x = xn(), E = await On(b, x, ft), l.current.push(E);
        const f = await Cn(A, En(E));
        n({ step: "uploading" });
        const y = {
          solanaPubkey: C,
          shareAAuthMethod: p,
          shareACiphertext: f.ciphertext,
          shareANonce: f.nonce,
          shareB: Te(k)
        };
        p === "password" && (y.shareAKdfSalt = Te(x), y.shareAKdfParams = ft), p === "passkey" && (y.prfSalt = _), await e(y), c(), n({ step: "complete" });
      } catch (w) {
        c(), n({
          step: "error",
          error: w instanceof Error ? w.message : "Recovery failed"
        });
      } finally {
        i(!1);
      }
    },
    [e, t, s, c]
  ), m = B(() => {
    c(), n({ step: "idle" }), i(!1);
  }, [c]);
  return {
    state: o,
    startRecovery: u,
    cancel: m,
    isRecovering: a
  };
}
function Rl({
  onComplete: e,
  onCancel: t,
  className: s = "",
  defaultAuthMethod: o = "password"
}) {
  const { state: n, startRecovery: a, cancel: i, isRecovering: l } = Bl(), [c, u] = S([]), [m, h] = S(!1), [p, b] = S(o), [w, g] = S(""), [C, A] = S(""), [k, E] = S(null), x = B((N) => {
    u(N), h(!0);
  }, []), _ = B(
    async (N) => {
      if (N.preventDefault(), E(null), p !== "passkey") {
        if (w !== C) {
          E("Passwords do not match");
          return;
        }
        if (p === "password" && w.length < 8) {
          E("Password must be at least 8 characters");
          return;
        }
      }
      await a(c, p, w);
    },
    [c, p, w, C, a]
  ), f = B(() => {
    i(), u([]), h(!1), g(""), A(""), t?.();
  }, [i, t]), y = B(() => {
    h(!1), g(""), A("");
  }, []), v = B(() => {
    e?.();
  }, [e]);
  return n.step === "validating" || n.step === "encrypting" || n.step === "uploading" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-progress", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(Il, {}) }),
    /* @__PURE__ */ d("h3", { className: "cedros-wallet-recovery-title", children: [
      n.step === "validating" && "Validating Recovery Phrase",
      n.step === "encrypting" && "Encrypting Wallet",
      n.step === "uploading" && "Saving to Server"
    ] }),
    /* @__PURE__ */ d("p", { className: "cedros-wallet-recovery-description", children: [
      n.step === "validating" && "Checking your recovery phrase...",
      n.step === "encrypting" && "Securing your wallet with new encryption...",
      n.step === "uploading" && "Uploading encrypted wallet data..."
    ] })
  ] }) }) : n.step === "complete" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-success", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(Ml, {}) }),
    /* @__PURE__ */ r("h3", { className: "cedros-wallet-recovery-title", children: "Wallet Recovered" }),
    /* @__PURE__ */ d("p", { className: "cedros-wallet-recovery-description", children: [
      "Your wallet has been successfully recovered and secured with your new",
      " ",
      p === "passkey" ? "passkey" : "password",
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
  ] }) }) : n.step === "error" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-error", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(Ul, {}) }),
    /* @__PURE__ */ r("h3", { className: "cedros-wallet-recovery-title", children: "Recovery Failed" }),
    /* @__PURE__ */ r("p", { className: "cedros-wallet-recovery-description", children: n.error ?? "An error occurred during recovery. Please try again." }),
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: f,
        children: "Start Over"
      }
    ) })
  ] }) }) : m ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ d("form", { className: "cedros-wallet-recovery-credential", onSubmit: _, children: [
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
            checked: p === "password",
            onChange: () => b("password"),
            disabled: l
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
            checked: p === "passkey",
            onChange: () => b("passkey"),
            disabled: l
          }
        ),
        /* @__PURE__ */ r("span", { children: "Passkey" })
      ] })
    ] }),
    p === "password" && /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ d("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ r("label", { htmlFor: "recovery-password", className: "cedros-label", children: "New Password" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "recovery-password",
            type: "password",
            className: "cedros-input",
            value: w,
            onChange: (N) => g(N.target.value),
            disabled: l,
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
            value: C,
            onChange: (N) => A(N.target.value),
            disabled: l,
            "aria-invalid": k ? "true" : void 0,
            placeholder: "Confirm your password"
          }
        ),
        k && /* @__PURE__ */ r("p", { className: "cedros-input-error", role: "alert", children: k })
      ] })
    ] }),
    p === "passkey" && /* @__PURE__ */ d("div", { className: "cedros-passkey-info", children: [
      /* @__PURE__ */ r(Dl, {}),
      /* @__PURE__ */ r("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: y,
          disabled: l,
          children: "Back"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: l || p !== "passkey" && (w.length === 0 || C.length === 0),
          children: l ? "Recovering..." : "Recover Wallet"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-phrase", children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-wallet-recovery-title", children: "Recover Your Wallet" }),
      /* @__PURE__ */ r("p", { className: "cedros-wallet-recovery-description", children: "Enter your 12-word recovery phrase to restore your wallet." })
    ] }),
    /* @__PURE__ */ r(
      fl,
      {
        onSubmit: x,
        onCancel: f,
        isSubmitting: !1
      }
    )
  ] }) });
}
function Il() {
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
function Ml() {
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
function Ul() {
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
function Dl() {
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
function Fl({
  address: e,
  label: t = "Wallet Address",
  showCopy: s = !0,
  showExplorerLink: o = !0,
  allowReveal: n = !0,
  className: a = ""
}) {
  const i = $e(), [l, c] = S(!1), [u, m] = S(null), [h, p] = S(!1), b = J(null), w = i?.config.solana?.network ?? "mainnet-beta", g = q(() => {
    const E = `https://explorer.solana.com/address/${e}`;
    return w === "mainnet-beta" ? E : `${E}?cluster=${encodeURIComponent(w)}`;
  }, [e, w]), C = n && e.length > 18, A = q(() => !C || h ? e : `${e.slice(0, 8)}...${e.slice(-8)}`, [e, C, h]), k = B(async () => {
    try {
      m(null), await navigator.clipboard.writeText(e), c(!0), b.current !== null && window.clearTimeout(b.current), b.current = window.setTimeout(() => {
        c(!1), b.current = null;
      }, 2e3);
    } catch (E) {
      c(!1), m(E instanceof Error ? E.message : "Copy failed");
    }
  }, [e]);
  return O(() => () => {
    b.current !== null && (window.clearTimeout(b.current), b.current = null);
  }, []), /* @__PURE__ */ d("div", { className: `cedros-wallet-address-row ${a}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-address-row-header", children: [
      /* @__PURE__ */ r("span", { className: "cedros-wallet-status-pubkey-label", children: t }),
      /* @__PURE__ */ d("div", { className: "cedros-wallet-address-row-actions", children: [
        C && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-ghost",
            onClick: () => p((E) => !E),
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
            href: g,
            target: "_blank",
            rel: "noreferrer",
            children: "Explorer"
          }
        ),
        s && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-outline",
            onClick: k,
            "aria-label": "Copy wallet address",
            children: l ? "Copied" : "Copy"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ r("code", { className: "cedros-wallet-status-pubkey-value", title: e, children: A }),
    u && /* @__PURE__ */ r("p", { className: "cedros-input-hint", role: "status", children: u })
  ] });
}
function Ol({
  status: e,
  publicKey: t,
  onLock: s,
  onEnroll: o,
  onUnlock: n,
  onRecover: a,
  showActions: i = !0,
  compact: l = !1,
  className: c = ""
}) {
  const u = e !== void 0, m = Wt(), h = u ? e : m.status, p = u ? t ?? null : m.solanaPubkey, b = u ? null : m.error, w = u ? () => {
  } : m.refresh, g = u ? () => {
  } : m.clearError, C = Wl(h, b);
  return l ? /* @__PURE__ */ d("div", { className: `cedros-wallet-status cedros-wallet-status-compact ${c}`, children: [
    /* @__PURE__ */ r(
      "span",
      {
        className: `cedros-wallet-status-dot cedros-wallet-status-${C.color}`,
        title: C.label
      }
    ),
    /* @__PURE__ */ r("span", { className: "cedros-wallet-status-label", children: C.label }),
    p && /* @__PURE__ */ r("span", { className: "cedros-wallet-status-pubkey", title: p, children: zl(p) })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-wallet-status ${c}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-status-header", children: [
      /* @__PURE__ */ r(
        "div",
        {
          className: `cedros-wallet-status-icon cedros-wallet-status-icon-${C.color}`,
          children: /* @__PURE__ */ r(ql, { status: h })
        }
      ),
      /* @__PURE__ */ d("div", { className: "cedros-wallet-status-info", children: [
        /* @__PURE__ */ r("h4", { className: "cedros-wallet-status-title", children: C.title }),
        /* @__PURE__ */ r("p", { className: "cedros-wallet-status-description", children: C.description })
      ] })
    ] }),
    p && /* @__PURE__ */ r("div", { className: "cedros-wallet-status-pubkey-full", children: /* @__PURE__ */ r(Fl, { address: p }) }),
    b && /* @__PURE__ */ d("div", { className: "cedros-wallet-status-error-box", role: "alert", children: [
      /* @__PURE__ */ r("p", { children: b }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-secondary",
          onClick: g,
          children: "Dismiss"
        }
      )
    ] }),
    i && /* @__PURE__ */ d("div", { className: "cedros-wallet-status-actions", children: [
      h === "not_enrolled" && o && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: o,
          children: "Create Wallet"
        }
      ),
      h === "enrolled_locked" && n && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: n,
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
function Wl(e, t) {
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
function zl(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function ql({ status: e }) {
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
function Th({ className: e = "", showActions: t = !0 }) {
  const s = Wt(), [o, n] = S("status"), a = q(() => {
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
  }, [o]), i = B(() => n("status"), []), l = B(async () => {
    n("status"), await s.refresh();
  }, [s]), c = B(async () => {
    n("status"), await s.refresh();
  }, [s]), u = B(async () => {
    n("status"), await s.refresh();
  }, [s]);
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
          onClick: i,
          children: "Back"
        }
      )
    ] }),
    o === "status" && /* @__PURE__ */ r(
      Ol,
      {
        onEnroll: () => n("enroll"),
        onUnlock: () => n("unlock"),
        onRecover: () => n("recover_intro"),
        showActions: t
      }
    ),
    o === "enroll" && /* @__PURE__ */ r(
      Al,
      {
        onComplete: () => {
          l();
        },
        onCancel: i
      }
    ),
    o === "unlock" && /* @__PURE__ */ r(
      _l,
      {
        onUnlock: () => {
          c();
        },
        onCancel: i
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
            onClick: () => n("recover"),
            children: "Start recovery"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: i,
            children: "Cancel"
          }
        )
      ] })
    ] }) }),
    o === "recover" && /* @__PURE__ */ r(
      Rl,
      {
        onComplete: () => {
          u();
        },
        onCancel: i
      }
    )
  ] });
}
function Bh({
  showDescriptions: e = !0,
  className: t = "",
  onSave: s
}) {
  const { settings: o, isLoading: n, isUpdating: a, error: i, fetchSettings: l, updateSettings: c } = Aa(), [u, m] = S({}), [h, p] = S(null), [b, w] = S(!1);
  O(() => {
    l();
  }, [l]), O(() => {
    if (b) {
      const _ = setTimeout(() => w(!1), 3e3);
      return () => clearTimeout(_);
    }
  }, [b]);
  const g = B((_, f) => {
    m((y) => ({ ...y, [_]: f })), p(null), w(!1);
  }, []), C = B(async () => {
    const _ = Object.entries(u).map(([f, y]) => ({
      key: f,
      value: y
    }));
    if (_.length !== 0)
      try {
        await c(_), m({}), p(null), w(!0), s?.();
      } catch (f) {
        p(f instanceof Error ? f.message : "Failed to save settings");
      }
  }, [u, c, s]), A = B(() => {
    m({}), p(null), w(!1);
  }, []), k = Object.keys(u).length > 0, E = Object.keys(u).length;
  if (n && Object.keys(o).length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-system-settings cedros-system-settings-loading ${t}`, children: [
      /* @__PURE__ */ r(Q, {}),
      /* @__PURE__ */ r("span", { children: "Loading settings..." })
    ] });
  if (i)
    return /* @__PURE__ */ r("div", { className: `cedros-system-settings ${t}`, children: /* @__PURE__ */ r(ae, { error: i.message }) });
  const x = Object.keys(o).sort();
  return x.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-system-settings cedros-system-settings-empty ${t}`, children: /* @__PURE__ */ r("p", { children: "No system settings found." }) }) : /* @__PURE__ */ d("div", { className: `cedros-system-settings ${t}`, children: [
    h && /* @__PURE__ */ r(ae, { error: h }),
    b && /* @__PURE__ */ r("div", { className: "cedros-settings-success", children: "Settings saved successfully." }),
    x.map((_) => /* @__PURE__ */ r(
      jl,
      {
        category: _,
        settings: o[_],
        edits: u,
        showDescription: e,
        onChange: g
      },
      _
    )),
    /* @__PURE__ */ d("div", { className: "cedros-system-settings-actions", children: [
      k && /* @__PURE__ */ d("span", { className: "cedros-settings-change-count", children: [
        E,
        " unsaved change",
        E !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: A,
          disabled: !k || a,
          children: "Reset"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: C,
          disabled: !k || a,
          children: a ? /* @__PURE__ */ r(Q, { size: "sm" }) : "Save Changes"
        }
      )
    ] })
  ] });
}
const Us = Object.keys(ka);
function jl({
  category: e,
  settings: t,
  edits: s,
  showDescription: o,
  onChange: n
}) {
  const a = Na[e] || {
    label: e,
    description: "",
    icon: ""
  }, i = q(() => [...t].sort((l, c) => {
    const u = Us.indexOf(l.key), m = Us.indexOf(c.key);
    return (u === -1 ? 1 / 0 : u) - (m === -1 ? 1 / 0 : m);
  }), [t]);
  return /* @__PURE__ */ d("section", { className: "cedros-settings-section", children: [
    /* @__PURE__ */ d("div", { className: "cedros-settings-section-header", children: [
      /* @__PURE__ */ r("span", { className: "cedros-settings-section-icon", children: a.icon }),
      /* @__PURE__ */ d("div", { children: [
        /* @__PURE__ */ r("h3", { className: "cedros-settings-section-title", children: a.label }),
        o && a.description && /* @__PURE__ */ r("p", { className: "cedros-settings-section-description", children: a.description })
      ] })
    ] }),
    /* @__PURE__ */ r($r, { settings: i, edits: s, onChange: n })
  ] });
}
class Vl {
  client;
  constructor(t, s, o) {
    this.client = new ne({ baseUrl: t, timeoutMs: s, retryAttempts: o });
  }
  /**
   * Check if initial setup is required
   * Returns whether the system needs initial setup (no admin exists)
   */
  async getStatus() {
    try {
      return await this.client.get("/setup/status");
    } catch (t) {
      throw z(t, "Failed to check setup status");
    }
  }
  /**
   * Create the first admin user
   * Only works when no admin users exist
   */
  async createFirstAdmin(t) {
    try {
      return await this.client.post("/setup/admin", t);
    } catch (s) {
      throw z(s, "Failed to create admin account");
    }
  }
}
function ko() {
  const { config: e } = ee(), [t, s] = S(null), [o, n] = S(!1), [a, i] = S(!1), [l, c] = S(null), u = J(0), m = q(
    () => new Vl(e.serverUrl, e.requestTimeout, e.retryAttempts),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), h = J(m);
  h.current = m;
  const p = B(async () => {
    n(!0), c(null);
    const w = ++u.current;
    try {
      const g = await h.current.getStatus();
      if (w !== u.current) return;
      s(g);
    } catch (g) {
      if (w !== u.current) return;
      c(g instanceof Error ? g : new Error("Failed to check setup status"));
    } finally {
      w === u.current && n(!1);
    }
  }, []), b = B(
    async (w) => {
      i(!0), c(null);
      try {
        const g = await h.current.createFirstAdmin(w);
        return await p(), g;
      } catch (g) {
        const C = g instanceof Error ? g : new Error("Failed to create admin");
        throw c(C), C;
      } finally {
        i(!1);
      }
    },
    [p]
  );
  return {
    status: t,
    isLoading: o,
    isCreating: a,
    error: l,
    checkStatus: p,
    createAdmin: b
  };
}
const Hl = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, Ds = 8;
function $l(e) {
  const t = {};
  return e.email ? Hl.test(e.email) || (t.email = "Invalid email format") : t.email = "Email is required", e.password ? e.password.length < Ds && (t.password = `Password must be at least ${Ds} characters`) : t.password = "Password is required", e.confirmPassword ? e.password !== e.confirmPassword && (t.confirmPassword = "Passwords do not match") : t.confirmPassword = "Please confirm your password", t;
}
function Gl({ onComplete: e, className: t = "" }) {
  const { status: s, isLoading: o, isCreating: n, error: a, checkStatus: i, createAdmin: l } = ko(), [c, u] = S({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    orgName: ""
  }), [m, h] = S({}), [p, b] = S(!1);
  O(() => {
    i();
  }, [i]);
  const w = B(
    (C) => (A) => {
      u((k) => ({ ...k, [C]: A.target.value })), h((k) => ({ ...k, [C]: void 0 }));
    },
    []
  ), g = B(
    async (C) => {
      C.preventDefault();
      const A = $l(c);
      if (Object.keys(A).length > 0) {
        h(A);
        return;
      }
      try {
        await l({
          email: c.email,
          password: c.password,
          name: c.name || void 0,
          orgName: c.orgName || void 0
        }), b(!0), e?.();
      } catch {
      }
    },
    [c, l, e]
  );
  return o ? /* @__PURE__ */ r("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-setup__loading", children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { className: "cedros-setup__loading-text", children: "Checking setup status..." })
  ] }) }) : s && !s.needsSetup ? /* @__PURE__ */ r("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-setup__complete", children: [
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
  ] }) }) : p ? /* @__PURE__ */ r("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-setup__complete", children: [
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
    /* @__PURE__ */ d("form", { className: "cedros-setup__form", onSubmit: g, children: [
      a && /* @__PURE__ */ r(ae, { error: a.message }),
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
            className: `cedros-setup__input ${m.email ? "cedros-setup__input--error" : ""}`,
            value: c.email,
            onChange: w("email"),
            placeholder: "admin@example.com",
            autoComplete: "email",
            autoFocus: !0,
            disabled: n
          }
        ),
        m.email && /* @__PURE__ */ r("span", { className: "cedros-setup__error", children: m.email })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ r("label", { htmlFor: "setup-name", className: "cedros-setup__label", children: "Display Name" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "setup-name",
            type: "text",
            className: "cedros-setup__input",
            value: c.name,
            onChange: w("name"),
            placeholder: "Admin",
            autoComplete: "name",
            disabled: n
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
            value: c.orgName,
            onChange: w("orgName"),
            placeholder: "My Organization",
            disabled: n
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
            className: `cedros-setup__input ${m.password ? "cedros-setup__input--error" : ""}`,
            value: c.password,
            onChange: w("password"),
            placeholder: "At least 8 characters",
            autoComplete: "new-password",
            disabled: n
          }
        ),
        m.password && /* @__PURE__ */ r("span", { className: "cedros-setup__error", children: m.password })
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
            className: `cedros-setup__input ${m.confirmPassword ? "cedros-setup__input--error" : ""}`,
            value: c.confirmPassword,
            onChange: w("confirmPassword"),
            placeholder: "Confirm your password",
            autoComplete: "new-password",
            disabled: n
          }
        ),
        m.confirmPassword && /* @__PURE__ */ r("span", { className: "cedros-setup__error", children: m.confirmPassword })
      ] }),
      /* @__PURE__ */ r("button", { type: "submit", className: "cedros-setup__button", disabled: n, children: n ? /* @__PURE__ */ d(X, { children: [
        /* @__PURE__ */ r(Q, {}),
        /* @__PURE__ */ r("span", { children: "Creating Account..." })
      ] }) : "Create Admin Account" })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-setup__footer", children: [
      /* @__PURE__ */ r("p", { className: "cedros-setup__note", children: "This will be the first administrator account for your installation." }),
      s?.serverVersion && /* @__PURE__ */ d("p", { className: "cedros-setup__version", children: [
        "Server version: ",
        s.serverVersion
      ] })
    ] })
  ] }) });
}
const Ql = ["security", "rate_limit"];
function Rh({ className: e }) {
  return /* @__PURE__ */ r(
    ja,
    {
      title: "Security",
      description: "Configure CORS, cookies, sessions, JWT, and rate limiting settings.",
      categories: Ql,
      className: e
    }
  );
}
const Fs = [
  { id: "email", label: "Email", category: "email" },
  { id: "webhooks", label: "Webhooks", category: "webhook" }
];
function Kl({ className: e }) {
  const {
    settings: t,
    edits: s,
    isLoading: o,
    autosaveStatus: n,
    autosaveError: a,
    error: i,
    fetchSettings: l,
    handleChange: c,
    getEffectiveValue: u
  } = Un(), [m, h] = S("email");
  O(() => {
    l();
  }, [l]);
  const p = Fs.find((x) => x.id === m), b = p?.category ?? "", g = (u("email_provider") || "custom") === "custom", C = u("email_smtp_host"), A = !g || C != null && C !== "", k = q(() => {
    const x = t[b] ?? [];
    if (m !== "email") return x;
    const _ = g ? Fa : Oa;
    return x.filter((f) => _.includes(f.key)).sort((f, y) => _.indexOf(f.key) - _.indexOf(y.key));
  }, [t, b, m, g]), E = (x, _) => {
    if (c(x, _), x === "email_provider" && _ !== "custom") {
      const f = Wa[_];
      f && (c("email_smtp_host", f), c("email_smtp_port", "587"), c("email_smtp_tls", "true"));
    }
  };
  return o && Object.keys(t).length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-system-settings cedros-system-settings-loading ${e ?? ""}`, children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { children: "Loading settings..." })
  ] }) : i ? /* @__PURE__ */ r("div", { className: `cedros-system-settings ${e ?? ""}`, children: /* @__PURE__ */ r(ae, { error: i.message }) }) : /* @__PURE__ */ d("div", { className: `cedros-system-settings ${e ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ d("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ r("h2", { className: "cedros-settings-page-title", children: "Auth Messages" }),
        /* @__PURE__ */ r("p", { className: "cedros-settings-page-description", children: "Configure email delivery for verification emails, password resets, and instant link login. Webhook notifications can be sent to Discord or Slack." })
      ] }),
      /* @__PURE__ */ r(Dn, { status: n, error: a })
    ] }),
    m === "email" && !A && /* @__PURE__ */ r("div", { className: "cedros-settings-warning-banner", children: "Email features (verification, password reset, instant link) are disabled until SMTP is configured. Select a provider or enter custom SMTP settings below." }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: Fs.map((x) => /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${m === x.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => h(x.id),
        "aria-selected": m === x.id,
        role: "tab",
        children: x.label
      },
      x.id
    )) }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: k.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ d("p", { children: [
      "No settings found for ",
      p?.label ?? "this section",
      "."
    ] }) }) : /* @__PURE__ */ r(
      $r,
      {
        settings: k,
        edits: s,
        onChange: m === "email" ? E : c
      }
    ) })
  ] });
}
const or = [
  "image_storage_enabled",
  "image_storage_provider",
  "image_storage_bucket",
  "image_storage_region",
  "image_storage_endpoint",
  "image_storage_access_key",
  "image_storage_secret_key",
  "image_storage_cdn_url"
], Os = {
  nyc3: "https://nyc3.digitaloceanspaces.com",
  ams3: "https://ams3.digitaloceanspaces.com",
  sgp1: "https://sgp1.digitaloceanspaces.com",
  sfo3: "https://sfo3.digitaloceanspaces.com",
  fra1: "https://fra1.digitaloceanspaces.com",
  syd1: "https://syd1.digitaloceanspaces.com"
};
function Yl({ className: e }) {
  const {
    settings: t,
    edits: s,
    isLoading: o,
    autosaveStatus: n,
    autosaveError: a,
    error: i,
    fetchSettings: l,
    handleChange: c,
    getEffectiveValue: u
  } = Un();
  O(() => {
    l();
  }, [l]);
  const m = q(() => (t.image_storage ?? []).filter((b) => or.includes(b.key)).sort((b, w) => or.indexOf(b.key) - or.indexOf(w.key)), [t]), h = (p, b) => {
    if (c(p, b), p === "image_storage_provider")
      if (b === "digitalocean") {
        const w = u("image_storage_region") || "nyc3";
        c("image_storage_region", w), c("image_storage_endpoint", Os[w] ?? `https://${w}.digitaloceanspaces.com`);
      } else b === "s3" && c("image_storage_endpoint", "");
    p === "image_storage_region" && u("image_storage_provider") === "digitalocean" && c("image_storage_endpoint", Os[b] ?? `https://${b}.digitaloceanspaces.com`);
  };
  return o && Object.keys(t).length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-system-settings cedros-system-settings-loading ${e ?? ""}`, children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { children: "Loading settings..." })
  ] }) : i ? /* @__PURE__ */ r("div", { className: `cedros-system-settings ${e ?? ""}`, children: /* @__PURE__ */ r(ae, { error: i.message }) }) : /* @__PURE__ */ d("div", { className: `cedros-system-settings ${e ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ d("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ r("h2", { className: "cedros-settings-page-title", children: "Image Storage" }),
        /* @__PURE__ */ r("p", { className: "cedros-settings-page-description", children: "Configure S3-compatible object storage for user avatars and images. Supports AWS S3, DigitalOcean Spaces, and other S3-compatible providers." })
      ] }),
      /* @__PURE__ */ r(Dn, { status: n, error: a })
    ] }),
    m.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ r("p", { children: "No image storage settings found." }) }) : /* @__PURE__ */ r(
      $r,
      {
        settings: m,
        edits: s,
        onChange: h
      }
    )
  ] });
}
function Zl(e, t) {
  return t.toUpperCase() === "SOL" ? `${(e / 1e9).toFixed(4)} SOL` : `${e} ${t}`;
}
function Ws(e) {
  return e.length <= 16 ? e : `${e.slice(0, 8)}...${e.slice(-6)}`;
}
function Xl(e) {
  return new Date(e).toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const Jl = ["all", "pending", "completed", "failed", "cancelled"];
function ed() {
  const { config: e, _internal: t } = ee(), s = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t]
  ), [o, n] = S("all"), [a, i] = S(0), l = 20, [c, u] = S(null), [m, h] = S(!1), [p, b] = S(null), [w, g] = S(null), [C, A] = S(null), k = B(async () => {
    h(!0), b(null);
    try {
      const f = new URLSearchParams();
      o !== "all" && f.set("status", o), f.set("limit", String(l)), f.set("offset", String(a * l));
      const y = await s.get(
        `/admin/referral-payouts/list?${f.toString()}`
      );
      u(y);
    } catch (f) {
      const y = z(f, "Failed to load payouts");
      b(y.message);
    } finally {
      h(!1);
    }
  }, [s, o, a]);
  O(() => {
    k();
  }, [k]);
  const E = B(
    async (f) => {
      A(f), g(null);
      try {
        const y = await s.post(
          `/admin/referral-payouts/${f}/process`,
          {}
        );
        g(`Processed: ${y.txSignature}`), k();
      } catch (y) {
        const v = z(y, "Failed to process payout");
        g(v.message);
      } finally {
        A(null);
      }
    },
    [s, k]
  ), x = B(
    async (f) => {
      A(f), g(null);
      try {
        await s.post(`/admin/referral-payouts/${f}/cancel`, {}), g("Payout cancelled."), k();
      } catch (y) {
        const v = z(y, "Failed to cancel payout");
        g(v.message);
      } finally {
        A(null);
      }
    },
    [s, k]
  ), _ = c ? Math.ceil(c.total / l) : 0;
  return /* @__PURE__ */ d(X, { children: [
    /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts__filter-bar", children: [
      /* @__PURE__ */ d("label", { className: "cedros-admin-referral-payouts__filter-label", children: [
        "Status:",
        /* @__PURE__ */ r(
          "select",
          {
            value: o,
            onChange: (f) => {
              n(f.target.value), i(0);
            },
            className: "cedros-admin-referral-payouts__filter-select",
            children: Jl.map((f) => /* @__PURE__ */ r("option", { value: f, children: f.charAt(0).toUpperCase() + f.slice(1) }, f))
          }
        )
      ] }),
      c && /* @__PURE__ */ d("span", { className: "cedros-admin-referral-payouts__filter-count", children: [
        c.total,
        " total"
      ] })
    ] }),
    w && /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--info", children: w }),
    m && !c && /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts--loading", children: [
      /* @__PURE__ */ r("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ r("span", { className: "cedros-admin-loading-text", children: "Loading payouts..." })
    ] }),
    p && /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts--error", children: [
      /* @__PURE__ */ r("p", { className: "cedros-admin-error", children: p }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: k,
          children: "Retry"
        }
      )
    ] }),
    c && c.payouts.length === 0 && /* @__PURE__ */ r("div", { className: "cedros-admin-empty-message", children: "No payouts found." }),
    c && c.payouts.length > 0 && /* @__PURE__ */ d("div", { className: "cedros-admin-list-table", role: "table", "aria-label": "All referral payouts", children: [
      /* @__PURE__ */ d("div", { className: "cedros-admin-list-thead", role: "row", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Date" }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Referrer" }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Trigger" }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Amount" }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Status" }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-th", role: "columnheader", children: "TX / Error" }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Actions" })
      ] }),
      c.payouts.map((f) => /* @__PURE__ */ d("div", { className: "cedros-admin-list-row", role: "row", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-td", role: "cell", children: Xl(f.createdAt) }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-td", role: "cell", children: f.referrerEmail || f.referrerName || Ws(f.referrerId) }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-td", role: "cell", children: f.triggerType }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-td", role: "cell", children: Zl(f.amount, f.currency) }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ r("span", { className: `cedros-admin-referral-payouts__status cedros-admin-referral-payouts__status--${f.status}`, children: f.status }) }),
        /* @__PURE__ */ d("div", { className: "cedros-admin-list-td cedros-admin-list-td-mono", role: "cell", children: [
          f.txSignature && Ws(f.txSignature),
          f.errorMessage && /* @__PURE__ */ r("span", { className: "cedros-admin-list-td-muted", title: f.errorMessage, children: f.errorMessage.slice(0, 40) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-admin-list-td", role: "cell", children: [
          (f.status === "pending" || f.status === "failed") && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-primary cedros-button-xs",
              onClick: () => E(f.id),
              disabled: C !== null,
              children: C === f.id ? "..." : "Process"
            }
          ),
          f.status === "pending" && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-xs",
              onClick: () => x(f.id),
              disabled: C !== null,
              style: { marginLeft: 4 },
              children: "Cancel"
            }
          )
        ] })
      ] }, f.id))
    ] }),
    _ > 1 && /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts__pagination", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-xs",
          disabled: a === 0,
          onClick: () => i((f) => f - 1),
          children: "Previous"
        }
      ),
      /* @__PURE__ */ d("span", { className: "cedros-admin-referral-payouts__page-info", children: [
        "Page ",
        a + 1,
        " of ",
        _
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-xs",
          disabled: a >= _ - 1,
          onClick: () => i((f) => f + 1),
          children: "Next"
        }
      )
    ] })
  ] });
}
function ar(e, t) {
  return t.toUpperCase() === "SOL" ? `${(e / 1e9).toFixed(4)} SOL` : `${e} ${t}`;
}
function zs(e) {
  return e.length <= 16 ? e : `${e.slice(0, 8)}...${e.slice(-6)}`;
}
function td({ className: e = "" }) {
  const [t, s] = S("summary");
  return /* @__PURE__ */ d("div", { className: `cedros-admin-referral-payouts ${e}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts__tabs", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-referral-payouts__tab ${t === "summary" ? "cedros-admin-referral-payouts__tab--active" : ""}`,
          onClick: () => s("summary"),
          children: "Summary"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-referral-payouts__tab ${t === "all" ? "cedros-admin-referral-payouts__tab--active" : ""}`,
          onClick: () => s("all"),
          children: "All Payouts"
        }
      )
    ] }),
    t === "summary" ? /* @__PURE__ */ r(rd, {}) : /* @__PURE__ */ r(ed, {})
  ] });
}
function rd() {
  const { config: e, _internal: t } = ee(), s = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t]
  ), [o, n] = S(null), [a, i] = S(!1), [l, c] = S(null), [u, m] = S(!1), [h, p] = S(null), [b, w] = S(null), [g, C] = S(!1), [A, k] = S(null), [E, x] = S(null), [_, f] = S(null), y = B(async () => {
    i(!0), c(null);
    try {
      const U = await s.get("/admin/referral-payouts");
      n(U);
    } catch (U) {
      const W = z(U, "Failed to load referral payouts");
      c(W.message);
    } finally {
      i(!1);
    }
  }, [s]), v = B(async () => {
    try {
      const W = (await s.get("/admin/settings"))?.payout_auto_enabled?.value;
      f(W === "true");
    } catch {
    }
  }, [s]);
  O(() => {
    y(), v();
  }, [y, v]);
  const N = B(async () => {
    m(!0), p(null), w(null);
    try {
      const U = await s.post(
        "/admin/referral-payouts/process",
        {}
      );
      p(U), y();
    } catch (U) {
      const W = z(U, "Failed to process payouts");
      w(W.message);
    } finally {
      m(!1);
    }
  }, [s, y]), P = B(async () => {
    C(!0), k(null), x(null);
    try {
      const U = await s.post(
        "/admin/referral-payouts/retry-failed",
        {}
      );
      k(U), y();
    } catch (U) {
      const W = z(U, "Failed to retry failed payouts");
      x(W.message);
    } finally {
      C(!1);
    }
  }, [s, y]), L = u || g;
  if (a && !o)
    return /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts cedros-admin-referral-payouts--loading", children: [
      /* @__PURE__ */ r("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ r("span", { className: "cedros-admin-loading-text", children: "Loading referral payouts..." })
    ] });
  if (l)
    return /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts cedros-admin-referral-payouts--error", children: [
      /* @__PURE__ */ r("p", { className: "cedros-admin-error", children: l }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: y,
          children: "Retry"
        }
      )
    ] });
  const R = o?.referrers ?? [], T = o?.total ?? 0, I = R[0]?.currency ?? "SOL", M = R.reduce((U, W) => U + W.totalPendingAmount, 0);
  return /* @__PURE__ */ d(X, { children: [
    /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts__header", children: [
      /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts__summary", children: [
        /* @__PURE__ */ d("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ r("span", { className: "cedros-admin-stat-label", children: "Pending Referrers" }),
          /* @__PURE__ */ r("span", { className: "cedros-admin-stat-value", children: T })
        ] }),
        T > 0 && /* @__PURE__ */ d("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ r("span", { className: "cedros-admin-stat-label", children: "Total Pending Amount" }),
          /* @__PURE__ */ r("span", { className: "cedros-admin-stat-value", children: ar(M, I) })
        ] }),
        _ !== null && /* @__PURE__ */ d("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ r("span", { className: "cedros-admin-stat-label", children: "Auto-Processing" }),
          /* @__PURE__ */ r("span", { className: "cedros-admin-stat-value", children: _ ? "ON" : "OFF" })
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts__actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-sm",
            onClick: N,
            disabled: L || T === 0,
            "aria-busy": u,
            children: u ? "Processing..." : "Process All Payouts"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: P,
            disabled: L,
            "aria-busy": g,
            children: g ? "Retrying..." : "Retry Failed"
          }
        )
      ] })
    ] }),
    h && /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--success", children: [
      "Processed ",
      h.processed,
      " payout(s) totalling",
      " ",
      ar(h.totalAmount, I),
      ".",
      h.failed > 0 && ` ${h.failed} failed.`,
      h.skippedNoWallet > 0 && ` ${h.skippedNoWallet} skipped (no wallet).`
    ] }),
    b && /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--error", children: b }),
    A && /* @__PURE__ */ d("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--success", children: [
      "Reset ",
      A.resetCount,
      " failed payout(s) for retry."
    ] }),
    E && /* @__PURE__ */ r("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--error", children: E }),
    R.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-admin-empty-message", children: "No pending referral payouts." }) : /* @__PURE__ */ d("div", { className: "cedros-admin-list-table", role: "table", "aria-label": "Pending referral payouts", children: [
      /* @__PURE__ */ d("div", { className: "cedros-admin-list-thead", role: "row", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Referrer ID" }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Wallet Address" }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Pending Referrals" }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Total Amount" })
      ] }),
      R.map((U) => /* @__PURE__ */ d("div", { className: "cedros-admin-list-row", role: "row", children: [
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-td cedros-admin-list-td-mono", role: "cell", children: /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-admin-user-uuid-link",
            onClick: () => navigator.clipboard?.writeText(U.referrerId),
            title: `Click to copy: ${U.referrerId}`,
            children: zs(U.referrerId)
          }
        ) }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-td", role: "cell", children: U.payoutWalletAddress ? /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-admin-user-uuid-link cedros-admin-list-td-mono",
            onClick: () => navigator.clipboard?.writeText(U.payoutWalletAddress),
            title: `Click to copy: ${U.payoutWalletAddress}`,
            children: zs(U.payoutWalletAddress)
          }
        ) : /* @__PURE__ */ r("span", { className: "cedros-admin-list-td-muted", children: "No wallet" }) }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-td", role: "cell", children: U.pendingCount }),
        /* @__PURE__ */ r("div", { className: "cedros-admin-list-td", role: "cell", children: ar(U.totalPendingAmount, U.currency) })
      ] }, U.referrerId))
    ] })
  ] });
}
const pe = {
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
  ),
  image: /* @__PURE__ */ d(
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
        /* @__PURE__ */ r("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }),
        /* @__PURE__ */ r("circle", { cx: "9", cy: "9", r: "2" }),
        /* @__PURE__ */ r("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" })
      ]
    }
  ),
  referrals: /* @__PURE__ */ d(
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
        /* @__PURE__ */ r("circle", { cx: "18", cy: "5", r: "3" }),
        /* @__PURE__ */ r("circle", { cx: "6", cy: "12", r: "3" }),
        /* @__PURE__ */ r("circle", { cx: "18", cy: "19", r: "3" }),
        /* @__PURE__ */ r("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
        /* @__PURE__ */ r("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" })
      ]
    }
  )
}, sd = [
  // Top-level menu items
  { id: "users", label: "Users", icon: pe.users },
  { id: "team", label: "Team", icon: pe.members },
  { id: "referrals", label: "Referrals", icon: pe.referrals },
  { id: "deposits", label: "Deposits", icon: pe.deposits, requiredFeature: "credits" },
  { id: "withdrawals", label: "Withdrawals", icon: pe.withdrawals, requiredFeature: "credits" },
  // Configuration group
  { id: "settings-auth", label: "Authentication", icon: pe.key, group: "Configuration" },
  { id: "settings-messaging", label: "Auth Messages", icon: pe.mail, group: "Configuration" },
  { id: "settings-wallet", label: "User Wallets", icon: pe.wallet, group: "Configuration" },
  {
    id: "settings-credits",
    label: "Credit System",
    icon: pe.coins,
    group: "Configuration",
    requiredFeature: "credits"
  },
  { id: "settings-server", label: "Auth Server", icon: pe.server, group: "Configuration" },
  { id: "settings-images", label: "Image Storage", icon: pe.image, group: "Configuration" }
];
function Ih({
  title: e = "Dashboard",
  sections: t = [
    "users",
    "team",
    "referrals",
    "deposits",
    "withdrawals",
    "settings-wallet",
    "settings-auth",
    "settings-messaging",
    "settings-credits",
    "settings-server",
    "settings-images"
  ],
  defaultSection: s = "users",
  refreshInterval: o = 0,
  pageSize: n = 20,
  onSectionChange: a,
  onSettingsClick: i,
  onLogoutClick: l,
  className: c = ""
}) {
  const [u, m] = S(s), [h, p] = S(!0), { user: b, logout: w } = ee(), { activeOrg: g, role: C, isLoading: A, fetchOrgs: k, hasPermission: E } = Ca(), { status: x, isLoading: _, checkStatus: f } = ko(), { features: y, isLoading: v } = ma(), { canAccess: N } = fa(), P = B(
    (M) => {
      m(M), a?.(M);
    },
    [a]
  ), L = sd.filter((M) => !(!t.includes(M.id) || M.requiredFeature && !y[M.requiredFeature] || !N(M.id))), R = L.find((M) => M.id === u), T = !R && !v;
  return O(() => {
    k(), f();
  }, [k, f]), O(() => {
    T && L.length > 0 && m("users");
  }, [T, L.length]), !_ && x?.needsSetup ? /* @__PURE__ */ r("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--setup ${c}`, children: /* @__PURE__ */ r(Gl, { onComplete: () => f() }) }) : (A || _ || v) && !g ? /* @__PURE__ */ d("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--loading ${c}`, children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { className: "cedros-dashboard__loading-text", children: "Loading..." })
  ] }) : u === "team" && !g ? /* @__PURE__ */ r("div", { className: `cedros-admin cedros-dashboard ${c}`, children: /* @__PURE__ */ r(ae, { error: "No organization selected. Please select an organization first." }) }) : /* @__PURE__ */ d("div", { className: `cedros-admin cedros-dashboard ${c}`, children: [
    /* @__PURE__ */ d("aside", { className: "cedros-dashboard__sidebar", children: [
      /* @__PURE__ */ r("div", { className: "cedros-dashboard__sidebar-header", children: /* @__PURE__ */ d("div", { className: "cedros-dashboard__logo", children: [
        pe.wallet,
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__logo-text", children: e })
      ] }) }),
      /* @__PURE__ */ d("nav", { className: "cedros-dashboard__nav", children: [
        /* @__PURE__ */ d("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-label", children: "Menu" }),
          L.filter((M) => !M.group).map((M) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === M.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => P(M.id),
              "aria-current": u === M.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-icon", children: M.icon }),
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-text", children: M.label })
              ]
            },
            M.id
          ))
        ] }),
        L.some((M) => M.group === "Configuration") && /* @__PURE__ */ d("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: "cedros-dashboard__nav-label cedros-dashboard__nav-label--collapsible",
              onClick: () => p(!h),
              "aria-expanded": h,
              children: [
                /* @__PURE__ */ r("span", { children: "Configuration" }),
                /* @__PURE__ */ r(
                  "span",
                  {
                    className: `cedros-dashboard__nav-chevron ${h ? "cedros-dashboard__nav-chevron--expanded" : ""}`,
                    children: pe.chevronRight
                  }
                )
              ]
            }
          ),
          h && L.filter((M) => M.group === "Configuration").map((M) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === M.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => P(M.id),
              "aria-current": u === M.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-icon", children: M.icon }),
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-text", children: M.label })
              ]
            },
            M.id
          ))
        ] })
      ] }),
      b && /* @__PURE__ */ r("div", { className: "cedros-dashboard__sidebar-footer", children: /* @__PURE__ */ r(
        Ma,
        {
          name: b.name,
          email: b.email,
          picture: b.picture,
          onSettings: i,
          onLogout: l ?? w
        }
      ) })
    ] }),
    /* @__PURE__ */ d("main", { className: "cedros-dashboard__main", children: [
      /* @__PURE__ */ r("header", { className: "cedros-dashboard__header", children: /* @__PURE__ */ d("div", { className: "cedros-dashboard__breadcrumb", children: [
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-root", children: e }),
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-sep", children: pe.chevronRight }),
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-current", children: R?.label })
      ] }) }),
      /* @__PURE__ */ d("div", { className: "cedros-dashboard__content", children: [
        u === "users" && /* @__PURE__ */ r(nd, { pageSize: n, currentUserId: b?.id }),
        u === "team" && g && /* @__PURE__ */ r(
          od,
          {
            orgId: g.id,
            currentUserId: b?.id,
            hasPermission: E,
            role: C
          }
        ),
        u === "referrals" && /* @__PURE__ */ r(cd, {}),
        u === "deposits" && /* @__PURE__ */ r(ad, { pageSize: n, refreshInterval: o }),
        u === "withdrawals" && /* @__PURE__ */ r(id, { pageSize: n, refreshInterval: o }),
        u === "settings-auth" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Ua, {}) }),
        u === "settings-wallet" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Da, {}) }),
        u === "settings-messaging" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Kl, {}) }),
        u === "settings-credits" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(za, {}) }),
        u === "settings-server" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(qa, {}) }),
        u === "settings-images" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Yl, {}) })
      ] })
    ] })
  ] });
}
function nd({ pageSize: e, currentUserId: t }) {
  const [s, o] = S(null), { statsItems: n, isLoading: a, error: i, refresh: l } = Ba();
  return s ? /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(
    Ra,
    {
      userId: s.id,
      currentUserId: t,
      onBack: () => o(null)
    }
  ) }) : /* @__PURE__ */ d("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ r(Fn, { stats: n, isLoading: a, onRefresh: l }),
    i && /* @__PURE__ */ r("p", { className: "cedros-admin-error-inline", children: i }),
    /* @__PURE__ */ r(
      Ia,
      {
        pageSize: e,
        currentUserId: t,
        onUserClick: (c) => o(c)
      }
    )
  ] });
}
function od({ orgId: e, currentUserId: t, hasPermission: s, role: o }) {
  const [n, a] = S("members"), {
    members: i,
    isLoading: l,
    error: c,
    fetchMembers: u,
    updateMemberRole: m,
    removeMember: h
  } = pa(e), {
    invites: p,
    isLoading: b,
    error: w,
    fetchInvites: g,
    createInvite: C,
    cancelInvite: A,
    resendInvite: k
  } = ga(e);
  O(() => {
    u(), g();
  }, [u, g]);
  const E = s("invite:create"), x = s("invite:cancel"), _ = p.length, f = i.reduce(
    (P, L) => (P[L.role] = (P[L.role] ?? 0) + 1, P),
    {}
  ), y = f.owner ?? 0, v = f.admin ?? 0, N = f.member ?? 0;
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__team", children: [
    /* @__PURE__ */ r(
      Fn,
      {
        stats: [
          { label: "Owners", value: y },
          { label: "Admins", value: v },
          { label: "Members", value: N },
          { label: "Pending Invites", value: _ }
        ]
      }
    ),
    /* @__PURE__ */ d("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${n === "members" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => a("members"),
          "aria-selected": n === "members",
          role: "tab",
          children: "Members"
        }
      ),
      /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${n === "invites" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => a("invites"),
          "aria-selected": n === "invites",
          role: "tab",
          children: [
            "Pending Invites",
            _ > 0 && ` (${_})`
          ]
        }
      ),
      o === "owner" && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${n === "permissions" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => a("permissions"),
          "aria-selected": n === "permissions",
          role: "tab",
          children: "Permissions"
        }
      )
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: [
      n === "members" && /* @__PURE__ */ r(
        wa,
        {
          members: i,
          currentUserId: t,
          isLoading: l,
          error: c?.message,
          canManage: s("member:remove"),
          canChangeRoles: s("member:role_change"),
          onUpdateRole: m,
          onRemove: h
        }
      ),
      n === "invites" && /* @__PURE__ */ d("div", { className: "cedros-dashboard__invites", children: [
        E && /* @__PURE__ */ d("div", { className: "cedros-dashboard__section", children: [
          /* @__PURE__ */ r("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ r("h3", { className: "cedros-dashboard__section-title", children: "Send Invitation" }) }),
          /* @__PURE__ */ r(
            ya,
            {
              onSubmit: C,
              isLoading: b,
              error: w?.message
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(
          ba,
          {
            invites: p,
            isLoading: b,
            error: w?.message,
            canManage: x || E,
            onCancel: x ? A : void 0,
            onResend: E ? k : void 0
          }
        ) })
      ] }),
      n === "permissions" && o === "owner" && /* @__PURE__ */ r(va, { userRole: o })
    ] })
  ] });
}
function ad({ pageSize: e, refreshInterval: t }) {
  const [s, o] = S("");
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ r(xa, { refreshInterval: t }),
    /* @__PURE__ */ d("div", { className: "cedros-dashboard__deposits-list", children: [
      /* @__PURE__ */ r("div", { className: "cedros-dashboard__toolbar", children: /* @__PURE__ */ d("div", { className: "cedros-dashboard__filter", children: [
        /* @__PURE__ */ r("label", { className: "cedros-dashboard__filter-label", htmlFor: "status-filter", children: "Status" }),
        /* @__PURE__ */ d(
          "select",
          {
            id: "status-filter",
            className: "cedros-dashboard__select",
            value: s,
            onChange: (n) => o(n.target.value),
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
        Sa,
        {
          statusFilter: s || void 0,
          pageSize: e,
          refreshInterval: t
        }
      )
    ] })
  ] });
}
function id({ pageSize: e, refreshInterval: t }) {
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ r(_a, { refreshInterval: t }),
    /* @__PURE__ */ r("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ d("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ r(La, { pageSize: e, refreshInterval: t }),
      /* @__PURE__ */ r(Pa, { pageSize: e, refreshInterval: t }),
      /* @__PURE__ */ r(Ta, { pageSize: e, refreshInterval: t })
    ] })
  ] });
}
function cd() {
  return /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(td, {}) });
}
var tt = {}, ir, qs;
function ld() {
  return qs || (qs = 1, ir = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), ir;
}
var cr = {}, Oe = {}, js;
function Ge() {
  if (js) return Oe;
  js = 1;
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
  return Oe.getSymbolSize = function(o) {
    if (!o) throw new Error('"version" cannot be null or undefined');
    if (o < 1 || o > 40) throw new Error('"version" should be in range from 1 to 40');
    return o * 4 + 17;
  }, Oe.getSymbolTotalCodewords = function(o) {
    return t[o];
  }, Oe.getBCHDigit = function(s) {
    let o = 0;
    for (; s !== 0; )
      o++, s >>>= 1;
    return o;
  }, Oe.setToSJISFunction = function(o) {
    if (typeof o != "function")
      throw new Error('"toSJISFunc" is not a valid function.');
    e = o;
  }, Oe.isKanjiModeEnabled = function() {
    return typeof e < "u";
  }, Oe.toSJIS = function(o) {
    return e(o);
  }, Oe;
}
var lr = {}, Vs;
function ss() {
  return Vs || (Vs = 1, (function(e) {
    e.L = { bit: 1 }, e.M = { bit: 0 }, e.Q = { bit: 3 }, e.H = { bit: 2 };
    function t(s) {
      if (typeof s != "string")
        throw new Error("Param is not a string");
      switch (s.toLowerCase()) {
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
          throw new Error("Unknown EC Level: " + s);
      }
    }
    e.isValid = function(o) {
      return o && typeof o.bit < "u" && o.bit >= 0 && o.bit < 4;
    }, e.from = function(o, n) {
      if (e.isValid(o))
        return o;
      try {
        return t(o);
      } catch {
        return n;
      }
    };
  })(lr)), lr;
}
var dr, Hs;
function dd() {
  if (Hs) return dr;
  Hs = 1;
  function e() {
    this.buffer = [], this.length = 0;
  }
  return e.prototype = {
    get: function(t) {
      const s = Math.floor(t / 8);
      return (this.buffer[s] >>> 7 - t % 8 & 1) === 1;
    },
    put: function(t, s) {
      for (let o = 0; o < s; o++)
        this.putBit((t >>> s - o - 1 & 1) === 1);
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(t) {
      const s = Math.floor(this.length / 8);
      this.buffer.length <= s && this.buffer.push(0), t && (this.buffer[s] |= 128 >>> this.length % 8), this.length++;
    }
  }, dr = e, dr;
}
var ur, $s;
function ud() {
  if ($s) return ur;
  $s = 1;
  function e(t) {
    if (!t || t < 1)
      throw new Error("BitMatrix size must be defined and greater than 0");
    this.size = t, this.data = new Uint8Array(t * t), this.reservedBit = new Uint8Array(t * t);
  }
  return e.prototype.set = function(t, s, o, n) {
    const a = t * this.size + s;
    this.data[a] = o, n && (this.reservedBit[a] = !0);
  }, e.prototype.get = function(t, s) {
    return this.data[t * this.size + s];
  }, e.prototype.xor = function(t, s, o) {
    this.data[t * this.size + s] ^= o;
  }, e.prototype.isReserved = function(t, s) {
    return this.reservedBit[t * this.size + s];
  }, ur = e, ur;
}
var hr = {}, Gs;
function hd() {
  return Gs || (Gs = 1, (function(e) {
    const t = Ge().getSymbolSize;
    e.getRowColCoords = function(o) {
      if (o === 1) return [];
      const n = Math.floor(o / 7) + 2, a = t(o), i = a === 145 ? 26 : Math.ceil((a - 13) / (2 * n - 2)) * 2, l = [a - 7];
      for (let c = 1; c < n - 1; c++)
        l[c] = l[c - 1] - i;
      return l.push(6), l.reverse();
    }, e.getPositions = function(o) {
      const n = [], a = e.getRowColCoords(o), i = a.length;
      for (let l = 0; l < i; l++)
        for (let c = 0; c < i; c++)
          l === 0 && c === 0 || // top-left
          l === 0 && c === i - 1 || // bottom-left
          l === i - 1 && c === 0 || n.push([a[l], a[c]]);
      return n;
    };
  })(hr)), hr;
}
var mr = {}, Qs;
function md() {
  if (Qs) return mr;
  Qs = 1;
  const e = Ge().getSymbolSize, t = 7;
  return mr.getPositions = function(o) {
    const n = e(o);
    return [
      // top-left
      [0, 0],
      // top-right
      [n - t, 0],
      // bottom-left
      [0, n - t]
    ];
  }, mr;
}
var fr = {}, Ks;
function fd() {
  return Ks || (Ks = 1, (function(e) {
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
    e.isValid = function(n) {
      return n != null && n !== "" && !isNaN(n) && n >= 0 && n <= 7;
    }, e.from = function(n) {
      return e.isValid(n) ? parseInt(n, 10) : void 0;
    }, e.getPenaltyN1 = function(n) {
      const a = n.size;
      let i = 0, l = 0, c = 0, u = null, m = null;
      for (let h = 0; h < a; h++) {
        l = c = 0, u = m = null;
        for (let p = 0; p < a; p++) {
          let b = n.get(h, p);
          b === u ? l++ : (l >= 5 && (i += t.N1 + (l - 5)), u = b, l = 1), b = n.get(p, h), b === m ? c++ : (c >= 5 && (i += t.N1 + (c - 5)), m = b, c = 1);
        }
        l >= 5 && (i += t.N1 + (l - 5)), c >= 5 && (i += t.N1 + (c - 5));
      }
      return i;
    }, e.getPenaltyN2 = function(n) {
      const a = n.size;
      let i = 0;
      for (let l = 0; l < a - 1; l++)
        for (let c = 0; c < a - 1; c++) {
          const u = n.get(l, c) + n.get(l, c + 1) + n.get(l + 1, c) + n.get(l + 1, c + 1);
          (u === 4 || u === 0) && i++;
        }
      return i * t.N2;
    }, e.getPenaltyN3 = function(n) {
      const a = n.size;
      let i = 0, l = 0, c = 0;
      for (let u = 0; u < a; u++) {
        l = c = 0;
        for (let m = 0; m < a; m++)
          l = l << 1 & 2047 | n.get(u, m), m >= 10 && (l === 1488 || l === 93) && i++, c = c << 1 & 2047 | n.get(m, u), m >= 10 && (c === 1488 || c === 93) && i++;
      }
      return i * t.N3;
    }, e.getPenaltyN4 = function(n) {
      let a = 0;
      const i = n.data.length;
      for (let c = 0; c < i; c++) a += n.data[c];
      return Math.abs(Math.ceil(a * 100 / i / 5) - 10) * t.N4;
    };
    function s(o, n, a) {
      switch (o) {
        case e.Patterns.PATTERN000:
          return (n + a) % 2 === 0;
        case e.Patterns.PATTERN001:
          return n % 2 === 0;
        case e.Patterns.PATTERN010:
          return a % 3 === 0;
        case e.Patterns.PATTERN011:
          return (n + a) % 3 === 0;
        case e.Patterns.PATTERN100:
          return (Math.floor(n / 2) + Math.floor(a / 3)) % 2 === 0;
        case e.Patterns.PATTERN101:
          return n * a % 2 + n * a % 3 === 0;
        case e.Patterns.PATTERN110:
          return (n * a % 2 + n * a % 3) % 2 === 0;
        case e.Patterns.PATTERN111:
          return (n * a % 3 + (n + a) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + o);
      }
    }
    e.applyMask = function(n, a) {
      const i = a.size;
      for (let l = 0; l < i; l++)
        for (let c = 0; c < i; c++)
          a.isReserved(c, l) || a.xor(c, l, s(n, c, l));
    }, e.getBestMask = function(n, a) {
      const i = Object.keys(e.Patterns).length;
      let l = 0, c = 1 / 0;
      for (let u = 0; u < i; u++) {
        a(u), e.applyMask(u, n);
        const m = e.getPenaltyN1(n) + e.getPenaltyN2(n) + e.getPenaltyN3(n) + e.getPenaltyN4(n);
        e.applyMask(u, n), m < c && (c = m, l = u);
      }
      return l;
    };
  })(fr)), fr;
}
var At = {}, Ys;
function Co() {
  if (Ys) return At;
  Ys = 1;
  const e = ss(), t = [
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
  ], s = [
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
  return At.getBlocksCount = function(n, a) {
    switch (a) {
      case e.L:
        return t[(n - 1) * 4 + 0];
      case e.M:
        return t[(n - 1) * 4 + 1];
      case e.Q:
        return t[(n - 1) * 4 + 2];
      case e.H:
        return t[(n - 1) * 4 + 3];
      default:
        return;
    }
  }, At.getTotalCodewordsCount = function(n, a) {
    switch (a) {
      case e.L:
        return s[(n - 1) * 4 + 0];
      case e.M:
        return s[(n - 1) * 4 + 1];
      case e.Q:
        return s[(n - 1) * 4 + 2];
      case e.H:
        return s[(n - 1) * 4 + 3];
      default:
        return;
    }
  }, At;
}
var pr = {}, ht = {}, Zs;
function pd() {
  if (Zs) return ht;
  Zs = 1;
  const e = new Uint8Array(512), t = new Uint8Array(256);
  return (function() {
    let o = 1;
    for (let n = 0; n < 255; n++)
      e[n] = o, t[o] = n, o <<= 1, o & 256 && (o ^= 285);
    for (let n = 255; n < 512; n++)
      e[n] = e[n - 255];
  })(), ht.log = function(o) {
    if (o < 1) throw new Error("log(" + o + ")");
    return t[o];
  }, ht.exp = function(o) {
    return e[o];
  }, ht.mul = function(o, n) {
    return o === 0 || n === 0 ? 0 : e[t[o] + t[n]];
  }, ht;
}
var Xs;
function gd() {
  return Xs || (Xs = 1, (function(e) {
    const t = pd();
    e.mul = function(o, n) {
      const a = new Uint8Array(o.length + n.length - 1);
      for (let i = 0; i < o.length; i++)
        for (let l = 0; l < n.length; l++)
          a[i + l] ^= t.mul(o[i], n[l]);
      return a;
    }, e.mod = function(o, n) {
      let a = new Uint8Array(o);
      for (; a.length - n.length >= 0; ) {
        const i = a[0];
        for (let c = 0; c < n.length; c++)
          a[c] ^= t.mul(n[c], i);
        let l = 0;
        for (; l < a.length && a[l] === 0; ) l++;
        a = a.slice(l);
      }
      return a;
    }, e.generateECPolynomial = function(o) {
      let n = new Uint8Array([1]);
      for (let a = 0; a < o; a++)
        n = e.mul(n, new Uint8Array([1, t.exp(a)]));
      return n;
    };
  })(pr)), pr;
}
var gr, Js;
function wd() {
  if (Js) return gr;
  Js = 1;
  const e = gd();
  function t(s) {
    this.genPoly = void 0, this.degree = s, this.degree && this.initialize(this.degree);
  }
  return t.prototype.initialize = function(o) {
    this.degree = o, this.genPoly = e.generateECPolynomial(this.degree);
  }, t.prototype.encode = function(o) {
    if (!this.genPoly)
      throw new Error("Encoder not initialized");
    const n = new Uint8Array(o.length + this.degree);
    n.set(o);
    const a = e.mod(n, this.genPoly), i = this.degree - a.length;
    if (i > 0) {
      const l = new Uint8Array(this.degree);
      return l.set(a, i), l;
    }
    return a;
  }, gr = t, gr;
}
var wr = {}, yr = {}, br = {}, en;
function Eo() {
  return en || (en = 1, br.isValid = function(t) {
    return !isNaN(t) && t >= 1 && t <= 40;
  }), br;
}
var _e = {}, tn;
function xo() {
  if (tn) return _e;
  tn = 1;
  const e = "[0-9]+", t = "[A-Z $%*+\\-./:]+";
  let s = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  s = s.replace(/u/g, "\\u");
  const o = "(?:(?![A-Z0-9 $%*+\\-./:]|" + s + `)(?:.|[\r
]))+`;
  _e.KANJI = new RegExp(s, "g"), _e.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), _e.BYTE = new RegExp(o, "g"), _e.NUMERIC = new RegExp(e, "g"), _e.ALPHANUMERIC = new RegExp(t, "g");
  const n = new RegExp("^" + s + "$"), a = new RegExp("^" + e + "$"), i = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return _e.testKanji = function(c) {
    return n.test(c);
  }, _e.testNumeric = function(c) {
    return a.test(c);
  }, _e.testAlphanumeric = function(c) {
    return i.test(c);
  }, _e;
}
var rn;
function Qe() {
  return rn || (rn = 1, (function(e) {
    const t = Eo(), s = xo();
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
    }, e.getCharCountIndicator = function(a, i) {
      if (!a.ccBits) throw new Error("Invalid mode: " + a);
      if (!t.isValid(i))
        throw new Error("Invalid version: " + i);
      return i >= 1 && i < 10 ? a.ccBits[0] : i < 27 ? a.ccBits[1] : a.ccBits[2];
    }, e.getBestModeForData = function(a) {
      return s.testNumeric(a) ? e.NUMERIC : s.testAlphanumeric(a) ? e.ALPHANUMERIC : s.testKanji(a) ? e.KANJI : e.BYTE;
    }, e.toString = function(a) {
      if (a && a.id) return a.id;
      throw new Error("Invalid mode");
    }, e.isValid = function(a) {
      return a && a.bit && a.ccBits;
    };
    function o(n) {
      if (typeof n != "string")
        throw new Error("Param is not a string");
      switch (n.toLowerCase()) {
        case "numeric":
          return e.NUMERIC;
        case "alphanumeric":
          return e.ALPHANUMERIC;
        case "kanji":
          return e.KANJI;
        case "byte":
          return e.BYTE;
        default:
          throw new Error("Unknown mode: " + n);
      }
    }
    e.from = function(a, i) {
      if (e.isValid(a))
        return a;
      try {
        return o(a);
      } catch {
        return i;
      }
    };
  })(yr)), yr;
}
var sn;
function yd() {
  return sn || (sn = 1, (function(e) {
    const t = Ge(), s = Co(), o = ss(), n = Qe(), a = Eo(), i = 7973, l = t.getBCHDigit(i);
    function c(p, b, w) {
      for (let g = 1; g <= 40; g++)
        if (b <= e.getCapacity(g, w, p))
          return g;
    }
    function u(p, b) {
      return n.getCharCountIndicator(p, b) + 4;
    }
    function m(p, b) {
      let w = 0;
      return p.forEach(function(g) {
        const C = u(g.mode, b);
        w += C + g.getBitsLength();
      }), w;
    }
    function h(p, b) {
      for (let w = 1; w <= 40; w++)
        if (m(p, w) <= e.getCapacity(w, b, n.MIXED))
          return w;
    }
    e.from = function(b, w) {
      return a.isValid(b) ? parseInt(b, 10) : w;
    }, e.getCapacity = function(b, w, g) {
      if (!a.isValid(b))
        throw new Error("Invalid QR Code version");
      typeof g > "u" && (g = n.BYTE);
      const C = t.getSymbolTotalCodewords(b), A = s.getTotalCodewordsCount(b, w), k = (C - A) * 8;
      if (g === n.MIXED) return k;
      const E = k - u(g, b);
      switch (g) {
        case n.NUMERIC:
          return Math.floor(E / 10 * 3);
        case n.ALPHANUMERIC:
          return Math.floor(E / 11 * 2);
        case n.KANJI:
          return Math.floor(E / 13);
        case n.BYTE:
        default:
          return Math.floor(E / 8);
      }
    }, e.getBestVersionForData = function(b, w) {
      let g;
      const C = o.from(w, o.M);
      if (Array.isArray(b)) {
        if (b.length > 1)
          return h(b, C);
        if (b.length === 0)
          return 1;
        g = b[0];
      } else
        g = b;
      return c(g.mode, g.getLength(), C);
    }, e.getEncodedBits = function(b) {
      if (!a.isValid(b) || b < 7)
        throw new Error("Invalid QR Code version");
      let w = b << 12;
      for (; t.getBCHDigit(w) - l >= 0; )
        w ^= i << t.getBCHDigit(w) - l;
      return b << 12 | w;
    };
  })(wr)), wr;
}
var vr = {}, nn;
function bd() {
  if (nn) return vr;
  nn = 1;
  const e = Ge(), t = 1335, s = 21522, o = e.getBCHDigit(t);
  return vr.getEncodedBits = function(a, i) {
    const l = a.bit << 3 | i;
    let c = l << 10;
    for (; e.getBCHDigit(c) - o >= 0; )
      c ^= t << e.getBCHDigit(c) - o;
    return (l << 10 | c) ^ s;
  }, vr;
}
var Ar = {}, Nr, on;
function vd() {
  if (on) return Nr;
  on = 1;
  const e = Qe();
  function t(s) {
    this.mode = e.NUMERIC, this.data = s.toString();
  }
  return t.getBitsLength = function(o) {
    return 10 * Math.floor(o / 3) + (o % 3 ? o % 3 * 3 + 1 : 0);
  }, t.prototype.getLength = function() {
    return this.data.length;
  }, t.prototype.getBitsLength = function() {
    return t.getBitsLength(this.data.length);
  }, t.prototype.write = function(o) {
    let n, a, i;
    for (n = 0; n + 3 <= this.data.length; n += 3)
      a = this.data.substr(n, 3), i = parseInt(a, 10), o.put(i, 10);
    const l = this.data.length - n;
    l > 0 && (a = this.data.substr(n), i = parseInt(a, 10), o.put(i, l * 3 + 1));
  }, Nr = t, Nr;
}
var kr, an;
function Ad() {
  if (an) return kr;
  an = 1;
  const e = Qe(), t = [
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
  function s(o) {
    this.mode = e.ALPHANUMERIC, this.data = o;
  }
  return s.getBitsLength = function(n) {
    return 11 * Math.floor(n / 2) + 6 * (n % 2);
  }, s.prototype.getLength = function() {
    return this.data.length;
  }, s.prototype.getBitsLength = function() {
    return s.getBitsLength(this.data.length);
  }, s.prototype.write = function(n) {
    let a;
    for (a = 0; a + 2 <= this.data.length; a += 2) {
      let i = t.indexOf(this.data[a]) * 45;
      i += t.indexOf(this.data[a + 1]), n.put(i, 11);
    }
    this.data.length % 2 && n.put(t.indexOf(this.data[a]), 6);
  }, kr = s, kr;
}
var Cr, cn;
function Nd() {
  if (cn) return Cr;
  cn = 1;
  const e = Qe();
  function t(s) {
    this.mode = e.BYTE, typeof s == "string" ? this.data = new TextEncoder().encode(s) : this.data = new Uint8Array(s);
  }
  return t.getBitsLength = function(o) {
    return o * 8;
  }, t.prototype.getLength = function() {
    return this.data.length;
  }, t.prototype.getBitsLength = function() {
    return t.getBitsLength(this.data.length);
  }, t.prototype.write = function(s) {
    for (let o = 0, n = this.data.length; o < n; o++)
      s.put(this.data[o], 8);
  }, Cr = t, Cr;
}
var Er, ln;
function kd() {
  if (ln) return Er;
  ln = 1;
  const e = Qe(), t = Ge();
  function s(o) {
    this.mode = e.KANJI, this.data = o;
  }
  return s.getBitsLength = function(n) {
    return n * 13;
  }, s.prototype.getLength = function() {
    return this.data.length;
  }, s.prototype.getBitsLength = function() {
    return s.getBitsLength(this.data.length);
  }, s.prototype.write = function(o) {
    let n;
    for (n = 0; n < this.data.length; n++) {
      let a = t.toSJIS(this.data[n]);
      if (a >= 33088 && a <= 40956)
        a -= 33088;
      else if (a >= 57408 && a <= 60351)
        a -= 49472;
      else
        throw new Error(
          "Invalid SJIS character: " + this.data[n] + `
Make sure your charset is UTF-8`
        );
      a = (a >>> 8 & 255) * 192 + (a & 255), o.put(a, 13);
    }
  }, Er = s, Er;
}
var xr = { exports: {} }, dn;
function Cd() {
  return dn || (dn = 1, (function(e) {
    var t = {
      single_source_shortest_paths: function(s, o, n) {
        var a = {}, i = {};
        i[o] = 0;
        var l = t.PriorityQueue.make();
        l.push(o, 0);
        for (var c, u, m, h, p, b, w, g, C; !l.empty(); ) {
          c = l.pop(), u = c.value, h = c.cost, p = s[u] || {};
          for (m in p)
            p.hasOwnProperty(m) && (b = p[m], w = h + b, g = i[m], C = typeof i[m] > "u", (C || g > w) && (i[m] = w, l.push(m, w), a[m] = u));
        }
        if (typeof n < "u" && typeof i[n] > "u") {
          var A = ["Could not find a path from ", o, " to ", n, "."].join("");
          throw new Error(A);
        }
        return a;
      },
      extract_shortest_path_from_predecessor_list: function(s, o) {
        for (var n = [], a = o; a; )
          n.push(a), s[a], a = s[a];
        return n.reverse(), n;
      },
      find_path: function(s, o, n) {
        var a = t.single_source_shortest_paths(s, o, n);
        return t.extract_shortest_path_from_predecessor_list(
          a,
          n
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(s) {
          var o = t.PriorityQueue, n = {}, a;
          s = s || {};
          for (a in o)
            o.hasOwnProperty(a) && (n[a] = o[a]);
          return n.queue = [], n.sorter = s.sorter || o.default_sorter, n;
        },
        default_sorter: function(s, o) {
          return s.cost - o.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(s, o) {
          var n = { value: s, cost: o };
          this.queue.push(n), this.queue.sort(this.sorter);
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
  })(xr)), xr.exports;
}
var un;
function Ed() {
  return un || (un = 1, (function(e) {
    const t = Qe(), s = vd(), o = Ad(), n = Nd(), a = kd(), i = xo(), l = Ge(), c = Cd();
    function u(A) {
      return unescape(encodeURIComponent(A)).length;
    }
    function m(A, k, E) {
      const x = [];
      let _;
      for (; (_ = A.exec(E)) !== null; )
        x.push({
          data: _[0],
          index: _.index,
          mode: k,
          length: _[0].length
        });
      return x;
    }
    function h(A) {
      const k = m(i.NUMERIC, t.NUMERIC, A), E = m(i.ALPHANUMERIC, t.ALPHANUMERIC, A);
      let x, _;
      return l.isKanjiModeEnabled() ? (x = m(i.BYTE, t.BYTE, A), _ = m(i.KANJI, t.KANJI, A)) : (x = m(i.BYTE_KANJI, t.BYTE, A), _ = []), k.concat(E, x, _).sort(function(y, v) {
        return y.index - v.index;
      }).map(function(y) {
        return {
          data: y.data,
          mode: y.mode,
          length: y.length
        };
      });
    }
    function p(A, k) {
      switch (k) {
        case t.NUMERIC:
          return s.getBitsLength(A);
        case t.ALPHANUMERIC:
          return o.getBitsLength(A);
        case t.KANJI:
          return a.getBitsLength(A);
        case t.BYTE:
          return n.getBitsLength(A);
      }
    }
    function b(A) {
      return A.reduce(function(k, E) {
        const x = k.length - 1 >= 0 ? k[k.length - 1] : null;
        return x && x.mode === E.mode ? (k[k.length - 1].data += E.data, k) : (k.push(E), k);
      }, []);
    }
    function w(A) {
      const k = [];
      for (let E = 0; E < A.length; E++) {
        const x = A[E];
        switch (x.mode) {
          case t.NUMERIC:
            k.push([
              x,
              { data: x.data, mode: t.ALPHANUMERIC, length: x.length },
              { data: x.data, mode: t.BYTE, length: x.length }
            ]);
            break;
          case t.ALPHANUMERIC:
            k.push([
              x,
              { data: x.data, mode: t.BYTE, length: x.length }
            ]);
            break;
          case t.KANJI:
            k.push([
              x,
              { data: x.data, mode: t.BYTE, length: u(x.data) }
            ]);
            break;
          case t.BYTE:
            k.push([
              { data: x.data, mode: t.BYTE, length: u(x.data) }
            ]);
        }
      }
      return k;
    }
    function g(A, k) {
      const E = {}, x = { start: {} };
      let _ = ["start"];
      for (let f = 0; f < A.length; f++) {
        const y = A[f], v = [];
        for (let N = 0; N < y.length; N++) {
          const P = y[N], L = "" + f + N;
          v.push(L), E[L] = { node: P, lastCount: 0 }, x[L] = {};
          for (let R = 0; R < _.length; R++) {
            const T = _[R];
            E[T] && E[T].node.mode === P.mode ? (x[T][L] = p(E[T].lastCount + P.length, P.mode) - p(E[T].lastCount, P.mode), E[T].lastCount += P.length) : (E[T] && (E[T].lastCount = P.length), x[T][L] = p(P.length, P.mode) + 4 + t.getCharCountIndicator(P.mode, k));
          }
        }
        _ = v;
      }
      for (let f = 0; f < _.length; f++)
        x[_[f]].end = 0;
      return { map: x, table: E };
    }
    function C(A, k) {
      let E;
      const x = t.getBestModeForData(A);
      if (E = t.from(k, x), E !== t.BYTE && E.bit < x.bit)
        throw new Error('"' + A + '" cannot be encoded with mode ' + t.toString(E) + `.
 Suggested mode is: ` + t.toString(x));
      switch (E === t.KANJI && !l.isKanjiModeEnabled() && (E = t.BYTE), E) {
        case t.NUMERIC:
          return new s(A);
        case t.ALPHANUMERIC:
          return new o(A);
        case t.KANJI:
          return new a(A);
        case t.BYTE:
          return new n(A);
      }
    }
    e.fromArray = function(k) {
      return k.reduce(function(E, x) {
        return typeof x == "string" ? E.push(C(x, null)) : x.data && E.push(C(x.data, x.mode)), E;
      }, []);
    }, e.fromString = function(k, E) {
      const x = h(k, l.isKanjiModeEnabled()), _ = w(x), f = g(_, E), y = c.find_path(f.map, "start", "end"), v = [];
      for (let N = 1; N < y.length - 1; N++)
        v.push(f.table[y[N]].node);
      return e.fromArray(b(v));
    }, e.rawSplit = function(k) {
      return e.fromArray(
        h(k, l.isKanjiModeEnabled())
      );
    };
  })(Ar)), Ar;
}
var hn;
function xd() {
  if (hn) return cr;
  hn = 1;
  const e = Ge(), t = ss(), s = dd(), o = ud(), n = hd(), a = md(), i = fd(), l = Co(), c = wd(), u = yd(), m = bd(), h = Qe(), p = Ed();
  function b(f, y) {
    const v = f.size, N = a.getPositions(y);
    for (let P = 0; P < N.length; P++) {
      const L = N[P][0], R = N[P][1];
      for (let T = -1; T <= 7; T++)
        if (!(L + T <= -1 || v <= L + T))
          for (let I = -1; I <= 7; I++)
            R + I <= -1 || v <= R + I || (T >= 0 && T <= 6 && (I === 0 || I === 6) || I >= 0 && I <= 6 && (T === 0 || T === 6) || T >= 2 && T <= 4 && I >= 2 && I <= 4 ? f.set(L + T, R + I, !0, !0) : f.set(L + T, R + I, !1, !0));
    }
  }
  function w(f) {
    const y = f.size;
    for (let v = 8; v < y - 8; v++) {
      const N = v % 2 === 0;
      f.set(v, 6, N, !0), f.set(6, v, N, !0);
    }
  }
  function g(f, y) {
    const v = n.getPositions(y);
    for (let N = 0; N < v.length; N++) {
      const P = v[N][0], L = v[N][1];
      for (let R = -2; R <= 2; R++)
        for (let T = -2; T <= 2; T++)
          R === -2 || R === 2 || T === -2 || T === 2 || R === 0 && T === 0 ? f.set(P + R, L + T, !0, !0) : f.set(P + R, L + T, !1, !0);
    }
  }
  function C(f, y) {
    const v = f.size, N = u.getEncodedBits(y);
    let P, L, R;
    for (let T = 0; T < 18; T++)
      P = Math.floor(T / 3), L = T % 3 + v - 8 - 3, R = (N >> T & 1) === 1, f.set(P, L, R, !0), f.set(L, P, R, !0);
  }
  function A(f, y, v) {
    const N = f.size, P = m.getEncodedBits(y, v);
    let L, R;
    for (L = 0; L < 15; L++)
      R = (P >> L & 1) === 1, L < 6 ? f.set(L, 8, R, !0) : L < 8 ? f.set(L + 1, 8, R, !0) : f.set(N - 15 + L, 8, R, !0), L < 8 ? f.set(8, N - L - 1, R, !0) : L < 9 ? f.set(8, 15 - L - 1 + 1, R, !0) : f.set(8, 15 - L - 1, R, !0);
    f.set(N - 8, 8, 1, !0);
  }
  function k(f, y) {
    const v = f.size;
    let N = -1, P = v - 1, L = 7, R = 0;
    for (let T = v - 1; T > 0; T -= 2)
      for (T === 6 && T--; ; ) {
        for (let I = 0; I < 2; I++)
          if (!f.isReserved(P, T - I)) {
            let M = !1;
            R < y.length && (M = (y[R] >>> L & 1) === 1), f.set(P, T - I, M), L--, L === -1 && (R++, L = 7);
          }
        if (P += N, P < 0 || v <= P) {
          P -= N, N = -N;
          break;
        }
      }
  }
  function E(f, y, v) {
    const N = new s();
    v.forEach(function(I) {
      N.put(I.mode.bit, 4), N.put(I.getLength(), h.getCharCountIndicator(I.mode, f)), I.write(N);
    });
    const P = e.getSymbolTotalCodewords(f), L = l.getTotalCodewordsCount(f, y), R = (P - L) * 8;
    for (N.getLengthInBits() + 4 <= R && N.put(0, 4); N.getLengthInBits() % 8 !== 0; )
      N.putBit(0);
    const T = (R - N.getLengthInBits()) / 8;
    for (let I = 0; I < T; I++)
      N.put(I % 2 ? 17 : 236, 8);
    return x(N, f, y);
  }
  function x(f, y, v) {
    const N = e.getSymbolTotalCodewords(y), P = l.getTotalCodewordsCount(y, v), L = N - P, R = l.getBlocksCount(y, v), T = N % R, I = R - T, M = Math.floor(N / R), U = Math.floor(L / R), W = U + 1, j = M - U, H = new c(j);
    let D = 0;
    const F = new Array(R), K = new Array(R);
    let re = 0;
    const ce = new Uint8Array(f.buffer);
    for (let se = 0; se < R; se++) {
      const fe = se < I ? U : W;
      F[se] = ce.slice(D, D + fe), K[se] = H.encode(F[se]), D += fe, re = Math.max(re, fe);
    }
    const Ae = new Uint8Array(N);
    let we = 0, Y, $;
    for (Y = 0; Y < re; Y++)
      for ($ = 0; $ < R; $++)
        Y < F[$].length && (Ae[we++] = F[$][Y]);
    for (Y = 0; Y < j; Y++)
      for ($ = 0; $ < R; $++)
        Ae[we++] = K[$][Y];
    return Ae;
  }
  function _(f, y, v, N) {
    let P;
    if (Array.isArray(f))
      P = p.fromArray(f);
    else if (typeof f == "string") {
      let M = y;
      if (!M) {
        const U = p.rawSplit(f);
        M = u.getBestVersionForData(U, v);
      }
      P = p.fromString(f, M || 40);
    } else
      throw new Error("Invalid data");
    const L = u.getBestVersionForData(P, v);
    if (!L)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!y)
      y = L;
    else if (y < L)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + L + `.
`
      );
    const R = E(y, v, P), T = e.getSymbolSize(y), I = new o(T);
    return b(I, y), w(I), g(I, y), A(I, v, 0), y >= 7 && C(I, y), k(I, R), isNaN(N) && (N = i.getBestMask(
      I,
      A.bind(null, I, v)
    )), i.applyMask(N, I), A(I, v, N), {
      modules: I,
      version: y,
      errorCorrectionLevel: v,
      maskPattern: N,
      segments: P
    };
  }
  return cr.create = function(y, v) {
    if (typeof y > "u" || y === "")
      throw new Error("No input text");
    let N = t.M, P, L;
    return typeof v < "u" && (N = t.from(v.errorCorrectionLevel, t.M), P = u.from(v.version), L = i.from(v.maskPattern), v.toSJISFunc && e.setToSJISFunction(v.toSJISFunc)), _(y, P, N, L);
  }, cr;
}
var Sr = {}, _r = {}, mn;
function So() {
  return mn || (mn = 1, (function(e) {
    function t(s) {
      if (typeof s == "number" && (s = s.toString()), typeof s != "string")
        throw new Error("Color should be defined as hex string");
      let o = s.slice().replace("#", "").split("");
      if (o.length < 3 || o.length === 5 || o.length > 8)
        throw new Error("Invalid hex color: " + s);
      (o.length === 3 || o.length === 4) && (o = Array.prototype.concat.apply([], o.map(function(a) {
        return [a, a];
      }))), o.length === 6 && o.push("F", "F");
      const n = parseInt(o.join(""), 16);
      return {
        r: n >> 24 & 255,
        g: n >> 16 & 255,
        b: n >> 8 & 255,
        a: n & 255,
        hex: "#" + o.slice(0, 6).join("")
      };
    }
    e.getOptions = function(o) {
      o || (o = {}), o.color || (o.color = {});
      const n = typeof o.margin > "u" || o.margin === null || o.margin < 0 ? 4 : o.margin, a = o.width && o.width >= 21 ? o.width : void 0, i = o.scale || 4;
      return {
        width: a,
        scale: a ? 4 : i,
        margin: n,
        color: {
          dark: t(o.color.dark || "#000000ff"),
          light: t(o.color.light || "#ffffffff")
        },
        type: o.type,
        rendererOpts: o.rendererOpts || {}
      };
    }, e.getScale = function(o, n) {
      return n.width && n.width >= o + n.margin * 2 ? n.width / (o + n.margin * 2) : n.scale;
    }, e.getImageWidth = function(o, n) {
      const a = e.getScale(o, n);
      return Math.floor((o + n.margin * 2) * a);
    }, e.qrToImageData = function(o, n, a) {
      const i = n.modules.size, l = n.modules.data, c = e.getScale(i, a), u = Math.floor((i + a.margin * 2) * c), m = a.margin * c, h = [a.color.light, a.color.dark];
      for (let p = 0; p < u; p++)
        for (let b = 0; b < u; b++) {
          let w = (p * u + b) * 4, g = a.color.light;
          if (p >= m && b >= m && p < u - m && b < u - m) {
            const C = Math.floor((p - m) / c), A = Math.floor((b - m) / c);
            g = h[l[C * i + A] ? 1 : 0];
          }
          o[w++] = g.r, o[w++] = g.g, o[w++] = g.b, o[w] = g.a;
        }
    };
  })(_r)), _r;
}
var fn;
function Sd() {
  return fn || (fn = 1, (function(e) {
    const t = So();
    function s(n, a, i) {
      n.clearRect(0, 0, a.width, a.height), a.style || (a.style = {}), a.height = i, a.width = i, a.style.height = i + "px", a.style.width = i + "px";
    }
    function o() {
      try {
        return document.createElement("canvas");
      } catch {
        throw new Error("You need to specify a canvas element");
      }
    }
    e.render = function(a, i, l) {
      let c = l, u = i;
      typeof c > "u" && (!i || !i.getContext) && (c = i, i = void 0), i || (u = o()), c = t.getOptions(c);
      const m = t.getImageWidth(a.modules.size, c), h = u.getContext("2d"), p = h.createImageData(m, m);
      return t.qrToImageData(p.data, a, c), s(h, u, m), h.putImageData(p, 0, 0), u;
    }, e.renderToDataURL = function(a, i, l) {
      let c = l;
      typeof c > "u" && (!i || !i.getContext) && (c = i, i = void 0), c || (c = {});
      const u = e.render(a, i, c), m = c.type || "image/png", h = c.rendererOpts || {};
      return u.toDataURL(m, h.quality);
    };
  })(Sr)), Sr;
}
var Lr = {}, pn;
function _d() {
  if (pn) return Lr;
  pn = 1;
  const e = So();
  function t(n, a) {
    const i = n.a / 255, l = a + '="' + n.hex + '"';
    return i < 1 ? l + " " + a + '-opacity="' + i.toFixed(2).slice(1) + '"' : l;
  }
  function s(n, a, i) {
    let l = n + a;
    return typeof i < "u" && (l += " " + i), l;
  }
  function o(n, a, i) {
    let l = "", c = 0, u = !1, m = 0;
    for (let h = 0; h < n.length; h++) {
      const p = Math.floor(h % a), b = Math.floor(h / a);
      !p && !u && (u = !0), n[h] ? (m++, h > 0 && p > 0 && n[h - 1] || (l += u ? s("M", p + i, 0.5 + b + i) : s("m", c, 0), c = 0, u = !1), p + 1 < a && n[h + 1] || (l += s("h", m), m = 0)) : c++;
    }
    return l;
  }
  return Lr.render = function(a, i, l) {
    const c = e.getOptions(i), u = a.modules.size, m = a.modules.data, h = u + c.margin * 2, p = c.color.light.a ? "<path " + t(c.color.light, "fill") + ' d="M0 0h' + h + "v" + h + 'H0z"/>' : "", b = "<path " + t(c.color.dark, "stroke") + ' d="' + o(m, u, c.margin) + '"/>', w = 'viewBox="0 0 ' + h + " " + h + '"', C = '<svg xmlns="http://www.w3.org/2000/svg" ' + (c.width ? 'width="' + c.width + '" height="' + c.width + '" ' : "") + w + ' shape-rendering="crispEdges">' + p + b + `</svg>
`;
    return typeof l == "function" && l(null, C), C;
  }, Lr;
}
var gn;
function Ld() {
  if (gn) return tt;
  gn = 1;
  const e = ld(), t = xd(), s = Sd(), o = _d();
  function n(a, i, l, c, u) {
    const m = [].slice.call(arguments, 1), h = m.length, p = typeof m[h - 1] == "function";
    if (!p && !e())
      throw new Error("Callback required as last argument");
    if (p) {
      if (h < 2)
        throw new Error("Too few arguments provided");
      h === 2 ? (u = l, l = i, i = c = void 0) : h === 3 && (i.getContext && typeof u > "u" ? (u = c, c = void 0) : (u = c, c = l, l = i, i = void 0));
    } else {
      if (h < 1)
        throw new Error("Too few arguments provided");
      return h === 1 ? (l = i, i = c = void 0) : h === 2 && !i.getContext && (c = l, l = i, i = void 0), new Promise(function(b, w) {
        try {
          const g = t.create(l, c);
          b(a(g, i, c));
        } catch (g) {
          w(g);
        }
      });
    }
    try {
      const b = t.create(l, c);
      u(null, a(b, i, c));
    } catch (b) {
      u(b);
    }
  }
  return tt.create = t.create, tt.toCanvas = n.bind(null, s.render), tt.toDataURL = n.bind(null, s.renderToDataURL), tt.toString = n.bind(null, function(a, i, l) {
    return o.render(a, l);
  }), tt;
}
var Pd = Ld();
const Td = /* @__PURE__ */ Wn(Pd);
function Bd({ value: e, size: t = 200, alt: s = "QR code", className: o = "" }) {
  const n = J(null), [a, i] = S(null);
  return O(() => {
    !n.current || !e || Td.toCanvas(n.current, e, {
      width: t,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
      errorCorrectionLevel: "M"
    }).then(() => {
      i(null);
    }).catch((l) => {
      i(l instanceof Error ? l.message : "Failed to generate QR code");
    });
  }, [e, t]), a ? /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-qr-error ${o}`,
      style: { width: t, height: t },
      role: "img",
      "aria-label": s,
      children: /* @__PURE__ */ r("p", { children: "Failed to generate QR code" })
    }
  ) : /* @__PURE__ */ r(
    "canvas",
    {
      ref: n,
      className: `cedros-totp-qr-image ${o}`,
      role: "img",
      "aria-label": s,
      style: { borderRadius: "0.5rem" }
    }
  );
}
function _o() {
  const { config: e, _internal: t } = ee(), [s, o] = S(null), [n, a] = S("idle"), [i, l] = S(null), [c, u] = S(!1), [m, h] = S(null), p = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t]
  ), b = B(async () => {
    u(!0), h(null);
    try {
      const x = await p.get("/mfa/status");
      return o(x), x;
    } catch (x) {
      const _ = z(x, "Unable to load two-factor authentication status. Please try again.");
      throw h(_), _;
    } finally {
      u(!1);
    }
  }, [p]), w = B(async () => {
    u(!0), h(null), a("loading");
    try {
      const x = await p.post("/mfa/setup", {});
      return l(x), a("setup"), x;
    } catch (x) {
      const _ = z(x, "Unable to start two-factor setup. Please try again.");
      throw h(_), a("error"), _;
    } finally {
      u(!1);
    }
  }, [p]), g = B(
    async (x) => {
      if (!/^\d{6}$/.test(x)) {
        const _ = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw h(_), _;
      }
      u(!0), h(null), a("verifying");
      try {
        await p.post("/mfa/enable", { code: x }), a("success");
        try {
          const _ = await p.get("/mfa/status");
          o(_);
        } catch {
          o({ enabled: !0, recoveryCodesRemaining: 0 });
        }
      } catch (_) {
        const f = z(_, "Incorrect verification code. Please check and try again.");
        throw h(f), a("error"), f;
      } finally {
        u(!1);
      }
    },
    [p]
  ), C = B(
    async (x) => {
      if (!x) {
        const _ = {
          code: "VALIDATION_ERROR",
          message: "Please enter your password"
        };
        throw h(_), _;
      }
      u(!0), h(null);
      try {
        await p.post("/mfa/disable", { password: x }), o({ enabled: !1, recoveryCodesRemaining: 0 }), l(null), a("idle");
      } catch (_) {
        const f = z(_, "Unable to disable two-factor authentication. Please try again.");
        throw h(f), f;
      } finally {
        u(!1);
      }
    },
    [p]
  ), A = B(
    async (x) => {
      if (!/^\d{6}$/.test(x)) {
        const _ = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw h(_), _;
      }
      u(!0), h(null);
      try {
        return await p.post(
          "/mfa/recovery-codes/regenerate",
          { code: x }
        );
      } catch (_) {
        const f = z(_, "Unable to regenerate recovery codes. Please try again.");
        throw h(f), f;
      } finally {
        u(!1);
      }
    },
    [p]
  ), k = B(() => h(null), []), E = B(() => {
    h(null), l(null), a("idle"), u(!1);
  }, []);
  return {
    status: s,
    setupState: n,
    setupData: i,
    isLoading: c,
    error: m,
    getStatus: b,
    beginSetup: w,
    enableTotp: g,
    disableTotp: C,
    regenerateBackupCodes: A,
    clearError: k,
    reset: E
  };
}
function Lo({ onSuccess: e, onCancel: t, className: s = "" }) {
  const { setupState: o, setupData: n, isLoading: a, error: i, beginSetup: l, enableTotp: c, clearError: u, reset: m } = _o(), [h, p] = S("qr"), [b, w] = S(""), [g, C] = S(!1), [A, k] = S(!1), E = J(null);
  O(() => {
    o === "idle" && l().catch(() => {
    });
  }, [o, l]), O(() => {
    o === "success" && e?.();
  }, [o, e]);
  const x = async () => {
    n?.secret && (await navigator.clipboard.writeText(n.secret), C(!0), E.current !== null && window.clearTimeout(E.current), E.current = window.setTimeout(() => C(!1), 2e3));
  }, _ = async () => {
    if (n?.recoveryCodes) {
      const v = n.recoveryCodes.join(`
`);
      await navigator.clipboard.writeText(v);
    }
  }, f = async () => {
    try {
      await c(b);
    } catch {
      w("");
    }
  }, y = () => {
    m(), t?.();
  };
  return O(() => () => {
    E.current !== null && (window.clearTimeout(E.current), E.current = null);
  }, []), o === "loading" || o === "idle" && a ? /* @__PURE__ */ r("div", { className: `cedros-totp-setup ${s}`, children: /* @__PURE__ */ r("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ r(Q, { size: "lg", label: "Setting up two-factor authentication" }) }) }) : o === "error" && !n ? /* @__PURE__ */ d("div", { className: `cedros-totp-setup ${s}`, children: [
    /* @__PURE__ */ r(ae, { error: i, onDismiss: u }),
    /* @__PURE__ */ d("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: y,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: () => l(),
          children: "Try again"
        }
      )
    ] })
  ] }) : o === "success" ? /* @__PURE__ */ r("div", { className: `cedros-totp-setup ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-success", children: [
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
  ] }) }) : n ? /* @__PURE__ */ d("div", { className: `cedros-totp-setup ${s}`, children: [
    h === "qr" && /* @__PURE__ */ d("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Scan QR code" }),
      /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Use your authenticator app to scan this QR code." }),
      /* @__PURE__ */ r("div", { className: "cedros-totp-qr", children: /* @__PURE__ */ r(Bd, { value: n.otpauthUri, size: 200, alt: "QR code for authenticator app" }) }),
      /* @__PURE__ */ d("div", { className: "cedros-totp-manual", children: [
        /* @__PURE__ */ r("p", { className: "cedros-totp-manual-label", children: "Or enter this code manually:" }),
        /* @__PURE__ */ d("div", { className: "cedros-totp-secret", children: [
          /* @__PURE__ */ r("code", { className: "cedros-totp-secret-code", children: n.secret }),
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-ghost cedros-button-sm",
              onClick: x,
              "aria-label": "Copy secret",
              children: g ? "Copied!" : "Copy"
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
            onClick: y,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: () => p("backup"),
            children: "Continue"
          }
        )
      ] })
    ] }),
    h === "backup" && /* @__PURE__ */ d("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Save recovery codes" }),
      /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. You can use them to access your account if you lose your authenticator device." }),
      /* @__PURE__ */ r("div", { className: "cedros-totp-backup-codes", children: n.recoveryCodes.map((v, N) => /* @__PURE__ */ r("code", { className: "cedros-totp-backup-code", children: v }, N)) }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
          onClick: _,
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
            onChange: (v) => k(v.target.checked)
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
            onClick: () => p("qr"),
            children: "Back"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: () => p("verify"),
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
        In,
        {
          value: b,
          onChange: w,
          onComplete: f,
          disabled: a,
          error: i?.message,
          autoFocus: !0
        }
      ),
      /* @__PURE__ */ d("div", { className: "cedros-totp-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-md",
            onClick: () => p("backup"),
            disabled: a,
            children: "Back"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: f,
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
function Rd({ onStatusChange: e, className: t = "" }) {
  const { status: s, isLoading: o, error: n, getStatus: a, disableTotp: i, regenerateBackupCodes: l, clearError: c } = _o(), [u, m] = S("status"), [h, p] = S(""), [b, w] = S(""), [g, C] = S(null), [A, k] = S(!1), [E, x] = S(null);
  O(() => {
    a().catch(() => {
    });
  }, [a]);
  const _ = B(() => {
    m("status"), e?.(!0);
  }, [e]), f = async () => {
    k(!0), x(null);
    try {
      await i(h), m("status"), p(""), e?.(!1);
    } catch (N) {
      x(N instanceof Error ? N.message : "Failed to disable 2FA"), p("");
    } finally {
      k(!1);
    }
  }, y = async () => {
    k(!0), x(null);
    try {
      const N = await l(b);
      C(N.recoveryCodes), w("");
    } catch (N) {
      x(N instanceof Error ? N.message : "Failed to regenerate codes"), w("");
    } finally {
      k(!1);
    }
  }, v = async () => {
    g && await navigator.clipboard.writeText(g.join(`
`));
  };
  return o && !s ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ r("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ r(Q, { size: "md", label: "Loading security settings" }) }) }) : n && !s ? /* @__PURE__ */ d("div", { className: `cedros-totp-settings ${t}`, children: [
    /* @__PURE__ */ r(ae, { error: n, onDismiss: c }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => a(),
        children: "Retry"
      }
    )
  ] }) : u === "setup" ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ r(Lo, { onSuccess: _, onCancel: () => m("status") }) }) : u === "disable" ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Disable two-factor authentication" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description cedros-totp-warning", children: "This will make your account less secure. Enter your password to confirm." }),
    E && /* @__PURE__ */ r("div", { className: "cedros-totp-error", children: /* @__PURE__ */ r(
      ae,
      {
        error: { code: "UNKNOWN_ERROR", message: E },
        onDismiss: () => x(null)
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ r(
      be,
      {
        label: "Password",
        placeholder: "Enter your password",
        value: h,
        onChange: (N) => p(N.target.value),
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
            m("status"), p(""), x(null);
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
          onClick: f,
          disabled: A || h.length === 0,
          children: A ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Q, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Disabling..." })
          ] }) : "Disable 2FA"
        }
      )
    ] })
  ] }) }) : u === "regenerate" ? g ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "New recovery codes" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. Your old codes are no longer valid." }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-backup-codes", children: g.map((N, P) => /* @__PURE__ */ r("code", { className: "cedros-totp-backup-code", children: N }, P)) }),
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
          m("status"), C(null);
        },
        children: "Done"
      }
    ) })
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Regenerate recovery codes" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "This will invalidate all existing recovery codes. Enter your authenticator code to confirm." }),
    E && /* @__PURE__ */ r("div", { className: "cedros-totp-error", children: /* @__PURE__ */ r(
      ae,
      {
        error: { code: "UNKNOWN_ERROR", message: E },
        onDismiss: () => x(null)
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ r(
      In,
      {
        value: b,
        onChange: w,
        onComplete: y,
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
            m("status"), w(""), x(null);
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
          onClick: y,
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
          className: `cedros-totp-badge ${s?.enabled ? "cedros-totp-badge-enabled" : "cedros-totp-badge-disabled"}`,
          children: s?.enabled ? "Enabled" : "Disabled"
        }
      )
    ] }),
    s?.enabled ? /* @__PURE__ */ d("div", { className: "cedros-totp-enabled-actions", children: [
      /* @__PURE__ */ d("div", { className: "cedros-totp-description", style: { marginTop: "0.25rem" }, children: [
        "Recovery codes remaining: ",
        /* @__PURE__ */ r("strong", { children: s.recoveryCodesRemaining })
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: () => m("regenerate"),
          children: "Regenerate recovery codes"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive-outline cedros-button-md",
          onClick: () => m("disable"),
          children: "Disable 2FA"
        }
      )
    ] }) : /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => m("setup"),
        children: "Enable two-factor authentication"
      }
    )
  ] }) });
}
class Id {
  client;
  constructor(t, s, o, n) {
    this.client = new ne({ baseUrl: t, timeoutMs: s, retryAttempts: o, getAccessToken: n });
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
    } catch (s) {
      throw z(s, "Failed to change password");
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
    } catch (s) {
      throw z(s, "Failed to update profile");
    }
  }
}
function jt() {
  const { config: e, authState: t, _internal: s } = ee(), [o, n] = S(!1), [a, i] = S(null), l = q(
    () => new Id(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), c = B(() => {
    i(null);
  }, []), u = B(
    async (h) => {
      if (t !== "authenticated")
        throw new Error("Must be authenticated to update profile");
      n(!0), i(null);
      try {
        return await l.updateProfile(h);
      } catch (p) {
        const b = p instanceof Error ? p : new Error("Failed to update profile");
        throw i(b), b;
      } finally {
        n(!1);
      }
    },
    [t, l]
  ), m = B(
    async (h) => {
      if (t !== "authenticated")
        throw new Error("Must be authenticated to change password");
      n(!0), i(null);
      try {
        await l.changePassword(h);
      } catch (p) {
        const b = p instanceof Error ? p : new Error("Failed to change password");
        throw i(b), b;
      } finally {
        n(!1);
      }
    },
    [t, l]
  );
  return {
    isLoading: o,
    error: a,
    updateProfile: u,
    changePassword: m,
    clearError: c
  };
}
function Md() {
  const { config: e, _internal: t } = ee(), [s, o] = S(!1), [n, a] = S(null), i = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), l = B(async () => {
    o(!0), a(null);
    try {
      return await i.get("/referral", {
        credentials: "include"
      });
    } catch (u) {
      const m = u instanceof Error ? u : new Error(String(u));
      throw a(m), m;
    } finally {
      o(!1);
    }
  }, [i]), c = B(async () => {
    o(!0), a(null);
    try {
      return (await i.post("/referral/regenerate", void 0, {
        credentials: "include"
      })).referralCode;
    } catch (u) {
      const m = u instanceof Error ? u : new Error(String(u));
      throw a(m), m;
    } finally {
      o(!1);
    }
  }, [i]);
  return { getReferral: l, regenerateCode: c, isLoading: s, error: n };
}
function Mh({
  onPasswordChange: e,
  onClose: t,
  className: s = ""
}) {
  const { user: o, refreshUser: n } = Ot(), { config: a, _internal: i } = ee(), { isLoading: l, error: c, changePassword: u, updateProfile: m, clearError: h } = jt(), [p, b] = S("main"), [w, g] = S(""), [C, A] = S(""), [k, E] = S(""), [x, _] = S(null), [f, y] = S(null), [v, N] = S(!1), P = J(null), [L, R] = S(o?.payoutWalletAddress ?? ""), [T, I] = S(!1), [M, U] = S(!1), [W, j] = S(null), H = B(async () => {
    const G = L.trim();
    if (G.length > 0 && (G.length < 32 || G.length > 44)) {
      j("Invalid Solana address — must be 32–44 characters.");
      return;
    }
    const Ne = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (G.length > 0 && !Ne.test(G)) {
      j("Invalid Solana address — contains non-base58 characters.");
      return;
    }
    j(null), I(!0);
    try {
      await m({ payoutWalletAddress: G || void 0 }), await n(), U(!0), setTimeout(() => U(!1), 2e3);
    } catch (Ce) {
      j(Ce instanceof Error ? Ce.message : "Failed to save payout wallet");
    } finally {
      I(!1);
    }
  }, [L, m, n]), { getReferral: D, regenerateCode: F, isLoading: K } = Md(), [re, ce] = S(null), [Ae, we] = S(0), [Y, $] = S(!1), [se, fe] = S(!1);
  O(() => {
    D().then((G) => {
      ce(G.referralCode), we(G.referralCount), fe(G.directPayoutEnabled);
    }).catch(() => {
    });
  }, []);
  const ke = zt(C), at = C === k, We = w.length > 0 && C.length > 0 && k.length > 0 && ke.isValid && at, ze = B(
    async (G) => {
      const Ne = G.target.files?.[0];
      if (Ne) {
        _(null), N(!0);
        try {
          const Ce = new FormData();
          Ce.append("file", Ne);
          const pt = i?.getAccessToken?.(), qe = {};
          pt && (qe.Authorization = `Bearer ${pt}`);
          const Ye = await fetch(`${a.serverUrl}/auth/upload/avatar`, {
            method: "POST",
            headers: qe,
            body: Ce,
            credentials: "include"
          });
          if (!Ye.ok) {
            const Ze = await Ye.json().catch(() => null);
            throw new Error(Ze?.message || Ze?.error || `Upload failed (${Ye.status})`);
          }
          await n();
        } catch (Ce) {
          _(Ce instanceof Error ? Ce.message : "Failed to upload avatar");
        } finally {
          N(!1), P.current && (P.current.value = "");
        }
      }
    },
    [a.serverUrl, i, n]
  ), Ht = B(async () => {
    if (We) {
      _(null), y(null);
      try {
        await u({
          currentPassword: w,
          newPassword: C
        }), g(""), A(""), E(""), y("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => {
          b("main"), y(null);
        }, 2e3);
      } catch (G) {
        _(G instanceof Error ? G.message : "Failed to change password");
      }
    }
  }, [We, w, C, u, e]), it = B(() => {
    b("main"), g(""), A(""), E(""), _(null), h();
  }, [h]), Ke = () => o?.name ? o.name.split(" ").map((G) => G[0]).join("").toUpperCase().slice(0, 2) : o?.email ? o.email[0].toUpperCase() : "?";
  return p === "change-password" ? /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (x || c) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      ae,
      {
        error: { code: "UNKNOWN_ERROR", message: x || c?.message || "" },
        onDismiss: () => {
          _(null), h();
        }
      }
    ) }),
    f && /* @__PURE__ */ d("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ r("span", { className: "cedros-profile-success-icon", children: "✓" }),
      f
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        be,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: w,
          onChange: (G) => g(G.target.value),
          disabled: l,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        be,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: C,
          onChange: (G) => A(G.target.value),
          disabled: l,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        be,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: k,
          onChange: (G) => E(G.target.value),
          disabled: l,
          error: k.length > 0 && !at ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: it,
          disabled: l,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: Ht,
          disabled: l || !We,
          children: l ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Q, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ d("div", { className: "cedros-profile-header", children: [
      /* @__PURE__ */ d(
        "div",
        {
          className: "cedros-profile-avatar-container cedros-profile-avatar-container--clickable",
          onClick: () => P.current?.click(),
          role: "button",
          tabIndex: 0,
          onKeyDown: (G) => {
            (G.key === "Enter" || G.key === " ") && (G.preventDefault(), P.current?.click());
          },
          "aria-label": "Change profile picture",
          children: [
            v ? /* @__PURE__ */ r("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: /* @__PURE__ */ r(Q, { size: "sm" }) }) : o?.picture ? /* @__PURE__ */ r(
              "img",
              {
                src: o.picture,
                alt: o.name || "Profile",
                className: "cedros-profile-avatar"
              }
            ) : /* @__PURE__ */ r("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: Ke() }),
            /* @__PURE__ */ r("div", { className: "cedros-profile-avatar-overlay", children: /* @__PURE__ */ d("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ r("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
              /* @__PURE__ */ r("circle", { cx: "12", cy: "13", r: "4" })
            ] }) }),
            /* @__PURE__ */ r(
              "input",
              {
                ref: P,
                type: "file",
                accept: "image/jpeg,image/png,image/gif,image/webp",
                onChange: ze,
                className: "cedros-profile-avatar-input",
                "aria-hidden": "true",
                tabIndex: -1
              }
            )
          ]
        }
      ),
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
            onClick: () => b("change-password"),
            children: "Change"
          }
        )
      ] })
    ] }),
    re && /* @__PURE__ */ d("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-profile-section-title", children: "Referral" }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ d("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-label", children: "Your code" }),
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-value cedros-profile-row-value--mono", children: re })
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => {
              navigator.clipboard.writeText(re), $(!0), setTimeout(() => $(!1), 2e3);
            },
            children: Y ? "Copied" : "Copy"
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ d("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-label", children: "Referrals" }),
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-value", children: Ae })
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: async () => {
              try {
                const G = await F();
                ce(G);
              } catch {
              }
            },
            disabled: K,
            children: K ? "Regenerating..." : "Regenerate"
          }
        )
      ] })
    ] }),
    se && /* @__PURE__ */ d("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-profile-section-title", children: "Payout wallet" }),
      /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Solana wallet address to receive direct referral payouts when enabled by the platform." }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-row cedros-profile-row--column", children: [
        /* @__PURE__ */ r(
          "input",
          {
            type: "text",
            className: "cedros-input",
            placeholder: "Solana wallet address (base58)",
            value: L,
            onChange: (G) => {
              R(G.target.value), j(null);
            },
            disabled: T,
            maxLength: 44
          }
        ),
        W && /* @__PURE__ */ r("span", { className: "cedros-profile-error-text", children: W }),
        M && /* @__PURE__ */ r("span", { className: "cedros-profile-success-text", children: "Saved." })
      ] }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-actions", children: /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: H,
          disabled: T,
          children: T ? "Saving..." : "Save wallet"
        }
      ) })
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
class Ud {
  client;
  constructor(t, s, o, n) {
    this.client = new ne({ baseUrl: t, timeoutMs: s, retryAttempts: o, getAccessToken: n });
  }
  /**
   * List all credentials linked to the current user
   */
  async listCredentials() {
    try {
      return (await this.client.get("/credentials")).credentials;
    } catch (t) {
      throw z(t, "Failed to list credentials");
    }
  }
  /**
   * Unlink (delete) a credential by ID.
   * The server prevents removing the last primary credential.
   */
  async unlinkCredential(t) {
    try {
      await this.client.delete(`/credentials/${encodeURIComponent(t)}`);
    } catch (s) {
      throw z(s, "Failed to unlink credential");
    }
  }
}
function Po() {
  const { config: e, authState: t, _internal: s } = ee(), [o, n] = S([]), [a, i] = S(!1), [l, c] = S(null), u = q(
    () => new Ud(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), m = B(() => {
    c(null);
  }, []), h = B(async () => {
    if (t !== "authenticated") {
      n([]);
      return;
    }
    i(!0), c(null);
    try {
      const b = await u.listCredentials();
      n(b);
    } catch (b) {
      c(b);
    } finally {
      i(!1);
    }
  }, [t, u]);
  O(() => {
    t === "authenticated" ? h() : n([]);
  }, [t, h]);
  const p = B(
    async (b) => {
      i(!0), c(null);
      try {
        await u.unlinkCredential(b), await h();
      } catch (w) {
        throw c(w), w;
      } finally {
        i(!1);
      }
    },
    [u, h]
  );
  return {
    credentials: o,
    isLoading: a,
    error: l,
    fetchCredentials: h,
    unlinkCredential: p,
    clearError: m
  };
}
function Dd({
  onPasswordChange: e,
  onCancel: t,
  className: s = ""
}) {
  const { isLoading: o, error: n, changePassword: a, clearError: i } = jt(), [l, c] = S(""), [u, m] = S(""), [h, p] = S(""), [b, w] = S(null), [g, C] = S(null), A = zt(u), k = u === h, E = l.length > 0 && u.length > 0 && h.length > 0 && A.isValid && k, x = B(async () => {
    if (E) {
      w(null), C(null);
      try {
        await a({ currentPassword: l, newPassword: u }), c(""), m(""), p(""), C("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => t(), 2e3);
      } catch (f) {
        w(f instanceof Error ? f.message : "Failed to change password");
      }
    }
  }, [E, l, u, a, e, t]), _ = B(() => {
    w(null), i(), t();
  }, [i, t]);
  return /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (b || n) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      ae,
      {
        error: { code: "UNKNOWN_ERROR", message: b || n?.message || "" },
        onDismiss: () => {
          w(null), i();
        }
      }
    ) }),
    g && /* @__PURE__ */ d("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ r("span", { className: "cedros-profile-success-icon", children: "✓" }),
      g
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        be,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: l,
          onChange: (f) => c(f.target.value),
          disabled: o,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        be,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: u,
          onChange: (f) => m(f.target.value),
          disabled: o,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        be,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: h,
          onChange: (f) => p(f.target.value),
          disabled: o,
          error: h.length > 0 && !k ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: _,
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
          disabled: o || !E,
          children: o ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Q, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) });
}
function Fd({ onPasswordChange: e, className: t = "" }) {
  const { user: s, refreshUser: o } = Ot(), { isLoading: n, error: a, updateProfile: i, clearError: l } = jt(), { credentials: c } = Po(), {
    forgotPassword: u,
    isLoading: m,
    isSuccess: h,
    reset: p
  } = ts(), b = c.some((N) => N.credentialType === "password"), [w, g] = S("view"), [C, A] = S(""), [k, E] = S(null), x = () => s?.name ? s.name.split(" ").map((N) => N[0]).join("").toUpperCase().slice(0, 2) : s?.email ? s.email[0].toUpperCase() : "?", _ = B(() => {
    A(s?.name || ""), g("edit"), E(null);
  }, [s?.name]), f = B(async () => {
    const N = C.trim();
    if (N) {
      E(null);
      try {
        await i({ name: N }), await o(), g("view");
      } catch (P) {
        E(P instanceof Error ? P.message : "Failed to update name");
      }
    }
  }, [C, i, o]), y = B(() => {
    g("view"), A(""), E(null), l();
  }, [l]), v = B(async () => {
    if (s?.email) {
      E(null);
      try {
        await u(s.email);
      } catch (N) {
        E(N instanceof Error ? N.message : "Failed to send password setup email");
      }
    }
  }, [s?.email, u]);
  return w === "change-password" ? /* @__PURE__ */ r(
    Dd,
    {
      onPasswordChange: e,
      onCancel: () => g("view"),
      className: t
    }
  ) : /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ d("div", { className: "cedros-profile-header", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-avatar-container", children: s?.picture ? /* @__PURE__ */ r(
        "img",
        {
          src: s.picture,
          alt: s.name || "Profile",
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
              value: C,
              onChange: (N) => A(N.target.value),
              disabled: n,
              autoFocus: !0,
              onKeyDown: (N) => {
                N.key === "Enter" && f(), N.key === "Escape" && y();
              }
            }
          ),
          /* @__PURE__ */ d("div", { className: "cedros-profile-name-edit-actions", children: [
            /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary cedros-button-sm",
                onClick: f,
                disabled: n || !C.trim(),
                children: n ? /* @__PURE__ */ r(Q, { size: "sm" }) : "Save"
              }
            ),
            /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-outline cedros-button-sm",
                onClick: y,
                disabled: n,
                children: "Cancel"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ d("div", { className: "cedros-profile-name-row", children: [
          /* @__PURE__ */ r("h3", { className: "cedros-profile-name", children: s?.name || "User" }),
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-profile-edit-btn",
              onClick: _,
              title: "Edit name",
              "aria-label": "Edit name",
              children: /* @__PURE__ */ r(Od, {})
            }
          )
        ] }),
        /* @__PURE__ */ r("p", { className: "cedros-profile-email", children: s?.email })
      ] })
    ] }),
    (k || a) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      ae,
      {
        error: { code: "UNKNOWN_ERROR", message: k || a?.message || "" },
        onDismiss: () => {
          E(null), l();
        }
      }
    ) }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-profile-section-title", children: "Account" }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-row", children: /* @__PURE__ */ d("div", { className: "cedros-profile-row-content", children: [
        /* @__PURE__ */ r("span", { className: "cedros-profile-row-label", children: "Email" }),
        /* @__PURE__ */ r("span", { className: "cedros-profile-row-value", children: s?.email || "Not set" })
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
              g("change-password"), E(null);
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
              onClick: p,
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
            disabled: m,
            children: m ? /* @__PURE__ */ r(Q, { size: "sm" }) : "Add password"
          }
        )
      ] })
    ] })
  ] }) });
}
function Od() {
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
const To = {
  password: "Email & Password",
  oauth_google: "Google",
  oauth_apple: "Apple",
  solana: "Solana Wallet",
  webauthn_passkey: "Passkey",
  webauthn_security_key: "Security Key",
  totp: "Authenticator App (2FA)",
  sso_oidc: "Single Sign-On"
};
function Wd({
  onLinkGoogle: e,
  onLinkApple: t,
  onAddPasskey: s,
  onLinkSolana: o,
  className: n = ""
}) {
  const { credentials: a, isLoading: i, error: l, unlinkCredential: c, clearError: u, fetchCredentials: m } = Po(), { registerPasskey: h, isSupported: p } = Ao(), [b, w] = S(null), [g, C] = S(!1), A = B(async () => {
    if (s) {
      s();
      return;
    }
    C(!0);
    try {
      await h(), await m();
    } catch {
    } finally {
      C(!1);
    }
  }, [s, h, m]), k = B(
    async (N) => {
      const P = N.label || To[N.credentialType];
      if (window.confirm(
        `Remove "${P}" as a sign-in method? You won't be able to sign in with it anymore.`
      )) {
        w(N.id);
        try {
          await c(N.id);
        } catch {
        } finally {
          w(null);
        }
      }
    },
    [c]
  ), E = new Set(a.map((N) => N.credentialType)), x = e && !E.has("oauth_google"), _ = t && !E.has("oauth_apple"), f = (s || p) && !E.has("webauthn_passkey"), y = o && !E.has("solana"), v = x || _ || f || y;
  return i && a.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-linked-accounts ${n}`, children: [
    /* @__PURE__ */ r(Q, {}),
    /* @__PURE__ */ r("span", { children: "Loading linked accounts..." })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-linked-accounts ${n}`, children: [
    l && /* @__PURE__ */ r(
      ae,
      {
        error: { code: "UNKNOWN_ERROR", message: l.message },
        onDismiss: u
      }
    ),
    a.length === 0 && !i && /* @__PURE__ */ r("p", { className: "cedros-linked-accounts-empty", children: "No linked sign-in methods found." }),
    a.length > 0 && /* @__PURE__ */ r("ul", { className: "cedros-linked-credential-list", children: a.map((N) => /* @__PURE__ */ r(
      zd,
      {
        credential: N,
        isUnlinking: b === N.id,
        onUnlink: k
      },
      N.id
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
              /* @__PURE__ */ r(Bo, {}),
              " Google"
            ]
          }
        ),
        _ && /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: t,
            children: [
              /* @__PURE__ */ r(Ro, {}),
              " Apple"
            ]
          }
        ),
        f && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: A,
            disabled: g,
            children: g ? /* @__PURE__ */ r(Q, { size: "sm" }) : /* @__PURE__ */ d(X, { children: [
              /* @__PURE__ */ r(jr, {}),
              " Passkey"
            ] })
          }
        ),
        y && /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: o,
            children: [
              /* @__PURE__ */ r(Io, {}),
              " Solana"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function zd({
  credential: e,
  isUnlinking: t,
  onUnlink: s
}) {
  const o = e.label || To[e.credentialType], n = qd[e.credentialType] || jd;
  return /* @__PURE__ */ d("li", { className: "cedros-linked-credential", children: [
    /* @__PURE__ */ r("div", { className: "cedros-linked-credential__icon", children: /* @__PURE__ */ r(n, {}) }),
    /* @__PURE__ */ d("div", { className: "cedros-linked-credential__info", children: [
      /* @__PURE__ */ r("span", { className: "cedros-linked-credential__name", children: o }),
      /* @__PURE__ */ d("span", { className: "cedros-linked-credential__meta", children: [
        "Added ",
        wn(e.createdAt),
        e.lastUsedAt && /* @__PURE__ */ d(X, { children: [
          " · Last used ",
          wn(e.lastUsedAt)
        ] }),
        e.isPrimary && /* @__PURE__ */ r(X, { children: " · Primary" })
      ] })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-linked-credential__action", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm cedros-button-danger-outline",
        onClick: () => s(e),
        disabled: t,
        title: e.isPrimary ? "Cannot remove primary sign-in method" : "Remove",
        children: t ? /* @__PURE__ */ r(Q, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function wn(e) {
  const t = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - t.getTime(), n = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), i = Math.floor(o / (1e3 * 60 * 60 * 24));
  return n < 1 ? "just now" : n < 60 ? `${n}m ago` : a < 24 ? `${a}h ago` : i < 30 ? `${i}d ago` : t.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
const qd = {
  password: Vd,
  oauth_google: Bo,
  oauth_apple: Ro,
  solana: Io,
  webauthn_passkey: jr,
  webauthn_security_key: jr,
  totp: Hd,
  sso_oidc: $d
};
function jd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M12 8v4m0 4h.01", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function Vd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M7 11V7a5 5 0 0110 0v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ r("circle", { cx: "12", cy: "16", r: "1.5", fill: "currentColor" })
  ] });
}
function Bo() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("path", { d: "M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 01-2 3.1v2.5h3.3c1.9-1.7 3-4.3 3-7.4z", fill: "#4285F4" }),
    /* @__PURE__ */ r("path", { d: "M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.5c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.4-4H3.2v2.6A10 10 0 0012 22z", fill: "#34A853" }),
    /* @__PURE__ */ r("path", { d: "M6.6 14.1a6 6 0 010-4.2V7.3H3.2a10 10 0 000 9.4l3.4-2.6z", fill: "#FBBC05" }),
    /* @__PURE__ */ r("path", { d: "M12 5.9c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0012 2 10 10 0 003.2 7.3l3.4 2.6C7.3 7.6 9.5 5.9 12 5.9z", fill: "#EA4335" })
  ] });
}
function Ro() {
  return /* @__PURE__ */ r("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r(
    "path",
    {
      d: "M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.16 4.36 9.53 8.72 9.28c1.3.07 2.2.74 2.96.8.93-.2 1.82-.92 3.03-.83 1.47.12 2.57.72 3.28 1.83-3.02 1.8-2.3 5.75.5 6.86-.6 1.53-1.37 3.04-2.44 4.34zM12.03 9.2C11.88 7.17 13.5 5.5 15.4 5.35c.29 2.28-2.08 3.98-3.37 3.85z",
      fill: "currentColor"
    }
  ) });
}
function Io() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "2", y: "6", width: "20", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M2 10h20", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("circle", { cx: "17", cy: "14", r: "1.5", fill: "currentColor" })
  ] });
}
function jr() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("circle", { cx: "10", cy: "7", r: "4", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M3 21v-2a7 7 0 017-7", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ r("path", { d: "M17 14v4m0 0v2m0-2h-2m2 0h2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function Hd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M9 12h6M12 9v6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function $d() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "3", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "13", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "3", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "13", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" })
  ] });
}
class Gd {
  client;
  constructor(t, s, o, n) {
    this.client = new ne({ baseUrl: t, timeoutMs: s, retryAttempts: o, getAccessToken: n });
  }
  /**
   * List all active sessions for the current user
   */
  async listSessions() {
    try {
      return (await this.client.get("/sessions")).sessions;
    } catch (t) {
      throw z(t, "Failed to list sessions");
    }
  }
  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions() {
    try {
      return await this.client.delete("/sessions");
    } catch (t) {
      throw z(t, "Failed to revoke sessions");
    }
  }
}
function Qd() {
  const { config: e, authState: t, _internal: s } = ee(), [o, n] = S([]), [a, i] = S(!1), [l, c] = S(null), u = q(
    () => new Gd(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), m = B(async () => {
    if (t !== "authenticated") {
      n([]);
      return;
    }
    i(!0), c(null);
    try {
      const b = await u.listSessions();
      n(b);
    } catch (b) {
      c(b);
    } finally {
      i(!1);
    }
  }, [t, u]);
  O(() => {
    t === "authenticated" ? m() : n([]);
  }, [t, m]);
  const h = B(async () => {
    i(!0), c(null);
    try {
      const b = await u.revokeAllSessions();
      return await m(), b;
    } catch (b) {
      throw c(b), b;
    } finally {
      i(!1);
    }
  }, [u, m]), p = q(() => o.filter((b) => !b.isCurrent).length, [o]);
  return {
    sessions: o,
    isLoading: a,
    error: l,
    fetchSessions: m,
    revokeAllSessions: h,
    otherSessionCount: p
  };
}
const Kd = {
  profile: "Profile",
  security: "Security",
  linked: "Linked Accounts"
}, Yd = ["profile", "security", "linked"];
function Uh({
  defaultTab: e = "profile",
  onClose: t,
  onPasswordChange: s,
  onTotpChange: o,
  onLinkGoogle: n,
  onLinkApple: a,
  onAddPasskey: i,
  onLinkSolana: l,
  className: c = ""
}) {
  const [u, m] = S(e), { sessions: h, isLoading: p, error: b, revokeAllSessions: w } = Qd();
  return /* @__PURE__ */ d("div", { className: `cedros-account-settings ${c}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-account-tabs--line", role: "tablist", children: Yd.map((g) => /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        role: "tab",
        "aria-selected": u === g,
        className: `cedros-account-tab ${u === g ? "cedros-account-tab-active" : ""}`,
        onClick: () => m(g),
        children: Kd[g]
      },
      g
    )) }),
    /* @__PURE__ */ d("div", { className: "cedros-account-tab-content", role: "tabpanel", children: [
      u === "profile" && /* @__PURE__ */ r(Fd, { onPasswordChange: s }),
      u === "security" && /* @__PURE__ */ d("div", { className: "cedros-account-security", children: [
        /* @__PURE__ */ r(Rd, { onStatusChange: o }),
        /* @__PURE__ */ r(
          al,
          {
            sessions: h,
            isLoading: p,
            error: b ?? void 0,
            onRevokeAll: async () => {
              await w();
            }
          }
        )
      ] }),
      u === "linked" && /* @__PURE__ */ r(
        Wd,
        {
          onLinkGoogle: n,
          onLinkApple: a,
          onAddPasskey: i,
          onLinkSolana: l
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
function Dh({ onComplete: e, className: t }) {
  return /* @__PURE__ */ d("div", { className: `cedros-mfa-setup-prompt ${t ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-mfa-setup-prompt__header", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-mfa-setup-prompt__title", children: "Two-factor authentication required" }),
      /* @__PURE__ */ r("p", { className: "cedros-mfa-setup-prompt__description", children: "Your administrator requires you to set up two-factor authentication before continuing. This adds an extra layer of security to your account." })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-mfa-setup-prompt__body", children: /* @__PURE__ */ r(Lo, { onSuccess: e }) })
  ] });
}
function Fh({
  onComplete: e,
  onSkip: t,
  className: s
}) {
  const { user: o } = Ot(), { isLoading: n, error: a, updateProfile: i, clearError: l } = jt(), [c, u] = S(o?.name ?? ""), m = B(
    async (p) => {
      p.preventDefault(), l();
      const b = c.trim();
      if (!b) {
        e?.();
        return;
      }
      try {
        await i({ name: b }), e?.();
      } catch {
      }
    },
    [c, i, l, e]
  ), h = c.trim().length > 0;
  return /* @__PURE__ */ d("div", { className: `cedros-complete-account ${s ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-complete-account__header", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-complete-account__title", children: "Complete Your Profile" }),
      /* @__PURE__ */ r("p", { className: "cedros-complete-account__description", children: "Please fill in your name to get started." })
    ] }),
    /* @__PURE__ */ d("form", { onSubmit: m, className: "cedros-complete-account__form", children: [
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
            value: c,
            onChange: (p) => u(p.target.value),
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
            disabled: n || !h,
            children: n ? "Saving..." : "Save"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-complete-account__button cedros-complete-account__button--secondary",
            onClick: t,
            disabled: n,
            children: "Skip"
          }
        )
      ] })
    ] })
  ] });
}
function Zd() {
  const { config: e, _internal: t } = ee(), [s, o] = S(!1), [n, a] = S(null), i = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), l = B(
    async (m) => await i.get(
      `/username/available?username=${encodeURIComponent(m)}`,
      { credentials: "include" }
    ),
    [i]
  ), c = B(async () => {
    try {
      return (await i.get(
        "/username/available?username=",
        { credentials: "include" }
      )).suggestion ?? null;
    } catch {
      return null;
    }
  }, [i]), u = B(
    async (m) => {
      o(!0), a(null);
      try {
        await i.patch("/me", { username: m });
      } catch (h) {
        const p = h instanceof Error ? h : new Error(String(h));
        throw a(p), p;
      } finally {
        o(!1);
      }
    },
    [i]
  );
  return { checkAvailability: l, getSuggestion: c, setUsername: u, isLoading: s, error: n };
}
function Oh({
  onComplete: e,
  onSkip: t,
  className: s
}) {
  const { checkAvailability: o, getSuggestion: n, setUsername: a, isLoading: i, error: l } = Zd(), [c, u] = S(""), [m, h] = S("idle"), [p, b] = S(""), w = J(null), g = J(!0);
  O(() => (g.current = !0, n().then((E) => {
    g.current && E && (u(E), h("available"), b("Available"));
  }), () => {
    g.current = !1;
  }), [n]);
  const C = B(
    (E) => {
      const x = E.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (u(x), h("idle"), b(""), w.current && clearTimeout(w.current), x.length < 3) {
        x.length > 0 && (h("error"), b("At least 3 characters"));
        return;
      }
      h("checking"), w.current = setTimeout(async () => {
        try {
          const _ = await o(x);
          if (!g.current) return;
          _.error ? (h("error"), b(_.error)) : _.available ? (h("available"), b("Available")) : (h("taken"), b("Already taken"), _.suggestion);
        } catch {
          if (!g.current) return;
          h("error"), b("Could not check availability");
        }
      }, 400);
    },
    [o]
  ), A = B(
    async (E) => {
      if (E.preventDefault(), !(m !== "available" || !c.trim()))
        try {
          await a(c.trim()), e?.();
        } catch {
        }
    },
    [c, m, a, e]
  ), k = m === "available" && !i;
  return /* @__PURE__ */ d("div", { className: `cedros-choose-username ${s ?? ""}`, children: [
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
              value: c,
              onChange: (E) => C(E.target.value),
              placeholder: "swift_falcon_42",
              className: "cedros-choose-username__input",
              maxLength: 30,
              autoFocus: !0,
              autoComplete: "off",
              spellCheck: !1
            }
          )
        ] }),
        p && /* @__PURE__ */ r(
          "span",
          {
            className: `cedros-choose-username__status cedros-choose-username__status--${m}`,
            role: m === "error" || m === "taken" ? "alert" : void 0,
            children: m === "checking" ? "Checking..." : p
          }
        )
      ] }),
      l && /* @__PURE__ */ r("div", { className: "cedros-choose-username__error", role: "alert", children: l.message }),
      /* @__PURE__ */ d("div", { className: "cedros-choose-username__actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "submit",
            className: "cedros-choose-username__button cedros-choose-username__button--primary",
            disabled: !k,
            children: i ? "Saving..." : "Continue"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-choose-username__button cedros-choose-username__button--secondary",
            onClick: t,
            disabled: i,
            children: "Skip"
          }
        )
      ] })
    ] })
  ] });
}
function Xd() {
  const e = $e(), [t, s] = S(!1), [o, n] = S(null), a = q(() => e ? new ne({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), i = B(() => {
    n(null);
  }, []), l = B(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      if (!Number.isInteger(w) || w <= 0) {
        const g = new Error(
          `Invalid deposit amount: ${w}. Must be a positive integer (lamports).`
        );
        throw n(g.message), g;
      }
      s(!0), n(null);
      try {
        return await a.post("/deposit", {
          amount_lamports: w
        });
      } catch (g) {
        const C = z(g, "Failed to execute deposit");
        throw n(C.message), C;
      } finally {
        s(!1);
      }
    },
    [a]
  ), c = B(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      return await a.get(`/deposit/status/${encodeURIComponent(w)}`);
    },
    [a]
  ), u = B(async () => {
    if (!a)
      throw new Error("useDeposit must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await a.get("/deposit/config");
    } catch (w) {
      const g = z(w, "Failed to get deposit config");
      throw n(g.message), g;
    } finally {
      s(!1);
    }
  }, [a]), m = B(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const g = new URLSearchParams();
        w?.limit !== void 0 && g.set("limit", String(w.limit)), w?.offset !== void 0 && g.set("offset", String(w.offset));
        const C = g.toString(), A = C ? `/deposits?${C}` : "/deposits";
        return await a.get(A);
      } catch (g) {
        const C = z(g, "Failed to list deposits");
        throw n(C.message), C;
      } finally {
        s(!1);
      }
    },
    [a]
  ), h = B(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const g = new URLSearchParams({
          input_mint: w.inputMint,
          amount: String(w.amount),
          taker: w.taker
        });
        return await a.get(`/deposit/quote?${g}`);
      } catch (g) {
        const C = z(g, "Failed to get deposit quote");
        throw n(C.message), C;
      } finally {
        s(!1);
      }
    },
    [a]
  ), p = B(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await a.post("/deposit/public", w);
      } catch (g) {
        const C = z(g, "Failed to execute public deposit");
        throw n(C.message), C;
      } finally {
        s(!1);
      }
    },
    [a]
  ), b = B(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await a.post("/deposit/micro", w);
      } catch (g) {
        const C = z(g, "Failed to execute micro deposit");
        throw n(C.message), C;
      } finally {
        s(!1);
      }
    },
    [a]
  );
  return {
    deposit: l,
    getQuote: h,
    publicDeposit: p,
    microDeposit: b,
    getStatus: c,
    getConfig: u,
    listDeposits: m,
    isLoading: t,
    error: o,
    clearError: i
  };
}
function Mo({
  tokens: e,
  selectedToken: t,
  onSelect: s,
  openSignal: o,
  placeholder: n = "Select token",
  disabled: a = !1,
  className: i = "",
  searchable: l = !0
}) {
  const [c, u] = S(!1), [m, h] = S(""), p = J(null), b = J(null), w = q(() => {
    if (!m.trim()) return e;
    const k = m.toLowerCase();
    return e.filter(
      (E) => E.symbol.toLowerCase().includes(k) || E.name.toLowerCase().includes(k) || E.mint.toLowerCase().includes(k)
    );
  }, [e, m]);
  O(() => {
    const k = (E) => {
      p.current && !p.current.contains(E.target) && (u(!1), h(""));
    };
    if (c)
      return document.addEventListener("mousedown", k), () => document.removeEventListener("mousedown", k);
  }, [c]), O(() => {
    c && l && b.current && b.current.focus();
  }, [c, l]), O(() => {
    o === void 0 || a || (u(!0), h(""));
  }, [o, a]);
  const g = B(() => {
    a || (u((k) => !k), c && h(""));
  }, [a, c]), C = B(
    (k) => {
      s(k), u(!1), h("");
    },
    [s]
  ), A = B(
    (k) => {
      k.key === "Escape" ? (u(!1), h("")) : k.key === "Enter" && w.length === 1 && C(w[0]);
    },
    [w, C]
  );
  return /* @__PURE__ */ d(
    "div",
    {
      ref: p,
      className: `cedros-token-selector ${c ? "cedros-token-selector-open" : ""} ${a ? "cedros-token-selector-disabled" : ""} ${i}`,
      onKeyDown: A,
      children: [
        /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-token-selector-trigger",
            onClick: g,
            disabled: a,
            "aria-haspopup": "listbox",
            "aria-expanded": c,
            children: [
              t ? /* @__PURE__ */ d("span", { className: "cedros-token-selector-selected", children: [
                t.logoUrl && /* @__PURE__ */ r(
                  "img",
                  {
                    src: t.logoUrl,
                    alt: t.symbol,
                    className: "cedros-token-icon",
                    onError: (k) => {
                      k.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ r("span", { className: "cedros-token-symbol", children: t.symbol })
              ] }) : /* @__PURE__ */ r("span", { className: "cedros-token-selector-placeholder", children: n }),
              /* @__PURE__ */ r("span", { className: "cedros-token-selector-arrow", children: c ? "▲" : "▼" })
            ]
          }
        ),
        c && /* @__PURE__ */ d("div", { className: "cedros-token-selector-dropdown", role: "listbox", children: [
          l && /* @__PURE__ */ r("div", { className: "cedros-token-search", children: /* @__PURE__ */ r(
            "input",
            {
              ref: b,
              type: "text",
              value: m,
              onChange: (k) => h(k.target.value),
              placeholder: "Search tokens...",
              className: "cedros-token-search-input"
            }
          ) }),
          /* @__PURE__ */ r("div", { className: "cedros-token-list", children: w.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-token-empty", children: "No tokens found" }) : /* @__PURE__ */ r(X, { children: w.map((k) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-token-option ${t?.mint === k.mint ? "cedros-token-option-selected" : ""}`,
              onClick: () => C(k),
              role: "option",
              "aria-selected": t?.mint === k.mint,
              children: [
                k.logoUrl && /* @__PURE__ */ r(
                  "img",
                  {
                    src: k.logoUrl,
                    alt: k.symbol,
                    className: "cedros-token-icon",
                    onError: (E) => {
                      E.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ d("span", { className: "cedros-token-info", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-token-symbol", children: k.symbol }),
                  /* @__PURE__ */ r("span", { className: "cedros-token-name", children: k.name })
                ] }),
                t?.mint === k.mint && /* @__PURE__ */ r("span", { className: "cedros-token-check", children: "✓" })
              ]
            },
            k.mint
          )) }) })
        ] })
      ]
    }
  );
}
function ns(e, t) {
  return t.privateDepositsEnabled && e >= t.privateMinUsd ? "private" : e >= t.publicMinUsd ? "public" : "sol_micro";
}
const os = "data:image/webp;base64,UklGRkACAABXRUJQVlA4IDQCAACQDQCdASo8ADwAPjEWiUMiISEUBFQgAwSgB4Z/TeLt3XMAoQH23eph0gPMB+sn+M9tvngOsA9ADwgPg3/cH9sfZciikEBuA1AB+nf+84CUkAVvA2x4xvyobR+mBaYhjUv/ewHb4hTqOnP38rzsxZX2inOSciAA/v7uqvqGdpWcjjrfMDFaNHumTog38t3yor0kbjn631VsX61cAC749wWuAX74u/f/hpeDFqS/ci8E1g94wk9UVs7BHqtv7f/M9iT1u5ITJV0Gv6tE/CW5j/nVR6yExJ6JoDRDOWQ8zVpWH92r3Lnbnc4WJpOchbRT3H5rv//6PP+F//4ehLUlR/4tkRUKZu/yOa26+sywmY+Xc1X2lXMcUv7+eQ7+FBE7bhKc7htieBfH4eR134AVaILL7PWA2FjzAjfaP1Lgirqoq/ZooE8jVD/b4g3J3O3/TG/4ajHe6clnAI/4NdwrnHX0P/quBU03HqSsQ0qsEMAuhrH/jn+YtDzmjm8q/cGJ44qvi24Hn+G1kxz2XP2S/Gp7ri5cMlo+muuwBjyNJnnEcTt/5cRdYS2cbEBZtpINWj3PuC1EOsd/8cTepSpxODcJHLzktfC1PHW3Pgoh3J5PHjW3TCQ1Wlu/wP8e8OPfNm48BODGChioj3ezblqrOBV+cI+hLi7ReJdvBF/4jY+/Un0asuWnrA6kRNpgOeO8wyl4Ryhkrff+9R1SpyPYP+5T3EuWWLZaCn0bGzyk97S3VAAAAAA=", Jd = 1e4, Ft = 1e3, Uo = 3;
function eu(e) {
  return Number.isFinite(e) ? `$${Math.round(e)}` : "$0";
}
function tu(e, t) {
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
        detail: `SOL only under ${eu(t.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens."
      };
  }
}
function as(e, t, s) {
  return Math.min(Math.max(e, t), s);
}
function ru(e, t) {
  if (t <= 0) return 0;
  const s = as(e / t, 0, 1);
  return Math.round(Math.pow(s, 1 / Uo) * Ft);
}
function su(e, t) {
  const s = as(e / Ft, 0, 1);
  return t * Math.pow(s, Uo);
}
function Do(e) {
  return e < 10 ? 0.01 : e < 100 ? 1 : e < 500 ? 5 : e < 1e3 ? 10 : e < 5e3 ? 25 : 50;
}
function nu(e) {
  return e < 1 ? 2 : 0;
}
function yn(e) {
  const t = Do(e), s = Math.round(e / t) * t, o = nu(t);
  return Number(s.toFixed(o));
}
function Fo({
  config: e,
  valueUsd: t,
  onChange: s,
  maxUsd: o = Jd,
  disabled: n = !1,
  className: a = ""
}) {
  const i = as(Number.isFinite(t) ? t : 0, 0, o), l = q(() => ns(i, e), [i, e]), c = tu(l, e), u = ru(i, o), m = u / Ft * 100;
  return /* @__PURE__ */ d("div", { className: `cedros-tiered-slider ${a}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-input-row", children: [
      /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-input", children: [
        /* @__PURE__ */ r("span", { className: "cedros-tiered-slider-currency", children: "$" }),
        /* @__PURE__ */ r(
          "input",
          {
            type: "number",
            value: i || "",
            onChange: (h) => s(yn(Math.max(0, Math.min(parseFloat(h.target.value) || 0, o)))),
            placeholder: "Enter amount",
            disabled: n,
            min: 0,
            step: Do(i),
            className: "cedros-deposit-flow-input cedros-tiered-slider-input-field",
            "aria-label": "Deposit amount"
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-tier", children: [
        /* @__PURE__ */ d("span", { className: `cedros-tiered-slider-badge cedros-tiered-slider-badge-${l}`, children: [
          l === "sol_micro" && /* @__PURE__ */ r("img", { src: os, alt: "SOL", className: "cedros-tiered-slider-badge-icon" }),
          c.label
        ] }),
        /* @__PURE__ */ r("span", { className: "cedros-tiered-slider-tier-detail", children: c.detail })
      ] })
    ] }),
    /* @__PURE__ */ r(
      "input",
      {
        type: "range",
        min: 0,
        max: Ft,
        step: 1,
        value: u,
        onChange: (h) => s(yn(su(parseFloat(h.target.value), o))),
        className: "cedros-tiered-slider-range",
        style: {
          background: `linear-gradient(to right, var(--cedros-primary) 0%, var(--cedros-primary) ${m}%, var(--cedros-border) ${m}%, var(--cedros-border) 100%)`
        },
        disabled: n,
        "aria-label": "Deposit amount slider"
      }
    ),
    c.note && /* @__PURE__ */ r("div", { className: "cedros-tiered-slider-note", children: c.note })
  ] });
}
const ou = "data:image/webp;base64,UklGRmIEAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IIIDAADwDwCdASo8ADwAPm0qkUWkIqGWDVeYQAbEtgBOmZMBu+H816ov3b8R8R2g2FXtxdyh5s3+A60v0APLi9ktgGB/LZjWNAXqgpE6jfW0NF+P4xEhH2L7M+26iGwrTjjcQegyCZqxs+ifvZANjWd279diqZNKUrgOTVtjJGtW4IVtRhMECd5aWVgAAP7nDv3UY/8f1l//xTP/FM/8NU8c9g//sC3+bX/1HZXsNsM57VKG2LVf1a0KdncWO8uPo/Oh79m9ZqjJZwXfPXuvwkK+WDOl6+N8C2Ux6no/V/zkoucKK/JZek7MR5sS8TknXB+6BuVDXou9Rx4aUea2q2IzvLvFIujjKsVYLMab7j9zo48fhgm9YOtjmWuS0WZ4c+6ta0mr3xF4fcdAIFf6oXRSlqovOX0HUiMV//hXwSX1cfP5cLj8c7OTyT/4ce4olJARV95GoY8oF+2uU0blGul3ItlG7c2Hl2/uC6s2WZc7Zukwojx6ed8t97bZ68N1uzCLzPlG7BuYS17F19e0wXnc6vEl3q7ft0K7OEl7r8mY6Kh+Nt/5V/Lp68mFBjLem1JjvC371+lKwez4KCdXwNo2Z04FqyzGpFutY6YQ/r5Tfu7Oi+oNfN0R/W+D4aj1nqHhlqYJzpx2NK4mj0gJIXmX8EArelSQI8mV4Ux9MRPwC2PuZhLTjQZv+Vl4p0D8bSB+Z0rek3hS6G1r80fW3cn767Pz/bXanjVmm34wt1nQPqdJObrZ7vv2NWcEuQKj9d+V6DzeDrq0CtGNcanEB5MY9agi1E6BprEScTdfPXjBeMnPbpD+QO6P7IW4UZ9etCCHtX++S/fl5Iz5RzUr10ojRMw//35C0yTjSEhbe884dPwor64n//KByjUFEGsCPAAXPJp1+O+SiKfUaODq6ncjKayTHXjoXgM7XP1z4sBhIKJZJRiM7vGC/+v/Sk8/jbgZLZDAVz1vLou93y7Yd8hxcWM/BesxgWgeKvl8fjE/Ud8tQKp4425hWh66lzzwxa4J3ctA4/E50wX/eoBOgq0B7+7S6FK4wvPHSNgfh+vwSWIJsJLt/3yjBeb41RRyMDMZqFQTZPEdFpXp48ExEyDayZ6objbjTHoS5WQDnDQpRyqMNKfvd41nhEPdb/hxpzXeTIjWmfHHCT+CQYWXDqLehCh1cRyeYOBwsSlSw5PiquAbsgAARVhJRroAAABFeGlmAABJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAEgAAAABAAAASAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAPAAAAAOgBAABAAAAPAAAAAAAAAA=", au = "data:image/webp;base64,UklGRtgCAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IPgBAABQCwCdASo8ADwAPm0wk0ekIqGhKBQMqIANiWkADPF3uV2D8VcQGk1mg+P36i9SLnZvYAQxszEWYzEwX1RVkqG/4BGbJgMSHqhKDFsjWsGfPPrvfef11goNmCDDlBJHVVD+8gAA/vu4q03kl+E7FpjtZ2gc8pQ619Hjv9NywoRZ6az43C1wcrRr/lWzJlJhLWMHN0MkVl1ueAf6Hn8StVzeUfMBXOKkgfe2msx7QWR5PnHW/5c6/35yrtWnrURc2q6UYlGin+v8C2dQqexkW6rX2EEijTI9eEQ46PWH3/59fM2AlMvvR2abaRk5XX7V1triQncRxvMfz5YmYDN+PY/ikcZUNaiFucKoUq5riv0eKCezuFNHecE11ojwJqWRSTWpalkz5autXp6vFS+FT1tWUsB/fs1CCOZxaA1vR1grOEaiuKe1RYm7e05psWtqbXLVmm1bA8Ly9PFkVdCbc6hR3UuBBsFGnVeGOUeMn2onnfvYhBMcM9YPxGdQkwZLXOk1VuQSTk01Shf3fZrFyRlFauftFdPYhKXwqrr+meav1P+KLKBVosqmHnFFfgExsQ/rOf3TSd+mOqQfJA+cF+HojNU7nmM3uDkoCBi+//Gqp+gPNNW8M4LFrol8rxE+7WsjqMgfwv1f+Nr25RtG1Wa/KkniRCAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", iu = "data:image/webp;base64,UklGRhYJAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSGICAAABkJz9nzon3/nNJGnBXRvBI0sDkR7slpRBaMDl5LByx7cEyBWHtWd+8/uiK/95uEfEBKBnFwRwk6Wjm89PW2Tj9OWNo7VxASQ4DDoIML9fbdLYpbFR21tykDAY8ZCLT9okqZrsD0uqJNl5sj6CIAPwDmdqRlNlz6o0vroE5/vlPObv0kyN/dVE3pmHd31xgt0P1MgBauTHLYjrg2DoClM0DtRi4kmA6ylgrMq2cuDaZm0CoQePyTqVhVTWJ+G7EozXqSyosj4K6cIhVBhZ2MjyMNy/BFcZWeDIE8g/PLaoLLRyF/4vgrlPTMVK/DQH+cPjGpUFV17/i6BEZeGVF+Dh4F/kUYGDR4nKDBPX4AX381Deh2C1Q8vB2F4CDqnMUrkPlPMpY+obLQ/j9+k1GjNNLB0z5hJ5fD0f5Y2XTLkkPn9Hy8X4vsGMW/xvt3JqvKflYnz3nCmXxJc3qLlEXj9mzOe4xJSLcW36Oy0P47cplKl5KMvAfj6HwFKbloOxswrBfWoOyvsQjzWmPErwcKhQi6d84eHgcSGPEgSA4Dq1aMpr8PjL3CemYiV+moP8AY9darGUW/D4u+CEsUiRVyH4p8NwmbE4kZUA9y8IRuvUoijr4xB06zFZpxZDWZ+ER/cBEzW2dXDaZnUMAb06hBOmaIOxmHhlCILenWDrI6MOIio/7kIc+uk85u+SSftkasZ78/AOffYOl17RqNqbqtFqZ+A8+i8BI+tPOiRNNdkfllSNZPvJRYEXDDQI3NJerUFjl8ZmbX8ekIBBuyCAjK8d3Xh52iBbp89vHl2ecIAEh54BVlA4IMwFAADQGwCdASo8ADwAPm0qkkYkIiGhLhtqqIANiWwAqSdaNo+beZFT37f+J9yXOd2J6HfQh5gH6edIDzAfst6vXoO9AD/Lf4DrAP2V9gDzY/+57F39p/3/7k+0RmjvYp/meic9ieyvJnZVfquF/a23ZOCHGT/sfDDjQ89zOL9Gewd+s3Vh/b32Gf28Ejb5ttLg9hoDiFb2tMW81eZU9Z1LHfdRSCsRMzHz0WT4BNgUakGf9oJtrGtVJFxHJfxAatIxnW1qjDi9i3DQtJp9pVNKlMoJEWdPKv3KaaFSlhd/aMGiir9CPcex5QAA+fpjxA6zfUamE3wS2zWwLVrt/fXA5+Wvx9j5SID0zuEHU2LisPUxvtRuIUwNrsUis8zy+IMpzft+ZSg+9gdx9e6+ZvPmtj4OByz5qo26J3rXhPy8LBXSpuPb+f+mP4CoTvYDhzQXh/SIGj8Ez1+W5MJ/Tkdw09wPCs3JuR3yoqO63FH/j81xW5Abr7tCdwfXwv3CXDtOcHwUqPCd1aiU2uT6XwgdnYqYygEXGKFx8nmaUvqSn9p8HmIA9dVTOoEnqYFjrNfWY034N2vjohd16cxnkP4PYvHkIOWa/FEUug7/qbJ/GFLPxNh6y9eQ//MzzXbcPwsT2chWXPBXNVF1S9dxv5NUuEueiw2kdebblQuvUSRLN+zx3VyT2lOzWBUqrzsTmeOlxjVcTA83H99r35O4X7WXNq7HExiWXxrdM/Ih4CvPJaEHPxUE/i6WIz6+VGq4RB3sBKl3P4M7/DLWAwCnwcpX228XezqQ4cS2tttWxLTc9cPd1ofek9qF9lpB8RvakdPnj2PruFA9W3iKbNdmgnb+mIpohHuUR73KdDDOHbyfAiOjPzzqomnIU3jcSt7LKOB/Op97sCk0yd18mVG3prs351B+xmCE2Zd3RFKL+mpMz5qcuAFAfRyodbggdgmFGkEGQ33VryYFl/upr31FGdI52sqzuxd7jZIsqCcznUH/gu+xaBw7wla49EmFNf+Ss+91i9Hsys0FS//Ktru1xWgkeEweX77y6Oot5tHQsDxgy0sAI85V7FmlpiiWXQdM12MGfCBfyRM+N23SjOdReeSILYCgsM3r33/54X+lfDVNj427MvbDFtKccqazlQ+iKqC//MvYwqyiJPL1ZbVoCEP774fKZA3D3qvsVPGlp9LPchpTs4mTJugt8qXl82RwXQCDNZXnbEois53E35hkRr+IJhndoRo1o2sZDoTgykbeOKiynPH03+BcUQ8zmxTmiVlHQym/LL3kRREnUlxs2zPPGb2E+Rpdib+LxOvFSmj9RfTZoYIJnrqNnBIXV2lt7xeZ0srf98JymJxrtr8lx69oSNZIReDddL+3iiUjh6lm7EcYuclqBaKp8q68geo7H1EvKy4nSRx5Q+uz4l/ypo2hVdwi9l+BHjZZmJ7lXkpNTRJ0gZpzquzN2vh/MZQALV6FZ6q4aofA9AJy1DVLdNjV8n6s9eFA5pazxwhLW4tgWMciGf5x6G7HqFPTL1ZL3l447zLGUkqAXjkeVaNmxZ2oNKIuTy6JDc0Z61Z2dgbsg6HwCX1/ux5sk82WsnNIO4CTnWKI1aCtQZaEsBf6hIl9n7VBsgZGIcPpqn7P4mbyf3EbfdfQ32qlawLuAxmDlwRsVsPkw7j4aKbvIBykNcsVXv0/X6UXXaAtw3feJnTwDak2qY6QpMLE9e7PJeuQQ8FXpqI5HoR82kd+DOwGH5F3OpuWsmEt8v7WQG8q1LMkg6vrl3I8047zMl1Yq0VwotbrsKJocsHgsbs/PGOO9v2s8U0Sju/71XRtG5skcy2msae3wixjlGR4i6ZfldMehQD1zf/FbWN9hnHfpq1Fh8+PSA9AzUi33qli8ixISbH+tw7CcumxvegMk88HMNZlVdnIEzIfyHrSdZ2S98yX2OYZw0+JyaBbQxI0fOr6KpuMD6FVGLrdN9dgOTgOPQgAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", cu = "data:image/webp;base64,UklGRo4EAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSA4CAAABkGXb2to2V9/v6D1Jmd5CQ5GXPYXAJMrtPOJMoMzMzDgIPYY5+vVds6T/m0BEOGzAtm1IBlR2d8kXUMyaADjeuHr9V7qj3E5/XrvaOA5AHCqzFgHTFz9tUTmEyq1PF6cBqVWDOLjkwS6VPsu8KqnaewRU7j5KIjipgFiQfCf1IGch8wMlv9QhcWk4nLlL9Z4l6b3y7hmUvGQkmF1nnrMC85zrc5CozDUQtwamisNSDCmxjL5jpqxMzfhutFCCY3+5110CaI9/jhVIcPg/DxiIB/x/eKgijLxkRobTyxFEw7zVm0NqcYg5LNAzKD3n4QbmyRVqWCiXJyD9uN7z0Ha9Dw4N5gzOnHU4IMJ7egt8HuYWasIJnlg46fkYgul9qgWU+9PA2Z7b2FngnR3e49Qm1QbKzVPNnltZ8wozK2S8et0SN34wt0LOnynVCsp02xI7tKSqqXYsV7ZtD/lpeaEfNyw/k9evWuKK7XfQ9ruP9/RW/s74t872N1bw2MY8n0Acmlb/KQ04AJ8t5PkeEbpDnbmR2/5392FiOfRFlCuTkIGsMh/aPBeGZFLBYuiM1IIUZLOD0NnMNBMWZdE/4bLo32MQ0wxcJnsvhcnerRhSLvPPhcj8s5DIsmtU6Tj1L1U6zvcEElfrVlHyqGy3epC4om5Vsg3OlO50UQ2V6Qa65LWf6TZ1J/11faBLlpgAVlA4IJgBAADwCQCdASo8ADwAPm0ylEckIyIhKAoAgA2JaQATzh4OcBkEByVmbl5z9gD9U/+J2APQgLaX4twLu19/UVxAWN1IKXE4cIqJBhoyQ0yDYn61m3zk6T7FMg0AAP78+EMvGgC8jLXmcbbmqvufKjG8Tv1M9Krl47vOW74O/Rapv2DgXbg9iK6PrRQG/9d9+rF/ESxzbszVFn3GThrMBmsklj/LPWDQ0pKzG7EyjQL6p6gfUwMze+wPhzJpn8tMqlUVgq6/QSUVcgG+ztsi73rA3vl3n4baeF1INsbuosTXtnsotVYuTii6rscx9OUTvevYcPNvcL9MPhyWeCQw0qynnGtzCIw+oFRN0+TN1mqXkFyk/rFBcH+FHiI6s9XX5EWCKn5vTRt/0RbS687PiXPFC5Zk/Gk4+538IYi+HZDjvlQQWOH/vddfYTerQ5QqWJt1YuaZNThQ2u+/DtXfZPRy1iWWLR9SKFFtlGrqBKWF5nPRPWWMNA3OssvUtvCNBLBA4cn1whzy+SpbgLvnaepxiykjKsU/MhzgAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", lu = "data:image/webp;base64,UklGRqwEAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSL8BAAABkGvbtmlLc5997yvbmW19gBnbDm2kjF5UmW3bthXZVZFdZ+81r+87Z1XlEaHIbSNlMstwos4XUBSTLAFQo/u01Zdf/yLDDze3zB/YwADJEoOoJAKg7oTdH4SF+XxiZlMgSESzwAJdVn2iUJzzOUMiLhQKf+/va2FtBLMBuu1zpHcsincUXhtoTKLsCTVX/KF3wrLhPLm/OWzZtjQWfZ7RhYyAC/lxMowpSzJYJAyFkZDQc21FBMUT7BqGjpHxf3m+XlEPUHE/f3vGgPzmw4awRUaTexkyJhwfNShctVgZXyJDXq4CUyjNy6Y4fVOBIkAPR2GcOE7Jm2NQ/RE9YzXht3a5VYvlOX0xF0fy+tp/ozBuQg6DzZYb6Bi7ed4rB5Mp/1Co4cNhLUo1StLxDIDqrynUoRswiF6nFnIxsDpnZ5WBW0GFZ1qZ8HfLDk5txHHsGDpSa6B0cXZEa+DsTr1M+P4qPdXwjynU4+1/a7oN3Sm6G+meSd27oHsHde++7puj+tYpv7G6b7vun6L7l6n+oZp/t7JmUNUqqhpJV5upakJVLaqqgVW1t6rmV401NGMc1djqH4rpIseSfyPFkgAAVlA4IAQCAABQDACdASo8ADwAPm0yk0akIyGhJgzogA2JaQAThroHvLxu+aPf5G2BYxv+B6XHzx6GPon/o+qz/tOAA/TM82gR0vnExWoiQRM36jlg2UIvwCSqySErzuguz9EP2x/7hsNazr91aIworWI7AAD+/TZ+6Ipl444OdT+2wU0Ov+T8oJuVP/vUbT/w1Jsv6Awnl6rvF/xetfOPt3gTQZZi0Y/AOx563J7CJkqTR/fc/n34zyeKzR80fhfv4ef+Hjhz/CX5aQo+58zg/FdE+7bLoophGfG0szI513EH+q+Gc73H1PFdJYf7CF8v5dhr3tMwEVX5Ji2ZxejK8xrf/E6nVXqlA4DrYNRP09InHc+fEqO/fH8xr+rMf4y1F9TOnwVffZblLoTP6lot0m/sh7sTiDQr0mIA8TiHoOffGDG6KzV+B3239udfhzD740gkRi/m53abX0Ku3vAgadgFFqL0vk8M/4aI+cI+0fbLW17mWGeMu21wSRRQiv5iNgGKR3vEGXAItcLDft1uUzWAfbe1X3zK/ymT7bA/76PB6UUknm+Y5MM4osurUXU/k7P38pN/3slnGfpFzjl4c3USY4mH9ZCJYUuC/kGEnq/yRPalPdODNFvW6s8MiQeQejYNRY0LsJ0WXkK8vXiDmihCivYAOPoSovesL7on+WAArDNM/BcQSQvCYABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", du = "data:image/webp;base64,UklGRnIIAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSK4BAAABkHPbtrE9+z73/RTbqWw7Lf+BbbNKbTudbZe2qy+VbVv3PmeHj05G6ohg4LaRounNMtN1voB42ABA5R7TNlx5+O7du9e3Tiwb0b4EgFyAOCQM1Z16+DWFUZC7m3uVB2zKQGBhe+77RGHonJffCL1zQuHDxQ1hrEmTatDjHIXOC2MgzpNf1tVJkWgsGhyihI7JIE74aUYp2ITFAoz9QO+ZAs7zanvkEilKbIkMJS5ANwoJmrCodYVOmBqh5zIEJjZc9xods4A4rrPGxGitrJSU71yNyH4Myl7JTEl+5zzYSH9nlkrxHBzxWUzLVEnhh+YI/gq3+UphpvA8m/s7/wg9M4bjFNg/0vplrxQ+rQEDg/xihmT23jxYJZ8UPq8OA5z77Wt405FDR4poSMjiAJhPRxUIu8D+UVonOhfNPEVHPM9juFacwo+1V6kJQ3Y9Sa8ljhPuUvRk4UdNWU9ST3b9n0W3iG5DumdS9y7o3kHVu6/75ii/dbpvrO7brvtPUf2X6f5DVf/dmpxBmauociRVbqbKCXW5qCoHVuXempxf1dZQtXFUbat/yKZTtSUBVlA4INwFAABwGgCdASo8ADwAPm0qj0WkIqEZ+zYAQAbEtgBOmZoZF+E8zGoP3X8VbcdLvma8t+jH0E+YB+ofSA8wH7VdQv0AP75/iOsG9ADy3/Y5/b/91fgI/Y7MOesb0e/q+TUR1vt7VO6mwG0imO70GM5/0P7BX6qelv7EP209lz9oDRea09ZR+SjhX7sBu/ZS7tG917rPgI3Q7XsB7luy2hAg/95C2Z1L362OH1oFziDY/K5gWoSytSAtiKvA/jW1MehBzdLzJfszPPBvGa15IYwIVRTjO2Hz5ZS9HjLMehwAAP64SgjD3qeg6NRe/Ok+iFhrG3pgglCfbam3yBaDUH36sUiQx0PB1ZZyOHq0ky+f97h6tJMvo0p9LkfXecWOFJ8J5G7yRPuL4tzGLT09QulTJw42xp2hd+lMgIa51XoHx/iftn8B2D3k92H5jOQr+uIXFHHK5FpcTG+qGEF+np0LiQa+vdW7/+ZzOLVRf7jR5X3ANPt93Ng92DW7NflVr6kMr88O/v2ZNb0vtgao2Am/R3CDKiNq89f86CT6r2L2g1oTui7H3E1yhSPQpEOz01I3fhfiMMv4weqKuoedxn/xLg5uzHa6Gte4C/dQYkG3ZFSy4CXQtRjftBrjX/Oj+HpSUPDsv0wPW+ml5NbBKDCj2f3SD8TVMf2ZfHrOkR602RVk2UmKC+H0Y9iK6k98vsgPINtz0II8X7Mj2nJkTC6IMLuQ8dNTUq9VXOnhXrdhNZoaH94ePo6baBl3hTGFAnD3/b+gR/vtbqV7wktuX6fpnjeTBe/Drp6z3neeANj/aX4CsU9w67nwYOjZhueCjxaDKUnNjLPjI1e0BoTbcOzOQ0wHJHZJ+Pt608StBu4HiJ8NjH46fnvXL3yiMoSvkAuwCE1AakA+eU1u3unyjl1/MnZQmbp8fzfsfrFesehLPcIkYdCiZ+52QbmINNTjEsvjuBuZRubBE+Laihppsxoo4efGIo0xkw0etu1+yzvkqp88w3pBq0mRl13gnnc+2zl6SmhwgmNFbz+F8qAqmdfJL8iaNSGEWlPlpczDDe62GBZMlBhQmq/XCn/1b+VazHvJXkoIFDF+wktMg+rKfLyfTlXdK0cs+Kn8h+rjMakkf3WLo1TftMLn+O+x/Gat+BGstJrM1xvCSSnHQY+NV4B4gRqyZ55gRNnqN/0lWrATOcHUaGXpkTIM/yxFjxcePcSFo+t2aJ5lShtVukETzRxaIXgRkpROeWQHWpTHOaexmXOzF0b833qJSoXMk2zB/uMrgDzKd7d3ohUz8Ra08WYKlAuMQD08bF4+jUepEspqPLoYLQ73TfmL+1LwKxyTV3gEu6WnxBPWPLnYIGYN9U47ZNlB+NgHgYtKTyii6060RAG+wN32WUVFxCZw0HMHnHFgwxD34L/anlpS7mOrjKgyuGYhFC7iHqTQHuoAO1ekBHV+rndnbETKfa1F7LxNLYq+dmJyytmQrJUCGjelorI1m/TMQNiFVrY4FCI1Gl2W1JsZsw9zA+Bh3JmjkC0H5/0JV6JotNMatJIZ4v5PqwJe3r8xd+FNS3ynccdu+xtVdc27qwVdoomciZD5oXYey9KAFSAKO594sBKZNWUJTLXnt0BJbdF8FkQYvg3DQajYY2p+ixd5Ag7o92gw0pVVDDOP+WQxiEmKqgWJyTBsnsBk2Bxi2Unsv8S/4PmE8Hy/vy+Mij+aTAKZvg716IHfHX0/JMeFfmAnsZ39Q0qkfdPtq6+CxbGZ7wKDsK/8l/MVGuyd6faJFt5wyoOXuNrr3JC9EoBmjcOzkVw/6RNP49poZ1xzsX3q7B4HGfI/XSfRQq3HeZ2j12d0E3gCAube4oExaT1sx/v8F+f61QOsGdSaqM2im6qOGkSRkrRQ7L8hvS8vEYJeVkAbFvX5ov7e/egYYNToMHj651c5/rCVYtB9Ned6GvGN8R0x3t7+lsf8+ofhHRzpyvwxd6c5pREZVOKnXzplhJ61mki4JmAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", uu = "data:image/svg+xml,%3csvg%20width='88'%20height='88'%20viewBox='0%200%2088%2088'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='88'%20height='88'%20fill='url(%23paint0_linear_170_79)'/%3e%3crect%20x='25.6665'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='51.3335'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='29.3335'%20y='40.3333'%20width='29.3333'%20height='7.33333'%20fill='white'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_170_79'%20x1='-75.3077'%20y1='-55'%20x2='146.302'%20y2='148.167'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FF00FF'/%3e%3cstop%20offset='0.531673'%20stop-color='%237A84FF'/%3e%3cstop%20offset='1'%20stop-color='%2305FAFF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e", hu = "data:image/webp;base64,UklGRh4HAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSNwBAAABkFxbexpJnyR3z8y+ajXMkAnjnnOgbUUxEAHjkpldWQwzFUn6v3PGVNI/AUQEA7dt49gN3PXavTlfQDeNAeyqg4PL5buRyOhteXlwcJWtHU8qzUIBs+30g7/s4N8Hp7cZFAtpDc7Bbr8xplB8iFJBYvBC4fjGdgvnElqdwc6XFPGRnQxehC93wjgzbxRYf1UYA+dkiJSrG1DMV6zDoW+MkQmMkd8Owdl5AsvOM3gm0geeXwY7R/Tu0EcmM3re6cF2Rr/kTJiBMmPZh+2q/wtm4ozD9qrB0tucMhunvL0Upg1n6JmRnmda4HCckVkZeRyuMWjjF0peCD9vhK3jAgMzM/BCDQ576225m/bCwcA+qzS/PLUwDrsr1ZDdcAa3KtWQWzDYPKZoQDjeDJyoVEdOAPf0cA/Lf1F0IPy1fG8VWmXvgF4LnoOLDFoIvPiaUQuRr99pNr8dUZEj0YToQnfjreaQd7oL6T6Tuu+C7juo++6rfnOUv3W631jNb7v+P8U+1ZDAZxZG9R+q/e+GxcbPuRcRftkIq+pVVD2Srjdr94TDnJ6w7MGqedFhH1bVA6t67zk9/3ctzw+YAhvSc431KExyjjNHQ2zLcTRzq/8op0vKJd+OREbvUnJJAFZQOCBaBAAA8BUAnQEqPAA8AD5tMJRHJCMiISgb+1CADYlsAJ0zIUCfxfmY2f+0b2AbztDnPeKX0qPMp+wHrDehz0AP7J/o+tP9ADy3f23+C79yPYA/aqK9mONrQbuszbsEyALJNTfg+Z6NjG2v+ETCuvlr1q6QUqEiAMUndG/WwfnjJIOTfOBS4W1w0HjOJa1XQ2K33n2b07EOjOBapwKzyoA2erTBTnEKlFjllBy68GBjZ+UKnlzN/f5ibbb4gAD+i9OsnW0xUnmTpyhVasIKzTu0BsXnfBm4rHJqGMFJBUgTESDXEPcNjAeaHP8ck9qdNBH4L/h53tXgHeZttc7c4lwTa6U4Lziz8qUoy8ce0IMc5TFElawGj16tME0GzSSbUqgH7/tYA6huPsWM2z3GjP8b9y7paRbINxwYRtuE90I6QVsNrEkbhL1YfwxRXnuobOfSe3KFVamrvsOqwTCMqlNfjsR3pyoiZ+lYt3+AH6x4ZVNltbYI5KiVhgCu1isooK324ldloH3zhlefYKEwTCYfNjbeH5UiL7JSev+t/C+ftc3TkAHcsvrLCU6n5pYYY2Yr1kRq+r6XVzI6iXuA/TqwMk6xq1PmdzHOwKavncLjWJrk0uU/5E5WKqXM0tgl5s3pduHjb5aiAt0ikEisMyYwnIhDiSemPRdGON4RlwSb3OEpZjhuZqoyen4Sw/fULewt3hAZizeiPZx1o9LS3M/4r3v/M6/o5925VJcmxAf/yjsyjCz0mV+6NuIeWp8shrFaIGgeduVJoZ0Kys1WjSLuFg9QvF5LlkOZ2k7WrzSu4ucsUOS/X4wnQvB0RCnR1PCsU4NDdLfxvQITUgGIuVTJ7LR73PHzZam/Z21oy3euiU55ffITekwjR4SgVoPvhxbdBSyVePf/twm62pSK9IfgPGN+ttubhQub1ooVZymdQCrS3goEs6dlnl/6TVfkgxFyBfAORkZafeu/Va2vIgUBNUQd48W8oPiMFjx+SAKx1qm2IwCLnuhJGf9M4nCzu7oo43f+nBeT07IjB+FpFKRGFNvlpLEXhPclSgFkqeU1W2eNqW2zShCWkQkgfE1HAoNX3z+CQcRQJq+HkC2nSjFdFYT8UNYNS6lYcyVWzEnOos1qpsNRxnLqY2Dl5CCT3Yeg/qT8chfF9ZadFvzNTEIDlARoN//7IU23MtuLdpsAjsiGfBHuR7y4lemYPdD/9Cuff9Qn/r/xlhmB5x2Y9Z1yME3aANAb5+u3lYz01zUlWwakKVmv9fhaeu/YzQ7BXLlcb+cbaIF5t/COmObnt20zaTfjad542f7p7f2Xea134nvyPYS+EAgjM+GufHvl9tXCrrRbH0pn7kH2XEGx9VbO4mY54+QZa5kPr0j3AOEtKd7SJWjlg5TQfgIuB6KoLGainSwF+pPdiCmzEzAOa1eFwn//2VdDMeq42/bKH8U4orewhLh60ci/S0BRBuItNMc+v1+vxl0YyS5it4AAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", mu = "data:image/svg+xml,%3csvg%20width='868'%20height='868'%20viewBox='0%200%20868%20868'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='434'%20cy='434'%20r='434'%20fill='%231B262D'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M234.563%20184H640.697C650.387%20184%20659.339%20189.164%20664.172%20197.542L782.495%20402.657C788.631%20413.294%20786.808%20426.72%20778.056%20435.346L452.368%20756.327C441.818%20766.724%20424.846%20766.724%20414.296%20756.327L89.0484%20435.78C80.0927%20426.954%2078.4157%20413.136%2085.0013%20402.433L211.48%20196.884C216.405%20188.879%20225.146%20184%20234.563%20184ZM588.257%20275.577V333.129H472.567V373.032C553.82%20377.296%20614.782%20394.81%20615.234%20415.802L615.231%20459.563C614.779%20480.556%20553.82%20498.069%20472.567%20502.333V600.259H395.746V502.333C314.492%20498.069%20253.531%20480.555%20253.078%20459.563L253.081%20415.802C253.533%20394.81%20314.492%20377.296%20395.746%20373.032V333.129H280.055V275.577H588.257ZM434.156%20472.268C520.868%20472.268%20593.345%20457.459%20611.082%20437.683C596.041%20420.912%20541.636%20407.713%20472.567%20404.089V445.867C460.187%20446.516%20447.336%20446.858%20434.156%20446.858C420.976%20446.858%20408.125%20446.516%20395.746%20445.867V404.089C326.676%20407.713%20272.271%20420.912%20257.23%20437.683C274.968%20457.459%20347.444%20472.268%20434.156%20472.268Z'%20fill='%23009393'/%3e%3c/svg%3e";
function Oo(e) {
  const t = e.toUpperCase();
  return is.find((o) => o.symbol === t)?.decimals ?? 6;
}
function fu(e, t) {
  const s = e.toUpperCase(), n = is.find((a) => a.symbol === s)?.decimals ?? t;
  return n === void 0 ? 2 : s === "SOL" ? 4 : n === 6 && s !== "SOL" ? 2 : n > 6 ? 6 : n;
}
const is = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: os
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: du
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: mu
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
    logoUrl: iu
  },
  {
    mint: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    name: "WLFI USD",
    decimals: 6,
    logoUrl: hu
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logoUrl: lu
  },
  {
    mint: "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    name: "Hubble USD",
    decimals: 6,
    logoUrl: uu
  },
  {
    mint: "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT",
    symbol: "CASH",
    name: "Stripe USD",
    decimals: 6,
    logoUrl: au
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoUrl: ou
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
    logoUrl: cu
  }
];
function pu(e) {
  return e.companyFeePercent > 0 || e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap" || e.feePolicy === "user_pays_privacy";
}
function gu(e, t, s) {
  const { feePolicy: o, privacyFeePercent: n, swapFeePercent: a, companyFeePercent: i } = e;
  let l = i;
  return s || (o === "user_pays_all" ? (l += a, t && (l += n)) : o === "user_pays_privacy" && t ? l += n : o === "user_pays_swap" && (l += a)), l;
}
const Lt = 1e9, rt = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoUrl: os
}, st = {
  mint: "other",
  symbol: "OTHER",
  name: "Other",
  decimals: 6
}, Wo = 1e4;
function wu(e, t) {
  const s = t < e.publicMinUsd, o = t >= e.privateMinUsd, n = [], a = !s && o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0), i = !s && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0), l = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  if (a) {
    const c = e.privacyFeeFixedLamports / Lt, u = e.privacyFeePercent, m = c * e.solPriceUsd, h = t * (u / 100);
    n.push({ label: "Privacy", solAmount: c, percent: u, usdAmount: m + h });
  }
  if (i) {
    const c = e.swapFeeFixedLamports / Lt, u = e.swapFeePercent, m = c * e.solPriceUsd, h = t * (u / 100);
    n.push({ label: "Swap", solAmount: c, percent: u, usdAmount: m + h });
  }
  if (l) {
    const c = e.companyFeeFixedLamports / Lt, u = e.companyFeePercent, m = c * e.solPriceUsd, h = t * (u / 100);
    n.push({ label: "Service", solAmount: c, percent: u, usdAmount: m + h });
  }
  return n;
}
function zo(e, t, s) {
  const o = wu(e, t), n = s === 0 ? 0 : s < 0.01 ? 0.01 : s;
  if (o.length === 0)
    return s === 0 ? "No fees" : `Total: $${n.toFixed(2)}`;
  const a = o.reduce((w, g) => w + g.solAmount, 0), i = o.reduce((w, g) => w + g.percent, 0), l = { fee: 7, sol: 8, rate: 7, usd: 8 }, c = (w) => {
    const g = w.label.padEnd(l.fee), C = w.solAmount.toFixed(4).padStart(6).padEnd(l.sol), A = (w.percent.toFixed(2) + "%").padStart(5).padEnd(l.rate), E = ("$" + (w.usdAmount === 0 ? 0 : Math.max(w.usdAmount, 0.01)).toFixed(2)).padEnd(l.usd);
    return `${g} │ ${C} │ ${A} │ ${E}`;
  }, u = `${"Fee".padEnd(l.fee)} │ ${"SOL".padEnd(l.sol)} │ ${"+ Rate".padEnd(l.rate)} │ ${"= Total".padEnd(l.usd)}`, m = `${"─".repeat(l.fee)}─┼─${"─".repeat(l.sol)}─┼─${"─".repeat(l.rate)}─┼─${"─".repeat(l.usd)}`, h = ("$" + n.toFixed(2)).padEnd(l.usd), p = `${"TOTAL".padEnd(l.fee)} │ ${a.toFixed(4).padStart(6).padEnd(l.sol)} │ ${(i.toFixed(2) + "%").padStart(5).padEnd(l.rate)} │ ${h}`;
  return [u, m, ...o.map(c), m, p].join(`
`);
}
function yu(e) {
  const t = [], s = e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0, o = e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0, n = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  return s && t.push("Privacy Cash fee"), o && t.push("swap fee"), n && t.push("company service fee"), t.length === 0 ? "No processing fees apply to deposits." : "A small fee may apply. We'll show exact totals before you confirm.";
}
function Vt(e, t) {
  if (t <= 0) return 0;
  const s = t < e.publicMinUsd, o = t >= e.privateMinUsd, n = gu(e, o, s);
  let a = e.companyFeeFixedLamports;
  s || (o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (a += e.privacyFeeFixedLamports), (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (a += e.swapFeeFixedLamports));
  const i = a / Lt * e.solPriceUsd, l = t * (n / 100);
  return i + l;
}
function qo(e, t, s) {
  return e === "sol" ? "SOL" : e === "single-token" ? t.symbol : s.some((n) => n.symbol === "USDC") ? "SOL or USDC" : "SOL or supported tokens";
}
function bn(e) {
  return e.map((t) => t.trim()).filter(Boolean);
}
const bu = /* @__PURE__ */ new Set(["USDC", "USDT", "USD1", "PYUSD", "USDH", "CASH"]);
function cs(e, t, s) {
  if (bu.has(e.symbol)) return 1;
  const o = t.tokenPrices?.[e.symbol];
  if (o && o > 0) return o;
  if (e.symbol === "SOL") return t.solPriceUsd || null;
  const n = s?.[e.symbol];
  return n && n > 0 ? n : null;
}
function jo(e, t) {
  return e.toFixed(fu(t));
}
function Wh({
  config: e,
  currencyMode: t,
  depositMethod: s,
  tokens: o = [],
  defaultToken: n,
  minAmount: a,
  maxAmount: i = 1e4,
  onSuccess: l,
  onError: c,
  onCancel: u,
  onUnlockRequired: m,
  onAuthorize: h,
  className: p = "",
  showStepIndicator: b = !0,
  pollInterval: w = 5e3,
  demoMode: g = !1,
  demoAutoConfirmMs: C,
  tokenPriceUsd: A,
  showExplainer: k = !1,
  siteName: E,
  explainerConfig: x
}) {
  const { deposit: _, getStatus: f, error: y, clearError: v } = Xd(), N = Wt(), P = bn(e.quickActionTokens), L = bn(e.customTokenSymbols), R = q(() => {
    const V = e.customTokens ?? [];
    if (V.length === 0) return o;
    const Z = new Set(o.map((oe) => oe.symbol)), te = [...o];
    for (const oe of V)
      Z.has(oe.symbol) || (te.push({
        mint: oe.mint,
        symbol: oe.symbol,
        name: oe.symbol,
        // Use symbol as name for custom tokens
        decimals: oe.decimals,
        logoUrl: oe.logoUrl
      }), Z.add(oe.symbol));
    return te;
  }, [o, e.customTokens]), T = q(() => {
    if (L.length === 0) return R;
    const V = R.filter((Z) => L.includes(Z.symbol));
    return V.length > 0 ? V : R;
  }, [R, L]), I = e.privateDepositsEnabled, M = s ? s === "sign" && !I ? "receive" : s : I && N.hasExternalWallet ? "sign" : "receive", U = P[0] ? R.find((V) => V.symbol === P[0]) : void 0, W = t === "sol" ? rt : t === "single-token" ? U ?? R.find((V) => V.symbol === "USDC") ?? R[0] ?? rt : n ?? U ?? R.find((V) => V.symbol === "USDC") ?? R.find((V) => V.symbol !== "SOL") ?? R[0] ?? rt, j = B(() => k ? "explainer" : "unlock", [k]), [H, D] = S(j), [F, K] = S(W), [re, ce] = S(""), [Ae, we] = S(null), [Y, $] = S(null), [se, fe] = S(null), [ke, at] = S(null), [We, ze] = S(!1), [Ht, it] = S(!1), [Ke, G] = S(null), Ne = J(null);
  O(() => () => {
    Ne.current && clearTimeout(Ne.current);
  }, []), O(() => {
    D(j()), K(W), ce(""), we(null), $(null), fe(null), at(null), ze(!1), it(!1), G(null), v();
  }, [t, M, W, v]);
  const Ce = a ?? e.privateMinSol, pt = i, qe = parseFloat(re), Ye = N.status === "enrolled_locked" || N.status === "enrolled_unlocked" || N.status === "unlocked", Ze = Ye && N.isUnlocked, $t = Ye && !N.isUnlocked, ds = B(() => {
    let te = M === "sign" ? [
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
    return k && (te = [{ key: "explainer", label: "Info" }, ...te]), te;
  }, [M, k])(), Go = ds.findIndex((V) => V.key === H), us = B((V) => {
    K(V);
  }, []), Qo = B(
    async (V) => {
      if (!h) {
        D(M === "sign" ? "confirm" : "show-address");
        return;
      }
      it(!0), $(null);
      try {
        const te = await h(V, M === "sign" ? qe : null, F);
        fe(te.sessionId), at(te.depositAddress), D(M === "sign" ? "confirm" : "show-address");
      } catch (Z) {
        const te = Z instanceof Error ? Z : new Error("Authorization failed");
        $(te.message);
      } finally {
        it(!1);
      }
    },
    [h, M, qe, F]
  ), Ko = B(
    async (V, Z) => {
      v(), $(null), D("signing");
      const te = V ?? qe, oe = Z ?? F;
      if (!g) {
        if ($t && m) {
          m(), D("confirm");
          return;
        }
        if (!Ze) {
          $("Wallet not ready"), D("error");
          return;
        }
      }
      try {
        const ve = Math.round(te * Math.pow(10, oe.decimals));
        if (g) {
          await new Promise((Qt) => setTimeout(Qt, 1500));
          const Ee = {
            token: t === "sol" ? null : oe,
            amount: te,
            amountSmallestUnit: ve,
            txSignature: `demo-tx-${Date.now()}`,
            sessionId: se || `demo-session-${Date.now()}`,
            response: {
              sessionId: se || `demo-session-${Date.now()}`,
              txSignature: `demo-tx-${Date.now()}`,
              amountLamports: ve,
              message: "Demo deposit successful",
              withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
            },
            method: "sign"
          };
          we(Ee), D("success"), l?.(Ee);
          return;
        }
        const Re = await _(ve), ct = {
          token: t === "sol" ? null : oe,
          amount: te,
          amountSmallestUnit: ve,
          txSignature: Re.txSignature,
          sessionId: Re.sessionId,
          response: Re,
          method: "sign"
        };
        we(ct), D("success"), l?.(ct);
      } catch (ve) {
        const Re = ve instanceof Error ? ve : new Error("Deposit failed");
        $(Re.message), D("error"), c?.(Re);
      }
    },
    [
      _,
      qe,
      F,
      t,
      g,
      se,
      Ze,
      $t,
      m,
      l,
      c,
      v
    ]
  ), Yo = B(() => {
    D("waiting");
  }, []), Gt = B(async () => {
    const V = ke || N.solanaPubkey;
    if (V) {
      Ne.current && clearTimeout(Ne.current);
      try {
        await navigator.clipboard.writeText(V), ze(!0), Ne.current = setTimeout(() => ze(!1), 2e3);
      } catch {
        const Z = document.createElement("textarea");
        Z.value = V, document.body.appendChild(Z), Z.select(), document.execCommand("copy"), document.body.removeChild(Z), ze(!0), Ne.current = setTimeout(() => ze(!1), 2e3);
      }
    }
  }, [ke, N.solanaPubkey]);
  O(() => {
    if (!(H === "confirm" || H === "show-address" || H === "waiting") || !se || g) return;
    let Z = !1, te = 0, oe = 0;
    const ve = 360, Re = 5, ct = async () => {
      if (!(Z || te >= ve)) {
        te++;
        try {
          const Ee = await f(se);
          if (oe = 0, Ee.status === "completed" || Ee.status === "detected") {
            const Qt = Ee.amountLamports ? Ee.amountLamports / Math.pow(10, F.decimals) : 0, Xo = Ee.amountLamports || 0, hs = {
              token: t === "sol" ? null : F,
              amount: Qt,
              amountSmallestUnit: Xo,
              txSignature: Ee.txSignature || "",
              sessionId: se,
              response: Ee,
              method: "receive",
              depositAddress: N.solanaPubkey ?? void 0
            };
            we(hs), D("success"), l?.(hs);
            return;
          }
        } catch {
          if (oe++, oe >= Re) {
            $("Unable to check deposit status. Please check your connection and try again.");
            return;
          }
        }
        Z || setTimeout(ct, w);
      }
    };
    return ct(), () => {
      Z = !0;
    };
  }, [
    H,
    se,
    g,
    f,
    F,
    t,
    N.solanaPubkey,
    l,
    w
  ]), O(() => {
    if (!g || !C || H !== "waiting" || M !== "receive" || !ke) return;
    const V = window.setTimeout(() => {
      const Z = Ke ?? e.privateMinUsd, te = F.symbol === "SOL" && e.solPriceUsd > 0 ? Z / e.solPriceUsd : Z, oe = Math.round(te * Math.pow(10, F.decimals)), ve = {
        token: t === "sol" ? null : F,
        amount: te,
        amountSmallestUnit: oe,
        txSignature: `demo-tx-${Date.now()}`,
        sessionId: se || `demo-session-${Date.now()}`,
        response: {
          sessionId: se || `demo-session-${Date.now()}`,
          txSignature: `demo-tx-${Date.now()}`,
          amountLamports: oe,
          message: "Demo deposit detected",
          withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
        },
        method: "receive",
        depositAddress: ke ?? void 0
      };
      we(ve), D("success"), l?.(ve);
    }, C);
    return () => window.clearTimeout(V);
  }, [
    g,
    C,
    H,
    M,
    ke,
    Ke,
    e,
    F,
    t,
    se,
    l
  ]);
  const Zo = B(() => {
    D(j()), ce(""), we(null), $(null), v();
  }, [j, v]);
  return e.enabled ? /* @__PURE__ */ d("div", { className: `cedros-deposit-flow ${p}`, children: [
    b && H !== "error" && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-steps", children: ds.map((V, Z) => {
      const te = Go >= Z, oe = V.key === H;
      return /* @__PURE__ */ d(
        "div",
        {
          className: `cedros-deposit-flow-step-item ${te ? "step-active" : ""}`,
          children: [
            /* @__PURE__ */ r(
              "div",
              {
                className: `cedros-deposit-flow-step-circle ${te ? "active" : ""} ${oe ? "current" : ""}`,
                children: Z + 1
              }
            ),
            /* @__PURE__ */ r("span", { className: `cedros-deposit-flow-step-label ${te ? "active" : ""}`, children: V.label })
          ]
        },
        V.key
      );
    }) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-content", children: [
      H === "explainer" && /* @__PURE__ */ r(
        vu,
        {
          siteName: E,
          config: x,
          depositConfig: e,
          currencyMode: t,
          token: F,
          tokens: T,
          onContinue: () => D("unlock"),
          onCancel: u
        }
      ),
      H === "unlock" && /* @__PURE__ */ r(
        Au,
        {
          token: F,
          tokens: T,
          currencyMode: t,
          depositMethod: M,
          isAuthorizing: Ht,
          error: Y,
          onAuthorize: Qo,
          onBack: k ? () => D("explainer") : void 0,
          onCancel: u
        }
      ),
      H === "confirm" && M === "sign" && /* @__PURE__ */ r(
        Nu,
        {
          token: F,
          tokens: R,
          quickActionSymbols: P,
          customTokenSymbols: L,
          currencyMode: t,
          minAmount: Ce,
          maxAmount: pt,
          depositAddress: ke || N.solanaPubkey,
          walletReady: Ze || g,
          needsUnlock: $t && !g,
          copied: We,
          isListening: !!se && !g,
          config: e,
          onCopy: Gt,
          onTokenSelect: us,
          onUnlockRequired: m,
          onConfirm: (V, Z) => Ko(V, Z),
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      H === "signing" && /* @__PURE__ */ r(ku, { depositAddress: N.solanaPubkey }),
      H === "show-address" && /* @__PURE__ */ r(
        Cu,
        {
          token: F,
          tokens: R,
          quickActionSymbols: P,
          customTokenSymbols: L,
          tokenPriceUsd: A,
          currencyMode: t,
          depositAddress: ke || N.solanaPubkey,
          copied: We,
          isListening: !!se && !g,
          config: e,
          onCopy: Gt,
          onTokenSelect: us,
          onAmountChange: G,
          onSent: Yo,
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      H === "waiting" && /* @__PURE__ */ r(
        Eu,
        {
          token: F,
          depositAddress: ke || N.solanaPubkey,
          copied: We,
          feeLine: Ke ? (() => {
            const V = Vt(e, Ke);
            return V === 0 ? "No fees" : `Fees: $${Math.max(V, 0.01).toFixed(2)} total`;
          })() : "Fees: calculated after deposit",
          onCopy: Gt
        }
      ),
      H === "success" && Ae && /* @__PURE__ */ r(xu, { result: Ae, config: e, onNewDeposit: Zo }),
      H === "error" && /* @__PURE__ */ r(
        Su,
        {
          error: Y || y || "An error occurred",
          onRetry: () => D("confirm"),
          onCancel: u
        }
      )
    ] })
  ] }) : /* @__PURE__ */ r("div", { className: `cedros-deposit-flow cedros-deposit-flow-disabled ${p}`, children: /* @__PURE__ */ r("p", { children: "Deposits are not currently available." }) });
}
function vu({
  siteName: e,
  config: t,
  depositConfig: s,
  currencyMode: o,
  token: n,
  tokens: a,
  onContinue: i,
  onCancel: l
}) {
  const c = t?.title ?? "How Deposits Work", u = t?.exchangeName ?? "Coinbase", m = ca(t?.exchangeUrl) ?? "https://www.coinbase.com", h = t?.showExchangeSuggestion !== !1, p = qo(o, n, a), b = e ? `${e} uses the Solana blockchain to process secure, private payments.` : "This site uses the Solana blockchain to process secure, private payments.", w = t?.body ?? b, g = pu(s), C = yu(s);
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: c }),
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
          /* @__PURE__ */ r("strong", { children: g ? "Transparent Fees" : "Low Fees" }),
          /* @__PURE__ */ r("p", { children: C })
        ] })
      ] })
    ] }),
    h && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-explainer-exchange", children: /* @__PURE__ */ d("p", { className: "cedros-deposit-flow-explainer-exchange-text", children: [
      /* @__PURE__ */ r("strong", { children: "New to Solana?" }),
      " You can purchase ",
      p,
      " using your credit card at",
      " ",
      /* @__PURE__ */ r("a", { href: m, target: "_blank", rel: "noopener noreferrer", children: u }),
      ", then send it here to fund your account."
    ] }) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-actions", children: [
      l && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: l,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: i,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function Au({
  token: e,
  tokens: t,
  currencyMode: s,
  depositMethod: o,
  isAuthorizing: n,
  error: a,
  onAuthorize: i,
  onBack: l
}) {
  const [c, u] = S(""), m = qo(s, e, t), h = (p) => {
    p.preventDefault(), c.trim() && (i(c), u(""));
  };
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Authorize Deposit" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: o === "sign" ? s === "multi-token" ? "Enter your password to authorize a deposit. This allows us to process your withdrawal when the privacy period ends." : `Enter your password to authorize a ${m} deposit. This allows us to process your withdrawal when the privacy period ends.` : s === "multi-token" ? "Enter your password to get your deposit address. Any supported token sent to this address will be credited to your account." : `Enter your password to get your deposit address. Any ${m} sent to this address will be credited to your account.` }),
    /* @__PURE__ */ d("form", { onSubmit: h, children: [
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
        /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", htmlFor: "deposit-password", children: "Password" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "deposit-password",
            type: "password",
            value: c,
            onChange: (p) => u(p.target.value),
            className: "cedros-deposit-flow-input",
            placeholder: "Enter your password",
            disabled: n,
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
            onClick: l,
            disabled: n,
            children: "Back"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "submit",
            className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
            disabled: !c.trim() || n,
            children: n ? "Authorizing..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function Nu({
  token: e,
  tokens: t,
  quickActionSymbols: s,
  customTokenSymbols: o,
  currencyMode: n,
  minAmount: a,
  maxAmount: i,
  depositAddress: l,
  walletReady: c,
  needsUnlock: u,
  copied: m,
  isListening: h,
  config: p,
  onCopy: b,
  onTokenSelect: w,
  onUnlockRequired: g,
  onConfirm: C,
  onBack: A
}) {
  const [k, E] = S(p.privateMinUsd), [x, _] = S(!1), [f, y] = S(!1), [v, N] = S(0), [P, L] = S(null), T = ns(k, p) === "sol_micro", I = e.symbol === st.symbol, M = q(() => {
    const Y = o.length === 0 ? t : t.filter((fe) => o.includes(fe.symbol)), $ = Y.length > 0 ? Y : t;
    return $.some((fe) => fe.symbol === st.symbol) ? $ : [...$, st];
  }, [t, o]), U = Vt(p, k), W = U === 0 ? 0 : U < 0.01 ? 0.01 : U, j = I ? "Fees: calculated after deposit" : U === 0 ? "No fees" : `Fees: $${W.toFixed(2)} total`, H = I ? "" : zo(p, k, U), D = cs(T ? rt : e, p), F = D ? k / D : e.symbol === "SOL" && p.solPriceUsd > 0 ? k / p.solPriceUsd : null, K = F != null ? jo(F, T ? "SOL" : e.symbol) : null, ce = k - U <= 0 && k > 0, Ae = !I && k > 0 && !ce && F != null && F >= a && F <= i;
  O(() => {
    if (n === "multi-token")
      if (T && e.symbol !== "SOL") {
        L(e);
        const Y = t.find(($) => $.symbol === "SOL");
        Y && w(Y);
      } else !T && P && e.symbol === "SOL" && (w(P), L(null));
  }, [T, e.symbol, n, t, w, P, e]);
  const we = () => {
    Ae && F != null && C(F, e);
  };
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Choose Amount" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Set how much you want to deposit. Higher tiers unlock privacy." }),
    n === "multi-token" && !T && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-token-quick", children: [
        s.map((Y) => {
          const $ = t.find((fe) => fe.symbol === Y), se = e.symbol === Y;
          return /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${se ? "is-active" : ""}`,
              onClick: () => {
                $ && (_(!1), w($));
              },
              disabled: !$,
              children: [
                $?.logoUrl && /* @__PURE__ */ r(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: $.logoUrl,
                    alt: `${Y} logo`
                  }
                ),
                Y
              ]
            },
            Y
          );
        }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${x ? "is-active" : ""}`,
            onClick: () => {
              _(!0), N((Y) => Y + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      x && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ r(
        Mo,
        {
          tokens: M,
          selectedToken: e,
          onSelect: w,
          openSignal: v
        }
      ) })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-field", children: /* @__PURE__ */ r(
      Fo,
      {
        config: p,
        valueUsd: k,
        onChange: E,
        maxUsd: Wo
      }
    ) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: I ? "Sign to send tokens to this address" : `Sign to send ${K ?? "--"} ${T ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ r("code", { className: "cedros-deposit-flow-address", children: l || "Loading..." }),
        /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-actions", children: [
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-icon",
              onClick: b,
              title: "Copy address",
              disabled: !l,
              children: m ? "✓" : "⧉"
            }
          ),
          l && /* @__PURE__ */ r(
            "a",
            {
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-link cedros-deposit-flow-copy-icon",
              href: `https://orbmarkets.io/account/${l}`,
              target: "_blank",
              rel: "noopener noreferrer",
              title: "View on Orb Markets",
              children: "↗"
            }
          )
        ] })
      ] }),
      m && /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    ce && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-warning", children: /* @__PURE__ */ r("p", { children: "Deposit amount is less than the fees. Increase the amount to proceed." }) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ r("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ d("span", { children: [
          j,
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${f ? "is-open" : ""}`,
              "data-tooltip": H,
              "aria-label": `Fee breakdown: ${H.replaceAll(`
`, ", ")}`,
              "aria-expanded": f,
              onClick: (Y) => {
                Y.stopPropagation(), y(($) => !$);
              },
              onBlur: () => y(!1),
              onKeyDown: (Y) => {
                Y.key === "Escape" && y(!1);
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
      g && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: g,
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
          onClick: we,
          disabled: !Ae || !c || !l,
          children: "Deposit"
        }
      )
    ] })
  ] });
}
function ku({ depositAddress: e }) {
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
function Cu({
  token: e,
  tokens: t,
  quickActionSymbols: s,
  customTokenSymbols: o,
  tokenPriceUsd: n,
  currencyMode: a,
  depositAddress: i,
  copied: l,
  isListening: c,
  config: u,
  onCopy: m,
  onTokenSelect: h,
  onAmountChange: p,
  onSent: b,
  onBack: w
}) {
  const [g, C] = S(u.privateMinUsd), [A, k] = S(!1), [E, x] = S(!1), [_, f] = S(0), [y, v] = S(null), P = ns(g, u) === "sol_micro", L = e.symbol === st.symbol, R = q(() => {
    const F = o.length === 0 ? t : t.filter((ce) => o.includes(ce.symbol)), K = F.length > 0 ? F : t;
    return K.some((ce) => ce.symbol === st.symbol) ? K : [...K, st];
  }, [t, o]), T = Vt(u, g), I = T === 0 ? 0 : T < 0.01 ? 0.01 : T, M = L ? "Fees: calculated after deposit" : T === 0 ? "No fees" : `Fees: $${I.toFixed(2)} total`, U = L ? "" : zo(u, g, T), W = L || g > 0, j = cs(P ? rt : e, u, n), H = j ? g / j : null, D = H ? jo(H, e.symbol) : null;
  return O(() => {
    if (a === "multi-token")
      if (P && e.symbol !== "SOL") {
        v(e);
        const F = t.find((K) => K.symbol === "SOL");
        F && h(F);
      } else !P && y && e.symbol === "SOL" && (h(y), v(null));
  }, [P, e.symbol, a, t, h, y, e]), O(() => {
    p(g);
  }, [g, p]), i ? /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Send Deposit" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Send funds to your deposit address. We'll confirm automatically." }),
    a === "multi-token" && !P && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-token-quick", children: [
        s.map((F) => {
          const K = t.find((ce) => ce.symbol === F), re = e.symbol === F;
          return /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${re ? "is-active" : ""}`,
              onClick: () => {
                K && (k(!1), h(K));
              },
              disabled: !K,
              children: [
                K?.logoUrl && /* @__PURE__ */ r(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: K.logoUrl,
                    alt: `${F} logo`
                  }
                ),
                F
              ]
            },
            F
          );
        }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${A ? "is-active" : ""}`,
            onClick: () => {
              k(!0), f((F) => F + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      A && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ r(
        Mo,
        {
          tokens: R,
          selectedToken: e,
          onSelect: h,
          openSignal: _
        }
      ) })
    ] }),
    !L && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Deposit Amount" }),
      /* @__PURE__ */ r(
        Fo,
        {
          config: u,
          valueUsd: g,
          onChange: C,
          maxUsd: Wo
        }
      )
    ] }),
    L && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-note", children: "Send any token you want. We'll detect the deposit, swap it, and credit your balance automatically." }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: L ? "Send any token to this address" : `Send ${D ?? "--"} ${P ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ r("code", { className: "cedros-deposit-flow-address", children: i }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-copy-btn",
            onClick: m,
            title: "Copy address",
            children: l ? "✓" : "📋"
          }
        )
      ] }),
      l && /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ r("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ d("span", { children: [
          M,
          !L && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${E ? "is-open" : ""}`,
              "data-tooltip": U,
              "aria-label": `Fee breakdown: ${U.replaceAll(`
`, ", ")}`,
              "aria-expanded": E,
              onClick: (F) => {
                F.stopPropagation(), x((K) => !K);
              },
              onBlur: () => x(!1),
              onKeyDown: (F) => {
                F.key === "Escape" && x(!1);
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
    c && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-info-banner", children: "Listening for your deposit. We'll notify you when it arrives." }),
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
function Eu({ token: e, depositAddress: t, copied: s, feeLine: o, onCopy: n }) {
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
                onClick: n,
                title: "Copy address",
                children: s ? "✓" : "⧉"
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
function xu({ result: e, config: t, onNewDeposit: s }) {
  const o = e.token ?? rt, n = cs(o, t), a = n ? e.amount * n : e.amount, i = Vt(t, a), l = Math.max(a - i, 0), c = i === 0 ? 0 : i < 0.01 ? 0.01 : i;
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
          c.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-summary-label", children: "Credits Added" }),
        /* @__PURE__ */ d("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-credit", children: [
          "+$",
          l.toFixed(2)
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
        onClick: s,
        children: "Make Another Deposit"
      }
    ) })
  ] });
}
function Su({ error: e, onRetry: t, onCancel: s }) {
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-error-icon", children: "✕" }),
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Deposit Failed" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-error-message", children: e }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-actions", children: [
      s && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: s,
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
function Vo() {
  const e = $e(), [t, s] = S(!1), [o, n] = S(null), a = q(() => e ? new ne({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), i = B(() => {
    n(null);
  }, []), l = B(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await a.get("/credits/balance/sol");
    } catch (m) {
      const h = z(m, "Failed to fetch credit balance");
      throw n(h.message), h;
    } finally {
      s(!1);
    }
  }, [a]), c = B(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return (await a.get("/credits/balance")).balances;
    } catch (m) {
      const h = z(m, "Failed to fetch credit balances");
      throw n(h.message), h;
    } finally {
      s(!1);
    }
  }, [a]), u = B(
    async (m) => {
      if (!a)
        throw new Error("useCredits must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const h = new URLSearchParams();
        m?.currency && h.set("currency", m.currency), m?.limit !== void 0 && h.set("limit", m.limit.toString()), m?.offset !== void 0 && h.set("offset", m.offset.toString());
        const p = h.toString(), b = p ? `/credits/history?${p}` : "/credits/history";
        return await a.get(b);
      } catch (h) {
        const p = z(h, "Failed to fetch transaction history");
        throw n(p.message), p;
      } finally {
        s(!1);
      }
    },
    [a]
  );
  return {
    getBalance: l,
    getAllBalances: c,
    getHistory: u,
    isLoading: t,
    error: o,
    clearError: i
  };
}
function zh({
  showAllCurrencies: e = !1,
  refreshInterval: t = 0,
  compact: s = !1,
  className: o = "",
  onLoad: n
}) {
  const { getBalance: a, getAllBalances: i, isLoading: l, error: c, clearError: u } = Vo(), [m, h] = S([]), [p, b] = S(null), w = B(async () => {
    try {
      if (e) {
        const g = await i();
        h(g), n?.(g);
      } else {
        const g = await a();
        h([g]), n?.([g]);
      }
      b(null);
    } catch (g) {
      b(g instanceof Error ? g.message : "Failed to load balance");
    }
  }, [e, a, i, n]);
  if (O(() => {
    w();
  }, [w]), O(() => {
    if (t <= 0) return;
    const g = setInterval(w, t);
    return () => clearInterval(g);
  }, [t, w]), p || c)
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-error ${o}`, children: [
      /* @__PURE__ */ r("p", { className: "cedros-credit-error", children: p || c }),
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
  if (l && m.length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-loading ${o}`, children: [
      /* @__PURE__ */ r("span", { className: "cedros-credit-loading-indicator" }),
      /* @__PURE__ */ r("span", { className: "cedros-credit-loading-text", children: "Loading balance..." })
    ] });
  if (s) {
    const g = m[0];
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-compact ${o}`, children: [
      g ? /* @__PURE__ */ r(
        "span",
        {
          className: "cedros-credit-value",
          title: `${g.balanceLamports} lamports`,
          children: g.display
        }
      ) : /* @__PURE__ */ r("span", { className: "cedros-credit-value cedros-credit-value-zero", children: "0.0000 SOL" }),
      l && /* @__PURE__ */ r("span", { className: "cedros-credit-refresh-indicator", title: "Refreshing..." })
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
          disabled: l,
          title: "Refresh balance",
          children: l ? "..." : "↻"
        }
      )
    ] }),
    m.length === 0 ? /* @__PURE__ */ d("div", { className: "cedros-credit-empty", children: [
      /* @__PURE__ */ r("p", { className: "cedros-credit-empty-message", children: "No credit balance yet." }),
      /* @__PURE__ */ r("p", { className: "cedros-credit-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ r("div", { className: "cedros-credit-list", children: m.map((g) => /* @__PURE__ */ d("div", { className: "cedros-credit-item", children: [
      /* @__PURE__ */ r("span", { className: "cedros-credit-currency", children: g.currency }),
      /* @__PURE__ */ r("span", { className: "cedros-credit-amount", children: g.display })
    ] }, g.currency)) })
  ] });
}
const Pr = [
  { key: "all", label: "All", txTypes: null },
  { key: "deposits", label: "Deposits", txTypes: ["deposit"] },
  { key: "usage", label: "Usage", txTypes: ["spend", "usage", "charge"] },
  {
    key: "adjustments",
    label: "Adjustments",
    txTypes: ["refund", "adjustment", "bonus", "credit"]
  }
];
function _u(e, t) {
  const s = e < 0, o = Math.abs(e), n = Oo(t), a = o / Math.pow(10, n), i = s ? "-" : "+";
  return t.toUpperCase() === "SOL" ? `${i}${a.toFixed(4)} SOL` : `${i}$${a.toFixed(2)}`;
}
function Lu(e) {
  const t = new Date(e), s = /* @__PURE__ */ new Date(), o = s.getTime() - t.getTime();
  if (o < 0) return "Just now";
  const n = Math.floor(o / (1e3 * 60 * 60 * 24));
  if (n === 0) {
    const a = Math.floor(o / 36e5);
    if (a === 0) {
      const i = Math.floor(o / 6e4);
      return i < 1 ? "Just now" : `${i}m ago`;
    }
    return `${a}h ago`;
  }
  return n === 1 ? "Yesterday" : n < 7 ? `${n}d ago` : t.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: t.getFullYear() !== s.getFullYear() ? "numeric" : void 0
  });
}
function Pu(e) {
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
function Tu(e, t) {
  const s = (e || "").toLowerCase();
  return s === "deposit" ? "↓" : s === "spend" || s === "usage" || s === "charge" ? "↑" : s === "refund" ? "←" : s === "bonus" || s === "credit" ? "★" : t ? "+" : "−";
}
function qh({
  defaultTab: e = "all",
  pageSize: t = 10,
  refreshInterval: s = 0,
  className: o = "",
  onLoad: n,
  onTransactionClick: a
}) {
  const { getHistory: i, isLoading: l, error: c, clearError: u } = Vo(), [m, h] = S(e), [p, b] = S([]), [w, g] = S(0), [C, A] = S(0), [k, E] = S(null), x = Pr.find((T) => T.key === m) || Pr[0], _ = q(() => x.txTypes === null ? p : p.filter((T) => {
    const I = T.txType || "";
    return x.txTypes.some((M) => I.toLowerCase() === M.toLowerCase());
  }), [p, x.txTypes]), f = B(async () => {
    try {
      const T = await i({ limit: t * 3, offset: C });
      b(T.transactions), g(T.total), n?.(T), E(null);
    } catch (T) {
      E(T instanceof Error ? T.message : "Failed to load history");
    }
  }, [t, C, i, n]);
  O(() => {
    A(0);
  }, [m]), O(() => {
    f();
  }, [f]), O(() => {
    if (s <= 0) return;
    const T = setInterval(f, s);
    return () => clearInterval(T);
  }, [s, f]);
  const y = x.txTypes === null ? w : _.length, v = Math.ceil(y / t), N = Math.floor(C / t) + 1, P = (T) => {
    const I = (T - 1) * t;
    A(Math.max(0, Math.min(I, Math.max(0, y - t))));
  }, L = (T) => {
    h(T);
  };
  if (k || c)
    return /* @__PURE__ */ d("div", { className: `cedros-tx-history cedros-tx-history-error ${o}`, children: [
      /* @__PURE__ */ r("p", { className: "cedros-tx-error", children: k || c }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-tx-retry",
          onClick: () => {
            u(), E(null), f();
          },
          children: "Retry"
        }
      )
    ] });
  if (l && p.length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-tx-history cedros-tx-history-loading ${o}`, children: [
      /* @__PURE__ */ r("span", { className: "cedros-tx-loading-indicator" }),
      /* @__PURE__ */ r("span", { className: "cedros-tx-loading-text", children: "Loading transactions..." })
    ] });
  const R = (T) => T.txTypes === null ? p.length : p.filter((I) => {
    const M = I.txType || "";
    return T.txTypes.some((U) => M.toLowerCase() === U.toLowerCase());
  }).length;
  return /* @__PURE__ */ d("div", { className: `cedros-tx-history ${o}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-tx-header", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-tx-title", children: "Transaction History" }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-tx-refresh",
          onClick: f,
          disabled: l,
          title: "Refresh",
          children: l ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-tx-tabs", children: Pr.map((T) => {
      const I = R(T), M = m === T.key;
      return /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: `cedros-tx-tab ${M ? "cedros-tx-tab-active" : ""}`,
          onClick: () => L(T.key),
          children: [
            T.label,
            I > 0 && /* @__PURE__ */ r("span", { className: "cedros-tx-tab-count", children: I })
          ]
        },
        T.key
      );
    }) }),
    _.length === 0 ? /* @__PURE__ */ d("div", { className: "cedros-tx-empty", children: [
      /* @__PURE__ */ r("p", { className: "cedros-tx-empty-message", children: m === "all" ? "No transactions yet." : `No ${x.label.toLowerCase()} found.` }),
      m === "all" && /* @__PURE__ */ r("p", { className: "cedros-tx-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-tx-list", children: _.slice(0, t).map((T) => {
        const I = T.amountLamports >= 0;
        return /* @__PURE__ */ d(
          "div",
          {
            className: `cedros-tx-item ${I ? "cedros-tx-item-positive" : "cedros-tx-item-negative"}`,
            onClick: () => a?.(T),
            onKeyDown: (M) => {
              (M.key === "Enter" || M.key === " ") && (M.preventDefault(), a?.(T));
            },
            role: a ? "button" : void 0,
            tabIndex: a ? 0 : void 0,
            children: [
              /* @__PURE__ */ r(
                "div",
                {
                  className: `cedros-tx-icon ${I ? "cedros-tx-icon-positive" : "cedros-tx-icon-negative"}`,
                  children: Tu(T.txType, I)
                }
              ),
              /* @__PURE__ */ d("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-tx-type", children: Pu(T.txType) }),
                  /* @__PURE__ */ r(
                    "span",
                    {
                      className: `cedros-tx-amount ${I ? "cedros-tx-amount-positive" : "cedros-tx-amount-negative"}`,
                      children: _u(T.amountLamports, T.currency)
                    }
                  )
                ] }),
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-tx-description", children: T.description }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-date", children: Lu(T.createdAt) })
                ] })
              ] })
            ]
          },
          T.id
        );
      }) }),
      v > 1 && /* @__PURE__ */ d("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => P(N - 1),
            disabled: N <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ d("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          N,
          " of ",
          v
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => P(N + 1),
            disabled: N >= v,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Ho() {
  const e = $e(), [t, s] = S(!1), [o, n] = S(null), [a, i] = S(null), l = q(() => e ? new ne({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), c = B(() => {
    n(null);
  }, []), u = B(async () => {
    if (!l)
      throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
    try {
      return await l.get("/wallet/withdraw/balances");
    } catch (b) {
      const w = z(b, "Failed to fetch wallet balances");
      throw n(w.message), w;
    }
  }, [l]), m = B(
    async (b, w) => {
      if (!l)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const g = await l.post("/wallet/withdraw/sol", {
          destination: b,
          amount_lamports: w
        });
        return i(g), g;
      } catch (g) {
        const C = z(g, "Failed to withdraw SOL");
        throw n(C.message), C;
      } finally {
        s(!1);
      }
    },
    [l]
  ), h = B(
    async (b, w, g) => {
      if (!l)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const C = await l.post("/wallet/withdraw/spl", {
          destination: b,
          token_mint: w,
          amount: g
        });
        return i(C), C;
      } catch (C) {
        const A = z(C, "Failed to withdraw token");
        throw n(A.message), A;
      } finally {
        s(!1);
      }
    },
    [l]
  ), p = B(
    async (b = 10, w = 0) => {
      if (!l)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      try {
        const g = Math.max(1, Math.min(100, Math.trunc(b))), C = Math.max(0, Math.trunc(w)), A = new URLSearchParams({
          limit: String(g),
          offset: String(C)
        });
        return await l.get(
          `/wallet/withdraw/history?${A}`
        );
      } catch (g) {
        const C = z(g, "Failed to fetch withdrawal history");
        throw n(C.message), C;
      }
    },
    [l]
  );
  return {
    withdrawSol: m,
    withdrawSpl: h,
    getBalances: u,
    getHistory: p,
    isSubmitting: t,
    error: o,
    clearError: c,
    lastResult: a
  };
}
const Tr = "So11111111111111111111111111111111111111112", Bu = {
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
function Ru(e) {
  return e.length < 32 || e.length > 50 ? !1 : /^[1-9A-HJ-NP-Za-km-z]+$/.test(e);
}
function Br(e) {
  return e.length <= 16 ? e : `${e.slice(0, 6)}...${e.slice(-6)}`;
}
function Nt(e, t) {
  return (Number(e) / Math.pow(10, t)).toLocaleString(void 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(t, 6)
  });
}
function jh({
  onSuccess: e,
  onError: t,
  onCancel: s,
  className: o = ""
}) {
  const n = $e(), { withdrawSol: a, withdrawSpl: i, getBalances: l, isSubmitting: c, error: u, clearError: m } = Ho(), [h, p] = S("loading"), [b, w] = S([]), [g, C] = S(null), [A, k] = S(""), [E, x] = S(""), [_, f] = S(null), [y, v] = S(null), [N, P] = S(null), L = n?.config.solana?.network ?? "mainnet-beta", R = q(() => {
    if (!_?.txSignature) return "";
    const D = `https://explorer.solana.com/tx/${_.txSignature}`;
    return L === "mainnet-beta" ? D : `${D}?cluster=${encodeURIComponent(L)}`;
  }, [_, L]), T = q(() => {
    if (!g || !E) return "0";
    const D = parseFloat(E);
    return isNaN(D) || D <= 0 ? "0" : Math.floor(D * Math.pow(10, g.decimals)).toString();
  }, [E, g]);
  O(() => {
    if (!n) return;
    let D = !1;
    return (async () => {
      try {
        const F = await l();
        if (D) return;
        const K = [];
        F.solLamports > 0 && K.push({
          symbol: "SOL",
          mint: Tr,
          decimals: 9,
          rawBalance: String(F.solLamports),
          displayBalance: Nt(String(F.solLamports), 9)
        });
        for (const re of F.tokens) {
          const ce = Bu[re.mint] ?? Br(re.mint);
          K.push({
            symbol: ce,
            mint: re.mint,
            decimals: re.decimals,
            rawBalance: re.amount,
            displayBalance: Nt(re.amount, re.decimals)
          });
        }
        w(K), p((K.length > 0, "select"));
      } catch {
        D || (P("Failed to load wallet balances"), p("select"));
      }
    })(), () => {
      D = !0;
    };
  }, [n, l]);
  const I = B(
    (D) => {
      C(D), p("form"), m(), v(null), x("");
    },
    [m]
  ), M = B(() => {
    if (!g) return;
    const D = Number(g.rawBalance) / Math.pow(10, g.decimals);
    g.mint === Tr ? x(String(Math.max(0, D - 0.01))) : x(String(D));
  }, [g]), U = B(() => {
    if (v(null), !A.trim()) {
      v("Destination address is required");
      return;
    }
    if (!Ru(A.trim())) {
      v("Invalid Solana address");
      return;
    }
    if (!E || parseFloat(E) <= 0 || isNaN(parseFloat(E))) {
      v("Please enter a valid amount");
      return;
    }
    if (T === "0") {
      v("Amount is too small");
      return;
    }
    p("confirm");
  }, [A, E, T]), W = B(async () => {
    if (g) {
      p("processing"), m();
      try {
        let D;
        g.mint === Tr ? D = await a(A.trim(), Number(T)) : D = await i(A.trim(), g.mint, T), f(D), p("success"), e?.(D);
      } catch (D) {
        p("confirm"), t?.(D instanceof Error ? D : new Error(String(D)));
      }
    }
  }, [
    g,
    A,
    T,
    a,
    i,
    m,
    e,
    t
  ]), j = B(() => {
    m(), v(null), h === "form" ? (p("select"), C(null), x(""), k("")) : h === "confirm" && p("form");
  }, [h, m]), H = B(() => {
    p("select"), C(null), k(""), x(""), f(null), m(), v(null);
  }, [m]);
  return n ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal ${o}`, children: [
    h === "loading" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ r(Q, {}),
      /* @__PURE__ */ r("p", { className: "cedros-withdrawal-processing-text", children: "Loading wallet balances..." })
    ] }),
    h === "select" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-select", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Withdraw" }),
        /* @__PURE__ */ r("p", { className: "cedros-withdrawal-subtitle", children: "Select a token to withdraw" })
      ] }),
      N && /* @__PURE__ */ r(ae, { error: N }),
      b.length === 0 && !N && /* @__PURE__ */ r("p", { className: "cedros-withdrawal-empty", children: "No tokens found in your wallet." }),
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
      s && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-ghost cedros-withdrawal-cancel",
          onClick: s,
          children: "Cancel"
        }
      )
    ] }),
    h === "form" && g && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-form", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: j,
            children: "Back"
          }
        ),
        /* @__PURE__ */ d("h3", { className: "cedros-withdrawal-title", children: [
          "Withdraw ",
          g.symbol
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-balance-hint", children: [
        "Balance: ",
        g.displayBalance,
        " ",
        g.symbol
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
            onChange: (D) => k(D.target.value),
            autoComplete: "off",
            spellCheck: !1
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ d("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-amount", children: [
          "Amount (",
          g.symbol,
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
              value: E,
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
              onClick: M,
              children: "Max"
            }
          )
        ] })
      ] }),
      (y || u) && /* @__PURE__ */ r(ae, { error: y || u || "" }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-withdrawal-submit",
          onClick: U,
          children: "Review Withdrawal"
        }
      )
    ] }),
    h === "confirm" && g && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-confirm", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: j,
            disabled: c,
            children: "Back"
          }
        ),
        /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Confirm Withdrawal" })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary", children: [
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Token" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", children: g.symbol })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Amount" }),
          /* @__PURE__ */ d("span", { className: "cedros-withdrawal-summary-value", children: [
            Nt(T, g.decimals),
            " ",
            g.symbol
          ] })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Destination" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", title: A, children: Br(A) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Est. Fee" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", children: "~0.000005 SOL" })
        ] })
      ] }),
      u && /* @__PURE__ */ r(ae, { error: u }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: j,
            disabled: c,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: W,
            disabled: c,
            children: c ? "Sending..." : "Confirm & Send"
          }
        )
      ] })
    ] }),
    h === "processing" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ r(Q, {}),
      /* @__PURE__ */ d("p", { className: "cedros-withdrawal-processing-text", children: [
        "Sending ",
        g?.symbol,
        "..."
      ] })
    ] }),
    h === "success" && _ && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-success", children: [
      /* @__PURE__ */ r("div", { className: "cedros-withdrawal-success-icon", children: "✓" }),
      /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Withdrawal Complete" }),
      /* @__PURE__ */ d("p", { className: "cedros-withdrawal-subtitle", children: [
        Nt(T, g?.decimals ?? 9),
        " ",
        g?.symbol,
        " ",
        "sent"
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-tx", children: [
        /* @__PURE__ */ r("span", { className: "cedros-withdrawal-tx-label", children: "Transaction" }),
        /* @__PURE__ */ r(
          "a",
          {
            className: "cedros-withdrawal-tx-link",
            href: R,
            target: "_blank",
            rel: "noreferrer",
            children: Br(_.txSignature)
          }
        )
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-withdrawal-done",
          onClick: H,
          children: "Done"
        }
      )
    ] })
  ] }) : null;
}
function Iu(e, t) {
  if (e === "sol") return "SOL";
  if (!t) return "SPL";
  const s = is.find((o) => o.mint === t);
  return s ? s.symbol : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function Mu(e, t) {
  const s = Number(e);
  if (Number.isNaN(s)) return e;
  const o = Oo(t), n = s / Math.pow(10, o);
  return t === "SOL" ? `${n.toFixed(4)} SOL` : `${n.toFixed(2)} ${t}`;
}
function Uu(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function Du(e) {
  const t = new Date(e), s = /* @__PURE__ */ new Date(), o = s.getTime() - t.getTime();
  if (o < 0) return "Just now";
  const n = Math.floor(o / (1e3 * 60 * 60 * 24));
  if (n === 0) {
    const a = Math.floor(o / 36e5);
    if (a === 0) {
      const i = Math.floor(o / 6e4);
      return i < 1 ? "Just now" : `${i}m ago`;
    }
    return `${a}h ago`;
  }
  return n === 1 ? "Yesterday" : n < 7 ? `${n}d ago` : t.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: t.getFullYear() !== s.getFullYear() ? "numeric" : void 0
  });
}
function Vh({
  pageSize: e = 10,
  className: t = "",
  onTransactionClick: s,
  explorerUrl: o = "https://solscan.io"
}) {
  const n = o.startsWith("https://") ? o : "https://solscan.io", { getHistory: a, error: i, clearError: l } = Ho(), [c, u] = S([]), [m, h] = S(0), [p, b] = S(0), [w, g] = S(!1), [C, A] = S(null), k = B(async () => {
    g(!0);
    try {
      const f = await a(e, p);
      u(f.items), h(f.total), A(null);
    } catch (f) {
      A(f instanceof Error ? f.message : "Failed to load withdrawal history");
    } finally {
      g(!1);
    }
  }, [e, p, a]);
  O(() => {
    k();
  }, [k]);
  const E = Math.ceil(m / e), x = Math.floor(p / e) + 1, _ = (f) => {
    const y = (f - 1) * e;
    b(Math.max(0, Math.min(y, Math.max(0, m - e))));
  };
  return C || i ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-error ${t}`, children: [
    /* @__PURE__ */ r("p", { className: "cedros-withdrawal-error", children: C || i }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-withdrawal-retry",
        onClick: () => {
          l(), A(null), k();
        },
        children: "Retry"
      }
    )
  ] }) : w && c.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-loading ${t}`, children: [
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
          onClick: k,
          disabled: w,
          title: "Refresh",
          children: w ? "..." : "↻"
        }
      )
    ] }),
    c.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-tx-empty", children: /* @__PURE__ */ r("p", { className: "cedros-tx-empty-message", children: "No withdrawal history yet." }) }) : /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-tx-list", children: c.map((f) => {
        const y = Iu(f.tokenType, f.tokenMint);
        return /* @__PURE__ */ d(
          "div",
          {
            className: "cedros-tx-item cedros-tx-item-negative",
            onClick: () => s?.(f),
            onKeyDown: (v) => {
              (v.key === "Enter" || v.key === " ") && (v.preventDefault(), s?.(f));
            },
            role: s ? "button" : void 0,
            tabIndex: s ? 0 : void 0,
            children: [
              /* @__PURE__ */ r("div", { className: "cedros-tx-icon cedros-tx-icon-negative", children: "↑" }),
              /* @__PURE__ */ d("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ d("span", { className: "cedros-tx-type", children: [
                    y,
                    " Withdrawal"
                  ] }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-amount cedros-tx-amount-negative", children: Mu(f.amount, y) })
                ] }),
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ d("span", { className: "cedros-tx-description", children: [
                    "To",
                    " ",
                    /* @__PURE__ */ r(
                      "a",
                      {
                        href: `${n}/account/${f.destination}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (v) => v.stopPropagation(),
                        children: Uu(f.destination)
                      }
                    ),
                    " · ",
                    /* @__PURE__ */ r(
                      "a",
                      {
                        href: `${n}/tx/${f.txSignature}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (v) => v.stopPropagation(),
                        children: "tx"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-date", children: Du(f.createdAt) })
                ] })
              ] })
            ]
          },
          f.id
        );
      }) }),
      E > 1 && /* @__PURE__ */ d("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => _(x - 1),
            disabled: x <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ d("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          x,
          " of ",
          E
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => _(x + 1),
            disabled: x >= E,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Hh({
  brandLogo: e,
  brandName: t,
  title: s = "Welcome back",
  subtitle: o = "Login with your Apple or Google account",
  termsText: n,
  onSuccess: a,
  defaultTab: i = "login",
  children: l,
  className: c = ""
}) {
  return /* @__PURE__ */ d("div", { className: `cedros-full-page-layout ${c}`, children: [
    (e || t) && /* @__PURE__ */ d("div", { className: "cedros-brand-header", children: [
      e,
      t && /* @__PURE__ */ r("span", { className: "cedros-brand-name", children: t })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-full-page-card", children: [
      /* @__PURE__ */ d("div", { className: "cedros-full-page-header", children: [
        /* @__PURE__ */ r("h1", { className: "cedros-full-page-title", children: s }),
        o && /* @__PURE__ */ r("p", { className: "cedros-full-page-subtitle", children: o })
      ] }),
      l ?? /* @__PURE__ */ r(rs, { defaultTab: i, onSuccess: a })
    ] }),
    n && /* @__PURE__ */ r("p", { className: "cedros-terms-footer", children: n })
  ] });
}
function $h({
  brandName: e = "Your Brand",
  brandLogo: t,
  tagline: s = "Your tagline goes here. Make it compelling.",
  title: o = "Sign in",
  subtitle: n = "Enter your credentials to access your account",
  onSuccess: a,
  defaultTab: i = "login",
  children: l,
  className: c = ""
}) {
  return /* @__PURE__ */ d("div", { className: `cedros-split-page-layout ${c}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-split-page-brand", children: /* @__PURE__ */ d("div", { className: "cedros-split-page-brand-content", children: [
      t ?? /* @__PURE__ */ r("div", { className: "cedros-split-page-logo", children: e.charAt(0).toUpperCase() }),
      /* @__PURE__ */ r("h1", { className: "cedros-split-page-brand-name", children: e }),
      s && /* @__PURE__ */ r("p", { className: "cedros-split-page-tagline", children: s })
    ] }) }),
    /* @__PURE__ */ r("div", { className: "cedros-split-page-form", children: /* @__PURE__ */ d("div", { className: "cedros-split-page-form-content", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-split-page-title", children: o }),
      n && /* @__PURE__ */ r("p", { className: "cedros-split-page-subtitle", children: n }),
      l ?? /* @__PURE__ */ r(rs, { defaultTab: i, onSuccess: a })
    ] }) })
  ] });
}
function Gh() {
  const { config: e, _internal: t } = ee(), [s, o] = S({
    allowed: !1,
    reason: void 0,
    isLoading: !1,
    error: null
  }), n = q(
    () => new Ea(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      t?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t]
  ), a = B(
    async (c) => {
      o((u) => ({ ...u, isLoading: !0, error: null }));
      try {
        const u = await n.authorize(c), m = {
          allowed: u.allowed,
          reason: u.reason,
          isLoading: !1,
          error: null
        };
        return o(m), m;
      } catch (u) {
        const m = {
          allowed: !1,
          reason: void 0,
          isLoading: !1,
          error: u
        };
        return o(m), m;
      }
    },
    [n]
  ), i = B(
    async (c) => (await a(c)).allowed,
    [a]
  ), l = B(() => {
    o({
      allowed: !1,
      reason: void 0,
      isLoading: !1,
      error: null
    });
  }, []);
  return {
    authorize: i,
    lastCheck: s,
    clearCheck: l,
    checkAuthorization: a
  };
}
function Qh() {
  const { listAllWallets: e, createDerivedWallet: t, deleteDerivedWallet: s } = nt(), [o, n] = S([]), [a, i] = S(!1), [l, c] = S(null), u = B(async () => {
    i(!0), c(null);
    try {
      const b = await e();
      n(b.wallets);
    } catch (b) {
      const w = b instanceof Error ? b.message : "Failed to list wallets";
      c(w);
    } finally {
      i(!1);
    }
  }, [e]), m = B(
    async (b) => {
      i(!0), c(null);
      try {
        const w = await t({ label: b });
        return await u(), w;
      } catch (w) {
        const g = w instanceof Error ? w.message : "Failed to create wallet";
        throw c(g), w;
      } finally {
        i(!1);
      }
    },
    [t, u]
  ), h = B(
    async (b) => {
      i(!0), c(null);
      try {
        await s(b), await u();
      } catch (w) {
        const g = w instanceof Error ? w.message : "Failed to delete wallet";
        throw c(g), w;
      } finally {
        i(!1);
      }
    },
    [s, u]
  ), p = B(() => c(null), []);
  return {
    wallets: o,
    isLoading: a,
    createWallet: m,
    deleteWallet: h,
    refresh: u,
    error: l,
    clearError: p
  };
}
function Kh() {
  const e = $e(), [t, s] = S(!1), [o, n] = S(null), [a, i] = S(null), l = q(() => e ? new ne({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), c = B(async () => {
    if (!l)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      const h = await l.get("/wallet/pending-recovery");
      i(h);
    } catch (h) {
      const p = z(h, "Failed to fetch pending recovery");
      throw n(p.message), p;
    } finally {
      s(!1);
    }
  }, [l]), u = B(async () => {
    if (!l)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      const h = { confirmed: !0 };
      await l.post("/wallet/acknowledge-recovery", h), i(null);
    } catch (h) {
      const p = z(h, "Failed to acknowledge recovery");
      throw n(p.message), p;
    } finally {
      s(!1);
    }
  }, [l]), m = B(() => n(null), []);
  return O(() => {
    l && e?.authState === "authenticated" && c().catch(() => {
    });
  }, [l, e?.authState, c]), {
    hasPendingRecovery: a?.hasPendingRecovery ?? !1,
    recoveryType: a?.recoveryType ?? null,
    recoveryPhrase: a?.recoveryPhrase ?? null,
    expiresAt: a?.expiresAt ? new Date(a.expiresAt) : null,
    fetchPendingRecovery: c,
    acknowledgeRecovery: u,
    isLoading: t,
    error: o,
    clearError: m
  };
}
function Yh(e = {}) {
  const { onExternalSign: t } = e, { solanaPubkey: s, hasExternalWallet: o, status: n, isUnlocked: a } = Wt(), {
    signTransaction: i,
    isSigning: l,
    error: c,
    clearError: u
  } = Nl(), m = q(() => o && t ? "external" : n === "enrolled_locked" || n === "enrolled_unlocked" ? "sss" : "none", [o, t, n]), h = m !== "none", p = n === "enrolled_locked" || n === "enrolled_unlocked";
  return {
    signTransaction: B(
      async (w, g) => {
        if (m === "external") {
          if (!t)
            throw new Error("External wallet signing callback not provided");
          return t(w);
        }
        if (m === "sss") {
          if (!g && !a)
            throw new Error(
              "Credential required for signing. Unlock wallet first or provide credential."
            );
          return g ? i(w, g) : i(w);
        }
        throw new Error("No signing method available. Enroll a wallet first.");
      },
      [m, t, a, i]
    ),
    signingMethod: m,
    canSign: h,
    isSigning: l,
    publicKey: s,
    hasExternalWallet: o,
    hasSssWallet: p,
    isSssUnlocked: a,
    error: c,
    clearError: u
  };
}
function Zh() {
  const { config: e, _internal: t } = ee(), [s, o] = S(null), [n, a] = S(!1), [i, l] = S(null), c = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), u = B(async () => {
    a(!0), l(null);
    try {
      await c.post("/welcome-completed", {});
    } catch (h) {
      const p = h instanceof Error ? h : new Error(String(h));
      throw l(p), p;
    } finally {
      a(!1);
    }
  }, [c]), m = B(() => {
    o(null);
  }, []);
  return {
    postLoginAction: s,
    setPostLoginAction: o,
    markWelcomeCompleted: u,
    clearPostLogin: m,
    isLoading: n,
    error: i
  };
}
function Xh() {
  const { config: e, _internal: t } = ee(), [s, o] = S(!1), [n, a] = S(null), [i, l] = S(null), [c, u] = S(null), [m, h] = S(null), [p, b] = S(null), w = p !== null && p !== "none", g = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), C = B(async () => {
    o(!0), a(null);
    try {
      const k = await g.get("/kyc/status", {
        credentials: "include"
      });
      return l(k.status), u(k.verifiedAt ?? null), h(k.expiresAt ?? null), b(k.enforcementMode), k;
    } catch (k) {
      const E = k instanceof Error ? k : new Error(String(k));
      throw a(E), E;
    } finally {
      o(!1);
    }
  }, [g]), A = B(async () => {
    o(!0), a(null);
    try {
      const k = await g.post(
        "/kyc/start",
        void 0,
        { credentials: "include" }
      );
      return l("pending"), k.redirectUrl;
    } catch (k) {
      const E = k instanceof Error ? k : new Error(String(k));
      throw a(E), E;
    } finally {
      o(!1);
    }
  }, [g]);
  return {
    status: i,
    verifiedAt: c,
    expiresAt: m,
    isRequired: w,
    enforcementMode: p,
    fetchStatus: C,
    startVerification: A,
    isLoading: s,
    error: n
  };
}
function Fu() {
  const { config: e, _internal: t } = ee(), [s, o] = S(!1), [n, a] = S(null), [i, l] = S(null), [c, u] = S([]), [m, h] = S(0), p = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), b = B(async () => {
    o(!0), a(null);
    try {
      const C = await p.get("/referral/rewards", {
        credentials: "include"
      });
      return l(C), C;
    } catch (C) {
      const A = C instanceof Error ? C : new Error(String(C));
      throw a(A), A;
    } finally {
      o(!1);
    }
  }, [p]), w = B(
    async (C = 10, A = 0) => {
      o(!0), a(null);
      try {
        const k = await p.get(
          `/referral/rewards/history?limit=${C}&offset=${A}`,
          { credentials: "include" }
        );
        return u(k.items), h(k.total), k;
      } catch (k) {
        const E = k instanceof Error ? k : new Error(String(k));
        throw a(E), E;
      } finally {
        o(!1);
      }
    },
    [p]
  ), g = B(
    async (C) => {
      o(!0), a(null);
      try {
        await p.post(
          "/referral/payout-wallet",
          { walletAddress: C },
          { credentials: "include" }
        ), l(
          (A) => A && { ...A, payoutWalletAddress: C }
        );
      } catch (A) {
        const k = A instanceof Error ? A : new Error(String(A));
        throw a(k), k;
      } finally {
        o(!1);
      }
    },
    [p]
  );
  return {
    rewards: i,
    history: c,
    historyTotal: m,
    fetchRewards: b,
    fetchHistory: w,
    setPayoutWallet: g,
    isLoading: s,
    error: n
  };
}
function Rr(e, t) {
  return t === "SOL" ? (e / 1e9).toFixed(4) + " SOL" : "$" + (e / 1e6).toFixed(2);
}
function Ou(e) {
  try {
    return new Date(e).toLocaleDateString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return e;
  }
}
const Wu = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
function zu(e) {
  return Wu.test(e);
}
function qu(e) {
  switch (e) {
    case "signup":
      return "Sign-up";
    case "spend":
      return "Spend";
    case "first_spend":
      return "First Spend";
    default:
      return e;
  }
}
function ju({ status: e }) {
  const s = {
    pending: "cedros-rewards-panel__badge--pending",
    completed: "cedros-rewards-panel__badge--completed",
    failed: "cedros-rewards-panel__badge--failed",
    credited: "cedros-rewards-panel__badge--credited"
  }[e] ?? "cedros-rewards-panel__badge--pending";
  return /* @__PURE__ */ r("span", { className: `cedros-rewards-panel__badge ${s}`, children: e.charAt(0).toUpperCase() + e.slice(1) });
}
const kt = 10;
function Jh({ explorerUrl: e = "https://explorer.solana.com", className: t }) {
  const {
    rewards: s,
    history: o,
    historyTotal: n,
    fetchRewards: a,
    fetchHistory: i,
    setPayoutWallet: l,
    isLoading: c,
    error: u
  } = Fu(), [m, h] = S(0), [p, b] = S(""), [w, g] = S(null), [C, A] = S(!1), [k, E] = S(!1);
  O(() => {
    a().catch(() => {
    }), i(kt, 0).catch(() => {
    });
  }, [a, i]), O(() => {
    s?.payoutWalletAddress != null && b(s.payoutWalletAddress);
  }, [s?.payoutWalletAddress]);
  const x = B(
    (v) => {
      h(v), i(kt, v * kt).catch(() => {
      });
    },
    [i]
  ), _ = Math.ceil(n / kt), f = B(async () => {
    const v = p.trim();
    if (v !== "" && !zu(v)) {
      g("Invalid address. Must be a base58 string between 32 and 44 characters.");
      return;
    }
    g(null), A(!0), E(!1);
    try {
      await l(v === "" ? null : v), E(!0);
    } catch (N) {
      g(N instanceof Error ? N.message : "Failed to save wallet address.");
    } finally {
      A(!1);
    }
  }, [p, l]), y = s?.rewardType === "direct_payout" ? "Direct Payout" : "Credits";
  return /* @__PURE__ */ d(
    "div",
    {
      className: `cedros-rewards-panel ${t ?? ""}`.trim(),
      "aria-label": "Rewards dashboard",
      children: [
        u && /* @__PURE__ */ r("div", { className: "cedros-rewards-panel__error", role: "alert", children: u.message }),
        /* @__PURE__ */ d(
          "section",
          {
            className: "cedros-rewards-panel__summary",
            "aria-label": "Rewards summary",
            children: [
              /* @__PURE__ */ d("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-label", children: "Total Earned" }),
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-value", children: s ? Rr(s.totalEarned, s.currency) : "—" })
              ] }),
              /* @__PURE__ */ d("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-label", children: "Pending Payouts" }),
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-value", children: s ? `${Rr(s.pendingAmount, s.currency)} (${s.pendingCount})` : "—" })
              ] }),
              /* @__PURE__ */ d("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-label", children: "Referrals" }),
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-value", children: s ? String(s.referralCount) : "—" })
              ] }),
              /* @__PURE__ */ d("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-label", children: "Reward Type" }),
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-value", children: /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__type-badge", children: y }) })
              ] })
            ]
          }
        ),
        s?.rewardType === "direct_payout" && /* @__PURE__ */ d(
          "section",
          {
            className: "cedros-rewards-panel__wallet-section",
            "aria-label": "Payout wallet",
            children: [
              /* @__PURE__ */ r("h3", { className: "cedros-rewards-panel__section-title", children: "Payout Wallet" }),
              /* @__PURE__ */ d("div", { className: "cedros-rewards-panel__wallet-current", children: [
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__wallet-label", children: "Current address:" }),
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__wallet-address", children: s.payoutWalletAddress ?? "Not set" })
              ] }),
              /* @__PURE__ */ d("div", { className: "cedros-rewards-panel__wallet-form", children: [
                /* @__PURE__ */ r(
                  "label",
                  {
                    htmlFor: "cedros-payout-wallet-input",
                    className: "cedros-rewards-panel__wallet-input-label",
                    children: "Wallet address"
                  }
                ),
                /* @__PURE__ */ r(
                  "input",
                  {
                    id: "cedros-payout-wallet-input",
                    type: "text",
                    className: "cedros-rewards-panel__wallet-input",
                    value: p,
                    onChange: (v) => {
                      b(v.target.value), g(null), E(!1);
                    },
                    placeholder: "Base58 Solana address",
                    "aria-describedby": w ? "cedros-wallet-error" : void 0,
                    disabled: C
                  }
                ),
                /* @__PURE__ */ r(
                  "button",
                  {
                    type: "button",
                    className: "cedros-rewards-panel__wallet-save-btn",
                    onClick: f,
                    disabled: C || c,
                    children: C ? "Saving..." : "Save"
                  }
                )
              ] }),
              w && /* @__PURE__ */ r(
                "div",
                {
                  id: "cedros-wallet-error",
                  className: "cedros-rewards-panel__wallet-error",
                  role: "alert",
                  children: w
                }
              ),
              k && !w && /* @__PURE__ */ r(
                "div",
                {
                  className: "cedros-rewards-panel__wallet-success",
                  role: "status",
                  children: "Wallet address saved."
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ d(
          "section",
          {
            className: "cedros-rewards-panel__history-section",
            "aria-label": "Reward history",
            children: [
              /* @__PURE__ */ r("h3", { className: "cedros-rewards-panel__section-title", children: "History" }),
              c && o.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-rewards-panel__loading", "aria-busy": "true", children: "Loading..." }) : o.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-rewards-panel__empty", children: "No rewards yet." }) : /* @__PURE__ */ d(X, { children: [
                /* @__PURE__ */ r("div", { className: "cedros-rewards-panel__table-wrapper", role: "region", "aria-label": "Reward history table", tabIndex: 0, children: /* @__PURE__ */ d("table", { className: "cedros-rewards-panel__table", children: [
                  /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ d("tr", { children: [
                    /* @__PURE__ */ r("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Date" }),
                    /* @__PURE__ */ r("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Type" }),
                    /* @__PURE__ */ r("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Amount" }),
                    /* @__PURE__ */ r("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Status" }),
                    /* @__PURE__ */ r("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Transaction" })
                  ] }) }),
                  /* @__PURE__ */ r("tbody", { children: o.map((v) => /* @__PURE__ */ d("tr", { className: "cedros-rewards-panel__tr", children: [
                    /* @__PURE__ */ r("td", { className: "cedros-rewards-panel__td", children: Ou(v.createdAt) }),
                    /* @__PURE__ */ r("td", { className: "cedros-rewards-panel__td", children: qu(v.triggerType) }),
                    /* @__PURE__ */ r("td", { className: "cedros-rewards-panel__td", children: Rr(v.amount, v.currency) }),
                    /* @__PURE__ */ r("td", { className: "cedros-rewards-panel__td", children: /* @__PURE__ */ r(ju, { status: v.status }) }),
                    /* @__PURE__ */ r("td", { className: "cedros-rewards-panel__td", children: v.txSignature ? /* @__PURE__ */ d(
                      "a",
                      {
                        href: `${e}/tx/${v.txSignature}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "cedros-rewards-panel__tx-link",
                        "aria-label": `View transaction ${v.txSignature.slice(0, 8)}... on Solana explorer`,
                        children: [
                          v.txSignature.slice(0, 8),
                          "..."
                        ]
                      }
                    ) : /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__tx-none", children: "—" }) })
                  ] }, v.id)) })
                ] }) }),
                _ > 1 && /* @__PURE__ */ d(
                  "div",
                  {
                    className: "cedros-rewards-panel__pagination",
                    role: "navigation",
                    "aria-label": "History pagination",
                    children: [
                      /* @__PURE__ */ r(
                        "button",
                        {
                          type: "button",
                          className: "cedros-rewards-panel__page-btn",
                          onClick: () => x(m - 1),
                          disabled: m === 0 || c,
                          "aria-label": "Previous page",
                          children: "Previous"
                        }
                      ),
                      /* @__PURE__ */ d("span", { className: "cedros-rewards-panel__page-info", children: [
                        m + 1,
                        " / ",
                        _
                      ] }),
                      /* @__PURE__ */ r(
                        "button",
                        {
                          type: "button",
                          className: "cedros-rewards-panel__page-btn",
                          onClick: () => x(m + 1),
                          disabled: m >= _ - 1 || c,
                          "aria-label": "Next page",
                          children: "Next"
                        }
                      )
                    ]
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
}
function em({
  status: e,
  startVerification: t,
  className: s
}) {
  const [o, n] = S(!1), [a, i] = S(null), l = B(async () => {
    n(!0), i(null);
    try {
      const m = await t();
      m && (window.location.href = m);
    } catch (m) {
      i(
        m instanceof Error ? m.message : "Failed to start verification"
      );
    } finally {
      n(!1);
    }
  }, [t]);
  if (e === "verified")
    return null;
  let c;
  switch (e) {
    case "pending":
      c = "Your identity verification is being processed.";
      break;
    case "failed":
      c = "Identity verification failed. Please try again.";
      break;
    case "expired":
      c = "Your identity verification has expired. Please verify again.";
      break;
    case "canceled":
      c = "Verification was canceled. Please try again.";
      break;
    default:
      c = "Identity verification is required to continue.";
      break;
  }
  const u = e !== "pending";
  return /* @__PURE__ */ d(
    "div",
    {
      className: `cedros-kyc-banner ${s ?? ""}`,
      role: "alert",
      children: [
        /* @__PURE__ */ d("div", { className: "cedros-kyc-banner-content", children: [
          /* @__PURE__ */ r("span", { className: "cedros-kyc-banner-message", children: c }),
          u && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-kyc-banner-button",
              onClick: l,
              disabled: o,
              children: o ? "Starting..." : "Verify Identity"
            }
          )
        ] }),
        a && /* @__PURE__ */ r("div", { className: "cedros-kyc-banner-error", children: a })
      ]
    }
  );
}
const Vu = 3e3, Hu = 6e4;
function $u(e) {
  switch (e) {
    case "verified":
      return "Identity verified successfully!";
    case "failed":
      return "Verification failed. You can try again.";
    case "expired":
      return "Your identity verification has expired.";
    case "canceled":
      return "Verification was canceled.";
    default:
      return "Verification was canceled.";
  }
}
function tm({ fetchStatus: e, onComplete: t, className: s }) {
  const [o, n] = S(null), [a, i] = S(!1), l = J(t);
  l.current = t;
  const c = J(e);
  c.current = e, O(() => {
    let m = !1, h = null;
    const p = setTimeout(() => {
      i(!0), h !== null && clearInterval(h);
    }, Hu), b = async () => {
      try {
        const w = await c.current();
        if (m) return;
        n(w.status), w.status !== "pending" && (clearTimeout(p), h !== null && clearInterval(h), l.current?.(w.status));
      } catch {
      }
    };
    return b(), h = setInterval(b, Vu), () => {
      m = !0, clearTimeout(p), h !== null && clearInterval(h);
    };
  }, []);
  const u = !o || o === "pending";
  return /* @__PURE__ */ r("div", { className: `cedros-kyc-callback ${s ?? ""}`, role: "status", "aria-live": "polite", children: a && u ? /* @__PURE__ */ d("div", { className: "cedros-kyc-callback-content", children: [
    /* @__PURE__ */ r("p", { className: "cedros-kyc-callback-message", children: "Verification is taking longer than expected. Please refresh or check back later." }),
    t && /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-kyc-callback-continue",
        onClick: () => t("pending"),
        children: "Continue"
      }
    )
  ] }) : u ? /* @__PURE__ */ d("div", { className: "cedros-kyc-callback-content", children: [
    /* @__PURE__ */ r("span", { className: "cedros-kyc-callback-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ r("p", { className: "cedros-kyc-callback-message", children: "Processing your verification..." })
  ] }) : /* @__PURE__ */ d("div", { className: "cedros-kyc-callback-content", children: [
    /* @__PURE__ */ r(
      "p",
      {
        className: `cedros-kyc-callback-message cedros-kyc-callback-message--${o}`,
        children: $u(o)
      }
    ),
    t && /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-kyc-callback-continue",
        onClick: () => t(o),
        children: "Continue"
      }
    )
  ] }) });
}
function Gu() {
  const { config: e, _internal: t } = ee(), [s, o] = S(!1), [n, a] = S(null), [i, l] = S(null), [c, u] = S(null), [m, h] = S(null), [p, b] = S(null), w = p !== null && p !== "none", g = q(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), C = B(async () => {
    o(!0), a(null);
    try {
      const x = await g.get("/accreditation/status", {
        credentials: "include"
      });
      return l(x.status), u(x.verifiedAt ?? null), h(x.expiresAt ?? null), b(x.enforcementMode), x;
    } catch (x) {
      const _ = x instanceof Error ? x : new Error(String(x));
      throw a(_), _;
    } finally {
      o(!1);
    }
  }, [g]), A = B(
    async (x, _) => {
      o(!0), a(null);
      try {
        const f = await g.post(
          "/accreditation/submit",
          { method: x, ..._ },
          { credentials: "include" }
        );
        return l("pending"), f;
      } catch (f) {
        const y = f instanceof Error ? f : new Error(String(f));
        throw a(y), y;
      } finally {
        o(!1);
      }
    },
    [g]
  ), k = B(
    async (x, _, f) => {
      o(!0), a(null);
      try {
        const y = new FormData();
        y.append("submissionId", x), y.append("documentType", f), y.append("file", _);
        const v = t?.getAccessToken?.(), N = {};
        v && (N.Authorization = `Bearer ${v}`);
        const P = await fetch(`${e.serverUrl}/accreditation/upload`, {
          method: "POST",
          headers: N,
          credentials: "include",
          body: y
        });
        if (!P.ok) {
          const L = await P.text().catch(() => P.statusText);
          throw new Error(`Upload failed (${P.status}): ${L}`);
        }
        return P.json();
      } catch (y) {
        const v = y instanceof Error ? y : new Error(String(y));
        throw a(v), v;
      } finally {
        o(!1);
      }
    },
    [e.serverUrl, t]
  ), E = B(async () => {
    o(!0), a(null);
    try {
      return (await g.get(
        "/accreditation/submissions",
        { credentials: "include" }
      )).submissions;
    } catch (x) {
      const _ = x instanceof Error ? x : new Error(String(x));
      throw a(_), _;
    } finally {
      o(!1);
    }
  }, [g]);
  return {
    status: i,
    verifiedAt: c,
    expiresAt: m,
    isRequired: w,
    enforcementMode: p,
    fetchStatus: C,
    submitVerification: A,
    uploadDocument: k,
    listSubmissions: E,
    isLoading: s,
    error: n
  };
}
const vn = [
  { method: "income", label: "Income", description: "Verify via annual income ($200K+ individual / $300K+ joint)" },
  { method: "net_worth", label: "Net Worth", description: "Verify via net worth ($1M+ excluding primary residence)" },
  { method: "credential", label: "Professional Credential", description: "Verify via FINRA license (Series 7, 65, or 82)" },
  { method: "third_party_letter", label: "Third-Party Letter", description: "Upload a verification letter from a CPA, attorney, or RIA" },
  { method: "insider", label: "Insider / Officer", description: "Self-certify as a director, executive officer, or general partner" },
  { method: "investment_threshold", label: "Investment Threshold", description: "Qualify via investment commitment ($200K+ individual / $1M+ entity)" }
];
function Ct({ label: e, acceptedTypes: t = ".pdf,.jpg,.jpeg,.png,.tiff", documentType: s, files: o, onFilesChange: n, maxFiles: a = 5 }) {
  const i = J(null), [l, c] = S(!1), u = B((h) => {
    if (!h) return;
    const p = Array.from(h), b = [...o, ...p].slice(0, a);
    n(b);
  }, [o, a, n]), m = (h) => {
    n(o.filter((p, b) => b !== h));
  };
  return /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__upload-zone", children: [
    /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__upload-label", children: e }),
    /* @__PURE__ */ d(
      "div",
      {
        className: `cedros-accreditation-wizard__drop-area${l ? " cedros-accreditation-wizard__drop-area--active" : ""}`,
        role: "button",
        tabIndex: 0,
        "aria-label": `Upload files: ${e}`,
        onClick: () => i.current?.click(),
        onKeyDown: (h) => {
          (h.key === "Enter" || h.key === " ") && i.current?.click();
        },
        onDragOver: (h) => {
          h.preventDefault(), c(!0);
        },
        onDragLeave: () => c(!1),
        onDrop: (h) => {
          h.preventDefault(), c(!1), u(h.dataTransfer.files);
        },
        children: [
          /* @__PURE__ */ r("span", { children: "Click or drag files here" }),
          /* @__PURE__ */ r("span", { className: "cedros-accreditation-wizard__upload-hint", children: t })
        ]
      }
    ),
    /* @__PURE__ */ r(
      "input",
      {
        ref: i,
        type: "file",
        accept: t,
        multiple: a > 1,
        style: { display: "none" },
        onChange: (h) => u(h.target.files),
        "aria-hidden": "true"
      }
    ),
    o.length > 0 && /* @__PURE__ */ r("ul", { className: "cedros-accreditation-wizard__file-list", "aria-label": "Uploaded files", children: o.map((h, p) => /* @__PURE__ */ d("li", { className: "cedros-accreditation-wizard__file-item", children: [
      /* @__PURE__ */ r("span", { children: h.name }),
      /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__file-remove", onClick: () => m(p), "aria-label": `Remove ${h.name}`, children: "Remove" })
    ] }, `${h.name}-${p}`)) })
  ] });
}
function Qu(e, t, s, o) {
  t({ ...e, [s]: o });
}
function Et(e, t) {
  return e.filter((s) => s.documentType === t).map((s) => s.file);
}
function xt(e, t, s, o) {
  const n = e.filter((a) => a.documentType !== t);
  o([...n, ...s.map((a) => ({ file: a, documentType: t }))]);
}
function Ku({ method: e, formData: t, onFormDataChange: s, fileEntries: o, onFileEntriesChange: n }) {
  const a = (i, l) => Qu(t, s, i, l);
  return e === "income" ? /* @__PURE__ */ d("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ r("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Income Details" }),
    /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-accreditation-wizard__label", children: "Income type" }),
      /* @__PURE__ */ d("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ r("input", { type: "radio", name: "incomeType", value: "individual", checked: t.incomeType === "individual", onChange: () => a("incomeType", "individual") }),
        " ",
        "Individual ($200K+)"
      ] }),
      /* @__PURE__ */ d("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ r("input", { type: "radio", name: "incomeType", value: "joint", checked: t.incomeType === "joint", onChange: () => a("incomeType", "joint") }),
        " ",
        "Joint with spouse ($300K+)"
      ] })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-accreditation-wizard__label", htmlFor: "statedAmount", children: "Stated annual income (USD)" }),
      /* @__PURE__ */ r("input", { id: "statedAmount", type: "number", min: 0, className: "cedros-accreditation-wizard__input", value: t.statedAmountUsd ?? "", onChange: (i) => a("statedAmountUsd", i.target.valueAsNumber) })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-accreditation-wizard__label", htmlFor: "userStatement", children: "Statement about current year income expectation" }),
      /* @__PURE__ */ r("textarea", { id: "userStatement", className: "cedros-accreditation-wizard__textarea", rows: 3, value: t.userStatement ?? "", onChange: (i) => a("userStatement", i.target.value) })
    ] }),
    /* @__PURE__ */ r(Ct, { label: "Upload tax documents (W-2, 1040, 1099, K-1) from the last 2 years", documentType: "tax_return", files: Et(o, "tax_return"), onFilesChange: (i) => xt(o, "tax_return", i, n) })
  ] }) : e === "net_worth" ? /* @__PURE__ */ d("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ r("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Net Worth Details" }),
    /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-accreditation-wizard__label", htmlFor: "netWorthAmount", children: "Stated net worth (USD, excluding primary residence)" }),
      /* @__PURE__ */ r("input", { id: "netWorthAmount", type: "number", min: 0, className: "cedros-accreditation-wizard__input", value: t.statedAmountUsd ?? "", onChange: (i) => a("statedAmountUsd", i.target.valueAsNumber) })
    ] }),
    /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__note", children: "Documents must be dated within the last 90 days." }),
    /* @__PURE__ */ r(Ct, { label: "Upload asset documents (bank/brokerage statements, property appraisals)", documentType: "asset_statement", files: Et(o, "asset_statement"), onFilesChange: (i) => xt(o, "asset_statement", i, n) }),
    /* @__PURE__ */ r(Ct, { label: "Upload liability documents (credit report)", documentType: "liability_statement", files: Et(o, "liability_statement"), onFilesChange: (i) => xt(o, "liability_statement", i, n) })
  ] }) : e === "credential" ? /* @__PURE__ */ d("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ r("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Professional Credential" }),
    /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-accreditation-wizard__label", htmlFor: "crdNumber", children: "FINRA CRD Number" }),
      /* @__PURE__ */ r("input", { id: "crdNumber", type: "text", className: "cedros-accreditation-wizard__input", value: t.crdNumber ?? "", onChange: (i) => a("crdNumber", i.target.value) })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-accreditation-wizard__label", htmlFor: "licenseType", children: "License type" }),
      /* @__PURE__ */ d("select", { id: "licenseType", className: "cedros-accreditation-wizard__select", value: t.licenseType ?? "", onChange: (i) => a("licenseType", i.target.value), children: [
        /* @__PURE__ */ r("option", { value: "", children: "Select a license" }),
        /* @__PURE__ */ r("option", { value: "series_7", children: "Series 7" }),
        /* @__PURE__ */ r("option", { value: "series_65", children: "Series 65" }),
        /* @__PURE__ */ r("option", { value: "series_82", children: "Series 82" })
      ] })
    ] }),
    /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__note", children: "Your license will be verified via FINRA BrokerCheck." })
  ] }) : e === "third_party_letter" ? /* @__PURE__ */ d("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ r("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Third-Party Letter" }),
    /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__note", children: "Letter must be dated within the last 90 days." }),
    /* @__PURE__ */ r(Ct, { label: "Upload verification letter from a CPA, attorney, RIA, or broker-dealer", documentType: "letter", files: Et(o, "letter"), onFilesChange: (i) => xt(o, "letter", i, n), maxFiles: 1 })
  ] }) : e === "insider" ? /* @__PURE__ */ d("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ r("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Insider / Officer" }),
    /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-accreditation-wizard__label", htmlFor: "insiderStatement", children: "Describe your role as director, executive officer, or general partner" }),
      /* @__PURE__ */ r("textarea", { id: "insiderStatement", className: "cedros-accreditation-wizard__textarea", rows: 4, value: t.userStatement ?? "", onChange: (i) => a("userStatement", i.target.value) })
    ] }),
    /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__note", children: "An administrator will verify your status." })
  ] }) : /* @__PURE__ */ d("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ r("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Investment Threshold" }),
    /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-accreditation-wizard__label", children: "Entity type" }),
      /* @__PURE__ */ d("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ r("input", { type: "radio", name: "entityType", value: "individual", checked: t.entityType === "individual", onChange: () => a("entityType", "individual") }),
        " ",
        "Individual ($200K+)"
      ] }),
      /* @__PURE__ */ d("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ r("input", { type: "radio", name: "entityType", value: "entity", checked: t.entityType === "entity", onChange: () => a("entityType", "entity") }),
        " ",
        "Entity ($1M+)"
      ] })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-accreditation-wizard__label", htmlFor: "commitmentAmount", children: "Investment commitment amount (USD)" }),
      /* @__PURE__ */ r("input", { id: "commitmentAmount", type: "number", min: 0, className: "cedros-accreditation-wizard__input", value: t.investmentCommitmentUsd ?? "", onChange: (i) => a("investmentCommitmentUsd", i.target.valueAsNumber) })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-accreditation-wizard__label", htmlFor: "commitmentStatement", children: "Written representation of commitment" }),
      /* @__PURE__ */ r("textarea", { id: "commitmentStatement", className: "cedros-accreditation-wizard__textarea", rows: 3, value: t.userStatement ?? "", onChange: (i) => a("userStatement", i.target.value) })
    ] }),
    /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__note", children: "Per 2025 SEC guidance, a minimum investment commitment serves as evidence of accredited status." })
  ] });
}
function rm({ onComplete: e, onCancel: t, className: s }) {
  const { submitVerification: o, uploadDocument: n, isLoading: a, error: i } = Gu(), [l, c] = S(1), [u, m] = S(null), [h, p] = S({}), [b, w] = S([]), [g, C] = S(!1), [A, k] = S(null), E = (y) => {
    m(y), c(2);
  }, x = () => {
    l === 2 ? c(1) : l === 3 ? c(2) : t?.();
  }, _ = B(async () => {
    if (u) {
      k(null);
      try {
        const { submissionId: y } = await o(u, h);
        for (const v of b)
          await n(y, v.file, v.documentType);
        C(!0), e?.(y);
      } catch (y) {
        k(y instanceof Error ? y.message : "Submission failed. Please try again.");
      }
    }
  }, [u, h, b, o, n, e]), f = vn.find((y) => y.method === u);
  return g ? /* @__PURE__ */ r("div", { className: `cedros-accreditation-wizard cedros-accreditation-wizard--success ${s ?? ""}`, role: "status", children: /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__success-message", children: "Submitted for review. You will be notified once your accreditation is verified." }) }) : /* @__PURE__ */ d("div", { className: `cedros-accreditation-wizard ${s ?? ""}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-accreditation-wizard__header", children: /* @__PURE__ */ r("nav", { className: "cedros-accreditation-wizard__steps", "aria-label": "Wizard steps", children: ["Choose Method", "Fill Details", "Review & Submit"].map((y, v) => /* @__PURE__ */ d("span", { className: `cedros-accreditation-wizard__step${l === v + 1 ? " cedros-accreditation-wizard__step--active" : ""}`, "aria-current": l === v + 1 ? "step" : void 0, children: [
      v + 1,
      ". ",
      y
    ] }, y)) }) }),
    l === 1 && /* @__PURE__ */ d("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step1-heading", children: [
      /* @__PURE__ */ r("h2", { id: "step1-heading", className: "cedros-accreditation-wizard__section-title", children: "Choose Verification Method" }),
      /* @__PURE__ */ r("div", { className: "cedros-accreditation-wizard__method-grid", role: "list", children: vn.map((y) => /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          role: "listitem",
          className: "cedros-accreditation-wizard__method-card",
          onClick: () => E(y.method),
          children: [
            /* @__PURE__ */ r("span", { className: "cedros-accreditation-wizard__method-title", children: y.label }),
            /* @__PURE__ */ r("span", { className: "cedros-accreditation-wizard__method-desc", children: y.description })
          ]
        },
        y.method
      )) }),
      t && /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__cancel", onClick: t, children: "Cancel" })
    ] }),
    l === 2 && u && /* @__PURE__ */ d("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step2-heading", children: [
      /* @__PURE__ */ r("h2", { id: "step2-heading", className: "cedros-accreditation-wizard__section-title", children: f?.label }),
      /* @__PURE__ */ r(Ku, { method: u, formData: h, onFormDataChange: p, fileEntries: b, onFileEntriesChange: w }),
      /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__actions", children: [
        /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__back", onClick: x, children: "Back" }),
        /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__next", onClick: () => c(3), children: "Review" })
      ] })
    ] }),
    l === 3 && u && /* @__PURE__ */ d("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step3-heading", children: [
      /* @__PURE__ */ r("h2", { id: "step3-heading", className: "cedros-accreditation-wizard__section-title", children: "Review & Submit" }),
      /* @__PURE__ */ d("dl", { className: "cedros-accreditation-wizard__review-list", children: [
        /* @__PURE__ */ r("dt", { className: "cedros-accreditation-wizard__review-term", children: "Method" }),
        /* @__PURE__ */ r("dd", { className: "cedros-accreditation-wizard__review-detail", children: f?.label }),
        Object.entries(h).filter(([, y]) => y !== void 0 && y !== "" && y !== null).map(([y, v]) => /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ r("dt", { className: "cedros-accreditation-wizard__review-term", children: y }),
          /* @__PURE__ */ r("dd", { className: "cedros-accreditation-wizard__review-detail", children: String(v) })
        ] }, y))
      ] }),
      b.length > 0 && /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__review-files", children: [
        /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__review-files-heading", children: "Documents to upload:" }),
        /* @__PURE__ */ r("ul", { children: b.map((y, v) => /* @__PURE__ */ d("li", { children: [
          y.file.name,
          " ",
          /* @__PURE__ */ d("span", { className: "cedros-accreditation-wizard__doc-type", children: [
            "(",
            y.documentType,
            ")"
          ] })
        ] }, `${y.file.name}-${v}`)) })
      ] }),
      (i || A) && /* @__PURE__ */ r("div", { className: "cedros-accreditation-wizard__error", role: "alert", children: A ?? i?.message }),
      /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__actions", children: [
        /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__back", onClick: x, disabled: a, children: "Back" }),
        /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__submit", onClick: _, disabled: a, children: a ? "Submitting..." : "Submit Verification" })
      ] })
    ] })
  ] });
}
function sm({
  status: e,
  onStartVerification: t,
  className: s
}) {
  if (e === "approved")
    return null;
  let o, n = !0;
  switch (e) {
    case "pending":
      o = "Your accreditation is under review.", n = !1;
      break;
    case "rejected":
      o = "Accreditation was not approved. You can resubmit.";
      break;
    case "expired":
      o = "Your accreditation has expired. Please verify again.";
      break;
    default:
      o = "Accredited investor verification is required.";
      break;
  }
  return /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-accreditation-banner ${s ?? ""}`,
      role: "alert",
      children: /* @__PURE__ */ d("div", { className: "cedros-accreditation-banner__content", children: [
        /* @__PURE__ */ r("span", { className: "cedros-accreditation-banner__message", children: o }),
        n && t && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-accreditation-banner__button",
            onClick: t,
            children: e === "rejected" || e === "expired" ? "Resubmit Verification" : "Start Verification"
          }
        )
      ] })
    }
  );
}
const ls = ia(null), Vr = {
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
function Yu(e, t) {
  return $o(e, t);
}
function $o(e, t) {
  const s = { ...e };
  for (const o in t)
    if (Object.prototype.hasOwnProperty.call(t, o)) {
      const n = e[o], a = t[o];
      typeof n == "object" && n !== null && typeof a == "object" && a !== null ? s[o] = $o(
        n,
        a
      ) : a !== void 0 && (s[o] = a);
    }
  return s;
}
function nm({
  children: e,
  locale: t = "en",
  translations: s
}) {
  const o = q(() => ({ t: s ? Yu(Vr, s) : Vr, locale: t }), [s, t]);
  return /* @__PURE__ */ r(ls.Provider, { value: o, children: e });
}
function om() {
  return Tn(ls)?.t ?? Vr;
}
function am() {
  return Tn(ls)?.locale ?? "en";
}
export {
  Uh as AccountSettings,
  sm as AccreditationBanner,
  rm as AccreditationWizard,
  Sa as AdminDepositList,
  xa as AdminDepositStats,
  Sm as AdminIcons,
  La as AdminPrivacyPeriodDeposits,
  td as AdminReferralPayouts,
  _m as AdminShell,
  Ia as AdminUserList,
  Ta as AdminWithdrawalHistory,
  Pa as AdminWithdrawalQueue,
  _a as AdminWithdrawalStats,
  Vc as AppleLoginButton,
  Ua as AuthenticationSettings,
  Lm as CEDROS_LOGIN_SECTION_IDS,
  Ph as CapabilityWarning,
  Ih as CedrosAdminDashboard,
  lm as CedrosLoginProvider,
  Oh as ChooseUsernamePrompt,
  Fh as CompleteAccountPrompt,
  zh as CreditBalance,
  za as CreditSystemSettings,
  Wh as DepositFlow,
  la as EmailLoginForm,
  da as EmailRegisterForm,
  Im as EmailSettings,
  Da as EmbeddedWalletSettings,
  Yc as ErrorBoundary,
  ae as ErrorMessage,
  zc as ForgotPasswordForm,
  Hh as FullPageLayout,
  ua as GoogleLoginButton,
  qh as History,
  nm as I18nProvider,
  ya as InviteForm,
  ba as InviteList,
  em as KycBanner,
  tm as KycCallback,
  Wd as LinkedAccounts,
  Q as LoadingSpinner,
  Eh as LoginButton,
  rs as LoginForm,
  xh as LoginModal,
  wa as MemberList,
  Dh as MfaSetupPrompt,
  _h as OrgSelector,
  Lh as OrgSwitcher,
  In as OtpInput,
  Qc as PasskeyLoginButton,
  Cl as PasskeyPrompt,
  be as PasswordInput,
  za as PrivacyCashSettings,
  Ma as ProfileDropdown,
  Fd as ProfileTab,
  ml as RecoveryPhraseDisplay,
  fl as RecoveryPhraseInput,
  Sh as ResetPasswordForm,
  Jh as RewardsPanel,
  is as SUPPORTED_TOKENS,
  Rh as SecuritySettings,
  qa as ServerSettings,
  al as SessionList,
  ja as SettingsPageLayout,
  Gl as SetupWizard,
  ha as SolanaLoginButton,
  $h as SplitPageLayout,
  Bh as SystemSettings,
  Fo as TieredAmountSlider,
  Mo as TokenSelector,
  Rd as TotpSettings,
  Lo as TotpSetup,
  gm as TotpVerify,
  Mh as UserProfileSettings,
  Fl as WalletAddressRow,
  Al as WalletEnrollment,
  Th as WalletManager,
  Rl as WalletRecovery,
  Ol as WalletStatus,
  _l as WalletUnlock,
  Fm as WebhookSettings,
  jh as WithdrawalFlow,
  Vh as WithdrawalHistory,
  Pm as cedrosLoginPlugin,
  Vr as defaultTranslations,
  dm as getEmbeddedWalletInfo,
  ns as getTierForAmount,
  um as isEmbeddedWalletAvailable,
  Tm as loginPlugin,
  Yu as mergeTranslations,
  Nm as registerMobileWallet,
  Gu as useAccreditation,
  Um as useAdminDeposits,
  Bm as useAdminShell,
  Em as useAdminUsers,
  jc as useAppleAuth,
  Ot as useAuth,
  mm as useAuthState,
  fm as useAuthUI,
  Gh as useAuthorize,
  ee as useCedrosLogin,
  Po as useCredentials,
  Vo as useCredits,
  Xd as useDeposit,
  wm as useEmailAuth,
  vm as useGoogleAuth,
  Oc as useInstantLink,
  ga as useInvites,
  Xh as useKyc,
  am as useLocale,
  pa as useMembers,
  Ca as useOrgs,
  kl as usePasskeySigning,
  ts as usePasswordReset,
  Kh as usePendingRecovery,
  Zh as usePostLogin,
  jt as useProfile,
  Md as useReferral,
  Fu as useRewards,
  ma as useServerFeatures,
  Qd as useSessions,
  bl as useSetPassword,
  ko as useSetup,
  km as useSolanaAuth,
  Aa as useSystemSettings,
  _o as useTotp,
  ym as useTotpVerify,
  Yh as useTransactionSigning,
  om as useTranslations,
  Zd as useUsername,
  Wt as useWallet,
  yl as useWalletEnrollment,
  nt as useWalletMaterial,
  Bl as useWalletRecovery,
  Nl as useWalletSigning,
  Qh as useWallets,
  Ao as useWebAuthn,
  Ho as useWithdrawal,
  zt as validatePassword
};
