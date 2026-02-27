import { D as Be, v as ve, d as Se, e as ee, f as ht, h as Ae } from "./useAuth-D1NSN6yY.js";
let P = null, Re = 0;
const et = /* @__PURE__ */ new Map();
function Ie() {
  return typeof Worker > "u" ? null : (P || (P = new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/argon2Worker-Bi5TuQvD.js", import.meta.url).href,
    import.meta.url
  ), {
    type: "module"
  }), P.onmessage = (e) => {
    const { id: t, key: n, error: o } = e.data, r = et.get(t);
    if (r) {
      if (et.delete(t), o) {
        r.reject(new Error(o));
        return;
      }
      if (!n) {
        r.reject(new Error("Argon2 worker returned no key"));
        return;
      }
      r.resolve(n);
    }
  }, P.onerror = (e) => {
    const t = e instanceof ErrorEvent ? e.error : new Error("Argon2 worker error");
    for (const n of et.values())
      n.reject(t instanceof Error ? t : new Error(String(t)));
    et.clear(), P?.terminate(), P = null;
  }), P);
}
async function sr(e, t, n = Be) {
  ve(n);
  const o = Ie();
  return o ? new Promise((r, s) => {
    const c = Re++;
    et.set(c, { resolve: r, reject: s });
    const u = {
      id: c,
      password: e,
      salt: t,
      params: n
    };
    o.postMessage(u);
  }) : Se(e, t, n);
}
function _e(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Ne(e) {
  if (Object.prototype.hasOwnProperty.call(e, "__esModule")) return e;
  var t = e.default;
  if (typeof t == "function") {
    var n = function o() {
      var r = !1;
      try {
        r = this instanceof o;
      } catch {
      }
      return r ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    n.prototype = t.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(e).forEach(function(o) {
    var r = Object.getOwnPropertyDescriptor(e, o);
    Object.defineProperty(n, o, r.get ? r : {
      enumerable: !0,
      get: function() {
        return e[o];
      }
    });
  }), n;
}
var it = { exports: {} };
const Oe = globalThis.crypto, Te = globalThis.crypto, Ce = globalThis.crypto.subtle, Le = globalThis.crypto.getRandomValues.bind(globalThis.crypto), He = globalThis.crypto.randomUUID.bind(globalThis.crypto), Ue = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Oe,
  getRandomValues: Le,
  randomUUID: He,
  subtle: Ce,
  webcrypto: Te
}, Symbol.toStringTag, { value: "Module" })), De = /* @__PURE__ */ Ne(Ue);
var qe = it.exports, Ut;
function Me() {
  return Ut || (Ut = 1, (function(e, t) {
    (function(n, o) {
      e.exports = o(De);
    })(qe, function(n) {
      var o, r, s, c, u;
      function i() {
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
        }, r = {}, s = new Array(1024).join("0"), c = !0, u = [
          "nodeCryptoRandomBytes",
          "browserCryptoGetRandomValues",
          "testRandom"
        ];
      }
      function x() {
        return !!(r && r.rng && typeof r.rng == "function");
      }
      function m(a, h) {
        var f;
        if (h === 0 || h === 1)
          return a;
        if (h && h > 1024)
          throw new Error(
            "Padding must be multiples of no larger than 1024 bits."
          );
        return h = h || r.bits, a && (f = a.length % h), f ? (s + a).slice(
          -(h - f + a.length)
        ) : a;
      }
      function w(a) {
        var h = "", f, l;
        for (l = a.length - 1; l >= 0; l--) {
          if (f = parseInt(a[l], 16), isNaN(f))
            throw new Error("Invalid hex character.");
          h = m(f.toString(2), 4) + h;
        }
        return h;
      }
      function v(a) {
        var h = "", f, l;
        for (a = m(a, 4), l = a.length; l >= 4; l -= 4) {
          if (f = parseInt(a.slice(l - 4, l), 2), isNaN(f))
            throw new Error("Invalid binary character.");
          h = f.toString(16) + h;
        }
        return h;
      }
      function I() {
        return !!(n && typeof n == "object" && (typeof n.getRandomValues == "function" || typeof n.getRandomValues == "object") && (typeof Uint32Array == "function" || typeof Uint32Array == "object"));
      }
      function S() {
        return typeof n == "object" && typeof n.randomBytes == "function";
      }
      function O(a) {
        function h(b, g, y, B) {
          var R = 0, C, L = "", q;
          for (g && (C = g.length - 1); R < C || L.length < b; )
            q = Math.abs(parseInt(g[R], y)), L = L + m(q.toString(2), B), R++;
          return L = L.substr(-b), (L.match(/0/g) || []).length === L.length ? null : L;
        }
        function f(b) {
          var g, y, B, R, C = null;
          for (B = 16, R = 4, y = Math.ceil(b / 8); C === null; )
            g = n.randomBytes(y), C = h(b, g.toString("hex"), B, R);
          return C;
        }
        function l(b) {
          var g, y, B, R = null;
          for (y = 10, B = 32, g = Math.ceil(b / 32); R === null; )
            R = h(
              b,
              n.getRandomValues(new Uint32Array(g)),
              y,
              B
            );
          return R;
        }
        function d(b) {
          var g, y, B, R, C, L = null;
          R = 10, C = 32, y = Math.ceil(b / 32), B = 123456789, g = new Uint32Array(y);
          for (var q = 0; q < g.length; q++)
            g[q] = B;
          for (; L === null; )
            L = h(b, g, R, C);
          return L;
        }
        if (a && a === "testRandom")
          return r.typeCSPRNG = a, d;
        if (a && a === "nodeCryptoRandomBytes")
          return r.typeCSPRNG = a, f;
        if (a && a === "browserCryptoGetRandomValues")
          return r.typeCSPRNG = a, l;
        if (S())
          return r.typeCSPRNG = "nodeCryptoRandomBytes", f;
        if (I())
          return r.typeCSPRNG = "browserCryptoGetRandomValues", l;
      }
      function _(a, h) {
        var f = [], l;
        for (h && (a = m(a, h)), l = a.length; l > r.bits; l -= r.bits)
          f.push(parseInt(a.slice(l - r.bits, l), 2));
        return f.push(parseInt(a.slice(0, l), 2)), f;
      }
      function E(a, h) {
        var f = r.logs[a], l = 0, d;
        for (d = h.length - 1; d >= 0; d--)
          l !== 0 ? l = r.exps[(f + r.logs[l]) % r.maxShares] ^ h[d] : l = h[d];
        return l;
      }
      function A(a, h, f) {
        var l = 0, d, b, g, y;
        for (g = 0, d = h.length; g < d; g++)
          if (f[g]) {
            for (b = r.logs[f[g]], y = 0; y < d; y++)
              if (g !== y) {
                if (a === h[y]) {
                  b = -1;
                  break;
                }
                b = (b + r.logs[a ^ h[y]] - r.logs[h[g] ^ h[y]] + r.maxShares) % r.maxShares;
              }
            l = b === -1 ? l : l ^ r.exps[b];
          }
        return l;
      }
      function p(a, h, f) {
        var l = [], d = [a], b, g;
        for (b = 1; b < f; b++)
          d[b] = parseInt(r.rng(r.bits), 2);
        for (b = 1, g = h + 1; b < g; b++)
          l[b - 1] = {
            x: b,
            y: E(b, d)
          };
        return l;
      }
      function N(a, h, f) {
        var l, d, b, g, y;
        if (h = parseInt(h, r.radix), a = parseInt(a, 10) || r.bits, l = a.toString(36).toUpperCase(), b = Math.pow(2, a) - 1, g = b.toString(r.radix).length, d = m(h.toString(r.radix), g), typeof h != "number" || h % 1 !== 0 || h < 1 || h > b)
          throw new Error(
            "Share id must be an integer between 1 and " + b + ", inclusive."
          );
        return y = l + d + f, y;
      }
      var T = {
        init: function(a, h) {
          var f = [], l = [], d = 1, b, g;
          if (i(), a && (typeof a != "number" || a % 1 !== 0 || a < o.minBits || a > o.maxBits))
            throw new Error(
              "Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (h && u.indexOf(h) === -1)
            throw new Error("Invalid RNG type argument : '" + h + "'");
          for (r.radix = o.radix, r.bits = a || o.bits, r.size = Math.pow(2, r.bits), r.maxShares = r.size - 1, b = o.primitivePolynomials[r.bits], g = 0; g < r.size; g++)
            l[g] = d, f[d] = g, d = d << 1, d >= r.size && (d = d ^ b, d = d & r.maxShares);
          if (r.logs = f, r.exps = l, h && this.setRNG(h), x() || this.setRNG(), !x() || !r.bits || !r.size || !r.maxShares || !r.logs || !r.exps || r.logs.length !== r.size || r.exps.length !== r.size)
            throw new Error("Initialization failed.");
        },
        // Evaluates the Lagrange interpolation polynomial at x=`at` for
        // individual config.bits-length segments of each share in the `shares`
        // Array. Each share is expressed in base `inputRadix`. The output
        // is expressed in base `outputRadix'.
        combine: function(a, h) {
          var f, l, d, b, g = "", y, B, R, C = [], L = [];
          for (h = h || 0, f = 0, d = a.length; f < d; f++) {
            if (B = this.extractShareComponents(a[f]), y === void 0)
              y = B.bits;
            else if (B.bits !== y)
              throw new Error(
                "Mismatched shares: Different bit settings."
              );
            if (r.bits !== y && this.init(y), C.indexOf(B.id) === -1)
              for (C.push(B.id), R = _(w(B.data)), l = 0, b = R.length; l < b; l++)
                L[l] = L[l] || [], L[l][C.length - 1] = R[l];
          }
          for (f = 0, d = L.length; f < d; f++)
            g = m(A(h, C, L[f]).toString(2)) + g;
          return v(
            h >= 1 ? g : g.slice(g.indexOf("1") + 1)
          );
        },
        getConfig: function() {
          var a = {};
          return a.radix = r.radix, a.bits = r.bits, a.maxShares = r.maxShares, a.hasCSPRNG = x(), a.typeCSPRNG = r.typeCSPRNG, a;
        },
        // Given a public share, extract the bits (Integer), share ID (Integer), and share data (Hex)
        // and return an Object containing those components.
        extractShareComponents: function(a) {
          var h, f, l, d, b = {}, g, y;
          if (h = parseInt(a.substr(0, 1), 36), h && (typeof h != "number" || h % 1 !== 0 || h < o.minBits || h > o.maxBits))
            throw new Error(
              "Invalid share : Number of bits must be an integer between " + o.minBits + " and " + o.maxBits + ", inclusive."
            );
          if (d = Math.pow(2, h) - 1, l = (Math.pow(2, h) - 1).toString(r.radix).length, g = "^([a-kA-K3-9]{1})([a-fA-F0-9]{" + l + "})([a-fA-F0-9]+)$", y = new RegExp(g).exec(a), y && (f = parseInt(y[2], r.radix)), typeof f != "number" || f % 1 !== 0 || f < 1 || f > d)
            throw new Error(
              "Invalid share : Share id must be an integer between 1 and " + r.maxShares + ", inclusive."
            );
          if (y && y[3])
            return b.bits = h, b.id = f, b.data = y[3], b;
          throw new Error("The share data provided is invalid : " + a);
        },
        // Set the PRNG to use. If no RNG function is supplied, pick a default using getRNG()
        setRNG: function(a) {
          var h = "Random number generator is invalid ", f = " Supply an CSPRNG of the form function(bits){} that returns a string containing 'bits' number of random 1's and 0's.";
          if (a && typeof a == "string" && u.indexOf(a) === -1)
            throw new Error("Invalid RNG type argument : '" + a + "'");
          if (a || (a = O()), a && typeof a == "string" && (a = O(a)), c) {
            if (a && typeof a != "function")
              throw new Error(h + "(Not a function)." + f);
            if (a && typeof a(r.bits) != "string")
              throw new Error(
                h + "(Output is not a string)." + f
              );
            if (a && !parseInt(a(r.bits), 2))
              throw new Error(
                h + "(Binary string output not parseable to an Integer)." + f
              );
            if (a && a(r.bits).length > r.bits)
              throw new Error(
                h + "(Output length is greater than config.bits)." + f
              );
            if (a && a(r.bits).length < r.bits)
              throw new Error(
                h + "(Output length is less than config.bits)." + f
              );
          }
          return r.rng = a, !0;
        },
        // Converts a given UTF16 character string to the HEX representation.
        // Each character of the input string is represented by
        // `bytesPerChar` bytes in the output string which defaults to 2.
        str2hex: function(a, h) {
          var f, l, d = "", b, g, y, B;
          if (typeof a != "string")
            throw new Error("Input must be a character string.");
          if (h || (h = o.bytesPerChar), typeof h != "number" || h < 1 || h > o.maxBytesPerChar || h % 1 !== 0)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (f = 2 * h, l = Math.pow(16, f) - 1, y = 0, B = a.length; y < B; y++) {
            if (g = a[y].charCodeAt(), isNaN(g))
              throw new Error("Invalid character: " + a[y]);
            if (g > l)
              throw b = Math.ceil(Math.log(g + 1) / Math.log(256)), new Error(
                "Invalid character code (" + g + "). Maximum allowable is 256^bytes-1 (" + l + "). To convert this character, use at least " + b + " bytes."
              );
            d = m(g.toString(16), f) + d;
          }
          return d;
        },
        // Converts a given HEX number string to a UTF16 character string.
        hex2str: function(a, h) {
          var f, l = "", d, b;
          if (typeof a != "string")
            throw new Error("Input must be a hexadecimal string.");
          if (h = h || o.bytesPerChar, typeof h != "number" || h % 1 !== 0 || h < 1 || h > o.maxBytesPerChar)
            throw new Error(
              "Bytes per character must be an integer between 1 and " + o.maxBytesPerChar + ", inclusive."
            );
          for (f = 2 * h, a = m(a, f), d = 0, b = a.length; d < b; d += f)
            l = String.fromCharCode(
              parseInt(a.slice(d, d + f), 16)
            ) + l;
          return l;
        },
        // Generates a random bits-length number string using the PRNG
        random: function(a) {
          if (typeof a != "number" || a % 1 !== 0 || a < 2 || a > 65536)
            throw new Error(
              "Number of bits must be an Integer between 1 and 65536."
            );
          return v(r.rng(a));
        },
        // Divides a `secret` number String str expressed in radix `inputRadix` (optional, default 16)
        // into `numShares` shares, each expressed in radix `outputRadix` (optional, default to `inputRadix`),
        // requiring `threshold` number of shares to reconstruct the secret.
        // Optionally, zero-pads the secret to a length that is a multiple of padLength before sharing.
        share: function(a, h, f, l) {
          var d, b, g = new Array(h), y = new Array(h), B, R, C;
          if (l = l || 128, typeof a != "string")
            throw new Error("Secret must be a string.");
          if (typeof h != "number" || h % 1 !== 0 || h < 2)
            throw new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + r.maxShares + "), inclusive."
            );
          if (h > r.maxShares)
            throw d = Math.ceil(Math.log(h + 1) / Math.LN2), new Error(
              "Number of shares must be an integer between 2 and 2^bits-1 (" + r.maxShares + "), inclusive. To create " + h + " shares, use at least " + d + " bits."
            );
          if (typeof f != "number" || f % 1 !== 0 || f < 2)
            throw new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + r.maxShares + "), inclusive."
            );
          if (f > r.maxShares)
            throw d = Math.ceil(Math.log(f + 1) / Math.LN2), new Error(
              "Threshold number of shares must be an integer between 2 and 2^bits-1 (" + r.maxShares + "), inclusive.  To use a threshold of " + f + ", use at least " + d + " bits."
            );
          if (f > h)
            throw new Error(
              "Threshold number of shares was " + f + " but must be less than or equal to the " + h + " shares specified as the total to generate."
            );
          if (typeof l != "number" || l % 1 !== 0 || l < 0 || l > 1024)
            throw new Error(
              "Zero-pad length must be an integer between 0 and 1024 inclusive."
            );
          for (a = "1" + w(a), a = _(a, l), B = 0, C = a.length; B < C; B++)
            for (b = p(a[B], h, f), R = 0; R < h; R++)
              g[R] = g[R] || b[R].x.toString(r.radix), y[R] = m(b[R].y.toString(2)) + (y[R] || "");
          for (B = 0; B < h; B++)
            g[B] = N(
              r.bits,
              g[B],
              v(y[B])
            );
          return g;
        },
        // Generate a new share with id `id` (a number between 1 and 2^bits-1)
        // `id` can be a Number or a String in the default radix (16)
        newShare: function(a, h) {
          var f, l;
          if (a && typeof a == "string" && (a = parseInt(a, r.radix)), l = a.toString(r.radix), a && l && h && h[0])
            return f = this.extractShareComponents(h[0]), N(
              f.bits,
              l,
              this.combine(h, a)
            );
          throw new Error(
            "Invalid 'id' or 'shares' Array argument to newShare()."
          );
        },
        /* test-code */
        // export private functions so they can be unit tested directly.
        _reset: i,
        _padLeft: m,
        _hex2bin: w,
        _bin2hex: v,
        _hasCryptoGetRandomValues: I,
        _hasCryptoRandomBytes: S,
        _getRNG: O,
        _isSetRNG: x,
        _splitNumStringToIntArray: _,
        _horner: E,
        _lagrange: A,
        _getShares: p,
        _constructPublicShareString: N
        /* end-test-code */
      };
      return T.init(), T;
    });
  })(it)), it.exports;
}
var Ge = Me();
const ne = /* @__PURE__ */ _e(Ge);
function re(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Rt(e, t = "") {
  if (!Number.isSafeInteger(e) || e < 0) {
    const n = t && `"${t}" `;
    throw new Error(`${n}expected integer >= 0, got ${e}`);
  }
}
function D(e, t, n = "") {
  const o = re(e), r = e?.length, s = t !== void 0;
  if (!o || s && r !== t) {
    const c = n && `"${n}" `, u = s ? ` of length ${t}` : "", i = o ? `length=${r}` : `type=${typeof e}`;
    throw new Error(c + "expected Uint8Array" + u + ", got " + i);
  }
  return e;
}
function Dt(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function $e(e, t) {
  D(e, void 0, "digestInto() output");
  const n = t.outputLen;
  if (e.length < n)
    throw new Error('"digestInto() output" expected to be of length >=' + n);
}
function mt(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function lt(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
const oe = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", Ze = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function It(e) {
  if (D(e), oe)
    return e.toHex();
  let t = "";
  for (let n = 0; n < e.length; n++)
    t += Ze[e[n]];
  return t;
}
const V = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function qt(e) {
  if (e >= V._0 && e <= V._9)
    return e - V._0;
  if (e >= V.A && e <= V.F)
    return e - (V.A - 10);
  if (e >= V.a && e <= V.f)
    return e - (V.a - 10);
}
function se(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  if (oe)
    return Uint8Array.fromHex(e);
  const t = e.length, n = t / 2;
  if (t % 2)
    throw new Error("hex string expected, got unpadded hex of length " + t);
  const o = new Uint8Array(n);
  for (let r = 0, s = 0; r < n; r++, s += 2) {
    const c = qt(e.charCodeAt(s)), u = qt(e.charCodeAt(s + 1));
    if (c === void 0 || u === void 0) {
      const i = e[s] + e[s + 1];
      throw new Error('hex string expected, got non-hex character "' + i + '" at index ' + s);
    }
    o[r] = c * 16 + u;
  }
  return o;
}
function Mt(...e) {
  let t = 0;
  for (let o = 0; o < e.length; o++) {
    const r = e[o];
    D(r), t += r.length;
  }
  const n = new Uint8Array(t);
  for (let o = 0, r = 0; o < e.length; o++) {
    const s = e[o];
    n.set(s, r), r += s.length;
  }
  return n;
}
function je(e, t = {}) {
  const n = (r, s) => e(s).update(r).digest(), o = e(void 0);
  return n.outputLen = o.outputLen, n.blockLen = o.blockLen, n.create = (r) => e(r), Object.assign(n, t), Object.freeze(n);
}
function Ve(e = 32) {
  const t = typeof globalThis == "object" ? globalThis.crypto : null;
  if (typeof t?.getRandomValues != "function")
    throw new Error("crypto.getRandomValues must be defined");
  return t.getRandomValues(new Uint8Array(e));
}
const ke = (e) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, e])
});
let Ke = class {
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
  constructor(t, n, o, r) {
    this.blockLen = t, this.outputLen = n, this.padOffset = o, this.isLE = r, this.buffer = new Uint8Array(t), this.view = lt(this.buffer);
  }
  update(t) {
    Dt(this), D(t);
    const { view: n, buffer: o, blockLen: r } = this, s = t.length;
    for (let c = 0; c < s; ) {
      const u = Math.min(r - this.pos, s - c);
      if (u === r) {
        const i = lt(t);
        for (; r <= s - c; c += r)
          this.process(i, c);
        continue;
      }
      o.set(t.subarray(c, c + u), this.pos), this.pos += u, c += u, this.pos === r && (this.process(n, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    Dt(this), $e(t, this), this.finished = !0;
    const { buffer: n, view: o, blockLen: r, isLE: s } = this;
    let { pos: c } = this;
    n[c++] = 128, mt(this.buffer.subarray(c)), this.padOffset > r - c && (this.process(o, 0), c = 0);
    for (let w = c; w < r; w++)
      n[w] = 0;
    o.setBigUint64(r - 8, BigInt(this.length * 8), s), this.process(o, 0);
    const u = lt(t), i = this.outputLen;
    if (i % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const x = i / 4, m = this.get();
    if (x > m.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let w = 0; w < x; w++)
      u.setUint32(4 * w, m[w], s);
  }
  digest() {
    const { buffer: t, outputLen: n } = this;
    this.digestInto(t);
    const o = t.slice(0, n);
    return this.destroy(), o;
  }
  _cloneInto(t) {
    t ||= new this.constructor(), t.set(...this.get());
    const { blockLen: n, buffer: o, length: r, finished: s, destroyed: c, pos: u } = this;
    return t.destroyed = c, t.finished = s, t.length = r, t.pos = u, r % n && t.buffer.set(o), t;
  }
  clone() {
    return this._cloneInto();
  }
};
const M = /* @__PURE__ */ Uint32Array.from([
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
]), rt = /* @__PURE__ */ BigInt(2 ** 32 - 1), Gt = /* @__PURE__ */ BigInt(32);
function Ye(e, t = !1) {
  return t ? { h: Number(e & rt), l: Number(e >> Gt & rt) } : { h: Number(e >> Gt & rt) | 0, l: Number(e & rt) | 0 };
}
function ze(e, t = !1) {
  const n = e.length;
  let o = new Uint32Array(n), r = new Uint32Array(n);
  for (let s = 0; s < n; s++) {
    const { h: c, l: u } = Ye(e[s], t);
    [o[s], r[s]] = [c, u];
  }
  return [o, r];
}
const $t = (e, t, n) => e >>> n, Zt = (e, t, n) => e << 32 - n | t >>> n, J = (e, t, n) => e >>> n | t << 32 - n, tt = (e, t, n) => e << 32 - n | t >>> n, ot = (e, t, n) => e << 64 - n | t >>> n - 32, st = (e, t, n) => e >>> n - 32 | t << 64 - n;
function k(e, t, n, o) {
  const r = (t >>> 0) + (o >>> 0);
  return { h: e + n + (r / 2 ** 32 | 0) | 0, l: r | 0 };
}
const Xe = (e, t, n) => (e >>> 0) + (t >>> 0) + (n >>> 0), We = (e, t, n, o) => t + n + o + (e / 2 ** 32 | 0) | 0, Pe = (e, t, n, o) => (e >>> 0) + (t >>> 0) + (n >>> 0) + (o >>> 0), Fe = (e, t, n, o, r) => t + n + o + r + (e / 2 ** 32 | 0) | 0, Qe = (e, t, n, o, r) => (e >>> 0) + (t >>> 0) + (n >>> 0) + (o >>> 0) + (r >>> 0), Je = (e, t, n, o, r, s) => t + n + o + r + s + (e / 2 ** 32 | 0) | 0, ie = ze([
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
].map((e) => BigInt(e))), tn = ie[0], en = ie[1], K = /* @__PURE__ */ new Uint32Array(80), Y = /* @__PURE__ */ new Uint32Array(80);
class nn extends Ke {
  constructor(t) {
    super(128, t, 16, !1);
  }
  // prettier-ignore
  get() {
    const { Ah: t, Al: n, Bh: o, Bl: r, Ch: s, Cl: c, Dh: u, Dl: i, Eh: x, El: m, Fh: w, Fl: v, Gh: I, Gl: S, Hh: O, Hl: _ } = this;
    return [t, n, o, r, s, c, u, i, x, m, w, v, I, S, O, _];
  }
  // prettier-ignore
  set(t, n, o, r, s, c, u, i, x, m, w, v, I, S, O, _) {
    this.Ah = t | 0, this.Al = n | 0, this.Bh = o | 0, this.Bl = r | 0, this.Ch = s | 0, this.Cl = c | 0, this.Dh = u | 0, this.Dl = i | 0, this.Eh = x | 0, this.El = m | 0, this.Fh = w | 0, this.Fl = v | 0, this.Gh = I | 0, this.Gl = S | 0, this.Hh = O | 0, this.Hl = _ | 0;
  }
  process(t, n) {
    for (let p = 0; p < 16; p++, n += 4)
      K[p] = t.getUint32(n), Y[p] = t.getUint32(n += 4);
    for (let p = 16; p < 80; p++) {
      const N = K[p - 15] | 0, T = Y[p - 15] | 0, a = J(N, T, 1) ^ J(N, T, 8) ^ $t(N, T, 7), h = tt(N, T, 1) ^ tt(N, T, 8) ^ Zt(N, T, 7), f = K[p - 2] | 0, l = Y[p - 2] | 0, d = J(f, l, 19) ^ ot(f, l, 61) ^ $t(f, l, 6), b = tt(f, l, 19) ^ st(f, l, 61) ^ Zt(f, l, 6), g = Pe(h, b, Y[p - 7], Y[p - 16]), y = Fe(g, a, d, K[p - 7], K[p - 16]);
      K[p] = y | 0, Y[p] = g | 0;
    }
    let { Ah: o, Al: r, Bh: s, Bl: c, Ch: u, Cl: i, Dh: x, Dl: m, Eh: w, El: v, Fh: I, Fl: S, Gh: O, Gl: _, Hh: E, Hl: A } = this;
    for (let p = 0; p < 80; p++) {
      const N = J(w, v, 14) ^ J(w, v, 18) ^ ot(w, v, 41), T = tt(w, v, 14) ^ tt(w, v, 18) ^ st(w, v, 41), a = w & I ^ ~w & O, h = v & S ^ ~v & _, f = Qe(A, T, h, en[p], Y[p]), l = Je(f, E, N, a, tn[p], K[p]), d = f | 0, b = J(o, r, 28) ^ ot(o, r, 34) ^ ot(o, r, 39), g = tt(o, r, 28) ^ st(o, r, 34) ^ st(o, r, 39), y = o & s ^ o & u ^ s & u, B = r & c ^ r & i ^ c & i;
      E = O | 0, A = _ | 0, O = I | 0, _ = S | 0, I = w | 0, S = v | 0, { h: w, l: v } = k(x | 0, m | 0, l | 0, d | 0), x = u | 0, m = i | 0, u = s | 0, i = c | 0, s = o | 0, c = r | 0;
      const R = Xe(d, g, B);
      o = We(R, l, b, y), r = R | 0;
    }
    ({ h: o, l: r } = k(this.Ah | 0, this.Al | 0, o | 0, r | 0)), { h: s, l: c } = k(this.Bh | 0, this.Bl | 0, s | 0, c | 0), { h: u, l: i } = k(this.Ch | 0, this.Cl | 0, u | 0, i | 0), { h: x, l: m } = k(this.Dh | 0, this.Dl | 0, x | 0, m | 0), { h: w, l: v } = k(this.Eh | 0, this.El | 0, w | 0, v | 0), { h: I, l: S } = k(this.Fh | 0, this.Fl | 0, I | 0, S | 0), { h: O, l: _ } = k(this.Gh | 0, this.Gl | 0, O | 0, _ | 0), { h: E, l: A } = k(this.Hh | 0, this.Hl | 0, E | 0, A | 0), this.set(o, r, s, c, u, i, x, m, w, v, I, S, O, _, E, A);
  }
  roundClean() {
    mt(K, Y);
  }
  destroy() {
    mt(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class rn extends nn {
  Ah = M[0] | 0;
  Al = M[1] | 0;
  Bh = M[2] | 0;
  Bl = M[3] | 0;
  Ch = M[4] | 0;
  Cl = M[5] | 0;
  Dh = M[6] | 0;
  Dl = M[7] | 0;
  Eh = M[8] | 0;
  El = M[9] | 0;
  Fh = M[10] | 0;
  Fl = M[11] | 0;
  Gh = M[12] | 0;
  Gl = M[13] | 0;
  Hh = M[14] | 0;
  Hl = M[15] | 0;
  constructor() {
    super(64);
  }
}
const on = /* @__PURE__ */ je(
  () => new rn(),
  /* @__PURE__ */ ke(3)
);
const ce = /* @__PURE__ */ BigInt(0), jt = /* @__PURE__ */ BigInt(1);
function Et(e, t = "") {
  if (typeof e != "boolean") {
    const n = t && `"${t}" `;
    throw new Error(n + "expected boolean, got type=" + typeof e);
  }
  return e;
}
function sn(e) {
  if (typeof e == "bigint") {
    if (!ct(e))
      throw new Error("positive bigint expected, got " + e);
  } else
    Rt(e);
  return e;
}
function fe(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  return e === "" ? ce : BigInt("0x" + e);
}
function cn(e) {
  return fe(It(e));
}
function ft(e) {
  return fe(It(Bt(D(e)).reverse()));
}
function ae(e, t) {
  Rt(t), e = sn(e);
  const n = se(e.toString(16).padStart(t * 2, "0"));
  if (n.length !== t)
    throw new Error("number too large");
  return n;
}
function fn(e, t) {
  return ae(e, t).reverse();
}
function Bt(e) {
  return Uint8Array.from(e);
}
const ct = (e) => typeof e == "bigint" && ce <= e;
function an(e, t, n) {
  return ct(e) && ct(t) && ct(n) && t <= e && e < n;
}
function Vt(e, t, n, o) {
  if (!an(t, n, o))
    throw new Error("expected valid " + e + ": " + n + " <= n < " + o + ", got " + t);
}
const un = (e) => (jt << BigInt(e)) - jt;
function _t(e, t = {}, n = {}) {
  if (!e || typeof e != "object")
    throw new Error("expected valid options object");
  function o(s, c, u) {
    const i = e[s];
    if (u && i === void 0)
      return;
    const x = typeof i;
    if (x !== c || i === null)
      throw new Error(`param "${s}" is invalid: expected ${c}, got ${x}`);
  }
  const r = (s, c) => Object.entries(s).forEach(([u, i]) => o(u, i, c));
  r(t, !1), r(n, !0);
}
function kt(e) {
  const t = /* @__PURE__ */ new WeakMap();
  return (n, ...o) => {
    const r = t.get(n);
    if (r !== void 0)
      return r;
    const s = e(n, ...o);
    return t.set(n, s), s;
  };
}
const $ = /* @__PURE__ */ BigInt(0), G = /* @__PURE__ */ BigInt(1), F = /* @__PURE__ */ BigInt(2), ue = /* @__PURE__ */ BigInt(3), he = /* @__PURE__ */ BigInt(4), le = /* @__PURE__ */ BigInt(5), hn = /* @__PURE__ */ BigInt(7), de = /* @__PURE__ */ BigInt(8), ln = /* @__PURE__ */ BigInt(9), be = /* @__PURE__ */ BigInt(16);
function H(e, t) {
  const n = e % t;
  return n >= $ ? n : t + n;
}
function Z(e, t, n) {
  let o = e;
  for (; t-- > $; )
    o *= o, o %= n;
  return o;
}
function Kt(e, t) {
  if (e === $)
    throw new Error("invert: expected non-zero number");
  if (t <= $)
    throw new Error("invert: expected positive modulus, got " + t);
  let n = H(e, t), o = t, r = $, s = G;
  for (; n !== $; ) {
    const u = o / n, i = o % n, x = r - s * u;
    o = n, n = i, r = s, s = x;
  }
  if (o !== G)
    throw new Error("invert: does not exist");
  return H(r, t);
}
function Nt(e, t, n) {
  if (!e.eql(e.sqr(t), n))
    throw new Error("Cannot find square root");
}
function ge(e, t) {
  const n = (e.ORDER + G) / he, o = e.pow(t, n);
  return Nt(e, o, t), o;
}
function dn(e, t) {
  const n = (e.ORDER - le) / de, o = e.mul(t, F), r = e.pow(o, n), s = e.mul(t, r), c = e.mul(e.mul(s, F), r), u = e.mul(s, e.sub(c, e.ONE));
  return Nt(e, u, t), u;
}
function bn(e) {
  const t = Ot(e), n = we(e), o = n(t, t.neg(t.ONE)), r = n(t, o), s = n(t, t.neg(o)), c = (e + hn) / be;
  return (u, i) => {
    let x = u.pow(i, c), m = u.mul(x, o);
    const w = u.mul(x, r), v = u.mul(x, s), I = u.eql(u.sqr(m), i), S = u.eql(u.sqr(w), i);
    x = u.cmov(x, m, I), m = u.cmov(v, w, S);
    const O = u.eql(u.sqr(m), i), _ = u.cmov(x, m, O);
    return Nt(u, _, i), _;
  };
}
function we(e) {
  if (e < ue)
    throw new Error("sqrt is not defined for small field");
  let t = e - G, n = 0;
  for (; t % F === $; )
    t /= F, n++;
  let o = F;
  const r = Ot(e);
  for (; Yt(r, o) === 1; )
    if (o++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (n === 1)
    return ge;
  let s = r.pow(o, t);
  const c = (t + G) / F;
  return function(i, x) {
    if (i.is0(x))
      return x;
    if (Yt(i, x) !== 1)
      throw new Error("Cannot find square root");
    let m = n, w = i.mul(i.ONE, s), v = i.pow(x, t), I = i.pow(x, c);
    for (; !i.eql(v, i.ONE); ) {
      if (i.is0(v))
        return i.ZERO;
      let S = 1, O = i.sqr(v);
      for (; !i.eql(O, i.ONE); )
        if (S++, O = i.sqr(O), S === m)
          throw new Error("Cannot find square root");
      const _ = G << BigInt(m - S - 1), E = i.pow(w, _);
      m = S, w = i.sqr(E), v = i.mul(v, w), I = i.mul(I, E);
    }
    return I;
  };
}
function gn(e) {
  return e % he === ue ? ge : e % de === le ? dn : e % be === ln ? bn(e) : we(e);
}
const wn = (e, t) => (H(e, t) & G) === G, xn = [
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
function pn(e) {
  const t = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  }, n = xn.reduce((o, r) => (o[r] = "function", o), t);
  return _t(e, n), e;
}
function yn(e, t, n) {
  if (n < $)
    throw new Error("invalid exponent, negatives unsupported");
  if (n === $)
    return e.ONE;
  if (n === G)
    return t;
  let o = e.ONE, r = t;
  for (; n > $; )
    n & G && (o = e.mul(o, r)), r = e.sqr(r), n >>= G;
  return o;
}
function xe(e, t, n = !1) {
  const o = new Array(t.length).fill(n ? e.ZERO : void 0), r = t.reduce((c, u, i) => e.is0(u) ? c : (o[i] = c, e.mul(c, u)), e.ONE), s = e.inv(r);
  return t.reduceRight((c, u, i) => e.is0(u) ? c : (o[i] = e.mul(c, o[i]), e.mul(c, u)), s), o;
}
function Yt(e, t) {
  const n = (e.ORDER - G) / F, o = e.pow(t, n), r = e.eql(o, e.ONE), s = e.eql(o, e.ZERO), c = e.eql(o, e.neg(e.ONE));
  if (!r && !s && !c)
    throw new Error("invalid Legendre symbol result");
  return r ? 1 : s ? 0 : -1;
}
function mn(e, t) {
  t !== void 0 && Rt(t);
  const n = t !== void 0 ? t : e.toString(2).length, o = Math.ceil(n / 8);
  return { nBitLength: n, nByteLength: o };
}
class En {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = $;
  ONE = G;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(t, n = {}) {
    if (t <= $)
      throw new Error("invalid field: expected ORDER > 0, got " + t);
    let o;
    this.isLE = !1, n != null && typeof n == "object" && (typeof n.BITS == "number" && (o = n.BITS), typeof n.sqrt == "function" && (this.sqrt = n.sqrt), typeof n.isLE == "boolean" && (this.isLE = n.isLE), n.allowedLengths && (this._lengths = n.allowedLengths?.slice()), typeof n.modFromBytes == "boolean" && (this._mod = n.modFromBytes));
    const { nBitLength: r, nByteLength: s } = mn(t, o);
    if (s > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = t, this.BITS = r, this.BYTES = s, this._sqrt = void 0, Object.preventExtensions(this);
  }
  create(t) {
    return H(t, this.ORDER);
  }
  isValid(t) {
    if (typeof t != "bigint")
      throw new Error("invalid field element: expected bigint, got " + typeof t);
    return $ <= t && t < this.ORDER;
  }
  is0(t) {
    return t === $;
  }
  // is valid and invertible
  isValidNot0(t) {
    return !this.is0(t) && this.isValid(t);
  }
  isOdd(t) {
    return (t & G) === G;
  }
  neg(t) {
    return H(-t, this.ORDER);
  }
  eql(t, n) {
    return t === n;
  }
  sqr(t) {
    return H(t * t, this.ORDER);
  }
  add(t, n) {
    return H(t + n, this.ORDER);
  }
  sub(t, n) {
    return H(t - n, this.ORDER);
  }
  mul(t, n) {
    return H(t * n, this.ORDER);
  }
  pow(t, n) {
    return yn(this, t, n);
  }
  div(t, n) {
    return H(t * Kt(n, this.ORDER), this.ORDER);
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
    return Kt(t, this.ORDER);
  }
  sqrt(t) {
    return this._sqrt || (this._sqrt = gn(this.ORDER)), this._sqrt(this, t);
  }
  toBytes(t) {
    return this.isLE ? fn(t, this.BYTES) : ae(t, this.BYTES);
  }
  fromBytes(t, n = !1) {
    D(t);
    const { _lengths: o, BYTES: r, isLE: s, ORDER: c, _mod: u } = this;
    if (o) {
      if (!o.includes(t.length) || t.length > r)
        throw new Error("Field.fromBytes: expected " + o + " bytes, got " + t.length);
      const x = new Uint8Array(r);
      x.set(t, s ? 0 : x.length - t.length), t = x;
    }
    if (t.length !== r)
      throw new Error("Field.fromBytes: expected " + r + " bytes, got " + t.length);
    let i = s ? ft(t) : cn(t);
    if (u && (i = H(i, c)), !n && !this.isValid(i))
      throw new Error("invalid field element: outside of range 0..ORDER");
    return i;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(t) {
    return xe(this, t);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(t, n, o) {
    return o ? n : t;
  }
}
function Ot(e, t = {}) {
  return new En(e, t);
}
const at = /* @__PURE__ */ BigInt(0), vt = /* @__PURE__ */ BigInt(1);
function zt(e, t) {
  const n = t.negate();
  return e ? n : t;
}
function dt(e, t) {
  const n = xe(e.Fp, t.map((o) => o.Z));
  return t.map((o, r) => e.fromAffine(o.toAffine(n[r])));
}
function pe(e, t) {
  if (!Number.isSafeInteger(e) || e <= 0 || e > t)
    throw new Error("invalid window size, expected [1.." + t + "], got W=" + e);
}
function bt(e, t) {
  pe(e, t);
  const n = Math.ceil(t / e) + 1, o = 2 ** (e - 1), r = 2 ** e, s = un(e), c = BigInt(e);
  return { windows: n, windowSize: o, mask: s, maxNumber: r, shiftBy: c };
}
function Xt(e, t, n) {
  const { windowSize: o, mask: r, maxNumber: s, shiftBy: c } = n;
  let u = Number(e & r), i = e >> c;
  u > o && (u -= s, i += vt);
  const x = t * o, m = x + Math.abs(u) - 1, w = u === 0, v = u < 0, I = t % 2 !== 0;
  return { nextN: i, offset: m, isZero: w, isNeg: v, isNegF: I, offsetF: x };
}
const gt = /* @__PURE__ */ new WeakMap(), ye = /* @__PURE__ */ new WeakMap();
function wt(e) {
  return ye.get(e) || 1;
}
function Wt(e) {
  if (e !== at)
    throw new Error("invalid wNAF");
}
class Bn {
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
    let r = t;
    for (; n > at; )
      n & vt && (o = o.add(r)), r = r.double(), n >>= vt;
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
    const { windows: o, windowSize: r } = bt(n, this.bits), s = [];
    let c = t, u = c;
    for (let i = 0; i < o; i++) {
      u = c, s.push(u);
      for (let x = 1; x < r; x++)
        u = u.add(c), s.push(u);
      c = u.double();
    }
    return s;
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
    let r = this.ZERO, s = this.BASE;
    const c = bt(t, this.bits);
    for (let u = 0; u < c.windows; u++) {
      const { nextN: i, offset: x, isZero: m, isNeg: w, isNegF: v, offsetF: I } = Xt(o, u, c);
      o = i, m ? s = s.add(zt(v, n[I])) : r = r.add(zt(w, n[x]));
    }
    return Wt(o), { p: r, f: s };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(t, n, o, r = this.ZERO) {
    const s = bt(t, this.bits);
    for (let c = 0; c < s.windows && o !== at; c++) {
      const { nextN: u, offset: i, isZero: x, isNeg: m } = Xt(o, c, s);
      if (o = u, !x) {
        const w = n[i];
        r = r.add(m ? w.negate() : w);
      }
    }
    return Wt(o), r;
  }
  getPrecomputes(t, n, o) {
    let r = gt.get(n);
    return r || (r = this.precomputeWindow(n, t), t !== 1 && (typeof o == "function" && (r = o(r)), gt.set(n, r))), r;
  }
  cached(t, n, o) {
    const r = wt(t);
    return this.wNAF(r, this.getPrecomputes(r, t, o), n);
  }
  unsafe(t, n, o, r) {
    const s = wt(t);
    return s === 1 ? this._unsafeLadder(t, n, r) : this.wNAFUnsafe(s, this.getPrecomputes(s, t, o), n, r);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(t, n) {
    pe(n, this.bits), ye.set(t, n), gt.delete(t);
  }
  hasCache(t) {
    return wt(t) !== 1;
  }
}
function Pt(e, t, n) {
  if (t) {
    if (t.ORDER !== e)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return pn(t), t;
  } else
    return Ot(e, { isLE: n });
}
function vn(e, t, n = {}, o) {
  if (o === void 0 && (o = e === "edwards"), !t || typeof t != "object")
    throw new Error(`expected valid ${e} CURVE object`);
  for (const i of ["p", "n", "h"]) {
    const x = t[i];
    if (!(typeof x == "bigint" && x > at))
      throw new Error(`CURVE.${i} must be positive bigint`);
  }
  const r = Pt(t.p, n.Fp, o), s = Pt(t.n, n.Fn, o), u = ["Gx", "Gy", "a", "d"];
  for (const i of u)
    if (!r.isValid(t[i]))
      throw new Error(`CURVE.${i} must be valid field element of CURVE.Fp`);
  return t = Object.freeze(Object.assign({}, t)), { CURVE: t, Fp: r, Fn: s };
}
function Sn(e, t) {
  return function(o) {
    const r = e(o);
    return { secretKey: r, publicKey: t(r) };
  };
}
const z = BigInt(0), U = BigInt(1), xt = BigInt(2), An = BigInt(8);
function Rn(e, t, n, o) {
  const r = e.sqr(n), s = e.sqr(o), c = e.add(e.mul(t.a, r), s), u = e.add(e.ONE, e.mul(t.d, e.mul(r, s)));
  return e.eql(c, u);
}
function In(e, t = {}) {
  const n = vn("edwards", e, t, t.FpFnLE), { Fp: o, Fn: r } = n;
  let s = n.CURVE;
  const { h: c } = s;
  _t(t, {}, { uvRatio: "function" });
  const u = xt << BigInt(r.BYTES * 8) - U, i = (_) => o.create(_), x = t.uvRatio || ((_, E) => {
    try {
      return { isValid: !0, value: o.sqrt(o.div(_, E)) };
    } catch {
      return { isValid: !1, value: z };
    }
  });
  if (!Rn(o, s, s.Gx, s.Gy))
    throw new Error("bad curve params: generator point");
  function m(_, E, A = !1) {
    const p = A ? U : z;
    return Vt("coordinate " + _, E, p, u), E;
  }
  function w(_) {
    if (!(_ instanceof S))
      throw new Error("EdwardsPoint expected");
  }
  const v = kt((_, E) => {
    const { X: A, Y: p, Z: N } = _, T = _.is0();
    E == null && (E = T ? An : o.inv(N));
    const a = i(A * E), h = i(p * E), f = o.mul(N, E);
    if (T)
      return { x: z, y: U };
    if (f !== U)
      throw new Error("invZ was invalid");
    return { x: a, y: h };
  }), I = kt((_) => {
    const { a: E, d: A } = s;
    if (_.is0())
      throw new Error("bad point: ZERO");
    const { X: p, Y: N, Z: T, T: a } = _, h = i(p * p), f = i(N * N), l = i(T * T), d = i(l * l), b = i(h * E), g = i(l * i(b + f)), y = i(d + i(A * i(h * f)));
    if (g !== y)
      throw new Error("bad point: equation left != right (1)");
    const B = i(p * N), R = i(T * a);
    if (B !== R)
      throw new Error("bad point: equation left != right (2)");
    return !0;
  });
  class S {
    // base / generator point
    static BASE = new S(s.Gx, s.Gy, U, i(s.Gx * s.Gy));
    // zero / infinity / identity point
    static ZERO = new S(z, U, U, z);
    // 0, 1, 1, 0
    // math field
    static Fp = o;
    // scalar field
    static Fn = r;
    X;
    Y;
    Z;
    T;
    constructor(E, A, p, N) {
      this.X = m("x", E), this.Y = m("y", A), this.Z = m("z", p, !0), this.T = m("t", N), Object.freeze(this);
    }
    static CURVE() {
      return s;
    }
    static fromAffine(E) {
      if (E instanceof S)
        throw new Error("extended point not allowed");
      const { x: A, y: p } = E || {};
      return m("x", A), m("y", p), new S(A, p, U, i(A * p));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(E, A = !1) {
      const p = o.BYTES, { a: N, d: T } = s;
      E = Bt(D(E, p, "point")), Et(A, "zip215");
      const a = Bt(E), h = E[p - 1];
      a[p - 1] = h & -129;
      const f = ft(a), l = A ? u : o.ORDER;
      Vt("point.y", f, z, l);
      const d = i(f * f), b = i(d - U), g = i(T * d - N);
      let { isValid: y, value: B } = x(b, g);
      if (!y)
        throw new Error("bad point: invalid y coordinate");
      const R = (B & U) === U, C = (h & 128) !== 0;
      if (!A && B === z && C)
        throw new Error("bad point: x=0 and x_0=1");
      return C !== R && (B = i(-B)), S.fromAffine({ x: B, y: f });
    }
    static fromHex(E, A = !1) {
      return S.fromBytes(se(E), A);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(E = 8, A = !0) {
      return O.createCache(this, E), A || this.multiply(xt), this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      I(this);
    }
    // Compare one point to another.
    equals(E) {
      w(E);
      const { X: A, Y: p, Z: N } = this, { X: T, Y: a, Z: h } = E, f = i(A * h), l = i(T * N), d = i(p * h), b = i(a * N);
      return f === l && d === b;
    }
    is0() {
      return this.equals(S.ZERO);
    }
    negate() {
      return new S(i(-this.X), this.Y, this.Z, i(-this.T));
    }
    // Fast algo for doubling Extended Point.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
    // Cost: 4M + 4S + 1*a + 6add + 1*2.
    double() {
      const { a: E } = s, { X: A, Y: p, Z: N } = this, T = i(A * A), a = i(p * p), h = i(xt * i(N * N)), f = i(E * T), l = A + p, d = i(i(l * l) - T - a), b = f + a, g = b - h, y = f - a, B = i(d * g), R = i(b * y), C = i(d * y), L = i(g * b);
      return new S(B, R, L, C);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(E) {
      w(E);
      const { a: A, d: p } = s, { X: N, Y: T, Z: a, T: h } = this, { X: f, Y: l, Z: d, T: b } = E, g = i(N * f), y = i(T * l), B = i(h * p * b), R = i(a * d), C = i((N + T) * (f + l) - g - y), L = R - B, q = R + B, Q = i(y - A * g), nt = i(C * L), ut = i(q * Q), Lt = i(C * Q), Ht = i(L * q);
      return new S(nt, ut, Ht, Lt);
    }
    subtract(E) {
      return this.add(E.negate());
    }
    // Constant-time multiplication.
    multiply(E) {
      if (!r.isValidNot0(E))
        throw new Error("invalid scalar: expected 1 <= sc < curve.n");
      const { p: A, f: p } = O.cached(this, E, (N) => dt(S, N));
      return dt(S, [A, p])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Does NOT allow scalars higher than CURVE.n.
    // Accepts optional accumulator to merge with multiply (important for sparse scalars)
    multiplyUnsafe(E, A = S.ZERO) {
      if (!r.isValid(E))
        throw new Error("invalid scalar: expected 0 <= sc < curve.n");
      return E === z ? S.ZERO : this.is0() || E === U ? this : O.unsafe(this, E, (p) => dt(S, p), A);
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
      return O.unsafe(this, s.n).is0();
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    toAffine(E) {
      return v(this, E);
    }
    clearCofactor() {
      return c === U ? this : this.multiplyUnsafe(c);
    }
    toBytes() {
      const { x: E, y: A } = this.toAffine(), p = o.toBytes(A);
      return p[p.length - 1] |= E & U ? 128 : 0, p;
    }
    toHex() {
      return It(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const O = new Bn(S, r.BITS);
  return S.BASE.precompute(8), S;
}
function _n(e, t, n = {}) {
  if (typeof t != "function")
    throw new Error('"hash" function param is required');
  _t(n, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    mapToCurve: "function"
  });
  const { prehash: o } = n, { BASE: r, Fp: s, Fn: c } = e, u = n.randomBytes || Ve, i = n.adjustScalarBytes || ((f) => f), x = n.domain || ((f, l, d) => {
    if (Et(d, "phflag"), l.length || d)
      throw new Error("Contexts/pre-hash are not supported");
    return f;
  });
  function m(f) {
    return c.create(ft(f));
  }
  function w(f) {
    const l = p.secretKey;
    D(f, p.secretKey, "secretKey");
    const d = D(t(f), 2 * l, "hashedSecretKey"), b = i(d.slice(0, l)), g = d.slice(l, 2 * l), y = m(b);
    return { head: b, prefix: g, scalar: y };
  }
  function v(f) {
    const { head: l, prefix: d, scalar: b } = w(f), g = r.multiply(b), y = g.toBytes();
    return { head: l, prefix: d, scalar: b, point: g, pointBytes: y };
  }
  function I(f) {
    return v(f).pointBytes;
  }
  function S(f = Uint8Array.of(), ...l) {
    const d = Mt(...l);
    return m(t(x(d, D(f, void 0, "context"), !!o)));
  }
  function O(f, l, d = {}) {
    f = D(f, void 0, "message"), o && (f = o(f));
    const { prefix: b, scalar: g, pointBytes: y } = v(l), B = S(d.context, b, f), R = r.multiply(B).toBytes(), C = S(d.context, R, y, f), L = c.create(B + C * g);
    if (!c.isValid(L))
      throw new Error("sign failed: invalid s");
    const q = Mt(R, c.toBytes(L));
    return D(q, p.signature, "result");
  }
  const _ = { zip215: !0 };
  function E(f, l, d, b = _) {
    const { context: g, zip215: y } = b, B = p.signature;
    f = D(f, B, "signature"), l = D(l, void 0, "message"), d = D(d, p.publicKey, "publicKey"), y !== void 0 && Et(y, "zip215"), o && (l = o(l));
    const R = B / 2, C = f.subarray(0, R), L = ft(f.subarray(R, B));
    let q, Q, nt;
    try {
      q = e.fromBytes(d, y), Q = e.fromBytes(C, y), nt = r.multiplyUnsafe(L);
    } catch {
      return !1;
    }
    if (!y && q.isSmallOrder())
      return !1;
    const ut = S(g, Q.toBytes(), q.toBytes(), l);
    return Q.add(q.multiplyUnsafe(ut)).subtract(nt).clearCofactor().is0();
  }
  const A = s.BYTES, p = {
    secretKey: A,
    publicKey: A,
    signature: 2 * A,
    seed: A
  };
  function N(f = u(p.seed)) {
    return D(f, p.seed, "seed");
  }
  function T(f) {
    return re(f) && f.length === c.BYTES;
  }
  function a(f, l) {
    try {
      return !!e.fromBytes(f, l);
    } catch {
      return !1;
    }
  }
  const h = {
    getExtendedPublicKey: v,
    randomSecretKey: N,
    isValidSecretKey: T,
    isValidPublicKey: a,
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
      const { y: l } = e.fromBytes(f), d = p.publicKey, b = d === 32;
      if (!b && d !== 57)
        throw new Error("only defined for 25519 and 448");
      const g = b ? s.div(U + l, U - l) : s.div(l - U, l + U);
      return s.toBytes(g);
    },
    toMontgomerySecret(f) {
      const l = p.secretKey;
      D(f, l);
      const d = t(f.subarray(0, l));
      return i(d).subarray(0, l);
    }
  };
  return Object.freeze({
    keygen: Sn(N, I),
    getPublicKey: I,
    sign: O,
    verify: E,
    utils: h,
    Point: e,
    lengths: p
  });
}
const Nn = BigInt(1), Ft = BigInt(2), On = BigInt(5), Tn = BigInt(8), Tt = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed"), Cn = {
  p: Tt,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: Tn,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
};
function Ln(e) {
  const t = BigInt(10), n = BigInt(20), o = BigInt(40), r = BigInt(80), s = Tt, u = e * e % s * e % s, i = Z(u, Ft, s) * u % s, x = Z(i, Nn, s) * e % s, m = Z(x, On, s) * x % s, w = Z(m, t, s) * m % s, v = Z(w, n, s) * w % s, I = Z(v, o, s) * v % s, S = Z(I, r, s) * I % s, O = Z(S, r, s) * I % s, _ = Z(O, t, s) * m % s;
  return { pow_p_5_8: Z(_, Ft, s) * e % s, b2: u };
}
function Hn(e) {
  return e[0] &= 248, e[31] &= 127, e[31] |= 64, e;
}
const Qt = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function Un(e, t) {
  const n = Tt, o = H(t * t * t, n), r = H(o * o * t, n), s = Ln(e * r).pow_p_5_8;
  let c = H(e * o * s, n);
  const u = H(t * c * c, n), i = c, x = H(c * Qt, n), m = u === e, w = u === H(-e, n), v = u === H(-e * Qt, n);
  return m && (c = i), (w || v) && (c = x), wn(c, n) && (c = H(-c, n)), { isValid: m || w, value: c };
}
const Dn = /* @__PURE__ */ In(Cn, { uvRatio: Un });
function qn(e) {
  return _n(Dn, on, Object.assign({ adjustScalarBytes: Hn }, e));
}
const Mn = /* @__PURE__ */ qn({});
function Gn(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Ct(e, ...t) {
  if (!Gn(e))
    throw new Error("Uint8Array expected");
  if (t.length > 0 && !t.includes(e.length))
    throw new Error("Uint8Array expected of length " + t + ", got length=" + e.length);
}
function Jt(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function $n(e, t) {
  Ct(e);
  const n = t.outputLen;
  if (e.length < n)
    throw new Error("digestInto() expects output buffer of length at least " + n);
}
function St(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function pt(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function j(e, t) {
  return e << 32 - t | e >>> t;
}
function Zn(e) {
  if (typeof e != "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(e));
}
function me(e) {
  return typeof e == "string" && (e = Zn(e)), Ct(e), e;
}
class jn {
}
function Vn(e) {
  const t = (o) => e().update(me(o)).digest(), n = e();
  return t.outputLen = n.outputLen, t.blockLen = n.blockLen, t.create = () => e(), t;
}
function kn(e, t, n, o) {
  if (typeof e.setBigUint64 == "function")
    return e.setBigUint64(t, n, o);
  const r = BigInt(32), s = BigInt(4294967295), c = Number(n >> r & s), u = Number(n & s), i = o ? 4 : 0, x = o ? 0 : 4;
  e.setUint32(t + i, c, o), e.setUint32(t + x, u, o);
}
function Kn(e, t, n) {
  return e & t ^ ~e & n;
}
function Yn(e, t, n) {
  return e & t ^ e & n ^ t & n;
}
class zn extends jn {
  constructor(t, n, o, r) {
    super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = t, this.outputLen = n, this.padOffset = o, this.isLE = r, this.buffer = new Uint8Array(t), this.view = pt(this.buffer);
  }
  update(t) {
    Jt(this), t = me(t), Ct(t);
    const { view: n, buffer: o, blockLen: r } = this, s = t.length;
    for (let c = 0; c < s; ) {
      const u = Math.min(r - this.pos, s - c);
      if (u === r) {
        const i = pt(t);
        for (; r <= s - c; c += r)
          this.process(i, c);
        continue;
      }
      o.set(t.subarray(c, c + u), this.pos), this.pos += u, c += u, this.pos === r && (this.process(n, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    Jt(this), $n(t, this), this.finished = !0;
    const { buffer: n, view: o, blockLen: r, isLE: s } = this;
    let { pos: c } = this;
    n[c++] = 128, St(this.buffer.subarray(c)), this.padOffset > r - c && (this.process(o, 0), c = 0);
    for (let w = c; w < r; w++)
      n[w] = 0;
    kn(o, r - 8, BigInt(this.length * 8), s), this.process(o, 0);
    const u = pt(t), i = this.outputLen;
    if (i % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const x = i / 4, m = this.get();
    if (x > m.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let w = 0; w < x; w++)
      u.setUint32(4 * w, m[w], s);
  }
  digest() {
    const { buffer: t, outputLen: n } = this;
    this.digestInto(t);
    const o = t.slice(0, n);
    return this.destroy(), o;
  }
  _cloneInto(t) {
    t || (t = new this.constructor()), t.set(...this.get());
    const { blockLen: n, buffer: o, length: r, finished: s, destroyed: c, pos: u } = this;
    return t.destroyed = c, t.finished = s, t.length = r, t.pos = u, r % n && t.buffer.set(o), t;
  }
  clone() {
    return this._cloneInto();
  }
}
const X = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), Xn = /* @__PURE__ */ Uint32Array.from([
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
]), W = /* @__PURE__ */ new Uint32Array(64);
class Wn extends zn {
  constructor(t = 32) {
    super(64, t, 8, !1), this.A = X[0] | 0, this.B = X[1] | 0, this.C = X[2] | 0, this.D = X[3] | 0, this.E = X[4] | 0, this.F = X[5] | 0, this.G = X[6] | 0, this.H = X[7] | 0;
  }
  get() {
    const { A: t, B: n, C: o, D: r, E: s, F: c, G: u, H: i } = this;
    return [t, n, o, r, s, c, u, i];
  }
  // prettier-ignore
  set(t, n, o, r, s, c, u, i) {
    this.A = t | 0, this.B = n | 0, this.C = o | 0, this.D = r | 0, this.E = s | 0, this.F = c | 0, this.G = u | 0, this.H = i | 0;
  }
  process(t, n) {
    for (let w = 0; w < 16; w++, n += 4)
      W[w] = t.getUint32(n, !1);
    for (let w = 16; w < 64; w++) {
      const v = W[w - 15], I = W[w - 2], S = j(v, 7) ^ j(v, 18) ^ v >>> 3, O = j(I, 17) ^ j(I, 19) ^ I >>> 10;
      W[w] = O + W[w - 7] + S + W[w - 16] | 0;
    }
    let { A: o, B: r, C: s, D: c, E: u, F: i, G: x, H: m } = this;
    for (let w = 0; w < 64; w++) {
      const v = j(u, 6) ^ j(u, 11) ^ j(u, 25), I = m + v + Kn(u, i, x) + Xn[w] + W[w] | 0, O = (j(o, 2) ^ j(o, 13) ^ j(o, 22)) + Yn(o, r, s) | 0;
      m = x, x = i, i = u, u = c + I | 0, c = s, s = r, r = o, o = I + O | 0;
    }
    o = o + this.A | 0, r = r + this.B | 0, s = s + this.C | 0, c = c + this.D | 0, u = u + this.E | 0, i = i + this.F | 0, x = x + this.G | 0, m = m + this.H | 0, this.set(o, r, s, c, u, i, x, m);
  }
  roundClean() {
    St(W);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), St(this.buffer);
  }
}
const Pn = /* @__PURE__ */ Vn(() => new Wn()), Fn = Pn, Qn = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function Jn(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = Fn(e), n = Mn.getPublicKey(t), o = new Uint8Array(64);
  return o.set(t, 0), o.set(n, 32), ee(t), { publicKey: n, secretKey: o };
}
function cr(e) {
  const t = Jn(e), n = t.publicKey;
  return ee(t.secretKey), n;
}
function fr(e) {
  if (e.length !== 32)
    throw new Error(`Invalid public key length: expected 32, got ${e.length}`);
  return tr(e);
}
function tr(e) {
  let t = 0;
  for (let r = 0; r < e.length && e[r] === 0; r++)
    t++;
  let n = 0n;
  for (let r = 0; r < e.length; r++)
    n = n * 256n + BigInt(e[r]);
  let o = "";
  for (; n > 0n; ) {
    const r = Number(n % 58n);
    o = Qn[r] + o, n = n / 58n;
  }
  return "1".repeat(t) + o;
}
const er = 2, nr = 3;
function ar(e) {
  if (e.length !== 16)
    throw new Error(`Invalid seed length: expected 16, got ${e.length}`);
  const t = At(e), n = ne.share(t, nr, er);
  if (n.length !== 3)
    throw new Error(`Unexpected share count: ${n.length}`);
  const o = yt(n[0]), r = yt(n[1]), s = yt(n[2]);
  return {
    shareA: ht(o),
    shareB: ht(r),
    shareC: ht(s)
  };
}
function ur(e, t, n) {
  const o = te(e), r = te(t);
  try {
    const s = ne.combine([o, r]), c = Ee(s);
    if (c.length !== 16)
      throw new Error(`Reconstructed seed has wrong length: ${c.length}`);
    return Ae(c);
  } catch (s) {
    throw s instanceof Error && s.message.startsWith("Reconstructed seed") || s instanceof Error && s.message.startsWith("Invalid expectedPublicKey") || s instanceof Error && s.message.startsWith("Reconstructed seed does not match") ? s : new Error("Failed to reconstruct seed from shares");
  }
}
function At(e) {
  return Array.from(e).map((t) => t.toString(16).padStart(2, "0")).join("");
}
function Ee(e) {
  if (!/^[0-9a-fA-F]*$/.test(e))
    throw new Error("Invalid hex string: contains non-hex characters");
  if (e.length % 2 !== 0)
    throw new Error(`Invalid hex string: length ${e.length} is odd (must be even)`);
  const t = new Uint8Array(e.length / 2);
  for (let n = 0; n < t.length; n++)
    t[n] = parseInt(e.substr(n * 2, 2), 16);
  return t;
}
function yt(e) {
  const t = e.length % 2 !== 0, n = t ? "0" + e : e, o = Ee(n), r = new Uint8Array(1 + o.length);
  return r[0] = t ? 1 : 0, r.set(o, 1), r;
}
function te(e) {
  const t = e[0];
  if (t === 0 || t === 1) {
    const o = t === 1, r = e.subarray(1), s = At(r), c = o ? s.substring(1) : s;
    if (/^[0-9a-f]/.test(c))
      return c;
  }
  const n = At(e);
  return n.startsWith("0") && !n.startsWith("00") ? n.substring(1) : n;
}
export {
  sr as a,
  Ct as b,
  Pn as c,
  ur as d,
  _e as e,
  cr as g,
  fr as p,
  ar as s
};
