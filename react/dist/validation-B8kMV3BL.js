const c = /[!@#$%^&*()_+\-=[\]{}|;':",./<>?`~\\]/;
function h(e) {
  const s = {}, n = e.length >= 10, t = /[A-Z]/.test(e), a = /[a-z]/.test(e), i = /\d/.test(e), f = c.test(e);
  let r = 0;
  n ? r++ : s.length = "At least 10 characters", t ? r++ : s.uppercase = "At least 1 uppercase letter", a ? r++ : s.lowercase = "At least 1 lowercase letter", i ? r++ : s.number = "At least 1 number", f ? r++ : s.special = "At least 1 special character (@$!%*?&#^())";
  let l;
  return r <= 2 ? l = "weak" : r === 3 ? l = "fair" : r === 4 ? l = "good" : l = "strong", {
    isValid: Object.keys(s).length === 0,
    errors: s,
    strength: l
  };
}
const o = /* @__PURE__ */ new Set([
  "con",
  "cmo",
  "ocm",
  "cm",
  "vom",
  "xom",
  "cpm",
  "clm",
  "ney",
  "met",
  "bet",
  "nrt",
  "ogr",
  "rog",
  "prg",
  "irg",
  "edi",
  "rdu"
]);
function g(e) {
  if (!e || typeof e != "string" || e.length > 254 || e.includes(" "))
    return !1;
  const s = e.split("@");
  if (s.length !== 2)
    return !1;
  const [n, t] = s;
  if (!n || n.length > 64 || n.startsWith(".") || n.endsWith(".") || !t || t.length > 253 || !t.includes(".") || t.startsWith(".") || t.endsWith(".") || t.startsWith("-") || t.endsWith("-"))
    return !1;
  for (const i of t.split("."))
    if (i.startsWith("-") || i.endsWith("-"))
      return !1;
  const a = t.split(".").pop();
  return !(!a || a.length < 2 || !/^[a-zA-Z]+$/.test(a) || o.has(a.toLowerCase()) || !/^[a-zA-Z0-9.-]+$/.test(t) || /[\x00-\x1f\x7f"(),;:<>[\]\\]/.test(n));
}
const u = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
function A(e) {
  return e.length < 43 || e.length > 44 ? !1 : u.test(e);
}
export {
  A as a,
  g as b,
  h as v
};
