import { describe, expect, it, vi } from "vitest";

vi.mock("./context", () => ({
  useCedrosLogin: () => {
    throw new Error("useCedrosLogin should not be called by pure mapper tests");
  },
}));

vi.mock("./services/api", () => ({
  getAuthApi: () => {
    throw new Error("getAuthApi should not be called by pure mapper tests");
  },
}));

import {
  authUserToShopCustomerAccount,
  authUserToShopCustomerInfo,
  createLoginOwnedShopProfileUpdate,
} from "./shopCustomerAccount";
import type { AuthUser } from "./types";

const USER: AuthUser = {
  id: "user-1",
  email: "shopper@example.com",
  name: "Ada Shopper",
  picture: "https://assets.example.com/avatar.png",
  authMethods: ["email"],
  emailVerified: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

describe("shop customer account bindings", () => {
  it("maps a signed-in Login user to Shop customer context and account profile", () => {
    expect(authUserToShopCustomerInfo(USER)).toEqual({
      id: "user-1",
      email: "shopper@example.com",
      name: "Ada Shopper",
      isSignedIn: true,
    });

    expect(authUserToShopCustomerAccount(USER)).toEqual({
      profile: {
        id: "user-1",
        email: "shopper@example.com",
        name: "Ada Shopper",
        avatarUrl: "https://assets.example.com/avatar.png",
      },
      addresses: [],
    });
  });

  it("fails closed for signed-out customer context", () => {
    expect(authUserToShopCustomerInfo(null)).toEqual({ isSignedIn: false });
  });

  it("reduces Shop profile updates to Login-owned fields", () => {
    expect(
      createLoginOwnedShopProfileUpdate({ name: "  Ada Lovelace  " }, USER),
    ).toEqual({
      name: "Ada Lovelace",
    });
    expect(
      createLoginOwnedShopProfileUpdate(
        { email: "SHOPPER@example.com", name: "Ada Shopper" },
        USER,
      ),
    ).toBeNull();
  });

  it("rejects fields that Login does not own as editable profile data", () => {
    expect(() =>
      createLoginOwnedShopProfileUpdate(
        { email: "new@example.com", phone: "555-0100", marketingOptIn: true },
        USER,
      ),
    ).toThrow("email, phone, marketingOptIn");
  });
});
