import { beforeEach, describe, expect, it, vi } from "vitest";

const mockForgotPassword = vi.fn();

vi.mock("../services/api", () => ({
  getAuthApi: () => ({
    forgotPassword: mockForgotPassword,
  }),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: (initial: unknown) => [initial, vi.fn()],
    useCallback: (fn: (...args: unknown[]) => unknown) => fn,
  };
});

import {
  useForgotPassword,
  type UseForgotPasswordReturn,
} from "./useForgotPassword";

describe("useForgotPassword", () => {
  let hook: UseForgotPasswordReturn;

  beforeEach(() => {
    mockForgotPassword.mockReset();
    hook = useForgotPassword();
  });

  it("calls the auth API with the normalized email", async () => {
    mockForgotPassword.mockResolvedValue(undefined);

    await hook.forgotPassword("  test@example.com  ");

    expect(mockForgotPassword).toHaveBeenCalledWith("test@example.com");
  });

  it("rejects invalid email without calling the auth API", async () => {
    await expect(hook.forgotPassword("invalid-email")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Please enter a valid email address",
    });

    expect(mockForgotPassword).not.toHaveBeenCalled();
  });

  it("rethrows API failures after recording the error state", async () => {
    const error = new Error("Rate limited");
    mockForgotPassword.mockRejectedValue(error);

    await expect(hook.forgotPassword("test@example.com")).rejects.toBe(error);
    expect(mockForgotPassword).toHaveBeenCalledWith("test@example.com");
  });
});
