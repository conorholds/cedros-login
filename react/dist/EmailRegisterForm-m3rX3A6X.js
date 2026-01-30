import { jsxs as O, jsx as k, Fragment as fe } from "react/jsx-runtime";
import { useRef as bt, useState as D, useCallback as M, useEffect as _e, useMemo as He, useId as wt } from "react";
import { D as Oe, b as Kt, t as Ae, c as Wt, w as yt, g as Yt, d as Xt, e as Ft, f as Qt, i as Be, A as ve, j as Jt, u as de, h as ue, L as Ge, E as xt } from "./ErrorMessage-Bm1j5mBT.js";
import { b as Ue, v as er } from "./validation-BebL7hMF.js";
let ne = null, tr = 0;
const le = /* @__PURE__ */ new Map();
function rr() {
  return typeof Worker > "u" ? null : (ne || (ne = new Worker(new URL(
    /* @vite-ignore */
    "/assets/argon2Worker-Bi5TuQvD.js",
    import.meta.url
  ), {
    type: "module"
  }), ne.onmessage = (t) => {
    const { id: e, key: r, error: n } = t.data, s = le.get(e);
    if (s) {
      if (le.delete(e), n) {
        s.reject(new Error(n));
        return;
      }
      if (!r) {
        s.reject(new Error("Argon2 worker returned no key"));
        return;
      }
      s.resolve(r);
    }
  }, ne.onerror = (t) => {
    const e = t instanceof ErrorEvent ? t.error : new Error("Argon2 worker error");
    for (const r of le.values())
      r.reject(e instanceof Error ? e : new Error(String(e)));
    le.clear(), ne?.terminate(), ne = null;
  }), ne);
}
async function nr(t, e, r = Oe) {
  const n = rr();
  return n ? new Promise((s, o) => {
    const c = tr++;
    le.set(c, { resolve: s, reject: o });
    const a = {
      id: c,
      password: t,
      salt: e,
      params: r
    };
    n.postMessage(a);
  }) : Kt(t, e, r);
}
function sr(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
function or(t) {
  if (Object.prototype.hasOwnProperty.call(t, "__esModule")) return t;
  var e = t.default;
  if (typeof e == "function") {
    var r = function n() {
      var s = !1;
      try {
        s = this instanceof n;
      } catch {
      }
      return s ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    r.prototype = e.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(t).forEach(function(n) {
    var s = Object.getOwnPropertyDescriptor(t, n);
    Object.defineProperty(r, n, s.get ? s : {
      enumerable: !0,
      get: function() {
        return t[n];
      }
    });
  }), r;
}
var we = { exports: {} };
const ir = globalThis.crypto, ar = globalThis.crypto, cr = globalThis.crypto.subtle, lr = globalThis.crypto.getRandomValues.bind(globalThis.crypto), fr = globalThis.crypto.randomUUID.bind(globalThis.crypto), ur = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ir,
  getRandomValues: lr,
  randomUUID: fr,
  subtle: cr,
  webcrypto: ar
}, Symbol.toStringTag, { value: "Module" })), dr = /* @__PURE__ */ or(ur);
var hr = we.exports, Fe;
function mr() {
  return Fe || (Fe = 1, (function(t, e) {
    (function(r, n) {
      t.exports = n(dr);
    })(hr, function(r) {
      var n, s, o, c, a;
      function i() {
        n = {
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
        }, s = {}, o = new Array(1024).join("0"), c = !0, a = [
          "nodeCryptoRandomBytes",
          "browserCryptoGetRandomValues",
          "testRandom"
        ];
      }
      function p() {
        return !!(s && s.rng && typeof s.rng == "function");
      }
      function w(l, u) {
        var f;
        if (u === 0 || u === 1)
          return l;
        if (u && u > 1024)
          throw new Error(
            "Padding must be multiples of no larger than 1024 bits."
          );
        return u = u || s.bits, l && (f = l.length % u), f ? (o + l).slice(
          -(u - f + l.length)
        ) : l;
      }
      function h(l) {
        var u = "", f, d;
        for (d = l.length - 1; d >= 0; d--) {
          if (f = parseInt(l[d], 16), isNaN(f))
            throw new Error("Invalid hex character.");
          u = w(f.toString(2), 4) + u;
        }
        return u;
      }
      function A(l) {
        var u = "", f, d;
        for (l = w(l, 4), d = l.length; d >= 4; d -= 4) {
          if (f = parseInt(l.slice(d - 4, d), 2), isNaN(f))
            throw new Error("Invalid binary character.");
          u = f.toString(16) + u;
        }
        return u;
      }
      function N() {
        return !!(r && typeof r == "object" && (typeof r.getRandomValues == "function" || typeof r.getRandomValues == "object") && (typeof Uint32Array == "function" || typeof Uint32Array == "object"));
      }
      function R() {
        return typeof r == "object" && typeof r.randomBytes == "function";
      }
      function B(l) {
        function u(x, v, I, C) {
          var L = 0, _, U = "", V;
          for (v && (_ = v.length - 1); L < _ || U.length < x; )
            V = Math.abs(parseInt(v[L], I)), U = U + w(V.toString(2), C), L++;
          return U = U.substr(-x), (U.match(/0/g) || []).length === U.length ? null : U;
        }
        function f(x) {
          var v, I, C, L, _ = null;
          for (C = 16, L = 4, I = Math.ceil(x / 8); _ === null; )
            v = r.randomBytes(I), _ = u(x, v.toString("hex"), C, L);
          return _;
        }
        function d(x) {
          var v, I, C, L = null;
          for (I = 10, C = 32, v = Math.ceil(x / 32); L === null; )
            L = u(
              x,
              r.getRandomValues(new Uint32Array(v)),
              I,
              C
            );
          return L;
        }
        function y(x) {
          var v, I, C, L, _, U = null;
          L = 10, _ = 32, I = Math.ceil(x / 32), C = 123456789, v = new Uint32Array(I);
          for (var V = 0; V < v.length; V++)
            v[V] = C;
          for (; U === null; )
            U = u(x, v, L, _);
          return U;
        }
        if (l && l === "testRandom")
          return s.typeCSPRNG = l, y;
        if (l && l === "nodeCryptoRandomBytes")
          return s.typeCSPRNG = l, f;
        if (l && l === "browserCryptoGetRandomValues")
          return s.typeCSPRNG = l, d;
        if (R())
          return s.typeCSPRNG = "nodeCryptoRandomBytes", f;
        if (N())
          return s.typeCSPRNG = "browserCryptoGetRandomValues", d;
      }
      function S(l, u) {
        var f = [], d;
        for (u && (l = w(l, u)), d = l.length; d > s.bits; d -= s.bits)
          f.push(parseInt(l.slice(d - s.bits, d), 2));
        return f.push(parseInt(l.slice(0, d), 2)), f;
      }
      function m(l, u) {
        var f = s.logs[l], d = 0, y;
        for (y = u.length - 1; y >= 0; y--)
          d !== 0 ? d = s.exps[(f + s.logs[d]) % s.maxShares] ^ u[y] : d = u[y];
        return d;
      }
      function b(l, u, f) {
        var d = 0, y, x, v, I;
        for (v = 0, y = u.length; v < y; v++)
          if (f[v]) {
            for (x = s.logs[f[v]], I = 0; I < y; I++)
              if (v !== I) {
                if (l === u[I]) {
                  x = -1;
                  break;
                }
                x = (x + s.logs[l ^ u[I]] - s.logs[u[v] ^ u[I]] + s.maxShares) % s.maxShares;
              }
            d = x === -1 ? d : d ^ s.exps[x];
          }
        return d;
      }
      function g(l, u, f) {
        var d = [], y = [l], x, v;
        for (x = 1; x < f; x++)
          y[x] = parseInt(s.rng(s.bits), 2);
        for (x = 1, v = u + 1; x < v; x++)
          d[x - 1] = {
            x,
            y: m(x, y)
          };
        return d;
      }
      function E(l, u, f) {
        var d, y, x, v, I;
        if (u = parseInt(u, s.radix), l = parseInt(l, 10) || s.bits, d = l.toString(36).toUpperCase(), x = Math.pow(2, l) - 1, v = x.toString(s.radix).length, y = w(u.toString(s.radix), v), typeof u != "number" || u % 1 !== 0 || u < 1 || u > x)
          throw new Error(
            "Share id must be an integer between 1 and " + x + ", inclusive."
          );
        return I = d + y + f, I;
      }
      var T = {
        init: function(l, u) {
          var f = [], d = [], y = 1, x, v;
          if (i(), l && (typeof l != "number" || l % 1 !== 0 || l < n.minBits || l > n.maxBits))
            throw new Error(
              "Number of bits must be an integer between " + n.minBits + " and " + n.maxBits + ", inclusive."
            );
          if (u && a.indexOf(u) === -1)
            throw new Error("Invalid RNG type argument : '" + u + "'");
          for (s.radix = n.radix, s.bits = l || n.bits, s.size = Math.pow(2, s.bits), s.maxShares = s.size - 1, x = n.primitivePolynomials[s.bits], v = 0; v < s.size; v++)
            d[v] = y, f[y] = v, y = y << 1, y >= s.size && (y = y ^ x, y = y & s.maxShares);
          if (s.logs = f, s.exps = d, u && this.setRNG(u), p() || this.setRNG(), !p() || !s.bits || !s.size || !s.maxShares || !s.logs || !s.exps || s.logs.length !== s.size || s.exps.length !== s.size)
            throw new Error("Initialization failed.");
        },
        // Evaluates the Lagrange interpolation polynomial at x=`at` for
        // individual config.bits-length segments of each share in the `shares`
        // Array. Each share is expressed in base `inputRadix`. The output
        // is expressed in base `outputRadix'.
        combine: function(l, u) {
          var f, d, y, x, v = "", I, C, L, _ = [], U = [];
          for (u = u || 0, f = 0, y = l.length; f < y; f++) {
            if (C = this.extractShareComponents(l[f]), I === void 0)
              I = C.bits;
            else if (C.bits !== I)
              throw new Error(
                "Mismatched shares: Different bit settings."
              );
            if (s.bits !== I && this.init(I), _.indexOf(C.id) === -1)
              for (_.push(C.id), L = S(h(C.data)), d = 0, x = L.length; d < x; d++)
                U[d] = U[d] || [], U[d][_.length - 1] = L[d];
          }
          for (f = 0, y = U.length; f < y; f++)
            v = w(b(u, _, U[f]).toString(2)) + v;
          return A(
            u >= 1 ? v : v.slice(v.indexOf("1") + 1)
          );
        },
        getConfig: function() {
          var l = {};
          return l.radix = s.radix, l.bits = s.bits, l.maxShares = s.maxShares, l.hasCSPRNG = p(), l.typeCSPRNG = s.typeCSPRNG, l;
        },
        // Given a public share, extract the bits (Integer), share ID (Integer), and share data (Hex)
        // and return an Object containing those components.
        extractShareComponents: function(l) {
          var u, f, d, y, x = {}, v, I;
          if (u = parseInt(l.substr(0, 1), 36), u && (typeof u != "number" || u % 1 !== 0 || u < n.minBits || u > n.maxBits))
            throw new Error(
              "Invalid share : Number of bits must be an integer between " + n.minBits + " and " + n.maxBits + ", inclusive."
            );
          if (y = Math.pow(2, u) - 1, d = (Math.pow(2, u) - 1).toString(s.radix).length, v = "^([a-kA-K3-9]{1})([a-fA-F0-9]{" + d + "})([a-fA-F0-9]+)$", I = new RegExp(v).exec(l), I && (f = parseInt(I[2], s.radix)), typeof f != "number" || f % 1 !== 0 || f < 1 || f > y)
            throw new Error(
              "Invalid share : Share id must be an integer between 1 and " + s.maxShares + ", inclusive."
            );
          if (I && I[3])
            return x.bits = u, x.id = f, x.data = I[3], x;
          throw new Error("The share data provided is invalid : " + l);
        },
        // Set the PRNG to use. If no RNG function is supplied, pick a default using getRNG()
        setRNG: function(l) {
          var u = "Random number generator is invalid ", f = " Supply an CSPRNG of the form function(bits){} that returns a string containing 'bits' number of random 1's and 0's.";
          if (l && typeof l == "string" && a.indexOf(l) === -1)
            throw new Error("Invalid RNG type argument : '" + l + "'");
          if (l || (l = B()), l && typeof l == "string" && (l = B(l)), c) {
            if (l && typeof l != "function")
              throw new Error(u + "(Not a function)." + f);
            if (l && typeof l(s.bits) != "string")
              throw new Error(
                u + "(Output is not a string)." + f
              );
            if (l && !parseInt(l(s.bits), 2))
              throw new Error(
                u + "(Binary string output not parseable to an Integer)." + f
              );
            if (l && l(s.bits).length > s.bits)
              throw new Error(
                u + "(Output length is greater than config.bits)." + f
              );
            if (l && l(s.bits).length < s.bits)
              throw new Error(
                u + "(Output length is less than config.bits)." + f
              );
          }
          return s.rng = l, !0;
        },
        // Converts a given UTF16 character string to the HEX representation.
        // Each character of the input string is represented by
        // `bytesPerChar` bytes in the output string which defaults to 2.
        str2hex: function(l, u) {
          var f, d, y = "", x, v, I, C;
          if (typeof l != "string")
            throw new Error("Input must be a character string.");
          if (u || (u = n.bytesPerChar), typeof u != "number" || u < 1 || u > n.maxBytesPerChar || u % 1 !== 0)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + n.maxBytesPerChar + ", inclusive."
            );
          for (f = 2 * u, d = Math.pow(16, f) - 1, I = 0, C = l.length; I < C; I++) {
            if (v = l[I].charCodeAt(), isNaN(v))
              throw new Error("Invalid character: " + l[I]);
            if (v > d)
              throw x = Math.ceil(Math.log(v + 1) / Math.log(256)), new Error(
                "Invalid character code (" + v + "). Maximum allowable is 256^bytes-1 (" + d + "). To convert this character, use at least " + x + " bytes."
              );
            y = w(v.toString(16), f) + y;
          }
          return y;
        },
        // Converts a given HEX number string to a UTF16 character string.
        hex2str: function(l, u) {
          var f, d = "", y, x;
          if (typeof l != "string")
            throw new Error("Input must be a hexadecimal string.");
          if (u = u || n.bytesPerChar, typeof u != "number" || u % 1 !== 0 || u < 1 || u > n.maxBytesPerChar)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + n.maxBytesPerChar + ", inclusive."
            );
          for (f = 2 * u, l = w(l, f), y = 0, x = l.length; y < x; y += f)
            d = String.fromCharCode(
              parseInt(l.slice(y, y + f), 16)
            ) + d;
          return d;
        },
        // Generates a random bits-length number string using the PRNG
        random: function(l) {
          if (typeof l != "number" || l % 1 !== 0 || l < 2 || l > 65536)
            throw new Error(
              "Number of bits must be an Integer between 1 and 65536."
            );
          return A(s.rng(l));
        },
        // Divides a `secret` number String str expressed in radix `inputRadix` (optional, default 16)
        // into `numShares` shares, each expressed in radix `outputRadix` (optional, default to `inputRadix`),
        // requiring `threshold` number of shares to reconstruct the secret.
        // Optionally, zero-pads the secret to a length that is a multiple of padLength before sharing.
        share: function(l, u, f, d) {
          var y, x, v = new Array(u), I = new Array(u), C, L, _;
          if (d = d || 128, typeof l != "string")
            throw new Error("Secret must be a string.");
          if (typeof u != "number" || u % 1 !== 0 || u < 2)
            throw new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive."
            );
          if (u > s.maxShares)
            throw y = Math.ceil(Math.log(u + 1) / Math.LN2), new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive. To create " + u + " shares, use at least " + y + " bits."
            );
          if (typeof f != "number" || f % 1 !== 0 || f < 2)
            throw new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive."
            );
          if (f > s.maxShares)
            throw y = Math.ceil(Math.log(f + 1) / Math.LN2), new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + s.maxShares + "), inclusive.  To use a threshold of " + f + ", use at least " + y + " bits."
            );
          if (f > u)
            throw new Error(
              "Threshold number of shares was " + f + " but must be less than or equal to the " + u + " shares specified as the total to generate."
            );
          if (typeof d != "number" || d % 1 !== 0 || d < 0 || d > 1024)
            throw new Error(
              "Zero-pad length must be an integer between 0 and 1024 inclusive."
            );
          for (l = "1" + h(l), l = S(l, d), C = 0, _ = l.length; C < _; C++)
            for (x = g(l[C], u, f), L = 0; L < u; L++)
              v[L] = v[L] || x[L].x.toString(s.radix), I[L] = w(x[L].y.toString(2)) + (I[L] || "");
          for (C = 0; C < u; C++)
            v[C] = E(
              s.bits,
              v[C],
              A(I[C])
            );
          return v;
        },
        // Generate a new share with id `id` (a number between 1 and 2^bits-1)
        // `id` can be a Number or a String in the default radix (16)
        newShare: function(l, u) {
          var f, d;
          if (l && typeof l == "string" && (l = parseInt(l, s.radix)), d = l.toString(s.radix), l && d && u && u[0])
            return f = this.extractShareComponents(u[0]), E(
              f.bits,
              d,
              this.combine(u, l)
            );
          throw new Error(
            "Invalid 'id' or 'shares' Array argument to newShare()."
          );
        },
        /* test-code */
        // export private functions so they can be unit tested directly.
        _reset: i,
        _padLeft: w,
        _hex2bin: h,
        _bin2hex: A,
        _hasCryptoGetRandomValues: N,
        _hasCryptoRandomBytes: R,
        _getRNG: B,
        _isSetRNG: p,
        _splitNumStringToIntArray: S,
        _horner: m,
        _lagrange: b,
        _getShares: g,
        _constructPublicShareString: E
        /* end-test-code */
      };
      return T.init(), T;
    });
  })(we)), we.exports;
}
var gr = mr();
const Et = /* @__PURE__ */ sr(gr), pr = 2, br = 3;
function wr(t) {
  if (t.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${t.length}`);
  const e = vt(t), r = Et.share(e, br, pr);
  if (r.length !== 3)
    throw new Error(`Unexpected share count: ${r.length}`);
  const n = Se(r[0]), s = Se(r[1]), o = Se(r[2]);
  return {
    shareA: Ae(n),
    shareB: Ae(s),
    shareC: Ae(o)
  };
}
function Yn(t, e) {
  const r = Qe(t), n = Qe(e);
  try {
    const s = Et.combine([r, n]), o = At(s);
    if (o.length !== 16)
      throw new Error(`Reconstructed seed has wrong length: ${o.length}`);
    return Wt(o);
  } catch {
    throw new Error("Failed to reconstruct seed from shares");
  }
}
function vt(t) {
  return Array.from(t).map((e) => e.toString(16).padStart(2, "0")).join("");
}
function At(t) {
  if (!/^[0-9a-fA-F]*$/.test(t))
    throw new Error("Invalid hex string: contains non-hex characters");
  if (t.length % 2 !== 0)
    throw new Error(`Invalid hex string: length ${t.length} is odd (must be even)`);
  const e = new Uint8Array(t.length / 2);
  for (let r = 0; r < e.length; r++)
    e[r] = parseInt(t.substr(r * 2, 2), 16);
  return e;
}
function Se(t) {
  const e = t.length % 2 === 0 ? t : "0" + t;
  return At(e);
}
function Qe(t) {
  const e = vt(t);
  return e.startsWith("0") && !e.startsWith("00") ? e.substring(1) : e;
}
function yr(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function je(t, ...e) {
  if (!yr(t))
    throw new Error("Uint8Array expected");
  if (e.length > 0 && !e.includes(t.length))
    throw new Error("Uint8Array expected of length " + e + ", got length=" + t.length);
}
function Je(t, e = !0) {
  if (t.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (e && t.finished)
    throw new Error("Hash#digest() has already been called");
}
function xr(t, e) {
  je(t);
  const r = e.outputLen;
  if (t.length < r)
    throw new Error("digestInto() expects output buffer of length at least " + r);
}
function De(...t) {
  for (let e = 0; e < t.length; e++)
    t[e].fill(0);
}
function Re(t) {
  return new DataView(t.buffer, t.byteOffset, t.byteLength);
}
function W(t, e) {
  return t << 32 - e | t >>> e;
}
function Er(t) {
  if (typeof t != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(t));
}
function Bt(t) {
  return typeof t == "string" && (t = Er(t)), je(t), t;
}
class vr {
}
function Ar(t) {
  const e = (n) => t().update(Bt(n)).digest(), r = t();
  return e.outputLen = r.outputLen, e.blockLen = r.blockLen, e.create = () => t(), e;
}
function Br(t, e, r, n) {
  if (typeof t.setBigUint64 == "function")
    return t.setBigUint64(e, r, n);
  const s = BigInt(32), o = BigInt(4294967295), c = Number(r >> s & o), a = Number(r & o), i = n ? 4 : 0, p = n ? 0 : 4;
  t.setUint32(e + i, c, n), t.setUint32(e + p, a, n);
}
function Sr(t, e, r) {
  return t & e ^ ~t & r;
}
function Rr(t, e, r) {
  return t & e ^ t & r ^ e & r;
}
let Ir = class extends vr {
  constructor(e, r, n, s) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = e, this.outputLen = r, this.padOffset = n, this.isLE = s, this.buffer = new Uint8Array(e), this.view = Re(this.buffer);
  }
  update(e) {
    Je(this), e = Bt(e), je(e);
    const { view: r, buffer: n, blockLen: s } = this, o = e.length;
    for (let c = 0; c < o; ) {
      const a = Math.min(s - this.pos, o - c);
      if (a === s) {
        const i = Re(e);
        for (; s <= o - c; c += s)
          this.process(i, c);
        continue;
      }
      n.set(e.subarray(c, c + a), this.pos), this.pos += a, c += a, this.pos === s && (this.process(r, 0), this.pos = 0);
    }
    return this.length += e.length, this.roundClean(), this;
  }
  digestInto(e) {
    Je(this), xr(e, this), this.finished = !0;
    const { buffer: r, view: n, blockLen: s, isLE: o } = this;
    let { pos: c } = this;
    r[c++] = 128, De(this.buffer.subarray(c)), this.padOffset > s - c && (this.process(n, 0), c = 0);
    for (let h = c; h < s; h++)
      r[h] = 0;
    Br(n, s - 8, BigInt(this.length * 8), o), this.process(n, 0);
    const a = Re(e), i = this.outputLen;
    if (i % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const p = i / 4, w = this.get();
    if (p > w.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let h = 0; h < p; h++)
      a.setUint32(4 * h, w[h], o);
  }
  digest() {
    const { buffer: e, outputLen: r } = this;
    this.digestInto(e);
    const n = e.slice(0, r);
    return this.destroy(), n;
  }
  _cloneInto(e) {
    e || (e = new this.constructor()), e.set(...this.get());
    const { blockLen: r, buffer: n, length: s, finished: o, destroyed: c, pos: a } = this;
    return e.destroyed = c, e.finished = o, e.length = s, e.pos = a, s % r && e.buffer.set(n), e;
  }
  clone() {
    return this._cloneInto();
  }
};
const Q = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), Nr = /* @__PURE__ */ Uint32Array.from([
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
]), J = /* @__PURE__ */ new Uint32Array(64);
class kr extends Ir {
  constructor(e = 32) {
    super(64, e, 8, !1), this.A = Q[0] | 0, this.B = Q[1] | 0, this.C = Q[2] | 0, this.D = Q[3] | 0, this.E = Q[4] | 0, this.F = Q[5] | 0, this.G = Q[6] | 0, this.H = Q[7] | 0;
  }
  get() {
    const { A: e, B: r, C: n, D: s, E: o, F: c, G: a, H: i } = this;
    return [e, r, n, s, o, c, a, i];
  }
  // prettier-ignore
  set(e, r, n, s, o, c, a, i) {
    this.A = e | 0, this.B = r | 0, this.C = n | 0, this.D = s | 0, this.E = o | 0, this.F = c | 0, this.G = a | 0, this.H = i | 0;
  }
  process(e, r) {
    for (let h = 0; h < 16; h++, r += 4)
      J[h] = e.getUint32(r, !1);
    for (let h = 16; h < 64; h++) {
      const A = J[h - 15], N = J[h - 2], R = W(A, 7) ^ W(A, 18) ^ A >>> 3, B = W(N, 17) ^ W(N, 19) ^ N >>> 10;
      J[h] = B + J[h - 7] + R + J[h - 16] | 0;
    }
    let { A: n, B: s, C: o, D: c, E: a, F: i, G: p, H: w } = this;
    for (let h = 0; h < 64; h++) {
      const A = W(a, 6) ^ W(a, 11) ^ W(a, 25), N = w + A + Sr(a, i, p) + Nr[h] + J[h] | 0, B = (W(n, 2) ^ W(n, 13) ^ W(n, 22)) + Rr(n, s, o) | 0;
      w = p, p = i, i = a, a = c + N | 0, c = o, o = s, s = n, n = N + B | 0;
    }
    n = n + this.A | 0, s = s + this.B | 0, o = o + this.C | 0, c = c + this.D | 0, a = a + this.E | 0, i = i + this.F | 0, p = p + this.G | 0, w = w + this.H | 0, this.set(n, s, o, c, a, i, p, w);
  }
  roundClean() {
    De(J);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), De(this.buffer);
  }
}
const Cr = /* @__PURE__ */ Ar(() => new kr());
function St(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function Ze(t, e = "") {
  if (!Number.isSafeInteger(t) || t < 0) {
    const r = e && `"${e}" `;
    throw new Error(`${r}expected integer >= 0, got ${t}`);
  }
}
function H(t, e, r = "") {
  const n = St(t), s = t?.length, o = e !== void 0;
  if (!n || o && s !== e) {
    const c = r && `"${r}" `, a = o ? ` of length ${e}` : "", i = n ? `length=${s}` : `type=${typeof t}`;
    throw new Error(c + "expected Uint8Array" + a + ", got " + i);
  }
  return t;
}
function et(t, e = !0) {
  if (t.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (e && t.finished)
    throw new Error("Hash#digest() has already been called");
}
function Lr(t, e) {
  H(t, void 0, "digestInto() output");
  const r = e.outputLen;
  if (t.length < r)
    throw new Error('"digestInto() output" expected to be of length >=' + r);
}
function Me(...t) {
  for (let e = 0; e < t.length; e++)
    t[e].fill(0);
}
function Ie(t) {
  return new DataView(t.buffer, t.byteOffset, t.byteLength);
}
const Rt = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", Tr = /* @__PURE__ */ Array.from({ length: 256 }, (t, e) => e.toString(16).padStart(2, "0"));
function Pe(t) {
  if (H(t), Rt)
    return t.toHex();
  let e = "";
  for (let r = 0; r < t.length; r++)
    e += Tr[t[r]];
  return e;
}
const X = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function tt(t) {
  if (t >= X._0 && t <= X._9)
    return t - X._0;
  if (t >= X.A && t <= X.F)
    return t - (X.A - 10);
  if (t >= X.a && t <= X.f)
    return t - (X.a - 10);
}
function It(t) {
  if (typeof t != "string")
    throw new Error("hex string expected, got " + typeof t);
  if (Rt)
    return Uint8Array.fromHex(t);
  const e = t.length, r = e / 2;
  if (e % 2)
    throw new Error("hex string expected, got unpadded hex of length " + e);
  const n = new Uint8Array(r);
  for (let s = 0, o = 0; s < r; s++, o += 2) {
    const c = tt(t.charCodeAt(o)), a = tt(t.charCodeAt(o + 1));
    if (c === void 0 || a === void 0) {
      const i = t[o] + t[o + 1];
      throw new Error('hex string expected, got non-hex character "' + i + '" at index ' + o);
    }
    n[s] = c * 16 + a;
  }
  return n;
}
function rt(...t) {
  let e = 0;
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    H(s), e += s.length;
  }
  const r = new Uint8Array(e);
  for (let n = 0, s = 0; n < t.length; n++) {
    const o = t[n];
    r.set(o, s), s += o.length;
  }
  return r;
}
function _r(t, e = {}) {
  const r = (s, o) => t(o).update(s).digest(), n = t(void 0);
  return r.outputLen = n.outputLen, r.blockLen = n.blockLen, r.create = (s) => t(s), Object.assign(r, e), Object.freeze(r);
}
function Or(t = 32) {
  const e = typeof globalThis == "object" ? globalThis.crypto : null;
  if (typeof e?.getRandomValues != "function")
    throw new Error("crypto.getRandomValues must be defined");
  return e.getRandomValues(new Uint8Array(t));
}
const Ur = (t) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, t])
});
class Dr {
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
  constructor(e, r, n, s) {
    this.blockLen = e, this.outputLen = r, this.padOffset = n, this.isLE = s, this.buffer = new Uint8Array(e), this.view = Ie(this.buffer);
  }
  update(e) {
    et(this), H(e);
    const { view: r, buffer: n, blockLen: s } = this, o = e.length;
    for (let c = 0; c < o; ) {
      const a = Math.min(s - this.pos, o - c);
      if (a === s) {
        const i = Ie(e);
        for (; s <= o - c; c += s)
          this.process(i, c);
        continue;
      }
      n.set(e.subarray(c, c + a), this.pos), this.pos += a, c += a, this.pos === s && (this.process(r, 0), this.pos = 0);
    }
    return this.length += e.length, this.roundClean(), this;
  }
  digestInto(e) {
    et(this), Lr(e, this), this.finished = !0;
    const { buffer: r, view: n, blockLen: s, isLE: o } = this;
    let { pos: c } = this;
    r[c++] = 128, Me(this.buffer.subarray(c)), this.padOffset > s - c && (this.process(n, 0), c = 0);
    for (let h = c; h < s; h++)
      r[h] = 0;
    n.setBigUint64(s - 8, BigInt(this.length * 8), o), this.process(n, 0);
    const a = Ie(e), i = this.outputLen;
    if (i % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const p = i / 4, w = this.get();
    if (p > w.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let h = 0; h < p; h++)
      a.setUint32(4 * h, w[h], o);
  }
  digest() {
    const { buffer: e, outputLen: r } = this;
    this.digestInto(e);
    const n = e.slice(0, r);
    return this.destroy(), n;
  }
  _cloneInto(e) {
    e ||= new this.constructor(), e.set(...this.get());
    const { blockLen: r, buffer: n, length: s, finished: o, destroyed: c, pos: a } = this;
    return e.destroyed = c, e.finished = o, e.length = s, e.pos = a, s % r && e.buffer.set(n), e;
  }
  clone() {
    return this._cloneInto();
  }
}
const G = /* @__PURE__ */ Uint32Array.from([
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
]), ge = /* @__PURE__ */ BigInt(2 ** 32 - 1), nt = /* @__PURE__ */ BigInt(32);
function Mr(t, e = !1) {
  return e ? { h: Number(t & ge), l: Number(t >> nt & ge) } : { h: Number(t >> nt & ge) | 0, l: Number(t & ge) | 0 };
}
function qr(t, e = !1) {
  const r = t.length;
  let n = new Uint32Array(r), s = new Uint32Array(r);
  for (let o = 0; o < r; o++) {
    const { h: c, l: a } = Mr(t[o], e);
    [n[o], s[o]] = [c, a];
  }
  return [n, s];
}
const st = (t, e, r) => t >>> r, ot = (t, e, r) => t << 32 - r | e >>> r, ie = (t, e, r) => t >>> r | e << 32 - r, ae = (t, e, r) => t << 32 - r | e >>> r, pe = (t, e, r) => t << 64 - r | e >>> r - 32, be = (t, e, r) => t >>> r - 32 | e << 64 - r;
function F(t, e, r, n) {
  const s = (e >>> 0) + (n >>> 0);
  return { h: t + r + (s / 2 ** 32 | 0) | 0, l: s | 0 };
}
const Vr = (t, e, r) => (t >>> 0) + (e >>> 0) + (r >>> 0), $r = (t, e, r, n) => e + r + n + (t / 2 ** 32 | 0) | 0, Hr = (t, e, r, n) => (t >>> 0) + (e >>> 0) + (r >>> 0) + (n >>> 0), Gr = (t, e, r, n, s) => e + r + n + s + (t / 2 ** 32 | 0) | 0, jr = (t, e, r, n, s) => (t >>> 0) + (e >>> 0) + (r >>> 0) + (n >>> 0) + (s >>> 0), Zr = (t, e, r, n, s, o) => e + r + n + s + o + (t / 2 ** 32 | 0) | 0, Nt = qr([
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
].map((t) => BigInt(t))), Pr = Nt[0], zr = Nt[1], ee = /* @__PURE__ */ new Uint32Array(80), te = /* @__PURE__ */ new Uint32Array(80);
class Kr extends Dr {
  constructor(e) {
    super(128, e, 16, !1);
  }
  // prettier-ignore
  get() {
    const { Ah: e, Al: r, Bh: n, Bl: s, Ch: o, Cl: c, Dh: a, Dl: i, Eh: p, El: w, Fh: h, Fl: A, Gh: N, Gl: R, Hh: B, Hl: S } = this;
    return [e, r, n, s, o, c, a, i, p, w, h, A, N, R, B, S];
  }
  // prettier-ignore
  set(e, r, n, s, o, c, a, i, p, w, h, A, N, R, B, S) {
    this.Ah = e | 0, this.Al = r | 0, this.Bh = n | 0, this.Bl = s | 0, this.Ch = o | 0, this.Cl = c | 0, this.Dh = a | 0, this.Dl = i | 0, this.Eh = p | 0, this.El = w | 0, this.Fh = h | 0, this.Fl = A | 0, this.Gh = N | 0, this.Gl = R | 0, this.Hh = B | 0, this.Hl = S | 0;
  }
  process(e, r) {
    for (let g = 0; g < 16; g++, r += 4)
      ee[g] = e.getUint32(r), te[g] = e.getUint32(r += 4);
    for (let g = 16; g < 80; g++) {
      const E = ee[g - 15] | 0, T = te[g - 15] | 0, l = ie(E, T, 1) ^ ie(E, T, 8) ^ st(E, T, 7), u = ae(E, T, 1) ^ ae(E, T, 8) ^ ot(E, T, 7), f = ee[g - 2] | 0, d = te[g - 2] | 0, y = ie(f, d, 19) ^ pe(f, d, 61) ^ st(f, d, 6), x = ae(f, d, 19) ^ be(f, d, 61) ^ ot(f, d, 6), v = Hr(u, x, te[g - 7], te[g - 16]), I = Gr(v, l, y, ee[g - 7], ee[g - 16]);
      ee[g] = I | 0, te[g] = v | 0;
    }
    let { Ah: n, Al: s, Bh: o, Bl: c, Ch: a, Cl: i, Dh: p, Dl: w, Eh: h, El: A, Fh: N, Fl: R, Gh: B, Gl: S, Hh: m, Hl: b } = this;
    for (let g = 0; g < 80; g++) {
      const E = ie(h, A, 14) ^ ie(h, A, 18) ^ pe(h, A, 41), T = ae(h, A, 14) ^ ae(h, A, 18) ^ be(h, A, 41), l = h & N ^ ~h & B, u = A & R ^ ~A & S, f = jr(b, T, u, zr[g], te[g]), d = Zr(f, m, E, l, Pr[g], ee[g]), y = f | 0, x = ie(n, s, 28) ^ pe(n, s, 34) ^ pe(n, s, 39), v = ae(n, s, 28) ^ be(n, s, 34) ^ be(n, s, 39), I = n & o ^ n & a ^ o & a, C = s & c ^ s & i ^ c & i;
      m = B | 0, b = S | 0, B = N | 0, S = R | 0, N = h | 0, R = A | 0, { h, l: A } = F(p | 0, w | 0, d | 0, y | 0), p = a | 0, w = i | 0, a = o | 0, i = c | 0, o = n | 0, c = s | 0;
      const L = Vr(y, v, C);
      n = $r(L, d, x, I), s = L | 0;
    }
    ({ h: n, l: s } = F(this.Ah | 0, this.Al | 0, n | 0, s | 0)), { h: o, l: c } = F(this.Bh | 0, this.Bl | 0, o | 0, c | 0), { h: a, l: i } = F(this.Ch | 0, this.Cl | 0, a | 0, i | 0), { h: p, l: w } = F(this.Dh | 0, this.Dl | 0, p | 0, w | 0), { h, l: A } = F(this.Eh | 0, this.El | 0, h | 0, A | 0), { h: N, l: R } = F(this.Fh | 0, this.Fl | 0, N | 0, R | 0), { h: B, l: S } = F(this.Gh | 0, this.Gl | 0, B | 0, S | 0), { h: m, l: b } = F(this.Hh | 0, this.Hl | 0, m | 0, b | 0), this.set(n, s, o, c, a, i, p, w, h, A, N, R, B, S, m, b);
  }
  roundClean() {
    Me(ee, te);
  }
  destroy() {
    Me(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class Wr extends Kr {
  Ah = G[0] | 0;
  Al = G[1] | 0;
  Bh = G[2] | 0;
  Bl = G[3] | 0;
  Ch = G[4] | 0;
  Cl = G[5] | 0;
  Dh = G[6] | 0;
  Dl = G[7] | 0;
  Eh = G[8] | 0;
  El = G[9] | 0;
  Fh = G[10] | 0;
  Fl = G[11] | 0;
  Gh = G[12] | 0;
  Gl = G[13] | 0;
  Hh = G[14] | 0;
  Hl = G[15] | 0;
  constructor() {
    super(64);
  }
}
const Yr = /* @__PURE__ */ _r(
  () => new Wr(),
  /* @__PURE__ */ Ur(3)
);
const kt = /* @__PURE__ */ BigInt(0), it = /* @__PURE__ */ BigInt(1);
function qe(t, e = "") {
  if (typeof t != "boolean") {
    const r = e && `"${e}" `;
    throw new Error(r + "expected boolean, got type=" + typeof t);
  }
  return t;
}
function Xr(t) {
  if (typeof t == "bigint") {
    if (!ye(t))
      throw new Error("positive bigint expected, got " + t);
  } else
    Ze(t);
  return t;
}
function Ct(t) {
  if (typeof t != "string")
    throw new Error("hex string expected, got " + typeof t);
  return t === "" ? kt : BigInt("0x" + t);
}
function Fr(t) {
  return Ct(Pe(t));
}
function xe(t) {
  return Ct(Pe(Ve(H(t)).reverse()));
}
function Lt(t, e) {
  Ze(e), t = Xr(t);
  const r = It(t.toString(16).padStart(e * 2, "0"));
  if (r.length !== e)
    throw new Error("number too large");
  return r;
}
function Qr(t, e) {
  return Lt(t, e).reverse();
}
function Ve(t) {
  return Uint8Array.from(t);
}
const ye = (t) => typeof t == "bigint" && kt <= t;
function Jr(t, e, r) {
  return ye(t) && ye(e) && ye(r) && e <= t && t < r;
}
function at(t, e, r, n) {
  if (!Jr(e, r, n))
    throw new Error("expected valid " + t + ": " + r + " <= n < " + n + ", got " + e);
}
const en = (t) => (it << BigInt(t)) - it;
function ze(t, e = {}, r = {}) {
  if (!t || typeof t != "object")
    throw new Error("expected valid options object");
  function n(o, c, a) {
    const i = t[o];
    if (a && i === void 0)
      return;
    const p = typeof i;
    if (p !== c || i === null)
      throw new Error(`param "${o}" is invalid: expected ${c}, got ${p}`);
  }
  const s = (o, c) => Object.entries(o).forEach(([a, i]) => n(a, i, c));
  s(e, !1), s(r, !0);
}
function ct(t) {
  const e = /* @__PURE__ */ new WeakMap();
  return (r, ...n) => {
    const s = e.get(r);
    if (s !== void 0)
      return s;
    const o = t(r, ...n);
    return e.set(r, o), o;
  };
}
const Z = /* @__PURE__ */ BigInt(0), j = /* @__PURE__ */ BigInt(1), se = /* @__PURE__ */ BigInt(2), Tt = /* @__PURE__ */ BigInt(3), _t = /* @__PURE__ */ BigInt(4), Ot = /* @__PURE__ */ BigInt(5), tn = /* @__PURE__ */ BigInt(7), Ut = /* @__PURE__ */ BigInt(8), rn = /* @__PURE__ */ BigInt(9), Dt = /* @__PURE__ */ BigInt(16);
function q(t, e) {
  const r = t % e;
  return r >= Z ? r : e + r;
}
function Y(t, e, r) {
  let n = t;
  for (; e-- > Z; )
    n *= n, n %= r;
  return n;
}
function lt(t, e) {
  if (t === Z)
    throw new Error("invert: expected non-zero number");
  if (e <= Z)
    throw new Error("invert: expected positive modulus, got " + e);
  let r = q(t, e), n = e, s = Z, o = j;
  for (; r !== Z; ) {
    const a = n / r, i = n % r, p = s - o * a;
    n = r, r = i, s = o, o = p;
  }
  if (n !== j)
    throw new Error("invert: does not exist");
  return q(s, e);
}
function Ke(t, e, r) {
  if (!t.eql(t.sqr(e), r))
    throw new Error("Cannot find square root");
}
function Mt(t, e) {
  const r = (t.ORDER + j) / _t, n = t.pow(e, r);
  return Ke(t, n, e), n;
}
function nn(t, e) {
  const r = (t.ORDER - Ot) / Ut, n = t.mul(e, se), s = t.pow(n, r), o = t.mul(e, s), c = t.mul(t.mul(o, se), s), a = t.mul(o, t.sub(c, t.ONE));
  return Ke(t, a, e), a;
}
function sn(t) {
  const e = We(t), r = qt(t), n = r(e, e.neg(e.ONE)), s = r(e, n), o = r(e, e.neg(n)), c = (t + tn) / Dt;
  return (a, i) => {
    let p = a.pow(i, c), w = a.mul(p, n);
    const h = a.mul(p, s), A = a.mul(p, o), N = a.eql(a.sqr(w), i), R = a.eql(a.sqr(h), i);
    p = a.cmov(p, w, N), w = a.cmov(A, h, R);
    const B = a.eql(a.sqr(w), i), S = a.cmov(p, w, B);
    return Ke(a, S, i), S;
  };
}
function qt(t) {
  if (t < Tt)
    throw new Error("sqrt is not defined for small field");
  let e = t - j, r = 0;
  for (; e % se === Z; )
    e /= se, r++;
  let n = se;
  const s = We(t);
  for (; ft(s, n) === 1; )
    if (n++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (r === 1)
    return Mt;
  let o = s.pow(n, e);
  const c = (e + j) / se;
  return function(i, p) {
    if (i.is0(p))
      return p;
    if (ft(i, p) !== 1)
      throw new Error("Cannot find square root");
    let w = r, h = i.mul(i.ONE, o), A = i.pow(p, e), N = i.pow(p, c);
    for (; !i.eql(A, i.ONE); ) {
      if (i.is0(A))
        return i.ZERO;
      let R = 1, B = i.sqr(A);
      for (; !i.eql(B, i.ONE); )
        if (R++, B = i.sqr(B), R === w)
          throw new Error("Cannot find square root");
      const S = j << BigInt(w - R - 1), m = i.pow(h, S);
      w = R, h = i.sqr(m), A = i.mul(A, h), N = i.mul(N, m);
    }
    return N;
  };
}
function on(t) {
  return t % _t === Tt ? Mt : t % Ut === Ot ? nn : t % Dt === rn ? sn(t) : qt(t);
}
const an = (t, e) => (q(t, e) & j) === j, cn = [
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
function ln(t) {
  const e = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  }, r = cn.reduce((n, s) => (n[s] = "function", n), e);
  return ze(t, r), t;
}
function fn(t, e, r) {
  if (r < Z)
    throw new Error("invalid exponent, negatives unsupported");
  if (r === Z)
    return t.ONE;
  if (r === j)
    return e;
  let n = t.ONE, s = e;
  for (; r > Z; )
    r & j && (n = t.mul(n, s)), s = t.sqr(s), r >>= j;
  return n;
}
function Vt(t, e, r = !1) {
  const n = new Array(e.length).fill(r ? t.ZERO : void 0), s = e.reduce((c, a, i) => t.is0(a) ? c : (n[i] = c, t.mul(c, a)), t.ONE), o = t.inv(s);
  return e.reduceRight((c, a, i) => t.is0(a) ? c : (n[i] = t.mul(c, n[i]), t.mul(c, a)), o), n;
}
function ft(t, e) {
  const r = (t.ORDER - j) / se, n = t.pow(e, r), s = t.eql(n, t.ONE), o = t.eql(n, t.ZERO), c = t.eql(n, t.neg(t.ONE));
  if (!s && !o && !c)
    throw new Error("invalid Legendre symbol result");
  return s ? 1 : o ? 0 : -1;
}
function un(t, e) {
  e !== void 0 && Ze(e);
  const r = e !== void 0 ? e : t.toString(2).length, n = Math.ceil(r / 8);
  return { nBitLength: r, nByteLength: n };
}
class dn {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = Z;
  ONE = j;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(e, r = {}) {
    if (e <= Z)
      throw new Error("invalid field: expected ORDER > 0, got " + e);
    let n;
    this.isLE = !1, r != null && typeof r == "object" && (typeof r.BITS == "number" && (n = r.BITS), typeof r.sqrt == "function" && (this.sqrt = r.sqrt), typeof r.isLE == "boolean" && (this.isLE = r.isLE), r.allowedLengths && (this._lengths = r.allowedLengths?.slice()), typeof r.modFromBytes == "boolean" && (this._mod = r.modFromBytes));
    const { nBitLength: s, nByteLength: o } = un(e, n);
    if (o > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = e, this.BITS = s, this.BYTES = o, this._sqrt = void 0, Object.preventExtensions(this);
  }
  create(e) {
    return q(e, this.ORDER);
  }
  isValid(e) {
    if (typeof e != "bigint")
      throw new Error("invalid field element: expected bigint, got " + typeof e);
    return Z <= e && e < this.ORDER;
  }
  is0(e) {
    return e === Z;
  }
  // is valid and invertible
  isValidNot0(e) {
    return !this.is0(e) && this.isValid(e);
  }
  isOdd(e) {
    return (e & j) === j;
  }
  neg(e) {
    return q(-e, this.ORDER);
  }
  eql(e, r) {
    return e === r;
  }
  sqr(e) {
    return q(e * e, this.ORDER);
  }
  add(e, r) {
    return q(e + r, this.ORDER);
  }
  sub(e, r) {
    return q(e - r, this.ORDER);
  }
  mul(e, r) {
    return q(e * r, this.ORDER);
  }
  pow(e, r) {
    return fn(this, e, r);
  }
  div(e, r) {
    return q(e * lt(r, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(e) {
    return e * e;
  }
  addN(e, r) {
    return e + r;
  }
  subN(e, r) {
    return e - r;
  }
  mulN(e, r) {
    return e * r;
  }
  inv(e) {
    return lt(e, this.ORDER);
  }
  sqrt(e) {
    return this._sqrt || (this._sqrt = on(this.ORDER)), this._sqrt(this, e);
  }
  toBytes(e) {
    return this.isLE ? Qr(e, this.BYTES) : Lt(e, this.BYTES);
  }
  fromBytes(e, r = !1) {
    H(e);
    const { _lengths: n, BYTES: s, isLE: o, ORDER: c, _mod: a } = this;
    if (n) {
      if (!n.includes(e.length) || e.length > s)
        throw new Error("Field.fromBytes: expected " + n + " bytes, got " + e.length);
      const p = new Uint8Array(s);
      p.set(e, o ? 0 : p.length - e.length), e = p;
    }
    if (e.length !== s)
      throw new Error("Field.fromBytes: expected " + s + " bytes, got " + e.length);
    let i = o ? xe(e) : Fr(e);
    if (a && (i = q(i, c)), !r && !this.isValid(i))
      throw new Error("invalid field element: outside of range 0..ORDER");
    return i;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(e) {
    return Vt(this, e);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(e, r, n) {
    return n ? r : e;
  }
}
function We(t, e = {}) {
  return new dn(t, e);
}
const Ee = /* @__PURE__ */ BigInt(0), $e = /* @__PURE__ */ BigInt(1);
function ut(t, e) {
  const r = e.negate();
  return t ? r : e;
}
function Ne(t, e) {
  const r = Vt(t.Fp, e.map((n) => n.Z));
  return e.map((n, s) => t.fromAffine(n.toAffine(r[s])));
}
function $t(t, e) {
  if (!Number.isSafeInteger(t) || t <= 0 || t > e)
    throw new Error("invalid window size, expected [1.." + e + "], got W=" + t);
}
function ke(t, e) {
  $t(t, e);
  const r = Math.ceil(e / t) + 1, n = 2 ** (t - 1), s = 2 ** t, o = en(t), c = BigInt(t);
  return { windows: r, windowSize: n, mask: o, maxNumber: s, shiftBy: c };
}
function dt(t, e, r) {
  const { windowSize: n, mask: s, maxNumber: o, shiftBy: c } = r;
  let a = Number(t & s), i = t >> c;
  a > n && (a -= o, i += $e);
  const p = e * n, w = p + Math.abs(a) - 1, h = a === 0, A = a < 0, N = e % 2 !== 0;
  return { nextN: i, offset: w, isZero: h, isNeg: A, isNegF: N, offsetF: p };
}
const Ce = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakMap();
function Le(t) {
  return Ht.get(t) || 1;
}
function ht(t) {
  if (t !== Ee)
    throw new Error("invalid wNAF");
}
class hn {
  BASE;
  ZERO;
  Fn;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(e, r) {
    this.BASE = e.BASE, this.ZERO = e.ZERO, this.Fn = e.Fn, this.bits = r;
  }
  // non-const time multiplication ladder
  _unsafeLadder(e, r, n = this.ZERO) {
    let s = e;
    for (; r > Ee; )
      r & $e && (n = n.add(s)), s = s.double(), r >>= $e;
    return n;
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
  precomputeWindow(e, r) {
    const { windows: n, windowSize: s } = ke(r, this.bits), o = [];
    let c = e, a = c;
    for (let i = 0; i < n; i++) {
      a = c, o.push(a);
      for (let p = 1; p < s; p++)
        a = a.add(c), o.push(a);
      c = a.double();
    }
    return o;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(e, r, n) {
    if (!this.Fn.isValid(n))
      throw new Error("invalid scalar");
    let s = this.ZERO, o = this.BASE;
    const c = ke(e, this.bits);
    for (let a = 0; a < c.windows; a++) {
      const { nextN: i, offset: p, isZero: w, isNeg: h, isNegF: A, offsetF: N } = dt(n, a, c);
      n = i, w ? o = o.add(ut(A, r[N])) : s = s.add(ut(h, r[p]));
    }
    return ht(n), { p: s, f: o };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(e, r, n, s = this.ZERO) {
    const o = ke(e, this.bits);
    for (let c = 0; c < o.windows && n !== Ee; c++) {
      const { nextN: a, offset: i, isZero: p, isNeg: w } = dt(n, c, o);
      if (n = a, !p) {
        const h = r[i];
        s = s.add(w ? h.negate() : h);
      }
    }
    return ht(n), s;
  }
  getPrecomputes(e, r, n) {
    let s = Ce.get(r);
    return s || (s = this.precomputeWindow(r, e), e !== 1 && (typeof n == "function" && (s = n(s)), Ce.set(r, s))), s;
  }
  cached(e, r, n) {
    const s = Le(e);
    return this.wNAF(s, this.getPrecomputes(s, e, n), r);
  }
  unsafe(e, r, n, s) {
    const o = Le(e);
    return o === 1 ? this._unsafeLadder(e, r, s) : this.wNAFUnsafe(o, this.getPrecomputes(o, e, n), r, s);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(e, r) {
    $t(r, this.bits), Ht.set(e, r), Ce.delete(e);
  }
  hasCache(e) {
    return Le(e) !== 1;
  }
}
function mt(t, e, r) {
  if (e) {
    if (e.ORDER !== t)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return ln(e), e;
  } else
    return We(t, { isLE: r });
}
function mn(t, e, r = {}, n) {
  if (n === void 0 && (n = t === "edwards"), !e || typeof e != "object")
    throw new Error(`expected valid ${t} CURVE object`);
  for (const i of ["p", "n", "h"]) {
    const p = e[i];
    if (!(typeof p == "bigint" && p > Ee))
      throw new Error(`CURVE.${i} must be positive bigint`);
  }
  const s = mt(e.p, r.Fp, n), o = mt(e.n, r.Fn, n), a = ["Gx", "Gy", "a", "d"];
  for (const i of a)
    if (!s.isValid(e[i]))
      throw new Error(`CURVE.${i} must be valid field element of CURVE.Fp`);
  return e = Object.freeze(Object.assign({}, e)), { CURVE: e, Fp: s, Fn: o };
}
function gn(t, e) {
  return function(n) {
    const s = t(n);
    return { secretKey: s, publicKey: e(s) };
  };
}
const re = BigInt(0), $ = BigInt(1), Te = BigInt(2), pn = BigInt(8);
function bn(t, e, r, n) {
  const s = t.sqr(r), o = t.sqr(n), c = t.add(t.mul(e.a, s), o), a = t.add(t.ONE, t.mul(e.d, t.mul(s, o)));
  return t.eql(c, a);
}
function wn(t, e = {}) {
  const r = mn("edwards", t, e, e.FpFnLE), { Fp: n, Fn: s } = r;
  let o = r.CURVE;
  const { h: c } = o;
  ze(e, {}, { uvRatio: "function" });
  const a = Te << BigInt(s.BYTES * 8) - $, i = (S) => n.create(S), p = e.uvRatio || ((S, m) => {
    try {
      return { isValid: !0, value: n.sqrt(n.div(S, m)) };
    } catch {
      return { isValid: !1, value: re };
    }
  });
  if (!bn(n, o, o.Gx, o.Gy))
    throw new Error("bad curve params: generator point");
  function w(S, m, b = !1) {
    const g = b ? $ : re;
    return at("coordinate " + S, m, g, a), m;
  }
  function h(S) {
    if (!(S instanceof R))
      throw new Error("EdwardsPoint expected");
  }
  const A = ct((S, m) => {
    const { X: b, Y: g, Z: E } = S, T = S.is0();
    m == null && (m = T ? pn : n.inv(E));
    const l = i(b * m), u = i(g * m), f = n.mul(E, m);
    if (T)
      return { x: re, y: $ };
    if (f !== $)
      throw new Error("invZ was invalid");
    return { x: l, y: u };
  }), N = ct((S) => {
    const { a: m, d: b } = o;
    if (S.is0())
      throw new Error("bad point: ZERO");
    const { X: g, Y: E, Z: T, T: l } = S, u = i(g * g), f = i(E * E), d = i(T * T), y = i(d * d), x = i(u * m), v = i(d * i(x + f)), I = i(y + i(b * i(u * f)));
    if (v !== I)
      throw new Error("bad point: equation left != right (1)");
    const C = i(g * E), L = i(T * l);
    if (C !== L)
      throw new Error("bad point: equation left != right (2)");
    return !0;
  });
  class R {
    // base / generator point
    static BASE = new R(o.Gx, o.Gy, $, i(o.Gx * o.Gy));
    // zero / infinity / identity point
    static ZERO = new R(re, $, $, re);
    // 0, 1, 1, 0
    // math field
    static Fp = n;
    // scalar field
    static Fn = s;
    X;
    Y;
    Z;
    T;
    constructor(m, b, g, E) {
      this.X = w("x", m), this.Y = w("y", b), this.Z = w("z", g, !0), this.T = w("t", E), Object.freeze(this);
    }
    static CURVE() {
      return o;
    }
    static fromAffine(m) {
      if (m instanceof R)
        throw new Error("extended point not allowed");
      const { x: b, y: g } = m || {};
      return w("x", b), w("y", g), new R(b, g, $, i(b * g));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(m, b = !1) {
      const g = n.BYTES, { a: E, d: T } = o;
      m = Ve(H(m, g, "point")), qe(b, "zip215");
      const l = Ve(m), u = m[g - 1];
      l[g - 1] = u & -129;
      const f = xe(l), d = b ? a : n.ORDER;
      at("point.y", f, re, d);
      const y = i(f * f), x = i(y - $), v = i(T * y - E);
      let { isValid: I, value: C } = p(x, v);
      if (!I)
        throw new Error("bad point: invalid y coordinate");
      const L = (C & $) === $, _ = (u & 128) !== 0;
      if (!b && C === re && _)
        throw new Error("bad point: x=0 and x_0=1");
      return _ !== L && (C = i(-C)), R.fromAffine({ x: C, y: f });
    }
    static fromHex(m, b = !1) {
      return R.fromBytes(It(m), b);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(m = 8, b = !0) {
      return B.createCache(this, m), b || this.multiply(Te), this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      N(this);
    }
    // Compare one point to another.
    equals(m) {
      h(m);
      const { X: b, Y: g, Z: E } = this, { X: T, Y: l, Z: u } = m, f = i(b * u), d = i(T * E), y = i(g * u), x = i(l * E);
      return f === d && y === x;
    }
    is0() {
      return this.equals(R.ZERO);
    }
    negate() {
      return new R(i(-this.X), this.Y, this.Z, i(-this.T));
    }
    // Fast algo for doubling Extended Point.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
    // Cost: 4M + 4S + 1*a + 6add + 1*2.
    double() {
      const { a: m } = o, { X: b, Y: g, Z: E } = this, T = i(b * b), l = i(g * g), u = i(Te * i(E * E)), f = i(m * T), d = b + g, y = i(i(d * d) - T - l), x = f + l, v = x - u, I = f - l, C = i(y * v), L = i(x * I), _ = i(y * I), U = i(v * x);
      return new R(C, L, U, _);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(m) {
      h(m);
      const { a: b, d: g } = o, { X: E, Y: T, Z: l, T: u } = this, { X: f, Y: d, Z: y, T: x } = m, v = i(E * f), I = i(T * d), C = i(u * g * x), L = i(l * y), _ = i((E + T) * (f + d) - v - I), U = L - C, V = L + C, z = i(I - b * v), oe = i(_ * U), he = i(V * z), ce = i(_ * z), me = i(U * V);
      return new R(oe, he, me, ce);
    }
    subtract(m) {
      return this.add(m.negate());
    }
    // Constant-time multiplication.
    multiply(m) {
      if (!s.isValidNot0(m))
        throw new Error("invalid scalar: expected 1 <= sc < curve.n");
      const { p: b, f: g } = B.cached(this, m, (E) => Ne(R, E));
      return Ne(R, [b, g])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Does NOT allow scalars higher than CURVE.n.
    // Accepts optional accumulator to merge with multiply (important for sparse scalars)
    multiplyUnsafe(m, b = R.ZERO) {
      if (!s.isValid(m))
        throw new Error("invalid scalar: expected 0 <= sc < curve.n");
      return m === re ? R.ZERO : this.is0() || m === $ ? this : B.unsafe(this, m, (g) => Ne(R, g), b);
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
      return B.unsafe(this, o.n).is0();
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    toAffine(m) {
      return A(this, m);
    }
    clearCofactor() {
      return c === $ ? this : this.multiplyUnsafe(c);
    }
    toBytes() {
      const { x: m, y: b } = this.toAffine(), g = n.toBytes(b);
      return g[g.length - 1] |= m & $ ? 128 : 0, g;
    }
    toHex() {
      return Pe(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const B = new hn(R, s.BITS);
  return R.BASE.precompute(8), R;
}
function yn(t, e, r = {}) {
  if (typeof e != "function")
    throw new Error('"hash" function param is required');
  ze(r, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    mapToCurve: "function"
  });
  const { prehash: n } = r, { BASE: s, Fp: o, Fn: c } = t, a = r.randomBytes || Or, i = r.adjustScalarBytes || ((f) => f), p = r.domain || ((f, d, y) => {
    if (qe(y, "phflag"), d.length || y)
      throw new Error("Contexts/pre-hash are not supported");
    return f;
  });
  function w(f) {
    return c.create(xe(f));
  }
  function h(f) {
    const d = g.secretKey;
    H(f, g.secretKey, "secretKey");
    const y = H(e(f), 2 * d, "hashedSecretKey"), x = i(y.slice(0, d)), v = y.slice(d, 2 * d), I = w(x);
    return { head: x, prefix: v, scalar: I };
  }
  function A(f) {
    const { head: d, prefix: y, scalar: x } = h(f), v = s.multiply(x), I = v.toBytes();
    return { head: d, prefix: y, scalar: x, point: v, pointBytes: I };
  }
  function N(f) {
    return A(f).pointBytes;
  }
  function R(f = Uint8Array.of(), ...d) {
    const y = rt(...d);
    return w(e(p(y, H(f, void 0, "context"), !!n)));
  }
  function B(f, d, y = {}) {
    f = H(f, void 0, "message"), n && (f = n(f));
    const { prefix: x, scalar: v, pointBytes: I } = A(d), C = R(y.context, x, f), L = s.multiply(C).toBytes(), _ = R(y.context, L, I, f), U = c.create(C + _ * v);
    if (!c.isValid(U))
      throw new Error("sign failed: invalid s");
    const V = rt(L, c.toBytes(U));
    return H(V, g.signature, "result");
  }
  const S = { zip215: !0 };
  function m(f, d, y, x = S) {
    const { context: v, zip215: I } = x, C = g.signature;
    f = H(f, C, "signature"), d = H(d, void 0, "message"), y = H(y, g.publicKey, "publicKey"), I !== void 0 && qe(I, "zip215"), n && (d = n(d));
    const L = C / 2, _ = f.subarray(0, L), U = xe(f.subarray(L, C));
    let V, z, oe;
    try {
      V = t.fromBytes(y, I), z = t.fromBytes(_, I), oe = s.multiplyUnsafe(U);
    } catch {
      return !1;
    }
    if (!I && V.isSmallOrder())
      return !1;
    const he = R(v, z.toBytes(), V.toBytes(), d);
    return z.add(V.multiplyUnsafe(he)).subtract(oe).clearCofactor().is0();
  }
  const b = o.BYTES, g = {
    secretKey: b,
    publicKey: b,
    signature: 2 * b,
    seed: b
  };
  function E(f = a(g.seed)) {
    return H(f, g.seed, "seed");
  }
  function T(f) {
    return St(f) && f.length === c.BYTES;
  }
  function l(f, d) {
    try {
      return !!t.fromBytes(f, d);
    } catch {
      return !1;
    }
  }
  const u = {
    getExtendedPublicKey: A,
    randomSecretKey: E,
    isValidSecretKey: T,
    isValidPublicKey: l,
    /**
     * Converts ed public key to x public key. Uses formula:
     * - ed25519:
     *   - `(u, v) = ((1+y)/(1-y), sqrt(-486664)*u/x)`
     *   - `(x, y) = (sqrt(-486664)*u/v, (u-1)/(u+1))`
     * - ed448:
     *   - `(u, v) = ((y-1)/(y+1), sqrt(156324)*u/x)`
     *   - `(x, y) = (sqrt(156324)*u/v, (1+u)/(1-u))`
     */
    toMontgomery(f) {
      const { y: d } = t.fromBytes(f), y = g.publicKey, x = y === 32;
      if (!x && y !== 57)
        throw new Error("only defined for 25519 and 448");
      const v = x ? o.div($ + d, $ - d) : o.div(d - $, d + $);
      return o.toBytes(v);
    },
    toMontgomerySecret(f) {
      const d = g.secretKey;
      H(f, d);
      const y = e(f.subarray(0, d));
      return i(y).subarray(0, d);
    }
  };
  return Object.freeze({
    keygen: gn(E, N),
    getPublicKey: N,
    sign: B,
    verify: m,
    utils: u,
    Point: t,
    lengths: g
  });
}
const xn = BigInt(1), gt = BigInt(2), En = BigInt(5), vn = BigInt(8), Ye = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"), An = {
  p: Ye,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: vn,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
};
function Bn(t) {
  const e = BigInt(10), r = BigInt(20), n = BigInt(40), s = BigInt(80), o = Ye, a = t * t % o * t % o, i = Y(a, gt, o) * a % o, p = Y(i, xn, o) * t % o, w = Y(p, En, o) * p % o, h = Y(w, e, o) * w % o, A = Y(h, r, o) * h % o, N = Y(A, n, o) * A % o, R = Y(N, s, o) * N % o, B = Y(R, s, o) * N % o, S = Y(B, e, o) * w % o;
  return { pow_p_5_8: Y(S, gt, o) * t % o, b2: a };
}
function Sn(t) {
  return t[0] &= 248, t[31] &= 127, t[31] |= 64, t;
}
const pt = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function Rn(t, e) {
  const r = Ye, n = q(e * e * e, r), s = q(n * n * e, r), o = Bn(t * s).pow_p_5_8;
  let c = q(t * n * o, r);
  const a = q(e * c * c, r), i = c, p = q(c * pt, r), w = a === t, h = a === q(-t, r), A = a === q(-t * pt, r);
  return w && (c = i), (h || A) && (c = p), an(c, r) && (c = q(-c, r)), { isValid: w || h, value: c };
}
const In = /* @__PURE__ */ wn(An, { uvRatio: Rn });
function Nn(t) {
  return yn(In, Yr, Object.assign({ adjustScalarBytes: Sn }, t));
}
const kn = /* @__PURE__ */ Nn({}), Cn = Cr, Ln = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function Tn(t) {
  if (t.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${t.length}`);
  const e = Cn(t), r = kn.getPublicKey(e), n = new Uint8Array(64);
  return n.set(e, 0), n.set(r, 32), yt(e), { publicKey: r, secretKey: n };
}
function _n(t) {
  const e = Tn(t), r = e.publicKey;
  return yt(e.secretKey), r;
}
function On(t) {
  if (t.length !== 32)
    throw new Error(`Invalid public key length: expected 32, got ${t.length}`);
  return Un(t);
}
function Un(t) {
  let e = 0;
  for (let s = 0; s < t.length && t[s] === 0; s++)
    e++;
  let r = 0n;
  for (let s = 0; s < t.length; s++)
    r = r * 256n + BigInt(t[s]);
  let n = "";
  for (; r > 0n; ) {
    const s = Number(r % 58n);
    n = Ln[s] + n, r = r / 58n;
  }
  return "1".repeat(e) + n;
}
const Dn = ["https:"], Gt = ["javascript:", "data:", "vbscript:", "file:"];
function Fn(t) {
  if (!t || typeof t != "string")
    return;
  const e = t.trim();
  if (!e)
    return;
  const r = e.toLowerCase();
  for (const n of Gt)
    if (r.startsWith(n))
      return;
  try {
    const n = new URL(e);
    return Dn.includes(n.protocol) ? e : void 0;
  } catch {
    return;
  }
}
function Mn(t) {
  if (!t || typeof t != "string")
    return;
  const e = t.trim();
  if (!e)
    return;
  const r = e.toLowerCase();
  for (const n of Gt)
    if (r.startsWith(n))
      return;
  try {
    const n = new URL(e);
    return n.protocol !== "https:" && n.protocol !== "http:" ? void 0 : e;
  } catch {
    return;
  }
}
async function qn(t) {
  const { password: e, serverUrl: r, accessToken: n, timeoutMs: s = 3e4 } = t, o = [];
  try {
    const c = Yt();
    o.push(c);
    const { shareA: a, shareB: i } = wr(c);
    o.push(a, i);
    const p = Xt(), w = await nr(e, p, Oe);
    o.push(w);
    const h = await Ft(a, Qt(w)), A = _n(c), N = On(A), R = {
      solanaPubkey: N,
      shareAAuthMethod: "password",
      shareACiphertext: h.ciphertext,
      shareANonce: h.nonce,
      shareB: Be(i),
      shareAKdfSalt: Be(p),
      shareAKdfParams: Oe,
      // Send seed as recovery data - server will store based on recovery mode
      recoveryData: Be(c)
    };
    return await new ve({
      baseUrl: r,
      timeoutMs: s,
      getAccessToken: n ? () => n : void 0
    }).post("/wallet/enroll", R), {
      success: !0,
      solanaPubkey: N
    };
  } catch (c) {
    const a = c instanceof Error ? c.message : "Wallet enrollment failed";
    return console.warn("[silentWalletEnroll] Failed:", a), {
      success: !1,
      error: a
    };
  } finally {
    Jt(...o);
  }
}
function Xe(t = {}) {
  const { maxAttempts: e = 5, windowMs: r = 6e4 } = t, n = bt([]), [s, o] = D(!1), [, c] = D(0), a = M(() => {
    c((B) => B + 1);
  }, []), i = M(() => {
    const B = Date.now();
    n.current = n.current.filter((S) => B - S < r);
  }, [r]), p = M(() => {
    i(), o((B) => n.current.length === 0 && B ? !1 : B);
  }, [i]), w = M(() => (i(), Math.max(0, e - n.current.length)), [i, e]), h = M(() => {
    if (i(), n.current.length === 0)
      return 0;
    const S = n.current[0] + r;
    return Math.max(0, S - Date.now());
  }, [i, r]), A = M(() => (i(), n.current.length < e), [i, e]), N = M(() => {
    if (p(), n.current.length >= e) {
      const B = h(), S = Math.ceil(B / 1e3);
      throw new Error(
        `Too many attempts. Please wait ${S} second${S === 1 ? "" : "s"} before trying again.`
      );
    }
    n.current.push(Date.now()), o((B) => B || !0), a();
  }, [p, e, h, a]), R = M(() => {
    n.current = [], o((B) => B && !1), a();
  }, [a]);
  return _e(() => {
    if (!s) return;
    const B = window.setInterval(() => {
      p(), a();
    }, 1e3);
    return () => {
      window.clearInterval(B);
    };
  }, [s, a, p]), {
    checkLimit: N,
    isAllowed: A,
    getRemainingAttempts: w,
    getTimeUntilReset: h,
    reset: R
  };
}
function Vn(t) {
  return "mfaRequired" in t && t.mfaRequired === !0;
}
function jt() {
  const { config: t, _internal: e } = de(), [r, n] = D(!1), [s, o] = D(null), {
    checkLimit: c,
    getRemainingAttempts: a,
    getTimeUntilReset: i,
    reset: p
  } = Xe({ maxAttempts: 5, windowMs: 6e4 }), w = He(
    () => new ve({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), h = t.callbacks, A = t.features?.walletEnrollment !== !1, N = t.serverUrl, R = M(
    async (m, b) => {
      if (!Ue(m)) {
        const g = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw o(g), g;
      }
      try {
        c();
      } catch (g) {
        const E = {
          code: "RATE_LIMITED",
          message: g instanceof Error ? g.message : "Too many attempts"
        };
        throw o(E), E;
      }
      n(!0), o(null);
      try {
        const g = await w.post("/login", {
          email: m,
          password: b
        });
        if (Vn(g))
          return {
            mfaRequired: !0,
            mfaToken: g.mfaToken,
            email: m,
            userId: g.userId
          };
        const E = g;
        return h?.onLoginSuccess?.(E.user, "email"), e?.handleLoginSuccess(E.user, E.tokens), p(), {
          mfaRequired: !1,
          response: E
        };
      } catch (g) {
        const E = ue(g, "Login failed");
        throw o(E), E;
      } finally {
        n(!1);
      }
    },
    [w, h, e, c, p]
  ), B = M(
    async (m, b, g) => {
      if (!Ue(m)) {
        const E = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw o(E), E;
      }
      try {
        c();
      } catch (E) {
        const T = {
          code: "RATE_LIMITED",
          message: E instanceof Error ? E.message : "Too many attempts"
        };
        throw o(T), T;
      }
      n(!0), o(null);
      try {
        const E = await w.post("/register", { email: m, password: b, name: g });
        if (h?.onLoginSuccess?.(E.user, "email"), e?.handleLoginSuccess(E.user, E.tokens), p(), A) {
          const T = E.tokens?.accessToken ?? "";
          qn({
            password: b,
            serverUrl: N,
            accessToken: T
          }).then((l) => {
            l.success ? console.log("[useEmailAuth] Wallet auto-enrolled:", l.solanaPubkey) : console.warn("[useEmailAuth] Wallet auto-enrollment failed:", l.error);
          });
        }
        return E;
      } catch (E) {
        const T = ue(E, "Registration failed");
        throw o(T), T;
      } finally {
        n(!1);
      }
    },
    [
      w,
      h,
      e,
      c,
      p,
      N,
      A
    ]
  ), S = M(() => o(null), []);
  return {
    login: R,
    register: B,
    isLoading: r,
    error: s,
    clearError: S,
    // M-10: Point-in-time snapshots for UI display (see interface JSDoc)
    remainingAttempts: a(),
    timeUntilReset: i()
  };
}
function $n(t) {
  return typeof t == "object" && t !== null && "mfaRequired" in t && t.mfaRequired === !0;
}
function Hn() {
  const { config: t, _internal: e } = de(), [r, n] = D(!1), [s, o] = D(!1), [c, a] = D(null), i = He(
    () => new ve({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), { checkLimit: p, getRemainingAttempts: w } = Xe({
    maxAttempts: 3,
    windowMs: 3e5
  }), h = M(
    async (B) => {
      if (!Ue(B)) {
        const S = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address"
        };
        throw a(S), S;
      }
      try {
        p();
      } catch (S) {
        const m = {
          code: "RATE_LIMITED",
          message: S instanceof Error ? S.message : "Too many attempts"
        };
        throw a(m), m;
      }
      n(!0), a(null), o(!1);
      try {
        await i.post("/instant-link", { email: B }), o(!0);
      } catch (S) {
        const m = ue(S, "Failed to send sign-in link");
        throw a(m), m;
      } finally {
        n(!1);
      }
    },
    [i, p]
  ), A = M(
    async (B) => {
      if (!B || B.trim().length === 0) {
        const S = {
          code: "VALIDATION_ERROR",
          message: "Invalid or missing sign-in link token"
        };
        throw a(S), S;
      }
      n(!0), a(null), o(!1);
      try {
        const S = await i.post(
          "/instant-link/verify",
          {
            token: B
          }
        );
        return $n(S) || (t.callbacks?.onLoginSuccess?.(S.user, "email"), e?.handleLoginSuccess(S.user, S.tokens)), S;
      } catch (S) {
        const m = ue(S, "Failed to verify sign-in link");
        throw a(m), m;
      } finally {
        n(!1);
      }
    },
    [i, t.callbacks, e]
  ), N = M(() => a(null), []), R = M(() => {
    a(null), o(!1), n(!1);
  }, []);
  return {
    sendInstantLink: h,
    verifyInstantLink: A,
    isLoading: r,
    isSuccess: s,
    error: c,
    clearError: N,
    reset: R,
    remainingAttempts: w()
  };
}
function Zt({
  label: t = "Password",
  labelAction: e,
  showStrengthMeter: r = !1,
  onValidationChange: n,
  error: s,
  className: o = "",
  onChange: c,
  value: a,
  ...i
}) {
  const [p, w] = D(!1), [h, A] = D(null), N = wt(), R = (S) => {
    const m = S.target.value;
    if (r || n) {
      const b = er(m);
      A(b), n?.(b);
    }
    c?.(S);
  }, B = {
    weak: "var(--cedros-destructive, #ef4444)",
    fair: "var(--cedros-warning, #f59e0b)",
    good: "var(--cedros-success, #22c55e)",
    strong: "var(--cedros-success, #22c55e)"
  };
  return /* @__PURE__ */ O("div", { className: `cedros-password-input ${o}`, children: [
    /* @__PURE__ */ O("div", { className: "cedros-label-row", children: [
      /* @__PURE__ */ k("label", { htmlFor: N, className: "cedros-label", children: t }),
      e
    ] }),
    /* @__PURE__ */ O("div", { className: "cedros-password-wrapper", children: [
      /* @__PURE__ */ k(
        "input",
        {
          id: N,
          type: p ? "text" : "password",
          className: "cedros-input",
          onChange: R,
          value: a,
          "aria-invalid": s ? "true" : void 0,
          "aria-describedby": s ? `${N}-error` : void 0,
          ...i
        }
      ),
      /* @__PURE__ */ k(
        "button",
        {
          type: "button",
          className: "cedros-password-toggle",
          onClick: () => w(!p),
          "aria-label": p ? "Hide password" : "Show password",
          "aria-pressed": p,
          children: p ? /* @__PURE__ */ O("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
            /* @__PURE__ */ k(
              "path",
              {
                d: "M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z",
                stroke: "currentColor",
                strokeWidth: "1.5"
              }
            ),
            /* @__PURE__ */ k("circle", { cx: "10", cy: "10", r: "2.5", stroke: "currentColor", strokeWidth: "1.5" }),
            /* @__PURE__ */ k("path", { d: "M3 17L17 3", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
          ] }) : /* @__PURE__ */ O("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
            /* @__PURE__ */ k(
              "path",
              {
                d: "M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z",
                stroke: "currentColor",
                strokeWidth: "1.5"
              }
            ),
            /* @__PURE__ */ k("circle", { cx: "10", cy: "10", r: "2.5", stroke: "currentColor", strokeWidth: "1.5" })
          ] })
        }
      )
    ] }),
    s && /* @__PURE__ */ k("p", { id: `${N}-error`, className: "cedros-input-error", children: s }),
    r && h && a?.length > 0 && /* @__PURE__ */ O("div", { className: "cedros-password-strength", children: [
      /* @__PURE__ */ k("div", { className: "cedros-strength-bar", children: /* @__PURE__ */ k(
        "div",
        {
          className: "cedros-strength-fill",
          style: {
            width: `${h.strength === "weak" ? 25 : h.strength === "fair" ? 50 : h.strength === "good" ? 75 : 100}%`,
            backgroundColor: B[h.strength]
          }
        }
      ) }),
      /* @__PURE__ */ k("span", { className: "cedros-strength-label", children: h.strength })
    ] })
  ] });
}
function Gn() {
  const { config: t, _internal: e } = de(), [r, n] = D("idle"), [s, o] = D(!1), [c, a] = D(null), {
    checkLimit: i,
    getRemainingAttempts: p,
    getTimeUntilReset: w,
    reset: h
  } = Xe({ maxAttempts: 5, windowMs: 12e4 }), A = He(
    () => new ve({
      baseUrl: t.serverUrl,
      timeoutMs: t.requestTimeout,
      retryAttempts: t.retryAttempts
    }),
    [t.serverUrl, t.requestTimeout, t.retryAttempts]
  ), N = M(
    async (S, m) => {
      const b = /^[A-Z0-9]{16}$/i.test(m) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/i.test(m);
      if (!(/^\d{6}$/.test(m) || b)) {
        const E = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid 6-digit code or recovery code"
        };
        throw a(E), E;
      }
      try {
        i();
      } catch (E) {
        const T = {
          code: "RATE_LIMITED",
          message: E instanceof Error ? E.message : "Too many attempts"
        };
        throw a(T), T;
      }
      o(!0), a(null), n("verifying");
      try {
        const E = await A.post("/login/mfa", { mfaToken: S, code: m });
        return n("success"), h(), e && E.user && E.tokens && e.handleLoginSuccess(E.user, E.tokens), E;
      } catch (E) {
        const T = ue(E, "Invalid verification code");
        throw a(T), n("error"), T;
      } finally {
        o(!1);
      }
    },
    [A, e, i, h]
  ), R = M(() => a(null), []), B = M(() => {
    a(null), n("idle"), o(!1);
  }, []);
  return {
    state: r,
    isLoading: s,
    error: c,
    verifyTotp: N,
    clearError: R,
    reset: B,
    // Point-in-time snapshots for UI display
    remainingAttempts: p(),
    timeUntilReset: w()
  };
}
const K = 6;
function jn({
  value: t = "",
  onChange: e,
  onComplete: r,
  disabled: n = !1,
  error: s,
  autoFocus: o = !1,
  className: c = ""
}) {
  const a = bt([]), [i, p] = D(t.padEnd(K, "")), w = wt();
  _e(() => {
    p(t.padEnd(K, ""));
  }, [t]);
  const h = M((m) => {
    m >= 0 && m < K && a.current[m]?.focus();
  }, []), A = M(
    (m) => {
      const b = m.replace(/\D/g, "").slice(0, K);
      p(b.padEnd(K, "")), e?.(b), b.length === K && r?.(b);
    },
    [e, r]
  ), N = M(
    (m, b) => {
      if (!/^\d?$/.test(b)) return;
      const g = i.split("");
      g[m] = b;
      const E = g.join("").replace(/ /g, "");
      A(E), b && m < K - 1 && h(m + 1);
    },
    [i, A, h]
  ), R = M(
    (m, b) => {
      if (b.key === "Backspace") {
        b.preventDefault();
        const g = i.split("");
        g[m] && g[m] !== " " ? (g[m] = " ", A(g.join("").replace(/ /g, ""))) : m > 0 && (g[m - 1] = " ", A(g.join("").replace(/ /g, "")), h(m - 1));
      } else b.key === "ArrowLeft" && m > 0 ? (b.preventDefault(), h(m - 1)) : b.key === "ArrowRight" && m < K - 1 && (b.preventDefault(), h(m + 1));
    },
    [i, A, h]
  ), B = M(
    (m) => {
      m.preventDefault();
      const g = m.clipboardData.getData("text").replace(/\D/g, "").slice(0, K);
      g && (A(g), h(Math.min(g.length, K - 1)));
    },
    [A, h]
  ), S = M((m) => {
    m.target.select();
  }, []);
  return _e(() => {
    o && !n && a.current[0]?.focus();
  }, [o, n]), /* @__PURE__ */ O("div", { className: `cedros-otp-input ${c}`, children: [
    /* @__PURE__ */ k("div", { className: "cedros-otp-slots", role: "group", "aria-label": "One-time password", children: Array.from({ length: K }).map((m, b) => /* @__PURE__ */ k(
      "input",
      {
        ref: (g) => {
          a.current[b] = g;
        },
        id: `${w}-${b}`,
        type: "text",
        inputMode: "numeric",
        pattern: "[0-9]*",
        maxLength: 1,
        className: `cedros-otp-slot ${s ? "cedros-otp-slot-error" : ""}`,
        value: i[b] === " " ? "" : i[b] || "",
        onChange: (g) => N(b, g.target.value),
        onKeyDown: (g) => R(b, g),
        onPaste: B,
        onFocus: S,
        disabled: n,
        autoComplete: "one-time-code",
        "aria-label": `Digit ${b + 1}`,
        "aria-invalid": s ? "true" : void 0
      },
      b
    )) }),
    s && /* @__PURE__ */ k("p", { className: "cedros-otp-error", role: "alert", children: s })
  ] });
}
function Zn({
  mfaToken: t,
  email: e,
  onSuccess: r,
  onBack: n,
  className: s = ""
}) {
  const { verifyTotp: o, isLoading: c, error: a, clearError: i } = Gn(), [p, w] = D(""), [h, A] = D(!1), [N, R] = D(""), B = async (b) => {
    const g = b || (h ? N : p);
    if (g)
      try {
        await o(t, g), r?.();
      } catch {
        h ? R("") : w("");
      }
  }, S = (b) => {
    B(b);
  }, m = () => {
    A(!h), i(), w(""), R("");
  };
  return /* @__PURE__ */ O("div", { className: `cedros-totp-verify ${s}`, children: [
    /* @__PURE__ */ O("div", { className: "cedros-totp-verify-header", children: [
      /* @__PURE__ */ O(
        "svg",
        {
          className: "cedros-totp-verify-icon",
          width: "48",
          height: "48",
          viewBox: "0 0 48 48",
          fill: "none",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ k("rect", { x: "8", y: "20", width: "32", height: "24", rx: "4", stroke: "currentColor", strokeWidth: "2" }),
            /* @__PURE__ */ k(
              "path",
              {
                d: "M16 20V14a8 8 0 1 1 16 0v6",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ k("circle", { cx: "24", cy: "32", r: "3", fill: "currentColor" })
          ]
        }
      ),
      /* @__PURE__ */ k("h3", { className: "cedros-totp-title", children: "Two-factor authentication" }),
      /* @__PURE__ */ k("p", { className: "cedros-totp-description", children: h ? "Enter one of your recovery codes to sign in." : "Enter the 6-digit code from your authenticator app." }),
      e && /* @__PURE__ */ k("p", { className: "cedros-totp-email", children: e })
    ] }),
    h ? /* @__PURE__ */ O("div", { className: "cedros-totp-backup-input", children: [
      /* @__PURE__ */ k(
        "input",
        {
          type: "text",
          className: `cedros-input ${a ? "cedros-input-error" : ""}`,
          placeholder: "Enter recovery code",
          value: N,
          onChange: (b) => {
            R(b.target.value.toUpperCase()), i();
          },
          onKeyDown: (b) => {
            b.key === "Enter" && N && B();
          },
          disabled: c,
          autoFocus: !0,
          autoComplete: "one-time-code"
        }
      ),
      a && /* @__PURE__ */ k("p", { className: "cedros-input-error", role: "alert", children: a.message })
    ] }) : /* @__PURE__ */ k(
      jn,
      {
        value: p,
        onChange: (b) => {
          w(b), i();
        },
        onComplete: S,
        disabled: c,
        error: a?.message,
        autoFocus: !0
      }
    ),
    /* @__PURE__ */ k(
      "button",
      {
        type: "button",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        onClick: () => B(),
        disabled: c || (h ? !N : p.length !== 6),
        children: c ? /* @__PURE__ */ O(fe, { children: [
          /* @__PURE__ */ k(Ge, { size: "sm" }),
          /* @__PURE__ */ k("span", { children: "Verifying..." })
        ] }) : "Verify"
      }
    ),
    /* @__PURE__ */ O("div", { className: "cedros-totp-verify-footer", children: [
      /* @__PURE__ */ k(
        "button",
        {
          type: "button",
          className: "cedros-link cedros-link-sm",
          onClick: m,
          disabled: c,
          children: h ? "Use authenticator app" : "Use a recovery code"
        }
      ),
      n && /* @__PURE__ */ O(fe, { children: [
        /* @__PURE__ */ k("span", { className: "cedros-totp-verify-divider", children: "•" }),
        /* @__PURE__ */ k(
          "button",
          {
            type: "button",
            className: "cedros-link cedros-link-sm",
            onClick: n,
            disabled: c,
            children: "Back to login"
          }
        )
      ] })
    ] })
  ] });
}
function Qn({
  onSuccess: t,
  onSwitchToRegister: e,
  onForgotPassword: r,
  className: n = ""
}) {
  const { config: s } = de(), { login: o, isLoading: c, error: a, clearError: i } = jt(), {
    sendInstantLink: p,
    isLoading: w,
    isSuccess: h,
    error: A,
    clearError: N,
    reset: R
  } = Hn(), [B, S] = D(""), [m, b] = D(""), [g, E] = D(null), [T, l] = D(""), u = s.forms?.forgotPassword?.mode ?? "reset", f = async (L) => {
    L.preventDefault();
    try {
      const _ = await o(B, m);
      _.mfaRequired ? (E(_.mfaToken), l(_.email)) : t?.();
    } catch {
    }
  }, d = () => {
    E(null), l(""), t?.();
  }, y = () => {
    E(null), l(""), b("");
  }, x = async () => {
    if (u === "instantLink")
      try {
        await p(B);
      } catch {
      }
    else
      r?.();
  };
  if (g)
    return /* @__PURE__ */ k(
      Zn,
      {
        mfaToken: g,
        email: T,
        onSuccess: d,
        onBack: y,
        className: n
      }
    );
  if (h)
    return /* @__PURE__ */ O("div", { className: `cedros-instant-link-success ${n}`, children: [
      /* @__PURE__ */ O(
        "svg",
        {
          className: "cedros-success-icon",
          width: "48",
          height: "48",
          viewBox: "0 0 48 48",
          fill: "none",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ k("circle", { cx: "24", cy: "24", r: "22", stroke: "currentColor", strokeWidth: "2" }),
            /* @__PURE__ */ k(
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
      /* @__PURE__ */ k("h3", { className: "cedros-success-title", children: "Check your email" }),
      /* @__PURE__ */ O("p", { className: "cedros-success-message", children: [
        "We sent a sign-in link to ",
        /* @__PURE__ */ k("strong", { children: B }),
        ". Click the link to sign in."
      ] }),
      /* @__PURE__ */ k(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-md cedros-button-outline",
          onClick: R,
          children: "Back to login"
        }
      )
    ] });
  const v = a || A, I = () => {
    i(), N();
  }, C = c || w;
  return /* @__PURE__ */ O("form", { onSubmit: f, className: `cedros-form ${n}`, children: [
    /* @__PURE__ */ O("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ k("label", { htmlFor: "email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ k(
        "input",
        {
          id: "email",
          type: "email",
          className: "cedros-input",
          value: B,
          onChange: (L) => S(L.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: C
        }
      )
    ] }),
    /* @__PURE__ */ k("div", { className: "cedros-form-field", children: /* @__PURE__ */ k(
      Zt,
      {
        value: m,
        onChange: (L) => b(L.target.value),
        placeholder: "Enter your password",
        required: !0,
        autoComplete: "current-password",
        disabled: C,
        labelAction: r || u === "instantLink" ? /* @__PURE__ */ k(
          "button",
          {
            type: "button",
            className: "cedros-link cedros-link-sm",
            onClick: x,
            disabled: w,
            children: w ? "Sending..." : "Forgot your password?"
          }
        ) : void 0
      }
    ) }),
    /* @__PURE__ */ k(xt, { error: v, onDismiss: I }),
    /* @__PURE__ */ k(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: C || !B || !m,
        "aria-busy": c,
        children: c ? /* @__PURE__ */ O(fe, { children: [
          /* @__PURE__ */ k(Ge, { size: "sm", announce: !0, label: "Signing in" }),
          /* @__PURE__ */ k("span", { children: "Signing in..." })
        ] }) : "Sign in"
      }
    ),
    e && /* @__PURE__ */ O("p", { className: "cedros-form-footer", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ k("button", { type: "button", className: "cedros-link", onClick: e, children: "Sign up" })
    ] })
  ] });
}
function Jn({
  onSuccess: t,
  onSwitchToLogin: e,
  className: r = ""
}) {
  const { config: n } = de(), { register: s, isLoading: o, error: c, clearError: a } = jt(), [i, p] = D(""), [w, h] = D(""), [A, N] = D(""), [R, B] = D(""), [S, m] = D(null), [b, g] = D(null), E = n.forms?.termsOfService, T = n.forms?.emailOptIn, l = E?.show ?? !1, u = E?.required ?? !0, f = E?.defaultChecked ?? !1, d = E?.label ?? "I agree to the Terms of Service", y = E?.url, x = Mn(y), v = T?.show ?? !1, I = T?.defaultChecked ?? !1, C = T?.label ?? "Send me updates and news", [L, _] = D(f), [U, V] = D(I), z = A === R, oe = S?.isValid ?? !1, ce = w && A && R && z && oe && (!l || !u || L) && !o, me = async (P) => {
    if (P.preventDefault(), g(null), l && u && !L) {
      g({
        code: "VALIDATION_ERROR",
        message: "You must agree to the Terms of Service to continue"
      });
      return;
    }
    if (ce)
      try {
        await s(w, A, i || void 0), t?.();
      } catch {
      }
  }, Pt = c || b, zt = () => {
    a(), g(null);
  };
  return /* @__PURE__ */ O("form", { onSubmit: me, className: `cedros-form ${r}`, children: [
    /* @__PURE__ */ O("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ O("label", { htmlFor: "name", className: "cedros-label", children: [
        "Name ",
        /* @__PURE__ */ k("span", { className: "cedros-optional", children: "(optional)" })
      ] }),
      /* @__PURE__ */ k(
        "input",
        {
          id: "name",
          type: "text",
          className: "cedros-input",
          value: i,
          onChange: (P) => p(P.target.value),
          placeholder: "Your name",
          autoComplete: "name",
          disabled: o
        }
      )
    ] }),
    /* @__PURE__ */ O("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ k("label", { htmlFor: "register-email", className: "cedros-label", children: "Email" }),
      /* @__PURE__ */ k(
        "input",
        {
          id: "register-email",
          type: "email",
          className: "cedros-input",
          value: w,
          onChange: (P) => h(P.target.value),
          placeholder: "you@example.com",
          required: !0,
          "aria-required": "true",
          autoComplete: "email",
          disabled: o
        }
      )
    ] }),
    /* @__PURE__ */ k("div", { className: "cedros-form-field", children: /* @__PURE__ */ k(
      Zt,
      {
        value: A,
        onChange: (P) => N(P.target.value),
        placeholder: "Create a password",
        required: !0,
        autoComplete: "new-password",
        disabled: o,
        showStrengthMeter: !0,
        onValidationChange: m
      }
    ) }),
    /* @__PURE__ */ O("div", { className: "cedros-form-field", children: [
      /* @__PURE__ */ k("label", { htmlFor: "confirm-password", className: "cedros-label", children: "Confirm Password" }),
      /* @__PURE__ */ k(
        "input",
        {
          id: "confirm-password",
          type: "password",
          className: "cedros-input",
          value: R,
          onChange: (P) => B(P.target.value),
          placeholder: "Confirm your password",
          required: !0,
          "aria-required": "true",
          autoComplete: "new-password",
          disabled: o,
          "aria-invalid": R && !z ? "true" : void 0,
          "aria-describedby": R && !z ? "confirm-password-error" : void 0
        }
      ),
      R && !z && /* @__PURE__ */ k("p", { id: "confirm-password-error", className: "cedros-input-error", role: "alert", children: "Passwords do not match" })
    ] }),
    l && /* @__PURE__ */ k("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ O("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ k(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: L,
          onChange: (P) => _(P.target.checked),
          disabled: o,
          "aria-required": u
        }
      ),
      /* @__PURE__ */ O("span", { className: "cedros-checkbox-text", children: [
        x ? /* @__PURE__ */ O(fe, { children: [
          d.replace("Terms of Service", "").trim() || "I agree to the",
          " ",
          /* @__PURE__ */ k(
            "a",
            {
              href: x,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "cedros-link",
              children: "Terms of Service"
            }
          )
        ] }) : d,
        u && /* @__PURE__ */ k("span", { className: "cedros-required", children: "*" })
      ] })
    ] }) }),
    v && /* @__PURE__ */ k("div", { className: "cedros-form-field cedros-checkbox-field", children: /* @__PURE__ */ O("label", { className: "cedros-checkbox-label", children: [
      /* @__PURE__ */ k(
        "input",
        {
          type: "checkbox",
          className: "cedros-checkbox",
          checked: U,
          onChange: (P) => V(P.target.checked),
          disabled: o
        }
      ),
      /* @__PURE__ */ k("span", { className: "cedros-checkbox-text", children: C })
    ] }) }),
    /* @__PURE__ */ k(xt, { error: Pt, onDismiss: zt }),
    /* @__PURE__ */ k(
      "button",
      {
        type: "submit",
        className: "cedros-button cedros-button-primary cedros-button-md cedros-button-full",
        disabled: !ce,
        "aria-busy": o,
        children: o ? /* @__PURE__ */ O(fe, { children: [
          /* @__PURE__ */ k(Ge, { size: "sm", announce: !0, label: "Creating account" }),
          /* @__PURE__ */ k("span", { children: "Creating account..." })
        ] }) : "Create account"
      }
    ),
    e && /* @__PURE__ */ O("p", { className: "cedros-form-footer", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ k("button", { type: "button", className: "cedros-link", onClick: e, children: "Sign in" })
    ] })
  ] });
}
export {
  Qn as E,
  jn as O,
  Zt as P,
  Zn as T,
  Jn as a,
  je as b,
  Fn as c,
  Xe as d,
  wr as e,
  nr as f,
  _n as g,
  Yn as h,
  sr as i,
  Mn as j,
  Hn as k,
  Gn as l,
  On as p,
  Cr as s,
  jt as u
};
