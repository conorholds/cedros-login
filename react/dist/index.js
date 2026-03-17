import { D as pt, v as na, a as oa, w as Cn, t as Ve, b as En, c as Sn, u as Wt, g as aa, d as ia, e as nt, f as ca, h as xn, i as _n, j as Te, k as Ln, l as Pn, m as Hr, n as Tn, o as la, p as Rn, q as qt } from "./useAuth-l-itM5am.js";
import { C as Im, r as Mm, s as Um } from "./useAuth-l-itM5am.js";
import { u as J, A as ae, h as j, a as He } from "./useCedrosLogin-CFfID-0i.js";
import { b as Fm, c as Om } from "./useCedrosLogin-CFfID-0i.js";
import { jsx as t, jsxs as c, Fragment as X } from "react/jsx-runtime";
import { useState as S, useRef as se, useMemo as q, useEffect as F, useCallback as P, useId as Bn, Fragment as da, Component as ua, createContext as ha, useContext as In } from "react";
import { L as Z } from "./LoadingSpinner-6vml-zwr.js";
import { a as Mn, s as ma } from "./sanitization-CQ-H1MSg.js";
import { b as Un, E as fa, a as pa, P as ve, O as Dn } from "./EmailRegisterForm-p2X5QP58.js";
import { T as qm, u as zm, c as jm } from "./EmailRegisterForm-p2X5QP58.js";
import { b as Fn, v as zt } from "./validation-B8kMV3BL.js";
import { E as le } from "./ErrorMessage-CcEK0pYO.js";
import { G as ga } from "./GoogleLoginButton-C1WNu7W3.js";
import { u as Vm } from "./GoogleLoginButton-C1WNu7W3.js";
import { d as ps, S as wa } from "./SolanaLoginButton-CyeX35eU.js";
import { r as Qm, u as Gm } from "./SolanaLoginButton-CyeX35eU.js";
import { u as ya, a as ba, M as va, I as Aa, b as Na, P as ka, c as Ca, d as Ea } from "./PermissionsSection-mm9hfp-u.js";
import { u as On } from "./useSystemSettings-rgskaDqP.js";
import { C as Sa, S as Qr, a as xa, u as Wn, A as qn } from "./AutosaveStatus-D-roPsRx.js";
import { A as _a, a as La } from "./AdminDepositList-BUm_ZcAW.js";
import { A as Pa, a as Ta, b as Ra, c as Ba } from "./AdminWithdrawalHistory-C76bkbjX.js";
import { u as Ia, A as Ma, a as Ua, b as zn } from "./useUsersStatsSummary-BGeh3RnI.js";
import { c as Ym } from "./useUsersStatsSummary-BGeh3RnI.js";
import { S as jn } from "./StatsBar-BX-hHtTq.js";
import { u as Da, O as Fa } from "./useOrgs-C90KT9KP.js";
import { P as Oa } from "./plugin-CetHtdLq.js";
import { I as Xm, A as Jm, C as ef, c as tf, c as rf, u as sf } from "./plugin-CetHtdLq.js";
import { A as Wa } from "./AuthenticationSettings-BsuwWKbT.js";
import { E as qa } from "./EmbeddedWalletSettings-CCT9DwmL.js";
import { A as za, S as ja, P as $a } from "./EmailSettings-BUAQji4I.js";
import { E as of } from "./EmailSettings-BUAQji4I.js";
import { C as Va } from "./CreditSystemSettings-SL45GRH3.js";
import { S as Ha } from "./ServerSettings-24DA_BOI.js";
import { S as Gr } from "./WebhookSettings-D9IsXZJN.js";
import { W as cf } from "./WebhookSettings-D9IsXZJN.js";
import { u as df } from "./useAdminDeposits-C76B2Q_8.js";
let je = null, Qa = 0;
const ft = /* @__PURE__ */ new Map();
function Ga() {
  return typeof Worker > "u" ? null : (je || (je = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/argon2Worker-Bi5TuQvD.js", import.meta.url).href,
    import.meta.url
  ), {
    type: "module"
  }), je.onmessage = (e) => {
    const { id: r, key: s, error: o } = e.data, n = ft.get(r);
    if (n) {
      if (ft.delete(r), o) {
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
    const r = e instanceof ErrorEvent ? e.error : new Error("Argon2 worker error");
    for (const s of ft.values())
      s.reject(r instanceof Error ? r : new Error(String(r)));
    ft.clear(), je?.terminate(), je = null;
  }), je);
}
async function $n(e, r, s = pt) {
  na(s);
  const o = Ga();
  return o ? new Promise((n, a) => {
    const i = Qa++;
    ft.set(i, { resolve: n, reject: a });
    const d = {
      id: i,
      password: e,
      salt: r,
      params: s
    };
    o.postMessage(d);
  }) : oa(e, r, s);
}
function Vn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Ka(e) {
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
var _t = { exports: {} };
const Ya = globalThis.crypto, Za = globalThis.crypto, Xa = globalThis.crypto.subtle, Ja = globalThis.crypto.getRandomValues.bind(globalThis.crypto), ei = globalThis.crypto.randomUUID.bind(globalThis.crypto), ti = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ya,
  getRandomValues: Ja,
  randomUUID: ei,
  subtle: Xa,
  webcrypto: Za
}, Symbol.toStringTag, { value: "Module" })), ri = /* @__PURE__ */ Ka(ti);
var si = _t.exports, gs;
function ni() {
  return gs || (gs = 1, (function(e, r) {
    (function(s, o) {
      e.exports = o(ri);
    })(si, function(s) {
      var o, n, a, i, d;
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
        }, n = {}, a = new Array(1024).join("0"), i = !0, d = [
          "nodeCryptoRandomBytes",
          "browserCryptoGetRandomValues",
          "testRandom"
        ];
      }
      function h() {
        return !!(n && n.rng && typeof n.rng == "function");
      }
      function m(f, b) {
        var v;
        if (b === 0 || b === 1)
          return f;
        if (b && b > 1024)
          throw new Error(
            "Padding must be multiples of no larger than 1024 bits."
          );
        return b = b || n.bits, f && (v = f.length % b), v ? (a + f).slice(
          -(b - v + f.length)
        ) : f;
      }
      function u(f) {
        var b = "", v, N;
        for (N = f.length - 1; N >= 0; N--) {
          if (v = parseInt(f[N], 16), isNaN(v))
            throw new Error("Invalid hex character.");
          b = m(v.toString(2), 4) + b;
        }
        return b;
      }
      function p(f) {
        var b = "", v, N;
        for (f = m(f, 4), N = f.length; N >= 4; N -= 4) {
          if (v = parseInt(f.slice(N - 4, N), 2), isNaN(v))
            throw new Error("Invalid binary character.");
          b = v.toString(16) + b;
        }
        return b;
      }
      function y() {
        return !!(s && typeof s == "object" && (typeof s.getRandomValues == "function" || typeof s.getRandomValues == "object") && (typeof Uint32Array == "function" || typeof Uint32Array == "object"));
      }
      function w() {
        return typeof s == "object" && typeof s.randomBytes == "function";
      }
      function g(f) {
        function b(_, B, R, I) {
          var M = 0, U, W = "", z;
          for (B && (U = B.length - 1); M < U || W.length < _; )
            z = Math.abs(parseInt(B[M], R)), W = W + m(z.toString(2), I), M++;
          return W = W.substr(-_), (W.match(/0/g) || []).length === W.length ? null : W;
        }
        function v(_) {
          var B, R, I, M, U = null;
          for (I = 16, M = 4, R = Math.ceil(_ / 8); U === null; )
            B = s.randomBytes(R), U = b(_, B.toString("hex"), I, M);
          return U;
        }
        function N(_) {
          var B, R, I, M = null;
          for (R = 10, I = 32, B = Math.ceil(_ / 32); M === null; )
            M = b(
              _,
              s.getRandomValues(new Uint32Array(B)),
              R,
              I
            );
          return M;
        }
        function T(_) {
          var B, R, I, M, U, W = null;
          M = 10, U = 32, R = Math.ceil(_ / 32), I = 123456789, B = new Uint32Array(R);
          for (var z = 0; z < B.length; z++)
            B[z] = I;
          for (; W === null; )
            W = b(_, B, M, U);
          return W;
        }
        if (f && f === "testRandom")
          return n.typeCSPRNG = f, T;
        if (f && f === "nodeCryptoRandomBytes")
          return n.typeCSPRNG = f, v;
        if (f && f === "browserCryptoGetRandomValues")
          return n.typeCSPRNG = f, N;
        if (w())
          return n.typeCSPRNG = "nodeCryptoRandomBytes", v;
        if (y())
          return n.typeCSPRNG = "browserCryptoGetRandomValues", N;
      }
      function k(f, b) {
        var v = [], N;
        for (b && (f = m(f, b)), N = f.length; N > n.bits; N -= n.bits)
          v.push(parseInt(f.slice(N - n.bits, N), 2));
        return v.push(parseInt(f.slice(0, N), 2)), v;
      }
      function A(f, b) {
        var v = n.logs[f], N = 0, T;
        for (T = b.length - 1; T >= 0; T--)
          N !== 0 ? N = n.exps[(v + n.logs[N]) % n.maxShares] ^ b[T] : N = b[T];
        return N;
      }
      function C(f, b, v) {
        var N = 0, T, _, B, R;
        for (B = 0, T = b.length; B < T; B++)
          if (v[B]) {
            for (_ = n.logs[v[B]], R = 0; R < T; R++)
              if (B !== R) {
                if (f === b[R]) {
                  _ = -1;
                  break;
                }
                _ = (_ + n.logs[f ^ b[R]] - n.logs[b[B] ^ b[R]] + n.maxShares) % n.maxShares;
              }
            N = _ === -1 ? N : N ^ n.exps[_];
          }
        return N;
      }
      function E(f, b, v) {
        var N = [], T = [f], _, B;
        for (_ = 1; _ < v; _++)
          T[_] = parseInt(n.rng(n.bits), 2);
        for (_ = 1, B = b + 1; _ < B; _++)
          N[_ - 1] = {
            x: _,
            y: A(_, T)
          };
        return N;
      }
      function x(f, b, v) {
        var N, T, _, B, R;
        if (b = parseInt(b, n.radix), f = parseInt(f, 10) || n.bits, N = f.toString(36).toUpperCase(), _ = Math.pow(2, f) - 1, B = _.toString(n.radix).length, T = m(b.toString(n.radix), B), typeof b != "number" || b % 1 !== 0 || b < 1 || b > _)
          throw new Error(
            "Share id must be an integer between 1 and " + _ + ", inclusive."
          );
        return R = N + T + v, R;
      }
      var L = {
        init: function(f, b) {
          var v = [], N = [], T = 1, _, B;
          if (l(), f && (typeof f != "number" || f % 1 !== 0 || f < o.minBits || f > o.maxBits))
            throw new Error(
              "Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (b && d.indexOf(b) === -1)
            throw new Error("Invalid RNG type argument : '" + b + "'");
          for (n.radix = o.radix, n.bits = f || o.bits, n.size = Math.pow(2, n.bits), n.maxShares = n.size - 1, _ = o.primitivePolynomials[n.bits], B = 0; B < n.size; B++)
            N[B] = T, v[T] = B, T = T << 1, T >= n.size && (T = T ^ _, T = T & n.maxShares);
          if (n.logs = v, n.exps = N, b && this.setRNG(b), h() || this.setRNG(), !h() || !n.bits || !n.size || !n.maxShares || !n.logs || !n.exps || n.logs.length !== n.size || n.exps.length !== n.size)
            throw new Error("Initialization failed.");
        },
        // Evaluates the Lagrange interpolation polynomial at x=`at` for
        // individual config.bits-length segments of each share in the `shares`
        // Array. Each share is expressed in base `inputRadix`. The output
        // is expressed in base `outputRadix'.
        combine: function(f, b) {
          var v, N, T, _, B = "", R, I, M, U = [], W = [];
          for (b = b || 0, v = 0, T = f.length; v < T; v++) {
            if (I = this.extractShareComponents(f[v]), R === void 0)
              R = I.bits;
            else if (I.bits !== R)
              throw new Error(
                "Mismatched shares: Different bit settings."
              );
            if (n.bits !== R && this.init(R), U.indexOf(I.id) === -1)
              for (U.push(I.id), M = k(u(I.data)), N = 0, _ = M.length; N < _; N++)
                W[N] = W[N] || [], W[N][U.length - 1] = M[N];
          }
          for (v = 0, T = W.length; v < T; v++)
            B = m(C(b, U, W[v]).toString(2)) + B;
          return p(
            b >= 1 ? B : B.slice(B.indexOf("1") + 1)
          );
        },
        getConfig: function() {
          var f = {};
          return f.radix = n.radix, f.bits = n.bits, f.maxShares = n.maxShares, f.hasCSPRNG = h(), f.typeCSPRNG = n.typeCSPRNG, f;
        },
        // Given a public share, extract the bits (Integer), share ID (Integer), and share data (Hex)
        // and return an Object containing those components.
        extractShareComponents: function(f) {
          var b, v, N, T, _ = {}, B, R;
          if (b = parseInt(f.substr(0, 1), 36), b && (typeof b != "number" || b % 1 !== 0 || b < o.minBits || b > o.maxBits))
            throw new Error(
              "Invalid share : Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (T = Math.pow(2, b) - 1, N = (Math.pow(2, b) - 1).toString(n.radix).length, B = "^([a-kA-K3-9]{1})([a-fA-F0-9]{" + N + "})([a-fA-F0-9]+)$", R = new RegExp(B).exec(f), R && (v = parseInt(R[2], n.radix)), typeof v != "number" || v % 1 !== 0 || v < 1 || v > T)
            throw new Error(
              "Invalid share : Share id must be an integer between 1 and " + n.maxShares + ", inclusive."
            );
          if (R && R[3])
            return _.bits = b, _.id = v, _.data = R[3], _;
          throw new Error("The share data provided is invalid : " + f);
        },
        // Set the PRNG to use. If no RNG function is supplied, pick a default using getRNG()
        setRNG: function(f) {
          var b = "Random number generator is invalid ", v = " Supply an CSPRNG of the form function(bits){} that returns a string containing 'bits' number of random 1's and 0's.";
          if (f && typeof f == "string" && d.indexOf(f) === -1)
            throw new Error("Invalid RNG type argument : '" + f + "'");
          if (f || (f = g()), f && typeof f == "string" && (f = g(f)), i) {
            if (f && typeof f != "function")
              throw new Error(b + "(Not a function)." + v);
            if (f && typeof f(n.bits) != "string")
              throw new Error(
                b + "(Output is not a string)." + v
              );
            if (f && !parseInt(f(n.bits), 2))
              throw new Error(
                b + "(Binary string output not parseable to an Integer)." + v
              );
            if (f && f(n.bits).length > n.bits)
              throw new Error(
                b + "(Output length is greater than config.bits)." + v
              );
            if (f && f(n.bits).length < n.bits)
              throw new Error(
                b + "(Output length is less than config.bits)." + v
              );
          }
          return n.rng = f, !0;
        },
        // Converts a given UTF16 character string to the HEX representation.
        // Each character of the input string is represented by
        // `bytesPerChar` bytes in the output string which defaults to 2.
        str2hex: function(f, b) {
          var v, N, T = "", _, B, R, I;
          if (typeof f != "string")
            throw new Error("Input must be a character string.");
          if (b || (b = o.bytesPerChar), typeof b != "number" || b < 1 || b > o.maxBytesPerChar || b % 1 !== 0)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (v = 2 * b, N = Math.pow(16, v) - 1, R = 0, I = f.length; R < I; R++) {
            if (B = f[R].charCodeAt(), isNaN(B))
              throw new Error("Invalid character: " + f[R]);
            if (B > N)
              throw _ = Math.ceil(Math.log(B + 1) / Math.log(256)), new Error(
                "Invalid character code (" + B + "). Maximum allowable is 256^bytes-1 (" + N + "). To convert this character, use at least " + _ + " bytes."
              );
            T = m(B.toString(16), v) + T;
          }
          return T;
        },
        // Converts a given HEX number string to a UTF16 character string.
        hex2str: function(f, b) {
          var v, N = "", T, _;
          if (typeof f != "string")
            throw new Error("Input must be a hexadecimal string.");
          if (b = b || o.bytesPerChar, typeof b != "number" || b % 1 !== 0 || b < 1 || b > o.maxBytesPerChar)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (v = 2 * b, f = m(f, v), T = 0, _ = f.length; T < _; T += v)
            N = String.fromCharCode(
              parseInt(f.slice(T, T + v), 16)
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
        share: function(f, b, v, N) {
          var T, _, B = new Array(b), R = new Array(b), I, M, U;
          if (N = N || 128, typeof f != "string")
            throw new Error("Secret must be a string.");
          if (typeof b != "number" || b % 1 !== 0 || b < 2)
            throw new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive."
            );
          if (b > n.maxShares)
            throw T = Math.ceil(Math.log(b + 1) / Math.LN2), new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive. To create " + b + " shares, use at least " + T + " bits."
            );
          if (typeof v != "number" || v % 1 !== 0 || v < 2)
            throw new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive."
            );
          if (v > n.maxShares)
            throw T = Math.ceil(Math.log(v + 1) / Math.LN2), new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + n.maxShares + "), inclusive.  To use a threshold of " + v + ", use at least " + T + " bits."
            );
          if (v > b)
            throw new Error(
              "Threshold number of shares was " + v + " but must be less than or equal to the " + b + " shares specified as the total to generate."
            );
          if (typeof N != "number" || N % 1 !== 0 || N < 0 || N > 1024)
            throw new Error(
              "Zero-pad length must be an integer between 0 and 1024 inclusive."
            );
          for (f = "1" + u(f), f = k(f, N), I = 0, U = f.length; I < U; I++)
            for (_ = E(f[I], b, v), M = 0; M < b; M++)
              B[M] = B[M] || _[M].x.toString(n.radix), R[M] = m(_[M].y.toString(2)) + (R[M] || "");
          for (I = 0; I < b; I++)
            B[I] = x(
              n.bits,
              B[I],
              p(R[I])
            );
          return B;
        },
        // Generate a new share with id `id` (a number between 1 and 2^bits-1)
        // `id` can be a Number or a String in the default radix (16)
        newShare: function(f, b) {
          var v, N;
          if (f && typeof f == "string" && (f = parseInt(f, n.radix)), N = f.toString(n.radix), f && N && b && b[0])
            return v = this.extractShareComponents(b[0]), x(
              v.bits,
              N,
              this.combine(b, f)
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
        _hasCryptoGetRandomValues: y,
        _hasCryptoRandomBytes: w,
        _getRNG: g,
        _isSetRNG: h,
        _splitNumStringToIntArray: k,
        _horner: A,
        _lagrange: C,
        _getShares: E,
        _constructPublicShareString: x
        /* end-test-code */
      };
      return L.init(), L;
    });
  })(_t)), _t.exports;
}
var oi = ni();
const Hn = /* @__PURE__ */ Vn(oi);
function Qn(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Kr(e, r = "") {
  if (!Number.isSafeInteger(e) || e < 0) {
    const s = r && `"${r}" `;
    throw new Error(`${s}expected integer >= 0, got ${e}`);
  }
}
function me(e, r, s = "") {
  const o = Qn(e), n = e?.length, a = r !== void 0;
  if (!o || a && n !== r) {
    const i = s && `"${s}" `, d = a ? ` of length ${r}` : "", l = o ? `length=${n}` : `type=${typeof e}`;
    throw new Error(i + "expected Uint8Array" + d + ", got " + l);
  }
  return e;
}
function ws(e, r = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (r && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function ai(e, r) {
  me(e, void 0, "digestInto() output");
  const s = r.outputLen;
  if (e.length < s)
    throw new Error('"digestInto() output" expected to be of length >=' + s);
}
function Mr(...e) {
  for (let r = 0; r < e.length; r++)
    e[r].fill(0);
}
function Yt(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
const Gn = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", ii = /* @__PURE__ */ Array.from({ length: 256 }, (e, r) => r.toString(16).padStart(2, "0"));
function Yr(e) {
  if (me(e), Gn)
    return e.toHex();
  let r = "";
  for (let s = 0; s < e.length; s++)
    r += ii[e[s]];
  return r;
}
const Le = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function ys(e) {
  if (e >= Le._0 && e <= Le._9)
    return e - Le._0;
  if (e >= Le.A && e <= Le.F)
    return e - (Le.A - 10);
  if (e >= Le.a && e <= Le.f)
    return e - (Le.a - 10);
}
function Kn(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  if (Gn)
    return Uint8Array.fromHex(e);
  const r = e.length, s = r / 2;
  if (r % 2)
    throw new Error("hex string expected, got unpadded hex of length " + r);
  const o = new Uint8Array(s);
  for (let n = 0, a = 0; n < s; n++, a += 2) {
    const i = ys(e.charCodeAt(a)), d = ys(e.charCodeAt(a + 1));
    if (i === void 0 || d === void 0) {
      const l = e[a] + e[a + 1];
      throw new Error('hex string expected, got non-hex character "' + l + '" at index ' + a);
    }
    o[n] = i * 16 + d;
  }
  return o;
}
function bs(...e) {
  let r = 0;
  for (let o = 0; o < e.length; o++) {
    const n = e[o];
    me(n), r += n.length;
  }
  const s = new Uint8Array(r);
  for (let o = 0, n = 0; o < e.length; o++) {
    const a = e[o];
    s.set(a, n), n += a.length;
  }
  return s;
}
function ci(e, r = {}) {
  const s = (n, a) => e(a).update(n).digest(), o = e(void 0);
  return s.outputLen = o.outputLen, s.blockLen = o.blockLen, s.create = (n) => e(n), Object.assign(s, r), Object.freeze(s);
}
function li(e = 32) {
  const r = typeof globalThis == "object" ? globalThis.crypto : null;
  if (typeof r?.getRandomValues != "function")
    throw new Error("crypto.getRandomValues must be defined");
  return r.getRandomValues(new Uint8Array(e));
}
const di = (e) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, e])
});
let ui = class {
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
    this.blockLen = r, this.outputLen = s, this.padOffset = o, this.isLE = n, this.buffer = new Uint8Array(r), this.view = Yt(this.buffer);
  }
  update(r) {
    ws(this), me(r);
    const { view: s, buffer: o, blockLen: n } = this, a = r.length;
    for (let i = 0; i < a; ) {
      const d = Math.min(n - this.pos, a - i);
      if (d === n) {
        const l = Yt(r);
        for (; n <= a - i; i += n)
          this.process(l, i);
        continue;
      }
      o.set(r.subarray(i, i + d), this.pos), this.pos += d, i += d, this.pos === n && (this.process(s, 0), this.pos = 0);
    }
    return this.length += r.length, this.roundClean(), this;
  }
  digestInto(r) {
    ws(this), ai(r, this), this.finished = !0;
    const { buffer: s, view: o, blockLen: n, isLE: a } = this;
    let { pos: i } = this;
    s[i++] = 128, Mr(this.buffer.subarray(i)), this.padOffset > n - i && (this.process(o, 0), i = 0);
    for (let u = i; u < n; u++)
      s[u] = 0;
    o.setBigUint64(n - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const d = Yt(r), l = this.outputLen;
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
    const { blockLen: s, buffer: o, length: n, finished: a, destroyed: i, pos: d } = this;
    return r.destroyed = i, r.finished = a, r.length = n, r.pos = d, n % s && r.buffer.set(o), r;
  }
  clone() {
    return this._cloneInto();
  }
};
const fe = /* @__PURE__ */ Uint32Array.from([
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
]), wt = /* @__PURE__ */ BigInt(2 ** 32 - 1), vs = /* @__PURE__ */ BigInt(32);
function hi(e, r = !1) {
  return r ? { h: Number(e & wt), l: Number(e >> vs & wt) } : { h: Number(e >> vs & wt) | 0, l: Number(e & wt) | 0 };
}
function mi(e, r = !1) {
  const s = e.length;
  let o = new Uint32Array(s), n = new Uint32Array(s);
  for (let a = 0; a < s; a++) {
    const { h: i, l: d } = hi(e[a], r);
    [o[a], n[a]] = [i, d];
  }
  return [o, n];
}
const As = (e, r, s) => e >>> s, Ns = (e, r, s) => e << 32 - s | r >>> s, Xe = (e, r, s) => e >>> s | r << 32 - s, Je = (e, r, s) => e << 32 - s | r >>> s, yt = (e, r, s) => e << 64 - s | r >>> s - 32, bt = (e, r, s) => e >>> s - 32 | r << 64 - s;
function Pe(e, r, s, o) {
  const n = (r >>> 0) + (o >>> 0);
  return { h: e + s + (n / 2 ** 32 | 0) | 0, l: n | 0 };
}
const fi = (e, r, s) => (e >>> 0) + (r >>> 0) + (s >>> 0), pi = (e, r, s, o) => r + s + o + (e / 2 ** 32 | 0) | 0, gi = (e, r, s, o) => (e >>> 0) + (r >>> 0) + (s >>> 0) + (o >>> 0), wi = (e, r, s, o, n) => r + s + o + n + (e / 2 ** 32 | 0) | 0, yi = (e, r, s, o, n) => (e >>> 0) + (r >>> 0) + (s >>> 0) + (o >>> 0) + (n >>> 0), bi = (e, r, s, o, n, a) => r + s + o + n + a + (e / 2 ** 32 | 0) | 0, Yn = mi([
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
].map((e) => BigInt(e))), vi = Yn[0], Ai = Yn[1], Ie = /* @__PURE__ */ new Uint32Array(80), Me = /* @__PURE__ */ new Uint32Array(80);
class Ni extends ui {
  constructor(r) {
    super(128, r, 16, !1);
  }
  // prettier-ignore
  get() {
    const { Ah: r, Al: s, Bh: o, Bl: n, Ch: a, Cl: i, Dh: d, Dl: l, Eh: h, El: m, Fh: u, Fl: p, Gh: y, Gl: w, Hh: g, Hl: k } = this;
    return [r, s, o, n, a, i, d, l, h, m, u, p, y, w, g, k];
  }
  // prettier-ignore
  set(r, s, o, n, a, i, d, l, h, m, u, p, y, w, g, k) {
    this.Ah = r | 0, this.Al = s | 0, this.Bh = o | 0, this.Bl = n | 0, this.Ch = a | 0, this.Cl = i | 0, this.Dh = d | 0, this.Dl = l | 0, this.Eh = h | 0, this.El = m | 0, this.Fh = u | 0, this.Fl = p | 0, this.Gh = y | 0, this.Gl = w | 0, this.Hh = g | 0, this.Hl = k | 0;
  }
  process(r, s) {
    for (let E = 0; E < 16; E++, s += 4)
      Ie[E] = r.getUint32(s), Me[E] = r.getUint32(s += 4);
    for (let E = 16; E < 80; E++) {
      const x = Ie[E - 15] | 0, L = Me[E - 15] | 0, f = Xe(x, L, 1) ^ Xe(x, L, 8) ^ As(x, L, 7), b = Je(x, L, 1) ^ Je(x, L, 8) ^ Ns(x, L, 7), v = Ie[E - 2] | 0, N = Me[E - 2] | 0, T = Xe(v, N, 19) ^ yt(v, N, 61) ^ As(v, N, 6), _ = Je(v, N, 19) ^ bt(v, N, 61) ^ Ns(v, N, 6), B = gi(b, _, Me[E - 7], Me[E - 16]), R = wi(B, f, T, Ie[E - 7], Ie[E - 16]);
      Ie[E] = R | 0, Me[E] = B | 0;
    }
    let { Ah: o, Al: n, Bh: a, Bl: i, Ch: d, Cl: l, Dh: h, Dl: m, Eh: u, El: p, Fh: y, Fl: w, Gh: g, Gl: k, Hh: A, Hl: C } = this;
    for (let E = 0; E < 80; E++) {
      const x = Xe(u, p, 14) ^ Xe(u, p, 18) ^ yt(u, p, 41), L = Je(u, p, 14) ^ Je(u, p, 18) ^ bt(u, p, 41), f = u & y ^ ~u & g, b = p & w ^ ~p & k, v = yi(C, L, b, Ai[E], Me[E]), N = bi(v, A, x, f, vi[E], Ie[E]), T = v | 0, _ = Xe(o, n, 28) ^ yt(o, n, 34) ^ yt(o, n, 39), B = Je(o, n, 28) ^ bt(o, n, 34) ^ bt(o, n, 39), R = o & a ^ o & d ^ a & d, I = n & i ^ n & l ^ i & l;
      A = g | 0, C = k | 0, g = y | 0, k = w | 0, y = u | 0, w = p | 0, { h: u, l: p } = Pe(h | 0, m | 0, N | 0, T | 0), h = d | 0, m = l | 0, d = a | 0, l = i | 0, a = o | 0, i = n | 0;
      const M = fi(T, B, I);
      o = pi(M, N, _, R), n = M | 0;
    }
    ({ h: o, l: n } = Pe(this.Ah | 0, this.Al | 0, o | 0, n | 0)), { h: a, l: i } = Pe(this.Bh | 0, this.Bl | 0, a | 0, i | 0), { h: d, l } = Pe(this.Ch | 0, this.Cl | 0, d | 0, l | 0), { h, l: m } = Pe(this.Dh | 0, this.Dl | 0, h | 0, m | 0), { h: u, l: p } = Pe(this.Eh | 0, this.El | 0, u | 0, p | 0), { h: y, l: w } = Pe(this.Fh | 0, this.Fl | 0, y | 0, w | 0), { h: g, l: k } = Pe(this.Gh | 0, this.Gl | 0, g | 0, k | 0), { h: A, l: C } = Pe(this.Hh | 0, this.Hl | 0, A | 0, C | 0), this.set(o, n, a, i, d, l, h, m, u, p, y, w, g, k, A, C);
  }
  roundClean() {
    Mr(Ie, Me);
  }
  destroy() {
    Mr(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class ki extends Ni {
  Ah = fe[0] | 0;
  Al = fe[1] | 0;
  Bh = fe[2] | 0;
  Bl = fe[3] | 0;
  Ch = fe[4] | 0;
  Cl = fe[5] | 0;
  Dh = fe[6] | 0;
  Dl = fe[7] | 0;
  Eh = fe[8] | 0;
  El = fe[9] | 0;
  Fh = fe[10] | 0;
  Fl = fe[11] | 0;
  Gh = fe[12] | 0;
  Gl = fe[13] | 0;
  Hh = fe[14] | 0;
  Hl = fe[15] | 0;
  constructor() {
    super(64);
  }
}
const Ci = /* @__PURE__ */ ci(
  () => new ki(),
  /* @__PURE__ */ di(3)
);
const Zn = /* @__PURE__ */ BigInt(0), ks = /* @__PURE__ */ BigInt(1);
function Ur(e, r = "") {
  if (typeof e != "boolean") {
    const s = r && `"${r}" `;
    throw new Error(s + "expected boolean, got type=" + typeof e);
  }
  return e;
}
function Ei(e) {
  if (typeof e == "bigint") {
    if (!Lt(e))
      throw new Error("positive bigint expected, got " + e);
  } else
    Kr(e);
  return e;
}
function Xn(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  return e === "" ? Zn : BigInt("0x" + e);
}
function Si(e) {
  return Xn(Yr(e));
}
function Tt(e) {
  return Xn(Yr(Dr(me(e)).reverse()));
}
function Jn(e, r) {
  Kr(r), e = Ei(e);
  const s = Kn(e.toString(16).padStart(r * 2, "0"));
  if (s.length !== r)
    throw new Error("number too large");
  return s;
}
function xi(e, r) {
  return Jn(e, r).reverse();
}
function Dr(e) {
  return Uint8Array.from(e);
}
const Lt = (e) => typeof e == "bigint" && Zn <= e;
function _i(e, r, s) {
  return Lt(e) && Lt(r) && Lt(s) && r <= e && e < s;
}
function Cs(e, r, s, o) {
  if (!_i(r, s, o))
    throw new Error("expected valid " + e + ": " + s + " <= n < " + o + ", got " + r);
}
const Li = (e) => (ks << BigInt(e)) - ks;
function Zr(e, r = {}, s = {}) {
  if (!e || typeof e != "object")
    throw new Error("expected valid options object");
  function o(a, i, d) {
    const l = e[a];
    if (d && l === void 0)
      return;
    const h = typeof l;
    if (h !== i || l === null)
      throw new Error(`param "${a}" is invalid: expected ${i}, got ${h}`);
  }
  const n = (a, i) => Object.entries(a).forEach(([d, l]) => o(d, l, i));
  n(r, !1), n(s, !0);
}
function Es(e) {
  const r = /* @__PURE__ */ new WeakMap();
  return (s, ...o) => {
    const n = r.get(s);
    if (n !== void 0)
      return n;
    const a = e(s, ...o);
    return r.set(s, a), a;
  };
}
const ye = /* @__PURE__ */ BigInt(0), ge = /* @__PURE__ */ BigInt(1), $e = /* @__PURE__ */ BigInt(2), eo = /* @__PURE__ */ BigInt(3), to = /* @__PURE__ */ BigInt(4), ro = /* @__PURE__ */ BigInt(5), Pi = /* @__PURE__ */ BigInt(7), so = /* @__PURE__ */ BigInt(8), Ti = /* @__PURE__ */ BigInt(9), no = /* @__PURE__ */ BigInt(16);
function ue(e, r) {
  const s = e % r;
  return s >= ye ? s : r + s;
}
function Se(e, r, s) {
  let o = e;
  for (; r-- > ye; )
    o *= o, o %= s;
  return o;
}
function Ss(e, r) {
  if (e === ye)
    throw new Error("invert: expected non-zero number");
  if (r <= ye)
    throw new Error("invert: expected positive modulus, got " + r);
  let s = ue(e, r), o = r, n = ye, a = ge;
  for (; s !== ye; ) {
    const d = o / s, l = o % s, h = n - a * d;
    o = s, s = l, n = a, a = h;
  }
  if (o !== ge)
    throw new Error("invert: does not exist");
  return ue(n, r);
}
function Xr(e, r, s) {
  if (!e.eql(e.sqr(r), s))
    throw new Error("Cannot find square root");
}
function oo(e, r) {
  const s = (e.ORDER + ge) / to, o = e.pow(r, s);
  return Xr(e, o, r), o;
}
function Ri(e, r) {
  const s = (e.ORDER - ro) / so, o = e.mul(r, $e), n = e.pow(o, s), a = e.mul(r, n), i = e.mul(e.mul(a, $e), n), d = e.mul(a, e.sub(i, e.ONE));
  return Xr(e, d, r), d;
}
function Bi(e) {
  const r = Jr(e), s = ao(e), o = s(r, r.neg(r.ONE)), n = s(r, o), a = s(r, r.neg(o)), i = (e + Pi) / no;
  return (d, l) => {
    let h = d.pow(l, i), m = d.mul(h, o);
    const u = d.mul(h, n), p = d.mul(h, a), y = d.eql(d.sqr(m), l), w = d.eql(d.sqr(u), l);
    h = d.cmov(h, m, y), m = d.cmov(p, u, w);
    const g = d.eql(d.sqr(m), l), k = d.cmov(h, m, g);
    return Xr(d, k, l), k;
  };
}
function ao(e) {
  if (e < eo)
    throw new Error("sqrt is not defined for small field");
  let r = e - ge, s = 0;
  for (; r % $e === ye; )
    r /= $e, s++;
  let o = $e;
  const n = Jr(e);
  for (; xs(n, o) === 1; )
    if (o++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (s === 1)
    return oo;
  let a = n.pow(o, r);
  const i = (r + ge) / $e;
  return function(l, h) {
    if (l.is0(h))
      return h;
    if (xs(l, h) !== 1)
      throw new Error("Cannot find square root");
    let m = s, u = l.mul(l.ONE, a), p = l.pow(h, r), y = l.pow(h, i);
    for (; !l.eql(p, l.ONE); ) {
      if (l.is0(p))
        return l.ZERO;
      let w = 1, g = l.sqr(p);
      for (; !l.eql(g, l.ONE); )
        if (w++, g = l.sqr(g), w === m)
          throw new Error("Cannot find square root");
      const k = ge << BigInt(m - w - 1), A = l.pow(u, k);
      m = w, u = l.sqr(A), p = l.mul(p, u), y = l.mul(y, A);
    }
    return y;
  };
}
function Ii(e) {
  return e % to === eo ? oo : e % so === ro ? Ri : e % no === Ti ? Bi(e) : ao(e);
}
const Mi = (e, r) => (ue(e, r) & ge) === ge, Ui = [
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
function Di(e) {
  const r = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  }, s = Ui.reduce((o, n) => (o[n] = "function", o), r);
  return Zr(e, s), e;
}
function Fi(e, r, s) {
  if (s < ye)
    throw new Error("invalid exponent, negatives unsupported");
  if (s === ye)
    return e.ONE;
  if (s === ge)
    return r;
  let o = e.ONE, n = r;
  for (; s > ye; )
    s & ge && (o = e.mul(o, n)), n = e.sqr(n), s >>= ge;
  return o;
}
function io(e, r, s = !1) {
  const o = new Array(r.length).fill(s ? e.ZERO : void 0), n = r.reduce((i, d, l) => e.is0(d) ? i : (o[l] = i, e.mul(i, d)), e.ONE), a = e.inv(n);
  return r.reduceRight((i, d, l) => e.is0(d) ? i : (o[l] = e.mul(i, o[l]), e.mul(i, d)), a), o;
}
function xs(e, r) {
  const s = (e.ORDER - ge) / $e, o = e.pow(r, s), n = e.eql(o, e.ONE), a = e.eql(o, e.ZERO), i = e.eql(o, e.neg(e.ONE));
  if (!n && !a && !i)
    throw new Error("invalid Legendre symbol result");
  return n ? 1 : a ? 0 : -1;
}
function Oi(e, r) {
  r !== void 0 && Kr(r);
  const s = r !== void 0 ? r : e.toString(2).length, o = Math.ceil(s / 8);
  return { nBitLength: s, nByteLength: o };
}
class Wi {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = ye;
  ONE = ge;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(r, s = {}) {
    if (r <= ye)
      throw new Error("invalid field: expected ORDER > 0, got " + r);
    let o;
    this.isLE = !1, s != null && typeof s == "object" && (typeof s.BITS == "number" && (o = s.BITS), typeof s.sqrt == "function" && (this.sqrt = s.sqrt), typeof s.isLE == "boolean" && (this.isLE = s.isLE), s.allowedLengths && (this._lengths = s.allowedLengths?.slice()), typeof s.modFromBytes == "boolean" && (this._mod = s.modFromBytes));
    const { nBitLength: n, nByteLength: a } = Oi(r, o);
    if (a > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = r, this.BITS = n, this.BYTES = a, this._sqrt = void 0, Object.preventExtensions(this);
  }
  create(r) {
    return ue(r, this.ORDER);
  }
  isValid(r) {
    if (typeof r != "bigint")
      throw new Error("invalid field element: expected bigint, got " + typeof r);
    return ye <= r && r < this.ORDER;
  }
  is0(r) {
    return r === ye;
  }
  // is valid and invertible
  isValidNot0(r) {
    return !this.is0(r) && this.isValid(r);
  }
  isOdd(r) {
    return (r & ge) === ge;
  }
  neg(r) {
    return ue(-r, this.ORDER);
  }
  eql(r, s) {
    return r === s;
  }
  sqr(r) {
    return ue(r * r, this.ORDER);
  }
  add(r, s) {
    return ue(r + s, this.ORDER);
  }
  sub(r, s) {
    return ue(r - s, this.ORDER);
  }
  mul(r, s) {
    return ue(r * s, this.ORDER);
  }
  pow(r, s) {
    return Fi(this, r, s);
  }
  div(r, s) {
    return ue(r * Ss(s, this.ORDER), this.ORDER);
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
    return Ss(r, this.ORDER);
  }
  sqrt(r) {
    return this._sqrt || (this._sqrt = Ii(this.ORDER)), this._sqrt(this, r);
  }
  toBytes(r) {
    return this.isLE ? xi(r, this.BYTES) : Jn(r, this.BYTES);
  }
  fromBytes(r, s = !1) {
    me(r);
    const { _lengths: o, BYTES: n, isLE: a, ORDER: i, _mod: d } = this;
    if (o) {
      if (!o.includes(r.length) || r.length > n)
        throw new Error("Field.fromBytes: expected " + o + " bytes, got " + r.length);
      const h = new Uint8Array(n);
      h.set(r, a ? 0 : h.length - r.length), r = h;
    }
    if (r.length !== n)
      throw new Error("Field.fromBytes: expected " + n + " bytes, got " + r.length);
    let l = a ? Tt(r) : Si(r);
    if (d && (l = ue(l, i)), !s && !this.isValid(l))
      throw new Error("invalid field element: outside of range 0..ORDER");
    return l;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(r) {
    return io(this, r);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(r, s, o) {
    return o ? s : r;
  }
}
function Jr(e, r = {}) {
  return new Wi(e, r);
}
const Rt = /* @__PURE__ */ BigInt(0), Fr = /* @__PURE__ */ BigInt(1);
function _s(e, r) {
  const s = r.negate();
  return e ? s : r;
}
function Zt(e, r) {
  const s = io(e.Fp, r.map((o) => o.Z));
  return r.map((o, n) => e.fromAffine(o.toAffine(s[n])));
}
function co(e, r) {
  if (!Number.isSafeInteger(e) || e <= 0 || e > r)
    throw new Error("invalid window size, expected [1.." + r + "], got W=" + e);
}
function Xt(e, r) {
  co(e, r);
  const s = Math.ceil(r / e) + 1, o = 2 ** (e - 1), n = 2 ** e, a = Li(e), i = BigInt(e);
  return { windows: s, windowSize: o, mask: a, maxNumber: n, shiftBy: i };
}
function Ls(e, r, s) {
  const { windowSize: o, mask: n, maxNumber: a, shiftBy: i } = s;
  let d = Number(e & n), l = e >> i;
  d > o && (d -= a, l += Fr);
  const h = r * o, m = h + Math.abs(d) - 1, u = d === 0, p = d < 0, y = r % 2 !== 0;
  return { nextN: l, offset: m, isZero: u, isNeg: p, isNegF: y, offsetF: h };
}
const Jt = /* @__PURE__ */ new WeakMap(), lo = /* @__PURE__ */ new WeakMap();
function er(e) {
  return lo.get(e) || 1;
}
function Ps(e) {
  if (e !== Rt)
    throw new Error("invalid wNAF");
}
class qi {
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
    for (; s > Rt; )
      s & Fr && (o = o.add(n)), n = n.double(), s >>= Fr;
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
    const { windows: o, windowSize: n } = Xt(s, this.bits), a = [];
    let i = r, d = i;
    for (let l = 0; l < o; l++) {
      d = i, a.push(d);
      for (let h = 1; h < n; h++)
        d = d.add(i), a.push(d);
      i = d.double();
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
    const i = Xt(r, this.bits);
    for (let d = 0; d < i.windows; d++) {
      const { nextN: l, offset: h, isZero: m, isNeg: u, isNegF: p, offsetF: y } = Ls(o, d, i);
      o = l, m ? a = a.add(_s(p, s[y])) : n = n.add(_s(u, s[h]));
    }
    return Ps(o), { p: n, f: a };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(r, s, o, n = this.ZERO) {
    const a = Xt(r, this.bits);
    for (let i = 0; i < a.windows && o !== Rt; i++) {
      const { nextN: d, offset: l, isZero: h, isNeg: m } = Ls(o, i, a);
      if (o = d, !h) {
        const u = s[l];
        n = n.add(m ? u.negate() : u);
      }
    }
    return Ps(o), n;
  }
  getPrecomputes(r, s, o) {
    let n = Jt.get(s);
    return n || (n = this.precomputeWindow(s, r), r !== 1 && (typeof o == "function" && (n = o(n)), Jt.set(s, n))), n;
  }
  cached(r, s, o) {
    const n = er(r);
    return this.wNAF(n, this.getPrecomputes(n, r, o), s);
  }
  unsafe(r, s, o, n) {
    const a = er(r);
    return a === 1 ? this._unsafeLadder(r, s, n) : this.wNAFUnsafe(a, this.getPrecomputes(a, r, o), s, n);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(r, s) {
    co(s, this.bits), lo.set(r, s), Jt.delete(r);
  }
  hasCache(r) {
    return er(r) !== 1;
  }
}
function Ts(e, r, s) {
  if (r) {
    if (r.ORDER !== e)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return Di(r), r;
  } else
    return Jr(e, { isLE: s });
}
function zi(e, r, s = {}, o) {
  if (o === void 0 && (o = e === "edwards"), !r || typeof r != "object")
    throw new Error(`expected valid ${e} CURVE object`);
  for (const l of ["p", "n", "h"]) {
    const h = r[l];
    if (!(typeof h == "bigint" && h > Rt))
      throw new Error(`CURVE.${l} must be positive bigint`);
  }
  const n = Ts(r.p, s.Fp, o), a = Ts(r.n, s.Fn, o), d = ["Gx", "Gy", "a", "d"];
  for (const l of d)
    if (!n.isValid(r[l]))
      throw new Error(`CURVE.${l} must be valid field element of CURVE.Fp`);
  return r = Object.freeze(Object.assign({}, r)), { CURVE: r, Fp: n, Fn: a };
}
function ji(e, r) {
  return function(o) {
    const n = e(o);
    return { secretKey: n, publicKey: r(n) };
  };
}
const Ue = BigInt(0), he = BigInt(1), tr = BigInt(2), $i = BigInt(8);
function Vi(e, r, s, o) {
  const n = e.sqr(s), a = e.sqr(o), i = e.add(e.mul(r.a, n), a), d = e.add(e.ONE, e.mul(r.d, e.mul(n, a)));
  return e.eql(i, d);
}
function Hi(e, r = {}) {
  const s = zi("edwards", e, r, r.FpFnLE), { Fp: o, Fn: n } = s;
  let a = s.CURVE;
  const { h: i } = a;
  Zr(r, {}, { uvRatio: "function" });
  const d = tr << BigInt(n.BYTES * 8) - he, l = (k) => o.create(k), h = r.uvRatio || ((k, A) => {
    try {
      return { isValid: !0, value: o.sqrt(o.div(k, A)) };
    } catch {
      return { isValid: !1, value: Ue };
    }
  });
  if (!Vi(o, a, a.Gx, a.Gy))
    throw new Error("bad curve params: generator point");
  function m(k, A, C = !1) {
    const E = C ? he : Ue;
    return Cs("coordinate " + k, A, E, d), A;
  }
  function u(k) {
    if (!(k instanceof w))
      throw new Error("EdwardsPoint expected");
  }
  const p = Es((k, A) => {
    const { X: C, Y: E, Z: x } = k, L = k.is0();
    A == null && (A = L ? $i : o.inv(x));
    const f = l(C * A), b = l(E * A), v = o.mul(x, A);
    if (L)
      return { x: Ue, y: he };
    if (v !== he)
      throw new Error("invZ was invalid");
    return { x: f, y: b };
  }), y = Es((k) => {
    const { a: A, d: C } = a;
    if (k.is0())
      throw new Error("bad point: ZERO");
    const { X: E, Y: x, Z: L, T: f } = k, b = l(E * E), v = l(x * x), N = l(L * L), T = l(N * N), _ = l(b * A), B = l(N * l(_ + v)), R = l(T + l(C * l(b * v)));
    if (B !== R)
      throw new Error("bad point: equation left != right (1)");
    const I = l(E * x), M = l(L * f);
    if (I !== M)
      throw new Error("bad point: equation left != right (2)");
    return !0;
  });
  class w {
    // base / generator point
    static BASE = new w(a.Gx, a.Gy, he, l(a.Gx * a.Gy));
    // zero / infinity / identity point
    static ZERO = new w(Ue, he, he, Ue);
    // 0, 1, 1, 0
    // math field
    static Fp = o;
    // scalar field
    static Fn = n;
    X;
    Y;
    Z;
    T;
    constructor(A, C, E, x) {
      this.X = m("x", A), this.Y = m("y", C), this.Z = m("z", E, !0), this.T = m("t", x), Object.freeze(this);
    }
    static CURVE() {
      return a;
    }
    static fromAffine(A) {
      if (A instanceof w)
        throw new Error("extended point not allowed");
      const { x: C, y: E } = A || {};
      return m("x", C), m("y", E), new w(C, E, he, l(C * E));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(A, C = !1) {
      const E = o.BYTES, { a: x, d: L } = a;
      A = Dr(me(A, E, "point")), Ur(C, "zip215");
      const f = Dr(A), b = A[E - 1];
      f[E - 1] = b & -129;
      const v = Tt(f), N = C ? d : o.ORDER;
      Cs("point.y", v, Ue, N);
      const T = l(v * v), _ = l(T - he), B = l(L * T - x);
      let { isValid: R, value: I } = h(_, B);
      if (!R)
        throw new Error("bad point: invalid y coordinate");
      const M = (I & he) === he, U = (b & 128) !== 0;
      if (!C && I === Ue && U)
        throw new Error("bad point: x=0 and x_0=1");
      return U !== M && (I = l(-I)), w.fromAffine({ x: I, y: v });
    }
    static fromHex(A, C = !1) {
      return w.fromBytes(Kn(A), C);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(A = 8, C = !0) {
      return g.createCache(this, A), C || this.multiply(tr), this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      y(this);
    }
    // Compare one point to another.
    equals(A) {
      u(A);
      const { X: C, Y: E, Z: x } = this, { X: L, Y: f, Z: b } = A, v = l(C * b), N = l(L * x), T = l(E * b), _ = l(f * x);
      return v === N && T === _;
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
      const { a: A } = a, { X: C, Y: E, Z: x } = this, L = l(C * C), f = l(E * E), b = l(tr * l(x * x)), v = l(A * L), N = C + E, T = l(l(N * N) - L - f), _ = v + f, B = _ - b, R = v - f, I = l(T * B), M = l(_ * R), U = l(T * R), W = l(B * _);
      return new w(I, M, W, U);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(A) {
      u(A);
      const { a: C, d: E } = a, { X: x, Y: L, Z: f, T: b } = this, { X: v, Y: N, Z: T, T: _ } = A, B = l(x * v), R = l(L * N), I = l(b * E * _), M = l(f * T), U = l((x + L) * (v + N) - B - R), W = M - I, z = M + I, $ = l(R - C * B), D = l(U * W), O = l(z * $), H = l(U * $), ee = l(W * z);
      return new w(D, O, ee, H);
    }
    subtract(A) {
      return this.add(A.negate());
    }
    // Constant-time multiplication.
    multiply(A) {
      if (!n.isValidNot0(A))
        throw new Error("invalid scalar: expected 1 <= sc < curve.n");
      const { p: C, f: E } = g.cached(this, A, (x) => Zt(w, x));
      return Zt(w, [C, E])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Does NOT allow scalars higher than CURVE.n.
    // Accepts optional accumulator to merge with multiply (important for sparse scalars)
    multiplyUnsafe(A, C = w.ZERO) {
      if (!n.isValid(A))
        throw new Error("invalid scalar: expected 0 <= sc < curve.n");
      return A === Ue ? w.ZERO : this.is0() || A === he ? this : g.unsafe(this, A, (E) => Zt(w, E), C);
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
      return i === he ? this : this.multiplyUnsafe(i);
    }
    toBytes() {
      const { x: A, y: C } = this.toAffine(), E = o.toBytes(C);
      return E[E.length - 1] |= A & he ? 128 : 0, E;
    }
    toHex() {
      return Yr(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const g = new qi(w, n.BITS);
  return w.BASE.precompute(8), w;
}
function Qi(e, r, s = {}) {
  if (typeof r != "function")
    throw new Error('"hash" function param is required');
  Zr(s, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    mapToCurve: "function"
  });
  const { prehash: o } = s, { BASE: n, Fp: a, Fn: i } = e, d = s.randomBytes || li, l = s.adjustScalarBytes || ((v) => v), h = s.domain || ((v, N, T) => {
    if (Ur(T, "phflag"), N.length || T)
      throw new Error("Contexts/pre-hash are not supported");
    return v;
  });
  function m(v) {
    return i.create(Tt(v));
  }
  function u(v) {
    const N = E.secretKey;
    me(v, E.secretKey, "secretKey");
    const T = me(r(v), 2 * N, "hashedSecretKey"), _ = l(T.slice(0, N)), B = T.slice(N, 2 * N), R = m(_);
    return { head: _, prefix: B, scalar: R };
  }
  function p(v) {
    const { head: N, prefix: T, scalar: _ } = u(v), B = n.multiply(_), R = B.toBytes();
    return { head: N, prefix: T, scalar: _, point: B, pointBytes: R };
  }
  function y(v) {
    return p(v).pointBytes;
  }
  function w(v = Uint8Array.of(), ...N) {
    const T = bs(...N);
    return m(r(h(T, me(v, void 0, "context"), !!o)));
  }
  function g(v, N, T = {}) {
    v = me(v, void 0, "message"), o && (v = o(v));
    const { prefix: _, scalar: B, pointBytes: R } = p(N), I = w(T.context, _, v), M = n.multiply(I).toBytes(), U = w(T.context, M, R, v), W = i.create(I + U * B);
    if (!i.isValid(W))
      throw new Error("sign failed: invalid s");
    const z = bs(M, i.toBytes(W));
    return me(z, E.signature, "result");
  }
  const k = { zip215: !0 };
  function A(v, N, T, _ = k) {
    const { context: B, zip215: R } = _, I = E.signature;
    v = me(v, I, "signature"), N = me(N, void 0, "message"), T = me(T, E.publicKey, "publicKey"), R !== void 0 && Ur(R, "zip215"), o && (N = o(N));
    const M = I / 2, U = v.subarray(0, M), W = Tt(v.subarray(M, I));
    let z, $, D;
    try {
      z = e.fromBytes(T, R), $ = e.fromBytes(U, R), D = n.multiplyUnsafe(W);
    } catch {
      return !1;
    }
    if (!R && z.isSmallOrder())
      return !1;
    const O = w(B, $.toBytes(), z.toBytes(), N);
    return $.add(z.multiplyUnsafe(O)).subtract(D).clearCofactor().is0();
  }
  const C = a.BYTES, E = {
    secretKey: C,
    publicKey: C,
    signature: 2 * C,
    seed: C
  };
  function x(v = d(E.seed)) {
    return me(v, E.seed, "seed");
  }
  function L(v) {
    return Qn(v) && v.length === i.BYTES;
  }
  function f(v, N) {
    try {
      return !!e.fromBytes(v, N);
    } catch {
      return !1;
    }
  }
  const b = {
    getExtendedPublicKey: p,
    randomSecretKey: x,
    isValidSecretKey: L,
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
      const { y: N } = e.fromBytes(v), T = E.publicKey, _ = T === 32;
      if (!_ && T !== 57)
        throw new Error("only defined for 25519 and 448");
      const B = _ ? a.div(he + N, he - N) : a.div(N - he, N + he);
      return a.toBytes(B);
    },
    toMontgomerySecret(v) {
      const N = E.secretKey;
      me(v, N);
      const T = r(v.subarray(0, N));
      return l(T).subarray(0, N);
    }
  };
  return Object.freeze({
    keygen: ji(x, y),
    getPublicKey: y,
    sign: g,
    verify: A,
    utils: b,
    Point: e,
    lengths: E
  });
}
const Gi = BigInt(1), Rs = BigInt(2), Ki = BigInt(5), Yi = BigInt(8), es = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"), Zi = {
  p: es,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: Yi,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
};
function Xi(e) {
  const r = BigInt(10), s = BigInt(20), o = BigInt(40), n = BigInt(80), a = es, d = e * e % a * e % a, l = Se(d, Rs, a) * d % a, h = Se(l, Gi, a) * e % a, m = Se(h, Ki, a) * h % a, u = Se(m, r, a) * m % a, p = Se(u, s, a) * u % a, y = Se(p, o, a) * p % a, w = Se(y, n, a) * y % a, g = Se(w, n, a) * y % a, k = Se(g, r, a) * m % a;
  return { pow_p_5_8: Se(k, Rs, a) * e % a, b2: d };
}
function Ji(e) {
  return e[0] &= 248, e[31] &= 127, e[31] |= 64, e;
}
const Bs = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function ec(e, r) {
  const s = es, o = ue(r * r * r, s), n = ue(o * o * r, s), a = Xi(e * n).pow_p_5_8;
  let i = ue(e * o * a, s);
  const d = ue(r * i * i, s), l = i, h = ue(i * Bs, s), m = d === e, u = d === ue(-e, s), p = d === ue(-e * Bs, s);
  return m && (i = l), (u || p) && (i = h), Mi(i, s) && (i = ue(-i, s)), { isValid: m || u, value: i };
}
const tc = /* @__PURE__ */ Hi(Zi, { uvRatio: ec });
function rc(e) {
  return Qi(tc, Ci, Object.assign({ adjustScalarBytes: Ji }, e));
}
const sc = /* @__PURE__ */ rc({});
function nc(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function jt(e, ...r) {
  if (!nc(e))
    throw new Error("Uint8Array expected");
  if (r.length > 0 && !r.includes(e.length))
    throw new Error("Uint8Array expected of length " + r + ", got length=" + e.length);
}
function Is(e, r = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (r && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function oc(e, r) {
  jt(e);
  const s = r.outputLen;
  if (e.length < s)
    throw new Error("digestInto() expects output buffer of length at least " + s);
}
function Or(...e) {
  for (let r = 0; r < e.length; r++)
    e[r].fill(0);
}
function rr(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function xe(e, r) {
  return e << 32 - r | e >>> r;
}
function ac(e) {
  if (typeof e != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(e));
}
function uo(e) {
  return typeof e == "string" && (e = ac(e)), jt(e), e;
}
class ic {
}
function cc(e) {
  const r = (o) => e().update(uo(o)).digest(), s = e();
  return r.outputLen = s.outputLen, r.blockLen = s.blockLen, r.create = () => e(), r;
}
function lc(e, r, s, o) {
  if (typeof e.setBigUint64 == "function")
    return e.setBigUint64(r, s, o);
  const n = BigInt(32), a = BigInt(4294967295), i = Number(s >> n & a), d = Number(s & a), l = o ? 4 : 0, h = o ? 0 : 4;
  e.setUint32(r + l, i, o), e.setUint32(r + h, d, o);
}
function dc(e, r, s) {
  return e & r ^ ~e & s;
}
function uc(e, r, s) {
  return e & r ^ e & s ^ r & s;
}
class hc extends ic {
  constructor(r, s, o, n) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = r, this.outputLen = s, this.padOffset = o, this.isLE = n, this.buffer = new Uint8Array(r), this.view = rr(this.buffer);
  }
  update(r) {
    Is(this), r = uo(r), jt(r);
    const { view: s, buffer: o, blockLen: n } = this, a = r.length;
    for (let i = 0; i < a; ) {
      const d = Math.min(n - this.pos, a - i);
      if (d === n) {
        const l = rr(r);
        for (; n <= a - i; i += n)
          this.process(l, i);
        continue;
      }
      o.set(r.subarray(i, i + d), this.pos), this.pos += d, i += d, this.pos === n && (this.process(s, 0), this.pos = 0);
    }
    return this.length += r.length, this.roundClean(), this;
  }
  digestInto(r) {
    Is(this), oc(r, this), this.finished = !0;
    const { buffer: s, view: o, blockLen: n, isLE: a } = this;
    let { pos: i } = this;
    s[i++] = 128, Or(this.buffer.subarray(i)), this.padOffset > n - i && (this.process(o, 0), i = 0);
    for (let u = i; u < n; u++)
      s[u] = 0;
    lc(o, n - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const d = rr(r), l = this.outputLen;
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
    const { blockLen: s, buffer: o, length: n, finished: a, destroyed: i, pos: d } = this;
    return r.destroyed = i, r.finished = a, r.length = n, r.pos = d, n % s && r.buffer.set(o), r;
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
]), mc = /* @__PURE__ */ Uint32Array.from([
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
class fc extends hc {
  constructor(r = 32) {
    super(64, r, 8, !1), this.A = De[0] | 0, this.B = De[1] | 0, this.C = De[2] | 0, this.D = De[3] | 0, this.E = De[4] | 0, this.F = De[5] | 0, this.G = De[6] | 0, this.H = De[7] | 0;
  }
  get() {
    const { A: r, B: s, C: o, D: n, E: a, F: i, G: d, H: l } = this;
    return [r, s, o, n, a, i, d, l];
  }
  // prettier-ignore
  set(r, s, o, n, a, i, d, l) {
    this.A = r | 0, this.B = s | 0, this.C = o | 0, this.D = n | 0, this.E = a | 0, this.F = i | 0, this.G = d | 0, this.H = l | 0;
  }
  process(r, s) {
    for (let u = 0; u < 16; u++, s += 4)
      Fe[u] = r.getUint32(s, !1);
    for (let u = 16; u < 64; u++) {
      const p = Fe[u - 15], y = Fe[u - 2], w = xe(p, 7) ^ xe(p, 18) ^ p >>> 3, g = xe(y, 17) ^ xe(y, 19) ^ y >>> 10;
      Fe[u] = g + Fe[u - 7] + w + Fe[u - 16] | 0;
    }
    let { A: o, B: n, C: a, D: i, E: d, F: l, G: h, H: m } = this;
    for (let u = 0; u < 64; u++) {
      const p = xe(d, 6) ^ xe(d, 11) ^ xe(d, 25), y = m + p + dc(d, l, h) + mc[u] + Fe[u] | 0, g = (xe(o, 2) ^ xe(o, 13) ^ xe(o, 22)) + uc(o, n, a) | 0;
      m = h, h = l, l = d, d = i + y | 0, i = a, a = n, n = o, o = y + g | 0;
    }
    o = o + this.A | 0, n = n + this.B | 0, a = a + this.C | 0, i = i + this.D | 0, d = d + this.E | 0, l = l + this.F | 0, h = h + this.G | 0, m = m + this.H | 0, this.set(o, n, a, i, d, l, h, m);
  }
  roundClean() {
    Or(Fe);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), Or(this.buffer);
  }
}
const ho = /* @__PURE__ */ cc(() => new fc()), pc = ho, gc = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function wc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const r = pc(e), s = sc.getPublicKey(r), o = new Uint8Array(64);
  return o.set(r, 0), o.set(s, 32), Cn(r), { publicKey: s, secretKey: o };
}
function mo(e) {
  const r = wc(e), s = r.publicKey;
  return Cn(r.secretKey), s;
}
function fo(e) {
  if (e.length !== 32)
    throw new Error(`Invalid public key length: expected 32, got ${e.length}`);
  return yc(e);
}
function yc(e) {
  let r = 0;
  for (let n = 0; n < e.length && e[n] === 0; n++)
    r++;
  let s = 0n;
  for (let n = 0; n < e.length; n++)
    s = s * 256n + BigInt(e[n]);
  let o = "";
  for (; s > 0n; ) {
    const n = Number(s % 58n);
    o = gc[n] + o, s = s / 58n;
  }
  return "1".repeat(r) + o;
}
const bc = 2, vc = 3;
function po(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const r = Wr(e), s = Hn.share(r, vc, bc);
  if (s.length !== 3)
    throw new Error(`Unexpected share count: ${s.length}`);
  const o = sr(s[0]), n = sr(s[1]), a = sr(s[2]);
  return {
    shareA: Ve(o),
    shareB: Ve(n),
    shareC: Ve(a)
  };
}
function Ac(e, r, s) {
  const o = Ms(e), n = Ms(r);
  try {
    const a = Hn.combine([o, n]), i = go(a);
    if (i.length !== 16)
      throw new Error(`Reconstructed seed has wrong length: ${i.length}`);
    return En(i);
  } catch (a) {
    throw a instanceof Error && a.message.startsWith("Reconstructed seed") || a instanceof Error && a.message.startsWith("Invalid expectedPublicKey") || a instanceof Error && a.message.startsWith("Reconstructed seed does not match") ? a : new Error("Failed to reconstruct seed from shares");
  }
}
function Wr(e) {
  return Array.from(e).map((r) => r.toString(16).padStart(2, "0")).join("");
}
function go(e) {
  if (!/^[0-9a-fA-F]*$/.test(e))
    throw new Error("Invalid hex string: contains non-hex characters");
  if (e.length % 2 !== 0)
    throw new Error(`Invalid hex string: length ${e.length} is odd (must be even)`);
  const r = new Uint8Array(e.length / 2);
  for (let s = 0; s < r.length; s++)
    r[s] = parseInt(e.substr(s * 2, 2), 16);
  return r;
}
function sr(e) {
  const r = e.length % 2 !== 0, s = r ? "0" + e : e, o = go(s), n = new Uint8Array(1 + o.length);
  return n[0] = r ? 1 : 0, n.set(o, 1), n;
}
function Ms(e) {
  const r = e[0];
  if (r === 0 || r === 1) {
    const o = r === 1, n = e.subarray(1), a = Wr(n), i = o ? a.substring(1) : a;
    if (/^[0-9a-f]/.test(i))
      return i;
  }
  const s = Wr(e);
  return s.startsWith("0") && !s.startsWith("00") ? s.substring(1) : s;
}
function Bt(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function wo(e, r) {
  return Array.isArray(r) ? r.length === 0 ? !0 : e ? r.every((s) => typeof s == "string") : r.every((s) => Number.isSafeInteger(s)) : !1;
}
function Nc(e) {
  if (typeof e != "function")
    throw new Error("function expected");
  return !0;
}
function It(e, r) {
  if (typeof r != "string")
    throw new Error(`${e}: string expected`);
  return !0;
}
function ot(e) {
  if (!Number.isSafeInteger(e))
    throw new Error(`invalid integer: ${e}`);
}
function Mt(e) {
  if (!Array.isArray(e))
    throw new Error("array expected");
}
function Ut(e, r) {
  if (!wo(!0, r))
    throw new Error(`${e}: array of strings expected`);
}
function yo(e, r) {
  if (!wo(!1, r))
    throw new Error(`${e}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function kc(...e) {
  const r = (a) => a, s = (a, i) => (d) => a(i(d)), o = e.map((a) => a.encode).reduceRight(s, r), n = e.map((a) => a.decode).reduce(s, r);
  return { encode: o, decode: n };
}
// @__NO_SIDE_EFFECTS__
function Cc(e) {
  const r = typeof e == "string" ? e.split("") : e, s = r.length;
  Ut("alphabet", r);
  const o = new Map(r.map((n, a) => [n, a]));
  return {
    encode: (n) => (Mt(n), n.map((a) => {
      if (!Number.isSafeInteger(a) || a < 0 || a >= s)
        throw new Error(`alphabet.encode: digit index outside alphabet "${a}". Allowed: ${e}`);
      return r[a];
    })),
    decode: (n) => (Mt(n), n.map((a) => {
      It("alphabet.decode", a);
      const i = o.get(a);
      if (i === void 0)
        throw new Error(`Unknown letter: "${a}". Allowed: ${e}`);
      return i;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function Ec(e = "") {
  return It("join", e), {
    encode: (r) => (Ut("join.decode", r), r.join(e)),
    decode: (r) => (It("join.decode", r), r.split(e))
  };
}
// @__NO_SIDE_EFFECTS__
function Sc(e, r = "=") {
  return ot(e), It("padding", r), {
    encode(s) {
      for (Ut("padding.encode", s); s.length * e % 8; )
        s.push(r);
      return s;
    },
    decode(s) {
      Ut("padding.decode", s);
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
function qr(e, r, s) {
  if (r < 2)
    throw new Error(`convertRadix: invalid from=${r}, base cannot be less than 2`);
  if (s < 2)
    throw new Error(`convertRadix: invalid to=${s}, base cannot be less than 2`);
  if (Mt(e), !e.length)
    return [];
  let o = 0;
  const n = [], a = Array.from(e, (d) => {
    if (ot(d), d < 0 || d >= r)
      throw new Error(`invalid integer: ${d}`);
    return d;
  }), i = a.length;
  for (; ; ) {
    let d = 0, l = !0;
    for (let h = o; h < i; h++) {
      const m = a[h], u = r * d, p = u + m;
      if (!Number.isSafeInteger(p) || u / r !== d || p - m !== u)
        throw new Error("convertRadix: carry overflow");
      const y = p / s;
      d = p % s;
      const w = Math.floor(y);
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
const bo = (e, r) => r === 0 ? e : bo(r, e % r), Dt = /* @__NO_SIDE_EFFECTS__ */ (e, r) => e + (r - bo(e, r)), nr = /* @__PURE__ */ (() => {
  let e = [];
  for (let r = 0; r < 40; r++)
    e.push(2 ** r);
  return e;
})();
function zr(e, r, s, o) {
  if (Mt(e), r <= 0 || r > 32)
    throw new Error(`convertRadix2: wrong from=${r}`);
  if (s <= 0 || s > 32)
    throw new Error(`convertRadix2: wrong to=${s}`);
  if (/* @__PURE__ */ Dt(r, s) > 32)
    throw new Error(`convertRadix2: carry overflow from=${r} to=${s} carryBits=${/* @__PURE__ */ Dt(r, s)}`);
  let n = 0, a = 0;
  const i = nr[r], d = nr[s] - 1, l = [];
  for (const h of e) {
    if (ot(h), h >= i)
      throw new Error(`convertRadix2: invalid data word=${h} from=${r}`);
    if (n = n << r | h, a + r > 32)
      throw new Error(`convertRadix2: carry overflow pos=${a} from=${r}`);
    for (a += r; a >= s; a -= s)
      l.push((n >> a - s & d) >>> 0);
    const m = nr[a];
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
function xc(e) {
  ot(e);
  const r = 2 ** 8;
  return {
    encode: (s) => {
      if (!Bt(s))
        throw new Error("radix.encode input should be Uint8Array");
      return qr(Array.from(s), r, e);
    },
    decode: (s) => (yo("radix.decode", s), Uint8Array.from(qr(s, e, r)))
  };
}
// @__NO_SIDE_EFFECTS__
function _c(e, r = !1) {
  if (ot(e), e <= 0 || e > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Dt(8, e) > 32 || /* @__PURE__ */ Dt(e, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (s) => {
      if (!Bt(s))
        throw new Error("radix2.encode input should be Uint8Array");
      return zr(Array.from(s), 8, e, !r);
    },
    decode: (s) => (yo("radix2.decode", s), Uint8Array.from(zr(s, e, 8, r)))
  };
}
function Lc(e, r) {
  return ot(e), Nc(r), {
    encode(s) {
      if (!Bt(s))
        throw new Error("checksum.encode: input should be Uint8Array");
      const o = r(s).slice(0, e), n = new Uint8Array(s.length + e);
      return n.set(s), n.set(o, s.length), n;
    },
    decode(s) {
      if (!Bt(s))
        throw new Error("checksum.decode: input should be Uint8Array");
      const o = s.slice(0, -e), n = s.slice(-e), a = r(o).slice(0, e);
      for (let i = 0; i < e; i++)
        if (a[i] !== n[i])
          throw new Error("Invalid checksum");
      return o;
    }
  };
}
const vt = {
  alphabet: Cc,
  chain: kc,
  checksum: Lc,
  convertRadix: qr,
  convertRadix2: zr,
  radix: xc,
  radix2: _c,
  join: Ec,
  padding: Sc
};
const Pc = (e) => e[0] === "あいこくしん";
function Tc(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function Rc(e) {
  const r = Tc(e), s = r.split(" ");
  if (![12, 15, 18, 21, 24].includes(s.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: r, words: s };
}
function vo(e) {
  jt(e, 16, 20, 24, 28, 32);
}
const Bc = (e) => {
  const r = 8 - e.length / 4;
  return new Uint8Array([ho(e)[0] >> r << r]);
};
function Ao(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((r) => {
    if (typeof r != "string")
      throw new Error("wordlist: non-string element: " + r);
  }), vt.chain(vt.checksum(1, Bc), vt.radix2(11, !0), vt.alphabet(e));
}
function ts(e, r) {
  const { words: s } = Rc(e), o = Ao(r).decode(s);
  return vo(o), o;
}
function No(e, r) {
  return vo(e), Ao(r).encode(e).join(Pc(r) ? "　" : " ");
}
function rs(e, r) {
  try {
    ts(e, r);
  } catch {
    return !1;
  }
  return !0;
}
const Re = `abandon
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
function Ic(e) {
  if (e.length !== 16)
    throw new Error(`Invalid share length: expected 16, got ${e.length}`);
  const s = No(e, Re).split(" ");
  if (s.length !== be)
    throw new Error(`Unexpected word count: expected ${be}, got ${s.length}`);
  return s;
}
function Mc(e) {
  if (e.length !== be)
    throw new Error(`Invalid word count: expected ${be}, got ${e.length}`);
  const r = e.join(" ").toLowerCase().trim();
  if (!rs(r, Re))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const s = ts(r, Re);
  if (s.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${s.length}`);
  return Ve(s);
}
function Uc(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const s = No(e, Re).split(" ");
  if (s.length !== be)
    throw new Error(`Unexpected word count: expected ${be}, got ${s.length}`);
  return s;
}
function Dc(e) {
  if (e.length !== be)
    throw new Error(`Invalid word count: expected ${be}, got ${e.length}`);
  const r = e.join(" ").toLowerCase().trim();
  if (!rs(r, Re))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const s = ts(r, Re);
  if (s.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${s.length}`);
  return En(s);
}
function ko(e) {
  if (e.length !== be)
    return !1;
  const r = e.join(" ").toLowerCase().trim();
  return rs(r, Re);
}
function At(e) {
  return Re.includes(e.toLowerCase().trim());
}
function Fc(e, r = 5) {
  const s = e.toLowerCase().trim();
  return s.length === 0 ? [] : Re.filter((o) => o.startsWith(s)).slice(0, r);
}
function Oc(e) {
  const r = [];
  for (let s = 0; s < e.length; s += 4)
    r.push(e.slice(s, s + 4));
  return r;
}
function Wc(e) {
  return e.toLowerCase().replace(/[,\n\r\t]+/g, " ").split(/\s+/).map((r) => r.trim()).filter((r) => r.length > 0);
}
function Yh({
  className: e = "",
  variant: r = "default",
  size: s = "md",
  children: o,
  menuItems: n = [],
  hideSignOut: a = !1
}) {
  const { user: i, isAuthenticated: d, isLoading: l, openLoginModal: h, logout: m } = Wt(), [u, p] = S(!1), [y, w] = S(-1), g = se(null), k = se(null), A = q(
    () => [...n, ...a ? [] : [{ label: "Sign out", onClick: m }]],
    [n, a, m]
  );
  F(() => {
    if (!u) return;
    const f = (v) => {
      g.current && !g.current.contains(v.target) && (p(!1), w(-1));
    }, b = (v) => {
      v.key === "Escape" && (p(!1), w(-1), k.current?.focus());
    };
    return document.addEventListener("mousedown", f), document.addEventListener("keydown", b), () => {
      document.removeEventListener("mousedown", f), document.removeEventListener("keydown", b);
    };
  }, [u]);
  const C = P(
    (f) => {
      if (!(!u || A.length === 0))
        switch (f.key) {
          case "ArrowDown":
            f.preventDefault(), w((b) => (b + 1) % A.length);
            break;
          case "ArrowUp":
            f.preventDefault(), w((b) => (b - 1 + A.length) % A.length);
            break;
          case "Home":
            f.preventDefault(), w(0);
            break;
          case "End":
            f.preventDefault(), w(A.length - 1);
            break;
          case "Enter":
          case " ":
            y >= 0 && (f.preventDefault(), A[y].onClick(), p(!1), w(-1));
            break;
        }
    },
    [u, y, A]
  ), E = P(() => {
    A.length !== 0 && (p((f) => !f), w(-1));
  }, [A.length]), x = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, L = {
    default: "cedros-button-primary",
    outline: "cedros-button-outline",
    ghost: "cedros-button-ghost"
  };
  if (l)
    return /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: `cedros-button ${L[r]} ${x[s]} ${e}`,
        disabled: !0,
        children: /* @__PURE__ */ t(Z, { size: "sm" })
      }
    );
  if (d && i) {
    const f = i.name || i.email || "User", b = Mn(i.picture);
    return (
      // L-08: Added keyboard handler and ref for accessibility
      /* @__PURE__ */ c("div", { className: "cedros-user-menu", ref: g, onKeyDown: C, children: [
        /* @__PURE__ */ c(
          "button",
          {
            ref: k,
            type: "button",
            className: `cedros-button cedros-user-button ${x[s]} ${e}`,
            "aria-haspopup": "menu",
            "aria-expanded": u,
            "aria-label": `User menu for ${f}`,
            onClick: E,
            children: [
              b ? /* @__PURE__ */ t(
                "img",
                {
                  src: b,
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
        u && /* @__PURE__ */ c("div", { className: "cedros-dropdown cedros-dropdown-open", role: "menu", children: [
          n.map((v, N) => /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item ${y === N ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: y === N ? 0 : -1,
              onClick: () => {
                v.onClick(), p(!1);
              },
              children: [
                v.icon && /* @__PURE__ */ t("span", { className: "cedros-dropdown-icon", children: v.icon }),
                v.label
              ]
            },
            N
          )),
          n.length > 0 && !a && /* @__PURE__ */ t("div", { className: "cedros-dropdown-divider", role: "separator" }),
          !a && /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item cedros-dropdown-item-danger ${y === n.length ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: y === n.length ? 0 : -1,
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
      className: `cedros-button ${L[r]} ${x[s]} ${e}`,
      onClick: h,
      children: o || "Sign in"
    }
  );
}
function ss() {
  const { config: e } = J(), [r, s] = S(!1), [o, n] = S(!1), [a, i] = S(null), d = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: l, getRemainingAttempts: h } = Un({
    maxAttempts: 3,
    windowMs: 3e5
  }), m = P(
    async (w) => {
      if (!Fn(w)) {
        const g = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw i(g), g;
      }
      try {
        l();
      } catch (g) {
        const k = {
          code: "RATE_LIMITED",
          message: g instanceof Error ? g.message : "Too many attempts"
        };
        throw i(k), k;
      }
      s(!0), i(null), n(!1);
      try {
        await d.post("/forgot-password", { email: w }), n(!0);
      } catch (g) {
        const k = j(g, "Unable to send the reset email. Please try again.");
        throw i(k), k;
      } finally {
        s(!1);
      }
    },
    [d, l]
  ), u = P(
    async (w, g) => {
      s(!0), i(null), n(!1);
      try {
        await d.post("/reset-password", { token: w, newPassword: g }), n(!0);
      } catch (k) {
        const A = j(k, "Unable to reset your password. Please try again.");
        throw i(A), A;
      } finally {
        s(!1);
      }
    },
    [d]
  ), p = P(() => i(null), []), y = P(() => {
    i(null), n(!1), s(!1);
  }, []);
  return {
    forgotPassword: m,
    resetPassword: u,
    isLoading: r,
    isSuccess: o,
    error: a,
    clearError: p,
    reset: y,
    remainingAttempts: h()
  };
}
function qc(e) {
  return typeof e == "object" && e !== null && "mfaRequired" in e && e.mfaRequired === !0;
}
function zc() {
  const { config: e, _internal: r } = J(), [s, o] = S(!1), [n, a] = S(!1), [i, d] = S(null), l = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), { checkLimit: h, getRemainingAttempts: m } = Un({
    maxAttempts: 3,
    windowMs: 3e5
  }), u = P(
    async (g) => {
      if (!Fn(g)) {
        const k = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw d(k), k;
      }
      try {
        h();
      } catch (k) {
        const A = {
          code: "RATE_LIMITED",
          message: k instanceof Error ? k.message : "Too many attempts"
        };
        throw d(A), A;
      }
      o(!0), d(null), a(!1);
      try {
        await l.post("/instant-link", {
          email: g,
          referral: r?.getReferralCode?.() ?? void 0
        }), a(!0);
      } catch (k) {
        const A = j(k, "Unable to send the sign-in link. Please try again.");
        throw d(A), A;
      } finally {
        o(!1);
      }
    },
    [l, h]
  ), p = P(
    async (g) => {
      if (!g || g.trim().length === 0) {
        const k = {
          code: "VALIDATION_ERROR",
          message: "Invalid or missing sign-in link token"
        };
        throw d(k), k;
      }
      o(!0), d(null), a(!1);
      try {
        const k = await l.post(
          "/instant-link/verify",
          {
            token: g
          }
        );
        return qc(k) || (e.callbacks?.onLoginSuccess?.(k.user, "email"), r?.handleLoginSuccess(k.user, k.tokens)), k;
      } catch (k) {
        const A = j(k, "Unable to verify the sign-in link. Please try again.");
        throw d(A), A;
      } finally {
        o(!1);
      }
    },
    [l, e.callbacks, r]
  ), y = P(() => d(null), []), w = P(() => {
    d(null), a(!1), o(!1);
  }, []);
  return {
    sendInstantLink: u,
    verifyInstantLink: p,
    isLoading: s,
    isSuccess: n,
    error: i,
    clearError: y,
    reset: w,
    remainingAttempts: m()
  };
}
const jc = {
  reset: {
    subtitle: "Enter your email address and we'll send you a link to reset your password.",
    button: "Send reset link",
    successMessage: (e) => /* @__PURE__ */ c(X, { children: [
      "If an account exists for ",
      /* @__PURE__ */ t("strong", { children: e }),
      ", you will receive a password reset link shortly."
    ] })
  },
  instantLink: {
    subtitle: "Enter your email and we'll send you a sign-in link. You can change your password in your account settings once signed in.",
    button: "Send sign-in link",
    successMessage: (e) => /* @__PURE__ */ c(X, { children: [
      "We sent a sign-in link to ",
      /* @__PURE__ */ t("strong", { children: e }),
      ". Click the link to sign in."
    ] })
  }
};
function $c({
  mode: e = "reset",
  onSuccess: r,
  onCancel: s,
  className: o = ""
}) {
  const [n, a] = S(""), i = ss(), d = zc(), l = Bn(), h = e === "instantLink" ? { submit: d.sendInstantLink, isLoading: d.isLoading, isSuccess: d.isSuccess, error: d.error, clearError: d.clearError } : { submit: i.forgotPassword, isLoading: i.isLoading, isSuccess: i.isSuccess, error: i.error, clearError: i.clearError }, m = jc[e], u = async (p) => {
    p.preventDefault();
    try {
      await h.submit(n), r?.();
    } catch {
    }
  };
  return h.isSuccess ? /* @__PURE__ */ c("div", { className: `cedros-forgot-password-success ${o}`, children: [
    /* @__PURE__ */ c(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ t("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ t(
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
    /* @__PURE__ */ t("h3", { className: "cedros-success-title", children: "Check your email" }),
    /* @__PURE__ */ t("p", { className: "cedros-success-message", children: m.successMessage(n) }),
    s && /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-outline",
        onClick: s,
        children: "Back to login"
      }
    )
  ] }) : /* @__PURE__ */ c("form", { className: `cedros-forgot-password-form ${o}`, onSubmit: u, children: [
    /* @__PURE__ */ c("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-form-title", children: "Forgot password?" }),
      /* @__PURE__ */ t("p", { className: "cedros-form-subtitle", children: m.subtitle })
    ] }),
    /* @__PURE__ */ t(le, { error: h.error, onDismiss: h.clearError }),
    /* @__PURE__ */ c("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ t("label", { htmlFor: l, className: "cedros-label", children: "Email address" }),
      /* @__PURE__ */ t(
        "input",
        {
          id: l,
          type: "email",
          className: "cedros-input",
          value: n,
          onChange: (p) => a(p.target.value),
          placeholder: "you@example.com",
          required: !0,
          autoComplete: "email",
          disabled: h.isLoading
        }
      )
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: h.isLoading || !n,
          children: h.isLoading ? /* @__PURE__ */ c(X, { children: [
            /* @__PURE__ */ t(Z, { size: "sm" }),
            "Sending..."
          ] }) : m.button
        }
      ),
      s && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: s,
          disabled: h.isLoading,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
const Vc = {
  loading: !1,
  loaded: !1,
  error: null,
  callbacks: [],
  load() {
    return typeof window > "u" || typeof document > "u" ? Promise.reject(new Error("Apple Sign-In script loader cannot run in SSR")) : this.loaded ? Promise.resolve() : this.loading ? new Promise((e, r) => {
      this.callbacks.push({ resolve: e, reject: r });
    }) : (this.loading = !0, new Promise((e, r) => {
      this.callbacks.push({ resolve: e, reject: r });
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
function Hc() {
  const { config: e, _internal: r } = J(), [s, o] = S(!1), [n, a] = S(!1), [i, d] = S(null), [l, h] = S(null), m = se(e), u = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  );
  F(() => {
    m.current = e;
  }, [e]), F(() => {
    if (!e.appleClientId)
      return;
    let g = !0;
    const k = () => {
      if (g)
        try {
          window.AppleID?.auth?.init({
            clientId: e.appleClientId,
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: !0
          }), g && a(!0);
        } catch {
          g && d({
            code: "SERVER_ERROR",
            message: "Unable to initialize Apple sign-in. Please refresh and try again."
          });
        }
    };
    return Vc.load().then(() => {
      g && k();
    }).catch(() => {
      g && d({
        code: "SERVER_ERROR",
        message: "Unable to load Apple sign-in. Please refresh and try again."
      });
    }), () => {
      g = !1;
    };
  }, [e.appleClientId]);
  const p = P(async () => {
    if (!e.appleClientId) {
      const k = {
        code: "VALIDATION_ERROR",
        message: "Apple Client ID not configured"
      };
      throw d(k), k;
    }
    if (!n) {
      const k = {
        code: "VALIDATION_ERROR",
        message: "Apple sign-in is not ready yet. Please wait a moment and try again."
      };
      throw d(k), k;
    }
    o(!0), d(null);
    let g;
    try {
      const k = crypto.getRandomValues(new Uint8Array(32)), A = Array.from(k, (b) => b.toString(16).padStart(2, "0")).join(""), C = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(A)
      ), E = Array.from(
        new Uint8Array(C),
        (b) => b.toString(16).padStart(2, "0")
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
      const L = x.user?.name ? `${x.user.name.firstName || ""} ${x.user.name.lastName || ""}`.trim() : void 0, f = await u.post("/apple", {
        idToken: g,
        name: L || void 0,
        nonce: A,
        referral: r?.getReferralCode?.() ?? void 0
      });
      return m.current.callbacks?.onLoginSuccess?.(f.user, "apple"), r?.handleLoginSuccess(f.user, f.tokens), o(!1), f;
    } catch (k) {
      if (k.error === "popup_closed_by_user") {
        const E = {
          code: "SERVER_ERROR",
          message: "Apple sign-in was cancelled."
        };
        throw d(E), o(!1), E;
      }
      const C = j(k, "Unable to sign in with Apple. Please try again.");
      throw C.code === "ACCOUNT_LINK_REQUIRED" && g && h(g), d(C), o(!1), C;
    }
  }, [e.appleClientId, n, u, r]), y = P(() => d(null), []), w = P(() => h(null), []);
  return {
    signIn: p,
    isLoading: s,
    isInitialized: n,
    error: i,
    clearError: y,
    pendingLinkIdToken: l,
    clearPendingLink: w
  };
}
function Co() {
  if (typeof window > "u" || typeof navigator > "u")
    return !1;
  const e = navigator.userAgent.toLowerCase(), r = (navigator.platform || "").toLowerCase();
  return !!(/iphone|ipad|ipod/.test(e) || r.includes("mac") || /macintosh/.test(e) || r === "macintel" && navigator.maxTouchPoints > 1);
}
function Qc({
  onSuccess: e,
  onError: r,
  className: s = "",
  variant: o = "default",
  size: n = "md",
  disabled: a = !1,
  hideOnNonApple: i = !0
}) {
  const { signIn: d, isLoading: l, isInitialized: h } = Hc(), [m] = S(() => Co());
  if (i && !m)
    return null;
  const u = async () => {
    try {
      await d(), e?.();
    } catch (w) {
      const g = w instanceof Error ? w : new Error(String(w));
      r?.(g);
    }
  }, p = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  };
  return /* @__PURE__ */ c(
    "button",
    {
      type: "button",
      className: `cedros-button ${{
        default: "cedros-button-social",
        outline: "cedros-button-social-outline"
      }[o]} ${p[n]} ${s}`,
      onClick: u,
      disabled: a || !h || l,
      "aria-label": "Sign in with Apple",
      children: [
        l ? /* @__PURE__ */ t(Z, { size: "sm" }) : /* @__PURE__ */ t(
          "svg",
          {
            className: "cedros-button-icon",
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true",
            children: /* @__PURE__ */ t("path", { d: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" })
          }
        ),
        /* @__PURE__ */ t("span", { children: "Continue with Apple" })
      ]
    }
  );
}
function pe(e, r) {
  if (!e) throw new Error(r);
}
function Gc(e) {
  return e.replace(/-/g, "+").replace(/_/g, "/");
}
function Ft(e) {
  pe(typeof e == "string" && e.length > 0, "Expected base64url string");
  const r = Gc(e), s = r + "=".repeat((4 - r.length % 4) % 4), o = atob(s), n = new Uint8Array(o.length);
  for (let a = 0; a < o.length; a++) n[a] = o.charCodeAt(a);
  return n.buffer;
}
function et(e) {
  const r = new Uint8Array(e);
  let s = "";
  for (let n = 0; n < r.length; n++) s += String.fromCharCode(r[n]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function Eo(e) {
  pe(typeof e == "object" && e !== null, "Invalid credential descriptor");
  const r = e;
  return pe(typeof r.type == "string", "Invalid credential descriptor type"), pe(typeof r.id == "string", "Invalid credential descriptor id"), {
    type: r.type,
    id: Ft(r.id),
    transports: Array.isArray(r.transports) ? r.transports : void 0
  };
}
function or(e) {
  pe(e && typeof e == "object", "Missing creation options");
  const r = e.publicKey;
  pe(r && typeof r == "object", "Missing creation options.publicKey"), pe(typeof r.challenge == "string", "Missing creation challenge"), pe(typeof r.rp == "object" && r.rp !== null, "Missing rp"), pe(typeof r.user == "object" && r.user !== null, "Missing user");
  const s = r.rp, o = r.user;
  pe(typeof s.name == "string", "Missing rp.name"), pe(typeof o.id == "string", "Missing user.id"), pe(typeof o.name == "string", "Missing user.name"), pe(typeof o.displayName == "string", "Missing user.displayName");
  const n = Array.isArray(r.excludeCredentials) ? r.excludeCredentials.map(Eo) : void 0, a = Array.isArray(r.pubKeyCredParams) ? r.pubKeyCredParams.map((d) => ({
    type: d.type,
    alg: d.alg
  })) : [], i = {
    challenge: Ft(r.challenge),
    rp: {
      name: s.name,
      id: typeof s.id == "string" ? s.id : void 0
    },
    user: {
      id: Ft(o.id),
      name: o.name,
      displayName: o.displayName
    },
    pubKeyCredParams: a,
    timeout: typeof r.timeout == "number" ? r.timeout : void 0,
    attestation: typeof r.attestation == "string" ? r.attestation : void 0,
    authenticatorSelection: typeof r.authenticatorSelection == "object" && r.authenticatorSelection !== null ? r.authenticatorSelection : void 0,
    excludeCredentials: n,
    extensions: typeof r.extensions == "object" && r.extensions !== null ? r.extensions : void 0
  };
  return i.hints = ["client-device"], i;
}
function Us(e) {
  pe(e && typeof e == "object", "Missing request options");
  const r = e.publicKey;
  pe(r && typeof r == "object", "Missing request options.publicKey"), pe(typeof r.challenge == "string", "Missing request challenge");
  const s = Array.isArray(r.allowCredentials) ? r.allowCredentials.map(Eo) : void 0, o = {
    challenge: Ft(r.challenge),
    rpId: typeof r.rpId == "string" ? r.rpId : void 0,
    timeout: typeof r.timeout == "number" ? r.timeout : void 0,
    userVerification: typeof r.userVerification == "string" ? r.userVerification : void 0,
    allowCredentials: s,
    extensions: typeof r.extensions == "object" && r.extensions !== null ? r.extensions : void 0
  };
  return o.hints = ["client-device"], o;
}
function lt(e) {
  const r = et(e.rawId), s = e.response, n = { ...{
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
    rawId: r,
    type: e.type,
    authenticatorAttachment: e.authenticatorAttachment ?? void 0,
    clientExtensionResults: e.getClientExtensionResults?.() ?? {},
    response: n
  };
}
function Kc() {
  if (typeof window < "u") {
    const e = window.location?.hostname, r = e === "localhost" || e === "127.0.0.1" || e?.endsWith(".localhost");
    if (!(window.isSecureContext === !0) && !r)
      return !1;
  }
  return typeof window < "u" && typeof window.PublicKeyCredential < "u" && typeof navigator < "u" && typeof navigator.credentials < "u";
}
function Yc(e) {
  return typeof e == "object" && e !== null && "code" in e && "message" in e && typeof e.code == "string" && typeof e.message == "string";
}
function dt(e) {
  if (!(e instanceof Error)) return null;
  const r = e.name;
  return r === "NotAllowedError" ? { code: "SERVER_ERROR", message: "Passkey operation was cancelled or timed out" } : r === "InvalidStateError" ? { code: "VALIDATION_ERROR", message: "Passkey is not available for this operation" } : r === "SecurityError" ? {
    code: "VALIDATION_ERROR",
    message: "Passkeys require HTTPS and a correctly configured relying party (WEBAUTHN_RP_ID / WEBAUTHN_RP_ORIGIN)"
  } : null;
}
function So() {
  const { config: e, _internal: r } = J(), [s, o] = S(!1), [n, a] = S(null), i = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      // Needed for authenticated registration endpoints when cookie auth is disabled
      getAccessToken: r?.getAccessToken
    }),
    [r?.getAccessToken, e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), d = P(() => a(null), []), l = Kc(), h = P(
    async (k) => {
      if (!l) {
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
          { email: k?.email }
        ), C = Us(A.options), E = await navigator.credentials.get({
          publicKey: C
        });
        if (!E)
          throw new Error("Passkey authentication returned no credential");
        const x = await i.post("/webauthn/auth/verify", {
          challengeId: A.challengeId,
          credential: lt(E)
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), r?.handleLoginSuccess(x.user, x.tokens), x;
      } catch (A) {
        const E = dt(A) ?? j(A, "Unable to sign in with passkey. Please try again.");
        throw a(E), E;
      } finally {
        o(!1);
      }
    },
    [i, e.callbacks, r, l]
  ), m = P(
    async (k) => {
      if (!l) {
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
        ), C = or(A.options), E = await navigator.credentials.create({
          publicKey: C
        });
        if (!E)
          throw new Error("Passkey registration returned no credential");
        const x = await i.post("/webauthn/register/verify", {
          challengeId: A.challengeId,
          credential: lt(E),
          label: k?.label
        });
        if (!x.success)
          throw new Error("Passkey registration failed");
        return { credentialId: x.credentialId, label: x.label };
      } catch (A) {
        const E = dt(A) ?? j(A, "Unable to register passkey. Please try again.");
        throw a(E), E;
      } finally {
        o(!1);
      }
    },
    [i, l]
  ), u = P(
    async (k) => {
      if (!l) {
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
        ), C = or(A.options), E = await navigator.credentials.create({
          publicKey: C
        });
        if (!E)
          throw new Error("Passkey signup returned no credential");
        const x = await i.post("/webauthn/signup/verify", {
          challengeId: A.challengeId,
          credential: lt(E),
          email: k?.email,
          name: k?.name,
          label: k?.label,
          referral: r?.getReferralCode?.() ?? void 0
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), r?.handleLoginSuccess(x.user, x.tokens), x;
      } catch (A) {
        const E = dt(A) ?? j(A, "Unable to sign up with passkey. Please try again.");
        throw a(E), E;
      } finally {
        o(!1);
      }
    },
    [i, e.callbacks, r, l]
  ), p = P(async () => {
    if (!l) {
      const C = {
        code: "VALIDATION_ERROR",
        message: "Passkeys are not supported in this browser"
      };
      throw a(C), C;
    }
    o(!0), a(null);
    const k = typeof localStorage < "u" && localStorage.getItem("cedros-passkey-registered") === "1", A = () => {
      try {
        localStorage.setItem("cedros-passkey-registered", "1");
      } catch {
      }
    };
    return k ? y(A) : w(A);
  }, [i, e.callbacks, r, l]), y = P(
    async (k) => {
      try {
        const A = await i.post(
          "/webauthn/auth/options",
          {}
        ), C = Us(A.options), E = await navigator.credentials.get({
          publicKey: C
        });
        if (!E)
          throw new Error("Passkey authentication returned no credential");
        const x = await i.post("/webauthn/auth/verify", {
          challengeId: A.challengeId,
          credential: lt(E)
        });
        return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), r?.handleLoginSuccess(x.user, x.tokens), k(), x;
      } catch (A) {
        if (A instanceof Error && (A.name === "NotAllowedError" || A.name === "InvalidStateError"))
          return g(k);
        if (typeof A == "object" && A !== null && "isApiError" in A && A.data?.code === "INVALID_CREDENTIALS") {
          const f = {
            code: "INVALID_CREDENTIALS",
            message: "This passkey is not recognized. Please remove old passkeys for this site and try again, or sign in another way."
          };
          throw a(f), f;
        }
        const L = dt(A) ?? j(A, "Unable to sign in with passkey. Please try again.");
        throw a(L), L;
      } finally {
        o(!1);
      }
    },
    [i, e.callbacks, r]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), w = P(
    async (k) => {
      try {
        return await g(k);
      } catch (A) {
        if (A instanceof Error && (A.name === "InvalidStateError" || A.name === "NotAllowedError"))
          return y(k);
        if (!Yc(A)) {
          const x = dt(A) ?? j(A, "Unable to create passkey. Please try again.");
          throw a(x), x;
        }
        throw A;
      } finally {
        o(!1);
      }
    },
    [i, e.callbacks, r]
    // eslint-disable-line react-hooks/exhaustive-deps
  ), g = P(
    async (k) => {
      const A = await i.post(
        "/webauthn/signup/options",
        {}
      ), C = or(A.options), E = await navigator.credentials.create({
        publicKey: C
      });
      if (!E)
        throw new Error("Passkey signup returned no credential");
      const x = await i.post("/webauthn/signup/verify", {
        challengeId: A.challengeId,
        credential: lt(E),
        referral: r?.getReferralCode?.() ?? void 0
      });
      return e.callbacks?.onLoginSuccess?.(x.user, "webauthn"), r?.handleLoginSuccess(x.user, x.tokens), k(), x;
    },
    [i, e.callbacks, r]
  );
  return {
    isSupported: l,
    isLoading: s,
    error: n,
    clearError: d,
    continueWithPasskey: p,
    authenticatePasskey: h,
    registerPasskey: m,
    signupWithPasskey: u
  };
}
function Zc({
  onSuccess: e,
  className: r = "",
  children: s,
  disabled: o
}) {
  const { continueWithPasskey: n, isLoading: a, isSupported: i } = So(), d = o || !i || a;
  return /* @__PURE__ */ c(
    "button",
    {
      type: "button",
      className: `cedros-button cedros-button-social ${r}`,
      onClick: async () => {
        try {
          await n(), e?.();
        } catch {
        }
      },
      disabled: d,
      "aria-disabled": d,
      children: [
        a ? /* @__PURE__ */ t(Z, { size: "sm" }) : /* @__PURE__ */ t("span", { className: "cedros-social-icon", "aria-hidden": "true", children: /* @__PURE__ */ t(Xc, {}) }),
        /* @__PURE__ */ t("span", { children: s ?? "Continue with Passkey" })
      ]
    }
  );
}
function Xc() {
  return /* @__PURE__ */ c(
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
const ut = ["login", "register"];
function ns({ onSuccess: e, className: r = "", defaultTab: s = "login" }) {
  const { config: o, socialButtonOrder: n } = J(), [a, i] = S(s), [d, l] = S("form"), [h, m] = S(() => ps()), [u] = S(() => Co());
  F(() => {
    const L = () => m(ps());
    return L(), window.addEventListener("load", L), window.addEventListener("focus", L), () => {
      window.removeEventListener("load", L), window.removeEventListener("focus", L);
    };
  }, []);
  const p = o.forms?.forgotPassword?.mode ?? (o.features?.instantLink ? "instantLink" : "reset"), y = P(
    (L) => {
      const f = ut.indexOf(a);
      let b = f;
      switch (L.key) {
        case "ArrowLeft":
        case "ArrowUp":
          b = f === 0 ? ut.length - 1 : f - 1;
          break;
        case "ArrowRight":
        case "ArrowDown":
          b = f === ut.length - 1 ? 0 : f + 1;
          break;
        case "Home":
          b = 0;
          break;
        case "End":
          b = ut.length - 1;
          break;
        default:
          return;
      }
      L.preventDefault();
      const v = ut[b];
      i(v), document.getElementById(`cedros-tab-${v}`)?.focus();
    },
    [a]
  ), w = o.features ?? {
    email: !0,
    google: !0,
    apple: !0,
    solana: !0,
    webauthn: !0
  }, g = w.email !== !1, k = w.google !== !1 && o.googleClientId, A = w.apple !== !1 && o.appleClientId && u, C = w.solana !== !1 && h, E = w.webauthn !== !1, x = g && (k || A || C || E);
  return d === "forgotPassword" ? /* @__PURE__ */ t("div", { className: `cedros-login-form ${r}`, children: /* @__PURE__ */ t($c, { mode: p, onCancel: () => l("form") }) }) : /* @__PURE__ */ c("div", { className: `cedros-login-form ${r}`, children: [
    (E || k || A || C) && (() => {
      const L = {
        webauthn: E ? /* @__PURE__ */ t(Zc, { onSuccess: e }) : null,
        google: k ? /* @__PURE__ */ t(ga, { onSuccess: e }) : null,
        apple: A ? /* @__PURE__ */ t(Qc, { onSuccess: e }) : null,
        solana: C ? /* @__PURE__ */ t(wa, { onSuccess: e }) : null
      };
      return /* @__PURE__ */ t("div", { className: "cedros-social-buttons", children: (n ?? ["webauthn", "google", "apple", "solana"]).map((b) => {
        const v = L[b];
        return v ? /* @__PURE__ */ t(da, { children: v }, b) : null;
      }) });
    })(),
    x && /* @__PURE__ */ t("div", { className: "cedros-divider", children: /* @__PURE__ */ t("span", { children: "Or continue with" }) }),
    g && /* @__PURE__ */ c(X, { children: [
      /* @__PURE__ */ c("div", { className: "cedros-tabs", role: "tablist", "aria-label": "Authentication method", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-login",
            className: `cedros-tab ${a === "login" ? "cedros-tab-active" : ""}`,
            onClick: () => i("login"),
            onKeyDown: y,
            "aria-selected": a === "login",
            "aria-controls": "cedros-tabpanel-login",
            tabIndex: a === "login" ? 0 : -1,
            children: "Sign in"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            role: "tab",
            id: "cedros-tab-register",
            className: `cedros-tab ${a === "register" ? "cedros-tab-active" : ""}`,
            onClick: () => i("register"),
            onKeyDown: y,
            "aria-selected": a === "register",
            "aria-controls": "cedros-tabpanel-register",
            tabIndex: a === "register" ? 0 : -1,
            children: "Sign up"
          }
        )
      ] }),
      /* @__PURE__ */ t(
        "div",
        {
          role: "tabpanel",
          id: `cedros-tabpanel-${a}`,
          "aria-labelledby": `cedros-tab-${a}`,
          children: a === "login" ? /* @__PURE__ */ t(
            fa,
            {
              onSuccess: e,
              onSwitchToRegister: () => i("register"),
              onForgotPassword: () => l("forgotPassword")
            }
          ) : /* @__PURE__ */ t(
            pa,
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
class Jc extends ua {
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
    const { hasError: r, error: s, errorInfo: o } = this.state, { children: n, fallback: a, showDetails: i = !1 } = this.props;
    return r ? a || /* @__PURE__ */ t("div", { className: "cedros-error-boundary", role: "alert", "aria-live": "assertive", children: /* @__PURE__ */ c("div", { className: "cedros-error-boundary-content", children: [
      /* @__PURE__ */ c(
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
      i && s && /* @__PURE__ */ c("details", { className: "cedros-error-boundary-details", children: [
        /* @__PURE__ */ t("summary", { children: "Error details" }),
        /* @__PURE__ */ c("pre", { children: [
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
function Zh({ className: e = "", title: r = "Sign in to your account" }) {
  const { isModalOpen: s, closeModal: o } = J(), n = se(null), a = se(null), i = se(o);
  if (F(() => {
    i.current = o;
  }, [o]), F(() => {
    if (!s) return;
    a.current = document.activeElement, n.current?.focus();
    const l = (m) => {
      if (m.key === "Escape" && i.current(), m.key === "Tab" && n.current) {
        const u = n.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ), p = u[0], y = u[u.length - 1];
        m.shiftKey && document.activeElement === p ? (m.preventDefault(), y?.focus()) : !m.shiftKey && document.activeElement === y && (m.preventDefault(), p?.focus());
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
      children: /* @__PURE__ */ c(
        "div",
        {
          ref: n,
          className: "cedros-modal",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "cedros-modal-title",
          tabIndex: -1,
          children: [
            /* @__PURE__ */ c("div", { className: "cedros-modal-header", children: [
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
            /* @__PURE__ */ t("div", { className: "cedros-modal-content", children: /* @__PURE__ */ t(Jc, { children: /* @__PURE__ */ t(ns, { onSuccess: o }) }) })
          ]
        }
      )
    }
  );
}
function Xh({
  token: e,
  onSuccess: r,
  onLoginClick: s,
  className: o = ""
}) {
  const [n, a] = S(""), [i, d] = S(""), [l, h] = S(null), { resetPassword: m, isLoading: u, isSuccess: p, error: y, clearError: w } = ss(), g = n === i, k = l?.isValid && g && n.length > 0, A = async (C) => {
    if (C.preventDefault(), !!k)
      try {
        await m(e, n), r?.();
      } catch {
      }
  };
  return p ? /* @__PURE__ */ c("div", { className: `cedros-reset-password-success ${o}`, children: [
    /* @__PURE__ */ c(
      "svg",
      {
        className: "cedros-success-icon",
        width: "48",
        height: "48",
        viewBox: "0 0 48 48",
        fill: "none",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ t("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
          /* @__PURE__ */ t(
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
    /* @__PURE__ */ t("h3", { className: "cedros-success-title", children: "Password reset successful" }),
    /* @__PURE__ */ t("p", { className: "cedros-success-message", children: "Your password has been reset. You can now log in with your new password." }),
    s && /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-md cedros-button-primary",
        onClick: s,
        children: "Go to login"
      }
    )
  ] }) : /* @__PURE__ */ c("form", { className: `cedros-reset-password-form ${o}`, onSubmit: A, children: [
    /* @__PURE__ */ c("div", { className: "cedros-form-header", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-form-title", children: "Reset your password" }),
      /* @__PURE__ */ t("p", { className: "cedros-form-subtitle", children: "Enter your new password below." })
    ] }),
    /* @__PURE__ */ t(le, { error: y, onDismiss: w }),
    /* @__PURE__ */ t("div", { className: "cedros-form-field", children: /* @__PURE__ */ t(
      ve,
      {
        label: "New password",
        value: n,
        onChange: (C) => {
          a(C.target.value), h(zt(C.target.value));
        },
        showStrengthMeter: !0,
        onValidationChange: h,
        disabled: u,
        autoComplete: "new-password",
        error: l && !l.isValid ? Object.values(l.errors).find(Boolean) : void 0
      }
    ) }),
    /* @__PURE__ */ t("div", { className: "cedros-form-field", children: /* @__PURE__ */ t(
      ve,
      {
        label: "Confirm password",
        value: i,
        onChange: (C) => d(C.target.value),
        disabled: u,
        autoComplete: "new-password",
        error: i && !g ? "Passwords do not match" : void 0
      }
    ) }),
    /* @__PURE__ */ c("div", { className: "cedros-form-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-md cedros-button-primary cedros-button-full",
          disabled: u || !k,
          children: u ? /* @__PURE__ */ c(X, { children: [
            /* @__PURE__ */ t(Z, { size: "sm" }),
            "Resetting..."
          ] }) : "Reset password"
        }
      ),
      s && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-ghost cedros-button-full",
          onClick: s,
          disabled: u,
          children: "Back to login"
        }
      )
    ] })
  ] });
}
function jr({ org: e, size: r = "lg", className: s = "" }) {
  const o = Mn(e.logoUrl), n = r === "lg" ? "cedros-org-avatar-lg" : "", a = ["cedros-org-avatar", n, s].filter(Boolean).join(" "), i = ["cedros-org-avatar-placeholder", n, s].filter(Boolean).join(" ");
  return o ? /* @__PURE__ */ t(
    "img",
    {
      src: o,
      alt: e.name,
      className: a,
      referrerPolicy: "no-referrer"
    }
  ) : /* @__PURE__ */ t("div", { className: i, children: e.name[0]?.toUpperCase() || "?" });
}
function Jh({
  orgs: e,
  activeOrg: r,
  isLoading: s = !1,
  onSelect: o,
  onCreateClick: n,
  className: a = "",
  placeholder: i = "Select organization"
}) {
  const [d, l] = S(!1), h = se(null);
  F(() => {
    const y = (w) => {
      h.current && !h.current.contains(w.target) && l(!1);
    };
    return document.addEventListener("mousedown", y), () => document.removeEventListener("mousedown", y);
  }, []), F(() => {
    const y = (w) => {
      w.key === "Escape" && l(!1);
    };
    if (d)
      return document.addEventListener("keydown", y), () => document.removeEventListener("keydown", y);
  }, [d]);
  const m = P(
    (y) => {
      o(y), l(!1);
    },
    [o]
  ), u = P(() => {
    l(!1), n?.();
  }, [n]), p = P(() => {
    l((y) => !y);
  }, []);
  return s ? /* @__PURE__ */ c(
    "div",
    {
      className: `cedros-org-selector cedros-org-selector-loading ${a}`,
      "aria-busy": "true",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ t(Z, { size: "sm" }),
        /* @__PURE__ */ t("span", { children: "Loading..." })
      ]
    }
  ) : /* @__PURE__ */ c("div", { ref: h, className: `cedros-org-selector ${a}`, children: [
    /* @__PURE__ */ c(
      "button",
      {
        type: "button",
        className: "cedros-org-selector-trigger",
        onClick: p,
        "aria-haspopup": "listbox",
        "aria-expanded": d,
        children: [
          r ? /* @__PURE__ */ c(X, { children: [
            /* @__PURE__ */ t(jr, { org: r, size: "sm" }),
            /* @__PURE__ */ t("span", { className: "cedros-org-selector-name", children: r.name }),
            /* @__PURE__ */ t(Ds, { role: r.membership.role })
          ] }) : /* @__PURE__ */ t("span", { className: "cedros-org-selector-placeholder", children: i }),
          /* @__PURE__ */ t(el, { isOpen: d })
        ]
      }
    ),
    d && /* @__PURE__ */ c("div", { className: "cedros-org-selector-dropdown", role: "listbox", children: [
      e.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-org-selector-empty", children: "No organizations" }) : /* @__PURE__ */ t("ul", { className: "cedros-org-selector-list", children: e.map((y) => /* @__PURE__ */ t("li", { children: /* @__PURE__ */ c(
        "button",
        {
          type: "button",
          className: `cedros-org-selector-item ${y.id === r?.id ? "cedros-org-selector-item-active" : ""}`,
          onClick: () => m(y.id),
          role: "option",
          "aria-selected": y.id === r?.id,
          children: [
            /* @__PURE__ */ t(jr, { org: y, size: "sm" }),
            /* @__PURE__ */ t("span", { className: "cedros-org-selector-item-name", children: y.name }),
            /* @__PURE__ */ t(Ds, { role: y.membership.role }),
            y.id === r?.id && /* @__PURE__ */ t(tl, {})
          ]
        }
      ) }, y.id)) }),
      n && /* @__PURE__ */ c(X, { children: [
        /* @__PURE__ */ t("div", { className: "cedros-org-selector-divider" }),
        /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            className: "cedros-org-selector-create",
            onClick: u,
            children: [
              /* @__PURE__ */ t(rl, {}),
              /* @__PURE__ */ t("span", { children: "Create organization" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function Ds({ role: e }) {
  return /* @__PURE__ */ t("span", { className: `cedros-org-role cedros-org-role-${e}`, children: e });
}
function el({ isOpen: e }) {
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
function tl() {
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
function rl() {
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
function sl() {
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
function nl() {
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
function ol() {
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
function al({
  orgs: e,
  activeOrg: r,
  isLoading: s,
  onSelect: o,
  onCreateClick: n
}) {
  return s ? /* @__PURE__ */ c("div", { className: "cedros-org-switcher-loading", children: [
    /* @__PURE__ */ t(Z, {}),
    /* @__PURE__ */ t("span", { children: "Loading organizations..." })
  ] }) : /* @__PURE__ */ c(X, { children: [
    e.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-org-switcher-empty", children: /* @__PURE__ */ t("p", { children: "You don't belong to any organizations yet." }) }) : /* @__PURE__ */ t("ul", { className: "cedros-org-switcher-list", children: e.map((a) => /* @__PURE__ */ t("li", { children: /* @__PURE__ */ c(
      "button",
      {
        type: "button",
        className: `cedros-org-switcher-item ${a.id === r?.id ? "cedros-org-switcher-item-active" : ""}`,
        onClick: () => o(a.id),
        children: [
          /* @__PURE__ */ t(jr, { org: a }),
          /* @__PURE__ */ c("div", { className: "cedros-org-switcher-item-content", children: [
            /* @__PURE__ */ t("span", { className: "cedros-org-switcher-item-name", children: a.name }),
            /* @__PURE__ */ c("span", { className: "cedros-org-switcher-item-slug", children: [
              "@",
              a.slug
            ] })
          ] }),
          /* @__PURE__ */ c("div", { className: "cedros-org-switcher-item-meta", children: [
            /* @__PURE__ */ t("span", { className: `cedros-org-role cedros-org-role-${a.membership.role}`, children: a.membership.role }),
            a.isPersonal && /* @__PURE__ */ t("span", { className: "cedros-org-personal-badge", children: "Personal" })
          ] }),
          a.id === r?.id && /* @__PURE__ */ t(nl, {})
        ]
      }
    ) }, a.id)) }),
    n && /* @__PURE__ */ c("button", { type: "button", className: "cedros-org-switcher-create", onClick: n, children: [
      /* @__PURE__ */ t(ol, {}),
      /* @__PURE__ */ t("span", { children: "Create new organization" })
    ] })
  ] });
}
function il({ isLoading: e, onSubmit: r, onCancel: s }) {
  const [o, n] = S(""), [a, i] = S(""), [d, l] = S(null), h = P((u) => {
    n(u);
    const p = u.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 50);
    i(p);
  }, []), m = P(
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
  return /* @__PURE__ */ c("form", { className: "cedros-org-create-form", onSubmit: m, children: [
    d && /* @__PURE__ */ t(le, { error: d }),
    /* @__PURE__ */ c("div", { className: "cedros-form-group", children: [
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
    /* @__PURE__ */ c("div", { className: "cedros-form-group", children: [
      /* @__PURE__ */ t("label", { htmlFor: "org-slug", className: "cedros-form-label", children: "URL Slug" }),
      /* @__PURE__ */ c("div", { className: "cedros-form-input-prefix", children: [
        /* @__PURE__ */ t("span", { className: "cedros-form-prefix", children: "@" }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "org-slug",
            type: "text",
            className: "cedros-form-input",
            value: a,
            onChange: (u) => i(u.target.value.toLowerCase()),
            placeholder: "my-organization",
            maxLength: 100,
            pattern: "[a-z0-9-]+",
            disabled: e
          }
        )
      ] }),
      /* @__PURE__ */ t("span", { className: "cedros-form-hint", children: "Only lowercase letters, numbers, and hyphens" })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-form-actions", children: [
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
          children: e ? /* @__PURE__ */ t(Z, { size: "sm" }) : "Create Organization"
        }
      )
    ] })
  ] });
}
function em({
  isOpen: e,
  onClose: r,
  orgs: s,
  activeOrg: o,
  isLoading: n = !1,
  error: a,
  onSelect: i,
  onCreate: d,
  className: l = ""
}) {
  return e ? /* @__PURE__ */ t(
    cl,
    {
      onClose: r,
      orgs: s,
      activeOrg: o,
      isLoading: n,
      error: a,
      onSelect: i,
      onCreate: d,
      className: l
    }
  ) : null;
}
function cl({
  onClose: e,
  orgs: r,
  activeOrg: s,
  isLoading: o = !1,
  error: n,
  onSelect: a,
  onCreate: i,
  className: d
}) {
  const [l, h] = S("list"), m = se(null), u = se(null);
  F(() => (u.current = document.activeElement, m.current?.querySelector(".cedros-modal-close")?.focus(), () => {
    u.current?.focus();
  }), []), F(() => {
    const g = (k) => {
      if (k.key === "Escape") {
        e();
        return;
      }
      if (k.key === "Tab" && m.current) {
        const A = m.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ), C = A[0], E = A[A.length - 1];
        k.shiftKey ? document.activeElement === C && (k.preventDefault(), E?.focus()) : document.activeElement === E && (k.preventDefault(), C?.focus());
      }
    };
    return document.addEventListener("keydown", g), () => document.removeEventListener("keydown", g);
  }, [e]);
  const p = P(
    (g) => {
      g.target === g.currentTarget && e();
    },
    [e]
  ), y = P(
    (g) => {
      a(g), e();
    },
    [a, e]
  ), w = P(
    async (g) => {
      await i?.(g), e();
    },
    [i, e]
  );
  return /* @__PURE__ */ t("div", { className: "cedros-modal-backdrop", onClick: p, children: /* @__PURE__ */ c(
    "div",
    {
      ref: m,
      className: `cedros-modal cedros-org-switcher ${d}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "org-switcher-title",
      children: [
        /* @__PURE__ */ c("div", { className: "cedros-modal-header", children: [
          /* @__PURE__ */ t("h2", { id: "org-switcher-title", className: "cedros-modal-title", children: l === "list" ? "Switch Organization" : "Create Organization" }),
          /* @__PURE__ */ t("button", { type: "button", className: "cedros-modal-close", onClick: e, "aria-label": "Close", children: /* @__PURE__ */ t(sl, {}) })
        ] }),
        /* @__PURE__ */ c("div", { className: "cedros-modal-body", children: [
          n && /* @__PURE__ */ t(le, { error: n }),
          l === "list" ? /* @__PURE__ */ t(
            al,
            {
              orgs: r,
              activeOrg: s,
              isLoading: o,
              onSelect: y,
              onCreateClick: i ? () => h("create") : void 0
            }
          ) : /* @__PURE__ */ t(
            il,
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
function ll({
  sessions: e,
  isLoading: r = !1,
  error: s,
  onRevokeAll: o,
  className: n = ""
}) {
  const [a, i] = S(!1), [d, l] = S(!1), h = se(null), m = q(() => e.filter((p) => !p.isCurrent).length, [e]), u = P(async () => {
    if (!o) return;
    const p = e.filter((w) => !w.isCurrent).length;
    if (!(p === 0 || !window.confirm(
      `Are you sure you want to sign out of ${p} other device(s)? This will log you out everywhere except this browser.`
    ))) {
      i(!0), l(!1);
      try {
        await o(), l(!0), h.current !== null && window.clearTimeout(h.current), h.current = window.setTimeout(() => {
          l(!1), h.current = null;
        }, 3e3);
      } finally {
        i(!1);
      }
    }
  }, [o, e]);
  return F(() => () => {
    h.current !== null && (window.clearTimeout(h.current), h.current = null);
  }, []), r && e.length === 0 ? /* @__PURE__ */ c("div", { className: `cedros-session-list cedros-session-list-loading ${n}`, children: [
    /* @__PURE__ */ t(Z, {}),
    /* @__PURE__ */ t("span", { children: "Loading sessions..." })
  ] }) : s ? /* @__PURE__ */ t("div", { className: `cedros-session-list ${n}`, children: /* @__PURE__ */ t(le, { error: s }) }) : e.length === 0 ? /* @__PURE__ */ t("div", { className: `cedros-session-list cedros-session-list-empty ${n}`, children: /* @__PURE__ */ t("p", { children: "No active sessions found." }) }) : /* @__PURE__ */ c("div", { className: `cedros-session-list ${n}`, children: [
    d && /* @__PURE__ */ c("div", { className: "cedros-session-success", role: "status", children: [
      /* @__PURE__ */ t(pl, {}),
      /* @__PURE__ */ t("span", { children: "All other sessions have been revoked." })
    ] }),
    /* @__PURE__ */ t("ul", { className: "cedros-session-items", children: e.map((p) => /* @__PURE__ */ t(dl, { session: p }, p.id)) }),
    o && m > 0 && /* @__PURE__ */ t("div", { className: "cedros-session-actions", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: u,
        disabled: a,
        children: a ? /* @__PURE__ */ c(X, { children: [
          /* @__PURE__ */ t(Z, { size: "sm" }),
          /* @__PURE__ */ t("span", { children: "Signing out..." })
        ] }) : `Sign out of ${m} other device${m > 1 ? "s" : ""}`
      }
    ) })
  ] });
}
function dl({ session: e }) {
  const r = ul(e.userAgent), s = ml(e.expiresAt);
  return /* @__PURE__ */ c("li", { className: `cedros-session-item ${e.isCurrent ? "cedros-session-item-current" : ""}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-session-item-icon", children: /* @__PURE__ */ t(fl, { userAgent: e.userAgent }) }),
    /* @__PURE__ */ c("div", { className: "cedros-session-item-info", children: [
      /* @__PURE__ */ c("div", { className: "cedros-session-item-main", children: [
        /* @__PURE__ */ c("span", { className: "cedros-session-item-device", children: [
          r.browser,
          " on ",
          r.os
        ] }),
        e.isCurrent && /* @__PURE__ */ t("span", { className: "cedros-session-current-badge", children: "Current session" })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-session-item-meta", children: [
        e.ipAddress && /* @__PURE__ */ c("span", { className: "cedros-session-item-ip", children: [
          "IP: ",
          e.ipAddress
        ] }),
        /* @__PURE__ */ c("span", { className: "cedros-session-item-created", children: [
          "Started ",
          hl(e.createdAt)
        ] }),
        s && /* @__PURE__ */ t("span", { className: "cedros-session-expiring", children: "Expires soon" })
      ] })
    ] })
  ] });
}
function ul(e) {
  if (!e)
    return { browser: "Unknown browser", os: "Unknown device" };
  let r = "Unknown browser";
  e.includes("Chrome") && !e.includes("Edg") ? r = "Chrome" : e.includes("Safari") && !e.includes("Chrome") ? r = "Safari" : e.includes("Firefox") ? r = "Firefox" : e.includes("Edg") && (r = "Edge");
  let s = "Unknown device";
  return e.includes("Windows") ? s = "Windows" : e.includes("Mac") ? s = "macOS" : e.includes("Linux") ? s = "Linux" : e.includes("iPhone") || e.includes("iPad") ? s = "iOS" : e.includes("Android") && (s = "Android"), { browser: r, os: s };
}
function hl(e) {
  const r = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - r.getTime(), n = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), i = Math.floor(o / (1e3 * 60 * 60 * 24));
  return n < 1 ? "just now" : n < 60 ? `${n} minute${n > 1 ? "s" : ""} ago` : a < 24 ? `${a} hour${a > 1 ? "s" : ""} ago` : i < 7 ? `${i} day${i > 1 ? "s" : ""} ago` : r.toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function ml(e) {
  const r = new Date(e), s = /* @__PURE__ */ new Date(), o = 3600 * 1e3;
  return r.getTime() - s.getTime() < o;
}
function fl({ userAgent: e }) {
  return e?.includes("iPhone") || e?.includes("iPad") || e?.includes("Android") ? /* @__PURE__ */ c(
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
  ) : /* @__PURE__ */ c(
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
function pl() {
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
function gl({
  words: e,
  onConfirm: r,
  className: s = ""
}) {
  const [o, n] = S(!1), [a, i] = S(!1), d = se(null), l = Oc(e), h = P(async () => {
    try {
      await navigator.clipboard.writeText(e.join(" ")), n(!0), d.current !== null && window.clearTimeout(d.current), d.current = window.setTimeout(() => n(!1), 2e3);
    } catch {
    }
  }, [e]);
  F(() => () => {
    d.current !== null && (window.clearTimeout(d.current), d.current = null);
  }, []);
  const m = P(() => {
    a && r();
  }, [a, r]);
  return /* @__PURE__ */ c("div", { className: `cedros-recovery-phrase-display ${s}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-recovery-header", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-recovery-title", children: "Recovery Phrase" }),
      /* @__PURE__ */ t("p", { className: "cedros-recovery-warning", children: "Write down these 12 words in order and store them securely. This is the only way to recover your wallet if you lose access." })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-recovery-grid", children: l.map((u, p) => /* @__PURE__ */ t("div", { className: "cedros-word-group", children: u.map((y, w) => {
      const g = p * 4 + w + 1;
      return /* @__PURE__ */ c("div", { className: "cedros-word-item", children: [
        /* @__PURE__ */ c("span", { className: "cedros-word-number", children: [
          g,
          "."
        ] }),
        /* @__PURE__ */ t("span", { className: "cedros-word-text", children: y })
      ] }, g);
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
    /* @__PURE__ */ t("div", { className: "cedros-recovery-security", children: /* @__PURE__ */ c("div", { className: "cedros-warning-box", children: [
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
      /* @__PURE__ */ c("div", { className: "cedros-warning-content", children: [
        /* @__PURE__ */ t("strong", { children: "Security Warning" }),
        /* @__PURE__ */ c("ul", { children: [
          /* @__PURE__ */ t("li", { children: "Never share this phrase with anyone" }),
          /* @__PURE__ */ t("li", { children: "Store it offline in a secure location" }),
          /* @__PURE__ */ t("li", { children: "Anyone with this phrase can access your wallet" }),
          /* @__PURE__ */ t("li", { children: "Cedros cannot recover this phrase for you" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ c("div", { className: "cedros-recovery-confirm", children: [
      /* @__PURE__ */ c("label", { className: "cedros-checkbox-label", children: [
        /* @__PURE__ */ t(
          "input",
          {
            type: "checkbox",
            checked: a,
            onChange: (u) => i(u.target.checked),
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
function wl({
  onSubmit: e,
  onCancel: r,
  isSubmitting: s = !1,
  error: o,
  className: n = ""
}) {
  const [a, i] = S(Array(be).fill("")), [d, l] = S(null), [h, m] = S([]), [u, p] = S(null), y = Bn(), w = se(null), g = P(
    (f, b) => {
      const v = [...a];
      if (v[f] = b.toLowerCase().trim(), i(v), b.length > 0) {
        const N = Fc(b, 5);
        m(N);
      } else
        m([]);
      p(null);
    },
    [a]
  ), k = P((f) => {
    l(f), m([]);
  }, []), A = P(
    (f) => {
      const b = a[f];
      b && !At(b) && p(`Word ${f + 1} is not in the wordlist`), w.current !== null && window.clearTimeout(w.current), w.current = window.setTimeout(() => {
        d === f && m([]);
      }, 200);
    },
    [a, d]
  );
  F(() => () => {
    w.current !== null && (window.clearTimeout(w.current), w.current = null);
  }, []);
  const C = P(
    (f) => {
      if (d !== null) {
        const b = [...a];
        b[d] = f, i(b), m([]), document.querySelector(
          `[data-word-index="${d + 1}"]`
        )?.focus();
      }
    },
    [d, a]
  ), E = P((f) => {
    const b = f.clipboardData.getData("text"), v = Wc(b);
    v.length === be && (f.preventDefault(), i(v), p(null));
  }, []), x = P(
    (f) => {
      if (f.preventDefault(), a.filter((N) => !N).length > 0) {
        p(`Please enter all ${be} words`);
        return;
      }
      const v = a.map((N, T) => ({ word: N, index: T + 1 })).filter(({ word: N }) => !At(N));
      if (v.length > 0) {
        p(`Invalid words: ${v.map((N) => `#${N.index}`).join(", ")}`);
        return;
      }
      if (!ko(a)) {
        p("Invalid recovery phrase - please check your words");
        return;
      }
      e(a);
    },
    [a, e]
  ), L = o || u;
  return /* @__PURE__ */ c(
    "form",
    {
      className: `cedros-recovery-phrase-input ${n}`,
      onSubmit: x,
      onPaste: E,
      children: [
        /* @__PURE__ */ c("div", { className: "cedros-recovery-input-header", children: [
          /* @__PURE__ */ t("h3", { className: "cedros-recovery-input-title", children: "Enter Recovery Phrase" }),
          /* @__PURE__ */ t("p", { className: "cedros-recovery-input-description", children: "Enter your 12-word recovery phrase. You can paste the entire phrase at once." })
        ] }),
        /* @__PURE__ */ t("div", { className: "cedros-word-inputs", children: Array.from({ length: be }, (f, b) => /* @__PURE__ */ c("div", { className: "cedros-word-input-wrapper", children: [
          /* @__PURE__ */ c("label", { className: "cedros-word-label", children: [
            b + 1,
            "."
          ] }),
          /* @__PURE__ */ t(
            "input",
            {
              type: "text",
              className: `cedros-word-input ${a[b] && !At(a[b]) ? "cedros-word-invalid" : a[b] && At(a[b]) ? "cedros-word-valid" : ""}`,
              value: a[b],
              onChange: (v) => g(b, v.target.value),
              onFocus: () => k(b),
              onBlur: () => A(b),
              "data-word-index": b,
              autoComplete: "off",
              autoCapitalize: "none",
              spellCheck: !1,
              disabled: s,
              "aria-label": `Word ${b + 1}`
            }
          )
        ] }, b)) }),
        d !== null && h.length > 0 && /* @__PURE__ */ t("div", { className: "cedros-suggestions", role: "listbox", id: `${y}-suggestions`, children: h.map((f) => /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-suggestion",
            onClick: () => C(f),
            role: "option",
            children: f
          },
          f
        )) }),
        L && /* @__PURE__ */ t("p", { className: "cedros-input-error", role: "alert", children: L }),
        /* @__PURE__ */ c("div", { className: "cedros-recovery-input-actions", children: [
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
function tm({ capabilities: e, className: r = "" }) {
  if (e.allSupported)
    return null;
  const s = aa(e), o = ia();
  return /* @__PURE__ */ c("div", { className: `cedros-capability-warning ${r}`, role: "alert", children: [
    /* @__PURE__ */ c("div", { className: "cedros-warning-header", children: [
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
    /* @__PURE__ */ c("div", { className: "cedros-capability-details", children: [
      /* @__PURE__ */ t("h4", { children: "Browser Compatibility" }),
      /* @__PURE__ */ c("p", { children: [
        "Detected: ",
        o.browser,
        " ",
        o.version,
        o.likelySupported ? " (likely supported)" : " (may not be supported)"
      ] }),
      /* @__PURE__ */ t("h4", { children: "Required Features" }),
      /* @__PURE__ */ c("ul", { className: "cedros-capability-list", children: [
        /* @__PURE__ */ c("li", { className: e.webCrypto ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "Web Crypto API: ",
          e.webCrypto ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ c("li", { className: e.aesGcm ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "AES-GCM Encryption: ",
          e.aesGcm ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ c("li", { className: e.hkdf ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "HKDF Key Derivation: ",
          e.hkdf ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ c("li", { className: e.webAuthn ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "WebAuthn/Passkeys: ",
          e.webAuthn ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ c("li", { className: e.webAuthnPrf ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "WebAuthn PRF Extension: ",
          e.webAuthnPrf ? "Available" : "Missing"
        ] }),
        /* @__PURE__ */ c("li", { className: e.argon2 ? "cedros-cap-ok" : "cedros-cap-missing", children: [
          "Argon2 Password Hashing: ",
          e.argon2 ? "Available" : "Missing"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-capability-help", children: [
      /* @__PURE__ */ t("h4", { children: "Recommended Browsers" }),
      /* @__PURE__ */ c("ul", { children: [
        /* @__PURE__ */ t("li", { children: "Chrome 116+ on Windows, macOS, or Android" }),
        /* @__PURE__ */ t("li", { children: "Safari 17+ on macOS or iOS" }),
        /* @__PURE__ */ t("li", { children: "Edge 116+ on Windows" })
      ] }),
      /* @__PURE__ */ t("p", { className: "cedros-capability-note", children: "A platform authenticator (Touch ID, Face ID, or Windows Hello) is required." })
    ] })
  ] });
}
const yl = ["share_c_only", "full_seed", "none"];
function bl(e) {
  return e && yl.includes(e) ? e : "share_c_only";
}
const vl = {
  walletEnabled: !1,
  recoveryMode: "share_c_only",
  unlockTtlSeconds: 900,
  isLoading: !1,
  error: null,
  refetch: async () => {
  }
};
function xo() {
  const e = He(), [r, s] = S(null), [o, n] = S(!!e), [a, i] = S(null), d = q(() => e ? new ae({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts
  }) : null, [e]), l = P(async () => {
    if (d) {
      n(!0), i(null);
      try {
        const h = await d.get("/discovery");
        h.wallet ? s({
          enabled: h.wallet.enabled,
          recoveryMode: bl(h.wallet.recoveryMode),
          unlockTtlSeconds: h.wallet.unlockTtlSeconds
        }) : s({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } catch (h) {
        const m = h instanceof Error ? h.message : "Failed to fetch wallet config";
        i(m), s({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } finally {
        n(!1);
      }
    }
  }, [d]);
  return F(() => {
    d && l();
  }, [d, l]), e ? {
    walletEnabled: r?.enabled ?? !1,
    recoveryMode: r?.recoveryMode ?? "share_c_only",
    unlockTtlSeconds: r?.unlockTtlSeconds ?? 900,
    isLoading: o,
    error: a,
    refetch: l
  } : vl;
}
function Al() {
  const { user: e } = J(), { enroll: r } = nt(), { recoveryMode: s } = xo(), [o, n] = S({ step: "idle" }), [a, i] = S(!1), d = se([]), l = P(() => {
    Sn(...d.current), d.current = [];
  }, []);
  F(() => () => {
    l();
  }, [l]);
  const h = P(
    async (w, g, k, A) => {
      n({ step: "generating_seed" });
      const C = ca();
      d.current.push(C), n({ step: "splitting_shares" });
      const { shareA: E, shareB: x, shareC: L } = po(C);
      d.current.push(E, x, L), n({ step: "encrypting_shares" });
      const f = await xn(E, _n(g)), b = mo(C), v = fo(b);
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
        if (!k) throw new Error("KDF salt required for password method");
        N.shareAKdfSalt = Te(k), N.shareAKdfParams = pt;
      }
      if (w === "passkey" && A && (N.prfSalt = A), await r(N), s === "none")
        l(), n({
          step: "complete",
          solanaPubkey: v
        });
      else {
        const T = s === "full_seed" ? Uc(C) : Ic(Ve(L));
        n({
          step: "showing_recovery",
          recoveryPhrase: T,
          solanaPubkey: v
        });
      }
    },
    [r, s, l]
  ), m = P(
    async (w) => {
      if (!e) {
        n({ step: "error", error: "User not authenticated" });
        return;
      }
      i(!0), l();
      try {
        const g = Ln(), k = await $n(w, g, pt);
        d.current.push(k), await h("password", k, g);
      } catch (g) {
        n({
          step: "error",
          error: g instanceof Error ? g.message : "Enrollment failed"
        });
      } finally {
        i(!1);
      }
    },
    [e, l, h]
  ), u = P(async () => {
    if (!e) {
      n({ step: "error", error: "User not authenticated" });
      return;
    }
    i(!0), l();
    try {
      const w = Pn(), g = Te(w);
      n({ step: "encrypting_shares" });
      const A = (await Hr(g)).prfOutput;
      d.current.push(A);
      const C = await Tn(A, w);
      d.current.push(C), await h("passkey", C, void 0, g);
    } catch (w) {
      n({
        step: "error",
        error: w instanceof Error ? w.message : "Enrollment failed"
      });
    } finally {
      i(!1);
    }
  }, [e, l, h]), p = P(() => {
    const w = o.solanaPubkey;
    l(), n({
      step: "complete",
      solanaPubkey: w
    });
  }, [o.solanaPubkey, l]), y = P(() => {
    l(), n({ step: "idle" }), i(!1);
  }, [l]);
  return {
    state: o,
    startEnrollmentWithPassword: m,
    startEnrollmentWithPasskey: u,
    confirmRecoveryPhrase: p,
    cancel: y,
    isEnrolling: a
  };
}
function Nl() {
  const { config: e, _internal: r } = J(), [s, o] = S(!1), [n, a] = S(null), i = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, r?.getAccessToken]
  );
  return {
    setPassword: P(
      async (l) => {
        o(!0), a(null);
        try {
          await i.post("/set-password", { password: l });
        } catch (h) {
          const m = j(h, "Failed to set password");
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
function kl(e) {
  return e.includes("email") ? "password" : e.includes("webauthn") ? "passkey" : "set-password";
}
function Cl({
  onComplete: e,
  onCancel: r,
  className: s = ""
}) {
  const { user: o } = J(), {
    state: n,
    startEnrollmentWithPassword: a,
    startEnrollmentWithPasskey: i,
    confirmRecoveryPhrase: d,
    cancel: l,
    isEnrolling: h
  } = Al(), { setPassword: m, isLoading: u } = Nl(), p = o ? kl(o.authMethods) : "password", [y, w] = S(""), [g, k] = S(""), [A, C] = S(null);
  F(() => {
    w(""), k(""), C(null);
  }, [o?.id]);
  const E = P(
    async (N) => {
      N.preventDefault(), C(null), await a(y);
    },
    [y, a]
  ), x = P(
    async (N) => {
      if (N.preventDefault(), y !== g) {
        C("Passwords do not match");
        return;
      }
      const T = zt(y);
      if (!T.isValid) {
        const _ = Object.values(T.errors)[0];
        C(_ ?? "Password does not meet requirements");
        return;
      }
      C(null);
      try {
        await m(y), await a(y);
      } catch {
      }
    },
    [y, g, m, a]
  ), L = P(async () => {
    await i();
  }, [i]), f = P(() => {
    d(), n.solanaPubkey && e?.(n.solanaPubkey);
  }, [d, n.solanaPubkey, e]), b = P(() => {
    l(), r?.();
  }, [l, r]), v = h || u;
  return n.step === "generating_seed" || n.step === "splitting_shares" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ c("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ t("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ t("p", { children: "Generating secure wallet..." })
  ] }) }) : n.step === "encrypting_shares" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ c("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ t("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ t("p", { children: "Encrypting wallet shares..." })
  ] }) }) : n.step === "uploading" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, "aria-busy": "true", children: /* @__PURE__ */ c("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ t("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ t("p", { children: "Saving wallet..." })
  ] }) }) : n.step === "showing_recovery" && n.recoveryPhrase ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ t(gl, { words: n.recoveryPhrase, onConfirm: f }) }) : n.step === "complete" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ c("div", { className: "cedros-enrollment-complete", children: [
    /* @__PURE__ */ c(
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
    /* @__PURE__ */ c("p", { className: "cedros-pubkey", children: [
      /* @__PURE__ */ t("strong", { children: "Address:" }),
      " ",
      n.solanaPubkey
    ] }),
    /* @__PURE__ */ t("p", { children: "Your non-custodial Solana wallet is ready to use." })
  ] }) }) : n.step === "error" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-enrollment ${s}`, children: /* @__PURE__ */ c("div", { className: "cedros-enrollment-error", children: [
    /* @__PURE__ */ c(
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
    /* @__PURE__ */ c("div", { className: "cedros-error-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: b,
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
  ] }) }) : /* @__PURE__ */ c("div", { className: `cedros-wallet-enrollment ${s}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-enrollment-header", children: [
      /* @__PURE__ */ t("h2", { children: "Create Wallet" }),
      p === "password" && /* @__PURE__ */ t("p", { children: "Enter your account password to secure your wallet." }),
      p === "passkey" && /* @__PURE__ */ t("p", { children: "Authenticate with your passkey to secure your wallet." }),
      p === "set-password" && /* @__PURE__ */ t("p", { children: "Set a password for your account to secure your wallet." })
    ] }),
    p === "password" && /* @__PURE__ */ c("form", { onSubmit: E, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ t(
        ve,
        {
          label: "Account Password",
          value: y,
          onChange: (N) => w(N.target.value),
          disabled: v,
          required: !0,
          placeholder: "Enter your account password"
        }
      ),
      /* @__PURE__ */ c("div", { className: "cedros-enrollment-actions", children: [
        r && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: b,
            disabled: v,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ t(
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
    p === "passkey" && /* @__PURE__ */ c("div", { className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ c("div", { className: "cedros-passkey-info", children: [
        /* @__PURE__ */ c(
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
      /* @__PURE__ */ c("div", { className: "cedros-enrollment-actions", children: [
        r && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: b,
            disabled: v,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: L,
            disabled: v,
            children: v ? "Creating..." : "Use Passkey"
          }
        )
      ] })
    ] }),
    p === "set-password" && /* @__PURE__ */ c("form", { onSubmit: x, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ t(
        ve,
        {
          label: "New Password",
          value: y,
          onChange: (N) => w(N.target.value),
          showStrengthMeter: !0,
          disabled: v,
          required: !0,
          minLength: 8,
          placeholder: "Choose a strong password"
        }
      ),
      /* @__PURE__ */ t(
        ve,
        {
          label: "Confirm Password",
          value: g,
          onChange: (N) => k(N.target.value),
          error: A ?? void 0,
          disabled: v,
          required: !0,
          minLength: 8,
          placeholder: "Confirm your password"
        }
      ),
      /* @__PURE__ */ t("div", { className: "cedros-password-info", children: /* @__PURE__ */ t("p", { children: "This password will also be used to sign transactions." }) }),
      /* @__PURE__ */ c("div", { className: "cedros-enrollment-actions", children: [
        r && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-secondary",
            onClick: b,
            disabled: v,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: v || !y || !g,
            children: v ? "Creating..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function El() {
  const { user: e } = J(), { signTransaction: r } = nt(), [s, o] = S(!1), [n, a] = S(null), i = P(
    async (l, h) => {
      if (!e) {
        const m = "User not authenticated";
        throw a(m), new Error(m);
      }
      o(!0), a(null);
      try {
        const m = {
          transaction: Te(l),
          ...h ? { credential: la(h) } : {}
        }, u = await r(m);
        return Rn(u.signature);
      } catch (m) {
        const u = m instanceof Error ? m.message : "Signing failed";
        throw a(u), m;
      } finally {
        o(!1);
      }
    },
    [e, r]
  ), d = P(() => a(null), []);
  return {
    signTransaction: i,
    isSigning: s,
    error: n,
    clearError: d
  };
}
function Sl() {
  const { getMaterial: e } = nt(), [r, s] = S(!1), [o, n] = S(null), a = P(async () => {
    s(!0), n(null);
    try {
      const d = await e();
      if (!d)
        throw new Error("No wallet enrolled");
      if (d.shareAAuthMethod !== "passkey")
        throw new Error("Wallet is not configured for passkey authentication");
      if (!d.prfSalt)
        throw new Error("No PRF salt configured for wallet");
      const l = await Hr(d.prfSalt);
      try {
        return {
          type: "prfOutput",
          prfOutput: Te(l.prfOutput)
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
  }, [e]), i = P(() => n(null), []);
  return {
    getPasskeyCredential: a,
    isAuthenticating: r,
    error: o,
    clearError: i
  };
}
function xl({
  mode: e,
  isLoading: r = !1,
  error: s,
  onPrompt: o,
  onRetry: n,
  onCancel: a,
  title: i,
  description: d,
  className: l = ""
}) {
  const h = P(() => {
    r || o?.();
  }, [r, o]), m = P(() => {
    n?.();
  }, [n]), u = e === "register" ? "Set Up Passkey" : "Verify with Passkey", p = e === "register" ? "Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN." : "Use your passkey to unlock your wallet. You will be prompted for biometric verification.";
  return /* @__PURE__ */ c("div", { className: `cedros-passkey-prompt ${l}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-passkey-icon", children: r ? /* @__PURE__ */ t(Ll, {}) : s ? /* @__PURE__ */ t(Pl, {}) : /* @__PURE__ */ t(_l, {}) }),
    /* @__PURE__ */ t("h3", { className: "cedros-passkey-title", children: i ?? u }),
    /* @__PURE__ */ t("p", { className: "cedros-passkey-description", children: d ?? p }),
    s && /* @__PURE__ */ t("div", { className: "cedros-passkey-error", role: "alert", children: /* @__PURE__ */ t("p", { children: s }) }),
    /* @__PURE__ */ t("div", { className: "cedros-passkey-actions", children: s ? /* @__PURE__ */ c(X, { children: [
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
    ] }) : /* @__PURE__ */ c(X, { children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: h,
          disabled: r,
          children: r ? /* @__PURE__ */ c(X, { children: [
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
    r && /* @__PURE__ */ c("p", { className: "cedros-passkey-hint", children: [
      "Follow the prompts on your device to ",
      e === "register" ? "create" : "verify",
      " your passkey."
    ] })
  ] });
}
function _l() {
  return /* @__PURE__ */ c(
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
function Ll() {
  return /* @__PURE__ */ c("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
    /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
    /* @__PURE__ */ t("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function Pl() {
  return /* @__PURE__ */ c(
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
function Tl({
  onUnlock: e,
  onCancel: r,
  showCancel: s = !0,
  authMethod: o,
  className: n = ""
}) {
  J();
  const { unlock: a, getMaterial: i, isLoading: d } = nt(), { getPasskeyCredential: l, isAuthenticating: h } = Sl(), [m, u] = S("idle"), [p, y] = S(o ?? null), [w, g] = S(""), [k, A] = S(null);
  F(() => {
    o !== void 0 && y(o);
  }, [o]);
  const C = p === "password", E = p === "passkey", x = P(async () => {
    if (u("credential"), A(null), !p)
      try {
        const _ = await i();
        _ ? y(_.shareAAuthMethod) : (A("No wallet enrolled"), u("error"));
      } catch (_) {
        A(_ instanceof Error ? _.message : "Failed to get wallet info"), u("error");
      }
  }, [p, i]), L = P(
    async (_) => {
      _.preventDefault(), A(null), u("unlocking");
      try {
        let B;
        if (C)
          B = { type: "password", password: w };
        else
          throw new Error("Invalid auth method");
        await a(B), u("unlocked"), e?.();
      } catch (B) {
        A(B instanceof Error ? B.message : "Failed to unlock wallet"), u("error");
      }
    },
    [C, w, a, e]
  ), f = P(async () => {
    A(null), u("unlocking");
    try {
      const _ = await l();
      if (!_) {
        u("credential");
        return;
      }
      await a(_), u("unlocked"), e?.();
    } catch (_) {
      A(_ instanceof Error ? _.message : "Failed to unlock wallet"), u("error");
    }
  }, [l, a, e]), b = P(() => {
    g(""), u("idle"), A(null), r?.();
  }, [r]), v = P(() => {
    g(""), u("credential"), A(null);
  }, []), N = d || h, T = () => {
    switch (m) {
      case "idle":
        return /* @__PURE__ */ c("div", { className: "cedros-wallet-unlock-idle", children: [
          /* @__PURE__ */ t("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ t(Rl, {}) }),
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Locked" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: "Unlock your wallet to sign transactions." }),
          /* @__PURE__ */ t(
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
        return C ? /* @__PURE__ */ c("form", { className: "cedros-wallet-unlock-form", onSubmit: L, children: [
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Enter Password" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: "Enter your wallet password to unlock." }),
          /* @__PURE__ */ t(
            ve,
            {
              label: "Password",
              value: w,
              onChange: (_) => g(_.target.value),
              disabled: N,
              autoComplete: "current-password",
              error: k ?? void 0
            }
          ),
          /* @__PURE__ */ c("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ t(
              "button",
              {
                type: "submit",
                className: "cedros-button cedros-button-primary",
                disabled: N || w.length === 0,
                children: N ? "Unlocking..." : "Unlock"
              }
            ),
            s && /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: b,
                disabled: N,
                children: "Cancel"
              }
            )
          ] })
        ] }) : E ? /* @__PURE__ */ c("div", { className: "cedros-wallet-unlock-passkey", children: [
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Verify with Passkey" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: "Use your passkey to unlock your wallet." }),
          /* @__PURE__ */ t(
            xl,
            {
              mode: "authenticate",
              isLoading: N,
              error: k ?? void 0,
              onPrompt: f,
              onRetry: f,
              onCancel: s ? b : void 0
            }
          )
        ] }) : /* @__PURE__ */ c("div", { className: "cedros-wallet-unlock-loading", children: [
          /* @__PURE__ */ t(Z, { size: "xl" }),
          /* @__PURE__ */ t("p", { children: "Loading wallet info..." })
        ] });
      case "unlocking":
        return /* @__PURE__ */ c("div", { className: "cedros-wallet-unlock-progress", children: [
          /* @__PURE__ */ t("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ t(Z, { size: "xl" }) }),
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Unlocking Wallet" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: "Verifying your credentials..." })
        ] });
      case "unlocked":
        return /* @__PURE__ */ c("div", { className: "cedros-wallet-unlock-success", children: [
          /* @__PURE__ */ t("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ t(Bl, {}) }),
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Unlocked" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: "Your wallet is ready to sign transactions." })
        ] });
      case "error":
        return /* @__PURE__ */ c("div", { className: "cedros-wallet-unlock-error", children: [
          /* @__PURE__ */ t("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ t(Il, {}) }),
          /* @__PURE__ */ t("h3", { className: "cedros-wallet-unlock-title", children: "Unlock Failed" }),
          /* @__PURE__ */ t("p", { className: "cedros-wallet-unlock-description", children: k ?? "Failed to unlock wallet. Please try again." }),
          /* @__PURE__ */ c("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary",
                onClick: v,
                children: "Try Again"
              }
            ),
            s && /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: b,
                children: "Cancel"
              }
            )
          ] })
        ] });
    }
  };
  return /* @__PURE__ */ t("div", { className: `cedros-wallet-unlock ${n}`, children: T() });
}
function Rl() {
  return /* @__PURE__ */ c("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
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
function Bl() {
  return /* @__PURE__ */ c("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
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
function Il() {
  return /* @__PURE__ */ c("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
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
function Ml() {
  const { recover: e, getShareBForRecovery: r } = nt(), { recoveryMode: s } = xo(), [o, n] = S({ step: "idle" }), [a, i] = S(!1), d = se([]), l = P(() => {
    Sn(...d.current), d.current = [];
  }, []);
  F(() => () => {
    l();
  }, [l]);
  const h = P(
    async (u, p, y) => {
      i(!0), l();
      try {
        if (n({ step: "validating" }), !ko(u))
          throw new Error("Invalid recovery phrase. Please check your words.");
        let w;
        if (s === "share_c_only") {
          const v = Mc(u);
          d.current.push(v);
          const N = Te(v), T = await r({ shareC: N }), _ = Rn(T.shareB);
          d.current.push(_), w = Ac(Ve(_), Ve(v)), d.current.push(w);
        } else
          w = Dc(u), d.current.push(w);
        const g = mo(w), k = fo(g), { shareA: A, shareB: C } = po(w);
        d.current.push(A, C), n({ step: "encrypting" });
        let E, x, L;
        if (p === "passkey") {
          const v = Pn();
          L = Te(v);
          const N = await Hr(L);
          d.current.push(N.prfOutput), E = await Tn(N.prfOutput, v), d.current.push(E);
        } else
          x = Ln(), E = await $n(y, x, pt), d.current.push(E);
        const f = await xn(A, _n(E));
        n({ step: "uploading" });
        const b = {
          solanaPubkey: k,
          shareAAuthMethod: p,
          shareACiphertext: f.ciphertext,
          shareANonce: f.nonce,
          shareB: Te(C)
        };
        p === "password" && (b.shareAKdfSalt = Te(x), b.shareAKdfParams = pt), p === "passkey" && (b.prfSalt = L), await e(b), l(), n({ step: "complete" });
      } catch (w) {
        l(), n({
          step: "error",
          error: w instanceof Error ? w.message : "Recovery failed"
        });
      } finally {
        i(!1);
      }
    },
    [e, r, s, l]
  ), m = P(() => {
    l(), n({ step: "idle" }), i(!1);
  }, [l]);
  return {
    state: o,
    startRecovery: h,
    cancel: m,
    isRecovering: a
  };
}
function Ul({
  onComplete: e,
  onCancel: r,
  className: s = "",
  defaultAuthMethod: o = "password"
}) {
  const { state: n, startRecovery: a, cancel: i, isRecovering: d } = Ml(), [l, h] = S([]), [m, u] = S(!1), [p, y] = S(o), [w, g] = S(""), [k, A] = S(""), [C, E] = S(null), x = P((N) => {
    h(N), u(!0);
  }, []), L = P(
    async (N) => {
      if (N.preventDefault(), E(null), p !== "passkey") {
        if (w !== k) {
          E("Passwords do not match");
          return;
        }
        if (p === "password" && w.length < 8) {
          E("Password must be at least 8 characters");
          return;
        }
      }
      await a(l, p, w);
    },
    [l, p, w, k, a]
  ), f = P(() => {
    i(), h([]), u(!1), g(""), A(""), r?.();
  }, [i, r]), b = P(() => {
    u(!1), g(""), A("");
  }, []), v = P(() => {
    e?.();
  }, [e]);
  return n.step === "validating" || n.step === "encrypting" || n.step === "uploading" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ c("div", { className: "cedros-wallet-recovery-progress", children: [
    /* @__PURE__ */ t("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ t(Dl, {}) }),
    /* @__PURE__ */ c("h3", { className: "cedros-wallet-recovery-title", children: [
      n.step === "validating" && "Validating Recovery Phrase",
      n.step === "encrypting" && "Encrypting Wallet",
      n.step === "uploading" && "Saving to Server"
    ] }),
    /* @__PURE__ */ c("p", { className: "cedros-wallet-recovery-description", children: [
      n.step === "validating" && "Checking your recovery phrase...",
      n.step === "encrypting" && "Securing your wallet with new encryption...",
      n.step === "uploading" && "Uploading encrypted wallet data..."
    ] })
  ] }) }) : n.step === "complete" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ c("div", { className: "cedros-wallet-recovery-success", children: [
    /* @__PURE__ */ t("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ t(Fl, {}) }),
    /* @__PURE__ */ t("h3", { className: "cedros-wallet-recovery-title", children: "Wallet Recovered" }),
    /* @__PURE__ */ c("p", { className: "cedros-wallet-recovery-description", children: [
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
        onClick: v,
        children: "Done"
      }
    ) })
  ] }) }) : n.step === "error" ? /* @__PURE__ */ t("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ c("div", { className: "cedros-wallet-recovery-error", children: [
    /* @__PURE__ */ t("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ t(Ol, {}) }),
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
  ] }) }) : m ? /* @__PURE__ */ t("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ c("form", { className: "cedros-wallet-recovery-credential", onSubmit: L, children: [
    /* @__PURE__ */ c("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-wallet-recovery-title", children: "Set New Security" }),
      /* @__PURE__ */ t("p", { className: "cedros-wallet-recovery-description", children: "Choose how to secure your recovered wallet." })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-auth-method-selector", children: [
      /* @__PURE__ */ c("label", { className: "cedros-radio-label", children: [
        /* @__PURE__ */ t(
          "input",
          {
            type: "radio",
            name: "authMethod",
            value: "password",
            checked: p === "password",
            onChange: () => y("password"),
            disabled: d
          }
        ),
        /* @__PURE__ */ t("span", { children: "Password" })
      ] }),
      /* @__PURE__ */ c("label", { className: "cedros-radio-label", children: [
        /* @__PURE__ */ t(
          "input",
          {
            type: "radio",
            name: "authMethod",
            value: "passkey",
            checked: p === "passkey",
            onChange: () => y("passkey"),
            disabled: d
          }
        ),
        /* @__PURE__ */ t("span", { children: "Passkey" })
      ] })
    ] }),
    p === "password" && /* @__PURE__ */ c(X, { children: [
      /* @__PURE__ */ c("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ t("label", { htmlFor: "recovery-password", className: "cedros-label", children: "New Password" }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "recovery-password",
            type: "password",
            className: "cedros-input",
            value: w,
            onChange: (N) => g(N.target.value),
            disabled: d,
            minLength: 8,
            placeholder: "Enter a strong password"
          }
        )
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-password-input", children: [
        /* @__PURE__ */ t("label", { htmlFor: "recovery-password-confirm", className: "cedros-label", children: "Confirm Password" }),
        /* @__PURE__ */ t(
          "input",
          {
            id: "recovery-password-confirm",
            type: "password",
            className: "cedros-input",
            value: k,
            onChange: (N) => A(N.target.value),
            disabled: d,
            "aria-invalid": C ? "true" : void 0,
            placeholder: "Confirm your password"
          }
        ),
        C && /* @__PURE__ */ t("p", { className: "cedros-input-error", role: "alert", children: C })
      ] })
    ] }),
    p === "passkey" && /* @__PURE__ */ c("div", { className: "cedros-passkey-info", children: [
      /* @__PURE__ */ t(Wl, {}),
      /* @__PURE__ */ t("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-wallet-recovery-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: b,
          disabled: d,
          children: "Back"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: d || p !== "passkey" && (w.length === 0 || k.length === 0),
          children: d ? "Recovering..." : "Recover Wallet"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ t("div", { className: `cedros-wallet-recovery ${s}`, children: /* @__PURE__ */ c("div", { className: "cedros-wallet-recovery-phrase", children: [
    /* @__PURE__ */ c("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-wallet-recovery-title", children: "Recover Your Wallet" }),
      /* @__PURE__ */ t("p", { className: "cedros-wallet-recovery-description", children: "Enter your 12-word recovery phrase to restore your wallet." })
    ] }),
    /* @__PURE__ */ t(
      wl,
      {
        onSubmit: x,
        onCancel: f,
        isSubmitting: !1
      }
    )
  ] }) });
}
function Dl() {
  return /* @__PURE__ */ c(
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
function Fl() {
  return /* @__PURE__ */ c("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
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
function Ol() {
  return /* @__PURE__ */ c("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true", children: [
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
function Wl() {
  return /* @__PURE__ */ c(
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
function ql({
  address: e,
  label: r = "Wallet Address",
  showCopy: s = !0,
  showExplorerLink: o = !0,
  allowReveal: n = !0,
  className: a = ""
}) {
  const i = He(), [d, l] = S(!1), [h, m] = S(null), [u, p] = S(!1), y = se(null), w = i?.config.solana?.network ?? "mainnet-beta", g = q(() => {
    const E = `https://explorer.solana.com/address/${e}`;
    return w === "mainnet-beta" ? E : `${E}?cluster=${encodeURIComponent(w)}`;
  }, [e, w]), k = n && e.length > 18, A = q(() => !k || u ? e : `${e.slice(0, 8)}...${e.slice(-8)}`, [e, k, u]), C = P(async () => {
    try {
      m(null), await navigator.clipboard.writeText(e), l(!0), y.current !== null && window.clearTimeout(y.current), y.current = window.setTimeout(() => {
        l(!1), y.current = null;
      }, 2e3);
    } catch (E) {
      l(!1), m(E instanceof Error ? E.message : "Copy failed");
    }
  }, [e]);
  return F(() => () => {
    y.current !== null && (window.clearTimeout(y.current), y.current = null);
  }, []), /* @__PURE__ */ c("div", { className: `cedros-wallet-address-row ${a}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-wallet-address-row-header", children: [
      /* @__PURE__ */ t("span", { className: "cedros-wallet-status-pubkey-label", children: r }),
      /* @__PURE__ */ c("div", { className: "cedros-wallet-address-row-actions", children: [
        k && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-ghost",
            onClick: () => p((E) => !E),
            "aria-label": u ? "Hide full wallet address" : "Show full wallet address",
            children: u ? /* @__PURE__ */ c("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
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
            ] }) : /* @__PURE__ */ c("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
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
            href: g,
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
            onClick: C,
            "aria-label": "Copy wallet address",
            children: d ? "Copied" : "Copy"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ t("code", { className: "cedros-wallet-status-pubkey-value", title: e, children: A }),
    h && /* @__PURE__ */ t("p", { className: "cedros-input-hint", role: "status", children: h })
  ] });
}
function zl({
  status: e,
  publicKey: r,
  onLock: s,
  onEnroll: o,
  onUnlock: n,
  onRecover: a,
  showActions: i = !0,
  compact: d = !1,
  className: l = ""
}) {
  const h = e !== void 0, m = qt(), u = h ? e : m.status, p = h ? r ?? null : m.solanaPubkey, y = h ? null : m.error, w = h ? () => {
  } : m.refresh, g = h ? () => {
  } : m.clearError, k = jl(u, y);
  return d ? /* @__PURE__ */ c("div", { className: `cedros-wallet-status cedros-wallet-status-compact ${l}`, children: [
    /* @__PURE__ */ t(
      "span",
      {
        className: `cedros-wallet-status-dot cedros-wallet-status-${k.color}`,
        title: k.label
      }
    ),
    /* @__PURE__ */ t("span", { className: "cedros-wallet-status-label", children: k.label }),
    p && /* @__PURE__ */ t("span", { className: "cedros-wallet-status-pubkey", title: p, children: $l(p) })
  ] }) : /* @__PURE__ */ c("div", { className: `cedros-wallet-status ${l}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-wallet-status-header", children: [
      /* @__PURE__ */ t(
        "div",
        {
          className: `cedros-wallet-status-icon cedros-wallet-status-icon-${k.color}`,
          children: /* @__PURE__ */ t(Vl, { status: u })
        }
      ),
      /* @__PURE__ */ c("div", { className: "cedros-wallet-status-info", children: [
        /* @__PURE__ */ t("h4", { className: "cedros-wallet-status-title", children: k.title }),
        /* @__PURE__ */ t("p", { className: "cedros-wallet-status-description", children: k.description })
      ] })
    ] }),
    p && /* @__PURE__ */ t("div", { className: "cedros-wallet-status-pubkey-full", children: /* @__PURE__ */ t(ql, { address: p }) }),
    y && /* @__PURE__ */ c("div", { className: "cedros-wallet-status-error-box", role: "alert", children: [
      /* @__PURE__ */ t("p", { children: y }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-secondary",
          onClick: g,
          children: "Dismiss"
        }
      )
    ] }),
    i && /* @__PURE__ */ c("div", { className: "cedros-wallet-status-actions", children: [
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
function jl(e, r) {
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
function $l(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function Vl({ status: e }) {
  switch (e) {
    case "loading":
      return /* @__PURE__ */ c("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
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
      return /* @__PURE__ */ c(
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
      return /* @__PURE__ */ c(
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
      return /* @__PURE__ */ c(
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
function rm({ className: e = "", showActions: r = !0 }) {
  const s = qt(), [o, n] = S("status"), a = q(() => {
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
  }, [o]), i = P(() => n("status"), []), d = P(async () => {
    n("status"), await s.refresh();
  }, [s]), l = P(async () => {
    n("status"), await s.refresh();
  }, [s]), h = P(async () => {
    n("status"), await s.refresh();
  }, [s]);
  return /* @__PURE__ */ c("div", { className: `cedros-wallet-manager ${e}`, children: [
    o !== "status" && a && /* @__PURE__ */ c("div", { className: "cedros-wallet-manager-header", children: [
      /* @__PURE__ */ c("div", { className: "cedros-wallet-manager-header-text", children: [
        /* @__PURE__ */ t("h3", { className: "cedros-wallet-manager-title", children: a.title }),
        /* @__PURE__ */ t("p", { className: "cedros-wallet-manager-subtitle", children: a.description })
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-ghost",
          onClick: i,
          children: "Back"
        }
      )
    ] }),
    o === "status" && /* @__PURE__ */ t(
      zl,
      {
        onEnroll: () => n("enroll"),
        onUnlock: () => n("unlock"),
        onRecover: () => n("recover_intro"),
        showActions: r
      }
    ),
    o === "enroll" && /* @__PURE__ */ t(
      Cl,
      {
        onComplete: () => {
          d();
        },
        onCancel: i
      }
    ),
    o === "unlock" && /* @__PURE__ */ t(
      Tl,
      {
        onUnlock: () => {
          l();
        },
        onCancel: i
      }
    ),
    o === "recover_intro" && /* @__PURE__ */ t("div", { className: "cedros-wallet-manager-intro", children: /* @__PURE__ */ c("div", { className: "cedros-wallet-manager-intro-card", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-wallet-manager-intro-title", children: "Before you start" }),
      /* @__PURE__ */ c("ul", { className: "cedros-wallet-manager-intro-list", children: [
        /* @__PURE__ */ t("li", { children: "You’ll need your 12-word recovery phrase." }),
        /* @__PURE__ */ t("li", { children: "You’ll set a new password or passkey for this wallet." }),
        /* @__PURE__ */ t("li", { children: "If you’re on a shared device, avoid copying the phrase into other apps." })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-wallet-manager-intro-actions", children: [
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
            onClick: i,
            children: "Cancel"
          }
        )
      ] })
    ] }) }),
    o === "recover" && /* @__PURE__ */ t(
      Ul,
      {
        onComplete: () => {
          h();
        },
        onCancel: i
      }
    )
  ] });
}
function sm({
  showDescriptions: e = !0,
  className: r = "",
  onSave: s
}) {
  const { settings: o, isLoading: n, isUpdating: a, error: i, fetchSettings: d, updateSettings: l } = On(), [h, m] = S({}), [u, p] = S(null), [y, w] = S(!1);
  F(() => {
    d();
  }, [d]), F(() => {
    if (y) {
      const L = setTimeout(() => w(!1), 3e3);
      return () => clearTimeout(L);
    }
  }, [y]);
  const g = P((L, f) => {
    m((b) => ({ ...b, [L]: f })), p(null), w(!1);
  }, []), k = P(async () => {
    const L = Object.entries(h).map(([f, b]) => ({
      key: f,
      value: b
    }));
    if (L.length !== 0)
      try {
        await l(L), m({}), p(null), w(!0), s?.();
      } catch (f) {
        p(f instanceof Error ? f.message : "Failed to save settings");
      }
  }, [h, l, s]), A = P(() => {
    m({}), p(null), w(!1);
  }, []), C = Object.keys(h).length > 0, E = Object.keys(h).length;
  if (n && Object.keys(o).length === 0)
    return /* @__PURE__ */ c("div", { className: `cedros-system-settings cedros-system-settings-loading ${r}`, children: [
      /* @__PURE__ */ t(Z, {}),
      /* @__PURE__ */ t("span", { children: "Loading settings..." })
    ] });
  if (i)
    return /* @__PURE__ */ t("div", { className: `cedros-system-settings ${r}`, children: /* @__PURE__ */ t(le, { error: i.message }) });
  const x = Object.keys(o).sort();
  return x.length === 0 ? /* @__PURE__ */ t("div", { className: `cedros-system-settings cedros-system-settings-empty ${r}`, children: /* @__PURE__ */ t("p", { children: "No system settings found." }) }) : /* @__PURE__ */ c("div", { className: `cedros-system-settings ${r}`, children: [
    u && /* @__PURE__ */ t(le, { error: u }),
    y && /* @__PURE__ */ t("div", { className: "cedros-settings-success", children: "Settings saved successfully." }),
    x.map((L) => /* @__PURE__ */ t(
      Hl,
      {
        category: L,
        settings: o[L],
        edits: h,
        showDescription: e,
        onChange: g
      },
      L
    )),
    /* @__PURE__ */ c("div", { className: "cedros-system-settings-actions", children: [
      C && /* @__PURE__ */ c("span", { className: "cedros-settings-change-count", children: [
        E,
        " unsaved change",
        E !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: A,
          disabled: !C || a,
          children: "Reset"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: k,
          disabled: !C || a,
          children: a ? /* @__PURE__ */ t(Z, { size: "sm" }) : "Save Changes"
        }
      )
    ] })
  ] });
}
const Fs = Object.keys(xa);
function Hl({
  category: e,
  settings: r,
  edits: s,
  showDescription: o,
  onChange: n
}) {
  const a = Sa[e] || {
    label: e,
    description: "",
    icon: ""
  }, i = q(() => [...r].sort((d, l) => {
    const h = Fs.indexOf(d.key), m = Fs.indexOf(l.key);
    return (h === -1 ? 1 / 0 : h) - (m === -1 ? 1 / 0 : m);
  }), [r]);
  return /* @__PURE__ */ c("section", { className: "cedros-settings-section", children: [
    /* @__PURE__ */ c("div", { className: "cedros-settings-section-header", children: [
      /* @__PURE__ */ t("span", { className: "cedros-settings-section-icon", children: a.icon }),
      /* @__PURE__ */ c("div", { children: [
        /* @__PURE__ */ t("h3", { className: "cedros-settings-section-title", children: a.label }),
        o && a.description && /* @__PURE__ */ t("p", { className: "cedros-settings-section-description", children: a.description })
      ] })
    ] }),
    /* @__PURE__ */ t(Qr, { settings: i, edits: s, onChange: n })
  ] });
}
const de = {
  users: /* @__PURE__ */ c(
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
  members: /* @__PURE__ */ c(
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
  deposits: /* @__PURE__ */ c(
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
  withdrawals: /* @__PURE__ */ c(
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
  wallet: /* @__PURE__ */ c(
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
  mail: /* @__PURE__ */ c(
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
  coins: /* @__PURE__ */ c(
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
  server: /* @__PURE__ */ c(
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
  image: /* @__PURE__ */ c(
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
  referrals: /* @__PURE__ */ c(
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
  )
}, Ql = [
  // Top-level menu items
  { id: "users", label: "Users", icon: de.users },
  { id: "team", label: "Team", icon: de.members },
  { id: "referrals", label: "Referrals", icon: de.referrals },
  { id: "deposits", label: "Deposits", icon: de.deposits, requiredFeature: "credits" },
  { id: "withdrawals", label: "Withdrawals", icon: de.withdrawals, requiredFeature: "credits" },
  // Compliance group
  { id: "compliance", label: "Compliance", icon: de.shield, group: "Compliance" },
  { id: "accreditation-queue", label: "Accreditation Queue", icon: de.shield, group: "Compliance" },
  { id: "sanctions", label: "Sanctions", icon: de.shield, group: "Compliance" },
  // Configuration group
  { id: "settings-auth", label: "Authentication", icon: de.key, group: "Configuration" },
  { id: "settings-messaging", label: "Auth Messages", icon: de.mail, group: "Configuration" },
  { id: "settings-wallet", label: "User Wallets", icon: de.wallet, group: "Configuration" },
  {
    id: "settings-credits",
    label: "Credit System",
    icon: de.coins,
    group: "Configuration",
    requiredFeature: "credits"
  },
  { id: "settings-compliance", label: "Compliance & Gating", icon: de.shield, group: "Configuration" },
  { id: "settings-referrals", label: "Referrals & Rewards", icon: de.referrals, group: "Configuration" },
  { id: "settings-server", label: "Auth Server", icon: de.server, group: "Configuration" },
  { id: "settings-images", label: "Image Storage", icon: de.image, group: "Configuration" }
];
function Gl(e, r) {
  return r.toUpperCase() === "SOL" ? `${(e / 1e9).toFixed(4)} SOL` : `${e} ${r}`;
}
function Os(e) {
  return e.length <= 16 ? e : `${e.slice(0, 8)}...${e.slice(-6)}`;
}
function Kl(e) {
  return new Date(e).toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const Yl = ["all", "pending", "completed", "failed", "cancelled"];
function Zl() {
  const { config: e, _internal: r } = J(), s = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, r]
  ), [o, n] = S("all"), [a, i] = S(0), d = 20, [l, h] = S(null), [m, u] = S(!1), [p, y] = S(null), [w, g] = S(null), [k, A] = S(null), C = P(async () => {
    u(!0), y(null);
    try {
      const f = new URLSearchParams();
      o !== "all" && f.set("status", o), f.set("limit", String(d)), f.set("offset", String(a * d));
      const b = await s.get(
        `/admin/referral-payouts/list?${f.toString()}`
      );
      h(b);
    } catch (f) {
      const b = j(f, "Failed to load payouts");
      y(b.message);
    } finally {
      u(!1);
    }
  }, [s, o, a]);
  F(() => {
    C();
  }, [C]);
  const E = P(
    async (f) => {
      A(f), g(null);
      try {
        const b = await s.post(
          `/admin/referral-payouts/${f}/process`,
          {}
        );
        g(`Processed: ${b.txSignature}`), C();
      } catch (b) {
        const v = j(b, "Failed to process payout");
        g(v.message);
      } finally {
        A(null);
      }
    },
    [s, C]
  ), x = P(
    async (f) => {
      A(f), g(null);
      try {
        await s.post(`/admin/referral-payouts/${f}/cancel`, {}), g("Payout cancelled."), C();
      } catch (b) {
        const v = j(b, "Failed to cancel payout");
        g(v.message);
      } finally {
        A(null);
      }
    },
    [s, C]
  ), L = l ? Math.ceil(l.total / d) : 0;
  return /* @__PURE__ */ c(X, { children: [
    /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts__filter-bar", children: [
      /* @__PURE__ */ c("label", { className: "cedros-admin-referral-payouts__filter-label", children: [
        "Status:",
        /* @__PURE__ */ t(
          "select",
          {
            value: o,
            onChange: (f) => {
              n(f.target.value), i(0);
            },
            className: "cedros-admin-referral-payouts__filter-select",
            children: Yl.map((f) => /* @__PURE__ */ t("option", { value: f, children: f.charAt(0).toUpperCase() + f.slice(1) }, f))
          }
        )
      ] }),
      l && /* @__PURE__ */ c("span", { className: "cedros-admin-referral-payouts__filter-count", children: [
        l.total,
        " total"
      ] })
    ] }),
    w && /* @__PURE__ */ t("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--info", children: w }),
    m && !l && /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts--loading", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading payouts..." })
    ] }),
    p && /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts--error", children: [
      /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: p }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: C,
          children: "Retry"
        }
      )
    ] }),
    l && l.payouts.length === 0 && /* @__PURE__ */ t("div", { className: "cedros-admin-empty-message", children: "No payouts found." }),
    l && l.payouts.length > 0 && /* @__PURE__ */ c("div", { className: "cedros-admin-list-table", role: "table", "aria-label": "All referral payouts", children: [
      /* @__PURE__ */ c("div", { className: "cedros-admin-list-thead", role: "row", children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Date" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Referrer" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Trigger" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Amount" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Status" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "TX / Error" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Actions" })
      ] }),
      l.payouts.map((f) => /* @__PURE__ */ c("div", { className: "cedros-admin-list-row", role: "row", children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: Kl(f.createdAt) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: f.referrerEmail || f.referrerName || Os(f.referrerId) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: f.triggerType }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: Gl(f.amount, f.currency) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ t("span", { className: `cedros-admin-referral-payouts__status cedros-admin-referral-payouts__status--${f.status}`, children: f.status }) }),
        /* @__PURE__ */ c("div", { className: "cedros-admin-list-td cedros-admin-list-td-mono", role: "cell", children: [
          f.txSignature && Os(f.txSignature),
          f.errorMessage && /* @__PURE__ */ t("span", { className: "cedros-admin-list-td-muted", title: f.errorMessage, children: f.errorMessage.slice(0, 40) })
        ] }),
        /* @__PURE__ */ c("div", { className: "cedros-admin-list-td", role: "cell", children: [
          (f.status === "pending" || f.status === "failed") && /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-primary cedros-button-xs",
              onClick: () => E(f.id),
              disabled: k !== null,
              children: k === f.id ? "..." : "Process"
            }
          ),
          f.status === "pending" && /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-outline cedros-button-xs",
              onClick: () => x(f.id),
              disabled: k !== null,
              style: { marginLeft: 4 },
              children: "Cancel"
            }
          )
        ] })
      ] }, f.id))
    ] }),
    L > 1 && /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts__pagination", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-xs",
          disabled: a === 0,
          onClick: () => i((f) => f - 1),
          children: "Previous"
        }
      ),
      /* @__PURE__ */ c("span", { className: "cedros-admin-referral-payouts__page-info", children: [
        "Page ",
        a + 1,
        " of ",
        L
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-xs",
          disabled: a >= L - 1,
          onClick: () => i((f) => f + 1),
          children: "Next"
        }
      )
    ] })
  ] });
}
function ar(e, r) {
  return r.toUpperCase() === "SOL" ? `${(e / 1e9).toFixed(4)} SOL` : `${e} ${r}`;
}
function Ws(e) {
  return e.length <= 16 ? e : `${e.slice(0, 8)}...${e.slice(-6)}`;
}
function Xl({ className: e = "" }) {
  const [r, s] = S("summary");
  return /* @__PURE__ */ c("div", { className: `cedros-admin-referral-payouts ${e}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts__tabs", children: [
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
    r === "summary" ? /* @__PURE__ */ t(Jl, {}) : /* @__PURE__ */ t(Zl, {})
  ] });
}
function Jl() {
  const { config: e, _internal: r } = J(), s = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, r]
  ), [o, n] = S(null), [a, i] = S(!1), [d, l] = S(null), [h, m] = S(!1), [u, p] = S(null), [y, w] = S(null), [g, k] = S(!1), [A, C] = S(null), [E, x] = S(null), [L, f] = S(null), b = P(async () => {
    i(!0), l(null);
    try {
      const U = await s.get("/admin/referral-payouts");
      n(U);
    } catch (U) {
      const W = j(U, "Failed to load referral payouts");
      l(W.message);
    } finally {
      i(!1);
    }
  }, [s]), v = P(async () => {
    try {
      const W = (await s.get("/admin/settings"))?.payout_auto_enabled?.value;
      f(W === "true");
    } catch {
    }
  }, [s]);
  F(() => {
    b(), v();
  }, [b, v]);
  const N = P(async () => {
    m(!0), p(null), w(null);
    try {
      const U = await s.post(
        "/admin/referral-payouts/process",
        {}
      );
      p(U), b();
    } catch (U) {
      const W = j(U, "Failed to process payouts");
      w(W.message);
    } finally {
      m(!1);
    }
  }, [s, b]), T = P(async () => {
    k(!0), C(null), x(null);
    try {
      const U = await s.post(
        "/admin/referral-payouts/retry-failed",
        {}
      );
      C(U), b();
    } catch (U) {
      const W = j(U, "Failed to retry failed payouts");
      x(W.message);
    } finally {
      k(!1);
    }
  }, [s, b]), _ = h || g;
  if (a && !o)
    return /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts cedros-admin-referral-payouts--loading", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading referral payouts..." })
    ] });
  if (d)
    return /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts cedros-admin-referral-payouts--error", children: [
      /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: d }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: b,
          children: "Retry"
        }
      )
    ] });
  const B = o?.referrers ?? [], R = o?.total ?? 0, I = B[0]?.currency ?? "SOL", M = B.reduce((U, W) => U + W.totalPendingAmount, 0);
  return /* @__PURE__ */ c(X, { children: [
    /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts__header", children: [
      /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts__summary", children: [
        /* @__PURE__ */ c("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Pending Referrers" }),
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: R })
        ] }),
        R > 0 && /* @__PURE__ */ c("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Total Pending Amount" }),
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: ar(M, I) })
        ] }),
        L !== null && /* @__PURE__ */ c("div", { className: "cedros-admin-stat-card", children: [
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Auto-Processing" }),
          /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: L ? "ON" : "OFF" })
        ] })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts__actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-sm",
            onClick: N,
            disabled: _ || R === 0,
            "aria-busy": h,
            children: h ? "Processing..." : "Process All Payouts"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: T,
            disabled: _,
            "aria-busy": g,
            children: g ? "Retrying..." : "Retry Failed"
          }
        )
      ] })
    ] }),
    u && /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--success", children: [
      "Processed ",
      u.processed,
      " payout(s) totalling",
      " ",
      ar(u.totalAmount, I),
      ".",
      u.failed > 0 && ` ${u.failed} failed.`,
      u.skippedNoWallet > 0 && ` ${u.skippedNoWallet} skipped (no wallet).`
    ] }),
    y && /* @__PURE__ */ t("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--error", children: y }),
    A && /* @__PURE__ */ c("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--success", children: [
      "Reset ",
      A.resetCount,
      " failed payout(s) for retry."
    ] }),
    E && /* @__PURE__ */ t("div", { className: "cedros-admin-referral-payouts__result cedros-admin-referral-payouts__result--error", children: E }),
    B.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-empty-message", children: "No pending referral payouts." }) : /* @__PURE__ */ c("div", { className: "cedros-admin-list-table", role: "table", "aria-label": "Pending referral payouts", children: [
      /* @__PURE__ */ c("div", { className: "cedros-admin-list-thead", role: "row", children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Referrer ID" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Wallet Address" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Pending Referrals" }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Total Amount" })
      ] }),
      B.map((U) => /* @__PURE__ */ c("div", { className: "cedros-admin-list-row", role: "row", children: [
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td cedros-admin-list-td-mono", role: "cell", children: /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-admin-user-uuid-link",
            onClick: () => navigator.clipboard?.writeText(U.referrerId),
            title: `Click to copy: ${U.referrerId}`,
            children: Ws(U.referrerId)
          }
        ) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: U.payoutWalletAddress ? /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-admin-user-uuid-link cedros-admin-list-td-mono",
            onClick: () => navigator.clipboard?.writeText(U.payoutWalletAddress),
            title: `Click to copy: ${U.payoutWalletAddress}`,
            children: Ws(U.payoutWalletAddress)
          }
        ) : /* @__PURE__ */ t("span", { className: "cedros-admin-list-td-muted", children: "No wallet" }) }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: U.pendingCount }),
        /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: ar(U.totalPendingAmount, U.currency) })
      ] }, U.referrerId))
    ] })
  ] });
}
function ed({ pageSize: e, currentUserId: r }) {
  const [s, o] = S(null), { statsItems: n, isLoading: a, error: i, refresh: d } = Ia();
  return s ? /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(
    Ma,
    {
      userId: s.id,
      currentUserId: r,
      onBack: () => o(null)
    }
  ) }) : /* @__PURE__ */ c("div", { className: "cedros-dashboard__section", children: [
    /* @__PURE__ */ t(jn, { stats: n, isLoading: a, onRefresh: d }),
    i && /* @__PURE__ */ t("p", { className: "cedros-admin-error-inline", children: i }),
    /* @__PURE__ */ t(
      Ua,
      {
        pageSize: e,
        currentUserId: r,
        onUserClick: (l) => o(l)
      }
    )
  ] });
}
function td({ orgId: e, currentUserId: r, hasPermission: s, role: o }) {
  const [n, a] = S("members"), {
    members: i,
    isLoading: d,
    error: l,
    fetchMembers: h,
    updateMemberRole: m,
    removeMember: u
  } = ya(e), {
    invites: p,
    isLoading: y,
    error: w,
    fetchInvites: g,
    createInvite: k,
    cancelInvite: A,
    resendInvite: C
  } = ba(e);
  F(() => {
    h(), g();
  }, [h, g]);
  const E = s("invite:create"), x = s("invite:cancel"), L = p.length, f = i.reduce(
    (T, _) => (T[_.role] = (T[_.role] ?? 0) + 1, T),
    {}
  ), b = f.owner ?? 0, v = f.admin ?? 0, N = f.member ?? 0;
  return /* @__PURE__ */ c("div", { className: "cedros-dashboard__team", children: [
    /* @__PURE__ */ t(
      jn,
      {
        stats: [
          { label: "Owners", value: b },
          { label: "Admins", value: v },
          { label: "Members", value: N },
          { label: "Pending Invites", value: L }
        ]
      }
    ),
    /* @__PURE__ */ c("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: [
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
      /* @__PURE__ */ c(
        "button",
        {
          type: "button",
          className: `cedros-admin-tab ${n === "invites" ? "cedros-admin-tab-active" : ""}`,
          onClick: () => a("invites"),
          "aria-selected": n === "invites",
          role: "tab",
          children: [
            "Pending Invites",
            L > 0 && ` (${L})`
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
    /* @__PURE__ */ c("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: [
      n === "members" && /* @__PURE__ */ t(
        va,
        {
          members: i,
          currentUserId: r,
          isLoading: d,
          error: l?.message,
          canManage: s("member:remove"),
          canChangeRoles: s("member:role_change"),
          onUpdateRole: m,
          onRemove: u
        }
      ),
      n === "invites" && /* @__PURE__ */ c("div", { className: "cedros-dashboard__invites", children: [
        E && /* @__PURE__ */ c("div", { className: "cedros-dashboard__section", children: [
          /* @__PURE__ */ t("div", { className: "cedros-dashboard__section-header", children: /* @__PURE__ */ t("h3", { className: "cedros-dashboard__section-title", children: "Send Invitation" }) }),
          /* @__PURE__ */ t(
            Aa,
            {
              onSubmit: k,
              isLoading: y,
              error: w?.message
            }
          )
        ] }),
        /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(
          Na,
          {
            invites: p,
            isLoading: y,
            error: w?.message,
            canManage: x || E,
            onCancel: x ? A : void 0,
            onResend: E ? C : void 0
          }
        ) })
      ] }),
      n === "permissions" && o === "owner" && /* @__PURE__ */ t(ka, { userRole: o })
    ] })
  ] });
}
function rd({ pageSize: e, refreshInterval: r }) {
  const [s, o] = S("");
  return /* @__PURE__ */ c("div", { className: "cedros-dashboard__deposits", children: [
    /* @__PURE__ */ t(_a, { refreshInterval: r }),
    /* @__PURE__ */ c("div", { className: "cedros-dashboard__deposits-list", children: [
      /* @__PURE__ */ t("div", { className: "cedros-dashboard__toolbar", children: /* @__PURE__ */ c("div", { className: "cedros-dashboard__filter", children: [
        /* @__PURE__ */ t("label", { className: "cedros-dashboard__filter-label", htmlFor: "status-filter", children: "Status" }),
        /* @__PURE__ */ c(
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
        La,
        {
          statusFilter: s || void 0,
          pageSize: e,
          refreshInterval: r
        }
      )
    ] })
  ] });
}
function sd({ pageSize: e, refreshInterval: r }) {
  return /* @__PURE__ */ c("div", { className: "cedros-dashboard__withdrawals", children: [
    /* @__PURE__ */ t(Pa, { refreshInterval: r }),
    /* @__PURE__ */ t("p", { className: "cedros-dashboard__text-muted", children: "Track deposits through the withdrawal pipeline: privacy period, ready for processing, and completed." }),
    /* @__PURE__ */ c("div", { className: "cedros-dashboard__pipeline", children: [
      /* @__PURE__ */ t(Ta, { pageSize: e, refreshInterval: r }),
      /* @__PURE__ */ t(Ra, { pageSize: e, refreshInterval: r }),
      /* @__PURE__ */ t(Ba, { pageSize: e, refreshInterval: r })
    ] })
  ] });
}
function nd() {
  return /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Xl, {}) });
}
const od = ["security", "rate_limit"];
function nm({ className: e }) {
  return /* @__PURE__ */ t(
    Gr,
    {
      title: "Security",
      description: "Configure CORS, cookies, sessions, JWT, and rate limiting settings.",
      categories: od,
      className: e
    }
  );
}
const qs = [
  { id: "email", label: "Email", category: "email" },
  { id: "webhooks", label: "Webhooks", category: "webhook" }
];
function ad({ className: e }) {
  const {
    settings: r,
    edits: s,
    isLoading: o,
    autosaveStatus: n,
    autosaveError: a,
    error: i,
    fetchSettings: d,
    handleChange: l,
    getEffectiveValue: h
  } = Wn(), [m, u] = S("email");
  F(() => {
    d();
  }, [d]);
  const p = qs.find((x) => x.id === m), y = p?.category ?? "", g = (h("email_provider") || "custom") === "custom", k = h("email_smtp_host"), A = !g || k != null && k !== "", C = q(() => {
    const x = r[y] ?? [];
    if (m !== "email") return x;
    const L = g ? za : ja;
    return x.filter((f) => L.includes(f.key)).sort((f, b) => L.indexOf(f.key) - L.indexOf(b.key));
  }, [r, y, m, g]), E = (x, L) => {
    if (l(x, L), x === "email_provider" && L !== "custom") {
      const f = $a[L];
      f && (l("email_smtp_host", f), l("email_smtp_port", "587"), l("email_smtp_tls", "true"));
    }
  };
  return o && Object.keys(r).length === 0 ? /* @__PURE__ */ c("div", { className: `cedros-system-settings cedros-system-settings-loading ${e ?? ""}`, children: [
    /* @__PURE__ */ t(Z, {}),
    /* @__PURE__ */ t("span", { children: "Loading settings..." })
  ] }) : i ? /* @__PURE__ */ t("div", { className: `cedros-system-settings ${e ?? ""}`, children: /* @__PURE__ */ t(le, { error: i.message }) }) : /* @__PURE__ */ c("div", { className: `cedros-system-settings ${e ?? ""}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ c("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ t("h2", { className: "cedros-settings-page-title", children: "Auth Messages" }),
        /* @__PURE__ */ t("p", { className: "cedros-settings-page-description", children: "Configure email delivery for verification emails, password resets, and instant link login. Webhook notifications can be sent to Discord or Slack." })
      ] }),
      /* @__PURE__ */ t(qn, { status: n, error: a })
    ] }),
    m === "email" && !A && /* @__PURE__ */ t("div", { className: "cedros-settings-warning-banner", children: "Email features (verification, password reset, instant link) are disabled until SMTP is configured. Select a provider or enter custom SMTP settings below." }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", children: qs.map((x) => /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: `cedros-admin-tab ${m === x.id ? "cedros-admin-tab-active" : ""}`,
        onClick: () => u(x.id),
        "aria-selected": m === x.id,
        role: "tab",
        children: x.label
      },
      x.id
    )) }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-tab-content", role: "tabpanel", children: C.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ c("p", { children: [
      "No settings found for ",
      p?.label ?? "this section",
      "."
    ] }) }) : /* @__PURE__ */ t(
      Qr,
      {
        settings: C,
        edits: s,
        onChange: m === "email" ? E : l
      }
    ) })
  ] });
}
const ir = [
  "image_storage_enabled",
  "image_storage_provider",
  "image_storage_bucket",
  "image_storage_region",
  "image_storage_endpoint",
  "image_storage_access_key",
  "image_storage_secret_key",
  "image_storage_cdn_url"
], zs = {
  nyc3: "https://nyc3.digitaloceanspaces.com",
  ams3: "https://ams3.digitaloceanspaces.com",
  sgp1: "https://sgp1.digitaloceanspaces.com",
  sfo3: "https://sfo3.digitaloceanspaces.com",
  fra1: "https://fra1.digitaloceanspaces.com",
  syd1: "https://syd1.digitaloceanspaces.com"
};
function id({ className: e }) {
  const {
    settings: r,
    edits: s,
    isLoading: o,
    autosaveStatus: n,
    autosaveError: a,
    error: i,
    fetchSettings: d,
    handleChange: l,
    getEffectiveValue: h
  } = Wn();
  F(() => {
    d();
  }, [d]);
  const m = q(() => (r.image_storage ?? []).filter((y) => ir.includes(y.key)).sort((y, w) => ir.indexOf(y.key) - ir.indexOf(w.key)), [r]), u = (p, y) => {
    if (l(p, y), p === "image_storage_provider")
      if (y === "digitalocean") {
        const w = h("image_storage_region") || "nyc3";
        l("image_storage_region", w), l("image_storage_endpoint", zs[w] ?? `https://${w}.digitaloceanspaces.com`);
      } else y === "s3" && l("image_storage_endpoint", "");
    p === "image_storage_region" && h("image_storage_provider") === "digitalocean" && l("image_storage_endpoint", zs[y] ?? `https://${y}.digitaloceanspaces.com`);
  };
  return o && Object.keys(r).length === 0 ? /* @__PURE__ */ c("div", { className: `cedros-system-settings cedros-system-settings-loading ${e ?? ""}`, children: [
    /* @__PURE__ */ t(Z, {}),
    /* @__PURE__ */ t("span", { children: "Loading settings..." })
  ] }) : i ? /* @__PURE__ */ t("div", { className: `cedros-system-settings ${e ?? ""}`, children: /* @__PURE__ */ t(le, { error: i.message }) }) : /* @__PURE__ */ c("div", { className: `cedros-system-settings ${e ?? ""}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-settings-page-header", children: [
      /* @__PURE__ */ c("div", { className: "cedros-settings-page-header-content", children: [
        /* @__PURE__ */ t("h2", { className: "cedros-settings-page-title", children: "Image Storage" }),
        /* @__PURE__ */ t("p", { className: "cedros-settings-page-description", children: "Configure S3-compatible object storage for user avatars and images. Supports AWS S3, DigitalOcean Spaces, and other S3-compatible providers." })
      ] }),
      /* @__PURE__ */ t(qn, { status: n, error: a })
    ] }),
    m.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-system-settings-empty", children: /* @__PURE__ */ t("p", { children: "No image storage settings found." }) }) : /* @__PURE__ */ t(
      Qr,
      {
        settings: m,
        edits: s,
        onChange: u
      }
    )
  ] });
}
const cd = ["kyc", "accreditation", "sanctions", "token_gating"];
function ld({ className: e }) {
  return /* @__PURE__ */ t(
    Gr,
    {
      title: "Compliance & Gating",
      description: "Configure KYC identity verification, accredited investor verification, sanctions screening, and Solana token gating.",
      categories: cd,
      className: e
    }
  );
}
const dd = ["referral"];
function ud({ className: e }) {
  return /* @__PURE__ */ t(
    Gr,
    {
      title: "Referrals & Rewards",
      description: "Configure referral reward types, amounts, triggers, per-referrer caps, and automated payout processing.",
      categories: dd,
      className: e
    }
  );
}
function hd() {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
function md(e) {
  if (!e) return [];
  try {
    const r = JSON.parse(e);
    return Array.isArray(r) ? r : [];
  } catch {
    return [];
  }
}
function fd(e) {
  switch (e) {
    case "nft_collection":
      return "NFT Collection";
    case "fungible_token":
      return "Fungible Token";
    case "any_nft":
      return "Any NFT";
  }
}
function pd(e) {
  switch (e) {
    case "all":
      return "All";
    case "deposits":
      return "Deposits";
    case "withdrawals":
      return "Withdrawals";
  }
}
const js = {
  name: "",
  ruleType: "nft_collection",
  collectionAddress: "",
  mintAddress: "",
  minQuantity: "",
  minAmount: "",
  enforcement: "all"
};
function gd(e) {
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
function wd(e, r) {
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
function yd({ className: e = "" }) {
  const { fetchSettings: r, updateSettings: s, getValue: o, isLoading: n, error: a } = On(), [i, d] = S([]), [l, h] = S(null), [m, u] = S(!1), [p, y] = S(js), [w, g] = S(null), [k, A] = S(!1);
  F(() => {
    r();
  }, [r]);
  const C = o("token_gating_rules"), E = q(() => md(C), [C]);
  F(() => {
    d(E);
  }, [E]);
  const x = P(
    async (_) => {
      A(!0), g(null);
      try {
        await s([{ key: "token_gating_rules", value: JSON.stringify(_) }]), d(_);
      } catch (B) {
        g(B instanceof Error ? B.message : "Failed to save rules");
      } finally {
        A(!1);
      }
    },
    [s]
  ), L = P(() => {
    h(null), y(js), g(null), u(!0);
  }, []), f = P((_) => {
    h(_.id), y(gd(_)), g(null), u(!0);
  }, []), b = P(
    (_) => {
      const B = i.filter((R) => R.id !== _);
      x(B);
    },
    [i, x]
  ), v = P(() => {
    u(!1), g(null);
  }, []), N = P(async () => {
    if (!p.name.trim()) {
      g("Rule name is required.");
      return;
    }
    const _ = l ?? hd(), B = wd(p, _), R = l ? i.map((I) => I.id === l ? B : I) : [...i, B];
    await x(R), w || u(!1);
  }, [p, l, i, x, w]), T = P((_, B) => {
    y((R) => ({ ...R, [_]: B }));
  }, []);
  return n && i.length === 0 ? /* @__PURE__ */ c("div", { className: `cedros-admin-token-gate ${e} cedros-admin-token-gate--loading`, children: [
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading token gate rules..." })
  ] }) : a && i.length === 0 ? /* @__PURE__ */ c("div", { className: `cedros-admin-token-gate ${e} cedros-admin-token-gate--error`, children: [
    /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: a.message }),
    /* @__PURE__ */ t("button", { type: "button", className: "cedros-button cedros-button-outline cedros-button-sm", onClick: r, children: "Retry" })
  ] }) : /* @__PURE__ */ c("div", { className: `cedros-admin-token-gate ${e}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-admin-token-gate__header", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-admin-token-gate__title", children: "Token Gate Rules" }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: L,
          disabled: m,
          children: "Add Rule"
        }
      )
    ] }),
    m && /* @__PURE__ */ t(
      bd,
      {
        form: p,
        isNew: l === null,
        isSaving: k,
        saveError: w,
        onFieldChange: T,
        onSave: N,
        onCancel: v
      }
    ),
    i.length === 0 && !m ? /* @__PURE__ */ t("div", { className: "cedros-admin-empty-message", children: "No token gate rules configured." }) : /* @__PURE__ */ c(
      "div",
      {
        className: "cedros-admin-list-table",
        role: "table",
        "aria-label": "Token gate rules",
        children: [
          /* @__PURE__ */ c("div", { className: "cedros-admin-list-thead", role: "row", children: [
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Name" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Type" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Address / Mint" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Min Qty / Amount" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Enforcement" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Actions" })
          ] }),
          i.map((_) => /* @__PURE__ */ c("div", { className: "cedros-admin-list-row", role: "row", children: [
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: _.name }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: fd(_.ruleType) }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-td cedros-admin-list-td-mono", role: "cell", children: _.collectionAddress || _.mintAddress || "—" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: _.minQuantity !== void 0 ? _.minQuantity : _.minAmount ?? "—" }),
            /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: pd(_.enforcement) }),
            /* @__PURE__ */ c("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", role: "cell", children: [
              /* @__PURE__ */ t(
                "button",
                {
                  type: "button",
                  className: "cedros-button cedros-button-outline cedros-button-sm",
                  onClick: () => f(_),
                  disabled: m,
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ t(
                "button",
                {
                  type: "button",
                  className: "cedros-button cedros-button-danger cedros-button-sm",
                  onClick: () => b(_.id),
                  disabled: k || m,
                  children: "Delete"
                }
              )
            ] })
          ] }, _.id))
        ]
      }
    )
  ] });
}
function bd({ form: e, isNew: r, isSaving: s, saveError: o, onFieldChange: n, onSave: a, onCancel: i }) {
  const d = e.ruleType === "nft_collection", l = e.ruleType === "fungible_token", h = e.ruleType !== "fungible_token", m = e.ruleType === "fungible_token";
  return /* @__PURE__ */ c("div", { className: "cedros-admin-token-gate__form", role: "region", "aria-label": r ? "Add rule" : "Edit rule", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-admin-token-gate__form-title", children: r ? "Add Rule" : "Edit Rule" }),
    /* @__PURE__ */ c("div", { className: "cedros-admin-form-row", children: [
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
    /* @__PURE__ */ c("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "tg-type", children: "Type" }),
      /* @__PURE__ */ c(
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
    d && /* @__PURE__ */ c("div", { className: "cedros-admin-form-row", children: [
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
    l && /* @__PURE__ */ c("div", { className: "cedros-admin-form-row", children: [
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
    h && /* @__PURE__ */ c("div", { className: "cedros-admin-form-row", children: [
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
    m && /* @__PURE__ */ c("div", { className: "cedros-admin-form-row", children: [
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
    /* @__PURE__ */ c("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "tg-enforcement", children: "Enforcement" }),
      /* @__PURE__ */ c(
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
    /* @__PURE__ */ c("div", { className: "cedros-admin-token-gate__form-actions", children: [
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
          onClick: i,
          disabled: s,
          children: "Cancel"
        }
      )
    ] })
  ] });
}
function vd(e) {
  return new Date(e).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function Ad(e) {
  return {
    income: "Income",
    net_worth: "Net Worth",
    credential: "Credential",
    third_party_letter: "Third-Party Letter",
    insider: "Insider / Executive",
    investment_threshold: "Investment Threshold"
  }[e] ?? e;
}
function Nd(e) {
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
function kd({
  item: e,
  isExpanded: r,
  detail: s,
  detailLoading: o,
  detailError: n,
  reviewNotes: a,
  rejectionReason: i,
  isReviewing: d,
  reviewError: l,
  onRowClick: h,
  onDocumentDownload: m,
  onReviewNotesChange: u,
  onRejectionReasonChange: p,
  onReview: y
}) {
  const w = e.statedAmountUsd !== void 0 ? `$${e.statedAmountUsd.toLocaleString()}` : e.investmentCommitmentUsd !== void 0 ? `$${e.investmentCommitmentUsd.toLocaleString()}` : "—";
  return /* @__PURE__ */ c(X, { children: [
    /* @__PURE__ */ c(
      "div",
      {
        className: `cedros-admin-list-row cedros-admin-list-row--clickable ${r ? "cedros-admin-list-row--expanded" : ""}`,
        role: "row",
        onClick: () => h(e.id),
        onKeyDown: (g) => {
          (g.key === "Enter" || g.key === " ") && (g.preventDefault(), h(e.id));
        },
        tabIndex: 0,
        "aria-expanded": r,
        children: [
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: e.userEmail ?? /* @__PURE__ */ c("span", { className: "cedros-admin-list-td-mono", children: [
            e.userId.slice(0, 12),
            "..."
          ] }) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: Ad(e.method) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: w }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: vd(e.createdAt) }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-td", role: "cell", children: /* @__PURE__ */ t("span", { className: `cedros-admin-badge ${Nd(e.status)}`, children: e.status }) })
        ]
      }
    ),
    r && /* @__PURE__ */ c("div", { className: "cedros-admin-accreditation-queue__detail", role: "region", "aria-label": "Submission detail", children: [
      o && /* @__PURE__ */ c("div", { className: "cedros-admin-accreditation-queue__detail-loading", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading detail..." })
      ] }),
      n && /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: n }),
      s && /* @__PURE__ */ c(X, { children: [
        /* @__PURE__ */ t(Cd, { detail: s, onDocumentDownload: m }),
        e.status === "pending" && /* @__PURE__ */ t(
          Ed,
          {
            submissionId: e.id,
            notes: a,
            rejectionReason: i,
            isReviewing: d,
            error: l,
            onNotesChange: u,
            onRejectionReasonChange: p,
            onReview: y
          }
        )
      ] })
    ] })
  ] });
}
function Cd({ detail: e, onDocumentDownload: r }) {
  return /* @__PURE__ */ c("div", { className: "cedros-admin-accreditation-queue__detail-fields", children: [
    e.incomeType && /* @__PURE__ */ c("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "Income Type" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-value", children: e.incomeType })
    ] }),
    e.statedAmountUsd !== void 0 && /* @__PURE__ */ c("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "Stated Amount" }),
      /* @__PURE__ */ c("span", { className: "cedros-admin-detail-value", children: [
        "$",
        e.statedAmountUsd.toLocaleString()
      ] })
    ] }),
    e.crdNumber && /* @__PURE__ */ c("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "CRD Number" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-value cedros-admin-list-td-mono", children: e.crdNumber })
    ] }),
    e.licenseType && /* @__PURE__ */ c("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "License Type" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-value", children: e.licenseType })
    ] }),
    e.investmentCommitmentUsd !== void 0 && /* @__PURE__ */ c("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "Investment Commitment" }),
      /* @__PURE__ */ c("span", { className: "cedros-admin-detail-value", children: [
        "$",
        e.investmentCommitmentUsd.toLocaleString()
      ] })
    ] }),
    e.entityType && /* @__PURE__ */ c("div", { className: "cedros-admin-detail-row", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "Entity Type" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-value", children: e.entityType })
    ] }),
    e.userStatement && /* @__PURE__ */ c("div", { className: "cedros-admin-detail-row cedros-admin-detail-row--block", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-detail-label", children: "User Statement" }),
      /* @__PURE__ */ t("p", { className: "cedros-admin-detail-statement", children: e.userStatement })
    ] }),
    e.documents.length > 0 && /* @__PURE__ */ c("div", { className: "cedros-admin-accreditation-queue__documents", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-admin-accreditation-queue__documents-title", children: "Documents" }),
      e.documents.map((s) => /* @__PURE__ */ c("div", { className: "cedros-admin-accreditation-queue__document-row", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-accreditation-queue__document-name", children: s.originalFilename ?? s.documentType }),
        s.fileSizeBytes && /* @__PURE__ */ c("span", { className: "cedros-admin-list-td-muted", children: [
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
function Ed({
  submissionId: e,
  notes: r,
  rejectionReason: s,
  isReviewing: o,
  error: n,
  onNotesChange: a,
  onRejectionReasonChange: i,
  onReview: d
}) {
  return /* @__PURE__ */ c("div", { className: "cedros-admin-accreditation-queue__review-form", children: [
    /* @__PURE__ */ t("h4", { className: "cedros-admin-accreditation-queue__review-title", children: "Review Decision" }),
    /* @__PURE__ */ c("div", { className: "cedros-admin-form-row", children: [
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
    /* @__PURE__ */ c("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ t("label", { className: "cedros-admin-form-label", htmlFor: "rejection-reason", children: "Rejection Reason (required if rejecting)" }),
      /* @__PURE__ */ t(
        "textarea",
        {
          id: "rejection-reason",
          className: "cedros-admin-form-textarea",
          value: s,
          onChange: (l) => i(l.target.value),
          rows: 2,
          placeholder: "Reason shown to user"
        }
      )
    ] }),
    n && /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: n }),
    /* @__PURE__ */ c("div", { className: "cedros-admin-accreditation-queue__review-actions", children: [
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
const ht = 20;
function Sd({ className: e = "" }) {
  const { config: r, _internal: s } = J(), o = q(
    () => new zn(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      s?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, s]
  ), [n, a] = S("pending"), [i, d] = S([]), [l, h] = S(0), [m, u] = S(0), [p, y] = S(!1), [w, g] = S(null), [k, A] = S(null), [C, E] = S(null), [x, L] = S(!1), [f, b] = S(null), [v, N] = S(""), [T, _] = S(""), [B, R] = S(!1), [I, M] = S(null), [U, W] = S(null), z = P(async () => {
    y(!0), g(null);
    try {
      const Q = await o.listPendingAccreditations(ht, m);
      d(Q.items), h(Q.total);
    } catch (Q) {
      g(Q instanceof Error ? Q.message : "Failed to load submissions");
    } finally {
      y(!1);
    }
  }, [o, n, m]);
  F(() => {
    z();
  }, [z]), F(() => {
    u(0), A(null), E(null);
  }, [n]);
  const $ = P(
    async (Q) => {
      if (k === Q) {
        A(null), E(null);
        return;
      }
      A(Q), E(null), b(null), N(""), _(""), M(null), W(null), L(!0);
      try {
        const te = await o.getAccreditationSubmission(Q);
        E(te);
      } catch (te) {
        b(te instanceof Error ? te.message : "Failed to load submission detail");
      } finally {
        L(!1);
      }
    },
    [k, o]
  ), D = P(
    async (Q) => {
      try {
        const te = await o.getAccreditationDocumentUrl(Q);
        window.open(te, "_blank", "noopener,noreferrer");
      } catch (te) {
        M(te instanceof Error ? te.message : "Failed to get document URL");
      }
    },
    [o]
  ), O = P(
    async (Q, te) => {
      if (!te && !T.trim()) {
        M("Rejection reason is required.");
        return;
      }
      R(!0), M(null), W(null);
      try {
        await o.reviewAccreditation(
          Q,
          te,
          v.trim() || void 0,
          te ? void 0 : T.trim()
        ), W(te ? "Submission approved." : "Submission rejected."), A(null), E(null), z();
      } catch (G) {
        M(G instanceof Error ? G.message : "Failed to submit review");
      } finally {
        R(!1);
      }
    },
    [o, v, T, z]
  ), H = Math.ceil(l / ht), ee = Math.floor(m / ht) + 1, ie = n === "pending" ? l : i.filter((Q) => Q.status === "pending").length;
  return /* @__PURE__ */ c("div", { className: `cedros-admin-accreditation-queue ${e}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-admin-accreditation-queue__header", children: [
      /* @__PURE__ */ c("h2", { className: "cedros-admin-accreditation-queue__title", children: [
        "Accreditation Review Queue",
        ie > 0 && /* @__PURE__ */ t("span", { className: "cedros-admin-queue-count", "aria-label": `${ie} pending`, children: ie })
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
    /* @__PURE__ */ c("div", { className: "cedros-admin-tabs cedros-admin-tabs--line", role: "tablist", children: [
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
    w && /* @__PURE__ */ c("div", { className: "cedros-admin-accreditation-queue cedros-admin-accreditation-queue--error", children: [
      /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: w }),
      /* @__PURE__ */ t("button", { type: "button", className: "cedros-button cedros-button-outline cedros-button-sm", onClick: z, children: "Retry" })
    ] }),
    !w && p && i.length === 0 ? /* @__PURE__ */ c("div", { className: "cedros-admin-accreditation-queue--loading", children: [
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
      /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading submissions..." })
    ] }) : /* @__PURE__ */ t("div", { role: "tabpanel", children: i.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-admin-empty-message", children: "No submissions found." }) : /* @__PURE__ */ c(X, { children: [
      /* @__PURE__ */ c("div", { className: "cedros-admin-list-table", role: "table", "aria-label": "Accreditation submissions", children: [
        /* @__PURE__ */ c("div", { className: "cedros-admin-list-thead", role: "row", children: [
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "User" }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Method" }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Amount" }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Submitted" }),
          /* @__PURE__ */ t("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Status" })
        ] }),
        i.map((Q) => /* @__PURE__ */ t(
          kd,
          {
            item: Q,
            isExpanded: k === Q.id,
            detail: k === Q.id ? C : null,
            detailLoading: k === Q.id && x,
            detailError: k === Q.id ? f : null,
            reviewNotes: v,
            rejectionReason: T,
            isReviewing: B,
            reviewError: k === Q.id ? I : null,
            onRowClick: $,
            onDocumentDownload: D,
            onReviewNotesChange: N,
            onRejectionReasonChange: _,
            onReview: O
          },
          Q.id
        ))
      ] }),
      H > 1 && /* @__PURE__ */ c("div", { className: "cedros-admin-pagination", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => u(Math.max(0, m - ht)),
            disabled: ee <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ c("span", { className: "cedros-admin-page-info", children: [
          "Page ",
          ee,
          " of ",
          H,
          " (",
          l,
          " total)"
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => u(m + ht),
            disabled: ee >= H,
            children: "Next"
          }
        )
      ] })
    ] }) })
  ] });
}
function xd(e) {
  return e === void 0 ? "—" : e < 60 ? `${e}s` : e < 3600 ? `${Math.floor(e / 60)}m ${e % 60}s` : `${Math.floor(e / 3600)}h ${Math.floor(e % 3600 / 60)}m`;
}
function _d(e) {
  return e ? new Date(e).toLocaleString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "—";
}
function Ld({ className: e = "" }) {
  const { config: r, _internal: s } = J(), o = q(
    () => new zn(
      r.serverUrl,
      r.requestTimeout,
      r.retryAttempts,
      s?.getAccessToken
    ),
    [r.serverUrl, r.requestTimeout, r.retryAttempts, s]
  ), [n, a] = S(null), [i, d] = S(!1), [l, h] = S(null), [m, u] = S(!1), [p, y] = S(null), [w, g] = S(!1), k = P(async () => {
    d(!0), h(null);
    try {
      const C = await o.getSanctionsStats();
      a(C);
    } catch (C) {
      h(C instanceof Error ? C.message : "Failed to load sanctions stats");
    } finally {
      d(!1);
    }
  }, [o]);
  F(() => {
    k();
  }, [k]);
  const A = P(async () => {
    u(!0), y(null), g(!1);
    try {
      await o.refreshSanctions(), g(!0), await k();
    } catch (C) {
      y(C instanceof Error ? C.message : "Failed to refresh sanctions cache");
    } finally {
      u(!1);
    }
  }, [o, k]);
  return i && !n ? /* @__PURE__ */ c("div", { className: `cedros-admin-sanctions-panel ${e} cedros-admin-sanctions-panel--loading`, children: [
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ t("span", { className: "cedros-admin-loading-text", children: "Loading sanctions stats..." })
  ] }) : l && !n ? /* @__PURE__ */ c("div", { className: `cedros-admin-sanctions-panel ${e} cedros-admin-sanctions-panel--error`, children: [
    /* @__PURE__ */ t("p", { className: "cedros-admin-error", children: l }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-sm",
        onClick: k,
        children: "Retry"
      }
    )
  ] }) : /* @__PURE__ */ c("div", { className: `cedros-admin-sanctions-panel ${e}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-admin-sanctions-panel__header", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-admin-sanctions-panel__title", children: "Sanctions Screening" }),
      /* @__PURE__ */ c("div", { className: "cedros-admin-sanctions-panel__header-actions", children: [
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
            onClick: k,
            disabled: i,
            title: "Refresh stats",
            "aria-label": "Refresh stats",
            children: i ? "..." : "↻"
          }
        )
      ] })
    ] }),
    n !== null && /* @__PURE__ */ c("div", { className: "cedros-admin-sanctions-panel__stats", children: [
      /* @__PURE__ */ c("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Sanctioned Addresses" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: n.sanctionedAddresses.toLocaleString() })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Sanctioned Countries" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: n.sanctionedCountries.toLocaleString() })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Cache Age" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: xd(n.cacheAgeSeconds) })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-admin-stat-card", children: [
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-label", children: "Last Refresh" }),
        /* @__PURE__ */ t("span", { className: "cedros-admin-stat-value", children: _d(n.lastRefreshedAt) })
      ] })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-admin-sanctions-panel__actions", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-sm",
        onClick: A,
        disabled: m || i,
        "aria-busy": m,
        children: m ? "Refreshing..." : "Force Refresh"
      }
    ) }),
    w && /* @__PURE__ */ t("div", { className: "cedros-admin-sanctions-panel__result cedros-admin-sanctions-panel__result--success", children: "Sanctions cache refreshed successfully." }),
    p && /* @__PURE__ */ t("div", { className: "cedros-admin-sanctions-panel__result cedros-admin-sanctions-panel__result--error", children: p }),
    l && n && /* @__PURE__ */ t("p", { className: "cedros-admin-error cedros-admin-error--inline", children: l })
  ] });
}
class Pd {
  client;
  constructor(r, s, o) {
    this.client = new ae({ baseUrl: r, timeoutMs: s, retryAttempts: o });
  }
  /**
   * Check if initial setup is required
   * Returns whether the system needs initial setup (no admin exists)
   */
  async getStatus() {
    try {
      return await this.client.get("/setup/status");
    } catch (r) {
      throw j(r, "Failed to check setup status");
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
      throw j(s, "Failed to create admin account");
    }
  }
}
function _o() {
  const { config: e } = J(), [r, s] = S(null), [o, n] = S(!1), [a, i] = S(!1), [d, l] = S(null), h = se(0), m = q(
    () => new Pd(e.serverUrl, e.requestTimeout, e.retryAttempts),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), u = se(m);
  u.current = m;
  const p = P(async () => {
    n(!0), l(null);
    const w = ++h.current;
    try {
      const g = await u.current.getStatus();
      if (w !== h.current) return;
      s(g);
    } catch (g) {
      if (w !== h.current) return;
      l(g instanceof Error ? g : new Error("Failed to check setup status"));
    } finally {
      w === h.current && n(!1);
    }
  }, []), y = P(
    async (w) => {
      i(!0), l(null);
      try {
        const g = await u.current.createFirstAdmin(w);
        return await p(), g;
      } catch (g) {
        const k = g instanceof Error ? g : new Error("Failed to create admin");
        throw l(k), k;
      } finally {
        i(!1);
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
    createAdmin: y
  };
}
const Td = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, $s = 8;
function Rd(e) {
  const r = {};
  return e.email ? Td.test(e.email) || (r.email = "Invalid email format") : r.email = "Email is required", e.password ? e.password.length < $s && (r.password = `Password must be at least ${$s} characters`) : r.password = "Password is required", e.confirmPassword ? e.password !== e.confirmPassword && (r.confirmPassword = "Passwords do not match") : r.confirmPassword = "Please confirm your password", r;
}
function Bd({ onComplete: e, className: r = "" }) {
  const { status: s, isLoading: o, isCreating: n, error: a, checkStatus: i, createAdmin: d } = _o(), [l, h] = S({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    orgName: ""
  }), [m, u] = S({}), [p, y] = S(!1);
  F(() => {
    i();
  }, [i]);
  const w = P(
    (k) => (A) => {
      h((C) => ({ ...C, [k]: A.target.value })), u((C) => ({ ...C, [k]: void 0 }));
    },
    []
  ), g = P(
    async (k) => {
      k.preventDefault();
      const A = Rd(l);
      if (Object.keys(A).length > 0) {
        u(A);
        return;
      }
      try {
        await d({
          email: l.email,
          password: l.password,
          name: l.name || void 0,
          orgName: l.orgName || void 0
        }), y(!0), e?.();
      } catch {
      }
    },
    [l, d, e]
  );
  return o ? /* @__PURE__ */ t("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ c("div", { className: "cedros-setup__loading", children: [
    /* @__PURE__ */ t(Z, {}),
    /* @__PURE__ */ t("span", { className: "cedros-setup__loading-text", children: "Checking setup status..." })
  ] }) }) : s && !s.needsSetup ? /* @__PURE__ */ t("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ c("div", { className: "cedros-setup__complete", children: [
    /* @__PURE__ */ t("div", { className: "cedros-setup__icon cedros-setup__icon--success", children: /* @__PURE__ */ c(
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
  ] }) }) : p ? /* @__PURE__ */ t("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ c("div", { className: "cedros-setup__complete", children: [
    /* @__PURE__ */ t("div", { className: "cedros-setup__icon cedros-setup__icon--success", children: /* @__PURE__ */ c(
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
  ] }) }) : /* @__PURE__ */ t("div", { className: `cedros-setup ${r}`, children: /* @__PURE__ */ c("div", { className: "cedros-setup__container", children: [
    /* @__PURE__ */ c("div", { className: "cedros-setup__header", children: [
      /* @__PURE__ */ t("div", { className: "cedros-setup__logo", children: /* @__PURE__ */ c(
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
    /* @__PURE__ */ c("form", { className: "cedros-setup__form", onSubmit: g, children: [
      a && /* @__PURE__ */ t(le, { error: a.message }),
      /* @__PURE__ */ c("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ c("label", { htmlFor: "setup-email", className: "cedros-setup__label", children: [
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
      /* @__PURE__ */ c("div", { className: "cedros-setup__field", children: [
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
      /* @__PURE__ */ c("div", { className: "cedros-setup__field", children: [
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
      /* @__PURE__ */ c("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ c("label", { htmlFor: "setup-password", className: "cedros-setup__label", children: [
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
      /* @__PURE__ */ c("div", { className: "cedros-setup__field", children: [
        /* @__PURE__ */ c("label", { htmlFor: "setup-confirm-password", className: "cedros-setup__label", children: [
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
      /* @__PURE__ */ t("button", { type: "submit", className: "cedros-setup__button", disabled: n, children: n ? /* @__PURE__ */ c(X, { children: [
        /* @__PURE__ */ t(Z, {}),
        /* @__PURE__ */ t("span", { children: "Creating Account..." })
      ] }) : "Create Admin Account" })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-setup__footer", children: [
      /* @__PURE__ */ t("p", { className: "cedros-setup__note", children: "This will be the first administrator account for your installation." }),
      s?.serverVersion && /* @__PURE__ */ c("p", { className: "cedros-setup__version", children: [
        "Server version: ",
        s.serverVersion
      ] })
    ] })
  ] }) });
}
function om({
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
    "settings-wallet",
    "settings-auth",
    "settings-messaging",
    "settings-credits",
    "settings-compliance",
    "settings-referrals",
    "settings-server",
    "settings-images"
  ],
  defaultSection: s = "users",
  refreshInterval: o = 0,
  pageSize: n = 20,
  onSectionChange: a,
  onSettingsClick: i,
  onLogoutClick: d,
  className: l = ""
}) {
  const [h, m] = S(s), [u, p] = S(!0), { user: y, logout: w } = J(), { activeOrg: g, role: k, isLoading: A, fetchOrgs: C, hasPermission: E } = Da(), { status: x, isLoading: L, checkStatus: f } = _o(), { features: b, isLoading: v } = Ca(), { canAccess: N } = Ea(), T = P(
    (M) => {
      m(M), a?.(M);
    },
    [a]
  ), _ = Ql.filter((M) => !(!r.includes(M.id) || M.requiredFeature && !b[M.requiredFeature] || !N(M.id))), B = _.find((M) => M.id === h), R = !B && !v;
  return F(() => {
    C(), f();
  }, [C, f]), F(() => {
    R && _.length > 0 && m("users");
  }, [R, _.length]), !L && x?.needsSetup ? /* @__PURE__ */ t("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--setup ${l}`, children: /* @__PURE__ */ t(Bd, { onComplete: () => f() }) }) : (A || L || v) && !g ? /* @__PURE__ */ c("div", { className: `cedros-admin cedros-dashboard cedros-dashboard--loading ${l}`, children: [
    /* @__PURE__ */ t(Z, {}),
    /* @__PURE__ */ t("span", { className: "cedros-dashboard__loading-text", children: "Loading..." })
  ] }) : h === "team" && !g ? /* @__PURE__ */ t("div", { className: `cedros-admin cedros-dashboard ${l}`, children: /* @__PURE__ */ t(le, { error: "No organization selected. Please select an organization first." }) }) : /* @__PURE__ */ c("div", { className: `cedros-admin cedros-dashboard ${l}`, children: [
    /* @__PURE__ */ c("aside", { className: "cedros-dashboard__sidebar", children: [
      /* @__PURE__ */ t("div", { className: "cedros-dashboard__sidebar-header", children: /* @__PURE__ */ c("div", { className: "cedros-dashboard__logo", children: [
        de.wallet,
        /* @__PURE__ */ t("span", { className: "cedros-dashboard__logo-text", children: e })
      ] }) }),
      /* @__PURE__ */ c("nav", { className: "cedros-dashboard__nav", children: [
        /* @__PURE__ */ c("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ t("span", { className: "cedros-dashboard__nav-label", children: "Menu" }),
          _.filter((M) => !M.group).map((M) => /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${h === M.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => T(M.id),
              "aria-current": h === M.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ t("span", { className: "cedros-dashboard__nav-icon", children: M.icon }),
                /* @__PURE__ */ t("span", { className: "cedros-dashboard__nav-text", children: M.label })
              ]
            },
            M.id
          ))
        ] }),
        _.some((M) => M.group === "Configuration") && /* @__PURE__ */ c("div", { className: "cedros-dashboard__nav-group", children: [
          /* @__PURE__ */ c(
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
                    children: de.chevronRight
                  }
                )
              ]
            }
          ),
          u && _.filter((M) => M.group === "Configuration").map((M) => /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              className: `cedros-dashboard__nav-item ${h === M.id ? "cedros-dashboard__nav-item--active" : ""}`,
              onClick: () => T(M.id),
              "aria-current": h === M.id ? "page" : void 0,
              children: [
                /* @__PURE__ */ t("span", { className: "cedros-dashboard__nav-icon", children: M.icon }),
                /* @__PURE__ */ t("span", { className: "cedros-dashboard__nav-text", children: M.label })
              ]
            },
            M.id
          ))
        ] })
      ] }),
      y && /* @__PURE__ */ t("div", { className: "cedros-dashboard__sidebar-footer", children: /* @__PURE__ */ t(
        Oa,
        {
          name: y.name,
          email: y.email,
          picture: y.picture,
          onSettings: i,
          onLogout: d ?? w
        }
      ) })
    ] }),
    /* @__PURE__ */ c("main", { className: "cedros-dashboard__main", children: [
      /* @__PURE__ */ t("header", { className: "cedros-dashboard__header", children: /* @__PURE__ */ c("div", { className: "cedros-dashboard__breadcrumb", children: [
        /* @__PURE__ */ t("span", { className: "cedros-dashboard__breadcrumb-root", children: e }),
        /* @__PURE__ */ t("span", { className: "cedros-dashboard__breadcrumb-sep", children: de.chevronRight }),
        /* @__PURE__ */ t("span", { className: "cedros-dashboard__breadcrumb-current", children: B?.label })
      ] }) }),
      /* @__PURE__ */ c("div", { className: "cedros-dashboard__content", children: [
        h === "users" && /* @__PURE__ */ t(ed, { pageSize: n, currentUserId: y?.id }),
        h === "team" && g && /* @__PURE__ */ t(
          td,
          {
            orgId: g.id,
            currentUserId: y?.id,
            hasPermission: E,
            role: k
          }
        ),
        h === "referrals" && /* @__PURE__ */ t(nd, {}),
        h === "deposits" && /* @__PURE__ */ t(rd, { pageSize: n, refreshInterval: o }),
        h === "withdrawals" && /* @__PURE__ */ t(sd, { pageSize: n, refreshInterval: o }),
        h === "settings-auth" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Wa, {}) }),
        h === "settings-wallet" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(qa, {}) }),
        h === "settings-messaging" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(ad, {}) }),
        h === "settings-credits" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Va, {}) }),
        h === "settings-server" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Ha, {}) }),
        h === "settings-images" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(id, {}) }),
        h === "compliance" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(yd, {}) }),
        h === "accreditation-queue" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Sd, {}) }),
        h === "sanctions" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(Ld, {}) }),
        h === "settings-compliance" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(ld, {}) }),
        h === "settings-referrals" && /* @__PURE__ */ t("div", { className: "cedros-dashboard__section", children: /* @__PURE__ */ t(ud, {}) })
      ] })
    ] })
  ] });
}
var tt = {}, cr, Vs;
function Id() {
  return Vs || (Vs = 1, cr = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), cr;
}
var lr = {}, Oe = {}, Hs;
function Qe() {
  if (Hs) return Oe;
  Hs = 1;
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
  return Oe.getSymbolSize = function(o) {
    if (!o) throw new Error('"version" cannot be null or undefined');
    if (o < 1 || o > 40) throw new Error('"version" should be in range from 1 to 40');
    return o * 4 + 17;
  }, Oe.getSymbolTotalCodewords = function(o) {
    return r[o];
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
var dr = {}, Qs;
function os() {
  return Qs || (Qs = 1, (function(e) {
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
  })(dr)), dr;
}
var ur, Gs;
function Md() {
  if (Gs) return ur;
  Gs = 1;
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
  }, ur = e, ur;
}
var hr, Ks;
function Ud() {
  if (Ks) return hr;
  Ks = 1;
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
  }, hr = e, hr;
}
var mr = {}, Ys;
function Dd() {
  return Ys || (Ys = 1, (function(e) {
    const r = Qe().getSymbolSize;
    e.getRowColCoords = function(o) {
      if (o === 1) return [];
      const n = Math.floor(o / 7) + 2, a = r(o), i = a === 145 ? 26 : Math.ceil((a - 13) / (2 * n - 2)) * 2, d = [a - 7];
      for (let l = 1; l < n - 1; l++)
        d[l] = d[l - 1] - i;
      return d.push(6), d.reverse();
    }, e.getPositions = function(o) {
      const n = [], a = e.getRowColCoords(o), i = a.length;
      for (let d = 0; d < i; d++)
        for (let l = 0; l < i; l++)
          d === 0 && l === 0 || // top-left
          d === 0 && l === i - 1 || // bottom-left
          d === i - 1 && l === 0 || n.push([a[d], a[l]]);
      return n;
    };
  })(mr)), mr;
}
var fr = {}, Zs;
function Fd() {
  if (Zs) return fr;
  Zs = 1;
  const e = Qe().getSymbolSize, r = 7;
  return fr.getPositions = function(o) {
    const n = e(o);
    return [
      // top-left
      [0, 0],
      // top-right
      [n - r, 0],
      // bottom-left
      [0, n - r]
    ];
  }, fr;
}
var pr = {}, Xs;
function Od() {
  return Xs || (Xs = 1, (function(e) {
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
      let i = 0, d = 0, l = 0, h = null, m = null;
      for (let u = 0; u < a; u++) {
        d = l = 0, h = m = null;
        for (let p = 0; p < a; p++) {
          let y = n.get(u, p);
          y === h ? d++ : (d >= 5 && (i += r.N1 + (d - 5)), h = y, d = 1), y = n.get(p, u), y === m ? l++ : (l >= 5 && (i += r.N1 + (l - 5)), m = y, l = 1);
        }
        d >= 5 && (i += r.N1 + (d - 5)), l >= 5 && (i += r.N1 + (l - 5));
      }
      return i;
    }, e.getPenaltyN2 = function(n) {
      const a = n.size;
      let i = 0;
      for (let d = 0; d < a - 1; d++)
        for (let l = 0; l < a - 1; l++) {
          const h = n.get(d, l) + n.get(d, l + 1) + n.get(d + 1, l) + n.get(d + 1, l + 1);
          (h === 4 || h === 0) && i++;
        }
      return i * r.N2;
    }, e.getPenaltyN3 = function(n) {
      const a = n.size;
      let i = 0, d = 0, l = 0;
      for (let h = 0; h < a; h++) {
        d = l = 0;
        for (let m = 0; m < a; m++)
          d = d << 1 & 2047 | n.get(h, m), m >= 10 && (d === 1488 || d === 93) && i++, l = l << 1 & 2047 | n.get(m, h), m >= 10 && (l === 1488 || l === 93) && i++;
      }
      return i * r.N3;
    }, e.getPenaltyN4 = function(n) {
      let a = 0;
      const i = n.data.length;
      for (let l = 0; l < i; l++) a += n.data[l];
      return Math.abs(Math.ceil(a * 100 / i / 5) - 10) * r.N4;
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
      for (let d = 0; d < i; d++)
        for (let l = 0; l < i; l++)
          a.isReserved(l, d) || a.xor(l, d, s(n, l, d));
    }, e.getBestMask = function(n, a) {
      const i = Object.keys(e.Patterns).length;
      let d = 0, l = 1 / 0;
      for (let h = 0; h < i; h++) {
        a(h), e.applyMask(h, n);
        const m = e.getPenaltyN1(n) + e.getPenaltyN2(n) + e.getPenaltyN3(n) + e.getPenaltyN4(n);
        e.applyMask(h, n), m < l && (l = m, d = h);
      }
      return d;
    };
  })(pr)), pr;
}
var Nt = {}, Js;
function Lo() {
  if (Js) return Nt;
  Js = 1;
  const e = os(), r = [
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
  return Nt.getBlocksCount = function(n, a) {
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
  }, Nt.getTotalCodewordsCount = function(n, a) {
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
  }, Nt;
}
var gr = {}, mt = {}, en;
function Wd() {
  if (en) return mt;
  en = 1;
  const e = new Uint8Array(512), r = new Uint8Array(256);
  return (function() {
    let o = 1;
    for (let n = 0; n < 255; n++)
      e[n] = o, r[o] = n, o <<= 1, o & 256 && (o ^= 285);
    for (let n = 255; n < 512; n++)
      e[n] = e[n - 255];
  })(), mt.log = function(o) {
    if (o < 1) throw new Error("log(" + o + ")");
    return r[o];
  }, mt.exp = function(o) {
    return e[o];
  }, mt.mul = function(o, n) {
    return o === 0 || n === 0 ? 0 : e[r[o] + r[n]];
  }, mt;
}
var tn;
function qd() {
  return tn || (tn = 1, (function(e) {
    const r = Wd();
    e.mul = function(o, n) {
      const a = new Uint8Array(o.length + n.length - 1);
      for (let i = 0; i < o.length; i++)
        for (let d = 0; d < n.length; d++)
          a[i + d] ^= r.mul(o[i], n[d]);
      return a;
    }, e.mod = function(o, n) {
      let a = new Uint8Array(o);
      for (; a.length - n.length >= 0; ) {
        const i = a[0];
        for (let l = 0; l < n.length; l++)
          a[l] ^= r.mul(n[l], i);
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
  })(gr)), gr;
}
var wr, rn;
function zd() {
  if (rn) return wr;
  rn = 1;
  const e = qd();
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
    const a = e.mod(n, this.genPoly), i = this.degree - a.length;
    if (i > 0) {
      const d = new Uint8Array(this.degree);
      return d.set(a, i), d;
    }
    return a;
  }, wr = r, wr;
}
var yr = {}, br = {}, vr = {}, sn;
function Po() {
  return sn || (sn = 1, vr.isValid = function(r) {
    return !isNaN(r) && r >= 1 && r <= 40;
  }), vr;
}
var _e = {}, nn;
function To() {
  if (nn) return _e;
  nn = 1;
  const e = "[0-9]+", r = "[A-Z $%*+\\-./:]+";
  let s = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  s = s.replace(/u/g, "\\u");
  const o = "(?:(?![A-Z0-9 $%*+\\-./:]|" + s + `)(?:.|[\r
]))+`;
  _e.KANJI = new RegExp(s, "g"), _e.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), _e.BYTE = new RegExp(o, "g"), _e.NUMERIC = new RegExp(e, "g"), _e.ALPHANUMERIC = new RegExp(r, "g");
  const n = new RegExp("^" + s + "$"), a = new RegExp("^" + e + "$"), i = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return _e.testKanji = function(l) {
    return n.test(l);
  }, _e.testNumeric = function(l) {
    return a.test(l);
  }, _e.testAlphanumeric = function(l) {
    return i.test(l);
  }, _e;
}
var on;
function Ge() {
  return on || (on = 1, (function(e) {
    const r = Po(), s = To();
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
      if (!r.isValid(i))
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
  })(br)), br;
}
var an;
function jd() {
  return an || (an = 1, (function(e) {
    const r = Qe(), s = Lo(), o = os(), n = Ge(), a = Po(), i = 7973, d = r.getBCHDigit(i);
    function l(p, y, w) {
      for (let g = 1; g <= 40; g++)
        if (y <= e.getCapacity(g, w, p))
          return g;
    }
    function h(p, y) {
      return n.getCharCountIndicator(p, y) + 4;
    }
    function m(p, y) {
      let w = 0;
      return p.forEach(function(g) {
        const k = h(g.mode, y);
        w += k + g.getBitsLength();
      }), w;
    }
    function u(p, y) {
      for (let w = 1; w <= 40; w++)
        if (m(p, w) <= e.getCapacity(w, y, n.MIXED))
          return w;
    }
    e.from = function(y, w) {
      return a.isValid(y) ? parseInt(y, 10) : w;
    }, e.getCapacity = function(y, w, g) {
      if (!a.isValid(y))
        throw new Error("Invalid QR Code version");
      typeof g > "u" && (g = n.BYTE);
      const k = r.getSymbolTotalCodewords(y), A = s.getTotalCodewordsCount(y, w), C = (k - A) * 8;
      if (g === n.MIXED) return C;
      const E = C - h(g, y);
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
    }, e.getBestVersionForData = function(y, w) {
      let g;
      const k = o.from(w, o.M);
      if (Array.isArray(y)) {
        if (y.length > 1)
          return u(y, k);
        if (y.length === 0)
          return 1;
        g = y[0];
      } else
        g = y;
      return l(g.mode, g.getLength(), k);
    }, e.getEncodedBits = function(y) {
      if (!a.isValid(y) || y < 7)
        throw new Error("Invalid QR Code version");
      let w = y << 12;
      for (; r.getBCHDigit(w) - d >= 0; )
        w ^= i << r.getBCHDigit(w) - d;
      return y << 12 | w;
    };
  })(yr)), yr;
}
var Ar = {}, cn;
function $d() {
  if (cn) return Ar;
  cn = 1;
  const e = Qe(), r = 1335, s = 21522, o = e.getBCHDigit(r);
  return Ar.getEncodedBits = function(a, i) {
    const d = a.bit << 3 | i;
    let l = d << 10;
    for (; e.getBCHDigit(l) - o >= 0; )
      l ^= r << e.getBCHDigit(l) - o;
    return (d << 10 | l) ^ s;
  }, Ar;
}
var Nr = {}, kr, ln;
function Vd() {
  if (ln) return kr;
  ln = 1;
  const e = Ge();
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
    let n, a, i;
    for (n = 0; n + 3 <= this.data.length; n += 3)
      a = this.data.substr(n, 3), i = parseInt(a, 10), o.put(i, 10);
    const d = this.data.length - n;
    d > 0 && (a = this.data.substr(n), i = parseInt(a, 10), o.put(i, d * 3 + 1));
  }, kr = r, kr;
}
var Cr, dn;
function Hd() {
  if (dn) return Cr;
  dn = 1;
  const e = Ge(), r = [
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
      let i = r.indexOf(this.data[a]) * 45;
      i += r.indexOf(this.data[a + 1]), n.put(i, 11);
    }
    this.data.length % 2 && n.put(r.indexOf(this.data[a]), 6);
  }, Cr = s, Cr;
}
var Er, un;
function Qd() {
  if (un) return Er;
  un = 1;
  const e = Ge();
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
  }, Er = r, Er;
}
var Sr, hn;
function Gd() {
  if (hn) return Sr;
  hn = 1;
  const e = Ge(), r = Qe();
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
  }, Sr = s, Sr;
}
var xr = { exports: {} }, mn;
function Kd() {
  return mn || (mn = 1, (function(e) {
    var r = {
      single_source_shortest_paths: function(s, o, n) {
        var a = {}, i = {};
        i[o] = 0;
        var d = r.PriorityQueue.make();
        d.push(o, 0);
        for (var l, h, m, u, p, y, w, g, k; !d.empty(); ) {
          l = d.pop(), h = l.value, u = l.cost, p = s[h] || {};
          for (m in p)
            p.hasOwnProperty(m) && (y = p[m], w = u + y, g = i[m], k = typeof i[m] > "u", (k || g > w) && (i[m] = w, d.push(m, w), a[m] = h));
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
  })(xr)), xr.exports;
}
var fn;
function Yd() {
  return fn || (fn = 1, (function(e) {
    const r = Ge(), s = Vd(), o = Hd(), n = Qd(), a = Gd(), i = To(), d = Qe(), l = Kd();
    function h(A) {
      return unescape(encodeURIComponent(A)).length;
    }
    function m(A, C, E) {
      const x = [];
      let L;
      for (; (L = A.exec(E)) !== null; )
        x.push({
          data: L[0],
          index: L.index,
          mode: C,
          length: L[0].length
        });
      return x;
    }
    function u(A) {
      const C = m(i.NUMERIC, r.NUMERIC, A), E = m(i.ALPHANUMERIC, r.ALPHANUMERIC, A);
      let x, L;
      return d.isKanjiModeEnabled() ? (x = m(i.BYTE, r.BYTE, A), L = m(i.KANJI, r.KANJI, A)) : (x = m(i.BYTE_KANJI, r.BYTE, A), L = []), C.concat(E, x, L).sort(function(b, v) {
        return b.index - v.index;
      }).map(function(b) {
        return {
          data: b.data,
          mode: b.mode,
          length: b.length
        };
      });
    }
    function p(A, C) {
      switch (C) {
        case r.NUMERIC:
          return s.getBitsLength(A);
        case r.ALPHANUMERIC:
          return o.getBitsLength(A);
        case r.KANJI:
          return a.getBitsLength(A);
        case r.BYTE:
          return n.getBitsLength(A);
      }
    }
    function y(A) {
      return A.reduce(function(C, E) {
        const x = C.length - 1 >= 0 ? C[C.length - 1] : null;
        return x && x.mode === E.mode ? (C[C.length - 1].data += E.data, C) : (C.push(E), C);
      }, []);
    }
    function w(A) {
      const C = [];
      for (let E = 0; E < A.length; E++) {
        const x = A[E];
        switch (x.mode) {
          case r.NUMERIC:
            C.push([
              x,
              { data: x.data, mode: r.ALPHANUMERIC, length: x.length },
              { data: x.data, mode: r.BYTE, length: x.length }
            ]);
            break;
          case r.ALPHANUMERIC:
            C.push([
              x,
              { data: x.data, mode: r.BYTE, length: x.length }
            ]);
            break;
          case r.KANJI:
            C.push([
              x,
              { data: x.data, mode: r.BYTE, length: h(x.data) }
            ]);
            break;
          case r.BYTE:
            C.push([
              { data: x.data, mode: r.BYTE, length: h(x.data) }
            ]);
        }
      }
      return C;
    }
    function g(A, C) {
      const E = {}, x = { start: {} };
      let L = ["start"];
      for (let f = 0; f < A.length; f++) {
        const b = A[f], v = [];
        for (let N = 0; N < b.length; N++) {
          const T = b[N], _ = "" + f + N;
          v.push(_), E[_] = { node: T, lastCount: 0 }, x[_] = {};
          for (let B = 0; B < L.length; B++) {
            const R = L[B];
            E[R] && E[R].node.mode === T.mode ? (x[R][_] = p(E[R].lastCount + T.length, T.mode) - p(E[R].lastCount, T.mode), E[R].lastCount += T.length) : (E[R] && (E[R].lastCount = T.length), x[R][_] = p(T.length, T.mode) + 4 + r.getCharCountIndicator(T.mode, C));
          }
        }
        L = v;
      }
      for (let f = 0; f < L.length; f++)
        x[L[f]].end = 0;
      return { map: x, table: E };
    }
    function k(A, C) {
      let E;
      const x = r.getBestModeForData(A);
      if (E = r.from(C, x), E !== r.BYTE && E.bit < x.bit)
        throw new Error('"' + A + '" cannot be encoded with mode ' + r.toString(E) + `.
 Suggested mode is: ` + r.toString(x));
      switch (E === r.KANJI && !d.isKanjiModeEnabled() && (E = r.BYTE), E) {
        case r.NUMERIC:
          return new s(A);
        case r.ALPHANUMERIC:
          return new o(A);
        case r.KANJI:
          return new a(A);
        case r.BYTE:
          return new n(A);
      }
    }
    e.fromArray = function(C) {
      return C.reduce(function(E, x) {
        return typeof x == "string" ? E.push(k(x, null)) : x.data && E.push(k(x.data, x.mode)), E;
      }, []);
    }, e.fromString = function(C, E) {
      const x = u(C, d.isKanjiModeEnabled()), L = w(x), f = g(L, E), b = l.find_path(f.map, "start", "end"), v = [];
      for (let N = 1; N < b.length - 1; N++)
        v.push(f.table[b[N]].node);
      return e.fromArray(y(v));
    }, e.rawSplit = function(C) {
      return e.fromArray(
        u(C, d.isKanjiModeEnabled())
      );
    };
  })(Nr)), Nr;
}
var pn;
function Zd() {
  if (pn) return lr;
  pn = 1;
  const e = Qe(), r = os(), s = Md(), o = Ud(), n = Dd(), a = Fd(), i = Od(), d = Lo(), l = zd(), h = jd(), m = $d(), u = Ge(), p = Yd();
  function y(f, b) {
    const v = f.size, N = a.getPositions(b);
    for (let T = 0; T < N.length; T++) {
      const _ = N[T][0], B = N[T][1];
      for (let R = -1; R <= 7; R++)
        if (!(_ + R <= -1 || v <= _ + R))
          for (let I = -1; I <= 7; I++)
            B + I <= -1 || v <= B + I || (R >= 0 && R <= 6 && (I === 0 || I === 6) || I >= 0 && I <= 6 && (R === 0 || R === 6) || R >= 2 && R <= 4 && I >= 2 && I <= 4 ? f.set(_ + R, B + I, !0, !0) : f.set(_ + R, B + I, !1, !0));
    }
  }
  function w(f) {
    const b = f.size;
    for (let v = 8; v < b - 8; v++) {
      const N = v % 2 === 0;
      f.set(v, 6, N, !0), f.set(6, v, N, !0);
    }
  }
  function g(f, b) {
    const v = n.getPositions(b);
    for (let N = 0; N < v.length; N++) {
      const T = v[N][0], _ = v[N][1];
      for (let B = -2; B <= 2; B++)
        for (let R = -2; R <= 2; R++)
          B === -2 || B === 2 || R === -2 || R === 2 || B === 0 && R === 0 ? f.set(T + B, _ + R, !0, !0) : f.set(T + B, _ + R, !1, !0);
    }
  }
  function k(f, b) {
    const v = f.size, N = h.getEncodedBits(b);
    let T, _, B;
    for (let R = 0; R < 18; R++)
      T = Math.floor(R / 3), _ = R % 3 + v - 8 - 3, B = (N >> R & 1) === 1, f.set(T, _, B, !0), f.set(_, T, B, !0);
  }
  function A(f, b, v) {
    const N = f.size, T = m.getEncodedBits(b, v);
    let _, B;
    for (_ = 0; _ < 15; _++)
      B = (T >> _ & 1) === 1, _ < 6 ? f.set(_, 8, B, !0) : _ < 8 ? f.set(_ + 1, 8, B, !0) : f.set(N - 15 + _, 8, B, !0), _ < 8 ? f.set(8, N - _ - 1, B, !0) : _ < 9 ? f.set(8, 15 - _ - 1 + 1, B, !0) : f.set(8, 15 - _ - 1, B, !0);
    f.set(N - 8, 8, 1, !0);
  }
  function C(f, b) {
    const v = f.size;
    let N = -1, T = v - 1, _ = 7, B = 0;
    for (let R = v - 1; R > 0; R -= 2)
      for (R === 6 && R--; ; ) {
        for (let I = 0; I < 2; I++)
          if (!f.isReserved(T, R - I)) {
            let M = !1;
            B < b.length && (M = (b[B] >>> _ & 1) === 1), f.set(T, R - I, M), _--, _ === -1 && (B++, _ = 7);
          }
        if (T += N, T < 0 || v <= T) {
          T -= N, N = -N;
          break;
        }
      }
  }
  function E(f, b, v) {
    const N = new s();
    v.forEach(function(I) {
      N.put(I.mode.bit, 4), N.put(I.getLength(), u.getCharCountIndicator(I.mode, f)), I.write(N);
    });
    const T = e.getSymbolTotalCodewords(f), _ = d.getTotalCodewordsCount(f, b), B = (T - _) * 8;
    for (N.getLengthInBits() + 4 <= B && N.put(0, 4); N.getLengthInBits() % 8 !== 0; )
      N.putBit(0);
    const R = (B - N.getLengthInBits()) / 8;
    for (let I = 0; I < R; I++)
      N.put(I % 2 ? 17 : 236, 8);
    return x(N, f, b);
  }
  function x(f, b, v) {
    const N = e.getSymbolTotalCodewords(b), T = d.getTotalCodewordsCount(b, v), _ = N - T, B = d.getBlocksCount(b, v), R = N % B, I = B - R, M = Math.floor(N / B), U = Math.floor(_ / B), W = U + 1, z = M - U, $ = new l(z);
    let D = 0;
    const O = new Array(B), H = new Array(B);
    let ee = 0;
    const ie = new Uint8Array(f.buffer);
    for (let oe = 0; oe < B; oe++) {
      const we = oe < I ? U : W;
      O[oe] = ie.slice(D, D + we), H[oe] = $.encode(O[oe]), D += we, ee = Math.max(ee, we);
    }
    const Q = new Uint8Array(N);
    let te = 0, G, K;
    for (G = 0; G < ee; G++)
      for (K = 0; K < B; K++)
        G < O[K].length && (Q[te++] = O[K][G]);
    for (G = 0; G < z; G++)
      for (K = 0; K < B; K++)
        Q[te++] = H[K][G];
    return Q;
  }
  function L(f, b, v, N) {
    let T;
    if (Array.isArray(f))
      T = p.fromArray(f);
    else if (typeof f == "string") {
      let M = b;
      if (!M) {
        const U = p.rawSplit(f);
        M = h.getBestVersionForData(U, v);
      }
      T = p.fromString(f, M || 40);
    } else
      throw new Error("Invalid data");
    const _ = h.getBestVersionForData(T, v);
    if (!_)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!b)
      b = _;
    else if (b < _)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + _ + `.
`
      );
    const B = E(b, v, T), R = e.getSymbolSize(b), I = new o(R);
    return y(I, b), w(I), g(I, b), A(I, v, 0), b >= 7 && k(I, b), C(I, B), isNaN(N) && (N = i.getBestMask(
      I,
      A.bind(null, I, v)
    )), i.applyMask(N, I), A(I, v, N), {
      modules: I,
      version: b,
      errorCorrectionLevel: v,
      maskPattern: N,
      segments: T
    };
  }
  return lr.create = function(b, v) {
    if (typeof b > "u" || b === "")
      throw new Error("No input text");
    let N = r.M, T, _;
    return typeof v < "u" && (N = r.from(v.errorCorrectionLevel, r.M), T = h.from(v.version), _ = i.from(v.maskPattern), v.toSJISFunc && e.setToSJISFunction(v.toSJISFunc)), L(b, T, N, _);
  }, lr;
}
var _r = {}, Lr = {}, gn;
function Ro() {
  return gn || (gn = 1, (function(e) {
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
      const n = typeof o.margin > "u" || o.margin === null || o.margin < 0 ? 4 : o.margin, a = o.width && o.width >= 21 ? o.width : void 0, i = o.scale || 4;
      return {
        width: a,
        scale: a ? 4 : i,
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
      const i = n.modules.size, d = n.modules.data, l = e.getScale(i, a), h = Math.floor((i + a.margin * 2) * l), m = a.margin * l, u = [a.color.light, a.color.dark];
      for (let p = 0; p < h; p++)
        for (let y = 0; y < h; y++) {
          let w = (p * h + y) * 4, g = a.color.light;
          if (p >= m && y >= m && p < h - m && y < h - m) {
            const k = Math.floor((p - m) / l), A = Math.floor((y - m) / l);
            g = u[d[k * i + A] ? 1 : 0];
          }
          o[w++] = g.r, o[w++] = g.g, o[w++] = g.b, o[w] = g.a;
        }
    };
  })(Lr)), Lr;
}
var wn;
function Xd() {
  return wn || (wn = 1, (function(e) {
    const r = Ro();
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
    e.render = function(a, i, d) {
      let l = d, h = i;
      typeof l > "u" && (!i || !i.getContext) && (l = i, i = void 0), i || (h = o()), l = r.getOptions(l);
      const m = r.getImageWidth(a.modules.size, l), u = h.getContext("2d"), p = u.createImageData(m, m);
      return r.qrToImageData(p.data, a, l), s(u, h, m), u.putImageData(p, 0, 0), h;
    }, e.renderToDataURL = function(a, i, d) {
      let l = d;
      typeof l > "u" && (!i || !i.getContext) && (l = i, i = void 0), l || (l = {});
      const h = e.render(a, i, l), m = l.type || "image/png", u = l.rendererOpts || {};
      return h.toDataURL(m, u.quality);
    };
  })(_r)), _r;
}
var Pr = {}, yn;
function Jd() {
  if (yn) return Pr;
  yn = 1;
  const e = Ro();
  function r(n, a) {
    const i = n.a / 255, d = a + '="' + n.hex + '"';
    return i < 1 ? d + " " + a + '-opacity="' + i.toFixed(2).slice(1) + '"' : d;
  }
  function s(n, a, i) {
    let d = n + a;
    return typeof i < "u" && (d += " " + i), d;
  }
  function o(n, a, i) {
    let d = "", l = 0, h = !1, m = 0;
    for (let u = 0; u < n.length; u++) {
      const p = Math.floor(u % a), y = Math.floor(u / a);
      !p && !h && (h = !0), n[u] ? (m++, u > 0 && p > 0 && n[u - 1] || (d += h ? s("M", p + i, 0.5 + y + i) : s("m", l, 0), l = 0, h = !1), p + 1 < a && n[u + 1] || (d += s("h", m), m = 0)) : l++;
    }
    return d;
  }
  return Pr.render = function(a, i, d) {
    const l = e.getOptions(i), h = a.modules.size, m = a.modules.data, u = h + l.margin * 2, p = l.color.light.a ? "<path " + r(l.color.light, "fill") + ' d="M0 0h' + u + "v" + u + 'H0z"/>' : "", y = "<path " + r(l.color.dark, "stroke") + ' d="' + o(m, h, l.margin) + '"/>', w = 'viewBox="0 0 ' + u + " " + u + '"', k = '<svg xmlns="http://www.w3.org/2000/svg" ' + (l.width ? 'width="' + l.width + '" height="' + l.width + '" ' : "") + w + ' shape-rendering="crispEdges">' + p + y + `</svg>
`;
    return typeof d == "function" && d(null, k), k;
  }, Pr;
}
var bn;
function eu() {
  if (bn) return tt;
  bn = 1;
  const e = Id(), r = Zd(), s = Xd(), o = Jd();
  function n(a, i, d, l, h) {
    const m = [].slice.call(arguments, 1), u = m.length, p = typeof m[u - 1] == "function";
    if (!p && !e())
      throw new Error("Callback required as last argument");
    if (p) {
      if (u < 2)
        throw new Error("Too few arguments provided");
      u === 2 ? (h = d, d = i, i = l = void 0) : u === 3 && (i.getContext && typeof h > "u" ? (h = l, l = void 0) : (h = l, l = d, d = i, i = void 0));
    } else {
      if (u < 1)
        throw new Error("Too few arguments provided");
      return u === 1 ? (d = i, i = l = void 0) : u === 2 && !i.getContext && (l = d, d = i, i = void 0), new Promise(function(y, w) {
        try {
          const g = r.create(d, l);
          y(a(g, i, l));
        } catch (g) {
          w(g);
        }
      });
    }
    try {
      const y = r.create(d, l);
      h(null, a(y, i, l));
    } catch (y) {
      h(y);
    }
  }
  return tt.create = r.create, tt.toCanvas = n.bind(null, s.render), tt.toDataURL = n.bind(null, s.renderToDataURL), tt.toString = n.bind(null, function(a, i, d) {
    return o.render(a, d);
  }), tt;
}
var tu = eu();
const ru = /* @__PURE__ */ Vn(tu);
function su({ value: e, size: r = 200, alt: s = "QR code", className: o = "" }) {
  const n = se(null), [a, i] = S(null);
  return F(() => {
    !n.current || !e || ru.toCanvas(n.current, e, {
      width: r,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
      errorCorrectionLevel: "M"
    }).then(() => {
      i(null);
    }).catch((d) => {
      i(d instanceof Error ? d.message : "Failed to generate QR code");
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
function Bo() {
  const { config: e, _internal: r } = J(), [s, o] = S(null), [n, a] = S("idle"), [i, d] = S(null), [l, h] = S(!1), [m, u] = S(null), p = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, r]
  ), y = P(async () => {
    h(!0), u(null);
    try {
      const x = await p.get("/mfa/status");
      return o(x), x;
    } catch (x) {
      const L = j(x, "Unable to load two-factor authentication status. Please try again.");
      throw u(L), L;
    } finally {
      h(!1);
    }
  }, [p]), w = P(async () => {
    h(!0), u(null), a("loading");
    try {
      const x = await p.post("/mfa/setup", {});
      return d(x), a("setup"), x;
    } catch (x) {
      const L = j(x, "Unable to start two-factor setup. Please try again.");
      throw u(L), a("error"), L;
    } finally {
      h(!1);
    }
  }, [p]), g = P(
    async (x) => {
      if (!/^\d{6}$/.test(x)) {
        const L = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw u(L), L;
      }
      h(!0), u(null), a("verifying");
      try {
        await p.post("/mfa/enable", { code: x }), a("success");
        try {
          const L = await p.get("/mfa/status");
          o(L);
        } catch {
          o({ enabled: !0, recoveryCodesRemaining: 0 });
        }
      } catch (L) {
        const f = j(L, "Incorrect verification code. Please check and try again.");
        throw u(f), a("error"), f;
      } finally {
        h(!1);
      }
    },
    [p]
  ), k = P(
    async (x) => {
      if (!x) {
        const L = {
          code: "VALIDATION_ERROR",
          message: "Please enter your password"
        };
        throw u(L), L;
      }
      h(!0), u(null);
      try {
        await p.post("/mfa/disable", { password: x }), o({ enabled: !1, recoveryCodesRemaining: 0 }), d(null), a("idle");
      } catch (L) {
        const f = j(L, "Unable to disable two-factor authentication. Please try again.");
        throw u(f), f;
      } finally {
        h(!1);
      }
    },
    [p]
  ), A = P(
    async (x) => {
      if (!/^\d{6}$/.test(x)) {
        const L = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw u(L), L;
      }
      h(!0), u(null);
      try {
        return await p.post(
          "/mfa/recovery-codes/regenerate",
          { code: x }
        );
      } catch (L) {
        const f = j(L, "Unable to regenerate recovery codes. Please try again.");
        throw u(f), f;
      } finally {
        h(!1);
      }
    },
    [p]
  ), C = P(() => u(null), []), E = P(() => {
    u(null), d(null), a("idle"), h(!1);
  }, []);
  return {
    status: s,
    setupState: n,
    setupData: i,
    isLoading: l,
    error: m,
    getStatus: y,
    beginSetup: w,
    enableTotp: g,
    disableTotp: k,
    regenerateBackupCodes: A,
    clearError: C,
    reset: E
  };
}
function Io({ onSuccess: e, onCancel: r, className: s = "" }) {
  const { setupState: o, setupData: n, isLoading: a, error: i, beginSetup: d, enableTotp: l, clearError: h, reset: m } = Bo(), [u, p] = S("qr"), [y, w] = S(""), [g, k] = S(!1), [A, C] = S(!1), E = se(null);
  F(() => {
    o === "idle" && d().catch(() => {
    });
  }, [o, d]), F(() => {
    o === "success" && e?.();
  }, [o, e]);
  const x = async () => {
    n?.secret && (await navigator.clipboard.writeText(n.secret), k(!0), E.current !== null && window.clearTimeout(E.current), E.current = window.setTimeout(() => k(!1), 2e3));
  }, L = async () => {
    if (n?.recoveryCodes) {
      const v = n.recoveryCodes.join(`
`);
      await navigator.clipboard.writeText(v);
    }
  }, f = async () => {
    try {
      await l(y);
    } catch {
      w("");
    }
  }, b = () => {
    m(), r?.();
  };
  return F(() => () => {
    E.current !== null && (window.clearTimeout(E.current), E.current = null);
  }, []), o === "loading" || o === "idle" && a ? /* @__PURE__ */ t("div", { className: `cedros-totp-setup ${s}`, children: /* @__PURE__ */ t("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ t(Z, { size: "lg", label: "Setting up two-factor authentication" }) }) }) : o === "error" && !n ? /* @__PURE__ */ c("div", { className: `cedros-totp-setup ${s}`, children: [
    /* @__PURE__ */ t(le, { error: i, onDismiss: h }),
    /* @__PURE__ */ c("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: b,
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
  ] }) : o === "success" ? /* @__PURE__ */ t("div", { className: `cedros-totp-setup ${s}`, children: /* @__PURE__ */ c("div", { className: "cedros-totp-success", children: [
    /* @__PURE__ */ c(
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
  ] }) }) : n ? /* @__PURE__ */ c("div", { className: `cedros-totp-setup ${s}`, children: [
    u === "qr" && /* @__PURE__ */ c("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Scan QR code" }),
      /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "Use your authenticator app to scan this QR code." }),
      /* @__PURE__ */ t("div", { className: "cedros-totp-qr", children: /* @__PURE__ */ t(su, { value: n.otpauthUri, size: 200, alt: "QR code for authenticator app" }) }),
      /* @__PURE__ */ c("div", { className: "cedros-totp-manual", children: [
        /* @__PURE__ */ t("p", { className: "cedros-totp-manual-label", children: "Or enter this code manually:" }),
        /* @__PURE__ */ c("div", { className: "cedros-totp-secret", children: [
          /* @__PURE__ */ t("code", { className: "cedros-totp-secret-code", children: n.secret }),
          /* @__PURE__ */ t(
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
      /* @__PURE__ */ c("div", { className: "cedros-totp-actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-md",
            onClick: b,
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
    u === "backup" && /* @__PURE__ */ c("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Save recovery codes" }),
      /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. You can use them to access your account if you lose your authenticator device." }),
      /* @__PURE__ */ t("div", { className: "cedros-totp-backup-codes", children: n.recoveryCodes.map((v, N) => /* @__PURE__ */ t("code", { className: "cedros-totp-backup-code", children: v }, N)) }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
          onClick: L,
          children: "Copy all codes"
        }
      ),
      /* @__PURE__ */ c("label", { className: "cedros-checkbox-label cedros-totp-confirm", children: [
        /* @__PURE__ */ t(
          "input",
          {
            type: "checkbox",
            className: "cedros-checkbox",
            checked: A,
            onChange: (v) => C(v.target.checked)
          }
        ),
        /* @__PURE__ */ t("span", { className: "cedros-checkbox-text", children: "I have saved these recovery codes" })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-totp-actions", children: [
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
            disabled: !A,
            children: "Continue"
          }
        )
      ] })
    ] }),
    u === "verify" && /* @__PURE__ */ c("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Verify setup" }),
      /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "Enter the 6-digit code from your authenticator app to complete setup." }),
      /* @__PURE__ */ t(
        Dn,
        {
          value: y,
          onChange: w,
          onComplete: f,
          disabled: a,
          error: i?.message,
          autoFocus: !0
        }
      ),
      /* @__PURE__ */ c("div", { className: "cedros-totp-actions", children: [
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
            disabled: a || y.length !== 6,
            children: a ? /* @__PURE__ */ c(X, { children: [
              /* @__PURE__ */ t(Z, { size: "sm" }),
              /* @__PURE__ */ t("span", { children: "Verifying..." })
            ] }) : "Enable 2FA"
          }
        )
      ] })
    ] })
  ] }) : null;
}
function nu({ onStatusChange: e, className: r = "" }) {
  const { status: s, isLoading: o, error: n, getStatus: a, disableTotp: i, regenerateBackupCodes: d, clearError: l } = Bo(), [h, m] = S("status"), [u, p] = S(""), [y, w] = S(""), [g, k] = S(null), [A, C] = S(!1), [E, x] = S(null);
  F(() => {
    a().catch(() => {
    });
  }, [a]);
  const L = P(() => {
    m("status"), e?.(!0);
  }, [e]), f = async () => {
    C(!0), x(null);
    try {
      await i(u), m("status"), p(""), e?.(!1);
    } catch (N) {
      x(N instanceof Error ? N.message : "Failed to disable 2FA"), p("");
    } finally {
      C(!1);
    }
  }, b = async () => {
    C(!0), x(null);
    try {
      const N = await d(y);
      k(N.recoveryCodes), w("");
    } catch (N) {
      x(N instanceof Error ? N.message : "Failed to regenerate codes"), w("");
    } finally {
      C(!1);
    }
  }, v = async () => {
    g && await navigator.clipboard.writeText(g.join(`
`));
  };
  return o && !s ? /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ t("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ t(Z, { size: "md", label: "Loading security settings" }) }) }) : n && !s ? /* @__PURE__ */ c("div", { className: `cedros-totp-settings ${r}`, children: [
    /* @__PURE__ */ t(le, { error: n, onDismiss: l }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => a(),
        children: "Retry"
      }
    )
  ] }) : h === "setup" ? /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ t(Io, { onSuccess: L, onCancel: () => m("status") }) }) : h === "disable" ? /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ c("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Disable two-factor authentication" }),
    /* @__PURE__ */ t("p", { className: "cedros-totp-description cedros-totp-warning", children: "This will make your account less secure. Enter your password to confirm." }),
    E && /* @__PURE__ */ t("div", { className: "cedros-totp-error", children: /* @__PURE__ */ t(
      le,
      {
        error: { code: "UNKNOWN_ERROR", message: E },
        onDismiss: () => x(null)
      }
    ) }),
    /* @__PURE__ */ t("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ t(
      ve,
      {
        label: "Password",
        placeholder: "Enter your password",
        value: u,
        onChange: (N) => p(N.target.value),
        disabled: A,
        autoFocus: !0
      }
    ) }),
    /* @__PURE__ */ c("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ t(
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
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive cedros-button-md",
          onClick: f,
          disabled: A || u.length === 0,
          children: A ? /* @__PURE__ */ c(X, { children: [
            /* @__PURE__ */ t(Z, { size: "sm" }),
            /* @__PURE__ */ t("span", { children: "Disabling..." })
          ] }) : "Disable 2FA"
        }
      )
    ] })
  ] }) }) : h === "regenerate" ? g ? /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ c("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "New recovery codes" }),
    /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. Your old codes are no longer valid." }),
    /* @__PURE__ */ t("div", { className: "cedros-totp-backup-codes", children: g.map((N, T) => /* @__PURE__ */ t("code", { className: "cedros-totp-backup-code", children: N }, T)) }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
        onClick: v,
        children: "Copy all codes"
      }
    ),
    /* @__PURE__ */ t("div", { className: "cedros-totp-actions", children: /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => {
          m("status"), k(null);
        },
        children: "Done"
      }
    ) })
  ] }) }) : /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ c("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-totp-title", children: "Regenerate recovery codes" }),
    /* @__PURE__ */ t("p", { className: "cedros-totp-description", children: "This will invalidate all existing recovery codes. Enter your authenticator code to confirm." }),
    E && /* @__PURE__ */ t("div", { className: "cedros-totp-error", children: /* @__PURE__ */ t(
      le,
      {
        error: { code: "UNKNOWN_ERROR", message: E },
        onDismiss: () => x(null)
      }
    ) }),
    /* @__PURE__ */ t("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ t(
      Dn,
      {
        value: y,
        onChange: w,
        onComplete: b,
        disabled: A,
        autoFocus: !0
      }
    ) }),
    /* @__PURE__ */ c("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ t(
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
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: b,
          disabled: A || y.length !== 6,
          children: A ? /* @__PURE__ */ c(X, { children: [
            /* @__PURE__ */ t(Z, { size: "sm" }),
            /* @__PURE__ */ t("span", { children: "Regenerating..." })
          ] }) : "Regenerate codes"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ t("div", { className: `cedros-totp-settings ${r}`, children: /* @__PURE__ */ c("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ c("div", { className: "cedros-totp-status-header", children: [
      /* @__PURE__ */ c("div", { className: "cedros-totp-status-info", children: [
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
    s?.enabled ? /* @__PURE__ */ c("div", { className: "cedros-totp-enabled-actions", children: [
      /* @__PURE__ */ c("div", { className: "cedros-totp-description", style: { marginTop: "0.25rem" }, children: [
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
class ou {
  client;
  constructor(r, s, o, n) {
    this.client = new ae({ baseUrl: r, timeoutMs: s, retryAttempts: o, getAccessToken: n });
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
      throw j(s, "Failed to change password");
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
      throw j(s, "Failed to update profile");
    }
  }
}
function $t() {
  const { config: e, authState: r, _internal: s } = J(), [o, n] = S(!1), [a, i] = S(null), d = q(
    () => new ou(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), l = P(() => {
    i(null);
  }, []), h = P(
    async (u) => {
      if (r !== "authenticated")
        throw new Error("Must be authenticated to update profile");
      n(!0), i(null);
      try {
        return await d.updateProfile(u);
      } catch (p) {
        const y = p instanceof Error ? p : new Error("Failed to update profile");
        throw i(y), y;
      } finally {
        n(!1);
      }
    },
    [r, d]
  ), m = P(
    async (u) => {
      if (r !== "authenticated")
        throw new Error("Must be authenticated to change password");
      n(!0), i(null);
      try {
        await d.changePassword(u);
      } catch (p) {
        const y = p instanceof Error ? p : new Error("Failed to change password");
        throw i(y), y;
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
function au() {
  const { config: e, _internal: r } = J(), [s, o] = S(!1), [n, a] = S(null), i = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), d = P(async () => {
    o(!0), a(null);
    try {
      return await i.get("/referral", {
        credentials: "include"
      });
    } catch (h) {
      const m = h instanceof Error ? h : new Error(String(h));
      throw a(m), m;
    } finally {
      o(!1);
    }
  }, [i]), l = P(async () => {
    o(!0), a(null);
    try {
      return (await i.post("/referral/regenerate", void 0, {
        credentials: "include"
      })).referralCode;
    } catch (h) {
      const m = h instanceof Error ? h : new Error(String(h));
      throw a(m), m;
    } finally {
      o(!1);
    }
  }, [i]);
  return { getReferral: d, regenerateCode: l, isLoading: s, error: n };
}
function am({
  onPasswordChange: e,
  onClose: r,
  className: s = ""
}) {
  const { user: o, refreshUser: n } = Wt(), { config: a, _internal: i } = J(), { isLoading: d, error: l, changePassword: h, updateProfile: m, clearError: u } = $t(), [p, y] = S("main"), [w, g] = S(""), [k, A] = S(""), [C, E] = S(""), [x, L] = S(null), [f, b] = S(null), [v, N] = S(!1), T = se(null), [_, B] = S(o?.payoutWalletAddress ?? ""), [R, I] = S(!1), [M, U] = S(!1), [W, z] = S(null), $ = P(async () => {
    const Y = _.trim();
    if (Y.length > 0 && (Y.length < 32 || Y.length > 44)) {
      z("Invalid Solana address — must be 32–44 characters.");
      return;
    }
    const Ne = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (Y.length > 0 && !Ne.test(Y)) {
      z("Invalid Solana address — contains non-base58 characters.");
      return;
    }
    z(null), I(!0);
    try {
      await m({ payoutWalletAddress: Y || void 0 }), await n(), U(!0), setTimeout(() => U(!1), 2e3);
    } catch (Ce) {
      z(Ce instanceof Error ? Ce.message : "Failed to save payout wallet");
    } finally {
      I(!1);
    }
  }, [_, m, n]), { getReferral: D, regenerateCode: O, isLoading: H } = au(), [ee, ie] = S(null), [Q, te] = S(0), [G, K] = S(!1), [oe, we] = S(!1);
  F(() => {
    D().then((Y) => {
      ie(Y.referralCode), te(Y.referralCount), we(Y.directPayoutEnabled);
    }).catch(() => {
    });
  }, []);
  const ke = zt(k), at = k === C, We = w.length > 0 && k.length > 0 && C.length > 0 && ke.isValid && at, qe = P(
    async (Y) => {
      const Ne = Y.target.files?.[0];
      if (Ne) {
        L(null), N(!0);
        try {
          const Ce = new FormData();
          Ce.append("file", Ne);
          const gt = i?.getAccessToken?.(), ze = {};
          gt && (ze.Authorization = `Bearer ${gt}`);
          const Ye = await fetch(`${a.serverUrl}/auth/upload/avatar`, {
            method: "POST",
            headers: ze,
            body: Ce,
            credentials: "include"
          });
          if (!Ye.ok) {
            const Ze = await Ye.json().catch(() => null);
            throw new Error(Ze?.message || Ze?.error || `Upload failed (${Ye.status})`);
          }
          await n();
        } catch (Ce) {
          L(Ce instanceof Error ? Ce.message : "Failed to upload avatar");
        } finally {
          N(!1), T.current && (T.current.value = "");
        }
      }
    },
    [a.serverUrl, i, n]
  ), Ht = P(async () => {
    if (We) {
      L(null), b(null);
      try {
        await h({
          currentPassword: w,
          newPassword: k
        }), g(""), A(""), E(""), b("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => {
          y("main"), b(null);
        }, 2e3);
      } catch (Y) {
        L(Y instanceof Error ? Y.message : "Failed to change password");
      }
    }
  }, [We, w, k, h, e]), it = P(() => {
    y("main"), g(""), A(""), E(""), L(null), u();
  }, [u]), Ke = () => o?.name ? o.name.split(" ").map((Y) => Y[0]).join("").toUpperCase().slice(0, 2) : o?.email ? o.email[0].toUpperCase() : "?";
  return p === "change-password" ? /* @__PURE__ */ t("div", { className: `cedros-profile-settings ${s}`, children: /* @__PURE__ */ c("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ t("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (x || l) && /* @__PURE__ */ t("div", { className: "cedros-profile-error", children: /* @__PURE__ */ t(
      le,
      {
        error: { code: "UNKNOWN_ERROR", message: x || l?.message || "" },
        onDismiss: () => {
          L(null), u();
        }
      }
    ) }),
    f && /* @__PURE__ */ c("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ t("span", { className: "cedros-profile-success-icon", children: "✓" }),
      f
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ t("div", { className: "cedros-profile-field", children: /* @__PURE__ */ t(
        ve,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: w,
          onChange: (Y) => g(Y.target.value),
          disabled: d,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-field", children: /* @__PURE__ */ t(
        ve,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: k,
          onChange: (Y) => A(Y.target.value),
          disabled: d,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-field", children: /* @__PURE__ */ t(
        ve,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: C,
          onChange: (Y) => E(Y.target.value),
          disabled: d,
          error: C.length > 0 && !at ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: it,
          disabled: d,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: Ht,
          disabled: d || !We,
          children: d ? /* @__PURE__ */ c(X, { children: [
            /* @__PURE__ */ t(Z, { size: "sm" }),
            /* @__PURE__ */ t("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ t("div", { className: `cedros-profile-settings ${s}`, children: /* @__PURE__ */ c("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ c("div", { className: "cedros-profile-header", children: [
      /* @__PURE__ */ c(
        "div",
        {
          className: "cedros-profile-avatar-container cedros-profile-avatar-container--clickable",
          onClick: () => T.current?.click(),
          role: "button",
          tabIndex: 0,
          onKeyDown: (Y) => {
            (Y.key === "Enter" || Y.key === " ") && (Y.preventDefault(), T.current?.click());
          },
          "aria-label": "Change profile picture",
          children: [
            v ? /* @__PURE__ */ t("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: /* @__PURE__ */ t(Z, { size: "sm" }) }) : o?.picture ? /* @__PURE__ */ t(
              "img",
              {
                src: o.picture,
                alt: o.name || "Profile",
                className: "cedros-profile-avatar"
              }
            ) : /* @__PURE__ */ t("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: Ke() }),
            /* @__PURE__ */ t("div", { className: "cedros-profile-avatar-overlay", children: /* @__PURE__ */ c("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ t("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
              /* @__PURE__ */ t("circle", { cx: "12", cy: "13", r: "4" })
            ] }) }),
            /* @__PURE__ */ t(
              "input",
              {
                ref: T,
                type: "file",
                accept: "image/jpeg,image/png,image/gif,image/webp",
                onChange: qe,
                className: "cedros-profile-avatar-input",
                "aria-hidden": "true",
                tabIndex: -1
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ c("div", { className: "cedros-profile-info", children: [
        /* @__PURE__ */ t("h3", { className: "cedros-profile-name", children: o?.name || "User" }),
        /* @__PURE__ */ t("p", { className: "cedros-profile-email", children: o?.email })
      ] })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-profile-section-title", children: "Account" }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-row", children: /* @__PURE__ */ c("div", { className: "cedros-profile-row-content", children: [
        /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Email" }),
        /* @__PURE__ */ t("span", { className: "cedros-profile-row-value", children: o?.email || "Not set" })
      ] }) }),
      /* @__PURE__ */ c("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ c("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Password" }),
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-value", children: "••••••••" })
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => y("change-password"),
            children: "Change"
          }
        )
      ] })
    ] }),
    ee && /* @__PURE__ */ c("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-profile-section-title", children: "Referral" }),
      /* @__PURE__ */ c("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ c("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Your code" }),
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-value cedros-profile-row-value--mono", children: ee })
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => {
              navigator.clipboard.writeText(ee), K(!0), setTimeout(() => K(!1), 2e3);
            },
            children: G ? "Copied" : "Copy"
          }
        )
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ c("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Referrals" }),
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-value", children: Q })
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: async () => {
              try {
                const Y = await O();
                ie(Y);
              } catch {
              }
            },
            disabled: H,
            children: H ? "Regenerating..." : "Regenerate"
          }
        )
      ] })
    ] }),
    oe && /* @__PURE__ */ c("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-profile-section-title", children: "Payout wallet" }),
      /* @__PURE__ */ t("p", { className: "cedros-profile-description", children: "Solana wallet address to receive direct referral payouts when enabled by the platform." }),
      /* @__PURE__ */ c("div", { className: "cedros-profile-row cedros-profile-row--column", children: [
        /* @__PURE__ */ t(
          "input",
          {
            type: "text",
            className: "cedros-input",
            placeholder: "Solana wallet address (base58)",
            value: _,
            onChange: (Y) => {
              B(Y.target.value), z(null);
            },
            disabled: R,
            maxLength: 44
          }
        ),
        W && /* @__PURE__ */ t("span", { className: "cedros-profile-error-text", children: W }),
        M && /* @__PURE__ */ t("span", { className: "cedros-profile-success-text", children: "Saved." })
      ] }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-actions", children: /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: $,
          disabled: R,
          children: R ? "Saving..." : "Save wallet"
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
class iu {
  client;
  constructor(r, s, o, n) {
    this.client = new ae({ baseUrl: r, timeoutMs: s, retryAttempts: o, getAccessToken: n });
  }
  /**
   * List all credentials linked to the current user
   */
  async listCredentials() {
    try {
      return (await this.client.get("/credentials")).credentials;
    } catch (r) {
      throw j(r, "Failed to list credentials");
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
      throw j(s, "Failed to unlink credential");
    }
  }
}
function Mo() {
  const { config: e, authState: r, _internal: s } = J(), [o, n] = S([]), [a, i] = S(!1), [d, l] = S(null), h = q(
    () => new iu(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), m = P(() => {
    l(null);
  }, []), u = P(async () => {
    if (r !== "authenticated") {
      n([]);
      return;
    }
    i(!0), l(null);
    try {
      const y = await h.listCredentials();
      n(y);
    } catch (y) {
      l(y);
    } finally {
      i(!1);
    }
  }, [r, h]);
  F(() => {
    r === "authenticated" ? u() : n([]);
  }, [r, u]);
  const p = P(
    async (y) => {
      i(!0), l(null);
      try {
        await h.unlinkCredential(y), await u();
      } catch (w) {
        throw l(w), w;
      } finally {
        i(!1);
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
function cu({
  onPasswordChange: e,
  onCancel: r,
  className: s = ""
}) {
  const { isLoading: o, error: n, changePassword: a, clearError: i } = $t(), [d, l] = S(""), [h, m] = S(""), [u, p] = S(""), [y, w] = S(null), [g, k] = S(null), A = zt(h), C = h === u, E = d.length > 0 && h.length > 0 && u.length > 0 && A.isValid && C, x = P(async () => {
    if (E) {
      w(null), k(null);
      try {
        await a({ currentPassword: d, newPassword: h }), l(""), m(""), p(""), k("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => r(), 2e3);
      } catch (f) {
        w(f instanceof Error ? f.message : "Failed to change password");
      }
    }
  }, [E, d, h, a, e, r]), L = P(() => {
    w(null), i(), r();
  }, [i, r]);
  return /* @__PURE__ */ t("div", { className: `cedros-profile-settings ${s}`, children: /* @__PURE__ */ c("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ t("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ t("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (y || n) && /* @__PURE__ */ t("div", { className: "cedros-profile-error", children: /* @__PURE__ */ t(
      le,
      {
        error: { code: "UNKNOWN_ERROR", message: y || n?.message || "" },
        onDismiss: () => {
          w(null), i();
        }
      }
    ) }),
    g && /* @__PURE__ */ c("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ t("span", { className: "cedros-profile-success-icon", children: "✓" }),
      g
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ t("div", { className: "cedros-profile-field", children: /* @__PURE__ */ t(
        ve,
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
        ve,
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
        ve,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: u,
          onChange: (f) => p(f.target.value),
          disabled: o,
          error: u.length > 0 && !C ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: L,
          disabled: o,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: x,
          disabled: o || !E,
          children: o ? /* @__PURE__ */ c(X, { children: [
            /* @__PURE__ */ t(Z, { size: "sm" }),
            /* @__PURE__ */ t("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) });
}
function lu({ onPasswordChange: e, className: r = "" }) {
  const { user: s, refreshUser: o } = Wt(), { isLoading: n, error: a, updateProfile: i, clearError: d } = $t(), { credentials: l } = Mo(), {
    forgotPassword: h,
    isLoading: m,
    isSuccess: u,
    reset: p
  } = ss(), y = l.some((N) => N.credentialType === "password"), [w, g] = S("view"), [k, A] = S(""), [C, E] = S(null), x = () => s?.name ? s.name.split(" ").map((N) => N[0]).join("").toUpperCase().slice(0, 2) : s?.email ? s.email[0].toUpperCase() : "?", L = P(() => {
    A(s?.name || ""), g("edit"), E(null);
  }, [s?.name]), f = P(async () => {
    const N = k.trim();
    if (N) {
      E(null);
      try {
        await i({ name: N }), await o(), g("view");
      } catch (T) {
        E(T instanceof Error ? T.message : "Failed to update name");
      }
    }
  }, [k, i, o]), b = P(() => {
    g("view"), A(""), E(null), d();
  }, [d]), v = P(async () => {
    if (s?.email) {
      E(null);
      try {
        await h(s.email);
      } catch (N) {
        E(N instanceof Error ? N.message : "Failed to send password setup email");
      }
    }
  }, [s?.email, h]);
  return w === "change-password" ? /* @__PURE__ */ t(
    cu,
    {
      onPasswordChange: e,
      onCancel: () => g("view"),
      className: r
    }
  ) : /* @__PURE__ */ t("div", { className: `cedros-profile-settings ${r}`, children: /* @__PURE__ */ c("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ c("div", { className: "cedros-profile-header", children: [
      /* @__PURE__ */ t("div", { className: "cedros-profile-avatar-container", children: s?.picture ? /* @__PURE__ */ t(
        "img",
        {
          src: s.picture,
          alt: s.name || "Profile",
          className: "cedros-profile-avatar"
        }
      ) : /* @__PURE__ */ t("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: x() }) }),
      /* @__PURE__ */ c("div", { className: "cedros-profile-info", children: [
        w === "edit" ? /* @__PURE__ */ c("div", { className: "cedros-profile-name-edit", children: [
          /* @__PURE__ */ t(
            "input",
            {
              type: "text",
              className: "cedros-input",
              value: k,
              onChange: (N) => A(N.target.value),
              disabled: n,
              autoFocus: !0,
              onKeyDown: (N) => {
                N.key === "Enter" && f(), N.key === "Escape" && b();
              }
            }
          ),
          /* @__PURE__ */ c("div", { className: "cedros-profile-name-edit-actions", children: [
            /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary cedros-button-sm",
                onClick: f,
                disabled: n || !k.trim(),
                children: n ? /* @__PURE__ */ t(Z, { size: "sm" }) : "Save"
              }
            ),
            /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-outline cedros-button-sm",
                onClick: b,
                disabled: n,
                children: "Cancel"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ c("div", { className: "cedros-profile-name-row", children: [
          /* @__PURE__ */ t("h3", { className: "cedros-profile-name", children: s?.name || "User" }),
          /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-profile-edit-btn",
              onClick: L,
              title: "Edit name",
              "aria-label": "Edit name",
              children: /* @__PURE__ */ t(du, {})
            }
          )
        ] }),
        /* @__PURE__ */ t("p", { className: "cedros-profile-email", children: s?.email })
      ] })
    ] }),
    (C || a) && /* @__PURE__ */ t("div", { className: "cedros-profile-error", children: /* @__PURE__ */ t(
      le,
      {
        error: { code: "UNKNOWN_ERROR", message: C || a?.message || "" },
        onDismiss: () => {
          E(null), d();
        }
      }
    ) }),
    /* @__PURE__ */ c("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-profile-section-title", children: "Account" }),
      /* @__PURE__ */ t("div", { className: "cedros-profile-row", children: /* @__PURE__ */ c("div", { className: "cedros-profile-row-content", children: [
        /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Email" }),
        /* @__PURE__ */ t("span", { className: "cedros-profile-row-value", children: s?.email || "Not set" })
      ] }) }),
      /* @__PURE__ */ c("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ c("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-label", children: "Password" }),
          /* @__PURE__ */ t("span", { className: "cedros-profile-row-value", children: y ? "••••••••" : "Not set" })
        ] }),
        y ? /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => {
              g("change-password"), E(null);
            },
            children: "Change"
          }
        ) : u ? /* @__PURE__ */ c("span", { className: "cedros-profile-row-sent", children: [
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
            onClick: v,
            disabled: m,
            children: m ? /* @__PURE__ */ t(Z, { size: "sm" }) : "Add password"
          }
        )
      ] })
    ] })
  ] }) });
}
function du() {
  return /* @__PURE__ */ c("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
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
const Uo = {
  password: "Email & Password",
  oauth_google: "Google",
  oauth_apple: "Apple",
  solana: "Solana Wallet",
  webauthn_passkey: "Passkey",
  webauthn_security_key: "Security Key",
  totp: "Authenticator App (2FA)",
  sso_oidc: "Single Sign-On"
};
function uu({
  onLinkGoogle: e,
  onLinkApple: r,
  onAddPasskey: s,
  onLinkSolana: o,
  className: n = ""
}) {
  const { credentials: a, isLoading: i, error: d, unlinkCredential: l, clearError: h, fetchCredentials: m } = Mo(), { registerPasskey: u, isSupported: p } = So(), [y, w] = S(null), [g, k] = S(!1), A = P(async () => {
    if (s) {
      s();
      return;
    }
    k(!0);
    try {
      await u(), await m();
    } catch {
    } finally {
      k(!1);
    }
  }, [s, u, m]), C = P(
    async (N) => {
      const T = N.label || Uo[N.credentialType];
      if (window.confirm(
        `Remove "${T}" as a sign-in method? You won't be able to sign in with it anymore.`
      )) {
        w(N.id);
        try {
          await l(N.id);
        } catch {
        } finally {
          w(null);
        }
      }
    },
    [l]
  ), E = new Set(a.map((N) => N.credentialType)), x = e && !E.has("oauth_google"), L = r && !E.has("oauth_apple"), f = (s || p) && !E.has("webauthn_passkey"), b = o && !E.has("solana"), v = x || L || f || b;
  return i && a.length === 0 ? /* @__PURE__ */ c("div", { className: `cedros-linked-accounts ${n}`, children: [
    /* @__PURE__ */ t(Z, {}),
    /* @__PURE__ */ t("span", { children: "Loading linked accounts..." })
  ] }) : /* @__PURE__ */ c("div", { className: `cedros-linked-accounts ${n}`, children: [
    d && /* @__PURE__ */ t(
      le,
      {
        error: { code: "UNKNOWN_ERROR", message: d.message },
        onDismiss: h
      }
    ),
    a.length === 0 && !i && /* @__PURE__ */ t("p", { className: "cedros-linked-accounts-empty", children: "No linked sign-in methods found." }),
    a.length > 0 && /* @__PURE__ */ t("ul", { className: "cedros-linked-credential-list", children: a.map((N) => /* @__PURE__ */ t(
      hu,
      {
        credential: N,
        isUnlinking: y === N.id,
        onUnlink: C
      },
      N.id
    )) }),
    v && /* @__PURE__ */ c("div", { className: "cedros-linked-add", children: [
      /* @__PURE__ */ t("p", { className: "cedros-linked-add-label", children: "Link a new sign-in method" }),
      /* @__PURE__ */ c("div", { className: "cedros-linked-add-buttons", children: [
        x && /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: e,
            children: [
              /* @__PURE__ */ t(Do, {}),
              " Google"
            ]
          }
        ),
        L && /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: r,
            children: [
              /* @__PURE__ */ t(Fo, {}),
              " Apple"
            ]
          }
        ),
        f && /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: A,
            disabled: g,
            children: g ? /* @__PURE__ */ t(Z, { size: "sm" }) : /* @__PURE__ */ c(X, { children: [
              /* @__PURE__ */ t($r, {}),
              " Passkey"
            ] })
          }
        ),
        b && /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: o,
            children: [
              /* @__PURE__ */ t(Oo, {}),
              " Solana"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function hu({
  credential: e,
  isUnlinking: r,
  onUnlink: s
}) {
  const o = e.label || Uo[e.credentialType], n = mu[e.credentialType] || fu;
  return /* @__PURE__ */ c("li", { className: "cedros-linked-credential", children: [
    /* @__PURE__ */ t("div", { className: "cedros-linked-credential__icon", children: /* @__PURE__ */ t(n, {}) }),
    /* @__PURE__ */ c("div", { className: "cedros-linked-credential__info", children: [
      /* @__PURE__ */ t("span", { className: "cedros-linked-credential__name", children: o }),
      /* @__PURE__ */ c("span", { className: "cedros-linked-credential__meta", children: [
        "Added ",
        vn(e.createdAt),
        e.lastUsedAt && /* @__PURE__ */ c(X, { children: [
          " · Last used ",
          vn(e.lastUsedAt)
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
        children: r ? /* @__PURE__ */ t(Z, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function vn(e) {
  const r = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - r.getTime(), n = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), i = Math.floor(o / (1e3 * 60 * 60 * 24));
  return n < 1 ? "just now" : n < 60 ? `${n}m ago` : a < 24 ? `${a}h ago` : i < 30 ? `${i}d ago` : r.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
const mu = {
  password: pu,
  oauth_google: Do,
  oauth_apple: Fo,
  solana: Oo,
  webauthn_passkey: $r,
  webauthn_security_key: $r,
  totp: gu,
  sso_oidc: wu
};
function fu() {
  return /* @__PURE__ */ c("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("path", { d: "M12 8v4m0 4h.01", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function pu() {
  return /* @__PURE__ */ c("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("path", { d: "M7 11V7a5 5 0 0110 0v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ t("circle", { cx: "12", cy: "16", r: "1.5", fill: "currentColor" })
  ] });
}
function Do() {
  return /* @__PURE__ */ c("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("path", { d: "M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 01-2 3.1v2.5h3.3c1.9-1.7 3-4.3 3-7.4z", fill: "#4285F4" }),
    /* @__PURE__ */ t("path", { d: "M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.5c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.4-4H3.2v2.6A10 10 0 0012 22z", fill: "#34A853" }),
    /* @__PURE__ */ t("path", { d: "M6.6 14.1a6 6 0 010-4.2V7.3H3.2a10 10 0 000 9.4l3.4-2.6z", fill: "#FBBC05" }),
    /* @__PURE__ */ t("path", { d: "M12 5.9c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0012 2 10 10 0 003.2 7.3l3.4 2.6C7.3 7.6 9.5 5.9 12 5.9z", fill: "#EA4335" })
  ] });
}
function Fo() {
  return /* @__PURE__ */ t("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ t(
    "path",
    {
      d: "M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.16 4.36 9.53 8.72 9.28c1.3.07 2.2.74 2.96.8.93-.2 1.82-.92 3.03-.83 1.47.12 2.57.72 3.28 1.83-3.02 1.8-2.3 5.75.5 6.86-.6 1.53-1.37 3.04-2.44 4.34zM12.03 9.2C11.88 7.17 13.5 5.5 15.4 5.35c.29 2.28-2.08 3.98-3.37 3.85z",
      fill: "currentColor"
    }
  ) });
}
function Oo() {
  return /* @__PURE__ */ c("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("rect", { x: "2", y: "6", width: "20", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("path", { d: "M2 10h20", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("circle", { cx: "17", cy: "14", r: "1.5", fill: "currentColor" })
  ] });
}
function $r() {
  return /* @__PURE__ */ c("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("circle", { cx: "10", cy: "7", r: "4", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("path", { d: "M3 21v-2a7 7 0 017-7", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ t("path", { d: "M17 14v4m0 0v2m0-2h-2m2 0h2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function gu() {
  return /* @__PURE__ */ c("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("path", { d: "M9 12h6M12 9v6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function wu() {
  return /* @__PURE__ */ c("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ t("rect", { x: "3", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("rect", { x: "13", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("rect", { x: "3", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ t("rect", { x: "13", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" })
  ] });
}
class yu {
  client;
  constructor(r, s, o, n) {
    this.client = new ae({ baseUrl: r, timeoutMs: s, retryAttempts: o, getAccessToken: n });
  }
  /**
   * List all active sessions for the current user
   */
  async listSessions() {
    try {
      return (await this.client.get("/sessions")).sessions;
    } catch (r) {
      throw j(r, "Failed to list sessions");
    }
  }
  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions() {
    try {
      return await this.client.delete("/sessions");
    } catch (r) {
      throw j(r, "Failed to revoke sessions");
    }
  }
}
function bu() {
  const { config: e, authState: r, _internal: s } = J(), [o, n] = S([]), [a, i] = S(!1), [d, l] = S(null), h = q(
    () => new yu(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      s?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, s]
  ), m = P(async () => {
    if (r !== "authenticated") {
      n([]);
      return;
    }
    i(!0), l(null);
    try {
      const y = await h.listSessions();
      n(y);
    } catch (y) {
      l(y);
    } finally {
      i(!1);
    }
  }, [r, h]);
  F(() => {
    r === "authenticated" ? m() : n([]);
  }, [r, m]);
  const u = P(async () => {
    i(!0), l(null);
    try {
      const y = await h.revokeAllSessions();
      return await m(), y;
    } catch (y) {
      throw l(y), y;
    } finally {
      i(!1);
    }
  }, [h, m]), p = q(() => o.filter((y) => !y.isCurrent).length, [o]);
  return {
    sessions: o,
    isLoading: a,
    error: d,
    fetchSessions: m,
    revokeAllSessions: u,
    otherSessionCount: p
  };
}
const vu = {
  profile: "Profile",
  security: "Security",
  linked: "Linked Accounts"
}, Au = ["profile", "security", "linked"];
function im({
  defaultTab: e = "profile",
  onClose: r,
  onPasswordChange: s,
  onTotpChange: o,
  onLinkGoogle: n,
  onLinkApple: a,
  onAddPasskey: i,
  onLinkSolana: d,
  className: l = ""
}) {
  const [h, m] = S(e), { sessions: u, isLoading: p, error: y, revokeAllSessions: w } = bu();
  return /* @__PURE__ */ c("div", { className: `cedros-account-settings ${l}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-account-tabs--line", role: "tablist", children: Au.map((g) => /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        role: "tab",
        "aria-selected": h === g,
        className: `cedros-account-tab ${h === g ? "cedros-account-tab-active" : ""}`,
        onClick: () => m(g),
        children: vu[g]
      },
      g
    )) }),
    /* @__PURE__ */ c("div", { className: "cedros-account-tab-content", role: "tabpanel", children: [
      h === "profile" && /* @__PURE__ */ t(lu, { onPasswordChange: s }),
      h === "security" && /* @__PURE__ */ c("div", { className: "cedros-account-security", children: [
        /* @__PURE__ */ t(nu, { onStatusChange: o }),
        /* @__PURE__ */ t(
          ll,
          {
            sessions: u,
            isLoading: p,
            error: y ?? void 0,
            onRevokeAll: async () => {
              await w();
            }
          }
        )
      ] }),
      h === "linked" && /* @__PURE__ */ t(
        uu,
        {
          onLinkGoogle: n,
          onLinkApple: a,
          onAddPasskey: i,
          onLinkSolana: d
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
function cm({ onComplete: e, className: r }) {
  return /* @__PURE__ */ c("div", { className: `cedros-mfa-setup-prompt ${r ?? ""}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-mfa-setup-prompt__header", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-mfa-setup-prompt__title", children: "Two-factor authentication required" }),
      /* @__PURE__ */ t("p", { className: "cedros-mfa-setup-prompt__description", children: "Your administrator requires you to set up two-factor authentication before continuing. This adds an extra layer of security to your account." })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-mfa-setup-prompt__body", children: /* @__PURE__ */ t(Io, { onSuccess: e }) })
  ] });
}
function lm({
  onComplete: e,
  onSkip: r,
  className: s
}) {
  const { user: o } = Wt(), { isLoading: n, error: a, updateProfile: i, clearError: d } = $t(), [l, h] = S(o?.name ?? ""), m = P(
    async (p) => {
      p.preventDefault(), d();
      const y = l.trim();
      if (!y) {
        e?.();
        return;
      }
      try {
        await i({ name: y }), e?.();
      } catch {
      }
    },
    [l, i, d, e]
  ), u = l.trim().length > 0;
  return /* @__PURE__ */ c("div", { className: `cedros-complete-account ${s ?? ""}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-complete-account__header", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-complete-account__title", children: "Complete Your Profile" }),
      /* @__PURE__ */ t("p", { className: "cedros-complete-account__description", children: "Please fill in your name to get started." })
    ] }),
    /* @__PURE__ */ c("form", { onSubmit: m, className: "cedros-complete-account__form", children: [
      /* @__PURE__ */ c("div", { className: "cedros-complete-account__field", children: [
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
      /* @__PURE__ */ c("div", { className: "cedros-complete-account__actions", children: [
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
function Nu() {
  const { config: e, _internal: r } = J(), [s, o] = S(!1), [n, a] = S(null), i = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), d = P(
    async (m) => await i.get(
      `/username/available?username=${encodeURIComponent(m)}`,
      { credentials: "include" }
    ),
    [i]
  ), l = P(async () => {
    try {
      return (await i.get(
        "/username/available?username=",
        { credentials: "include" }
      )).suggestion ?? null;
    } catch {
      return null;
    }
  }, [i]), h = P(
    async (m) => {
      o(!0), a(null);
      try {
        await i.patch("/me", { username: m });
      } catch (u) {
        const p = u instanceof Error ? u : new Error(String(u));
        throw a(p), p;
      } finally {
        o(!1);
      }
    },
    [i]
  );
  return { checkAvailability: d, getSuggestion: l, setUsername: h, isLoading: s, error: n };
}
function dm({
  onComplete: e,
  onSkip: r,
  className: s
}) {
  const { checkAvailability: o, getSuggestion: n, setUsername: a, isLoading: i, error: d } = Nu(), [l, h] = S(""), [m, u] = S("idle"), [p, y] = S(""), w = se(null), g = se(!0);
  F(() => (g.current = !0, n().then((E) => {
    g.current && E && (h(E), u("available"), y("Available"));
  }), () => {
    g.current = !1;
  }), [n]);
  const k = P(
    (E) => {
      const x = E.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (h(x), u("idle"), y(""), w.current && clearTimeout(w.current), x.length < 3) {
        x.length > 0 && (u("error"), y("At least 3 characters"));
        return;
      }
      u("checking"), w.current = setTimeout(async () => {
        try {
          const L = await o(x);
          if (!g.current) return;
          L.error ? (u("error"), y(L.error)) : L.available ? (u("available"), y("Available")) : (u("taken"), y("Already taken"), L.suggestion);
        } catch {
          if (!g.current) return;
          u("error"), y("Could not check availability");
        }
      }, 400);
    },
    [o]
  ), A = P(
    async (E) => {
      if (E.preventDefault(), !(m !== "available" || !l.trim()))
        try {
          await a(l.trim()), e?.();
        } catch {
        }
    },
    [l, m, a, e]
  ), C = m === "available" && !i;
  return /* @__PURE__ */ c("div", { className: `cedros-choose-username ${s ?? ""}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-choose-username__header", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-choose-username__title", children: "Choose a Username" }),
      /* @__PURE__ */ t("p", { className: "cedros-choose-username__description", children: "Pick a unique handle for your account." })
    ] }),
    /* @__PURE__ */ c("form", { onSubmit: A, className: "cedros-choose-username__form", children: [
      /* @__PURE__ */ c("div", { className: "cedros-choose-username__field", children: [
        /* @__PURE__ */ t(
          "label",
          {
            htmlFor: "cedros-choose-username",
            className: "cedros-choose-username__label",
            children: "Username"
          }
        ),
        /* @__PURE__ */ c("div", { className: "cedros-choose-username__input-wrapper", children: [
          /* @__PURE__ */ t("span", { className: "cedros-choose-username__prefix", children: "@" }),
          /* @__PURE__ */ t(
            "input",
            {
              id: "cedros-choose-username",
              type: "text",
              value: l,
              onChange: (E) => k(E.target.value),
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
      /* @__PURE__ */ c("div", { className: "cedros-choose-username__actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "submit",
            className: "cedros-choose-username__button cedros-choose-username__button--primary",
            disabled: !C,
            children: i ? "Saving..." : "Continue"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-choose-username__button cedros-choose-username__button--secondary",
            onClick: r,
            disabled: i,
            children: "Skip"
          }
        )
      ] })
    ] })
  ] });
}
function ku() {
  const e = He(), [r, s] = S(!1), [o, n] = S(null), a = q(() => e ? new ae({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), i = P(() => {
    n(null);
  }, []), d = P(
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
        const k = j(g, "Failed to execute deposit");
        throw n(k.message), k;
      } finally {
        s(!1);
      }
    },
    [a]
  ), l = P(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      return await a.get(`/deposit/status/${encodeURIComponent(w)}`);
    },
    [a]
  ), h = P(async () => {
    if (!a)
      throw new Error("useDeposit must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await a.get("/deposit/config");
    } catch (w) {
      const g = j(w, "Failed to get deposit config");
      throw n(g.message), g;
    } finally {
      s(!1);
    }
  }, [a]), m = P(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const g = new URLSearchParams();
        w?.limit !== void 0 && g.set("limit", String(w.limit)), w?.offset !== void 0 && g.set("offset", String(w.offset));
        const k = g.toString(), A = k ? `/deposits?${k}` : "/deposits";
        return await a.get(A);
      } catch (g) {
        const k = j(g, "Failed to list deposits");
        throw n(k.message), k;
      } finally {
        s(!1);
      }
    },
    [a]
  ), u = P(
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
        const k = j(g, "Failed to get deposit quote");
        throw n(k.message), k;
      } finally {
        s(!1);
      }
    },
    [a]
  ), p = P(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await a.post("/deposit/public", w);
      } catch (g) {
        const k = j(g, "Failed to execute public deposit");
        throw n(k.message), k;
      } finally {
        s(!1);
      }
    },
    [a]
  ), y = P(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        return await a.post("/deposit/micro", w);
      } catch (g) {
        const k = j(g, "Failed to execute micro deposit");
        throw n(k.message), k;
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
    microDeposit: y,
    getStatus: l,
    getConfig: h,
    listDeposits: m,
    isLoading: r,
    error: o,
    clearError: i
  };
}
function Wo({
  tokens: e,
  selectedToken: r,
  onSelect: s,
  openSignal: o,
  placeholder: n = "Select token",
  disabled: a = !1,
  className: i = "",
  searchable: d = !0
}) {
  const [l, h] = S(!1), [m, u] = S(""), p = se(null), y = se(null), w = q(() => {
    if (!m.trim()) return e;
    const C = m.toLowerCase();
    return e.filter(
      (E) => E.symbol.toLowerCase().includes(C) || E.name.toLowerCase().includes(C) || E.mint.toLowerCase().includes(C)
    );
  }, [e, m]);
  F(() => {
    const C = (E) => {
      p.current && !p.current.contains(E.target) && (h(!1), u(""));
    };
    if (l)
      return document.addEventListener("mousedown", C), () => document.removeEventListener("mousedown", C);
  }, [l]), F(() => {
    l && d && y.current && y.current.focus();
  }, [l, d]), F(() => {
    o === void 0 || a || (h(!0), u(""));
  }, [o, a]);
  const g = P(() => {
    a || (h((C) => !C), l && u(""));
  }, [a, l]), k = P(
    (C) => {
      s(C), h(!1), u("");
    },
    [s]
  ), A = P(
    (C) => {
      C.key === "Escape" ? (h(!1), u("")) : C.key === "Enter" && w.length === 1 && k(w[0]);
    },
    [w, k]
  );
  return /* @__PURE__ */ c(
    "div",
    {
      ref: p,
      className: `cedros-token-selector ${l ? "cedros-token-selector-open" : ""} ${a ? "cedros-token-selector-disabled" : ""} ${i}`,
      onKeyDown: A,
      children: [
        /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            className: "cedros-token-selector-trigger",
            onClick: g,
            disabled: a,
            "aria-haspopup": "listbox",
            "aria-expanded": l,
            children: [
              r ? /* @__PURE__ */ c("span", { className: "cedros-token-selector-selected", children: [
                r.logoUrl && /* @__PURE__ */ t(
                  "img",
                  {
                    src: r.logoUrl,
                    alt: r.symbol,
                    className: "cedros-token-icon",
                    onError: (C) => {
                      C.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ t("span", { className: "cedros-token-symbol", children: r.symbol })
              ] }) : /* @__PURE__ */ t("span", { className: "cedros-token-selector-placeholder", children: n }),
              /* @__PURE__ */ t("span", { className: "cedros-token-selector-arrow", children: l ? "▲" : "▼" })
            ]
          }
        ),
        l && /* @__PURE__ */ c("div", { className: "cedros-token-selector-dropdown", role: "listbox", children: [
          d && /* @__PURE__ */ t("div", { className: "cedros-token-search", children: /* @__PURE__ */ t(
            "input",
            {
              ref: y,
              type: "text",
              value: m,
              onChange: (C) => u(C.target.value),
              placeholder: "Search tokens...",
              className: "cedros-token-search-input"
            }
          ) }),
          /* @__PURE__ */ t("div", { className: "cedros-token-list", children: w.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-token-empty", children: "No tokens found" }) : /* @__PURE__ */ t(X, { children: w.map((C) => /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              className: `cedros-token-option ${r?.mint === C.mint ? "cedros-token-option-selected" : ""}`,
              onClick: () => k(C),
              role: "option",
              "aria-selected": r?.mint === C.mint,
              children: [
                C.logoUrl && /* @__PURE__ */ t(
                  "img",
                  {
                    src: C.logoUrl,
                    alt: C.symbol,
                    className: "cedros-token-icon",
                    onError: (E) => {
                      E.target.style.display = "none";
                    }
                  }
                ),
                /* @__PURE__ */ c("span", { className: "cedros-token-info", children: [
                  /* @__PURE__ */ t("span", { className: "cedros-token-symbol", children: C.symbol }),
                  /* @__PURE__ */ t("span", { className: "cedros-token-name", children: C.name })
                ] }),
                r?.mint === C.mint && /* @__PURE__ */ t("span", { className: "cedros-token-check", children: "✓" })
              ]
            },
            C.mint
          )) }) })
        ] })
      ]
    }
  );
}
function as(e, r) {
  return r.privateDepositsEnabled && e >= r.privateMinUsd ? "private" : e >= r.publicMinUsd ? "public" : "sol_micro";
}
const is = "data:image/webp;base64,UklGRkACAABXRUJQVlA4IDQCAACQDQCdASo8ADwAPjEWiUMiISEUBFQgAwSgB4Z/TeLt3XMAoQH23eph0gPMB+sn+M9tvngOsA9ADwgPg3/cH9sfZciikEBuA1AB+nf+84CUkAVvA2x4xvyobR+mBaYhjUv/ewHb4hTqOnP38rzsxZX2inOSciAA/v7uqvqGdpWcjjrfMDFaNHumTog38t3yor0kbjn631VsX61cAC749wWuAX74u/f/hpeDFqS/ci8E1g94wk9UVs7BHqtv7f/M9iT1u5ITJV0Gv6tE/CW5j/nVR6yExJ6JoDRDOWQ8zVpWH92r3Lnbnc4WJpOchbRT3H5rv//6PP+F//4ehLUlR/4tkRUKZu/yOa26+sywmY+Xc1X2lXMcUv7+eQ7+FBE7bhKc7htieBfH4eR134AVaILL7PWA2FjzAjfaP1Lgirqoq/ZooE8jVD/b4g3J3O3/TG/4ajHe6clnAI/4NdwrnHX0P/quBU03HqSsQ0qsEMAuhrH/jn+YtDzmjm8q/cGJ44qvi24Hn+G1kxz2XP2S/Gp7ri5cMlo+muuwBjyNJnnEcTt/5cRdYS2cbEBZtpINWj3PuC1EOsd/8cTepSpxODcJHLzktfC1PHW3Pgoh3J5PHjW3TCQ1Wlu/wP8e8OPfNm48BODGChioj3ezblqrOBV+cI+hLi7ReJdvBF/4jY+/Un0asuWnrA6kRNpgOeO8wyl4Ryhkrff+9R1SpyPYP+5T3EuWWLZaCn0bGzyk97S3VAAAAAA=", Cu = 1e4, Ot = 1e3, qo = 3;
function Eu(e) {
  return Number.isFinite(e) ? `$${Math.round(e)}` : "$0";
}
function Su(e, r) {
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
        detail: `SOL only under ${Eu(r.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens."
      };
  }
}
function cs(e, r, s) {
  return Math.min(Math.max(e, r), s);
}
function xu(e, r) {
  if (r <= 0) return 0;
  const s = cs(e / r, 0, 1);
  return Math.round(Math.pow(s, 1 / qo) * Ot);
}
function _u(e, r) {
  const s = cs(e / Ot, 0, 1);
  return r * Math.pow(s, qo);
}
function zo(e) {
  return e < 10 ? 0.01 : e < 100 ? 1 : e < 500 ? 5 : e < 1e3 ? 10 : e < 5e3 ? 25 : 50;
}
function Lu(e) {
  return e < 1 ? 2 : 0;
}
function An(e) {
  const r = zo(e), s = Math.round(e / r) * r, o = Lu(r);
  return Number(s.toFixed(o));
}
function jo({
  config: e,
  valueUsd: r,
  onChange: s,
  maxUsd: o = Cu,
  disabled: n = !1,
  className: a = ""
}) {
  const i = cs(Number.isFinite(r) ? r : 0, 0, o), d = q(() => as(i, e), [i, e]), l = Su(d, e), h = xu(i, o), m = h / Ot * 100;
  return /* @__PURE__ */ c("div", { className: `cedros-tiered-slider ${a}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-tiered-slider-input-row", children: [
      /* @__PURE__ */ c("div", { className: "cedros-tiered-slider-input", children: [
        /* @__PURE__ */ t("span", { className: "cedros-tiered-slider-currency", children: "$" }),
        /* @__PURE__ */ t(
          "input",
          {
            type: "number",
            value: i || "",
            onChange: (u) => s(An(Math.max(0, Math.min(parseFloat(u.target.value) || 0, o)))),
            placeholder: "Enter amount",
            disabled: n,
            min: 0,
            step: zo(i),
            className: "cedros-deposit-flow-input cedros-tiered-slider-input-field",
            "aria-label": "Deposit amount"
          }
        )
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-tiered-slider-tier", children: [
        /* @__PURE__ */ c("span", { className: `cedros-tiered-slider-badge cedros-tiered-slider-badge-${d}`, children: [
          d === "sol_micro" && /* @__PURE__ */ t("img", { src: is, alt: "SOL", className: "cedros-tiered-slider-badge-icon" }),
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
        max: Ot,
        step: 1,
        value: h,
        onChange: (u) => s(An(_u(parseFloat(u.target.value), o))),
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
const Pu = "data:image/webp;base64,UklGRmIEAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IIIDAADwDwCdASo8ADwAPm0qkUWkIqGWDVeYQAbEtgBOmZMBu+H816ov3b8R8R2g2FXtxdyh5s3+A60v0APLi9ktgGB/LZjWNAXqgpE6jfW0NF+P4xEhH2L7M+26iGwrTjjcQegyCZqxs+ifvZANjWd279diqZNKUrgOTVtjJGtW4IVtRhMECd5aWVgAAP7nDv3UY/8f1l//xTP/FM/8NU8c9g//sC3+bX/1HZXsNsM57VKG2LVf1a0KdncWO8uPo/Oh79m9ZqjJZwXfPXuvwkK+WDOl6+N8C2Ux6no/V/zkoucKK/JZek7MR5sS8TknXB+6BuVDXou9Rx4aUea2q2IzvLvFIujjKsVYLMab7j9zo48fhgm9YOtjmWuS0WZ4c+6ta0mr3xF4fcdAIFf6oXRSlqovOX0HUiMV//hXwSX1cfP5cLj8c7OTyT/4ce4olJARV95GoY8oF+2uU0blGul3ItlG7c2Hl2/uC6s2WZc7Zukwojx6ed8t97bZ68N1uzCLzPlG7BuYS17F19e0wXnc6vEl3q7ft0K7OEl7r8mY6Kh+Nt/5V/Lp68mFBjLem1JjvC371+lKwez4KCdXwNo2Z04FqyzGpFutY6YQ/r5Tfu7Oi+oNfN0R/W+D4aj1nqHhlqYJzpx2NK4mj0gJIXmX8EArelSQI8mV4Ux9MRPwC2PuZhLTjQZv+Vl4p0D8bSB+Z0rek3hS6G1r80fW3cn767Pz/bXanjVmm34wt1nQPqdJObrZ7vv2NWcEuQKj9d+V6DzeDrq0CtGNcanEB5MY9agi1E6BprEScTdfPXjBeMnPbpD+QO6P7IW4UZ9etCCHtX++S/fl5Iz5RzUr10ojRMw//35C0yTjSEhbe884dPwor64n//KByjUFEGsCPAAXPJp1+O+SiKfUaODq6ncjKayTHXjoXgM7XP1z4sBhIKJZJRiM7vGC/+v/Sk8/jbgZLZDAVz1vLou93y7Yd8hxcWM/BesxgWgeKvl8fjE/Ud8tQKp4425hWh66lzzwxa4J3ctA4/E50wX/eoBOgq0B7+7S6FK4wvPHSNgfh+vwSWIJsJLt/3yjBeb41RRyMDMZqFQTZPEdFpXp48ExEyDayZ6objbjTHoS5WQDnDQpRyqMNKfvd41nhEPdb/hxpzXeTIjWmfHHCT+CQYWXDqLehCh1cRyeYOBwsSlSw5PiquAbsgAARVhJRroAAABFeGlmAABJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAEgAAAABAAAASAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAPAAAAAOgBAABAAAAPAAAAAAAAAA=", Tu = "data:image/webp;base64,UklGRtgCAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IPgBAABQCwCdASo8ADwAPm0wk0ekIqGhKBQMqIANiWkADPF3uV2D8VcQGk1mg+P36i9SLnZvYAQxszEWYzEwX1RVkqG/4BGbJgMSHqhKDFsjWsGfPPrvfef11goNmCDDlBJHVVD+8gAA/vu4q03kl+E7FpjtZ2gc8pQ619Hjv9NywoRZ6az43C1wcrRr/lWzJlJhLWMHN0MkVl1ueAf6Hn8StVzeUfMBXOKkgfe2msx7QWR5PnHW/5c6/35yrtWnrURc2q6UYlGin+v8C2dQqexkW6rX2EEijTI9eEQ46PWH3/59fM2AlMvvR2abaRk5XX7V1triQncRxvMfz5YmYDN+PY/ikcZUNaiFucKoUq5riv0eKCezuFNHecE11ojwJqWRSTWpalkz5autXp6vFS+FT1tWUsB/fs1CCOZxaA1vR1grOEaiuKe1RYm7e05psWtqbXLVmm1bA8Ly9PFkVdCbc6hR3UuBBsFGnVeGOUeMn2onnfvYhBMcM9YPxGdQkwZLXOk1VuQSTk01Shf3fZrFyRlFauftFdPYhKXwqrr+meav1P+KLKBVosqmHnFFfgExsQ/rOf3TSd+mOqQfJA+cF+HojNU7nmM3uDkoCBi+//Gqp+gPNNW8M4LFrol8rxE+7WsjqMgfwv1f+Nr25RtG1Wa/KkniRCAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Ru = "data:image/webp;base64,UklGRhYJAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSGICAAABkJz9nzon3/nNJGnBXRvBI0sDkR7slpRBaMDl5LByx7cEyBWHtWd+8/uiK/95uEfEBKBnFwRwk6Wjm89PW2Tj9OWNo7VxASQ4DDoIML9fbdLYpbFR21tykDAY8ZCLT9okqZrsD0uqJNl5sj6CIAPwDmdqRlNlz6o0vroE5/vlPObv0kyN/dVE3pmHd31xgt0P1MgBauTHLYjrg2DoClM0DtRi4kmA6ylgrMq2cuDaZm0CoQePyTqVhVTWJ+G7EozXqSyosj4K6cIhVBhZ2MjyMNy/BFcZWeDIE8g/PLaoLLRyF/4vgrlPTMVK/DQH+cPjGpUFV17/i6BEZeGVF+Dh4F/kUYGDR4nKDBPX4AX381Deh2C1Q8vB2F4CDqnMUrkPlPMpY+obLQ/j9+k1GjNNLB0z5hJ5fD0f5Y2XTLkkPn9Hy8X4vsGMW/xvt3JqvKflYnz3nCmXxJc3qLlEXj9mzOe4xJSLcW36Oy0P47cplKl5KMvAfj6HwFKbloOxswrBfWoOyvsQjzWmPErwcKhQi6d84eHgcSGPEgSA4Dq1aMpr8PjL3CemYiV+moP8AY9darGUW/D4u+CEsUiRVyH4p8NwmbE4kZUA9y8IRuvUoijr4xB06zFZpxZDWZ+ER/cBEzW2dXDaZnUMAb06hBOmaIOxmHhlCILenWDrI6MOIio/7kIc+uk85u+SSftkasZ78/AOffYOl17RqNqbqtFqZ+A8+i8BI+tPOiRNNdkfllSNZPvJRYEXDDQI3NJerUFjl8ZmbX8ekIBBuyCAjK8d3Xh52iBbp89vHl2ecIAEh54BVlA4IMwFAADQGwCdASo8ADwAPm0qkkYkIiGhLhtqqIANiWwAqSdaNo+beZFT37f+J9yXOd2J6HfQh5gH6edIDzAfst6vXoO9AD/Lf4DrAP2V9gDzY/+57F39p/3/7k+0RmjvYp/meic9ieyvJnZVfquF/a23ZOCHGT/sfDDjQ89zOL9Gewd+s3Vh/b32Gf28Ejb5ttLg9hoDiFb2tMW81eZU9Z1LHfdRSCsRMzHz0WT4BNgUakGf9oJtrGtVJFxHJfxAatIxnW1qjDi9i3DQtJp9pVNKlMoJEWdPKv3KaaFSlhd/aMGiir9CPcex5QAA+fpjxA6zfUamE3wS2zWwLVrt/fXA5+Wvx9j5SID0zuEHU2LisPUxvtRuIUwNrsUis8zy+IMpzft+ZSg+9gdx9e6+ZvPmtj4OByz5qo26J3rXhPy8LBXSpuPb+f+mP4CoTvYDhzQXh/SIGj8Ez1+W5MJ/Tkdw09wPCs3JuR3yoqO63FH/j81xW5Abr7tCdwfXwv3CXDtOcHwUqPCd1aiU2uT6XwgdnYqYygEXGKFx8nmaUvqSn9p8HmIA9dVTOoEnqYFjrNfWY034N2vjohd16cxnkP4PYvHkIOWa/FEUug7/qbJ/GFLPxNh6y9eQ//MzzXbcPwsT2chWXPBXNVF1S9dxv5NUuEueiw2kdebblQuvUSRLN+zx3VyT2lOzWBUqrzsTmeOlxjVcTA83H99r35O4X7WXNq7HExiWXxrdM/Ih4CvPJaEHPxUE/i6WIz6+VGq4RB3sBKl3P4M7/DLWAwCnwcpX228XezqQ4cS2tttWxLTc9cPd1ofek9qF9lpB8RvakdPnj2PruFA9W3iKbNdmgnb+mIpohHuUR73KdDDOHbyfAiOjPzzqomnIU3jcSt7LKOB/Op97sCk0yd18mVG3prs351B+xmCE2Zd3RFKL+mpMz5qcuAFAfRyodbggdgmFGkEGQ33VryYFl/upr31FGdI52sqzuxd7jZIsqCcznUH/gu+xaBw7wla49EmFNf+Ss+91i9Hsys0FS//Ktru1xWgkeEweX77y6Oot5tHQsDxgy0sAI85V7FmlpiiWXQdM12MGfCBfyRM+N23SjOdReeSILYCgsM3r33/54X+lfDVNj427MvbDFtKccqazlQ+iKqC//MvYwqyiJPL1ZbVoCEP774fKZA3D3qvsVPGlp9LPchpTs4mTJugt8qXl82RwXQCDNZXnbEois53E35hkRr+IJhndoRo1o2sZDoTgykbeOKiynPH03+BcUQ8zmxTmiVlHQym/LL3kRREnUlxs2zPPGb2E+Rpdib+LxOvFSmj9RfTZoYIJnrqNnBIXV2lt7xeZ0srf98JymJxrtr8lx69oSNZIReDddL+3iiUjh6lm7EcYuclqBaKp8q68geo7H1EvKy4nSRx5Q+uz4l/ypo2hVdwi9l+BHjZZmJ7lXkpNTRJ0gZpzquzN2vh/MZQALV6FZ6q4aofA9AJy1DVLdNjV8n6s9eFA5pazxwhLW4tgWMciGf5x6G7HqFPTL1ZL3l447zLGUkqAXjkeVaNmxZ2oNKIuTy6JDc0Z61Z2dgbsg6HwCX1/ux5sk82WsnNIO4CTnWKI1aCtQZaEsBf6hIl9n7VBsgZGIcPpqn7P4mbyf3EbfdfQ32qlawLuAxmDlwRsVsPkw7j4aKbvIBykNcsVXv0/X6UXXaAtw3feJnTwDak2qY6QpMLE9e7PJeuQQ8FXpqI5HoR82kd+DOwGH5F3OpuWsmEt8v7WQG8q1LMkg6vrl3I8047zMl1Yq0VwotbrsKJocsHgsbs/PGOO9v2s8U0Sju/71XRtG5skcy2msae3wixjlGR4i6ZfldMehQD1zf/FbWN9hnHfpq1Fh8+PSA9AzUi33qli8ixISbH+tw7CcumxvegMk88HMNZlVdnIEzIfyHrSdZ2S98yX2OYZw0+JyaBbQxI0fOr6KpuMD6FVGLrdN9dgOTgOPQgAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Bu = "data:image/webp;base64,UklGRo4EAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSA4CAAABkGXb2to2V9/v6D1Jmd5CQ5GXPYXAJMrtPOJMoMzMzDgIPYY5+vVds6T/m0BEOGzAtm1IBlR2d8kXUMyaADjeuHr9V7qj3E5/XrvaOA5AHCqzFgHTFz9tUTmEyq1PF6cBqVWDOLjkwS6VPsu8KqnaewRU7j5KIjipgFiQfCf1IGch8wMlv9QhcWk4nLlL9Z4l6b3y7hmUvGQkmF1nnrMC85zrc5CozDUQtwamisNSDCmxjL5jpqxMzfhutFCCY3+5110CaI9/jhVIcPg/DxiIB/x/eKgijLxkRobTyxFEw7zVm0NqcYg5LNAzKD3n4QbmyRVqWCiXJyD9uN7z0Ha9Dw4N5gzOnHU4IMJ7egt8HuYWasIJnlg46fkYgul9qgWU+9PA2Z7b2FngnR3e49Qm1QbKzVPNnltZ8wozK2S8et0SN34wt0LOnynVCsp02xI7tKSqqXYsV7ZtD/lpeaEfNyw/k9evWuKK7XfQ9ruP9/RW/s74t872N1bw2MY8n0Acmlb/KQ04AJ8t5PkeEbpDnbmR2/5392FiOfRFlCuTkIGsMh/aPBeGZFLBYuiM1IIUZLOD0NnMNBMWZdE/4bLo32MQ0wxcJnsvhcnerRhSLvPPhcj8s5DIsmtU6Tj1L1U6zvcEElfrVlHyqGy3epC4om5Vsg3OlO50UQ2V6Qa65LWf6TZ1J/11faBLlpgAVlA4IJgBAADwCQCdASo8ADwAPm0ylEckIyIhKAoAgA2JaQATzh4OcBkEByVmbl5z9gD9U/+J2APQgLaX4twLu19/UVxAWN1IKXE4cIqJBhoyQ0yDYn61m3zk6T7FMg0AAP78+EMvGgC8jLXmcbbmqvufKjG8Tv1M9Krl47vOW74O/Rapv2DgXbg9iK6PrRQG/9d9+rF/ESxzbszVFn3GThrMBmsklj/LPWDQ0pKzG7EyjQL6p6gfUwMze+wPhzJpn8tMqlUVgq6/QSUVcgG+ztsi73rA3vl3n4baeF1INsbuosTXtnsotVYuTii6rscx9OUTvevYcPNvcL9MPhyWeCQw0qynnGtzCIw+oFRN0+TN1mqXkFyk/rFBcH+FHiI6s9XX5EWCKn5vTRt/0RbS687PiXPFC5Zk/Gk4+538IYi+HZDjvlQQWOH/vddfYTerQ5QqWJt1YuaZNThQ2u+/DtXfZPRy1iWWLR9SKFFtlGrqBKWF5nPRPWWMNA3OssvUtvCNBLBA4cn1whzy+SpbgLvnaepxiykjKsU/MhzgAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Iu = "data:image/webp;base64,UklGRqwEAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSL8BAAABkGvbtmlLc5997yvbmW19gBnbDm2kjF5UmW3bthXZVZFdZ+81r+87Z1XlEaHIbSNlMstwos4XUBSTLAFQo/u01Zdf/yLDDze3zB/YwADJEoOoJAKg7oTdH4SF+XxiZlMgSESzwAJdVn2iUJzzOUMiLhQKf+/va2FtBLMBuu1zpHcsincUXhtoTKLsCTVX/KF3wrLhPLm/OWzZtjQWfZ7RhYyAC/lxMowpSzJYJAyFkZDQc21FBMUT7BqGjpHxf3m+XlEPUHE/f3vGgPzmw4awRUaTexkyJhwfNShctVgZXyJDXq4CUyjNy6Y4fVOBIkAPR2GcOE7Jm2NQ/RE9YzXht3a5VYvlOX0xF0fy+tp/ozBuQg6DzZYb6Bi7ed4rB5Mp/1Co4cNhLUo1StLxDIDqrynUoRswiF6nFnIxsDpnZ5WBW0GFZ1qZ8HfLDk5txHHsGDpSa6B0cXZEa+DsTr1M+P4qPdXwjynU4+1/a7oN3Sm6G+meSd27oHsHde++7puj+tYpv7G6b7vun6L7l6n+oZp/t7JmUNUqqhpJV5upakJVLaqqgVW1t6rmV401NGMc1djqH4rpIseSfyPFkgAAVlA4IAQCAABQDACdASo8ADwAPm0yk0akIyGhJgzogA2JaQAThroHvLxu+aPf5G2BYxv+B6XHzx6GPon/o+qz/tOAA/TM82gR0vnExWoiQRM36jlg2UIvwCSqySErzuguz9EP2x/7hsNazr91aIworWI7AAD+/TZ+6Ipl444OdT+2wU0Ov+T8oJuVP/vUbT/w1Jsv6Awnl6rvF/xetfOPt3gTQZZi0Y/AOx563J7CJkqTR/fc/n34zyeKzR80fhfv4ef+Hjhz/CX5aQo+58zg/FdE+7bLoophGfG0szI513EH+q+Gc73H1PFdJYf7CF8v5dhr3tMwEVX5Ji2ZxejK8xrf/E6nVXqlA4DrYNRP09InHc+fEqO/fH8xr+rMf4y1F9TOnwVffZblLoTP6lot0m/sh7sTiDQr0mIA8TiHoOffGDG6KzV+B3239udfhzD740gkRi/m53abX0Ku3vAgadgFFqL0vk8M/4aI+cI+0fbLW17mWGeMu21wSRRQiv5iNgGKR3vEGXAItcLDft1uUzWAfbe1X3zK/ymT7bA/76PB6UUknm+Y5MM4osurUXU/k7P38pN/3slnGfpFzjl4c3USY4mH9ZCJYUuC/kGEnq/yRPalPdODNFvW6s8MiQeQejYNRY0LsJ0WXkK8vXiDmihCivYAOPoSovesL7on+WAArDNM/BcQSQvCYABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Mu = "data:image/webp;base64,UklGRnIIAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSK4BAAABkHPbtrE9+z73/RTbqWw7Lf+BbbNKbTudbZe2qy+VbVv3PmeHj05G6ohg4LaRounNMtN1voB42ABA5R7TNlx5+O7du9e3Tiwb0b4EgFyAOCQM1Z16+DWFUZC7m3uVB2zKQGBhe+77RGHonJffCL1zQuHDxQ1hrEmTatDjHIXOC2MgzpNf1tVJkWgsGhyihI7JIE74aUYp2ITFAoz9QO+ZAs7zanvkEilKbIkMJS5ANwoJmrCodYVOmBqh5zIEJjZc9xods4A4rrPGxGitrJSU71yNyH4Myl7JTEl+5zzYSH9nlkrxHBzxWUzLVEnhh+YI/gq3+UphpvA8m/s7/wg9M4bjFNg/0vplrxQ+rQEDg/xihmT23jxYJZ8UPq8OA5z77Wt405FDR4poSMjiAJhPRxUIu8D+UVonOhfNPEVHPM9juFacwo+1V6kJQ3Y9Sa8ljhPuUvRk4UdNWU9ST3b9n0W3iG5DumdS9y7o3kHVu6/75ii/dbpvrO7brvtPUf2X6f5DVf/dmpxBmauociRVbqbKCXW5qCoHVuXempxf1dZQtXFUbat/yKZTtSUBVlA4INwFAABwGgCdASo8ADwAPm0qj0WkIqEZ+zYAQAbEtgBOmZoZF+E8zGoP3X8VbcdLvma8t+jH0E+YB+ofSA8wH7VdQv0AP75/iOsG9ADy3/Y5/b/91fgI/Y7MOesb0e/q+TUR1vt7VO6mwG0imO70GM5/0P7BX6qelv7EP209lz9oDRea09ZR+SjhX7sBu/ZS7tG917rPgI3Q7XsB7luy2hAg/95C2Z1L362OH1oFziDY/K5gWoSytSAtiKvA/jW1MehBzdLzJfszPPBvGa15IYwIVRTjO2Hz5ZS9HjLMehwAAP64SgjD3qeg6NRe/Ok+iFhrG3pgglCfbam3yBaDUH36sUiQx0PB1ZZyOHq0ky+f97h6tJMvo0p9LkfXecWOFJ8J5G7yRPuL4tzGLT09QulTJw42xp2hd+lMgIa51XoHx/iftn8B2D3k92H5jOQr+uIXFHHK5FpcTG+qGEF+np0LiQa+vdW7/+ZzOLVRf7jR5X3ANPt93Ng92DW7NflVr6kMr88O/v2ZNb0vtgao2Am/R3CDKiNq89f86CT6r2L2g1oTui7H3E1yhSPQpEOz01I3fhfiMMv4weqKuoedxn/xLg5uzHa6Gte4C/dQYkG3ZFSy4CXQtRjftBrjX/Oj+HpSUPDsv0wPW+ml5NbBKDCj2f3SD8TVMf2ZfHrOkR602RVk2UmKC+H0Y9iK6k98vsgPINtz0II8X7Mj2nJkTC6IMLuQ8dNTUq9VXOnhXrdhNZoaH94ePo6baBl3hTGFAnD3/b+gR/vtbqV7wktuX6fpnjeTBe/Drp6z3neeANj/aX4CsU9w67nwYOjZhueCjxaDKUnNjLPjI1e0BoTbcOzOQ0wHJHZJ+Pt608StBu4HiJ8NjH46fnvXL3yiMoSvkAuwCE1AakA+eU1u3unyjl1/MnZQmbp8fzfsfrFesehLPcIkYdCiZ+52QbmINNTjEsvjuBuZRubBE+Laihppsxoo4efGIo0xkw0etu1+yzvkqp88w3pBq0mRl13gnnc+2zl6SmhwgmNFbz+F8qAqmdfJL8iaNSGEWlPlpczDDe62GBZMlBhQmq/XCn/1b+VazHvJXkoIFDF+wktMg+rKfLyfTlXdK0cs+Kn8h+rjMakkf3WLo1TftMLn+O+x/Gat+BGstJrM1xvCSSnHQY+NV4B4gRqyZ55gRNnqN/0lWrATOcHUaGXpkTIM/yxFjxcePcSFo+t2aJ5lShtVukETzRxaIXgRkpROeWQHWpTHOaexmXOzF0b833qJSoXMk2zB/uMrgDzKd7d3ohUz8Ra08WYKlAuMQD08bF4+jUepEspqPLoYLQ73TfmL+1LwKxyTV3gEu6WnxBPWPLnYIGYN9U47ZNlB+NgHgYtKTyii6060RAG+wN32WUVFxCZw0HMHnHFgwxD34L/anlpS7mOrjKgyuGYhFC7iHqTQHuoAO1ekBHV+rndnbETKfa1F7LxNLYq+dmJyytmQrJUCGjelorI1m/TMQNiFVrY4FCI1Gl2W1JsZsw9zA+Bh3JmjkC0H5/0JV6JotNMatJIZ4v5PqwJe3r8xd+FNS3ynccdu+xtVdc27qwVdoomciZD5oXYey9KAFSAKO594sBKZNWUJTLXnt0BJbdF8FkQYvg3DQajYY2p+ixd5Ag7o92gw0pVVDDOP+WQxiEmKqgWJyTBsnsBk2Bxi2Unsv8S/4PmE8Hy/vy+Mij+aTAKZvg716IHfHX0/JMeFfmAnsZ39Q0qkfdPtq6+CxbGZ7wKDsK/8l/MVGuyd6faJFt5wyoOXuNrr3JC9EoBmjcOzkVw/6RNP49poZ1xzsX3q7B4HGfI/XSfRQq3HeZ2j12d0E3gCAube4oExaT1sx/v8F+f61QOsGdSaqM2im6qOGkSRkrRQ7L8hvS8vEYJeVkAbFvX5ov7e/egYYNToMHj651c5/rCVYtB9Ned6GvGN8R0x3t7+lsf8+ofhHRzpyvwxd6c5pREZVOKnXzplhJ61mki4JmAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Uu = "data:image/svg+xml,%3csvg%20width='88'%20height='88'%20viewBox='0%200%2088%2088'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='88'%20height='88'%20fill='url(%23paint0_linear_170_79)'/%3e%3crect%20x='25.6665'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='51.3335'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='29.3335'%20y='40.3333'%20width='29.3333'%20height='7.33333'%20fill='white'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_170_79'%20x1='-75.3077'%20y1='-55'%20x2='146.302'%20y2='148.167'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FF00FF'/%3e%3cstop%20offset='0.531673'%20stop-color='%237A84FF'/%3e%3cstop%20offset='1'%20stop-color='%2305FAFF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e", Du = "data:image/webp;base64,UklGRh4HAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSNwBAAABkFxbexpJnyR3z8y+ajXMkAnjnnOgbUUxEAHjkpldWQwzFUn6v3PGVNI/AUQEA7dt49gN3PXavTlfQDeNAeyqg4PL5buRyOhteXlwcJWtHU8qzUIBs+30g7/s4N8Hp7cZFAtpDc7Bbr8xplB8iFJBYvBC4fjGdgvnElqdwc6XFPGRnQxehC93wjgzbxRYf1UYA+dkiJSrG1DMV6zDoW+MkQmMkd8Owdl5AsvOM3gm0geeXwY7R/Tu0EcmM3re6cF2Rr/kTJiBMmPZh+2q/wtm4ozD9qrB0tucMhunvL0Upg1n6JmRnmda4HCckVkZeRyuMWjjF0peCD9vhK3jAgMzM/BCDQ576225m/bCwcA+qzS/PLUwDrsr1ZDdcAa3KtWQWzDYPKZoQDjeDJyoVEdOAPf0cA/Lf1F0IPy1fG8VWmXvgF4LnoOLDFoIvPiaUQuRr99pNr8dUZEj0YToQnfjreaQd7oL6T6Tuu+C7juo++6rfnOUv3W631jNb7v+P8U+1ZDAZxZG9R+q/e+GxcbPuRcRftkIq+pVVD2Srjdr94TDnJ6w7MGqedFhH1bVA6t67zk9/3ctzw+YAhvSc431KExyjjNHQ2zLcTRzq/8op0vKJd+OREbvUnJJAFZQOCBaBAAA8BUAnQEqPAA8AD5tMJRHJCMiISgb+1CADYlsAJ0zIUCfxfmY2f+0b2AbztDnPeKX0qPMp+wHrDehz0AP7J/o+tP9ADy3f23+C79yPYA/aqK9mONrQbuszbsEyALJNTfg+Z6NjG2v+ETCuvlr1q6QUqEiAMUndG/WwfnjJIOTfOBS4W1w0HjOJa1XQ2K33n2b07EOjOBapwKzyoA2erTBTnEKlFjllBy68GBjZ+UKnlzN/f5ibbb4gAD+i9OsnW0xUnmTpyhVasIKzTu0BsXnfBm4rHJqGMFJBUgTESDXEPcNjAeaHP8ck9qdNBH4L/h53tXgHeZttc7c4lwTa6U4Lziz8qUoy8ce0IMc5TFElawGj16tME0GzSSbUqgH7/tYA6huPsWM2z3GjP8b9y7paRbINxwYRtuE90I6QVsNrEkbhL1YfwxRXnuobOfSe3KFVamrvsOqwTCMqlNfjsR3pyoiZ+lYt3+AH6x4ZVNltbYI5KiVhgCu1isooK324ldloH3zhlefYKEwTCYfNjbeH5UiL7JSev+t/C+ftc3TkAHcsvrLCU6n5pYYY2Yr1kRq+r6XVzI6iXuA/TqwMk6xq1PmdzHOwKavncLjWJrk0uU/5E5WKqXM0tgl5s3pduHjb5aiAt0ikEisMyYwnIhDiSemPRdGON4RlwSb3OEpZjhuZqoyen4Sw/fULewt3hAZizeiPZx1o9LS3M/4r3v/M6/o5925VJcmxAf/yjsyjCz0mV+6NuIeWp8shrFaIGgeduVJoZ0Kys1WjSLuFg9QvF5LlkOZ2k7WrzSu4ucsUOS/X4wnQvB0RCnR1PCsU4NDdLfxvQITUgGIuVTJ7LR73PHzZam/Z21oy3euiU55ffITekwjR4SgVoPvhxbdBSyVePf/twm62pSK9IfgPGN+ttubhQub1ooVZymdQCrS3goEs6dlnl/6TVfkgxFyBfAORkZafeu/Va2vIgUBNUQd48W8oPiMFjx+SAKx1qm2IwCLnuhJGf9M4nCzu7oo43f+nBeT07IjB+FpFKRGFNvlpLEXhPclSgFkqeU1W2eNqW2zShCWkQkgfE1HAoNX3z+CQcRQJq+HkC2nSjFdFYT8UNYNS6lYcyVWzEnOos1qpsNRxnLqY2Dl5CCT3Yeg/qT8chfF9ZadFvzNTEIDlARoN//7IU23MtuLdpsAjsiGfBHuR7y4lemYPdD/9Cuff9Qn/r/xlhmB5x2Y9Z1yME3aANAb5+u3lYz01zUlWwakKVmv9fhaeu/YzQ7BXLlcb+cbaIF5t/COmObnt20zaTfjad542f7p7f2Xea134nvyPYS+EAgjM+GufHvl9tXCrrRbH0pn7kH2XEGx9VbO4mY54+QZa5kPr0j3AOEtKd7SJWjlg5TQfgIuB6KoLGainSwF+pPdiCmzEzAOa1eFwn//2VdDMeq42/bKH8U4orewhLh60ci/S0BRBuItNMc+v1+vxl0YyS5it4AAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Fu = "data:image/svg+xml,%3csvg%20width='868'%20height='868'%20viewBox='0%200%20868%20868'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='434'%20cy='434'%20r='434'%20fill='%231B262D'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M234.563%20184H640.697C650.387%20184%20659.339%20189.164%20664.172%20197.542L782.495%20402.657C788.631%20413.294%20786.808%20426.72%20778.056%20435.346L452.368%20756.327C441.818%20766.724%20424.846%20766.724%20414.296%20756.327L89.0484%20435.78C80.0927%20426.954%2078.4157%20413.136%2085.0013%20402.433L211.48%20196.884C216.405%20188.879%20225.146%20184%20234.563%20184ZM588.257%20275.577V333.129H472.567V373.032C553.82%20377.296%20614.782%20394.81%20615.234%20415.802L615.231%20459.563C614.779%20480.556%20553.82%20498.069%20472.567%20502.333V600.259H395.746V502.333C314.492%20498.069%20253.531%20480.555%20253.078%20459.563L253.081%20415.802C253.533%20394.81%20314.492%20377.296%20395.746%20373.032V333.129H280.055V275.577H588.257ZM434.156%20472.268C520.868%20472.268%20593.345%20457.459%20611.082%20437.683C596.041%20420.912%20541.636%20407.713%20472.567%20404.089V445.867C460.187%20446.516%20447.336%20446.858%20434.156%20446.858C420.976%20446.858%20408.125%20446.516%20395.746%20445.867V404.089C326.676%20407.713%20272.271%20420.912%20257.23%20437.683C274.968%20457.459%20347.444%20472.268%20434.156%20472.268Z'%20fill='%23009393'/%3e%3c/svg%3e";
function $o(e) {
  const r = e.toUpperCase();
  return ls.find((o) => o.symbol === r)?.decimals ?? 6;
}
function Ou(e, r) {
  const s = e.toUpperCase(), n = ls.find((a) => a.symbol === s)?.decimals ?? r;
  return n === void 0 ? 2 : s === "SOL" ? 4 : n === 6 && s !== "SOL" ? 2 : n > 6 ? 6 : n;
}
const ls = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: is
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: Mu
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: Fu
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
    logoUrl: Ru
  },
  {
    mint: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    name: "WLFI USD",
    decimals: 6,
    logoUrl: Du
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logoUrl: Iu
  },
  {
    mint: "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    name: "Hubble USD",
    decimals: 6,
    logoUrl: Uu
  },
  {
    mint: "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT",
    symbol: "CASH",
    name: "Stripe USD",
    decimals: 6,
    logoUrl: Tu
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoUrl: Pu
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
    logoUrl: Bu
  }
];
function Wu(e) {
  return e.companyFeePercent > 0 || e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap" || e.feePolicy === "user_pays_privacy";
}
function qu(e, r, s) {
  const { feePolicy: o, privacyFeePercent: n, swapFeePercent: a, companyFeePercent: i } = e;
  let d = i;
  return s || (o === "user_pays_all" ? (d += a, r && (d += n)) : o === "user_pays_privacy" && r ? d += n : o === "user_pays_swap" && (d += a)), d;
}
const Pt = 1e9, rt = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoUrl: is
}, st = {
  mint: "other",
  symbol: "OTHER",
  name: "Other",
  decimals: 6
}, Vo = 1e4;
function zu(e, r) {
  const s = r < e.publicMinUsd, o = r >= e.privateMinUsd, n = [], a = !s && o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0), i = !s && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0), d = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  if (a) {
    const l = e.privacyFeeFixedLamports / Pt, h = e.privacyFeePercent, m = l * e.solPriceUsd, u = r * (h / 100);
    n.push({ label: "Privacy", solAmount: l, percent: h, usdAmount: m + u });
  }
  if (i) {
    const l = e.swapFeeFixedLamports / Pt, h = e.swapFeePercent, m = l * e.solPriceUsd, u = r * (h / 100);
    n.push({ label: "Swap", solAmount: l, percent: h, usdAmount: m + u });
  }
  if (d) {
    const l = e.companyFeeFixedLamports / Pt, h = e.companyFeePercent, m = l * e.solPriceUsd, u = r * (h / 100);
    n.push({ label: "Service", solAmount: l, percent: h, usdAmount: m + u });
  }
  return n;
}
function Ho(e, r, s) {
  const o = zu(e, r), n = s === 0 ? 0 : s < 0.01 ? 0.01 : s;
  if (o.length === 0)
    return s === 0 ? "No fees" : `Total: $${n.toFixed(2)}`;
  const a = o.reduce((w, g) => w + g.solAmount, 0), i = o.reduce((w, g) => w + g.percent, 0), d = { fee: 7, sol: 8, rate: 7, usd: 8 }, l = (w) => {
    const g = w.label.padEnd(d.fee), k = w.solAmount.toFixed(4).padStart(6).padEnd(d.sol), A = (w.percent.toFixed(2) + "%").padStart(5).padEnd(d.rate), E = ("$" + (w.usdAmount === 0 ? 0 : Math.max(w.usdAmount, 0.01)).toFixed(2)).padEnd(d.usd);
    return `${g} │ ${k} │ ${A} │ ${E}`;
  }, h = `${"Fee".padEnd(d.fee)} │ ${"SOL".padEnd(d.sol)} │ ${"+ Rate".padEnd(d.rate)} │ ${"= Total".padEnd(d.usd)}`, m = `${"─".repeat(d.fee)}─┼─${"─".repeat(d.sol)}─┼─${"─".repeat(d.rate)}─┼─${"─".repeat(d.usd)}`, u = ("$" + n.toFixed(2)).padEnd(d.usd), p = `${"TOTAL".padEnd(d.fee)} │ ${a.toFixed(4).padStart(6).padEnd(d.sol)} │ ${(i.toFixed(2) + "%").padStart(5).padEnd(d.rate)} │ ${u}`;
  return [h, m, ...o.map(l), m, p].join(`
`);
}
function ju(e) {
  const r = [], s = e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0, o = e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0, n = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  return s && r.push("Privacy Cash fee"), o && r.push("swap fee"), n && r.push("company service fee"), r.length === 0 ? "No processing fees apply to deposits." : "A small fee may apply. We'll show exact totals before you confirm.";
}
function Vt(e, r) {
  if (r <= 0) return 0;
  const s = r < e.publicMinUsd, o = r >= e.privateMinUsd, n = qu(e, o, s);
  let a = e.companyFeeFixedLamports;
  s || (o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (a += e.privacyFeeFixedLamports), (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (a += e.swapFeeFixedLamports));
  const i = a / Pt * e.solPriceUsd, d = r * (n / 100);
  return i + d;
}
function Qo(e, r, s) {
  return e === "sol" ? "SOL" : e === "single-token" ? r.symbol : s.some((n) => n.symbol === "USDC") ? "SOL or USDC" : "SOL or supported tokens";
}
function Nn(e) {
  return e.map((r) => r.trim()).filter(Boolean);
}
const $u = /* @__PURE__ */ new Set(["USDC", "USDT", "USD1", "PYUSD", "USDH", "CASH"]);
function ds(e, r, s) {
  if ($u.has(e.symbol)) return 1;
  const o = r.tokenPrices?.[e.symbol];
  if (o && o > 0) return o;
  if (e.symbol === "SOL") return r.solPriceUsd || null;
  const n = s?.[e.symbol];
  return n && n > 0 ? n : null;
}
function Go(e, r) {
  return e.toFixed(Ou(r));
}
function um({
  config: e,
  currencyMode: r,
  depositMethod: s,
  tokens: o = [],
  defaultToken: n,
  minAmount: a,
  maxAmount: i = 1e4,
  onSuccess: d,
  onError: l,
  onCancel: h,
  onUnlockRequired: m,
  onAuthorize: u,
  className: p = "",
  showStepIndicator: y = !0,
  pollInterval: w = 5e3,
  demoMode: g = !1,
  demoAutoConfirmMs: k,
  tokenPriceUsd: A,
  showExplainer: C = !1,
  siteName: E,
  explainerConfig: x
}) {
  const { deposit: L, getStatus: f, error: b, clearError: v } = ku(), N = qt(), T = Nn(e.quickActionTokens), _ = Nn(e.customTokenSymbols), B = q(() => {
    const V = e.customTokens ?? [];
    if (V.length === 0) return o;
    const re = new Set(o.map((ce) => ce.symbol)), ne = [...o];
    for (const ce of V)
      re.has(ce.symbol) || (ne.push({
        mint: ce.mint,
        symbol: ce.symbol,
        name: ce.symbol,
        // Use symbol as name for custom tokens
        decimals: ce.decimals,
        logoUrl: ce.logoUrl
      }), re.add(ce.symbol));
    return ne;
  }, [o, e.customTokens]), R = q(() => {
    if (_.length === 0) return B;
    const V = B.filter((re) => _.includes(re.symbol));
    return V.length > 0 ? V : B;
  }, [B, _]), I = e.privateDepositsEnabled, M = s ? s === "sign" && !I ? "receive" : s : I && N.hasExternalWallet ? "sign" : "receive", U = T[0] ? B.find((V) => V.symbol === T[0]) : void 0, W = r === "sol" ? rt : r === "single-token" ? U ?? B.find((V) => V.symbol === "USDC") ?? B[0] ?? rt : n ?? U ?? B.find((V) => V.symbol === "USDC") ?? B.find((V) => V.symbol !== "SOL") ?? B[0] ?? rt, z = P(() => C ? "explainer" : "unlock", [C]), [$, D] = S(z), [O, H] = S(W), [ee, ie] = S(""), [Q, te] = S(null), [G, K] = S(null), [oe, we] = S(null), [ke, at] = S(null), [We, qe] = S(!1), [Ht, it] = S(!1), [Ke, Y] = S(null), Ne = se(null);
  F(() => () => {
    Ne.current && clearTimeout(Ne.current);
  }, []), F(() => {
    D(z()), H(W), ie(""), te(null), K(null), we(null), at(null), qe(!1), it(!1), Y(null), v();
  }, [r, M, W, v]);
  const Ce = a ?? e.privateMinSol, gt = i, ze = parseFloat(ee), Ye = N.status === "enrolled_locked" || N.status === "enrolled_unlocked" || N.status === "unlocked", Ze = Ye && N.isUnlocked, Qt = Ye && !N.isUnlocked, hs = P(() => {
    let ne = M === "sign" ? [
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
    return C && (ne = [{ key: "explainer", label: "Info" }, ...ne]), ne;
  }, [M, C])(), Xo = hs.findIndex((V) => V.key === $), ms = P((V) => {
    H(V);
  }, []), Jo = P(
    async (V) => {
      if (!u) {
        D(M === "sign" ? "confirm" : "show-address");
        return;
      }
      it(!0), K(null);
      try {
        const ne = await u(V, M === "sign" ? ze : null, O);
        we(ne.sessionId), at(ne.depositAddress), D(M === "sign" ? "confirm" : "show-address");
      } catch (re) {
        const ne = re instanceof Error ? re : new Error("Authorization failed");
        K(ne.message);
      } finally {
        it(!1);
      }
    },
    [u, M, ze, O]
  ), ea = P(
    async (V, re) => {
      v(), K(null), D("signing");
      const ne = V ?? ze, ce = re ?? O;
      if (!g) {
        if (Qt && m) {
          m(), D("confirm");
          return;
        }
        if (!Ze) {
          K("Wallet not ready"), D("error");
          return;
        }
      }
      try {
        const Ae = Math.round(ne * Math.pow(10, ce.decimals));
        if (g) {
          await new Promise((Kt) => setTimeout(Kt, 1500));
          const Ee = {
            token: r === "sol" ? null : ce,
            amount: ne,
            amountSmallestUnit: Ae,
            txSignature: `demo-tx-${Date.now()}`,
            sessionId: oe || `demo-session-${Date.now()}`,
            response: {
              sessionId: oe || `demo-session-${Date.now()}`,
              txSignature: `demo-tx-${Date.now()}`,
              amountLamports: Ae,
              message: "Demo deposit successful",
              withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
            },
            method: "sign"
          };
          te(Ee), D("success"), d?.(Ee);
          return;
        }
        const Be = await L(Ae), ct = {
          token: r === "sol" ? null : ce,
          amount: ne,
          amountSmallestUnit: Ae,
          txSignature: Be.txSignature,
          sessionId: Be.sessionId,
          response: Be,
          method: "sign"
        };
        te(ct), D("success"), d?.(ct);
      } catch (Ae) {
        const Be = Ae instanceof Error ? Ae : new Error("Deposit failed");
        K(Be.message), D("error"), l?.(Be);
      }
    },
    [
      L,
      ze,
      O,
      r,
      g,
      oe,
      Ze,
      Qt,
      m,
      d,
      l,
      v
    ]
  ), ta = P(() => {
    D("waiting");
  }, []), Gt = P(async () => {
    const V = ke || N.solanaPubkey;
    if (V) {
      Ne.current && clearTimeout(Ne.current);
      try {
        await navigator.clipboard.writeText(V), qe(!0), Ne.current = setTimeout(() => qe(!1), 2e3);
      } catch {
        const re = document.createElement("textarea");
        re.value = V, document.body.appendChild(re), re.select(), document.execCommand("copy"), document.body.removeChild(re), qe(!0), Ne.current = setTimeout(() => qe(!1), 2e3);
      }
    }
  }, [ke, N.solanaPubkey]);
  F(() => {
    if (!($ === "confirm" || $ === "show-address" || $ === "waiting") || !oe || g) return;
    let re = !1, ne = 0, ce = 0;
    const Ae = 360, Be = 5, ct = async () => {
      if (!(re || ne >= Ae)) {
        ne++;
        try {
          const Ee = await f(oe);
          if (ce = 0, Ee.status === "completed" || Ee.status === "detected") {
            const Kt = Ee.amountLamports ? Ee.amountLamports / Math.pow(10, O.decimals) : 0, sa = Ee.amountLamports || 0, fs = {
              token: r === "sol" ? null : O,
              amount: Kt,
              amountSmallestUnit: sa,
              txSignature: Ee.txSignature || "",
              sessionId: oe,
              response: Ee,
              method: "receive",
              depositAddress: N.solanaPubkey ?? void 0
            };
            te(fs), D("success"), d?.(fs);
            return;
          }
        } catch {
          if (ce++, ce >= Be) {
            K("Unable to check deposit status. Please check your connection and try again.");
            return;
          }
        }
        re || setTimeout(ct, w);
      }
    };
    return ct(), () => {
      re = !0;
    };
  }, [
    $,
    oe,
    g,
    f,
    O,
    r,
    N.solanaPubkey,
    d,
    w
  ]), F(() => {
    if (!g || !k || $ !== "waiting" || M !== "receive" || !ke) return;
    const V = window.setTimeout(() => {
      const re = Ke ?? e.privateMinUsd, ne = O.symbol === "SOL" && e.solPriceUsd > 0 ? re / e.solPriceUsd : re, ce = Math.round(ne * Math.pow(10, O.decimals)), Ae = {
        token: r === "sol" ? null : O,
        amount: ne,
        amountSmallestUnit: ce,
        txSignature: `demo-tx-${Date.now()}`,
        sessionId: oe || `demo-session-${Date.now()}`,
        response: {
          sessionId: oe || `demo-session-${Date.now()}`,
          txSignature: `demo-tx-${Date.now()}`,
          amountLamports: ce,
          message: "Demo deposit detected",
          withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
        },
        method: "receive",
        depositAddress: ke ?? void 0
      };
      te(Ae), D("success"), d?.(Ae);
    }, k);
    return () => window.clearTimeout(V);
  }, [
    g,
    k,
    $,
    M,
    ke,
    Ke,
    e,
    O,
    r,
    oe,
    d
  ]);
  const ra = P(() => {
    D(z()), ie(""), te(null), K(null), v();
  }, [z, v]);
  return e.enabled ? /* @__PURE__ */ c("div", { className: `cedros-deposit-flow ${p}`, children: [
    y && $ !== "error" && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-steps", children: hs.map((V, re) => {
      const ne = Xo >= re, ce = V.key === $;
      return /* @__PURE__ */ c(
        "div",
        {
          className: `cedros-deposit-flow-step-item ${ne ? "step-active" : ""}`,
          children: [
            /* @__PURE__ */ t(
              "div",
              {
                className: `cedros-deposit-flow-step-circle ${ne ? "active" : ""} ${ce ? "current" : ""}`,
                children: re + 1
              }
            ),
            /* @__PURE__ */ t("span", { className: `cedros-deposit-flow-step-label ${ne ? "active" : ""}`, children: V.label })
          ]
        },
        V.key
      );
    }) }),
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-content", children: [
      $ === "explainer" && /* @__PURE__ */ t(
        Vu,
        {
          siteName: E,
          config: x,
          depositConfig: e,
          currencyMode: r,
          token: O,
          tokens: R,
          onContinue: () => D("unlock"),
          onCancel: h
        }
      ),
      $ === "unlock" && /* @__PURE__ */ t(
        Hu,
        {
          token: O,
          tokens: R,
          currencyMode: r,
          depositMethod: M,
          isAuthorizing: Ht,
          error: G,
          onAuthorize: Jo,
          onBack: C ? () => D("explainer") : void 0,
          onCancel: h
        }
      ),
      $ === "confirm" && M === "sign" && /* @__PURE__ */ t(
        Qu,
        {
          token: O,
          tokens: B,
          quickActionSymbols: T,
          customTokenSymbols: _,
          currencyMode: r,
          minAmount: Ce,
          maxAmount: gt,
          depositAddress: ke || N.solanaPubkey,
          walletReady: Ze || g,
          needsUnlock: Qt && !g,
          copied: We,
          isListening: !!oe && !g,
          config: e,
          onCopy: Gt,
          onTokenSelect: ms,
          onUnlockRequired: m,
          onConfirm: (V, re) => ea(V, re),
          onBack: () => D("unlock"),
          onCancel: h
        }
      ),
      $ === "signing" && /* @__PURE__ */ t(Gu, { depositAddress: N.solanaPubkey }),
      $ === "show-address" && /* @__PURE__ */ t(
        Ku,
        {
          token: O,
          tokens: B,
          quickActionSymbols: T,
          customTokenSymbols: _,
          tokenPriceUsd: A,
          currencyMode: r,
          depositAddress: ke || N.solanaPubkey,
          copied: We,
          isListening: !!oe && !g,
          config: e,
          onCopy: Gt,
          onTokenSelect: ms,
          onAmountChange: Y,
          onSent: ta,
          onBack: () => D("unlock"),
          onCancel: h
        }
      ),
      $ === "waiting" && /* @__PURE__ */ t(
        Yu,
        {
          token: O,
          depositAddress: ke || N.solanaPubkey,
          copied: We,
          feeLine: Ke ? (() => {
            const V = Vt(e, Ke);
            return V === 0 ? "No fees" : `Fees: $${Math.max(V, 0.01).toFixed(2)} total`;
          })() : "Fees: calculated after deposit",
          onCopy: Gt
        }
      ),
      $ === "success" && Q && /* @__PURE__ */ t(Zu, { result: Q, config: e, onNewDeposit: ra }),
      $ === "error" && /* @__PURE__ */ t(
        Xu,
        {
          error: G || b || "An error occurred",
          onRetry: () => D("confirm"),
          onCancel: h
        }
      )
    ] })
  ] }) : /* @__PURE__ */ t("div", { className: `cedros-deposit-flow cedros-deposit-flow-disabled ${p}`, children: /* @__PURE__ */ t("p", { children: "Deposits are not currently available." }) });
}
function Vu({
  siteName: e,
  config: r,
  depositConfig: s,
  currencyMode: o,
  token: n,
  tokens: a,
  onContinue: i,
  onCancel: d
}) {
  const l = r?.title ?? "How Deposits Work", h = r?.exchangeName ?? "Coinbase", m = ma(r?.exchangeUrl) ?? "https://www.coinbase.com", u = r?.showExchangeSuggestion !== !1, p = Qo(o, n, a), y = e ? `${e} uses the Solana blockchain to process secure, private payments.` : "This site uses the Solana blockchain to process secure, private payments.", w = r?.body ?? y, g = Wu(s), k = ju(s);
  return /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: l }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: w }),
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-explainer-content", children: [
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-shield" }),
        /* @__PURE__ */ c("div", { children: [
          /* @__PURE__ */ t("strong", { children: "Private & Secure" }),
          /* @__PURE__ */ t("p", { children: "Your deposits are protected by cryptographic privacy technology." })
        ] })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-bolt" }),
        /* @__PURE__ */ c("div", { children: [
          /* @__PURE__ */ t("strong", { children: "Fast Transactions" }),
          /* @__PURE__ */ t("p", { children: "Solana transactions confirm in seconds, not minutes." })
        ] })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-explainer-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-explainer-icon cedros-deposit-flow-icon-coin" }),
        /* @__PURE__ */ c("div", { children: [
          /* @__PURE__ */ t("strong", { children: g ? "Transparent Fees" : "Low Fees" }),
          /* @__PURE__ */ t("p", { children: k })
        ] })
      ] })
    ] }),
    u && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-explainer-exchange", children: /* @__PURE__ */ c("p", { className: "cedros-deposit-flow-explainer-exchange-text", children: [
      /* @__PURE__ */ t("strong", { children: "New to Solana?" }),
      " You can purchase ",
      p,
      " using your credit card at",
      " ",
      /* @__PURE__ */ t("a", { href: m, target: "_blank", rel: "noopener noreferrer", children: h }),
      ", then send it here to fund your account."
    ] }) }),
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-actions", children: [
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
          onClick: i,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function Hu({
  token: e,
  tokens: r,
  currencyMode: s,
  depositMethod: o,
  isAuthorizing: n,
  error: a,
  onAuthorize: i,
  onBack: d
}) {
  const [l, h] = S(""), m = Qo(s, e, r), u = (p) => {
    p.preventDefault(), l.trim() && (i(l), h(""));
  };
  return /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Authorize Deposit" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: o === "sign" ? s === "multi-token" ? "Enter your password to authorize a deposit. This allows us to process your withdrawal when the privacy period ends." : `Enter your password to authorize a ${m} deposit. This allows us to process your withdrawal when the privacy period ends.` : s === "multi-token" ? "Enter your password to get your deposit address. Any supported token sent to this address will be credited to your account." : `Enter your password to get your deposit address. Any ${m} sent to this address will be credited to your account.` }),
    /* @__PURE__ */ c("form", { onSubmit: u, children: [
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-field", children: [
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
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-actions", children: [
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
function Qu({
  token: e,
  tokens: r,
  quickActionSymbols: s,
  customTokenSymbols: o,
  currencyMode: n,
  minAmount: a,
  maxAmount: i,
  depositAddress: d,
  walletReady: l,
  needsUnlock: h,
  copied: m,
  isListening: u,
  config: p,
  onCopy: y,
  onTokenSelect: w,
  onUnlockRequired: g,
  onConfirm: k,
  onBack: A
}) {
  const [C, E] = S(p.privateMinUsd), [x, L] = S(!1), [f, b] = S(!1), [v, N] = S(0), [T, _] = S(null), R = as(C, p) === "sol_micro", I = e.symbol === st.symbol, M = q(() => {
    const G = o.length === 0 ? r : r.filter((we) => o.includes(we.symbol)), K = G.length > 0 ? G : r;
    return K.some((we) => we.symbol === st.symbol) ? K : [...K, st];
  }, [r, o]), U = Vt(p, C), W = U === 0 ? 0 : U < 0.01 ? 0.01 : U, z = I ? "Fees: calculated after deposit" : U === 0 ? "No fees" : `Fees: $${W.toFixed(2)} total`, $ = I ? "" : Ho(p, C, U), D = ds(R ? rt : e, p), O = D ? C / D : e.symbol === "SOL" && p.solPriceUsd > 0 ? C / p.solPriceUsd : null, H = O != null ? Go(O, R ? "SOL" : e.symbol) : null, ie = C - U <= 0 && C > 0, Q = !I && C > 0 && !ie && O != null && O >= a && O <= i;
  F(() => {
    if (n === "multi-token")
      if (R && e.symbol !== "SOL") {
        _(e);
        const G = r.find((K) => K.symbol === "SOL");
        G && w(G);
      } else !R && T && e.symbol === "SOL" && (w(T), _(null));
  }, [R, e.symbol, n, r, w, T, e]);
  const te = () => {
    Q && O != null && k(O, e);
  };
  return /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Choose Amount" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: "Set how much you want to deposit. Higher tiers unlock privacy." }),
    n === "multi-token" && !R && /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-token-quick", children: [
        s.map((G) => {
          const K = r.find((we) => we.symbol === G), oe = e.symbol === G;
          return /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${oe ? "is-active" : ""}`,
              onClick: () => {
                K && (L(!1), w(K));
              },
              disabled: !K,
              children: [
                K?.logoUrl && /* @__PURE__ */ t(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: K.logoUrl,
                    alt: `${G} logo`
                  }
                ),
                G
              ]
            },
            G
          );
        }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${x ? "is-active" : ""}`,
            onClick: () => {
              L(!0), N((G) => G + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      x && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ t(
        Wo,
        {
          tokens: M,
          selectedToken: e,
          onSelect: w,
          openSignal: v
        }
      ) })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-field", children: /* @__PURE__ */ t(
      jo,
      {
        config: p,
        valueUsd: C,
        onChange: E,
        maxUsd: Vo
      }
    ) }),
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", children: I ? "Sign to send tokens to this address" : `Sign to send ${H ?? "--"} ${R ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ t("code", { className: "cedros-deposit-flow-address", children: d || "Loading..." }),
        /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-address-actions", children: [
          /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-icon",
              onClick: y,
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
    ie && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-warning", children: /* @__PURE__ */ t("p", { children: "Deposit amount is less than the fees. Increase the amount to proceed." }) }),
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ t("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ c("span", { children: [
          z,
          /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${f ? "is-open" : ""}`,
              "data-tooltip": $,
              "aria-label": `Fee breakdown: ${$.replaceAll(`
`, ", ")}`,
              "aria-expanded": f,
              onClick: (G) => {
                G.stopPropagation(), b((K) => !K);
              },
              onBlur: () => b(!1),
              onKeyDown: (G) => {
                G.key === "Escape" && b(!1);
              },
              children: "i"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ t("span", { children: "Credits appear after network confirmation." })
      ] })
    ] }),
    u && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-info-banner", children: "Listening for incoming transfers. We will confirm automatically." }),
    h && /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-warning", children: [
      /* @__PURE__ */ t("p", { children: "Your wallet is locked. Unlock it to continue." }),
      g && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: g,
          children: "Unlock Wallet"
        }
      )
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-actions", children: [
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: A,
          children: "Back"
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: te,
          disabled: !Q || !l || !d,
          children: "Deposit"
        }
      )
    ] })
  ] });
}
function Gu({ depositAddress: e }) {
  return /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-spinner" }),
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Signing Transfer" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: "Approve the transfer in your wallet extension..." }),
    e && /* @__PURE__ */ c("p", { className: "cedros-deposit-flow-signing-dest", children: [
      "Sending to:",
      " ",
      /* @__PURE__ */ c("code", { children: [
        e.slice(0, 6),
        "...",
        e.slice(-4)
      ] })
    ] })
  ] });
}
function Ku({
  token: e,
  tokens: r,
  quickActionSymbols: s,
  customTokenSymbols: o,
  tokenPriceUsd: n,
  currencyMode: a,
  depositAddress: i,
  copied: d,
  isListening: l,
  config: h,
  onCopy: m,
  onTokenSelect: u,
  onAmountChange: p,
  onSent: y,
  onBack: w
}) {
  const [g, k] = S(h.privateMinUsd), [A, C] = S(!1), [E, x] = S(!1), [L, f] = S(0), [b, v] = S(null), T = as(g, h) === "sol_micro", _ = e.symbol === st.symbol, B = q(() => {
    const O = o.length === 0 ? r : r.filter((ie) => o.includes(ie.symbol)), H = O.length > 0 ? O : r;
    return H.some((ie) => ie.symbol === st.symbol) ? H : [...H, st];
  }, [r, o]), R = Vt(h, g), I = R === 0 ? 0 : R < 0.01 ? 0.01 : R, M = _ ? "Fees: calculated after deposit" : R === 0 ? "No fees" : `Fees: $${I.toFixed(2)} total`, U = _ ? "" : Ho(h, g, R), W = _ || g > 0, z = ds(T ? rt : e, h, n), $ = z ? g / z : null, D = $ ? Go($, e.symbol) : null;
  return F(() => {
    if (a === "multi-token")
      if (T && e.symbol !== "SOL") {
        v(e);
        const O = r.find((H) => H.symbol === "SOL");
        O && u(O);
      } else !T && b && e.symbol === "SOL" && (u(b), v(null));
  }, [T, e.symbol, a, r, u, b, e]), F(() => {
    p(g);
  }, [g, p]), i ? /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Send Deposit" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: "Send funds to your deposit address. We'll confirm automatically." }),
    a === "multi-token" && !T && /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", children: "Token" }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-token-quick", children: [
        s.map((O) => {
          const H = r.find((ie) => ie.symbol === O), ee = e.symbol === O;
          return /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-token-quick-btn ${ee ? "is-active" : ""}`,
              onClick: () => {
                H && (C(!1), u(H));
              },
              disabled: !H,
              children: [
                H?.logoUrl && /* @__PURE__ */ t(
                  "img",
                  {
                    className: "cedros-deposit-flow-token-quick-icon",
                    src: H.logoUrl,
                    alt: `${O} logo`
                  }
                ),
                O
              ]
            },
            O
          );
        }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${A ? "is-active" : ""}`,
            onClick: () => {
              C(!0), f((O) => O + 1);
            },
            children: "Custom"
          }
        )
      ] }),
      A && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ t(
        Wo,
        {
          tokens: B,
          selectedToken: e,
          onSelect: u,
          openSignal: L
        }
      ) })
    ] }),
    !_ && /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", children: "Deposit Amount" }),
      /* @__PURE__ */ t(
        jo,
        {
          config: h,
          valueUsd: g,
          onChange: k,
          maxUsd: Vo
        }
      )
    ] }),
    _ && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-note", children: "Send any token you want. We'll detect the deposit, swap it, and credit your balance automatically." }),
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", children: _ ? "Send any token to this address" : `Send ${D ?? "--"} ${T ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ t("code", { className: "cedros-deposit-flow-address", children: i }),
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
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ t("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ c("span", { children: [
          M,
          !_ && /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${E ? "is-open" : ""}`,
              "data-tooltip": U,
              "aria-label": `Fee breakdown: ${U.replaceAll(`
`, ", ")}`,
              "aria-expanded": E,
              onClick: (O) => {
                O.stopPropagation(), x((H) => !H);
              },
              onBlur: () => x(!1),
              onKeyDown: (O) => {
                O.key === "Escape" && x(!1);
              },
              children: "i"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ t("span", { children: "Credits appear after confirmation (typically ~30s)." })
      ] })
    ] }),
    l && /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-info-banner", children: "Listening for your deposit. We'll notify you when it arrives." }),
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-actions", children: [
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
          onClick: y,
          disabled: !W,
          children: "I've Sent It"
        }
      )
    ] })
  ] }) : /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-error-icon", children: "!" }),
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Wallet Not Ready" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-step-desc", children: "Your embedded wallet is not set up. Please complete wallet enrollment first." })
  ] });
}
function Yu({ token: e, depositAddress: r, copied: s, feeLine: o, onCopy: n }) {
  return /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-spinner" }),
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Waiting for Deposit" }),
    /* @__PURE__ */ c("p", { className: "cedros-deposit-flow-step-desc", children: [
      "Looking for incoming ",
      /* @__PURE__ */ t("strong", { children: e.symbol }),
      " deposits..."
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-waiting-info", children: [
      /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-waiting-text", children: "Once your transaction is confirmed on the Solana network, your account will be credited automatically. This usually takes 20-30 seconds." }),
      r && /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-field", children: [
        /* @__PURE__ */ t("label", { className: "cedros-deposit-flow-label", children: "Deposit address" }),
        /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-address-box", children: [
          /* @__PURE__ */ c("code", { className: "cedros-deposit-flow-address", children: [
            r.slice(0, 6),
            "...",
            r.slice(-6)
          ] }),
          /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-address-actions", children: [
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
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-info-stack", children: [
        /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-info-item", children: [
          /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
          /* @__PURE__ */ t("span", { children: "Send only on the Solana network." })
        ] }),
        /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-info-item", children: [
          /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-info-dot" }),
          /* @__PURE__ */ t("span", { children: o })
        ] })
      ] })
    ] })
  ] });
}
function Zu({ result: e, config: r, onNewDeposit: s }) {
  const o = e.token ?? rt, n = ds(o, r), a = n ? e.amount * n : e.amount, i = Vt(r, a), d = Math.max(a - i, 0), l = i === 0 ? 0 : i < 0.01 ? 0.01 : i;
  return /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-success-icon", children: "✓" }),
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Deposit Successful!" }),
    /* @__PURE__ */ c("p", { className: "cedros-deposit-flow-step-desc", children: [
      "Your deposit of ",
      e.amount.toLocaleString(),
      " ",
      o.symbol,
      " has been received."
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-summary", children: [
      e.txSignature && /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-summary-label", children: "Transaction" }),
        /* @__PURE__ */ c("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-tx", children: [
          /* @__PURE__ */ c(
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
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-summary-label", children: "Deposit Amount" }),
        /* @__PURE__ */ c("span", { className: "cedros-deposit-flow-summary-value", children: [
          "$",
          a.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-summary-label", children: "Total Fees" }),
        /* @__PURE__ */ c("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-fee", children: [
          "-$",
          l.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-summary-row", children: [
        /* @__PURE__ */ t("span", { className: "cedros-deposit-flow-summary-label", children: "Credits Added" }),
        /* @__PURE__ */ c("span", { className: "cedros-deposit-flow-summary-value cedros-deposit-flow-credit", children: [
          "+$",
          d.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-summary-row", children: [
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
function Xu({ error: e, onRetry: r, onCancel: s }) {
  return /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-step cedros-deposit-flow-step-centered", children: [
    /* @__PURE__ */ t("div", { className: "cedros-deposit-flow-error-icon", children: "✕" }),
    /* @__PURE__ */ t("h4", { className: "cedros-deposit-flow-step-title", children: "Deposit Failed" }),
    /* @__PURE__ */ t("p", { className: "cedros-deposit-flow-error-message", children: e }),
    /* @__PURE__ */ c("div", { className: "cedros-deposit-flow-actions", children: [
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
function Ko() {
  const e = He(), [r, s] = S(!1), [o, n] = S(null), a = q(() => e ? new ae({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), i = P(() => {
    n(null);
  }, []), d = P(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return await a.get("/credits/balance/sol");
    } catch (m) {
      const u = j(m, "Failed to fetch credit balance");
      throw n(u.message), u;
    } finally {
      s(!1);
    }
  }, [a]), l = P(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      return (await a.get("/credits/balance")).balances;
    } catch (m) {
      const u = j(m, "Failed to fetch credit balances");
      throw n(u.message), u;
    } finally {
      s(!1);
    }
  }, [a]), h = P(
    async (m) => {
      if (!a)
        throw new Error("useCredits must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const u = new URLSearchParams();
        m?.currency && u.set("currency", m.currency), m?.limit !== void 0 && u.set("limit", m.limit.toString()), m?.offset !== void 0 && u.set("offset", m.offset.toString());
        const p = u.toString(), y = p ? `/credits/history?${p}` : "/credits/history";
        return await a.get(y);
      } catch (u) {
        const p = j(u, "Failed to fetch transaction history");
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
    clearError: i
  };
}
function hm({
  showAllCurrencies: e = !1,
  refreshInterval: r = 0,
  compact: s = !1,
  className: o = "",
  onLoad: n
}) {
  const { getBalance: a, getAllBalances: i, isLoading: d, error: l, clearError: h } = Ko(), [m, u] = S([]), [p, y] = S(null), w = P(async () => {
    try {
      if (e) {
        const g = await i();
        u(g), n?.(g);
      } else {
        const g = await a();
        u([g]), n?.([g]);
      }
      y(null);
    } catch (g) {
      y(g instanceof Error ? g.message : "Failed to load balance");
    }
  }, [e, a, i, n]);
  if (F(() => {
    w();
  }, [w]), F(() => {
    if (r <= 0) return;
    const g = setInterval(w, r);
    return () => clearInterval(g);
  }, [r, w]), p || l)
    return /* @__PURE__ */ c("div", { className: `cedros-credit-balance cedros-credit-balance-error ${o}`, children: [
      /* @__PURE__ */ t("p", { className: "cedros-credit-error", children: p || l }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-credit-retry",
          onClick: () => {
            h(), y(null), w();
          },
          children: "Retry"
        }
      )
    ] });
  if (d && m.length === 0)
    return /* @__PURE__ */ c("div", { className: `cedros-credit-balance cedros-credit-balance-loading ${o}`, children: [
      /* @__PURE__ */ t("span", { className: "cedros-credit-loading-indicator" }),
      /* @__PURE__ */ t("span", { className: "cedros-credit-loading-text", children: "Loading balance..." })
    ] });
  if (s) {
    const g = m[0];
    return /* @__PURE__ */ c("div", { className: `cedros-credit-balance cedros-credit-balance-compact ${o}`, children: [
      g ? /* @__PURE__ */ t(
        "span",
        {
          className: "cedros-credit-value",
          title: `${g.balanceLamports} lamports`,
          children: g.display
        }
      ) : /* @__PURE__ */ t("span", { className: "cedros-credit-value cedros-credit-value-zero", children: "0.0000 SOL" }),
      d && /* @__PURE__ */ t("span", { className: "cedros-credit-refresh-indicator", title: "Refreshing..." })
    ] });
  }
  return /* @__PURE__ */ c("div", { className: `cedros-credit-balance ${o}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-credit-header", children: [
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
    m.length === 0 ? /* @__PURE__ */ c("div", { className: "cedros-credit-empty", children: [
      /* @__PURE__ */ t("p", { className: "cedros-credit-empty-message", children: "No credit balance yet." }),
      /* @__PURE__ */ t("p", { className: "cedros-credit-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ t("div", { className: "cedros-credit-list", children: m.map((g) => /* @__PURE__ */ c("div", { className: "cedros-credit-item", children: [
      /* @__PURE__ */ t("span", { className: "cedros-credit-currency", children: g.currency }),
      /* @__PURE__ */ t("span", { className: "cedros-credit-amount", children: g.display })
    ] }, g.currency)) })
  ] });
}
const Tr = [
  { key: "all", label: "All", txTypes: null },
  { key: "deposits", label: "Deposits", txTypes: ["deposit"] },
  { key: "usage", label: "Usage", txTypes: ["spend", "usage", "charge"] },
  {
    key: "adjustments",
    label: "Adjustments",
    txTypes: ["refund", "adjustment", "bonus", "credit"]
  }
];
function Ju(e, r) {
  const s = e < 0, o = Math.abs(e), n = $o(r), a = o / Math.pow(10, n), i = s ? "-" : "+";
  return r.toUpperCase() === "SOL" ? `${i}${a.toFixed(4)} SOL` : `${i}$${a.toFixed(2)}`;
}
function eh(e) {
  const r = new Date(e), s = /* @__PURE__ */ new Date(), o = s.getTime() - r.getTime();
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
  return n === 1 ? "Yesterday" : n < 7 ? `${n}d ago` : r.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: r.getFullYear() !== s.getFullYear() ? "numeric" : void 0
  });
}
function th(e) {
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
function rh(e, r) {
  const s = (e || "").toLowerCase();
  return s === "deposit" ? "↓" : s === "spend" || s === "usage" || s === "charge" ? "↑" : s === "refund" ? "←" : s === "bonus" || s === "credit" ? "★" : r ? "+" : "−";
}
function mm({
  defaultTab: e = "all",
  pageSize: r = 10,
  refreshInterval: s = 0,
  className: o = "",
  onLoad: n,
  onTransactionClick: a
}) {
  const { getHistory: i, isLoading: d, error: l, clearError: h } = Ko(), [m, u] = S(e), [p, y] = S([]), [w, g] = S(0), [k, A] = S(0), [C, E] = S(null), x = Tr.find((R) => R.key === m) || Tr[0], L = q(() => x.txTypes === null ? p : p.filter((R) => {
    const I = R.txType || "";
    return x.txTypes.some((M) => I.toLowerCase() === M.toLowerCase());
  }), [p, x.txTypes]), f = P(async () => {
    try {
      const R = await i({ limit: r * 3, offset: k });
      y(R.transactions), g(R.total), n?.(R), E(null);
    } catch (R) {
      E(R instanceof Error ? R.message : "Failed to load history");
    }
  }, [r, k, i, n]);
  F(() => {
    A(0);
  }, [m]), F(() => {
    f();
  }, [f]), F(() => {
    if (s <= 0) return;
    const R = setInterval(f, s);
    return () => clearInterval(R);
  }, [s, f]);
  const b = x.txTypes === null ? w : L.length, v = Math.ceil(b / r), N = Math.floor(k / r) + 1, T = (R) => {
    const I = (R - 1) * r;
    A(Math.max(0, Math.min(I, Math.max(0, b - r))));
  }, _ = (R) => {
    u(R);
  };
  if (C || l)
    return /* @__PURE__ */ c("div", { className: `cedros-tx-history cedros-tx-history-error ${o}`, children: [
      /* @__PURE__ */ t("p", { className: "cedros-tx-error", children: C || l }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-tx-retry",
          onClick: () => {
            h(), E(null), f();
          },
          children: "Retry"
        }
      )
    ] });
  if (d && p.length === 0)
    return /* @__PURE__ */ c("div", { className: `cedros-tx-history cedros-tx-history-loading ${o}`, children: [
      /* @__PURE__ */ t("span", { className: "cedros-tx-loading-indicator" }),
      /* @__PURE__ */ t("span", { className: "cedros-tx-loading-text", children: "Loading transactions..." })
    ] });
  const B = (R) => R.txTypes === null ? p.length : p.filter((I) => {
    const M = I.txType || "";
    return R.txTypes.some((U) => M.toLowerCase() === U.toLowerCase());
  }).length;
  return /* @__PURE__ */ c("div", { className: `cedros-tx-history ${o}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-tx-header", children: [
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
    /* @__PURE__ */ t("div", { className: "cedros-tx-tabs", children: Tr.map((R) => {
      const I = B(R), M = m === R.key;
      return /* @__PURE__ */ c(
        "button",
        {
          type: "button",
          className: `cedros-tx-tab ${M ? "cedros-tx-tab-active" : ""}`,
          onClick: () => _(R.key),
          children: [
            R.label,
            I > 0 && /* @__PURE__ */ t("span", { className: "cedros-tx-tab-count", children: I })
          ]
        },
        R.key
      );
    }) }),
    L.length === 0 ? /* @__PURE__ */ c("div", { className: "cedros-tx-empty", children: [
      /* @__PURE__ */ t("p", { className: "cedros-tx-empty-message", children: m === "all" ? "No transactions yet." : `No ${x.label.toLowerCase()} found.` }),
      m === "all" && /* @__PURE__ */ t("p", { className: "cedros-tx-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ c(X, { children: [
      /* @__PURE__ */ t("div", { className: "cedros-tx-list", children: L.slice(0, r).map((R) => {
        const I = R.amountLamports >= 0;
        return /* @__PURE__ */ c(
          "div",
          {
            className: `cedros-tx-item ${I ? "cedros-tx-item-positive" : "cedros-tx-item-negative"}`,
            onClick: () => a?.(R),
            onKeyDown: (M) => {
              (M.key === "Enter" || M.key === " ") && (M.preventDefault(), a?.(R));
            },
            role: a ? "button" : void 0,
            tabIndex: a ? 0 : void 0,
            children: [
              /* @__PURE__ */ t(
                "div",
                {
                  className: `cedros-tx-icon ${I ? "cedros-tx-icon-positive" : "cedros-tx-icon-negative"}`,
                  children: rh(R.txType, I)
                }
              ),
              /* @__PURE__ */ c("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ c("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ t("span", { className: "cedros-tx-type", children: th(R.txType) }),
                  /* @__PURE__ */ t(
                    "span",
                    {
                      className: `cedros-tx-amount ${I ? "cedros-tx-amount-positive" : "cedros-tx-amount-negative"}`,
                      children: Ju(R.amountLamports, R.currency)
                    }
                  )
                ] }),
                /* @__PURE__ */ c("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ t("span", { className: "cedros-tx-description", children: R.description }),
                  /* @__PURE__ */ t("span", { className: "cedros-tx-date", children: eh(R.createdAt) })
                ] })
              ] })
            ]
          },
          R.id
        );
      }) }),
      v > 1 && /* @__PURE__ */ c("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => T(N - 1),
            disabled: N <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ c("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          N,
          " of ",
          v
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => T(N + 1),
            disabled: N >= v,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function Yo() {
  const e = He(), [r, s] = S(!1), [o, n] = S(null), [a, i] = S(null), d = q(() => e ? new ae({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), l = P(() => {
    n(null);
  }, []), h = P(async () => {
    if (!d)
      throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
    try {
      return await d.get("/wallet/withdraw/balances");
    } catch (y) {
      const w = j(y, "Failed to fetch wallet balances");
      throw n(w.message), w;
    }
  }, [d]), m = P(
    async (y, w) => {
      if (!d)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const g = await d.post("/wallet/withdraw/sol", {
          destination: y,
          amount_lamports: w
        });
        return i(g), g;
      } catch (g) {
        const k = j(g, "Failed to withdraw SOL");
        throw n(k.message), k;
      } finally {
        s(!1);
      }
    },
    [d]
  ), u = P(
    async (y, w, g) => {
      if (!d)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      s(!0), n(null);
      try {
        const k = await d.post("/wallet/withdraw/spl", {
          destination: y,
          token_mint: w,
          amount: g
        });
        return i(k), k;
      } catch (k) {
        const A = j(k, "Failed to withdraw token");
        throw n(A.message), A;
      } finally {
        s(!1);
      }
    },
    [d]
  ), p = P(
    async (y = 10, w = 0) => {
      if (!d)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      try {
        const g = Math.max(1, Math.min(100, Math.trunc(y))), k = Math.max(0, Math.trunc(w)), A = new URLSearchParams({
          limit: String(g),
          offset: String(k)
        });
        return await d.get(
          `/wallet/withdraw/history?${A}`
        );
      } catch (g) {
        const k = j(g, "Failed to fetch withdrawal history");
        throw n(k.message), k;
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
const Rr = "So11111111111111111111111111111111111111112", sh = {
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
function nh(e) {
  return e.length < 32 || e.length > 50 ? !1 : /^[1-9A-HJ-NP-Za-km-z]+$/.test(e);
}
function Br(e) {
  return e.length <= 16 ? e : `${e.slice(0, 6)}...${e.slice(-6)}`;
}
function kt(e, r) {
  return (Number(e) / Math.pow(10, r)).toLocaleString(void 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(r, 6)
  });
}
function fm({
  onSuccess: e,
  onError: r,
  onCancel: s,
  className: o = ""
}) {
  const n = He(), { withdrawSol: a, withdrawSpl: i, getBalances: d, isSubmitting: l, error: h, clearError: m } = Yo(), [u, p] = S("loading"), [y, w] = S([]), [g, k] = S(null), [A, C] = S(""), [E, x] = S(""), [L, f] = S(null), [b, v] = S(null), [N, T] = S(null), _ = n?.config.solana?.network ?? "mainnet-beta", B = q(() => {
    if (!L?.txSignature) return "";
    const D = `https://explorer.solana.com/tx/${L.txSignature}`;
    return _ === "mainnet-beta" ? D : `${D}?cluster=${encodeURIComponent(_)}`;
  }, [L, _]), R = q(() => {
    if (!g || !E) return "0";
    const D = parseFloat(E);
    return isNaN(D) || D <= 0 ? "0" : Math.floor(D * Math.pow(10, g.decimals)).toString();
  }, [E, g]);
  F(() => {
    if (!n) return;
    let D = !1;
    return (async () => {
      try {
        const O = await d();
        if (D) return;
        const H = [];
        O.solLamports > 0 && H.push({
          symbol: "SOL",
          mint: Rr,
          decimals: 9,
          rawBalance: String(O.solLamports),
          displayBalance: kt(String(O.solLamports), 9)
        });
        for (const ee of O.tokens) {
          const ie = sh[ee.mint] ?? Br(ee.mint);
          H.push({
            symbol: ie,
            mint: ee.mint,
            decimals: ee.decimals,
            rawBalance: ee.amount,
            displayBalance: kt(ee.amount, ee.decimals)
          });
        }
        w(H), p((H.length > 0, "select"));
      } catch {
        D || (T("Failed to load wallet balances"), p("select"));
      }
    })(), () => {
      D = !0;
    };
  }, [n, d]);
  const I = P(
    (D) => {
      k(D), p("form"), m(), v(null), x("");
    },
    [m]
  ), M = P(() => {
    if (!g) return;
    const D = Number(g.rawBalance) / Math.pow(10, g.decimals);
    g.mint === Rr ? x(String(Math.max(0, D - 0.01))) : x(String(D));
  }, [g]), U = P(() => {
    if (v(null), !A.trim()) {
      v("Destination address is required");
      return;
    }
    if (!nh(A.trim())) {
      v("Invalid Solana address");
      return;
    }
    if (!E || parseFloat(E) <= 0 || isNaN(parseFloat(E))) {
      v("Please enter a valid amount");
      return;
    }
    if (R === "0") {
      v("Amount is too small");
      return;
    }
    p("confirm");
  }, [A, E, R]), W = P(async () => {
    if (g) {
      p("processing"), m();
      try {
        let D;
        g.mint === Rr ? D = await a(A.trim(), Number(R)) : D = await i(A.trim(), g.mint, R), f(D), p("success"), e?.(D);
      } catch (D) {
        p("confirm"), r?.(D instanceof Error ? D : new Error(String(D)));
      }
    }
  }, [
    g,
    A,
    R,
    a,
    i,
    m,
    e,
    r
  ]), z = P(() => {
    m(), v(null), u === "form" ? (p("select"), k(null), x(""), C("")) : u === "confirm" && p("form");
  }, [u, m]), $ = P(() => {
    p("select"), k(null), C(""), x(""), f(null), m(), v(null);
  }, [m]);
  return n ? /* @__PURE__ */ c("div", { className: `cedros-withdrawal ${o}`, children: [
    u === "loading" && /* @__PURE__ */ c("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ t(Z, {}),
      /* @__PURE__ */ t("p", { className: "cedros-withdrawal-processing-text", children: "Loading wallet balances..." })
    ] }),
    u === "select" && /* @__PURE__ */ c("div", { className: "cedros-withdrawal-select", children: [
      /* @__PURE__ */ c("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ t("h3", { className: "cedros-withdrawal-title", children: "Withdraw" }),
        /* @__PURE__ */ t("p", { className: "cedros-withdrawal-subtitle", children: "Select a token to withdraw" })
      ] }),
      N && /* @__PURE__ */ t(le, { error: N }),
      y.length === 0 && !N && /* @__PURE__ */ t("p", { className: "cedros-withdrawal-empty", children: "No tokens found in your wallet." }),
      /* @__PURE__ */ t("div", { className: "cedros-withdrawal-tokens", children: y.map((D) => /* @__PURE__ */ c(
        "button",
        {
          type: "button",
          className: "cedros-withdrawal-token-pill",
          onClick: () => I(D),
          children: [
            /* @__PURE__ */ t("span", { className: "cedros-withdrawal-token-symbol", children: D.symbol }),
            /* @__PURE__ */ t("span", { className: "cedros-withdrawal-token-balance", children: D.displayBalance })
          ]
        },
        D.mint
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
    u === "form" && g && /* @__PURE__ */ c("div", { className: "cedros-withdrawal-form", children: [
      /* @__PURE__ */ c("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: z,
            children: "Back"
          }
        ),
        /* @__PURE__ */ c("h3", { className: "cedros-withdrawal-title", children: [
          "Withdraw ",
          g.symbol
        ] })
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-withdrawal-balance-hint", children: [
        "Balance: ",
        g.displayBalance,
        " ",
        g.symbol
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ t("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-destination", children: "Destination Address" }),
        /* @__PURE__ */ t(
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
      /* @__PURE__ */ c("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ c("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-amount", children: [
          "Amount (",
          g.symbol,
          ")"
        ] }),
        /* @__PURE__ */ c("div", { className: "cedros-withdrawal-amount-row", children: [
          /* @__PURE__ */ t(
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
          /* @__PURE__ */ t(
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
      (b || h) && /* @__PURE__ */ t(le, { error: b || h || "" }),
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
    u === "confirm" && g && /* @__PURE__ */ c("div", { className: "cedros-withdrawal-confirm", children: [
      /* @__PURE__ */ c("div", { className: "cedros-withdrawal-header", children: [
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
      /* @__PURE__ */ c("div", { className: "cedros-withdrawal-summary", children: [
        /* @__PURE__ */ c("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-label", children: "Token" }),
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-value", children: g.symbol })
        ] }),
        /* @__PURE__ */ c("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-label", children: "Amount" }),
          /* @__PURE__ */ c("span", { className: "cedros-withdrawal-summary-value", children: [
            kt(R, g.decimals),
            " ",
            g.symbol
          ] })
        ] }),
        /* @__PURE__ */ c("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-label", children: "Destination" }),
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-value", title: A, children: Br(A) })
        ] }),
        /* @__PURE__ */ c("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-label", children: "Est. Fee" }),
          /* @__PURE__ */ t("span", { className: "cedros-withdrawal-summary-value", children: "~0.000005 SOL" })
        ] })
      ] }),
      h && /* @__PURE__ */ t(le, { error: h }),
      /* @__PURE__ */ c("div", { className: "cedros-withdrawal-actions", children: [
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
    u === "processing" && /* @__PURE__ */ c("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ t(Z, {}),
      /* @__PURE__ */ c("p", { className: "cedros-withdrawal-processing-text", children: [
        "Sending ",
        g?.symbol,
        "..."
      ] })
    ] }),
    u === "success" && L && /* @__PURE__ */ c("div", { className: "cedros-withdrawal-success", children: [
      /* @__PURE__ */ t("div", { className: "cedros-withdrawal-success-icon", children: "✓" }),
      /* @__PURE__ */ t("h3", { className: "cedros-withdrawal-title", children: "Withdrawal Complete" }),
      /* @__PURE__ */ c("p", { className: "cedros-withdrawal-subtitle", children: [
        kt(R, g?.decimals ?? 9),
        " ",
        g?.symbol,
        " ",
        "sent"
      ] }),
      /* @__PURE__ */ c("div", { className: "cedros-withdrawal-tx", children: [
        /* @__PURE__ */ t("span", { className: "cedros-withdrawal-tx-label", children: "Transaction" }),
        /* @__PURE__ */ t(
          "a",
          {
            className: "cedros-withdrawal-tx-link",
            href: B,
            target: "_blank",
            rel: "noreferrer",
            children: Br(L.txSignature)
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
function oh(e, r) {
  if (e === "sol") return "SOL";
  if (!r) return "SPL";
  const s = ls.find((o) => o.mint === r);
  return s ? s.symbol : `${r.slice(0, 4)}...${r.slice(-4)}`;
}
function ah(e, r) {
  const s = Number(e);
  if (Number.isNaN(s)) return e;
  const o = $o(r), n = s / Math.pow(10, o);
  return r === "SOL" ? `${n.toFixed(4)} SOL` : `${n.toFixed(2)} ${r}`;
}
function ih(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function ch(e) {
  const r = new Date(e), s = /* @__PURE__ */ new Date(), o = s.getTime() - r.getTime();
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
  return n === 1 ? "Yesterday" : n < 7 ? `${n}d ago` : r.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: r.getFullYear() !== s.getFullYear() ? "numeric" : void 0
  });
}
function pm({
  pageSize: e = 10,
  className: r = "",
  onTransactionClick: s,
  explorerUrl: o = "https://solscan.io"
}) {
  const n = o.startsWith("https://") ? o : "https://solscan.io", { getHistory: a, error: i, clearError: d } = Yo(), [l, h] = S([]), [m, u] = S(0), [p, y] = S(0), [w, g] = S(!1), [k, A] = S(null), C = P(async () => {
    g(!0);
    try {
      const f = await a(e, p);
      h(f.items), u(f.total), A(null);
    } catch (f) {
      A(f instanceof Error ? f.message : "Failed to load withdrawal history");
    } finally {
      g(!1);
    }
  }, [e, p, a]);
  F(() => {
    C();
  }, [C]);
  const E = Math.ceil(m / e), x = Math.floor(p / e) + 1, L = (f) => {
    const b = (f - 1) * e;
    y(Math.max(0, Math.min(b, Math.max(0, m - e))));
  };
  return k || i ? /* @__PURE__ */ c("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-error ${r}`, children: [
    /* @__PURE__ */ t("p", { className: "cedros-withdrawal-error", children: k || i }),
    /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "cedros-withdrawal-retry",
        onClick: () => {
          d(), A(null), C();
        },
        children: "Retry"
      }
    )
  ] }) : w && l.length === 0 ? /* @__PURE__ */ c("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-loading ${r}`, children: [
    /* @__PURE__ */ t("span", { className: "cedros-tx-loading-indicator" }),
    /* @__PURE__ */ t("span", { className: "cedros-tx-loading-text", children: "Loading withdrawal history..." })
  ] }) : /* @__PURE__ */ c("div", { className: `cedros-withdrawal-history ${r}`, children: [
    /* @__PURE__ */ c("div", { className: "cedros-tx-header", children: [
      /* @__PURE__ */ t("h4", { className: "cedros-tx-title", children: "Withdrawal History" }),
      /* @__PURE__ */ t(
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
    l.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-tx-empty", children: /* @__PURE__ */ t("p", { className: "cedros-tx-empty-message", children: "No withdrawal history yet." }) }) : /* @__PURE__ */ c(X, { children: [
      /* @__PURE__ */ t("div", { className: "cedros-tx-list", children: l.map((f) => {
        const b = oh(f.tokenType, f.tokenMint);
        return /* @__PURE__ */ c(
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
              /* @__PURE__ */ t("div", { className: "cedros-tx-icon cedros-tx-icon-negative", children: "↑" }),
              /* @__PURE__ */ c("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ c("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ c("span", { className: "cedros-tx-type", children: [
                    b,
                    " Withdrawal"
                  ] }),
                  /* @__PURE__ */ t("span", { className: "cedros-tx-amount cedros-tx-amount-negative", children: ah(f.amount, b) })
                ] }),
                /* @__PURE__ */ c("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ c("span", { className: "cedros-tx-description", children: [
                    "To",
                    " ",
                    /* @__PURE__ */ t(
                      "a",
                      {
                        href: `${n}/account/${f.destination}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (v) => v.stopPropagation(),
                        children: ih(f.destination)
                      }
                    ),
                    " · ",
                    /* @__PURE__ */ t(
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
                  /* @__PURE__ */ t("span", { className: "cedros-tx-date", children: ch(f.createdAt) })
                ] })
              ] })
            ]
          },
          f.id
        );
      }) }),
      E > 1 && /* @__PURE__ */ c("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => L(x - 1),
            disabled: x <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ c("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          x,
          " of ",
          E
        ] }),
        /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => L(x + 1),
            disabled: x >= E,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function gm({
  brandLogo: e,
  brandName: r,
  title: s = "Welcome back",
  subtitle: o = "Login with your Apple or Google account",
  termsText: n,
  onSuccess: a,
  defaultTab: i = "login",
  children: d,
  className: l = ""
}) {
  return /* @__PURE__ */ c("div", { className: `cedros-full-page-layout ${l}`, children: [
    (e || r) && /* @__PURE__ */ c("div", { className: "cedros-brand-header", children: [
      e,
      r && /* @__PURE__ */ t("span", { className: "cedros-brand-name", children: r })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-full-page-card", children: [
      /* @__PURE__ */ c("div", { className: "cedros-full-page-header", children: [
        /* @__PURE__ */ t("h1", { className: "cedros-full-page-title", children: s }),
        o && /* @__PURE__ */ t("p", { className: "cedros-full-page-subtitle", children: o })
      ] }),
      d ?? /* @__PURE__ */ t(ns, { defaultTab: i, onSuccess: a })
    ] }),
    n && /* @__PURE__ */ t("p", { className: "cedros-terms-footer", children: n })
  ] });
}
function wm({
  brandName: e = "Your Brand",
  brandLogo: r,
  tagline: s = "Your tagline goes here. Make it compelling.",
  title: o = "Sign in",
  subtitle: n = "Enter your credentials to access your account",
  onSuccess: a,
  defaultTab: i = "login",
  children: d,
  className: l = ""
}) {
  return /* @__PURE__ */ c("div", { className: `cedros-split-page-layout ${l}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-split-page-brand", children: /* @__PURE__ */ c("div", { className: "cedros-split-page-brand-content", children: [
      r ?? /* @__PURE__ */ t("div", { className: "cedros-split-page-logo", children: e.charAt(0).toUpperCase() }),
      /* @__PURE__ */ t("h1", { className: "cedros-split-page-brand-name", children: e }),
      s && /* @__PURE__ */ t("p", { className: "cedros-split-page-tagline", children: s })
    ] }) }),
    /* @__PURE__ */ t("div", { className: "cedros-split-page-form", children: /* @__PURE__ */ c("div", { className: "cedros-split-page-form-content", children: [
      /* @__PURE__ */ t("h2", { className: "cedros-split-page-title", children: o }),
      n && /* @__PURE__ */ t("p", { className: "cedros-split-page-subtitle", children: n }),
      d ?? /* @__PURE__ */ t(ns, { defaultTab: i, onSuccess: a })
    ] }) })
  ] });
}
function ym() {
  const { config: e, _internal: r } = J(), [s, o] = S({
    allowed: !1,
    reason: void 0,
    isLoading: !1,
    error: null
  }), n = q(
    () => new Fa(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      r?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, r]
  ), a = P(
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
  ), i = P(
    async (l) => (await a(l)).allowed,
    [a]
  ), d = P(() => {
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
    clearCheck: d,
    checkAuthorization: a
  };
}
function bm() {
  const { listAllWallets: e, createDerivedWallet: r, deleteDerivedWallet: s } = nt(), [o, n] = S([]), [a, i] = S(!1), [d, l] = S(null), h = P(async () => {
    i(!0), l(null);
    try {
      const y = await e();
      n(y.wallets);
    } catch (y) {
      const w = y instanceof Error ? y.message : "Failed to list wallets";
      l(w);
    } finally {
      i(!1);
    }
  }, [e]), m = P(
    async (y) => {
      i(!0), l(null);
      try {
        const w = await r({ label: y });
        return await h(), w;
      } catch (w) {
        const g = w instanceof Error ? w.message : "Failed to create wallet";
        throw l(g), w;
      } finally {
        i(!1);
      }
    },
    [r, h]
  ), u = P(
    async (y) => {
      i(!0), l(null);
      try {
        await s(y), await h();
      } catch (w) {
        const g = w instanceof Error ? w.message : "Failed to delete wallet";
        throw l(g), w;
      } finally {
        i(!1);
      }
    },
    [s, h]
  ), p = P(() => l(null), []);
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
function vm() {
  const e = He(), [r, s] = S(!1), [o, n] = S(null), [a, i] = S(null), d = q(() => e ? new ae({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), l = P(async () => {
    if (!d)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      const u = await d.get("/wallet/pending-recovery");
      i(u);
    } catch (u) {
      const p = j(u, "Failed to fetch pending recovery");
      throw n(p.message), p;
    } finally {
      s(!1);
    }
  }, [d]), h = P(async () => {
    if (!d)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    s(!0), n(null);
    try {
      const u = { confirmed: !0 };
      await d.post("/wallet/acknowledge-recovery", u), i(null);
    } catch (u) {
      const p = j(u, "Failed to acknowledge recovery");
      throw n(p.message), p;
    } finally {
      s(!1);
    }
  }, [d]), m = P(() => n(null), []);
  return F(() => {
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
function Am(e = {}) {
  const { onExternalSign: r } = e, { solanaPubkey: s, hasExternalWallet: o, status: n, isUnlocked: a } = qt(), {
    signTransaction: i,
    isSigning: d,
    error: l,
    clearError: h
  } = El(), m = q(() => o && r ? "external" : n === "enrolled_locked" || n === "enrolled_unlocked" ? "sss" : "none", [o, r, n]), u = m !== "none", p = n === "enrolled_locked" || n === "enrolled_unlocked";
  return {
    signTransaction: P(
      async (w, g) => {
        if (m === "external") {
          if (!r)
            throw new Error("External wallet signing callback not provided");
          return r(w);
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
      [m, r, a, i]
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
function Nm() {
  const { config: e, _internal: r } = J(), [s, o] = S(null), [n, a] = S(!1), [i, d] = S(null), l = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), h = P(async () => {
    a(!0), d(null);
    try {
      await l.post("/welcome-completed", {});
    } catch (u) {
      const p = u instanceof Error ? u : new Error(String(u));
      throw d(p), p;
    } finally {
      a(!1);
    }
  }, [l]), m = P(() => {
    o(null);
  }, []);
  return {
    postLoginAction: s,
    setPostLoginAction: o,
    markWelcomeCompleted: h,
    clearPostLogin: m,
    isLoading: n,
    error: i
  };
}
function km() {
  const { config: e, _internal: r } = J(), [s, o] = S(!1), [n, a] = S(null), [i, d] = S(null), [l, h] = S(null), [m, u] = S(null), [p, y] = S(null), w = p !== null && p !== "none", g = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), k = P(async () => {
    o(!0), a(null);
    try {
      const C = await g.get("/kyc/status", {
        credentials: "include"
      });
      return d(C.status), h(C.verifiedAt ?? null), u(C.expiresAt ?? null), y(C.enforcementMode), C;
    } catch (C) {
      const E = C instanceof Error ? C : new Error(String(C));
      throw a(E), E;
    } finally {
      o(!1);
    }
  }, [g]), A = P(async () => {
    o(!0), a(null);
    try {
      const C = await g.post(
        "/kyc/start",
        void 0,
        { credentials: "include" }
      );
      return d("pending"), C.redirectUrl;
    } catch (C) {
      const E = C instanceof Error ? C : new Error(String(C));
      throw a(E), E;
    } finally {
      o(!1);
    }
  }, [g]);
  return {
    status: i,
    verifiedAt: l,
    expiresAt: m,
    isRequired: w,
    enforcementMode: p,
    fetchStatus: k,
    startVerification: A,
    isLoading: s,
    error: n
  };
}
function lh() {
  const { config: e, _internal: r } = J(), [s, o] = S(!1), [n, a] = S(null), [i, d] = S(null), [l, h] = S([]), [m, u] = S(0), p = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), y = P(async () => {
    o(!0), a(null);
    try {
      const k = await p.get("/referral/rewards", {
        credentials: "include"
      });
      return d(k), k;
    } catch (k) {
      const A = k instanceof Error ? k : new Error(String(k));
      throw a(A), A;
    } finally {
      o(!1);
    }
  }, [p]), w = P(
    async (k = 10, A = 0) => {
      o(!0), a(null);
      try {
        const C = await p.get(
          `/referral/rewards/history?limit=${k}&offset=${A}`,
          { credentials: "include" }
        );
        return h(C.items), u(C.total), C;
      } catch (C) {
        const E = C instanceof Error ? C : new Error(String(C));
        throw a(E), E;
      } finally {
        o(!1);
      }
    },
    [p]
  ), g = P(
    async (k) => {
      o(!0), a(null);
      try {
        await p.post(
          "/referral/payout-wallet",
          { walletAddress: k },
          { credentials: "include" }
        ), d(
          (A) => A && { ...A, payoutWalletAddress: k }
        );
      } catch (A) {
        const C = A instanceof Error ? A : new Error(String(A));
        throw a(C), C;
      } finally {
        o(!1);
      }
    },
    [p]
  );
  return {
    rewards: i,
    history: l,
    historyTotal: m,
    fetchRewards: y,
    fetchHistory: w,
    setPayoutWallet: g,
    isLoading: s,
    error: n
  };
}
function Ir(e, r) {
  return r === "SOL" ? (e / 1e9).toFixed(4) + " SOL" : "$" + (e / 1e6).toFixed(2);
}
function dh(e) {
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
const uh = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
function hh(e) {
  return uh.test(e);
}
function mh(e) {
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
function fh({ status: e }) {
  const s = {
    pending: "cedros-rewards-panel__badge--pending",
    completed: "cedros-rewards-panel__badge--completed",
    failed: "cedros-rewards-panel__badge--failed",
    credited: "cedros-rewards-panel__badge--credited"
  }[e] ?? "cedros-rewards-panel__badge--pending";
  return /* @__PURE__ */ t("span", { className: `cedros-rewards-panel__badge ${s}`, children: e.charAt(0).toUpperCase() + e.slice(1) });
}
const Ct = 10;
function Cm({ explorerUrl: e = "https://explorer.solana.com", className: r }) {
  const {
    rewards: s,
    history: o,
    historyTotal: n,
    fetchRewards: a,
    fetchHistory: i,
    setPayoutWallet: d,
    isLoading: l,
    error: h
  } = lh(), [m, u] = S(0), [p, y] = S(""), [w, g] = S(null), [k, A] = S(!1), [C, E] = S(!1);
  F(() => {
    a().catch(() => {
    }), i(Ct, 0).catch(() => {
    });
  }, [a, i]), F(() => {
    s?.payoutWalletAddress != null && y(s.payoutWalletAddress);
  }, [s?.payoutWalletAddress]);
  const x = P(
    (v) => {
      u(v), i(Ct, v * Ct).catch(() => {
      });
    },
    [i]
  ), L = Math.ceil(n / Ct), f = P(async () => {
    const v = p.trim();
    if (v !== "" && !hh(v)) {
      g("Invalid address. Must be a base58 string between 32 and 44 characters.");
      return;
    }
    g(null), A(!0), E(!1);
    try {
      await d(v === "" ? null : v), E(!0);
    } catch (N) {
      g(N instanceof Error ? N.message : "Failed to save wallet address.");
    } finally {
      A(!1);
    }
  }, [p, d]), b = s?.rewardType === "direct_payout" ? "Direct Payout" : "Credits";
  return /* @__PURE__ */ c(
    "div",
    {
      className: `cedros-rewards-panel ${r ?? ""}`.trim(),
      "aria-label": "Rewards dashboard",
      children: [
        h && /* @__PURE__ */ t("div", { className: "cedros-rewards-panel__error", role: "alert", children: h.message }),
        /* @__PURE__ */ c(
          "section",
          {
            className: "cedros-rewards-panel__summary",
            "aria-label": "Rewards summary",
            children: [
              /* @__PURE__ */ c("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-label", children: "Total Earned" }),
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-value", children: s ? Ir(s.totalEarned, s.currency) : "—" })
              ] }),
              /* @__PURE__ */ c("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-label", children: "Pending Payouts" }),
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-value", children: s ? `${Ir(s.pendingAmount, s.currency)} (${s.pendingCount})` : "—" })
              ] }),
              /* @__PURE__ */ c("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-label", children: "Referrals" }),
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-value", children: s ? String(s.referralCount) : "—" })
              ] }),
              /* @__PURE__ */ c("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-label", children: "Reward Type" }),
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__card-value", children: /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__type-badge", children: b }) })
              ] })
            ]
          }
        ),
        s?.rewardType === "direct_payout" && /* @__PURE__ */ c(
          "section",
          {
            className: "cedros-rewards-panel__wallet-section",
            "aria-label": "Payout wallet",
            children: [
              /* @__PURE__ */ t("h3", { className: "cedros-rewards-panel__section-title", children: "Payout Wallet" }),
              /* @__PURE__ */ c("div", { className: "cedros-rewards-panel__wallet-current", children: [
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__wallet-label", children: "Current address:" }),
                /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__wallet-address", children: s.payoutWalletAddress ?? "Not set" })
              ] }),
              /* @__PURE__ */ c("div", { className: "cedros-rewards-panel__wallet-form", children: [
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
                    onChange: (v) => {
                      y(v.target.value), g(null), E(!1);
                    },
                    placeholder: "Base58 Solana address",
                    "aria-describedby": w ? "cedros-wallet-error" : void 0,
                    disabled: k
                  }
                ),
                /* @__PURE__ */ t(
                  "button",
                  {
                    type: "button",
                    className: "cedros-rewards-panel__wallet-save-btn",
                    onClick: f,
                    disabled: k || l,
                    children: k ? "Saving..." : "Save"
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
              C && !w && /* @__PURE__ */ t(
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
        /* @__PURE__ */ c(
          "section",
          {
            className: "cedros-rewards-panel__history-section",
            "aria-label": "Reward history",
            children: [
              /* @__PURE__ */ t("h3", { className: "cedros-rewards-panel__section-title", children: "History" }),
              l && o.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-rewards-panel__loading", "aria-busy": "true", children: "Loading..." }) : o.length === 0 ? /* @__PURE__ */ t("div", { className: "cedros-rewards-panel__empty", children: "No rewards yet." }) : /* @__PURE__ */ c(X, { children: [
                /* @__PURE__ */ t("div", { className: "cedros-rewards-panel__table-wrapper", role: "region", "aria-label": "Reward history table", tabIndex: 0, children: /* @__PURE__ */ c("table", { className: "cedros-rewards-panel__table", children: [
                  /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ c("tr", { children: [
                    /* @__PURE__ */ t("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Date" }),
                    /* @__PURE__ */ t("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Type" }),
                    /* @__PURE__ */ t("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Amount" }),
                    /* @__PURE__ */ t("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Status" }),
                    /* @__PURE__ */ t("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Transaction" })
                  ] }) }),
                  /* @__PURE__ */ t("tbody", { children: o.map((v) => /* @__PURE__ */ c("tr", { className: "cedros-rewards-panel__tr", children: [
                    /* @__PURE__ */ t("td", { className: "cedros-rewards-panel__td", children: dh(v.createdAt) }),
                    /* @__PURE__ */ t("td", { className: "cedros-rewards-panel__td", children: mh(v.triggerType) }),
                    /* @__PURE__ */ t("td", { className: "cedros-rewards-panel__td", children: Ir(v.amount, v.currency) }),
                    /* @__PURE__ */ t("td", { className: "cedros-rewards-panel__td", children: /* @__PURE__ */ t(fh, { status: v.status }) }),
                    /* @__PURE__ */ t("td", { className: "cedros-rewards-panel__td", children: v.txSignature ? /* @__PURE__ */ c(
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
                    ) : /* @__PURE__ */ t("span", { className: "cedros-rewards-panel__tx-none", children: "—" }) })
                  ] }, v.id)) })
                ] }) }),
                L > 1 && /* @__PURE__ */ c(
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
                          onClick: () => x(m - 1),
                          disabled: m === 0 || l,
                          "aria-label": "Previous page",
                          children: "Previous"
                        }
                      ),
                      /* @__PURE__ */ c("span", { className: "cedros-rewards-panel__page-info", children: [
                        m + 1,
                        " / ",
                        L
                      ] }),
                      /* @__PURE__ */ t(
                        "button",
                        {
                          type: "button",
                          className: "cedros-rewards-panel__page-btn",
                          onClick: () => x(m + 1),
                          disabled: m >= L - 1 || l,
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
function Em({
  status: e,
  startVerification: r,
  className: s
}) {
  const [o, n] = S(!1), [a, i] = S(null), d = P(async () => {
    n(!0), i(null);
    try {
      const m = await r();
      m && (window.location.href = m);
    } catch (m) {
      i(
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
  return /* @__PURE__ */ c(
    "div",
    {
      className: `cedros-kyc-banner ${s ?? ""}`,
      role: "alert",
      children: [
        /* @__PURE__ */ c("div", { className: "cedros-kyc-banner-content", children: [
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
const ph = 3e3, gh = 6e4;
function wh(e) {
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
function Sm({ fetchStatus: e, onComplete: r, className: s }) {
  const [o, n] = S(null), [a, i] = S(!1), d = se(r);
  d.current = r;
  const l = se(e);
  l.current = e, F(() => {
    let m = !1, u = null;
    const p = setTimeout(() => {
      i(!0), u !== null && clearInterval(u);
    }, gh), y = async () => {
      try {
        const w = await l.current();
        if (m) return;
        n(w.status), w.status !== "pending" && (clearTimeout(p), u !== null && clearInterval(u), d.current?.(w.status));
      } catch {
      }
    };
    return y(), u = setInterval(y, ph), () => {
      m = !0, clearTimeout(p), u !== null && clearInterval(u);
    };
  }, []);
  const h = !o || o === "pending";
  return /* @__PURE__ */ t("div", { className: `cedros-kyc-callback ${s ?? ""}`, role: "status", "aria-live": "polite", children: a && h ? /* @__PURE__ */ c("div", { className: "cedros-kyc-callback-content", children: [
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
  ] }) : h ? /* @__PURE__ */ c("div", { className: "cedros-kyc-callback-content", children: [
    /* @__PURE__ */ t("span", { className: "cedros-kyc-callback-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ t("p", { className: "cedros-kyc-callback-message", children: "Processing your verification..." })
  ] }) : /* @__PURE__ */ c("div", { className: "cedros-kyc-callback-content", children: [
    /* @__PURE__ */ t(
      "p",
      {
        className: `cedros-kyc-callback-message cedros-kyc-callback-message--${o}`,
        children: wh(o)
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
function yh() {
  const { config: e, _internal: r } = J(), [s, o] = S(!1), [n, a] = S(null), [i, d] = S(null), [l, h] = S(null), [m, u] = S(null), [p, y] = S(null), w = p !== null && p !== "none", g = q(
    () => new ae({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: r?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, r]
  ), k = P(async () => {
    o(!0), a(null);
    try {
      const x = await g.get("/accreditation/status", {
        credentials: "include"
      });
      return d(x.status), h(x.verifiedAt ?? null), u(x.expiresAt ?? null), y(x.enforcementMode), x;
    } catch (x) {
      const L = x instanceof Error ? x : new Error(String(x));
      throw a(L), L;
    } finally {
      o(!1);
    }
  }, [g]), A = P(
    async (x, L) => {
      o(!0), a(null);
      try {
        const f = await g.post(
          "/accreditation/submit",
          { method: x, ...L },
          { credentials: "include" }
        );
        return d("pending"), f;
      } catch (f) {
        const b = f instanceof Error ? f : new Error(String(f));
        throw a(b), b;
      } finally {
        o(!1);
      }
    },
    [g]
  ), C = P(
    async (x, L, f) => {
      o(!0), a(null);
      try {
        const b = new FormData();
        b.append("submissionId", x), b.append("documentType", f), b.append("file", L);
        const v = r?.getAccessToken?.(), N = {};
        v && (N.Authorization = `Bearer ${v}`);
        const T = await fetch(`${e.serverUrl}/accreditation/upload`, {
          method: "POST",
          headers: N,
          credentials: "include",
          body: b
        });
        if (!T.ok) {
          const _ = await T.text().catch(() => T.statusText);
          throw new Error(`Upload failed (${T.status}): ${_}`);
        }
        return T.json();
      } catch (b) {
        const v = b instanceof Error ? b : new Error(String(b));
        throw a(v), v;
      } finally {
        o(!1);
      }
    },
    [e.serverUrl, r]
  ), E = P(async () => {
    o(!0), a(null);
    try {
      return (await g.get(
        "/accreditation/submissions",
        { credentials: "include" }
      )).submissions;
    } catch (x) {
      const L = x instanceof Error ? x : new Error(String(x));
      throw a(L), L;
    } finally {
      o(!1);
    }
  }, [g]);
  return {
    status: i,
    verifiedAt: l,
    expiresAt: m,
    isRequired: w,
    enforcementMode: p,
    fetchStatus: k,
    submitVerification: A,
    uploadDocument: C,
    listSubmissions: E,
    isLoading: s,
    error: n
  };
}
const kn = [
  { method: "income", label: "Income", description: "Verify via annual income ($200K+ individual / $300K+ joint)" },
  { method: "net_worth", label: "Net Worth", description: "Verify via net worth ($1M+ excluding primary residence)" },
  { method: "credential", label: "Professional Credential", description: "Verify via FINRA license (Series 7, 65, or 82)" },
  { method: "third_party_letter", label: "Third-Party Letter", description: "Upload a verification letter from a CPA, attorney, or RIA" },
  { method: "insider", label: "Insider / Officer", description: "Self-certify as a director, executive officer, or general partner" },
  { method: "investment_threshold", label: "Investment Threshold", description: "Qualify via investment commitment ($200K+ individual / $1M+ entity)" }
];
function Et({ label: e, acceptedTypes: r = ".pdf,.jpg,.jpeg,.png,.tiff", documentType: s, files: o, onFilesChange: n, maxFiles: a = 5 }) {
  const i = se(null), [d, l] = S(!1), h = P((u) => {
    if (!u) return;
    const p = Array.from(u), y = [...o, ...p].slice(0, a);
    n(y);
  }, [o, a, n]), m = (u) => {
    n(o.filter((p, y) => y !== u));
  };
  return /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__upload-zone", children: [
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__upload-label", children: e }),
    /* @__PURE__ */ c(
      "div",
      {
        className: `cedros-accreditation-wizard__drop-area${d ? " cedros-accreditation-wizard__drop-area--active" : ""}`,
        role: "button",
        tabIndex: 0,
        "aria-label": `Upload files: ${e}`,
        onClick: () => i.current?.click(),
        onKeyDown: (u) => {
          (u.key === "Enter" || u.key === " ") && i.current?.click();
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
        ref: i,
        type: "file",
        accept: r,
        multiple: a > 1,
        style: { display: "none" },
        onChange: (u) => h(u.target.files),
        "aria-hidden": "true"
      }
    ),
    o.length > 0 && /* @__PURE__ */ t("ul", { className: "cedros-accreditation-wizard__file-list", "aria-label": "Uploaded files", children: o.map((u, p) => /* @__PURE__ */ c("li", { className: "cedros-accreditation-wizard__file-item", children: [
      /* @__PURE__ */ t("span", { children: u.name }),
      /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__file-remove", onClick: () => m(p), "aria-label": `Remove ${u.name}`, children: "Remove" })
    ] }, `${u.name}-${p}`)) })
  ] });
}
function bh(e, r, s, o) {
  r({ ...e, [s]: o });
}
function St(e, r) {
  return e.filter((s) => s.documentType === r).map((s) => s.file);
}
function xt(e, r, s, o) {
  const n = e.filter((a) => a.documentType !== r);
  o([...n, ...s.map((a) => ({ file: a, documentType: r }))]);
}
function vh({ method: e, formData: r, onFormDataChange: s, fileEntries: o, onFileEntriesChange: n }) {
  const a = (i, d) => bh(r, s, i, d);
  return e === "income" ? /* @__PURE__ */ c("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Income Details" }),
    /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", children: "Income type" }),
      /* @__PURE__ */ c("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ t("input", { type: "radio", name: "incomeType", value: "individual", checked: r.incomeType === "individual", onChange: () => a("incomeType", "individual") }),
        " ",
        "Individual ($200K+)"
      ] }),
      /* @__PURE__ */ c("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ t("input", { type: "radio", name: "incomeType", value: "joint", checked: r.incomeType === "joint", onChange: () => a("incomeType", "joint") }),
        " ",
        "Joint with spouse ($300K+)"
      ] })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "statedAmount", children: "Stated annual income (USD)" }),
      /* @__PURE__ */ t("input", { id: "statedAmount", type: "number", min: 0, className: "cedros-accreditation-wizard__input", value: r.statedAmountUsd ?? "", onChange: (i) => a("statedAmountUsd", i.target.valueAsNumber) })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "userStatement", children: "Statement about current year income expectation" }),
      /* @__PURE__ */ t("textarea", { id: "userStatement", className: "cedros-accreditation-wizard__textarea", rows: 3, value: r.userStatement ?? "", onChange: (i) => a("userStatement", i.target.value) })
    ] }),
    /* @__PURE__ */ t(Et, { label: "Upload tax documents (W-2, 1040, 1099, K-1) from the last 2 years", documentType: "tax_return", files: St(o, "tax_return"), onFilesChange: (i) => xt(o, "tax_return", i, n) })
  ] }) : e === "net_worth" ? /* @__PURE__ */ c("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Net Worth Details" }),
    /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "netWorthAmount", children: "Stated net worth (USD, excluding primary residence)" }),
      /* @__PURE__ */ t("input", { id: "netWorthAmount", type: "number", min: 0, className: "cedros-accreditation-wizard__input", value: r.statedAmountUsd ?? "", onChange: (i) => a("statedAmountUsd", i.target.valueAsNumber) })
    ] }),
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__note", children: "Documents must be dated within the last 90 days." }),
    /* @__PURE__ */ t(Et, { label: "Upload asset documents (bank/brokerage statements, property appraisals)", documentType: "asset_statement", files: St(o, "asset_statement"), onFilesChange: (i) => xt(o, "asset_statement", i, n) }),
    /* @__PURE__ */ t(Et, { label: "Upload liability documents (credit report)", documentType: "liability_statement", files: St(o, "liability_statement"), onFilesChange: (i) => xt(o, "liability_statement", i, n) })
  ] }) : e === "credential" ? /* @__PURE__ */ c("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Professional Credential" }),
    /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "crdNumber", children: "FINRA CRD Number" }),
      /* @__PURE__ */ t("input", { id: "crdNumber", type: "text", className: "cedros-accreditation-wizard__input", value: r.crdNumber ?? "", onChange: (i) => a("crdNumber", i.target.value) })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "licenseType", children: "License type" }),
      /* @__PURE__ */ c("select", { id: "licenseType", className: "cedros-accreditation-wizard__select", value: r.licenseType ?? "", onChange: (i) => a("licenseType", i.target.value), children: [
        /* @__PURE__ */ t("option", { value: "", children: "Select a license" }),
        /* @__PURE__ */ t("option", { value: "series_7", children: "Series 7" }),
        /* @__PURE__ */ t("option", { value: "series_65", children: "Series 65" }),
        /* @__PURE__ */ t("option", { value: "series_82", children: "Series 82" })
      ] })
    ] }),
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__note", children: "Your license will be verified via FINRA BrokerCheck." })
  ] }) : e === "third_party_letter" ? /* @__PURE__ */ c("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Third-Party Letter" }),
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__note", children: "Letter must be dated within the last 90 days." }),
    /* @__PURE__ */ t(Et, { label: "Upload verification letter from a CPA, attorney, RIA, or broker-dealer", documentType: "letter", files: St(o, "letter"), onFilesChange: (i) => xt(o, "letter", i, n), maxFiles: 1 })
  ] }) : e === "insider" ? /* @__PURE__ */ c("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Insider / Officer" }),
    /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "insiderStatement", children: "Describe your role as director, executive officer, or general partner" }),
      /* @__PURE__ */ t("textarea", { id: "insiderStatement", className: "cedros-accreditation-wizard__textarea", rows: 4, value: r.userStatement ?? "", onChange: (i) => a("userStatement", i.target.value) })
    ] }),
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__note", children: "An administrator will verify your status." })
  ] }) : /* @__PURE__ */ c("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ t("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Investment Threshold" }),
    /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", children: "Entity type" }),
      /* @__PURE__ */ c("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ t("input", { type: "radio", name: "entityType", value: "individual", checked: r.entityType === "individual", onChange: () => a("entityType", "individual") }),
        " ",
        "Individual ($200K+)"
      ] }),
      /* @__PURE__ */ c("label", { className: "cedros-accreditation-wizard__radio-label", children: [
        /* @__PURE__ */ t("input", { type: "radio", name: "entityType", value: "entity", checked: r.entityType === "entity", onChange: () => a("entityType", "entity") }),
        " ",
        "Entity ($1M+)"
      ] })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "commitmentAmount", children: "Investment commitment amount (USD)" }),
      /* @__PURE__ */ t("input", { id: "commitmentAmount", type: "number", min: 0, className: "cedros-accreditation-wizard__input", value: r.investmentCommitmentUsd ?? "", onChange: (i) => a("investmentCommitmentUsd", i.target.valueAsNumber) })
    ] }),
    /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ t("label", { className: "cedros-accreditation-wizard__label", htmlFor: "commitmentStatement", children: "Written representation of commitment" }),
      /* @__PURE__ */ t("textarea", { id: "commitmentStatement", className: "cedros-accreditation-wizard__textarea", rows: 3, value: r.userStatement ?? "", onChange: (i) => a("userStatement", i.target.value) })
    ] }),
    /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__note", children: "Per 2025 SEC guidance, a minimum investment commitment serves as evidence of accredited status." })
  ] });
}
function xm({ onComplete: e, onCancel: r, className: s }) {
  const { submitVerification: o, uploadDocument: n, isLoading: a, error: i } = yh(), [d, l] = S(1), [h, m] = S(null), [u, p] = S({}), [y, w] = S([]), [g, k] = S(!1), [A, C] = S(null), E = (b) => {
    m(b), l(2);
  }, x = () => {
    d === 2 ? l(1) : d === 3 ? l(2) : r?.();
  }, L = P(async () => {
    if (h) {
      C(null);
      try {
        const { submissionId: b } = await o(h, u);
        for (const v of y)
          await n(b, v.file, v.documentType);
        k(!0), e?.(b);
      } catch (b) {
        C(b instanceof Error ? b.message : "Submission failed. Please try again.");
      }
    }
  }, [h, u, y, o, n, e]), f = kn.find((b) => b.method === h);
  return g ? /* @__PURE__ */ t("div", { className: `cedros-accreditation-wizard cedros-accreditation-wizard--success ${s ?? ""}`, role: "status", children: /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__success-message", children: "Submitted for review. You will be notified once your accreditation is verified." }) }) : /* @__PURE__ */ c("div", { className: `cedros-accreditation-wizard ${s ?? ""}`, children: [
    /* @__PURE__ */ t("div", { className: "cedros-accreditation-wizard__header", children: /* @__PURE__ */ t("nav", { className: "cedros-accreditation-wizard__steps", "aria-label": "Wizard steps", children: ["Choose Method", "Fill Details", "Review & Submit"].map((b, v) => /* @__PURE__ */ c("span", { className: `cedros-accreditation-wizard__step${d === v + 1 ? " cedros-accreditation-wizard__step--active" : ""}`, "aria-current": d === v + 1 ? "step" : void 0, children: [
      v + 1,
      ". ",
      b
    ] }, b)) }) }),
    d === 1 && /* @__PURE__ */ c("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step1-heading", children: [
      /* @__PURE__ */ t("h2", { id: "step1-heading", className: "cedros-accreditation-wizard__section-title", children: "Choose Verification Method" }),
      /* @__PURE__ */ t("div", { className: "cedros-accreditation-wizard__method-grid", role: "list", children: kn.map((b) => /* @__PURE__ */ c(
        "button",
        {
          type: "button",
          role: "listitem",
          className: "cedros-accreditation-wizard__method-card",
          onClick: () => E(b.method),
          children: [
            /* @__PURE__ */ t("span", { className: "cedros-accreditation-wizard__method-title", children: b.label }),
            /* @__PURE__ */ t("span", { className: "cedros-accreditation-wizard__method-desc", children: b.description })
          ]
        },
        b.method
      )) }),
      r && /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__cancel", onClick: r, children: "Cancel" })
    ] }),
    d === 2 && h && /* @__PURE__ */ c("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step2-heading", children: [
      /* @__PURE__ */ t("h2", { id: "step2-heading", className: "cedros-accreditation-wizard__section-title", children: f?.label }),
      /* @__PURE__ */ t(vh, { method: h, formData: u, onFormDataChange: p, fileEntries: y, onFileEntriesChange: w }),
      /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__actions", children: [
        /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__back", onClick: x, children: "Back" }),
        /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__next", onClick: () => l(3), children: "Review" })
      ] })
    ] }),
    d === 3 && h && /* @__PURE__ */ c("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step3-heading", children: [
      /* @__PURE__ */ t("h2", { id: "step3-heading", className: "cedros-accreditation-wizard__section-title", children: "Review & Submit" }),
      /* @__PURE__ */ c("dl", { className: "cedros-accreditation-wizard__review-list", children: [
        /* @__PURE__ */ t("dt", { className: "cedros-accreditation-wizard__review-term", children: "Method" }),
        /* @__PURE__ */ t("dd", { className: "cedros-accreditation-wizard__review-detail", children: f?.label }),
        Object.entries(u).filter(([, b]) => b !== void 0 && b !== "" && b !== null).map(([b, v]) => /* @__PURE__ */ c("div", { children: [
          /* @__PURE__ */ t("dt", { className: "cedros-accreditation-wizard__review-term", children: b }),
          /* @__PURE__ */ t("dd", { className: "cedros-accreditation-wizard__review-detail", children: String(v) })
        ] }, b))
      ] }),
      y.length > 0 && /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__review-files", children: [
        /* @__PURE__ */ t("p", { className: "cedros-accreditation-wizard__review-files-heading", children: "Documents to upload:" }),
        /* @__PURE__ */ t("ul", { children: y.map((b, v) => /* @__PURE__ */ c("li", { children: [
          b.file.name,
          " ",
          /* @__PURE__ */ c("span", { className: "cedros-accreditation-wizard__doc-type", children: [
            "(",
            b.documentType,
            ")"
          ] })
        ] }, `${b.file.name}-${v}`)) })
      ] }),
      (i || A) && /* @__PURE__ */ t("div", { className: "cedros-accreditation-wizard__error", role: "alert", children: A ?? i?.message }),
      /* @__PURE__ */ c("div", { className: "cedros-accreditation-wizard__actions", children: [
        /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__back", onClick: x, disabled: a, children: "Back" }),
        /* @__PURE__ */ t("button", { type: "button", className: "cedros-accreditation-wizard__submit", onClick: L, disabled: a, children: a ? "Submitting..." : "Submit Verification" })
      ] })
    ] })
  ] });
}
function _m({
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
      children: /* @__PURE__ */ c("div", { className: "cedros-accreditation-banner__content", children: [
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
const us = ha(null), Vr = {
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
function Ah(e, r) {
  return Zo(e, r);
}
function Zo(e, r) {
  const s = { ...e };
  for (const o in r)
    if (Object.prototype.hasOwnProperty.call(r, o)) {
      const n = e[o], a = r[o];
      typeof n == "object" && n !== null && typeof a == "object" && a !== null ? s[o] = Zo(
        n,
        a
      ) : a !== void 0 && (s[o] = a);
    }
  return s;
}
function Lm({
  children: e,
  locale: r = "en",
  translations: s
}) {
  const o = q(() => ({ t: s ? Ah(Vr, s) : Vr, locale: r }), [s, r]);
  return /* @__PURE__ */ t(us.Provider, { value: o, children: e });
}
function Pm() {
  return In(us)?.t ?? Vr;
}
function Tm() {
  return In(us)?.locale ?? "en";
}
export {
  im as AccountSettings,
  _m as AccreditationBanner,
  xm as AccreditationWizard,
  Sd as AdminAccreditationQueue,
  La as AdminDepositList,
  _a as AdminDepositStats,
  Xm as AdminIcons,
  Ta as AdminPrivacyPeriodDeposits,
  Xl as AdminReferralPayouts,
  Ld as AdminSanctionsPanel,
  Jm as AdminShell,
  Ua as AdminUserList,
  Ba as AdminWithdrawalHistory,
  Ra as AdminWithdrawalQueue,
  Pa as AdminWithdrawalStats,
  Qc as AppleLoginButton,
  Wa as AuthenticationSettings,
  ef as CEDROS_LOGIN_SECTION_IDS,
  tm as CapabilityWarning,
  om as CedrosAdminDashboard,
  Im as CedrosLoginProvider,
  dm as ChooseUsernamePrompt,
  lm as CompleteAccountPrompt,
  ld as ComplianceSettings,
  hm as CreditBalance,
  Va as CreditSystemSettings,
  um as DepositFlow,
  fa as EmailLoginForm,
  pa as EmailRegisterForm,
  of as EmailSettings,
  qa as EmbeddedWalletSettings,
  Jc as ErrorBoundary,
  le as ErrorMessage,
  $c as ForgotPasswordForm,
  gm as FullPageLayout,
  ga as GoogleLoginButton,
  mm as History,
  Lm as I18nProvider,
  Aa as InviteForm,
  Na as InviteList,
  Em as KycBanner,
  Sm as KycCallback,
  uu as LinkedAccounts,
  Z as LoadingSpinner,
  Yh as LoginButton,
  ns as LoginForm,
  Zh as LoginModal,
  va as MemberList,
  cm as MfaSetupPrompt,
  Jh as OrgSelector,
  em as OrgSwitcher,
  Dn as OtpInput,
  Zc as PasskeyLoginButton,
  xl as PasskeyPrompt,
  ve as PasswordInput,
  Va as PrivacyCashSettings,
  Oa as ProfileDropdown,
  lu as ProfileTab,
  gl as RecoveryPhraseDisplay,
  wl as RecoveryPhraseInput,
  ud as ReferralSettings,
  Xh as ResetPasswordForm,
  Cm as RewardsPanel,
  ls as SUPPORTED_TOKENS,
  nm as SecuritySettings,
  Ha as ServerSettings,
  ll as SessionList,
  Gr as SettingsPageLayout,
  Bd as SetupWizard,
  wa as SolanaLoginButton,
  wm as SplitPageLayout,
  sm as SystemSettings,
  jo as TieredAmountSlider,
  yd as TokenGateSettings,
  Wo as TokenSelector,
  nu as TotpSettings,
  Io as TotpSetup,
  qm as TotpVerify,
  am as UserProfileSettings,
  ql as WalletAddressRow,
  Cl as WalletEnrollment,
  rm as WalletManager,
  Ul as WalletRecovery,
  zl as WalletStatus,
  Tl as WalletUnlock,
  cf as WebhookSettings,
  fm as WithdrawalFlow,
  pm as WithdrawalHistory,
  tf as cedrosLoginPlugin,
  Vr as defaultTranslations,
  Mm as getEmbeddedWalletInfo,
  as as getTierForAmount,
  Um as isEmbeddedWalletAvailable,
  rf as loginPlugin,
  Ah as mergeTranslations,
  Qm as registerMobileWallet,
  yh as useAccreditation,
  df as useAdminDeposits,
  sf as useAdminShell,
  Ym as useAdminUsers,
  Hc as useAppleAuth,
  Wt as useAuth,
  Fm as useAuthState,
  Om as useAuthUI,
  ym as useAuthorize,
  J as useCedrosLogin,
  Mo as useCredentials,
  Ko as useCredits,
  ku as useDeposit,
  zm as useEmailAuth,
  Vm as useGoogleAuth,
  zc as useInstantLink,
  ba as useInvites,
  km as useKyc,
  Tm as useLocale,
  ya as useMembers,
  Da as useOrgs,
  Sl as usePasskeySigning,
  ss as usePasswordReset,
  vm as usePendingRecovery,
  Nm as usePostLogin,
  $t as useProfile,
  au as useReferral,
  lh as useRewards,
  Ca as useServerFeatures,
  bu as useSessions,
  Nl as useSetPassword,
  _o as useSetup,
  Gm as useSolanaAuth,
  On as useSystemSettings,
  Bo as useTotp,
  jm as useTotpVerify,
  Am as useTransactionSigning,
  Pm as useTranslations,
  Nu as useUsername,
  qt as useWallet,
  Al as useWalletEnrollment,
  nt as useWalletMaterial,
  Ml as useWalletRecovery,
  El as useWalletSigning,
  bm as useWallets,
  So as useWebAuthn,
  Yo as useWithdrawal,
  zt as validatePassword
};
