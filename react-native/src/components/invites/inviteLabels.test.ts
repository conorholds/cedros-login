import { describe, expect, it } from "vitest";
import { getInviteTargetLabel } from "./inviteLabels";

describe("getInviteTargetLabel", () => {
  it("prefers email invites", () => {
    expect(
      getInviteTargetLabel({
        id: "invite-1",
        email: "test@example.com",
      }),
    ).toBe("test@example.com");
  });

  it("falls back to wallet invites", () => {
    expect(
      getInviteTargetLabel({
        id: "invite-1",
        walletAddress: "So11111111111111111111111111111111111111112",
      }),
    ).toBe("So11111111111111111111111111111111111111112");
  });
});
