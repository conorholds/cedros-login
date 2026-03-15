import { D as ot, v as Vo, a as Ho, w as ln, t as Oe, b as dn, c as un, u as St, g as $o, d as Go, e as Ye, f as Qo, h as hn, i as fn, j as Se, k as mn, l as pn, m as Ir, n as gn, o as Ko, p as wn, q as Lt } from "./useAuth-C-Vw-ggy.js";
import { C as Lh, r as Bh, s as Ph } from "./useAuth-C-Vw-ggy.js";
import { u as ne, A as ce, h as j, a as We } from "./useCedrosLogin-CFfID-0i.js";
import { b as Th, c as Ih } from "./useCedrosLogin-CFfID-0i.js";
import { jsx as r, jsxs as d, Fragment as X } from "react/jsx-runtime";
import { useState as L, useRef as J, useMemo as V, useEffect as W, useCallback as T, useId as yn, Fragment as Yo, Component as Zo, createContext as Xo, useContext as bn } from "react";
import { L as $ } from "./LoadingSpinner-6vml-zwr.js";
import { a as An, s as Jo } from "./sanitization-CQ-H1MSg.js";
import { b as vn, E as ea, a as ta, P as ge, O as kn } from "./EmailRegisterForm-CMXsa-_r.js";
import { T as _h, u as Dh, c as Uh } from "./EmailRegisterForm-CMXsa-_r.js";
import { b as Nn, v as Bt } from "./validation-B8kMV3BL.js";
import { E as se } from "./ErrorMessage-CcEK0pYO.js";
import { G as ra } from "./GoogleLoginButton-qf4A_A3G.js";
import { u as Oh } from "./GoogleLoginButton-qf4A_A3G.js";
import { d as ns, S as sa } from "./SolanaLoginButton-B04dib6X.js";
import { r as qh, u as jh } from "./SolanaLoginButton-B04dib6X.js";
import { c as na, d as oa, u as aa, a as ia, M as ca, I as la, b as da, P as ua } from "./PermissionsSection-BeFhIgQy.js";
import { u as ha } from "./useSystemSettings-rgskaDqP.js";
import { C as fa, S as Mr, a as ma, u as En, A as Cn } from "./AutosaveStatus-DMjvXzP2.js";
import { u as pa, O as ga } from "./useOrgs-C90KT9KP.js";
import { A as wa, a as ya } from "./AdminDepositList-BUm_ZcAW.js";
import { A as ba, a as Aa, b as va, c as ka } from "./AdminWithdrawalHistory-C76bkbjX.js";
import { u as Na, A as Ea, a as Ca } from "./useUsersStatsSummary-5DJwzntC.js";
import { b as Vh } from "./useUsersStatsSummary-5DJwzntC.js";
import { S as xn } from "./StatsBar-BX-hHtTq.js";
import { P as xa } from "./plugin-BiftIhZe.js";
import { I as $h, A as Gh, C as Qh, c as Kh, c as Yh, u as Zh } from "./plugin-BiftIhZe.js";
import { A as Sa } from "./AuthenticationSettings-CSoFp-_2.js";
import { E as La } from "./EmbeddedWalletSettings-CUY_X7Vj.js";
import { A as Ba, S as Pa, P as Ra } from "./EmailSettings-ASDHfI0K.js";
import { E as Jh } from "./EmailSettings-ASDHfI0K.js";
import { C as Ta } from "./CreditSystemSettings-Du3ac0ID.js";
import { S as Ia } from "./ServerSettings-BLoWX7KG.js";
import { u as tf } from "./useAdminDeposits-C76B2Q_8.js";
import { S as Ma } from "./WebhookSettings-C-7Yxueu.js";
import { W as sf } from "./WebhookSettings-C-7Yxueu.js";
let Ue = null, _a = 0;
const nt = /* @__PURE__ */ new Map();
function Da() {
  return typeof Worker > "u" ? null : (Ue || (Ue = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/argon2Worker-Bi5TuQvD.js", import.meta.url).href,
    import.meta.url
  ), {
    type: "module"
  }), Ue.onmessage = (e) => {
    const { id: t, key: s, error: o } = e.data, n = nt.get(t);
    if (n) {
      if (nt.delete(t), o) {
        n.reject(new Error(o));
        return;
      }
      if (!s) {
        n.reject(new Error("Argon2 worker returned no key"));
        return;
      }
      n.resolve(s);
    }
  }, Ue.onerror = (e) => {
    const t = e instanceof ErrorEvent ? e.error : new Error("Argon2 worker error");
    for (const s of nt.values())
      s.reject(t instanceof Error ? t : new Error(String(t)));
    nt.clear(), Ue?.terminate(), Ue = null;
  }), Ue);
}
async function Sn(e, t, s = ot) {
  Vo(s);
  const o = Da();
  return o ? new Promise((n, a) => {
    const l = _a++;
    nt.set(l, { resolve: n, reject: a });
    const i = {
      id: l,
      password: e,
      salt: t,
      params: s
    };
    o.postMessage(i);
  }) : Ho(e, t, s);
}
function Ln(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Ua(e) {
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
var pt = { exports: {} };
const Fa = globalThis.crypto, Oa = globalThis.crypto, Wa = globalThis.crypto.subtle, qa = globalThis.crypto.getRandomValues.bind(globalThis.crypto), ja = globalThis.crypto.randomUUID.bind(globalThis.crypto), za = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Fa,
  getRandomValues: qa,
  randomUUID: ja,
  subtle: Wa,
  webcrypto: Oa
}, Symbol.toStringTag, { value: "Module" })), Va = /* @__PURE__ */ Ua(za);
var Ha = pt.exports, os;
function $a() {
  return os || (os = 1, (function(e, t) {
    (function(s, o) {
      e.exports = o(Va);
    })(Ha, function(s) {
      var o, n, a, l, i;
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
        }, n = {}, a = new Array(1024).join("0"), l = !0, i = [
          "nodeCryptoRandomBytes",
          "browserCryptoGetRandomValues",
          "testRandom"
        ];
      }
      function u() {
        return !!(n && n.rng && typeof n.rng == "function");
      }
      function f(g, k) {
        var v;
        if (k === 0 || k === 1)
          return g;
        if (k && k > 1024)
          throw new Error(
            "Padding must be multiples of no larger than 1024 bits."
          );
        return k = k || n.bits, g && (v = g.length % k), v ? (a + g).slice(
          -(k - v + g.length)
        ) : g;
      }
      function h(g) {
        var k = "", v, b;
        for (b = g.length - 1; b >= 0; b--) {
          if (v = parseInt(g[b], 16), isNaN(v))
            throw new Error("Invalid hex character.");
          k = f(v.toString(2), 4) + k;
        }
        return k;
      }
      function m(g) {
        var k = "", v, b;
        for (g = f(g, 4), b = g.length; b >= 4; b -= 4) {
          if (v = parseInt(g.slice(b - 4, b), 2), isNaN(v))
            throw new Error("Invalid binary character.");
          k = v.toString(16) + k;
        }
        return k;
      }
      function y() {
        return !!(s && typeof s == "object" && (typeof s.getRandomValues == "function" || typeof s.getRandomValues == "object") && (typeof Uint32Array == "function" || typeof Uint32Array == "object"));
      }
      function w() {
        return typeof s == "object" && typeof s.randomBytes == "function";
      }
      function p(g) {
        function k(S, I, B, M) {
          var _ = 0, O, F = "", H;
          for (I && (O = I.length - 1); _ < O || F.length < S; )
            H = Math.abs(parseInt(I[_], B)), F = F + f(H.toString(2), M), _++;
          return F = F.substr(-S), (F.match(/0/g) || []).length === F.length ? null : F;
        }
        function v(S) {
          var I, B, M, _, O = null;
          for (M = 16, _ = 4, B = Math.ceil(S / 8); O === null; )
            I = s.randomBytes(B), O = k(S, I.toString("hex"), M, _);
          return O;
        }
        function b(S) {
          var I, B, M, _ = null;
          for (B = 10, M = 32, I = Math.ceil(S / 32); _ === null; )
            _ = k(
              S,
              s.getRandomValues(new Uint32Array(I)),
              B,
              M
            );
          return _;
        }
        function P(S) {
          var I, B, M, _, O, F = null;
          _ = 10, O = 32, B = Math.ceil(S / 32), M = 123456789, I = new Uint32Array(B);
          for (var H = 0; H < I.length; H++)
            I[H] = M;
          for (; F === null; )
            F = k(S, I, _, O);
          return F;
        }
        if (g && g === "testRandom")
          return n.typeCSPRNG = g, P;
        if (g && g === "nodeCryptoRandomBytes")
          return n.typeCSPRNG = g, v;
        if (g && g === "browserCryptoGetRandomValues")
          return n.typeCSPRNG = g, b;
        if (w())
          return n.typeCSPRNG = "nodeCryptoRandomBytes", v;
        if (y())
          return n.typeCSPRNG = "browserCryptoGetRandomValues", b;
      }
      function E(g, k) {
        var v = [], b;
        for (k && (g = f(g, k)), b = g.length; b > n.bits; b -= n.bits)
          v.push(parseInt(g.slice(b - n.bits, b), 2));
        return v.push(parseInt(g.slice(0, b), 2)), v;
      }
      function A(g, k) {
        var v = n.logs[g], b = 0, P;
        for (P = k.length - 1; P >= 0; P--)
          b !== 0 ? b = n.exps[(v + n.logs[b]) % n.maxShares] ^ k[P] : b = k[P];
        return b;
      }
      function C(g, k, v) {
        var b = 0, P, S, I, B;
        for (I = 0, P = k.length; I < P; I++)
          if (v[I]) {
            for (S = n.logs[v[I]], B = 0; B < P; B++)
              if (I !== B) {
                if (g === k[B]) {
                  S = -1;
                  break;
                }
                S = (S + n.logs[g ^ k[B]] - n.logs[k[I] ^ k[B]] + n.maxShares) % n.maxShares;
              }
            b = S === -1 ? b : b ^ n.exps[S];
          }
        return b;
      }
      function N(g, k, v) {
        var b = [], P = [g], S, I;
        for (S = 1; S < v; S++)
          P[S] = parseInt(n.rng(n.bits), 2);
        for (S = 1, I = k + 1; S < I; S++)
          b[S - 1] = {
            x: S,
            y: A(S, P)
          };
        return b;
      }
      function x(g, k, v) {
        var b, P, S, I, B;
        if (k = parseInt(k, n.radix), g = parseInt(g, 10) || n.bits, b = g.toString(36).toUpperCase(), S = Math.pow(2, g) - 1, I = S.toString(n.radix).length, P = f(k.toString(n.radix), I), typeof k != "number" || k % 1 !== 0 || k < 1 || k > S)
          throw new Error(
            "Share id must be an integer between 1 and " + S + ", inclusive."
          );
        return B = b + P + v, B;
      }
      var R = {
        init: function(g, k) {
          var v = [], b = [], P = 1, S, I;
          if (c(), g && (typeof g != "number" || g % 1 !== 0 || g < o.minBits || g > o.maxBits))
            throw new Error(
              "Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (k && i.indexOf(k) === -1)
            throw new Error("Invalid RNG type argument : '" + k + "'");
          for (n.radix = o.radix, n.bits = g || o.bits, n.size = Math.pow(2, n.bits), n.maxShares = n.size - 1, S = o.primitivePolynomials[n.bits], I = 0; I < n.size; I++)
            b[I] = P, v[P] = I, P = P << 1, P >= n.size && (P = P ^ S, P = P & n.maxShares);
          if (n.logs = v, n.exps = b, k && this.setRNG(k), u() || this.setRNG(), !u() || !n.bits || !n.size || !n.maxShares || !n.logs || !n.exps || n.logs.length !== n.size || n.exps.length !== n.size)
            throw new Error("Initialization failed.");
        },
        // Evaluates the Lagrange interpolation polynomial at x=`at` for
        // individual config.bits-length segments of each share in the `shares`
        // Array. Each share is expressed in base `inputRadix`. The output
        // is expressed in base `outputRadix'.
        combine: function(g, k) {
          var v, b, P, S, I = "", B, M, _, O = [], F = [];
          for (k = k || 0, v = 0, P = g.length; v < P; v++) {
            if (M = this.extractShareComponents(g[v]), B === void 0)
              B = M.bits;
            else if (M.bits !== B)
              throw new Error(
                "Mismatched shares: Different bit settings."
              );
            if (n.bits !== B && this.init(B), O.indexOf(M.id) === -1)
              for (O.push(M.id), _ = E(h(M.data)), b = 0, S = _.length; b < S; b++)
                F[b] = F[b] || [], F[b][O.length - 1] = _[b];
          }
          for (v = 0, P = F.length; v < P; v++)
            I = f(C(k, O, F[v]).toString(2)) + I;
          return m(
            k >= 1 ? I : I.slice(I.indexOf("1") + 1)
          );
        },
        getConfig: function() {
          var g = {};
          return g.radix = n.radix, g.bits = n.bits, g.maxShares = n.maxShares, g.hasCSPRNG = u(), g.typeCSPRNG = n.typeCSPRNG, g;
        },
        // Given a public share, extract the bits (Integer), share ID (Integer), and share data (Hex)
        // and return an Object containing those components.
        extractShareComponents: function(g) {
          var k, v, b, P, S = {}, I, B;
          if (k = parseInt(g.substr(0, 1), 36), k && (typeof k != "number" || k % 1 !== 0 || k < o.minBits || k > o.maxBits))
            throw new Error(
              "Invalid share : Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (P = Math.pow(2, k) - 1, b = (Math.pow(2, k) - 1).toString(n.radix).length, I = "^([a-kA-K3-9]{1})([a-fA-F0-9]{" + b + "})([a-fA-F0-9]+)$", B = new RegExp(I).exec(g), B && (v = parseInt(B[2], n.radix)), typeof v != "number" || v % 1 !== 0 || v < 1 || v > P)
            throw new Error(
              "Invalid share : Share id must be an integer between 1 and " + n.maxShares + ", inclusive."
            );
          if (B && B[3])
            return S.bits = k, S.id = v, S.data = B[3], S;
          throw new Error("The share data provided is invalid : " + g);
        },
        // Set the PRNG to use. If no RNG function is supplied, pick a default using getRNG()
        setRNG: function(g) {
          var k = "Random number generator is invalid ", v = " Supply an CSPRNG of the form function(bits){} that returns a string containing 'bits' number of random 1's and 0's.";
          if (g && typeof g == "string" && i.indexOf(g) === -1)
            throw new Error("Invalid RNG type argument : '" + g + "'");
          if (g || (g = p()), g && typeof g == "string" && (g = p(g)), l) {
            if (g && typeof g != "function")
              throw new Error(k + "(Not a function)." + v);
            if (g && typeof g(n.bits) != "string")
              throw new Error(
                k + "(Output is not a string)." + v
              );
            if (g && !parseInt(g(n.bits), 2))
              throw new Error(
                k + "(Binary string output not parseable to an Integer)." + v
              );
            if (g && g(n.bits).length > n.bits)
              throw new Error(
                k + "(Output length is greater than config.bits)." + v
              );
            if (g && g(n.bits).length < n.bits)
              throw new Error(
                k + "(Output length is less than config.bits)." + v
              );
          }
          return n.rng = g, !0;
        },
        // Converts a given UTF16 character string to the HEX representation.
        // Each character of the input string is represented by
        // `bytesPerChar` bytes in the output string which defaults to 2.
        str2hex: function(g, k) {
          var v, b, P = "", S, I, B, M;
          if (typeof g != "string")
            throw new Error("Input must be a character string.");
          if (k || (k = o.bytesPerChar), typeof k != "number" || k < 1 || k > o.maxBytesPerChar || k % 1 !== 0)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (v = 2 * k, b = Math.pow(16, v) - 1, B = 0, M = g.length; B < M; B++) {
            if (I = g[B].charCodeAt(), isNaN(I))
              throw new Error("Invalid character: " + g[B]);
            if (I > b)
              throw S = Math.ceil(Math.log(I + 1) / Math.log(256)), new Error(
                "Invalid character code (" + I + "). Maximum allowable is 256^bytes-1 (" + b + "). To convert this character, use at least " + S + " bytes."
              );
            P = f(I.toString(16), v) + P;
          }
          return P;
        },
        // Converts a given HEX number string to a UTF16 character string.
        hex2str: function(g, k) {
          var v, b = "", P, S;
          if (typeof g != "string")
            throw new Error("Input must be a hexadecimal string.");
          if (k = k || o.bytesPerChar, typeof k != "number" || k % 1 !== 0 || k < 1 || k > o.maxBytesPerChar)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (v = 2 * k, g = f(g, v), P = 0, S = g.length; P < S; P += v)
            b = String.fromCharCode(
              parseInt(g.slice(P, P + v), 16)
            ) + b;
          return b;
        },
        // Generates a random bits-length number string using the PRNG
        random: function(g) {
          if (typeof g != "number" || g % 1 !== 0 || g < 2 || g > 65536)
            throw new Error(
              "Number of bits must be an Integer between 1 and 65536."
            );
          return m(n.rng(g));
        },
        // Divides a `secret` number String str expressed in radix `inputRadix` (optional, default 16)
        // into `numShares` shares, each expressed in radix `outputRadix` (optional, default to `inputRadix`),
        // requiring `threshold` number of shares to reconstruct the secret.
        // Optionally, zero-pads the secret to a length that is a multiple of padLength before sharing.
        share: function(g, k, v, b) {
          var P, S, I = new Array(k), B = new Array(k), M, _, O;
          if (b = b || 128, typeof g != "string")
            throw new Error("Secret must be a string.");
          if (typeof k != "number" || k % 1 !== 0 || k < 2)
            throw new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive."
            );
          if (k > n.maxShares)
            throw P = Math.ceil(Math.log(k + 1) / Math.LN2), new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive. To create " + k + " shares, use at least " + P + " bits."
            );
          if (typeof v != "number" || v % 1 !== 0 || v < 2)
            throw new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive."
            );
          if (v > n.maxShares)
            throw P = Math.ceil(Math.log(v + 1) / Math.LN2), new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive.  To use a threshold of " + v + ", use at least " + P + " bits."
            );
          if (v > k)
            throw new Error(
              "Threshold number of shares was " + v + " but must be less than or equal to the " + k + " shares specified as the total to generate."
            );
          if (typeof b != "number" || b % 1 !== 0 || b < 0 || b > 1024)
            throw new Error(
              "Zero-pad length must be an integer between 0 and 1024 inclusive."
            );
          for (g = "1" + h(g), g = E(g, b), M = 0, O = g.length; M < O; M++)
            for (S = N(g[M], k, v), _ = 0; _ < k; _++)
              I[_] = I[_] || S[_].x.toString(n.radix), B[_] = f(S[_].y.toString(2)) + (B[_] || "");
          for (M = 0; M < k; M++)
            I[M] = x(
              n.bits,
              I[M],
              m(B[M])
            );
          return I;
        },
        // Generate a new share with id `id` (a number between 1 and 2^bits-1)
        // `id` can be a Number or a String in the default radix (16)
        newShare: function(g, k) {
          var v, b;
          if (g && typeof g == "string" && (g = parseInt(g, n.radix)), b = g.toString(n.radix), g && b && k && k[0])
            return v = this.extractShareComponents(k[0]), x(
              v.bits,
              b,
              this.combine(k, g)
            );
          throw new Error(
            "Invalid 'id' or 'shares' Array argument to newShare()."
          );
        },
        /* test-code */
        // export private functions so they can be unit tested directly.
        _reset: c,
        _padLeft: f,
        _hex2bin: h,
        _bin2hex: m,
        _hasCryptoGetRandomValues: y,
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
var Ga = $a();
const Bn = /* @__PURE__ */ Ln(Ga);
function Pn(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function _r(e, t = "") {
  if (!Number.isSafeInteger(e) || e < 0) {
    const s = t && `"${t}" `;
    throw new Error(`${s}expected integer >= 0, got ${e}`);
  }
}
function ie(e, t, s = "") {
  const o = Pn(e), n = e?.length, a = t !== void 0;
  if (!o || a && n !== t) {
    const l = s && `"${s}" `, i = a ? ` of length ${t}` : "", c = o ? `length=${n}` : `type=${typeof e}`;
    throw new Error(l + "expected Uint8Array" + i + ", got " + c);
  }
  return e;
}
function as(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function Qa(e, t) {
  ie(e, void 0, "digestInto() output");
  const s = t.outputLen;
  if (e.length < s)
    throw new Error('"digestInto() output" expected to be of length >=' + s);
}
function kr(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function Ot(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
const Rn = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", Ka = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function Dr(e) {
  if (ie(e), Rn)
    return e.toHex();
  let t = "";
  for (let s = 0; s < e.length; s++)
    t += Ka[e[s]];
  return t;
}
const Ce = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function is(e) {
  if (e >= Ce._0 && e <= Ce._9)
    return e - Ce._0;
  if (e >= Ce.A && e <= Ce.F)
    return e - (Ce.A - 10);
  if (e >= Ce.a && e <= Ce.f)
    return e - (Ce.a - 10);
}
function Tn(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  if (Rn)
    return Uint8Array.fromHex(e);
  const t = e.length, s = t / 2;
  if (t % 2)
    throw new Error("hex string expected, got unpadded hex of length " + t);
  const o = new Uint8Array(s);
  for (let n = 0, a = 0; n < s; n++, a += 2) {
    const l = is(e.charCodeAt(a)), i = is(e.charCodeAt(a + 1));
    if (l === void 0 || i === void 0) {
      const c = e[a] + e[a + 1];
      throw new Error('hex string expected, got non-hex character "' + c + '" at index ' + a);
    }
    o[n] = l * 16 + i;
  }
  return o;
}
function cs(...e) {
  let t = 0;
  for (let o = 0; o < e.length; o++) {
    const n = e[o];
    ie(n), t += n.length;
  }
  const s = new Uint8Array(t);
  for (let o = 0, n = 0; o < e.length; o++) {
    const a = e[o];
    s.set(a, n), n += a.length;
  }
  return s;
}
function Ya(e, t = {}) {
  const s = (n, a) => e(a).update(n).digest(), o = e(void 0);
  return s.outputLen = o.outputLen, s.blockLen = o.blockLen, s.create = (n) => e(n), Object.assign(s, t), Object.freeze(s);
}
function Za(e = 32) {
  const t = typeof globalThis == "object" ? globalThis.crypto : null;
  if (typeof t?.getRandomValues != "function")
    throw new Error("crypto.getRandomValues must be defined");
  return t.getRandomValues(new Uint8Array(e));
}
const Xa = (e) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, e])
});
let Ja = class {
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
    this.blockLen = t, this.outputLen = s, this.padOffset = o, this.isLE = n, this.buffer = new Uint8Array(t), this.view = Ot(this.buffer);
  }
  update(t) {
    as(this), ie(t);
    const { view: s, buffer: o, blockLen: n } = this, a = t.length;
    for (let l = 0; l < a; ) {
      const i = Math.min(n - this.pos, a - l);
      if (i === n) {
        const c = Ot(t);
        for (; n <= a - l; l += n)
          this.process(c, l);
        continue;
      }
      o.set(t.subarray(l, l + i), this.pos), this.pos += i, l += i, this.pos === n && (this.process(s, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    as(this), Qa(t, this), this.finished = !0;
    const { buffer: s, view: o, blockLen: n, isLE: a } = this;
    let { pos: l } = this;
    s[l++] = 128, kr(this.buffer.subarray(l)), this.padOffset > n - l && (this.process(o, 0), l = 0);
    for (let h = l; h < n; h++)
      s[h] = 0;
    o.setBigUint64(n - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const i = Ot(t), c = this.outputLen;
    if (c % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const u = c / 4, f = this.get();
    if (u > f.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let h = 0; h < u; h++)
      i.setUint32(4 * h, f[h], a);
  }
  digest() {
    const { buffer: t, outputLen: s } = this;
    this.digestInto(t);
    const o = t.slice(0, s);
    return this.destroy(), o;
  }
  _cloneInto(t) {
    t ||= new this.constructor(), t.set(...this.get());
    const { blockLen: s, buffer: o, length: n, finished: a, destroyed: l, pos: i } = this;
    return t.destroyed = l, t.finished = a, t.length = n, t.pos = i, n % s && t.buffer.set(o), t;
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
]), ct = /* @__PURE__ */ BigInt(2 ** 32 - 1), ls = /* @__PURE__ */ BigInt(32);
function ei(e, t = !1) {
  return t ? { h: Number(e & ct), l: Number(e >> ls & ct) } : { h: Number(e >> ls & ct) | 0, l: Number(e & ct) | 0 };
}
function ti(e, t = !1) {
  const s = e.length;
  let o = new Uint32Array(s), n = new Uint32Array(s);
  for (let a = 0; a < s; a++) {
    const { h: l, l: i } = ei(e[a], t);
    [o[a], n[a]] = [l, i];
  }
  return [o, n];
}
const ds = (e, t, s) => e >>> s, us = (e, t, s) => e << 32 - s | t >>> s, Ve = (e, t, s) => e >>> s | t << 32 - s, He = (e, t, s) => e << 32 - s | t >>> s, lt = (e, t, s) => e << 64 - s | t >>> s - 32, dt = (e, t, s) => e >>> s - 32 | t << 64 - s;
function xe(e, t, s, o) {
  const n = (t >>> 0) + (o >>> 0);
  return { h: e + s + (n / 2 ** 32 | 0) | 0, l: n | 0 };
}
const ri = (e, t, s) => (e >>> 0) + (t >>> 0) + (s >>> 0), si = (e, t, s, o) => t + s + o + (e / 2 ** 32 | 0) | 0, ni = (e, t, s, o) => (e >>> 0) + (t >>> 0) + (s >>> 0) + (o >>> 0), oi = (e, t, s, o, n) => t + s + o + n + (e / 2 ** 32 | 0) | 0, ai = (e, t, s, o, n) => (e >>> 0) + (t >>> 0) + (s >>> 0) + (o >>> 0) + (n >>> 0), ii = (e, t, s, o, n, a) => t + s + o + n + a + (e / 2 ** 32 | 0) | 0, In = ti([
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
].map((e) => BigInt(e))), ci = In[0], li = In[1], Re = /* @__PURE__ */ new Uint32Array(80), Te = /* @__PURE__ */ new Uint32Array(80);
class di extends Ja {
  constructor(t) {
    super(128, t, 16, !1);
  }
  // prettier-ignore
  get() {
    const { Ah: t, Al: s, Bh: o, Bl: n, Ch: a, Cl: l, Dh: i, Dl: c, Eh: u, El: f, Fh: h, Fl: m, Gh: y, Gl: w, Hh: p, Hl: E } = this;
    return [t, s, o, n, a, l, i, c, u, f, h, m, y, w, p, E];
  }
  // prettier-ignore
  set(t, s, o, n, a, l, i, c, u, f, h, m, y, w, p, E) {
    this.Ah = t | 0, this.Al = s | 0, this.Bh = o | 0, this.Bl = n | 0, this.Ch = a | 0, this.Cl = l | 0, this.Dh = i | 0, this.Dl = c | 0, this.Eh = u | 0, this.El = f | 0, this.Fh = h | 0, this.Fl = m | 0, this.Gh = y | 0, this.Gl = w | 0, this.Hh = p | 0, this.Hl = E | 0;
  }
  process(t, s) {
    for (let N = 0; N < 16; N++, s += 4)
      Re[N] = t.getUint32(s), Te[N] = t.getUint32(s += 4);
    for (let N = 16; N < 80; N++) {
      const x = Re[N - 15] | 0, R = Te[N - 15] | 0, g = Ve(x, R, 1) ^ Ve(x, R, 8) ^ ds(x, R, 7), k = He(x, R, 1) ^ He(x, R, 8) ^ us(x, R, 7), v = Re[N - 2] | 0, b = Te[N - 2] | 0, P = Ve(v, b, 19) ^ lt(v, b, 61) ^ ds(v, b, 6), S = He(v, b, 19) ^ dt(v, b, 61) ^ us(v, b, 6), I = ni(k, S, Te[N - 7], Te[N - 16]), B = oi(I, g, P, Re[N - 7], Re[N - 16]);
      Re[N] = B | 0, Te[N] = I | 0;
    }
    let { Ah: o, Al: n, Bh: a, Bl: l, Ch: i, Cl: c, Dh: u, Dl: f, Eh: h, El: m, Fh: y, Fl: w, Gh: p, Gl: E, Hh: A, Hl: C } = this;
    for (let N = 0; N < 80; N++) {
      const x = Ve(h, m, 14) ^ Ve(h, m, 18) ^ lt(h, m, 41), R = He(h, m, 14) ^ He(h, m, 18) ^ dt(h, m, 41), g = h & y ^ ~h & p, k = m & w ^ ~m & E, v = ai(C, R, k, li[N], Te[N]), b = ii(v, A, x, g, ci[N], Re[N]), P = v | 0, S = Ve(o, n, 28) ^ lt(o, n, 34) ^ lt(o, n, 39), I = He(o, n, 28) ^ dt(o, n, 34) ^ dt(o, n, 39), B = o & a ^ o & i ^ a & i, M = n & l ^ n & c ^ l & c;
      A = p | 0, C = E | 0, p = y | 0, E = w | 0, y = h | 0, w = m | 0, { h, l: m } = xe(u | 0, f | 0, b | 0, P | 0), u = i | 0, f = c | 0, i = a | 0, c = l | 0, a = o | 0, l = n | 0;
      const _ = ri(P, I, M);
      o = si(_, b, S, B), n = _ | 0;
    }
    ({ h: o, l: n } = xe(this.Ah | 0, this.Al | 0, o | 0, n | 0)), { h: a, l } = xe(this.Bh | 0, this.Bl | 0, a | 0, l | 0), { h: i, l: c } = xe(this.Ch | 0, this.Cl | 0, i | 0, c | 0), { h: u, l: f } = xe(this.Dh | 0, this.Dl | 0, u | 0, f | 0), { h, l: m } = xe(this.Eh | 0, this.El | 0, h | 0, m | 0), { h: y, l: w } = xe(this.Fh | 0, this.Fl | 0, y | 0, w | 0), { h: p, l: E } = xe(this.Gh | 0, this.Gl | 0, p | 0, E | 0), { h: A, l: C } = xe(this.Hh | 0, this.Hl | 0, A | 0, C | 0), this.set(o, n, a, l, i, c, u, f, h, m, y, w, p, E, A, C);
  }
  roundClean() {
    kr(Re, Te);
  }
  destroy() {
    kr(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class ui extends di {
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
const hi = /* @__PURE__ */ Ya(
  () => new ui(),
  /* @__PURE__ */ Xa(3)
);
const Mn = /* @__PURE__ */ BigInt(0), hs = /* @__PURE__ */ BigInt(1);
function Nr(e, t = "") {
  if (typeof e != "boolean") {
    const s = t && `"${t}" `;
    throw new Error(s + "expected boolean, got type=" + typeof e);
  }
  return e;
}
function fi(e) {
  if (typeof e == "bigint") {
    if (!gt(e))
      throw new Error("positive bigint expected, got " + e);
  } else
    _r(e);
  return e;
}
function _n(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  return e === "" ? Mn : BigInt("0x" + e);
}
function mi(e) {
  return _n(Dr(e));
}
function yt(e) {
  return _n(Dr(Er(ie(e)).reverse()));
}
function Dn(e, t) {
  _r(t), e = fi(e);
  const s = Tn(e.toString(16).padStart(t * 2, "0"));
  if (s.length !== t)
    throw new Error("number too large");
  return s;
}
function pi(e, t) {
  return Dn(e, t).reverse();
}
function Er(e) {
  return Uint8Array.from(e);
}
const gt = (e) => typeof e == "bigint" && Mn <= e;
function gi(e, t, s) {
  return gt(e) && gt(t) && gt(s) && t <= e && e < s;
}
function fs(e, t, s, o) {
  if (!gi(t, s, o))
    throw new Error("expected valid " + e + ": " + s + " <= n < " + o + ", got " + t);
}
const wi = (e) => (hs << BigInt(e)) - hs;
function Ur(e, t = {}, s = {}) {
  if (!e || typeof e != "object")
    throw new Error("expected valid options object");
  function o(a, l, i) {
    const c = e[a];
    if (i && c === void 0)
      return;
    const u = typeof c;
    if (u !== l || c === null)
      throw new Error(`param "${a}" is invalid: expected ${l}, got ${u}`);
  }
  const n = (a, l) => Object.entries(a).forEach(([i, c]) => o(i, c, l));
  n(t, !1), n(s, !0);
}
function ms(e) {
  const t = /* @__PURE__ */ new WeakMap();
  return (s, ...o) => {
    const n = t.get(s);
    if (n !== void 0)
      return n;
    const a = e(s, ...o);
    return t.set(s, a), a;
  };
}
const fe = /* @__PURE__ */ BigInt(0), he = /* @__PURE__ */ BigInt(1), Fe = /* @__PURE__ */ BigInt(2), Un = /* @__PURE__ */ BigInt(3), Fn = /* @__PURE__ */ BigInt(4), On = /* @__PURE__ */ BigInt(5), yi = /* @__PURE__ */ BigInt(7), Wn = /* @__PURE__ */ BigInt(8), bi = /* @__PURE__ */ BigInt(9), qn = /* @__PURE__ */ BigInt(16);
function oe(e, t) {
  const s = e % t;
  return s >= fe ? s : t + s;
}
function ve(e, t, s) {
  let o = e;
  for (; t-- > fe; )
    o *= o, o %= s;
  return o;
}
function ps(e, t) {
  if (e === fe)
    throw new Error("invert: expected non-zero number");
  if (t <= fe)
    throw new Error("invert: expected positive modulus, got " + t);
  let s = oe(e, t), o = t, n = fe, a = he;
  for (; s !== fe; ) {
    const i = o / s, c = o % s, u = n - a * i;
    o = s, s = c, n = a, a = u;
  }
  if (o !== he)
    throw new Error("invert: does not exist");
  return oe(n, t);
}
function Fr(e, t, s) {
  if (!e.eql(e.sqr(t), s))
    throw new Error("Cannot find square root");
}
function jn(e, t) {
  const s = (e.ORDER + he) / Fn, o = e.pow(t, s);
  return Fr(e, o, t), o;
}
function Ai(e, t) {
  const s = (e.ORDER - On) / Wn, o = e.mul(t, Fe), n = e.pow(o, s), a = e.mul(t, n), l = e.mul(e.mul(a, Fe), n), i = e.mul(a, e.sub(l, e.ONE));
  return Fr(e, i, t), i;
}
function vi(e) {
  const t = Or(e), s = zn(e), o = s(t, t.neg(t.ONE)), n = s(t, o), a = s(t, t.neg(o)), l = (e + yi) / qn;
  return (i, c) => {
    let u = i.pow(c, l), f = i.mul(u, o);
    const h = i.mul(u, n), m = i.mul(u, a), y = i.eql(i.sqr(f), c), w = i.eql(i.sqr(h), c);
    u = i.cmov(u, f, y), f = i.cmov(m, h, w);
    const p = i.eql(i.sqr(f), c), E = i.cmov(u, f, p);
    return Fr(i, E, c), E;
  };
}
function zn(e) {
  if (e < Un)
    throw new Error("sqrt is not defined for small field");
  let t = e - he, s = 0;
  for (; t % Fe === fe; )
    t /= Fe, s++;
  let o = Fe;
  const n = Or(e);
  for (; gs(n, o) === 1; )
    if (o++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (s === 1)
    return jn;
  let a = n.pow(o, t);
  const l = (t + he) / Fe;
  return function(c, u) {
    if (c.is0(u))
      return u;
    if (gs(c, u) !== 1)
      throw new Error("Cannot find square root");
    let f = s, h = c.mul(c.ONE, a), m = c.pow(u, t), y = c.pow(u, l);
    for (; !c.eql(m, c.ONE); ) {
      if (c.is0(m))
        return c.ZERO;
      let w = 1, p = c.sqr(m);
      for (; !c.eql(p, c.ONE); )
        if (w++, p = c.sqr(p), w === f)
          throw new Error("Cannot find square root");
      const E = he << BigInt(f - w - 1), A = c.pow(h, E);
      f = w, h = c.sqr(A), m = c.mul(m, h), y = c.mul(y, A);
    }
    return y;
  };
}
function ki(e) {
  return e % Fn === Un ? jn : e % Wn === On ? Ai : e % qn === bi ? vi(e) : zn(e);
}
const Ni = (e, t) => (oe(e, t) & he) === he, Ei = [
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
  const t = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  }, s = Ei.reduce((o, n) => (o[n] = "function", o), t);
  return Ur(e, s), e;
}
function xi(e, t, s) {
  if (s < fe)
    throw new Error("invalid exponent, negatives unsupported");
  if (s === fe)
    return e.ONE;
  if (s === he)
    return t;
  let o = e.ONE, n = t;
  for (; s > fe; )
    s & he && (o = e.mul(o, n)), n = e.sqr(n), s >>= he;
  return o;
}
function Vn(e, t, s = !1) {
  const o = new Array(t.length).fill(s ? e.ZERO : void 0), n = t.reduce((l, i, c) => e.is0(i) ? l : (o[c] = l, e.mul(l, i)), e.ONE), a = e.inv(n);
  return t.reduceRight((l, i, c) => e.is0(i) ? l : (o[c] = e.mul(l, o[c]), e.mul(l, i)), a), o;
}
function gs(e, t) {
  const s = (e.ORDER - he) / Fe, o = e.pow(t, s), n = e.eql(o, e.ONE), a = e.eql(o, e.ZERO), l = e.eql(o, e.neg(e.ONE));
  if (!n && !a && !l)
    throw new Error("invalid Legendre symbol result");
  return n ? 1 : a ? 0 : -1;
}
function Si(e, t) {
  t !== void 0 && _r(t);
  const s = t !== void 0 ? t : e.toString(2).length, o = Math.ceil(s / 8);
  return { nBitLength: s, nByteLength: o };
}
class Li {
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
  constructor(t, s = {}) {
    if (t <= fe)
      throw new Error("invalid field: expected ORDER > 0, got " + t);
    let o;
    this.isLE = !1, s != null && typeof s == "object" && (typeof s.BITS == "number" && (o = s.BITS), typeof s.sqrt == "function" && (this.sqrt = s.sqrt), typeof s.isLE == "boolean" && (this.isLE = s.isLE), s.allowedLengths && (this._lengths = s.allowedLengths?.slice()), typeof s.modFromBytes == "boolean" && (this._mod = s.modFromBytes));
    const { nBitLength: n, nByteLength: a } = Si(t, o);
    if (a > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = t, this.BITS = n, this.BYTES = a, this._sqrt = void 0, Object.preventExtensions(this);
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
  eql(t, s) {
    return t === s;
  }
  sqr(t) {
    return oe(t * t, this.ORDER);
  }
  add(t, s) {
    return oe(t + s, this.ORDER);
  }
  sub(t, s) {
    return oe(t - s, this.ORDER);
  }
  mul(t, s) {
    return oe(t * s, this.ORDER);
  }
  pow(t, s) {
    return xi(this, t, s);
  }
  div(t, s) {
    return oe(t * ps(s, this.ORDER), this.ORDER);
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
    return ps(t, this.ORDER);
  }
  sqrt(t) {
    return this._sqrt || (this._sqrt = ki(this.ORDER)), this._sqrt(this, t);
  }
  toBytes(t) {
    return this.isLE ? pi(t, this.BYTES) : Dn(t, this.BYTES);
  }
  fromBytes(t, s = !1) {
    ie(t);
    const { _lengths: o, BYTES: n, isLE: a, ORDER: l, _mod: i } = this;
    if (o) {
      if (!o.includes(t.length) || t.length > n)
        throw new Error("Field.fromBytes: expected " + o + " bytes, got " + t.length);
      const u = new Uint8Array(n);
      u.set(t, a ? 0 : u.length - t.length), t = u;
    }
    if (t.length !== n)
      throw new Error("Field.fromBytes: expected " + n + " bytes, got " + t.length);
    let c = a ? yt(t) : mi(t);
    if (i && (c = oe(c, l)), !s && !this.isValid(c))
      throw new Error("invalid field element: outside of range 0..ORDER");
    return c;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(t) {
    return Vn(this, t);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(t, s, o) {
    return o ? s : t;
  }
}
function Or(e, t = {}) {
  return new Li(e, t);
}
const bt = /* @__PURE__ */ BigInt(0), Cr = /* @__PURE__ */ BigInt(1);
function ws(e, t) {
  const s = t.negate();
  return e ? s : t;
}
function Wt(e, t) {
  const s = Vn(e.Fp, t.map((o) => o.Z));
  return t.map((o, n) => e.fromAffine(o.toAffine(s[n])));
}
function Hn(e, t) {
  if (!Number.isSafeInteger(e) || e <= 0 || e > t)
    throw new Error("invalid window size, expected [1.." + t + "], got W=" + e);
}
function qt(e, t) {
  Hn(e, t);
  const s = Math.ceil(t / e) + 1, o = 2 ** (e - 1), n = 2 ** e, a = wi(e), l = BigInt(e);
  return { windows: s, windowSize: o, mask: a, maxNumber: n, shiftBy: l };
}
function ys(e, t, s) {
  const { windowSize: o, mask: n, maxNumber: a, shiftBy: l } = s;
  let i = Number(e & n), c = e >> l;
  i > o && (i -= a, c += Cr);
  const u = t * o, f = u + Math.abs(i) - 1, h = i === 0, m = i < 0, y = t % 2 !== 0;
  return { nextN: c, offset: f, isZero: h, isNeg: m, isNegF: y, offsetF: u };
}
const jt = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakMap();
function zt(e) {
  return $n.get(e) || 1;
}
function bs(e) {
  if (e !== bt)
    throw new Error("invalid wNAF");
}
class Bi {
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
    for (; s > bt; )
      s & Cr && (o = o.add(n)), n = n.double(), s >>= Cr;
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
    const { windows: o, windowSize: n } = qt(s, this.bits), a = [];
    let l = t, i = l;
    for (let c = 0; c < o; c++) {
      i = l, a.push(i);
      for (let u = 1; u < n; u++)
        i = i.add(l), a.push(i);
      l = i.double();
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
    const l = qt(t, this.bits);
    for (let i = 0; i < l.windows; i++) {
      const { nextN: c, offset: u, isZero: f, isNeg: h, isNegF: m, offsetF: y } = ys(o, i, l);
      o = c, f ? a = a.add(ws(m, s[y])) : n = n.add(ws(h, s[u]));
    }
    return bs(o), { p: n, f: a };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(t, s, o, n = this.ZERO) {
    const a = qt(t, this.bits);
    for (let l = 0; l < a.windows && o !== bt; l++) {
      const { nextN: i, offset: c, isZero: u, isNeg: f } = ys(o, l, a);
      if (o = i, !u) {
        const h = s[c];
        n = n.add(f ? h.negate() : h);
      }
    }
    return bs(o), n;
  }
  getPrecomputes(t, s, o) {
    let n = jt.get(s);
    return n || (n = this.precomputeWindow(s, t), t !== 1 && (typeof o == "function" && (n = o(n)), jt.set(s, n))), n;
  }
  cached(t, s, o) {
    const n = zt(t);
    return this.wNAF(n, this.getPrecomputes(n, t, o), s);
  }
  unsafe(t, s, o, n) {
    const a = zt(t);
    return a === 1 ? this._unsafeLadder(t, s, n) : this.wNAFUnsafe(a, this.getPrecomputes(a, t, o), s, n);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(t, s) {
    Hn(s, this.bits), $n.set(t, s), jt.delete(t);
  }
  hasCache(t) {
    return zt(t) !== 1;
  }
}
function As(e, t, s) {
  if (t) {
    if (t.ORDER !== e)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return Ci(t), t;
  } else
    return Or(e, { isLE: s });
}
function Pi(e, t, s = {}, o) {
  if (o === void 0 && (o = e === "edwards"), !t || typeof t != "object")
    throw new Error(`expected valid ${e} CURVE object`);
  for (const c of ["p", "n", "h"]) {
    const u = t[c];
    if (!(typeof u == "bigint" && u > bt))
      throw new Error(`CURVE.${c} must be positive bigint`);
  }
  const n = As(t.p, s.Fp, o), a = As(t.n, s.Fn, o), i = ["Gx", "Gy", "a", "d"];
  for (const c of i)
    if (!n.isValid(t[c]))
      throw new Error(`CURVE.${c} must be valid field element of CURVE.Fp`);
  return t = Object.freeze(Object.assign({}, t)), { CURVE: t, Fp: n, Fn: a };
}
function Ri(e, t) {
  return function(o) {
    const n = e(o);
    return { secretKey: n, publicKey: t(n) };
  };
}
const Ie = BigInt(0), ae = BigInt(1), Vt = BigInt(2), Ti = BigInt(8);
function Ii(e, t, s, o) {
  const n = e.sqr(s), a = e.sqr(o), l = e.add(e.mul(t.a, n), a), i = e.add(e.ONE, e.mul(t.d, e.mul(n, a)));
  return e.eql(l, i);
}
function Mi(e, t = {}) {
  const s = Pi("edwards", e, t, t.FpFnLE), { Fp: o, Fn: n } = s;
  let a = s.CURVE;
  const { h: l } = a;
  Ur(t, {}, { uvRatio: "function" });
  const i = Vt << BigInt(n.BYTES * 8) - ae, c = (E) => o.create(E), u = t.uvRatio || ((E, A) => {
    try {
      return { isValid: !0, value: o.sqrt(o.div(E, A)) };
    } catch {
      return { isValid: !1, value: Ie };
    }
  });
  if (!Ii(o, a, a.Gx, a.Gy))
    throw new Error("bad curve params: generator point");
  function f(E, A, C = !1) {
    const N = C ? ae : Ie;
    return fs("coordinate " + E, A, N, i), A;
  }
  function h(E) {
    if (!(E instanceof w))
      throw new Error("EdwardsPoint expected");
  }
  const m = ms((E, A) => {
    const { X: C, Y: N, Z: x } = E, R = E.is0();
    A == null && (A = R ? Ti : o.inv(x));
    const g = c(C * A), k = c(N * A), v = o.mul(x, A);
    if (R)
      return { x: Ie, y: ae };
    if (v !== ae)
      throw new Error("invZ was invalid");
    return { x: g, y: k };
  }), y = ms((E) => {
    const { a: A, d: C } = a;
    if (E.is0())
      throw new Error("bad point: ZERO");
    const { X: N, Y: x, Z: R, T: g } = E, k = c(N * N), v = c(x * x), b = c(R * R), P = c(b * b), S = c(k * A), I = c(b * c(S + v)), B = c(P + c(C * c(k * v)));
    if (I !== B)
      throw new Error("bad point: equation left != right (1)");
    const M = c(N * x), _ = c(R * g);
    if (M !== _)
      throw new Error("bad point: equation left != right (2)");
    return !0;
  });
  class w {
    // base / generator point
    static BASE = new w(a.Gx, a.Gy, ae, c(a.Gx * a.Gy));
    // zero / infinity / identity point
    static ZERO = new w(Ie, ae, ae, Ie);
    // 0, 1, 1, 0
    // math field
    static Fp = o;
    // scalar field
    static Fn = n;
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
      return f("x", C), f("y", N), new w(C, N, ae, c(C * N));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(A, C = !1) {
      const N = o.BYTES, { a: x, d: R } = a;
      A = Er(ie(A, N, "point")), Nr(C, "zip215");
      const g = Er(A), k = A[N - 1];
      g[N - 1] = k & -129;
      const v = yt(g), b = C ? i : o.ORDER;
      fs("point.y", v, Ie, b);
      const P = c(v * v), S = c(P - ae), I = c(R * P - x);
      let { isValid: B, value: M } = u(S, I);
      if (!B)
        throw new Error("bad point: invalid y coordinate");
      const _ = (M & ae) === ae, O = (k & 128) !== 0;
      if (!C && M === Ie && O)
        throw new Error("bad point: x=0 and x_0=1");
      return O !== _ && (M = c(-M)), w.fromAffine({ x: M, y: v });
    }
    static fromHex(A, C = !1) {
      return w.fromBytes(Tn(A), C);
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
      y(this);
    }
    // Compare one point to another.
    equals(A) {
      h(A);
      const { X: C, Y: N, Z: x } = this, { X: R, Y: g, Z: k } = A, v = c(C * k), b = c(R * x), P = c(N * k), S = c(g * x);
      return v === b && P === S;
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
      const { a: A } = a, { X: C, Y: N, Z: x } = this, R = c(C * C), g = c(N * N), k = c(Vt * c(x * x)), v = c(A * R), b = C + N, P = c(c(b * b) - R - g), S = v + g, I = S - k, B = v - g, M = c(P * I), _ = c(S * B), O = c(P * B), F = c(I * S);
      return new w(M, _, F, O);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(A) {
      h(A);
      const { a: C, d: N } = a, { X: x, Y: R, Z: g, T: k } = this, { X: v, Y: b, Z: P, T: S } = A, I = c(x * v), B = c(R * b), M = c(k * N * S), _ = c(g * P), O = c((x + R) * (v + b) - I - B), F = _ - M, H = _ + M, q = c(B - C * I), D = c(O * F), U = c(H * q), G = c(O * q), ee = c(F * H);
      return new w(D, U, ee, G);
    }
    subtract(A) {
      return this.add(A.negate());
    }
    // Constant-time multiplication.
    multiply(A) {
      if (!n.isValidNot0(A))
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
      if (!n.isValid(A))
        throw new Error("invalid scalar: expected 0 <= sc < curve.n");
      return A === Ie ? w.ZERO : this.is0() || A === ae ? this : p.unsafe(this, A, (N) => Wt(w, N), C);
    }
    // Checks if point is of small order.
    // If you add something to small order point, you will have "dirty"
    // point with torsion component.
    // Multiplies point by cofactor and checks if the result is 0.
    isSmallOrder() {
      return this.multiplyUnsafe(l).is0();
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
      return l === ae ? this : this.multiplyUnsafe(l);
    }
    toBytes() {
      const { x: A, y: C } = this.toAffine(), N = o.toBytes(C);
      return N[N.length - 1] |= A & ae ? 128 : 0, N;
    }
    toHex() {
      return Dr(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const p = new Bi(w, n.BITS);
  return w.BASE.precompute(8), w;
}
function _i(e, t, s = {}) {
  if (typeof t != "function")
    throw new Error('"hash" function param is required');
  Ur(s, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    mapToCurve: "function"
  });
  const { prehash: o } = s, { BASE: n, Fp: a, Fn: l } = e, i = s.randomBytes || Za, c = s.adjustScalarBytes || ((v) => v), u = s.domain || ((v, b, P) => {
    if (Nr(P, "phflag"), b.length || P)
      throw new Error("Contexts/pre-hash are not supported");
    return v;
  });
  function f(v) {
    return l.create(yt(v));
  }
  function h(v) {
    const b = N.secretKey;
    ie(v, N.secretKey, "secretKey");
    const P = ie(t(v), 2 * b, "hashedSecretKey"), S = c(P.slice(0, b)), I = P.slice(b, 2 * b), B = f(S);
    return { head: S, prefix: I, scalar: B };
  }
  function m(v) {
    const { head: b, prefix: P, scalar: S } = h(v), I = n.multiply(S), B = I.toBytes();
    return { head: b, prefix: P, scalar: S, point: I, pointBytes: B };
  }
  function y(v) {
    return m(v).pointBytes;
  }
  function w(v = Uint8Array.of(), ...b) {
    const P = cs(...b);
    return f(t(u(P, ie(v, void 0, "context"), !!o)));
  }
  function p(v, b, P = {}) {
    v = ie(v, void 0, "message"), o && (v = o(v));
    const { prefix: S, scalar: I, pointBytes: B } = m(b), M = w(P.context, S, v), _ = n.multiply(M).toBytes(), O = w(P.context, _, B, v), F = l.create(M + O * I);
    if (!l.isValid(F))
      throw new Error("sign failed: invalid s");
    const H = cs(_, l.toBytes(F));
    return ie(H, N.signature, "result");
  }
  const E = { zip215: !0 };
  function A(v, b, P, S = E) {
    const { context: I, zip215: B } = S, M = N.signature;
    v = ie(v, M, "signature"), b = ie(b, void 0, "message"), P = ie(P, N.publicKey, "publicKey"), B !== void 0 && Nr(B, "zip215"), o && (b = o(b));
    const _ = M / 2, O = v.subarray(0, _), F = yt(v.subarray(_, M));
    let H, q, D;
    try {
      H = e.fromBytes(P, B), q = e.fromBytes(O, B), D = n.multiplyUnsafe(F);
    } catch {
      return !1;
    }
    if (!B && H.isSmallOrder())
      return !1;
    const U = w(I, q.toBytes(), H.toBytes(), b);
    return q.add(H.multiplyUnsafe(U)).subtract(D).clearCofactor().is0();
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
    return Pn(v) && v.length === l.BYTES;
  }
  function g(v, b) {
    try {
      return !!e.fromBytes(v, b);
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
      const { y: b } = e.fromBytes(v), P = N.publicKey, S = P === 32;
      if (!S && P !== 57)
        throw new Error("only defined for 25519 and 448");
      const I = S ? a.div(ae + b, ae - b) : a.div(b - ae, b + ae);
      return a.toBytes(I);
    },
    toMontgomerySecret(v) {
      const b = N.secretKey;
      ie(v, b);
      const P = t(v.subarray(0, b));
      return c(P).subarray(0, b);
    }
  };
  return Object.freeze({
    keygen: Ri(x, y),
    getPublicKey: y,
    sign: p,
    verify: A,
    utils: k,
    Point: e,
    lengths: N
  });
}
const Di = BigInt(1), vs = BigInt(2), Ui = BigInt(5), Fi = BigInt(8), Wr = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"), Oi = {
  p: Wr,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: Fi,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
};
function Wi(e) {
  const t = BigInt(10), s = BigInt(20), o = BigInt(40), n = BigInt(80), a = Wr, i = e * e % a * e % a, c = ve(i, vs, a) * i % a, u = ve(c, Di, a) * e % a, f = ve(u, Ui, a) * u % a, h = ve(f, t, a) * f % a, m = ve(h, s, a) * h % a, y = ve(m, o, a) * m % a, w = ve(y, n, a) * y % a, p = ve(w, n, a) * y % a, E = ve(p, t, a) * f % a;
  return { pow_p_5_8: ve(E, vs, a) * e % a, b2: i };
}
function qi(e) {
  return e[0] &= 248, e[31] &= 127, e[31] |= 64, e;
}
const ks = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function ji(e, t) {
  const s = Wr, o = oe(t * t * t, s), n = oe(o * o * t, s), a = Wi(e * n).pow_p_5_8;
  let l = oe(e * o * a, s);
  const i = oe(t * l * l, s), c = l, u = oe(l * ks, s), f = i === e, h = i === oe(-e, s), m = i === oe(-e * ks, s);
  return f && (l = c), (h || m) && (l = u), Ni(l, s) && (l = oe(-l, s)), { isValid: f || h, value: l };
}
const zi = /* @__PURE__ */ Mi(Oi, { uvRatio: ji });
function Vi(e) {
  return _i(zi, hi, Object.assign({ adjustScalarBytes: qi }, e));
}
const Hi = /* @__PURE__ */ Vi({});
function $i(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Pt(e, ...t) {
  if (!$i(e))
    throw new Error("Uint8Array expected");
  if (t.length > 0 && !t.includes(e.length))
    throw new Error("Uint8Array expected of length " + t + ", got length=" + e.length);
}
function Ns(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function Gi(e, t) {
  Pt(e);
  const s = t.outputLen;
  if (e.length < s)
    throw new Error("digestInto() expects output buffer of length at least " + s);
}
function xr(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function Ht(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function ke(e, t) {
  return e << 32 - t | e >>> t;
}
function Qi(e) {
  if (typeof e != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(e));
}
function Gn(e) {
  return typeof e == "string" && (e = Qi(e)), Pt(e), e;
}
class Ki {
}
function Yi(e) {
  const t = (o) => e().update(Gn(o)).digest(), s = e();
  return t.outputLen = s.outputLen, t.blockLen = s.blockLen, t.create = () => e(), t;
}
function Zi(e, t, s, o) {
  if (typeof e.setBigUint64 == "function")
    return e.setBigUint64(t, s, o);
  const n = BigInt(32), a = BigInt(4294967295), l = Number(s >> n & a), i = Number(s & a), c = o ? 4 : 0, u = o ? 0 : 4;
  e.setUint32(t + c, l, o), e.setUint32(t + u, i, o);
}
function Xi(e, t, s) {
  return e & t ^ ~e & s;
}
function Ji(e, t, s) {
  return e & t ^ e & s ^ t & s;
}
class ec extends Ki {
  constructor(t, s, o, n) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = t, this.outputLen = s, this.padOffset = o, this.isLE = n, this.buffer = new Uint8Array(t), this.view = Ht(this.buffer);
  }
  update(t) {
    Ns(this), t = Gn(t), Pt(t);
    const { view: s, buffer: o, blockLen: n } = this, a = t.length;
    for (let l = 0; l < a; ) {
      const i = Math.min(n - this.pos, a - l);
      if (i === n) {
        const c = Ht(t);
        for (; n <= a - l; l += n)
          this.process(c, l);
        continue;
      }
      o.set(t.subarray(l, l + i), this.pos), this.pos += i, l += i, this.pos === n && (this.process(s, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    Ns(this), Gi(t, this), this.finished = !0;
    const { buffer: s, view: o, blockLen: n, isLE: a } = this;
    let { pos: l } = this;
    s[l++] = 128, xr(this.buffer.subarray(l)), this.padOffset > n - l && (this.process(o, 0), l = 0);
    for (let h = l; h < n; h++)
      s[h] = 0;
    Zi(o, n - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const i = Ht(t), c = this.outputLen;
    if (c % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const u = c / 4, f = this.get();
    if (u > f.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let h = 0; h < u; h++)
      i.setUint32(4 * h, f[h], a);
  }
  digest() {
    const { buffer: t, outputLen: s } = this;
    this.digestInto(t);
    const o = t.slice(0, s);
    return this.destroy(), o;
  }
  _cloneInto(t) {
    t || (t = new this.constructor()), t.set(...this.get());
    const { blockLen: s, buffer: o, length: n, finished: a, destroyed: l, pos: i } = this;
    return t.destroyed = l, t.finished = a, t.length = n, t.pos = i, n % s && t.buffer.set(o), t;
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
]), tc = /* @__PURE__ */ Uint32Array.from([
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
class rc extends ec {
  constructor(t = 32) {
    super(64, t, 8, !1), this.A = Me[0] | 0, this.B = Me[1] | 0, this.C = Me[2] | 0, this.D = Me[3] | 0, this.E = Me[4] | 0, this.F = Me[5] | 0, this.G = Me[6] | 0, this.H = Me[7] | 0;
  }
  get() {
    const { A: t, B: s, C: o, D: n, E: a, F: l, G: i, H: c } = this;
    return [t, s, o, n, a, l, i, c];
  }
  // prettier-ignore
  set(t, s, o, n, a, l, i, c) {
    this.A = t | 0, this.B = s | 0, this.C = o | 0, this.D = n | 0, this.E = a | 0, this.F = l | 0, this.G = i | 0, this.H = c | 0;
  }
  process(t, s) {
    for (let h = 0; h < 16; h++, s += 4)
      _e[h] = t.getUint32(s, !1);
    for (let h = 16; h < 64; h++) {
      const m = _e[h - 15], y = _e[h - 2], w = ke(m, 7) ^ ke(m, 18) ^ m >>> 3, p = ke(y, 17) ^ ke(y, 19) ^ y >>> 10;
      _e[h] = p + _e[h - 7] + w + _e[h - 16] | 0;
    }
    let { A: o, B: n, C: a, D: l, E: i, F: c, G: u, H: f } = this;
    for (let h = 0; h < 64; h++) {
      const m = ke(i, 6) ^ ke(i, 11) ^ ke(i, 25), y = f + m + Xi(i, c, u) + tc[h] + _e[h] | 0, p = (ke(o, 2) ^ ke(o, 13) ^ ke(o, 22)) + Ji(o, n, a) | 0;
      f = u, u = c, c = i, i = l + y | 0, l = a, a = n, n = o, o = y + p | 0;
    }
    o = o + this.A | 0, n = n + this.B | 0, a = a + this.C | 0, l = l + this.D | 0, i = i + this.E | 0, c = c + this.F | 0, u = u + this.G | 0, f = f + this.H | 0, this.set(o, n, a, l, i, c, u, f);
  }
  roundClean() {
    xr(_e);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), xr(this.buffer);
  }
}
const Qn = /* @__PURE__ */ Yi(() => new rc()), sc = Qn, nc = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function oc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = sc(e), s = Hi.getPublicKey(t), o = new Uint8Array(64);
  return o.set(t, 0), o.set(s, 32), ln(t), { publicKey: s, secretKey: o };
}
function Kn(e) {
  const t = oc(e), s = t.publicKey;
  return ln(t.secretKey), s;
}
function Yn(e) {
  if (e.length !== 32)
    throw new Error(`Invalid public key length: expected 32, got ${e.length}`);
  return ac(e);
}
function ac(e) {
  let t = 0;
  for (let n = 0; n < e.length && e[n] === 0; n++)
    t++;
  let s = 0n;
  for (let n = 0; n < e.length; n++)
    s = s * 256n + BigInt(e[n]);
  let o = "";
  for (; s > 0n; ) {
    const n = Number(s % 58n);
    o = nc[n] + o, s = s / 58n;
  }
  return "1".repeat(t) + o;
}
const ic = 2, cc = 3;
function Zn(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = Sr(e), s = Bn.share(t, cc, ic);
  if (s.length !== 3)
    throw new Error(`Unexpected share count: ${s.length}`);
  const o = $t(s[0]), n = $t(s[1]), a = $t(s[2]);
  return {
    shareA: Oe(o),
    shareB: Oe(n),
    shareC: Oe(a)
  };
}
function lc(e, t, s) {
  const o = Es(e), n = Es(t);
  try {
    const a = Bn.combine([o, n]), l = Xn(a);
    if (l.length !== 16)
      throw new Error(`Reconstructed seed has wrong length: ${l.length}`);
    return dn(l);
  } catch (a) {
    throw a instanceof Error && a.message.startsWith("Reconstructed seed") || a instanceof Error && a.message.startsWith("Invalid expectedPublicKey") || a instanceof Error && a.message.startsWith("Reconstructed seed does not match") ? a : new Error("Failed to reconstruct seed from shares");
  }
}
function Sr(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
}
function Xn(e) {
  if (!/^[0-9a-fA-F]*$/.test(e))
    throw new Error("Invalid hex string: contains non-hex characters");
  if (e.length % 2 !== 0)
    throw new Error(`Invalid hex string: length ${e.length} is odd (must be even)`);
  const t = new Uint8Array(e.length / 2);
  for (let s = 0; s < t.length; s++)
    t[s] = parseInt(e.substr(s * 2, 2), 16);
  return t;
}
function $t(e) {
  const t = e.length % 2 !== 0, s = t ? "0" + e : e, o = Xn(s), n = new Uint8Array(1 + o.length);
  return n[0] = t ? 1 : 0, n.set(o, 1), n;
}
function Es(e) {
  const t = e[0];
  if (t === 0 || t === 1) {
    const o = t === 1, n = e.subarray(1), a = Sr(n), l = o ? a.substring(1) : a;
    if (/^[0-9a-f]/.test(l))
      return l;
  }
  const s = Sr(e);
  return s.startsWith("0") && !s.startsWith("00") ? s.substring(1) : s;
}
function At(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Jn(e, t) {
  return Array.isArray(t) ? t.length === 0 ? !0 : e ? t.every((s) => typeof s == "string") : t.every((s) => Number.isSafeInteger(s)) : !1;
}
function dc(e) {
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
  if (!Jn(!0, t))
    throw new Error(`${e}: array of strings expected`);
}
function eo(e, t) {
  if (!Jn(!1, t))
    throw new Error(`${e}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function uc(...e) {
  const t = (a) => a, s = (a, l) => (i) => a(l(i)), o = e.map((a) => a.encode).reduceRight(s, t), n = e.map((a) => a.decode).reduce(s, t);
  return { encode: o, decode: n };
}
// @__NO_SIDE_EFFECTS__
function hc(e) {
  const t = typeof e == "string" ? e.split("") : e, s = t.length;
  Nt("alphabet", t);
  const o = new Map(t.map((n, a) => [n, a]));
  return {
    encode: (n) => (kt(n), n.map((a) => {
      if (!Number.isSafeInteger(a) || a < 0 || a >= s)
        throw new Error(`alphabet.encode: digit index outside alphabet "${a}". Allowed: ${e}`);
      return t[a];
    })),
    decode: (n) => (kt(n), n.map((a) => {
      vt("alphabet.decode", a);
      const l = o.get(a);
      if (l === void 0)
        throw new Error(`Unknown letter: "${a}". Allowed: ${e}`);
      return l;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function fc(e = "") {
  return vt("join", e), {
    encode: (t) => (Nt("join.decode", t), t.join(e)),
    decode: (t) => (vt("join.decode", t), t.split(e))
  };
}
// @__NO_SIDE_EFFECTS__
function mc(e, t = "=") {
  return Ze(e), vt("padding", t), {
    encode(s) {
      for (Nt("padding.encode", s); s.length * e % 8; )
        s.push(t);
      return s;
    },
    decode(s) {
      Nt("padding.decode", s);
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
function Lr(e, t, s) {
  if (t < 2)
    throw new Error(`convertRadix: invalid from=${t}, base cannot be less than 2`);
  if (s < 2)
    throw new Error(`convertRadix: invalid to=${s}, base cannot be less than 2`);
  if (kt(e), !e.length)
    return [];
  let o = 0;
  const n = [], a = Array.from(e, (i) => {
    if (Ze(i), i < 0 || i >= t)
      throw new Error(`invalid integer: ${i}`);
    return i;
  }), l = a.length;
  for (; ; ) {
    let i = 0, c = !0;
    for (let u = o; u < l; u++) {
      const f = a[u], h = t * i, m = h + f;
      if (!Number.isSafeInteger(m) || h / t !== i || m - f !== h)
        throw new Error("convertRadix: carry overflow");
      const y = m / s;
      i = m % s;
      const w = Math.floor(y);
      if (a[u] = w, !Number.isSafeInteger(w) || w * s + i !== m)
        throw new Error("convertRadix: carry overflow");
      if (c)
        w ? c = !1 : o = u;
      else continue;
    }
    if (n.push(i), c)
      break;
  }
  for (let i = 0; i < e.length - 1 && e[i] === 0; i++)
    n.push(0);
  return n.reverse();
}
const to = (e, t) => t === 0 ? e : to(t, e % t), Et = /* @__NO_SIDE_EFFECTS__ */ (e, t) => e + (t - to(e, t)), Gt = /* @__PURE__ */ (() => {
  let e = [];
  for (let t = 0; t < 40; t++)
    e.push(2 ** t);
  return e;
})();
function Br(e, t, s, o) {
  if (kt(e), t <= 0 || t > 32)
    throw new Error(`convertRadix2: wrong from=${t}`);
  if (s <= 0 || s > 32)
    throw new Error(`convertRadix2: wrong to=${s}`);
  if (/* @__PURE__ */ Et(t, s) > 32)
    throw new Error(`convertRadix2: carry overflow from=${t} to=${s} carryBits=${/* @__PURE__ */ Et(t, s)}`);
  let n = 0, a = 0;
  const l = Gt[t], i = Gt[s] - 1, c = [];
  for (const u of e) {
    if (Ze(u), u >= l)
      throw new Error(`convertRadix2: invalid data word=${u} from=${t}`);
    if (n = n << t | u, a + t > 32)
      throw new Error(`convertRadix2: carry overflow pos=${a} from=${t}`);
    for (a += t; a >= s; a -= s)
      c.push((n >> a - s & i) >>> 0);
    const f = Gt[a];
    if (f === void 0)
      throw new Error("invalid carry");
    n &= f - 1;
  }
  if (n = n << s - a & i, !o && a >= t)
    throw new Error("Excess padding");
  if (!o && n > 0)
    throw new Error(`Non-zero padding: ${n}`);
  return o && a > 0 && c.push(n >>> 0), c;
}
// @__NO_SIDE_EFFECTS__
function pc(e) {
  Ze(e);
  const t = 2 ** 8;
  return {
    encode: (s) => {
      if (!At(s))
        throw new Error("radix.encode input should be Uint8Array");
      return Lr(Array.from(s), t, e);
    },
    decode: (s) => (eo("radix.decode", s), Uint8Array.from(Lr(s, e, t)))
  };
}
// @__NO_SIDE_EFFECTS__
function gc(e, t = !1) {
  if (Ze(e), e <= 0 || e > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Et(8, e) > 32 || /* @__PURE__ */ Et(e, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (s) => {
      if (!At(s))
        throw new Error("radix2.encode input should be Uint8Array");
      return Br(Array.from(s), 8, e, !t);
    },
    decode: (s) => (eo("radix2.decode", s), Uint8Array.from(Br(s, e, 8, t)))
  };
}
function wc(e, t) {
  return Ze(e), dc(t), {
    encode(s) {
      if (!At(s))
        throw new Error("checksum.encode: input should be Uint8Array");
      const o = t(s).slice(0, e), n = new Uint8Array(s.length + e);
      return n.set(s), n.set(o, s.length), n;
    },
    decode(s) {
      if (!At(s))
        throw new Error("checksum.decode: input should be Uint8Array");
      const o = s.slice(0, -e), n = s.slice(-e), a = t(o).slice(0, e);
      for (let l = 0; l < e; l++)
        if (a[l] !== n[l])
          throw new Error("Invalid checksum");
      return o;
    }
  };
}
const ut = {
  alphabet: hc,
  chain: uc,
  checksum: wc,
  convertRadix: Lr,
  convertRadix2: Br,
  radix: pc,
  radix2: gc,
  join: fc,
  padding: mc
};
const yc = (e) => e[0] === "あいこくしん";
function bc(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function Ac(e) {
  const t = bc(e), s = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(s.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: s };
}
function ro(e) {
  Pt(e, 16, 20, 24, 28, 32);
}
const vc = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([Qn(e)[0] >> t << t]);
};
function so(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), ut.chain(ut.checksum(1, vc), ut.radix2(11, !0), ut.alphabet(e));
}
function qr(e, t) {
  const { words: s } = Ac(e), o = so(t).decode(s);
  return ro(o), o;
}
function no(e, t) {
  return ro(e), so(t).encode(e).join(yc(t) ? "　" : " ");
}
function jr(e, t) {
  try {
    qr(e, t);
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
`), pe = 12;
function kc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid share length: expected 16, got ${e.length}`);
  const s = no(e, Le).split(" ");
  if (s.length !== pe)
    throw new Error(`Unexpected word count: expected ${pe}, got ${s.length}`);
  return s;
}
function Nc(e) {
  if (e.length !== pe)
    throw new Error(`Invalid word count: expected ${pe}, got ${e.length}`);
  const t = e.join(" ").toLowerCase().trim();
  if (!jr(t, Le))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const s = qr(t, Le);
  if (s.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${s.length}`);
  return Oe(s);
}
function Ec(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const s = no(e, Le).split(" ");
  if (s.length !== pe)
    throw new Error(`Unexpected word count: expected ${pe}, got ${s.length}`);
  return s;
}
function Cc(e) {
  if (e.length !== pe)
    throw new Error(`Invalid word count: expected ${pe}, got ${e.length}`);
  const t = e.join(" ").toLowerCase().trim();
  if (!jr(t, Le))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const s = qr(t, Le);
  if (s.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${s.length}`);
  return dn(s);
}
function oo(e) {
  if (e.length !== pe)
    return !1;
  const t = e.join(" ").toLowerCase().trim();
  return jr(t, Le);
}
function ht(e) {
  return Le.includes(e.toLowerCase().trim());
}
function xc(e, t = 5) {
  const s = e.toLowerCase().trim();
  return s.length === 0 ? [] : Le.filter((o) => o.startsWith(s)).slice(0, t);
}
function Sc(e) {
  const t = [];
  for (let s = 0; s < e.length; s += 4)
    t.push(e.slice(s, s + 4));
  return t;
}
function Lc(e) {
  return e.toLowerCase().replace(/[,\n\r\t]+/g, " ").split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);
}
function Yu({
  className: e = "",
  variant: t = "default",
  size: s = "md",
  children: o,
  menuItems: n = [],
  hideSignOut: a = !1
}) {
  const { user: l, isAuthenticated: i, isLoading: c, openLoginModal: u, logout: f } = St(), [h, m] = L(!1), [y, w] = L(-1), p = J(null), E = J(null), A = V(
    () => [...n, ...a ? [] : [{ label: "Sign out", onClick: f }]],
    [n, a, f]
  );
  W(() => {
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
            y >= 0 && (g.preventDefault(), A[y].onClick(), m(!1), w(-1));
            break;
        }
    },
    [h, y, A]
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
  if (c)
    return /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: `cedros-button ${R[t]} ${x[s]} ${e}`,
        disabled: !0,
        children: /* @__PURE__ */ r($, { size: "sm" })
      }
    );
  if (i && l) {
    const g = l.name || l.email || "User", k = An(l.picture);
    return (
      // L-08: Added keyboard handler and ref for accessibility
      /* @__PURE__ */ d("div", { className: "cedros-user-menu", ref: p, onKeyDown: C, children: [
        /* @__PURE__ */ d(
          "button",
          {
            ref: E,
            type: "button",
            className: `cedros-button cedros-user-button ${x[s]} ${e}`,
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
          n.map((v, b) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item ${y === b ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: y === b ? 0 : -1,
              onClick: () => {
                v.onClick(), m(!1);
              },
              children: [
                v.icon && /* @__PURE__ */ r("span", { className: "cedros-dropdown-icon", children: v.icon }),
                v.label
              ]
            },
            b
          )),
          n.length > 0 && !a && /* @__PURE__ */ r("div", { className: "cedros-dropdown-divider", role: "separator" }),
          !a && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item cedros-dropdown-item-danger ${y === n.length ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: y === n.length ? 0 : -1,
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
      className: `cedros-button ${R[t]} ${x[s]} ${e}`,
      onClick: u,
      children: o || "Sign in"
    }
  );
}
function zr() {
  const { config: e } = ne(), [t, s] = L(!1), [o, n] = L(!1), [a, l] = L(null), i = V(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: c, getRemainingAttempts: u } = vn({
    maxAttempts: 3,
    windowMs: 3e5
  }), f = T(
    async (w) => {
      if (!Nn(w)) {
        const p = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw l(p), p;
      }
      try {
        c();
      } catch (p) {
        const E = {
          code: "RATE_LIMITED",
          message: p instanceof Error ? p.message : "Too many attempts"
        };
        throw l(E), E;
      }
      s(!0), l(null), n(!1);
      try {
        await i.post("/forgot-password", { email: w }), n(!0);
      } catch (p) {
        const E = j(p, "Unable to send the reset email. Please try again.");
        throw l(E), E;
      } finally {
        s(!1);
      }
    },
    [i, c]
  ), h = T(
    async (w, p) => {
      s(!0), l(null), n(!1);
      try {
        await i.post("/reset-password", { token: w, newPassword: p }), n(!0);
      } catch (E) {
        const A = j(E, "Unable to reset your password. Please try again.");
        throw l(A), A;
      } finally {
        s(!1);
      }
    },
    [i]
  ), m = T(() => l(null), []), y = T(() => {
    l(null), n(!1), s(!1);
  }, []);
  return {
    forgotPassword: f,
    resetPassword: h,
    isLoading: t,
    isSuccess: o,
    error: a,
    clearError: m,
    reset: y,
    remainingAttempts: u()
  };
}
function Bc(e) {
  return typeof e == "object" && e !== null && "mfaRequired" in e && e.mfaRequired === !0;
}
function Pc() {
  const { config: e, _internal: t } = ne(), [s, o] = L(!1), [n, a] = L(!1), [l, i] = L(null), c = V(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: u, getRemainingAttempts: f } = vn({
    maxAttempts: 3,
    windowMs: 3e5
  }), h = T(
    async (p) => {
      if (!Nn(p)) {
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
        await c.post("/instant-link", { email: p }), a(!0);
      } catch (E) {
        const A = j(E, "Unable to send the sign-in link. Please try again.");
        throw i(A), A;
      } finally {
        o(!1);
      }
    },
    [c, u]
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
        const E = await c.post(
          "/instant-link/verify",
          {
            token: p
          }
        );
        return Bc(E) || (e.callbacks?.onLoginSuccess?.(E.user, "email"), t?.handleLoginSuccess(E.user, E.tokens)), E;
      } catch (E) {
        const A = j(E, "Unable to verify the sign-in link. Please try again.");
        throw i(A), A;
      } finally {
        o(!1);
      }
    },
    [c, e.callbacks, t]
  ), y = T(() => i(null), []), w = T(() => {
    i(null), a(!1), o(!1);
  }, []);
  return {
    sendInstantLink: h,
    verifyInstantLink: m,
    isLoading: s,
    isSuccess: n,
    error: l,
    clearError: y,
    reset: w,
    remainingAttempts: f()
  };
}
const Rc = {
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
function Tc({
  mode: e = "reset",
  onSuccess: t,
  onCancel: s,
  className: o = ""
}) {
  const [n, a] = L(""), l = zr(), i = Pc(), c = yn(), u = e === "instantLink" ? { submit: i.sendInstantLink, isLoading: i.isLoading, isSuccess: i.isSuccess, error: i.error, clearError: i.clearError } : { submit: l.forgotPassword, isLoading: l.isLoading, isSuccess: l.isSuccess, error: l.error, clearError: l.clearError }, f = Rc[e], h = async (m) => {
    m.preventDefault();
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
    /* @__PURE__ */ r("p", { className: "cedros-success-message", children: f.successMessage(n) }),
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
      /* @__PURE__ */ r("p", { className: "cedros-form-subtitle", children: f.subtitle })
    ] }),
    /* @__PURE__ */ r(se, { error: u.error, onDismiss: u.clearError }),
    /* @__PURE__ */ d("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ r("label", { htmlFor: c, className: "cedros-label", children: "Email address" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: c,
          type: "email",
          className: "cedros-input",
          value: n,
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
          disabled: u.isLoading || !n,
          children: u.isLoading ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r($, { size: "sm" }),
            "Sending..."
          ] }) : f.button
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
const Ic = {
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
function Mc() {
  const { config: e, _internal: t } = ne(), [s, o] = L(!1), [n, a] = L(!1), [l, i] = L(null), [c, u] = L(null), f = J(e), h = V(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  );
  W(() => {
    f.current = e;
  }, [e]), W(() => {
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
    return Ic.load().then(() => {
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
    if (!n) {
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
      const C = j(E, "Unable to sign in with Apple. Please try again.");
      throw C.code === "ACCOUNT_LINK_REQUIRED" && p && u(p), i(C), o(!1), C;
    }
  }, [e.appleClientId, n, h, t]), y = T(() => i(null), []), w = T(() => u(null), []);
  return {
    signIn: m,
    isLoading: s,
    isInitialized: n,
    error: l,
    clearError: y,
    pendingLinkIdToken: c,
    clearPendingLink: w
  };
}
function ao() {
  if (typeof window > "u" || typeof navigator > "u")
    return !1;
  const e = navigator.userAgent.toLowerCase(), t = (navigator.platform || "").toLowerCase();
  return !!(/iphone|ipad|ipod/.test(e) || t.includes("mac") || /macintosh/.test(e) || t === "macintel" && navigator.maxTouchPoints > 1);
}
function _c({
  onSuccess: e,
  onError: t,
  className: s = "",
  variant: o = "default",
  size: n = "md",
  disabled: a = !1,
  hideOnNonApple: l = !0
}) {
  const { signIn: i, isLoading: c, isInitialized: u } = Mc(), [f] = L(() => ao());
  if (l && !f)
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
      }[o]} ${m[n]} ${s}`,
      onClick: h,
      disabled: a || !u || c,
      "aria-label": "Sign in with Apple",
      children: [
        c ? /* @__PURE__ */ r($, { size: "sm" }) : /* @__PURE__ */ r(
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
function Dc(e) {
  return e.replace(/-/g, "+").replace(/_/g, "/");
}
function Ct(e) {
  de(typeof e == "string" && e.length > 0, "Expected base64url string");
  const t = Dc(e), s = t + "=".repeat((4 - t.length % 4) % 4), o = atob(s), n = new Uint8Array(o.length);
  for (let a = 0; a < o.length; a++) n[a] = o.charCodeAt(a);
  return n.buffer;
}
function $e(e) {
  const t = new Uint8Array(e);
  let s = "";
  for (let n = 0; n < t.length; n++) s += String.fromCharCode(t[n]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function io(e) {
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
  const s = t.rp, o = t.user;
  de(typeof s.name == "string", "Missing rp.name"), de(typeof o.id == "string", "Missing user.id"), de(typeof o.name == "string", "Missing user.name"), de(typeof o.displayName == "string", "Missing user.displayName");
  const n = Array.isArray(t.excludeCredentials) ? t.excludeCredentials.map(io) : void 0, a = Array.isArray(t.pubKeyCredParams) ? t.pubKeyCredParams.map((i) => ({
    type: i.type,
    alg: i.alg
  })) : [], l = {
    challenge: Ct(t.challenge),
    rp: {
      name: s.name,
      id: typeof s.id == "string" ? s.id : void 0
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
    excludeCredentials: n,
    extensions: typeof t.extensions == "object" && t.extensions !== null ? t.extensions : void 0
  };
  return l.hints = ["client-device"], l;
}
function Cs(e) {
  de(e && typeof e == "object", "Missing request options");
  const t = e.publicKey;
  de(t && typeof t == "object", "Missing request options.publicKey"), de(typeof t.challenge == "string", "Missing request challenge");
  const s = Array.isArray(t.allowCredentials) ? t.allowCredentials.map(io) : void 0, o = {
    challenge: Ct(t.challenge),
    rpId: typeof t.rpId == "string" ? t.rpId : void 0,
    timeout: typeof t.timeout == "number" ? t.timeout : void 0,
    userVerification: typeof t.userVerification == "string" ? t.userVerification : void 0,
    allowCredentials: s,
    extensions: typeof t.extensions == "object" && t.extensions !== null ? t.extensions : void 0
  };
  return o.hints = ["client-device"], o;
}
function et(e) {
  const t = $e(e.rawId), s = e.response, n = { ...{
    clientDataJSON: $e(s.clientDataJSON)
  } };
  if ("attestationObject" in s) {
    const a = s;
    if (n.attestationObject = $e(a.attestationObject), typeof a.getTransports == "function")
      try {
        n.transports = a.getTransports();
      } catch {
      }
  }
  if ("authenticatorData" in s) {
    const a = s;
    n.authenticatorData = $e(a.authenticatorData), n.signature = $e(a.signature), a.userHandle && (n.userHandle = $e(a.userHandle));
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
function Uc() {
  if (typeof window < "u") {
    const e = window.location?.hostname, t = e === "localhost" || e === "127.0.0.1" || e?.endsWith(".localhost");
    if (!(window.isSecureContext === !0) && !t)
      return !1;
  }
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator < "u" && typeof navigator.credentials < "u";
}
function Fc(e) {
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
function co() {
  const { config: e, _internal: t } = ne(), [s, o] = L(!1), [n, a] = L(null), l = V(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      // Needed for authenticated registration endpoints when cookie auth is disabled
      getAccessToken: t?.getAccessToken
    }),
    [t?.getAccessToken, e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), i = T(() => a(null), []), c = Uc(), u = T(
    async (E) => {
      if (!c) {
        const A = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(A), A;
      }
      o(!0), a(null);
      try {
        const A = await l.post(
          "/webauthn/auth/options",
          { email: E?.email }
        ), C = Cs(A.options), N = await navigator.credentials.get({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey authentication returned no credential");
        const x = await l.post("/webauthn/auth/verify", {
          challengeId: A.challengeId,
          credential: et(N)
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), x;
      } catch (A) {
        const N = tt(A) ?? j(A, "Unable to sign in with passkey. Please try again.");
        throw a(N), N;
      } finally {
        o(!1);
      }
    },
    [l, e.callbacks, t, c]
  ), f = T(
    async (E) => {
      if (!c) {
        const A = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(A), A;
      }
      o(!0), a(null);
      try {
        const A = await l.post(
          "/webauthn/register/options",
          {}
        ), C = Qt(A.options), N = await navigator.credentials.create({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey registration returned no credential");
        const x = await l.post("/webauthn/register/verify", {
          challengeId: A.challengeId,
          credential: et(N),
          label: E?.label
        });
        if (!x.success)
          throw new Error("Passkey registration failed");
        return { credentialId: x.credentialId, label: x.label };
      } catch (A) {
        const N = tt(A) ?? j(A, "Unable to register passkey. Please try again.");
        throw a(N), N;
      } finally {
        o(!1);
      }
    },
    [l, c]
  ), h = T(
    async (E) => {
      if (!c) {
        const A = {
          code: "VALIDATION_ERROR",
          message: "Passkeys are not supported in this browser"
        };
        throw a(A), A;
      }
      o(!0), a(null);
      try {
        const A = await l.post(
          "/webauthn/signup/options",
          {}
        ), C = Qt(A.options), N = await navigator.credentials.create({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey signup returned no credential");
        const x = await l.post("/webauthn/signup/verify", {
          challengeId: A.challengeId,
          credential: et(N),
          email: E?.email,
          name: E?.name,
          label: E?.label
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), x;
      } catch (A) {
        const N = tt(A) ?? j(A, "Unable to sign up with passkey. Please try again.");
        throw a(N), N;
      } finally {
        o(!1);
      }
    },
    [l, e.callbacks, t, c]
  ), m = T(async () => {
    if (!c) {
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
    return E ? y(A) : w(A);
  }, [l, e.callbacks, t, c]), y = T(
    async (E) => {
      try {
        const A = await l.post(
          "/webauthn/auth/options",
          {}
        ), C = Cs(A.options), N = await navigator.credentials.get({
          publicKey: C
        });
        if (!N)
          throw new Error("Passkey authentication returned no credential");
        const x = await l.post("/webauthn/auth/verify", {
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
        const R = tt(A) ?? j(A, "Unable to sign in with passkey. Please try again.");
        throw a(R), R;
      } finally {
        o(!1);
      }
    },
    [l, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), w = T(
    async (E) => {
      try {
        return await p(E);
      } catch (A) {
        if (A instanceof Error && (A.name === "InvalidStateError" || A.name === "NotAllowedError"))
          return y(E);
        if (!Fc(A)) {
          const x = tt(A) ?? j(A, "Unable to create passkey. Please try again.");
          throw a(x), x;
        }
        throw A;
      } finally {
        o(!1);
      }
    },
    [l, e.callbacks, t]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), p = T(
    async (E) => {
      const A = await l.post(
        "/webauthn/signup/options",
        {}
      ), C = Qt(A.options), N = await navigator.credentials.create({
        publicKey: C
      });
      if (!N)
        throw new Error("Passkey signup returned no credential");
      const x = await l.post("/webauthn/signup/verify", {
        challengeId: A.challengeId,
        credential: et(N)
      });
      return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), t?.handleLoginSuccess(x.user, x.tokens), E(), x;
    },
    [l, e.callbacks, t]
  );
  return {
    isSupported: c,
    isLoading: s,
    error: n,
    clearError: i,
    continueWithPasskey: m,
    authenticatePasskey: u,
    registerPasskey: f,
    signupWithPasskey: h
  };
}
function Oc({
  onSuccess: e,
  className: t = "",
  children: s,
  disabled: o
}) {
  const { continueWithPasskey: n, isLoading: a, isSupported: l } = co(), i = o || !l || a;
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
      disabled: i,
      "aria-disabled": i,
      children: [
        a ? /* @__PURE__ */ r($, { size: "sm" }) : /* @__PURE__ */ r("span", { className: "cedros-social-icon", "aria-hidden": "true", children: /* @__PURE__ */ r(Wc, {}) }),
        /* @__PURE__ */ r("span", { children: s ?? "Continue with Passkey" })
      ]
    }
  );
}
function Wc() {
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
function Vr({ onSuccess: e, className: t = "", defaultTab: s = "login" }) {
  const { config: o, socialButtonOrder: n } = ne(), [a, l] = L(s), [i, c] = L("form"), [u, f] = L(() => ns()), [h] = L(() => ao());
  W(() => {
    const R = () => f(ns());
    return R(), window.addEventListener("load", R), window.addEventListener("focus", R), () => {
      window.removeEventListener("load", R), window.removeEventListener("focus", R);
    };
  }, []);
  const m = o.forms?.forgotPassword?.mode ?? (o.features?.instantLink ? "instantLink" : "reset"), y = T(
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
      l(v), document.getElementById(`cedros-tab-${v}`)?.focus();
    },
    [a]
  ), w = o.features ?? {
    email: !0,
    google: !0,
    apple: !0,
    solana: !0,
    webauthn: !0
  }, p = w.email !== !1, E = w.google !== !1 && o.googleClientId, A = w.apple !== !1 && o.appleClientId && h, C = w.solana !== !1 && u, N = w.webauthn !== !1, x = p && (E || A || C || N);
  return i === "forgotPassword" ? /* @__PURE__ */ r("div", { className: `cedros-login-form ${t}`, children: /* @__PURE__ */ r(Tc, { mode: m, onCancel: () => c("form") }) }) : /* @__PURE__ */ d("div", { className: `cedros-login-form ${t}`, children: [
    (N || E || A || C) && (() => {
      const R = {
        webauthn: N ? /* @__PURE__ */ r(Oc, { onSuccess: e }) : null,
        google: E ? /* @__PURE__ */ r(ra, { onSuccess: e }) : null,
        apple: A ? /* @__PURE__ */ r(_c, { onSuccess: e }) : null,
        solana: C ? /* @__PURE__ */ r(sa, { onSuccess: e }) : null
      };
      return /* @__PURE__ */ r("div", { className: "cedros-social-buttons", children: (n ?? ["webauthn", "google", "apple", "solana"]).map((k) => {
        const v = R[k];
        return v ? /* @__PURE__ */ r(Yo, { children: v }, k) : null;
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
            onClick: () => l("login"),
            onKeyDown: y,
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
            onClick: () => l("register"),
            onKeyDown: y,
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
            ea,
            {
              onSuccess: e,
              onSwitchToRegister: () => l("register"),
              onForgotPassword: () => c("forgotPassword")
            }
          ) : /* @__PURE__ */ r(
            ta,
            {
              onSuccess: e,
              onSwitchToLogin: () => l("login")
            }
          )
        }
      )
    ] })
  ] });
}
class qc extends Zo {
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
    const { hasError: t, error: s, errorInfo: o } = this.state, { children: n, fallback: a, showDetails: l = !1 } = this.props;
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
      l && s && /* @__PURE__ */ d("details", { className: "cedros-error-boundary-details", children: [
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
function Zu({ className: e = "", title: t = "Sign in to your account" }) {
  const { isModalOpen: s, closeModal: o } = ne(), n = J(null), a = J(null), l = J(o);
  if (W(() => {
    l.current = o;
  }, [o]), W(() => {
    if (!s) return;
    a.current = document.activeElement, n.current?.focus();
    const c = (f) => {
      if (f.key === "Escape" && l.current(), f.key === "Tab" && n.current) {
        const h = n.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ), m = h[0], y = h[h.length - 1];
        f.shiftKey && document.activeElement === m ? (f.preventDefault(), y?.focus()) : !f.shiftKey && document.activeElement === y && (f.preventDefault(), m?.focus());
      }
    };
    document.addEventListener("keydown", c);
    const u = document.body.style.overflow;
    return document.body.style.overflow = "hidden", () => {
      document.removeEventListener("keydown", c), document.body.style.overflow = u, a.current instanceof HTMLElement && a.current.focus();
    };
  }, [s]), !s) return null;
  const i = (c) => {
    c.target === c.currentTarget && o();
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
            /* @__PURE__ */ r("div", { className: "cedros-modal-content", children: /* @__PURE__ */ r(qc, { children: /* @__PURE__ */ r(Vr, { onSuccess: o }) }) })
          ]
        }
      )
    }
  );
}
function Xu({
  token: e,
  onSuccess: t,
  onLoginClick: s,
  className: o = ""
}) {
  const [n, a] = L(""), [l, i] = L(""), [c, u] = L(null), { resetPassword: f, isLoading: h, isSuccess: m, error: y, clearError: w } = zr(), p = n === l, E = c?.isValid && p && n.length > 0, A = async (C) => {
    if (C.preventDefault(), !!E)
      try {
        await f(e, n), t?.();
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
    /* @__PURE__ */ r(se, { error: y, onDismiss: w }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      ge,
      {
        label: "New password",
        value: n,
        onChange: (C) => {
          a(C.target.value), u(Bt(C.target.value));
        },
        showStrengthMeter: !0,
        onValidationChange: u,
        disabled: h,
        autoComplete: "new-password",
        error: c && !c.isValid ? Object.values(c.errors).find(Boolean) : void 0
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-form-field", children: /* @__PURE__ */ r(
      ge,
      {
        label: "Confirm password",
        value: l,
        onChange: (C) => i(C.target.value),
        disabled: h,
        autoComplete: "new-password",
        error: l && !p ? "Passwords do not match" : void 0
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
function Pr({ org: e, size: t = "lg", className: s = "" }) {
  const o = An(e.logoUrl), n = t === "lg" ? "cedros-org-avatar-lg" : "", a = ["cedros-org-avatar", n, s].filter(Boolean).join(" "), l = ["cedros-org-avatar-placeholder", n, s].filter(Boolean).join(" ");
  return o ? /* @__PURE__ */ r(
    "img",
    {
      src: o,
      alt: e.name,
      className: a,
      referrerPolicy: "no-referrer"
    }
  ) : /* @__PURE__ */ r("div", { className: l, children: e.name[0]?.toUpperCase() || "?" });
}
function Ju({
  orgs: e,
  activeOrg: t,
  isLoading: s = !1,
  onSelect: o,
  onCreateClick: n,
  className: a = "",
  placeholder: l = "Select organization"
}) {
  const [i, c] = L(!1), u = J(null);
  W(() => {
    const y = (w) => {
      u.current && !u.current.contains(w.target) && c(!1);
    };
    return document.addEventListener("mousedown", y), () => document.removeEventListener("mousedown", y);
  }, []), W(() => {
    const y = (w) => {
      w.key === "Escape" && c(!1);
    };
    if (i)
      return document.addEventListener("keydown", y), () => document.removeEventListener("keydown", y);
  }, [i]);
  const f = T(
    (y) => {
      o(y), c(!1);
    },
    [o]
  ), h = T(() => {
    c(!1), n?.();
  }, [n]), m = T(() => {
    c((y) => !y);
  }, []);
  return s ? /* @__PURE__ */ d(
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
        onClick: m,
        "aria-haspopup": "listbox",
        "aria-expanded": i,
        children: [
          t ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Pr, { org: t, size: "sm" }),
            /* @__PURE__ */ r("span", { className: "cedros-org-selector-name", children: t.name }),
            /* @__PURE__ */ r(xs, { role: t.membership.role })
          ] }) : /* @__PURE__ */ r("span", { className: "cedros-org-selector-placeholder", children: l }),
          /* @__PURE__ */ r(jc, { isOpen: i })
        ]
      }
    ),
    i && /* @__PURE__ */ d("div", { className: "cedros-org-selector-dropdown", role: "listbox", children: [
      e.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-org-selector-empty", children: "No organizations" }) : /* @__PURE__ */ r("ul", { className: "cedros-org-selector-list", children: e.map((y) => /* @__PURE__ */ r("li", { children: /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: `cedros-org-selector-item ${y.id === t?.id ? "cedros-org-selector-item-active" : ""}`,
          onClick: () => f(y.id),
          role: "option",
          "aria-selected": y.id === t?.id,
          children: [
            /* @__PURE__ */ r(Pr, { org: y, size: "sm" }),
            /* @__PURE__ */ r("span", { className: "cedros-org-selector-item-name", children: y.name }),
            /* @__PURE__ */ r(xs, { role: y.membership.role }),
            y.id === t?.id && /* @__PURE__ */ r(zc, {})
          ]
        }
      ) }, y.id)) }),
      n && /* @__PURE__ */ d(X, { children: [
        /* @__PURE__ */ r("div", { className: "cedros-org-selector-divider" }),
        /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-org-selector-create",
            onClick: h,
            children: [
              /* @__PURE__ */ r(Vc, {}),
              /* @__PURE__ */ r("span", { children: "Create organization" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function xs({ role: e }) {
  return /* @__PURE__ */ r("span", { className: `cedros-org-role cedros-org-role-${e}`, children: e });
}
function jc({ isOpen: e }) {
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
function zc() {
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
function Vc() {
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
function Hc() {
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
function $c() {
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
function Gc() {
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
function Qc({
  orgs: e,
  activeOrg: t,
  isLoading: s,
  onSelect: o,
  onCreateClick: n
}) {
  return s ? /* @__PURE__ */ d("div", { className: "cedros-org-switcher-loading", children: [
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
          /* @__PURE__ */ r(Pr, { org: a }),
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
          a.id === t?.id && /* @__PURE__ */ r($c, {})
        ]
      }
    ) }, a.id)) }),
    n && /* @__PURE__ */ d("button", { type: "button", className: "cedros-org-switcher-create", onClick: n, children: [
      /* @__PURE__ */ r(Gc, {}),
      /* @__PURE__ */ r("span", { children: "Create new organization" })
    ] })
  ] });
}
function Kc({ isLoading: e, onSubmit: t, onCancel: s }) {
  const [o, n] = L(""), [a, l] = L(""), [i, c] = L(null), u = T((h) => {
    n(h);
    const m = h.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 50);
    l(m);
  }, []), f = T(
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
      } catch (m) {
        c(m.message || "Failed to create organization");
      }
    },
    [o, a, t]
  );
  return /* @__PURE__ */ d("form", { className: "cedros-org-create-form", onSubmit: f, children: [
    i && /* @__PURE__ */ r(se, { error: i }),
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
            onChange: (h) => l(h.target.value.toLowerCase()),
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
          children: e ? /* @__PURE__ */ r($, { size: "sm" }) : "Create Organization"
        }
      )
    ] })
  ] });
}
function eh({
  isOpen: e,
  onClose: t,
  orgs: s,
  activeOrg: o,
  isLoading: n = !1,
  error: a,
  onSelect: l,
  onCreate: i,
  className: c = ""
}) {
  return e ? /* @__PURE__ */ r(
    Yc,
    {
      onClose: t,
      orgs: s,
      activeOrg: o,
      isLoading: n,
      error: a,
      onSelect: l,
      onCreate: i,
      className: c
    }
  ) : null;
}
function Yc({
  onClose: e,
  orgs: t,
  activeOrg: s,
  isLoading: o = !1,
  error: n,
  onSelect: a,
  onCreate: l,
  className: i
}) {
  const [c, u] = L("list"), f = J(null), h = J(null);
  W(() => (h.current = document.activeElement, f.current?.querySelector(".cedros-modal-close")?.focus(), () => {
    h.current?.focus();
  }), []), W(() => {
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
  ), y = T(
    (p) => {
      a(p), e();
    },
    [a, e]
  ), w = T(
    async (p) => {
      await l?.(p), e();
    },
    [l, e]
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
          /* @__PURE__ */ r("h2", { id: "org-switcher-title", className: "cedros-modal-title", children: c === "list" ? "Switch Organization" : "Create Organization" }),
          /* @__PURE__ */ r("button", { type: "button", className: "cedros-modal-close", onClick: e, "aria-label": "Close", children: /* @__PURE__ */ r(Hc, {}) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-modal-body", children: [
          n && /* @__PURE__ */ r(se, { error: n }),
          c === "list" ? /* @__PURE__ */ r(
            Qc,
            {
              orgs: t,
              activeOrg: s,
              isLoading: o,
              onSelect: y,
              onCreateClick: l ? () => u("create") : void 0
            }
          ) : /* @__PURE__ */ r(
            Kc,
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
function Zc({
  sessions: e,
  isLoading: t = !1,
  error: s,
  onRevokeAll: o,
  className: n = ""
}) {
  const [a, l] = L(!1), [i, c] = L(!1), u = J(null), f = V(() => e.filter((m) => !m.isCurrent).length, [e]), h = T(async () => {
    if (!o) return;
    const m = e.filter((w) => !w.isCurrent).length;
    if (!(m === 0 || !window.confirm(
      `Are you sure you want to sign out of ${m} other device(s)? This will log you out everywhere except this browser.`
    ))) {
      l(!0), c(!1);
      try {
        await o(), c(!0), u.current !== null && window.clearTimeout(u.current), u.current = window.setTimeout(() => {
          c(!1), u.current = null;
        }, 3e3);
      } finally {
        l(!1);
      }
    }
  }, [o, e]);
  return W(() => () => {
    u.current !== null && (window.clearTimeout(u.current), u.current = null);
  }, []), t && e.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-session-list cedros-session-list-loading ${n}`, children: [
    /* @__PURE__ */ r($, {}),
    /* @__PURE__ */ r("span", { children: "Loading sessions..." })
  ] }) : s ? /* @__PURE__ */ r("div", { className: `cedros-session-list ${n}`, children: /* @__PURE__ */ r(se, { error: s }) }) : e.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-session-list cedros-session-list-empty ${n}`, children: /* @__PURE__ */ r("p", { children: "No active sessions found." }) }) : /* @__PURE__ */ d("div", { className: `cedros-session-list ${n}`, children: [
    i && /* @__PURE__ */ d("div", { className: "cedros-session-success", role: "status", children: [
      /* @__PURE__ */ r(sl, {}),
      /* @__PURE__ */ r("span", { children: "All other sessions have been revoked." })
    ] }),
    /* @__PURE__ */ r("ul", { className: "cedros-session-items", children: e.map((m) => /* @__PURE__ */ r(Xc, { session: m }, m.id)) }),
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
function Xc({ session: e }) {
  const t = Jc(e.userAgent), s = tl(e.expiresAt);
  return /* @__PURE__ */ d("li", { className: `cedros-session-item ${e.isCurrent ? "cedros-session-item-current" : ""}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-session-item-icon", children: /* @__PURE__ */ r(rl, { userAgent: e.userAgent }) }),
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
          el(e.createdAt)
        ] }),
        s && /* @__PURE__ */ r("span", { className: "cedros-session-expiring", children: "Expires soon" })
      ] })
    ] })
  ] });
}
function Jc(e) {
  if (!e)
    return { browser: "Unknown browser", os: "Unknown device" };
  let t = "Unknown browser";
  e.includes("Chrome") && !e.includes("Edg") ? t = "Chrome" : e.includes("Safari") && !e.includes("Chrome") ? t = "Safari" : e.includes("Firefox") ? t = "Firefox" : e.includes("Edg") && (t = "Edge");
  let s = "Unknown device";
  return e.includes("Windows") ? s = "Windows" : e.includes("Mac") ? s = "macOS" : e.includes("Linux") ? s = "Linux" : e.includes("iPhone") || e.includes("iPad") ? s = "iOS" : e.includes("Android") && (s = "Android"), { browser: t, os: s };
}
function el(e) {
  const t = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - t.getTime(), n = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), l = Math.floor(o / (1e3 * 60 * 60 * 24));
  return n < 1 ? "just now" : n < 60 ? `${n} minute${n > 1 ? "s" : ""} ago` : a < 24 ? `${a} hour${a > 1 ? "s" : ""} ago` : l < 7 ? `${l} day${l > 1 ? "s" : ""} ago` : t.toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function tl(e) {
  const t = new Date(e), s = /* @__PURE__ */ new Date(), o = 3600 * 1e3;
  return t.getTime() - s.getTime() < o;
}
function rl({ userAgent: e }) {
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
function sl() {
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
function nl({
  words: e,
  onConfirm: t,
  className: s = ""
}) {
  const [o, n] = L(!1), [a, l] = L(!1), i = J(null), c = Sc(e), u = T(async () => {
    try {
      await navigator.clipboard.writeText(e.join(" ")), n(!0), i.current !== null && window.clearTimeout(i.current), i.current = window.setTimeout(() => n(!1), 2e3);
    } catch {
    }
  }, [e]);
  W(() => () => {
    i.current !== null && (window.clearTimeout(i.current), i.current = null);
  }, []);
  const f = T(() => {
    a && t();
  }, [a, t]);
  return /* @__PURE__ */ d("div", { className: `cedros-recovery-phrase-display ${s}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-recovery-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-recovery-title", children: "Recovery Phrase" }),
      /* @__PURE__ */ r("p", { className: "cedros-recovery-warning", children: "Write down these 12 words in order and store them securely. This is the only way to recover your wallet if you lose access." })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-recovery-grid", children: c.map((h, m) => /* @__PURE__ */ r("div", { className: "cedros-word-group", children: h.map((y, w) => {
      const p = m * 4 + w + 1;
      return /* @__PURE__ */ d("div", { className: "cedros-word-item", children: [
        /* @__PURE__ */ d("span", { className: "cedros-word-number", children: [
          p,
          "."
        ] }),
        /* @__PURE__ */ r("span", { className: "cedros-word-text", children: y })
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
            onChange: (h) => l(h.target.checked),
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
function ol({
  onSubmit: e,
  onCancel: t,
  isSubmitting: s = !1,
  error: o,
  className: n = ""
}) {
  const [a, l] = L(Array(pe).fill("")), [i, c] = L(null), [u, f] = L([]), [h, m] = L(null), y = yn(), w = J(null), p = T(
    (g, k) => {
      const v = [...a];
      if (v[g] = k.toLowerCase().trim(), l(v), k.length > 0) {
        const b = xc(k, 5);
        f(b);
      } else
        f([]);
      m(null);
    },
    [a]
  ), E = T((g) => {
    c(g), f([]);
  }, []), A = T(
    (g) => {
      const k = a[g];
      k && !ht(k) && m(`Word ${g + 1} is not in the wordlist`), w.current !== null && window.clearTimeout(w.current), w.current = window.setTimeout(() => {
        i === g && f([]);
      }, 200);
    },
    [a, i]
  );
  W(() => () => {
    w.current !== null && (window.clearTimeout(w.current), w.current = null);
  }, []);
  const C = T(
    (g) => {
      if (i !== null) {
        const k = [...a];
        k[i] = g, l(k), f([]), document.querySelector(
          `[data-word-index="${i + 1}"]`
        )?.focus();
      }
    },
    [i, a]
  ), N = T((g) => {
    const k = g.clipboardData.getData("text"), v = Lc(k);
    v.length === pe && (g.preventDefault(), l(v), m(null));
  }, []), x = T(
    (g) => {
      if (g.preventDefault(), a.filter((b) => !b).length > 0) {
        m(`Please enter all ${pe} words`);
        return;
      }
      const v = a.map((b, P) => ({ word: b, index: P + 1 })).filter(({ word: b }) => !ht(b));
      if (v.length > 0) {
        m(`Invalid words: ${v.map((b) => `#${b.index}`).join(", ")}`);
        return;
      }
      if (!oo(a)) {
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
      className: `cedros-recovery-phrase-input ${n}`,
      onSubmit: x,
      onPaste: N,
      children: [
        /* @__PURE__ */ d("div", { className: "cedros-recovery-input-header", children: [
          /* @__PURE__ */ r("h3", { className: "cedros-recovery-input-title", children: "Enter Recovery Phrase" }),
          /* @__PURE__ */ r("p", { className: "cedros-recovery-input-description", children: "Enter your 12-word recovery phrase. You can paste the entire phrase at once." })
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-word-inputs", children: Array.from({ length: pe }, (g, k) => /* @__PURE__ */ d("div", { className: "cedros-word-input-wrapper", children: [
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
              disabled: s,
              "aria-label": `Word ${k + 1}`
            }
          )
        ] }, k)) }),
        i !== null && u.length > 0 && /* @__PURE__ */ r("div", { className: "cedros-suggestions", role: "listbox", id: `${y}-suggestions`, children: u.map((g) => /* @__PURE__ */ r(
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
function th({ capabilities: e, className: t = "" }) {
  if (e.allSupported)
    return null;
  const s = $o(e), o = Go();
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
const al = ["share_c_only", "full_seed", "none"];
function il(e) {
  return e && al.includes(e) ? e : "share_c_only";
}
const cl = {
  walletEnabled: !1,
  recoveryMode: "share_c_only",
  unlockTtlSeconds: 900,
  isLoading: !1,
  error: null,
  refetch: async () => {
  }
};
function lo() {
  const e = We(), [t, s] = L(null), [o, n] = L(!!e), [a, l] = L(null), i = V(() => e ? new ce({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts
  }) : null, [e]), c = T(async () => {
    if (i) {
      n(!0), l(null);
      try {
        const u = await i.get("/discovery");
        u.wallet ? s({
          enabled: u.wallet.enabled,
          recoveryMode: il(u.wallet.recoveryMode),
          unlockTtlSeconds: u.wallet.unlockTtlSeconds
        }) : s({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } catch (u) {
        const f = u instanceof Error ? u.message : "Failed to fetch wallet config";
        l(f), s({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } finally {
        n(!1);
      }
    }
  }, [i]);
  return W(() => {
    i && c();
  }, [i, c]), e ? {
    walletEnabled: t?.enabled ?? !1,
    recoveryMode: t?.recoveryMode ?? "share_c_only",
    unlockTtlSeconds: t?.unlockTtlSeconds ?? 900,
    isLoading: o,
    error: a,
    refetch: c
  } : cl;
}
function ll() {
  const { user: e } = ne(), { enroll: t } = Ye(), { recoveryMode: s } = lo(), [o, n] = L({ step: "idle" }), [a, l] = L(!1), i = J([]), c = T(() => {
    un(...i.current), i.current = [];
  }, []);
  W(() => () => {
    c();
  }, [c]);
  const u = T(
    async (w, p, E, A) => {
      n({ step: "generating_seed" });
      const C = Qo();
      i.current.push(C), n({ step: "splitting_shares" });
      const { shareA: N, shareB: x, shareC: R } = Zn(C);
      i.current.push(N, x, R), n({ step: "encrypting_shares" });
      const g = await hn(N, fn(p)), k = Kn(C), v = Yn(k);
      n({ step: "uploading" });
      const b = {
        solanaPubkey: v,
        shareAAuthMethod: w,
        shareACiphertext: g.ciphertext,
        shareANonce: g.nonce,
        // Share B is now plaintext (SSS math protects it)
        shareB: Se(x)
      };
      if (w === "password") {
        if (!E) throw new Error("KDF salt required for password method");
        b.shareAKdfSalt = Se(E), b.shareAKdfParams = ot;
      }
      if (w === "passkey" && A && (b.prfSalt = A), await t(b), s === "none")
        c(), n({
          step: "complete",
          solanaPubkey: v
        });
      else {
        const P = s === "full_seed" ? Ec(C) : kc(Oe(R));
        n({
          step: "showing_recovery",
          recoveryPhrase: P,
          solanaPubkey: v
        });
      }
    },
    [t, s, c]
  ), f = T(
    async (w) => {
      if (!e) {
        n({ step: "error", error: "User not authenticated" });
        return;
      }
      l(!0), c();
      try {
        const p = mn(), E = await Sn(w, p, ot);
        i.current.push(E), await u("password", E, p);
      } catch (p) {
        n({
          step: "error",
          error: p instanceof Error ? p.message : "Enrollment failed"
        });
      } finally {
        l(!1);
      }
    },
    [e, c, u]
  ), h = T(async () => {
    if (!e) {
      n({ step: "error", error: "User not authenticated" });
      return;
    }
    l(!0), c();
    try {
      const w = pn(), p = Se(w);
      n({ step: "encrypting_shares" });
      const A = (await Ir(p)).prfOutput;
      i.current.push(A);
      const C = await gn(A, w);
      i.current.push(C), await u("passkey", C, void 0, p);
    } catch (w) {
      n({
        step: "error",
        error: w instanceof Error ? w.message : "Enrollment failed"
      });
    } finally {
      l(!1);
    }
  }, [e, c, u]), m = T(() => {
    const w = o.solanaPubkey;
    c(), n({
      step: "complete",
      solanaPubkey: w
    });
  }, [o.solanaPubkey, c]), y = T(() => {
    c(), n({ step: "idle" }), l(!1);
  }, [c]);
  return {
    state: o,
    startEnrollmentWithPassword: f,
    startEnrollmentWithPasskey: h,
    confirmRecoveryPhrase: m,
    cancel: y,
    isEnrolling: a
  };
}
function dl() {
  const { config: e, _internal: t } = ne(), [s, o] = L(!1), [n, a] = L(null), l = V(
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
      async (c) => {
        o(!0), a(null);
        try {
          await l.post("/set-password", { password: c });
        } catch (u) {
          const f = j(u, "Failed to set password");
          throw a(f), f;
        } finally {
          o(!1);
        }
      },
      [l]
    ),
    isLoading: s,
    error: n
  };
}
function ul(e) {
  return e.includes("email") ? "password" : e.includes("webauthn") ? "passkey" : "set-password";
}
function hl({
  onComplete: e,
  onCancel: t,
  className: s = ""
}) {
  const { user: o } = ne(), {
    state: n,
    startEnrollmentWithPassword: a,
    startEnrollmentWithPasskey: l,
    confirmRecoveryPhrase: i,
    cancel: c,
    isEnrolling: u
  } = ll(), { setPassword: f, isLoading: h } = dl(), m = o ? ul(o.authMethods) : "password", [y, w] = L(""), [p, E] = L(""), [A, C] = L(null);
  W(() => {
    w(""), E(""), C(null);
  }, [o?.id]);
  const N = T(
    async (b) => {
      b.preventDefault(), C(null), await a(y);
    },
    [y, a]
  ), x = T(
    async (b) => {
      if (b.preventDefault(), y !== p) {
        C("Passwords do not match");
        return;
      }
      const P = Bt(y);
      if (!P.isValid) {
        const S = Object.values(P.errors)[0];
        C(S ?? "Password does not meet requirements");
        return;
      }
      C(null);
      try {
        await f(y), await a(y);
      } catch {
      }
    },
    [y, p, f, a]
  ), R = T(async () => {
    await l();
  }, [l]), g = T(() => {
    i(), n.solanaPubkey && e?.(n.solanaPubkey);
  }, [i, n.solanaPubkey, e]), k = T(() => {
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
  ] }) }) : n.step === "showing_recovery" && n.recoveryPhrase ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ r(nl, { words: n.recoveryPhrase, onConfirm: g }) }) : n.step === "complete" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-complete", children: [
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
          onClick: k,
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
      m === "password" && /* @__PURE__ */ r("p", { children: "Enter your account password to secure your wallet." }),
      m === "passkey" && /* @__PURE__ */ r("p", { children: "Authenticate with your passkey to secure your wallet." }),
      m === "set-password" && /* @__PURE__ */ r("p", { children: "Set a password for your account to secure your wallet." })
    ] }),
    m === "password" && /* @__PURE__ */ d("form", { onSubmit: N, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ r(
        ge,
        {
          label: "Account Password",
          value: y,
          onChange: (b) => w(b.target.value),
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
            disabled: v || !y,
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
        ge,
        {
          label: "New Password",
          value: y,
          onChange: (b) => w(b.target.value),
          showStrengthMeter: !0,
          disabled: v,
          required: !0,
          minLength: 8,
          placeholder: "Choose a strong password"
        }
      ),
      /* @__PURE__ */ r(
        ge,
        {
          label: "Confirm Password",
          value: p,
          onChange: (b) => E(b.target.value),
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
            disabled: v || !y || !p,
            children: v ? "Creating..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function fl() {
  const { user: e } = ne(), { signTransaction: t } = Ye(), [s, o] = L(!1), [n, a] = L(null), l = T(
    async (c, u) => {
      if (!e) {
        const f = "User not authenticated";
        throw a(f), new Error(f);
      }
      o(!0), a(null);
      try {
        const f = {
          transaction: Se(c),
          ...u ? { credential: Ko(u) } : {}
        }, h = await t(f);
        return wn(h.signature);
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
    signTransaction: l,
    isSigning: s,
    error: n,
    clearError: i
  };
}
function ml() {
  const { getMaterial: e } = Ye(), [t, s] = L(!1), [o, n] = L(null), a = T(async () => {
    s(!0), n(null);
    try {
      const i = await e();
      if (!i)
        throw new Error("No wallet enrolled");
      if (i.shareAAuthMethod !== "passkey")
        throw new Error("Wallet is not configured for passkey authentication");
      if (!i.prfSalt)
        throw new Error("No PRF salt configured for wallet");
      const c = await Ir(i.prfSalt);
      try {
        return {
          type: "prfOutput",
          prfOutput: Se(c.prfOutput)
        };
      } finally {
        c.prfOutput.fill(0);
      }
    } catch (i) {
      const c = i instanceof Error ? i.message : "Passkey authentication failed";
      return n(c), null;
    } finally {
      s(!1);
    }
  }, [e]), l = T(() => n(null), []);
  return {
    getPasskeyCredential: a,
    isAuthenticating: t,
    error: o,
    clearError: l
  };
}
function pl({
  mode: e,
  isLoading: t = !1,
  error: s,
  onPrompt: o,
  onRetry: n,
  onCancel: a,
  title: l,
  description: i,
  className: c = ""
}) {
  const u = T(() => {
    t || o?.();
  }, [t, o]), f = T(() => {
    n?.();
  }, [n]), h = e === "register" ? "Set Up Passkey" : "Verify with Passkey", m = e === "register" ? "Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN." : "Use your passkey to unlock your wallet. You will be prompted for biometric verification.";
  return /* @__PURE__ */ d("div", { className: `cedros-passkey-prompt ${c}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-passkey-icon", children: t ? /* @__PURE__ */ r(wl, {}) : s ? /* @__PURE__ */ r(yl, {}) : /* @__PURE__ */ r(gl, {}) }),
    /* @__PURE__ */ r("h3", { className: "cedros-passkey-title", children: l ?? h }),
    /* @__PURE__ */ r("p", { className: "cedros-passkey-description", children: i ?? m }),
    s && /* @__PURE__ */ r("div", { className: "cedros-passkey-error", role: "alert", children: /* @__PURE__ */ r("p", { children: s }) }),
    /* @__PURE__ */ r("div", { className: "cedros-passkey-actions", children: s ? /* @__PURE__ */ d(X, { children: [
      n && /* @__PURE__ */ r(
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
function gl() {
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
function wl() {
  return /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
    /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
    /* @__PURE__ */ r("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function yl() {
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
function bl({
  onUnlock: e,
  onCancel: t,
  showCancel: s = !0,
  authMethod: o,
  className: n = ""
}) {
  ne();
  const { unlock: a, getMaterial: l, isLoading: i } = Ye(), { getPasskeyCredential: c, isAuthenticating: u } = ml(), [f, h] = L("idle"), [m, y] = L(o ?? null), [w, p] = L(""), [E, A] = L(null);
  W(() => {
    o !== void 0 && y(o);
  }, [o]);
  const C = m === "password", N = m === "passkey", x = T(async () => {
    if (h("credential"), A(null), !m)
      try {
        const S = await l();
        S ? y(S.shareAAuthMethod) : (A("No wallet enrolled"), h("error"));
      } catch (S) {
        A(S instanceof Error ? S.message : "Failed to get wallet info"), h("error");
      }
  }, [m, l]), R = T(
    async (S) => {
      S.preventDefault(), A(null), h("unlocking");
      try {
        let I;
        if (C)
          I = { type: "password", password: w };
        else
          throw new Error("Invalid auth method");
        await a(I), h("unlocked"), e?.();
      } catch (I) {
        A(I instanceof Error ? I.message : "Failed to unlock wallet"), h("error");
      }
    },
    [C, w, a, e]
  ), g = T(async () => {
    A(null), h("unlocking");
    try {
      const S = await c();
      if (!S) {
        h("credential");
        return;
      }
      await a(S), h("unlocked"), e?.();
    } catch (S) {
      A(S instanceof Error ? S.message : "Failed to unlock wallet"), h("error");
    }
  }, [c, a, e]), k = T(() => {
    p(""), h("idle"), A(null), t?.();
  }, [t]), v = T(() => {
    p(""), h("credential"), A(null);
  }, []), b = i || u, P = () => {
    switch (f) {
      case "idle":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-idle", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(Al, {}) }),
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
            ge,
            {
              label: "Password",
              value: w,
              onChange: (S) => p(S.target.value),
              disabled: b,
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
                disabled: b || w.length === 0,
                children: b ? "Unlocking..." : "Unlock"
              }
            ),
            s && /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: k,
                disabled: b,
                children: "Cancel"
              }
            )
          ] })
        ] }) : N ? /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-passkey", children: [
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Verify with Passkey" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Use your passkey to unlock your wallet." }),
          /* @__PURE__ */ r(
            pl,
            {
              mode: "authenticate",
              isLoading: b,
              error: E ?? void 0,
              onPrompt: g,
              onRetry: g,
              onCancel: s ? k : void 0
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
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(vl, {}) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Unlocked" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Your wallet is ready to sign transactions." })
        ] });
      case "error":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-error", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(kl, {}) }),
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
            s && /* @__PURE__ */ r(
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
  return /* @__PURE__ */ r("div", { className: `cedros-wallet-unlock ${n}`, children: P() });
}
function Al() {
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
function vl() {
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
function kl() {
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
function Nl() {
  const { recover: e, getShareBForRecovery: t } = Ye(), { recoveryMode: s } = lo(), [o, n] = L({ step: "idle" }), [a, l] = L(!1), i = J([]), c = T(() => {
    un(...i.current), i.current = [];
  }, []);
  W(() => () => {
    c();
  }, [c]);
  const u = T(
    async (h, m, y) => {
      l(!0), c();
      try {
        if (n({ step: "validating" }), !oo(h))
          throw new Error("Invalid recovery phrase. Please check your words.");
        let w;
        if (s === "share_c_only") {
          const v = Nc(h);
          i.current.push(v);
          const b = Se(v), P = await t({ shareC: b }), S = wn(P.shareB);
          i.current.push(S), w = lc(Oe(S), Oe(v)), i.current.push(w);
        } else
          w = Cc(h), i.current.push(w);
        const p = Kn(w), E = Yn(p), { shareA: A, shareB: C } = Zn(w);
        i.current.push(A, C), n({ step: "encrypting" });
        let N, x, R;
        if (m === "passkey") {
          const v = pn();
          R = Se(v);
          const b = await Ir(R);
          i.current.push(b.prfOutput), N = await gn(b.prfOutput, v), i.current.push(N);
        } else
          x = mn(), N = await Sn(y, x, ot), i.current.push(N);
        const g = await hn(A, fn(N));
        n({ step: "uploading" });
        const k = {
          solanaPubkey: E,
          shareAAuthMethod: m,
          shareACiphertext: g.ciphertext,
          shareANonce: g.nonce,
          shareB: Se(C)
        };
        m === "password" && (k.shareAKdfSalt = Se(x), k.shareAKdfParams = ot), m === "passkey" && (k.prfSalt = R), await e(k), c(), n({ step: "complete" });
      } catch (w) {
        c(), n({
          step: "error",
          error: w instanceof Error ? w.message : "Recovery failed"
        });
      } finally {
        l(!1);
      }
    },
    [e, t, s, c]
  ), f = T(() => {
    c(), n({ step: "idle" }), l(!1);
  }, [c]);
  return {
    state: o,
    startRecovery: u,
    cancel: f,
    isRecovering: a
  };
}
function El({
  onComplete: e,
  onCancel: t,
  className: s = "",
  defaultAuthMethod: o = "password"
}) {
  const { state: n, startRecovery: a, cancel: l, isRecovering: i } = Nl(), [c, u] = L([]), [f, h] = L(!1), [m, y] = L(o), [w, p] = L(""), [E, A] = L(""), [C, N] = L(null), x = T((b) => {
    u(b), h(!0);
  }, []), R = T(
    async (b) => {
      if (b.preventDefault(), N(null), m !== "passkey") {
        if (w !== E) {
          N("Passwords do not match");
          return;
        }
        if (m === "password" && w.length < 8) {
          N("Password must be at least 8 characters");
          return;
        }
      }
      await a(c, m, w);
    },
    [c, m, w, E, a]
  ), g = T(() => {
    l(), u([]), h(!1), p(""), A(""), t?.();
  }, [l, t]), k = T(() => {
    h(!1), p(""), A("");
  }, []), v = T(() => {
    e?.();
  }, [e]);
  return n.step === "validating" || n.step === "encrypting" || n.step === "uploading" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-progress", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(Cl, {}) }),
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
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(xl, {}) }),
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
  ] }) }) : n.step === "error" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-error", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(Sl, {}) }),
    /* @__PURE__ */ r("h3", { className: "cedros-wallet-recovery-title", children: "Recovery Failed" }),
    /* @__PURE__ */ r("p", { className: "cedros-wallet-recovery-description", children: n.error ?? "An error occurred during recovery. Please try again." }),
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary",
        onClick: g,
        children: "Start Over"
      }
    ) })
  ] }) }) : f ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ d("form", { className: "cedros-wallet-recovery-credential", onSubmit: R, children: [
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
            onChange: () => y("password"),
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
            onChange: () => y("passkey"),
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
            onChange: (b) => p(b.target.value),
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
            onChange: (b) => A(b.target.value),
            disabled: i,
            "aria-invalid": C ? "true" : void 0,
            placeholder: "Confirm your password"
          }
        ),
        C && /* @__PURE__ */ r("p", { className: "cedros-input-error", role: "alert", children: C })
      ] })
    ] }),
    m === "passkey" && /* @__PURE__ */ d("div", { className: "cedros-passkey-info", children: [
      /* @__PURE__ */ r(Ll, {}),
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
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-phrase", children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-wallet-recovery-title", children: "Recover Your Wallet" }),
      /* @__PURE__ */ r("p", { className: "cedros-wallet-recovery-description", children: "Enter your 12-word recovery phrase to restore your wallet." })
    ] }),
    /* @__PURE__ */ r(
      ol,
      {
        onSubmit: x,
        onCancel: g,
        isSubmitting: !1
      }
    )
  ] }) });
}
function Cl() {
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
function xl() {
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
function Sl() {
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
function Ll() {
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
function Bl({
  address: e,
  label: t = "Wallet Address",
  showCopy: s = !0,
  showExplorerLink: o = !0,
  allowReveal: n = !0,
  className: a = ""
}) {
  const l = We(), [i, c] = L(!1), [u, f] = L(null), [h, m] = L(!1), y = J(null), w = l?.config.solana?.network ?? "mainnet-beta", p = V(() => {
    const N = `https://explorer.solana.com/address/${e}`;
    return w === "mainnet-beta" ? N : `${N}?cluster=${encodeURIComponent(w)}`;
  }, [e, w]), E = n && e.length > 18, A = V(() => !E || h ? e : `${e.slice(0, 8)}...${e.slice(-8)}`, [e, E, h]), C = T(async () => {
    try {
      f(null), await navigator.clipboard.writeText(e), c(!0), y.current !== null && window.clearTimeout(y.current), y.current = window.setTimeout(() => {
        c(!1), y.current = null;
      }, 2e3);
    } catch (N) {
      c(!1), f(N instanceof Error ? N.message : "Copy failed");
    }
  }, [e]);
  return W(() => () => {
    y.current !== null && (window.clearTimeout(y.current), y.current = null);
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
        s && /* @__PURE__ */ r(
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
function Pl({
  status: e,
  publicKey: t,
  onLock: s,
  onEnroll: o,
  onUnlock: n,
  onRecover: a,
  showActions: l = !0,
  compact: i = !1,
  className: c = ""
}) {
  const u = e !== void 0, f = Lt(), h = u ? e : f.status, m = u ? t ?? null : f.solanaPubkey, y = u ? null : f.error, w = u ? () => {
  } : f.refresh, p = u ? () => {
  } : f.clearError, E = Rl(h, y);
  return i ? /* @__PURE__ */ d("div", { className: `cedros-wallet-status cedros-wallet-status-compact ${c}`, children: [
    /* @__PURE__ */ r(
      "span",
      {
        className: `cedros-wallet-status-dot cedros-wallet-status-${E.color}`,
        title: E.label
      }
    ),
    /* @__PURE__ */ r("span", { className: "cedros-wallet-status-label", children: E.label }),
    m && /* @__PURE__ */ r("span", { className: "cedros-wallet-status-pubkey", title: m, children: Tl(m) })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-wallet-status ${c}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-status-header", children: [
      /* @__PURE__ */ r(
        "div",
        {
          className: `cedros-wallet-status-icon cedros-wallet-status-icon-${E.color}`,
          children: /* @__PURE__ */ r(Il, { status: h })
        }
      ),
      /* @__PURE__ */ d("div", { className: "cedros-wallet-status-info", children: [
        /* @__PURE__ */ r("h4", { className: "cedros-wallet-status-title", children: E.title }),
        /* @__PURE__ */ r("p", { className: "cedros-wallet-status-description", children: E.description })
      ] })
    ] }),
    m && /* @__PURE__ */ r("div", { className: "cedros-wallet-status-pubkey-full", children: /* @__PURE__ */ r(Bl, { address: m }) }),
    y && /* @__PURE__ */ d("div", { className: "cedros-wallet-status-error-box", role: "alert", children: [
      /* @__PURE__ */ r("p", { children: y }),
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
    l && /* @__PURE__ */ d("div", { className: "cedros-wallet-status-actions", children: [
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
function Rl(e, t) {
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
function Tl(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function Il({ status: e }) {
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
function rh({ className: e = "", showActions: t = !0 }) {
  const s = Lt(), [o, n] = L("status"), a = V(() => {
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
  }, [o]), l = T(() => n("status"), []), i = T(async () => {
    n("status"), await s.refresh();
  }, [s]), c = T(async () => {
    n("status"), await s.refresh();
  }, [s]), u = T(async () => {
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
          onClick: l,
          children: "Back"
        }
      )
    ] }),
    o === "status" && /* @__PURE__ */ r(
      Pl,
      {
        onEnroll: () => n("enroll"),
        onUnlock: () => n("unlock"),
        onRecover: () => n("recover_intro"),
        showActions: t
      }
    ),
    o === "enroll" && /* @__PURE__ */ r(
      hl,
      {
        onComplete: () => {
          i();
        },
        onCancel: l
      }
    ),
    o === "unlock" && /* @__PURE__ */ r(
      bl,
      {
        onUnlock: () => {
          c();
        },
        onCancel: l
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
            onClick: l,
            children: "Cancel"
          }
        )
      ] })
    ] }) }),
    o === "recover" && /* @__PURE__ */ r(
      El,
      {
        onComplete: () => {
          u();
        },
        onCancel: l
      }
    )
  ] });
}
function sh({
  showDescriptions: e = !0,
  className: t = "",
  onSave: s
}) {
  const { settings: o, isLoading: n, isUpdating: a, error: l, fetchSettings: i, updateSettings: c } = ha(), [u, f] = L({}), [h, m] = L(null), [y, w] = L(!1);
  W(() => {
    i();
  }, [i]), W(() => {
    if (y) {
      const R = setTimeout(() => w(!1), 3e3);
      return () => clearTimeout(R);
    }
  }, [y]);
  const p = T((R, g) => {
    f((k) => ({ ...k, [R]: g })), m(null), w(!1);
  }, []), E = T(async () => {
    const R = Object.entries(u).map(([g, k]) => ({
      key: g,
      value: k
    }));
    if (R.length !== 0)
      try {
        await c(R), f({}), m(null), w(!0), s?.();
      } catch (g) {
        m(g instanceof Error ? g.message : "Failed to save settings");
      }
  }, [u, c, s]), A = T(() => {
    f({}), m(null), w(!1);
  }, []), C = Object.keys(u).length > 0, N = Object.keys(u).length;
  if (n && Object.keys(o).length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-system-settings cedros-system-settings-loading ${t}`, children: [
      /* @__PURE__ */ r($, {}),
      /* @__PURE__ */ r("span", { children: "Loading settings..." })
    ] });
  if (l)
    return /* @__PURE__ */ r("div", { className: `cedros-system-settings ${t}`, children: /* @__PURE__ */ r(se, { error: l.message }) });
  const x = Object.keys(o).sort();
  return x.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-system-settings cedros-system-settings-empty ${t}`, children: /* @__PURE__ */ r("p", { children: "No system settings found." }) }) : /* @__PURE__ */ d("div", { className: `cedros-system-settings ${t}`, children: [
    h && /* @__PURE__ */ r(se, { error: h }),
    y && /* @__PURE__ */ r("div", { className: "cedros-settings-success", children: "Settings saved successfully." }),
    x.map((R) => /* @__PURE__ */ r(
      Ml,
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
          children: a ? /* @__PURE__ */ r($, { size: "sm" }) : "Save Changes"
        }
      )
    ] })
  ] });
}
const Ss = Object.keys(ma);
function Ml({
  category: e,
  settings: t,
  edits: s,
  showDescription: o,
  onChange: n
}) {
  const a = fa[e] || {
    label: e,
    description: "",
    icon: ""
  }, l = V(() => [...t].sort((i, c) => {
    const u = Ss.indexOf(i.key), f = Ss.indexOf(c.key);
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
    /* @__PURE__ */ r(Mr, { settings: l, edits: s, onChange: n })
  ] });
}
class _l {
  client;
  constructor(t, s, o) {
    this.client = new ce({ baseUrl: t, timeoutMs: s, retryAttempts: o });
  }
  /**
   * Check if initial setup is required
   * Returns whether the system needs initial setup (no admin exists)
   */
  async getStatus() {
    try {
      return await this.client.get("/setup/status");
    } catch (t) {
      throw j(t, "Failed to check setup status");
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
      throw j(s, "Failed to create admin account");
    }
  }
}
function uo() {
  const { config: e } = ne(), [t, s] = L(null), [o, n] = L(!1), [a, l] = L(!1), [i, c] = L(null), u = J(0), f = V(
    () => new _l(e.serverUrl, e.requestTimeout, e.retryAttempts),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), h = J(f);
  h.current = f;
  const m = T(async () => {
    n(!0), c(null);
    const w = ++u.current;
    try {
      const p = await h.current.getStatus();
      if (w !== u.current) return;
      s(p);
    } catch (p) {
      if (w !== u.current) return;
      c(p instanceof Error ? p : new Error("Failed to check setup status"));
    } finally {
      w === u.current && n(!1);
    }
  }, []), y = T(
    async (w) => {
      l(!0), c(null);
      try {
        const p = await h.current.createFirstAdmin(w);
        return await m(), p;
      } catch (p) {
        const E = p instanceof Error ? p : new Error("Failed to create admin");
        throw c(E), E;
      } finally {
        l(!1);
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
    createAdmin: y
  };
}
const Dl = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, Ls = 8;
function Ul(e) {
  const t = {};
  return e.email ? Dl.test(e.email) || (t.email = "Invalid email format") : t.email = "Email is required", e.password ? e.password.length < Ls && (t.password = `Password must be at least ${Ls} characters`) : t.password = "Password is required", e.confirmPassword ? e.password !== e.confirmPassword && (t.confirmPassword = "Passwords do not match") : t.confirmPassword = "Please confirm your password", t;
}
function Fl({ onComplete: e, className: t = "" }) {
  const { status: s, isLoading: o, isCreating: n, error: a, checkStatus: l, createAdmin: i } = uo(), [c, u] = L({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    orgName: ""
  }), [f, h] = L({}), [m, y] = L(!1);
  W(() => {
    l();
  }, [l]);
  const w = T(
    (E) => (A) => {
      u((C) => ({ ...C, [E]: A.target.value })), h((C) => ({ ...C, [E]: void 0 }));
    },
    []
  ), p = T(
    async (E) => {
      E.preventDefault();
      const A = Ul(c);
      if (Object.keys(A).length > 0) {
        h(A);
        return;
      }
      try {
        await i({
          email: c.email,
          password: c.password,
          name: c.name || void 0,
          orgName: c.orgName || void 0
        }), y(!0), e?.();
      } catch {
      }
    },
    [c, i, e]
  );
  return o ? /* @__PURE__ */ r("div", { className: `cedros-setup ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-setup__loading", children: [
    /* @__PURE__ */ r($, {}),
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
      a && /* @__PURE__ */ r(se, { error: a.message }),
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
            value: c.email,
            onChange: w("email"),
            placeholder: "admin@example.com",
            autoComplete: "email",
            autoFocus: !0,
            disabled: n
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
            className: `cedros-setup__input ${f.password ? "cedros-setup__input--error" : ""}`,
            value: c.password,
            onChange: w("password"),
            placeholder: "At least 8 characters",
            autoComplete: "new-password",
            disabled: n
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
            value: c.confirmPassword,
            onChange: w("confirmPassword"),
            placeholder: "Confirm your password",
            autoComplete: "new-password",
            disabled: n
          }
        ),
        f.confirmPassword && /* @__PURE__ */ r("span", { className: "cedros-setup__error", children: f.confirmPassword })
      ] }),
      /* @__PURE__ */ r("button", { type: "submit", className: "cedros-setup__button", disabled: n, children: n ? /* @__PURE__ */ d(X, { children: [
        /* @__PURE__ */ r($, {}),
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
const Ol = ["security", "rate_limit"];
function nh({ className: e }) {
  return /* @__PURE__ */ r(
    Ma,
    {
      title: "Security",
      description: "Configure CORS, cookies, sessions, JWT, and rate limiting settings.",
      categories: Ol,
      className: e
    }
  );
}
const Bs = [
  { id: "email", label: "Email", category: "email" },
  { id: "webhooks", label: "Webhooks", category: "webhook" }
];
function Wl({ className: e }) {
  const {
    settings: t,
    edits: s,
    isLoading: o,
    autosaveStatus: n,
    autosaveError: a,
    error: l,
    fetchSettings: i,
    handleChange: c,
    getEffectiveValue: u
  } = En(), [f, h] = L("email");
  W(() => {
    i();
  }, [i]);
  const m = Bs.find((x) => x.id === f), y = m?.category ?? "", p = (u("email_provider") || "custom") === "custom", E = u("email_smtp_host"), A = !p || E != null && E !== "", C = V(() => {
    const x = t[y] ?? [];
    if (f !== "email") return x;
    const R = p ? Ba : Pa;
    return x.filter((g) => R.includes(g.key)).sort((g, k) => R.indexOf(g.key) - R.indexOf(k.key));
  }, [t, y, f, p]), N = (x, R) => {
    if (c(x, R), x === "email_provider" && R !== "custom") {
      const g = Ra[R];
      g && (c("email_smtp_host", g), c("email_smtp_port", "587"), c("email_smtp_tls", "true"));
    }
  };
  return o && Object.keys(t).length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-system-settings cedros-system-settings-loading ${e ?? ""}`, children: [
    /* @__PURE__ */ r($, {}),
    /* @__PURE__ */ r("span", { children: "Loading settings..." })
  ] }) : l ? /* @__PURE__ */ r("div", { className: `cedros-system-settings ${e ?? ""}`, children: /* @__PURE__ */ r(se, { error: l.message }) }) : /* @__PURE__ */ d("div", { className: `cedros-system-settings ${e ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ d("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ r("h2", { className: "cedros-settings-page-title", children: "Auth Messages" }),
        /* @__PURE__ */ r("p", { className: "cedros-settings-page-description", children: "Configure email delivery for verification emails, password resets, and instant link login. Webhook notifications can be sent to Discord or Slack." })
      ] }),
      /* @__PURE__ */ r(Cn, { status: n, error: a })
    ] }),
    f === "email" && !A && /* @__PURE__ */ r("div", { className: "cedros-settings-warning-banner", children: "Email features (verification, password reset, instant link) are disabled until SMTP is configured. Select a provider or enter custom SMTP settings below." }),
    /* @__PURE__ */ r("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: Bs.map((x) => /* @__PURE__ */ r(
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
      Mr,
      {
        settings: C,
        edits: s,
        onChange: f === "email" ? N : c
      }
    ) })
  ] });
}
const Kt = [
  "image_storage_enabled",
  "image_storage_provider",
  "image_storage_bucket",
  "image_storage_region",
  "image_storage_endpoint",
  "image_storage_access_key",
  "image_storage_secret_key",
  "image_storage_cdn_url"
], Ps = {
  nyc3: "https://nyc3.digitaloceanspaces.com",
  ams3: "https://ams3.digitaloceanspaces.com",
  sgp1: "https://sgp1.digitaloceanspaces.com",
  sfo3: "https://sfo3.digitaloceanspaces.com",
  fra1: "https://fra1.digitaloceanspaces.com",
  syd1: "https://syd1.digitaloceanspaces.com"
};
function ql({ className: e }) {
  const {
    settings: t,
    edits: s,
    isLoading: o,
    autosaveStatus: n,
    autosaveError: a,
    error: l,
    fetchSettings: i,
    handleChange: c,
    getEffectiveValue: u
  } = En();
  W(() => {
    i();
  }, [i]);
  const f = V(() => (t.image_storage ?? []).filter((y) => Kt.includes(y.key)).sort((y, w) => Kt.indexOf(y.key) - Kt.indexOf(w.key)), [t]), h = (m, y) => {
    if (c(m, y), m === "image_storage_provider")
      if (y === "digitalocean") {
        const w = u("image_storage_region") || "nyc3";
        c("image_storage_region", w), c("image_storage_endpoint", Ps[w] ?? `https://${w}.digitaloceanspaces.com`);
      } else y === "s3" && c("image_storage_endpoint", "");
    m === "image_storage_region" && u("image_storage_provider") === "digitalocean" && c("image_storage_endpoint", Ps[y] ?? `https://${y}.digitaloceanspaces.com`);
  };
  return o && Object.keys(t).length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-system-settings cedros-system-settings-loading ${e ?? ""}`, children: [
    /* @__PURE__ */ r($, {}),
    /* @__PURE__ */ r("span", { children: "Loading settings..." })
  ] }) : l ? /* @__PURE__ */ r("div", { className: `cedros-system-settings ${e ?? ""}`, children: /* @__PURE__ */ r(se, { error: l.message }) }) : /* @__PURE__ */ d("div", { className: `cedros-system-settings ${e ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ d("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ r("h2", { className: "cedros-settings-page-title", children: "Image Storage" }),
        /* @__PURE__ */ r("p", { className: "cedros-settings-page-description", children: "Configure S3-compatible object storage for user avatars and images. Supports AWS S3, DigitalOcean Spaces, and other S3-compatible providers." })
      ] }),
      /* @__PURE__ */ r(Cn, { status: n, error: a })
    ] }),
    f.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ r("p", { children: "No image storage settings found." }) }) : /* @__PURE__ */ r(
      Mr,
      {
        settings: f,
        edits: s,
        onChange: h
      }
    )
  ] });
}
const me = {
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
  )
}, jl = [
  // Top-level menu items
  { id: "users", label: "Users", icon: me.users },
  { id: "team", label: "Team", icon: me.members },
  { id: "deposits", label: "Deposits", icon: me.deposits, requiredFeature: "credits" },
  { id: "withdrawals", label: "Withdrawals", icon: me.withdrawals, requiredFeature: "credits" },
  // Configuration group
  { id: "settings-auth", label: "Authentication", icon: me.key, group: "Configuration" },
  { id: "settings-messaging", label: "Auth Messages", icon: me.mail, group: "Configuration" },
  { id: "settings-wallet", label: "User Wallets", icon: me.wallet, group: "Configuration" },
  {
    id: "settings-credits",
    label: "Credit System",
    icon: me.coins,
    group: "Configuration",
    requiredFeature: "credits"
  },
  { id: "settings-server", label: "Auth Server", icon: me.server, group: "Configuration" },
  { id: "settings-images", label: "Image Storage", icon: me.image, group: "Configuration" }
];
function oh({
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
    "settings-server",
    "settings-images"
  ],
  defaultSection: s = "users",
  refreshInterval: o = 0,
  pageSize: n = 20,
  onSectionChange: a,
  onSettingsClick: l,
  onLogoutClick: i,
  className: c = ""
}) {
  const [u, f] = L(s), [h, m] = L(!0), { user: y, logout: w } = ne(), { activeOrg: p, role: E, isLoading: A, fetchOrgs: C, hasPermission: N } = pa(), { status: x, isLoading: R, checkStatus: g } = uo(), { features: k, isLoading: v } = na(), { canAccess: b } = oa(), P = T(
    (_) => {
      f(_), a?.(_);
    },
    [a]
  ), S = jl.filter((_) => !(!t.includes(_.id) || _.requiredFeature && !k[_.requiredFeature] || !b(_.id))), I = S.find((_) => _.id === u), B = !I && !v;
  return W(() => {
    C(), g();
  }, [C, g]), W(() => {
    B && S.length > 0 && f("users");
  }, [B, S.length]), !R && x?.needsSetup ? /* @__PURE__ */ r("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--setup ${c}`, children: /* @__PURE__ */ r(Fl, { onComplete: () => g() }) }) : (A || R || v) && !p ? /* @__PURE__ */ d("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--loading ${c}`, children: [
    /* @__PURE__ */ r($, {}),
    /* @__PURE__ */ r("span", { className: "cedros-dashboard__loading-text", children: "Loading..." })
  ] }) : u === "team" && !p ? /* @__PURE__ */ r("div", { className: `cedros-admin cedros-dashboard ${c}`, children: /* @__PURE__ */ r(se, { error: "No organization selected. Please select an organization first." }) }) : /* @__PURE__ */ d("div", { className: `cedros-admin cedros-dashboard ${c}`, children: [
    /* @__PURE__ */ d("aside", { className: "cedros-dashboard__sidebar", children: [
      /* @__PURE__ */ r("div", { className: "cedros-dashboard__sidebar-header", children: /* @__PURE__ */ d("div", { className: "cedros-dashboard__logo", children: [
        me.wallet,
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__logo-text", children: e })
      ] }) }),
      /* @__PURE__ */ d("nav", { className: "cedros-dashboard__nav", children: [
        /* @__PURE__ */ d("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-label", children: "Menu" }),
          S.filter((_) => !_.group).map((_) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === _.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => P(_.id),
              "aria-current": u === _.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-icon", children: _.icon }),
                /* @__PURE__ */ r("span", { className: "cedros-dashboard__nav-text", children: _.label })
              ]
            },
            _.id
          ))
        ] }),
        S.some((_) => _.group === "Configuration") && /* @__PURE__ */ d("div", { className: "cedros-dashboard__nav-group", children: [
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
                    children: me.chevronRight
                  }
                )
              ]
            }
          ),
          h && S.filter((_) => _.group === "Configuration").map((_) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${u === _.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => P(_.id),
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
      y && /* @__PURE__ */ r("div", { className: "cedros-dashboard__sidebar-footer", children: /* @__PURE__ */ r(
        xa,
        {
          name: y.name,
          email: y.email,
          picture: y.picture,
          onSettings: l,
          onLogout: i ?? w
        }
      ) })
    ] }),
    /* @__PURE__ */ d("main", { className: "cedros-dashboard__main", children: [
      /* @__PURE__ */ r("header", { className: "cedros-dashboard__header", children: /* @__PURE__ */ d("div", { className: "cedros-dashboard__breadcrumb", children: [
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-root", children: e }),
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-sep", children: me.chevronRight }),
        /* @__PURE__ */ r("span", { className: "cedros-dashboard__breadcrumb-current", children: I?.label })
      ] }) }),
      /* @__PURE__ */ d("div", { className: "cedros-dashboard__content", children: [
        u === "users" && /* @__PURE__ */ r(zl, { pageSize: n, currentUserId: y?.id }),
        u === "team" && p && /* @__PURE__ */ r(
          Vl,
          {
            orgId: p.id,
            currentUserId: y?.id,
            hasPermission: N,
            role: E
          }
        ),
        u === "deposits" && /* @__PURE__ */ r(Hl, { pageSize: n, refreshInterval: o }),
        u === "withdrawals" && /* @__PURE__ */ r($l, { pageSize: n, refreshInterval: o }),
        u === "settings-auth" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Sa, {}) }),
        u === "settings-wallet" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(La, {}) }),
        u === "settings-messaging" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Wl, {}) }),
        u === "settings-credits" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Ta, {}) }),
        u === "settings-server" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(Ia, {}) }),
        u === "settings-images" && /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(ql, {}) })
      ] })
    ] })
  ] });
}
function zl({ pageSize: e, currentUserId: t }) {
  const [s, o] = L(null), { statsItems: n, isLoading: a, error: l, refresh: i } = Na();
  return s ? /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(
    Ea,
    {
      userId: s.id,
      currentUserId: t,
      onBack: () => o(null)
    }
  ) }) : /* @__PURE__ */ d("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ r(xn, { stats: n, isLoading: a, onRefresh: i }),
    l && /* @__PURE__ */ r("p", { className: "cedros-admin-error-inline", children: l }),
    /* @__PURE__ */ r(
      Ca,
      {
        pageSize: e,
        currentUserId: t,
        onUserClick: (c) => o(c)
      }
    )
  ] });
}
function Vl({ orgId: e, currentUserId: t, hasPermission: s, role: o }) {
  const [n, a] = L("members"), {
    members: l,
    isLoading: i,
    error: c,
    fetchMembers: u,
    updateMemberRole: f,
    removeMember: h
  } = aa(e), {
    invites: m,
    isLoading: y,
    error: w,
    fetchInvites: p,
    createInvite: E,
    cancelInvite: A,
    resendInvite: C
  } = ia(e);
  W(() => {
    u(), p();
  }, [u, p]);
  const N = s("invite:create"), x = s("invite:cancel"), R = m.length, g = l.reduce(
    (P, S) => (P[S.role] = (P[S.role] ?? 0) + 1, P),
    {}
  ), k = g.owner ?? 0, v = g.admin ?? 0, b = g.member ?? 0;
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__team", children: [
    /* @__PURE__ */ r(
      xn,
      {
        stats: [
          { label: "Owners", value: k },
          { label: "Admins", value: v },
          { label: "Members", value: b },
          { label: "Pending Invites", value: R }
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
            R > 0 && ` (${R})`
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
        ca,
        {
          members: l,
          currentUserId: t,
          isLoading: i,
          error: c?.message,
          canManage: s("member:remove"),
          canChangeRoles: s("member:role_change"),
          onUpdateRole: f,
          onRemove: h
        }
      ),
      n === "invites" && /* @__PURE__ */ d("div", { className: "cedros-dashboard__invites", children: [
        N && /* @__PURE__ */ d("div", { className: "cedros-dashboard__section", children: [
          /* @__PURE__ */ r("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ r("h3", { className: "cedros-dashboard__section-title", children: "Send Invitation" }) }),
          /* @__PURE__ */ r(
            la,
            {
              onSubmit: E,
              isLoading: y,
              error: w?.message
            }
          )
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ r(
          da,
          {
            invites: m,
            isLoading: y,
            error: w?.message,
            canManage: x || N,
            onCancel: x ? A : void 0,
            onResend: N ? C : void 0
          }
        ) })
      ] }),
      n === "permissions" && o === "owner" && /* @__PURE__ */ r(ua, { userRole: o })
    ] })
  ] });
}
function Hl({ pageSize: e, refreshInterval: t }) {
  const [s, o] = L("");
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ r(wa, { refreshInterval: t }),
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
        ya,
        {
          statusFilter: s || void 0,
          pageSize: e,
          refreshInterval: t
        }
      )
    ] })
  ] });
}
function $l({ pageSize: e, refreshInterval: t }) {
  return /* @__PURE__ */ d("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ r(ba, { refreshInterval: t }),
    /* @__PURE__ */ r("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ d("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ r(Aa, { pageSize: e, refreshInterval: t }),
      /* @__PURE__ */ r(va, { pageSize: e, refreshInterval: t }),
      /* @__PURE__ */ r(ka, { pageSize: e, refreshInterval: t })
    ] })
  ] });
}
var Ge = {}, Yt, Rs;
function Gl() {
  return Rs || (Rs = 1, Yt = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), Yt;
}
var Zt = {}, De = {}, Ts;
function qe() {
  if (Ts) return De;
  Ts = 1;
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
  }, De.getBCHDigit = function(s) {
    let o = 0;
    for (; s !== 0; )
      o++, s >>>= 1;
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
var Xt = {}, Is;
function Hr() {
  return Is || (Is = 1, (function(e) {
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
  })(Xt)), Xt;
}
var Jt, Ms;
function Ql() {
  if (Ms) return Jt;
  Ms = 1;
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
  }, Jt = e, Jt;
}
var er, _s;
function Kl() {
  if (_s) return er;
  _s = 1;
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
  }, er = e, er;
}
var tr = {}, Ds;
function Yl() {
  return Ds || (Ds = 1, (function(e) {
    const t = qe().getSymbolSize;
    e.getRowColCoords = function(o) {
      if (o === 1) return [];
      const n = Math.floor(o / 7) + 2, a = t(o), l = a === 145 ? 26 : Math.ceil((a - 13) / (2 * n - 2)) * 2, i = [a - 7];
      for (let c = 1; c < n - 1; c++)
        i[c] = i[c - 1] - l;
      return i.push(6), i.reverse();
    }, e.getPositions = function(o) {
      const n = [], a = e.getRowColCoords(o), l = a.length;
      for (let i = 0; i < l; i++)
        for (let c = 0; c < l; c++)
          i === 0 && c === 0 || // top-left
          i === 0 && c === l - 1 || // bottom-left
          i === l - 1 && c === 0 || n.push([a[i], a[c]]);
      return n;
    };
  })(tr)), tr;
}
var rr = {}, Us;
function Zl() {
  if (Us) return rr;
  Us = 1;
  const e = qe().getSymbolSize, t = 7;
  return rr.getPositions = function(o) {
    const n = e(o);
    return [
      // top-left
      [0, 0],
      // top-right
      [n - t, 0],
      // bottom-left
      [0, n - t]
    ];
  }, rr;
}
var sr = {}, Fs;
function Xl() {
  return Fs || (Fs = 1, (function(e) {
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
      let l = 0, i = 0, c = 0, u = null, f = null;
      for (let h = 0; h < a; h++) {
        i = c = 0, u = f = null;
        for (let m = 0; m < a; m++) {
          let y = n.get(h, m);
          y === u ? i++ : (i >= 5 && (l += t.N1 + (i - 5)), u = y, i = 1), y = n.get(m, h), y === f ? c++ : (c >= 5 && (l += t.N1 + (c - 5)), f = y, c = 1);
        }
        i >= 5 && (l += t.N1 + (i - 5)), c >= 5 && (l += t.N1 + (c - 5));
      }
      return l;
    }, e.getPenaltyN2 = function(n) {
      const a = n.size;
      let l = 0;
      for (let i = 0; i < a - 1; i++)
        for (let c = 0; c < a - 1; c++) {
          const u = n.get(i, c) + n.get(i, c + 1) + n.get(i + 1, c) + n.get(i + 1, c + 1);
          (u === 4 || u === 0) && l++;
        }
      return l * t.N2;
    }, e.getPenaltyN3 = function(n) {
      const a = n.size;
      let l = 0, i = 0, c = 0;
      for (let u = 0; u < a; u++) {
        i = c = 0;
        for (let f = 0; f < a; f++)
          i = i << 1 & 2047 | n.get(u, f), f >= 10 && (i === 1488 || i === 93) && l++, c = c << 1 & 2047 | n.get(f, u), f >= 10 && (c === 1488 || c === 93) && l++;
      }
      return l * t.N3;
    }, e.getPenaltyN4 = function(n) {
      let a = 0;
      const l = n.data.length;
      for (let c = 0; c < l; c++) a += n.data[c];
      return Math.abs(Math.ceil(a * 100 / l / 5) - 10) * t.N4;
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
      const l = a.size;
      for (let i = 0; i < l; i++)
        for (let c = 0; c < l; c++)
          a.isReserved(c, i) || a.xor(c, i, s(n, c, i));
    }, e.getBestMask = function(n, a) {
      const l = Object.keys(e.Patterns).length;
      let i = 0, c = 1 / 0;
      for (let u = 0; u < l; u++) {
        a(u), e.applyMask(u, n);
        const f = e.getPenaltyN1(n) + e.getPenaltyN2(n) + e.getPenaltyN3(n) + e.getPenaltyN4(n);
        e.applyMask(u, n), f < c && (c = f, i = u);
      }
      return i;
    };
  })(sr)), sr;
}
var ft = {}, Os;
function ho() {
  if (Os) return ft;
  Os = 1;
  const e = Hr(), t = [
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
  return ft.getBlocksCount = function(n, a) {
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
  }, ft.getTotalCodewordsCount = function(n, a) {
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
  }, ft;
}
var nr = {}, st = {}, Ws;
function Jl() {
  if (Ws) return st;
  Ws = 1;
  const e = new Uint8Array(512), t = new Uint8Array(256);
  return (function() {
    let o = 1;
    for (let n = 0; n < 255; n++)
      e[n] = o, t[o] = n, o <<= 1, o & 256 && (o ^= 285);
    for (let n = 255; n < 512; n++)
      e[n] = e[n - 255];
  })(), st.log = function(o) {
    if (o < 1) throw new Error("log(" + o + ")");
    return t[o];
  }, st.exp = function(o) {
    return e[o];
  }, st.mul = function(o, n) {
    return o === 0 || n === 0 ? 0 : e[t[o] + t[n]];
  }, st;
}
var qs;
function ed() {
  return qs || (qs = 1, (function(e) {
    const t = Jl();
    e.mul = function(o, n) {
      const a = new Uint8Array(o.length + n.length - 1);
      for (let l = 0; l < o.length; l++)
        for (let i = 0; i < n.length; i++)
          a[l + i] ^= t.mul(o[l], n[i]);
      return a;
    }, e.mod = function(o, n) {
      let a = new Uint8Array(o);
      for (; a.length - n.length >= 0; ) {
        const l = a[0];
        for (let c = 0; c < n.length; c++)
          a[c] ^= t.mul(n[c], l);
        let i = 0;
        for (; i < a.length && a[i] === 0; ) i++;
        a = a.slice(i);
      }
      return a;
    }, e.generateECPolynomial = function(o) {
      let n = new Uint8Array([1]);
      for (let a = 0; a < o; a++)
        n = e.mul(n, new Uint8Array([1, t.exp(a)]));
      return n;
    };
  })(nr)), nr;
}
var or, js;
function td() {
  if (js) return or;
  js = 1;
  const e = ed();
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
    const a = e.mod(n, this.genPoly), l = this.degree - a.length;
    if (l > 0) {
      const i = new Uint8Array(this.degree);
      return i.set(a, l), i;
    }
    return a;
  }, or = t, or;
}
var ar = {}, ir = {}, cr = {}, zs;
function fo() {
  return zs || (zs = 1, cr.isValid = function(t) {
    return !isNaN(t) && t >= 1 && t <= 40;
  }), cr;
}
var Ne = {}, Vs;
function mo() {
  if (Vs) return Ne;
  Vs = 1;
  const e = "[0-9]+", t = "[A-Z $%*+\\-./:]+";
  let s = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  s = s.replace(/u/g, "\\u");
  const o = "(?:(?![A-Z0-9 $%*+\\-./:]|" + s + `)(?:.|[\r
]))+`;
  Ne.KANJI = new RegExp(s, "g"), Ne.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), Ne.BYTE = new RegExp(o, "g"), Ne.NUMERIC = new RegExp(e, "g"), Ne.ALPHANUMERIC = new RegExp(t, "g");
  const n = new RegExp("^" + s + "$"), a = new RegExp("^" + e + "$"), l = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return Ne.testKanji = function(c) {
    return n.test(c);
  }, Ne.testNumeric = function(c) {
    return a.test(c);
  }, Ne.testAlphanumeric = function(c) {
    return l.test(c);
  }, Ne;
}
var Hs;
function je() {
  return Hs || (Hs = 1, (function(e) {
    const t = fo(), s = mo();
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
    }, e.getCharCountIndicator = function(a, l) {
      if (!a.ccBits) throw new Error("Invalid mode: " + a);
      if (!t.isValid(l))
        throw new Error("Invalid version: " + l);
      return l >= 1 && l < 10 ? a.ccBits[0] : l < 27 ? a.ccBits[1] : a.ccBits[2];
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
    e.from = function(a, l) {
      if (e.isValid(a))
        return a;
      try {
        return o(a);
      } catch {
        return l;
      }
    };
  })(ir)), ir;
}
var $s;
function rd() {
  return $s || ($s = 1, (function(e) {
    const t = qe(), s = ho(), o = Hr(), n = je(), a = fo(), l = 7973, i = t.getBCHDigit(l);
    function c(m, y, w) {
      for (let p = 1; p <= 40; p++)
        if (y <= e.getCapacity(p, w, m))
          return p;
    }
    function u(m, y) {
      return n.getCharCountIndicator(m, y) + 4;
    }
    function f(m, y) {
      let w = 0;
      return m.forEach(function(p) {
        const E = u(p.mode, y);
        w += E + p.getBitsLength();
      }), w;
    }
    function h(m, y) {
      for (let w = 1; w <= 40; w++)
        if (f(m, w) <= e.getCapacity(w, y, n.MIXED))
          return w;
    }
    e.from = function(y, w) {
      return a.isValid(y) ? parseInt(y, 10) : w;
    }, e.getCapacity = function(y, w, p) {
      if (!a.isValid(y))
        throw new Error("Invalid QR Code version");
      typeof p > "u" && (p = n.BYTE);
      const E = t.getSymbolTotalCodewords(y), A = s.getTotalCodewordsCount(y, w), C = (E - A) * 8;
      if (p === n.MIXED) return C;
      const N = C - u(p, y);
      switch (p) {
        case n.NUMERIC:
          return Math.floor(N / 10 * 3);
        case n.ALPHANUMERIC:
          return Math.floor(N / 11 * 2);
        case n.KANJI:
          return Math.floor(N / 13);
        case n.BYTE:
        default:
          return Math.floor(N / 8);
      }
    }, e.getBestVersionForData = function(y, w) {
      let p;
      const E = o.from(w, o.M);
      if (Array.isArray(y)) {
        if (y.length > 1)
          return h(y, E);
        if (y.length === 0)
          return 1;
        p = y[0];
      } else
        p = y;
      return c(p.mode, p.getLength(), E);
    }, e.getEncodedBits = function(y) {
      if (!a.isValid(y) || y < 7)
        throw new Error("Invalid QR Code version");
      let w = y << 12;
      for (; t.getBCHDigit(w) - i >= 0; )
        w ^= l << t.getBCHDigit(w) - i;
      return y << 12 | w;
    };
  })(ar)), ar;
}
var lr = {}, Gs;
function sd() {
  if (Gs) return lr;
  Gs = 1;
  const e = qe(), t = 1335, s = 21522, o = e.getBCHDigit(t);
  return lr.getEncodedBits = function(a, l) {
    const i = a.bit << 3 | l;
    let c = i << 10;
    for (; e.getBCHDigit(c) - o >= 0; )
      c ^= t << e.getBCHDigit(c) - o;
    return (i << 10 | c) ^ s;
  }, lr;
}
var dr = {}, ur, Qs;
function nd() {
  if (Qs) return ur;
  Qs = 1;
  const e = je();
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
    let n, a, l;
    for (n = 0; n + 3 <= this.data.length; n += 3)
      a = this.data.substr(n, 3), l = parseInt(a, 10), o.put(l, 10);
    const i = this.data.length - n;
    i > 0 && (a = this.data.substr(n), l = parseInt(a, 10), o.put(l, i * 3 + 1));
  }, ur = t, ur;
}
var hr, Ks;
function od() {
  if (Ks) return hr;
  Ks = 1;
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
      let l = t.indexOf(this.data[a]) * 45;
      l += t.indexOf(this.data[a + 1]), n.put(l, 11);
    }
    this.data.length % 2 && n.put(t.indexOf(this.data[a]), 6);
  }, hr = s, hr;
}
var fr, Ys;
function ad() {
  if (Ys) return fr;
  Ys = 1;
  const e = je();
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
  }, fr = t, fr;
}
var mr, Zs;
function id() {
  if (Zs) return mr;
  Zs = 1;
  const e = je(), t = qe();
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
  }, mr = s, mr;
}
var pr = { exports: {} }, Xs;
function cd() {
  return Xs || (Xs = 1, (function(e) {
    var t = {
      single_source_shortest_paths: function(s, o, n) {
        var a = {}, l = {};
        l[o] = 0;
        var i = t.PriorityQueue.make();
        i.push(o, 0);
        for (var c, u, f, h, m, y, w, p, E; !i.empty(); ) {
          c = i.pop(), u = c.value, h = c.cost, m = s[u] || {};
          for (f in m)
            m.hasOwnProperty(f) && (y = m[f], w = h + y, p = l[f], E = typeof l[f] > "u", (E || p > w) && (l[f] = w, i.push(f, w), a[f] = u));
        }
        if (typeof n < "u" && typeof l[n] > "u") {
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
  })(pr)), pr.exports;
}
var Js;
function ld() {
  return Js || (Js = 1, (function(e) {
    const t = je(), s = nd(), o = od(), n = ad(), a = id(), l = mo(), i = qe(), c = cd();
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
      const C = f(l.NUMERIC, t.NUMERIC, A), N = f(l.ALPHANUMERIC, t.ALPHANUMERIC, A);
      let x, R;
      return i.isKanjiModeEnabled() ? (x = f(l.BYTE, t.BYTE, A), R = f(l.KANJI, t.KANJI, A)) : (x = f(l.BYTE_KANJI, t.BYTE, A), R = []), C.concat(N, x, R).sort(function(k, v) {
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
          return s.getBitsLength(A);
        case t.ALPHANUMERIC:
          return o.getBitsLength(A);
        case t.KANJI:
          return a.getBitsLength(A);
        case t.BYTE:
          return n.getBitsLength(A);
      }
    }
    function y(A) {
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
        for (let b = 0; b < k.length; b++) {
          const P = k[b], S = "" + g + b;
          v.push(S), N[S] = { node: P, lastCount: 0 }, x[S] = {};
          for (let I = 0; I < R.length; I++) {
            const B = R[I];
            N[B] && N[B].node.mode === P.mode ? (x[B][S] = m(N[B].lastCount + P.length, P.mode) - m(N[B].lastCount, P.mode), N[B].lastCount += P.length) : (N[B] && (N[B].lastCount = P.length), x[B][S] = m(P.length, P.mode) + 4 + t.getCharCountIndicator(P.mode, C));
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
          return new s(A);
        case t.ALPHANUMERIC:
          return new o(A);
        case t.KANJI:
          return new a(A);
        case t.BYTE:
          return new n(A);
      }
    }
    e.fromArray = function(C) {
      return C.reduce(function(N, x) {
        return typeof x == "string" ? N.push(E(x, null)) : x.data && N.push(E(x.data, x.mode)), N;
      }, []);
    }, e.fromString = function(C, N) {
      const x = h(C, i.isKanjiModeEnabled()), R = w(x), g = p(R, N), k = c.find_path(g.map, "start", "end"), v = [];
      for (let b = 1; b < k.length - 1; b++)
        v.push(g.table[k[b]].node);
      return e.fromArray(y(v));
    }, e.rawSplit = function(C) {
      return e.fromArray(
        h(C, i.isKanjiModeEnabled())
      );
    };
  })(dr)), dr;
}
var en;
function dd() {
  if (en) return Zt;
  en = 1;
  const e = qe(), t = Hr(), s = Ql(), o = Kl(), n = Yl(), a = Zl(), l = Xl(), i = ho(), c = td(), u = rd(), f = sd(), h = je(), m = ld();
  function y(g, k) {
    const v = g.size, b = a.getPositions(k);
    for (let P = 0; P < b.length; P++) {
      const S = b[P][0], I = b[P][1];
      for (let B = -1; B <= 7; B++)
        if (!(S + B <= -1 || v <= S + B))
          for (let M = -1; M <= 7; M++)
            I + M <= -1 || v <= I + M || (B >= 0 && B <= 6 && (M === 0 || M === 6) || M >= 0 && M <= 6 && (B === 0 || B === 6) || B >= 2 && B <= 4 && M >= 2 && M <= 4 ? g.set(S + B, I + M, !0, !0) : g.set(S + B, I + M, !1, !0));
    }
  }
  function w(g) {
    const k = g.size;
    for (let v = 8; v < k - 8; v++) {
      const b = v % 2 === 0;
      g.set(v, 6, b, !0), g.set(6, v, b, !0);
    }
  }
  function p(g, k) {
    const v = n.getPositions(k);
    for (let b = 0; b < v.length; b++) {
      const P = v[b][0], S = v[b][1];
      for (let I = -2; I <= 2; I++)
        for (let B = -2; B <= 2; B++)
          I === -2 || I === 2 || B === -2 || B === 2 || I === 0 && B === 0 ? g.set(P + I, S + B, !0, !0) : g.set(P + I, S + B, !1, !0);
    }
  }
  function E(g, k) {
    const v = g.size, b = u.getEncodedBits(k);
    let P, S, I;
    for (let B = 0; B < 18; B++)
      P = Math.floor(B / 3), S = B % 3 + v - 8 - 3, I = (b >> B & 1) === 1, g.set(P, S, I, !0), g.set(S, P, I, !0);
  }
  function A(g, k, v) {
    const b = g.size, P = f.getEncodedBits(k, v);
    let S, I;
    for (S = 0; S < 15; S++)
      I = (P >> S & 1) === 1, S < 6 ? g.set(S, 8, I, !0) : S < 8 ? g.set(S + 1, 8, I, !0) : g.set(b - 15 + S, 8, I, !0), S < 8 ? g.set(8, b - S - 1, I, !0) : S < 9 ? g.set(8, 15 - S - 1 + 1, I, !0) : g.set(8, 15 - S - 1, I, !0);
    g.set(b - 8, 8, 1, !0);
  }
  function C(g, k) {
    const v = g.size;
    let b = -1, P = v - 1, S = 7, I = 0;
    for (let B = v - 1; B > 0; B -= 2)
      for (B === 6 && B--; ; ) {
        for (let M = 0; M < 2; M++)
          if (!g.isReserved(P, B - M)) {
            let _ = !1;
            I < k.length && (_ = (k[I] >>> S & 1) === 1), g.set(P, B - M, _), S--, S === -1 && (I++, S = 7);
          }
        if (P += b, P < 0 || v <= P) {
          P -= b, b = -b;
          break;
        }
      }
  }
  function N(g, k, v) {
    const b = new s();
    v.forEach(function(M) {
      b.put(M.mode.bit, 4), b.put(M.getLength(), h.getCharCountIndicator(M.mode, g)), M.write(b);
    });
    const P = e.getSymbolTotalCodewords(g), S = i.getTotalCodewordsCount(g, k), I = (P - S) * 8;
    for (b.getLengthInBits() + 4 <= I && b.put(0, 4); b.getLengthInBits() % 8 !== 0; )
      b.putBit(0);
    const B = (I - b.getLengthInBits()) / 8;
    for (let M = 0; M < B; M++)
      b.put(M % 2 ? 17 : 236, 8);
    return x(b, g, k);
  }
  function x(g, k, v) {
    const b = e.getSymbolTotalCodewords(k), P = i.getTotalCodewordsCount(k, v), S = b - P, I = i.getBlocksCount(k, v), B = b % I, M = I - B, _ = Math.floor(b / I), O = Math.floor(S / I), F = O + 1, H = _ - O, q = new c(H);
    let D = 0;
    const U = new Array(I), G = new Array(I);
    let ee = 0;
    const ue = new Uint8Array(g.buffer);
    for (let te = 0; te < I; te++) {
      const we = te < M ? O : F;
      U[te] = ue.slice(D, D + we), G[te] = q.encode(U[te]), D += we, ee = Math.max(ee, we);
    }
    const Ee = new Uint8Array(b);
    let be = 0, K, Q;
    for (K = 0; K < ee; K++)
      for (Q = 0; Q < I; Q++)
        K < U[Q].length && (Ee[be++] = U[Q][K]);
    for (K = 0; K < H; K++)
      for (Q = 0; Q < I; Q++)
        Ee[be++] = G[Q][K];
    return Ee;
  }
  function R(g, k, v, b) {
    let P;
    if (Array.isArray(g))
      P = m.fromArray(g);
    else if (typeof g == "string") {
      let _ = k;
      if (!_) {
        const O = m.rawSplit(g);
        _ = u.getBestVersionForData(O, v);
      }
      P = m.fromString(g, _ || 40);
    } else
      throw new Error("Invalid data");
    const S = u.getBestVersionForData(P, v);
    if (!S)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!k)
      k = S;
    else if (k < S)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + S + `.
`
      );
    const I = N(k, v, P), B = e.getSymbolSize(k), M = new o(B);
    return y(M, k), w(M), p(M, k), A(M, v, 0), k >= 7 && E(M, k), C(M, I), isNaN(b) && (b = l.getBestMask(
      M,
      A.bind(null, M, v)
    )), l.applyMask(b, M), A(M, v, b), {
      modules: M,
      version: k,
      errorCorrectionLevel: v,
      maskPattern: b,
      segments: P
    };
  }
  return Zt.create = function(k, v) {
    if (typeof k > "u" || k === "")
      throw new Error("No input text");
    let b = t.M, P, S;
    return typeof v < "u" && (b = t.from(v.errorCorrectionLevel, t.M), P = u.from(v.version), S = l.from(v.maskPattern), v.toSJISFunc && e.setToSJISFunction(v.toSJISFunc)), R(k, P, b, S);
  }, Zt;
}
var gr = {}, wr = {}, tn;
function po() {
  return tn || (tn = 1, (function(e) {
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
      const n = typeof o.margin > "u" || o.margin === null || o.margin < 0 ? 4 : o.margin, a = o.width && o.width >= 21 ? o.width : void 0, l = o.scale || 4;
      return {
        width: a,
        scale: a ? 4 : l,
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
      const l = n.modules.size, i = n.modules.data, c = e.getScale(l, a), u = Math.floor((l + a.margin * 2) * c), f = a.margin * c, h = [a.color.light, a.color.dark];
      for (let m = 0; m < u; m++)
        for (let y = 0; y < u; y++) {
          let w = (m * u + y) * 4, p = a.color.light;
          if (m >= f && y >= f && m < u - f && y < u - f) {
            const E = Math.floor((m - f) / c), A = Math.floor((y - f) / c);
            p = h[i[E * l + A] ? 1 : 0];
          }
          o[w++] = p.r, o[w++] = p.g, o[w++] = p.b, o[w] = p.a;
        }
    };
  })(wr)), wr;
}
var rn;
function ud() {
  return rn || (rn = 1, (function(e) {
    const t = po();
    function s(n, a, l) {
      n.clearRect(0, 0, a.width, a.height), a.style || (a.style = {}), a.height = l, a.width = l, a.style.height = l + "px", a.style.width = l + "px";
    }
    function o() {
      try {
        return document.createElement("canvas");
      } catch {
        throw new Error("You need to specify a canvas element");
      }
    }
    e.render = function(a, l, i) {
      let c = i, u = l;
      typeof c > "u" && (!l || !l.getContext) && (c = l, l = void 0), l || (u = o()), c = t.getOptions(c);
      const f = t.getImageWidth(a.modules.size, c), h = u.getContext("2d"), m = h.createImageData(f, f);
      return t.qrToImageData(m.data, a, c), s(h, u, f), h.putImageData(m, 0, 0), u;
    }, e.renderToDataURL = function(a, l, i) {
      let c = i;
      typeof c > "u" && (!l || !l.getContext) && (c = l, l = void 0), c || (c = {});
      const u = e.render(a, l, c), f = c.type || "image/png", h = c.rendererOpts || {};
      return u.toDataURL(f, h.quality);
    };
  })(gr)), gr;
}
var yr = {}, sn;
function hd() {
  if (sn) return yr;
  sn = 1;
  const e = po();
  function t(n, a) {
    const l = n.a / 255, i = a + '="' + n.hex + '"';
    return l < 1 ? i + " " + a + '-opacity="' + l.toFixed(2).slice(1) + '"' : i;
  }
  function s(n, a, l) {
    let i = n + a;
    return typeof l < "u" && (i += " " + l), i;
  }
  function o(n, a, l) {
    let i = "", c = 0, u = !1, f = 0;
    for (let h = 0; h < n.length; h++) {
      const m = Math.floor(h % a), y = Math.floor(h / a);
      !m && !u && (u = !0), n[h] ? (f++, h > 0 && m > 0 && n[h - 1] || (i += u ? s("M", m + l, 0.5 + y + l) : s("m", c, 0), c = 0, u = !1), m + 1 < a && n[h + 1] || (i += s("h", f), f = 0)) : c++;
    }
    return i;
  }
  return yr.render = function(a, l, i) {
    const c = e.getOptions(l), u = a.modules.size, f = a.modules.data, h = u + c.margin * 2, m = c.color.light.a ? "<path " + t(c.color.light, "fill") + ' d="M0 0h' + h + "v" + h + 'H0z"/>' : "", y = "<path " + t(c.color.dark, "stroke") + ' d="' + o(f, u, c.margin) + '"/>', w = 'viewBox="0 0 ' + h + " " + h + '"', E = '<svg xmlns="http://www.w3.org/2000/svg" ' + (c.width ? 'width="' + c.width + '" height="' + c.width + '" ' : "") + w + ' shape-rendering="crispEdges">' + m + y + `</svg>
`;
    return typeof i == "function" && i(null, E), E;
  }, yr;
}
var nn;
function fd() {
  if (nn) return Ge;
  nn = 1;
  const e = Gl(), t = dd(), s = ud(), o = hd();
  function n(a, l, i, c, u) {
    const f = [].slice.call(arguments, 1), h = f.length, m = typeof f[h - 1] == "function";
    if (!m && !e())
      throw new Error("Callback required as last argument");
    if (m) {
      if (h < 2)
        throw new Error("Too few arguments provided");
      h === 2 ? (u = i, i = l, l = c = void 0) : h === 3 && (l.getContext && typeof u > "u" ? (u = c, c = void 0) : (u = c, c = i, i = l, l = void 0));
    } else {
      if (h < 1)
        throw new Error("Too few arguments provided");
      return h === 1 ? (i = l, l = c = void 0) : h === 2 && !l.getContext && (c = i, i = l, l = void 0), new Promise(function(y, w) {
        try {
          const p = t.create(i, c);
          y(a(p, l, c));
        } catch (p) {
          w(p);
        }
      });
    }
    try {
      const y = t.create(i, c);
      u(null, a(y, l, c));
    } catch (y) {
      u(y);
    }
  }
  return Ge.create = t.create, Ge.toCanvas = n.bind(null, s.render), Ge.toDataURL = n.bind(null, s.renderToDataURL), Ge.toString = n.bind(null, function(a, l, i) {
    return o.render(a, i);
  }), Ge;
}
var md = fd();
const pd = /* @__PURE__ */ Ln(md);
function gd({ value: e, size: t = 200, alt: s = "QR code", className: o = "" }) {
  const n = J(null), [a, l] = L(null);
  return W(() => {
    !n.current || !e || pd.toCanvas(n.current, e, {
      width: t,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
      errorCorrectionLevel: "M"
    }).then(() => {
      l(null);
    }).catch((i) => {
      l(i instanceof Error ? i.message : "Failed to generate QR code");
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
function go() {
  const { config: e, _internal: t } = ne(), [s, o] = L(null), [n, a] = L("idle"), [l, i] = L(null), [c, u] = L(!1), [f, h] = L(null), m = V(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t]
  ), y = T(async () => {
    u(!0), h(null);
    try {
      const x = await m.get("/mfa/status");
      return o(x), x;
    } catch (x) {
      const R = j(x, "Unable to load two-factor authentication status. Please try again.");
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
      const R = j(x, "Unable to start two-factor setup. Please try again.");
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
        const g = j(R, "Incorrect verification code. Please check and try again.");
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
        const g = j(R, "Unable to disable two-factor authentication. Please try again.");
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
        const g = j(R, "Unable to regenerate recovery codes. Please try again.");
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
    status: s,
    setupState: n,
    setupData: l,
    isLoading: c,
    error: f,
    getStatus: y,
    beginSetup: w,
    enableTotp: p,
    disableTotp: E,
    regenerateBackupCodes: A,
    clearError: C,
    reset: N
  };
}
function wo({ onSuccess: e, onCancel: t, className: s = "" }) {
  const { setupState: o, setupData: n, isLoading: a, error: l, beginSetup: i, enableTotp: c, clearError: u, reset: f } = go(), [h, m] = L("qr"), [y, w] = L(""), [p, E] = L(!1), [A, C] = L(!1), N = J(null);
  W(() => {
    o === "idle" && i().catch(() => {
    });
  }, [o, i]), W(() => {
    o === "success" && e?.();
  }, [o, e]);
  const x = async () => {
    n?.secret && (await navigator.clipboard.writeText(n.secret), E(!0), N.current !== null && window.clearTimeout(N.current), N.current = window.setTimeout(() => E(!1), 2e3));
  }, R = async () => {
    if (n?.recoveryCodes) {
      const v = n.recoveryCodes.join(`
`);
      await navigator.clipboard.writeText(v);
    }
  }, g = async () => {
    try {
      await c(y);
    } catch {
      w("");
    }
  }, k = () => {
    f(), t?.();
  };
  return W(() => () => {
    N.current !== null && (window.clearTimeout(N.current), N.current = null);
  }, []), o === "loading" || o === "idle" && a ? /* @__PURE__ */ r("div", { className: `cedros-totp-setup ${s}`, children: /* @__PURE__ */ r("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ r($, { size: "lg", label: "Setting up two-factor authentication" }) }) }) : o === "error" && !n ? /* @__PURE__ */ d("div", { className: `cedros-totp-setup ${s}`, children: [
    /* @__PURE__ */ r(se, { error: l, onDismiss: u }),
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
      /* @__PURE__ */ r("div", { className: "cedros-totp-qr", children: /* @__PURE__ */ r(gd, { value: n.otpauthUri, size: 200, alt: "QR code for authenticator app" }) }),
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
      /* @__PURE__ */ r("div", { className: "cedros-totp-backup-codes", children: n.recoveryCodes.map((v, b) => /* @__PURE__ */ r("code", { className: "cedros-totp-backup-code", children: v }, b)) }),
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
        kn,
        {
          value: y,
          onChange: w,
          onComplete: g,
          disabled: a,
          error: l?.message,
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
            disabled: a || y.length !== 6,
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
function wd({ onStatusChange: e, className: t = "" }) {
  const { status: s, isLoading: o, error: n, getStatus: a, disableTotp: l, regenerateBackupCodes: i, clearError: c } = go(), [u, f] = L("status"), [h, m] = L(""), [y, w] = L(""), [p, E] = L(null), [A, C] = L(!1), [N, x] = L(null);
  W(() => {
    a().catch(() => {
    });
  }, [a]);
  const R = T(() => {
    f("status"), e?.(!0);
  }, [e]), g = async () => {
    C(!0), x(null);
    try {
      await l(h), f("status"), m(""), e?.(!1);
    } catch (b) {
      x(b instanceof Error ? b.message : "Failed to disable 2FA"), m("");
    } finally {
      C(!1);
    }
  }, k = async () => {
    C(!0), x(null);
    try {
      const b = await i(y);
      E(b.recoveryCodes), w("");
    } catch (b) {
      x(b instanceof Error ? b.message : "Failed to regenerate codes"), w("");
    } finally {
      C(!1);
    }
  }, v = async () => {
    p && await navigator.clipboard.writeText(p.join(`
`));
  };
  return o && !s ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ r("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ r($, { size: "md", label: "Loading security settings" }) }) }) : n && !s ? /* @__PURE__ */ d("div", { className: `cedros-totp-settings ${t}`, children: [
    /* @__PURE__ */ r(se, { error: n, onDismiss: c }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => a(),
        children: "Retry"
      }
    )
  ] }) : u === "setup" ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ r(wo, { onSuccess: R, onCancel: () => f("status") }) }) : u === "disable" ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Disable two-factor authentication" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description cedros-totp-warning", children: "This will make your account less secure. Enter your password to confirm." }),
    N && /* @__PURE__ */ r("div", { className: "cedros-totp-error", children: /* @__PURE__ */ r(
      se,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => x(null)
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ r(
      ge,
      {
        label: "Password",
        placeholder: "Enter your password",
        value: h,
        onChange: (b) => m(b.target.value),
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
            /* @__PURE__ */ r($, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Disabling..." })
          ] }) : "Disable 2FA"
        }
      )
    ] })
  ] }) }) : u === "regenerate" ? p ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "New recovery codes" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. Your old codes are no longer valid." }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-backup-codes", children: p.map((b, P) => /* @__PURE__ */ r("code", { className: "cedros-totp-backup-code", children: b }, P)) }),
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
      se,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => x(null)
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ r(
      kn,
      {
        value: y,
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
          disabled: A || y.length !== 6,
          children: A ? /* @__PURE__ */ d(X, { children: [
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
class yd {
  client;
  constructor(t, s, o, n) {
    this.client = new ce({ baseUrl: t, timeoutMs: s, retryAttempts: o, getAccessToken: n });
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
      throw j(s, "Failed to change password");
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
      throw j(s, "Failed to update profile");
    }
  }
}
function Rt() {
  const { config: e, authState: t, _internal: s } = ne(), [o, n] = L(!1), [a, l] = L(null), i = V(
    () => new yd(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), c = T(() => {
    l(null);
  }, []), u = T(
    async (h) => {
      if (t !== "authenticated")
        throw new Error("Must be authenticated to update profile");
      n(!0), l(null);
      try {
        return await i.updateProfile(h);
      } catch (m) {
        const y = m instanceof Error ? m : new Error("Failed to update profile");
        throw l(y), y;
      } finally {
        n(!1);
      }
    },
    [t, i]
  ), f = T(
    async (h) => {
      if (t !== "authenticated")
        throw new Error("Must be authenticated to change password");
      n(!0), l(null);
      try {
        await i.changePassword(h);
      } catch (m) {
        const y = m instanceof Error ? m : new Error("Failed to change password");
        throw l(y), y;
      } finally {
        n(!1);
      }
    },
    [t, i]
  );
  return {
    isLoading: o,
    error: a,
    updateProfile: u,
    changePassword: f,
    clearError: c
  };
}
function ah({
  onPasswordChange: e,
  onClose: t,
  className: s = ""
}) {
  const { user: o, refreshUser: n } = St(), { config: a, _internal: l } = ne(), { isLoading: i, error: c, changePassword: u, clearError: f } = Rt(), [h, m] = L("main"), [y, w] = L(""), [p, E] = L(""), [A, C] = L(""), [N, x] = L(null), [R, g] = L(null), [k, v] = L(!1), b = J(null), P = Bt(p), S = p === A, I = y.length > 0 && p.length > 0 && A.length > 0 && P.isValid && S, B = T(
    async (F) => {
      const H = F.target.files?.[0];
      if (H) {
        x(null), v(!0);
        try {
          const q = new FormData();
          q.append("file", H);
          const D = l?.getAccessToken?.(), U = {};
          D && (U.Authorization = `Bearer ${D}`);
          const G = await fetch(`${a.serverUrl}/auth/upload/avatar`, {
            method: "POST",
            headers: U,
            body: q,
            credentials: "include"
          });
          if (!G.ok) {
            const ee = await G.json().catch(() => null);
            throw new Error(ee?.message || ee?.error || `Upload failed (${G.status})`);
          }
          await n();
        } catch (q) {
          x(q instanceof Error ? q.message : "Failed to upload avatar");
        } finally {
          v(!1), b.current && (b.current.value = "");
        }
      }
    },
    [a.serverUrl, l, n]
  ), M = T(async () => {
    if (I) {
      x(null), g(null);
      try {
        await u({
          currentPassword: y,
          newPassword: p
        }), w(""), E(""), C(""), g("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => {
          m("main"), g(null);
        }, 2e3);
      } catch (F) {
        x(F instanceof Error ? F.message : "Failed to change password");
      }
    }
  }, [I, y, p, u, e]), _ = T(() => {
    m("main"), w(""), E(""), C(""), x(null), f();
  }, [f]), O = () => o?.name ? o.name.split(" ").map((F) => F[0]).join("").toUpperCase().slice(0, 2) : o?.email ? o.email[0].toUpperCase() : "?";
  return h === "change-password" ? /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (N || c) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      se,
      {
        error: { code: "UNKNOWN_ERROR", message: N || c?.message || "" },
        onDismiss: () => {
          x(null), f();
        }
      }
    ) }),
    R && /* @__PURE__ */ d("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ r("span", { className: "cedros-profile-success-icon", children: "✓" }),
      R
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        ge,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: y,
          onChange: (F) => w(F.target.value),
          disabled: i,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        ge,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: p,
          onChange: (F) => E(F.target.value),
          disabled: i,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        ge,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: A,
          onChange: (F) => C(F.target.value),
          disabled: i,
          error: A.length > 0 && !S ? "Passwords do not match" : void 0
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
          disabled: i,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: M,
          disabled: i || !I,
          children: i ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r($, { size: "sm" }),
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
          onClick: () => b.current?.click(),
          role: "button",
          tabIndex: 0,
          onKeyDown: (F) => {
            (F.key === "Enter" || F.key === " ") && (F.preventDefault(), b.current?.click());
          },
          "aria-label": "Change profile picture",
          children: [
            k ? /* @__PURE__ */ r("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: /* @__PURE__ */ r($, { size: "sm" }) }) : o?.picture ? /* @__PURE__ */ r(
              "img",
              {
                src: o.picture,
                alt: o.name || "Profile",
                className: "cedros-profile-avatar"
              }
            ) : /* @__PURE__ */ r("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: O() }),
            /* @__PURE__ */ r("div", { className: "cedros-profile-avatar-overlay", children: /* @__PURE__ */ d("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ r("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
              /* @__PURE__ */ r("circle", { cx: "12", cy: "13", r: "4" })
            ] }) }),
            /* @__PURE__ */ r(
              "input",
              {
                ref: b,
                type: "file",
                accept: "image/jpeg,image/png,image/gif,image/webp",
                onChange: B,
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
            onClick: () => m("change-password"),
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
class bd {
  client;
  constructor(t, s, o, n) {
    this.client = new ce({ baseUrl: t, timeoutMs: s, retryAttempts: o, getAccessToken: n });
  }
  /**
   * List all credentials linked to the current user
   */
  async listCredentials() {
    try {
      return (await this.client.get("/credentials")).credentials;
    } catch (t) {
      throw j(t, "Failed to list credentials");
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
      throw j(s, "Failed to unlink credential");
    }
  }
}
function yo() {
  const { config: e, authState: t, _internal: s } = ne(), [o, n] = L([]), [a, l] = L(!1), [i, c] = L(null), u = V(
    () => new bd(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), f = T(() => {
    c(null);
  }, []), h = T(async () => {
    if (t !== "authenticated") {
      n([]);
      return;
    }
    l(!0), c(null);
    try {
      const y = await u.listCredentials();
      n(y);
    } catch (y) {
      c(y);
    } finally {
      l(!1);
    }
  }, [t, u]);
  W(() => {
    t === "authenticated" ? h() : n([]);
  }, [t, h]);
  const m = T(
    async (y) => {
      l(!0), c(null);
      try {
        await u.unlinkCredential(y), await h();
      } catch (w) {
        throw c(w), w;
      } finally {
        l(!1);
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
function Ad({
  onPasswordChange: e,
  onCancel: t,
  className: s = ""
}) {
  const { isLoading: o, error: n, changePassword: a, clearError: l } = Rt(), [i, c] = L(""), [u, f] = L(""), [h, m] = L(""), [y, w] = L(null), [p, E] = L(null), A = Bt(u), C = u === h, N = i.length > 0 && u.length > 0 && h.length > 0 && A.isValid && C, x = T(async () => {
    if (N) {
      w(null), E(null);
      try {
        await a({ currentPassword: i, newPassword: u }), c(""), f(""), m(""), E("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => t(), 2e3);
      } catch (g) {
        w(g instanceof Error ? g.message : "Failed to change password");
      }
    }
  }, [N, i, u, a, e, t]), R = T(() => {
    w(null), l(), t();
  }, [l, t]);
  return /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${s}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (y || n) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      se,
      {
        error: { code: "UNKNOWN_ERROR", message: y || n?.message || "" },
        onDismiss: () => {
          w(null), l();
        }
      }
    ) }),
    p && /* @__PURE__ */ d("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ r("span", { className: "cedros-profile-success-icon", children: "✓" }),
      p
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        ge,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: i,
          onChange: (g) => c(g.target.value),
          disabled: o,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        ge,
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
        ge,
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
            /* @__PURE__ */ r($, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) });
}
function vd({ onPasswordChange: e, className: t = "" }) {
  const { user: s, refreshUser: o } = St(), { isLoading: n, error: a, updateProfile: l, clearError: i } = Rt(), { credentials: c } = yo(), {
    forgotPassword: u,
    isLoading: f,
    isSuccess: h,
    reset: m
  } = zr(), y = c.some((b) => b.credentialType === "password"), [w, p] = L("view"), [E, A] = L(""), [C, N] = L(null), x = () => s?.name ? s.name.split(" ").map((b) => b[0]).join("").toUpperCase().slice(0, 2) : s?.email ? s.email[0].toUpperCase() : "?", R = T(() => {
    A(s?.name || ""), p("edit"), N(null);
  }, [s?.name]), g = T(async () => {
    const b = E.trim();
    if (b) {
      N(null);
      try {
        await l({ name: b }), await o(), p("view");
      } catch (P) {
        N(P instanceof Error ? P.message : "Failed to update name");
      }
    }
  }, [E, l, o]), k = T(() => {
    p("view"), A(""), N(null), i();
  }, [i]), v = T(async () => {
    if (s?.email) {
      N(null);
      try {
        await u(s.email);
      } catch (b) {
        N(b instanceof Error ? b.message : "Failed to send password setup email");
      }
    }
  }, [s?.email, u]);
  return w === "change-password" ? /* @__PURE__ */ r(
    Ad,
    {
      onPasswordChange: e,
      onCancel: () => p("view"),
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
              value: E,
              onChange: (b) => A(b.target.value),
              disabled: n,
              autoFocus: !0,
              onKeyDown: (b) => {
                b.key === "Enter" && g(), b.key === "Escape" && k();
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
                disabled: n || !E.trim(),
                children: n ? /* @__PURE__ */ r($, { size: "sm" }) : "Save"
              }
            ),
            /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-outline cedros-button-sm",
                onClick: k,
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
              onClick: R,
              title: "Edit name",
              "aria-label": "Edit name",
              children: /* @__PURE__ */ r(kd, {})
            }
          )
        ] }),
        /* @__PURE__ */ r("p", { className: "cedros-profile-email", children: s?.email })
      ] })
    ] }),
    (C || a) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      se,
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
        /* @__PURE__ */ r("span", { className: "cedros-profile-row-value", children: s?.email || "Not set" })
      ] }) }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ d("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-label", children: "Password" }),
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-value", children: y ? "••••••••" : "Not set" })
        ] }),
        y ? /* @__PURE__ */ r(
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
            children: f ? /* @__PURE__ */ r($, { size: "sm" }) : "Add password"
          }
        )
      ] })
    ] })
  ] }) });
}
function kd() {
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
const bo = {
  password: "Email & Password",
  oauth_google: "Google",
  oauth_apple: "Apple",
  solana: "Solana Wallet",
  webauthn_passkey: "Passkey",
  webauthn_security_key: "Security Key",
  totp: "Authenticator App (2FA)",
  sso_oidc: "Single Sign-On"
};
function Nd({
  onLinkGoogle: e,
  onLinkApple: t,
  onAddPasskey: s,
  onLinkSolana: o,
  className: n = ""
}) {
  const { credentials: a, isLoading: l, error: i, unlinkCredential: c, clearError: u, fetchCredentials: f } = yo(), { registerPasskey: h, isSupported: m } = co(), [y, w] = L(null), [p, E] = L(!1), A = T(async () => {
    if (s) {
      s();
      return;
    }
    E(!0);
    try {
      await h(), await f();
    } catch {
    } finally {
      E(!1);
    }
  }, [s, h, f]), C = T(
    async (b) => {
      const P = b.label || bo[b.credentialType];
      if (window.confirm(
        `Remove "${P}" as a sign-in method? You won't be able to sign in with it anymore.`
      )) {
        w(b.id);
        try {
          await c(b.id);
        } catch {
        } finally {
          w(null);
        }
      }
    },
    [c]
  ), N = new Set(a.map((b) => b.credentialType)), x = e && !N.has("oauth_google"), R = t && !N.has("oauth_apple"), g = (s || m) && !N.has("webauthn_passkey"), k = o && !N.has("solana"), v = x || R || g || k;
  return l && a.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-linked-accounts ${n}`, children: [
    /* @__PURE__ */ r($, {}),
    /* @__PURE__ */ r("span", { children: "Loading linked accounts..." })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-linked-accounts ${n}`, children: [
    i && /* @__PURE__ */ r(
      se,
      {
        error: { code: "UNKNOWN_ERROR", message: i.message },
        onDismiss: u
      }
    ),
    a.length === 0 && !l && /* @__PURE__ */ r("p", { className: "cedros-linked-accounts-empty", children: "No linked sign-in methods found." }),
    a.length > 0 && /* @__PURE__ */ r("ul", { className: "cedros-linked-credential-list", children: a.map((b) => /* @__PURE__ */ r(
      Ed,
      {
        credential: b,
        isUnlinking: y === b.id,
        onUnlink: C
      },
      b.id
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
              /* @__PURE__ */ r(Ao, {}),
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
              /* @__PURE__ */ r(vo, {}),
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
            children: p ? /* @__PURE__ */ r($, { size: "sm" }) : /* @__PURE__ */ d(X, { children: [
              /* @__PURE__ */ r(Rr, {}),
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
              /* @__PURE__ */ r(ko, {}),
              " Solana"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function Ed({
  credential: e,
  isUnlinking: t,
  onUnlink: s
}) {
  const o = e.label || bo[e.credentialType], n = Cd[e.credentialType] || xd;
  return /* @__PURE__ */ d("li", { className: "cedros-linked-credential", children: [
    /* @__PURE__ */ r("div", { className: "cedros-linked-credential__icon", children: /* @__PURE__ */ r(n, {}) }),
    /* @__PURE__ */ d("div", { className: "cedros-linked-credential__info", children: [
      /* @__PURE__ */ r("span", { className: "cedros-linked-credential__name", children: o }),
      /* @__PURE__ */ d("span", { className: "cedros-linked-credential__meta", children: [
        "Added ",
        on(e.createdAt),
        e.lastUsedAt && /* @__PURE__ */ d(X, { children: [
          " · Last used ",
          on(e.lastUsedAt)
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
        children: t ? /* @__PURE__ */ r($, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function on(e) {
  const t = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - t.getTime(), n = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), l = Math.floor(o / (1e3 * 60 * 60 * 24));
  return n < 1 ? "just now" : n < 60 ? `${n}m ago` : a < 24 ? `${a}h ago` : l < 30 ? `${l}d ago` : t.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
const Cd = {
  password: Sd,
  oauth_google: Ao,
  oauth_apple: vo,
  solana: ko,
  webauthn_passkey: Rr,
  webauthn_security_key: Rr,
  totp: Ld,
  sso_oidc: Bd
};
function xd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M12 8v4m0 4h.01", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function Sd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M7 11V7a5 5 0 0110 0v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ r("circle", { cx: "12", cy: "16", r: "1.5", fill: "currentColor" })
  ] });
}
function Ao() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("path", { d: "M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 01-2 3.1v2.5h3.3c1.9-1.7 3-4.3 3-7.4z", fill: "#4285F4" }),
    /* @__PURE__ */ r("path", { d: "M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.5c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.4-4H3.2v2.6A10 10 0 0012 22z", fill: "#34A853" }),
    /* @__PURE__ */ r("path", { d: "M6.6 14.1a6 6 0 010-4.2V7.3H3.2a10 10 0 000 9.4l3.4-2.6z", fill: "#FBBC05" }),
    /* @__PURE__ */ r("path", { d: "M12 5.9c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0012 2 10 10 0 003.2 7.3l3.4 2.6C7.3 7.6 9.5 5.9 12 5.9z", fill: "#EA4335" })
  ] });
}
function vo() {
  return /* @__PURE__ */ r("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r(
    "path",
    {
      d: "M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.16 4.36 9.53 8.72 9.28c1.3.07 2.2.74 2.96.8.93-.2 1.82-.92 3.03-.83 1.47.12 2.57.72 3.28 1.83-3.02 1.8-2.3 5.75.5 6.86-.6 1.53-1.37 3.04-2.44 4.34zM12.03 9.2C11.88 7.17 13.5 5.5 15.4 5.35c.29 2.28-2.08 3.98-3.37 3.85z",
      fill: "currentColor"
    }
  ) });
}
function ko() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "2", y: "6", width: "20", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M2 10h20", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("circle", { cx: "17", cy: "14", r: "1.5", fill: "currentColor" })
  ] });
}
function Rr() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("circle", { cx: "10", cy: "7", r: "4", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M3 21v-2a7 7 0 017-7", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ r("path", { d: "M17 14v4m0 0v2m0-2h-2m2 0h2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function Ld() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M9 12h6M12 9v6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function Bd() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "3", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "13", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "3", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "13", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" })
  ] });
}
class Pd {
  client;
  constructor(t, s, o, n) {
    this.client = new ce({ baseUrl: t, timeoutMs: s, retryAttempts: o, getAccessToken: n });
  }
  /**
   * List all active sessions for the current user
   */
  async listSessions() {
    try {
      return (await this.client.get("/sessions")).sessions;
    } catch (t) {
      throw j(t, "Failed to list sessions");
    }
  }
  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions() {
    try {
      return await this.client.delete("/sessions");
    } catch (t) {
      throw j(t, "Failed to revoke sessions");
    }
  }
}
function Rd() {
  const { config: e, authState: t, _internal: s } = ne(), [o, n] = L([]), [a, l] = L(!1), [i, c] = L(null), u = V(
    () => new Pd(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), f = T(async () => {
    if (t !== "authenticated") {
      n([]);
      return;
    }
    l(!0), c(null);
    try {
      const y = await u.listSessions();
      n(y);
    } catch (y) {
      c(y);
    } finally {
      l(!1);
    }
  }, [t, u]);
  W(() => {
    t === "authenticated" ? f() : n([]);
  }, [t, f]);
  const h = T(async () => {
    l(!0), c(null);
    try {
      const y = await u.revokeAllSessions();
      return await f(), y;
    } catch (y) {
      throw c(y), y;
    } finally {
      l(!1);
    }
  }, [u, f]), m = V(() => o.filter((y) => !y.isCurrent).length, [o]);
  return {
    sessions: o,
    isLoading: a,
    error: i,
    fetchSessions: f,
    revokeAllSessions: h,
    otherSessionCount: m
  };
}
const Td = {
  profile: "Profile",
  security: "Security",
  linked: "Linked Accounts"
}, Id = ["profile", "security", "linked"];
function ih({
  defaultTab: e = "profile",
  onClose: t,
  onPasswordChange: s,
  onTotpChange: o,
  onLinkGoogle: n,
  onLinkApple: a,
  onAddPasskey: l,
  onLinkSolana: i,
  className: c = ""
}) {
  const [u, f] = L(e), { sessions: h, isLoading: m, error: y, revokeAllSessions: w } = Rd();
  return /* @__PURE__ */ d("div", { className: `cedros-account-settings ${c}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-account-tabs--line", role: "tablist", children: Id.map((p) => /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        role: "tab",
        "aria-selected": u === p,
        className: `cedros-account-tab ${u === p ? "cedros-account-tab-active" : ""}`,
        onClick: () => f(p),
        children: Td[p]
      },
      p
    )) }),
    /* @__PURE__ */ d("div", { className: "cedros-account-tab-content", role: "tabpanel", children: [
      u === "profile" && /* @__PURE__ */ r(vd, { onPasswordChange: s }),
      u === "security" && /* @__PURE__ */ d("div", { className: "cedros-account-security", children: [
        /* @__PURE__ */ r(wd, { onStatusChange: o }),
        /* @__PURE__ */ r(
          Zc,
          {
            sessions: h,
            isLoading: m,
            error: y ?? void 0,
            onRevokeAll: async () => {
              await w();
            }
          }
        )
      ] }),
      u === "linked" && /* @__PURE__ */ r(
        Nd,
        {
          onLinkGoogle: n,
          onLinkApple: a,
          onAddPasskey: l,
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
function ch({ onComplete: e, className: t }) {
  return /* @__PURE__ */ d("div", { className: `cedros-mfa-setup-prompt ${t ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-mfa-setup-prompt__header", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-mfa-setup-prompt__title", children: "Two-factor authentication required" }),
      /* @__PURE__ */ r("p", { className: "cedros-mfa-setup-prompt__description", children: "Your administrator requires you to set up two-factor authentication before continuing. This adds an extra layer of security to your account." })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-mfa-setup-prompt__body", children: /* @__PURE__ */ r(wo, { onSuccess: e }) })
  ] });
}
function lh({
  onComplete: e,
  onSkip: t,
  className: s
}) {
  const { user: o } = St(), { isLoading: n, error: a, updateProfile: l, clearError: i } = Rt(), [c, u] = L(o?.name ?? ""), f = T(
    async (m) => {
      m.preventDefault(), i();
      const y = c.trim();
      if (!y) {
        e?.();
        return;
      }
      try {
        await l({ name: y }), e?.();
      } catch {
      }
    },
    [c, l, i, e]
  ), h = c.trim().length > 0;
  return /* @__PURE__ */ d("div", { className: `cedros-complete-account ${s ?? ""}`, children: [
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
            value: c,
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
function Md() {
  const { config: e, _internal: t } = ne(), [s, o] = L(!1), [n, a] = L(null), l = V(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), i = T(
    async (f) => await l.get(
      `/username/available?username=${encodeURIComponent(f)}`,
      { credentials: "include" }
    ),
    [l]
  ), c = T(async () => {
    try {
      return (await l.get(
        "/username/available?username=",
        { credentials: "include" }
      )).suggestion ?? null;
    } catch {
      return null;
    }
  }, [l]), u = T(
    async (f) => {
      o(!0), a(null);
      try {
        await l.patch("/me", { username: f });
      } catch (h) {
        const m = h instanceof Error ? h : new Error(String(h));
        throw a(m), m;
      } finally {
        o(!1);
      }
    },
    [l]
  );
  return { checkAvailability: i, getSuggestion: c, setUsername: u, isLoading: s, error: n };
}
function dh({
  onComplete: e,
  onSkip: t,
  className: s
}) {
  const { checkAvailability: o, getSuggestion: n, setUsername: a, isLoading: l, error: i } = Md(), [c, u] = L(""), [f, h] = L("idle"), [m, y] = L(""), w = J(null), p = J(!0);
  W(() => (p.current = !0, n().then((N) => {
    p.current && N && (u(N), h("available"), y("Available"));
  }), () => {
    p.current = !1;
  }), [n]);
  const E = T(
    (N) => {
      const x = N.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (u(x), h("idle"), y(""), w.current && clearTimeout(w.current), x.length < 3) {
        x.length > 0 && (h("error"), y("At least 3 characters"));
        return;
      }
      h("checking"), w.current = setTimeout(async () => {
        try {
          const R = await o(x);
          if (!p.current) return;
          R.error ? (h("error"), y(R.error)) : R.available ? (h("available"), y("Available")) : (h("taken"), y("Already taken"), R.suggestion);
        } catch {
          if (!p.current) return;
          h("error"), y("Could not check availability");
        }
      }, 400);
    },
    [o]
  ), A = T(
    async (N) => {
      if (N.preventDefault(), !(f !== "available" || !c.trim()))
        try {
          await a(c.trim()), e?.();
        } catch {
        }
    },
    [c, f, a, e]
  ), C = f === "available" && !l;
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
            children: l ? "Saving..." : "Continue"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-choose-username__button cedros-choose-username__button--secondary",
            onClick: t,
            disabled: l,
            children: "Skip"
          }
        )
      ] })
    ] })
  ] });
}
function _d() {
  const e = We(), [t, s] = L(!1), [o, n] = L(null), a = V(() => e ? new ce({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), l = T(() => {
    n(null);
  }, []), i = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      if (!Number.isInteger(w) || w <= 0) {
        const p = new Error(
          `Invalid deposit amount: ${w}. Must be a positive integer (lamports).`
        );
        throw n(p.message), p;
      }
      s(!0), n(null);
      try {
        return await a.post("/deposit", {
          amount_lamports: w
        });
      } catch (p) {
        const E = j(p, "Failed to execute deposit");
        throw n(E.message), E;
      } finally {
        s(!1);
      }
    },
    [a]
  ), c = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      return await a.get(`/deposit/status/${encodeURIComponent(w)}`);
    },
    [a]
  ), u = T(async () => {
    if (!a)
      throw new Error("useDeposit must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await a.get("/deposit/config");
    } catch (w) {
      const p = j(w, "Failed to get deposit config");
      throw n(p.message), p;
    } finally {
      s(!1);
    }
  }, [a]), f = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const p = new URLSearchParams();
        w?.limit !== void 0 && p.set("limit", String(w.limit)), w?.offset !== void 0 && p.set("offset", String(w.offset));
        const E = p.toString(), A = E ? `/deposits?${E}` : "/deposits";
        return await a.get(A);
      } catch (p) {
        const E = j(p, "Failed to list deposits");
        throw n(E.message), E;
      } finally {
        s(!1);
      }
    },
    [a]
  ), h = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const p = new URLSearchParams({
          input_mint: w.inputMint,
          amount: String(w.amount),
          taker: w.taker
        });
        return await a.get(`/deposit/quote?${p}`);
      } catch (p) {
        const E = j(p, "Failed to get deposit quote");
        throw n(E.message), E;
      } finally {
        s(!1);
      }
    },
    [a]
  ), m = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await a.post("/deposit/public", w);
      } catch (p) {
        const E = j(p, "Failed to execute public deposit");
        throw n(E.message), E;
      } finally {
        s(!1);
      }
    },
    [a]
  ), y = T(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await a.post("/deposit/micro", w);
      } catch (p) {
        const E = j(p, "Failed to execute micro deposit");
        throw n(E.message), E;
      } finally {
        s(!1);
      }
    },
    [a]
  );
  return {
    deposit: i,
    getQuote: h,
    publicDeposit: m,
    microDeposit: y,
    getStatus: c,
    getConfig: u,
    listDeposits: f,
    isLoading: t,
    error: o,
    clearError: l
  };
}
function No({
  tokens: e,
  selectedToken: t,
  onSelect: s,
  openSignal: o,
  placeholder: n = "Select token",
  disabled: a = !1,
  className: l = "",
  searchable: i = !0
}) {
  const [c, u] = L(!1), [f, h] = L(""), m = J(null), y = J(null), w = V(() => {
    if (!f.trim()) return e;
    const C = f.toLowerCase();
    return e.filter(
      (N) => N.symbol.toLowerCase().includes(C) || N.name.toLowerCase().includes(C) || N.mint.toLowerCase().includes(C)
    );
  }, [e, f]);
  W(() => {
    const C = (N) => {
      m.current && !m.current.contains(N.target) && (u(!1), h(""));
    };
    if (c)
      return document.addEventListener("mousedown", C), () => document.removeEventListener("mousedown", C);
  }, [c]), W(() => {
    c && i && y.current && y.current.focus();
  }, [c, i]), W(() => {
    o === void 0 || a || (u(!0), h(""));
  }, [o, a]);
  const p = T(() => {
    a || (u((C) => !C), c && h(""));
  }, [a, c]), E = T(
    (C) => {
      s(C), u(!1), h("");
    },
    [s]
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
      className: `cedros-token-selector ${c ? "cedros-token-selector-open" : ""} ${a ? "cedros-token-selector-disabled" : ""} ${l}`,
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
            "aria-expanded": c,
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
              ] }) : /* @__PURE__ */ r("span", { className: "cedros-token-selector-placeholder", children: n }),
              /* @__PURE__ */ r("span", { className: "cedros-token-selector-arrow", children: c ? "▲" : "▼" })
            ]
          }
        ),
        c && /* @__PURE__ */ d("div", { className: "cedros-token-selector-dropdown", role: "listbox", children: [
          i && /* @__PURE__ */ r("div", { className: "cedros-token-search", children: /* @__PURE__ */ r(
            "input",
            {
              ref: y,
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
function $r(e, t) {
  return t.privateDepositsEnabled && e >= t.privateMinUsd ? "private" : e >= t.publicMinUsd ? "public" : "sol_micro";
}
const Gr = "data:image/webp;base64,UklGRkACAABXRUJQVlA4IDQCAACQDQCdASo8ADwAPjEWiUMiISEUBFQgAwSgB4Z/TeLt3XMAoQH23eph0gPMB+sn+M9tvngOsA9ADwgPg3/cH9sfZciikEBuA1AB+nf+84CUkAVvA2x4xvyobR+mBaYhjUv/ewHb4hTqOnP38rzsxZX2inOSciAA/v7uqvqGdpWcjjrfMDFaNHumTog38t3yor0kbjn631VsX61cAC749wWuAX74u/f/hpeDFqS/ci8E1g94wk9UVs7BHqtv7f/M9iT1u5ITJV0Gv6tE/CW5j/nVR6yExJ6JoDRDOWQ8zVpWH92r3Lnbnc4WJpOchbRT3H5rv//6PP+F//4ehLUlR/4tkRUKZu/yOa26+sywmY+Xc1X2lXMcUv7+eQ7+FBE7bhKc7htieBfH4eR134AVaILL7PWA2FjzAjfaP1Lgirqoq/ZooE8jVD/b4g3J3O3/TG/4ajHe6clnAI/4NdwrnHX0P/quBU03HqSsQ0qsEMAuhrH/jn+YtDzmjm8q/cGJ44qvi24Hn+G1kxz2XP2S/Gp7ri5cMlo+muuwBjyNJnnEcTt/5cRdYS2cbEBZtpINWj3PuC1EOsd/8cTepSpxODcJHLzktfC1PHW3Pgoh3J5PHjW3TCQ1Wlu/wP8e8OPfNm48BODGChioj3ezblqrOBV+cI+hLi7ReJdvBF/4jY+/Un0asuWnrA6kRNpgOeO8wyl4Ryhkrff+9R1SpyPYP+5T3EuWWLZaCn0bGzyk97S3VAAAAAA=", Dd = 1e4, xt = 1e3, Eo = 3;
function Ud(e) {
  return Number.isFinite(e) ? `$${Math.round(e)}` : "$0";
}
function Fd(e, t) {
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
        detail: `SOL only under ${Ud(t.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens."
      };
  }
}
function Qr(e, t, s) {
  return Math.min(Math.max(e, t), s);
}
function Od(e, t) {
  if (t <= 0) return 0;
  const s = Qr(e / t, 0, 1);
  return Math.round(Math.pow(s, 1 / Eo) * xt);
}
function Wd(e, t) {
  const s = Qr(e / xt, 0, 1);
  return t * Math.pow(s, Eo);
}
function Co(e) {
  return e < 10 ? 0.01 : e < 100 ? 1 : e < 500 ? 5 : e < 1e3 ? 10 : e < 5e3 ? 25 : 50;
}
function qd(e) {
  return e < 1 ? 2 : 0;
}
function an(e) {
  const t = Co(e), s = Math.round(e / t) * t, o = qd(t);
  return Number(s.toFixed(o));
}
function xo({
  config: e,
  valueUsd: t,
  onChange: s,
  maxUsd: o = Dd,
  disabled: n = !1,
  className: a = ""
}) {
  const l = Qr(Number.isFinite(t) ? t : 0, 0, o), i = V(() => $r(l, e), [l, e]), c = Fd(i, e), u = Od(l, o), f = u / xt * 100;
  return /* @__PURE__ */ d("div", { className: `cedros-tiered-slider ${a}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-input-row", children: [
      /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-input", children: [
        /* @__PURE__ */ r("span", { className: "cedros-tiered-slider-currency", children: "$" }),
        /* @__PURE__ */ r(
          "input",
          {
            type: "number",
            value: l || "",
            onChange: (h) => s(an(Math.max(0, Math.min(parseFloat(h.target.value) || 0, o)))),
            placeholder: "Enter amount",
            disabled: n,
            min: 0,
            step: Co(l),
            className: "cedros-deposit-flow-input cedros-tiered-slider-input-field",
            "aria-label": "Deposit amount"
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-tier", children: [
        /* @__PURE__ */ d("span", { className: `cedros-tiered-slider-badge cedros-tiered-slider-badge-${i}`, children: [
          i === "sol_micro" && /* @__PURE__ */ r("img", { src: Gr, alt: "SOL", className: "cedros-tiered-slider-badge-icon" }),
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
        max: xt,
        step: 1,
        value: u,
        onChange: (h) => s(an(Wd(parseFloat(h.target.value), o))),
        className: "cedros-tiered-slider-range",
        style: {
          background: `linear-gradient(to right, var(--cedros-primary) 0%, var(--cedros-primary) ${f}%, var(--cedros-border) ${f}%, var(--cedros-border) 100%)`
        },
        disabled: n,
        "aria-label": "Deposit amount slider"
      }
    ),
    c.note && /* @__PURE__ */ r("div", { className: "cedros-tiered-slider-note", children: c.note })
  ] });
}
const jd = "data:image/webp;base64,UklGRmIEAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IIIDAADwDwCdASo8ADwAPm0qkUWkIqGWDVeYQAbEtgBOmZMBu+H816ov3b8R8R2g2FXtxdyh5s3+A60v0APLi9ktgGB/LZjWNAXqgpE6jfW0NF+P4xEhH2L7M+26iGwrTjjcQegyCZqxs+ifvZANjWd279diqZNKUrgOTVtjJGtW4IVtRhMECd5aWVgAAP7nDv3UY/8f1l//xTP/FM/8NU8c9g//sC3+bX/1HZXsNsM57VKG2LVf1a0KdncWO8uPo/Oh79m9ZqjJZwXfPXuvwkK+WDOl6+N8C2Ux6no/V/zkoucKK/JZek7MR5sS8TknXB+6BuVDXou9Rx4aUea2q2IzvLvFIujjKsVYLMab7j9zo48fhgm9YOtjmWuS0WZ4c+6ta0mr3xF4fcdAIFf6oXRSlqovOX0HUiMV//hXwSX1cfP5cLj8c7OTyT/4ce4olJARV95GoY8oF+2uU0blGul3ItlG7c2Hl2/uC6s2WZc7Zukwojx6ed8t97bZ68N1uzCLzPlG7BuYS17F19e0wXnc6vEl3q7ft0K7OEl7r8mY6Kh+Nt/5V/Lp68mFBjLem1JjvC371+lKwez4KCdXwNo2Z04FqyzGpFutY6YQ/r5Tfu7Oi+oNfN0R/W+D4aj1nqHhlqYJzpx2NK4mj0gJIXmX8EArelSQI8mV4Ux9MRPwC2PuZhLTjQZv+Vl4p0D8bSB+Z0rek3hS6G1r80fW3cn767Pz/bXanjVmm34wt1nQPqdJObrZ7vv2NWcEuQKj9d+V6DzeDrq0CtGNcanEB5MY9agi1E6BprEScTdfPXjBeMnPbpD+QO6P7IW4UZ9etCCHtX++S/fl5Iz5RzUr10ojRMw//35C0yTjSEhbe884dPwor64n//KByjUFEGsCPAAXPJp1+O+SiKfUaODq6ncjKayTHXjoXgM7XP1z4sBhIKJZJRiM7vGC/+v/Sk8/jbgZLZDAVz1vLou93y7Yd8hxcWM/BesxgWgeKvl8fjE/Ud8tQKp4425hWh66lzzwxa4J3ctA4/E50wX/eoBOgq0B7+7S6FK4wvPHSNgfh+vwSWIJsJLt/3yjBeb41RRyMDMZqFQTZPEdFpXp48ExEyDayZ6objbjTHoS5WQDnDQpRyqMNKfvd41nhEPdb/hxpzXeTIjWmfHHCT+CQYWXDqLehCh1cRyeYOBwsSlSw5PiquAbsgAARVhJRroAAABFeGlmAABJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAEgAAAABAAAASAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAPAAAAAOgBAABAAAAPAAAAAAAAAA=", zd = "data:image/webp;base64,UklGRtgCAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IPgBAABQCwCdASo8ADwAPm0wk0ekIqGhKBQMqIANiWkADPF3uV2D8VcQGk1mg+P36i9SLnZvYAQxszEWYzEwX1RVkqG/4BGbJgMSHqhKDFsjWsGfPPrvfef11goNmCDDlBJHVVD+8gAA/vu4q03kl+E7FpjtZ2gc8pQ619Hjv9NywoRZ6az43C1wcrRr/lWzJlJhLWMHN0MkVl1ueAf6Hn8StVzeUfMBXOKkgfe2msx7QWR5PnHW/5c6/35yrtWnrURc2q6UYlGin+v8C2dQqexkW6rX2EEijTI9eEQ46PWH3/59fM2AlMvvR2abaRk5XX7V1triQncRxvMfz5YmYDN+PY/ikcZUNaiFucKoUq5riv0eKCezuFNHecE11ojwJqWRSTWpalkz5autXp6vFS+FT1tWUsB/fs1CCOZxaA1vR1grOEaiuKe1RYm7e05psWtqbXLVmm1bA8Ly9PFkVdCbc6hR3UuBBsFGnVeGOUeMn2onnfvYhBMcM9YPxGdQkwZLXOk1VuQSTk01Shf3fZrFyRlFauftFdPYhKXwqrr+meav1P+KLKBVosqmHnFFfgExsQ/rOf3TSd+mOqQfJA+cF+HojNU7nmM3uDkoCBi+//Gqp+gPNNW8M4LFrol8rxE+7WsjqMgfwv1f+Nr25RtG1Wa/KkniRCAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Vd = "data:image/webp;base64,UklGRhYJAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSGICAAABkJz9nzon3/nNJGnBXRvBI0sDkR7slpRBaMDl5LByx7cEyBWHtWd+8/uiK/95uEfEBKBnFwRwk6Wjm89PW2Tj9OWNo7VxASQ4DDoIML9fbdLYpbFR21tykDAY8ZCLT9okqZrsD0uqJNl5sj6CIAPwDmdqRlNlz6o0vroE5/vlPObv0kyN/dVE3pmHd31xgt0P1MgBauTHLYjrg2DoClM0DtRi4kmA6ylgrMq2cuDaZm0CoQePyTqVhVTWJ+G7EozXqSyosj4K6cIhVBhZ2MjyMNy/BFcZWeDIE8g/PLaoLLRyF/4vgrlPTMVK/DQH+cPjGpUFV17/i6BEZeGVF+Dh4F/kUYGDR4nKDBPX4AX381Deh2C1Q8vB2F4CDqnMUrkPlPMpY+obLQ/j9+k1GjNNLB0z5hJ5fD0f5Y2XTLkkPn9Hy8X4vsGMW/xvt3JqvKflYnz3nCmXxJc3qLlEXj9mzOe4xJSLcW36Oy0P47cplKl5KMvAfj6HwFKbloOxswrBfWoOyvsQjzWmPErwcKhQi6d84eHgcSGPEgSA4Dq1aMpr8PjL3CemYiV+moP8AY9darGUW/D4u+CEsUiRVyH4p8NwmbE4kZUA9y8IRuvUoijr4xB06zFZpxZDWZ+ER/cBEzW2dXDaZnUMAb06hBOmaIOxmHhlCILenWDrI6MOIio/7kIc+uk85u+SSftkasZ78/AOffYOl17RqNqbqtFqZ+A8+i8BI+tPOiRNNdkfllSNZPvJRYEXDDQI3NJerUFjl8ZmbX8ekIBBuyCAjK8d3Xh52iBbp89vHl2ecIAEh54BVlA4IMwFAADQGwCdASo8ADwAPm0qkkYkIiGhLhtqqIANiWwAqSdaNo+beZFT37f+J9yXOd2J6HfQh5gH6edIDzAfst6vXoO9AD/Lf4DrAP2V9gDzY/+57F39p/3/7k+0RmjvYp/meic9ieyvJnZVfquF/a23ZOCHGT/sfDDjQ89zOL9Gewd+s3Vh/b32Gf28Ejb5ttLg9hoDiFb2tMW81eZU9Z1LHfdRSCsRMzHz0WT4BNgUakGf9oJtrGtVJFxHJfxAatIxnW1qjDi9i3DQtJp9pVNKlMoJEWdPKv3KaaFSlhd/aMGiir9CPcex5QAA+fpjxA6zfUamE3wS2zWwLVrt/fXA5+Wvx9j5SID0zuEHU2LisPUxvtRuIUwNrsUis8zy+IMpzft+ZSg+9gdx9e6+ZvPmtj4OByz5qo26J3rXhPy8LBXSpuPb+f+mP4CoTvYDhzQXh/SIGj8Ez1+W5MJ/Tkdw09wPCs3JuR3yoqO63FH/j81xW5Abr7tCdwfXwv3CXDtOcHwUqPCd1aiU2uT6XwgdnYqYygEXGKFx8nmaUvqSn9p8HmIA9dVTOoEnqYFjrNfWY034N2vjohd16cxnkP4PYvHkIOWa/FEUug7/qbJ/GFLPxNh6y9eQ//MzzXbcPwsT2chWXPBXNVF1S9dxv5NUuEueiw2kdebblQuvUSRLN+zx3VyT2lOzWBUqrzsTmeOlxjVcTA83H99r35O4X7WXNq7HExiWXxrdM/Ih4CvPJaEHPxUE/i6WIz6+VGq4RB3sBKl3P4M7/DLWAwCnwcpX228XezqQ4cS2tttWxLTc9cPd1ofek9qF9lpB8RvakdPnj2PruFA9W3iKbNdmgnb+mIpohHuUR73KdDDOHbyfAiOjPzzqomnIU3jcSt7LKOB/Op97sCk0yd18mVG3prs351B+xmCE2Zd3RFKL+mpMz5qcuAFAfRyodbggdgmFGkEGQ33VryYFl/upr31FGdI52sqzuxd7jZIsqCcznUH/gu+xaBw7wla49EmFNf+Ss+91i9Hsys0FS//Ktru1xWgkeEweX77y6Oot5tHQsDxgy0sAI85V7FmlpiiWXQdM12MGfCBfyRM+N23SjOdReeSILYCgsM3r33/54X+lfDVNj427MvbDFtKccqazlQ+iKqC//MvYwqyiJPL1ZbVoCEP774fKZA3D3qvsVPGlp9LPchpTs4mTJugt8qXl82RwXQCDNZXnbEois53E35hkRr+IJhndoRo1o2sZDoTgykbeOKiynPH03+BcUQ8zmxTmiVlHQym/LL3kRREnUlxs2zPPGb2E+Rpdib+LxOvFSmj9RfTZoYIJnrqNnBIXV2lt7xeZ0srf98JymJxrtr8lx69oSNZIReDddL+3iiUjh6lm7EcYuclqBaKp8q68geo7H1EvKy4nSRx5Q+uz4l/ypo2hVdwi9l+BHjZZmJ7lXkpNTRJ0gZpzquzN2vh/MZQALV6FZ6q4aofA9AJy1DVLdNjV8n6s9eFA5pazxwhLW4tgWMciGf5x6G7HqFPTL1ZL3l447zLGUkqAXjkeVaNmxZ2oNKIuTy6JDc0Z61Z2dgbsg6HwCX1/ux5sk82WsnNIO4CTnWKI1aCtQZaEsBf6hIl9n7VBsgZGIcPpqn7P4mbyf3EbfdfQ32qlawLuAxmDlwRsVsPkw7j4aKbvIBykNcsVXv0/X6UXXaAtw3feJnTwDak2qY6QpMLE9e7PJeuQQ8FXpqI5HoR82kd+DOwGH5F3OpuWsmEt8v7WQG8q1LMkg6vrl3I8047zMl1Yq0VwotbrsKJocsHgsbs/PGOO9v2s8U0Sju/71XRtG5skcy2msae3wixjlGR4i6ZfldMehQD1zf/FbWN9hnHfpq1Fh8+PSA9AzUi33qli8ixISbH+tw7CcumxvegMk88HMNZlVdnIEzIfyHrSdZ2S98yX2OYZw0+JyaBbQxI0fOr6KpuMD6FVGLrdN9dgOTgOPQgAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Hd = "data:image/webp;base64,UklGRo4EAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSA4CAAABkGXb2to2V9/v6D1Jmd5CQ5GXPYXAJMrtPOJMoMzMzDgIPYY5+vVds6T/m0BEOGzAtm1IBlR2d8kXUMyaADjeuHr9V7qj3E5/XrvaOA5AHCqzFgHTFz9tUTmEyq1PF6cBqVWDOLjkwS6VPsu8KqnaewRU7j5KIjipgFiQfCf1IGch8wMlv9QhcWk4nLlL9Z4l6b3y7hmUvGQkmF1nnrMC85zrc5CozDUQtwamisNSDCmxjL5jpqxMzfhutFCCY3+5110CaI9/jhVIcPg/DxiIB/x/eKgijLxkRobTyxFEw7zVm0NqcYg5LNAzKD3n4QbmyRVqWCiXJyD9uN7z0Ha9Dw4N5gzOnHU4IMJ7egt8HuYWasIJnlg46fkYgul9qgWU+9PA2Z7b2FngnR3e49Qm1QbKzVPNnltZ8wozK2S8et0SN34wt0LOnynVCsp02xI7tKSqqXYsV7ZtD/lpeaEfNyw/k9evWuKK7XfQ9ruP9/RW/s74t872N1bw2MY8n0Acmlb/KQ04AJ8t5PkeEbpDnbmR2/5392FiOfRFlCuTkIGsMh/aPBeGZFLBYuiM1IIUZLOD0NnMNBMWZdE/4bLo32MQ0wxcJnsvhcnerRhSLvPPhcj8s5DIsmtU6Tj1L1U6zvcEElfrVlHyqGy3epC4om5Vsg3OlO50UQ2V6Qa65LWf6TZ1J/11faBLlpgAVlA4IJgBAADwCQCdASo8ADwAPm0ylEckIyIhKAoAgA2JaQATzh4OcBkEByVmbl5z9gD9U/+J2APQgLaX4twLu19/UVxAWN1IKXE4cIqJBhoyQ0yDYn61m3zk6T7FMg0AAP78+EMvGgC8jLXmcbbmqvufKjG8Tv1M9Krl47vOW74O/Rapv2DgXbg9iK6PrRQG/9d9+rF/ESxzbszVFn3GThrMBmsklj/LPWDQ0pKzG7EyjQL6p6gfUwMze+wPhzJpn8tMqlUVgq6/QSUVcgG+ztsi73rA3vl3n4baeF1INsbuosTXtnsotVYuTii6rscx9OUTvevYcPNvcL9MPhyWeCQw0qynnGtzCIw+oFRN0+TN1mqXkFyk/rFBcH+FHiI6s9XX5EWCKn5vTRt/0RbS687PiXPFC5Zk/Gk4+538IYi+HZDjvlQQWOH/vddfYTerQ5QqWJt1YuaZNThQ2u+/DtXfZPRy1iWWLR9SKFFtlGrqBKWF5nPRPWWMNA3OssvUtvCNBLBA4cn1whzy+SpbgLvnaepxiykjKsU/MhzgAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", $d = "data:image/webp;base64,UklGRqwEAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSL8BAAABkGvbtmlLc5997yvbmW19gBnbDm2kjF5UmW3bthXZVZFdZ+81r+87Z1XlEaHIbSNlMstwos4XUBSTLAFQo/u01Zdf/yLDDze3zB/YwADJEoOoJAKg7oTdH4SF+XxiZlMgSESzwAJdVn2iUJzzOUMiLhQKf+/va2FtBLMBuu1zpHcsincUXhtoTKLsCTVX/KF3wrLhPLm/OWzZtjQWfZ7RhYyAC/lxMowpSzJYJAyFkZDQc21FBMUT7BqGjpHxf3m+XlEPUHE/f3vGgPzmw4awRUaTexkyJhwfNShctVgZXyJDXq4CUyjNy6Y4fVOBIkAPR2GcOE7Jm2NQ/RE9YzXht3a5VYvlOX0xF0fy+tp/ozBuQg6DzZYb6Bi7ed4rB5Mp/1Co4cNhLUo1StLxDIDqrynUoRswiF6nFnIxsDpnZ5WBW0GFZ1qZ8HfLDk5txHHsGDpSa6B0cXZEa+DsTr1M+P4qPdXwjynU4+1/a7oN3Sm6G+meSd27oHsHde++7puj+tYpv7G6b7vun6L7l6n+oZp/t7JmUNUqqhpJV5upakJVLaqqgVW1t6rmV401NGMc1djqH4rpIseSfyPFkgAAVlA4IAQCAABQDACdASo8ADwAPm0yk0akIyGhJgzogA2JaQAThroHvLxu+aPf5G2BYxv+B6XHzx6GPon/o+qz/tOAA/TM82gR0vnExWoiQRM36jlg2UIvwCSqySErzuguz9EP2x/7hsNazr91aIworWI7AAD+/TZ+6Ipl444OdT+2wU0Ov+T8oJuVP/vUbT/w1Jsv6Awnl6rvF/xetfOPt3gTQZZi0Y/AOx563J7CJkqTR/fc/n34zyeKzR80fhfv4ef+Hjhz/CX5aQo+58zg/FdE+7bLoophGfG0szI513EH+q+Gc73H1PFdJYf7CF8v5dhr3tMwEVX5Ji2ZxejK8xrf/E6nVXqlA4DrYNRP09InHc+fEqO/fH8xr+rMf4y1F9TOnwVffZblLoTP6lot0m/sh7sTiDQr0mIA8TiHoOffGDG6KzV+B3239udfhzD740gkRi/m53abX0Ku3vAgadgFFqL0vk8M/4aI+cI+0fbLW17mWGeMu21wSRRQiv5iNgGKR3vEGXAItcLDft1uUzWAfbe1X3zK/ymT7bA/76PB6UUknm+Y5MM4osurUXU/k7P38pN/3slnGfpFzjl4c3USY4mH9ZCJYUuC/kGEnq/yRPalPdODNFvW6s8MiQeQejYNRY0LsJ0WXkK8vXiDmihCivYAOPoSovesL7on+WAArDNM/BcQSQvCYABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Gd = "data:image/webp;base64,UklGRnIIAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSK4BAAABkHPbtrE9+z73/RTbqWw7Lf+BbbNKbTudbZe2qy+VbVv3PmeHj05G6ohg4LaRounNMtN1voB42ABA5R7TNlx5+O7du9e3Tiwb0b4EgFyAOCQM1Z16+DWFUZC7m3uVB2zKQGBhe+77RGHonJffCL1zQuHDxQ1hrEmTatDjHIXOC2MgzpNf1tVJkWgsGhyihI7JIE74aUYp2ITFAoz9QO+ZAs7zanvkEilKbIkMJS5ANwoJmrCodYVOmBqh5zIEJjZc9xods4A4rrPGxGitrJSU71yNyH4Myl7JTEl+5zzYSH9nlkrxHBzxWUzLVEnhh+YI/gq3+UphpvA8m/s7/wg9M4bjFNg/0vplrxQ+rQEDg/xihmT23jxYJZ8UPq8OA5z77Wt405FDR4poSMjiAJhPRxUIu8D+UVonOhfNPEVHPM9juFacwo+1V6kJQ3Y9Sa8ljhPuUvRk4UdNWU9ST3b9n0W3iG5DumdS9y7o3kHVu6/75ii/dbpvrO7brvtPUf2X6f5DVf/dmpxBmauociRVbqbKCXW5qCoHVuXempxf1dZQtXFUbat/yKZTtSUBVlA4INwFAABwGgCdASo8ADwAPm0qj0WkIqEZ+zYAQAbEtgBOmZoZF+E8zGoP3X8VbcdLvma8t+jH0E+YB+ofSA8wH7VdQv0AP75/iOsG9ADy3/Y5/b/91fgI/Y7MOesb0e/q+TUR1vt7VO6mwG0imO70GM5/0P7BX6qelv7EP209lz9oDRea09ZR+SjhX7sBu/ZS7tG917rPgI3Q7XsB7luy2hAg/95C2Z1L362OH1oFziDY/K5gWoSytSAtiKvA/jW1MehBzdLzJfszPPBvGa15IYwIVRTjO2Hz5ZS9HjLMehwAAP64SgjD3qeg6NRe/Ok+iFhrG3pgglCfbam3yBaDUH36sUiQx0PB1ZZyOHq0ky+f97h6tJMvo0p9LkfXecWOFJ8J5G7yRPuL4tzGLT09QulTJw42xp2hd+lMgIa51XoHx/iftn8B2D3k92H5jOQr+uIXFHHK5FpcTG+qGEF+np0LiQa+vdW7/+ZzOLVRf7jR5X3ANPt93Ng92DW7NflVr6kMr88O/v2ZNb0vtgao2Am/R3CDKiNq89f86CT6r2L2g1oTui7H3E1yhSPQpEOz01I3fhfiMMv4weqKuoedxn/xLg5uzHa6Gte4C/dQYkG3ZFSy4CXQtRjftBrjX/Oj+HpSUPDsv0wPW+ml5NbBKDCj2f3SD8TVMf2ZfHrOkR602RVk2UmKC+H0Y9iK6k98vsgPINtz0II8X7Mj2nJkTC6IMLuQ8dNTUq9VXOnhXrdhNZoaH94ePo6baBl3hTGFAnD3/b+gR/vtbqV7wktuX6fpnjeTBe/Drp6z3neeANj/aX4CsU9w67nwYOjZhueCjxaDKUnNjLPjI1e0BoTbcOzOQ0wHJHZJ+Pt608StBu4HiJ8NjH46fnvXL3yiMoSvkAuwCE1AakA+eU1u3unyjl1/MnZQmbp8fzfsfrFesehLPcIkYdCiZ+52QbmINNTjEsvjuBuZRubBE+Laihppsxoo4efGIo0xkw0etu1+yzvkqp88w3pBq0mRl13gnnc+2zl6SmhwgmNFbz+F8qAqmdfJL8iaNSGEWlPlpczDDe62GBZMlBhQmq/XCn/1b+VazHvJXkoIFDF+wktMg+rKfLyfTlXdK0cs+Kn8h+rjMakkf3WLo1TftMLn+O+x/Gat+BGstJrM1xvCSSnHQY+NV4B4gRqyZ55gRNnqN/0lWrATOcHUaGXpkTIM/yxFjxcePcSFo+t2aJ5lShtVukETzRxaIXgRkpROeWQHWpTHOaexmXOzF0b833qJSoXMk2zB/uMrgDzKd7d3ohUz8Ra08WYKlAuMQD08bF4+jUepEspqPLoYLQ73TfmL+1LwKxyTV3gEu6WnxBPWPLnYIGYN9U47ZNlB+NgHgYtKTyii6060RAG+wN32WUVFxCZw0HMHnHFgwxD34L/anlpS7mOrjKgyuGYhFC7iHqTQHuoAO1ekBHV+rndnbETKfa1F7LxNLYq+dmJyytmQrJUCGjelorI1m/TMQNiFVrY4FCI1Gl2W1JsZsw9zA+Bh3JmjkC0H5/0JV6JotNMatJIZ4v5PqwJe3r8xd+FNS3ynccdu+xtVdc27qwVdoomciZD5oXYey9KAFSAKO594sBKZNWUJTLXnt0BJbdF8FkQYvg3DQajYY2p+ixd5Ag7o92gw0pVVDDOP+WQxiEmKqgWJyTBsnsBk2Bxi2Unsv8S/4PmE8Hy/vy+Mij+aTAKZvg716IHfHX0/JMeFfmAnsZ39Q0qkfdPtq6+CxbGZ7wKDsK/8l/MVGuyd6faJFt5wyoOXuNrr3JC9EoBmjcOzkVw/6RNP49poZ1xzsX3q7B4HGfI/XSfRQq3HeZ2j12d0E3gCAube4oExaT1sx/v8F+f61QOsGdSaqM2im6qOGkSRkrRQ7L8hvS8vEYJeVkAbFvX5ov7e/egYYNToMHj651c5/rCVYtB9Ned6GvGN8R0x3t7+lsf8+ofhHRzpyvwxd6c5pREZVOKnXzplhJ61mki4JmAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Qd = "data:image/svg+xml,%3csvg%20width='88'%20height='88'%20viewBox='0%200%2088%2088'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='88'%20height='88'%20fill='url(%23paint0_linear_170_79)'/%3e%3crect%20x='25.6665'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='51.3335'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='29.3335'%20y='40.3333'%20width='29.3333'%20height='7.33333'%20fill='white'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_170_79'%20x1='-75.3077'%20y1='-55'%20x2='146.302'%20y2='148.167'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FF00FF'/%3e%3cstop%20offset='0.531673'%20stop-color='%237A84FF'/%3e%3cstop%20offset='1'%20stop-color='%2305FAFF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e", Kd = "data:image/webp;base64,UklGRh4HAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSNwBAAABkFxbexpJnyR3z8y+ajXMkAnjnnOgbUUxEAHjkpldWQwzFUn6v3PGVNI/AUQEA7dt49gN3PXavTlfQDeNAeyqg4PL5buRyOhteXlwcJWtHU8qzUIBs+30g7/s4N8Hp7cZFAtpDc7Bbr8xplB8iFJBYvBC4fjGdgvnElqdwc6XFPGRnQxehC93wjgzbxRYf1UYA+dkiJSrG1DMV6zDoW+MkQmMkd8Owdl5AsvOM3gm0geeXwY7R/Tu0EcmM3re6cF2Rr/kTJiBMmPZh+2q/wtm4ozD9qrB0tucMhunvL0Upg1n6JmRnmda4HCckVkZeRyuMWjjF0peCD9vhK3jAgMzM/BCDQ576225m/bCwcA+qzS/PLUwDrsr1ZDdcAa3KtWQWzDYPKZoQDjeDJyoVEdOAPf0cA/Lf1F0IPy1fG8VWmXvgF4LnoOLDFoIvPiaUQuRr99pNr8dUZEj0YToQnfjreaQd7oL6T6Tuu+C7juo++6rfnOUv3W631jNb7v+P8U+1ZDAZxZG9R+q/e+GxcbPuRcRftkIq+pVVD2Srjdr94TDnJ6w7MGqedFhH1bVA6t67zk9/3ctzw+YAhvSc431KExyjjNHQ2zLcTRzq/8op0vKJd+OREbvUnJJAFZQOCBaBAAA8BUAnQEqPAA8AD5tMJRHJCMiISgb+1CADYlsAJ0zIUCfxfmY2f+0b2AbztDnPeKX0qPMp+wHrDehz0AP7J/o+tP9ADy3f23+C79yPYA/aqK9mONrQbuszbsEyALJNTfg+Z6NjG2v+ETCuvlr1q6QUqEiAMUndG/WwfnjJIOTfOBS4W1w0HjOJa1XQ2K33n2b07EOjOBapwKzyoA2erTBTnEKlFjllBy68GBjZ+UKnlzN/f5ibbb4gAD+i9OsnW0xUnmTpyhVasIKzTu0BsXnfBm4rHJqGMFJBUgTESDXEPcNjAeaHP8ck9qdNBH4L/h53tXgHeZttc7c4lwTa6U4Lziz8qUoy8ce0IMc5TFElawGj16tME0GzSSbUqgH7/tYA6huPsWM2z3GjP8b9y7paRbINxwYRtuE90I6QVsNrEkbhL1YfwxRXnuobOfSe3KFVamrvsOqwTCMqlNfjsR3pyoiZ+lYt3+AH6x4ZVNltbYI5KiVhgCu1isooK324ldloH3zhlefYKEwTCYfNjbeH5UiL7JSev+t/C+ftc3TkAHcsvrLCU6n5pYYY2Yr1kRq+r6XVzI6iXuA/TqwMk6xq1PmdzHOwKavncLjWJrk0uU/5E5WKqXM0tgl5s3pduHjb5aiAt0ikEisMyYwnIhDiSemPRdGON4RlwSb3OEpZjhuZqoyen4Sw/fULewt3hAZizeiPZx1o9LS3M/4r3v/M6/o5925VJcmxAf/yjsyjCz0mV+6NuIeWp8shrFaIGgeduVJoZ0Kys1WjSLuFg9QvF5LlkOZ2k7WrzSu4ucsUOS/X4wnQvB0RCnR1PCsU4NDdLfxvQITUgGIuVTJ7LR73PHzZam/Z21oy3euiU55ffITekwjR4SgVoPvhxbdBSyVePf/twm62pSK9IfgPGN+ttubhQub1ooVZymdQCrS3goEs6dlnl/6TVfkgxFyBfAORkZafeu/Va2vIgUBNUQd48W8oPiMFjx+SAKx1qm2IwCLnuhJGf9M4nCzu7oo43f+nBeT07IjB+FpFKRGFNvlpLEXhPclSgFkqeU1W2eNqW2zShCWkQkgfE1HAoNX3z+CQcRQJq+HkC2nSjFdFYT8UNYNS6lYcyVWzEnOos1qpsNRxnLqY2Dl5CCT3Yeg/qT8chfF9ZadFvzNTEIDlARoN//7IU23MtuLdpsAjsiGfBHuR7y4lemYPdD/9Cuff9Qn/r/xlhmB5x2Y9Z1yME3aANAb5+u3lYz01zUlWwakKVmv9fhaeu/YzQ7BXLlcb+cbaIF5t/COmObnt20zaTfjad542f7p7f2Xea134nvyPYS+EAgjM+GufHvl9tXCrrRbH0pn7kH2XEGx9VbO4mY54+QZa5kPr0j3AOEtKd7SJWjlg5TQfgIuB6KoLGainSwF+pPdiCmzEzAOa1eFwn//2VdDMeq42/bKH8U4orewhLh60ci/S0BRBuItNMc+v1+vxl0YyS5it4AAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Yd = "data:image/svg+xml,%3csvg%20width='868'%20height='868'%20viewBox='0%200%20868%20868'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='434'%20cy='434'%20r='434'%20fill='%231B262D'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M234.563%20184H640.697C650.387%20184%20659.339%20189.164%20664.172%20197.542L782.495%20402.657C788.631%20413.294%20786.808%20426.72%20778.056%20435.346L452.368%20756.327C441.818%20766.724%20424.846%20766.724%20414.296%20756.327L89.0484%20435.78C80.0927%20426.954%2078.4157%20413.136%2085.0013%20402.433L211.48%20196.884C216.405%20188.879%20225.146%20184%20234.563%20184ZM588.257%20275.577V333.129H472.567V373.032C553.82%20377.296%20614.782%20394.81%20615.234%20415.802L615.231%20459.563C614.779%20480.556%20553.82%20498.069%20472.567%20502.333V600.259H395.746V502.333C314.492%20498.069%20253.531%20480.555%20253.078%20459.563L253.081%20415.802C253.533%20394.81%20314.492%20377.296%20395.746%20373.032V333.129H280.055V275.577H588.257ZM434.156%20472.268C520.868%20472.268%20593.345%20457.459%20611.082%20437.683C596.041%20420.912%20541.636%20407.713%20472.567%20404.089V445.867C460.187%20446.516%20447.336%20446.858%20434.156%20446.858C420.976%20446.858%20408.125%20446.516%20395.746%20445.867V404.089C326.676%20407.713%20272.271%20420.912%20257.23%20437.683C274.968%20457.459%20347.444%20472.268%20434.156%20472.268Z'%20fill='%23009393'/%3e%3c/svg%3e";
function So(e) {
  const t = e.toUpperCase();
  return Kr.find((o) => o.symbol === t)?.decimals ?? 6;
}
function Zd(e, t) {
  const s = e.toUpperCase(), n = Kr.find((a) => a.symbol === s)?.decimals ?? t;
  return n === void 0 ? 2 : s === "SOL" ? 4 : n === 6 && s !== "SOL" ? 2 : n > 6 ? 6 : n;
}
const Kr = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: Gr
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: Gd
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: Yd
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
    logoUrl: Vd
  },
  {
    mint: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    name: "WLFI USD",
    decimals: 6,
    logoUrl: Kd
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logoUrl: $d
  },
  {
    mint: "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    name: "Hubble USD",
    decimals: 6,
    logoUrl: Qd
  },
  {
    mint: "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT",
    symbol: "CASH",
    name: "Stripe USD",
    decimals: 6,
    logoUrl: zd
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoUrl: jd
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
    logoUrl: Hd
  }
];
function Xd(e) {
  return e.companyFeePercent > 0 || e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap" || e.feePolicy === "user_pays_privacy";
}
function Jd(e, t, s) {
  const { feePolicy: o, privacyFeePercent: n, swapFeePercent: a, companyFeePercent: l } = e;
  let i = l;
  return s || (o === "user_pays_all" ? (i += a, t && (i += n)) : o === "user_pays_privacy" && t ? i += n : o === "user_pays_swap" && (i += a)), i;
}
const wt = 1e9, Qe = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoUrl: Gr
}, Ke = {
  mint: "other",
  symbol: "OTHER",
  name: "Other",
  decimals: 6
}, Lo = 1e4;
function eu(e, t) {
  const s = t < e.publicMinUsd, o = t >= e.privateMinUsd, n = [], a = !s && o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0), l = !s && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0), i = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  if (a) {
    const c = e.privacyFeeFixedLamports / wt, u = e.privacyFeePercent, f = c * e.solPriceUsd, h = t * (u / 100);
    n.push({ label: "Privacy", solAmount: c, percent: u, usdAmount: f + h });
  }
  if (l) {
    const c = e.swapFeeFixedLamports / wt, u = e.swapFeePercent, f = c * e.solPriceUsd, h = t * (u / 100);
    n.push({ label: "Swap", solAmount: c, percent: u, usdAmount: f + h });
  }
  if (i) {
    const c = e.companyFeeFixedLamports / wt, u = e.companyFeePercent, f = c * e.solPriceUsd, h = t * (u / 100);
    n.push({ label: "Service", solAmount: c, percent: u, usdAmount: f + h });
  }
  return n;
}
function Bo(e, t, s) {
  const o = eu(e, t), n = s === 0 ? 0 : s < 0.01 ? 0.01 : s;
  if (o.length === 0)
    return s === 0 ? "No fees" : `Total: $${n.toFixed(2)}`;
  const a = o.reduce((w, p) => w + p.solAmount, 0), l = o.reduce((w, p) => w + p.percent, 0), i = { fee: 7, sol: 8, rate: 7, usd: 8 }, c = (w) => {
    const p = w.label.padEnd(i.fee), E = w.solAmount.toFixed(4).padStart(6).padEnd(i.sol), A = (w.percent.toFixed(2) + "%").padStart(5).padEnd(i.rate), N = ("$" + (w.usdAmount === 0 ? 0 : Math.max(w.usdAmount, 0.01)).toFixed(2)).padEnd(i.usd);
    return `${p} │ ${E} │ ${A} │ ${N}`;
  }, u = `${"Fee".padEnd(i.fee)} │ ${"SOL".padEnd(i.sol)} │ ${"+ Rate".padEnd(i.rate)} │ ${"= Total".padEnd(i.usd)}`, f = `${"─".repeat(i.fee)}─┼─${"─".repeat(i.sol)}─┼─${"─".repeat(i.rate)}─┼─${"─".repeat(i.usd)}`, h = ("$" + n.toFixed(2)).padEnd(i.usd), m = `${"TOTAL".padEnd(i.fee)} │ ${a.toFixed(4).padStart(6).padEnd(i.sol)} │ ${(l.toFixed(2) + "%").padStart(5).padEnd(i.rate)} │ ${h}`;
  return [u, f, ...o.map(c), f, m].join(`
`);
}
function tu(e) {
  const t = [], s = e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0, o = e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0, n = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  return s && t.push("Privacy Cash fee"), o && t.push("swap fee"), n && t.push("company service fee"), t.length === 0 ? "No processing fees apply to deposits." : "A small fee may apply. We'll show exact totals before you confirm.";
}
function Tt(e, t) {
  if (t <= 0) return 0;
  const s = t < e.publicMinUsd, o = t >= e.privateMinUsd, n = Jd(e, o, s);
  let a = e.companyFeeFixedLamports;
  s || (o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (a += e.privacyFeeFixedLamports), (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (a += e.swapFeeFixedLamports));
  const l = a / wt * e.solPriceUsd, i = t * (n / 100);
  return l + i;
}
function Po(e, t, s) {
  return e === "sol" ? "SOL" : e === "single-token" ? t.symbol : s.some((n) => n.symbol === "USDC") ? "SOL or USDC" : "SOL or supported tokens";
}
function cn(e) {
  return e.map((t) => t.trim()).filter(Boolean);
}
const ru = /* @__PURE__ */ new Set(["USDC", "USDT", "USD1", "PYUSD", "USDH", "CASH"]);
function Yr(e, t, s) {
  if (ru.has(e.symbol)) return 1;
  const o = t.tokenPrices?.[e.symbol];
  if (o && o > 0) return o;
  if (e.symbol === "SOL") return t.solPriceUsd || null;
  const n = s?.[e.symbol];
  return n && n > 0 ? n : null;
}
function Ro(e, t) {
  return e.toFixed(Zd(t));
}
function uh({
  config: e,
  currencyMode: t,
  depositMethod: s,
  tokens: o = [],
  defaultToken: n,
  minAmount: a,
  maxAmount: l = 1e4,
  onSuccess: i,
  onError: c,
  onCancel: u,
  onUnlockRequired: f,
  onAuthorize: h,
  className: m = "",
  showStepIndicator: y = !0,
  pollInterval: w = 5e3,
  demoMode: p = !1,
  demoAutoConfirmMs: E,
  tokenPriceUsd: A,
  showExplainer: C = !1,
  siteName: N,
  explainerConfig: x
}) {
  const { deposit: R, getStatus: g, error: k, clearError: v } = _d(), b = Lt(), P = cn(e.quickActionTokens), S = cn(e.customTokenSymbols), I = V(() => {
    const z = e.customTokens ?? [];
    if (z.length === 0) return o;
    const Y = new Set(o.map((re) => re.symbol)), Z = [...o];
    for (const re of z)
      Y.has(re.symbol) || (Z.push({
        mint: re.mint,
        symbol: re.symbol,
        name: re.symbol,
        // Use symbol as name for custom tokens
        decimals: re.decimals,
        logoUrl: re.logoUrl
      }), Y.add(re.symbol));
    return Z;
  }, [o, e.customTokens]), B = V(() => {
    if (S.length === 0) return I;
    const z = I.filter((Y) => S.includes(Y.symbol));
    return z.length > 0 ? z : I;
  }, [I, S]), M = e.privateDepositsEnabled, _ = s ? s === "sign" && !M ? "receive" : s : M && b.hasExternalWallet ? "sign" : "receive", O = P[0] ? I.find((z) => z.symbol === P[0]) : void 0, F = t === "sol" ? Qe : t === "single-token" ? O ?? I.find((z) => z.symbol === "USDC") ?? I[0] ?? Qe : n ?? O ?? I.find((z) => z.symbol === "USDC") ?? I.find((z) => z.symbol !== "SOL") ?? I[0] ?? Qe, H = T(() => C ? "explainer" : "unlock", [C]), [q, D] = L(H), [U, G] = L(F), [ee, ue] = L(""), [Ee, be] = L(null), [K, Q] = L(null), [te, we] = L(null), [Be, Xr] = L(null), [It, Xe] = L(!1), [_o, Mt] = L(!1), [at, Jr] = L(null), ze = J(null);
  W(() => () => {
    ze.current && clearTimeout(ze.current);
  }, []), W(() => {
    D(H()), G(F), ue(""), be(null), Q(null), we(null), Xr(null), Xe(!1), Mt(!1), Jr(null), v();
  }, [t, _, F, v]);
  const Do = a ?? e.privateMinSol, Uo = l, it = parseFloat(ee), es = b.status === "enrolled_locked" || b.status === "enrolled_unlocked" || b.status === "unlocked", _t = es && b.isUnlocked, Dt = es && !b.isUnlocked, ts = T(() => {
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
  }, [_, C])(), Fo = ts.findIndex((z) => z.key === q), rs = T((z) => {
    G(z);
  }, []), Oo = T(
    async (z) => {
      if (!h) {
        D(_ === "sign" ? "confirm" : "show-address");
        return;
      }
      Mt(!0), Q(null);
      try {
        const Z = await h(z, _ === "sign" ? it : null, U);
        we(Z.sessionId), Xr(Z.depositAddress), D(_ === "sign" ? "confirm" : "show-address");
      } catch (Y) {
        const Z = Y instanceof Error ? Y : new Error("Authorization failed");
        Q(Z.message);
      } finally {
        Mt(!1);
      }
    },
    [h, _, it, U]
  ), Wo = T(
    async (z, Y) => {
      v(), Q(null), D("signing");
      const Z = z ?? it, re = Y ?? U;
      if (!p) {
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
        const ye = Math.round(Z * Math.pow(10, re.decimals));
        if (p) {
          await new Promise((Ft) => setTimeout(Ft, 1500));
          const Ae = {
            token: t === "sol" ? null : re,
            amount: Z,
            amountSmallestUnit: ye,
            txSignature: `demo-tx-${Date.now()}`,
            sessionId: te || `demo-session-${Date.now()}`,
            response: {
              sessionId: te || `demo-session-${Date.now()}`,
              txSignature: `demo-tx-${Date.now()}`,
              amountLamports: ye,
              message: "Demo deposit successful",
              withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
            },
            method: "sign"
          };
          be(Ae), D("success"), i?.(Ae);
          return;
        }
        const Pe = await R(ye), Je = {
          token: t === "sol" ? null : re,
          amount: Z,
          amountSmallestUnit: ye,
          txSignature: Pe.txSignature,
          sessionId: Pe.sessionId,
          response: Pe,
          method: "sign"
        };
        be(Je), D("success"), i?.(Je);
      } catch (ye) {
        const Pe = ye instanceof Error ? ye : new Error("Deposit failed");
        Q(Pe.message), D("error"), c?.(Pe);
      }
    },
    [
      R,
      it,
      U,
      t,
      p,
      te,
      _t,
      Dt,
      f,
      i,
      c,
      v
    ]
  ), qo = T(() => {
    D("waiting");
  }, []), Ut = T(async () => {
    const z = Be || b.solanaPubkey;
    if (z) {
      ze.current && clearTimeout(ze.current);
      try {
        await navigator.clipboard.writeText(z), Xe(!0), ze.current = setTimeout(() => Xe(!1), 2e3);
      } catch {
        const Y = document.createElement("textarea");
        Y.value = z, document.body.appendChild(Y), Y.select(), document.execCommand("copy"), document.body.removeChild(Y), Xe(!0), ze.current = setTimeout(() => Xe(!1), 2e3);
      }
    }
  }, [Be, b.solanaPubkey]);
  W(() => {
    if (!(q === "confirm" || q === "show-address" || q === "waiting") || !te || p) return;
    let Y = !1, Z = 0, re = 0;
    const ye = 360, Pe = 5, Je = async () => {
      if (!(Y || Z >= ye)) {
        Z++;
        try {
          const Ae = await g(te);
          if (re = 0, Ae.status === "completed" || Ae.status === "detected") {
            const Ft = Ae.amountLamports ? Ae.amountLamports / Math.pow(10, U.decimals) : 0, zo = Ae.amountLamports || 0, ss = {
              token: t === "sol" ? null : U,
              amount: Ft,
              amountSmallestUnit: zo,
              txSignature: Ae.txSignature || "",
              sessionId: te,
              response: Ae,
              method: "receive",
              depositAddress: b.solanaPubkey ?? void 0
            };
            be(ss), D("success"), i?.(ss);
            return;
          }
        } catch {
          if (re++, re >= Pe) {
            Q("Unable to check deposit status. Please check your connection and try again.");
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
    q,
    te,
    p,
    g,
    U,
    t,
    b.solanaPubkey,
    i,
    w
  ]), W(() => {
    if (!p || !E || q !== "waiting" || _ !== "receive" || !Be) return;
    const z = window.setTimeout(() => {
      const Y = at ?? e.privateMinUsd, Z = U.symbol === "SOL" && e.solPriceUsd > 0 ? Y / e.solPriceUsd : Y, re = Math.round(Z * Math.pow(10, U.decimals)), ye = {
        token: t === "sol" ? null : U,
        amount: Z,
        amountSmallestUnit: re,
        txSignature: `demo-tx-${Date.now()}`,
        sessionId: te || `demo-session-${Date.now()}`,
        response: {
          sessionId: te || `demo-session-${Date.now()}`,
          txSignature: `demo-tx-${Date.now()}`,
          amountLamports: re,
          message: "Demo deposit detected",
          withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
        },
        method: "receive",
        depositAddress: Be ?? void 0
      };
      be(ye), D("success"), i?.(ye);
    }, E);
    return () => window.clearTimeout(z);
  }, [
    p,
    E,
    q,
    _,
    Be,
    at,
    e,
    U,
    t,
    te,
    i
  ]);
  const jo = T(() => {
    D(H()), ue(""), be(null), Q(null), v();
  }, [H, v]);
  return e.enabled ? /* @__PURE__ */ d("div", { className: `cedros-deposit-flow ${m}`, children: [
    y && q !== "error" && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-steps", children: ts.map((z, Y) => {
      const Z = Fo >= Y, re = z.key === q;
      return /* @__PURE__ */ d(
        "div",
        {
          className: `cedros-deposit-flow-step-item ${Z ? "step-active" : ""}`,
          children: [
            /* @__PURE__ */ r(
              "div",
              {
                className: `cedros-deposit-flow-step-circle ${Z ? "active" : ""} ${re ? "current" : ""}`,
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
      q === "explainer" && /* @__PURE__ */ r(
        su,
        {
          siteName: N,
          config: x,
          depositConfig: e,
          currencyMode: t,
          token: U,
          tokens: B,
          onContinue: () => D("unlock"),
          onCancel: u
        }
      ),
      q === "unlock" && /* @__PURE__ */ r(
        nu,
        {
          token: U,
          tokens: B,
          currencyMode: t,
          depositMethod: _,
          isAuthorizing: _o,
          error: K,
          onAuthorize: Oo,
          onBack: C ? () => D("explainer") : void 0,
          onCancel: u
        }
      ),
      q === "confirm" && _ === "sign" && /* @__PURE__ */ r(
        ou,
        {
          token: U,
          tokens: I,
          quickActionSymbols: P,
          customTokenSymbols: S,
          currencyMode: t,
          minAmount: Do,
          maxAmount: Uo,
          depositAddress: Be || b.solanaPubkey,
          walletReady: _t || p,
          needsUnlock: Dt && !p,
          copied: It,
          isListening: !!te && !p,
          config: e,
          onCopy: Ut,
          onTokenSelect: rs,
          onUnlockRequired: f,
          onConfirm: (z, Y) => Wo(z, Y),
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      q === "signing" && /* @__PURE__ */ r(au, { depositAddress: b.solanaPubkey }),
      q === "show-address" && /* @__PURE__ */ r(
        iu,
        {
          token: U,
          tokens: I,
          quickActionSymbols: P,
          customTokenSymbols: S,
          tokenPriceUsd: A,
          currencyMode: t,
          depositAddress: Be || b.solanaPubkey,
          copied: It,
          isListening: !!te && !p,
          config: e,
          onCopy: Ut,
          onTokenSelect: rs,
          onAmountChange: Jr,
          onSent: qo,
          onBack: () => D("unlock"),
          onCancel: u
        }
      ),
      q === "waiting" && /* @__PURE__ */ r(
        cu,
        {
          token: U,
          depositAddress: Be || b.solanaPubkey,
          copied: It,
          feeLine: at ? (() => {
            const z = Tt(e, at);
            return z === 0 ? "No fees" : `Fees: $${Math.max(z, 0.01).toFixed(2)} total`;
          })() : "Fees: calculated after deposit",
          onCopy: Ut
        }
      ),
      q === "success" && Ee && /* @__PURE__ */ r(lu, { result: Ee, config: e, onNewDeposit: jo }),
      q === "error" && /* @__PURE__ */ r(
        du,
        {
          error: K || k || "An error occurred",
          onRetry: () => D("confirm"),
          onCancel: u
        }
      )
    ] })
  ] }) : /* @__PURE__ */ r("div", { className: `cedros-deposit-flow cedros-deposit-flow-disabled ${m}`, children: /* @__PURE__ */ r("p", { children: "Deposits are not currently available." }) });
}
function su({
  siteName: e,
  config: t,
  depositConfig: s,
  currencyMode: o,
  token: n,
  tokens: a,
  onContinue: l,
  onCancel: i
}) {
  const c = t?.title ?? "How Deposits Work", u = t?.exchangeName ?? "Coinbase", f = Jo(t?.exchangeUrl) ?? "https://www.coinbase.com", h = t?.showExchangeSuggestion !== !1, m = Po(o, n, a), y = e ? `${e} uses the Solana blockchain to process secure, private payments.` : "This site uses the Solana blockchain to process secure, private payments.", w = t?.body ?? y, p = Xd(s), E = tu(s);
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
          onClick: l,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function nu({
  token: e,
  tokens: t,
  currencyMode: s,
  depositMethod: o,
  isAuthorizing: n,
  error: a,
  onAuthorize: l,
  onBack: i
}) {
  const [c, u] = L(""), f = Po(s, e, t), h = (m) => {
    m.preventDefault(), c.trim() && (l(c), u(""));
  };
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Authorize Deposit" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: o === "sign" ? s === "multi-token" ? "Enter your password to authorize a deposit. This allows us to process your withdrawal when the privacy period ends." : `Enter your password to authorize a ${f} deposit. This allows us to process your withdrawal when the privacy period ends.` : s === "multi-token" ? "Enter your password to get your deposit address. Any supported token sent to this address will be credited to your account." : `Enter your password to get your deposit address. Any ${f} sent to this address will be credited to your account.` }),
    /* @__PURE__ */ d("form", { onSubmit: h, children: [
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
        /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", htmlFor: "deposit-password", children: "Password" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "deposit-password",
            type: "password",
            value: c,
            onChange: (m) => u(m.target.value),
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
            onClick: i,
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
function ou({
  token: e,
  tokens: t,
  quickActionSymbols: s,
  customTokenSymbols: o,
  currencyMode: n,
  minAmount: a,
  maxAmount: l,
  depositAddress: i,
  walletReady: c,
  needsUnlock: u,
  copied: f,
  isListening: h,
  config: m,
  onCopy: y,
  onTokenSelect: w,
  onUnlockRequired: p,
  onConfirm: E,
  onBack: A
}) {
  const [C, N] = L(m.privateMinUsd), [x, R] = L(!1), [g, k] = L(!1), [v, b] = L(0), [P, S] = L(null), B = $r(C, m) === "sol_micro", M = e.symbol === Ke.symbol, _ = V(() => {
    const K = o.length === 0 ? t : t.filter((we) => o.includes(we.symbol)), Q = K.length > 0 ? K : t;
    return Q.some((we) => we.symbol === Ke.symbol) ? Q : [...Q, Ke];
  }, [t, o]), O = Tt(m, C), F = O === 0 ? 0 : O < 0.01 ? 0.01 : O, H = M ? "Fees: calculated after deposit" : O === 0 ? "No fees" : `Fees: $${F.toFixed(2)} total`, q = M ? "" : Bo(m, C, O), D = Yr(B ? Qe : e, m), U = D ? C / D : e.symbol === "SOL" && m.solPriceUsd > 0 ? C / m.solPriceUsd : null, G = U != null ? Ro(U, B ? "SOL" : e.symbol) : null, ue = C - O <= 0 && C > 0, Ee = !M && C > 0 && !ue && U != null && U >= a && U <= l;
  W(() => {
    if (n === "multi-token")
      if (B && e.symbol !== "SOL") {
        S(e);
        const K = t.find((Q) => Q.symbol === "SOL");
        K && w(K);
      } else !B && P && e.symbol === "SOL" && (w(P), S(null));
  }, [B, e.symbol, n, t, w, P, e]);
  const be = () => {
    Ee && U != null && E(U, e);
  };
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Choose Amount" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Set how much you want to deposit. Higher tiers unlock privacy." }),
    n === "multi-token" && !B && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-token-quick", children: [
        s.map((K) => {
          const Q = t.find((we) => we.symbol === K), te = e.symbol === K;
          return /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${te ? "is-active" : ""}`,
              onClick: () => {
                Q && (R(!1), w(Q));
              },
              disabled: !Q,
              children: [
                Q?.logoUrl && /* @__PURE__ */ r(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: Q.logoUrl,
                    alt: `${K} logo`
                  }
                ),
                K
              ]
            },
            K
          );
        }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${x ? "is-active" : ""}`,
            onClick: () => {
              R(!0), b((K) => K + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      x && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ r(
        No,
        {
          tokens: _,
          selectedToken: e,
          onSelect: w,
          openSignal: v
        }
      ) })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-field", children: /* @__PURE__ */ r(
      xo,
      {
        config: m,
        valueUsd: C,
        onChange: N,
        maxUsd: Lo
      }
    ) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: M ? "Sign to send tokens to this address" : `Sign to send ${G ?? "--"} ${B ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ r("code", { className: "cedros-deposit-flow-address", children: i || "Loading..." }),
        /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-actions", children: [
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-icon",
              onClick: y,
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
              "data-tooltip": q,
              "aria-label": `Fee breakdown: ${q.replaceAll(`
`, ", ")}`,
              "aria-expanded": g,
              onClick: (K) => {
                K.stopPropagation(), k((Q) => !Q);
              },
              onBlur: () => k(!1),
              onKeyDown: (K) => {
                K.key === "Escape" && k(!1);
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
          onClick: be,
          disabled: !Ee || !c || !i,
          children: "Deposit"
        }
      )
    ] })
  ] });
}
function au({ depositAddress: e }) {
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
function iu({
  token: e,
  tokens: t,
  quickActionSymbols: s,
  customTokenSymbols: o,
  tokenPriceUsd: n,
  currencyMode: a,
  depositAddress: l,
  copied: i,
  isListening: c,
  config: u,
  onCopy: f,
  onTokenSelect: h,
  onAmountChange: m,
  onSent: y,
  onBack: w
}) {
  const [p, E] = L(u.privateMinUsd), [A, C] = L(!1), [N, x] = L(!1), [R, g] = L(0), [k, v] = L(null), P = $r(p, u) === "sol_micro", S = e.symbol === Ke.symbol, I = V(() => {
    const U = o.length === 0 ? t : t.filter((ue) => o.includes(ue.symbol)), G = U.length > 0 ? U : t;
    return G.some((ue) => ue.symbol === Ke.symbol) ? G : [...G, Ke];
  }, [t, o]), B = Tt(u, p), M = B === 0 ? 0 : B < 0.01 ? 0.01 : B, _ = S ? "Fees: calculated after deposit" : B === 0 ? "No fees" : `Fees: $${M.toFixed(2)} total`, O = S ? "" : Bo(u, p, B), F = S || p > 0, H = Yr(P ? Qe : e, u, n), q = H ? p / H : null, D = q ? Ro(q, e.symbol) : null;
  return W(() => {
    if (a === "multi-token")
      if (P && e.symbol !== "SOL") {
        v(e);
        const U = t.find((G) => G.symbol === "SOL");
        U && h(U);
      } else !P && k && e.symbol === "SOL" && (h(k), v(null));
  }, [P, e.symbol, a, t, h, k, e]), W(() => {
    m(p);
  }, [p, m]), l ? /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Send Deposit" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Send funds to your deposit address. We'll confirm automatically." }),
    a === "multi-token" && !P && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-token-quick", children: [
        s.map((U) => {
          const G = t.find((ue) => ue.symbol === U), ee = e.symbol === U;
          return /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${ee ? "is-active" : ""}`,
              onClick: () => {
                G && (C(!1), h(G));
              },
              disabled: !G,
              children: [
                G?.logoUrl && /* @__PURE__ */ r(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: G.logoUrl,
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
        No,
        {
          tokens: I,
          selectedToken: e,
          onSelect: h,
          openSignal: R
        }
      ) })
    ] }),
    !S && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Deposit Amount" }),
      /* @__PURE__ */ r(
        xo,
        {
          config: u,
          valueUsd: p,
          onChange: E,
          maxUsd: Lo
        }
      )
    ] }),
    S && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-note", children: "Send any token you want. We'll detect the deposit, swap it, and credit your balance automatically." }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: S ? "Send any token to this address" : `Send ${D ?? "--"} ${P ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ r("code", { className: "cedros-deposit-flow-address", children: l }),
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
          !S && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${N ? "is-open" : ""}`,
              "data-tooltip": O,
              "aria-label": `Fee breakdown: ${O.replaceAll(`
`, ", ")}`,
              "aria-expanded": N,
              onClick: (U) => {
                U.stopPropagation(), x((G) => !G);
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
          onClick: y,
          disabled: !F,
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
function cu({ token: e, depositAddress: t, copied: s, feeLine: o, onCopy: n }) {
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
function lu({ result: e, config: t, onNewDeposit: s }) {
  const o = e.token ?? Qe, n = Yr(o, t), a = n ? e.amount * n : e.amount, l = Tt(t, a), i = Math.max(a - l, 0), c = l === 0 ? 0 : l < 0.01 ? 0.01 : l;
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
        onClick: s,
        children: "Make Another Deposit"
      }
    ) })
  ] });
}
function du({ error: e, onRetry: t, onCancel: s }) {
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
function To() {
  const e = We(), [t, s] = L(!1), [o, n] = L(null), a = V(() => e ? new ce({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), l = T(() => {
    n(null);
  }, []), i = T(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await a.get("/credits/balance/sol");
    } catch (f) {
      const h = j(f, "Failed to fetch credit balance");
      throw n(h.message), h;
    } finally {
      s(!1);
    }
  }, [a]), c = T(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return (await a.get("/credits/balance")).balances;
    } catch (f) {
      const h = j(f, "Failed to fetch credit balances");
      throw n(h.message), h;
    } finally {
      s(!1);
    }
  }, [a]), u = T(
    async (f) => {
      if (!a)
        throw new Error("useCredits must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const h = new URLSearchParams();
        f?.currency && h.set("currency", f.currency), f?.limit !== void 0 && h.set("limit", f.limit.toString()), f?.offset !== void 0 && h.set("offset", f.offset.toString());
        const m = h.toString(), y = m ? `/credits/history?${m}` : "/credits/history";
        return await a.get(y);
      } catch (h) {
        const m = j(h, "Failed to fetch transaction history");
        throw n(m.message), m;
      } finally {
        s(!1);
      }
    },
    [a]
  );
  return {
    getBalance: i,
    getAllBalances: c,
    getHistory: u,
    isLoading: t,
    error: o,
    clearError: l
  };
}
function hh({
  showAllCurrencies: e = !1,
  refreshInterval: t = 0,
  compact: s = !1,
  className: o = "",
  onLoad: n
}) {
  const { getBalance: a, getAllBalances: l, isLoading: i, error: c, clearError: u } = To(), [f, h] = L([]), [m, y] = L(null), w = T(async () => {
    try {
      if (e) {
        const p = await l();
        h(p), n?.(p);
      } else {
        const p = await a();
        h([p]), n?.([p]);
      }
      y(null);
    } catch (p) {
      y(p instanceof Error ? p.message : "Failed to load balance");
    }
  }, [e, a, l, n]);
  if (W(() => {
    w();
  }, [w]), W(() => {
    if (t <= 0) return;
    const p = setInterval(w, t);
    return () => clearInterval(p);
  }, [t, w]), m || c)
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-error ${o}`, children: [
      /* @__PURE__ */ r("p", { className: "cedros-credit-error", children: m || c }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-credit-retry",
          onClick: () => {
            u(), y(null), w();
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
  if (s) {
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
function uu(e, t) {
  const s = e < 0, o = Math.abs(e), n = So(t), a = o / Math.pow(10, n), l = s ? "-" : "+";
  return t.toUpperCase() === "SOL" ? `${l}${a.toFixed(4)} SOL` : `${l}$${a.toFixed(2)}`;
}
function hu(e) {
  const t = new Date(e), s = /* @__PURE__ */ new Date(), o = s.getTime() - t.getTime();
  if (o < 0) return "Just now";
  const n = Math.floor(o / (1e3 * 60 * 60 * 24));
  if (n === 0) {
    const a = Math.floor(o / 36e5);
    if (a === 0) {
      const l = Math.floor(o / 6e4);
      return l < 1 ? "Just now" : `${l}m ago`;
    }
    return `${a}h ago`;
  }
  return n === 1 ? "Yesterday" : n < 7 ? `${n}d ago` : t.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: t.getFullYear() !== s.getFullYear() ? "numeric" : void 0
  });
}
function fu(e) {
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
function mu(e, t) {
  const s = (e || "").toLowerCase();
  return s === "deposit" ? "↓" : s === "spend" || s === "usage" || s === "charge" ? "↑" : s === "refund" ? "←" : s === "bonus" || s === "credit" ? "★" : t ? "+" : "−";
}
function fh({
  defaultTab: e = "all",
  pageSize: t = 10,
  refreshInterval: s = 0,
  className: o = "",
  onLoad: n,
  onTransactionClick: a
}) {
  const { getHistory: l, isLoading: i, error: c, clearError: u } = To(), [f, h] = L(e), [m, y] = L([]), [w, p] = L(0), [E, A] = L(0), [C, N] = L(null), x = br.find((B) => B.key === f) || br[0], R = V(() => x.txTypes === null ? m : m.filter((B) => {
    const M = B.txType || "";
    return x.txTypes.some((_) => M.toLowerCase() === _.toLowerCase());
  }), [m, x.txTypes]), g = T(async () => {
    try {
      const B = await l({ limit: t * 3, offset: E });
      y(B.transactions), p(B.total), n?.(B), N(null);
    } catch (B) {
      N(B instanceof Error ? B.message : "Failed to load history");
    }
  }, [t, E, l, n]);
  W(() => {
    A(0);
  }, [f]), W(() => {
    g();
  }, [g]), W(() => {
    if (s <= 0) return;
    const B = setInterval(g, s);
    return () => clearInterval(B);
  }, [s, g]);
  const k = x.txTypes === null ? w : R.length, v = Math.ceil(k / t), b = Math.floor(E / t) + 1, P = (B) => {
    const M = (B - 1) * t;
    A(Math.max(0, Math.min(M, Math.max(0, k - t))));
  }, S = (B) => {
    h(B);
  };
  if (C || c)
    return /* @__PURE__ */ d("div", { className: `cedros-tx-history cedros-tx-history-error ${o}`, children: [
      /* @__PURE__ */ r("p", { className: "cedros-tx-error", children: C || c }),
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
  const I = (B) => B.txTypes === null ? m.length : m.filter((M) => {
    const _ = M.txType || "";
    return B.txTypes.some((O) => _.toLowerCase() === O.toLowerCase());
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
    /* @__PURE__ */ r("div", { className: "cedros-tx-tabs", children: br.map((B) => {
      const M = I(B), _ = f === B.key;
      return /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: `cedros-tx-tab ${_ ? "cedros-tx-tab-active" : ""}`,
          onClick: () => S(B.key),
          children: [
            B.label,
            M > 0 && /* @__PURE__ */ r("span", { className: "cedros-tx-tab-count", children: M })
          ]
        },
        B.key
      );
    }) }),
    R.length === 0 ? /* @__PURE__ */ d("div", { className: "cedros-tx-empty", children: [
      /* @__PURE__ */ r("p", { className: "cedros-tx-empty-message", children: f === "all" ? "No transactions yet." : `No ${x.label.toLowerCase()} found.` }),
      f === "all" && /* @__PURE__ */ r("p", { className: "cedros-tx-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-tx-list", children: R.slice(0, t).map((B) => {
        const M = B.amountLamports >= 0;
        return /* @__PURE__ */ d(
          "div",
          {
            className: `cedros-tx-item ${M ? "cedros-tx-item-positive" : "cedros-tx-item-negative"}`,
            onClick: () => a?.(B),
            onKeyDown: (_) => {
              (_.key === "Enter" || _.key === " ") && (_.preventDefault(), a?.(B));
            },
            role: a ? "button" : void 0,
            tabIndex: a ? 0 : void 0,
            children: [
              /* @__PURE__ */ r(
                "div",
                {
                  className: `cedros-tx-icon ${M ? "cedros-tx-icon-positive" : "cedros-tx-icon-negative"}`,
                  children: mu(B.txType, M)
                }
              ),
              /* @__PURE__ */ d("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-tx-type", children: fu(B.txType) }),
                  /* @__PURE__ */ r(
                    "span",
                    {
                      className: `cedros-tx-amount ${M ? "cedros-tx-amount-positive" : "cedros-tx-amount-negative"}`,
                      children: uu(B.amountLamports, B.currency)
                    }
                  )
                ] }),
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-tx-description", children: B.description }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-date", children: hu(B.createdAt) })
                ] })
              ] })
            ]
          },
          B.id
        );
      }) }),
      v > 1 && /* @__PURE__ */ d("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => P(b - 1),
            disabled: b <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ d("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          b,
          " of ",
          v
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => P(b + 1),
            disabled: b >= v,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Io() {
  const e = We(), [t, s] = L(!1), [o, n] = L(null), [a, l] = L(null), i = V(() => e ? new ce({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), c = T(() => {
    n(null);
  }, []), u = T(async () => {
    if (!i)
      throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
    try {
      return await i.get("/wallet/withdraw/balances");
    } catch (y) {
      const w = j(y, "Failed to fetch wallet balances");
      throw n(w.message), w;
    }
  }, [i]), f = T(
    async (y, w) => {
      if (!i)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const p = await i.post("/wallet/withdraw/sol", {
          destination: y,
          amount_lamports: w
        });
        return l(p), p;
      } catch (p) {
        const E = j(p, "Failed to withdraw SOL");
        throw n(E.message), E;
      } finally {
        s(!1);
      }
    },
    [i]
  ), h = T(
    async (y, w, p) => {
      if (!i)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const E = await i.post("/wallet/withdraw/spl", {
          destination: y,
          token_mint: w,
          amount: p
        });
        return l(E), E;
      } catch (E) {
        const A = j(E, "Failed to withdraw token");
        throw n(A.message), A;
      } finally {
        s(!1);
      }
    },
    [i]
  ), m = T(
    async (y = 10, w = 0) => {
      if (!i)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      try {
        const p = Math.max(1, Math.min(100, Math.trunc(y))), E = Math.max(0, Math.trunc(w)), A = new URLSearchParams({
          limit: String(p),
          offset: String(E)
        });
        return await i.get(
          `/wallet/withdraw/history?${A}`
        );
      } catch (p) {
        const E = j(p, "Failed to fetch withdrawal history");
        throw n(E.message), E;
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
    clearError: c,
    lastResult: a
  };
}
const Ar = "So11111111111111111111111111111111111111112", pu = {
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
function gu(e) {
  return e.length < 32 || e.length > 50 ? !1 : /^[1-9A-HJ-NP-Za-km-z]+$/.test(e);
}
function vr(e) {
  return e.length <= 16 ? e : `${e.slice(0, 6)}...${e.slice(-6)}`;
}
function mt(e, t) {
  return (Number(e) / Math.pow(10, t)).toLocaleString(void 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(t, 6)
  });
}
function mh({
  onSuccess: e,
  onError: t,
  onCancel: s,
  className: o = ""
}) {
  const n = We(), { withdrawSol: a, withdrawSpl: l, getBalances: i, isSubmitting: c, error: u, clearError: f } = Io(), [h, m] = L("loading"), [y, w] = L([]), [p, E] = L(null), [A, C] = L(""), [N, x] = L(""), [R, g] = L(null), [k, v] = L(null), [b, P] = L(null), S = n?.config.solana?.network ?? "mainnet-beta", I = V(() => {
    if (!R?.txSignature) return "";
    const D = `https://explorer.solana.com/tx/${R.txSignature}`;
    return S === "mainnet-beta" ? D : `${D}?cluster=${encodeURIComponent(S)}`;
  }, [R, S]), B = V(() => {
    if (!p || !N) return "0";
    const D = parseFloat(N);
    return isNaN(D) || D <= 0 ? "0" : Math.floor(D * Math.pow(10, p.decimals)).toString();
  }, [N, p]);
  W(() => {
    if (!n) return;
    let D = !1;
    return (async () => {
      try {
        const U = await i();
        if (D) return;
        const G = [];
        U.solLamports > 0 && G.push({
          symbol: "SOL",
          mint: Ar,
          decimals: 9,
          rawBalance: String(U.solLamports),
          displayBalance: mt(String(U.solLamports), 9)
        });
        for (const ee of U.tokens) {
          const ue = pu[ee.mint] ?? vr(ee.mint);
          G.push({
            symbol: ue,
            mint: ee.mint,
            decimals: ee.decimals,
            rawBalance: ee.amount,
            displayBalance: mt(ee.amount, ee.decimals)
          });
        }
        w(G), m((G.length > 0, "select"));
      } catch {
        D || (P("Failed to load wallet balances"), m("select"));
      }
    })(), () => {
      D = !0;
    };
  }, [n, i]);
  const M = T(
    (D) => {
      E(D), m("form"), f(), v(null), x("");
    },
    [f]
  ), _ = T(() => {
    if (!p) return;
    const D = Number(p.rawBalance) / Math.pow(10, p.decimals);
    p.mint === Ar ? x(String(Math.max(0, D - 0.01))) : x(String(D));
  }, [p]), O = T(() => {
    if (v(null), !A.trim()) {
      v("Destination address is required");
      return;
    }
    if (!gu(A.trim())) {
      v("Invalid Solana address");
      return;
    }
    if (!N || parseFloat(N) <= 0 || isNaN(parseFloat(N))) {
      v("Please enter a valid amount");
      return;
    }
    if (B === "0") {
      v("Amount is too small");
      return;
    }
    m("confirm");
  }, [A, N, B]), F = T(async () => {
    if (p) {
      m("processing"), f();
      try {
        let D;
        p.mint === Ar ? D = await a(A.trim(), Number(B)) : D = await l(A.trim(), p.mint, B), g(D), m("success"), e?.(D);
      } catch (D) {
        m("confirm"), t?.(D instanceof Error ? D : new Error(String(D)));
      }
    }
  }, [
    p,
    A,
    B,
    a,
    l,
    f,
    e,
    t
  ]), H = T(() => {
    f(), v(null), h === "form" ? (m("select"), E(null), x(""), C("")) : h === "confirm" && m("form");
  }, [h, f]), q = T(() => {
    m("select"), E(null), C(""), x(""), g(null), f(), v(null);
  }, [f]);
  return n ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal ${o}`, children: [
    h === "loading" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ r($, {}),
      /* @__PURE__ */ r("p", { className: "cedros-withdrawal-processing-text", children: "Loading wallet balances..." })
    ] }),
    h === "select" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-select", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Withdraw" }),
        /* @__PURE__ */ r("p", { className: "cedros-withdrawal-subtitle", children: "Select a token to withdraw" })
      ] }),
      b && /* @__PURE__ */ r(se, { error: b }),
      y.length === 0 && !b && /* @__PURE__ */ r("p", { className: "cedros-withdrawal-empty", children: "No tokens found in your wallet." }),
      /* @__PURE__ */ r("div", { className: "cedros-withdrawal-tokens", children: y.map((D) => /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: "cedros-withdrawal-token-pill",
          onClick: () => M(D),
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
      (k || u) && /* @__PURE__ */ r(se, { error: k || u || "" }),
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
    h === "confirm" && p && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-confirm", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: H,
            disabled: c,
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
            mt(B, p.decimals),
            " ",
            p.symbol
          ] })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Destination" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", title: A, children: vr(A) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Est. Fee" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", children: "~0.000005 SOL" })
        ] })
      ] }),
      u && /* @__PURE__ */ r(se, { error: u }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: H,
            disabled: c,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: F,
            disabled: c,
            children: c ? "Sending..." : "Confirm & Send"
          }
        )
      ] })
    ] }),
    h === "processing" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ r($, {}),
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
        mt(B, p?.decimals ?? 9),
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
            href: I,
            target: "_blank",
            rel: "noreferrer",
            children: vr(R.txSignature)
          }
        )
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-withdrawal-done",
          onClick: q,
          children: "Done"
        }
      )
    ] })
  ] }) : null;
}
function wu(e, t) {
  if (e === "sol") return "SOL";
  if (!t) return "SPL";
  const s = Kr.find((o) => o.mint === t);
  return s ? s.symbol : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function yu(e, t) {
  const s = Number(e);
  if (Number.isNaN(s)) return e;
  const o = So(t), n = s / Math.pow(10, o);
  return t === "SOL" ? `${n.toFixed(4)} SOL` : `${n.toFixed(2)} ${t}`;
}
function bu(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function Au(e) {
  const t = new Date(e), s = /* @__PURE__ */ new Date(), o = s.getTime() - t.getTime();
  if (o < 0) return "Just now";
  const n = Math.floor(o / (1e3 * 60 * 60 * 24));
  if (n === 0) {
    const a = Math.floor(o / 36e5);
    if (a === 0) {
      const l = Math.floor(o / 6e4);
      return l < 1 ? "Just now" : `${l}m ago`;
    }
    return `${a}h ago`;
  }
  return n === 1 ? "Yesterday" : n < 7 ? `${n}d ago` : t.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: t.getFullYear() !== s.getFullYear() ? "numeric" : void 0
  });
}
function ph({
  pageSize: e = 10,
  className: t = "",
  onTransactionClick: s,
  explorerUrl: o = "https://solscan.io"
}) {
  const n = o.startsWith("https://") ? o : "https://solscan.io", { getHistory: a, error: l, clearError: i } = Io(), [c, u] = L([]), [f, h] = L(0), [m, y] = L(0), [w, p] = L(!1), [E, A] = L(null), C = T(async () => {
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
  W(() => {
    C();
  }, [C]);
  const N = Math.ceil(f / e), x = Math.floor(m / e) + 1, R = (g) => {
    const k = (g - 1) * e;
    y(Math.max(0, Math.min(k, Math.max(0, f - e))));
  };
  return E || l ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-error ${t}`, children: [
    /* @__PURE__ */ r("p", { className: "cedros-withdrawal-error", children: E || l }),
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
          onClick: C,
          disabled: w,
          title: "Refresh",
          children: w ? "..." : "↻"
        }
      )
    ] }),
    c.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-tx-empty", children: /* @__PURE__ */ r("p", { className: "cedros-tx-empty-message", children: "No withdrawal history yet." }) }) : /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-tx-list", children: c.map((g) => {
        const k = wu(g.tokenType, g.tokenMint);
        return /* @__PURE__ */ d(
          "div",
          {
            className: "cedros-tx-item cedros-tx-item-negative",
            onClick: () => s?.(g),
            onKeyDown: (v) => {
              (v.key === "Enter" || v.key === " ") && (v.preventDefault(), s?.(g));
            },
            role: s ? "button" : void 0,
            tabIndex: s ? 0 : void 0,
            children: [
              /* @__PURE__ */ r("div", { className: "cedros-tx-icon cedros-tx-icon-negative", children: "↑" }),
              /* @__PURE__ */ d("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ d("span", { className: "cedros-tx-type", children: [
                    k,
                    " Withdrawal"
                  ] }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-amount cedros-tx-amount-negative", children: yu(g.amount, k) })
                ] }),
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ d("span", { className: "cedros-tx-description", children: [
                    "To",
                    " ",
                    /* @__PURE__ */ r(
                      "a",
                      {
                        href: `${n}/account/${g.destination}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (v) => v.stopPropagation(),
                        children: bu(g.destination)
                      }
                    ),
                    " · ",
                    /* @__PURE__ */ r(
                      "a",
                      {
                        href: `${n}/tx/${g.txSignature}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (v) => v.stopPropagation(),
                        children: "tx"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-date", children: Au(g.createdAt) })
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
function gh({
  brandLogo: e,
  brandName: t,
  title: s = "Welcome back",
  subtitle: o = "Login with your Apple or Google account",
  termsText: n,
  onSuccess: a,
  defaultTab: l = "login",
  children: i,
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
      i ?? /* @__PURE__ */ r(Vr, { defaultTab: l, onSuccess: a })
    ] }),
    n && /* @__PURE__ */ r("p", { className: "cedros-terms-footer", children: n })
  ] });
}
function wh({
  brandName: e = "Your Brand",
  brandLogo: t,
  tagline: s = "Your tagline goes here. Make it compelling.",
  title: o = "Sign in",
  subtitle: n = "Enter your credentials to access your account",
  onSuccess: a,
  defaultTab: l = "login",
  children: i,
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
      i ?? /* @__PURE__ */ r(Vr, { defaultTab: l, onSuccess: a })
    ] }) })
  ] });
}
function yh() {
  const { config: e, _internal: t } = ne(), [s, o] = L({
    allowed: !1,
    reason: void 0,
    isLoading: !1,
    error: null
  }), n = V(
    () => new ga(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      t?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t]
  ), a = T(
    async (c) => {
      o((u) => ({ ...u, isLoading: !0, error: null }));
      try {
        const u = await n.authorize(c), f = {
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
    [n]
  ), l = T(
    async (c) => (await a(c)).allowed,
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
    authorize: l,
    lastCheck: s,
    clearCheck: i,
    checkAuthorization: a
  };
}
function bh() {
  const { listAllWallets: e, createDerivedWallet: t, deleteDerivedWallet: s } = Ye(), [o, n] = L([]), [a, l] = L(!1), [i, c] = L(null), u = T(async () => {
    l(!0), c(null);
    try {
      const y = await e();
      n(y.wallets);
    } catch (y) {
      const w = y instanceof Error ? y.message : "Failed to list wallets";
      c(w);
    } finally {
      l(!1);
    }
  }, [e]), f = T(
    async (y) => {
      l(!0), c(null);
      try {
        const w = await t({ label: y });
        return await u(), w;
      } catch (w) {
        const p = w instanceof Error ? w.message : "Failed to create wallet";
        throw c(p), w;
      } finally {
        l(!1);
      }
    },
    [t, u]
  ), h = T(
    async (y) => {
      l(!0), c(null);
      try {
        await s(y), await u();
      } catch (w) {
        const p = w instanceof Error ? w.message : "Failed to delete wallet";
        throw c(p), w;
      } finally {
        l(!1);
      }
    },
    [s, u]
  ), m = T(() => c(null), []);
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
function Ah() {
  const e = We(), [t, s] = L(!1), [o, n] = L(null), [a, l] = L(null), i = V(() => e ? new ce({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), c = T(async () => {
    if (!i)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      const h = await i.get("/wallet/pending-recovery");
      l(h);
    } catch (h) {
      const m = j(h, "Failed to fetch pending recovery");
      throw n(m.message), m;
    } finally {
      s(!1);
    }
  }, [i]), u = T(async () => {
    if (!i)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      const h = { confirmed: !0 };
      await i.post("/wallet/acknowledge-recovery", h), l(null);
    } catch (h) {
      const m = j(h, "Failed to acknowledge recovery");
      throw n(m.message), m;
    } finally {
      s(!1);
    }
  }, [i]), f = T(() => n(null), []);
  return W(() => {
    i && e?.authState === "authenticated" && c().catch(() => {
    });
  }, [i, e?.authState, c]), {
    hasPendingRecovery: a?.hasPendingRecovery ?? !1,
    recoveryType: a?.recoveryType ?? null,
    recoveryPhrase: a?.recoveryPhrase ?? null,
    expiresAt: a?.expiresAt ? new Date(a.expiresAt) : null,
    fetchPendingRecovery: c,
    acknowledgeRecovery: u,
    isLoading: t,
    error: o,
    clearError: f
  };
}
function vh(e = {}) {
  const { onExternalSign: t } = e, { solanaPubkey: s, hasExternalWallet: o, status: n, isUnlocked: a } = Lt(), {
    signTransaction: l,
    isSigning: i,
    error: c,
    clearError: u
  } = fl(), f = V(() => o && t ? "external" : n === "enrolled_locked" || n === "enrolled_unlocked" ? "sss" : "none", [o, t, n]), h = f !== "none", m = n === "enrolled_locked" || n === "enrolled_unlocked";
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
          return p ? l(w, p) : l(w);
        }
        throw new Error("No signing method available. Enroll a wallet first.");
      },
      [f, t, a, l]
    ),
    signingMethod: f,
    canSign: h,
    isSigning: i,
    publicKey: s,
    hasExternalWallet: o,
    hasSssWallet: m,
    isSssUnlocked: a,
    error: c,
    clearError: u
  };
}
function kh() {
  const { config: e, _internal: t } = ne(), [s, o] = L(null), [n, a] = L(!1), [l, i] = L(null), c = V(
    () => new ce({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), u = T(async () => {
    a(!0), i(null);
    try {
      await c.post("/welcome-completed", {});
    } catch (h) {
      const m = h instanceof Error ? h : new Error(String(h));
      throw i(m), m;
    } finally {
      a(!1);
    }
  }, [c]), f = T(() => {
    o(null);
  }, []);
  return {
    postLoginAction: s,
    setPostLoginAction: o,
    markWelcomeCompleted: u,
    clearPostLogin: f,
    isLoading: n,
    error: l
  };
}
const Zr = Xo(null), Tr = {
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
function vu(e, t) {
  return Mo(e, t);
}
function Mo(e, t) {
  const s = { ...e };
  for (const o in t)
    if (Object.prototype.hasOwnProperty.call(t, o)) {
      const n = e[o], a = t[o];
      typeof n == "object" && n !== null && typeof a == "object" && a !== null ? s[o] = Mo(
        n,
        a
      ) : a !== void 0 && (s[o] = a);
    }
  return s;
}
function Nh({
  children: e,
  locale: t = "en",
  translations: s
}) {
  const o = V(() => ({ t: s ? vu(Tr, s) : Tr, locale: t }), [s, t]);
  return /* @__PURE__ */ r(Zr.Provider, { value: o, children: e });
}
function Eh() {
  return bn(Zr)?.t ?? Tr;
}
function Ch() {
  return bn(Zr)?.locale ?? "en";
}
export {
  ih as AccountSettings,
  ya as AdminDepositList,
  wa as AdminDepositStats,
  $h as AdminIcons,
  Aa as AdminPrivacyPeriodDeposits,
  Gh as AdminShell,
  Ca as AdminUserList,
  ka as AdminWithdrawalHistory,
  va as AdminWithdrawalQueue,
  ba as AdminWithdrawalStats,
  _c as AppleLoginButton,
  Sa as AuthenticationSettings,
  Qh as CEDROS_LOGIN_SECTION_IDS,
  th as CapabilityWarning,
  oh as CedrosAdminDashboard,
  Lh as CedrosLoginProvider,
  dh as ChooseUsernamePrompt,
  lh as CompleteAccountPrompt,
  hh as CreditBalance,
  Ta as CreditSystemSettings,
  uh as DepositFlow,
  ea as EmailLoginForm,
  ta as EmailRegisterForm,
  Jh as EmailSettings,
  La as EmbeddedWalletSettings,
  qc as ErrorBoundary,
  se as ErrorMessage,
  Tc as ForgotPasswordForm,
  gh as FullPageLayout,
  ra as GoogleLoginButton,
  fh as History,
  Nh as I18nProvider,
  la as InviteForm,
  da as InviteList,
  Nd as LinkedAccounts,
  $ as LoadingSpinner,
  Yu as LoginButton,
  Vr as LoginForm,
  Zu as LoginModal,
  ca as MemberList,
  ch as MfaSetupPrompt,
  Ju as OrgSelector,
  eh as OrgSwitcher,
  kn as OtpInput,
  Oc as PasskeyLoginButton,
  pl as PasskeyPrompt,
  ge as PasswordInput,
  Ta as PrivacyCashSettings,
  xa as ProfileDropdown,
  vd as ProfileTab,
  nl as RecoveryPhraseDisplay,
  ol as RecoveryPhraseInput,
  Xu as ResetPasswordForm,
  Kr as SUPPORTED_TOKENS,
  nh as SecuritySettings,
  Ia as ServerSettings,
  Zc as SessionList,
  Ma as SettingsPageLayout,
  Fl as SetupWizard,
  sa as SolanaLoginButton,
  wh as SplitPageLayout,
  sh as SystemSettings,
  xo as TieredAmountSlider,
  No as TokenSelector,
  wd as TotpSettings,
  wo as TotpSetup,
  _h as TotpVerify,
  ah as UserProfileSettings,
  Bl as WalletAddressRow,
  hl as WalletEnrollment,
  rh as WalletManager,
  El as WalletRecovery,
  Pl as WalletStatus,
  bl as WalletUnlock,
  sf as WebhookSettings,
  mh as WithdrawalFlow,
  ph as WithdrawalHistory,
  Kh as cedrosLoginPlugin,
  Tr as defaultTranslations,
  Bh as getEmbeddedWalletInfo,
  $r as getTierForAmount,
  Ph as isEmbeddedWalletAvailable,
  Yh as loginPlugin,
  vu as mergeTranslations,
  qh as registerMobileWallet,
  tf as useAdminDeposits,
  Zh as useAdminShell,
  Vh as useAdminUsers,
  Mc as useAppleAuth,
  St as useAuth,
  Th as useAuthState,
  Ih as useAuthUI,
  yh as useAuthorize,
  ne as useCedrosLogin,
  yo as useCredentials,
  To as useCredits,
  _d as useDeposit,
  Dh as useEmailAuth,
  Oh as useGoogleAuth,
  Pc as useInstantLink,
  ia as useInvites,
  Ch as useLocale,
  aa as useMembers,
  pa as useOrgs,
  ml as usePasskeySigning,
  zr as usePasswordReset,
  Ah as usePendingRecovery,
  kh as usePostLogin,
  Rt as useProfile,
  na as useServerFeatures,
  Rd as useSessions,
  dl as useSetPassword,
  uo as useSetup,
  jh as useSolanaAuth,
  ha as useSystemSettings,
  go as useTotp,
  Uh as useTotpVerify,
  vh as useTransactionSigning,
  Eh as useTranslations,
  Md as useUsername,
  Lt as useWallet,
  ll as useWalletEnrollment,
  Ye as useWalletMaterial,
  Nl as useWalletRecovery,
  fl as useWalletSigning,
  bh as useWallets,
  co as useWebAuthn,
  Io as useWithdrawal,
  Bt as validatePassword
};
