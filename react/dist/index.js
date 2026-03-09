import { D as rt, v as Do, a as Uo, w as tn, t as Fe, b as rn, c as sn, u as St, g as Fo, d as Oo, e as Ge, f as Wo, h as nn, i as on, j as Se, k as an, l as cn, m as Rr, n as ln, o as qo, p as dn, q as Lt } from "./useAuth-C-Vw-ggy.js";
import { C as yh, r as Ah, s as vh } from "./useAuth-C-Vw-ggy.js";
import { u as ne, A as ce, h as q, a as Oe } from "./useCedrosLogin-CFfID-0i.js";
import { b as Nh, c as Eh } from "./useCedrosLogin-CFfID-0i.js";
import { jsx as r, jsxs as d, Fragment as X } from "react/jsx-runtime";
import { useState as R, useRef as J, useMemo as j, useEffect as F, useCallback as T, useId as un, Fragment as jo, Component as zo, createContext as Vo, useContext as hn } from "react";
import { L as $ } from "./LoadingSpinner-6vml-zwr.js";
import { a as fn, s as Ho } from "./sanitization-CQ-H1MSg.js";
import { b as mn, E as $o, a as Qo, P as we, O as pn } from "./EmailRegisterForm-D2VaJouj.js";
import { T as xh, u as Sh, c as Lh } from "./EmailRegisterForm-D2VaJouj.js";
import { b as gn, v as Bt } from "./validation-B8kMV3BL.js";
import { E as te } from "./ErrorMessage-CcEK0pYO.js";
import { G as Go } from "./GoogleLoginButton-qf4A_A3G.js";
import { u as Ph } from "./GoogleLoginButton-qf4A_A3G.js";
import { d as Xr, S as Ko } from "./SolanaLoginButton-B04dib6X.js";
import { r as Th, u as Mh } from "./SolanaLoginButton-B04dib6X.js";
import { c as Yo, d as Zo, u as Xo, a as Jo, M as ea, I as ta, b as ra, P as sa } from "./PermissionsSection-DNzOL1xW.js";
import { u as na } from "./useSystemSettings-rgskaDqP.js";
import { C as oa, S as wn, a as aa, u as ia, A as ca } from "./AutosaveStatus-CSZsp6w7.js";
import { u as la, O as da } from "./useOrgs-C90KT9KP.js";
import { A as ua, a as ha } from "./AdminDepositList-BUm_ZcAW.js";
import { A as fa, a as ma, b as pa, c as ga } from "./AdminWithdrawalHistory-C76bkbjX.js";
import { u as wa, A as ba, a as ya } from "./useUsersStatsSummary-5DJwzntC.js";
import { b as _h } from "./useUsersStatsSummary-5DJwzntC.js";
import { S as bn } from "./StatsBar-BX-hHtTq.js";
import { P as Aa } from "./plugin-C_NDZ2-D.js";
import { I as Uh, A as Fh, C as Oh, c as Wh, c as qh, u as jh } from "./plugin-C_NDZ2-D.js";
import { A as va } from "./AuthenticationSettings-DUXpyiJ5.js";
import { E as ka } from "./EmbeddedWalletSettings-M-D5N0eY.js";
import { A as Na, S as Ea, P as Ca } from "./EmailSettings-DRfOF0Sf.js";
import { E as Vh } from "./EmailSettings-DRfOF0Sf.js";
import { C as xa } from "./CreditSystemSettings-Buu7Y-7I.js";
import { S as Sa } from "./ServerSettings-qxi8aZO7.js";
import { u as $h } from "./useAdminDeposits-C76B2Q_8.js";
import { S as La } from "./WebhookSettings-B8hAwhZ2.js";
import { W as Gh } from "./WebhookSettings-B8hAwhZ2.js";
let De = null, Ba = 0;
const tt = /* @__PURE__ */ new Map();
function Pa() {
  return typeof Worker > "u" ? null : (De || (De = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/argon2Worker-Bi5TuQvD.js", import.meta.url).href,
    import.meta.url
  ), {
    type: "module"
  }), De.onmessage = (e) => {
    const { id: t, key: n, error: o } = e.data, s = tt.get(t);
    if (s) {
      if (tt.delete(t), o) {
        s.reject(new Error(o));
        return;
      }
      if (!n) {
        s.reject(new Error("Argon2 worker returned no key"));
        return;
      }
      s.resolve(n);
    }
  }, De.onerror = (e) => {
    const t = e instanceof ErrorEvent ? e.error : new Error("Argon2 worker error");
    for (const n of tt.values())
      n.reject(t instanceof Error ? t : new Error(String(t)));
    tt.clear(), De?.terminate(), De = null;
  }), De);
}
async function yn(e, t, n = rt) {
  Do(n);
  const o = Pa();
  return o ? new Promise((s, a) => {
    const c = Ba++;
    tt.set(c, { resolve: s, reject: a });
    const i = {
      id: c,
      password: e,
      salt: t,
      params: n
    };
    o.postMessage(i);
  }) : Uo(e, t, n);
}
function An(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Ra(e) {
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
const Ta = globalThis.crypto, Ma = globalThis.crypto, Ia = globalThis.crypto.subtle, _a = globalThis.crypto.getRandomValues.bind(globalThis.crypto), Da = globalThis.crypto.randomUUID.bind(globalThis.crypto), Ua = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ta,
  getRandomValues: _a,
  randomUUID: Da,
  subtle: Ia,
  webcrypto: Ma
}, Symbol.toStringTag, { value: "Module" })), Fa = /* @__PURE__ */ Ra(Ua);
var Oa = pt.exports, Jr;
function Wa() {
  return Jr || (Jr = 1, (function(e, t) {
    (function(n, o) {
      e.exports = o(Fa);
    })(Oa, function(n) {
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
      function f(w, k) {
        var v;
        if (k === 0 || k === 1)
          return w;
        if (k && k > 1024)
          throw new Error(
            "Padding must be multiples of no larger than 1024 bits."
          );
        return k = k || s.bits, w && (v = w.length % k), v ? (a + w).slice(
          -(k - v + w.length)
        ) : w;
      }
      function h(w) {
        var k = "", v, A;
        for (A = w.length - 1; A >= 0; A--) {
          if (v = parseInt(w[A], 16), isNaN(v))
            throw new Error("Invalid hex character.");
          k = f(v.toString(2), 4) + k;
        }
        return k;
      }
      function p(w) {
        var k = "", v, A;
        for (w = f(w, 4), A = w.length; A >= 4; A -= 4) {
          if (v = parseInt(w.slice(A - 4, A), 2), isNaN(v))
            throw new Error("Invalid binary character.");
          k = v.toString(16) + k;
        }
        return k;
      }
      function b() {
        return !!(n && typeof n == "object" && (typeof n.getRandomValues == "function" || typeof n.getRandomValues == "object") && (typeof Uint32Array == "function" || typeof Uint32Array == "object"));
      }
      function g() {
        return typeof n == "object" && typeof n.randomBytes == "function";
      }
      function m(w) {
        function k(P, S, M, I) {
          var _ = 0, O, W = "", V;
          for (S && (O = S.length - 1); _ < O || W.length < P; )
            V = Math.abs(parseInt(S[_], M)), W = W + f(V.toString(2), I), _++;
          return W = W.substr(-P), (W.match(/0/g) || []).length === W.length ? null : W;
        }
        function v(P) {
          var S, M, I, _, O = null;
          for (I = 16, _ = 4, M = Math.ceil(P / 8); O === null; )
            S = n.randomBytes(M), O = k(P, S.toString("hex"), I, _);
          return O;
        }
        function A(P) {
          var S, M, I, _ = null;
          for (M = 10, I = 32, S = Math.ceil(P / 32); _ === null; )
            _ = k(
              P,
              n.getRandomValues(new Uint32Array(S)),
              M,
              I
            );
          return _;
        }
        function L(P) {
          var S, M, I, _, O, W = null;
          _ = 10, O = 32, M = Math.ceil(P / 32), I = 123456789, S = new Uint32Array(M);
          for (var V = 0; V < S.length; V++)
            S[V] = I;
          for (; W === null; )
            W = k(P, S, _, O);
          return W;
        }
        if (w && w === "testRandom")
          return s.typeCSPRNG = w, L;
        if (w && w === "nodeCryptoRandomBytes")
          return s.typeCSPRNG = w, v;
        if (w && w === "browserCryptoGetRandomValues")
          return s.typeCSPRNG = w, A;
        if (g())
          return s.typeCSPRNG = "nodeCryptoRandomBytes", v;
        if (b())
          return s.typeCSPRNG = "browserCryptoGetRandomValues", A;
      }
      function E(w, k) {
        var v = [], A;
        for (k && (w = f(w, k)), A = w.length; A > s.bits; A -= s.bits)
          v.push(parseInt(w.slice(A - s.bits, A), 2));
        return v.push(parseInt(w.slice(0, A), 2)), v;
      }
      function y(w, k) {
        var v = s.logs[w], A = 0, L;
        for (L = k.length - 1; L >= 0; L--)
          A !== 0 ? A = s.exps[(v + s.logs[A]) % s.maxShares] ^ k[L] : A = k[L];
        return A;
      }
      function C(w, k, v) {
        var A = 0, L, P, S, M;
        for (S = 0, L = k.length; S < L; S++)
          if (v[S]) {
            for (P = s.logs[v[S]], M = 0; M < L; M++)
              if (S !== M) {
                if (w === k[M]) {
                  P = -1;
                  break;
                }
                P = (P + s.logs[w ^ k[M]] - s.logs[k[S] ^ k[M]] + s.maxShares) % s.maxShares;
              }
            A = P === -1 ? A : A ^ s.exps[P];
          }
        return A;
      }
      function N(w, k, v) {
        var A = [], L = [w], P, S;
        for (P = 1; P < v; P++)
          L[P] = parseInt(s.rng(s.bits), 2);
        for (P = 1, S = k + 1; P < S; P++)
          A[P - 1] = {
            x: P,
            y: y(P, L)
          };
        return A;
      }
      function x(w, k, v) {
        var A, L, P, S, M;
        if (k = parseInt(k, s.radix), w = parseInt(w, 10) || s.bits, A = w.toString(36).toUpperCase(), P = Math.pow(2, w) - 1, S = P.toString(s.radix).length, L = f(k.toString(s.radix), S), typeof k != "number" || k % 1 !== 0 || k < 1 || k > P)
          throw new Error(
            "Share id must be an integer between 1 and " + P + ", inclusive."
          );
        return M = A + L + v, M;
      }
      var B = {
        init: function(w, k) {
          var v = [], A = [], L = 1, P, S;
          if (l(), w && (typeof w != "number" || w % 1 !== 0 || w < o.minBits || w > o.maxBits))
            throw new Error(
              "Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (k && i.indexOf(k) === -1)
            throw new Error("Invalid RNG type argument : '" + k + "'");
          for (s.radix = o.radix, s.bits = w || o.bits, s.size = Math.pow(2, s.bits), s.maxShares = s.size - 1, P = o.primitivePolynomials[s.bits], S = 0; S < s.size; S++)
            A[S] = L, v[L] = S, L = L << 1, L >= s.size && (L = L ^ P, L = L & s.maxShares);
          if (s.logs = v, s.exps = A, k && this.setRNG(k), u() || this.setRNG(), !u() || !s.bits || !s.size || !s.maxShares || !s.logs || !s.exps || s.logs.length !== s.size || s.exps.length !== s.size)
            throw new Error("Initialization failed.");
        },
        // Evaluates the Lagrange interpolation polynomial at x=`at` for
        // individual config.bits-length segments of each share in the `shares`
        // Array. Each share is expressed in base `inputRadix`. The output
        // is expressed in base `outputRadix'.
        combine: function(w, k) {
          var v, A, L, P, S = "", M, I, _, O = [], W = [];
          for (k = k || 0, v = 0, L = w.length; v < L; v++) {
            if (I = this.extractShareComponents(w[v]), M === void 0)
              M = I.bits;
            else if (I.bits !== M)
              throw new Error(
                "Mismatched shares: Different bit settings."
              );
            if (s.bits !== M && this.init(M), O.indexOf(I.id) === -1)
              for (O.push(I.id), _ = E(h(I.data)), A = 0, P = _.length; A < P; A++)
                W[A] = W[A] || [], W[A][O.length - 1] = _[A];
          }
          for (v = 0, L = W.length; v < L; v++)
            S = f(C(k, O, W[v]).toString(2)) + S;
          return p(
            k >= 1 ? S : S.slice(S.indexOf("1") + 1)
          );
        },
        getConfig: function() {
          var w = {};
          return w.radix = s.radix, w.bits = s.bits, w.maxShares = s.maxShares, w.hasCSPRNG = u(), w.typeCSPRNG = s.typeCSPRNG, w;
        },
        // Given a public share, extract the bits (Integer), share ID (Integer), and share data (Hex)
        // and return an Object containing those components.
        extractShareComponents: function(w) {
          var k, v, A, L, P = {}, S, M;
          if (k = parseInt(w.substr(0, 1), 36), k && (typeof k != "number" || k % 1 !== 0 || k < o.minBits || k > o.maxBits))
            throw new Error(
              "Invalid share : Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (L = Math.pow(2, k) - 1, A = (Math.pow(2, k) - 1).toString(s.radix).length, S = "^([a-kA-K3-9]{1})([a-fA-F0-9]{" + A + "})([a-fA-F0-9]+)$", M = new RegExp(S).exec(w), M && (v = parseInt(M[2], s.radix)), typeof v != "number" || v % 1 !== 0 || v < 1 || v > L)
            throw new Error(
              "Invalid share : Share id must be an integer between 1 and " + s.maxShares + ", inclusive."
            );
          if (M && M[3])
            return P.bits = k, P.id = v, P.data = M[3], P;
          throw new Error("The share data provided is invalid : " + w);
        },
        // Set the PRNG to use. If no RNG function is supplied, pick a default using getRNG()
        setRNG: function(w) {
          var k = "Random number generator is invalid ", v = " Supply an CSPRNG of the form function(bits){} that returns a string containing 'bits' number of random 1's and 0's.";
          if (w && typeof w == "string" && i.indexOf(w) === -1)
            throw new Error("Invalid RNG type argument : '" + w + "'");
          if (w || (w = m()), w && typeof w == "string" && (w = m(w)), c) {
            if (w && typeof w != "function")
              throw new Error(k + "(Not a function)." + v);
            if (w && typeof w(s.bits) != "string")
              throw new Error(
                k + "(Output is not a string)." + v
              );
            if (w && !parseInt(w(s.bits), 2))
              throw new Error(
                k + "(Binary string output not parseable to an Integer)." + v
              );
            if (w && w(s.bits).length > s.bits)
              throw new Error(
                k + "(Output length is greater than config.bits)." + v
              );
            if (w && w(s.bits).length < s.bits)
              throw new Error(
                k + "(Output length is less than config.bits)." + v
              );
          }
          return s.rng = w, !0;
        },
        // Converts a given UTF16 character string to the HEX representation.
        // Each character of the input string is represented by
        // `bytesPerChar` bytes in the output string which defaults to 2.
        str2hex: function(w, k) {
          var v, A, L = "", P, S, M, I;
          if (typeof w != "string")
            throw new Error("Input must be a character string.");
          if (k || (k = o.bytesPerChar), typeof k != "number" || k < 1 || k > o.maxBytesPerChar || k % 1 !== 0)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (v = 2 * k, A = Math.pow(16, v) - 1, M = 0, I = w.length; M < I; M++) {
            if (S = w[M].charCodeAt(), isNaN(S))
              throw new Error("Invalid character: " + w[M]);
            if (S > A)
              throw P = Math.ceil(Math.log(S + 1) / Math.log(256)), new Error(
                "Invalid character code (" + S + "). Maximum allowable is 256^bytes-1 (" + A + "). To convert this character, use at least " + P + " bytes."
              );
            L = f(S.toString(16), v) + L;
          }
          return L;
        },
        // Converts a given HEX number string to a UTF16 character string.
        hex2str: function(w, k) {
          var v, A = "", L, P;
          if (typeof w != "string")
            throw new Error("Input must be a hexadecimal string.");
          if (k = k || o.bytesPerChar, typeof k != "number" || k % 1 !== 0 || k < 1 || k > o.maxBytesPerChar)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (v = 2 * k, w = f(w, v), L = 0, P = w.length; L < P; L += v)
            A = String.fromCharCode(
              parseInt(w.slice(L, L + v), 16)
            ) + A;
          return A;
        },
        // Generates a random bits-length number string using the PRNG
        random: function(w) {
          if (typeof w != "number" || w % 1 !== 0 || w < 2 || w > 65536)
            throw new Error(
              "Number of bits must be an Integer between 1 and 65536."
            );
          return p(s.rng(w));
        },
        // Divides a `secret` number String str expressed in radix `inputRadix` (optional, default 16)
        // into `numShares` shares, each expressed in radix `outputRadix` (optional, default to `inputRadix`),
        // requiring `threshold` number of shares to reconstruct the secret.
        // Optionally, zero-pads the secret to a length that is a multiple of padLength before sharing.
        share: function(w, k, v, A) {
          var L, P, S = new Array(k), M = new Array(k), I, _, O;
          if (A = A || 128, typeof w != "string")
            throw new Error("Secret must be a string.");
          if (typeof k != "number" || k % 1 !== 0 || k < 2)
            throw new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive."
            );
          if (k > s.maxShares)
            throw L = Math.ceil(Math.log(k + 1) / Math.LN2), new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive. To create " + k + " shares, use at least " + L + " bits."
            );
          if (typeof v != "number" || v % 1 !== 0 || v < 2)
            throw new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive."
            );
          if (v > s.maxShares)
            throw L = Math.ceil(Math.log(v + 1) / Math.LN2), new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive.  To use a threshold of " + v + ", use at least " + L + " bits."
            );
          if (v > k)
            throw new Error(
              "Threshold number of shares was " + v + " but must be less than or equal to the " + k + " shares specified as the total to generate."
            );
          if (typeof A != "number" || A % 1 !== 0 || A < 0 || A > 1024)
            throw new Error(
              "Zero-pad length must be an integer between 0 and 1024 inclusive."
            );
          for (w = "1" + h(w), w = E(w, A), I = 0, O = w.length; I < O; I++)
            for (P = N(w[I], k, v), _ = 0; _ < k; _++)
              S[_] = S[_] || P[_].x.toString(s.radix), M[_] = f(P[_].y.toString(2)) + (M[_] || "");
          for (I = 0; I < k; I++)
            S[I] = x(
              s.bits,
              S[I],
              p(M[I])
            );
          return S;
        },
        // Generate a new share with id `id` (a number between 1 and 2^bits-1)
        // `id` can be a Number or a String in the default radix (16)
        newShare: function(w, k) {
          var v, A;
          if (w && typeof w == "string" && (w = parseInt(w, s.radix)), A = w.toString(s.radix), w && A && k && k[0])
            return v = this.extractShareComponents(k[0]), x(
              v.bits,
              A,
              this.combine(k, w)
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
        _bin2hex: p,
        _hasCryptoGetRandomValues: b,
        _hasCryptoRandomBytes: g,
        _getRNG: m,
        _isSetRNG: u,
        _splitNumStringToIntArray: E,
        _horner: y,
        _lagrange: C,
        _getShares: N,
        _constructPublicShareString: x
        /* end-test-code */
      };
      return B.init(), B;
    });
  })(pt)), pt.exports;
}
var qa = Wa();
const vn = /* @__PURE__ */ An(qa);
function kn(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Tr(e, t = "") {
  if (!Number.isSafeInteger(e) || e < 0) {
    const n = t && `"${t}" `;
    throw new Error(`${n}expected integer >= 0, got ${e}`);
  }
}
function ie(e, t, n = "") {
  const o = kn(e), s = e?.length, a = t !== void 0;
  if (!o || a && s !== t) {
    const c = n && `"${n}" `, i = a ? ` of length ${t}` : "", l = o ? `length=${s}` : `type=${typeof e}`;
    throw new Error(c + "expected Uint8Array" + i + ", got " + l);
  }
  return e;
}
function es(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function ja(e, t) {
  ie(e, void 0, "digestInto() output");
  const n = t.outputLen;
  if (e.length < n)
    throw new Error('"digestInto() output" expected to be of length >=' + n);
}
function Ar(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function Ft(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
const Nn = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", za = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function Mr(e) {
  if (ie(e), Nn)
    return e.toHex();
  let t = "";
  for (let n = 0; n < e.length; n++)
    t += za[e[n]];
  return t;
}
const Ce = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function ts(e) {
  if (e >= Ce._0 && e <= Ce._9)
    return e - Ce._0;
  if (e >= Ce.A && e <= Ce.F)
    return e - (Ce.A - 10);
  if (e >= Ce.a && e <= Ce.f)
    return e - (Ce.a - 10);
}
function En(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  if (Nn)
    return Uint8Array.fromHex(e);
  const t = e.length, n = t / 2;
  if (t % 2)
    throw new Error("hex string expected, got unpadded hex of length " + t);
  const o = new Uint8Array(n);
  for (let s = 0, a = 0; s < n; s++, a += 2) {
    const c = ts(e.charCodeAt(a)), i = ts(e.charCodeAt(a + 1));
    if (c === void 0 || i === void 0) {
      const l = e[a] + e[a + 1];
      throw new Error('hex string expected, got non-hex character "' + l + '" at index ' + a);
    }
    o[s] = c * 16 + i;
  }
  return o;
}
function rs(...e) {
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
function Va(e, t = {}) {
  const n = (s, a) => e(a).update(s).digest(), o = e(void 0);
  return n.outputLen = o.outputLen, n.blockLen = o.blockLen, n.create = (s) => e(s), Object.assign(n, t), Object.freeze(n);
}
function Ha(e = 32) {
  const t = typeof globalThis == "object" ? globalThis.crypto : null;
  if (typeof t?.getRandomValues != "function")
    throw new Error("crypto.getRandomValues must be defined");
  return t.getRandomValues(new Uint8Array(e));
}
const $a = (e) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, e])
});
let Qa = class {
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
    this.blockLen = t, this.outputLen = n, this.padOffset = o, this.isLE = s, this.buffer = new Uint8Array(t), this.view = Ft(this.buffer);
  }
  update(t) {
    es(this), ie(t);
    const { view: n, buffer: o, blockLen: s } = this, a = t.length;
    for (let c = 0; c < a; ) {
      const i = Math.min(s - this.pos, a - c);
      if (i === s) {
        const l = Ft(t);
        for (; s <= a - c; c += s)
          this.process(l, c);
        continue;
      }
      o.set(t.subarray(c, c + i), this.pos), this.pos += i, c += i, this.pos === s && (this.process(n, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    es(this), ja(t, this), this.finished = !0;
    const { buffer: n, view: o, blockLen: s, isLE: a } = this;
    let { pos: c } = this;
    n[c++] = 128, Ar(this.buffer.subarray(c)), this.padOffset > s - c && (this.process(o, 0), c = 0);
    for (let h = c; h < s; h++)
      n[h] = 0;
    o.setBigUint64(s - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const i = Ft(t), l = this.outputLen;
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
]), ct = /* @__PURE__ */ BigInt(2 ** 32 - 1), ss = /* @__PURE__ */ BigInt(32);
function Ga(e, t = !1) {
  return t ? { h: Number(e & ct), l: Number(e >> ss & ct) } : { h: Number(e >> ss & ct) | 0, l: Number(e & ct) | 0 };
}
function Ka(e, t = !1) {
  const n = e.length;
  let o = new Uint32Array(n), s = new Uint32Array(n);
  for (let a = 0; a < n; a++) {
    const { h: c, l: i } = Ga(e[a], t);
    [o[a], s[a]] = [c, i];
  }
  return [o, s];
}
const ns = (e, t, n) => e >>> n, os = (e, t, n) => e << 32 - n | t >>> n, je = (e, t, n) => e >>> n | t << 32 - n, ze = (e, t, n) => e << 32 - n | t >>> n, lt = (e, t, n) => e << 64 - n | t >>> n - 32, dt = (e, t, n) => e >>> n - 32 | t << 64 - n;
function xe(e, t, n, o) {
  const s = (t >>> 0) + (o >>> 0);
  return { h: e + n + (s / 2 ** 32 | 0) | 0, l: s | 0 };
}
const Ya = (e, t, n) => (e >>> 0) + (t >>> 0) + (n >>> 0), Za = (e, t, n, o) => t + n + o + (e / 2 ** 32 | 0) | 0, Xa = (e, t, n, o) => (e >>> 0) + (t >>> 0) + (n >>> 0) + (o >>> 0), Ja = (e, t, n, o, s) => t + n + o + s + (e / 2 ** 32 | 0) | 0, ei = (e, t, n, o, s) => (e >>> 0) + (t >>> 0) + (n >>> 0) + (o >>> 0) + (s >>> 0), ti = (e, t, n, o, s, a) => t + n + o + s + a + (e / 2 ** 32 | 0) | 0, Cn = Ka([
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
].map((e) => BigInt(e))), ri = Cn[0], si = Cn[1], Pe = /* @__PURE__ */ new Uint32Array(80), Re = /* @__PURE__ */ new Uint32Array(80);
class ni extends Qa {
  constructor(t) {
    super(128, t, 16, !1);
  }
  // prettier-ignore
  get() {
    const { Ah: t, Al: n, Bh: o, Bl: s, Ch: a, Cl: c, Dh: i, Dl: l, Eh: u, El: f, Fh: h, Fl: p, Gh: b, Gl: g, Hh: m, Hl: E } = this;
    return [t, n, o, s, a, c, i, l, u, f, h, p, b, g, m, E];
  }
  // prettier-ignore
  set(t, n, o, s, a, c, i, l, u, f, h, p, b, g, m, E) {
    this.Ah = t | 0, this.Al = n | 0, this.Bh = o | 0, this.Bl = s | 0, this.Ch = a | 0, this.Cl = c | 0, this.Dh = i | 0, this.Dl = l | 0, this.Eh = u | 0, this.El = f | 0, this.Fh = h | 0, this.Fl = p | 0, this.Gh = b | 0, this.Gl = g | 0, this.Hh = m | 0, this.Hl = E | 0;
  }
  process(t, n) {
    for (let N = 0; N < 16; N++, n += 4)
      Pe[N] = t.getUint32(n), Re[N] = t.getUint32(n += 4);
    for (let N = 16; N < 80; N++) {
      const x = Pe[N - 15] | 0, B = Re[N - 15] | 0, w = je(x, B, 1) ^ je(x, B, 8) ^ ns(x, B, 7), k = ze(x, B, 1) ^ ze(x, B, 8) ^ os(x, B, 7), v = Pe[N - 2] | 0, A = Re[N - 2] | 0, L = je(v, A, 19) ^ lt(v, A, 61) ^ ns(v, A, 6), P = ze(v, A, 19) ^ dt(v, A, 61) ^ os(v, A, 6), S = Xa(k, P, Re[N - 7], Re[N - 16]), M = Ja(S, w, L, Pe[N - 7], Pe[N - 16]);
      Pe[N] = M | 0, Re[N] = S | 0;
    }
    let { Ah: o, Al: s, Bh: a, Bl: c, Ch: i, Cl: l, Dh: u, Dl: f, Eh: h, El: p, Fh: b, Fl: g, Gh: m, Gl: E, Hh: y, Hl: C } = this;
    for (let N = 0; N < 80; N++) {
      const x = je(h, p, 14) ^ je(h, p, 18) ^ lt(h, p, 41), B = ze(h, p, 14) ^ ze(h, p, 18) ^ dt(h, p, 41), w = h & b ^ ~h & m, k = p & g ^ ~p & E, v = ei(C, B, k, si[N], Re[N]), A = ti(v, y, x, w, ri[N], Pe[N]), L = v | 0, P = je(o, s, 28) ^ lt(o, s, 34) ^ lt(o, s, 39), S = ze(o, s, 28) ^ dt(o, s, 34) ^ dt(o, s, 39), M = o & a ^ o & i ^ a & i, I = s & c ^ s & l ^ c & l;
      y = m | 0, C = E | 0, m = b | 0, E = g | 0, b = h | 0, g = p | 0, { h, l: p } = xe(u | 0, f | 0, A | 0, L | 0), u = i | 0, f = l | 0, i = a | 0, l = c | 0, a = o | 0, c = s | 0;
      const _ = Ya(L, S, I);
      o = Za(_, A, P, M), s = _ | 0;
    }
    ({ h: o, l: s } = xe(this.Ah | 0, this.Al | 0, o | 0, s | 0)), { h: a, l: c } = xe(this.Bh | 0, this.Bl | 0, a | 0, c | 0), { h: i, l } = xe(this.Ch | 0, this.Cl | 0, i | 0, l | 0), { h: u, l: f } = xe(this.Dh | 0, this.Dl | 0, u | 0, f | 0), { h, l: p } = xe(this.Eh | 0, this.El | 0, h | 0, p | 0), { h: b, l: g } = xe(this.Fh | 0, this.Fl | 0, b | 0, g | 0), { h: m, l: E } = xe(this.Gh | 0, this.Gl | 0, m | 0, E | 0), { h: y, l: C } = xe(this.Hh | 0, this.Hl | 0, y | 0, C | 0), this.set(o, s, a, c, i, l, u, f, h, p, b, g, m, E, y, C);
  }
  roundClean() {
    Ar(Pe, Re);
  }
  destroy() {
    Ar(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class oi extends ni {
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
const ai = /* @__PURE__ */ Va(
  () => new oi(),
  /* @__PURE__ */ $a(3)
);
const xn = /* @__PURE__ */ BigInt(0), as = /* @__PURE__ */ BigInt(1);
function vr(e, t = "") {
  if (typeof e != "boolean") {
    const n = t && `"${t}" `;
    throw new Error(n + "expected boolean, got type=" + typeof e);
  }
  return e;
}
function ii(e) {
  if (typeof e == "bigint") {
    if (!gt(e))
      throw new Error("positive bigint expected, got " + e);
  } else
    Tr(e);
  return e;
}
function Sn(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  return e === "" ? xn : BigInt("0x" + e);
}
function ci(e) {
  return Sn(Mr(e));
}
function bt(e) {
  return Sn(Mr(kr(ie(e)).reverse()));
}
function Ln(e, t) {
  Tr(t), e = ii(e);
  const n = En(e.toString(16).padStart(t * 2, "0"));
  if (n.length !== t)
    throw new Error("number too large");
  return n;
}
function li(e, t) {
  return Ln(e, t).reverse();
}
function kr(e) {
  return Uint8Array.from(e);
}
const gt = (e) => typeof e == "bigint" && xn <= e;
function di(e, t, n) {
  return gt(e) && gt(t) && gt(n) && t <= e && e < n;
}
function is(e, t, n, o) {
  if (!di(t, n, o))
    throw new Error("expected valid " + e + ": " + n + " <= n < " + o + ", got " + t);
}
const ui = (e) => (as << BigInt(e)) - as;
function Ir(e, t = {}, n = {}) {
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
function cs(e) {
  const t = /* @__PURE__ */ new WeakMap();
  return (n, ...o) => {
    const s = t.get(n);
    if (s !== void 0)
      return s;
    const a = e(n, ...o);
    return t.set(n, a), a;
  };
}
const me = /* @__PURE__ */ BigInt(0), he = /* @__PURE__ */ BigInt(1), Ue = /* @__PURE__ */ BigInt(2), Bn = /* @__PURE__ */ BigInt(3), Pn = /* @__PURE__ */ BigInt(4), Rn = /* @__PURE__ */ BigInt(5), hi = /* @__PURE__ */ BigInt(7), Tn = /* @__PURE__ */ BigInt(8), fi = /* @__PURE__ */ BigInt(9), Mn = /* @__PURE__ */ BigInt(16);
function oe(e, t) {
  const n = e % t;
  return n >= me ? n : t + n;
}
function ve(e, t, n) {
  let o = e;
  for (; t-- > me; )
    o *= o, o %= n;
  return o;
}
function ls(e, t) {
  if (e === me)
    throw new Error("invert: expected non-zero number");
  if (t <= me)
    throw new Error("invert: expected positive modulus, got " + t);
  let n = oe(e, t), o = t, s = me, a = he;
  for (; n !== me; ) {
    const i = o / n, l = o % n, u = s - a * i;
    o = n, n = l, s = a, a = u;
  }
  if (o !== he)
    throw new Error("invert: does not exist");
  return oe(s, t);
}
function _r(e, t, n) {
  if (!e.eql(e.sqr(t), n))
    throw new Error("Cannot find square root");
}
function In(e, t) {
  const n = (e.ORDER + he) / Pn, o = e.pow(t, n);
  return _r(e, o, t), o;
}
function mi(e, t) {
  const n = (e.ORDER - Rn) / Tn, o = e.mul(t, Ue), s = e.pow(o, n), a = e.mul(t, s), c = e.mul(e.mul(a, Ue), s), i = e.mul(a, e.sub(c, e.ONE));
  return _r(e, i, t), i;
}
function pi(e) {
  const t = Dr(e), n = _n(e), o = n(t, t.neg(t.ONE)), s = n(t, o), a = n(t, t.neg(o)), c = (e + hi) / Mn;
  return (i, l) => {
    let u = i.pow(l, c), f = i.mul(u, o);
    const h = i.mul(u, s), p = i.mul(u, a), b = i.eql(i.sqr(f), l), g = i.eql(i.sqr(h), l);
    u = i.cmov(u, f, b), f = i.cmov(p, h, g);
    const m = i.eql(i.sqr(f), l), E = i.cmov(u, f, m);
    return _r(i, E, l), E;
  };
}
function _n(e) {
  if (e < Bn)
    throw new Error("sqrt is not defined for small field");
  let t = e - he, n = 0;
  for (; t % Ue === me; )
    t /= Ue, n++;
  let o = Ue;
  const s = Dr(e);
  for (; ds(s, o) === 1; )
    if (o++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (n === 1)
    return In;
  let a = s.pow(o, t);
  const c = (t + he) / Ue;
  return function(l, u) {
    if (l.is0(u))
      return u;
    if (ds(l, u) !== 1)
      throw new Error("Cannot find square root");
    let f = n, h = l.mul(l.ONE, a), p = l.pow(u, t), b = l.pow(u, c);
    for (; !l.eql(p, l.ONE); ) {
      if (l.is0(p))
        return l.ZERO;
      let g = 1, m = l.sqr(p);
      for (; !l.eql(m, l.ONE); )
        if (g++, m = l.sqr(m), g === f)
          throw new Error("Cannot find square root");
      const E = he << BigInt(f - g - 1), y = l.pow(h, E);
      f = g, h = l.sqr(y), p = l.mul(p, h), b = l.mul(b, y);
    }
    return b;
  };
}
function gi(e) {
  return e % Pn === Bn ? In : e % Tn === Rn ? mi : e % Mn === fi ? pi(e) : _n(e);
}
const wi = (e, t) => (oe(e, t) & he) === he, bi = [
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
function yi(e) {
  const t = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  }, n = bi.reduce((o, s) => (o[s] = "function", o), t);
  return Ir(e, n), e;
}
function Ai(e, t, n) {
  if (n < me)
    throw new Error("invalid exponent, negatives unsupported");
  if (n === me)
    return e.ONE;
  if (n === he)
    return t;
  let o = e.ONE, s = t;
  for (; n > me; )
    n & he && (o = e.mul(o, s)), s = e.sqr(s), n >>= he;
  return o;
}
function Dn(e, t, n = !1) {
  const o = new Array(t.length).fill(n ? e.ZERO : void 0), s = t.reduce((c, i, l) => e.is0(i) ? c : (o[l] = c, e.mul(c, i)), e.ONE), a = e.inv(s);
  return t.reduceRight((c, i, l) => e.is0(i) ? c : (o[l] = e.mul(c, o[l]), e.mul(c, i)), a), o;
}
function ds(e, t) {
  const n = (e.ORDER - he) / Ue, o = e.pow(t, n), s = e.eql(o, e.ONE), a = e.eql(o, e.ZERO), c = e.eql(o, e.neg(e.ONE));
  if (!s && !a && !c)
    throw new Error("invalid Legendre symbol result");
  return s ? 1 : a ? 0 : -1;
}
function vi(e, t) {
  t !== void 0 && Tr(t);
  const n = t !== void 0 ? t : e.toString(2).length, o = Math.ceil(n / 8);
  return { nBitLength: n, nByteLength: o };
}
class ki {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = me;
  ONE = he;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(t, n = {}) {
    if (t <= me)
      throw new Error("invalid field: expected ORDER > 0, got " + t);
    let o;
    this.isLE = !1, n != null && typeof n == "object" && (typeof n.BITS == "number" && (o = n.BITS), typeof n.sqrt == "function" && (this.sqrt = n.sqrt), typeof n.isLE == "boolean" && (this.isLE = n.isLE), n.allowedLengths && (this._lengths = n.allowedLengths?.slice()), typeof n.modFromBytes == "boolean" && (this._mod = n.modFromBytes));
    const { nBitLength: s, nByteLength: a } = vi(t, o);
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
    return me <= t && t < this.ORDER;
  }
  is0(t) {
    return t === me;
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
    return Ai(this, t, n);
  }
  div(t, n) {
    return oe(t * ls(n, this.ORDER), this.ORDER);
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
    return ls(t, this.ORDER);
  }
  sqrt(t) {
    return this._sqrt || (this._sqrt = gi(this.ORDER)), this._sqrt(this, t);
  }
  toBytes(t) {
    return this.isLE ? li(t, this.BYTES) : Ln(t, this.BYTES);
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
    let l = a ? bt(t) : ci(t);
    if (i && (l = oe(l, c)), !n && !this.isValid(l))
      throw new Error("invalid field element: outside of range 0..ORDER");
    return l;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(t) {
    return Dn(this, t);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(t, n, o) {
    return o ? n : t;
  }
}
function Dr(e, t = {}) {
  return new ki(e, t);
}
const yt = /* @__PURE__ */ BigInt(0), Nr = /* @__PURE__ */ BigInt(1);
function us(e, t) {
  const n = t.negate();
  return e ? n : t;
}
function Ot(e, t) {
  const n = Dn(e.Fp, t.map((o) => o.Z));
  return t.map((o, s) => e.fromAffine(o.toAffine(n[s])));
}
function Un(e, t) {
  if (!Number.isSafeInteger(e) || e <= 0 || e > t)
    throw new Error("invalid window size, expected [1.." + t + "], got W=" + e);
}
function Wt(e, t) {
  Un(e, t);
  const n = Math.ceil(t / e) + 1, o = 2 ** (e - 1), s = 2 ** e, a = ui(e), c = BigInt(e);
  return { windows: n, windowSize: o, mask: a, maxNumber: s, shiftBy: c };
}
function hs(e, t, n) {
  const { windowSize: o, mask: s, maxNumber: a, shiftBy: c } = n;
  let i = Number(e & s), l = e >> c;
  i > o && (i -= a, l += Nr);
  const u = t * o, f = u + Math.abs(i) - 1, h = i === 0, p = i < 0, b = t % 2 !== 0;
  return { nextN: l, offset: f, isZero: h, isNeg: p, isNegF: b, offsetF: u };
}
const qt = /* @__PURE__ */ new WeakMap(), Fn = /* @__PURE__ */ new WeakMap();
function jt(e) {
  return Fn.get(e) || 1;
}
function fs(e) {
  if (e !== yt)
    throw new Error("invalid wNAF");
}
class Ni {
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
      n & Nr && (o = o.add(s)), s = s.double(), n >>= Nr;
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
    const { windows: o, windowSize: s } = Wt(n, this.bits), a = [];
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
    const c = Wt(t, this.bits);
    for (let i = 0; i < c.windows; i++) {
      const { nextN: l, offset: u, isZero: f, isNeg: h, isNegF: p, offsetF: b } = hs(o, i, c);
      o = l, f ? a = a.add(us(p, n[b])) : s = s.add(us(h, n[u]));
    }
    return fs(o), { p: s, f: a };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(t, n, o, s = this.ZERO) {
    const a = Wt(t, this.bits);
    for (let c = 0; c < a.windows && o !== yt; c++) {
      const { nextN: i, offset: l, isZero: u, isNeg: f } = hs(o, c, a);
      if (o = i, !u) {
        const h = n[l];
        s = s.add(f ? h.negate() : h);
      }
    }
    return fs(o), s;
  }
  getPrecomputes(t, n, o) {
    let s = qt.get(n);
    return s || (s = this.precomputeWindow(n, t), t !== 1 && (typeof o == "function" && (s = o(s)), qt.set(n, s))), s;
  }
  cached(t, n, o) {
    const s = jt(t);
    return this.wNAF(s, this.getPrecomputes(s, t, o), n);
  }
  unsafe(t, n, o, s) {
    const a = jt(t);
    return a === 1 ? this._unsafeLadder(t, n, s) : this.wNAFUnsafe(a, this.getPrecomputes(a, t, o), n, s);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(t, n) {
    Un(n, this.bits), Fn.set(t, n), qt.delete(t);
  }
  hasCache(t) {
    return jt(t) !== 1;
  }
}
function ms(e, t, n) {
  if (t) {
    if (t.ORDER !== e)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return yi(t), t;
  } else
    return Dr(e, { isLE: n });
}
function Ei(e, t, n = {}, o) {
  if (o === void 0 && (o = e === "edwards"), !t || typeof t != "object")
    throw new Error(`expected valid ${e} CURVE object`);
  for (const l of ["p", "n", "h"]) {
    const u = t[l];
    if (!(typeof u == "bigint" && u > yt))
      throw new Error(`CURVE.${l} must be positive bigint`);
  }
  const s = ms(t.p, n.Fp, o), a = ms(t.n, n.Fn, o), i = ["Gx", "Gy", "a", "d"];
  for (const l of i)
    if (!s.isValid(t[l]))
      throw new Error(`CURVE.${l} must be valid field element of CURVE.Fp`);
  return t = Object.freeze(Object.assign({}, t)), { CURVE: t, Fp: s, Fn: a };
}
function Ci(e, t) {
  return function(o) {
    const s = e(o);
    return { secretKey: s, publicKey: t(s) };
  };
}
const Te = BigInt(0), ae = BigInt(1), zt = BigInt(2), xi = BigInt(8);
function Si(e, t, n, o) {
  const s = e.sqr(n), a = e.sqr(o), c = e.add(e.mul(t.a, s), a), i = e.add(e.ONE, e.mul(t.d, e.mul(s, a)));
  return e.eql(c, i);
}
function Li(e, t = {}) {
  const n = Ei("edwards", e, t, t.FpFnLE), { Fp: o, Fn: s } = n;
  let a = n.CURVE;
  const { h: c } = a;
  Ir(t, {}, { uvRatio: "function" });
  const i = zt << BigInt(s.BYTES * 8) - ae, l = (E) => o.create(E), u = t.uvRatio || ((E, y) => {
    try {
      return { isValid: !0, value: o.sqrt(o.div(E, y)) };
    } catch {
      return { isValid: !1, value: Te };
    }
  });
  if (!Si(o, a, a.Gx, a.Gy))
    throw new Error("bad curve params: generator point");
  function f(E, y, C = !1) {
    const N = C ? ae : Te;
    return is("coordinate " + E, y, N, i), y;
  }
  function h(E) {
    if (!(E instanceof g))
      throw new Error("EdwardsPoint expected");
  }
  const p = cs((E, y) => {
    const { X: C, Y: N, Z: x } = E, B = E.is0();
    y == null && (y = B ? xi : o.inv(x));
    const w = l(C * y), k = l(N * y), v = o.mul(x, y);
    if (B)
      return { x: Te, y: ae };
    if (v !== ae)
      throw new Error("invZ was invalid");
    return { x: w, y: k };
  }), b = cs((E) => {
    const { a: y, d: C } = a;
    if (E.is0())
      throw new Error("bad point: ZERO");
    const { X: N, Y: x, Z: B, T: w } = E, k = l(N * N), v = l(x * x), A = l(B * B), L = l(A * A), P = l(k * y), S = l(A * l(P + v)), M = l(L + l(C * l(k * v)));
    if (S !== M)
      throw new Error("bad point: equation left != right (1)");
    const I = l(N * x), _ = l(B * w);
    if (I !== _)
      throw new Error("bad point: equation left != right (2)");
    return !0;
  });
  class g {
    // base / generator point
    static BASE = new g(a.Gx, a.Gy, ae, l(a.Gx * a.Gy));
    // zero / infinity / identity point
    static ZERO = new g(Te, ae, ae, Te);
    // 0, 1, 1, 0
    // math field
    static Fp = o;
    // scalar field
    static Fn = s;
    X;
    Y;
    Z;
    T;
    constructor(y, C, N, x) {
      this.X = f("x", y), this.Y = f("y", C), this.Z = f("z", N, !0), this.T = f("t", x), Object.freeze(this);
    }
    static CURVE() {
      return a;
    }
    static fromAffine(y) {
      if (y instanceof g)
        throw new Error("extended point not allowed");
      const { x: C, y: N } = y || {};
      return f("x", C), f("y", N), new g(C, N, ae, l(C * N));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(y, C = !1) {
      const N = o.BYTES, { a: x, d: B } = a;
      y = kr(ie(y, N, "point")), vr(C, "zip215");
      const w = kr(y), k = y[N - 1];
      w[N - 1] = k & -129;
      const v = bt(w), A = C ? i : o.ORDER;
      is("point.y", v, Te, A);
      const L = l(v * v), P = l(L - ae), S = l(B * L - x);
      let { isValid: M, value: I } = u(P, S);
      if (!M)
        throw new Error("bad point: invalid y coordinate");
      const _ = (I & ae) === ae, O = (k & 128) !== 0;
      if (!C && I === Te && O)
        throw new Error("bad point: x=0 and x_0=1");
      return O !== _ && (I = l(-I)), g.fromAffine({ x: I, y: v });
    }
    static fromHex(y, C = !1) {
      return g.fromBytes(En(y), C);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(y = 8, C = !0) {
      return m.createCache(this, y), C || this.multiply(zt), this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      b(this);
    }
    // Compare one point to another.
    equals(y) {
      h(y);
      const { X: C, Y: N, Z: x } = this, { X: B, Y: w, Z: k } = y, v = l(C * k), A = l(B * x), L = l(N * k), P = l(w * x);
      return v === A && L === P;
    }
    is0() {
      return this.equals(g.ZERO);
    }
    negate() {
      return new g(l(-this.X), this.Y, this.Z, l(-this.T));
    }
    // Fast algo for doubling Extended Point.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
    // Cost: 4M + 4S + 1*a + 6add + 1*2.
    double() {
      const { a: y } = a, { X: C, Y: N, Z: x } = this, B = l(C * C), w = l(N * N), k = l(zt * l(x * x)), v = l(y * B), A = C + N, L = l(l(A * A) - B - w), P = v + w, S = P - k, M = v - w, I = l(L * S), _ = l(P * M), O = l(L * M), W = l(S * P);
      return new g(I, _, W, O);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(y) {
      h(y);
      const { a: C, d: N } = a, { X: x, Y: B, Z: w, T: k } = this, { X: v, Y: A, Z: L, T: P } = y, S = l(x * v), M = l(B * A), I = l(k * N * P), _ = l(w * L), O = l((x + B) * (v + A) - S - M), W = _ - I, V = _ + I, H = l(M - C * S), D = l(O * W), U = l(V * H), K = l(O * H), re = l(W * V);
      return new g(D, U, re, K);
    }
    subtract(y) {
      return this.add(y.negate());
    }
    // Constant-time multiplication.
    multiply(y) {
      if (!s.isValidNot0(y))
        throw new Error("invalid scalar: expected 1 <= sc < curve.n");
      const { p: C, f: N } = m.cached(this, y, (x) => Ot(g, x));
      return Ot(g, [C, N])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Does NOT allow scalars higher than CURVE.n.
    // Accepts optional accumulator to merge with multiply (important for sparse scalars)
    multiplyUnsafe(y, C = g.ZERO) {
      if (!s.isValid(y))
        throw new Error("invalid scalar: expected 0 <= sc < curve.n");
      return y === Te ? g.ZERO : this.is0() || y === ae ? this : m.unsafe(this, y, (N) => Ot(g, N), C);
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
      return m.unsafe(this, a.n).is0();
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    toAffine(y) {
      return p(this, y);
    }
    clearCofactor() {
      return c === ae ? this : this.multiplyUnsafe(c);
    }
    toBytes() {
      const { x: y, y: C } = this.toAffine(), N = o.toBytes(C);
      return N[N.length - 1] |= y & ae ? 128 : 0, N;
    }
    toHex() {
      return Mr(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const m = new Ni(g, s.BITS);
  return g.BASE.precompute(8), g;
}
function Bi(e, t, n = {}) {
  if (typeof t != "function")
    throw new Error('"hash" function param is required');
  Ir(n, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    mapToCurve: "function"
  });
  const { prehash: o } = n, { BASE: s, Fp: a, Fn: c } = e, i = n.randomBytes || Ha, l = n.adjustScalarBytes || ((v) => v), u = n.domain || ((v, A, L) => {
    if (vr(L, "phflag"), A.length || L)
      throw new Error("Contexts/pre-hash are not supported");
    return v;
  });
  function f(v) {
    return c.create(bt(v));
  }
  function h(v) {
    const A = N.secretKey;
    ie(v, N.secretKey, "secretKey");
    const L = ie(t(v), 2 * A, "hashedSecretKey"), P = l(L.slice(0, A)), S = L.slice(A, 2 * A), M = f(P);
    return { head: P, prefix: S, scalar: M };
  }
  function p(v) {
    const { head: A, prefix: L, scalar: P } = h(v), S = s.multiply(P), M = S.toBytes();
    return { head: A, prefix: L, scalar: P, point: S, pointBytes: M };
  }
  function b(v) {
    return p(v).pointBytes;
  }
  function g(v = Uint8Array.of(), ...A) {
    const L = rs(...A);
    return f(t(u(L, ie(v, void 0, "context"), !!o)));
  }
  function m(v, A, L = {}) {
    v = ie(v, void 0, "message"), o && (v = o(v));
    const { prefix: P, scalar: S, pointBytes: M } = p(A), I = g(L.context, P, v), _ = s.multiply(I).toBytes(), O = g(L.context, _, M, v), W = c.create(I + O * S);
    if (!c.isValid(W))
      throw new Error("sign failed: invalid s");
    const V = rs(_, c.toBytes(W));
    return ie(V, N.signature, "result");
  }
  const E = { zip215: !0 };
  function y(v, A, L, P = E) {
    const { context: S, zip215: M } = P, I = N.signature;
    v = ie(v, I, "signature"), A = ie(A, void 0, "message"), L = ie(L, N.publicKey, "publicKey"), M !== void 0 && vr(M, "zip215"), o && (A = o(A));
    const _ = I / 2, O = v.subarray(0, _), W = bt(v.subarray(_, I));
    let V, H, D;
    try {
      V = e.fromBytes(L, M), H = e.fromBytes(O, M), D = s.multiplyUnsafe(W);
    } catch {
      return !1;
    }
    if (!M && V.isSmallOrder())
      return !1;
    const U = g(S, H.toBytes(), V.toBytes(), A);
    return H.add(V.multiplyUnsafe(U)).subtract(D).clearCofactor().is0();
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
  function B(v) {
    return kn(v) && v.length === c.BYTES;
  }
  function w(v, A) {
    try {
      return !!e.fromBytes(v, A);
    } catch {
      return !1;
    }
  }
  const k = {
    getExtendedPublicKey: p,
    randomSecretKey: x,
    isValidSecretKey: B,
    isValidPublicKey: w,
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
      const { y: A } = e.fromBytes(v), L = N.publicKey, P = L === 32;
      if (!P && L !== 57)
        throw new Error("only defined for 25519 and 448");
      const S = P ? a.div(ae + A, ae - A) : a.div(A - ae, A + ae);
      return a.toBytes(S);
    },
    toMontgomerySecret(v) {
      const A = N.secretKey;
      ie(v, A);
      const L = t(v.subarray(0, A));
      return l(L).subarray(0, A);
    }
  };
  return Object.freeze({
    keygen: Ci(x, b),
    getPublicKey: b,
    sign: m,
    verify: y,
    utils: k,
    Point: e,
    lengths: N
  });
}
const Pi = BigInt(1), ps = BigInt(2), Ri = BigInt(5), Ti = BigInt(8), Ur = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"), Mi = {
  p: Ur,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: Ti,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
};
function Ii(e) {
  const t = BigInt(10), n = BigInt(20), o = BigInt(40), s = BigInt(80), a = Ur, i = e * e % a * e % a, l = ve(i, ps, a) * i % a, u = ve(l, Pi, a) * e % a, f = ve(u, Ri, a) * u % a, h = ve(f, t, a) * f % a, p = ve(h, n, a) * h % a, b = ve(p, o, a) * p % a, g = ve(b, s, a) * b % a, m = ve(g, s, a) * b % a, E = ve(m, t, a) * f % a;
  return { pow_p_5_8: ve(E, ps, a) * e % a, b2: i };
}
function _i(e) {
  return e[0] &= 248, e[31] &= 127, e[31] |= 64, e;
}
const gs = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function Di(e, t) {
  const n = Ur, o = oe(t * t * t, n), s = oe(o * o * t, n), a = Ii(e * s).pow_p_5_8;
  let c = oe(e * o * a, n);
  const i = oe(t * c * c, n), l = c, u = oe(c * gs, n), f = i === e, h = i === oe(-e, n), p = i === oe(-e * gs, n);
  return f && (c = l), (h || p) && (c = u), wi(c, n) && (c = oe(-c, n)), { isValid: f || h, value: c };
}
const Ui = /* @__PURE__ */ Li(Mi, { uvRatio: Di });
function Fi(e) {
  return Bi(Ui, ai, Object.assign({ adjustScalarBytes: _i }, e));
}
const Oi = /* @__PURE__ */ Fi({});
function Wi(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Pt(e, ...t) {
  if (!Wi(e))
    throw new Error("Uint8Array expected");
  if (t.length > 0 && !t.includes(e.length))
    throw new Error("Uint8Array expected of length " + t + ", got length=" + e.length);
}
function ws(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function qi(e, t) {
  Pt(e);
  const n = t.outputLen;
  if (e.length < n)
    throw new Error("digestInto() expects output buffer of length at least " + n);
}
function Er(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function Vt(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function ke(e, t) {
  return e << 32 - t | e >>> t;
}
function ji(e) {
  if (typeof e != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(e));
}
function On(e) {
  return typeof e == "string" && (e = ji(e)), Pt(e), e;
}
class zi {
}
function Vi(e) {
  const t = (o) => e().update(On(o)).digest(), n = e();
  return t.outputLen = n.outputLen, t.blockLen = n.blockLen, t.create = () => e(), t;
}
function Hi(e, t, n, o) {
  if (typeof e.setBigUint64 == "function")
    return e.setBigUint64(t, n, o);
  const s = BigInt(32), a = BigInt(4294967295), c = Number(n >> s & a), i = Number(n & a), l = o ? 4 : 0, u = o ? 0 : 4;
  e.setUint32(t + l, c, o), e.setUint32(t + u, i, o);
}
function $i(e, t, n) {
  return e & t ^ ~e & n;
}
function Qi(e, t, n) {
  return e & t ^ e & n ^ t & n;
}
class Gi extends zi {
  constructor(t, n, o, s) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = t, this.outputLen = n, this.padOffset = o, this.isLE = s, this.buffer = new Uint8Array(t), this.view = Vt(this.buffer);
  }
  update(t) {
    ws(this), t = On(t), Pt(t);
    const { view: n, buffer: o, blockLen: s } = this, a = t.length;
    for (let c = 0; c < a; ) {
      const i = Math.min(s - this.pos, a - c);
      if (i === s) {
        const l = Vt(t);
        for (; s <= a - c; c += s)
          this.process(l, c);
        continue;
      }
      o.set(t.subarray(c, c + i), this.pos), this.pos += i, c += i, this.pos === s && (this.process(n, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    ws(this), qi(t, this), this.finished = !0;
    const { buffer: n, view: o, blockLen: s, isLE: a } = this;
    let { pos: c } = this;
    n[c++] = 128, Er(this.buffer.subarray(c)), this.padOffset > s - c && (this.process(o, 0), c = 0);
    for (let h = c; h < s; h++)
      n[h] = 0;
    Hi(o, s - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const i = Vt(t), l = this.outputLen;
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
const Me = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), Ki = /* @__PURE__ */ Uint32Array.from([
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
]), Ie = /* @__PURE__ */ new Uint32Array(64);
class Yi extends Gi {
  constructor(t = 32) {
    super(64, t, 8, !1), this.A = Me[0] | 0, this.B = Me[1] | 0, this.C = Me[2] | 0, this.D = Me[3] | 0, this.E = Me[4] | 0, this.F = Me[5] | 0, this.G = Me[6] | 0, this.H = Me[7] | 0;
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
      Ie[h] = t.getUint32(n, !1);
    for (let h = 16; h < 64; h++) {
      const p = Ie[h - 15], b = Ie[h - 2], g = ke(p, 7) ^ ke(p, 18) ^ p >>> 3, m = ke(b, 17) ^ ke(b, 19) ^ b >>> 10;
      Ie[h] = m + Ie[h - 7] + g + Ie[h - 16] | 0;
    }
    let { A: o, B: s, C: a, D: c, E: i, F: l, G: u, H: f } = this;
    for (let h = 0; h < 64; h++) {
      const p = ke(i, 6) ^ ke(i, 11) ^ ke(i, 25), b = f + p + $i(i, l, u) + Ki[h] + Ie[h] | 0, m = (ke(o, 2) ^ ke(o, 13) ^ ke(o, 22)) + Qi(o, s, a) | 0;
      f = u, u = l, l = i, i = c + b | 0, c = a, a = s, s = o, o = b + m | 0;
    }
    o = o + this.A | 0, s = s + this.B | 0, a = a + this.C | 0, c = c + this.D | 0, i = i + this.E | 0, l = l + this.F | 0, u = u + this.G | 0, f = f + this.H | 0, this.set(o, s, a, c, i, l, u, f);
  }
  roundClean() {
    Er(Ie);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), Er(this.buffer);
  }
}
const Wn = /* @__PURE__ */ Vi(() => new Yi()), Zi = Wn, Xi = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function Ji(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = Zi(e), n = Oi.getPublicKey(t), o = new Uint8Array(64);
  return o.set(t, 0), o.set(n, 32), tn(t), { publicKey: n, secretKey: o };
}
function qn(e) {
  const t = Ji(e), n = t.publicKey;
  return tn(t.secretKey), n;
}
function jn(e) {
  if (e.length !== 32)
    throw new Error(`Invalid public key length: expected 32, got ${e.length}`);
  return ec(e);
}
function ec(e) {
  let t = 0;
  for (let s = 0; s < e.length && e[s] === 0; s++)
    t++;
  let n = 0n;
  for (let s = 0; s < e.length; s++)
    n = n * 256n + BigInt(e[s]);
  let o = "";
  for (; n > 0n; ) {
    const s = Number(n % 58n);
    o = Xi[s] + o, n = n / 58n;
  }
  return "1".repeat(t) + o;
}
const tc = 2, rc = 3;
function zn(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = Cr(e), n = vn.share(t, rc, tc);
  if (n.length !== 3)
    throw new Error(`Unexpected share count: ${n.length}`);
  const o = Ht(n[0]), s = Ht(n[1]), a = Ht(n[2]);
  return {
    shareA: Fe(o),
    shareB: Fe(s),
    shareC: Fe(a)
  };
}
function sc(e, t, n) {
  const o = bs(e), s = bs(t);
  try {
    const a = vn.combine([o, s]), c = Vn(a);
    if (c.length !== 16)
      throw new Error(`Reconstructed seed has wrong length: ${c.length}`);
    return rn(c);
  } catch (a) {
    throw a instanceof Error && a.message.startsWith("Reconstructed seed") || a instanceof Error && a.message.startsWith("Invalid expectedPublicKey") || a instanceof Error && a.message.startsWith("Reconstructed seed does not match") ? a : new Error("Failed to reconstruct seed from shares");
  }
}
function Cr(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
}
function Vn(e) {
  if (!/^[0-9a-fA-F]*$/.test(e))
    throw new Error("Invalid hex string: contains non-hex characters");
  if (e.length % 2 !== 0)
    throw new Error(`Invalid hex string: length ${e.length} is odd (must be even)`);
  const t = new Uint8Array(e.length / 2);
  for (let n = 0; n < t.length; n++)
    t[n] = parseInt(e.substr(n * 2, 2), 16);
  return t;
}
function Ht(e) {
  const t = e.length % 2 !== 0, n = t ? "0" + e : e, o = Vn(n), s = new Uint8Array(1 + o.length);
  return s[0] = t ? 1 : 0, s.set(o, 1), s;
}
function bs(e) {
  const t = e[0];
  if (t === 0 || t === 1) {
    const o = t === 1, s = e.subarray(1), a = Cr(s), c = o ? a.substring(1) : a;
    if (/^[0-9a-f]/.test(c))
      return c;
  }
  const n = Cr(e);
  return n.startsWith("0") && !n.startsWith("00") ? n.substring(1) : n;
}
function At(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Hn(e, t) {
  return Array.isArray(t) ? t.length === 0 ? !0 : e ? t.every((n) => typeof n == "string") : t.every((n) => Number.isSafeInteger(n)) : !1;
}
function nc(e) {
  if (typeof e != "function")
    throw new Error("function expected");
  return !0;
}
function vt(e, t) {
  if (typeof t != "string")
    throw new Error(`${e}: string expected`);
  return !0;
}
function Ke(e) {
  if (!Number.isSafeInteger(e))
    throw new Error(`invalid integer: ${e}`);
}
function kt(e) {
  if (!Array.isArray(e))
    throw new Error("array expected");
}
function Nt(e, t) {
  if (!Hn(!0, t))
    throw new Error(`${e}: array of strings expected`);
}
function $n(e, t) {
  if (!Hn(!1, t))
    throw new Error(`${e}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function oc(...e) {
  const t = (a) => a, n = (a, c) => (i) => a(c(i)), o = e.map((a) => a.encode).reduceRight(n, t), s = e.map((a) => a.decode).reduce(n, t);
  return { encode: o, decode: s };
}
// @__NO_SIDE_EFFECTS__
function ac(e) {
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
function ic(e = "") {
  return vt("join", e), {
    encode: (t) => (Nt("join.decode", t), t.join(e)),
    decode: (t) => (vt("join.decode", t), t.split(e))
  };
}
// @__NO_SIDE_EFFECTS__
function cc(e, t = "=") {
  return Ke(e), vt("padding", t), {
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
function xr(e, t, n) {
  if (t < 2)
    throw new Error(`convertRadix: invalid from=${t}, base cannot be less than 2`);
  if (n < 2)
    throw new Error(`convertRadix: invalid to=${n}, base cannot be less than 2`);
  if (kt(e), !e.length)
    return [];
  let o = 0;
  const s = [], a = Array.from(e, (i) => {
    if (Ke(i), i < 0 || i >= t)
      throw new Error(`invalid integer: ${i}`);
    return i;
  }), c = a.length;
  for (; ; ) {
    let i = 0, l = !0;
    for (let u = o; u < c; u++) {
      const f = a[u], h = t * i, p = h + f;
      if (!Number.isSafeInteger(p) || h / t !== i || p - f !== h)
        throw new Error("convertRadix: carry overflow");
      const b = p / n;
      i = p % n;
      const g = Math.floor(b);
      if (a[u] = g, !Number.isSafeInteger(g) || g * n + i !== p)
        throw new Error("convertRadix: carry overflow");
      if (l)
        g ? l = !1 : o = u;
      else continue;
    }
    if (s.push(i), l)
      break;
  }
  for (let i = 0; i < e.length - 1 && e[i] === 0; i++)
    s.push(0);
  return s.reverse();
}
const Qn = (e, t) => t === 0 ? e : Qn(t, e % t), Et = /* @__NO_SIDE_EFFECTS__ */ (e, t) => e + (t - Qn(e, t)), $t = /* @__PURE__ */ (() => {
  let e = [];
  for (let t = 0; t < 40; t++)
    e.push(2 ** t);
  return e;
})();
function Sr(e, t, n, o) {
  if (kt(e), t <= 0 || t > 32)
    throw new Error(`convertRadix2: wrong from=${t}`);
  if (n <= 0 || n > 32)
    throw new Error(`convertRadix2: wrong to=${n}`);
  if (/* @__PURE__ */ Et(t, n) > 32)
    throw new Error(`convertRadix2: carry overflow from=${t} to=${n} carryBits=${/* @__PURE__ */ Et(t, n)}`);
  let s = 0, a = 0;
  const c = $t[t], i = $t[n] - 1, l = [];
  for (const u of e) {
    if (Ke(u), u >= c)
      throw new Error(`convertRadix2: invalid data word=${u} from=${t}`);
    if (s = s << t | u, a + t > 32)
      throw new Error(`convertRadix2: carry overflow pos=${a} from=${t}`);
    for (a += t; a >= n; a -= n)
      l.push((s >> a - n & i) >>> 0);
    const f = $t[a];
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
function lc(e) {
  Ke(e);
  const t = 2 ** 8;
  return {
    encode: (n) => {
      if (!At(n))
        throw new Error("radix.encode input should be Uint8Array");
      return xr(Array.from(n), t, e);
    },
    decode: (n) => ($n("radix.decode", n), Uint8Array.from(xr(n, e, t)))
  };
}
// @__NO_SIDE_EFFECTS__
function dc(e, t = !1) {
  if (Ke(e), e <= 0 || e > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Et(8, e) > 32 || /* @__PURE__ */ Et(e, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (n) => {
      if (!At(n))
        throw new Error("radix2.encode input should be Uint8Array");
      return Sr(Array.from(n), 8, e, !t);
    },
    decode: (n) => ($n("radix2.decode", n), Uint8Array.from(Sr(n, e, 8, t)))
  };
}
function uc(e, t) {
  return Ke(e), nc(t), {
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
  alphabet: ac,
  chain: oc,
  checksum: uc,
  convertRadix: xr,
  convertRadix2: Sr,
  radix: lc,
  radix2: dc,
  join: ic,
  padding: cc
};
const hc = (e) => e[0] === "あいこくしん";
function fc(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function mc(e) {
  const t = fc(e), n = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: n };
}
function Gn(e) {
  Pt(e, 16, 20, 24, 28, 32);
}
const pc = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([Wn(e)[0] >> t << t]);
};
function Kn(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), ut.chain(ut.checksum(1, pc), ut.radix2(11, !0), ut.alphabet(e));
}
function Fr(e, t) {
  const { words: n } = mc(e), o = Kn(t).decode(n);
  return Gn(o), o;
}
function Yn(e, t) {
  return Gn(e), Kn(t).encode(e).join(hc(t) ? "　" : " ");
}
function Or(e, t) {
  try {
    Fr(e, t);
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
`), ge = 12;
function gc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid share length: expected 16, got ${e.length}`);
  const n = Yn(e, Le).split(" ");
  if (n.length !== ge)
    throw new Error(`Unexpected word count: expected ${ge}, got ${n.length}`);
  return n;
}
function wc(e) {
  if (e.length !== ge)
    throw new Error(`Invalid word count: expected ${ge}, got ${e.length}`);
  const t = e.join(" ").toLowerCase().trim();
  if (!Or(t, Le))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const n = Fr(t, Le);
  if (n.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${n.length}`);
  return Fe(n);
}
function bc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const n = Yn(e, Le).split(" ");
  if (n.length !== ge)
    throw new Error(`Unexpected word count: expected ${ge}, got ${n.length}`);
  return n;
}
function yc(e) {
  if (e.length !== ge)
    throw new Error(`Invalid word count: expected ${ge}, got ${e.length}`);
  const t = e.join(" ").toLowerCase().trim();
  if (!Or(t, Le))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const n = Fr(t, Le);
  if (n.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${n.length}`);
  return rn(n);
}
function Zn(e) {
  if (e.length !== ge)
    return !1;
  const t = e.join(" ").toLowerCase().trim();
  return Or(t, Le);
}
function ht(e) {
  return Le.includes(e.toLowerCase().trim());
}
function Ac(e, t = 5) {
  const n = e.toLowerCase().trim();
  return n.length === 0 ? [] : Le.filter((o) => o.startsWith(n)).slice(0, t);
}
function vc(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 4)
    t.push(e.slice(n, n + 4));
  return t;
}
function kc(e) {
  return e.toLowerCase().replace(/[,\n\r\t]+/g, " ").split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);
}
function qu({
  className: e = "",
  variant: t = "default",
  size: n = "md",
  children: o,
  menuItems: s = [],
  hideSignOut: a = !1
}) {
  const { user: c, isAuthenticated: i, isLoading: l, openLoginModal: u, logout: f } = St(), [h, p] = R(!1), [b, g] = R(-1), m = J(null), E = J(null), y = j(
    () => [...s, ...a ? [] : [{ label: "Sign out", onClick: f }]],
    [s, a, f]
  );
  F(() => {
    if (!h) return;
    const w = (v) => {
      m.current && !m.current.contains(v.target) && (p(!1), g(-1));
    }, k = (v) => {
      v.key === "Escape" && (p(!1), g(-1), E.current?.focus());
    };
    return document.addEventListener("mousedown", w), document.addEventListener("keydown", k), () => {
      document.removeEventListener("mousedown", w), document.removeEventListener("keydown", k);
    };
  }, [h]);
  const C = T(
    (w) => {
      if (!(!h || y.length === 0))
        switch (w.key) {
          case "ArrowDown":
            w.preventDefault(), g((k) => (k + 1) % y.length);
            break;
          case "ArrowUp":
            w.preventDefault(), g((k) => (k - 1 + y.length) % y.length);
            break;
          case "Home":
            w.preventDefault(), g(0);
            break;
          case "End":
            w.preventDefault(), g(y.length - 1);
            break;
          case "Enter":
          case " ":
            b >= 0 && (w.preventDefault(), y[b].onClick(), p(!1), g(-1));
            break;
        }
    },
    [h, b, y]
  ), N = T(() => {
    y.length !== 0 && (p((w) => !w), g(-1));
  }, [y.length]), x = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, B = {
    default: "cedros-button-primary",
    outline: "cedros-button-outline",
    ghost: "cedros-button-ghost"
  };
  if (l)
    return /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: `cedros-button ${B[t]} ${x[n]} ${e}`,
        disabled: !0,
        children: /* @__PURE__ */ r($, { size: "sm" })
      }
    );
  if (i && c) {
    const w = c.name || c.email || "User", k = fn(c.picture);
    return (
      // L-08: Added keyboard handler and ref for accessibility
      /* @__PURE__ */ d("div", { className: "cedros-user-menu", ref: m, onKeyDown: C, children: [
        /* @__PURE__ */ d(
          "button",
          {
            ref: E,
            type: "button",
            className: `cedros-button cedros-user-button ${x[n]} ${e}`,
            "aria-haspopup": "menu",
            "aria-expanded": h,
            "aria-label": `User menu for ${w}`,
            onClick: N,
            children: [
              k ? /* @__PURE__ */ r(
                "img",
                {
                  src: k,
                  alt: w,
                  className: "cedros-user-avatar",
                  referrerPolicy: "no-referrer",
                  crossOrigin: "anonymous"
                }
              ) : /* @__PURE__ */ r("div", { className: "cedros-user-avatar-placeholder", children: (w[0] || "?").toUpperCase() }),
              /* @__PURE__ */ r("span", { className: "cedros-user-name", children: w })
            ]
          }
        ),
        h && /* @__PURE__ */ d("div", { className: "cedros-dropdown cedros-dropdown-open", role: "menu", children: [
          s.map((v, A) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item ${b === A ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: b === A ? 0 : -1,
              onClick: () => {
                v.onClick(), p(!1);
              },
              children: [
                v.icon && /* @__PURE__ */ r("span", { className: "cedros-dropdown-icon", children: v.icon }),
                v.label
              ]
            },
            A
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
                f(), p(!1);
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
      className: `cedros-button ${B[t]} ${x[n]} ${e}`,
      onClick: u,
      children: o || "Sign in"
    }
  );
}
function Wr() {
  const { config: e } = ne(), [t, n] = R(!1), [o, s] = R(!1), [a, c] = R(null), i = j(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: l, getRemainingAttempts: u } = mn({
    maxAttempts: 3,
    windowMs: 3e5
  }), f = T(
    async (g) => {
      if (!gn(g)) {
        const m = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw c(m), m;
      }
      try {
        l();
      } catch (m) {
        const E = {
          code: "RATE_LIMITED",
          message: m instanceof Error ? m.message : "Too many attempts"
        };
        throw c(E), E;
      }
      n(!0), c(null), s(!1);
      try {
        await i.post("/forgot-password", { email: g }), s(!0);
      } catch (m) {
        const E = q(m, "Unable to send the reset email. Please try again.");
        throw c(E), E;
      } finally {
        n(!1);
      }
    },
    [i, l]
  ), h = T(
    async (g, m) => {
      n(!0), c(null), s(!1);
      try {
        await i.post("/reset-password", { token: g, newPassword: m }), s(!0);
      } catch (E) {
        const y = q(E, "Unable to reset your password. Please try again.");
        throw c(y), y;
      } finally {
        n(!1);
      }
    },
    [i]
  ), p = T(() => c(null), []), b = T(() => {
    c(null), s(!1), n(!1);
  }, []);
  return {
    forgotPassword: f,
    resetPassword: h,
    isLoading: t,
    isSuccess: o,
    error: a,
    clearError: p,
    reset: b,
    remainingAttempts: u()
  };
}
function Nc(e) {
  return typeof e == "object" && e !== null && "mfaRequired" in e && e.mfaRequired === !0;
}
function Ec() {
  const { config: e, _internal: t } = ne(), [n, o] = R(!1), [s, a] = R(!1), [c, i] = R(null), l = j(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: u, getRemainingAttempts: f } = mn({
    maxAttempts: 3,
    windowMs: 3e5
  }), h = T(
    async (m) => {
      if (!gn(m)) {
        const E = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw i(E), E;
      }
      try {
        u();
      } catch (E) {
        const y = {
          code: "RATE_LIMITED",
          message: E instanceof Error ? E.message : "Too many attempts"
        };
        throw i(y), y;
      }
      o(!0), i(null), a(!1);
      try {
        await l.post("/instant-link", { email: m }), a(!0);
      } catch (E) {
        const y = q(E, "Unable to send the sign-in link. Please try again.");
        throw i(y), y;
      } finally {
        o(!1);
      }
    },
    [l, u]
  ), p = T(
    async (m) => {
      if (!m || m.trim().length === 0) {
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
            token: m
          }
        );
        return Nc(E) || (e.callbacks?.onLoginSuccess?.(E.user, "email"), t?.handleLoginSuccess(E.user, E.tokens)), E;
      } catch (E) {
        const y = q(E, "Unable to verify the sign-in link. Please try again.");
        throw i(y), y;
      } finally {
        o(!1);
      }
    },
    [l, e.callbacks, t]
  ), b = T(() => i(null), []), g = T(() => {
    i(null), a(!1), o(!1);
  }, []);
  return {
    sendInstantLink: h,
    verifyInstantLink: p,
    isLoading: n,
    isSuccess: s,
    error: c,
    clearError: b,
    reset: g,
    remainingAttempts: f()
  };
}
const Cc = {
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
function xc({
  mode: e = "reset",
  onSuccess: t,
  onCancel: n,
  className: o = ""
}) {
  const [s, a] = R(""), c = Wr(), i = Ec(), l = un(), u = e === "instantLink" ? { submit: i.sendInstantLink, isLoading: i.isLoading, isSuccess: i.isSuccess, error: i.error, clearError: i.clearError } : { submit: c.forgotPassword, isLoading: c.isLoading, isSuccess: c.isSuccess, error: c.error, clearError: c.clearError }, f = Cc[e], h = async (p) => {
    p.preventDefault();
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
    /* @__PURE__ */ r(te, { error: u.error, onDismiss: u.clearError }),
    /* @__PURE__ */ d("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ r("label", { htmlFor: l, className: "cedros-label", children: "Email address" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: l,
          type: "email",
          className: "cedros-input",
          value: s,
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
          disabled: u.isLoading || !s,
          children: u.isLoading ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r($, { size: "sm" }),
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
const Sc = {
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
function Lc() {
  const { config: e, _internal: t } = ne(), [n, o] = R(!1), [s, a] = R(!1), [c, i] = R(null), [l, u] = R(null), f = J(e), h = j(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  );
  F(() => {
    f.current = e;
  }, [e]), F(() => {
    if (!e.appleClientId)
      return;
    let m = !0;
    const E = () => {
      if (m)
        try {
          window.AppleID?.auth?.init({
            clientId: e.appleClientId,
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: !0
          }), m && a(!0);
        } catch {
          m && i({
            code: "SERVER_ERROR",
            message: "Unable to initialize Apple sign-in. Please refresh and try again."
          });
        }
    };
    return Sc.load().then(() => {
      m && E();
    }).catch(() => {
      m && i({
        code: "SERVER_ERROR",
        message: "Unable to load Apple sign-in. Please refresh and try again."
      });
    }), () => {
      m = !1;
    };
  }, [e.appleClientId]);
  const p = T(async () => {
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
    let m;
    try {
      const E = crypto.getRandomValues(new Uint8Array(32)), y = Array.from(E, (k) => k.toString(16).padStart(2, "0")).join(""), C = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(y)
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
      if (m = x.authorization?.id_token, !m)
        throw new Error("No ID token received from Apple");
      const B = x.user?.name ? `${x.user.name.firstName || ""} ${x.user.name.lastName || ""}`.trim() : void 0, w = await h.post("/apple", {
        idToken: m,
        name: B || void 0,
        nonce: y
      });
      return f.current.callbacks?.onLoginSuccess?.(w.user, "apple"), t?.handleLoginSuccess(w.user, w.tokens), o(!1), w;
    } catch (E) {
      if (E.error === "popup_closed_by_user") {
        const N = {
          code: "SERVER_ERROR",
          message: "Apple sign-in was cancelled."
        };
        throw i(N), o(!1), N;
      }
      const C = q(E, "Unable to sign in with Apple. Please try again.");
      throw C.code === "ACCOUNT_LINK_REQUIRED" && m && u(m), i(C), o(!1), C;
    }
  }, [e.appleClientId, s, h, t]), b = T(() => i(null), []), g = T(() => u(null), []);
  return {
    signIn: p,
    isLoading: n,
    isInitialized: s,
    error: c,
    clearError: b,
    pendingLinkIdToken: l,
    clearPendingLink: g
  };
}
function Xn() {
  if (typeof window > "u" || typeof navigator > "u")
    return !1;
  const e = navigator.userAgent.toLowerCase(), t = (navigator.platform || "").toLowerCase();
  return !!(/iphone|ipad|ipod/.test(e) || t.includes("mac") || /macintosh/.test(e) || t === "macintel" && navigator.maxTouchPoints > 1);
}
function Bc({
  onSuccess: e,
  onError: t,
  className: n = "",
  variant: o = "default",
  size: s = "md",
  disabled: a = !1,
  hideOnNonApple: c = !0
}) {
  const { signIn: i, isLoading: l, isInitialized: u } = Lc(), [f] = R(() => Xn());
  if (c && !f)
    return null;
  const h = async () => {
    try {
      await i(), e?.();
    } catch (g) {
      const m = g instanceof Error ? g : new Error(String(g));
      t?.(m);
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
      }[o]} ${p[s]} ${n}`,
      onClick: h,
      disabled: a || !u || l,
      "aria-label": "Sign in with Apple",
      children: [
        l ? /* @__PURE__ */ r($, { size: "sm" }) : /* @__PURE__ */ r(
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
function Pc(e) {
  return e.replace(/-/g, "+").replace(/_/g, "/");
}
function Ct(e) {
  de(typeof e == "string" && e.length > 0, "Expected base64url string");
  const t = Pc(e), n = t + "=".repeat((4 - t.length % 4) % 4), o = atob(n), s = new Uint8Array(o.length);
  for (let a = 0; a < o.length; a++) s[a] = o.charCodeAt(a);
  return s.buffer;
}
function Ve(e) {
  const t = new Uint8Array(e);
  let n = "";
  for (let s = 0; s < t.length; s++) n += String.fromCharCode(t[s]);
  return btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function Jn(e) {
  de(typeof e == "object" && e !== null, "Invalid credential descriptor");
  const t = e;
  return de(typeof t.type == "string", "Invalid credential descriptor type"), de(typeof t.id == "string", "Invalid credential descriptor id"), {
    type: t.type,
    id: Ct(t.id),
    transports: Array.isArray(t.transports) ? t.transports : void 0
  };
}
function Qt(e) {
  de(e && typeof e == "object", "Missing creation options");
  const t = e.publicKey;
  de(t && typeof t == "object", "Missing creation options.publicKey"), de(typeof t.challenge == "string", "Missing creation challenge"), de(typeof t.rp == "object" && t.rp !== null, "Missing rp"), de(typeof t.user == "object" && t.user !== null, "Missing user");
  const n = t.rp, o = t.user;
  de(typeof n.name == "string", "Missing rp.name"), de(typeof o.id == "string", "Missing user.id"), de(typeof o.name == "string", "Missing user.name"), de(typeof o.displayName == "string", "Missing user.displayName");
  const s = Array.isArray(t.excludeCredentials) ? t.excludeCredentials.map(Jn) : void 0, a = Array.isArray(t.pubKeyCredParams) ? t.pubKeyCredParams.map((i) => ({
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
function ys(e) {
  de(e && typeof e == "object", "Missing request options");
  const t = e.publicKey;
  de(t && typeof t == "object", "Missing request options.publicKey"), de(typeof t.challenge == "string", "Missing request challenge");
  const n = Array.isArray(t.allowCredentials) ? t.allowCredentials.map(Jn) : void 0, o = {
    challenge: Ct(t.challenge),
    rpId: typeof t.rpId == "string" ? t.rpId : void 0,
    timeout: typeof t.timeout == "number" ? t.timeout : void 0,
    userVerification: typeof t.userVerification == "string" ? t.userVerification : void 0,
    allowCredentials: n,
    extensions: typeof t.extensions == "object" && t.extensions !== null ? t.extensions : void 0
  };
  return o.hints = ["client-device"], o;
}
function Ze(e) {
  const t = Ve(e.rawId), n = e.response, s = { ...{
    clientDataJSON: Ve(n.clientDataJSON)
  } };
  if ("attestationObject" in n) {
    const a = n;
    if (s.attestationObject = Ve(a.attestationObject), typeof a.getTransports == "function")
      try {
        s.transports = a.getTransports();
      } catch {
      }
  }
  if ("authenticatorData" in n) {
    const a = n;
    s.authenticatorData = Ve(a.authenticatorData), s.signature = Ve(a.signature), a.userHandle && (s.userHandle = Ve(a.userHandle));
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
function Rc() {
  if (typeof window < "u") {
    const e = window.location?.hostname, t = e === "localhost" || e === "127.0.0.1" || e?.endsWith(".localhost");
    if (!(window.isSecureContext === !0) && !t)
      return !1;
  }
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator < "u" && typeof navigator.credentials < "u";
}
function Tc(e) {
  return typeof e == "object" && e !== null && "code" in e && "message" in e && typeof e.code == "string" && typeof e.message == "string";
}
function Xe(e) {
  if (!(e instanceof Error)) return null;
  const t = e.name;
  return t === "NotAllowedError" ? { code: "SERVER_ERROR", message: "Passkey operation was cancelled or timed out" } : t === "InvalidStateError" ? { code: "VALIDATION_ERROR", message: "Passkey is not available for this operation" } : t === "SecurityError" ? {
    code: "VALIDATION_ERROR",
    message: "Passkeys require HTTPS and a correctly configured relying party (WEBAUTHN_RP_ID / WEBAUTHN_RP_ORIGIN)"
  } : null;
}
function eo() {
  const { config: e, _internal: t } = ne(), [n, o] = R(!1), [s, a] = R(null), c = j(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      // Needed for authenticated registration endpoints when cookie auth is disabled
      getAccessToken: t?.getAccessToken
    }),
    [t?.getAccessToken, e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), i = T(() => a(null), []), l = Rc(), u = T(
    async (E) => {
      if (!l) {
        const y = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(y), y;
      }
      o(!0), a(null);
      try {
        const y = await c.post(
          "/webauthn/auth/options",
          { email: E?.email }
        ), C = ys(y.options), N = await navigator.credentials.get({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey authentication returned no credential");
        const x = await c.post("/webauthn/auth/verify", {
          challengeId: y.challengeId,
          credential: Ze(N)
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), x;
      } catch (y) {
        const N = Xe(y) ?? q(y, "Unable to sign in with passkey. Please try again.");
        throw a(N), N;
      } finally {
        o(!1);
      }
    },
    [c, e.callbacks, t, l]
  ), f = T(
    async (E) => {
      if (!l) {
        const y = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(y), y;
      }
      o(!0), a(null);
      try {
        const y = await c.post(
          "/webauthn/register/options",
          {}
        ), C = Qt(y.options), N = await navigator.credentials.create({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey registration returned no credential");
        const x = await c.post("/webauthn/register/verify", {
          challengeId: y.challengeId,
          credential: Ze(N),
          label: E?.label
        });
        if (!x.success)
          throw new Error("Passkey registration failed");
        return { credentialId: x.credentialId, label: x.label };
      } catch (y) {
        const N = Xe(y) ?? q(y, "Unable to register passkey. Please try again.");
        throw a(N), N;
      } finally {
        o(!1);
      }
    },
    [c, l]
  ), h = T(
    async (E) => {
      if (!l) {
        const y = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(y), y;
      }
      o(!0), a(null);
      try {
        const y = await c.post(
          "/webauthn/signup/options",
          {}
        ), C = Qt(y.options), N = await navigator.credentials.create({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey signup returned no credential");
        const x = await c.post("/webauthn/signup/verify", {
          challengeId: y.challengeId,
          credential: Ze(N),
          email: E?.email,
          name: E?.name,
          label: E?.label
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), x;
      } catch (y) {
        const N = Xe(y) ?? q(y, "Unable to sign up with passkey. Please try again.");
        throw a(N), N;
      } finally {
        o(!1);
      }
    },
    [c, e.callbacks, t, l]
  ), p = T(async () => {
    if (!l) {
      const C = {
        code: "VALIDATION_ERROR",
        message: "Passkeys are not supported in this browser"
      };
      throw a(C), C;
    }
    o(!0), a(null);
    const E = typeof localStorage < "u" && localStorage.getItem("cedros-passkey-registered") === "1", y = () => {
      try {
        localStorage.setItem("cedros-passkey-registered", "1");
      } catch {
      }
    };
    return E ? b(y) : g(y);
  }, [c, e.callbacks, t, l]), b = T(
    async (E) => {
      try {
        const y = await c.post(
          "/webauthn/auth/options",
          {}
        ), C = ys(y.options), N = await navigator.credentials.get({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey authentication returned no credential");
        const x = await c.post("/webauthn/auth/verify", {
          challengeId: y.challengeId,
          credential: Ze(N)
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), E(), x;
      } catch (y) {
        if (y instanceof Error && (y.name === "NotAllowedError" || y.name === "InvalidStateError"))
          return m(E);
        if (typeof y == "object" && y !== null && "isApiError" in y && y.data?.code === "INVALID_CREDENTIALS") {
          const w = {
            code: "INVALID_CREDENTIALS",
            message: "This passkey is not recognized. Please remove old passkeys for this site and try again, or sign in another way."
          };
          throw a(w), w;
        }
        const B = Xe(y) ?? q(y, "Unable to sign in with passkey. Please try again.");
        throw a(B), B;
      } finally {
        o(!1);
      }
    },
    [c, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), g = T(
    async (E) => {
      try {
        return await m(E);
      } catch (y) {
        if (y instanceof Error && (y.name === "InvalidStateError" || y.name === "NotAllowedError"))
          return b(E);
        if (!Tc(y)) {
          const x = Xe(y) ?? q(y, "Unable to create passkey. Please try again.");
          throw a(x), x;
        }
        throw y;
      } finally {
        o(!1);
      }
    },
    [c, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), m = T(
    async (E) => {
      const y = await c.post(
        "/webauthn/signup/options",
        {}
      ), C = Qt(y.options), N = await navigator.credentials.create({
        publicKey: C
      });
      if (!N)
        throw new Error("Passkey signup returned no credential");
      const x = await c.post("/webauthn/signup/verify", {
        challengeId: y.challengeId,
        credential: Ze(N)
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
    continueWithPasskey: p,
    authenticatePasskey: u,
    registerPasskey: f,
    signupWithPasskey: h
  };
}
function Mc({
  onSuccess: e,
  className: t = "",
  children: n,
  disabled: o
}) {
  const { continueWithPasskey: s, isLoading: a, isSupported: c } = eo(), i = o || !c || a;
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
        a ? /* @__PURE__ */ r($, { size: "sm" }) : /* @__PURE__ */ r("span", { className: "cedros-social-icon", "aria-hidden": "true", children: /* @__PURE__ */ r(Ic, {}) }),
        /* @__PURE__ */ r("span", { children: n ?? "Continue with Passkey" })
      ]
    }
  );
}
function Ic() {
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
const Je = ["login", "register"];
function qr({ onSuccess: e, className: t = "", defaultTab: n = "login" }) {
  const { config: o, socialButtonOrder: s } = ne(), [a, c] = R(n), [i, l] = R("form"), [u, f] = R(() => Xr()), [h] = R(() => Xn());
  F(() => {
    const B = () => f(Xr());
    return B(), window.addEventListener("load", B), window.addEventListener("focus", B), () => {
      window.removeEventListener("load", B), window.removeEventListener("focus", B);
    };
  }, []);
  const p = o.forms?.forgotPassword?.mode ?? (o.features?.instantLink ? "instantLink" : "reset"), b = T(
    (B) => {
      const w = Je.indexOf(a);
      let k = w;
      switch (B.key) {
        case "ArrowLeft":
        case "ArrowUp":
          k = w === 0 ? Je.length - 1 : w - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          k = w === Je.length - 1 ? 0 : w + 1;
          break;
        case "Home":
          k = 0;
          break;
        case "End":
          k = Je.length - 1;
          break;
        default:
          return;
      }
      B.preventDefault();
      const v = Je[k];
      c(v), document.getElementById(`cedros-tab-${v}`)?.focus();
    },
    [a]
  ), g = o.features ?? {
    email: !0,
    google: !0,
    apple: !0,
    solana: !0,
    webauthn: !0
  }, m = g.email !== !1, E = g.google !== !1 && o.googleClientId, y = g.apple !== !1 && o.appleClientId && h, C = g.solana !== !1 && u, N = g.webauthn !== !1, x = m && (E || y || C || N);
  return i === "forgotPassword" ? /* @__PURE__ */ r("div", { className: `cedros-login-form ${t}`, children: /* @__PURE__ */ r(xc, { mode: p, onCancel: () => l("form") }) }) : /* @__PURE__ */ d("div", { className: `cedros-login-form ${t}`, children: [
    (N || E || y || C) && (() => {
      const B = {
        webauthn: N ? /* @__PURE__ */ r(Mc, { onSuccess: e }) : null,
        google: E ? /* @__PURE__ */ r(Go, { onSuccess: e }) : null,
        apple: y ? /* @__PURE__ */ r(Bc, { onSuccess: e }) : null,
        solana: C ? /* @__PURE__ */ r(Ko, { onSuccess: e }) : null
      };
      return /* @__PURE__ */ r("div", { className: "cedros-social-buttons", children: (s ?? ["webauthn", "google", "apple", "solana"]).map((k) => {
        const v = B[k];
        return v ? /* @__PURE__ */ r(jo, { children: v }, k) : null;
      }) });
    })(),
    x && /* @__PURE__ */ r("div", { className: "cedros-divider", children: /* @__PURE__ */ r("span", { children: "Or continue with" }) }),
    m && /* @__PURE__ */ d(X, { children: [
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
            $o,
            {
              onSuccess: e,
              onSwitchToRegister: () => c("register"),
              onForgotPassword: () => l("forgotPassword")
            }
          ) : /* @__PURE__ */ r(
            Qo,
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
class _c extends zo {
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
function ju({ className: e = "", title: t = "Sign in to your account" }) {
  const { isModalOpen: n, closeModal: o } = ne(), s = J(null), a = J(null), c = J(o);
  if (F(() => {
    c.current = o;
  }, [o]), F(() => {
    if (!n) return;
    a.current = document.activeElement, s.current?.focus();
    const l = (f) => {
      if (f.key === "Escape" && c.current(), f.key === "Tab" && s.current) {
        const h = s.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ), p = h[0], b = h[h.length - 1];
        f.shiftKey && document.activeElement === p ? (f.preventDefault(), b?.focus()) : !f.shiftKey && document.activeElement === b && (f.preventDefault(), p?.focus());
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
            /* @__PURE__ */ r("div", { className: "cedros-modal-content", children: /* @__PURE__ */ r(_c, { children: /* @__PURE__ */ r(qr, { onSuccess: o }) }) })
          ]
        }
      )
    }
  );
}
function zu({
  token: e,
  onSuccess: t,
  onLoginClick: n,
  className: o = ""
}) {
  const [s, a] = R(""), [c, i] = R(""), [l, u] = R(null), { resetPassword: f, isLoading: h, isSuccess: p, error: b, clearError: g } = Wr(), m = s === c, E = l?.isValid && m && s.length > 0, y = async (C) => {
    if (C.preventDefault(), !!E)
      try {
        await f(e, s), t?.();
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
    n && /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-primary",
        onClick: n,
        children: "Go to login"
      }
    )
  ] }) : /* @__PURE__ */ d("form", { className: `cedros-reset-password-form ${o}`, onSubmit: y, children: [
    /* @__PURE__ */ d("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-form-title", children: "Reset your password" }),
      /* @__PURE__ */ r("p", { className: "cedros-form-subtitle", children: "Enter your new password below." })
    ] }),
    /* @__PURE__ */ r(te, { error: b, onDismiss: g }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      we,
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
      we,
      {
        label: "Confirm password",
        value: c,
        onChange: (C) => i(C.target.value),
        disabled: h,
        autoComplete: "new-password",
        error: c && !m ? "Passwords do not match" : void 0
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
            /* @__PURE__ */ r($, { size: "sm" }),
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
function Lr({ org: e, size: t = "lg", className: n = "" }) {
  const o = fn(e.logoUrl), s = t === "lg" ? "cedros-org-avatar-lg" : "", a = ["cedros-org-avatar", s, n].filter(Boolean).join(" "), c = ["cedros-org-avatar-placeholder", s, n].filter(Boolean).join(" ");
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
function Vu({
  orgs: e,
  activeOrg: t,
  isLoading: n = !1,
  onSelect: o,
  onCreateClick: s,
  className: a = "",
  placeholder: c = "Select organization"
}) {
  const [i, l] = R(!1), u = J(null);
  F(() => {
    const b = (g) => {
      u.current && !u.current.contains(g.target) && l(!1);
    };
    return document.addEventListener("mousedown", b), () => document.removeEventListener("mousedown", b);
  }, []), F(() => {
    const b = (g) => {
      g.key === "Escape" && l(!1);
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
  }, [s]), p = T(() => {
    l((b) => !b);
  }, []);
  return n ? /* @__PURE__ */ d(
    "div",
    {
      className: `cedros-org-selector cedros-org-selector-loading ${a}`,
      "aria-busy": "true",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ r($, { size: "sm" }),
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
        "aria-expanded": i,
        children: [
          t ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Lr, { org: t, size: "sm" }),
            /* @__PURE__ */ r("span", { className: "cedros-org-selector-name", children: t.name }),
            /* @__PURE__ */ r(As, { role: t.membership.role })
          ] }) : /* @__PURE__ */ r("span", { className: "cedros-org-selector-placeholder", children: c }),
          /* @__PURE__ */ r(Dc, { isOpen: i })
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
            /* @__PURE__ */ r(Lr, { org: b, size: "sm" }),
            /* @__PURE__ */ r("span", { className: "cedros-org-selector-item-name", children: b.name }),
            /* @__PURE__ */ r(As, { role: b.membership.role }),
            b.id === t?.id && /* @__PURE__ */ r(Uc, {})
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
              /* @__PURE__ */ r(Fc, {}),
              /* @__PURE__ */ r("span", { children: "Create organization" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function As({ role: e }) {
  return /* @__PURE__ */ r("span", { className: `cedros-org-role cedros-org-role-${e}`, children: e });
}
function Dc({ isOpen: e }) {
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
function Uc() {
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
function Fc() {
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
function Oc() {
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
function Wc() {
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
function qc() {
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
function jc({
  orgs: e,
  activeOrg: t,
  isLoading: n,
  onSelect: o,
  onCreateClick: s
}) {
  return n ? /* @__PURE__ */ d("div", { className: "cedros-org-switcher-loading", children: [
    /* @__PURE__ */ r($, {}),
    /* @__PURE__ */ r("span", { children: "Loading organizations..." })
  ] }) : /* @__PURE__ */ d(X, { children: [
    e.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-org-switcher-empty", children: /* @__PURE__ */ r("p", { children: "You don't belong to any organizations yet." }) }) : /* @__PURE__ */ r("ul", { className: "cedros-org-switcher-list", children: e.map((a) => /* @__PURE__ */ r("li", { children: /* @__PURE__ */ d(
      "button",
      {
        type: "button",
        className: `cedros-org-switcher-item ${a.id === t?.id ? "cedros-org-switcher-item-active" : ""}`,
        onClick: () => o(a.id),
        children: [
          /* @__PURE__ */ r(Lr, { org: a }),
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
          a.id === t?.id && /* @__PURE__ */ r(Wc, {})
        ]
      }
    ) }, a.id)) }),
    s && /* @__PURE__ */ d("button", { type: "button", className: "cedros-org-switcher-create", onClick: s, children: [
      /* @__PURE__ */ r(qc, {}),
      /* @__PURE__ */ r("span", { children: "Create new organization" })
    ] })
  ] });
}
function zc({ isLoading: e, onSubmit: t, onCancel: n }) {
  const [o, s] = R(""), [a, c] = R(""), [i, l] = R(null), u = T((h) => {
    s(h);
    const p = h.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 50);
    c(p);
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
      } catch (p) {
        l(p.message || "Failed to create organization");
      }
    },
    [o, a, t]
  );
  return /* @__PURE__ */ d("form", { className: "cedros-org-create-form", onSubmit: f, children: [
    i && /* @__PURE__ */ r(te, { error: i }),
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
          children: e ? /* @__PURE__ */ r($, { size: "sm" }) : "Create Organization"
        }
      )
    ] })
  ] });
}
function Hu({
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
    Vc,
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
function Vc({
  onClose: e,
  orgs: t,
  activeOrg: n,
  isLoading: o = !1,
  error: s,
  onSelect: a,
  onCreate: c,
  className: i
}) {
  const [l, u] = R("list"), f = J(null), h = J(null);
  F(() => (h.current = document.activeElement, f.current?.querySelector(".cedros-modal-close")?.focus(), () => {
    h.current?.focus();
  }), []), F(() => {
    const m = (E) => {
      if (E.key === "Escape") {
        e();
        return;
      }
      if (E.key === "Tab" && f.current) {
        const y = f.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ), C = y[0], N = y[y.length - 1];
        E.shiftKey ? document.activeElement === C && (E.preventDefault(), N?.focus()) : document.activeElement === N && (E.preventDefault(), C?.focus());
      }
    };
    return document.addEventListener("keydown", m), () => document.removeEventListener("keydown", m);
  }, [e]);
  const p = T(
    (m) => {
      m.target === m.currentTarget && e();
    },
    [e]
  ), b = T(
    (m) => {
      a(m), e();
    },
    [a, e]
  ), g = T(
    async (m) => {
      await c?.(m), e();
    },
    [c, e]
  );
  return /* @__PURE__ */ r("div", { className: "cedros-modal-backdrop", onClick: p, children: /* @__PURE__ */ d(
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
          /* @__PURE__ */ r("button", { type: "button", className: "cedros-modal-close", onClick: e, "aria-label": "Close", children: /* @__PURE__ */ r(Oc, {}) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-modal-body", children: [
          s && /* @__PURE__ */ r(te, { error: s }),
          l === "list" ? /* @__PURE__ */ r(
            jc,
            {
              orgs: t,
              activeOrg: n,
              isLoading: o,
              onSelect: b,
              onCreateClick: c ? () => u("create") : void 0
            }
          ) : /* @__PURE__ */ r(
            zc,
            {
              isLoading: o,
              onSubmit: g,
              onCancel: () => u("list")
            }
          )
        ] })
      ]
    }
  ) });
}
function Hc({
  sessions: e,
  isLoading: t = !1,
  error: n,
  onRevokeAll: o,
  className: s = ""
}) {
  const [a, c] = R(!1), [i, l] = R(!1), u = J(null), f = j(() => e.filter((p) => !p.isCurrent).length, [e]), h = T(async () => {
    if (!o) return;
    const p = e.filter((g) => !g.isCurrent).length;
    if (!(p === 0 || !window.confirm(
      `Are you sure you want to sign out of ${p} other device(s)? This will log you out everywhere except this browser.`
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
  return F(() => () => {
    u.current !== null && (window.clearTimeout(u.current), u.current = null);
  }, []), t && e.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-session-list cedros-session-list-loading ${s}`, children: [
    /* @__PURE__ */ r($, {}),
    /* @__PURE__ */ r("span", { children: "Loading sessions..." })
  ] }) : n ? /* @__PURE__ */ r("div", { className: `cedros-session-list ${s}`, children: /* @__PURE__ */ r(te, { error: n }) }) : e.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-session-list cedros-session-list-empty ${s}`, children: /* @__PURE__ */ r("p", { children: "No active sessions found." }) }) : /* @__PURE__ */ d("div", { className: `cedros-session-list ${s}`, children: [
    i && /* @__PURE__ */ d("div", { className: "cedros-session-success", role: "status", children: [
      /* @__PURE__ */ r(Zc, {}),
      /* @__PURE__ */ r("span", { children: "All other sessions have been revoked." })
    ] }),
    /* @__PURE__ */ r("ul", { className: "cedros-session-items", children: e.map((p) => /* @__PURE__ */ r($c, { session: p }, p.id)) }),
    o && f > 0 && /* @__PURE__ */ r("div", { className: "cedros-session-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: h,
        disabled: a,
        children: a ? /* @__PURE__ */ d(X, { children: [
          /* @__PURE__ */ r($, { size: "sm" }),
          /* @__PURE__ */ r("span", { children: "Signing out..." })
        ] }) : `Sign out of ${f} other device${f > 1 ? "s" : ""}`
      }
    ) })
  ] });
}
function $c({ session: e }) {
  const t = Qc(e.userAgent), n = Kc(e.expiresAt);
  return /* @__PURE__ */ d("li", { className: `cedros-session-item ${e.isCurrent ? "cedros-session-item-current" : ""}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-session-item-icon", children: /* @__PURE__ */ r(Yc, { userAgent: e.userAgent }) }),
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
          Gc(e.createdAt)
        ] }),
        n && /* @__PURE__ */ r("span", { className: "cedros-session-expiring", children: "Expires soon" })
      ] })
    ] })
  ] });
}
function Qc(e) {
  if (!e)
    return { browser: "Unknown browser", os: "Unknown device" };
  let t = "Unknown browser";
  e.includes("Chrome") && !e.includes("Edg") ? t = "Chrome" : e.includes("Safari") && !e.includes("Chrome") ? t = "Safari" : e.includes("Firefox") ? t = "Firefox" : e.includes("Edg") && (t = "Edge");
  let n = "Unknown device";
  return e.includes("Windows") ? n = "Windows" : e.includes("Mac") ? n = "macOS" : e.includes("Linux") ? n = "Linux" : e.includes("iPhone") || e.includes("iPad") ? n = "iOS" : e.includes("Android") && (n = "Android"), { browser: t, os: n };
}
function Gc(e) {
  const t = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - t.getTime(), s = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), c = Math.floor(o / (1e3 * 60 * 60 * 24));
  return s < 1 ? "just now" : s < 60 ? `${s} minute${s > 1 ? "s" : ""} ago` : a < 24 ? `${a} hour${a > 1 ? "s" : ""} ago` : c < 7 ? `${c} day${c > 1 ? "s" : ""} ago` : t.toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function Kc(e) {
  const t = new Date(e), n = /* @__PURE__ */ new Date(), o = 3600 * 1e3;
  return t.getTime() - n.getTime() < o;
}
function Yc({ userAgent: e }) {
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
function Zc() {
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
function Xc({
  words: e,
  onConfirm: t,
  className: n = ""
}) {
  const [o, s] = R(!1), [a, c] = R(!1), i = J(null), l = vc(e), u = T(async () => {
    try {
      await navigator.clipboard.writeText(e.join(" ")), s(!0), i.current !== null && window.clearTimeout(i.current), i.current = window.setTimeout(() => s(!1), 2e3);
    } catch {
    }
  }, [e]);
  F(() => () => {
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
    /* @__PURE__ */ r("div", { className: "cedros-recovery-grid", children: l.map((h, p) => /* @__PURE__ */ r("div", { className: "cedros-word-group", children: h.map((b, g) => {
      const m = p * 4 + g + 1;
      return /* @__PURE__ */ d("div", { className: "cedros-word-item", children: [
        /* @__PURE__ */ d("span", { className: "cedros-word-number", children: [
          m,
          "."
        ] }),
        /* @__PURE__ */ r("span", { className: "cedros-word-text", children: b })
      ] }, m);
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
function Jc({
  onSubmit: e,
  onCancel: t,
  isSubmitting: n = !1,
  error: o,
  className: s = ""
}) {
  const [a, c] = R(Array(ge).fill("")), [i, l] = R(null), [u, f] = R([]), [h, p] = R(null), b = un(), g = J(null), m = T(
    (w, k) => {
      const v = [...a];
      if (v[w] = k.toLowerCase().trim(), c(v), k.length > 0) {
        const A = Ac(k, 5);
        f(A);
      } else
        f([]);
      p(null);
    },
    [a]
  ), E = T((w) => {
    l(w), f([]);
  }, []), y = T(
    (w) => {
      const k = a[w];
      k && !ht(k) && p(`Word ${w + 1} is not in the wordlist`), g.current !== null && window.clearTimeout(g.current), g.current = window.setTimeout(() => {
        i === w && f([]);
      }, 200);
    },
    [a, i]
  );
  F(() => () => {
    g.current !== null && (window.clearTimeout(g.current), g.current = null);
  }, []);
  const C = T(
    (w) => {
      if (i !== null) {
        const k = [...a];
        k[i] = w, c(k), f([]), document.querySelector(
          `[data-word-index="${i + 1}"]`
        )?.focus();
      }
    },
    [i, a]
  ), N = T((w) => {
    const k = w.clipboardData.getData("text"), v = kc(k);
    v.length === ge && (w.preventDefault(), c(v), p(null));
  }, []), x = T(
    (w) => {
      if (w.preventDefault(), a.filter((A) => !A).length > 0) {
        p(`Please enter all ${ge} words`);
        return;
      }
      const v = a.map((A, L) => ({ word: A, index: L + 1 })).filter(({ word: A }) => !ht(A));
      if (v.length > 0) {
        p(`Invalid words: ${v.map((A) => `#${A.index}`).join(", ")}`);
        return;
      }
      if (!Zn(a)) {
        p("Invalid recovery phrase - please check your words");
        return;
      }
      e(a);
    },
    [a, e]
  ), B = o || h;
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
        /* @__PURE__ */ r("div", { className: "cedros-word-inputs", children: Array.from({ length: ge }, (w, k) => /* @__PURE__ */ d("div", { className: "cedros-word-input-wrapper", children: [
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
              onChange: (v) => m(k, v.target.value),
              onFocus: () => E(k),
              onBlur: () => y(k),
              "data-word-index": k,
              autoComplete: "off",
              autoCapitalize: "none",
              spellCheck: !1,
              disabled: n,
              "aria-label": `Word ${k + 1}`
            }
          )
        ] }, k)) }),
        i !== null && u.length > 0 && /* @__PURE__ */ r("div", { className: "cedros-suggestions", role: "listbox", id: `${b}-suggestions`, children: u.map((w) => /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-suggestion",
            onClick: () => C(w),
            role: "option",
            children: w
          },
          w
        )) }),
        B && /* @__PURE__ */ r("p", { className: "cedros-input-error", role: "alert", children: B }),
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
function $u({ capabilities: e, className: t = "" }) {
  if (e.allSupported)
    return null;
  const n = Fo(e), o = Oo();
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
const el = ["share_c_only", "full_seed", "none"];
function tl(e) {
  return e && el.includes(e) ? e : "share_c_only";
}
const rl = {
  walletEnabled: !1,
  recoveryMode: "share_c_only",
  unlockTtlSeconds: 900,
  isLoading: !1,
  error: null,
  refetch: async () => {
  }
};
function to() {
  const e = Oe(), [t, n] = R(null), [o, s] = R(!!e), [a, c] = R(null), i = j(() => e ? new ce({
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
          recoveryMode: tl(u.wallet.recoveryMode),
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
  return F(() => {
    i && l();
  }, [i, l]), e ? {
    walletEnabled: t?.enabled ?? !1,
    recoveryMode: t?.recoveryMode ?? "share_c_only",
    unlockTtlSeconds: t?.unlockTtlSeconds ?? 900,
    isLoading: o,
    error: a,
    refetch: l
  } : rl;
}
function sl() {
  const { user: e } = ne(), { enroll: t } = Ge(), { recoveryMode: n } = to(), [o, s] = R({ step: "idle" }), [a, c] = R(!1), i = J([]), l = T(() => {
    sn(...i.current), i.current = [];
  }, []);
  F(() => () => {
    l();
  }, [l]);
  const u = T(
    async (g, m, E, y) => {
      s({ step: "generating_seed" });
      const C = Wo();
      i.current.push(C), s({ step: "splitting_shares" });
      const { shareA: N, shareB: x, shareC: B } = zn(C);
      i.current.push(N, x, B), s({ step: "encrypting_shares" });
      const w = await nn(N, on(m)), k = qn(C), v = jn(k);
      s({ step: "uploading" });
      const A = {
        solanaPubkey: v,
        shareAAuthMethod: g,
        shareACiphertext: w.ciphertext,
        shareANonce: w.nonce,
        // Share B is now plaintext (SSS math protects it)
        shareB: Se(x)
      };
      if (g === "password") {
        if (!E) throw new Error("KDF salt required for password method");
        A.shareAKdfSalt = Se(E), A.shareAKdfParams = rt;
      }
      if (g === "passkey" && y && (A.prfSalt = y), await t(A), n === "none")
        l(), s({
          step: "complete",
          solanaPubkey: v
        });
      else {
        const L = n === "full_seed" ? bc(C) : gc(Fe(B));
        s({
          step: "showing_recovery",
          recoveryPhrase: L,
          solanaPubkey: v
        });
      }
    },
    [t, n, l]
  ), f = T(
    async (g) => {
      if (!e) {
        s({ step: "error", error: "User not authenticated" });
        return;
      }
      c(!0), l();
      try {
        const m = an(), E = await yn(g, m, rt);
        i.current.push(E), await u("password", E, m);
      } catch (m) {
        s({
          step: "error",
          error: m instanceof Error ? m.message : "Enrollment failed"
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
      const g = cn(), m = Se(g);
      s({ step: "encrypting_shares" });
      const y = (await Rr(m)).prfOutput;
      i.current.push(y);
      const C = await ln(y, g);
      i.current.push(C), await u("passkey", C, void 0, m);
    } catch (g) {
      s({
        step: "error",
        error: g instanceof Error ? g.message : "Enrollment failed"
      });
    } finally {
      c(!1);
    }
  }, [e, l, u]), p = T(() => {
    const g = o.solanaPubkey;
    l(), s({
      step: "complete",
      solanaPubkey: g
    });
  }, [o.solanaPubkey, l]), b = T(() => {
    l(), s({ step: "idle" }), c(!1);
  }, [l]);
  return {
    state: o,
    startEnrollmentWithPassword: f,
    startEnrollmentWithPasskey: h,
    confirmRecoveryPhrase: p,
    cancel: b,
    isEnrolling: a
  };
}
function nl() {
  const { config: e, _internal: t } = ne(), [n, o] = R(!1), [s, a] = R(null), c = j(
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
function ol(e) {
  return e.includes("email") ? "password" : e.includes("webauthn") ? "passkey" : "set-password";
}
function al({
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
  } = sl(), { setPassword: f, isLoading: h } = nl(), p = o ? ol(o.authMethods) : "password", [b, g] = R(""), [m, E] = R(""), [y, C] = R(null);
  F(() => {
    g(""), E(""), C(null);
  }, [o?.id]);
  const N = T(
    async (A) => {
      A.preventDefault(), C(null), await a(b);
    },
    [b, a]
  ), x = T(
    async (A) => {
      if (A.preventDefault(), b !== m) {
        C("Passwords do not match");
        return;
      }
      const L = Bt(b);
      if (!L.isValid) {
        const P = Object.values(L.errors)[0];
        C(P ?? "Password does not meet requirements");
        return;
      }
      C(null);
      try {
        await f(b), await a(b);
      } catch {
      }
    },
    [b, m, f, a]
  ), B = T(async () => {
    await c();
  }, [c]), w = T(() => {
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
  ] }) }) : s.step === "showing_recovery" && s.recoveryPhrase ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, children: /* @__PURE__ */ r(Xc, { words: s.recoveryPhrase, onConfirm: w }) }) : s.step === "complete" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-complete", children: [
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
      p === "password" && /* @__PURE__ */ r("p", { children: "Enter your account password to secure your wallet." }),
      p === "passkey" && /* @__PURE__ */ r("p", { children: "Authenticate with your passkey to secure your wallet." }),
      p === "set-password" && /* @__PURE__ */ r("p", { children: "Set a password for your account to secure your wallet." })
    ] }),
    p === "password" && /* @__PURE__ */ d("form", { onSubmit: N, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ r(
        we,
        {
          label: "Account Password",
          value: b,
          onChange: (A) => g(A.target.value),
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
            onClick: B,
            disabled: v,
            children: v ? "Creating..." : "Use Passkey"
          }
        )
      ] })
    ] }),
    p === "set-password" && /* @__PURE__ */ d("form", { onSubmit: x, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ r(
        we,
        {
          label: "New Password",
          value: b,
          onChange: (A) => g(A.target.value),
          showStrengthMeter: !0,
          disabled: v,
          required: !0,
          minLength: 8,
          placeholder: "Choose a strong password"
        }
      ),
      /* @__PURE__ */ r(
        we,
        {
          label: "Confirm Password",
          value: m,
          onChange: (A) => E(A.target.value),
          error: y ?? void 0,
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
            disabled: v || !b || !m,
            children: v ? "Creating..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function il() {
  const { user: e } = ne(), { signTransaction: t } = Ge(), [n, o] = R(!1), [s, a] = R(null), c = T(
    async (l, u) => {
      if (!e) {
        const f = "User not authenticated";
        throw a(f), new Error(f);
      }
      o(!0), a(null);
      try {
        const f = {
          transaction: Se(l),
          ...u ? { credential: qo(u) } : {}
        }, h = await t(f);
        return dn(h.signature);
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
function cl() {
  const { getMaterial: e } = Ge(), [t, n] = R(!1), [o, s] = R(null), a = T(async () => {
    n(!0), s(null);
    try {
      const i = await e();
      if (!i)
        throw new Error("No wallet enrolled");
      if (i.shareAAuthMethod !== "passkey")
        throw new Error("Wallet is not configured for passkey authentication");
      if (!i.prfSalt)
        throw new Error("No PRF salt configured for wallet");
      const l = await Rr(i.prfSalt);
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
function ll({
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
  }, [s]), h = e === "register" ? "Set Up Passkey" : "Verify with Passkey", p = e === "register" ? "Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN." : "Use your passkey to unlock your wallet. You will be prompted for biometric verification.";
  return /* @__PURE__ */ d("div", { className: `cedros-passkey-prompt ${l}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-passkey-icon", children: t ? /* @__PURE__ */ r(ul, {}) : n ? /* @__PURE__ */ r(hl, {}) : /* @__PURE__ */ r(dl, {}) }),
    /* @__PURE__ */ r("h3", { className: "cedros-passkey-title", children: c ?? h }),
    /* @__PURE__ */ r("p", { className: "cedros-passkey-description", children: i ?? p }),
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
function dl() {
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
function ul() {
  return /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
    /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
    /* @__PURE__ */ r("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function hl() {
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
function fl({
  onUnlock: e,
  onCancel: t,
  showCancel: n = !0,
  authMethod: o,
  className: s = ""
}) {
  ne();
  const { unlock: a, getMaterial: c, isLoading: i } = Ge(), { getPasskeyCredential: l, isAuthenticating: u } = cl(), [f, h] = R("idle"), [p, b] = R(o ?? null), [g, m] = R(""), [E, y] = R(null);
  F(() => {
    o !== void 0 && b(o);
  }, [o]);
  const C = p === "password", N = p === "passkey", x = T(async () => {
    if (h("credential"), y(null), !p)
      try {
        const P = await c();
        P ? b(P.shareAAuthMethod) : (y("No wallet enrolled"), h("error"));
      } catch (P) {
        y(P instanceof Error ? P.message : "Failed to get wallet info"), h("error");
      }
  }, [p, c]), B = T(
    async (P) => {
      P.preventDefault(), y(null), h("unlocking");
      try {
        let S;
        if (C)
          S = { type: "password", password: g };
        else
          throw new Error("Invalid auth method");
        await a(S), h("unlocked"), e?.();
      } catch (S) {
        y(S instanceof Error ? S.message : "Failed to unlock wallet"), h("error");
      }
    },
    [C, g, a, e]
  ), w = T(async () => {
    y(null), h("unlocking");
    try {
      const P = await l();
      if (!P) {
        h("credential");
        return;
      }
      await a(P), h("unlocked"), e?.();
    } catch (P) {
      y(P instanceof Error ? P.message : "Failed to unlock wallet"), h("error");
    }
  }, [l, a, e]), k = T(() => {
    m(""), h("idle"), y(null), t?.();
  }, [t]), v = T(() => {
    m(""), h("credential"), y(null);
  }, []), A = i || u, L = () => {
    switch (f) {
      case "idle":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-idle", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(ml, {}) }),
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
        return C ? /* @__PURE__ */ d("form", { className: "cedros-wallet-unlock-form", onSubmit: B, children: [
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Enter Password" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Enter your wallet password to unlock." }),
          /* @__PURE__ */ r(
            we,
            {
              label: "Password",
              value: g,
              onChange: (P) => m(P.target.value),
              disabled: A,
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
                disabled: A || g.length === 0,
                children: A ? "Unlocking..." : "Unlock"
              }
            ),
            n && /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: k,
                disabled: A,
                children: "Cancel"
              }
            )
          ] })
        ] }) : N ? /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-passkey", children: [
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Verify with Passkey" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Use your passkey to unlock your wallet." }),
          /* @__PURE__ */ r(
            ll,
            {
              mode: "authenticate",
              isLoading: A,
              error: E ?? void 0,
              onPrompt: w,
              onRetry: w,
              onCancel: n ? k : void 0
            }
          )
        ] }) : /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-loading", children: [
          /* @__PURE__ */ r($, { size: "xl" }),
          /* @__PURE__ */ r("p", { children: "Loading wallet info..." })
        ] });
      case "unlocking":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-progress", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r($, { size: "xl" }) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Unlocking Wallet" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Verifying your credentials..." })
        ] });
      case "unlocked":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-success", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(pl, {}) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Unlocked" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Your wallet is ready to sign transactions." })
        ] });
      case "error":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-error", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(gl, {}) }),
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
  return /* @__PURE__ */ r("div", { className: `cedros-wallet-unlock ${s}`, children: L() });
}
function ml() {
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
function pl() {
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
function gl() {
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
function wl() {
  const { recover: e, getShareBForRecovery: t } = Ge(), { recoveryMode: n } = to(), [o, s] = R({ step: "idle" }), [a, c] = R(!1), i = J([]), l = T(() => {
    sn(...i.current), i.current = [];
  }, []);
  F(() => () => {
    l();
  }, [l]);
  const u = T(
    async (h, p, b) => {
      c(!0), l();
      try {
        if (s({ step: "validating" }), !Zn(h))
          throw new Error("Invalid recovery phrase. Please check your words.");
        let g;
        if (n === "share_c_only") {
          const v = wc(h);
          i.current.push(v);
          const A = Se(v), L = await t({ shareC: A }), P = dn(L.shareB);
          i.current.push(P), g = sc(Fe(P), Fe(v)), i.current.push(g);
        } else
          g = yc(h), i.current.push(g);
        const m = qn(g), E = jn(m), { shareA: y, shareB: C } = zn(g);
        i.current.push(y, C), s({ step: "encrypting" });
        let N, x, B;
        if (p === "passkey") {
          const v = cn();
          B = Se(v);
          const A = await Rr(B);
          i.current.push(A.prfOutput), N = await ln(A.prfOutput, v), i.current.push(N);
        } else
          x = an(), N = await yn(b, x, rt), i.current.push(N);
        const w = await nn(y, on(N));
        s({ step: "uploading" });
        const k = {
          solanaPubkey: E,
          shareAAuthMethod: p,
          shareACiphertext: w.ciphertext,
          shareANonce: w.nonce,
          shareB: Se(C)
        };
        p === "password" && (k.shareAKdfSalt = Se(x), k.shareAKdfParams = rt), p === "passkey" && (k.prfSalt = B), await e(k), l(), s({ step: "complete" });
      } catch (g) {
        l(), s({
          step: "error",
          error: g instanceof Error ? g.message : "Recovery failed"
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
function bl({
  onComplete: e,
  onCancel: t,
  className: n = "",
  defaultAuthMethod: o = "password"
}) {
  const { state: s, startRecovery: a, cancel: c, isRecovering: i } = wl(), [l, u] = R([]), [f, h] = R(!1), [p, b] = R(o), [g, m] = R(""), [E, y] = R(""), [C, N] = R(null), x = T((A) => {
    u(A), h(!0);
  }, []), B = T(
    async (A) => {
      if (A.preventDefault(), N(null), p !== "passkey") {
        if (g !== E) {
          N("Passwords do not match");
          return;
        }
        if (p === "password" && g.length < 8) {
          N("Password must be at least 8 characters");
          return;
        }
      }
      await a(l, p, g);
    },
    [l, p, g, E, a]
  ), w = T(() => {
    c(), u([]), h(!1), m(""), y(""), t?.();
  }, [c, t]), k = T(() => {
    h(!1), m(""), y("");
  }, []), v = T(() => {
    e?.();
  }, [e]);
  return s.step === "validating" || s.step === "encrypting" || s.step === "uploading" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-progress", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(yl, {}) }),
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
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(Al, {}) }),
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
  ] }) }) : s.step === "error" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-error", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(vl, {}) }),
    /* @__PURE__ */ r("h3", { className: "cedros-wallet-recovery-title", children: "Recovery Failed" }),
    /* @__PURE__ */ r("p", { className: "cedros-wallet-recovery-description", children: s.error ?? "An error occurred during recovery. Please try again." }),
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: w,
        children: "Start Over"
      }
    ) })
  ] }) }) : f ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("form", { className: "cedros-wallet-recovery-credential", onSubmit: B, children: [
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
            checked: p === "passkey",
            onChange: () => b("passkey"),
            disabled: i
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
            value: g,
            onChange: (A) => m(A.target.value),
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
            onChange: (A) => y(A.target.value),
            disabled: i,
            "aria-invalid": C ? "true" : void 0,
            placeholder: "Confirm your password"
          }
        ),
        C && /* @__PURE__ */ r("p", { className: "cedros-input-error", role: "alert", children: C })
      ] })
    ] }),
    p === "passkey" && /* @__PURE__ */ d("div", { className: "cedros-passkey-info", children: [
      /* @__PURE__ */ r(kl, {}),
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
          disabled: i || p !== "passkey" && (g.length === 0 || E.length === 0),
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
      Jc,
      {
        onSubmit: x,
        onCancel: w,
        isSubmitting: !1
      }
    )
  ] }) });
}
function yl() {
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
function Al() {
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
function vl() {
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
function kl() {
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
function Nl({
  address: e,
  label: t = "Wallet Address",
  showCopy: n = !0,
  showExplorerLink: o = !0,
  allowReveal: s = !0,
  className: a = ""
}) {
  const c = Oe(), [i, l] = R(!1), [u, f] = R(null), [h, p] = R(!1), b = J(null), g = c?.config.solana?.network ?? "mainnet-beta", m = j(() => {
    const N = `https://explorer.solana.com/address/${e}`;
    return g === "mainnet-beta" ? N : `${N}?cluster=${encodeURIComponent(g)}`;
  }, [e, g]), E = s && e.length > 18, y = j(() => !E || h ? e : `${e.slice(0, 8)}...${e.slice(-8)}`, [e, E, h]), C = T(async () => {
    try {
      f(null), await navigator.clipboard.writeText(e), l(!0), b.current !== null && window.clearTimeout(b.current), b.current = window.setTimeout(() => {
        l(!1), b.current = null;
      }, 2e3);
    } catch (N) {
      l(!1), f(N instanceof Error ? N.message : "Copy failed");
    }
  }, [e]);
  return F(() => () => {
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
            onClick: () => p((N) => !N),
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
            href: m,
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
    /* @__PURE__ */ r("code", { className: "cedros-wallet-status-pubkey-value", title: e, children: y }),
    u && /* @__PURE__ */ r("p", { className: "cedros-input-hint", role: "status", children: u })
  ] });
}
function El({
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
  const u = e !== void 0, f = Lt(), h = u ? e : f.status, p = u ? t ?? null : f.solanaPubkey, b = u ? null : f.error, g = u ? () => {
  } : f.refresh, m = u ? () => {
  } : f.clearError, E = Cl(h, b);
  return i ? /* @__PURE__ */ d("div", { className: `cedros-wallet-status cedros-wallet-status-compact ${l}`, children: [
    /* @__PURE__ */ r(
      "span",
      {
        className: `cedros-wallet-status-dot cedros-wallet-status-${E.color}`,
        title: E.label
      }
    ),
    /* @__PURE__ */ r("span", { className: "cedros-wallet-status-label", children: E.label }),
    p && /* @__PURE__ */ r("span", { className: "cedros-wallet-status-pubkey", title: p, children: xl(p) })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-wallet-status ${l}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-status-header", children: [
      /* @__PURE__ */ r(
        "div",
        {
          className: `cedros-wallet-status-icon cedros-wallet-status-icon-${E.color}`,
          children: /* @__PURE__ */ r(Sl, { status: h })
        }
      ),
      /* @__PURE__ */ d("div", { className: "cedros-wallet-status-info", children: [
        /* @__PURE__ */ r("h4", { className: "cedros-wallet-status-title", children: E.title }),
        /* @__PURE__ */ r("p", { className: "cedros-wallet-status-description", children: E.description })
      ] })
    ] }),
    p && /* @__PURE__ */ r("div", { className: "cedros-wallet-status-pubkey-full", children: /* @__PURE__ */ r(Nl, { address: p }) }),
    b && /* @__PURE__ */ d("div", { className: "cedros-wallet-status-error-box", role: "alert", children: [
      /* @__PURE__ */ r("p", { children: b }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-secondary",
          onClick: m,
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
          onClick: g,
          children: "Retry"
        }
      )
    ] })
  ] });
}
function Cl(e, t) {
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
function xl(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function Sl({ status: e }) {
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
function Qu({ className: e = "", showActions: t = !0 }) {
  const n = Lt(), [o, s] = R("status"), a = j(() => {
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
      El,
      {
        onEnroll: () => s("enroll"),
        onUnlock: () => s("unlock"),
        onRecover: () => s("recover_intro"),
        showActions: t
      }
    ),
    o === "enroll" && /* @__PURE__ */ r(
      al,
      {
        onComplete: () => {
          i();
        },
        onCancel: c
      }
    ),
    o === "unlock" && /* @__PURE__ */ r(
      fl,
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
      bl,
      {
        onComplete: () => {
          u();
        },
        onCancel: c
      }
    )
  ] });
}
function Gu({
  showDescriptions: e = !0,
  className: t = "",
  onSave: n
}) {
  const { settings: o, isLoading: s, isUpdating: a, error: c, fetchSettings: i, updateSettings: l } = na(), [u, f] = R({}), [h, p] = R(null), [b, g] = R(!1);
  F(() => {
    i();
  }, [i]), F(() => {
    if (b) {
      const B = setTimeout(() => g(!1), 3e3);
      return () => clearTimeout(B);
    }
  }, [b]);
  const m = T((B, w) => {
    f((k) => ({ ...k, [B]: w })), p(null), g(!1);
  }, []), E = T(async () => {
    const B = Object.entries(u).map(([w, k]) => ({
      key: w,
      value: k
    }));
    if (B.length !== 0)
      try {
        await l(B), f({}), p(null), g(!0), n?.();
      } catch (w) {
        p(w instanceof Error ? w.message : "Failed to save settings");
      }
  }, [u, l, n]), y = T(() => {
    f({}), p(null), g(!1);
  }, []), C = Object.keys(u).length > 0, N = Object.keys(u).length;
  if (s && Object.keys(o).length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-system-settings cedros-system-settings-loading ${t}`, children: [
      /* @__PURE__ */ r($, {}),
      /* @__PURE__ */ r("span", { children: "Loading settings..." })
    ] });
  if (c)
    return /* @__PURE__ */ r("div", { className: `cedros-system-settings ${t}`, children: /* @__PURE__ */ r(te, { error: c.message }) });
  const x = Object.keys(o).sort();
  return x.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-system-settings cedros-system-settings-empty ${t}`, children: /* @__PURE__ */ r("p", { children: "No system settings found." }) }) : /* @__PURE__ */ d("div", { className: `cedros-system-settings ${t}`, children: [
    h && /* @__PURE__ */ r(te, { error: h }),
    b && /* @__PURE__ */ r("div", { className: "cedros-settings-success", children: "Settings saved successfully." }),
    x.map((B) => /* @__PURE__ */ r(
      Ll,
      {
        category: B,
        settings: o[B],
        edits: u,
        showDescription: e,
        onChange: m
      },
      B
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
          onClick: y,
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
          children: a ? /* @__PURE__ */ r($, { size: "sm" }) : "Save Changes"
        }
      )
    ] })
  ] });
}
const vs = Object.keys(aa);
function Ll({
  category: e,
  settings: t,
  edits: n,
  showDescription: o,
  onChange: s
}) {
  const a = oa[e] || {
    label: e,
    description: "",
    icon: ""
  }, c = j(() => [...t].sort((i, l) => {
    const u = vs.indexOf(i.key), f = vs.indexOf(l.key);
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
    /* @__PURE__ */ r(wn, { settings: c, edits: n, onChange: s })
  ] });
}
class Bl {
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
function ro() {
  const { config: e } = ne(), [t, n] = R(null), [o, s] = R(!1), [a, c] = R(!1), [i, l] = R(null), u = J(0), f = j(
    () => new Bl(e.serverUrl, e.requestTimeout, e.retryAttempts),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), h = J(f);
  h.current = f;
  const p = T(async () => {
    s(!0), l(null);
    const g = ++u.current;
    try {
      const m = await h.current.getStatus();
      if (g !== u.current) return;
      n(m);
    } catch (m) {
      if (g !== u.current) return;
      l(m instanceof Error ? m : new Error("Failed to check setup status"));
    } finally {
      g === u.current && s(!1);
    }
  }, []), b = T(
    async (g) => {
      c(!0), l(null);
      try {
        const m = await h.current.createFirstAdmin(g);
        return await p(), m;
      } catch (m) {
        const E = m instanceof Error ? m : new Error("Failed to create admin");
        throw l(E), E;
      } finally {
        c(!1);
      }
    },
    [p]
  );
  return {
    status: t,
    isLoading: o,
    isCreating: a,
    error: i,
    checkStatus: p,
    createAdmin: b
  };
}
const Pl = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, ks = 8;
function Rl(e) {
  const t = {};
  return e.email ? Pl.test(e.email) || (t.email = "Invalid email format") : t.email = "Email is required", e.password ? e.password.length < ks && (t.password = `Password must be at least ${ks} characters`) : t.password = "Password is required", e.confirmPassword ? e.password !== e.confirmPassword && (t.confirmPassword = "Passwords do not match") : t.confirmPassword = "Please confirm your password", t;
}
function Tl({ onComplete: e, className: t = "" }) {
  const { status: n, isLoading: o, isCreating: s, error: a, checkStatus: c, createAdmin: i } = ro(), [l, u] = R({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    orgName: ""
  }), [f, h] = R({}), [p, b] = R(!1);
  F(() => {
    c();
  }, [c]);
  const g = T(
    (E) => (y) => {
      u((C) => ({ ...C, [E]: y.target.value })), h((C) => ({ ...C, [E]: void 0 }));
    },
    []
  ), m = T(
    async (E) => {
      E.preventDefault();
      const y = Rl(l);
      if (Object.keys(y).length > 0) {
        h(y);
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
    /* @__PURE__ */ r($, {}),
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
    /* @__PURE__ */ d("form", { className: "cedros-setup__form", onSubmit: m, children: [
      a && /* @__PURE__ */ r(te, { error: a.message }),
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
            onChange: g("email"),
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
            onChange: g("name"),
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
            onChange: g("orgName"),
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
            onChange: g("password"),
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
            onChange: g("confirmPassword"),
            placeholder: "Confirm your password",
            autoComplete: "new-password",
            disabled: s
          }
        ),
        f.confirmPassword && /* @__PURE__ */ r("span", { className: "cedros-setup__error", children: f.confirmPassword })
      ] }),
      /* @__PURE__ */ r("button", { type: "submit", className: "cedros-setup__button", disabled: s, children: s ? /* @__PURE__ */ d(X, { children: [
        /* @__PURE__ */ r($, {}),
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
const Ml = ["security", "rate_limit"];
function Ku({ className: e }) {
  return /* @__PURE__ */ r(
    La,
    {
      title: "Security",
      description: "Configure CORS, cookies, sessions, JWT, and rate limiting settings.",
      categories: Ml,
      className: e
    }
  );
}
const Ns = [
  { id: "email", label: "Email", category: "email" },
  { id: "webhooks", label: "Webhooks", category: "webhook" }
];
function Il({ className: e }) {
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
  } = ia(), [f, h] = R("email");
  F(() => {
    i();
  }, [i]);
  const p = Ns.find((x) => x.id === f), b = p?.category ?? "", m = (u("email_provider") || "custom") === "custom", E = u("email_smtp_host"), y = !m || E != null && E !== "", C = j(() => {
    const x = t[b] ?? [];
    if (f !== "email") return x;
    const B = m ? Na : Ea;
    return x.filter((w) => B.includes(w.key)).sort((w, k) => B.indexOf(w.key) - B.indexOf(k.key));
  }, [t, b, f, m]), N = (x, B) => {
    if (l(x, B), x === "email_provider" && B !== "custom") {
      const w = Ca[B];
      w && (l("email_smtp_host", w), l("email_smtp_port", "587"), l("email_smtp_tls", "true"));
    }
  };
  return o && Object.keys(t).length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-system-settings cedros-system-settings-loading ${e ?? ""}`, children: [
    /* @__PURE__ */ r($, {}),
    /* @__PURE__ */ r("span", { children: "Loading settings..." })
  ] }) : c ? /* @__PURE__ */ r("div", { className: `cedros-system-settings ${e ?? ""}`, children: /* @__PURE__ */ r(te, { error: c.message }) }) : /* @__PURE__ */ d("div", { className: `cedros-system-settings ${e ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ d("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ r("h2", { className: "cedros-settings-page-title", children: "Auth Messages" }),
        /* @__PURE__ */ r("p", { className: "cedros-settings-page-description", children: "Configure email delivery for verification emails, password resets, and instant link login. Webhook notifications can be sent to Discord or Slack." })
      ] }),
      /* @__PURE__ */ r(ca, { status: s, error: a })
    ] }),
    f === "email" && !y && /* @__PURE__ */ r("div", { className: "cedros-settings-warning-banner", children: "Email features (verification, password reset, instant link) are disabled until SMTP is configured. Select a provider or enter custom SMTP settings below." }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: Ns.map((x) => /* @__PURE__ */ r(
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
      p?.label ?? "this section",
      "."
    ] }) }) : /* @__PURE__ */ r(
      wn,
      {
        settings: C,
        edits: n,
        onChange: f === "email" ? N : l
      }
    ) })
  ] });
}
const ye = {
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
}, _l = [
  // Top-level menu items
  { id: "users", label: "Users", icon: ye.users },
  { id: "team", label: "Team", icon: ye.members },
  { id: "deposits", label: "Deposits", icon: ye.deposits, requiredFeature: "credits" },
  { id: "withdrawals", label: "Withdrawals", icon: ye.withdrawals, requiredFeature: "credits" },
  // Configuration group
  { id: "settings-auth", label: "Authentication", icon: ye.key, group: "Configuration" },
  { id: "settings-messaging", label: "Auth Messages", icon: ye.mail, group: "Configuration" },
  { id: "settings-wallet", label: "User Wallets", icon: ye.wallet, group: "Configuration" },
  {
    id: "settings-credits",
    label: "Credit System",
    icon: ye.coins,
    group: "Configuration",
    requiredFeature: "credits"
  },
  { id: "settings-server", label: "Auth Server", icon: ye.server, group: "Configuration" }
];
function Yu({
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
  const [u, f] = R(n), [h, p] = R(!0), { user: b, logout: g } = ne(), { activeOrg: m, role: E, isLoading: y, fetchOrgs: C, hasPermission: N } = la(), { status: x, isLoading: B, checkStatus: w } = ro(), { features: k, isLoading: v } = Yo(), { canAccess: A } = Zo(), L = T(
    (_) => {
      f(_), a?.(_);
    },
    [a]
  ), P = _l.filter((_) => !(!t.includes(_.id) || _.requiredFeature && !k[_.requiredFeature] || !A(_.id))), S = P.find((_) => _.id === u), M = !S && !v;
  return F(() => {
    C(), w();
  }, [C, w]), F(() => {
    M && P.length > 0 && f("users");
  }, [M, P.length]), !B && x?.needsSetup ? /* @__PURE__ */ r("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--setup ${l}`, children: /* @__PURE__ */ r(Tl, { onComplete: () => w() }) }) : (y || B || v) && !m ? /* @__PURE__ */ d("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--loading ${l}`, children: [
    /* @__PURE__ */ r($, {}),
    /* @__PURE__ */ r("span", { className: "cedros-dashboard__loading-text", children: "Loading..." })
  ] }) : u === "team" && !m ? /* @__PURE__ */ r("div", { className: `cedros-admin cedros-dashboard ${l}`, children: /* @__PURE__ */ r(te, { error: "No organization selected. Please select an organization first." }) }) : /* @__PURE__ */ d("div", { className: `cedros-admin cedros-dashboard ${l}`, children: [
    /* @__PURE__ */ d("aside", { className: "cedros-dashboard__sidebar", children: [
      /* @__PURE__ */ r("div", { className: "cedros-dashboard__sidebar-header", children: /* @__PURE__ */ d("div", { className: "cedros-dashboard__logo", children: [
        ye.wallet,
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__logo-text", children: e })
      ] }) }),
      /* @__PURE__ */ d("nav", { className: "cedros-dashboard__nav", children: [
        /* @__PURE__ */ d("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-label", children: "Menu" }),
          P.filter((_) => !_.group).map((_) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === _.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => L(_.id),
              "aria-current": u === _.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-icon", children: _.icon }),
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-text", children: _.label })
              ]
            },
            _.id
          ))
        ] }),
        P.some((_) => _.group === "Configuration") && /* @__PURE__ */ d("div", { className: "cedros-dashboard__nav-group", children: [
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
                    children: ye.chevronRight
                  }
                )
              ]
            }
          ),
          h && P.filter((_) => _.group === "Configuration").map((_) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === _.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => L(_.id),
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
        Aa,
        {
          name: b.name,
          email: b.email,
          picture: b.picture,
          onSettings: c,
          onLogout: i ?? g
        }
      ) })
    ] }),
    /* @__PURE__ */ d("main", { className: "cedros-dashboard__main", children: [
      /* @__PURE__ */ r("header", { className: "cedros-dashboard__header", children: /* @__PURE__ */ d("div", { className: "cedros-dashboard__breadcrumb", children: [
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-root", children: e }),
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-sep", children: ye.chevronRight }),
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-current", children: S?.label })
      ] }) }),
      /* @__PURE__ */ d("div", { className: "cedros-dashboard__content", children: [
        u === "users" && /* @__PURE__ */ r(Dl, { pageSize: s, currentUserId: b?.id }),
        u === "team" && m && /* @__PURE__ */ r(
          Ul,
          {
            orgId: m.id,
            currentUserId: b?.id,
            hasPermission: N,
            role: E
          }
        ),
        u === "deposits" && /* @__PURE__ */ r(Fl, { pageSize: s, refreshInterval: o }),
        u === "withdrawals" && /* @__PURE__ */ r(Ol, { pageSize: s, refreshInterval: o }),
        u === "settings-auth" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(va, {}) }),
        u === "settings-wallet" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(ka, {}) }),
        u === "settings-messaging" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Il, {}) }),
        u === "settings-credits" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(xa, {}) }),
        u === "settings-server" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Sa, {}) })
      ] })
    ] })
  ] });
}
function Dl({ pageSize: e, currentUserId: t }) {
  const [n, o] = R(null), { statsItems: s, isLoading: a, error: c, refresh: i } = wa();
  return n ? /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(
    ba,
    {
      userId: n.id,
      currentUserId: t,
      onBack: () => o(null)
    }
  ) }) : /* @__PURE__ */ d("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ r(bn, { stats: s, isLoading: a, onRefresh: i }),
    c && /* @__PURE__ */ r("p", { className: "cedros-admin-error-inline", children: c }),
    /* @__PURE__ */ r(
      ya,
      {
        pageSize: e,
        currentUserId: t,
        onUserClick: (l) => o(l)
      }
    )
  ] });
}
function Ul({ orgId: e, currentUserId: t, hasPermission: n, role: o }) {
  const [s, a] = R("members"), {
    members: c,
    isLoading: i,
    error: l,
    fetchMembers: u,
    updateMemberRole: f,
    removeMember: h
  } = Xo(e), {
    invites: p,
    isLoading: b,
    error: g,
    fetchInvites: m,
    createInvite: E,
    cancelInvite: y,
    resendInvite: C
  } = Jo(e);
  F(() => {
    u(), m();
  }, [u, m]);
  const N = n("invite:create"), x = n("invite:cancel"), B = p.length, w = c.reduce(
    (L, P) => (L[P.role] = (L[P.role] ?? 0) + 1, L),
    {}
  ), k = w.owner ?? 0, v = w.admin ?? 0, A = w.member ?? 0;
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__team", children: [
    /* @__PURE__ */ r(
      bn,
      {
        stats: [
          { label: "Owners", value: k },
          { label: "Admins", value: v },
          { label: "Members", value: A },
          { label: "Pending Invites", value: B }
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
            B > 0 && ` (${B})`
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
        ea,
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
            ta,
            {
              onSubmit: E,
              isLoading: b,
              error: g?.message
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(
          ra,
          {
            invites: p,
            isLoading: b,
            error: g?.message,
            canManage: x || N,
            onCancel: x ? y : void 0,
            onResend: N ? C : void 0
          }
        ) })
      ] }),
      s === "permissions" && o === "owner" && /* @__PURE__ */ r(sa, { userRole: o })
    ] })
  ] });
}
function Fl({ pageSize: e, refreshInterval: t }) {
  const [n, o] = R("");
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ r(ua, { refreshInterval: t }),
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
        ha,
        {
          statusFilter: n || void 0,
          pageSize: e,
          refreshInterval: t
        }
      )
    ] })
  ] });
}
function Ol({ pageSize: e, refreshInterval: t }) {
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ r(fa, { refreshInterval: t }),
    /* @__PURE__ */ r("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ d("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ r(ma, { pageSize: e, refreshInterval: t }),
      /* @__PURE__ */ r(pa, { pageSize: e, refreshInterval: t }),
      /* @__PURE__ */ r(ga, { pageSize: e, refreshInterval: t })
    ] })
  ] });
}
var He = {}, Gt, Es;
function Wl() {
  return Es || (Es = 1, Gt = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), Gt;
}
var Kt = {}, _e = {}, Cs;
function We() {
  if (Cs) return _e;
  Cs = 1;
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
  return _e.getSymbolSize = function(o) {
    if (!o) throw new Error('"version" cannot be null or undefined');
    if (o < 1 || o > 40) throw new Error('"version" should be in range from 1 to 40');
    return o * 4 + 17;
  }, _e.getSymbolTotalCodewords = function(o) {
    return t[o];
  }, _e.getBCHDigit = function(n) {
    let o = 0;
    for (; n !== 0; )
      o++, n >>>= 1;
    return o;
  }, _e.setToSJISFunction = function(o) {
    if (typeof o != "function")
      throw new Error('"toSJISFunc" is not a valid function.');
    e = o;
  }, _e.isKanjiModeEnabled = function() {
    return typeof e < "u";
  }, _e.toSJIS = function(o) {
    return e(o);
  }, _e;
}
var Yt = {}, xs;
function jr() {
  return xs || (xs = 1, (function(e) {
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
  })(Yt)), Yt;
}
var Zt, Ss;
function ql() {
  if (Ss) return Zt;
  Ss = 1;
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
  }, Zt = e, Zt;
}
var Xt, Ls;
function jl() {
  if (Ls) return Xt;
  Ls = 1;
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
  }, Xt = e, Xt;
}
var Jt = {}, Bs;
function zl() {
  return Bs || (Bs = 1, (function(e) {
    const t = We().getSymbolSize;
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
  })(Jt)), Jt;
}
var er = {}, Ps;
function Vl() {
  if (Ps) return er;
  Ps = 1;
  const e = We().getSymbolSize, t = 7;
  return er.getPositions = function(o) {
    const s = e(o);
    return [
      // top-left
      [0, 0],
      // top-right
      [s - t, 0],
      // bottom-left
      [0, s - t]
    ];
  }, er;
}
var tr = {}, Rs;
function Hl() {
  return Rs || (Rs = 1, (function(e) {
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
        for (let p = 0; p < a; p++) {
          let b = s.get(h, p);
          b === u ? i++ : (i >= 5 && (c += t.N1 + (i - 5)), u = b, i = 1), b = s.get(p, h), b === f ? l++ : (l >= 5 && (c += t.N1 + (l - 5)), f = b, l = 1);
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
  })(tr)), tr;
}
var ft = {}, Ts;
function so() {
  if (Ts) return ft;
  Ts = 1;
  const e = jr(), t = [
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
var rr = {}, et = {}, Ms;
function $l() {
  if (Ms) return et;
  Ms = 1;
  const e = new Uint8Array(512), t = new Uint8Array(256);
  return (function() {
    let o = 1;
    for (let s = 0; s < 255; s++)
      e[s] = o, t[o] = s, o <<= 1, o & 256 && (o ^= 285);
    for (let s = 255; s < 512; s++)
      e[s] = e[s - 255];
  })(), et.log = function(o) {
    if (o < 1) throw new Error("log(" + o + ")");
    return t[o];
  }, et.exp = function(o) {
    return e[o];
  }, et.mul = function(o, s) {
    return o === 0 || s === 0 ? 0 : e[t[o] + t[s]];
  }, et;
}
var Is;
function Ql() {
  return Is || (Is = 1, (function(e) {
    const t = $l();
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
  })(rr)), rr;
}
var sr, _s;
function Gl() {
  if (_s) return sr;
  _s = 1;
  const e = Ql();
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
  }, sr = t, sr;
}
var nr = {}, or = {}, ar = {}, Ds;
function no() {
  return Ds || (Ds = 1, ar.isValid = function(t) {
    return !isNaN(t) && t >= 1 && t <= 40;
  }), ar;
}
var Ne = {}, Us;
function oo() {
  if (Us) return Ne;
  Us = 1;
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
var Fs;
function qe() {
  return Fs || (Fs = 1, (function(e) {
    const t = no(), n = oo();
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
  })(or)), or;
}
var Os;
function Kl() {
  return Os || (Os = 1, (function(e) {
    const t = We(), n = so(), o = jr(), s = qe(), a = no(), c = 7973, i = t.getBCHDigit(c);
    function l(p, b, g) {
      for (let m = 1; m <= 40; m++)
        if (b <= e.getCapacity(m, g, p))
          return m;
    }
    function u(p, b) {
      return s.getCharCountIndicator(p, b) + 4;
    }
    function f(p, b) {
      let g = 0;
      return p.forEach(function(m) {
        const E = u(m.mode, b);
        g += E + m.getBitsLength();
      }), g;
    }
    function h(p, b) {
      for (let g = 1; g <= 40; g++)
        if (f(p, g) <= e.getCapacity(g, b, s.MIXED))
          return g;
    }
    e.from = function(b, g) {
      return a.isValid(b) ? parseInt(b, 10) : g;
    }, e.getCapacity = function(b, g, m) {
      if (!a.isValid(b))
        throw new Error("Invalid QR Code version");
      typeof m > "u" && (m = s.BYTE);
      const E = t.getSymbolTotalCodewords(b), y = n.getTotalCodewordsCount(b, g), C = (E - y) * 8;
      if (m === s.MIXED) return C;
      const N = C - u(m, b);
      switch (m) {
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
    }, e.getBestVersionForData = function(b, g) {
      let m;
      const E = o.from(g, o.M);
      if (Array.isArray(b)) {
        if (b.length > 1)
          return h(b, E);
        if (b.length === 0)
          return 1;
        m = b[0];
      } else
        m = b;
      return l(m.mode, m.getLength(), E);
    }, e.getEncodedBits = function(b) {
      if (!a.isValid(b) || b < 7)
        throw new Error("Invalid QR Code version");
      let g = b << 12;
      for (; t.getBCHDigit(g) - i >= 0; )
        g ^= c << t.getBCHDigit(g) - i;
      return b << 12 | g;
    };
  })(nr)), nr;
}
var ir = {}, Ws;
function Yl() {
  if (Ws) return ir;
  Ws = 1;
  const e = We(), t = 1335, n = 21522, o = e.getBCHDigit(t);
  return ir.getEncodedBits = function(a, c) {
    const i = a.bit << 3 | c;
    let l = i << 10;
    for (; e.getBCHDigit(l) - o >= 0; )
      l ^= t << e.getBCHDigit(l) - o;
    return (i << 10 | l) ^ n;
  }, ir;
}
var cr = {}, lr, qs;
function Zl() {
  if (qs) return lr;
  qs = 1;
  const e = qe();
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
  }, lr = t, lr;
}
var dr, js;
function Xl() {
  if (js) return dr;
  js = 1;
  const e = qe(), t = [
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
  }, dr = n, dr;
}
var ur, zs;
function Jl() {
  if (zs) return ur;
  zs = 1;
  const e = qe();
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
  }, ur = t, ur;
}
var hr, Vs;
function ed() {
  if (Vs) return hr;
  Vs = 1;
  const e = qe(), t = We();
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
  }, hr = n, hr;
}
var fr = { exports: {} }, Hs;
function td() {
  return Hs || (Hs = 1, (function(e) {
    var t = {
      single_source_shortest_paths: function(n, o, s) {
        var a = {}, c = {};
        c[o] = 0;
        var i = t.PriorityQueue.make();
        i.push(o, 0);
        for (var l, u, f, h, p, b, g, m, E; !i.empty(); ) {
          l = i.pop(), u = l.value, h = l.cost, p = n[u] || {};
          for (f in p)
            p.hasOwnProperty(f) && (b = p[f], g = h + b, m = c[f], E = typeof c[f] > "u", (E || m > g) && (c[f] = g, i.push(f, g), a[f] = u));
        }
        if (typeof s < "u" && typeof c[s] > "u") {
          var y = ["Could not find a path from ", o, " to ", s, "."].join("");
          throw new Error(y);
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
  })(fr)), fr.exports;
}
var $s;
function rd() {
  return $s || ($s = 1, (function(e) {
    const t = qe(), n = Zl(), o = Xl(), s = Jl(), a = ed(), c = oo(), i = We(), l = td();
    function u(y) {
      return unescape(encodeURIComponent(y)).length;
    }
    function f(y, C, N) {
      const x = [];
      let B;
      for (; (B = y.exec(N)) !== null; )
        x.push({
          data: B[0],
          index: B.index,
          mode: C,
          length: B[0].length
        });
      return x;
    }
    function h(y) {
      const C = f(c.NUMERIC, t.NUMERIC, y), N = f(c.ALPHANUMERIC, t.ALPHANUMERIC, y);
      let x, B;
      return i.isKanjiModeEnabled() ? (x = f(c.BYTE, t.BYTE, y), B = f(c.KANJI, t.KANJI, y)) : (x = f(c.BYTE_KANJI, t.BYTE, y), B = []), C.concat(N, x, B).sort(function(k, v) {
        return k.index - v.index;
      }).map(function(k) {
        return {
          data: k.data,
          mode: k.mode,
          length: k.length
        };
      });
    }
    function p(y, C) {
      switch (C) {
        case t.NUMERIC:
          return n.getBitsLength(y);
        case t.ALPHANUMERIC:
          return o.getBitsLength(y);
        case t.KANJI:
          return a.getBitsLength(y);
        case t.BYTE:
          return s.getBitsLength(y);
      }
    }
    function b(y) {
      return y.reduce(function(C, N) {
        const x = C.length - 1 >= 0 ? C[C.length - 1] : null;
        return x && x.mode === N.mode ? (C[C.length - 1].data += N.data, C) : (C.push(N), C);
      }, []);
    }
    function g(y) {
      const C = [];
      for (let N = 0; N < y.length; N++) {
        const x = y[N];
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
    function m(y, C) {
      const N = {}, x = { start: {} };
      let B = ["start"];
      for (let w = 0; w < y.length; w++) {
        const k = y[w], v = [];
        for (let A = 0; A < k.length; A++) {
          const L = k[A], P = "" + w + A;
          v.push(P), N[P] = { node: L, lastCount: 0 }, x[P] = {};
          for (let S = 0; S < B.length; S++) {
            const M = B[S];
            N[M] && N[M].node.mode === L.mode ? (x[M][P] = p(N[M].lastCount + L.length, L.mode) - p(N[M].lastCount, L.mode), N[M].lastCount += L.length) : (N[M] && (N[M].lastCount = L.length), x[M][P] = p(L.length, L.mode) + 4 + t.getCharCountIndicator(L.mode, C));
          }
        }
        B = v;
      }
      for (let w = 0; w < B.length; w++)
        x[B[w]].end = 0;
      return { map: x, table: N };
    }
    function E(y, C) {
      let N;
      const x = t.getBestModeForData(y);
      if (N = t.from(C, x), N !== t.BYTE && N.bit < x.bit)
        throw new Error('"' + y + '" cannot be encoded with mode ' + t.toString(N) + `.
 Suggested mode is: ` + t.toString(x));
      switch (N === t.KANJI && !i.isKanjiModeEnabled() && (N = t.BYTE), N) {
        case t.NUMERIC:
          return new n(y);
        case t.ALPHANUMERIC:
          return new o(y);
        case t.KANJI:
          return new a(y);
        case t.BYTE:
          return new s(y);
      }
    }
    e.fromArray = function(C) {
      return C.reduce(function(N, x) {
        return typeof x == "string" ? N.push(E(x, null)) : x.data && N.push(E(x.data, x.mode)), N;
      }, []);
    }, e.fromString = function(C, N) {
      const x = h(C, i.isKanjiModeEnabled()), B = g(x), w = m(B, N), k = l.find_path(w.map, "start", "end"), v = [];
      for (let A = 1; A < k.length - 1; A++)
        v.push(w.table[k[A]].node);
      return e.fromArray(b(v));
    }, e.rawSplit = function(C) {
      return e.fromArray(
        h(C, i.isKanjiModeEnabled())
      );
    };
  })(cr)), cr;
}
var Qs;
function sd() {
  if (Qs) return Kt;
  Qs = 1;
  const e = We(), t = jr(), n = ql(), o = jl(), s = zl(), a = Vl(), c = Hl(), i = so(), l = Gl(), u = Kl(), f = Yl(), h = qe(), p = rd();
  function b(w, k) {
    const v = w.size, A = a.getPositions(k);
    for (let L = 0; L < A.length; L++) {
      const P = A[L][0], S = A[L][1];
      for (let M = -1; M <= 7; M++)
        if (!(P + M <= -1 || v <= P + M))
          for (let I = -1; I <= 7; I++)
            S + I <= -1 || v <= S + I || (M >= 0 && M <= 6 && (I === 0 || I === 6) || I >= 0 && I <= 6 && (M === 0 || M === 6) || M >= 2 && M <= 4 && I >= 2 && I <= 4 ? w.set(P + M, S + I, !0, !0) : w.set(P + M, S + I, !1, !0));
    }
  }
  function g(w) {
    const k = w.size;
    for (let v = 8; v < k - 8; v++) {
      const A = v % 2 === 0;
      w.set(v, 6, A, !0), w.set(6, v, A, !0);
    }
  }
  function m(w, k) {
    const v = s.getPositions(k);
    for (let A = 0; A < v.length; A++) {
      const L = v[A][0], P = v[A][1];
      for (let S = -2; S <= 2; S++)
        for (let M = -2; M <= 2; M++)
          S === -2 || S === 2 || M === -2 || M === 2 || S === 0 && M === 0 ? w.set(L + S, P + M, !0, !0) : w.set(L + S, P + M, !1, !0);
    }
  }
  function E(w, k) {
    const v = w.size, A = u.getEncodedBits(k);
    let L, P, S;
    for (let M = 0; M < 18; M++)
      L = Math.floor(M / 3), P = M % 3 + v - 8 - 3, S = (A >> M & 1) === 1, w.set(L, P, S, !0), w.set(P, L, S, !0);
  }
  function y(w, k, v) {
    const A = w.size, L = f.getEncodedBits(k, v);
    let P, S;
    for (P = 0; P < 15; P++)
      S = (L >> P & 1) === 1, P < 6 ? w.set(P, 8, S, !0) : P < 8 ? w.set(P + 1, 8, S, !0) : w.set(A - 15 + P, 8, S, !0), P < 8 ? w.set(8, A - P - 1, S, !0) : P < 9 ? w.set(8, 15 - P - 1 + 1, S, !0) : w.set(8, 15 - P - 1, S, !0);
    w.set(A - 8, 8, 1, !0);
  }
  function C(w, k) {
    const v = w.size;
    let A = -1, L = v - 1, P = 7, S = 0;
    for (let M = v - 1; M > 0; M -= 2)
      for (M === 6 && M--; ; ) {
        for (let I = 0; I < 2; I++)
          if (!w.isReserved(L, M - I)) {
            let _ = !1;
            S < k.length && (_ = (k[S] >>> P & 1) === 1), w.set(L, M - I, _), P--, P === -1 && (S++, P = 7);
          }
        if (L += A, L < 0 || v <= L) {
          L -= A, A = -A;
          break;
        }
      }
  }
  function N(w, k, v) {
    const A = new n();
    v.forEach(function(I) {
      A.put(I.mode.bit, 4), A.put(I.getLength(), h.getCharCountIndicator(I.mode, w)), I.write(A);
    });
    const L = e.getSymbolTotalCodewords(w), P = i.getTotalCodewordsCount(w, k), S = (L - P) * 8;
    for (A.getLengthInBits() + 4 <= S && A.put(0, 4); A.getLengthInBits() % 8 !== 0; )
      A.putBit(0);
    const M = (S - A.getLengthInBits()) / 8;
    for (let I = 0; I < M; I++)
      A.put(I % 2 ? 17 : 236, 8);
    return x(A, w, k);
  }
  function x(w, k, v) {
    const A = e.getSymbolTotalCodewords(k), L = i.getTotalCodewordsCount(k, v), P = A - L, S = i.getBlocksCount(k, v), M = A % S, I = S - M, _ = Math.floor(A / S), O = Math.floor(P / S), W = O + 1, V = _ - O, H = new l(V);
    let D = 0;
    const U = new Array(S), K = new Array(S);
    let re = 0;
    const ue = new Uint8Array(w.buffer);
    for (let ee = 0; ee < S; ee++) {
      const be = ee < I ? O : W;
      U[ee] = ue.slice(D, D + be), K[ee] = H.encode(U[ee]), D += be, re = Math.max(re, be);
    }
    const Ee = new Uint8Array(A);
    let Ae = 0, G, Q;
    for (G = 0; G < re; G++)
      for (Q = 0; Q < S; Q++)
        G < U[Q].length && (Ee[Ae++] = U[Q][G]);
    for (G = 0; G < V; G++)
      for (Q = 0; Q < S; Q++)
        Ee[Ae++] = K[Q][G];
    return Ee;
  }
  function B(w, k, v, A) {
    let L;
    if (Array.isArray(w))
      L = p.fromArray(w);
    else if (typeof w == "string") {
      let _ = k;
      if (!_) {
        const O = p.rawSplit(w);
        _ = u.getBestVersionForData(O, v);
      }
      L = p.fromString(w, _ || 40);
    } else
      throw new Error("Invalid data");
    const P = u.getBestVersionForData(L, v);
    if (!P)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!k)
      k = P;
    else if (k < P)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + P + `.
`
      );
    const S = N(k, v, L), M = e.getSymbolSize(k), I = new o(M);
    return b(I, k), g(I), m(I, k), y(I, v, 0), k >= 7 && E(I, k), C(I, S), isNaN(A) && (A = c.getBestMask(
      I,
      y.bind(null, I, v)
    )), c.applyMask(A, I), y(I, v, A), {
      modules: I,
      version: k,
      errorCorrectionLevel: v,
      maskPattern: A,
      segments: L
    };
  }
  return Kt.create = function(k, v) {
    if (typeof k > "u" || k === "")
      throw new Error("No input text");
    let A = t.M, L, P;
    return typeof v < "u" && (A = t.from(v.errorCorrectionLevel, t.M), L = u.from(v.version), P = c.from(v.maskPattern), v.toSJISFunc && e.setToSJISFunction(v.toSJISFunc)), B(k, L, A, P);
  }, Kt;
}
var mr = {}, pr = {}, Gs;
function ao() {
  return Gs || (Gs = 1, (function(e) {
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
      for (let p = 0; p < u; p++)
        for (let b = 0; b < u; b++) {
          let g = (p * u + b) * 4, m = a.color.light;
          if (p >= f && b >= f && p < u - f && b < u - f) {
            const E = Math.floor((p - f) / l), y = Math.floor((b - f) / l);
            m = h[i[E * c + y] ? 1 : 0];
          }
          o[g++] = m.r, o[g++] = m.g, o[g++] = m.b, o[g] = m.a;
        }
    };
  })(pr)), pr;
}
var Ks;
function nd() {
  return Ks || (Ks = 1, (function(e) {
    const t = ao();
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
      const f = t.getImageWidth(a.modules.size, l), h = u.getContext("2d"), p = h.createImageData(f, f);
      return t.qrToImageData(p.data, a, l), n(h, u, f), h.putImageData(p, 0, 0), u;
    }, e.renderToDataURL = function(a, c, i) {
      let l = i;
      typeof l > "u" && (!c || !c.getContext) && (l = c, c = void 0), l || (l = {});
      const u = e.render(a, c, l), f = l.type || "image/png", h = l.rendererOpts || {};
      return u.toDataURL(f, h.quality);
    };
  })(mr)), mr;
}
var gr = {}, Ys;
function od() {
  if (Ys) return gr;
  Ys = 1;
  const e = ao();
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
      const p = Math.floor(h % a), b = Math.floor(h / a);
      !p && !u && (u = !0), s[h] ? (f++, h > 0 && p > 0 && s[h - 1] || (i += u ? n("M", p + c, 0.5 + b + c) : n("m", l, 0), l = 0, u = !1), p + 1 < a && s[h + 1] || (i += n("h", f), f = 0)) : l++;
    }
    return i;
  }
  return gr.render = function(a, c, i) {
    const l = e.getOptions(c), u = a.modules.size, f = a.modules.data, h = u + l.margin * 2, p = l.color.light.a ? "<path " + t(l.color.light, "fill") + ' d="M0 0h' + h + "v" + h + 'H0z"/>' : "", b = "<path " + t(l.color.dark, "stroke") + ' d="' + o(f, u, l.margin) + '"/>', g = 'viewBox="0 0 ' + h + " " + h + '"', E = '<svg xmlns="http://www.w3.org/2000/svg" ' + (l.width ? 'width="' + l.width + '" height="' + l.width + '" ' : "") + g + ' shape-rendering="crispEdges">' + p + b + `</svg>
`;
    return typeof i == "function" && i(null, E), E;
  }, gr;
}
var Zs;
function ad() {
  if (Zs) return He;
  Zs = 1;
  const e = Wl(), t = sd(), n = nd(), o = od();
  function s(a, c, i, l, u) {
    const f = [].slice.call(arguments, 1), h = f.length, p = typeof f[h - 1] == "function";
    if (!p && !e())
      throw new Error("Callback required as last argument");
    if (p) {
      if (h < 2)
        throw new Error("Too few arguments provided");
      h === 2 ? (u = i, i = c, c = l = void 0) : h === 3 && (c.getContext && typeof u > "u" ? (u = l, l = void 0) : (u = l, l = i, i = c, c = void 0));
    } else {
      if (h < 1)
        throw new Error("Too few arguments provided");
      return h === 1 ? (i = c, c = l = void 0) : h === 2 && !c.getContext && (l = i, i = c, c = void 0), new Promise(function(b, g) {
        try {
          const m = t.create(i, l);
          b(a(m, c, l));
        } catch (m) {
          g(m);
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
  return He.create = t.create, He.toCanvas = s.bind(null, n.render), He.toDataURL = s.bind(null, n.renderToDataURL), He.toString = s.bind(null, function(a, c, i) {
    return o.render(a, i);
  }), He;
}
var id = ad();
const cd = /* @__PURE__ */ An(id);
function ld({ value: e, size: t = 200, alt: n = "QR code", className: o = "" }) {
  const s = J(null), [a, c] = R(null);
  return F(() => {
    !s.current || !e || cd.toCanvas(s.current, e, {
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
function io() {
  const { config: e, _internal: t } = ne(), [n, o] = R(null), [s, a] = R("idle"), [c, i] = R(null), [l, u] = R(!1), [f, h] = R(null), p = j(
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
      const x = await p.get("/mfa/status");
      return o(x), x;
    } catch (x) {
      const B = q(x, "Unable to load two-factor authentication status. Please try again.");
      throw h(B), B;
    } finally {
      u(!1);
    }
  }, [p]), g = T(async () => {
    u(!0), h(null), a("loading");
    try {
      const x = await p.post("/mfa/setup", {});
      return i(x), a("setup"), x;
    } catch (x) {
      const B = q(x, "Unable to start two-factor setup. Please try again.");
      throw h(B), a("error"), B;
    } finally {
      u(!1);
    }
  }, [p]), m = T(
    async (x) => {
      if (!/^\d{6}$/.test(x)) {
        const B = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw h(B), B;
      }
      u(!0), h(null), a("verifying");
      try {
        await p.post("/mfa/enable", { code: x }), a("success");
        try {
          const B = await p.get("/mfa/status");
          o(B);
        } catch {
          o({ enabled: !0, recoveryCodesRemaining: 0 });
        }
      } catch (B) {
        const w = q(B, "Incorrect verification code. Please check and try again.");
        throw h(w), a("error"), w;
      } finally {
        u(!1);
      }
    },
    [p]
  ), E = T(
    async (x) => {
      if (!x) {
        const B = {
          code: "VALIDATION_ERROR",
          message: "Please enter your password"
        };
        throw h(B), B;
      }
      u(!0), h(null);
      try {
        await p.post("/mfa/disable", { password: x }), o({ enabled: !1, recoveryCodesRemaining: 0 }), i(null), a("idle");
      } catch (B) {
        const w = q(B, "Unable to disable two-factor authentication. Please try again.");
        throw h(w), w;
      } finally {
        u(!1);
      }
    },
    [p]
  ), y = T(
    async (x) => {
      if (!/^\d{6}$/.test(x)) {
        const B = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw h(B), B;
      }
      u(!0), h(null);
      try {
        return await p.post(
          "/mfa/recovery-codes/regenerate",
          { code: x }
        );
      } catch (B) {
        const w = q(B, "Unable to regenerate recovery codes. Please try again.");
        throw h(w), w;
      } finally {
        u(!1);
      }
    },
    [p]
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
    beginSetup: g,
    enableTotp: m,
    disableTotp: E,
    regenerateBackupCodes: y,
    clearError: C,
    reset: N
  };
}
function co({ onSuccess: e, onCancel: t, className: n = "" }) {
  const { setupState: o, setupData: s, isLoading: a, error: c, beginSetup: i, enableTotp: l, clearError: u, reset: f } = io(), [h, p] = R("qr"), [b, g] = R(""), [m, E] = R(!1), [y, C] = R(!1), N = J(null);
  F(() => {
    o === "idle" && i().catch(() => {
    });
  }, [o, i]), F(() => {
    o === "success" && e?.();
  }, [o, e]);
  const x = async () => {
    s?.secret && (await navigator.clipboard.writeText(s.secret), E(!0), N.current !== null && window.clearTimeout(N.current), N.current = window.setTimeout(() => E(!1), 2e3));
  }, B = async () => {
    if (s?.recoveryCodes) {
      const v = s.recoveryCodes.join(`
`);
      await navigator.clipboard.writeText(v);
    }
  }, w = async () => {
    try {
      await l(b);
    } catch {
      g("");
    }
  }, k = () => {
    f(), t?.();
  };
  return F(() => () => {
    N.current !== null && (window.clearTimeout(N.current), N.current = null);
  }, []), o === "loading" || o === "idle" && a ? /* @__PURE__ */ r("div", { className: `cedros-totp-setup ${n}`, children: /* @__PURE__ */ r("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ r($, { size: "lg", label: "Setting up two-factor authentication" }) }) }) : o === "error" && !s ? /* @__PURE__ */ d("div", { className: `cedros-totp-setup ${n}`, children: [
    /* @__PURE__ */ r(te, { error: c, onDismiss: u }),
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
      /* @__PURE__ */ r("div", { className: "cedros-totp-qr", children: /* @__PURE__ */ r(ld, { value: s.otpauthUri, size: 200, alt: "QR code for authenticator app" }) }),
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
              children: m ? "Copied!" : "Copy"
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
            onClick: () => p("backup"),
            children: "Continue"
          }
        )
      ] })
    ] }),
    h === "backup" && /* @__PURE__ */ d("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Save recovery codes" }),
      /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. You can use them to access your account if you lose your authenticator device." }),
      /* @__PURE__ */ r("div", { className: "cedros-totp-backup-codes", children: s.recoveryCodes.map((v, A) => /* @__PURE__ */ r("code", { className: "cedros-totp-backup-code", children: v }, A)) }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
          onClick: B,
          children: "Copy all codes"
        }
      ),
      /* @__PURE__ */ d("label", { className: "cedros-checkbox-label cedros-totp-confirm", children: [
        /* @__PURE__ */ r(
          "input",
          {
            type: "checkbox",
            className: "cedros-checkbox",
            checked: y,
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
            disabled: !y,
            children: "Continue"
          }
        )
      ] })
    ] }),
    h === "verify" && /* @__PURE__ */ d("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Verify setup" }),
      /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Enter the 6-digit code from your authenticator app to complete setup." }),
      /* @__PURE__ */ r(
        pn,
        {
          value: b,
          onChange: g,
          onComplete: w,
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
            onClick: w,
            disabled: a || b.length !== 6,
            children: a ? /* @__PURE__ */ d(X, { children: [
              /* @__PURE__ */ r($, { size: "sm" }),
              /* @__PURE__ */ r("span", { children: "Verifying..." })
            ] }) : "Enable 2FA"
          }
        )
      ] })
    ] })
  ] }) : null;
}
function dd({ onStatusChange: e, className: t = "" }) {
  const { status: n, isLoading: o, error: s, getStatus: a, disableTotp: c, regenerateBackupCodes: i, clearError: l } = io(), [u, f] = R("status"), [h, p] = R(""), [b, g] = R(""), [m, E] = R(null), [y, C] = R(!1), [N, x] = R(null);
  F(() => {
    a().catch(() => {
    });
  }, [a]);
  const B = T(() => {
    f("status"), e?.(!0);
  }, [e]), w = async () => {
    C(!0), x(null);
    try {
      await c(h), f("status"), p(""), e?.(!1);
    } catch (A) {
      x(A instanceof Error ? A.message : "Failed to disable 2FA"), p("");
    } finally {
      C(!1);
    }
  }, k = async () => {
    C(!0), x(null);
    try {
      const A = await i(b);
      E(A.recoveryCodes), g("");
    } catch (A) {
      x(A instanceof Error ? A.message : "Failed to regenerate codes"), g("");
    } finally {
      C(!1);
    }
  }, v = async () => {
    m && await navigator.clipboard.writeText(m.join(`
`));
  };
  return o && !n ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ r("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ r($, { size: "md", label: "Loading security settings" }) }) }) : s && !n ? /* @__PURE__ */ d("div", { className: `cedros-totp-settings ${t}`, children: [
    /* @__PURE__ */ r(te, { error: s, onDismiss: l }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => a(),
        children: "Retry"
      }
    )
  ] }) : u === "setup" ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ r(co, { onSuccess: B, onCancel: () => f("status") }) }) : u === "disable" ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Disable two-factor authentication" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description cedros-totp-warning", children: "This will make your account less secure. Enter your password to confirm." }),
    N && /* @__PURE__ */ r("div", { className: "cedros-totp-error", children: /* @__PURE__ */ r(
      te,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => x(null)
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ r(
      we,
      {
        label: "Password",
        placeholder: "Enter your password",
        value: h,
        onChange: (A) => p(A.target.value),
        disabled: y,
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
            f("status"), p(""), x(null);
          },
          disabled: y,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive cedros-button-md",
          onClick: w,
          disabled: y || h.length === 0,
          children: y ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r($, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Disabling..." })
          ] }) : "Disable 2FA"
        }
      )
    ] })
  ] }) }) : u === "regenerate" ? m ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "New recovery codes" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. Your old codes are no longer valid." }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-backup-codes", children: m.map((A, L) => /* @__PURE__ */ r("code", { className: "cedros-totp-backup-code", children: A }, L)) }),
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
      te,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => x(null)
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ r(
      pn,
      {
        value: b,
        onChange: g,
        onComplete: k,
        disabled: y,
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
            f("status"), g(""), x(null);
          },
          disabled: y,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: k,
          disabled: y || b.length !== 6,
          children: y ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r($, { size: "sm" }),
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
class ud {
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
  const { config: e, authState: t, _internal: n } = ne(), [o, s] = R(!1), [a, c] = R(null), i = j(
    () => new ud(
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
      } catch (p) {
        const b = p instanceof Error ? p : new Error("Failed to update profile");
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
      } catch (p) {
        const b = p instanceof Error ? p : new Error("Failed to change password");
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
function Zu({
  onPasswordChange: e,
  onClose: t,
  className: n = ""
}) {
  const { user: o } = St(), { isLoading: s, error: a, changePassword: c, clearError: i } = Rt(), [l, u] = R("main"), [f, h] = R(""), [p, b] = R(""), [g, m] = R(""), [E, y] = R(null), [C, N] = R(null), x = Bt(p), B = p === g, w = f.length > 0 && p.length > 0 && g.length > 0 && x.isValid && B, k = T(async () => {
    if (w) {
      y(null), N(null);
      try {
        await c({
          currentPassword: f,
          newPassword: p
        }), h(""), b(""), m(""), N("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => {
          u("main"), N(null);
        }, 2e3);
      } catch (L) {
        y(L instanceof Error ? L.message : "Failed to change password");
      }
    }
  }, [w, f, p, c, e]), v = T(() => {
    u("main"), h(""), b(""), m(""), y(null), i();
  }, [i]), A = () => o?.name ? o.name.split(" ").map((L) => L[0]).join("").toUpperCase().slice(0, 2) : o?.email ? o.email[0].toUpperCase() : "?";
  return l === "change-password" ? /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (E || a) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      te,
      {
        error: { code: "UNKNOWN_ERROR", message: E || a?.message || "" },
        onDismiss: () => {
          y(null), i();
        }
      }
    ) }),
    C && /* @__PURE__ */ d("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ r("span", { className: "cedros-profile-success-icon", children: "✓" }),
      C
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        we,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: f,
          onChange: (L) => h(L.target.value),
          disabled: s,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        we,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: p,
          onChange: (L) => b(L.target.value),
          disabled: s,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        we,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: g,
          onChange: (L) => m(L.target.value),
          disabled: s,
          error: g.length > 0 && !B ? "Passwords do not match" : void 0
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
          disabled: s || !w,
          children: s ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r($, { size: "sm" }),
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
      ) : /* @__PURE__ */ r("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: A() }) }),
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
class hd {
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
function lo() {
  const { config: e, authState: t, _internal: n } = ne(), [o, s] = R([]), [a, c] = R(!1), [i, l] = R(null), u = j(
    () => new hd(
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
  F(() => {
    t === "authenticated" ? h() : s([]);
  }, [t, h]);
  const p = T(
    async (b) => {
      c(!0), l(null);
      try {
        await u.unlinkCredential(b), await h();
      } catch (g) {
        throw l(g), g;
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
    unlinkCredential: p,
    clearError: f
  };
}
function fd({
  onPasswordChange: e,
  onCancel: t,
  className: n = ""
}) {
  const { isLoading: o, error: s, changePassword: a, clearError: c } = Rt(), [i, l] = R(""), [u, f] = R(""), [h, p] = R(""), [b, g] = R(null), [m, E] = R(null), y = Bt(u), C = u === h, N = i.length > 0 && u.length > 0 && h.length > 0 && y.isValid && C, x = T(async () => {
    if (N) {
      g(null), E(null);
      try {
        await a({ currentPassword: i, newPassword: u }), l(""), f(""), p(""), E("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => t(), 2e3);
      } catch (w) {
        g(w instanceof Error ? w.message : "Failed to change password");
      }
    }
  }, [N, i, u, a, e, t]), B = T(() => {
    g(null), c(), t();
  }, [c, t]);
  return /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (b || s) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      te,
      {
        error: { code: "UNKNOWN_ERROR", message: b || s?.message || "" },
        onDismiss: () => {
          g(null), c();
        }
      }
    ) }),
    m && /* @__PURE__ */ d("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ r("span", { className: "cedros-profile-success-icon", children: "✓" }),
      m
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        we,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: i,
          onChange: (w) => l(w.target.value),
          disabled: o,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        we,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: u,
          onChange: (w) => f(w.target.value),
          disabled: o,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        we,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: h,
          onChange: (w) => p(w.target.value),
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
          onClick: B,
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
            /* @__PURE__ */ r($, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) });
}
function md({ onPasswordChange: e, className: t = "" }) {
  const { user: n, refreshUser: o } = St(), { isLoading: s, error: a, updateProfile: c, clearError: i } = Rt(), { credentials: l } = lo(), {
    forgotPassword: u,
    isLoading: f,
    isSuccess: h,
    reset: p
  } = Wr(), b = l.some((A) => A.credentialType === "password"), [g, m] = R("view"), [E, y] = R(""), [C, N] = R(null), x = () => n?.name ? n.name.split(" ").map((A) => A[0]).join("").toUpperCase().slice(0, 2) : n?.email ? n.email[0].toUpperCase() : "?", B = T(() => {
    y(n?.name || ""), m("edit"), N(null);
  }, [n?.name]), w = T(async () => {
    const A = E.trim();
    if (A) {
      N(null);
      try {
        await c({ name: A }), await o(), m("view");
      } catch (L) {
        N(L instanceof Error ? L.message : "Failed to update name");
      }
    }
  }, [E, c, o]), k = T(() => {
    m("view"), y(""), N(null), i();
  }, [i]), v = T(async () => {
    if (n?.email) {
      N(null);
      try {
        await u(n.email);
      } catch (A) {
        N(A instanceof Error ? A.message : "Failed to send password setup email");
      }
    }
  }, [n?.email, u]);
  return g === "change-password" ? /* @__PURE__ */ r(
    fd,
    {
      onPasswordChange: e,
      onCancel: () => m("view"),
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
        g === "edit" ? /* @__PURE__ */ d("div", { className: "cedros-profile-name-edit", children: [
          /* @__PURE__ */ r(
            "input",
            {
              type: "text",
              className: "cedros-input",
              value: E,
              onChange: (A) => y(A.target.value),
              disabled: s,
              autoFocus: !0,
              onKeyDown: (A) => {
                A.key === "Enter" && w(), A.key === "Escape" && k();
              }
            }
          ),
          /* @__PURE__ */ d("div", { className: "cedros-profile-name-edit-actions", children: [
            /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary cedros-button-sm",
                onClick: w,
                disabled: s || !E.trim(),
                children: s ? /* @__PURE__ */ r($, { size: "sm" }) : "Save"
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
              onClick: B,
              title: "Edit name",
              "aria-label": "Edit name",
              children: /* @__PURE__ */ r(pd, {})
            }
          )
        ] }),
        /* @__PURE__ */ r("p", { className: "cedros-profile-email", children: n?.email })
      ] })
    ] }),
    (C || a) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      te,
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
              m("change-password"), N(null);
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
            disabled: f,
            children: f ? /* @__PURE__ */ r($, { size: "sm" }) : "Add password"
          }
        )
      ] })
    ] })
  ] }) });
}
function pd() {
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
const uo = {
  password: "Email & Password",
  oauth_google: "Google",
  oauth_apple: "Apple",
  solana: "Solana Wallet",
  webauthn_passkey: "Passkey",
  webauthn_security_key: "Security Key",
  totp: "Authenticator App (2FA)",
  sso_oidc: "Single Sign-On"
};
function gd({
  onLinkGoogle: e,
  onLinkApple: t,
  onAddPasskey: n,
  onLinkSolana: o,
  className: s = ""
}) {
  const { credentials: a, isLoading: c, error: i, unlinkCredential: l, clearError: u, fetchCredentials: f } = lo(), { registerPasskey: h, isSupported: p } = eo(), [b, g] = R(null), [m, E] = R(!1), y = T(async () => {
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
    async (A) => {
      const L = A.label || uo[A.credentialType];
      if (window.confirm(
        `Remove "${L}" as a sign-in method? You won't be able to sign in with it anymore.`
      )) {
        g(A.id);
        try {
          await l(A.id);
        } catch {
        } finally {
          g(null);
        }
      }
    },
    [l]
  ), N = new Set(a.map((A) => A.credentialType)), x = e && !N.has("oauth_google"), B = t && !N.has("oauth_apple"), w = (n || p) && !N.has("webauthn_passkey"), k = o && !N.has("solana"), v = x || B || w || k;
  return c && a.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-linked-accounts ${s}`, children: [
    /* @__PURE__ */ r($, {}),
    /* @__PURE__ */ r("span", { children: "Loading linked accounts..." })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-linked-accounts ${s}`, children: [
    i && /* @__PURE__ */ r(
      te,
      {
        error: { code: "UNKNOWN_ERROR", message: i.message },
        onDismiss: u
      }
    ),
    a.length === 0 && !c && /* @__PURE__ */ r("p", { className: "cedros-linked-accounts-empty", children: "No linked sign-in methods found." }),
    a.length > 0 && /* @__PURE__ */ r("ul", { className: "cedros-linked-credential-list", children: a.map((A) => /* @__PURE__ */ r(
      wd,
      {
        credential: A,
        isUnlinking: b === A.id,
        onUnlink: C
      },
      A.id
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
              /* @__PURE__ */ r(ho, {}),
              " Google"
            ]
          }
        ),
        B && /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: t,
            children: [
              /* @__PURE__ */ r(fo, {}),
              " Apple"
            ]
          }
        ),
        w && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: y,
            disabled: m,
            children: m ? /* @__PURE__ */ r($, { size: "sm" }) : /* @__PURE__ */ d(X, { children: [
              /* @__PURE__ */ r(Br, {}),
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
              /* @__PURE__ */ r(mo, {}),
              " Solana"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function wd({
  credential: e,
  isUnlinking: t,
  onUnlink: n
}) {
  const o = e.label || uo[e.credentialType], s = bd[e.credentialType] || yd;
  return /* @__PURE__ */ d("li", { className: "cedros-linked-credential", children: [
    /* @__PURE__ */ r("div", { className: "cedros-linked-credential__icon", children: /* @__PURE__ */ r(s, {}) }),
    /* @__PURE__ */ d("div", { className: "cedros-linked-credential__info", children: [
      /* @__PURE__ */ r("span", { className: "cedros-linked-credential__name", children: o }),
      /* @__PURE__ */ d("span", { className: "cedros-linked-credential__meta", children: [
        "Added ",
        Xs(e.createdAt),
        e.lastUsedAt && /* @__PURE__ */ d(X, { children: [
          " · Last used ",
          Xs(e.lastUsedAt)
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
        children: t ? /* @__PURE__ */ r($, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function Xs(e) {
  const t = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - t.getTime(), s = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), c = Math.floor(o / (1e3 * 60 * 60 * 24));
  return s < 1 ? "just now" : s < 60 ? `${s}m ago` : a < 24 ? `${a}h ago` : c < 30 ? `${c}d ago` : t.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
const bd = {
  password: Ad,
  oauth_google: ho,
  oauth_apple: fo,
  solana: mo,
  webauthn_passkey: Br,
  webauthn_security_key: Br,
  totp: vd,
  sso_oidc: kd
};
function yd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M12 8v4m0 4h.01", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function Ad() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M7 11V7a5 5 0 0110 0v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ r("circle", { cx: "12", cy: "16", r: "1.5", fill: "currentColor" })
  ] });
}
function ho() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("path", { d: "M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 01-2 3.1v2.5h3.3c1.9-1.7 3-4.3 3-7.4z", fill: "#4285F4" }),
    /* @__PURE__ */ r("path", { d: "M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.5c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.4-4H3.2v2.6A10 10 0 0012 22z", fill: "#34A853" }),
    /* @__PURE__ */ r("path", { d: "M6.6 14.1a6 6 0 010-4.2V7.3H3.2a10 10 0 000 9.4l3.4-2.6z", fill: "#FBBC05" }),
    /* @__PURE__ */ r("path", { d: "M12 5.9c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0012 2 10 10 0 003.2 7.3l3.4 2.6C7.3 7.6 9.5 5.9 12 5.9z", fill: "#EA4335" })
  ] });
}
function fo() {
  return /* @__PURE__ */ r("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r(
    "path",
    {
      d: "M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.16 4.36 9.53 8.72 9.28c1.3.07 2.2.74 2.96.8.93-.2 1.82-.92 3.03-.83 1.47.12 2.57.72 3.28 1.83-3.02 1.8-2.3 5.75.5 6.86-.6 1.53-1.37 3.04-2.44 4.34zM12.03 9.2C11.88 7.17 13.5 5.5 15.4 5.35c.29 2.28-2.08 3.98-3.37 3.85z",
      fill: "currentColor"
    }
  ) });
}
function mo() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "2", y: "6", width: "20", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M2 10h20", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("circle", { cx: "17", cy: "14", r: "1.5", fill: "currentColor" })
  ] });
}
function Br() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("circle", { cx: "10", cy: "7", r: "4", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M3 21v-2a7 7 0 017-7", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ r("path", { d: "M17 14v4m0 0v2m0-2h-2m2 0h2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function vd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M9 12h6M12 9v6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function kd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "3", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "13", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "3", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "13", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" })
  ] });
}
class Nd {
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
function Ed() {
  const { config: e, authState: t, _internal: n } = ne(), [o, s] = R([]), [a, c] = R(!1), [i, l] = R(null), u = j(
    () => new Nd(
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
  F(() => {
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
  }, [u, f]), p = j(() => o.filter((b) => !b.isCurrent).length, [o]);
  return {
    sessions: o,
    isLoading: a,
    error: i,
    fetchSessions: f,
    revokeAllSessions: h,
    otherSessionCount: p
  };
}
const Cd = {
  profile: "Profile",
  security: "Security",
  linked: "Linked Accounts"
}, xd = ["profile", "security", "linked"];
function Xu({
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
  const [u, f] = R(e), { sessions: h, isLoading: p, error: b, revokeAllSessions: g } = Ed();
  return /* @__PURE__ */ d("div", { className: `cedros-account-settings ${l}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-account-tabs--line", role: "tablist", children: xd.map((m) => /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        role: "tab",
        "aria-selected": u === m,
        className: `cedros-account-tab ${u === m ? "cedros-account-tab-active" : ""}`,
        onClick: () => f(m),
        children: Cd[m]
      },
      m
    )) }),
    /* @__PURE__ */ d("div", { className: "cedros-account-tab-content", role: "tabpanel", children: [
      u === "profile" && /* @__PURE__ */ r(md, { onPasswordChange: n }),
      u === "security" && /* @__PURE__ */ d("div", { className: "cedros-account-security", children: [
        /* @__PURE__ */ r(dd, { onStatusChange: o }),
        /* @__PURE__ */ r(
          Hc,
          {
            sessions: h,
            isLoading: p,
            error: b ?? void 0,
            onRevokeAll: async () => {
              await g();
            }
          }
        )
      ] }),
      u === "linked" && /* @__PURE__ */ r(
        gd,
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
function Ju({ onComplete: e, className: t }) {
  return /* @__PURE__ */ d("div", { className: `cedros-mfa-setup-prompt ${t ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-mfa-setup-prompt__header", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-mfa-setup-prompt__title", children: "Two-factor authentication required" }),
      /* @__PURE__ */ r("p", { className: "cedros-mfa-setup-prompt__description", children: "Your administrator requires you to set up two-factor authentication before continuing. This adds an extra layer of security to your account." })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-mfa-setup-prompt__body", children: /* @__PURE__ */ r(co, { onSuccess: e }) })
  ] });
}
function eh({
  onComplete: e,
  onSkip: t,
  className: n
}) {
  const { user: o } = St(), { isLoading: s, error: a, updateProfile: c, clearError: i } = Rt(), [l, u] = R(o?.name ?? ""), f = T(
    async (p) => {
      p.preventDefault(), i();
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
function Sd() {
  const { config: e, _internal: t } = ne(), [n, o] = R(!1), [s, a] = R(null), c = j(
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
        const p = h instanceof Error ? h : new Error(String(h));
        throw a(p), p;
      } finally {
        o(!1);
      }
    },
    [c]
  );
  return { checkAvailability: i, getSuggestion: l, setUsername: u, isLoading: n, error: s };
}
function th({
  onComplete: e,
  onSkip: t,
  className: n
}) {
  const { checkAvailability: o, getSuggestion: s, setUsername: a, isLoading: c, error: i } = Sd(), [l, u] = R(""), [f, h] = R("idle"), [p, b] = R(""), g = J(null), m = J(!0);
  F(() => (m.current = !0, s().then((N) => {
    m.current && N && (u(N), h("available"), b("Available"));
  }), () => {
    m.current = !1;
  }), [s]);
  const E = T(
    (N) => {
      const x = N.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (u(x), h("idle"), b(""), g.current && clearTimeout(g.current), x.length < 3) {
        x.length > 0 && (h("error"), b("At least 3 characters"));
        return;
      }
      h("checking"), g.current = setTimeout(async () => {
        try {
          const B = await o(x);
          if (!m.current) return;
          B.error ? (h("error"), b(B.error)) : B.available ? (h("available"), b("Available")) : (h("taken"), b("Already taken"), B.suggestion);
        } catch {
          if (!m.current) return;
          h("error"), b("Could not check availability");
        }
      }, 400);
    },
    [o]
  ), y = T(
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
    /* @__PURE__ */ d("form", { onSubmit: y, className: "cedros-choose-username__form", children: [
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
        p && /* @__PURE__ */ r(
          "span",
          {
            className: `cedros-choose-username__status cedros-choose-username__status--${f}`,
            role: f === "error" || f === "taken" ? "alert" : void 0,
            children: f === "checking" ? "Checking..." : p
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
function Ld() {
  const e = Oe(), [t, n] = R(!1), [o, s] = R(null), a = j(() => e ? new ce({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), c = T(() => {
    s(null);
  }, []), i = T(
    async (g) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      if (!Number.isInteger(g) || g <= 0) {
        const m = new Error(
          `Invalid deposit amount: ${g}. Must be a positive integer (lamports).`
        );
        throw s(m.message), m;
      }
      n(!0), s(null);
      try {
        return await a.post("/deposit", {
          amount_lamports: g
        });
      } catch (m) {
        const E = q(m, "Failed to execute deposit");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [a]
  ), l = T(
    async (g) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        return await a.get(`/deposit/status/${encodeURIComponent(g)}`);
      } catch (m) {
        const E = q(m, "Failed to get deposit status");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [a]
  ), u = T(async () => {
    if (!a)
      throw new Error("useDeposit must be used within a CedrosLoginProvider");
    n(!0), s(null);
    try {
      return await a.get("/deposit/config");
    } catch (g) {
      const m = q(g, "Failed to get deposit config");
      throw s(m.message), m;
    } finally {
      n(!1);
    }
  }, [a]), f = T(
    async (g) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const m = new URLSearchParams();
        g?.limit !== void 0 && m.set("limit", String(g.limit)), g?.offset !== void 0 && m.set("offset", String(g.offset));
        const E = m.toString(), y = E ? `/deposits?${E}` : "/deposits";
        return await a.get(y);
      } catch (m) {
        const E = q(m, "Failed to list deposits");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [a]
  ), h = T(
    async (g) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const m = new URLSearchParams({
          input_mint: g.inputMint,
          amount: String(g.amount),
          taker: g.taker
        });
        return await a.get(`/deposit/quote?${m}`);
      } catch (m) {
        const E = q(m, "Failed to get deposit quote");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [a]
  ), p = T(
    async (g) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        return await a.post("/deposit/public", g);
      } catch (m) {
        const E = q(m, "Failed to execute public deposit");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [a]
  ), b = T(
    async (g) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        return await a.post("/deposit/micro", g);
      } catch (m) {
        const E = q(m, "Failed to execute micro deposit");
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
    publicDeposit: p,
    microDeposit: b,
    getStatus: l,
    getConfig: u,
    listDeposits: f,
    isLoading: t,
    error: o,
    clearError: c
  };
}
function po({
  tokens: e,
  selectedToken: t,
  onSelect: n,
  openSignal: o,
  placeholder: s = "Select token",
  disabled: a = !1,
  className: c = "",
  searchable: i = !0
}) {
  const [l, u] = R(!1), [f, h] = R(""), p = J(null), b = J(null), g = j(() => {
    if (!f.trim()) return e;
    const C = f.toLowerCase();
    return e.filter(
      (N) => N.symbol.toLowerCase().includes(C) || N.name.toLowerCase().includes(C) || N.mint.toLowerCase().includes(C)
    );
  }, [e, f]);
  F(() => {
    const C = (N) => {
      p.current && !p.current.contains(N.target) && (u(!1), h(""));
    };
    if (l)
      return document.addEventListener("mousedown", C), () => document.removeEventListener("mousedown", C);
  }, [l]), F(() => {
    l && i && b.current && b.current.focus();
  }, [l, i]), F(() => {
    o === void 0 || a || (u(!0), h(""));
  }, [o, a]);
  const m = T(() => {
    a || (u((C) => !C), l && h(""));
  }, [a, l]), E = T(
    (C) => {
      n(C), u(!1), h("");
    },
    [n]
  ), y = T(
    (C) => {
      C.key === "Escape" ? (u(!1), h("")) : C.key === "Enter" && g.length === 1 && E(g[0]);
    },
    [g, E]
  );
  return /* @__PURE__ */ d(
    "div",
    {
      ref: p,
      className: `cedros-token-selector ${l ? "cedros-token-selector-open" : ""} ${a ? "cedros-token-selector-disabled" : ""} ${c}`,
      onKeyDown: y,
      children: [
        /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-token-selector-trigger",
            onClick: m,
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
          /* @__PURE__ */ r("div", { className: "cedros-token-list", children: g.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-token-empty", children: "No tokens found" }) : /* @__PURE__ */ r(X, { children: g.map((C) => /* @__PURE__ */ d(
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
function zr(e, t) {
  return t.privateDepositsEnabled && e >= t.privateMinUsd ? "private" : e >= t.publicMinUsd ? "public" : "sol_micro";
}
const Vr = "data:image/webp;base64,UklGRkACAABXRUJQVlA4IDQCAACQDQCdASo8ADwAPjEWiUMiISEUBFQgAwSgB4Z/TeLt3XMAoQH23eph0gPMB+sn+M9tvngOsA9ADwgPg3/cH9sfZciikEBuA1AB+nf+84CUkAVvA2x4xvyobR+mBaYhjUv/ewHb4hTqOnP38rzsxZX2inOSciAA/v7uqvqGdpWcjjrfMDFaNHumTog38t3yor0kbjn631VsX61cAC749wWuAX74u/f/hpeDFqS/ci8E1g94wk9UVs7BHqtv7f/M9iT1u5ITJV0Gv6tE/CW5j/nVR6yExJ6JoDRDOWQ8zVpWH92r3Lnbnc4WJpOchbRT3H5rv//6PP+F//4ehLUlR/4tkRUKZu/yOa26+sywmY+Xc1X2lXMcUv7+eQ7+FBE7bhKc7htieBfH4eR134AVaILL7PWA2FjzAjfaP1Lgirqoq/ZooE8jVD/b4g3J3O3/TG/4ajHe6clnAI/4NdwrnHX0P/quBU03HqSsQ0qsEMAuhrH/jn+YtDzmjm8q/cGJ44qvi24Hn+G1kxz2XP2S/Gp7ri5cMlo+muuwBjyNJnnEcTt/5cRdYS2cbEBZtpINWj3PuC1EOsd/8cTepSpxODcJHLzktfC1PHW3Pgoh3J5PHjW3TCQ1Wlu/wP8e8OPfNm48BODGChioj3ezblqrOBV+cI+hLi7ReJdvBF/4jY+/Un0asuWnrA6kRNpgOeO8wyl4Ryhkrff+9R1SpyPYP+5T3EuWWLZaCn0bGzyk97S3VAAAAAA=", Bd = 1e4, xt = 1e3, go = 3;
function Pd(e) {
  return Number.isFinite(e) ? `$${Math.round(e)}` : "$0";
}
function Rd(e, t) {
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
        detail: `SOL only under ${Pd(t.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens."
      };
  }
}
function Hr(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
function Td(e, t) {
  if (t <= 0) return 0;
  const n = Hr(e / t, 0, 1);
  return Math.round(Math.pow(n, 1 / go) * xt);
}
function Md(e, t) {
  const n = Hr(e / xt, 0, 1);
  return t * Math.pow(n, go);
}
function wo(e) {
  return e < 10 ? 0.01 : e < 100 ? 1 : e < 500 ? 5 : e < 1e3 ? 10 : e < 5e3 ? 25 : 50;
}
function Id(e) {
  return e < 1 ? 2 : 0;
}
function Js(e) {
  const t = wo(e), n = Math.round(e / t) * t, o = Id(t);
  return Number(n.toFixed(o));
}
function bo({
  config: e,
  valueUsd: t,
  onChange: n,
  maxUsd: o = Bd,
  disabled: s = !1,
  className: a = ""
}) {
  const c = Hr(Number.isFinite(t) ? t : 0, 0, o), i = j(() => zr(c, e), [c, e]), l = Rd(i, e), u = Td(c, o), f = u / xt * 100;
  return /* @__PURE__ */ d("div", { className: `cedros-tiered-slider ${a}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-input-row", children: [
      /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-input", children: [
        /* @__PURE__ */ r("span", { className: "cedros-tiered-slider-currency", children: "$" }),
        /* @__PURE__ */ r(
          "input",
          {
            type: "number",
            value: c || "",
            onChange: (h) => n(Js(parseFloat(h.target.value) || 0)),
            placeholder: "Enter amount",
            disabled: s,
            min: 0,
            step: wo(c),
            className: "cedros-deposit-flow-input cedros-tiered-slider-input-field",
            "aria-label": "Deposit amount"
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-tier", children: [
        /* @__PURE__ */ d("span", { className: `cedros-tiered-slider-badge cedros-tiered-slider-badge-${i}`, children: [
          i === "sol_micro" && /* @__PURE__ */ r("img", { src: Vr, alt: "SOL", className: "cedros-tiered-slider-badge-icon" }),
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
        onChange: (h) => n(Js(Md(parseFloat(h.target.value), o))),
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
function _d(e) {
  return e.companyFeePercent > 0 || e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap" || e.feePolicy === "user_pays_privacy";
}
function Dd(e, t, n) {
  const { feePolicy: o, privacyFeePercent: s, swapFeePercent: a, companyFeePercent: c } = e;
  let i = c;
  return n || (o === "user_pays_all" ? (i += a, t && (i += s)) : o === "user_pays_privacy" && t ? i += s : o === "user_pays_swap" && (i += a)), i;
}
const wt = 1e9, $e = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoUrl: Vr
}, Qe = {
  mint: "other",
  symbol: "OTHER",
  name: "Other",
  decimals: 6
}, yo = 1e4;
function Ud(e, t) {
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
function Ao(e, t, n) {
  const o = Ud(e, t), s = n < 0.01 ? 0.01 : n;
  if (o.length === 0)
    return `Total: $${s.toFixed(2)}`;
  const a = o.reduce((g, m) => g + m.solAmount, 0), c = o.reduce((g, m) => g + m.percent, 0), i = { fee: 7, sol: 8, rate: 7, usd: 8 }, l = (g) => {
    const m = g.label.padEnd(i.fee), E = g.solAmount.toFixed(4).padStart(6).padEnd(i.sol), y = (g.percent.toFixed(2) + "%").padStart(5).padEnd(i.rate), C = ("$" + Math.max(g.usdAmount, 0.01).toFixed(2)).padEnd(i.usd);
    return `${m} │ ${E} │ ${y} │ ${C}`;
  }, u = `${"Fee".padEnd(i.fee)} │ ${"SOL".padEnd(i.sol)} │ ${"+ Rate".padEnd(i.rate)} │ ${"= Total".padEnd(i.usd)}`, f = `${"─".repeat(i.fee)}─┼─${"─".repeat(i.sol)}─┼─${"─".repeat(i.rate)}─┼─${"─".repeat(i.usd)}`, h = ("$" + s.toFixed(2)).padEnd(i.usd), p = `${"TOTAL".padEnd(i.fee)} │ ${a.toFixed(4).padStart(6).padEnd(i.sol)} │ ${(c.toFixed(2) + "%").padStart(5).padEnd(i.rate)} │ ${h}`;
  return [u, f, ...o.map(l), f, p].join(`
`);
}
function Fd(e) {
  const t = [], n = e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0, o = e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0, s = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  return n && t.push("Privacy Cash fee"), o && t.push("swap fee"), s && t.push("company service fee"), t.length === 0 ? "No processing fees apply to deposits." : "A small fee may apply. We'll show exact totals before you confirm.";
}
function Tt(e, t) {
  if (t <= 0) return 0;
  const n = t < e.publicMinUsd, o = t >= e.privateMinUsd, s = Dd(e, o, n);
  let a = e.companyFeeFixedLamports;
  n || (o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (a += e.privacyFeeFixedLamports), (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (a += e.swapFeeFixedLamports));
  const c = a / wt * e.solPriceUsd, i = t * (s / 100);
  return c + i;
}
function vo(e, t, n) {
  return e === "sol" ? "SOL" : e === "single-token" ? t.symbol : n.some((s) => s.symbol === "USDC") ? "SOL or USDC" : "SOL or supported tokens";
}
function en(e) {
  return e.map((t) => t.trim()).filter(Boolean);
}
const ko = /* @__PURE__ */ new Set(["USDC", "USDT", "USD1", "PYUSD", "USDH", "CASH"]);
function No(e, t, n) {
  if (ko.has(e.symbol)) return 1;
  const o = t.tokenPrices?.[e.symbol];
  if (o && o > 0) return o;
  if (e.symbol === "SOL") return t.solPriceUsd || null;
  const s = n?.[e.symbol];
  return s && s > 0 ? s : null;
}
function Eo(e, t) {
  const n = ko.has(t) ? 2 : 4;
  return e.toFixed(n);
}
function rh({
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
  className: p = "",
  showStepIndicator: b = !0,
  pollInterval: g = 5e3,
  demoMode: m = !1,
  demoAutoConfirmMs: E,
  tokenPriceUsd: y,
  showExplainer: C = !1,
  siteName: N,
  explainerConfig: x
}) {
  const { deposit: B, getStatus: w, error: k, clearError: v } = Ld(), A = Lt(), L = en(e.quickActionTokens), P = en(e.customTokenSymbols), S = j(() => {
    const z = e.customTokens ?? [];
    if (z.length === 0) return o;
    const Y = new Set(o.map((se) => se.symbol)), Z = [...o];
    for (const se of z)
      Y.has(se.symbol) || (Z.push({
        mint: se.mint,
        symbol: se.symbol,
        name: se.symbol,
        // Use symbol as name for custom tokens
        decimals: se.decimals,
        logoUrl: se.logoUrl
      }), Y.add(se.symbol));
    return Z;
  }, [o, e.customTokens]), M = j(() => {
    if (P.length === 0) return S;
    const z = S.filter((Y) => P.includes(Y.symbol));
    return z.length > 0 ? z : S;
  }, [S, P]), I = e.privateDepositsEnabled, _ = n ? n === "sign" && !I ? "receive" : n : I && A.hasExternalWallet ? "sign" : "receive", O = L[0] ? S.find((z) => z.symbol === L[0]) : void 0, W = t === "sol" ? $e : t === "single-token" ? O ?? S.find((z) => z.symbol === "USDC") ?? S[0] ?? $e : s ?? O ?? S.find((z) => z.symbol === "USDC") ?? S.find((z) => z.symbol !== "SOL") ?? S[0] ?? $e, V = T(() => C ? "explainer" : "unlock", [C]), [H, D] = R(V), [U, K] = R(W), [re, ue] = R(""), [Ee, Ae] = R(null), [G, Q] = R(null), [ee, be] = R(null), [Be, Qr] = R(null), [Mt, Ye] = R(!1), [Lo, It] = R(!1), [st, Gr] = R(null);
  F(() => {
    D(V()), K(W), ue(""), Ae(null), Q(null), be(null), Qr(null), Ye(!1), It(!1), Gr(null), v();
  }, [t, _, W, v, V]);
  const Bo = a ?? e.privateMinSol, Po = c, nt = parseFloat(re), Kr = A.status === "enrolled_locked" || A.status === "enrolled_unlocked" || A.status === "unlocked", _t = Kr && A.isUnlocked, Dt = Kr && !A.isUnlocked, Yr = T(() => {
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
  }, [_, C])(), Ro = Yr.findIndex((z) => z.key === H), Zr = T((z) => {
    K(z);
  }, []), To = T(
    async (z) => {
      if (!h) {
        D(_ === "sign" ? "confirm" : "show-address");
        return;
      }
      It(!0), Q(null);
      try {
        const Z = await h(z, _ === "sign" ? nt : null, U);
        be(Z.sessionId), Qr(Z.depositAddress), D(_ === "sign" ? "confirm" : "show-address");
      } catch (Y) {
        const Z = Y instanceof Error ? Y : new Error("Authorization failed");
        Q(Z.message);
      } finally {
        It(!1);
      }
    },
    [h, _, nt, U]
  ), Mo = T(
    async (z, Y) => {
      v(), Q(null), D("signing");
      const Z = z ?? nt, se = Y ?? U;
      if (!m) {
        if (Dt && f) {
          f(), D("confirm");
          return;
        }
        if (!_t) {
          Q("Wallet not ready"), D("error");
          return;
        }
      }
      try {
        const pe = Math.floor(Z * Math.pow(10, se.decimals));
        if (m) {
          await new Promise((it) => setTimeout(it, 1500));
          const at = {
            token: t === "sol" ? null : se,
            amount: Z,
            amountSmallestUnit: pe,
            txSignature: `demo-tx-${Date.now()}`,
            sessionId: ee || `demo-session-${Date.now()}`,
            response: {
              sessionId: ee || `demo-session-${Date.now()}`,
              txSignature: `demo-tx-${Date.now()}`,
              amountLamports: pe,
              message: "Demo deposit successful",
              withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
            },
            method: "sign"
          };
          Ae(at), D("success"), i?.(at);
          return;
        }
        const fe = await B(pe), ot = {
          token: t === "sol" ? null : se,
          amount: Z,
          amountSmallestUnit: pe,
          txSignature: fe.txSignature,
          sessionId: fe.sessionId,
          response: fe,
          method: "sign"
        };
        Ae(ot), D("success"), i?.(ot);
      } catch (pe) {
        const fe = pe instanceof Error ? pe : new Error("Deposit failed");
        Q(fe.message), D("error"), l?.(fe);
      }
    },
    [
      B,
      nt,
      U,
      t,
      m,
      ee,
      _t,
      Dt,
      f,
      i,
      l,
      v
    ]
  ), Io = T(() => {
    D("waiting");
  }, []), Ut = T(async () => {
    const z = Be || A.solanaPubkey;
    if (z)
      try {
        await navigator.clipboard.writeText(z), Ye(!0), setTimeout(() => Ye(!1), 2e3);
      } catch {
        const Y = document.createElement("textarea");
        Y.value = z, document.body.appendChild(Y), Y.select(), document.execCommand("copy"), document.body.removeChild(Y), Ye(!0), setTimeout(() => Ye(!1), 2e3);
      }
  }, [Be, A.solanaPubkey]);
  F(() => {
    if (!(H === "confirm" || H === "show-address" || H === "waiting") || !ee || m) return;
    let Y = !1, Z = 0;
    const se = 360, pe = async () => {
      if (!(Y || Z >= se)) {
        Z++;
        try {
          const fe = await w(ee);
          if (fe.status === "completed" || fe.status === "detected") {
            const ot = fe.amountLamports ? fe.amountLamports / Math.pow(10, U.decimals) : 0, at = fe.amountLamports || 0, it = {
              token: t === "sol" ? null : U,
              amount: ot,
              amountSmallestUnit: at,
              txSignature: fe.txSignature || "",
              sessionId: ee,
              response: fe,
              method: "receive",
              depositAddress: A.solanaPubkey ?? void 0
            };
            Ae(it), D("success"), i?.(it);
            return;
          }
        } catch {
        }
        Y || setTimeout(pe, g);
      }
    };
    return pe(), () => {
      Y = !0;
    };
  }, [
    H,
    ee,
    m,
    w,
    U,
    t,
    A.solanaPubkey,
    i,
    g
  ]), F(() => {
    if (!m || !E || H !== "waiting" || _ !== "receive" || !Be) return;
    const z = window.setTimeout(() => {
      const Y = st ?? e.privateMinUsd, Z = U.symbol === "SOL" && e.solPriceUsd > 0 ? Y / e.solPriceUsd : Y, se = Math.floor(Z * Math.pow(10, U.decimals)), pe = {
        token: t === "sol" ? null : U,
        amount: Z,
        amountSmallestUnit: se,
        txSignature: `demo-tx-${Date.now()}`,
        sessionId: ee || `demo-session-${Date.now()}`,
        response: {
          sessionId: ee || `demo-session-${Date.now()}`,
          txSignature: `demo-tx-${Date.now()}`,
          amountLamports: se,
          message: "Demo deposit detected",
          withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
        },
        method: "receive",
        depositAddress: Be ?? void 0
      };
      Ae(pe), D("success"), i?.(pe);
    }, E);
    return () => window.clearTimeout(z);
  }, [
    m,
    E,
    H,
    _,
    Be,
    st,
    e,
    U,
    t,
    ee,
    i
  ]);
  const _o = T(() => {
    D(V()), ue(""), Ae(null), Q(null), v();
  }, [V, v]);
  return e.enabled ? /* @__PURE__ */ d("div", { className: `cedros-deposit-flow ${p}`, children: [
    b && H !== "error" && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-steps", children: Yr.map((z, Y) => {
      const Z = Ro >= Y, se = z.key === H;
      return /* @__PURE__ */ d(
        "div",
        {
          className: `cedros-deposit-flow-step-item ${Z ? "step-active" : ""}`,
          children: [
            /* @__PURE__ */ r(
              "div",
              {
                className: `cedros-deposit-flow-step-circle ${Z ? "active" : ""} ${se ? "current" : ""}`,
                children: Y + 1
              }
            ),
            /* @__PURE__ */ r("span", { className: `cedros-deposit-flow-step-label ${Z ? "active" : ""}`, children: z.label })
          ]
        },
        z.key
      );
    }) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-content", children: [
      H === "explainer" && /* @__PURE__ */ r(
        Od,
        {
          siteName: N,
          config: x,
          depositConfig: e,
          currencyMode: t,
          token: U,
          tokens: M,
          onContinue: () => D("unlock"),
          onCancel: u
        }
      ),
      H === "unlock" && /* @__PURE__ */ r(
        Wd,
        {
          token: U,
          tokens: M,
          currencyMode: t,
          depositMethod: _,
          isAuthorizing: Lo,
          error: G,
          onAuthorize: To,
          onBack: C ? () => D("explainer") : void 0,
          onCancel: u
        }
      ),
      H === "confirm" && _ === "sign" && /* @__PURE__ */ r(
        qd,
        {
          token: U,
          tokens: S,
          quickActionSymbols: L,
          customTokenSymbols: P,
          currencyMode: t,
          minAmount: Bo,
          maxAmount: Po,
          depositAddress: Be || A.solanaPubkey,
          walletReady: _t || m,
          needsUnlock: Dt && !m,
          copied: Mt,
          isListening: !!ee && !m,
          config: e,
          onCopy: Ut,
          onTokenSelect: Zr,
          onUnlockRequired: f,
          onConfirm: (z, Y) => Mo(z, Y),
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      H === "signing" && /* @__PURE__ */ r(jd, { depositAddress: A.solanaPubkey }),
      H === "show-address" && /* @__PURE__ */ r(
        zd,
        {
          token: U,
          tokens: S,
          quickActionSymbols: L,
          customTokenSymbols: P,
          tokenPriceUsd: y,
          currencyMode: t,
          depositAddress: Be || A.solanaPubkey,
          copied: Mt,
          isListening: !!ee && !m,
          config: e,
          onCopy: Ut,
          onTokenSelect: Zr,
          onAmountChange: Gr,
          onSent: Io,
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      H === "waiting" && /* @__PURE__ */ r(
        Vd,
        {
          token: U,
          depositAddress: Be || A.solanaPubkey,
          copied: Mt,
          feeLine: st ? `Fees: $${Math.max(Tt(e, st), 0.01).toFixed(2)} total` : "Fees: calculated after deposit",
          onCopy: Ut
        }
      ),
      H === "success" && Ee && /* @__PURE__ */ r(Hd, { result: Ee, config: e, onNewDeposit: _o }),
      H === "error" && /* @__PURE__ */ r(
        $d,
        {
          error: G || k || "An error occurred",
          onRetry: () => D("confirm"),
          onCancel: u
        }
      )
    ] })
  ] }) : /* @__PURE__ */ r("div", { className: `cedros-deposit-flow cedros-deposit-flow-disabled ${p}`, children: /* @__PURE__ */ r("p", { children: "Deposits are not currently available." }) });
}
function Od({
  siteName: e,
  config: t,
  depositConfig: n,
  currencyMode: o,
  token: s,
  tokens: a,
  onContinue: c,
  onCancel: i
}) {
  const l = t?.title ?? "How Deposits Work", u = t?.exchangeName ?? "Coinbase", f = Ho(t?.exchangeUrl) ?? "https://www.coinbase.com", h = t?.showExchangeSuggestion !== !1, p = vo(o, s, a), b = e ? `${e} uses the Solana blockchain to process secure, private payments.` : "This site uses the Solana blockchain to process secure, private payments.", g = t?.body ?? b, m = _d(n), E = Fd(n);
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: l }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: g }),
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
          /* @__PURE__ */ r("strong", { children: m ? "Transparent Fees" : "Low Fees" }),
          /* @__PURE__ */ r("p", { children: E })
        ] })
      ] })
    ] }),
    h && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-explainer-exchange", children: /* @__PURE__ */ d("p", { className: "cedros-deposit-flow-explainer-exchange-text", children: [
      /* @__PURE__ */ r("strong", { children: "New to Solana?" }),
      " You can purchase ",
      p,
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
function Wd({
  token: e,
  tokens: t,
  currencyMode: n,
  depositMethod: o,
  isAuthorizing: s,
  error: a,
  onAuthorize: c,
  onBack: i
}) {
  const [l, u] = R(""), f = vo(n, e, t), h = (p) => {
    p.preventDefault(), l.trim() && c(l);
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
            onChange: (p) => u(p.target.value),
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
function qd({
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
  config: p,
  onCopy: b,
  onTokenSelect: g,
  onUnlockRequired: m,
  onConfirm: E,
  onBack: y
}) {
  const [C, N] = R(p.privateMinUsd), [x, B] = R(!1), [w, k] = R(!1), [v, A] = R(0), [L, P] = R(null), M = zr(C, p) === "sol_micro", I = e.symbol === Qe.symbol, _ = j(() => {
    const G = o.length === 0 ? t : t.filter((be) => o.includes(be.symbol)), Q = G.length > 0 ? G : t;
    return Q.some((be) => be.symbol === Qe.symbol) ? Q : [...Q, Qe];
  }, [t, o]), O = Tt(p, C), W = O < 0.01 ? 0.01 : O, V = I ? "Fees: calculated after deposit" : `Fees: $${W.toFixed(2)} total`, H = I ? "" : Ao(p, C, O), D = No(M ? $e : e, p), U = D ? C / D : e.symbol === "SOL" && p.solPriceUsd > 0 ? C / p.solPriceUsd : C, K = U ? Eo(U, M ? "SOL" : e.symbol) : null, ue = C - O <= 0 && C > 0, Ee = !I && C > 0 && !ue && U >= a && U <= c;
  F(() => {
    if (s === "multi-token")
      if (M && e.symbol !== "SOL") {
        P(e);
        const G = t.find((Q) => Q.symbol === "SOL");
        G && g(G);
      } else !M && L && e.symbol === "SOL" && (g(L), P(null));
  }, [M, e.symbol, s, t, g, L, e]);
  const Ae = () => {
    Ee && E(U, e);
  };
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Choose Amount" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Set how much you want to deposit. Higher tiers unlock privacy." }),
    s === "multi-token" && !M && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-token-quick", children: [
        n.map((G) => {
          const Q = t.find((be) => be.symbol === G), ee = e.symbol === G;
          return /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${ee ? "is-active" : ""}`,
              onClick: () => {
                Q && (B(!1), g(Q));
              },
              disabled: !Q,
              children: [
                Q?.logoUrl && /* @__PURE__ */ r(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: Q.logoUrl,
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
              B(!0), A((G) => G + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      x && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ r(
        po,
        {
          tokens: _,
          selectedToken: e,
          onSelect: g,
          openSignal: v
        }
      ) })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-field", children: /* @__PURE__ */ r(
      bo,
      {
        config: p,
        valueUsd: C,
        onChange: N,
        maxUsd: yo
      }
    ) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: I ? "Sign to send tokens to this address" : `Sign to send ${K ?? "--"} ${M ? "SOL" : e.symbol} to this address` }),
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
          V,
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${w ? "is-open" : ""}`,
              "data-tooltip": H,
              "aria-label": `Fee breakdown: ${H.replaceAll(`
`, ", ")}`,
              "aria-expanded": w,
              onClick: (G) => {
                G.stopPropagation(), k((Q) => !Q);
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
      m && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: m,
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
          onClick: y,
          children: "Back"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: Ae,
          disabled: !Ee || !l || !i,
          children: "Deposit"
        }
      )
    ] })
  ] });
}
function jd({ depositAddress: e }) {
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
function zd({
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
  onAmountChange: p,
  onSent: b,
  onBack: g
}) {
  const [m, E] = R(u.privateMinUsd), [y, C] = R(!1), [N, x] = R(!1), [B, w] = R(0), [k, v] = R(null), L = zr(m, u) === "sol_micro", P = e.symbol === Qe.symbol, S = j(() => {
    const U = o.length === 0 ? t : t.filter((ue) => o.includes(ue.symbol)), K = U.length > 0 ? U : t;
    return K.some((ue) => ue.symbol === Qe.symbol) ? K : [...K, Qe];
  }, [t, o]), M = Tt(u, m), I = M < 0.01 ? 0.01 : M, _ = P ? "Fees: calculated after deposit" : `Fees: $${I.toFixed(2)} total`, O = P ? "" : Ao(u, m, M), W = P || m > 0, V = No(L ? $e : e, u, s), H = V ? m / V : null, D = H ? Eo(H, e.symbol) : null;
  return F(() => {
    if (a === "multi-token")
      if (L && e.symbol !== "SOL") {
        v(e);
        const U = t.find((K) => K.symbol === "SOL");
        U && h(U);
      } else !L && k && e.symbol === "SOL" && (h(k), v(null));
  }, [L, e.symbol, a, t, h, k, e]), F(() => {
    p(m);
  }, [m, p]), c ? /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Send Deposit" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Send funds to your deposit address. We'll confirm automatically." }),
    a === "multi-token" && !L && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-token-quick", children: [
        n.map((U) => {
          const K = t.find((ue) => ue.symbol === U), re = e.symbol === U;
          return /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${re ? "is-active" : ""}`,
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
            className: `cedros-deposit-flow-token-quick-btn ${y ? "is-active" : ""}`,
            onClick: () => {
              C(!0), w((U) => U + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      y && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ r(
        po,
        {
          tokens: S,
          selectedToken: e,
          onSelect: h,
          openSignal: B
        }
      ) })
    ] }),
    !P && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Deposit Amount" }),
      /* @__PURE__ */ r(
        bo,
        {
          config: u,
          valueUsd: m,
          onChange: E,
          maxUsd: yo
        }
      )
    ] }),
    P && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-note", children: "Send any token you want. We'll detect the deposit, swap it, and credit your balance automatically." }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: P ? "Send any token to this address" : `Send ${D ?? "--"} ${L ? "SOL" : e.symbol} to this address` }),
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
          !P && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${N ? "is-open" : ""}`,
              "data-tooltip": O,
              "aria-label": `Fee breakdown: ${O.replaceAll(`
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
          onClick: g,
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
function Vd({ token: e, depositAddress: t, copied: n, feeLine: o, onCopy: s }) {
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
function Hd({ result: e, config: t, onNewDeposit: n }) {
  const o = e.token ?? $e, s = o.symbol === "SOL" && t.solPriceUsd > 0 ? e.amount * t.solPriceUsd : e.amount, a = Tt(t, s), c = Math.max(s - a, 0), i = a < 0.01 ? 0.01 : a;
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
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-summary-row", children: [
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
          s.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-summary-label", children: "Total Fees" }),
        /* @__PURE__ */ d("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-fee", children: [
          "-$",
          i.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-summary-label", children: "Credits Added" }),
        /* @__PURE__ */ d("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-credit", children: [
          "+$",
          c.toFixed(2)
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
function $d({ error: e, onRetry: t, onCancel: n }) {
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
const Qd = "data:image/webp;base64,UklGRmIEAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IIIDAADwDwCdASo8ADwAPm0qkUWkIqGWDVeYQAbEtgBOmZMBu+H816ov3b8R8R2g2FXtxdyh5s3+A60v0APLi9ktgGB/LZjWNAXqgpE6jfW0NF+P4xEhH2L7M+26iGwrTjjcQegyCZqxs+ifvZANjWd279diqZNKUrgOTVtjJGtW4IVtRhMECd5aWVgAAP7nDv3UY/8f1l//xTP/FM/8NU8c9g//sC3+bX/1HZXsNsM57VKG2LVf1a0KdncWO8uPo/Oh79m9ZqjJZwXfPXuvwkK+WDOl6+N8C2Ux6no/V/zkoucKK/JZek7MR5sS8TknXB+6BuVDXou9Rx4aUea2q2IzvLvFIujjKsVYLMab7j9zo48fhgm9YOtjmWuS0WZ4c+6ta0mr3xF4fcdAIFf6oXRSlqovOX0HUiMV//hXwSX1cfP5cLj8c7OTyT/4ce4olJARV95GoY8oF+2uU0blGul3ItlG7c2Hl2/uC6s2WZc7Zukwojx6ed8t97bZ68N1uzCLzPlG7BuYS17F19e0wXnc6vEl3q7ft0K7OEl7r8mY6Kh+Nt/5V/Lp68mFBjLem1JjvC371+lKwez4KCdXwNo2Z04FqyzGpFutY6YQ/r5Tfu7Oi+oNfN0R/W+D4aj1nqHhlqYJzpx2NK4mj0gJIXmX8EArelSQI8mV4Ux9MRPwC2PuZhLTjQZv+Vl4p0D8bSB+Z0rek3hS6G1r80fW3cn767Pz/bXanjVmm34wt1nQPqdJObrZ7vv2NWcEuQKj9d+V6DzeDrq0CtGNcanEB5MY9agi1E6BprEScTdfPXjBeMnPbpD+QO6P7IW4UZ9etCCHtX++S/fl5Iz5RzUr10ojRMw//35C0yTjSEhbe884dPwor64n//KByjUFEGsCPAAXPJp1+O+SiKfUaODq6ncjKayTHXjoXgM7XP1z4sBhIKJZJRiM7vGC/+v/Sk8/jbgZLZDAVz1vLou93y7Yd8hxcWM/BesxgWgeKvl8fjE/Ud8tQKp4425hWh66lzzwxa4J3ctA4/E50wX/eoBOgq0B7+7S6FK4wvPHSNgfh+vwSWIJsJLt/3yjBeb41RRyMDMZqFQTZPEdFpXp48ExEyDayZ6objbjTHoS5WQDnDQpRyqMNKfvd41nhEPdb/hxpzXeTIjWmfHHCT+CQYWXDqLehCh1cRyeYOBwsSlSw5PiquAbsgAARVhJRroAAABFeGlmAABJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAEgAAAABAAAASAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAPAAAAAOgBAABAAAAPAAAAAAAAAA=", Gd = "data:image/webp;base64,UklGRtgCAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IPgBAABQCwCdASo8ADwAPm0wk0ekIqGhKBQMqIANiWkADPF3uV2D8VcQGk1mg+P36i9SLnZvYAQxszEWYzEwX1RVkqG/4BGbJgMSHqhKDFsjWsGfPPrvfef11goNmCDDlBJHVVD+8gAA/vu4q03kl+E7FpjtZ2gc8pQ619Hjv9NywoRZ6az43C1wcrRr/lWzJlJhLWMHN0MkVl1ueAf6Hn8StVzeUfMBXOKkgfe2msx7QWR5PnHW/5c6/35yrtWnrURc2q6UYlGin+v8C2dQqexkW6rX2EEijTI9eEQ46PWH3/59fM2AlMvvR2abaRk5XX7V1triQncRxvMfz5YmYDN+PY/ikcZUNaiFucKoUq5riv0eKCezuFNHecE11ojwJqWRSTWpalkz5autXp6vFS+FT1tWUsB/fs1CCOZxaA1vR1grOEaiuKe1RYm7e05psWtqbXLVmm1bA8Ly9PFkVdCbc6hR3UuBBsFGnVeGOUeMn2onnfvYhBMcM9YPxGdQkwZLXOk1VuQSTk01Shf3fZrFyRlFauftFdPYhKXwqrr+meav1P+KLKBVosqmHnFFfgExsQ/rOf3TSd+mOqQfJA+cF+HojNU7nmM3uDkoCBi+//Gqp+gPNNW8M4LFrol8rxE+7WsjqMgfwv1f+Nr25RtG1Wa/KkniRCAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Kd = "data:image/webp;base64,UklGRhYJAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSGICAAABkJz9nzon3/nNJGnBXRvBI0sDkR7slpRBaMDl5LByx7cEyBWHtWd+8/uiK/95uEfEBKBnFwRwk6Wjm89PW2Tj9OWNo7VxASQ4DDoIML9fbdLYpbFR21tykDAY8ZCLT9okqZrsD0uqJNl5sj6CIAPwDmdqRlNlz6o0vroE5/vlPObv0kyN/dVE3pmHd31xgt0P1MgBauTHLYjrg2DoClM0DtRi4kmA6ylgrMq2cuDaZm0CoQePyTqVhVTWJ+G7EozXqSyosj4K6cIhVBhZ2MjyMNy/BFcZWeDIE8g/PLaoLLRyF/4vgrlPTMVK/DQH+cPjGpUFV17/i6BEZeGVF+Dh4F/kUYGDR4nKDBPX4AX381Deh2C1Q8vB2F4CDqnMUrkPlPMpY+obLQ/j9+k1GjNNLB0z5hJ5fD0f5Y2XTLkkPn9Hy8X4vsGMW/xvt3JqvKflYnz3nCmXxJc3qLlEXj9mzOe4xJSLcW36Oy0P47cplKl5KMvAfj6HwFKbloOxswrBfWoOyvsQjzWmPErwcKhQi6d84eHgcSGPEgSA4Dq1aMpr8PjL3CemYiV+moP8AY9darGUW/D4u+CEsUiRVyH4p8NwmbE4kZUA9y8IRuvUoijr4xB06zFZpxZDWZ+ER/cBEzW2dXDaZnUMAb06hBOmaIOxmHhlCILenWDrI6MOIio/7kIc+uk85u+SSftkasZ78/AOffYOl17RqNqbqtFqZ+A8+i8BI+tPOiRNNdkfllSNZPvJRYEXDDQI3NJerUFjl8ZmbX8ekIBBuyCAjK8d3Xh52iBbp89vHl2ecIAEh54BVlA4IMwFAADQGwCdASo8ADwAPm0qkkYkIiGhLhtqqIANiWwAqSdaNo+beZFT37f+J9yXOd2J6HfQh5gH6edIDzAfst6vXoO9AD/Lf4DrAP2V9gDzY/+57F39p/3/7k+0RmjvYp/meic9ieyvJnZVfquF/a23ZOCHGT/sfDDjQ89zOL9Gewd+s3Vh/b32Gf28Ejb5ttLg9hoDiFb2tMW81eZU9Z1LHfdRSCsRMzHz0WT4BNgUakGf9oJtrGtVJFxHJfxAatIxnW1qjDi9i3DQtJp9pVNKlMoJEWdPKv3KaaFSlhd/aMGiir9CPcex5QAA+fpjxA6zfUamE3wS2zWwLVrt/fXA5+Wvx9j5SID0zuEHU2LisPUxvtRuIUwNrsUis8zy+IMpzft+ZSg+9gdx9e6+ZvPmtj4OByz5qo26J3rXhPy8LBXSpuPb+f+mP4CoTvYDhzQXh/SIGj8Ez1+W5MJ/Tkdw09wPCs3JuR3yoqO63FH/j81xW5Abr7tCdwfXwv3CXDtOcHwUqPCd1aiU2uT6XwgdnYqYygEXGKFx8nmaUvqSn9p8HmIA9dVTOoEnqYFjrNfWY034N2vjohd16cxnkP4PYvHkIOWa/FEUug7/qbJ/GFLPxNh6y9eQ//MzzXbcPwsT2chWXPBXNVF1S9dxv5NUuEueiw2kdebblQuvUSRLN+zx3VyT2lOzWBUqrzsTmeOlxjVcTA83H99r35O4X7WXNq7HExiWXxrdM/Ih4CvPJaEHPxUE/i6WIz6+VGq4RB3sBKl3P4M7/DLWAwCnwcpX228XezqQ4cS2tttWxLTc9cPd1ofek9qF9lpB8RvakdPnj2PruFA9W3iKbNdmgnb+mIpohHuUR73KdDDOHbyfAiOjPzzqomnIU3jcSt7LKOB/Op97sCk0yd18mVG3prs351B+xmCE2Zd3RFKL+mpMz5qcuAFAfRyodbggdgmFGkEGQ33VryYFl/upr31FGdI52sqzuxd7jZIsqCcznUH/gu+xaBw7wla49EmFNf+Ss+91i9Hsys0FS//Ktru1xWgkeEweX77y6Oot5tHQsDxgy0sAI85V7FmlpiiWXQdM12MGfCBfyRM+N23SjOdReeSILYCgsM3r33/54X+lfDVNj427MvbDFtKccqazlQ+iKqC//MvYwqyiJPL1ZbVoCEP774fKZA3D3qvsVPGlp9LPchpTs4mTJugt8qXl82RwXQCDNZXnbEois53E35hkRr+IJhndoRo1o2sZDoTgykbeOKiynPH03+BcUQ8zmxTmiVlHQym/LL3kRREnUlxs2zPPGb2E+Rpdib+LxOvFSmj9RfTZoYIJnrqNnBIXV2lt7xeZ0srf98JymJxrtr8lx69oSNZIReDddL+3iiUjh6lm7EcYuclqBaKp8q68geo7H1EvKy4nSRx5Q+uz4l/ypo2hVdwi9l+BHjZZmJ7lXkpNTRJ0gZpzquzN2vh/MZQALV6FZ6q4aofA9AJy1DVLdNjV8n6s9eFA5pazxwhLW4tgWMciGf5x6G7HqFPTL1ZL3l447zLGUkqAXjkeVaNmxZ2oNKIuTy6JDc0Z61Z2dgbsg6HwCX1/ux5sk82WsnNIO4CTnWKI1aCtQZaEsBf6hIl9n7VBsgZGIcPpqn7P4mbyf3EbfdfQ32qlawLuAxmDlwRsVsPkw7j4aKbvIBykNcsVXv0/X6UXXaAtw3feJnTwDak2qY6QpMLE9e7PJeuQQ8FXpqI5HoR82kd+DOwGH5F3OpuWsmEt8v7WQG8q1LMkg6vrl3I8047zMl1Yq0VwotbrsKJocsHgsbs/PGOO9v2s8U0Sju/71XRtG5skcy2msae3wixjlGR4i6ZfldMehQD1zf/FbWN9hnHfpq1Fh8+PSA9AzUi33qli8ixISbH+tw7CcumxvegMk88HMNZlVdnIEzIfyHrSdZ2S98yX2OYZw0+JyaBbQxI0fOr6KpuMD6FVGLrdN9dgOTgOPQgAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Yd = "data:image/webp;base64,UklGRo4EAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSA4CAAABkGXb2to2V9/v6D1Jmd5CQ5GXPYXAJMrtPOJMoMzMzDgIPYY5+vVds6T/m0BEOGzAtm1IBlR2d8kXUMyaADjeuHr9V7qj3E5/XrvaOA5AHCqzFgHTFz9tUTmEyq1PF6cBqVWDOLjkwS6VPsu8KqnaewRU7j5KIjipgFiQfCf1IGch8wMlv9QhcWk4nLlL9Z4l6b3y7hmUvGQkmF1nnrMC85zrc5CozDUQtwamisNSDCmxjL5jpqxMzfhutFCCY3+5110CaI9/jhVIcPg/DxiIB/x/eKgijLxkRobTyxFEw7zVm0NqcYg5LNAzKD3n4QbmyRVqWCiXJyD9uN7z0Ha9Dw4N5gzOnHU4IMJ7egt8HuYWasIJnlg46fkYgul9qgWU+9PA2Z7b2FngnR3e49Qm1QbKzVPNnltZ8wozK2S8et0SN34wt0LOnynVCsp02xI7tKSqqXYsV7ZtD/lpeaEfNyw/k9evWuKK7XfQ9ruP9/RW/s74t872N1bw2MY8n0Acmlb/KQ04AJ8t5PkeEbpDnbmR2/5392FiOfRFlCuTkIGsMh/aPBeGZFLBYuiM1IIUZLOD0NnMNBMWZdE/4bLo32MQ0wxcJnsvhcnerRhSLvPPhcj8s5DIsmtU6Tj1L1U6zvcEElfrVlHyqGy3epC4om5Vsg3OlO50UQ2V6Qa65LWf6TZ1J/11faBLlpgAVlA4IJgBAADwCQCdASo8ADwAPm0ylEckIyIhKAoAgA2JaQATzh4OcBkEByVmbl5z9gD9U/+J2APQgLaX4twLu19/UVxAWN1IKXE4cIqJBhoyQ0yDYn61m3zk6T7FMg0AAP78+EMvGgC8jLXmcbbmqvufKjG8Tv1M9Krl47vOW74O/Rapv2DgXbg9iK6PrRQG/9d9+rF/ESxzbszVFn3GThrMBmsklj/LPWDQ0pKzG7EyjQL6p6gfUwMze+wPhzJpn8tMqlUVgq6/QSUVcgG+ztsi73rA3vl3n4baeF1INsbuosTXtnsotVYuTii6rscx9OUTvevYcPNvcL9MPhyWeCQw0qynnGtzCIw+oFRN0+TN1mqXkFyk/rFBcH+FHiI6s9XX5EWCKn5vTRt/0RbS687PiXPFC5Zk/Gk4+538IYi+HZDjvlQQWOH/vddfYTerQ5QqWJt1YuaZNThQ2u+/DtXfZPRy1iWWLR9SKFFtlGrqBKWF5nPRPWWMNA3OssvUtvCNBLBA4cn1whzy+SpbgLvnaepxiykjKsU/MhzgAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Zd = "data:image/webp;base64,UklGRqwEAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSL8BAAABkGvbtmlLc5997yvbmW19gBnbDm2kjF5UmW3bthXZVZFdZ+81r+87Z1XlEaHIbSNlMstwos4XUBSTLAFQo/u01Zdf/yLDDze3zB/YwADJEoOoJAKg7oTdH4SF+XxiZlMgSESzwAJdVn2iUJzzOUMiLhQKf+/va2FtBLMBuu1zpHcsincUXhtoTKLsCTVX/KF3wrLhPLm/OWzZtjQWfZ7RhYyAC/lxMowpSzJYJAyFkZDQc21FBMUT7BqGjpHxf3m+XlEPUHE/f3vGgPzmw4awRUaTexkyJhwfNShctVgZXyJDXq4CUyjNy6Y4fVOBIkAPR2GcOE7Jm2NQ/RE9YzXht3a5VYvlOX0xF0fy+tp/ozBuQg6DzZYb6Bi7ed4rB5Mp/1Co4cNhLUo1StLxDIDqrynUoRswiF6nFnIxsDpnZ5WBW0GFZ1qZ8HfLDk5txHHsGDpSa6B0cXZEa+DsTr1M+P4qPdXwjynU4+1/a7oN3Sm6G+meSd27oHsHde++7puj+tYpv7G6b7vun6L7l6n+oZp/t7JmUNUqqhpJV5upakJVLaqqgVW1t6rmV401NGMc1djqH4rpIseSfyPFkgAAVlA4IAQCAABQDACdASo8ADwAPm0yk0akIyGhJgzogA2JaQAThroHvLxu+aPf5G2BYxv+B6XHzx6GPon/o+qz/tOAA/TM82gR0vnExWoiQRM36jlg2UIvwCSqySErzuguz9EP2x/7hsNazr91aIworWI7AAD+/TZ+6Ipl444OdT+2wU0Ov+T8oJuVP/vUbT/w1Jsv6Awnl6rvF/xetfOPt3gTQZZi0Y/AOx563J7CJkqTR/fc/n34zyeKzR80fhfv4ef+Hjhz/CX5aQo+58zg/FdE+7bLoophGfG0szI513EH+q+Gc73H1PFdJYf7CF8v5dhr3tMwEVX5Ji2ZxejK8xrf/E6nVXqlA4DrYNRP09InHc+fEqO/fH8xr+rMf4y1F9TOnwVffZblLoTP6lot0m/sh7sTiDQr0mIA8TiHoOffGDG6KzV+B3239udfhzD740gkRi/m53abX0Ku3vAgadgFFqL0vk8M/4aI+cI+0fbLW17mWGeMu21wSRRQiv5iNgGKR3vEGXAItcLDft1uUzWAfbe1X3zK/ymT7bA/76PB6UUknm+Y5MM4osurUXU/k7P38pN/3slnGfpFzjl4c3USY4mH9ZCJYUuC/kGEnq/yRPalPdODNFvW6s8MiQeQejYNRY0LsJ0WXkK8vXiDmihCivYAOPoSovesL7on+WAArDNM/BcQSQvCYABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Xd = "data:image/webp;base64,UklGRnIIAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSK4BAAABkHPbtrE9+z73/RTbqWw7Lf+BbbNKbTudbZe2qy+VbVv3PmeHj05G6ohg4LaRounNMtN1voB42ABA5R7TNlx5+O7du9e3Tiwb0b4EgFyAOCQM1Z16+DWFUZC7m3uVB2zKQGBhe+77RGHonJffCL1zQuHDxQ1hrEmTatDjHIXOC2MgzpNf1tVJkWgsGhyihI7JIE74aUYp2ITFAoz9QO+ZAs7zanvkEilKbIkMJS5ANwoJmrCodYVOmBqh5zIEJjZc9xods4A4rrPGxGitrJSU71yNyH4Myl7JTEl+5zzYSH9nlkrxHBzxWUzLVEnhh+YI/gq3+UphpvA8m/s7/wg9M4bjFNg/0vplrxQ+rQEDg/xihmT23jxYJZ8UPq8OA5z77Wt405FDR4poSMjiAJhPRxUIu8D+UVonOhfNPEVHPM9juFacwo+1V6kJQ3Y9Sa8ljhPuUvRk4UdNWU9ST3b9n0W3iG5DumdS9y7o3kHVu6/75ii/dbpvrO7brvtPUf2X6f5DVf/dmpxBmauociRVbqbKCXW5qCoHVuXempxf1dZQtXFUbat/yKZTtSUBVlA4INwFAABwGgCdASo8ADwAPm0qj0WkIqEZ+zYAQAbEtgBOmZoZF+E8zGoP3X8VbcdLvma8t+jH0E+YB+ofSA8wH7VdQv0AP75/iOsG9ADy3/Y5/b/91fgI/Y7MOesb0e/q+TUR1vt7VO6mwG0imO70GM5/0P7BX6qelv7EP209lz9oDRea09ZR+SjhX7sBu/ZS7tG917rPgI3Q7XsB7luy2hAg/95C2Z1L362OH1oFziDY/K5gWoSytSAtiKvA/jW1MehBzdLzJfszPPBvGa15IYwIVRTjO2Hz5ZS9HjLMehwAAP64SgjD3qeg6NRe/Ok+iFhrG3pgglCfbam3yBaDUH36sUiQx0PB1ZZyOHq0ky+f97h6tJMvo0p9LkfXecWOFJ8J5G7yRPuL4tzGLT09QulTJw42xp2hd+lMgIa51XoHx/iftn8B2D3k92H5jOQr+uIXFHHK5FpcTG+qGEF+np0LiQa+vdW7/+ZzOLVRf7jR5X3ANPt93Ng92DW7NflVr6kMr88O/v2ZNb0vtgao2Am/R3CDKiNq89f86CT6r2L2g1oTui7H3E1yhSPQpEOz01I3fhfiMMv4weqKuoedxn/xLg5uzHa6Gte4C/dQYkG3ZFSy4CXQtRjftBrjX/Oj+HpSUPDsv0wPW+ml5NbBKDCj2f3SD8TVMf2ZfHrOkR602RVk2UmKC+H0Y9iK6k98vsgPINtz0II8X7Mj2nJkTC6IMLuQ8dNTUq9VXOnhXrdhNZoaH94ePo6baBl3hTGFAnD3/b+gR/vtbqV7wktuX6fpnjeTBe/Drp6z3neeANj/aX4CsU9w67nwYOjZhueCjxaDKUnNjLPjI1e0BoTbcOzOQ0wHJHZJ+Pt608StBu4HiJ8NjH46fnvXL3yiMoSvkAuwCE1AakA+eU1u3unyjl1/MnZQmbp8fzfsfrFesehLPcIkYdCiZ+52QbmINNTjEsvjuBuZRubBE+Laihppsxoo4efGIo0xkw0etu1+yzvkqp88w3pBq0mRl13gnnc+2zl6SmhwgmNFbz+F8qAqmdfJL8iaNSGEWlPlpczDDe62GBZMlBhQmq/XCn/1b+VazHvJXkoIFDF+wktMg+rKfLyfTlXdK0cs+Kn8h+rjMakkf3WLo1TftMLn+O+x/Gat+BGstJrM1xvCSSnHQY+NV4B4gRqyZ55gRNnqN/0lWrATOcHUaGXpkTIM/yxFjxcePcSFo+t2aJ5lShtVukETzRxaIXgRkpROeWQHWpTHOaexmXOzF0b833qJSoXMk2zB/uMrgDzKd7d3ohUz8Ra08WYKlAuMQD08bF4+jUepEspqPLoYLQ73TfmL+1LwKxyTV3gEu6WnxBPWPLnYIGYN9U47ZNlB+NgHgYtKTyii6060RAG+wN32WUVFxCZw0HMHnHFgwxD34L/anlpS7mOrjKgyuGYhFC7iHqTQHuoAO1ekBHV+rndnbETKfa1F7LxNLYq+dmJyytmQrJUCGjelorI1m/TMQNiFVrY4FCI1Gl2W1JsZsw9zA+Bh3JmjkC0H5/0JV6JotNMatJIZ4v5PqwJe3r8xd+FNS3ynccdu+xtVdc27qwVdoomciZD5oXYey9KAFSAKO594sBKZNWUJTLXnt0BJbdF8FkQYvg3DQajYY2p+ixd5Ag7o92gw0pVVDDOP+WQxiEmKqgWJyTBsnsBk2Bxi2Unsv8S/4PmE8Hy/vy+Mij+aTAKZvg716IHfHX0/JMeFfmAnsZ39Q0qkfdPtq6+CxbGZ7wKDsK/8l/MVGuyd6faJFt5wyoOXuNrr3JC9EoBmjcOzkVw/6RNP49poZ1xzsX3q7B4HGfI/XSfRQq3HeZ2j12d0E3gCAube4oExaT1sx/v8F+f61QOsGdSaqM2im6qOGkSRkrRQ7L8hvS8vEYJeVkAbFvX5ov7e/egYYNToMHj651c5/rCVYtB9Ned6GvGN8R0x3t7+lsf8+ofhHRzpyvwxd6c5pREZVOKnXzplhJ61mki4JmAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Jd = "data:image/svg+xml,%3csvg%20width='88'%20height='88'%20viewBox='0%200%2088%2088'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='88'%20height='88'%20fill='url(%23paint0_linear_170_79)'/%3e%3crect%20x='25.6665'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='51.3335'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='29.3335'%20y='40.3333'%20width='29.3333'%20height='7.33333'%20fill='white'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_170_79'%20x1='-75.3077'%20y1='-55'%20x2='146.302'%20y2='148.167'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FF00FF'/%3e%3cstop%20offset='0.531673'%20stop-color='%237A84FF'/%3e%3cstop%20offset='1'%20stop-color='%2305FAFF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e", eu = "data:image/webp;base64,UklGRh4HAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSNwBAAABkFxbexpJnyR3z8y+ajXMkAnjnnOgbUUxEAHjkpldWQwzFUn6v3PGVNI/AUQEA7dt49gN3PXavTlfQDeNAeyqg4PL5buRyOhteXlwcJWtHU8qzUIBs+30g7/s4N8Hp7cZFAtpDc7Bbr8xplB8iFJBYvBC4fjGdgvnElqdwc6XFPGRnQxehC93wjgzbxRYf1UYA+dkiJSrG1DMV6zDoW+MkQmMkd8Owdl5AsvOM3gm0geeXwY7R/Tu0EcmM3re6cF2Rr/kTJiBMmPZh+2q/wtm4ozD9qrB0tucMhunvL0Upg1n6JmRnmda4HCckVkZeRyuMWjjF0peCD9vhK3jAgMzM/BCDQ576225m/bCwcA+qzS/PLUwDrsr1ZDdcAa3KtWQWzDYPKZoQDjeDJyoVEdOAPf0cA/Lf1F0IPy1fG8VWmXvgF4LnoOLDFoIvPiaUQuRr99pNr8dUZEj0YToQnfjreaQd7oL6T6Tuu+C7juo++6rfnOUv3W631jNb7v+P8U+1ZDAZxZG9R+q/e+GxcbPuRcRftkIq+pVVD2Srjdr94TDnJ6w7MGqedFhH1bVA6t67zk9/3ctzw+YAhvSc431KExyjjNHQ2zLcTRzq/8op0vKJd+OREbvUnJJAFZQOCBaBAAA8BUAnQEqPAA8AD5tMJRHJCMiISgb+1CADYlsAJ0zIUCfxfmY2f+0b2AbztDnPeKX0qPMp+wHrDehz0AP7J/o+tP9ADy3f23+C79yPYA/aqK9mONrQbuszbsEyALJNTfg+Z6NjG2v+ETCuvlr1q6QUqEiAMUndG/WwfnjJIOTfOBS4W1w0HjOJa1XQ2K33n2b07EOjOBapwKzyoA2erTBTnEKlFjllBy68GBjZ+UKnlzN/f5ibbb4gAD+i9OsnW0xUnmTpyhVasIKzTu0BsXnfBm4rHJqGMFJBUgTESDXEPcNjAeaHP8ck9qdNBH4L/h53tXgHeZttc7c4lwTa6U4Lziz8qUoy8ce0IMc5TFElawGj16tME0GzSSbUqgH7/tYA6huPsWM2z3GjP8b9y7paRbINxwYRtuE90I6QVsNrEkbhL1YfwxRXnuobOfSe3KFVamrvsOqwTCMqlNfjsR3pyoiZ+lYt3+AH6x4ZVNltbYI5KiVhgCu1isooK324ldloH3zhlefYKEwTCYfNjbeH5UiL7JSev+t/C+ftc3TkAHcsvrLCU6n5pYYY2Yr1kRq+r6XVzI6iXuA/TqwMk6xq1PmdzHOwKavncLjWJrk0uU/5E5WKqXM0tgl5s3pduHjb5aiAt0ikEisMyYwnIhDiSemPRdGON4RlwSb3OEpZjhuZqoyen4Sw/fULewt3hAZizeiPZx1o9LS3M/4r3v/M6/o5925VJcmxAf/yjsyjCz0mV+6NuIeWp8shrFaIGgeduVJoZ0Kys1WjSLuFg9QvF5LlkOZ2k7WrzSu4ucsUOS/X4wnQvB0RCnR1PCsU4NDdLfxvQITUgGIuVTJ7LR73PHzZam/Z21oy3euiU55ffITekwjR4SgVoPvhxbdBSyVePf/twm62pSK9IfgPGN+ttubhQub1ooVZymdQCrS3goEs6dlnl/6TVfkgxFyBfAORkZafeu/Va2vIgUBNUQd48W8oPiMFjx+SAKx1qm2IwCLnuhJGf9M4nCzu7oo43f+nBeT07IjB+FpFKRGFNvlpLEXhPclSgFkqeU1W2eNqW2zShCWkQkgfE1HAoNX3z+CQcRQJq+HkC2nSjFdFYT8UNYNS6lYcyVWzEnOos1qpsNRxnLqY2Dl5CCT3Yeg/qT8chfF9ZadFvzNTEIDlARoN//7IU23MtuLdpsAjsiGfBHuR7y4lemYPdD/9Cuff9Qn/r/xlhmB5x2Y9Z1yME3aANAb5+u3lYz01zUlWwakKVmv9fhaeu/YzQ7BXLlcb+cbaIF5t/COmObnt20zaTfjad542f7p7f2Xea134nvyPYS+EAgjM+GufHvl9tXCrrRbH0pn7kH2XEGx9VbO4mY54+QZa5kPr0j3AOEtKd7SJWjlg5TQfgIuB6KoLGainSwF+pPdiCmzEzAOa1eFwn//2VdDMeq42/bKH8U4orewhLh60ci/S0BRBuItNMc+v1+vxl0YyS5it4AAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", tu = "data:image/svg+xml,%3csvg%20width='868'%20height='868'%20viewBox='0%200%20868%20868'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='434'%20cy='434'%20r='434'%20fill='%231B262D'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M234.563%20184H640.697C650.387%20184%20659.339%20189.164%20664.172%20197.542L782.495%20402.657C788.631%20413.294%20786.808%20426.72%20778.056%20435.346L452.368%20756.327C441.818%20766.724%20424.846%20766.724%20414.296%20756.327L89.0484%20435.78C80.0927%20426.954%2078.4157%20413.136%2085.0013%20402.433L211.48%20196.884C216.405%20188.879%20225.146%20184%20234.563%20184ZM588.257%20275.577V333.129H472.567V373.032C553.82%20377.296%20614.782%20394.81%20615.234%20415.802L615.231%20459.563C614.779%20480.556%20553.82%20498.069%20472.567%20502.333V600.259H395.746V502.333C314.492%20498.069%20253.531%20480.555%20253.078%20459.563L253.081%20415.802C253.533%20394.81%20314.492%20377.296%20395.746%20373.032V333.129H280.055V275.577H588.257ZM434.156%20472.268C520.868%20472.268%20593.345%20457.459%20611.082%20437.683C596.041%20420.912%20541.636%20407.713%20472.567%20404.089V445.867C460.187%20446.516%20447.336%20446.858%20434.156%20446.858C420.976%20446.858%20408.125%20446.516%20395.746%20445.867V404.089C326.676%20407.713%20272.271%20420.912%20257.23%20437.683C274.968%20457.459%20347.444%20472.268%20434.156%20472.268Z'%20fill='%23009393'/%3e%3c/svg%3e", ru = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: Vr
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: Xd
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: tu
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
    logoUrl: Kd
  },
  {
    mint: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    name: "WLFI USD",
    decimals: 6,
    logoUrl: eu
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logoUrl: Zd
  },
  {
    mint: "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    name: "Hubble USD",
    decimals: 6,
    logoUrl: Jd
  },
  {
    mint: "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT",
    symbol: "CASH",
    name: "Stripe USD",
    decimals: 6,
    logoUrl: Gd
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoUrl: Qd
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
    logoUrl: Yd
  }
];
function Co() {
  const e = Oe(), [t, n] = R(!1), [o, s] = R(null), a = j(() => e ? new ce({
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
        f?.currency && h.set("currency", f.currency), f?.limit && h.set("limit", f.limit.toString()), f?.offset && h.set("offset", f.offset.toString());
        const p = h.toString(), b = p ? `/credits/history?${p}` : "/credits/history";
        return await a.get(b);
      } catch (h) {
        const p = q(h, "Failed to fetch transaction history");
        throw s(p.message), p;
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
function sh({
  showAllCurrencies: e = !1,
  refreshInterval: t = 0,
  compact: n = !1,
  className: o = "",
  onLoad: s
}) {
  const { getBalance: a, getAllBalances: c, isLoading: i, error: l, clearError: u } = Co(), [f, h] = R([]), [p, b] = R(null), g = T(async () => {
    try {
      if (e) {
        const m = await c();
        h(m), s?.(m);
      } else {
        const m = await a();
        h([m]), s?.([m]);
      }
      b(null);
    } catch (m) {
      b(m instanceof Error ? m.message : "Failed to load balance");
    }
  }, [e, a, c, s]);
  if (F(() => {
    g();
  }, [g]), F(() => {
    if (t <= 0) return;
    const m = setInterval(g, t);
    return () => clearInterval(m);
  }, [t, g]), p || l)
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-error ${o}`, children: [
      /* @__PURE__ */ r("p", { className: "cedros-credit-error", children: p || l }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-credit-retry",
          onClick: () => {
            u(), b(null), g();
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
    const m = f[0];
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-compact ${o}`, children: [
      m ? /* @__PURE__ */ r(
        "span",
        {
          className: "cedros-credit-value",
          title: `${m.balanceLamports} lamports`,
          children: m.display
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
          onClick: g,
          disabled: i,
          title: "Refresh balance",
          children: i ? "..." : "↻"
        }
      )
    ] }),
    f.length === 0 ? /* @__PURE__ */ d("div", { className: "cedros-credit-empty", children: [
      /* @__PURE__ */ r("p", { className: "cedros-credit-empty-message", children: "No credit balance yet." }),
      /* @__PURE__ */ r("p", { className: "cedros-credit-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ r("div", { className: "cedros-credit-list", children: f.map((m) => /* @__PURE__ */ d("div", { className: "cedros-credit-item", children: [
      /* @__PURE__ */ r("span", { className: "cedros-credit-currency", children: m.currency }),
      /* @__PURE__ */ r("span", { className: "cedros-credit-amount", children: m.display })
    ] }, m.currency)) })
  ] });
}
const wr = [
  { key: "all", label: "All", txTypes: null },
  { key: "deposits", label: "Deposits", txTypes: ["deposit"] },
  { key: "usage", label: "Usage", txTypes: ["spend", "usage", "charge"] },
  {
    key: "adjustments",
    label: "Adjustments",
    txTypes: ["refund", "adjustment", "bonus", "credit"]
  }
];
function su(e, t) {
  const n = e < 0, o = Math.abs(e), s = t.toUpperCase() === "SOL", c = o / Math.pow(10, s ? 9 : 6), i = n ? "-" : "+";
  return s ? `${i}${c.toFixed(4)} SOL` : `${i}$${c.toFixed(2)}`;
}
function nu(e) {
  const t = new Date(e), n = /* @__PURE__ */ new Date(), o = n.getTime() - t.getTime(), s = Math.floor(o / (1e3 * 60 * 60 * 24));
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
function ou(e) {
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
function au(e, t) {
  const n = (e || "").toLowerCase();
  return n === "deposit" ? "↓" : n === "spend" || n === "usage" || n === "charge" ? "↑" : n === "refund" ? "←" : n === "bonus" || n === "credit" ? "★" : t ? "+" : "−";
}
function nh({
  defaultTab: e = "all",
  pageSize: t = 10,
  refreshInterval: n = 0,
  className: o = "",
  onLoad: s,
  onTransactionClick: a
}) {
  const { getHistory: c, isLoading: i, error: l, clearError: u } = Co(), [f, h] = R(e), [p, b] = R([]), [g, m] = R(0), [E, y] = R(0), [C, N] = R(null), x = wr.find((S) => S.key === f) || wr[0], B = j(() => x.txTypes === null ? p : p.filter((S) => {
    const M = S.txType || "";
    return x.txTypes.some((I) => M.toLowerCase().includes(I.toLowerCase()));
  }), [p, x.txTypes]), w = T(async () => {
    try {
      const S = await c({ limit: t * 3, offset: E });
      b(S.transactions), m(S.total), s?.(S), N(null);
    } catch (S) {
      N(S instanceof Error ? S.message : "Failed to load history");
    }
  }, [t, E, c, s]);
  F(() => {
    y(0);
  }, [f]), F(() => {
    w();
  }, [w]), F(() => {
    if (n <= 0) return;
    const S = setInterval(w, n);
    return () => clearInterval(S);
  }, [n, w]);
  const k = Math.ceil(g / t), v = Math.floor(E / t) + 1, A = (S) => {
    const M = (S - 1) * t;
    y(Math.max(0, Math.min(M, Math.max(0, g - 1))));
  }, L = (S) => {
    h(S);
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
            u(), N(null), w();
          },
          children: "Retry"
        }
      )
    ] });
  if (i && p.length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-tx-history cedros-tx-history-loading ${o}`, children: [
      /* @__PURE__ */ r("span", { className: "cedros-tx-loading-indicator" }),
      /* @__PURE__ */ r("span", { className: "cedros-tx-loading-text", children: "Loading transactions..." })
    ] });
  const P = (S) => S.txTypes === null ? p.length : p.filter((M) => {
    const I = M.txType || "";
    return S.txTypes.some((_) => I.toLowerCase().includes(_.toLowerCase()));
  }).length;
  return /* @__PURE__ */ d("div", { className: `cedros-tx-history ${o}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-tx-header", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-tx-title", children: "Transaction History" }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-tx-refresh",
          onClick: w,
          disabled: i,
          title: "Refresh",
          children: i ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-tx-tabs", children: wr.map((S) => {
      const M = P(S), I = f === S.key;
      return /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: `cedros-tx-tab ${I ? "cedros-tx-tab-active" : ""}`,
          onClick: () => L(S.key),
          children: [
            S.label,
            M > 0 && /* @__PURE__ */ r("span", { className: "cedros-tx-tab-count", children: M })
          ]
        },
        S.key
      );
    }) }),
    B.length === 0 ? /* @__PURE__ */ d("div", { className: "cedros-tx-empty", children: [
      /* @__PURE__ */ r("p", { className: "cedros-tx-empty-message", children: f === "all" ? "No transactions yet." : `No ${x.label.toLowerCase()} found.` }),
      f === "all" && /* @__PURE__ */ r("p", { className: "cedros-tx-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-tx-list", children: B.slice(0, t).map((S) => {
        const M = S.amountLamports >= 0;
        return /* @__PURE__ */ d(
          "div",
          {
            className: `cedros-tx-item ${M ? "cedros-tx-item-positive" : "cedros-tx-item-negative"}`,
            onClick: () => a?.(S),
            onKeyDown: (I) => {
              (I.key === "Enter" || I.key === " ") && (I.preventDefault(), a?.(S));
            },
            role: a ? "button" : void 0,
            tabIndex: a ? 0 : void 0,
            children: [
              /* @__PURE__ */ r(
                "div",
                {
                  className: `cedros-tx-icon ${M ? "cedros-tx-icon-positive" : "cedros-tx-icon-negative"}`,
                  children: au(S.txType, M)
                }
              ),
              /* @__PURE__ */ d("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-tx-type", children: ou(S.txType) }),
                  /* @__PURE__ */ r(
                    "span",
                    {
                      className: `cedros-tx-amount ${M ? "cedros-tx-amount-positive" : "cedros-tx-amount-negative"}`,
                      children: su(S.amountLamports, S.currency)
                    }
                  )
                ] }),
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-tx-description", children: S.description }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-date", children: nu(S.createdAt) })
                ] })
              ] })
            ]
          },
          S.id
        );
      }) }),
      k > 1 && /* @__PURE__ */ d("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => A(v - 1),
            disabled: v <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ d("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          v,
          " of ",
          k
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => A(v + 1),
            disabled: v >= k,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function xo() {
  const e = Oe(), [t, n] = R(!1), [o, s] = R(null), [a, c] = R(null), i = j(() => e ? new ce({
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
      const g = q(b, "Failed to fetch wallet balances");
      throw s(g.message), g;
    }
  }, [i]), f = T(
    async (b, g) => {
      if (!i)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const m = await i.post("/wallet/withdraw/sol", {
          destination: b,
          amount_lamports: g
        });
        return c(m), m;
      } catch (m) {
        const E = q(m, "Failed to withdraw SOL");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [i]
  ), h = T(
    async (b, g, m) => {
      if (!i)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const E = await i.post("/wallet/withdraw/spl", {
          destination: b,
          token_mint: g,
          amount: m
        });
        return c(E), E;
      } catch (E) {
        const y = q(E, "Failed to withdraw token");
        throw s(y.message), y;
      } finally {
        n(!1);
      }
    },
    [i]
  ), p = T(
    async (b = 10, g = 0) => {
      if (!i)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      try {
        const m = Math.max(1, Math.min(100, Math.trunc(b))), E = Math.max(0, Math.trunc(g)), y = new URLSearchParams({
          limit: String(m),
          offset: String(E)
        });
        return await i.get(
          `/wallet/withdraw/history?${y}`
        );
      } catch (m) {
        const E = q(m, "Failed to fetch withdrawal history");
        throw s(E.message), E;
      }
    },
    [i]
  );
  return {
    withdrawSol: f,
    withdrawSpl: h,
    getBalances: u,
    getHistory: p,
    isSubmitting: t,
    error: o,
    clearError: l,
    lastResult: a
  };
}
const br = "So11111111111111111111111111111111111111112", iu = {
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
function cu(e) {
  return e.length < 32 || e.length > 50 ? !1 : /^[1-9A-HJ-NP-Za-km-z]+$/.test(e);
}
function yr(e) {
  return e.length <= 16 ? e : `${e.slice(0, 6)}...${e.slice(-6)}`;
}
function mt(e, t) {
  return (Number(e) / Math.pow(10, t)).toLocaleString(void 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(t, 6)
  });
}
function oh({
  onSuccess: e,
  onError: t,
  onCancel: n,
  className: o = ""
}) {
  const s = Oe(), { withdrawSol: a, withdrawSpl: c, getBalances: i, isSubmitting: l, error: u, clearError: f } = xo(), [h, p] = R("loading"), [b, g] = R([]), [m, E] = R(null), [y, C] = R(""), [N, x] = R(""), [B, w] = R(null), [k, v] = R(null), [A, L] = R(null), P = s?.config.solana?.network ?? "mainnet-beta", S = j(() => {
    if (!B?.txSignature) return "";
    const D = `https://explorer.solana.com/tx/${B.txSignature}`;
    return P === "mainnet-beta" ? D : `${D}?cluster=${encodeURIComponent(P)}`;
  }, [B, P]), M = j(() => {
    if (!m || !N) return "0";
    const D = parseFloat(N);
    return isNaN(D) || D <= 0 ? "0" : Math.floor(D * Math.pow(10, m.decimals)).toString();
  }, [N, m]);
  F(() => {
    if (!s) return;
    let D = !1;
    return (async () => {
      try {
        const U = await i();
        if (D) return;
        const K = [];
        U.solLamports > 0 && K.push({
          symbol: "SOL",
          mint: br,
          decimals: 9,
          rawBalance: String(U.solLamports),
          displayBalance: mt(String(U.solLamports), 9)
        });
        for (const re of U.tokens) {
          const ue = iu[re.mint] ?? yr(re.mint);
          K.push({
            symbol: ue,
            mint: re.mint,
            decimals: re.decimals,
            rawBalance: re.amount,
            displayBalance: mt(re.amount, re.decimals)
          });
        }
        g(K), p((K.length > 0, "select"));
      } catch {
        D || (L("Failed to load wallet balances"), p("select"));
      }
    })(), () => {
      D = !0;
    };
  }, [s, i]);
  const I = T(
    (D) => {
      E(D), p("form"), f(), v(null), x("");
    },
    [f]
  ), _ = T(() => {
    if (!m) return;
    const D = Number(m.rawBalance) / Math.pow(10, m.decimals);
    m.mint === br ? x(String(Math.max(0, D - 0.01))) : x(String(D));
  }, [m]), O = T(() => {
    if (v(null), !y.trim()) {
      v("Destination address is required");
      return;
    }
    if (!cu(y.trim())) {
      v("Invalid Solana address");
      return;
    }
    if (!N || parseFloat(N) <= 0 || isNaN(parseFloat(N))) {
      v("Please enter a valid amount");
      return;
    }
    if (M === "0") {
      v("Amount is too small");
      return;
    }
    p("confirm");
  }, [y, N, M]), W = T(async () => {
    if (m) {
      p("processing"), f();
      try {
        let D;
        m.mint === br ? D = await a(y.trim(), Number(M)) : D = await c(y.trim(), m.mint, M), w(D), p("success"), e?.(D);
      } catch (D) {
        p("confirm"), t?.(D instanceof Error ? D : new Error(String(D)));
      }
    }
  }, [
    m,
    y,
    M,
    a,
    c,
    f,
    e,
    t
  ]), V = T(() => {
    f(), v(null), h === "form" ? (p("select"), E(null), x(""), C("")) : h === "confirm" && p("form");
  }, [h, f]), H = T(() => {
    p("select"), E(null), C(""), x(""), w(null), f(), v(null);
  }, [f]);
  return s ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal ${o}`, children: [
    h === "loading" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ r($, {}),
      /* @__PURE__ */ r("p", { className: "cedros-withdrawal-processing-text", children: "Loading wallet balances..." })
    ] }),
    h === "select" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-select", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Withdraw" }),
        /* @__PURE__ */ r("p", { className: "cedros-withdrawal-subtitle", children: "Select a token to withdraw" })
      ] }),
      A && /* @__PURE__ */ r(te, { error: A }),
      b.length === 0 && !A && /* @__PURE__ */ r("p", { className: "cedros-withdrawal-empty", children: "No tokens found in your wallet." }),
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
    h === "form" && m && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-form", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: V,
            children: "Back"
          }
        ),
        /* @__PURE__ */ d("h3", { className: "cedros-withdrawal-title", children: [
          "Withdraw ",
          m.symbol
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-balance-hint", children: [
        "Balance: ",
        m.displayBalance,
        " ",
        m.symbol
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
            value: y,
            onChange: (D) => C(D.target.value),
            autoComplete: "off",
            spellCheck: !1
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ d("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-amount", children: [
          "Amount (",
          m.symbol,
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
      (k || u) && /* @__PURE__ */ r(te, { error: k || u || "" }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-withdrawal-submit",
          onClick: O,
          children: "Review Withdrawal"
        }
      )
    ] }),
    h === "confirm" && m && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-confirm", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: V,
            disabled: l,
            children: "Back"
          }
        ),
        /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Confirm Withdrawal" })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary", children: [
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Token" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", children: m.symbol })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Amount" }),
          /* @__PURE__ */ d("span", { className: "cedros-withdrawal-summary-value", children: [
            mt(M, m.decimals),
            " ",
            m.symbol
          ] })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Destination" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", title: y, children: yr(y) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Est. Fee" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", children: "~0.000005 SOL" })
        ] })
      ] }),
      u && /* @__PURE__ */ r(te, { error: u }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: V,
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
      /* @__PURE__ */ r($, {}),
      /* @__PURE__ */ d("p", { className: "cedros-withdrawal-processing-text", children: [
        "Sending ",
        m?.symbol,
        "..."
      ] })
    ] }),
    h === "success" && B && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-success", children: [
      /* @__PURE__ */ r("div", { className: "cedros-withdrawal-success-icon", children: "✓" }),
      /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Withdrawal Complete" }),
      /* @__PURE__ */ d("p", { className: "cedros-withdrawal-subtitle", children: [
        mt(M, m?.decimals ?? 9),
        " ",
        m?.symbol,
        " ",
        "sent"
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-tx", children: [
        /* @__PURE__ */ r("span", { className: "cedros-withdrawal-tx-label", children: "Transaction" }),
        /* @__PURE__ */ r(
          "a",
          {
            className: "cedros-withdrawal-tx-link",
            href: S,
            target: "_blank",
            rel: "noreferrer",
            children: yr(B.txSignature)
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
function lu(e, t) {
  if (e === "sol") return "SOL";
  if (!t) return "SPL";
  const n = ru.find((o) => o.mint === t);
  return n ? n.symbol : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function du(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function uu(e) {
  const t = new Date(e), n = /* @__PURE__ */ new Date(), o = n.getTime() - t.getTime(), s = Math.floor(o / (1e3 * 60 * 60 * 24));
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
function ah({
  pageSize: e = 10,
  className: t = "",
  onTransactionClick: n,
  explorerUrl: o = "https://solscan.io"
}) {
  const { getHistory: s, error: a, clearError: c } = xo(), [i, l] = R([]), [u, f] = R(0), [h, p] = R(0), [b, g] = R(!1), [m, E] = R(null), y = T(async () => {
    g(!0);
    try {
      const B = await s(e, h);
      l(B.items), f(B.total), E(null);
    } catch (B) {
      E(B instanceof Error ? B.message : "Failed to load withdrawal history");
    } finally {
      g(!1);
    }
  }, [e, h, s]);
  F(() => {
    y();
  }, [y]);
  const C = Math.ceil(u / e), N = Math.floor(h / e) + 1, x = (B) => {
    const w = (B - 1) * e;
    p(Math.max(0, Math.min(w, Math.max(0, u - 1))));
  };
  return m || a ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-error ${t}`, children: [
    /* @__PURE__ */ r("p", { className: "cedros-withdrawal-error", children: m || a }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-withdrawal-retry",
        onClick: () => {
          c(), E(null), y();
        },
        children: "Retry"
      }
    )
  ] }) : b && i.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-loading ${t}`, children: [
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
          onClick: y,
          disabled: b,
          title: "Refresh",
          children: b ? "..." : "↻"
        }
      )
    ] }),
    i.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-tx-empty", children: /* @__PURE__ */ r("p", { className: "cedros-tx-empty-message", children: "No withdrawal history yet." }) }) : /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-tx-list", children: i.map((B) => {
        const w = lu(B.tokenType, B.tokenMint);
        return /* @__PURE__ */ d(
          "div",
          {
            className: "cedros-tx-item cedros-tx-item-negative",
            onClick: () => n?.(B),
            onKeyDown: (k) => {
              (k.key === "Enter" || k.key === " ") && (k.preventDefault(), n?.(B));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ r("div", { className: "cedros-tx-icon cedros-tx-icon-negative", children: "↑" }),
              /* @__PURE__ */ d("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ d("span", { className: "cedros-tx-type", children: [
                    w,
                    " Withdrawal"
                  ] }),
                  /* @__PURE__ */ d("span", { className: "cedros-tx-amount cedros-tx-amount-negative", children: [
                    B.amount,
                    " ",
                    w === "SOL" ? "lamports" : ""
                  ] })
                ] }),
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ d("span", { className: "cedros-tx-description", children: [
                    "To",
                    " ",
                    /* @__PURE__ */ r(
                      "a",
                      {
                        href: `${o}/account/${B.destination}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (k) => k.stopPropagation(),
                        children: du(B.destination)
                      }
                    ),
                    " · ",
                    /* @__PURE__ */ r(
                      "a",
                      {
                        href: `${o}/tx/${B.txSignature}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (k) => k.stopPropagation(),
                        children: "tx"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-date", children: uu(B.createdAt) })
                ] })
              ] })
            ]
          },
          B.id
        );
      }) }),
      C > 1 && /* @__PURE__ */ d("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => x(N - 1),
            disabled: N <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ d("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          N,
          " of ",
          C
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => x(N + 1),
            disabled: N >= C,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function ih({
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
      i ?? /* @__PURE__ */ r(qr, { defaultTab: c, onSuccess: a })
    ] }),
    s && /* @__PURE__ */ r("p", { className: "cedros-terms-footer", children: s })
  ] });
}
function ch({
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
      i ?? /* @__PURE__ */ r(qr, { defaultTab: c, onSuccess: a })
    ] }) })
  ] });
}
function lh() {
  const { config: e, _internal: t } = ne(), [n, o] = R({
    allowed: !1,
    reason: void 0,
    isLoading: !1,
    error: null
  }), s = j(
    () => new da(
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
function dh() {
  const { listAllWallets: e, createDerivedWallet: t, deleteDerivedWallet: n } = Ge(), [o, s] = R([]), [a, c] = R(!1), [i, l] = R(null), u = T(async () => {
    c(!0), l(null);
    try {
      const b = await e();
      s(b.wallets);
    } catch (b) {
      const g = b instanceof Error ? b.message : "Failed to list wallets";
      l(g);
    } finally {
      c(!1);
    }
  }, [e]), f = T(
    async (b) => {
      c(!0), l(null);
      try {
        const g = await t({ label: b });
        return await u(), g;
      } catch (g) {
        const m = g instanceof Error ? g.message : "Failed to create wallet";
        throw l(m), g;
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
      } catch (g) {
        const m = g instanceof Error ? g.message : "Failed to delete wallet";
        throw l(m), g;
      } finally {
        c(!1);
      }
    },
    [n, u]
  ), p = T(() => l(null), []);
  return {
    wallets: o,
    isLoading: a,
    createWallet: f,
    deleteWallet: h,
    refresh: u,
    error: i,
    clearError: p
  };
}
function uh() {
  const e = Oe(), [t, n] = R(!1), [o, s] = R(null), [a, c] = R(null), i = j(() => e ? new ce({
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
      const p = q(h, "Failed to fetch pending recovery");
      throw s(p.message), p;
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
      const p = q(h, "Failed to acknowledge recovery");
      throw s(p.message), p;
    } finally {
      n(!1);
    }
  }, [i]), f = T(() => s(null), []);
  return F(() => {
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
function hh(e = {}) {
  const { onExternalSign: t } = e, { solanaPubkey: n, hasExternalWallet: o, status: s, isUnlocked: a } = Lt(), {
    signTransaction: c,
    isSigning: i,
    error: l,
    clearError: u
  } = il(), f = j(() => o && t ? "external" : s === "enrolled_locked" || s === "enrolled_unlocked" ? "sss" : "none", [o, t, s]), h = f !== "none", p = s === "enrolled_locked" || s === "enrolled_unlocked";
  return {
    signTransaction: T(
      async (g, m) => {
        if (f === "external") {
          if (!t)
            throw new Error("External wallet signing callback not provided");
          return t(g);
        }
        if (f === "sss") {
          if (!m && !a)
            throw new Error(
              "Credential required for signing. Unlock wallet first or provide credential."
            );
          return m ? c(g, m) : c(g);
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
    hasSssWallet: p,
    isSssUnlocked: a,
    error: l,
    clearError: u
  };
}
function fh() {
  const { config: e, _internal: t } = ne(), [n, o] = R(null), [s, a] = R(!1), [c, i] = R(null), l = j(
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
      const p = h instanceof Error ? h : new Error(String(h));
      throw i(p), p;
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
const $r = Vo(null), Pr = {
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
function hu(e, t) {
  return So(e, t);
}
function So(e, t) {
  const n = { ...e };
  for (const o in t)
    if (Object.prototype.hasOwnProperty.call(t, o)) {
      const s = e[o], a = t[o];
      typeof s == "object" && s !== null && typeof a == "object" && a !== null ? n[o] = So(
        s,
        a
      ) : a !== void 0 && (n[o] = a);
    }
  return n;
}
function mh({
  children: e,
  locale: t = "en",
  translations: n
}) {
  const o = j(() => ({ t: n ? hu(Pr, n) : Pr, locale: t }), [n, t]);
  return /* @__PURE__ */ r($r.Provider, { value: o, children: e });
}
function ph() {
  return hn($r)?.t ?? Pr;
}
function gh() {
  return hn($r)?.locale ?? "en";
}
export {
  Xu as AccountSettings,
  ha as AdminDepositList,
  ua as AdminDepositStats,
  Uh as AdminIcons,
  ma as AdminPrivacyPeriodDeposits,
  Fh as AdminShell,
  ya as AdminUserList,
  ga as AdminWithdrawalHistory,
  pa as AdminWithdrawalQueue,
  fa as AdminWithdrawalStats,
  Bc as AppleLoginButton,
  va as AuthenticationSettings,
  Oh as CEDROS_LOGIN_SECTION_IDS,
  $u as CapabilityWarning,
  Yu as CedrosAdminDashboard,
  yh as CedrosLoginProvider,
  th as ChooseUsernamePrompt,
  eh as CompleteAccountPrompt,
  sh as CreditBalance,
  xa as CreditSystemSettings,
  rh as DepositFlow,
  $o as EmailLoginForm,
  Qo as EmailRegisterForm,
  Vh as EmailSettings,
  ka as EmbeddedWalletSettings,
  _c as ErrorBoundary,
  te as ErrorMessage,
  xc as ForgotPasswordForm,
  ih as FullPageLayout,
  Go as GoogleLoginButton,
  nh as History,
  mh as I18nProvider,
  ta as InviteForm,
  ra as InviteList,
  gd as LinkedAccounts,
  $ as LoadingSpinner,
  qu as LoginButton,
  qr as LoginForm,
  ju as LoginModal,
  ea as MemberList,
  Ju as MfaSetupPrompt,
  Vu as OrgSelector,
  Hu as OrgSwitcher,
  pn as OtpInput,
  Mc as PasskeyLoginButton,
  ll as PasskeyPrompt,
  we as PasswordInput,
  xa as PrivacyCashSettings,
  Aa as ProfileDropdown,
  md as ProfileTab,
  Xc as RecoveryPhraseDisplay,
  Jc as RecoveryPhraseInput,
  zu as ResetPasswordForm,
  ru as SUPPORTED_TOKENS,
  Ku as SecuritySettings,
  Sa as ServerSettings,
  Hc as SessionList,
  La as SettingsPageLayout,
  Tl as SetupWizard,
  Ko as SolanaLoginButton,
  ch as SplitPageLayout,
  Gu as SystemSettings,
  bo as TieredAmountSlider,
  po as TokenSelector,
  dd as TotpSettings,
  co as TotpSetup,
  xh as TotpVerify,
  Zu as UserProfileSettings,
  Nl as WalletAddressRow,
  al as WalletEnrollment,
  Qu as WalletManager,
  bl as WalletRecovery,
  El as WalletStatus,
  fl as WalletUnlock,
  Gh as WebhookSettings,
  oh as WithdrawalFlow,
  ah as WithdrawalHistory,
  Wh as cedrosLoginPlugin,
  Pr as defaultTranslations,
  Ah as getEmbeddedWalletInfo,
  zr as getTierForAmount,
  vh as isEmbeddedWalletAvailable,
  qh as loginPlugin,
  hu as mergeTranslations,
  Th as registerMobileWallet,
  $h as useAdminDeposits,
  jh as useAdminShell,
  _h as useAdminUsers,
  Lc as useAppleAuth,
  St as useAuth,
  Nh as useAuthState,
  Eh as useAuthUI,
  lh as useAuthorize,
  ne as useCedrosLogin,
  lo as useCredentials,
  Co as useCredits,
  Ld as useDeposit,
  Sh as useEmailAuth,
  Ph as useGoogleAuth,
  Ec as useInstantLink,
  Jo as useInvites,
  gh as useLocale,
  Xo as useMembers,
  la as useOrgs,
  cl as usePasskeySigning,
  Wr as usePasswordReset,
  uh as usePendingRecovery,
  fh as usePostLogin,
  Rt as useProfile,
  Yo as useServerFeatures,
  Ed as useSessions,
  nl as useSetPassword,
  ro as useSetup,
  Mh as useSolanaAuth,
  na as useSystemSettings,
  io as useTotp,
  Lh as useTotpVerify,
  hh as useTransactionSigning,
  ph as useTranslations,
  Sd as useUsername,
  Lt as useWallet,
  sl as useWalletEnrollment,
  Ge as useWalletMaterial,
  wl as useWalletRecovery,
  il as useWalletSigning,
  dh as useWallets,
  eo as useWebAuthn,
  xo as useWithdrawal,
  Bt as validatePassword
};
