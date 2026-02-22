const e = ["https:"], n = ["javascript:", "data:", "vbscript:", "file:"];
function s(o) {
  if (!o || typeof o != "string")
    return;
  const t = o.trim();
  if (!t)
    return;
  const i = t.toLowerCase();
  for (const r of n)
    if (i.startsWith(r))
      return;
  try {
    const r = new URL(t);
    return e.includes(r.protocol) ? t : void 0;
  } catch {
    return;
  }
}
function c(o) {
  if (!o || typeof o != "string")
    return;
  const t = o.trim();
  if (!t)
    return;
  const i = t.toLowerCase();
  for (const r of n)
    if (i.startsWith(r))
      return;
  try {
    const r = new URL(t);
    return r.protocol !== "https:" && r.protocol !== "http:" ? void 0 : t;
  } catch {
    return;
  }
}
export {
  s as a,
  c as s
};
