import { D as tt, v as Eo, j as Co, w as ts, t as We, k as rs, l as ns, m as xo, n as So, u as Ye, o as _o, q as ss, s as os, x as ke, y as as, z as is, A as Lr, B as cs, E as Bo, G as ls, H as St, I as Lo } from "./CedrosLoginProvider-CeyWPrgb.js";
import { C as Bu, F as Lu, a as Tu, g as Pu, b as Ru, c as Mu, J as Uu, d as Du, e as Iu, f as Fu, K as zu, i as Wu, p as Ou, r as qu, h as ju } from "./CedrosLoginProvider-CeyWPrgb.js";
import { L as G, b as J, E as oe, c as Oe, A as ne, h as V } from "./ErrorMessage-DObd7075.js";
import { u as Vu, a as $u } from "./ErrorMessage-DObd7075.js";
import { jsx as r, jsxs as d, Fragment as X } from "react/jsx-runtime";
import { useState as x, useRef as Q, useMemo as W, useEffect as F, useCallback as P, Suspense as To, lazy as Po, Component as Ro, useId as Mo, createContext as Uo, useContext as ds } from "react";
import { u as _t } from "./useAuth-BS_nYcsy.js";
import { s as us, P as pe, b as Do, O as hs, f as Io } from "./EmailRegisterForm-DrtZJXIS.js";
import { E as Qu, a as Yu, T as Ku, u as Zu, d as Xu, g as Ju } from "./EmailRegisterForm-DrtZJXIS.js";
import { L as Fo, b as zo, c as Wo, O as Oo } from "./useOrgs-PRReHJVn.js";
import { A as th, F as rh, P as nh, S as sh, d as oh, e as ah, u as ih, a as ch } from "./useOrgs-PRReHJVn.js";
import { d as qo } from "./mobileWalletAdapter-73nNoL7O.js";
import { r as dh, u as uh } from "./mobileWalletAdapter-73nNoL7O.js";
import { R as fh } from "./ResetPasswordForm-D0anF-bm.js";
import { G as ph, u as gh } from "./GoogleLoginButton-COhxqq-a.js";
import { I as yh, b as bh, M as Ah, a as vh, u as Nh } from "./useInvites-D_ORGMAB.js";
import { C as jo, S as Ho, b as Vo } from "./AutosaveStatus-CkrF3ffV.js";
import { A as Eh, u as Ch } from "./AdminUserList-Be80MypL.js";
import { AdminReferralPayouts as Sh } from "./AdminReferralPayouts-CLph2yFJ.js";
import { TokenGateSettings as Bh } from "./TokenGateSettings-DjyRgFfN.js";
import { AdminAccreditationQueue as Th } from "./AdminAccreditationQueue-YCI38niZ.js";
import { AdminSanctionsPanel as Rh } from "./AdminSanctionsPanel-BXq59crQ.js";
import { AdminAccessCodes as Uh } from "./AdminAccessCodes-DIvFE0gg.js";
import { u as Ih } from "./useAdminDeposits-OtgKu0TN.js";
import { v as Tr } from "./validation-B8kMV3BL.js";
import { a as zh, A as Wh } from "./AdminDepositList-Cg1aaA9F.js";
import { a as qh, c as jh, b as Hh, A as Vh } from "./AdminWithdrawalHistory-BBWJgiNq.js";
import { A as Gh } from "./AuthenticationSettings-5TzCnQuq.js";
import { C as Yh, R as Kh, a as Zh, S as Xh } from "./SignupSettings-D7AFxlFx.js";
import { C as ef, C as tf } from "./CreditSystemSettings-BfovzQe5.js";
import { E as nf } from "./EmailSettings-DOfOJ_U-.js";
import { E as of } from "./EmbeddedWalletSettings-F7YJfYqW.js";
import { S as cf } from "./ServerSettings-BkzQj9jK.js";
import { S as df, W as uf } from "./WebhookSettings-Ci_CIPUK.js";
async function fs(e, t, n = tt) {
  return Eo(n), Co(e, t, n);
}
function ms(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function $o(e) {
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
const Go = globalThis.crypto, Qo = globalThis.crypto, Yo = globalThis.crypto.subtle, Ko = globalThis.crypto.getRandomValues.bind(globalThis.crypto), Zo = globalThis.crypto.randomUUID.bind(globalThis.crypto), Xo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Go,
  getRandomValues: Ko,
  randomUUID: Zo,
  subtle: Yo,
  webcrypto: Qo
}, Symbol.toStringTag, { value: "Module" })), Jo = /* @__PURE__ */ $o(Xo);
var ea = pt.exports, Xr;
function ta() {
  return Xr || (Xr = 1, (function(e, t) {
    (function(n, o) {
      e.exports = o(Jo);
    })(ea, function(n) {
      var o, s, a, i, c;
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
        }, s = {}, a = new Array(1024).join("0"), i = !0, c = [
          "nodeCryptoRandomBytes",
          "browserCryptoGetRandomValues",
          "testRandom"
        ];
      }
      function f() {
        return !!(s && s.rng && typeof s.rng == "function");
      }
      function h(g, b) {
        var y;
        if (b === 0 || b === 1)
          return g;
        if (b && b > 1024)
          throw new Error(
            "Padding must be multiples of no larger than 1024 bits."
          );
        return b = b || s.bits, g && (y = g.length % b), y ? (a + g).slice(
          -(b - y + g.length)
        ) : g;
      }
      function u(g) {
        var b = "", y, A;
        for (A = g.length - 1; A >= 0; A--) {
          if (y = parseInt(g[A], 16), isNaN(y))
            throw new Error("Invalid hex character.");
          b = h(y.toString(2), 4) + b;
        }
        return b;
      }
      function m(g) {
        var b = "", y, A;
        for (g = h(g, 4), A = g.length; A >= 4; A -= 4) {
          if (y = parseInt(g.slice(A - 4, A), 2), isNaN(y))
            throw new Error("Invalid binary character.");
          b = y.toString(16) + b;
        }
        return b;
      }
      function p() {
        return !!(n && typeof n == "object" && (typeof n.getRandomValues == "function" || typeof n.getRandomValues == "object") && (typeof Uint32Array == "function" || typeof Uint32Array == "object"));
      }
      function w() {
        return typeof n == "object" && typeof n.randomBytes == "function";
      }
      function v(g) {
        function b(_, R, L, M) {
          var U = 0, I, z = "", O;
          for (R && (I = R.length - 1); U < I || z.length < _; )
            O = Math.abs(parseInt(R[U], L)), z = z + h(O.toString(2), M), U++;
          return z = z.substr(-_), (z.match(/0/g) || []).length === z.length ? null : z;
        }
        function y(_) {
          var R, L, M, U, I = null;
          for (M = 16, U = 4, L = Math.ceil(_ / 8); I === null; )
            R = n.randomBytes(L), I = b(_, R.toString("hex"), M, U);
          return I;
        }
        function A(_) {
          var R, L, M, U = null;
          for (L = 10, M = 32, R = Math.ceil(_ / 32); U === null; )
            U = b(
              _,
              n.getRandomValues(new Uint32Array(R)),
              L,
              M
            );
          return U;
        }
        function B(_) {
          var R, L, M, U, I, z = null;
          U = 10, I = 32, L = Math.ceil(_ / 32), M = 123456789, R = new Uint32Array(L);
          for (var O = 0; O < R.length; O++)
            R[O] = M;
          for (; z === null; )
            z = b(_, R, U, I);
          return z;
        }
        if (g && g === "testRandom")
          return s.typeCSPRNG = g, B;
        if (g && g === "nodeCryptoRandomBytes")
          return s.typeCSPRNG = g, y;
        if (g && g === "browserCryptoGetRandomValues")
          return s.typeCSPRNG = g, A;
        if (w())
          return s.typeCSPRNG = "nodeCryptoRandomBytes", y;
        if (p())
          return s.typeCSPRNG = "browserCryptoGetRandomValues", A;
      }
      function C(g, b) {
        var y = [], A;
        for (b && (g = h(g, b)), A = g.length; A > s.bits; A -= s.bits)
          y.push(parseInt(g.slice(A - s.bits, A), 2));
        return y.push(parseInt(g.slice(0, A), 2)), y;
      }
      function E(g, b) {
        var y = s.logs[g], A = 0, B;
        for (B = b.length - 1; B >= 0; B--)
          A !== 0 ? A = s.exps[(y + s.logs[A]) % s.maxShares] ^ b[B] : A = b[B];
        return A;
      }
      function k(g, b, y) {
        var A = 0, B, _, R, L;
        for (R = 0, B = b.length; R < B; R++)
          if (y[R]) {
            for (_ = s.logs[y[R]], L = 0; L < B; L++)
              if (R !== L) {
                if (g === b[L]) {
                  _ = -1;
                  break;
                }
                _ = (_ + s.logs[g ^ b[L]] - s.logs[b[R] ^ b[L]] + s.maxShares) % s.maxShares;
              }
            A = _ === -1 ? A : A ^ s.exps[_];
          }
        return A;
      }
      function N(g, b, y) {
        var A = [], B = [g], _, R;
        for (_ = 1; _ < y; _++)
          B[_] = parseInt(s.rng(s.bits), 2);
        for (_ = 1, R = b + 1; _ < R; _++)
          A[_ - 1] = {
            x: _,
            y: E(_, B)
          };
        return A;
      }
      function S(g, b, y) {
        var A, B, _, R, L;
        if (b = parseInt(b, s.radix), g = parseInt(g, 10) || s.bits, A = g.toString(36).toUpperCase(), _ = Math.pow(2, g) - 1, R = _.toString(s.radix).length, B = h(b.toString(s.radix), R), typeof b != "number" || b % 1 !== 0 || b < 1 || b > _)
          throw new Error(
            "Share id must be an integer between 1 and " + _ + ", inclusive."
          );
        return L = A + B + y, L;
      }
      var T = {
        init: function(g, b) {
          var y = [], A = [], B = 1, _, R;
          if (l(), g && (typeof g != "number" || g % 1 !== 0 || g < o.minBits || g > o.maxBits))
            throw new Error(
              "Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (b && c.indexOf(b) === -1)
            throw new Error("Invalid RNG type argument : '" + b + "'");
          for (s.radix = o.radix, s.bits = g || o.bits, s.size = Math.pow(2, s.bits), s.maxShares = s.size - 1, _ = o.primitivePolynomials[s.bits], R = 0; R < s.size; R++)
            A[R] = B, y[B] = R, B = B << 1, B >= s.size && (B = B ^ _, B = B & s.maxShares);
          if (s.logs = y, s.exps = A, b && this.setRNG(b), f() || this.setRNG(), !f() || !s.bits || !s.size || !s.maxShares || !s.logs || !s.exps || s.logs.length !== s.size || s.exps.length !== s.size)
            throw new Error("Initialization failed.");
        },
        // Evaluates the Lagrange interpolation polynomial at x=`at` for
        // individual config.bits-length segments of each share in the `shares`
        // Array. Each share is expressed in base `inputRadix`. The output
        // is expressed in base `outputRadix'.
        combine: function(g, b) {
          var y, A, B, _, R = "", L, M, U, I = [], z = [];
          for (b = b || 0, y = 0, B = g.length; y < B; y++) {
            if (M = this.extractShareComponents(g[y]), L === void 0)
              L = M.bits;
            else if (M.bits !== L)
              throw new Error(
                "Mismatched shares: Different bit settings."
              );
            if (s.bits !== L && this.init(L), I.indexOf(M.id) === -1)
              for (I.push(M.id), U = C(u(M.data)), A = 0, _ = U.length; A < _; A++)
                z[A] = z[A] || [], z[A][I.length - 1] = U[A];
          }
          for (y = 0, B = z.length; y < B; y++)
            R = h(k(b, I, z[y]).toString(2)) + R;
          return m(
            b >= 1 ? R : R.slice(R.indexOf("1") + 1)
          );
        },
        getConfig: function() {
          var g = {};
          return g.radix = s.radix, g.bits = s.bits, g.maxShares = s.maxShares, g.hasCSPRNG = f(), g.typeCSPRNG = s.typeCSPRNG, g;
        },
        // Given a public share, extract the bits (Integer), share ID (Integer), and share data (Hex)
        // and return an Object containing those components.
        extractShareComponents: function(g) {
          var b, y, A, B, _ = {}, R, L;
          if (b = parseInt(g.substr(0, 1), 36), b && (typeof b != "number" || b % 1 !== 0 || b < o.minBits || b > o.maxBits))
            throw new Error(
              "Invalid share : Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (B = Math.pow(2, b) - 1, A = (Math.pow(2, b) - 1).toString(s.radix).length, R = "^([a-kA-K3-9]{1})([a-fA-F0-9]{" + A + "})([a-fA-F0-9]+)$", L = new RegExp(R).exec(g), L && (y = parseInt(L[2], s.radix)), typeof y != "number" || y % 1 !== 0 || y < 1 || y > B)
            throw new Error(
              "Invalid share : Share id must be an integer between 1 and " + s.maxShares + ", inclusive."
            );
          if (L && L[3])
            return _.bits = b, _.id = y, _.data = L[3], _;
          throw new Error("The share data provided is invalid : " + g);
        },
        // Set the PRNG to use. If no RNG function is supplied, pick a default using getRNG()
        setRNG: function(g) {
          var b = "Random number generator is invalid ", y = " Supply an CSPRNG of the form function(bits){} that returns a string containing 'bits' number of random 1's and 0's.";
          if (g && typeof g == "string" && c.indexOf(g) === -1)
            throw new Error("Invalid RNG type argument : '" + g + "'");
          if (g || (g = v()), g && typeof g == "string" && (g = v(g)), i) {
            if (g && typeof g != "function")
              throw new Error(b + "(Not a function)." + y);
            if (g && typeof g(s.bits) != "string")
              throw new Error(
                b + "(Output is not a string)." + y
              );
            if (g && !parseInt(g(s.bits), 2))
              throw new Error(
                b + "(Binary string output not parseable to an Integer)." + y
              );
            if (g && g(s.bits).length > s.bits)
              throw new Error(
                b + "(Output length is greater than config.bits)." + y
              );
            if (g && g(s.bits).length < s.bits)
              throw new Error(
                b + "(Output length is less than config.bits)." + y
              );
          }
          return s.rng = g, !0;
        },
        // Converts a given UTF16 character string to the HEX representation.
        // Each character of the input string is represented by
        // `bytesPerChar` bytes in the output string which defaults to 2.
        str2hex: function(g, b) {
          var y, A, B = "", _, R, L, M;
          if (typeof g != "string")
            throw new Error("Input must be a character string.");
          if (b || (b = o.bytesPerChar), typeof b != "number" || b < 1 || b > o.maxBytesPerChar || b % 1 !== 0)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (y = 2 * b, A = Math.pow(16, y) - 1, L = 0, M = g.length; L < M; L++) {
            if (R = g[L].charCodeAt(), isNaN(R))
              throw new Error("Invalid character: " + g[L]);
            if (R > A)
              throw _ = Math.ceil(Math.log(R + 1) / Math.log(256)), new Error(
                "Invalid character code (" + R + "). Maximum allowable is 256^bytes-1 (" + A + "). To convert this character, use at least " + _ + " bytes."
              );
            B = h(R.toString(16), y) + B;
          }
          return B;
        },
        // Converts a given HEX number string to a UTF16 character string.
        hex2str: function(g, b) {
          var y, A = "", B, _;
          if (typeof g != "string")
            throw new Error("Input must be a hexadecimal string.");
          if (b = b || o.bytesPerChar, typeof b != "number" || b % 1 !== 0 || b < 1 || b > o.maxBytesPerChar)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (y = 2 * b, g = h(g, y), B = 0, _ = g.length; B < _; B += y)
            A = String.fromCharCode(
              parseInt(g.slice(B, B + y), 16)
            ) + A;
          return A;
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
        share: function(g, b, y, A) {
          var B, _, R = new Array(b), L = new Array(b), M, U, I;
          if (A = A || 128, typeof g != "string")
            throw new Error("Secret must be a string.");
          if (typeof b != "number" || b % 1 !== 0 || b < 2)
            throw new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive."
            );
          if (b > s.maxShares)
            throw B = Math.ceil(Math.log(b + 1) / Math.LN2), new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive. To create " + b + " shares, use at least " + B + " bits."
            );
          if (typeof y != "number" || y % 1 !== 0 || y < 2)
            throw new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive."
            );
          if (y > s.maxShares)
            throw B = Math.ceil(Math.log(y + 1) / Math.LN2), new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive.  To use a threshold of " + y + ", use at least " + B + " bits."
            );
          if (y > b)
            throw new Error(
              "Threshold number of shares was " + y + " but must be less than or equal to the " + b + " shares specified as the total to generate."
            );
          if (typeof A != "number" || A % 1 !== 0 || A < 0 || A > 1024)
            throw new Error(
              "Zero-pad length must be an integer between 0 and 1024 inclusive."
            );
          for (g = "1" + u(g), g = C(g, A), M = 0, I = g.length; M < I; M++)
            for (_ = N(g[M], b, y), U = 0; U < b; U++)
              R[U] = R[U] || _[U].x.toString(s.radix), L[U] = h(_[U].y.toString(2)) + (L[U] || "");
          for (M = 0; M < b; M++)
            R[M] = S(
              s.bits,
              R[M],
              m(L[M])
            );
          return R;
        },
        // Generate a new share with id `id` (a number between 1 and 2^bits-1)
        // `id` can be a Number or a String in the default radix (16)
        newShare: function(g, b) {
          var y, A;
          if (g && typeof g == "string" && (g = parseInt(g, s.radix)), A = g.toString(s.radix), g && A && b && b[0])
            return y = this.extractShareComponents(b[0]), S(
              y.bits,
              A,
              this.combine(b, g)
            );
          throw new Error(
            "Invalid 'id' or 'shares' Array argument to newShare()."
          );
        },
        /* test-code */
        // export private functions so they can be unit tested directly.
        _reset: l,
        _padLeft: h,
        _hex2bin: u,
        _bin2hex: m,
        _hasCryptoGetRandomValues: p,
        _hasCryptoRandomBytes: w,
        _getRNG: v,
        _isSetRNG: f,
        _splitNumStringToIntArray: C,
        _horner: E,
        _lagrange: k,
        _getShares: N,
        _constructPublicShareString: S
        /* end-test-code */
      };
      return T.init(), T;
    });
  })(pt)), pt.exports;
}
var ra = ta();
const ps = /* @__PURE__ */ ms(ra);
function gs(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Pr(e, t = "") {
  if (!Number.isSafeInteger(e) || e < 0) {
    const n = t && `"${t}" `;
    throw new Error(`${n}expected integer >= 0, got ${e}`);
  }
}
function se(e, t, n = "") {
  const o = gs(e), s = e?.length, a = t !== void 0;
  if (!o || a && s !== t) {
    const i = n && `"${n}" `, c = a ? ` of length ${t}` : "", l = o ? `length=${s}` : `type=${typeof e}`;
    throw new Error(i + "expected Uint8Array" + c + ", got " + l);
  }
  return e;
}
function Jr(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function na(e, t) {
  se(e, void 0, "digestInto() output");
  const n = t.outputLen;
  if (e.length < n)
    throw new Error('"digestInto() output" expected to be of length >=' + n);
}
function br(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function Dt(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
const ws = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", sa = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function Rr(e) {
  if (se(e), ws)
    return e.toHex();
  let t = "";
  for (let n = 0; n < e.length; n++)
    t += sa[e[n]];
  return t;
}
const ve = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function en(e) {
  if (e >= ve._0 && e <= ve._9)
    return e - ve._0;
  if (e >= ve.A && e <= ve.F)
    return e - (ve.A - 10);
  if (e >= ve.a && e <= ve.f)
    return e - (ve.a - 10);
}
function ys(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  if (ws)
    return Uint8Array.fromHex(e);
  const t = e.length, n = t / 2;
  if (t % 2)
    throw new Error("hex string expected, got unpadded hex of length " + t);
  const o = new Uint8Array(n);
  for (let s = 0, a = 0; s < n; s++, a += 2) {
    const i = en(e.charCodeAt(a)), c = en(e.charCodeAt(a + 1));
    if (i === void 0 || c === void 0) {
      const l = e[a] + e[a + 1];
      throw new Error('hex string expected, got non-hex character "' + l + '" at index ' + a);
    }
    o[s] = i * 16 + c;
  }
  return o;
}
function tn(...e) {
  let t = 0;
  for (let o = 0; o < e.length; o++) {
    const s = e[o];
    se(s), t += s.length;
  }
  const n = new Uint8Array(t);
  for (let o = 0, s = 0; o < e.length; o++) {
    const a = e[o];
    n.set(a, s), s += a.length;
  }
  return n;
}
function oa(e, t = {}) {
  const n = (s, a) => e(a).update(s).digest(), o = e(void 0);
  return n.outputLen = o.outputLen, n.blockLen = o.blockLen, n.create = (s) => e(s), Object.assign(n, t), Object.freeze(n);
}
function aa(e = 32) {
  const t = typeof globalThis == "object" ? globalThis.crypto : null;
  if (typeof t?.getRandomValues != "function")
    throw new Error("crypto.getRandomValues must be defined");
  return t.getRandomValues(new Uint8Array(e));
}
const ia = (e) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, e])
});
let ca = class {
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
    this.blockLen = t, this.outputLen = n, this.padOffset = o, this.isLE = s, this.buffer = new Uint8Array(t), this.view = Dt(this.buffer);
  }
  update(t) {
    Jr(this), se(t);
    const { view: n, buffer: o, blockLen: s } = this, a = t.length;
    for (let i = 0; i < a; ) {
      const c = Math.min(s - this.pos, a - i);
      if (c === s) {
        const l = Dt(t);
        for (; s <= a - i; i += s)
          this.process(l, i);
        continue;
      }
      o.set(t.subarray(i, i + c), this.pos), this.pos += c, i += c, this.pos === s && (this.process(n, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    Jr(this), na(t, this), this.finished = !0;
    const { buffer: n, view: o, blockLen: s, isLE: a } = this;
    let { pos: i } = this;
    n[i++] = 128, br(this.buffer.subarray(i)), this.padOffset > s - i && (this.process(o, 0), i = 0);
    for (let u = i; u < s; u++)
      n[u] = 0;
    o.setBigUint64(s - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const c = Dt(t), l = this.outputLen;
    if (l % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const f = l / 4, h = this.get();
    if (f > h.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let u = 0; u < f; u++)
      c.setUint32(4 * u, h[u], a);
  }
  digest() {
    const { buffer: t, outputLen: n } = this;
    this.digestInto(t);
    const o = t.slice(0, n);
    return this.destroy(), o;
  }
  _cloneInto(t) {
    t ||= new this.constructor(), t.set(...this.get());
    const { blockLen: n, buffer: o, length: s, finished: a, destroyed: i, pos: c } = this;
    return t.destroyed = i, t.finished = a, t.length = s, t.pos = c, s % n && t.buffer.set(o), t;
  }
  clone() {
    return this._cloneInto();
  }
};
const ae = /* @__PURE__ */ Uint32Array.from([
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
]), st = /* @__PURE__ */ BigInt(2 ** 32 - 1), rn = /* @__PURE__ */ BigInt(32);
function la(e, t = !1) {
  return t ? { h: Number(e & st), l: Number(e >> rn & st) } : { h: Number(e >> rn & st) | 0, l: Number(e & st) | 0 };
}
function da(e, t = !1) {
  const n = e.length;
  let o = new Uint32Array(n), s = new Uint32Array(n);
  for (let a = 0; a < n; a++) {
    const { h: i, l: c } = la(e[a], t);
    [o[a], s[a]] = [i, c];
  }
  return [o, s];
}
const nn = (e, t, n) => e >>> n, sn = (e, t, n) => e << 32 - n | t >>> n, Ve = (e, t, n) => e >>> n | t << 32 - n, $e = (e, t, n) => e << 32 - n | t >>> n, ot = (e, t, n) => e << 64 - n | t >>> n - 32, at = (e, t, n) => e >>> n - 32 | t << 64 - n;
function Ne(e, t, n, o) {
  const s = (t >>> 0) + (o >>> 0);
  return { h: e + n + (s / 2 ** 32 | 0) | 0, l: s | 0 };
}
const ua = (e, t, n) => (e >>> 0) + (t >>> 0) + (n >>> 0), ha = (e, t, n, o) => t + n + o + (e / 2 ** 32 | 0) | 0, fa = (e, t, n, o) => (e >>> 0) + (t >>> 0) + (n >>> 0) + (o >>> 0), ma = (e, t, n, o, s) => t + n + o + s + (e / 2 ** 32 | 0) | 0, pa = (e, t, n, o, s) => (e >>> 0) + (t >>> 0) + (n >>> 0) + (o >>> 0) + (s >>> 0), ga = (e, t, n, o, s, a) => t + n + o + s + a + (e / 2 ** 32 | 0) | 0, bs = da([
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
].map((e) => BigInt(e))), wa = bs[0], ya = bs[1], Be = /* @__PURE__ */ new Uint32Array(80), Le = /* @__PURE__ */ new Uint32Array(80);
class ba extends ca {
  constructor(t) {
    super(128, t, 16, !1);
  }
  // prettier-ignore
  get() {
    const { Ah: t, Al: n, Bh: o, Bl: s, Ch: a, Cl: i, Dh: c, Dl: l, Eh: f, El: h, Fh: u, Fl: m, Gh: p, Gl: w, Hh: v, Hl: C } = this;
    return [t, n, o, s, a, i, c, l, f, h, u, m, p, w, v, C];
  }
  // prettier-ignore
  set(t, n, o, s, a, i, c, l, f, h, u, m, p, w, v, C) {
    this.Ah = t | 0, this.Al = n | 0, this.Bh = o | 0, this.Bl = s | 0, this.Ch = a | 0, this.Cl = i | 0, this.Dh = c | 0, this.Dl = l | 0, this.Eh = f | 0, this.El = h | 0, this.Fh = u | 0, this.Fl = m | 0, this.Gh = p | 0, this.Gl = w | 0, this.Hh = v | 0, this.Hl = C | 0;
  }
  process(t, n) {
    for (let N = 0; N < 16; N++, n += 4)
      Be[N] = t.getUint32(n), Le[N] = t.getUint32(n += 4);
    for (let N = 16; N < 80; N++) {
      const S = Be[N - 15] | 0, T = Le[N - 15] | 0, g = Ve(S, T, 1) ^ Ve(S, T, 8) ^ nn(S, T, 7), b = $e(S, T, 1) ^ $e(S, T, 8) ^ sn(S, T, 7), y = Be[N - 2] | 0, A = Le[N - 2] | 0, B = Ve(y, A, 19) ^ ot(y, A, 61) ^ nn(y, A, 6), _ = $e(y, A, 19) ^ at(y, A, 61) ^ sn(y, A, 6), R = fa(b, _, Le[N - 7], Le[N - 16]), L = ma(R, g, B, Be[N - 7], Be[N - 16]);
      Be[N] = L | 0, Le[N] = R | 0;
    }
    let { Ah: o, Al: s, Bh: a, Bl: i, Ch: c, Cl: l, Dh: f, Dl: h, Eh: u, El: m, Fh: p, Fl: w, Gh: v, Gl: C, Hh: E, Hl: k } = this;
    for (let N = 0; N < 80; N++) {
      const S = Ve(u, m, 14) ^ Ve(u, m, 18) ^ ot(u, m, 41), T = $e(u, m, 14) ^ $e(u, m, 18) ^ at(u, m, 41), g = u & p ^ ~u & v, b = m & w ^ ~m & C, y = pa(k, T, b, ya[N], Le[N]), A = ga(y, E, S, g, wa[N], Be[N]), B = y | 0, _ = Ve(o, s, 28) ^ ot(o, s, 34) ^ ot(o, s, 39), R = $e(o, s, 28) ^ at(o, s, 34) ^ at(o, s, 39), L = o & a ^ o & c ^ a & c, M = s & i ^ s & l ^ i & l;
      E = v | 0, k = C | 0, v = p | 0, C = w | 0, p = u | 0, w = m | 0, { h: u, l: m } = Ne(f | 0, h | 0, A | 0, B | 0), f = c | 0, h = l | 0, c = a | 0, l = i | 0, a = o | 0, i = s | 0;
      const U = ua(B, R, M);
      o = ha(U, A, _, L), s = U | 0;
    }
    ({ h: o, l: s } = Ne(this.Ah | 0, this.Al | 0, o | 0, s | 0)), { h: a, l: i } = Ne(this.Bh | 0, this.Bl | 0, a | 0, i | 0), { h: c, l } = Ne(this.Ch | 0, this.Cl | 0, c | 0, l | 0), { h: f, l: h } = Ne(this.Dh | 0, this.Dl | 0, f | 0, h | 0), { h: u, l: m } = Ne(this.Eh | 0, this.El | 0, u | 0, m | 0), { h: p, l: w } = Ne(this.Fh | 0, this.Fl | 0, p | 0, w | 0), { h: v, l: C } = Ne(this.Gh | 0, this.Gl | 0, v | 0, C | 0), { h: E, l: k } = Ne(this.Hh | 0, this.Hl | 0, E | 0, k | 0), this.set(o, s, a, i, c, l, f, h, u, m, p, w, v, C, E, k);
  }
  roundClean() {
    br(Be, Le);
  }
  destroy() {
    br(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class Aa extends ba {
  Ah = ae[0] | 0;
  Al = ae[1] | 0;
  Bh = ae[2] | 0;
  Bl = ae[3] | 0;
  Ch = ae[4] | 0;
  Cl = ae[5] | 0;
  Dh = ae[6] | 0;
  Dl = ae[7] | 0;
  Eh = ae[8] | 0;
  El = ae[9] | 0;
  Fh = ae[10] | 0;
  Fl = ae[11] | 0;
  Gh = ae[12] | 0;
  Gl = ae[13] | 0;
  Hh = ae[14] | 0;
  Hl = ae[15] | 0;
  constructor() {
    super(64);
  }
}
const va = /* @__PURE__ */ oa(
  () => new Aa(),
  /* @__PURE__ */ ia(3)
);
const As = /* @__PURE__ */ BigInt(0), on = /* @__PURE__ */ BigInt(1);
function Ar(e, t = "") {
  if (typeof e != "boolean") {
    const n = t && `"${t}" `;
    throw new Error(n + "expected boolean, got type=" + typeof e);
  }
  return e;
}
function Na(e) {
  if (typeof e == "bigint") {
    if (!gt(e))
      throw new Error("positive bigint expected, got " + e);
  } else
    Pr(e);
  return e;
}
function vs(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  return e === "" ? As : BigInt("0x" + e);
}
function ka(e) {
  return vs(Rr(e));
}
function yt(e) {
  return vs(Rr(vr(se(e)).reverse()));
}
function Ns(e, t) {
  Pr(t), e = Na(e);
  const n = ys(e.toString(16).padStart(t * 2, "0"));
  if (n.length !== t)
    throw new Error("number too large");
  return n;
}
function Ea(e, t) {
  return Ns(e, t).reverse();
}
function vr(e) {
  return Uint8Array.from(e);
}
const gt = (e) => typeof e == "bigint" && As <= e;
function Ca(e, t, n) {
  return gt(e) && gt(t) && gt(n) && t <= e && e < n;
}
function an(e, t, n, o) {
  if (!Ca(t, n, o))
    throw new Error("expected valid " + e + ": " + n + " <= n < " + o + ", got " + t);
}
const xa = (e) => (on << BigInt(e)) - on;
function Mr(e, t = {}, n = {}) {
  if (!e || typeof e != "object")
    throw new Error("expected valid options object");
  function o(a, i, c) {
    const l = e[a];
    if (c && l === void 0)
      return;
    const f = typeof l;
    if (f !== i || l === null)
      throw new Error(`param "${a}" is invalid: expected ${i}, got ${f}`);
  }
  const s = (a, i) => Object.entries(a).forEach(([c, l]) => o(c, l, i));
  s(t, !1), s(n, !0);
}
function cn(e) {
  const t = /* @__PURE__ */ new WeakMap();
  return (n, ...o) => {
    const s = t.get(n);
    if (s !== void 0)
      return s;
    const a = e(n, ...o);
    return t.set(n, a), a;
  };
}
const he = /* @__PURE__ */ BigInt(0), de = /* @__PURE__ */ BigInt(1), ze = /* @__PURE__ */ BigInt(2), ks = /* @__PURE__ */ BigInt(3), Es = /* @__PURE__ */ BigInt(4), Cs = /* @__PURE__ */ BigInt(5), Sa = /* @__PURE__ */ BigInt(7), xs = /* @__PURE__ */ BigInt(8), _a = /* @__PURE__ */ BigInt(9), Ss = /* @__PURE__ */ BigInt(16);
function ee(e, t) {
  const n = e % t;
  return n >= he ? n : t + n;
}
function we(e, t, n) {
  let o = e;
  for (; t-- > he; )
    o *= o, o %= n;
  return o;
}
function ln(e, t) {
  if (e === he)
    throw new Error("invert: expected non-zero number");
  if (t <= he)
    throw new Error("invert: expected positive modulus, got " + t);
  let n = ee(e, t), o = t, s = he, a = de;
  for (; n !== he; ) {
    const c = o / n, l = o % n, f = s - a * c;
    o = n, n = l, s = a, a = f;
  }
  if (o !== de)
    throw new Error("invert: does not exist");
  return ee(s, t);
}
function Ur(e, t, n) {
  if (!e.eql(e.sqr(t), n))
    throw new Error("Cannot find square root");
}
function _s(e, t) {
  const n = (e.ORDER + de) / Es, o = e.pow(t, n);
  return Ur(e, o, t), o;
}
function Ba(e, t) {
  const n = (e.ORDER - Cs) / xs, o = e.mul(t, ze), s = e.pow(o, n), a = e.mul(t, s), i = e.mul(e.mul(a, ze), s), c = e.mul(a, e.sub(i, e.ONE));
  return Ur(e, c, t), c;
}
function La(e) {
  const t = Dr(e), n = Bs(e), o = n(t, t.neg(t.ONE)), s = n(t, o), a = n(t, t.neg(o)), i = (e + Sa) / Ss;
  return (c, l) => {
    let f = c.pow(l, i), h = c.mul(f, o);
    const u = c.mul(f, s), m = c.mul(f, a), p = c.eql(c.sqr(h), l), w = c.eql(c.sqr(u), l);
    f = c.cmov(f, h, p), h = c.cmov(m, u, w);
    const v = c.eql(c.sqr(h), l), C = c.cmov(f, h, v);
    return Ur(c, C, l), C;
  };
}
function Bs(e) {
  if (e < ks)
    throw new Error("sqrt is not defined for small field");
  let t = e - de, n = 0;
  for (; t % ze === he; )
    t /= ze, n++;
  let o = ze;
  const s = Dr(e);
  for (; dn(s, o) === 1; )
    if (o++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (n === 1)
    return _s;
  let a = s.pow(o, t);
  const i = (t + de) / ze;
  return function(l, f) {
    if (l.is0(f))
      return f;
    if (dn(l, f) !== 1)
      throw new Error("Cannot find square root");
    let h = n, u = l.mul(l.ONE, a), m = l.pow(f, t), p = l.pow(f, i);
    for (; !l.eql(m, l.ONE); ) {
      if (l.is0(m))
        return l.ZERO;
      let w = 1, v = l.sqr(m);
      for (; !l.eql(v, l.ONE); )
        if (w++, v = l.sqr(v), w === h)
          throw new Error("Cannot find square root");
      const C = de << BigInt(h - w - 1), E = l.pow(u, C);
      h = w, u = l.sqr(E), m = l.mul(m, u), p = l.mul(p, E);
    }
    return p;
  };
}
function Ta(e) {
  return e % Es === ks ? _s : e % xs === Cs ? Ba : e % Ss === _a ? La(e) : Bs(e);
}
const Pa = (e, t) => (ee(e, t) & de) === de, Ra = [
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
function Ma(e) {
  const t = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  }, n = Ra.reduce((o, s) => (o[s] = "function", o), t);
  return Mr(e, n), e;
}
function Ua(e, t, n) {
  if (n < he)
    throw new Error("invalid exponent, negatives unsupported");
  if (n === he)
    return e.ONE;
  if (n === de)
    return t;
  let o = e.ONE, s = t;
  for (; n > he; )
    n & de && (o = e.mul(o, s)), s = e.sqr(s), n >>= de;
  return o;
}
function Ls(e, t, n = !1) {
  const o = new Array(t.length).fill(n ? e.ZERO : void 0), s = t.reduce((i, c, l) => e.is0(c) ? i : (o[l] = i, e.mul(i, c)), e.ONE), a = e.inv(s);
  return t.reduceRight((i, c, l) => e.is0(c) ? i : (o[l] = e.mul(i, o[l]), e.mul(i, c)), a), o;
}
function dn(e, t) {
  const n = (e.ORDER - de) / ze, o = e.pow(t, n), s = e.eql(o, e.ONE), a = e.eql(o, e.ZERO), i = e.eql(o, e.neg(e.ONE));
  if (!s && !a && !i)
    throw new Error("invalid Legendre symbol result");
  return s ? 1 : a ? 0 : -1;
}
function Da(e, t) {
  t !== void 0 && Pr(t);
  const n = t !== void 0 ? t : e.toString(2).length, o = Math.ceil(n / 8);
  return { nBitLength: n, nByteLength: o };
}
class Ia {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = he;
  ONE = de;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(t, n = {}) {
    if (t <= he)
      throw new Error("invalid field: expected ORDER > 0, got " + t);
    let o;
    this.isLE = !1, n != null && typeof n == "object" && (typeof n.BITS == "number" && (o = n.BITS), typeof n.sqrt == "function" && (this.sqrt = n.sqrt), typeof n.isLE == "boolean" && (this.isLE = n.isLE), n.allowedLengths && (this._lengths = n.allowedLengths?.slice()), typeof n.modFromBytes == "boolean" && (this._mod = n.modFromBytes));
    const { nBitLength: s, nByteLength: a } = Da(t, o);
    if (a > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = t, this.BITS = s, this.BYTES = a, this._sqrt = void 0, Object.preventExtensions(this);
  }
  create(t) {
    return ee(t, this.ORDER);
  }
  isValid(t) {
    if (typeof t != "bigint")
      throw new Error("invalid field element: expected bigint, got " + typeof t);
    return he <= t && t < this.ORDER;
  }
  is0(t) {
    return t === he;
  }
  // is valid and invertible
  isValidNot0(t) {
    return !this.is0(t) && this.isValid(t);
  }
  isOdd(t) {
    return (t & de) === de;
  }
  neg(t) {
    return ee(-t, this.ORDER);
  }
  eql(t, n) {
    return t === n;
  }
  sqr(t) {
    return ee(t * t, this.ORDER);
  }
  add(t, n) {
    return ee(t + n, this.ORDER);
  }
  sub(t, n) {
    return ee(t - n, this.ORDER);
  }
  mul(t, n) {
    return ee(t * n, this.ORDER);
  }
  pow(t, n) {
    return Ua(this, t, n);
  }
  div(t, n) {
    return ee(t * ln(n, this.ORDER), this.ORDER);
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
    return ln(t, this.ORDER);
  }
  sqrt(t) {
    return this._sqrt || (this._sqrt = Ta(this.ORDER)), this._sqrt(this, t);
  }
  toBytes(t) {
    return this.isLE ? Ea(t, this.BYTES) : Ns(t, this.BYTES);
  }
  fromBytes(t, n = !1) {
    se(t);
    const { _lengths: o, BYTES: s, isLE: a, ORDER: i, _mod: c } = this;
    if (o) {
      if (!o.includes(t.length) || t.length > s)
        throw new Error("Field.fromBytes: expected " + o + " bytes, got " + t.length);
      const f = new Uint8Array(s);
      f.set(t, a ? 0 : f.length - t.length), t = f;
    }
    if (t.length !== s)
      throw new Error("Field.fromBytes: expected " + s + " bytes, got " + t.length);
    let l = a ? yt(t) : ka(t);
    if (c && (l = ee(l, i)), !n && !this.isValid(l))
      throw new Error("invalid field element: outside of range 0..ORDER");
    return l;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(t) {
    return Ls(this, t);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(t, n, o) {
    return o ? n : t;
  }
}
function Dr(e, t = {}) {
  return new Ia(e, t);
}
const bt = /* @__PURE__ */ BigInt(0), Nr = /* @__PURE__ */ BigInt(1);
function un(e, t) {
  const n = t.negate();
  return e ? n : t;
}
function It(e, t) {
  const n = Ls(e.Fp, t.map((o) => o.Z));
  return t.map((o, s) => e.fromAffine(o.toAffine(n[s])));
}
function Ts(e, t) {
  if (!Number.isSafeInteger(e) || e <= 0 || e > t)
    throw new Error("invalid window size, expected [1.." + t + "], got W=" + e);
}
function Ft(e, t) {
  Ts(e, t);
  const n = Math.ceil(t / e) + 1, o = 2 ** (e - 1), s = 2 ** e, a = xa(e), i = BigInt(e);
  return { windows: n, windowSize: o, mask: a, maxNumber: s, shiftBy: i };
}
function hn(e, t, n) {
  const { windowSize: o, mask: s, maxNumber: a, shiftBy: i } = n;
  let c = Number(e & s), l = e >> i;
  c > o && (c -= a, l += Nr);
  const f = t * o, h = f + Math.abs(c) - 1, u = c === 0, m = c < 0, p = t % 2 !== 0;
  return { nextN: l, offset: h, isZero: u, isNeg: m, isNegF: p, offsetF: f };
}
const zt = /* @__PURE__ */ new WeakMap(), Ps = /* @__PURE__ */ new WeakMap();
function Wt(e) {
  return Ps.get(e) || 1;
}
function fn(e) {
  if (e !== bt)
    throw new Error("invalid wNAF");
}
class Fa {
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
    for (; n > bt; )
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
    const { windows: o, windowSize: s } = Ft(n, this.bits), a = [];
    let i = t, c = i;
    for (let l = 0; l < o; l++) {
      c = i, a.push(c);
      for (let f = 1; f < s; f++)
        c = c.add(i), a.push(c);
      i = c.double();
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
    const i = Ft(t, this.bits);
    for (let c = 0; c < i.windows; c++) {
      const { nextN: l, offset: f, isZero: h, isNeg: u, isNegF: m, offsetF: p } = hn(o, c, i);
      o = l, h ? a = a.add(un(m, n[p])) : s = s.add(un(u, n[f]));
    }
    return fn(o), { p: s, f: a };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(t, n, o, s = this.ZERO) {
    const a = Ft(t, this.bits);
    for (let i = 0; i < a.windows && o !== bt; i++) {
      const { nextN: c, offset: l, isZero: f, isNeg: h } = hn(o, i, a);
      if (o = c, !f) {
        const u = n[l];
        s = s.add(h ? u.negate() : u);
      }
    }
    return fn(o), s;
  }
  getPrecomputes(t, n, o) {
    let s = zt.get(n);
    return s || (s = this.precomputeWindow(n, t), t !== 1 && (typeof o == "function" && (s = o(s)), zt.set(n, s))), s;
  }
  cached(t, n, o) {
    const s = Wt(t);
    return this.wNAF(s, this.getPrecomputes(s, t, o), n);
  }
  unsafe(t, n, o, s) {
    const a = Wt(t);
    return a === 1 ? this._unsafeLadder(t, n, s) : this.wNAFUnsafe(a, this.getPrecomputes(a, t, o), n, s);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(t, n) {
    Ts(n, this.bits), Ps.set(t, n), zt.delete(t);
  }
  hasCache(t) {
    return Wt(t) !== 1;
  }
}
function mn(e, t, n) {
  if (t) {
    if (t.ORDER !== e)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return Ma(t), t;
  } else
    return Dr(e, { isLE: n });
}
function za(e, t, n = {}, o) {
  if (o === void 0 && (o = e === "edwards"), !t || typeof t != "object")
    throw new Error(`expected valid ${e} CURVE object`);
  for (const l of ["p", "n", "h"]) {
    const f = t[l];
    if (!(typeof f == "bigint" && f > bt))
      throw new Error(`CURVE.${l} must be positive bigint`);
  }
  const s = mn(t.p, n.Fp, o), a = mn(t.n, n.Fn, o), c = ["Gx", "Gy", "a", "d"];
  for (const l of c)
    if (!s.isValid(t[l]))
      throw new Error(`CURVE.${l} must be valid field element of CURVE.Fp`);
  return t = Object.freeze(Object.assign({}, t)), { CURVE: t, Fp: s, Fn: a };
}
function Wa(e, t) {
  return function(o) {
    const s = e(o);
    return { secretKey: s, publicKey: t(s) };
  };
}
const Te = BigInt(0), re = BigInt(1), Ot = BigInt(2), Oa = BigInt(8);
function qa(e, t, n, o) {
  const s = e.sqr(n), a = e.sqr(o), i = e.add(e.mul(t.a, s), a), c = e.add(e.ONE, e.mul(t.d, e.mul(s, a)));
  return e.eql(i, c);
}
function ja(e, t = {}) {
  const n = za("edwards", e, t, t.FpFnLE), { Fp: o, Fn: s } = n;
  let a = n.CURVE;
  const { h: i } = a;
  Mr(t, {}, { uvRatio: "function" });
  const c = Ot << BigInt(s.BYTES * 8) - re, l = (C) => o.create(C), f = t.uvRatio || ((C, E) => {
    try {
      return { isValid: !0, value: o.sqrt(o.div(C, E)) };
    } catch {
      return { isValid: !1, value: Te };
    }
  });
  if (!qa(o, a, a.Gx, a.Gy))
    throw new Error("bad curve params: generator point");
  function h(C, E, k = !1) {
    const N = k ? re : Te;
    return an("coordinate " + C, E, N, c), E;
  }
  function u(C) {
    if (!(C instanceof w))
      throw new Error("EdwardsPoint expected");
  }
  const m = cn((C, E) => {
    const { X: k, Y: N, Z: S } = C, T = C.is0();
    E == null && (E = T ? Oa : o.inv(S));
    const g = l(k * E), b = l(N * E), y = o.mul(S, E);
    if (T)
      return { x: Te, y: re };
    if (y !== re)
      throw new Error("invZ was invalid");
    return { x: g, y: b };
  }), p = cn((C) => {
    const { a: E, d: k } = a;
    if (C.is0())
      throw new Error("bad point: ZERO");
    const { X: N, Y: S, Z: T, T: g } = C, b = l(N * N), y = l(S * S), A = l(T * T), B = l(A * A), _ = l(b * E), R = l(A * l(_ + y)), L = l(B + l(k * l(b * y)));
    if (R !== L)
      throw new Error("bad point: equation left != right (1)");
    const M = l(N * S), U = l(T * g);
    if (M !== U)
      throw new Error("bad point: equation left != right (2)");
    return !0;
  });
  class w {
    // base / generator point
    static BASE = new w(a.Gx, a.Gy, re, l(a.Gx * a.Gy));
    // zero / infinity / identity point
    static ZERO = new w(Te, re, re, Te);
    // 0, 1, 1, 0
    // math field
    static Fp = o;
    // scalar field
    static Fn = s;
    X;
    Y;
    Z;
    T;
    constructor(E, k, N, S) {
      this.X = h("x", E), this.Y = h("y", k), this.Z = h("z", N, !0), this.T = h("t", S), Object.freeze(this);
    }
    static CURVE() {
      return a;
    }
    static fromAffine(E) {
      if (E instanceof w)
        throw new Error("extended point not allowed");
      const { x: k, y: N } = E || {};
      return h("x", k), h("y", N), new w(k, N, re, l(k * N));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(E, k = !1) {
      const N = o.BYTES, { a: S, d: T } = a;
      E = vr(se(E, N, "point")), Ar(k, "zip215");
      const g = vr(E), b = E[N - 1];
      g[N - 1] = b & -129;
      const y = yt(g), A = k ? c : o.ORDER;
      an("point.y", y, Te, A);
      const B = l(y * y), _ = l(B - re), R = l(T * B - S);
      let { isValid: L, value: M } = f(_, R);
      if (!L)
        throw new Error("bad point: invalid y coordinate");
      const U = (M & re) === re, I = (b & 128) !== 0;
      if (!k && M === Te && I)
        throw new Error("bad point: x=0 and x_0=1");
      return I !== U && (M = l(-M)), w.fromAffine({ x: M, y });
    }
    static fromHex(E, k = !1) {
      return w.fromBytes(ys(E), k);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(E = 8, k = !0) {
      return v.createCache(this, E), k || this.multiply(Ot), this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      p(this);
    }
    // Compare one point to another.
    equals(E) {
      u(E);
      const { X: k, Y: N, Z: S } = this, { X: T, Y: g, Z: b } = E, y = l(k * b), A = l(T * S), B = l(N * b), _ = l(g * S);
      return y === A && B === _;
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
      const { a: E } = a, { X: k, Y: N, Z: S } = this, T = l(k * k), g = l(N * N), b = l(Ot * l(S * S)), y = l(E * T), A = k + N, B = l(l(A * A) - T - g), _ = y + g, R = _ - b, L = y - g, M = l(B * R), U = l(_ * L), I = l(B * L), z = l(R * _);
      return new w(M, U, z, I);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(E) {
      u(E);
      const { a: k, d: N } = a, { X: S, Y: T, Z: g, T: b } = this, { X: y, Y: A, Z: B, T: _ } = E, R = l(S * y), L = l(T * A), M = l(b * N * _), U = l(g * B), I = l((S + T) * (y + A) - R - L), z = U - M, O = U + M, $ = l(L - k * R), D = l(I * z), H = l(O * $), K = l(I * $), Y = l(z * O);
      return new w(D, H, Y, K);
    }
    subtract(E) {
      return this.add(E.negate());
    }
    // Constant-time multiplication.
    multiply(E) {
      if (!s.isValidNot0(E))
        throw new Error("invalid scalar: expected 1 <= sc < curve.n");
      const { p: k, f: N } = v.cached(this, E, (S) => It(w, S));
      return It(w, [k, N])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Does NOT allow scalars higher than CURVE.n.
    // Accepts optional accumulator to merge with multiply (important for sparse scalars)
    multiplyUnsafe(E, k = w.ZERO) {
      if (!s.isValid(E))
        throw new Error("invalid scalar: expected 0 <= sc < curve.n");
      return E === Te ? w.ZERO : this.is0() || E === re ? this : v.unsafe(this, E, (N) => It(w, N), k);
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
      return v.unsafe(this, a.n).is0();
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    toAffine(E) {
      return m(this, E);
    }
    clearCofactor() {
      return i === re ? this : this.multiplyUnsafe(i);
    }
    toBytes() {
      const { x: E, y: k } = this.toAffine(), N = o.toBytes(k);
      return N[N.length - 1] |= E & re ? 128 : 0, N;
    }
    toHex() {
      return Rr(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const v = new Fa(w, s.BITS);
  return w.BASE.precompute(8), w;
}
function Ha(e, t, n = {}) {
  if (typeof t != "function")
    throw new Error('"hash" function param is required');
  Mr(n, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    mapToCurve: "function"
  });
  const { prehash: o } = n, { BASE: s, Fp: a, Fn: i } = e, c = n.randomBytes || aa, l = n.adjustScalarBytes || ((y) => y), f = n.domain || ((y, A, B) => {
    if (Ar(B, "phflag"), A.length || B)
      throw new Error("Contexts/pre-hash are not supported");
    return y;
  });
  function h(y) {
    return i.create(yt(y));
  }
  function u(y) {
    const A = N.secretKey;
    se(y, N.secretKey, "secretKey");
    const B = se(t(y), 2 * A, "hashedSecretKey"), _ = l(B.slice(0, A)), R = B.slice(A, 2 * A), L = h(_);
    return { head: _, prefix: R, scalar: L };
  }
  function m(y) {
    const { head: A, prefix: B, scalar: _ } = u(y), R = s.multiply(_), L = R.toBytes();
    return { head: A, prefix: B, scalar: _, point: R, pointBytes: L };
  }
  function p(y) {
    return m(y).pointBytes;
  }
  function w(y = Uint8Array.of(), ...A) {
    const B = tn(...A);
    return h(t(f(B, se(y, void 0, "context"), !!o)));
  }
  function v(y, A, B = {}) {
    y = se(y, void 0, "message"), o && (y = o(y));
    const { prefix: _, scalar: R, pointBytes: L } = m(A), M = w(B.context, _, y), U = s.multiply(M).toBytes(), I = w(B.context, U, L, y), z = i.create(M + I * R);
    if (!i.isValid(z))
      throw new Error("sign failed: invalid s");
    const O = tn(U, i.toBytes(z));
    return se(O, N.signature, "result");
  }
  const C = { zip215: !0 };
  function E(y, A, B, _ = C) {
    const { context: R, zip215: L } = _, M = N.signature;
    y = se(y, M, "signature"), A = se(A, void 0, "message"), B = se(B, N.publicKey, "publicKey"), L !== void 0 && Ar(L, "zip215"), o && (A = o(A));
    const U = M / 2, I = y.subarray(0, U), z = yt(y.subarray(U, M));
    let O, $, D;
    try {
      O = e.fromBytes(B, L), $ = e.fromBytes(I, L), D = s.multiplyUnsafe(z);
    } catch {
      return !1;
    }
    if (!L && O.isSmallOrder())
      return !1;
    const H = w(R, $.toBytes(), O.toBytes(), A);
    return $.add(O.multiplyUnsafe(H)).subtract(D).clearCofactor().is0();
  }
  const k = a.BYTES, N = {
    secretKey: k,
    publicKey: k,
    signature: 2 * k,
    seed: k
  };
  function S(y = c(N.seed)) {
    return se(y, N.seed, "seed");
  }
  function T(y) {
    return gs(y) && y.length === i.BYTES;
  }
  function g(y, A) {
    try {
      return !!e.fromBytes(y, A);
    } catch {
      return !1;
    }
  }
  const b = {
    getExtendedPublicKey: m,
    randomSecretKey: S,
    isValidSecretKey: T,
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
    toMontgomery(y) {
      const { y: A } = e.fromBytes(y), B = N.publicKey, _ = B === 32;
      if (!_ && B !== 57)
        throw new Error("only defined for 25519 and 448");
      const R = _ ? a.div(re + A, re - A) : a.div(A - re, A + re);
      return a.toBytes(R);
    },
    toMontgomerySecret(y) {
      const A = N.secretKey;
      se(y, A);
      const B = t(y.subarray(0, A));
      return l(B).subarray(0, A);
    }
  };
  return Object.freeze({
    keygen: Wa(S, p),
    getPublicKey: p,
    sign: v,
    verify: E,
    utils: b,
    Point: e,
    lengths: N
  });
}
const Va = BigInt(1), pn = BigInt(2), $a = BigInt(5), Ga = BigInt(8), Ir = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"), Qa = {
  p: Ir,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: Ga,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
};
function Ya(e) {
  const t = BigInt(10), n = BigInt(20), o = BigInt(40), s = BigInt(80), a = Ir, c = e * e % a * e % a, l = we(c, pn, a) * c % a, f = we(l, Va, a) * e % a, h = we(f, $a, a) * f % a, u = we(h, t, a) * h % a, m = we(u, n, a) * u % a, p = we(m, o, a) * m % a, w = we(p, s, a) * p % a, v = we(w, s, a) * p % a, C = we(v, t, a) * h % a;
  return { pow_p_5_8: we(C, pn, a) * e % a, b2: c };
}
function Ka(e) {
  return e[0] &= 248, e[31] &= 127, e[31] |= 64, e;
}
const gn = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function Za(e, t) {
  const n = Ir, o = ee(t * t * t, n), s = ee(o * o * t, n), a = Ya(e * s).pow_p_5_8;
  let i = ee(e * o * a, n);
  const c = ee(t * i * i, n), l = i, f = ee(i * gn, n), h = c === e, u = c === ee(-e, n), m = c === ee(-e * gn, n);
  return h && (i = l), (u || m) && (i = f), Pa(i, n) && (i = ee(-i, n)), { isValid: h || u, value: i };
}
const Xa = /* @__PURE__ */ ja(Qa, { uvRatio: Za });
function Ja(e) {
  return Ha(Xa, va, Object.assign({ adjustScalarBytes: Ka }, e));
}
const ei = /* @__PURE__ */ Ja({});
function ti(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Bt(e, ...t) {
  if (!ti(e))
    throw new Error("Uint8Array expected");
  if (t.length > 0 && !t.includes(e.length))
    throw new Error("Uint8Array expected of length " + t + ", got length=" + e.length);
}
function wn(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function ri(e, t) {
  Bt(e);
  const n = t.outputLen;
  if (e.length < n)
    throw new Error("digestInto() expects output buffer of length at least " + n);
}
function kr(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function qt(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function ye(e, t) {
  return e << 32 - t | e >>> t;
}
function ni(e) {
  if (typeof e != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(e));
}
function Rs(e) {
  return typeof e == "string" && (e = ni(e)), Bt(e), e;
}
class si {
}
function oi(e) {
  const t = (o) => e().update(Rs(o)).digest(), n = e();
  return t.outputLen = n.outputLen, t.blockLen = n.blockLen, t.create = () => e(), t;
}
function ai(e, t, n, o) {
  if (typeof e.setBigUint64 == "function")
    return e.setBigUint64(t, n, o);
  const s = BigInt(32), a = BigInt(4294967295), i = Number(n >> s & a), c = Number(n & a), l = o ? 4 : 0, f = o ? 0 : 4;
  e.setUint32(t + l, i, o), e.setUint32(t + f, c, o);
}
function ii(e, t, n) {
  return e & t ^ ~e & n;
}
function ci(e, t, n) {
  return e & t ^ e & n ^ t & n;
}
class li extends si {
  constructor(t, n, o, s) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = t, this.outputLen = n, this.padOffset = o, this.isLE = s, this.buffer = new Uint8Array(t), this.view = qt(this.buffer);
  }
  update(t) {
    wn(this), t = Rs(t), Bt(t);
    const { view: n, buffer: o, blockLen: s } = this, a = t.length;
    for (let i = 0; i < a; ) {
      const c = Math.min(s - this.pos, a - i);
      if (c === s) {
        const l = qt(t);
        for (; s <= a - i; i += s)
          this.process(l, i);
        continue;
      }
      o.set(t.subarray(i, i + c), this.pos), this.pos += c, i += c, this.pos === s && (this.process(n, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    wn(this), ri(t, this), this.finished = !0;
    const { buffer: n, view: o, blockLen: s, isLE: a } = this;
    let { pos: i } = this;
    n[i++] = 128, kr(this.buffer.subarray(i)), this.padOffset > s - i && (this.process(o, 0), i = 0);
    for (let u = i; u < s; u++)
      n[u] = 0;
    ai(o, s - 8, BigInt(this.length * 8), a), this.process(o, 0);
    const c = qt(t), l = this.outputLen;
    if (l % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const f = l / 4, h = this.get();
    if (f > h.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let u = 0; u < f; u++)
      c.setUint32(4 * u, h[u], a);
  }
  digest() {
    const { buffer: t, outputLen: n } = this;
    this.digestInto(t);
    const o = t.slice(0, n);
    return this.destroy(), o;
  }
  _cloneInto(t) {
    t || (t = new this.constructor()), t.set(...this.get());
    const { blockLen: n, buffer: o, length: s, finished: a, destroyed: i, pos: c } = this;
    return t.destroyed = i, t.finished = a, t.length = s, t.pos = c, s % n && t.buffer.set(o), t;
  }
  clone() {
    return this._cloneInto();
  }
}
const Pe = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), di = /* @__PURE__ */ Uint32Array.from([
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
]), Re = /* @__PURE__ */ new Uint32Array(64);
class ui extends li {
  constructor(t = 32) {
    super(64, t, 8, !1), this.A = Pe[0] | 0, this.B = Pe[1] | 0, this.C = Pe[2] | 0, this.D = Pe[3] | 0, this.E = Pe[4] | 0, this.F = Pe[5] | 0, this.G = Pe[6] | 0, this.H = Pe[7] | 0;
  }
  get() {
    const { A: t, B: n, C: o, D: s, E: a, F: i, G: c, H: l } = this;
    return [t, n, o, s, a, i, c, l];
  }
  // prettier-ignore
  set(t, n, o, s, a, i, c, l) {
    this.A = t | 0, this.B = n | 0, this.C = o | 0, this.D = s | 0, this.E = a | 0, this.F = i | 0, this.G = c | 0, this.H = l | 0;
  }
  process(t, n) {
    for (let u = 0; u < 16; u++, n += 4)
      Re[u] = t.getUint32(n, !1);
    for (let u = 16; u < 64; u++) {
      const m = Re[u - 15], p = Re[u - 2], w = ye(m, 7) ^ ye(m, 18) ^ m >>> 3, v = ye(p, 17) ^ ye(p, 19) ^ p >>> 10;
      Re[u] = v + Re[u - 7] + w + Re[u - 16] | 0;
    }
    let { A: o, B: s, C: a, D: i, E: c, F: l, G: f, H: h } = this;
    for (let u = 0; u < 64; u++) {
      const m = ye(c, 6) ^ ye(c, 11) ^ ye(c, 25), p = h + m + ii(c, l, f) + di[u] + Re[u] | 0, v = (ye(o, 2) ^ ye(o, 13) ^ ye(o, 22)) + ci(o, s, a) | 0;
      h = f, f = l, l = c, c = i + p | 0, i = a, a = s, s = o, o = p + v | 0;
    }
    o = o + this.A | 0, s = s + this.B | 0, a = a + this.C | 0, i = i + this.D | 0, c = c + this.E | 0, l = l + this.F | 0, f = f + this.G | 0, h = h + this.H | 0, this.set(o, s, a, i, c, l, f, h);
  }
  roundClean() {
    kr(Re);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), kr(this.buffer);
  }
}
const Ms = /* @__PURE__ */ oi(() => new ui()), hi = Ms, fi = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function mi(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = hi(e), n = ei.getPublicKey(t), o = new Uint8Array(64);
  return o.set(t, 0), o.set(n, 32), ts(t), { publicKey: n, secretKey: o };
}
function Us(e) {
  const t = mi(e), n = t.publicKey;
  return ts(t.secretKey), n;
}
function Ds(e) {
  if (e.length !== 32)
    throw new Error(`Invalid public key length: expected 32, got ${e.length}`);
  return pi(e);
}
function pi(e) {
  let t = 0;
  for (let s = 0; s < e.length && e[s] === 0; s++)
    t++;
  let n = 0n;
  for (let s = 0; s < e.length; s++)
    n = n * 256n + BigInt(e[s]);
  let o = "";
  for (; n > 0n; ) {
    const s = Number(n % 58n);
    o = fi[s] + o, n = n / 58n;
  }
  return "1".repeat(t) + o;
}
const gi = 2, wi = 3;
function Is(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = Er(e), n = ps.share(t, wi, gi);
  if (n.length !== 3)
    throw new Error(`Unexpected share count: ${n.length}`);
  const o = jt(n[0]), s = jt(n[1]), a = jt(n[2]);
  return {
    shareA: We(o),
    shareB: We(s),
    shareC: We(a)
  };
}
function yi(e, t, n) {
  const o = yn(e), s = yn(t);
  try {
    const a = ps.combine([o, s]), i = Fs(a);
    if (i.length !== 16)
      throw new Error(`Reconstructed seed has wrong length: ${i.length}`);
    return rs(i);
  } catch (a) {
    throw a instanceof Error && a.message.startsWith("Reconstructed seed") || a instanceof Error && a.message.startsWith("Invalid expectedPublicKey") || a instanceof Error && a.message.startsWith("Reconstructed seed does not match") ? a : new Error("Failed to reconstruct seed from shares");
  }
}
function Er(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
}
function Fs(e) {
  if (!/^[0-9a-fA-F]*$/.test(e))
    throw new Error("Invalid hex string: contains non-hex characters");
  if (e.length % 2 !== 0)
    throw new Error(`Invalid hex string: length ${e.length} is odd (must be even)`);
  const t = new Uint8Array(e.length / 2);
  for (let n = 0; n < t.length; n++)
    t[n] = parseInt(e.substr(n * 2, 2), 16);
  return t;
}
function jt(e) {
  const t = e.length % 2 !== 0, n = t ? "0" + e : e, o = Fs(n), s = new Uint8Array(1 + o.length);
  return s[0] = t ? 1 : 0, s.set(o, 1), s;
}
function yn(e) {
  const t = e[0];
  if (t === 0 || t === 1) {
    const o = t === 1, s = e.subarray(1), a = Er(s), i = o ? a.substring(1) : a;
    if (/^[0-9a-f]/.test(i))
      return i;
  }
  const n = Er(e);
  return n.startsWith("0") && !n.startsWith("00") ? n.substring(1) : n;
}
function At(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function zs(e, t) {
  return Array.isArray(t) ? t.length === 0 ? !0 : e ? t.every((n) => typeof n == "string") : t.every((n) => Number.isSafeInteger(n)) : !1;
}
function bi(e) {
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
function Nt(e) {
  if (!Array.isArray(e))
    throw new Error("array expected");
}
function kt(e, t) {
  if (!zs(!0, t))
    throw new Error(`${e}: array of strings expected`);
}
function Ws(e, t) {
  if (!zs(!1, t))
    throw new Error(`${e}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function Ai(...e) {
  const t = (a) => a, n = (a, i) => (c) => a(i(c)), o = e.map((a) => a.encode).reduceRight(n, t), s = e.map((a) => a.decode).reduce(n, t);
  return { encode: o, decode: s };
}
// @__NO_SIDE_EFFECTS__
function vi(e) {
  const t = typeof e == "string" ? e.split("") : e, n = t.length;
  kt("alphabet", t);
  const o = new Map(t.map((s, a) => [s, a]));
  return {
    encode: (s) => (Nt(s), s.map((a) => {
      if (!Number.isSafeInteger(a) || a < 0 || a >= n)
        throw new Error(`alphabet.encode: digit index outside alphabet "${a}". Allowed: ${e}`);
      return t[a];
    })),
    decode: (s) => (Nt(s), s.map((a) => {
      vt("alphabet.decode", a);
      const i = o.get(a);
      if (i === void 0)
        throw new Error(`Unknown letter: "${a}". Allowed: ${e}`);
      return i;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function Ni(e = "") {
  return vt("join", e), {
    encode: (t) => (kt("join.decode", t), t.join(e)),
    decode: (t) => (vt("join.decode", t), t.split(e))
  };
}
// @__NO_SIDE_EFFECTS__
function ki(e, t = "=") {
  return Ke(e), vt("padding", t), {
    encode(n) {
      for (kt("padding.encode", n); n.length * e % 8; )
        n.push(t);
      return n;
    },
    decode(n) {
      kt("padding.decode", n);
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
function Cr(e, t, n) {
  if (t < 2)
    throw new Error(`convertRadix: invalid from=${t}, base cannot be less than 2`);
  if (n < 2)
    throw new Error(`convertRadix: invalid to=${n}, base cannot be less than 2`);
  if (Nt(e), !e.length)
    return [];
  let o = 0;
  const s = [], a = Array.from(e, (c) => {
    if (Ke(c), c < 0 || c >= t)
      throw new Error(`invalid integer: ${c}`);
    return c;
  }), i = a.length;
  for (; ; ) {
    let c = 0, l = !0;
    for (let f = o; f < i; f++) {
      const h = a[f], u = t * c, m = u + h;
      if (!Number.isSafeInteger(m) || u / t !== c || m - h !== u)
        throw new Error("convertRadix: carry overflow");
      const p = m / n;
      c = m % n;
      const w = Math.floor(p);
      if (a[f] = w, !Number.isSafeInteger(w) || w * n + c !== m)
        throw new Error("convertRadix: carry overflow");
      if (l)
        w ? l = !1 : o = f;
      else continue;
    }
    if (s.push(c), l)
      break;
  }
  for (let c = 0; c < e.length - 1 && e[c] === 0; c++)
    s.push(0);
  return s.reverse();
}
const Os = (e, t) => t === 0 ? e : Os(t, e % t), Et = /* @__NO_SIDE_EFFECTS__ */ (e, t) => e + (t - Os(e, t)), Ht = /* @__PURE__ */ (() => {
  let e = [];
  for (let t = 0; t < 40; t++)
    e.push(2 ** t);
  return e;
})();
function xr(e, t, n, o) {
  if (Nt(e), t <= 0 || t > 32)
    throw new Error(`convertRadix2: wrong from=${t}`);
  if (n <= 0 || n > 32)
    throw new Error(`convertRadix2: wrong to=${n}`);
  if (/* @__PURE__ */ Et(t, n) > 32)
    throw new Error(`convertRadix2: carry overflow from=${t} to=${n} carryBits=${/* @__PURE__ */ Et(t, n)}`);
  let s = 0, a = 0;
  const i = Ht[t], c = Ht[n] - 1, l = [];
  for (const f of e) {
    if (Ke(f), f >= i)
      throw new Error(`convertRadix2: invalid data word=${f} from=${t}`);
    if (s = s << t | f, a + t > 32)
      throw new Error(`convertRadix2: carry overflow pos=${a} from=${t}`);
    for (a += t; a >= n; a -= n)
      l.push((s >> a - n & c) >>> 0);
    const h = Ht[a];
    if (h === void 0)
      throw new Error("invalid carry");
    s &= h - 1;
  }
  if (s = s << n - a & c, !o && a >= t)
    throw new Error("Excess padding");
  if (!o && s > 0)
    throw new Error(`Non-zero padding: ${s}`);
  return o && a > 0 && l.push(s >>> 0), l;
}
// @__NO_SIDE_EFFECTS__
function Ei(e) {
  Ke(e);
  const t = 2 ** 8;
  return {
    encode: (n) => {
      if (!At(n))
        throw new Error("radix.encode input should be Uint8Array");
      return Cr(Array.from(n), t, e);
    },
    decode: (n) => (Ws("radix.decode", n), Uint8Array.from(Cr(n, e, t)))
  };
}
// @__NO_SIDE_EFFECTS__
function Ci(e, t = !1) {
  if (Ke(e), e <= 0 || e > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Et(8, e) > 32 || /* @__PURE__ */ Et(e, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (n) => {
      if (!At(n))
        throw new Error("radix2.encode input should be Uint8Array");
      return xr(Array.from(n), 8, e, !t);
    },
    decode: (n) => (Ws("radix2.decode", n), Uint8Array.from(xr(n, e, 8, t)))
  };
}
function xi(e, t) {
  return Ke(e), bi(t), {
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
      for (let i = 0; i < e; i++)
        if (a[i] !== s[i])
          throw new Error("Invalid checksum");
      return o;
    }
  };
}
const it = {
  alphabet: vi,
  chain: Ai,
  checksum: xi,
  convertRadix: Cr,
  convertRadix2: xr,
  radix: Ei,
  radix2: Ci,
  join: Ni,
  padding: ki
};
const Si = (e) => e[0] === "あいこくしん";
function _i(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function Bi(e) {
  const t = _i(e), n = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: n };
}
function qs(e) {
  Bt(e, 16, 20, 24, 28, 32);
}
const Li = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([Ms(e)[0] >> t << t]);
};
function js(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), it.chain(it.checksum(1, Li), it.radix2(11, !0), it.alphabet(e));
}
function Fr(e, t) {
  const { words: n } = Bi(e), o = js(t).decode(n);
  return qs(o), o;
}
function Hs(e, t) {
  return qs(e), js(t).encode(e).join(Si(t) ? "　" : " ");
}
function zr(e, t) {
  try {
    Fr(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const Ee = `abandon
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
function Ti(e) {
  if (e.length !== 16)
    throw new Error(`Invalid share length: expected 16, got ${e.length}`);
  const n = Hs(e, Ee).split(" ");
  if (n.length !== me)
    throw new Error(`Unexpected word count: expected ${me}, got ${n.length}`);
  return n;
}
function Pi(e) {
  if (e.length !== me)
    throw new Error(`Invalid word count: expected ${me}, got ${e.length}`);
  const t = e.join(" ").toLowerCase().trim();
  if (!zr(t, Ee))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const n = Fr(t, Ee);
  if (n.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${n.length}`);
  return We(n);
}
function Ri(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const n = Hs(e, Ee).split(" ");
  if (n.length !== me)
    throw new Error(`Unexpected word count: expected ${me}, got ${n.length}`);
  return n;
}
function Mi(e) {
  if (e.length !== me)
    throw new Error(`Invalid word count: expected ${me}, got ${e.length}`);
  const t = e.join(" ").toLowerCase().trim();
  if (!zr(t, Ee))
    throw new Error("Invalid recovery phrase: checksum mismatch");
  const n = Fr(t, Ee);
  if (n.length !== 16)
    throw new Error(`Invalid entropy length: expected 16, got ${n.length}`);
  return rs(n);
}
function Vs(e) {
  if (e.length !== me)
    return !1;
  const t = e.join(" ").toLowerCase().trim();
  return zr(t, Ee);
}
function ct(e) {
  return Ee.includes(e.toLowerCase().trim());
}
function Ui(e, t = 5) {
  const n = e.toLowerCase().trim();
  return n.length === 0 ? [] : Ee.filter((o) => o.startsWith(n)).slice(0, t);
}
function Di(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 4)
    t.push(e.slice(n, n + 4));
  return t;
}
function Ii(e) {
  return e.toLowerCase().replace(/[,\n\r\t]+/g, " ").split(/\s+/).map((t) => t.trim()).filter((t) => t.length > 0);
}
function Vd({
  className: e = "",
  variant: t = "default",
  size: n = "md",
  children: o,
  menuItems: s = [],
  hideSignOut: a = !1
}) {
  const { user: i, isAuthenticated: c, isLoading: l, openLoginModal: f, logout: h } = _t(), [u, m] = x(!1), [p, w] = x(-1), v = Q(null), C = Q(null), E = W(
    () => [...s, ...a ? [] : [{ label: "Sign out", onClick: h }]],
    [s, a, h]
  );
  F(() => {
    if (!u) return;
    const g = (y) => {
      v.current && !v.current.contains(y.target) && (m(!1), w(-1));
    }, b = (y) => {
      y.key === "Escape" && (m(!1), w(-1), C.current?.focus());
    };
    return document.addEventListener("mousedown", g), document.addEventListener("keydown", b), () => {
      document.removeEventListener("mousedown", g), document.removeEventListener("keydown", b);
    };
  }, [u]);
  const k = P(
    (g) => {
      if (!(!u || E.length === 0))
        switch (g.key) {
          case "ArrowDown":
            g.preventDefault(), w((b) => (b + 1) % E.length);
            break;
          case "ArrowUp":
            g.preventDefault(), w((b) => (b - 1 + E.length) % E.length);
            break;
          case "Home":
            g.preventDefault(), w(0);
            break;
          case "End":
            g.preventDefault(), w(E.length - 1);
            break;
          case "Enter":
          case " ":
            p >= 0 && (g.preventDefault(), E[p].onClick(), m(!1), w(-1));
            break;
        }
    },
    [u, p, E]
  ), N = P(() => {
    E.length !== 0 && (m((g) => !g), w(-1));
  }, [E.length]), S = {
    sm: "cedros-button-sm",
    md: "cedros-button-md",
    lg: "cedros-button-lg"
  }, T = {
    default: "cedros-button-primary",
    outline: "cedros-button-outline",
    ghost: "cedros-button-ghost"
  };
  if (l)
    return /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: `cedros-button ${T[t]} ${S[n]} ${e}`,
        disabled: !0,
        children: /* @__PURE__ */ r(G, { size: "sm" })
      }
    );
  if (c && i) {
    const g = i.name || i.email || "User", b = us(i.picture);
    return (
      // L-08: Added keyboard handler and ref for accessibility
      /* @__PURE__ */ d("div", { className: "cedros-user-menu", ref: v, onKeyDown: k, children: [
        /* @__PURE__ */ d(
          "button",
          {
            ref: C,
            type: "button",
            className: `cedros-button cedros-user-button ${S[n]} ${e}`,
            "aria-haspopup": "menu",
            "aria-expanded": u,
            "aria-label": `User menu for ${g}`,
            onClick: N,
            children: [
              b ? /* @__PURE__ */ r(
                "img",
                {
                  src: b,
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
        u && /* @__PURE__ */ d("div", { className: "cedros-dropdown cedros-dropdown-open", role: "menu", children: [
          s.map((y, A) => /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item ${p === A ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: p === A ? 0 : -1,
              onClick: () => {
                y.onClick(), m(!1);
              },
              children: [
                y.icon && /* @__PURE__ */ r("span", { className: "cedros-dropdown-icon", children: y.icon }),
                y.label
              ]
            },
            A
          )),
          s.length > 0 && !a && /* @__PURE__ */ r("div", { className: "cedros-dropdown-divider", role: "separator" }),
          !a && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-dropdown-item cedros-dropdown-item-danger ${p === s.length ? "cedros-dropdown-item-focused" : ""}`,
              role: "menuitem",
              tabIndex: p === s.length ? 0 : -1,
              onClick: () => {
                h(), m(!1);
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
      className: `cedros-button ${T[t]} ${S[n]} ${e}`,
      onClick: f,
      children: o || "Sign in"
    }
  );
}
const Fi = Po(async () => ({ default: (await import("./SolanaLoginButton-V9TtFYVH.js")).SolanaLoginButton }));
function zi(e) {
  return /* @__PURE__ */ r(To, { fallback: /* @__PURE__ */ r(Wi, { ...e }), children: /* @__PURE__ */ r(Fi, { ...e }) });
}
function Wi({
  className: e = "",
  variant: t = "default",
  size: n = "md"
}) {
  const o = {
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
      }[t]} ${o[n]} ${e}`,
      disabled: !0,
      "aria-label": "Continue with Solana",
      children: [
        /* @__PURE__ */ r(G, { size: "sm" }),
        /* @__PURE__ */ r("span", { children: "Continue with Solana" })
      ]
    }
  );
}
function Wr(e) {
  return /* @__PURE__ */ r(
    Fo,
    {
      ...e,
      getHasWallets: qo,
      renderSolanaButton: (t) => /* @__PURE__ */ r(zi, { ...t })
    }
  );
}
class Oi extends Ro {
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
    const { hasError: t, error: n, errorInfo: o } = this.state, { children: s, fallback: a, showDetails: i = !1 } = this.props;
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
      i && n && /* @__PURE__ */ d("details", { className: "cedros-error-boundary-details", children: [
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
function $d({ className: e = "", title: t = "Sign in to your account" }) {
  const { isModalOpen: n, closeModal: o } = J(), s = Q(null), a = Q(null), i = Q(o);
  if (F(() => {
    i.current = o;
  }, [o]), F(() => {
    if (!n) return;
    a.current = document.activeElement, s.current?.focus();
    const l = (h) => {
      if (h.key === "Escape" && i.current(), h.key === "Tab" && s.current) {
        const u = s.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ), m = u[0], p = u[u.length - 1];
        h.shiftKey && document.activeElement === m ? (h.preventDefault(), p?.focus()) : !h.shiftKey && document.activeElement === p && (h.preventDefault(), m?.focus());
      }
    };
    document.addEventListener("keydown", l);
    const f = document.body.style.overflow;
    return document.body.style.overflow = "hidden", () => {
      document.removeEventListener("keydown", l), document.body.style.overflow = f, a.current instanceof HTMLElement && a.current.focus();
    };
  }, [n]), !n) return null;
  const c = (l) => {
    l.target === l.currentTarget && o();
  };
  return /* @__PURE__ */ r(
    "div",
    {
      className: `cedros-modal-backdrop ${e}`,
      onClick: c,
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
            /* @__PURE__ */ r("div", { className: "cedros-modal-content", children: /* @__PURE__ */ r(Oi, { children: /* @__PURE__ */ r(Wr, { onSuccess: o }) }) })
          ]
        }
      )
    }
  );
}
function Sr({ org: e, size: t = "lg", className: n = "" }) {
  const o = us(e.logoUrl), s = t === "lg" ? "cedros-org-avatar-lg" : "", a = ["cedros-org-avatar", s, n].filter(Boolean).join(" "), i = ["cedros-org-avatar-placeholder", s, n].filter(Boolean).join(" ");
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
function Gd({
  orgs: e,
  activeOrg: t,
  isLoading: n = !1,
  onSelect: o,
  onCreateClick: s,
  className: a = "",
  placeholder: i = "Select organization"
}) {
  const [c, l] = x(!1), f = Q(null);
  F(() => {
    const p = (w) => {
      f.current && !f.current.contains(w.target) && l(!1);
    };
    return document.addEventListener("mousedown", p), () => document.removeEventListener("mousedown", p);
  }, []), F(() => {
    const p = (w) => {
      w.key === "Escape" && l(!1);
    };
    if (c)
      return document.addEventListener("keydown", p), () => document.removeEventListener("keydown", p);
  }, [c]);
  const h = P(
    (p) => {
      o(p), l(!1);
    },
    [o]
  ), u = P(() => {
    l(!1), s?.();
  }, [s]), m = P(() => {
    l((p) => !p);
  }, []);
  return n ? /* @__PURE__ */ d(
    "div",
    {
      className: `cedros-org-selector cedros-org-selector-loading ${a}`,
      "aria-busy": "true",
      "aria-live": "polite",
      children: [
        /* @__PURE__ */ r(G, { size: "sm" }),
        /* @__PURE__ */ r("span", { children: "Loading..." })
      ]
    }
  ) : /* @__PURE__ */ d("div", { ref: f, className: `cedros-org-selector ${a}`, children: [
    /* @__PURE__ */ d(
      "button",
      {
        type: "button",
        className: "cedros-org-selector-trigger",
        onClick: m,
        "aria-haspopup": "listbox",
        "aria-expanded": c,
        children: [
          t ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(Sr, { org: t, size: "sm" }),
            /* @__PURE__ */ r("span", { className: "cedros-org-selector-name", children: t.name }),
            /* @__PURE__ */ r(bn, { role: t.membership.role })
          ] }) : /* @__PURE__ */ r("span", { className: "cedros-org-selector-placeholder", children: i }),
          /* @__PURE__ */ r(qi, { isOpen: c })
        ]
      }
    ),
    c && /* @__PURE__ */ d("div", { className: "cedros-org-selector-dropdown", role: "listbox", children: [
      e.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-org-selector-empty", children: "No organizations" }) : /* @__PURE__ */ r("ul", { className: "cedros-org-selector-list", children: e.map((p) => /* @__PURE__ */ r("li", { children: /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: `cedros-org-selector-item ${p.id === t?.id ? "cedros-org-selector-item-active" : ""}`,
          onClick: () => h(p.id),
          role: "option",
          "aria-selected": p.id === t?.id,
          children: [
            /* @__PURE__ */ r(Sr, { org: p, size: "sm" }),
            /* @__PURE__ */ r("span", { className: "cedros-org-selector-item-name", children: p.name }),
            /* @__PURE__ */ r(bn, { role: p.membership.role }),
            p.id === t?.id && /* @__PURE__ */ r(ji, {})
          ]
        }
      ) }, p.id)) }),
      s && /* @__PURE__ */ d(X, { children: [
        /* @__PURE__ */ r("div", { className: "cedros-org-selector-divider" }),
        /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-org-selector-create",
            onClick: u,
            children: [
              /* @__PURE__ */ r(Hi, {}),
              /* @__PURE__ */ r("span", { children: "Create organization" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function bn({ role: e }) {
  return /* @__PURE__ */ r("span", { className: `cedros-org-role cedros-org-role-${e}`, children: e });
}
function qi({ isOpen: e }) {
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
function ji() {
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
function Hi() {
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
function Vi() {
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
function $i() {
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
function Gi() {
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
function Qi({
  orgs: e,
  activeOrg: t,
  isLoading: n,
  onSelect: o,
  onCreateClick: s
}) {
  return n ? /* @__PURE__ */ d("div", { className: "cedros-org-switcher-loading", children: [
    /* @__PURE__ */ r(G, {}),
    /* @__PURE__ */ r("span", { children: "Loading organizations..." })
  ] }) : /* @__PURE__ */ d(X, { children: [
    e.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-org-switcher-empty", children: /* @__PURE__ */ r("p", { children: "You don't belong to any organizations yet." }) }) : /* @__PURE__ */ r("ul", { className: "cedros-org-switcher-list", children: e.map((a) => /* @__PURE__ */ r("li", { children: /* @__PURE__ */ d(
      "button",
      {
        type: "button",
        className: `cedros-org-switcher-item ${a.id === t?.id ? "cedros-org-switcher-item-active" : ""}`,
        onClick: () => o(a.id),
        children: [
          /* @__PURE__ */ r(Sr, { org: a }),
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
          a.id === t?.id && /* @__PURE__ */ r($i, {})
        ]
      }
    ) }, a.id)) }),
    s && /* @__PURE__ */ d("button", { type: "button", className: "cedros-org-switcher-create", onClick: s, children: [
      /* @__PURE__ */ r(Gi, {}),
      /* @__PURE__ */ r("span", { children: "Create new organization" })
    ] })
  ] });
}
function Yi({ isLoading: e, onSubmit: t, onCancel: n }) {
  const [o, s] = x(""), [a, i] = x(""), [c, l] = x(null), f = P((u) => {
    s(u);
    const m = u.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 50);
    i(m);
  }, []), h = P(
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
        await t({ name: o.trim(), slug: a.trim() });
      } catch (m) {
        l(m.message || "Failed to create organization");
      }
    },
    [o, a, t]
  );
  return /* @__PURE__ */ d("form", { className: "cedros-org-create-form", onSubmit: h, children: [
    c && /* @__PURE__ */ r(oe, { error: c }),
    /* @__PURE__ */ d("div", { className: "cedros-form-group", children: [
      /* @__PURE__ */ r("label", { htmlFor: "org-name", className: "cedros-form-label", children: "Organization Name" }),
      /* @__PURE__ */ r(
        "input",
        {
          id: "org-name",
          type: "text",
          className: "cedros-form-input",
          value: o,
          onChange: (u) => f(u.target.value),
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
            onChange: (u) => i(u.target.value.toLowerCase()),
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
          children: e ? /* @__PURE__ */ r(G, { size: "sm" }) : "Create Organization"
        }
      )
    ] })
  ] });
}
function Qd({
  isOpen: e,
  onClose: t,
  orgs: n,
  activeOrg: o,
  isLoading: s = !1,
  error: a,
  onSelect: i,
  onCreate: c,
  className: l = ""
}) {
  return e ? /* @__PURE__ */ r(
    Ki,
    {
      onClose: t,
      orgs: n,
      activeOrg: o,
      isLoading: s,
      error: a,
      onSelect: i,
      onCreate: c,
      className: l
    }
  ) : null;
}
function Ki({
  onClose: e,
  orgs: t,
  activeOrg: n,
  isLoading: o = !1,
  error: s,
  onSelect: a,
  onCreate: i,
  className: c
}) {
  const [l, f] = x("list"), h = Q(null), u = Q(null);
  F(() => (u.current = document.activeElement, h.current?.querySelector(".cedros-modal-close")?.focus(), () => {
    u.current?.focus();
  }), []), F(() => {
    const v = (C) => {
      if (C.key === "Escape") {
        e();
        return;
      }
      if (C.key === "Tab" && h.current) {
        const E = h.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ), k = E[0], N = E[E.length - 1];
        C.shiftKey ? document.activeElement === k && (C.preventDefault(), N?.focus()) : document.activeElement === N && (C.preventDefault(), k?.focus());
      }
    };
    return document.addEventListener("keydown", v), () => document.removeEventListener("keydown", v);
  }, [e]);
  const m = P(
    (v) => {
      v.target === v.currentTarget && e();
    },
    [e]
  ), p = P(
    (v) => {
      a(v), e();
    },
    [a, e]
  ), w = P(
    async (v) => {
      await i?.(v), e();
    },
    [i, e]
  );
  return /* @__PURE__ */ r("div", { className: "cedros-modal-backdrop", onClick: m, children: /* @__PURE__ */ d(
    "div",
    {
      ref: h,
      className: `cedros-modal cedros-org-switcher ${c}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "org-switcher-title",
      children: [
        /* @__PURE__ */ d("div", { className: "cedros-modal-header", children: [
          /* @__PURE__ */ r("h2", { id: "org-switcher-title", className: "cedros-modal-title", children: l === "list" ? "Switch Organization" : "Create Organization" }),
          /* @__PURE__ */ r("button", { type: "button", className: "cedros-modal-close", onClick: e, "aria-label": "Close", children: /* @__PURE__ */ r(Vi, {}) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-modal-body", children: [
          s && /* @__PURE__ */ r(oe, { error: s }),
          l === "list" ? /* @__PURE__ */ r(
            Qi,
            {
              orgs: t,
              activeOrg: n,
              isLoading: o,
              onSelect: p,
              onCreateClick: i ? () => f("create") : void 0
            }
          ) : /* @__PURE__ */ r(
            Yi,
            {
              isLoading: o,
              onSubmit: w,
              onCancel: () => f("list")
            }
          )
        ] })
      ]
    }
  ) });
}
function Zi({
  sessions: e,
  isLoading: t = !1,
  error: n,
  onRevokeAll: o,
  className: s = ""
}) {
  const [a, i] = x(!1), [c, l] = x(!1), f = Q(null), h = W(() => e.filter((m) => !m.isCurrent).length, [e]), u = P(async () => {
    if (!o) return;
    const m = e.filter((w) => !w.isCurrent).length;
    if (!(m === 0 || !window.confirm(
      `Are you sure you want to sign out of ${m} other device(s)? This will log you out everywhere except this browser.`
    ))) {
      i(!0), l(!1);
      try {
        await o(), l(!0), f.current !== null && window.clearTimeout(f.current), f.current = window.setTimeout(() => {
          l(!1), f.current = null;
        }, 3e3);
      } finally {
        i(!1);
      }
    }
  }, [o, e]);
  return F(() => () => {
    f.current !== null && (window.clearTimeout(f.current), f.current = null);
  }, []), t && e.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-session-list cedros-session-list-loading ${s}`, children: [
    /* @__PURE__ */ r(G, {}),
    /* @__PURE__ */ r("span", { children: "Loading sessions..." })
  ] }) : n ? /* @__PURE__ */ r("div", { className: `cedros-session-list ${s}`, children: /* @__PURE__ */ r(oe, { error: n }) }) : e.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-session-list cedros-session-list-empty ${s}`, children: /* @__PURE__ */ r("p", { children: "No active sessions found." }) }) : /* @__PURE__ */ d("div", { className: `cedros-session-list ${s}`, children: [
    c && /* @__PURE__ */ d("div", { className: "cedros-session-success", role: "status", children: [
      /* @__PURE__ */ r(nc, {}),
      /* @__PURE__ */ r("span", { children: "All other sessions have been revoked." })
    ] }),
    /* @__PURE__ */ r("ul", { className: "cedros-session-items", children: e.map((m) => /* @__PURE__ */ r(Xi, { session: m }, m.id)) }),
    o && h > 0 && /* @__PURE__ */ r("div", { className: "cedros-session-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: u,
        disabled: a,
        children: a ? /* @__PURE__ */ d(X, { children: [
          /* @__PURE__ */ r(G, { size: "sm" }),
          /* @__PURE__ */ r("span", { children: "Signing out..." })
        ] }) : `Sign out of ${h} other device${h > 1 ? "s" : ""}`
      }
    ) })
  ] });
}
function Xi({ session: e }) {
  const t = Ji(e.userAgent), n = tc(e.expiresAt);
  return /* @__PURE__ */ d("li", { className: `cedros-session-item ${e.isCurrent ? "cedros-session-item-current" : ""}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-session-item-icon", children: /* @__PURE__ */ r(rc, { userAgent: e.userAgent }) }),
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
          ec(e.createdAt)
        ] }),
        n && /* @__PURE__ */ r("span", { className: "cedros-session-expiring", children: "Expires soon" })
      ] })
    ] })
  ] });
}
function Ji(e) {
  if (!e)
    return { browser: "Unknown browser", os: "Unknown device" };
  let t = "Unknown browser";
  e.includes("Chrome") && !e.includes("Edg") ? t = "Chrome" : e.includes("Safari") && !e.includes("Chrome") ? t = "Safari" : e.includes("Firefox") ? t = "Firefox" : e.includes("Edg") && (t = "Edge");
  let n = "Unknown device";
  return e.includes("Windows") ? n = "Windows" : e.includes("Mac") ? n = "macOS" : e.includes("Linux") ? n = "Linux" : e.includes("iPhone") || e.includes("iPad") ? n = "iOS" : e.includes("Android") && (n = "Android"), { browser: t, os: n };
}
function ec(e) {
  const t = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - t.getTime(), s = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), i = Math.floor(o / (1e3 * 60 * 60 * 24));
  return s < 1 ? "just now" : s < 60 ? `${s} minute${s > 1 ? "s" : ""} ago` : a < 24 ? `${a} hour${a > 1 ? "s" : ""} ago` : i < 7 ? `${i} day${i > 1 ? "s" : ""} ago` : t.toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function tc(e) {
  const t = new Date(e), n = /* @__PURE__ */ new Date(), o = 3600 * 1e3;
  return t.getTime() - n.getTime() < o;
}
function rc({ userAgent: e }) {
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
function nc() {
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
function sc({
  words: e,
  onConfirm: t,
  className: n = ""
}) {
  const [o, s] = x(!1), [a, i] = x(!1), c = Q(null), l = Di(e), f = P(async () => {
    try {
      await navigator.clipboard.writeText(e.join(" ")), s(!0), c.current !== null && window.clearTimeout(c.current), c.current = window.setTimeout(() => s(!1), 2e3);
    } catch {
    }
  }, [e]);
  F(() => () => {
    c.current !== null && (window.clearTimeout(c.current), c.current = null);
  }, []);
  const h = P(() => {
    a && t();
  }, [a, t]);
  return /* @__PURE__ */ d("div", { className: `cedros-recovery-phrase-display ${n}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-recovery-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-recovery-title", children: "Recovery Phrase" }),
      /* @__PURE__ */ r("p", { className: "cedros-recovery-warning", children: "Write down these 12 words in order and store them securely. This is the only way to recover your wallet if you lose access." })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-recovery-grid", children: l.map((u, m) => /* @__PURE__ */ r("div", { className: "cedros-word-group", children: u.map((p, w) => {
      const v = m * 4 + w + 1;
      return /* @__PURE__ */ d("div", { className: "cedros-word-item", children: [
        /* @__PURE__ */ d("span", { className: "cedros-word-number", children: [
          v,
          "."
        ] }),
        /* @__PURE__ */ r("span", { className: "cedros-word-text", children: p })
      ] }, v);
    }) }, m)) }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-secondary cedros-copy-btn",
        onClick: f,
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
            onChange: (u) => i(u.target.checked),
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
          onClick: h,
          disabled: !a,
          children: "Continue"
        }
      )
    ] })
  ] });
}
function oc({
  onSubmit: e,
  onCancel: t,
  isSubmitting: n = !1,
  error: o,
  className: s = ""
}) {
  const [a, i] = x(Array(me).fill("")), [c, l] = x(null), [f, h] = x([]), [u, m] = x(null), p = Mo(), w = Q(null), v = P(
    (g, b) => {
      const y = [...a];
      if (y[g] = b.toLowerCase().trim(), i(y), b.length > 0) {
        const A = Ui(b, 5);
        h(A);
      } else
        h([]);
      m(null);
    },
    [a]
  ), C = P((g) => {
    l(g), h([]);
  }, []), E = P(
    (g) => {
      const b = a[g];
      b && !ct(b) && m(`Word ${g + 1} is not in the wordlist`), w.current !== null && window.clearTimeout(w.current), w.current = window.setTimeout(() => {
        c === g && h([]);
      }, 200);
    },
    [a, c]
  );
  F(() => () => {
    w.current !== null && (window.clearTimeout(w.current), w.current = null);
  }, []);
  const k = P(
    (g) => {
      if (c !== null) {
        const b = [...a];
        b[c] = g, i(b), h([]), document.querySelector(
          `[data-word-index="${c + 1}"]`
        )?.focus();
      }
    },
    [c, a]
  ), N = P((g) => {
    const b = g.clipboardData.getData("text"), y = Ii(b);
    y.length === me && (g.preventDefault(), i(y), m(null));
  }, []), S = P(
    (g) => {
      if (g.preventDefault(), a.filter((A) => !A).length > 0) {
        m(`Please enter all ${me} words`);
        return;
      }
      const y = a.map((A, B) => ({ word: A, index: B + 1 })).filter(({ word: A }) => !ct(A));
      if (y.length > 0) {
        m(`Invalid words: ${y.map((A) => `#${A.index}`).join(", ")}`);
        return;
      }
      if (!Vs(a)) {
        m("Invalid recovery phrase - please check your words");
        return;
      }
      e(a);
    },
    [a, e]
  ), T = o || u;
  return /* @__PURE__ */ d(
    "form",
    {
      className: `cedros-recovery-phrase-input ${s}`,
      onSubmit: S,
      onPaste: N,
      children: [
        /* @__PURE__ */ d("div", { className: "cedros-recovery-input-header", children: [
          /* @__PURE__ */ r("h3", { className: "cedros-recovery-input-title", children: "Enter Recovery Phrase" }),
          /* @__PURE__ */ r("p", { className: "cedros-recovery-input-description", children: "Enter your 12-word recovery phrase. You can paste the entire phrase at once." })
        ] }),
        /* @__PURE__ */ r("div", { className: "cedros-word-inputs", children: Array.from({ length: me }, (g, b) => /* @__PURE__ */ d("div", { className: "cedros-word-input-wrapper", children: [
          /* @__PURE__ */ d("label", { className: "cedros-word-label", children: [
            b + 1,
            "."
          ] }),
          /* @__PURE__ */ r(
            "input",
            {
              type: "text",
              className: `cedros-word-input ${a[b] && !ct(a[b]) ? "cedros-word-invalid" : a[b] && ct(a[b]) ? "cedros-word-valid" : ""}`,
              value: a[b],
              onChange: (y) => v(b, y.target.value),
              onFocus: () => C(b),
              onBlur: () => E(b),
              "data-word-index": b,
              autoComplete: "off",
              autoCapitalize: "none",
              spellCheck: !1,
              disabled: n,
              "aria-label": `Word ${b + 1}`
            }
          )
        ] }, b)) }),
        c !== null && f.length > 0 && /* @__PURE__ */ r("div", { className: "cedros-suggestions", role: "listbox", id: `${p}-suggestions`, children: f.map((g) => /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-suggestion",
            onClick: () => k(g),
            role: "option",
            children: g
          },
          g
        )) }),
        T && /* @__PURE__ */ r("p", { className: "cedros-input-error", role: "alert", children: T }),
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
function Yd({ capabilities: e, className: t = "" }) {
  if (e.allSupported)
    return null;
  const n = xo(e), o = So();
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
const ac = ["share_c_only", "full_seed", "none"];
function ic(e) {
  return e && ac.includes(e) ? e : "share_c_only";
}
const cc = {
  walletEnabled: !1,
  recoveryMode: "share_c_only",
  unlockTtlSeconds: 900,
  isLoading: !1,
  error: null,
  refetch: async () => {
  }
};
function $s() {
  const e = Oe(), [t, n] = x(null), [o, s] = x(!!e), [a, i] = x(null), c = W(() => e ? new ne({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts
  }) : null, [e]), l = P(async () => {
    if (c) {
      s(!0), i(null);
      try {
        const f = await c.get("/discovery");
        f.wallet ? n({
          enabled: f.wallet.enabled,
          recoveryMode: ic(f.wallet.recoveryMode),
          unlockTtlSeconds: f.wallet.unlockTtlSeconds
        }) : n({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } catch (f) {
        const h = f instanceof Error ? f.message : "Failed to fetch wallet config";
        i(h), n({
          enabled: !1,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900
        });
      } finally {
        s(!1);
      }
    }
  }, [c]);
  return F(() => {
    c && l();
  }, [c, l]), e ? {
    walletEnabled: t?.enabled ?? !1,
    recoveryMode: t?.recoveryMode ?? "share_c_only",
    unlockTtlSeconds: t?.unlockTtlSeconds ?? 900,
    isLoading: o,
    error: a,
    refetch: l
  } : cc;
}
function lc() {
  const { user: e } = J(), { enroll: t } = Ye(), { recoveryMode: n } = $s(), [o, s] = x({ step: "idle" }), [a, i] = x(!1), c = Q([]), l = P(() => {
    ns(...c.current), c.current = [];
  }, []);
  F(() => () => {
    l();
  }, [l]);
  const f = P(
    async (w, v, C, E) => {
      s({ step: "generating_seed" });
      const k = _o();
      c.current.push(k), s({ step: "splitting_shares" });
      const { shareA: N, shareB: S, shareC: T } = Is(k);
      c.current.push(N, S, T), s({ step: "encrypting_shares" });
      const g = await ss(N, os(v)), b = Us(k), y = Ds(b);
      s({ step: "uploading" });
      const A = {
        solanaPubkey: y,
        shareAAuthMethod: w,
        shareACiphertext: g.ciphertext,
        shareANonce: g.nonce,
        // Share B is now plaintext (SSS math protects it)
        shareB: ke(S)
      };
      if (w === "password") {
        if (!C) throw new Error("KDF salt required for password method");
        A.shareAKdfSalt = ke(C), A.shareAKdfParams = tt;
      }
      if (w === "passkey" && E && (A.prfSalt = E), await t(A), n === "none")
        l(), s({
          step: "complete",
          solanaPubkey: y
        });
      else {
        const B = n === "full_seed" ? Ri(k) : Ti(We(T));
        s({
          step: "showing_recovery",
          recoveryPhrase: B,
          solanaPubkey: y
        });
      }
    },
    [t, n, l]
  ), h = P(
    async (w) => {
      if (!e) {
        s({ step: "error", error: "User not authenticated" });
        return;
      }
      i(!0), l();
      try {
        const v = as(), C = await fs(w, v, tt);
        c.current.push(C), await f("password", C, v);
      } catch (v) {
        s({
          step: "error",
          error: v instanceof Error ? v.message : "Enrollment failed"
        });
      } finally {
        i(!1);
      }
    },
    [e, l, f]
  ), u = P(async () => {
    if (!e) {
      s({ step: "error", error: "User not authenticated" });
      return;
    }
    i(!0), l();
    try {
      const w = is(), v = ke(w);
      s({ step: "encrypting_shares" });
      const E = (await Lr(v)).prfOutput;
      c.current.push(E);
      const k = await cs(E, w);
      c.current.push(k), await f("passkey", k, void 0, v);
    } catch (w) {
      s({
        step: "error",
        error: w instanceof Error ? w.message : "Enrollment failed"
      });
    } finally {
      i(!1);
    }
  }, [e, l, f]), m = P(() => {
    const w = o.solanaPubkey;
    l(), s({
      step: "complete",
      solanaPubkey: w
    });
  }, [o.solanaPubkey, l]), p = P(() => {
    l(), s({ step: "idle" }), i(!1);
  }, [l]);
  return {
    state: o,
    startEnrollmentWithPassword: h,
    startEnrollmentWithPasskey: u,
    confirmRecoveryPhrase: m,
    cancel: p,
    isEnrolling: a
  };
}
function dc() {
  const { config: e, _internal: t } = J(), [n, o] = x(!1), [s, a] = x(null), i = W(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t?.getAccessToken]
  );
  return {
    setPassword: P(
      async (l) => {
        o(!0), a(null);
        try {
          await i.post("/set-password", { password: l });
        } catch (f) {
          const h = V(f, "Failed to set password");
          throw a(h), h;
        } finally {
          o(!1);
        }
      },
      [i]
    ),
    isLoading: n,
    error: s
  };
}
function uc(e) {
  return e.includes("email") ? "password" : e.includes("webauthn") ? "passkey" : "set-password";
}
function hc({
  onComplete: e,
  onCancel: t,
  className: n = ""
}) {
  const { user: o } = J(), {
    state: s,
    startEnrollmentWithPassword: a,
    startEnrollmentWithPasskey: i,
    confirmRecoveryPhrase: c,
    cancel: l,
    isEnrolling: f
  } = lc(), { setPassword: h, isLoading: u } = dc(), m = o ? uc(o.authMethods) : "password", [p, w] = x(""), [v, C] = x(""), [E, k] = x(null);
  F(() => {
    w(""), C(""), k(null);
  }, [o?.id]);
  const N = P(
    async (A) => {
      A.preventDefault(), k(null), await a(p);
    },
    [p, a]
  ), S = P(
    async (A) => {
      if (A.preventDefault(), p !== v) {
        k("Passwords do not match");
        return;
      }
      const B = Tr(p);
      if (!B.isValid) {
        const _ = Object.values(B.errors)[0];
        k(_ ?? "Password does not meet requirements");
        return;
      }
      k(null);
      try {
        await h(p), await a(p);
      } catch {
      }
    },
    [p, v, h, a]
  ), T = P(async () => {
    await i();
  }, [i]), g = P(() => {
    c(), s.solanaPubkey && e?.(s.solanaPubkey);
  }, [c, s.solanaPubkey, e]), b = P(() => {
    l(), t?.();
  }, [l, t]), y = f || u;
  return s.step === "generating_seed" || s.step === "splitting_shares" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, "aria-busy": "true", children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ r("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ r("p", { children: "Generating secure wallet..." })
  ] }) }) : s.step === "encrypting_shares" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, "aria-busy": "true", children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ r("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ r("p", { children: "Encrypting wallet shares..." })
  ] }) }) : s.step === "uploading" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, "aria-busy": "true", children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-progress", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ r("div", { className: "cedros-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ r("p", { children: "Saving wallet..." })
  ] }) }) : s.step === "showing_recovery" && s.recoveryPhrase ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, children: /* @__PURE__ */ r(sc, { words: s.recoveryPhrase, onConfirm: g }) }) : s.step === "complete" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-enrollment ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-enrollment-complete", children: [
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
          onClick: b,
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
          value: p,
          onChange: (A) => w(A.target.value),
          disabled: y,
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
            onClick: b,
            disabled: y,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: y || !p,
            children: y ? "Creating..." : "Continue"
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
            onClick: b,
            disabled: y,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
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
    m === "set-password" && /* @__PURE__ */ d("form", { onSubmit: S, className: "cedros-enrollment-form", children: [
      /* @__PURE__ */ r(
        pe,
        {
          label: "New Password",
          value: p,
          onChange: (A) => w(A.target.value),
          showStrengthMeter: !0,
          disabled: y,
          required: !0,
          minLength: 8,
          placeholder: "Choose a strong password"
        }
      ),
      /* @__PURE__ */ r(
        pe,
        {
          label: "Confirm Password",
          value: v,
          onChange: (A) => C(A.target.value),
          error: E ?? void 0,
          disabled: y,
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
            onClick: b,
            disabled: y,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "submit",
            className: "cedros-button cedros-button-primary",
            disabled: y || !p || !v,
            children: y ? "Creating..." : "Continue"
          }
        )
      ] })
    ] })
  ] });
}
function fc() {
  const { user: e } = J(), { signTransaction: t } = Ye(), [n, o] = x(!1), [s, a] = x(null), i = P(
    async (l, f) => {
      if (!e) {
        const h = "User not authenticated";
        throw a(h), new Error(h);
      }
      o(!0), a(null);
      try {
        const h = {
          transaction: ke(l),
          ...f ? { credential: Bo(f) } : {}
        }, u = await t(h);
        return ls(u.signature);
      } catch (h) {
        const u = h instanceof Error ? h.message : "Signing failed";
        throw a(u), h;
      } finally {
        o(!1);
      }
    },
    [e, t]
  ), c = P(() => a(null), []);
  return {
    signTransaction: i,
    isSigning: n,
    error: s,
    clearError: c
  };
}
function mc() {
  const { getMaterial: e } = Ye(), [t, n] = x(!1), [o, s] = x(null), a = P(async () => {
    n(!0), s(null);
    try {
      const c = await e();
      if (!c)
        throw new Error("No wallet enrolled");
      if (c.shareAAuthMethod !== "passkey")
        throw new Error("Wallet is not configured for passkey authentication");
      if (!c.prfSalt)
        throw new Error("No PRF salt configured for wallet");
      const l = await Lr(c.prfSalt);
      try {
        return {
          type: "prfOutput",
          prfOutput: ke(l.prfOutput)
        };
      } finally {
        l.prfOutput.fill(0);
      }
    } catch (c) {
      const l = c instanceof Error ? c.message : "Passkey authentication failed";
      return s(l), null;
    } finally {
      n(!1);
    }
  }, [e]), i = P(() => s(null), []);
  return {
    getPasskeyCredential: a,
    isAuthenticating: t,
    error: o,
    clearError: i
  };
}
function pc({
  mode: e,
  isLoading: t = !1,
  error: n,
  onPrompt: o,
  onRetry: s,
  onCancel: a,
  title: i,
  description: c,
  className: l = ""
}) {
  const f = P(() => {
    t || o?.();
  }, [t, o]), h = P(() => {
    s?.();
  }, [s]), u = e === "register" ? "Set Up Passkey" : "Verify with Passkey", m = e === "register" ? "Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN." : "Use your passkey to unlock your wallet. You will be prompted for biometric verification.";
  return /* @__PURE__ */ d("div", { className: `cedros-passkey-prompt ${l}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-passkey-icon", children: t ? /* @__PURE__ */ r(wc, {}) : n ? /* @__PURE__ */ r(yc, {}) : /* @__PURE__ */ r(gc, {}) }),
    /* @__PURE__ */ r("h3", { className: "cedros-passkey-title", children: i ?? u }),
    /* @__PURE__ */ r("p", { className: "cedros-passkey-description", children: c ?? m }),
    n && /* @__PURE__ */ r("div", { className: "cedros-passkey-error", role: "alert", children: /* @__PURE__ */ r("p", { children: n }) }),
    /* @__PURE__ */ r("div", { className: "cedros-passkey-actions", children: n ? /* @__PURE__ */ d(X, { children: [
      s && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary",
          onClick: h,
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
          onClick: f,
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
function gc() {
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
function wc() {
  return /* @__PURE__ */ d("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className: "cedros-spinner", children: [
    /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", opacity: "0.25" }),
    /* @__PURE__ */ r("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function yc() {
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
function bc({
  onUnlock: e,
  onCancel: t,
  showCancel: n = !0,
  authMethod: o,
  className: s = ""
}) {
  J();
  const { unlock: a, getMaterial: i, isLoading: c } = Ye(), { getPasskeyCredential: l, isAuthenticating: f } = mc(), [h, u] = x("idle"), [m, p] = x(o ?? null), [w, v] = x(""), [C, E] = x(null);
  F(() => {
    o !== void 0 && p(o);
  }, [o]);
  const k = m === "password", N = m === "passkey", S = P(async () => {
    if (u("credential"), E(null), !m)
      try {
        const _ = await i();
        _ ? p(_.shareAAuthMethod) : (E("No wallet enrolled"), u("error"));
      } catch (_) {
        E(_ instanceof Error ? _.message : "Failed to get wallet info"), u("error");
      }
  }, [m, i]), T = P(
    async (_) => {
      _.preventDefault(), E(null), u("unlocking");
      try {
        let R;
        if (k)
          R = { type: "password", password: w };
        else
          throw new Error("Invalid auth method");
        await a(R), u("unlocked"), e?.();
      } catch (R) {
        E(R instanceof Error ? R.message : "Failed to unlock wallet"), u("error");
      }
    },
    [k, w, a, e]
  ), g = P(async () => {
    E(null), u("unlocking");
    try {
      const _ = await l();
      if (!_) {
        u("credential");
        return;
      }
      await a(_), u("unlocked"), e?.();
    } catch (_) {
      E(_ instanceof Error ? _.message : "Failed to unlock wallet"), u("error");
    }
  }, [l, a, e]), b = P(() => {
    v(""), u("idle"), E(null), t?.();
  }, [t]), y = P(() => {
    v(""), u("credential"), E(null);
  }, []), A = c || f, B = () => {
    switch (h) {
      case "idle":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-idle", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(Ac, {}) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Locked" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Unlock your wallet to sign transactions." }),
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-primary",
              onClick: S,
              children: "Unlock Wallet"
            }
          )
        ] });
      case "credential":
        return k ? /* @__PURE__ */ d("form", { className: "cedros-wallet-unlock-form", onSubmit: T, children: [
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Enter Password" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Enter your wallet password to unlock." }),
          /* @__PURE__ */ r(
            pe,
            {
              label: "Password",
              value: w,
              onChange: (_) => v(_.target.value),
              disabled: A,
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
                disabled: A || w.length === 0,
                children: A ? "Unlocking..." : "Unlock"
              }
            ),
            n && /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-secondary",
                onClick: b,
                disabled: A,
                children: "Cancel"
              }
            )
          ] })
        ] }) : N ? /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-passkey", children: [
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Verify with Passkey" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Use your passkey to unlock your wallet." }),
          /* @__PURE__ */ r(
            pc,
            {
              mode: "authenticate",
              isLoading: A,
              error: C ?? void 0,
              onPrompt: g,
              onRetry: g,
              onCancel: n ? b : void 0
            }
          )
        ] }) : /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-loading", children: [
          /* @__PURE__ */ r(G, { size: "xl" }),
          /* @__PURE__ */ r("p", { children: "Loading wallet info..." })
        ] });
      case "unlocking":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-progress", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(G, { size: "xl" }) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Unlocking Wallet" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Verifying your credentials..." })
        ] });
      case "unlocked":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-success", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(vc, {}) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Wallet Unlocked" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: "Your wallet is ready to sign transactions." })
        ] });
      case "error":
        return /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-error", children: [
          /* @__PURE__ */ r("div", { className: "cedros-wallet-unlock-icon", children: /* @__PURE__ */ r(Nc, {}) }),
          /* @__PURE__ */ r("h3", { className: "cedros-wallet-unlock-title", children: "Unlock Failed" }),
          /* @__PURE__ */ r("p", { className: "cedros-wallet-unlock-description", children: C ?? "Failed to unlock wallet. Please try again." }),
          /* @__PURE__ */ d("div", { className: "cedros-wallet-unlock-actions", children: [
            /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-primary",
                onClick: y,
                children: "Try Again"
              }
            ),
            n && /* @__PURE__ */ r(
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
  return /* @__PURE__ */ r("div", { className: `cedros-wallet-unlock ${s}`, children: B() });
}
function Ac() {
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
function vc() {
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
function Nc() {
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
function kc() {
  const { recover: e, getShareBForRecovery: t } = Ye(), { recoveryMode: n } = $s(), [o, s] = x({ step: "idle" }), [a, i] = x(!1), c = Q([]), l = P(() => {
    ns(...c.current), c.current = [];
  }, []);
  F(() => () => {
    l();
  }, [l]);
  const f = P(
    async (u, m, p) => {
      i(!0), l();
      try {
        if (s({ step: "validating" }), !Vs(u))
          throw new Error("Invalid recovery phrase. Please check your words.");
        let w;
        if (n === "share_c_only") {
          const y = Pi(u);
          c.current.push(y);
          const A = ke(y), B = await t({ shareC: A }), _ = ls(B.shareB);
          c.current.push(_), w = yi(We(_), We(y)), c.current.push(w);
        } else
          w = Mi(u), c.current.push(w);
        const v = Us(w), C = Ds(v), { shareA: E, shareB: k } = Is(w);
        c.current.push(E, k), s({ step: "encrypting" });
        let N, S, T;
        if (m === "passkey") {
          const y = is();
          T = ke(y);
          const A = await Lr(T);
          c.current.push(A.prfOutput), N = await cs(A.prfOutput, y), c.current.push(N);
        } else
          S = as(), N = await fs(p, S, tt), c.current.push(N);
        const g = await ss(E, os(N));
        s({ step: "uploading" });
        const b = {
          solanaPubkey: C,
          shareAAuthMethod: m,
          shareACiphertext: g.ciphertext,
          shareANonce: g.nonce,
          shareB: ke(k)
        };
        m === "password" && (b.shareAKdfSalt = ke(S), b.shareAKdfParams = tt), m === "passkey" && (b.prfSalt = T), await e(b), l(), s({ step: "complete" });
      } catch (w) {
        l(), s({
          step: "error",
          error: w instanceof Error ? w.message : "Recovery failed"
        });
      } finally {
        i(!1);
      }
    },
    [e, t, n, l]
  ), h = P(() => {
    l(), s({ step: "idle" }), i(!1);
  }, [l]);
  return {
    state: o,
    startRecovery: f,
    cancel: h,
    isRecovering: a
  };
}
function Ec({
  onComplete: e,
  onCancel: t,
  className: n = "",
  defaultAuthMethod: o = "password"
}) {
  const { state: s, startRecovery: a, cancel: i, isRecovering: c } = kc(), [l, f] = x([]), [h, u] = x(!1), [m, p] = x(o), [w, v] = x(""), [C, E] = x(""), [k, N] = x(null), S = P((A) => {
    f(A), u(!0);
  }, []), T = P(
    async (A) => {
      if (A.preventDefault(), N(null), m !== "passkey") {
        if (w !== C) {
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
    [l, m, w, C, a]
  ), g = P(() => {
    i(), f([]), u(!1), v(""), E(""), t?.();
  }, [i, t]), b = P(() => {
    u(!1), v(""), E("");
  }, []), y = P(() => {
    e?.();
  }, [e]);
  return s.step === "validating" || s.step === "encrypting" || s.step === "uploading" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-progress", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(Cc, {}) }),
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
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(xc, {}) }),
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
        onClick: y,
        children: "Done"
      }
    ) })
  ] }) }) : s.step === "error" ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-error", children: [
    /* @__PURE__ */ r("div", { className: "cedros-wallet-recovery-icon", children: /* @__PURE__ */ r(Sc, {}) }),
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
  ] }) }) : h ? /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("form", { className: "cedros-wallet-recovery-credential", onSubmit: T, children: [
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
            onChange: () => p("password"),
            disabled: c
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
            onChange: () => p("passkey"),
            disabled: c
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
            onChange: (A) => v(A.target.value),
            disabled: c,
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
            onChange: (A) => E(A.target.value),
            disabled: c,
            "aria-invalid": k ? "true" : void 0,
            placeholder: "Confirm your password"
          }
        ),
        k && /* @__PURE__ */ r("p", { className: "cedros-input-error", role: "alert", children: k })
      ] })
    ] }),
    m === "passkey" && /* @__PURE__ */ d("div", { className: "cedros-passkey-info", children: [
      /* @__PURE__ */ r(_c, {}),
      /* @__PURE__ */ r("p", { children: "Use your passkey (Touch ID, Face ID, or Windows Hello) to secure your wallet." })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: b,
          disabled: c,
          children: "Back"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "submit",
          className: "cedros-button cedros-button-primary",
          disabled: c || m !== "passkey" && (w.length === 0 || C.length === 0),
          children: c ? "Recovering..." : "Recover Wallet"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-wallet-recovery ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-phrase", children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-recovery-header", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-wallet-recovery-title", children: "Recover Your Wallet" }),
      /* @__PURE__ */ r("p", { className: "cedros-wallet-recovery-description", children: "Enter your 12-word recovery phrase to restore your wallet." })
    ] }),
    /* @__PURE__ */ r(
      oc,
      {
        onSubmit: S,
        onCancel: g,
        isSubmitting: !1
      }
    )
  ] }) });
}
function Cc() {
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
function xc() {
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
function Sc() {
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
function _c() {
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
function Bc({
  address: e,
  label: t = "Wallet Address",
  showCopy: n = !0,
  showExplorerLink: o = !0,
  allowReveal: s = !0,
  className: a = ""
}) {
  const i = Oe(), [c, l] = x(!1), [f, h] = x(null), [u, m] = x(!1), p = Q(null), w = i?.config.solana?.network ?? "mainnet-beta", v = W(() => {
    const N = `https://explorer.solana.com/address/${e}`;
    return w === "mainnet-beta" ? N : `${N}?cluster=${encodeURIComponent(w)}`;
  }, [e, w]), C = s && e.length > 18, E = W(() => !C || u ? e : `${e.slice(0, 8)}...${e.slice(-8)}`, [e, C, u]), k = P(async () => {
    try {
      h(null), await navigator.clipboard.writeText(e), l(!0), p.current !== null && window.clearTimeout(p.current), p.current = window.setTimeout(() => {
        l(!1), p.current = null;
      }, 2e3);
    } catch (N) {
      l(!1), h(N instanceof Error ? N.message : "Copy failed");
    }
  }, [e]);
  return F(() => () => {
    p.current !== null && (window.clearTimeout(p.current), p.current = null);
  }, []), /* @__PURE__ */ d("div", { className: `cedros-wallet-address-row ${a}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-address-row-header", children: [
      /* @__PURE__ */ r("span", { className: "cedros-wallet-status-pubkey-label", children: t }),
      /* @__PURE__ */ d("div", { className: "cedros-wallet-address-row-actions", children: [
        C && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-sm cedros-button-ghost",
            onClick: () => m((N) => !N),
            "aria-label": u ? "Hide full wallet address" : "Show full wallet address",
            children: u ? /* @__PURE__ */ d("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
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
            href: v,
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
            onClick: k,
            "aria-label": "Copy wallet address",
            children: c ? "Copied" : "Copy"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ r("code", { className: "cedros-wallet-status-pubkey-value", title: e, children: E }),
    f && /* @__PURE__ */ r("p", { className: "cedros-input-hint", role: "status", children: f })
  ] });
}
function Lc({
  status: e,
  publicKey: t,
  onLock: n,
  onEnroll: o,
  onUnlock: s,
  onRecover: a,
  showActions: i = !0,
  compact: c = !1,
  className: l = ""
}) {
  const f = e !== void 0, h = St(), u = f ? e : h.status, m = f ? t ?? null : h.solanaPubkey, p = f ? null : h.error, w = f ? () => {
  } : h.refresh, v = f ? () => {
  } : h.clearError, C = Tc(u, p);
  return c ? /* @__PURE__ */ d("div", { className: `cedros-wallet-status cedros-wallet-status-compact ${l}`, children: [
    /* @__PURE__ */ r(
      "span",
      {
        className: `cedros-wallet-status-dot cedros-wallet-status-${C.color}`,
        title: C.label
      }
    ),
    /* @__PURE__ */ r("span", { className: "cedros-wallet-status-label", children: C.label }),
    m && /* @__PURE__ */ r("span", { className: "cedros-wallet-status-pubkey", title: m, children: Pc(m) })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-wallet-status ${l}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-wallet-status-header", children: [
      /* @__PURE__ */ r(
        "div",
        {
          className: `cedros-wallet-status-icon cedros-wallet-status-icon-${C.color}`,
          children: /* @__PURE__ */ r(Rc, { status: u })
        }
      ),
      /* @__PURE__ */ d("div", { className: "cedros-wallet-status-info", children: [
        /* @__PURE__ */ r("h4", { className: "cedros-wallet-status-title", children: C.title }),
        /* @__PURE__ */ r("p", { className: "cedros-wallet-status-description", children: C.description })
      ] })
    ] }),
    m && /* @__PURE__ */ r("div", { className: "cedros-wallet-status-pubkey-full", children: /* @__PURE__ */ r(Bc, { address: m }) }),
    p && /* @__PURE__ */ d("div", { className: "cedros-wallet-status-error-box", role: "alert", children: [
      /* @__PURE__ */ r("p", { children: p }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-sm cedros-button-secondary",
          onClick: v,
          children: "Dismiss"
        }
      )
    ] }),
    i && /* @__PURE__ */ d("div", { className: "cedros-wallet-status-actions", children: [
      u === "not_enrolled" && o && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: o,
          children: "Create Wallet"
        }
      ),
      u === "enrolled_locked" && s && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: s,
          children: "Unlock Wallet"
        }
      ),
      (u === "not_enrolled" || u === "error") && a && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: a,
          children: "Recover Wallet"
        }
      ),
      u === "error" && /* @__PURE__ */ r(
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
function Tc(e, t) {
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
function Pc(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function Rc({ status: e }) {
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
function Kd({ className: e = "", showActions: t = !0 }) {
  const n = St(), [o, s] = x("status"), a = W(() => {
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
  }, [o]), i = P(() => s("status"), []), c = P(async () => {
    s("status"), await n.refresh();
  }, [n]), l = P(async () => {
    s("status"), await n.refresh();
  }, [n]), f = P(async () => {
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
          onClick: i,
          children: "Back"
        }
      )
    ] }),
    o === "status" && /* @__PURE__ */ r(
      Lc,
      {
        onEnroll: () => s("enroll"),
        onUnlock: () => s("unlock"),
        onRecover: () => s("recover_intro"),
        showActions: t
      }
    ),
    o === "enroll" && /* @__PURE__ */ r(
      hc,
      {
        onComplete: () => {
          c();
        },
        onCancel: i
      }
    ),
    o === "unlock" && /* @__PURE__ */ r(
      bc,
      {
        onUnlock: () => {
          l();
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
            onClick: () => s("recover"),
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
      Ec,
      {
        onComplete: () => {
          f();
        },
        onCancel: i
      }
    )
  ] });
}
function Zd({
  showDescriptions: e = !0,
  className: t = "",
  onSave: n
}) {
  const { settings: o, isLoading: s, isUpdating: a, error: i, fetchSettings: c, updateSettings: l } = Do(), [f, h] = x({}), [u, m] = x(null), [p, w] = x(!1);
  F(() => {
    c();
  }, [c]), F(() => {
    if (p) {
      const T = setTimeout(() => w(!1), 3e3);
      return () => clearTimeout(T);
    }
  }, [p]);
  const v = P((T, g) => {
    h((b) => ({ ...b, [T]: g })), m(null), w(!1);
  }, []), C = P(async () => {
    const T = Object.entries(f).map(([g, b]) => ({
      key: g,
      value: b
    }));
    if (T.length !== 0)
      try {
        await l(T), h({}), m(null), w(!0), n?.();
      } catch (g) {
        m(g instanceof Error ? g.message : "Failed to save settings");
      }
  }, [f, l, n]), E = P(() => {
    h({}), m(null), w(!1);
  }, []), k = Object.keys(f).length > 0, N = Object.keys(f).length;
  if (s && Object.keys(o).length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-system-settings cedros-system-settings-loading ${t}`, children: [
      /* @__PURE__ */ r(G, {}),
      /* @__PURE__ */ r("span", { children: "Loading settings..." })
    ] });
  if (i)
    return /* @__PURE__ */ r("div", { className: `cedros-system-settings ${t}`, children: /* @__PURE__ */ r(oe, { error: i.message }) });
  const S = Object.keys(o).sort();
  return S.length === 0 ? /* @__PURE__ */ r("div", { className: `cedros-system-settings cedros-system-settings-empty ${t}`, children: /* @__PURE__ */ r("p", { children: "No system settings found." }) }) : /* @__PURE__ */ d("div", { className: `cedros-system-settings ${t}`, children: [
    u && /* @__PURE__ */ r(oe, { error: u }),
    p && /* @__PURE__ */ r("div", { className: "cedros-settings-success", children: "Settings saved successfully." }),
    S.map((T) => /* @__PURE__ */ r(
      Mc,
      {
        category: T,
        settings: o[T],
        edits: f,
        showDescription: e,
        onChange: v
      },
      T
    )),
    /* @__PURE__ */ d("div", { className: "cedros-system-settings-actions", children: [
      k && /* @__PURE__ */ d("span", { className: "cedros-settings-change-count", children: [
        N,
        " unsaved change",
        N !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-secondary",
          onClick: E,
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
          children: a ? /* @__PURE__ */ r(G, { size: "sm" }) : "Save Changes"
        }
      )
    ] })
  ] });
}
const An = Object.keys(Vo);
function Mc({
  category: e,
  settings: t,
  edits: n,
  showDescription: o,
  onChange: s
}) {
  const a = jo[e] || {
    label: e,
    description: "",
    icon: ""
  }, i = W(() => [...t].sort((c, l) => {
    const f = An.indexOf(c.key), h = An.indexOf(l.key);
    return (f === -1 ? 1 / 0 : f) - (h === -1 ? 1 / 0 : h);
  }), [t]);
  return /* @__PURE__ */ d("section", { className: "cedros-settings-section", children: [
    /* @__PURE__ */ d("div", { className: "cedros-settings-section-header", children: [
      /* @__PURE__ */ r("span", { className: "cedros-settings-section-icon", children: a.icon }),
      /* @__PURE__ */ d("div", { children: [
        /* @__PURE__ */ r("h3", { className: "cedros-settings-section-title", children: a.label }),
        o && a.description && /* @__PURE__ */ r("p", { className: "cedros-settings-section-description", children: a.description })
      ] })
    ] }),
    /* @__PURE__ */ r(Ho, { settings: i, edits: n, onChange: s })
  ] });
}
function Xd({
  name: e,
  email: t,
  picture: n,
  onSettings: o,
  onLogout: s,
  className: a = ""
}) {
  const [i, c] = x(!1), l = Q(null);
  F(() => {
    function p(w) {
      l.current && !l.current.contains(w.target) && c(!1);
    }
    if (i)
      return document.addEventListener("mousedown", p), () => document.removeEventListener("mousedown", p);
  }, [i]), F(() => {
    function p(w) {
      w.key === "Escape" && c(!1);
    }
    if (i)
      return document.addEventListener("keydown", p), () => document.removeEventListener("keydown", p);
  }, [i]);
  const f = P(() => {
    c(!1), o?.();
  }, [o]), h = P(() => {
    c(!1), s?.();
  }, [s]), u = e || "User", m = (e?.[0] || t?.[0] || "?").toUpperCase();
  return /* @__PURE__ */ d("div", { className: `cedros-profile-dropdown ${a}`, ref: l, children: [
    /* @__PURE__ */ d(
      "button",
      {
        type: "button",
        className: "cedros-profile-dropdown__trigger",
        onClick: () => c(!i),
        "aria-expanded": i,
        "aria-haspopup": "menu",
        children: [
          /* @__PURE__ */ r("div", { className: "cedros-profile-dropdown__avatar", children: n ? /* @__PURE__ */ r(
            "img",
            {
              src: n,
              alt: u,
              className: "cedros-profile-dropdown__avatar-img",
              referrerPolicy: "no-referrer"
            }
          ) : /* @__PURE__ */ r("span", { className: "cedros-profile-dropdown__avatar-placeholder", children: m }) }),
          /* @__PURE__ */ d("div", { className: "cedros-profile-dropdown__info", children: [
            /* @__PURE__ */ r("span", { className: "cedros-profile-dropdown__name", children: u }),
            t && /* @__PURE__ */ r("span", { className: "cedros-profile-dropdown__email", children: t })
          ] }),
          /* @__PURE__ */ r(
            "svg",
            {
              className: `cedros-profile-dropdown__chevron ${i ? "cedros-profile-dropdown__chevron--open" : ""}`,
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: /* @__PURE__ */ r("path", { d: "m6 9 6 6 6-6" })
            }
          )
        ]
      }
    ),
    i && /* @__PURE__ */ d("div", { className: "cedros-profile-dropdown__menu", role: "menu", children: [
      o && /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: "cedros-profile-dropdown__item",
          onClick: f,
          role: "menuitem",
          children: [
            /* @__PURE__ */ d(
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
                  /* @__PURE__ */ r("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
                  /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "3" })
                ]
              }
            ),
            "Settings"
          ]
        }
      ),
      s && /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: "cedros-profile-dropdown__item cedros-profile-dropdown__item--danger",
          onClick: h,
          role: "menuitem",
          children: [
            /* @__PURE__ */ d(
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
                  /* @__PURE__ */ r("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
                  /* @__PURE__ */ r("polyline", { points: "16 17 21 12 16 7" }),
                  /* @__PURE__ */ r("line", { x1: "21", x2: "9", y1: "12", y2: "12" })
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
var Ge = {}, Vt, vn;
function Uc() {
  return vn || (vn = 1, Vt = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), Vt;
}
var $t = {}, Me = {}, Nn;
function qe() {
  if (Nn) return Me;
  Nn = 1;
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
  return Me.getSymbolSize = function(o) {
    if (!o) throw new Error('"version" cannot be null or undefined');
    if (o < 1 || o > 40) throw new Error('"version" should be in range from 1 to 40');
    return o * 4 + 17;
  }, Me.getSymbolTotalCodewords = function(o) {
    return t[o];
  }, Me.getBCHDigit = function(n) {
    let o = 0;
    for (; n !== 0; )
      o++, n >>>= 1;
    return o;
  }, Me.setToSJISFunction = function(o) {
    if (typeof o != "function")
      throw new Error('"toSJISFunc" is not a valid function.');
    e = o;
  }, Me.isKanjiModeEnabled = function() {
    return typeof e < "u";
  }, Me.toSJIS = function(o) {
    return e(o);
  }, Me;
}
var Gt = {}, kn;
function Or() {
  return kn || (kn = 1, (function(e) {
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
  })(Gt)), Gt;
}
var Qt, En;
function Dc() {
  if (En) return Qt;
  En = 1;
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
  }, Qt = e, Qt;
}
var Yt, Cn;
function Ic() {
  if (Cn) return Yt;
  Cn = 1;
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
  }, Yt = e, Yt;
}
var Kt = {}, xn;
function Fc() {
  return xn || (xn = 1, (function(e) {
    const t = qe().getSymbolSize;
    e.getRowColCoords = function(o) {
      if (o === 1) return [];
      const s = Math.floor(o / 7) + 2, a = t(o), i = a === 145 ? 26 : Math.ceil((a - 13) / (2 * s - 2)) * 2, c = [a - 7];
      for (let l = 1; l < s - 1; l++)
        c[l] = c[l - 1] - i;
      return c.push(6), c.reverse();
    }, e.getPositions = function(o) {
      const s = [], a = e.getRowColCoords(o), i = a.length;
      for (let c = 0; c < i; c++)
        for (let l = 0; l < i; l++)
          c === 0 && l === 0 || // top-left
          c === 0 && l === i - 1 || // bottom-left
          c === i - 1 && l === 0 || s.push([a[c], a[l]]);
      return s;
    };
  })(Kt)), Kt;
}
var Zt = {}, Sn;
function zc() {
  if (Sn) return Zt;
  Sn = 1;
  const e = qe().getSymbolSize, t = 7;
  return Zt.getPositions = function(o) {
    const s = e(o);
    return [
      // top-left
      [0, 0],
      // top-right
      [s - t, 0],
      // bottom-left
      [0, s - t]
    ];
  }, Zt;
}
var Xt = {}, _n;
function Wc() {
  return _n || (_n = 1, (function(e) {
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
      let i = 0, c = 0, l = 0, f = null, h = null;
      for (let u = 0; u < a; u++) {
        c = l = 0, f = h = null;
        for (let m = 0; m < a; m++) {
          let p = s.get(u, m);
          p === f ? c++ : (c >= 5 && (i += t.N1 + (c - 5)), f = p, c = 1), p = s.get(m, u), p === h ? l++ : (l >= 5 && (i += t.N1 + (l - 5)), h = p, l = 1);
        }
        c >= 5 && (i += t.N1 + (c - 5)), l >= 5 && (i += t.N1 + (l - 5));
      }
      return i;
    }, e.getPenaltyN2 = function(s) {
      const a = s.size;
      let i = 0;
      for (let c = 0; c < a - 1; c++)
        for (let l = 0; l < a - 1; l++) {
          const f = s.get(c, l) + s.get(c, l + 1) + s.get(c + 1, l) + s.get(c + 1, l + 1);
          (f === 4 || f === 0) && i++;
        }
      return i * t.N2;
    }, e.getPenaltyN3 = function(s) {
      const a = s.size;
      let i = 0, c = 0, l = 0;
      for (let f = 0; f < a; f++) {
        c = l = 0;
        for (let h = 0; h < a; h++)
          c = c << 1 & 2047 | s.get(f, h), h >= 10 && (c === 1488 || c === 93) && i++, l = l << 1 & 2047 | s.get(h, f), h >= 10 && (l === 1488 || l === 93) && i++;
      }
      return i * t.N3;
    }, e.getPenaltyN4 = function(s) {
      let a = 0;
      const i = s.data.length;
      for (let l = 0; l < i; l++) a += s.data[l];
      return Math.abs(Math.ceil(a * 100 / i / 5) - 10) * t.N4;
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
      const i = a.size;
      for (let c = 0; c < i; c++)
        for (let l = 0; l < i; l++)
          a.isReserved(l, c) || a.xor(l, c, n(s, l, c));
    }, e.getBestMask = function(s, a) {
      const i = Object.keys(e.Patterns).length;
      let c = 0, l = 1 / 0;
      for (let f = 0; f < i; f++) {
        a(f), e.applyMask(f, s);
        const h = e.getPenaltyN1(s) + e.getPenaltyN2(s) + e.getPenaltyN3(s) + e.getPenaltyN4(s);
        e.applyMask(f, s), h < l && (l = h, c = f);
      }
      return c;
    };
  })(Xt)), Xt;
}
var lt = {}, Bn;
function Gs() {
  if (Bn) return lt;
  Bn = 1;
  const e = Or(), t = [
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
  return lt.getBlocksCount = function(s, a) {
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
  }, lt.getTotalCodewordsCount = function(s, a) {
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
  }, lt;
}
var Jt = {}, et = {}, Ln;
function Oc() {
  if (Ln) return et;
  Ln = 1;
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
var Tn;
function qc() {
  return Tn || (Tn = 1, (function(e) {
    const t = Oc();
    e.mul = function(o, s) {
      const a = new Uint8Array(o.length + s.length - 1);
      for (let i = 0; i < o.length; i++)
        for (let c = 0; c < s.length; c++)
          a[i + c] ^= t.mul(o[i], s[c]);
      return a;
    }, e.mod = function(o, s) {
      let a = new Uint8Array(o);
      for (; a.length - s.length >= 0; ) {
        const i = a[0];
        for (let l = 0; l < s.length; l++)
          a[l] ^= t.mul(s[l], i);
        let c = 0;
        for (; c < a.length && a[c] === 0; ) c++;
        a = a.slice(c);
      }
      return a;
    }, e.generateECPolynomial = function(o) {
      let s = new Uint8Array([1]);
      for (let a = 0; a < o; a++)
        s = e.mul(s, new Uint8Array([1, t.exp(a)]));
      return s;
    };
  })(Jt)), Jt;
}
var er, Pn;
function jc() {
  if (Pn) return er;
  Pn = 1;
  const e = qc();
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
    const a = e.mod(s, this.genPoly), i = this.degree - a.length;
    if (i > 0) {
      const c = new Uint8Array(this.degree);
      return c.set(a, i), c;
    }
    return a;
  }, er = t, er;
}
var tr = {}, rr = {}, nr = {}, Rn;
function Qs() {
  return Rn || (Rn = 1, nr.isValid = function(t) {
    return !isNaN(t) && t >= 1 && t <= 40;
  }), nr;
}
var be = {}, Mn;
function Ys() {
  if (Mn) return be;
  Mn = 1;
  const e = "[0-9]+", t = "[A-Z $%*+\\-./:]+";
  let n = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  n = n.replace(/u/g, "\\u");
  const o = "(?:(?![A-Z0-9 $%*+\\-./:]|" + n + `)(?:.|[\r
]))+`;
  be.KANJI = new RegExp(n, "g"), be.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), be.BYTE = new RegExp(o, "g"), be.NUMERIC = new RegExp(e, "g"), be.ALPHANUMERIC = new RegExp(t, "g");
  const s = new RegExp("^" + n + "$"), a = new RegExp("^" + e + "$"), i = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return be.testKanji = function(l) {
    return s.test(l);
  }, be.testNumeric = function(l) {
    return a.test(l);
  }, be.testAlphanumeric = function(l) {
    return i.test(l);
  }, be;
}
var Un;
function je() {
  return Un || (Un = 1, (function(e) {
    const t = Qs(), n = Ys();
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
    e.from = function(a, i) {
      if (e.isValid(a))
        return a;
      try {
        return o(a);
      } catch {
        return i;
      }
    };
  })(rr)), rr;
}
var Dn;
function Hc() {
  return Dn || (Dn = 1, (function(e) {
    const t = qe(), n = Gs(), o = Or(), s = je(), a = Qs(), i = 7973, c = t.getBCHDigit(i);
    function l(m, p, w) {
      for (let v = 1; v <= 40; v++)
        if (p <= e.getCapacity(v, w, m))
          return v;
    }
    function f(m, p) {
      return s.getCharCountIndicator(m, p) + 4;
    }
    function h(m, p) {
      let w = 0;
      return m.forEach(function(v) {
        const C = f(v.mode, p);
        w += C + v.getBitsLength();
      }), w;
    }
    function u(m, p) {
      for (let w = 1; w <= 40; w++)
        if (h(m, w) <= e.getCapacity(w, p, s.MIXED))
          return w;
    }
    e.from = function(p, w) {
      return a.isValid(p) ? parseInt(p, 10) : w;
    }, e.getCapacity = function(p, w, v) {
      if (!a.isValid(p))
        throw new Error("Invalid QR Code version");
      typeof v > "u" && (v = s.BYTE);
      const C = t.getSymbolTotalCodewords(p), E = n.getTotalCodewordsCount(p, w), k = (C - E) * 8;
      if (v === s.MIXED) return k;
      const N = k - f(v, p);
      switch (v) {
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
    }, e.getBestVersionForData = function(p, w) {
      let v;
      const C = o.from(w, o.M);
      if (Array.isArray(p)) {
        if (p.length > 1)
          return u(p, C);
        if (p.length === 0)
          return 1;
        v = p[0];
      } else
        v = p;
      return l(v.mode, v.getLength(), C);
    }, e.getEncodedBits = function(p) {
      if (!a.isValid(p) || p < 7)
        throw new Error("Invalid QR Code version");
      let w = p << 12;
      for (; t.getBCHDigit(w) - c >= 0; )
        w ^= i << t.getBCHDigit(w) - c;
      return p << 12 | w;
    };
  })(tr)), tr;
}
var sr = {}, In;
function Vc() {
  if (In) return sr;
  In = 1;
  const e = qe(), t = 1335, n = 21522, o = e.getBCHDigit(t);
  return sr.getEncodedBits = function(a, i) {
    const c = a.bit << 3 | i;
    let l = c << 10;
    for (; e.getBCHDigit(l) - o >= 0; )
      l ^= t << e.getBCHDigit(l) - o;
    return (c << 10 | l) ^ n;
  }, sr;
}
var or = {}, ar, Fn;
function $c() {
  if (Fn) return ar;
  Fn = 1;
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
    let s, a, i;
    for (s = 0; s + 3 <= this.data.length; s += 3)
      a = this.data.substr(s, 3), i = parseInt(a, 10), o.put(i, 10);
    const c = this.data.length - s;
    c > 0 && (a = this.data.substr(s), i = parseInt(a, 10), o.put(i, c * 3 + 1));
  }, ar = t, ar;
}
var ir, zn;
function Gc() {
  if (zn) return ir;
  zn = 1;
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
      let i = t.indexOf(this.data[a]) * 45;
      i += t.indexOf(this.data[a + 1]), s.put(i, 11);
    }
    this.data.length % 2 && s.put(t.indexOf(this.data[a]), 6);
  }, ir = n, ir;
}
var cr, Wn;
function Qc() {
  if (Wn) return cr;
  Wn = 1;
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
  }, cr = t, cr;
}
var lr, On;
function Yc() {
  if (On) return lr;
  On = 1;
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
  }, lr = n, lr;
}
var dr = { exports: {} }, qn;
function Kc() {
  return qn || (qn = 1, (function(e) {
    var t = {
      single_source_shortest_paths: function(n, o, s) {
        var a = {}, i = {};
        i[o] = 0;
        var c = t.PriorityQueue.make();
        c.push(o, 0);
        for (var l, f, h, u, m, p, w, v, C; !c.empty(); ) {
          l = c.pop(), f = l.value, u = l.cost, m = n[f] || {};
          for (h in m)
            m.hasOwnProperty(h) && (p = m[h], w = u + p, v = i[h], C = typeof i[h] > "u", (C || v > w) && (i[h] = w, c.push(h, w), a[h] = f));
        }
        if (typeof s < "u" && typeof i[s] > "u") {
          var E = ["Could not find a path from ", o, " to ", s, "."].join("");
          throw new Error(E);
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
  })(dr)), dr.exports;
}
var jn;
function Zc() {
  return jn || (jn = 1, (function(e) {
    const t = je(), n = $c(), o = Gc(), s = Qc(), a = Yc(), i = Ys(), c = qe(), l = Kc();
    function f(E) {
      return unescape(encodeURIComponent(E)).length;
    }
    function h(E, k, N) {
      const S = [];
      let T;
      for (; (T = E.exec(N)) !== null; )
        S.push({
          data: T[0],
          index: T.index,
          mode: k,
          length: T[0].length
        });
      return S;
    }
    function u(E) {
      const k = h(i.NUMERIC, t.NUMERIC, E), N = h(i.ALPHANUMERIC, t.ALPHANUMERIC, E);
      let S, T;
      return c.isKanjiModeEnabled() ? (S = h(i.BYTE, t.BYTE, E), T = h(i.KANJI, t.KANJI, E)) : (S = h(i.BYTE_KANJI, t.BYTE, E), T = []), k.concat(N, S, T).sort(function(b, y) {
        return b.index - y.index;
      }).map(function(b) {
        return {
          data: b.data,
          mode: b.mode,
          length: b.length
        };
      });
    }
    function m(E, k) {
      switch (k) {
        case t.NUMERIC:
          return n.getBitsLength(E);
        case t.ALPHANUMERIC:
          return o.getBitsLength(E);
        case t.KANJI:
          return a.getBitsLength(E);
        case t.BYTE:
          return s.getBitsLength(E);
      }
    }
    function p(E) {
      return E.reduce(function(k, N) {
        const S = k.length - 1 >= 0 ? k[k.length - 1] : null;
        return S && S.mode === N.mode ? (k[k.length - 1].data += N.data, k) : (k.push(N), k);
      }, []);
    }
    function w(E) {
      const k = [];
      for (let N = 0; N < E.length; N++) {
        const S = E[N];
        switch (S.mode) {
          case t.NUMERIC:
            k.push([
              S,
              { data: S.data, mode: t.ALPHANUMERIC, length: S.length },
              { data: S.data, mode: t.BYTE, length: S.length }
            ]);
            break;
          case t.ALPHANUMERIC:
            k.push([
              S,
              { data: S.data, mode: t.BYTE, length: S.length }
            ]);
            break;
          case t.KANJI:
            k.push([
              S,
              { data: S.data, mode: t.BYTE, length: f(S.data) }
            ]);
            break;
          case t.BYTE:
            k.push([
              { data: S.data, mode: t.BYTE, length: f(S.data) }
            ]);
        }
      }
      return k;
    }
    function v(E, k) {
      const N = {}, S = { start: {} };
      let T = ["start"];
      for (let g = 0; g < E.length; g++) {
        const b = E[g], y = [];
        for (let A = 0; A < b.length; A++) {
          const B = b[A], _ = "" + g + A;
          y.push(_), N[_] = { node: B, lastCount: 0 }, S[_] = {};
          for (let R = 0; R < T.length; R++) {
            const L = T[R];
            N[L] && N[L].node.mode === B.mode ? (S[L][_] = m(N[L].lastCount + B.length, B.mode) - m(N[L].lastCount, B.mode), N[L].lastCount += B.length) : (N[L] && (N[L].lastCount = B.length), S[L][_] = m(B.length, B.mode) + 4 + t.getCharCountIndicator(B.mode, k));
          }
        }
        T = y;
      }
      for (let g = 0; g < T.length; g++)
        S[T[g]].end = 0;
      return { map: S, table: N };
    }
    function C(E, k) {
      let N;
      const S = t.getBestModeForData(E);
      if (N = t.from(k, S), N !== t.BYTE && N.bit < S.bit)
        throw new Error('"' + E + '" cannot be encoded with mode ' + t.toString(N) + `.
 Suggested mode is: ` + t.toString(S));
      switch (N === t.KANJI && !c.isKanjiModeEnabled() && (N = t.BYTE), N) {
        case t.NUMERIC:
          return new n(E);
        case t.ALPHANUMERIC:
          return new o(E);
        case t.KANJI:
          return new a(E);
        case t.BYTE:
          return new s(E);
      }
    }
    e.fromArray = function(k) {
      return k.reduce(function(N, S) {
        return typeof S == "string" ? N.push(C(S, null)) : S.data && N.push(C(S.data, S.mode)), N;
      }, []);
    }, e.fromString = function(k, N) {
      const S = u(k, c.isKanjiModeEnabled()), T = w(S), g = v(T, N), b = l.find_path(g.map, "start", "end"), y = [];
      for (let A = 1; A < b.length - 1; A++)
        y.push(g.table[b[A]].node);
      return e.fromArray(p(y));
    }, e.rawSplit = function(k) {
      return e.fromArray(
        u(k, c.isKanjiModeEnabled())
      );
    };
  })(or)), or;
}
var Hn;
function Xc() {
  if (Hn) return $t;
  Hn = 1;
  const e = qe(), t = Or(), n = Dc(), o = Ic(), s = Fc(), a = zc(), i = Wc(), c = Gs(), l = jc(), f = Hc(), h = Vc(), u = je(), m = Zc();
  function p(g, b) {
    const y = g.size, A = a.getPositions(b);
    for (let B = 0; B < A.length; B++) {
      const _ = A[B][0], R = A[B][1];
      for (let L = -1; L <= 7; L++)
        if (!(_ + L <= -1 || y <= _ + L))
          for (let M = -1; M <= 7; M++)
            R + M <= -1 || y <= R + M || (L >= 0 && L <= 6 && (M === 0 || M === 6) || M >= 0 && M <= 6 && (L === 0 || L === 6) || L >= 2 && L <= 4 && M >= 2 && M <= 4 ? g.set(_ + L, R + M, !0, !0) : g.set(_ + L, R + M, !1, !0));
    }
  }
  function w(g) {
    const b = g.size;
    for (let y = 8; y < b - 8; y++) {
      const A = y % 2 === 0;
      g.set(y, 6, A, !0), g.set(6, y, A, !0);
    }
  }
  function v(g, b) {
    const y = s.getPositions(b);
    for (let A = 0; A < y.length; A++) {
      const B = y[A][0], _ = y[A][1];
      for (let R = -2; R <= 2; R++)
        for (let L = -2; L <= 2; L++)
          R === -2 || R === 2 || L === -2 || L === 2 || R === 0 && L === 0 ? g.set(B + R, _ + L, !0, !0) : g.set(B + R, _ + L, !1, !0);
    }
  }
  function C(g, b) {
    const y = g.size, A = f.getEncodedBits(b);
    let B, _, R;
    for (let L = 0; L < 18; L++)
      B = Math.floor(L / 3), _ = L % 3 + y - 8 - 3, R = (A >> L & 1) === 1, g.set(B, _, R, !0), g.set(_, B, R, !0);
  }
  function E(g, b, y) {
    const A = g.size, B = h.getEncodedBits(b, y);
    let _, R;
    for (_ = 0; _ < 15; _++)
      R = (B >> _ & 1) === 1, _ < 6 ? g.set(_, 8, R, !0) : _ < 8 ? g.set(_ + 1, 8, R, !0) : g.set(A - 15 + _, 8, R, !0), _ < 8 ? g.set(8, A - _ - 1, R, !0) : _ < 9 ? g.set(8, 15 - _ - 1 + 1, R, !0) : g.set(8, 15 - _ - 1, R, !0);
    g.set(A - 8, 8, 1, !0);
  }
  function k(g, b) {
    const y = g.size;
    let A = -1, B = y - 1, _ = 7, R = 0;
    for (let L = y - 1; L > 0; L -= 2)
      for (L === 6 && L--; ; ) {
        for (let M = 0; M < 2; M++)
          if (!g.isReserved(B, L - M)) {
            let U = !1;
            R < b.length && (U = (b[R] >>> _ & 1) === 1), g.set(B, L - M, U), _--, _ === -1 && (R++, _ = 7);
          }
        if (B += A, B < 0 || y <= B) {
          B -= A, A = -A;
          break;
        }
      }
  }
  function N(g, b, y) {
    const A = new n();
    y.forEach(function(M) {
      A.put(M.mode.bit, 4), A.put(M.getLength(), u.getCharCountIndicator(M.mode, g)), M.write(A);
    });
    const B = e.getSymbolTotalCodewords(g), _ = c.getTotalCodewordsCount(g, b), R = (B - _) * 8;
    for (A.getLengthInBits() + 4 <= R && A.put(0, 4); A.getLengthInBits() % 8 !== 0; )
      A.putBit(0);
    const L = (R - A.getLengthInBits()) / 8;
    for (let M = 0; M < L; M++)
      A.put(M % 2 ? 17 : 236, 8);
    return S(A, g, b);
  }
  function S(g, b, y) {
    const A = e.getSymbolTotalCodewords(b), B = c.getTotalCodewordsCount(b, y), _ = A - B, R = c.getBlocksCount(b, y), L = A % R, M = R - L, U = Math.floor(A / R), I = Math.floor(_ / R), z = I + 1, O = U - I, $ = new l(O);
    let D = 0;
    const H = new Array(R), K = new Array(R);
    let Y = 0;
    const Ae = new Uint8Array(g.buffer);
    for (let ie = 0; ie < R; ie++) {
      const xe = ie < M ? I : z;
      H[ie] = Ae.slice(D, D + xe), K[ie] = $.encode(H[ie]), D += xe, Y = Math.max(Y, xe);
    }
    const Ce = new Uint8Array(A);
    let ge = 0, ue, Z;
    for (ue = 0; ue < Y; ue++)
      for (Z = 0; Z < R; Z++)
        ue < H[Z].length && (Ce[ge++] = H[Z][ue]);
    for (ue = 0; ue < O; ue++)
      for (Z = 0; Z < R; Z++)
        Ce[ge++] = K[Z][ue];
    return Ce;
  }
  function T(g, b, y, A) {
    let B;
    if (Array.isArray(g))
      B = m.fromArray(g);
    else if (typeof g == "string") {
      let U = b;
      if (!U) {
        const I = m.rawSplit(g);
        U = f.getBestVersionForData(I, y);
      }
      B = m.fromString(g, U || 40);
    } else
      throw new Error("Invalid data");
    const _ = f.getBestVersionForData(B, y);
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
    const R = N(b, y, B), L = e.getSymbolSize(b), M = new o(L);
    return p(M, b), w(M), v(M, b), E(M, y, 0), b >= 7 && C(M, b), k(M, R), isNaN(A) && (A = i.getBestMask(
      M,
      E.bind(null, M, y)
    )), i.applyMask(A, M), E(M, y, A), {
      modules: M,
      version: b,
      errorCorrectionLevel: y,
      maskPattern: A,
      segments: B
    };
  }
  return $t.create = function(b, y) {
    if (typeof b > "u" || b === "")
      throw new Error("No input text");
    let A = t.M, B, _;
    return typeof y < "u" && (A = t.from(y.errorCorrectionLevel, t.M), B = f.from(y.version), _ = i.from(y.maskPattern), y.toSJISFunc && e.setToSJISFunction(y.toSJISFunc)), T(b, B, A, _);
  }, $t;
}
var ur = {}, hr = {}, Vn;
function Ks() {
  return Vn || (Vn = 1, (function(e) {
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
      const s = typeof o.margin > "u" || o.margin === null || o.margin < 0 ? 4 : o.margin, a = o.width && o.width >= 21 ? o.width : void 0, i = o.scale || 4;
      return {
        width: a,
        scale: a ? 4 : i,
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
      const i = s.modules.size, c = s.modules.data, l = e.getScale(i, a), f = Math.floor((i + a.margin * 2) * l), h = a.margin * l, u = [a.color.light, a.color.dark];
      for (let m = 0; m < f; m++)
        for (let p = 0; p < f; p++) {
          let w = (m * f + p) * 4, v = a.color.light;
          if (m >= h && p >= h && m < f - h && p < f - h) {
            const C = Math.floor((m - h) / l), E = Math.floor((p - h) / l);
            v = u[c[C * i + E] ? 1 : 0];
          }
          o[w++] = v.r, o[w++] = v.g, o[w++] = v.b, o[w] = v.a;
        }
    };
  })(hr)), hr;
}
var $n;
function Jc() {
  return $n || ($n = 1, (function(e) {
    const t = Ks();
    function n(s, a, i) {
      s.clearRect(0, 0, a.width, a.height), a.style || (a.style = {}), a.height = i, a.width = i, a.style.height = i + "px", a.style.width = i + "px";
    }
    function o() {
      try {
        return document.createElement("canvas");
      } catch {
        throw new Error("You need to specify a canvas element");
      }
    }
    e.render = function(a, i, c) {
      let l = c, f = i;
      typeof l > "u" && (!i || !i.getContext) && (l = i, i = void 0), i || (f = o()), l = t.getOptions(l);
      const h = t.getImageWidth(a.modules.size, l), u = f.getContext("2d"), m = u.createImageData(h, h);
      return t.qrToImageData(m.data, a, l), n(u, f, h), u.putImageData(m, 0, 0), f;
    }, e.renderToDataURL = function(a, i, c) {
      let l = c;
      typeof l > "u" && (!i || !i.getContext) && (l = i, i = void 0), l || (l = {});
      const f = e.render(a, i, l), h = l.type || "image/png", u = l.rendererOpts || {};
      return f.toDataURL(h, u.quality);
    };
  })(ur)), ur;
}
var fr = {}, Gn;
function el() {
  if (Gn) return fr;
  Gn = 1;
  const e = Ks();
  function t(s, a) {
    const i = s.a / 255, c = a + '="' + s.hex + '"';
    return i < 1 ? c + " " + a + '-opacity="' + i.toFixed(2).slice(1) + '"' : c;
  }
  function n(s, a, i) {
    let c = s + a;
    return typeof i < "u" && (c += " " + i), c;
  }
  function o(s, a, i) {
    let c = "", l = 0, f = !1, h = 0;
    for (let u = 0; u < s.length; u++) {
      const m = Math.floor(u % a), p = Math.floor(u / a);
      !m && !f && (f = !0), s[u] ? (h++, u > 0 && m > 0 && s[u - 1] || (c += f ? n("M", m + i, 0.5 + p + i) : n("m", l, 0), l = 0, f = !1), m + 1 < a && s[u + 1] || (c += n("h", h), h = 0)) : l++;
    }
    return c;
  }
  return fr.render = function(a, i, c) {
    const l = e.getOptions(i), f = a.modules.size, h = a.modules.data, u = f + l.margin * 2, m = l.color.light.a ? "<path " + t(l.color.light, "fill") + ' d="M0 0h' + u + "v" + u + 'H0z"/>' : "", p = "<path " + t(l.color.dark, "stroke") + ' d="' + o(h, f, l.margin) + '"/>', w = 'viewBox="0 0 ' + u + " " + u + '"', C = '<svg xmlns="http://www.w3.org/2000/svg" ' + (l.width ? 'width="' + l.width + '" height="' + l.width + '" ' : "") + w + ' shape-rendering="crispEdges">' + m + p + `</svg>
`;
    return typeof c == "function" && c(null, C), C;
  }, fr;
}
var Qn;
function tl() {
  if (Qn) return Ge;
  Qn = 1;
  const e = Uc(), t = Xc(), n = Jc(), o = el();
  function s(a, i, c, l, f) {
    const h = [].slice.call(arguments, 1), u = h.length, m = typeof h[u - 1] == "function";
    if (!m && !e())
      throw new Error("Callback required as last argument");
    if (m) {
      if (u < 2)
        throw new Error("Too few arguments provided");
      u === 2 ? (f = c, c = i, i = l = void 0) : u === 3 && (i.getContext && typeof f > "u" ? (f = l, l = void 0) : (f = l, l = c, c = i, i = void 0));
    } else {
      if (u < 1)
        throw new Error("Too few arguments provided");
      return u === 1 ? (c = i, i = l = void 0) : u === 2 && !i.getContext && (l = c, c = i, i = void 0), new Promise(function(p, w) {
        try {
          const v = t.create(c, l);
          p(a(v, i, l));
        } catch (v) {
          w(v);
        }
      });
    }
    try {
      const p = t.create(c, l);
      f(null, a(p, i, l));
    } catch (p) {
      f(p);
    }
  }
  return Ge.create = t.create, Ge.toCanvas = s.bind(null, n.render), Ge.toDataURL = s.bind(null, n.renderToDataURL), Ge.toString = s.bind(null, function(a, i, c) {
    return o.render(a, c);
  }), Ge;
}
var rl = tl();
const nl = /* @__PURE__ */ ms(rl);
function sl({ value: e, size: t = 200, alt: n = "QR code", className: o = "" }) {
  const s = Q(null), [a, i] = x(null);
  return F(() => {
    !s.current || !e || nl.toCanvas(s.current, e, {
      width: t,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
      errorCorrectionLevel: "M"
    }).then(() => {
      i(null);
    }).catch((c) => {
      i(c instanceof Error ? c.message : "Failed to generate QR code");
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
function Zs() {
  const { config: e, _internal: t } = J(), [n, o] = x(null), [s, a] = x("idle"), [i, c] = x(null), [l, f] = x(!1), [h, u] = x(null), m = W(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t]
  ), p = P(async () => {
    f(!0), u(null);
    try {
      const S = await m.get("/mfa/status");
      return o(S), S;
    } catch (S) {
      const T = V(S, "Unable to load two-factor authentication status. Please try again.");
      throw u(T), T;
    } finally {
      f(!1);
    }
  }, [m]), w = P(async () => {
    f(!0), u(null), a("loading");
    try {
      const S = await m.post("/mfa/setup", {});
      return c(S), a("setup"), S;
    } catch (S) {
      const T = V(S, "Unable to start two-factor setup. Please try again.");
      throw u(T), a("error"), T;
    } finally {
      f(!1);
    }
  }, [m]), v = P(
    async (S) => {
      if (!/^\d{6}$/.test(S)) {
        const T = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw u(T), T;
      }
      f(!0), u(null), a("verifying");
      try {
        await m.post("/mfa/enable", { code: S }), a("success");
        try {
          const T = await m.get("/mfa/status");
          o(T);
        } catch {
          o({ enabled: !0, recoveryCodesRemaining: 0 });
        }
      } catch (T) {
        const g = V(T, "Incorrect verification code. Please check and try again.");
        throw u(g), a("error"), g;
      } finally {
        f(!1);
      }
    },
    [m]
  ), C = P(
    async (S) => {
      if (!S) {
        const T = {
          code: "VALIDATION_ERROR",
          message: "Please enter your password"
        };
        throw u(T), T;
      }
      f(!0), u(null);
      try {
        await m.post("/mfa/disable", { password: S }), o({ enabled: !1, recoveryCodesRemaining: 0 }), c(null), a("idle");
      } catch (T) {
        const g = V(T, "Unable to disable two-factor authentication. Please try again.");
        throw u(g), g;
      } finally {
        f(!1);
      }
    },
    [m]
  ), E = P(
    async (S) => {
      if (!/^\d{6}$/.test(S)) {
        const T = {
          code: "VALIDATION_ERROR",
          message: "Please enter a 6-digit code"
        };
        throw u(T), T;
      }
      f(!0), u(null);
      try {
        return await m.post(
          "/mfa/recovery-codes/regenerate",
          { code: S }
        );
      } catch (T) {
        const g = V(T, "Unable to regenerate recovery codes. Please try again.");
        throw u(g), g;
      } finally {
        f(!1);
      }
    },
    [m]
  ), k = P(() => u(null), []), N = P(() => {
    u(null), c(null), a("idle"), f(!1);
  }, []);
  return {
    status: n,
    setupState: s,
    setupData: i,
    isLoading: l,
    error: h,
    getStatus: p,
    beginSetup: w,
    enableTotp: v,
    disableTotp: C,
    regenerateBackupCodes: E,
    clearError: k,
    reset: N
  };
}
function Xs({ onSuccess: e, onCancel: t, className: n = "" }) {
  const { setupState: o, setupData: s, isLoading: a, error: i, beginSetup: c, enableTotp: l, clearError: f, reset: h } = Zs(), [u, m] = x("qr"), [p, w] = x(""), [v, C] = x(!1), [E, k] = x(!1), N = Q(null);
  F(() => {
    o === "idle" && c().catch(() => {
    });
  }, [o, c]), F(() => {
    o === "success" && e?.();
  }, [o, e]);
  const S = async () => {
    s?.secret && (await navigator.clipboard.writeText(s.secret), C(!0), N.current !== null && window.clearTimeout(N.current), N.current = window.setTimeout(() => C(!1), 2e3));
  }, T = async () => {
    if (s?.recoveryCodes) {
      const y = s.recoveryCodes.join(`
`);
      await navigator.clipboard.writeText(y);
    }
  }, g = async () => {
    try {
      await l(p);
    } catch {
      w("");
    }
  }, b = () => {
    h(), t?.();
  };
  return F(() => () => {
    N.current !== null && (window.clearTimeout(N.current), N.current = null);
  }, []), o === "loading" || o === "idle" && a ? /* @__PURE__ */ r("div", { className: `cedros-totp-setup ${n}`, children: /* @__PURE__ */ r("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ r(G, { size: "lg", label: "Setting up two-factor authentication" }) }) }) : o === "error" && !s ? /* @__PURE__ */ d("div", { className: `cedros-totp-setup ${n}`, children: [
    /* @__PURE__ */ r(oe, { error: i, onDismiss: f }),
    /* @__PURE__ */ d("div", { className: "cedros-totp-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: b,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: () => c(),
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
    u === "qr" && /* @__PURE__ */ d("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Scan QR code" }),
      /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Use your authenticator app to scan this QR code." }),
      /* @__PURE__ */ r("div", { className: "cedros-totp-qr", children: /* @__PURE__ */ r(sl, { value: s.otpauthUri, size: 200, alt: "QR code for authenticator app" }) }),
      /* @__PURE__ */ d("div", { className: "cedros-totp-manual", children: [
        /* @__PURE__ */ r("p", { className: "cedros-totp-manual-label", children: "Or enter this code manually:" }),
        /* @__PURE__ */ d("div", { className: "cedros-totp-secret", children: [
          /* @__PURE__ */ r("code", { className: "cedros-totp-secret-code", children: s.secret }),
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-ghost cedros-button-sm",
              onClick: S,
              "aria-label": "Copy secret",
              children: v ? "Copied!" : "Copy"
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
            onClick: b,
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
    u === "backup" && /* @__PURE__ */ d("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Save recovery codes" }),
      /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. You can use them to access your account if you lose your authenticator device." }),
      /* @__PURE__ */ r("div", { className: "cedros-totp-backup-codes", children: s.recoveryCodes.map((y, A) => /* @__PURE__ */ r("code", { className: "cedros-totp-backup-code", children: y }, A)) }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
          onClick: T,
          children: "Copy all codes"
        }
      ),
      /* @__PURE__ */ d("label", { className: "cedros-checkbox-label cedros-totp-confirm", children: [
        /* @__PURE__ */ r(
          "input",
          {
            type: "checkbox",
            className: "cedros-checkbox",
            checked: E,
            onChange: (y) => k(y.target.checked)
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
            disabled: !E,
            children: "Continue"
          }
        )
      ] })
    ] }),
    u === "verify" && /* @__PURE__ */ d("div", { className: "cedros-totp-step", children: [
      /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Verify setup" }),
      /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Enter the 6-digit code from your authenticator app to complete setup." }),
      /* @__PURE__ */ r(
        hs,
        {
          value: p,
          onChange: w,
          onComplete: g,
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
            disabled: a || p.length !== 6,
            children: a ? /* @__PURE__ */ d(X, { children: [
              /* @__PURE__ */ r(G, { size: "sm" }),
              /* @__PURE__ */ r("span", { children: "Verifying..." })
            ] }) : "Enable 2FA"
          }
        )
      ] })
    ] })
  ] }) : null;
}
function ol({ onStatusChange: e, className: t = "" }) {
  const { status: n, isLoading: o, error: s, getStatus: a, disableTotp: i, regenerateBackupCodes: c, clearError: l } = Zs(), [f, h] = x("status"), [u, m] = x(""), [p, w] = x(""), [v, C] = x(null), [E, k] = x(!1), [N, S] = x(null);
  F(() => {
    a().catch(() => {
    });
  }, [a]);
  const T = P(() => {
    h("status"), e?.(!0);
  }, [e]), g = async () => {
    k(!0), S(null);
    try {
      await i(u), h("status"), m(""), e?.(!1);
    } catch (A) {
      S(A instanceof Error ? A.message : "Failed to disable 2FA"), m("");
    } finally {
      k(!1);
    }
  }, b = async () => {
    k(!0), S(null);
    try {
      const A = await c(p);
      C(A.recoveryCodes), w("");
    } catch (A) {
      S(A instanceof Error ? A.message : "Failed to regenerate codes"), w("");
    } finally {
      k(!1);
    }
  }, y = async () => {
    v && await navigator.clipboard.writeText(v.join(`
`));
  };
  return o && !n ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ r("div", { className: "cedros-totp-loading", children: /* @__PURE__ */ r(G, { size: "md", label: "Loading security settings" }) }) }) : s && !n ? /* @__PURE__ */ d("div", { className: `cedros-totp-settings ${t}`, children: [
    /* @__PURE__ */ r(oe, { error: s, onDismiss: l }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => a(),
        children: "Retry"
      }
    )
  ] }) : f === "setup" ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ r(Xs, { onSuccess: T, onCancel: () => h("status") }) }) : f === "disable" ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Disable two-factor authentication" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description cedros-totp-warning", children: "This will make your account less secure. Enter your password to confirm." }),
    N && /* @__PURE__ */ r("div", { className: "cedros-totp-error", children: /* @__PURE__ */ r(
      oe,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => S(null)
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ r(
      pe,
      {
        label: "Password",
        placeholder: "Enter your password",
        value: u,
        onChange: (A) => m(A.target.value),
        disabled: E,
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
            h("status"), m(""), S(null);
          },
          disabled: E,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive cedros-button-md",
          onClick: g,
          disabled: E || u.length === 0,
          children: E ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(G, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Disabling..." })
          ] }) : "Disable 2FA"
        }
      )
    ] })
  ] }) }) : f === "regenerate" ? v ? /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "New recovery codes" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "Save these codes in a secure place. Your old codes are no longer valid." }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-backup-codes", children: v.map((A, B) => /* @__PURE__ */ r("code", { className: "cedros-totp-backup-code", children: A }, B)) }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-outline cedros-button-md cedros-button-full",
        onClick: y,
        children: "Copy all codes"
      }
    ),
    /* @__PURE__ */ r("div", { className: "cedros-totp-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => {
          h("status"), C(null);
        },
        children: "Done"
      }
    ) })
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-totp-settings ${t}`, children: /* @__PURE__ */ d("div", { className: "cedros-totp-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-totp-title", children: "Regenerate recovery codes" }),
    /* @__PURE__ */ r("p", { className: "cedros-totp-description", children: "This will invalidate all existing recovery codes. Enter your authenticator code to confirm." }),
    N && /* @__PURE__ */ r("div", { className: "cedros-totp-error", children: /* @__PURE__ */ r(
      oe,
      {
        error: { code: "UNKNOWN_ERROR", message: N },
        onDismiss: () => S(null)
      }
    ) }),
    /* @__PURE__ */ r("div", { className: "cedros-totp-verify-input", children: /* @__PURE__ */ r(
      hs,
      {
        value: p,
        onChange: w,
        onComplete: b,
        disabled: E,
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
            h("status"), w(""), S(null);
          },
          disabled: E,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: b,
          disabled: E || p.length !== 6,
          children: E ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(G, { size: "sm" }),
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
          onClick: () => h("regenerate"),
          children: "Regenerate recovery codes"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-destructive-outline cedros-button-md",
          onClick: () => h("disable"),
          children: "Disable 2FA"
        }
      )
    ] }) : /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md",
        onClick: () => h("setup"),
        children: "Enable two-factor authentication"
      }
    )
  ] }) });
}
class al {
  client;
  constructor(t, n, o, s) {
    this.client = new ne({ baseUrl: t, timeoutMs: n, retryAttempts: o, getAccessToken: s });
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
      throw V(n, "Failed to change password");
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
      throw V(n, "Failed to update profile");
    }
  }
}
function Lt() {
  const { config: e, authState: t, _internal: n } = J(), [o, s] = x(!1), [a, i] = x(null), c = W(
    () => new al(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      n?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, n]
  ), l = P(() => {
    i(null);
  }, []), f = P(
    async (u) => {
      if (t !== "authenticated")
        throw new Error("Must be authenticated to update profile");
      s(!0), i(null);
      try {
        return await c.updateProfile(u);
      } catch (m) {
        const p = m instanceof Error ? m : new Error("Failed to update profile");
        throw i(p), p;
      } finally {
        s(!1);
      }
    },
    [t, c]
  ), h = P(
    async (u) => {
      if (t !== "authenticated")
        throw new Error("Must be authenticated to change password");
      s(!0), i(null);
      try {
        await c.changePassword(u);
      } catch (m) {
        const p = m instanceof Error ? m : new Error("Failed to change password");
        throw i(p), p;
      } finally {
        s(!1);
      }
    },
    [t, c]
  );
  return {
    isLoading: o,
    error: a,
    updateProfile: f,
    changePassword: h,
    clearError: l
  };
}
function il() {
  const { config: e, _internal: t } = J(), [n, o] = x(!1), [s, a] = x(null), i = W(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), c = P(async () => {
    o(!0), a(null);
    try {
      return await i.get("/referral", {
        credentials: "include"
      });
    } catch (f) {
      const h = f instanceof Error ? f : new Error(String(f));
      throw a(h), h;
    } finally {
      o(!1);
    }
  }, [i]), l = P(async () => {
    o(!0), a(null);
    try {
      return (await i.post("/referral/regenerate", void 0, {
        credentials: "include"
      })).referralCode;
    } catch (f) {
      const h = f instanceof Error ? f : new Error(String(f));
      throw a(h), h;
    } finally {
      o(!1);
    }
  }, [i]);
  return { getReferral: c, regenerateCode: l, isLoading: n, error: s };
}
function cl(e) {
  return e?.name ? e.name.split(" ").map((t) => t[0]).join("").toUpperCase().slice(0, 2) : e?.email ? e.email[0].toUpperCase() : "?";
}
function Jd({
  onPasswordChange: e,
  onClose: t,
  className: n = ""
}) {
  const { user: o, refreshUser: s } = _t(), { config: a, _internal: i } = J(), { isLoading: c, error: l, changePassword: f, updateProfile: h, clearError: u } = Lt(), [m, p] = x("main"), [w, v] = x(""), [C, E] = x(""), [k, N] = x(""), [S, T] = x(null), [g, b] = x(null), [y, A] = x(!1), B = Q(null), [_, R] = x(o?.payoutWalletAddress ?? ""), [L, M] = x(!1), [U, I] = x(!1), [z, O] = x(null), $ = P(async () => {
    const q = _.trim();
    if (q.length > 0 && (q.length < 32 || q.length > 44)) {
      O("Invalid Solana address — must be 32–44 characters.");
      return;
    }
    const Ie = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (q.length > 0 && !Ie.test(q)) {
      O("Invalid Solana address — contains non-base58 characters.");
      return;
    }
    O(null), M(!0);
    try {
      await h({ payoutWalletAddress: q || void 0 }), await s(), I(!0), setTimeout(() => I(!1), 2e3);
    } catch (ce) {
      O(ce instanceof Error ? ce.message : "Failed to save payout wallet");
    } finally {
      M(!1);
    }
  }, [_, h, s]), { getReferral: D, regenerateCode: H, isLoading: K } = il(), [Y, Ae] = x(null), [Ce, ge] = x(0), [ue, Z] = x(!1), [ie, xe] = x(!1);
  F(() => {
    D().then((q) => {
      Ae(q.referralCode), ge(q.referralCount), xe(q.directPayoutEnabled);
    }).catch(() => {
    });
  }, []);
  const Se = Tr(C), Ze = C === k, Ue = w.length > 0 && C.length > 0 && k.length > 0 && Se.isValid && Ze, De = P(
    async (q) => {
      const Ie = q.target.files?.[0];
      if (Ie) {
        T(null), A(!0);
        try {
          const ce = new FormData();
          ce.append("file", Ie);
          const rt = i?.getAccessToken?.(), nt = {};
          rt && (nt.Authorization = `Bearer ${rt}`);
          const _e = await fetch(`${a.serverUrl}/auth/upload/avatar`, {
            method: "POST",
            headers: nt,
            body: ce,
            credentials: "include"
          });
          if (!_e.ok) {
            const Je = await _e.json().catch(() => null);
            throw new Error(Je?.message || Je?.error || `Upload failed (${_e.status})`);
          }
          await s();
        } catch (ce) {
          T(ce instanceof Error ? ce.message : "Failed to upload avatar");
        } finally {
          A(!1), B.current && (B.current.value = "");
        }
      }
    },
    [a.serverUrl, i, s]
  ), Pt = P(async () => {
    if (Ue) {
      T(null), b(null);
      try {
        await f({
          currentPassword: w,
          newPassword: C
        }), v(""), E(""), N(""), b("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => {
          p("main"), b(null);
        }, 2e3);
      } catch (q) {
        T(q instanceof Error ? q.message : "Failed to change password");
      }
    }
  }, [Ue, w, C, f, e]), Xe = P(() => {
    p("main"), v(""), E(""), N(""), T(null), u();
  }, [u]);
  return m === "change-password" ? /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (S || l) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      oe,
      {
        error: { code: "UNKNOWN_ERROR", message: S || l?.message || "" },
        onDismiss: () => {
          T(null), u();
        }
      }
    ) }),
    g && /* @__PURE__ */ d("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ r("span", { className: "cedros-profile-success-icon", children: "✓" }),
      g
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        pe,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: w,
          onChange: (q) => v(q.target.value),
          disabled: c,
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        pe,
        {
          label: "New password",
          placeholder: "Enter new password",
          value: C,
          onChange: (q) => E(q.target.value),
          disabled: c,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        pe,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: k,
          onChange: (q) => N(q.target.value),
          disabled: c,
          error: k.length > 0 && !Ze ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: Xe,
          disabled: c,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: Pt,
          disabled: c || !Ue,
          children: c ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(G, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ d("div", { className: "cedros-profile-header", children: [
      /* @__PURE__ */ d(
        "div",
        {
          className: "cedros-profile-avatar-container cedros-profile-avatar-container--clickable",
          onClick: () => B.current?.click(),
          role: "button",
          tabIndex: 0,
          onKeyDown: (q) => {
            (q.key === "Enter" || q.key === " ") && (q.preventDefault(), B.current?.click());
          },
          "aria-label": "Change profile picture",
          children: [
            y ? /* @__PURE__ */ r("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: /* @__PURE__ */ r(G, { size: "sm" }) }) : o?.picture ? /* @__PURE__ */ r(
              "img",
              {
                src: o.picture,
                alt: o.name || "Profile",
                className: "cedros-profile-avatar"
              }
            ) : /* @__PURE__ */ r("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: cl(o) }),
            /* @__PURE__ */ r("div", { className: "cedros-profile-avatar-overlay", children: /* @__PURE__ */ d("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ r("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
              /* @__PURE__ */ r("circle", { cx: "12", cy: "13", r: "4" })
            ] }) }),
            /* @__PURE__ */ r(
              "input",
              {
                ref: B,
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
            onClick: () => p("change-password"),
            children: "Change"
          }
        )
      ] })
    ] }),
    Y && /* @__PURE__ */ d("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-profile-section-title", children: "Referral" }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ d("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-label", children: "Your code" }),
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-value cedros-profile-row-value--mono", children: Y })
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => {
              navigator.clipboard.writeText(Y), Z(!0), setTimeout(() => Z(!1), 2e3);
            },
            children: ue ? "Copied" : "Copy"
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-row", children: [
        /* @__PURE__ */ d("div", { className: "cedros-profile-row-content", children: [
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-label", children: "Referrals" }),
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-value", children: Ce })
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: async () => {
              try {
                const q = await H();
                Ae(q);
              } catch {
              }
            },
            disabled: K,
            children: K ? "Regenerating..." : "Regenerate"
          }
        )
      ] })
    ] }),
    ie && /* @__PURE__ */ d("div", { className: "cedros-profile-section", children: [
      /* @__PURE__ */ r("h4", { className: "cedros-profile-section-title", children: "Payout wallet" }),
      /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Solana wallet address to receive direct referral payouts when enabled by the platform." }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-row cedros-profile-row--column", children: [
        /* @__PURE__ */ r(
          "input",
          {
            type: "text",
            className: "cedros-input",
            placeholder: "Solana wallet address (base58)",
            value: _,
            onChange: (q) => {
              R(q.target.value), O(null);
            },
            disabled: L,
            maxLength: 44
          }
        ),
        z && /* @__PURE__ */ r("span", { className: "cedros-profile-error-text", children: z }),
        U && /* @__PURE__ */ r("span", { className: "cedros-profile-success-text", children: "Saved." })
      ] }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-actions", children: /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: $,
          disabled: L,
          children: L ? "Saving..." : "Save wallet"
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
class ll {
  client;
  constructor(t, n, o, s) {
    this.client = new ne({ baseUrl: t, timeoutMs: n, retryAttempts: o, getAccessToken: s });
  }
  /**
   * List all credentials linked to the current user
   */
  async listCredentials() {
    try {
      return (await this.client.get("/credentials")).credentials;
    } catch (t) {
      throw V(t, "Failed to list credentials");
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
      throw V(n, "Failed to unlink credential");
    }
  }
}
function Js() {
  const { config: e, authState: t, _internal: n } = J(), [o, s] = x([]), [a, i] = x(!1), [c, l] = x(null), f = W(
    () => new ll(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      n?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, n]
  ), h = P(() => {
    l(null);
  }, []), u = P(async () => {
    if (t !== "authenticated") {
      s([]);
      return;
    }
    i(!0), l(null);
    try {
      const p = await f.listCredentials();
      s(p);
    } catch (p) {
      l(p);
    } finally {
      i(!1);
    }
  }, [t, f]);
  F(() => {
    t === "authenticated" ? u() : s([]);
  }, [t, u]);
  const m = P(
    async (p) => {
      i(!0), l(null);
      try {
        await f.unlinkCredential(p), await u();
      } catch (w) {
        throw l(w), w;
      } finally {
        i(!1);
      }
    },
    [f, u]
  );
  return {
    credentials: o,
    isLoading: a,
    error: c,
    fetchCredentials: u,
    unlinkCredential: m,
    clearError: h
  };
}
function dl({
  onPasswordChange: e,
  onCancel: t,
  className: n = ""
}) {
  const { isLoading: o, error: s, changePassword: a, clearError: i } = Lt(), [c, l] = x(""), [f, h] = x(""), [u, m] = x(""), [p, w] = x(null), [v, C] = x(null), E = Tr(f), k = f === u, N = c.length > 0 && f.length > 0 && u.length > 0 && E.isValid && k, S = P(async () => {
    if (N) {
      w(null), C(null);
      try {
        await a({ currentPassword: c, newPassword: f }), l(""), h(""), m(""), C("Password changed successfully. Other sessions have been logged out."), e?.(), setTimeout(() => t(), 2e3);
      } catch (g) {
        w(g instanceof Error ? g.message : "Failed to change password");
      }
    }
  }, [N, c, f, a, e, t]), T = P(() => {
    w(null), i(), t();
  }, [i, t]);
  return /* @__PURE__ */ r("div", { className: `cedros-profile-settings ${n}`, children: /* @__PURE__ */ d("div", { className: "cedros-profile-panel", children: [
    /* @__PURE__ */ r("h3", { className: "cedros-profile-title", children: "Change password" }),
    /* @__PURE__ */ r("p", { className: "cedros-profile-description", children: "Enter your current password and choose a new one. This will log you out of other devices." }),
    (p || s) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      oe,
      {
        error: { code: "UNKNOWN_ERROR", message: p || s?.message || "" },
        onDismiss: () => {
          w(null), i();
        }
      }
    ) }),
    v && /* @__PURE__ */ d("div", { className: "cedros-profile-success", children: [
      /* @__PURE__ */ r("span", { className: "cedros-profile-success-icon", children: "✓" }),
      v
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-form", children: [
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        pe,
        {
          label: "Current password",
          placeholder: "Enter your current password",
          value: c,
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
          value: f,
          onChange: (g) => h(g.target.value),
          disabled: o,
          showStrengthMeter: !0
        }
      ) }),
      /* @__PURE__ */ r("div", { className: "cedros-profile-field", children: /* @__PURE__ */ r(
        pe,
        {
          label: "Confirm new password",
          placeholder: "Confirm new password",
          value: u,
          onChange: (g) => m(g.target.value),
          disabled: o,
          error: u.length > 0 && !k ? "Passwords do not match" : void 0
        }
      ) })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-profile-actions", children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-md",
          onClick: T,
          disabled: o,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-md",
          onClick: S,
          disabled: o || !N,
          children: o ? /* @__PURE__ */ d(X, { children: [
            /* @__PURE__ */ r(G, { size: "sm" }),
            /* @__PURE__ */ r("span", { children: "Changing..." })
          ] }) : "Change password"
        }
      )
    ] })
  ] }) });
}
function ul({ onPasswordChange: e, className: t = "" }) {
  const { user: n, refreshUser: o } = _t(), { isLoading: s, error: a, updateProfile: i, clearError: c } = Lt(), { credentials: l } = Js(), {
    forgotPassword: f,
    isLoading: h,
    isSuccess: u,
    reset: m
  } = zo(), p = l.some((A) => A.credentialType === "password"), [w, v] = x("view"), [C, E] = x(""), [k, N] = x(null), S = () => n?.name ? n.name.split(" ").map((A) => A[0]).join("").toUpperCase().slice(0, 2) : n?.email ? n.email[0].toUpperCase() : "?", T = P(() => {
    E(n?.name || ""), v("edit"), N(null);
  }, [n?.name]), g = P(async () => {
    const A = C.trim();
    if (A) {
      N(null);
      try {
        await i({ name: A }), await o(), v("view");
      } catch (B) {
        N(B instanceof Error ? B.message : "Failed to update name");
      }
    }
  }, [C, i, o]), b = P(() => {
    v("view"), E(""), N(null), c();
  }, [c]), y = async () => {
    if (n?.email) {
      N(null);
      try {
        await f(n.email);
      } catch (A) {
        N(A instanceof Error ? A.message : "Failed to send password setup email");
      }
    }
  };
  return w === "change-password" ? /* @__PURE__ */ r(
    dl,
    {
      onPasswordChange: e,
      onCancel: () => v("view"),
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
      ) : /* @__PURE__ */ r("div", { className: "cedros-profile-avatar cedros-profile-avatar-fallback", children: S() }) }),
      /* @__PURE__ */ d("div", { className: "cedros-profile-info", children: [
        w === "edit" ? /* @__PURE__ */ d("div", { className: "cedros-profile-name-edit", children: [
          /* @__PURE__ */ r(
            "input",
            {
              type: "text",
              className: "cedros-input",
              value: C,
              onChange: (A) => E(A.target.value),
              disabled: s,
              autoFocus: !0,
              onKeyDown: (A) => {
                A.key === "Enter" && g(), A.key === "Escape" && b();
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
                disabled: s || !C.trim(),
                children: s ? /* @__PURE__ */ r(G, { size: "sm" }) : "Save"
              }
            ),
            /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                className: "cedros-button cedros-button-outline cedros-button-sm",
                onClick: b,
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
              onClick: T,
              title: "Edit name",
              "aria-label": "Edit name",
              children: /* @__PURE__ */ r(hl, {})
            }
          )
        ] }),
        /* @__PURE__ */ r("p", { className: "cedros-profile-email", children: n?.email })
      ] })
    ] }),
    (k || a) && /* @__PURE__ */ r("div", { className: "cedros-profile-error", children: /* @__PURE__ */ r(
      oe,
      {
        error: { code: "UNKNOWN_ERROR", message: k || a?.message || "" },
        onDismiss: () => {
          N(null), c();
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
          /* @__PURE__ */ r("span", { className: "cedros-profile-row-value", children: p ? "••••••••" : "Not set" })
        ] }),
        p ? /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: () => {
              v("change-password"), N(null);
            },
            children: "Change"
          }
        ) : u ? /* @__PURE__ */ d("span", { className: "cedros-profile-row-sent", children: [
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
            onClick: y,
            disabled: h,
            children: h ? /* @__PURE__ */ r(G, { size: "sm" }) : "Add password"
          }
        )
      ] })
    ] })
  ] }) });
}
function hl() {
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
const eo = {
  password: "Email & Password",
  oauth_google: "Google",
  oauth_apple: "Apple",
  solana: "Solana Wallet",
  webauthn_passkey: "Passkey",
  webauthn_security_key: "Security Key",
  totp: "Authenticator App (2FA)",
  sso_oidc: "Single Sign-On"
};
function fl({
  onLinkGoogle: e,
  onLinkApple: t,
  onAddPasskey: n,
  onLinkSolana: o,
  className: s = ""
}) {
  const { credentials: a, isLoading: i, error: c, unlinkCredential: l, clearError: f, fetchCredentials: h } = Js(), { registerPasskey: u, isSupported: m } = Wo(), [p, w] = x(null), [v, C] = x(!1), E = P(async () => {
    if (n) {
      n();
      return;
    }
    C(!0);
    try {
      await u(), await h();
    } catch {
    } finally {
      C(!1);
    }
  }, [n, u, h]), k = P(
    async (A) => {
      const B = A.label || eo[A.credentialType];
      if (window.confirm(
        `Remove "${B}" as a sign-in method? You won't be able to sign in with it anymore.`
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
  ), N = new Set(a.map((A) => A.credentialType)), S = e && !N.has("oauth_google"), T = t && !N.has("oauth_apple"), g = (n || m) && !N.has("webauthn_passkey"), b = o && !N.has("solana"), y = S || T || g || b;
  return i && a.length === 0 ? /* @__PURE__ */ d("div", { className: `cedros-linked-accounts ${s}`, children: [
    /* @__PURE__ */ r(G, {}),
    /* @__PURE__ */ r("span", { children: "Loading linked accounts..." })
  ] }) : /* @__PURE__ */ d("div", { className: `cedros-linked-accounts ${s}`, children: [
    c && /* @__PURE__ */ r(
      oe,
      {
        error: { code: "UNKNOWN_ERROR", message: c.message },
        onDismiss: f
      }
    ),
    a.length === 0 && !i && /* @__PURE__ */ r("p", { className: "cedros-linked-accounts-empty", children: "No linked sign-in methods found." }),
    a.length > 0 && /* @__PURE__ */ r("ul", { className: "cedros-linked-credential-list", children: a.map((A) => /* @__PURE__ */ r(
      ml,
      {
        credential: A,
        isUnlinking: p === A.id,
        onUnlink: k
      },
      A.id
    )) }),
    y && /* @__PURE__ */ d("div", { className: "cedros-linked-add", children: [
      /* @__PURE__ */ r("p", { className: "cedros-linked-add-label", children: "Link a new sign-in method" }),
      /* @__PURE__ */ d("div", { className: "cedros-linked-add-buttons", children: [
        S && /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: e,
            children: [
              /* @__PURE__ */ r(to, {}),
              " Google"
            ]
          }
        ),
        T && /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: t,
            children: [
              /* @__PURE__ */ r(ro, {}),
              " Apple"
            ]
          }
        ),
        g && /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: E,
            disabled: v,
            children: v ? /* @__PURE__ */ r(G, { size: "sm" }) : /* @__PURE__ */ d(X, { children: [
              /* @__PURE__ */ r(_r, {}),
              " Passkey"
            ] })
          }
        ),
        b && /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline cedros-button-sm",
            onClick: o,
            children: [
              /* @__PURE__ */ r(no, {}),
              " Solana"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function ml({
  credential: e,
  isUnlinking: t,
  onUnlink: n
}) {
  const o = e.label || eo[e.credentialType], s = pl[e.credentialType] || gl;
  return /* @__PURE__ */ d("li", { className: "cedros-linked-credential", children: [
    /* @__PURE__ */ r("div", { className: "cedros-linked-credential__icon", children: /* @__PURE__ */ r(s, {}) }),
    /* @__PURE__ */ d("div", { className: "cedros-linked-credential__info", children: [
      /* @__PURE__ */ r("span", { className: "cedros-linked-credential__name", children: o }),
      /* @__PURE__ */ d("span", { className: "cedros-linked-credential__meta", children: [
        "Added ",
        Yn(e.createdAt),
        e.lastUsedAt && /* @__PURE__ */ d(X, { children: [
          " · Last used ",
          Yn(e.lastUsedAt)
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
        children: t ? /* @__PURE__ */ r(G, { size: "sm" }) : "Remove"
      }
    ) })
  ] });
}
function Yn(e) {
  const t = new Date(e), o = (/* @__PURE__ */ new Date()).getTime() - t.getTime(), s = Math.floor(o / (1e3 * 60)), a = Math.floor(o / (1e3 * 60 * 60)), i = Math.floor(o / (1e3 * 60 * 60 * 24));
  return s < 1 ? "just now" : s < 60 ? `${s}m ago` : a < 24 ? `${a}h ago` : i < 30 ? `${i}d ago` : t.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" });
}
const pl = {
  password: wl,
  oauth_google: to,
  oauth_apple: ro,
  solana: no,
  webauthn_passkey: _r,
  webauthn_security_key: _r,
  totp: yl,
  sso_oidc: bl
};
function gl() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M12 8v4m0 4h.01", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function wl() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M7 11V7a5 5 0 0110 0v4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ r("circle", { cx: "12", cy: "16", r: "1.5", fill: "currentColor" })
  ] });
}
function to() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("path", { d: "M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 01-2 3.1v2.5h3.3c1.9-1.7 3-4.3 3-7.4z", fill: "#4285F4" }),
    /* @__PURE__ */ r("path", { d: "M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.5c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.4-4H3.2v2.6A10 10 0 0012 22z", fill: "#34A853" }),
    /* @__PURE__ */ r("path", { d: "M6.6 14.1a6 6 0 010-4.2V7.3H3.2a10 10 0 000 9.4l3.4-2.6z", fill: "#FBBC05" }),
    /* @__PURE__ */ r("path", { d: "M12 5.9c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10 10 0 0012 2 10 10 0 003.2 7.3l3.4 2.6C7.3 7.6 9.5 5.9 12 5.9z", fill: "#EA4335" })
  ] });
}
function ro() {
  return /* @__PURE__ */ r("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r(
    "path",
    {
      d: "M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.16 4.36 9.53 8.72 9.28c1.3.07 2.2.74 2.96.8.93-.2 1.82-.92 3.03-.83 1.47.12 2.57.72 3.28 1.83-3.02 1.8-2.3 5.75.5 6.86-.6 1.53-1.37 3.04-2.44 4.34zM12.03 9.2C11.88 7.17 13.5 5.5 15.4 5.35c.29 2.28-2.08 3.98-3.37 3.85z",
      fill: "currentColor"
    }
  ) });
}
function no() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "2", y: "6", width: "20", height: "14", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M2 10h20", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("circle", { cx: "17", cy: "14", r: "1.5", fill: "currentColor" })
  ] });
}
function _r() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("circle", { cx: "10", cy: "7", r: "4", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M3 21v-2a7 7 0 017-7", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ r("path", { d: "M17 14v4m0 0v2m0-2h-2m2 0h2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function yl() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("path", { d: "M9 12h6M12 9v6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function bl() {
  return /* @__PURE__ */ d("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
    /* @__PURE__ */ r("rect", { x: "3", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "13", y: "3", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "3", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" }),
    /* @__PURE__ */ r("rect", { x: "13", y: "13", width: "8", height: "8", rx: "1", stroke: "currentColor", strokeWidth: "1.5" })
  ] });
}
const Al = "DELETE";
function vl() {
  const { config: e, logout: t } = J(), [n, o] = x(!1), [s, a] = x(null), i = W(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      retryAttempts: e.retryAttempts
    }),
    [e.serverUrl, e.requestTimeout, e.retryAttempts]
  ), c = W(
    () => `${e.serverUrl.replace(/\/$/, "")}/account-deletion`,
    [e.serverUrl]
  ), l = P(() => {
    a(null);
  }, []), f = P(
    async (u) => {
      o(!0), a(null);
      try {
        await i.post("/account-deletion/request", { email: u });
      } catch (m) {
        const p = V(
          m,
          "Unable to send the account deletion link. Please try again."
        );
        throw a(p), p;
      } finally {
        o(!1);
      }
    },
    [i]
  ), h = P(
    async (u = Al) => {
      o(!0), a(null);
      try {
        await i.post("/account-deletion/me", { confirmText: u }), await t().catch(() => {
        });
      } catch (m) {
        const p = V(
          m,
          "Unable to delete the account. Please review the requirements and try again."
        );
        throw a(p), p;
      } finally {
        o(!1);
      }
    },
    [i, t]
  );
  return {
    isLoading: n,
    error: s,
    accountDeletionUrl: c,
    requestDeletionEmail: f,
    deleteAccount: h,
    clearError: l
  };
}
const mr = "DELETE";
function Nl({
  onDeleted: e,
  className: t = ""
}) {
  const { deleteAccount: n, accountDeletionUrl: o, isLoading: s, error: a, clearError: i } = vl(), [c, l] = x(""), [f, h] = x(null), u = P(async () => {
    window.confirm(
      "This permanently removes your login profile and signs you out. Financial and audit records required by law may still be retained. Continue?"
    ) && (h(null), await n(c), h("Your account has been deleted."), e?.());
  }, [c, n, e]);
  return /* @__PURE__ */ d("section", { className: `cedros-account-delete ${t}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-account-delete-header", children: [
      /* @__PURE__ */ d("div", { children: [
        /* @__PURE__ */ r("h3", { className: "cedros-account-delete-title", children: "Delete account" }),
        /* @__PURE__ */ r("p", { className: "cedros-account-delete-description", children: "Remove this login profile from the app. Sessions, passkeys, MFA, API keys, and linked Apple credentials will be revoked." })
      ] }),
      /* @__PURE__ */ r(
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
    /* @__PURE__ */ r("div", { className: "cedros-warning-box cedros-account-delete-warning", children: /* @__PURE__ */ d("div", { className: "cedros-warning-content", children: [
      /* @__PURE__ */ r("strong", { children: "Before you continue" }),
      /* @__PURE__ */ d("p", { children: [
        "Type ",
        /* @__PURE__ */ r("code", { children: mr }),
        " to confirm. Organization ownership may need to be transferred first, and records required for financial or legal compliance may be retained in anonymized form."
      ] })
    ] }) }),
    a && /* @__PURE__ */ r(oe, { error: a, onDismiss: i }),
    f && /* @__PURE__ */ r("div", { className: "cedros-account-delete-success", children: f }),
    /* @__PURE__ */ r("label", { className: "cedros-label", htmlFor: "cedros-delete-account-confirm", children: "Confirmation text" }),
    /* @__PURE__ */ r(
      "input",
      {
        id: "cedros-delete-account-confirm",
        className: "cedros-input",
        type: "text",
        autoComplete: "off",
        spellCheck: !1,
        placeholder: mr,
        value: c,
        onChange: (m) => l(m.target.value),
        disabled: s
      }
    ),
    /* @__PURE__ */ r("p", { className: "cedros-account-delete-hint", children: "Use the hosted deletion portal if the user is already signed out and still needs the public deletion path required by Google Play." }),
    /* @__PURE__ */ r("div", { className: "cedros-account-delete-actions", children: /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-danger",
        onClick: () => {
          u();
        },
        disabled: s || c.trim() !== mr,
        children: s ? /* @__PURE__ */ d(X, { children: [
          /* @__PURE__ */ r(G, { size: "sm" }),
          /* @__PURE__ */ r("span", { children: "Deleting account..." })
        ] }) : "Delete account"
      }
    ) })
  ] });
}
class kl {
  client;
  constructor(t, n, o, s) {
    this.client = new ne({ baseUrl: t, timeoutMs: n, retryAttempts: o, getAccessToken: s });
  }
  /**
   * List all active sessions for the current user
   */
  async listSessions() {
    try {
      return (await this.client.get("/sessions")).sessions;
    } catch (t) {
      throw V(t, "Failed to list sessions");
    }
  }
  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions() {
    try {
      return await this.client.delete("/sessions");
    } catch (t) {
      throw V(t, "Failed to revoke sessions");
    }
  }
}
function El() {
  const { config: e, authState: t, _internal: n } = J(), [o, s] = x([]), [a, i] = x(!1), [c, l] = x(null), f = W(
    () => new kl(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      n?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, n]
  ), h = P(async () => {
    if (t !== "authenticated") {
      s([]);
      return;
    }
    i(!0), l(null);
    try {
      const p = await f.listSessions();
      s(p);
    } catch (p) {
      l(p);
    } finally {
      i(!1);
    }
  }, [t, f]);
  F(() => {
    t === "authenticated" ? h() : s([]);
  }, [t, h]);
  const u = P(async () => {
    i(!0), l(null);
    try {
      const p = await f.revokeAllSessions();
      return await h(), p;
    } catch (p) {
      throw l(p), p;
    } finally {
      i(!1);
    }
  }, [f, h]), m = W(() => o.filter((p) => !p.isCurrent).length, [o]);
  return {
    sessions: o,
    isLoading: a,
    error: c,
    fetchSessions: h,
    revokeAllSessions: u,
    otherSessionCount: m
  };
}
const Cl = {
  profile: "Profile",
  security: "Security",
  linked: "Linked Accounts"
}, xl = ["profile", "security", "linked"];
function eu({
  defaultTab: e = "profile",
  onClose: t,
  onPasswordChange: n,
  onTotpChange: o,
  onAccountDeleted: s,
  onLinkGoogle: a,
  onLinkApple: i,
  onAddPasskey: c,
  onLinkSolana: l,
  className: f = ""
}) {
  const [h, u] = x(e), { sessions: m, isLoading: p, error: w, revokeAllSessions: v } = El();
  return /* @__PURE__ */ d("div", { className: `cedros-account-settings ${f}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-account-tabs--line", role: "tablist", children: xl.map((C) => /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        role: "tab",
        "aria-selected": h === C,
        className: `cedros-account-tab ${h === C ? "cedros-account-tab-active" : ""}`,
        onClick: () => u(C),
        children: Cl[C]
      },
      C
    )) }),
    /* @__PURE__ */ d("div", { className: "cedros-account-tab-content", role: "tabpanel", children: [
      h === "profile" && /* @__PURE__ */ r(ul, { onPasswordChange: n }),
      h === "security" && /* @__PURE__ */ d("div", { className: "cedros-account-security", children: [
        /* @__PURE__ */ r(ol, { onStatusChange: o }),
        /* @__PURE__ */ r(
          Zi,
          {
            sessions: m,
            isLoading: p,
            error: w ?? void 0,
            onRevokeAll: async () => {
              await v();
            }
          }
        ),
        /* @__PURE__ */ r(Nl, { onDeleted: s })
      ] }),
      h === "linked" && /* @__PURE__ */ r(
        fl,
        {
          onLinkGoogle: a,
          onLinkApple: i,
          onAddPasskey: c,
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
function tu({ onComplete: e, className: t }) {
  return /* @__PURE__ */ d("div", { className: `cedros-mfa-setup-prompt ${t ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-mfa-setup-prompt__header", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-mfa-setup-prompt__title", children: "Two-factor authentication required" }),
      /* @__PURE__ */ r("p", { className: "cedros-mfa-setup-prompt__description", children: "Your administrator requires you to set up two-factor authentication before continuing. This adds an extra layer of security to your account." })
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-mfa-setup-prompt__body", children: /* @__PURE__ */ r(Xs, { onSuccess: e }) })
  ] });
}
function ru({
  onComplete: e,
  onSkip: t,
  className: n
}) {
  const { user: o } = _t(), { isLoading: s, error: a, updateProfile: i, clearError: c } = Lt(), [l, f] = x(o?.name ?? ""), h = P(
    async (m) => {
      m.preventDefault(), c();
      const p = l.trim();
      if (!p) {
        e?.();
        return;
      }
      try {
        await i({ name: p }), e?.();
      } catch {
      }
    },
    [l, i, c, e]
  ), u = l.trim().length > 0;
  return /* @__PURE__ */ d("div", { className: `cedros-complete-account ${n ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-complete-account__header", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-complete-account__title", children: "Complete Your Profile" }),
      /* @__PURE__ */ r("p", { className: "cedros-complete-account__description", children: "Please fill in your name to get started." })
    ] }),
    /* @__PURE__ */ d("form", { onSubmit: h, className: "cedros-complete-account__form", children: [
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
            onChange: (m) => f(m.target.value),
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
            disabled: s || !u,
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
function Sl() {
  const { config: e, _internal: t } = J(), [n, o] = x(!1), [s, a] = x(null), i = W(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), c = P(
    async (h) => await i.get(
      `/username/available?username=${encodeURIComponent(h)}`,
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
  }, [i]), f = P(
    async (h) => {
      o(!0), a(null);
      try {
        await i.patch("/me", { username: h });
      } catch (u) {
        const m = u instanceof Error ? u : new Error(String(u));
        throw a(m), m;
      } finally {
        o(!1);
      }
    },
    [i]
  );
  return { checkAvailability: c, getSuggestion: l, setUsername: f, isLoading: n, error: s };
}
function nu({
  onComplete: e,
  onSkip: t,
  className: n
}) {
  const { checkAvailability: o, getSuggestion: s, setUsername: a, isLoading: i, error: c } = Sl(), [l, f] = x(""), [h, u] = x("idle"), [m, p] = x(""), w = Q(null), v = Q(!0);
  F(() => (v.current = !0, s().then((N) => {
    v.current && N && (f(N), u("available"), p("Available"));
  }), () => {
    v.current = !1;
  }), [s]);
  const C = P(
    (N) => {
      const S = N.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (f(S), u("idle"), p(""), w.current && clearTimeout(w.current), S.length < 3) {
        S.length > 0 && (u("error"), p("At least 3 characters"));
        return;
      }
      u("checking"), w.current = setTimeout(async () => {
        try {
          const T = await o(S);
          if (!v.current) return;
          T.error ? (u("error"), p(T.error)) : T.available ? (u("available"), p("Available")) : (u("taken"), p("Already taken"), T.suggestion);
        } catch {
          if (!v.current) return;
          u("error"), p("Could not check availability");
        }
      }, 400);
    },
    [o]
  ), E = P(
    async (N) => {
      if (N.preventDefault(), !(h !== "available" || !l.trim()))
        try {
          await a(l.trim()), e?.();
        } catch {
        }
    },
    [l, h, a, e]
  ), k = h === "available" && !i;
  return /* @__PURE__ */ d("div", { className: `cedros-choose-username ${n ?? ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-choose-username__header", children: [
      /* @__PURE__ */ r("h2", { className: "cedros-choose-username__title", children: "Choose a Username" }),
      /* @__PURE__ */ r("p", { className: "cedros-choose-username__description", children: "Pick a unique handle for your account." })
    ] }),
    /* @__PURE__ */ d("form", { onSubmit: E, className: "cedros-choose-username__form", children: [
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
              onChange: (N) => C(N.target.value),
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
            className: `cedros-choose-username__status cedros-choose-username__status--${h}`,
            role: h === "error" || h === "taken" ? "alert" : void 0,
            children: h === "checking" ? "Checking..." : m
          }
        )
      ] }),
      c && /* @__PURE__ */ r("div", { className: "cedros-choose-username__error", role: "alert", children: c.message }),
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
function _l() {
  const e = Oe(), [t, n] = x(!1), [o, s] = x(null), a = W(() => e ? new ne({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), i = P(() => {
    s(null);
  }, []), c = P(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      if (!Number.isInteger(w) || w <= 0) {
        const v = new Error(
          `Invalid deposit amount: ${w}. Must be a positive integer (lamports).`
        );
        throw s(v.message), v;
      }
      n(!0), s(null);
      try {
        return await a.post("/deposit", {
          amount_lamports: w
        });
      } catch (v) {
        const C = V(v, "Failed to execute deposit");
        throw s(C.message), C;
      } finally {
        n(!1);
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
  ), f = P(async () => {
    if (!a)
      throw new Error("useDeposit must be used within a CedrosLoginProvider");
    n(!0), s(null);
    try {
      return await a.get("/deposit/config");
    } catch (w) {
      const v = V(w, "Failed to get deposit config");
      throw s(v.message), v;
    } finally {
      n(!1);
    }
  }, [a]), h = P(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const v = new URLSearchParams();
        w?.limit !== void 0 && v.set("limit", String(w.limit)), w?.offset !== void 0 && v.set("offset", String(w.offset));
        const C = v.toString(), E = C ? `/deposits?${C}` : "/deposits";
        return await a.get(E);
      } catch (v) {
        const C = V(v, "Failed to list deposits");
        throw s(C.message), C;
      } finally {
        n(!1);
      }
    },
    [a]
  ), u = P(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const v = new URLSearchParams({
          input_mint: w.inputMint,
          amount: String(w.amount),
          taker: w.taker
        });
        return await a.get(`/deposit/quote?${v}`);
      } catch (v) {
        const C = V(v, "Failed to get deposit quote");
        throw s(C.message), C;
      } finally {
        n(!1);
      }
    },
    [a]
  ), m = P(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        return await a.post("/deposit/public", w);
      } catch (v) {
        const C = V(v, "Failed to execute public deposit");
        throw s(C.message), C;
      } finally {
        n(!1);
      }
    },
    [a]
  ), p = P(
    async (w) => {
      if (!a)
        throw new Error("useDeposit must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        return await a.post("/deposit/micro", w);
      } catch (v) {
        const C = V(v, "Failed to execute micro deposit");
        throw s(C.message), C;
      } finally {
        n(!1);
      }
    },
    [a]
  );
  return {
    deposit: c,
    getQuote: u,
    publicDeposit: m,
    microDeposit: p,
    getStatus: l,
    getConfig: f,
    listDeposits: h,
    isLoading: t,
    error: o,
    clearError: i
  };
}
const qr = "data:image/webp;base64,UklGRkACAABXRUJQVlA4IDQCAACQDQCdASo8ADwAPjEWiUMiISEUBFQgAwSgB4Z/TeLt3XMAoQH23eph0gPMB+sn+M9tvngOsA9ADwgPg3/cH9sfZciikEBuA1AB+nf+84CUkAVvA2x4xvyobR+mBaYhjUv/ewHb4hTqOnP38rzsxZX2inOSciAA/v7uqvqGdpWcjjrfMDFaNHumTog38t3yor0kbjn631VsX61cAC749wWuAX74u/f/hpeDFqS/ci8E1g94wk9UVs7BHqtv7f/M9iT1u5ITJV0Gv6tE/CW5j/nVR6yExJ6JoDRDOWQ8zVpWH92r3Lnbnc4WJpOchbRT3H5rv//6PP+F//4ehLUlR/4tkRUKZu/yOa26+sywmY+Xc1X2lXMcUv7+eQ7+FBE7bhKc7htieBfH4eR134AVaILL7PWA2FjzAjfaP1Lgirqoq/ZooE8jVD/b4g3J3O3/TG/4ajHe6clnAI/4NdwrnHX0P/quBU03HqSsQ0qsEMAuhrH/jn+YtDzmjm8q/cGJ44qvi24Hn+G1kxz2XP2S/Gp7ri5cMlo+muuwBjyNJnnEcTt/5cRdYS2cbEBZtpINWj3PuC1EOsd/8cTepSpxODcJHLzktfC1PHW3Pgoh3J5PHjW3TCQ1Wlu/wP8e8OPfNm48BODGChioj3ezblqrOBV+cI+hLi7ReJdvBF/4jY+/Un0asuWnrA6kRNpgOeO8wyl4Ryhkrff+9R1SpyPYP+5T3EuWWLZaCn0bGzyk97S3VAAAAAA=", Bl = "data:image/webp;base64,UklGRmIEAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IIIDAADwDwCdASo8ADwAPm0qkUWkIqGWDVeYQAbEtgBOmZMBu+H816ov3b8R8R2g2FXtxdyh5s3+A60v0APLi9ktgGB/LZjWNAXqgpE6jfW0NF+P4xEhH2L7M+26iGwrTjjcQegyCZqxs+ifvZANjWd279diqZNKUrgOTVtjJGtW4IVtRhMECd5aWVgAAP7nDv3UY/8f1l//xTP/FM/8NU8c9g//sC3+bX/1HZXsNsM57VKG2LVf1a0KdncWO8uPo/Oh79m9ZqjJZwXfPXuvwkK+WDOl6+N8C2Ux6no/V/zkoucKK/JZek7MR5sS8TknXB+6BuVDXou9Rx4aUea2q2IzvLvFIujjKsVYLMab7j9zo48fhgm9YOtjmWuS0WZ4c+6ta0mr3xF4fcdAIFf6oXRSlqovOX0HUiMV//hXwSX1cfP5cLj8c7OTyT/4ce4olJARV95GoY8oF+2uU0blGul3ItlG7c2Hl2/uC6s2WZc7Zukwojx6ed8t97bZ68N1uzCLzPlG7BuYS17F19e0wXnc6vEl3q7ft0K7OEl7r8mY6Kh+Nt/5V/Lp68mFBjLem1JjvC371+lKwez4KCdXwNo2Z04FqyzGpFutY6YQ/r5Tfu7Oi+oNfN0R/W+D4aj1nqHhlqYJzpx2NK4mj0gJIXmX8EArelSQI8mV4Ux9MRPwC2PuZhLTjQZv+Vl4p0D8bSB+Z0rek3hS6G1r80fW3cn767Pz/bXanjVmm34wt1nQPqdJObrZ7vv2NWcEuQKj9d+V6DzeDrq0CtGNcanEB5MY9agi1E6BprEScTdfPXjBeMnPbpD+QO6P7IW4UZ9etCCHtX++S/fl5Iz5RzUr10ojRMw//35C0yTjSEhbe884dPwor64n//KByjUFEGsCPAAXPJp1+O+SiKfUaODq6ncjKayTHXjoXgM7XP1z4sBhIKJZJRiM7vGC/+v/Sk8/jbgZLZDAVz1vLou93y7Yd8hxcWM/BesxgWgeKvl8fjE/Ud8tQKp4425hWh66lzzwxa4J3ctA4/E50wX/eoBOgq0B7+7S6FK4wvPHSNgfh+vwSWIJsJLt/3yjBeb41RRyMDMZqFQTZPEdFpXp48ExEyDayZ6objbjTHoS5WQDnDQpRyqMNKfvd41nhEPdb/hxpzXeTIjWmfHHCT+CQYWXDqLehCh1cRyeYOBwsSlSw5PiquAbsgAARVhJRroAAABFeGlmAABJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAEgAAAABAAAASAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAPAAAAAOgBAABAAAAPAAAAAAAAAA=", Ll = "data:image/webp;base64,UklGRtgCAABXRUJQVlA4WAoAAAAIAAAAOwAAOwAAVlA4IPgBAABQCwCdASo8ADwAPm0wk0ekIqGhKBQMqIANiWkADPF3uV2D8VcQGk1mg+P36i9SLnZvYAQxszEWYzEwX1RVkqG/4BGbJgMSHqhKDFsjWsGfPPrvfef11goNmCDDlBJHVVD+8gAA/vu4q03kl+E7FpjtZ2gc8pQ619Hjv9NywoRZ6az43C1wcrRr/lWzJlJhLWMHN0MkVl1ueAf6Hn8StVzeUfMBXOKkgfe2msx7QWR5PnHW/5c6/35yrtWnrURc2q6UYlGin+v8C2dQqexkW6rX2EEijTI9eEQ46PWH3/59fM2AlMvvR2abaRk5XX7V1triQncRxvMfz5YmYDN+PY/ikcZUNaiFucKoUq5riv0eKCezuFNHecE11ojwJqWRSTWpalkz5autXp6vFS+FT1tWUsB/fs1CCOZxaA1vR1grOEaiuKe1RYm7e05psWtqbXLVmm1bA8Ly9PFkVdCbc6hR3UuBBsFGnVeGOUeMn2onnfvYhBMcM9YPxGdQkwZLXOk1VuQSTk01Shf3fZrFyRlFauftFdPYhKXwqrr+meav1P+KLKBVosqmHnFFfgExsQ/rOf3TSd+mOqQfJA+cF+HojNU7nmM3uDkoCBi+//Gqp+gPNNW8M4LFrol8rxE+7WsjqMgfwv1f+Nr25RtG1Wa/KkniRCAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Tl = "data:image/webp;base64,UklGRhYJAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSGICAAABkJz9nzon3/nNJGnBXRvBI0sDkR7slpRBaMDl5LByx7cEyBWHtWd+8/uiK/95uEfEBKBnFwRwk6Wjm89PW2Tj9OWNo7VxASQ4DDoIML9fbdLYpbFR21tykDAY8ZCLT9okqZrsD0uqJNl5sj6CIAPwDmdqRlNlz6o0vroE5/vlPObv0kyN/dVE3pmHd31xgt0P1MgBauTHLYjrg2DoClM0DtRi4kmA6ylgrMq2cuDaZm0CoQePyTqVhVTWJ+G7EozXqSyosj4K6cIhVBhZ2MjyMNy/BFcZWeDIE8g/PLaoLLRyF/4vgrlPTMVK/DQH+cPjGpUFV17/i6BEZeGVF+Dh4F/kUYGDR4nKDBPX4AX381Deh2C1Q8vB2F4CDqnMUrkPlPMpY+obLQ/j9+k1GjNNLB0z5hJ5fD0f5Y2XTLkkPn9Hy8X4vsGMW/xvt3JqvKflYnz3nCmXxJc3qLlEXj9mzOe4xJSLcW36Oy0P47cplKl5KMvAfj6HwFKbloOxswrBfWoOyvsQjzWmPErwcKhQi6d84eHgcSGPEgSA4Dq1aMpr8PjL3CemYiV+moP8AY9darGUW/D4u+CEsUiRVyH4p8NwmbE4kZUA9y8IRuvUoijr4xB06zFZpxZDWZ+ER/cBEzW2dXDaZnUMAb06hBOmaIOxmHhlCILenWDrI6MOIio/7kIc+uk85u+SSftkasZ78/AOffYOl17RqNqbqtFqZ+A8+i8BI+tPOiRNNdkfllSNZPvJRYEXDDQI3NJerUFjl8ZmbX8ekIBBuyCAjK8d3Xh52iBbp89vHl2ecIAEh54BVlA4IMwFAADQGwCdASo8ADwAPm0qkkYkIiGhLhtqqIANiWwAqSdaNo+beZFT37f+J9yXOd2J6HfQh5gH6edIDzAfst6vXoO9AD/Lf4DrAP2V9gDzY/+57F39p/3/7k+0RmjvYp/meic9ieyvJnZVfquF/a23ZOCHGT/sfDDjQ89zOL9Gewd+s3Vh/b32Gf28Ejb5ttLg9hoDiFb2tMW81eZU9Z1LHfdRSCsRMzHz0WT4BNgUakGf9oJtrGtVJFxHJfxAatIxnW1qjDi9i3DQtJp9pVNKlMoJEWdPKv3KaaFSlhd/aMGiir9CPcex5QAA+fpjxA6zfUamE3wS2zWwLVrt/fXA5+Wvx9j5SID0zuEHU2LisPUxvtRuIUwNrsUis8zy+IMpzft+ZSg+9gdx9e6+ZvPmtj4OByz5qo26J3rXhPy8LBXSpuPb+f+mP4CoTvYDhzQXh/SIGj8Ez1+W5MJ/Tkdw09wPCs3JuR3yoqO63FH/j81xW5Abr7tCdwfXwv3CXDtOcHwUqPCd1aiU2uT6XwgdnYqYygEXGKFx8nmaUvqSn9p8HmIA9dVTOoEnqYFjrNfWY034N2vjohd16cxnkP4PYvHkIOWa/FEUug7/qbJ/GFLPxNh6y9eQ//MzzXbcPwsT2chWXPBXNVF1S9dxv5NUuEueiw2kdebblQuvUSRLN+zx3VyT2lOzWBUqrzsTmeOlxjVcTA83H99r35O4X7WXNq7HExiWXxrdM/Ih4CvPJaEHPxUE/i6WIz6+VGq4RB3sBKl3P4M7/DLWAwCnwcpX228XezqQ4cS2tttWxLTc9cPd1ofek9qF9lpB8RvakdPnj2PruFA9W3iKbNdmgnb+mIpohHuUR73KdDDOHbyfAiOjPzzqomnIU3jcSt7LKOB/Op97sCk0yd18mVG3prs351B+xmCE2Zd3RFKL+mpMz5qcuAFAfRyodbggdgmFGkEGQ33VryYFl/upr31FGdI52sqzuxd7jZIsqCcznUH/gu+xaBw7wla49EmFNf+Ss+91i9Hsys0FS//Ktru1xWgkeEweX77y6Oot5tHQsDxgy0sAI85V7FmlpiiWXQdM12MGfCBfyRM+N23SjOdReeSILYCgsM3r33/54X+lfDVNj427MvbDFtKccqazlQ+iKqC//MvYwqyiJPL1ZbVoCEP774fKZA3D3qvsVPGlp9LPchpTs4mTJugt8qXl82RwXQCDNZXnbEois53E35hkRr+IJhndoRo1o2sZDoTgykbeOKiynPH03+BcUQ8zmxTmiVlHQym/LL3kRREnUlxs2zPPGb2E+Rpdib+LxOvFSmj9RfTZoYIJnrqNnBIXV2lt7xeZ0srf98JymJxrtr8lx69oSNZIReDddL+3iiUjh6lm7EcYuclqBaKp8q68geo7H1EvKy4nSRx5Q+uz4l/ypo2hVdwi9l+BHjZZmJ7lXkpNTRJ0gZpzquzN2vh/MZQALV6FZ6q4aofA9AJy1DVLdNjV8n6s9eFA5pazxwhLW4tgWMciGf5x6G7HqFPTL1ZL3l447zLGUkqAXjkeVaNmxZ2oNKIuTy6JDc0Z61Z2dgbsg6HwCX1/ux5sk82WsnNIO4CTnWKI1aCtQZaEsBf6hIl9n7VBsgZGIcPpqn7P4mbyf3EbfdfQ32qlawLuAxmDlwRsVsPkw7j4aKbvIBykNcsVXv0/X6UXXaAtw3feJnTwDak2qY6QpMLE9e7PJeuQQ8FXpqI5HoR82kd+DOwGH5F3OpuWsmEt8v7WQG8q1LMkg6vrl3I8047zMl1Yq0VwotbrsKJocsHgsbs/PGOO9v2s8U0Sju/71XRtG5skcy2msae3wixjlGR4i6ZfldMehQD1zf/FbWN9hnHfpq1Fh8+PSA9AzUi33qli8ixISbH+tw7CcumxvegMk88HMNZlVdnIEzIfyHrSdZ2S98yX2OYZw0+JyaBbQxI0fOr6KpuMD6FVGLrdN9dgOTgOPQgAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Pl = "data:image/webp;base64,UklGRo4EAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSA4CAAABkGXb2to2V9/v6D1Jmd5CQ5GXPYXAJMrtPOJMoMzMzDgIPYY5+vVds6T/m0BEOGzAtm1IBlR2d8kXUMyaADjeuHr9V7qj3E5/XrvaOA5AHCqzFgHTFz9tUTmEyq1PF6cBqVWDOLjkwS6VPsu8KqnaewRU7j5KIjipgFiQfCf1IGch8wMlv9QhcWk4nLlL9Z4l6b3y7hmUvGQkmF1nnrMC85zrc5CozDUQtwamisNSDCmxjL5jpqxMzfhutFCCY3+5110CaI9/jhVIcPg/DxiIB/x/eKgijLxkRobTyxFEw7zVm0NqcYg5LNAzKD3n4QbmyRVqWCiXJyD9uN7z0Ha9Dw4N5gzOnHU4IMJ7egt8HuYWasIJnlg46fkYgul9qgWU+9PA2Z7b2FngnR3e49Qm1QbKzVPNnltZ8wozK2S8et0SN34wt0LOnynVCsp02xI7tKSqqXYsV7ZtD/lpeaEfNyw/k9evWuKK7XfQ9ruP9/RW/s74t872N1bw2MY8n0Acmlb/KQ04AJ8t5PkeEbpDnbmR2/5392FiOfRFlCuTkIGsMh/aPBeGZFLBYuiM1IIUZLOD0NnMNBMWZdE/4bLo32MQ0wxcJnsvhcnerRhSLvPPhcj8s5DIsmtU6Tj1L1U6zvcEElfrVlHyqGy3epC4om5Vsg3OlO50UQ2V6Qa65LWf6TZ1J/11faBLlpgAVlA4IJgBAADwCQCdASo8ADwAPm0ylEckIyIhKAoAgA2JaQATzh4OcBkEByVmbl5z9gD9U/+J2APQgLaX4twLu19/UVxAWN1IKXE4cIqJBhoyQ0yDYn61m3zk6T7FMg0AAP78+EMvGgC8jLXmcbbmqvufKjG8Tv1M9Krl47vOW74O/Rapv2DgXbg9iK6PrRQG/9d9+rF/ESxzbszVFn3GThrMBmsklj/LPWDQ0pKzG7EyjQL6p6gfUwMze+wPhzJpn8tMqlUVgq6/QSUVcgG+ztsi73rA3vl3n4baeF1INsbuosTXtnsotVYuTii6rscx9OUTvevYcPNvcL9MPhyWeCQw0qynnGtzCIw+oFRN0+TN1mqXkFyk/rFBcH+FHiI6s9XX5EWCKn5vTRt/0RbS687PiXPFC5Zk/Gk4+538IYi+HZDjvlQQWOH/vddfYTerQ5QqWJt1YuaZNThQ2u+/DtXfZPRy1iWWLR9SKFFtlGrqBKWF5nPRPWWMNA3OssvUtvCNBLBA4cn1whzy+SpbgLvnaepxiykjKsU/MhzgAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Rl = "data:image/webp;base64,UklGRqwEAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSL8BAAABkGvbtmlLc5997yvbmW19gBnbDm2kjF5UmW3bthXZVZFdZ+81r+87Z1XlEaHIbSNlMstwos4XUBSTLAFQo/u01Zdf/yLDDze3zB/YwADJEoOoJAKg7oTdH4SF+XxiZlMgSESzwAJdVn2iUJzzOUMiLhQKf+/va2FtBLMBuu1zpHcsincUXhtoTKLsCTVX/KF3wrLhPLm/OWzZtjQWfZ7RhYyAC/lxMowpSzJYJAyFkZDQc21FBMUT7BqGjpHxf3m+XlEPUHE/f3vGgPzmw4awRUaTexkyJhwfNShctVgZXyJDXq4CUyjNy6Y4fVOBIkAPR2GcOE7Jm2NQ/RE9YzXht3a5VYvlOX0xF0fy+tp/ozBuQg6DzZYb6Bi7ed4rB5Mp/1Co4cNhLUo1StLxDIDqrynUoRswiF6nFnIxsDpnZ5WBW0GFZ1qZ8HfLDk5txHHsGDpSa6B0cXZEa+DsTr1M+P4qPdXwjynU4+1/a7oN3Sm6G+meSd27oHsHde++7puj+tYpv7G6b7vun6L7l6n+oZp/t7JmUNUqqhpJV5upakJVLaqqgVW1t6rmV401NGMc1djqH4rpIseSfyPFkgAAVlA4IAQCAABQDACdASo8ADwAPm0yk0akIyGhJgzogA2JaQAThroHvLxu+aPf5G2BYxv+B6XHzx6GPon/o+qz/tOAA/TM82gR0vnExWoiQRM36jlg2UIvwCSqySErzuguz9EP2x/7hsNazr91aIworWI7AAD+/TZ+6Ipl444OdT+2wU0Ov+T8oJuVP/vUbT/w1Jsv6Awnl6rvF/xetfOPt3gTQZZi0Y/AOx563J7CJkqTR/fc/n34zyeKzR80fhfv4ef+Hjhz/CX5aQo+58zg/FdE+7bLoophGfG0szI513EH+q+Gc73H1PFdJYf7CF8v5dhr3tMwEVX5Ji2ZxejK8xrf/E6nVXqlA4DrYNRP09InHc+fEqO/fH8xr+rMf4y1F9TOnwVffZblLoTP6lot0m/sh7sTiDQr0mIA8TiHoOffGDG6KzV+B3239udfhzD740gkRi/m53abX0Ku3vAgadgFFqL0vk8M/4aI+cI+0fbLW17mWGeMu21wSRRQiv5iNgGKR3vEGXAItcLDft1uUzWAfbe1X3zK/ymT7bA/76PB6UUknm+Y5MM4osurUXU/k7P38pN/3slnGfpFzjl4c3USY4mH9ZCJYUuC/kGEnq/yRPalPdODNFvW6s8MiQeQejYNRY0LsJ0WXkK8vXiDmihCivYAOPoSovesL7on+WAArDNM/BcQSQvCYABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Ml = "data:image/webp;base64,UklGRnIIAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSK4BAAABkHPbtrE9+z73/RTbqWw7Lf+BbbNKbTudbZe2qy+VbVv3PmeHj05G6ohg4LaRounNMtN1voB42ABA5R7TNlx5+O7du9e3Tiwb0b4EgFyAOCQM1Z16+DWFUZC7m3uVB2zKQGBhe+77RGHonJffCL1zQuHDxQ1hrEmTatDjHIXOC2MgzpNf1tVJkWgsGhyihI7JIE74aUYp2ITFAoz9QO+ZAs7zanvkEilKbIkMJS5ANwoJmrCodYVOmBqh5zIEJjZc9xods4A4rrPGxGitrJSU71yNyH4Myl7JTEl+5zzYSH9nlkrxHBzxWUzLVEnhh+YI/gq3+UphpvA8m/s7/wg9M4bjFNg/0vplrxQ+rQEDg/xihmT23jxYJZ8UPq8OA5z77Wt405FDR4poSMjiAJhPRxUIu8D+UVonOhfNPEVHPM9juFacwo+1V6kJQ3Y9Sa8ljhPuUvRk4UdNWU9ST3b9n0W3iG5DumdS9y7o3kHVu6/75ii/dbpvrO7brvtPUf2X6f5DVf/dmpxBmauociRVbqbKCXW5qCoHVuXempxf1dZQtXFUbat/yKZTtSUBVlA4INwFAABwGgCdASo8ADwAPm0qj0WkIqEZ+zYAQAbEtgBOmZoZF+E8zGoP3X8VbcdLvma8t+jH0E+YB+ofSA8wH7VdQv0AP75/iOsG9ADy3/Y5/b/91fgI/Y7MOesb0e/q+TUR1vt7VO6mwG0imO70GM5/0P7BX6qelv7EP209lz9oDRea09ZR+SjhX7sBu/ZS7tG917rPgI3Q7XsB7luy2hAg/95C2Z1L362OH1oFziDY/K5gWoSytSAtiKvA/jW1MehBzdLzJfszPPBvGa15IYwIVRTjO2Hz5ZS9HjLMehwAAP64SgjD3qeg6NRe/Ok+iFhrG3pgglCfbam3yBaDUH36sUiQx0PB1ZZyOHq0ky+f97h6tJMvo0p9LkfXecWOFJ8J5G7yRPuL4tzGLT09QulTJw42xp2hd+lMgIa51XoHx/iftn8B2D3k92H5jOQr+uIXFHHK5FpcTG+qGEF+np0LiQa+vdW7/+ZzOLVRf7jR5X3ANPt93Ng92DW7NflVr6kMr88O/v2ZNb0vtgao2Am/R3CDKiNq89f86CT6r2L2g1oTui7H3E1yhSPQpEOz01I3fhfiMMv4weqKuoedxn/xLg5uzHa6Gte4C/dQYkG3ZFSy4CXQtRjftBrjX/Oj+HpSUPDsv0wPW+ml5NbBKDCj2f3SD8TVMf2ZfHrOkR602RVk2UmKC+H0Y9iK6k98vsgPINtz0II8X7Mj2nJkTC6IMLuQ8dNTUq9VXOnhXrdhNZoaH94ePo6baBl3hTGFAnD3/b+gR/vtbqV7wktuX6fpnjeTBe/Drp6z3neeANj/aX4CsU9w67nwYOjZhueCjxaDKUnNjLPjI1e0BoTbcOzOQ0wHJHZJ+Pt608StBu4HiJ8NjH46fnvXL3yiMoSvkAuwCE1AakA+eU1u3unyjl1/MnZQmbp8fzfsfrFesehLPcIkYdCiZ+52QbmINNTjEsvjuBuZRubBE+Laihppsxoo4efGIo0xkw0etu1+yzvkqp88w3pBq0mRl13gnnc+2zl6SmhwgmNFbz+F8qAqmdfJL8iaNSGEWlPlpczDDe62GBZMlBhQmq/XCn/1b+VazHvJXkoIFDF+wktMg+rKfLyfTlXdK0cs+Kn8h+rjMakkf3WLo1TftMLn+O+x/Gat+BGstJrM1xvCSSnHQY+NV4B4gRqyZ55gRNnqN/0lWrATOcHUaGXpkTIM/yxFjxcePcSFo+t2aJ5lShtVukETzRxaIXgRkpROeWQHWpTHOaexmXOzF0b833qJSoXMk2zB/uMrgDzKd7d3ohUz8Ra08WYKlAuMQD08bF4+jUepEspqPLoYLQ73TfmL+1LwKxyTV3gEu6WnxBPWPLnYIGYN9U47ZNlB+NgHgYtKTyii6060RAG+wN32WUVFxCZw0HMHnHFgwxD34L/anlpS7mOrjKgyuGYhFC7iHqTQHuoAO1ekBHV+rndnbETKfa1F7LxNLYq+dmJyytmQrJUCGjelorI1m/TMQNiFVrY4FCI1Gl2W1JsZsw9zA+Bh3JmjkC0H5/0JV6JotNMatJIZ4v5PqwJe3r8xd+FNS3ynccdu+xtVdc27qwVdoomciZD5oXYey9KAFSAKO594sBKZNWUJTLXnt0BJbdF8FkQYvg3DQajYY2p+ixd5Ag7o92gw0pVVDDOP+WQxiEmKqgWJyTBsnsBk2Bxi2Unsv8S/4PmE8Hy/vy+Mij+aTAKZvg716IHfHX0/JMeFfmAnsZ39Q0qkfdPtq6+CxbGZ7wKDsK/8l/MVGuyd6faJFt5wyoOXuNrr3JC9EoBmjcOzkVw/6RNP49poZ1xzsX3q7B4HGfI/XSfRQq3HeZ2j12d0E3gCAube4oExaT1sx/v8F+f61QOsGdSaqM2im6qOGkSRkrRQ7L8hvS8vEYJeVkAbFvX5ov7e/egYYNToMHj651c5/rCVYtB9Ned6GvGN8R0x3t7+lsf8+ofhHRzpyvwxd6c5pREZVOKnXzplhJ61mki4JmAAAABFWElGugAAAEV4aWYAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAATAgMAAQAAAAEAAABphwQAAQAAAGYAAAAAAAAASAAAAAEAAABIAAAAAQAAAAYAAJAHAAQAAAAwMjEwAZEHAAQAAAABAgMAAKAHAAQAAAAwMTAwAaADAAEAAAD//wAAAqAEAAEAAAA8AAAAA6AEAAEAAAA8AAAAAAAAAA==", Ul = "data:image/svg+xml,%3csvg%20width='88'%20height='88'%20viewBox='0%200%2088%2088'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='88'%20height='88'%20fill='url(%23paint0_linear_170_79)'/%3e%3crect%20x='25.6665'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='51.3335'%20y='25.6667'%20width='11'%20height='36.6667'%20rx='1.83333'%20fill='white'/%3e%3crect%20x='29.3335'%20y='40.3333'%20width='29.3333'%20height='7.33333'%20fill='white'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_170_79'%20x1='-75.3077'%20y1='-55'%20x2='146.302'%20y2='148.167'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23FF00FF'/%3e%3cstop%20offset='0.531673'%20stop-color='%237A84FF'/%3e%3cstop%20offset='1'%20stop-color='%2305FAFF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e", Dl = "data:image/webp;base64,UklGRh4HAABXRUJQVlA4WAoAAAAYAAAAOwAAOwAAQUxQSNwBAAABkFxbexpJnyR3z8y+ajXMkAnjnnOgbUUxEAHjkpldWQwzFUn6v3PGVNI/AUQEA7dt49gN3PXavTlfQDeNAeyqg4PL5buRyOhteXlwcJWtHU8qzUIBs+30g7/s4N8Hp7cZFAtpDc7Bbr8xplB8iFJBYvBC4fjGdgvnElqdwc6XFPGRnQxehC93wjgzbxRYf1UYA+dkiJSrG1DMV6zDoW+MkQmMkd8Owdl5AsvOM3gm0geeXwY7R/Tu0EcmM3re6cF2Rr/kTJiBMmPZh+2q/wtm4ozD9qrB0tucMhunvL0Upg1n6JmRnmda4HCckVkZeRyuMWjjF0peCD9vhK3jAgMzM/BCDQ576225m/bCwcA+qzS/PLUwDrsr1ZDdcAa3KtWQWzDYPKZoQDjeDJyoVEdOAPf0cA/Lf1F0IPy1fG8VWmXvgF4LnoOLDFoIvPiaUQuRr99pNr8dUZEj0YToQnfjreaQd7oL6T6Tuu+C7juo++6rfnOUv3W631jNb7v+P8U+1ZDAZxZG9R+q/e+GxcbPuRcRftkIq+pVVD2Srjdr94TDnJ6w7MGqedFhH1bVA6t67zk9/3ctzw+YAhvSc431KExyjjNHQ2zLcTRzq/8op0vKJd+OREbvUnJJAFZQOCBaBAAA8BUAnQEqPAA8AD5tMJRHJCMiISgb+1CADYlsAJ0zIUCfxfmY2f+0b2AbztDnPeKX0qPMp+wHrDehz0AP7J/o+tP9ADy3f23+C79yPYA/aqK9mONrQbuszbsEyALJNTfg+Z6NjG2v+ETCuvlr1q6QUqEiAMUndG/WwfnjJIOTfOBS4W1w0HjOJa1XQ2K33n2b07EOjOBapwKzyoA2erTBTnEKlFjllBy68GBjZ+UKnlzN/f5ibbb4gAD+i9OsnW0xUnmTpyhVasIKzTu0BsXnfBm4rHJqGMFJBUgTESDXEPcNjAeaHP8ck9qdNBH4L/h53tXgHeZttc7c4lwTa6U4Lziz8qUoy8ce0IMc5TFElawGj16tME0GzSSbUqgH7/tYA6huPsWM2z3GjP8b9y7paRbINxwYRtuE90I6QVsNrEkbhL1YfwxRXnuobOfSe3KFVamrvsOqwTCMqlNfjsR3pyoiZ+lYt3+AH6x4ZVNltbYI5KiVhgCu1isooK324ldloH3zhlefYKEwTCYfNjbeH5UiL7JSev+t/C+ftc3TkAHcsvrLCU6n5pYYY2Yr1kRq+r6XVzI6iXuA/TqwMk6xq1PmdzHOwKavncLjWJrk0uU/5E5WKqXM0tgl5s3pduHjb5aiAt0ikEisMyYwnIhDiSemPRdGON4RlwSb3OEpZjhuZqoyen4Sw/fULewt3hAZizeiPZx1o9LS3M/4r3v/M6/o5925VJcmxAf/yjsyjCz0mV+6NuIeWp8shrFaIGgeduVJoZ0Kys1WjSLuFg9QvF5LlkOZ2k7WrzSu4ucsUOS/X4wnQvB0RCnR1PCsU4NDdLfxvQITUgGIuVTJ7LR73PHzZam/Z21oy3euiU55ffITekwjR4SgVoPvhxbdBSyVePf/twm62pSK9IfgPGN+ttubhQub1ooVZymdQCrS3goEs6dlnl/6TVfkgxFyBfAORkZafeu/Va2vIgUBNUQd48W8oPiMFjx+SAKx1qm2IwCLnuhJGf9M4nCzu7oo43f+nBeT07IjB+FpFKRGFNvlpLEXhPclSgFkqeU1W2eNqW2zShCWkQkgfE1HAoNX3z+CQcRQJq+HkC2nSjFdFYT8UNYNS6lYcyVWzEnOos1qpsNRxnLqY2Dl5CCT3Yeg/qT8chfF9ZadFvzNTEIDlARoN//7IU23MtuLdpsAjsiGfBHuR7y4lemYPdD/9Cuff9Qn/r/xlhmB5x2Y9Z1yME3aANAb5+u3lYz01zUlWwakKVmv9fhaeu/YzQ7BXLlcb+cbaIF5t/COmObnt20zaTfjad542f7p7f2Xea134nvyPYS+EAgjM+GufHvl9tXCrrRbH0pn7kH2XEGx9VbO4mY54+QZa5kPr0j3AOEtKd7SJWjlg5TQfgIuB6KoLGainSwF+pPdiCmzEzAOa1eFwn//2VdDMeq42/bKH8U4orewhLh60ci/S0BRBuItNMc+v1+vxl0YyS5it4AAAEVYSUa6AAAARXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADwAAAADoAQAAQAAADwAAAAAAAAA", Il = "data:image/svg+xml,%3csvg%20width='868'%20height='868'%20viewBox='0%200%20868%20868'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='434'%20cy='434'%20r='434'%20fill='%231B262D'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M234.563%20184H640.697C650.387%20184%20659.339%20189.164%20664.172%20197.542L782.495%20402.657C788.631%20413.294%20786.808%20426.72%20778.056%20435.346L452.368%20756.327C441.818%20766.724%20424.846%20766.724%20414.296%20756.327L89.0484%20435.78C80.0927%20426.954%2078.4157%20413.136%2085.0013%20402.433L211.48%20196.884C216.405%20188.879%20225.146%20184%20234.563%20184ZM588.257%20275.577V333.129H472.567V373.032C553.82%20377.296%20614.782%20394.81%20615.234%20415.802L615.231%20459.563C614.779%20480.556%20553.82%20498.069%20472.567%20502.333V600.259H395.746V502.333C314.492%20498.069%20253.531%20480.555%20253.078%20459.563L253.081%20415.802C253.533%20394.81%20314.492%20377.296%20395.746%20373.032V333.129H280.055V275.577H588.257ZM434.156%20472.268C520.868%20472.268%20593.345%20457.459%20611.082%20437.683C596.041%20420.912%20541.636%20407.713%20472.567%20404.089V445.867C460.187%20446.516%20447.336%20446.858%20434.156%20446.858C420.976%20446.858%20408.125%20446.516%20395.746%20445.867V404.089C326.676%20407.713%20272.271%20420.912%20257.23%20437.683C274.968%20457.459%20347.444%20472.268%20434.156%20472.268Z'%20fill='%23009393'/%3e%3c/svg%3e";
function so(e) {
  const t = e.toUpperCase();
  return jr.find((o) => o.symbol === t)?.decimals ?? 6;
}
function Fl(e, t) {
  const n = e.toUpperCase(), s = jr.find((a) => a.symbol === n)?.decimals ?? t;
  return s === void 0 ? 2 : n === "SOL" ? 4 : s === 6 && n !== "SOL" ? 2 : s > 6 ? 6 : s;
}
const jr = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoUrl: qr
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "Circle USD",
    decimals: 6,
    logoUrl: Ml
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoUrl: Il
  },
  {
    mint: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    symbol: "EURC",
    name: "Circle Euro",
    decimals: 6,
    logoUrl: Tl
  },
  {
    mint: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    symbol: "USD1",
    name: "WLFI USD",
    decimals: 6,
    logoUrl: Dl
  },
  {
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logoUrl: Rl
  },
  {
    mint: "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    name: "Hubble USD",
    decimals: 6,
    logoUrl: Ul
  },
  {
    mint: "CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT",
    symbol: "CASH",
    name: "Stripe USD",
    decimals: 6,
    logoUrl: Ll
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoUrl: Bl
  },
  {
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp",
    symbol: "ORE",
    name: "Ore",
    decimals: 11,
    logoUrl: Pl
  }
], wt = 1e9, oo = 1e4, Qe = {
  mint: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoUrl: qr
}, Ct = {
  mint: "other",
  symbol: "OTHER",
  name: "Other",
  decimals: 6
}, zl = /* @__PURE__ */ new Set(["USDC", "USDT", "USD1", "PYUSD", "USDH", "CASH"]);
function Kn(e) {
  return e.map((t) => t.trim()).filter(Boolean);
}
function ao(e, t, n) {
  return e === "sol" ? "SOL" : e === "single-token" ? t.symbol : n.some((s) => s.symbol === "USDC") ? "SOL or USDC" : "SOL or supported tokens";
}
function Hr(e, t, n) {
  if (zl.has(e.symbol)) return 1;
  const o = t.tokenPrices?.[e.symbol];
  if (o && o > 0) return o;
  if (e.symbol === "SOL") return t.solPriceUsd || null;
  const s = n?.[e.symbol];
  return s && s > 0 ? s : null;
}
function io(e, t) {
  return e.toFixed(Fl(t));
}
function Wl(e) {
  return e.companyFeePercent > 0 || e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap" || e.feePolicy === "user_pays_privacy";
}
function Ol(e, t, n) {
  const { feePolicy: o, privacyFeePercent: s, swapFeePercent: a, companyFeePercent: i } = e;
  let c = i;
  return n || (o === "user_pays_all" ? (c += a, t && (c += s)) : o === "user_pays_privacy" && t ? c += s : o === "user_pays_swap" && (c += a)), c;
}
function ql(e, t) {
  const n = t < e.publicMinUsd, o = t >= e.privateMinUsd, s = [], a = !n && o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0), i = !n && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0), c = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  if (a) {
    const l = e.privacyFeeFixedLamports / wt, f = e.privacyFeePercent, h = l * e.solPriceUsd, u = t * (f / 100);
    s.push({ label: "Privacy", solAmount: l, percent: f, usdAmount: h + u });
  }
  if (i) {
    const l = e.swapFeeFixedLamports / wt, f = e.swapFeePercent, h = l * e.solPriceUsd, u = t * (f / 100);
    s.push({ label: "Swap", solAmount: l, percent: f, usdAmount: h + u });
  }
  if (c) {
    const l = e.companyFeeFixedLamports / wt, f = e.companyFeePercent, h = l * e.solPriceUsd, u = t * (f / 100);
    s.push({ label: "Service", solAmount: l, percent: f, usdAmount: h + u });
  }
  return s;
}
function co(e, t, n) {
  const o = ql(e, t), s = n === 0 ? 0 : n < 0.01 ? 0.01 : n;
  if (o.length === 0)
    return n === 0 ? "No fees" : `Total: $${s.toFixed(2)}`;
  const a = o.reduce((w, v) => w + v.solAmount, 0), i = o.reduce((w, v) => w + v.percent, 0), c = { fee: 7, sol: 8, rate: 7, usd: 8 }, l = (w) => {
    const v = w.label.padEnd(c.fee), C = w.solAmount.toFixed(4).padStart(6).padEnd(c.sol), E = (w.percent.toFixed(2) + "%").padStart(5).padEnd(c.rate), N = ("$" + (w.usdAmount === 0 ? 0 : Math.max(w.usdAmount, 0.01)).toFixed(2)).padEnd(c.usd);
    return `${v} │ ${C} │ ${E} │ ${N}`;
  }, f = `${"Fee".padEnd(c.fee)} │ ${"SOL".padEnd(c.sol)} │ ${"+ Rate".padEnd(c.rate)} │ ${"= Total".padEnd(c.usd)}`, h = `${"─".repeat(c.fee)}─┼─${"─".repeat(c.sol)}─┼─${"─".repeat(c.rate)}─┼─${"─".repeat(c.usd)}`, u = ("$" + s.toFixed(2)).padEnd(c.usd), m = `${"TOTAL".padEnd(c.fee)} │ ${a.toFixed(4).padStart(6).padEnd(c.sol)} │ ${(i.toFixed(2) + "%").padStart(5).padEnd(c.rate)} │ ${u}`;
  return [f, h, ...o.map(l), h, m].join(`
`);
}
function jl(e) {
  const t = e.privacyFeeFixedLamports > 0 || e.privacyFeePercent > 0, n = e.swapFeeFixedLamports > 0 || e.swapFeePercent > 0, o = e.companyFeeFixedLamports > 0 || e.companyFeePercent > 0;
  return !t && !n && !o ? "No processing fees apply to deposits." : "A small fee may apply. We'll show exact totals before you confirm.";
}
function Tt(e, t) {
  if (t <= 0) return 0;
  const n = t < e.publicMinUsd, o = t >= e.privateMinUsd, s = Ol(e, o, n);
  let a = e.companyFeeFixedLamports;
  n || (o && (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_privacy") && (a += e.privacyFeeFixedLamports), (e.feePolicy === "user_pays_all" || e.feePolicy === "user_pays_swap") && (a += e.swapFeeFixedLamports));
  const i = a / wt * e.solPriceUsd, c = t * (s / 100);
  return i + c;
}
function Hl({
  step: e,
  sessionId: t,
  demoMode: n,
  demoAutoConfirmMs: o,
  depositMethod: s,
  depositAddress: a,
  receiveAmountUsd: i,
  selectedToken: c,
  currencyMode: l,
  config: f,
  solanaPubkey: h,
  pollInterval: u,
  getStatus: m,
  onSuccess: p,
  setResult: w,
  setStep: v,
  setFlowError: C
}) {
  F(() => {
    if (!(e === "confirm" || e === "show-address" || e === "waiting") || !t || n) return;
    let k = !1, N = 0, S = 0;
    const T = 360, g = 5, b = async () => {
      if (!(k || N >= T)) {
        N++;
        try {
          const y = await m(t);
          if (S = 0, y.status === "completed" || y.status === "detected") {
            const A = y.amountLamports ? y.amountLamports / Math.pow(10, c.decimals) : 0, B = y.amountLamports || 0, _ = {
              token: l === "sol" ? null : c,
              amount: A,
              amountSmallestUnit: B,
              txSignature: y.txSignature || "",
              sessionId: t,
              response: y,
              method: "receive",
              depositAddress: h ?? void 0
            };
            w(_), v("success"), p?.(_);
            return;
          }
        } catch {
          if (S++, S >= g) {
            C(
              "Unable to check deposit status. Please check your connection and try again."
            );
            return;
          }
        }
        k || setTimeout(b, u);
      }
    };
    return b(), () => {
      k = !0;
    };
  }, [
    e,
    t,
    n,
    m,
    c,
    l,
    h,
    p,
    u,
    w,
    v,
    C
  ]), F(() => {
    if (!n || !o || e !== "waiting" || s !== "receive" || !a) return;
    const E = window.setTimeout(() => {
      const k = i ?? f.privateMinUsd, N = c.symbol === "SOL" && f.solPriceUsd > 0 ? k / f.solPriceUsd : k, S = Math.round(N * Math.pow(10, c.decimals)), T = {
        token: l === "sol" ? null : c,
        amount: N,
        amountSmallestUnit: S,
        txSignature: `demo-tx-${Date.now()}`,
        sessionId: t || `demo-session-${Date.now()}`,
        response: {
          sessionId: t || `demo-session-${Date.now()}`,
          txSignature: `demo-tx-${Date.now()}`,
          amountLamports: S,
          message: "Demo deposit detected",
          withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
        },
        method: "receive",
        depositAddress: a ?? void 0
      };
      w(T), v("success"), p?.(T);
    }, o);
    return () => window.clearTimeout(E);
  }, [
    n,
    o,
    e,
    s,
    a,
    i,
    f,
    c,
    l,
    t,
    p,
    w,
    v
  ]);
}
function Vl({
  siteName: e,
  config: t,
  depositConfig: n,
  currencyMode: o,
  token: s,
  tokens: a,
  onContinue: i,
  onCancel: c
}) {
  const l = t?.title ?? "How Deposits Work", f = t?.exchangeName ?? "Coinbase", h = Io(t?.exchangeUrl) ?? "https://www.coinbase.com", u = t?.showExchangeSuggestion !== !1, m = ao(o, s, a), p = e ? `${e} uses the Solana blockchain to process secure, private payments.` : "This site uses the Solana blockchain to process secure, private payments.", w = t?.body ?? p, v = Wl(n), C = jl(n);
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
          /* @__PURE__ */ r("strong", { children: v ? "Transparent Fees" : "Low Fees" }),
          /* @__PURE__ */ r("p", { children: C })
        ] })
      ] })
    ] }),
    u && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-explainer-exchange", children: /* @__PURE__ */ d("p", { className: "cedros-deposit-flow-explainer-exchange-text", children: [
      /* @__PURE__ */ r("strong", { children: "New to Solana?" }),
      " You can purchase ",
      m,
      " using your credit card at",
      " ",
      /* @__PURE__ */ r("a", { href: h, target: "_blank", rel: "noopener noreferrer", children: f }),
      ", then send it here to fund your account."
    ] }) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-actions", children: [
      c && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: c,
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
function $l({
  token: e,
  tokens: t,
  currencyMode: n,
  depositMethod: o,
  isAuthorizing: s,
  error: a,
  onAuthorize: i,
  onBack: c
}) {
  const [l, f] = x(""), h = ao(n, e, t), u = (m) => {
    m.preventDefault(), l.trim() && (i(l), f(""));
  };
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Authorize Deposit" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: o === "sign" ? n === "multi-token" ? "Enter your password to authorize a deposit. This allows us to process your withdrawal when the privacy period ends." : `Enter your password to authorize a ${h} deposit. This allows us to process your withdrawal when the privacy period ends.` : n === "multi-token" ? "Enter your password to get your deposit address. Any supported token sent to this address will be credited to your account." : `Enter your password to get your deposit address. Any ${h} sent to this address will be credited to your account.` }),
    /* @__PURE__ */ d("form", { onSubmit: u, children: [
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
        /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", htmlFor: "deposit-password", children: "Password" }),
        /* @__PURE__ */ r(
          "input",
          {
            id: "deposit-password",
            type: "password",
            value: l,
            onChange: (m) => f(m.target.value),
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
            onClick: c,
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
function Vr(e, t) {
  return t.privateDepositsEnabled && e >= t.privateMinUsd ? "private" : e >= t.publicMinUsd ? "public" : "sol_micro";
}
const Gl = 1e4, xt = 1e3, lo = 3;
function Ql(e) {
  return Number.isFinite(e) ? `$${Math.round(e)}` : "$0";
}
function Yl(e, t) {
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
        detail: `SOL only under ${Ql(t.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens."
      };
  }
}
function $r(e, t, n) {
  return Math.min(Math.max(e, t), n);
}
function Kl(e, t) {
  if (t <= 0) return 0;
  const n = $r(e / t, 0, 1);
  return Math.round(Math.pow(n, 1 / lo) * xt);
}
function Zl(e, t) {
  const n = $r(e / xt, 0, 1);
  return t * Math.pow(n, lo);
}
function uo(e) {
  return e < 10 ? 0.01 : e < 100 ? 1 : e < 500 ? 5 : e < 1e3 ? 10 : e < 5e3 ? 25 : 50;
}
function Xl(e) {
  return e < 1 ? 2 : 0;
}
function Zn(e) {
  const t = uo(e), n = Math.round(e / t) * t, o = Xl(t);
  return Number(n.toFixed(o));
}
function ho({
  config: e,
  valueUsd: t,
  onChange: n,
  maxUsd: o = Gl,
  disabled: s = !1,
  className: a = ""
}) {
  const i = $r(Number.isFinite(t) ? t : 0, 0, o), c = W(() => Vr(i, e), [i, e]), l = Yl(c, e), f = Kl(i, o), h = f / xt * 100;
  return /* @__PURE__ */ d("div", { className: `cedros-tiered-slider ${a}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-input-row", children: [
      /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-input", children: [
        /* @__PURE__ */ r("span", { className: "cedros-tiered-slider-currency", children: "$" }),
        /* @__PURE__ */ r(
          "input",
          {
            type: "number",
            value: i || "",
            onChange: (u) => n(Zn(Math.max(0, Math.min(parseFloat(u.target.value) || 0, o)))),
            placeholder: "Enter amount",
            disabled: s,
            min: 0,
            step: uo(i),
            className: "cedros-deposit-flow-input cedros-tiered-slider-input-field",
            "aria-label": "Deposit amount"
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-tiered-slider-tier", children: [
        /* @__PURE__ */ d("span", { className: `cedros-tiered-slider-badge cedros-tiered-slider-badge-${c}`, children: [
          c === "sol_micro" && /* @__PURE__ */ r("img", { src: qr, alt: "SOL", className: "cedros-tiered-slider-badge-icon" }),
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
        value: f,
        onChange: (u) => n(Zn(Zl(parseFloat(u.target.value), o))),
        className: "cedros-tiered-slider-range",
        style: {
          background: `linear-gradient(to right, var(--cedros-primary) 0%, var(--cedros-primary) ${h}%, var(--cedros-border) ${h}%, var(--cedros-border) 100%)`
        },
        disabled: s,
        "aria-label": "Deposit amount slider"
      }
    ),
    l.note && /* @__PURE__ */ r("div", { className: "cedros-tiered-slider-note", children: l.note })
  ] });
}
function Jl({
  tokens: e,
  selectedToken: t,
  onSelect: n,
  openSignal: o,
  placeholder: s = "Select token",
  disabled: a = !1,
  className: i = "",
  searchable: c = !0
}) {
  const [l, f] = x(!1), [h, u] = x(""), m = Q(null), p = Q(null), w = W(() => {
    if (!h.trim()) return e;
    const k = h.toLowerCase();
    return e.filter(
      (N) => N.symbol.toLowerCase().includes(k) || N.name.toLowerCase().includes(k) || N.mint.toLowerCase().includes(k)
    );
  }, [e, h]);
  F(() => {
    const k = (N) => {
      m.current && !m.current.contains(N.target) && (f(!1), u(""));
    };
    if (l)
      return document.addEventListener("mousedown", k), () => document.removeEventListener("mousedown", k);
  }, [l]), F(() => {
    l && c && p.current && p.current.focus();
  }, [l, c]), F(() => {
    o === void 0 || a || (f(!0), u(""));
  }, [o, a]);
  const v = P(() => {
    a || (f((k) => !k), l && u(""));
  }, [a, l]), C = P(
    (k) => {
      n(k), f(!1), u("");
    },
    [n]
  ), E = P(
    (k) => {
      k.key === "Escape" ? (f(!1), u("")) : k.key === "Enter" && w.length === 1 && C(w[0]);
    },
    [w, C]
  );
  return /* @__PURE__ */ d(
    "div",
    {
      ref: m,
      className: `cedros-token-selector ${l ? "cedros-token-selector-open" : ""} ${a ? "cedros-token-selector-disabled" : ""} ${i}`,
      onKeyDown: E,
      children: [
        /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: "cedros-token-selector-trigger",
            onClick: v,
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
                    onError: (k) => {
                      k.target.style.display = "none";
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
          c && /* @__PURE__ */ r("div", { className: "cedros-token-search", children: /* @__PURE__ */ r(
            "input",
            {
              ref: p,
              type: "text",
              value: h,
              onChange: (k) => u(k.target.value),
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
                    onError: (N) => {
                      N.target.style.display = "none";
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
function fo({
  token: e,
  tokens: t,
  quickActionSymbols: n,
  customTokenSymbols: o,
  onTokenSelect: s
}) {
  const [a, i] = x(!1), [c, l] = x(0), f = W(() => {
    const h = o.length === 0 ? t : t.filter((p) => o.includes(p.symbol)), u = h.length > 0 ? h : t;
    return u.some((p) => p.symbol === Ct.symbol) ? u : [...u, Ct];
  }, [t, o]);
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
    /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Token" }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-token-quick", children: [
      n.map((h) => {
        const u = t.find((p) => p.symbol === h), m = e.symbol === h;
        return /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: `cedros-deposit-flow-token-quick-btn ${m ? "is-active" : ""}`,
            onClick: () => {
              u && (i(!1), s(u));
            },
            disabled: !u,
            children: [
              u?.logoUrl && /* @__PURE__ */ r(
                "img",
                {
                  className: "cedros-deposit-flow-token-quick-icon",
                  src: u.logoUrl,
                  alt: `${h} logo`
                }
              ),
              h
            ]
          },
          h
        );
      }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: `cedros-deposit-flow-token-quick-btn ${a ? "is-active" : ""}`,
          onClick: () => {
            i(!0), l((h) => h + 1);
          },
          children: "Custom"
        }
      )
    ] }),
    a && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-token-custom", children: /* @__PURE__ */ r(
      Jl,
      {
        tokens: f,
        selectedToken: e,
        onSelect: s,
        openSignal: c
      }
    ) })
  ] });
}
function ed({
  token: e,
  tokens: t,
  quickActionSymbols: n,
  customTokenSymbols: o,
  currencyMode: s,
  minAmount: a,
  maxAmount: i,
  depositAddress: c,
  walletReady: l,
  needsUnlock: f,
  copied: h,
  isListening: u,
  config: m,
  onCopy: p,
  onTokenSelect: w,
  onUnlockRequired: v,
  onConfirm: C,
  onBack: E
}) {
  const [k, N] = x(m.privateMinUsd), [S, T] = x(!1), [g, b] = x(null), A = Vr(k, m) === "sol_micro", B = e.symbol === Ct.symbol, _ = Tt(m, k), R = _ === 0 ? 0 : _ < 0.01 ? 0.01 : _, L = B ? "Fees: calculated after deposit" : _ === 0 ? "No fees" : `Fees: $${R.toFixed(2)} total`, M = B ? "" : co(m, k, _), U = Hr(A ? Qe : e, m), I = U ? k / U : e.symbol === "SOL" && m.solPriceUsd > 0 ? k / m.solPriceUsd : null, z = I != null ? io(I, A ? "SOL" : e.symbol) : null, $ = k - _ <= 0 && k > 0, D = !B && k > 0 && !$ && I != null && I >= a && I <= i;
  F(() => {
    if (s === "multi-token")
      if (A && e.symbol !== "SOL") {
        b(e);
        const K = t.find((Y) => Y.symbol === "SOL");
        K && w(K);
      } else !A && g && e.symbol === "SOL" && (w(g), b(null));
  }, [A, e.symbol, s, t, w, g, e]);
  const H = () => {
    D && I != null && C(I, e);
  };
  return /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Choose Amount" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Set how much you want to deposit. Higher tiers unlock privacy." }),
    s === "multi-token" && !A && /* @__PURE__ */ r(
      fo,
      {
        token: e,
        tokens: t,
        quickActionSymbols: n,
        customTokenSymbols: o,
        onTokenSelect: w
      }
    ),
    /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-field", children: /* @__PURE__ */ r(
      ho,
      {
        config: m,
        valueUsd: k,
        onChange: N,
        maxUsd: oo
      }
    ) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: B ? "Sign to send tokens to this address" : `Sign to send ${z ?? "--"} ${A ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ r("code", { className: "cedros-deposit-flow-address", children: c || "Loading..." }),
        /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-actions", children: [
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-icon",
              onClick: p,
              title: "Copy address",
              disabled: !c,
              children: h ? "✓" : "⧉"
            }
          ),
          c && /* @__PURE__ */ r(
            "a",
            {
              className: "cedros-deposit-flow-copy-btn cedros-deposit-flow-copy-link cedros-deposit-flow-copy-icon",
              href: `https://orbmarkets.io/account/${c}`,
              target: "_blank",
              rel: "noopener noreferrer",
              title: "View on Orb Markets",
              children: "↗"
            }
          )
        ] })
      ] }),
      h && /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    $ && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-warning", children: /* @__PURE__ */ r("p", { children: "Deposit amount is less than the fees. Increase the amount to proceed." }) }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ r("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ d("span", { children: [
          L,
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${S ? "is-open" : ""}`,
              "data-tooltip": M,
              "aria-label": `Fee breakdown: ${M.replaceAll(`
`, ", ")}`,
              "aria-expanded": S,
              onClick: (K) => {
                K.stopPropagation(), T((Y) => !Y);
              },
              onBlur: () => T(!1),
              onKeyDown: (K) => {
                K.key === "Escape" && T(!1);
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
    u && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-info-banner", children: "Listening for incoming transfers. We will confirm automatically." }),
    f && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-warning", children: [
      /* @__PURE__ */ r("p", { children: "Your wallet is locked. Unlock it to continue." }),
      v && /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-secondary",
          onClick: v,
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
          onClick: E,
          children: "Back"
        }
      ),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-deposit-flow-button cedros-deposit-flow-button-primary",
          onClick: H,
          disabled: !D || !l || !c,
          children: "Deposit"
        }
      )
    ] })
  ] });
}
function td({ depositAddress: e }) {
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
function rd({
  token: e,
  tokens: t,
  quickActionSymbols: n,
  customTokenSymbols: o,
  tokenPriceUsd: s,
  currencyMode: a,
  depositAddress: i,
  copied: c,
  isListening: l,
  config: f,
  onCopy: h,
  onTokenSelect: u,
  onAmountChange: m,
  onSent: p,
  onBack: w
}) {
  const [v, C] = x(f.privateMinUsd), [E, k] = x(!1), [N, S] = x(null), g = Vr(v, f) === "sol_micro", b = e.symbol === Ct.symbol, y = Tt(f, v), A = y === 0 ? 0 : y < 0.01 ? 0.01 : y, B = b ? "Fees: calculated after deposit" : y === 0 ? "No fees" : `Fees: $${A.toFixed(2)} total`, _ = b ? "" : co(f, v, y), R = b || v > 0, L = Hr(g ? Qe : e, f, s), M = L ? v / L : null, U = M ? io(M, e.symbol) : null;
  return F(() => {
    if (a === "multi-token")
      if (g && e.symbol !== "SOL") {
        S(e);
        const I = t.find((z) => z.symbol === "SOL");
        I && u(I);
      } else !g && N && e.symbol === "SOL" && (u(N), S(null));
  }, [g, e.symbol, a, t, u, N, e]), F(() => {
    m(v);
  }, [v, m]), i ? /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-step", children: [
    /* @__PURE__ */ r("h4", { className: "cedros-deposit-flow-step-title", children: "Send Deposit" }),
    /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-step-desc", children: "Send funds to your deposit address. We'll confirm automatically." }),
    a === "multi-token" && !g && /* @__PURE__ */ r(
      fo,
      {
        token: e,
        tokens: t,
        quickActionSymbols: n,
        customTokenSymbols: o,
        onTokenSelect: u
      }
    ),
    !b && /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: "Deposit Amount" }),
      /* @__PURE__ */ r(
        ho,
        {
          config: f,
          valueUsd: v,
          onChange: C,
          maxUsd: oo
        }
      )
    ] }),
    b && /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-note", children: "Send any token you want. We'll detect the deposit, swap it, and credit your balance automatically." }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-deposit-flow-label", children: b ? "Send any token to this address" : `Send ${U ?? "--"} ${g ? "SOL" : e.symbol} to this address` }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-address-box", children: [
        /* @__PURE__ */ r("code", { className: "cedros-deposit-flow-address", children: i }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-deposit-flow-copy-btn",
            onClick: h,
            title: "Copy address",
            children: c ? "✓" : "📋"
          }
        )
      ] }),
      c && /* @__PURE__ */ r("p", { className: "cedros-deposit-flow-copied-msg", children: "Copied!" })
    ] }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-stack", children: [
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ r("span", { children: "Send only on the Solana network." })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-info-item", children: [
        /* @__PURE__ */ r("span", { className: "cedros-deposit-flow-info-dot" }),
        /* @__PURE__ */ d("span", { children: [
          B,
          !b && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: `cedros-deposit-flow-fee-info ${E ? "is-open" : ""}`,
              "data-tooltip": _,
              "aria-label": `Fee breakdown: ${_.replaceAll(`
`, ", ")}`,
              "aria-expanded": E,
              onClick: (I) => {
                I.stopPropagation(), k((z) => !z);
              },
              onBlur: () => k(!1),
              onKeyDown: (I) => {
                I.key === "Escape" && k(!1);
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
          onClick: p,
          disabled: !R,
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
function nd({ token: e, depositAddress: t, copied: n, feeLine: o, onCopy: s }) {
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
function sd({ result: e, config: t, onNewDeposit: n }) {
  const o = e.token ?? Qe, s = Hr(o, t), a = s ? e.amount * s : e.amount, i = Tt(t, a), c = Math.max(a - i, 0), l = i === 0 ? 0 : i < 0.01 ? 0.01 : i;
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
function od({ error: e, onRetry: t, onCancel: n }) {
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
function ad({ steps: e, currentStepIndex: t, currentStep: n }) {
  return /* @__PURE__ */ r("div", { className: "cedros-deposit-flow-steps", children: e.map((o, s) => {
    const a = t >= s, i = o.key === n;
    return /* @__PURE__ */ d(
      "div",
      {
        className: `cedros-deposit-flow-step-item ${a ? "step-active" : ""}`,
        children: [
          /* @__PURE__ */ r(
            "div",
            {
              className: `cedros-deposit-flow-step-circle ${a ? "active" : ""} ${i ? "current" : ""}`,
              children: s + 1
            }
          ),
          /* @__PURE__ */ r("span", { className: `cedros-deposit-flow-step-label ${a ? "active" : ""}`, children: o.label })
        ]
      },
      o.key
    );
  }) });
}
function su({
  config: e,
  currencyMode: t,
  depositMethod: n,
  tokens: o = [],
  defaultToken: s,
  minAmount: a,
  maxAmount: i = 1e4,
  onSuccess: c,
  onError: l,
  onCancel: f,
  onUnlockRequired: h,
  onAuthorize: u,
  className: m = "",
  showStepIndicator: p = !0,
  pollInterval: w = 5e3,
  demoMode: v = !1,
  demoAutoConfirmMs: C,
  tokenPriceUsd: E,
  showExplainer: k = !1,
  siteName: N,
  explainerConfig: S
}) {
  const { deposit: T, getStatus: g, error: b, clearError: y } = _l(), A = St(), B = Kn(e.quickActionTokens), _ = Kn(e.customTokenSymbols), R = W(() => {
    const j = e.customTokens ?? [];
    if (j.length === 0) return o;
    const te = new Set(o.map((fe) => fe.symbol)), le = [...o];
    for (const fe of j)
      te.has(fe.symbol) || (le.push({
        mint: fe.mint,
        symbol: fe.symbol,
        name: fe.symbol,
        decimals: fe.decimals,
        logoUrl: fe.logoUrl
      }), te.add(fe.symbol));
    return le;
  }, [o, e.customTokens]), L = W(() => {
    if (_.length === 0) return R;
    const j = R.filter((te) => _.includes(te.symbol));
    return j.length > 0 ? j : R;
  }, [R, _]), M = e.privateDepositsEnabled, U = n ? n === "sign" && !M ? "receive" : n : M && A.hasExternalWallet ? "sign" : "receive", I = B[0] ? R.find((j) => j.symbol === B[0]) : void 0, z = t === "sol" ? Qe : t === "single-token" ? I ?? R.find((j) => j.symbol === "USDC") ?? R[0] ?? Qe : s ?? I ?? R.find((j) => j.symbol === "USDC") ?? R.find((j) => j.symbol !== "SOL") ?? R[0] ?? Qe, O = P(() => k ? "explainer" : "unlock", [k]), [$, D] = x(O), [H, K] = x(z), [Y, Ae] = x(""), [Ce, ge] = x(null), [ue, Z] = x(null), [ie, xe] = x(null), [Se, Ze] = x(null), [Ue, De] = x(!1), [Pt, Xe] = x(!1), [q, Ie] = x(null), ce = Q(null);
  F(() => () => {
    ce.current && clearTimeout(ce.current);
  }, []), F(() => {
    D(O()), K(z), Ae(""), ge(null), Z(null), xe(null), Ze(null), De(!1), Xe(!1), Ie(null), y();
  }, [t, U, z, y]);
  const rt = a ?? e.privateMinSol, nt = i, _e = parseFloat(Y), Je = A.status === "enrolled_locked" || A.status === "enrolled_unlocked" || A.status === "unlocked", Rt = Je && A.isUnlocked, Mt = Je && !A.isUnlocked, Qr = P(() => {
    let le = U === "sign" ? [
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
    return k && (le = [{ key: "explainer", label: "Info" }, ...le]), le;
  }, [U, k])(), wo = Qr.findIndex((j) => j.key === $), Yr = P((j) => {
    K(j);
  }, []), yo = P(
    async (j) => {
      if (!u) {
        D(U === "sign" ? "confirm" : "show-address");
        return;
      }
      Xe(!0), Z(null);
      try {
        const le = await u(j, U === "sign" ? _e : null, H);
        xe(le.sessionId), Ze(le.depositAddress), D(U === "sign" ? "confirm" : "show-address");
      } catch (te) {
        const le = te instanceof Error ? te : new Error("Authorization failed");
        Z(le.message);
      } finally {
        Xe(!1);
      }
    },
    [u, U, _e, H]
  ), bo = P(
    async (j, te) => {
      y(), Z(null), D("signing");
      const le = j ?? _e, fe = te ?? H;
      if (!v) {
        if (Mt && h) {
          h(), D("confirm");
          return;
        }
        if (!Rt) {
          Z("Wallet not ready"), D("error");
          return;
        }
      }
      try {
        const Fe = Math.round(le * Math.pow(10, fe.decimals));
        if (v) {
          await new Promise((ko) => setTimeout(ko, 1500));
          const Zr = {
            token: t === "sol" ? null : fe,
            amount: le,
            amountSmallestUnit: Fe,
            txSignature: `demo-tx-${Date.now()}`,
            sessionId: ie || `demo-session-${Date.now()}`,
            response: {
              sessionId: ie || `demo-session-${Date.now()}`,
              txSignature: `demo-tx-${Date.now()}`,
              amountLamports: Fe,
              message: "Demo deposit successful",
              withdrawalAvailableAt: new Date(Date.now() + 1440 * 60 * 1e3).toISOString()
            },
            method: "sign"
          };
          ge(Zr), D("success"), c?.(Zr);
          return;
        }
        const He = await T(Fe), Kr = {
          token: t === "sol" ? null : fe,
          amount: le,
          amountSmallestUnit: Fe,
          txSignature: He.txSignature,
          sessionId: He.sessionId,
          response: He,
          method: "sign"
        };
        ge(Kr), D("success"), c?.(Kr);
      } catch (Fe) {
        const He = Fe instanceof Error ? Fe : new Error("Deposit failed");
        Z(He.message), D("error"), l?.(He);
      }
    },
    [
      T,
      _e,
      H,
      t,
      v,
      ie,
      Rt,
      Mt,
      h,
      c,
      l,
      y
    ]
  ), Ao = P(() => {
    D("waiting");
  }, []), Ut = P(async () => {
    const j = Se || A.solanaPubkey;
    if (j) {
      ce.current && clearTimeout(ce.current);
      try {
        await navigator.clipboard.writeText(j), De(!0), ce.current = setTimeout(() => De(!1), 2e3);
      } catch {
        const te = document.createElement("textarea");
        te.value = j, document.body.appendChild(te), te.select(), document.execCommand("copy"), document.body.removeChild(te), De(!0), ce.current = setTimeout(() => De(!1), 2e3);
      }
    }
  }, [Se, A.solanaPubkey]);
  Hl({
    step: $,
    sessionId: ie,
    demoMode: v,
    demoAutoConfirmMs: C,
    depositMethod: U,
    depositAddress: Se,
    receiveAmountUsd: q,
    selectedToken: H,
    currencyMode: t,
    config: e,
    solanaPubkey: A.solanaPubkey,
    pollInterval: w,
    getStatus: g,
    onSuccess: c,
    setResult: ge,
    setStep: D,
    setFlowError: Z
  });
  const vo = P(() => {
    D(O()), Ae(""), ge(null), Z(null), y();
  }, [O, y]);
  if (!e.enabled)
    return /* @__PURE__ */ r("div", { className: `cedros-deposit-flow cedros-deposit-flow-disabled ${m}`, children: /* @__PURE__ */ r("p", { children: "Deposits are not currently available." }) });
  const No = q ? (() => {
    const j = Tt(e, q);
    return j === 0 ? "No fees" : `Fees: $${Math.max(j, 0.01).toFixed(2)} total`;
  })() : "Fees: calculated after deposit";
  return /* @__PURE__ */ d("div", { className: `cedros-deposit-flow ${m}`, children: [
    p && $ !== "error" && /* @__PURE__ */ r(ad, { steps: Qr, currentStepIndex: wo, currentStep: $ }),
    /* @__PURE__ */ d("div", { className: "cedros-deposit-flow-content", children: [
      $ === "explainer" && /* @__PURE__ */ r(
        Vl,
        {
          siteName: N,
          config: S,
          depositConfig: e,
          currencyMode: t,
          token: H,
          tokens: L,
          onContinue: () => D("unlock"),
          onCancel: f
        }
      ),
      $ === "unlock" && /* @__PURE__ */ r(
        $l,
        {
          token: H,
          tokens: L,
          currencyMode: t,
          depositMethod: U,
          isAuthorizing: Pt,
          error: ue,
          onAuthorize: yo,
          onBack: k ? () => D("explainer") : void 0,
          onCancel: f
        }
      ),
      $ === "confirm" && U === "sign" && /* @__PURE__ */ r(
        ed,
        {
          token: H,
          tokens: R,
          quickActionSymbols: B,
          customTokenSymbols: _,
          currencyMode: t,
          minAmount: rt,
          maxAmount: nt,
          depositAddress: Se || A.solanaPubkey,
          walletReady: Rt || v,
          needsUnlock: Mt && !v,
          copied: Ue,
          isListening: !!ie && !v,
          config: e,
          onCopy: Ut,
          onTokenSelect: Yr,
          onUnlockRequired: h,
          onConfirm: (j, te) => bo(j, te),
          onBack: () => D("unlock"),
          onCancel: f
        }
      ),
      $ === "signing" && /* @__PURE__ */ r(td, { depositAddress: A.solanaPubkey }),
      $ === "show-address" && /* @__PURE__ */ r(
        rd,
        {
          token: H,
          tokens: R,
          quickActionSymbols: B,
          customTokenSymbols: _,
          tokenPriceUsd: E,
          currencyMode: t,
          depositAddress: Se || A.solanaPubkey,
          copied: Ue,
          isListening: !!ie && !v,
          config: e,
          onCopy: Ut,
          onTokenSelect: Yr,
          onAmountChange: Ie,
          onSent: Ao,
          onBack: () => D("unlock"),
          onCancel: f
        }
      ),
      $ === "waiting" && /* @__PURE__ */ r(
        nd,
        {
          token: H,
          depositAddress: Se || A.solanaPubkey,
          copied: Ue,
          feeLine: No,
          onCopy: Ut
        }
      ),
      $ === "success" && Ce && /* @__PURE__ */ r(sd, { result: Ce, config: e, onNewDeposit: vo }),
      $ === "error" && /* @__PURE__ */ r(
        od,
        {
          error: ue || b || "An error occurred",
          onRetry: () => D("confirm"),
          onCancel: f
        }
      )
    ] })
  ] });
}
function mo() {
  const e = Oe(), [t, n] = x(!1), [o, s] = x(null), a = W(() => e ? new ne({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), i = P(() => {
    s(null);
  }, []), c = P(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    n(!0), s(null);
    try {
      return await a.get("/credits/balance/sol");
    } catch (h) {
      const u = V(h, "Failed to fetch credit balance");
      throw s(u.message), u;
    } finally {
      n(!1);
    }
  }, [a]), l = P(async () => {
    if (!a)
      throw new Error("useCredits must be used within a CedrosLoginProvider");
    n(!0), s(null);
    try {
      return (await a.get("/credits/balance")).balances;
    } catch (h) {
      const u = V(h, "Failed to fetch credit balances");
      throw s(u.message), u;
    } finally {
      n(!1);
    }
  }, [a]), f = P(
    async (h) => {
      if (!a)
        throw new Error("useCredits must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const u = new URLSearchParams();
        h?.currency && u.set("currency", h.currency), h?.limit !== void 0 && u.set("limit", h.limit.toString()), h?.offset !== void 0 && u.set("offset", h.offset.toString());
        const m = u.toString(), p = m ? `/credits/history?${m}` : "/credits/history";
        return await a.get(p);
      } catch (u) {
        const m = V(u, "Failed to fetch transaction history");
        throw s(m.message), m;
      } finally {
        n(!1);
      }
    },
    [a]
  );
  return {
    getBalance: c,
    getAllBalances: l,
    getHistory: f,
    isLoading: t,
    error: o,
    clearError: i
  };
}
function ou({
  showAllCurrencies: e = !1,
  refreshInterval: t = 0,
  compact: n = !1,
  className: o = "",
  onLoad: s
}) {
  const { getBalance: a, getAllBalances: i, isLoading: c, error: l, clearError: f } = mo(), [h, u] = x([]), [m, p] = x(null), w = P(async () => {
    try {
      if (e) {
        const v = await i();
        u(v), s?.(v);
      } else {
        const v = await a();
        u([v]), s?.([v]);
      }
      p(null);
    } catch (v) {
      p(v instanceof Error ? v.message : "Failed to load balance");
    }
  }, [e, a, i, s]);
  if (F(() => {
    w();
  }, [w]), F(() => {
    if (t <= 0) return;
    const v = setInterval(w, t);
    return () => clearInterval(v);
  }, [t, w]), m || l)
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-error ${o}`, children: [
      /* @__PURE__ */ r("p", { className: "cedros-credit-error", children: m || l }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-credit-retry",
          onClick: () => {
            f(), p(null), w();
          },
          children: "Retry"
        }
      )
    ] });
  if (c && h.length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-loading ${o}`, children: [
      /* @__PURE__ */ r("span", { className: "cedros-credit-loading-indicator" }),
      /* @__PURE__ */ r("span", { className: "cedros-credit-loading-text", children: "Loading balance..." })
    ] });
  if (n) {
    const v = h[0];
    return /* @__PURE__ */ d("div", { className: `cedros-credit-balance cedros-credit-balance-compact ${o}`, children: [
      v ? /* @__PURE__ */ r(
        "span",
        {
          className: "cedros-credit-value",
          title: `${v.balanceLamports} lamports`,
          children: v.display
        }
      ) : /* @__PURE__ */ r("span", { className: "cedros-credit-value cedros-credit-value-zero", children: "0.0000 SOL" }),
      c && /* @__PURE__ */ r("span", { className: "cedros-credit-refresh-indicator", title: "Refreshing..." })
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
          disabled: c,
          title: "Refresh balance",
          children: c ? "..." : "↻"
        }
      )
    ] }),
    h.length === 0 ? /* @__PURE__ */ d("div", { className: "cedros-credit-empty", children: [
      /* @__PURE__ */ r("p", { className: "cedros-credit-empty-message", children: "No credit balance yet." }),
      /* @__PURE__ */ r("p", { className: "cedros-credit-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ r("div", { className: "cedros-credit-list", children: h.map((v) => /* @__PURE__ */ d("div", { className: "cedros-credit-item", children: [
      /* @__PURE__ */ r("span", { className: "cedros-credit-currency", children: v.currency }),
      /* @__PURE__ */ r("span", { className: "cedros-credit-amount", children: v.display })
    ] }, v.currency)) })
  ] });
}
const pr = [
  { key: "all", label: "All", txTypes: null },
  { key: "deposits", label: "Deposits", txTypes: ["deposit"] },
  { key: "usage", label: "Usage", txTypes: ["spend", "usage", "charge"] },
  {
    key: "adjustments",
    label: "Adjustments",
    txTypes: ["refund", "adjustment", "bonus", "credit"]
  }
];
function id(e, t) {
  const n = e < 0, o = Math.abs(e), s = so(t), a = o / Math.pow(10, s), i = n ? "-" : "+";
  return t.toUpperCase() === "SOL" ? `${i}${a.toFixed(4)} SOL` : `${i}$${a.toFixed(2)}`;
}
function cd(e) {
  const t = new Date(e), n = /* @__PURE__ */ new Date(), o = n.getTime() - t.getTime();
  if (o < 0) return "Just now";
  const s = Math.floor(o / (1e3 * 60 * 60 * 24));
  if (s === 0) {
    const a = Math.floor(o / 36e5);
    if (a === 0) {
      const i = Math.floor(o / 6e4);
      return i < 1 ? "Just now" : `${i}m ago`;
    }
    return `${a}h ago`;
  }
  return s === 1 ? "Yesterday" : s < 7 ? `${s}d ago` : t.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: t.getFullYear() !== n.getFullYear() ? "numeric" : void 0
  });
}
function ld(e) {
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
function dd(e, t) {
  const n = (e || "").toLowerCase();
  return n === "deposit" ? "↓" : n === "spend" || n === "usage" || n === "charge" ? "↑" : n === "refund" ? "←" : n === "bonus" || n === "credit" ? "★" : t ? "+" : "−";
}
function au({
  defaultTab: e = "all",
  pageSize: t = 10,
  refreshInterval: n = 0,
  className: o = "",
  onLoad: s,
  onTransactionClick: a
}) {
  const { getHistory: i, isLoading: c, error: l, clearError: f } = mo(), [h, u] = x(e), [m, p] = x([]), [w, v] = x(0), [C, E] = x(0), [k, N] = x(null), S = pr.find((L) => L.key === h) || pr[0], T = W(() => S.txTypes === null ? m : m.filter((L) => {
    const M = L.txType || "";
    return S.txTypes.some((U) => M.toLowerCase() === U.toLowerCase());
  }), [m, S.txTypes]), g = P(async () => {
    try {
      const L = await i({ limit: t * 3, offset: C });
      p(L.transactions), v(L.total), s?.(L), N(null);
    } catch (L) {
      N(L instanceof Error ? L.message : "Failed to load history");
    }
  }, [t, C, i, s]);
  F(() => {
    E(0);
  }, [h]), F(() => {
    g();
  }, [g]), F(() => {
    if (n <= 0) return;
    const L = setInterval(g, n);
    return () => clearInterval(L);
  }, [n, g]);
  const b = S.txTypes === null ? w : T.length, y = Math.ceil(b / t), A = Math.floor(C / t) + 1, B = (L) => {
    const M = (L - 1) * t;
    E(Math.max(0, Math.min(M, Math.max(0, b - t))));
  }, _ = (L) => {
    u(L);
  };
  if (k || l)
    return /* @__PURE__ */ d("div", { className: `cedros-tx-history cedros-tx-history-error ${o}`, children: [
      /* @__PURE__ */ r("p", { className: "cedros-tx-error", children: k || l }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-tx-retry",
          onClick: () => {
            f(), N(null), g();
          },
          children: "Retry"
        }
      )
    ] });
  if (c && m.length === 0)
    return /* @__PURE__ */ d("div", { className: `cedros-tx-history cedros-tx-history-loading ${o}`, children: [
      /* @__PURE__ */ r("span", { className: "cedros-tx-loading-indicator" }),
      /* @__PURE__ */ r("span", { className: "cedros-tx-loading-text", children: "Loading transactions..." })
    ] });
  const R = (L) => L.txTypes === null ? m.length : m.filter((M) => {
    const U = M.txType || "";
    return L.txTypes.some((I) => U.toLowerCase() === I.toLowerCase());
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
          disabled: c,
          title: "Refresh",
          children: c ? "..." : "↻"
        }
      )
    ] }),
    /* @__PURE__ */ r("div", { className: "cedros-tx-tabs", children: pr.map((L) => {
      const M = R(L), U = h === L.key;
      return /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: `cedros-tx-tab ${U ? "cedros-tx-tab-active" : ""}`,
          onClick: () => _(L.key),
          children: [
            L.label,
            M > 0 && /* @__PURE__ */ r("span", { className: "cedros-tx-tab-count", children: M })
          ]
        },
        L.key
      );
    }) }),
    T.length === 0 ? /* @__PURE__ */ d("div", { className: "cedros-tx-empty", children: [
      /* @__PURE__ */ r("p", { className: "cedros-tx-empty-message", children: h === "all" ? "No transactions yet." : `No ${S.label.toLowerCase()} found.` }),
      h === "all" && /* @__PURE__ */ r("p", { className: "cedros-tx-empty-hint", children: "Make a deposit to get started." })
    ] }) : /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-tx-list", children: T.slice(0, t).map((L) => {
        const M = L.amountLamports >= 0;
        return /* @__PURE__ */ d(
          "div",
          {
            className: `cedros-tx-item ${M ? "cedros-tx-item-positive" : "cedros-tx-item-negative"}`,
            onClick: () => a?.(L),
            onKeyDown: (U) => {
              (U.key === "Enter" || U.key === " ") && (U.preventDefault(), a?.(L));
            },
            role: a ? "button" : void 0,
            tabIndex: a ? 0 : void 0,
            children: [
              /* @__PURE__ */ r(
                "div",
                {
                  className: `cedros-tx-icon ${M ? "cedros-tx-icon-positive" : "cedros-tx-icon-negative"}`,
                  children: dd(L.txType, M)
                }
              ),
              /* @__PURE__ */ d("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-tx-type", children: ld(L.txType) }),
                  /* @__PURE__ */ r(
                    "span",
                    {
                      className: `cedros-tx-amount ${M ? "cedros-tx-amount-positive" : "cedros-tx-amount-negative"}`,
                      children: id(L.amountLamports, L.currency)
                    }
                  )
                ] }),
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-details", children: [
                  /* @__PURE__ */ r("span", { className: "cedros-tx-description", children: L.description }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-date", children: cd(L.createdAt) })
                ] })
              ] })
            ]
          },
          L.id
        );
      }) }),
      y > 1 && /* @__PURE__ */ d("div", { className: "cedros-tx-pagination", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => B(A - 1),
            disabled: A <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ d("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          A,
          " of ",
          y
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => B(A + 1),
            disabled: A >= y,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function po() {
  const e = Oe(), [t, n] = x(!1), [o, s] = x(null), [a, i] = x(null), c = W(() => e ? new ne({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), l = P(() => {
    s(null);
  }, []), f = P(async () => {
    if (!c)
      throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
    try {
      return await c.get("/wallet/withdraw/balances");
    } catch (p) {
      const w = V(p, "Failed to fetch wallet balances");
      throw s(w.message), w;
    }
  }, [c]), h = P(
    async (p, w) => {
      if (!c)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const v = await c.post("/wallet/withdraw/sol", {
          destination: p,
          amount_lamports: w
        });
        return i(v), v;
      } catch (v) {
        const C = V(v, "Failed to withdraw SOL");
        throw s(C.message), C;
      } finally {
        n(!1);
      }
    },
    [c]
  ), u = P(
    async (p, w, v) => {
      if (!c)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      n(!0), s(null);
      try {
        const C = await c.post("/wallet/withdraw/spl", {
          destination: p,
          token_mint: w,
          amount: v
        });
        return i(C), C;
      } catch (C) {
        const E = V(C, "Failed to withdraw token");
        throw s(E.message), E;
      } finally {
        n(!1);
      }
    },
    [c]
  ), m = P(
    async (p = 10, w = 0) => {
      if (!c)
        throw new Error("useWithdrawal must be used within a CedrosLoginProvider");
      try {
        const v = Math.max(1, Math.min(100, Math.trunc(p))), C = Math.max(0, Math.trunc(w)), E = new URLSearchParams({
          limit: String(v),
          offset: String(C)
        });
        return await c.get(
          `/wallet/withdraw/history?${E}`
        );
      } catch (v) {
        const C = V(v, "Failed to fetch withdrawal history");
        throw s(C.message), C;
      }
    },
    [c]
  );
  return {
    withdrawSol: h,
    withdrawSpl: u,
    getBalances: f,
    getHistory: m,
    isSubmitting: t,
    error: o,
    clearError: l,
    lastResult: a
  };
}
const gr = "So11111111111111111111111111111111111111112", ud = {
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
function hd(e) {
  return e.length < 32 || e.length > 50 ? !1 : /^[1-9A-HJ-NP-Za-km-z]+$/.test(e);
}
function wr(e) {
  return e.length <= 16 ? e : `${e.slice(0, 6)}...${e.slice(-6)}`;
}
function dt(e, t) {
  return (Number(e) / Math.pow(10, t)).toLocaleString(void 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(t, 6)
  });
}
function iu({
  onSuccess: e,
  onError: t,
  onCancel: n,
  className: o = ""
}) {
  const s = Oe(), { withdrawSol: a, withdrawSpl: i, getBalances: c, isSubmitting: l, error: f, clearError: h } = po(), [u, m] = x("loading"), [p, w] = x([]), [v, C] = x(null), [E, k] = x(""), [N, S] = x(""), [T, g] = x(null), [b, y] = x(null), [A, B] = x(null), _ = s?.config.solana?.network ?? "mainnet-beta", R = W(() => {
    if (!T?.txSignature) return "";
    const D = `https://explorer.solana.com/tx/${T.txSignature}`;
    return _ === "mainnet-beta" ? D : `${D}?cluster=${encodeURIComponent(_)}`;
  }, [T, _]), L = W(() => {
    if (!v || !N) return "0";
    const D = parseFloat(N);
    return isNaN(D) || D <= 0 ? "0" : Math.floor(D * Math.pow(10, v.decimals)).toString();
  }, [N, v]);
  F(() => {
    if (!s) return;
    let D = !1;
    return (async () => {
      try {
        const H = await c();
        if (D) return;
        const K = [];
        H.solLamports > 0 && K.push({
          symbol: "SOL",
          mint: gr,
          decimals: 9,
          rawBalance: String(H.solLamports),
          displayBalance: dt(String(H.solLamports), 9)
        });
        for (const Y of H.tokens) {
          const Ae = ud[Y.mint] ?? wr(Y.mint);
          K.push({
            symbol: Ae,
            mint: Y.mint,
            decimals: Y.decimals,
            rawBalance: Y.amount,
            displayBalance: dt(Y.amount, Y.decimals)
          });
        }
        w(K), m((K.length > 0, "select"));
      } catch {
        D || (B("Failed to load wallet balances"), m("select"));
      }
    })(), () => {
      D = !0;
    };
  }, [s, c]);
  const M = P(
    (D) => {
      C(D), m("form"), h(), y(null), S("");
    },
    [h]
  ), U = P(() => {
    if (!v) return;
    const D = Number(v.rawBalance) / Math.pow(10, v.decimals);
    v.mint === gr ? S(String(Math.max(0, D - 0.01))) : S(String(D));
  }, [v]), I = P(() => {
    if (y(null), !E.trim()) {
      y("Destination address is required");
      return;
    }
    if (!hd(E.trim())) {
      y("Invalid Solana address");
      return;
    }
    if (!N || parseFloat(N) <= 0 || isNaN(parseFloat(N))) {
      y("Please enter a valid amount");
      return;
    }
    if (L === "0") {
      y("Amount is too small");
      return;
    }
    m("confirm");
  }, [E, N, L]), z = P(async () => {
    if (v) {
      m("processing"), h();
      try {
        let D;
        v.mint === gr ? D = await a(E.trim(), Number(L)) : D = await i(E.trim(), v.mint, L), g(D), m("success"), e?.(D);
      } catch (D) {
        m("confirm"), t?.(D instanceof Error ? D : new Error(String(D)));
      }
    }
  }, [
    v,
    E,
    L,
    a,
    i,
    h,
    e,
    t
  ]), O = P(() => {
    h(), y(null), u === "form" ? (m("select"), C(null), S(""), k("")) : u === "confirm" && m("form");
  }, [u, h]), $ = P(() => {
    m("select"), C(null), k(""), S(""), g(null), h(), y(null);
  }, [h]);
  return s ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal ${o}`, children: [
    u === "loading" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ r(G, {}),
      /* @__PURE__ */ r("p", { className: "cedros-withdrawal-processing-text", children: "Loading wallet balances..." })
    ] }),
    u === "select" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-select", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Withdraw" }),
        /* @__PURE__ */ r("p", { className: "cedros-withdrawal-subtitle", children: "Select a token to withdraw" })
      ] }),
      A && /* @__PURE__ */ r(oe, { error: A }),
      p.length === 0 && !A && /* @__PURE__ */ r("p", { className: "cedros-withdrawal-empty", children: "No tokens found in your wallet." }),
      /* @__PURE__ */ r("div", { className: "cedros-withdrawal-tokens", children: p.map((D) => /* @__PURE__ */ d(
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
    u === "form" && v && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-form", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: O,
            children: "Back"
          }
        ),
        /* @__PURE__ */ d("h3", { className: "cedros-withdrawal-title", children: [
          "Withdraw ",
          v.symbol
        ] })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-balance-hint", children: [
        "Balance: ",
        v.displayBalance,
        " ",
        v.symbol
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
            value: E,
            onChange: (D) => k(D.target.value),
            autoComplete: "off",
            spellCheck: !1
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-field", children: [
        /* @__PURE__ */ d("label", { className: "cedros-label", htmlFor: "cedros-withdrawal-amount", children: [
          "Amount (",
          v.symbol,
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
              onChange: (D) => S(D.target.value),
              min: "0",
              step: "any"
            }
          ),
          /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-button cedros-button-ghost cedros-button-sm",
              onClick: U,
              children: "Max"
            }
          )
        ] })
      ] }),
      (b || f) && /* @__PURE__ */ r(oe, { error: b || f || "" }),
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-withdrawal-submit",
          onClick: I,
          children: "Review Withdrawal"
        }
      )
    ] }),
    u === "confirm" && v && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-confirm", children: [
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-header", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-ghost cedros-button-sm",
            onClick: O,
            disabled: l,
            children: "Back"
          }
        ),
        /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Confirm Withdrawal" })
      ] }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary", children: [
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Token" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", children: v.symbol })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Amount" }),
          /* @__PURE__ */ d("span", { className: "cedros-withdrawal-summary-value", children: [
            dt(L, v.decimals),
            " ",
            v.symbol
          ] })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Destination" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", title: E, children: wr(E) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-withdrawal-summary-row", children: [
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-label", children: "Est. Fee" }),
          /* @__PURE__ */ r("span", { className: "cedros-withdrawal-summary-value", children: "~0.000005 SOL" })
        ] })
      ] }),
      f && /* @__PURE__ */ r(oe, { error: f }),
      /* @__PURE__ */ d("div", { className: "cedros-withdrawal-actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-outline",
            onClick: O,
            disabled: l,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary",
            onClick: z,
            disabled: l,
            children: l ? "Sending..." : "Confirm & Send"
          }
        )
      ] })
    ] }),
    u === "processing" && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-processing", children: [
      /* @__PURE__ */ r(G, {}),
      /* @__PURE__ */ d("p", { className: "cedros-withdrawal-processing-text", children: [
        "Sending ",
        v?.symbol,
        "..."
      ] })
    ] }),
    u === "success" && T && /* @__PURE__ */ d("div", { className: "cedros-withdrawal-success", children: [
      /* @__PURE__ */ r("div", { className: "cedros-withdrawal-success-icon", children: "✓" }),
      /* @__PURE__ */ r("h3", { className: "cedros-withdrawal-title", children: "Withdrawal Complete" }),
      /* @__PURE__ */ d("p", { className: "cedros-withdrawal-subtitle", children: [
        dt(L, v?.decimals ?? 9),
        " ",
        v?.symbol,
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
            children: wr(T.txSignature)
          }
        )
      ] }),
      /* @__PURE__ */ r(
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
function fd(e, t) {
  if (e === "sol") return "SOL";
  if (!t) return "SPL";
  const n = jr.find((o) => o.mint === t);
  return n ? n.symbol : `${t.slice(0, 4)}...${t.slice(-4)}`;
}
function md(e, t) {
  const n = Number(e);
  if (Number.isNaN(n)) return e;
  const o = so(t), s = n / Math.pow(10, o);
  return t === "SOL" ? `${s.toFixed(4)} SOL` : `${s.toFixed(2)} ${t}`;
}
function pd(e) {
  return e.length <= 12 ? e : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
function gd(e) {
  const t = new Date(e), n = /* @__PURE__ */ new Date(), o = n.getTime() - t.getTime();
  if (o < 0) return "Just now";
  const s = Math.floor(o / (1e3 * 60 * 60 * 24));
  if (s === 0) {
    const a = Math.floor(o / 36e5);
    if (a === 0) {
      const i = Math.floor(o / 6e4);
      return i < 1 ? "Just now" : `${i}m ago`;
    }
    return `${a}h ago`;
  }
  return s === 1 ? "Yesterday" : s < 7 ? `${s}d ago` : t.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: t.getFullYear() !== n.getFullYear() ? "numeric" : void 0
  });
}
function cu({
  pageSize: e = 10,
  className: t = "",
  onTransactionClick: n,
  explorerUrl: o = "https://solscan.io"
}) {
  const s = o.startsWith("https://") ? o : "https://solscan.io", { getHistory: a, error: i, clearError: c } = po(), [l, f] = x([]), [h, u] = x(0), [m, p] = x(0), [w, v] = x(!1), [C, E] = x(null), k = P(async () => {
    v(!0);
    try {
      const g = await a(e, m);
      f(g.items), u(g.total), E(null);
    } catch (g) {
      E(g instanceof Error ? g.message : "Failed to load withdrawal history");
    } finally {
      v(!1);
    }
  }, [e, m, a]);
  F(() => {
    k();
  }, [k]);
  const N = Math.ceil(h / e), S = Math.floor(m / e) + 1, T = (g) => {
    const b = (g - 1) * e;
    p(Math.max(0, Math.min(b, Math.max(0, h - e))));
  };
  return C || i ? /* @__PURE__ */ d("div", { className: `cedros-withdrawal-history cedros-withdrawal-history-error ${t}`, children: [
    /* @__PURE__ */ r("p", { className: "cedros-withdrawal-error", children: C || i }),
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        className: "cedros-withdrawal-retry",
        onClick: () => {
          c(), E(null), k();
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
          onClick: k,
          disabled: w,
          title: "Refresh",
          children: w ? "..." : "↻"
        }
      )
    ] }),
    l.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-tx-empty", children: /* @__PURE__ */ r("p", { className: "cedros-tx-empty-message", children: "No withdrawal history yet." }) }) : /* @__PURE__ */ d(X, { children: [
      /* @__PURE__ */ r("div", { className: "cedros-tx-list", children: l.map((g) => {
        const b = fd(g.tokenType, g.tokenMint);
        return /* @__PURE__ */ d(
          "div",
          {
            className: "cedros-tx-item cedros-tx-item-negative",
            onClick: () => n?.(g),
            onKeyDown: (y) => {
              (y.key === "Enter" || y.key === " ") && (y.preventDefault(), n?.(g));
            },
            role: n ? "button" : void 0,
            tabIndex: n ? 0 : void 0,
            children: [
              /* @__PURE__ */ r("div", { className: "cedros-tx-icon cedros-tx-icon-negative", children: "↑" }),
              /* @__PURE__ */ d("div", { className: "cedros-tx-content", children: [
                /* @__PURE__ */ d("div", { className: "cedros-tx-row-main", children: [
                  /* @__PURE__ */ d("span", { className: "cedros-tx-type", children: [
                    b,
                    " Withdrawal"
                  ] }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-amount cedros-tx-amount-negative", children: md(g.amount, b) })
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
                        onClick: (y) => y.stopPropagation(),
                        children: pd(g.destination)
                      }
                    ),
                    " · ",
                    /* @__PURE__ */ r(
                      "a",
                      {
                        href: `${s}/tx/${g.txSignature}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: (y) => y.stopPropagation(),
                        children: "tx"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ r("span", { className: "cedros-tx-date", children: gd(g.createdAt) })
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
            onClick: () => T(S - 1),
            disabled: S <= 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ d("span", { className: "cedros-tx-page-info", children: [
          "Page ",
          S,
          " of ",
          N
        ] }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-tx-page-btn",
            onClick: () => T(S + 1),
            disabled: S >= N,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
function lu({
  brandLogo: e,
  brandName: t,
  title: n = "Welcome back",
  subtitle: o = "Login with your Apple or Google account",
  termsText: s,
  onSuccess: a,
  defaultTab: i = "login",
  children: c,
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
      c ?? /* @__PURE__ */ r(Wr, { defaultTab: i, onSuccess: a })
    ] }),
    s && /* @__PURE__ */ r("p", { className: "cedros-terms-footer", children: s })
  ] });
}
function du({
  brandName: e = "Your Brand",
  brandLogo: t,
  tagline: n = "Your tagline goes here. Make it compelling.",
  title: o = "Sign in",
  subtitle: s = "Enter your credentials to access your account",
  onSuccess: a,
  defaultTab: i = "login",
  children: c,
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
      c ?? /* @__PURE__ */ r(Wr, { defaultTab: i, onSuccess: a })
    ] }) })
  ] });
}
function uu() {
  const { config: e, _internal: t } = J(), [n, o] = x({
    allowed: !1,
    reason: void 0,
    isLoading: !1,
    error: null
  }), s = W(
    () => new Oo(
      e.serverUrl,
      e.requestTimeout,
      e.retryAttempts,
      t?.getAccessToken
    ),
    [e.serverUrl, e.requestTimeout, e.retryAttempts, t]
  ), a = P(
    async (l) => {
      o((f) => ({ ...f, isLoading: !0, error: null }));
      try {
        const f = await s.authorize(l), h = {
          allowed: f.allowed,
          reason: f.reason,
          isLoading: !1,
          error: null
        };
        return o(h), h;
      } catch (f) {
        const h = {
          allowed: !1,
          reason: void 0,
          isLoading: !1,
          error: f
        };
        return o(h), h;
      }
    },
    [s]
  ), i = P(
    async (l) => (await a(l)).allowed,
    [a]
  ), c = P(() => {
    o({
      allowed: !1,
      reason: void 0,
      isLoading: !1,
      error: null
    });
  }, []);
  return {
    authorize: i,
    lastCheck: n,
    clearCheck: c,
    checkAuthorization: a
  };
}
function hu() {
  const { listAllWallets: e, createDerivedWallet: t, deleteDerivedWallet: n } = Ye(), [o, s] = x([]), [a, i] = x(!1), [c, l] = x(null), f = P(async () => {
    i(!0), l(null);
    try {
      const p = await e();
      s(p.wallets);
    } catch (p) {
      const w = p instanceof Error ? p.message : "Failed to list wallets";
      l(w);
    } finally {
      i(!1);
    }
  }, [e]), h = P(
    async (p) => {
      i(!0), l(null);
      try {
        const w = await t({ label: p });
        return await f(), w;
      } catch (w) {
        const v = w instanceof Error ? w.message : "Failed to create wallet";
        throw l(v), w;
      } finally {
        i(!1);
      }
    },
    [t, f]
  ), u = P(
    async (p) => {
      i(!0), l(null);
      try {
        await n(p), await f();
      } catch (w) {
        const v = w instanceof Error ? w.message : "Failed to delete wallet";
        throw l(v), w;
      } finally {
        i(!1);
      }
    },
    [n, f]
  ), m = P(() => l(null), []);
  return {
    wallets: o,
    isLoading: a,
    createWallet: h,
    deleteWallet: u,
    refresh: f,
    error: c,
    clearError: m
  };
}
function fu() {
  const e = Oe(), [t, n] = x(!1), [o, s] = x(null), [a, i] = x(null), c = W(() => e ? new ne({
    baseUrl: e.config.serverUrl,
    timeoutMs: e.config.requestTimeout,
    retryAttempts: e.config.retryAttempts,
    getAccessToken: e._internal?.getAccessToken
  }) : null, [e]), l = P(async () => {
    if (!c)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    n(!0), s(null);
    try {
      const u = await c.get("/wallet/pending-recovery");
      i(u);
    } catch (u) {
      const m = V(u, "Failed to fetch pending recovery");
      throw s(m.message), m;
    } finally {
      n(!1);
    }
  }, [c]), f = P(async () => {
    if (!c)
      throw new Error("usePendingRecovery must be used within a CedrosLoginProvider");
    n(!0), s(null);
    try {
      const u = { confirmed: !0 };
      await c.post("/wallet/acknowledge-recovery", u), i(null);
    } catch (u) {
      const m = V(u, "Failed to acknowledge recovery");
      throw s(m.message), m;
    } finally {
      n(!1);
    }
  }, [c]), h = P(() => s(null), []);
  return F(() => {
    c && e?.authState === "authenticated" && l().catch(() => {
    });
  }, [c, e?.authState, l]), {
    hasPendingRecovery: a?.hasPendingRecovery ?? !1,
    recoveryType: a?.recoveryType ?? null,
    recoveryPhrase: a?.recoveryPhrase ?? null,
    expiresAt: a?.expiresAt ? new Date(a.expiresAt) : null,
    fetchPendingRecovery: l,
    acknowledgeRecovery: f,
    isLoading: t,
    error: o,
    clearError: h
  };
}
function mu(e = {}) {
  const { onExternalSign: t } = e, { solanaPubkey: n, hasExternalWallet: o, status: s, isUnlocked: a } = St(), {
    signTransaction: i,
    isSigning: c,
    error: l,
    clearError: f
  } = fc(), h = W(() => o && t ? "external" : s === "enrolled_locked" || s === "enrolled_unlocked" ? "sss" : "none", [o, t, s]), u = h !== "none", m = s === "enrolled_locked" || s === "enrolled_unlocked";
  return {
    signTransaction: P(
      async (w, v) => {
        if (h === "external") {
          if (!t)
            throw new Error("External wallet signing callback not provided");
          return t(w);
        }
        if (h === "sss") {
          if (!v && !a)
            throw new Error(
              "Credential required for signing. Unlock wallet first or provide credential."
            );
          return v ? i(w, v) : i(w);
        }
        throw new Error("No signing method available. Enroll a wallet first.");
      },
      [h, t, a, i]
    ),
    signingMethod: h,
    canSign: u,
    isSigning: c,
    publicKey: n,
    hasExternalWallet: o,
    hasSssWallet: m,
    isSssUnlocked: a,
    error: l,
    clearError: f
  };
}
function pu() {
  const { config: e, _internal: t } = J(), [n, o] = x(null), [s, a] = x(!1), [i, c] = x(null), l = W(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), f = P(async () => {
    a(!0), c(null);
    try {
      await l.post("/welcome-completed", {});
    } catch (u) {
      const m = u instanceof Error ? u : new Error(String(u));
      throw c(m), m;
    } finally {
      a(!1);
    }
  }, [l]), h = P(() => {
    o(null);
  }, []);
  return {
    postLoginAction: n,
    setPostLoginAction: o,
    markWelcomeCompleted: f,
    clearPostLogin: h,
    isLoading: s,
    error: i
  };
}
function gu() {
  const { config: e } = J(), t = e.theme ?? "auto", n = e.unstyled ?? !1, o = Lo({
    theme: n ? void 0 : t,
    themeOverrides: n ? void 0 : e.themeOverrides
  });
  return {
    mode: t,
    isDark: o.className === "cedros-dark",
    className: o.className,
    style: o.style,
    unstyled: n,
    overrides: e.themeOverrides
  };
}
function wd() {
  const { config: e, _internal: t } = J(), [n, o] = x(!1), [s, a] = x(null), [i, c] = x([]), [l, f] = x(0), h = W(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), u = P(async () => {
    o(!0), a(null);
    try {
      const p = await h.post(
        "/access-codes/generate",
        {},
        { credentials: "include" }
      );
      return c((w) => [p, ...w]), f((w) => w + 1), p;
    } catch (p) {
      const w = p instanceof Error ? p : new Error(String(p));
      throw a(w), w;
    } finally {
      o(!1);
    }
  }, [h]), m = P(async () => {
    o(!0), a(null);
    try {
      const p = await h.get("/access-codes/mine", {
        credentials: "include"
      });
      c(p.items), f(p.total);
    } catch (p) {
      const w = p instanceof Error ? p : new Error(String(p));
      throw a(w), w;
    } finally {
      o(!1);
    }
  }, [h]);
  return {
    codes: i,
    total: l,
    generateCode: u,
    fetchCodes: m,
    isLoading: n,
    error: s
  };
}
function wu() {
  const { config: e, _internal: t } = J(), [n, o] = x(!1), [s, a] = x(null), [i, c] = x(null), [l, f] = x(null), [h, u] = x(null), [m, p] = x(null), w = m !== null && m !== "none", v = W(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), C = P(async () => {
    o(!0), a(null);
    try {
      const k = await v.get("/kyc/status", {
        credentials: "include"
      });
      return c(k.status), f(k.verifiedAt ?? null), u(k.expiresAt ?? null), p(k.enforcementMode), k;
    } catch (k) {
      const N = k instanceof Error ? k : new Error(String(k));
      throw a(N), N;
    } finally {
      o(!1);
    }
  }, [v]), E = P(async () => {
    o(!0), a(null);
    try {
      const k = await v.post(
        "/kyc/start",
        void 0,
        { credentials: "include" }
      );
      return c("pending"), k.redirectUrl;
    } catch (k) {
      const N = k instanceof Error ? k : new Error(String(k));
      throw a(N), N;
    } finally {
      o(!1);
    }
  }, [v]);
  return {
    status: i,
    verifiedAt: l,
    expiresAt: h,
    isRequired: w,
    enforcementMode: m,
    fetchStatus: C,
    startVerification: E,
    isLoading: n,
    error: s
  };
}
function yd() {
  const { config: e, _internal: t } = J(), [n, o] = x(!1), [s, a] = x(null), [i, c] = x(null), [l, f] = x([]), [h, u] = x(0), m = W(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), p = P(async () => {
    o(!0), a(null);
    try {
      const C = await m.get("/referral/rewards", {
        credentials: "include"
      });
      return c(C), C;
    } catch (C) {
      const E = C instanceof Error ? C : new Error(String(C));
      throw a(E), E;
    } finally {
      o(!1);
    }
  }, [m]), w = P(
    async (C = 10, E = 0) => {
      o(!0), a(null);
      try {
        const k = await m.get(
          `/referral/rewards/history?limit=${C}&offset=${E}`,
          { credentials: "include" }
        );
        return f(k.items), u(k.total), k;
      } catch (k) {
        const N = k instanceof Error ? k : new Error(String(k));
        throw a(N), N;
      } finally {
        o(!1);
      }
    },
    [m]
  ), v = P(
    async (C) => {
      o(!0), a(null);
      try {
        await m.post(
          "/referral/payout-wallet",
          { walletAddress: C },
          { credentials: "include" }
        ), c(
          (E) => E && { ...E, payoutWalletAddress: C }
        );
      } catch (E) {
        const k = E instanceof Error ? E : new Error(String(E));
        throw a(k), k;
      } finally {
        o(!1);
      }
    },
    [m]
  );
  return {
    rewards: i,
    history: l,
    historyTotal: h,
    fetchRewards: p,
    fetchHistory: w,
    setPayoutWallet: v,
    isLoading: n,
    error: s
  };
}
function yr(e, t) {
  return t === "SOL" ? (e / 1e9).toFixed(4) + " SOL" : "$" + (e / 1e6).toFixed(2);
}
function bd(e) {
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
const Ad = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
function vd(e) {
  return Ad.test(e);
}
function Nd(e) {
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
function kd({ status: e }) {
  const n = {
    pending: "cedros-rewards-panel__badge--pending",
    completed: "cedros-rewards-panel__badge--completed",
    failed: "cedros-rewards-panel__badge--failed",
    credited: "cedros-rewards-panel__badge--credited"
  }[e] ?? "cedros-rewards-panel__badge--pending";
  return /* @__PURE__ */ r("span", { className: `cedros-rewards-panel__badge ${n}`, children: e.charAt(0).toUpperCase() + e.slice(1) });
}
const ut = 10;
function yu({ explorerUrl: e = "https://explorer.solana.com", className: t }) {
  const {
    rewards: n,
    history: o,
    historyTotal: s,
    fetchRewards: a,
    fetchHistory: i,
    setPayoutWallet: c,
    isLoading: l,
    error: f
  } = yd(), [h, u] = x(0), [m, p] = x(""), [w, v] = x(null), [C, E] = x(!1), [k, N] = x(!1);
  F(() => {
    a().catch(() => {
    }), i(ut, 0).catch(() => {
    });
  }, [a, i]), F(() => {
    n?.payoutWalletAddress != null && p(n.payoutWalletAddress);
  }, [n?.payoutWalletAddress]);
  const S = P(
    (y) => {
      u(y), i(ut, y * ut).catch(() => {
      });
    },
    [i]
  ), T = Math.ceil(s / ut), g = P(async () => {
    const y = m.trim();
    if (y !== "" && !vd(y)) {
      v("Invalid address. Must be a base58 string between 32 and 44 characters.");
      return;
    }
    v(null), E(!0), N(!1);
    try {
      await c(y === "" ? null : y), N(!0);
    } catch (A) {
      v(A instanceof Error ? A.message : "Failed to save wallet address.");
    } finally {
      E(!1);
    }
  }, [m, c]), b = n?.rewardType === "direct_payout" ? "Direct Payout" : "Credits";
  return /* @__PURE__ */ d(
    "div",
    {
      className: `cedros-rewards-panel ${t ?? ""}`.trim(),
      "aria-label": "Rewards dashboard",
      children: [
        f && /* @__PURE__ */ r("div", { className: "cedros-rewards-panel__error", role: "alert", children: f.message }),
        /* @__PURE__ */ d(
          "section",
          {
            className: "cedros-rewards-panel__summary",
            "aria-label": "Rewards summary",
            children: [
              /* @__PURE__ */ d("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-label", children: "Total Earned" }),
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-value", children: n ? yr(n.totalEarned, n.currency) : "—" })
              ] }),
              /* @__PURE__ */ d("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-label", children: "Pending Payouts" }),
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-value", children: n ? `${yr(n.pendingAmount, n.currency)} (${n.pendingCount})` : "—" })
              ] }),
              /* @__PURE__ */ d("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-label", children: "Referrals" }),
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-value", children: n ? String(n.referralCount) : "—" })
              ] }),
              /* @__PURE__ */ d("div", { className: "cedros-rewards-panel__card", children: [
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-label", children: "Reward Type" }),
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__card-value", children: /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__type-badge", children: b }) })
              ] })
            ]
          }
        ),
        n?.rewardType === "direct_payout" && /* @__PURE__ */ d(
          "section",
          {
            className: "cedros-rewards-panel__wallet-section",
            "aria-label": "Payout wallet",
            children: [
              /* @__PURE__ */ r("h3", { className: "cedros-rewards-panel__section-title", children: "Payout Wallet" }),
              /* @__PURE__ */ d("div", { className: "cedros-rewards-panel__wallet-current", children: [
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__wallet-label", children: "Current address:" }),
                /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__wallet-address", children: n.payoutWalletAddress ?? "Not set" })
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
                    value: m,
                    onChange: (y) => {
                      p(y.target.value), v(null), N(!1);
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
                    onClick: g,
                    disabled: C || l,
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
              l && o.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-rewards-panel__loading", "aria-busy": "true", children: "Loading..." }) : o.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-rewards-panel__empty", children: "No rewards yet." }) : /* @__PURE__ */ d(X, { children: [
                /* @__PURE__ */ r("div", { className: "cedros-rewards-panel__table-wrapper", role: "region", "aria-label": "Reward history table", tabIndex: 0, children: /* @__PURE__ */ d("table", { className: "cedros-rewards-panel__table", children: [
                  /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ d("tr", { children: [
                    /* @__PURE__ */ r("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Date" }),
                    /* @__PURE__ */ r("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Type" }),
                    /* @__PURE__ */ r("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Amount" }),
                    /* @__PURE__ */ r("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Status" }),
                    /* @__PURE__ */ r("th", { scope: "col", className: "cedros-rewards-panel__th", children: "Transaction" })
                  ] }) }),
                  /* @__PURE__ */ r("tbody", { children: o.map((y) => /* @__PURE__ */ d("tr", { className: "cedros-rewards-panel__tr", children: [
                    /* @__PURE__ */ r("td", { className: "cedros-rewards-panel__td", children: bd(y.createdAt) }),
                    /* @__PURE__ */ r("td", { className: "cedros-rewards-panel__td", children: Nd(y.triggerType) }),
                    /* @__PURE__ */ r("td", { className: "cedros-rewards-panel__td", children: yr(y.amount, y.currency) }),
                    /* @__PURE__ */ r("td", { className: "cedros-rewards-panel__td", children: /* @__PURE__ */ r(kd, { status: y.status }) }),
                    /* @__PURE__ */ r("td", { className: "cedros-rewards-panel__td", children: y.txSignature ? /* @__PURE__ */ d(
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
                    ) : /* @__PURE__ */ r("span", { className: "cedros-rewards-panel__tx-none", children: "—" }) })
                  ] }, y.id)) })
                ] }) }),
                T > 1 && /* @__PURE__ */ d(
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
                          onClick: () => S(h - 1),
                          disabled: h === 0 || l,
                          "aria-label": "Previous page",
                          children: "Previous"
                        }
                      ),
                      /* @__PURE__ */ d("span", { className: "cedros-rewards-panel__page-info", children: [
                        h + 1,
                        " / ",
                        T
                      ] }),
                      /* @__PURE__ */ r(
                        "button",
                        {
                          type: "button",
                          className: "cedros-rewards-panel__page-btn",
                          onClick: () => S(h + 1),
                          disabled: h >= T - 1 || l,
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
function Xn(e) {
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
function Jn(e) {
  return e.expiresAt && new Date(e.expiresAt) < /* @__PURE__ */ new Date() ? "expired" : e.maxUses !== null && e.currentUses >= e.maxUses ? "used" : "active";
}
function Ed({ status: e }) {
  return /* @__PURE__ */ r("span", { className: `cedros-invite-panel__badge ${{
    active: "cedros-invite-panel__badge--active",
    used: "cedros-invite-panel__badge--used",
    expired: "cedros-invite-panel__badge--expired"
  }[e] ?? ""}`, children: e.charAt(0).toUpperCase() + e.slice(1) });
}
function Cd({ text: e }) {
  const [t, n] = x(!1), o = P(async () => {
    try {
      await navigator.clipboard.writeText(e), n(!0), setTimeout(() => n(!1), 2e3);
    } catch {
    }
  }, [e]);
  return /* @__PURE__ */ r(
    "button",
    {
      type: "button",
      className: "cedros-invite-panel__copy-btn",
      onClick: o,
      "aria-label": t ? "Copied" : `Copy code ${e}`,
      title: t ? "Copied!" : "Copy to clipboard",
      children: t ? "✓" : "Copy"
    }
  );
}
function bu({ className: e }) {
  const { codes: t, total: n, generateCode: o, fetchCodes: s, isLoading: a, error: i } = wd(), [c, l] = x(!1), [f, h] = x(null);
  F(() => {
    s().catch(() => {
    });
  }, [s]);
  const u = P(async () => {
    l(!0), h(null);
    try {
      await o();
    } catch (p) {
      h(p instanceof Error ? p.message : "Failed to generate invite code.");
    } finally {
      l(!1);
    }
  }, [o]), m = t.filter((p) => Jn(p) === "active").length;
  return /* @__PURE__ */ d(
    "div",
    {
      className: `cedros-invite-panel ${e ?? ""}`.trim(),
      "aria-label": "Invite code panel",
      children: [
        /* @__PURE__ */ d("div", { className: "cedros-invite-panel__header", children: [
          /* @__PURE__ */ r("h2", { className: "cedros-invite-panel__title", children: "Invite Codes" }),
          /* @__PURE__ */ d("span", { className: "cedros-invite-panel__budget", "aria-live": "polite", children: [
            m,
            " active · ",
            n,
            " total"
          ] })
        ] }),
        i && /* @__PURE__ */ r("div", { className: "cedros-invite-panel__error", role: "alert", children: i.message }),
        f && /* @__PURE__ */ r("div", { className: "cedros-invite-panel__error", role: "alert", children: f }),
        /* @__PURE__ */ r(
          "button",
          {
            type: "button",
            className: "cedros-button cedros-button-primary cedros-button-md",
            onClick: u,
            disabled: c || a,
            "aria-busy": c,
            children: c ? "Generating..." : "Generate Invite Code"
          }
        ),
        /* @__PURE__ */ r("section", { className: "cedros-invite-panel__list-section", "aria-label": "Your invite codes", children: a && t.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-invite-panel__loading", "aria-busy": "true", children: "Loading..." }) : t.length === 0 ? /* @__PURE__ */ r("div", { className: "cedros-invite-panel__empty", children: "No invite codes yet. Generate one above." }) : /* @__PURE__ */ r(
          "div",
          {
            className: "cedros-invite-panel__table-wrapper",
            role: "region",
            "aria-label": "Invite codes table",
            tabIndex: 0,
            children: /* @__PURE__ */ d("table", { className: "cedros-invite-panel__table", children: [
              /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ d("tr", { children: [
                /* @__PURE__ */ r("th", { scope: "col", className: "cedros-invite-panel__th", children: "Code" }),
                /* @__PURE__ */ r("th", { scope: "col", className: "cedros-invite-panel__th", children: "Uses" }),
                /* @__PURE__ */ r("th", { scope: "col", className: "cedros-invite-panel__th", children: "Created" }),
                /* @__PURE__ */ r("th", { scope: "col", className: "cedros-invite-panel__th", children: "Expires" }),
                /* @__PURE__ */ r("th", { scope: "col", className: "cedros-invite-panel__th", children: "Status" }),
                /* @__PURE__ */ r("th", { scope: "col", className: "cedros-invite-panel__th", children: /* @__PURE__ */ r("span", { className: "cedros-sr-only", children: "Actions" }) })
              ] }) }),
              /* @__PURE__ */ r("tbody", { children: t.map((p) => {
                const w = Jn(p), v = p.maxUses !== null ? `${p.currentUses} / ${p.maxUses}` : `${p.currentUses}`;
                return /* @__PURE__ */ d("tr", { className: "cedros-invite-panel__tr", children: [
                  /* @__PURE__ */ r("td", { className: "cedros-invite-panel__td cedros-invite-panel__td--code", children: /* @__PURE__ */ r("code", { className: "cedros-invite-panel__code", children: p.code }) }),
                  /* @__PURE__ */ r("td", { className: "cedros-invite-panel__td", children: v }),
                  /* @__PURE__ */ r("td", { className: "cedros-invite-panel__td", children: Xn(p.createdAt) }),
                  /* @__PURE__ */ r("td", { className: "cedros-invite-panel__td", children: p.expiresAt ? Xn(p.expiresAt) : "—" }),
                  /* @__PURE__ */ r("td", { className: "cedros-invite-panel__td", children: /* @__PURE__ */ r(Ed, { status: w }) }),
                  /* @__PURE__ */ r("td", { className: "cedros-invite-panel__td", children: /* @__PURE__ */ r(Cd, { text: p.code }) })
                ] }, p.id);
              }) })
            ] })
          }
        ) })
      ]
    }
  );
}
function Au({
  status: e,
  startVerification: t,
  className: n
}) {
  const [o, s] = x(!1), [a, i] = x(null), c = P(async () => {
    s(!0), i(null);
    try {
      const h = await t();
      h && (window.location.href = h);
    } catch (h) {
      i(
        h instanceof Error ? h.message : "Failed to start verification"
      );
    } finally {
      s(!1);
    }
  }, [t]);
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
  const f = e !== "pending";
  return /* @__PURE__ */ d(
    "div",
    {
      className: `cedros-kyc-banner ${n ?? ""}`,
      role: "alert",
      children: [
        /* @__PURE__ */ d("div", { className: "cedros-kyc-banner-content", children: [
          /* @__PURE__ */ r("span", { className: "cedros-kyc-banner-message", children: l }),
          f && /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              className: "cedros-kyc-banner-button",
              onClick: c,
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
const xd = 3e3, Sd = 6e4;
function _d(e) {
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
function vu({ fetchStatus: e, onComplete: t, className: n }) {
  const [o, s] = x(null), [a, i] = x(!1), c = Q(t), l = Q(e);
  F(() => {
    c.current = t, l.current = e;
  }, [t, e]), F(() => {
    let h = !1, u = null;
    const m = setTimeout(() => {
      i(!0), u !== null && clearInterval(u);
    }, Sd), p = async () => {
      try {
        const w = await l.current();
        if (h) return;
        s(w.status), w.status !== "pending" && (clearTimeout(m), u !== null && clearInterval(u), c.current?.(w.status));
      } catch {
      }
    };
    return p(), u = setInterval(p, xd), () => {
      h = !0, clearTimeout(m), u !== null && clearInterval(u);
    };
  }, []);
  const f = !o || o === "pending";
  return /* @__PURE__ */ r("div", { className: `cedros-kyc-callback ${n ?? ""}`, role: "status", "aria-live": "polite", children: a && f ? /* @__PURE__ */ d("div", { className: "cedros-kyc-callback-content", children: [
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
  ] }) : f ? /* @__PURE__ */ d("div", { className: "cedros-kyc-callback-content", children: [
    /* @__PURE__ */ r("span", { className: "cedros-kyc-callback-spinner", "aria-hidden": "true" }),
    /* @__PURE__ */ r("p", { className: "cedros-kyc-callback-message", children: "Processing your verification..." })
  ] }) : /* @__PURE__ */ d("div", { className: "cedros-kyc-callback-content", children: [
    /* @__PURE__ */ r(
      "p",
      {
        className: `cedros-kyc-callback-message cedros-kyc-callback-message--${o}`,
        children: _d(o)
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
function Bd() {
  const { config: e, _internal: t } = J(), [n, o] = x(!1), [s, a] = x(null), [i, c] = x(null), [l, f] = x(null), [h, u] = x(null), [m, p] = x(null), w = m !== null && m !== "none", v = W(
    () => new ne({
      baseUrl: e.serverUrl,
      timeoutMs: e.requestTimeout,
      getAccessToken: t?.getAccessToken
    }),
    [e.serverUrl, e.requestTimeout, t]
  ), C = P(async () => {
    o(!0), a(null);
    try {
      const S = await v.get("/accreditation/status", {
        credentials: "include"
      });
      return c(S.status), f(S.verifiedAt ?? null), u(S.expiresAt ?? null), p(S.enforcementMode), S;
    } catch (S) {
      const T = S instanceof Error ? S : new Error(String(S));
      throw a(T), T;
    } finally {
      o(!1);
    }
  }, [v]), E = P(
    async (S, T) => {
      o(!0), a(null);
      try {
        const g = await v.post(
          "/accreditation/submit",
          { method: S, ...T },
          { credentials: "include" }
        );
        return c("pending"), g;
      } catch (g) {
        const b = g instanceof Error ? g : new Error(String(g));
        throw a(b), b;
      } finally {
        o(!1);
      }
    },
    [v]
  ), k = P(
    async (S, T, g) => {
      o(!0), a(null);
      try {
        const b = new FormData();
        b.append("submissionId", S), b.append("documentType", g), b.append("file", T);
        const y = t?.getAccessToken?.(), A = {};
        y && (A.Authorization = `Bearer ${y}`);
        const B = await fetch(`${e.serverUrl}/accreditation/upload`, {
          method: "POST",
          headers: A,
          credentials: "include",
          body: b
        });
        if (!B.ok) {
          const _ = await B.text().catch(() => B.statusText);
          throw new Error(`Upload failed (${B.status}): ${_}`);
        }
        return B.json();
      } catch (b) {
        const y = b instanceof Error ? b : new Error(String(b));
        throw a(y), y;
      } finally {
        o(!1);
      }
    },
    [e.serverUrl, t]
  ), N = P(async () => {
    o(!0), a(null);
    try {
      return (await v.get(
        "/accreditation/submissions",
        { credentials: "include" }
      )).submissions;
    } catch (S) {
      const T = S instanceof Error ? S : new Error(String(S));
      throw a(T), T;
    } finally {
      o(!1);
    }
  }, [v]);
  return {
    status: i,
    verifiedAt: l,
    expiresAt: h,
    isRequired: w,
    enforcementMode: m,
    fetchStatus: C,
    submitVerification: E,
    uploadDocument: k,
    listSubmissions: N,
    isLoading: n,
    error: s
  };
}
const es = [
  { method: "income", label: "Income", description: "Verify via annual income ($200K+ individual / $300K+ joint)" },
  { method: "net_worth", label: "Net Worth", description: "Verify via net worth ($1M+ excluding primary residence)" },
  { method: "credential", label: "Professional Credential", description: "Verify via FINRA license (Series 7, 65, or 82)" },
  { method: "third_party_letter", label: "Third-Party Letter", description: "Upload a verification letter from a CPA, attorney, or RIA" },
  { method: "insider", label: "Insider / Officer", description: "Self-certify as a director, executive officer, or general partner" },
  { method: "investment_threshold", label: "Investment Threshold", description: "Qualify via investment commitment ($200K+ individual / $1M+ entity)" }
];
function ht({ label: e, acceptedTypes: t = ".pdf,.jpg,.jpeg,.png,.tiff", documentType: n, files: o, onFilesChange: s, maxFiles: a = 5 }) {
  const i = Q(null), [c, l] = x(!1), f = P((u) => {
    if (!u) return;
    const m = Array.from(u), p = [...o, ...m].slice(0, a);
    s(p);
  }, [o, a, s]), h = (u) => {
    s(o.filter((m, p) => p !== u));
  };
  return /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__upload-zone", children: [
    /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__upload-label", children: e }),
    /* @__PURE__ */ d(
      "div",
      {
        className: `cedros-accreditation-wizard__drop-area${c ? " cedros-accreditation-wizard__drop-area--active" : ""}`,
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
          u.preventDefault(), l(!1), f(u.dataTransfer.files);
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
        onChange: (u) => f(u.target.files),
        "aria-hidden": "true"
      }
    ),
    o.length > 0 && /* @__PURE__ */ r("ul", { className: "cedros-accreditation-wizard__file-list", "aria-label": "Uploaded files", children: o.map((u, m) => /* @__PURE__ */ d("li", { className: "cedros-accreditation-wizard__file-item", children: [
      /* @__PURE__ */ r("span", { children: u.name }),
      /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__file-remove", onClick: () => h(m), "aria-label": `Remove ${u.name}`, children: "Remove" })
    ] }, `${u.name}-${m}`)) })
  ] });
}
function Ld(e, t, n, o) {
  t({ ...e, [n]: o });
}
function ft(e, t) {
  return e.filter((n) => n.documentType === t).map((n) => n.file);
}
function mt(e, t, n, o) {
  const s = e.filter((a) => a.documentType !== t);
  o([...s, ...n.map((a) => ({ file: a, documentType: t }))]);
}
function Td({ method: e, formData: t, onFormDataChange: n, fileEntries: o, onFileEntriesChange: s }) {
  const a = (i, c) => Ld(t, n, i, c);
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
    /* @__PURE__ */ r(ht, { label: "Upload tax documents (W-2, 1040, 1099, K-1) from the last 2 years", documentType: "tax_return", files: ft(o, "tax_return"), onFilesChange: (i) => mt(o, "tax_return", i, s) })
  ] }) : e === "net_worth" ? /* @__PURE__ */ d("fieldset", { className: "cedros-accreditation-wizard__fieldset", children: [
    /* @__PURE__ */ r("legend", { className: "cedros-accreditation-wizard__fieldset-legend", children: "Net Worth Details" }),
    /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__field", children: [
      /* @__PURE__ */ r("label", { className: "cedros-accreditation-wizard__label", htmlFor: "netWorthAmount", children: "Stated net worth (USD, excluding primary residence)" }),
      /* @__PURE__ */ r("input", { id: "netWorthAmount", type: "number", min: 0, className: "cedros-accreditation-wizard__input", value: t.statedAmountUsd ?? "", onChange: (i) => a("statedAmountUsd", i.target.valueAsNumber) })
    ] }),
    /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__note", children: "Documents must be dated within the last 90 days." }),
    /* @__PURE__ */ r(ht, { label: "Upload asset documents (bank/brokerage statements, property appraisals)", documentType: "asset_statement", files: ft(o, "asset_statement"), onFilesChange: (i) => mt(o, "asset_statement", i, s) }),
    /* @__PURE__ */ r(ht, { label: "Upload liability documents (credit report)", documentType: "liability_statement", files: ft(o, "liability_statement"), onFilesChange: (i) => mt(o, "liability_statement", i, s) })
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
    /* @__PURE__ */ r(ht, { label: "Upload verification letter from a CPA, attorney, RIA, or broker-dealer", documentType: "letter", files: ft(o, "letter"), onFilesChange: (i) => mt(o, "letter", i, s), maxFiles: 1 })
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
function Nu({ onComplete: e, onCancel: t, className: n }) {
  const { submitVerification: o, uploadDocument: s, isLoading: a, error: i } = Bd(), [c, l] = x(1), [f, h] = x(null), [u, m] = x({}), [p, w] = x([]), [v, C] = x(!1), [E, k] = x(null), N = (b) => {
    h(b), l(2);
  }, S = () => {
    c === 2 ? l(1) : c === 3 ? l(2) : t?.();
  }, T = P(async () => {
    if (f) {
      k(null);
      try {
        const { submissionId: b } = await o(f, u);
        for (const y of p)
          await s(b, y.file, y.documentType);
        C(!0), e?.(b);
      } catch (b) {
        k(b instanceof Error ? b.message : "Submission failed. Please try again.");
      }
    }
  }, [f, u, p, o, s, e]), g = es.find((b) => b.method === f);
  return v ? /* @__PURE__ */ r("div", { className: `cedros-accreditation-wizard cedros-accreditation-wizard--success ${n ?? ""}`, role: "status", children: /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__success-message", children: "Submitted for review. You will be notified once your accreditation is verified." }) }) : /* @__PURE__ */ d("div", { className: `cedros-accreditation-wizard ${n ?? ""}`, children: [
    /* @__PURE__ */ r("div", { className: "cedros-accreditation-wizard__header", children: /* @__PURE__ */ r("nav", { className: "cedros-accreditation-wizard__steps", "aria-label": "Wizard steps", children: ["Choose Method", "Fill Details", "Review & Submit"].map((b, y) => /* @__PURE__ */ d("span", { className: `cedros-accreditation-wizard__step${c === y + 1 ? " cedros-accreditation-wizard__step--active" : ""}`, "aria-current": c === y + 1 ? "step" : void 0, children: [
      y + 1,
      ". ",
      b
    ] }, b)) }) }),
    c === 1 && /* @__PURE__ */ d("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step1-heading", children: [
      /* @__PURE__ */ r("h2", { id: "step1-heading", className: "cedros-accreditation-wizard__section-title", children: "Choose Verification Method" }),
      /* @__PURE__ */ r("div", { className: "cedros-accreditation-wizard__method-grid", role: "list", children: es.map((b) => /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          role: "listitem",
          className: "cedros-accreditation-wizard__method-card",
          onClick: () => N(b.method),
          children: [
            /* @__PURE__ */ r("span", { className: "cedros-accreditation-wizard__method-title", children: b.label }),
            /* @__PURE__ */ r("span", { className: "cedros-accreditation-wizard__method-desc", children: b.description })
          ]
        },
        b.method
      )) }),
      t && /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__cancel", onClick: t, children: "Cancel" })
    ] }),
    c === 2 && f && /* @__PURE__ */ d("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step2-heading", children: [
      /* @__PURE__ */ r("h2", { id: "step2-heading", className: "cedros-accreditation-wizard__section-title", children: g?.label }),
      /* @__PURE__ */ r(Td, { method: f, formData: u, onFormDataChange: m, fileEntries: p, onFileEntriesChange: w }),
      /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__actions", children: [
        /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__back", onClick: S, children: "Back" }),
        /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__next", onClick: () => l(3), children: "Review" })
      ] })
    ] }),
    c === 3 && f && /* @__PURE__ */ d("section", { className: "cedros-accreditation-wizard__section", "aria-labelledby": "step3-heading", children: [
      /* @__PURE__ */ r("h2", { id: "step3-heading", className: "cedros-accreditation-wizard__section-title", children: "Review & Submit" }),
      /* @__PURE__ */ d("dl", { className: "cedros-accreditation-wizard__review-list", children: [
        /* @__PURE__ */ r("dt", { className: "cedros-accreditation-wizard__review-term", children: "Method" }),
        /* @__PURE__ */ r("dd", { className: "cedros-accreditation-wizard__review-detail", children: g?.label }),
        Object.entries(u).filter(([, b]) => b !== void 0 && b !== "" && b !== null).map(([b, y]) => /* @__PURE__ */ d("div", { children: [
          /* @__PURE__ */ r("dt", { className: "cedros-accreditation-wizard__review-term", children: b }),
          /* @__PURE__ */ r("dd", { className: "cedros-accreditation-wizard__review-detail", children: String(y) })
        ] }, b))
      ] }),
      p.length > 0 && /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__review-files", children: [
        /* @__PURE__ */ r("p", { className: "cedros-accreditation-wizard__review-files-heading", children: "Documents to upload:" }),
        /* @__PURE__ */ r("ul", { children: p.map((b, y) => /* @__PURE__ */ d("li", { children: [
          b.file.name,
          " ",
          /* @__PURE__ */ d("span", { className: "cedros-accreditation-wizard__doc-type", children: [
            "(",
            b.documentType,
            ")"
          ] })
        ] }, `${b.file.name}-${y}`)) })
      ] }),
      (i || E) && /* @__PURE__ */ r("div", { className: "cedros-accreditation-wizard__error", role: "alert", children: E ?? i?.message }),
      /* @__PURE__ */ d("div", { className: "cedros-accreditation-wizard__actions", children: [
        /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__back", onClick: S, disabled: a, children: "Back" }),
        /* @__PURE__ */ r("button", { type: "button", className: "cedros-accreditation-wizard__submit", onClick: T, disabled: a, children: a ? "Submitting..." : "Submit Verification" })
      ] })
    ] })
  ] });
}
function ku({
  status: e,
  onStartVerification: t,
  className: n
}) {
  if (e === "approved")
    return null;
  let o, s = !0;
  switch (e) {
    case "pending":
      o = "Your accreditation is under review.", s = !1;
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
      className: `cedros-accreditation-banner ${n ?? ""}`,
      role: "alert",
      children: /* @__PURE__ */ d("div", { className: "cedros-accreditation-banner__content", children: [
        /* @__PURE__ */ r("span", { className: "cedros-accreditation-banner__message", children: o }),
        s && t && /* @__PURE__ */ r(
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
const Gr = Uo(null), Br = {
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
function Pd(e, t) {
  return go(e, t);
}
function go(e, t) {
  const n = { ...e };
  for (const o in t)
    if (Object.prototype.hasOwnProperty.call(t, o)) {
      const s = e[o], a = t[o];
      typeof s == "object" && s !== null && typeof a == "object" && a !== null ? n[o] = go(
        s,
        a
      ) : a !== void 0 && (n[o] = a);
    }
  return n;
}
function Eu({
  children: e,
  locale: t = "en",
  translations: n
}) {
  const o = W(() => ({ t: n ? Pd(Br, n) : Br, locale: t }), [n, t]);
  return /* @__PURE__ */ r(Gr.Provider, { value: o, children: e });
}
function Cu() {
  return ds(Gr)?.t ?? Br;
}
function xu() {
  return ds(Gr)?.locale ?? "en";
}
export {
  eu as AccountSettings,
  ku as AccreditationBanner,
  Nu as AccreditationWizard,
  Uh as AdminAccessCodes,
  Th as AdminAccreditationQueue,
  zh as AdminDepositList,
  Wh as AdminDepositStats,
  qh as AdminPrivacyPeriodDeposits,
  Sh as AdminReferralPayouts,
  Rh as AdminSanctionsPanel,
  Eh as AdminUserList,
  jh as AdminWithdrawalHistory,
  Hh as AdminWithdrawalQueue,
  Vh as AdminWithdrawalStats,
  th as AppleLoginButton,
  Gh as AuthenticationSettings,
  Yd as CapabilityWarning,
  Bu as CedrosLoginProvider,
  nu as ChooseUsernamePrompt,
  ru as CompleteAccountPrompt,
  Yh as ComplianceSettings,
  ou as CreditBalance,
  ef as CreditSystemSettings,
  Nl as DeleteAccountSection,
  su as DepositFlow,
  Qu as EmailLoginForm,
  Yu as EmailRegisterForm,
  nf as EmailSettings,
  of as EmbeddedWalletSettings,
  Oi as ErrorBoundary,
  oe as ErrorMessage,
  Lu as FEATURE_FLAG_ENV_PREFIX,
  Tu as FEATURE_FLAG_REGISTRY,
  rh as ForgotPasswordForm,
  lu as FullPageLayout,
  ph as GoogleLoginButton,
  au as History,
  Eu as I18nProvider,
  bu as InviteCodePanel,
  yh as InviteForm,
  bh as InviteList,
  Au as KycBanner,
  vu as KycCallback,
  fl as LinkedAccounts,
  G as LoadingSpinner,
  Vd as LoginButton,
  Wr as LoginForm,
  $d as LoginModal,
  Ah as MemberList,
  tu as MfaSetupPrompt,
  Gd as OrgSelector,
  Qd as OrgSwitcher,
  hs as OtpInput,
  nh as PasskeyLoginButton,
  pc as PasskeyPrompt,
  pe as PasswordInput,
  tf as PrivacyCashSettings,
  Xd as ProfileDropdown,
  ul as ProfileTab,
  sc as RecoveryPhraseDisplay,
  oc as RecoveryPhraseInput,
  Kh as ReferralSettings,
  fh as ResetPasswordForm,
  yu as RewardsPanel,
  jr as SUPPORTED_TOKENS,
  Zh as SecuritySettings,
  cf as ServerSettings,
  Zi as SessionList,
  df as SettingsPageLayout,
  sh as SetupWizard,
  Xh as SignupSettings,
  zi as SolanaLoginButton,
  du as SplitPageLayout,
  Zd as SystemSettings,
  ho as TieredAmountSlider,
  Bh as TokenGateSettings,
  Jl as TokenSelector,
  ol as TotpSettings,
  Xs as TotpSetup,
  Ku as TotpVerify,
  Jd as UserProfileSettings,
  Bc as WalletAddressRow,
  hc as WalletEnrollment,
  Kd as WalletManager,
  Ec as WalletRecovery,
  Lc as WalletStatus,
  bc as WalletUnlock,
  uf as WebhookSettings,
  iu as WithdrawalFlow,
  cu as WithdrawalHistory,
  Br as defaultTranslations,
  Pu as getAutoDiscoverableFeatureDefaults,
  Ru as getAutoDiscoverableFeatureFlagNames,
  Mu as getDefaultFeatureFlags,
  Uu as getEmbeddedWalletInfo,
  Du as getFeatureFlagDefinition,
  Iu as getFeatureFlagDefinitions,
  Fu as getFeatureFlagEnvVar,
  Vr as getTierForAmount,
  zu as isEmbeddedWalletAvailable,
  Wu as isFeatureEnabled,
  Pd as mergeTranslations,
  Ou as parseFeatureFlagBoolean,
  qu as readFeatureFlagEnv,
  dh as registerMobileWallet,
  ju as resolveFeatureFlags,
  wd as useAccessCodes,
  vl as useAccountDeletion,
  Bd as useAccreditation,
  Ih as useAdminDeposits,
  Ch as useAdminUsers,
  oh as useAppleAuth,
  _t as useAuth,
  Vu as useAuthState,
  $u as useAuthUI,
  uu as useAuthorize,
  J as useCedrosLogin,
  gu as useCedrosTheme,
  Js as useCredentials,
  mo as useCredits,
  _l as useDeposit,
  Zu as useEmailAuth,
  gh as useGoogleAuth,
  ah as useInstantLink,
  vh as useInvites,
  wu as useKyc,
  xu as useLocale,
  Nh as useMembers,
  ih as useOrgs,
  mc as usePasskeySigning,
  zo as usePasswordReset,
  fu as usePendingRecovery,
  pu as usePostLogin,
  Lt as useProfile,
  il as useReferral,
  yd as useRewards,
  Xu as useServerFeatures,
  El as useSessions,
  dc as useSetPassword,
  ch as useSetup,
  uh as useSolanaAuth,
  Do as useSystemSettings,
  Zs as useTotp,
  Ju as useTotpVerify,
  mu as useTransactionSigning,
  Cu as useTranslations,
  Sl as useUsername,
  St as useWallet,
  lc as useWalletEnrollment,
  Ye as useWalletMaterial,
  kc as useWalletRecovery,
  fc as useWalletSigning,
  hu as useWallets,
  Wo as useWebAuthn,
  po as useWithdrawal,
  Tr as validatePassword
};
