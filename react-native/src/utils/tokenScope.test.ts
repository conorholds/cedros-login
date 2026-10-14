import { describe, expect, it } from "vitest";
import type { CedrosLoginConfig } from "../types";
import {
  canonicalServerIdentity,
  providerTokenStorageKey,
  sha256Hex,
} from "./tokenScope";

describe("provider token scope", () => {
  it("matches the SHA-256 standard vector", () => {
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("canonicalizes equivalent server bases without retaining credentials", () => {
    expect(
      canonicalServerIdentity(
        "HTTPS://user:secret@AUTH.Example.com:443/api/?x=1#part",
      ),
    ).toBe("https://auth.example.com/api");
  });

  it("uses stable distinct non-disclosing keys per server and service", () => {
    const base = {
      serverUrl: "https://auth.example.com/",
      features: { email: true },
    } as CedrosLoginConfig;
    const equivalent = { ...base, serverUrl: "https://AUTH.example.com:443" };
    const otherServer = { ...base, serverUrl: "https://other.example.com" };
    const otherService = {
      ...base,
      secureStorage: { service: "tenant-specific" },
    };

    expect(providerTokenStorageKey(base)).toBe(
      providerTokenStorageKey(equivalent),
    );
    expect(providerTokenStorageKey(base)).not.toBe(
      providerTokenStorageKey(otherServer),
    );
    expect(providerTokenStorageKey(base)).not.toBe(
      providerTokenStorageKey(otherService),
    );
    expect(providerTokenStorageKey(base)).not.toContain("auth.example.com");
  });
});
