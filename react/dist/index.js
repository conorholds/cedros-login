import { D as nt, v as Vo, j as Ho, w as wn, t as qe, k as bn, l as yn, m as Go, n as Qo, u as Ke, o as Yo, q as vn, s as An, x as Ee, y as Nn, z as kn, A as Fr, B as Cn, E as Ko, G as En, H as Pt, I as Zo } from "./CedrosLoginProvider-kqcbgszy.js";
import { C as Lm, F as Tm, a as Pm, e as Bm, f as Rm, h as Mm, J as Im, g as Um, b as Dm, c as Fm, K as Om, i as Wm, p as qm, r as zm, d as jm } from "./CedrosLoginProvider-kqcbgszy.js";
import { u as re, c as ze, A as oe, h as V } from "./useCedrosLogin-fUZvc4r9.js";
import { a as Vm, b as Hm } from "./useCedrosLogin-fUZvc4r9.js";
import { jsx as t, jsxs as i, Fragment as X } from "react/jsx-runtime";
import { useState as k, useRef as J, useMemo as q, useEffect as O, useCallback as B, Suspense as Xo, lazy as Jo, Component as ea, useId as ta, createContext as ra, useContext as xn } from "react";
import { u as Bt } from "./useAuth-CHaoHOol.js";
import { L as Y, E as ne } from "./ErrorMessage-59nRkszi.js";
import { a as _n, u as sa, s as na } from "./useServerFeatures-BYUkbO1Y.js";
import { L as oa, u as aa, a as ia } from "./ResetPasswordForm-BkevuoX2.js";
import { A as Qm, F as Ym, P as Km, R as Zm, b as Xm, c as Jm } from "./ResetPasswordForm-BkevuoX2.js";
import { d as ca } from "./mobileWalletAdapter-77bOfcmQ.js";
import { r as tf, u as rf } from "./mobileWalletAdapter-77bOfcmQ.js";
import { P as ye, O as Sn } from "./EmailRegisterForm-DuS9keFz.js";
import { E as nf, a as of, T as af, u as cf, c as lf } from "./EmailRegisterForm-DuS9keFz.js";
import { G as uf, u as hf } from "./GoogleLoginButton-93NKx5J_.js";
import { u as la, a as da, M as ua, I as ha, b as ma, P as fa, c as pa } from "./PermissionsSection-LPJDkhXx.js";
import { u as Ln, a as ot } from "./useSystemSettings-DsoAamlp.js";
import { C as ga, S as Or, a as wa, u as Tn, A as Pn } from "./AutosaveStatus-Bg31Q4YA.js";
import { A as ba, a as ya } from "./AdminDepositList-C7cl_YaB.js";
import { A as va, a as Aa, b as Na, c as ka } from "./AdminWithdrawalHistory-3j7C8Pe2.js";
import { u as Ca, A as Ea, a as xa, b as Wr } from "./useUsersStatsSummary-P3obfOhP.js";
import { c as ff } from "./useUsersStatsSummary-P3obfOhP.js";
import { S as Bn } from "./StatsBar-BX-hHtTq.js";
import { u as _a, O as Sa } from "./useOrgs-CY8R9U79.js";
import { A as La } from "./AuthenticationSettings-DpqnGdAJ.js";
import { E as Ta } from "./EmbeddedWalletSettings-DSZOTiFy.js";
import { A as Pa, S as Ba, P as Ra } from "./EmailSettings-BvwVJBm_.js";
import { E as gf } from "./EmailSettings-BvwVJBm_.js";
import { C as Ma } from "./CreditSystemSettings-BXYupgVF.js";
import { S as Ia } from "./ServerSettings-CmV7aO4g.js";
import { S as Rt } from "./WebhookSettings-CCuzKgaO.js";
import { W as bf } from "./WebhookSettings-CCuzKgaO.js";
import { u as vf } from "./useAdminDeposits-yA9wshTw.js";
import { v as qr } from "./validation-B8kMV3BL.js";
async function Rn(e, r, s = nt) {
  return Vo(s), Ho(e, r, s);
}
function Mn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Ua(e) {
  if (Object.prototype.hasOwnProperty.call(e, "__esModule")) return e;
  var r = e.default;
  if (typeof r == "function") {
    var s = function o() {
      var n = !1;
      try {
        n = this instanceof o;
      } catch {
      }
      return n ? Reflect.construct(r, arguments, this.constructor) : r.apply(this, arguments);
    };
    s.prototype = r.prototype;
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
var yt = { exports: {} };
const Da = globalThis.crypto, Fa = globalThis.crypto, Oa = globalThis.crypto.subtle, Wa = globalThis.crypto.getRandomValues.bind(globalThis.crypto), qa = globalThis.crypto.randomUUID.bind(globalThis.crypto), za = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Da,
  getRandomValues: Wa,
  randomUUID: qa,
  subtle: Oa,
  webcrypto: Fa
}, Symbol.toStringTag, { value: "Module" })), ja = /* @__PURE__ */ Ua(za);
var $a = yt.exports, cs;
function Va() {
  return cs || (cs = 1, (function(e, r) {
    (function(s, o) {
      e.exports = o(ja);
    })($a, function(s) {
      var o, n, a, c, d;
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
        }, n = {}, a = new Array(1024).join("0"), c = !0, d = [
          "nodeCryptoRandomBytes",
          "browserCryptoGetRandomValues",
          "testRandom"
        ];
      }
      function h() {
        return !!(n && n.rng && typeof n.rng == "function");
      }
      function m(f, v) {
        var y;
        if (v === 0 || v === 1)
          return f;
        if (v && v > 1024)
          throw new Error(
            "Padding must be multiples of no larger than 1024 bits."
          );
        return v = v || n.bits, f && (y = f.length % v), y ? (a + f).slice(
          -(v - y + f.length)
        ) : f;
      }
      function u(f) {
        var v = "", y, A;
        for (A = f.length - 1; A >= 0; A--) {
          if (y = parseInt(f[A], 16), isNaN(y))
            throw new Error("Invalid hex character.");
          v = m(y.toString(2), 4) + v;
        }
        return v;
      }
      function p(f) {
        var v = "", y, A;
        for (f = m(f, 4), A = f.length; A >= 4; A -= 4) {
          if (y = parseInt(f.slice(A - 4, A), 2), isNaN(y))
            throw new Error("Invalid binary character.");
          v = y.toString(16) + v;
        }
        return v;
      }
      function g() {
        return !!(s && typeof s == "object" && (typeof s.getRandomValues == "function" || typeof s.getRandomValues == "object") && (typeof Uint32Array == "function" || typeof Uint32Array == "object"));
      }
      function w() {
        return typeof s == "object" && typeof s.randomBytes == "function";
      }
      function b(f) {
        function v(S, R, P, M) {
          var I = 0, U, W = "", z;
          for (R && (U = R.length - 1); I < U || W.length < S; )
            z = Math.abs(parseInt(R[I], P)), W = W + m(z.toString(2), M), I++;
          return W = W.substr(-S), (W.match(/0/g) || []).length === W.length ? null : W;
        }
        function y(S) {
          var R, P, M, I, U = null;
          for (M = 16, I = 4, P = Math.ceil(S / 8); U === null; )
            R = s.randomBytes(P), U = v(S, R.toString("hex"), M, I);
          return U;
        }
        function A(S) {
          var R, P, M, I = null;
          for (P = 10, M = 32, R = Math.ceil(S / 32); I === null; )
            I = v(
              S,
              s.getRandomValues(new Uint32Array(R)),
              P,
              M
            );
          return I;
        }
        function L(S) {
          var R, P, M, I, U, W = null;
          I = 10, U = 32, P = Math.ceil(S / 32), M = 123456789, R = new Uint32Array(P);
          for (var z = 0; z < R.length; z++)
            R[z] = M;
          for (; W === null; )
            W = v(S, R, I, U);
          return W;
        }
        if (f && f === "testRandom")
          return n.typeCSPRNG = f, L;
        if (f && f === "nodeCryptoRandomBytes")
          return n.typeCSPRNG = f, y;
        if (f && f === "browserCryptoGetRandomValues")
          return n.typeCSPRNG = f, A;
        if (w())
          return n.typeCSPRNG = "nodeCryptoRandomBytes", y;
        if (g())
          return n.typeCSPRNG = "browserCryptoGetRandomValues", A;
      }
      function x(f, v) {
        var y = [], A;
        for (v && (f = m(f, v)), A = f.length; A > n.bits; A -= n.bits)
          y.push(parseInt(f.slice(A - n.bits, A), 2));
        return y.push(parseInt(f.slice(0, A), 2)), y;
      }
      function E(f, v) {
        var y = n.logs[f], A = 0, L;
        for (L = v.length - 1; L >= 0; L--)
          A !== 0 ? A = n.exps[(y + n.logs[A]) % n.maxShares] ^ v[L] : A = v[L];
        return A;
      }
      function N(f, v, y) {
        var A = 0, L, S, R, P;
        for (R = 0, L = v.length; R < L; R++)
          if (y[R]) {
            for (S = n.logs[y[R]], P = 0; P < L; P++)
              if (R !== P) {
                if (f === v[P]) {
                  S = -1;
                  break;
                }
                S = (S + n.logs[f ^ v[P]] - n.logs[v[R] ^ v[P]] + n.maxShares) % n.maxShares;
              }
            A = S === -1 ? A : A ^ n.exps[S];
          }
        return A;
      }
      function C(f, v, y) {
        var A = [], L = [f], S, R;
        for (S = 1; S < y; S++)
          L[S] = parseInt(n.rng(n.bits), 2);
        for (S = 1, R = v + 1; S < R; S++)
          A[S - 1] = {
            x: S,
            y: E(S, L)
          };
        return A;
      }
      function _(f, v, y) {
        var A, L, S, R, P;
        if (v = parseInt(v, n.radix), f = parseInt(f, 10) || n.bits, A = f.toString(36).toUpperCase(), S = Math.pow(2, f) - 1, R = S.toString(n.radix).length, L = m(v.toString(n.radix), R), typeof v != "number" || v % 1 !== 0 || v < 1 || v > S)
          throw new Error(
            "Share id must be an integer between 1 and " + S + ", inclusive."
          );
        return P = A + L + y, P;
      }
      var T = {
        init: function(f, v) {
          var y = [], A = [], L = 1, S, R;
          if (l(), f && (typeof f != "number" || f % 1 !== 0 || f < o.minBits || f > o.maxBits))
            throw new Error(
              "Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (v && d.indexOf(v) === -1)
            throw new Error("Invalid RNG type argument : '" + v + "'");
          for (n.radix = o.radix, n.bits = f || o.bits, n.size = Math.pow(2, n.bits), n.maxShares = n.size - 1, S = o.primitivePolynomials[n.bits], R = 0; R < n.size; R++)
            A[R] = L, y[L] = R, L = L << 1, L >= n.size && (L = L ^ S, L = L & n.maxShares);
          if (n.logs = y, n.exps = A, v && this.setRNG(v), h() || this.setRNG(), !h() || !n.bits || !n.size || !n.maxShares || !n.logs || !n.exps || n.logs.length !== n.size || n.exps.length !== n.size)
            throw new Error("Initialization failed.");
        },
        // Evaluates the Lagrange interpolation polynomial at x=`at` for
        // individual config.bits-length segments of each share in the `shares`
        // Array. Each share is expressed in base `inputRadix`. The output
        // is expressed in base `outputRadix'.
        combine: function(f, v) {
          var y, A, L, S, R = "", P, M, I, U = [], W = [];
          for (v = v || 0, y = 0, L = f.length; y < L; y++) {
            if (M = this.extractShareComponents(f[y]), P === void 0)
              P = M.bits;
            else if (M.bits !== P)
              throw new Error(
                "Mismatched shares: Different bit settings."
              );
            if (n.bits !== P && this.init(P), U.indexOf(M.id) === -1)
              for (U.push(M.id), I = x(u(M.data)), A = 0, S = I.length; A < S; A++)
                W[A] = W[A] || [], W[A][U.length - 1] = I[A];
          }
          for (y = 0, L = W.length; y < L; y++)
            R = m(N(v, U, W[y]).toString(2)) + R;
          return p(
            v >= 1 ? R : R.slice(R.indexOf("1") + 1)
          );
        },
        getConfig: function() {
          var f = {};
          return f.radix = n.radix, f.bits = n.bits, f.maxShares = n.maxShares, f.hasCSPRNG = h(), f.typeCSPRNG = n.typeCSPRNG, f;
        },
        // Given a public share, extract the bits (Integer), share ID (Integer), and share data (Hex)
        // and return an Object containing those components.
        extractShareComponents: function(f) {
          var v, y, A, L, S = {}, R, P;
          if (v = parseInt(f.substr(0, 1), 36), v && (typeof v != "number" || v % 1 !== 0 || v < o.minBits || v > o.maxBits))
            throw new Error(
              "Invalid share : Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (L = Math.pow(2, v) - 1, A = (Math.pow(2, v) - 1).toString(n.radix).length, R = "^([a-kA-K3-9]{1})([a-fA-F0-9]{" + A + "})([a-fA-F0-9]+)$", P = new RegExp(R).exec(f), P && (y = parseInt(P[2], n.radix)), typeof y != "number" || y % 1 !== 0 || y < 1 || y > L)
            throw new Error(
              "Invalid share : Share id must be an integer between 1 and " + n.maxShares + ", inclusive."
            );
          if (P && P[3])
            return S.bits = v, S.id = y, S.data = P[3], S;
          throw new Error("The share data provided is invalid : " + f);
        },
        // Set the PRNG to use. If no RNG function is supplied, pick a default using getRNG()
        setRNG: function(f) {
          var v = "Random number generator is invalid ", y = " Supply an CSPRNG of the form function(bits){} that returns a string containing 'bits' number of random 1's and 0's.";
          if (f && typeof f == "string" && d.indexOf(f) === -1)
            throw new Error("Invalid RNG type argument : '" + f + "'");
          if (f || (f = b()), f && typeof f == "string" && (f = b(f)), c) {
            if (f && typeof f != "function")
              throw new Error(v + "(Not a function)." + y);
            if (f && typeof f(n.bits) != "string")
              throw new Error(
                v + "(Output is not a string)." + y
              );
            if (f && !parseInt(f(n.bits), 2))
              throw new Error(
                v + "(Binary string output not parseable to an Integer)." + y
              );
            if (f && f(n.bits).length > n.bits)
              throw new Error(
                v + "(Output length is greater than config.bits)." + y
              );
            if (f && f(n.bits).length < n.bits)
              throw new Error(
                v + "(Output length is less than config.bits)." + y
              );
          }
          return n.rng = f, !0;
        },
        // Converts a given UTF16 character string to the HEX representation.
        // Each character of the input string is represented by
        // `bytesPerChar` bytes in the output string which defaults to 2.
        str2hex: function(f, v) {
          var y, A, L = "", S, R, P, M;
          if (typeof f != "string")
            throw new Error("Input must be a character string.");
          if (v || (v = o.bytesPerChar), typeof v != "number" || v < 1 || v > o.maxBytesPerChar || v % 1 !== 0)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (y = 2 * v, A = Math.pow(16, y) - 1, P = 0, M = f.length; P < M; P++) {
            if (R = f[P].charCodeAt(), isNaN(R))
              throw new Error("Invalid character: " + f[P]);
            if (R > A)
              throw S = Math.ceil(Math.log(R + 1) / Math.log(256)), new Error(
                "Invalid character code (" + R + "). Maximum allowable is 256^bytes-1 (" + A + "). To convert this character, use at least " + S + " bytes."
              );
            L = m(R.toString(16), y) + L;
          }
          return L;
        },
        // Converts a given HEX number string to a UTF16 character string.
        hex2str: function(f, v) {
          var y, A = "", L, S;
          if (typeof f != "string")
            throw new Error("Input must be a hexadecimal string.");
          if (v = v || o.bytesPerChar, typeof v != "number" || v % 1 !== 0 || v < 1 || v > o.maxBytesPerChar)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (y = 2 * v, f = m(f, y), L = 0, S = f.length; L < S; L += y)
            A = String.fromCharCode(
              parseInt(f.slice(L, L + y), 16)
            ) + A;
          return A;
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
        share: function(f, v, y, A) {
          var L, S, R = new Array(v), P = new Array(v), M, I, U;
          if (A = A || 128, typeof f != "string")
            throw new Error("Secret must be a string.");
          if (typeof v != "number" || v % 1 !== 0 || v < 2)
            throw new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive."
            );
          if (v > n.maxShares)
            throw L = Math.ceil(Math.log(v + 1) / Math.LN2), new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive. To create " + v + " shares, use at least " + L + " bits."
            );
          if (typeof y != "number" || y % 1 !== 0 || y < 2)
            throw new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive."
            );
          if (y > n.maxShares)
            throw L = Math.ceil(Math.log(y + 1) / Math.LN2), new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive.  To use a threshold of " + y + ", use at least " + L + " bits."
            );
          if (y > v)
            throw new Error(
              "Threshold number of shares was " + y + " but must be less than or equal to the " + v + " shares specified as the total to generate."
            );
          if (typeof A != "number" || A % 1 !== 0 || A < 0 || A > 1024)
            throw new Error(
              "Zero-pad length must be an integer between 0 and 1024 inclusive."
            );
          for (f = "1" + u(f), f = x(f, A), M = 0, U = f.length; M < U; M++)
            for (S = C(f[M], v, y), I = 0; I < v; I++)
              R[I] = R[I] || S[I].x.toString(n.radix), P[I] = m(S[I].y.toString(2)) + (P[I] || "");
          for (M = 0; M < v; M++)
            R[M] = _(
              n.bits,
              R[M],
              p(P[M])
            );
          return R;
        },
        // Generate a new share with id `id` (a number between 1 and 2^bits-1)
        // `id` can be a Number or a String in the default radix (16)
        newShare: function(f, v) {
          var y, A;
          if (f && typeof f == "string" && (f = parseInt(f, n.radix)), A = f.toString(n.radix), f && A && v && v[0])
            return y = this.extractShareComponents(v[0]), _(
              y.bits,
              A,
              this.combine(v, f)
            );
          throw new Error(
            "Invalid 'id' or 'shares' Array argument to newShare()."
          );
        },
        /* test-code */
        // export private functions so they can be unit tested directly.
        _reset: l,
        _padLeft: m,
        _hex2bin: u,
        _bin2hex: p,
        _hasCryptoGetRandomValues: g,
        _hasCryptoRandomBytes: w,
        _getRNG: b,
        _isSetRNG: h,
        _splitNumStringToIntArray: x,
        _horner: E,
        _lagrange: N,
        _getShares: C,
        _constructPublicShareString: _
        /* end-test-code */
      };
      return T.init(), T;
    });
  })(yt)), yt.exports;
}
var Ha = Va();
const In = /* @__PURE__ */ Mn(Ha);
function Un(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function zr(e, r = "") {
  if (!Number.isSafeInteger(e) || e < 0) {
    const s = r && `"${r}" `;
    throw new Error(`${s}expected integer >= 0, got ${e}`);
  }
}
function de(e, r, s = "") {
  const o = Un(e), n = e?.length, a = r !== void 0;
  if (!o || a && n !== r) {
    const c = s && `"${s}" `, d = a ? ` of length ${r}` : "", l = o ? `length=${n}` : `type=${typeof e}`;
    throw new Error(c + "expected Uint8Array" + d + ", got " + l);
  }
  return e;
}
function ls(e, r = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (r && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function Ga(e, r) {
  de(e, void 0, "digestInto() output");
  const s = r.outputLen;
  if (e.length < s)
    throw new Error('"digestInto() output" expected to be of length >=' + s);
}
function _r(...e) {
  for (let r = 0; r < e.length; r++)
    e[r].fill(0);
}
function qt(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
const Dn = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", Qa = /* @__PURE__ */ Array.from({ length: 256 }, (e, r) => r.toString(16).padStart(2, "0"));
function jr(e) {
  if (de(e), Dn)
    return e.toHex();
  let r = "";
  for (let s = 0; s < e.length; s++)
    r += Qa[e[s]];
  return r;
}
const ke = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function ds(e) {
  if (e >= ke._0 && e <= ke._9)
    return e - ke._0;
  if (e >= ke.A && e <= ke.F)
    return e - (ke.A - 10);
  if (e >= ke.a && e <= ke.f)
    return e - (ke.a - 10);
}
function Fn(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  if (Dn)
    return Uint8Array.fromHex(e);
  const r = e.length, s = r / 2;
  if (r % 2)
    throw new Error("hex string expected, got unpadded hex of length " + r);
  const o = new Uint8Array(s);
  for (let n = 0, a = 0; n < s; n++, a += 2) {
    const c = ds(e.charCodeAt(a)), d = ds(e.charCodeAt(a + 1));
    if (c === void 0 || d === void 0) {
      const l = e[a] + e[a + 1];
      throw new Error('hex string expected, got non-hex character "' + l + '" at index ' + a);
    }
    o[n] = c * 16 + d;
  }
  return o;
}
function us(...e) {
  let r = 0;
  for (let o = 0; o < e.length; o++) {
    const n = e[o];
    de(n), r += n.length;
  }
  const s = new Uint8Array(r);
  for (let o = 0, n = 0; o < e.length; o++) {
    const a = e[o];
    s.set(a, n), n += a.length;
  }
  return s;
}
function Ya(e, r = {}) {
  const s = (n, a) => e(a).update(n).digest(), o = e(void 0);
  return s.outputLen = o.outputLen, s.blockLen = o.blockLen, s.create = (n) => e(n), Object.assign(s, r), Object.freeze(s);
}
function Ka(e = 32) {
  const r = typeof globalThis == "object" ? globalThis.crypto : null;
  if (typeof r?.getRandomValues != "function")
    throw new Error("crypto.getRandomValues must be defined");
  return r.getRandomValues(new Uint8Array(e));
}
const Za = (e) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, e])
});
let Xa = class {
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
  constructor(r, s, o, n) {
    this.blockLen = r, this.outputLen = s, this.padOffset = o, this.isLE = n, this.buffer = new Uint8Array(r), this.view = qt(this.buffer);
  }
  update(r) {
    ls(this), de(r);
    const { view: s, buffer: o, blockLen: n } = this, a = r.length;
    for (let c = 0; c < a; ) {
      const d = Math.min(n - this.pos, a - c);
      if (d === n) {
        const l = qt(r);
        for (; n <= a - c; c += n)
          this.process(l, c);
        continue;
      }
      o.set(r.subarray(c, c + d), this.pos), this.pos += d, c += d, this.pos === n && (this.process(s, 0), this.pos = 0);
    }
    return this.length += r.length, this.roundClean(), this;
  }
  digestInto(r) {
    ls(this), Ga(r, this), this.finished = !0;
    const { buffer: s, view: o, blockLen: n, isLE: a } = this;
    let { pos: c } = this;
    s[c++] = 128, _r(this.buffer.subarray(c)), this.padOffset > n - c && (this.process(o, 0), c = 0);
    for (let u = c; u < n; u++)
      s[u] = 0;
    o.setBigUint64(n - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const d = qt(r), l = this.outputLen;
    if (l % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const h = l / 4, m = this.get();
    if (h > m.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let u = 0; u < h; u++)
      d.setUint32(4 * u, m[u], a);
  }
  digest() {
    const { buffer: r, outputLen: s } = this;
    this.digestInto(r);
    const o = r.slice(0, s);
    return this.destroy(), o;
  }
  _cloneInto(r) {
    r ||= new this.constructor(), r.set(...this.get());
    const { blockLen: s, buffer: o, length: n, finished: a, destroyed: c, pos: d } = this;
    return r.destroyed = c, r.finished = a, r.length = n, r.pos = d, n % s && r.buffer.set(o), r;
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
]), ct = /* @__PURE__ */ BigInt(2 ** 32 - 1), hs = /* @__PURE__ */ BigInt(32);
function Ja(e, r = !1) {
  return r ? { h: Number(e & ct), l: Number(e >> hs & ct) } : { h: Number(e >> hs & ct) | 0, l: Number(e & ct) | 0 };
}
function ei(e, r = !1) {
  const s = e.length;
  let o = new Uint32Array(s), n = new Uint32Array(s);
  for (let a = 0; a < s; a++) {
    const { h: c, l: d } = Ja(e[a], r);
    [o[a], n[a]] = [c, d];
  }
  return [o, n];
}
const ms = (e, r, s) => e >>> s, fs = (e, r, s) => e << 32 - s | r >>> s, He = (e, r, s) => e >>> s | r << 32 - s, Ge = (e, r, s) => e << 32 - s | r >>> s, lt = (e, r, s) => e << 64 - s | r >>> s - 32, dt = (e, r, s) => e >>> s - 32 | r << 64 - s;
function Ce(e, r, s, o) {
  const n = (r >>> 0) + (o >>> 0);
  return { h: e + s + (n / 2 ** 32 | 0) | 0, l: n | 0 };
}
const ti = (e, r, s) => (e >>> 0) + (r >>> 0) + (s >>> 0), ri = (e, r, s, o) => r + s + o + (e / 2 ** 32 | 0) | 0, si = (e, r, s, o) => (e >>> 0) + (r >>> 0) + (s >>> 0) + (o >>> 0), ni = (e, r, s, o, n) => r + s + o + n + (e / 2 ** 32 | 0) | 0, oi = (e, r, s, o, n) => (e >>> 0) + (r >>> 0) + (s >>> 0) + (o >>> 0) + (n >>> 0), ai = (e, r, s, o, n, a) => r + s + o + n + a + (e / 2 ** 32 | 0) | 0, On = ei([
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
].map((e) => BigInt(e))), ii = On[0], ci = On[1], Te = /* @__PURE__ */ new Uint32Array(80), Pe = /* @__PURE__ */ new Uint32Array(80);
class li extends Xa {
  constructor(r) {
    super(128, r, 16, !1);
  }
  // prettier-ignore
  get() {
    const { Ah: r, Al: s, Bh: o, Bl: n, Ch: a, Cl: c, Dh: d, Dl: l, Eh: h, El: m, Fh: u, Fl: p, Gh: g, Gl: w, Hh: b, Hl: x } = this;
    return [r, s, o, n, a, c, d, l, h, m, u, p, g, w, b, x];
  }
  // prettier-ignore
  set(r, s, o, n, a, c, d, l, h, m, u, p, g, w, b, x) {
    this.Ah = r | 0, this.Al = s | 0, this.Bh = o | 0, this.Bl = n | 0, this.Ch = a | 0, this.Cl = c | 0, this.Dh = d | 0, this.Dl = l | 0, this.Eh = h | 0, this.El = m | 0, this.Fh = u | 0, this.Fl = p | 0, this.Gh = g | 0, this.Gl = w | 0, this.Hh = b | 0, this.Hl = x | 0;
  }
  process(r, s) {
    for (let C = 0; C < 16; C++, s += 4)
      Te[C] = r.getUint32(s), Pe[C] = r.getUint32(s += 4);
    for (let C = 16; C < 80; C++) {
      const _ = Te[C - 15] | 0, T = Pe[C - 15] | 0, f = He(_, T, 1) ^ He(_, T, 8) ^ ms(_, T, 7), v = Ge(_, T, 1) ^ Ge(_, T, 8) ^ fs(_, T, 7), y = Te[C - 2] | 0, A = Pe[C - 2] | 0, L = He(y, A, 19) ^ lt(y, A, 61) ^ ms(y, A, 6), S = Ge(y, A, 19) ^ dt(y, A, 61) ^ fs(y, A, 6), R = si(v, S, Pe[C - 7], Pe[C - 16]), P = ni(R, f, L, Te[C - 7], Te[C - 16]);
      Te[C] = P | 0, Pe[C] = R | 0;
    }
    let { Ah: o, Al: n, Bh: a, Bl: c, Ch: d, Cl: l, Dh: h, Dl: m, Eh: u, El: p, Fh: g, Fl: w, Gh: b, Gl: x, Hh: E, Hl: N } = this;
    for (let C = 0; C < 80; C++) {
      const _ = He(u, p, 14) ^ He(u, p, 18) ^ lt(u, p, 41), T = Ge(u, p, 14) ^ Ge(u, p, 18) ^ dt(u, p, 41), f = u & g ^ ~u & b, v = p & w ^ ~p & x, y = oi(N, T, v, ci[C], Pe[C]), A = ai(y, E, _, f, ii[C], Te[C]), L = y | 0, S = He(o, n, 28) ^ lt(o, n, 34) ^ lt(o, n, 39), R = Ge(o, n, 28) ^ dt(o, n, 34) ^ dt(o, n, 39), P = o & a ^ o & d ^ a & d, M = n & c ^ n & l ^ c & l;
      E = b | 0, N = x | 0, b = g | 0, x = w | 0, g = u | 0, w = p | 0, { h: u, l: p } = Ce(h | 0, m | 0, A | 0, L | 0), h = d | 0, m = l | 0, d = a | 0, l = c | 0, a = o | 0, c = n | 0;
      const I = ti(L, R, M);
      o = ri(I, A, S, P), n = I | 0;
    }
    ({ h: o, l: n } = Ce(this.Ah | 0, this.Al | 0, o | 0, n | 0)), { h: a, l: c } = Ce(this.Bh | 0, this.Bl | 0, a | 0, c | 0), { h: d, l } = Ce(this.Ch | 0, this.Cl | 0, d | 0, l | 0), { h, l: m } = Ce(this.Dh | 0, this.Dl | 0, h | 0, m | 0), { h: u, l: p } = Ce(this.Eh | 0, this.El | 0, u | 0, p | 0), { h: g, l: w } = Ce(this.Fh | 0, this.Fl | 0, g | 0, w | 0), { h: b, l: x } = Ce(this.Gh | 0, this.Gl | 0, b | 0, x | 0), { h: E, l: N } = Ce(this.Hh | 0, this.Hl | 0, E | 0, N | 0), this.set(o, n, a, c, d, l, h, m, u, p, g, w, b, x, E, N);
  }
  roundClean() {
    _r(Te, Pe);
  }
  destroy() {
    _r(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class di extends li {
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
const ui = /* @__PURE__ */ Ya(
  () => new di(),
  /* @__PURE__ */ Za(3)
);
const Wn = /* @__PURE__ */ BigInt(0), ps = /* @__PURE__ */ BigInt(1);
function Sr(e, r = "") {
  if (typeof e != "boolean") {
    const s = r && `"${r}" `;
    throw new Error(s + "expected boolean, got type=" + typeof e);
  }
  return e;
}
function hi(e) {
  if (typeof e == "bigint") {
    if (!vt(e))
      throw new Error("positive bigint expected, got " + e);
  } else
    zr(e);
  return e;
}
function qn(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  return e === "" ? Wn : BigInt("0x" + e);
}
function mi(e) {
  return qn(jr(e));
}
function Nt(e) {
  return qn(jr(Lr(de(e)).reverse()));
}
function zn(e, r) {
  zr(r), e = hi(e);
  const s = Fn(e.toString(16).padStart(r * 2, "0"));
  if (s.length !== r)
    throw new Error("number too large");
  return s;
}
function fi(e, r) {
  return zn(e, r).reverse();
}
function Lr(e) {
  return Uint8Array.from(e);
}
const vt = (e) => typeof e == "bigint" && Wn <= e;
function pi(e, r, s) {
  return vt(e) && vt(r) && vt(s) && r <= e && e < s;
}
function gs(e, r, s, o) {
  if (!pi(r, s, o))
    throw new Error("expected valid " + e + ": " + s + " <= n < " + o + ", got " + r);
}
const gi = (e) => (ps << BigInt(e)) - ps;
function $r(e, r = {}, s = {}) {
  if (!e || typeof e != "object")
    throw new Error("expected valid options object");
  function o(a, c, d) {
    const l = e[a];
    if (d && l === void 0)
      return;
    const h = typeof l;
    if (h !== c || l === null)
      throw new Error(`param "${a}" is invalid: expected ${c}, got ${h}`);
  }
  const n = (a, c) => Object.entries(a).forEach(([d, l]) => o(d, l, c));
  n(r, !1), n(s, !0);
}
function ws(e) {
  const r = /* @__PURE__ */ new WeakMap();
  return (s, ...o) => {
    const n = r.get(s);
    if (n !== void 0)
      return n;
    const a = e(s, ...o);
    return r.set(s, a), a;
  };
}
const ge = /* @__PURE__ */ BigInt(0), pe = /* @__PURE__ */ BigInt(1), We = /* @__PURE__ */ BigInt(2), jn = /* @__PURE__ */ BigInt(3), $n = /* @__PURE__ */ BigInt(4), Vn = /* @__PURE__ */ BigInt(5), wi = /* @__PURE__ */ BigInt(7), Hn = /* @__PURE__ */ BigInt(8), bi = /* @__PURE__ */ BigInt(9), Gn = /* @__PURE__ */ BigInt(16);
function ae(e, r) {
  const s = e % r;
  return s >= ge ? s : r + s;
}
function ve(e, r, s) {
  let o = e;
  for (; r-- > ge; )
    o *= o, o %= s;
  return o;
}
function bs(e, r) {
  if (e === ge)
    throw new Error("invert: expected non-zero number");
  if (r <= ge)
    throw new Error("invert: expected positive modulus, got " + r);
  let s = ae(e, r), o = r, n = ge, a = pe;
  for (; s !== ge; ) {
    const d = o / s, l = o % s, h = n - a * d;
    o = s, s = l, n = a, a = h;
  }
  if (o !== pe)
    throw new Error("invert: does not exist");
  return ae(n, r);
}
function Vr(e, r, s) {
  if (!e.eql(e.sqr(r), s))
    throw new Error("Cannot find square root");
}
function Qn(e, r) {
  const s = (e.ORDER + pe) / $n, o = e.pow(r, s);
  return Vr(e, o, r), o;
}
function yi(e, r) {
  const s = (e.ORDER - Vn) / Hn, o = e.mul(r, We), n = e.pow(o, s), a = e.mul(r, n), c = e.mul(e.mul(a, We), n), d = e.mul(a, e.sub(c, e.ONE));
  return Vr(e, d, r), d;
}
function vi(e) {
  const r = Hr(e), s = Yn(e), o = s(r, r.neg(r.ONE)), n = s(r, o), a = s(r, r.neg(o)), c = (e + wi) / Gn;
  return (d, l) => {
    let h = d.pow(l, c), m = d.mul(h, o);
    const u = d.mul(h, n), p = d.mul(h, a), g = d.eql(d.sqr(m), l), w = d.eql(d.sqr(u), l);
    h = d.cmov(h, m, g), m = d.cmov(p, u, w);
    const b = d.eql(d.sqr(m), l), x = d.cmov(h, m, b);
    return Vr(d, x, l), x;
  };
}
function Yn(e) {
  if (e < jn)
    throw new Error("sqrt is not defined for small field");
  let r = e - pe, s = 0;
  for (; r % We === ge; )
    r /= We, s++;
  let o = We;
  const n = Hr(e);
  for (; ys(n, o) === 1; )
    if (o++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (s === 1)
    return Qn;
  let a = n.pow(o, r);
  const c = (r + pe) / We;
  return function(l, h) {
    if (l.is0(h))
      return h;
    if (ys(l, h) !== 1)
      throw new Error("Cannot find square root");
    let m = s, u = l.mul(l.ONE, a), p = l.pow(h, r), g = l.pow(h, c);
    for (; !l.eql(p, l.ONE); ) {
      if (l.is0(p))
        return l.ZERO;
      let w = 1, b = l.sqr(p);
      for (; !l.eql(b, l.ONE); )
        if (w++, b = l.sqr(b), w === m)
          throw new Error("Cannot find square root");
      const x = pe << BigInt(m - w - 1), E = l.pow(u, x);
      m = w, u = l.sqr(E), p = l.mul(p, u), g = l.mul(g, E);
    }
    return g;
  };
}
function Ai(e) {
  return e % $n === jn ? Qn : e % Hn === Vn ? yi : e % Gn === bi ? vi(e) : Yn(e);
}
const Ni = (e, r) => (ae(e, r) & pe) === pe, ki = [
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
function Ci(e) {
  const r = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  }, s = ki.reduce((o, n) => (o[n] = "function", o), r);
  return $r(e, s), e;
}
function Ei(e, r, s) {
  if (s < ge)
    throw new Error("invalid exponent, negatives unsupported");
  if (s === ge)
    return e.ONE;
  if (s === pe)
    return r;
  let o = e.ONE, n = r;
  for (; s > ge; )
    s & pe && (o = e.mul(o, n)), n = e.sqr(n), s >>= pe;
  return o;
}
function Kn(e, r, s = !1) {
  const o = new Array(r.length).fill(s ? e.ZERO : void 0), n = r.reduce((c, d, l) => e.is0(d) ? c : (o[l] = c, e.mul(c, d)), e.ONE), a = e.inv(n);
  return r.reduceRight((c, d, l) => e.is0(d) ? c : (o[l] = e.mul(c, o[l]), e.mul(c, d)), a), o;
}
function ys(e, r) {
  const s = (e.ORDER - pe) / We, o = e.pow(r, s), n = e.eql(o, e.ONE), a = e.eql(o, e.ZERO), c = e.eql(o, e.neg(e.ONE));
  if (!n && !a && !c)
    throw new Error("invalid Legendre symbol result");
  return n ? 1 : a ? 0 : -1;
}
function xi(e, r) {
  r !== void 0 && zr(r);
  const s = r !== void 0 ? r : e.toString(2).length, o = Math.ceil(s / 8);
  return { nBitLength: s, nByteLength: o };
}
class _i {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = ge;
  ONE = pe;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(r, s = {}) {
    if (r <= ge)
      throw new Error("invalid field: expected ORDER > 0, got " + r);
    let o;
    this.isLE = !1, s != null && typeof s == "object" && (typeof s.BITS == "number" && (o = s.BITS), typeof s.sqrt == "function" && (this.sqrt = s.sqrt), typeof s.isLE == "boolean" && (this.isLE = s.isLE), s.allowedLengths && (this._lengths = s.allowedLengths?.slice()), typeof s.modFromBytes == "boolean" && (this._mod = s.modFromBytes));
    const { nBitLength: n, nByteLength: a } = xi(r, o);
    if (a > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = r, this.BITS = n, this.BYTES = a, this._sqrt = void 0, Object.preventExtensions(this);
  }
  create(r) {
    return ae(r, this.ORDER);
  }
  isValid(r) {
    if (typeof r != "bigint")
      throw new Error("invalid field element: expected bigint, got " + typeof r);
    return ge <= r && r < this.ORDER;
  }
  is0(r) {
    return r === ge;
  }
  // is valid and invertible
  isValidNot0(r) {
    return !this.is0(r) && this.isValid(r);
  }
  isOdd(r) {
    return (r & pe) === pe;
  }
  neg(r) {
    return ae(-r, this.ORDER);
  }
  eql(r, s) {
    return r === s;
  }
  sqr(r) {
    return ae(r * r, this.ORDER);
  }
  add(r, s) {
    return ae(r + s, this.ORDER);
  }
  sub(r, s) {
    return ae(r - s, this.ORDER);
  }
  mul(r, s) {
    return ae(r * s, this.ORDER);
  }
  pow(r, s) {
    return Ei(this, r, s);
  }
  div(r, s) {
    return ae(r * bs(s, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(r) {
    return r * r;
  }
  addN(r, s) {
    return r + s;
  }
  subN(r, s) {
    return r - s;
  }
  mulN(r, s) {
    return r * s;
  }
  inv(r) {
    return bs(r, this.ORDER);
  }
  sqrt(r) {
    return this._sqrt || (this._sqrt = Ai(this.ORDER)), this._sqrt(this, r);
  }
  toBytes(r) {
    return this.isLE ? fi(r, this.BYTES) : zn(r, this.BYTES);
  }
  fromBytes(r, s = !1) {
    de(r);
    const { _lengths: o, BYTES: n, isLE: a, ORDER: c, _mod: d } = this;
    if (o) {
      if (!o.includes(r.length) || r.length > n)
        throw new Error("Field.fromBytes: expected " + o + " bytes, got " + r.length);
      const h = new Uint8Array(n);
      h.set(r, a ? 0 : h.length - r.length), r = h;
    }
    if (r.length !== n)
      throw new Error("Field.fromBytes: expected " + n + " bytes, got " + r.length);
    let l = a ? Nt(r) : mi(r);
    if (d && (l = ae(l, c)), !s && !this.isValid(l))
      throw new Error("invalid field element: outside of range 0..ORDER");
    return l;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(r) {
    return Kn(this, r);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(r, s, o) {
    return o ? s : r;
  }
}
function Hr(e, r = {}) {
  return new _i(e, r);
}
const kt = /* @__PURE__ */ BigInt(0), Tr = /* @__PURE__ */ BigInt(1);
function vs(e, r) {
  const s = r.negate();
  return e ? s : r;
}
function zt(e, r) {
  const s = Kn(e.Fp, r.map((o) => o.Z));
  return r.map((o, n) => e.fromAffine(o.toAffine(s[n])));
}
function Zn(e, r) {
  if (!Number.isSafeInteger(e) || e <= 0 || e > r)
    throw new Error("invalid window size, expected [1.." + r + "], got W=" + e);
}
function jt(e, r) {
  Zn(e, r);
  const s = Math.ceil(r / e) + 1, o = 2 ** (e - 1), n = 2 ** e, a = gi(e), c = BigInt(e);
  return { windows: s, windowSize: o, mask: a, maxNumber: n, shiftBy: c };
}
function As(e, r, s) {
  const { windowSize: o, mask: n, maxNumber: a, shiftBy: c } = s;
  let d = Number(e & n), l = e >> c;
  d > o && (d -= a, l += Tr);
  const h = r * o, m = h + Math.abs(d) - 1, u = d === 0, p = d < 0, g = r % 2 !== 0;
  return { nextN: l, offset: m, isZero: u, isNeg: p, isNegF: g, offsetF: h };
}
const $t = /* @__PURE__ */ new WeakMap(), Xn = /* @__PURE__ */ new WeakMap();
function Vt(e) {
  return Xn.get(e) || 1;
}
function Ns(e) {
  if (e !== kt)
    throw new Error("invalid wNAF");
}
class Si {
  BASE;
  ZERO;
  Fn;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(r, s) {
    this.BASE = r.BASE, this.ZERO = r.ZERO, this.Fn = r.Fn, this.bits = s;
  }
  // non-const time multiplication ladder
  _unsafeLadder(r, s, o = this.ZERO) {
    let n = r;
    for (; s > kt; )
      s & Tr && (o = o.add(n)), n = n.double(), s >>= Tr;
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
  precomputeWindow(r, s) {
    const { windows: o, windowSize: n } = jt(s, this.bits), a = [];
    let c = r, d = c;
    for (let l = 0; l < o; l++) {
      d = c, a.push(d);
      for (let h = 1; h < n; h++)
        d = d.add(c), a.push(d);
      c = d.double();
    }
    return a;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(r, s, o) {
    if (!this.Fn.isValid(o))
      throw new Error("invalid scalar");
    let n = this.ZERO, a = this.BASE;
    const c = jt(r, this.bits);
    for (let d = 0; d < c.windows; d++) {
      const { nextN: l, offset: h, isZero: m, isNeg: u, isNegF: p, offsetF: g } = As(o, d, c);
      o = l, m ? a = a.add(vs(p, s[g])) : n = n.add(vs(u, s[h]));
    }
    return Ns(o), { p: n, f: a };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(r, s, o, n = this.ZERO) {
    const a = jt(r, this.bits);
    for (let c = 0; c < a.windows && o !== kt; c++) {
      const { nextN: d, offset: l, isZero: h, isNeg: m } = As(o, c, a);
      if (o = d, !h) {
        const u = s[l];
        n = n.add(m ? u.negate() : u);
      }
    }
    return Ns(o), n;
  }
  getPrecomputes(r, s, o) {
    let n = $t.get(s);
    return n || (n = this.precomputeWindow(s, r), r !== 1 && (typeof o == "function" && (n = o(n)), $t.set(s, n))), n;
  }
  cached(r, s, o) {
    const n = Vt(r);
    return this.wNAF(n, this.getPrecomputes(n, r, o), s);
  }
  unsafe(r, s, o, n) {
    const a = Vt(r);
    return a === 1 ? this._unsafeLadder(r, s, n) : this.wNAFUnsafe(a, this.getPrecomputes(a, r, o), s, n);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(r, s) {
    Zn(s, this.bits), Xn.set(r, s), $t.delete(r);
  }
  hasCache(r) {
    return Vt(r) !== 1;
  }
}
function ks(e, r, s) {
  if (r) {
    if (r.ORDER !== e)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return Ci(r), r;
  } else
    return Hr(e, { isLE: s });
}
function Li(e, r, s = {}, o) {
  if (o === void 0 && (o = e === "edwards"), !r || typeof r != "object")
    throw new Error(`expected valid ${e} CURVE object`);
  for (const l of ["p", "n", "h"]) {
    const h = r[l];
    if (!(typeof h == "bigint" && h > kt))
      throw new Error(`CURVE.${l} must be positive bigint`);
  }
  const n = ks(r.p, s.Fp, o), a = ks(r.n, s.Fn, o), d = ["Gx", "Gy", "a", "d"];
  for (const l of d)
    if (!n.isValid(r[l]))
      throw new Error(`CURVE.${l} must be valid field element of CURVE.Fp`);
  return r = Object.freeze(Object.assign({}, r)), { CURVE: r, Fp: n, Fn: a };
}
function Ti(e, r) {
  return function(o) {
    const n = e(o);
    return { secretKey: n, publicKey: r(n) };
  };
}
const Be = BigInt(0), ce = BigInt(1), Ht = BigInt(2), Pi = BigInt(8);
function Bi(e, r, s, o) {
  const n = e.sqr(s), a = e.sqr(o), c = e.add(e.mul(r.a, n), a), d = e.add(e.ONE, e.mul(r.d, e.mul(n, a)));
  return e.eql(c, d);
}
function Ri(e, r = {}) {
  const s = Li("edwards", e, r, r.FpFnLE), { Fp: o, Fn: n } = s;
  let a = s.CURVE;
  const { h: c } = a;
  $r(r, {}, { uvRatio: "function" });
  const d = Ht << BigInt(n.BYTES * 8) - ce, l = (x) => o.create(x), h = r.uvRatio || ((x, E) => {
    try {
      return { isValid: !0, value: o.sqrt(o.div(x, E)) };
    } catch {
      return { isValid: !1, value: Be };
    }
  });
  if (!Bi(o, a, a.Gx, a.Gy))
    throw new Error("bad curve params: generator point");
  function m(x, E, N = !1) {
    const C = N ? ce : Be;
    return gs("coordinate " + x, E, C, d), E;
  }
  function u(x) {
    if (!(x instanceof w))
      throw new Error("EdwardsPoint expected");
  }
  const p = ws((x, E) => {
    const { X: N, Y: C, Z: _ } = x, T = x.is0();
    E == null && (E = T ? Pi : o.inv(_));
    const f = l(N * E), v = l(C * E), y = o.mul(_, E);
    if (T)
      return { x: Be, y: ce };
    if (y !== ce)
      throw new Error("invZ was invalid");
    return { x: f, y: v };
  }), g = ws((x) => {
    const { a: E, d: N } = a;
    if (x.is0())
      throw new Error("bad point: ZERO");
    const { X: C, Y: _, Z: T, T: f } = x, v = l(C * C), y = l(_ * _), A = l(T * T), L = l(A * A), S = l(v * E), R = l(A * l(S + y)), P = l(L + l(N * l(v * y)));
    if (R !== P)
      throw new Error("bad point: equation left != right (1)");
    const M = l(C * _), I = l(T * f);
    if (M !== I)
      throw new Error("bad point: equation left != right (2)");
    return !0;
  });
  class w {
    // base / generator point
    static BASE = new w(a.Gx, a.Gy, ce, l(a.Gx * a.Gy));
    // zero / infinity / identity point
    static ZERO = new w(Be, ce, ce, Be);
    // 0, 1, 1, 0
    // math field
    static Fp = o;
    // scalar field
    static Fn = n;
    X;
    Y;
    Z;
    T;
    constructor(E, N, C, _) {
      this.X = m("x", E), this.Y = m("y", N), this.Z = m("z", C, !0), this.T = m("t", _), Object.freeze(this);
    }
    static CURVE() {
      return a;
    }
    static fromAffine(E) {
      if (E instanceof w)
        throw new Error("extended point not allowed");
      const { x: N, y: C } = E || {};
      return m("x", N), m("y", C), new w(N, C, ce, l(N * C));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(E, N = !1) {
      const C = o.BYTES, { a: _, d: T } = a;
      E = Lr(de(E, C, "point")), Sr(N, "zip215");
      const f = Lr(E), v = E[C - 1];
      f[C - 1] = v & -129;
      const y = Nt(f), A = N ? d : o.ORDER;
      gs("point.y", y, Be, A);
      const L = l(y * y), S = l(L - ce), R = l(T * L - _);
      let { isValid: P, value: M } = h(S, R);
      if (!P)
        throw new Error("bad point: invalid y coordinate");
      const I = (M & ce) === ce, U = (v & 128) !== 0;
      if (!N && M === Be && U)
        throw new Error("bad point: x=0 and x_0=1");
      return U !== I && (M = l(-M)), w.fromAffine({ x: M, y });
    }
    static fromHex(E, N = !1) {
      return w.fromBytes(Fn(E), N);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(E = 8, N = !0) {
      return b.createCache(this, E), N || this.multiply(Ht), this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      g(this);
    }
    // Compare one point to another.
    equals(E) {
      u(E);
      const { X: N, Y: C, Z: _ } = this, { X: T, Y: f, Z: v } = E, y = l(N * v), A = l(T * _), L = l(C * v), S = l(f * _);
      return y === A && L === S;
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
      const { a: E } = a, { X: N, Y: C, Z: _ } = this, T = l(N * N), f = l(C * C), v = l(Ht * l(_ * _)), y = l(E * T), A = N + C, L = l(l(A * A) - T - f), S = y + f, R = S - v, P = y - f, M = l(L * R), I = l(S * P), U = l(L * P), W = l(R * S);
      return new w(M, I, W, U);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(E) {
      u(E);
      const { a: N, d: C } = a, { X: _, Y: T, Z: f, T: v } = this, { X: y, Y: A, Z: L, T: S } = E, R = l(_ * y), P = l(T * A), M = l(v * C * S), I = l(f * L), U = l((_ + T) * (y + A) - R - P), W = I - M, z = I + M, $ = l(P - N * R), F = l(U * W), H = l(z * $), Z = l(U * $), Q = l(W * z);
      return new w(F, H, Q, Z);
    }
    subtract(E) {
      return this.add(E.negate());
    }
    // Constant-time multiplication.
    multiply(E) {
      if (!n.isValidNot0(E))
        throw new Error("invalid scalar: expected 1 <= sc < curve.n");
      const { p: N, f: C } = b.cached(this, E, (_) => zt(w, _));
      return zt(w, [N, C])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Does NOT allow scalars higher than CURVE.n.
    // Accepts optional accumulator to merge with multiply (important for sparse scalars)
    multiplyUnsafe(E, N = w.ZERO) {
      if (!n.isValid(E))
        throw new Error("invalid scalar: expected 0 <= sc < curve.n");
      return E === Be ? w.ZERO : this.is0() || E === ce ? this : b.unsafe(this, E, (C) => zt(w, C), N);
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
      return b.unsafe(this, a.n).is0();
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    toAffine(E) {
      return p(this, E);
    }
    clearCofactor() {
      return c === ce ? this : this.multiplyUnsafe(c);
    }
    toBytes() {
      const { x: E, y: N } = this.toAffine(), C = o.toBytes(N);
      return C[C.length - 1] |= E & ce ? 128 : 0, C;
    }
    toHex() {
      return jr(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const b = new Si(w, n.BITS);
  return w.BASE.precompute(8), w;
}
function Mi(e, r, s = {}) {
  if (typeof r != "function")
    throw new Error('"hash" function param is required');
  $r(s, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    mapToCurve: "function"
  });
  const { prehash: o } = s, { BASE: n, Fp: a, Fn: c } = e, d = s.randomBytes || Ka, l = s.adjustScalarBytes || ((y) => y), h = s.domain || ((y, A, L) => {
    if (Sr(L, "phflag"), A.length || L)
      throw new Error("Contexts/pre-hash are not supported");
    return y;
  });
  function m(y) {
    return c.create(Nt(y));
  }
  function u(y) {
    const A = C.secretKey;
    de(y, C.secretKey, "secretKey");
    const L = de(r(y), 2 * A, "hashedSecretKey"), S = l(L.slice(0, A)), R = L.slice(A, 2 * A), P = m(S);
    return { head: S, prefix: R, scalar: P };
  }
  function p(y) {
    const { head: A, prefix: L, scalar: S } = u(y), R = n.multiply(S), P = R.toBytes();
    return { head: A, prefix: L, scalar: S, point: R, pointBytes: P };
  }
  function g(y) {
    return p(y).pointBytes;
  }
  function w(y = Uint8Array.of(), ...A) {
    const L = us(...A);
    return m(r(h(L, de(y, void 0, "context"), !!o)));
  }
  function b(y, A, L = {}) {
    y = de(y, void 0, "message"), o && (y = o(y));
    const { prefix: S, scalar: R, pointBytes: P } = p(A), M = w(L.context, S, y), I = n.multiply(M).toBytes(), U = w(L.context, I, P, y), W = c.create(M + U * R);
    if (!c.isValid(W))
      throw new Error("sign failed: invalid s");
    const z = us(I, c.toBytes(W));
    return de(z, C.signature, "result");
  }
  const x = { zip215: !0 };
  function E(y, A, L, S = x) {
    const { context: R, zip215: P } = S, M = C.signature;
    y = de(y, M, "signature"), A = de(A, void 0, "message"), L = de(L, C.publicKey, "publicKey"), P !== void 0 && Sr(P, "zip215"), o && (A = o(A));
    const I = M / 2, U = y.subarray(0, I), W = Nt(y.subarray(I, M));
    let z, $, F;
    try {
      z = e.fromBytes(L, P), $ = e.fromBytes(U, P), F = n.multiplyUnsafe(W);
    } catch {
      return !1;
    }
    if (!P && z.isSmallOrder())
      return !1;
    const H = w(R, $.toBytes(), z.toBytes(), A);
    return $.add(z.multiplyUnsafe(H)).subtract(F).clearCofactor().is0();
  }
  const N = a.BYTES, C = {
    secretKey: N,
    publicKey: N,
    signature: 2 * N,
    seed: N
  };
  function _(y = d(C.seed)) {
    return de(y, C.seed, "seed");
  }
  function T(y) {
    return Un(y) && y.length === c.BYTES;
  }
  function f(y, A) {
    try {
      return !!e.fromBytes(y, A);
    } catch {
      return !1;
    }
  }
  const v = {
    getExtendedPublicKey: p,
    randomSecretKey: _,
    isValidSecretKey: T,
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
    toMontgomery(y) {
      const { y: A } = e.fromBytes(y), L = C.publicKey, S = L === 32;
      if (!S && L !== 57)
        throw new Error("only defined for 25519 and 448");
      const R = S ? a.div(ce + A, ce - A) : a.div(A - ce, A + ce);
      return a.toBytes(R);
    },
    toMontgomerySecret(y) {
      const A = C.secretKey;
      de(y, A);
      const L = r(y.subarray(0, A));
      return l(L).subarray(0, A);
    }
  };
  return Object.freeze({
    keygen: Ti(_, g),
    getPublicKey: g,
    sign: b,
    verify: E,
    utils: v,
    Point: e,
    lengths: C
  });
}
const Ii = BigInt(1), Cs = BigInt(2), Ui = BigInt(5), Di = BigInt(8), Gr = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"), Fi = {
  p: Gr,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: Di,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
};
function Oi(e) {
  const r = BigInt(10), s = BigInt(20), o = BigInt(40), n = BigInt(80), a = Gr, d = e * e % a * e % a, l = ve(d, Cs, a) * d % a, h = ve(l, Ii, a) * e % a, m = ve(h, Ui, a) * h % a, u = ve(m, r, a) * m % a, p = ve(u, s, a) * u % a, g = ve(p, o, a) * p % a, w = ve(g, n, a) * g % a, b = ve(w, n, a) * g % a, x = ve(b, r, a) * m % a;
  return { pow_p_5_8: ve(x, Cs, a) * e % a, b2: d };
}
function Wi(e) {
  return e[0] &= 248, e[31] &= 127, e[31] |= 64, e;
}
const Es = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function qi(e, r) {
  const s = Gr, o = ae(r * r * r, s), n = ae(o * o * r, s), a = Oi(e * n).pow_p_5_8;
  let c = ae(e * o * a, s);
  const d = ae(r * c * c, s), l = c, h = ae(c * Es, s), m = d === e, u = d === ae(-e, s), p = d === ae(-e * Es, s);
  return m && (c = l), (u || p) && (c = h), Ni(c, s) && (c = ae(-c, s)), { isValid: m || u, value: c };
}
const zi = /* @__PURE__ */ Ri(Fi, { uvRatio: qi });
function ji(e) {
  return Mi(zi, ui, Object.assign({ adjustScalarBytes: Wi }, e));
}
const $i = /* @__PURE__ */ ji({});
function Vi(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Mt(e, ...r) {
  if (!Vi(e))
    throw new Error("Uint8Array expected");
  if (r.length > 0 && !r.includes(e.length))
    throw new Error("Uint8Array expected of length " + r + ", got length=" + e.length);
}
function xs(e, r = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (r && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function Hi(e, r) {
  Mt(e);
  const s = r.outputLen;
  if (e.length < s)
    throw new Error("digestInto() expects output buffer of length at least " + s);
}
function Pr(...e) {
  for (let r = 0; r < e.length; r++)
    e[r].fill(0);
}
function Gt(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function Ae(e, r) {
  return e << 32 - r | e >>> r;
}
function Gi(e) {
  if (typeof e != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(e));
}
function Jn(e) {
  return typeof e == "string" && (e = Gi(e)), Mt(e), e;
}
class Qi {
}
function Yi(e) {
  const r = (o) => e().update(Jn(o)).digest(), s = e();
  return r.outputLen = s.outputLen, r.blockLen = s.blockLen, r.create = () => e(), r;
}
function Ki(e, r, s, o) {
  if (typeof e.setBigUint64 == "function")
    return e.setBigUint64(r, s, o);
  const n = BigInt(32), a = BigInt(4294967295), c = Number(s >> n & a), d = Number(s & a), l = o ? 4 : 0, h = o ? 0 : 4;
  e.setUint32(r + l, c, o), e.setUint32(r + h, d, o);
}
function Zi(e, r, s) {
  return e & r ^ ~e & s;
}
function Xi(e, r, s) {
  return e & r ^ e & s ^ r & s;
}
class Ji extends Qi {
  constructor(r, s, o, n) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = r, this.outputLen = s, this.padOffset = o, this.isLE = n, this.buffer = new Uint8Array(r), this.view = Gt(this.buffer);
  }
  update(r) {
    xs(this), r = Jn(r), Mt(r);
    const { view: s, buffer: o, blockLen: n } = this, a = r.length;
    for (let c = 0; c < a; ) {
      const d = Math.min(n - this.pos, a - c);
      if (d === n) {
        const l = Gt(r);
        for (; n <= a - c; c += n)
          this.process(l, c);
        continue;
      }
      o.set(r.subarray(c, c + d), this.pos), this.pos += d, c += d, this.pos === n && (this.process(s, 0), this.pos = 0);
    }
    return this.length += r.length, this.roundClean(), this;
  }
  digestInto(r) {
    xs(this), Hi(r, this), this.finished = !0;
    const { buffer: s, view: o, blockLen: n, isLE: a } = this;
    let { pos: c } = this;
    s[c++] = 128, Pr(this.buffer.subarray(c)), this.padOffset > n - c && (this.process(o, 0), c = 0);
    for (let u = c; u < n; u++)
      s[u] = 0;
    Ki(o, n - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const d = Gt(r), l = this.outputLen;
    if (l % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const h = l / 4, m = this.get();
    if (h > m.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let u = 0; u < h; u++)
      d.setUint32(4 * u, m[u], a);
  }
  digest() {
    const { buffer: r, outputLen: s } = this;
    this.digestInto(r);
    const o = r.slice(0, s);
    return this.destroy(), o;
  }
  _cloneInto(r) {
    r || (r = new this.constructor()), r.set(...this.get());
    const { blockLen: s, buffer: o, length: n, finished: a, destroyed: c, pos: d } = this;
    return r.destroyed = c, r.finished = a, r.length = n, r.pos = d, n % s && r.buffer.set(o), r;
  }
  clone() {
    return this._cloneInto();
  }
}
const Re = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), ec = /* @__PURE__ */ Uint32Array.from([
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
]), Me = /* @__PURE__ */ new Uint32Array(64);
class tc extends Ji {
  constructor(r = 32) {
    super(64, r, 8, !1), this.A = Re[0] | 0, this.B = Re[1] | 0, this.C = Re[2] | 0, this.D = Re[3] | 0, this.E = Re[4] | 0, this.F = Re[5] | 0, this.G = Re[6] | 0, this.H = Re[7] | 0;
  }
  get() {
    const { A: r, B: s, C: o, D: n, E: a, F: c, G: d, H: l } = this;
    return [r, s, o, n, a, c, d, l];
  }
  // prettier-ignore
  set(r, s, o, n, a, c, d, l) {
    this.A = r | 0, this.B = s | 0, this.C = o | 0, this.D = n | 0, this.E = a | 0, this.F = c | 0, this.G = d | 0, this.H = l | 0;
  }
  process(r, s) {
    for (let u = 0; u < 16; u++, s += 4)
      Me[u] = r.getUint32(s, !1);
    for (let u = 16; u < 64; u++) {
      const p = Me[u - 15], g = Me[u - 2], w = Ae(p, 7) ^ Ae(p, 18) ^ p >>> 3, b = Ae(g, 17) ^ Ae(g, 19) ^ g >>> 10;
      Me[u] = b + Me[u - 7] + w + Me[u - 16] | 0;
    }
    let { A: o, B: n, C: a, D: c, E: d, F: l, G: h, H: m } = this;
    for (let u = 0; u < 64; u++) {
      const p = Ae(d, 6) ^ Ae(d, 11) ^ Ae(d, 25), g = m + p + Zi(d, l, h) + ec[u] + Me[u] | 0, b = (Ae(o, 2) ^ Ae(o, 13) ^ Ae(o, 22)) + Xi(o, n, a) | 0;
      m = h, h = l, l = d, d = c + g | 0, c = a, a = n, n = o, o = g + b | 0;
    }
    o = o + this.A | 0, n = n + this.B | 0, a = a + this.C | 0, c = c + this.D | 0, d = d + this.E | 0, l = l + this.F | 0, h = h + this.G | 0, m = m + this.H | 0, this.set(o, n, a, c, d, l, h, m);
  }
  roundClean() {
    Pr(Me);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), Pr(this.buffer);
  }
}
const eo = /* @__PURE__ */ Yi(() => new tc()), rc = eo, sc = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function nc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const r = rc(e), s = $i.getPublicKey(r), o = new Uint8Array(64);
  return o.set(r, 0), o.set(s, 32), wn(r), { publicKey: s, secretKey: o };
}
function to(e) {
  const r = nc(e), s = r.publicKey;
  return wn(r.secretKey), s;
}
function ro(e) {
  if (e.length !== 32)
    throw new Error(`Invalid public key length: expected 32, got ${e.length}`);
  return oc(e);
}
function oc(e) {
  let r = 0;
  for (let n = 0; n < e.length && e[n] === 0; n++)
    r++;
  let s = 0n;
  for (let n = 0; n < e.length; n++)
    s = s * 256n + BigInt(e[n]);
  let o = "";
  for (; s > 0n; ) {
    const n = Number(s % 58n);
    o = sc[n] + o, s = s / 58n;
  }
  return "1".repeat(r) + o;
}
const ac = 2, ic = 3;
function so(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const r = Br(e), s = In.share(r, ic, ac);
  if (s.length !== 3)
    throw new Error(`Unexpected share count: ${s.length}`);
  const o = Qt(s[0]), n = Qt(s[1]), a = Qt(s[2]);
  return {
    shareA: qe(o),
    shareB: qe(n),
    shareC: qe(a)
  };
}
function cc(e, r, s) {
  const o = _s(e), n = _s(r);
  try {
    const a = In.combine([o, n]), c = no(a);
    if (c.length !== 16)
      throw new Error(`Reconstructed seed has wrong length: ${c.length}`);
    return bn(c);
  } catch (a) {
    throw a instanceof Error && a.message.startsWith("Reconstructed seed") || a instanceof Error && a.message.startsWith("Invalid expectedPublicKey") || a instanceof Error && a.message.startsWith("Reconstructed seed does not match") ? a : new Error("Failed to reconstruct seed from shares");
  }
}
function Br(e) {
  return Array.from(e).map((r) => r.toString(16).padStart(2, "0")).join("");
}
function no(e) {
  if (!/^[0-9a-fA-F]*$/.test(e))
    throw new Error("Invalid hex string: contains non-hex characters");
  if (e.length % 2 !== 0)
    throw new Error(`Invalid hex string: length ${e.length} is odd (must be even)`);
  const r = new Uint8Array(e.length / 2);
  for (let s = 0; s < r.length; s++)
    r[s] = parseInt(e.substr(s * 2, 2), 16);
  return r;
}
function Qt(e) {
  const r = e.length % 2 !== 0, s = r ? "0" + e : e, o = no(s), n = new Uint8Array(1 + o.length);
  return n[0] = r ? 1 : 0, n.set(o, 1), n;
}
function _s(e) {
  const r = e[0];
  if (r === 0 || r === 1) {
    const o = r === 1, n = e.subarray(1), a = Br(n), c = o ? a.substring(1) : a;
    if (/^[0-9a-f]/.test(c))
      return c;
  }
  const s = Br(e);
  return s.startsWith("0") && !s.startsWith("00") ? s.substring(1) : s;
}
function Ct(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function oo(e, r) {
  return Array.isArray(r) ? r.length === 0 ? !0 : e ? r.every((s) => typeof s == "string") : r.every((s) => Number.isSafeInteger(s)) : !1;
}
function lc(e) {
  if (typeof e != "function")
    throw new Error("function expected");
  return !0;
}
function Et(e, r) {
  if (typeof r != "string")
    throw new Error(`${e}: string expected`);
  return !0;
}
function Ze(e) {
  if (!Number.isSafeInteger(e))
    throw new Error(`invalid integer: ${e}`);
}
function xt(e) {
  if (!Array.isArray(e))
    throw new Error("array expected");
}
function _t(e, r) {
  if (!oo(!0, r))
    throw new Error(`${e}: array of strings expected`);
}
function ao(e, r) {
  if (!oo(!1, r))
    throw new Error(`${e}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function dc(...e) {
  const r = (a) => a, s = (a, c) => (d) => a(c(d)), o = e.map((a) => a.encode).reduceRight(s, r), n = e.map((a) => a.decode).reduce(s, r);
  return { encode: o, decode: n };
}
// @__NO_SIDE_EFFECTS__
function uc(e) {
  const r = typeof e == "string" ? e.split("") : e, s = r.length;
  _t("alphabet", r);
  const o = new Map(r.map((n, a) => [n, a]));
  return {
    encode: (n) => (xt(n), n.map((a) => {
      if (!Number.isSafeInteger(a) || a < 0 || a >= s)
        throw new Error(`alphabet.encode: digit index outside alphabet "${a}". Allowed: ${e}`);
      return r[a];
    })),
    decode: (n) => (xt(n), n.map((a) => {
      Et("alphabet.decode", a);
      const c = o.get(a);
      if (c === void 0)
        throw new Error(`Unknown letter: "${a}". Allowed: ${e}`);
      return c;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function hc(e = "") {
  return Et("join", e), {
    encode: (r) => (_t("join.decode", r), r.join(e)),
    decode: (r) => (Et("join.decode", r), r.split(e))
  };
}
// @__NO_SIDE_EFFECTS__
function mc(e, r = "=") {
  return Ze(e), Et("padding", r), {
    encode(s) {
      for (_t("padding.encode", s); s.length * e % 8; )
        s.push(r);
      return s;
    },
    decode(s) {
      _t("padding.decode", s);
      let o = s.length;
      if (o * e % 8)
        throw new Error("padding: invalid, string should have whole number of bytes");
      for (; o > 0 && s[o - 1] === r; o--)
        if ((o - 1) * e % 8 === 0)
          throw new Error("padding: invalid, string has too much padding");
      return s.slice(0, o);
    }
  };
}
function Rr(e, r, s) {
  if (r < 2)
    throw new Error(`convertRadix: invalid from=${r}, base cannot be less than 2`);
  if (s < 2)
    throw new Error(`convertRadix: invalid to=${s}, base cannot be less than 2`);
  if (xt(e), !e.length)
    return [];
  let o = 0;
  const n = [], a = Array.from(e, (d) => {
    if (Ze(d), d < 0 || d >= r)
      throw new Error(`invalid integer: ${d}`);
    return d;
  }), c = a.length;
  for (; ; ) {
    let d = 0, l = !0;
    for (let h = o; h < c; h++) {
      const m = a[h], u = r * d, p = u + m;
      if (!Number.isSafeInteger(p) || u / r !== d || p - m !== u)
        throw new Error("convertRadix: carry overflow");
      const g = p / s;
      d = p % s;
      const w = Math.floor(g);
      if (a[h] = w, !Number.isSafeInteger(w) || w * s + d !== p)
        throw new Error("convertRadix: carry overflow");
      if (l)
        w ? l = !1 : o = h;
      else continue;
    }
    if (n.push(d), l)
      break;
  }
  for (let d = 0; d < e.length - 1 && e[d] === 0; d++)
    n.push(0);
  return n.reverse();
}
const io = (e, r) => r === 0 ? e : io(r, e % r), St = /* @__NO_SIDE_EFFECTS__ */ (e, r) => e + (r - io(e, r)), Yt = /* @__PURE__ */ (() => {
  let e = [];
  for (let r = 0; r < 40; r++)
    e.push(2 ** r);
  return e;
})();
function Mr(e, r, s, o) {
  if (xt(e), r <= 0 || r > 32)
    throw new Error(`convertRadix2: wrong from=${r}`);
  if (s <= 0 || s > 32)
    throw new Error(`convertRadix2: wrong to=${s}`);
  if (/* @__PURE__ */ St(r, s) > 32)
    throw new Error(`convertRadix2: carry overflow from=${r} to=${s} carryBits=${/* @__PURE__ */ St(r, s)}`);
  let n = 0, a = 0;
  const c = Yt[r], d = Yt[s] - 1, l = [];
  for (const h of e) {
    if (Ze(h), h >= c)
      throw new Error(`convertRadix2: invalid data word=${h} from=${r}`);
    if (n = n << r | h, a + r > 32)
      throw new Error(`convertRadix2: carry overflow pos=${a} from=${r}`);
    for (a += r; a >= s; a -= s)
      l.push((n >> a - s & d) >>> 0);
    const m = Yt[a];
    if (m === void 0)
      throw new Error("invalid carry");
    n &= m - 1;
  }
  if (n = n << s - a & d, !o && a >= r)
    throw new Error("Excess padding");
  if (!o && n > 0)
    throw new Error(`Non-zero padding: ${n}`);
  return o && a > 0 && l.push(n >>> 0), l;
}
// @__NO_SIDE_EFFECTS__
function fc(e) {
  Ze(e);
  const r = 2 ** 8;
  return {
    encode: (s) => {
      if (!Ct(s))
        throw new Error("radix.encode input should be Uint8Array");
      return Rr(Array.from(s), r, e);
    },
    decode: (s) => (ao("radix.decode", s), Uint8Array.from(Rr(s, e, r)))
  };
}
// @__NO_SIDE_EFFECTS__
function pc(e, r = !1) {
  if (Ze(e), e <= 0 || e > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ St(8, e) > 32 || /* @__PURE__ */ St(e, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (s) => {
      if (!Ct(s))
        throw new Error("radix2.encode input should be Uint8Array");
      return Mr(Array.from(s), 8, e, !r);
    },
    decode: (s) => (ao("radix2.decode", s), Uint8Array.from(Mr(s, e, 8, r)))
  };
}
function gc(e, r) {
  return Ze(e), lc(r), {
    encode(s) {
      if (!Ct(s))
        throw new Error("checksum.encode: input should be Uint8Array");
      const o = r(s).slice(0, e), n = new Uint8Array(s.length + e);
      return n.set(s), n.set(o, s.length), n;
    },
    decode(s) {
      if (!Ct(s))
        throw new Error("checksum.decode: input should be Uint8Array");
      const o = s.slice(0, -e), n = s.slice(-e), a = r(o).slice(0, e);
      for (let c = 0; c < e; c++)
        if (a[c] !== n[c])
          throw new Error("Invalid checksum");
      return o;
    }
  };
}
const ut = {
  alphabet: uc,
  chain: dc,
  checksum: gc,
  convertRadix: Rr,
  convertRadix2: Mr,
  radix: fc,
  radix2: pc,
  join: hc,
  padding: mc
};
const wc = (e) => e[0] === "あいこくしん";
function bc(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function yc(e) {
  const r = bc(e), s = r.split(" ");
  if (![12, 15, 18, 21, 24].includes(s.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: r, words: s };
}
function co(e) {
  Mt(e, 16, 20, 24, 28, 32);
}
const vc = (e) => {
  const r = 8 - e.length / 4;
  return new Uint8Array([eo(e)[0] >> r << r]);
};
function lo(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((r) => {
    if (typeof r != "string")
      throw new Error("wordlist: non-string element: " + r);
  }), ut.chain(ut.checksum(1, vc), ut.radix2(11, !0), ut.alphabet(e));
}
function Qr(e, r) {
  const { words: s } = yc(e), o = lo(r).decode(s);
  return co(o), o;
}
function uo(e, r) {
  return co(e), lo(r).encode(e).join(wc(r) ? "　" : " ");
}
function Yr(e, r) {
  try {
    Qr(e, r);
  } catch {
    return !1;
  }
  return !0;
}
const xe = `abandon
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
`), be = 12;
function Ac(e) {
  if (e.length !== 16)
    throw new Error(`Invalid share length: expected 16, got ${e.length}`);
  const s = uo(e, xe).split(" ");
  if (s.length !== be)
    throw new Error(`Unexpected word count: expected ${be}, got ${s.length}`);
  return s;
}
function Nc(e) {
  if (e.length !== be)
    throw new Error(`Invalid word count: expected ${be}, got ${e.length}`);
  const r = e.join(" ").toLowerCase().trim();
  if (!Yr(r, xe))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const s = Qr(r, xe);
  if (s.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${s.length}`);
  return qe(s);
}
function kc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const s = uo(e, xe).split(" ");
  if (s.length !== be)
    throw new Error(`Unexpected word count: expected ${be}, got ${s.length}`);
  return s;
}
function Cc(e) {
  if (e.length !== be)
    throw new Error(`Invalid word count: expected ${be}, got ${e.length}`);
  const r = e.join(" ").toLowerCase().trim();
  if (!Yr(r, xe))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const s = Qr(r, xe);
  if (s.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${s.length}`);
  return bn(s);
}
function ho(e) {
  if (e.length !== be)
    return !1;
  const r = e.join(" ").toLowerCase().trim();
  return Yr(r, xe);
}
function ht(e) {
  return xe.includes(e.toLowerCase().trim());
}
function Ec(e, r = 5) {
  const s = e.toLowerCase().trim();
  return s.length === 0 ? [] : xe.filter((o) => o.startsWith(s)).slice(0, r);
}
function xc(e) {
  const r = [];
  for (let s = 0; s < e.length; s += 4)
    r.push(e.slice(s, s + 4));
  return r;
}
function _c(e) {
  return e.toLowerCase().replace(/[,\n\r\t]+/g, " ").split(/\s+/).map((r) => r.trim()).filter((r) => r.length > 0);
}
function $h({
  className: e = "",
  variant: r = "default",
  size: s = "md",
  children: o,
  menuItems: n = [],
  hideSignOut: a = !1
}) {
  const { user: c, isAuthenticated: d, isLoading: l, openLoginModal: h, logout: m } = Bt(), [u, p] = k(!1), [g, w] = k(-1), b = J(null), x = J(null), E = q(
    () => [...n, ...a ? [] : [{ label: "Sign out", onClick: m }]],
    [n, a, m]
  );
  O(() => {
    if (!u) return;
    const f = (y) => {
      b.current && !b.current.contains(y.target) && (p(!1), w(-1));
    }, v = (y) => {
      y.key === "Escape" && (p(!1), w(-1), x.current?.focus());
    };
    return document.addEventListener("mousedown", f), document.addEventListener("keydown", v), () => {
      document.removeEventListener("mousedown", f), document.removeEventListener("keydown", v);
    };
  }, [u]);
  const N = B(
    (f) => {
      if (!(!u || E.length === 0))
        switch (f.key) {
          case "ArrowDown":
            f.preventDefault(), w((v) => (v + 1) % E.length);
            break;
          case "ArrowUp":
            f.preventDefault(), w((v) => (v - 1 + E.length) % E.length);
            break;
          case "Home":
            f.preventDefault(), w(0);
            break;
          case "End":
            f.preventDefault(), w(E.length - 1);
            break;
          case "Enter":
          case " ":
            g >= 0 && (f.preventDefault(), E[g].onClick(), p(!1), w(-1));
            break;
        }
    },
    [u, g, E]
  ), C = B(() => {
    E.length !== 0 && (p((f) => !f), w(-1));
  }, [E.length]), _ = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, T = {
    default: "cedros-button-primary",
    outline: "cedros-button-outline",
    ghost: "cedros-button-ghost"
  };
  if (l)
    return /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: `cedros-button ${T[r]} ${_[s]} ${e}`,
        disabled: !0,
        children: /* @__PURE__ */ t(Y, { size: "sm" })
      }
    );
  if (d && c) {
    const f = c.name || c.email || "User", v = _n(c.picture);
    return (
      // L-08: Added keyboard handler and ref for accessibility
      /* @__PURE__ */ i("div", { className: "cedros-user-menu", ref: b, onKeyDown: N, children: [
        /* @__PURE__ */ i(
          "button",
          {
            ref: x,
            type: "button",
            className: `cedros-button cedros-user-button ${_[s]} ${e}`,
            "aria-haspopup": "menu",
            "aria-expanded": u,
            "aria-label": `User menu for ${f}`,
            onClick: C,
            children: [
              v ? /* @__PURE__ */ t(
                "img",
                {
                  src: v,
                  alt: f,
                  className: "cedros-user-avatar",
                  referrerPolicy: "no-referrer",
                  crossOrigin: "anonymous"
                }
              ) : /* @__PURE__ */ t("div", { className: "cedros-user-avatar-placeholder", children: (f[0] || "?").toUpperCase() }),
              /* @__PURE__ */ t("span", { className: "cedros-user-name", children: f })
            ]
          }
        ),
        u && /* @__PURE__ */ i("div", { className: "cedros-dropdown cedros-dropdown-open", role: "menu", children: [
          n.map((y, A) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item ${g === A ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: g === A ? 0 : -1,
              onClick: () => {
                y.onClick(), p(!1);
              },
              children: [
                y.icon && /* @__PURE__ */ t("span", { className: "cedros-dropdown-icon", children: y.icon }),
                y.label
              ]
            },
            A
          )),
          n.length > 0 && !a && /* @__PURE__ */ t("div", { className: "cedros-dropdown-divider", role: "separator" }),
          !a && /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item cedros-dropdown-item-danger ${g === n.length ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: g === n.length ? 0 : -1,
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
  return /* @__PURE__ */ t(
    "button",
    {
      type: "button",
      className: `cedros-button ${T[r]} ${_[s]} ${e}`,
      onClick: h,
      children: o || "Sign in"
    }
  );
}
const Sc = Jo(async () => ({ default: (await import("./SolanaLoginButton-Qi88uC4_.js")).SolanaLoginButton }));
function Lc(e) {
  return /* @__PURE__ */ t(Xo, { fallback: /* @__PURE__ */ t(Tc, { ...e }), children: /* @__PURE__ */ t(Sc, { ...e }) });
}
function Tc({
  className: e = "",
  variant: r = "default",
  size: s = "md"
}) {
  const o = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ i(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[r]} ${o[s]} ${e}`,
      disabled: !0,
      "aria-label": "Continue with Solana",
      children: [
        /* @__PURE__ */ t(Y, { size: "sm" }),
        /* @__PURE__ */ t("span", { children: "Continue with Solana" })
      ]
    }
  );
}
function Kr(e) {
  return /* @__PURE__ */ t(
    oa,
    {
      ...e,
      getHasWallets: ca,
      renderSolanaButton: (r) => /* @__PURE__ */ t(Lc, { ...r })
    }
  );
}
class Pc extends ea {
  constructor(r) {
    super(r), this.state = {
      hasError: !1,
      error: null,
      errorInfo: null
    };
  }
  static getDerivedStateFromError(r) {
    return { hasError: !0, error: r };
  }
  componentDidCatch(r, s) {
    this.setState({ errorInfo: s }), console.error("[Cedros Login] Error caught by ErrorBoundary:", r), console.error("[Cedros Login] Component stack:", s.componentStack), this.props.onError?.(r, s);
  }
  handleRetry = () => {
    this.setState({
      hasError: !1,
      error: null,
      errorInfo: null
    });
  };
  render() {
    const { hasError: r, error: s, errorInfo: o } = this.state, { children: n, fallback: a, showDetails: c = !1 } = this.props;
    return r ? a || /* @__PURE__ */ t("div", { className: "cedros-error-boundary", role: "alert", "aria-live": "assertive", children: /* @__PURE__ */ i("div", { className: "cedros-error-boundary-content", children: [
      /* @__PURE__ */ i(
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
            /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ t("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
            /* @__PURE__ */ t("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
          ]
        }
      ),
      /* @__PURE__ */ t("h2", { className: "cedros-error-boundary-title", children: "Something went wrong" }),
      /* @__PURE__ */ t("p", { className: "cedros-error-boundary-message", children: "We encountered an unexpected error. Please try again." }),
      c && s && /* @__PURE__ */ i("details", { className: "cedros-error-boundary-details", children: [
        /* @__PURE__ */ t("summary", { children: "Error details" }),
        /* @__PURE__ */ i("pre", { children: [
          s.toString(),
          o?.componentStack
        ] })
      ] }),
      /* @__PURE__ */ t(
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
function Vh({ className: e = "", title: r = "Sign in to your account" }) {
  const { isModalOpen: s, closeModal: o } = re(), n = J(null), a = J(null), c = J(o);
  if (O(() => {
    c.current = o;
  }, [o]), O(() => {
    if (!s) return;
    a.current = document.activeElement, n.current?.focus();
    const l = (m) => {
      if (m.key === "Escape" && c.current(), m.key === "Tab" && n.current) {
        const u = n.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ), p = u[0], g = u[u.length - 1];
        m.shiftKey && document.activeElement === p ? (m.preventDefault(), g?.focus()) : !m.shiftKey && document.activeElement === g && (m.preventDefault(), p?.focus());
      }
    };
    document.addEventListener("keydown", l);
    const h = document.body.style.overflow;
    return document.body.style.overflow = "hidden", () => {
      document.removeEventListener("keydown", l), document.body.style.overflow = h, a.current instanceof HTMLElement && a.current.focus();
    };
  }, [s]), !s) return null;
  const d = (l) => {
    l.target === l.currentTarget && o();
  };
  return /* @__PURE__ */ t(
    "div",
    {
      className: `cedros-modal-backdrop ${e}`,
      onClick: d,
      role: "presentation",
      children: /* @__PURE__ */ i(
        "div",
        {
          ref: n,
          className: "cedros-modal",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "cedros-modal-title",
          tabIndex: -1,
          children: [
            /* @__PURE__ */ i("div", { className: "cedros-modal-header", children: [
              /* @__PURE__ */ t("h2", { id: "cedros-modal-title", className: "cedros-modal-title", children: r }),
              /* @__PURE__ */ t(
                "button",
                {
                  type: "button",
                  className: "cedros-modal-close",
                  onClick: o,
                  "aria-label": "Close",
                  children: /* @__PURE__ */ t("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ t(
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
            /* @__PURE__ */ t("div", { className: "cedros-modal-content", children: /* @__PURE__ */ t(Pc, { children: /* @__PURE__ */ t(Kr, { onSuccess: o }) }) })
          ]
        }
      )
    }
  );
}
function Ir({ org: e, size: r = "lg", className: s = "" }) {
  const o = _n(e.logoUrl), n = r === "lg" ? "cedros-org-avatar-lg" : "", a = ["cedros-org-avatar", n, s].filter(Boolean).join(" "), c = ["cedros-org-avatar-placeholder", n, s].filter(Boolean).join(" ");
  return o ? /* @__PURE__ */ t(
    "img",
    {
      src: o,
      alt: e.name,
      className: a,
      referrerPolicy: "no-referrer"
    }
  ) : /* @__PURE__ */ t("div", { className: c, children: e.name[0]?.toUpperCase() || "?" });
}
function Hh({
  orgs: e,
  activeOrg: r,
  isLoading: s = !1,
  onSelect: o,
  onCreateClick: n,
  className: a = "",
  placeholder: c = "Select organization"
}) {
  const [d, l] = k(!1), h = J(null);
  O(() => {
    const g = (w) => {
      h.current && !h.current.contains(w.target) && l(!1);
    };
    return document.addEventListener("mousedown", g), () => document.removeEventListener("mousedown", g);
  }, []), O(() => {
    const g = (w) => {
      w.key === "Escape" && l(!1);
    };
    if (d)
      return document.addEventListener("keydown", g), () => document.removeEventListener("keydown", g);
  }, [d]);
  const m = B(
    (g) => {
      o(g), l(!1);
    },
    [o]
  ), u = B(() => {
    l(!1), n?.();
  }, [n]), p = B(() => {
    l((g) => !g);
  }, []);
  return s ? /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-org-selector cedros-org-selector-loading ${a}`,
      "aria-busy": "true",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ t(Y, { size: "sm" }),
        /* @__PURE__ */ t("span", { children: "Loading..." })
      ]
    }
  ) : /* @__PURE__ */ i("div", { ref: h, className: `cedros-org-selector ${a}`, children: [
    /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: "cedros-org-selector-trigger",
        onClick: p,
        "aria-haspopup": "listbox",
        "aria-expanded": d,
        children: [
          r ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ t(Ir, { org: r, size: "sm" }),
            /* @__PURE__ */ t("span", { className: "cedros-org-selector-name", children: r.name }),
            /* @__PURE__ */ t(Ss, { role: r.membership.role })
          ] }) : /* @__PURE__ */ t("span", { className: "cedros-org-selector-placeholder", children: c }),
          /* @__PURE__ */ t(Bc, { isOpen: d })
        ]
      }
    ),
    d && /* @__PURE__ */ i("div", { className: "cedros-org-selector-dropdown", role: "listbox", children: [
      e.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-org-selector-empty", children: "No organizations" }) : /* @__PURE__ */ t("ul", { className: "cedros-org-selector-list", children: e.map((g) => /* @__PURE__ */ t("li", { children: /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-org-selector-item ${g.id === r?.id ? "cedros-org-selector-item-active" : ""}`,
          onClick: () => m(g.id),
          role: "option",
          "aria-selected": g.id === r?.id,
          children: [
            /* @__PURE__ */ t(Ir, { org: g, size: "sm" }),
            /* @__PURE__ */ t("span", { className: "cedros-org-selector-item-name", children: g.name }),
            /* @__PURE__ */ t(Ss, { role: g.membership.role }),
            g.id === r?.id && /* @__PURE__ */ t(Rc, {})
          ]
        }
      ) }, g.id)) }),
      n && /* @__PURE__ */ i(X, { children: [
        /* @__PURE__ */ t("div", { className: "cedros-org-selector-divider" }),
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-org-selector-create",
            onClick: u,
            children: [
              /* @__PURE__ */ t(Mc, {}),
              /* @__PURE__ */ t("span", { children: "Create organization" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function Ss({ role: e }) {
  return /* @__PURE__ */ t("span", { className: `cedros-org-role cedros-org-role-${e}`, children: e });
}
function Bc({ isOpen: e }) {
  return /* @__PURE__ */ t(
    "svg",
    {
      className: `cedros-org-chevron ${e ? "cedros-org-chevron-open" : ""}`,
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ t(
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
function Rc() {
  return /* @__PURE__ */ t(
    "svg",
    {
      className: "cedros-org-check",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ t(
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
function Mc() {
  return /* @__PURE__ */ t(
    "svg",
    {
      className: "cedros-org-plus",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ t(
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
function Ic() {
  return /* @__PURE__ */ t("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ t(
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
function Uc() {
  return /* @__PURE__ */ t(
    "svg",
    {
      className: "cedros-org-check",
      width: "20",
      height: "20",
      viewBox: "0 0 20 20",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ t(
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
function Dc() {
  return /* @__PURE__ */ t("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ t(
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
function Fc({
  orgs: e,
  activeOrg: r,
  isLoading: s,
  onSelect: o,
  onCreateClick: n
}) {
  return s ? /* @__PURE__ */ i("div", { className: "cedros-org-switcher-loading", children: [
    /* @__PURE__ */ t(Y, {}),
    /* @__PURE__ */ t("span", { children: "Loading organizations..." })
  ] }) : /* @__PURE__ */ i(X, { children: [
    e.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-org-switcher-empty", children: /* @__PURE__ */ t("p", { children: "You don't belong to any organizations yet." }) }) : /* @__PURE__ */ t("ul", { className: "cedros-org-switcher-list", children: e.map((a) => /* @__PURE__ */ t("li", { children: /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: `cedros-org-switcher-item ${a.id === r?.id ? "cedros-org-switcher-item-active" : ""}`,
        onClick: () => o(a.id),
        children: [
          /* @__PURE__ */ t(Ir, { org: a }),
          /* @__PURE__ */ i("div", { className: "cedros-org-switcher-item-content", children: [
            /* @__PURE__ */ t("span", { className: "cedros-org-switcher-item-name", children: a.name }),
            /* @__PURE__ */ i("span", { className: "cedros-org-switcher-item-slug", children: [
              "@",
              a.slug
            ] })
          ] }),
          /* @__PURE__ */ i("div", { className: "cedros-org-switcher-item-meta", children: [
            /* @__PURE__ */ t("span", { className: `cedros-org-role cedros-org-role-${a.membership.role}`, children: a.membership.role }),
            a.isPersonal && /* @__PURE__ */ t("span", { className: "cedros-org-personal-badge", children: "Personal" })
          ] }),
          a.id === r?.id && /* @__PURE__ */ t(Uc, {})
        ]
      }
    ) }, a.id)) }),
    n && /* @__PURE__ */ i("button", { type: "button", className: "cedros-org-switcher-create", onClick: n, children: [
      /* @__PURE__ */ t(Dc, {}),
      /* @__PURE__ */ t("span", { children: "Create new organization" })
    ] })
  ] });
}
function Oc({ isLoading: e, onSubmit: r, onCancel: s }) {
  const [o, n] = k(""), [a, c] = k(""), [d, l] = k(null), h = B((u) => {
    n(u);
    const p = u.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 50);
    c(p);
  }, []), m = B(
    async (u) => {
      if (u.preventDefault(), l(null), !o.trim()) {
        l("Organization name is required");
        return;
      }
      if (!a.trim()) {
        l("Organization slug is required");
        return;
      }
      try {
        await r({ name: o.trim(), slug: a.trim() });
      } catch (p) {
        l(p.message || "Failed to create organization");
      }
    },
    [o, a, r]
  );
  return /* @__PURE__ */ i("form", { className: "cedros-org-create-form", onSubmit: m, children: [
    d && /* @__PURE__ */ t(ne, { error: d }),
    /* @__PURE__ */ i("div", { className: "cedros-form-group", children: [
      /* @__PURE__ */ t("label", { htmlFor: "org-name", className: "cedros-form-label", children: "Organization Name" }),
      /* @__PURE__ */ t(
        "input",
        {
          id: "org-name",
          type: "text",
          className: "cedros-form-input",
          value: o,
          onChange: (u) => h(u.target.value),
          placeholder: "My Organization",
          maxLength: 255,
          disabled: e,
          autoFocus: !0
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-form-group", children: [
      /* @__PURE__ */ t("label", { htmlFor: "org-slug", className: "cedros-form-label", children: "URL Slug" }),
      /* @__PURE__ */ i("div", { className: "cedros-form-input-prefix", children: [
        /* @__PURE__ */ t("span", { className: "cedros-form-prefix", children: "@" }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "org-slug",
            type: "text",
            className: "cedros-form-input",
            value: a,
            onChange: (u) => c(u.target.value.toLowerCase()),
            placeholder: "my-organization",
            maxLength: 100,
            pattern: "[a-z0-9-]+",
            disabled: e
          }
        )
      ] }),
      /* @__PURE__ */ t("span", { className: "cedros-form-hint", children: "Only lowercase letters, numbers, and hyphens" })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline",
          onClick: s,
          disabled: e,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: e || !o.trim() || !a.trim(),
          children: e ? /* @__PURE__ */ t(Y, { size: "sm" }) : "Create Organization"
        }
      )
    ] })
  ] });
}
function Gh({
  isOpen: e,
  onClose: r,
  orgs: s,
  activeOrg: o,
  isLoading: n = !1,
  error: a,
  onSelect: c,
  onCreate: d,
  className: l = ""
}) {
  return e ? /* @__PURE__ */ t(
    Wc,
    {
      onClose: r,
      orgs: s,
      activeOrg: o,
      isLoading: n,
      error: a,
      onSelect: c,
      onCreate: d,
      className: l
    }
  ) : null;
}
function Wc({
  onClose: e,
  orgs: r,
  activeOrg: s,
  isLoading: o = !1,
  error: n,
  onSelect: a,
  onCreate: c,
  className: d
}) {
  const [l, h] = k("list"), m = J(null), u = J(null);
  O(() => (u.current = document.activeElement, m.current?.querySelector(".cedros-modal-close")?.focus(), () => {
    u.current?.focus();
  }), []), O(() => {
    const b = (x) => {
      if (x.key === "Escape") {
        e();
        return;
      }
      if (x.key === "Tab" && m.current) {
        const E = m.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ), N = E[0], C = E[E.length - 1];
        x.shiftKey ? document.activeElement === N && (x.preventDefault(), C?.focus()) : document.activeElement === C && (x.preventDefault(), N?.focus());
      }
    };
    return document.addEventListener("keydown", b), () => document.removeEventListener("keydown", b);
  }, [e]);
  const p = B(
    (b) => {
      b.target === b.currentTarget && e();
    },
    [e]
  ), g = B(
    (b) => {
      a(b), e();
    },
    [a, e]
  ), w = B(
    async (b) => {
      await c?.(b), e();
    },
    [c, e]
  );
  return /* @__PURE__ */ t("div", { className: "cedros-modal-backdrop", onClick: p, children: /* @__PURE__ */ i(
    "div",
    {
      ref: m,
      className: `cedros-modal cedros-org-switcher ${d}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "org-switcher-title",
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-modal-header", children: [
          /* @__PURE__ */ t("h2", { id: "org-switcher-title", className: "cedros-modal-title", children: l === "list" ? "Switch Organization" : "Create Organization" }),
          /* @__PURE__ */ t("button", { type: "button", className: "cedros-modal-close", onClick: e, "aria-label": "Close", children: /* @__PURE__ */ t(Ic, {}) })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-modal-body", children: [
          n && /* @__PURE__ */ t(ne, { error: n }),
          l === "list" ? /* @__PURE__ */ t(
            Fc,
            {
              orgs: r,
              activeOrg: s,
              isLoading: o,
              onSelect: g,
              onCreateClick: c ? () => h("create") : void 0
            }
          ) : /* @__PURE__ */ t(
            Oc,
            {
              isLoading: o,
              onSubmit: w,
              onCancel: () => h("list")
            }
          )
        ] })
      ]
    }
  ) });
}
function qc({
  sessions: e,
  isLoading: r = !1,
  error: s,
  onRevokeAll: o,
  className: n = ""
}) {
  const [a, c] = k(!1), [d, l] = k(!1), h = J(null), m = q(() => e.filter((p) => !p.isCurrent).length, [e]), u = B(async () => {
    if (!o) return;
    const p = e.filter((w) => !w.isCurrent).length;
    if (!(p === 0 || !window.confirm(
      `Are you sure you want to sign out of ${p} other device(s)? This will log you out everywhere except this browser.`
    ))) {
      c(!0), l(!1);
      try {
        await o(), l(!0), h.current !== null && window.clearTimeout(h.current), h.current = window.setTimeout(() => {
          l(!1), h.current = null;
        }, 3e3);
      } finally {
        c(!1);
      }
    }
  }, [o, e]);
  return O(() => () => {
    h.current !== null && (window.clearTimeout(h.current), h.current = null);
  }, []), r && e.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-session-list cedros-session-list-loading ${n}`, children: [
    /* @__PURE__ */ t(Y, {}),
    /* @__PURE__ */ t("span", { children: "Loading sessions..." })
  ] }) : s ? /* @__PURE__ */ t("div", { className: `cedros-session-list ${n}`, children: /* @__PURE__ */ t(ne, { error: s }) }) : e.length === 0 ? /* @__PURE__ */ t("div", { className: `cedros-session-list cedros-session-list-empty ${n}`, children: /* @__PURE__ */ t("p", { children: "No active sessions found." }) }) : /* @__PURE__ */ i("div", { className: `cedros-session-list ${n}`, children: [
    d && /* @__PURE__ */ i("div", { className: "cedros-session-success", role: "status", children: [
      /* @__PURE__ */ t(Gc, {}),
      /* @__PURE__ */ t("span", { children: "All other sessions have been revoked." })
    ] }),
    /* @__PURE__ */ t("ul", { className: "cedros-session-items", children: e.map((p) => /* @__PURE__ */ t(zc, { session: p }, p.id)) }),
    o && m > 0 && /* @__PURE__ */ t("div", { className: "cedros-session-actions", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: u,
        disabled: a,
        children: a ? /* @__PURE__ */ i(X, { children: [
          /* @__PURE__ */ t(Y, { size: "sm" }),
          /* @__PURE__ */ t("span", { children: "Signing out..." })
        ] }) : `Sign out of ${m} other device${m > 1 ? "s" : ""}`
      }
    ) })
  ] });
}
function zc({ session: e }) {
  const r = jc(e.userAgent), s = Vc(e.expiresAt);
  return /* @__PURE__ */ i("li", { className: `cedros-session-item ${e.isCurrent ? "cedros-session-item-current" : ""}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-session-item-icon", children: /* @__PURE__ */ t(Hc, { userAgent: e.userAgent }) }),
    /* @__PURE__ */ i("div", { className: "cedros-session-item-info", children: [
      /* @__PURE__ */ i("div", { className: "cedros-session-item-main", children: [
        /* @__PURE__ */ i("span", { className: "cedros-session-item-device", children: [
          r.browser,
          " on ",
          r.os
        ] }),
        e.isCurrent && /* @__PURE__ */ t("span", { className: "cedros-session-current-badge", children: "Current session" })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-session-item-meta", children: [
        e.ipAddress && /* @__PURE__ */ i("span", { className: "cedros-session-item-ip", children: [
          "IP: ",
          e.ipAddress
        ] }),
        /* @__PURE__ */ i("span", { className: "cedros-session-item-created", children: [
          "Started ",
          $c(e.createdAt)
        ] }),
        s && /* @__PURE__ */ t("span", { className: "cedros-session-expiring", children: "Expires soon" })
      ] })
    ] })
  ] });
}
function jc(e) {
  if (!e)
    return { browser: "Unknown browser", os: "Unknown device" };
  let r = "Unknown browser";
  e.includes("Chrome") && !e.includes("Edg") ? r = "Chrome" : e.includes("Safari") && !e.includes("Chrome") ? r = "Safari" : e.includes("Firefox") ? r = "Firefox" : e.includes("Edg") && (r = "Edge");
  let s = "Unknown device";
  return e.includes("Windows") ? s = "Windows" : e.includes("Mac") ? s = "macOS" : e.includes("Linux") ? s = "Linux" : e.includes("iPhone") || e.includes("iPad") ? s = "iOS" : e.includes("Android") && (s = "Android"), { browser: r, os: s };
}
function $c(e) {
  const r = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - r.getTime(), n = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), c = Math.floor(o / (1e3 * 60 * 60 * 24));
  return n < 1 ? "just now" : n < 60 ? `${n} minute${n > 1 ? "s" : ""} ago` : a < 24 ? `${a} hour${a > 1 ? "s" : ""} ago` : c < 7 ? `${c} day${c > 1 ? "s" : ""} ago` : r.toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function Vc(e) {
  const r = new Date(e), s = /* @__PURE__ */ new Date(), o = 3600 * 1e3;
  return r.getTime() - s.getTime() < o;
}
function Hc({ userAgent: e }) {
  return e?.includes("iPhone") || e?.includes("iPad") || e?.includes("Android") ? /* @__PURE__ */ i(
    "svg",
    {
      className: "cedros-session-device-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ t("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ t("circle", { cx: "12", cy: "18", r: "1", fill: "currentColor" })
      ]
    }
  ) : /* @__PURE__ */ i(
    "svg",
    {
      className: "cedros-session-device-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ t("rect", { x: "2", y: "4", width: "20", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ t("path", { d: "M8 21H16", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
        /* @__PURE__ */ t("path", { d: "M12 18V21", stroke: "currentColor", strokeWidth: "1.5" })
      ]
    }
  );
}
function Gc() {
  return /* @__PURE__ */ t(
    "svg",
    {
      className: "cedros-session-check",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ t(
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
function Qc({
  words: e,
  onConfirm: r,
  className: s = ""
}) {
  const [o, n] = k(!1), [a, c] = k(!1), d = J(null), l = xc(e), h = B(async () => {
    try {
      await navigator.clipboard.writeText(e.join(" ")), n(!0), d.current !== null && window.clearTimeout(d.current), d.current = window.setTimeout(() => n(!1), 2e3);
    } catch {
    }
  }, [e]);
  O(() => () => {
    d.current !== null && (window.clearTimeout(d.current), d.current = null);
  }, []);
  const m = B(() => {
    a && r();
  }, [a, r]);
  return /* @__PURE__ */ i("div", { className: `cedros-recovery-phrase-display ${s}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-recovery-header", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-recovery-title", children: "Recovery Phrase" }),
      /* @__PURE__ */ t("p", { className: "cedros-recovery-warning", children: "Write down these 12 words in order and store them securely. This is the only way to recover your wallet if you lose access." })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-recovery-grid", children: l.map((u, p) => /* @__PURE__ */ t("div", { className: "cedros-word-group", children: u.map((g, w) => {
      const b = p * 4 + w + 1;
      return /* @__PURE__ */ i("div", { className: "cedros-word-item", children: [
        /* @__PURE__ */ i("span", { className: "cedros-word-number", children: [
          b,
          "."
        ] }),
        /* @__PURE__ */ t("span", { className: "cedros-word-text", children: g })
      ] }, b);
    }) }, p)) }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-secondary cedros-copy-btn",
        onClick: h,
        children: o ? "Copied!" : "Copy to Clipboard"
      }
    ),
    /* @__PURE__ */ t("div", { className: "cedros-recovery-security", children: /* @__PURE__ */ i("div", { className: "cedros-warning-box", children: [
      /* @__PURE__ */ t(
        "svg",
        {
          className: "cedros-warning-icon",
          width: "20",
          height: "20",
          viewBox: "0 0 20 20",
          fill: "none",
          "aria-hidden": "true",
          children: /* @__PURE__ */ t(
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
      /* @__PURE__ */ i("div", { className: "cedros-warning-content", children: [
        /* @__PURE__ */ t("strong", { children: "Security Warning" }),
        /* @__PURE__ */ i("ul", { children: [
          /* @__PURE__ */ t("li", { children: "Never share this phrase with anyone" }),
          /* @__PURE__ */ t("li", { children: "Store it offline in a secure location" }),
          /* @__PURE__ */ t("li", { children: "Anyone with this phrase can access your wallet" }),
          /* @__PURE__ */ t("li", { children: "Cedros cannot recover this phrase for you" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ i("div", { className: "cedros-recovery-confirm", children: [
      /* @__PURE__ */ i("label", { className: "cedros-checkbox-label", children: [
        /* @__PURE__ */ t(
          "input",
          {
            type: "checkbox",
            checked: a,
            onChange: (u) => c(u.target.checked),
            className: "cedros-checkbox"
          }
        ),
        /* @__PURE__ */ t("span", { children: "I have written down and securely stored my recovery phrase" })
      ] }),
      /* @__PURE__ */ t(
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
function Yc({
  onSubmit: e,
  onCancel: r,
  isSubmitting: s = !1,
  error: o,
  className: n = ""
}) {
  const [a, c] = k(Array(be).fill("")), [d, l] = k(null), [h, m] = k([]), [u, p] = k(null), g = ta(), w = J(null), b = B(
    (f, v) => {
      const y = [...a];
      if (y[f] = v.toLowerCase().trim(), c(y), v.length > 0) {
        const A = Ec(v, 5);
        m(A);
      } else
        m([]);
      p(null);
    },
    [a]
  ), x = B((f) => {
    l(f), m([]);
  }, []), E = B(
    (f) => {
      const v = a[f];
      v && !ht(v) && p(`Word ${f + 1} is not in the wordlist`), w.current !== null && window.clearTimeout(w.current), w.current = window.setTimeout(() => {
        d === f && m([]);
      }, 200);
    },
    [a, d]
  );
  O(() => () => {
    w.current !== null && (window.clearTimeout(w.current), w.current = null);
  }, []);
  const N = B(
    (f) => {
      if (d !== null) {
        const v = [...a];
        v[d] = f, c(v), m([]), document.querySelector(
          `[data-word-index="${d + 1}"]`
        )?.focus();
      }
    },
    [d, a]
  ), C = B((f) => {
    const v = f.clipboardData.getData("text"), y = _c(v);
    y.length === be && (f.preventDefault(), c(y), p(null));
  }, []), _ = B(
    (f) => {
      if (f.preventDefault(), a.filter((A) => !A).length > 0) {
        p(`Please enter all ${be} words`);
        return;
      }
      const y = a.map((A, L) => ({ word: A, index: L + 1 })).filter(({ word: A }) => !ht(A));
      if (y.length > 0) {
        p(`Invalid words: ${y.map((A) => `#${A.index}`).join(", ")}`);
        return;
      }
      if (!ho(a)) {
        p("Invalid recovery phrase - please check your words");
        return;
      }
      e(a);
    },
    [a, e]
  ), T = o || u;
  return /* @__PURE__ */ i(
    "form",
    {
      className: `cedros-recovery-phrase-input ${n}`,
      onSubmit: _,
      onPaste: C,
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-recovery-input-header", children: [
          /* @__PURE__ */ t("h3", { className: "cedros-recovery-input-title", children: "Enter Recovery Phrase" }),
          /* @__PURE__ */ t("p", { className: "cedros-recovery-input-description", children: "Enter your 12-word recovery phrase. You can paste the entire phrase at once." })
        ] }),
        /* @__PURE__ */ t("div", { className: "cedros-word-inputs", children: Array.from({ length: be }, (f, v) => /* @__PURE__ */ i("div", { className: "cedros-word-input-wrapper", children: [
          /* @__PURE__ */ i("label", { className: "cedros-word-label", children: [
            v + 1,
            "."
          ] }),
          /* @__PURE__ */ t(
            "input",
            {
              type: "text",
              className: `cedros-word-input ${a[v] && !ht(a[v]) ? "cedros-word-invalid" : a[v] && ht(a[v]) ? "cedros-word-valid" : ""}`,
              value: a[v],
              onChange: (y) => b(v, y.target.value),
              onFocus: () => x(v),
              onBlur: () => E(v),
              "data-word-index": v,
              autoComplete: "off",
              autoCapitalize: "none",
              spellCheck: !1,
              disabled: s,
              "aria-label": `Word ${v + 1}`
            }
          )
        ] }, v)) }),
        d !== null && h.length > 0 && /* @__PURE__ */ t("div", { className: "cedros-suggestions", role: "listbox", id: `${g}-suggestions`, children: h.map((f) => /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-suggestion",
            onClick: () => N(f),
            role: "option",
            children: f
          },
          f
        )) }),
        T && /* @__PURE__ */ t("p", { className: "cedros-input-error", role: "alert", children: T }),
        /* @__PURE__ */ i("div", { className: "cedros-recovery-input-actions", children: [
          r && /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-secondary",
              onClick: r,
              disabled: s,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ t(
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
function Qh({ capabilities: e, className: r = "" }) {
  if (e.allSupported)
    return null;
  const s = Go(e), o = Qo();
  return /* @__PURE__ */ i("div", { className: `cedros-capability-warning ${r}`, role: "alert", children: [
    /* @__PURE__ */ i("div", { className: "cedros-warning-header", children: [
      /* @__PURE__ */ t(
        "svg",
        {
          className: "cedros-warning-icon",
          width: "24",
          height: "24",
          viewBox: "0 0 24 24",
          fill: "none",
          "aria-hidden": "true",
          children: /* @__PURE__ */ t(
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
      /* @__PURE__ */ t("h3", { className: "cedros-warning-title", children: "Wallet Feature Unavailable" })
    ] }),
    /* @__PURE__ */ t("p", { className: "cedros-warning-message", children: s }),
    /* @__PURE__ */ i("div", { className: "cedros-capability-details", children: [
      /* @__PURE__ */ t("h4", { children: "Browser Compatibility" }),
      /* @__PURE__ */ i("p", { children: [
        "Detected: ",
        o.browser,
        " ",
        o.version,
        o.likelySupported ? " (likely supported)" : " (may not be supported)"
      ] }),
      /* @__PURE__ */ t("h4", { children: "Required Features" }),
      /* @__PURE__ */ i("ul", { className: "cedros-capability-list", children: [
        /* @__PURE__ */ i("li", { className: e.webCrypto ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "Web Crypto API: ",
          e.webCrypto ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ i("li", { className: e.aesGcm ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "AES-GCM Encryption: ",
          e.aesGcm ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ i("li", { className: e.hkdf ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "HKDF Key Derivation: ",
          e.hkdf ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ i("li", { className: e.webAuthn ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "WebAuthn/Passkeys: ",
          e.webAuthn ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ i("li", { className: e.webAuthnPrf ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "WebAuthn PRF Extension: ",
          e.webAuthnPrf ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ i("li", { className: e.argon2 ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "Argon2 Password Hashing: ",
          e.argon2 ? "Available" : "Missing"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-capability-help", children: [
      /* @__PURE__ */ t("h4", { children: "Recommended Browsers" }),
      /* @__PURE__ */ i("ul", { children: [
        /* @__PURE__ */ t("li", { children: "Chrome 116+ on Windows, macOS, or Android" }),
        /* @__PURE__ */ t("li", { children: "Safari 17+ on macOS or iOS" }),
        /* @__PURE__ */ t("li", { children: "Edge 116+ on Windows" })
      ] }),
      /* @__PURE__ */ t("p", { className: "cedros-capability-note", children: "A platform authenticator (Touch ID, Face ID, or Windows Hello) is required." })
    ] })
  ] });
}
const Kc = ["share_c_only", "full_seed", "none"];
function Zc(e) {
  return e && Kc.includes(e) ? e : "share_c_only";
}
const Xc = {
  walletEnabled: !1,
  recoveryMode: "share_c_only",
  unlockTtlSeconds: 900,
  isLoading: !1,
  error: null,
  refetch: async () => {
  }
};
function mo() {
  const e = ze(), [r, s] = k(null), [o, n] = k(!!e), [a, c] = k(null), d = q(() => e ? new oe({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts
  }) : null, [e]), l = B(async () => {
    if (d) {
      n(!0), c(null);
      try {
        const h = await d.get("/discovery");
        h.wallet ? s({
          enabled: h.wallet.enabled,
          recoveryMode: Zc(h.wallet.recoveryMode),
          unlockTtlSeconds: h.wallet.unlockTtlSeconds
        }) : s({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } catch (h) {
        const m = h instanceof Error ? h.message : "Failed to fetch wallet config";
        c(m), s({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } finally {
        n(!1);
      }
    }
  }, [d]);
  return O(() => {
    d && l();
  }, [d, l]), e ? {
    walletEnabled: r?.enabled ?? !1,
    recoveryMode: r?.recoveryMode ?? "share_c_only",
    unlockTtlSeconds: r?.unlockTtlSeconds ?? 900,
    isLoading: o,
    error: a,
    refetch: l
  } : Xc;
}
function Jc() {
  const { user: e } = re(), { enroll: r } = Ke(), { recoveryMode: s } = mo(), [o, n] = k({ step: "idle" }), [a, c] = k(!1), d = J([]), l = B(() => {
    yn(...d.current), d.current = [];
  }, []);
  O(() => () => {
    l();
  }, [l]);
  const h = B(
    async (w, b, x, E) => {
      n({ step: "generating_seed" });
      const N = Yo();
      d.current.push(N), n({ step: "splitting_shares" });
      const { shareA: C, shareB: _, shareC: T } = so(N);
      d.current.push(C, _, T), n({ step: "encrypting_shares" });
      const f = await vn(C, An(b)), v = to(N), y = ro(v);
      n({ step: "uploading" });
      const A = {
        solanaPubkey: y,
        shareAAuthMethod: w,
        shareACiphertext: f.ciphertext,
        shareANonce: f.nonce,
        // Share B is now plaintext (SSS math protects it)
        shareB: Ee(_)
      };
      if (w === "password") {
        if (!x) throw new Error("KDF salt required for password method");
        A.shareAKdfSalt = Ee(x), A.shareAKdfParams = nt;
      }
      if (w === "passkey" && E && (A.prfSalt = E), await r(A), s === "none")
        l(), n({
          step: "complete",
          solanaPubkey: y
        });
      else {
        const L = s === "full_seed" ? kc(N) : Ac(qe(T));
        n({
          step: "showing_recovery",
          recoveryPhrase: L,
          solanaPubkey: y
        });
      }
    },
    [r, s, l]
  ), m = B(
    async (w) => {
      if (!e) {
        n({ step: "error", error: "User not authenticated" });
        return;
      }
      c(!0), l();
      try {
        const b = Nn(), x = await Rn(w, b, nt);
        d.current.push(x), await h("password", x, b);
      } catch (b) {
        n({
          step: "error",
          error: b instanceof Error ? b.message : "Enrollment failed"
        });
      } finally {
        c(!1);
      }
    },
    [e, l, h]
  ), u = B(async () => {
    if (!e) {
      n({ step: "error", error: "User not authenticated" });
      return;
    }
    c(!0), l();
    try {
      const w = kn(), b = Ee(w);
      n({ step: "encrypting_shares" });
      const E = (await Fr(b)).prfOutput;
      d.current.push(E);
      const N = await Cn(E, w);
      d.current.push(N), await h("passkey", N, void 0, b);
    } catch (w) {
      n({
        step: "error",
        error: w instanceof Error ? w.message : "Enrollment failed"
      });
    } finally {
      c(!1);
    }
  }, [e, l, h]), p = B(() => {
    const w = o.solanaPubkey;
    l(), n({
      step: "complete",
      solanaPubkey: w
    });
  }, [o.solanaPubkey, l]), g = B(() => {
    l(), n({ step: "idle" }), c(!1);
  }, [l]);
  return {
    state: o,
    startEnrollmentWithPassword: m,
    startEnrollmentWithPasskey: u,
    confirmRecoveryPhrase: p,
    cancel: g,
    isEnrolling: a
  };
}
function el() {
  const { config: e, _internal: r } = re(), [s, o] = k(!1), [n, a] = k(null), c = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, r?.getAccessToken]
  );
  return {
    setPassword: B(
      async (l) => {
        o(!0), a(null);
        try {
          await c.post("/set-password", { password: l });
        } catch (h) {
          const m = V(h, "Failed to set password");
          throw a(m), m;
        } finally {
          o(!1);
        }
      },
      [c]
    ),
    isLoading: s,
    error: n
  };
}
function tl(e) {
  return e.includes("email") ? "password" : e.includes("webauthn") ? "passkey" : "set-password";
}
function rl({
  onComplete: e,
  onCancel: r,
  className: s = ""
}) {
  const { user: o } = re(), {
    state: n,
    startEnrollmentWithPassword: a,
    startEnrollmentWithPasskey: c,
    confirmRecoveryPhrase: d,
    cancel: l,
    isEnrolling: h
  } = Jc(), { setPassword: m, isLoading: u } = el(), p = o ? tl(o.authMethods) : "password", [g, w] = k(""), [b, x] = k(""), [E, N] = k(null);
  O(() => {
    w(""), x(""), N(null);
  }, [o?.id]);
  const C = B(
    async (A) => {
      A.preventDefault(), N(null), await a(g);
    },
    [g, a]
  ), _ = B(
    async (A) => {
      if (A.preventDefault(), g !== b) {
        N("Passwords do not match");
        return;
      }
      const L = qr(g);
      if (!L.isValid) {
        const S = Object.values(L.errors)[0];
        N(S ?? "Password does not meet requirements");
        return;
      }
      N(null);
      try {
        await m(g), await a(g);
      } catch {
      }
    },
    [g, b, m, a]
  ), T = B(async () => {
    await c();
  }, [c]), f = B(() => {
    d(), n.solanaPubkey && e?.(n.solanaPubkey);
  }, [d, n.solanaPubkey, e]), v = B(() => {
    l(), r?.();
  }, [l, r]), y = h || u;
  return n.step === "generating_seed" || n.step === "splitting_shares" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ t("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ t("p", { children: "Generating secure wallet..." })
  ] }) }) : n.step === "encrypting_shares" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ t("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ t("p", { children: "Encrypting wallet shares..." })
  ] }) }) : n.step === "uploading" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ t("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ t("p", { children: "Saving wallet..." })
  ] }) }) : n.step === "showing_recovery" && n.recoveryPhrase ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ t(Qc, { words: n.recoveryPhrase, onConfirm: f }) }) : n.step === "complete" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-complete", children: [
    /* @__PURE__ */ i(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ t("circle", { cx: "24", cy: "24", r: "20", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ t(
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
    /* @__PURE__ */ t("h3", { children: "Wallet Created!" }),
    /* @__PURE__ */ i("p", { className: "cedros-pubkey", children: [
      /* @__PURE__ */ t("strong", { children: "Address:" }),
      " ",
      n.solanaPubkey
    ] }),
    /* @__PURE__ */ t("p", { children: "Your non-custodial Solana wallet is ready to use." })
  ] }) }) : n.step === "error" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-enrollment-error", children: [
    /* @__PURE__ */ i(
      "svg",
      {
        className: "cedros-error-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ t("circle", { cx: "24", cy: "24", r: "20", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ t(
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
    /* @__PURE__ */ t("h3", { children: "Enrollment Failed" }),
    /* @__PURE__ */ t("p", { className: "cedros-error-message", children: n.error }),
    /* @__PURE__ */ i("div", { className: "cedros-error-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: v,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: () => l(),
          children: "Try Again"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ i("div", { className: `cedros-wallet-enrollment ${s}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-enrollment-header", children: [
      /* @__PURE__ */ t("h2", { children: "Create Wallet" }),
      p === "password" && /* @__PURE__ */ t("p", { children: "Enter your account password to secure your wallet." }),
      p === "passkey" && /* @__PURE__ */ t("p", { children: "Authenticate with your passkey to secure your wallet." }),
      p === "set-password" && /* @__PURE__ */ t("p", { children: "Set a password for your account to secure your wallet." })
    ] }),
    p === "password" && /* @__PURE__ */ i("form", { onSubmit: C, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ t(
        ye,
        {
          label: "Account Password",
          value: g,
          onChange: (A) => w(A.target.value),
          disabled: y,
          required: !0,
          placeholder: "Enter your account password"
        }
      ),
      /* @__PURE__ */ i("div", { className: "cedros-enrollment-actions", children: [
        r && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: v,
            disabled: y,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: y || !g,
            children: y ? "Creating..." : "Continue"
          }
        )
      ] })
    ] }),
    p === "passkey" && /* @__PURE__ */ i("div", { className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ i("div", { className: "cedros-passkey-info", children: [
        /* @__PURE__ */ i(
          "svg",
          {
            className: "cedros-passkey-icon",
            width: "48",
            height: "48",
            viewBox: "0 0 48 48",
            fill: "none",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ t(
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
              /* @__PURE__ */ t("circle", { cx: "24", cy: "28", r: "4", stroke: "currentColor", strokeWidth: "2" }),
              /* @__PURE__ */ t("path", { d: "M24 32v4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
            ]
          }
        ),
        /* @__PURE__ */ t("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-enrollment-actions", children: [
        r && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: v,
            disabled: y,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: T,
            disabled: y,
            children: y ? "Creating..." : "Use Passkey"
          }
        )
      ] })
    ] }),
    p === "set-password" && /* @__PURE__ */ i("form", { onSubmit: _, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ t(
        ye,
        {
          label: "New Password",
          value: g,
          onChange: (A) => w(A.target.value),
          showStrengthMeter: !0,
          disabled: y,
          required: !0,
          minLength: 8,
          placeholder: "Choose a strong password"
        }
      ),
      /* @__PURE__ */ t(
        ye,
        {
          label: "Confirm Password",
          value: b,
          onChange: (A) => x(A.target.value),
          error: E ?? void 0,
          disabled: y,
          required: !0,
          minLength: 8,
          placeholder: "Confirm your password"
        }
      ),
      /* @__PURE__ */ t("div", { className: "cedros-password-info", children: /* @__PURE__ */ t("p", { children: "This password will also be used to sign transactions." }) }),
      /* @__PURE__ */ i("div", { className: "cedros-enrollment-actions", children: [
        r && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: v,
            disabled: y,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: y || !g || !b,
            children: y ? "Creating..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function sl() {
  const { user: e } = re(), { signTransaction: r } = Ke(), [s, o] = k(!1), [n, a] = k(null), c = B(
    async (l, h) => {
      if (!e) {
        const m = "User not authenticated";
        throw a(m), new Error(m);
      }
      o(!0), a(null);
      try {
        const m = {
          transaction: Ee(l),
          ...h ? { credential: Ko(h) } : {}
        }, u = await r(m);
        return En(u.signature);
      } catch (m) {
        const u = m instanceof Error ? m.message : "Signing failed";
        throw a(u), m;
      } finally {
        o(!1);
      }
    },
    [e, r]
  ), d = B(() => a(null), []);
  return {
    signTransaction: c,
    isSigning: s,
    error: n,
    clearError: d
  };
}
function nl() {
  const { getMaterial: e } = Ke(), [r, s] = k(!1), [o, n] = k(null), a = B(async () => {
    s(!0), n(null);
    try {
      const d = await e();
      if (!d)
        throw new Error("No wallet enrolled");
      if (d.shareAAuthMethod !== "passkey")
        throw new Error("Wallet is not configured for passkey authentication");
      if (!d.prfSalt)
        throw new Error("No PRF salt configured for wallet");
      const l = await Fr(d.prfSalt);
      try {
        return {
          type: "prfOutput",
          prfOutput: Ee(l.prfOutput)
        };
      } finally {
        l.prfOutput.fill(0);
      }
    } catch (d) {
      const l = d instanceof Error ? d.message : "Passkey authentication failed";
      return n(l), null;
    } finally {
      s(!1);
    }
  }, [e]), c = B(() => n(null), []);
  return {
    getPasskeyCredential: a,
    isAuthenticating: r,
    error: o,
    clearError: c
  };
}
function ol({
  mode: e,
  isLoading: r = !1,
  error: s,
  onPrompt: o,
  onRetry: n,
  onCancel: a,
  title: c,
  description: d,
  className: l = ""
}) {
  const h = B(() => {
    r || o?.();
  }, [r, o]), m = B(() => {
    n?.();
  }, [n]), u = e === "register" ? "Set Up Passkey" : "Verify with Passkey", p = e === "register" ? "Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN." : "Use your passkey to unlock your wallet. You will be prompted for biometric verification.";
  return /* @__PURE__ */ i("div", { className: `cedros-passkey-prompt ${l}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-passkey-icon", children: r ? /* @__PURE__ */ t(il, {}) : s ? /* @__PURE__ */ t(cl, {}) : /* @__PURE__ */ t(al, {}) }),
    /* @__PURE__ */ t("h3", { className: "cedros-passkey-title", children: c ?? u }),
    /* @__PURE__ */ t("p", { className: "cedros-passkey-description", children: d ?? p }),
    s && /* @__PURE__ */ t("div", { className: "cedros-passkey-error", role: "alert", children: /* @__PURE__ */ t("p", { children: s }) }),
    /* @__PURE__ */ t("div", { className: "cedros-passkey-actions", children: s ? /* @__PURE__ */ i(X, { children: [
      n && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: m,
          children: "Try Again"
        }
      ),
      a && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: a,
          children: "Cancel"
        }
      )
    ] }) : /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: h,
          disabled: r,
          children: r ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ t("span", { className: "cedros-button-spinner", "aria-hidden": "true" }),
            "Waiting for passkey..."
          ] }) : e === "register" ? "Create Passkey" : "Use Passkey"
        }
      ),
      a && !r && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: a,
          children: "Cancel"
        }
      )
    ] }) }),
    r && /* @__PURE__ */ i("p", { className: "cedros-passkey-hint", children: [
      "Follow the prompts on your device to ",
      e === "register" ? "create" : "verify",
      " your passkey."
    ] })
  ] });
}
function al() {
  return /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" }),
        /* @__PURE__ */ t("path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88" }),
        /* @__PURE__ */ t("path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02" }),
        /* @__PURE__ */ t("path", { d: "M2 12a10 10 0 0 1 18-6" }),
        /* @__PURE__ */ t("path", { d: "M2 16h.01" }),
        /* @__PURE__ */ t("path", { d: "M21.8 16c.2-2 .131-5.354 0-6" }),
        /* @__PURE__ */ t("path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" }),
        /* @__PURE__ */ t("path", { d: "M8.65 22c.21-.66.45-1.32.57-2" }),
        /* @__PURE__ */ t("path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2" })
      ]
    }
  );
}
function il() {
  return /* @__PURE__ */ i("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
    /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
    /* @__PURE__ */ t("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function cl() {
  return /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ t("path", { d: "M12 8v4M12 16h.01" })
      ]
    }
  );
}
function ll({
  onUnlock: e,
  onCancel: r,
  showCancel: s = !0,
  authMethod: o,
  className: n = ""
}) {
  re();
  const { unlock: a, getMaterial: c, isLoading: d } = Ke(), { getPasskeyCredential: l, isAuthenticating: h } = nl(), [m, u] = k("idle"), [p, g] = k(o ?? null), [w, b] = k(""), [x, E] = k(null);
  O(() => {
    o !== void 0 && g(o);
  }, [o]);
  const N = p === "password", C = p === "passkey", _ = B(async () => {
    if (u("credential"), E(null), !p)
      try {
        const S = await c();
        S ? g(S.shareAAuthMethod) : (E("No wallet enrolled"), u("error"));
      } catch (S) {
        E(S instanceof Error ? S.message : "Failed to get wallet info"), u("error");
      }
  }, [p, c]), T = B(
    async (S) => {
      S.preventDefault(), E(null), u("unlocking");
      try {
        let R;
        if (N)
          R = { type: "password", password: w };
        else
          throw new Error("Invalid auth method");
        await a(R), u("unlocked"), e?.();
      } catch (R) {
        E(R instanceof Error ? R.message : "Failed to unlock wallet"), u("error");
      }
    },
    [N, w, a, e]
  ), f = B(async () => {
    E(null), u("unlocking");
    try {
      const S = await l();
      if (!S) {
        u("credential");
        return;
      }
      await a(S), u("unlocked"), e?.();
    } catch (S) {
      E(S instanceof Error ? S.message : "Failed to unlock wallet"), u("error");
    }
  }, [l, a, e]), v = B(() => {
    b(""), u("idle"), E(null), r?.();
  }, [r]), y = B(() => {
    b(""), u("credential"), E(null);
  }, []), A = d || h, L = () => {
    switch (m) {
      case "idle":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-idle", children: [
          /* @__PURE__ */ t("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ t(dl, {}) }),
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Locked" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: "Unlock your wallet to sign transactions." }),
          /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-primary",
              onClick: _,
              children: "Unlock Wallet"
            }
          )
        ] });
      case "credential":
        return N ? /* @__PURE__ */ i("form", { className: "cedros-wallet-unlock-form", onSubmit: T, children: [
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Enter Password" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: "Enter your wallet password to unlock." }),
          /* @__PURE__ */ t(
            ye,
            {
              label: "Password",
              value: w,
              onChange: (S) => b(S.target.value),
              disabled: A,
              autoComplete: "current-password",
              error: x ?? void 0
            }
          ),
          /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ t(
              "button",
              {
                type: "submit",
                className: "cedros-button cedros-button-primary",
                disabled: A || w.length === 0,
                children: A ? "Unlocking..." : "Unlock"
              }
            ),
            s && /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: v,
                disabled: A,
                children: "Cancel"
              }
            )
          ] })
        ] }) : C ? /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-passkey", children: [
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Verify with Passkey" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: "Use your passkey to unlock your wallet." }),
          /* @__PURE__ */ t(
            ol,
            {
              mode: "authenticate",
              isLoading: A,
              error: x ?? void 0,
              onPrompt: f,
              onRetry: f,
              onCancel: s ? v : void 0
            }
          )
        ] }) : /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-loading", children: [
          /* @__PURE__ */ t(Y, { size: "xl" }),
          /* @__PURE__ */ t("p", { children: "Loading wallet info..." })
        ] });
      case "unlocking":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-progress", children: [
          /* @__PURE__ */ t("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ t(Y, { size: "xl" }) }),
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Unlocking Wallet" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: "Verifying your credentials..." })
        ] });
      case "unlocked":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-success", children: [
          /* @__PURE__ */ t("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ t(ul, {}) }),
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Unlocked" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: "Your wallet is ready to sign transactions." })
        ] });
      case "error":
        return /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-error", children: [
          /* @__PURE__ */ t("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ t(hl, {}) }),
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Unlock Failed" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: x ?? "Failed to unlock wallet. Please try again." }),
          /* @__PURE__ */ i("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary",
                onClick: y,
                children: "Try Again"
              }
            ),
            s && /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: v,
                children: "Cancel"
              }
            )
          ] })
        ] });
    }
  };
  return /* @__PURE__ */ t("div", { className: `cedros-wallet-unlock ${n}`, children: L() });
}
function dl() {
  return /* @__PURE__ */ i("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ t(
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
    /* @__PURE__ */ t("path", { d: "M16 22V16a8 8 0 1 1 16 0v6", stroke: "currentColor", strokeWidth: "2", fill: "none" }),
    /* @__PURE__ */ t("circle", { cx: "24", cy: "32", r: "3", fill: "currentColor" })
  ] });
}
function ul() {
  return /* @__PURE__ */ i("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ t(
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
    /* @__PURE__ */ t(
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
function hl() {
  return /* @__PURE__ */ i("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ t(
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
    /* @__PURE__ */ t(
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
function ml() {
  const { recover: e, getShareBForRecovery: r } = Ke(), { recoveryMode: s } = mo(), [o, n] = k({ step: "idle" }), [a, c] = k(!1), d = J([]), l = B(() => {
    yn(...d.current), d.current = [];
  }, []);
  O(() => () => {
    l();
  }, [l]);
  const h = B(
    async (u, p, g) => {
      c(!0), l();
      try {
        if (n({ step: "validating" }), !ho(u))
          throw new Error("Invalid recovery phrase. Please check your words.");
        let w;
        if (s === "share_c_only") {
          const y = Nc(u);
          d.current.push(y);
          const A = Ee(y), L = await r({ shareC: A }), S = En(L.shareB);
          d.current.push(S), w = cc(qe(S), qe(y)), d.current.push(w);
        } else
          w = Cc(u), d.current.push(w);
        const b = to(w), x = ro(b), { shareA: E, shareB: N } = so(w);
        d.current.push(E, N), n({ step: "encrypting" });
        let C, _, T;
        if (p === "passkey") {
          const y = kn();
          T = Ee(y);
          const A = await Fr(T);
          d.current.push(A.prfOutput), C = await Cn(A.prfOutput, y), d.current.push(C);
        } else
          _ = Nn(), C = await Rn(g, _, nt), d.current.push(C);
        const f = await vn(E, An(C));
        n({ step: "uploading" });
        const v = {
          solanaPubkey: x,
          shareAAuthMethod: p,
          shareACiphertext: f.ciphertext,
          shareANonce: f.nonce,
          shareB: Ee(N)
        };
        p === "password" && (v.shareAKdfSalt = Ee(_), v.shareAKdfParams = nt), p === "passkey" && (v.prfSalt = T), await e(v), l(), n({ step: "complete" });
      } catch (w) {
        l(), n({
          step: "error",
          error: w instanceof Error ? w.message : "Recovery failed"
        });
      } finally {
        c(!1);
      }
    },
    [e, r, s, l]
  ), m = B(() => {
    l(), n({ step: "idle" }), c(!1);
  }, [l]);
  return {
    state: o,
    startRecovery: h,
    cancel: m,
    isRecovering: a
  };
}
function fl({
  onComplete: e,
  onCancel: r,
  className: s = "",
  defaultAuthMethod: o = "password"
}) {
  const { state: n, startRecovery: a, cancel: c, isRecovering: d } = ml(), [l, h] = k([]), [m, u] = k(!1), [p, g] = k(o), [w, b] = k(""), [x, E] = k(""), [N, C] = k(null), _ = B((A) => {
    h(A), u(!0);
  }, []), T = B(
    async (A) => {
      if (A.preventDefault(), C(null), p !== "passkey") {
        if (w !== x) {
          C("Passwords do not match");
          return;
        }
        if (p === "password" && w.length < 8) {
          C("Password must be at least 8 characters");
          return;
        }
      }
      await a(l, p, w);
    },
    [l, p, w, x, a]
  ), f = B(() => {
    c(), h([]), u(!1), b(""), E(""), r?.();
  }, [c, r]), v = B(() => {
    u(!1), b(""), E("");
  }, []), y = B(() => {
    e?.();
  }, [e]);
  return n.step === "validating" || n.step === "encrypting" || n.step === "uploading" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-progress", children: [
    /* @__PURE__ */ t("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ t(pl, {}) }),
    /* @__PURE__ */ i("h3", { className: "cedros-wallet-recovery-title", children: [
      n.step === "validating" && "Validating Recovery Phrase",
      n.step === "encrypting" && "Encrypting Wallet",
      n.step === "uploading" && "Saving to Server"
    ] }),
    /* @__PURE__ */ i("p", { className: "cedros-wallet-recovery-description", children: [
      n.step === "validating" && "Checking your recovery phrase...",
      n.step === "encrypting" && "Securing your wallet with new encryption...",
      n.step === "uploading" && "Uploading encrypted wallet data..."
    ] })
  ] }) }) : n.step === "complete" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-success", children: [
    /* @__PURE__ */ t("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ t(gl, {}) }),
    /* @__PURE__ */ t("h3", { className: "cedros-wallet-recovery-title", children: "Wallet Recovered" }),
    /* @__PURE__ */ i("p", { className: "cedros-wallet-recovery-description", children: [
      "Your wallet has been successfully recovered and secured with your new",
      " ",
      p === "passkey" ? "passkey" : "password",
      "."
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: y,
        children: "Done"
      }
    ) })
  ] }) }) : n.step === "error" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-error", children: [
    /* @__PURE__ */ t("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ t(wl, {}) }),
    /* @__PURE__ */ t("h3", { className: "cedros-wallet-recovery-title", children: "Recovery Failed" }),
    /* @__PURE__ */ t("p", { className: "cedros-wallet-recovery-description", children: n.error ?? "An error occurred during recovery. Please try again." }),
    /* @__PURE__ */ t("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: f,
        children: "Start Over"
      }
    ) })
  ] }) }) : m ? /* @__PURE__ */ t("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ i("form", { className: "cedros-wallet-recovery-credential", onSubmit: T, children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-wallet-recovery-title", children: "Set New Security" }),
      /* @__PURE__ */ t("p", { className: "cedros-wallet-recovery-description", children: "Choose how to secure your recovered wallet." })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-auth-method-selector", children: [
      /* @__PURE__ */ i("label", { className: "cedros-radio-label", children: [
        /* @__PURE__ */ t(
          "input",
          {
            type: "radio",
            name: "authMethod",
            value: "password",
            checked: p === "password",
            onChange: () => g("password"),
            disabled: d
          }
        ),
        /* @__PURE__ */ t("span", { children: "Password" })
      ] }),
      /* @__PURE__ */ i("label", { className: "cedros-radio-label", children: [
        /* @__PURE__ */ t(
          "input",
          {
            type: "radio",
            name: "authMethod",
            value: "passkey",
            checked: p === "passkey",
            onChange: () => g("passkey"),
            disabled: d
          }
        ),
        /* @__PURE__ */ t("span", { children: "Passkey" })
      ] })
    ] }),
    p === "password" && /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ t("label", { htmlFor: "recovery-password", className: "cedros-label", children: "New Password" }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "recovery-password",
            type: "password",
            className: "cedros-input",
            value: w,
            onChange: (A) => b(A.target.value),
            disabled: d,
            minLength: 8,
            placeholder: "Enter a strong password"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ t("label", { htmlFor: "recovery-password-confirm", className: "cedros-label", children: "Confirm Password" }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "recovery-password-confirm",
            type: "password",
            className: "cedros-input",
            value: x,
            onChange: (A) => E(A.target.value),
            disabled: d,
            "aria-invalid": N ? "true" : void 0,
            placeholder: "Confirm your password"
          }
        ),
        N && /* @__PURE__ */ t("p", { className: "cedros-input-error", role: "alert", children: N })
      ] })
    ] }),
    p === "passkey" && /* @__PURE__ */ i("div", { className: "cedros-passkey-info", children: [
      /* @__PURE__ */ t(bl, {}),
      /* @__PURE__ */ t("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: v,
          disabled: d,
          children: "Back"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: d || p !== "passkey" && (w.length === 0 || x.length === 0),
          children: d ? "Recovering..." : "Recover Wallet"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ t("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-phrase", children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-wallet-recovery-title", children: "Recover Your Wallet" }),
      /* @__PURE__ */ t("p", { className: "cedros-wallet-recovery-description", children: "Enter your 12-word recovery phrase to restore your wallet." })
    ] }),
    /* @__PURE__ */ t(
      Yc,
      {
        onSubmit: _,
        onCancel: f,
        isSubmitting: !1
      }
    )
  ] }) });
}
function pl() {
  return /* @__PURE__ */ i(
    "svg",
    {
      width: "48",
      height: "48",
      viewBox: "0 0 48 48",
      fill: "none",
      "aria-hidden": "true",
      className: "cedros-spinner",
      children: [
        /* @__PURE__ */ t(
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
        /* @__PURE__ */ t(
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
function gl() {
  return /* @__PURE__ */ i("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ t(
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
    /* @__PURE__ */ t(
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
function wl() {
  return /* @__PURE__ */ i("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ t(
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
    /* @__PURE__ */ t(
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
function bl() {
  return /* @__PURE__ */ i(
    "svg",
    {
      className: "cedros-passkey-icon",
      width: "48",
      height: "48",
      viewBox: "0 0 48 48",
      fill: "none",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ t("rect", { x: "8", y: "16", width: "32", height: "24", rx: "4", stroke: "currentColor", strokeWidth: "2" }),
        /* @__PURE__ */ t("circle", { cx: "24", cy: "28", r: "4", stroke: "currentColor", strokeWidth: "2" }),
        /* @__PURE__ */ t("path", { d: "M24 32v4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
      ]
    }
  );
}
function yl({
  address: e,
  label: r = "Wallet Address",
  showCopy: s = !0,
  showExplorerLink: o = !0,
  allowReveal: n = !0,
  className: a = ""
}) {
  const c = ze(), [d, l] = k(!1), [h, m] = k(null), [u, p] = k(!1), g = J(null), w = c?.config.solana?.network ?? "mainnet-beta", b = q(() => {
    const C = `https://explorer.solana.com/address/${e}`;
    return w === "mainnet-beta" ? C : `${C}?cluster=${encodeURIComponent(w)}`;
  }, [e, w]), x = n && e.length > 18, E = q(() => !x || u ? e : `${e.slice(0, 8)}...${e.slice(-8)}`, [e, x, u]), N = B(async () => {
    try {
      m(null), await navigator.clipboard.writeText(e), l(!0), g.current !== null && window.clearTimeout(g.current), g.current = window.setTimeout(() => {
        l(!1), g.current = null;
      }, 2e3);
    } catch (C) {
      l(!1), m(C instanceof Error ? C.message : "Copy failed");
    }
  }, [e]);
  return O(() => () => {
    g.current !== null && (window.clearTimeout(g.current), g.current = null);
  }, []), /* @__PURE__ */ i("div", { className: `cedros-wallet-address-row ${a}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-address-row-header", children: [
      /* @__PURE__ */ t("span", { className: "cedros-wallet-status-pubkey-label", children: r }),
      /* @__PURE__ */ i("div", { className: "cedros-wallet-address-row-actions", children: [
        x && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-ghost",
            onClick: () => p((C) => !C),
            "aria-label": u ? "Hide full wallet address" : "Show full wallet address",
            children: u ? /* @__PURE__ */ i("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
              /* @__PURE__ */ t(
                "path",
                {
                  d: "M3 3l18 18",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ t(
                "path",
                {
                  d: "M10.7 10.7a3 3 0 0 0 4.24 4.24",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ t(
                "path",
                {
                  d: "M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7-0.55 1.23-1.32 2.33-2.27 3.25",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ t(
                "path",
                {
                  d: "M6.61 6.61C4.4 7.9 2.74 9.8 1 12c1.73 3.89 6 7 11 7 1.14 0 2.25-0.16 3.3-0.46",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            ] }) : /* @__PURE__ */ i("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
              /* @__PURE__ */ t(
                "path",
                {
                  d: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              /* @__PURE__ */ t(
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
        o && /* @__PURE__ */ t(
          "a",
          {
            className: "cedros-button cedros-button-sm cedros-button-ghost",
            href: b,
            target: "_blank",
            rel: "noreferrer",
            children: "Explorer"
          }
        ),
        s && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-outline",
            onClick: N,
            "aria-label": "Copy wallet address",
            children: d ? "Copied" : "Copy"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ t("code", { className: "cedros-wallet-status-pubkey-value", title: e, children: E }),
    h && /* @__PURE__ */ t("p", { className: "cedros-input-hint", role: "status", children: h })
  ] });
}
function vl({
  status: e,
  publicKey: r,
  onLock: s,
  onEnroll: o,
  onUnlock: n,
  onRecover: a,
  showActions: c = !0,
  compact: d = !1,
  className: l = ""
}) {
  const h = e !== void 0, m = Pt(), u = h ? e : m.status, p = h ? r ?? null : m.solanaPubkey, g = h ? null : m.error, w = h ? () => {
  } : m.refresh, b = h ? () => {
  } : m.clearError, x = Al(u, g);
  return d ? /* @__PURE__ */ i("div", { className: `cedros-wallet-status cedros-wallet-status-compact ${l}`, children: [
    /* @__PURE__ */ t(
      "span",
      {
        className: `cedros-wallet-status-dot cedros-wallet-status-${x.color}`,
        title: x.label
      }
    ),
    /* @__PURE__ */ t("span", { className: "cedros-wallet-status-label", children: x.label }),
    p && /* @__PURE__ */ t("span", { className: "cedros-wallet-status-pubkey", title: p, children: Nl(p) })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-wallet-status ${l}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-wallet-status-header", children: [
      /* @__PURE__ */ t(
        "div",
        {
          className: `cedros-wallet-status-icon cedros-wallet-status-icon-${x.color}`,
          children: /* @__PURE__ */ t(kl, { status: u })
        }
      ),
      /* @__PURE__ */ i("div", { className: "cedros-wallet-status-info", children: [
        /* @__PURE__ */ t("h4", { className: "cedros-wallet-status-title", children: x.title }),
        /* @__PURE__ */ t("p", { className: "cedros-wallet-status-description", children: x.description })
      ] })
    ] }),
    p && /* @__PURE__ */ t("div", { className: "cedros-wallet-status-pubkey-full", children: /* @__PURE__ */ t(yl, { address: p }) }),
    g && /* @__PURE__ */ i("div", { className: "cedros-wallet-status-error-box", role: "alert", children: [
      /* @__PURE__ */ t("p", { children: g }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-secondary",
          onClick: b,
          children: "Dismiss"
        }
      )
    ] }),
    c && /* @__PURE__ */ i("div", { className: "cedros-wallet-status-actions", children: [
      u === "not_enrolled" && o && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: o,
          children: "Create Wallet"
        }
      ),
      u === "enrolled_locked" && n && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: n,
          children: "Unlock Wallet"
        }
      ),
      (u === "not_enrolled" || u === "error") && a && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: a,
          children: "Recover Wallet"
        }
      ),
      u === "error" && /* @__PURE__ */ t(
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
function Al(e, r) {
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
        description: r ?? "An error occurred with your wallet.",
        color: "error"
      };
  }
}
function Nl(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function kl({ status: e }) {
  switch (e) {
    case "loading":
      return /* @__PURE__ */ i("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
        /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
        /* @__PURE__ */ t(
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
      return /* @__PURE__ */ i(
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
            /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ t("path", { d: "M8 12h8M12 8v8" })
          ]
        }
      );
    case "enrolled_locked":
      return /* @__PURE__ */ i(
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
            /* @__PURE__ */ t("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
            /* @__PURE__ */ t("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
          ]
        }
      );
    case "enrolled_unlocked":
    case "unlocked":
      return /* @__PURE__ */ t(
        "svg",
        {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2.5",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true",
          children: /* @__PURE__ */ t("path", { d: "M20 6L9 17l-5-5" })
        }
      );
    case "error":
      return /* @__PURE__ */ i(
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
            /* @__PURE__ */ t("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }),
            /* @__PURE__ */ t("path", { d: "M12 9v4M12 17h.01" })
          ]
        }
      );
    default:
      return null;
  }
}
function Yh({ className: e = "", showActions: r = !0 }) {
  const s = Pt(), [o, n] = k("status"), a = q(() => {
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
  }, [o]), c = B(() => n("status"), []), d = B(async () => {
    n("status"), await s.refresh();
  }, [s]), l = B(async () => {
    n("status"), await s.refresh();
  }, [s]), h = B(async () => {
    n("status"), await s.refresh();
  }, [s]);
  return /* @__PURE__ */ i("div", { className: `cedros-wallet-manager ${e}`, children: [
    o !== "status" && a && /* @__PURE__ */ i("div", { className: "cedros-wallet-manager-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-wallet-manager-header-text", children: [
        /* @__PURE__ */ t("h3", { className: "cedros-wallet-manager-title", children: a.title }),
        /* @__PURE__ */ t("p", { className: "cedros-wallet-manager-subtitle", children: a.description })
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-ghost",
          onClick: c,
          children: "Back"
        }
      )
    ] }),
    o === "status" && /* @__PURE__ */ t(
      vl,
      {
        onEnroll: () => n("enroll"),
        onUnlock: () => n("unlock"),
        onRecover: () => n("recover_intro"),
        showActions: r
      }
    ),
    o === "enroll" && /* @__PURE__ */ t(
      rl,
      {
        onComplete: () => {
          d();
        },
        onCancel: c
      }
    ),
    o === "unlock" && /* @__PURE__ */ t(
      ll,
      {
        onUnlock: () => {
          l();
        },
        onCancel: c
      }
    ),
    o === "recover_intro" && /* @__PURE__ */ t("div", { className: "cedros-wallet-manager-intro", children: /* @__PURE__ */ i("div", { className: "cedros-wallet-manager-intro-card", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-wallet-manager-intro-title", children: "Before you start" }),
      /* @__PURE__ */ i("ul", { className: "cedros-wallet-manager-intro-list", children: [
        /* @__PURE__ */ t("li", { children: "You’ll need your 12-word recovery phrase." }),
        /* @__PURE__ */ t("li", { children: "You’ll set a new password or passkey for this wallet." }),
        /* @__PURE__ */ t("li", { children: "If you’re on a shared device, avoid copying the phrase into other apps." })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-wallet-manager-intro-actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: () => n("recover"),
            children: "Start recovery"
          }
        ),
        /* @__PURE__ */ t(
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
    o === "recover" && /* @__PURE__ */ t(
      fl,
      {
        onComplete: () => {
          h();
        },
        onCancel: c
      }
    )
  ] });
}
function Kh({
  showDescriptions: e = !0,
  className: r = "",
  onSave: s
}) {
  const { settings: o, isLoading: n, isUpdating: a, error: c, fetchSettings: d, updateSettings: l } = Ln(), [h, m] = k({}), [u, p] = k(null), [g, w] = k(!1);
  O(() => {
    d();
  }, [d]), O(() => {
    if (g) {
      const T = setTimeout(() => w(!1), 3e3);
      return () => clearTimeout(T);
    }
  }, [g]);
  const b = B((T, f) => {
    m((v) => ({ ...v, [T]: f })), p(null), w(!1);
  }, []), x = B(async () => {
    const T = Object.entries(h).map(([f, v]) => ({
      key: f,
      value: v
    }));
    if (T.length !== 0)
      try {
        await l(T), m({}), p(null), w(!0), s?.();
      } catch (f) {
        p(f instanceof Error ? f.message : "Failed to save settings");
      }
  }, [h, l, s]), E = B(() => {
    m({}), p(null), w(!1);
  }, []), N = Object.keys(h).length > 0, C = Object.keys(h).length;
  if (n && Object.keys(o).length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-system-settings cedros-system-settings-loading ${r}`, children: [
      /* @__PURE__ */ t(Y, {}),
      /* @__PURE__ */ t("span", { children: "Loading settings..." })
    ] });
  if (c)
    return /* @__PURE__ */ t("div", { className: `cedros-system-settings ${r}`, children: /* @__PURE__ */ t(ne, { error: c.message }) });
  const _ = Object.keys(o).sort();
  return _.length === 0 ? /* @__PURE__ */ t("div", { className: `cedros-system-settings cedros-system-settings-empty ${r}`, children: /* @__PURE__ */ t("p", { children: "No system settings found." }) }) : /* @__PURE__ */ i("div", { className: `cedros-system-settings ${r}`, children: [
    u && /* @__PURE__ */ t(ne, { error: u }),
    g && /* @__PURE__ */ t("div", { className: "cedros-settings-success", children: "Settings saved successfully." }),
    _.map((T) => /* @__PURE__ */ t(
      Cl,
      {
        category: T,
        settings: o[T],
        edits: h,
        showDescription: e,
        onChange: b
      },
      T
    )),
    /* @__PURE__ */ i("div", { className: "cedros-system-settings-actions", children: [
      N && /* @__PURE__ */ i("span", { className: "cedros-settings-change-count", children: [
        C,
        " unsaved change",
        C !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: E,
          disabled: !N || a,
          children: "Reset"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: x,
          disabled: !N || a,
          children: a ? /* @__PURE__ */ t(Y, { size: "sm" }) : "Save Changes"
        }
      )
    ] })
  ] });
}
const Ls = Object.keys(wa);
function Cl({
  category: e,
  settings: r,
  edits: s,
  showDescription: o,
  onChange: n
}) {
  const a = ga[e] || {
    label: e,
    description: "",
    icon: ""
  }, c = q(() => [...r].sort((d, l) => {
    const h = Ls.indexOf(d.key), m = Ls.indexOf(l.key);
    return (h === -1 ? 1 / 0 : h) - (m === -1 ? 1 / 0 : m);
  }), [r]);
  return /* @__PURE__ */ i("section", { className: "cedros-settings-section", children: [
    /* @__PURE__ */ i("div", { className: "cedros-settings-section-header", children: [
      /* @__PURE__ */ t("span", { className: "cedros-settings-section-icon", children: a.icon }),
      /* @__PURE__ */ i("div", { children: [
        /* @__PURE__ */ t("h3", { className: "cedros-settings-section-title", children: a.label }),
        o && a.description && /* @__PURE__ */ t("p", { className: "cedros-settings-section-description", children: a.description })
      ] })
    ] }),
    /* @__PURE__ */ t(Or, { settings: c, edits: s, onChange: n })
  ] });
}
const se = {
  users: /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
        /* @__PURE__ */ t("circle", { cx: "9", cy: "7", r: "4" }),
        /* @__PURE__ */ t("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
        /* @__PURE__ */ t("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
      ]
    }
  ),
  members: /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
        /* @__PURE__ */ t("circle", { cx: "9", cy: "7", r: "4" }),
        /* @__PURE__ */ t("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
        /* @__PURE__ */ t("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
      ]
    }
  ),
  deposits: /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ t("path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" }),
        /* @__PURE__ */ t("path", { d: "M12 18V6" })
      ]
    }
  ),
  withdrawals: /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2" }),
        /* @__PURE__ */ t("path", { d: "M9 22v-4h6v4" }),
        /* @__PURE__ */ t("path", { d: "M8 6h.01" }),
        /* @__PURE__ */ t("path", { d: "M16 6h.01" }),
        /* @__PURE__ */ t("path", { d: "M12 6h.01" }),
        /* @__PURE__ */ t("path", { d: "M12 10h.01" }),
        /* @__PURE__ */ t("path", { d: "M12 14h.01" }),
        /* @__PURE__ */ t("path", { d: "M16 10h.01" }),
        /* @__PURE__ */ t("path", { d: "M16 14h.01" }),
        /* @__PURE__ */ t("path", { d: "M8 10h.01" }),
        /* @__PURE__ */ t("path", { d: "M8 14h.01" })
      ]
    }
  ),
  wallet: /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }),
        /* @__PURE__ */ t("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" })
      ]
    }
  ),
  chevronRight: /* @__PURE__ */ t(
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
      children: /* @__PURE__ */ t("path", { d: "m9 18 6-6-6-6" })
    }
  ),
  key: /* @__PURE__ */ t(
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
      children: /* @__PURE__ */ t("path", { d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" })
    }
  ),
  shield: /* @__PURE__ */ t(
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
      children: /* @__PURE__ */ t("path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" })
    }
  ),
  mail: /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
        /* @__PURE__ */ t("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
      ]
    }
  ),
  coins: /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "6" }),
        /* @__PURE__ */ t("path", { d: "M18.09 10.37A6 6 0 1 1 10.34 18" }),
        /* @__PURE__ */ t("path", { d: "M7 6h1v4" }),
        /* @__PURE__ */ t("path", { d: "m16.71 13.88.7.71-2.82 2.82" })
      ]
    }
  ),
  server: /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2" }),
        /* @__PURE__ */ t("rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2" }),
        /* @__PURE__ */ t("line", { x1: "6", x2: "6.01", y1: "6", y2: "6" }),
        /* @__PURE__ */ t("line", { x1: "6", x2: "6.01", y1: "18", y2: "18" })
      ]
    }
  ),
  image: /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }),
        /* @__PURE__ */ t("circle", { cx: "9", cy: "9", r: "2" }),
        /* @__PURE__ */ t("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" })
      ]
    }
  ),
  referrals: /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("circle", { cx: "18", cy: "5", r: "3" }),
        /* @__PURE__ */ t("circle", { cx: "6", cy: "12", r: "3" }),
        /* @__PURE__ */ t("circle", { cx: "18", cy: "19", r: "3" }),
        /* @__PURE__ */ t("line", { x1: "8.59", y1: "13.51", x2: "15.42", y2: "17.49" }),
        /* @__PURE__ */ t("line", { x1: "15.41", y1: "6.51", x2: "8.59", y2: "10.49" })
      ]
    }
  ),
  ticket: /* @__PURE__ */ i(
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
        /* @__PURE__ */ t("path", { d: "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" }),
        /* @__PURE__ */ t("path", { d: "M13 5v2" }),
        /* @__PURE__ */ t("path", { d: "M13 17v2" }),
        /* @__PURE__ */ t("path", { d: "M13 11v2" })
      ]
    }
  )
}, El = [
  // Top-level menu items
  { id: "users", label: "Users", icon: se.users },
  { id: "team", label: "Team", icon: se.members },
  { id: "referrals", label: "Referrals", icon: se.referrals },
  { id: "deposits", label: "Deposits", icon: se.deposits, requiredFeature: "credits" },
  { id: "withdrawals", label: "Withdrawals", icon: se.withdrawals, requiredFeature: "credits" },
  // Compliance group
  { id: "compliance", label: "Compliance", icon: se.shield, group: "Compliance" },
  { id: "accreditation-queue", label: "Accreditation Queue", icon: se.shield, group: "Compliance" },
  { id: "sanctions", label: "Sanctions", icon: se.shield, group: "Compliance" },
  { id: "signup-gating", label: "Signup Gating", icon: se.ticket, group: "Compliance" },
  // Configuration group
  { id: "settings-auth", label: "Authentication", icon: se.key, group: "Configuration" },
  { id: "settings-messaging", label: "Auth Messages", icon: se.mail, group: "Configuration" },
  { id: "settings-wallet", label: "User Wallets", icon: se.wallet, group: "Configuration" },
  {
    id: "settings-credits",
    label: "Credit System",
    icon: se.coins,
    group: "Configuration",
    requiredFeature: "credits"
  },
  { id: "settings-compliance", label: "Compliance & Gating", icon: se.shield, group: "Configuration" },
  { id: "settings-referrals", label: "Referrals & Rewards", icon: se.referrals, group: "Configuration" },
  { id: "settings-signup", label: "Signup Gating", icon: se.ticket, group: "Configuration" },
  { id: "settings-server", label: "Auth Server", icon: se.server, group: "Configuration" },
  { id: "settings-images", label: "Image Storage", icon: se.image, group: "Configuration" }
];
function xl(e, r) {
  return r.toUpperCase() === "SOL" ? `${(e / 1e9).toFixed(4)} SOL` : `${e} ${r}`;
}
function Ts(e) {
  return e.length <= 16 ? e : `${e.slice(0, 8)}...${e.slice(-6)}`;
}
function _l(e) {
  return new Date(e).toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const Sl = ["all", "pending", "completed", "failed", "cancelled"];
function Ll() {
  const { config: e, _internal: r } = ot(), s = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, r]
  ), [o, n] = k("all"), [a, c] = k(0), d = 20, [l, h] = k(null), [m, u] = k(!1), [p, g] = k(null), [w, b] = k(null), [x, E] = k(null), N = B(async () => {
    u(!0), g(null);
    try {
      const f = new URLSearchParams();
      o !== "all" && f.set("status", o), f.set("limit", String(d)), f.set("offset", String(a * d));
      const v = await s.get(
        `/admin/referral-payouts/list?${f.toString()}`
      );
      h(v);
    } catch (f) {
      const v = V(f, "Failed to load payouts");
      g(v.message);
    } finally {
      u(!1);
    }
  }, [s, o, a]);
  O(() => {
    N();
  }, [N]);
  const C = B(
    async (f) => {
      E(f), b(null);
      try {
        const v = await s.post(
          `/admin/referral-payouts/${f}/process`,
          {}
        );
        b(`Processed: ${v.txSignature}`), N();
      } catch (v) {
        const y = V(v, "Failed to process payout");
        b(y.message);
      } finally {
        E(null);
      }
    },
    [s, N]
  ), _ = B(
    async (f) => {
      E(f), b(null);
      try {
        await s.post(`/admin/referral-payouts/${f}/cancel`, {}), b("Payout cancelled."), N();
      } catch (v) {
        const y = V(v, "Failed to cancel payout");
        b(y.message);
      } finally {
        E(null);
      }
    },
    [s, N]
  ), T = l ? Math.ceil(l.total / d) : 0;
  return /* @__PURE__ */ i(X, { children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts__filter-bar", children: [
      /* @__PURE__ */ i("label", { className: "cedros-admin-referral-payouts__filter-label", children: [
        "Status:",
        /* @__PURE__ */ t(
          "select",
          {
            value: o,
            onChange: (f) => {
              n(f.target.value), c(0);
            },
            className: "cedros-admin-referral-payouts__filter-select",
            children: Sl.map((f) => /* @__PURE__ */ t("option", { value: f, children: f.charAt(0).toUpperCase() + f.slice(1) }, f))
          }
        )
      ] }),
      l && /* @__PURE__ */ i("span", { className: "cedros-admin-referral-payouts__filter-count", children: [
        l.total,
        " total"
      ] })
    ] }),
    w && /* @__PURE__ */ t("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--info", children: w }),
    m && !l && /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts--loading", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading payouts..." })
    ] }),
    p && /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts--error", children: [
      /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: p }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: N,
          children: "Retry"
        }
      )
    ] }),
    l && l.payouts.length === 0 && /* @__PURE__ */ t("div", { className: "cedros-admin-empty-message", children: "No payouts found." }),
    l && l.payouts.length > 0 && /* @__PURE__ */ i("div", { className: "cedros-admin-list-table", role: "table", "aria-label": "All referral payouts", children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-list-thead", role: "row", children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Date" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Referrer" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Trigger" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Amount" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Status" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "TX / Error" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Actions" })
      ] }),
      l.payouts.map((f) => /* @__PURE__ */ i("div", { className: "cedros-admin-list-row", role: "row", children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: _l(f.createdAt) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: f.referrerEmail || f.referrerName || Ts(f.referrerId) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: f.triggerType }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: xl(f.amount, f.currency) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ t("span", { className: `cedros-admin-referral-payouts__status cedros-admin-referral-payouts__status--${f.status}`, children: f.status }) }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-list-td cedros-admin-list-td-mono", role: "cell", children: [
          f.txSignature && Ts(f.txSignature),
          f.errorMessage && /* @__PURE__ */ t("span", { className: "cedros-admin-list-td-muted", title: f.errorMessage, children: f.errorMessage.slice(0, 40) })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-admin-list-td", role: "cell", children: [
          (f.status === "pending" || f.status === "failed") && /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-primary cedros-button-xs",
              onClick: () => C(f.id),
              disabled: x !== null,
              children: x === f.id ? "..." : "Process"
            }
          ),
          f.status === "pending" && /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-xs",
              onClick: () => _(f.id),
              disabled: x !== null,
              style: { marginLeft: 4 },
              children: "Cancel"
            }
          )
        ] })
      ] }, f.id))
    ] }),
    T > 1 && /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts__pagination", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-xs",
          disabled: a === 0,
          onClick: () => c((f) => f - 1),
          children: "Previous"
        }
      ),
      /* @__PURE__ */ i("span", { className: "cedros-admin-referral-payouts__page-info", children: [
        "Page ",
        a + 1,
        " of ",
        T
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-xs",
          disabled: a >= T - 1,
          onClick: () => c((f) => f + 1),
          children: "Next"
        }
      )
    ] })
  ] });
}
function Kt(e, r) {
  return r.toUpperCase() === "SOL" ? `${(e / 1e9).toFixed(4)} SOL` : `${e} ${r}`;
}
function Ps(e) {
  return e.length <= 16 ? e : `${e.slice(0, 8)}...${e.slice(-6)}`;
}
function Tl({ className: e = "" }) {
  const [r, s] = k("summary");
  return /* @__PURE__ */ i("div", { className: `cedros-admin-referral-payouts ${e}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts__tabs", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-referral-payouts__tab ${r === "summary" ? "cedros-admin-referral-payouts__tab--active" : ""}`,
          onClick: () => s("summary"),
          children: "Summary"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-referral-payouts__tab ${r === "all" ? "cedros-admin-referral-payouts__tab--active" : ""}`,
          onClick: () => s("all"),
          children: "All Payouts"
        }
      )
    ] }),
    r === "summary" ? /* @__PURE__ */ t(Pl, {}) : /* @__PURE__ */ t(Ll, {})
  ] });
}
function Pl() {
  const { config: e, _internal: r } = ot(), s = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, r]
  ), [o, n] = k(null), [a, c] = k(!1), [d, l] = k(null), [h, m] = k(!1), [u, p] = k(null), [g, w] = k(null), [b, x] = k(!1), [E, N] = k(null), [C, _] = k(null), [T, f] = k(null), v = B(async () => {
    c(!0), l(null);
    try {
      const U = await s.get("/admin/referral-payouts");
      n(U);
    } catch (U) {
      const W = V(U, "Failed to load referral payouts");
      l(W.message);
    } finally {
      c(!1);
    }
  }, [s]), y = B(async () => {
    try {
      const W = (await s.get("/admin/settings"))?.payout_auto_enabled?.value;
      f(W === "true");
    } catch {
    }
  }, [s]);
  O(() => {
    v(), y();
  }, [v, y]);
  const A = B(async () => {
    m(!0), p(null), w(null);
    try {
      const U = await s.post(
        "/admin/referral-payouts/process",
        {}
      );
      p(U), v();
    } catch (U) {
      const W = V(U, "Failed to process payouts");
      w(W.message);
    } finally {
      m(!1);
    }
  }, [s, v]), L = B(async () => {
    x(!0), N(null), _(null);
    try {
      const U = await s.post(
        "/admin/referral-payouts/retry-failed",
        {}
      );
      N(U), v();
    } catch (U) {
      const W = V(U, "Failed to retry failed payouts");
      _(W.message);
    } finally {
      x(!1);
    }
  }, [s, v]), S = h || b;
  if (a && !o)
    return /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts cedros-admin-referral-payouts--loading", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading referral payouts..." })
    ] });
  if (d)
    return /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts cedros-admin-referral-payouts--error", children: [
      /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: d }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: v,
          children: "Retry"
        }
      )
    ] });
  const R = o?.referrers ?? [], P = o?.total ?? 0, M = R[0]?.currency ?? "SOL", I = R.reduce((U, W) => U + W.totalPendingAmount, 0);
  return /* @__PURE__ */ i(X, { children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts__header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts__summary", children: [
        /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Pending Referrers" }),
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: P })
        ] }),
        P > 0 && /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Total Pending Amount" }),
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: Kt(I, M) })
        ] }),
        T !== null && /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Auto-Processing" }),
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: T ? "ON" : "OFF" })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts__actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-sm",
            onClick: A,
            disabled: S || P === 0,
            "aria-busy": h,
            children: h ? "Processing..." : "Process All Payouts"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: L,
            disabled: S,
            "aria-busy": b,
            children: b ? "Retrying..." : "Retry Failed"
          }
        )
      ] })
    ] }),
    u && /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--success", children: [
      "Processed ",
      u.processed,
      " payout(s) totalling",
      " ",
      Kt(u.totalAmount, M),
      ".",
      u.failed > 0 && ` ${u.failed} failed.`,
      u.skippedNoWallet > 0 && ` ${u.skippedNoWallet} skipped (no wallet).`
    ] }),
    g && /* @__PURE__ */ t("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--error", children: g }),
    E && /* @__PURE__ */ i("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--success", children: [
      "Reset ",
      E.resetCount,
      " failed payout(s) for retry."
    ] }),
    C && /* @__PURE__ */ t("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--error", children: C }),
    R.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-empty-message", children: "No pending referral payouts." }) : /* @__PURE__ */ i("div", { className: "cedros-admin-list-table", role: "table", "aria-label": "Pending referral payouts", children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-list-thead", role: "row", children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Referrer ID" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Wallet Address" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Pending Referrals" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Total Amount" })
      ] }),
      R.map((U) => /* @__PURE__ */ i("div", { className: "cedros-admin-list-row", role: "row", children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td cedros-admin-list-td-mono", role: "cell", children: /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-admin-user-uuid-link",
            onClick: () => navigator.clipboard?.writeText(U.referrerId),
            title: `Click to copy: ${U.referrerId}`,
            children: Ps(U.referrerId)
          }
        ) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: U.payoutWalletAddress ? /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-admin-user-uuid-link cedros-admin-list-td-mono",
            onClick: () => navigator.clipboard?.writeText(U.payoutWalletAddress),
            title: `Click to copy: ${U.payoutWalletAddress}`,
            children: Ps(U.payoutWalletAddress)
          }
        ) : /* @__PURE__ */ t("span", { className: "cedros-admin-list-td-muted", children: "No wallet" }) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: U.pendingCount }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: Kt(U.totalPendingAmount, U.currency) })
      ] }, U.referrerId))
    ] })
  ] });
}
function Bl({ pageSize: e, currentUserId: r }) {
  const [s, o] = k(null), { statsItems: n, isLoading: a, error: c, refresh: d } = Ca();
  return s ? /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(
    Ea,
    {
      userId: s.id,
      currentUserId: r,
      onBack: () => o(null)
    }
  ) }) : /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ t(Bn, { stats: n, isLoading: a, onRefresh: d }),
    c && /* @__PURE__ */ t("p", { className: "cedros-admin-error-inline", children: c }),
    /* @__PURE__ */ t(
      xa,
      {
        pageSize: e,
        currentUserId: r,
        onUserClick: (l) => o(l)
      }
    )
  ] });
}
function Rl({ orgId: e, currentUserId: r, hasPermission: s, role: o }) {
  const [n, a] = k("members"), {
    members: c,
    isLoading: d,
    error: l,
    fetchMembers: h,
    updateMemberRole: m,
    removeMember: u
  } = la(e), {
    invites: p,
    isLoading: g,
    error: w,
    fetchInvites: b,
    createInvite: x,
    cancelInvite: E,
    resendInvite: N
  } = da(e);
  O(() => {
    h(), b();
  }, [h, b]);
  const C = s("invite:create"), _ = s("invite:cancel"), T = p.length, f = c.reduce(
    (L, S) => (L[S.role] = (L[S.role] ?? 0) + 1, L),
    {}
  ), v = f.owner ?? 0, y = f.admin ?? 0, A = f.member ?? 0;
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__team", children: [
    /* @__PURE__ */ t(
      Bn,
      {
        stats: [
          { label: "Owners", value: v },
          { label: "Admins", value: y },
          { label: "Members", value: A },
          { label: "Pending Invites", value: T }
        ]
      }
    ),
    /* @__PURE__ */ i("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: [
      /* @__PURE__ */ t(
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
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${n === "invites" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => a("invites"),
          "aria-selected": n === "invites",
          role: "tab",
          children: [
            "Pending Invites",
            T > 0 && ` (${T})`
          ]
        }
      ),
      o === "owner" && /* @__PURE__ */ t(
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
    /* @__PURE__ */ i("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: [
      n === "members" && /* @__PURE__ */ t(
        ua,
        {
          members: c,
          currentUserId: r,
          isLoading: d,
          error: l?.message,
          canManage: s("member:remove"),
          canChangeRoles: s("member:role_change"),
          onUpdateRole: m,
          onRemove: u
        }
      ),
      n === "invites" && /* @__PURE__ */ i("div", { className: "cedros-dashboard__invites", children: [
        C && /* @__PURE__ */ i("div", { className: "cedros-dashboard__section", children: [
          /* @__PURE__ */ t("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ t("h3", { className: "cedros-dashboard__section-title", children: "Send Invitation" }) }),
          /* @__PURE__ */ t(
            ha,
            {
              onSubmit: x,
              isLoading: g,
              error: w?.message
            }
          )
        ] }),
        /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(
          ma,
          {
            invites: p,
            isLoading: g,
            error: w?.message,
            canManage: _ || C,
            onCancel: _ ? E : void 0,
            onResend: C ? N : void 0
          }
        ) })
      ] }),
      n === "permissions" && o === "owner" && /* @__PURE__ */ t(fa, { userRole: o })
    ] })
  ] });
}
function Ml({ pageSize: e, refreshInterval: r }) {
  const [s, o] = k("");
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ t(ba, { refreshInterval: r }),
    /* @__PURE__ */ i("div", { className: "cedros-dashboard__deposits-list", children: [
      /* @__PURE__ */ t("div", { className: "cedros-dashboard__toolbar", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__filter", children: [
        /* @__PURE__ */ t("label", { className: "cedros-dashboard__filter-label", htmlFor: "status-filter", children: "Status" }),
        /* @__PURE__ */ i(
          "select",
          {
            id: "status-filter",
            className: "cedros-dashboard__select",
            value: s,
            onChange: (n) => o(n.target.value),
            children: [
              /* @__PURE__ */ t("option", { value: "", children: "All statuses" }),
              /* @__PURE__ */ t("option", { value: "pending", children: "Pending" }),
              /* @__PURE__ */ t("option", { value: "detected", children: "Detected" }),
              /* @__PURE__ */ t("option", { value: "processing", children: "Processing" }),
              /* @__PURE__ */ t("option", { value: "completed", children: "Completed" }),
              /* @__PURE__ */ t("option", { value: "withdrawn", children: "Withdrawn" }),
              /* @__PURE__ */ t("option", { value: "expired", children: "Expired" }),
              /* @__PURE__ */ t("option", { value: "failed", children: "Failed" })
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ t(
        ya,
        {
          statusFilter: s || void 0,
          pageSize: e,
          refreshInterval: r
        }
      )
    ] })
  ] });
}
function Il({ pageSize: e, refreshInterval: r }) {
  return /* @__PURE__ */ i("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ t(va, { refreshInterval: r }),
    /* @__PURE__ */ t("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ i("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ t(Aa, { pageSize: e, refreshInterval: r }),
      /* @__PURE__ */ t(Na, { pageSize: e, refreshInterval: r }),
      /* @__PURE__ */ t(ka, { pageSize: e, refreshInterval: r })
    ] })
  ] });
}
function Ul() {
  return /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Tl, {}) });
}
const Dl = ["security", "rate_limit"];
function Zh({ className: e }) {
  return /* @__PURE__ */ t(
    Rt,
    {
      title: "Security",
      description: "Configure CORS, cookies, sessions, JWT, and rate limiting settings.",
      categories: Dl,
      className: e
    }
  );
}
const Bs = [
  { id: "email", label: "Email", category: "email" },
  { id: "webhooks", label: "Webhooks", category: "webhook" }
];
function Fl({ className: e }) {
  const {
    settings: r,
    edits: s,
    isLoading: o,
    autosaveStatus: n,
    autosaveError: a,
    error: c,
    fetchSettings: d,
    handleChange: l,
    getEffectiveValue: h
  } = Tn(), [m, u] = k("email");
  O(() => {
    d();
  }, [d]);
  const p = Bs.find((_) => _.id === m), g = p?.category ?? "", b = (h("email_provider") || "custom") === "custom", x = h("email_smtp_host"), E = !b || x != null && x !== "", N = q(() => {
    const _ = r[g] ?? [];
    if (m !== "email") return _;
    const T = b ? Pa : Ba;
    return _.filter((f) => T.includes(f.key)).sort((f, v) => T.indexOf(f.key) - T.indexOf(v.key));
  }, [r, g, m, b]), C = (_, T) => {
    if (l(_, T), _ === "email_provider" && T !== "custom") {
      const f = Ra[T];
      f && (l("email_smtp_host", f), l("email_smtp_port", "587"), l("email_smtp_tls", "true"));
    }
  };
  return o && Object.keys(r).length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-system-settings cedros-system-settings-loading ${e ?? ""}`, children: [
    /* @__PURE__ */ t(Y, {}),
    /* @__PURE__ */ t("span", { children: "Loading settings..." })
  ] }) : c ? /* @__PURE__ */ t("div", { className: `cedros-system-settings ${e ?? ""}`, children: /* @__PURE__ */ t(ne, { error: c.message }) }) : /* @__PURE__ */ i("div", { className: `cedros-system-settings ${e ?? ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ t("h2", { className: "cedros-settings-page-title", children: "Auth Messages" }),
        /* @__PURE__ */ t("p", { className: "cedros-settings-page-description", children: "Configure email delivery for verification emails, password resets, and instant link login. Webhook notifications can be sent to Discord or Slack." })
      ] }),
      /* @__PURE__ */ t(Pn, { status: n, error: a })
    ] }),
    m === "email" && !E && /* @__PURE__ */ t("div", { className: "cedros-settings-warning-banner", children: "Email features (verification, password reset, instant link) are disabled until SMTP is configured. Select a provider or enter custom SMTP settings below." }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: Bs.map((_) => /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${m === _.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => u(_.id),
        "aria-selected": m === _.id,
        role: "tab",
        children: _.label
      },
      _.id
    )) }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: N.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ i("p", { children: [
      "No settings found for ",
      p?.label ?? "this section",
      "."
    ] }) }) : /* @__PURE__ */ t(
      Or,
      {
        settings: N,
        edits: s,
        onChange: m === "email" ? C : l
      }
    ) })
  ] });
}
const Zt = [
  "image_storage_enabled",
  "image_storage_provider",
  "image_storage_bucket",
  "image_storage_region",
  "image_storage_endpoint",
  "image_storage_access_key",
  "image_storage_secret_key",
  "image_storage_cdn_url"
], Rs = {
  nyc3: "https://nyc3.digitaloceanspaces.com",
  ams3: "https://ams3.digitaloceanspaces.com",
  sgp1: "https://sgp1.digitaloceanspaces.com",
  sfo3: "https://sfo3.digitaloceanspaces.com",
  fra1: "https://fra1.digitaloceanspaces.com",
  syd1: "https://syd1.digitaloceanspaces.com"
};
function Ol({ className: e }) {
  const {
    settings: r,
    edits: s,
    isLoading: o,
    autosaveStatus: n,
    autosaveError: a,
    error: c,
    fetchSettings: d,
    handleChange: l,
    getEffectiveValue: h
  } = Tn();
  O(() => {
    d();
  }, [d]);
  const m = q(() => (r.image_storage ?? []).filter((g) => Zt.includes(g.key)).sort((g, w) => Zt.indexOf(g.key) - Zt.indexOf(w.key)), [r]), u = (p, g) => {
    if (l(p, g), p === "image_storage_provider")
      if (g === "digitalocean") {
        const w = h("image_storage_region") || "nyc3";
        l("image_storage_region", w), l("image_storage_endpoint", Rs[w] ?? `https://${w}.digitaloceanspaces.com`);
      } else g === "s3" && l("image_storage_endpoint", "");
    p === "image_storage_region" && h("image_storage_provider") === "digitalocean" && l("image_storage_endpoint", Rs[g] ?? `https://${g}.digitaloceanspaces.com`);
  };
  return o && Object.keys(r).length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-system-settings cedros-system-settings-loading ${e ?? ""}`, children: [
    /* @__PURE__ */ t(Y, {}),
    /* @__PURE__ */ t("span", { children: "Loading settings..." })
  ] }) : c ? /* @__PURE__ */ t("div", { className: `cedros-system-settings ${e ?? ""}`, children: /* @__PURE__ */ t(ne, { error: c.message }) }) : /* @__PURE__ */ i("div", { className: `cedros-system-settings ${e ?? ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ t("h2", { className: "cedros-settings-page-title", children: "Image Storage" }),
        /* @__PURE__ */ t("p", { className: "cedros-settings-page-description", children: "Configure S3-compatible object storage for user avatars and images. Supports AWS S3, DigitalOcean Spaces, and other S3-compatible providers." })
      ] }),
      /* @__PURE__ */ t(Pn, { status: n, error: a })
    ] }),
    m.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ t("p", { children: "No image storage settings found." }) }) : /* @__PURE__ */ t(
      Or,
      {
        settings: m,
        edits: s,
        onChange: u
      }
    )
  ] });
}
const Wl = ["kyc", "accreditation", "sanctions", "token_gating"];
function ql({ className: e }) {
  return /* @__PURE__ */ t(
    Rt,
    {
      title: "Compliance & Gating",
      description: "Configure KYC identity verification, accredited investor verification, sanctions screening, and Solana token gating.",
      categories: Wl,
      className: e
    }
  );
}
const zl = ["referral"];
function jl({ className: e }) {
  return /* @__PURE__ */ t(
    Rt,
    {
      title: "Referrals & Rewards",
      description: "Configure referral reward types, amounts, triggers, per-referrer caps, and automated payout processing.",
      categories: zl,
      className: e
    }
  );
}
const $l = ["signup"];
function Vl({ className: e }) {
  return /* @__PURE__ */ t(
    Rt,
    {
      title: "Signup Gating",
      description: "Configure access codes required to register and optional signup rate limits.",
      categories: $l,
      className: e
    }
  );
}
const tt = 20;
function Xt(e) {
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
function Hl(e) {
  return !!e.expiresAt && new Date(e.expiresAt) < /* @__PURE__ */ new Date();
}
function Gl(e) {
  return e.maxUses !== null && e.currentUses >= e.maxUses;
}
function Ql(e) {
  return Hl(e) ? "expired" : Gl(e) ? "exhausted" : "active";
}
function Yl({ className: e = "" }) {
  const { config: r, _internal: s } = ot(), o = q(
    () => new Wr(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      s?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, s]
  ), [n, a] = k("all"), [c, d] = k([]), [l, h] = k(0), [m, u] = k(0), [p, g] = k(!1), [w, b] = k(null), [x, E] = k(null), [N, C] = k(""), [_, T] = k(""), [f, v] = k(""), [y, A] = k(!1), [L, S] = k(null), [R, P] = k(!1), [M, I] = k(null), [U, W] = k(null), z = {
    all: void 0,
    limited: "limited",
    user_invite: "user_invite"
  }, $ = B(async () => {
    g(!0), b(null);
    try {
      const D = await o.listAccessCodes(tt, m, z[n]);
      d(D.items), h(D.total);
    } catch (D) {
      b(D instanceof Error ? D.message : "Failed to load access codes");
    } finally {
      g(!1);
    }
  }, [o, n, m]), F = B(async () => {
    try {
      const D = await o.getSignupStats();
      E(D);
    } catch {
    }
  }, [o]);
  O(() => {
    $(), F();
  }, [$, F]), O(() => {
    u(0);
  }, [n]);
  const H = B(
    async (D) => {
      if (D.preventDefault(), !N.trim()) {
        S("Code is required.");
        return;
      }
      const j = _.trim() ? parseInt(_, 10) : null;
      if (_.trim() && (isNaN(j) || j < 1)) {
        S("Max uses must be a positive integer.");
        return;
      }
      const te = f.trim() ? new Date(f).toISOString() : void 0;
      A(!0), S(null), P(!1);
      try {
        await o.createAccessCode(N.trim(), j, te), C(""), T(""), v(""), P(!0), $(), F();
      } catch (ee) {
        S(ee instanceof Error ? ee.message : "Failed to create code");
      } finally {
        A(!1);
      }
    },
    [o, N, _, f, $, F]
  ), Z = B(
    async (D) => {
      I(D), W(null);
      try {
        await o.deleteAccessCode(D), d((j) => j.filter((te) => te.id !== D)), h((j) => j - 1);
      } catch (j) {
        W(j instanceof Error ? j.message : "Failed to delete code");
      } finally {
        I(null);
      }
    },
    [o]
  ), Q = Math.ceil(l / tt), le = Math.floor(m / tt) + 1;
  return /* @__PURE__ */ i("div", { className: `cedros-admin-access-codes ${e}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-access-codes__header", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-admin-access-codes__title", children: "Access Codes" }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-admin__stats-bar-refresh",
          onClick: () => {
            $(), F();
          },
          disabled: p,
          title: "Refresh",
          "aria-label": "Refresh list",
          children: p ? "..." : "↻"
        }
      )
    ] }),
    x && /* @__PURE__ */ i("div", { className: "cedros-admin-access-codes__stats-bar", "aria-label": "Signup statistics", children: [
      /* @__PURE__ */ i("span", { className: "cedros-admin-access-codes__stat", children: [
        /* @__PURE__ */ i("strong", { children: [
          "Signups this ",
          x.period,
          ":"
        ] }),
        " ",
        x.count,
        x.limit !== null ? ` / ${x.limit}` : ""
      ] }),
      /* @__PURE__ */ i("span", { className: "cedros-admin-access-codes__stat", children: [
        /* @__PURE__ */ t("strong", { children: "Period start:" }),
        " ",
        Xt(x.periodStart)
      ] })
    ] }),
    /* @__PURE__ */ i("section", { className: "cedros-admin-access-codes__create-section", "aria-label": "Create access code", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-admin-access-codes__section-title", children: "Create Code" }),
      /* @__PURE__ */ i(
        "form",
        {
          className: "cedros-admin-access-codes__create-form",
          onSubmit: H,
          "aria-label": "Create access code form",
          children: [
            /* @__PURE__ */ i("div", { className: "cedros-form-field cedros-form-field--inline", children: [
              /* @__PURE__ */ t("label", { htmlFor: "ac-code", className: "cedros-label", children: "Code" }),
              /* @__PURE__ */ t(
                "input",
                {
                  id: "ac-code",
                  type: "text",
                  className: "cedros-input",
                  value: N,
                  onChange: (D) => {
                    C(D.target.value), S(null), P(!1);
                  },
                  placeholder: "e.g. BETA2025",
                  disabled: y,
                  required: !0
                }
              )
            ] }),
            /* @__PURE__ */ i("div", { className: "cedros-form-field cedros-form-field--inline", children: [
              /* @__PURE__ */ i("label", { htmlFor: "ac-max-uses", className: "cedros-label", children: [
                "Max Uses ",
                /* @__PURE__ */ t("span", { className: "cedros-optional", children: "(blank = unlimited)" })
              ] }),
              /* @__PURE__ */ t(
                "input",
                {
                  id: "ac-max-uses",
                  type: "number",
                  className: "cedros-input",
                  value: _,
                  onChange: (D) => T(D.target.value),
                  placeholder: "e.g. 100",
                  min: "1",
                  disabled: y
                }
              )
            ] }),
            /* @__PURE__ */ i("div", { className: "cedros-form-field cedros-form-field--inline", children: [
              /* @__PURE__ */ i("label", { htmlFor: "ac-expiry", className: "cedros-label", children: [
                "Expiry ",
                /* @__PURE__ */ t("span", { className: "cedros-optional", children: "(optional)" })
              ] }),
              /* @__PURE__ */ t(
                "input",
                {
                  id: "ac-expiry",
                  type: "date",
                  className: "cedros-input",
                  value: f,
                  onChange: (D) => v(D.target.value),
                  disabled: y
                }
              )
            ] }),
            /* @__PURE__ */ t(
              "button",
              {
                type: "submit",
                className: "cedros-button cedros-button-primary cedros-button-md",
                disabled: y,
                "aria-busy": y,
                children: y ? "Creating..." : "Create"
              }
            )
          ]
        }
      ),
      L && /* @__PURE__ */ t("div", { className: "cedros-admin-error", role: "alert", children: L }),
      R && !L && /* @__PURE__ */ t("div", { className: "cedros-admin-success", role: "status", children: "Code created." })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", role: "tablist", children: ["all", "limited", "user_invite"].map((D) => /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${n === D ? "cedros-admin-tab-active" : ""}`,
        onClick: () => a(D),
        "aria-selected": n === D,
        role: "tab",
        children: D === "all" ? "All" : D === "limited" ? "Limited" : "User Invite"
      },
      D
    )) }),
    U && /* @__PURE__ */ t("div", { className: "cedros-admin-error", role: "alert", children: U }),
    w && /* @__PURE__ */ i("div", { className: "cedros-admin-access-codes--error", children: [
      /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: w }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: $,
          children: "Retry"
        }
      )
    ] }),
    !w && /* @__PURE__ */ t("div", { role: "tabpanel", children: p && c.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-admin-access-codes--loading", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading..." })
    ] }) : c.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-empty-message", children: "No access codes found." }) : /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ i(
        "div",
        {
          className: "cedros-admin-list-table cedros-admin-access-codes__table",
          role: "table",
          "aria-label": "Access codes",
          children: [
            /* @__PURE__ */ i("div", { className: "cedros-admin-list-thead", role: "row", children: [
              /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Code" }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Type" }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Uses" }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Created By" }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Created" }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Expires" }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Status" }),
              /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: /* @__PURE__ */ t("span", { className: "cedros-sr-only", children: "Actions" }) })
            ] }),
            c.map((D) => {
              const j = Ql(D), te = D.maxUses !== null ? `${D.currentUses} / ${D.maxUses}` : `${D.currentUses}`;
              return /* @__PURE__ */ i("div", { className: "cedros-admin-list-row", role: "row", children: [
                /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ t("code", { className: "cedros-admin-access-codes__code", children: D.code }) }),
                /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: D.codeType }),
                /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: te }),
                /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: D.createdByEmail ?? "—" }),
                /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: Xt(D.createdAt) }),
                /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: D.expiresAt ? Xt(D.expiresAt) : "—" }),
                /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ t("span", { className: `cedros-admin-access-codes__status cedros-admin-access-codes__status--${j}`, children: j.charAt(0).toUpperCase() + j.slice(1) }) }),
                /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ t(
                  "button",
                  {
                    type: "button",
                    className: "cedros-button cedros-button-danger cedros-button-sm",
                    onClick: () => Z(D.id),
                    disabled: M === D.id,
                    "aria-label": `Delete code ${D.code}`,
                    children: M === D.id ? "..." : "Delete"
                  }
                ) })
              ] }, D.id);
            })
          ]
        }
      ),
      Q > 1 && /* @__PURE__ */ i("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => u(Math.max(0, m - tt)),
            disabled: le <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          le,
          " of ",
          Q,
          " (",
          l,
          " total)"
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => u(m + tt),
            disabled: le >= Q,
            children: "Next"
          }
        )
      ] })
    ] }) })
  ] });
}
function Kl() {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
function Zl(e) {
  if (!e) return [];
  try {
    const r = JSON.parse(e);
    return Array.isArray(r) ? r : [];
  } catch {
    return [];
  }
}
function Xl(e) {
  switch (e) {
    case "nft_collection":
      return "NFT Collection";
    case "fungible_token":
      return "Fungible Token";
    case "any_nft":
      return "Any NFT";
  }
}
function Jl(e) {
  switch (e) {
    case "all":
      return "All";
    case "deposits":
      return "Deposits";
    case "withdrawals":
      return "Withdrawals";
  }
}
const Ms = {
  name: "",
  ruleType: "nft_collection",
  collectionAddress: "",
  mintAddress: "",
  minQuantity: "",
  minAmount: "",
  enforcement: "all"
};
function ed(e) {
  return {
    name: e.name,
    ruleType: e.ruleType,
    collectionAddress: e.collectionAddress ?? "",
    mintAddress: e.mintAddress ?? "",
    minQuantity: e.minQuantity !== void 0 ? String(e.minQuantity) : "",
    minAmount: e.minAmount ?? "",
    enforcement: e.enforcement
  };
}
function td(e, r) {
  return {
    id: r,
    name: e.name.trim(),
    ruleType: e.ruleType,
    collectionAddress: e.ruleType === "nft_collection" && e.collectionAddress.trim() || void 0,
    mintAddress: e.ruleType === "fungible_token" && e.mintAddress.trim() || void 0,
    minQuantity: e.ruleType !== "fungible_token" && e.minQuantity ? parseInt(e.minQuantity, 10) : void 0,
    minAmount: e.ruleType === "fungible_token" && e.minAmount.trim() || void 0,
    enforcement: e.enforcement
  };
}
function rd({ className: e = "" }) {
  const { fetchSettings: r, updateSettings: s, getValue: o, isLoading: n, error: a } = Ln(), [c, d] = k([]), [l, h] = k(null), [m, u] = k(!1), [p, g] = k(Ms), [w, b] = k(null), [x, E] = k(!1);
  O(() => {
    r();
  }, [r]);
  const N = o("token_gating_rules"), C = q(() => Zl(N), [N]);
  O(() => {
    d(C);
  }, [C]);
  const _ = B(
    async (S) => {
      E(!0), b(null);
      try {
        await s([{ key: "token_gating_rules", value: JSON.stringify(S) }]), d(S);
      } catch (R) {
        b(R instanceof Error ? R.message : "Failed to save rules");
      } finally {
        E(!1);
      }
    },
    [s]
  ), T = B(() => {
    h(null), g(Ms), b(null), u(!0);
  }, []), f = B((S) => {
    h(S.id), g(ed(S)), b(null), u(!0);
  }, []), v = B(
    (S) => {
      const R = c.filter((P) => P.id !== S);
      _(R);
    },
    [c, _]
  ), y = B(() => {
    u(!1), b(null);
  }, []), A = B(async () => {
    if (!p.name.trim()) {
      b("Rule name is required.");
      return;
    }
    const S = l ?? Kl(), R = td(p, S), P = l ? c.map((M) => M.id === l ? R : M) : [...c, R];
    await _(P), w || u(!1);
  }, [p, l, c, _, w]), L = B((S, R) => {
    g((P) => ({ ...P, [S]: R }));
  }, []);
  return n && c.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-admin-token-gate ${e} cedros-admin-token-gate--loading`, children: [
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading token gate rules..." })
  ] }) : a && c.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-admin-token-gate ${e} cedros-admin-token-gate--error`, children: [
    /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: a.message }),
    /* @__PURE__ */ t("button", { type: "button", className: "cedros-button cedros-button-outline cedros-button-sm", onClick: r, children: "Retry" })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-admin-token-gate ${e}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-token-gate__header", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-admin-token-gate__title", children: "Token Gate Rules" }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: T,
          disabled: m,
          children: "Add Rule"
        }
      )
    ] }),
    m && /* @__PURE__ */ t(
      sd,
      {
        form: p,
        isNew: l === null,
        isSaving: x,
        saveError: w,
        onFieldChange: L,
        onSave: A,
        onCancel: y
      }
    ),
    c.length === 0 && !m ? /* @__PURE__ */ t("div", { className: "cedros-admin-empty-message", children: "No token gate rules configured." }) : /* @__PURE__ */ i(
      "div",
      {
        className: "cedros-admin-list-table",
        role: "table",
        "aria-label": "Token gate rules",
        children: [
          /* @__PURE__ */ i("div", { className: "cedros-admin-list-thead", role: "row", children: [
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Name" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Type" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Address / Mint" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Min Qty / Amount" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Enforcement" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Actions" })
          ] }),
          c.map((S) => /* @__PURE__ */ i("div", { className: "cedros-admin-list-row", role: "row", children: [
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: S.name }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: Xl(S.ruleType) }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-td cedros-admin-list-td-mono", role: "cell", children: S.collectionAddress || S.mintAddress || "—" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: S.minQuantity !== void 0 ? S.minQuantity : S.minAmount ?? "—" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: Jl(S.enforcement) }),
            /* @__PURE__ */ i("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", role: "cell", children: [
              /* @__PURE__ */ t(
                "button",
                {
                  type: "button",
                  className: "cedros-button cedros-button-outline cedros-button-sm",
                  onClick: () => f(S),
                  disabled: m,
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ t(
                "button",
                {
                  type: "button",
                  className: "cedros-button cedros-button-danger cedros-button-sm",
                  onClick: () => v(S.id),
                  disabled: x || m,
                  children: "Delete"
                }
              )
            ] })
          ] }, S.id))
        ]
      }
    )
  ] });
}
function sd({ form: e, isNew: r, isSaving: s, saveError: o, onFieldChange: n, onSave: a, onCancel: c }) {
  const d = e.ruleType === "nft_collection", l = e.ruleType === "fungible_token", h = e.ruleType !== "fungible_token", m = e.ruleType === "fungible_token";
  return /* @__PURE__ */ i("div", { className: "cedros-admin-token-gate__form", role: "region", "aria-label": r ? "Add rule" : "Edit rule", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-admin-token-gate__form-title", children: r ? "Add Rule" : "Edit Rule" }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "tg-name", children: "Name" }),
      /* @__PURE__ */ t(
        "input",
        {
          id: "tg-name",
          type: "text",
          className: "cedros-admin-form-input",
          value: e.name,
          onChange: (u) => n("name", u.target.value),
          placeholder: "e.g. Whale Gate"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "tg-type", children: "Type" }),
      /* @__PURE__ */ i(
        "select",
        {
          id: "tg-type",
          className: "cedros-admin-form-select",
          value: e.ruleType,
          onChange: (u) => n("ruleType", u.target.value),
          children: [
            /* @__PURE__ */ t("option", { value: "nft_collection", children: "NFT Collection" }),
            /* @__PURE__ */ t("option", { value: "fungible_token", children: "Fungible Token" }),
            /* @__PURE__ */ t("option", { value: "any_nft", children: "Any NFT" })
          ]
        }
      )
    ] }),
    d && /* @__PURE__ */ i("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "tg-collection", children: "Collection Address" }),
      /* @__PURE__ */ t(
        "input",
        {
          id: "tg-collection",
          type: "text",
          className: "cedros-admin-form-input cedros-admin-form-input--mono",
          value: e.collectionAddress,
          onChange: (u) => n("collectionAddress", u.target.value),
          placeholder: "Solana collection mint address"
        }
      )
    ] }),
    l && /* @__PURE__ */ i("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "tg-mint", children: "Mint Address" }),
      /* @__PURE__ */ t(
        "input",
        {
          id: "tg-mint",
          type: "text",
          className: "cedros-admin-form-input cedros-admin-form-input--mono",
          value: e.mintAddress,
          onChange: (u) => n("mintAddress", u.target.value),
          placeholder: "SPL token mint address"
        }
      )
    ] }),
    h && /* @__PURE__ */ i("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "tg-minqty", children: "Min Quantity" }),
      /* @__PURE__ */ t(
        "input",
        {
          id: "tg-minqty",
          type: "number",
          min: "1",
          className: "cedros-admin-form-input",
          value: e.minQuantity,
          onChange: (u) => n("minQuantity", u.target.value),
          placeholder: "1"
        }
      )
    ] }),
    m && /* @__PURE__ */ i("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "tg-minamount", children: "Min Amount" }),
      /* @__PURE__ */ t(
        "input",
        {
          id: "tg-minamount",
          type: "text",
          className: "cedros-admin-form-input",
          value: e.minAmount,
          onChange: (u) => n("minAmount", u.target.value),
          placeholder: "e.g. 1000000 (raw units)"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "tg-enforcement", children: "Enforcement" }),
      /* @__PURE__ */ i(
        "select",
        {
          id: "tg-enforcement",
          className: "cedros-admin-form-select",
          value: e.enforcement,
          onChange: (u) => n("enforcement", u.target.value),
          children: [
            /* @__PURE__ */ t("option", { value: "all", children: "All" }),
            /* @__PURE__ */ t("option", { value: "deposits", children: "Deposits" }),
            /* @__PURE__ */ t("option", { value: "withdrawals", children: "Withdrawals" })
          ]
        }
      )
    ] }),
    o && /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: o }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-token-gate__form-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: a,
          disabled: s,
          "aria-busy": s,
          children: s ? "Saving..." : "Save Rule"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: c,
          disabled: s,
          children: "Cancel"
        }
      )
    ] })
  ] });
}
function nd(e) {
  return new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function od(e) {
  return {
    income: "Income",
    net_worth: "Net Worth",
    credential: "Credential",
    third_party_letter: "Third-Party Letter",
    insider: "Insider / Executive",
    investment_threshold: "Investment Threshold"
  }[e] ?? e;
}
function ad(e) {
  switch (e) {
    case "pending":
      return "cedros-admin-badge--pending";
    case "approved":
      return "cedros-admin-badge--approved";
    case "rejected":
      return "cedros-admin-badge--rejected";
    case "expired":
      return "cedros-admin-badge--expired";
    default:
      return "";
  }
}
function id({
  item: e,
  isExpanded: r,
  detail: s,
  detailLoading: o,
  detailError: n,
  reviewNotes: a,
  rejectionReason: c,
  isReviewing: d,
  reviewError: l,
  onRowClick: h,
  onDocumentDownload: m,
  onReviewNotesChange: u,
  onRejectionReasonChange: p,
  onReview: g
}) {
  const w = e.statedAmountUsd !== void 0 ? `$${e.statedAmountUsd.toLocaleString()}` : e.investmentCommitmentUsd !== void 0 ? `$${e.investmentCommitmentUsd.toLocaleString()}` : "—";
  return /* @__PURE__ */ i(X, { children: [
    /* @__PURE__ */ i(
      "div",
      {
        className: `cedros-admin-list-row cedros-admin-list-row--clickable ${r ? "cedros-admin-list-row--expanded" : ""}`,
        role: "row",
        onClick: () => h(e.id),
        onKeyDown: (b) => {
          (b.key === "Enter" || b.key === " ") && (b.preventDefault(), h(e.id));
        },
        tabIndex: 0,
        "aria-expanded": r,
        children: [
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: e.userEmail ?? /* @__PURE__ */ i("span", { className: "cedros-admin-list-td-mono", children: [
            e.userId.slice(0, 12),
            "..."
          ] }) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: od(e.method) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: w }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: nd(e.createdAt) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ t("span", { className: `cedros-admin-badge ${ad(e.status)}`, children: e.status }) })
        ]
      }
    ),
    r && /* @__PURE__ */ i("div", { className: "cedros-admin-accreditation-queue__detail", role: "region", "aria-label": "Submission detail", children: [
      o && /* @__PURE__ */ i("div", { className: "cedros-admin-accreditation-queue__detail-loading", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading detail..." })
      ] }),
      n && /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: n }),
      s && /* @__PURE__ */ i(X, { children: [
        /* @__PURE__ */ t(cd, { detail: s, onDocumentDownload: m }),
        e.status === "pending" && /* @__PURE__ */ t(
          ld,
          {
            submissionId: e.id,
            notes: a,
            rejectionReason: c,
            isReviewing: d,
            error: l,
            onNotesChange: u,
            onRejectionReasonChange: p,
            onReview: g
          }
        )
      ] })
    ] })
  ] });
}
function cd({ detail: e, onDocumentDownload: r }) {
  return /* @__PURE__ */ i("div", { className: "cedros-admin-accreditation-queue__detail-fields", children: [
    e.incomeType && /* @__PURE__ */ i("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "Income Type" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-value", children: e.incomeType })
    ] }),
    e.statedAmountUsd !== void 0 && /* @__PURE__ */ i("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "Stated Amount" }),
      /* @__PURE__ */ i("span", { className: "cedros-admin-detail-value", children: [
        "$",
        e.statedAmountUsd.toLocaleString()
      ] })
    ] }),
    e.crdNumber && /* @__PURE__ */ i("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "CRD Number" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-value cedros-admin-list-td-mono", children: e.crdNumber })
    ] }),
    e.licenseType && /* @__PURE__ */ i("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "License Type" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-value", children: e.licenseType })
    ] }),
    e.investmentCommitmentUsd !== void 0 && /* @__PURE__ */ i("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "Investment Commitment" }),
      /* @__PURE__ */ i("span", { className: "cedros-admin-detail-value", children: [
        "$",
        e.investmentCommitmentUsd.toLocaleString()
      ] })
    ] }),
    e.entityType && /* @__PURE__ */ i("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "Entity Type" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-value", children: e.entityType })
    ] }),
    e.userStatement && /* @__PURE__ */ i("div", { className: "cedros-admin-detail-row cedros-admin-detail-row--block", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "User Statement" }),
      /* @__PURE__ */ t("p", { className: "cedros-admin-detail-statement", children: e.userStatement })
    ] }),
    e.documents.length > 0 && /* @__PURE__ */ i("div", { className: "cedros-admin-accreditation-queue__documents", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-admin-accreditation-queue__documents-title", children: "Documents" }),
      e.documents.map((s) => /* @__PURE__ */ i("div", { className: "cedros-admin-accreditation-queue__document-row", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-accreditation-queue__document-name", children: s.originalFilename ?? s.documentType }),
        s.fileSizeBytes && /* @__PURE__ */ i("span", { className: "cedros-admin-list-td-muted", children: [
          (s.fileSizeBytes / 1024).toFixed(1),
          " KB"
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => r(s.id),
            children: "Download"
          }
        )
      ] }, s.id))
    ] })
  ] });
}
function ld({
  submissionId: e,
  notes: r,
  rejectionReason: s,
  isReviewing: o,
  error: n,
  onNotesChange: a,
  onRejectionReasonChange: c,
  onReview: d
}) {
  return /* @__PURE__ */ i("div", { className: "cedros-admin-accreditation-queue__review-form", children: [
    /* @__PURE__ */ t("h4", { className: "cedros-admin-accreditation-queue__review-title", children: "Review Decision" }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "review-notes", children: "Reviewer Notes (internal)" }),
      /* @__PURE__ */ t(
        "textarea",
        {
          id: "review-notes",
          className: "cedros-admin-form-textarea",
          value: r,
          onChange: (l) => a(l.target.value),
          rows: 2,
          placeholder: "Optional internal notes"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "rejection-reason", children: "Rejection Reason (required if rejecting)" }),
      /* @__PURE__ */ t(
        "textarea",
        {
          id: "rejection-reason",
          className: "cedros-admin-form-textarea",
          value: s,
          onChange: (l) => c(l.target.value),
          rows: 2,
          placeholder: "Reason shown to user"
        }
      )
    ] }),
    n && /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: n }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-accreditation-queue__review-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: () => d(e, !0),
          disabled: o,
          "aria-busy": o,
          children: o ? "Saving..." : "Approve"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-danger cedros-button-sm",
          onClick: () => d(e, !1),
          disabled: o,
          "aria-busy": o,
          children: o ? "Saving..." : "Reject"
        }
      )
    ] })
  ] });
}
const rt = 20;
function dd({ className: e = "" }) {
  const { config: r, _internal: s } = ot(), o = q(
    () => new Wr(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      s?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, s]
  ), [n, a] = k("pending"), [c, d] = k([]), [l, h] = k(0), [m, u] = k(0), [p, g] = k(!1), [w, b] = k(null), [x, E] = k(null), [N, C] = k(null), [_, T] = k(!1), [f, v] = k(null), [y, A] = k(""), [L, S] = k(""), [R, P] = k(!1), [M, I] = k(null), [U, W] = k(null), z = B(async () => {
    g(!0), b(null);
    try {
      const D = await o.listPendingAccreditations(rt, m);
      d(D.items), h(D.total);
    } catch (D) {
      b(D instanceof Error ? D.message : "Failed to load submissions");
    } finally {
      g(!1);
    }
  }, [o, m]);
  O(() => {
    z();
  }, [z]), O(() => {
    u(0), E(null), C(null);
  }, [n]);
  const $ = B(
    async (D) => {
      if (x === D) {
        E(null), C(null);
        return;
      }
      E(D), C(null), v(null), A(""), S(""), I(null), W(null), T(!0);
      try {
        const j = await o.getAccreditationSubmission(D);
        C(j);
      } catch (j) {
        v(j instanceof Error ? j.message : "Failed to load submission detail");
      } finally {
        T(!1);
      }
    },
    [x, o]
  ), F = B(
    async (D) => {
      try {
        const j = await o.getAccreditationDocumentUrl(D);
        window.open(j, "_blank", "noopener,noreferrer");
      } catch (j) {
        I(j instanceof Error ? j.message : "Failed to get document URL");
      }
    },
    [o]
  ), H = B(
    async (D, j) => {
      if (!j && !L.trim()) {
        I("Rejection reason is required.");
        return;
      }
      P(!0), I(null), W(null);
      try {
        await o.reviewAccreditation(
          D,
          j,
          y.trim() || void 0,
          j ? void 0 : L.trim()
        ), W(j ? "Submission approved." : "Submission rejected."), E(null), C(null), z();
      } catch (te) {
        I(te instanceof Error ? te.message : "Failed to submit review");
      } finally {
        P(!1);
      }
    },
    [o, y, L, z]
  ), Z = Math.ceil(l / rt), Q = Math.floor(m / rt) + 1, le = n === "pending" ? l : c.filter((D) => D.status === "pending").length;
  return /* @__PURE__ */ i("div", { className: `cedros-admin-accreditation-queue ${e}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-accreditation-queue__header", children: [
      /* @__PURE__ */ i("h2", { className: "cedros-admin-accreditation-queue__title", children: [
        "Accreditation Review Queue",
        le > 0 && /* @__PURE__ */ t("span", { className: "cedros-admin-queue-count", "aria-label": `${le} pending`, children: le })
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-admin__stats-bar-refresh",
          onClick: z,
          disabled: p,
          title: "Refresh",
          "aria-label": "Refresh list",
          children: p ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", role: "tablist", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${n === "pending" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => a("pending"),
          "aria-selected": n === "pending",
          role: "tab",
          children: "Pending"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${n === "all" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => a("all"),
          "aria-selected": n === "all",
          role: "tab",
          children: "All"
        }
      )
    ] }),
    U && /* @__PURE__ */ t("div", { className: "cedros-admin-accreditation-queue__result cedros-admin-accreditation-queue__result--success", children: U }),
    w && /* @__PURE__ */ i("div", { className: "cedros-admin-accreditation-queue cedros-admin-accreditation-queue--error", children: [
      /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: w }),
      /* @__PURE__ */ t("button", { type: "button", className: "cedros-button cedros-button-outline cedros-button-sm", onClick: z, children: "Retry" })
    ] }),
    !w && p && c.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-admin-accreditation-queue--loading", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading submissions..." })
    ] }) : /* @__PURE__ */ t("div", { role: "tabpanel", children: c.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-empty-message", children: "No submissions found." }) : /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-list-table", role: "table", "aria-label": "Accreditation submissions", children: [
        /* @__PURE__ */ i("div", { className: "cedros-admin-list-thead", role: "row", children: [
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "User" }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Method" }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Amount" }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Submitted" }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Status" })
        ] }),
        c.map((D) => /* @__PURE__ */ t(
          id,
          {
            item: D,
            isExpanded: x === D.id,
            detail: x === D.id ? N : null,
            detailLoading: x === D.id && _,
            detailError: x === D.id ? f : null,
            reviewNotes: y,
            rejectionReason: L,
            isReviewing: R,
            reviewError: x === D.id ? M : null,
            onRowClick: $,
            onDocumentDownload: F,
            onReviewNotesChange: A,
            onRejectionReasonChange: S,
            onReview: H
          },
          D.id
        ))
      ] }),
      Z > 1 && /* @__PURE__ */ i("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => u(Math.max(0, m - rt)),
            disabled: Q <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          Q,
          " of ",
          Z,
          " (",
          l,
          " total)"
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => u(m + rt),
            disabled: Q >= Z,
            children: "Next"
          }
        )
      ] })
    ] }) })
  ] });
}
function ud(e) {
  return e === void 0 ? "—" : e < 60 ? `${e}s` : e < 3600 ? `${Math.floor(e / 60)}m ${e % 60}s` : `${Math.floor(e / 3600)}h ${Math.floor(e % 3600 / 60)}m`;
}
function hd(e) {
  return e ? new Date(e).toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "—";
}
function md({ className: e = "" }) {
  const { config: r, _internal: s } = ot(), o = q(
    () => new Wr(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      s?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, s]
  ), [n, a] = k(null), [c, d] = k(!1), [l, h] = k(null), [m, u] = k(!1), [p, g] = k(null), [w, b] = k(!1), x = B(async () => {
    d(!0), h(null);
    try {
      const N = await o.getSanctionsStats();
      a(N);
    } catch (N) {
      h(N instanceof Error ? N.message : "Failed to load sanctions stats");
    } finally {
      d(!1);
    }
  }, [o]);
  O(() => {
    x();
  }, [x]);
  const E = B(async () => {
    u(!0), g(null), b(!1);
    try {
      await o.refreshSanctions(), b(!0), await x();
    } catch (N) {
      g(N instanceof Error ? N.message : "Failed to refresh sanctions cache");
    } finally {
      u(!1);
    }
  }, [o, x]);
  return c && !n ? /* @__PURE__ */ i("div", { className: `cedros-admin-sanctions-panel ${e} cedros-admin-sanctions-panel--loading`, children: [
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading sanctions stats..." })
  ] }) : l && !n ? /* @__PURE__ */ i("div", { className: `cedros-admin-sanctions-panel ${e} cedros-admin-sanctions-panel--error`, children: [
    /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: l }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: x,
        children: "Retry"
      }
    )
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-admin-sanctions-panel ${e}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-admin-sanctions-panel__header", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-admin-sanctions-panel__title", children: "Sanctions Screening" }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-sanctions-panel__header-actions", children: [
        n !== null && /* @__PURE__ */ t(
          "span",
          {
            className: `cedros-admin-badge ${n.configured ? "cedros-admin-badge--approved" : "cedros-admin-badge--pending"}`,
            title: n.configured ? "Sanctions API configured" : "Sanctions API not configured",
            children: n.configured ? "Configured" : "Not Configured"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-admin__stats-bar-refresh",
            onClick: x,
            disabled: c,
            title: "Refresh stats",
            "aria-label": "Refresh stats",
            children: c ? "..." : "↻"
          }
        )
      ] })
    ] }),
    n !== null && /* @__PURE__ */ i("div", { className: "cedros-admin-sanctions-panel__stats", children: [
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Sanctioned Addresses" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: n.sanctionedAddresses.toLocaleString() })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Sanctioned Countries" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: n.sanctionedCountries.toLocaleString() })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Cache Age" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: ud(n.cacheAgeSeconds) })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Last Refresh" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: hd(n.lastRefreshedAt) })
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-sanctions-panel__actions", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-sm",
        onClick: E,
        disabled: m || c,
        "aria-busy": m,
        children: m ? "Refreshing..." : "Force Refresh"
      }
    ) }),
    w && /* @__PURE__ */ t("div", { className: "cedros-admin-sanctions-panel__result cedros-admin-sanctions-panel__result--success", children: "Sanctions cache refreshed successfully." }),
    p && /* @__PURE__ */ t("div", { className: "cedros-admin-sanctions-panel__result cedros-admin-sanctions-panel__result--error", children: p }),
    l && n && /* @__PURE__ */ t("p", { className: "cedros-admin-error cedros-admin-error--inline", children: l })
  ] });
}
class fd {
  client;
  constructor(r, s, o) {
    this.client = new oe({ baseUrl: r, timeoutMs: s, retryAttempts: o });
  }
  /**
   * Check if initial setup is required
   * Returns whether the system needs initial setup (no admin exists)
   */
  async getStatus() {
    try {
      return await this.client.get("/setup/status");
    } catch (r) {
      throw V(r, "Failed to check setup status");
    }
  }
  /**
   * Create the first admin user
   * Only works when no admin users exist
   */
  async createFirstAdmin(r) {
    try {
      return await this.client.post("/setup/admin", r);
    } catch (s) {
      throw V(s, "Failed to create admin account");
    }
  }
}
function fo() {
  const { config: e } = re(), [r, s] = k(null), [o, n] = k(!1), [a, c] = k(!1), [d, l] = k(null), h = J(0), m = q(
    () => new fd(e.serverUrl, e.requestTimeout, e.retryAttempts),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), u = J(m);
  u.current = m;
  const p = B(async () => {
    n(!0), l(null);
    const w = ++h.current;
    try {
      const b = await u.current.getStatus();
      if (w !== h.current) return;
      s(b);
    } catch (b) {
      if (w !== h.current) return;
      l(b instanceof Error ? b : new Error("Failed to check setup status"));
    } finally {
      w === h.current && n(!1);
    }
  }, []), g = B(
    async (w) => {
      c(!0), l(null);
      try {
        const b = await u.current.createFirstAdmin(w);
        return await p(), b;
      } catch (b) {
        const x = b instanceof Error ? b : new Error("Failed to create admin");
        throw l(x), x;
      } finally {
        c(!1);
      }
    },
    [p]
  );
  return {
    status: r,
    isLoading: o,
    isCreating: a,
    error: d,
    checkStatus: p,
    createAdmin: g
  };
}
const pd = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, Is = 8;
function gd(e) {
  const r = {};
  return e.email ? pd.test(e.email) || (r.email = "Invalid email format") : r.email = "Email is required", e.password ? e.password.length < Is && (r.password = `Password must be at least ${Is} characters`) : r.password = "Password is required", e.confirmPassword ? e.password !== e.confirmPassword && (r.confirmPassword = "Passwords do not match") : r.confirmPassword = "Please confirm your password", r;
}
function wd({ onComplete: e, className: r = "" }) {
  const { status: s, isLoading: o, isCreating: n, error: a, checkStatus: c, createAdmin: d } = fo(), [l, h] = k({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    orgName: ""
  }), [m, u] = k({}), [p, g] = k(!1);
  O(() => {
    c();
  }, [c]);
  const w = B(
    (x) => (E) => {
      h((N) => ({ ...N, [x]: E.target.value })), u((N) => ({ ...N, [x]: void 0 }));
    },
    []
  ), b = B(
    async (x) => {
      x.preventDefault();
      const E = gd(l);
      if (Object.keys(E).length > 0) {
        u(E);
        return;
      }
      try {
        await d({
          email: l.email,
          password: l.password,
          name: l.name || void 0,
          orgName: l.orgName || void 0
        }), g(!0), e?.();
      } catch {
      }
    },
    [l, d, e]
  );
  return o ? /* @__PURE__ */ t("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-setup__loading", children: [
    /* @__PURE__ */ t(Y, {}),
    /* @__PURE__ */ t("span", { className: "cedros-setup__loading-text", children: "Checking setup status..." })
  ] }) }) : s && !s.needsSetup ? /* @__PURE__ */ t("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-setup__complete", children: [
    /* @__PURE__ */ t("div", { className: "cedros-setup__icon cedros-setup__icon--success", children: /* @__PURE__ */ i(
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
          /* @__PURE__ */ t("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          /* @__PURE__ */ t("polyline", { points: "22 4 12 14.01 9 11.01" })
        ]
      }
    ) }),
    /* @__PURE__ */ t("h2", { className: "cedros-setup__title", children: "Setup Complete" }),
    /* @__PURE__ */ t("p", { className: "cedros-setup__text", children: "An admin account already exists. You can now log in." })
  ] }) }) : p ? /* @__PURE__ */ t("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-setup__complete", children: [
    /* @__PURE__ */ t("div", { className: "cedros-setup__icon cedros-setup__icon--success", children: /* @__PURE__ */ i(
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
          /* @__PURE__ */ t("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          /* @__PURE__ */ t("polyline", { points: "22 4 12 14.01 9 11.01" })
        ]
      }
    ) }),
    /* @__PURE__ */ t("h2", { className: "cedros-setup__title", children: "Admin Account Created" }),
    /* @__PURE__ */ t("p", { className: "cedros-setup__text", children: "Your admin account has been created successfully. You can now log in with your credentials." })
  ] }) }) : /* @__PURE__ */ t("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-setup__container", children: [
    /* @__PURE__ */ i("div", { className: "cedros-setup__header", children: [
      /* @__PURE__ */ t("div", { className: "cedros-setup__logo", children: /* @__PURE__ */ i(
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
            /* @__PURE__ */ t("path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }),
            /* @__PURE__ */ t("path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" })
          ]
        }
      ) }),
      /* @__PURE__ */ t("h1", { className: "cedros-setup__title", children: "Welcome to Cedros" }),
      /* @__PURE__ */ t("p", { className: "cedros-setup__subtitle", children: "Let's set up your admin account to get started." })
    ] }),
    /* @__PURE__ */ i("form", { className: "cedros-setup__form", onSubmit: b, children: [
      a && /* @__PURE__ */ t(ne, { error: a.message }),
      /* @__PURE__ */ i("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ i("label", { htmlFor: "setup-email", className: "cedros-setup__label", children: [
          "Email Address ",
          /* @__PURE__ */ t("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "setup-email",
            type: "email",
            className: `cedros-setup__input ${m.email ? "cedros-setup__input--error" : ""}`,
            value: l.email,
            onChange: w("email"),
            placeholder: "admin@example.com",
            autoComplete: "email",
            autoFocus: !0,
            disabled: n
          }
        ),
        m.email && /* @__PURE__ */ t("span", { className: "cedros-setup__error", children: m.email })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ t("label", { htmlFor: "setup-name", className: "cedros-setup__label", children: "Display Name" }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "setup-name",
            type: "text",
            className: "cedros-setup__input",
            value: l.name,
            onChange: w("name"),
            placeholder: "Admin",
            autoComplete: "name",
            disabled: n
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ t("label", { htmlFor: "setup-org-name", className: "cedros-setup__label", children: "Organization Name" }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "setup-org-name",
            type: "text",
            className: "cedros-setup__input",
            value: l.orgName,
            onChange: w("orgName"),
            placeholder: "My Organization",
            disabled: n
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ i("label", { htmlFor: "setup-password", className: "cedros-setup__label", children: [
          "Password ",
          /* @__PURE__ */ t("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "setup-password",
            type: "password",
            className: `cedros-setup__input ${m.password ? "cedros-setup__input--error" : ""}`,
            value: l.password,
            onChange: w("password"),
            placeholder: "At least 8 characters",
            autoComplete: "new-password",
            disabled: n
          }
        ),
        m.password && /* @__PURE__ */ t("span", { className: "cedros-setup__error", children: m.password })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ i("label", { htmlFor: "setup-confirm-password", className: "cedros-setup__label", children: [
          "Confirm Password ",
          /* @__PURE__ */ t("span", { className: "cedros-setup__required", children: "*" })
        ] }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "setup-confirm-password",
            type: "password",
            className: `cedros-setup__input ${m.confirmPassword ? "cedros-setup__input--error" : ""}`,
            value: l.confirmPassword,
            onChange: w("confirmPassword"),
            placeholder: "Confirm your password",
            autoComplete: "new-password",
            disabled: n
          }
        ),
        m.confirmPassword && /* @__PURE__ */ t("span", { className: "cedros-setup__error", children: m.confirmPassword })
      ] }),
      /* @__PURE__ */ t("button", { type: "submit", className: "cedros-setup__button", disabled: n, children: n ? /* @__PURE__ */ i(X, { children: [
        /* @__PURE__ */ t(Y, {}),
        /* @__PURE__ */ t("span", { children: "Creating Account..." })
      ] }) : "Create Admin Account" })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-setup__footer", children: [
      /* @__PURE__ */ t("p", { className: "cedros-setup__note", children: "This will be the first administrator account for your installation." }),
      s?.serverVersion && /* @__PURE__ */ i("p", { className: "cedros-setup__version", children: [
        "Server version: ",
        s.serverVersion
      ] })
    ] })
  ] }) });
}
function bd({
  name: e,
  email: r,
  picture: s,
  onSettings: o,
  onLogout: n,
  className: a = ""
}) {
  const [c, d] = k(!1), l = J(null);
  O(() => {
    function g(w) {
      l.current && !l.current.contains(w.target) && d(!1);
    }
    if (c)
      return document.addEventListener("mousedown", g), () => document.removeEventListener("mousedown", g);
  }, [c]), O(() => {
    function g(w) {
      w.key === "Escape" && d(!1);
    }
    if (c)
      return document.addEventListener("keydown", g), () => document.removeEventListener("keydown", g);
  }, [c]);
  const h = B(() => {
    d(!1), o?.();
  }, [o]), m = B(() => {
    d(!1), n?.();
  }, [n]), u = e || "User", p = (e?.[0] || r?.[0] || "?").toUpperCase();
  return /* @__PURE__ */ i("div", { className: `cedros-profile-dropdown ${a}`, ref: l, children: [
    /* @__PURE__ */ i(
      "button",
      {
        type: "button",
        className: "cedros-profile-dropdown__trigger",
        onClick: () => d(!c),
        "aria-expanded": c,
        "aria-haspopup": "menu",
        children: [
          /* @__PURE__ */ t("div", { className: "cedros-profile-dropdown__avatar", children: s ? /* @__PURE__ */ t(
            "img",
            {
              src: s,
              alt: u,
              className: "cedros-profile-dropdown__avatar-img",
              referrerPolicy: "no-referrer"
            }
          ) : /* @__PURE__ */ t("span", { className: "cedros-profile-dropdown__avatar-placeholder", children: p }) }),
          /* @__PURE__ */ i("div", { className: "cedros-profile-dropdown__info", children: [
            /* @__PURE__ */ t("span", { className: "cedros-profile-dropdown__name", children: u }),
            r && /* @__PURE__ */ t("span", { className: "cedros-profile-dropdown__email", children: r })
          ] }),
          /* @__PURE__ */ t(
            "svg",
            {
              className: `cedros-profile-dropdown__chevron ${c ? "cedros-profile-dropdown__chevron--open" : ""}`,
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: /* @__PURE__ */ t("path", { d: "m6 9 6 6 6-6" })
            }
          )
        ]
      }
    ),
    c && /* @__PURE__ */ i("div", { className: "cedros-profile-dropdown__menu", role: "menu", children: [
      o && /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "cedros-profile-dropdown__item",
          onClick: h,
          role: "menuitem",
          children: [
            /* @__PURE__ */ i(
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
                  /* @__PURE__ */ t("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
                  /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "3" })
                ]
              }
            ),
            "Settings"
          ]
        }
      ),
      n && /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "cedros-profile-dropdown__item cedros-profile-dropdown__item--danger",
          onClick: m,
          role: "menuitem",
          children: [
            /* @__PURE__ */ i(
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
                  /* @__PURE__ */ t("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
                  /* @__PURE__ */ t("polyline", { points: "16 17 21 12 16 7" }),
                  /* @__PURE__ */ t("line", { x1: "21", x2: "9", y1: "12", y2: "12" })
                ]
              }
            ),
            "Log out"
          ]
        }
      )
    ] })
  ] });
}
function Xh({
  title: e = "Dashboard",
  sections: r = [
    "users",
    "team",
    "referrals",
    "deposits",
    "withdrawals",
    "compliance",
    "accreditation-queue",
    "sanctions",
    "signup-gating",
    "settings-wallet",
    "settings-auth",
    "settings-messaging",
    "settings-credits",
    "settings-compliance",
    "settings-referrals",
    "settings-signup",
    "settings-server",
    "settings-images"
  ],
  defaultSection: s = "users",
  refreshInterval: o = 0,
  pageSize: n = 20,
  onSectionChange: a,
  onSettingsClick: c,
  onLogoutClick: d,
  className: l = ""
}) {
  const [h, m] = k(s), [u, p] = k(!0), { user: g, logout: w } = re(), { activeOrg: b, role: x, isLoading: E, fetchOrgs: N, hasPermission: C } = _a(), { status: _, isLoading: T, checkStatus: f } = fo(), { features: v, isLoading: y } = sa(), { canAccess: A } = pa(), L = B(
    (I) => {
      m(I), a?.(I);
    },
    [a]
  ), S = El.filter((I) => !(!r.includes(I.id) || I.requiredFeature && !v[I.requiredFeature] || !A(I.id))), R = S.find((I) => I.id === h), P = !R && !y;
  return O(() => {
    N(), f();
  }, [N, f]), O(() => {
    P && S.length > 0 && m("users");
  }, [P, S.length]), !T && _?.needsSetup ? /* @__PURE__ */ t("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--setup ${l}`, children: /* @__PURE__ */ t(wd, { onComplete: () => f() }) }) : (E || T || y) && !b ? /* @__PURE__ */ i("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--loading ${l}`, children: [
    /* @__PURE__ */ t(Y, {}),
    /* @__PURE__ */ t("span", { className: "cedros-dashboard__loading-text", children: "Loading..." })
  ] }) : h === "team" && !b ? /* @__PURE__ */ t("div", { className: `cedros-admin cedros-dashboard ${l}`, children: /* @__PURE__ */ t(ne, { error: "No organization selected. Please select an organization first." }) }) : /* @__PURE__ */ i("div", { className: `cedros-admin cedros-dashboard ${l}`, children: [
    /* @__PURE__ */ i("aside", { className: "cedros-dashboard__sidebar", children: [
      /* @__PURE__ */ t("div", { className: "cedros-dashboard__sidebar-header", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__logo", children: [
        se.wallet,
        /* @__PURE__ */ t("span", { className: "cedros-dashboard__logo-text", children: e })
      ] }) }),
      /* @__PURE__ */ i("nav", { className: "cedros-dashboard__nav", children: [
        /* @__PURE__ */ i("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ t("span", { className: "cedros-dashboard__nav-label", children: "Menu" }),
          S.filter((I) => !I.group).map((I) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${h === I.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => L(I.id),
              "aria-current": h === I.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ t("span", { className: "cedros-dashboard__nav-icon", children: I.icon }),
                /* @__PURE__ */ t("span", { className: "cedros-dashboard__nav-text", children: I.label })
              ]
            },
            I.id
          ))
        ] }),
        S.some((I) => I.group === "Configuration") && /* @__PURE__ */ i("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: "cedros-dashboard__nav-label cedros-dashboard__nav-label--collapsible",
              onClick: () => p(!u),
              "aria-expanded": u,
              children: [
                /* @__PURE__ */ t("span", { children: "Configuration" }),
                /* @__PURE__ */ t(
                  "span",
                  {
                    className: `cedros-dashboard__nav-chevron ${u ? "cedros-dashboard__nav-chevron--expanded" : ""}`,
                    children: se.chevronRight
                  }
                )
              ]
            }
          ),
          u && S.filter((I) => I.group === "Configuration").map((I) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${h === I.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => L(I.id),
              "aria-current": h === I.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ t("span", { className: "cedros-dashboard__nav-icon", children: I.icon }),
                /* @__PURE__ */ t("span", { className: "cedros-dashboard__nav-text", children: I.label })
              ]
            },
            I.id
          ))
        ] })
      ] }),
      g && /* @__PURE__ */ t("div", { className: "cedros-dashboard__sidebar-footer", children: /* @__PURE__ */ t(
        bd,
        {
          name: g.name,
          email: g.email,
          picture: g.picture,
          onSettings: c,
          onLogout: d ?? w
        }
      ) })
    ] }),
    /* @__PURE__ */ i("main", { className: "cedros-dashboard__main", children: [
      /* @__PURE__ */ t("header", { className: "cedros-dashboard__header", children: /* @__PURE__ */ i("div", { className: "cedros-dashboard__breadcrumb", children: [
        /* @__PURE__ */ t("span", { className: "cedros-dashboard__breadcrumb-root", children: e }),
        /* @__PURE__ */ t("span", { className: "cedros-dashboard__breadcrumb-sep", children: se.chevronRight }),
        /* @__PURE__ */ t("span", { className: "cedros-dashboard__breadcrumb-current", children: R?.label })
      ] }) }),
      /* @__PURE__ */ i("div", { className: "cedros-dashboard__content", children: [
        h === "users" && /* @__PURE__ */ t(Bl, { pageSize: n, currentUserId: g?.id }),
        h === "team" && b && /* @__PURE__ */ t(
          Rl,
          {
            orgId: b.id,
            currentUserId: g?.id,
            hasPermission: C,
            role: x
          }
        ),
        h === "referrals" && /* @__PURE__ */ t(Ul, {}),
        h === "deposits" && /* @__PURE__ */ t(Ml, { pageSize: n, refreshInterval: o }),
        h === "withdrawals" && /* @__PURE__ */ t(Il, { pageSize: n, refreshInterval: o }),
        h === "settings-auth" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(La, {}) }),
        h === "settings-wallet" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Ta, {}) }),
        h === "settings-messaging" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Fl, {}) }),
        h === "settings-credits" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Ma, {}) }),
        h === "settings-server" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Ia, {}) }),
        h === "settings-images" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Ol, {}) }),
        h === "compliance" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(rd, {}) }),
        h === "accreditation-queue" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(dd, {}) }),
        h === "sanctions" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(md, {}) }),
        h === "settings-compliance" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(ql, {}) }),
        h === "settings-referrals" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(jl, {}) }),
        h === "signup-gating" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Yl, {}) }),
        h === "settings-signup" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Vl, {}) })
      ] })
    ] })
  ] });
}
var Qe = {}, Jt, Us;
function yd() {
  return Us || (Us = 1, Jt = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), Jt;
}
var er = {}, Ie = {}, Ds;
function je() {
  if (Ds) return Ie;
  Ds = 1;
  let e;
  const r = [
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
  return Ie.getSymbolSize = function(o) {
    if (!o) throw new Error('"version" cannot be null or undefined');
    if (o < 1 || o > 40) throw new Error('"version" should be in range from 1 to 40');
    return o * 4 + 17;
  }, Ie.getSymbolTotalCodewords = function(o) {
    return r[o];
  }, Ie.getBCHDigit = function(s) {
    let o = 0;
    for (; s !== 0; )
      o++, s >>>= 1;
    return o;
  }, Ie.setToSJISFunction = function(o) {
    if (typeof o != "function")
      throw new Error('"toSJISFunc" is not a valid function.');
    e = o;
  }, Ie.isKanjiModeEnabled = function() {
    return typeof e < "u";
  }, Ie.toSJIS = function(o) {
    return e(o);
  }, Ie;
}
var tr = {}, Fs;
function Zr() {
  return Fs || (Fs = 1, (function(e) {
    e.L = { bit: 1 }, e.M = { bit: 0 }, e.Q = { bit: 3 }, e.H = { bit: 2 };
    function r(s) {
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
        return r(o);
      } catch {
        return n;
      }
    };
  })(tr)), tr;
}
var rr, Os;
function vd() {
  if (Os) return rr;
  Os = 1;
  function e() {
    this.buffer = [], this.length = 0;
  }
  return e.prototype = {
    get: function(r) {
      const s = Math.floor(r / 8);
      return (this.buffer[s] >>> 7 - r % 8 & 1) === 1;
    },
    put: function(r, s) {
      for (let o = 0; o < s; o++)
        this.putBit((r >>> s - o - 1 & 1) === 1);
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(r) {
      const s = Math.floor(this.length / 8);
      this.buffer.length <= s && this.buffer.push(0), r && (this.buffer[s] |= 128 >>> this.length % 8), this.length++;
    }
  }, rr = e, rr;
}
var sr, Ws;
function Ad() {
  if (Ws) return sr;
  Ws = 1;
  function e(r) {
    if (!r || r < 1)
      throw new Error("BitMatrix size must be defined and greater than 0");
    this.size = r, this.data = new Uint8Array(r * r), this.reservedBit = new Uint8Array(r * r);
  }
  return e.prototype.set = function(r, s, o, n) {
    const a = r * this.size + s;
    this.data[a] = o, n && (this.reservedBit[a] = !0);
  }, e.prototype.get = function(r, s) {
    return this.data[r * this.size + s];
  }, e.prototype.xor = function(r, s, o) {
    this.data[r * this.size + s] ^= o;
  }, e.prototype.isReserved = function(r, s) {
    return this.reservedBit[r * this.size + s];
  }, sr = e, sr;
}
var nr = {}, qs;
function Nd() {
  return qs || (qs = 1, (function(e) {
    const r = je().getSymbolSize;
    e.getRowColCoords = function(o) {
      if (o === 1) return [];
      const n = Math.floor(o / 7) + 2, a = r(o), c = a === 145 ? 26 : Math.ceil((a - 13) / (2 * n - 2)) * 2, d = [a - 7];
      for (let l = 1; l < n - 1; l++)
        d[l] = d[l - 1] - c;
      return d.push(6), d.reverse();
    }, e.getPositions = function(o) {
      const n = [], a = e.getRowColCoords(o), c = a.length;
      for (let d = 0; d < c; d++)
        for (let l = 0; l < c; l++)
          d === 0 && l === 0 || // top-left
          d === 0 && l === c - 1 || // bottom-left
          d === c - 1 && l === 0 || n.push([a[d], a[l]]);
      return n;
    };
  })(nr)), nr;
}
var or = {}, zs;
function kd() {
  if (zs) return or;
  zs = 1;
  const e = je().getSymbolSize, r = 7;
  return or.getPositions = function(o) {
    const n = e(o);
    return [
      // top-left
      [0, 0],
      // top-right
      [n - r, 0],
      // bottom-left
      [0, n - r]
    ];
  }, or;
}
var ar = {}, js;
function Cd() {
  return js || (js = 1, (function(e) {
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
    const r = {
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
      let c = 0, d = 0, l = 0, h = null, m = null;
      for (let u = 0; u < a; u++) {
        d = l = 0, h = m = null;
        for (let p = 0; p < a; p++) {
          let g = n.get(u, p);
          g === h ? d++ : (d >= 5 && (c += r.N1 + (d - 5)), h = g, d = 1), g = n.get(p, u), g === m ? l++ : (l >= 5 && (c += r.N1 + (l - 5)), m = g, l = 1);
        }
        d >= 5 && (c += r.N1 + (d - 5)), l >= 5 && (c += r.N1 + (l - 5));
      }
      return c;
    }, e.getPenaltyN2 = function(n) {
      const a = n.size;
      let c = 0;
      for (let d = 0; d < a - 1; d++)
        for (let l = 0; l < a - 1; l++) {
          const h = n.get(d, l) + n.get(d, l + 1) + n.get(d + 1, l) + n.get(d + 1, l + 1);
          (h === 4 || h === 0) && c++;
        }
      return c * r.N2;
    }, e.getPenaltyN3 = function(n) {
      const a = n.size;
      let c = 0, d = 0, l = 0;
      for (let h = 0; h < a; h++) {
        d = l = 0;
        for (let m = 0; m < a; m++)
          d = d << 1 & 2047 | n.get(h, m), m >= 10 && (d === 1488 || d === 93) && c++, l = l << 1 & 2047 | n.get(m, h), m >= 10 && (l === 1488 || l === 93) && c++;
      }
      return c * r.N3;
    }, e.getPenaltyN4 = function(n) {
      let a = 0;
      const c = n.data.length;
      for (let l = 0; l < c; l++) a += n.data[l];
      return Math.abs(Math.ceil(a * 100 / c / 5) - 10) * r.N4;
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
      const c = a.size;
      for (let d = 0; d < c; d++)
        for (let l = 0; l < c; l++)
          a.isReserved(l, d) || a.xor(l, d, s(n, l, d));
    }, e.getBestMask = function(n, a) {
      const c = Object.keys(e.Patterns).length;
      let d = 0, l = 1 / 0;
      for (let h = 0; h < c; h++) {
        a(h), e.applyMask(h, n);
        const m = e.getPenaltyN1(n) + e.getPenaltyN2(n) + e.getPenaltyN3(n) + e.getPenaltyN4(n);
        e.applyMask(h, n), m < l && (l = m, d = h);
      }
      return d;
    };
  })(ar)), ar;
}
var mt = {}, $s;
function po() {
  if ($s) return mt;
  $s = 1;
  const e = Zr(), r = [
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
  return mt.getBlocksCount = function(n, a) {
    switch (a) {
      case e.L:
        return r[(n - 1) * 4 + 0];
      case e.M:
        return r[(n - 1) * 4 + 1];
      case e.Q:
        return r[(n - 1) * 4 + 2];
      case e.H:
        return r[(n - 1) * 4 + 3];
      default:
        return;
    }
  }, mt.getTotalCodewordsCount = function(n, a) {
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
  }, mt;
}
var ir = {}, st = {}, Vs;
function Ed() {
  if (Vs) return st;
  Vs = 1;
  const e = new Uint8Array(512), r = new Uint8Array(256);
  return (function() {
    let o = 1;
    for (let n = 0; n < 255; n++)
      e[n] = o, r[o] = n, o <<= 1, o & 256 && (o ^= 285);
    for (let n = 255; n < 512; n++)
      e[n] = e[n - 255];
  })(), st.log = function(o) {
    if (o < 1) throw new Error("log(" + o + ")");
    return r[o];
  }, st.exp = function(o) {
    return e[o];
  }, st.mul = function(o, n) {
    return o === 0 || n === 0 ? 0 : e[r[o] + r[n]];
  }, st;
}
var Hs;
function xd() {
  return Hs || (Hs = 1, (function(e) {
    const r = Ed();
    e.mul = function(o, n) {
      const a = new Uint8Array(o.length + n.length - 1);
      for (let c = 0; c < o.length; c++)
        for (let d = 0; d < n.length; d++)
          a[c + d] ^= r.mul(o[c], n[d]);
      return a;
    }, e.mod = function(o, n) {
      let a = new Uint8Array(o);
      for (; a.length - n.length >= 0; ) {
        const c = a[0];
        for (let l = 0; l < n.length; l++)
          a[l] ^= r.mul(n[l], c);
        let d = 0;
        for (; d < a.length && a[d] === 0; ) d++;
        a = a.slice(d);
      }
      return a;
    }, e.generateECPolynomial = function(o) {
      let n = new Uint8Array([1]);
      for (let a = 0; a < o; a++)
        n = e.mul(n, new Uint8Array([1, r.exp(a)]));
      return n;
    };
  })(ir)), ir;
}
var cr, Gs;
function _d() {
  if (Gs) return cr;
  Gs = 1;
  const e = xd();
  function r(s) {
    this.genPoly = void 0, this.degree = s, this.degree && this.initialize(this.degree);
  }
  return r.prototype.initialize = function(o) {
    this.degree = o, this.genPoly = e.generateECPolynomial(this.degree);
  }, r.prototype.encode = function(o) {
    if (!this.genPoly)
      throw new Error("Encoder not initialized");
    const n = new Uint8Array(o.length + this.degree);
    n.set(o);
    const a = e.mod(n, this.genPoly), c = this.degree - a.length;
    if (c > 0) {
      const d = new Uint8Array(this.degree);
      return d.set(a, c), d;
    }
    return a;
  }, cr = r, cr;
}
var lr = {}, dr = {}, ur = {}, Qs;
function go() {
  return Qs || (Qs = 1, ur.isValid = function(r) {
    return !isNaN(r) && r >= 1 && r <= 40;
  }), ur;
}
var Ne = {}, Ys;
function wo() {
  if (Ys) return Ne;
  Ys = 1;
  const e = "[0-9]+", r = "[A-Z $%*+\\-./:]+";
  let s = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  s = s.replace(/u/g, "\\u");
  const o = "(?:(?![A-Z0-9 $%*+\\-./:]|" + s + `)(?:.|[\r
]))+`;
  Ne.KANJI = new RegExp(s, "g"), Ne.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), Ne.BYTE = new RegExp(o, "g"), Ne.NUMERIC = new RegExp(e, "g"), Ne.ALPHANUMERIC = new RegExp(r, "g");
  const n = new RegExp("^" + s + "$"), a = new RegExp("^" + e + "$"), c = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return Ne.testKanji = function(l) {
    return n.test(l);
  }, Ne.testNumeric = function(l) {
    return a.test(l);
  }, Ne.testAlphanumeric = function(l) {
    return c.test(l);
  }, Ne;
}
var Ks;
function $e() {
  return Ks || (Ks = 1, (function(e) {
    const r = go(), s = wo();
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
      if (!r.isValid(c))
        throw new Error("Invalid version: " + c);
      return c >= 1 && c < 10 ? a.ccBits[0] : c < 27 ? a.ccBits[1] : a.ccBits[2];
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
    e.from = function(a, c) {
      if (e.isValid(a))
        return a;
      try {
        return o(a);
      } catch {
        return c;
      }
    };
  })(dr)), dr;
}
var Zs;
function Sd() {
  return Zs || (Zs = 1, (function(e) {
    const r = je(), s = po(), o = Zr(), n = $e(), a = go(), c = 7973, d = r.getBCHDigit(c);
    function l(p, g, w) {
      for (let b = 1; b <= 40; b++)
        if (g <= e.getCapacity(b, w, p))
          return b;
    }
    function h(p, g) {
      return n.getCharCountIndicator(p, g) + 4;
    }
    function m(p, g) {
      let w = 0;
      return p.forEach(function(b) {
        const x = h(b.mode, g);
        w += x + b.getBitsLength();
      }), w;
    }
    function u(p, g) {
      for (let w = 1; w <= 40; w++)
        if (m(p, w) <= e.getCapacity(w, g, n.MIXED))
          return w;
    }
    e.from = function(g, w) {
      return a.isValid(g) ? parseInt(g, 10) : w;
    }, e.getCapacity = function(g, w, b) {
      if (!a.isValid(g))
        throw new Error("Invalid QR Code version");
      typeof b > "u" && (b = n.BYTE);
      const x = r.getSymbolTotalCodewords(g), E = s.getTotalCodewordsCount(g, w), N = (x - E) * 8;
      if (b === n.MIXED) return N;
      const C = N - h(b, g);
      switch (b) {
        case n.NUMERIC:
          return Math.floor(C / 10 * 3);
        case n.ALPHANUMERIC:
          return Math.floor(C / 11 * 2);
        case n.KANJI:
          return Math.floor(C / 13);
        case n.BYTE:
        default:
          return Math.floor(C / 8);
      }
    }, e.getBestVersionForData = function(g, w) {
      let b;
      const x = o.from(w, o.M);
      if (Array.isArray(g)) {
        if (g.length > 1)
          return u(g, x);
        if (g.length === 0)
          return 1;
        b = g[0];
      } else
        b = g;
      return l(b.mode, b.getLength(), x);
    }, e.getEncodedBits = function(g) {
      if (!a.isValid(g) || g < 7)
        throw new Error("Invalid QR Code version");
      let w = g << 12;
      for (; r.getBCHDigit(w) - d >= 0; )
        w ^= c << r.getBCHDigit(w) - d;
      return g << 12 | w;
    };
  })(lr)), lr;
}
var hr = {}, Xs;
function Ld() {
  if (Xs) return hr;
  Xs = 1;
  const e = je(), r = 1335, s = 21522, o = e.getBCHDigit(r);
  return hr.getEncodedBits = function(a, c) {
    const d = a.bit << 3 | c;
    let l = d << 10;
    for (; e.getBCHDigit(l) - o >= 0; )
      l ^= r << e.getBCHDigit(l) - o;
    return (d << 10 | l) ^ s;
  }, hr;
}
var mr = {}, fr, Js;
function Td() {
  if (Js) return fr;
  Js = 1;
  const e = $e();
  function r(s) {
    this.mode = e.NUMERIC, this.data = s.toString();
  }
  return r.getBitsLength = function(o) {
    return 10 * Math.floor(o / 3) + (o % 3 ? o % 3 * 3 + 1 : 0);
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(o) {
    let n, a, c;
    for (n = 0; n + 3 <= this.data.length; n += 3)
      a = this.data.substr(n, 3), c = parseInt(a, 10), o.put(c, 10);
    const d = this.data.length - n;
    d > 0 && (a = this.data.substr(n), c = parseInt(a, 10), o.put(c, d * 3 + 1));
  }, fr = r, fr;
}
var pr, en;
function Pd() {
  if (en) return pr;
  en = 1;
  const e = $e(), r = [
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
      let c = r.indexOf(this.data[a]) * 45;
      c += r.indexOf(this.data[a + 1]), n.put(c, 11);
    }
    this.data.length % 2 && n.put(r.indexOf(this.data[a]), 6);
  }, pr = s, pr;
}
var gr, tn;
function Bd() {
  if (tn) return gr;
  tn = 1;
  const e = $e();
  function r(s) {
    this.mode = e.BYTE, typeof s == "string" ? this.data = new TextEncoder().encode(s) : this.data = new Uint8Array(s);
  }
  return r.getBitsLength = function(o) {
    return o * 8;
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(s) {
    for (let o = 0, n = this.data.length; o < n; o++)
      s.put(this.data[o], 8);
  }, gr = r, gr;
}
var wr, rn;
function Rd() {
  if (rn) return wr;
  rn = 1;
  const e = $e(), r = je();
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
      let a = r.toSJIS(this.data[n]);
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
  }, wr = s, wr;
}
var br = { exports: {} }, sn;
function Md() {
  return sn || (sn = 1, (function(e) {
    var r = {
      single_source_shortest_paths: function(s, o, n) {
        var a = {}, c = {};
        c[o] = 0;
        var d = r.PriorityQueue.make();
        d.push(o, 0);
        for (var l, h, m, u, p, g, w, b, x; !d.empty(); ) {
          l = d.pop(), h = l.value, u = l.cost, p = s[h] || {};
          for (m in p)
            p.hasOwnProperty(m) && (g = p[m], w = u + g, b = c[m], x = typeof c[m] > "u", (x || b > w) && (c[m] = w, d.push(m, w), a[m] = h));
        }
        if (typeof n < "u" && typeof c[n] > "u") {
          var E = ["Could not find a path from ", o, " to ", n, "."].join("");
          throw new Error(E);
        }
        return a;
      },
      extract_shortest_path_from_predecessor_list: function(s, o) {
        for (var n = [], a = o; a; )
          n.push(a), s[a], a = s[a];
        return n.reverse(), n;
      },
      find_path: function(s, o, n) {
        var a = r.single_source_shortest_paths(s, o, n);
        return r.extract_shortest_path_from_predecessor_list(
          a,
          n
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(s) {
          var o = r.PriorityQueue, n = {}, a;
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
    e.exports = r;
  })(br)), br.exports;
}
var nn;
function Id() {
  return nn || (nn = 1, (function(e) {
    const r = $e(), s = Td(), o = Pd(), n = Bd(), a = Rd(), c = wo(), d = je(), l = Md();
    function h(E) {
      return unescape(encodeURIComponent(E)).length;
    }
    function m(E, N, C) {
      const _ = [];
      let T;
      for (; (T = E.exec(C)) !== null; )
        _.push({
          data: T[0],
          index: T.index,
          mode: N,
          length: T[0].length
        });
      return _;
    }
    function u(E) {
      const N = m(c.NUMERIC, r.NUMERIC, E), C = m(c.ALPHANUMERIC, r.ALPHANUMERIC, E);
      let _, T;
      return d.isKanjiModeEnabled() ? (_ = m(c.BYTE, r.BYTE, E), T = m(c.KANJI, r.KANJI, E)) : (_ = m(c.BYTE_KANJI, r.BYTE, E), T = []), N.concat(C, _, T).sort(function(v, y) {
        return v.index - y.index;
      }).map(function(v) {
        return {
          data: v.data,
          mode: v.mode,
          length: v.length
        };
      });
    }
    function p(E, N) {
      switch (N) {
        case r.NUMERIC:
          return s.getBitsLength(E);
        case r.ALPHANUMERIC:
          return o.getBitsLength(E);
        case r.KANJI:
          return a.getBitsLength(E);
        case r.BYTE:
          return n.getBitsLength(E);
      }
    }
    function g(E) {
      return E.reduce(function(N, C) {
        const _ = N.length - 1 >= 0 ? N[N.length - 1] : null;
        return _ && _.mode === C.mode ? (N[N.length - 1].data += C.data, N) : (N.push(C), N);
      }, []);
    }
    function w(E) {
      const N = [];
      for (let C = 0; C < E.length; C++) {
        const _ = E[C];
        switch (_.mode) {
          case r.NUMERIC:
            N.push([
              _,
              { data: _.data, mode: r.ALPHANUMERIC, length: _.length },
              { data: _.data, mode: r.BYTE, length: _.length }
            ]);
            break;
          case r.ALPHANUMERIC:
            N.push([
              _,
              { data: _.data, mode: r.BYTE, length: _.length }
            ]);
            break;
          case r.KANJI:
            N.push([
              _,
              { data: _.data, mode: r.BYTE, length: h(_.data) }
            ]);
            break;
          case r.BYTE:
            N.push([
              { data: _.data, mode: r.BYTE, length: h(_.data) }
            ]);
        }
      }
      return N;
    }
    function b(E, N) {
      const C = {}, _ = { start: {} };
      let T = ["start"];
      for (let f = 0; f < E.length; f++) {
        const v = E[f], y = [];
        for (let A = 0; A < v.length; A++) {
          const L = v[A], S = "" + f + A;
          y.push(S), C[S] = { node: L, lastCount: 0 }, _[S] = {};
          for (let R = 0; R < T.length; R++) {
            const P = T[R];
            C[P] && C[P].node.mode === L.mode ? (_[P][S] = p(C[P].lastCount + L.length, L.mode) - p(C[P].lastCount, L.mode), C[P].lastCount += L.length) : (C[P] && (C[P].lastCount = L.length), _[P][S] = p(L.length, L.mode) + 4 + r.getCharCountIndicator(L.mode, N));
          }
        }
        T = y;
      }
      for (let f = 0; f < T.length; f++)
        _[T[f]].end = 0;
      return { map: _, table: C };
    }
    function x(E, N) {
      let C;
      const _ = r.getBestModeForData(E);
      if (C = r.from(N, _), C !== r.BYTE && C.bit < _.bit)
        throw new Error('"' + E + '" cannot be encoded with mode ' + r.toString(C) + `.
 Suggested mode is: ` + r.toString(_));
      switch (C === r.KANJI && !d.isKanjiModeEnabled() && (C = r.BYTE), C) {
        case r.NUMERIC:
          return new s(E);
        case r.ALPHANUMERIC:
          return new o(E);
        case r.KANJI:
          return new a(E);
        case r.BYTE:
          return new n(E);
      }
    }
    e.fromArray = function(N) {
      return N.reduce(function(C, _) {
        return typeof _ == "string" ? C.push(x(_, null)) : _.data && C.push(x(_.data, _.mode)), C;
      }, []);
    }, e.fromString = function(N, C) {
      const _ = u(N, d.isKanjiModeEnabled()), T = w(_), f = b(T, C), v = l.find_path(f.map, "start", "end"), y = [];
      for (let A = 1; A < v.length - 1; A++)
        y.push(f.table[v[A]].node);
      return e.fromArray(g(y));
    }, e.rawSplit = function(N) {
      return e.fromArray(
        u(N, d.isKanjiModeEnabled())
      );
    };
  })(mr)), mr;
}
var on;
function Ud() {
  if (on) return er;
  on = 1;
  const e = je(), r = Zr(), s = vd(), o = Ad(), n = Nd(), a = kd(), c = Cd(), d = po(), l = _d(), h = Sd(), m = Ld(), u = $e(), p = Id();
  function g(f, v) {
    const y = f.size, A = a.getPositions(v);
    for (let L = 0; L < A.length; L++) {
      const S = A[L][0], R = A[L][1];
      for (let P = -1; P <= 7; P++)
        if (!(S + P <= -1 || y <= S + P))
          for (let M = -1; M <= 7; M++)
            R + M <= -1 || y <= R + M || (P >= 0 && P <= 6 && (M === 0 || M === 6) || M >= 0 && M <= 6 && (P === 0 || P === 6) || P >= 2 && P <= 4 && M >= 2 && M <= 4 ? f.set(S + P, R + M, !0, !0) : f.set(S + P, R + M, !1, !0));
    }
  }
  function w(f) {
    const v = f.size;
    for (let y = 8; y < v - 8; y++) {
      const A = y % 2 === 0;
      f.set(y, 6, A, !0), f.set(6, y, A, !0);
    }
  }
  function b(f, v) {
    const y = n.getPositions(v);
    for (let A = 0; A < y.length; A++) {
      const L = y[A][0], S = y[A][1];
      for (let R = -2; R <= 2; R++)
        for (let P = -2; P <= 2; P++)
          R === -2 || R === 2 || P === -2 || P === 2 || R === 0 && P === 0 ? f.set(L + R, S + P, !0, !0) : f.set(L + R, S + P, !1, !0);
    }
  }
  function x(f, v) {
    const y = f.size, A = h.getEncodedBits(v);
    let L, S, R;
    for (let P = 0; P < 18; P++)
      L = Math.floor(P / 3), S = P % 3 + y - 8 - 3, R = (A >> P & 1) === 1, f.set(L, S, R, !0), f.set(S, L, R, !0);
  }
  function E(f, v, y) {
    const A = f.size, L = m.getEncodedBits(v, y);
    let S, R;
    for (S = 0; S < 15; S++)
      R = (L >> S & 1) === 1, S < 6 ? f.set(S, 8, R, !0) : S < 8 ? f.set(S + 1, 8, R, !0) : f.set(A - 15 + S, 8, R, !0), S < 8 ? f.set(8, A - S - 1, R, !0) : S < 9 ? f.set(8, 15 - S - 1 + 1, R, !0) : f.set(8, 15 - S - 1, R, !0);
    f.set(A - 8, 8, 1, !0);
  }
  function N(f, v) {
    const y = f.size;
    let A = -1, L = y - 1, S = 7, R = 0;
    for (let P = y - 1; P > 0; P -= 2)
      for (P === 6 && P--; ; ) {
        for (let M = 0; M < 2; M++)
          if (!f.isReserved(L, P - M)) {
            let I = !1;
            R < v.length && (I = (v[R] >>> S & 1) === 1), f.set(L, P - M, I), S--, S === -1 && (R++, S = 7);
          }
        if (L += A, L < 0 || y <= L) {
          L -= A, A = -A;
          break;
        }
      }
  }
  function C(f, v, y) {
    const A = new s();
    y.forEach(function(M) {
      A.put(M.mode.bit, 4), A.put(M.getLength(), u.getCharCountIndicator(M.mode, f)), M.write(A);
    });
    const L = e.getSymbolTotalCodewords(f), S = d.getTotalCodewordsCount(f, v), R = (L - S) * 8;
    for (A.getLengthInBits() + 4 <= R && A.put(0, 4); A.getLengthInBits() % 8 !== 0; )
      A.putBit(0);
    const P = (R - A.getLengthInBits()) / 8;
    for (let M = 0; M < P; M++)
      A.put(M % 2 ? 17 : 236, 8);
    return _(A, f, v);
  }
  function _(f, v, y) {
    const A = e.getSymbolTotalCodewords(v), L = d.getTotalCodewordsCount(v, y), S = A - L, R = d.getBlocksCount(v, y), P = A % R, M = R - P, I = Math.floor(A / R), U = Math.floor(S / R), W = U + 1, z = I - U, $ = new l(z);
    let F = 0;
    const H = new Array(R), Z = new Array(R);
    let Q = 0;
    const le = new Uint8Array(f.buffer);
    for (let he = 0; he < R; he++) {
      const _e = he < M ? U : W;
      H[he] = le.slice(F, F + _e), Z[he] = $.encode(H[he]), F += _e, Q = Math.max(Q, _e);
    }
    const D = new Uint8Array(A);
    let j = 0, te, ee;
    for (te = 0; te < Q; te++)
      for (ee = 0; ee < R; ee++)
        te < H[ee].length && (D[j++] = H[ee][te]);
    for (te = 0; te < z; te++)
      for (ee = 0; ee < R; ee++)
        D[j++] = Z[ee][te];
    return D;
  }
  function T(f, v, y, A) {
    let L;
    if (Array.isArray(f))
      L = p.fromArray(f);
    else if (typeof f == "string") {
      let I = v;
      if (!I) {
        const U = p.rawSplit(f);
        I = h.getBestVersionForData(U, y);
      }
      L = p.fromString(f, I || 40);
    } else
      throw new Error("Invalid data");
    const S = h.getBestVersionForData(L, y);
    if (!S)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!v)
      v = S;
    else if (v < S)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + S + `.
`
      );
    const R = C(v, y, L), P = e.getSymbolSize(v), M = new o(P);
    return g(M, v), w(M), b(M, v), E(M, y, 0), v >= 7 && x(M, v), N(M, R), isNaN(A) && (A = c.getBestMask(
      M,
      E.bind(null, M, y)
    )), c.applyMask(A, M), E(M, y, A), {
      modules: M,
      version: v,
      errorCorrectionLevel: y,
      maskPattern: A,
      segments: L
    };
  }
  return er.create = function(v, y) {
    if (typeof v > "u" || v === "")
      throw new Error("No input text");
    let A = r.M, L, S;
    return typeof y < "u" && (A = r.from(y.errorCorrectionLevel, r.M), L = h.from(y.version), S = c.from(y.maskPattern), y.toSJISFunc && e.setToSJISFunction(y.toSJISFunc)), T(v, L, A, S);
  }, er;
}
var yr = {}, vr = {}, an;
function bo() {
  return an || (an = 1, (function(e) {
    function r(s) {
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
      const n = typeof o.margin > "u" || o.margin === null || o.margin < 0 ? 4 : o.margin, a = o.width && o.width >= 21 ? o.width : void 0, c = o.scale || 4;
      return {
        width: a,
        scale: a ? 4 : c,
        margin: n,
        color: {
          dark: r(o.color.dark || "#000000ff"),
          light: r(o.color.light || "#ffffffff")
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
      const c = n.modules.size, d = n.modules.data, l = e.getScale(c, a), h = Math.floor((c + a.margin * 2) * l), m = a.margin * l, u = [a.color.light, a.color.dark];
      for (let p = 0; p < h; p++)
        for (let g = 0; g < h; g++) {
          let w = (p * h + g) * 4, b = a.color.light;
          if (p >= m && g >= m && p < h - m && g < h - m) {
            const x = Math.floor((p - m) / l), E = Math.floor((g - m) / l);
            b = u[d[x * c + E] ? 1 : 0];
          }
          o[w++] = b.r, o[w++] = b.g, o[w++] = b.b, o[w] = b.a;
        }
    };
  })(vr)), vr;
}
var cn;
function Dd() {
  return cn || (cn = 1, (function(e) {
    const r = bo();
    function s(n, a, c) {
      n.clearRect(0, 0, a.width, a.height), a.style || (a.style = {}), a.height = c, a.width = c, a.style.height = c + "px", a.style.width = c + "px";
    }
    function o() {
      try {
        return document.createElement("canvas");
      } catch {
        throw new Error("You need to specify a canvas element");
      }
    }
    e.render = function(a, c, d) {
      let l = d, h = c;
      typeof l > "u" && (!c || !c.getContext) && (l = c, c = void 0), c || (h = o()), l = r.getOptions(l);
      const m = r.getImageWidth(a.modules.size, l), u = h.getContext("2d"), p = u.createImageData(m, m);
      return r.qrToImageData(p.data, a, l), s(u, h, m), u.putImageData(p, 0, 0), h;
    }, e.renderToDataURL = function(a, c, d) {
      let l = d;
      typeof l > "u" && (!c || !c.getContext) && (l = c, c = void 0), l || (l = {});
      const h = e.render(a, c, l), m = l.type || "image/png", u = l.rendererOpts || {};
      return h.toDataURL(m, u.quality);
    };
  })(yr)), yr;
}
var Ar = {}, ln;
function Fd() {
  if (ln) return Ar;
  ln = 1;
  const e = bo();
  function r(n, a) {
    const c = n.a / 255, d = a + '="' + n.hex + '"';
    return c < 1 ? d + " " + a + '-opacity="' + c.toFixed(2).slice(1) + '"' : d;
  }
  function s(n, a, c) {
    let d = n + a;
    return typeof c < "u" && (d += " " + c), d;
  }
  function o(n, a, c) {
    let d = "", l = 0, h = !1, m = 0;
    for (let u = 0; u < n.length; u++) {
      const p = Math.floor(u % a), g = Math.floor(u / a);
      !p && !h && (h = !0), n[u] ? (m++, u > 0 && p > 0 && n[u - 1] || (d += h ? s("M", p + c, 0.5 + g + c) : s("m", l, 0), l = 0, h = !1), p + 1 < a && n[u + 1] || (d += s("h", m), m = 0)) : l++;
    }
    return d;
  }
  return Ar.render = function(a, c, d) {
    const l = e.getOptions(c), h = a.modules.size, m = a.modules.data, u = h + l.margin * 2, p = l.color.light.a ? "<path " + r(l.color.light, "fill") + ' d="M0 0h' + u + "v" + u + 'H0z"/>' : "", g = "<path " + r(l.color.dark, "stroke") + ' d="' + o(m, h, l.margin) + '"/>', w = 'viewBox="0 0 ' + u + " " + u + '"', x = '<svg xmlns="http://www.w3.org/2000/svg" ' + (l.width ? 'width="' + l.width + '" height="' + l.width + '" ' : "") + w + ' shape-rendering="crispEdges">' + p + g + `</svg>
`;
    return typeof d == "function" && d(null, x), x;
  }, Ar;
}
var dn;
function Od() {
  if (dn) return Qe;
  dn = 1;
  const e = yd(), r = Ud(), s = Dd(), o = Fd();
  function n(a, c, d, l, h) {
    const m = [].slice.call(arguments, 1), u = m.length, p = typeof m[u - 1] == "function";
    if (!p && !e())
      throw new Error("Callback required as last argument");
    if (p) {
      if (u < 2)
        throw new Error("Too few arguments provided");
      u === 2 ? (h = d, d = c, c = l = void 0) : u === 3 && (c.getContext && typeof h > "u" ? (h = l, l = void 0) : (h = l, l = d, d = c, c = void 0));
    } else {
      if (u < 1)
        throw new Error("Too few arguments provided");
      return u === 1 ? (d = c, c = l = void 0) : u === 2 && !c.getContext && (l = d, d = c, c = void 0), new Promise(function(g, w) {
        try {
          const b = r.create(d, l);
          g(a(b, c, l));
        } catch (b) {
          w(b);
        }
      });
    }
    try {
      const g = r.create(d, l);
      h(null, a(g, c, l));
    } catch (g) {
      h(g);
    }
  }
  return Qe.create = r.create, Qe.toCanvas = n.bind(null, s.render), Qe.toDataURL = n.bind(null, s.renderToDataURL), Qe.toString = n.bind(null, function(a, c, d) {
    return o.render(a, d);
  }), Qe;
}
var Wd = Od();
const qd = /* @__PURE__ */ Mn(Wd);
function zd({ value: e, size: r = 200, alt: s = "QR code", className: o = "" }) {
  const n = J(null), [a, c] = k(null);
  return O(() => {
    !n.current || !e || qd.toCanvas(n.current, e, {
      width: r,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
      errorCorrectionLevel: "M"
    }).then(() => {
      c(null);
    }).catch((d) => {
      c(d instanceof Error ? d.message : "Failed to generate QR code");
    });
  }, [e, r]), a ? /* @__PURE__ */ t(
    "div",
    {
      className: `cedros-qr-error ${o}`,
      style: { width: r, height: r },
      role: "img",
      "aria-label": s,
      children: /* @__PURE__ */ t("p", { children: "Failed to generate QR code" })
    }
  ) : /* @__PURE__ */ t(
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
function yo() {
  const { config: e, _internal: r } = re(), [s, o] = k(null), [n, a] = k("idle"), [c, d] = k(null), [l, h] = k(!1), [m, u] = k(null), p = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, r]
  ), g = B(async () => {
    h(!0), u(null);
    try {
      const _ = await p.get("/mfa/status");
      return o(_), _;
    } catch (_) {
      const T = V(_, "Unable to load two-factor authentication status. Please try again.");
      throw u(T), T;
    } finally {
      h(!1);
    }
  }, [p]), w = B(async () => {
    h(!0), u(null), a("loading");
    try {
      const _ = await p.post("/mfa/setup", {});
      return d(_), a("setup"), _;
    } catch (_) {
      const T = V(_, "Unable to start two-factor setup. Please try again.");
      throw u(T), a("error"), T;
    } finally {
      h(!1);
    }
  }, [p]), b = B(
    async (_) => {
      if (!/^\d{6}$/.test(_)) {
        const T = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw u(T), T;
      }
      h(!0), u(null), a("verifying");
      try {
        await p.post("/mfa/enable", { code: _ }), a("success");
        try {
          const T = await p.get("/mfa/status");
          o(T);
        } catch {
          o({ enabled: !0, recoveryCodesRemaining: 0 });
        }
      } catch (T) {
        const f = V(T, "Incorrect verification code. Please check and try again.");
        throw u(f), a("error"), f;
      } finally {
        h(!1);
      }
    },
    [p]
  ), x = B(
    async (_) => {
      if (!_) {
        const T = {
          code: "VALIDATION_ERROR",
          message: "Please enter your password"
        };
        throw u(T), T;
      }
      h(!0), u(null);
      try {
        await p.post("/mfa/disable", { password: _ }), o({ enabled: !1, recoveryCodesRemaining: 0 }), d(null), a("idle");
      } catch (T) {
        const f = V(T, "Unable to disable two-factor authentication. Please try again.");
        throw u(f), f;
      } finally {
        h(!1);
      }
    },
    [p]
  ), E = B(
    async (_) => {
      if (!/^\d{6}$/.test(_)) {
        const T = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw u(T), T;
      }
      h(!0), u(null);
      try {
        return await p.post(
          "/mfa/recovery-codes/regenerate",
          { code: _ }
        );
      } catch (T) {
        const f = V(T, "Unable to regenerate recovery codes. Please try again.");
        throw u(f), f;
      } finally {
        h(!1);
      }
    },
    [p]
  ), N = B(() => u(null), []), C = B(() => {
    u(null), d(null), a("idle"), h(!1);
  }, []);
  return {
    status: s,
    setupState: n,
    setupData: c,
    isLoading: l,
    error: m,
    getStatus: g,
    beginSetup: w,
    enableTotp: b,
    disableTotp: x,
    regenerateBackupCodes: E,
    clearError: N,
    reset: C
  };
}
function vo({ onSuccess: e, onCancel: r, className: s = "" }) {
  const { setupState: o, setupData: n, isLoading: a, error: c, beginSetup: d, enableTotp: l, clearError: h, reset: m } = yo(), [u, p] = k("qr"), [g, w] = k(""), [b, x] = k(!1), [E, N] = k(!1), C = J(null);
  O(() => {
    o === "idle" && d().catch(() => {
    });
  }, [o, d]), O(() => {
    o === "success" && e?.();
  }, [o, e]);
  const _ = async () => {
    n?.secret && (await navigator.clipboard.writeText(n.secret), x(!0), C.current !== null && window.clearTimeout(C.current), C.current = window.setTimeout(() => x(!1), 2e3));
  }, T = async () => {
    if (n?.recoveryCodes) {
      const y = n.recoveryCodes.join(`
`);
      await navigator.clipboard.writeText(y);
    }
  }, f = async () => {
    try {
      await l(g);
    } catch {
      w("");
    }
  }, v = () => {
    m(), r?.();
  };
  return O(() => () => {
    C.current !== null && (window.clearTimeout(C.current), C.current = null);
  }, []), o === "loading" || o === "idle" && a ? /* @__PURE__ */ t("div", { className: `cedros-totp-setup ${s}`, children: /* @__PURE__ */ t("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ t(Y, { size: "lg", label: "Setting up two-factor authentication" }) }) }) : o === "error" && !n ? /* @__PURE__ */ i("div", { className: `cedros-totp-setup ${s}`, children: [
    /* @__PURE__ */ t(ne, { error: c, onDismiss: h }),
    /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: v,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: () => d(),
          children: "Try again"
        }
      )
    ] })
  ] }) : o === "success" ? /* @__PURE__ */ t("div", { className: `cedros-totp-setup ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-success", children: [
    /* @__PURE__ */ i(
      "svg",
      {
        className: "cedros-totp-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ t("circle", { cx: "24", cy: "24", r: "22", stroke: "var(--cedros-success)", strokeWidth: "2" }),
          /* @__PURE__ */ t(
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
    /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Two-factor authentication enabled" }),
    /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "Your account is now protected with an additional layer of security." })
  ] }) }) : n ? /* @__PURE__ */ i("div", { className: `cedros-totp-setup ${s}`, children: [
    u === "qr" && /* @__PURE__ */ i("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Scan QR code" }),
      /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "Use your authenticator app to scan this QR code." }),
      /* @__PURE__ */ t("div", { className: "cedros-totp-qr", children: /* @__PURE__ */ t(zd, { value: n.otpauthUri, size: 200, alt: "QR code for authenticator app" }) }),
      /* @__PURE__ */ i("div", { className: "cedros-totp-manual", children: [
        /* @__PURE__ */ t("p", { className: "cedros-totp-manual-label", children: "Or enter this code manually:" }),
        /* @__PURE__ */ i("div", { className: "cedros-totp-secret", children: [
          /* @__PURE__ */ t("code", { className: "cedros-totp-secret-code", children: n.secret }),
          /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-ghost cedros-button-sm",
              onClick: _,
              "aria-label": "Copy secret",
              children: b ? "Copied!" : "Copy"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-md",
            onClick: v,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ t(
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
    u === "backup" && /* @__PURE__ */ i("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Save recovery codes" }),
      /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. You can use them to access your account if you lose your authenticator device." }),
      /* @__PURE__ */ t("div", { className: "cedros-totp-backup-codes", children: n.recoveryCodes.map((y, A) => /* @__PURE__ */ t("code", { className: "cedros-totp-backup-code", children: y }, A)) }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
          onClick: T,
          children: "Copy all codes"
        }
      ),
      /* @__PURE__ */ i("label", { className: "cedros-checkbox-label cedros-totp-confirm", children: [
        /* @__PURE__ */ t(
          "input",
          {
            type: "checkbox",
            className: "cedros-checkbox",
            checked: E,
            onChange: (y) => N(y.target.checked)
          }
        ),
        /* @__PURE__ */ t("span", { className: "cedros-checkbox-text", children: "I have saved these recovery codes" })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-md",
            onClick: () => p("qr"),
            children: "Back"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: () => p("verify"),
            disabled: !E,
            children: "Continue"
          }
        )
      ] })
    ] }),
    u === "verify" && /* @__PURE__ */ i("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Verify setup" }),
      /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "Enter the 6-digit code from your authenticator app to complete setup." }),
      /* @__PURE__ */ t(
        Sn,
        {
          value: g,
          onChange: w,
          onComplete: f,
          disabled: a,
          error: c?.message,
          autoFocus: !0
        }
      ),
      /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-md",
            onClick: () => p("backup"),
            disabled: a,
            children: "Back"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: f,
            disabled: a || g.length !== 6,
            children: a ? /* @__PURE__ */ i(X, { children: [
              /* @__PURE__ */ t(Y, { size: "sm" }),
              /* @__PURE__ */ t("span", { children: "Verifying..." })
            ] }) : "Enable 2FA"
          }
        )
      ] })
    ] })
  ] }) : null;
}
function jd({ onStatusChange: e, className: r = "" }) {
  const { status: s, isLoading: o, error: n, getStatus: a, disableTotp: c, regenerateBackupCodes: d, clearError: l } = yo(), [h, m] = k("status"), [u, p] = k(""), [g, w] = k(""), [b, x] = k(null), [E, N] = k(!1), [C, _] = k(null);
  O(() => {
    a().catch(() => {
    });
  }, [a]);
  const T = B(() => {
    m("status"), e?.(!0);
  }, [e]), f = async () => {
    N(!0), _(null);
    try {
      await c(u), m("status"), p(""), e?.(!1);
    } catch (A) {
      _(A instanceof Error ? A.message : "Failed to disable 2FA"), p("");
    } finally {
      N(!1);
    }
  }, v = async () => {
    N(!0), _(null);
    try {
      const A = await d(g);
      x(A.recoveryCodes), w("");
    } catch (A) {
      _(A instanceof Error ? A.message : "Failed to regenerate codes"), w("");
    } finally {
      N(!1);
    }
  }, y = async () => {
    b && await navigator.clipboard.writeText(b.join(`
`));
  };
  return o && !s ? /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ t("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ t(Y, { size: "md", label: "Loading security settings" }) }) }) : n && !s ? /* @__PURE__ */ i("div", { className: `cedros-totp-settings ${r}`, children: [
    /* @__PURE__ */ t(ne, { error: n, onDismiss: l }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => a(),
        children: "Retry"
      }
    )
  ] }) : h === "setup" ? /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ t(vo, { onSuccess: T, onCancel: () => m("status") }) }) : h === "disable" ? /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Disable two-factor authentication" }),
    /* @__PURE__ */ t("p", { className: "cedros-totp-description cedros-totp-warning", children: "This will make your account less secure. Enter your password to confirm." }),
    C && /* @__PURE__ */ t("div", { className: "cedros-totp-error", children: /* @__PURE__ */ t(
      ne,
      {
        error: { code: "UNKNOWN_ERROR", message: C },
        onDismiss: () => _(null)
      }
    ) }),
    /* @__PURE__ */ t("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ t(
      ye,
      {
        label: "Password",
        placeholder: "Enter your password",
        value: u,
        onChange: (A) => p(A.target.value),
        disabled: E,
        autoFocus: !0
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: () => {
            m("status"), p(""), _(null);
          },
          disabled: E,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive cedros-button-md",
          onClick: f,
          disabled: E || u.length === 0,
          children: E ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ t(Y, { size: "sm" }),
            /* @__PURE__ */ t("span", { children: "Disabling..." })
          ] }) : "Disable 2FA"
        }
      )
    ] })
  ] }) }) : h === "regenerate" ? b ? /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "New recovery codes" }),
    /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. Your old codes are no longer valid." }),
    /* @__PURE__ */ t("div", { className: "cedros-totp-backup-codes", children: b.map((A, L) => /* @__PURE__ */ t("code", { className: "cedros-totp-backup-code", children: A }, L)) }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
        onClick: y,
        children: "Copy all codes"
      }
    ),
    /* @__PURE__ */ t("div", { className: "cedros-totp-actions", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => {
          m("status"), x(null);
        },
        children: "Done"
      }
    ) })
  ] }) }) : /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Regenerate recovery codes" }),
    /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "This will invalidate all existing recovery codes. Enter your authenticator code to confirm." }),
    C && /* @__PURE__ */ t("div", { className: "cedros-totp-error", children: /* @__PURE__ */ t(
      ne,
      {
        error: { code: "UNKNOWN_ERROR", message: C },
        onDismiss: () => _(null)
      }
    ) }),
    /* @__PURE__ */ t("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ t(
      Sn,
      {
        value: g,
        onChange: w,
        onComplete: v,
        disabled: E,
        autoFocus: !0
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: () => {
            m("status"), w(""), _(null);
          },
          disabled: E,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: v,
          disabled: E || g.length !== 6,
          children: E ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ t(Y, { size: "sm" }),
            /* @__PURE__ */ t("span", { children: "Regenerating..." })
          ] }) : "Regenerate codes"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ i("div", { className: "cedros-totp-status-header", children: [
      /* @__PURE__ */ i("div", { className: "cedros-totp-status-info", children: [
        /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Two-factor authentication" }),
        /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "Add an extra layer of security to your account by requiring a verification code from your authenticator app when signing in with email and password. Other sign-in methods (Google, Apple, passkeys) use their own built-in verification." })
      ] }),
      /* @__PURE__ */ t(
        "div",
        {
          className: `cedros-totp-badge ${s?.enabled ? "cedros-totp-badge-enabled" : "cedros-totp-badge-disabled"}`,
          children: s?.enabled ? "Enabled" : "Disabled"
        }
      )
    ] }),
    s?.enabled ? /* @__PURE__ */ i("div", { className: "cedros-totp-enabled-actions", children: [
      /* @__PURE__ */ i("div", { className: "cedros-totp-description", style: { marginTop: "0.25rem" }, children: [
        "Recovery codes remaining: ",
        /* @__PURE__ */ t("strong", { children: s.recoveryCodesRemaining })
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: () => m("regenerate"),
          children: "Regenerate recovery codes"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive-outline cedros-button-md",
          onClick: () => m("disable"),
          children: "Disable 2FA"
        }
      )
    ] }) : /* @__PURE__ */ t(
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
class $d {
  client;
  constructor(r, s, o, n) {
    this.client = new oe({ baseUrl: r, timeoutMs: s, retryAttempts: o, getAccessToken: n });
  }
  /**
   * Change the user's password
   *
   * Requires the current password for verification. Also revokes all other sessions
   * and re-encrypts wallet Share A if using password-based wallet protection.
   */
  async changePassword(r) {
    try {
      return await this.client.post("/auth/change-password", r);
    } catch (s) {
      throw V(s, "Failed to change password");
    }
  }
  /**
   * Update user profile (name, picture)
   *
   * NOTE: Requires PATCH /auth/me endpoint on the backend.
   * If not implemented, returns a rejection.
   */
  async updateProfile(r) {
    try {
      return await this.client.patch("/auth/me", r);
    } catch (s) {
      throw V(s, "Failed to update profile");
    }
  }
}
function It() {
  const { config: e, authState: r, _internal: s } = re(), [o, n] = k(!1), [a, c] = k(null), d = q(
    () => new $d(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), l = B(() => {
    c(null);
  }, []), h = B(
    async (u) => {
      if (r !== "authenticated")
        throw new Error("Must be authenticated to update profile");
      n(!0), c(null);
      try {
        return await d.updateProfile(u);
      } catch (p) {
        const g = p instanceof Error ? p : new Error("Failed to update profile");
        throw c(g), g;
      } finally {
        n(!1);
      }
    },
    [r, d]
  ), m = B(
    async (u) => {
      if (r !== "authenticated")
        throw new Error("Must be authenticated to change password");
      n(!0), c(null);
      try {
        await d.changePassword(u);
      } catch (p) {
        const g = p instanceof Error ? p : new Error("Failed to change password");
        throw c(g), g;
      } finally {
        n(!1);
      }
    },
    [r, d]
  );
  return {
    isLoading: o,
    error: a,
    updateProfile: h,
    changePassword: m,
    clearError: l
  };
}
function Vd() {
  const { config: e, _internal: r } = re(), [s, o] = k(!1), [n, a] = k(null), c = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), d = B(async () => {
    o(!0), a(null);
    try {
      return await c.get("/referral", {
        credentials: "include"
      });
    } catch (h) {
      const m = h instanceof Error ? h : new Error(String(h));
      throw a(m), m;
    } finally {
      o(!1);
    }
  }, [c]), l = B(async () => {
    o(!0), a(null);
    try {
      return (await c.post("/referral/regenerate", void 0, {
        credentials: "include"
      })).referralCode;
    } catch (h) {
      const m = h instanceof Error ? h : new Error(String(h));
      throw a(m), m;
    } finally {
      o(!1);
    }
  }, [c]);
  return { getReferral: d, regenerateCode: l, isLoading: s, error: n };
}
function Hd(e) {
  return e?.name ? e.name.split(" ").map((r) => r[0]).join("").toUpperCase().slice(0, 2) : e?.email ? e.email[0].toUpperCase() : "?";
}
function Jh({
  onPasswordChange: e,
  onClose: r,
  className: s = ""
}) {
  const { user: o, refreshUser: n } = Bt(), { config: a, _internal: c } = re(), { isLoading: d, error: l, changePassword: h, updateProfile: m, clearError: u } = It(), [p, g] = k("main"), [w, b] = k(""), [x, E] = k(""), [N, C] = k(""), [_, T] = k(null), [f, v] = k(null), [y, A] = k(!1), L = J(null), [S, R] = k(o?.payoutWalletAddress ?? ""), [P, M] = k(!1), [I, U] = k(!1), [W, z] = k(null), $ = B(async () => {
    const G = S.trim();
    if (G.length > 0 && (G.length < 32 || G.length > 44)) {
      z("Invalid Solana address — must be 32–44 characters.");
      return;
    }
    const Fe = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (G.length > 0 && !Fe.test(G)) {
      z("Invalid Solana address — contains non-base58 characters.");
      return;
    }
    z(null), M(!0);
    try {
      await m({ payoutWalletAddress: G || void 0 }), await n(), U(!0), setTimeout(() => U(!1), 2e3);
    } catch (me) {
      z(me instanceof Error ? me.message : "Failed to save payout wallet");
    } finally {
      M(!1);
    }
  }, [S, m, n]), { getReferral: F, regenerateCode: H, isLoading: Z } = Vd(), [Q, le] = k(null), [D, j] = k(0), [te, ee] = k(!1), [he, _e] = k(!1);
  O(() => {
    F().then((G) => {
      le(G.referralCode), j(G.referralCount), _e(G.directPayoutEnabled);
    }).catch(() => {
    });
  }, []);
  const Se = qr(x), Xe = x === N, Ue = w.length > 0 && x.length > 0 && N.length > 0 && Se.isValid && Xe, De = B(
    async (G) => {
      const Fe = G.target.files?.[0];
      if (Fe) {
        T(null), A(!0);
        try {
          const me = new FormData();
          me.append("file", Fe);
          const at = c?.getAccessToken?.(), it = {};
          at && (it.Authorization = `Bearer ${at}`);
          const Le = await fetch(`${a.serverUrl}/auth/upload/avatar`, {
            method: "POST",
            headers: it,
            body: me,
            credentials: "include"
          });
          if (!Le.ok) {
            const et = await Le.json().catch(() => null);
            throw new Error(et?.message || et?.error || `Upload failed (${Le.status})`);
          }
          await n();
        } catch (me) {
          T(me instanceof Error ? me.message : "Failed to upload avatar");
        } finally {
          A(!1), L.current && (L.current.value = "");
        }
      }
    },
    [a.serverUrl, c, n]
  ), Dt = B(async () => {
    if (Ue) {
      T(null), v(null);
      try {
        await h({
          currentPassword: w,
          newPassword: x
        }), b(""), E(""), C(""), v("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => {
          g("main"), v(null);
        }, 2e3);
      } catch (G) {
        T(G instanceof Error ? G.message : "Failed to change password");
      }
    }
  }, [Ue, w, x, h, e]), Je = B(() => {
    g("main"), b(""), E(""), C(""), T(null), u();
  }, [u]);
  return p === "change-password" ? /* @__PURE__ */ t("div", { className: `cedros-profile-settings ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ t("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (_ || l) && /* @__PURE__ */ t("div", { className: "cedros-profile-error", children: /* @__PURE__ */ t(
      ne,
      {
        error: { code: "UNKNOWN_ERROR", message: _ || l?.message || "" },
        onDismiss: () => {
          T(null), u();
        }
      }
    ) }),
    f && /* @__PURE__ */ i("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ t("span", { className: "cedros-profile-success-icon", children: "✓" }),
      f
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ t("div", { className: "cedros-profile-field", children: /* @__PURE__ */ t(
        ye,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: w,
          onChange: (G) => b(G.target.value),
          disabled: d,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-field", children: /* @__PURE__ */ t(
        ye,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: x,
          onChange: (G) => E(G.target.value),
          disabled: d,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-field", children: /* @__PURE__ */ t(
        ye,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: N,
          onChange: (G) => C(G.target.value),
          disabled: d,
          error: N.length > 0 && !Xe ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: Je,
          disabled: d,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: Dt,
          disabled: d || !Ue,
          children: d ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ t(Y, { size: "sm" }),
            /* @__PURE__ */ t("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ t("div", { className: `cedros-profile-settings ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ i("div", { className: "cedros-profile-header", children: [
      /* @__PURE__ */ i(
        "div",
        {
          className: "cedros-profile-avatar-container cedros-profile-avatar-container--clickable",
          onClick: () => L.current?.click(),
          role: "button",
          tabIndex: 0,
          onKeyDown: (G) => {
            (G.key === "Enter" || G.key === " ") && (G.preventDefault(), L.current?.click());
          },
          "aria-label": "Change profile picture",
          children: [
            y ? /* @__PURE__ */ t("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: /* @__PURE__ */ t(Y, { size: "sm" }) }) : o?.picture ? /* @__PURE__ */ t(
              "img",
              {
                src: o.picture,
                alt: o.name || "Profile",
                className: "cedros-profile-avatar"
              }
            ) : /* @__PURE__ */ t("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: Hd(o) }),
            /* @__PURE__ */ t("div", { className: "cedros-profile-avatar-overlay", children: /* @__PURE__ */ i("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ t("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
              /* @__PURE__ */ t("circle", { cx: "12", cy: "13", r: "4" })
            ] }) }),
            /* @__PURE__ */ t(
              "input",
              {
                ref: L,
                type: "file",
                accept: "image/jpeg,image/png,image/gif,image/webp",
                onChange: De,
                className: "cedros-profile-avatar-input",
                "aria-hidden": "true",
                tabIndex: -1
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ i("div", { className: "cedros-profile-info", children: [
        /* @__PURE__ */ t("h3", { className: "cedros-profile-name", children: o?.name || "User" }),
        /* @__PURE__ */ t("p", { className: "cedros-profile-email", children: o?.email })
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-profile-section-title", children: "Account" }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-row", children: /* @__PURE__ */ i("div", { className: "cedros-profile-row-content", children: [
        /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Email" }),
        /* @__PURE__ */ t("span", { className: "cedros-profile-row-value", children: o?.email || "Not set" })
      ] }) }),
      /* @__PURE__ */ i("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ i("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Password" }),
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-value", children: "••••••••" })
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => g("change-password"),
            children: "Change"
          }
        )
      ] })
    ] }),
    Q && /* @__PURE__ */ i("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-profile-section-title", children: "Referral" }),
      /* @__PURE__ */ i("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ i("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Your code" }),
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-value cedros-profile-row-value--mono", children: Q })
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => {
              navigator.clipboard.writeText(Q), ee(!0), setTimeout(() => ee(!1), 2e3);
            },
            children: te ? "Copied" : "Copy"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ i("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Referrals" }),
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-value", children: D })
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: async () => {
              try {
                const G = await H();
                le(G);
              } catch {
              }
            },
            disabled: Z,
            children: Z ? "Regenerating..." : "Regenerate"
          }
        )
      ] })
    ] }),
    he && /* @__PURE__ */ i("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-profile-section-title", children: "Payout wallet" }),
      /* @__PURE__ */ t("p", { className: "cedros-profile-description", children: "Solana wallet address to receive direct referral payouts when enabled by the platform." }),
      /* @__PURE__ */ i("div", { className: "cedros-profile-row cedros-profile-row--column", children: [
        /* @__PURE__ */ t(
          "input",
          {
            type: "text",
            className: "cedros-input",
            placeholder: "Solana wallet address (base58)",
            value: S,
            onChange: (G) => {
              R(G.target.value), z(null);
            },
            disabled: P,
            maxLength: 44
          }
        ),
        W && /* @__PURE__ */ t("span", { className: "cedros-profile-error-text", children: W }),
        I && /* @__PURE__ */ t("span", { className: "cedros-profile-success-text", children: "Saved." })
      ] }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-actions", children: /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: $,
          disabled: P,
          children: P ? "Saving..." : "Save wallet"
        }
      ) })
    ] }),
    r && /* @__PURE__ */ t("div", { className: "cedros-profile-footer", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md",
        onClick: r,
        children: "Close"
      }
    ) })
  ] }) });
}
class Gd {
  client;
  constructor(r, s, o, n) {
    this.client = new oe({ baseUrl: r, timeoutMs: s, retryAttempts: o, getAccessToken: n });
  }
  /**
   * List all credentials linked to the current user
   */
  async listCredentials() {
    try {
      return (await this.client.get("/credentials")).credentials;
    } catch (r) {
      throw V(r, "Failed to list credentials");
    }
  }
  /**
   * Unlink (delete) a credential by ID.
   * The server prevents removing the last primary credential.
   */
  async unlinkCredential(r) {
    try {
      await this.client.delete(`/credentials/${encodeURIComponent(r)}`);
    } catch (s) {
      throw V(s, "Failed to unlink credential");
    }
  }
}
function Ao() {
  const { config: e, authState: r, _internal: s } = re(), [o, n] = k([]), [a, c] = k(!1), [d, l] = k(null), h = q(
    () => new Gd(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), m = B(() => {
    l(null);
  }, []), u = B(async () => {
    if (r !== "authenticated") {
      n([]);
      return;
    }
    c(!0), l(null);
    try {
      const g = await h.listCredentials();
      n(g);
    } catch (g) {
      l(g);
    } finally {
      c(!1);
    }
  }, [r, h]);
  O(() => {
    r === "authenticated" ? u() : n([]);
  }, [r, u]);
  const p = B(
    async (g) => {
      c(!0), l(null);
      try {
        await h.unlinkCredential(g), await u();
      } catch (w) {
        throw l(w), w;
      } finally {
        c(!1);
      }
    },
    [h, u]
  );
  return {
    credentials: o,
    isLoading: a,
    error: d,
    fetchCredentials: u,
    unlinkCredential: p,
    clearError: m
  };
}
function Qd({
  onPasswordChange: e,
  onCancel: r,
  className: s = ""
}) {
  const { isLoading: o, error: n, changePassword: a, clearError: c } = It(), [d, l] = k(""), [h, m] = k(""), [u, p] = k(""), [g, w] = k(null), [b, x] = k(null), E = qr(h), N = h === u, C = d.length > 0 && h.length > 0 && u.length > 0 && E.isValid && N, _ = B(async () => {
    if (C) {
      w(null), x(null);
      try {
        await a({ currentPassword: d, newPassword: h }), l(""), m(""), p(""), x("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => r(), 2e3);
      } catch (f) {
        w(f instanceof Error ? f.message : "Failed to change password");
      }
    }
  }, [C, d, h, a, e, r]), T = B(() => {
    w(null), c(), r();
  }, [c, r]);
  return /* @__PURE__ */ t("div", { className: `cedros-profile-settings ${s}`, children: /* @__PURE__ */ i("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ t("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (g || n) && /* @__PURE__ */ t("div", { className: "cedros-profile-error", children: /* @__PURE__ */ t(
      ne,
      {
        error: { code: "UNKNOWN_ERROR", message: g || n?.message || "" },
        onDismiss: () => {
          w(null), c();
        }
      }
    ) }),
    b && /* @__PURE__ */ i("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ t("span", { className: "cedros-profile-success-icon", children: "✓" }),
      b
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ t("div", { className: "cedros-profile-field", children: /* @__PURE__ */ t(
        ye,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: d,
          onChange: (f) => l(f.target.value),
          disabled: o,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-field", children: /* @__PURE__ */ t(
        ye,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: h,
          onChange: (f) => m(f.target.value),
          disabled: o,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-field", children: /* @__PURE__ */ t(
        ye,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: u,
          onChange: (f) => p(f.target.value),
          disabled: o,
          error: u.length > 0 && !N ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: T,
          disabled: o,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: _,
          disabled: o || !C,
          children: o ? /* @__PURE__ */ i(X, { children: [
            /* @__PURE__ */ t(Y, { size: "sm" }),
            /* @__PURE__ */ t("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) });
}
function Yd({ onPasswordChange: e, className: r = "" }) {
  const { user: s, refreshUser: o } = Bt(), { isLoading: n, error: a, updateProfile: c, clearError: d } = It(), { credentials: l } = Ao(), {
    forgotPassword: h,
    isLoading: m,
    isSuccess: u,
    reset: p
  } = aa(), g = l.some((A) => A.credentialType === "password"), [w, b] = k("view"), [x, E] = k(""), [N, C] = k(null), _ = () => s?.name ? s.name.split(" ").map((A) => A[0]).join("").toUpperCase().slice(0, 2) : s?.email ? s.email[0].toUpperCase() : "?", T = B(() => {
    E(s?.name || ""), b("edit"), C(null);
  }, [s?.name]), f = B(async () => {
    const A = x.trim();
    if (A) {
      C(null);
      try {
        await c({ name: A }), await o(), b("view");
      } catch (L) {
        C(L instanceof Error ? L.message : "Failed to update name");
      }
    }
  }, [x, c, o]), v = B(() => {
    b("view"), E(""), C(null), d();
  }, [d]), y = async () => {
    if (s?.email) {
      C(null);
      try {
        await h(s.email);
      } catch (A) {
        C(A instanceof Error ? A.message : "Failed to send password setup email");
      }
    }
  };
  return w === "change-password" ? /* @__PURE__ */ t(
    Qd,
    {
      onPasswordChange: e,
      onCancel: () => b("view"),
      className: r
    }
  ) : /* @__PURE__ */ t("div", { className: `cedros-profile-settings ${r}`, children: /* @__PURE__ */ i("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ i("div", { className: "cedros-profile-header", children: [
      /* @__PURE__ */ t("div", { className: "cedros-profile-avatar-container", children: s?.picture ? /* @__PURE__ */ t(
        "img",
        {
          src: s.picture,
          alt: s.name || "Profile",
          className: "cedros-profile-avatar"
        }
      ) : /* @__PURE__ */ t("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: _() }) }),
      /* @__PURE__ */ i("div", { className: "cedros-profile-info", children: [
        w === "edit" ? /* @__PURE__ */ i("div", { className: "cedros-profile-name-edit", children: [
          /* @__PURE__ */ t(
            "input",
            {
              type: "text",
              className: "cedros-input",
              value: x,
              onChange: (A) => E(A.target.value),
              disabled: n,
              autoFocus: !0,
              onKeyDown: (A) => {
                A.key === "Enter" && f(), A.key === "Escape" && v();
              }
            }
          ),
          /* @__PURE__ */ i("div", { className: "cedros-profile-name-edit-actions", children: [
            /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary cedros-button-sm",
                onClick: f,
                disabled: n || !x.trim(),
                children: n ? /* @__PURE__ */ t(Y, { size: "sm" }) : "Save"
              }
            ),
            /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-outline cedros-button-sm",
                onClick: v,
                disabled: n,
                children: "Cancel"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ i("div", { className: "cedros-profile-name-row", children: [
          /* @__PURE__ */ t("h3", { className: "cedros-profile-name", children: s?.name || "User" }),
          /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-profile-edit-btn",
              onClick: T,
              title: "Edit name",
              "aria-label": "Edit name",
              children: /* @__PURE__ */ t(Kd, {})
            }
          )
        ] }),
        /* @__PURE__ */ t("p", { className: "cedros-profile-email", children: s?.email })
      ] })
    ] }),
    (N || a) && /* @__PURE__ */ t("div", { className: "cedros-profile-error", children: /* @__PURE__ */ t(
      ne,
      {
        error: { code: "UNKNOWN_ERROR", message: N || a?.message || "" },
        onDismiss: () => {
          C(null), d();
        }
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-profile-section-title", children: "Account" }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-row", children: /* @__PURE__ */ i("div", { className: "cedros-profile-row-content", children: [
        /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Email" }),
        /* @__PURE__ */ t("span", { className: "cedros-profile-row-value", children: s?.email || "Not set" })
      ] }) }),
      /* @__PURE__ */ i("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ i("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Password" }),
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-value", children: g ? "••••••••" : "Not set" })
        ] }),
        g ? /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => {
              b("change-password"), C(null);
            },
            children: "Change"
          }
        ) : u ? /* @__PURE__ */ i("span", { className: "cedros-profile-row-sent", children: [
          "Check your email",
          /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-profile-row-sent-dismiss",
              onClick: p,
              "aria-label": "Dismiss",
              children: "×"
            }
          )
        ] }) : /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: y,
            disabled: m,
            children: m ? /* @__PURE__ */ t(Y, { size: "sm" }) : "Add password"
          }
        )
      ] })
    ] })
  ] }) });
}
function Kd() {
  return /* @__PURE__ */ i("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t(
      "path",
      {
        d: "M16.474 5.408l2.118 2.117m-.756-3.982L12.109 9.27a2.118 2.118 0 00-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 10-2.621-2.621z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ t(
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
const No = {
  password: "Email & Password",
  oauth_google: "Google",
  oauth_apple: "Apple",
  solana: "Solana Wallet",
  webauthn_passkey: "Passkey",
  webauthn_security_key: "Security Key",
  totp: "Authenticator App (2FA)",
  sso_oidc: "Single Sign-On"
};
function Zd({
  onLinkGoogle: e,
  onLinkApple: r,
  onAddPasskey: s,
  onLinkSolana: o,
  className: n = ""
}) {
  const { credentials: a, isLoading: c, error: d, unlinkCredential: l, clearError: h, fetchCredentials: m } = Ao(), { registerPasskey: u, isSupported: p } = ia(), [g, w] = k(null), [b, x] = k(!1), E = B(async () => {
    if (s) {
      s();
      return;
    }
    x(!0);
    try {
      await u(), await m();
    } catch {
    } finally {
      x(!1);
    }
  }, [s, u, m]), N = B(
    async (A) => {
      const L = A.label || No[A.credentialType];
      if (window.confirm(
        `Remove "${L}" as a sign-in method? You won't be able to sign in with it anymore.`
      )) {
        w(A.id);
        try {
          await l(A.id);
        } catch {
        } finally {
          w(null);
        }
      }
    },
    [l]
  ), C = new Set(a.map((A) => A.credentialType)), _ = e && !C.has("oauth_google"), T = r && !C.has("oauth_apple"), f = (s || p) && !C.has("webauthn_passkey"), v = o && !C.has("solana"), y = _ || T || f || v;
  return c && a.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-linked-accounts ${n}`, children: [
    /* @__PURE__ */ t(Y, {}),
    /* @__PURE__ */ t("span", { children: "Loading linked accounts..." })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-linked-accounts ${n}`, children: [
    d && /* @__PURE__ */ t(
      ne,
      {
        error: { code: "UNKNOWN_ERROR", message: d.message },
        onDismiss: h
      }
    ),
    a.length === 0 && !c && /* @__PURE__ */ t("p", { className: "cedros-linked-accounts-empty", children: "No linked sign-in methods found." }),
    a.length > 0 && /* @__PURE__ */ t("ul", { className: "cedros-linked-credential-list", children: a.map((A) => /* @__PURE__ */ t(
      Xd,
      {
        credential: A,
        isUnlinking: g === A.id,
        onUnlink: N
      },
      A.id
    )) }),
    y && /* @__PURE__ */ i("div", { className: "cedros-linked-add", children: [
      /* @__PURE__ */ t("p", { className: "cedros-linked-add-label", children: "Link a new sign-in method" }),
      /* @__PURE__ */ i("div", { className: "cedros-linked-add-buttons", children: [
        _ && /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: e,
            children: [
              /* @__PURE__ */ t(ko, {}),
              " Google"
            ]
          }
        ),
        T && /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: r,
            children: [
              /* @__PURE__ */ t(Co, {}),
              " Apple"
            ]
          }
        ),
        f && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: E,
            disabled: b,
            children: b ? /* @__PURE__ */ t(Y, { size: "sm" }) : /* @__PURE__ */ i(X, { children: [
              /* @__PURE__ */ t(Ur, {}),
              " Passkey"
            ] })
          }
        ),
        v && /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: o,
            children: [
              /* @__PURE__ */ t(Eo, {}),
              " Solana"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function Xd({
  credential: e,
  isUnlinking: r,
  onUnlink: s
}) {
  const o = e.label || No[e.credentialType], n = Jd[e.credentialType] || eu;
  return /* @__PURE__ */ i("li", { className: "cedros-linked-credential", children: [
    /* @__PURE__ */ t("div", { className: "cedros-linked-credential__icon", children: /* @__PURE__ */ t(n, {}) }),
    /* @__PURE__ */ i("div", { className: "cedros-linked-credential__info", children: [
      /* @__PURE__ */ t("span", { className: "cedros-linked-credential__name", children: o }),
      /* @__PURE__ */ i("span", { className: "cedros-linked-credential__meta", children: [
        "Added ",
        un(e.createdAt),
        e.lastUsedAt && /* @__PURE__ */ i(X, { children: [
          " · Last used ",
          un(e.lastUsedAt)
        ] }),
        e.isPrimary && /* @__PURE__ */ t(X, { children: " · Primary" })
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-linked-credential__action", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm cedros-button-danger-outline",
        onClick: () => s(e),
        disabled: r,
        title: e.isPrimary ? "Cannot remove primary sign-in method" : "Remove",
        children: r ? /* @__PURE__ */ t(Y, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function un(e) {
  const r = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - r.getTime(), n = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), c = Math.floor(o / (1e3 * 60 * 60 * 24));
  return n < 1 ? "just now" : n < 60 ? `${n}m ago` : a < 24 ? `${a}h ago` : c < 30 ? `${c}d ago` : r.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
const Jd = {
  password: tu,
  oauth_google: ko,
  oauth_apple: Co,
  solana: Eo,
  webauthn_passkey: Ur,
  webauthn_security_key: Ur,
  totp: ru,
  sso_oidc: su
};
function eu() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("path", { d: "M12 8v4m0 4h.01", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function tu() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("path", { d: "M7 11V7a5 5 0 0110 0v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ t("circle", { cx: "12", cy: "16", r: "1.5", fill: "currentColor" })
  ] });
}
function ko() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("path", { d: "M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 01-2 3.1v2.5h3.3c1.9-1.7 3-4.3 3-7.4z", fill: "#4285F4" }),
    /* @__PURE__ */ t("path", { d: "M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.5c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.4-4H3.2v2.6A10 10 0 0012 22z", fill: "#34A853" }),
    /* @__PURE__ */ t("path", { d: "M6.6 14.1a6 6 0 010-4.2V7.3H3.2a10 10 0 000 9.4l3.4-2.6z", fill: "#FBBC05" }),
    /* @__PURE__ */ t("path", { d: "M12 5.9c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0012 2 10 10 0 003.2 7.3l3.4 2.6C7.3 7.6 9.5 5.9 12 5.9z", fill: "#EA4335" })
  ] });
}
function Co() {
  return /* @__PURE__ */ t("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ t(
    "path",
    {
      d: "M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.16 4.36 9.53 8.72 9.28c1.3.07 2.2.74 2.96.8.93-.2 1.82-.92 3.03-.83 1.47.12 2.57.72 3.28 1.83-3.02 1.8-2.3 5.75.5 6.86-.6 1.53-1.37 3.04-2.44 4.34zM12.03 9.2C11.88 7.17 13.5 5.5 15.4 5.35c.29 2.28-2.08 3.98-3.37 3.85z",
      fill: "currentColor"
    }
  ) });
}
function Eo() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("rect", { x: "2", y: "6", width: "20", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("path", { d: "M2 10h20", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("circle", { cx: "17", cy: "14", r: "1.5", fill: "currentColor" })
  ] });
}
function Ur() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("circle", { cx: "10", cy: "7", r: "4", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("path", { d: "M3 21v-2a7 7 0 017-7", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ t("path", { d: "M17 14v4m0 0v2m0-2h-2m2 0h2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function ru() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("path", { d: "M9 12h6M12 9v6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function su() {
  return /* @__PURE__ */ i("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("rect", { x: "3", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("rect", { x: "13", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("rect", { x: "3", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("rect", { x: "13", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" })
  ] });
}
const nu = "DELETE";
function ou() {
  const { config: e, logout: r } = re(), [s, o] = k(!1), [n, a] = k(null), c = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), d = q(
    () => `${e.serverUrl.replace(/\/$/, "")}/account-deletion`,
    [e.serverUrl]
  ), l = B(() => {
    a(null);
  }, []), h = B(
    async (u) => {
      o(!0), a(null);
      try {
        await c.post("/account-deletion/request", { email: u });
      } catch (p) {
        const g = V(
          p,
          "Unable to send the account deletion link. Please try again."
        );
        throw a(g), g;
      } finally {
        o(!1);
      }
    },
    [c]
  ), m = B(
    async (u = nu) => {
      o(!0), a(null);
      try {
        await c.post("/account-deletion/me", { confirmText: u }), await r().catch(() => {
        });
      } catch (p) {
        const g = V(
          p,
          "Unable to delete the account. Please review the requirements and try again."
        );
        throw a(g), g;
      } finally {
        o(!1);
      }
    },
    [c, r]
  );
  return {
    isLoading: s,
    error: n,
    accountDeletionUrl: d,
    requestDeletionEmail: h,
    deleteAccount: m,
    clearError: l
  };
}
const Nr = "DELETE";
function au({
  onDeleted: e,
  className: r = ""
}) {
  const { deleteAccount: s, accountDeletionUrl: o, isLoading: n, error: a, clearError: c } = ou(), [d, l] = k(""), [h, m] = k(null), u = B(async () => {
    window.confirm(
      "This permanently removes your login profile and signs you out. Financial and audit records required by law may still be retained. Continue?"
    ) && (m(null), await s(d), m("Your account has been deleted."), e?.());
  }, [d, s, e]);
  return /* @__PURE__ */ i("section", { className: `cedros-account-delete ${r}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-account-delete-header", children: [
      /* @__PURE__ */ i("div", { children: [
        /* @__PURE__ */ t("h3", { className: "cedros-account-delete-title", children: "Delete account" }),
        /* @__PURE__ */ t("p", { className: "cedros-account-delete-description", children: "Remove this login profile from the app. Sessions, passkeys, MFA, API keys, and linked Apple credentials will be revoked." })
      ] }),
      /* @__PURE__ */ t(
        "a",
        {
          className: "cedros-account-delete-link",
          href: o,
          target: "_blank",
          rel: "noreferrer",
          children: "Hosted deletion portal"
        }
      )
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-warning-box cedros-account-delete-warning", children: /* @__PURE__ */ i("div", { className: "cedros-warning-content", children: [
      /* @__PURE__ */ t("strong", { children: "Before you continue" }),
      /* @__PURE__ */ i("p", { children: [
        "Type ",
        /* @__PURE__ */ t("code", { children: Nr }),
        " to confirm. Organization ownership may need to be transferred first, and records required for financial or legal compliance may be retained in anonymized form."
      ] })
    ] }) }),
    a && /* @__PURE__ */ t(ne, { error: a, onDismiss: c }),
    h && /* @__PURE__ */ t("div", { className: "cedros-account-delete-success", children: h }),
    /* @__PURE__ */ t("label", { className: "cedros-label", htmlFor: "cedros-delete-account-confirm", children: "Confirmation text" }),
    /* @__PURE__ */ t(
      "input",
      {
        id: "cedros-delete-account-confirm",
        className: "cedros-input",
        type: "text",
        autoComplete: "off",
        spellCheck: !1,
        placeholder: Nr,
        value: d,
        onChange: (p) => l(p.target.value),
        disabled: n
      }
    ),
    /* @__PURE__ */ t("p", { className: "cedros-account-delete-hint", children: "Use the hosted deletion portal if the user is already signed out and still needs the public deletion path required by Google Play." }),
    /* @__PURE__ */ t("div", { className: "cedros-account-delete-actions", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: () => {
          u();
        },
        disabled: n || d.trim() !== Nr,
        children: n ? /* @__PURE__ */ i(X, { children: [
          /* @__PURE__ */ t(Y, { size: "sm" }),
          /* @__PURE__ */ t("span", { children: "Deleting account..." })
        ] }) : "Delete account"
      }
    ) })
  ] });
}
class iu {
  client;
  constructor(r, s, o, n) {
    this.client = new oe({ baseUrl: r, timeoutMs: s, retryAttempts: o, getAccessToken: n });
  }
  /**
   * List all active sessions for the current user
   */
  async listSessions() {
    try {
      return (await this.client.get("/sessions")).sessions;
    } catch (r) {
      throw V(r, "Failed to list sessions");
    }
  }
  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions() {
    try {
      return await this.client.delete("/sessions");
    } catch (r) {
      throw V(r, "Failed to revoke sessions");
    }
  }
}
function cu() {
  const { config: e, authState: r, _internal: s } = re(), [o, n] = k([]), [a, c] = k(!1), [d, l] = k(null), h = q(
    () => new iu(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), m = B(async () => {
    if (r !== "authenticated") {
      n([]);
      return;
    }
    c(!0), l(null);
    try {
      const g = await h.listSessions();
      n(g);
    } catch (g) {
      l(g);
    } finally {
      c(!1);
    }
  }, [r, h]);
  O(() => {
    r === "authenticated" ? m() : n([]);
  }, [r, m]);
  const u = B(async () => {
    c(!0), l(null);
    try {
      const g = await h.revokeAllSessions();
      return await m(), g;
    } catch (g) {
      throw l(g), g;
    } finally {
      c(!1);
    }
  }, [h, m]), p = q(() => o.filter((g) => !g.isCurrent).length, [o]);
  return {
    sessions: o,
    isLoading: a,
    error: d,
    fetchSessions: m,
    revokeAllSessions: u,
    otherSessionCount: p
  };
}
const lu = {
  profile: "Profile",
  security: "Security",
  linked: "Linked Accounts"
}, du = ["profile", "security", "linked"];
function em({
  defaultTab: e = "profile",
  onClose: r,
  onPasswordChange: s,
  onTotpChange: o,
  onAccountDeleted: n,
  onLinkGoogle: a,
  onLinkApple: c,
  onAddPasskey: d,
  onLinkSolana: l,
  className: h = ""
}) {
  const [m, u] = k(e), { sessions: p, isLoading: g, error: w, revokeAllSessions: b } = cu();
  return /* @__PURE__ */ i("div", { className: `cedros-account-settings ${h}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-account-tabs--line", role: "tablist", children: du.map((x) => /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        role: "tab",
        "aria-selected": m === x,
        className: `cedros-account-tab ${m === x ? "cedros-account-tab-active" : ""}`,
        onClick: () => u(x),
        children: lu[x]
      },
      x
    )) }),
    /* @__PURE__ */ i("div", { className: "cedros-account-tab-content", role: "tabpanel", children: [
      m === "profile" && /* @__PURE__ */ t(Yd, { onPasswordChange: s }),
      m === "security" && /* @__PURE__ */ i("div", { className: "cedros-account-security", children: [
        /* @__PURE__ */ t(jd, { onStatusChange: o }),
        /* @__PURE__ */ t(
          qc,
          {
            sessions: p,
            isLoading: g,
            error: w ?? void 0,
            onRevokeAll: async () => {
              await b();
            }
          }
        ),
        /* @__PURE__ */ t(au, { onDeleted: n })
      ] }),
      m === "linked" && /* @__PURE__ */ t(
        Zd,
        {
          onLinkGoogle: a,
          onLinkApple: c,
          onAddPasskey: d,
          onLinkSolana: l
        }
      )
    ] }),
    r && /* @__PURE__ */ t("div", { className: "cedros-account-footer", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md",
        onClick: r,
        children: "Close"
      }
    ) })
  ] });
}
function tm({ onComplete: e, className: r }) {
  return /* @__PURE__ */ i("div", { className: `cedros-mfa-setup-prompt ${r ?? ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-mfa-setup-prompt__header", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-mfa-setup-prompt__title", children: "Two-factor authentication required" }),
      /* @__PURE__ */ t("p", { className: "cedros-mfa-setup-prompt__description", children: "Your administrator requires you to set up two-factor authentication before continuing. This adds an extra layer of security to your account." })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-mfa-setup-prompt__body", children: /* @__PURE__ */ t(vo, { onSuccess: e }) })
  ] });
}
function rm({
  onComplete: e,
  onSkip: r,
  className: s
}) {
  const { user: o } = Bt(), { isLoading: n, error: a, updateProfile: c, clearError: d } = It(), [l, h] = k(o?.name ?? ""), m = B(
    async (p) => {
      p.preventDefault(), d();
      const g = l.trim();
      if (!g) {
        e?.();
        return;
      }
      try {
        await c({ name: g }), e?.();
      } catch {
      }
    },
    [l, c, d, e]
  ), u = l.trim().length > 0;
  return /* @__PURE__ */ i("div", { className: `cedros-complete-account ${s ?? ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-complete-account__header", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-complete-account__title", children: "Complete Your Profile" }),
      /* @__PURE__ */ t("p", { className: "cedros-complete-account__description", children: "Please fill in your name to get started." })
    ] }),
    /* @__PURE__ */ i("form", { onSubmit: m, className: "cedros-complete-account__form", children: [
      /* @__PURE__ */ i("div", { className: "cedros-complete-account__field", children: [
        /* @__PURE__ */ t(
          "label",
          {
            htmlFor: "cedros-complete-name",
            className: "cedros-complete-account__label",
            children: "Name"
          }
        ),
        /* @__PURE__ */ t(
          "input",
          {
            id: "cedros-complete-name",
            type: "text",
            value: l,
            onChange: (p) => h(p.target.value),
            placeholder: "Enter your name",
            className: "cedros-complete-account__input",
            maxLength: 100,
            autoFocus: !0
          }
        )
      ] }),
      a && /* @__PURE__ */ t("div", { className: "cedros-complete-account__error", role: "alert", children: a.message }),
      /* @__PURE__ */ i("div", { className: "cedros-complete-account__actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "submit",
            className: "cedros-complete-account__button cedros-complete-account__button--primary",
            disabled: n || !u,
            children: n ? "Saving..." : "Save"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-complete-account__button cedros-complete-account__button--secondary",
            onClick: r,
            disabled: n,
            children: "Skip"
          }
        )
      ] })
    ] })
  ] });
}
function uu() {
  const { config: e, _internal: r } = re(), [s, o] = k(!1), [n, a] = k(null), c = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), d = B(
    async (m) => await c.get(
      `/username/available?username=${encodeURIComponent(m)}`,
      { credentials: "include" }
    ),
    [c]
  ), l = B(async () => {
    try {
      return (await c.get(
        "/username/available?username=",
        { credentials: "include" }
      )).suggestion ?? null;
    } catch {
      return null;
    }
  }, [c]), h = B(
    async (m) => {
      o(!0), a(null);
      try {
        await c.patch("/me", { username: m });
      } catch (u) {
        const p = u instanceof Error ? u : new Error(String(u));
        throw a(p), p;
      } finally {
        o(!1);
      }
    },
    [c]
  );
  return { checkAvailability: d, getSuggestion: l, setUsername: h, isLoading: s, error: n };
}
function sm({
  onComplete: e,
  onSkip: r,
  className: s
}) {
  const { checkAvailability: o, getSuggestion: n, setUsername: a, isLoading: c, error: d } = uu(), [l, h] = k(""), [m, u] = k("idle"), [p, g] = k(""), w = J(null), b = J(!0);
  O(() => (b.current = !0, n().then((C) => {
    b.current && C && (h(C), u("available"), g("Available"));
  }), () => {
    b.current = !1;
  }), [n]);
  const x = B(
    (C) => {
      const _ = C.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (h(_), u("idle"), g(""), w.current && clearTimeout(w.current), _.length < 3) {
        _.length > 0 && (u("error"), g("At least 3 characters"));
        return;
      }
      u("checking"), w.current = setTimeout(async () => {
        try {
          const T = await o(_);
          if (!b.current) return;
          T.error ? (u("error"), g(T.error)) : T.available ? (u("available"), g("Available")) : (u("taken"), g("Already taken"), T.suggestion);
        } catch {
          if (!b.current) return;
          u("error"), g("Could not check availability");
        }
      }, 400);
    },
    [o]
  ), E = B(
    async (C) => {
      if (C.preventDefault(), !(m !== "available" || !l.trim()))
        try {
          await a(l.trim()), e?.();
        } catch {
        }
    },
    [l, m, a, e]
  ), N = m === "available" && !c;
  return /* @__PURE__ */ i("div", { className: `cedros-choose-username ${s ?? ""}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-choose-username__header", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-choose-username__title", children: "Choose a Username" }),
      /* @__PURE__ */ t("p", { className: "cedros-choose-username__description", children: "Pick a unique handle for your account." })
    ] }),
    /* @__PURE__ */ i("form", { onSubmit: E, className: "cedros-choose-username__form", children: [
      /* @__PURE__ */ i("div", { className: "cedros-choose-username__field", children: [
        /* @__PURE__ */ t(
          "label",
          {
            htmlFor: "cedros-choose-username",
            className: "cedros-choose-username__label",
            children: "Username"
          }
        ),
        /* @__PURE__ */ i("div", { className: "cedros-choose-username__input-wrapper", children: [
          /* @__PURE__ */ t("span", { className: "cedros-choose-username__prefix", children: "@" }),
          /* @__PURE__ */ t(
            "input",
            {
              id: "cedros-choose-username",
              type: "text",
              value: l,
              onChange: (C) => x(C.target.value),
              placeholder: "swift_falcon_42",
              className: "cedros-choose-username__input",
              maxLength: 30,
              autoFocus: !0,
              autoComplete: "off",
              spellCheck: !1
            }
          )
        ] }),
        p && /* @__PURE__ */ t(
          "span",
          {
            className: `cedros-choose-username__status cedros-choose-username__status--${m}`,
            role: m === "error" || m === "taken" ? "alert" : void 0,
            children: m === "checking" ? "Checking..." : p
          }
        )
      ] }),
      d && /* @__PURE__ */ t("div", { className: "cedros-choose-username__error", role: "alert", children: d.message }),
      /* @__PURE__ */ i("div", { className: "cedros-choose-username__actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "submit",
            className: "cedros-choose-username__button cedros-choose-username__button--primary",
            disabled: !N,
            children: c ? "Saving..." : "Continue"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-choose-username__button cedros-choose-username__button--secondary",
            onClick: r,
            disabled: c,
            children: "Skip"
          }
        )
      ] })
    ] })
  ] });
}
function hu() {
  const e = ze(), [r, s] = k(!1), [o, n] = k(null), a = q(() => e ? new oe({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), c = B(() => {
    n(null);
  }, []), d = B(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      if (!Number.isInteger(w) || w <= 0) {
        const b = new Error(
          `Invalid deposit amount: ${w}. Must be a positive integer (lamports).`
        );
        throw n(b.message), b;
      }
      s(!0), n(null);
      try {
        return await a.post("/deposit", {
          amount_lamports: w
        });
      } catch (b) {
        const x = V(b, "Failed to execute deposit");
        throw n(x.message), x;
      } finally {
        s(!1);
      }
    },
    [a]
  ), l = B(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      return await a.get(`/deposit/status/${encodeURIComponent(w)}`);
    },
    [a]
  ), h = B(async () => {
    if (!a)
      throw new Error("useDeposit must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await a.get("/deposit/config");
    } catch (w) {
      const b = V(w, "Failed to get deposit config");
      throw n(b.message), b;
    } finally {
      s(!1);
    }
  }, [a]), m = B(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const b = new URLSearchParams();
        w?.limit !== void 0 && b.set("limit", String(w.limit)), w?.offset !== void 0 && b.set("offset", String(w.offset));
        const x = b.toString(), E = x ? `/deposits?${x}` : "/deposits";
        return await a.get(E);
      } catch (b) {
        const x = V(b, "Failed to list deposits");
        throw n(x.message), x;
      } finally {
        s(!1);
      }
    },
    [a]
  ), u = B(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const b = new URLSearchParams({
          input_mint: w.inputMint,
          amount: String(w.amount),
          taker: w.taker
        });
        return await a.get(`/deposit/quote?${b}`);
      } catch (b) {
        const x = V(b, "Failed to get deposit quote");
        throw n(x.message), x;
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
      } catch (b) {
        const x = V(b, "Failed to execute public deposit");
        throw n(x.message), x;
      } finally {
        s(!1);
      }
    },
    [a]
  ), g = B(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await a.post("/deposit/micro", w);
      } catch (b) {
        const x = V(b, "Failed to execute micro deposit");
        throw n(x.message), x;
      } finally {
        s(!1);
      }
    },
    [a]
  );
  return {
    deposit: d,
    getQuote: u,
    publicDeposit: p,
    microDeposit: g,
    getStatus: l,
    getConfig: h,
    listDeposits: m,
    isLoading: r,
    error: o,
    clearError: c
  };
}
const Xr = "data:image/webp;base64,UklGRkACAABXRUJQVlA4IDQCAACQDQCdASo8ADwAPjEWiUMiISEUBFQgAwSgB4Z/TeLt3XMAoQH23eph0gPMB+sn+M9tvngOsA9ADwgPg3/cH9sfZciikEBuA1AB+nf+84CUkAVvA2x4xvyobR+mBaYhjUv/ewHb4hTqOnP38rzsxZX2inOSciAA/v7uqvqGdpWcjjrfMDFaNHumTog38t3yor0kbjn631VsX61cAC749wWuAX74u/f/hpeDFqS/ci8E1g94wk9UVs7BHqtv7f/M9iT1u5ITJV0Gv6tE/CW5j/nVR6yExJ6JoDRDOWQ8zVpWH92r3Lnbnc4WJpOchbRT3H5rv//6PP+F//4ehLUlR/4tkRUKZu/yOa26+sywmY+Xc1X2lXMcUv7+eQ7+FBE7bhKc7htieBfH4eR134AVaILL7PWA2FjzAjfaP1Lgirqoq/ZooE8jVD/b4g3J3O3/TG/4ajHe6clnAI/4NdwrnHX0P/quBU03HqSsQ0qsEMAuhrH/jn+YtDzmjm8q/cGJ44qvi24Hn+G1kxz2XP2S/Gp7ri5cMlo+muuwBjyNJnnEcTt/5cRdYS2cbEBZtpINWj3PuC1EOsd/8cTepSpxODcJHLzktfC1PHW3Pgoh3J5PHjW3TCQ1Wlu/wP8e8OPfNm48BODGChioj3ezblqrOBV+cI+hLi7ReJdvBF/4jY+/Un0asuWnrA6kRNpgOeO8wyl4Ryhkrff+9R1SpyPYP+5T3EuWWLZaCn0bGzyk97S3VAAAAAA=", mu = "data:image/webp;base64,UklGRmIEAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IIIDAADwDwCdASo8ADwAPm0qkUWkIqGWDVeYQAbEtgBOmZMBu+H816ov3b8R8R2g2FXtxdyh5s3+A60v0APLi9ktgGB/LZjWNAXqgpE6jfW0NF+P4xEhH2L7M+26iGwrTjjcQegyCZqxs+ifvZANjWd279diqZNKUrgOTVtjJGtW4IVtRhMECd5aWVgAAP7nDv3UY/8f1l//xTP/FM/8NU8c9g//sC3+bX/1HZXsNsM57VKG2LVf1a0KdncWO8uPo/Oh79m9ZqjJZwXfPXuvwkK+WDOl6+N8C2Ux6no/V/zkoucKK/JZek7MR5sS8TknXB+6BuVDXou9Rx4aUea2q2IzvLvFIujjKsVYLMab7j9zo48fhgm9YOtjmWuS0WZ4c+6ta0mr3xF4fcdAIFf6oXRSlqovOX0HUiMV//hXwSX1cfP5cLj8c7OTyT/4ce4olJARV95GoY8oF+2uU0blGul3ItlG7c2Hl2/uC6s2WZc7Zukwojx6ed8t97bZ68N1uzCLzPlG7BuYS17F19e0wXnc6vEl3q7ft0K7OEl7r8mY6Kh+Nt/5V/Lp68mFBjLem1JjvC371+lKwez4KCdXwNo2Z04FqyzGpFutY6YQ/r5Tfu7Oi+oNfN0R/W+D4aj1nqHhlqYJzpx2NK4mj0gJIXmX8EArelSQI8mV4Ux9MRPwC2PuZhLTjQZv+Vl4p0D8bSB+Z0rek3hS6G1r80fW3cn767Pz/bXanjVmm34wt1nQPqdJObrZ7vv2NWcEuQKj9d+V6DzeDrq0CtGNcanEB5MY9agi1E6BprEScTdfPXjBeMnPbpD+QO6P7IW4UZ9etCCHtX++S/fl5Iz5RzUr10ojRMw//35C0yTjSEhbe884dPwor64n//KByjUFEGsCPAAXPJp1+O+SiKfUaODq6ncjKayTHXjoXgM7XP1z4sBhIKJZJRiM7vGC/+v/Sk8/jbgZLZDAVz1vLou93y7Yd8hxcWM/BesxgWgeKvl8fjE/Ud8tQKp4425hWh66lzzwxa4J3ctA4/E50wX/eoBOgq0B7+7S6FK4wvPHSNgfh+vwSWIJsJLt/3yjBeb41RRyMDMZqFQTZPEdFpXp48ExEyDayZ6objbjTHoS5WQDnDQpRyqMNKfvd41nhEPdb/hxpzXeTIjWmfHHCT+CQYWXDqLehCh1cRyeYOBwsSlSw5PiquAbsgAARVhJRroAAABFeGlmAABJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAEgAAAABAAAASAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAPAAAAAOgBAABAAAAPAAAAAAAAAA=", fu = "data:image/webp;base64,UklGRtgCAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IPgBAABQCwCdASo8ADwAPm0wk0ekIqGhKBQMqIANiWkADPF3uV2D8VcQGk1mg+P36i9SLnZvYAQxszEWYzEwX1RVkqG/4BGbJgMSHqhKDFsjWsGfPPrvfef11goNmCDDlBJHVVD+8gAA/vu4q03kl+E7FpjtZ2gc8pQ619Hjv9NywoRZ6az43C1wcrRr/lWzJlJhLWMHN0MkVl1ueAf6Hn8StVzeUfMBXOKkgfe2msx7QWR5PnHW/5c6/35yrtWnrURc2q6UYlGin+v8C2dQqexkW6rX2EEijTI9eEQ46PWH3/59fM2AlMvvR2abaRk5XX7V1triQncRxvMfz5YmYDN+PY/ikcZUNaiFucKoUq5riv0eKCezuFNHecE11ojwJqWRSTWpalkz5autXp6vFS+FT1tWUsB/fs1CCOZxaA1vR1grOEaiuKe1RYm7e05psWtqbXLVmm1bA8Ly9PFkVdCbc6hR3UuBBsFGnVeGOUeMn2onnfvYhBMcM9YPxGdQkwZLXOk1VuQSTk01Shf3fZrFyRlFauftFdPYhKXwqrr+meav1P+KLKBVosqmHnFFfgExsQ/rOf3TSd+mOqQfJA+cF+HojNU7nmM3uDkoCBi+//Gqp+gPNNW8M4LFrol8rxE+7WsjqMgfwv1f+Nr25RtG1Wa/KkniRCAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", pu = "data:image/webp;base64,UklGRhYJAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSGICAAABkJz9nzon3/nNJGnBXRvBI0sDkR7slpRBaMDl5LByx7cEyBWHtWd+8/uiK/95uEfEBKBnFwRwk6Wjm89PW2Tj9OWNo7VxASQ4DDoIML9fbdLYpbFR21tykDAY8ZCLT9okqZrsD0uqJNl5sj6CIAPwDmdqRlNlz6o0vroE5/vlPObv0kyN/dVE3pmHd31xgt0P1MgBauTHLYjrg2DoClM0DtRi4kmA6ylgrMq2cuDaZm0CoQePyTqVhVTWJ+G7EozXqSyosj4K6cIhVBhZ2MjyMNy/BFcZWeDIE8g/PLaoLLRyF/4vgrlPTMVK/DQH+cPjGpUFV17/i6BEZeGVF+Dh4F/kUYGDR4nKDBPX4AX381Deh2C1Q8vB2F4CDqnMUrkPlPMpY+obLQ/j9+k1GjNNLB0z5hJ5fD0f5Y2XTLkkPn9Hy8X4vsGMW/xvt3JqvKflYnz3nCmXxJc3qLlEXj9mzOe4xJSLcW36Oy0P47cplKl5KMvAfj6HwFKbloOxswrBfWoOyvsQjzWmPErwcKhQi6d84eHgcSGPEgSA4Dq1aMpr8PjL3CemYiV+moP8AY9darGUW/D4u+CEsUiRVyH4p8NwmbE4kZUA9y8IRuvUoijr4xB06zFZpxZDWZ+ER/cBEzW2dXDaZnUMAb06hBOmaIOxmHhlCILenWDrI6MOIio/7kIc+uk85u+SSftkasZ78/AOffYOl17RqNqbqtFqZ+A8+i8BI+tPOiRNNdkfllSNZPvJRYEXDDQI3NJerUFjl8ZmbX8ekIBBuyCAjK8d3Xh52iBbp89vHl2ecIAEh54BVlA4IMwFAADQGwCdASo8ADwAPm0qkkYkIiGhLhtqqIANiWwAqSdaNo+beZFT37f+J9yXOd2J6HfQh5gH6edIDzAfst6vXoO9AD/Lf4DrAP2V9gDzY/+57F39p/3/7k+0RmjvYp/meic9ieyvJnZVfquF/a23ZOCHGT/sfDDjQ89zOL9Gewd+s3Vh/b32Gf28Ejb5ttLg9hoDiFb2tMW81eZU9Z1LHfdRSCsRMzHz0WT4BNgUakGf9oJtrGtVJFxHJfxAatIxnW1qjDi9i3DQtJp9pVNKlMoJEWdPKv3KaaFSlhd/aMGiir9CPcex5QAA+fpjxA6zfUamE3wS2zWwLVrt/fXA5+Wvx9j5SID0zuEHU2LisPUxvtRuIUwNrsUis8zy+IMpzft+ZSg+9gdx9e6+ZvPmtj4OByz5qo26J3rXhPy8LBXSpuPb+f+mP4CoTvYDhzQXh/SIGj8Ez1+W5MJ/Tkdw09wPCs3JuR3yoqO63FH/j81xW5Abr7tCdwfXwv3CXDtOcHwUqPCd1aiU2uT6XwgdnYqYygEXGKFx8nmaUvqSn9p8HmIA9dVTOoEnqYFjrNfWY034N2vjohd16cxnkP4PYvHkIOWa/FEUug7/qbJ/GFLPxNh6y9eQ//MzzXbcPwsT2chWXPBXNVF1S9dxv5NUuEueiw2kdebblQuvUSRLN+zx3VyT2lOzWBUqrzsTmeOlxjVcTA83H99r35O4X7WXNq7HExiWXxrdM/Ih4CvPJaEHPxUE/i6WIz6+VGq4RB3sBKl3P4M7/DLWAwCnwcpX228XezqQ4cS2tttWxLTc9cPd1ofek9qF9lpB8RvakdPnj2PruFA9W3iKbNdmgnb+mIpohHuUR73KdDDOHbyfAiOjPzzqomnIU3jcSt7LKOB/Op97sCk0yd18mVG3prs351B+xmCE2Zd3RFKL+mpMz5qcuAFAfRyodbggdgmFGkEGQ33VryYFl/upr31FGdI52sqzuxd7jZIsqCcznUH/gu+xaBw7wla49EmFNf+Ss+91i9Hsys0FS//Ktru1xWgkeEweX77y6Oot5tHQsDxgy0sAI85V7FmlpiiWXQdM12MGfCBfyRM+N23SjOdReeSILYCgsM3r33/54X+lfDVNj427MvbDFtKccqazlQ+iKqC//MvYwqyiJPL1ZbVoCEP774fKZA3D3qvsVPGlp9LPchpTs4mTJugt8qXl82RwXQCDNZXnbEois53E35hkRr+IJhndoRo1o2sZDoTgykbeOKiynPH03+BcUQ8zmxTmiVlHQym/LL3kRREnUlxs2zPPGb2E+Rpdib+LxOvFSmj9RfTZoYIJnrqNnBIXV2lt7xeZ0srf98JymJxrtr8lx69oSNZIReDddL+3iiUjh6lm7EcYuclqBaKp8q68geo7H1EvKy4nSRx5Q+uz4l/ypo2hVdwi9l+BHjZZmJ7lXkpNTRJ0gZpzquzN2vh/MZQALV6FZ6q4aofA9AJy1DVLdNjV8n6s9eFA5pazxwhLW4tgWMciGf5x6G7HqFPTL1ZL3l447zLGUkqAXjkeVaNmxZ2oNKIuTy6JDc0Z61Z2dgbsg6HwCX1/ux5sk82WsnNIO4CTnWKI1aCtQZaEsBf6hIl9n7VBsgZGIcPpqn7P4mbyf3EbfdfQ32qlawLuAxmDlwRsVsPkw7j4aKbvIBykNcsVXv0/X6UXXaAtw3feJnTwDak2qY6QpMLE9e7PJeuQQ8FXpqI5HoR82kd+DOwGH5F3OpuWsmEt8v7WQG8q1LMkg6vrl3I8047zMl1Yq0VwotbrsKJocsHgsbs/PGOO9v2s8U0Sju/71XRtG5skcy2msae3wixjlGR4i6ZfldMehQD1zf/FbWN9hnHfpq1Fh8+PSA9AzUi33qli8ixISbH+tw7CcumxvegMk88HMNZlVdnIEzIfyHrSdZ2S98yX2OYZw0+JyaBbQxI0fOr6KpuMD6FVGLrdN9dgOTgOPQgAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", gu = "data:image/webp;base64,UklGRo4EAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSA4CAAABkGXb2to2V9/v6D1Jmd5CQ5GXPYXAJMrtPOJMoMzMzDgIPYY5+vVds6T/m0BEOGzAtm1IBlR2d8kXUMyaADjeuHr9V7qj3E5/XrvaOA5AHCqzFgHTFz9tUTmEyq1PF6cBqVWDOLjkwS6VPsu8KqnaewRU7j5KIjipgFiQfCf1IGch8wMlv9QhcWk4nLlL9Z4l6b3y7hmUvGQkmF1nnrMC85zrc5CozDUQtwamisNSDCmxjL5jpqxMzfhutFCCY3+5110CaI9/jhVIcPg/DxiIB/x/eKgijLxkRobTyxFEw7zVm0NqcYg5LNAzKD3n4QbmyRVqWCiXJyD9uN7z0Ha9Dw4N5gzOnHU4IMJ7egt8HuYWasIJnlg46fkYgul9qgWU+9PA2Z7b2FngnR3e49Qm1QbKzVPNnltZ8wozK2S8et0SN34wt0LOnynVCsp02xI7tKSqqXYsV7ZtD/lpeaEfNyw/k9evWuKK7XfQ9ruP9/RW/s74t872N1bw2MY8n0Acmlb/KQ04AJ8t5PkeEbpDnbmR2/5392FiOfRFlCuTkIGsMh/aPBeGZFLBYuiM1IIUZLOD0NnMNBMWZdE/4bLo32MQ0wxcJnsvhcnerRhSLvPPhcj8s5DIsmtU6Tj1L1U6zvcEElfrVlHyqGy3epC4om5Vsg3OlO50UQ2V6Qa65LWf6TZ1J/11faBLlpgAVlA4IJgBAADwCQCdASo8ADwAPm0ylEckIyIhKAoAgA2JaQATzh4OcBkEByVmbl5z9gD9U/+J2APQgLaX4twLu19/UVxAWN1IKXE4cIqJBhoyQ0yDYn61m3zk6T7FMg0AAP78+EMvGgC8jLXmcbbmqvufKjG8Tv1M9Krl47vOW74O/Rapv2DgXbg9iK6PrRQG/9d9+rF/ESxzbszVFn3GThrMBmsklj/LPWDQ0pKzG7EyjQL6p6gfUwMze+wPhzJpn8tMqlUVgq6/QSUVcgG+ztsi73rA3vl3n4baeF1INsbuosTXtnsotVYuTii6rscx9OUTvevYcPNvcL9MPhyWeCQw0qynnGtzCIw+oFRN0+TN1mqXkFyk/rFBcH+FHiI6s9XX5EWCKn5vTRt/0RbS687PiXPFC5Zk/Gk4+538IYi+HZDjvlQQWOH/vddfYTerQ5QqWJt1YuaZNThQ2u+/DtXfZPRy1iWWLR9SKFFtlGrqBKWF5nPRPWWMNA3OssvUtvCNBLBA4cn1whzy+SpbgLvnaepxiykjKsU/MhzgAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", wu = "data:image/webp;base64,UklGRqwEAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSL8BAAABkGvbtmlLc5997yvbmW19gBnbDm2kjF5UmW3bthXZVZFdZ+81r+87Z1XlEaHIbSNlMstwos4XUBSTLAFQo/u01Zdf/yLDDze3zB/YwADJEoOoJAKg7oTdH4SF+XxiZlMgSESzwAJdVn2iUJzzOUMiLhQKf+/va2FtBLMBuu1zpHcsincUXhtoTKLsCTVX/KF3wrLhPLm/OWzZtjQWfZ7RhYyAC/lxMowpSzJYJAyFkZDQc21FBMUT7BqGjpHxf3m+XlEPUHE/f3vGgPzmw4awRUaTexkyJhwfNShctVgZXyJDXq4CUyjNy6Y4fVOBIkAPR2GcOE7Jm2NQ/RE9YzXht3a5VYvlOX0xF0fy+tp/ozBuQg6DzZYb6Bi7ed4rB5Mp/1Co4cNhLUo1StLxDIDqrynUoRswiF6nFnIxsDpnZ5WBW0GFZ1qZ8HfLDk5txHHsGDpSa6B0cXZEa+DsTr1M+P4qPdXwjynU4+1/a7oN3Sm6G+meSd27oHsHde++7puj+tYpv7G6b7vun6L7l6n+oZp/t7JmUNUqqhpJV5upakJVLaqqgVW1t6rmV401NGMc1djqH4rpIseSfyPFkgAAVlA4IAQCAABQDACdASo8ADwAPm0yk0akIyGhJgzogA2JaQAThroHvLxu+aPf5G2BYxv+B6XHzx6GPon/o+qz/tOAA/TM82gR0vnExWoiQRM36jlg2UIvwCSqySErzuguz9EP2x/7hsNazr91aIworWI7AAD+/TZ+6Ipl444OdT+2wU0Ov+T8oJuVP/vUbT/w1Jsv6Awnl6rvF/xetfOPt3gTQZZi0Y/AOx563J7CJkqTR/fc/n34zyeKzR80fhfv4ef+Hjhz/CX5aQo+58zg/FdE+7bLoophGfG0szI513EH+q+Gc73H1PFdJYf7CF8v5dhr3tMwEVX5Ji2ZxejK8xrf/E6nVXqlA4DrYNRP09InHc+fEqO/fH8xr+rMf4y1F9TOnwVffZblLoTP6lot0m/sh7sTiDQr0mIA8TiHoOffGDG6KzV+B3239udfhzD740gkRi/m53abX0Ku3vAgadgFFqL0vk8M/4aI+cI+0fbLW17mWGeMu21wSRRQiv5iNgGKR3vEGXAItcLDft1uUzWAfbe1X3zK/ymT7bA/76PB6UUknm+Y5MM4osurUXU/k7P38pN/3slnGfpFzjl4c3USY4mH9ZCJYUuC/kGEnq/yRPalPdODNFvW6s8MiQeQejYNRY0LsJ0WXkK8vXiDmihCivYAOPoSovesL7on+WAArDNM/BcQSQvCYABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", bu = "data:image/webp;base64,UklGRnIIAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSK4BAAABkHPbtrE9+z73/RTbqWw7Lf+BbbNKbTudbZe2qy+VbVv3PmeHj05G6ohg4LaRounNMtN1voB42ABA5R7TNlx5+O7du9e3Tiwb0b4EgFyAOCQM1Z16+DWFUZC7m3uVB2zKQGBhe+77RGHonJffCL1zQuHDxQ1hrEmTatDjHIXOC2MgzpNf1tVJkWgsGhyihI7JIE74aUYp2ITFAoz9QO+ZAs7zanvkEilKbIkMJS5ANwoJmrCodYVOmBqh5zIEJjZc9xods4A4rrPGxGitrJSU71yNyH4Myl7JTEl+5zzYSH9nlkrxHBzxWUzLVEnhh+YI/gq3+UphpvA8m/s7/wg9M4bjFNg/0vplrxQ+rQEDg/xihmT23jxYJZ8UPq8OA5z77Wt405FDR4poSMjiAJhPRxUIu8D+UVonOhfNPEVHPM9juFacwo+1V6kJQ3Y9Sa8ljhPuUvRk4UdNWU9ST3b9n0W3iG5DumdS9y7o3kHVu6/75ii/dbpvrO7brvtPUf2X6f5DVf/dmpxBmauociRVbqbKCXW5qCoHVuXempxf1dZQtXFUbat/yKZTtSUBVlA4INwFAABwGgCdASo8ADwAPm0qj0WkIqEZ+zYAQAbEtgBOmZoZF+E8zGoP3X8VbcdLvma8t+jH0E+YB+ofSA8wH7VdQv0AP75/iOsG9ADy3/Y5/b/91fgI/Y7MOesb0e/q+TUR1vt7VO6mwG0imO70GM5/0P7BX6qelv7EP209lz9oDRea09ZR+SjhX7sBu/ZS7tG917rPgI3Q7XsB7luy2hAg/95C2Z1L362OH1oFziDY/K5gWoSytSAtiKvA/jW1MehBzdLzJfszPPBvGa15IYwIVRTjO2Hz5ZS9HjLMehwAAP64SgjD3qeg6NRe/Ok+iFhrG3pgglCfbam3yBaDUH36sUiQx0PB1ZZyOHq0ky+f97h6tJMvo0p9LkfXecWOFJ8J5G7yRPuL4tzGLT09QulTJw42xp2hd+lMgIa51XoHx/iftn8B2D3k92H5jOQr+uIXFHHK5FpcTG+qGEF+np0LiQa+vdW7/+ZzOLVRf7jR5X3ANPt93Ng92DW7NflVr6kMr88O/v2ZNb0vtgao2Am/R3CDKiNq89f86CT6r2L2g1oTui7H3E1yhSPQpEOz01I3fhfiMMv4weqKuoedxn/xLg5uzHa6Gte4C/dQYkG3ZFSy4CXQtRjftBrjX/Oj+HpSUPDsv0wPW+ml5NbBKDCj2f3SD8TVMf2ZfHrOkR602RVk2UmKC+H0Y9iK6k98vsgPINtz0II8X7Mj2nJkTC6IMLuQ8dNTUq9VXOnhXrdhNZoaH94ePo6baBl3hTGFAnD3/b+gR/vtbqV7wktuX6fpnjeTBe/Drp6z3neeANj/aX4CsU9w67nwYOjZhueCjxaDKUnNjLPjI1e0BoTbcOzOQ0wHJHZJ+Pt608StBu4HiJ8NjH46fnvXL3yiMoSvkAuwCE1AakA+eU1u3unyjl1/MnZQmbp8fzfsfrFesehLPcIkYdCiZ+52QbmINNTjEsvjuBuZRubBE+Laihppsxoo4efGIo0xkw0etu1+yzvkqp88w3pBq0mRl13gnnc+2zl6SmhwgmNFbz+F8qAqmdfJL8iaNSGEWlPlpczDDe62GBZMlBhQmq/XCn/1b+VazHvJXkoIFDF+wktMg+rKfLyfTlXdK0cs+Kn8h+rjMakkf3WLo1TftMLn+O+x/Gat+BGstJrM1xvCSSnHQY+NV4B4gRqyZ55gRNnqN/0lWrATOcHUaGXpkTIM/yxFjxcePcSFo+t2aJ5lShtVukETzRxaIXgRkpROeWQHWpTHOaexmXOzF0b833qJSoXMk2zB/uMrgDzKd7d3ohUz8Ra08WYKlAuMQD08bF4+jUepEspqPLoYLQ73TfmL+1LwKxyTV3gEu6WnxBPWPLnYIGYN9U47ZNlB+NgHgYtKTyii6060RAG+wN32WUVFxCZw0HMHnHFgwxD34L/anlpS7mOrjKgyuGYhFC7iHqTQHuoAO1ekBHV+rndnbETKfa1F7LxNLYq+dmJyytmQrJUCGjelorI1m/TMQNiFVrY4FCI1Gl2W1JsZsw9zA+Bh3JmjkC0H5/0JV6JotNMatJIZ4v5PqwJe3r8xd+FNS3ynccdu+xtVdc27qwVdoomciZD5oXYey9KAFSAKO594sBKZNWUJTLXnt0BJbdF8FkQYvg3DQajYY2p+ixd5Ag7o92gw0pVVDDOP+WQxiEmKqgWJyTBsnsBk2Bxi2Unsv8S/4PmE8Hy/vy+Mij+aTAKZvg716IHfHX0/JMeFfmAnsZ39Q0qkfdPtq6+CxbGZ7wKDsK/8l/MVGuyd6faJFt5wyoOXuNrr3JC9EoBmjcOzkVw/6RNP49poZ1xzsX3q7B4HGfI/XSfRQq3HeZ2j12d0E3gCAube4oExaT1sx/v8F+f61QOsGdSaqM2im6qOGkSRkrRQ7L8hvS8vEYJeVkAbFvX5ov7e/egYYNToMHj651c5/rCVYtB9Ned6GvGN8R0x3t7+lsf8+ofhHRzpyvwxd6c5pREZVOKnXzplhJ61mki4JmAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", yu = "data:image/svg+xml,%3csvg%20width='88'%20height='88'%20viewBox='0%200%2088%2088'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='88'%20height='88'%20fill='url(%23paint0_linear_170_79)'/%3e%3crect%20x='25.6665'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='51.3335'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='29.3335'%20y='40.3333'%20width='29.3333'%20height='7.33333'%20fill='white'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_170_79'%20x1='-75.3077'%20y1='-55'%20x2='146.302'%20y2='148.167'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FF00FF'/%3e%3cstop%20offset='0.531673'%20stop-color='%237A84FF'/%3e%3cstop%20offset='1'%20stop-color='%2305FAFF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e", vu = "data:image/webp;base64,UklGRh4HAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSNwBAAABkFxbexpJnyR3z8y+ajXMkAnjnnOgbUUxEAHjkpldWQwzFUn6v3PGVNI/AUQEA7dt49gN3PXavTlfQDeNAeyqg4PL5buRyOhteXlwcJWtHU8qzUIBs+30g7/s4N8Hp7cZFAtpDc7Bbr8xplB8iFJBYvBC4fjGdgvnElqdwc6XFPGRnQxehC93wjgzbxRYf1UYA+dkiJSrG1DMV6zDoW+MkQmMkd8Owdl5AsvOM3gm0geeXwY7R/Tu0EcmM3re6cF2Rr/kTJiBMmPZh+2q/wtm4ozD9qrB0tucMhunvL0Upg1n6JmRnmda4HCckVkZeRyuMWjjF0peCD9vhK3jAgMzM/BCDQ576225m/bCwcA+qzS/PLUwDrsr1ZDdcAa3KtWQWzDYPKZoQDjeDJyoVEdOAPf0cA/Lf1F0IPy1fG8VWmXvgF4LnoOLDFoIvPiaUQuRr99pNr8dUZEj0YToQnfjreaQd7oL6T6Tuu+C7juo++6rfnOUv3W631jNb7v+P8U+1ZDAZxZG9R+q/e+GxcbPuRcRftkIq+pVVD2Srjdr94TDnJ6w7MGqedFhH1bVA6t67zk9/3ctzw+YAhvSc431KExyjjNHQ2zLcTRzq/8op0vKJd+OREbvUnJJAFZQOCBaBAAA8BUAnQEqPAA8AD5tMJRHJCMiISgb+1CADYlsAJ0zIUCfxfmY2f+0b2AbztDnPeKX0qPMp+wHrDehz0AP7J/o+tP9ADy3f23+C79yPYA/aqK9mONrQbuszbsEyALJNTfg+Z6NjG2v+ETCuvlr1q6QUqEiAMUndG/WwfnjJIOTfOBS4W1w0HjOJa1XQ2K33n2b07EOjOBapwKzyoA2erTBTnEKlFjllBy68GBjZ+UKnlzN/f5ibbb4gAD+i9OsnW0xUnmTpyhVasIKzTu0BsXnfBm4rHJqGMFJBUgTESDXEPcNjAeaHP8ck9qdNBH4L/h53tXgHeZttc7c4lwTa6U4Lziz8qUoy8ce0IMc5TFElawGj16tME0GzSSbUqgH7/tYA6huPsWM2z3GjP8b9y7paRbINxwYRtuE90I6QVsNrEkbhL1YfwxRXnuobOfSe3KFVamrvsOqwTCMqlNfjsR3pyoiZ+lYt3+AH6x4ZVNltbYI5KiVhgCu1isooK324ldloH3zhlefYKEwTCYfNjbeH5UiL7JSev+t/C+ftc3TkAHcsvrLCU6n5pYYY2Yr1kRq+r6XVzI6iXuA/TqwMk6xq1PmdzHOwKavncLjWJrk0uU/5E5WKqXM0tgl5s3pduHjb5aiAt0ikEisMyYwnIhDiSemPRdGON4RlwSb3OEpZjhuZqoyen4Sw/fULewt3hAZizeiPZx1o9LS3M/4r3v/M6/o5925VJcmxAf/yjsyjCz0mV+6NuIeWp8shrFaIGgeduVJoZ0Kys1WjSLuFg9QvF5LlkOZ2k7WrzSu4ucsUOS/X4wnQvB0RCnR1PCsU4NDdLfxvQITUgGIuVTJ7LR73PHzZam/Z21oy3euiU55ffITekwjR4SgVoPvhxbdBSyVePf/twm62pSK9IfgPGN+ttubhQub1ooVZymdQCrS3goEs6dlnl/6TVfkgxFyBfAORkZafeu/Va2vIgUBNUQd48W8oPiMFjx+SAKx1qm2IwCLnuhJGf9M4nCzu7oo43f+nBeT07IjB+FpFKRGFNvlpLEXhPclSgFkqeU1W2eNqW2zShCWkQkgfE1HAoNX3z+CQcRQJq+HkC2nSjFdFYT8UNYNS6lYcyVWzEnOos1qpsNRxnLqY2Dl5CCT3Yeg/qT8chfF9ZadFvzNTEIDlARoN//7IU23MtuLdpsAjsiGfBHuR7y4lemYPdD/9Cuff9Qn/r/xlhmB5x2Y9Z1yME3aANAb5+u3lYz01zUlWwakKVmv9fhaeu/YzQ7BXLlcb+cbaIF5t/COmObnt20zaTfjad542f7p7f2Xea134nvyPYS+EAgjM+GufHvl9tXCrrRbH0pn7kH2XEGx9VbO4mY54+QZa5kPr0j3AOEtKd7SJWjlg5TQfgIuB6KoLGainSwF+pPdiCmzEzAOa1eFwn//2VdDMeq42/bKH8U4orewhLh60ci/S0BRBuItNMc+v1+vxl0YyS5it4AAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Au = "data:image/svg+xml,%3csvg%20width='868'%20height='868'%20viewBox='0%200%20868%20868'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='434'%20cy='434'%20r='434'%20fill='%231B262D'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M234.563%20184H640.697C650.387%20184%20659.339%20189.164%20664.172%20197.542L782.495%20402.657C788.631%20413.294%20786.808%20426.72%20778.056%20435.346L452.368%20756.327C441.818%20766.724%20424.846%20766.724%20414.296%20756.327L89.0484%20435.78C80.0927%20426.954%2078.4157%20413.136%2085.0013%20402.433L211.48%20196.884C216.405%20188.879%20225.146%20184%20234.563%20184ZM588.257%20275.577V333.129H472.567V373.032C553.82%20377.296%20614.782%20394.81%20615.234%20415.802L615.231%20459.563C614.779%20480.556%20553.82%20498.069%20472.567%20502.333V600.259H395.746V502.333C314.492%20498.069%20253.531%20480.555%20253.078%20459.563L253.081%20415.802C253.533%20394.81%20314.492%20377.296%20395.746%20373.032V333.129H280.055V275.577H588.257ZM434.156%20472.268C520.868%20472.268%20593.345%20457.459%20611.082%20437.683C596.041%20420.912%20541.636%20407.713%20472.567%20404.089V445.867C460.187%20446.516%20447.336%20446.858%20434.156%20446.858C420.976%20446.858%20408.125%20446.516%20395.746%20445.867V404.089C326.676%20407.713%20272.271%20420.912%20257.23%20437.683C274.968%20457.459%20347.444%20472.268%20434.156%20472.268Z'%20fill='%23009393'/%3e%3c/svg%3e";
function xo(e) {
  const r = e.toUpperCase();
  return Jr.find((o) => o.symbol === r)?.decimals ?? 6;
}
function Nu(e, r) {
  const s = e.toUpperCase(), n = Jr.find((a) => a.symbol === s)?.decimals ?? r;
  return n === void 0 ? 2 : s === "SOL" ? 4 : n === 6 && s !== "SOL" ? 2 : n > 6 ? 6 : n;
}
const Jr = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: Xr
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: bu
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: Au
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
    logoUrl: pu
  },
  {
    mint: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    name: "WLFI USD",
    decimals: 6,
    logoUrl: vu
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logoUrl: wu
  },
  {
    mint: "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    name: "Hubble USD",
    decimals: 6,
    logoUrl: yu
  },
  {
    mint: "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT",
    symbol: "CASH",
    name: "Stripe USD",
    decimals: 6,
    logoUrl: fu
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoUrl: mu
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
    logoUrl: gu
  }
], At = 1e9, _o = 1e4, Ye = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoUrl: Xr
}, Lt = {
  mint: "other",
  symbol: "OTHER",
  name: "Other",
  decimals: 6
}, ku = /* @__PURE__ */ new Set(["USDC", "USDT", "USD1", "PYUSD", "USDH", "CASH"]);
function hn(e) {
  return e.map((r) => r.trim()).filter(Boolean);
}
function So(e, r, s) {
  return e === "sol" ? "SOL" : e === "single-token" ? r.symbol : s.some((n) => n.symbol === "USDC") ? "SOL or USDC" : "SOL or supported tokens";
}
function es(e, r, s) {
  if (ku.has(e.symbol)) return 1;
  const o = r.tokenPrices?.[e.symbol];
  if (o && o > 0) return o;
  if (e.symbol === "SOL") return r.solPriceUsd || null;
  const n = s?.[e.symbol];
  return n && n > 0 ? n : null;
}
function Lo(e, r) {
  return e.toFixed(Nu(r));
}
function Cu(e) {
  return e.companyFeePercent > 0 || e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap" || e.feePolicy === "user_pays_privacy";
}
function Eu(e, r, s) {
  const { feePolicy: o, privacyFeePercent: n, swapFeePercent: a, companyFeePercent: c } = e;
  let d = c;
  return s || (o === "user_pays_all" ? (d += a, r && (d += n)) : o === "user_pays_privacy" && r ? d += n : o === "user_pays_swap" && (d += a)), d;
}
function xu(e, r) {
  const s = r < e.publicMinUsd, o = r >= e.privateMinUsd, n = [], a = !s && o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0), c = !s && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0), d = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  if (a) {
    const l = e.privacyFeeFixedLamports / At, h = e.privacyFeePercent, m = l * e.solPriceUsd, u = r * (h / 100);
    n.push({ label: "Privacy", solAmount: l, percent: h, usdAmount: m + u });
  }
  if (c) {
    const l = e.swapFeeFixedLamports / At, h = e.swapFeePercent, m = l * e.solPriceUsd, u = r * (h / 100);
    n.push({ label: "Swap", solAmount: l, percent: h, usdAmount: m + u });
  }
  if (d) {
    const l = e.companyFeeFixedLamports / At, h = e.companyFeePercent, m = l * e.solPriceUsd, u = r * (h / 100);
    n.push({ label: "Service", solAmount: l, percent: h, usdAmount: m + u });
  }
  return n;
}
function To(e, r, s) {
  const o = xu(e, r), n = s === 0 ? 0 : s < 0.01 ? 0.01 : s;
  if (o.length === 0)
    return s === 0 ? "No fees" : `Total: $${n.toFixed(2)}`;
  const a = o.reduce((w, b) => w + b.solAmount, 0), c = o.reduce((w, b) => w + b.percent, 0), d = { fee: 7, sol: 8, rate: 7, usd: 8 }, l = (w) => {
    const b = w.label.padEnd(d.fee), x = w.solAmount.toFixed(4).padStart(6).padEnd(d.sol), E = (w.percent.toFixed(2) + "%").padStart(5).padEnd(d.rate), C = ("$" + (w.usdAmount === 0 ? 0 : Math.max(w.usdAmount, 0.01)).toFixed(2)).padEnd(d.usd);
    return `${b} │ ${x} │ ${E} │ ${C}`;
  }, h = `${"Fee".padEnd(d.fee)} │ ${"SOL".padEnd(d.sol)} │ ${"+ Rate".padEnd(d.rate)} │ ${"= Total".padEnd(d.usd)}`, m = `${"─".repeat(d.fee)}─┼─${"─".repeat(d.sol)}─┼─${"─".repeat(d.rate)}─┼─${"─".repeat(d.usd)}`, u = ("$" + n.toFixed(2)).padEnd(d.usd), p = `${"TOTAL".padEnd(d.fee)} │ ${a.toFixed(4).padStart(6).padEnd(d.sol)} │ ${(c.toFixed(2) + "%").padStart(5).padEnd(d.rate)} │ ${u}`;
  return [h, m, ...o.map(l), m, p].join(`
`);
}
function _u(e) {
  const r = e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0, s = e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0, o = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  return !r && !s && !o ? "No processing fees apply to deposits." : "A small fee may apply. We'll show exact totals before you confirm.";
}
function Ut(e, r) {
  if (r <= 0) return 0;
  const s = r < e.publicMinUsd, o = r >= e.privateMinUsd, n = Eu(e, o, s);
  let a = e.companyFeeFixedLamports;
  s || (o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (a += e.privacyFeeFixedLamports), (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (a += e.swapFeeFixedLamports));
  const c = a / At * e.solPriceUsd, d = r * (n / 100);
  return c + d;
}
function Su({
  step: e,
  sessionId: r,
  demoMode: s,
  demoAutoConfirmMs: o,
  depositMethod: n,
  depositAddress: a,
  receiveAmountUsd: c,
  selectedToken: d,
  currencyMode: l,
  config: h,
  solanaPubkey: m,
  pollInterval: u,
  getStatus: p,
  onSuccess: g,
  setResult: w,
  setStep: b,
  setFlowError: x
}) {
  O(() => {
    if (!(e === "confirm" || e === "show-address" || e === "waiting") || !r || s) return;
    let N = !1, C = 0, _ = 0;
    const T = 360, f = 5, v = async () => {
      if (!(N || C >= T)) {
        C++;
        try {
          const y = await p(r);
          if (_ = 0, y.status === "completed" || y.status === "detected") {
            const A = y.amountLamports ? y.amountLamports / Math.pow(10, d.decimals) : 0, L = y.amountLamports || 0, S = {
              token: l === "sol" ? null : d,
              amount: A,
              amountSmallestUnit: L,
              txSignature: y.txSignature || "",
              sessionId: r,
              response: y,
              method: "receive",
              depositAddress: m ?? void 0
            };
            w(S), b("success"), g?.(S);
            return;
          }
        } catch {
          if (_++, _ >= f) {
            x(
              "Unable to check deposit status. Please check your connection and try again."
            );
            return;
          }
        }
        N || setTimeout(v, u);
      }
    };
    return v(), () => {
      N = !0;
    };
  }, [
    e,
    r,
    s,
    p,
    d,
    l,
    m,
    g,
    u,
    w,
    b,
    x
  ]), O(() => {
    if (!s || !o || e !== "waiting" || n !== "receive" || !a) return;
    const E = window.setTimeout(() => {
      const N = c ?? h.privateMinUsd, C = d.symbol === "SOL" && h.solPriceUsd > 0 ? N / h.solPriceUsd : N, _ = Math.round(C * Math.pow(10, d.decimals)), T = {
        token: l === "sol" ? null : d,
        amount: C,
        amountSmallestUnit: _,
        txSignature: `demo-tx-${Date.now()}`,
        sessionId: r || `demo-session-${Date.now()}`,
        response: {
          sessionId: r || `demo-session-${Date.now()}`,
          txSignature: `demo-tx-${Date.now()}`,
          amountLamports: _,
          message: "Demo deposit detected",
          withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
        },
        method: "receive",
        depositAddress: a ?? void 0
      };
      w(T), b("success"), g?.(T);
    }, o);
    return () => window.clearTimeout(E);
  }, [
    s,
    o,
    e,
    n,
    a,
    c,
    h,
    d,
    l,
    r,
    g,
    w,
    b
  ]);
}
function Lu({
  siteName: e,
  config: r,
  depositConfig: s,
  currencyMode: o,
  token: n,
  tokens: a,
  onContinue: c,
  onCancel: d
}) {
  const l = r?.title ?? "How Deposits Work", h = r?.exchangeName ?? "Coinbase", m = na(r?.exchangeUrl) ?? "https://www.coinbase.com", u = r?.showExchangeSuggestion !== !1, p = So(o, n, a), g = e ? `${e} uses the Solana blockchain to process secure, private payments.` : "This site uses the Solana blockchain to process secure, private payments.", w = r?.body ?? g, b = Cu(s), x = _u(s);
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: l }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: w }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-explainer-content", children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-shield" }),
        /* @__PURE__ */ i("div", { children: [
          /* @__PURE__ */ t("strong", { children: "Private & Secure" }),
          /* @__PURE__ */ t("p", { children: "Your deposits are protected by cryptographic privacy technology." })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-bolt" }),
        /* @__PURE__ */ i("div", { children: [
          /* @__PURE__ */ t("strong", { children: "Fast Transactions" }),
          /* @__PURE__ */ t("p", { children: "Solana transactions confirm in seconds, not minutes." })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-coin" }),
        /* @__PURE__ */ i("div", { children: [
          /* @__PURE__ */ t("strong", { children: b ? "Transparent Fees" : "Low Fees" }),
          /* @__PURE__ */ t("p", { children: x })
        ] })
      ] })
    ] }),
    u && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-explainer-exchange", children: /* @__PURE__ */ i("p", { className: "cedros-deposit-flow-explainer-exchange-text", children: [
      /* @__PURE__ */ t("strong", { children: "New to Solana?" }),
      " You can purchase ",
      p,
      " using your credit card at",
      " ",
      /* @__PURE__ */ t("a", { href: m, target: "_blank", rel: "noopener noreferrer", children: h }),
      ", then send it here to fund your account."
    ] }) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
      d && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: d,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ t(
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
function Tu({
  token: e,
  tokens: r,
  currencyMode: s,
  depositMethod: o,
  isAuthorizing: n,
  error: a,
  onAuthorize: c,
  onBack: d
}) {
  const [l, h] = k(""), m = So(s, e, r), u = (p) => {
    p.preventDefault(), l.trim() && (c(l), h(""));
  };
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Authorize Deposit" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: o === "sign" ? s === "multi-token" ? "Enter your password to authorize a deposit. This allows us to process your withdrawal when the privacy period ends." : `Enter your password to authorize a ${m} deposit. This allows us to process your withdrawal when the privacy period ends.` : s === "multi-token" ? "Enter your password to get your deposit address. Any supported token sent to this address will be credited to your account." : `Enter your password to get your deposit address. Any ${m} sent to this address will be credited to your account.` }),
    /* @__PURE__ */ i("form", { onSubmit: u, children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
        /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", htmlFor: "deposit-password", children: "Password" }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "deposit-password",
            type: "password",
            value: l,
            onChange: (p) => h(p.target.value),
            className: "cedros-deposit-flow-input",
            placeholder: "Enter your password",
            disabled: n,
            autoComplete: "current-password"
          }
        )
      ] }),
      a && /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-error", children: a }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
            onClick: d,
            disabled: n,
            children: "Back"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "submit",
            className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
            disabled: !l.trim() || n,
            children: n ? "Authorizing..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function ts(e, r) {
  return r.privateDepositsEnabled && e >= r.privateMinUsd ? "private" : e >= r.publicMinUsd ? "public" : "sol_micro";
}
const Pu = 1e4, Tt = 1e3, Po = 3;
function Bu(e) {
  return Number.isFinite(e) ? `$${Math.round(e)}` : "$0";
}
function Ru(e, r) {
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
        detail: `SOL only under ${Bu(r.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens."
      };
  }
}
function rs(e, r, s) {
  return Math.min(Math.max(e, r), s);
}
function Mu(e, r) {
  if (r <= 0) return 0;
  const s = rs(e / r, 0, 1);
  return Math.round(Math.pow(s, 1 / Po) * Tt);
}
function Iu(e, r) {
  const s = rs(e / Tt, 0, 1);
  return r * Math.pow(s, Po);
}
function Bo(e) {
  return e < 10 ? 0.01 : e < 100 ? 1 : e < 500 ? 5 : e < 1e3 ? 10 : e < 5e3 ? 25 : 50;
}
function Uu(e) {
  return e < 1 ? 2 : 0;
}
function mn(e) {
  const r = Bo(e), s = Math.round(e / r) * r, o = Uu(r);
  return Number(s.toFixed(o));
}
function Ro({
  config: e,
  valueUsd: r,
  onChange: s,
  maxUsd: o = Pu,
  disabled: n = !1,
  className: a = ""
}) {
  const c = rs(Number.isFinite(r) ? r : 0, 0, o), d = q(() => ts(c, e), [c, e]), l = Ru(d, e), h = Mu(c, o), m = h / Tt * 100;
  return /* @__PURE__ */ i("div", { className: `cedros-tiered-slider ${a}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-input-row", children: [
      /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-input", children: [
        /* @__PURE__ */ t("span", { className: "cedros-tiered-slider-currency", children: "$" }),
        /* @__PURE__ */ t(
          "input",
          {
            type: "number",
            value: c || "",
            onChange: (u) => s(mn(Math.max(0, Math.min(parseFloat(u.target.value) || 0, o)))),
            placeholder: "Enter amount",
            disabled: n,
            min: 0,
            step: Bo(c),
            className: "cedros-deposit-flow-input cedros-tiered-slider-input-field",
            "aria-label": "Deposit amount"
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-tiered-slider-tier", children: [
        /* @__PURE__ */ i("span", { className: `cedros-tiered-slider-badge cedros-tiered-slider-badge-${d}`, children: [
          d === "sol_micro" && /* @__PURE__ */ t("img", { src: Xr, alt: "SOL", className: "cedros-tiered-slider-badge-icon" }),
          l.label
        ] }),
        /* @__PURE__ */ t("span", { className: "cedros-tiered-slider-tier-detail", children: l.detail })
      ] })
    ] }),
    /* @__PURE__ */ t(
      "input",
      {
        type: "range",
        min: 0,
        max: Tt,
        step: 1,
        value: h,
        onChange: (u) => s(mn(Iu(parseFloat(u.target.value), o))),
        className: "cedros-tiered-slider-range",
        style: {
          background: `linear-gradient(to right, var(--cedros-primary) 0%, var(--cedros-primary) ${m}%, var(--cedros-border) ${m}%, var(--cedros-border) 100%)`
        },
        disabled: n,
        "aria-label": "Deposit amount slider"
      }
    ),
    l.note && /* @__PURE__ */ t("div", { className: "cedros-tiered-slider-note", children: l.note })
  ] });
}
function Du({
  tokens: e,
  selectedToken: r,
  onSelect: s,
  openSignal: o,
  placeholder: n = "Select token",
  disabled: a = !1,
  className: c = "",
  searchable: d = !0
}) {
  const [l, h] = k(!1), [m, u] = k(""), p = J(null), g = J(null), w = q(() => {
    if (!m.trim()) return e;
    const N = m.toLowerCase();
    return e.filter(
      (C) => C.symbol.toLowerCase().includes(N) || C.name.toLowerCase().includes(N) || C.mint.toLowerCase().includes(N)
    );
  }, [e, m]);
  O(() => {
    const N = (C) => {
      p.current && !p.current.contains(C.target) && (h(!1), u(""));
    };
    if (l)
      return document.addEventListener("mousedown", N), () => document.removeEventListener("mousedown", N);
  }, [l]), O(() => {
    l && d && g.current && g.current.focus();
  }, [l, d]), O(() => {
    o === void 0 || a || (h(!0), u(""));
  }, [o, a]);
  const b = B(() => {
    a || (h((N) => !N), l && u(""));
  }, [a, l]), x = B(
    (N) => {
      s(N), h(!1), u("");
    },
    [s]
  ), E = B(
    (N) => {
      N.key === "Escape" ? (h(!1), u("")) : N.key === "Enter" && w.length === 1 && x(w[0]);
    },
    [w, x]
  );
  return /* @__PURE__ */ i(
    "div",
    {
      ref: p,
      className: `cedros-token-selector ${l ? "cedros-token-selector-open" : ""} ${a ? "cedros-token-selector-disabled" : ""} ${c}`,
      onKeyDown: E,
      children: [
        /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: "cedros-token-selector-trigger",
            onClick: b,
            disabled: a,
            "aria-haspopup": "listbox",
            "aria-expanded": l,
            children: [
              r ? /* @__PURE__ */ i("span", { className: "cedros-token-selector-selected", children: [
                r.logoUrl && /* @__PURE__ */ t(
                  "img",
                  {
                    src: r.logoUrl,
                    alt: r.symbol,
                    className: "cedros-token-icon",
                    onError: (N) => {
                      N.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ t("span", { className: "cedros-token-symbol", children: r.symbol })
              ] }) : /* @__PURE__ */ t("span", { className: "cedros-token-selector-placeholder", children: n }),
              /* @__PURE__ */ t("span", { className: "cedros-token-selector-arrow", children: l ? "▲" : "▼" })
            ]
          }
        ),
        l && /* @__PURE__ */ i("div", { className: "cedros-token-selector-dropdown", role: "listbox", children: [
          d && /* @__PURE__ */ t("div", { className: "cedros-token-search", children: /* @__PURE__ */ t(
            "input",
            {
              ref: g,
              type: "text",
              value: m,
              onChange: (N) => u(N.target.value),
              placeholder: "Search tokens...",
              className: "cedros-token-search-input"
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-token-list", children: w.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-token-empty", children: "No tokens found" }) : /* @__PURE__ */ t(X, { children: w.map((N) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: `cedros-token-option ${r?.mint === N.mint ? "cedros-token-option-selected" : ""}`,
              onClick: () => x(N),
              role: "option",
              "aria-selected": r?.mint === N.mint,
              children: [
                N.logoUrl && /* @__PURE__ */ t(
                  "img",
                  {
                    src: N.logoUrl,
                    alt: N.symbol,
                    className: "cedros-token-icon",
                    onError: (C) => {
                      C.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ i("span", { className: "cedros-token-info", children: [
                  /* @__PURE__ */ t("span", { className: "cedros-token-symbol", children: N.symbol }),
                  /* @__PURE__ */ t("span", { className: "cedros-token-name", children: N.name })
                ] }),
                r?.mint === N.mint && /* @__PURE__ */ t("span", { className: "cedros-token-check", children: "✓" })
              ]
            },
            N.mint
          )) }) })
        ] })
      ]
    }
  );
}
function Mo({
  token: e,
  tokens: r,
  quickActionSymbols: s,
  customTokenSymbols: o,
  onTokenSelect: n
}) {
  const [a, c] = k(!1), [d, l] = k(0), h = q(() => {
    const m = o.length === 0 ? r : r.filter((g) => o.includes(g.symbol)), u = m.length > 0 ? m : r;
    return u.some((g) => g.symbol === Lt.symbol) ? u : [...u, Lt];
  }, [r, o]);
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
    /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", children: "Token" }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-token-quick", children: [
      s.map((m) => {
        const u = r.find((g) => g.symbol === m), p = e.symbol === m;
        return /* @__PURE__ */ i(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${p ? "is-active" : ""}`,
            onClick: () => {
              u && (c(!1), n(u));
            },
            disabled: !u,
            children: [
              u?.logoUrl && /* @__PURE__ */ t(
                "img",
                {
                  className: "cedros-deposit-flow-token-quick-icon",
                  src: u.logoUrl,
                  alt: `${m} logo`
                }
              ),
              m
            ]
          },
          m
        );
      }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: `cedros-deposit-flow-token-quick-btn ${a ? "is-active" : ""}`,
          onClick: () => {
            c(!0), l((m) => m + 1);
          },
          children: "Custom"
        }
      )
    ] }),
    a && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ t(
      Du,
      {
        tokens: h,
        selectedToken: e,
        onSelect: n,
        openSignal: d
      }
    ) })
  ] });
}
function Fu({
  token: e,
  tokens: r,
  quickActionSymbols: s,
  customTokenSymbols: o,
  currencyMode: n,
  minAmount: a,
  maxAmount: c,
  depositAddress: d,
  walletReady: l,
  needsUnlock: h,
  copied: m,
  isListening: u,
  config: p,
  onCopy: g,
  onTokenSelect: w,
  onUnlockRequired: b,
  onConfirm: x,
  onBack: E
}) {
  const [N, C] = k(p.privateMinUsd), [_, T] = k(!1), [f, v] = k(null), A = ts(N, p) === "sol_micro", L = e.symbol === Lt.symbol, S = Ut(p, N), R = S === 0 ? 0 : S < 0.01 ? 0.01 : S, P = L ? "Fees: calculated after deposit" : S === 0 ? "No fees" : `Fees: $${R.toFixed(2)} total`, M = L ? "" : To(p, N, S), I = es(A ? Ye : e, p), U = I ? N / I : e.symbol === "SOL" && p.solPriceUsd > 0 ? N / p.solPriceUsd : null, W = U != null ? Lo(U, A ? "SOL" : e.symbol) : null, $ = N - S <= 0 && N > 0, F = !L && N > 0 && !$ && U != null && U >= a && U <= c;
  O(() => {
    if (n === "multi-token")
      if (A && e.symbol !== "SOL") {
        v(e);
        const Z = r.find((Q) => Q.symbol === "SOL");
        Z && w(Z);
      } else !A && f && e.symbol === "SOL" && (w(f), v(null));
  }, [A, e.symbol, n, r, w, f, e]);
  const H = () => {
    F && U != null && x(U, e);
  };
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Choose Amount" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: "Set how much you want to deposit. Higher tiers unlock privacy." }),
    n === "multi-token" && !A && /* @__PURE__ */ t(
      Mo,
      {
        token: e,
        tokens: r,
        quickActionSymbols: s,
        customTokenSymbols: o,
        onTokenSelect: w
      }
    ),
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-field", children: /* @__PURE__ */ t(
      Ro,
      {
        config: p,
        valueUsd: N,
        onChange: C,
        maxUsd: _o
      }
    ) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", children: L ? "Sign to send tokens to this address" : `Sign to send ${W ?? "--"} ${A ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ t("code", { className: "cedros-deposit-flow-address", children: d || "Loading..." }),
        /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-actions", children: [
          /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-icon",
              onClick: g,
              title: "Copy address",
              disabled: !d,
              children: m ? "✓" : "⧉"
            }
          ),
          d && /* @__PURE__ */ t(
            "a",
            {
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-link cedros-deposit-flow-copy-icon",
              href: `https://orbmarkets.io/account/${d}`,
              target: "_blank",
              rel: "noopener noreferrer",
              title: "View on Orb Markets",
              children: "↗"
            }
          )
        ] })
      ] }),
      m && /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    $ && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-warning", children: /* @__PURE__ */ t("p", { children: "Deposit amount is less than the fees. Increase the amount to proceed." }) }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ t("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ i("span", { children: [
          P,
          /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${_ ? "is-open" : ""}`,
              "data-tooltip": M,
              "aria-label": `Fee breakdown: ${M.replaceAll(`
`, ", ")}`,
              "aria-expanded": _,
              onClick: (Z) => {
                Z.stopPropagation(), T((Q) => !Q);
              },
              onBlur: () => T(!1),
              onKeyDown: (Z) => {
                Z.key === "Escape" && T(!1);
              },
              children: "i"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ t("span", { children: "Credits appear after network confirmation." })
      ] })
    ] }),
    u && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-info-banner", children: "Listening for incoming transfers. We will confirm automatically." }),
    h && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-warning", children: [
      /* @__PURE__ */ t("p", { children: "Your wallet is locked. Unlock it to continue." }),
      b && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: b,
          children: "Unlock Wallet"
        }
      )
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: E,
          children: "Back"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: H,
          disabled: !F || !l || !d,
          children: "Deposit"
        }
      )
    ] })
  ] });
}
function Ou({ depositAddress: e }) {
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-spinner" }),
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Signing Transfer" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: "Approve the transfer in your wallet extension..." }),
    e && /* @__PURE__ */ i("p", { className: "cedros-deposit-flow-signing-dest", children: [
      "Sending to:",
      " ",
      /* @__PURE__ */ i("code", { children: [
        e.slice(0, 6),
        "...",
        e.slice(-4)
      ] })
    ] })
  ] });
}
function Wu({
  token: e,
  tokens: r,
  quickActionSymbols: s,
  customTokenSymbols: o,
  tokenPriceUsd: n,
  currencyMode: a,
  depositAddress: c,
  copied: d,
  isListening: l,
  config: h,
  onCopy: m,
  onTokenSelect: u,
  onAmountChange: p,
  onSent: g,
  onBack: w
}) {
  const [b, x] = k(h.privateMinUsd), [E, N] = k(!1), [C, _] = k(null), f = ts(b, h) === "sol_micro", v = e.symbol === Lt.symbol, y = Ut(h, b), A = y === 0 ? 0 : y < 0.01 ? 0.01 : y, L = v ? "Fees: calculated after deposit" : y === 0 ? "No fees" : `Fees: $${A.toFixed(2)} total`, S = v ? "" : To(h, b, y), R = v || b > 0, P = es(f ? Ye : e, h, n), M = P ? b / P : null, I = M ? Lo(M, e.symbol) : null;
  return O(() => {
    if (a === "multi-token")
      if (f && e.symbol !== "SOL") {
        _(e);
        const U = r.find((W) => W.symbol === "SOL");
        U && u(U);
      } else !f && C && e.symbol === "SOL" && (u(C), _(null));
  }, [f, e.symbol, a, r, u, C, e]), O(() => {
    p(b);
  }, [b, p]), c ? /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Send Deposit" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: "Send funds to your deposit address. We'll confirm automatically." }),
    a === "multi-token" && !f && /* @__PURE__ */ t(
      Mo,
      {
        token: e,
        tokens: r,
        quickActionSymbols: s,
        customTokenSymbols: o,
        onTokenSelect: u
      }
    ),
    !v && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", children: "Deposit Amount" }),
      /* @__PURE__ */ t(
        Ro,
        {
          config: h,
          valueUsd: b,
          onChange: x,
          maxUsd: _o
        }
      )
    ] }),
    v && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-note", children: "Send any token you want. We'll detect the deposit, swap it, and credit your balance automatically." }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", children: v ? "Send any token to this address" : `Send ${I ?? "--"} ${f ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ t("code", { className: "cedros-deposit-flow-address", children: c }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-copy-btn",
            onClick: m,
            title: "Copy address",
            children: d ? "✓" : "📋"
          }
        )
      ] }),
      d && /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ t("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ i("span", { children: [
          L,
          !v && /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${E ? "is-open" : ""}`,
              "data-tooltip": S,
              "aria-label": `Fee breakdown: ${S.replaceAll(`
`, ", ")}`,
              "aria-expanded": E,
              onClick: (U) => {
                U.stopPropagation(), N((W) => !W);
              },
              onBlur: () => N(!1),
              onKeyDown: (U) => {
                U.key === "Escape" && N(!1);
              },
              children: "i"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ t("span", { children: "Credits appear after confirmation (typically ~30s)." })
      ] })
    ] }),
    l && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-info-banner", children: "Listening for your deposit. We'll notify you when it arrives." }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: w,
          children: "Back"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: g,
          disabled: !R,
          children: "I've Sent It"
        }
      )
    ] })
  ] }) : /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-error-icon", children: "!" }),
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Wallet Not Ready" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: "Your embedded wallet is not set up. Please complete wallet enrollment first." })
  ] });
}
function qu({ token: e, depositAddress: r, copied: s, feeLine: o, onCopy: n }) {
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-spinner" }),
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Waiting for Deposit" }),
    /* @__PURE__ */ i("p", { className: "cedros-deposit-flow-step-desc", children: [
      "Looking for incoming ",
      /* @__PURE__ */ t("strong", { children: e.symbol }),
      " deposits..."
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-waiting-info", children: [
      /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-waiting-text", children: "Once your transaction is confirmed on the Solana network, your account will be credited automatically. This usually takes 20-30 seconds." }),
      r && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-field", children: [
        /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", children: "Deposit address" }),
        /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-box", children: [
          /* @__PURE__ */ i("code", { className: "cedros-deposit-flow-address", children: [
            r.slice(0, 6),
            "...",
            r.slice(-6)
          ] }),
          /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-address-actions", children: [
            /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-icon",
                onClick: n,
                title: "Copy address",
                children: s ? "✓" : "⧉"
              }
            ),
            /* @__PURE__ */ t(
              "a",
              {
                className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-link cedros-deposit-flow-copy-icon",
                href: `https://orbmarkets.io/account/${r}`,
                target: "_blank",
                rel: "noopener noreferrer",
                title: "View on Orb Markets",
                children: "↗"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-stack", children: [
        /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
          /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
          /* @__PURE__ */ t("span", { children: "Send only on the Solana network." })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-info-item", children: [
          /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
          /* @__PURE__ */ t("span", { children: o })
        ] })
      ] })
    ] })
  ] });
}
function zu({ result: e, config: r, onNewDeposit: s }) {
  const o = e.token ?? Ye, n = es(o, r), a = n ? e.amount * n : e.amount, c = Ut(r, a), d = Math.max(a - c, 0), l = c === 0 ? 0 : c < 0.01 ? 0.01 : c;
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-success-icon", children: "✓" }),
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Deposit Successful!" }),
    /* @__PURE__ */ i("p", { className: "cedros-deposit-flow-step-desc", children: [
      "Your deposit of ",
      e.amount.toLocaleString(),
      " ",
      o.symbol,
      " has been received."
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary", children: [
      e.txSignature && /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-summary-label", children: "Transaction" }),
        /* @__PURE__ */ i("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-tx", children: [
          /* @__PURE__ */ i(
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
          /* @__PURE__ */ t(
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
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-summary-label", children: "Deposit Amount" }),
        /* @__PURE__ */ i("span", { className: "cedros-deposit-flow-summary-value", children: [
          "$",
          a.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-summary-label", children: "Total Fees" }),
        /* @__PURE__ */ i("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-fee", children: [
          "-$",
          l.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-summary-label", children: "Credits Added" }),
        /* @__PURE__ */ i("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-credit", children: [
          "+$",
          d.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-summary-label", children: "Available" }),
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-summary-value", children: "Immediately" })
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-actions", children: /* @__PURE__ */ t(
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
function ju({ error: e, onRetry: r, onCancel: s }) {
  return /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-error-icon", children: "✕" }),
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Deposit Failed" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-error-message", children: e }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-actions", children: [
      s && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: s,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: r,
          children: "Try Again"
        }
      )
    ] })
  ] });
}
function $u({ steps: e, currentStepIndex: r, currentStep: s }) {
  return /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-steps", children: e.map((o, n) => {
    const a = r >= n, c = o.key === s;
    return /* @__PURE__ */ i(
      "div",
      {
        className: `cedros-deposit-flow-step-item ${a ? "step-active" : ""}`,
        children: [
          /* @__PURE__ */ t(
            "div",
            {
              className: `cedros-deposit-flow-step-circle ${a ? "active" : ""} ${c ? "current" : ""}`,
              children: n + 1
            }
          ),
          /* @__PURE__ */ t("span", { className: `cedros-deposit-flow-step-label ${a ? "active" : ""}`, children: o.label })
        ]
      },
      o.key
    );
  }) });
}
function nm({
  config: e,
  currencyMode: r,
  depositMethod: s,
  tokens: o = [],
  defaultToken: n,
  minAmount: a,
  maxAmount: c = 1e4,
  onSuccess: d,
  onError: l,
  onCancel: h,
  onUnlockRequired: m,
  onAuthorize: u,
  className: p = "",
  showStepIndicator: g = !0,
  pollInterval: w = 5e3,
  demoMode: b = !1,
  demoAutoConfirmMs: x,
  tokenPriceUsd: E,
  showExplainer: N = !1,
  siteName: C,
  explainerConfig: _
}) {
  const { deposit: T, getStatus: f, error: v, clearError: y } = hu(), A = Pt(), L = hn(e.quickActionTokens), S = hn(e.customTokenSymbols), R = q(() => {
    const K = e.customTokens ?? [];
    if (K.length === 0) return o;
    const ie = new Set(o.map((we) => we.symbol)), fe = [...o];
    for (const we of K)
      ie.has(we.symbol) || (fe.push({
        mint: we.mint,
        symbol: we.symbol,
        name: we.symbol,
        decimals: we.decimals,
        logoUrl: we.logoUrl
      }), ie.add(we.symbol));
    return fe;
  }, [o, e.customTokens]), P = q(() => {
    if (S.length === 0) return R;
    const K = R.filter((ie) => S.includes(ie.symbol));
    return K.length > 0 ? K : R;
  }, [R, S]), M = e.privateDepositsEnabled, I = s ? s === "sign" && !M ? "receive" : s : M && A.hasExternalWallet ? "sign" : "receive", U = L[0] ? R.find((K) => K.symbol === L[0]) : void 0, W = r === "sol" ? Ye : r === "single-token" ? U ?? R.find((K) => K.symbol === "USDC") ?? R[0] ?? Ye : n ?? U ?? R.find((K) => K.symbol === "USDC") ?? R.find((K) => K.symbol !== "SOL") ?? R[0] ?? Ye, z = B(() => N ? "explainer" : "unlock", [N]), [$, F] = k(z), [H, Z] = k(W), [Q, le] = k(""), [D, j] = k(null), [te, ee] = k(null), [he, _e] = k(null), [Se, Xe] = k(null), [Ue, De] = k(!1), [Dt, Je] = k(!1), [G, Fe] = k(null), me = J(null);
  O(() => () => {
    me.current && clearTimeout(me.current);
  }, []), O(() => {
    F(z()), Z(W), le(""), j(null), ee(null), _e(null), Xe(null), De(!1), Je(!1), Fe(null), y();
  }, [r, I, W, y]);
  const at = a ?? e.privateMinSol, it = c, Le = parseFloat(Q), et = A.status === "enrolled_locked" || A.status === "enrolled_unlocked" || A.status === "unlocked", Ft = et && A.isUnlocked, Ot = et && !A.isUnlocked, ns = B(() => {
    let fe = I === "sign" ? [
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
    return N && (fe = [{ key: "explainer", label: "Info" }, ...fe]), fe;
  }, [I, N])(), Fo = ns.findIndex((K) => K.key === $), os = B((K) => {
    Z(K);
  }, []), Oo = B(
    async (K) => {
      if (!u) {
        F(I === "sign" ? "confirm" : "show-address");
        return;
      }
      Je(!0), ee(null);
      try {
        const fe = await u(K, I === "sign" ? Le : null, H);
        _e(fe.sessionId), Xe(fe.depositAddress), F(I === "sign" ? "confirm" : "show-address");
      } catch (ie) {
        const fe = ie instanceof Error ? ie : new Error("Authorization failed");
        ee(fe.message);
      } finally {
        Je(!1);
      }
    },
    [u, I, Le, H]
  ), Wo = B(
    async (K, ie) => {
      y(), ee(null), F("signing");
      const fe = K ?? Le, we = ie ?? H;
      if (!b) {
        if (Ot && m) {
          m(), F("confirm");
          return;
        }
        if (!Ft) {
          ee("Wallet not ready"), F("error");
          return;
        }
      }
      try {
        const Oe = Math.round(fe * Math.pow(10, we.decimals));
        if (b) {
          await new Promise(($o) => setTimeout($o, 1500));
          const is = {
            token: r === "sol" ? null : we,
            amount: fe,
            amountSmallestUnit: Oe,
            txSignature: `demo-tx-${Date.now()}`,
            sessionId: he || `demo-session-${Date.now()}`,
            response: {
              sessionId: he || `demo-session-${Date.now()}`,
              txSignature: `demo-tx-${Date.now()}`,
              amountLamports: Oe,
              message: "Demo deposit successful",
              withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
            },
            method: "sign"
          };
          j(is), F("success"), d?.(is);
          return;
        }
        const Ve = await T(Oe), as = {
          token: r === "sol" ? null : we,
          amount: fe,
          amountSmallestUnit: Oe,
          txSignature: Ve.txSignature,
          sessionId: Ve.sessionId,
          response: Ve,
          method: "sign"
        };
        j(as), F("success"), d?.(as);
      } catch (Oe) {
        const Ve = Oe instanceof Error ? Oe : new Error("Deposit failed");
        ee(Ve.message), F("error"), l?.(Ve);
      }
    },
    [
      T,
      Le,
      H,
      r,
      b,
      he,
      Ft,
      Ot,
      m,
      d,
      l,
      y
    ]
  ), qo = B(() => {
    F("waiting");
  }, []), Wt = B(async () => {
    const K = Se || A.solanaPubkey;
    if (K) {
      me.current && clearTimeout(me.current);
      try {
        await navigator.clipboard.writeText(K), De(!0), me.current = setTimeout(() => De(!1), 2e3);
      } catch {
        const ie = document.createElement("textarea");
        ie.value = K, document.body.appendChild(ie), ie.select(), document.execCommand("copy"), document.body.removeChild(ie), De(!0), me.current = setTimeout(() => De(!1), 2e3);
      }
    }
  }, [Se, A.solanaPubkey]);
  Su({
    step: $,
    sessionId: he,
    demoMode: b,
    demoAutoConfirmMs: x,
    depositMethod: I,
    depositAddress: Se,
    receiveAmountUsd: G,
    selectedToken: H,
    currencyMode: r,
    config: e,
    solanaPubkey: A.solanaPubkey,
    pollInterval: w,
    getStatus: f,
    onSuccess: d,
    setResult: j,
    setStep: F,
    setFlowError: ee
  });
  const zo = B(() => {
    F(z()), le(""), j(null), ee(null), y();
  }, [z, y]);
  if (!e.enabled)
    return /* @__PURE__ */ t("div", { className: `cedros-deposit-flow cedros-deposit-flow-disabled ${p}`, children: /* @__PURE__ */ t("p", { children: "Deposits are not currently available." }) });
  const jo = G ? (() => {
    const K = Ut(e, G);
    return K === 0 ? "No fees" : `Fees: $${Math.max(K, 0.01).toFixed(2)} total`;
  })() : "Fees: calculated after deposit";
  return /* @__PURE__ */ i("div", { className: `cedros-deposit-flow ${p}`, children: [
    g && $ !== "error" && /* @__PURE__ */ t($u, { steps: ns, currentStepIndex: Fo, currentStep: $ }),
    /* @__PURE__ */ i("div", { className: "cedros-deposit-flow-content", children: [
      $ === "explainer" && /* @__PURE__ */ t(
        Lu,
        {
          siteName: C,
          config: _,
          depositConfig: e,
          currencyMode: r,
          token: H,
          tokens: P,
          onContinue: () => F("unlock"),
          onCancel: h
        }
      ),
      $ === "unlock" && /* @__PURE__ */ t(
        Tu,
        {
          token: H,
          tokens: P,
          currencyMode: r,
          depositMethod: I,
          isAuthorizing: Dt,
          error: te,
          onAuthorize: Oo,
          onBack: N ? () => F("explainer") : void 0,
          onCancel: h
        }
      ),
      $ === "confirm" && I === "sign" && /* @__PURE__ */ t(
        Fu,
        {
          token: H,
          tokens: R,
          quickActionSymbols: L,
          customTokenSymbols: S,
          currencyMode: r,
          minAmount: at,
          maxAmount: it,
          depositAddress: Se || A.solanaPubkey,
          walletReady: Ft || b,
          needsUnlock: Ot && !b,
          copied: Ue,
          isListening: !!he && !b,
          config: e,
          onCopy: Wt,
          onTokenSelect: os,
          onUnlockRequired: m,
          onConfirm: (K, ie) => Wo(K, ie),
          onBack: () => F("unlock"),
          onCancel: h
        }
      ),
      $ === "signing" && /* @__PURE__ */ t(Ou, { depositAddress: A.solanaPubkey }),
      $ === "show-address" && /* @__PURE__ */ t(
        Wu,
        {
          token: H,
          tokens: R,
          quickActionSymbols: L,
          customTokenSymbols: S,
          tokenPriceUsd: E,
          currencyMode: r,
          depositAddress: Se || A.solanaPubkey,
          copied: Ue,
          isListening: !!he && !b,
          config: e,
          onCopy: Wt,
          onTokenSelect: os,
          onAmountChange: Fe,
          onSent: qo,
          onBack: () => F("unlock"),
          onCancel: h
        }
      ),
      $ === "waiting" && /* @__PURE__ */ t(
        qu,
        {
          token: H,
          depositAddress: Se || A.solanaPubkey,
          copied: Ue,
          feeLine: jo,
          onCopy: Wt
        }
      ),
      $ === "success" && D && /* @__PURE__ */ t(zu, { result: D, config: e, onNewDeposit: zo }),
      $ === "error" && /* @__PURE__ */ t(
        ju,
        {
          error: te || v || "An error occurred",
          onRetry: () => F("confirm"),
          onCancel: h
        }
      )
    ] })
  ] });
}
function Io() {
  const e = ze(), [r, s] = k(!1), [o, n] = k(null), a = q(() => e ? new oe({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), c = B(() => {
    n(null);
  }, []), d = B(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await a.get("/credits/balance/sol");
    } catch (m) {
      const u = V(m, "Failed to fetch credit balance");
      throw n(u.message), u;
    } finally {
      s(!1);
    }
  }, [a]), l = B(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return (await a.get("/credits/balance")).balances;
    } catch (m) {
      const u = V(m, "Failed to fetch credit balances");
      throw n(u.message), u;
    } finally {
      s(!1);
    }
  }, [a]), h = B(
    async (m) => {
      if (!a)
        throw new Error("useCredits must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const u = new URLSearchParams();
        m?.currency && u.set("currency", m.currency), m?.limit !== void 0 && u.set("limit", m.limit.toString()), m?.offset !== void 0 && u.set("offset", m.offset.toString());
        const p = u.toString(), g = p ? `/credits/history?${p}` : "/credits/history";
        return await a.get(g);
      } catch (u) {
        const p = V(u, "Failed to fetch transaction history");
        throw n(p.message), p;
      } finally {
        s(!1);
      }
    },
    [a]
  );
  return {
    getBalance: d,
    getAllBalances: l,
    getHistory: h,
    isLoading: r,
    error: o,
    clearError: c
  };
}
function om({
  showAllCurrencies: e = !1,
  refreshInterval: r = 0,
  compact: s = !1,
  className: o = "",
  onLoad: n
}) {
  const { getBalance: a, getAllBalances: c, isLoading: d, error: l, clearError: h } = Io(), [m, u] = k([]), [p, g] = k(null), w = B(async () => {
    try {
      if (e) {
        const b = await c();
        u(b), n?.(b);
      } else {
        const b = await a();
        u([b]), n?.([b]);
      }
      g(null);
    } catch (b) {
      g(b instanceof Error ? b.message : "Failed to load balance");
    }
  }, [e, a, c, n]);
  if (O(() => {
    w();
  }, [w]), O(() => {
    if (r <= 0) return;
    const b = setInterval(w, r);
    return () => clearInterval(b);
  }, [r, w]), p || l)
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-error ${o}`, children: [
      /* @__PURE__ */ t("p", { className: "cedros-credit-error", children: p || l }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-credit-retry",
          onClick: () => {
            h(), g(null), w();
          },
          children: "Retry"
        }
      )
    ] });
  if (d && m.length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-loading ${o}`, children: [
      /* @__PURE__ */ t("span", { className: "cedros-credit-loading-indicator" }),
      /* @__PURE__ */ t("span", { className: "cedros-credit-loading-text", children: "Loading balance..." })
    ] });
  if (s) {
    const b = m[0];
    return /* @__PURE__ */ i("div", { className: `cedros-credit-balance cedros-credit-balance-compact ${o}`, children: [
      b ? /* @__PURE__ */ t(
        "span",
        {
          className: "cedros-credit-value",
          title: `${b.balanceLamports} lamports`,
          children: b.display
        }
      ) : /* @__PURE__ */ t("span", { className: "cedros-credit-value cedros-credit-value-zero", children: "0.0000 SOL" }),
      d && /* @__PURE__ */ t("span", { className: "cedros-credit-refresh-indicator", title: "Refreshing..." })
    ] });
  }
  return /* @__PURE__ */ i("div", { className: `cedros-credit-balance ${o}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-credit-header", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-credit-title", children: "Credit Balance" }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-credit-refresh",
          onClick: w,
          disabled: d,
          title: "Refresh balance",
          children: d ? "..." : "↻"
        }
      )
    ] }),
    m.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-credit-empty", children: [
      /* @__PURE__ */ t("p", { className: "cedros-credit-empty-message", children: "No credit balance yet." }),
      /* @__PURE__ */ t("p", { className: "cedros-credit-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ t("div", { className: "cedros-credit-list", children: m.map((b) => /* @__PURE__ */ i("div", { className: "cedros-credit-item", children: [
      /* @__PURE__ */ t("span", { className: "cedros-credit-currency", children: b.currency }),
      /* @__PURE__ */ t("span", { className: "cedros-credit-amount", children: b.display })
    ] }, b.currency)) })
  ] });
}
const kr = [
  { key: "all", label: "All", txTypes: null },
  { key: "deposits", label: "Deposits", txTypes: ["deposit"] },
  { key: "usage", label: "Usage", txTypes: ["spend", "usage", "charge"] },
  {
    key: "adjustments",
    label: "Adjustments",
    txTypes: ["refund", "adjustment", "bonus", "credit"]
  }
];
function Vu(e, r) {
  const s = e < 0, o = Math.abs(e), n = xo(r), a = o / Math.pow(10, n), c = s ? "-" : "+";
  return r.toUpperCase() === "SOL" ? `${c}${a.toFixed(4)} SOL` : `${c}$${a.toFixed(2)}`;
}
function Hu(e) {
  const r = new Date(e), s = /* @__PURE__ */ new Date(), o = s.getTime() - r.getTime();
  if (o < 0) return "Just now";
  const n = Math.floor(o / (1e3 * 60 * 60 * 24));
  if (n === 0) {
    const a = Math.floor(o / 36e5);
    if (a === 0) {
      const c = Math.floor(o / 6e4);
      return c < 1 ? "Just now" : `${c}m ago`;
    }
    return `${a}h ago`;
  }
  return n === 1 ? "Yesterday" : n < 7 ? `${n}d ago` : r.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: r.getFullYear() !== s.getFullYear() ? "numeric" : void 0
  });
}
function Gu(e) {
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
function Qu(e, r) {
  const s = (e || "").toLowerCase();
  return s === "deposit" ? "↓" : s === "spend" || s === "usage" || s === "charge" ? "↑" : s === "refund" ? "←" : s === "bonus" || s === "credit" ? "★" : r ? "+" : "−";
}
function am({
  defaultTab: e = "all",
  pageSize: r = 10,
  refreshInterval: s = 0,
  className: o = "",
  onLoad: n,
  onTransactionClick: a
}) {
  const { getHistory: c, isLoading: d, error: l, clearError: h } = Io(), [m, u] = k(e), [p, g] = k([]), [w, b] = k(0), [x, E] = k(0), [N, C] = k(null), _ = kr.find((P) => P.key === m) || kr[0], T = q(() => _.txTypes === null ? p : p.filter((P) => {
    const M = P.txType || "";
    return _.txTypes.some((I) => M.toLowerCase() === I.toLowerCase());
  }), [p, _.txTypes]), f = B(async () => {
    try {
      const P = await c({ limit: r * 3, offset: x });
      g(P.transactions), b(P.total), n?.(P), C(null);
    } catch (P) {
      C(P instanceof Error ? P.message : "Failed to load history");
    }
  }, [r, x, c, n]);
  O(() => {
    E(0);
  }, [m]), O(() => {
    f();
  }, [f]), O(() => {
    if (s <= 0) return;
    const P = setInterval(f, s);
    return () => clearInterval(P);
  }, [s, f]);
  const v = _.txTypes === null ? w : T.length, y = Math.ceil(v / r), A = Math.floor(x / r) + 1, L = (P) => {
    const M = (P - 1) * r;
    E(Math.max(0, Math.min(M, Math.max(0, v - r))));
  }, S = (P) => {
    u(P);
  };
  if (N || l)
    return /* @__PURE__ */ i("div", { className: `cedros-tx-history cedros-tx-history-error ${o}`, children: [
      /* @__PURE__ */ t("p", { className: "cedros-tx-error", children: N || l }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-tx-retry",
          onClick: () => {
            h(), C(null), f();
          },
          children: "Retry"
        }
      )
    ] });
  if (d && p.length === 0)
    return /* @__PURE__ */ i("div", { className: `cedros-tx-history cedros-tx-history-loading ${o}`, children: [
      /* @__PURE__ */ t("span", { className: "cedros-tx-loading-indicator" }),
      /* @__PURE__ */ t("span", { className: "cedros-tx-loading-text", children: "Loading transactions..." })
    ] });
  const R = (P) => P.txTypes === null ? p.length : p.filter((M) => {
    const I = M.txType || "";
    return P.txTypes.some((U) => I.toLowerCase() === U.toLowerCase());
  }).length;
  return /* @__PURE__ */ i("div", { className: `cedros-tx-history ${o}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-tx-header", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-tx-title", children: "Transaction History" }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-tx-refresh",
          onClick: f,
          disabled: d,
          title: "Refresh",
          children: d ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-tx-tabs", children: kr.map((P) => {
      const M = R(P), I = m === P.key;
      return /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: `cedros-tx-tab ${I ? "cedros-tx-tab-active" : ""}`,
          onClick: () => S(P.key),
          children: [
            P.label,
            M > 0 && /* @__PURE__ */ t("span", { className: "cedros-tx-tab-count", children: M })
          ]
        },
        P.key
      );
    }) }),
    T.length === 0 ? /* @__PURE__ */ i("div", { className: "cedros-tx-empty", children: [
      /* @__PURE__ */ t("p", { className: "cedros-tx-empty-message", children: m === "all" ? "No transactions yet." : `No ${_.label.toLowerCase()} found.` }),
      m === "all" && /* @__PURE__ */ t("p", { className: "cedros-tx-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ t("div", { className: "cedros-tx-list", children: T.slice(0, r).map((P) => {
        const M = P.amountLamports >= 0;
        return /* @__PURE__ */ i(
          "div",
          {
            className: `cedros-tx-item ${M ? "cedros-tx-item-positive" : "cedros-tx-item-negative"}`,
            onClick: () => a?.(P),
            onKeyDown: (I) => {
              (I.key === "Enter" || I.key === " ") && (I.preventDefault(), a?.(P));
            },
            role: a ? "button" : void 0,
            tabIndex: a ? 0 : void 0,
            children: [
              /* @__PURE__ */ t(
                "div",
                {
                  className: `cedros-tx-icon ${M ? "cedros-tx-icon-positive" : "cedros-tx-icon-negative"}`,
                  children: Qu(P.txType, M)
                }
              ),
              /* @__PURE__ */ i("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ t("span", { className: "cedros-tx-type", children: Gu(P.txType) }),
                  /* @__PURE__ */ t(
                    "span",
                    {
                      className: `cedros-tx-amount ${M ? "cedros-tx-amount-positive" : "cedros-tx-amount-negative"}`,
                      children: Vu(P.amountLamports, P.currency)
                    }
                  )
                ] }),
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ t("span", { className: "cedros-tx-description", children: P.description }),
                  /* @__PURE__ */ t("span", { className: "cedros-tx-date", children: Hu(P.createdAt) })
                ] })
              ] })
            ]
          },
          P.id
        );
      }) }),
      y > 1 && /* @__PURE__ */ i("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => L(A - 1),
            disabled: A <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          A,
          " of ",
          y
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => L(A + 1),
            disabled: A >= y,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Uo() {
  const e = ze(), [r, s] = k(!1), [o, n] = k(null), [a, c] = k(null), d = q(() => e ? new oe({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), l = B(() => {
    n(null);
  }, []), h = B(async () => {
    if (!d)
      throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
    try {
      return await d.get("/wallet/withdraw/balances");
    } catch (g) {
      const w = V(g, "Failed to fetch wallet balances");
      throw n(w.message), w;
    }
  }, [d]), m = B(
    async (g, w) => {
      if (!d)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const b = await d.post("/wallet/withdraw/sol", {
          destination: g,
          amount_lamports: w
        });
        return c(b), b;
      } catch (b) {
        const x = V(b, "Failed to withdraw SOL");
        throw n(x.message), x;
      } finally {
        s(!1);
      }
    },
    [d]
  ), u = B(
    async (g, w, b) => {
      if (!d)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const x = await d.post("/wallet/withdraw/spl", {
          destination: g,
          token_mint: w,
          amount: b
        });
        return c(x), x;
      } catch (x) {
        const E = V(x, "Failed to withdraw token");
        throw n(E.message), E;
      } finally {
        s(!1);
      }
    },
    [d]
  ), p = B(
    async (g = 10, w = 0) => {
      if (!d)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      try {
        const b = Math.max(1, Math.min(100, Math.trunc(g))), x = Math.max(0, Math.trunc(w)), E = new URLSearchParams({
          limit: String(b),
          offset: String(x)
        });
        return await d.get(
          `/wallet/withdraw/history?${E}`
        );
      } catch (b) {
        const x = V(b, "Failed to fetch withdrawal history");
        throw n(x.message), x;
      }
    },
    [d]
  );
  return {
    withdrawSol: m,
    withdrawSpl: u,
    getBalances: h,
    getHistory: p,
    isSubmitting: r,
    error: o,
    clearError: l,
    lastResult: a
  };
}
const Cr = "So11111111111111111111111111111111111111112", Yu = {
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
function Ku(e) {
  return e.length < 32 || e.length > 50 ? !1 : /^[1-9A-HJ-NP-Za-km-z]+$/.test(e);
}
function Er(e) {
  return e.length <= 16 ? e : `${e.slice(0, 6)}...${e.slice(-6)}`;
}
function ft(e, r) {
  return (Number(e) / Math.pow(10, r)).toLocaleString(void 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(r, 6)
  });
}
function im({
  onSuccess: e,
  onError: r,
  onCancel: s,
  className: o = ""
}) {
  const n = ze(), { withdrawSol: a, withdrawSpl: c, getBalances: d, isSubmitting: l, error: h, clearError: m } = Uo(), [u, p] = k("loading"), [g, w] = k([]), [b, x] = k(null), [E, N] = k(""), [C, _] = k(""), [T, f] = k(null), [v, y] = k(null), [A, L] = k(null), S = n?.config.solana?.network ?? "mainnet-beta", R = q(() => {
    if (!T?.txSignature) return "";
    const F = `https://explorer.solana.com/tx/${T.txSignature}`;
    return S === "mainnet-beta" ? F : `${F}?cluster=${encodeURIComponent(S)}`;
  }, [T, S]), P = q(() => {
    if (!b || !C) return "0";
    const F = parseFloat(C);
    return isNaN(F) || F <= 0 ? "0" : Math.floor(F * Math.pow(10, b.decimals)).toString();
  }, [C, b]);
  O(() => {
    if (!n) return;
    let F = !1;
    return (async () => {
      try {
        const H = await d();
        if (F) return;
        const Z = [];
        H.solLamports > 0 && Z.push({
          symbol: "SOL",
          mint: Cr,
          decimals: 9,
          rawBalance: String(H.solLamports),
          displayBalance: ft(String(H.solLamports), 9)
        });
        for (const Q of H.tokens) {
          const le = Yu[Q.mint] ?? Er(Q.mint);
          Z.push({
            symbol: le,
            mint: Q.mint,
            decimals: Q.decimals,
            rawBalance: Q.amount,
            displayBalance: ft(Q.amount, Q.decimals)
          });
        }
        w(Z), p((Z.length > 0, "select"));
      } catch {
        F || (L("Failed to load wallet balances"), p("select"));
      }
    })(), () => {
      F = !0;
    };
  }, [n, d]);
  const M = B(
    (F) => {
      x(F), p("form"), m(), y(null), _("");
    },
    [m]
  ), I = B(() => {
    if (!b) return;
    const F = Number(b.rawBalance) / Math.pow(10, b.decimals);
    b.mint === Cr ? _(String(Math.max(0, F - 0.01))) : _(String(F));
  }, [b]), U = B(() => {
    if (y(null), !E.trim()) {
      y("Destination address is required");
      return;
    }
    if (!Ku(E.trim())) {
      y("Invalid Solana address");
      return;
    }
    if (!C || parseFloat(C) <= 0 || isNaN(parseFloat(C))) {
      y("Please enter a valid amount");
      return;
    }
    if (P === "0") {
      y("Amount is too small");
      return;
    }
    p("confirm");
  }, [E, C, P]), W = B(async () => {
    if (b) {
      p("processing"), m();
      try {
        let F;
        b.mint === Cr ? F = await a(E.trim(), Number(P)) : F = await c(E.trim(), b.mint, P), f(F), p("success"), e?.(F);
      } catch (F) {
        p("confirm"), r?.(F instanceof Error ? F : new Error(String(F)));
      }
    }
  }, [
    b,
    E,
    P,
    a,
    c,
    m,
    e,
    r
  ]), z = B(() => {
    m(), y(null), u === "form" ? (p("select"), x(null), _(""), N("")) : u === "confirm" && p("form");
  }, [u, m]), $ = B(() => {
    p("select"), x(null), N(""), _(""), f(null), m(), y(null);
  }, [m]);
  return n ? /* @__PURE__ */ i("div", { className: `cedros-withdrawal ${o}`, children: [
    u === "loading" && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ t(Y, {}),
      /* @__PURE__ */ t("p", { className: "cedros-withdrawal-processing-text", children: "Loading wallet balances..." })
    ] }),
    u === "select" && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-select", children: [
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ t("h3", { className: "cedros-withdrawal-title", children: "Withdraw" }),
        /* @__PURE__ */ t("p", { className: "cedros-withdrawal-subtitle", children: "Select a token to withdraw" })
      ] }),
      A && /* @__PURE__ */ t(ne, { error: A }),
      g.length === 0 && !A && /* @__PURE__ */ t("p", { className: "cedros-withdrawal-empty", children: "No tokens found in your wallet." }),
      /* @__PURE__ */ t("div", { className: "cedros-withdrawal-tokens", children: g.map((F) => /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          className: "cedros-withdrawal-token-pill",
          onClick: () => M(F),
          children: [
            /* @__PURE__ */ t("span", { className: "cedros-withdrawal-token-symbol", children: F.symbol }),
            /* @__PURE__ */ t("span", { className: "cedros-withdrawal-token-balance", children: F.displayBalance })
          ]
        },
        F.mint
      )) }),
      s && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-ghost cedros-withdrawal-cancel",
          onClick: s,
          children: "Cancel"
        }
      )
    ] }),
    u === "form" && b && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-form", children: [
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: z,
            children: "Back"
          }
        ),
        /* @__PURE__ */ i("h3", { className: "cedros-withdrawal-title", children: [
          "Withdraw ",
          b.symbol
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-balance-hint", children: [
        "Balance: ",
        b.displayBalance,
        " ",
        b.symbol
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ t("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-destination", children: "Destination Address" }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "cedros-withdrawal-destination",
            type: "text",
            className: "cedros-input",
            placeholder: "Solana address (base58)",
            value: E,
            onChange: (F) => N(F.target.value),
            autoComplete: "off",
            spellCheck: !1
          }
        )
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ i("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-amount", children: [
          "Amount (",
          b.symbol,
          ")"
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-amount-row", children: [
          /* @__PURE__ */ t(
            "input",
            {
              id: "cedros-withdrawal-amount",
              type: "number",
              className: "cedros-input",
              placeholder: "0.00",
              value: C,
              onChange: (F) => _(F.target.value),
              min: "0",
              step: "any"
            }
          ),
          /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-ghost cedros-button-sm",
              onClick: I,
              children: "Max"
            }
          )
        ] })
      ] }),
      (v || h) && /* @__PURE__ */ t(ne, { error: v || h || "" }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-withdrawal-submit",
          onClick: U,
          children: "Review Withdrawal"
        }
      )
    ] }),
    u === "confirm" && b && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-confirm", children: [
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: z,
            disabled: l,
            children: "Back"
          }
        ),
        /* @__PURE__ */ t("h3", { className: "cedros-withdrawal-title", children: "Confirm Withdrawal" })
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary", children: [
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-label", children: "Token" }),
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-value", children: b.symbol })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-label", children: "Amount" }),
          /* @__PURE__ */ i("span", { className: "cedros-withdrawal-summary-value", children: [
            ft(P, b.decimals),
            " ",
            b.symbol
          ] })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-label", children: "Destination" }),
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-value", title: E, children: Er(E) })
        ] }),
        /* @__PURE__ */ i("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-label", children: "Est. Fee" }),
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-value", children: "~0.000005 SOL" })
        ] })
      ] }),
      h && /* @__PURE__ */ t(ne, { error: h }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: z,
            disabled: l,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ t(
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
    u === "processing" && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ t(Y, {}),
      /* @__PURE__ */ i("p", { className: "cedros-withdrawal-processing-text", children: [
        "Sending ",
        b?.symbol,
        "..."
      ] })
    ] }),
    u === "success" && T && /* @__PURE__ */ i("div", { className: "cedros-withdrawal-success", children: [
      /* @__PURE__ */ t("div", { className: "cedros-withdrawal-success-icon", children: "✓" }),
      /* @__PURE__ */ t("h3", { className: "cedros-withdrawal-title", children: "Withdrawal Complete" }),
      /* @__PURE__ */ i("p", { className: "cedros-withdrawal-subtitle", children: [
        ft(P, b?.decimals ?? 9),
        " ",
        b?.symbol,
        " ",
        "sent"
      ] }),
      /* @__PURE__ */ i("div", { className: "cedros-withdrawal-tx", children: [
        /* @__PURE__ */ t("span", { className: "cedros-withdrawal-tx-label", children: "Transaction" }),
        /* @__PURE__ */ t(
          "a",
          {
            className: "cedros-withdrawal-tx-link",
            href: R,
            target: "_blank",
            rel: "noreferrer",
            children: Er(T.txSignature)
          }
        )
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-withdrawal-done",
          onClick: $,
          children: "Done"
        }
      )
    ] })
  ] }) : null;
}
function Zu(e, r) {
  if (e === "sol") return "SOL";
  if (!r) return "SPL";
  const s = Jr.find((o) => o.mint === r);
  return s ? s.symbol : `${r.slice(0, 4)}...${r.slice(-4)}`;
}
function Xu(e, r) {
  const s = Number(e);
  if (Number.isNaN(s)) return e;
  const o = xo(r), n = s / Math.pow(10, o);
  return r === "SOL" ? `${n.toFixed(4)} SOL` : `${n.toFixed(2)} ${r}`;
}
function Ju(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function eh(e) {
  const r = new Date(e), s = /* @__PURE__ */ new Date(), o = s.getTime() - r.getTime();
  if (o < 0) return "Just now";
  const n = Math.floor(o / (1e3 * 60 * 60 * 24));
  if (n === 0) {
    const a = Math.floor(o / 36e5);
    if (a === 0) {
      const c = Math.floor(o / 6e4);
      return c < 1 ? "Just now" : `${c}m ago`;
    }
    return `${a}h ago`;
  }
  return n === 1 ? "Yesterday" : n < 7 ? `${n}d ago` : r.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: r.getFullYear() !== s.getFullYear() ? "numeric" : void 0
  });
}
function cm({
  pageSize: e = 10,
  className: r = "",
  onTransactionClick: s,
  explorerUrl: o = "https://solscan.io"
}) {
  const n = o.startsWith("https://") ? o : "https://solscan.io", { getHistory: a, error: c, clearError: d } = Uo(), [l, h] = k([]), [m, u] = k(0), [p, g] = k(0), [w, b] = k(!1), [x, E] = k(null), N = B(async () => {
    b(!0);
    try {
      const f = await a(e, p);
      h(f.items), u(f.total), E(null);
    } catch (f) {
      E(f instanceof Error ? f.message : "Failed to load withdrawal history");
    } finally {
      b(!1);
    }
  }, [e, p, a]);
  O(() => {
    N();
  }, [N]);
  const C = Math.ceil(m / e), _ = Math.floor(p / e) + 1, T = (f) => {
    const v = (f - 1) * e;
    g(Math.max(0, Math.min(v, Math.max(0, m - e))));
  };
  return x || c ? /* @__PURE__ */ i("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-error ${r}`, children: [
    /* @__PURE__ */ t("p", { className: "cedros-withdrawal-error", children: x || c }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-withdrawal-retry",
        onClick: () => {
          d(), E(null), N();
        },
        children: "Retry"
      }
    )
  ] }) : w && l.length === 0 ? /* @__PURE__ */ i("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-loading ${r}`, children: [
    /* @__PURE__ */ t("span", { className: "cedros-tx-loading-indicator" }),
    /* @__PURE__ */ t("span", { className: "cedros-tx-loading-text", children: "Loading withdrawal history..." })
  ] }) : /* @__PURE__ */ i("div", { className: `cedros-withdrawal-history ${r}`, children: [
    /* @__PURE__ */ i("div", { className: "cedros-tx-header", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-tx-title", children: "Withdrawal History" }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-tx-refresh",
          onClick: N,
          disabled: w,
          title: "Refresh",
          children: w ? "..." : "↻"
        }
      )
    ] }),
    l.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-tx-empty", children: /* @__PURE__ */ t("p", { className: "cedros-tx-empty-message", children: "No withdrawal history yet." }) }) : /* @__PURE__ */ i(X, { children: [
      /* @__PURE__ */ t("div", { className: "cedros-tx-list", children: l.map((f) => {
        const v = Zu(f.tokenType, f.tokenMint);
        return /* @__PURE__ */ i(
          "div",
          {
            className: "cedros-tx-item cedros-tx-item-negative",
            onClick: () => s?.(f),
            onKeyDown: (y) => {
              (y.key === "Enter" || y.key === " ") && (y.preventDefault(), s?.(f));
            },
            role: s ? "button" : void 0,
            tabIndex: s ? 0 : void 0,
            children: [
              /* @__PURE__ */ t("div", { className: "cedros-tx-icon cedros-tx-icon-negative", children: "↑" }),
              /* @__PURE__ */ i("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ i("span", { className: "cedros-tx-type", children: [
                    v,
                    " Withdrawal"
                  ] }),
                  /* @__PURE__ */ t("span", { className: "cedros-tx-amount cedros-tx-amount-negative", children: Xu(f.amount, v) })
                ] }),
                /* @__PURE__ */ i("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ i("span", { className: "cedros-tx-description", children: [
                    "To",
                    " ",
                    /* @__PURE__ */ t(
                      "a",
                      {
                        href: `${n}/account/${f.destination}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (y) => y.stopPropagation(),
                        children: Ju(f.destination)
                      }
                    ),
                    " · ",
                    /* @__PURE__ */ t(
                      "a",
                      {
                        href: `${n}/tx/${f.txSignature}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (y) => y.stopPropagation(),
                        children: "tx"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ t("span", { className: "cedros-tx-date", children: eh(f.createdAt) })
                ] })
              ] })
            ]
          },
          f.id
        );
      }) }),
      C > 1 && /* @__PURE__ */ i("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => T(_ - 1),
            disabled: _ <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ i("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          _,
          " of ",
          C
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => T(_ + 1),
            disabled: _ >= C,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function lm({
  brandLogo: e,
  brandName: r,
  title: s = "Welcome back",
  subtitle: o = "Login with your Apple or Google account",
  termsText: n,
  onSuccess: a,
  defaultTab: c = "login",
  children: d,
  className: l = ""
}) {
  return /* @__PURE__ */ i("div", { className: `cedros-full-page-layout ${l}`, children: [
    (e || r) && /* @__PURE__ */ i("div", { className: "cedros-brand-header", children: [
      e,
      r && /* @__PURE__ */ t("span", { className: "cedros-brand-name", children: r })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-full-page-card", children: [
      /* @__PURE__ */ i("div", { className: "cedros-full-page-header", children: [
        /* @__PURE__ */ t("h1", { className: "cedros-full-page-title", children: s }),
        o && /* @__PURE__ */ t("p", { className: "cedros-full-page-subtitle", children: o })
      ] }),
      d ?? /* @__PURE__ */ t(Kr, { defaultTab: c, onSuccess: a })
    ] }),
    n && /* @__PURE__ */ t("p", { className: "cedros-terms-footer", children: n })
  ] });
}
function dm({
  brandName: e = "Your Brand",
  brandLogo: r,
  tagline: s = "Your tagline goes here. Make it compelling.",
  title: o = "Sign in",
  subtitle: n = "Enter your credentials to access your account",
  onSuccess: a,
  defaultTab: c = "login",
  children: d,
  className: l = ""
}) {
  return /* @__PURE__ */ i("div", { className: `cedros-split-page-layout ${l}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-split-page-brand", children: /* @__PURE__ */ i("div", { className: "cedros-split-page-brand-content", children: [
      r ?? /* @__PURE__ */ t("div", { className: "cedros-split-page-logo", children: e.charAt(0).toUpperCase() }),
      /* @__PURE__ */ t("h1", { className: "cedros-split-page-brand-name", children: e }),
      s && /* @__PURE__ */ t("p", { className: "cedros-split-page-tagline", children: s })
    ] }) }),
    /* @__PURE__ */ t("div", { className: "cedros-split-page-form", children: /* @__PURE__ */ i("div", { className: "cedros-split-page-form-content", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-split-page-title", children: o }),
      n && /* @__PURE__ */ t("p", { className: "cedros-split-page-subtitle", children: n }),
      d ?? /* @__PURE__ */ t(Kr, { defaultTab: c, onSuccess: a })
    ] }) })
  ] });
}
function um() {
  const { config: e, _internal: r } = re(), [s, o] = k({
    allowed: !1,
    reason: void 0,
    isLoading: !1,
    error: null
  }), n = q(
    () => new Sa(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      r?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, r]
  ), a = B(
    async (l) => {
      o((h) => ({ ...h, isLoading: !0, error: null }));
      try {
        const h = await n.authorize(l), m = {
          allowed: h.allowed,
          reason: h.reason,
          isLoading: !1,
          error: null
        };
        return o(m), m;
      } catch (h) {
        const m = {
          allowed: !1,
          reason: void 0,
          isLoading: !1,
          error: h
        };
        return o(m), m;
      }
    },
    [n]
  ), c = B(
    async (l) => (await a(l)).allowed,
    [a]
  ), d = B(() => {
    o({
      allowed: !1,
      reason: void 0,
      isLoading: !1,
      error: null
    });
  }, []);
  return {
    authorize: c,
    lastCheck: s,
    clearCheck: d,
    checkAuthorization: a
  };
}
function hm() {
  const { listAllWallets: e, createDerivedWallet: r, deleteDerivedWallet: s } = Ke(), [o, n] = k([]), [a, c] = k(!1), [d, l] = k(null), h = B(async () => {
    c(!0), l(null);
    try {
      const g = await e();
      n(g.wallets);
    } catch (g) {
      const w = g instanceof Error ? g.message : "Failed to list wallets";
      l(w);
    } finally {
      c(!1);
    }
  }, [e]), m = B(
    async (g) => {
      c(!0), l(null);
      try {
        const w = await r({ label: g });
        return await h(), w;
      } catch (w) {
        const b = w instanceof Error ? w.message : "Failed to create wallet";
        throw l(b), w;
      } finally {
        c(!1);
      }
    },
    [r, h]
  ), u = B(
    async (g) => {
      c(!0), l(null);
      try {
        await s(g), await h();
      } catch (w) {
        const b = w instanceof Error ? w.message : "Failed to delete wallet";
        throw l(b), w;
      } finally {
        c(!1);
      }
    },
    [s, h]
  ), p = B(() => l(null), []);
  return {
    wallets: o,
    isLoading: a,
    createWallet: m,
    deleteWallet: u,
    refresh: h,
    error: d,
    clearError: p
  };
}
function mm() {
  const e = ze(), [r, s] = k(!1), [o, n] = k(null), [a, c] = k(null), d = q(() => e ? new oe({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), l = B(async () => {
    if (!d)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      const u = await d.get("/wallet/pending-recovery");
      c(u);
    } catch (u) {
      const p = V(u, "Failed to fetch pending recovery");
      throw n(p.message), p;
    } finally {
      s(!1);
    }
  }, [d]), h = B(async () => {
    if (!d)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      const u = { confirmed: !0 };
      await d.post("/wallet/acknowledge-recovery", u), c(null);
    } catch (u) {
      const p = V(u, "Failed to acknowledge recovery");
      throw n(p.message), p;
    } finally {
      s(!1);
    }
  }, [d]), m = B(() => n(null), []);
  return O(() => {
    d && e?.authState === "authenticated" && l().catch(() => {
    });
  }, [d, e?.authState, l]), {
    hasPendingRecovery: a?.hasPendingRecovery ?? !1,
    recoveryType: a?.recoveryType ?? null,
    recoveryPhrase: a?.recoveryPhrase ?? null,
    expiresAt: a?.expiresAt ? new Date(a.expiresAt) : null,
    fetchPendingRecovery: l,
    acknowledgeRecovery: h,
    isLoading: r,
    error: o,
    clearError: m
  };
}
function fm(e = {}) {
  const { onExternalSign: r } = e, { solanaPubkey: s, hasExternalWallet: o, status: n, isUnlocked: a } = Pt(), {
    signTransaction: c,
    isSigning: d,
    error: l,
    clearError: h
  } = sl(), m = q(() => o && r ? "external" : n === "enrolled_locked" || n === "enrolled_unlocked" ? "sss" : "none", [o, r, n]), u = m !== "none", p = n === "enrolled_locked" || n === "enrolled_unlocked";
  return {
    signTransaction: B(
      async (w, b) => {
        if (m === "external") {
          if (!r)
            throw new Error("External wallet signing callback not provided");
          return r(w);
        }
        if (m === "sss") {
          if (!b && !a)
            throw new Error(
              "Credential required for signing. Unlock wallet first or provide credential."
            );
          return b ? c(w, b) : c(w);
        }
        throw new Error("No signing method available. Enroll a wallet first.");
      },
      [m, r, a, c]
    ),
    signingMethod: m,
    canSign: u,
    isSigning: d,
    publicKey: s,
    hasExternalWallet: o,
    hasSssWallet: p,
    isSssUnlocked: a,
    error: l,
    clearError: h
  };
}
function pm() {
  const { config: e, _internal: r } = re(), [s, o] = k(null), [n, a] = k(!1), [c, d] = k(null), l = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), h = B(async () => {
    a(!0), d(null);
    try {
      await l.post("/welcome-completed", {});
    } catch (u) {
      const p = u instanceof Error ? u : new Error(String(u));
      throw d(p), p;
    } finally {
      a(!1);
    }
  }, [l]), m = B(() => {
    o(null);
  }, []);
  return {
    postLoginAction: s,
    setPostLoginAction: o,
    markWelcomeCompleted: h,
    clearPostLogin: m,
    isLoading: n,
    error: c
  };
}
function gm() {
  const { config: e } = re(), r = e.theme ?? "auto", s = e.unstyled ?? !1, o = Zo({
    theme: s ? void 0 : r,
    themeOverrides: s ? void 0 : e.themeOverrides
  });
  return {
    mode: r,
    isDark: o.className === "cedros-dark",
    className: o.className,
    style: o.style,
    unstyled: s,
    overrides: e.themeOverrides
  };
}
function th() {
  const { config: e, _internal: r } = re(), [s, o] = k(!1), [n, a] = k(null), [c, d] = k([]), [l, h] = k(0), m = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), u = B(async () => {
    o(!0), a(null);
    try {
      const g = await m.post(
        "/access-codes/generate",
        {},
        { credentials: "include" }
      );
      return d((w) => [g, ...w]), h((w) => w + 1), g;
    } catch (g) {
      const w = g instanceof Error ? g : new Error(String(g));
      throw a(w), w;
    } finally {
      o(!1);
    }
  }, [m]), p = B(async () => {
    o(!0), a(null);
    try {
      const g = await m.get("/access-codes/mine", {
        credentials: "include"
      });
      d(g.items), h(g.total);
    } catch (g) {
      const w = g instanceof Error ? g : new Error(String(g));
      throw a(w), w;
    } finally {
      o(!1);
    }
  }, [m]);
  return {
    codes: c,
    total: l,
    generateCode: u,
    fetchCodes: p,
    isLoading: s,
    error: n
  };
}
function wm() {
  const { config: e, _internal: r } = re(), [s, o] = k(!1), [n, a] = k(null), [c, d] = k(null), [l, h] = k(null), [m, u] = k(null), [p, g] = k(null), w = p !== null && p !== "none", b = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), x = B(async () => {
    o(!0), a(null);
    try {
      const N = await b.get("/kyc/status", {
        credentials: "include"
      });
      return d(N.status), h(N.verifiedAt ?? null), u(N.expiresAt ?? null), g(N.enforcementMode), N;
    } catch (N) {
      const C = N instanceof Error ? N : new Error(String(N));
      throw a(C), C;
    } finally {
      o(!1);
    }
  }, [b]), E = B(async () => {
    o(!0), a(null);
    try {
      const N = await b.post(
        "/kyc/start",
        void 0,
        { credentials: "include" }
      );
      return d("pending"), N.redirectUrl;
    } catch (N) {
      const C = N instanceof Error ? N : new Error(String(N));
      throw a(C), C;
    } finally {
      o(!1);
    }
  }, [b]);
  return {
    status: c,
    verifiedAt: l,
    expiresAt: m,
    isRequired: w,
    enforcementMode: p,
    fetchStatus: x,
    startVerification: E,
    isLoading: s,
    error: n
  };
}
function rh() {
  const { config: e, _internal: r } = re(), [s, o] = k(!1), [n, a] = k(null), [c, d] = k(null), [l, h] = k([]), [m, u] = k(0), p = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), g = B(async () => {
    o(!0), a(null);
    try {
      const x = await p.get("/referral/rewards", {
        credentials: "include"
      });
      return d(x), x;
    } catch (x) {
      const E = x instanceof Error ? x : new Error(String(x));
      throw a(E), E;
    } finally {
      o(!1);
    }
  }, [p]), w = B(
    async (x = 10, E = 0) => {
      o(!0), a(null);
      try {
        const N = await p.get(
          `/referral/rewards/history?limit=${x}&offset=${E}`,
          { credentials: "include" }
        );
        return h(N.items), u(N.total), N;
      } catch (N) {
        const C = N instanceof Error ? N : new Error(String(N));
        throw a(C), C;
      } finally {
        o(!1);
      }
    },
    [p]
  ), b = B(
    async (x) => {
      o(!0), a(null);
      try {
        await p.post(
          "/referral/payout-wallet",
          { walletAddress: x },
          { credentials: "include" }
        ), d(
          (E) => E && { ...E, payoutWalletAddress: x }
        );
      } catch (E) {
        const N = E instanceof Error ? E : new Error(String(E));
        throw a(N), N;
      } finally {
        o(!1);
      }
    },
    [p]
  );
  return {
    rewards: c,
    history: l,
    historyTotal: m,
    fetchRewards: g,
    fetchHistory: w,
    setPayoutWallet: b,
    isLoading: s,
    error: n
  };
}
function xr(e, r) {
  return r === "SOL" ? (e / 1e9).toFixed(4) + " SOL" : "$" + (e / 1e6).toFixed(2);
}
function sh(e) {
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
const nh = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
function oh(e) {
  return nh.test(e);
}
function ah(e) {
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
function ih({ status: e }) {
  const s = {
    pending: "cedros-rewards-panel__badge--pending",
    completed: "cedros-rewards-panel__badge--completed",
    failed: "cedros-rewards-panel__badge--failed",
    credited: "cedros-rewards-panel__badge--credited"
  }[e] ?? "cedros-rewards-panel__badge--pending";
  return /* @__PURE__ */ t("span", { className: `cedros-rewards-panel__badge ${s}`, children: e.charAt(0).toUpperCase() + e.slice(1) });
}
const pt = 10;
function bm({ explorerUrl: e = "https://explorer.solana.com", className: r }) {
  const {
    rewards: s,
    history: o,
    historyTotal: n,
    fetchRewards: a,
    fetchHistory: c,
    setPayoutWallet: d,
    isLoading: l,
    error: h
  } = rh(), [m, u] = k(0), [p, g] = k(""), [w, b] = k(null), [x, E] = k(!1), [N, C] = k(!1);
  O(() => {
    a().catch(() => {
    }), c(pt, 0).catch(() => {
    });
  }, [a, c]), O(() => {
    s?.payoutWalletAddress != null && g(s.payoutWalletAddress);
  }, [s?.payoutWalletAddress]);
  const _ = B(
    (y) => {
      u(y), c(pt, y * pt).catch(() => {
      });
    },
    [c]
  ), T = Math.ceil(n / pt), f = B(async () => {
    const y = p.trim();
    if (y !== "" && !oh(y)) {
      b("Invalid address. Must be a base58 string between 32 and 44 characters.");
      return;
    }
    b(null), E(!0), C(!1);
    try {
      await d(y === "" ? null : y), C(!0);
    } catch (A) {
      b(A instanceof Error ? A.message : "Failed to save wallet address.");
    } finally {
      E(!1);
    }
  }, [p, d]), v = s?.rewardType === "direct_payout" ? "Direct Payout" : "Credits";
  return /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-rewards-panel ${r ?? ""}`.trim(),
      "aria-label": "Rewards dashboard",
      children: [
        h && /* @__PURE__ */ t("div", { className: "cedros-rewards-panel__error", role: "alert", children: h.message }),
        /* @__PURE__ */ i(
          "section",
          {
            className: "cedros-rewards-panel__summary",
            "aria-label": "Rewards summary",
            children: [
              /* @__PURE__ */ i("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-label", children: "Total Earned" }),
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-value", children: s ? xr(s.totalEarned, s.currency) : "—" })
              ] }),
              /* @__PURE__ */ i("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-label", children: "Pending Payouts" }),
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-value", children: s ? `${xr(s.pendingAmount, s.currency)} (${s.pendingCount})` : "—" })
              ] }),
              /* @__PURE__ */ i("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-label", children: "Referrals" }),
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-value", children: s ? String(s.referralCount) : "—" })
              ] }),
              /* @__PURE__ */ i("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-label", children: "Reward Type" }),
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-value", children: /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__type-badge", children: v }) })
              ] })
            ]
          }
        ),
        s?.rewardType === "direct_payout" && /* @__PURE__ */ i(
          "section",
          {
            className: "cedros-rewards-panel__wallet-section",
            "aria-label": "Payout wallet",
            children: [
              /* @__PURE__ */ t("h3", { className: "cedros-rewards-panel__section-title", children: "Payout Wallet" }),
              /* @__PURE__ */ i("div", { className: "cedros-rewards-panel__wallet-current", children: [
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__wallet-label", children: "Current address:" }),
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__wallet-address", children: s.payoutWalletAddress ?? "Not set" })
              ] }),
              /* @__PURE__ */ i("div", { className: "cedros-rewards-panel__wallet-form", children: [
                /* @__PURE__ */ t(
                  "label",
                  {
                    htmlFor: "cedros-payout-wallet-input",
                    className: "cedros-rewards-panel__wallet-input-label",
                    children: "Wallet address"
                  }
                ),
                /* @__PURE__ */ t(
                  "input",
                  {
                    id: "cedros-payout-wallet-input",
                    type: "text",
                    className: "cedros-rewards-panel__wallet-input",
                    value: p,
                    onChange: (y) => {
                      g(y.target.value), b(null), C(!1);
                    },
                    placeholder: "Base58 Solana address",
                    "aria-describedby": w ? "cedros-wallet-error" : void 0,
                    disabled: x
                  }
                ),
                /* @__PURE__ */ t(
                  "button",
                  {
                    type: "button",
                    className: "cedros-rewards-panel__wallet-save-btn",
                    onClick: f,
                    disabled: x || l,
                    children: x ? "Saving..." : "Save"
                  }
                )
              ] }),
              w && /* @__PURE__ */ t(
                "div",
                {
                  id: "cedros-wallet-error",
                  className: "cedros-rewards-panel__wallet-error",
                  role: "alert",
                  children: w
                }
              ),
              N && !w && /* @__PURE__ */ t(
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
        /* @__PURE__ */ i(
          "section",
          {
            className: "cedros-rewards-panel__history-section",
            "aria-label": "Reward history",
            children: [
              /* @__PURE__ */ t("h3", { className: "cedros-rewards-panel__section-title", children: "History" }),
              l && o.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-rewards-panel__loading", "aria-busy": "true", children: "Loading..." }) : o.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-rewards-panel__empty", children: "No rewards yet." }) : /* @__PURE__ */ i(X, { children: [
                /* @__PURE__ */ t("div", { className: "cedros-rewards-panel__table-wrapper", role: "region", "aria-label": "Reward history table", tabIndex: 0, children: /* @__PURE__ */ i("table", { className: "cedros-rewards-panel__table", children: [
                  /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ i("tr", { children: [
                    /* @__PURE__ */ t("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Date" }),
                    /* @__PURE__ */ t("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Type" }),
                    /* @__PURE__ */ t("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Amount" }),
                    /* @__PURE__ */ t("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Status" }),
                    /* @__PURE__ */ t("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Transaction" })
                  ] }) }),
                  /* @__PURE__ */ t("tbody", { children: o.map((y) => /* @__PURE__ */ i("tr", { className: "cedros-rewards-panel__tr", children: [
                    /* @__PURE__ */ t("td", { className: "cedros-rewards-panel__td", children: sh(y.createdAt) }),
                    /* @__PURE__ */ t("td", { className: "cedros-rewards-panel__td", children: ah(y.triggerType) }),
                    /* @__PURE__ */ t("td", { className: "cedros-rewards-panel__td", children: xr(y.amount, y.currency) }),
                    /* @__PURE__ */ t("td", { className: "cedros-rewards-panel__td", children: /* @__PURE__ */ t(ih, { status: y.status }) }),
                    /* @__PURE__ */ t("td", { className: "cedros-rewards-panel__td", children: y.txSignature ? /* @__PURE__ */ i(
                      "a",
                      {
                        href: `${e}/tx/${y.txSignature}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "cedros-rewards-panel__tx-link",
                        "aria-label": `View transaction ${y.txSignature.slice(0, 8)}... on Solana explorer`,
                        children: [
                          y.txSignature.slice(0, 8),
                          "..."
                        ]
                      }
                    ) : /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__tx-none", children: "—" }) })
                  ] }, y.id)) })
                ] }) }),
                T > 1 && /* @__PURE__ */ i(
                  "div",
                  {
                    className: "cedros-rewards-panel__pagination",
                    role: "navigation",
                    "aria-label": "History pagination",
                    children: [
                      /* @__PURE__ */ t(
                        "button",
                        {
                          type: "button",
                          className: "cedros-rewards-panel__page-btn",
                          onClick: () => _(m - 1),
                          disabled: m === 0 || l,
                          "aria-label": "Previous page",
                          children: "Previous"
                        }
                      ),
                      /* @__PURE__ */ i("span", { className: "cedros-rewards-panel__page-info", children: [
                        m + 1,
                        " / ",
                        T
                      ] }),
                      /* @__PURE__ */ t(
                        "button",
                        {
                          type: "button",
                          className: "cedros-rewards-panel__page-btn",
                          onClick: () => _(m + 1),
                          disabled: m >= T - 1 || l,
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
function fn(e) {
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
function pn(e) {
  return e.expiresAt && new Date(e.expiresAt) < /* @__PURE__ */ new Date() ? "expired" : e.maxUses !== null && e.currentUses >= e.maxUses ? "used" : "active";
}
function ch({ status: e }) {
  return /* @__PURE__ */ t("span", { className: `cedros-invite-panel__badge ${{
    active: "cedros-invite-panel__badge--active",
    used: "cedros-invite-panel__badge--used",
    expired: "cedros-invite-panel__badge--expired"
  }[e] ?? ""}`, children: e.charAt(0).toUpperCase() + e.slice(1) });
}
function lh({ text: e }) {
  const [r, s] = k(!1), o = B(async () => {
    try {
      await navigator.clipboard.writeText(e), s(!0), setTimeout(() => s(!1), 2e3);
    } catch {
    }
  }, [e]);
  return /* @__PURE__ */ t(
    "button",
    {
      type: "button",
      className: "cedros-invite-panel__copy-btn",
      onClick: o,
      "aria-label": r ? "Copied" : `Copy code ${e}`,
      title: r ? "Copied!" : "Copy to clipboard",
      children: r ? "✓" : "Copy"
    }
  );
}
function ym({ className: e }) {
  const { codes: r, total: s, generateCode: o, fetchCodes: n, isLoading: a, error: c } = th(), [d, l] = k(!1), [h, m] = k(null);
  O(() => {
    n().catch(() => {
    });
  }, [n]);
  const u = B(async () => {
    l(!0), m(null);
    try {
      await o();
    } catch (g) {
      m(g instanceof Error ? g.message : "Failed to generate invite code.");
    } finally {
      l(!1);
    }
  }, [o]), p = r.filter((g) => pn(g) === "active").length;
  return /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-invite-panel ${e ?? ""}`.trim(),
      "aria-label": "Invite code panel",
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-invite-panel__header", children: [
          /* @__PURE__ */ t("h2", { className: "cedros-invite-panel__title", children: "Invite Codes" }),
          /* @__PURE__ */ i("span", { className: "cedros-invite-panel__budget", "aria-live": "polite", children: [
            p,
            " active · ",
            s,
            " total"
          ] })
        ] }),
        c && /* @__PURE__ */ t("div", { className: "cedros-invite-panel__error", role: "alert", children: c.message }),
        h && /* @__PURE__ */ t("div", { className: "cedros-invite-panel__error", role: "alert", children: h }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: u,
            disabled: d || a,
            "aria-busy": d,
            children: d ? "Generating..." : "Generate Invite Code"
          }
        ),
        /* @__PURE__ */ t("section", { className: "cedros-invite-panel__list-section", "aria-label": "Your invite codes", children: a && r.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-invite-panel__loading", "aria-busy": "true", children: "Loading..." }) : r.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-invite-panel__empty", children: "No invite codes yet. Generate one above." }) : /* @__PURE__ */ t(
          "div",
          {
            className: "cedros-invite-panel__table-wrapper",
            role: "region",
            "aria-label": "Invite codes table",
            tabIndex: 0,
            children: /* @__PURE__ */ i("table", { className: "cedros-invite-panel__table", children: [
              /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ i("tr", { children: [
                /* @__PURE__ */ t("th", { scope: "col", className: "cedros-invite-panel__th", children: "Code" }),
                /* @__PURE__ */ t("th", { scope: "col", className: "cedros-invite-panel__th", children: "Uses" }),
                /* @__PURE__ */ t("th", { scope: "col", className: "cedros-invite-panel__th", children: "Created" }),
                /* @__PURE__ */ t("th", { scope: "col", className: "cedros-invite-panel__th", children: "Expires" }),
                /* @__PURE__ */ t("th", { scope: "col", className: "cedros-invite-panel__th", children: "Status" }),
                /* @__PURE__ */ t("th", { scope: "col", className: "cedros-invite-panel__th", children: /* @__PURE__ */ t("span", { className: "cedros-sr-only", children: "Actions" }) })
              ] }) }),
              /* @__PURE__ */ t("tbody", { children: r.map((g) => {
                const w = pn(g), b = g.maxUses !== null ? `${g.currentUses} / ${g.maxUses}` : `${g.currentUses}`;
                return /* @__PURE__ */ i("tr", { className: "cedros-invite-panel__tr", children: [
                  /* @__PURE__ */ t("td", { className: "cedros-invite-panel__td cedros-invite-panel__td--code", children: /* @__PURE__ */ t("code", { className: "cedros-invite-panel__code", children: g.code }) }),
                  /* @__PURE__ */ t("td", { className: "cedros-invite-panel__td", children: b }),
                  /* @__PURE__ */ t("td", { className: "cedros-invite-panel__td", children: fn(g.createdAt) }),
                  /* @__PURE__ */ t("td", { className: "cedros-invite-panel__td", children: g.expiresAt ? fn(g.expiresAt) : "—" }),
                  /* @__PURE__ */ t("td", { className: "cedros-invite-panel__td", children: /* @__PURE__ */ t(ch, { status: w }) }),
                  /* @__PURE__ */ t("td", { className: "cedros-invite-panel__td", children: /* @__PURE__ */ t(lh, { text: g.code }) })
                ] }, g.id);
              }) })
            ] })
          }
        ) })
      ]
    }
  );
}
function vm({
  status: e,
  startVerification: r,
  className: s
}) {
  const [o, n] = k(!1), [a, c] = k(null), d = B(async () => {
    n(!0), c(null);
    try {
      const m = await r();
      m && (window.location.href = m);
    } catch (m) {
      c(
        m instanceof Error ? m.message : "Failed to start verification"
      );
    } finally {
      n(!1);
    }
  }, [r]);
  if (e === "verified")
    return null;
  let l;
  switch (e) {
    case "pending":
      l = "Your identity verification is being processed.";
      break;
    case "failed":
      l = "Identity verification failed. Please try again.";
      break;
    case "expired":
      l = "Your identity verification has expired. Please verify again.";
      break;
    case "canceled":
      l = "Verification was canceled. Please try again.";
      break;
    default:
      l = "Identity verification is required to continue.";
      break;
  }
  const h = e !== "pending";
  return /* @__PURE__ */ i(
    "div",
    {
      className: `cedros-kyc-banner ${s ?? ""}`,
      role: "alert",
      children: [
        /* @__PURE__ */ i("div", { className: "cedros-kyc-banner-content", children: [
          /* @__PURE__ */ t("span", { className: "cedros-kyc-banner-message", children: l }),
          h && /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-kyc-banner-button",
              onClick: d,
              disabled: o,
              children: o ? "Starting..." : "Verify Identity"
            }
          )
        ] }),
        a && /* @__PURE__ */ t("div", { className: "cedros-kyc-banner-error", children: a })
      ]
    }
  );
}
const dh = 3e3, uh = 6e4;
function hh(e) {
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
function Am({ fetchStatus: e, onComplete: r, className: s }) {
  const [o, n] = k(null), [a, c] = k(!1), d = J(r), l = J(e);
  O(() => {
    d.current = r, l.current = e;
  }, [r, e]), O(() => {
    let m = !1, u = null;
    const p = setTimeout(() => {
      c(!0), u !== null && clearInterval(u);
    }, uh), g = async () => {
      try {
        const w = await l.current();
        if (m) return;
        n(w.status), w.status !== "pending" && (clearTimeout(p), u !== null && clearInterval(u), d.current?.(w.status));
      } catch {
      }
    };
    return g(), u = setInterval(g, dh), () => {
      m = !0, clearTimeout(p), u !== null && clearInterval(u);
    };
  }, []);
  const h = !o || o === "pending";
  return /* @__PURE__ */ t("div", { className: `cedros-kyc-callback ${s ?? ""}`, role: "status", "aria-live": "polite", children: a && h ? /* @__PURE__ */ i("div", { className: "cedros-kyc-callback-content", children: [
    /* @__PURE__ */ t("p", { className: "cedros-kyc-callback-message", children: "Verification is taking longer than expected. Please refresh or check back later." }),
    r && /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-kyc-callback-continue",
        onClick: () => r("pending"),
        children: "Continue"
      }
    )
  ] }) : h ? /* @__PURE__ */ i("div", { className: "cedros-kyc-callback-content", children: [
    /* @__PURE__ */ t("span", { className: "cedros-kyc-callback-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ t("p", { className: "cedros-kyc-callback-message", children: "Processing your verification..." })
  ] }) : /* @__PURE__ */ i("div", { className: "cedros-kyc-callback-content", children: [
    /* @__PURE__ */ t(
      "p",
      {
        className: `cedros-kyc-callback-message cedros-kyc-callback-message--${o}`,
        children: hh(o)
      }
    ),
    r && /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-kyc-callback-continue",
        onClick: () => r(o),
        children: "Continue"
      }
    )
  ] }) });
}
function mh() {
  const { config: e, _internal: r } = re(), [s, o] = k(!1), [n, a] = k(null), [c, d] = k(null), [l, h] = k(null), [m, u] = k(null), [p, g] = k(null), w = p !== null && p !== "none", b = q(
    () => new oe({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), x = B(async () => {
    o(!0), a(null);
    try {
      const _ = await b.get("/accreditation/status", {
        credentials: "include"
      });
      return d(_.status), h(_.verifiedAt ?? null), u(_.expiresAt ?? null), g(_.enforcementMode), _;
    } catch (_) {
      const T = _ instanceof Error ? _ : new Error(String(_));
      throw a(T), T;
    } finally {
      o(!1);
    }
  }, [b]), E = B(
    async (_, T) => {
      o(!0), a(null);
      try {
        const f = await b.post(
          "/accreditation/submit",
          { method: _, ...T },
          { credentials: "include" }
        );
        return d("pending"), f;
      } catch (f) {
        const v = f instanceof Error ? f : new Error(String(f));
        throw a(v), v;
      } finally {
        o(!1);
      }
    },
    [b]
  ), N = B(
    async (_, T, f) => {
      o(!0), a(null);
      try {
        const v = new FormData();
        v.append("submissionId", _), v.append("documentType", f), v.append("file", T);
        const y = r?.getAccessToken?.(), A = {};
        y && (A.Authorization = `Bearer ${y}`);
        const L = await fetch(`${e.serverUrl}/accreditation/upload`, {
          method: "POST",
          headers: A,
          credentials: "include",
          body: v
        });
        if (!L.ok) {
          const S = await L.text().catch(() => L.statusText);
          throw new Error(`Upload failed (${L.status}): ${S}`);
        }
        return L.json();
      } catch (v) {
        const y = v instanceof Error ? v : new Error(String(v));
        throw a(y), y;
      } finally {
        o(!1);
      }
    },
    [e.serverUrl, r]
  ), C = B(async () => {
    o(!0), a(null);
    try {
      return (await b.get(
        "/accreditation/submissions",
        { credentials: "include" }
      )).submissions;
    } catch (_) {
      const T = _ instanceof Error ? _ : new Error(String(_));
      throw a(T), T;
    } finally {
      o(!1);
    }
  }, [b]);
  return {
    status: c,
    verifiedAt: l,
    expiresAt: m,
    isRequired: w,
    enforcementMode: p,
    fetchStatus: x,
    submitVerification: E,
    uploadDocument: N,
    listSubmissions: C,
    isLoading: s,
    error: n
  };
}
const gn = [
  { method: "income", label: "Income", description: "Verify via annual income ($200K+ individual / $300K+ joint)" },
  { method: "net_worth", label: "Net Worth", description: "Verify via net worth ($1M+ excluding primary residence)" },
  { method: "credential", label: "Professional Credential", description: "Verify via FINRA license (Series 7, 65, or 82)" },
  { method: "third_party_letter", label: "Third-Party Letter", description: "Upload a verification letter from a CPA, attorney, or RIA" },
  { method: "insider", label: "Insider / Officer", description: "Self-certify as a director, executive officer, or general partner" },
  { method: "investment_threshold", label: "Investment Threshold", description: "Qualify via investment commitment ($200K+ individual / $1M+ entity)" }
];
function gt({ label: e, acceptedTypes: r = ".pdf,.jpg,.jpeg,.png,.tiff", documentType: s, files: o, onFilesChange: n, maxFiles: a = 5 }) {
  const c = J(null), [d, l] = k(!1), h = B((u) => {
    if (!u) return;
    const p = Array.from(u), g = [...o, ...p].slice(0, a);
    n(g);
  }, [o, a, n]), m = (u) => {
    n(o.filter((p, g) => g !== u));
  };
  return /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__upload-zone", children: [
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__upload-label", children: e }),
    /* @__PURE__ */ i(
      "div",
      {
        className: `cedros-accreditation-wizard__drop-area${d ? " cedros-accreditation-wizard__drop-area--active" : ""}`,
        role: "button",
        tabIndex: 0,
        "aria-label": `Upload files: ${e}`,
        onClick: () => c.current?.click(),
        onKeyDown: (u) => {
          (u.key === "Enter" || u.key === " ") && c.current?.click();
        },
        onDragOver: (u) => {
          u.preventDefault(), l(!0);
        },
        onDragLeave: () => l(!1),
        onDrop: (u) => {
          u.preventDefault(), l(!1), h(u.dataTransfer.files);
        },
        children: [
          /* @__PURE__ */ t("span", { children: "Click or drag files here" }),
          /* @__PURE__ */ t("span", { className: "cedros-accreditation-wizard__upload-hint", children: r })
        ]
      }
    ),
    /* @__PURE__ */ t(
      "input",
      {
        ref: c,
        type: "file",
        accept: r,
        multiple: a > 1,
        style: { display: "none" },
        onChange: (u) => h(u.target.files),
        "aria-hidden": "true"
      }
    ),
    o.length > 0 && /* @__PURE__ */ t("ul", { className: "cedros-accreditation-wizard__file-list", "aria-label": "Uploaded files", children: o.map((u, p) => /* @__PURE__ */ i("li", { className: "cedros-accreditation-wizard__file-item", children: [
      /* @__PURE__ */ t("span", { children: u.name }),
      /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__file-remove", onClick: () => m(p), "aria-label": `Remove ${u.name}`, children: "Remove" })
    ] }, `${u.name}-${p}`)) })
  ] });
}
function fh(e, r, s, o) {
  r({ ...e, [s]: o });
}
function wt(e, r) {
  return e.filter((s) => s.documentType === r).map((s) => s.file);
}
function bt(e, r, s, o) {
  const n = e.filter((a) => a.documentType !== r);
  o([...n, ...s.map((a) => ({ file: a, documentType: r }))]);
}
function ph({ method: e, formData: r, onFormDataChange: s, fileEntries: o, onFileEntriesChange: n }) {
  const a = (c, d) => fh(r, s, c, d);
  return e === "income" ? /* @__PURE__ */ i("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Income Details" }),
    /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", children: "Income type" }),
      /* @__PURE__ */ i("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ t("input", { type: "radio", name: "incomeType", value: "individual", checked: r.incomeType === "individual", onChange: () => a("incomeType", "individual") }),
        " ",
        "Individual ($200K+)"
      ] }),
      /* @__PURE__ */ i("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ t("input", { type: "radio", name: "incomeType", value: "joint", checked: r.incomeType === "joint", onChange: () => a("incomeType", "joint") }),
        " ",
        "Joint with spouse ($300K+)"
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "statedAmount", children: "Stated annual income (USD)" }),
      /* @__PURE__ */ t("input", { id: "statedAmount", type: "number", min: 0, className: "cedros-accreditation-wizard__input", value: r.statedAmountUsd ?? "", onChange: (c) => a("statedAmountUsd", c.target.valueAsNumber) })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "userStatement", children: "Statement about current year income expectation" }),
      /* @__PURE__ */ t("textarea", { id: "userStatement", className: "cedros-accreditation-wizard__textarea", rows: 3, value: r.userStatement ?? "", onChange: (c) => a("userStatement", c.target.value) })
    ] }),
    /* @__PURE__ */ t(gt, { label: "Upload tax documents (W-2, 1040, 1099, K-1) from the last 2 years", documentType: "tax_return", files: wt(o, "tax_return"), onFilesChange: (c) => bt(o, "tax_return", c, n) })
  ] }) : e === "net_worth" ? /* @__PURE__ */ i("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Net Worth Details" }),
    /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "netWorthAmount", children: "Stated net worth (USD, excluding primary residence)" }),
      /* @__PURE__ */ t("input", { id: "netWorthAmount", type: "number", min: 0, className: "cedros-accreditation-wizard__input", value: r.statedAmountUsd ?? "", onChange: (c) => a("statedAmountUsd", c.target.valueAsNumber) })
    ] }),
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__note", children: "Documents must be dated within the last 90 days." }),
    /* @__PURE__ */ t(gt, { label: "Upload asset documents (bank/brokerage statements, property appraisals)", documentType: "asset_statement", files: wt(o, "asset_statement"), onFilesChange: (c) => bt(o, "asset_statement", c, n) }),
    /* @__PURE__ */ t(gt, { label: "Upload liability documents (credit report)", documentType: "liability_statement", files: wt(o, "liability_statement"), onFilesChange: (c) => bt(o, "liability_statement", c, n) })
  ] }) : e === "credential" ? /* @__PURE__ */ i("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Professional Credential" }),
    /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "crdNumber", children: "FINRA CRD Number" }),
      /* @__PURE__ */ t("input", { id: "crdNumber", type: "text", className: "cedros-accreditation-wizard__input", value: r.crdNumber ?? "", onChange: (c) => a("crdNumber", c.target.value) })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "licenseType", children: "License type" }),
      /* @__PURE__ */ i("select", { id: "licenseType", className: "cedros-accreditation-wizard__select", value: r.licenseType ?? "", onChange: (c) => a("licenseType", c.target.value), children: [
        /* @__PURE__ */ t("option", { value: "", children: "Select a license" }),
        /* @__PURE__ */ t("option", { value: "series_7", children: "Series 7" }),
        /* @__PURE__ */ t("option", { value: "series_65", children: "Series 65" }),
        /* @__PURE__ */ t("option", { value: "series_82", children: "Series 82" })
      ] })
    ] }),
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__note", children: "Your license will be verified via FINRA BrokerCheck." })
  ] }) : e === "third_party_letter" ? /* @__PURE__ */ i("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Third-Party Letter" }),
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__note", children: "Letter must be dated within the last 90 days." }),
    /* @__PURE__ */ t(gt, { label: "Upload verification letter from a CPA, attorney, RIA, or broker-dealer", documentType: "letter", files: wt(o, "letter"), onFilesChange: (c) => bt(o, "letter", c, n), maxFiles: 1 })
  ] }) : e === "insider" ? /* @__PURE__ */ i("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Insider / Officer" }),
    /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "insiderStatement", children: "Describe your role as director, executive officer, or general partner" }),
      /* @__PURE__ */ t("textarea", { id: "insiderStatement", className: "cedros-accreditation-wizard__textarea", rows: 4, value: r.userStatement ?? "", onChange: (c) => a("userStatement", c.target.value) })
    ] }),
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__note", children: "An administrator will verify your status." })
  ] }) : /* @__PURE__ */ i("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Investment Threshold" }),
    /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", children: "Entity type" }),
      /* @__PURE__ */ i("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ t("input", { type: "radio", name: "entityType", value: "individual", checked: r.entityType === "individual", onChange: () => a("entityType", "individual") }),
        " ",
        "Individual ($200K+)"
      ] }),
      /* @__PURE__ */ i("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ t("input", { type: "radio", name: "entityType", value: "entity", checked: r.entityType === "entity", onChange: () => a("entityType", "entity") }),
        " ",
        "Entity ($1M+)"
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "commitmentAmount", children: "Investment commitment amount (USD)" }),
      /* @__PURE__ */ t("input", { id: "commitmentAmount", type: "number", min: 0, className: "cedros-accreditation-wizard__input", value: r.investmentCommitmentUsd ?? "", onChange: (c) => a("investmentCommitmentUsd", c.target.valueAsNumber) })
    ] }),
    /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "commitmentStatement", children: "Written representation of commitment" }),
      /* @__PURE__ */ t("textarea", { id: "commitmentStatement", className: "cedros-accreditation-wizard__textarea", rows: 3, value: r.userStatement ?? "", onChange: (c) => a("userStatement", c.target.value) })
    ] }),
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__note", children: "Per 2025 SEC guidance, a minimum investment commitment serves as evidence of accredited status." })
  ] });
}
function Nm({ onComplete: e, onCancel: r, className: s }) {
  const { submitVerification: o, uploadDocument: n, isLoading: a, error: c } = mh(), [d, l] = k(1), [h, m] = k(null), [u, p] = k({}), [g, w] = k([]), [b, x] = k(!1), [E, N] = k(null), C = (v) => {
    m(v), l(2);
  }, _ = () => {
    d === 2 ? l(1) : d === 3 ? l(2) : r?.();
  }, T = B(async () => {
    if (h) {
      N(null);
      try {
        const { submissionId: v } = await o(h, u);
        for (const y of g)
          await n(v, y.file, y.documentType);
        x(!0), e?.(v);
      } catch (v) {
        N(v instanceof Error ? v.message : "Submission failed. Please try again.");
      }
    }
  }, [h, u, g, o, n, e]), f = gn.find((v) => v.method === h);
  return b ? /* @__PURE__ */ t("div", { className: `cedros-accreditation-wizard cedros-accreditation-wizard--success ${s ?? ""}`, role: "status", children: /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__success-message", children: "Submitted for review. You will be notified once your accreditation is verified." }) }) : /* @__PURE__ */ i("div", { className: `cedros-accreditation-wizard ${s ?? ""}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-accreditation-wizard__header", children: /* @__PURE__ */ t("nav", { className: "cedros-accreditation-wizard__steps", "aria-label": "Wizard steps", children: ["Choose Method", "Fill Details", "Review & Submit"].map((v, y) => /* @__PURE__ */ i("span", { className: `cedros-accreditation-wizard__step${d === y + 1 ? " cedros-accreditation-wizard__step--active" : ""}`, "aria-current": d === y + 1 ? "step" : void 0, children: [
      y + 1,
      ". ",
      v
    ] }, v)) }) }),
    d === 1 && /* @__PURE__ */ i("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step1-heading", children: [
      /* @__PURE__ */ t("h2", { id: "step1-heading", className: "cedros-accreditation-wizard__section-title", children: "Choose Verification Method" }),
      /* @__PURE__ */ t("div", { className: "cedros-accreditation-wizard__method-grid", role: "list", children: gn.map((v) => /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          role: "listitem",
          className: "cedros-accreditation-wizard__method-card",
          onClick: () => C(v.method),
          children: [
            /* @__PURE__ */ t("span", { className: "cedros-accreditation-wizard__method-title", children: v.label }),
            /* @__PURE__ */ t("span", { className: "cedros-accreditation-wizard__method-desc", children: v.description })
          ]
        },
        v.method
      )) }),
      r && /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__cancel", onClick: r, children: "Cancel" })
    ] }),
    d === 2 && h && /* @__PURE__ */ i("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step2-heading", children: [
      /* @__PURE__ */ t("h2", { id: "step2-heading", className: "cedros-accreditation-wizard__section-title", children: f?.label }),
      /* @__PURE__ */ t(ph, { method: h, formData: u, onFormDataChange: p, fileEntries: g, onFileEntriesChange: w }),
      /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__actions", children: [
        /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__back", onClick: _, children: "Back" }),
        /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__next", onClick: () => l(3), children: "Review" })
      ] })
    ] }),
    d === 3 && h && /* @__PURE__ */ i("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step3-heading", children: [
      /* @__PURE__ */ t("h2", { id: "step3-heading", className: "cedros-accreditation-wizard__section-title", children: "Review & Submit" }),
      /* @__PURE__ */ i("dl", { className: "cedros-accreditation-wizard__review-list", children: [
        /* @__PURE__ */ t("dt", { className: "cedros-accreditation-wizard__review-term", children: "Method" }),
        /* @__PURE__ */ t("dd", { className: "cedros-accreditation-wizard__review-detail", children: f?.label }),
        Object.entries(u).filter(([, v]) => v !== void 0 && v !== "" && v !== null).map(([v, y]) => /* @__PURE__ */ i("div", { children: [
          /* @__PURE__ */ t("dt", { className: "cedros-accreditation-wizard__review-term", children: v }),
          /* @__PURE__ */ t("dd", { className: "cedros-accreditation-wizard__review-detail", children: String(y) })
        ] }, v))
      ] }),
      g.length > 0 && /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__review-files", children: [
        /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__review-files-heading", children: "Documents to upload:" }),
        /* @__PURE__ */ t("ul", { children: g.map((v, y) => /* @__PURE__ */ i("li", { children: [
          v.file.name,
          " ",
          /* @__PURE__ */ i("span", { className: "cedros-accreditation-wizard__doc-type", children: [
            "(",
            v.documentType,
            ")"
          ] })
        ] }, `${v.file.name}-${y}`)) })
      ] }),
      (c || E) && /* @__PURE__ */ t("div", { className: "cedros-accreditation-wizard__error", role: "alert", children: E ?? c?.message }),
      /* @__PURE__ */ i("div", { className: "cedros-accreditation-wizard__actions", children: [
        /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__back", onClick: _, disabled: a, children: "Back" }),
        /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__submit", onClick: T, disabled: a, children: a ? "Submitting..." : "Submit Verification" })
      ] })
    ] })
  ] });
}
function km({
  status: e,
  onStartVerification: r,
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
  return /* @__PURE__ */ t(
    "div",
    {
      className: `cedros-accreditation-banner ${s ?? ""}`,
      role: "alert",
      children: /* @__PURE__ */ i("div", { className: "cedros-accreditation-banner__content", children: [
        /* @__PURE__ */ t("span", { className: "cedros-accreditation-banner__message", children: o }),
        n && r && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-accreditation-banner__button",
            onClick: r,
            children: e === "rejected" || e === "expired" ? "Resubmit Verification" : "Start Verification"
          }
        )
      ] })
    }
  );
}
const ss = ra(null), Dr = {
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
function gh(e, r) {
  return Do(e, r);
}
function Do(e, r) {
  const s = { ...e };
  for (const o in r)
    if (Object.prototype.hasOwnProperty.call(r, o)) {
      const n = e[o], a = r[o];
      typeof n == "object" && n !== null && typeof a == "object" && a !== null ? s[o] = Do(
        n,
        a
      ) : a !== void 0 && (s[o] = a);
    }
  return s;
}
function Cm({
  children: e,
  locale: r = "en",
  translations: s
}) {
  const o = q(() => ({ t: s ? gh(Dr, s) : Dr, locale: r }), [s, r]);
  return /* @__PURE__ */ t(ss.Provider, { value: o, children: e });
}
function Em() {
  return xn(ss)?.t ?? Dr;
}
function xm() {
  return xn(ss)?.locale ?? "en";
}
export {
  em as AccountSettings,
  km as AccreditationBanner,
  Nm as AccreditationWizard,
  Yl as AdminAccessCodes,
  dd as AdminAccreditationQueue,
  ya as AdminDepositList,
  ba as AdminDepositStats,
  Aa as AdminPrivacyPeriodDeposits,
  Tl as AdminReferralPayouts,
  md as AdminSanctionsPanel,
  xa as AdminUserList,
  ka as AdminWithdrawalHistory,
  Na as AdminWithdrawalQueue,
  va as AdminWithdrawalStats,
  Qm as AppleLoginButton,
  La as AuthenticationSettings,
  Qh as CapabilityWarning,
  Xh as CedrosAdminDashboard,
  Lm as CedrosLoginProvider,
  sm as ChooseUsernamePrompt,
  rm as CompleteAccountPrompt,
  ql as ComplianceSettings,
  om as CreditBalance,
  Ma as CreditSystemSettings,
  au as DeleteAccountSection,
  nm as DepositFlow,
  nf as EmailLoginForm,
  of as EmailRegisterForm,
  gf as EmailSettings,
  Ta as EmbeddedWalletSettings,
  Pc as ErrorBoundary,
  ne as ErrorMessage,
  Tm as FEATURE_FLAG_ENV_PREFIX,
  Pm as FEATURE_FLAG_REGISTRY,
  Ym as ForgotPasswordForm,
  lm as FullPageLayout,
  uf as GoogleLoginButton,
  am as History,
  Cm as I18nProvider,
  ym as InviteCodePanel,
  ha as InviteForm,
  ma as InviteList,
  vm as KycBanner,
  Am as KycCallback,
  Zd as LinkedAccounts,
  Y as LoadingSpinner,
  $h as LoginButton,
  Kr as LoginForm,
  Vh as LoginModal,
  ua as MemberList,
  tm as MfaSetupPrompt,
  Hh as OrgSelector,
  Gh as OrgSwitcher,
  Sn as OtpInput,
  Km as PasskeyLoginButton,
  ol as PasskeyPrompt,
  ye as PasswordInput,
  Ma as PrivacyCashSettings,
  bd as ProfileDropdown,
  Yd as ProfileTab,
  Qc as RecoveryPhraseDisplay,
  Yc as RecoveryPhraseInput,
  jl as ReferralSettings,
  Zm as ResetPasswordForm,
  bm as RewardsPanel,
  Jr as SUPPORTED_TOKENS,
  Zh as SecuritySettings,
  Ia as ServerSettings,
  qc as SessionList,
  Rt as SettingsPageLayout,
  wd as SetupWizard,
  Vl as SignupSettings,
  Lc as SolanaLoginButton,
  dm as SplitPageLayout,
  Kh as SystemSettings,
  Ro as TieredAmountSlider,
  rd as TokenGateSettings,
  Du as TokenSelector,
  jd as TotpSettings,
  vo as TotpSetup,
  af as TotpVerify,
  Jh as UserProfileSettings,
  yl as WalletAddressRow,
  rl as WalletEnrollment,
  Yh as WalletManager,
  fl as WalletRecovery,
  vl as WalletStatus,
  ll as WalletUnlock,
  bf as WebhookSettings,
  im as WithdrawalFlow,
  cm as WithdrawalHistory,
  Dr as defaultTranslations,
  Bm as getAutoDiscoverableFeatureDefaults,
  Rm as getAutoDiscoverableFeatureFlagNames,
  Mm as getDefaultFeatureFlags,
  Im as getEmbeddedWalletInfo,
  Um as getFeatureFlagDefinition,
  Dm as getFeatureFlagDefinitions,
  Fm as getFeatureFlagEnvVar,
  ts as getTierForAmount,
  Om as isEmbeddedWalletAvailable,
  Wm as isFeatureEnabled,
  gh as mergeTranslations,
  qm as parseFeatureFlagBoolean,
  zm as readFeatureFlagEnv,
  tf as registerMobileWallet,
  jm as resolveFeatureFlags,
  th as useAccessCodes,
  ou as useAccountDeletion,
  mh as useAccreditation,
  vf as useAdminDeposits,
  ff as useAdminUsers,
  Xm as useAppleAuth,
  Bt as useAuth,
  Vm as useAuthState,
  Hm as useAuthUI,
  um as useAuthorize,
  re as useCedrosLogin,
  gm as useCedrosTheme,
  Ao as useCredentials,
  Io as useCredits,
  hu as useDeposit,
  cf as useEmailAuth,
  hf as useGoogleAuth,
  Jm as useInstantLink,
  da as useInvites,
  wm as useKyc,
  xm as useLocale,
  la as useMembers,
  _a as useOrgs,
  nl as usePasskeySigning,
  aa as usePasswordReset,
  mm as usePendingRecovery,
  pm as usePostLogin,
  It as useProfile,
  Vd as useReferral,
  rh as useRewards,
  sa as useServerFeatures,
  cu as useSessions,
  el as useSetPassword,
  fo as useSetup,
  rf as useSolanaAuth,
  Ln as useSystemSettings,
  yo as useTotp,
  lf as useTotpVerify,
  fm as useTransactionSigning,
  Em as useTranslations,
  uu as useUsername,
  Pt as useWallet,
  Jc as useWalletEnrollment,
  Ke as useWalletMaterial,
  ml as useWalletRecovery,
  sl as useWalletSigning,
  hm as useWallets,
  ia as useWebAuthn,
  Uo as useWithdrawal,
  qr as validatePassword
};
