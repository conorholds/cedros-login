import { jsxs as l, jsx as n } from "react/jsx-runtime";
import { useState as p, useEffect as R, useMemo as q, useCallback as u } from "react";
import { b as G } from "./EmailRegisterForm-DrtZJXIS.js";
function L() {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
function O(e) {
  if (!e) return [];
  try {
    const o = JSON.parse(e);
    return Array.isArray(o) ? o : [];
  } catch {
    return [];
  }
}
function W(e) {
  switch (e) {
    case "nft_collection":
      return "NFT Collection";
    case "fungible_token":
      return "Fungible Token";
    case "any_nft":
      return "Any NFT";
  }
}
function j(e) {
  switch (e) {
    case "all":
      return "All";
    case "deposits":
      return "Deposits";
    case "withdrawals":
      return "Withdrawals";
  }
}
const Q = {
  name: "",
  ruleType: "nft_collection",
  collectionAddress: "",
  mintAddress: "",
  minQuantity: "",
  minAmount: "",
  enforcement: "all"
};
function J(e) {
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
function P(e, o) {
  return {
    id: o,
    name: e.name.trim(),
    ruleType: e.ruleType,
    collectionAddress: e.ruleType === "nft_collection" && e.collectionAddress.trim() || void 0,
    mintAddress: e.ruleType === "fungible_token" && e.mintAddress.trim() || void 0,
    minQuantity: e.ruleType !== "fungible_token" && e.minQuantity ? parseInt(e.minQuantity, 10) : void 0,
    minAmount: e.ruleType === "fungible_token" && e.minAmount.trim() || void 0,
    enforcement: e.enforcement
  };
}
function H({ className: e = "" }) {
  const { fetchSettings: o, updateSettings: d, getValue: b, isLoading: a, error: y } = G(), [s, f] = p([]), [c, v] = p(null), [m, i] = p(!1), [N, k] = p(Q), [_, h] = p(null), [T, w] = p(!1);
  R(() => {
    o();
  }, [o]);
  const F = b("token_gating_rules"), C = q(() => O(F), [F]);
  R(() => {
    f(C);
  }, [C]);
  const A = u(
    async (t) => {
      w(!0), h(null);
      try {
        await d([{ key: "token_gating_rules", value: JSON.stringify(t) }]), f(t);
      } catch (r) {
        h(r instanceof Error ? r.message : "Failed to save rules");
      } finally {
        w(!1);
      }
    },
    [d]
  ), E = u(() => {
    v(null), k(Q), h(null), i(!0);
  }, []), M = u((t) => {
    v(t.id), k(J(t)), h(null), i(!0);
  }, []), x = u(
    (t) => {
      const r = s.filter((g) => g.id !== t);
      A(r);
    },
    [s, A]
  ), D = u(() => {
    i(!1), h(null);
  }, []), I = u(async () => {
    if (!N.name.trim()) {
      h("Rule name is required.");
      return;
    }
    const t = c ?? L(), r = P(N, t), g = c ? s.map((S) => S.id === c ? r : S) : [...s, r];
    await A(g), _ || i(!1);
  }, [N, c, s, A, _]), $ = u((t, r) => {
    k((g) => ({ ...g, [t]: r }));
  }, []);
  return a && s.length === 0 ? /* @__PURE__ */ l("div", { className: `cedros-admin-token-gate ${e} cedros-admin-token-gate--loading`, children: [
    /* @__PURE__ */ n("span", { className: "cedros-admin-loading-indicator" }),
    /* @__PURE__ */ n("span", { className: "cedros-admin-loading-text", children: "Loading token gate rules..." })
  ] }) : y && s.length === 0 ? /* @__PURE__ */ l("div", { className: `cedros-admin-token-gate ${e} cedros-admin-token-gate--error`, children: [
    /* @__PURE__ */ n("p", { className: "cedros-admin-error", children: y.message }),
    /* @__PURE__ */ n("button", { type: "button", className: "cedros-button cedros-button-outline cedros-button-sm", onClick: o, children: "Retry" })
  ] }) : /* @__PURE__ */ l("div", { className: `cedros-admin-token-gate ${e}`, children: [
    /* @__PURE__ */ l("div", { className: "cedros-admin-token-gate__header", children: [
      /* @__PURE__ */ n("h2", { className: "cedros-admin-token-gate__title", children: "Token Gate Rules" }),
      /* @__PURE__ */ n(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: E,
          disabled: m,
          children: "Add Rule"
        }
      )
    ] }),
    m && /* @__PURE__ */ n(
      V,
      {
        form: N,
        isNew: c === null,
        isSaving: T,
        saveError: _,
        onFieldChange: $,
        onSave: I,
        onCancel: D
      }
    ),
    s.length === 0 && !m ? /* @__PURE__ */ n("div", { className: "cedros-admin-empty-message", children: "No token gate rules configured." }) : /* @__PURE__ */ l(
      "div",
      {
        className: "cedros-admin-list-table",
        role: "table",
        "aria-label": "Token gate rules",
        children: [
          /* @__PURE__ */ l("div", { className: "cedros-admin-list-thead", role: "row", children: [
            /* @__PURE__ */ n("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Name" }),
            /* @__PURE__ */ n("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Type" }),
            /* @__PURE__ */ n("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Address / Mint" }),
            /* @__PURE__ */ n("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Min Qty / Amount" }),
            /* @__PURE__ */ n("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Enforcement" }),
            /* @__PURE__ */ n("div", { className: "cedros-admin-list-th", role: "columnheader", children: "Actions" })
          ] }),
          s.map((t) => /* @__PURE__ */ l("div", { className: "cedros-admin-list-row", role: "row", children: [
            /* @__PURE__ */ n("div", { className: "cedros-admin-list-td", role: "cell", children: t.name }),
            /* @__PURE__ */ n("div", { className: "cedros-admin-list-td", role: "cell", children: W(t.ruleType) }),
            /* @__PURE__ */ n("div", { className: "cedros-admin-list-td cedros-admin-list-td-mono", role: "cell", children: t.collectionAddress || t.mintAddress || "—" }),
            /* @__PURE__ */ n("div", { className: "cedros-admin-list-td", role: "cell", children: t.minQuantity !== void 0 ? t.minQuantity : t.minAmount ?? "—" }),
            /* @__PURE__ */ n("div", { className: "cedros-admin-list-td", role: "cell", children: j(t.enforcement) }),
            /* @__PURE__ */ l("div", { className: "cedros-admin-list-td cedros-admin-list-td-actions", role: "cell", children: [
              /* @__PURE__ */ n(
                "button",
                {
                  type: "button",
                  className: "cedros-button cedros-button-outline cedros-button-sm",
                  onClick: () => M(t),
                  disabled: m,
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ n(
                "button",
                {
                  type: "button",
                  className: "cedros-button cedros-button-danger cedros-button-sm",
                  onClick: () => x(t.id),
                  disabled: T || m,
                  children: "Delete"
                }
              )
            ] })
          ] }, t.id))
        ]
      }
    )
  ] });
}
function V({ form: e, isNew: o, isSaving: d, saveError: b, onFieldChange: a, onSave: y, onCancel: s }) {
  const f = e.ruleType === "nft_collection", c = e.ruleType === "fungible_token", v = e.ruleType !== "fungible_token", m = e.ruleType === "fungible_token";
  return /* @__PURE__ */ l("div", { className: "cedros-admin-token-gate__form", role: "region", "aria-label": o ? "Add rule" : "Edit rule", children: [
    /* @__PURE__ */ n("h3", { className: "cedros-admin-token-gate__form-title", children: o ? "Add Rule" : "Edit Rule" }),
    /* @__PURE__ */ l("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ n("label", { className: "cedros-admin-form-label", htmlFor: "tg-name", children: "Name" }),
      /* @__PURE__ */ n(
        "input",
        {
          id: "tg-name",
          type: "text",
          className: "cedros-admin-form-input",
          value: e.name,
          onChange: (i) => a("name", i.target.value),
          placeholder: "e.g. Whale Gate"
        }
      )
    ] }),
    /* @__PURE__ */ l("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ n("label", { className: "cedros-admin-form-label", htmlFor: "tg-type", children: "Type" }),
      /* @__PURE__ */ l(
        "select",
        {
          id: "tg-type",
          className: "cedros-admin-form-select",
          value: e.ruleType,
          onChange: (i) => a("ruleType", i.target.value),
          children: [
            /* @__PURE__ */ n("option", { value: "nft_collection", children: "NFT Collection" }),
            /* @__PURE__ */ n("option", { value: "fungible_token", children: "Fungible Token" }),
            /* @__PURE__ */ n("option", { value: "any_nft", children: "Any NFT" })
          ]
        }
      )
    ] }),
    f && /* @__PURE__ */ l("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ n("label", { className: "cedros-admin-form-label", htmlFor: "tg-collection", children: "Collection Address" }),
      /* @__PURE__ */ n(
        "input",
        {
          id: "tg-collection",
          type: "text",
          className: "cedros-admin-form-input cedros-admin-form-input--mono",
          value: e.collectionAddress,
          onChange: (i) => a("collectionAddress", i.target.value),
          placeholder: "Solana collection mint address"
        }
      )
    ] }),
    c && /* @__PURE__ */ l("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ n("label", { className: "cedros-admin-form-label", htmlFor: "tg-mint", children: "Mint Address" }),
      /* @__PURE__ */ n(
        "input",
        {
          id: "tg-mint",
          type: "text",
          className: "cedros-admin-form-input cedros-admin-form-input--mono",
          value: e.mintAddress,
          onChange: (i) => a("mintAddress", i.target.value),
          placeholder: "SPL token mint address"
        }
      )
    ] }),
    v && /* @__PURE__ */ l("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ n("label", { className: "cedros-admin-form-label", htmlFor: "tg-minqty", children: "Min Quantity" }),
      /* @__PURE__ */ n(
        "input",
        {
          id: "tg-minqty",
          type: "number",
          min: "1",
          className: "cedros-admin-form-input",
          value: e.minQuantity,
          onChange: (i) => a("minQuantity", i.target.value),
          placeholder: "1"
        }
      )
    ] }),
    m && /* @__PURE__ */ l("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ n("label", { className: "cedros-admin-form-label", htmlFor: "tg-minamount", children: "Min Amount" }),
      /* @__PURE__ */ n(
        "input",
        {
          id: "tg-minamount",
          type: "text",
          className: "cedros-admin-form-input",
          value: e.minAmount,
          onChange: (i) => a("minAmount", i.target.value),
          placeholder: "e.g. 1000000 (raw units)"
        }
      )
    ] }),
    /* @__PURE__ */ l("div", { className: "cedros-admin-form-row", children: [
      /* @__PURE__ */ n("label", { className: "cedros-admin-form-label", htmlFor: "tg-enforcement", children: "Enforcement" }),
      /* @__PURE__ */ l(
        "select",
        {
          id: "tg-enforcement",
          className: "cedros-admin-form-select",
          value: e.enforcement,
          onChange: (i) => a("enforcement", i.target.value),
          children: [
            /* @__PURE__ */ n("option", { value: "all", children: "All" }),
            /* @__PURE__ */ n("option", { value: "deposits", children: "Deposits" }),
            /* @__PURE__ */ n("option", { value: "withdrawals", children: "Withdrawals" })
          ]
        }
      )
    ] }),
    b && /* @__PURE__ */ n("p", { className: "cedros-admin-error", children: b }),
    /* @__PURE__ */ l("div", { className: "cedros-admin-token-gate__form-actions", children: [
      /* @__PURE__ */ n(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-primary cedros-button-sm",
          onClick: y,
          disabled: d,
          "aria-busy": d,
          children: d ? "Saving..." : "Save Rule"
        }
      ),
      /* @__PURE__ */ n(
        "button",
        {
          type: "button",
          className: "cedros-button cedros-button-outline cedros-button-sm",
          onClick: s,
          disabled: d,
          children: "Cancel"
        }
      )
    ] })
  ] });
}
export {
  H as TokenGateSettings
};
